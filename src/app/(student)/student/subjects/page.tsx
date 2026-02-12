"use client";

import * as React from "react";
import Link from "next/link";
import { Calculator, Brain, BookOpenText, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";

const iconMap = [Calculator, Brain, Languages, BookOpenText];

export default function StudentSubjectsPage() {
  const { data: subjects = [], isLoading } = useSubjects();
  const [query, setQuery] = React.useState("");

  const filtered = subjects.filter((subject) => {
    const name = subject.name ?? subject.title ?? "Subject";
    return name.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Subjects
          </p>
          <h1 className="font-display text-2xl font-semibold">
            Browse your syllabus
          </h1>
        </div>
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search subject"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading subjects...</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((subject, index) => {
          const Icon = iconMap[index % iconMap.length];
          const name = subject.name ?? subject.title ?? "Subject";
          return (
            <div
              key={subject.id}
              className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Core topics and exam-style practice
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/student/subjects/${subject.id}`}>Open</Link>
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/student/subjects/${subject.id}`}>View topics</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/student/practice/start">Practice</Link>
                </Button>
              </div>
            </div>
          );
        })}
        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subjects found.</p>
        ) : null}
      </div>
    </div>
  );
}
