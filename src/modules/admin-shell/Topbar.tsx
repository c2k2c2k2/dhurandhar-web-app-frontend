"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { NAV_ITEMS } from "@/modules/admin-shell/nav";
import { GlobalSearch } from "@/modules/admin-shell/GlobalSearch";
import { UserMenu } from "@/modules/admin-shell/UserMenu";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const items = React.useMemo(
    () => NAV_ITEMS.filter((item) => hasAnyPermission(user, item.permissions)),
    [user]
  );

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 md:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <BrandLogo
          href="/admin"
          showText={false}
          imageClassName="h-8 w-8 rounded-xl"
          className="lg:hidden"
        />
        <div className="flex flex-1 justify-center lg:justify-start">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      <div
        className={cn(
          "border-t border-border bg-background px-4 py-3 lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="grid gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
