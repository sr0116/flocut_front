"use client";

import { useEffect, useState, useCallback } from "react";
import { createNote, updateNote } from "@/lib/rest/note/notes.api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "@/app/components/notes/editor/EditorToolbar";
import TiptapEditor from "@/app/components/notes/editor/TiptapEditor";
import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { TextStyle } from "@tiptap/extension-text-style";

type NoteContentProps = {
    noteId: string;
    sessionId: number;
    tab: string;
    onCreated?: (noteId: number) => void;
};

export default function NoteContent({
                                        noteId,
                                        sessionId,
                                        tab,
                                        onCreated,
                                    }: NoteContentProps) {
    const isNew = noteId === "new";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const [currentNoteId, setCurrentNoteId] = useState<number | null>(
        isNew ? null : Number(noteId)
    );

    const debouncedTitle = useDebounce(title, 2000);
    const debouncedContent = useDebounce(content, 2000);

    const { note, loading } = useNoteDetail(currentNoteId ?? undefined);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Highlight.configure({ multicolor: false }),
            Color,
            TextStyle,
            Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
        ],
        content: "",
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    useEffect(() => {
        if (isNew && !isCreating && !currentNoteId) {
            handleCreateNote();
        }
    }, [isNew, currentNoteId]);

    useEffect(() => {
        if (note) {
            setTitle(note.title || "");
            setContent(note.content || "");
            // 수정된 부분: false 대신 객체 { emitUpdate: false } 전달
            if (editor && editor.getHTML() !== note.content) {
                editor.commands.setContent(note.content || "", { emitUpdate: false });
            }
        }
    }, [note, editor]);

    const handleCreateNote = async () => {
        setIsCreating(true);
        try {
            const newId = await createNote({
                sessionId,
                title: "제목 없음",
                content: "",
            });
            setCurrentNoteId(newId);
            onCreated?.(newId);
            toast.success("새 노트가 생성되었습니다");
        } catch (error) {
            console.error("노트 생성 실패:", error);
            toast.error("노트 생성에 실패했습니다");
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        if (!currentNoteId || isCreating) return;

        const isTitleChanged = debouncedTitle !== undefined && debouncedTitle !== (note?.title || "");
        const isContentChanged = debouncedContent !== undefined && debouncedContent !== (note?.content || "");

        if (isTitleChanged || isContentChanged) {
            handleAutoSave();
        }
    }, [debouncedTitle, debouncedContent]);

    const handleAutoSave = useCallback(async () => {
        if (!currentNoteId) return;

        try {
            await updateNote({
                noteId: currentNoteId,
                title: title || "제목 없음",
                content,
            });
        } catch (error) {
            console.error("자동 저장 실패:", error);
        }
    }, [currentNoteId, title, content]);

    if (loading || isCreating) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-background-dark overflow-hidden">
            <EditorToolbar editor={editor} />

            <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b border-border-light dark:border-border-dark">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목 없음"
                    className="w-full text-4xl font-bold bg-transparent border-none outline-none text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark"
                />
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-4">
                <TiptapEditor
                    editor={editor}
                    content={content}
                    onChange={setContent}
                />
            </div>
        </div>
    );
}