"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useToast } from "@/modules/shared/components/Toast";
import {
  useCreateBroadcast,
  useNotificationBroadcasts,
  useNotificationTemplates,
  useScheduleBroadcast,
  useCancelBroadcast,
} from "@/modules/notifications/hooks";
import type { NotificationBroadcast } from "@/modules/notifications/types";
import { FormInput, FormSelect, FormTextarea } from "@/modules/shared/components/FormField";

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
    DRAFT: "bg-slate-100 text-slate-600",
    SCHEDULED: "bg-amber-50 text-amber-700",
    SENT: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${classes[normalized] ?? "bg-muted text-muted-foreground"}`}
    >
      {normalized}
    </span>
  );
}

export default function AdminNotificationBroadcastsPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, "notifications.manage");
  const { toast } = useToast();

  const [status, setStatus] = React.useState("");
  const [channel, setChannel] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const query = {
    status: status || undefined,
    channel: channel || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useNotificationBroadcasts(query);
  const { data: templates } = useNotificationTemplates({});
  const createBroadcast = useCreateBroadcast(query);
  const scheduleBroadcast = useScheduleBroadcast(query);
  const cancelBroadcast = useCancelBroadcast(query);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [broadcastChannel, setBroadcastChannel] = React.useState("EMAIL");
  const [templateId, setTemplateId] = React.useState("");
  const [audienceJson, setAudienceJson] = React.useState("{}");
  const [scheduledAt, setScheduledAt] = React.useState("");

  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleId, setScheduleId] = React.useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = React.useState("");

  const handleCreate = async () => {
    let parsedAudience: Record<string, unknown>;
    try {
      parsedAudience = JSON.parse(audienceJson || "{}") as Record<string, unknown>;
    } catch {
      toast({
        title: "Invalid audience JSON",
        description: "Audience JSON must be valid JSON.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBroadcast.mutateAsync({
        title: title.trim(),
        channel: broadcastChannel,
        templateId: templateId || undefined,
        audienceJson: parsedAudience,
        scheduledAt: scheduledAt || undefined,
      });
      toast({ title: "Broadcast created" });
      setCreateOpen(false);
      setTitle("");
      setTemplateId("");
      setAudienceJson("{}");
      setScheduledAt("");
    } catch (err) {
      toast({
        title: "Create failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to create broadcast.",
        variant: "destructive",
      });
    }
  };

  const handleSchedule = async () => {
    if (!scheduleId) return;
    try {
      await scheduleBroadcast.mutateAsync({
        broadcastId: scheduleId,
        scheduledAt: scheduleAt || undefined,
      });
      toast({ title: "Broadcast scheduled" });
      setScheduleOpen(false);
      setScheduleId(null);
      setScheduleAt("");
    } catch (err) {
      toast({
        title: "Schedule failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to schedule broadcast.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (broadcastId: string) => {
    try {
      await cancelBroadcast.mutateAsync(broadcastId);
      toast({ title: "Broadcast cancelled" });
    } catch (err) {
      toast({
        title: "Cancel failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to cancel broadcast.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<NotificationBroadcast>[]>(
    () => [
      {
        key: "title",
        header: "Broadcast",
        render: (broadcast) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{broadcast.title || broadcast.id}</p>
            <p className="text-xs text-muted-foreground">
              {broadcast.template?.key || "No template"}
            </p>
          </div>
        ),
      },
      {
        key: "channel",
        header: "Channel",
        render: (broadcast) => broadcast.channel || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (broadcast) => statusBadge(broadcast.status),
      },
      {
        key: "scheduledAt",
        header: "Scheduled",
        render: (broadcast) => formatDate(broadcast.scheduledAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (broadcast) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!canManage}
              onClick={() => {
                setScheduleId(broadcast.id);
                setScheduleAt(broadcast.scheduledAt || "");
                setScheduleOpen(true);
              }}
            >
              Schedule
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!canManage}
              onClick={() => handleCancel(broadcast.id)}
            >
              Cancel
            </Button>
          </div>
        ),
      },
    ],
    [canManage]
  );

  return (
    <RequirePerm perm="notifications.read">
      <div className="space-y-6">
        <PageHeader
          title="Broadcasts"
          description="Schedule and manage broadcasts to student audiences."
          actions={
            canManage ? (
              <Button variant="cta" onClick={() => setCreateOpen(true)}>
                New Broadcast
              </Button>
            ) : null
          }
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
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="SENT">Sent</option>
                <option value="CANCELLED">Cancelled</option>
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
            </>
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setStatus("");
                setChannel("");
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
                ? "Unable to load broadcasts."
                : null
          }
          emptyLabel="No broadcasts found."
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
        onOpenChange={setCreateOpen}
        title="Create Broadcast"
        description="Create a new notification broadcast."
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <FormInput
            label="Title"
            placeholder="Weekly update"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <FormSelect
            label="Channel"
            value={broadcastChannel}
            onChange={(event) => setBroadcastChannel(event.target.value)}
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </FormSelect>
          <FormSelect
            label="Template"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
          >
            <option value="">Select template</option>
            {(templates || []).map((template) => (
              <option key={template.id} value={template.id}>
                {template.key} ({template.channel})
              </option>
            ))}
          </FormSelect>
          <FormTextarea
            label="Audience JSON"
            description="Use presets below if you are unsure."
            placeholder='{"type":"STUDENT"}'
            value={audienceJson}
            onChange={(event) => setAudienceJson(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setAudienceJson('{"type":"STUDENT"}')}
            >
              All students
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setAudienceJson('{"hasActiveSubscription":true}')}
            >
              Premium only
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setAudienceJson('{"hasActiveSubscription":false}')}
            >
              No active plan
            </Button>
          </div>
          <FormInput
            label="Scheduled At"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to send as soon as it is scheduled.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="cta" onClick={handleCreate}>
              Create Broadcast
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        title="Schedule Broadcast"
        description="Set a schedule time for this broadcast."
      >
        <div className="space-y-4">
          <FormInput
            label="Scheduled At"
            type="datetime-local"
            value={scheduleAt}
            onChange={(event) => setScheduleAt(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="cta" onClick={handleSchedule}>
              Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </RequirePerm>
  );
}
