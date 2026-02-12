import type { UserMe } from "@/lib/auth/types";

export type PermissionKey =
  | "content.manage"
  | "notes.read"
  | "notes.write"
  | "notes.publish"
  | "questions.read"
  | "questions.crud"
  | "questions.publish"
  | "tests.crud"
  | "tests.publish"
  | "payments.read"
  | "users.read"
  | "users.manage"
  | "security.manage"
  | "security.read"
  | "analytics.read"
  | "admin.config.write"
  | "admin.audit.read"
  | "notifications.read"
  | "notifications.manage"
  | string;

function isSuperAdmin(user: UserMe | null) {
  return user?.roles?.includes("ADMIN_SUPER");
}

export function hasPermission(user: UserMe | null, permission: PermissionKey) {
  if (isSuperAdmin(user)) {
    return true;
  }
  if (!user?.permissions?.length) {
    return false;
  }
  return user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: UserMe | null,
  permissions?: PermissionKey[]
) {
  if (isSuperAdmin(user)) {
    return true;
  }
  if (!permissions || permissions.length === 0) {
    return true;
  }
  return permissions.some((permission) => hasPermission(user, permission));
}
