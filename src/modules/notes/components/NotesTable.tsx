"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import type { NoteItem } from "../types";
import type { Subject } from "@/modules/taxonomy/subjects/types";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSubjectName(subjectId: string, subjects: Subject[]) {
  const subject = subjects.find((item) => item.id === subjectId);
  return subject?.name || subject?.title || "Unknown";
}

export function NotesTable({
  notes,
  subjects,
  canEdit,
  canPublish,
  onPublish,
  onUnpublish,
}: {
  notes: NoteItem[];
  subjects: Subject[];
  canEdit: boolean;
  canPublish: boolean;
  onPublish: (noteId: string) => void;
  onUnpublish: (noteId: string) => void;
}) {
  const columns = React.useMemo<DataTableColumn<NoteItem>[]>(
    () => [
      {
        key: "title",
        header: "Note",
        render: (note) => (
          <div>
            <p className="font-medium">{note.title}</p>
            <p className="text-xs text-muted-foreground">
              {note.description || "No description"}
            </p>
          </div>
        ),
      },
      {
        key: "subjectId",
        header: "Subject",
        render: (note) => getSubjectName(note.subjectId, subjects),
      },
      {
        key: "topics",
        header: "Topics",
        render: (note) => note.topics?.length ?? 0,
      },
      {
        key: "premium",
        header: "Premium",
        render: (note) => (note.isPremium ? "Yes" : "No"),
      },
      {
        key: "published",
        header: "Published",
        render: (note) => (note.isPublished ? "Yes" : "No"),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (note) => formatDate(note.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (note) => (
          <div className="flex justify-end gap-2">
            {canEdit ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/notes/${note.id}`}>Edit</Link>
              </Button>
            ) : null}
            {canPublish ? (
              note.isPublished ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onUnpublish(note.id)}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPublish(note.id)}
                >
                  Publish
                </Button>
              )
            ) : null}
          </div>
        ),
      },
    ],
    [subjects, canEdit, canPublish, onPublish, onUnpublish]
  );

  return (
    <DataTable
      columns={columns}
      rows={notes}
      emptyLabel="No notes found."
    />
  );
}
