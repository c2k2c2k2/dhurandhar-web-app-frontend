"use client";

import * as React from "react";
import Link from "next/link";
import { RequirePerm } from "@/lib/auth/guards";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasPermission } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/modules/shared/components/FormField";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import { NotesTable } from "@/modules/notes/components/NotesTable";
import { useNotes, usePublishNote, useUnpublishNote } from "@/modules/notes/hooks";

export default function AdminNotesPage() {
  const { user } = useAuth();
  const canEdit = hasPermission(user, "notes.write");
  const canPublish = hasPermission(user, "notes.publish");

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const [subjectId, setSubjectId] = React.useState("");
  const [topicId, setTopicId] = React.useState("");
  const [publishedFilter, setPublishedFilter] = React.useState("all");
  const [premiumFilter, setPremiumFilter] = React.useState("all");

  const { data: topics } = useTopics(subjectId || undefined);

  const filters = React.useMemo(
    () => ({
      subjectId: subjectId || undefined,
      topicId: topicId || undefined,
      isPublished: publishedFilter === "all" ? undefined : publishedFilter === "yes",
      isPremium: premiumFilter === "all" ? undefined : premiumFilter === "yes",
    }),
    [subjectId, topicId, publishedFilter, premiumFilter]
  );

  const {
    data: notes,
    isLoading: notesLoading,
    error: notesError,
  } = useNotes(filters);

  const publishNote = usePublishNote();
  const unpublishNote = useUnpublishNote();

  return (
    <RequirePerm perm="notes.read">
      <div className="space-y-6">
        <PageHeader
          title="Notes"
          description="Review and manage study notes."
          actions={
            canEdit ? (
              <Button variant="secondary" asChild>
                <Link href="/admin/notes/new">Create Note</Link>
              </Button>
            ) : null
          }
        />
        <FiltersBar
          filters={
            <div className="flex flex-wrap gap-2">
              <FormSelect
                label="Subject"
                value={subjectId}
                onChange={(event) => {
                  setSubjectId(event.target.value);
                  setTopicId("");
                }}
              >
                <option value="">All subjects</option>
                {(subjects || []).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name || subject.title || "Untitled"}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                label="Topic"
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
                disabled={!subjectId}
              >
                <option value="">All topics</option>
                {(topics || []).map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name || topic.title || "Untitled"}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                label="Published"
                value={publishedFilter}
                onChange={(event) => setPublishedFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="yes">Published</option>
                <option value="no">Unpublished</option>
              </FormSelect>
              <FormSelect
                label="Premium"
                value={premiumFilter}
                onChange={(event) => setPremiumFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="yes">Premium</option>
                <option value="no">Free</option>
              </FormSelect>
            </div>
          }
        />

        {subjectsLoading || notesLoading ? (
          <LoadingState label="Loading notes..." />
        ) : notesError ? (
          <ErrorState
            description={
              notesError && typeof notesError === "object" && "message" in notesError
                ? String(notesError.message)
                : "Unable to load notes."
            }
          />
        ) : (
          <NotesTable
            notes={notes || []}
            subjects={subjects || []}
            canEdit={canEdit}
            canPublish={canPublish}
            onPublish={(noteId) => publishNote.mutate(noteId)}
            onUnpublish={(noteId) => unpublishNote.mutate(noteId)}
          />
        )}
      </div>
    </RequirePerm>
  );
}
