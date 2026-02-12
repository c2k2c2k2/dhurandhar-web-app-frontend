"use client";

import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ExamHero } from "@/modules/exams/components/ExamHero";
import { ExamTabs } from "@/modules/exams/components/ExamTabs";
import { examDetailsCatalog } from "@/modules/exams/data/examDetailsCatalog";
import type { ExamDetails } from "@/modules/exams/types";

export function ExamDetailsPage({ slug }: { slug: string }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [exam, setExam] = React.useState<ExamDetails | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      setExam(examDetailsCatalog[slug] ?? null);
      setIsLoading(false);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="animate-pulse border-b border-border/70 bg-muted/30">
          <PageContainer className="max-w-6xl py-10">
            <div className="h-4 w-40 rounded-full bg-muted" />
            <div className="mt-6 h-8 w-2/3 rounded-full bg-muted" />
            <div className="mt-4 h-4 w-1/2 rounded-full bg-muted" />
          </PageContainer>
        </div>
        <PageContainer className="max-w-6xl py-10">
          <div className="h-10 w-60 rounded-full bg-muted" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="h-32 rounded-2xl bg-muted" />
            <div className="h-32 rounded-2xl bg-muted" />
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!exam) {
    return (
      <PageContainer className="max-w-6xl py-20">
        <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Exam not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The exam you are looking for is not available yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Back to home
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExamHero exam={exam} />
      <PageContainer className="max-w-6xl py-10">
        <ExamTabs exam={exam} />
      </PageContainer>
    </div>
  );
}
