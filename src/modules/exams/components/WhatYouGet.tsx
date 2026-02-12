import { cn } from "@/lib/utils";
import type { ExamCounts, ExamModuleAvailability } from "@/modules/exams/types";

const moduleLabels = {
  notes: {
    title: "Notes",
    description: "Structured notes mapped to topics and difficulty.",
  },
  practice: {
    title: "Practice",
    description: "Topic-wise drills and smart practice sets.",
  },
  tests: {
    title: "Tests",
    description: "Timed subject tests and full-length mocks.",
  },
} as const;

export function WhatYouGet({
  modulesAvailable,
  counts,
}: {
  modulesAvailable: ExamModuleAvailability;
  counts?: ExamCounts;
}) {
  const cards = [
    { key: "notes", count: counts?.notes },
    { key: "practice", count: counts?.practice },
    { key: "tests", count: counts?.tests },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const details = moduleLabels[card.key];
        const available = modulesAvailable[card.key];
        return (
          <div
            key={card.key}
            className={cn(
              "rounded-2xl border border-border bg-card p-5",
              !available && "opacity-75"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold">{details.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {details.description}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                  available
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {available ? "Available" : "Coming soon"}
              </span>
            </div>
            {typeof card.count === "number" && card.count > 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">
                {card.count}+ items included
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
