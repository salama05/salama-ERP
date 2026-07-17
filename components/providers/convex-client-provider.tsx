"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { UserSync } from "./UserSync";

const DemoModeContext = createContext(false);

/** True when the active session is demo (no Clerk). */
export function useIsDemoMode() {
  return useContext(DemoModeContext);
}

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://example-convex.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

const DEMO_COOKIE = "demo_session";

/** Read `demo_session` cookie from `document.cookie` (non-HttpOnly). */
function readDemoCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${DEMO_COOKIE}=`));
}

// ─── Demo Mode Provider ───────────────────────────────────────────────────────
// In demo mode there is no Clerk session. We use the raw ConvexProvider
// so that the Convex client can still be used (queries that don't require
// auth work; those that do return undefined or throw, which pages handle
// with their own loading/empty states).
function DemoConvexProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

// ─── Clerk + Convex Debug Token ───────────────────────────────────────────────
function TokenDebugger() {
  const { getToken } = useAuth();
  useEffect(() => {
    async function testToken() {
      try {
        const token = await getToken({ template: "convex" });
        if (!token) {
          console.error(
            "❌ CLERK JWT TEMPLATE ERROR: Failed to get token for template 'convex'. " +
              "Did you create the JWT template in the Clerk Dashboard and name it exactly 'convex'?"
          );
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

// ─── Main Provider ─────────────────────────────────────────────────────────────
export function ConvexClientProvider({
  children,
  initialDemo = false,
}: {
  children: ReactNode;
  /** Set from the server by reading the demo_session cookie. */
  initialDemo?: boolean;
}) {
  const [isDemo, setIsDemo] = useState(initialDemo);

  useEffect(() => {
    setIsDemo(readDemoCookie());
  }, []);

  if (isDemo) {
    return (
      <DemoModeContext.Provider value={true}>
        <DemoConvexProvider>{children}</DemoConvexProvider>
      </DemoModeContext.Provider>
    );
  }

  return (
    <DemoModeContext.Provider value={false}>
      <ClerkProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <TokenDebugger />
          <UserSync />
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </DemoModeContext.Provider>
  );
}
