import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies, clearAuthCookies, getRefreshTokenFromCookies } from "@/lib/auth/cookies";
import {
  hashRefreshToken,
  findActiveSessionByToken,
  rotateSession,
  revokeAllUserSessions,
} from "@/lib/auth/session";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { getClientIP } from "@/lib/utils/ip";
import { UnauthorizedError, APIError } from "@/lib/errors";
import mongoose from "mongoose";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const refreshToken = await getRefreshTokenFromCookies();

    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    // ── Verify JWT signature ───────────────────────────────────────────────
    const payload = verifyRefreshToken(refreshToken);

    await connectDB();

    // ── Hash and look up session ───────────────────────────────────────────
    const hashedToken = hashRefreshToken(refreshToken);
    const session = await findActiveSessionByToken(hashedToken);

    if (!session) {
      // ── REUSE DETECTION ────────────────────────────────────────────────
      // Token hash not found in active sessions — possible token reuse attack
      // Revoke ALL sessions for this user immediately
      const userId = new mongoose.Types.ObjectId(payload.sub);
      await revokeAllUserSessions(userId);

      await logAuthEvent({
        userId,
        event: "SUSPICIOUS_REUSE_DETECTED",
        ip,
        userAgent,
        metadata: { action: "ALL_SESSIONS_REVOKED" },
      });

      const errorResponse = apiError(
        "Security alert: suspicious token reuse detected. All sessions have been revoked. Please log in again.",
        undefined,
        "SUSPICIOUS_REUSE",
        401
      );
      clearAuthCookies(errorResponse);
      return errorResponse;
    }

    // ── Find user ──────────────────────────────────────────────────────────
    const user = await User.findById(session.userId);
    if (!user || !user.isVerified) {
      throw new UnauthorizedError("User not found or not verified");
    }

    // ── Issue new tokens ───────────────────────────────────────────────────
    const newAccessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      sessionId: session._id.toString(),
    });
    const newRefreshToken = signRefreshToken({
      sub: user._id.toString(),
      sessionId: session._id.toString(),
    });

    // ── Rotate session (update hashed token + lastActive) ──────────────────
    await rotateSession(session._id as mongoose.Types.ObjectId, newRefreshToken);

    // ── Log ────────────────────────────────────────────────────────────────
    await logAuthEvent({
      userId: user._id,
      event: "REFRESH_TOKEN_ROTATED",
      ip,
      userAgent,
      metadata: { sessionId: session._id.toString() },
    });

    const response = apiSuccess(
      {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
      "Token refreshed"
    );

    setAuthCookies(response, newAccessToken, newRefreshToken);
    return response;
  } catch (err) {
    if (err instanceof APIError) {
      const errorResponse = apiError(err.message, undefined, err.code, err.statusCode);
      clearAuthCookies(errorResponse);
      return errorResponse;
    }
    console.error("[REFRESH]", err);
    const errorResponse = apiError("Session expired. Please log in again.", undefined, "UNAUTHORIZED", 401);
    clearAuthCookies(errorResponse);
    return errorResponse;
  }
}
