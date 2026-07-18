"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";

/**
 * Demo-aware wrapper for Clerk's OrganizationSwitcher.
 * Returns a demo placeholder when in demo mode.
 */
export function OrganizationSwitcherSafe(props: React.ComponentProps<typeof OrganizationSwitcher>) {
  const isDemoMode = useIsDemoMode();
  
  if (isDemoMode) {
    return null; // Already handled by parent component
  }
  
  return <OrganizationSwitcher {...props} />;
}

/**
 * Demo-aware wrapper for Clerk's UserButton.
 * Returns a demo placeholder when in demo mode.
 */
export function UserButtonSafe(props: React.ComponentProps<typeof UserButton>) {
  const isDemoMode = useIsDemoMode();
  
  if (isDemoMode) {
    return null; // Already handled by parent component
  }
  
  return <UserButton {...props} />;
}