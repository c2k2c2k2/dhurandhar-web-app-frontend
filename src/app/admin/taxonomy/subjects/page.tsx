"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useToast } from "@/modules/shared/components/Toast";
import { TaxonomyTabs } from "@/modules/taxonomy/components/TaxonomyTabs";
import {
  useDeleteSubject,
  useSubjects,
} from "@/modules/taxonomy/subjects/hooks";
import type { Subject } from "@/modules/taxonomy/subjects/types";
import { SubjectFormDialog } from "@/modules/taxonomy/subjects/SubjectFormDialog";
import { SubjectsTable } from "@/modules/taxonomy/subjects/SubjectsTable";

function getSubjectName(subject: Subject) {
  return subject.name || subject.title || "";
}

export default function AdminSubjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const shouldCreate = searchParams.get("create") === "1";

  const { data, isLoading, error } = useSubjects();
  const deleteSubject = useDeleteSubject();
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Subject | null>(null);

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
  const paginatedSubjects = React.useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  React.useEffect(() => {
    setPage(1);
  }, [query]);

  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, page, pageSize]);

  const handleDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubject.mutateAsync(deleteTarget.id);
      toast({ title: "Subject deleted" });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to delete subject.",
        variant: "destructive",
      });
    }
  }, [deleteSubject, deleteTarget, toast]);

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
            subjects={paginatedSubjects}
            onEdit={(subject) => {
              setEditing(subject);
              setOpen(true);
            }}
            onDelete={(subject) => setDeleteTarget(subject)}
            pagination={
              filtered.length > pageSize
                ? {
                    page,
                    pageSize,
                    total: filtered.length,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        )}
        <SubjectFormDialog
          open={open}
          onOpenChange={closeDialog}
          subject={editing}
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this subject?"
        description="Subjects can be deleted only when no topics, notes, questions, tests, or practice sessions are linked."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </RequirePerm>
  );
}
