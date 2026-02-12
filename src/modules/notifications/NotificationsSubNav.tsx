"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Templates", href: "/admin/notifications/templates" },
  { label: "Messages", href: "/admin/notifications/messages" },
  { label: "Broadcasts", href: "/admin/notifications/broadcasts" },
];

export function NotificationsSubNav() {
  const pathname = usePathname() || "";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
