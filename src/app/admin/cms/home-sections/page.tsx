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
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import { StringListEditor, StructuredObjectEditor } from "@/modules/shared/components/StructuredEditors";
import {
  buildStructuredRecord,
  splitStructuredRecord,
  type StructuredObjectEntry,
} from "@/modules/shared/structured-data";
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
  const { data: subjects } = useSubjects();
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [topicId, setTopicId] = React.useState("");
  const [limit, setLimit] = React.useState("");
  const [noteIds, setNoteIds] = React.useState<string[]>([]);
  const [extraEntries, setExtraEntries] = React.useState<StructuredObjectEntry[]>([]);
  const [extraPreserved, setExtraPreserved] = React.useState<Record<string, unknown>>({});
  const [extraNotice, setExtraNotice] = React.useState("");

  const form = useForm<HomeSectionFormValues>({
    resolver: zodResolver(HomeSectionSchema),
    defaultValues: {
      type: initial?.type || "",
      orderIndex: initial?.orderIndex ?? undefined,
      isActive: initial?.isActive ?? true,
    },
  });

  const selectedSubjectId = subjectId || undefined;
  const { data: topics } = useTopics(selectedSubjectId);

  React.useEffect(() => {
    if (!open) return;
    const config = initial?.configJson ?? {};
    const reservedKeys = ["title", "subtitle", "subjectId", "topicId", "limit", "noteIds"];
    const extraState = splitStructuredRecord(config, reservedKeys);

    form.reset({
      type: initial?.type || "",
      orderIndex: initial?.orderIndex ?? undefined,
      isActive: initial?.isActive ?? true,
    });
    setTitle(typeof config.title === "string" ? config.title : "");
    setSubtitle(typeof config.subtitle === "string" ? config.subtitle : "");
    setSubjectId(typeof config.subjectId === "string" ? config.subjectId : "");
    setTopicId(typeof config.topicId === "string" ? config.topicId : "");
    setLimit(
      typeof config.limit === "number" && Number.isFinite(config.limit)
        ? String(config.limit)
        : ""
    );
    setNoteIds(
      Array.isArray(config.noteIds)
        ? config.noteIds.map((item) => String(item).trim()).filter(Boolean)
        : []
    );
    setExtraEntries(extraState.entries);
    setExtraPreserved(extraState.preserved);
    setExtraNotice(
      extraState.hasUnsupported
        ? "Some advanced section settings are preserved automatically but cannot be edited from this form."
        : ""
    );
  }, [open, initial, form]);

  const handleSubmit = async (values: HomeSectionFormValues) => {
    const configJson = buildStructuredRecord(extraEntries, extraPreserved);
    if (title.trim()) {
      configJson.title = title.trim();
    }
    if (subtitle.trim()) {
      configJson.subtitle = subtitle.trim();
    }
    if (subjectId.trim()) {
      configJson.subjectId = subjectId.trim();
    }
    if (topicId.trim()) {
      configJson.topicId = topicId.trim();
    }
    if (limit.trim()) {
      const parsedLimit = Number(limit);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        configJson.limit = Math.round(parsedLimit);
      }
    }
    const cleanNoteIds = noteIds.map((item) => item.trim()).filter(Boolean);
    if (cleanNoteIds.length) {
      configJson.noteIds = cleanNoteIds;
    }

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
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Display Title"
            placeholder="Optional section title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <FormInput
            label="Display Subtitle"
            placeholder="Optional section subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subject Filter</label>
            <select
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground"
              value={subjectId}
              onChange={(event) => {
                setSubjectId(event.target.value);
                setTopicId("");
              }}
            >
              <option value="">All subjects</option>
              {(subjects || []).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name || subject.title || "Untitled"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Topic Filter</label>
            <select
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground"
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
              disabled={!subjectId}
            >
              <option value="">All topics</option>
              {(topics || []).map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name || topic.title || "Untitled"}
                </option>
              ))}
            </select>
          </div>
          <FormInput
            label="Item Limit"
            type="number"
            min="1"
            placeholder="Optional"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          />
        </div>
        <StringListEditor
          label="Fixed Note IDs"
          description="Optional. Add note ids only if this section should show exact notes."
          values={noteIds}
          onChange={setNoteIds}
          itemLabel="Note ID"
          addLabel="Add note ID"
        />
        <StructuredObjectEditor
          label="Additional Section Settings"
          description="Optional extra settings for advanced section types."
          entries={extraEntries}
          onChange={setExtraEntries}
          preserveNotice={extraNotice}
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

  const handleMove = React.useCallback(async (sectionId: string, direction: "up" | "down") => {
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
  }, [reorderSections, sections, toast]);

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
    [handleMove, sections]
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
