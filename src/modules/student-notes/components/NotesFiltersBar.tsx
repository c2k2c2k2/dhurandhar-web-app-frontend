"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";

export type NotesFilters = {
  subjectId?: string;
  topicId?: string;
  query?: string;
  access?: "all" | "free" | "premium";
};

export function NotesFiltersBar({
  filters,
  onChange,
}: {
  filters: NotesFilters;
  onChange: (next: NotesFilters) => void;
}) {
  const { data: subjects = [] } = useSubjects();
  const { data: topics = [] } = useTopics(filters.subjectId);

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1.5fr]">
      <select
        className="h-10 rounded-2xl border border-border bg-background px-3 text-sm"
        value={filters.subjectId ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            subjectId: event.target.value || undefined,
            topicId: undefined,
          })
        }
      >
        <option value="">All subjects</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name ?? subject.title ?? "Subject"}
          </option>
        ))}
      </select>
      <select
        className="h-10 rounded-2xl border border-border bg-background px-3 text-sm"
        value={filters.topicId ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            topicId: event.target.value || undefined,
          })
        }
      >
        <option value="">All topics</option>
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.name ?? "Topic"}
          </option>
        ))}
      </select>
      <select
        className="h-10 rounded-2xl border border-border bg-background px-3 text-sm"
        value={filters.access ?? "all"}
        onChange={(event) =>
          onChange({
            ...filters,
            access: event.target.value as NotesFilters["access"],
          })
        }
      >
        <option value="all">All access</option>
        <option value="free">Free only</option>
        <option value="premium">Premium only</option>
      </select>
      <Input
        placeholder="Search notes"
        value={filters.query ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            query: event.target.value,
          })
        }
      />
    </div>
  );
}
