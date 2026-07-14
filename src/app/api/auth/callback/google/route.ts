import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createSession, rotateSession } from "@/lib/auth/session";
import { logAuthEvent } from "@/lib/logger";
import { getClientIP } from "@/lib/utils/ip";
import { parseUserAgent } from "@/lib/utils/device";
import { normalizeEmail } from "@/lib/utils/normalize";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * GET /api/auth/callback/google
 *
 * Handles the callback from Google's OAuth consent screen.
 * 1. Validates the CSRF state
 * 2. Exchanges the authorization code for tokens
 * 3. Fetches user profile from Google
 * 4. Finds or creates a user in MongoDB
 * 5. Creates a session, signs JWTs, sets auth cookies
 * 6. Redirects to the dashboard
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle Google-side errors (user denied access, etc.)
    if (error) {
      console.error("[GOOGLE_OAUTH] Google returned error:", error);
      return NextResponse.redirect(
        `${appUrl}/login?error=google_denied`
      );
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        `${appUrl}/login?error=google_invalid`
      );
    }

    // --- CSRF state validation ---
    const storedState = request.cookies.get("google_oauth_state")?.value;
    const [receivedState, encodedCallbackUrl] = stateParam.split(":");
    const callbackUrl = encodedCallbackUrl
      ? decodeURIComponent(encodedCallbackUrl)
      : "/dashboard";

    if (!storedState || storedState !== receivedState) {
      console.error("[GOOGLE_OAUTH] State mismatch — possible CSRF attack");
      return NextResponse.redirect(
        `${appUrl}/login?error=google_csrf`
      );
    }

    // --- Exchange code for tokens ---
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("[GOOGLE_OAUTH] Token exchange failed:", errBody);
      return NextResponse.redirect(
        `${appUrl}/login?error=google_token_failed`
      );
    }

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    // --- Fetch user profile from Google ---
    const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error("[GOOGLE_OAUTH] Failed to fetch user info");
      return NextResponse.redirect(
        `${appUrl}/login?error=google_profile_failed`
      );
    }

    const googleUser = (await userInfoRes.json()) as GoogleUserInfo;
    const email = normalizeEmail(googleUser.email);

    // --- Find or create user ---
    await connectDB();

    // First, try to find by googleId (returning user)
    let user = await User.findOne({ googleId: googleUser.sub });

    if (!user) {
      // Try to find by email (existing email/password user linking Google)
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleUser.sub;
        if (!user.avatar && googleUser.picture) {
          user.avatar = googleUser.picture;
        }
        user.isVerified = true; // Google verifies email
        await user.save();
      } else {
        // Create a brand new user (Google sign-up)
        user = await User.create({
          fullName: googleUser.name || `${googleUser.given_name ?? ""} ${googleUser.family_name ?? ""}`.trim() || "Google User",
          email,
          googleId: googleUser.sub,
          isVerified: true, // Google-verified email
          role: "user",
          avatar: googleUser.picture ?? undefined,
        });
      }
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return NextResponse.redirect(
        `${appUrl}/login?error=account_locked`
      );
    }

    // --- Create session and sign tokens ---
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") ?? "";
    const deviceInfo = parseUserAgent(userAgent);

    // Create session with temporary token first
    const tempAccessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      sessionId: "temp",
    });
    const tempRefreshToken = signRefreshToken(
      { sub: user._id.toString(), sessionId: "temp" },
      false
    );

    const session = await createSession(
      user._id,
      tempRefreshToken,
      deviceInfo,
      ip,
      false
    );

    // Re-sign with the real session ID
    const finalAccessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      sessionId: session._id.toString(),
    });
    const finalRefreshToken = signRefreshToken(
      { sub: user._id.toString(), sessionId: session._id.toString() },
      false
    );

    // Update session with the final refresh token hash
    await rotateSession(session._id, finalRefreshToken);

    // --- Set cookies and redirect ---
    const response = NextResponse.redirect(`${appUrl}${callbackUrl}`);
    setAuthCookies(response, finalAccessToken, finalRefreshToken, false);

    // Clear the OAuth state cookie
    response.cookies.set("google_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    // Log the event
    await logAuthEvent({
      userId: user._id,
      event: "GOOGLE_LOGIN",
      ip,
      userAgent,
      metadata: {
        googleId: googleUser.sub,
        sessionId: session._id.toString(),
        isNewUser: !user.createdAt || (Date.now() - user.createdAt.getTime()) < 5000,
      },
    });

    return response;
  } catch (err) {
    console.error("[GOOGLE_OAUTH] Callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/login?error=google_internal`
    );
  }
}
