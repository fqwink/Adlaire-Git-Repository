import type { AuditLogRepository } from "../repositories/audit_log_repository.ts";
import type { AuditLogRecord } from "../domain/audit.ts";
import type { Principal } from "../domain/user.ts";

export interface AuditSink {
  record(input: {
    readonly actor: string;
    readonly action: string;
    readonly targetType: string;
    readonly targetId: string;
  }): Promise<void>;
}

export class AuditService implements AuditSink {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  async record(input: {
    readonly actor: string;
    readonly action: string;
    readonly targetType: string;
    readonly targetId: string;
  }): Promise<void> {
    await this.auditLogs.record({
      id: crypto.randomUUID(),
      actor: input.actor,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      createdAt: new Date().toISOString(),
    });
  }

  list(principal: Principal, limit = 100): Promise<AuditLogRecord[]> {
    if (principal.role !== "admin") {
      throw new Response("audit log access denied.", { status: 403 });
    }
    const safeLimit = Math.max(1, Math.min(limit, 500));
    return this.auditLogs.list(safeLimit);
  }
}
