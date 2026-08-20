import type { AuditLogRepository } from "../repositories/audit_log_repository.ts";

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
      createdAt: new Date().toISOString()
    });
  }
}
