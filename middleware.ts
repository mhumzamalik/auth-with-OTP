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


const TRUSTED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
];


function buildSecurityHeaders(nonce: string): Record<string, string> {
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://accounts.google.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join("; ");

  return {
    "Content-Security-Policy": csp,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "X-Nonce": nonce,
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
  const { pathname, origin } = request.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const securityHeaders = buildSecurityHeaders(nonce);


  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    pathname.startsWith("/api/")
  ) {
    const requestOrigin = request.headers.get("origin");
    if (requestOrigin && !TRUSTED_ORIGINS.includes(requestOrigin)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Forbidden: invalid origin" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const accessToken = request.cookies.get("__Host-access-token")?.value;
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
      "__Host-refresh-token"
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
  response.headers.set("x-nonce", nonce);
  return response;
}

export const config = {
  matcher: [

    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
