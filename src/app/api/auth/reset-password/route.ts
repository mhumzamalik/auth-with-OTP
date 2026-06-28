import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { resetPasswordSchema } from "@/lib/validations/auth.schemas";
import { verifyOTP } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { revokeAllUserSessions } from "@/lib/auth/session";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { getClientIP } from "@/lib/utils/ip";
import { ValidationError, NotFoundError, APIError } from "@/lib/errors";
import mongoose from "mongoose";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const body: unknown = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const { otp, userId, password } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiError("Invalid user ID", undefined, "INVALID_ID", 400);
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ── Verify OTP ─────────────────────────────────────────────────────────
    const result = await verifyOTP(userObjectId, "password-reset", otp);
    if (!result.valid) {
      return apiError(result.error ?? "Invalid OTP", undefined, "INVALID_OTP", 400);
    }

    // ── Find user ──────────────────────────────────────────────────────────
    const user = await User.findById(userObjectId);
    if (!user) throw new NotFoundError("User not found");

    // ── Hash and save new password ─────────────────────────────────────────
    const passwordHash = await hashPassword(password);
    await User.findByIdAndUpdate(userObjectId, { passwordHash });

    // ── Revoke ALL active sessions (force logout everywhere) ───────────────
    const revokedCount = await revokeAllUserSessions(userObjectId);

    // ── Log ────────────────────────────────────────────────────────────────
    await logAuthEvent({
      userId: userObjectId,
      event: "PASSWORD_CHANGED",
      ip,
      userAgent,
      metadata: { revokedSessions: revokedCount },
    });

    // ── Clear cookies on current device ───────────────────────────────────
    const response = apiSuccess(
      {},
      "Password updated successfully. Please log in with your new password."
    );
    clearAuthCookies(response);
    return response;
  } catch (err) {
    if (err instanceof ValidationError) {
      return apiError(err.message, err.errors, err.code, err.statusCode);
    }
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[RESET-PASSWORD]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}
