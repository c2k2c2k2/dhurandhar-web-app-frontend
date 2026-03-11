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
  const mutateRef = React.useRef(mutate);
  const noteIdRef = React.useRef(noteId);
  const payloadRef = React.useRef<{ lastPage: number; completionPercent: number } | null>(null);
  const lastPersistedPayloadRef = React.useRef<string | null>(null);

  const payload = React.useMemo(() => {
    if (!noteId || !totalPages) return null;
    const completionPercent = Math.min(
      100,
      Math.max(0, Math.round((currentPage / totalPages) * 100))
    );
    return { lastPage: currentPage, completionPercent };
  }, [noteId, currentPage, totalPages]);

  React.useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);

  React.useEffect(() => {
    noteIdRef.current = noteId;
    payloadRef.current = payload;
  }, [noteId, payload]);

  const persistLatest = React.useCallback(() => {
    const activeNoteId = noteIdRef.current;
    const activePayload = payloadRef.current;

    if (!enabled || !activeNoteId || !activePayload) {
      return;
    }

    const serialized = JSON.stringify(activePayload);
    if (serialized === lastPersistedPayloadRef.current) {
      return;
    }

    lastPersistedPayloadRef.current = serialized;
    mutateRef.current(
      { noteId: activeNoteId, payload: activePayload },
      {
        onError: () => {
          if (lastPersistedPayloadRef.current === serialized) {
            lastPersistedPayloadRef.current = null;
          }
        },
      }
    );
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled || !noteId || !payload) return;

    const serialized = JSON.stringify(payload);
    if (serialized === lastPersistedPayloadRef.current) return;

    const timeout = window.setTimeout(() => {
      persistLatest();
    }, 1200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [enabled, noteId, payload, persistLatest]);

  React.useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistLatest();
      }
    };

    window.addEventListener("pagehide", persistLatest);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", persistLatest);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      persistLatest();
    };
  }, [enabled, persistLatest]);
}
