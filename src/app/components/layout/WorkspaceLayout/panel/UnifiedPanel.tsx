"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Save,
  Sparkles,
  MessageSquare,
  GitCompare,
  Calendar as CalendarIcon,
  FileText,
  Loader2,
  File,
  Mic,
} from "lucide-react";

// 데이터 훅
import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { createNote, updateNote } from "@/lib/rest/note/notes.api";
import { useDocumentSummary } from "@/hooks/summaries/useDocumentSummary";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { useDocumentDetail } from "@/hooks/documents/useDocumentDetail";

// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

import { toast } from "sonner";
import CalendarContent from "@/app/components/layout/WorkspaceLayout/CalendarContent";

// Props 정의
interface Props {
  type: "note" | "document" | "audio";
  id: string; // noteId 또는 "new"
  sessionId: number;
  onClose: () => void;
  onCreated?: (noteId: number) => void;
}

// 탭 타입
type TabMode = "edit" | "summary" | "feedback" | "compare" | "calendar";

export default function UnifiedPanel({
                                       type,
                                       id,
                                       sessionId,
                                       onClose,
                                       onCreated,
                                     }: Props) {
  const router = useRouter();

  // 기본 상태
  const isNew = id === "new";
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabMode>("edit");

  // 데이터 로딩
  const { note, loading: noteLoading } = useNoteDetail(
    type === "note" && !isNew ? Number(id) : undefined
  );

  const { document, loading: documentLoading } = useDocumentDetail(
    type === "document" ? Number(id) : 0
  );

  const {
    data: summaryData,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useDocumentSummary(
    type === "note" && !isNew ? Number(id) : 0
  );

  // 에디터 초기화
  const editor = useEditor({
    editable: type === "note",
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    onUpdate: () => {
      if (type === "note") setSaved(false);
    },
  });

  // id / type 변경 시 초기화
  useEffect(() => {
    setInitialized(false);
    setTitle("");
    setSaved(true);
    setCurrentTab("edit");
  }, [id, type]);

  // 노트 데이터 세팅
  useEffect(() => {
    if (!note || isNew || initialized || !editor || type !== "note") return;
    setTitle(note.title || "");
    editor.commands.setContent(note.content ?? "<p></p>");
    setInitialized(true);
  }, [note, isNew, initialized, editor, type]);

  // 문서 데이터 세팅
  useEffect(() => {
    if (!document || !editor || type !== "document") return;
    setTitle(document.fileName);
    setInitialized(true);
  }, [document, editor, type]);

  // 자동 저장 (노트만)
  useEffect(() => {
    if (saved || !editor || type !== "note" || isNew) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [saved, editor, title, type, isNew]);

  // 저장 처리
  const handleSave = async () => {
    if (!editor || saving || type !== "note") return;
    setSaving(true);

    try {
      const content = editor.getHTML();

      if (isNew) {
        const newNoteId = await createNote({
          sessionId,
          title: title || "제목 없음",
          content,
        });
        setSaved(true);
        onCreated?.(newNoteId);
      } else {
        await updateNote({
          noteId: Number(id),
          title: title || "제목 없음",
          content,
        });
        setSaved(true);
      }
    } catch {
      toast.error("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  // AI 요약 요청
  const handleRequestSummary = async () => {
    if (isNew) return;

    try {
      await requestDocumentSummary({
        fileId: Number(id),
        sessionId,
        roundNo: 1,
      });
      setCurrentTab("summary");
      setTimeout(() => refetchSummary(), 1000);
    } catch {
      toast.error("요약 요청 실패");
    }
  };

  // 요약 → 노트 변환
  const handleConvertToNote = async () => {
    if (!summaryData?.documentSummaryByFileId?.summaryText) return;

    try {
      const newNoteId = await createNote({
        sessionId,
        title: `${title} - 요약`,
        content: `<p>${summaryData.documentSummaryByFileId.summaryText}</p>`,
      });
      onCreated?.(newNoteId);
    } catch {
      toast.error("노트 변환 실패");
    }
  };

  // 로딩 처리
  if (
    (type === "note" && !isNew && noteLoading) ||
    (type === "document" && documentLoading)
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // 아이콘 결정
  const getIcon = () => {
    if (type === "audio") return <Mic size={16} />;
    if (type === "document") return <File size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* 헤더 */}
      <div className="h-14 border-b flex items-center justify-between px-4">
        {/* 탭 영역 */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button onClick={() => setCurrentTab("edit")}>
            {getIcon()} 편집
          </button>
          <button onClick={handleRequestSummary} disabled={isNew}>
            요약
          </button>
          <button onClick={() => setCurrentTab("feedback")} disabled={isNew}>
            피드백
          </button>
          <button onClick={() => setCurrentTab("compare")} disabled={isNew}>
            비교
          </button>
          <button onClick={() => setCurrentTab("calendar")} disabled={isNew}>
            일정
          </button>
        </div>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-2">
          {/* 전체 페이지로 열기 */}
          {type === "note" && !isNew && (
            <button
              // 패널 → 전체 페이지 전환
              onClick={() =>
                router.push(`/workspace/${sessionId}/notes/${id}`)
              }
              title="전체 페이지로 열기"
            >
              <FileText size={18} />
            </button>
          )}

          {/* 저장 버튼 */}
          {type === "note" && (
            <button onClick={handleSave} disabled={saving || saved}>
              <Save size={14} />
            </button>
          )}

          {/* 닫기 */}
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto">
        {currentTab === "edit" && (
          <div className="p-6">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (type === "note") setSaved(false);
              }}
              disabled={type !== "note"}
              placeholder="제목 없음"
              className="w-full text-3xl font-bold mb-6 outline-none"
            />

            {editor && (
              <EditorContent
                editor={editor}
                className="prose max-w-none min-h-[400px]"
              />
            )}
          </div>
        )}

        {currentTab === "summary" && (
          <div className="p-6">
            {summaryLoading ? (
              <Loader2 className="animate-spin" />
            ) : summaryData?.documentSummaryByFileId ? (
              <>
                <button onClick={handleConvertToNote}>
                  노트로 만들기
                </button>
                <p>{summaryData.documentSummaryByFileId.summaryText}</p>
              </>
            ) : (
              <p>요약을 요청하세요</p>
            )}
          </div>
        )}

        {currentTab === "calendar" && <CalendarContent noteId={id} />}
      </div>
    </div>
  );
}
