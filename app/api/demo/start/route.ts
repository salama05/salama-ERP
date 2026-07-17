import { NextRequest, NextResponse } from "next/server";

export const DEMO_COOKIE = "demo_session";
export const DEMO_COOKIE_VALUE = "active";
export const DEMO_DURATION_SECONDS = 30 * 60; // 30 minutes

/**
 * GET /api/demo/start
 *
 * Sets an HTTP-only demo session cookie and redirects the browser directly
 * to /overview. No Clerk involvement — the middleware is already configured
 * to recognise the cookie and skip Clerk auth checks for demo sessions.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  // Server-side redirect straight to the dashboard
  const response = NextResponse.redirect(new URL("/overview", origin));

  // Set the demo session cookie
  response.cookies.set(DEMO_COOKIE, DEMO_COOKIE_VALUE, {
    httpOnly: false, // must be readable by client JS for UI (DemoBanner)
    sameSite: "lax",
    path: "/",
    maxAge: DEMO_DURATION_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
