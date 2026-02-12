"use client";

import { apiFetch } from "@/lib/api/client";

export type StudentEventType =
  | "note_open"
  | "note_close"
  | "practice_start"
  | "practice_answer"
  | "practice_finish"
  | "test_start"
  | "test_submit"
  | "payment_initiated"
  | "payment_success"
  | "payment_fail";

export type StudentEventPayload = Record<string, unknown> | undefined;

const EVENT_ENDPOINT = "/student/events";

export async function trackStudentEvent(
  event: StudentEventType,
  payload?: StudentEventPayload
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await apiFetch<void>(EVENT_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        event,
        payload,
        occurredAt: new Date().toISOString(),
        path: window.location.pathname,
      }),
      retryOnUnauthorized: false,
    });
  } catch {
    // Swallow analytics errors so UI is never blocked.
  }
}
