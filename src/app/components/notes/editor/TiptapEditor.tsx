"use client";

import { EditorContent, Editor } from "@tiptap/react";

interface TiptapEditorProps {
  editor: Editor | null;
}

export default function TiptapEditor({ editor }: TiptapEditorProps) {
  if (!editor) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-text-muted-light">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <EditorContent
      editor={editor}
      className="prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-4"
    />
  );
}
