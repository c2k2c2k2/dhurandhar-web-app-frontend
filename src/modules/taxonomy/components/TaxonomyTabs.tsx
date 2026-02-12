"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function TaxonomyTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const tabs = [
    { label: "Subjects", href: "/admin/taxonomy/subjects", path: "/admin/taxonomy/subjects" },
    {
      label: "Topics",
      href: subjectId
        ? `/admin/taxonomy/topics?subjectId=${subjectId}`
        : "/admin/taxonomy/topics",
      path: "/admin/taxonomy/topics",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || pathname?.startsWith(tab.path);
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "rounded-full border border-border px-4 py-1.5 text-sm font-medium",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
