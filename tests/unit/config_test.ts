import { loadConfig } from "../../src/config.ts";
import { assertEquals, assertRejects } from "../support/assert.ts";

Deno.test("loadConfig defaults to shared data paths for system/data split", () => {
  const config = loadConfig(env({}));

  assertEquals(config.database.driver, "libsql");
  assertEquals(config.dataDir, "./shared/data");
  assertEquals(config.repositoryRoot, "./shared/data/repositories");
  assertEquals(
    config.database.url,
    "http://127.0.0.1:8081",
  );
});

Deno.test("loadConfig derives shared data paths from the app root", () => {
  const config = loadConfig(
    env({ ADLAIRE_APP_ROOT: "/opt/adlaire-git-repository" }),
  );

  assertEquals(config.dataDir, "/opt/adlaire-git-repository/shared/data");
  assertEquals(
    config.repositoryRoot,
    "/opt/adlaire-git-repository/shared/data/repositories",
  );
  assertEquals(
    config.database.url,
    "http://127.0.0.1:8081",
  );
});

Deno.test("loadConfig allows overriding shared and data roots explicitly", () => {
  const sharedConfig = loadConfig(
    env({ ADLAIRE_SHARED_DIR: "/srv/adlaire/shared" }),
  );
  assertEquals(sharedConfig.dataDir, "/srv/adlaire/shared/data");
  assertEquals(
    sharedConfig.repositoryRoot,
    "/srv/adlaire/shared/data/repositories",
  );
  assertEquals(
    sharedConfig.database.url,
    "http://127.0.0.1:8081",
  );

  const dataConfig = loadConfig(
    env({
      ADLAIRE_DATA_DIR: "/srv/adlaire/data",
      ADLAIRE_REPOSITORY_ROOT: "/srv/git/repositories",
    }),
  );
  assertEquals(dataConfig.dataDir, "/srv/adlaire/data");
  assertEquals(dataConfig.repositoryRoot, "/srv/git/repositories");
  assertEquals(
    dataConfig.database.url,
    "http://127.0.0.1:8081",
  );
});

Deno.test("loadConfig rejects SQLite driver without migration-source approval flag", () => {
  assertRejects(
    () => loadConfig(env({ DB_DRIVER: "sqlite" })),
    "DB_DRIVER=sqlite requires ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1",
  );
});

Deno.test("loadConfig allows SQLite only for approved migration-source checks", () => {
  const config = loadConfig(
    env({
      ADLAIRE_DATA_DIR: "/tmp/adlaire",
      ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE: "1",
      DB_DRIVER: "sqlite",
    }),
  );

  assertEquals(config.database.driver, "sqlite");
  assertEquals(config.database.url, "/tmp/adlaire/database/adlaire.sqlite3");
});

function env(values: Record<string, string>): Deno.Env {
  return {
    get(key: string): string | undefined {
      return values[key];
    },
    set(key: string, value: string): void {
      values[key] = value;
    },
    delete(key: string): void {
      delete values[key];
    },
    has(key: string): boolean {
      return Object.prototype.hasOwnProperty.call(values, key);
    },
    toObject(): Record<string, string> {
      return { ...values };
    },
  } as Deno.Env;
}
