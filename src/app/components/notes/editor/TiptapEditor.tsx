"use client";

import { EditorContent, Editor } from "@tiptap/react";

interface TiptapEditorProps {
  editor: Editor | null;
}

export default function TiptapEditor({ editor }: TiptapEditorProps) {
  if (!editor) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-slate-400">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <EditorContent
      editor={editor}
      className="tiptap-editor prose prose-slate dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
                prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
                prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
                prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                prose-li:my-1 prose-li:text-slate-700 dark:prose-li:text-slate-300
                prose-blockquote:border-l-4 prose-blockquote:border-pink-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800
                prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600 dark:prose-code:text-pink-400
                prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-lg
                prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-bold
                prose-em:italic prose-em:text-slate-700 dark:prose-em:text-slate-300
                prose-a:text-pink-600 dark:prose-a:text-pink-400 prose-a:no-underline hover:prose-a:underline
                prose-hr:border-slate-200 dark:prose-hr:border-slate-800 prose-hr:my-8
                focus:outline-none min-h-[500px]"
    />
  );
}