"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { useToast } from "@/modules/shared/components/Toast";
import {
  useCreateTemplate,
  useNotificationTemplates,
  useUpdateTemplate,
} from "@/modules/notifications/hooks";
import type { NotificationTemplate } from "@/modules/notifications/types";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
} from "@/modules/shared/components/FormField";

function statusBadge(isActive?: boolean) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function AdminNotificationTemplatesPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, "notifications.manage");
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [channel, setChannel] = React.useState("");
  const [isActive, setIsActive] = React.useState("");

  const query = {
    search: search || undefined,
    channel: channel || undefined,
    isActive: isActive || undefined,
  };

  const { data, isLoading, error } = useNotificationTemplates(query);
  const createTemplate = useCreateTemplate(query);
  const updateTemplate = useUpdateTemplate(query);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [activeTemplate, setActiveTemplate] = React.useState<NotificationTemplate | null>(
    null
  );
  const [keyValue, setKeyValue] = React.useState("");
  const [templateChannel, setTemplateChannel] = React.useState("EMAIL");
  const [subject, setSubject] = React.useState("");
  const [bodyJson, setBodyJson] = React.useState("{}");
  const [variables, setVariables] = React.useState("");
  const [activeFlag, setActiveFlag] = React.useState(true);

  const sampleBodyByChannel: Record<string, string> = {
    EMAIL: JSON.stringify(
      { text: "Hello {{name}}, your payment is confirmed." },
      null,
      2
    ),
    SMS: JSON.stringify({ text: "Payment received. Thank you!" }, null, 2),
    WHATSAPP: JSON.stringify(
      { text: "Hi {{name}}, your plan is active now." },
      null,
      2
    ),
  };

  const openEditor = (template?: NotificationTemplate | null) => {
    if (template) {
      setActiveTemplate(template);
      setKeyValue(template.key);
      setTemplateChannel(template.channel);
      setSubject(template.subject || "");
      setBodyJson(JSON.stringify(template.bodyJson ?? {}, null, 2));
      setVariables((template.variablesJson || []).join(", "));
      setActiveFlag(template.isActive ?? true);
    } else {
      setActiveTemplate(null);
      setKeyValue("");
      setTemplateChannel("EMAIL");
      setSubject("");
      setBodyJson("{}");
      setVariables("");
      setActiveFlag(true);
    }
    setEditorOpen(true);
  };

  const handleSubmit = async () => {
    let parsedBody: Record<string, unknown>;
    try {
      parsedBody = JSON.parse(bodyJson || "{}") as Record<string, unknown>;
    } catch {
      toast({
        title: "Invalid body JSON",
        description: "Body JSON must be valid JSON.",
        variant: "destructive",
      });
      return;
    }

    const variablesJson = variables
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      if (activeTemplate) {
        await updateTemplate.mutateAsync({
          templateId: activeTemplate.id,
          payload: {
            channel: templateChannel,
            subject: subject || undefined,
            bodyJson: parsedBody,
            variablesJson: variablesJson.length ? variablesJson : undefined,
            isActive: activeFlag,
          },
        });
        toast({ title: "Template updated" });
      } else {
        await createTemplate.mutateAsync({
          key: keyValue.trim(),
          channel: templateChannel,
          subject: subject || undefined,
          bodyJson: parsedBody,
          variablesJson: variablesJson.length ? variablesJson : undefined,
          isActive: activeFlag,
        });
        toast({ title: "Template created" });
      }
      setEditorOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save template.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<NotificationTemplate>[]>(
    () => [
      {
        key: "key",
        header: "Template",
        render: (template) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{template.key}</p>
            <p className="text-xs text-muted-foreground">{template.channel}</p>
          </div>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        render: (template) => template.subject || "-",
      },
      {
        key: "active",
        header: "Status",
        render: (template) => statusBadge(template.isActive),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (template) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditor(template)}
            disabled={!canManage}
          >
            Edit
          </Button>
        ),
      },
    ],
    [canManage]
  );

  return (
    <RequirePerm perm="notifications.read">
      <div className="space-y-6">
        <PageHeader
          title="Notification Templates"
          description="Manage reusable notification templates."
          actions={
            canManage ? (
              <Button variant="cta" onClick={() => openEditor(null)}>
                New Template
              </Button>
            ) : null
          }
        />

        <FiltersBar
          filters={
            <>
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
              >
                <option value="">All channels</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={isActive}
                onChange={(event) => setIsActive(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </>
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setChannel("");
                setIsActive("");
              }}
            >
              Reset
            </Button>
          }
        />

        <DataTable
          columns={columns}
          rows={data ?? []}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : error
                ? "Unable to load templates."
                : null
          }
          emptyLabel="No templates available."
        />
      </div>

      <Modal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        title={activeTemplate ? "Edit Template" : "Create Template"}
        description="Templates power notifications and broadcasts."
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <FormInput
            label="Key"
            placeholder="payment.success"
            value={keyValue}
            onChange={(event) => setKeyValue(event.target.value)}
            disabled={Boolean(activeTemplate)}
          />
          <p className="text-xs text-muted-foreground">
            Use simple keys you can remember, for example: payment.success
          </p>
          <FormSelect
            label="Channel"
            value={templateChannel}
            onChange={(event) => setTemplateChannel(event.target.value)}
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </FormSelect>
          <FormInput
            label="Subject"
            placeholder="Optional subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
          <FormTextarea
            label="Body JSON"
            placeholder='{"text":"Hello {{name}}"}'
            value={bodyJson}
            onChange={(event) => setBodyJson(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() =>
                setBodyJson(sampleBodyByChannel[templateChannel] || "{}")
              }
            >
              Use sample body
            </Button>
            <p className="text-xs text-muted-foreground">
              Tip: keep it short and simple. Variables use {"{{variableName}}"}.
            </p>
          </div>
          <FormInput
            label="Variables"
            placeholder="name, planName"
            value={variables}
            onChange={(event) => setVariables(event.target.value)}
          />
          <FormSwitch
            label="Active"
            description="Active templates can be used in broadcasts."
            checked={activeFlag}
            onCheckedChange={setActiveFlag}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button variant="cta" onClick={handleSubmit} disabled={createTemplate.isPending}>
              {activeTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </div>
      </Modal>
    </RequirePerm>
  );
}
