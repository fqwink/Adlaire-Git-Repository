import type { AppConfig } from "./config.ts";
import { DatabaseGateway } from "./database/gateway.ts";
import { SqliteCliDriver } from "./database/sqlite_cli_driver.ts";
import { GitService } from "./git/git_service.ts";
import { jsonResponse, notFound, readJson, textResponse } from "./http/responses.ts";
import { RepositoryRepository } from "./repositories/repository_repository.ts";
import { RepositoryService } from "./services/repository_service.ts";

export interface App {
  readonly fetch: (request: Request) => Promise<Response>;
}

export async function createApp(config: AppConfig): Promise<App> {
  await Deno.mkdir(config.dataDir, { recursive: true });
  await Deno.mkdir(config.repositoryRoot, { recursive: true });

  const database = new DatabaseGateway(new SqliteCliDriver(config.database.url));
  await database.initialize();

  const repositoryRepository = new RepositoryRepository(database);
  const repositoryService = new RepositoryService(
    repositoryRepository,
    new GitService(config.repositoryRoot)
  );

  return {
    fetch: (request: Request) => handle(request, repositoryService)
  };
}

async function handle(request: Request, repositories: RepositoryService): Promise<Response> {
  try {
    return await route(request, repositories);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error(error);
    return jsonResponse({ error: "internal_server_error" }, 500);
  }
}

async function route(request: Request, repositories: RepositoryService): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/health") {
    return jsonResponse({ status: "ok", service: "adlaire-git-repository" });
  }

  if (request.method === "GET" && url.pathname === "/") {
    return textResponse(renderHome(), "text/html; charset=utf-8");
  }

  if (request.method === "GET" && url.pathname === "/api/repositories") {
    return jsonResponse({ repositories: await repositories.listRepositories() });
  }

  if (request.method === "POST" && url.pathname === "/api/repositories") {
    const body = await readJson(request);
    const created = await repositories.createRepository({
      owner: readRequiredString(body, "owner"),
      name: readRequiredString(body, "name"),
      visibility: readVisibility(body["visibility"])
    });
    return jsonResponse({ repository: created }, 201);
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

function renderHome(): string {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Adlaire Git Repository</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #1f2937; }
    main { max-width: 760px; }
    code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 4px; }
  </style>
</head>
<body>
  <main>
    <h1>Adlaire Git Repository</h1>
    <p>Phase 1 foundation is running.</p>
    <p>Health: <code>/health</code></p>
    <p>Repositories API: <code>/api/repositories</code></p>
  </main>
</body>
</html>`;
}
