"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AUTH_ERROR_QUERY_KEY, getAuthErrorMessage } from "@/lib/auth/sessionErrors";

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <AdminLoginContent />
    </React.Suspense>
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status, error } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const authErrorCode = searchParams.get(AUTH_ERROR_QUERY_KEY) ?? undefined;
  const authRedirectError = authErrorCode
    ? getAuthErrorMessage(authErrorCode)
    : null;

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin");
    }
  }, [status, router]);

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl">
            Admin Sign In
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use your admin credentials to access the console.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="admin@dhurandhar.in"
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
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
