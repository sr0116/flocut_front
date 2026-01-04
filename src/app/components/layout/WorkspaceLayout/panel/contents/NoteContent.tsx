"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { createNote, updateNote } from "@/lib/rest/note/notes.api";

import { PanelTab } from "../PanelHeader";
import LoadingSpinner from "@/app/components/layout/loading/LoadingSpinner";

interface Props {
  noteId: string;
  sessionId: number;
  tab: PanelTab;
  onCreated: (noteId: number) => void;
}

export default function NoteContent({
                                      noteId,
                                      sessionId,
                                      tab,
                                      onCreated,
                                    }: Props) {
  const isNew = noteId === "new";

  const { note, loading } = useNoteDetail(
    isNew ? undefined : Number(noteId)
  );

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [initialized, setInitialized] = useState(false);

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

  // 노트 초기 로딩
  useEffect(() => {
    if (!note || isNew || initialized || !editor) return;

    setTitle(note.title || "");
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

  if (loading || !editor) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (tab !== "edit") {
    return null;
  }

  return (
    <div className="p-4 sm:p-6">
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setSaved(false);
        }}
        placeholder="제목 없음"
        className="
          w-full text-2xl sm:text-3xl font-bold
          bg-transparent outline-none mb-6
          text-text-primary-light dark:text-text-primary-dark
        "
      />

      <EditorContent
        editor={editor}
        className="
          prose prose-slate dark:prose-invert max-w-none
          focus:outline-none min-h-[400px]
        "
      />
    </div>
  );
}
