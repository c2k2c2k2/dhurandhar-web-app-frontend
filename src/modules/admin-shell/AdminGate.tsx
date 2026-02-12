"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { RequireAdmin } from "@/lib/auth/guards";
import { AdminLayout } from "@/modules/admin-shell/AdminLayout";
import { ToastProvider } from "@/modules/shared/components/Toast";

const PUBLIC_ROUTES = ["/admin/login", "/admin/forbidden"];

export function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          {isPublic ? (
            children
          ) : (
            <RequireAdmin>
              <AdminLayout>{children}</AdminLayout>
            </RequireAdmin>
          )}
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
