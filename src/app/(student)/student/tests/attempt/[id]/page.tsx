"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Clock, Send, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { QuestionCard } from "@/modules/student-questions/QuestionCard";
import type { AnswerState, AnswerValue } from "@/modules/student-questions/types";
import {
  useAttempt,
  useSaveAttempt,
  useSubmitAttempt,
} from "@/modules/student-tests/hooks";
import { trackStudentEvent } from "@/modules/student-analytics/events";

function getDuration(config?: Record<string, unknown>) {
  const duration = config?.durationMinutes ?? config?.duration ?? undefined;
  if (typeof duration === "number" && duration > 0) return duration;
  return 60;
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function cleanAnswers(answers: AnswerState) {
  const result: Record<string, unknown> = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value as unknown;
    }
  });
  return result;
}

export default function StudentTestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = String(params?.id ?? "");

  const { data: attempt, isLoading } = useAttempt(attemptId);
  const saveAttempt = useSaveAttempt();
  const submitAttempt = useSubmitAttempt();

  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = React.useState<
    { totalScore: number; scoreJson: Record<string, unknown> } | null
  >(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const debouncedAnswers = useDebouncedValue(answers, 800);

  const questions = attempt?.questions ?? [];
  const test = attempt?.test;
  const durationMinutes = getDuration(test?.configJson as Record<string, unknown>);

  const startedAt = attempt?.startedAt ? new Date(attempt.startedAt).getTime() : null;
  const [now, setNow] = React.useState(Date.now());

  const localStorageKey = attemptId ? `student_attempt_${attemptId}` : "";

  React.useEffect(() => {
    if (!attemptId || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(localStorageKey);
    let parsed: AnswerState | undefined;
    try {
      parsed = stored ? (JSON.parse(stored) as AnswerState) : undefined;
    } catch {
      parsed = undefined;
    }
    const serverAnswers = attempt?.answersJson as AnswerState | undefined;
    setAnswers({ ...serverAnswers, ...parsed });
  }, [attemptId, attempt?.answersJson, localStorageKey]);

  React.useEffect(() => {
    if (!attempt || submittedResult) return;
    if (attempt.status === "EVALUATED" && attempt.scoreJson) {
      setSubmittedResult({
        totalScore: attempt.totalScore ?? 0,
        scoreJson: attempt.scoreJson as Record<string, unknown>,
      });
    }
  }, [attempt, submittedResult]);

  React.useEffect(() => {
    if (!attemptId || typeof window === "undefined") return;
    window.localStorage.setItem(localStorageKey, JSON.stringify(answers));
  }, [answers, attemptId, localStorageKey]);

  React.useEffect(() => {
    if (!attemptId || !attempt || attempt.status === "EVALUATED") return;
    const cleaned = cleanAnswers(debouncedAnswers);
    if (Object.keys(cleaned).length === 0) return;
    saveAttempt.mutate({ attemptId, answers: cleaned });
  }, [debouncedAnswers, attemptId, attempt, saveAttempt]);

  React.useEffect(() => {
    if (!startedAt || submittedResult) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, submittedResult]);

  const timeLeftMs =
    startedAt !== null
      ? startedAt + durationMinutes * 60 * 1000 - now
      : null;

  const handleAnswerChange = (value: AnswerValue) => {
    const question = questions[currentIndex];
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    if (isSubmitting || submittedResult) return;
    setError(null);
    try {
      setIsSubmitting(true);
      const cleaned = cleanAnswers(answers);
      const result = await submitAttempt.mutateAsync({
        attemptId: attempt.id,
        answers: cleaned,
      });
      setSubmittedResult(result);
      trackStudentEvent("test_submit", { attemptId: attempt.id, testId: attempt.testId });
      if (typeof window !== "undefined" && localStorageKey) {
        window.localStorage.removeItem(localStorageKey);
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Unable to submit test.";
      setError(message || "Unable to submit test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (timeLeftMs !== null && timeLeftMs <= 0 && !submittedResult) {
      void handleSubmit();
    }
  }, [timeLeftMs, submittedResult]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Loading attempt...
      </div>
    );
  }

  if (!attempt || !test) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Attempt not found.
      </div>
    );
  }

  if (submittedResult) {
    const scoreJson = submittedResult.scoreJson as Record<string, any>;
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-accent" />
            <h1 className="font-display text-2xl font-semibold">Test submitted</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Score: {submittedResult.totalScore}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Questions
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {scoreJson.totalQuestions ?? questions.length}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Correct
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {scoreJson.correctCount ?? "--"}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Wrong
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {scoreJson.wrongCount ?? "--"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="cta" onClick={() => router.push("/student/tests")}
          >
            Back to tests
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const answer = question ? answers[question.id] : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Attempt
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              {test.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Answer all questions before time runs out.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {timeLeftMs !== null ? formatTime(timeLeftMs) : "--:--"}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          {question ? (
            <QuestionCard
              question={question}
              answer={answer}
              onAnswerChange={handleAnswerChange}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No questions loaded.
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="cta" onClick={handleSubmit} disabled={isSubmitting}>
              Submit test
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => router.push("/student/tests")}
            >
              Exit attempt
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card/90 p-4 shadow-sm">
            <p className="text-sm font-semibold">Question palette</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {questions.map((item, index) => {
                const answered = Boolean(answers[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-9 rounded-xl border text-xs font-semibold ${
                      index === currentIndex
                        ? "border-primary bg-primary/10 text-primary"
                        : answered
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
