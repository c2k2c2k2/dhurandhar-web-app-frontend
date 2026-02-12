"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute right-[-120px] top-[120px] h-[320px] w-[320px] rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <PageContainer className="max-w-6xl">
        <div className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <span className="font-display text-base font-semibold">D</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Dhurandhar</p>
              <p className="text-xs text-muted-foreground">Career Academy</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid items-stretch gap-10 pb-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden rounded-3xl border border-border bg-card/80 p-8 shadow-sm lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Student access
              </p>
              <h2 className="font-display text-3xl font-semibold">
                Focused preparation, delivered securely.
              </h2>
              <p className="text-sm text-muted-foreground">
                Access structured notes, practice sets, and tests built for
                serious aspirants. Your progress is tracked, protected, and
                always available.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-border bg-background/80 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Why students choose us</p>
              <ul className="space-y-2">
                <li>Secure content access with clean delivery.</li>
                <li>Analytics that keep your prep honest.</li>
                <li>Mobile-first flows built for speed.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-lg">
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="mt-6 space-y-6">{children}</div>
            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
