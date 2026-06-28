import { type NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REMEMBER_ME_EXPIRY,
} from "@/lib/constants";

/** Determines if we're in a secure context (HTTPS required for __Host- cookies) */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Sets auth cookies on a NextResponse object.
 * Uses __Host- prefix which requires: Secure, Path=/, no Domain attribute.
 *
 * @param response - NextResponse to set cookies on
 * @param accessToken - Signed access JWT
 * @param refreshToken - Signed refresh JWT
 * @param rememberMe - If true, extends refresh cookie to 30 days
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe = false
): void {
  const refreshMaxAge = rememberMe ? REMEMBER_ME_EXPIRY : REFRESH_TOKEN_EXPIRY;

  response.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  response.cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: refreshMaxAge,
  });
}

/**
 * Clears auth cookies on a NextResponse object.
 * Sets cookies to empty string with maxAge=0 to immediately expire them.
 *
 * @param response - NextResponse to clear cookies on
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(COOKIE_ACCESS_TOKEN, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(COOKIE_REFRESH_TOKEN, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Reads the access token from the Next.js cookie store (server components / route handlers).
 *
 * @returns Access token string or null
 */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_ACCESS_TOKEN)?.value ?? null;
}

/**
 * Reads the refresh token from the Next.js cookie store (server components / route handlers).
 *
 * @returns Refresh token string or null
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_REFRESH_TOKEN)?.value ?? null;
}
