"use client";

import * as React from "react";
import { useUpdateNoteProgress } from "@/modules/student-notes/hooks";

export function useNoteProgress({
  noteId,
  currentPage,
  totalPages,
  enabled,
}: {
  noteId?: string;
  currentPage: number;
  totalPages: number;
  enabled?: boolean;
}) {
  const { mutate } = useUpdateNoteProgress();

  const payload = React.useMemo(() => {
    if (!noteId || !totalPages) return null;
    const completionPercent = Math.min(
      100,
      Math.max(0, Math.round((currentPage / totalPages) * 100))
    );
    return { lastPage: currentPage, completionPercent };
  }, [noteId, currentPage, totalPages]);

  React.useEffect(() => {
    if (!enabled || !noteId || !payload) return;

    const send = () => mutate({ noteId, payload });
    const interval = window.setInterval(send, 20000);
    send();

    return () => {
      window.clearInterval(interval);
      send();
    };
  }, [enabled, noteId, payload, mutate]);
}
