export interface DatabaseDriver {
  readonly kind: "sqlite";
  execute(statement: string): Promise<void>;
  query<T extends Record<string, unknown>>(statement: string): Promise<T[]>;
}
