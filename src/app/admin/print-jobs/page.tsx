"use client";

import * as React from "react";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/modules/shared/components/FormField";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useToast } from "@/modules/shared/components/Toast";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { PrintJobCreator } from "@/modules/print-jobs/components/PrintJobCreator";
import { PrintJobsTable } from "@/modules/print-jobs/components/PrintJobsTable";
import {
  useCancelPrintJob,
  usePrintJobDownload,
  usePrintJobs,
  useRetryPrintJob,
} from "@/modules/print-jobs/hooks";
import type { PrintJobStatus, PrintJobType } from "@/modules/print-jobs/types";

export default function AdminPrintJobsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = React.useState<PrintJobStatus | "">("");
  const [typeFilter, setTypeFilter] = React.useState<PrintJobType | "">("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const filters = React.useMemo(
    () => ({
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      page,
      pageSize,
    }),
    [statusFilter, typeFilter, page]
  );

  const { data: jobList, isLoading, error } = usePrintJobs(filters);
  const downloadJob = usePrintJobDownload();
  const retryJob = useRetryPrintJob();
  const cancelJob = useCancelPrintJob();

  const [cancelTarget, setCancelTarget] = React.useState<string | null>(null);

  const handleDownload = async (jobId: string) => {
    try {
      const result = await downloadJob.mutateAsync(jobId);
      window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast({
        title: "Download failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to fetch download URL.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      await retryJob.mutateAsync(jobId);
      toast({ title: "Print job queued for retry" });
    } catch (err) {
      toast({
        title: "Retry failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to retry job.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelJob.mutateAsync(cancelTarget);
      toast({ title: "Print job cancelled" });
      setCancelTarget(null);
    } catch (err) {
      toast({
        title: "Cancel failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to cancel job.",
        variant: "destructive",
      });
    }
  };

  const jobs = jobList?.data ?? [];
  const total = jobList?.total ?? 0;
  const currentPage = jobList?.page ?? page;
  const currentPageSize = jobList?.pageSize ?? pageSize;

  return (
    <RequirePerm perm="content.manage">
      <div className="space-y-6">
        <PageHeader
          title="Print Jobs"
          description="Create printable PDFs for tests and practice sets."
        />

        <PrintJobCreator />

        <FiltersBar
          filters={
            <>
              <FormSelect
                label="Status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as PrintJobStatus | "");
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="QUEUED">Queued</option>
                <option value="RUNNING">Running</option>
                <option value="DONE">Done</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </FormSelect>
              <FormSelect
                label="Type"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value as PrintJobType | "");
                  setPage(1);
                }}
              >
                <option value="">All types</option>
                <option value="TEST">Test</option>
                <option value="PRACTICE">Practice</option>
                <option value="CUSTOM">Custom</option>
              </FormSelect>
            </>
          }
          actions={
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStatusFilter("");
                setTypeFilter("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />

        {isLoading ? (
          <LoadingState label="Loading print jobs..." />
        ) : error ? (
          <ErrorState
            description={
              error && typeof error === "object" && "message" in error
                ? String(error.message)
                : "Unable to load print jobs."
            }
          />
        ) : (
          <PrintJobsTable
            jobs={jobs}
            onDownload={handleDownload}
            onRetry={handleRetry}
            onCancel={(jobId) => setCancelTarget(jobId)}
            pagination={
              total > currentPageSize
                ? {
                    page: currentPage,
                    pageSize: currentPageSize,
                    total,
                    onPageChange: (nextPage) => setPage(nextPage),
                  }
                : undefined
            }
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this print job?"
        description="The job will stop processing and cannot be recovered unless retried."
        confirmLabel="Cancel job"
        onConfirm={handleCancel}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      />
    </RequirePerm>
  );
}
