// app/components/layout/WorkspaceLayout/panel/UnifiedPanel.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import PanelHeader, { PanelTab } from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import NoteContent from "@/app/components/notes/NoteContent";
import CalendarContent from "../CalendarContent";
import CompareComingSoon from "./CompareComingSoon";

type UnifiedPanelProps = {
  type: "note" | "document" | "audio";
  id: string;
  sessionId: number;
  onClose: () => void;
  onCreated?: (noteId: number) => void;
  onUpdated?: () => void;
};

export default function UnifiedPanel({
                                       type,
                                       id,
                                       sessionId,
                                       onClose,
                                       onCreated,
                                       onUpdated,
                                     }: UnifiedPanelProps) {
  const [currentTab, setCurrentTab] = useState<PanelTab>("edit");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [title, setTitle] = useState("제목 없음");

  const handleSyncRef = useRef<(() => Promise<void>) | null>(null);
  const prevSavedRef = useRef(saved);
  const prevSavingRef = useRef(saving);

  useEffect(() => {
    setCurrentTab("edit");
  }, [id]);

  // 자동저장 완료 감지: saving이 true → false로 변경되고 saved가 true일 때
  useEffect(() => {
    const wasSaving = prevSavingRef.current;
    const nowSaved = saved;
    const nowSaving = saving;

    // 저장 중이었다가 → 저장 완료된 경우
    if (wasSaving && !nowSaving && nowSaved) {
      console.log("자동저장 완료 감지 → 목록 갱신");
      onUpdated?.();
    }

    prevSavedRef.current = nowSaved;
    prevSavingRef.current = nowSaving;
  }, [saved, saving, onUpdated]);

  const handleSave = async () => {
    if (handleSyncRef.current) {
      await handleSyncRef.current();
      onUpdated?.();
    }
  };

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
      onTitleChange: (newTitle: string) => setTitle(newTitle || "제목 없음"),
      onSyncReady: (syncFn: () => Promise<void>) => {
        handleSyncRef.current = syncFn;
      },
    }),
    [id, sessionId, onCreated]
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-surface-dark">
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

      <div className="flex-1 overflow-hidden">
        {currentTab === "edit" && type === "note" && (
          <NoteContent {...noteContentProps} />
        )}

        {currentTab === "summary" && <SummaryContent id={id} />}
        {currentTab === "feedback" && <FeedbackContent id={id} />}
        {currentTab === "compare" && <CompareComingSoon />}
        {currentTab === "calendar" && <CalendarContent noteId={id} />}
      </div>

      <PanelFooter
        saved={saved}
        saving={saving}
        charCount={charCount}
        wordCount={wordCount}
      />
    </div>
  );
}

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