import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/** Cookie name that signals an active demo session */
const DEMO_COOKIE = "demo_session";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/demo",
  "/api/demo/start",
  "/api/demo/end",
]);

// Routes that require OWNER role (blocked for demo users too)
const ownerOnlyRoutes = createRouteMatcher([
  "/analytics(.*)",
  "/settings(.*)",
  "/reports(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // ─── Demo Session Bypass ──────────────────────────────────────────────────
  // If the request carries an active demo cookie, skip Clerk auth entirely.
  // This is Solution B: demo routes are completely outside Clerk's scope.
  const demoCookie = request.cookies.get(DEMO_COOKIE);
  const isDemoSession = demoCookie?.value === "active";

  if (isDemoSession) {
    console.log(`[Middleware] 🎭 Demo session detected for: ${pathname}`);
    // Block owner-only routes even in demo mode
    if (ownerOnlyRoutes(request)) {
      console.log(`[Middleware] 🚫 Demo user blocked from owner route: ${pathname}`);
      return NextResponse.redirect(new URL("/pos", request.url));
    }
    // Allow everything else through — no Clerk check
    return NextResponse.next();
  }

  // ─── Normal Clerk Auth ────────────────────────────────────────────────────
  if (!isPublicRoute(request)) {
    console.log(`[Middleware] Checking private route: ${pathname}`);

    const userAuth = await auth();
    const { userId, orgId } = userAuth;

    if (!userId) {
      console.log(`[Middleware] ❌ No userId. Redirecting ${pathname} → /sign-in`);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    console.log(`[Middleware] ✅ userId: ${userId}`);

    // Redirect legacy /dashboard path
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/overview", request.url));
    }

    if (!pathname.startsWith("/onboarding") && !orgId) {
      console.log(`[Middleware] ⚠️  No org selected for ${pathname}.`);
    }

    // Check role for owner-only routes
    if (ownerOnlyRoutes(request)) {
      const role =
        (userAuth.sessionClaims?.publicMetadata as { role?: string } | undefined)
          ?.role ?? "OWNER";
      if (role !== "OWNER") {
        console.log(`[Middleware] 🚫 Role '${role}' denied for ${pathname}. Redirecting → /pos`);
        return NextResponse.redirect(new URL("/pos", request.url));
      }
    }
  } else {
    // Authenticated user visiting home page → send to dashboard
    const userAuth = await auth();
    if (userAuth.userId && pathname === "/") {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
