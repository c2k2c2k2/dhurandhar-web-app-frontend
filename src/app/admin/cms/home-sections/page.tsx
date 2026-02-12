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
import { FormInput, FormSwitch, FormTextarea } from "@/modules/shared/components/FormField";
import { CmsSubNav } from "@/modules/cms/components/CmsSubNav";
import {
  useCreateHomeSection,
  useHomeSections,
  useReorderHomeSections,
  useUpdateHomeSection,
} from "@/modules/cms/hooks";
import type { HomeSection, HomeSectionCreateInput } from "@/modules/cms/types";
import { badgeClass, formatDate } from "@/modules/cms/utils";

const HomeSectionSchema = z.object({
  type: z.string().min(2, "Type is required."),
  orderIndex: z.number().int().optional(),
  isActive: z.boolean().optional(),
  configText: z.string().min(2, "Config JSON is required."),
});

type HomeSectionFormValues = z.infer<typeof HomeSectionSchema>;

function HomeSectionEditorModal({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: HomeSection | null;
  onSave: (payload: HomeSectionCreateInput) => Promise<void>;
  saving: boolean;
}) {
  const [configError, setConfigError] = React.useState<string | undefined>();

  const form = useForm<HomeSectionFormValues>({
    resolver: zodResolver(HomeSectionSchema),
    defaultValues: {
      type: initial?.type || "",
      orderIndex: initial?.orderIndex ?? undefined,
      isActive: initial?.isActive ?? true,
      configText: initial?.configJson
        ? JSON.stringify(initial.configJson, null, 2)
        : "{\n  \n}",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      type: initial?.type || "",
      orderIndex: initial?.orderIndex ?? undefined,
      isActive: initial?.isActive ?? true,
      configText: initial?.configJson
        ? JSON.stringify(initial.configJson, null, 2)
        : "{\n  \n}",
    });
    setConfigError(undefined);
  }, [open, initial, form]);

  const handleSubmit = async (values: HomeSectionFormValues) => {
    let configJson: Record<string, unknown>;
    try {
      configJson = JSON.parse(values.configText);
    } catch {
      setConfigError("Config JSON must be valid.");
      return;
    }
    setConfigError(undefined);
    await onSave({
      type: values.type,
      configJson,
      orderIndex: values.orderIndex,
      isActive: values.isActive,
    });
  };

  return (
    <Modal
      open={open}
      title={initial ? "Edit home section" : "Create home section"}
      description="Arrange what shows on the student home screen."
      onOpenChange={onOpenChange}
      className="max-w-3xl"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormInput
          label="Section Type"
          placeholder="e.g., HERO_BANNER"
          description="Use a known section type. Ask the tech team if unsure."
          error={form.formState.errors.type?.message}
          {...form.register("type")}
        />
        <FormTextarea
          label="Config JSON"
          description="Paste the JSON configuration for this section. If unsure, start with {}."
          error={form.formState.errors.configText?.message || configError}
          className="font-mono text-xs"
          {...form.register("configText")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Order Index"
            type="number"
            placeholder="0"
            description="Lower numbers show first."
            error={form.formState.errors.orderIndex?.message}
            {...form.register("orderIndex", {
              setValueAs: (value) => {
                if (value === "" || value === null || value === undefined) {
                  return undefined;
                }
                const parsed = Number(value);
                return Number.isNaN(parsed) ? undefined : parsed;
              },
            })}
          />
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormSwitch
                label="Active"
                description="Visible on the home page."
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
            {saving ? "Saving..." : initial ? "Update section" : "Create section"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCmsHomeSectionsPage() {
  const { toast } = useToast();
  const { data, isLoading, error } = useHomeSections({ page: 1, pageSize: 50 });
  const createSection = useCreateHomeSection();
  const updateSection = useUpdateHomeSection();
  const reorderSections = useReorderHomeSections();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<HomeSection | null>(null);

  const sections = React.useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    [data]
  );

  const handleSave = async (payload: HomeSectionCreateInput) => {
    try {
      if (activeSection) {
        await updateSection.mutateAsync({
          sectionId: activeSection.id,
          input: payload,
        });
        toast({ title: "Home section updated" });
      } else {
        await createSection.mutateAsync(payload);
        toast({ title: "Home section created" });
      }
      setEditorOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save home section.",
        variant: "destructive",
      });
    }
  };

  const handleMove = async (sectionId: string, direction: "up" | "down") => {
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    try {
      await reorderSections.mutateAsync({
        items: next.map((section, orderIndex) => ({
          id: section.id,
          orderIndex,
        })),
      });
      toast({ title: "Sections reordered" });
    } catch (err) {
      toast({
        title: "Reorder failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to reorder sections.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<HomeSection>[]>(
    () => [
      {
        key: "type",
        header: "Section",
        render: (section) => (
          <div className="space-y-1">
            <p className="font-medium">{section.type}</p>
            <p className="text-xs text-muted-foreground">
              Order {section.orderIndex}
            </p>
          </div>
        ),
      },
      {
        key: "isActive",
        header: "Active",
        render: (section) => (
          <span className={badgeClass(section.isActive)}>
            {section.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (section) => formatDate(section.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (section) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMove(section.id, "up")}
              disabled={sections[0]?.id === section.id}
            >
              Up
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMove(section.id, "down")}
              disabled={sections[sections.length - 1]?.id === section.id}
            >
              Down
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveSection(section);
                setEditorOpen(true);
              }}
            >
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [sections]
  );

  return (
    <RequirePerm perm="admin.config.write">
      <div className="space-y-6">
        <PageHeader
          title="Home Sections"
          description="Reorder and configure the student home screen. Use Up/Down to move."
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setActiveSection(null);
                setEditorOpen(true);
              }}
            >
              Create section
            </Button>
          }
        />
        <CmsSubNav />

        {isLoading ? (
          <LoadingState label="Loading home sections..." />
        ) : error ? (
          <ErrorState
            description={
              error && typeof error === "object" && "message" in error
                ? String(error.message)
                : "Unable to load home sections."
            }
          />
        ) : (
          <DataTable columns={columns} rows={sections} emptyLabel="No sections yet." />
        )}
      </div>

      <HomeSectionEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={activeSection}
        onSave={handleSave}
        saving={createSection.isPending || updateSection.isPending}
      />
    </RequirePerm>
  );
}
