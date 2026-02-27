"use client";

import * as React from "react";
import * as authApi from "@/lib/auth/authApi";
import { clearTokens, getAccessToken } from "@/lib/auth/tokenStore";
import { getAuthErrorMessage } from "@/lib/auth/sessionErrors";
import type { UserMe } from "@/lib/auth/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: UserMe | null;
  status: AuthStatus;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<{
    ok: boolean;
    error?: string;
  }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function getErrorDetails(error: unknown) {
  if (error && typeof error === "object") {
    const payload = error as { message?: string; code?: string };
    return {
      message: payload.message ? String(payload.message) : undefined,
      code: payload.code ? String(payload.code) : undefined,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return {};
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserMe | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [error, setError] = React.useState<string | null>(null);

  const refreshUser = React.useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
      setError(null);
    } catch (err) {
      clearTokens();
      setUser(null);
      setStatus("unauthenticated");
      const { message, code } = getErrorDetails(err);
      setError(getAuthErrorMessage(code, message || "Unable to load session"));
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        if (!active) return;
        setStatus("unauthenticated");
        setUser(null);
        setError(null);
        return;
      }
      try {
        const me = await authApi.me();
        if (!active) return;
        setUser(me);
        setStatus("authenticated");
      } catch {
        if (!active) return;
        clearTokens();
        setUser(null);
        setStatus("unauthenticated");
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(
    async (payload: { email: string; password: string }) => {
      setStatus("loading");
      setError(null);
      try {
        await authApi.login(payload);
        const me = await authApi.me();
        setUser(me);
        setStatus("authenticated");
        return { ok: true };
      } catch (err) {
        setStatus("unauthenticated");
        const { message, code } = getErrorDetails(err);
        const resolvedMessage = getAuthErrorMessage(code, message || "Login failed");
        setError(resolvedMessage);
        return { ok: false, error: resolvedMessage };
      }
    },
    []
  );

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Keep client state reset even if logout API call fails.
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      setError(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    status,
    error,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
