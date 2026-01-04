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
  File,
  Mic,
} from "lucide-react";

// 훅
import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { createNote, updateNote } from "@/lib/rest/note/notes.api";
import { useDocumentSummary } from "@/hooks/summaries/useDocumentSummary";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { useDocumentDetail } from "@/hooks/documents/useDocumentDetail";

// Tiptap 에디터
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { toast } from "sonner";

// 내부 컴포넌트 (캘린더는 기존 것 재사용)
import CalendarContent from "@/app/components/layout/WorkspaceLayout/CalendarContent";


// Props 정의

interface Props {
  type: "note" | "document" | "audio"; // 선택된 항목 타입
  id: string; // 선택된 항목 ID (또는 "new")
  sessionId: number; // 현재 세션 ID
  onClose: () => void; // 패널 닫기
  onCreated?: (noteId: number) => void; // 새 노트 생성 시 콜백
}


// 탭 모드 타입 정의

type TabMode = "edit" | "summary" | "feedback" | "compare" | "calendar";

// 메인 컴포넌트
export default function UnifiedPanel({ type, id, sessionId, onClose, onCreated }: Props) {
  
  // 상태 관리
  
  const isNew = id === "new"; // 새 노트인지 여부
  const [title, setTitle] = useState(""); // 제목
  const [saving, setSaving] = useState(false); // 저장 중 여부
  const [saved, setSaved] = useState(true); // 저장 완료 여부
  const [initialized, setInitialized] = useState(false); // 초기화 완료 여부
  const [currentTab, setCurrentTab] = useState<TabMode>("edit"); // 현재 탭

  
  // 데이터 훅 (노트/문서/요약)
  
  const { note, loading: noteLoading } = useNoteDetail(
    type === "note" && !isNew ? Number(id) : undefined
  );

  const { document, loading: documentLoading } = useDocumentDetail(
    type === "document" ? Number(id) : 0
  );

  const { data: summaryData, loading: summaryLoading, refetch: refetchSummary } = useDocumentSummary(
    type === "note" && !isNew ? Number(id) : 0
  );

  // Tiptap 에디터 (노트 편집용)
  
  const editor = useEditor({
    editable: type === "note", // 노트만 편집 가능
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
      // 에디터 내용 변경 시 → 저장 필요 상태로 전환
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


  // 노트 데이터 초기화 (DB에서 불러온 데이터를 에디터에 세팅)
 
  useEffect(() => {
    if (!note || isNew || initialized || !editor || type !== "note") return;

    setTitle(note.title || "");
    editor.commands.setContent(note.content ?? "<p></p>");
    setInitialized(true);
  }, [note, isNew, initialized, editor, type, id]);

  
  // 문서 데이터 초기화
  
  useEffect(() => {
    if (!document || !editor || type !== "document") return;
    setTitle(document.fileName);
    setInitialized(true);
  }, [document, editor, type, id]);

 
  // 자동 저장 (노트만, 2초 디바운스)
  
  useEffect(() => {
    if (saved || !editor || type !== "note" || isNew) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [saved, editor, title, type, isNew, id]);


  // 저장 함수 (새 노트 생성 or 기존 노트 업데이트)

  const handleSave = async () => {
    if (!editor || saving || type !== "note") return;
    setSaving(true);

    try {
      const content = editor.getHTML();

      if (isNew) {
        // 새 노트 생성
        const newNoteId = await createNote({
          sessionId,
          title: title || "제목 없음",
          content,
        });
        setSaved(true);
        if (onCreated) {
          onCreated(newNoteId); // 부모 컴포넌트에 새 노트 ID 전달
        }
      } else {
        // 기존 노트 업데이트
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


  // AI 요약 요청 (문서/노트에서 사용)
 
  const handleRequestSummary = async () => {
    if (!id || isNew) return;

    try {
      await requestDocumentSummary({
        fileId: Number(id),
        sessionId,
        roundNo: 1,
      });
      toast.success("AI 요약 요청이 접수되었습니다");
      setCurrentTab("summary"); // 요약 탭으로 이동
      setTimeout(() => refetchSummary(), 1000); // 1초 후 재조회
    } catch (err) {
      toast.error("요약 요청 실패");
    }
  };


  // 노트로 만들기 (요약 결과를 새 노트로 변환)

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


  // 로딩 중일 때 처리

  if ((type === "note" && !isNew && noteLoading) || (type === "document" && documentLoading)) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }


  // 아이콘 헬퍼 함수

  const getIcon = () => {
    switch (type) {
      case "audio":
        return <Mic size={16} className="text-purple-500" />;
      case "document":
        return <File size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-green-500" />;
    }
  };


  // 렌더링

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* 
          헤더 (탭 + 저장 버튼 + 닫기)
          */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        {/* 좌측: 탭 버튼들 */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {/* 편집 탭 */}
          <button
            onClick={() => setCurrentTab("edit")}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              currentTab === "edit"
                ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {getIcon()}
            <span className="hidden sm:inline">편집</span>
          </button>

          {/* 요약 탭 */}
          <button
            onClick={handleRequestSummary}
            disabled={isNew}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-40 whitespace-nowrap ${
              currentTab === "summary"
                ? "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                : "text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/20"
            }`}
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">요약</span>
          </button>

          {/* 피드백 탭 */}
          <button
            onClick={() => setCurrentTab("feedback")}
            disabled={isNew}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-40 whitespace-nowrap ${
              currentTab === "feedback"
                ? "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                : "text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20"
            }`}
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">피드백</span>
          </button>

          {/* 비교 탭 */}
          <button
            onClick={() => setCurrentTab("compare")}
            disabled={isNew}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-40 whitespace-nowrap ${
              currentTab === "compare"
                ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                : "text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20"
            }`}
          >
            <GitCompare size={14} />
            <span className="hidden sm:inline">비교</span>
          </button>

          {/* 일정 탭 */}
          <button
            onClick={() => setCurrentTab("calendar")}
            disabled={isNew}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-40 whitespace-nowrap ${
              currentTab === "calendar"
                ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            }`}
          >
            <CalendarIcon size={14} />
            <span className="hidden sm:inline">일정</span>
          </button>
        </div>

        {/* 우측: 저장 버튼 + 닫기 */}
        <div className="flex items-center gap-2">
          {/* 노트 편집 중일 때만 저장 버튼 표시 */}
          {type === "note" && (
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`
                flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all
                ${
                saved
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-default"
                  : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg"
              }
                disabled:opacity-60
              `}
            >
              <Save size={14} />
              <span className="hidden sm:inline">{saving ? "저장 중..." : saved ? "저장됨" : "저장"}</span>
            </button>
          )}

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 본문 (탭 내용)*/}
      <div className="flex-1 overflow-y-auto">
        {/* 편집 탭 */}
        {currentTab === "edit" && (
          <div className="p-4 sm:p-6">
            {/* 제목 입력 (노트만 편집 가능) */}
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (type === "note") setSaved(false);
              }}
              placeholder="제목 없음"
              disabled={type !== "note"}
              className="w-full text-2xl sm:text-3xl font-bold bg-transparent outline-none mb-4 sm:mb-6 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 disabled:cursor-not-allowed"
            />

            {/* 날짜 표시 */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
              <span>
                {new Date().toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Tiptap 에디터 (노트) 또는 뷰어 (문서/음성) */}
            {editor ? (
              <EditorContent
                editor={editor}
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                  prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                  prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-4
                  prose-h3:text-base sm:prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-3
                  prose-p:text-sm sm:prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300
                  focus:outline-none min-h-[300px] sm:min-h-[500px]"
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            )}
          </div>
        )}

        {/* 요약 탭 */}
        {currentTab === "summary" && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">AI 요약</h3>
              {summaryData?.documentSummaryByFileId && (
                <button
                  onClick={handleConvertToNote}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg transition-all"
                >
                  노트로 만들기
                </button>
              )}
            </div>

            {summaryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-pink-500" size={24} />
              </div>
            ) : summaryData?.documentSummaryByFileId ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-sm sm:text-base">
                  {summaryData.documentSummaryByFileId.summaryText}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-xs sm:text-sm text-slate-500">요약 버튼을 눌러 AI 요약을 요청하세요</p>
              </div>
            )}
          </div>
        )}

        {/* 피드백 탭 */}
        {currentTab === "feedback" && (
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">AI 피드백</h3>
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-xs sm:text-sm text-slate-500">AI 피드백 기능 준비 중입니다</p>
            </div>
          </div>
        )}

        {/* 비교 탭 */}
        {currentTab === "compare" && (
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">문서 비교</h3>
            <div className="text-center py-12">
              <GitCompare size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-xs sm:text-sm text-slate-500">문서 비교 기능 준비 중입니다</p>
            </div>
          </div>
        )}

        {/* 일정 탭 */}
        {currentTab === "calendar" && <CalendarContent noteId={id} />}
      </div>

      {/* 푸터 (노트 편집 시에만 표시)*/}
      {type === "note" && currentTab === "edit" && (
        <div className="h-10 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span>{editor?.storage.characterCount?.characters() ?? 0} 글자</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{editor?.storage.characterCount?.words() ?? 0} 단어</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${saved ? "bg-green-500" : "bg-yellow-500"} ${!saved && "animate-pulse"}`} />
            <span className="hidden sm:inline">{saved ? "저장됨" : "저장 중..."}</span>
          </div>
        </div>
      )}
    </div>
  );
}