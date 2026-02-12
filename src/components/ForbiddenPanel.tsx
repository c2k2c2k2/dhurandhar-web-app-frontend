"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

export function ForbiddenPanel({
  title = "Access restricted",
  message = "You do not have permission to view this section.",
}: {
  title?: string;
  message?: string;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <PageContainer className="max-w-xl text-center">
        <div className="rounded-2xl border border-border bg-card px-6 py-8">
          <h1 className="font-display text-xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={() => router.push("/admin")}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
