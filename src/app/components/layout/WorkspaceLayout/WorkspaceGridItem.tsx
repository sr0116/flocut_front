"use client";

import { FileText, Mic, File, Calendar, MoreVertical } from "lucide-react";
import Checkbox from "@/app/components/ui/form/Checkbox";
import { useState, useRef, useEffect } from "react";

// WorkspaceItem 타입 (부모에서 전달받는 데이터 형식)
type WorkspaceItem = {
    id: string;
    type: "note" | "document" | "audio";
    title: string;
    date: string;
    sourceType?: string;
    fileId?: number;
    noteId?: number;
    status?: string;
};

// Props 정의
type Props = {
    item: WorkspaceItem;
    sessionId: number;
    selected: boolean;
    onToggleSelect: () => void;
    onClick: () => void;
};

// 메인 컴포넌트
export default function WorkspaceGridItem({
                                              item,
                                              sessionId,
                                              selected,
                                              onToggleSelect,
                                              onClick,
                                          }: Props) {
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

    // 타입별 아이콘 (그리드는 큰 아이콘 사용)
    const getIcon = () => {
        switch (item.type) {
            case "audio":
                return <Mic size={32} className="text-accent" />;
            case "document":
                return <File size={32} className="text-accent" />;
            default:
                return <FileText size={32} className="text-accent" />;
        }
    };

    // 타입별 라벨
    const getTypeLabel = () => {
        switch (item.type) {
            case "audio":
                return "음성";
            case "document":
                return "문서";
            default:
                return "노트";
        }
    };

    // 상태 배지
    const getStatusBadge = () => {
        if (item.status === "PROCESSING") {
            return (
                <span className="absolute top-12 right-3 px-2 py-0.5 rounded text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
          처리 중
        </span>
            );
        }
        if (item.status === "COMPLETED") {
            return (
                <span className="absolute top-12 right-3 px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          완료
        </span>
            );
        }
        if (item.status === "FAILED") {
            return (
                <span className="absolute top-12 right-3 px-2 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
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

    // 렌더링
    return (
        <div
            onClick={onClick}
            className={`
        group relative
        rounded-xl p-4 sm:p-5
        border
        transition-all cursor-pointer
        ${
                selected
                    ? "border-accent bg-accent-soft shadow-md"
                    : "border-border-light dark:border-border-dark hover:bg-accent-soft hover:border-accent hover:shadow-md"
            }
        bg-white dark:bg-surface-dark
      `}
        >
            {/* 체크박스 (좌측 상단) */}
            <div className="absolute top-3 left-3 z-10" onClick={handleCheckboxClick}>
                <Checkbox label="" checked={selected} onChange={onToggleSelect} />
            </div>

            {/* 타입 라벨 (우측 상단) */}
            <div className="absolute top-3 right-3">
        <span className="px-2 py-1 rounded text-xs bg-surface-light dark:bg-surface-input text-text-muted-light dark:text-text-muted-dark">
          {getTypeLabel()}
        </span>
            </div>

            {/* 상태 배지 (있을 경우) */}
            {getStatusBadge()}

            {/* 메뉴 버튼 (우측 하단, 호버 시 표시) */}
            <div
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                ref={menuRef}
            >
                <button
                    onClick={handleMenuClick}
                    className="p-1.5 rounded-lg hover:bg-surface-light dark:hover:bg-surface-input transition-colors"
                >
                    <MoreVertical size={16} className="text-text-muted-light dark:text-text-muted-dark" />
                </button>

                {/* 드롭다운 메뉴 */}
                {showMenu && (
                    <div className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-10 py-1">
                        <button
                            onClick={() => handleMenuAction("summary")}
                            className="w-full px-3 py-2 text-left text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft transition-colors"
                        >
                            AI 요약
                        </button>
                        <button
                            onClick={() => handleMenuAction("compare")}
                            className="w-full px-3 py-2 text-left text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft transition-colors"
                        >
                            비교
                        </button>
                        <div className="h-px bg-border-light dark:bg-border-dark my-1" />
                        <button
                            onClick={() => handleMenuAction("delete")}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>

            {/* 중앙 아이콘 (큰 아이콘) */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 sm:mb-4 mt-6">
                {getIcon()}
            </div>

            {/* 제목 (2줄까지 표시, 나머지 생략) */}
            <h3 className="font-medium text-center mb-2 line-clamp-2 min-h-[3rem] text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark">
                {item.title}
            </h3>

            {/* 날짜 (캘린더 아이콘 + 날짜) */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-muted-light dark:text-text-muted-dark">
                <Calendar size={12} />
                <span>
          {new Date(item.date).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })}
        </span>
            </div>
        </div>
    );
}