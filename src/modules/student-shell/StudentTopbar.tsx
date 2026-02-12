"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";

export function StudentTopbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const name = user?.fullName?.split(" ")[0] || "Student";

  const handleLogout = async () => {
    await logout();
    router.replace("/student/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <span className="font-display text-lg font-semibold">D</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Dhurandhar Academy
            </p>
            <p className="text-sm font-semibold">Student Lounge</p>
          </div>
        </div>

        <div className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search notes, tests, topics"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground lg:flex">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Goal: 2 hrs today</span>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="md:hidden"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="hidden md:inline-flex"
          >
            <Link href="/student/payments">Upgrade</Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden md:inline-flex"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <div className="hidden items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground lg:flex">
            Namaste,
            <span className="ml-1 font-semibold text-foreground">{name}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search notes, tests, topics"
          />
        </div>
      </div>
    </header>
  );
}
