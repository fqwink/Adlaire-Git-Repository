import { quoteSqlText } from "../database/sql.ts";
import type { DatabaseGateway } from "../database/gateway.ts";
import type { IssueRecord, IssueState } from "../domain/issue.ts";

interface IssueRow {
  id: string;
  repository_id: string;
  number: number;
  title: string;
  body: string;
  state: IssueState;
  author: string;
  created_at: string;
  updated_at: string;
}

export class IssueRepository {
  constructor(private readonly database: DatabaseGateway) {}

  async nextNumber(repositoryId: string): Promise<number> {
    const rows = await this.database.query<{ next_number: number }>(`
      SELECT COALESCE(MAX(number), 0) + 1 AS next_number
      FROM issues
      WHERE repository_id = ${quoteSqlText(repositoryId)};
    `);
    return rows[0]?.next_number ?? 1;
  }

  async create(record: IssueRecord): Promise<IssueRecord> {
    await this.database.execute(`
      INSERT INTO issues (id, repository_id, number, title, body, state, author, created_at, updated_at)
      VALUES (
        ${quoteSqlText(record.id)},
        ${quoteSqlText(record.repositoryId)},
        ${record.number},
        ${quoteSqlText(record.title)},
        ${quoteSqlText(record.body)},
        ${quoteSqlText(record.state)},
        ${quoteSqlText(record.author)},
        ${quoteSqlText(record.createdAt)},
        ${quoteSqlText(record.updatedAt)}
      );
    `);
    return record;
  }

  async list(repositoryId: string, state?: IssueState): Promise<IssueRecord[]> {
    const stateFilter = state === undefined
      ? ""
      : `AND state = ${quoteSqlText(state)}`;
    const rows = await this.database.query<IssueRow>(`
      SELECT id, repository_id, number, title, body, state, author, created_at, updated_at
      FROM issues
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        ${stateFilter}
      ORDER BY number DESC;
    `);
    return rows.map(toIssueRecord);
  }

  async find(
    repositoryId: string,
    number: number,
  ): Promise<IssueRecord | null> {
    const rows = await this.database.query<IssueRow>(`
      SELECT id, repository_id, number, title, body, state, author, created_at, updated_at
      FROM issues
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND number = ${number}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toIssueRecord(rows[0]);
  }

  async update(
    repositoryId: string,
    number: number,
    fields: {
      readonly title: string;
      readonly body: string;
      readonly state: IssueState;
      readonly updatedAt: string;
    },
  ): Promise<IssueRecord | null> {
    await this.database.execute(`
      UPDATE issues
      SET title = ${quoteSqlText(fields.title)},
          body = ${quoteSqlText(fields.body)},
          state = ${quoteSqlText(fields.state)},
          updated_at = ${quoteSqlText(fields.updatedAt)}
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND number = ${number};
    `);
    return await this.find(repositoryId, number);
  }
}

function toIssueRecord(row: IssueRow): IssueRecord {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    number: row.number,
    title: row.title,
    body: row.body,
    state: row.state,
    author: row.author,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
