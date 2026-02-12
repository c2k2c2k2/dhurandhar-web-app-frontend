"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useToast } from "@/modules/shared/components/Toast";
import {
  useNotificationMessages,
  useResendMessage,
} from "@/modules/notifications/hooks";
import type { NotificationMessage } from "@/modules/notifications/types";

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

function statusBadge(status?: string | null) {
  const normalized = status || "UNKNOWN";
  const classes: Record<string, string> = {
    SENT: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-rose-50 text-rose-700",
    PENDING: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${classes[normalized] ?? "bg-muted text-muted-foreground"}`}
    >
      {normalized}
    </span>
  );
}

export default function AdminNotificationMessagesPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, "notifications.manage");
  const { toast } = useToast();

  const [status, setStatus] = React.useState("");
  const [channel, setChannel] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [templateId, setTemplateId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const query = {
    status: status || undefined,
    channel: channel || undefined,
    userId: userId || undefined,
    templateId: templateId || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useNotificationMessages(query);
  const resendMessage = useResendMessage(query);

  const handleResend = async (messageId: string) => {
    try {
      await resendMessage.mutateAsync(messageId);
      toast({ title: "Message resent" });
    } catch (err) {
      toast({
        title: "Resend failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to resend message.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<NotificationMessage>[]>(
    () => [
      {
        key: "message",
        header: "Message",
        render: (message) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {message.template?.key || message.id}
            </p>
            <p className="text-xs text-muted-foreground">
              {message.user?.email || message.userId || "Unknown user"}
            </p>
          </div>
        ),
      },
      {
        key: "channel",
        header: "Channel",
        render: (message) => message.channel || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (message) => statusBadge(message.status),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (message) => formatDate(message.createdAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (message) => (
          <Button
            variant="ghost"
            size="sm"
            disabled={!canManage || resendMessage.isPending}
            onClick={() => handleResend(message.id)}
          >
            Resend
          </Button>
        ),
      },
    ],
    [canManage, resendMessage.isPending]
  );

  return (
    <RequirePerm perm="notifications.read">
      <div className="space-y-6">
        <PageHeader
          title="Notification Messages"
          description="Review delivery status and resend messages if needed."
        />

        <FiltersBar
          filters={
            <>
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
              </select>
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={channel}
                onChange={(event) => {
                  setChannel(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All channels</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
              <Input
                placeholder="User ID (from Users page)"
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="Template ID (from Templates page)"
                value={templateId}
                onChange={(event) => {
                  setTemplateId(event.target.value);
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
                setStatus("");
                setChannel("");
                setUserId("");
                setTemplateId("");
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
          rows={data?.data ?? []}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : error
                ? "Unable to load messages."
                : null
          }
          emptyLabel="No messages available."
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
