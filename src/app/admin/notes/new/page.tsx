"use client";

import { RequirePerm } from "@/lib/auth/guards";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { NoteEditor } from "@/modules/notes/components/NoteEditor";

export default function AdminNoteCreatePage() {
  return (
    <RequirePerm perm="notes.write">
      <div className="space-y-6">
        <PageHeader
          title="Create Note"
          description="Upload a new note and attach it to topics."
        />
        <NoteEditor />
      </div>
    </RequirePerm>
  );
}
