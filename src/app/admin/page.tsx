"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/LoadingScreen";
import { apiFetch } from "@/lib/api/client";
import { Can, RequirePerm } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";

type DashboardSummary = Record<string, unknown>;

function getValue(summary: DashboardSummary | null, paths: string[]) {
  if (!summary) return null;
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((acc, key) => {
      if (!acc || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[key];
    }, summary);
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function formatMetric(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN").format(value);
  }
  return String(value);
}

function formatCurrency(amount: unknown, currency: string | null) {
  if (amount === null || amount === undefined || amount === "") return "-";
  if (typeof amount === "number") {
    if (currency) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-IN").format(amount);
  }
  return String(amount);
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight ? "border-primary/40" : "")}>
      <CardContent className="flex flex-col gap-2 p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<DashboardSummary>(
          "/admin/dashboard/summary"
        );
        if (!active) return;
        setSummary(data);
      } catch (err) {
        if (!active) return;
        setError(
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Failed to load dashboard"
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen label="Loading dashboard..." />;
  }

  return (
    <RequirePerm perm="analytics.read">
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Live operational summary for admin oversight.
            </p>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            KPI Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Users"
              value={formatMetric(
                getValue(summary, ["kpis.users", "counts.users", "users"])
              )}
            />
            <SummaryCard
              label="Students"
              value={formatMetric(
                getValue(summary, ["kpis.students", "counts.students", "students"])
              )}
            />
            <SummaryCard
              label="Admins"
              value={formatMetric(
                getValue(summary, ["kpis.admins", "counts.admins", "admins"])
              )}
            />
            <SummaryCard
              label="Active Subscriptions"
              value={formatMetric(
                getValue(summary, [
                  "kpis.activeSubscriptions",
                  "counts.activeSubscriptions",
                  "activeSubscriptions",
                ])
              )}
              highlight
            />
            <SummaryCard
              label="Notes"
              value={formatMetric(
                getValue(summary, ["kpis.notes", "counts.notes", "notes"])
              )}
            />
            <SummaryCard
              label="Questions"
              value={formatMetric(
                getValue(summary, [
                  "kpis.questions",
                  "counts.questions",
                  "questions",
                ])
              )}
            />
            <SummaryCard
              label="Tests"
              value={formatMetric(
                getValue(summary, ["kpis.tests", "counts.tests", "tests"])
              )}
            />
            <SummaryCard
              label="Revenue Orders"
              value={formatMetric(
                getValue(summary, ["revenue.orders", "orders.count", "orders"])
              )}
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Orders</span>
                <span>
                  {formatMetric(
                    getValue(summary, ["revenue.orders", "orders.count", "orders"])
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span>
                  {formatCurrency(
                    getValue(summary, ["revenue.amount", "orders.amount", "amount"]),
                    getValue(summary, ["revenue.currency", "currency"]) as
                      | string
                      | null
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Practice Answers</span>
                <span>
                  {formatMetric(
                    getValue(summary, [
                      "activity.practiceAnswers",
                      "practice.answers",
                      "practiceAnswers",
                    ])
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Test Submissions</span>
                <span>
                  {formatMetric(
                    getValue(summary, [
                      "activity.testSubmissions",
                      "tests.submissions",
                      "testSubmissions",
                    ])
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Note Progress</span>
                <span>
                  {formatMetric(
                    getValue(summary, [
                      "activity.noteProgressUpdates",
                      "notes.progress",
                      "noteProgressUpdates",
                    ])
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Print Jobs</span>
                <span>
                  {formatMetric(
                    getValue(summary, [
                      "pending.printJobs",
                      "print.jobs",
                      "printJobs",
                    ])
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Orders</span>
                <span>
                  {formatMetric(
                    getValue(summary, [
                      "pending.paymentOrders",
                      "payments.orders",
                      "paymentOrders",
                    ])
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subscriptions</span>
                <span>
                  {formatMetric(
                    getValue(summary, [
                      "pending.subscriptions",
                      "subscriptions.pending",
                      "pendingSubscriptions",
                    ])
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Note Security</span>
                <span>
                  {formatMetric(
                    getValue(summary, [
                      "signals.noteSecurity",
                      "notes.securitySignals",
                      "noteSecuritySignals",
                    ])
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Can perm="content.manage">
                <Button variant="secondary" asChild>
                  <Link href="/admin/taxonomy/subjects?create=1">
                    Create Subject
                  </Link>
                </Button>
              </Can>
              <Can perm="content.manage">
                <Button variant="secondary" asChild>
                  <Link href="/admin/taxonomy/topics?create=1">
                    Create Topic
                  </Link>
                </Button>
              </Can>
              <Can perm="notes.write">
                <Button variant="cta" asChild>
                  <Link href="/admin/notes/new">Create Note</Link>
                </Button>
              </Can>
              <Can perm="questions.crud">
                <Button variant="secondary" asChild>
                  <Link href="/admin/questions/new">Create Question</Link>
                </Button>
              </Can>
              <Can perm="tests.crud">
                <Button variant="secondary" asChild>
                  <Link href="/admin/tests/new">Create Test</Link>
                </Button>
              </Can>
            </CardContent>
          </Card>
        </section>
      </div>
    </RequirePerm>
  );
}
