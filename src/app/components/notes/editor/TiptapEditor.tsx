"use client";

import { EditorContent, Editor } from "@tiptap/react";
import { useEffect } from "react";

// 1. Props 타입 정의
type TiptapEditorProps = {
    editor: Editor | null;
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
};

export default function TiptapEditor({
                                         editor,
                                         content,
                                         onChange,
                                     }: TiptapEditorProps) {

    useEffect(() => {
        // 부모의 데이터가 변경되었을 때 에디터 내용 동기화
        if (editor && content !== editor.getHTML()) {
            // 사용자가 입력 중일 때 커서가 튀는 것을 방지하기 위해
            // 현재 에디터 내용과 전달받은 내용이 다를 때만 업데이트
            // 수정: false 대신 { emitUpdate: false } 객체를 전달
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    if (!editor) return null;

    return (
        <EditorContent
            editor={editor}
            className="prose prose-lg max-w-none focus:outline-none"
        />
    );
}