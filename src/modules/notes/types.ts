"use client";

export type NoteTopicLink = {
  noteId: string;
  topicId: string;
};

export type NoteItem = {
  id: string;
  subjectId: string;
  title: string;
  description?: string | null;
  isPremium: boolean;
  isPublished: boolean;
  fileAssetId?: string | null;
  pageCount?: number | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  topics?: NoteTopicLink[];
};
