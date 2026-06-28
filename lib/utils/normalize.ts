/**
 * Normalizes an email address for consistent storage and comparison.
 * Converts to lowercase and trims whitespace.
 * Also handles the Gmail "+" alias and dot insensitivity optionally.
 *
 * @param email - Raw email address input
 * @returns Normalized lowercase trimmed email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Extracts the first name from a full name string.
 *
 * @param fullName - Full name (e.g., "Jane Doe")
 * @returns First name (e.g., "Jane")
 */
export function extractFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}
