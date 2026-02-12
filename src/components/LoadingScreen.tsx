"use client";

import * as React from "react";
import { PageContainer } from "@/components/layout/PageContainer";

export function LoadingScreen({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <PageContainer className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </PageContainer>
    </div>
  );
}
