import { createApp } from "../../src/server.ts";
import { assertEquals } from "../support/assert.ts";

Deno.test("phase 2 API supports pull request review workflow", async () => {
  const { app, token, cleanup } = await setupApp();
  try {
    await createRepository(app, token, "platform", "api");

    const created = await request(
      app,
      "POST",
      "/api/repositories/platform/api/pulls",
      {
        title: "Add search",
        body: "Search implementation proposal.",
        sourceBranch: "feature/search",
        targetBranch: "main",
      },
      token,
    ) as { pullRequest: { number: number; state: string } };
    assertEquals(created.pullRequest.number, 1);
    assertEquals(created.pullRequest.state, "open");

    const review = await request(
      app,
      "POST",
      "/api/repositories/platform/api/pulls/1/reviews",
      { state: "approved", body: "Looks good." },
      token,
    ) as { review: { state: string; reviewer: string } };
    assertEquals(review.review.state, "approved");
    assertEquals(review.review.reviewer, "platform");

    const detail = await request(
      app,
      "GET",
      "/api/repositories/platform/api/pulls/1",
      undefined,
      token,
    ) as { pullRequest: { number: number; title: string } };
    assertEquals(detail.pullRequest.number, 1);
    assertEquals(detail.pullRequest.title, "Add search");

    const closed = await request(
      app,
      "PATCH",
      "/api/repositories/platform/api/pulls/1",
      { state: "merged", mergeCommitSha: "abc123" },
      token,
    ) as { pullRequest: { state: string; mergeCommitSha: string } };
    assertEquals(closed.pullRequest.state, "merged");
    assertEquals(closed.pullRequest.mergeCommitSha, "abc123");
  } finally {
    await cleanup();
  }
});

Deno.test("phase 2 API supports wiki, webhook, and release basics", async () => {
  const { app, token, cleanup } = await setupApp();
  const received: Array<{ event: string | null; signature: string | null }> =
    [];
  const webhookReceiver = Deno.serve({
    hostname: "127.0.0.1",
    port: 0,
    onListen: () => undefined,
  }, (request) => {
    received.push({
      event: request.headers.get("x-adlaire-event"),
      signature: request.headers.get("x-adlaire-signature-256"),
    });
    return new Response("ok");
  });
  try {
    await createRepository(app, token, "platform", "docs");

    const wiki = await request(
      app,
      "POST",
      "/api/repositories/platform/docs/wiki",
      {
        slug: "home",
        title: "Home",
        body: "# Home",
      },
      token,
    ) as { page: { slug: string; version: number } };
    assertEquals(wiki.page.slug, "home");
    assertEquals(wiki.page.version, 1);

    const webhook = await request(
      app,
      "POST",
      "/api/repositories/platform/docs/webhooks",
      {
        url: `http://127.0.0.1:${webhookReceiver.addr.port}/hook`,
        events: ["push", "pull_request"],
      },
      token,
    ) as {
      webhook: {
        id: string;
        events: string[];
        active: boolean;
        secret?: string;
      };
    };
    assertEquals(webhook.webhook.events.length, 2);
    assertEquals(webhook.webhook.active, true);
    assertEquals(webhook.webhook.secret, undefined);

    const delivery = await request(
      app,
      "POST",
      `/api/webhooks/${webhook.webhook.id}/ping`,
      undefined,
      token,
    ) as { delivery: { event: string; status: string; statusCode: number } };
    assertEquals(delivery.delivery.event, "ping");
    assertEquals(delivery.delivery.status, "success");
    assertEquals(delivery.delivery.statusCode, 200);
    assertEquals(received.length, 1);
    assertEquals(received[0].event, "ping");
    assertEquals(received[0].signature?.startsWith("sha256="), true);

    const release = await request(
      app,
      "POST",
      "/api/repositories/platform/docs/releases",
      {
        tagName: "v0.3.0",
        title: "Phase 2 Preview",
        notes: "Internal preview release record.",
      },
      token,
    ) as { release: { tagName: string; draft: boolean } };
    assertEquals(release.release.tagName, "v0.3.0");
    assertEquals(release.release.draft, false);

    const releaseDetail = await request(
      app,
      "GET",
      "/api/repositories/platform/docs/releases/v0.3.0",
      undefined,
      token,
    ) as { release: { tagName: string; title: string } };
    assertEquals(releaseDetail.release.tagName, "v0.3.0");
    assertEquals(releaseDetail.release.title, "Phase 2 Preview");

    const failingWebhook = await request(
      app,
      "POST",
      "/api/repositories/platform/docs/webhooks",
      {
        url: "http://127.0.0.1:9/hook",
        events: ["push"],
      },
      token,
    ) as { webhook: { id: string } };
    const failedDelivery = await request(
      app,
      "POST",
      `/api/webhooks/${failingWebhook.webhook.id}/ping`,
      undefined,
      token,
    ) as { delivery: { status: string; statusCode: number | null } };
    assertEquals(failedDelivery.delivery.status, "failure");
    assertEquals(failedDelivery.delivery.statusCode, null);
  } finally {
    await webhookReceiver.shutdown();
    await cleanup();
  }
});

async function setupApp(): Promise<{
  readonly app: { readonly fetch: (request: Request) => Promise<Response> };
  readonly token: string;
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

  await request(app, "POST", "/api/users", {
    username: "platform",
    password: "secret-password",
  });
  const tokenResult = await request(app, "POST", "/api/tokens", {
    username: "platform",
    password: "secret-password",
    label: "test",
  }) as { token: string };

  return {
    app,
    token: tokenResult.token,
    cleanup: () =>
      Deno.remove(root, { recursive: true }).catch(() => undefined),
  };
}

async function createRepository(
  app: { readonly fetch: (request: Request) => Promise<Response> },
  token: string,
  owner: string,
  name: string,
): Promise<void> {
  await request(app, "POST", "/api/repositories", {
    owner,
    name,
    visibility: "private",
  }, token);
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
