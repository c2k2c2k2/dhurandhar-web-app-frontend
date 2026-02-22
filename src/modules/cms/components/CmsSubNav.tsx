"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const CMS_NAV_ITEMS = [
  { label: "Banners", href: "/admin/cms/banners" },
  { label: "Announcements", href: "/admin/cms/announcements" },
  { label: "Home Sections", href: "/admin/cms/home-sections" },
  { label: "Pages", href: "/admin/cms/pages" },
  { label: "Settings", href: "/admin/cms/settings" },
];

export function CmsSubNav() {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2">
      {CMS_NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
