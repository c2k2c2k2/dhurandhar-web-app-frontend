"use client";

import * as React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StudentBottomNav } from "@/modules/student-shell/StudentBottomNav";
import { StudentSidebar } from "@/modules/student-shell/StudentSidebar";
import { StudentTopbar } from "@/modules/student-shell/StudentTopbar";

export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[rgb(var(--background))] via-[rgb(var(--background))] to-[rgb(var(--muted))] text-foreground">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-[-80px] top-[120px] h-[280px] w-[280px] rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute bottom-[-120px] left-[10%] h-[260px] w-[260px] rounded-full bg-brand-gold/20 blur-[140px]" />
        </div>

        <div className="relative min-h-screen">
          <StudentTopbar />
          <div className="flex">
            <StudentSidebar />
            <main className="min-w-0 flex-1 pb-32 pt-4 sm:pt-6 lg:pb-10">
              <PageContainer>{children}</PageContainer>
            </main>
          </div>
          <StudentBottomNav />
        </div>
      </div>
    </div>
  );
}
