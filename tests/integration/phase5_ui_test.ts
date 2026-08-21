import { createApp } from "../../src/server.ts";
import { assert, assertEquals } from "../support/assert.ts";

Deno.test("phase 5 home UI exposes the approved workflow layout", async () => {
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

  try {
    const response = await app.fetch(new Request("http://localhost/"));
    assertEquals(response.status, 200);
    assert(
      response.headers.get("content-type")?.includes("text/html"),
      "Home UI must be served as HTML.",
    );

    const html = await response.text();
    assert(
      html.includes("Phase 5 / v.0.6"),
      "Home UI must expose the Phase 5 baseline.",
    );
    assert(html.includes('id="register-form"'));
    assert(html.includes('id="token-form"'));
    assert(html.includes('id="repo-form"'));
    assert(html.includes('class="repository-list" id="repositories"'));
    assert(html.includes('role="status" aria-live="polite"'));
  } finally {
    await Deno.remove(root, { recursive: true }).catch(() => undefined);
  }
});
