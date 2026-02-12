"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFormField } from "@/modules/auth/components/AuthFormField";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import { validateRegister } from "@/modules/auth/validators";
import { useAuth } from "@/lib/auth/AuthProvider";
import * as authApi from "@/lib/auth/authApi";
import { readQueryParams } from "@/modules/shared/routing/query";
import {
  buildAuthUrl,
  resolvePostAuthRedirect,
} from "@/modules/shared/routing/returnUrl";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <RegisterContent />
    </React.Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user, refreshUser } = useAuth();
  const { next, plan, from } = readQueryParams(searchParams, [
    "next",
    "plan",
    "from",
  ]);
  const redirectTarget = resolvePostAuthRedirect({ next, plan });

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (user?.type === "STUDENT") {
      router.replace(redirectTarget);
    }
  }, [status, user, router, redirectTarget]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateRegister({
      name,
      email,
      password,
      acceptTerms,
    });
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.register({
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      await refreshUser();
      router.replace(redirectTarget);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Registration failed";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your student account"
      subtitle="Start with free access and upgrade when you are ready."
      footer={
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Already have an account?</span>
          <Link
            href={buildAuthUrl("/auth/login", { next, plan, from })}
            className="font-semibold text-foreground hover:underline"
          >
            Login
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthFormField label="Full Name" error={errors.name}>
          <Input
            name="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </AuthFormField>

        <AuthFormField label="Email" error={errors.email}>
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
          autoComplete="new-password"
          error={errors.password}
        />

        <label className="flex items-start gap-3 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border border-input"
          />
          <span>
            I agree to the Terms and Privacy Policy for using this platform.
          </span>
        </label>
        {errors.acceptTerms ? (
          <p className="text-xs text-destructive">{errors.acceptTerms}</p>
        ) : null}

        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
