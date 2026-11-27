"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import {
  isTokenExpired,
  getTokenTimeRemainingMs,
  handleUserTokenExpired,
  handleAdminTokenExpired,
  setupFetchInterceptor,
  resetRedirectFlags,
} from "@/lib/tokenExpiration";

export default function AuthMonitor() {
  const pathname = usePathname();

  const userToken = useAuthStore((s) => s.token);
  const userHydrated = useAuthStore((s) => s.hydrated);

  const adminToken = useAdminAuthStore((s) => s.token);
  const adminHydrated = useAdminAuthStore((s) => s.hydrated);

  // Install global fetch interceptor once on mount
  useEffect(() => {
    setupFetchInterceptor();
  }, []);

  // Reset redirect flags when navigating to signin or login pages
  useEffect(() => {
    if (
      pathname.startsWith("/signin") ||
      pathname.startsWith("/signup") ||
      pathname === "/admin/login" ||
      pathname === "/admin/register"
    ) {
      resetRedirectFlags();
    }
  }, [pathname]);

  // Monitor Admin side token expiration
  useEffect(() => {
    if (!adminHydrated) return;

    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminAuthPage =
      pathname === "/admin/login" || pathname === "/admin/register";

    if (isAdminRoute && !isAdminAuthPage) {
      if (!adminToken || isTokenExpired(adminToken)) {
        handleAdminTokenExpired();
        return;
      }

      const remainingMs = getTokenTimeRemainingMs(adminToken);
      let timer: NodeJS.Timeout | null = null;
      if (remainingMs !== null) {
        if (remainingMs <= 0) {
          handleAdminTokenExpired();
          return;
        }
        // Set timeout to automatically fire the exact moment token expires
        const delay = Math.min(remainingMs, 2147483647);
        timer = setTimeout(() => {
          handleAdminTokenExpired();
        }, delay);
      }

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [pathname, adminToken, adminHydrated]);

  // Monitor User side token expiration
  useEffect(() => {
    if (!userHydrated) return;

    const protectedUserPrefixes = [
      "/home",
      "/explore",
      "/sessions",
      "/profile",
      "/projects",
      "/notifications",
      "/community",
      "/reviews",
      "/signup/profile",
    ];

    const isProtectedUserRoute = protectedUserPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (isProtectedUserRoute) {
      if (!userToken || isTokenExpired(userToken)) {
        handleUserTokenExpired();
        return;
      }

      const remainingMs = getTokenTimeRemainingMs(userToken);
      let timer: NodeJS.Timeout | null = null;
      if (remainingMs !== null) {
        if (remainingMs <= 0) {
          handleUserTokenExpired();
          return;
        }
        const delay = Math.min(remainingMs, 2147483647);
        timer = setTimeout(() => {
          handleUserTokenExpired();
        }, delay);
      }

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [pathname, userToken, userHydrated]);

  // Listen for tab visibility / focus to immediately detect expiration after device sleep or background tab
  useEffect(() => {
    const checkExpirationOnActive = () => {
      if (document.visibilityState === "visible") {
        const path = window.location.pathname;

        if (path.startsWith("/admin")) {
          const isAdminAuthPage =
            path === "/admin/login" || path === "/admin/register";
          if (!isAdminAuthPage && adminHydrated) {
            if (!adminToken || isTokenExpired(adminToken)) {
              handleAdminTokenExpired();
            }
          }
        } else {
          const protectedUserPrefixes = [
            "/home",
            "/explore",
            "/sessions",
            "/profile",
            "/projects",
            "/notifications",
            "/community",
            "/reviews",
            "/signup/profile",
          ];
          const isProtected = protectedUserPrefixes.some((p) => path.startsWith(p));
          if (isProtected && userHydrated) {
            if (!userToken || isTokenExpired(userToken)) {
              handleUserTokenExpired();
            }
          }
        }
      }
    };

    window.addEventListener("visibilitychange", checkExpirationOnActive);
    window.addEventListener("focus", checkExpirationOnActive);

    // Also run an interval check every 15 seconds as a heartbeat safety net
    const interval = setInterval(checkExpirationOnActive, 15000);

    return () => {
      window.removeEventListener("visibilitychange", checkExpirationOnActive);
      window.removeEventListener("focus", checkExpirationOnActive);
      clearInterval(interval);
    };
  }, [adminToken, adminHydrated, userToken, userHydrated]);

  return null;
}
