import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Maintenance gate.
 *
 * Enable with MAINTENANCE_MODE=true. Set MAINTENANCE_BYPASS_TOKEN to a secret
 * value to keep one path reachable for testing, e.g.
 * MAINTENANCE_BYPASS_TOKEN=abc123 lets you open /maintenance-bypass/abc123 once
 * to receive a cookie, after which normal browsing works for that browser.
 */

const MAINTENANCE_PATH = "/maintenance";
const BYPASS_COOKIE = "skilloop-maint-bypass";
const BYPASS_PATH = "/maintenance-bypass";

function isEnabled() {
  const raw = process.env.MAINTENANCE_MODE;
  return raw === "true" || raw === "1";
}

function hasValidBypassToken(request: NextRequest) {
  const secret = process.env.MAINTENANCE_BYPASS_TOKEN;
  if (!secret) return false;
  return request.nextUrl.pathname.startsWith(`${BYPASS_PATH}/${secret}`);
}

export function proxy(request: NextRequest) {
  if (!isEnabled()) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // The maintenance page itself must always render, otherwise it would rewrite
  // to itself forever.
  if (pathname === MAINTENANCE_PATH || pathname.startsWith(`${MAINTENANCE_PATH}/`)) {
    return NextResponse.next();
  }

  // Exchange the secret path for a long-lived bypass cookie.
  if (hasValidBypassToken(request)) {
    const response = NextResponse.redirect(new URL(MAINTENANCE_PATH, request.url));
    response.cookies.set(BYPASS_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  if (request.cookies.get(BYPASS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  // Rewrite rather than redirect so client-side navigations and RSC payload
  // requests are served the maintenance view without a redirect on every fetch.
  const url = request.nextUrl.clone();
  url.pathname = MAINTENANCE_PATH;
  return NextResponse.rewrite(url);
}

export const config = {
  // Without these exclusions Proxy would also intercept the CSS and JS the
  // maintenance page needs, leaving it unstyled.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|css|js|map|txt|xml|webmanifest)$).*)",
  ],
};