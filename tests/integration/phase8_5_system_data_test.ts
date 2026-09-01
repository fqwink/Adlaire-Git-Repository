import { createApp } from "../../src/server.ts";
import { assert, assertEquals } from "../support/assert.ts";

Deno.test("home UI exposes current Phase 8.5 baseline and workflow layout", async () => {
  const root = await Deno.makeTempDir();
  const dataDir = `${root}/shared/data`;
  const app = await createApp({
    host: "127.0.0.1",
    port: 0,
    dataDir,
    repositoryRoot: `${dataDir}/repositories`,
    database: {
      driver: "libsql",
      url: `file:${dataDir}/database/adlaire.libsql`,
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
      html.includes("Phase 8.5 / v.1.9"),
      "Home UI must expose the current Phase 8.5 baseline.",
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

Deno.test("application initializes host filesystem data directories", async () => {
  const root = await Deno.makeTempDir();
  const dataDir = `${root}/shared/data`;
  const repositoryRoot = `${dataDir}/repositories`;
  const databaseDir = `${dataDir}/database`;

  try {
    await createApp({
      host: "127.0.0.1",
      port: 0,
      dataDir,
      repositoryRoot,
      database: {
        driver: "libsql",
        url: `file:${databaseDir}/adlaire.libsql`,
      },
    });

    assertEquals((await Deno.stat(dataDir)).isDirectory, true);
    assertEquals((await Deno.stat(repositoryRoot)).isDirectory, true);
    assertEquals((await Deno.stat(databaseDir)).isDirectory, true);
  } finally {
    await Deno.remove(root, { recursive: true }).catch(() => undefined);
  }
});
