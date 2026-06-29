import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations/auth.schemas";
import { hashPassword } from "@/lib/auth/password";
import { createOTP } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/send";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { normalizeEmail, extractFirstName } from "@/lib/utils/normalize";
import { getClientIP } from "@/lib/utils/ip";
import {
  checkRateLimit,
  resetRateLimit,
} from "@/lib/utils/rateLimit";
import {
  RATE_LIMIT_REGISTER_MAX,
  RATE_LIMIT_REGISTER_WINDOW_MS,
} from "@/lib/constants";
import {
  ValidationError,
  ConflictError,
  RateLimitError,
  APIError,
} from "@/lib/errors";
import VerificationOTP from "@/emails/VerificationOTP";
import React from "react";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const rateLimit = checkRateLimit({
      key: `register:${ip}`,
      max: RATE_LIMIT_REGISTER_MAX,
      windowMs: RATE_LIMIT_REGISTER_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      throw new RateLimitError(
        "Too many registration attempts. Please try again later."
      );
    }

    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const { fullName, email: rawEmail, password } = parsed.data;
    const email = normalizeEmail(rawEmail);

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError(
        "An account with this email already exists. Please log in."
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      isVerified: false,
      role: "user",
    });

    const plainOtp = await createOTP(user._id, "email-verification");
    const firstName = extractFirstName(fullName);

    await sendEmail({
      to: email,
      subject: `Verify your ${process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp"} account`,
      template: React.createElement(VerificationOTP, {
        otp: plainOtp,
        userName: firstName,
        appName: process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp",
      }),
    });

    resetRateLimit(`register:${ip}`);

    await logAuthEvent({
      userId: user._id,
      event: "USER_REGISTERED",
      ip,
      userAgent,
      metadata: { email, fullName },
    });

    return apiSuccess(
      { userId: user._id.toString() },
      "Account created! Please check your email for the verification code.",
      201
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      return apiError(err.message, err.errors, err.code, err.statusCode);
    }
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[REGISTER]", err);
    return apiError("An unexpected error occurred. Please try again.", undefined, "INTERNAL_ERROR", 500);
  }
}
