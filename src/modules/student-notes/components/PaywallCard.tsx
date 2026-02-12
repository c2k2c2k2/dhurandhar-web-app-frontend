"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaywallCard({
  title = "Premium content",
  description = "Upgrade to unlock this note and keep your preparation on track.",
  actionLabel = "View plans",
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card/90 p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Button variant="cta" asChild className="mt-5">
        <Link href="/student/payments">{actionLabel}</Link>
      </Button>
    </div>
  );
}
