import { auth, clerkClient } from "@clerk/nextjs/server";

export type UserRole = "OWNER" | "STAFF";

export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const role = user.publicMetadata?.role as UserRole;

    return role || "STAFF"; // Default to STAFF if not set
  } catch {
    return null;
  }
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    });
  } catch (error) {
    console.error("Failed to set user role:", error);
    throw error;
  }
}

export async function getOrganizationMembers() {
  try {
    const { orgId } = await auth();
    if (!orgId) return [];

    const clerk = await clerkClient();

    const org = await clerk.organizations.getOrganization({
      organizationId: orgId,
    });

    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    return memberships.data.map((membership) => ({
      userId: membership.publicUserData?.userId,
      email: membership.publicUserData?.identifier,
      role: membership.role, // "admin" or "member"
    }));
  } catch {
    return [];
  }
}

// Helper to map Clerk roles to app roles
export function mapClerkRoleToAppRole(clerkRole: string): UserRole {
  // admin in Clerk organization = OWNER in app
  // member in Clerk organization = STAFF in app
  return clerkRole === "admin" ? "OWNER" : "STAFF";
}
