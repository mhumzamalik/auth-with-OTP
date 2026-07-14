export const ACCESS_TOKEN_EXPIRY = 15 * 60;

export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;

export const REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60;

export const OTP_EXPIRY_MS = 10 * 60 * 1000;

export const MAX_OTP_ATTEMPTS = 3;

export const MAX_FAILED_LOGIN_ATTEMPTS = 3;

export const ACCOUNT_LOCK_DURATION_MS = 30 * 1000;

export const BCRYPT_ROUNDS = 12;

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MAX_LENGTH = 128;

export const RATE_LIMIT_LOGIN_MAX = 10;

export const RATE_LIMIT_LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const RATE_LIMIT_OTP_MAX = 3;

export const RATE_LIMIT_OTP_WINDOW_MS = 60 * 60 * 1000;

export const RATE_LIMIT_REGISTER_MAX = 5;

export const RATE_LIMIT_REGISTER_WINDOW_MS = 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === "production";

export const COOKIE_ACCESS_TOKEN = isProd ? "__Host-access-token" : "Host-access-token";
export const COOKIE_REFRESH_TOKEN = isProd ? "__Host-refresh-token" : "Host-refresh-token";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
