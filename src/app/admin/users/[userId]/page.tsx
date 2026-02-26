"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAccessRoles } from "@/modules/access-control/hooks";
import { useAdminPlans } from "@/modules/admin-plans/hooks";
import type { EntitlementPayload } from "@/modules/users/api";
import {
  useActivateUserSubscription,
  useBlockUser,
  useForceLogout,
  useGrantEntitlement,
  useRevokeEntitlement,
  useUnblockUser,
  useUpdateUser,
  useUser,
} from "@/modules/users/hooks";
import { FormInput, FormSelect, FormTextarea } from "@/modules/shared/components/FormField";
import { Modal } from "@/modules/shared/components/Modal";
import { MultiSelectField } from "@/modules/shared/components/MultiSelect";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useToast } from "@/modules/shared/components/Toast";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = typeof params?.userId === "string" ? params.userId : "";
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const { data, isLoading, error } = useUser(userId);

  const canManageUsers = hasPermission(adminUser, "users.manage");
  const canReadRbac = hasPermission(adminUser, "rbac.read");
  const canManageRbac = hasPermission(adminUser, "rbac.manage");
  const canReadPayments = hasPermission(adminUser, "payments.read");
  const canManageSubscriptions = hasPermission(adminUser, "subscriptions.manage");
  const canAttachSubscriptions = canReadPayments && canManageSubscriptions;

  const targetIsAdmin =
    data?.type === "ADMIN" ||
    Boolean(
      data?.userRoles?.some(
        (roleLink) => roleLink.role.key && roleLink.role.key !== "STUDENT"
      )
    );

  const canManageTarget =
    canManageUsers && (!targetIsAdmin || canManageRbac);

  const blockUser = useBlockUser({ page: 1, pageSize: 20 });
  const unblockUser = useUnblockUser({ page: 1, pageSize: 20 });
  const forceLogout = useForceLogout();
  const grantEntitlement = useGrantEntitlement(userId);
  const revokeEntitlement = useRevokeEntitlement(userId);
  const activateSubscription = useActivateUserSubscription(userId);
  const updateUser = useUpdateUser(userId);

  const [blockOpen, setBlockOpen] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState("");

  const [entitlementOpen, setEntitlementOpen] = React.useState(false);
  const [entitlementMode, setEntitlementMode] = React.useState<"grant" | "revoke">("grant");
  const [entitlementKind, setEntitlementKind] = React.useState("");
  const [entitlementReason, setEntitlementReason] = React.useState("");
  const [entitlementScope, setEntitlementScope] = React.useState("");
  const [entitlementStartsAt, setEntitlementStartsAt] = React.useState("");
  const [entitlementEndsAt, setEntitlementEndsAt] = React.useState("");

  const [attachSubscriptionOpen, setAttachSubscriptionOpen] = React.useState(false);
  const [attachPlanId, setAttachPlanId] = React.useState("");
  const [attachReason, setAttachReason] = React.useState("");

  const [editOpen, setEditOpen] = React.useState(false);
  const [editEmail, setEditEmail] = React.useState("");
  const [editFullName, setEditFullName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editPassword, setEditPassword] = React.useState("");
  const [editType, setEditType] = React.useState<"STUDENT" | "ADMIN">("STUDENT");
  const [editStatus, setEditStatus] = React.useState<"ACTIVE" | "BLOCKED">("ACTIVE");
  const [editRoleIds, setEditRoleIds] = React.useState<string[]>([]);

  const rolesQuery = useAccessRoles(canReadRbac && editOpen);
  const plansQuery = useAdminPlans(
    {
      isActive: "true",
      page: 1,
      pageSize: 100,
    },
    canAttachSubscriptions && attachSubscriptionOpen,
  );

  const roleOptions = React.useMemo(() => {
    const all = rolesQuery.data ?? [];
    const filtered =
      editType === "ADMIN"
        ? all.filter((role) => role.key !== "STUDENT")
        : all.filter((role) => role.key === "STUDENT");

    return filtered.map((role) => ({
      id: role.id,
      label: `${role.name} (${role.key})`,
    }));
  }, [rolesQuery.data, editType]);

  const openEdit = () => {
    if (!data) return;
    setEditEmail(data.email ?? "");
    setEditFullName(data.fullName ?? "");
    setEditPhone(data.phone ?? "");
    setEditPassword("");
    setEditType((data.type as "STUDENT" | "ADMIN") ?? "STUDENT");
    setEditStatus((data.status as "ACTIVE" | "BLOCKED") ?? "ACTIVE");
    setEditRoleIds(data.userRoles?.map((roleLink) => roleLink.role.id) ?? []);
    setEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editEmail.trim()) {
      toast({
        title: "Email required",
        description: "Email is required to update a user.",
        variant: "destructive",
      });
      return;
    }

    if (editType === "ADMIN" && !canManageRbac) {
      toast({
        title: "Not allowed",
        description: "You do not have permission to update admin users.",
        variant: "destructive",
      });
      return;
    }

    if (editType === "ADMIN" && canReadRbac && editRoleIds.length === 0) {
      toast({
        title: "Role required",
        description: "At least one role is required for admin users.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUser.mutateAsync({
        email: editEmail.trim(),
        fullName: editFullName,
        phone: editPhone,
        type: editType,
        status: editStatus,
        password: editPassword.trim() || undefined,
        roleIds: canReadRbac ? editRoleIds : undefined,
      });

      toast({ title: "User updated" });
      setEditOpen(false);
    } catch (err) {
      toast({
        title: "Update failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to update user.",
        variant: "destructive",
      });
    }
  };

  const handleBlock = async () => {
    if (!userId) return;
    try {
      await blockUser.mutateAsync({ userId, reason: blockReason || undefined });
      toast({ title: "User blocked" });
      setBlockOpen(false);
      setBlockReason("");
    } catch (err) {
      toast({
        title: "Block failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to block user.",
        variant: "destructive",
      });
    }
  };

  const handleUnblock = async () => {
    if (!userId) return;
    try {
      await unblockUser.mutateAsync(userId);
      toast({ title: "User unblocked" });
    } catch (err) {
      toast({
        title: "Unblock failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to unblock user.",
        variant: "destructive",
      });
    }
  };

  const handleForceLogout = async () => {
    if (!userId) return;
    try {
      await forceLogout.mutateAsync(userId);
      toast({ title: "User logged out" });
    } catch (err) {
      toast({
        title: "Force logout failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to force logout.",
        variant: "destructive",
      });
    }
  };

  const handleEntitlementSubmit = async () => {
    if (!entitlementKind) {
      toast({
        title: "Entitlement kind required",
        description: "Provide an entitlement kind before submitting.",
        variant: "destructive",
      });
      return;
    }

    let parsedScope: Record<string, unknown> | undefined;
    if (entitlementScope.trim()) {
      try {
        parsedScope = JSON.parse(entitlementScope) as Record<string, unknown>;
      } catch {
        toast({
          title: "Invalid scope JSON",
          description: "Scope must be valid JSON.",
          variant: "destructive",
        });
        return;
      }
    }

    const payload: EntitlementPayload = {
      kind: entitlementKind,
      reason: entitlementReason || undefined,
      scopeJson: parsedScope,
      startsAt: entitlementStartsAt || undefined,
      endsAt: entitlementEndsAt || undefined,
    };

    try {
      if (entitlementMode === "grant") {
        await grantEntitlement.mutateAsync(payload);
        toast({ title: "Entitlement granted" });
      } else {
        await revokeEntitlement.mutateAsync(payload);
        toast({ title: "Entitlement revoked" });
      }
      setEntitlementOpen(false);
      setEntitlementKind("");
      setEntitlementReason("");
      setEntitlementScope("");
      setEntitlementStartsAt("");
      setEntitlementEndsAt("");
    } catch (err) {
      toast({
        title: "Entitlement action failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to update entitlement.",
        variant: "destructive",
      });
    }
  };

  const handleAttachSubscription = async () => {
    if (!attachPlanId.trim()) {
      toast({
        title: "Plan required",
        description: "Select a plan to attach subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      await activateSubscription.mutateAsync({
        planId: attachPlanId.trim(),
        reason: attachReason.trim() || undefined,
      });
      toast({ title: "Subscription attached" });
      setAttachSubscriptionOpen(false);
      setAttachPlanId("");
      setAttachReason("");
    } catch (err) {
      toast({
        title: "Subscription attach failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to attach subscription.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading user..." />;
  }

  if (error) {
    return (
      <ErrorState
        description={
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load user."
        }
      />
    );
  }

  if (!data) {
    return <ErrorState description="User not found." />;
  }

  return (
    <RequirePerm perm="users.read">
      <div className="space-y-6">
        <PageHeader
          title={data.fullName || data.email || "User"}
          description="Review profile, roles, subscriptions, entitlements, and activity."
          actions={
            <div className="flex flex-wrap gap-2">
              {canManageTarget ? (
                <>
                  <Button variant="secondary" onClick={openEdit}>
                    Edit User
                  </Button>
                  {data.status === "BLOCKED" ? (
                    <Button variant="secondary" onClick={handleUnblock}>
                      Unblock
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setBlockOpen(true)}>
                      Block
                    </Button>
                  )}
                  <Button variant="secondary" onClick={handleForceLogout}>
                    Force Logout
                  </Button>
                  <Button
                    variant="cta"
                    onClick={() => {
                      setEntitlementMode("grant");
                      setEntitlementOpen(true);
                    }}
                  >
                    Grant Entitlement
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEntitlementMode("revoke");
                      setEntitlementOpen(true);
                    }}
                  >
                    Revoke Entitlement
                  </Button>
                  {canAttachSubscriptions && data.type === "STUDENT" ? (
                    <Button
                      variant="secondary"
                      onClick={() => setAttachSubscriptionOpen(true)}
                    >
                      Attach Subscription
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Profile</h2>
            <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Email</dt>
                <dd className="text-foreground">{data.email || "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Phone</dt>
                <dd className="text-foreground">{data.phone || "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Type</dt>
                <dd className="text-foreground">{data.type || "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Status</dt>
                <dd className="text-foreground">{data.status || "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last Login</dt>
                <dd className="text-foreground">{formatDate(data.lastLoginAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last Active</dt>
                <dd className="text-foreground">{formatDate(data.lastActiveAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Activity</h2>
            <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Last Note Read</dt>
                <dd className="text-foreground">
                  {formatDate(data.activity?.lastNoteReadAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last Practice</dt>
                <dd className="text-foreground">
                  {formatDate(data.activity?.lastPracticeAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last Test</dt>
                <dd className="text-foreground">
                  {formatDate(data.activity?.lastTestAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Roles</h2>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {data.userRoles?.length ? (
                data.userRoles.map((roleLink, index) => (
                  <div
                    key={roleLink.roleId ?? roleLink.role.id ?? `role-${index}`}
                    className="rounded-xl border border-border bg-muted/40 px-3 py-2"
                  >
                    {roleLink.role.name || roleLink.role.key || roleLink.role.id}
                  </div>
                ))
              ) : (
                <p>No roles assigned.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Subscriptions</h2>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {data.subscriptions?.length ? (
                data.subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="rounded-xl border border-border bg-muted/40 px-3 py-2"
                  >
                    <div className="flex justify-between gap-3">
                      <span>{subscription.status || "UNKNOWN"}</span>
                      <span>
                        {formatDate(subscription.startsAt)} -{" "}
                        {formatDate(subscription.endsAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Plan:{" "}
                      {subscription.plan?.name ||
                        subscription.plan?.key ||
                        subscription.planId ||
                        "-"}
                    </p>
                  </div>
                ))
              ) : (
                <p>No subscriptions found.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Entitlements</h2>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {data.entitlements?.length ? (
                data.entitlements.map((entitlement) => (
                  <div
                    key={entitlement.id}
                    className="rounded-xl border border-border bg-muted/40 px-3 py-2"
                  >
                    <div className="flex justify-between gap-3">
                      <span>{entitlement.kind || "ENTITLEMENT"}</span>
                      <span>{formatDate(entitlement.endsAt)}</span>
                    </div>
                    {entitlement.reason ? (
                      <p className="text-xs text-muted-foreground">
                        Reason: {entitlement.reason}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p>No entitlements found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Effective Permissions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.effectivePermissions?.length ? (
              data.effectivePermissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded-full border border-border bg-muted/30 px-2 py-1 text-xs"
                >
                  {permission}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No effective permissions.</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title="Block User"
        description="Provide a reason for blocking this user."
      >
        <div className="space-y-4">
          <FormTextarea
            label="Reason"
            placeholder="Optional reason"
            value={blockReason}
            onChange={(event) => setBlockReason(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlock}>
              Block User
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={entitlementOpen}
        onOpenChange={setEntitlementOpen}
        title={entitlementMode === "grant" ? "Grant Entitlement" : "Revoke Entitlement"}
        description="Manage user entitlements and access."
      >
        <div className="space-y-4">
          <FormInput
            label="Entitlement Kind"
            placeholder="NOTES or ALL"
            value={entitlementKind}
            onChange={(event) => setEntitlementKind(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Allowed kinds are based on backend enum values.
          </p>
          <FormTextarea
            label="Scope JSON"
            placeholder='{"subjectId":"..."}'
            value={entitlementScope}
            onChange={(event) => setEntitlementScope(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave scope empty if entitlement applies globally.
          </p>
          <FormInput
            label="Reason"
            placeholder="Optional reason"
            value={entitlementReason}
            onChange={(event) => setEntitlementReason(event.target.value)}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="Starts At"
              type="datetime-local"
              value={entitlementStartsAt}
              onChange={(event) => setEntitlementStartsAt(event.target.value)}
            />
            <FormInput
              label="Ends At"
              type="datetime-local"
              value={entitlementEndsAt}
              onChange={(event) => setEntitlementEndsAt(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEntitlementOpen(false)}>
              Cancel
            </Button>
            <Button variant="cta" onClick={handleEntitlementSubmit}>
              {entitlementMode === "grant" ? "Grant" : "Revoke"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={attachSubscriptionOpen}
        onOpenChange={(open) => {
          setAttachSubscriptionOpen(open);
          if (!open) {
            setAttachPlanId("");
            setAttachReason("");
          }
        }}
        title="Attach Subscription"
        description="Activate a student subscription manually and log payment as admin fallback."
      >
        <div className="space-y-4">
          <FormSelect
            label="Plan"
            value={attachPlanId}
            onChange={(event) => setAttachPlanId(event.target.value)}
          >
            <option value="">Select active plan</option>
            {(plansQuery.data?.data ?? []).map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({(plan.pricePaise / 100).toFixed(2)} INR)
              </option>
            ))}
          </FormSelect>
          {plansQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading active plans...</p>
          ) : null}
          <FormInput
            label="Reason"
            placeholder="Optional fallback reason"
            value={attachReason}
            onChange={(event) => setAttachReason(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAttachSubscriptionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="cta"
              onClick={handleAttachSubscription}
              disabled={activateSubscription.isPending}
            >
              Attach Subscription
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit User"
        description="Update profile, status, type, and role assignments."
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="Email"
              type="email"
              value={editEmail}
              onChange={(event) => setEditEmail(event.target.value)}
            />
            <FormInput
              label="New Password"
              type="password"
              placeholder="Leave empty to keep current password"
              value={editPassword}
              onChange={(event) => setEditPassword(event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="Full Name"
              value={editFullName}
              onChange={(event) => setEditFullName(event.target.value)}
            />
            <FormInput
              label="Phone"
              value={editPhone}
              onChange={(event) => setEditPhone(event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormSelect
              label="Type"
              value={editType}
              disabled={!canManageRbac}
              onChange={(event) => {
                setEditType(event.target.value as "STUDENT" | "ADMIN");
                setEditRoleIds([]);
              }}
            >
              <option value="STUDENT">Student</option>
              {canManageRbac ? <option value="ADMIN">Admin</option> : null}
            </FormSelect>
            <FormSelect
              label="Status"
              value={editStatus}
              onChange={(event) =>
                setEditStatus(event.target.value as "ACTIVE" | "BLOCKED")
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </FormSelect>
          </div>

          {canReadRbac ? (
            <MultiSelectField
              label="Roles"
              description={
                editType === "ADMIN"
                  ? "Select one or more roles for this admin user."
                  : "Student role is optional; default student role is auto-assigned if omitted."
              }
              items={roleOptions}
              value={editRoleIds}
              onChange={setEditRoleIds}
              loading={rolesQuery.isLoading}
              loadingLabel="Loading roles..."
              emptyLabel="No roles available."
              modalTitle="Select Roles"
              modalDescription="Choose roles for this user."
              searchPlaceholder="Search roles"
            />
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="cta" onClick={handleUpdateUser} disabled={updateUser.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </RequirePerm>
  );
}
