import type { AppConfig } from "./config.ts";
import { DatabaseGateway } from "./database/gateway.ts";
import { SqliteCliDriver } from "./database/sqlite_cli_driver.ts";
import { GitHttpBackend, isGitWriteRequest } from "./git/http_backend.ts";
import { GitService } from "./git/git_service.ts";
import { jsonResponse, notFound, readJson, textResponse } from "./http/responses.ts";
import { AuditLogRepository } from "./repositories/audit_log_repository.ts";
import { RepositoryRepository } from "./repositories/repository_repository.ts";
import { UserRepository } from "./repositories/user_repository.ts";
import { AuditService } from "./services/audit_service.ts";
import { AuthService } from "./services/auth_service.ts";
import { RepositoryService } from "./services/repository_service.ts";
import type { Principal } from "./domain/user.ts";

export interface App {
  readonly fetch: (request: Request) => Promise<Response>;
}

export async function createApp(config: AppConfig): Promise<App> {
  await Deno.mkdir(config.dataDir, { recursive: true });
  await Deno.mkdir(config.repositoryRoot, { recursive: true });

  const database = new DatabaseGateway(new SqliteCliDriver(config.database.url));
  await database.initialize();

  const auditService = new AuditService(new AuditLogRepository(database));
  const authService = new AuthService(new UserRepository(database), auditService);
  const repositoryRepository = new RepositoryRepository(database);
  const gitHttp = new GitHttpBackend(config.repositoryRoot);
  const repositoryService = new RepositoryService(
    repositoryRepository,
    new GitService(config.repositoryRoot),
    auditService
  );

  return {
    fetch: (request: Request) => handle(request, authService, repositoryService, gitHttp)
  };
}

async function handle(
  request: Request,
  auth: AuthService,
  repositories: RepositoryService,
  gitHttp: GitHttpBackend
): Promise<Response> {
  try {
    return await route(request, auth, repositories, gitHttp);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error(error);
    return jsonResponse({ error: "internal_server_error" }, 500);
  }
}

async function route(
  request: Request,
  auth: AuthService,
  repositories: RepositoryService,
  gitHttp: GitHttpBackend
): Promise<Response> {
  const url = new URL(request.url);
  const actor = await authenticateRequest(request, auth);

  if (request.method === "GET" && url.pathname === "/health") {
    return jsonResponse({ status: "ok", service: "adlaire-git-repository" });
  }

  if (request.method === "GET" && url.pathname === "/") {
    return textResponse(renderHome(), "text/html; charset=utf-8");
  }

  const gitRoute = matchGitRoute(url.pathname);
  if (gitRoute !== null) {
    if (isGitWriteRequest(request, gitRoute.gitPath)) {
      await repositories.requireWritableRepository(gitRoute.owner, gitRoute.name, requireAuthenticated(actor));
    } else {
      await repositories.requireVisibleRepository(gitRoute.owner, gitRoute.name, actor);
    }

    return await gitHttp.handle({
      request,
      owner: gitRoute.owner,
      name: gitRoute.name,
      gitPath: gitRoute.gitPath,
      actor
    });
  }

  if (request.method === "POST" && url.pathname === "/api/users") {
    const body = await readJson(request);
    const user = await auth.register({
      username: readRequiredString(body, "username"),
      password: readRequiredString(body, "password"),
      role: readRole(body["role"])
    });
    return jsonResponse({ user }, 201);
  }

  if (request.method === "POST" && url.pathname === "/api/tokens") {
    const body = await readJson(request);
    const token = await auth.createApiToken({
      username: readRequiredString(body, "username"),
      password: readRequiredString(body, "password"),
      label: readRequiredString(body, "label")
    });
    return jsonResponse(token, 201);
  }

  if (request.method === "GET" && url.pathname === "/api/ssh-keys") {
    return jsonResponse({ sshKeys: await auth.listSshKeys(requireAuthenticated(actor)) });
  }

  if (request.method === "POST" && url.pathname === "/api/ssh-keys") {
    const body = await readJson(request);
    const sshKey = await auth.addSshKey({
      principal: requireAuthenticated(actor),
      label: readRequiredString(body, "label"),
      publicKey: readRequiredString(body, "publicKey")
    });
    return jsonResponse({ sshKey }, 201);
  }

  const sshKeyRoute = matchSshKeyRoute(url.pathname);
  if (request.method === "DELETE" && sshKeyRoute !== null) {
    await auth.deleteSshKey(requireAuthenticated(actor), sshKeyRoute.id);
    return jsonResponse({ deleted: true });
  }

  if (request.method === "GET" && url.pathname === "/api/repositories") {
    return jsonResponse({ repositories: await repositories.listRepositories(actor) });
  }

  if (request.method === "POST" && url.pathname === "/api/repositories") {
    const principal = requireAuthenticated(actor);
    const body = await readJson(request);
    const created = await repositories.createRepository({
      owner: readRequiredString(body, "owner"),
      name: readRequiredString(body, "name"),
      visibility: readVisibility(body["visibility"])
    }, principal);
    return jsonResponse({ repository: created }, 201);
  }

  const repositoryRoute = matchRepositoryRoute(url.pathname);
  if (repositoryRoute !== null) {
    if (request.method === "GET" && repositoryRoute.suffix === "") {
      const repository = await repositories.getRepository(repositoryRoute.owner, repositoryRoute.name, actor);
      return jsonResponse({ repository });
    }

    if (request.method === "PATCH" && repositoryRoute.suffix === "") {
      const body = await readJson(request);
      const repository = await repositories.updateVisibility(
        repositoryRoute.owner,
        repositoryRoute.name,
        readVisibility(body["visibility"]),
        requireAuthenticated(actor)
      );
      return jsonResponse({ repository });
    }

    if (request.method === "DELETE" && repositoryRoute.suffix === "") {
      await repositories.deleteRepository(repositoryRoute.owner, repositoryRoute.name, requireAuthenticated(actor));
      return jsonResponse({ deleted: true });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "branches") {
      const repository = await repositories.getRepository(repositoryRoute.owner, repositoryRoute.name, actor);
      return jsonResponse({ branches: repository.branches });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "tags") {
      const repository = await repositories.getRepository(repositoryRoute.owner, repositoryRoute.name, actor);
      return jsonResponse({ tags: repository.tags });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "readme") {
      const repository = await repositories.getRepository(repositoryRoute.owner, repositoryRoute.name, actor);
      if (repository.readme === null) {
        return notFound();
      }
      return textResponse(repository.readme, "text/markdown; charset=utf-8");
    }

    if (request.method === "GET" && repositoryRoute.suffix === "commits") {
      const commits = await repositories.listCommits(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
        url.searchParams.get("ref") ?? undefined
      );
      return jsonResponse({ commits });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "tree") {
      const tree = await repositories.listTree(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
        url.searchParams.get("ref") ?? undefined,
        url.searchParams.get("path") ?? undefined
      );
      return jsonResponse({ tree });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "blob") {
      const path = url.searchParams.get("path");
      if (path === null) {
        throw new Response("path is required.", { status: 400 });
      }
      const content = await repositories.readFile(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
        url.searchParams.get("ref") ?? undefined,
        path
      );
      if (content === null) {
        return notFound();
      }
      return textResponse(content, "text/plain; charset=utf-8");
    }
  }

  return notFound();
}

