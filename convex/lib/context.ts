import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

export type ViewerContext = {
  orgId: string;
  userId: string;
  role: string;
};

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function getViewerContext(
  ctx: QueryCtx | MutationCtx
): Promise<ViewerContext> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    // Return a loading/fallback context during query authentication phase.
    // This prevents queries from throwing errors and crashing the UI before
    // authentication is established.
    return {
      orgId: "loading",
      userId: "loading",
      role: "STAFF",
    };
  }

  // Fallback to personal workspace (userId) if no organization is selected
  // or if 'org_id' claim is missing from Clerk JWT template.
  const orgId = identity.orgId || (identity as any).org_id || identity.subject;

  // Fetch user from database to get role
  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  // Determine if this is a personal workspace (no real Clerk org selected).
  // In personal workspace mode, the orgId falls back to identity.subject,
  // meaning the authenticated user IS the merchant/owner.
  const isPersonalWorkspace =
    !identity.orgId && !(identity as any).org_id;

  if (!user) {
    // Auto-create user as OWNER inside Mutation context
    if ("insert" in ctx.db) {
      const db = ctx.db as any;
      const newUserId = await db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        orgIds: [orgId],
        name: identity.name || identity.givenName || "User",
        email: identity.email,
        role: "OWNER",
      });
      return {
        orgId,
        userId: String(newUserId),
        role: "OWNER",
      };
    }

    // Fall back to STAFF in read-only queries if not found in the DB yet
    return {
      orgId,
      userId: identity.subject,
      role: "STAFF",
    };
  }

  // If the user exists in DB as STAFF but is operating in a personal workspace,
  // they are the merchant/owner — auto-upgrade them to OWNER.
  if (user.role === "STAFF" && isPersonalWorkspace && "insert" in ctx.db) {
    const db = ctx.db as any;
    await db.patch(user._id, { role: "OWNER" });
    return {
      orgId,
      userId: String(user._id),
      role: "OWNER",
    };
  }

  return {
    orgId,
    userId: String(user._id),
    role: user.role,
  };
}

// Role-based permission checks
export async function requireOwnerRole(
  ctx: QueryCtx | MutationCtx
): Promise<ViewerContext> {
  const viewer = await getViewerContext(ctx);
  if (viewer.orgId === "loading") {
    throw new UnauthorizedError("User not authenticated");
  }
  if (viewer.role !== "OWNER") {
    throw new UnauthorizedError(
      "Only OWNER can perform this action. Current role: " + viewer.role
    );
  }
  return viewer;
}

export async function requireStaffOrOwnerRole(
  ctx: QueryCtx | MutationCtx
): Promise<ViewerContext> {
  const viewer = await getViewerContext(ctx);
  if (viewer.orgId === "loading") {
    throw new UnauthorizedError("User not authenticated");
  }
  if (viewer.role !== "OWNER" && viewer.role !== "STAFF") {
    throw new UnauthorizedError(
      "Invalid user role. Expected OWNER or STAFF, got: " + viewer.role
    );
  }
  return viewer;
}

export function canViewAnalytics(role: "OWNER" | "STAFF"): boolean {
  return role === "OWNER";
}

export function canViewBuyPrice(role: "OWNER" | "STAFF"): boolean {
  return role === "OWNER";
}

export function canDeleteInvoice(role: "OWNER" | "STAFF"): boolean {
  return role === "OWNER";
}

export function canAccessSettings(role: "OWNER" | "STAFF"): boolean {
  return role === "OWNER";
}

export function canAccessPOS(role: "OWNER" | "STAFF"): boolean {
  return role === "OWNER" || role === "STAFF";
}

