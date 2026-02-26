"use client";

export type UserListItem = {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  type?: string;
  status?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
};

export type UserListResponse = {
  data: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type UserRole = {
  userId?: string;
  roleId?: string;
  assignedAt?: string;
  role: {
    id: string;
    key?: string;
    name?: string | null;
  };
};

export type UserSubscription = {
  id: string;
  status?: string;
  startsAt?: string;
  endsAt?: string | null;
  planId?: string;
  plan?: {
    id?: string;
    key?: string;
    name?: string | null;
    tier?: string | null;
  } | null;
  metadataJson?: unknown;
};

export type UserEntitlement = {
  id: string;
  kind?: string;
  scopeJson?: unknown;
  reason?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  revokedReason?: string | null;
};

export type UserActivity = {
  lastNoteReadAt?: string | null;
  lastPracticeAt?: string | null;
  lastTestAt?: string | null;
};

export type UserDetail = {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  type?: string;
  status?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
  lastActiveAt?: string | null;
  userRoles?: UserRole[];
  effectivePermissions?: string[];
  subscriptions?: UserSubscription[];
  entitlements?: UserEntitlement[];
  activity?: UserActivity;
};
