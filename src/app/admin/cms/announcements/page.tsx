"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { useToast } from "@/modules/shared/components/Toast";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { FormInput, FormSwitch } from "@/modules/shared/components/FormField";
import { CmsSubNav } from "@/modules/cms/components/CmsSubNav";
import { CmsBlocksEditor } from "@/modules/cms/components/CmsBlocksEditor";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from "@/modules/cms/hooks";
import type {
  Announcement,
  AnnouncementCreateInput,
} from "@/modules/cms/types";
import {
  badgeClass,
  buildCmsBodyJson,
  formatDate,
  formatDateInput,
  parseCmsBlocks,
  parseDateInput,
  type CmsBlock,
} from "@/modules/cms/utils";

const AnnouncementFormSchema = z.object({
  title: z.string().min(2, "Title is required."),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  pinned: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type AnnouncementFormValues = z.infer<typeof AnnouncementFormSchema>;

function formatSchedule(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt && !endsAt) return "Always on";
  if (startsAt && !endsAt) return `From ${formatDate(startsAt)}`;
  if (!startsAt && endsAt) return `Until ${formatDate(endsAt)}`;
  return `${formatDate(startsAt)} → ${formatDate(endsAt)}`;
}

function AnnouncementEditorModal({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Announcement | null;
  onSave: (payload: AnnouncementCreateInput) => Promise<void>;
  saving: boolean;
}) {
  const [blocks, setBlocks] = React.useState<CmsBlock[]>(() =>
    parseCmsBlocks(initial?.bodyJson)
  );
  const [blockError, setBlockError] = React.useState<string | undefined>();

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(AnnouncementFormSchema),
    defaultValues: {
      title: initial?.title || "",
      startsAt: formatDateInput(initial?.startsAt),
      endsAt: formatDateInput(initial?.endsAt),
      pinned: initial?.pinned ?? false,
      isActive: initial?.isActive ?? true,
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      title: initial?.title || "",
      startsAt: formatDateInput(initial?.startsAt),
      endsAt: formatDateInput(initial?.endsAt),
      pinned: initial?.pinned ?? false,
      isActive: initial?.isActive ?? true,
    });
    setBlocks(parseCmsBlocks(initial?.bodyJson));
    setBlockError(undefined);
  }, [open, initial, form]);

  const handleSubmit = async (values: AnnouncementFormValues) => {
    const bodyJson = buildCmsBodyJson(blocks);
    if (!bodyJson) {
      setBlockError("Add at least one block.");
      return;
    }
    setBlockError(undefined);
    await onSave({
      title: values.title,
      bodyJson,
      pinned: values.pinned,
      isActive: values.isActive,
      startsAt: parseDateInput(values.startsAt),
      endsAt: parseDateInput(values.endsAt),
    });
  };

  return (
    <Modal
      open={open}
      title={initial ? "Edit announcement" : "Create announcement"}
      description="Share a short update with students and staff."
      onOpenChange={onOpenChange}
      className="max-w-3xl"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormInput
          label="Title"
          placeholder="e.g., Exam dates updated"
          description="Short heading shown in the announcement list."
          error={form.formState.errors.title?.message}
          {...form.register("title")}
        />
        <CmsBlocksEditor
          label="Announcement body"
          description="Add short text and an optional image."
          error={blockError}
          blocks={blocks}
          onChange={(next) => {
            setBlocks(next);
            if (blockError) setBlockError(undefined);
          }}
          uploadPurpose="OTHER"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Starts At"
            type="datetime-local"
            description="Leave empty to show immediately."
            {...form.register("startsAt")}
          />
          <FormInput
            label="Ends At"
            type="datetime-local"
            description="Leave empty for no end date."
            {...form.register("endsAt")}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="pinned"
            render={({ field }) => (
              <FormSwitch
                label="Pinned"
                description="Pins this update to the top of the list."
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormSwitch
                label="Active"
                description="Visible to students and staff."
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || form.formState.isSubmitting}>
            {saving ? "Saving..." : initial ? "Update announcement" : "Create announcement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCmsAnnouncementsPage() {
  const { toast } = useToast();
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const { data, isLoading, error } = useAnnouncements({ page, pageSize });
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = React.useState<Announcement | null>(
    null
  );

  const handleSave = async (payload: AnnouncementCreateInput) => {
    try {
      if (activeAnnouncement) {
        await updateAnnouncement.mutateAsync({
          announcementId: activeAnnouncement.id,
          input: payload,
        });
        toast({ title: "Announcement updated" });
      } else {
        await createAnnouncement.mutateAsync(payload);
        toast({ title: "Announcement created" });
      }
      setEditorOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save announcement.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<Announcement>[]>(
    () => [
      {
        key: "title",
        header: "Announcement",
        render: (announcement) => (
          <div className="space-y-1">
            <p className="font-medium">{announcement.title}</p>
            {announcement.pinned ? (
              <span className={badgeClass(true)}>Pinned</span>
            ) : null}
          </div>
        ),
      },
      {
        key: "isActive",
        header: "Active",
        render: (announcement) => (
          <span className={badgeClass(announcement.isActive)}>
            {announcement.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "schedule",
        header: "Schedule",
        render: (announcement) =>
          formatSchedule(announcement.startsAt, announcement.endsAt),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (announcement) => formatDate(announcement.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (announcement) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveAnnouncement(announcement);
              setEditorOpen(true);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    []
  );

  const announcements = data?.data ?? [];

  return (
    <RequirePerm perm="admin.config.write">
      <div className="space-y-6">
        <PageHeader
          title="Announcements"
          description="Short updates shown to students and staff."
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setActiveAnnouncement(null);
                setEditorOpen(true);
              }}
            >
              Create announcement
            </Button>
          }
        />
        <CmsSubNav />

        {isLoading ? (
          <LoadingState label="Loading announcements..." />
        ) : error ? (
          <ErrorState
            description={
              error && typeof error === "object" && "message" in error
                ? String(error.message)
                : "Unable to load announcements."
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={announcements}
            emptyLabel="No announcements yet."
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
        )}
      </div>

      <AnnouncementEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={activeAnnouncement}
        onSave={handleSave}
        saving={createAnnouncement.isPending || updateAnnouncement.isPending}
      />
    </RequirePerm>
  );
}
