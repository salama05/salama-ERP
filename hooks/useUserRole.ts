"use client";

import { useAuthSafeContext, UserRole } from "@/components/providers/convex-client-provider";

export type { UserRole };

export function useUserRole(): UserRole | null {
  const auth = useAuthSafeContext();
  return auth.userRole;
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
