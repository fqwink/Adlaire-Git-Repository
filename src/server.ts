import type { AppConfig } from "./config.ts";
import { DatabaseGateway } from "./database/gateway.ts";
import { LibsqlDriver } from "./database/libsql_driver.ts";
import { SqliteCliDriver } from "./database/sqlite_cli_driver.ts";
import { GitHttpBackend, isGitWriteRequest } from "./git/http_backend.ts";
import { GitService } from "./git/git_service.ts";
import {
  jsonResponse,
  notFound,
  readJson,
  textResponse,
} from "./http/responses.ts";
import { AuditLogRepository } from "./repositories/audit_log_repository.ts";
import { IssueRepository } from "./repositories/issue_repository.ts";
import { OrganizationRepository } from "./repositories/organization_repository.ts";
import { Phase2Repository } from "./repositories/phase2_repository.ts";
import { Phase3Repository } from "./repositories/phase3_repository.ts";
import { RepositoryRepository } from "./repositories/repository_repository.ts";
import { UserRepository } from "./repositories/user_repository.ts";
import { AuditService } from "./services/audit_service.ts";
import { AuthService } from "./services/auth_service.ts";
import { IssueService } from "./services/issue_service.ts";
import { OrganizationService } from "./services/organization_service.ts";
import { Phase2Service } from "./services/phase2_service.ts";
import { Phase3Service } from "./services/phase3_service.ts";
import { RepositoryService } from "./services/repository_service.ts";
import {
  type IssueState,
  parseIssueNumber,
  validateIssueState,
} from "./domain/issue.ts";
import {
  validateOrganizationMemberRole,
  validateOrganizationSlug,
} from "./domain/organization.ts";
import {
  parseBoolean,
  parsePositiveNumber,
  type PullRequestState,
  type ReviewState,
  validatePullRequestState,
  validateReviewState,
  validateWebhookEvents,
} from "./domain/phase2.ts";
import { validateProjectState } from "./domain/phase3.ts";
import { type Principal, validateUsername } from "./domain/user.ts";
import { ValidationError } from "./domain/validation_error.ts";

export interface App {
  readonly fetch: (request: Request) => Promise<Response>;
}

export async function createApp(config: AppConfig): Promise<App> {
  await Deno.mkdir(config.dataDir, { recursive: true });
  await Deno.mkdir(config.repositoryRoot, { recursive: true });

  const database = new DatabaseGateway(createDatabaseDriver(config.database));
  await database.initialize();

  const auditService = new AuditService(new AuditLogRepository(database));
  const authService = new AuthService(
    new UserRepository(database),
    auditService,
  );
  const repositoryRepository = new RepositoryRepository(database);
  const organizationRepository = new OrganizationRepository(database);
  const gitHttp = new GitHttpBackend(config.repositoryRoot);
  const repositoryService = new RepositoryService(
    repositoryRepository,
    organizationRepository,
    new GitService(config.repositoryRoot),
    auditService,
  );
  const organizationService = new OrganizationService(
    organizationRepository,
    auditService,
  );
  const issueService = new IssueService(
    repositoryService,
    new IssueRepository(database),
    auditService,
  );
  const phase2Service = new Phase2Service(
    repositoryService,
    new Phase2Repository(database),
    auditService,
  );
  const phase3Service = new Phase3Service(
    new Phase3Repository(database),
    organizationService,
    repositoryService,
    auditService,
  );

  return {
    fetch: (request: Request) =>
      handle(
        request,
        authService,
        repositoryService,
        issueService,
        organizationService,
        phase2Service,
        phase3Service,
        auditService,
        gitHttp,
      ),
  };
}

