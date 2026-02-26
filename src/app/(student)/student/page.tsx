"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Target,
  Flame,
} from "lucide-react";
import { PremiumBadge } from "@/components/brand/PremiumBadge";
import { Button } from "@/components/ui/button";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import { cn } from "@/lib/utils";
import { useStudentHome } from "@/modules/student-home/hooks";
import type { StudentHomeResponse } from "@/modules/student-home/types";

const fallbackHome: StudentHomeResponse = {
  banners: [
    {
      id: "banner-1",
      title: "SSC CGL Crash Notes",
      subtitle: "New short notes for Quant + English with quick examples.",
      ctaLabel: "Open Notes",
      ctaHref: "/student/notes",
      tone: "primary",
    },
    {
      id: "banner-2",
      title: "Weekly Mock 07",
      subtitle: "Full-length mock test with rank insights.",
      ctaLabel: "Start Test",
      ctaHref: "/student/tests",
      tone: "accent",
    },
  ],
  announcements: [
    {
      id: "ann-1",
      title: "Live doubt session at 7 PM",
      message: "Join the mentor session for Quant shortcuts and Q&A.",
      level: "info",
    },
    {
      id: "ann-2",
      title: "New Reasoning topic sets",
      message: "5 new practice sets have been added for puzzles.",
      level: "success",
    },
  ],
  sections: [
    {
      id: "sec-notes",
      type: "NOTES",
      title: "Pick a notes pack",
      subtitle: "Most loved by SSC + Banking students",
      items: [
        {
          id: "note-1",
          title: "Number System Quickbook",
          subtitle: "Shortcuts + solved examples",
          badge: "Premium",
          ctaLabel: "Open",
          ctaHref: "/student/notes",
        },
        {
          id: "note-2",
          title: "English Error Finder",
          subtitle: "Common grammar traps",
          badge: "Free",
          ctaLabel: "Open",
          ctaHref: "/student/notes",
        },
      ],
    },
    {
      id: "sec-tests",
      type: "TESTS",
      title: "Upcoming tests",
      subtitle: "Scheduled this week",
      items: [
        {
          id: "test-1",
          title: "SSC CGL Mock 07",
          subtitle: "120 min • Full length",
          badge: "Tomorrow",
          ctaLabel: "View",
          ctaHref: "/student/tests",
        },
        {
          id: "test-2",
          title: "Banking Quant Sprint",
          subtitle: "45 min • Sectional",
          badge: "Friday",
          ctaLabel: "View",
          ctaHref: "/student/tests",
        },
      ],
    },
  ],
};

const quickActions = [
  {
    title: "Notes",
    description: "Topic-wise, exam-ready notes",
    href: "/student/notes",
    icon: BookOpen,
    tone: "bg-primary/10 text-primary",
  },
  {
    title: "Practice",
    description: "MCQs mapped to topics",
    href: "/student/practice/start",
    icon: Target,
    tone: "bg-accent/10 text-accent",
  },
  {
    title: "Tests",
    description: "Timed mocks + subject tests",
    href: "/student/tests",
    icon: ClipboardList,
    tone: "bg-brand-gold/30 text-amber-700 dark:text-amber-200",
  },
  {
    title: "Subjects",
    description: "Browse full syllabus",
    href: "/student/subjects",
    icon: GraduationCap,
    tone: "bg-muted text-foreground",
  },
];

function bannerTone(tone?: string) {
  if (tone === "accent") {
    return "bg-gradient-to-br from-accent/20 via-card/90 to-card border-accent/30";
  }
  if (tone === "primary") {
    return "bg-gradient-to-br from-primary/15 via-card/90 to-card border-primary/30";
  }
  return "bg-gradient-to-br from-muted/80 via-card/90 to-card";
}

export default function StudentHomePage() {
  const { me } = useStudentAccess();
  const { data, isLoading } = useStudentHome();
  const home = data ?? fallbackHome;
  const firstName = me?.fullName?.split(" ")[0] || "Student";

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Today&apos;s momentum
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold">
                Namaste, {firstName}. Let&apos;s push your rank today.
              </h1>
            </div>
            <PremiumBadge>Premium</PremiumBadge>
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Your learning plan is tuned for SSC, Banking, and Railways patterns.
            Keep the streak alive with one quick practice set and a short notes
            revision.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="cta" asChild>
              <Link href="/student/practice/start">
                Resume Practice
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/student/notes">Open Notes</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Streak
              </p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <Flame className="h-4 w-4 text-accent" /> 5 days
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Accuracy
              </p>
              <p className="mt-2 text-lg font-semibold">82%</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Today
              </p>
              <p className="mt-2 text-lg font-semibold">42 mins</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Focus stack
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold">
                Keep these on repeat
              </h2>
            </div>
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">
                Quant: Ratio + Proportion
              </p>
              <p className="text-xs text-muted-foreground">
                12 questions • 15 min drill
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">
                Reasoning: Puzzles
              </p>
              <p className="text-xs text-muted-foreground">
                10 questions • 12 min drill
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">
                English: Error spotting
              </p>
              <p className="text-xs text-muted-foreground">
                8 questions • 10 min drill
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Quick actions
            </p>
            <h2 className="font-display text-xl font-semibold">
              Jump back in
            </h2>
          </div>
          <Button variant="ghost" asChild size="sm">
            <Link href="/student/subjects">View syllabus</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-3xl border border-border bg-card/90 p-4 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl",
                    action.tone
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{action.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Spotlight
            </p>
            <h2 className="font-display text-xl font-semibold">What&apos;s new</h2>
          </div>
          {isLoading ? (
            <span className="text-xs text-muted-foreground">Loading...</span>
          ) : null}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {home.banners.map((banner) => (
            <div
              key={banner.id}
              className={cn(
                "min-w-[260px] flex-1 rounded-3xl border p-5 shadow-sm",
                bannerTone(banner.tone)
              )}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Featured
              </p>
              <h3 className="mt-3 text-lg font-semibold">{banner.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {banner.subtitle}
              </p>
              {banner.ctaLabel && banner.ctaHref ? (
                <Button variant="secondary" size="sm" asChild className="mt-4">
                  <Link href={banner.ctaHref}>{banner.ctaLabel}</Link>
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Announcements
          </p>
          <h2 className="font-display text-xl font-semibold">
            Updates from mentors
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {home.announcements.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-card/90 p-4"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        {home.sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {section.type === "NOTES"
                  ? "Notes"
                  : section.type === "TESTS"
                    ? "Tests"
                    : section.type === "PRACTICE"
                      ? "Practice"
                      : "Section"}
              </p>
              <h3 className="font-display text-lg font-semibold">
                {section.title}
              </h3>
              {section.subtitle ? (
                <p className="text-xs text-muted-foreground">{section.subtitle}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(section.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-border bg-card/90 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    {item.badge ? (
                      <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  {item.subtitle ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  ) : null}
                  {item.meta ? (
                    <p className="mt-2 text-xs text-muted-foreground">{item.meta}</p>
                  ) : null}
                  {item.ctaLabel && item.ctaHref ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="mt-3"
                    >
                      <Link href={item.ctaHref}>{item.ctaLabel}</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
