import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { clearAuthCookies, getRefreshTokenFromCookies, getAccessTokenFromCookies } from "@/lib/auth/cookies";
import { hashRefreshToken, revokeSession } from "@/lib/auth/session";
import Session from "@/models/Session";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { getClientIP } from "@/lib/utils/ip";
import { APIError } from "@/lib/errors";
import mongoose from "mongoose";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    await connectDB();

    const accessToken = await getAccessTokenFromCookies();
    const refreshToken = await getRefreshTokenFromCookies();

    let userId: string | undefined;
    let sessionId: string | undefined;

    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        userId = payload.sub;
        sessionId = payload.sessionId;
      } catch {
      }
    }

    if (refreshToken) {
      const hashedToken = hashRefreshToken(refreshToken);
      const session = await Session.findOne({ hashedRefreshToken: hashedToken });

      if (session) {
        userId = userId ?? session.userId.toString();
        await revokeSession(session._id as mongoose.Types.ObjectId);
      }
    } else if (sessionId) {
      try {
        await revokeSession(new mongoose.Types.ObjectId(sessionId));
      } catch {
      }
    }

    if (userId) {
      await logAuthEvent({
        userId: userId as unknown as mongoose.Types.ObjectId,
        event: "LOGOUT",
        ip,
        userAgent,
        metadata: { sessionId },
      });
    }

    const response = apiSuccess({}, "Logged out successfully");
    clearAuthCookies(response);
    return response;
  } catch (err) {
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[LOGOUT]", err);
    // Always clear cookies even on error
    const response = apiSuccess({}, "Logged out");
    clearAuthCookies(response);
    return response;
  }
}
