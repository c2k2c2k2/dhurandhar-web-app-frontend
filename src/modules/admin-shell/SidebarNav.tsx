"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/modules/admin-shell/nav";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = React.useMemo(
    () => NAV_ITEMS.filter((item) => hasAnyPermission(user, item.permissions)),
    [user]
  );

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            Dhurandhar
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Admin
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
        Executive Console
      </div>
    </aside>
  );
}
