const INDIAN_LOCAL_REGEX = /^[6-9]\d{9}$/;

export function normalizeIndianPhone(value: string) {
  const digits = value.trim().replace(/\D/g, "");

  if (INDIAN_LOCAL_REGEX.test(digits)) {
    return `+91${digits}`;
  }

  if (/^0[6-9]\d{9}$/.test(digits)) {
    return `+91${digits.slice(1)}`;
  }

  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `+91${digits.slice(2)}`;
  }

  return null;
}

export function isIndianPhone(value: string) {
  return Boolean(normalizeIndianPhone(value));
}
