"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";

/**
 * Demo-aware wrapper for Clerk's useAuth hook.
 * Returns safe values when in demo mode (no Clerk session).
 */
export function useAuthSafe() {
  const isDemoMode = useIsDemoMode();
  const clerkAuth = useClerkAuth();

  if (isDemoMode) {
    return {
      userId: "demo-user-id",
      orgId: "demo-org-id",
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => "demo-token",
    };
  }

  return clerkAuth;
}