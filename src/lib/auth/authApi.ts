import { apiFetch } from "@/lib/api/client";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/auth/tokenStore";
import type { AuthTokens, UserMe } from "@/lib/auth/types";

export async function login(payload: {
  email: string;
  password: string;
}) {
  const data = await apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    retryOnUnauthorized: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function register(payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
}) {
  const data = await apiFetch<AuthTokens>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    retryOnUnauthorized: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function refresh(payload: { refreshToken: string }) {
  const data = await apiFetch<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    retryOnUnauthorized: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return;
  }

  try {
    await apiFetch<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      retryOnUnauthorized: false,
    });
  } catch {
    // Best-effort logout: token may already be expired or invalid.
  } finally {
    clearTokens();
  }
}

export async function me() {
  return apiFetch<UserMe>("/auth/me", {
    method: "GET",
  });
}

export async function requestPasswordReset(payload: {
  email: string;
  redirectUrl?: string;
}) {
  return apiFetch<{ success: boolean; resetToken?: string; expiresAt?: string }>(
    "/auth/password/request",
    {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
      retryOnUnauthorized: false,
    }
  );
}

export async function requestOtp(payload: {
  email?: string;
  phone?: string;
  purpose: "PASSWORD_RESET" | "LOGIN";
}) {
  return apiFetch<{ success: boolean; expiresAt?: string; otp?: string }>(
    "/auth/otp/request",
    {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
      retryOnUnauthorized: false,
    }
  );
}

export async function verifyPasswordOtp(payload: {
  email?: string;
  phone?: string;
  otp: string;
}) {
  return apiFetch<{ success: boolean; resetToken?: string; expiresAt?: string }>(
    "/auth/otp/verify",
    {
      method: "POST",
      body: JSON.stringify({ ...payload, purpose: "PASSWORD_RESET" }),
      auth: false,
      retryOnUnauthorized: false,
    }
  );
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
}) {
  return apiFetch<{ success: boolean }>(
    "/auth/password/reset",
    {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
      retryOnUnauthorized: false,
    }
  );
}
