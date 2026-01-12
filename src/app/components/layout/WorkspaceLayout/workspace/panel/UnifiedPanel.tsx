// src/components/layout/WorkspaceLayout/workspace/panel/UnifiedPanel.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import PanelHeader, { PanelTab } from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import NoteContent from "@/app/components/notes/NoteContent";
import CalendarContent from "../../CalendarContent";
import CompareComingSoon from "./CompareComingSoon";
import { useUnsavedLeaveGuard } from "@/hooks/common/useUnsavedLeaveGuard";
import DocumentContent from "@/app/components/documents/DocumentContent";
import NoteSummaryContent from "@/app/components/notes/NoteSummaryContent";
import DocumentSummaryContent from "@/app/components/documents/DocumentSummaryContent";

type UnifiedPanelProps = {
    type: "note" | "document" | "audio";
    id: string;
    sessionId: number;
    onClose: () => void;
    onCreated?: (noteId: number) => void;
    onUpdated?: (payload: { noteId: number; title: string; moddate: string }) => void;
};

export default function UnifiedPanel({ type, id, sessionId, onClose, onCreated, onUpdated }: UnifiedPanelProps) {
    const [currentTab, setCurrentTab] = useState<PanelTab>("edit");
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [title, setTitle] = useState("제목 없음");
    const [content, setContent] = useState("");

    const handleSyncRef = useRef<(() => Promise<void>) | null>(null);
    const prevSavingRef = useRef(saving);

    useEffect(() => { setCurrentTab("edit"); }, [id]);

    const handleSave = async () => {
        if (!handleSyncRef.current) return;
        await handleSyncRef.current();
        if (type === "note" && id !== "new") {
            onUpdated?.({
                noteId: Number(id),
                title,
                moddate: new Date().toISOString(),
            });
        }
    };

    const { confirmNavigation } = useUnsavedLeaveGuard(!saved && !saving, handleSave);

    //  자동 저장 완료 감지 로직
    useEffect(() => {
        const wasSaving = prevSavingRef.current;
        const isNowSaved = !saving && saved; // 저장 중이었다가 완료된 순간

        if (wasSaving && isNowSaved && type === "note" && id !== "new") {
            console.log(" [UnifiedPanel] 자동 저장 완료 알림:", title);
            onUpdated?.({
                noteId: Number(id),
                title: title, // 현재 state의 최신 제목
                moddate: new Date().toISOString(),
            });
        }
        prevSavingRef.current = saving;
    }, [saving, saved, title, id, type, onUpdated]);

    const noteContentProps = useMemo(() => ({
        id,
        sessionId,
        onCreated,
        onSaveStatusChange: (s: boolean, sv: boolean) => {
            setSaved(s);
            setSaving(sv);
        },
        onStatsChange: (chars: number, words: number) => {
            setCharCount(chars);
            setWordCount(words);
        },
        onTitleChange: (newTitle: string) => {
            setTitle(newTitle || "제목 없음");
        },
        onContentChange: (newContent: string) => setContent(newContent),
        onSyncReady: (syncFn: () => Promise<void>) => { handleSyncRef.current = syncFn; },
    }), [id, sessionId, onCreated]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-surface-dark">
            <PanelHeader
                type={type} currentTab={currentTab} onChangeTab={setCurrentTab}
                saved={saved} saving={saving} onSave={handleSave} onClose={() => confirmNavigation(() => onClose())}
                sessionId={sessionId} noteId={id !== "new" ? Number(id) : undefined}
                title={title} content={content}
            />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {currentTab === "edit" && (
                    <>
                        {type === "note" && <NoteContent key={`note-edit-${id}`} {...noteContentProps} />}
                        {type === "document" && <DocumentContent key={`doc-edit-${id}`} fileId={id} sessionId={sessionId} />}
                    </>
                )}
                {/* ... 기타 탭 생략 */}
            </div>
            {type === "note" && <PanelFooter saved={saved} saving={saving} charCount={charCount} wordCount={wordCount} />}
        </div>
    );
}