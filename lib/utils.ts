import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names with proper conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 *
 * @param inputs - Class value inputs
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
