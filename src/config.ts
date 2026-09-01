export interface AppConfig {
  readonly host: string;
  readonly port: number;
  readonly dataDir: string;
  readonly repositoryRoot: string;
  readonly database: DatabaseConfig;
}

export interface DatabaseConfig {
  readonly driver: "libsql" | "sqlite";
  readonly url: string;
  readonly authToken?: string;
}

export function loadConfig(env: Deno.Env = Deno.env): AppConfig {
  const appRoot = env.get("ADLAIRE_APP_ROOT") ?? ".";
  const sharedDir = env.get("ADLAIRE_SHARED_DIR") ?? `${appRoot}/shared`;
  const dataDir = env.get("ADLAIRE_DATA_DIR") ?? `${sharedDir}/data`;
  const databaseDriver = readDatabaseDriver(
    env.get("DB_DRIVER"),
    env.get("ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE") === "1",
  );
  const databaseUrl = env.get("DB_URL") ??
    defaultDatabaseUrl(databaseDriver, dataDir);

  return {
    host: env.get("ADLAIRE_HOST") ?? "127.0.0.1",
    port: readPort(env.get("ADLAIRE_PORT")),
    dataDir,
    repositoryRoot: env.get("ADLAIRE_REPOSITORY_ROOT") ??
      `${dataDir}/repositories`,
    database: {
      driver: databaseDriver,
      url: databaseUrl,
      authToken: env.get("DB_AUTH_TOKEN") ?? undefined,
    },
  };
}

function readPort(value: string | undefined): number {
  if (value === undefined || value.trim() === "") {
    return 8080;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("ADLAIRE_PORT must be an integer between 1 and 65535.");
  }
  return port;
}

function readDatabaseDriver(
  value: string | undefined,
  allowSqliteMigrationSource: boolean,
): "libsql" | "sqlite" {
  const driver = value ?? "libsql";
  if (driver === "libsql") {
    return "libsql";
  }
  if (driver === "sqlite") {
    if (allowSqliteMigrationSource) {
      return "sqlite";
    }
    throw new Error(
      "DB_DRIVER=sqlite requires ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1 for approved migration-source checks.",
    );
  }
  throw new Error("DB_DRIVER must be libsql or sqlite.");
}

function defaultDatabaseUrl(
  driver: "libsql" | "sqlite",
  dataDir: string,
): string {
  const databaseDir = `${dataDir}/database`;
  if (driver === "sqlite") {
    return `${databaseDir}/adlaire.sqlite3`;
  }
  return `file:${databaseDir}/adlaire.libsql`;
}
