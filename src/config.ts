export interface AppConfig {
  readonly host: string;
  readonly port: number;
  readonly dataDir: string;
  readonly repositoryRoot: string;
  readonly database: DatabaseConfig;
}

export interface DatabaseConfig {
  readonly driver: "sqlite";
  readonly url: string;
  readonly authToken?: string;
}

export function loadConfig(env: Deno.Env = Deno.env): AppConfig {
  const dataDir = env.get("ADLAIRE_DATA_DIR") ?? "./data";
  const databaseUrl = env.get("DB_URL") ?? `${dataDir}/adlaire.sqlite3`;

  return {
    host: env.get("ADLAIRE_HOST") ?? "127.0.0.1",
    port: readPort(env.get("ADLAIRE_PORT")),
    dataDir,
    repositoryRoot: env.get("ADLAIRE_REPOSITORY_ROOT") ?? `${dataDir}/repositories`,
    database: {
      driver: readDatabaseDriver(env.get("DB_DRIVER")),
      url: databaseUrl,
      authToken: env.get("DB_AUTH_TOKEN") ?? undefined
    }
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

function readDatabaseDriver(value: string | undefined): "sqlite" {
  const driver = value ?? "sqlite";
  if (driver !== "sqlite") {
    throw new Error("Phase 1 supports DB_DRIVER=sqlite only.");
  }
  return "sqlite";
}
