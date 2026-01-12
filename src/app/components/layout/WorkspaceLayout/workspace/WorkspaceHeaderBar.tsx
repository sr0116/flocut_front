"use client";

import Button from "@/app/components/ui/button/Button";
import FileUploadButton from "@/app/components/files/FileUploadButton";
import {
    Plus,
    Layers,
    FileText,
    File,
    Mic,
} from "lucide-react";
import { WorkspaceFilter } from "@/hooks/workspace/workspace";
import { useMediaQuery } from "@/hooks/common/useMediaQuery";

type Props = {
    filter: WorkspaceFilter;
    onChangeFilter: (f: WorkspaceFilter) => void;
    selectedCount: number;
    onClearSelection: () => void;

    sessionId: number;
    onUploaded: () => void;
    onNewNote: () => void;
};

export default function WorkspaceHeaderBar({
                                               filter,
                                               onChangeFilter,
                                               selectedCount,
                                               onClearSelection,
                                               sessionId,
                                               onUploaded,
                                               onNewNote,
                                           }: Props) {
    /** 반응형 기준 (패널 좁아질 때) */
    const isCompact = useMediaQuery("(max-width: 900px)");

    const filters: {
        key: WorkspaceFilter;
        label: string;
        icon: React.ReactNode;
    }[] = [
        { key: "all", label: "전체", icon: <Layers size={16} /> },
        { key: "note", label: "노트", icon: <FileText size={16} /> },
        { key: "document", label: "문서", icon: <File size={16} /> },
        { key: "audio", label: "음성", icon: <Mic size={16} /> },
    ];

    return (
        <div className="bg-white dark:bg-surface-dark border-b">
            <div className="px-4 lg:px-8 py-4 flex justify-between items-center gap-2">
                {/*  필터 */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {filters.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => onChangeFilter(key)}
                            aria-label={label}
                            title={label}
                            className={`
                flex items-center gap-1.5
                ${isCompact ? "w-9 h-9 justify-center" : "px-4 py-1.5"}
                rounded-lg text-sm font-semibold
                transition-colors whitespace-nowrap
                ${
                                filter === key
                                    ? "bg-accent text-white"
                                    : "text-text-muted-light hover:bg-accent-soft"
                            }
              `}
                        >
                            {icon}
                            {!isCompact && <span>{label}</span>}
                        </button>
                    ))}
                </div>

                {/*  우측 액션 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {selectedCount > 0 && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onClearSelection}
                            aria-label="선택 해제"
                            title="선택 해제"
                        >
                            {!isCompact ? "선택 해제" : "✕"}
                        </Button>
                    )}

                    {/* 업로드: 반응형일 때만 아이콘 */}
                    <FileUploadButton
                        sessionId={sessionId}
                        onUploadComplete={onUploaded}
                        iconOnly={isCompact}
                    />

                    {/* 새 노트 */}
                    <Button
                        size="sm"
                        onClick={onNewNote}
                        aria-label="새 노트"
                        title="새 노트"
                    >
                        <Plus size={16} />
                        {!isCompact && <span className="ml-1">새 노트</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
