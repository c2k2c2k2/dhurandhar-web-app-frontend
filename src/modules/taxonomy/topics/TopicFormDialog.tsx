"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/modules/shared/components/Toast";
import {
  FormInput,
  FormSelect,
  FormSwitch,
} from "@/modules/shared/components/FormField";
import { Modal } from "@/modules/shared/components/Modal";
import {
  TopicCreateSchema,
  type TopicCreateInput,
  type TopicUpdateInput,
} from "./schemas";
import type { Topic } from "./types";
import { useCreateTopic, useUpdateTopic } from "./hooks";

type TopicFormValues = TopicCreateInput;

export function TopicFormDialog({
  open,
  onOpenChange,
  subjectId,
  topics,
  topic,
  defaultParentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  topics: Topic[];
  topic?: Topic | null;
  defaultParentId?: string | null;
}) {
  const { toast } = useToast();
  const createTopic = useCreateTopic(subjectId);
  const updateTopic = useUpdateTopic(subjectId);
  const isEdit = Boolean(topic?.id);

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(TopicCreateSchema),
    defaultValues: {
      name: topic?.name || topic?.title || "",
      parentId: topic?.parentId ?? defaultParentId ?? undefined,
      orderIndex: topic?.orderIndex ?? undefined,
      isActive: topic?.isActive ?? topic?.active ?? true,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: topic?.name || topic?.title || "",
        parentId: topic?.parentId ?? defaultParentId ?? undefined,
        orderIndex: topic?.orderIndex ?? undefined,
        isActive: topic?.isActive ?? topic?.active ?? true,
      });
    }
  }, [open, topic, defaultParentId, form]);

  const onSubmit = async (values: TopicFormValues) => {
    try {
      if (isEdit && topic?.id) {
        const payload: TopicUpdateInput = {
          ...values,
          parentId: values.parentId || undefined,
          orderIndex: values.orderIndex,
          isActive: values.isActive ?? true,
        };
        await updateTopic.mutateAsync({ topicId: topic.id, input: payload });
        toast({ title: "Topic updated" });
      } else {
        const payload: TopicCreateInput = {
          ...values,
          parentId: values.parentId || undefined,
          orderIndex: values.orderIndex,
          isActive: values.isActive ?? true,
        };
        await createTopic.mutateAsync(payload);
        toast({ title: "Topic created" });
      }
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save topic.",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Topic" : "Create Topic"}
      description="Topics are nested inside subjects to power content grouping."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <FormInput
          label="Topic Name"
          placeholder="e.g., Percentage"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Controller
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormSelect
              label="Parent Topic"
              value={field.value || ""}
              onChange={(event) =>
                field.onChange(event.target.value || undefined)
              }
            >
              <option value="">No parent (top-level)</option>
              {topics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || item.title || "Untitled"}
                </option>
              ))}
            </FormSelect>
          )}
        />
        <FormInput
          label="Order Index"
          type="number"
          placeholder="e.g., 1"
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
              description="Inactive topics are hidden from student app."
              checked={field.value ?? true}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </form>
    </Modal>
  );
}
