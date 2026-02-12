"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  STUDENT_PRIMARY_NAV,
  STUDENT_SECONDARY_NAV,
} from "@/modules/student-shell/nav";

export function StudentSidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-72 flex-col gap-6 px-6 py-6 lg:flex">
      <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Today&apos;s Sprint
        </p>
        <p className="mt-2 font-display text-lg font-semibold">
          Quant + Reasoning
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          3 modules • 90 min target
        </p>
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 w-2/3 rounded-full bg-accent" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">66% complete</p>
        </div>
      </div>

      <nav className="space-y-1">
        {STUDENT_PRIMARY_NAV.map((item) => {
          const isHome = item.href === "/student";
          const isActive = isHome
            ? pathname === "/student"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          More
        </p>
        {STUDENT_SECONDARY_NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-3xl border border-border bg-primary/10 p-5">
        <p className="text-sm font-semibold">Unlock Premium Packs</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Get full notes + tests for SSC, Banking, Railways.
        </p>
        <Button variant="cta" size="sm" asChild className="mt-4 w-full">
          <Link href="/student/payments">Upgrade Now</Link>
        </Button>
      </div>
    </aside>
  );
}