async function handle(
  request: Request,
  auth: AuthService,
  repositories: RepositoryService,
  issues: IssueService,
  organizations: OrganizationService,
  phase2: Phase2Service,
  phase3: Phase3Service,
  audit: AuditService,
  gitHttp: GitHttpBackend,
): Promise<Response> {
  try {
    return await route(
      request,
      auth,
      repositories,
      issues,
      organizations,
      phase2,
      phase3,
      audit,
      gitHttp,
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    if (error instanceof ValidationError) {
      return jsonResponse(
        { error: "bad_request", message: error.message },
        400,
      );
    }
    if (isUniqueConstraintError(error)) {
      return jsonResponse({ error: "conflict" }, 409);
    }
    console.error(error);
    return jsonResponse({ error: "internal_server_error" }, 500);
  }
}

async function route(
  request: Request,
  auth: AuthService,
  repositories: RepositoryService,
  issues: IssueService,
  organizations: OrganizationService,
  phase2: Phase2Service,
  phase3: Phase3Service,
  audit: AuditService,
  gitHttp: GitHttpBackend,
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
    try {
      if (isGitWriteRequest(request, gitRoute.gitPath)) {
        await repositories.requireWritableRepository(
          gitRoute.owner,
          gitRoute.name,
          requireAuthenticated(actor),
        );
      } else {
        await repositories.requireVisibleRepository(
          gitRoute.owner,
          gitRoute.name,
          actor,
        );
      }
    } catch (error) {
      if (actor === null && error instanceof Response) {
        if (error.status === 401 || error.status === 403) {
          return gitAuthenticationRequired();
        }
      }
      throw error;
    }

    return await gitHttp.handle({
      request,
      owner: gitRoute.owner,
      name: gitRoute.name,
      gitPath: gitRoute.gitPath,
      actor,
    });
  }

  if (request.method === "POST" && url.pathname === "/api/users") {
    const body = await readJson(request);
    const username = validateUsername(readRequiredString(body, "username"));
    if (await organizations.organizationExists(username)) {
      throw new Response("username conflicts with an existing organization.", {
        status: 409,
      });
    }
    const role = readRole(body["role"]);
    const user = await auth.register({
      username,
      password: readRequiredString(body, "password"),
      role,
      allowAdminRegistration: role === "admin" && actor?.role === "admin",
    });
    return jsonResponse({ user }, 201);
  }

  if (request.method === "POST" && url.pathname === "/api/tokens") {
    const body = await readJson(request);
    const token = await auth.createApiToken({
      username: readRequiredString(body, "username"),
      password: readRequiredString(body, "password"),
      label: readRequiredString(body, "label"),
    });
    return jsonResponse(token, 201);
  }

  if (url.pathname === "/api/organizations") {
    const principal = requireAuthenticated(actor);
    if (request.method === "GET") {
      return jsonResponse({
        organizations: await organizations.listOrganizations(principal),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const organization = await organizations.createOrganization({
        slug: readRequiredString(body, "slug"),
        name: readRequiredString(body, "name"),
      }, principal);
      return jsonResponse({ organization }, 201);
    }
  }

  const organizationRoute = matchOrganizationRoute(url.pathname);
  if (organizationRoute !== null && request.method === "GET") {
    return jsonResponse(
      await organizations.getOrganization(
        organizationRoute.slug,
        requireAuthenticated(actor),
      ),
    );
  }

  const organizationMembersRoute = matchOrganizationMembersRoute(url.pathname);
  if (organizationMembersRoute !== null && request.method === "POST") {
    const body = await readJson(request);
    const member = await organizations.addMember(
      organizationMembersRoute.slug,
      {
        username: readRequiredString(body, "username"),
        role: validateOrganizationMemberRole(body["role"]),
      },
      requireAuthenticated(actor),
    );
    return jsonResponse({ member }, 201);
  }

  const organizationTeamsRoute = matchOrganizationTeamsRoute(url.pathname);
  if (organizationTeamsRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        teams: await phase3.listTeams(
          organizationTeamsRoute.slug,
          requireAuthenticated(actor),
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const team = await phase3.createTeam(
        organizationTeamsRoute.slug,
        {
          slug: readRequiredString(body, "slug"),
          name: readRequiredString(body, "name"),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ team }, 201);
    }
  }

  const teamMembersRoute = matchTeamMembersRoute(url.pathname);
  if (teamMembersRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        members: await phase3.listTeamMembers(
          teamMembersRoute.organizationSlug,
          teamMembersRoute.teamSlug,
          requireAuthenticated(actor),
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const member = await phase3.addTeamMember(
        teamMembersRoute.organizationSlug,
        teamMembersRoute.teamSlug,
        { username: readRequiredString(body, "username") },
        requireAuthenticated(actor),
      );
      return jsonResponse({ member }, 201);
    }
  }

  if (url.pathname === "/api/audit-logs" && request.method === "GET") {
    return jsonResponse({
      auditLogs: await audit.list(
        requireAuthenticated(actor),
        readLimit(url.searchParams.get("limit")),
      ),
    });
  }

  if (url.pathname === "/api/operations/status" && request.method === "GET") {
    requireAuthenticated(actor);
    return jsonResponse(phase3.operationsStatus());
  }

  if (
    url.pathname === "/api/operations/libsql-evaluation" &&
    request.method === "GET"
  ) {
    requireAuthenticated(actor);
    return jsonResponse(phase3.libsqlEvaluation());
  }

  if (url.pathname === "/api/registry/packages") {
    const principal = requireAuthenticated(actor);
    if (request.method === "GET") {
      return jsonResponse({
        packages: await phase3.listRegistryPackages(
          url.searchParams.get("scope") ?? undefined,
          principal,
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const pack = await phase3.createRegistryPackage({
        scope: readRequiredString(body, "scope"),
        name: readRequiredString(body, "name"),
        description: readOptionalString(body["description"], "description"),
      }, principal);
      return jsonResponse({ package: pack }, 201);
    }
  }

  const registryVersionsRoute = matchRegistryVersionsRoute(url.pathname);
  if (registryVersionsRoute !== null) {
    const principal = requireAuthenticated(actor);
    if (request.method === "GET") {
      return jsonResponse({
        versions: await phase3.listRegistryVersions(
          registryVersionsRoute.scope,
          registryVersionsRoute.name,
          principal,
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const version = await phase3.publishRegistryVersion(
        registryVersionsRoute.scope,
        registryVersionsRoute.name,
        {
          version: readRequiredString(body, "version"),
          modulePath: readRequiredString(body, "modulePath"),
          source: readRequiredString(body, "source"),
        },
        principal,
      );
      return jsonResponse({ version }, 201);
    }
  }

  const registryDownloadRoute = matchRegistryDownloadRoute(url.pathname);
  if (registryDownloadRoute !== null && request.method === "GET") {
    const version = await phase3.downloadRegistryVersion(
      registryDownloadRoute.scope,
      registryDownloadRoute.name,
      registryDownloadRoute.version,
      requireAuthenticated(actor),
    );
    return textResponse(version.source, "text/typescript; charset=utf-8");
  }

  if (request.method === "GET" && url.pathname === "/api/ssh-keys") {
    return jsonResponse({
      sshKeys: await auth.listSshKeys(requireAuthenticated(actor)),
    });
  }

  if (request.method === "POST" && url.pathname === "/api/ssh-keys") {
    const body = await readJson(request);
    const sshKey = await auth.addSshKey({
      principal: requireAuthenticated(actor),
      label: readRequiredString(body, "label"),
      publicKey: readRequiredString(body, "publicKey"),
    });
    return jsonResponse({ sshKey }, 201);
  }

  const sshKeyRoute = matchSshKeyRoute(url.pathname);
  if (request.method === "DELETE" && sshKeyRoute !== null) {
    await auth.deleteSshKey(requireAuthenticated(actor), sshKeyRoute.id);
    return jsonResponse({ deleted: true });
  }

  if (request.method === "GET" && url.pathname === "/api/repositories") {
    return jsonResponse({
      repositories: await repositories.listRepositories(actor),
    });
  }

  if (request.method === "POST" && url.pathname === "/api/repositories") {
    const principal = requireAuthenticated(actor);
    const body = await readJson(request);
    const created = await repositories.createRepository({
      owner: readRequiredString(body, "owner"),
      name: readRequiredString(body, "name"),
      visibility: readVisibility(body["visibility"]),
    }, principal);
    return jsonResponse({ repository: created }, 201);
  }

  const issueCollectionRoute = matchIssueCollectionRoute(url.pathname);
  if (issueCollectionRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        issues: await issues.listIssues(
          issueCollectionRoute.owner,
          issueCollectionRoute.name,
          actor,
          readIssueStateQuery(url.searchParams.get("state")),
        ),
      });
    }

    if (request.method === "POST") {
      const body = await readJson(request);
      const issue = await issues.createIssue(
        issueCollectionRoute.owner,
        issueCollectionRoute.name,
        {
          title: readRequiredString(body, "title"),
          body: readOptionalString(body["body"], "body"),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ issue }, 201);
    }
  }

  const issueRoute = matchIssueRoute(url.pathname);
  if (issueRoute !== null) {
    const number = parseIssueNumber(issueRoute.number);

    if (request.method === "GET") {
      return jsonResponse({
        issue: await issues.getIssue(
          issueRoute.owner,
          issueRoute.name,
          number,
          actor,
        ),
      });
    }

    if (request.method === "PATCH") {
      const body = await readJson(request);
      const issue = await issues.updateIssue(
        issueRoute.owner,
        issueRoute.name,
        number,
        {
          title: readOptionalString(body["title"], "title"),
          body: readOptionalString(body["body"], "body"),
          state: body["state"] === undefined
            ? undefined
            : validateIssueState(body["state"]),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ issue });
    }
  }

  const pullCollectionRoute = matchRepositoryChildRoute(url.pathname, "pulls");
  if (pullCollectionRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        pullRequests: await phase2.listPullRequests(
          pullCollectionRoute.owner,
          pullCollectionRoute.name,
          actor,
          readPullRequestStateQuery(url.searchParams.get("state")),
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const pullRequest = await phase2.createPullRequest(
        pullCollectionRoute.owner,
        pullCollectionRoute.name,
        {
          title: readRequiredString(body, "title"),
          body: readOptionalString(body["body"], "body"),
          sourceBranch: readRequiredString(body, "sourceBranch"),
          targetBranch: readRequiredString(body, "targetBranch"),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ pullRequest }, 201);
    }
  }

  const pullRoute = matchRepositoryNumberRoute(url.pathname, "pulls");
  if (pullRoute !== null) {
    const number = parsePositiveNumber(pullRoute.number, "pull request number");
    if (request.method === "GET") {
      return jsonResponse({
        pullRequest: await phase2.getPullRequest(
          pullRoute.owner,
          pullRoute.name,
          number,
          actor,
        ),
      });
    }
    if (request.method === "PATCH") {
      const body = await readJson(request);
      const pullRequest = await phase2.updatePullRequest(
        pullRoute.owner,
        pullRoute.name,
        number,
        {
          title: readOptionalString(body["title"], "title"),
          body: readOptionalString(body["body"], "body"),
          state: body["state"] === undefined
            ? undefined
            : validatePullRequestState(body["state"]),
          mergeCommitSha: body["mergeCommitSha"] === undefined
            ? undefined
            : readNullableString(body["mergeCommitSha"], "mergeCommitSha"),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ pullRequest });
    }
  }

  const reviewRoute = matchReviewRoute(url.pathname);
  if (reviewRoute !== null) {
    const number = parsePositiveNumber(
      reviewRoute.number,
      "pull request number",
    );
    if (request.method === "GET") {
      return jsonResponse({
        reviews: await phase2.listReviews(
          reviewRoute.owner,
          reviewRoute.name,
          number,
          actor,
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const review = await phase2.createReview(
        reviewRoute.owner,
        reviewRoute.name,
        number,
        {
          state: readReviewState(body["state"]),
          body: readOptionalString(body["body"], "body"),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ review }, 201);
    }
  }

  const wikiCollectionRoute = matchRepositoryChildRoute(url.pathname, "wiki");
  if (wikiCollectionRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        pages: await phase2.listWikiPages(
          wikiCollectionRoute.owner,
          wikiCollectionRoute.name,
          actor,
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const page = await phase2.upsertWikiPage(
        wikiCollectionRoute.owner,
        wikiCollectionRoute.name,
        {
          slug: readRequiredString(body, "slug"),
          title: readRequiredString(body, "title"),
          body: readRequiredString(body, "body"),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ page }, 201);
    }
  }

  const wikiRoute = matchRepositoryTextRoute(url.pathname, "wiki");
  if (wikiRoute !== null && request.method === "GET") {
    return jsonResponse({
      page: await phase2.getWikiPage(
        wikiRoute.owner,
        wikiRoute.name,
        wikiRoute.value,
        actor,
      ),
    });
  }

  const webhookCollectionRoute = matchRepositoryChildRoute(
    url.pathname,
    "webhooks",
  );
  if (webhookCollectionRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        webhooks: await phase2.listWebhooks(
          webhookCollectionRoute.owner,
          webhookCollectionRoute.name,
          requireAuthenticated(actor),
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const webhook = await phase2.createWebhook(
        webhookCollectionRoute.owner,
        webhookCollectionRoute.name,
        {
          url: readRequiredString(body, "url"),
          secret: readOptionalString(body["secret"], "secret"),
          events: body["events"],
          active: body["active"],
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ webhook }, 201);
    }
  }

  const webhookPingRoute = matchWebhookPingRoute(url.pathname);
  if (webhookPingRoute !== null && request.method === "POST") {
    return jsonResponse({
      delivery: await phase2.recordWebhookPing(
        webhookPingRoute.id,
        requireAuthenticated(actor),
      ),
    }, 202);
  }

  const webhookEventRoute = matchRepositoryChildRoute(
    url.pathname,
    "webhook-events",
  );
  if (webhookEventRoute !== null && request.method === "POST") {
    const body = await readJson(request);
    const event = validateWebhookEvents([
      readRequiredString(body, "event"),
    ])[0];
    return jsonResponse({
      deliveries: await phase2.dispatchWebhookEvent(
        webhookEventRoute.owner,
        webhookEventRoute.name,
        event,
        requireAuthenticated(actor),
      ),
    }, 202);
  }

  const releaseCollectionRoute = matchRepositoryChildRoute(
    url.pathname,
    "releases",
  );
  if (releaseCollectionRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        releases: await phase2.listReleases(
          releaseCollectionRoute.owner,
          releaseCollectionRoute.name,
          actor,
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const release = await phase2.createRelease(
        releaseCollectionRoute.owner,
        releaseCollectionRoute.name,
        {
          tagName: readRequiredString(body, "tagName"),
          title: readRequiredString(body, "title"),
          notes: readOptionalString(body["notes"], "notes"),
          draft: body["draft"] === undefined
            ? undefined
            : parseBoolean(body["draft"], false),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ release }, 201);
    }
  }

  const releaseRoute = matchRepositoryTextRoute(url.pathname, "releases");
  if (releaseRoute !== null && request.method === "GET") {
    return jsonResponse({
      release: await phase2.getRelease(
        releaseRoute.owner,
        releaseRoute.name,
        releaseRoute.value,
        actor,
      ),
    });
  }

  const repositoryRoute = matchRepositoryRoute(url.pathname);
  if (repositoryRoute !== null) {
    if (request.method === "GET" && repositoryRoute.suffix === "") {
      const repository = await repositories.getRepository(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
      );
      return jsonResponse({ repository });
    }

    if (request.method === "PATCH" && repositoryRoute.suffix === "") {
      const body = await readJson(request);
      const repository = await repositories.updateVisibility(
        repositoryRoute.owner,
        repositoryRoute.name,
        readVisibility(body["visibility"]),
        requireAuthenticated(actor),
      );
      return jsonResponse({ repository });
    }

    if (request.method === "DELETE" && repositoryRoute.suffix === "") {
      await repositories.deleteRepository(
        repositoryRoute.owner,
        repositoryRoute.name,
        requireAuthenticated(actor),
      );
      return jsonResponse({ deleted: true });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "branches") {
      const repository = await repositories.getRepository(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
      );
      return jsonResponse({ branches: repository.branches });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "tags") {
      const repository = await repositories.getRepository(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
      );
      return jsonResponse({ tags: repository.tags });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "readme") {
      const repository = await repositories.getRepository(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
      );
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
        url.searchParams.get("ref") ?? undefined,
      );
      return jsonResponse({ commits });
    }

    if (request.method === "GET" && repositoryRoute.suffix === "tree") {
      const tree = await repositories.listTree(
        repositoryRoute.owner,
        repositoryRoute.name,
        actor,
        url.searchParams.get("ref") ?? undefined,
        url.searchParams.get("path") ?? undefined,
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
        path,
      );
      if (content === null) {
        return notFound();
      }
      return textResponse(content, "text/plain; charset=utf-8");
    }
  }

  const projectCollectionRoute = matchRepositoryChildRoute(
    url.pathname,
    "projects",
  );
  if (projectCollectionRoute !== null) {
    if (request.method === "GET") {
      return jsonResponse({
        projects: await phase3.listProjects(
          projectCollectionRoute.owner,
          projectCollectionRoute.name,
          actor,
        ),
      });
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      const project = await phase3.createProject(
        projectCollectionRoute.owner,
        projectCollectionRoute.name,
        {
          title: readRequiredString(body, "title"),
          body: readOptionalString(body["body"], "body"),
        },
        requireAuthenticated(actor),
      );
      return jsonResponse({ project }, 201);
    }
  }

  const projectRoute = matchRepositoryNumberRoute(url.pathname, "projects");
  if (projectRoute !== null && request.method === "PATCH") {
    const body = await readJson(request);
    const project = await phase3.updateProject(
      projectRoute.owner,
      projectRoute.name,
      parsePositiveNumber(projectRoute.number, "project number"),
      {
        title: readOptionalString(body["title"], "title"),
        body: readOptionalString(body["body"], "body"),
        state: body["state"] === undefined
          ? undefined
          : validateProjectState(body["state"]),
      },
      requireAuthenticated(actor),
    );
    return jsonResponse({ project });
  }

  return notFound();
}

function readRequiredString(
  body: Record<string, unknown>,
  key: string,
): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Response(`${key} is required.`, { status: 400 });
  }
  return value;
}

function readOptionalString(value: unknown, key: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Response(`${key} must be a string.`, { status: 400 });
  }
  return value;
}

function readNullableString(value: unknown, key: string): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Response(`${key} must be a string or null.`, { status: 400 });
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

function readIssueStateQuery(value: string | null): IssueState | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  return validateIssueState(value);
}

function readPullRequestStateQuery(
  value: string | null,
): PullRequestState | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  return validatePullRequestState(value);
}

function readReviewState(value: unknown): ReviewState {
  if (value === undefined) {
    return "commented";
  }
  return validateReviewState(value);
}

function readLimit(value: string | null): number {
  if (value === null || value === "") {
    return 100;
  }
  return parsePositiveNumber(value, "limit");
}

async function authenticateRequest(
  request: Request,
  auth: AuthService,
): Promise<Principal | null> {
  const authorization = request.headers.get("authorization");
  if (authorization === null || authorization.trim() === "") {
    return null;
  }

  const separator = authorization.indexOf(" ");
  if (separator < 0) {
    throw new Response("unsupported authorization scheme.", { status: 401 });
  }
  const scheme = authorization.slice(0, separator).toLowerCase();
  const credentials = authorization.slice(separator + 1).trim();

  if (scheme === "bearer") {
    const token = credentials;
    if (token === "") {
      throw new Response("bearer token is required.", { status: 401 });
    }
    const principal = await auth.authenticateToken(token);
    if (principal === null) {
      throw new Response("invalid bearer token.", { status: 401 });
    }
    return principal;
  }

  if (scheme === "basic") {
    const decoded = decodeBasicAuthorization(credentials);
    const credentialSeparator = decoded.indexOf(":");
    if (credentialSeparator < 0) {
      throw new Response("invalid basic authorization.", { status: 401 });
    }
    const principal = await auth.authenticateBasic(
      decoded.slice(0, credentialSeparator),
      decoded.slice(credentialSeparator + 1),
    );
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

function gitAuthenticationRequired(): Response {
  return new Response("authentication required.", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="Adlaire Git Repository"',
      "cache-control": "no-store",
    },
  });
}

function createDatabaseDriver(config: AppConfig["database"]) {
  if (config.driver === "sqlite") {
    return new SqliteCliDriver(config.url);
  }
  return new LibsqlDriver(config.url, config.authToken);
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error &&
    (error.message.includes("UNIQUE constraint failed") ||
      error.message.includes("SQLITE_CONSTRAINT_UNIQUE"));
}

function matchRepositoryRoute(
  pathname: string,
): { owner: string; name: string; suffix: string } | null {
  const match = pathname.match(
    /^\/api\/repositories\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/,
  );
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
    suffix: match[3] === undefined ? "" : safeDecodeURIComponent(match[3]),
  };
}

function matchIssueCollectionRoute(
  pathname: string,
): { owner: string; name: string } | null {
  const match = pathname.match(
    /^\/api\/repositories\/([^/]+)\/([^/]+)\/issues$/,
  );
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
  };
}

