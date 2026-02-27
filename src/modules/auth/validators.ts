import { isIndianPhone } from "@/lib/phone";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  otp: string;
  acceptTerms: boolean;
};

const MIN_PASSWORD_LENGTH = 6;

export function validateLogin(payload: LoginPayload) {
  const errors: Record<string, string> = {};

  if (!payload.email.trim()) {
    errors.email = "Email is required.";
  } else if (!payload.email.includes("@")) {
    errors.email = "Enter a valid email address.";
  }

  if (!payload.password.trim()) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateRegister(payload: RegisterPayload) {
  const errors: Record<string, string> = {};

  if (!payload.name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!payload.email.trim()) {
    errors.email = "Email is required.";
  } else if (!payload.email.includes("@")) {
    errors.email = "Enter a valid email address.";
  }

  if (!payload.phone.trim()) {
    errors.phone = "Mobile number is required.";
  } else if (!isIndianPhone(payload.phone)) {
    errors.phone = "Enter a valid Indian mobile number.";
  }

  if (!payload.password.trim()) {
    errors.password = "Password is required.";
  } else if (payload.password.trim().length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!payload.confirmPassword.trim()) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (payload.password !== payload.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!payload.otp.trim()) {
    errors.otp = "OTP is required.";
  } else if (!/^\d{6}$/.test(payload.otp.trim())) {
    errors.otp = "Enter a valid 6-digit OTP.";
  }

  if (!payload.acceptTerms) {
    errors.acceptTerms = "Please accept the terms to continue.";
  }

  return errors;
}
