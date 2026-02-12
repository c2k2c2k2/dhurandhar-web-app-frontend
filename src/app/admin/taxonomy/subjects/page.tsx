"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { TaxonomyTabs } from "@/modules/taxonomy/components/TaxonomyTabs";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import type { Subject } from "@/modules/taxonomy/subjects/types";
import { SubjectFormDialog } from "@/modules/taxonomy/subjects/SubjectFormDialog";
import { SubjectsTable } from "@/modules/taxonomy/subjects/SubjectsTable";

function getSubjectName(subject: Subject) {
  return subject.name || subject.title || "";
}

export default function AdminSubjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldCreate = searchParams.get("create") === "1";

  const { data, isLoading, error } = useSubjects();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subject | null>(null);

  React.useEffect(() => {
    if (shouldCreate) {
      setEditing(null);
      setOpen(true);
    }
  }, [shouldCreate]);

  const closeDialog = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && shouldCreate) {
      router.replace("/admin/taxonomy/subjects");
    }
  };

  const subjects = data || [];
  const filtered = subjects.filter((subject) =>
    getSubjectName(subject).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <RequirePerm perm="content.manage">
      <div className="space-y-6">
        <PageHeader
          title="Subjects"
          description="Create and manage subjects for the taxonomy."
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Create Subject
            </Button>
          }
        />
        <TaxonomyTabs />
        <FiltersBar
          filters={
            <Input
              placeholder="Search subjects..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          }
        />
        {isLoading ? (
          <LoadingState label="Loading subjects..." />
        ) : error ? (
          <ErrorState
            description={
              error && typeof error === "object" && "message" in error
                ? String(error.message)
                : "Unable to load subjects."
            }
          />
        ) : (
          <SubjectsTable
            subjects={filtered}
            onEdit={(subject) => {
              setEditing(subject);
              setOpen(true);
            }}
          />
        )}
        <SubjectFormDialog
          open={open}
          onOpenChange={closeDialog}
          subject={editing}
        />
      </div>
    </RequirePerm>
  );
}
