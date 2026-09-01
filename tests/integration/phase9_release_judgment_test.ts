import { createApp } from "../../src/server.ts";
import { assert, assertEquals } from "../support/assert.ts";

Deno.test("home UI exposes current Phase 9 release judgment baseline", async () => {
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
      html.includes("Phase 9 / v.2.10"),
      "Home UI must expose the current Phase 9 release judgment baseline.",
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

Deno.test("deployment scripts preserve current release target and rollback by release id", async () => {
  const backupScript = await Deno.readTextFile("scripts/deploy/backup.sh");
  const deployScript = await Deno.readTextFile("scripts/deploy/deploy.sh");
  const deployEnvExample = await Deno.readTextFile(
    "scripts/deploy/deploy.env.example",
  );
  const rollbackScript = await Deno.readTextFile("scripts/deploy/rollback.sh");
  const specification = await Deno.readTextFile(
    "docs/specs/Adlaire_Git_Repository_Specification.md",
  );
  const manifest = JSON.parse(await Deno.readTextFile("deno.json")) as {
    version: string;
    tasks: Record<string, string>;
  };

  const formalVersion = `v.${
    manifest.version.split(".").slice(0, 2).join(".")
  }`;
  const artifactVersion = `v${
    manifest.version.split(".").slice(0, 2).join(".")
  }`;

  assertEquals(manifest.version, "2.10.0");
  assertEquals(formalVersion, "v.2.10");
  assert(
    manifest.tasks["compile:linux-arm64"].includes(
      `dist/adlaire-git-repo-${artifactVersion}-aarch64-unknown-linux-gnu`,
    ),
    "ARM64 release binary name must match the formal stable version.",
  );
  assert(
    manifest.tasks["compile:linux-x86_64"].includes(
      `dist/adlaire-git-repo-${artifactVersion}-x86_64-unknown-linux-gnu`,
    ),
    "x86_64 release binary name must match the formal stable version.",
  );
  assert(
    deployScript.includes(
      `RELEASE_VERSION="\${RELEASE_VERSION:-${formalVersion}}"`,
    ),
    "Deploy default release version must match the Phase 9 stable version.",
  );
  assert(
    deployEnvExample.includes(`RELEASE_VERSION=${formalVersion}`),
    "Deploy environment example must match the Phase 9 stable version.",
  );

  assert(
    backupScript.includes("resolved_current="),
    "Backup must resolve system/current before archiving the current release.",
  );
  assert(
    backupScript.includes("current-release.tar.gz"),
    "Backup must preserve the current system release artifact.",
  );
  assert(
    rollbackScript.includes('TARGET_RELEASE="${TARGET_RELEASE:-}"'),
    "Rollback must use release ids as its public input contract.",
  );
  assert(
    specification.includes(
      "TARGET_RELEASE=v.2.10-YYYYMMDD-HHMMSS scripts/deploy/rollback.sh",
    ),
    "Rollback documentation must match the TARGET_RELEASE script contract.",
  );
});
