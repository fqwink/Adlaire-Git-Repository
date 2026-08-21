import { createApp } from "../../src/server.ts";
import { assertEquals } from "../support/assert.ts";

Deno.test("phase 4 keeps organization-owned private repositories usable across phase 1 to phase 3 workflows", async () => {
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
    const aliceToken = await registerAndToken(app, "alice");
    const bobToken = await registerAndToken(app, "bob");

    await request(app, "POST", "/api/organizations", {
      slug: "adlaire",
      name: "Adlaire Group",
    }, aliceToken);
    await request(app, "POST", "/api/organizations/adlaire/members", {
      username: "bob",
      role: "member",
    }, aliceToken);
    await request(app, "POST", "/api/repositories", {
      owner: "adlaire",
      name: "platform",
      visibility: "private",
    }, aliceToken);

    await request(app, "POST", "/api/repositories/adlaire/platform/issues", {
      title: "Organization issue",
      body: "Visible to organization members.",
    }, bobToken);
    const issues = await request(
      app,
      "GET",
      "/api/repositories/adlaire/platform/issues",
      undefined,
      bobToken,
    ) as { issues: Array<{ title: string }> };
    assertEquals(issues.issues.length, 1);
    assertEquals(issues.issues[0].title, "Organization issue");

    const closedIssue = await request(
      app,
      "PATCH",
      "/api/repositories/adlaire/platform/issues/1",
      { state: "closed" },
      aliceToken,
    ) as { issue: { state: string } };
    assertEquals(closedIssue.issue.state, "closed");

    await request(app, "POST", "/api/repositories/adlaire/platform/pulls", {
      title: "Organization pull request",
      sourceBranch: "feature/org",
      targetBranch: "main",
    }, bobToken);
    const pullRequests = await request(
      app,
      "GET",
      "/api/repositories/adlaire/platform/pulls",
      undefined,
      bobToken,
    ) as { pullRequests: Array<{ title: string }> };
    assertEquals(pullRequests.pullRequests.length, 1);
    assertEquals(
      pullRequests.pullRequests[0].title,
      "Organization pull request",
    );

    await request(app, "POST", "/api/repositories/adlaire/platform/wiki", {
      slug: "home",
      title: "Home",
      body: "Organization wiki.",
    }, aliceToken);
    const wiki = await request(
      app,
      "GET",
      "/api/repositories/adlaire/platform/wiki/home",
      undefined,
      bobToken,
    ) as { page: { slug: string } };
    assertEquals(wiki.page.slug, "home");

    await request(app, "POST", "/api/repositories/adlaire/platform/releases", {
      tagName: "v0.5.0",
      title: "Phase 4 integration",
    }, aliceToken);
    const releases = await request(
      app,
      "GET",
      "/api/repositories/adlaire/platform/releases",
      undefined,
      bobToken,
    ) as { releases: Array<{ tagName: string }> };
    assertEquals(releases.releases.length, 1);
    assertEquals(releases.releases[0].tagName, "v0.5.0");

    await request(app, "POST", "/api/repositories/adlaire/platform/webhooks", {
      url: `http://127.0.0.1:${webhookReceiver.addr.port}/hook`,
      events: ["push"],
    }, aliceToken);
    const deliveries = await request(
      app,
      "POST",
      "/api/repositories/adlaire/platform/webhook-events",
      { event: "push" },
      aliceToken,
    ) as { deliveries: Array<{ status: string }> };
    assertEquals(deliveries.deliveries.length, 1);
    assertEquals(deliveries.deliveries[0].status, "success");
    assertEquals(received[0].event, "push");
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
      driver: "sqlite",
      url: `${root}/adlaire.sqlite3`,
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
): Promise<string> {
  await request(app, "POST", "/api/users", {
    username,
    password: "secret-password",
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
  const headers = new Headers();
  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (token !== undefined) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await app.fetch(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json();
}
