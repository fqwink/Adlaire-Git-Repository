import { loadConfig } from "../../src/config.ts";
import { assertEquals, assertRejects } from "../support/assert.ts";

Deno.test("loadConfig defaults to the libSQL driver and file database URL", () => {
  const config = loadConfig(env({ ADLAIRE_DATA_DIR: "/tmp/adlaire" }));

  assertEquals(config.database.driver, "libsql");
  assertEquals(config.database.url, "file:/tmp/adlaire/adlaire.libsql");
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
  assertEquals(config.database.url, "/tmp/adlaire/adlaire.sqlite3");
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
