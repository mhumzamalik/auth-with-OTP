import { createHash, timingSafeEqual } from "crypto";
import { OTP_EXPIRY_MS, MAX_OTP_ATTEMPTS } from "@/lib/constants";
import OTP, { type OtpType } from "@/models/OTP";
import type mongoose from "mongoose";

/**
 * Generates a cryptographically random 6-digit OTP.
 *
 * @returns 6-digit string OTP (zero-padded)
 */
export function generateOTP(): string {
  // Use crypto.getRandomValues for cryptographic randomness
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const num = array[0] % 1_000_000;
  return num.toString().padStart(6, "0");
}

/**
 * Hashes an OTP using SHA-256.
 * Stored in DB instead of plain text.
 *
 * @param otp - Plain-text 6-digit OTP
 * @returns SHA-256 hex digest
 */
export function hashOTP(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

/**
 * Creates and stores a new OTP document in the database.
 * Replaces any existing OTP of the same type for the user.
 *
 * @param userId - User ObjectId
 * @param type - OTP type (email-verification | password-reset)
 * @returns The plain-text OTP (to be sent via email)
 */
export async function createOTP(
  userId: mongoose.Types.ObjectId,
  type: OtpType
): Promise<string> {
  const plainOtp = generateOTP();
  const hashedOtp = hashOTP(plainOtp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // Delete any existing OTP of the same type for this user
  await OTP.deleteMany({ userId, type });

  await OTP.create({
    userId,
    hashedOtp,
    type,
    expiresAt,
    attempts: 0,
  });

  return plainOtp;
}

/**
 * Verifies an OTP for a given user and type.
 * Uses constant-time comparison to prevent timing attacks.
 * Increments attempt counter on failure.
 *
 * @param userId - User ObjectId
 * @param type - OTP type
 * @param plainOtp - Plain-text OTP submitted by user
 * @returns Object with success boolean and error message
 */
export async function verifyOTP(
  userId: mongoose.Types.ObjectId,
  type: OtpType,
  plainOtp: string
): Promise<{ valid: boolean; error?: string }> {
  const otpDoc = await OTP.findOne({ userId, type });

  if (!otpDoc) {
    return { valid: false, error: "OTP not found or already used. Request a new one." };
  }

  if (otpDoc.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return { valid: false, error: "OTP has expired. Request a new one." };
  }

  if (otpDoc.attempts >= MAX_OTP_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return {
      valid: false,
      error: `Maximum attempts exceeded. Request a new code.`,
    };
  }

  // Constant-time comparison
  const submittedHash = hashOTP(plainOtp);
  const storedHashBuf = Buffer.from(otpDoc.hashedOtp, "hex");
  const submittedHashBuf = Buffer.from(submittedHash, "hex");

  let isMatch = false;
  try {
    isMatch = timingSafeEqual(storedHashBuf, submittedHashBuf);
  } catch {
    isMatch = false;
  }

  if (!isMatch) {
    // Increment attempt counter
    await OTP.updateOne({ _id: otpDoc._id }, { $inc: { attempts: 1 } });
    const remaining = MAX_OTP_ATTEMPTS - otpDoc.attempts - 1;
    return {
      valid: false,
      error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
    };
  }

  // OTP is valid — delete it so it can't be reused
  await OTP.deleteOne({ _id: otpDoc._id });
  return { valid: true };
}
