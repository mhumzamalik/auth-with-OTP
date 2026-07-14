import { type NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/**
 * GET /api/auth/google
 *
 * Initiates the Google OAuth 2.0 Authorization Code flow.
 * Generates a random CSRF state, stores it in a short-lived cookie,
 * and redirects the browser to Google's consent screen.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { success: false, message: "Google OAuth is not configured." },
      { status: 500 }
    );
  }

  // Generate a random state token for CSRF protection
  const state = randomBytes(32).toString("hex");

  // Preserve the callbackUrl if provided
  const callbackUrl =
    request.nextUrl.searchParams.get("callbackUrl") ?? "/dashboard";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state: `${state}:${encodeURIComponent(callbackUrl)}`,
  });

  const response = NextResponse.redirect(
    `${GOOGLE_AUTH_URL}?${params.toString()}`
  );

  // Store state in a short-lived httpOnly cookie for verification in callback
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Must be lax for cross-origin redirect
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
