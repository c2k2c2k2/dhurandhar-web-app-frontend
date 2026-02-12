"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { NoteCreateInput, NoteUpdateInput } from "./schemas";
import type { NoteFilters } from "./api";

const notesKey = (filters: NoteFilters) => ["admin", "notes", filters];

export function useNotes(filters: NoteFilters = {}) {
  return useQuery({
    queryKey: notesKey(filters),
    queryFn: () => api.listNotes(filters),
  });
}

export function useNote(noteId?: string) {
  return useQuery({
    queryKey: ["admin", "notes", "detail", noteId],
    queryFn: async () => {
      const list = await api.listNotes();
      return list.find((note) => note.id === noteId) || null;
    },
    enabled: Boolean(noteId),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NoteCreateInput) => api.createNote(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, input }: { noteId: string; input: NoteUpdateInput }) =>
      api.updateNote(noteId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notes"] });
    },
  });
}

export function usePublishNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => api.publishNote(noteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notes"] });
    },
  });
}

export function useUnpublishNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => api.unpublishNote(noteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notes"] });
    },
  });
}
