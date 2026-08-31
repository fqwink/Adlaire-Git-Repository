import { createClient } from "@libsql/client";
import type { DatabaseDriver } from "./types.ts";

export class LibsqlDriver implements DatabaseDriver {
  readonly kind = "libsql";
  private readonly client: ReturnType<typeof createClient>;

  constructor(url: string, authToken?: string) {
    this.client = createClient({
      url,
      authToken,
    });
  }

  async execute(statement: string): Promise<void> {
    const statements = splitSqlStatements(statement);
    if (statements.length === 0) {
      return;
    }
    if (statements.length === 1) {
      await this.client.execute(statements[0]);
      return;
    }
    await this.client.batch(
      statements.map((sql) => ({ sql, args: [] })),
      "write",
    );
  }

  async query<T>(statement: string): Promise<T[]> {
    const result = await this.client.execute(statement);
    return result.rows.map((row) => ({ ...row })) as T[];
  }
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
