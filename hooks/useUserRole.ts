"use client";

import { useUser } from "@clerk/nextjs";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";

export type UserRole = "OWNER" | "STAFF";

export function useUserRole(): UserRole | null {
  const isDemoMode = useIsDemoMode();
  
  // In demo mode, default to OWNER role since there's no real auth
  if (isDemoMode) {
    return "OWNER";
  }

  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  const role = user.publicMetadata?.role as UserRole | undefined;
  return role ?? "OWNER"; // Default to OWNER if not set (merchant is always the owner)
}

export function useCanViewAnalytics(): boolean {
  const role = useUserRole();
  return role === "OWNER";
}

export function useCanViewBuyPrice(): boolean {
  const role = useUserRole();
  return role === "OWNER";
}

export function useCanDeleteInvoice(): boolean {
  const role = useUserRole();
  return role === "OWNER";
}

export function useCanAccessSettings(): boolean {
  const role = useUserRole();
  return role === "OWNER";
}

export function useCanAccessPOS(): boolean {
  const role = useUserRole();
  return role === "OWNER" || role === "STAFF";
}
