"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
  const [initialized, setInitialized] = useState(false);

  const { note, loading } = useNoteDetail(
    isNew ? undefined : Number(noteId)
  );

  const editor = useEditor({
    editable: true,
    immediatelyRender: false,
    extensions: [StarterKit],
  });

  // 최초 1회만 서버 데이터 반영
  useEffect(() => {
    if (!note || isNew || initialized || !editor) return;

    setTitle(note.title);
    editor.commands.setContent(note.content ?? "<p></p>");
    setInitialized(true);
  }, [note, isNew, initialized, editor]);

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
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <EditorToolbar
        isEditing
        editorContent=""
        onAIAction={onAIAction}
        onToggleRightPanel={onToggleRightPanel}
        rightPanelOpen={rightPanelOpen}
        onSave={handleSave}
        saving={saving}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-16 py-16">
          {/* 제목 */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 없음"
            className="w-full text-5xl font-bold bg-transparent outline-none mb-6"
          />

          {/* 본문 */}
          <TiptapEditor editor={editor} />
        </div>
      </div>

      <EditorFooter content={editor?.getText() ?? ""} />
    </div>
  );
}
