"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import {
  useCreateViewSession,
  useNote,
  useNoteReadingProgress,
  useResetViewSessions,
  useWatermark,
} from "@/modules/student-notes/hooks";
import { PaywallCard } from "@/modules/student-notes/components/PaywallCard";
import { PdfCanvasViewer } from "@/modules/student-notes/viewer/PdfCanvasViewer";
import { useNoteProgress } from "@/modules/student-notes/viewer/useNoteProgress";
import { trackStudentEvent } from "@/modules/student-analytics/events";

function parseError(error: unknown): { message: string; code?: string } {
  if (error && typeof error === "object") {
    const payload = error as { message?: string; code?: string };
    const message = payload.message ? String(payload.message) : "";
    return {
      message: message || "Unable to start secure session.",
      code: payload.code,
    };
  }
  return { message: "Unable to start secure session." };
}

export function NoteViewer() {
  const params = useParams();
  const router = useRouter();
  const noteId = String(params?.id ?? "");
  const { data: note, isLoading } = useNote(noteId);
  const { canAccessNote } = useStudentAccess();
  const { mutateAsync: createViewSession, isPending: isCreatingSession } = useCreateViewSession();
  const { mutateAsync: resetViewSessions, isPending: isResettingSessions } = useResetViewSessions();

  const [session, setSession] = React.useState<
    { viewToken: string; sessionId: string; expiresAt: string } | null
  >(null);
  const [error, setError] = React.useState<{ message: string; code?: string } | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const autoSessionAttemptRef = React.useRef<string | null>(null);
  const openedSessionIdRef = React.useRef<string | null>(null);
  const closedSessionIdRef = React.useRef<string | null>(null);
  const latestMetricsRef = React.useRef({ currentPage: 1, totalPages: 0 });
  const autoRenewedSessionIdRef = React.useRef<string | null>(null);
  const autoResetLimitRef = React.useRef<string | null>(null);

  const topicIds = note?.topics?.map((topic) => topic.topicId) ?? [];
  const access = note
    ? canAccessNote({
        id: note.id,
        subjectId: note.subjectId,
        isPremium: note.isPremium,
        topicIds,
      })
    : { allowed: false };

  const sessionExpired =
    session?.expiresAt &&
    new Date(session.expiresAt).getTime() < Date.now() - 5000;
  const isRecoveringSession = isCreatingSession || isResettingSessions;
  const { data: noteProgress, isLoading: isLoadingProgress } = useNoteReadingProgress(
    noteId,
    Boolean(note && access.allowed)
  );

  React.useEffect(() => {
    autoSessionAttemptRef.current = null;
    openedSessionIdRef.current = null;
    closedSessionIdRef.current = null;
    autoRenewedSessionIdRef.current = null;
    autoResetLimitRef.current = null;
    latestMetricsRef.current = { currentPage: 1, totalPages: 0 };
    setSession(null);
    setError(null);
    setCurrentPage(1);
    setTotalPages(0);
  }, [noteId]);

  const loadSession = React.useCallback(async (options?: { force?: boolean }) => {
    if (!noteId) return;
    if (!options?.force && autoSessionAttemptRef.current === noteId) return;

    autoSessionAttemptRef.current = noteId;

    try {
      setError(null);
      const data = await createViewSession(noteId);
      setSession(data);
      openedSessionIdRef.current = null;
      closedSessionIdRef.current = null;
      autoRenewedSessionIdRef.current = null;
      autoResetLimitRef.current = null;
    } catch (err) {
      const parsed = parseError(err);

      if (parsed.code === "NOTE_SESSION_LIMIT" && autoResetLimitRef.current !== noteId) {
        autoResetLimitRef.current = noteId;

        try {
          await resetViewSessions(noteId);
          const data = await createViewSession(noteId);
          setSession(data);
          openedSessionIdRef.current = null;
          closedSessionIdRef.current = null;
          autoRenewedSessionIdRef.current = null;
          autoResetLimitRef.current = null;
          setError(null);
          return;
        } catch (retryErr) {
          const retryParsed = parseError(retryErr);
          setError({
            message:
              retryParsed.code === "NOTE_SESSION_LIMIT"
                ? "Unable to open this note right now. Please try again."
                : retryParsed.message,
          });
          return;
        }
      }

      setError(parsed);
    }
  }, [noteId, createViewSession, resetViewSessions]);

  React.useEffect(() => {
    if (!noteId || !note || !access.allowed || error || session || sessionExpired) return;
    if (autoSessionAttemptRef.current !== noteId) {
      void loadSession();
    }
  }, [access.allowed, error, loadSession, note, noteId, session, sessionExpired]);

  React.useEffect(() => {
    if (!session || !sessionExpired || isRecoveringSession) return;
    if (autoRenewedSessionIdRef.current === session.sessionId) return;

    autoRenewedSessionIdRef.current = session.sessionId;
    void loadSession({ force: true });
  }, [isRecoveringSession, loadSession, session, sessionExpired]);

  const { data: watermark } = useWatermark(noteId, session?.viewToken);

  useNoteProgress({
    noteId,
    currentPage,
    totalPages,
    enabled: Boolean(session && !sessionExpired && !isLoadingProgress),
  });

  React.useEffect(() => {
    latestMetricsRef.current = { currentPage, totalPages };
  }, [currentPage, totalPages]);

  React.useEffect(() => {
    if (!note || !session || openedSessionIdRef.current === session.sessionId) return;
    trackStudentEvent("note_open", {
      noteId: note.id,
      sessionId: session.sessionId,
      title: note.title,
    });
    openedSessionIdRef.current = session.sessionId;
    closedSessionIdRef.current = null;
  }, [note, session]);

  React.useEffect(() => {
    if (!note || !session) return;

    const sendCloseEvent = () => {
      if (closedSessionIdRef.current === session.sessionId) return;
      if (openedSessionIdRef.current !== session.sessionId) return;

      trackStudentEvent("note_close", {
        noteId: note.id,
        sessionId: session.sessionId,
        page: latestMetricsRef.current.currentPage,
        totalPages: latestMetricsRef.current.totalPages,
      });
      closedSessionIdRef.current = session.sessionId;
    };

    window.addEventListener("pagehide", sendCloseEvent);
    return () => {
      window.removeEventListener("pagehide", sendCloseEvent);
      sendCloseEvent();
    };
  }, [note, session]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Loading note...
      </div>
    );
  }

  if (!note) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Note not found.
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <PaywallCard
        title="This note is part of premium access"
        description="Upgrade your plan to unlock premium notes, practice sets, and full mock tests."
        actionLabel="Unlock premium"
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Note Viewer
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
              {note.title}
            </h1>
            {note.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{note.description}</p>
            ) : null}
            {noteProgress?.lastPage && noteProgress.lastPage > 1 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Resume available from page {noteProgress.lastPage}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/student/notes")}
            >
              <FileText className="h-4 w-4" />
              All notes
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm">
            <div className="flex items-start gap-2 text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">Session error</p>
                <p className="text-xs sm:text-sm">{error.message}</p>
              </div>
            </div>
          </div>
        ) : null}

        {sessionExpired && !isRecoveringSession ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium text-foreground">Restoring secure session</p>
              <p className="text-xs sm:text-sm">
                The viewer is renewing access automatically.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="flex flex-1 flex-col rounded-2xl border border-border bg-background p-3 sm:p-4"
        tabIndex={0}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) &&
              (event.key.toLowerCase() === "p" || event.key.toLowerCase() === "s")) {
            event.preventDefault();
          }
        }}
      >
        {session ? (
          <PdfCanvasViewer
            noteId={noteId}
            viewToken={session.viewToken}
            initialPage={currentPage > 1 ? currentPage : noteProgress?.lastPage ?? 1}
            initialPageReady={!isLoadingProgress}
            watermarkPayload={watermark?.payload}
            onReady={(pages) => setTotalPages(pages)}
            onPageChange={(page, pages) => {
              setCurrentPage(page);
              setTotalPages(pages);
            }}
            onError={(message) => setError({ message })}
          />
        ) : (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Preparing secure stream...
          </div>
        )}
      </div>
    </div>
  );
}
