"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Modal } from "@/modules/shared/components/Modal";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { useToast } from "@/modules/shared/components/Toast";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useNotificationTemplates,
  useUpdateTemplate,
} from "@/modules/notifications/hooks";
import type { NotificationTemplate } from "@/modules/notifications/types";
import {
  FormInput,
  FormSelect,
  FormSwitch,
} from "@/modules/shared/components/FormField";
import {
  StringListEditor,
  StructuredObjectEditor,
} from "@/modules/shared/components/StructuredEditors";
import {
  buildStructuredRecord,
  splitStructuredRecord,
  type StructuredObjectEntry,
} from "@/modules/shared/structured-data";

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
  const deleteTemplate = useDeleteTemplate(query);
  const updateTemplate = useUpdateTemplate(query);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [activeTemplate, setActiveTemplate] = React.useState<NotificationTemplate | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = React.useState<NotificationTemplate | null>(null);
  const [keyValue, setKeyValue] = React.useState("");
  const [templateChannel, setTemplateChannel] = React.useState("EMAIL");
  const [subject, setSubject] = React.useState("");
  const [messageText, setMessageText] = React.useState("");
  const [messageHtml, setMessageHtml] = React.useState("");
  const [variables, setVariables] = React.useState<string[]>([]);
  const [activeFlag, setActiveFlag] = React.useState(true);
  const [bodyEntries, setBodyEntries] = React.useState<StructuredObjectEntry[]>([]);
  const [bodyPreserved, setBodyPreserved] = React.useState<Record<string, unknown>>({});
  const [bodyNotice, setBodyNotice] = React.useState("");

  const sampleBodyByChannel: Record<string, { text: string; html?: string }> = {
    EMAIL: {
      text: "Hello {{name}}, your payment is confirmed.",
      html: "<p>Hello {{name}}, your payment is confirmed.</p>",
    },
    SMS: { text: "Payment received. Thank you!" },
    WHATSAPP: { text: "Hi {{name}}, your plan is active now." },
  };

  const openEditor = (template?: NotificationTemplate | null) => {
    if (template) {
      const bodyValue =
        template.bodyJson && typeof template.bodyJson === "object" && !Array.isArray(template.bodyJson)
          ? (template.bodyJson as Record<string, unknown>)
          : typeof template.bodyJson === "string"
            ? { text: template.bodyJson }
            : {};
      const { text, html, ...rest } = bodyValue;
      const bodyState = splitStructuredRecord(rest);

      setActiveTemplate(template);
      setKeyValue(template.key);
      setTemplateChannel(template.channel);
      setSubject(template.subject || "");
      setMessageText(typeof text === "string" ? text : "");
      setMessageHtml(typeof html === "string" ? html : "");
      setVariables(
        Array.isArray(template.variablesJson)
          ? template.variablesJson.map((item) => String(item).trim()).filter(Boolean)
          : []
      );
      setBodyEntries(bodyState.entries);
      setBodyPreserved(bodyState.preserved);
      setBodyNotice(
        bodyState.hasUnsupported
          ? "Some advanced body fields are preserved automatically but cannot be edited from this form."
          : ""
      );
      setActiveFlag(template.isActive ?? true);
    } else {
      setActiveTemplate(null);
      setKeyValue("");
      setTemplateChannel("EMAIL");
      setSubject("");
      setMessageText("");
      setMessageHtml("");
      setVariables([]);
      setBodyEntries([]);
      setBodyPreserved({});
      setBodyNotice("");
      setActiveFlag(true);
    }
    setEditorOpen(true);
  };

  const handleSubmit = async () => {
    const parsedBody = buildStructuredRecord(bodyEntries, bodyPreserved);
    const bodyJson = {
      ...parsedBody,
      ...(messageText.trim() ? { text: messageText.trim() } : {}),
      ...(messageHtml.trim() ? { html: messageHtml.trim() } : {}),
    };

    const variablesJson = variables.map((item) => item.trim()).filter(Boolean);

    try {
      if (activeTemplate) {
        await updateTemplate.mutateAsync({
          templateId: activeTemplate.id,
          payload: {
            channel: templateChannel,
            subject: subject || undefined,
            bodyJson,
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
          bodyJson,
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

  const handleDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate.mutateAsync(deleteTarget.id);
      toast({ title: "Template deleted" });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to delete template.",
        variant: "destructive",
      });
    }
  }, [deleteTarget, deleteTemplate, toast]);

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
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditor(template)}
              disabled={!canManage}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(template)}
              disabled={!canManage}
            >
              Delete
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
          <FormInput
            label="Message Text"
            placeholder="Hello {{name}}"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
          />
          {templateChannel === "EMAIL" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email HTML (optional)</label>
              <textarea
                className="min-h-[140px] w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                placeholder="<p>Hello {{name}}</p>"
                value={messageHtml}
                onChange={(event) => setMessageHtml(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave this empty to use plain text only.
              </p>
            </div>
          ) : null}
          <StructuredObjectEditor
            label="Additional Body Fields"
            description="Optional extra values for advanced templates."
            entries={bodyEntries}
            onChange={setBodyEntries}
            preserveNotice={bodyNotice}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => {
                const sample = sampleBodyByChannel[templateChannel] || { text: "" };
                setMessageText(sample.text);
                setMessageHtml(sample.html || "");
              }}
            >
              Use sample body
            </Button>
            <p className="text-xs text-muted-foreground">
              Tip: keep it short and simple. Variables use {"{{variableName}}"}.
            </p>
          </div>
          <StringListEditor
            label="Variables"
            description="Add the variable names this template expects."
            values={variables}
            onChange={setVariables}
            itemLabel="Variable"
            addLabel="Add variable"
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this template?"
        description="Templates linked to messages or broadcasts cannot be deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </RequirePerm>
  );
}
