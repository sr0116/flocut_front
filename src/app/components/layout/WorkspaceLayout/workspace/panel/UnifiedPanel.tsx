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
  onUpdated?: (payload: {
    noteId: number;
    title: string;
    moddate: string;
  }) => void;
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
  const prevSavingRef = useRef(saving);

  // ID가 바뀔 때(다른 아이템 클릭 시) 기본 탭을 'edit'으로 초기화
  useEffect(() => {
    setCurrentTab("edit");
  }, [id]);

  /** 수동 저장 */
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

  /** autosave 완료 → 즉시 리스트 반영 */
  useEffect(() => {
    if (prevSavingRef.current && !saving && saved) {
      if (type === "note" && id !== "new") {
        onUpdated?.({
          noteId: Number(id),
          title,
          moddate: new Date().toISOString(),
        });
      }
    }
    prevSavingRef.current = saving;
  }, [saving, saved, title, id, type, onUpdated]);

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
        onClose={handleCloseWithGuard}
        sessionId={sessionId}
        noteId={id !== "new" ? Number(id) : undefined}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* --- 편집(Edit) 탭 분기 --- */}
        {currentTab === "edit" && (
          <>
            {type === "note" && <NoteContent key={`note-edit-${id}`} {...noteContentProps} />}
            {type === "document" && <DocumentContent key={`doc-edit-${id}`} fileId={id} sessionId={sessionId} />}
          </>
        )}

        {/* --- 요약(Summary) 탭 분기 --- */}
        {currentTab === "summary" && (
          <>
            {type === "note" && (
              <NoteSummaryContent noteId={id} sessionId={sessionId} />
            )}

            {type === "document" && (
              <DocumentSummaryContent fileId={Number(id)} sessionId={sessionId} />
            )}
          </>
        )}

        {/* --- 기타 탭 --- */}
        {/* {currentTab === "feedback" && type === "note" && <NoteFeedbackContent id={id} />} */}
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