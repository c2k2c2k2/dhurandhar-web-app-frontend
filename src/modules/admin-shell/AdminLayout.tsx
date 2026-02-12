"use client";

import * as React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SidebarNav } from "@/modules/admin-shell/SidebarNav";
import { Topbar } from "@/modules/admin-shell/Topbar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 py-6">
            <PageContainer>{children}</PageContainer>
          </main>
        </div>
      </div>
    </div>
  );
}
