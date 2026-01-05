"use client";

import { useEffect, useState, useCallback } from "react";
import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { createNote, updateNote } from "@/lib/rest/note/notes.rest";

import VoiceRecorder from "@/app/components/ai/VoiceRecorder";
import { Loader2, Mic, Eye, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { Editor } from "@tiptap/react";
import IconButton from "@/app/components/ui/icon-button/IconButton";
import Button from "@/app/components/ui/button/Button";
import EditorToolbar from "@/app/components/notes/editor/EditorToolbar";
import TiptapEditor from "@/app/components/notes/editor/TiptapEditor";

type NoteContentProps = {
    id: string;
    sessionId: number;
    onCreated?: (noteId: number) => void;
    onSaveStatusChange?: (saved: boolean, saving: boolean) => void;
    onStatsChange?: (charCount: number, wordCount: number) => void;
};

export default function NoteContent({
                                        id,
                                        sessionId,
                                        onCreated,
                                        onSaveStatusChange,
                                        onStatsChange,
                                    }: NoteContentProps) {
    const isNew = id === "new";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [noteId, setNoteId] = useState<number | undefined>(
        isNew ? undefined : Number(id)
    );
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [isEditing, setIsEditing] = useState(true);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

    const debouncedTitle = useDebounce(title, 2000);
    const debouncedContent = useDebounce(content, 2000);

    const { note, loading } = useNoteDetail(noteId);

    // 저장 상태 전달
    useEffect(() => {
        if (onSaveStatusChange) {
            onSaveStatusChange(saved, saving);
        }
    }, [saved, saving, onSaveStatusChange]);

    // 에디터 통계 업데이트
    useEffect(() => {
        if (editor && onStatsChange) {
            const chars = editor.getText().length;
            const words = editor
                .getText()
                .trim()
                .split(/\s+/)
                .filter(Boolean).length;
            onStatsChange(chars, words);
        }
    }, [content, editor, onStatsChange]);

    // 새 노트 즉시 생성
    useEffect(() => {
        if (isNew && !isCreating && !noteId) {
            handleCreateNote();
        }
    }, [isNew, isCreating, noteId]);

    // 기존 노트 데이터 로드
    useEffect(() => {
        if (note && !initialized) {
            setTitle(note.title || "");
            setContent(note.content || "");
            setInitialized(true);
        }
    }, [note, initialized]);

    // id 변경 시 초기화
    useEffect(() => {
        setInitialized(false);
        setTitle("");
        setContent("");
        if (!isNew) {
            setNoteId(Number(id));
        }
    }, [id, isNew]);

    // 새 노트 생성
    const handleCreateNote = async () => {
        setIsCreating(true);
        setSaving(true);
        try {
            const newNoteId = await createNote({
                sessionId,
                title: "제목 없음",
                content: "",
            });
            setNoteId(newNoteId);
            setSaved(true);
            onCreated?.(newNoteId);
            toast.success("새 노트가 생성되었습니다");
        } catch (error) {
            console.error("노트 생성 실패:", error);
            toast.error("노트 생성에 실패했습니다");
        } finally {
            setIsCreating(false);
            setSaving(false);
        }
    };

    // 자동 저장
    useEffect(() => {
        if (!noteId || isCreating || saved) return;

        const shouldUpdate =
            (debouncedTitle && debouncedTitle !== note?.title) ||
            (debouncedContent && debouncedContent !== note?.content);

        if (shouldUpdate) {
            handleAutoSave();
        }
    }, [debouncedTitle, debouncedContent, noteId, isCreating, saved, note]);

    const handleAutoSave = useCallback(async () => {
        if (!noteId) return;

        setSaving(true);
        try {
            await updateNote({
                noteId,
                title: title || "제목 없음",
                content,
            });
            setSaved(true);
        } catch (error) {
            console.error("자동 저장 실패:", error);
            toast.error("저장에 실패했습니다");
        } finally {
            setSaving(false);
        }
    }, [noteId, title, content]);

    // 음성 녹음 완료
    const handleTranscriptionComplete = (text: string) => {
        if (editor) {
            editor.chain().focus().insertContent(text).run();
            setSaved(false);
        }
    };

    // 편집 모드 토글
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        if (editor) {
            editor.setEditable(!isEditing);
        }
    };

    if (loading || isCreating) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    return (
        <>
            <div className="h-full flex flex-col overflow-hidden">
                {/* 상단 액션 바 */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
                    <div className="flex items-center gap-2">
                        <IconButton
                            icon={<Mic size={14} />}
                            onClick={() => setShowVoiceRecorder(true)}
                            aria-label="음성 녹음"
                        />
                    </div>
                    <Button size="sm" variant="secondary" onClick={toggleEditMode}>
                        {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
                        {isEditing ? "보기" : "편집"}
                    </Button>
                </div>

                {/* 툴바 (편집 모드에서만 표시) */}
                {isEditing && <EditorToolbar editor={editor} />}

                {/* 본문 */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setSaved(false);
                                }}
                                placeholder="제목 없음"
                                className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-4 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark"
                            />

                            <TiptapEditor
                                content={content}
                                onChange={(html) => {
                                    setContent(html);
                                    setSaved(false);
                                }}
                                placeholder="내용을 입력하세요..."
                                onReady={setEditor}
                                editable={true}
                            />
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">
                                {title || "제목 없음"}
                            </h1>

                            <TiptapEditor
                                content={content}
                                onChange={() => {}}
                                placeholder=""
                                onReady={setEditor}
                                editable={false}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* 음성 녹음 모달 */}
            {showVoiceRecorder && (
                <VoiceRecorder
                    onClose={() => setShowVoiceRecorder(false)}
                    onTranscriptionComplete={handleTranscriptionComplete}
                />
            )}
        </>
    );
}