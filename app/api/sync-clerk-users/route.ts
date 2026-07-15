import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const clerk = await clerkClient();

    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const syncedUsers = [];
    const skippedMemberships: string[] = [];

    for (const membership of memberships.data) {
      if (!membership.publicUserData?.userId) {
        console.warn(`Skipping membership ${membership.id}: missing publicUserData`);
        skippedMemberships.push(membership.id);
        continue;
      }

      const user = await clerk.users.getUser(membership.publicUserData.userId);

      const appRole = membership.role === "admin" ? "admin" : "STAFF";

      const convexUser = await fetchMutation(api.users.syncOrganizationMember, {
        clerkUserId: user.id,
        clerkOrgId: orgId,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName || user.username || "Unknown",
        role: appRole,
      });

      syncedUsers.push({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName,
        role: appRole,
        convexId: convexUser?._id,
      });
    }

    return NextResponse.json({
      success: true,
      synced: syncedUsers.length,
      skipped: skippedMemberships.length,
      users: syncedUsers,
    });
  } catch (error) {
    console.error("Error syncing Clerk users:", error);
    return NextResponse.json(
      { error: "Failed to sync users", details: String(error) },
      { status: 500 }
    );
  }
}
