"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import type { Subject } from "./types";

function getSubjectName(subject: Subject) {
  return subject.name || subject.title || "Untitled";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function SubjectsTable({
  subjects,
  onEdit,
}: {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
}) {
  const columns = React.useMemo<DataTableColumn<Subject>[]>(
    () => [
      {
        key: "name",
        header: "Subject",
        render: (subject) => (
          <div>
            <p className="font-medium">{getSubjectName(subject)}</p>
            {subject.key ? (
              <p className="text-xs text-muted-foreground">Key: {subject.key}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (subject) => {
          const active = subject.isActive ?? subject.active ?? true;
          return (
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">
              {active ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        key: "orderIndex",
        header: "Order",
        render: (subject) => subject.orderIndex ?? "-",
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (subject) => formatDate(subject.updatedAt || subject.createdAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (subject) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(subject)}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/admin/taxonomy/topics?subjectId=${subject.id}`}>
                Topics
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      columns={columns}
      rows={subjects}
      emptyLabel="No subjects created yet."
    />
  );
}
