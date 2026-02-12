"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Timer } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as authApi from "@/lib/auth/authApi";

const DEFAULT_RESEND_SECONDS = 30;

export default function StudentVerifyOtpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading verification...
        </div>
      }
    >
      <VerifyOtpForm />
    </React.Suspense>
  );
}

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifierFromQuery = searchParams.get("identifier") || "";
  const [identifier, setIdentifier] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (!identifier && identifierFromQuery) {
      setIdentifier(identifierFromQuery);
      setCooldown(DEFAULT_RESEND_SECONDS);
    }
  }, [identifier, identifierFromQuery]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!identifier) {
      setMessage("Enter your email or phone first.");
      setStatus("error");
      return;
    }

    try {
      setMessage(null);
      setCooldown(DEFAULT_RESEND_SECONDS);
      if (identifier.includes("@")) {
        await authApi.requestOtp({ email: identifier, purpose: "PASSWORD_RESET" });
      } else {
        await authApi.requestOtp({ phone: identifier, purpose: "PASSWORD_RESET" });
      }
      setMessage("OTP resent. Check your phone or email.");
      setStatus("idle");
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Unable to resend OTP. Please try again.";
      setMessage(errorMessage);
      setStatus("error");
      setCooldown(0);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifier || !otp) {
      setMessage("Enter the OTP sent to you.");
      setStatus("error");
      return;
    }

    setStatus("verifying");
    setMessage(null);

    try {
      const payload = identifier.includes("@")
        ? { email: identifier, otp }
        : { phone: identifier, otp };
      const result = await authApi.verifyPasswordOtp(payload);
      if (result?.resetToken) {
        router.push(
          `/student/reset-password?token=${encodeURIComponent(result.resetToken)}`
        );
        return;
      }
      setStatus("error");
      setMessage(
        "Reset token not received. Please use the reset link or request OTP again."
      );
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "OTP verification failed. Please try again.";
      setMessage(errorMessage);
      setStatus("error");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f7f4ef] via-white to-[#eef4ff] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-80px] top-[120px] h-[280px] w-[280px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="absolute right-6 top-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/student/forgot-password">Back</Link>
        </Button>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl">Verify OTP</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit OTP we sent to your registered email or phone.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email or Phone</label>
              <Input
                name="identifier"
                type="text"
                placeholder="student@dhurandhar.in or 98xxxxxx"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">OTP</label>
              <Input
                name="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                inputMode="numeric"
                maxLength={6}
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
            <Button type="submit" className="w-full" disabled={status === "verifying"}>
              {status === "verifying" ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5" />
              {cooldown > 0 ? `${cooldown}s to resend` : "Didn’t get the OTP?"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              Resend OTP
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Security tip
            </div>
            <p className="mt-2">Never share your OTP with anyone.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
