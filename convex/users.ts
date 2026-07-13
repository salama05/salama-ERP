import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./lib/auth";
import { logAudit } from "./lib/audit";
import { getViewerContext } from "./lib/context";

export const inviteUser = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("accountant"),
      v.literal("sales_manager"),
      v.literal("inventory_manager"),
      v.literal("custom"),
      v.literal("OWNER"),
      v.literal("STAFF")
    ),
    name: v.optional(v.string()),
    customPermissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "users.manage");

    const normalizedEmail = args.email.toLowerCase().trim();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      throw new Error("A user with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: normalizedEmail,
      orgIds: [orgId],
      name: args.name,
      email: normalizedEmail,
      role: args.role,
      isActive: true,
      customPermissions: args.customPermissions,
    });

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "create",
      entityType: "user",
      entityId: userId,
      entityLabel: args.name || normalizedEmail,
      changes: [
        { field: "email", oldValue: null, newValue: normalizedEmail },
        { field: "role", oldValue: null, newValue: args.role },
      ],
    });

    return userId;
  },
});

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    return viewer;
  },
});

export const syncOrganizationMember = mutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", args.clerkUserId))
      .unique();

    if (existing) {
      // Update orgIds if not already present
      if (!existing.orgIds.includes(args.clerkOrgId)) {
        await ctx.db.patch(existing._id, {
          orgIds: [...existing.orgIds, args.clerkOrgId],
        });
      }
      return existing;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: args.clerkUserId,
      orgIds: [args.clerkOrgId],
      name: args.name,
      email: args.email,
      role: args.role as any,
      isActive: true,
    });

    return await ctx.db.get(userId);
  },
});

export const promoteSelfToOwner = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) {
      throw new Error("User record not found");
    }
    await ctx.db.patch(user._id, { role: "admin" as const });
    return { success: true };
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    return user;
  },
});

export const listUsers = query({
  args: { showInactive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    
    // Check permission using the viewer's role
    const { hasPermission } = await import("../lib/permissions");
    if (!hasPermission(viewer.role, undefined, "users.manage")) {
      throw new Error("Forbidden: Missing permission users.manage");
    }

    const allUsers = await ctx.db.query("users").collect();
    let filtered = allUsers.filter(u => u.orgIds.includes(viewer.orgId));

    if (args.showInactive === false) {
      filtered = filtered.filter(u => u.isActive !== false);
    }

    return filtered.sort((a, b) => {
      const aActive = a.isActive !== false ? 1 : 0;
      const bActive = b.isActive !== false ? 1 : 0;
      return bActive - aActive || (a.name || "").localeCompare(b.name || "");
    });
  },
});

export const deactivateUser = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "users.manage");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser || !targetUser.orgIds.includes(orgId)) {
      throw new Error("User not found or unauthorized");
    }

    if (user._id === targetUser._id) {
      throw new Error("You cannot deactivate yourself");
    }

    await ctx.db.patch(args.targetUserId, {
      isActive: false,
      deactivatedAt: Date.now(),
      deactivatedBy: user.tokenIdentifier,
    });

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "role_change",
      entityType: "user",
      entityId: args.targetUserId,
      entityLabel: targetUser.name || targetUser.email || "User",
      changes: [{ field: "isActive", oldValue: targetUser.isActive !== false, newValue: false }],
    });

    return { success: true };
  },
});

export const reactivateUser = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "users.manage");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser || !targetUser.orgIds.includes(orgId)) {
      throw new Error("User not found or unauthorized");
    }

    await ctx.db.patch(args.targetUserId, {
      isActive: true,
      deactivatedAt: undefined,
      deactivatedBy: undefined,
    });

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "role_change",
      entityType: "user",
      entityId: args.targetUserId,
      entityLabel: targetUser.name || targetUser.email || "User",
      changes: [{ field: "isActive", oldValue: targetUser.isActive !== false, newValue: true }],
    });

    return { success: true };
  },
});

export const updateRole = mutation({
  args: { 
    targetUserId: v.id("users"), 
    newRole: v.union(
      v.literal("admin"), 
      v.literal("accountant"), 
      v.literal("sales_manager"), 
      v.literal("inventory_manager"),
      v.literal("custom"), 
      v.literal("OWNER"), 
      v.literal("STAFF")
    ) 
  },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "users.manage");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser || !targetUser.orgIds.includes(orgId)) {
      throw new Error("User not found or unauthorized");
    }

    if (user._id === targetUser._id) {
      throw new Error("You cannot change your own role");
    }

    const oldRole = targetUser.role;

    await ctx.db.patch(args.targetUserId, { role: args.newRole });

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "role_change",
      entityType: "user",
      entityId: args.targetUserId,
      entityLabel: targetUser.name || targetUser.email || "User",
      changes: [{ field: "role", oldValue: oldRole, newValue: args.newRole }],
    });

    return { success: true };
  },
});

export const updateCustomPermissions = mutation({
  args: {
    targetUserId: v.id("users"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "users.manage");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser || !targetUser.orgIds.includes(orgId)) {
      throw new Error("User not found or unauthorized");
    }

    const oldPermissions = targetUser.customPermissions || [];

    await ctx.db.patch(args.targetUserId, {
      customPermissions: args.permissions,
    });

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "role_change",
      entityType: "user",
      entityId: args.targetUserId,
      entityLabel: targetUser.name || targetUser.email || "User",
      changes: [
        {
          field: "customPermissions",
          oldValue: oldPermissions,
          newValue: args.permissions,
        },
      ],
    });

    return { success: true };
  },
});
