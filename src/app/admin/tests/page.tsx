"use client";

import * as React from "react";
import Link from "next/link";
import { RequirePerm } from "@/lib/auth/guards";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasPermission } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/modules/shared/components/FormField";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { TestsTable } from "@/modules/tests/components/TestsTable";
import { usePublishTest, useTests, useUnpublishTest } from "@/modules/tests/hooks";

export default function AdminTestsPage() {
  const { user } = useAuth();
  const canEdit = hasPermission(user, "tests.crud");
  const canPublish = hasPermission(user, "tests.publish");

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } =
    useSubjects();

  const [subjectId, setSubjectId] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<
    "all" | "SUBJECT" | "COMBINED" | "CUSTOM"
  >("all");
  const [publishedFilter, setPublishedFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const filters = React.useMemo(
    () => ({
      subjectId: subjectId || undefined,
      type: typeFilter === "all" ? undefined : typeFilter,
      isPublished:
        publishedFilter === "all" ? undefined : publishedFilter === "yes",
      page,
      pageSize,
    }),
    [subjectId, typeFilter, publishedFilter, page]
  );

  const { data: testList, isLoading: testsLoading, error: testsError } =
    useTests(filters);

  const publishTest = usePublishTest();
  const unpublishTest = useUnpublishTest();

  const tests = testList?.data ?? [];
  const total = testList?.total ?? 0;
  const currentPage = testList?.page ?? page;
  const currentPageSize = testList?.pageSize ?? pageSize;

  return (
    <RequirePerm perm="tests.crud">
      <div className="space-y-6">
        <PageHeader
          title="Tests"
          description="Create and manage test series."
          actions={
            canEdit ? (
              <Button variant="secondary" asChild>
                <Link href="/admin/tests/new">Create Test</Link>
              </Button>
            ) : null
          }
        />

        <FiltersBar
          filters={
            <>
              <FormSelect
                label="Subject"
                value={subjectId}
                onChange={(event) => {
                  setSubjectId(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All subjects</option>
                {(subjects || []).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name || subject.title || "Untitled"}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                label="Type"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(
                    event.target.value as "all" | "SUBJECT" | "COMBINED" | "CUSTOM"
                  );
                  setPage(1);
                }}
              >
                <option value="all">All types</option>
                <option value="SUBJECT">Subject</option>
                <option value="COMBINED">Combined</option>
                <option value="CUSTOM">Custom</option>
              </FormSelect>
              <FormSelect
                label="Published"
                value={publishedFilter}
                onChange={(event) => {
                  setPublishedFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All</option>
                <option value="yes">Published</option>
                <option value="no">Draft</option>
              </FormSelect>
            </>
          }
          actions={
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSubjectId("");
                setTypeFilter("all");
                setPublishedFilter("all");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />

        {subjectsLoading || testsLoading ? (
          <LoadingState label="Loading tests..." />
        ) : subjectsError || testsError ? (
          <ErrorState
            description={
              (testsError && typeof testsError === "object" && "message" in testsError
                ? String(testsError.message)
                : null) ||
              (subjectsError &&
              typeof subjectsError === "object" &&
              "message" in subjectsError
                ? String(subjectsError.message)
                : null) ||
              "Unable to load tests."
            }
          />
        ) : (
          <TestsTable
            tests={tests}
            canEdit={canEdit}
            canPublish={canPublish}
            onPublish={(testId) => publishTest.mutate(testId)}
            onUnpublish={(testId) => unpublishTest.mutate(testId)}
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
    </RequirePerm>
  );
}