function readRequiredString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Response(`${key} is required.`, { status: 400 });
  }
  return value;
}

function readVisibility(value: unknown): "public" | "private" {
  if (value === undefined) {
    return "private";
  }
  if (value === "public" || value === "private") {
    return value;
  }
  throw new Response("visibility must be public or private.", { status: 400 });
}

function readRole(value: unknown): "admin" | "developer" | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === "admin" || value === "developer") {
    return value;
  }
  throw new Response("role must be admin or developer.", { status: 400 });
}

async function authenticateRequest(request: Request, auth: AuthService): Promise<Principal | null> {
  const authorization = request.headers.get("authorization");
  if (authorization === null || authorization.trim() === "") {
    return null;
  }

  if (authorization.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    if (token === "") {
      throw new Response("bearer token is required.", { status: 401 });
    }
    const principal = await auth.authenticateToken(token);
    if (principal === null) {
      throw new Response("invalid bearer token.", { status: 401 });
    }
    return principal;
  }

  if (authorization.startsWith("Basic ")) {
    const decoded = decodeBasicAuthorization(authorization.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (separator < 0) {
      throw new Response("invalid basic authorization.", { status: 401 });
    }
    const principal = await auth.authenticateBasic(decoded.slice(0, separator), decoded.slice(separator + 1));
    if (principal === null) {
      throw new Response("invalid basic credentials.", { status: 401 });
    }
    return principal;
  }

  throw new Response("unsupported authorization scheme.", { status: 401 });
}

function decodeBasicAuthorization(value: string): string {
  try {
    return atob(value);
  } catch {
    throw new Response("invalid basic authorization.", { status: 401 });
  }
}

function requireAuthenticated(actor: Principal | null): Principal {
  if (actor === null) {
    throw new Response("authentication required.", { status: 401 });
  }
  return actor;
}

function matchRepositoryRoute(pathname: string): { owner: string; name: string; suffix: string } | null {
  const match = pathname.match(/^\/api\/repositories\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/);
  if (match === null) {
    return null;
  }
  return {
    owner: decodeURIComponent(match[1]),
    name: decodeURIComponent(match[2]),
    suffix: match[3] === undefined ? "" : decodeURIComponent(match[3])
  };
}

function matchGitRoute(pathname: string): { owner: string; name: string; gitPath: string } | null {
  const match = pathname.match(/^\/git\/([^/]+)\/([^/]+)\.git(\/.*)?$/);
  if (match === null) {
    return null;
  }
  return {
    owner: decodeURIComponent(match[1]),
    name: decodeURIComponent(match[2]),
    gitPath: match[3] ?? ""
  };
}

function matchSshKeyRoute(pathname: string): { id: string } | null {
  const match = pathname.match(/^\/api\/ssh-keys\/([^/]+)$/);
  return match === null ? null : { id: decodeURIComponent(match[1]) };
}

function renderHome(): string {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Adlaire Git Repository</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; color: #1f2937; background: #f8fafc; }
    main { max-width: 1040px; margin: 0 auto; padding: 2rem; }
    section { margin-top: 1.5rem; padding: 1rem 0; border-top: 1px solid #d1d5db; }
    label { display: block; margin-top: 0.75rem; font-weight: 600; }
    input, select, button { font: inherit; padding: 0.55rem 0.65rem; margin-top: 0.25rem; }
    input, select { width: min(100%, 420px); border: 1px solid #9ca3af; border-radius: 6px; background: white; }
    button { border: 1px solid #1f2937; background: #1f2937; color: white; border-radius: 6px; cursor: pointer; }
    ul { padding-left: 1.25rem; }
    code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 4px; }
    .status { min-height: 1.5rem; color: #374151; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
  </style>
</head>
<body>
  <main>
    <h1>Adlaire Git Repository</h1>
    <p>Phase 1</p>
    <div class="status" id="status"></div>
    <section class="grid">
      <form id="register-form">
        <h2>ユーザー登録</h2>
        <label>Username <input name="username" autocomplete="username" required></label>
        <label>Password <input name="password" type="password" autocomplete="new-password" required></label>
        <button type="submit">登録</button>
      </form>
      <form id="token-form">
        <h2>API token</h2>
        <label>Username <input name="username" autocomplete="username" required></label>
        <label>Password <input name="password" type="password" autocomplete="current-password" required></label>
        <label>Label <input name="label" value="browser" required></label>
        <button type="submit">発行</button>
      </form>
      <form id="repo-form">
        <h2>Repository作成</h2>
        <label>Owner <input name="owner" required></label>
        <label>Name <input name="name" required></label>
        <label>Visibility
          <select name="visibility">
            <option value="private">private</option>
            <option value="public">public</option>
          </select>
        </label>
        <button type="submit">作成</button>
      </form>
    </section>
    <section>
      <h2>Repositories</h2>
      <button id="refresh" type="button">更新</button>
      <ul id="repositories"></ul>
    </section>
  </main>
  <script>
    const state = { token: localStorage.getItem("adlaireToken") || "" };
    const status = document.querySelector("#status");
    const repositories = document.querySelector("#repositories");

    function setStatus(message) {
      status.textContent = message;
    }

    function headers(json = true) {
      const value = json ? { "content-type": "application/json" } : {};
      if (state.token) value.authorization = "Bearer " + state.token;
      return value;
    }

    async function request(path, options = {}) {
      const response = await fetch(path, options);
      if (!response.ok) throw new Error(await response.text());
      const contentType = response.headers.get("content-type") || "";
      return contentType.includes("application/json") ? await response.json() : await response.text();
    }

    document.querySelector("#register-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      await request("/api/users", { method: "POST", headers: headers(), body: JSON.stringify(data) });
      setStatus("ユーザーを登録しました。");
    });

    document.querySelector("#token-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const result = await request("/api/tokens", { method: "POST", headers: headers(), body: JSON.stringify(data) });
      state.token = result.token;
      localStorage.setItem("adlaireToken", state.token);
      setStatus("API tokenを保存しました。");
      await loadRepositories();
    });

    document.querySelector("#repo-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      await request("/api/repositories", { method: "POST", headers: headers(), body: JSON.stringify(data) });
      setStatus("Repositoryを作成しました。");
      await loadRepositories();
    });

    document.querySelector("#refresh").addEventListener("click", loadRepositories);

    async function loadRepositories() {
      repositories.replaceChildren();
      const result = await request("/api/repositories", { headers: headers(false) });
      for (const repo of result.repositories) {
        const item = document.createElement("li");
        const code = document.createElement("code");
        code.textContent = "/git/" + repo.owner + "/" + repo.name + ".git";
        item.append(repo.owner + "/" + repo.name + " [" + repo.visibility + "] ", code);
        repositories.append(item);
      }
    }

    loadRepositories().catch((error) => setStatus(error.message));
  </script>
</body>
</html>`;
}
