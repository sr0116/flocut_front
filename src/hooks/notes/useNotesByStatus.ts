// hooks/notes/useNotesByStatus.ts
"use client";

import { useQuery } from "@apollo/client/react";
import { NOTES_BY_STATUS_QUERY } from "@/lib/graphql/note/note.query";
import {
    NotesByStatusResponse,
    NoteStatus,
} from "@/lib/graphql/note/note.type";

export function useNotesByStatus(
    sessionId: number,
    status: NoteStatus,
    page: number,
    size: number
) {
    const { data, loading, error, refetch } =
        useQuery<NotesByStatusResponse>(NOTES_BY_STATUS_QUERY, {
            variables: {
                sessionId,
                status,
                page: { page, size },
            },
            skip: !sessionId,
            fetchPolicy: "network-only",
            errorPolicy: "all",
        });

    return {
        page: data?.notesByStatus,
        notes: data?.notesByStatus.content ?? [],
        loading,
        error: error?.message ?? null,
        refetch,
    };
}
