"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Crown, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import {
  useNotesProgress,
  usePracticeTopics,
  useStudentSummary,
  useTestSummary,
} from "@/modules/student-profile/hooks";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { me, subscription } = useStudentAccess();
  const { data: summary } = useStudentSummary();
  const { data: practiceTopics } = usePracticeTopics(1, 6);
  const { data: notesProgress } = useNotesProgress({ page: 1, pageSize: 5 });
  const { data: testSummary } = useTestSummary();

  const handleLogout = async () => {
    await logout();
    router.replace("/student/login");
  };

  const progressCards = [
    {
      label: "Notes completed",
      value: summary?.notes?.completed ?? 0,
      sub: `${summary?.notes?.completionRate ?? 0}% completion`,
    },
    {
      label: "Practice accuracy",
      value: `${summary?.practice?.accuracy ?? 0}%`,
      sub: `${summary?.practice?.answered ?? 0} answered`,
    },
    {
      label: "Tests attempted",
      value: summary?.tests?.attempts ?? 0,
      sub: `${testSummary?.averageScore ?? 0} avg score`,
    },
  ];

  const activities = [
    summary?.notes?.lastUpdatedAt
      ? `Last note update: ${formatDate(summary.notes.lastUpdatedAt)}`
      : null,
    summary?.practice?.lastAnsweredAt
      ? `Last practice answer: ${formatDate(summary.practice.lastAnsweredAt)}`
      : null,
    summary?.tests?.lastAttemptAt
      ? `Last test attempt: ${formatDate(summary.tests.lastAttemptAt)}`
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Profile
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              {me?.fullName ?? "Student"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {me?.email ?? ""}
              {me?.createdAt ? ` • Joined ${formatDate(me.createdAt)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild>
              <Link href="/student/payments">Manage plan</Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Crown className="h-4 w-4 text-accent" />
            Subscription
          </div>
          {subscription?.status === "ACTIVE" ? (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium">
                {subscription.plan?.name ?? "Active plan"}
              </p>
              <p className="text-xs text-muted-foreground">
                Active until {formatDate(subscription.endsAt)}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              No active subscription. Upgrade to unlock premium access.
            </p>
          )}
          <Button variant="ghost" size="sm" asChild className="mt-3">
            <Link href="/student/payments">Upgrade</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-accent" />
            Study streak
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {summary?.practice?.answered ? 1 + Math.floor(summary.practice.answered / 20) : 0} days
          </p>
          <p className="text-xs text-muted-foreground">
            Keep it alive with a 10 min practice.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {progressCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-sm font-semibold">Topic progress</p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            {practiceTopics?.data?.length ? (
              practiceTopics.data.map((item) => {
                const accuracy =
                  item.totalAnswered > 0
                    ? Math.round((item.correctCount / item.totalAnswered) * 100)
                    : 0;
                return (
                  <div
                    key={item.topicId}
                    className="rounded-2xl border border-border bg-background px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {item.topic?.name} • {item.topic?.subject?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.totalAnswered} attempted • {accuracy}% accuracy
                    </p>
                  </div>
                );
              })
            ) : (
              <p>No topic progress yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-accent" />
            Recent activity
          </div>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            {activities.length ? (
              activities.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-border bg-background px-3 py-2"
                >
                  {item}
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-border bg-background px-3 py-2">
                No recent activity yet.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
        <p className="text-sm font-semibold">Latest notes progress</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {notesProgress?.data?.length ? (
            notesProgress.data.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-background px-3 py-2"
              >
                <p className="text-sm font-medium text-foreground">
                  {item.note.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(item.completionPercent ?? 0)}% complete
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No note progress yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
