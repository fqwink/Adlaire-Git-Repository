export function quoteSqlText(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function quoteSqlNullableText(value: string | undefined): string {
  return value === undefined ? "NULL" : quoteSqlText(value);
}
