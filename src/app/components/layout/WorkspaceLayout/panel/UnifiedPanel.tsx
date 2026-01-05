"use client";

import { useState, useEffect } from "react";
import PanelHeader, { PanelTab } from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import NoteContent from "./contents/NoteContent";
import CalendarContent from "../CalendarContent";

type UnifiedPanelProps = {
    type: "note" | "document" | "audio";
    id: string;
    sessionId: number;
    onClose: () => void;
    onCreated?: (noteId: number) => void;
};

export default function UnifiedPanel({
                                         type,
                                         id,
                                         sessionId,
                                         onClose,
                                         onCreated,
                                     }: UnifiedPanelProps) {
    const [currentTab, setCurrentTab] = useState<PanelTab>("edit");
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    // id 변경 시 탭 초기화
    useEffect(() => {
        setCurrentTab("edit");
    }, [id]);

    const handleSave = () => {
        // NoteContent에서 처리
    };

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
                onClose={onClose}
                sessionId={sessionId}
                noteId={id !== "new" ? Number(id) : undefined}
            />

            {/* 본문 */}
            <div className="flex-1 overflow-hidden">
                {currentTab === "edit" && type === "note" && (
                    <NoteContent
                        id={id}
                        sessionId={sessionId}
                        onCreated={onCreated}
                        onSaveStatusChange={(s, sv) => {
                            setSaved(s);
                            setSaving(sv);
                        }}
                        onStatsChange={(chars, words) => {
                            setCharCount(chars);
                            setWordCount(words);
                        }}
                    />
                )}

                {currentTab === "summary" && <SummaryContent id={id} />}
                {currentTab === "feedback" && <FeedbackContent id={id} />}
                {currentTab === "compare" && <CompareContent id={id} />}
                {currentTab === "calendar" && <CalendarContent noteId={id} />}
            </div>

            {/* 푸터 */}
            <PanelFooter saved={saved} saving={saving} charCount={charCount} wordCount={wordCount} />
        </div>
    );
}

// 임시 컴포넌트
function SummaryContent({ id }: { id: string }) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">AI 요약</h3>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                요약 기능 준비 중입니다.
            </p>
        </div>
    );
}

function FeedbackContent({ id }: { id: string }) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">AI 피드백</h3>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                피드백 기능 준비 중입니다.
            </p>
        </div>
    );
}

function CompareContent({ id }: { id: string }) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">문서 비교</h3>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                비교 기능 준비 중입니다.
            </p>
        </div>
    );
}