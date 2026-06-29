import { createHash } from "crypto";
import Session, { type ISession } from "@/models/Session";
import { REFRESH_TOKEN_EXPIRY, REMEMBER_ME_EXPIRY } from "@/lib/constants";
import type mongoose from "mongoose";

export interface DeviceInfo {
  deviceName: string;
  browser: string;
  os: string;
}

/**
 * Hashes a refresh token using SHA-256 for database storage.
 *
 * @param token - Plain-text refresh JWT
 * @returns SHA-256 hex digest
 */
export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a new session document in MongoDB.
 *
 * @param userId - Authenticated user ObjectId
 * @param refreshToken - Plain-text refresh JWT (will be hashed)
 * @param deviceInfo - Parsed device, browser, OS info
 * @param ip - Client IP address
 * @param rememberMe - Extends session to 30 days if true
 * @returns Created session document
 */
export async function createSession(
  userId: mongoose.Types.ObjectId,
  refreshToken: string,
  deviceInfo: DeviceInfo,
  ip: string,
  rememberMe = false
): Promise<ISession> {
  const hashedRefreshToken = hashRefreshToken(refreshToken);
  const expirySeconds = rememberMe ? REMEMBER_ME_EXPIRY : REFRESH_TOKEN_EXPIRY;
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  const session = await Session.create({
    userId,
    hashedRefreshToken,
    deviceName: deviceInfo.deviceName,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    ip,
    lastActive: new Date(),
    expiresAt,
  });

  return session;
}

/**
 * Rotates a session: replaces the old hashed refresh token with the new one.
 * Also updates lastActive timestamp.
 *
 * @param sessionId - Session ObjectId to update
 * @param newRefreshToken - New plain-text refresh JWT
 * @returns Updated session document or null if not found
 */
export async function rotateSession(
  sessionId: mongoose.Types.ObjectId,
  newRefreshToken: string
): Promise<ISession | null> {
  const newHashedToken = hashRefreshToken(newRefreshToken);

  return Session.findByIdAndUpdate(
    sessionId,
    {
      hashedRefreshToken: newHashedToken,
      lastActive: new Date(),
    },
    { new: true }
  );
}

/**
 * Revokes a single session by setting revokedAt to now.
 *
 * @param sessionId - Session ObjectId to revoke
 */
export async function revokeSession(
  sessionId: mongoose.Types.ObjectId
): Promise<void> {
  await Session.findByIdAndUpdate(sessionId, { revokedAt: new Date() });
}

/**
 * Revokes all active sessions for a user except the current one.
 *
 * @param userId - User ObjectId
 * @param currentSessionId - Current session to preserve (optional)
 * @returns Count of revoked sessions
 */
export async function revokeAllUserSessions(
  userId: mongoose.Types.ObjectId,
  currentSessionId?: mongoose.Types.ObjectId
): Promise<number> {
  const filter: Record<string, unknown> = {
    userId,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  };

  if (currentSessionId) {
    filter["_id"] = { $ne: currentSessionId };
  }

  const result = await Session.updateMany(filter, {
    $set: { revokedAt: new Date() },
  });

  return result.modifiedCount;
}

/**
 * Finds an active (non-revoked, non-expired) session by hashed refresh token.
 *
 * @param hashedToken - SHA-256 hash of the refresh JWT
 * @returns Session document or null
 */
export async function findActiveSessionByToken(
  hashedToken: string
): Promise<ISession | null> {
  return Session.findOne({
    hashedRefreshToken: hashedToken,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });
}

/**
 * Gets all active sessions for a user (for dashboard display).
 *
 * @param userId - User ObjectId
 * @returns Array of active session documents
 */
export async function getActiveSessions(
  userId: mongoose.Types.ObjectId
): Promise<ISession[]> {
  return Session.find({
    userId,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ lastActive: -1 });
}