function matchIssueRoute(
  pathname: string,
): { owner: string; name: string; number: string } | null {
  const match = pathname.match(
    /^\/api\/repositories\/([^/]+)\/([^/]+)\/issues\/([^/]+)$/,
  );
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
    number: safeDecodeURIComponent(match[3]),
  };
}

function matchRepositoryChildRoute(
  pathname: string,
  child: string,
): { owner: string; name: string } | null {
  const match = pathname.match(
    new RegExp(`^/api/repositories/([^/]+)/([^/]+)/${child}$`),
  );
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
  };
}

function matchRepositoryNumberRoute(
  pathname: string,
  child: string,
): { owner: string; name: string; number: string } | null {
  const match = pathname.match(
    new RegExp(`^/api/repositories/([^/]+)/([^/]+)/${child}/([^/]+)$`),
  );
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
    number: safeDecodeURIComponent(match[3]),
  };
}

function matchRepositoryTextRoute(
  pathname: string,
  child: string,
): { owner: string; name: string; value: string } | null {
  const match = pathname.match(
    new RegExp(`^/api/repositories/([^/]+)/([^/]+)/${child}/([^/]+)$`),
  );
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
    value: safeDecodeURIComponent(match[3]),
  };
}

function matchReviewRoute(
  pathname: string,
): { owner: string; name: string; number: string } | null {
  const match = pathname.match(
    /^\/api\/repositories\/([^/]+)\/([^/]+)\/pulls\/([^/]+)\/reviews$/,
  );
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
    number: safeDecodeURIComponent(match[3]),
  };
}

