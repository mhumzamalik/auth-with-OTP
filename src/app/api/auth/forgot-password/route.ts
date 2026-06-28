import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations/auth.schemas";
import { createOTP } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/send";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { normalizeEmail, extractFirstName } from "@/lib/utils/normalize";
import { getClientIP } from "@/lib/utils/ip";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import {
  RATE_LIMIT_OTP_MAX,
  RATE_LIMIT_OTP_WINDOW_MS,
} from "@/lib/constants";
import { ValidationError, RateLimitError, APIError } from "@/lib/errors";
import ResetPasswordOTP from "@/emails/ResetPasswordOTP";
import React from "react";

/** Consistent response message to prevent email enumeration attacks */
const SAFE_RESPONSE_MESSAGE =
  "If this email is registered, you will receive a password reset code.";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const body: unknown = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const email = normalizeEmail(parsed.data.email);

    // ── Rate limit per email: 3 / hour ─────────────────────────────────────
    const rateLimit = checkRateLimit({
      key: `forgot:${email}`,
      max: RATE_LIMIT_OTP_MAX,
      windowMs: RATE_LIMIT_OTP_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      // Return safe message even when rate limited
      return apiSuccess({}, SAFE_RESPONSE_MESSAGE);
    }

    await connectDB();

    const user = await User.findOne({ email });

    // ── Always return same message (anti-enumeration) ──────────────────────
    if (!user || !user.isVerified) {
      return apiSuccess({}, SAFE_RESPONSE_MESSAGE);
    }

    const plainOtp = await createOTP(user._id, "password-reset");
    const firstName = extractFirstName(user.fullName);
    const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp";

    await sendEmail({
      to: email,
      subject: `Reset your ${appName} password`,
      template: React.createElement(ResetPasswordOTP, {
        otp: plainOtp,
        userName: firstName,
        appName,
      }),
    });

    await logAuthEvent({
      userId: user._id,
      event: "PASSWORD_RESET_REQUESTED",
      ip,
      userAgent,
      metadata: { email },
    });

    return apiSuccess(
      { userId: user._id.toString() },
      SAFE_RESPONSE_MESSAGE
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      return apiError(err.message, err.errors, err.code, err.statusCode);
    }
    if (err instanceof RateLimitError) {
      // Still return safe message
      return apiSuccess({}, SAFE_RESPONSE_MESSAGE);
    }
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[FORGOT-PASSWORD]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}
