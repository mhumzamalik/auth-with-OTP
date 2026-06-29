import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { BCRYPT_ROUNDS } from "@/lib/constants";

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param password - Plain-text password
 * @returns bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compares a plain-text password against a bcrypt hash using timing-safe comparison.
 * Uses timingSafeEqual on the intermediate result to prevent timing attacks.
 *
 * @param password - Plain-text password to verify
 * @param hash - bcrypt hash stored in database
 * @returns True if password matches
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  
  const isMatch = await bcrypt.compare(password, hash);

  const a = Buffer.from(isMatch ? "1" : "0");
  const b = Buffer.from("1");
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Validates password strength requirements.
 * Returns null if valid, or an error message string.
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 *
 * @param password - Password to validate
 * @returns null if valid, error message if invalid
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
}

/**
 * Returns a strength score (0-4) for UI rendering.
 * 0 = very weak, 4 = very strong
 *
 * @param password - Password to score
 * @returns Score from 0 to 4
 */
export function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
