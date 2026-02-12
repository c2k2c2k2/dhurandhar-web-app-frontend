"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ForbiddenPanel } from "@/components/ForbiddenPanel";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  hasAnyPermission,
  hasPermission,
  type PermissionKey,
} from "@/lib/auth/permissions";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingScreen label="Checking admin session..." />;
  }

  if (status === "unauthenticated") {
    return <LoadingScreen label="Redirecting to login..." />;
  }

  return <>{children}</>;
}

export function RequireStudent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/student/forbidden");
      return;
    }
    if (status === "authenticated" && user && user.type !== "STUDENT") {
      router.replace("/student/forbidden");
    }
  }, [status, user, router]);

  if (status === "loading") {
    return <LoadingScreen label="Checking student session..." />;
  }

  if (status === "unauthenticated") {
    return <LoadingScreen label="Redirecting..." />;
  }

  if (user && user.type !== "STUDENT") {
    return <ForbiddenPanel />;
  }

  return <>{children}</>;
}

type RequirePermProps = {
  perm?: PermissionKey;
  perms?: PermissionKey[];
  mode?: "hide" | "forbidden";
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function RequirePerm({
  perm,
  perms,
  mode = "forbidden",
  fallback,
  children,
}: RequirePermProps) {
  const { user } = useAuth();
  const allowed = perms
    ? hasAnyPermission(user, perms)
    : perm
      ? hasPermission(user, perm)
      : true;

  if (!allowed) {
    if (mode === "hide") {
      return null;
    }
    return <>{fallback ?? <ForbiddenPanel />}</>;
  }

  return <>{children}</>;
}

export function Can({
  perm,
  perms,
  children,
}: {
  perm?: PermissionKey;
  perms?: PermissionKey[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const allowed = perms
    ? hasAnyPermission(user, perms)
    : perm
      ? hasPermission(user, perm)
      : true;

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
