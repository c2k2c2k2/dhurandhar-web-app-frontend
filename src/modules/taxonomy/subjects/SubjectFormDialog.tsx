"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/modules/shared/components/Toast";
import { FormInput, FormSwitch } from "@/modules/shared/components/FormField";
import { Modal } from "@/modules/shared/components/Modal";
import {
  SubjectCreateSchema,
  type SubjectCreateInput,
  type SubjectUpdateInput,
} from "./schemas";
import type { Subject } from "./types";
import { useCreateSubject, useUpdateSubject } from "./hooks";

type SubjectFormValues = SubjectCreateInput;

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
}) {
  const { toast } = useToast();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const isEdit = Boolean(subject?.id);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(SubjectCreateSchema),
    defaultValues: {
      key: subject?.key || "",
      name: subject?.name || subject?.title || "",
      orderIndex: subject?.orderIndex ?? undefined,
      isActive: subject?.isActive ?? subject?.active ?? true,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        key: subject?.key || "",
        name: subject?.name || subject?.title || "",
        orderIndex: subject?.orderIndex ?? undefined,
        isActive: subject?.isActive ?? subject?.active ?? true,
      });
    }
  }, [open, subject, form]);

  const onSubmit = async (values: SubjectFormValues) => {
    const trimmedKey = values.key?.trim();
    try {
      if (isEdit && subject?.id) {
        const payload: SubjectUpdateInput = {
          name: values.name,
          orderIndex: values.orderIndex,
          isActive: values.isActive ?? true,
        };
        await updateSubject.mutateAsync({ subjectId: subject.id, input: payload });
        toast({ title: "Subject updated" });
      } else {
        const payload: SubjectCreateInput = {
          key: trimmedKey || values.key,
          name: values.name,
          orderIndex: values.orderIndex,
          isActive: values.isActive ?? true,
        };
        await createSubject.mutateAsync(payload);
        toast({ title: "Subject created" });
      }
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save subject.",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Subject" : "Create Subject"}
      description="Subjects power the taxonomy across notes and questions."
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
          label="Subject Key"
          placeholder="e.g., quant"
          error={form.formState.errors.key?.message}
          {...form.register("key")}
          disabled={isEdit}
        />
        <FormInput
          label="Subject Name"
          placeholder="e.g., Quantitative Aptitude"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
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
              description="Inactive subjects are hidden from student app."
              checked={field.value ?? true}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </form>
    </Modal>
  );
}
