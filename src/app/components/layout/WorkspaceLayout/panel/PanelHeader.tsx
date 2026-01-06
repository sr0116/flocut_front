"use client";

import { X, Save, Sparkles, MessageSquare, GitCompare, Calendar, Maximize2 } from "lucide-react";
import Button from "@/app/components/ui/button/Button";
import IconButton from "@/app/components/ui/icon-button/IconButton";
import { useRouter } from "next/navigation";

// ============================================
// Types
// ============================================

export type PanelTab = "edit" | "summary" | "feedback" | "compare" | "calendar";

type PanelHeaderProps = {
    type: "note" | "document" | "audio";
    currentTab: PanelTab;
    onChangeTab: (tab: PanelTab) => void;
    saved: boolean;
    saving: boolean;
    onSave: () => void;
    onClose: () => void;
    sessionId: number;
    noteId?: number;
};

// ============================================
// Main Component
// ============================================

export default function PanelHeader({
                                        type,
                                        currentTab,
                                        onChangeTab,
                                        saved,
                                        saving,
                                        onSave,
                                        onClose,
                                        sessionId,
                                        noteId,
                                    }: PanelHeaderProps) {
    // --------------------------------------------
    // Router
    // --------------------------------------------

    const router = useRouter();

    // --------------------------------------------
    // Render
    // --------------------------------------------

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">

            {/* 좌측: 탭 */}
            <div className="flex items-center gap-1 overflow-x-auto">
                <TabButton
                    label="편집"
                    active={currentTab === "edit"}
                    onClick={() => onChangeTab("edit")}
                />
                <TabButton
                    label="요약"
                    icon={<Sparkles size={14} />}
                    active={currentTab === "summary"}
                    onClick={() => onChangeTab("summary")}
                    disabled={type !== "note"}
                />
                <TabButton
                    label="피드백"
                    icon={<MessageSquare size={14} />}
                    active={currentTab === "feedback"}
                    onClick={() => onChangeTab("feedback")}
                    disabled={type !== "note"}
                />
                <TabButton
                    label="비교"
                    icon={<GitCompare size={14} />}
                    active={currentTab === "compare"}
                    onClick={() => onChangeTab("compare")}
                    disabled={true} // 비교 기능 비활성화
                    badge="준비중" // 준비중 뱃지
                />
                <TabButton
                    label="일정"
                    icon={<Calendar size={14} />}
                    active={currentTab === "calendar"}
                    onClick={() => onChangeTab("calendar")}
                    disabled={type !== "note"}
                />
            </div>

            {/* 우측: 액션 버튼 */}
            <div className="flex items-center gap-2">

                {/* 전체 화면으로 열기 */}
                {type === "note" && noteId && (
                    <IconButton
                        icon={<Maximize2 size={16} />}
                        onClick={() => router.push(`/workspace/${sessionId}/notes/${noteId}`)}
                        aria-label="전체 화면"
                    />
                )}

                {/* 저장 버튼 */}
                {type === "note" && (
                    <Button
                        size="sm"
                        variant={saved ? "secondary" : "primary"}
                        loading={saving}
                        disabled={saved}
                        onClick={onSave}
                    >
                        <Save size={14} />
                        {saved ? "저장됨" : "저장"}
                    </Button>
                )}

                {/* 닫기 */}
                <IconButton icon={<X size={16} />} onClick={onClose} aria-label="닫기" />
            </div>
        </div>
    );
}

// ============================================
// Sub Components
// ============================================

function TabButton({
                       label,
                       icon,
                       active,
                       disabled,
                       badge,
                       onClick,
                   }: {
    label: string;
    icon?: React.ReactNode;
    active: boolean;
    disabled?: boolean;
    badge?: string;
    onClick: () => void;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`
        relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap
        ${
                active
                    ? "bg-accent text-white"
                    : "text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft"
            }
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>

            {/* 준비중 뱃지 */}
            {badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-yellow-500 text-white">
          {badge}
        </span>
            )}
        </button>
    );
}