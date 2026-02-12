import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/modules/student-notes/api";
import type { NoteListFilters } from "@/modules/student-notes/api";

export function useNotes(filters: NoteListFilters) {
  return useQuery({
    queryKey: ["student", "notes", filters],
    queryFn: () => api.listNotes(filters),
  });
}

export function useNotesTree() {
  return useQuery({
    queryKey: ["student", "notes", "tree"],
    queryFn: api.getNotesTree,
  });
}

export function useNote(noteId?: string) {
  return useQuery({
    queryKey: ["student", "notes", noteId],
    queryFn: () => api.getNote(noteId as string),
    enabled: Boolean(noteId),
  });
}

export function useCreateViewSession() {
  return useMutation({ mutationFn: (noteId: string) => api.createViewSession(noteId) });
}

export function useResetViewSessions() {
  return useMutation({
    mutationFn: (noteId: string) => api.resetViewSessions(noteId),
  });
}

export function useWatermark(noteId?: string, viewToken?: string) {
  return useQuery({
    queryKey: ["student", "notes", "watermark", noteId, viewToken],
    queryFn: () => api.getWatermark(noteId as string, viewToken as string),
    enabled: Boolean(noteId && viewToken),
  });
}

export function useUpdateNoteProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: { lastPage?: number; completionPercent?: number } }) =>
      api.updateNoteProgress(noteId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student", "analytics", "notes"] });
    },
  });
}
