"use client";

import { useAuthSafeContext } from "@/components/providers/convex-client-provider";

/**
 * Demo-aware wrapper for auth state.
 * Returns safe auth values in both Clerk and Demo modes without throwing.
 */
export function useAuthSafe() {
  return useAuthSafeContext();
}