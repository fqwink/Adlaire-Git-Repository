import { createApp } from "../../src/server.ts";
import { assertEquals } from "../support/assert.ts";

Deno.test("organization API creates organization ownership and grants repository access to members", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const aliceToken = await registerAndToken(app, "alice");
    const bobToken = await registerAndToken(app, "bob");

    const created = await request(
      app,
      "POST",
      "/api/organizations",
      { slug: "adlaire", name: "Adlaire Group" },
      aliceToken,
    ) as {
      organization: { slug: string; name: string };
    };
    assertEquals(created.organization.slug, "adlaire");
    assertEquals(created.organization.name, "Adlaire Group");

    const organizationDetail = await request(
      app,
      "GET",
      "/api/organizations/adlaire",
      undefined,
      aliceToken,
    ) as {
      organization: { slug: string };
      members: Array<{ username: string; role: string }>;
    };
    assertEquals(organizationDetail.organization.slug, "adlaire");
    assertEquals(organizationDetail.members.length, 1);
    assertEquals(organizationDetail.members[0].username, "alice");
    assertEquals(organizationDetail.members[0].role, "owner");

    await request(app, "POST", "/api/repositories", {
      owner: "adlaire",
      name: "core",
      visibility: "private",
    }, aliceToken);

    const deniedBeforeMembership = await requestStatus(
      app,
      "GET",
      "/api/repositories/adlaire/core",
      undefined,
      bobToken,
    );
    assertEquals(deniedBeforeMembership, 403);

    const member = await request(
      app,
      "POST",
      "/api/organizations/adlaire/members",
      { username: "bob", role: "member" },
      aliceToken,
    ) as { member: { username: string; role: string } };
    assertEquals(member.member.username, "bob");
    assertEquals(member.member.role, "member");

    const visibleRepository = await request(
      app,
      "GET",
      "/api/repositories/adlaire/core",
      undefined,
      bobToken,
    ) as { repository: { owner: string; name: string } };
    assertEquals(visibleRepository.repository.owner, "adlaire");
    assertEquals(visibleRepository.repository.name, "core");

    const memberWriteDenied = await requestStatus(
      app,
      "PATCH",
      "/api/repositories/adlaire/core",
      { visibility: "public" },
      bobToken,
    );
    assertEquals(memberWriteDenied, 403);
  } finally {
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
  const response = await send(app, method, path, body, token);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json();
}

async function requestStatus(
  app: { readonly fetch: (request: Request) => Promise<Response> },
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<number> {
  return (await send(app, method, path, body, token)).status;
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