function matchWebhookPingRoute(pathname: string): { id: string } | null {
  const match = pathname.match(/^\/api\/webhooks\/([^/]+)\/ping$/);
  return match === null ? null : { id: safeDecodeURIComponent(match[1]) };
}

function matchGitRoute(
  pathname: string,
): { owner: string; name: string; gitPath: string } | null {
  const match = pathname.match(/^\/git\/([^/]+)\/([^/]+)\.git(\/.*)?$/);
  if (match === null) {
    return null;
  }
  return {
    owner: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
    gitPath: match[3] ?? "",
  };
}

function matchSshKeyRoute(pathname: string): { id: string } | null {
  const match = pathname.match(/^\/api\/ssh-keys\/([^/]+)$/);
  return match === null ? null : { id: safeDecodeURIComponent(match[1]) };
}

function matchOrganizationRoute(pathname: string): { slug: string } | null {
  const match = pathname.match(/^\/api\/organizations\/([^/]+)$/);
  if (match === null) {
    return null;
  }
  return { slug: validateOrganizationSlug(safeDecodeURIComponent(match[1])) };
}

function matchOrganizationMembersRoute(
  pathname: string,
): { slug: string } | null {
  const match = pathname.match(/^\/api\/organizations\/([^/]+)\/members$/);
  if (match === null) {
    return null;
  }
  return { slug: validateOrganizationSlug(safeDecodeURIComponent(match[1])) };
}

