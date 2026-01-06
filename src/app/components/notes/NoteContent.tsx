"use client";

import { useEffect, useState, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { Loader2, Mic } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useNotesByStatus } from "@/hooks/notes/useNotesByStatus";
import { useDebounce } from "@/hooks/useDebounce";

// API
import { createNote, updateNote } from "@/lib/rest/note/notes.rest";

// Components
import TiptapEditor from "@/app/components/notes/editor/TiptapEditor";
import VoiceRecorder from "@/app/components/ai/VoiceRecorder";
import IconButton from "@/app/components/ui/icon-button/IconButton";

// ============================================
// Types
// ============================================

type NoteContentProps = {
    id: string; // "new" 또는 noteId
    sessionId: number;
    onCreated?: (noteId: number) => void;
    onSaveStatusChange?: (saved: boolean, saving: boolean) => void;
    onStatsChange?: (charCount: number, wordCount: number) => void;
};

// ============================================
// Main Component
// ============================================

export default function NoteContent({
                                        id,
                                        sessionId,
                                        onCreated,
                                        onSaveStatusChange,
                                        onStatsChange,
                                    }: NoteContentProps) {
    // --------------------------------------------
    // State - 기본
    // --------------------------------------------

    const isNew = id === "new";
    const [noteId, setNoteId] = useState<number | undefined>(
        isNew ? undefined : Number(id)
    );

    // --------------------------------------------
    // State - 에디터
    // --------------------------------------------

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editor, setEditor] = useState<Editor | null>(null);

    // --------------------------------------------
    // State - 저장
    // --------------------------------------------

    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);

    // --------------------------------------------
    // State - 초기화
    // --------------------------------------------

    const [isCreating, setIsCreating] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // --------------------------------------------
    // State - UI
    // --------------------------------------------

    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

    // --------------------------------------------
    // Debounced Values
    // --------------------------------------------

    const debouncedTitle = useDebounce(title, 2000);
    const debouncedContent = useDebounce(content, 2000);

    // --------------------------------------------
    // GraphQL Query
    // --------------------------------------------

    const { note, loading } = useNotesByStatus(noteId);

    // --------------------------------------------
    // Effects - 저장 상태 전달
    // --------------------------------------------

    useEffect(() => {
        onSaveStatusChange?.(saved, saving);
    }, [saved, saving, onSaveStatusChange]);

    // --------------------------------------------
    // Effects - 에디터 통계 업데이트
    // --------------------------------------------

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

    // --------------------------------------------
    // Effects - 새 노트 즉시 생성
    // --------------------------------------------

    useEffect(() => {
        if (isNew && !isCreating && !noteId) {
            handleCreateNote();
        }
    }, [isNew, isCreating, noteId]);

    // --------------------------------------------
    // Effects - 기존 노트 데이터 로드
    // --------------------------------------------

    useEffect(() => {
        if (note && !initialized) {
            setTitle(note.title || "");
            setContent(note.content || "");
            setInitialized(true);
        }
    }, [note, initialized]);

    // --------------------------------------------
    // Effects - id 변경 시 초기화
    // --------------------------------------------

    useEffect(() => {
        setInitialized(false);
        setTitle("");
        setContent("");
        if (!isNew) {
            setNoteId(Number(id));
        }
    }, [id, isNew]);

    // --------------------------------------------
    // Effects - 자동 저장
    // --------------------------------------------

    useEffect(() => {
        if (!noteId || isCreating || saved) return;

        const shouldUpdate =
            (debouncedTitle && debouncedTitle !== note?.title) ||
            (debouncedContent && debouncedContent !== note?.content);

        if (shouldUpdate) {
            handleAutoSave();
        }
    }, [debouncedTitle, debouncedContent, noteId, isCreating, saved, note]);

    // --------------------------------------------
    // Handlers - 노트 생성
    // --------------------------------------------

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

    // --------------------------------------------
    // Handlers - 자동 저장
    // --------------------------------------------

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

    // --------------------------------------------
    // Handlers - 음성 녹음 완료
    // --------------------------------------------

    const handleTranscriptionComplete = (text: string) => {
        if (editor) {
            editor.chain().focus().insertContent(text).run();
            setSaved(false);
        }
    };

    // --------------------------------------------
    // Handlers - 제목 변경
    // --------------------------------------------

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setSaved(false);
    };

    // --------------------------------------------
    // Handlers - 내용 변경
    // --------------------------------------------

    const handleContentChange = (html: string) => {
        setContent(html);
        setSaved(false);
    };

    // --------------------------------------------
    // Render - Loading
    // --------------------------------------------

    if (loading || isCreating) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    // --------------------------------------------
    // Render - Main
    // --------------------------------------------

    return (
        <>
            {/* 메인 컨테이너 */}
            <div className="h-full flex flex-col overflow-hidden">

                {/* 상단 액션 바 */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
                    <div className="flex items-center gap-2">
                        {/* 음성 녹음 버튼 */}
                        <IconButton
                            icon={<Mic size={14} />}
                            onClick={() => setShowVoiceRecorder(true)}
                            aria-label="음성 녹음"
                        />
                    </div>
                </div>

                {/* 본문 영역 */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* 제목 입력 */}
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="제목 없음"
                        className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-4 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark"
                    />

                    {/* 에디터 (Bubble Menu 포함) */}
                    <TiptapEditor
                        content={content}
                        onChange={handleContentChange}
                        placeholder="내용을 입력하세요..."
                        onReady={setEditor}
                        editable={true}
                        showMobileToolbar={false} // 패널에서는 모바일 툴바 숨김
                    />
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