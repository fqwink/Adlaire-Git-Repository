import type { DatabaseDriver } from "./types.ts";

export class DatabaseGateway {
  constructor(private readonly driver: DatabaseDriver) {}

  async initialize(): Promise<void> {
    const schemaUrl = new URL("./schema.sql", import.meta.url);
    const schema = await Deno.readTextFile(schemaUrl);
    await this.execute(schema);
  }

  execute(statement: string): Promise<void> {
    return this.driver.execute(statement);
  }

  query<T>(statement: string): Promise<T[]> {
    return this.driver.query<T>(statement);
  }
}
