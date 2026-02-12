"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { readQueryParams } from "@/modules/shared/routing/query";
import { buildAuthUrl } from "@/modules/shared/routing/returnUrl";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ForgotPasswordContent />
    </React.Suspense>
  );
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const { next, plan, from } = readQueryParams(searchParams, [
    "next",
    "plan",
    "from",
  ]);

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Password recovery will be available here soon."
    >
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          This page is a placeholder while we finish the automated reset flow.
        </p>
        <p>Use your existing student support channel to reset access.</p>
      </div>
      <Button asChild>
        <Link href={buildAuthUrl("/auth/login", { next, plan, from })}>
          Back to login
        </Link>
      </Button>
    </AuthLayout>
  );
}
