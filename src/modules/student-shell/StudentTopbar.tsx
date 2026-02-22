"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { LANGUAGE_LABELS, useI18n } from "@/modules/i18n";

export function StudentTopbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const name = user?.fullName?.split(" ")[0] || "Student";
  const { availableLanguages, language, setLanguage, t } = useI18n();

  const handleLogout = async () => {
    await logout();
    router.replace("/student/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 md:px-8">
        <BrandLogo
          href="/student"
          title="Dhurandhar Academy"
          subtitle="Student Lounge"
          textClassName="hidden sm:block"
          titleClassName="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          subtitleClassName="text-sm font-semibold text-foreground"
        />

        <div className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("student.search.placeholder")}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground lg:flex">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>{t("student.goal")}</span>
          </div>
          <label className="hidden items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-xs text-muted-foreground md:flex">
            <span>{t("language.label")}</span>
            <select
              className="bg-transparent text-xs text-foreground outline-none"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as keyof typeof LANGUAGE_LABELS)
              }
            >
              {availableLanguages.map((item) => (
                <option key={item} value={item}>
                  {LANGUAGE_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
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
            <Link href="/student/payments">{t("common.upgrade")}</Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden md:inline-flex"
          >
            <LogOut className="h-4 w-4" />
            {t("common.logout")}
          </Button>
          <div className="hidden items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground lg:flex">
            {t("student.greeting")},
            <span className="ml-1 font-semibold text-foreground">{name}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("student.search.placeholder")}
          />
        </div>
      </div>
    </header>
  );
}
