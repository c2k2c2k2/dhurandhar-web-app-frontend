"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingState } from "./States";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export type DataTablePagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function DataTable<T extends { id?: string | number }>({
  columns,
  rows,
  loading,
  error,
  emptyLabel = "No data available.",
  pagination,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  emptyLabel?: string;
  pagination?: DataTablePagination;
}) {
  if (loading) {
    return <LoadingState label="Loading data..." />;
  }

  if (error) {
    return <ErrorState description={error} />;
  }

  if (!rows.length) {
    return <EmptyState title={emptyLabel} />;
  }

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 0;

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="border-b border-border last:border-b-0 hover:bg-muted/40"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3", column.className)}>
                    {column.render ? column.render(row) : (row as Record<string, unknown>)[column.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Page {pagination.page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
