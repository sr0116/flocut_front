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

    useEffect(() => {
        // console.log("UnifiedPanel - fileName:", fileName);
        // console.log("UnifiedPanel - type:", type);
        // console.log("UnifiedPanel - id:", id);

        setCurrentTab("edit");

        if (type === "document") {
            if (fileName) {
                const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
                console.log("Setting title to:", fileNameWithoutExt);
                setTitle(fileNameWithoutExt);
            } else {
                console.log("fileName is undefined, setting title to '문서'");
                setTitle("문서");
            }
            setContent(documentText || "");
        } else if (type === "audio") {
            setTitle("음성");
            setContent("");
        }
    }, [id, type, documentText, fileName]);

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

    const handleNoteCreatedFromSummary = useCallback(() => {
        // console.log(" 요약본으로 노트 생성됨!");
        if (onUpdated) {
            onUpdated({
                noteId: 0,
                title: "새 노트",
                moddate: new Date().toISOString(),
            });
        }
    }, [onUpdated]);

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

    // console.log("UnifiedPanel - current title state:", title);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-surface-dark">
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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
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

                {currentTab === "summary" && (
                    <>
                        {type === "note" && (
                            <NoteSummaryContent noteId={id} sessionId={sessionId} />
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

                {currentTab === "compare" && <CompareComingSoon />}

                {currentTab === "calendar" && type === "note" && (
                    <CalendarContent noteId={id} />
                )}
            </div>

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