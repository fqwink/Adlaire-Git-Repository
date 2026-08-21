import { quoteSqlText } from "../database/sql.ts";
import type { DatabaseGateway } from "../database/gateway.ts";
import type { AuditLogRecord } from "../domain/audit.ts";

export class AuditLogRepository {
  constructor(private readonly database: DatabaseGateway) {}

  async record(log: AuditLogRecord): Promise<void> {
    await this.database.execute(`
      INSERT INTO audit_logs (id, actor, action, target_type, target_id, created_at)
      VALUES (
        ${quoteSqlText(log.id)},
        ${quoteSqlText(log.actor)},
        ${quoteSqlText(log.action)},
        ${quoteSqlText(log.targetType)},
        ${quoteSqlText(log.targetId)},
        ${quoteSqlText(log.createdAt)}
      );
    `);
  }

  async list(limit: number): Promise<AuditLogRecord[]> {
    const rows = await this.database.query<AuditLogRow>(`
      SELECT id, actor, action, target_type, target_id, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ${limit};
    `);
    return rows.map(toAuditLogRecord);
  }
}

interface AuditLogRow {
  id: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

function toAuditLogRecord(row: AuditLogRow): AuditLogRecord {
  return {
    id: row.id,
    actor: row.actor,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    createdAt: row.created_at,
  };
}
