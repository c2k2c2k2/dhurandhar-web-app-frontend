"use client";

import Link from "next/link";
import { PlayCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaywallCard } from "@/modules/student-notes/components/PaywallCard";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import {
  usePracticeProgress,
  usePracticeTrend,
  usePracticeWeakQuestions,
} from "@/modules/student-practice/hooks";
import { extractText } from "@/modules/questions/utils";

export default function StudentPracticePage() {
  const { canAccessPractice } = useStudentAccess();
  const access = canAccessPractice();
  const { data: progress } = usePracticeProgress(access.allowed);
  const { data: trend } = usePracticeTrend(7, access.allowed);
  const { data: weakQuestions } = usePracticeWeakQuestions(4, access.allowed);

  if (!access.allowed) {
    return (
      <PaywallCard
        title="Practice sets are locked"
        description="Upgrade to unlock unlimited topic-wise practice and accuracy insights."
        actionLabel="Unlock practice"
      />
    );
  }

  const totalAnswered =
    progress?.subjects?.reduce((sum, item) => sum + item.totalAnswered, 0) ?? 0;
  const totalCorrect =
    progress?.subjects?.reduce((sum, item) => sum + item.correctCount, 0) ?? 0;
  const accuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Practice
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              Topic-wise drills
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a subject and start untimed MCQ practice with instant feedback.
            </p>
          </div>
          <Target className="h-10 w-10 text-accent" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="cta" asChild>
            <Link href="/student/practice/start">
              Start new practice
              <PlayCircle className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/student/subjects">Choose topic</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Questions answered
          </p>
          <p className="mt-2 text-2xl font-semibold">{totalAnswered}</p>
          <p className="text-xs text-muted-foreground">Across all practice topics</p>
        </div>
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Accuracy
          </p>
          <p className="mt-2 text-2xl font-semibold">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Overall practice score</p>
        </div>
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Active topics
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {progress?.topics?.length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Topics attempted so far</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-sm font-semibold">Weekly activity</p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            {trend?.length ? (
              trend.map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2"
                >
                  <span>{item.date}</span>
                  <span>
                    {item.total} attempted • {item.correct} correct
                  </span>
                </div>
              ))
            ) : (
              <p>No practice activity yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-sm font-semibold">Weak areas</p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            {weakQuestions?.length ? (
              weakQuestions.map((item) => (
                <div
                  key={item.question.id}
                  className="rounded-2xl border border-border bg-background px-3 py-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    {extractText(item.question.statementJson).slice(0, 120) ||
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
      </div>
    </div>
  );
}
