"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AUTH_ERROR_QUERY_KEY, getAuthErrorMessage } from "@/lib/auth/sessionErrors";

export default function StudentLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <StudentLoginContent />
    </React.Suspense>
  );
}

function StudentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status, error, user, logout } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const authErrorCode = searchParams.get(AUTH_ERROR_QUERY_KEY) ?? undefined;
  const authRedirectError = authErrorCode
    ? getAuthErrorMessage(authErrorCode)
    : null;

  React.useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (user?.type === "STUDENT") {
      router.replace("/student");
      return;
    }

    setFormError("This account is not a student.");
    logout();
  }, [status, user, router, logout]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const result = await login({ email, password });
    setSubmitting(false);
    if (!result.ok) {
      setFormError(result.error || "Login failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[rgb(var(--background))] via-[rgb(var(--background))] to-[rgb(var(--muted))] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-80px] top-[120px] h-[280px] w-[280px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="absolute right-6 top-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl">
            Student Sign In
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Access your notes, practice sets, and test attempts.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email or Phone</label>
              <Input
                name="email"
                type="text"
                placeholder="student@dhurandhar.in or 98xxxxxx"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {(formError || authRedirectError || error) && (
              <p className="text-sm text-destructive">
                {formError || authRedirectError || error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Need help accessing your account?</span>
            <Link
              href="/student/forgot-password"
              className="font-medium text-foreground hover:underline"
            >
              Forgot password
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            Use your student account. Admin accounts won&apos;t work here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
