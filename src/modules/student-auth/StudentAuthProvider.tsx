"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useStudentMe } from "@/modules/student-auth/hooks";
import type {
  NoteAccessCheck,
  NoteAccessInput,
  StudentEntitlement,
  StudentMe,
  StudentSubscription,
} from "@/modules/student-auth/types";

export type StudentAccessContextValue = {
  me: StudentMe | null;
  subscription: StudentSubscription | null;
  entitlements: StudentEntitlement[];
  isLoading: boolean;
  error?: string | null;
  refresh: () => Promise<void>;
  hasActiveSubscription: boolean;
  canAccessNote: (note: NoteAccessInput) => NoteAccessCheck;
  canAccessPractice: () => NoteAccessCheck;
  canAccessTests: () => NoteAccessCheck;
};

const StudentAccessContext = React.createContext<StudentAccessContextValue | undefined>(
  undefined
);

function isActiveSubscription(subscription: StudentSubscription | null) {
  if (!subscription) return false;
  if (subscription.status !== "ACTIVE") return false;
  if (!subscription.endsAt) return true;
  return new Date(subscription.endsAt).getTime() > Date.now();
}

function hasEntitlement(
  entitlements: StudentEntitlement[],
  kinds: Array<StudentEntitlement["kind"]>
) {
  return entitlements.some((ent) => kinds.includes(ent.kind));
}

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const enabled = status === "authenticated" && user?.type === "STUDENT";
  const { data, isLoading, error, refetch } = useStudentMe(enabled);

  const subscription = data?.subscription ?? null;
  const entitlements = data?.entitlements ?? [];
  const hasSubscription = isActiveSubscription(subscription);

  const canAccessNote = React.useCallback(
    (note: NoteAccessInput): NoteAccessCheck => {
      if (!note.isPremium) {
        return { allowed: true };
      }

      if (hasSubscription) {
        return { allowed: true };
      }

      const allowedKinds: Array<StudentEntitlement["kind"]> = ["ALL", "NOTES"];
      const eligible = entitlements.filter((ent) =>
        allowedKinds.includes(ent.kind)
      );

      if (eligible.length === 0) {
        return { allowed: false, reason: "NO_ENTITLEMENT" };
      }

      const topicIds = new Set(note.topicIds ?? []);
      for (const entitlement of eligible) {
        const scope = entitlement.scopeJson || {};
        if (!scope.subjectIds && !scope.topicIds && !scope.noteIds) {
          return { allowed: true };
        }
        if (scope.noteIds?.includes(note.id)) {
          return { allowed: true };
        }
        if (scope.subjectIds?.includes(note.subjectId)) {
          return { allowed: true };
        }
        if (scope.topicIds?.some((id) => topicIds.has(id))) {
          return { allowed: true };
        }
      }

      return { allowed: false, reason: "SCOPE_MISMATCH" };
    },
    [entitlements, hasSubscription]
  );

  const canAccessPractice = React.useCallback((): NoteAccessCheck => {
    if (hasSubscription) {
      return { allowed: true };
    }
    if (hasEntitlement(entitlements, ["ALL", "PRACTICE"])) {
      return { allowed: true };
    }
    return { allowed: false, reason: "NO_ENTITLEMENT" };
  }, [entitlements, hasSubscription]);

  const canAccessTests = React.useCallback((): NoteAccessCheck => {
    if (hasSubscription) {
      return { allowed: true };
    }
    if (hasEntitlement(entitlements, ["ALL", "TESTS"])) {
      return { allowed: true };
    }
    return { allowed: false, reason: "NO_ENTITLEMENT" };
  }, [entitlements, hasSubscription]);

  const refresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value: StudentAccessContextValue = {
    me: data ?? null,
    subscription,
    entitlements,
    isLoading: enabled ? isLoading : false,
    error: error ? String(error) : null,
    refresh,
    hasActiveSubscription: hasSubscription,
    canAccessNote,
    canAccessPractice,
    canAccessTests,
  };

  return (
    <StudentAccessContext.Provider value={value}>
      {children}
    </StudentAccessContext.Provider>
  );
}

export function useStudentAccess() {
  const context = React.useContext(StudentAccessContext);
  if (!context) {
    throw new Error("useStudentAccess must be used within StudentAuthProvider");
  }
  return context;
}
