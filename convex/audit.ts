import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAnyPermission } from "./lib/auth";
import { paginationOptsValidator } from "convex/server";

export const listAuditLogs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    entityType: v.optional(v.string()),
    action: v.optional(v.string()),
    userId: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAnyPermission(ctx, ["users.manage", "reports.view"]);

    const identity = await ctx.auth.getUserIdentity();
    const orgId = identity!.orgId || (identity as any).org_id || identity!.subject;

    const page = await ctx.db
      .query("audit_logs")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .filter((q) => {
        const filters = [];
        if (args.entityType) filters.push(q.eq(q.field("entityType"), args.entityType));
        if (args.action) filters.push(q.eq(q.field("action"), args.action));
        if (args.userId) filters.push(q.eq(q.field("userId"), args.userId));
        if (args.startDate) filters.push(q.gte(q.field("timestamp"), args.startDate));
        if (args.endDate) filters.push(q.lte(q.field("timestamp"), args.endDate));

        if (filters.length === 0) return true;

        // Combine filters with AND
        let combined = filters[0];
        for (let i = 1; i < filters.length; i++) {
          combined = q.and(combined, filters[i]);
        }
        return combined;
      })
      .paginate(args.paginationOpts);

    return page;
  },
});
