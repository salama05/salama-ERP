import { QueryCtx, MutationCtx } from "../_generated/server";
import { Permission, hasPermission } from "../../lib/permissions";

/**
 * Ensures the user is authenticated, active, and has the required permission.
 * Returns the authenticated user object from the database.
 */
export async function requirePermission(
  ctx: QueryCtx | MutationCtx,
  permission: Permission
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  if (identity.email === "demo@salamaerp.com") {
    // Check permissions for demo user
    const granted = hasPermission("demo_user", [], permission);
    if (!granted) {
      throw new Error(`Forbidden: Missing permission ${permission}`);
    }
    return {
      user: {
        _id: "demo_user_id" as any,
        _creationTime: 0,
        tokenIdentifier: identity.tokenIdentifier,
        orgIds: ["demo_workspace"],
        name: "زائر تجريبي",
        email: "demo@salamaerp.com",
        role: "demo_user",
        isActive: true,
      },
      orgId: "demo_workspace",
    };
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is deactivated
  if (user.isActive === false) {
    throw new Error("Forbidden: Account is inactive");
  }

  // Check permissions
  const granted = hasPermission(user.role, user.customPermissions, permission);
  if (!granted) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }

  const orgId = identity.orgId || (identity as any).org_id || identity.subject;

  return { user, orgId };
}

/**
 * Ensures the user is authenticated, active, and has at least one of the required permissions.
 * Returns the authenticated user object from the database.
 */
export async function requireAnyPermission(
  ctx: QueryCtx | MutationCtx,
  permissions: Permission[]
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  if (identity.email === "demo@salamaerp.com") {
    // Check permissions for demo user
    const granted = permissions.some((p) => hasPermission("demo_user", [], p));
    if (!granted) {
      throw new Error(`Forbidden: Missing any of permissions ${permissions.join(", ")}`);
    }
    return {
      user: {
        _id: "demo_user_id" as any,
        _creationTime: 0,
        tokenIdentifier: identity.tokenIdentifier,
        orgIds: ["demo_workspace"],
        name: "زائر تجريبي",
        email: "demo@salamaerp.com",
        role: "demo_user",
        isActive: true,
      },
      orgId: "demo_workspace",
    };
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isActive === false) {
    throw new Error("Forbidden: Account is inactive");
  }

  const granted = permissions.some((p) => hasPermission(user.role, user.customPermissions, p));
  if (!granted) {
    throw new Error(`Forbidden: Missing any of permissions ${permissions.join(", ")}`);
  }

  const orgId = identity.orgId || (identity as any).org_id || identity.subject;

  return { user, orgId };
}

/**
 * Returns the current authenticated user without throwing on missing permissions,
 * useful for simple authentication checks or getting the current org.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  if (identity.email === "demo@salamaerp.com") {
    return {
      _id: "demo_user_id" as any,
      _creationTime: 0,
      tokenIdentifier: identity.tokenIdentifier,
      orgIds: ["demo_workspace"],
      name: "زائر تجريبي",
      email: "demo@salamaerp.com",
      role: "demo_user",
      isActive: true,
    } as any;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isActive === false) {
    throw new Error("Forbidden: Account is inactive");
  }

  return user;
}
