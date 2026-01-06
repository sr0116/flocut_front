
import { useEffect, useState } from "react";
import { getNoteDetail } from "@/lib/rest/note/notes.rest";
import {NoteDetailResponse} from "@/lib/graphql/note/note.type";

//  상세 조회는 레스트(레디스 병합 보장을 위해)
export function useNoteDetail(noteId?: number) {
    const [note, setNote] = useState<NoteDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!noteId) return;

        setLoading(true);
        getNoteDetail(noteId)
            .then(setNote)
            .finally(() => setLoading(false));
    }, [noteId]);

    return { note, loading };
}