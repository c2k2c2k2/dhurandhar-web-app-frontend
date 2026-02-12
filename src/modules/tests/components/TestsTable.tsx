"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DataTable,
  type DataTableColumn,
  type DataTablePagination,
} from "@/modules/shared/components/DataTable";
import type { TestItem } from "../types";

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

function formatLabel(value?: string | null) {
  if (!value) return "-";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function TestsTable({
  tests,
  canEdit,
  canPublish,
  onPublish,
  onUnpublish,
  pagination,
}: {
  tests: TestItem[];
  canEdit: boolean;
  canPublish: boolean;
  onPublish: (testId: string) => void;
  onUnpublish: (testId: string) => void;
  pagination?: DataTablePagination;
}) {
  const columns = React.useMemo<DataTableColumn<TestItem>[]>(
    () => [
      {
        key: "title",
        header: "Test",
        render: (test) => (
          <div className="space-y-1">
            <p className="font-medium">
              {canEdit ? (
                <Link href={`/admin/tests/${test.id}`} className="hover:underline">
                  {test.title}
                </Link>
              ) : (
                test.title
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {test.description || "No description"}
            </p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (test) => formatLabel(test.type),
      },
      {
        key: "published",
        header: "Published",
        render: (test) => (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              test.isPublished
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {test.isPublished ? "Published" : "Draft"}
          </span>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (test) => formatDate(test.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (test) => (
          <div className="flex justify-end gap-2">
            {canEdit ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/tests/${test.id}`}>Edit</Link>
              </Button>
            ) : null}
            {canPublish ? (
              test.isPublished ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onUnpublish(test.id)}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPublish(test.id)}
                >
                  Publish
                </Button>
              )
            ) : null}
          </div>
        ),
      },
    ],
    [canEdit, canPublish, onPublish, onUnpublish]
  );

  return (
    <DataTable
      columns={columns}
      rows={tests}
      emptyLabel="No tests found."
      pagination={pagination}
    />
  );
}
