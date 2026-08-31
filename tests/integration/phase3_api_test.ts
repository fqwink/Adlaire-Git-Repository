import { createApp } from "../../src/server.ts";
import { assertEquals } from "../support/assert.ts";

Deno.test("phase 3 API supports teams, projects, registry, webhook events, and operations checks", async () => {
  const { app, cleanup } = await setupApp();
  const received: Array<{ event: string | null }> = [];
  const webhookReceiver = Deno.serve({
    hostname: "127.0.0.1",
    port: 0,
    onListen: () => undefined,
  }, (request) => {
    received.push({ event: request.headers.get("x-adlaire-event") });
    return new Response("ok");
  });

  try {
    const adminToken = await registerAndToken(app, "admin", "admin");
    const aliceToken = await registerAndToken(app, "alice");
    await registerAndToken(app, "bob");

    await request(app, "POST", "/api/organizations", {
      slug: "adlaire",
      name: "Adlaire Group",
    }, aliceToken);

    const team = await request(
      app,
      "POST",
      "/api/organizations/adlaire/teams",
      { slug: "runtime", name: "Runtime Team" },
      aliceToken,
    ) as { team: { slug: string } };
    assertEquals(team.team.slug, "runtime");

    const outsideTeamMember = await send(
      app,
      "POST",
      "/api/organizations/adlaire/teams/runtime/members",
      { username: "bob" },
      aliceToken,
    );
    assertEquals(outsideTeamMember.status, 403);

    await request(app, "POST", "/api/organizations/adlaire/members", {
      username: "bob",
      role: "member",
    }, aliceToken);

    const teamMember = await request(
      app,
      "POST",
      "/api/organizations/adlaire/teams/runtime/members",
      { username: "bob" },
      aliceToken,
    ) as { member: { username: string } };
    assertEquals(teamMember.member.username, "bob");

    await request(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, aliceToken);

    const project = await request(
      app,
      "POST",
      "/api/repositories/alice/runtime/projects",
      { title: "Phase 3 rollout", body: "Track minimum operations." },
      aliceToken,
    ) as { project: { number: number; state: string } };
    assertEquals(project.project.number, 1);
    assertEquals(project.project.state, "open");

    const closedProject = await request(
      app,
      "PATCH",
      "/api/repositories/alice/runtime/projects/1",
      { state: "closed" },
      aliceToken,
    ) as { project: { state: string } };
    assertEquals(closedProject.project.state, "closed");

    await request(app, "POST", "/api/repositories/alice/runtime/webhooks", {
      url: `http://127.0.0.1:${webhookReceiver.addr.port}/hook`,
      events: ["registry_package"],
    }, aliceToken);
    const dispatched = await request(
      app,
      "POST",
      "/api/repositories/alice/runtime/webhook-events",
      { event: "registry_package" },
      aliceToken,
    ) as { deliveries: Array<{ status: string }> };
    assertEquals(dispatched.deliveries.length, 1);
    assertEquals(dispatched.deliveries[0].status, "success");
    assertEquals(received[0].event, "registry_package");

    const registryPackage = await request(
      app,
      "POST",
      "/api/registry/packages",
      { scope: "adlaire", name: "runtime", description: "Runtime helpers" },
      aliceToken,
    ) as { package: { scope: string; name: string } };
    assertEquals(registryPackage.package.scope, "adlaire");
    assertEquals(registryPackage.package.name, "runtime");

    const registryVersion = await request(
      app,
      "POST",
      "/api/registry/packages/adlaire/runtime/versions",
      {
        version: "v0.1.0",
        modulePath: "mod.ts",
        source: "export const runtime = 'deno';\n",
      },
      aliceToken,
    ) as { version: { version: string; checksum: string } };
    assertEquals(registryVersion.version.version, "v0.1.0");
    assertEquals(registryVersion.version.checksum.length, 64);

    const downloaded = await textRequest(
      app,
      "/api/registry/packages/adlaire/runtime/versions/v0.1.0/download",
      aliceToken,
    );
    assertEquals(downloaded, "export const runtime = 'deno';\n");

    const operations = await request(
      app,
      "GET",
      "/api/operations/status",
      undefined,
      aliceToken,
    ) as { phase: string; databaseDriver: string; nodeRuntime: string };
    assertEquals(operations.phase, "Phase 8");
    assertEquals(operations.databaseDriver, "libsql");
    assertEquals(operations.nodeRuntime, "forbidden");

    const libsql = await request(
      app,
      "GET",
      "/api/operations/libsql-evaluation",
      undefined,
      aliceToken,
    ) as { status: string; candidate: string };
    assertEquals(libsql.status, "adopted");
    assertEquals(libsql.candidate, "libsql");

    const auditLogs = await request(
      app,
      "GET",
      "/api/audit-logs?limit=20",
      undefined,
      adminToken,
    ) as { auditLogs: Array<{ action: string }> };
    assertEquals(
      auditLogs.auditLogs.some((log) =>
        log.action === "registry.version.publish"
      ),
      true,
    );
  } finally {
    await webhookReceiver.shutdown();
    await cleanup();
  }
});

async function setupApp(): Promise<{
  readonly app: { readonly fetch: (request: Request) => Promise<Response> };
  readonly cleanup: () => Promise<void>;
}> {
  const root = await Deno.makeTempDir();
  const app = await createApp({
    host: "127.0.0.1",
    port: 0,
    dataDir: root,
    repositoryRoot: `${root}/repositories`,
    database: {
      driver: "libsql",
      url: `file://${root}/adlaire.libsql`,
    },
  });

  return {
    app,
    cleanup: () =>
      Deno.remove(root, { recursive: true }).catch(() => undefined),
  };
}

async function registerAndToken(
  app: { readonly fetch: (request: Request) => Promise<Response> },
  username: string,
  role?: "admin" | "developer",
): Promise<string> {
  await request(app, "POST", "/api/users", {
    username,
    password: "secret-password",
    role,
  });
  const tokenResult = await request(app, "POST", "/api/tokens", {
    username,
    password: "secret-password",
    label: "test",
  }) as { token: string };
  return tokenResult.token;
}

async function request(
  app: { readonly fetch: (request: Request) => Promise<Response> },
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<unknown> {
  const response = await send(app, method, path, body, token);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json();
}

async function textRequest(
  app: { readonly fetch: (request: Request) => Promise<Response> },
  path: string,
  token: string,
): Promise<string> {
  const response = await send(app, "GET", path, undefined, token);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.text();
}

function send(
  app: { readonly fetch: (request: Request) => Promise<Response> },
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<Response> {
  const headers = new Headers();
  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (token !== undefined) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return app.fetch(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}
