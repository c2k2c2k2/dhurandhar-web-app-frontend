"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { QuestionCard } from "@/modules/student-questions/QuestionCard";
import { QuestionLanguageSwitcher } from "@/modules/student-questions/QuestionLanguageSwitcher";
import { useQuestionLanguage } from "@/modules/student-questions/QuestionLanguageProvider";
import type { AnswerState, AnswerValue } from "@/modules/student-questions/types";
import type { QuestionItem } from "@/modules/questions/types";
import { QuestionRichContent } from "@/modules/questions/components/RichTextRenderer";
import {
  type AttemptQuestionResult,
  type SubmitAttemptResponse,
} from "@/modules/student-tests/types";
import {
  useAttempt,
  useSaveAttempt,
  useSubmitAttempt,
} from "@/modules/student-tests/hooks";
import { trackStudentEvent } from "@/modules/student-analytics/events";
import { extractText } from "@/modules/questions/utils";

const QUESTION_OPTION_LABELS = ["A", "B", "C", "D"];

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

function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulAnswer(item));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.optionIndex === "number") {
      return true;
    }
    if (Array.isArray(record.optionIndexes)) {
      return record.optionIndexes.some((item) => typeof item === "number");
    }
    if ("value" in record) {
      return hasMeaningfulAnswer(record.value);
    }
    return Object.values(record).some((item) => hasMeaningfulAnswer(item));
  }

  return false;
}

function cleanAnswers(answers: AnswerState) {
  const result: Record<string, unknown> = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (hasMeaningfulAnswer(value)) {
      result[key] = value as unknown;
    }
  });
  return result;
}

