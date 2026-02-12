"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useToast } from "@/modules/shared/components/Toast";
import {
  useBlockUser,
  useForceLogout,
  useGrantEntitlement,
  useRevokeEntitlement,
  useUnblockUser,
  useUser,
} from "@/modules/users/hooks";
import type { EntitlementPayload } from "@/modules/users/api";
import { FormInput, FormTextarea } from "@/modules/shared/components/FormField";

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
  const canManage = hasPermission(adminUser, "users.manage");

  const blockUser = useBlockUser({
    page: 1,
    pageSize: 20,
  });
  const unblockUser = useUnblockUser({
    page: 1,
    pageSize: 20,
  });
  const forceLogout = useForceLogout();
  const grantEntitlement = useGrantEntitlement(userId);
  const revokeEntitlement = useRevokeEntitlement(userId);

  const [blockOpen, setBlockOpen] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState("");

  const [entitlementOpen, setEntitlementOpen] = React.useState(false);
  const [entitlementMode, setEntitlementMode] = React.useState<
    "grant" | "revoke"
  >("grant");
  const [entitlementKind, setEntitlementKind] = React.useState("");
  const [entitlementReason, setEntitlementReason] = React.useState("");
  const [entitlementScope, setEntitlementScope] = React.useState("");
  const [entitlementStartsAt, setEntitlementStartsAt] = React.useState("");
  const [entitlementEndsAt, setEntitlementEndsAt] = React.useState("");

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
          description="Review roles, subscriptions, entitlements, and activity."
          actions={
            <div className="flex flex-wrap gap-2">
              {canManage ? (
                <>
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
                data.userRoles.map((role, index) => (
                  <div
                    key={role.id ?? role.role.id ?? role.role.key ?? `role-${index}`}
                    className="rounded-xl border border-border bg-muted/40 px-3 py-2"
                  >
                    {role.role.name || role.role.key || role.role.id}
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
            placeholder="e.g., SUBJECT_NOTES"
            value={entitlementKind}
            onChange={(event) => setEntitlementKind(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Use a clear entitlement name, for example: SUBJECT_NOTES or PLAN_PRO.
          </p>
          <FormTextarea
            label="Scope JSON"
            placeholder='{"subjectId":"..."}'
            value={entitlementScope}
            onChange={(event) => setEntitlementScope(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave scope empty if the entitlement applies to all subjects.
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
    </RequirePerm>
  );
}
