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
import EditorFooter from "./EditorFooter";
import TiptapEditor from "./TiptapEditor";
import { Loader2 } from "lucide-react";
import { createNote, updateNote } from "@/lib/rest/note/notes.api";
import { useNoteDetail } from "@/hooks/notes/useNoteDetail";

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

  const { note, loading } = useNoteDetail(isNew ? undefined : Number(noteId));

  const editor = useEditor({
    editable: true,
    immediatelyRender: false,
    extensions: [
      StarterKit,

      // 텍스트 스타일
      Underline,
      Highlight,

      // 색상 관련 (setColor)
      TextStyle,
      Color,

      // 정렬 (setTextAlign)
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    onUpdate: () => {
      setSaved(false);
    },
  });

  useEffect(() => {
    if (!note || isNew || initialized || !editor) return;

    setTitle(note.title);
    editor.commands.setContent(note.content ?? "<p></p>");
    setInitialized(true);
  }, [note, isNew, initialized, editor]);

  // Auto-save after 2 seconds
  useEffect(() => {
    if (saved || !editor) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [saved, editor, title]);

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

  if (!isNew && loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
      <EditorToolbar
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

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 md:px-16 py-12">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
            placeholder="제목 없음"
            className="w-full text-4xl font-bold bg-transparent outline-none mb-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700"
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

          <TiptapEditor editor={editor} />
        </div>
      </div>

      <EditorFooter content={editor?.getText() ?? ""} />
    </div>
  );
}
