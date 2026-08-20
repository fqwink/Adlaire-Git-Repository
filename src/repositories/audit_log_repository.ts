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
}
