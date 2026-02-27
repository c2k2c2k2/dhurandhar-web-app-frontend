"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Crown, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { normalizeIndianPhone } from "@/lib/phone";
import { updateMyProfile } from "@/modules/account/api";
import { useToast } from "@/modules/shared/components/Toast";
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return fallback;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { logout, refreshUser } = useAuth();
  const { me, subscription, refresh } = useStudentAccess();
  const { data: summary } = useStudentSummary();
  const { data: practiceTopics } = usePracticeTopics(1, 6);
  const { data: notesProgress } = useNotesProgress({ page: 1, pageSize: 5 });
  const { data: testSummary } = useTestSummary();
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isDirty, setIsDirty] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [savingProfile, setSavingProfile] = React.useState(false);

  React.useEffect(() => {
    if (!me || isDirty) {
      return;
    }
    setFullName(me.fullName ?? "");
    setPhone(me.phone ?? "");
  }, [isDirty, me]);

  const handleLogout = async () => {
    await logout();
    router.replace("/student/login");
  };

  const handleProfileReset = () => {
    setFullName(me?.fullName ?? "");
    setPhone(me?.phone ?? "");
    setProfileError(null);
    setIsDirty(false);
  };

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!me) {
      return;
    }

    setProfileError(null);

    const normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone) {
      setProfileError("Enter a valid Indian mobile number.");
      return;
    }

    const nextFullName = fullName.trim();
    const currentFullName = (me.fullName ?? "").trim();
    const currentPhone = (me.phone ?? "").trim();

    const payload: { fullName?: string; phone?: string } = {};
    if (nextFullName && nextFullName !== currentFullName) {
      payload.fullName = nextFullName;
    }
    if (normalizedPhone !== currentPhone) {
      payload.phone = normalizedPhone;
    }

    if (!payload.fullName && !payload.phone) {
      setIsDirty(false);
      toast({
        title: "No changes",
        description: "Profile details are already up to date.",
      });
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateMyProfile(payload);
      setFullName(updated.fullName ?? "");
      setPhone(updated.phone ?? "");
      setIsDirty(false);
      await Promise.all([refresh(), refreshUser()]);
      toast({ title: "Profile updated" });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update profile.");
      setProfileError(message);
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
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
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Account details</p>
            <p className="text-xs text-muted-foreground">
              Used for login protection and watermarking.
            </p>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleProfileSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full name</label>
                <Input
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile number</label>
                <Input
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="+91 98765 43210"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Indian mobile number only.
                </p>
              </div>
            </div>
            {profileError ? (
              <p className="text-sm text-destructive">{profileError}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleProfileReset}
                disabled={savingProfile || !isDirty}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

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
