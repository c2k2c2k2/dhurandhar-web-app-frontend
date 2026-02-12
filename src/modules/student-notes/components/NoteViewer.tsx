"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  RefreshCcw,
  Shield,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import {
  useCreateViewSession,
  useNote,
  useResetViewSessions,
  useWatermark,
} from "@/modules/student-notes/hooks";
import { PaywallCard } from "@/modules/student-notes/components/PaywallCard";
import { PdfCanvasViewer } from "@/modules/student-notes/viewer/PdfCanvasViewer";
import { WatermarkOverlay } from "@/modules/student-notes/viewer/WatermarkOverlay";
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
  const { mutateAsync: createViewSession, isPending } = useCreateViewSession();
  const resetSessions = useResetViewSessions();

  const [session, setSession] = React.useState<
    { viewToken: string; sessionId: string; expiresAt: string } | null
  >(null);
  const [error, setError] = React.useState<{ message: string; code?: string } | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);

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

  const loadSession = React.useCallback(async () => {
    if (!noteId) return;
    try {
      setError(null);
      const data = await createViewSession(noteId);
      setSession(data);
    } catch (err) {
      setError(parseError(err));
    }
  }, [noteId, createViewSession]);

  React.useEffect(() => {
    if (!noteId || !note || !access.allowed) return;
    if (!session || sessionExpired) {
      void loadSession();
    }
  }, [noteId, note, access.allowed, session, sessionExpired, loadSession]);

  const { data: watermark } = useWatermark(noteId, session?.viewToken);

  useNoteProgress({
    noteId,
    currentPage,
    totalPages,
    enabled: Boolean(session && !sessionExpired),
  });

  const openedRef = React.useRef(false);
  React.useEffect(() => {
    if (!note || !session || openedRef.current) return;
    trackStudentEvent("note_open", {
      noteId: note.id,
      sessionId: session.sessionId,
      title: note.title,
    });
    openedRef.current = true;
  }, [note, session]);

  React.useEffect(() => {
    if (!note || !session) return;
    const interval = window.setInterval(() => {
      trackStudentEvent("note_open", {
        noteId: note.id,
        sessionId: session.sessionId,
        heartbeat: true,
      });
    }, 15000);

    return () => window.clearInterval(interval);
  }, [note, session]);

  React.useEffect(() => {
    return () => {
      if (!note || !session || !openedRef.current) return;
      trackStudentEvent("note_close", {
        noteId: note.id,
        sessionId: session.sessionId,
        page: currentPage,
        totalPages,
      });
    };
  }, [note, session, currentPage, totalPages]);

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Secure Viewer
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              {note.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {note.description ?? "Watermarked streaming view"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => router.push("/student/notes")}
            >
              <FileText className="h-4 w-4" />
              All notes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void loadSession()}
              disabled={isPending}
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh session
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">Session error</p>
              <p>{error.message}</p>
              {error.code === "NOTE_SESSION_LIMIT" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      await resetSessions.mutateAsync(noteId);
                      await loadSession();
                    }}
                    disabled={resetSessions.isPending}
                  >
                    Reset other sessions
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    This closes other active sessions for this note.
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {sessionExpired ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-border bg-muted/60 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">Session expired</p>
              <p>Refresh the session to continue reading.</p>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="relative rounded-3xl border border-border bg-background p-4"
        tabIndex={0}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) &&
              (event.key.toLowerCase() === "p" || event.key.toLowerCase() === "s")) {
            event.preventDefault();
          }
        }}
      >
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-accent" />
          Protected stream
        </div>
        {session ? (
          <div className="relative">
            <PdfCanvasViewer
              noteId={noteId}
              viewToken={session.viewToken}
              onReady={(pages) => setTotalPages(pages)}
              onPageChange={(page, pages) => {
                setCurrentPage(page);
                setTotalPages(pages);
              }}
              onError={(message) => setError({ message })}
            />
            <WatermarkOverlay payload={watermark?.payload} />
          </div>
        ) : (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Preparing secure stream...
          </div>
        )}
      </div>
    </div>
  );
}
