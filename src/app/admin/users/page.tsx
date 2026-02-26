"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAccessRoles } from "@/modules/access-control/hooks";
import { useAdminPlans } from "@/modules/admin-plans/hooks";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { FormInput, FormSelect } from "@/modules/shared/components/FormField";
import { Modal } from "@/modules/shared/components/Modal";
import { MultiSelectField } from "@/modules/shared/components/MultiSelect";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useToast } from "@/modules/shared/components/Toast";
import { useActivateUserSubscription, useCreateUser, useUsers } from "@/modules/users/hooks";
import type { UserListItem } from "@/modules/users/types";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status?: string | null) {
  const normalized = status || "UNKNOWN";
  const classes: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    BLOCKED: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${classes[normalized] ?? "bg-muted text-muted-foreground"}`}
    >
      {normalized}
    </span>
  );
}

export default function AdminUsersPage() {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const canManageUsers = hasPermission(adminUser, "users.manage");
  const canReadRbac = hasPermission(adminUser, "rbac.read");
  const canManageRbac = hasPermission(adminUser, "rbac.manage");
  const canReadPayments = hasPermission(adminUser, "payments.read");
  const canManageSubscriptions = hasPermission(adminUser, "subscriptions.manage");
  const canAttachSubscriptions = canReadPayments && canManageSubscriptions;

  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [hasActiveSubscription, setHasActiveSubscription] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const query = {
    search: search || undefined,
    type: type || undefined,
    status: status || undefined,
    hasActiveSubscription: hasActiveSubscription || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useUsers(query);
  const createUser = useCreateUser();
  const activateSubscription = useActivateUserSubscription();
  const rolesQuery = useAccessRoles(canReadRbac);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createEmail, setCreateEmail] = React.useState("");
  const [createName, setCreateName] = React.useState("");
  const [createPhone, setCreatePhone] = React.useState("");
  const [createPassword, setCreatePassword] = React.useState("");
  const [createType, setCreateType] = React.useState<"STUDENT" | "ADMIN">("STUDENT");
  const [createStatus, setCreateStatus] = React.useState<"ACTIVE" | "BLOCKED">("ACTIVE");
  const [createRoleIds, setCreateRoleIds] = React.useState<string[]>([]);
  const [createPlanId, setCreatePlanId] = React.useState("");
  const [createSubscriptionReason, setCreateSubscriptionReason] = React.useState("");
  const plansQuery = useAdminPlans(
    {
      isActive: "true",
      page: 1,
      pageSize: 100,
    },
    createOpen && canAttachSubscriptions && createType === "STUDENT",
  );

  const roleOptions = React.useMemo(() => {
    const all = rolesQuery.data ?? [];
    const filtered =
      createType === "ADMIN"
        ? all.filter((role) => role.key !== "STUDENT")
        : all.filter((role) => role.key === "STUDENT");

    return filtered.map((role) => ({
      id: role.id,
      label: `${role.name} (${role.key})`,
    }));
  }, [rolesQuery.data, createType]);

  const resetCreateForm = React.useCallback(() => {
    setCreateEmail("");
    setCreateName("");
    setCreatePhone("");
    setCreatePassword("");
    setCreateType("STUDENT");
    setCreateStatus("ACTIVE");
    setCreateRoleIds([]);
    setCreatePlanId("");
    setCreateSubscriptionReason("");
  }, []);

  const handleCreateUser = async () => {
    if (!createEmail.trim() || !createPassword.trim()) {
      toast({
        title: "Missing required fields",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }

    if (createType === "ADMIN" && !canManageRbac) {
      toast({
        title: "Not allowed",
        description: "You do not have permission to create admin users.",
        variant: "destructive",
      });
      return;
    }

    if (createType === "ADMIN" && createRoleIds.length === 0) {
      toast({
        title: "Role required",
        description: "Select at least one role for admin users.",
        variant: "destructive",
      });
      return;
    }

    if (createType === "STUDENT" && createPlanId && !canAttachSubscriptions) {
      toast({
        title: "Not allowed",
        description:
          "You need payments.read and subscriptions.manage permissions to assign a subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createUser.mutateAsync({
        email: createEmail.trim(),
        password: createPassword,
        fullName: createName.trim() || undefined,
        phone: createPhone.trim() || undefined,
        type: createType,
        status: createStatus,
        roleIds: canReadRbac && createRoleIds.length ? createRoleIds : undefined,
      });

      if (createType === "STUDENT" && createPlanId.trim()) {
        try {
          await activateSubscription.mutateAsync({
            userId: created.id,
            planId: createPlanId.trim(),
            reason: createSubscriptionReason.trim() || undefined,
          });
          toast({
            title: "User created",
            description: "Subscription attached by admin.",
          });
        } catch (subscriptionError) {
          toast({
            title: "User created, subscription failed",
            description:
              subscriptionError &&
              typeof subscriptionError === "object" &&
              "message" in subscriptionError
                ? String(subscriptionError.message)
                : "User was created, but subscription activation failed.",
            variant: "destructive",
          });
        }
      } else {
        toast({ title: "User created" });
      }

      setCreateOpen(false);
      resetCreateForm();
    } catch (err) {
      toast({
        title: "User creation failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to create user.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<UserListItem>[]>(
    () => [
      {
        key: "name",
        header: "User",
        render: (userItem) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{userItem.fullName || "Unnamed"}</p>
            <p className="text-xs text-muted-foreground">{userItem.email || "-"}</p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (userItem) => userItem.type || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (userItem) => statusBadge(userItem.status),
      },
      {
        key: "lastLoginAt",
        header: "Last Login",
        render: (userItem) => formatDate(userItem.lastLoginAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (userItem) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/${userItem.id}`}>View</Link>
          </Button>
        ),
      },
    ],
    []
  );

  const users = data?.data ?? [];

  return (
    <RequirePerm perm="users.read">
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage user accounts, role assignments, and entitlements."
          actions={
            canManageUsers ? (
              <Button
                variant="cta"
                onClick={() => {
                  resetCreateForm();
                  setCreateOpen(true);
                }}
              >
                Create User
              </Button>
            ) : null
          }
        />
        <FiltersBar
          filters={
            <>
              <Input
                placeholder="Search by name, email, or phone"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All types</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
              </select>
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={hasActiveSubscription}
                onChange={(event) => {
                  setHasActiveSubscription(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">Plan status</option>
                <option value="true">Active only</option>
                <option value="false">No active plan</option>
              </select>
            </>
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setType("");
                setStatus("");
                setHasActiveSubscription("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />
        <DataTable
          columns={columns}
          rows={users}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : error
                ? "Unable to load users."
                : null
          }
          emptyLabel="No users available yet."
          pagination={
            data && data.total > data.pageSize
              ? {
                  page: data.page,
                  pageSize: data.pageSize,
                  total: data.total,
                  onPageChange: (nextPage) => setPage(nextPage),
                }
              : undefined
          }
        />
      </div>

      <Modal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
        title="Create User"
        description="Create a student or admin account and assign roles."
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="Email"
              type="email"
              placeholder="user@example.com"
              value={createEmail}
              onChange={(event) => setCreateEmail(event.target.value)}
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={createPassword}
              onChange={(event) => setCreatePassword(event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="Full Name"
              placeholder="Optional"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
            />
            <FormInput
              label="Phone"
              placeholder="Optional"
              value={createPhone}
              onChange={(event) => setCreatePhone(event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormSelect
              label="User Type"
              value={createType}
              onChange={(event) => {
                const nextType = event.target.value as "STUDENT" | "ADMIN";
                setCreateType(nextType);
                setCreateRoleIds([]);
                if (nextType === "ADMIN") {
                  setCreatePlanId("");
                  setCreateSubscriptionReason("");
                }
              }}
            >
              <option value="STUDENT">Student</option>
              {canManageRbac ? <option value="ADMIN">Admin</option> : null}
            </FormSelect>

            <FormSelect
              label="Status"
              value={createStatus}
              onChange={(event) =>
                setCreateStatus(event.target.value as "ACTIVE" | "BLOCKED")
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
                createType === "ADMIN"
                  ? "Select one or more roles for this admin user."
                  : "Student role is optional; default student role is auto-assigned if omitted."
              }
              items={roleOptions}
              value={createRoleIds}
              onChange={setCreateRoleIds}
              loading={rolesQuery.isLoading}
              loadingLabel="Loading roles..."
              emptyLabel="No roles available."
              modalTitle="Select Roles"
              modalDescription="Choose roles for this user."
              searchPlaceholder="Search roles"
            />
          ) : null}

          {createType === "STUDENT" && canAttachSubscriptions ? (
            <div className="grid gap-3 md:grid-cols-2">
              <FormSelect
                label="Initial Subscription Plan"
                value={createPlanId}
                onChange={(event) => setCreatePlanId(event.target.value)}
              >
                <option value="">No plan (create only user)</option>
                {(plansQuery.data?.data ?? []).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({(plan.pricePaise / 100).toFixed(2)} INR)
                  </option>
                ))}
              </FormSelect>
              <FormInput
                label="Subscription Reason"
                placeholder="Optional fallback reason"
                value={createSubscriptionReason}
                onChange={(event) => setCreateSubscriptionReason(event.target.value)}
                disabled={!createPlanId}
              />
              {plansQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">Loading active plans...</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                resetCreateForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="cta"
              onClick={handleCreateUser}
              disabled={createUser.isPending || activateSubscription.isPending}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </RequirePerm>
  );
}
