"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mic, File, MoreVertical, Sparkles, MessageSquare, GitCompare } from "lucide-react";
import Checkbox from "@/app/components/ui/form/Checkbox";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { toast } from "sonner";

type WorkspaceItem = {
  id: string;
  type: "note" | "document" | "audio";
  title: string;
  date: string;
  sourceType?: string;
  fileId?: number;
  noteId?: number;
};

type Props = {
  item: WorkspaceItem;
  sessionId: number;
  selected: boolean;
  onToggleSelect: () => void;
};

export default function WorkspaceListItem({
                                            item,
                                            sessionId,
                                            selected,
                                            onToggleSelect
                                          }: Props) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const getIcon = () => {
    switch (item.type) {
      case "audio":
        return <Mic size={18} className="text-purple-500" />;
      case "document":
        return <File size={18} className="text-blue-500" />;
      default:
        return <FileText size={18} className="text-green-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case "audio": return "음성";
      case "document": return "문서";
      default: return "노트";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // 체크박스나 액션 버튼 클릭이 아닐 때만 상세로 이동
    if (
      (e.target as HTMLElement).closest('[data-no-navigate]') ||
      (e.target as HTMLElement).closest('input[type="checkbox"]')
    ) {
      return;
    }

    if (item.noteId) {
      router.push(`/workspace/${sessionId}/notes/${item.noteId}`);
    } else if (item.fileId) {
      router.push(`/workspace/${sessionId}/documents/${item.fileId}`);
    }
  };

  const handleSummary = async () => {
    if (!item.fileId && !item.noteId) return;

    setLoading(true);
    try {
      await requestDocumentSummary({
        fileId: item.fileId ?? item.noteId ?? 0,
        sessionId,
        roundNo: 1,
      });
      toast.success("요약 요청이 접수되었습니다");
    } catch (err) {
      toast.error("요약 요청 실패");
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`
        group relative
        flex items-center gap-4 px-4 py-3 rounded-lg
        border border-transparent
        hover:border-border-light dark:hover:border-border-dark
        hover:bg-accent-soft/30
        transition-all cursor-pointer
        ${selected ? "bg-accent-soft/50 border-accent" : ""}
      `}
    >
      {/* 체크박스 */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          label=""
          checked={selected}
          onChange={onToggleSelect}
        />
      </div>

      {/* 아이콘 */}
      <div className="flex-shrink-0">
        {getIcon()}
      </div>

      {/* 메인 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate">{item.title}</h3>
          <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs bg-surface-light dark:bg-surface-dark">
            {getTypeLabel()}
          </span>
        </div>
        <p className="text-xs text-text-muted-light truncate">
          {new Date(item.date).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>

      {/* 액션 버튼들 (hover 시 표시) */}
      {showActions && (
        <div
          data-no-navigate
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleSummary}
            disabled={loading}
            className="p-2 rounded-md hover:bg-accent-soft transition-colors"
            title="AI 요약"
          >
            <Sparkles size={16} className="text-accent" />
          </button>

          <button
            className="p-2 rounded-md hover:bg-accent-soft transition-colors"
            title="AI 피드백"
          >
            <MessageSquare size={16} className="text-accent" />
          </button>

          <button
            className="p-2 rounded-md hover:bg-accent-soft transition-colors"
            title="문서 비교"
          >
            <GitCompare size={16} className="text-purple-500" />
          </button>

          <button
            className="p-2 rounded-md hover:bg-accent-soft transition-colors"
            title="더보기"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      )}
    </div>
  );
}