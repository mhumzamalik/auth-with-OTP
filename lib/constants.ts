/** Access token expiry (15 minutes in seconds) */
export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes

/** Default refresh token expiry (7 days in seconds) */
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

/** Extended refresh token expiry when "remember me" is checked (30 days) */
export const REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60; // 30 days

/** OTP expiry duration (10 minutes in milliseconds) */
export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/** Maximum OTP verification attempts before lockout */
export const MAX_OTP_ATTEMPTS = 3;

/** Maximum consecutive failed login attempts before account lockout */
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;

/** Account lockout duration (15 minutes in milliseconds) */
export const ACCOUNT_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** bcrypt salt rounds (cost factor) */
export const BCRYPT_ROUNDS = 12;

/** Rate limiting: max login attempts per IP per window */
export const RATE_LIMIT_LOGIN_MAX = 10;

/** Rate limiting: login window duration (15 minutes in ms) */
export const RATE_LIMIT_LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Rate limiting: max OTP send requests per email per hour */
export const RATE_LIMIT_OTP_MAX = 3;

/** Rate limiting: OTP window duration (1 hour in ms) */
export const RATE_LIMIT_OTP_WINDOW_MS = 60 * 60 * 1000;

/** Rate limiting: max register requests per IP per hour */
export const RATE_LIMIT_REGISTER_MAX = 5;

/** Rate limiting: register window duration (1 hour in ms) */
export const RATE_LIMIT_REGISTER_WINDOW_MS = 60 * 60 * 1000;

/** __Host- cookie names (requires HTTPS in production) */
export const COOKIE_ACCESS_TOKEN = "__Host-access-token";
export const COOKIE_REFRESH_TOKEN = "__Host-refresh-token";

/** Application name from env */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp";

/** Application URL from env */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