function matchOrganizationTeamsRoute(
  pathname: string,
): { slug: string } | null {
  const match = pathname.match(/^\/api\/organizations\/([^/]+)\/teams$/);
  if (match === null) {
    return null;
  }
  return { slug: validateOrganizationSlug(safeDecodeURIComponent(match[1])) };
}

function matchTeamMembersRoute(
  pathname: string,
): { organizationSlug: string; teamSlug: string } | null {
  const match = pathname.match(
    /^\/api\/organizations\/([^/]+)\/teams\/([^/]+)\/members$/,
  );
  if (match === null) {
    return null;
  }
  return {
    organizationSlug: validateOrganizationSlug(
      safeDecodeURIComponent(match[1]),
    ),
    teamSlug: safeDecodeURIComponent(match[2]),
  };
}

function matchRegistryVersionsRoute(
  pathname: string,
): { scope: string; name: string } | null {
  const match = pathname.match(
    /^\/api\/registry\/packages\/([^/]+)\/([^/]+)\/versions$/,
  );
  if (match === null) {
    return null;
  }
  return {
    scope: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
  };
}

function matchRegistryDownloadRoute(
  pathname: string,
): { scope: string; name: string; version: string } | null {
  const match = pathname.match(
    /^\/api\/registry\/packages\/([^/]+)\/([^/]+)\/versions\/([^/]+)\/download$/,
  );
  if (match === null) {
    return null;
  }
  return {
    scope: safeDecodeURIComponent(match[1]),
    name: safeDecodeURIComponent(match[2]),
    version: safeDecodeURIComponent(match[3]),
  };
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Response("url path contains malformed percent encoding.", {
      status: 400,
    });
  }
}

