"use client";

import { EditorContent, Editor } from "@tiptap/react";
import LoadingSpinner from "@/app/components/layout/loading/LoadingSpinner";

interface Props {
  editor: Editor | null;
}

export default function TiptapEditor({ editor }: Props) {
  if (!editor) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <EditorContent
      editor={editor}
      className="tiptap-editor prose prose-slate dark:prose-invert max-w-none focus:outline-none"
    />
  );
}
