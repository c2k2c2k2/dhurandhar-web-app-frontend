"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, Target, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";

export default function StudentSubjectDetailPage() {
  const params = useParams();
  const subjectId = String(params?.subjectId ?? "");
  const { data: subjects = [] } = useSubjects();
  const { data: topics = [], isLoading } = useTopics(subjectId);

  const subject = subjects.find((item) => item.id === subjectId);
  const subjectName = subject?.name ?? subject?.title ?? "Subject";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Subject
          </p>
          <h1 className="font-display text-2xl font-semibold">
            {subjectName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Structured notes, topic drills, and timed tests.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href="/student/notes">
              <BookOpen className="h-4 w-4" />
              Open notes
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/student/practice/start?subjectId=${subjectId}`}>
              <Target className="h-4 w-4" />
              Practice now
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/student/tests">
              <ClipboardList className="h-4 w-4" />
              Tests
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
        <p className="text-sm font-semibold">Topic map</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-background/80 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{topic.name ?? "Topic"}</p>
                <p className="text-xs text-muted-foreground">
                  Topic drills and notes
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/student/topics/${topic.id}`}>Open</Link>
              </Button>
            </div>
          ))}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading topics...</p>
          ) : null}
          {!isLoading && topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No topics found.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