function renderHome(): string {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Adlaire Git Repository</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --surface: #ffffff;
      --surface-muted: #eef2f7;
      --border: #ccd3dd;
      --border-strong: #8b96a8;
      --text: #17202e;
      --muted: #5d6878;
      --accent: #126159;
      --accent-strong: #0b403b;
      --danger: #9b1c1c;
      --shadow: 0 1px 2px rgba(23, 32, 46, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
      color: var(--text);
      background: var(--bg);
      line-height: 1.5;
    }
    main { max-width: 1180px; margin: 0 auto; padding: 1.5rem; }
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 0 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    h1, h2 { margin: 0; line-height: 1.2; letter-spacing: 0; }
    h1 { font-size: 1.65rem; }
    h2 { font-size: 1rem; }
    section { margin-top: 1.25rem; }
    label { display: block; margin-top: 0.75rem; font-size: 0.92rem; font-weight: 650; color: var(--text); }
    input, select, button { font: inherit; }
    input, select {
      width: 100%;
      min-height: 2.45rem;
      margin-top: 0.3rem;
      padding: 0.55rem 0.65rem;
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      background: var(--surface);
      color: var(--text);
    }
    input:focus, select:focus, button:focus-visible {
      outline: 3px solid rgba(18, 97, 89, 0.24);
      outline-offset: 2px;
    }
    button {
      min-height: 2.45rem;
      margin-top: 0.9rem;
      padding: 0.55rem 0.85rem;
      border: 1px solid var(--accent-strong);
      background: var(--accent);
      color: #fff;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 650;
    }
    button:hover { background: var(--accent-strong); }
    code {
      display: inline-block;
      max-width: 100%;
      padding: 0.12rem 0.35rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--surface-muted);
      color: var(--text);
      overflow-wrap: anywhere;
    }
    .phase { color: var(--muted); font-size: 0.95rem; margin-top: 0.35rem; }
    .status {
      min-height: 2.25rem;
      width: min(100%, 520px);
      padding: 0.55rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--surface);
      color: var(--muted);
      box-shadow: var(--shadow);
    }
    .status[data-kind="error"] { border-color: var(--danger); color: var(--danger); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
    .panel {
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .toolbar button { margin-top: 0; }
    .repository-list {
      display: grid;
      gap: 0.65rem;
      padding: 0;
      margin: 0;
      list-style: none;
    }
    .repository-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.75rem;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--surface);
    }
    .repository-name { min-width: 0; font-weight: 700; overflow-wrap: anywhere; }
    .repository-meta { margin-top: 0.25rem; color: var(--muted); font-size: 0.9rem; }
    .visibility {
      padding: 0.16rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-muted);
      color: var(--text);
      font-size: 0.82rem;
      font-weight: 700;
    }
    @media (max-width: 680px) {
      main { padding: 1rem; }
      header, .toolbar { align-items: stretch; flex-direction: column; }
      .status { width: 100%; }
      .repository-item { grid-template-columns: 1fr; }
      button { width: 100%; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Adlaire Git Repository</h1>
        <div class="phase">Phase 8.1 / v.1.9</div>
      </div>
      <div class="status" id="status" role="status" aria-live="polite"></div>
    </header>
    <section class="grid">
      <form class="panel" id="register-form">
        <h2>ユーザー登録</h2>
        <label>Username <input name="username" autocomplete="username" required></label>
        <label>Password <input name="password" type="password" autocomplete="new-password" required></label>
        <button type="submit">登録</button>
      </form>
      <form class="panel" id="token-form">
        <h2>API token</h2>
        <label>Username <input name="username" autocomplete="username" required></label>
        <label>Password <input name="password" type="password" autocomplete="current-password" required></label>
        <label>Label <input name="label" value="browser" required></label>
        <button type="submit">発行</button>
      </form>
      <form class="panel" id="repo-form">
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
    <section class="panel">
      <div class="toolbar">
        <h2>Repositories</h2>
        <button id="refresh" type="button">更新</button>
      </div>
      <ul class="repository-list" id="repositories"></ul>
    </section>
  </main>
  <script>
    const state = { token: localStorage.getItem("adlaireToken") || "" };
    const status = document.querySelector("#status");
    const repositories = document.querySelector("#repositories");

    function setStatus(message, kind = "info") {
      status.textContent = message;
      status.dataset.kind = kind;
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
      try {
        const data = Object.fromEntries(new FormData(event.currentTarget));
        await request("/api/users", { method: "POST", headers: headers(), body: JSON.stringify(data) });
        setStatus("ユーザーを登録しました。");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });

    document.querySelector("#token-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(event.currentTarget));
        const result = await request("/api/tokens", { method: "POST", headers: headers(), body: JSON.stringify(data) });
        state.token = result.token;
        localStorage.setItem("adlaireToken", state.token);
        setStatus("API tokenを保存しました。");
        await loadRepositories();
      } catch (error) {
        setStatus(error.message, "error");
      }
    });

    document.querySelector("#repo-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(event.currentTarget));
        await request("/api/repositories", { method: "POST", headers: headers(), body: JSON.stringify(data) });
        setStatus("Repositoryを作成しました。");
        await loadRepositories();
      } catch (error) {
        setStatus(error.message, "error");
      }
    });

    document.querySelector("#refresh").addEventListener("click", loadRepositories);

    async function loadRepositories() {
      repositories.replaceChildren();
      const result = await request("/api/repositories", { headers: headers(false) });
      for (const repo of result.repositories) {
        const item = document.createElement("li");
        item.className = "repository-item";
        const detail = document.createElement("div");
        const name = document.createElement("div");
        name.className = "repository-name";
        name.textContent = repo.owner + "/" + repo.name;
        const meta = document.createElement("div");
        meta.className = "repository-meta";
        const code = document.createElement("code");
        code.textContent = "/git/" + repo.owner + "/" + repo.name + ".git";
        meta.append(code);
        detail.append(name, meta);
        const visibility = document.createElement("span");
        visibility.className = "visibility";
        visibility.textContent = repo.visibility;
        item.append(detail, visibility);
        repositories.append(item);
      }
    }

    loadRepositories().catch((error) => setStatus(error.message, "error"));
  </script>
</body>
</html>`;
}
