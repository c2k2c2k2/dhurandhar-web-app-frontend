"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasPermission } from "@/lib/auth/permissions";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

type SearchItem = Record<string, unknown> & { id?: string; _id?: string };

type SearchResults = {
  notes: SearchItem[];
  questions: SearchItem[];
};

const MIN_QUERY_LENGTH = 2;

function extractItems(payload: unknown): SearchItem[] {
  if (Array.isArray(payload)) {
    return payload as SearchItem[];
  }
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.items)) {
      return typed.items as SearchItem[];
    }
    if (Array.isArray(typed.data)) {
      return typed.data as SearchItem[];
    }
  }
  return [];
}

function getItemLabel(item: SearchItem) {
  const title =
    item.title || item.name || item.label || item.slug || item.id || item._id;
  return title ? String(title) : "Untitled";
}

export function GlobalSearch() {
  const { user } = useAuth();
  const canNotes = hasPermission(user, "notes.read");
  const canQuestions = hasPermission(user, "questions.read");

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState<SearchResults>({
    notes: [],
    questions: [],
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 300);

  React.useEffect(() => {
    if (!open) return;
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults({ notes: [], questions: [] });
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tasks: Promise<unknown>[] = [];
        if (canNotes) {
          tasks.push(
            apiFetch(`/admin/search/notes?q=${encodeURIComponent(trimmed)}`, {
              signal: controller.signal,
            })
          );
        } else {
          tasks.push(Promise.resolve([]));
        }
        if (canQuestions) {
          tasks.push(
            apiFetch(
              `/admin/search/questions?q=${encodeURIComponent(trimmed)}`,
              { signal: controller.signal }
            )
          );
        } else {
          tasks.push(Promise.resolve([]));
        }

        const [notesPayload, questionsPayload] = await Promise.all(tasks);
        if (!active) return;
        setResults({
          notes: extractItems(notesPayload),
          questions: extractItems(questionsPayload),
        });
      } catch (err) {
        if (!active) return;
        setError(
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Search failed"
        );
        setResults({ notes: [], questions: [] });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuery, open, canNotes, canQuestions]);

  return (
    <div className="relative w-full max-w-xl">
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm",
          open ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""
        )}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search notes or questions..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm">
          {debouncedQuery.trim().length < MIN_QUERY_LENGTH && (
            <p className="text-muted-foreground">
              Type at least {MIN_QUERY_LENGTH} characters to search.
            </p>
          )}
          {loading && (
            <p className="text-muted-foreground">Searching...</p>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && debouncedQuery.trim().length >= MIN_QUERY_LENGTH && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Notes
                </p>
                {results.notes.length === 0 ? (
                  <p className="text-muted-foreground">No notes found.</p>
                ) : (
                  <ul className="space-y-2">
                    {results.notes.map((item, index) => {
                      const id = String(item.id ?? item._id ?? index);
                      return (
                        <li key={`note-${id}`}>
                          <Link
                            className="block rounded-xl px-3 py-2 hover:bg-muted"
                            href={`/admin/notes/${id}`}
                            onClick={() => setOpen(false)}
                          >
                            {getItemLabel(item)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Questions
                </p>
                {results.questions.length === 0 ? (
                  <p className="text-muted-foreground">No questions found.</p>
                ) : (
                  <ul className="space-y-2">
                    {results.questions.map((item, index) => {
                      const id = String(item.id ?? item._id ?? index);
                      return (
                        <li key={`question-${id}`}>
                          <Link
                            className="block rounded-xl px-3 py-2 hover:bg-muted"
                            href={`/admin/questions/${id}`}
                            onClick={() => setOpen(false)}
                          >
                            {getItemLabel(item)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
