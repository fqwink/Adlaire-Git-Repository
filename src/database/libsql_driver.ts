import type { DatabaseDriver } from "./types.ts";

type HranaValue =
  | null
  | string
  | number
  | boolean
  | { readonly type: string; readonly value?: unknown };

interface HranaColumn {
  readonly name?: string;
}

interface HranaResult {
  readonly cols?: readonly HranaColumn[];
  readonly rows?: readonly (readonly HranaValue[])[];
}

interface HranaResponse {
  readonly results?: readonly {
    readonly type?: string;
    readonly error?: { readonly message?: string };
    readonly response?: {
      readonly type?: string;
      readonly result?: HranaResult;
    };
  }[];
}

export class LibsqlDriver implements DatabaseDriver {
  readonly kind = "libsql";
  private readonly endpoint: string;

  constructor(url: string, authToken?: string) {
    this.endpoint = normalizeEndpoint(url);
    this.authToken = authToken;
  }

  async execute(statement: string): Promise<void> {
    const statements = splitSqlStatements(statement);
    if (statements.length === 0) {
      return;
    }
    await this.request(
      statements.map((sql) => ({ type: "execute", stmt: { sql, args: [] } })),
    );
  }

  async query<T>(statement: string): Promise<T[]> {
    const response = await this.request([
      { type: "execute", stmt: { sql: statement, args: [] } },
    ]);
    const result = response.results?.[0]?.response?.result;
    const columns = result?.cols ?? [];
    const rows = result?.rows ?? [];
    return rows.map((row) => {
      const record: Record<string, unknown> = {};
      for (let index = 0; index < columns.length; index += 1) {
        const name = columns[index]?.name;
        if (name !== undefined && name !== "") {
          record[name] = decodeHranaValue(row[index]);
        }
      }
      return record as T;
    });
  }

  private readonly authToken?: string;

  private async request(
    requests: readonly Record<string, unknown>[],
  ): Promise<HranaResponse> {
    const headers = new Headers({ "content-type": "application/json" });
    if (this.authToken !== undefined) {
      headers.set("authorization", `Bearer ${this.authToken}`);
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ requests }),
    });
    if (!response.ok) {
      throw new Error(
        `libSQL request failed with HTTP ${response.status}: ${await response
          .text()}`,
      );
    }

    const payload = await response.json() as HranaResponse;
    for (const result of payload.results ?? []) {
      if (result.type === "error" || result.error !== undefined) {
        throw new Error(result.error?.message ?? "libSQL request failed.");
      }
    }
    return payload;
  }
}

function normalizeEndpoint(url: string): string {
  if (url.startsWith("libsql://")) {
    return normalizeHttpEndpoint(`https://${url.slice("libsql://".length)}`);
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return normalizeHttpEndpoint(url);
  }
  throw new Error(
    "DB_URL for libsql must be http://, https://, or libsql:// and must point to a libSQL Hrana endpoint.",
  );
}

function normalizeHttpEndpoint(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname.endsWith("/v2/pipeline")) {
    return parsed.toString();
  }
  parsed.pathname = `${parsed.pathname.replace(/\/$/, "")}/v2/pipeline`;
  return parsed.toString();
}

function decodeHranaValue(value: HranaValue): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (value.type === "null") {
    return null;
  }
  return value.value;
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inSingleQuote = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    current += character;

    if (character === "'" && inSingleQuote && next === "'") {
      current += next;
      index += 1;
      continue;
    }

    if (character === "'") {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (character === ";" && !inSingleQuote) {
      const statement = current.trim();
      if (statement !== "") {
        statements.push(statement);
      }
      current = "";
    }
  }

  const tail = current.trim();
  if (tail !== "") {
    statements.push(tail);
  }
  return statements;
}
