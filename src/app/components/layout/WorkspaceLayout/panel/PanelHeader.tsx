"use client";

import { X, Save, Sparkles, MessageSquare, GitCompare, Calendar, Maximize2 } from "lucide-react";
import Button from "@/app/components/ui/button/Button";
import IconButton from "@/app/components/ui/icon-button/IconButton";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

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
                    disabled={type !== "note"}
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

// 탭 버튼
function TabButton({
                       label,
                       icon,
                       active,
                       disabled,
                       onClick,
                   }: {
    label: string;
    icon?: React.ReactNode;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap
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
        </button>
    );
}