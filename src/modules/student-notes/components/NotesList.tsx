"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NotesFiltersBar, type NotesFilters } from "@/modules/student-notes/components/NotesFiltersBar";
import { NotesTreeView } from "@/modules/student-notes/components/NotesTreeView";
import { NoteCard } from "@/modules/student-notes/components/NoteCard";
import { useNotes, useNotesTree } from "@/modules/student-notes/hooks";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import type { NoteTreeTopic, NoteTreeSubject } from "@/modules/student-notes/types";

function findSubjectForTopic(
  subjects: NoteTreeSubject[],
  topicId: string
): string | undefined {
  const queue: NoteTreeTopic[] = [];
  for (const subject of subjects) {
    queue.push(...(subject.topics ?? []));
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) continue;
      if (node.id === topicId) return subject.id;
      if (node.children?.length) {
        queue.push(...node.children);
      }
    }
  }
  return undefined;
}

export function NotesList() {
  const router = useRouter();
  const { canAccessNote } = useStudentAccess();
  const [filters, setFilters] = React.useState<NotesFilters>({ access: "all" });

  const listFilters = React.useMemo(() => {
    const isPremium =
      filters.access === "premium"
        ? true
        : filters.access === "free"
          ? false
          : undefined;
    return {
      subjectId: filters.subjectId,
      topicId: filters.topicId,
      isPremium,
    };
  }, [filters]);

  const { data: notes = [], isLoading } = useNotes(listFilters);
  const { data: tree = [], isLoading: treeLoading } = useNotesTree();

  const query = filters.query?.trim().toLowerCase() ?? "";
  const visibleNotes = query
    ? notes.filter((note) =>
        [note.title, note.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : notes;

  const activeSubjectId = filters.subjectId ?? tree[0]?.id;

  const handleSelectTopic = (topicId: string) => {
    const subjectId = findSubjectForTopic(tree, topicId);
    setFilters((prev) => ({
      ...prev,
      topicId,
      subjectId: subjectId ?? prev.subjectId,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Notes
          </p>
          <h1 className="font-display text-2xl font-semibold">
            Subject-wise notes library
          </h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and open secure notes tailored to your syllabus.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {isLoading ? "Loading notes..." : `${visibleNotes.length} notes`}
        </div>
      </div>

      <NotesFiltersBar filters={filters} onChange={setFilters} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          {treeLoading ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Loading topic map...
            </div>
          ) : (
            <NotesTreeView
              subjects={tree}
              activeSubjectId={activeSubjectId}
              activeTopicId={filters.topicId}
              onSelectTopic={handleSelectTopic}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {visibleNotes.map((note) => {
            const access = canAccessNote({
              id: note.id,
              subjectId: note.subjectId,
              isPremium: note.isPremium,
              topicIds: [],
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

          {!isLoading && visibleNotes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No notes match your filters. Try a different subject or clear the
              search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
