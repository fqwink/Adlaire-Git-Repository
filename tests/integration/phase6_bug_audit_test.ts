import { createApp } from "../../src/server.ts";
import { assertEquals } from "../support/assert.ts";

Deno.test("phase 6 rejects unsafe registration and namespace collisions", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const adminToken = await registerAndToken(app, "admin", "admin");

    const secondAdmin = await send(app, "POST", "/api/users", {
      username: "rootuser",
      password: "secret-password",
      role: "admin",
    });
    assertEquals(secondAdmin.status, 403);

    const authorizedAdmin = await send(app, "POST", "/api/users", {
      username: "adminops",
      password: "secret-password",
      role: "admin",
    }, adminToken);
    assertEquals(authorizedAdmin.status, 201);

    await request(app, "POST", "/api/users", {
      username: "bob",
      password: "secret-password",
    });

    const organizationCollision = await send(
      app,
      "POST",
      "/api/organizations",
      { slug: "bob", name: "Bob Organization" },
      adminToken,
    );
    assertEquals(organizationCollision.status, 409);

    await request(app, "POST", "/api/organizations", {
      slug: "adlaire",
      name: "Adlaire Group",
    }, adminToken);
    const userCollision = await send(app, "POST", "/api/users", {
      username: "adlaire",
      password: "secret-password",
    });
    assertEquals(userCollision.status, 409);
  } finally {
    await cleanup();
  }
});

Deno.test("phase 6 returns client errors for malformed input", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const malformedJson = await app.fetch(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{bad",
      }),
    );
    assertEquals(malformedJson.status, 400);

    const invalidContentType = await app.fetch(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "content-type": "application/jsonp" },
        body: JSON.stringify({
          username: "jsonp",
          password: "secret-password",
        }),
      }),
    );
    assertEquals(invalidContentType.status, 415);

    const invalidUsername = await send(app, "POST", "/api/users", {
      username: "ab",
      password: "secret-password",
    });
    assertEquals(invalidUsername.status, 400);

    const malformedPath = await send(
      app,
      "GET",
      "/api/repositories/%E0%A4%A/platform",
    );
    assertEquals(malformedPath.status, 400);
  } finally {
    await cleanup();
  }
});

Deno.test("phase 6 reports duplicate resources as conflicts", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const token = await registerAndToken(app, "alice");

    const duplicateUser = await send(app, "POST", "/api/users", {
      username: "alice",
      password: "secret-password",
    });
    assertEquals(duplicateUser.status, 409);

    await request(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, token);
    const duplicateRepository = await send(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, token);
    assertEquals(duplicateRepository.status, 409);
  } finally {
    await cleanup();
  }
});

Deno.test("phase 6 preserves repository metadata integrity after delete", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const token = await registerAndToken(app, "alice");
    await request(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, token);
    await request(app, "POST", "/api/repositories/alice/runtime/issues", {
      title: "before delete",
    }, token);
    await request(
      app,
      "DELETE",
      "/api/repositories/alice/runtime",
      undefined,
      token,
    );
    await request(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, token);

    const issues = await request(
      app,
      "GET",
      "/api/repositories/alice/runtime/issues",
      undefined,
      token,
    ) as { issues: unknown[] };
    assertEquals(issues.issues.length, 0);
  } finally {
    await cleanup();
  }
});

Deno.test("phase 6 registry global list only returns readable packages", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const aliceToken = await registerAndToken(app, "alice", "admin");
    const bobToken = await registerAndToken(app, "bob");

    await request(app, "POST", "/api/organizations", {
      slug: "secretorg",
      name: "Secret Organization",
    }, aliceToken);
    await request(app, "POST", "/api/registry/packages", {
      scope: "secretorg",
      name: "internal",
      description: "hidden",
    }, aliceToken);

    const scoped = await send(
      app,
      "GET",
      "/api/registry/packages?scope=secretorg",
      undefined,
      bobToken,
    );
    assertEquals(scoped.status, 403);

    const global = await request(
      app,
      "GET",
      "/api/registry/packages",
      undefined,
      bobToken,
    ) as { packages: Array<{ id: string }> };
    assertEquals(global.packages.length, 0);
  } finally {
    await cleanup();
  }
});

