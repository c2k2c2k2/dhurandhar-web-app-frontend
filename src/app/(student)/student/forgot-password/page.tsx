"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as authApi from "@/lib/auth/authApi";

export default function StudentForgotPasswordPage() {
  const [identifier, setIdentifier] = React.useState("");
  const [mode, setMode] = React.useState<"link" | "otp">("link");
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setStatus("sending");

    try {
      if (mode === "link") {
        const result = await authApi.requestPasswordReset({
          email: identifier,
          redirectUrl: `${window.location.origin}/student/reset-password`,
        });
        setStatus("sent");
        setMessage(
          result?.resetToken
            ? "Reset link generated. Check your email for the full link."
            : "If the account exists, we sent a reset link."
        );
      } else {
        const payload = identifier.includes("@")
          ? { email: identifier, purpose: "PASSWORD_RESET" as const }
          : { phone: identifier, purpose: "PASSWORD_RESET" as const };
        const result = await authApi.requestOtp(payload);
        setStatus("sent");
        setMessage(
          result?.otp
            ? `OTP sent. Check your inbox or SMS.`
            : "OTP sent. Check your inbox or SMS."
        );
      }
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Unable to send reset request. Please try again.";
      setMessage(errorMessage);
      setStatus("error");
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
          <Link href="/student/login">Back to Login</Link>
        </Button>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl">
            Reset your password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your registered email or phone number. We&apos;ll send a reset
            link or OTP.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("link")}
                className={`rounded-2xl border px-3 py-2 text-xs font-semibold ${
                  mode === "link"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                Reset link (email)
              </button>
              <button
                type="button"
                onClick={() => setMode("otp")}
                className={`rounded-2xl border px-3 py-2 text-xs font-semibold ${
                  mode === "otp"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                OTP (email/phone)
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {mode === "link" ? "Email" : "Email or Phone"}
              </label>
              <Input
                name="identifier"
                type="text"
                placeholder="student@dhurandhar.in or 98xxxxxx"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
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
            <Button type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending"
                ? "Sending..."
                : mode === "link"
                  ? "Send reset link"
                  : "Send OTP"}
            </Button>
          </form>
          {status === "sent" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {mode === "otp" ? (
                <Button variant="secondary" asChild>
                  <Link
                    href={`/student/verify-otp?identifier=${encodeURIComponent(identifier)}`}
                  >
                    I have the OTP
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link href="/student/reset-password">Use reset link</Link>
                </Button>
              )}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Safety tip
            </div>
            <p className="mt-2">
              Use only your registered phone/email. OTPs expire quickly for your
              safety.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Remembered your password?</span>
            <Link href="/student/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Support: help@dhurandhar.in
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
