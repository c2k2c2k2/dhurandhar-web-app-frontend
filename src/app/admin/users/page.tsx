"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useUsers } from "@/modules/users/hooks";
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

  const columns = React.useMemo<DataTableColumn<UserListItem>[]>(
    () => [
      {
        key: "name",
        header: "User",
        render: (user) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{user.fullName || "Unnamed"}</p>
            <p className="text-xs text-muted-foreground">{user.email || "-"}</p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (user) => user.type || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (user) => statusBadge(user.status),
      },
      {
        key: "lastLoginAt",
        header: "Last Login",
        render: (user) => formatDate(user.lastLoginAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (user) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/${user.id}`}>View</Link>
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
          description="Manage user accounts, access, and entitlements."
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
    </RequirePerm>
  );
}
