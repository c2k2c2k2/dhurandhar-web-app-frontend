"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { exams } from "@/modules/landing/content";
import type { Exam } from "@/modules/landing/types";

const filters = [
  { label: "All", value: "all" },
  { label: "Popular", value: "popular" },
  { label: "New", value: "new" },
  { label: "Free", value: "free" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

export function ExamsSection() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<FilterValue>("all");
  const inputId = "exam-search";

  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  const filteredExams = React.useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    return exams.filter((exam) => {
      if (activeFilter !== "all" && !exam.tags.includes(activeFilter)) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return (
        exam.name.toLowerCase().includes(normalized) ||
        exam.shortDescription.toLowerCase().includes(normalized) ||
        exam.tags.some((tag) => tag.includes(normalized))
      );
    });
  }, [activeFilter, debouncedQuery]);

  const handleOpen = (exam: Exam) => {
    if (!exam.isActive) {
      return;
    }
    router.push(`/exams/${exam.slug}`);
  };

  return (
    <section id="exams" className="scroll-mt-24 py-16 md:py-20">
      <PageContainer className="max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Exams
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Choose your exam
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Pick a category to explore notes, practice sets, and tests tailored
              to your goal.
            </p>
          </div>
          <div className="w-full max-w-md">
            <label
              htmlFor={inputId}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Search exams
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={inputId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search exam (SSC, Banking...)"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition",
                activeFilter === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={activeFilter === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam, index) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onOpen={handleOpen}
              animationDelay={index * 60}
            />
          ))}
        </div>

        {filteredExams.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            No exams found. Try a different keyword.
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
}

type ExamCardProps = {
  exam: Exam;
  onOpen: (exam: Exam) => void;
  animationDelay?: number;
};

function ExamCard({ exam, onOpen, animationDelay }: ExamCardProps) {
  const isActive = exam.isActive;

  const handleClick = () => {
    if (!isActive) {
      return;
    }
    onOpen(exam);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isActive) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(exam);
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition motion-safe:animate-fade-up",
        isActive ? "cursor-pointer hover:border-primary/40" : "opacity-70"
      )}
      style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}
      role={isActive ? "button" : "group"}
      tabIndex={isActive ? 0 : -1}
      aria-disabled={!isActive}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {exam.level}
            </p>
            <h3 className="text-lg font-semibold">{exam.name}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {exam.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {exam.shortDescription}
        </p>
        <div className="flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
          {renderMeta(exam)}
        </div>
      </div>

      <Button
        variant={isActive ? "outline" : "secondary"}
        size="sm"
        className="mt-6 w-full"
        disabled={!isActive}
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
      >
        {isActive ? "View Details" : "Coming soon"}
      </Button>
    </div>
  );
}

function renderMeta(exam: Exam) {
  const stats = [
    { label: "Tests", value: exam.stats?.tests },
    { label: "Practice", value: exam.stats?.practice },
    { label: "Notes", value: exam.stats?.notes },
  ];

  return stats.map((stat) => {
    const label =
      typeof stat.value === "number"
        ? `${stat.value}+ ${stat.label}`
        : stat.label;
    return (
      <span
        key={stat.label}
        className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1"
      >
        {label}
      </span>
    );
  });
}