Deno.test("phase 6 treats HTTP authorization schemes case-insensitively", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const token = await registerAndToken(app, "alice");
    await request(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, token);

    const bearer = await sendWithAuthorization(
      app,
      "GET",
      "/api/repositories/alice/runtime",
      undefined,
      `bearer ${token}`,
    );
    assertEquals(bearer.status, 200);

    const basic = await sendWithAuthorization(
      app,
      "GET",
      "/api/repositories/alice/runtime",
      undefined,
      `basic ${btoa("alice:secret-password")}`,
    );
    assertEquals(basic.status, 200);
  } finally {
    await cleanup();
  }
});

Deno.test("phase 6 does not expose webhook secrets through API responses", async () => {
  const { app, cleanup } = await setupApp();
  try {
    const token = await registerAndToken(app, "alice");
    await request(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, token);

    const created = await request(
      app,
      "POST",
      "/api/repositories/alice/runtime/webhooks",
      {
        url: "http://127.0.0.1:9/hook",
        secret: "top-secret",
        events: ["push"],
      },
      token,
    ) as { webhook: Record<string, unknown> };
    assertEquals("secret" in created.webhook, false);

    const listed = await request(
      app,
      "GET",
      "/api/repositories/alice/runtime/webhooks",
      undefined,
      token,
    ) as { webhooks: Array<Record<string, unknown>> };
    assertEquals(listed.webhooks.length, 1);
    assertEquals("secret" in listed.webhooks[0], false);
  } finally {
    await cleanup();
  }
});

Deno.test("phase 6 supports PAT authenticated Git push clone fetch and pull", async () => {
  const { app, cleanup } = await setupApp();
  const server = Deno.serve({
    hostname: "127.0.0.1",
    port: 0,
    onListen: () => undefined,
  }, app.fetch);
  const tempRoots: string[] = [];
  try {
    const token = await registerAndToken(app, "alice");
    await request(app, "POST", "/api/repositories", {
      owner: "alice",
      name: "runtime",
      visibility: "private",
    }, token);

    const unauthenticated = await fetch(
      `http://127.0.0.1:${server.addr.port}/git/alice/runtime.git/info/refs?service=git-upload-pack`,
    );
    assertEquals(unauthenticated.status, 401);
    assertEquals(
      unauthenticated.headers.get("www-authenticate"),
      'Basic realm="Adlaire Git Repository"',
    );

    const work = await makeTempDir(tempRoots);
    await git(["init"], work);
    await git(["config", "user.email", "alice@example.test"], work);
    await git(["config", "user.name", "Alice"], work);
    await Deno.writeTextFile(`${work}/README.md`, "hello\n");
    await git(["add", "README.md"], work);
    await git(["commit", "-m", "initial"], work);

    const remote =
      `http://alice:${token}@127.0.0.1:${server.addr.port}/git/alice/runtime.git`;
    await git(["remote", "add", "origin", remote], work);
    await git(["push", "origin", "HEAD:main"], work);

    const cloneRoot = await makeTempDir(tempRoots);
    await git(["clone", remote, `${cloneRoot}/runtime`], cloneRoot);
    assertEquals(
      await Deno.readTextFile(`${cloneRoot}/runtime/README.md`),
      "hello\n",
    );

    await git(["fetch", "origin"], `${cloneRoot}/runtime`);
    await git(["pull", "origin", "main"], `${cloneRoot}/runtime`);
  } finally {
    await server.shutdown();
    for (const root of tempRoots) {
      await Deno.remove(root, { recursive: true }).catch(() => undefined);
    }
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

function sendWithAuthorization(
  app: { readonly fetch: (request: Request) => Promise<Response> },
  method: string,
  path: string,
  body: unknown,
  authorization: string,
): Promise<Response> {
  const headers = new Headers();
  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }
  headers.set("authorization", authorization);

  return app.fetch(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

async function git(args: string[], cwd: string): Promise<void> {
  const output = await new Deno.Command("git", {
    args,
    cwd,
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (!output.success) {
    throw new Error(
      `git ${args.join(" ")} failed: ${
        new TextDecoder().decode(output.stderr)
      }`,
    );
  }
}

async function makeTempDir(roots: string[]): Promise<string> {
  const root = await Deno.makeTempDir();
  roots.push(root);
  return root;
}
