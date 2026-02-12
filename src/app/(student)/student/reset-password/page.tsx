"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as authApi from "@/lib/auth/authApi";


function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else {
      setMessage("Reset token missing. Please verify OTP or open the reset link.");
    }
  }, [tokenFromQuery]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Reset token missing. Please request a new reset.");
      return;
    }

    setStatus("saving");

    try {
      await authApi.resetPassword({
        token,
        newPassword: password,
      });
      setStatus("success");
      setMessage("Password updated. You can now log in.");
      setTimeout(() => router.push("/student/login"), 1200);
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Unable to reset password. Please try again.";
      setStatus("error");
      setMessage(errorMessage);
    }
  };

  const methodLabel = token
    ? "Reset link verified"
    : "Verify OTP or open the reset link";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f7f4ef] via-white to-[#eef4ff] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-80px] top-[120px] h-[280px] w-[280px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="absolute right-6 top-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/student/login">Back to Login</Link>
        </Button>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl">Set a new password</CardTitle>
          <p className="text-sm text-muted-foreground">
            {methodLabel}
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">New password</label>
              <Input
                name="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm password</label>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {message ? (
              <div
                className={`rounded-2xl border px-3 py-2 text-xs ${
                  status === "error"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-border bg-muted/50 text-muted-foreground"
                }`}
              >
                {message}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={status === "saving"}>
              {status === "saving" ? "Updating..." : "Update password"}
            </Button>
          </form>

          <div className="mt-4 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Password tip
            </div>
            <p className="mt-2">
              Use at least 6 characters. Mix letters and numbers for stronger security.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" />
            Need a new OTP?{" "}
            <Link
              href="/student/forgot-password"
              className="font-medium text-foreground hover:underline"
            >
              Request again
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading reset form...
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
