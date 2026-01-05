"use client";

import { Editor } from "@tiptap/react";
import {
    Bold, Italic, Underline as UnderlineIcon,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote,
    AlignLeft, AlignCenter, AlignRight, Highlighter,
    Sparkles, Sidebar
} from "lucide-react";

type EditorToolbarProps = {
    editor: Editor | null;
    isEditing?: boolean;
    saving?: boolean;
    saved?: boolean;
    onSave?: () => Promise<void>;
    onToggleEdit?: () => void;
    onAIAction?: (mode: "summary" | "compare" | "feedback") => void;
    onToggleRightPanel?: () => void;
    rightPanelOpen?: boolean;
    editorContent?: string;
};

export default function EditorToolbar({
                                          editor,
                                          saving,
                                          saved,
                                          onAIAction,
                                          onToggleRightPanel,
                                          rightPanelOpen
                                      }: EditorToolbarProps) {
    if (!editor) return null;

    // onClick 타입을 선택적으로 변경하여 에러 해결
    const ToolButton = ({
                            icon: Icon,
                            onClick,
                            active,
                            disabled
                        }: {
        icon: any;
        onClick?: () => void; // 필수(() => void)에서 선택적(? 추가)으로 변경
        active?: boolean;
        disabled?: boolean;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${
                active
                    ? "bg-accent text-white"
                    : "hover:bg-surface-light dark:hover:bg-surface-input text-text-primary-light dark:text-text-primary-dark"
            } disabled:opacity-50`}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="flex flex-wrap items-center justify-between gap-1 px-4 py-2 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
            {/* 왼쪽: 텍스트 포맷팅 도구 */}
            <div className="flex items-center gap-1">
                <ToolButton
                    icon={Bold}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                />
                <ToolButton
                    icon={Italic}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                />
                <ToolButton
                    icon={UnderlineIcon}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                />
                <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1" />
                <ToolButton
                    icon={Highlighter}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    active={editor.isActive("highlight")}
                />
            </div>

            {/* 오른쪽: 액션 도구 (저장 상태, AI, 패널 토글) */}
            <div className="flex items-center gap-2">
                <div className="text-xs text-text-muted-light dark:text-text-muted-dark mr-2">
                    {saving ? "저장 중..." : saved ? "저장 완료" : "변경됨"}
                </div>

                <button
                    onClick={() => onAIAction?.("summary")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-accent-soft text-accent rounded-md text-sm hover:bg-accent hover:text-white transition-all"
                >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">AI 요약</span>
                </button>

                <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1" />

                {/* 우측 패널 토글 - 이제 undefined가 전달되어도 에러가 나지 않습니다 */}
                <ToolButton
                    icon={Sidebar}
                    onClick={onToggleRightPanel}
                    active={rightPanelOpen}
                />
            </div>
        </div>
    );
}