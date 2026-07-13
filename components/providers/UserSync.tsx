"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { isSignedIn, isLoaded, orgId, userId } = useAuth();
  const syncUser = useMutation(api.users.syncUser);
  const syncedRef = useRef(false);

  useEffect(() => {
    // Only run if auth is loaded, user is signed in, and we haven't synced in this session
    if (isLoaded && isSignedIn && !syncedRef.current) {
      syncedRef.current = true;
      syncUser().catch((err) => {
        console.error("Failed to sync user:", err);
      });
    }
    
    // Reset sync state if the user signs out
    if (isLoaded && !isSignedIn) {
      syncedRef.current = false;
    }
  }, [isLoaded, isSignedIn, orgId, userId, syncUser]);

  return null;
}
