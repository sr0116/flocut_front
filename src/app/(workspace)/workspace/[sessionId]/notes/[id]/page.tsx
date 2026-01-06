"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
    X,
    Save,
    Mic,
    Sparkles,
    MessageSquare,
    GitCompare,
    PanelRight,
    Loader2,
    Eye,
    Edit3,
} from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useNotesByStatus } from "@/hooks/notes/useNotesByStatus";
import { useDebounce } from "@/hooks/useDebounce";

// API
import { createNote, updateNote } from "@/lib/rest/note/notes.rest";

// Components
import FullPageToolbar from "@/app/components/notes/editor/FullPageToolbar";
import TiptapEditor from "@/app/components/notes/editor/TiptapEditor";
import VoiceRecorder from "@/app/components/ai/VoiceRecorder";
import Button from "@/app/components/ui/button/Button";
import IconButton from "@/app/components/ui/icon-button/IconButton";

// ============================================
// Main Component - NoteDetailPage
// ============================================

export default function NoteDetailPage() {
    // --------------------------------------------
    // Router
    // --------------------------------------------

    const router = useRouter();
    const { sessionId, id } = useParams<{ sessionId: string; id: string }>();

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
    const [isEditing, setIsEditing] = useState(true);

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

    const [rightPanelOpen, setRightPanelOpen] = useState(false);
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
    // Effects - 새 노트 생성
    // --------------------------------------------

    useEffect(() => {
        if (isNew && !isCreating && !noteId) {
            handleCreateNote();
        }
    }, [isNew, isCreating, noteId]);

    // --------------------------------------------
    // Effects - 기존 노트 로드
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
                sessionId: Number(sessionId),
                title: "제목 없음",
                content: "",
            });

            setNoteId(newNoteId);
            router.replace(`/workspace/${sessionId}/notes/${newNoteId}`);
            setSaved(true);
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
    // Handlers - 편집 모드 토글
    // --------------------------------------------

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        if (editor) {
            editor.setEditable(!isEditing);
        }
    };

    // --------------------------------------------
    // Handlers - 닫기
    // --------------------------------------------

    const handleClose = () => {
        router.push(`/workspace/${sessionId}`);
    };

    // --------------------------------------------
    // Computed - 통계
    // --------------------------------------------

    const charCount = editor?.getText().length ?? 0;
    const wordCount =
        editor
            ?.getText()
            .trim()
            .split(/\s+/)
            .filter(Boolean).length ?? 0;

    // --------------------------------------------
    // Render - Loading
    // --------------------------------------------

    if (loading || isCreating) {
        return (
            <div className="h-full flex items-center justify-center bg-white dark:bg-background-dark">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    // --------------------------------------------
    // Render - Main
    // --------------------------------------------

    return (
        <>
            <div className="h-full flex overflow-hidden">

                {/* ========== 메인 에디터 영역 ========== */}
                <div className="flex-1 flex flex-col bg-white dark:bg-background-dark">

                    {/* 상단 툴바 */}
                    <div className="h-14 flex items-center justify-between px-4 border-b border-border-light dark:border-border-dark">

                        {/* 좌측 - 음성 녹음 */}
                        <div className="flex items-center gap-2">
                            <IconButton
                                icon={<Mic size={16} />}
                                onClick={() => setShowVoiceRecorder(true)}
                                aria-label="음성 녹음"
                            />
                        </div>

                        {/* 우측 - 액션 버튼들 */}
                        <div className="flex items-center gap-2">

                            {/* 편집/보기 모드 토글 */}
                            <Button size="sm" variant="secondary" onClick={toggleEditMode}>
                                {isEditing ? (
                                    <>
                                        <Eye size={14} />
                                        <span className="hidden sm:inline">보기</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit3 size={14} />
                                        <span className="hidden sm:inline">편집</span>
                                    </>
                                )}
                            </Button>

                            <div className="w-px h-6 bg-border-light dark:border-border-dark" />

                            {/* AI 기능 버튼들 */}
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setRightPanelOpen(true)}
                            >
                                <Sparkles size={14} />
                                <span className="hidden sm:inline">요약</span>
                            </Button>

                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setRightPanelOpen(true)}
                            >
                                <MessageSquare size={14} />
                                <span className="hidden sm:inline">피드백</span>
                            </Button>

                            {/* 비교 기능 - 준비중 (비활성화) */}
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled
                                title="준비 중입니다"
                            >
                                <GitCompare size={14} />
                                <span className="hidden sm:inline">비교</span>
                            </Button>

                            <div className="w-px h-6 bg-border-light dark:border-border-dark" />

                            {/* 저장 버튼 */}
                            <Button
                                size="sm"
                                variant={saved ? "secondary" : "primary"}
                                loading={saving}
                                disabled={saved}
                                onClick={handleAutoSave}
                            >
                                <Save size={14} />
                                {saved ? "저장됨" : "저장"}
                            </Button>

                            {/* 패널 토글 */}
                            <IconButton
                                icon={<PanelRight size={16} />}
                                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                                aria-label="패널 토글"
                            />

                            {/* 닫기 */}
                            <IconButton
                                icon={<X size={16} />}
                                onClick={handleClose}
                                aria-label="닫기"
                            />
                        </div>
                    </div>

                    {/* 풀 툴바 (편집 모드일 때만) */}
                    {isEditing && <FullPageToolbar editor={editor} />}

                    {/* 본문 */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                        {isEditing ? (
                            <>
                                {/* 편집 모드 - 제목 입력 */}
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        setSaved(false);
                                    }}
                                    placeholder="제목 없음"
                                    className="w-full text-3xl sm:text-4xl font-bold bg-transparent border-none outline-none mb-6 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark"
                                />

                                {/* 편집 모드 - 에디터 */}
                                <TiptapEditor
                                    content={content}
                                    onChange={(html) => {
                                        setContent(html);
                                        setSaved(false);
                                    }}
                                    placeholder="내용을 입력하세요..."
                                    onReady={setEditor}
                                    editable={true}
                                    showMobileToolbar={true} // 전체화면에서는 모바일 툴바 표시
                                />
                            </>
                        ) : (
                            <>
                                {/* 보기 모드 - 제목 */}
                                <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-text-primary-light dark:text-text-primary-dark">
                                    {title || "제목 없음"}
                                </h1>

                                {/* 보기 모드 - 읽기 전용 에디터 */}
                                <div className="prose prose-lg max-w-none">
                                    <TiptapEditor
                                        content={content}
                                        onChange={() => {}}
                                        placeholder=""
                                        onReady={setEditor}
                                        editable={false}
                                        showMobileToolbar={false}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* 하단 Footer - 통계 & 저장 상태 */}
                    <div className="h-10 flex items-center justify-between px-4 sm:px-6 text-xs border-t border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark">

                        {/* 좌측 - 통계 */}
                        <div className="flex items-center gap-3">
                            <span>{charCount.toLocaleString()}자</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">
                {wordCount.toLocaleString()}단어
              </span>
                        </div>

                        {/* 우측 - 저장 상태 */}
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    saving
                                        ? "bg-yellow-500 animate-pulse"
                                        : saved
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                }`}
                            />
                            <span className="hidden sm:inline">
                {saving ? "저장 중..." : saved ? "자동 저장됨" : "저장 안됨"}
              </span>
                        </div>
                    </div>
                </div>

                {/* ========== 우측 사이드 패널 (AI 기능) ========== */}
                {rightPanelOpen && (
                    <div className="w-80 sm:w-96 border-l border-border-light dark:border-border-dark bg-white dark:bg-surface-dark overflow-y-auto">

                        {/* 패널 헤더 */}
                        <div className="sticky top-0 bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                                AI 요약
                            </h3>
                            <IconButton
                                icon={<X size={16} />}
                                onClick={() => setRightPanelOpen(false)}
                                aria-label="닫기"
                            />
                        </div>

                        {/* 패널 본문 */}
                        <div className="p-4">
                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                요약 기능 준비 중입니다.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ========== 음성 녹음 모달 ========== */}
            {showVoiceRecorder && (
                <VoiceRecorder
                    onClose={() => setShowVoiceRecorder(false)}
                    onTranscriptionComplete={handleTranscriptionComplete}
                />
            )}
        </>
    );
}