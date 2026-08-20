export interface DatabaseDriver {
  readonly kind: "sqlite";
  execute(statement: string): Promise<void>;
  query<T>(statement: string): Promise<T[]>;
}
