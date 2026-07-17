import { NextRequest, NextResponse } from "next/server";
import { DEMO_COOKIE } from "../start/route";

/**
 * GET /api/demo/end
 * Clears the demo_session cookie and redirects to the marketing home page.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.set(DEMO_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0, // expire immediately
  });
  return response;
}
