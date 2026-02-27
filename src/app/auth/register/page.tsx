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
import { normalizeIndianPhone } from "@/lib/phone";
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
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpRequestedEmail, setOtpRequestedEmail] = React.useState("");
  const [otpMessage, setOtpMessage] = React.useState<string | null>(null);
  const [otpRequesting, setOtpRequesting] = React.useState(false);
  const [otpCooldown, setOtpCooldown] = React.useState(0);
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

  React.useEffect(() => {
    if (otpCooldown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setOtpCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [otpCooldown]);

  React.useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!otpRequestedEmail || otpRequestedEmail === normalizedEmail) {
      return;
    }
    setOtpRequestedEmail("");
    setOtp("");
    setOtpMessage("Email changed. Request a fresh OTP.");
  }, [email, otpRequestedEmail]);

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email address before requesting OTP.",
      }));
      return;
    }

    setOtpRequesting(true);
    setFormError(null);
    setOtpMessage(null);
    try {
      const result = await authApi.requestOtp({
        email: normalizedEmail,
        purpose: "LOGIN",
      });
      setOtpRequestedEmail(normalizedEmail);
      setOtpCooldown(60);
      setOtpMessage(
        result?.otp
          ? `OTP sent. Dev code: ${result.otp}`
          : "OTP sent to your email."
      );
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Unable to send OTP.";
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      if (code === "AUTH_OTP_COOLDOWN" && otpCooldown <= 0) {
        setOtpCooldown(60);
      }
      setFormError(message);
    } finally {
      setOtpRequesting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const validation = validateRegister({
      name,
      email,
      phone,
      password,
      confirmPassword,
      otp,
      acceptTerms,
    });
    if (!otpRequestedEmail || otpRequestedEmail !== normalizedEmail) {
      validation.otp = "Request OTP for this email before creating account.";
    }
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const normalizedPhone = normalizeIndianPhone(phone);
      if (!normalizedPhone) {
        setFormError("Enter a valid Indian mobile number.");
        setSubmitting(false);
        return;
      }

      await authApi.register({
        fullName: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: password.trim(),
        otp: otp.trim(),
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
          <div className="space-y-2">
            <Input
              name="email"
              type="email"
              placeholder="student@dhurandhar.in"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleSendOtp}
              disabled={otpRequesting || otpCooldown > 0}
            >
              {otpRequesting
                ? "Sending OTP..."
                : otpCooldown > 0
                  ? `Resend OTP in ${otpCooldown}s`
                  : "Send OTP to email"}
            </Button>
          </div>
        </AuthFormField>

        <AuthFormField
          label="Email OTP"
          error={errors.otp}
          helper={otpMessage || "Enter the 6-digit OTP sent to your email."}
        >
          <Input
            name="otp"
            type="text"
            placeholder="123456"
            value={otp}
            maxLength={6}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            required
          />
        </AuthFormField>

        <AuthFormField
          label="Mobile Number"
          error={errors.phone}
          helper="Indian mobile number (used for account updates and communication)."
        >
          <Input
            name="phone"
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </AuthFormField>

        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={errors.password}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          error={errors.confirmPassword}
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
