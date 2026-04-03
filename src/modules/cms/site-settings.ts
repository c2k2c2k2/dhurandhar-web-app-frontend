"use client";

export const SITE_SETTINGS_CONFIG_KEY = "app.site_settings";

export type SiteSettingInputType =
  | "text"
  | "number"
  | "textarea"
  | "boolean"
  | "select";

export type SiteSettingValue = string | number | boolean;

export type SiteSettingOption = {
  value: string;
  label: string;
};

export type SiteSettingField = {
  key: string;
  label: string;
  description: string;
  inputType: SiteSettingInputType;
  defaultValue: SiteSettingValue;
  placeholder?: string;
  min?: number;
  step?: number;
  options?: SiteSettingOption[];
};

export type SiteSettingGroup = {
  id: string;
  title: string;
  description: string;
  fields: SiteSettingField[];
};

export const SITE_SETTING_GROUPS: SiteSettingGroup[] = [
  {
    id: "print-branding",
    title: "Print Branding",
    description:
      "Header branding and Marathi font loading for legal-size print papers.",
    fields: [
      {
        key: "PRINT_PAPER_BRAND_NAME",
        label: "Paper Brand Name",
        description: "Shown at top-center of the printed paper header.",
        inputType: "text",
        defaultValue: "Career Point Academy",
      },
      {
        key: "PRINT_PAPER_BRAND_META",
        label: "Paper Brand Meta",
        description:
          "Optional second line under brand name (mobile, address, attribution).",
        inputType: "textarea",
        defaultValue: "",
        placeholder: "DHURANDHAR SIR · MOB NO. 9545789817",
      },
      {
        key: "PRINT_FONTS_DIR",
        label: "Print Fonts Directory",
        description:
          "Absolute path where print engine reads custom Marathi fonts from.",
        inputType: "text",
        defaultValue: "",
        placeholder: "/opt/dhurandhar/fonts",
      },
    ],
  },
  {
    id: "print-engine",
    title: "Print Engine Runtime",
    description: "Limits and processing behavior for print jobs.",
    fields: [
      {
        key: "PRINT_MAX_QUESTIONS",
        label: "Max Questions Per Job",
        description: "Hard cap for selected questions in one print request.",
        inputType: "number",
        defaultValue: 200,
        min: 1,
      },
      {
        key: "PRINT_MAX_EMBEDDED_IMAGE_BYTES",
        label: "Max Embedded Image Bytes",
        description:
          "Combined embedded image limit across all selected questions.",
        inputType: "number",
        defaultValue: 20971520,
        min: 1024,
        step: 1024,
      },
      {
        key: "PRINT_REQUEUE_ON_BOOT_LIMIT",
        label: "Requeue Queued Jobs On Boot",
        description:
          "Maximum queued jobs to auto requeue when server starts.",
        inputType: "number",
        defaultValue: 100,
        min: 0,
      },
      {
        key: "PRINT_FAKE_PDF",
        label: "Fake PDF Mode",
        description:
          "Generate placeholder PDF content for quick debugging instead of browser rendering.",
        inputType: "boolean",
        defaultValue: false,
      },
      {
        key: "PRINT_FORCE_INLINE_PROCESSING",
        label: "Force Inline Processing",
        description:
          "Process print jobs in API process instead of queue workers.",
        inputType: "boolean",
        defaultValue: false,
      },
      {
        key: "PRINT_AUTO_INSTALL_PLAYWRIGHT_CHROMIUM",
        label: "Auto Install Chromium",
        description:
          "Allow service to auto-install Playwright Chromium if missing.",
        inputType: "boolean",
        defaultValue: true,
      },
    ],
  },
  {
    id: "cms-delivery",
    title: "CMS Delivery",
    description:
      "Whitelist keys exposed through CMS public/student content endpoints.",
    fields: [
      {
        key: "CMS_PUBLIC_KEYS",
        label: "CMS Public Keys",
        description:
          "Comma-separated keys allowed from `/cms/public` endpoint.",
        inputType: "text",
        defaultValue: "landing",
        placeholder: "landing,about,faq",
      },
      {
        key: "CMS_STUDENT_KEYS",
        label: "CMS Student Keys",
        description:
          "Comma-separated keys allowed from `/cms/student` endpoint.",
        inputType: "text",
        defaultValue: "home,student,app.languages",
        placeholder: "home,student,app.languages,test.presets",
      },
    ],
  },
  {
    id: "subscription-payments",
    title: "Subscription & Payments",
    description: "Business rules for subscriptions and payment automation.",
    fields: [
      {
        key: "PAYMENTS_ACTIVE_PROVIDER",
        label: "Active Checkout Provider",
        description:
          "Select which payment gateway new student checkouts should use by default.",
        inputType: "select",
        defaultValue: "PHONEPE",
        options: [
          { value: "PHONEPE", label: "PhonePe" },
          { value: "RAZORPAY", label: "Razorpay" },
        ],
      },
      {
        key: "SUBSCRIPTION_STACKING",
        label: "Enable Subscription Stacking",
        description:
          "Allow a new plan purchase to stack on top of active entitlement.",
        inputType: "boolean",
        defaultValue: true,
      },
      {
        key: "SUBSCRIPTION_RENEWAL_WINDOW_DAYS",
        label: "Renewal Window (Days)",
        description: "Grace window for renewals before expiry.",
        inputType: "number",
        defaultValue: 7,
        min: 0,
      },
      {
        key: "SUBSCRIPTION_LIFETIME_DAYS",
        label: "Lifetime Duration (Days)",
        description:
          "Applied for lifetime plan calculations where needed.",
        inputType: "number",
        defaultValue: 36500,
        min: 1,
      },
      {
        key: "PENDING_ORDER_EXPIRE_MINUTES",
        label: "Pending Order Expiry (Minutes)",
        description: "Auto-expire timeout for pending payment orders.",
        inputType: "number",
        defaultValue: 30,
        min: 1,
      },
      {
        key: "PAYMENTS_RECONCILE_INTERVAL_SECONDS",
        label: "Reconcile Interval (Seconds)",
        description: "Scheduler interval for payment reconciliation.",
        inputType: "number",
        defaultValue: 60,
        min: 10,
      },
      {
        key: "PAYMENTS_AUTOPAY_INTERVAL_SECONDS",
        label: "Autopay Poll Interval (Seconds)",
        description: "Background interval for autopay execution checks.",
        inputType: "number",
        defaultValue: 300,
        min: 30,
      },
      {
        key: "PAYMENTS_AUTOPAY_RETRY_MINUTES",
        label: "Autopay Retry (Minutes)",
        description: "Retry delay for failed autopay transactions.",
        inputType: "number",
        defaultValue: 60,
        min: 1,
      },
      {
        key: "PAYMENTS_AUTOPAY_REMINDER_HOURS",
        label: "Autopay Reminder (Hours)",
        description: "Lead time for reminder notifications before debit.",
        inputType: "number",
        defaultValue: 24,
        min: 1,
      },
      {
        key: "PHONEPE_PAYMENT_MESSAGE",
        label: "PhonePe Payment Message",
        description:
          "Optional message shown during checkout or payment initiation.",
        inputType: "textarea",
        defaultValue: "",
      },
      {
        key: "PHONEPE_DISABLE_PAYMENT_RETRY",
        label: "Disable Payment Retry",
        description:
          "When enabled, backend avoids retrying failed payment initiation calls.",
        inputType: "boolean",
        defaultValue: false,
      },
      {
        key: "PHONEPE_PUBLISH_EVENTS",
        label: "Publish PhonePe Events",
        description: "Emit payment events for observability/event stream.",
        inputType: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    id: "session-rate-limits",
    title: "Session & Rate Limits",
    description: "Control student session policy and request limits.",
    fields: [
      {
        key: "STUDENT_SINGLE_SESSION_ENFORCEMENT",
        label: "Single Session Enforcement",
        description: "Restrict each student to one active login session.",
        inputType: "boolean",
        defaultValue: true,
      },
      {
        key: "STUDENT_SINGLE_SESSION_STRATEGY",
        label: "Single Session Strategy",
        description:
          "How to handle second login attempts when one session is already active.",
        inputType: "select",
        defaultValue: "FORCE_LOGOUT_EXISTING",
        options: [
          { value: "FORCE_LOGOUT_EXISTING", label: "Force logout existing" },
          { value: "DENY_NEW_LOGIN", label: "Deny new login" },
        ],
      },
      {
        key: "NOTE_VIEW_SESSION_TTL_MINUTES",
        label: "Note View Session TTL (Minutes)",
        description: "Validity window for protected note-view sessions.",
        inputType: "number",
        defaultValue: 30,
        min: 1,
      },
      {
        key: "NOTE_VIEW_MAX_SESSIONS",
        label: "Max Note View Sessions",
        description: "Maximum concurrent view sessions per note/user.",
        inputType: "number",
        defaultValue: 2,
        min: 1,
      },
      {
        key: "NOTE_ACCESS_RATE_LIMIT",
        label: "Note Access Rate Limit",
        description: "Maximum note access operations per rate window.",
        inputType: "number",
        defaultValue: 60,
        min: 1,
      },
      {
        key: "NOTE_ACCESS_RATE_WINDOW_SECONDS",
        label: "Note Access Window (Seconds)",
        description: "Window duration for note access throttling.",
        inputType: "number",
        defaultValue: 120,
        min: 1,
      },
      {
        key: "THROTTLE_TTL_SECONDS",
        label: "Global Throttle Window (Seconds)",
        description: "Default API throttling window.",
        inputType: "number",
        defaultValue: 60,
        min: 1,
      },
      {
        key: "THROTTLE_LIMIT",
        label: "Global Throttle Limit",
        description: "Default max requests within throttle window.",
        inputType: "number",
        defaultValue: 120,
        min: 1,
      },
      {
        key: "AUTH_THROTTLE_LIMIT",
        label: "Auth Throttle Limit",
        description: "Max authentication requests per throttle window.",
        inputType: "number",
        defaultValue: 10,
        min: 1,
      },
      {
        key: "PAYMENTS_THROTTLE_LIMIT",
        label: "Payments Throttle Limit",
        description: "Max payment API calls per throttle window.",
        inputType: "number",
        defaultValue: 5,
        min: 1,
      },
      {
        key: "SEARCH_THROTTLE_LIMIT",
        label: "Search Throttle Limit",
        description: "Max search requests per throttle window.",
        inputType: "number",
        defaultValue: 60,
        min: 1,
      },
    ],
  },
];

export const SITE_SETTING_FIELDS = SITE_SETTING_GROUPS.flatMap(
  (group) => group.fields,
);
export const SITE_SETTING_KEYS = SITE_SETTING_FIELDS.map((field) => field.key);

function parseBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }
  return fallback;
}

