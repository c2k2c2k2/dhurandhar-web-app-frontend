export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
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

  if (!payload.password.trim()) {
    errors.password = "Password is required.";
  } else if (payload.password.trim().length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!payload.acceptTerms) {
    errors.acceptTerms = "Please accept the terms to continue.";
  }

  return errors;
}
