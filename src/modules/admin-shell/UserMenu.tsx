"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="hidden text-sm font-medium sm:inline">
          {user?.fullName || user?.email || "Admin"}
        </span>
      </button>
      <div
        className={cn(
          "absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-border bg-card p-2 text-sm shadow-sm",
          open ? "block" : "hidden"
        )}
        role="menu"
      >
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {user?.email || "Signed in"}
        </div>
        <Link
          href="/admin/profile"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          onClick={() => setOpen(false)}
        >
          <User className="h-4 w-4 text-muted-foreground" />
          My profile
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          onClick={async () => {
            setOpen(false);
            await logout();
          }}
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Sign out
        </button>
      </div>
    </div>
  );
}
