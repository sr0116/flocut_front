"use client";

import { FileText, File, Mic, Clock, MoreVertical } from "lucide-react";
import Checkbox from "@/app/components/ui/form/Checkbox";
import { useState, useRef, useEffect } from "react";

type WorkspaceListItemProps = {
    item: {
        id: string;
        type: "note" | "document" | "audio";
        title: string;
        date: string;
        noteId?: number;
        fileId?: number;
        status?: string;
    };
    sessionId: number;
    selected: boolean;
    onToggleSelect: () => void;
    onClick: () => void;
};

export default function WorkspaceListItem({
                                              item,
                                              selected,
                                              onToggleSelect,
                                              onClick,
                                          }: WorkspaceListItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    // 아이콘 매핑
    const iconMap = {
        note: <FileText size={18} className="text-accent" />,
        document: <File size={18} className="text-accent" />,
        audio: <Mic size={18} className="text-accent" />,
    };

    // 상태 배지 매핑
    const getStatusBadge = () => {
        if (item.status === "PROCESSING") {
            return (
                <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
          처리 중
        </span>
            );
        }
        if (item.status === "COMPLETED") {
            return (
                <span className="px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          완료
        </span>
            );
        }
        if (item.status === "FAILED") {
            return (
                <span className="px-2 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          실패
        </span>
            );
        }
        return null;
    };

    // 체크박스 클릭 (이벤트 전파 중지)
    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelect();
    };

    // 메뉴 버튼 클릭
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    // 메뉴 아이템 클릭
    const handleMenuAction = (action: string) => {
        setShowMenu(false);
        // TODO: 실제 액션 처리
        console.log(action, item.id);
    };

    return (
        <div
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer ${
                selected
                    ? "border-accent bg-accent-soft"
                    : "border-transparent hover:bg-accent-soft hover:border-border-light dark:hover:border-border-dark"
            }`}
            onClick={onClick}
        >
            {/* 체크박스 */}
            <div onClick={handleCheckboxClick}>
                <Checkbox checked={selected} onChange={onToggleSelect} />
            </div>

            {/* 아이콘 */}
            <div className="flex-shrink-0">{iconMap[item.type]}</div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                        {item.title}
                    </h3>
                    {getStatusBadge()}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                    <Clock size={12} />
                    {new Date(item.date).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            </div>

            {/* 우측 메뉴 버튼 */}
            <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                    onClick={handleMenuClick}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-light dark:hover:bg-surface-input transition-all"
                >
                    <MoreVertical size={16} className="text-text-muted-light dark:text-text-muted-dark" />
                </button>

                {/* 드롭다운 메뉴 */}
                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-10 py-1">
                        <button
                            onClick={() => handleMenuAction("summary")}
                            className="w-full px-4 py-2 text-left text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft transition-colors"
                        >
                            AI 요약
                        </button>
                        <button
                            onClick={() => handleMenuAction("compare")}
                            className="w-full px-4 py-2 text-left text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft transition-colors"
                        >
                            비교
                        </button>
                        <div className="h-px bg-border-light dark:bg-border-dark my-1" />
                        <button
                            onClick={() => handleMenuAction("delete")}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}