import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// Routes that require OWNER role
const ownerOnlyRoutes = createRouteMatcher([
  "/analytics(.*)",
  "/settings(.*)",
  "/reports(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Requesting: ${pathname}`);

  const userAuth = await auth();
  const { userId, orgId } = userAuth;

  if (!isPublicRoute(request)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect legacy /dashboard path to /overview
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/overview", request.url));
    }

    // Force organization selection for all private routes
    if (!pathname.startsWith("/onboarding") && !orgId) {
      console.log(`[Middleware] No organization selected for ${pathname}.`);
    }

    // Check role for protected routes
    if (ownerOnlyRoutes(request)) {
      // Default to OWNER if no role is set (matching useUserRole hook default)
      const role = (userAuth.sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ?? "OWNER";

      if (role !== "OWNER") {
        console.log(`[Middleware] Access denied for role: ${role}. Redirecting to POS.`);
        return NextResponse.redirect(new URL("/pos", request.url));
      }
    }
  } else {
    // If authenticated user visits home page, redirect to overview
    if (userId && pathname === "/") {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
