"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/modules/shared/components/Toast";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
} from "@/modules/shared/components/FormField";
import { MultiSelectField } from "@/modules/shared/components/MultiSelect";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import type { Topic } from "@/modules/taxonomy/topics/types";
import { useTests } from "@/modules/tests/hooks";
import type { TestConfig } from "@/modules/tests/types";
import {
  useCreatePracticePrintJob,
  useCreateTestPrintJob,
} from "../hooks";

const TestPrintSchema = z.object({
  testId: z.string().min(1, "Select a test."),
  durationMinutes: z.number().int().positive().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  includeAnswerKey: z.boolean().optional(),
});

type TestPrintValues = z.infer<typeof TestPrintSchema>;

const PracticePrintSchema = z.object({
  count: z.number().int().positive({ message: "Count is required." }),
  subjectId: z.string().optional(),
  topicIds: z.array(z.string()).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  durationMinutes: z.number().int().positive().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  includeAnswerKey: z.boolean().optional(),
});

type PracticePrintValues = z.infer<typeof PracticePrintSchema>;

function getTopicName(topic: Topic) {
  return topic.name || topic.title || "Untitled";
}

function resolveTestDuration(config: TestConfig | undefined): number | undefined {
  if (
    config &&
    typeof config.durationMinutes === "number" &&
    Number.isFinite(config.durationMinutes) &&
    config.durationMinutes > 0
  ) {
    return config.durationMinutes;
  }

  if (!Array.isArray(config?.sections)) {
    return undefined;
  }

  const sectionDurations = config.sections
    .map((section) => section?.durationMinutes)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value) && value > 0
    );

  if (!sectionDurations.length) {
    return undefined;
  }

  return sectionDurations.reduce((sum, value) => sum + value, 0);
}

