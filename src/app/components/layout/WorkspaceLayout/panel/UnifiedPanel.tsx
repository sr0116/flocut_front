"use client";

import { useState, useEffect } from "react";

// Components
import PanelHeader, { PanelTab } from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import NoteContent from "@/app/components/notes/NoteContent";
import CalendarContent from "../CalendarContent";
import CompareComingSoon from "./CompareComingSoon";

// ============================================
// Types
// ============================================

type UnifiedPanelProps = {
    type: "note" | "document" | "audio";
    id: string;
    sessionId: number;
    onClose: () => void;
    onCreated?: (noteId: number) => void;
};

// ============================================
// Main Component
// ============================================

export default function UnifiedPanel({
                                         type,
                                         id,
                                         sessionId,
                                         onClose,
                                         onCreated,
                                     }: UnifiedPanelProps) {
    // --------------------------------------------
    // State - 탭
    // --------------------------------------------

    const [currentTab, setCurrentTab] = useState<PanelTab>("edit");

    // --------------------------------------------
    // State - 저장 상태
    // --------------------------------------------

    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);

    // --------------------------------------------
    // State - 통계
    // --------------------------------------------

    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    // --------------------------------------------
    // Effects - id 변경 시 탭 초기화
    // --------------------------------------------

    useEffect(() => {
        setCurrentTab("edit");
    }, [id]);

    // --------------------------------------------
    // Handlers - 저장
    // --------------------------------------------

    const handleSave = () => {
        // NoteContent의 자동 저장이 처리
    };

    // --------------------------------------------
    // Render
    // --------------------------------------------

    return (
        <div className="h-full flex flex-col bg-white dark:bg-surface-dark">

            {/* ========== 헤더 ========== */}
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

            {/* ========== 본문 (탭별 컨텐츠) ========== */}
            <div className="flex-1 overflow-hidden">

                {/* 편집 탭 - 노트 에디터 */}
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

                {/* 요약 탭 - 준비중 */}
                {currentTab === "summary" && <SummaryContent id={id} />}

                {/* 피드백 탭 - 준비중 */}
                {currentTab === "feedback" && <FeedbackContent id={id} />}

                {/* 비교 탭 - 준비중 안내 */}
                {currentTab === "compare" && <CompareComingSoon />}

                {/* 일정 탭 */}
                {currentTab === "calendar" && <CalendarContent noteId={id} />}
            </div>

            {/* ========== 푸터 ========== */}
            <PanelFooter
                saved={saved}
                saving={saving}
                charCount={charCount}
                wordCount={wordCount}
            />
        </div>
    );
}

// ============================================
// 임시 컴포넌트들
// ============================================

function SummaryContent({ id }: { id: string }) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
                AI 요약
            </h3>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                요약 기능 준비 중입니다.
            </p>
        </div>
    );
}

function FeedbackContent({ id }: { id: string }) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
                AI 피드백
            </h3>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                피드백 기능 준비 중입니다.
            </p>
        </div>
    );
}