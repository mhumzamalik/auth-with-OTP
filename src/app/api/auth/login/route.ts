import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations/auth.schemas";
import { comparePassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createSession } from "@/lib/auth/session";
import { logAuthEvent } from "@/lib/logger";
import { apiSuccess, apiError } from "@/lib/utils/response";
import { normalizeEmail } from "@/lib/utils/normalize";
import { getClientIP } from "@/lib/utils/ip";
import { parseUserAgent } from "@/lib/utils/device";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import {
  RATE_LIMIT_LOGIN_MAX,
  RATE_LIMIT_LOGIN_WINDOW_MS,
  MAX_FAILED_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_DURATION_MS,
} from "@/lib/constants";
import {
  ValidationError,
  UnauthorizedError,
  AccountLockedError,
  RateLimitError,
  APIError,
} from "@/lib/errors";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const rateLimit = checkRateLimit({
      key: `login:${ip}`,
      max: RATE_LIMIT_LOGIN_MAX,
      windowMs: RATE_LIMIT_LOGIN_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      throw new RateLimitError("Too many login attempts. Please try again in 15 minutes.");
    }

    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues);
    }

    const { email: rawEmail, password, rememberMe } = parsed.data;
    const email = normalizeEmail(rawEmail);

    await connectDB();

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      await logAuthEvent({ event: "LOGIN_FAILED", ip, userAgent, metadata: { email } });
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new AccountLockedError(user.lockUntil);
    }

    if (!user.isVerified) {
      return apiError(
        "Please verify your email address before logging in.",
        undefined,
        "EMAIL_NOT_VERIFIED",
        403
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const updateData: Record<string, unknown> = { failedLoginAttempts: newAttempts };

      if (newAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        updateData.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS);
        await User.findByIdAndUpdate(user._id, updateData);
        await logAuthEvent({
          userId: user._id,
          event: "ACCOUNT_LOCKED",
          ip,
          userAgent,
          metadata: { attempts: newAttempts },
        });
        throw new AccountLockedError(updateData.lockUntil as Date);
      }

      await User.findByIdAndUpdate(user._id, updateData);
      await logAuthEvent({
        userId: user._id,
        event: "LOGIN_FAILED",
        ip,
        userAgent,
        metadata: { attempts: newAttempts },
      });

      throw new UnauthorizedError("Invalid email or password.");
    }

    await User.findByIdAndUpdate(user._id, {
      failedLoginAttempts: 0,
      $unset: { lockUntil: 1 },
    });

    const deviceInfo = parseUserAgent(userAgent);
    const tempSessionId = "temp";

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      sessionId: tempSessionId,
    });
    const refreshToken = signRefreshToken(
      { sub: user._id.toString(), sessionId: tempSessionId },
      rememberMe
    );

    const session = await createSession(
      user._id,
      refreshToken,
      deviceInfo,
      ip,
      rememberMe
    );
    const finalAccessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      sessionId: session._id.toString(),
    });
    const finalRefreshToken = signRefreshToken(
      { sub: user._id.toString(), sessionId: session._id.toString() },
      rememberMe
    );

    const { hashRefreshToken, rotateSession } = await import("@/lib/auth/session");
    await rotateSession(session._id, finalRefreshToken);

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
      "Login successful"
    );

    setAuthCookies(response, finalAccessToken, finalRefreshToken, rememberMe);

    await logAuthEvent({
      userId: user._id,
      event: "LOGIN_SUCCESS",
      ip,
      userAgent,
      metadata: { sessionId: session._id.toString(), rememberMe },
    });

    return response;
  } catch (err) {
    if (err instanceof AccountLockedError) {
      return apiError(
        err.message,
        { lockUntil: err.lockUntil.toISOString() },
        err.code,
        err.statusCode
      );
    }
    if (err instanceof ValidationError) {
      return apiError(err.message, err.errors, err.code, err.statusCode);
    }
    if (err instanceof APIError) {
      return apiError(err.message, undefined, err.code, err.statusCode);
    }
    console.error("[LOGIN]", err);
    return apiError("An unexpected error occurred.", undefined, "INTERNAL_ERROR", 500);
  }
}
