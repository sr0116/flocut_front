"use client";

import { X, Save, Sparkles, MessageSquare, GitCompare } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { createNote, updateNote } from "@/lib/rest/note/notes.api";
import { useDocumentSummary } from "@/hooks/summaries/useDocumentSummary";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { useDocumentDetail } from "@/hooks/documents/useDocumentDetail";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { EditorContent } from "@tiptap/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  type: "note" | "document" | "audio";
  id: string;
  sessionId: number;
  onClose: () => void;
}

export default function RightPanel({ type, id, sessionId, onClose }: Props) {
  const router = useRouter();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // 노트 데이터
  const { note, loading: noteLoading } = useNoteDetail(
    type === "note" && !isNew ? Number(id) : undefined
  );

  // 문서 데이터
  const { document, loading: documentLoading } = useDocumentDetail(
    type === "document" ? Number(id) : 0
  );

  // 요약 데이터
  const { data: summaryData, loading: summaryLoading } = useDocumentSummary(
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

  // 노트 초기화
  useEffect(() => {
    if (!note || isNew || initialized || !editor || type !== "note") return;

    setTitle(note.title);
    editor.commands.setContent(note.content ?? "<p></p>");
    setInitialized(true);
  }, [note, isNew, initialized, editor, type]);

  // 문서 초기화
  useEffect(() => {
    if (!document || !editor || type !== "document") return;
    setTitle(document.fileName);
  }, [document, editor, type]);

  // 자동 저장 (노트만)
  useEffect(() => {
    if (saved || !editor || type !== "note") return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [saved, editor, title, type]);

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
        router.replace(`/workspace/${sessionId}?type=note&id=${newNoteId}`, { scroll: false });
      } else {
        await updateNote({
          noteId: Number(id),
          title,
          content,
        });
      }
      setSaved(true);
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
      setShowSummary(true);
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
      router.push(`/workspace/${sessionId}?type=note&id=${newNoteId}`, { scroll: false });
    } catch (err) {
      toast.error("노트 변환 실패");
    }
  };

  if ((type === "note" && !isNew && noteLoading) || (type === "document" && documentLoading)) {
    return (
      <aside className="w-[600px] border-l bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </aside>
    );
  }

  return (
    <aside className="w-[600px] border-l bg-white dark:bg-slate-950 flex flex-col">
      {/* 헤더 */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRequestSummary}
            disabled={isNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors disabled:opacity-40"
          >
            <Sparkles size={14} />
            요약
          </button>

          <button
            disabled={isNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors disabled:opacity-40"
          >
            <MessageSquare size={14} />
            피드백
          </button>

          <button
            disabled={isNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-40"
          >
            <GitCompare size={14} />
            비교
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

        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto">
        {showSummary && !isNew ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI 요약</h3>
              <button
                onClick={handleConvertToNote}
                className="px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg transition-all"
              >
                노트로 변환
              </button>
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
              <p className="text-sm text-slate-500">요약 결과가 없습니다.</p>
            )}
          </div>
        ) : type === "document" ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-sm text-slate-500">
                문서 ID: {id}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                문서 내용은 요약을 통해 확인하실 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(false);
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
                className="tiptap-editor prose prose-slate dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                  prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                  prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-4
                  prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-3
                  prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300
                  prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                  prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:my-1 prose-li:text-slate-700 dark:prose-li:text-slate-300
                  prose-blockquote:border-l-4 prose-blockquote:border-pink-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
                  prose-code:bg-slate-100 dark:prose-code:bg-slate-800
                  prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600 dark:prose-code:text-pink-400
                  prose-code:before:content-none prose-code:after:content-none
                  prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-bold
                  prose-em:italic prose-em:text-slate-700 dark:prose-em:text-slate-300
                  focus:outline-none"
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 푸터 */}
      {type === "note" && (
        <div className="h-10 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>{editor?.storage.characterCount?.characters() ?? 0} 글자</span>
            <span>•</span>
            <span>{editor?.storage.characterCount?.words() ?? 0} 단어</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>자동 저장됨</span>
          </div>
        </div>
      )}
    </aside>
  );
}