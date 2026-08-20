import { quoteSqlText } from "../database/sql.ts";
import type { DatabaseGateway } from "../database/gateway.ts";
import type { RepositoryRecord, RepositoryVisibility } from "../domain/repository.ts";

interface RepositoryRow {
  id: string;
  owner: string;
  name: string;
  visibility: RepositoryVisibility;
  bare_path: string;
  created_at: string;
  updated_at: string;
}

export class RepositoryRepository {
  constructor(private readonly database: DatabaseGateway) {}

  async create(record: RepositoryRecord): Promise<RepositoryRecord> {
    await this.database.execute(`
      INSERT INTO repositories (id, owner, name, visibility, bare_path, created_at, updated_at)
      VALUES (
        ${quoteSqlText(record.id)},
        ${quoteSqlText(record.owner)},
        ${quoteSqlText(record.name)},
        ${quoteSqlText(record.visibility)},
        ${quoteSqlText(record.barePath)},
        ${quoteSqlText(record.createdAt)},
        ${quoteSqlText(record.updatedAt)}
      );
    `);

    return record;
  }

  async list(): Promise<RepositoryRecord[]> {
    const rows = await this.database.query<RepositoryRow>(`
      SELECT id, owner, name, visibility, bare_path, created_at, updated_at
      FROM repositories
      ORDER BY owner ASC, name ASC;
    `);
    return rows.map(toRepositoryRecord);
  }
}

function toRepositoryRecord(row: RepositoryRow): RepositoryRecord {
  return {
    id: row.id,
    owner: row.owner,
    name: row.name,
    visibility: row.visibility,
    barePath: row.bare_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