function parseNumber(value: unknown, fallback: number, min?: number) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (typeof min === "number" && parsed < min) {
    return fallback;
  }
  return parsed;
}

function parseString(value: unknown, fallback: string) {
  if (typeof value === "string") {
    return value;
  }
  if (value == null) {
    return fallback;
  }
  return String(value);
}

function parseFieldValue(field: SiteSettingField, raw: unknown): SiteSettingValue {
  if (field.inputType === "boolean") {
    return parseBoolean(raw, field.defaultValue as boolean);
  }
  if (field.inputType === "number") {
    return parseNumber(raw, field.defaultValue as number, field.min);
  }
  return parseString(raw, field.defaultValue as string);
}

export function createDefaultSiteSettingValues() {
  const defaults: Record<string, SiteSettingValue> = {};
  for (const field of SITE_SETTING_FIELDS) {
    defaults[field.key] = field.defaultValue;
  }
  return defaults;
}

export function mapSiteSettingsToEditor(source: Record<string, unknown>) {
  const defaults = createDefaultSiteSettingValues();
  const values: Record<string, SiteSettingValue> = { ...defaults };
  for (const field of SITE_SETTING_FIELDS) {
    values[field.key] = parseFieldValue(field, source[field.key]);
  }

  const knownKeys = new Set(SITE_SETTING_KEYS);
  const preserved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (!knownKeys.has(key)) {
      preserved[key] = value;
    }
  }

  return { values, preserved };
}

export function buildSiteSettingsPayload(
  values: Record<string, SiteSettingValue>,
  preserved: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = { ...preserved };

  for (const field of SITE_SETTING_FIELDS) {
    const value = values[field.key];
    if (field.inputType === "boolean") {
      payload[field.key] = Boolean(value);
      continue;
    }
    if (field.inputType === "number") {
      const parsed = parseNumber(value, field.defaultValue as number, field.min);
      payload[field.key] = parsed;
      continue;
    }
    payload[field.key] = parseString(value, field.defaultValue as string).trim();
  }

  return payload;
}
