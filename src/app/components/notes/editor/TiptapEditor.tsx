"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {useEffect, useState} from "react";
import {TextStyle} from "@tiptap/extension-text-style";

type TiptapEditorProps = {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
    onReady?: (editor: Editor) => void;
};

export default function TiptapEditor({
                                         content,
                                         onChange,
                                         placeholder = "내용을 입력하세요...",
                                         editable = true,
                                         onReady,
                                     }: TiptapEditorProps) {
    const [isMounted, setIsMounted] = useState(false);

    // 클라이언트에서만 렌더링
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const editor = useEditor({
        immediatelyRender: false, // SSR 방지
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Highlight.configure({
                multicolor: false,
            }),
            Color,
            TextStyle,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-accent underline cursor-pointer hover:text-accent-dark",
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg my-4",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-lg max-w-none focus:outline-none min-h-[200px] text-text-primary-light dark:text-text-primary-dark",
            },
        },
    });

    // content prop 변경 시 에디터 업데이트 (무한 루프 방지)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            const { from, to } = editor.state.selection;

            editor.commands.setContent(content, {
                emitUpdate: false,
            });

            // 커서 위치 복원 (범위 검증)
            const maxPos = editor.state.doc.content.size;
            const safeFrom = Math.min(from, maxPos);
            const safeTo = Math.min(to, maxPos);

            editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
        }
    }, [content, editor]);

    // 에디터 준비 완료 시 콜백
    useEffect(() => {
        if (editor && onReady) {
            onReady(editor);
        }
    }, [editor, onReady]);

    // 에디터 정리
    useEffect(() => {
        return () => {
            if (editor) {
                editor.destroy();
            }
        };
    }, [editor]);

    // 클라이언트에서만 렌더링
    if (!isMounted || !editor) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-text-muted-light dark:text-text-muted-dark">
                <div className="text-sm">에디터 로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="tiptap-wrapper">
            <EditorContent editor={editor} />
        </div>
    );
}