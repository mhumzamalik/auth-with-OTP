import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessTokenFromCookies, getRefreshTokenFromCookies } from "@/lib/auth/cookies";
import { hashRefreshToken, revokeAllUserSessions } from "@/lib/auth/session";
import Session from "@/models/Session";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { getClientIP } from "@/lib/utils/ip";
import { UnauthorizedError, APIError } from "@/lib/errors";
import mongoose from "mongoose";

/**
 * POST /api/auth/revoke-all — Revokes all sessions except the current one
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) throw new UnauthorizedError();

    const payload = verifyAccessToken(accessToken);
    const userId = new mongoose.Types.ObjectId(payload.sub);

    await connectDB();

    // Find current session to exclude from revocation
    const refreshToken = await getRefreshTokenFromCookies();
    let currentSessionId: mongoose.Types.ObjectId | undefined;

    if (refreshToken) {
      const hashedToken = hashRefreshToken(refreshToken);
      const currentSession = await Session.findOne({
        hashedRefreshToken: hashedToken,
        revokedAt: { $exists: false },
      });
      if (currentSession) {
        currentSessionId = currentSession._id as mongoose.Types.ObjectId;
      }
    }

    const revokedCount = await revokeAllUserSessions(userId, currentSessionId);

    // Log one event per revocation batch
    await logAuthEvent({
      userId,
      event: "SESSION_REVOKED",
      ip,
      userAgent,
      metadata: { revokedCount, action: "REVOKE_ALL_OTHER" },
    });

    return apiSuccess(
      { revokedCount },
      `Successfully signed out of ${revokedCount} other device${revokedCount !== 1 ? "s" : ""}.`
    );
  } catch (err) {
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[REVOKE-ALL]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}
