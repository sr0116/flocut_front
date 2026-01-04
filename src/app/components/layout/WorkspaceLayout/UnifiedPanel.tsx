"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Sparkles,
  MessageSquare,
  GitCompare,
  Calendar as CalendarIcon,
  FileText,
  Loader2,
} from "lucide-react";

import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { createNote, updateNote } from "@/lib/rest/note/notes.api";
import { useDocumentSummary } from "@/hooks/summaries/useDocumentSummary";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { useDocumentDetail } from "@/hooks/documents/useDocumentDetail";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { toast } from "sonner";

import PropertiesContent from "@/app/components/layout/WorkspaceLayout/PropertiesContent";
import CalendarContent from "@/app/components/layout/WorkspaceLayout/CalendarContent";

interface Props {
  type: "note" | "document" | "audio";
  id: string;
  sessionId: number;
  onClose: () => void;
  onCreated?: (noteId: number) => void;
}

type TabMode = "edit" | "summary" | "feedback" | "compare" | "properties" | "calendar";

export default function UnifiedPanel({ type, id, sessionId, onClose, onCreated }: Props) {
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabMode>("edit");

  // 노트 데이터
  const { note, loading: noteLoading } = useNoteDetail(
    type === "note" && !isNew ? Number(id) : undefined
  );

  // 문서 데이터
  const { document, loading: documentLoading } = useDocumentDetail(
    type === "document" ? Number(id) : 0
  );

  // 요약 데이터
  const { data: summaryData, loading: summaryLoading, refetch: refetchSummary } = useDocumentSummary(
    type === "note" && !isNew ? Number(id) : 0
  );

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

  // ID 변경 시 초기화 상태 리셋
  useEffect(() => {
    setInitialized(false);
    setTitle("");
    setSaved(true);
    setCurrentTab("edit");
  }, [id, type]);

  // 노트 초기화
  useEffect(() => {
    if (!note || isNew || initialized || !editor || type !== "note") return;

    setTitle(note.title || "");
    editor.commands.setContent(note.content ?? "<p></p>");
    setInitialized(true);
  }, [note, isNew, initialized, editor, type, id]);

  // 문서 초기화
  useEffect(() => {
    if (!document || !editor || type !== "document") return;
    setTitle(document.fileName);
    setInitialized(true);
  }, [document, editor, type, id]);

  // 자동 저장 (노트만)
  useEffect(() => {
    if (saved || !editor || type !== "note" || isNew) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [saved, editor, title, type, isNew, id]);

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
        if (onCreated) {
          onCreated(newNoteId);
        }
      } else {
        await updateNote({
          noteId: Number(id),
          title: title || "제목 없음",
          content,
        });
        setSaved(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestSummary = async () => {
    if (!id || isNew) return;

    try {
      await requestDocumentSummary({
        fileId: Number(id),
        sessionId,
        roundNo: 1,
      });
      toast.success("AI 요약 요청이 접수되었습니다");
      setCurrentTab("summary");
      setTimeout(() => refetchSummary(), 1000);
    } catch (err) {
      toast.error("요약 요청 실패");
    }
  };

  const handleConvertToNote = async () => {
    if (!summaryData?.documentSummaryByFileId?.summaryText) return;

    try {
      const newNoteId = await createNote({
        sessionId,
        title: `${title} - 요약`,
        content: `<p>${summaryData.documentSummaryByFileId.summaryText}</p>`,
      });
      toast.success("노트로 변환되었습니다");
      if (onCreated) {
        onCreated(newNoteId);
      }
    } catch (err) {
      toast.error("노트 변환 실패");
    }
  };

  if ((type === "note" && !isNew && noteLoading) || (type === "document" && documentLoading)) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* 헤더 */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab("edit")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === "edit"
                ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText size={14} className="inline mr-1" />
            편집
          </button>

          <button
            onClick={handleRequestSummary}
            disabled={isNew}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 ${
              currentTab === "summary"
                ? "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                : "text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/20"
            }`}
          >
            <Sparkles size={14} className="inline mr-1" />
            요약
          </button>

          <button
            onClick={() => setCurrentTab("feedback")}
            disabled={isNew}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 ${
              currentTab === "feedback"
                ? "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                : "text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20"
            }`}
          >
            <MessageSquare size={14} className="inline mr-1" />
            피드백
          </button>

          <button
            onClick={() => setCurrentTab("compare")}
            disabled={isNew}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 ${
              currentTab === "compare"
                ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                : "text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20"
            }`}
          >
            <GitCompare size={14} className="inline mr-1" />
            비교
          </button>

          <button
            onClick={() => setCurrentTab("calendar")}
            disabled={isNew}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 ${
              currentTab === "calendar"
                ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            }`}
          >
            <CalendarIcon size={14} className="inline mr-1" />
            일정
          </button>

          {type === "note" && (
            <>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                  saved
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-default"
                    : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg"
                }
                  disabled:opacity-60
                `}
              >
                <Save size={14} />
                {saving ? "저장 중..." : saved ? "저장됨" : "저장"}
              </button>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
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
              placeholder="제목 없음"
              disabled={type !== "note"}
              className="w-full text-3xl font-bold bg-transparent outline-none mb-6 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 disabled:cursor-not-allowed"
            />

            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
              <span>
                {new Date().toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {editor ? (
              <EditorContent
                editor={editor}
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                  prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                  prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-4
                  prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-3
                  prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300
                  focus:outline-none"
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            )}
          </div>
        )}

        {currentTab === "summary" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI 요약</h3>
              {summaryData?.documentSummaryByFileId && (
                <button
                  onClick={handleConvertToNote}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg transition-all"
                >
                  노트로 변환
                </button>
              )}
            </div>

            {summaryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-pink-500" size={24} />
              </div>
            ) : summaryData?.documentSummaryByFileId ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">
                  {summaryData.documentSummaryByFileId.summaryText}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-sm text-slate-500">요약 버튼을 눌러 AI 요약을 요청하세요</p>
              </div>
            )}
          </div>
        )}

        {currentTab === "feedback" && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">AI 피드백</h3>
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-sm text-slate-500">AI 피드백 기능 준비 중입니다</p>
            </div>
          </div>
        )}

        {currentTab === "compare" && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">문서 비교</h3>
            <div className="text-center py-12">
              <GitCompare size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-sm text-slate-500">문서 비교 기능 준비 중입니다</p>
            </div>
          </div>
        )}

        {currentTab === "calendar" && (
          <CalendarContent noteId={id} />
        )}
      </div>

      {/* 푸터 (노트 편집 시에만) */}
      {type === "note" && currentTab === "edit" && (
        <div className="h-10 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span>{editor?.storage.characterCount?.characters() ?? 0} 글자</span>
            <span>•</span>
            <span>{editor?.storage.characterCount?.words() ?? 0} 단어</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${saved ? "bg-green-500" : "bg-yellow-500"} ${!saved && "animate-pulse"}`} />
            <span>{saved ? "저장됨" : "저장 중..."}</span>
          </div>
        </div>
      )}
    </div>
  );
}