function getNumberFromScore(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function isTextInputTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

function getReviewTone(status: AttemptQuestionResult["status"] | undefined) {
  if (status === "CORRECT") {
    return {
      title: "Correct answer",
      description: "You solved this one correctly.",
      cardClass: "border-emerald-500/30 bg-emerald-500/10",
      pillClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (status === "WRONG") {
    return {
      title: "Incorrect answer",
      description: "Review the correct answer and explanation below.",
      cardClass: "border-destructive/30 bg-destructive/10",
      pillClass: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  return {
    title: "Not attempted",
    description: "This question was left unanswered in the final submission.",
    cardClass: "border-amber-500/30 bg-amber-500/10",
    pillClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
}

function formatAnswerLabel(
  question: QuestionItem,
  answer: unknown,
) {
  if (!hasMeaningfulAnswer(answer)) {
    return "Not attempted";
  }

  if (answer && typeof answer === "object") {
    const typed = answer as Record<string, unknown>;

    if (typeof typed.optionIndex === "number") {
      return `Option ${QUESTION_OPTION_LABELS[typed.optionIndex] ?? typed.optionIndex + 1}`;
    }

    if (Array.isArray(typed.optionIndexes)) {
      const labels = typed.optionIndexes
        .filter((item): item is number => typeof item === "number")
        .map((item) => `Option ${QUESTION_OPTION_LABELS[item] ?? item + 1}`);
      return labels.length ? labels.join(", ") : "Not attempted";
    }

    if (question.type === "TRUE_FALSE" && typeof typed.value === "boolean") {
      return typed.value ? "True" : "False";
    }

    if ("value" in typed) {
      if (typeof typed.value === "string") {
        return typed.value.trim() || "Not attempted";
      }
      if (typed.value === null || typed.value === undefined) {
        return "Not attempted";
      }
      return String(typed.value);
    }
  }

  return String(answer);
}

function buildReviewSummary(
  reviewItems: AttemptQuestionResult[],
  scoreJson: Record<string, unknown> | null | undefined,
  questionCount: number,
) {
  if (reviewItems.length > 0) {
    const attempted = reviewItems.filter((item) => item.status !== "SKIPPED").length;
    const correct = reviewItems.filter((item) => item.status === "CORRECT").length;
    const wrong = reviewItems.filter((item) => item.status === "WRONG").length;
    const skipped = reviewItems.filter((item) => item.status === "SKIPPED").length;
    return {
      total: reviewItems.length,
      attempted,
      correct,
      wrong,
      skipped,
    };
  }

  return {
    total: getNumberFromScore(scoreJson?.totalQuestions) ?? questionCount,
    attempted: getNumberFromScore(scoreJson?.attemptedCount) ?? 0,
    correct: getNumberFromScore(scoreJson?.correctCount) ?? 0,
    wrong: getNumberFromScore(scoreJson?.wrongCount) ?? 0,
    skipped: getNumberFromScore(scoreJson?.skipCount) ?? 0,
  };
}

export default function StudentTestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = String(params?.id ?? "");
  const { mode: questionLanguageMode } = useQuestionLanguage();

  const { data: attempt, isLoading } = useAttempt(attemptId);
  const saveAttempt = useSaveAttempt();
  const submitAttempt = useSubmitAttempt();

  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = React.useState<SubmitAttemptResponse | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const debouncedAnswers = useDebouncedValue(answers, 800);

  const questions = attempt?.questions ?? [];
  const test = attempt?.test;
  const durationMinutes = getDuration(test?.configJson as Record<string, unknown>);
  const reviewItems = submittedResult?.questionResults ?? attempt?.questionResults ?? [];
  const reviewMap = React.useMemo(
    () => new Map(reviewItems.map((item) => [item.questionId, item])),
    [reviewItems],
  );

  const startedAt = attempt?.startedAt ? new Date(attempt.startedAt).getTime() : null;
  const [now, setNow] = React.useState(Date.now());

  const localStorageKey = attemptId ? `student_attempt_${attemptId}` : "";
  const hydratedAttemptIdRef = React.useRef<string | null>(null);
  const lastSavedPayloadRef = React.useRef<string | null>(null);
  const persistAttemptAnswersRef = React.useRef(saveAttempt.mutate);

  React.useEffect(() => {
    persistAttemptAnswersRef.current = saveAttempt.mutate;
  }, [saveAttempt.mutate]);

  React.useEffect(() => {
    hydratedAttemptIdRef.current = null;
    lastSavedPayloadRef.current = null;
    setAnswers({});
    setCurrentIndex(0);
    setError(null);
    setSubmittedResult(null);
  }, [attemptId]);

  React.useEffect(() => {
    if (!attemptId || !attempt || typeof window === "undefined") return;
    if (hydratedAttemptIdRef.current === attemptId) return;

    const stored = window.localStorage.getItem(localStorageKey);
    let parsed: AnswerState | undefined;
    try {
      parsed = stored ? (JSON.parse(stored) as AnswerState) : undefined;
    } catch {
      parsed = undefined;
    }

    const serverAnswers = (attempt.answersJson as AnswerState | undefined) ?? {};

    hydratedAttemptIdRef.current = attemptId;
    lastSavedPayloadRef.current = JSON.stringify(cleanAnswers(serverAnswers));
    setAnswers({ ...serverAnswers, ...parsed });
  }, [attempt, attemptId, localStorageKey]);

  React.useEffect(() => {
    if (!attempt || submittedResult) return;
    if (attempt.status === "EVALUATED" && attempt.scoreJson) {
      setSubmittedResult({
        totalScore: attempt.totalScore ?? 0,
        scoreJson: attempt.scoreJson as Record<string, unknown>,
        questionResults: attempt.questionResults,
      });
    }
  }, [attempt, submittedResult]);

  React.useEffect(() => {
    if (submittedResult || !attemptId || typeof window === "undefined") return;
    if (hydratedAttemptIdRef.current !== attemptId) return;
    window.localStorage.setItem(localStorageKey, JSON.stringify(answers));
  }, [answers, attemptId, localStorageKey, submittedResult]);

  React.useEffect(() => {
    if (!attemptId || !attempt || attempt.status === "EVALUATED") return;
    if (hydratedAttemptIdRef.current !== attemptId) return;

    const cleaned = cleanAnswers(debouncedAnswers);
    const serialized = JSON.stringify(cleaned);

    if (serialized === lastSavedPayloadRef.current) {
      return;
    }

    lastSavedPayloadRef.current = serialized;
    persistAttemptAnswersRef.current(
      { attemptId, answers: cleaned },
      {
        onError: () => {
          if (lastSavedPayloadRef.current === serialized) {
            lastSavedPayloadRef.current = null;
          }
        },
      },
    );
  }, [attempt?.status, attemptId, debouncedAnswers]);

  React.useEffect(() => {
    if (!startedAt || submittedResult) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, submittedResult]);

  React.useEffect(() => {
    if (!reviewItems.length || questions.length === 0) return;
    const firstNeedsReview = questions.findIndex((question) => {
      const review = reviewMap.get(question.id);
      return review?.status === "WRONG" || review?.status === "SKIPPED";
    });

    setCurrentIndex((current) => {
      if (current > 0 && current < questions.length) {
        return current;
      }
      return firstNeedsReview >= 0 ? firstNeedsReview : 0;
    });
  }, [questions, reviewItems, reviewMap]);

  const timeLeftMs =
    startedAt !== null
      ? startedAt + durationMinutes * 60 * 1000 - now
      : null;

  const answeredCount = React.useMemo(
    () => questions.filter((question) => hasMeaningfulAnswer(answers[question.id])).length,
    [answers, questions],
  );

  const handleAnswerChange = React.useCallback(
    (value: AnswerValue) => {
      const question = questions[currentIndex];
      if (!question) return;
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    },
    [currentIndex, questions],
  );

  const selectOptionIndex = React.useCallback(
    (index: number) => {
      const question = questions[currentIndex];
      if (!question || submittedResult) return;

      const currentAnswer = answers[question.id];
      const selectedIndexes =
        currentAnswer && typeof currentAnswer === "object"
          ? "optionIndex" in currentAnswer
            ? [currentAnswer.optionIndex]
            : "optionIndexes" in currentAnswer
              ? currentAnswer.optionIndexes
              : question.type === "TRUE_FALSE" &&
                  "value" in currentAnswer &&
                  typeof currentAnswer.value === "boolean"
                ? [currentAnswer.value ? 0 : 1]
                : []
          : [];

      if (question.type === "TRUE_FALSE") {
        handleAnswerChange({ value: index === 0 });
        return;
      }

      if (question.type === "MULTI_CHOICE") {
        const current = new Set(selectedIndexes);
        if (current.has(index)) {
          current.delete(index);
        } else {
          current.add(index);
        }
        handleAnswerChange({
          optionIndexes: Array.from(current).sort((left, right) => left - right),
        });
        return;
      }

      if (question.type === "SINGLE_CHOICE") {
        handleAnswerChange({ optionIndex: index });
      }
    },
    [answers, currentIndex, handleAnswerChange, questions, submittedResult],
  );

  const goToPreviousQuestion = React.useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToNextQuestion = React.useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, Math.max(questions.length - 1, 0)));
  }, [questions.length]);

  const handleSubmit = React.useCallback(async () => {
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
  }, [
    answers,
    attempt,
    isSubmitting,
    localStorageKey,
    submitAttempt,
    submittedResult,
  ]);

  React.useEffect(() => {
    if (timeLeftMs !== null && timeLeftMs <= 0 && !submittedResult) {
      void handleSubmit();
    }
  }, [handleSubmit, submittedResult, timeLeftMs]);

  React.useEffect(() => {
    if (submittedResult) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextInputTarget(event.target)) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void handleSubmit();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousQuestion();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextQuestion();
        return;
      }

      const lowerKey = event.key.toLowerCase();
      const shortcutIndex =
        /^[1-4]$/.test(lowerKey)
          ? Number(lowerKey) - 1
          : ["a", "b", "c", "d"].includes(lowerKey)
            ? ["a", "b", "c", "d"].indexOf(lowerKey)
            : -1;

      if (shortcutIndex >= 0) {
        event.preventDefault();
        selectOptionIndex(shortcutIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    goToNextQuestion,
    goToPreviousQuestion,
    handleSubmit,
    selectOptionIndex,
    submittedResult,
  ]);

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
    const selectedQuestion = questions[currentIndex];
    const selectedReview = selectedQuestion ? reviewMap.get(selectedQuestion.id) : undefined;
    const summary = buildReviewSummary(
      reviewItems,
      submittedResult.scoreJson,
      questions.length,
    );
    const tone = getReviewTone(selectedReview?.status);

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-accent" />
                <h1 className="font-display text-2xl font-semibold">Test submitted</h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Review each question, your answer, and the correct solution.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Final score
              </p>
              <p className="mt-1 text-2xl font-semibold">{submittedResult.totalScore}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Questions</p>
            <p className="mt-2 text-2xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Attempted</p>
            <p className="mt-2 text-2xl font-semibold">{summary.attempted}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Correct</p>
            <p className="mt-2 text-2xl font-semibold">{summary.correct}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wrong</p>
            <p className="mt-2 text-2xl font-semibold">{summary.wrong}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Skipped</p>
            <p className="mt-2 text-2xl font-semibold">{summary.skipped}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {selectedQuestion ? (
              <QuestionCard
                question={selectedQuestion}
                answer={(selectedReview?.answerJson as AnswerValue | undefined) ?? undefined}
                onAnswerChange={() => undefined}
                disabled
                review={{
                  isCorrect: selectedReview?.isCorrect,
                  correctAnswerJson: selectedReview?.correctAnswerJson,
                }}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                No review question loaded.
              </div>
            )}

            {selectedQuestion && selectedReview ? (
              <div className={`rounded-3xl border p-5 shadow-sm ${tone.cardClass}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Review
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">{tone.title}</h2>
                    <p className="text-sm text-muted-foreground">{tone.description}</p>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>
                    Score {selectedReview.scoreDelta > 0 ? `+${selectedReview.scoreDelta}` : selectedReview.scoreDelta}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Your answer
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {formatAnswerLabel(selectedQuestion, selectedReview.answerJson)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Correct answer
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {formatAnswerLabel(selectedQuestion, selectedReview.correctAnswerJson)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-semibold">Explanation</p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <QuestionRichContent
                      content={selectedQuestion.explanationJson}
                      language={questionLanguageMode}
                    />
                    {!extractText(selectedQuestion.explanationJson, questionLanguageMode).trim() ? (
                      <p>Review this concept and try a similar question again.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button variant="cta" onClick={() => router.push("/student/tests")}>
                Back to tests
              </Button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card/90 p-4 shadow-sm">
              <p className="text-sm font-semibold">Review palette</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1">
                  Correct
                </span>
                <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1">
                  Wrong
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1">
                  Skipped
                </span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((item, index) => {
                  const review = reviewMap.get(item.id);
                  const paletteClass =
                    review?.status === "CORRECT"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : review?.status === "WRONG"
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : review?.status === "SKIPPED"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          : "border-border bg-background text-muted-foreground";

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`h-9 rounded-xl border text-xs font-semibold ${
                        index === currentIndex
                          ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                          : ""
                      } ${paletteClass}`}
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
              Use the full option card to answer. Left and right arrow keys move between questions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <QuestionLanguageSwitcher />
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {timeLeftMs !== null ? formatTime(timeLeftMs) : "--:--"}
            </div>
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
          <div className="rounded-2xl border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}
              </p>
              <p>
                Answered: {answeredCount} / {questions.length}
              </p>
            </div>
          </div>

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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Shortcut: press <span className="font-semibold text-foreground">1-4</span> or{" "}
              <span className="font-semibold text-foreground">A-D</span> to choose options, and{" "}
              <span className="font-semibold text-foreground">Ctrl/Cmd + Enter</span> to submit.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={goToPreviousQuestion}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={goToNextQuestion}
                disabled={currentIndex >= questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="cta" onClick={handleSubmit} disabled={isSubmitting}>
                Submit test
                <Send className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => router.push("/student/tests")}>
                Exit attempt
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card/90 p-4 shadow-sm">
            <p className="text-sm font-semibold">Question palette</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-primary">
                Current
              </span>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-accent">
                Answered
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-1">
                Unanswered
              </span>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((item, index) => {
                const answered = hasMeaningfulAnswer(answers[item.id]);
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
