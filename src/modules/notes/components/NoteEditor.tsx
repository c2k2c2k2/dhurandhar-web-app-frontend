"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAssetPreviewUrl } from "@/lib/hooks/useAssetPreviewUrl";
import { useToast } from "@/modules/shared/components/Toast";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
} from "@/modules/shared/components/FormField";
import { MultiSelectField } from "@/modules/shared/components/MultiSelect";
import { Modal } from "@/modules/shared/components/Modal";
import { LoadingState, ErrorState } from "@/modules/shared/components/States";
import { FileUpload } from "@/modules/shared/FileUpload";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import type { Subject } from "@/modules/taxonomy/subjects/types";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import type { Topic } from "@/modules/taxonomy/topics/types";
import { NoteCreateSchema, type NoteCreateInput, type NoteUpdateInput } from "../schemas";
import { useCreateNote, useNote, useUpdateNote } from "../hooks";

type NoteFormValues = NoteCreateInput;

function getSubjectName(subject: Subject) {
  return subject.name || subject.title || "Untitled";
}

function getTopicName(topic: Topic) {
  return topic.name || topic.title || "Untitled";
}

export function NoteEditor({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(noteId);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewType, setPreviewType] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useNote(noteId);
  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(NoteCreateSchema),
    defaultValues: {
      subjectId: "",
      title: "",
      description: "",
      isPremium: false,
      fileAssetId: "",
      pageCount: undefined,
      topicIds: [],
    },
  });

  const selectedSubjectId = isEdit
    ? note?.subjectId || ""
    : form.watch("subjectId");

  const {
    data: topics,
    isLoading: topicsLoading,
  } = useTopics(selectedSubjectId);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  React.useEffect(() => {
    if (isEdit && note) {
      form.reset({
        subjectId: note.subjectId,
        title: note.title,
        description: note.description || "",
        isPremium: note.isPremium,
        fileAssetId: note.fileAssetId || "",
        pageCount: note.pageCount ?? undefined,
        topicIds: note.topics?.map((topic) => topic.topicId) || [],
      });
      setPreviewUrl((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setPreviewType(null);
    }
  }, [isEdit, note, form]);

  React.useEffect(() => {
    if (!isEdit && subjects && subjects.length && !form.getValues("subjectId")) {
      form.setValue("subjectId", subjects[0].id);
    }
  }, [subjects, form, isEdit]);

  const handleSubmit = async (values: NoteFormValues) => {
    try {
      if (isEdit && noteId) {
        const payload: NoteUpdateInput = {
          title: values.title,
          description: values.description?.trim() || undefined,
          isPremium: values.isPremium ?? false,
          fileAssetId: values.fileAssetId || undefined,
          pageCount: values.pageCount,
          topicIds: values.topicIds ?? [],
        };
        await updateNote.mutateAsync({ noteId, input: payload });
        toast({ title: "Note updated" });
      } else {
        const payload: NoteCreateInput = {
          subjectId: values.subjectId,
          title: values.title,
          description: values.description?.trim() || undefined,
          isPremium: values.isPremium ?? false,
          fileAssetId: values.fileAssetId || undefined,
          pageCount: values.pageCount,
          topicIds: values.topicIds ?? [],
        };
        const created = await createNote.mutateAsync(payload);
        toast({ title: "Note created" });
        router.replace(`/admin/notes/${created.id}`);
      }
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save note.",
        variant: "destructive",
      });
    }
  };

  const subjectOptions = subjects || [];
  const topicOptions = topics || [];
  const topicIds = form.watch("topicIds") || [];
  const fileAssetId = form.watch("fileAssetId");
  const assetPreview = useAssetPreviewUrl(
    previewUrl ? null : fileAssetId || undefined
  );
  const previewSrc = previewUrl || assetPreview.url;
  const resolvedPreviewType =
    previewType || assetPreview.contentType || "application/pdf";

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const topicList = React.useMemo(() => {
    const byId = new Map(topicOptions.map((topic) => [topic.id, topic]));

    const buildLabel = (topic: Topic) => {
      const parts: string[] = [];
      let current: Topic | undefined = topic;
      let safety = 0;
      while (current && safety < 20) {
        parts.unshift(getTopicName(current));
        if (!current.parentId) break;
        current = byId.get(current.parentId);
        safety += 1;
      }
      return parts.join(" / ");
    };

    return topicOptions
      .map((topic) => ({
        id: topic.id,
        label: buildLabel(topic),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [topicOptions]);

  if (isEdit && noteLoading) {
    return <LoadingState label="Loading note..." />;
  }

  if (isEdit && noteError) {
    return (
      <ErrorState
        description={
          noteError && typeof noteError === "object" && "message" in noteError
            ? String(noteError.message)
            : "Unable to load note."
        }
      />
    );
  }

  if (isEdit && !note) {
    return <ErrorState description="Note not found." />;
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      {subjectsLoading ? (
        <LoadingState label="Loading subjects..." />
      ) : subjectsError ? (
        <ErrorState
          description={
            subjectsError &&
            typeof subjectsError === "object" &&
            "message" in subjectsError
              ? String(subjectsError.message)
              : "Unable to load subjects."
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FormInput
              label="Title"
              placeholder="e.g., Number System Fundamentals"
              error={form.formState.errors.title?.message}
              {...form.register("title")}
            />
            <FormTextarea
              label="Description"
              placeholder="Optional description"
              error={form.formState.errors.description?.message}
              {...form.register("description")}
            />
            <Controller
              control={form.control}
              name="isPremium"
              render={({ field }) => (
                <FormSwitch
                  label="Premium"
                  description="Mark as premium-only content."
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <MultiSelectField
              label="Topics"
              description="Select all relevant topics."
              items={topicList}
              value={topicIds}
              onChange={(next) => form.setValue("topicIds", next)}
              loading={topicsLoading}
              emptyLabel="No topics found for this subject."
              searchPlaceholder="Search topics..."
              modalTitle="Select topics"
              modalDescription="Search and choose the topics that match this note."
              selectLabel="Select topics"
              editLabel="Edit topics"
              disabled={!selectedSubjectId}
            />
          </div>
          <div className="space-y-6">
            <FormSelect
              label="Subject"
              value={selectedSubjectId}
              onChange={(event) => {
                form.setValue("subjectId", event.target.value);
                form.setValue("topicIds", []);
              }}
              disabled={isEdit}
            >
              {subjectOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {getSubjectName(subject)}
                </option>
              ))}
            </FormSelect>
            <FormInput
              label="Page Count"
              type="number"
              placeholder="Optional"
              error={form.formState.errors.pageCount?.message}
              {...form.register("pageCount", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return undefined;
                  }
                  const parsed = Number(value);
                  return Number.isNaN(parsed) ? undefined : parsed;
                },
              })}
            />
            <FormField label="Note PDF" description="Upload the note PDF file.">
              <FileUpload
                purpose="NOTES_PDF"
                accept="application/pdf"
                onComplete={(file) => {
                  form.setValue("fileAssetId", file.fileAssetId);
                  setPreviewUrl((prev) => {
                    if (prev && prev.startsWith("blob:")) {
                      URL.revokeObjectURL(prev);
                    }
                    return file.previewUrl ?? null;
                  });
                  setPreviewType(file.contentType || "application/pdf");
                }}
              />
              {previewSrc ? (
                <div className="mt-3 space-y-3">
                  {fileAssetId ? (
                    <p className="text-xs text-muted-foreground">
                      File asset: {fileAssetId}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewOpen(true)}
                    >
                      Preview
                    </Button>
                    <button
                      type="button"
                      className="text-xs text-foreground underline"
                      onClick={() => {
                        form.setValue("fileAssetId", "");
                        setPreviewUrl((prev) => {
                          if (prev && prev.startsWith("blob:")) {
                            URL.revokeObjectURL(prev);
                          }
                          return null;
                        });
                        setPreviewType(null);
                        setPreviewOpen(false);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <Modal
                    open={previewOpen}
                    onOpenChange={setPreviewOpen}
                    title="Note Preview"
                    description="Review the uploaded file."
                    className="max-w-4xl"
                  >
                    {resolvedPreviewType.startsWith("image/") ? (
                      <img
                        src={previewSrc}
                        alt="Note preview"
                        className="max-h-[70vh] w-full rounded-2xl border border-border object-contain"
                      />
                    ) : (
                      <iframe
                        src={previewSrc}
                        title="Note preview"
                        className="h-[70vh] w-full rounded-2xl border border-border"
                      />
                    )}
                  </Modal>
                </div>
              ) : fileAssetId && assetPreview.loading ? (
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              ) : fileAssetId && assetPreview.error ? (
                <p className="text-sm text-muted-foreground">
                  Preview unavailable.
                </p>
              ) : null}
            </FormField>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving..."
            : isEdit
              ? "Update Note"
              : "Create Note"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/notes")}
        >
          Back to Notes
        </Button>
      </div>
    </form>
  );
}
