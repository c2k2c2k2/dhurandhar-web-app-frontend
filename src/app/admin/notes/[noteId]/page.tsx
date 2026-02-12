"use client";

import { useParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState } from "@/modules/shared/components/States";
import { NoteEditor } from "@/modules/notes/components/NoteEditor";

export default function AdminNoteDetailPage() {
  const params = useParams<{ noteId: string | string[] }>();
  const noteId = Array.isArray(params.noteId)
    ? params.noteId[0]
    : params.noteId;

  if (!noteId) {
    return <ErrorState description="Note ID is missing." />;
  }

  return (
    <RequirePerm perm="notes.write">
      <div className="space-y-6">
        <PageHeader
          title="Edit Note"
          description="Update metadata, topics, and file attachment."
        />
        <NoteEditor noteId={noteId} />
      </div>
    </RequirePerm>
  );
}
