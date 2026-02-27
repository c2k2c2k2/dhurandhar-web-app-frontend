"use client";

import { clearTokens } from "@/lib/auth/tokenStore";

export const AUTH_ERROR_QUERY_KEY = "authError";

const SESSION_TERMINATION_CODES = new Set([
  "AUTH_SESSION_CONFLICT",
  "AUTH_SESSION_REVOKED",
]);

let authRedirectInProgress = false;

export function isSessionTerminationCode(code?: string) {
  return Boolean(code && SESSION_TERMINATION_CODES.has(code));
}

export function getAuthErrorMessage(code?: string, fallback?: string) {
  switch (code) {
    case "AUTH_SESSION_CONFLICT":
      return "This account was opened on another device. Please sign in again.";
    case "AUTH_SESSION_REVOKED":
      return "Your session ended. Please sign in again.";
    case "AUTH_ALREADY_LOGGED_IN":
      return "This account is already active on another device. Please logout there first.";
    default:
      return fallback ?? "Authentication failed.";
  }
}

function resolveRedirectPath(pathname: string, code?: string) {
  if (pathname.startsWith("/admin")) {
    return "/admin/login";
  }
  if (pathname.startsWith("/student")) {
    return isSessionTerminationCode(code) ? "/student/login" : "/student/forbidden";
  }
  return "/auth/login";
}

export function handleAuthFailureRedirect(code?: string) {
  clearTokens();
  if (typeof window === "undefined") {
    return;
  }
  if (authRedirectInProgress) {
    return;
  }
  authRedirectInProgress = true;

  const pathname = window.location.pathname || "/";
  const search = window.location.search || "";
  const targetPath = resolveRedirectPath(pathname, code);

  const redirectUrl = new URL(targetPath, window.location.origin);
  if (code) {
    redirectUrl.searchParams.set(AUTH_ERROR_QUERY_KEY, code);
  }
  if (targetPath === "/auth/login" && !pathname.startsWith("/auth/")) {
    const next = `${pathname}${search}`;
    if (next) {
      redirectUrl.searchParams.set("next", next);
    }
  }

  window.location.replace(`${redirectUrl.pathname}${redirectUrl.search}`);
}
