import type { DatabaseDriver } from "./types.ts";

export class SqliteCliDriver implements DatabaseDriver {
  readonly kind = "sqlite";

  constructor(private readonly databasePath: string) {}

  async execute(statement: string): Promise<void> {
    await this.run(["-batch", this.databasePath, statement]);
  }

  async query<T extends Record<string, unknown>>(statement: string): Promise<T[]> {
    const output = await this.run(["-batch", "-json", this.databasePath, statement]);
    const trimmed = output.trim();
    if (trimmed === "") {
      return [];
    }
    return JSON.parse(trimmed) as T[];
  }

  private async run(args: string[]): Promise<string> {
    const command = new Deno.Command("sqlite3", {
      args,
      stdout: "piped",
      stderr: "piped"
    });
    const output = await command.output();
    const decoder = new TextDecoder();
    const stdout = decoder.decode(output.stdout);
    const stderr = decoder.decode(output.stderr);

    if (!output.success) {
      throw new Error(stderr.trim() || "sqlite3 command failed.");
    }
    return stdout;
  }
}
