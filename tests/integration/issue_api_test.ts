import { createApp } from "../../src/server.ts";
import { assertEquals } from "../support/assert.ts";

Deno.test("issue API creates, lists, reads, and closes repository issues", async () => {
  const root = await Deno.makeTempDir();
  try {
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
    const token = tokenResult.token;

    await request(app, "POST", "/api/repositories", {
      owner: "platform",
      name: "api",
      visibility: "private",
    }, token);

    const created = await request(
      app,
      "POST",
      "/api/repositories/platform/api/issues",
      {
        title: "Track issue API",
        body: "Expose minimal issue workflow.",
      },
      token,
    ) as { issue: { number: number; state: string; title: string } };
    assertEquals(created.issue.number, 1);
    assertEquals(created.issue.state, "open");

    const listed = await request(
      app,
      "GET",
      "/api/repositories/platform/api/issues?state=open",
      undefined,
      token,
    ) as { issues: Array<{ number: number }> };
    assertEquals(listed.issues.length, 1);
    assertEquals(listed.issues[0].number, 1);

    const read = await request(
      app,
      "GET",
      "/api/repositories/platform/api/issues/1",
      undefined,
      token,
    ) as { issue: { title: string } };
    assertEquals(read.issue.title, "Track issue API");

    const closed = await request(
      app,
      "PATCH",
      "/api/repositories/platform/api/issues/1",
      { state: "closed" },
      token,
    ) as { issue: { state: string } };
    assertEquals(closed.issue.state, "closed");
  } finally {
    await Deno.remove(root, { recursive: true }).catch(() => undefined);
  }
});

Deno.test("issue API protects private repository issue lists", async () => {
  const root = await Deno.makeTempDir();
  try {
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

    await request(app, "POST", "/api/repositories", {
      owner: "platform",
      name: "secret",
      visibility: "private",
    }, tokenResult.token);

    const response = await app.fetch(
      new Request(
        "http://localhost/api/repositories/platform/secret/issues",
      ),
    );
    assertEquals(response.status, 403);
  } finally {
    await Deno.remove(root, { recursive: true }).catch(() => undefined);
  }
});

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
