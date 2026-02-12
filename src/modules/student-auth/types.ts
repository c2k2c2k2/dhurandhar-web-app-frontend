export type EntitlementScope = {
  subjectIds?: string[];
  topicIds?: string[];
  noteIds?: string[];
};

export type StudentEntitlement = {
  id: string;
  kind: "NOTES" | "TESTS" | "PRACTICE" | "ALL";
  scopeJson?: EntitlementScope | null;
  reason?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  subscriptionId?: string | null;
};

export type StudentPlan = {
  id: string;
  key: string;
  name: string;
  tier?: string | null;
  pricePaise: number;
  durationDays: number;
  metadataJson?: Record<string, unknown> | null;
  featuresJson?: unknown;
};

export type StudentSubscription = {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  startsAt?: string | null;
  endsAt?: string | null;
  plan?: StudentPlan | null;
};

export type StudentMe = {
  id: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  type: "STUDENT" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  createdAt?: string;
  lastLoginAt?: string | null;
  lastActiveAt?: string | null;
  subscription?: StudentSubscription | null;
  entitlements?: StudentEntitlement[];
};

export type NoteAccessCheck = {
  allowed: boolean;
  reason?: "NO_SUBSCRIPTION" | "NO_ENTITLEMENT" | "SCOPE_MISMATCH";
};

export type NoteAccessInput = {
  id: string;
  subjectId: string;
  isPremium: boolean;
  topicIds?: string[];
};
