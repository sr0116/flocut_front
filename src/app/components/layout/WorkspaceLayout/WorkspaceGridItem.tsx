"use client";

import { FileText, Mic, File, Calendar } from "lucide-react";
import Checkbox from "@/app/components/ui/form/Checkbox";


// WorkspaceItem 타입 (부모에서 전달받는 데이터 형식)

type WorkspaceItem = {
  id: string;
  type: "note" | "document" | "audio";
  title: string;
  date: string;
  sourceType?: string;
  fileId?: number;
  noteId?: number;
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
  // 타입별 아이콘 (그리드는 큰 아이콘 사용)
  const getIcon = () => {
    switch (item.type) {
      case "audio":
        return <Mic size={32} className="text-purple-500" />;
      case "document":
        return <File size={32} className="text-blue-500" />;
      default:
        return <FileText size={32} className="text-green-500" />;
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

  // 렌더링
  return (
    <div
      onClick={onClick}
      className={`
        group relative
        rounded-xl p-4 sm:p-5
        border-2
        transition-all cursor-pointer
        hover:shadow-lg hover:-translate-y-1
        ${
        selected
          ? "border-pink-400 dark:border-pink-600 bg-pink-50/50 dark:bg-pink-900/20"
          : "border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-700"
      }
        bg-white dark:bg-slate-900
      `}
    >
      {/* 
          체크박스 (좌측 상단)
           */}
      <div
        className="absolute top-3 left-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox label="" checked={selected} onChange={onToggleSelect} />
      </div>

      {/* 
          타입 라벨 (우측 상단)
           */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {getTypeLabel()}
        </span>
      </div>

      {/* 
          중앙 아이콘 (큰 아이콘)
           */}
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 sm:mb-4 mt-6">
        {getIcon()}
      </div>

      {/* 
          제목 (2줄까지 표시, 나머지 생략)
           */}
      <h3 className="font-medium text-center mb-2 line-clamp-2 min-h-[3rem] text-sm sm:text-base text-slate-900 dark:text-slate-100">
        {item.title}
      </h3>

      {/* 
          날짜 (캘린더 아이콘 + 날짜)
           */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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