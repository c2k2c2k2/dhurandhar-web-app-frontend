"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type Action = {
  label: string;
  href: string;
};

export function StudentPlaceholder({
  title,
  description,
  primary,
  secondary,
  highlights = [],
}: {
  title: string;
  description: string;
  primary?: Action;
  secondary?: Action;
  highlights?: string[];
}) {
  return (
    <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        In progress
      </p>
      <h1 className="mt-3 font-display text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {highlights.length ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {highlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-background px-3 py-1"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {primary ? (
          <Button variant="cta" asChild>
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
        ) : null}
        {secondary ? (
          <Button variant="secondary" asChild>
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
