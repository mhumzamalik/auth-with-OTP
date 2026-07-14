import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";


const PROTECTED_ROUTES = ["/dashboard"];


const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];


function buildSecurityHeaders(): Record<string, string> {
  const isProd = process.env.NODE_ENV === "production";

  // In production, use 'self' + 'unsafe-inline' for scripts.
  // Nonce-based 'strict-dynamic' requires deep Next.js integration
  // (experimental.serverActions nonce) which is not configured.
  // Without that integration, Next.js scripts are blocked and the page never hydrates.
  const scriptSrc = isProd
    ? `script-src 'self' 'unsafe-inline' https://accounts.google.com`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com`;

  const connectSrc = isProd
    ? `connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com`
    : `connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:* https://localhost:*`;

  const csp = [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com`,
    connectSrc,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://accounts.google.com`,
    `object-src 'none'`,
  ].join("; ");

  return {
    "Content-Security-Policy": csp,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  };
}


async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_ACCESS_SECRET ?? ""
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}


export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const securityHeaders = buildSecurityHeaders();

  // ── CSRF origin check for mutating API requests ──────────────────────────
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    pathname.startsWith("/api/")
  ) {
    const requestOrigin = request.headers.get("origin");
    if (requestOrigin) {
      // Trust the request's own origin (same-origin) and any explicitly configured URL
      const requestHost = request.nextUrl.origin;
      const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const trustedOrigins = new Set([
        requestHost,
        configuredUrl,
        // Also trust without trailing slash
        configuredUrl.replace(/\/$/, ""),
      ]);

      if (!trustedOrigins.has(requestOrigin)) {
        return new NextResponse(
          JSON.stringify({ success: false, message: "Forbidden: invalid origin" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isProd = process.env.NODE_ENV === "production";
  const accessCookieName = isProd ? "__Host-access-token" : "Host-access-token";
  const refreshCookieName = isProd ? "__Host-refresh-token" : "Host-refresh-token";

  const accessToken = request.cookies.get(accessCookieName)?.value;
  const isAuthenticated = accessToken
    ? await verifyAccessToken(accessToken)
    : false;


  if (isAuthRoute && isAuthenticated) {
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }


  if (isProtected && !isAuthenticated) {

    const refreshToken = request.cookies.get(
      refreshCookieName
    )?.value;

    if (refreshToken) {
      // Let the client-side refresh flow handle it; redirect to login with callback
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // ── Allow request, add security headers ──────────────────────────────────
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [

    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
