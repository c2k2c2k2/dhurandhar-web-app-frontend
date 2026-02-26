"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DataTable,
  type DataTableColumn,
  type DataTablePagination,
} from "@/modules/shared/components/DataTable";
import type { PrintJobConfig, PrintJobItem } from "../types";

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

function statusStyles(status: PrintJobItem["status"]) {
  switch (status) {
    case "DONE":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
    case "FAILED":
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
    case "CANCELLED":
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200";
    case "RUNNING":
      return "bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200";
    default:
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200";
  }
}

export function PrintJobsTable({
  jobs,
  onDownload,
  onRetry,
  onCancel,
  pagination,
}: {
  jobs: PrintJobItem[];
  onDownload: (jobId: string) => void;
  onRetry: (jobId: string) => void;
  onCancel: (jobId: string) => void;
  pagination?: DataTablePagination;
}) {
  const columns = React.useMemo<DataTableColumn<PrintJobItem>[]>(
    () => [
      {
        key: "title",
        header: "Job",
        render: (job) => {
          const config = (job.configJson || {}) as PrintJobConfig;
          const title = config.title || "Untitled print job";
          const subtitle = config.subtitle;
          const meta =
            job.type === "TEST"
              ? config.testId
                ? `Test ID: ${config.testId}`
                : "Test job"
              : `${config.questionIds?.length ?? 0} questions`;
          return (
            <div className="space-y-1">
              <p className="font-medium">{title}</p>
              {subtitle ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">{meta}</p>
              {job.errorMessage ? (
                <p className="text-xs text-rose-600">{job.errorMessage}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "type",
        header: "Type",
        render: (job) => formatLabel(job.type),
      },
      {
        key: "status",
        header: "Status",
        render: (job) => (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              statusStyles(job.status)
            )}
          >
            {formatLabel(job.status)}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (job) => formatDate(job.createdAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (job) => {
          const canRetry = job.status === "FAILED" || job.status === "CANCELLED";
          const canRunNow = job.status === "QUEUED";
          const canCancel = job.status === "QUEUED" || job.status === "RUNNING";
          const canDownload = job.status === "DONE";
          return (
            <div className="flex justify-end gap-2">
              {canDownload ? (
                <Button variant="secondary" size="sm" onClick={() => onDownload(job.id)}>
                  Download
                </Button>
              ) : null}
              {canRunNow ? (
                <Button variant="secondary" size="sm" onClick={() => onRetry(job.id)}>
                  Run now
                </Button>
              ) : null}
              {canRetry ? (
                <Button variant="ghost" size="sm" onClick={() => onRetry(job.id)}>
                  Retry
                </Button>
              ) : null}
              {canCancel ? (
                <Button variant="ghost" size="sm" onClick={() => onCancel(job.id)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [onDownload, onRetry, onCancel]
  );

  return (
    <DataTable
      columns={columns}
      rows={jobs}
      emptyLabel="No print jobs found."
      pagination={pagination}
    />
  );
}
