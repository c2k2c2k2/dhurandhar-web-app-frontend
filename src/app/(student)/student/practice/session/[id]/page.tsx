"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/modules/student-questions/QuestionCard";
import { QuestionLanguageSwitcher } from "@/modules/student-questions/QuestionLanguageSwitcher";
import type { AnswerState, AnswerValue } from "@/modules/student-questions/types";
import type { QuestionItem } from "@/modules/questions/types";
import { getNextQuestions } from "@/modules/student-practice/api";
import {
  useEndPractice,
  usePracticeProgress,
  usePracticeWeakQuestions,
  useSubmitPracticeAnswer,
} from "@/modules/student-practice/hooks";
import { trackStudentEvent } from "@/modules/student-analytics/events";
import { extractText } from "@/modules/questions/utils";
import { QuestionRichContent } from "@/modules/questions/components/RichTextRenderer";
import { useQuestionLanguage } from "@/modules/student-questions/QuestionLanguageProvider";

const BATCH_SIZE = 5;

export default function StudentPracticeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = String(params?.id ?? "");

  const [queue, setQueue] = React.useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [submitted, setSubmitted] = React.useState<Record<string, boolean>>({});
  const [reviews, setReviews] = React.useState<
    Record<string, { isCorrect?: boolean | null; correctAnswerJson?: unknown }>
  >({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showSummary, setShowSummary] = React.useState(false);

  const submitAnswer = useSubmitPracticeAnswer();
  const endPractice = useEndPractice();
  const { data: progress } = usePracticeProgress();
  const { data: weakQuestions } = usePracticeWeakQuestions(4);
  const { mode: questionLanguageMode } = useQuestionLanguage();

  const loadBatch = React.useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getNextQuestions(sessionId, BATCH_SIZE);
      setQueue(data.questions);
      setCurrentIndex(0);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Unable to load practice questions.";
      setError(message || "Unable to load practice questions.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  React.useEffect(() => {
    void loadBatch();
  }, [loadBatch]);

  const currentQuestion = queue[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isSubmitted = currentQuestion ? submitted[currentQuestion.id] : false;
  const currentReview = currentQuestion ? reviews[currentQuestion.id] : undefined;

  const handleAnswerChange = (value: AnswerValue) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    if (!currentAnswer) {
      setError("Please select an answer before submitting.");
      return;
    }

    setError(null);
    try {
      const response = await submitAnswer.mutateAsync({
        sessionId,
        payload: { questionId: currentQuestion.id, answerJson: currentAnswer },
      });
      setSubmitted((prev) => ({ ...prev, [currentQuestion.id]: true }));
      const result = response.results?.find(
        (item) => item.questionId === currentQuestion.id
      );
      if (result) {
        setReviews((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            isCorrect: result.isCorrect,
            correctAnswerJson: result.correctAnswerJson,
          },
        }));
      }
      trackStudentEvent("practice_answer", {
        sessionId,
        questionId: currentQuestion.id,
      });
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Answer submission failed.";
      setError(message || "Answer submission failed.");
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    await loadBatch();
  };

  const handleFinish = async () => {
    try {
      await endPractice.mutateAsync(sessionId);
    } finally {
      trackStudentEvent("practice_finish", { sessionId });
      setShowSummary(true);
    }
  };

  if (showSummary) {
    const totalAnswered =
      progress?.subjects?.reduce((sum, item) => sum + item.totalAnswered, 0) ?? 0;
    const totalCorrect =
      progress?.subjects?.reduce((sum, item) => sum + item.correctCount, 0) ?? 0;
    const accuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Session summary
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Great work today!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your practice accuracy and weak areas are updated.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Total answered
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalAnswered}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Accuracy
            </p>
            <p className="mt-2 text-2xl font-semibold">{accuracy}%</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Topics covered
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {progress?.topics?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-sm font-semibold">Weak areas to revisit</p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            {weakQuestions?.length ? (
              weakQuestions.map((item) => (
                <div
                  key={item.question.id}
                  className="rounded-2xl border border-border bg-background px-3 py-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    {extractText(item.question.statementJson).slice(0, 140) ||
                      "Practice question"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Wrong: {item.wrongCount} • Correct: {item.correctCount}
                  </p>
                </div>
              ))
            ) : (
              <p>No weak questions yet.</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="cta" asChild>
            <Link href="/student/practice/start">Start another session</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/student">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Practice session
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              Focus mode
            </h1>
            <p className="text-sm text-muted-foreground">
              Answer, review explanation, and move to the next question.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <QuestionLanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleFinish}>
              <Flag className="h-4 w-4" />
              Finish session
            </Button>
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

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading questions...
        </div>
      ) : null}

      {currentQuestion ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                Question {currentIndex + 1} of {queue.length} in this set
              </p>
              <p>
                Attempted:{" "}
                {
                  queue.filter((item) =>
                    Boolean(submitted[item.id] || answers[item.id])
                  ).length
                }
              </p>
            </div>
          </div>

          <QuestionCard
            question={currentQuestion}
            answer={currentAnswer}
            onAnswerChange={handleAnswerChange}
            disabled={isSubmitted}
            review={currentReview}
          />

          {isSubmitted ? (
            <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
              <div
                className={`mb-3 rounded-2xl border px-3 py-2 text-sm ${
                  currentReview?.isCorrect === true
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : currentReview?.isCorrect === false
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {currentReview?.isCorrect === true
                  ? "Correct answer. Great job."
                  : currentReview?.isCorrect === false
                    ? "Incorrect answer. Review the explanation before moving on."
                    : "Answer submitted. Review the explanation before moving on."}
              </div>
              <p className="text-sm font-semibold">Explanation</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <QuestionRichContent
                  content={currentQuestion.explanationJson}
                  language={questionLanguageMode}
                />
                {!extractText(currentQuestion.explanationJson, questionLanguageMode).trim() ? (
                  <p>Review the concept and move on to the next question.</p>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={handleNext}>
                  Next question
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={handleFinish}>
                  Finish session
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button variant="cta" onClick={handleSubmit}>
                Submit answer
              </Button>
              <Button variant="secondary" onClick={handleNext}>
                Skip
              </Button>
            </div>
          )}
        </div>
      ) : !loading ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          No questions found. Try starting a new session.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => router.push("/student/practice")}
        >
          Exit session
        </Button>
      </div>
    </div>
  );
}
