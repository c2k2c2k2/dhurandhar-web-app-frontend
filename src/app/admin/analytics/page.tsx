"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import {
  useAnalyticsCoverage,
  useAnalyticsEngagement,
  useAnalyticsOverview,
  useAnalyticsRevenue,
} from "@/modules/analytics/hooks";
import type {
  CoverageTopic,
  CoverageSubject,
  RevenueResponse,
  EngagementResponse,
} from "@/modules/analytics/types";

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

function formatAmount(paise?: number | null) {
  if (!paise && paise !== 0) return "-";
  return `INR ${(paise / 100).toFixed(2)}`;
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default function AdminAnalyticsPage() {
  const [tab, setTab] = React.useState<"overview" | "coverage" | "revenue" | "engagement">(
    "overview"
  );
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [coverageSubjectId, setCoverageSubjectId] = React.useState("");
  const [coveragePage, setCoveragePage] = React.useState(1);
  const coveragePageSize = 50;
  const [revenuePeriod, setRevenuePeriod] = React.useState("day");
  const [engagementDays, setEngagementDays] = React.useState(30);

  const overviewQuery = { from: from || undefined, to: to || undefined };
  const revenueQuery = {
    from: from || undefined,
    to: to || undefined,
    period: revenuePeriod,
  };
  const coverageQuery = {
    subjectId: coverageSubjectId || undefined,
    page: coveragePage,
    pageSize: coveragePageSize,
  };
  const engagementQuery = { days: engagementDays };

  const { data: overview, isLoading: overviewLoading } =
    useAnalyticsOverview(overviewQuery);
  const { data: coverage, isLoading: coverageLoading } =
    useAnalyticsCoverage(coverageQuery);
  const { data: revenue, isLoading: revenueLoading } =
    useAnalyticsRevenue(revenueQuery);
  const { data: engagement, isLoading: engagementLoading } =
    useAnalyticsEngagement(engagementQuery);

  const setRangeDays = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setFrom(toDateInput(start));
    setTo(toDateInput(end));
  };

  const subjectColumns = React.useMemo<DataTableColumn<CoverageSubject>[]>(
    () => [
      {
        key: "name",
        header: "Subject",
        render: (subject) => subject.name,
      },
      {
        key: "topics",
        header: "Topics",
        render: (subject) => subject.counts.topics,
      },
      {
        key: "notes",
        header: "Notes",
        render: (subject) => subject.counts.notes,
      },
      {
        key: "questions",
        header: "Questions",
        render: (subject) => subject.counts.questions,
      },
    ],
    []
  );

  const topicColumns = React.useMemo<DataTableColumn<CoverageTopic>[]>(
    () => [
      {
        key: "topic",
        header: "Topic",
        render: (topic) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{topic.name}</p>
            <p className="text-xs text-muted-foreground">
              {topic.subject?.name || topic.subjectId}
            </p>
          </div>
        ),
      },
      {
        key: "notes",
        header: "Notes",
        render: (topic) => topic._count?.notes ?? 0,
      },
      {
        key: "questions",
        header: "Questions",
        render: (topic) => topic._count?.questions ?? 0,
      },
    ],
    []
  );

  const revenueColumns = React.useMemo<
    DataTableColumn<(RevenueResponse["data"][number] & { id: string })>[]
  >(
    () => [
      { key: "key", header: "Period" },
      {
        key: "amount",
        header: "Amount",
        render: (row) => formatAmount(row.amountPaise),
      },
      { key: "orders", header: "Orders", render: (row) => row.orderCount },
    ],
    []
  );

  const engagementColumns = React.useMemo<
    DataTableColumn<(EngagementResponse["data"][number] & { id: string })>[]
  >(
    () => [
      { key: "date", header: "Date" },
      { key: "activeUsers", header: "Active Users" },
    ],
    []
  );

  return (
    <RequirePerm perm="analytics.read">
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Review coverage, revenue, and engagement analytics."
        />

        <div className="flex flex-wrap gap-2">
          {(["overview", "coverage", "revenue", "engagement"] as const).map((key) => (
            <Button
              key={key}
              variant={tab === key ? "default" : "secondary"}
              size="sm"
              onClick={() => setTab(key)}
            >
              {key === "overview"
                ? "Overview"
                : key === "coverage"
                  ? "Coverage"
                  : key === "revenue"
                    ? "Revenue"
                    : "Engagement"}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Pick a tab to see a summary, content coverage, revenue trends, or daily activity.
        </p>

        <FiltersBar
          filters={
            <>
              {tab === "coverage" ? (
                <select
                  className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                  value={coverageSubjectId}
                  onChange={(event) => {
                    setCoverageSubjectId(event.target.value);
                    setCoveragePage(1);
                  }}
                >
                  <option value="">All subjects</option>
                  {coverage?.subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              ) : tab === "engagement" ? (
                <select
                  className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                  value={String(engagementDays)}
                  onChange={(event) => setEngagementDays(Number(event.target.value))}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              ) : (
                <>
                  <Input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                  />
                  <Input
                    type="date"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                  />
                </>
              )}
              {tab === "revenue" ? (
                <select
                  className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                  value={revenuePeriod}
                  onChange={(event) => setRevenuePeriod(event.target.value)}
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              ) : null}
            </>
          }
          actions={
            tab === "overview" || tab === "revenue" ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setRangeDays(7)}>
                  7d
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setRangeDays(30)}>
                  30d
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setRangeDays(90)}>
                  90d
                </Button>
              </div>
            ) : null
          }
        />

        {tab === "overview" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total Users
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {overview?.users.total ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Students {overview?.users.students ?? "-"} • Admins{" "}
                  {overview?.users.admins ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Content
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {overview?.content.notes ?? "-"} notes
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview?.content.questions ?? "-"} questions •{" "}
                  {overview?.content.tests ?? "-"} tests
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Activity (range)
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {overview?.activity.attempts ?? "-"} attempts
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview?.activity.practiceAnswers ?? "-"} practice answers
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatAmount(overview?.revenue.amountPaise ?? null)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview?.revenue.orders ?? "-"} orders
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">Top Subjects</p>
                {coverageLoading ? (
                  <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {coverage?.subjects?.slice(0, 5).map((subject) => (
                      <div key={subject.id} className="flex justify-between">
                        <span>{subject.name}</span>
                        <span className="text-foreground">
                          {subject.counts.questions} Q
                        </span>
                      </div>
                    ))}
                    {!coverage?.subjects?.length ? <p>No subjects found.</p> : null}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">Coverage Gaps</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {coverage?.gaps?.slice(0, 5).map((gap) => (
                    <div key={gap.topicId} className="flex justify-between">
                      <span>{gap.topicName}</span>
                      <span className="text-foreground">{gap.subjectName}</span>
                    </div>
                  ))}
                  {!coverage?.gaps?.length ? <p>No gaps found.</p> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "coverage" ? (
          <div className="space-y-6">
            <DataTable
              columns={subjectColumns}
              rows={coverage?.subjects ?? []}
              loading={coverageLoading}
              emptyLabel="No subjects found."
            />

            <DataTable
              columns={topicColumns}
              rows={coverage?.topics.data ?? []}
              loading={coverageLoading}
              emptyLabel="No topics found."
              pagination={
                coverage?.topics
                  ? {
                      page: coverage.topics.page,
                      pageSize: coverage.topics.pageSize,
                      total: coverage.topics.total,
                      onPageChange: (nextPage) => setCoveragePage(nextPage),
                    }
                  : undefined
              }
            />

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Missing Content Gaps</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {coverage?.gaps?.length ? (
                  coverage.gaps.map((gap) => (
                    <div key={gap.topicId} className="flex justify-between">
                      <span>{gap.topicName}</span>
                      <span className="text-foreground">{gap.subjectName}</span>
                    </div>
                  ))
                ) : (
                  <p>No gaps found.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "revenue" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total Revenue
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatAmount(revenue?.totalAmountPaise ?? null)}
              </p>
              <p className="text-xs text-muted-foreground">
                Period: {revenue?.period || revenuePeriod}
              </p>
            </div>
            <DataTable
              columns={revenueColumns}
              rows={(revenue?.data ?? []).map((item) => ({
                ...item,
                id: item.key,
              }))}
              loading={revenueLoading}
              emptyLabel="No revenue data found."
            />
          </div>
        ) : null}

        {tab === "engagement" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Active Users
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {engagement?.data?.reduce((sum, item) => sum + item.activeUsers, 0) ??
                  "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                Range {formatDate(engagement?.range?.from)} to{" "}
                {formatDate(engagement?.range?.to)}
              </p>
            </div>
            <DataTable
              columns={engagementColumns}
              rows={(engagement?.data ?? []).map((item) => ({
                ...item,
                id: item.date,
              }))}
              loading={engagementLoading}
              emptyLabel="No engagement data found."
            />
          </div>
        ) : null}
      </div>
    </RequirePerm>
  );
}
