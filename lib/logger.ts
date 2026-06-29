import { connectDB } from "@/lib/db";
import AuthLog, { type AuthEventType } from "@/models/AuthLog";
import type mongoose from "mongoose";

interface LogAuthEventOptions {
  userId?: mongoose.Types.ObjectId | string;
  event: AuthEventType;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an authentication event to the AuthLog collection and console.
 * Fails silently to avoid disrupting the main auth flow.
 *
 * @param options - Event details including userId, event type, IP, and metadata
 */
export async function logAuthEvent(options: LogAuthEventOptions): Promise<void> {
  const { userId, event, ip = "0.0.0.0", userAgent = "", metadata = {} } = options;

  
  console.log(
    `[AUTH] ${new Date().toISOString()} | ${event} | ip=${ip} | userId=${userId ?? "anonymous"}`
  );

  try {
    await connectDB();
    await AuthLog.create({
      userId: userId ?? undefined,
      event,
      ip,
      userAgent,
      metadata,
    });
  } catch (err) {
    console.error("[AUTH LOGGER] Failed to write auth log:", err);
  }
}
