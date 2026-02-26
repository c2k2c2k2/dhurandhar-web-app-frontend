"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { RequireStudent } from "@/lib/auth/guards";
import { StudentAuthProvider } from "@/modules/student-auth/StudentAuthProvider";
import { QuestionLanguageProvider } from "@/modules/student-questions/QuestionLanguageProvider";
import { StudentLayout } from "@/modules/student-shell/StudentLayout";
import { ToastProvider } from "@/modules/shared/components/Toast";

const PUBLIC_ROUTES = [
  "/student/forbidden",
  "/student/login",
  "/student/forgot-password",
  "/student/verify-otp",
  "/student/reset-password",
];
const PUBLIC_ACCESS =
  process.env.NEXT_PUBLIC_STUDENT_PUBLIC_ACCESS === "true";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          {isPublic ? (
            children
          ) : (
            <StudentAuthProvider>
              <QuestionLanguageProvider>
                {PUBLIC_ACCESS ? (
                  <StudentLayout>{children}</StudentLayout>
                ) : (
                  <RequireStudent>
                    <StudentLayout>{children}</StudentLayout>
                  </RequireStudent>
                )}
              </QuestionLanguageProvider>
            </StudentAuthProvider>
          )}
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
