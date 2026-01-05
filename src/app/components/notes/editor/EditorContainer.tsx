"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

import EditorToolbar from "./EditorToolbar";
import EditorFormattingToolbar from "./toolbar/EditorFormattingToolbar";
import TiptapEditor from "./TiptapEditor";
import PanelFooter from "../../layout/WorkspaceLayout/panel/PanelFooter";


import { createNote, updateNote } from "@/lib/rest/note/notes.api";
import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import LoadingSpinner from "@/app/components/layout/loading/LoadingSpinner";

interface Props {
  noteId: string;
  sessionId: number;
  isNew: boolean;
  onCreated: (noteId: number) => void;
  onAIAction: (mode: "summary" | "feedback" | "compare") => void;
  onToggleRightPanel: () => void;
  rightPanelOpen: boolean;
}

export default function EditorContainer({
                                          noteId,
                                          sessionId,
                                          isNew,
                                          onCreated,
                                          onAIAction,
                                          onToggleRightPanel,
                                          rightPanelOpen,
                                        }: Props) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 신규 노트가 아닐 때만 상세 조회
  const { note, loading } = useNoteDetail(
    isNew ? undefined : Number(noteId)
  );

  // Tiptap 에디터 인스턴스
  const editor = useEditor({
    editable: true,
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
      setSaved(false);
    },
  });

  // 기존 노트 로딩 시 에디터 초기화
  useEffect(() => {
    if (!note || isNew || initialized || !editor) return;

    setTitle(note.title ?? "");
    editor.commands.setContent(note.content ?? "<p></p>");
    setInitialized(true);
  }, [note, isNew, initialized, editor]);

  // 자동 저장 (2초 디바운스)
  useEffect(() => {
    if (saved || !editor) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [saved, editor, title]);

  // 저장 처리
  const handleSave = async () => {
    if (!editor || saving) return;

    setSaving(true);

    try {
      const content = editor.getHTML();

      if (isNew) {
        const newNoteId = await createNote({
          sessionId,
          title: title || "제목 없음",
          content,
        });
        onCreated(newNoteId);
      } else {
        await updateNote({
          noteId: Number(noteId),
          title,
          content,
        });
      }

      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  // 기존 노트 로딩 상태
  if (!isNew && loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
      {/* 상단 액션 툴바 */}
        <EditorToolbar
            editor={editor} // 이 부분이 누락되어 있었을 가능성이 큽니다.
            isEditing={true}
            saving={saving}
            saved={saved}
            onSave={handleSave}
            onToggleEdit={() => {}}
            onAIAction={onAIAction}
            onToggleRightPanel={onToggleRightPanel}
            rightPanelOpen={rightPanelOpen}
            editorContent={editor?.getHTML() ?? ""}
        />

      {/* 포맷팅 툴바 */}
      <EditorFormattingToolbar editor={editor} />

      {/* 에디터 본문 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-16 py-10">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
            placeholder="제목 없음"
            className="w-full text-3xl sm:text-4xl font-bold bg-transparent outline-none mb-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />

          <div className="text-sm text-slate-500 dark:text-slate-400 mb-8 border-b pb-4">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

            // src/app/components/notes/editor/EditorContainer.tsx 내 렌더링 부분 수정

            <EditorToolbar
                editor={editor}
                isEditing={true}
                saving={saving}
                saved={saved}
                onSave={handleSave}
                onToggleEdit={() => {}}
                onAIAction={onAIAction}
                onToggleRightPanel={onToggleRightPanel}
                rightPanelOpen={rightPanelOpen}
                editorContent={editor?.getHTML() ?? ""}
            />
        </div>
      </div>

      {/* 패널/페이지 공용 Footer */}
      <PanelFooter
        saved={saved}
        charCount={editor?.getText().length ?? 0}
        wordCount={
          editor
            ? editor.getText().trim().split(/\s+/).filter(Boolean).length
            : 0
        }
      />

    </div>
  );
}
