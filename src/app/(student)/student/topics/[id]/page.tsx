"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/modules/student-notes/components/NoteCard";
import { useNotes, useNotesTree } from "@/modules/student-notes/hooks";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import type { NoteTreeTopic } from "@/modules/student-notes/types";

function findTopic(
  subjects: { id: string; name: string; topics: NoteTreeTopic[] }[],
  topicId: string
) {
  for (const subject of subjects) {
    const queue: NoteTreeTopic[] = [...(subject.topics ?? [])];
    while (queue.length) {
      const node = queue.shift();
      if (!node) continue;
      if (node.id === topicId) {
        return { topic: node, subject };
      }
      if (node.children?.length) queue.push(...node.children);
    }
  }
  return null;
}

export default function StudentTopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = String(params?.id ?? "");
  const { data: tree = [] } = useNotesTree();
  const { data: notes = [], isLoading } = useNotes({ topicId });
  const { canAccessNote } = useStudentAccess();

  const topicInfo = React.useMemo(() => findTopic(tree, topicId), [tree, topicId]);
  const subjectId = topicInfo?.subject.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Topic
          </p>
          <h1 className="font-display text-2xl font-semibold">
            {topicInfo?.topic.name ?? "Topic"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {topicInfo?.subject?.name ?? "Subject"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href="/student/notes">
              <BookOpen className="h-4 w-4" />
              All notes
            </Link>
          </Button>
          <Button variant="cta" asChild>
            <Link
              href={`/student/practice/start?subjectId=${subjectId ?? ""}&topicId=${topicId}`}
            >
              <Target className="h-4 w-4" />
              Practice this topic
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map((note) => {
          const access = canAccessNote({
            id: note.id,
            subjectId: note.subjectId,
            isPremium: note.isPremium,
            topicIds: [topicId],
          });
          return (
            <NoteCard
              key={note.id}
              note={note}
              allowed={access.allowed}
              onOpen={() => router.push(`/student/notes/${note.id}`)}
            />
          );
        })}

        {!isLoading && notes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            No notes found for this topic yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
