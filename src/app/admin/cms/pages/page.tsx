"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useToast } from "@/modules/shared/components/Toast";
import { Modal } from "@/modules/shared/components/Modal";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { FormInput, FormSelect } from "@/modules/shared/components/FormField";
import { CmsSubNav } from "@/modules/cms/components/CmsSubNav";
import { CmsBlocksEditor } from "@/modules/cms/components/CmsBlocksEditor";
import {
  useCreatePage,
  usePages,
  usePublishPage,
  useUnpublishPage,
  useUpdatePage,
} from "@/modules/cms/hooks";
import type { CmsPage, CmsPageCreateInput, PageStatus } from "@/modules/cms/types";
import {
  badgeClass,
  buildCmsBodyJson,
  formatDate,
  parseCmsBlocks,
  type CmsBlock,
} from "@/modules/cms/utils";

const PageFormSchema = z.object({
  slug: z.string().min(2, "Slug is required."),
  title: z.string().min(2, "Title is required."),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

type PageFormValues = z.infer<typeof PageFormSchema>;

function PageEditorModal({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: CmsPage | null;
  onSave: (payload: CmsPageCreateInput) => Promise<void>;
  saving: boolean;
}) {
  const [blocks, setBlocks] = React.useState<CmsBlock[]>(() =>
    parseCmsBlocks(initial?.bodyJson)
  );
  const [blockError, setBlockError] = React.useState<string | undefined>();

  const form = useForm<PageFormValues>({
    resolver: zodResolver(PageFormSchema),
    defaultValues: {
      slug: initial?.slug || "",
      title: initial?.title || "",
      status: initial?.status || "DRAFT",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      slug: initial?.slug || "",
      title: initial?.title || "",
      status: initial?.status || "DRAFT",
    });
    setBlocks(parseCmsBlocks(initial?.bodyJson));
    setBlockError(undefined);
  }, [open, initial, form]);

  const handleSubmit = async (values: PageFormValues) => {
    const bodyJson = buildCmsBodyJson(blocks);
    if (!bodyJson) {
      setBlockError("Add at least one block.");
      return;
    }
    setBlockError(undefined);
    await onSave({
      slug: values.slug.trim(),
      title: values.title,
      bodyJson,
      status: values.status,
    });
  };

  return (
    <Modal
      open={open}
      title={initial ? "Edit page" : "Create page"}
      description="Build CMS pages with rich blocks."
      onOpenChange={onOpenChange}
      className="max-w-3xl"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Slug"
            placeholder="e.g., about-us"
            description="URL path. Use lowercase letters and dashes."
            error={form.formState.errors.slug?.message}
            {...form.register("slug")}
          />
          <FormSelect
            label="Status"
            description="Draft pages are not visible to students."
            value={form.watch("status") || "DRAFT"}
            onChange={(event) =>
              form.setValue("status", event.target.value as PageStatus)
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </FormSelect>
        </div>
        <FormInput
          label="Title"
          placeholder="e.g., About us"
          error={form.formState.errors.title?.message}
          {...form.register("title")}
        />
        <CmsBlocksEditor
          label="Page content"
          description="Add text and images. Keep it short and clear."
          error={blockError}
          blocks={blocks}
          onChange={(next) => {
            setBlocks(next);
            if (blockError) setBlockError(undefined);
          }}
          uploadPurpose="OTHER"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || form.formState.isSubmitting}>
            {saving ? "Saving..." : initial ? "Update page" : "Create page"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCmsPagesPage() {
  const { toast } = useToast();
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [statusFilter, setStatusFilter] = React.useState<PageStatus | "">("");
  const [slugQuery, setSlugQuery] = React.useState("");
  const debouncedSlug = useDebouncedValue(slugQuery, 300);

  const filters = React.useMemo(
    () => ({
      status: statusFilter || undefined,
      slug: debouncedSlug.trim() || undefined,
      page,
      pageSize,
    }),
    [statusFilter, debouncedSlug, page]
  );

  const { data, isLoading, error } = usePages(filters);
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const publishPage = usePublishPage();
  const unpublishPage = useUnpublishPage();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState<CmsPage | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmPage, setConfirmPage] = React.useState<CmsPage | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<"publish" | "unpublish">(
    "publish"
  );

  const handleSave = async (payload: CmsPageCreateInput) => {
    try {
      if (activePage) {
        await updatePage.mutateAsync({ pageId: activePage.id, input: payload });
        toast({ title: "Page updated" });
      } else {
        await createPage.mutateAsync(payload);
        toast({ title: "Page created" });
      }
      setEditorOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save page.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (pageId: string, published: boolean) => {
    try {
      if (published) {
        await unpublishPage.mutateAsync(pageId);
        toast({ title: "Page moved to draft" });
      } else {
        await publishPage.mutateAsync(pageId);
        toast({ title: "Page published" });
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to update page status.",
        variant: "destructive",
      });
    }
  };

  const openPublishConfirm = (pageItem: CmsPage) => {
    const action = pageItem.status === "PUBLISHED" ? "unpublish" : "publish";
    setConfirmAction(action);
    setConfirmPage(pageItem);
    setConfirmOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!confirmPage) return;
    await handlePublish(confirmPage.id, confirmPage.status === "PUBLISHED");
    setConfirmOpen(false);
    setConfirmPage(null);
  };

  const columns = React.useMemo<DataTableColumn<CmsPage>[]>(
    () => [
      {
        key: "title",
        header: "Page",
        render: (pageItem) => (
          <div className="space-y-1">
            <p className="font-medium">{pageItem.title}</p>
            <p className="text-xs text-muted-foreground">/{pageItem.slug}</p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (pageItem) => (
          <span className={badgeClass(pageItem.status === "PUBLISHED")}>
            {pageItem.status === "PUBLISHED" ? "Published" : "Draft"}
          </span>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (pageItem) => formatDate(pageItem.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (pageItem) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActivePage(pageItem);
                setEditorOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openPublishConfirm(pageItem)}
            >
              {pageItem.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const pages = data?.data ?? [];

  return (
    <RequirePerm perm="admin.config.write">
      <div className="space-y-6">
        <PageHeader
          title="Pages"
          description="Create static info pages and manage publishing."
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setActivePage(null);
                setEditorOpen(true);
              }}
            >
              Create page
            </Button>
          }
        />
        <CmsSubNav />

        <FiltersBar
          filters={
            <>
              <FormSelect
                label="Status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as PageStatus | "");
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </FormSelect>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Slug</label>
                <Input
                  placeholder="Search by URL slug..."
                  value={slugQuery}
                  onChange={(event) => setSlugQuery(event.target.value)}
                />
              </div>
            </>
          }
          actions={
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStatusFilter("");
                setSlugQuery("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />

        {isLoading ? (
          <LoadingState label="Loading pages..." />
        ) : error ? (
          <ErrorState
            description={
              error && typeof error === "object" && "message" in error
                ? String(error.message)
                : "Unable to load pages."
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={pages}
            emptyLabel="No pages yet."
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

      <PageEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={activePage}
        onSave={handleSave}
        saving={createPage.isPending || updatePage.isPending}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === "publish" ? "Publish this page?" : "Move page to draft?"}
        description={
          confirmAction === "publish"
            ? "This page will be visible to students."
            : "This page will be hidden from students."
        }
        confirmLabel={confirmAction === "publish" ? "Publish" : "Move to Draft"}
        onConfirm={handleConfirmPublish}
      />
    </RequirePerm>
  );
}
