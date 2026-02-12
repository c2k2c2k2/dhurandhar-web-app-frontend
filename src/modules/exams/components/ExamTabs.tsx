"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";
import { buildAuthUrl } from "@/modules/shared/routing/returnUrl";
import { ExamFAQ } from "@/modules/exams/components/ExamFAQ";
import { TopicGroups } from "@/modules/exams/components/TopicGroups";
import { WhatYouGet } from "@/modules/exams/components/WhatYouGet";
import type { ExamDetails, ExamModuleKey } from "@/modules/exams/types";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "notes", label: "Notes" },
  { key: "practice", label: "Practice" },
  { key: "tests", label: "Tests" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function ExamTabs({ exam }: { exam: ExamDetails }) {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");

  const loginHref = buildAuthUrl("/auth/login", {
    next: `/exams/${exam.slug}`,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition",
              activeTab === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-base font-semibold">Topics covered</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Skim the core topics included in this exam pack.
            </p>
            <div className="mt-4">
              <TopicGroups groups={exam.topics} />
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold">What you get</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Modules included in this exam track.
            </p>
            <div className="mt-4">
              <WhatYouGet
                modulesAvailable={exam.modulesAvailable}
                counts={exam.counts}
              />
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold">FAQ</h2>
            <div className="mt-4">
              <ExamFAQ faqs={exam.faqs} />
            </div>
          </div>
        </div>
      ) : (
        <ModuleGate
          moduleKey={activeTab}
          available={exam.modulesAvailable[activeTab as ExamModuleKey]}
          isAuthenticated={isAuthenticated}
          loginHref={loginHref}
        />
      )}
    </div>
  );
}

type ModuleGateProps = {
  moduleKey: TabKey;
  available: boolean;
  isAuthenticated: boolean;
  loginHref: string;
};

function ModuleGate({
  moduleKey,
  available,
  isAuthenticated,
  loginHref,
}: ModuleGateProps) {
  if (!available) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        {capitalize(moduleKey)} module is coming soon.
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-semibold">Login to access this module</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in to unlock content for this exam.
        </p>
        <Button variant="cta" className="mt-4" asChild>
          <Link href={loginHref}>Login to access</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm font-semibold">Module content preview</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {capitalize(moduleKey)} content will appear here once the module is wired
        to the student app.
      </p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
