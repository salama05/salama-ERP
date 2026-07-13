"use client";

import { useUser } from "@clerk/nextjs";

export type UserRole = "OWNER" | "STAFF";

export function useUserRole(): UserRole | null {
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
