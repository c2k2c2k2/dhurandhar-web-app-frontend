export type AccountProfile = {
  id: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  type: "STUDENT" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  createdAt?: string;
  lastLoginAt?: string | null;
  lastActiveAt?: string | null;
};

export type UpdateMyProfilePayload = {
  fullName?: string;
  phone?: string;
};
