import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessTokenFromCookies } from "@/lib/auth/cookies";
import {
  getActiveSessions,
  revokeSession,
  hashRefreshToken,
} from "@/lib/auth/session";
import { getRefreshTokenFromCookies } from "@/lib/auth/cookies";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { getClientIP } from "@/lib/utils/ip";
import { UnauthorizedError, NotFoundError, APIError } from "@/lib/errors";
import Session from "@/models/Session";
import mongoose from "mongoose";
import { formatDistanceToNow } from "date-fns";

/**
 * GET /api/auth/sessions — Returns all active sessions for the current user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) throw new UnauthorizedError();

    const payload = verifyAccessToken(accessToken);
    await connectDB();

    const sessions = await getActiveSessions(
      new mongoose.Types.ObjectId(payload.sub)
    );

    // Determine current session by refresh token
    const refreshToken = await getRefreshTokenFromCookies();
    const currentHash = refreshToken ? hashRefreshToken(refreshToken) : null;

    const sessionData = sessions.map((s) => ({
      id: s._id.toString(),
      deviceName: s.deviceName,
      browser: s.browser,
      os: s.os,
      ip: s.ip,
      lastActive: s.lastActive,
      lastActiveRelative: formatDistanceToNow(s.lastActive, { addSuffix: true }),
      expiresAt: s.expiresAt,
      isCurrent: currentHash !== null && s.hashedRefreshToken === currentHash,
      createdAt: s.createdAt,
    }));

    return apiSuccess(sessionData, "Sessions retrieved");
  } catch (err) {
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[SESSIONS GET]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}

/**
 * DELETE /api/auth/sessions?id=<sessionId> — Revokes a specific session
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) throw new UnauthorizedError();

    const payload = verifyAccessToken(accessToken);
    const sessionId = request.nextUrl.searchParams.get("id");

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return apiError("Valid session ID is required", undefined, "INVALID_ID", 400);
    }

    await connectDB();

    const session = await Session.findById(sessionId);
    if (!session) throw new NotFoundError("Session not found");

    // Ensure the session belongs to the current user
    if (session.userId.toString() !== payload.sub) {
      throw new UnauthorizedError("Cannot revoke another user's session");
    }

    await revokeSession(new mongoose.Types.ObjectId(sessionId));

    await logAuthEvent({
      userId: new mongoose.Types.ObjectId(payload.sub),
      event: "SESSION_REVOKED",
      ip,
      userAgent,
      metadata: { sessionId },
    });

    return apiSuccess({}, "Session revoked successfully");
  } catch (err) {
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[SESSIONS DELETE]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}
