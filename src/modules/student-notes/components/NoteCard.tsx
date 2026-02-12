"use client";

import Link from "next/link";
import { Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/brand/PremiumBadge";
import type { NoteItem } from "@/modules/student-notes/types";

export function NoteCard({
  note,
  allowed,
  onOpen,
}: {
  note: NoteItem;
  allowed: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{note.title}</h3>
          <p className="text-xs text-muted-foreground">
            {note.description || "Topic-wise notes"}
          </p>
        </div>
        {note.isPremium ? (
          <PremiumBadge>Premium</PremiumBadge>
        ) : (
          <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            Free
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {note.pageCount ? (
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {note.pageCount} pages
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            PDF note
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onOpen}>
          Open
        </Button>
        {!allowed && note.isPremium ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student/payments">
              <Lock className="h-4 w-4" />
              Unlock
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
