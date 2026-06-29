import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { otpSchema } from "@/lib/validations/auth.schemas";
import { verifyOTP } from "@/lib/auth/otp";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { getClientIP } from "@/lib/utils/ip";
import { parseUserAgent } from "@/lib/utils/device";
import { extractFirstName } from "@/lib/utils/normalize";
import {
  ValidationError,
  NotFoundError,
  APIError,
} from "@/lib/errors";
import WelcomeEmail from "@/emails/WelcomeEmail";
import mongoose from "mongoose";
import React from "react";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const body: unknown = await request.json();
    const parsed = otpSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const { otp, userId, type } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiError("Invalid user ID", undefined, "INVALID_ID", 400);
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await verifyOTP(userObjectId, type, otp);

    if (!result.valid) {
      return apiError(result.error ?? "Invalid OTP", undefined, "INVALID_OTP", 400);
    }

    const user = await User.findById(userObjectId);
    if (!user) throw new NotFoundError("User not found");

    if (type === "email-verification") {
      
      await User.findByIdAndUpdate(userObjectId, { isVerified: true });

      
      const deviceInfo = parseUserAgent(userAgent);

      
      const tempRefresh = signRefreshToken({ sub: userId, sessionId: "temp" });
      const session = await createSession(userObjectId, tempRefresh, deviceInfo, ip);

      const accessToken = signAccessToken({
        sub: userId,
        role: user.role,
        sessionId: session._id.toString(),
      });
      const refreshToken = signRefreshToken({
        sub: userId,
        sessionId: session._id.toString(),
      });

      
      const { rotateSession } = await import("@/lib/auth/session");
      await rotateSession(session._id as mongoose.Types.ObjectId, refreshToken);

      
      await sendEmail({
        to: user.email,
        subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp"}!`,
        template: React.createElement(WelcomeEmail, {
          firstName: extractFirstName(user.fullName),
          appName: process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp",
        }),
      });

      await logAuthEvent({
        userId: userObjectId,
        event: "EMAIL_VERIFIED",
        ip,
        userAgent,
      });

      const response = apiSuccess(
        {
          user: {
            id: userId,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
        },
        "Email verified successfully! Welcome aboard."
      );

      setAuthCookies(response, accessToken, refreshToken);
      return response;
    }

    
    return apiSuccess({ userId }, "OTP verified. You may now reset your password.");
  } catch (err) {
    if (err instanceof ValidationError) {
      return apiError(err.message, err.errors, err.code, err.statusCode);
    }
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[VERIFY-OTP]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}
