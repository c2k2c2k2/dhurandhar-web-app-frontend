"use client";

export type PlanDurationUnit = "DAYS" | "MONTHS" | "YEARS" | "LIFETIME";

export type PlanValidity = {
  unit: PlanDurationUnit;
  value?: number | null;
  durationDays: number;
  label: string;
};

export type AdminPlan = {
  id: string;
  key: string;
  name: string;
  tier?: string | null;
  pricePaise: number;
  durationDays: number;
  isActive: boolean;
  metadataJson?: Record<string, unknown> | null;
  featuresJson?: unknown;
  validity?: PlanValidity;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPlanList = {
  data: AdminPlan[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminPlanInput = {
  key: string;
  name: string;
  tier?: string;
  pricePaise: number;
  durationDays?: number;
  durationValue?: number;
  durationUnit?: PlanDurationUnit;
  isActive?: boolean;
  metadataJson?: Record<string, unknown>;
  featuresJson?: Record<string, unknown>;
};

export type AdminPlanUpdateInput = Partial<AdminPlanInput>;
