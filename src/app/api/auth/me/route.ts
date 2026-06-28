import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessTokenFromCookies } from "@/lib/auth/cookies";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { UnauthorizedError, APIError } from "@/lib/errors";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessTokenFromCookies();

    if (!accessToken) {
      throw new UnauthorizedError("Not authenticated");
    }

    const payload = verifyAccessToken(accessToken);

    await connectDB();

    const user = await User.findById(payload.sub);

    if (!user || !user.isVerified) {
      throw new UnauthorizedError("User not found");
    }

    return apiSuccess({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (err) {
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[ME]", err);
    return apiError("Unauthorized", undefined, "UNAUTHORIZED", 401);
  }
}
