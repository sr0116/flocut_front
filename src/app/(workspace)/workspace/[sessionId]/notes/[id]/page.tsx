"use client";

import { useParams, useRouter } from "next/navigation";
import NoteContent from "@/app/components/layout/WorkspaceLayout/panel/contents/NoteContent";
import { X } from "lucide-react";

export default function NoteFullPage() {
    const router = useRouter();
    const { sessionId, id } = useParams<{ sessionId: string; id: string }>();

    return (
        <div className="h-full flex flex-col bg-white dark:bg-background-dark">
            {/* 상단 헤더 */}
            <div className="h-14 border-b border-border-light dark:border-border-dark flex items-center justify-between px-6">
                <h1 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                    노트
                </h1>
                <button
                    onClick={() => router.push(`/workspace/${sessionId}`)}
                    className="p-2 rounded-lg hover:bg-surface-light dark:hover:bg-surface-input transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* 노트 콘텐츠 */}
            <div className="flex-1 overflow-hidden">
                <NoteContent
                    noteId={id}
                    sessionId={Number(sessionId)}
                    tab="edit"
                    onCreated={(newNoteId) => {
                        router.replace(`/workspace/${sessionId}/notes/${newNoteId}`);
                    }}
                />
            </div>
        </div>
    );
}