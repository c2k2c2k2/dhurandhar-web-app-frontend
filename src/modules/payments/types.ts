"use client";

export type PaymentUser = {
  id: string;
  email?: string | null;
  fullName?: string | null;
};

export type PaymentTransaction = {
  id: string;
  status?: string;
  providerTransactionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentEvent = {
  id: string;
  eventType?: string;
  providerEventId?: string | null;
  createdAt?: string;
  processedAt?: string | null;
  payloadJson?: unknown;
};

export type PaymentPlanSummary = {
  id?: string;
  name?: string | null;
};

export type PaymentOrder = {
  id: string;
  userId?: string | null;
  status?: string;
  merchantTransactionId?: string | null;
  merchantUserId?: string | null;
  amountPaise?: number | null;
  finalAmountPaise?: number | null;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  expiresAt?: string | null;
  user?: PaymentUser | null;
  plan?: PaymentPlanSummary | null;
  transactions?: PaymentTransaction[];
  events?: PaymentEvent[];
  metadataJson?: unknown;
};

export type PaymentOrderList = {
  data: PaymentOrder[];
  total: number;
  page: number;
  pageSize: number;
};
