import { NOTES_BY_STATUS_QUERY} from "@/lib/graphql/note/note.query";
import {useQuery} from "@apollo/client/react";
import {NotesByStatusResponse, NoteStatus} from "@/lib/graphql/note/note.type";

export function useNotesByStatus(
    sessionId: number,
    status: NoteStatus
) {
    return useQuery<NotesByStatusResponse>(NOTES_BY_STATUS_QUERY, {
        variables: { sessionId, status },
        skip: !sessionId,
    });
}