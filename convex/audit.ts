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

    let q = ctx.db
      .query("audit_logs")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc");

    // Filtering in memory because Convex doesn't support multiple filters on indexes easily 
    // without complex index setup. For a simple audit log, this is often fine if the org size is reasonable.
    // However, we can at least filter by orgId using the index.
    
    // If we wanted to be more efficient, we could create more indexes, but let's stick to the current logic
    // but adapted for pagination.
    
    const results = await q.paginate(args.paginationOpts);

    // Apply filters to the paginated results
    // Note: This is slightly problematic with pagination because filtering after pagination 
    // might result in fewer items than requested per page.
    // A better way would be to filter in the query if possible.
    
    // Let's refine the query to filter as much as possible.
    
    let filteredQuery = ctx.db
      .query("audit_logs")
      .withIndex("by_org", (q) => q.eq("orgId", orgId));

    if (args.userId) {
      // If we have userId, we can use the by_user index (if we filter by orgId first or include orgId in index)
      // The schema has by_user: ["userId"]
      // But we also need orgId for security.
    }

    // For now, let's just use the by_org index and order by desc timestamp.
    // In Convex, we can't easily filter by multiple fields unless they are part of the same index.
    
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
