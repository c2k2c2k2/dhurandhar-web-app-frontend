"use client";

export type SecuritySignal = {
  id: string;
  noteId: string;
  userId?: string | null;
  signalType: string;
  metaJson?: unknown;
  createdAt?: string;
  note?: { id: string; title?: string | null; subjectId?: string | null };
  user?: { id: string; email?: string | null; fullName?: string | null };
};

export type SecuritySignalsResponse = {
  data: SecuritySignal[];
  total: number;
  page: number;
  pageSize: number;
};

export type SecuritySummary = {
  total: number;
  byType: { signalType: string; count: number }[];
  topUsers: {
    userId?: string | null;
    count: number;
    user?: { id: string; email?: string | null; fullName?: string | null } | null;
  }[];
  topNotes: {
    noteId: string;
    count: number;
    note?: { id: string; title?: string | null; subjectId?: string | null } | null;
  }[];
};

export type SecurityProfile = {
  user: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    type?: string;
    status?: string;
    lastLoginAt?: string | null;
    lastActiveAt?: string | null;
    createdAt?: string;
  };
  summary: {
    totalSignals: number;
    activeSessions: number;
    activeBans: number;
  };
  signals: SecuritySignal[];
  activeSessions: {
    id: string;
    noteId: string;
    userId: string;
    ip?: string | null;
    userAgent?: string | null;
    createdAt?: string;
    lastSeenAt?: string | null;
    expiresAt?: string;
    note?: { id: string; title?: string | null };
  }[];
  activeBans: {
    id: string;
    noteId: string;
    userId: string;
    reason?: string | null;
    createdAt?: string;
    note?: { id: string; title?: string | null };
  }[];
};
