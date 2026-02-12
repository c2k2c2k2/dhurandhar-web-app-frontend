"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { useToast } from "@/modules/shared/components/Toast";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import {
  FormInput,
  FormSelect,
  FormSwitch,
} from "@/modules/shared/components/FormField";
import { CmsSubNav } from "@/modules/cms/components/CmsSubNav";
import { CmsBlocksEditor } from "@/modules/cms/components/CmsBlocksEditor";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
} from "@/modules/cms/hooks";
import type { Banner, BannerCreateInput } from "@/modules/cms/types";
import {
  badgeClass,
  buildCmsBodyJson,
  formatDate,
  formatDateInput,
  parseCmsBlocks,
  parseDateInput,
  type CmsBlock,
} from "@/modules/cms/utils";

type BannerFormValues = {
  title: string;
  linkUrl?: string;
  target?: string;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

const BannerFormSchema: z.ZodType<BannerFormValues> = z.object({
  title: z.string().min(2, "Title is required."),
  linkUrl: z.string().optional(),
  target: z.string().optional(),
  priority: z.number().int().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

function formatSchedule(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt && !endsAt) return "Always on";
  if (startsAt && !endsAt) return `From ${formatDate(startsAt)}`;
  if (!startsAt && endsAt) return `Until ${formatDate(endsAt)}`;
  return `${formatDate(startsAt)} → ${formatDate(endsAt)}`;
}

function BannerEditorModal({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Banner | null;
  onSave: (payload: BannerCreateInput) => Promise<void>;
  saving: boolean;
}) {
  const [blocks, setBlocks] = React.useState<CmsBlock[]>(() =>
    parseCmsBlocks(initial?.bodyJson)
  );

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(BannerFormSchema as any) as unknown as Resolver<BannerFormValues>,
    defaultValues: {
      title: initial?.title || "",
      linkUrl: initial?.linkUrl || "",
      target: initial?.target || "",
      priority: initial?.priority ?? undefined,
      startsAt: formatDateInput(initial?.startsAt),
      endsAt: formatDateInput(initial?.endsAt),
      isActive: initial?.isActive ?? true,
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      title: initial?.title || "",
      linkUrl: initial?.linkUrl || "",
      target: initial?.target || "",
      priority: initial?.priority ?? undefined,
      startsAt: formatDateInput(initial?.startsAt),
      endsAt: formatDateInput(initial?.endsAt),
      isActive: initial?.isActive ?? true,
    });
    setBlocks(parseCmsBlocks(initial?.bodyJson));
  }, [open, initial, form]);

  const handleSubmit = async (values: BannerFormValues) => {
    const bodyJson = buildCmsBodyJson(blocks);
    await onSave({
      title: values.title,
      bodyJson,
      linkUrl: values.linkUrl?.trim(),
      target: values.target?.trim(),
      priority: values.priority,
      startsAt: parseDateInput(values.startsAt),
      endsAt: parseDateInput(values.endsAt),
      isActive: values.isActive,
    });
  };

  return (
    <Modal
      open={open}
      title={initial ? "Edit banner" : "Create banner"}
      description="Configure a banner with text, images, and schedule."
      onOpenChange={onOpenChange}
      className="max-w-3xl"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormInput
          label="Title"
          placeholder="e.g., Scholarship season"
          description="Short heading shown on the banner."
          error={form.formState.errors.title?.message}
          {...form.register("title")}
        />
        <CmsBlocksEditor
          label="Body blocks"
          description="Add short text and an optional image."
          blocks={blocks}
          onChange={setBlocks}
          uploadPurpose="OTHER"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Link URL"
            placeholder="https://example.com"
            description="Optional. Add to make the banner clickable."
            error={form.formState.errors.linkUrl?.message}
            {...form.register("linkUrl")}
          />
          <FormSelect
            label="Target"
            description="Choose where the link opens."
            value={form.watch("target") || ""}
            onChange={(event) => form.setValue("target", event.target.value)}
          >
            <option value="">Default</option>
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </FormSelect>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FormInput
            label="Priority"
            type="number"
            placeholder="0"
            description="Higher priority shows first. Leave empty for default."
            error={form.formState.errors.priority?.message}
            {...form.register("priority", {
              setValueAs: (value) => {
                if (value === "" || value === null || value === undefined) {
                  return undefined;
                }
                const parsed = Number(value);
                return Number.isNaN(parsed) ? undefined : parsed;
              },
            })}
          />
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
        <Controller
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormSwitch
              label="Active"
              description="Enable this banner for display."
              checked={field.value ?? true}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || form.formState.isSubmitting}>
            {saving ? "Saving..." : initial ? "Update banner" : "Create banner"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCmsBannersPage() {
  const { toast } = useToast();
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const { data, isLoading, error } = useBanners({ page, pageSize });
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [activeBanner, setActiveBanner] = React.useState<Banner | null>(null);

  const handleSave = async (payload: BannerCreateInput) => {
    try {
      if (activeBanner) {
        await updateBanner.mutateAsync({ bannerId: activeBanner.id, input: payload });
        toast({ title: "Banner updated" });
      } else {
        await createBanner.mutateAsync(payload);
        toast({ title: "Banner created" });
      }
      setEditorOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save banner.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<Banner>[]>(
    () => [
      {
        key: "title",
        header: "Banner",
        render: (banner) => (
          <div className="space-y-1">
            <p className="font-medium">{banner.title}</p>
            {banner.linkUrl ? (
              <p className="text-xs text-muted-foreground">{banner.linkUrl}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: "isActive",
        header: "Active",
        render: (banner) => (
          <span className={badgeClass(banner.isActive)}>
            {banner.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "priority",
        header: "Priority",
        render: (banner) => banner.priority ?? "Default",
      },
      {
        key: "schedule",
        header: "Schedule",
        render: (banner) => formatSchedule(banner.startsAt, banner.endsAt),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (banner) => formatDate(banner.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (banner) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveBanner(banner);
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

  const banners = data?.data ?? [];

  return (
    <RequirePerm perm="admin.config.write">
      <div className="space-y-6">
        <PageHeader
          title="Banners"
          description="Banners appear on the student home screen."
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setActiveBanner(null);
                setEditorOpen(true);
              }}
            >
              Create banner
            </Button>
          }
        />
        <CmsSubNav />

        {isLoading ? (
          <LoadingState label="Loading banners..." />
        ) : error ? (
          <ErrorState
            description={
              error && typeof error === "object" && "message" in error
                ? String(error.message)
                : "Unable to load banners."
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={banners}
            emptyLabel="No banners yet."
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

      <BannerEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={activeBanner}
        onSave={handleSave}
        saving={createBanner.isPending || updateBanner.isPending}
      />
    </RequirePerm>
  );
}
