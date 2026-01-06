// hooks/notes/useNotesByStatus.ts
"use client";

import { NOTES_BY_STATUS_QUERY } from "@/lib/graphql/note/note.query";
import {
  NotesByStatusResponse,
  NoteStatus,
} from "@/lib/graphql/note/note.type";
import {useQuery} from "@apollo/client/react";

export function useNotesByStatus(sessionId: number, status: NoteStatus) {
  const { data, loading, error, refetch } = useQuery<NotesByStatusResponse>(
    NOTES_BY_STATUS_QUERY,
    {
      variables: { sessionId, status },
      skip: !sessionId,
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    }
  );

  return {
    notes: data?.notesByStatus ?? [],
    loading,
    error: error?.message ?? null,
    refetch,
  };
}