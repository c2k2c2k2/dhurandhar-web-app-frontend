"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFormField } from "@/modules/auth/components/AuthFormField";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import { validateLogin } from "@/modules/auth/validators";
import { useAuth } from "@/lib/auth/AuthProvider";
import { readQueryParams } from "@/modules/shared/routing/query";
import {
  buildAuthUrl,
  resolvePostAuthRedirect,
} from "@/modules/shared/routing/returnUrl";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status, user, logout } = useAuth();
  const { next, plan, from } = readQueryParams(searchParams, [
    "next",
    "plan",
    "from",
  ]);
  const redirectTarget = resolvePostAuthRedirect({ next, plan });

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (user?.type === "STUDENT") {
      router.replace(redirectTarget);
      return;
    }

    setFormError("This account is not a student.");
    logout();
  }, [status, user, router, logout, redirectTarget]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateLogin({ email, password });
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const result = await login({
      email: email.trim(),
      password: password.trim(),
    });
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error || "Login failed");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Access your preparation workspace with your student account."
      footer={
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Don&apos;t have an account?</span>
          <Link
            href={buildAuthUrl("/auth/register", { next, plan, from })}
            className="font-semibold text-foreground hover:underline"
          >
            Create account
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthFormField
          label="Email"
          error={errors.email}
          helper="Use the email linked to your student account."
        >
          <Input
            name="email"
            type="email"
            placeholder="student@dhurandhar.in"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </AuthFormField>

        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={errors.password}
        />

        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Need help accessing your account?</span>
        <Link
          href={buildAuthUrl("/auth/forgot-password", { next, plan, from })}
          className="font-semibold text-foreground hover:underline"
        >
          Forgot password
        </Link>
      </div>
    </AuthLayout>
  );
}
