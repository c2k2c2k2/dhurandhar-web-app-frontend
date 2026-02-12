"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, PlayCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartAttempt, useTest } from "@/modules/student-tests/hooks";
import { trackStudentEvent } from "@/modules/student-analytics/events";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function getDuration(config?: Record<string, unknown>) {
  const duration = config?.durationMinutes ?? config?.duration ?? undefined;
  if (typeof duration === "number" && duration > 0) return duration;
  return 60;
}

export default function StudentTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = String(params?.id ?? "");

  const { data: test, isLoading } = useTest(testId);
  const startAttempt = useStartAttempt();
  const [error, setError] = React.useState<string | null>(null);

  const handleStart = async () => {
    if (!test) return;
    setError(null);
    try {
      const data = await startAttempt.mutateAsync(test.id);
      trackStudentEvent("test_start", { testId: test.id, attemptId: data.attemptId });
      router.push(`/student/tests/attempt/${data.attemptId}`);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Unable to start test.";
      setError(message || "Unable to start test.");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Loading test details...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Test not found.
      </div>
    );
  }

  const durationMinutes = getDuration(test.configJson as Record<string, unknown>);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Test details
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold">{test.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {test.description ?? "Timed mock test"}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" /> {durationMinutes} mins
          </span>
          {test.startsAt ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Starts {formatDate(test.startsAt)}
            </span>
          ) : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="cta" onClick={handleStart}>
            Start test
            <PlayCircle className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={() => router.push("/student/tests")}
          >
            Back to tests
          </Button>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
