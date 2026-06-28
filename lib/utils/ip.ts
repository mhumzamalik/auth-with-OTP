import type { NextRequest } from "next/server";

/**
 * Extracts the real client IP address from request headers.
 * Checks multiple headers in order of reliability:
 * 1. x-real-ip (set by most reverse proxies)
 * 2. x-forwarded-for (standard proxy header, first IP in chain)
 * 3. cf-connecting-ip (Cloudflare)
 * 4. Falls back to a placeholder
 *
 * @param request - Incoming NextRequest
 * @returns Client IP address string
 */
export function getClientIP(request: NextRequest): string {
  const headers = request.headers;

  // Cloudflare
  const cfIP = headers.get("cf-connecting-ip");
  if (cfIP) return cfIP.trim();

  // Most common proxy header
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain a chain: "client, proxy1, proxy2"
    const firstIP = forwardedFor.split(",")[0]?.trim();
    if (firstIP) return firstIP;
  }

  // Nginx real IP
  const realIP = headers.get("x-real-ip");
  if (realIP) return realIP.trim();

  // Fallback
  return "0.0.0.0";
}
