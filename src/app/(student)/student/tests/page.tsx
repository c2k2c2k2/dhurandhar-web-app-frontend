"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Clock,
  PlayCircle,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaywallCard } from "@/modules/student-notes/components/PaywallCard";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import { useAttempts, useStartAttempt, useTests } from "@/modules/student-tests/hooks";
import { trackStudentEvent } from "@/modules/student-analytics/events";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function StudentTestsPage() {
  const router = useRouter();
  const { canAccessTests } = useStudentAccess();
  const access = canAccessTests();
  const { data: testsResponse, isLoading } = useTests();
  const { data: attemptsResponse } = useAttempts(1, 6);
  const startAttempt = useStartAttempt();
  const [error, setError] = React.useState<string | null>(null);

  const tests = testsResponse?.data ?? [];
  const attempts = attemptsResponse?.data ?? [];

  const handleStart = async (testId: string) => {
    if (!access.allowed) return;
    setError(null);
    try {
      const data = await startAttempt.mutateAsync(testId);
      trackStudentEvent("test_start", { testId, attemptId: data.attemptId });
      router.push(`/student/tests/attempt/${data.attemptId}`);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Unable to start test.";
      setError(message || "Unable to start test.");
    }
  };

  if (!access.allowed) {
    return (
      <PaywallCard
        title="Tests are locked"
        description="Upgrade to unlock full-length mocks, sectionals, and performance analytics."
        actionLabel="Unlock tests"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Tests
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              Timed mocks + sectionals
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a test to unlock your score and analysis.
            </p>
          </div>
          <ClipboardList className="h-10 w-10 text-accent" />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Available tests</p>
          {isLoading ? <span className="text-xs text-muted-foreground">Loading...</span> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map((test) => (
            <div
              key={test.id}
              className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{test.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {test.description ?? "Timed mock test"}
                  </p>
                </div>
                <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {test.type}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {test.startsAt ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Starts {formatDate(test.startsAt)}
                  </span>
                ) : null}
                {test.endsAt ? (
                  <span className="inline-flex items-center gap-1">
                    Ends {formatDate(test.endsAt)}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="cta" size="sm" onClick={() => handleStart(test.id)}>
                  Start test
                  <PlayCircle className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/student/tests/${test.id}`}>View details</Link>
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && tests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No tests are available right now.
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Your recent attempts</p>
        <div className="grid gap-4 md:grid-cols-2">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {attempt.test?.title ?? "Test attempt"}
                </p>
                <span className="text-xs text-muted-foreground">
                  {attempt.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Score: {attempt.totalScore ?? "--"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/student/tests/attempt/${attempt.id}`}>
                    View attempt
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/student/tests">
                    Retry
                    <Trophy className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          {attempts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No attempts yet. Start your first mock test.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
