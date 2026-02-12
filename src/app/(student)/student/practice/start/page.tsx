"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaywallCard } from "@/modules/student-notes/components/PaywallCard";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import { useStartPractice } from "@/modules/student-practice/hooks";
import { PracticeStartSchema } from "@/modules/student-practice/schemas";
import { trackStudentEvent } from "@/modules/student-analytics/events";
import type { QuestionDifficulty } from "@/modules/questions/types";

const DIFFICULTY_OPTIONS: Array<{ label: string; value?: QuestionDifficulty }> = [
  { label: "Mixed", value: undefined },
  { label: "Easy", value: "EASY" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Hard", value: "HARD" },
];

export default function StudentPracticeStartPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading practice setup...
        </div>
      }
    >
      <PracticeStartForm />
    </React.Suspense>
  );
}

function PracticeStartForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { canAccessPractice } = useStudentAccess();
  const access = canAccessPractice();
  const { data: subjects = [] } = useSubjects();

  const initialSubjectId = params.get("subjectId") ?? "";
  const initialTopicId = params.get("topicId") ?? "";

  const [subjectId, setSubjectId] = React.useState(initialSubjectId);
  const { data: topics = [] } = useTopics(subjectId || undefined);
  const [topicId, setTopicId] = React.useState(initialTopicId);
  const [difficulty, setDifficulty] = React.useState<QuestionDifficulty | undefined>(
    undefined
  );
  const [count, setCount] = React.useState(20);
  const [error, setError] = React.useState<string | null>(null);

  const startPractice = useStartPractice();

  React.useEffect(() => {
    if (topicId && !topics.find((topic) => topic.id === topicId)) {
      setTopicId("");
    }
  }, [topics, topicId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const parsed = PracticeStartSchema.safeParse({
        subjectId: subjectId || undefined,
        topicId: topicId || undefined,
        difficulty,
        count,
      });
      if (!parsed.success) {
        setError("Please check your inputs and try again.");
        return;
      }

      const session = await startPractice.mutateAsync(parsed.data);
      trackStudentEvent("practice_start", {
        sessionId: session.id,
        subjectId,
        topicId,
        difficulty,
        count,
      });
      router.push(`/student/practice/session/${session.id}`);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Failed to start practice.";
      setError(message || "Failed to start practice.");
    }
  };

  if (!access.allowed) {
    return (
      <PaywallCard
        title="Practice access locked"
        description="Upgrade to unlock untimed topic-wise practice sessions with insights."
        actionLabel="Upgrade now"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Practice setup
        </p>
        <h1 className="font-display text-2xl font-semibold">
          Start a new practice session
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose subject, optional topic, and question count.
        </p>
      </div>

      <form
        className="grid gap-4 rounded-3xl border border-border bg-card/90 p-6 shadow-sm md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <label className="space-y-2 text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Subject
          </span>
          <select
            className="h-10 w-full rounded-2xl border border-border bg-background px-3"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
          >
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name ?? subject.title ?? "Subject"}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Topic (optional)
          </span>
          <select
            className="h-10 w-full rounded-2xl border border-border bg-background px-3"
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
          >
            <option value="">All topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name ?? "Topic"}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Difficulty
          </span>
          <select
            className="h-10 w-full rounded-2xl border border-border bg-background px-3"
            value={difficulty ?? ""}
            onChange={(event) =>
              setDifficulty(
                event.target.value ? (event.target.value as QuestionDifficulty) : undefined
              )
            }
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.label} value={option.value ?? ""}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Questions per set
          </span>
          <Input
            type="number"
            min={5}
            max={50}
            value={count}
            onChange={(event) => setCount(Number(event.target.value || 0))}
          />
        </label>

        {error ? (
          <div className="md:col-span-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button variant="cta" type="submit" disabled={startPractice.isPending}>
            Start practice
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.push("/student/subjects")}
          >
            Browse syllabus
          </Button>
        </div>
      </form>
    </div>
  );
}
