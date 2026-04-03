export type StudentPlan = {
  id: string;
  key: string;
  name: string;
  tier?: string | null;
  pricePaise: number;
  durationDays: number;
  metadataJson?: Record<string, unknown> | null;
  featuresJson?: unknown;
  validity?: {
    unit: "DAYS" | "MONTHS" | "YEARS" | "LIFETIME";
    value?: number | null;
    durationDays: number;
    label: string;
  };
};

export type PlanPurchase = {
  canPurchase: boolean;
  mode: "NEW" | "RENEW" | "BLOCKED";
  reason?: string;
  message?: string;
  renewalWindowDays?: number;
  daysUntilExpiry?: number | null;
  renewalOpensAt?: string | null;
};

export type StudentPlanOption = StudentPlan & {
  purchase: PlanPurchase;
  activeSubscription?: {
    id: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
    startsAt?: string | null;
    endsAt?: string | null;
  } | null;
};

export type CheckoutResponse = {
  provider: "PHONEPE" | "RAZORPAY";
  redirectUrl?: string;
  merchantTransactionId: string;
  orderId: string;
  amountPaise: number;
  flow?: "ONE_TIME" | "AUTOPAY_SETUP" | "AUTOPAY_CHARGE";
  autoPay?: {
    enabled: boolean;
  };
  razorpay?: {
    keyId: string;
    orderId?: string;
    subscriptionId?: string;
    amountPaise: number;
    currency: string;
    name: string;
    description?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
  };
};

export type PaymentOrder = {
  id: string;
  provider?: "PHONEPE" | "RAZORPAY";
  status: "CREATED" | "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  flow?: "ONE_TIME" | "AUTOPAY_SETUP" | "AUTOPAY_CHARGE";
  merchantTransactionId: string;
  amountPaise: number;
  finalAmountPaise: number;
  createdAt?: string;
  completedAt?: string | null;
};

export type CheckoutPreview = {
  paymentProvider?: "PHONEPE" | "RAZORPAY";
  plan: {
    id: string;
    key: string;
    name: string;
    tier?: string | null;
    durationDays: number;
    validity?: {
      unit: "DAYS" | "MONTHS" | "YEARS" | "LIFETIME" | string;
      value?: number | null;
      durationDays: number;
      label?: string;
    };
  };
  baseAmountPaise: number;
  discountPaise: number;
  finalAmountPaise: number;
  coupon?: {
    code: string;
    discountPaise: number;
  } | null;
  autoPay: {
    requested: boolean;
    eligible: boolean;
    reason: string;
    message: string;
    intervalUnit: "DAY" | "MONTH" | "YEAR" | string;
    intervalCount: number;
  };
};
