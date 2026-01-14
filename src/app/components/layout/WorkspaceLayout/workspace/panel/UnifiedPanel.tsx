// components/layout/WorkspaceLayout/workspace/panel/UnifiedPanel.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import PanelHeader, { PanelTab } from "./PanelHeader";
import PanelFooter from "./PanelFooter";

import NoteContent from "@/app/components/notes/NoteContent";
import DocumentContent from "@/app/components/documents/DocumentContent";

import NoteSummaryContent from "@/app/components/notes/NoteSummaryContent";
import DocumentSummaryContent from "@/app/components/documents/DocumentSummaryContent";

import CalendarContent from "../../CalendarContent";
import CompareComingSoon from "./CompareComingSoon";

import { useUnsavedLeaveGuard } from "@/hooks/common/useUnsavedLeaveGuard";
import { useFileText } from "@/hooks/files/useFileText";

type UnifiedPanelProps = {
    type: "note" | "document" | "audio";
    id: string;
    sessionId: number;
    fileName?: string;
    onClose: () => void;
    onCreated?: (noteId: number) => void;
    onUpdated?: (payload: {
        noteId: number;
        title: string;
        moddate: string;
    }) => void;
    isMobile?: boolean;
};

export default function UnifiedPanel({
                                         type,
                                         id,
                                         sessionId,
                                         fileName,
                                         onClose,
                                         onCreated,
                                         onUpdated,
                                         isMobile = false,
                                     }: UnifiedPanelProps) {
    const [currentTab, setCurrentTab] = useState<PanelTab>("edit");
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [title, setTitle] = useState("제목 없음");
    const [content, setContent] = useState("");

    const handleSyncRef = useRef<(() => Promise<void>) | null>(null);
    const prevSavingRef = useRef(saving);

    const { text: documentText } = useFileText(
        type === "document" ? Number(id) : null
    );

    // 초기화
    useEffect(() => {
        setCurrentTab("edit");

        if (type === "document") {
            if (fileName) {
                const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
                setTitle(fileNameWithoutExt);
            } else {
                setTitle("문서");
            }
            setContent(documentText || "");
        } else if (type === "audio") {
            setTitle("음성");
            setContent("");
        }
    }, [id, type, documentText, fileName]);

    // 저장 핸들러
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

    const { confirmNavigation } = useUnsavedLeaveGuard(
        !saved && !saving,
        handleSave
    );

    const handleCloseWithGuard = () => {
        confirmNavigation(() => onClose());
    };

    // 저장 완료 시 업데이트 전파
    useEffect(() => {
        const wasSaving = prevSavingRef.current;
        const isNowSaved = !saving && saved;

        if (wasSaving && isNowSaved && type === "note" && id !== "new") {
            onUpdated?.({
                noteId: Number(id),
                title,
                moddate: new Date().toISOString(),
            });
        }

        prevSavingRef.current = saving;
    }, [saving, saved, title, id, type, onUpdated]);

    // 요약에서 노트 생성 시 콜백
    const handleNoteCreatedFromSummary = useCallback(() => {
        if (onUpdated) {
            onUpdated({
                noteId: 0,
                title: "새 노트",
                moddate: new Date().toISOString(),
            });
        }
    }, [onUpdated]);

    // NoteContent Props
    const noteContentProps = useMemo(
        () => ({
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
            onContentChange: (newContent: string) => {
                setContent(newContent);
            },
            onSyncReady: (syncFn: () => Promise<void>) => {
                handleSyncRef.current = syncFn;
            },
        }),
        [id, sessionId, onCreated]
    );

    return (
        <div className="h-full flex flex-col bg-white dark:bg-surface-dark">
            {/* 헤더 */}
            <PanelHeader
                type={type}
                currentTab={currentTab}
                onChangeTab={setCurrentTab}
                saved={saved}
                saving={saving}
                onSave={handleSave}
                onClose={handleCloseWithGuard}
                sessionId={sessionId}
                noteId={id !== "new" ? Number(id) : undefined}
                title={title}
                content={content}
                isMobile={isMobile}
            />

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* 편집 탭 */}
                {currentTab === "edit" && (
                    <>
                        {type === "note" && (
                            <NoteContent key={`note-edit-${id}`} {...noteContentProps} />
                        )}

                        {type === "document" && (
                            <DocumentContent
                                key={`doc-edit-${id}`}
                                fileId={id}
                                sessionId={sessionId}
                            />
                        )}
                    </>
                )}

                {/* 요약 탭 */}
                {currentTab === "summary" && (
                    <>
                        {type === "note" && (
                            <NoteSummaryContent
                                noteId={id}
                                sessionId={sessionId}
                                onNoteCreated={handleNoteCreatedFromSummary}
                            />
                        )}

                        {type === "document" && (
                            <DocumentSummaryContent
                                fileId={Number(id)}
                                sessionId={sessionId}
                                onNoteCreated={handleNoteCreatedFromSummary}
                            />
                        )}
                    </>
                )}

                {/* 비교 탭 */}
                {currentTab === "compare" && <CompareComingSoon />}

                {/* 캘린더 탭 */}
                {/*{currentTab === "calendar" && type === "note" && (*/}
                {/*    <CalendarContent noteId={id} />*/}
                {/*)}*/}
            </div>

            {/* 푸터 (노트만) */}
            {type === "note" && (
                <PanelFooter
                    saved={saved}
                    saving={saving}
                    charCount={charCount}
                    wordCount={wordCount}
                />
            )}
        </div>
    );
}