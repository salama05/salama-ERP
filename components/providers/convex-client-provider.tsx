"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://example-convex.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

import { useEffect } from "react";
import { UserSync } from "./UserSync";

function TokenDebugger() {
  const { getToken } = useAuth();
  useEffect(() => {
    async function testToken() {
      try {
        const token = await getToken({ template: "convex" });
        if (!token) {
          console.error("❌ CLERK JWT TEMPLATE ERROR: Failed to get token for template 'convex'. Did you create the JWT template in the Clerk Dashboard and name it exactly 'convex'?");
        } else {
          console.log("✅ Clerk token fetched successfully!");
        }
      } catch (err) {
        console.error("❌ CLERK TOKEN ERROR:", err);
      }
    }
    testToken();
  }, [getToken]);
  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <TokenDebugger />
        <UserSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
