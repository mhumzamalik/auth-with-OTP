import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { resendOtpSchema } from "@/lib/validations/auth.schemas";
import { createOTP } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/send";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { getClientIP } from "@/lib/utils/ip";
import {
  checkRateLimit,
} from "@/lib/utils/rateLimit";
import { extractFirstName } from "@/lib/utils/normalize";
import {
  RATE_LIMIT_OTP_MAX,
  RATE_LIMIT_OTP_WINDOW_MS,
} from "@/lib/constants";
import {
  ValidationError,
  RateLimitError,
  NotFoundError,
  APIError,
} from "@/lib/errors";
import VerificationOTP from "@/emails/VerificationOTP";
import ResetPasswordOTP from "@/emails/ResetPasswordOTP";
import mongoose from "mongoose";
import React from "react";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const body: unknown = await request.json();
    const parsed = resendOtpSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const { userId, type } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiError("Invalid user ID", undefined, "INVALID_ID", 400);
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userObjectId);

    if (!user) throw new NotFoundError("User not found");

    // ── Rate limit by email: 3 OTPs / hour ────────────────────────────────
    const rateLimit = checkRateLimit({
      key: `otp:${user.email}:${type}`,
      max: RATE_LIMIT_OTP_MAX,
      windowMs: RATE_LIMIT_OTP_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      throw new RateLimitError("Too many OTP requests. Please wait before requesting another code.");
    }

    const plainOtp = await createOTP(userObjectId, type);
    const firstName = extractFirstName(user.fullName);
    const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp";

    if (type === "email-verification") {
      await sendEmail({
        to: user.email,
        subject: `Your ${appName} verification code`,
        template: React.createElement(VerificationOTP, {
          otp: plainOtp,
          userName: firstName,
          appName,
        }),
      });
    } else {
      await sendEmail({
        to: user.email,
        subject: `Your ${appName} password reset code`,
        template: React.createElement(ResetPasswordOTP, {
          otp: plainOtp,
          userName: firstName,
          appName,
        }),
      });
    }

    await logAuthEvent({
      userId: userObjectId,
      event: "PASSWORD_RESET_REQUESTED",
      ip,
      userAgent,
      metadata: { type },
    });

    return apiSuccess({}, "A new verification code has been sent to your email.");
  } catch (err) {
    if (err instanceof ValidationError) {
      return apiError(err.message, err.errors, err.code, err.statusCode);
    }
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[RESEND-OTP]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}
