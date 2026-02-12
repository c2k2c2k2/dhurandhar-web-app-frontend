"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useAuditLogs } from "@/modules/audit/hooks";
import { useToast } from "@/modules/shared/components/Toast";
import type { AuditLog } from "@/modules/audit/types";

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

export default function AdminAuditPage() {
  const { toast } = useToast();
  const [actorUserId, setActorUserId] = React.useState("");
  const [action, setAction] = React.useState("");
  const [resourceType, setResourceType] = React.useState("");
  const [resourceId, setResourceId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [activeLog, setActiveLog] = React.useState<AuditLog | null>(null);
  const pageSize = 20;

  const query = {
    actorUserId: actorUserId || undefined,
    action: action || undefined,
    resourceType: resourceType || undefined,
    resourceId: resourceId || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useAuditLogs(query);

  const handleCopy = async () => {
    if (!activeLog) return;
    const payload = JSON.stringify(activeLog.metaJson ?? {}, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      toast({ title: "Audit JSON copied" });
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = payload;
        textarea.style.position = "fixed";
        textarea.style.left = "-1000px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast({ title: "Audit JSON copied" });
      } catch {
        toast({
          title: "Copy failed",
          description: "Unable to copy audit JSON.",
          variant: "destructive",
        });
      }
    }
  };

  const columns = React.useMemo<DataTableColumn<AuditLog>[]>(
    () => [
      {
        key: "action",
        header: "Action",
        render: (log) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{log.action || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {log.resourceType || "-"} {log.resourceId ? `• ${log.resourceId}` : ""}
            </p>
          </div>
        ),
      },
      {
        key: "actor",
        header: "Actor",
        render: (log) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {log.actorUser?.fullName || log.actorUser?.email || log.actorUserId || "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.actorUser?.email || "-"}
            </p>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "When",
        render: (log) => formatDate(log.createdAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (log) => (
          <Button variant="ghost" size="sm" onClick={() => setActiveLog(log)}>
            View
          </Button>
        ),
      },
    ],
    []
  );

  const rows = data?.data ?? [];

  return (
    <RequirePerm perm="admin.audit.read">
      <div className="space-y-6">
        <PageHeader
          title="Audit Logs"
          description="Track admin activity and system changes."
        />
        <FiltersBar
          filters={
            <>
              <Input
                placeholder="Actor user ID (optional)"
                value={actorUserId}
                onChange={(event) => {
                  setActorUserId(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="Action (e.g., users.block)"
                value={action}
                onChange={(event) => {
                  setAction(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="Resource type (e.g., User)"
                value={resourceType}
                onChange={(event) => {
                  setResourceType(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="Resource ID (optional)"
                value={resourceId}
                onChange={(event) => {
                  setResourceId(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
            </>
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setActorUserId("");
                setAction("");
                setResourceType("");
                setResourceId("");
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : error
                ? "Unable to load audit logs."
                : null
          }
          emptyLabel="No audit logs found."
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
        open={Boolean(activeLog)}
        onOpenChange={(open) => {
          if (!open) setActiveLog(null);
        }}
        title="Audit Details"
        description="Full audit metadata payload."
        className="max-w-3xl"
      >
        {activeLog ? (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Action</p>
                <p className="font-medium">{activeLog.action || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actor</p>
                <p className="font-medium">
                  {activeLog.actorUser?.fullName ||
                    activeLog.actorUser?.email ||
                    activeLog.actorUserId ||
                    "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resource</p>
                <p className="font-medium">
                  {activeLog.resourceType || "-"}{" "}
                  {activeLog.resourceId ? `• ${activeLog.resourceId}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">When</p>
                <p className="font-medium">{formatDate(activeLog.createdAt)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                Copy JSON
              </Button>
            </div>
            <pre className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
{JSON.stringify(activeLog.metaJson ?? {}, null, 2)}
            </pre>
          </div>
        ) : null}
      </Modal>
    </RequirePerm>
  );
}
