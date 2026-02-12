"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/lib/auth/AuthProvider";
import { goToStart } from "@/modules/shared/auth/authRedirect";
import type { ExamDetails } from "@/modules/exams/types";

export function ExamHero({ exam }: { exam: ExamDetails }) {
  const router = useRouter();
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  const handleStart = () => {
    goToStart(router, {
      isAuthenticated,
      next: `/exams/${exam.slug}`,
      from: "exam-details",
    });
  };

  return (
    <section className="border-b border-border/70 bg-muted/30 py-10">
      <PageContainer className="max-w-6xl">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/exams" className="hover:text-foreground">
            Exams
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{exam.name}</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {exam.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">
              {exam.name}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {exam.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="cta" size="lg" onClick={handleStart}>
              Start Preparation
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/#pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
