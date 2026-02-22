"use client";

export type CouponType = "PERCENT" | "FIXED";

export type AdminCoupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  minAmountPaise?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  metadataJson?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCouponList = {
  data: AdminCoupon[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminCouponInput = {
  code: string;
  type: CouponType;
  value: number;
  maxRedemptions?: number;
  maxRedemptionsPerUser?: number;
  minAmountPaise?: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
  metadataJson?: Record<string, unknown>;
};

export type AdminCouponUpdateInput = Partial<AdminCouponInput>;
