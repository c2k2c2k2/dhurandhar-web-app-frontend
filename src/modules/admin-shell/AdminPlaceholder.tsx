"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { EmptyState } from "@/modules/shared/components/States";

export function AdminPlaceholder({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title="This section is being built"
        description="We are wiring the data and workflows for this module."
        action={
          actionLabel && actionHref
            ? {
                label: actionLabel,
                onClick: () => router.push(actionHref),
              }
            : undefined
        }
      />
    </div>
  );
}
