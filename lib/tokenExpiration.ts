import { useAuthStore } from "./authStore";
import { useAdminAuthStore } from "./adminAuthStore";

let isUserRedirecting = false;
let isAdminRedirecting = false;

/**
 * Safely checks if a JWT token has expired based on its `exp` claim.
 * If the token is not a valid 3-part JWT, returns false so API 401 handling can take care of it.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp === "number") {
      // payload.exp is in seconds; expired if current time >= exp * 1000
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Returns remaining milliseconds until token expiration, or null if cannot be determined.
 */
export function getTokenTimeRemainingMs(token: string | null): number | null {
  if (!token) return 0;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 - Date.now();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resets redirection debouncing flags (e.g. after successful login).
 */
export function resetRedirectFlags(): void {
  isUserRedirecting = false;
  isAdminRedirecting = false;
}

/**
 * Handles expired user session: clears user auth store and routes to /signin.
 */
export function handleUserTokenExpired(): void {
  if (typeof window === "undefined") return;

  // Clear user auth state
  try {
    useAuthStore.getState().logout();
  } catch {
    useAuthStore.setState({ token: null, user: null, error: null });
  }

  const pathname = window.location.pathname;
  const isPublicPage =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname === "/" ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/cookies") ||
    pathname.startsWith("/maintenance");

  if (!isPublicPage && !pathname.startsWith("/admin")) {
    if (isUserRedirecting) return;
    isUserRedirecting = true;
    window.location.replace("/signin");
  }
}

/**
 * Handles expired admin session: clears admin auth store and routes to /admin/login.
 */
export function handleAdminTokenExpired(): void {
  if (typeof window === "undefined") return;

  // Clear admin auth state
  try {
    useAdminAuthStore.getState().logout();
  } catch {
    useAdminAuthStore.setState({ token: null, admin: null, error: null });
  }

  const pathname = window.location.pathname;
  const isAdminAuthPage =
    pathname === "/admin/login" || pathname === "/admin/register";

  if (pathname.startsWith("/admin") && !isAdminAuthPage) {
    if (isAdminRedirecting) return;
    isAdminRedirecting = true;
    window.location.replace("/admin/login");
  }
}

const EXCLUDED_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/google",
  "/admin/login",
  "/admin/register",
];

function isAuthEndpoint(url: string): boolean {
  return EXCLUDED_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

let fetchInterceptorInstalled = false;

/**
 * Installs a lightweight fetch interceptor on window.fetch that catches 401 Unauthorized
 * responses from the backend and triggers automatic redirection to the respective signin page.
 */
export function setupFetchInterceptor(): void {
  if (typeof window === "undefined") return;
  if (fetchInterceptorInstalled) return;
  fetchInterceptorInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    if (response.status === 401) {
      let url = "";
      if (typeof args[0] === "string") {
        url = args[0];
      } else if (args[0] instanceof Request) {
        url = args[0].url;
      } else if (args[0] && typeof (args[0] as URL).href === "string") {
        url = (args[0] as URL).href;
      }

      // Do not intercept auth endpoints (e.g. invalid password attempts on /signin or /admin/login)
      if (!isAuthEndpoint(url)) {
        if (url.includes("/admin/") || window.location.pathname.startsWith("/admin")) {
          handleAdminTokenExpired();
        } else {
          handleUserTokenExpired();
        }
      }
    }

    return response;
  };
}