export function PrintJobCreator() {
  const { toast } = useToast();
  const { data: testList, isLoading: testsLoading, error: testsError } = useTests({
    page: 1,
    pageSize: 200,
  });
  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } =
    useSubjects();

  const testForm = useForm<TestPrintValues>({
    resolver: zodResolver(TestPrintSchema),
    defaultValues: {
      testId: "",
      durationMinutes: undefined,
      title: "",
      subtitle: "",
      includeAnswerKey: false,
    },
  });

  const practiceForm = useForm<PracticePrintValues>({
    resolver: zodResolver(PracticePrintSchema),
    defaultValues: {
      count: 10,
      subjectId: "",
      topicIds: [],
      difficulty: undefined,
      durationMinutes: 60,
      title: "",
      subtitle: "",
      includeAnswerKey: false,
    },
  });

  const tests = React.useMemo(() => testList?.data ?? [], [testList]);
  const selectedTestId = useWatch({
    control: testForm.control,
    name: "testId",
  });
  const practiceSubjectId = useWatch({
    control: practiceForm.control,
    name: "subjectId",
  });
  const selectedDifficulty = useWatch({
    control: practiceForm.control,
    name: "difficulty",
  });
  const selectedTopicIds = useWatch({
    control: practiceForm.control,
    name: "topicIds",
  });
  const { data: topics, isLoading: topicsLoading } = useTopics(
    practiceSubjectId || undefined
  );

  React.useEffect(() => {
    if (!selectedTestId) {
      testForm.setValue("durationMinutes", undefined);
      return;
    }

    const selectedTest = tests.find((test) => test.id === selectedTestId);
    testForm.setValue("durationMinutes", resolveTestDuration(selectedTest?.configJson));
  }, [selectedTestId, testForm, tests]);

  React.useEffect(() => {
    practiceForm.setValue("topicIds", []);
  }, [practiceSubjectId, practiceForm]);

  const topicOptions = React.useMemo(() => topics ?? [], [topics]);
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
      .map((topic) => ({ id: topic.id, label: buildLabel(topic) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [topicOptions]);

  const createTestJob = useCreateTestPrintJob();
  const createPracticeJob = useCreatePracticePrintJob();

  const handleTestSubmit = async (values: TestPrintValues) => {
    try {
      await createTestJob.mutateAsync({
        testId: values.testId,
        input: {
          durationMinutes: values.durationMinutes,
          title: values.title || undefined,
          subtitle: values.subtitle || undefined,
          includeAnswerKey: values.includeAnswerKey,
        },
      });
      toast({ title: "Test print job queued" });
      testForm.reset({
        testId: "",
        durationMinutes: undefined,
        title: "",
        subtitle: "",
        includeAnswerKey: false,
      });
    } catch (err) {
      toast({
        title: "Unable to create job",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Check test configuration and try again.",
        variant: "destructive",
      });
    }
  };

  const handlePracticeSubmit = async (values: PracticePrintValues) => {
    try {
      await createPracticeJob.mutateAsync({
        count: values.count,
        subjectId: values.subjectId || undefined,
        topicIds: values.topicIds?.length ? values.topicIds : undefined,
        difficulty: values.difficulty,
        durationMinutes: values.durationMinutes,
        title: values.title || undefined,
        subtitle: values.subtitle || undefined,
        includeAnswerKey: values.includeAnswerKey,
      });
      toast({ title: "Practice print job queued" });
      practiceForm.reset({
        count: 10,
        subjectId: "",
        topicIds: [],
        difficulty: undefined,
        durationMinutes: 60,
        title: "",
        subtitle: "",
        includeAnswerKey: false,
      });
    } catch (err) {
      toast({
        title: "Unable to create job",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Adjust filters and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Test Print</h2>
          <p className="text-sm text-muted-foreground">
            Generate a printable PDF for a specific test.
          </p>
        </div>
        {testsLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading tests...</p>
        ) : testsError ? (
          <p className="mt-4 text-sm text-destructive">
            Unable to load tests for printing.
          </p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={testForm.handleSubmit(handleTestSubmit)}
          >
            <FormSelect
              label="Test"
              value={selectedTestId || ""}
              onChange={(event) => testForm.setValue("testId", event.target.value)}
              error={testForm.formState.errors.testId?.message}
            >
              <option value="">Select test</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </FormSelect>
            <FormInput
              label="Time (Minutes)"
              type="number"
              placeholder="Leave blank to use test duration"
              description="Printed in the paper header. You can override the test duration here."
              error={testForm.formState.errors.durationMinutes?.message}
              {...testForm.register("durationMinutes", {
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
              label="Title"
              placeholder="Optional title"
              error={testForm.formState.errors.title?.message}
              {...testForm.register("title")}
            />
            <FormTextarea
              label="Subtitle"
              placeholder="Optional subtitle"
              error={testForm.formState.errors.subtitle?.message}
              {...testForm.register("subtitle")}
            />
            <Controller
              control={testForm.control}
              name="includeAnswerKey"
              render={({ field }) => (
                <FormSwitch
                  label="Include Answer Key"
                  description="Append an answer key at the end."
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Button type="submit" disabled={testForm.formState.isSubmitting}>
              {testForm.formState.isSubmitting ? "Creating..." : "Create Test Print"}
            </Button>
            {tests.length >= 200 ? (
              <p className="text-xs text-muted-foreground">
                Showing latest 200 tests.
              </p>
            ) : null}
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Practice Print</h2>
          <p className="text-sm text-muted-foreground">
            Build a practice paper from published questions.
          </p>
        </div>
        {subjectsLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading subjects...</p>
        ) : subjectsError ? (
          <p className="mt-4 text-sm text-destructive">
            Unable to load subjects for printing.
          </p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={practiceForm.handleSubmit(handlePracticeSubmit)}
          >
            <FormInput
              label="Question Count"
              type="number"
              placeholder="e.g., 20"
              error={practiceForm.formState.errors.count?.message}
              {...practiceForm.register("count", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return undefined;
                  }
                  const parsed = Number(value);
                  return Number.isNaN(parsed) ? undefined : parsed;
                },
              })}
            />
            <FormSelect
              label="Subject"
              value={practiceSubjectId || ""}
              onChange={(event) => practiceForm.setValue("subjectId", event.target.value)}
            >
              <option value="">All subjects</option>
              {(subjects || []).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name || subject.title || "Untitled"}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              label="Difficulty"
              value={selectedDifficulty || ""}
              onChange={(event) =>
                practiceForm.setValue(
                  "difficulty",
                  event.target.value ? (event.target.value as PracticePrintValues["difficulty"]) : undefined
                )
              }
            >
              <option value="">All difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </FormSelect>
            <FormInput
              label="Time (Minutes)"
              type="number"
              description="Printed in the paper header. Adjust per print job."
              error={practiceForm.formState.errors.durationMinutes?.message}
              {...practiceForm.register("durationMinutes", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return undefined;
                  }
                  const parsed = Number(value);
                  return Number.isNaN(parsed) ? undefined : parsed;
                },
              })}
            />
            <MultiSelectField
              label="Topics"
              description="Optional topic filters."
              items={topicList}
              value={selectedTopicIds || []}
              onChange={(next) => practiceForm.setValue("topicIds", next)}
              loading={topicsLoading}
              emptyLabel="No topics found for this subject."
              searchPlaceholder="Search topics..."
              modalTitle="Select topics"
              modalDescription="Pick topics for this print job."
              selectLabel="Select topics"
              editLabel="Edit topics"
              disabled={!practiceSubjectId}
            />
            <FormInput
              label="Title"
              placeholder="Optional title"
              {...practiceForm.register("title")}
            />
            <FormTextarea
              label="Subtitle"
              placeholder="Optional subtitle"
              {...practiceForm.register("subtitle")}
            />
            <Controller
              control={practiceForm.control}
              name="includeAnswerKey"
              render={({ field }) => (
                <FormSwitch
                  label="Include Answer Key"
                  description="Append an answer key at the end."
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Button type="submit" disabled={practiceForm.formState.isSubmitting}>
              {practiceForm.formState.isSubmitting
                ? "Creating..."
                : "Create Practice Print"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
