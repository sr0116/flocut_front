// components/notes/NoteSummaryContent.tsx
"use client";

import SummaryContent from "@/app/components/summary/SummaryContent";
import { useSummaryHistory } from "@/hooks/summaries/useSummaryHistory";

type Props = {
    noteId: string;
    sessionId: number;
    onNoteCreated?: () => void;
};

export default function NoteSummaryContent({
                                               noteId,
                                               sessionId,
                                               onNoteCreated,
                                           }: Props) {
    const id = Number(noteId);

    const { history, loading, refetch } = useSummaryHistory(
        id,
        sessionId,
        "note" //  명시적으로 type 전달
    );

    return (
        <SummaryContent
            type="note"
            targetId={id}
            sessionId={sessionId}
            history={history}
            loadingHistory={loading}
            onRequestSuccess={refetch}
            onNoteCreated={onNoteCreated}
        />
    );
}