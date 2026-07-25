"use client";

import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { UserSync } from "./UserSync";

export type UserRole = "OWNER" | "STAFF";

export type AuthSafeValue = {
  userId: string | null | undefined;
  orgId: string | null | undefined;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  getToken: (options?: any) => Promise<string | null>;
  userRole: UserRole | null;
  user: any;
};

const DEFAULT_DEMO_AUTH: AuthSafeValue = {
  userId: "demo-user-id",
  orgId: "demo-org-id",
  isLoaded: true,
  isSignedIn: true,
  getToken: async () => "demo-token",
  userRole: "OWNER",
  user: {
    id: "demo-user-id",
    fullName: "زائر تجريبي",
    primaryEmailAddress: { emailAddress: "demo@salamaerp.com" },
    publicMetadata: { role: "OWNER" },
  },
};

const DemoModeContext = createContext(false);
const AuthSafeContext = createContext<AuthSafeValue>(DEFAULT_DEMO_AUTH);

/** True when the active session is demo (no Clerk). */
export function useIsDemoMode() {
  return useContext(DemoModeContext);
}

/** Hook to access safe auth data in both Clerk and Demo modes. */
export function useAuthSafeContext() {
  return useContext(AuthSafeContext);
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
function DemoConvexProvider({ children }: { children: ReactNode }) {
  return (
    <AuthSafeContext.Provider value={DEFAULT_DEMO_AUTH}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </AuthSafeContext.Provider>
  );
}

// ─── Clerk Auth Bridge (runs INSIDE <ClerkProvider>) ──────────────────────────
function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const role = (user?.publicMetadata?.role as UserRole | undefined) ?? "OWNER";

  const value: AuthSafeValue = {
    ...auth,
    userRole: isUserLoaded && user ? role : "OWNER",
    user,
  };

  return (
    <AuthSafeContext.Provider value={value}>
      {children}
    </AuthSafeContext.Provider>
  );
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
          <ClerkAuthBridge>
            <TokenDebugger />
            <UserSync />
            {children}
          </ClerkAuthBridge>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </DemoModeContext.Provider>
  );
}
