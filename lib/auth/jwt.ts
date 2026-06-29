import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/lib/errors";

export interface AccessTokenPayload {
  sub: string;      // userId
  role: string;
  sessionId: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;      // userId
  sessionId: string;
  type: "refresh";
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES ?? "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES ?? "7d";

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "JWT secrets are not defined. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET."
  );
}

/**
 * Signs a new access token (15 minute default expiry).
 *
 * @param payload - { sub: userId, role, sessionId }
 * @returns Signed JWT string
 */
export function signAccessToken(
  payload: Omit<AccessTokenPayload, "type">
): string {
  return jwt.sign({ ...payload, type: "access" }, ACCESS_SECRET!, {
    expiresIn: ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

/**
 * Signs a new refresh token (7 day default expiry).
 *
 * @param payload - { sub: userId, sessionId }
 * @param rememberMe - If true, extends expiry to 30 days
 * @returns Signed JWT string
 */
export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "type">,
  rememberMe = false
): string {
  const expiresIn = rememberMe ? "30d" : REFRESH_EXPIRES;
  return jwt.sign({ ...payload, type: "refresh" }, REFRESH_SECRET!, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

/**
 * Verifies and decodes an access token.
 * Throws UnauthorizedError if invalid or expired.
 *
 * @param token - JWT string from cookie
 * @returns Decoded AccessTokenPayload
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET!, {
      algorithms: ["HS256"],
    }) as AccessTokenPayload;

    if (decoded.type !== "access") {
      throw new UnauthorizedError("Invalid token type");
    }

    return decoded;
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
}

/**
 * Verifies and decodes a refresh token.
 * Throws UnauthorizedError if invalid or expired.
 *
 * @param token - JWT string from cookie
 * @returns Decoded RefreshTokenPayload
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET!, {
      algorithms: ["HS256"],
    }) as RefreshTokenPayload;

    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Invalid token type");
    }

    return decoded;
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Refresh token expired");
    }
    throw new UnauthorizedError("Invalid refresh token");
  }
}
