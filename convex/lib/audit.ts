import { MutationCtx } from "../_generated/server";

interface AuditLogOptions {
  orgId: string;
  userId: string;
  userName: string;
  action: "void" | "create" | "update" | "delete" | "price_change" | "stock_adjustment" | "login" | "role_change";
  entityType: string;
  entityId: string;
  entityLabel: string;
  changes?: any;
}

/**
 * Inserts a record into the audit_logs table.
 */
export async function logAudit(ctx: MutationCtx, options: AuditLogOptions) {
  await ctx.db.insert("audit_logs", {
    orgId: options.orgId,
    userId: options.userId,
    userName: options.userName,
    action: options.action,
    entityType: options.entityType,
    entityId: options.entityId,
    entityLabel: options.entityLabel,
    changes: options.changes,
    timestamp: Date.now(),
  });
}
