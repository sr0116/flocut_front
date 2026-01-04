"use client";

import { FileText, Mic, File } from "lucide-react";
import Checkbox from "@/app/components/ui/form/Checkbox";


// WorkspaceItem 타입 (부모에서 전달받는 데이터 형식)

type WorkspaceItem = {
  id: string; // 고유 ID (예: "note-123" 또는 "document-456")
  type: "note" | "document" | "audio"; // 타입
  title: string; // 제목
  date: string; // 생성/수정 날짜
  sourceType?: string; // 소스 타입 (음성 노트인 경우 "AUDIO")
  fileId?: number; // 파일 ID (문서/음성)
  noteId?: number; // 노트 ID (노트)
};


// Props 정의

type Props = {
  item: WorkspaceItem; // 표시할 항목
  sessionId: number; // 세션 ID
  selected: boolean; // 선택 여부
  onToggleSelect: () => void; // 선택 토글
  onClick: () => void; // 아이템 클릭
};


// 메인 컴포넌트

export default function WorkspaceListItem({
                                            item,
                                            sessionId,
                                            selected,
                                            onToggleSelect,
                                            onClick,
                                          }: Props) {
  
  // 타입별 아이콘 반환 (노트=초록, 문서=파랑, 음성=보라)
  
  const getIcon = () => {
    switch (item.type) {
      case "audio":
        return <Mic size={18} className="text-purple-500 flex-shrink-0" />;
      case "document":
        return <File size={18} className="text-blue-500 flex-shrink-0" />;
      default:
        return <FileText size={18} className="text-green-500 flex-shrink-0" />;
    }
  };

  
  // 타입별 라벨 (노트/문서/음성)
  
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
        group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 rounded-lg
        border border-transparent
        hover:border-slate-200 dark:hover:border-slate-700
        hover:bg-pink-50/50 dark:hover:bg-pink-900/10
        transition-all cursor-pointer
        ${selected ? "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800" : ""}
      `}
    >
      {/* 
          체크박스 (클릭 시 부모의 선택 상태만 토글)
           */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox label="" checked={selected} onChange={onToggleSelect} />
      </div>

      {/* 
          아이콘 (타입별로 다른 색상)
           */}
      <div className="flex-shrink-0">{getIcon()}</div>

      {/* 
          제목 + 타입 라벨 + 날짜
           */}
      <div className="flex-1 min-w-0">
        {/* 제목 + 타입 뱃지 */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm sm:text-base truncate text-slate-900 dark:text-slate-100">
            {item.title}
          </h3>
          {/* 타입 라벨 (노트/문서/음성) */}
          <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {getTypeLabel()}
          </span>
        </div>

        {/* 날짜 (작은 글씨로 표시) */}
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {new Date(item.date).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}