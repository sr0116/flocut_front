"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mic, File, Sparkles, MessageSquare, GitCompare } from "lucide-react";
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

export default function WorkspaceGridItem({
                                            item,
                                            sessionId,
                                            selected,
                                            onToggleSelect
                                          }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  const getTypeLabel = () => {
    switch (item.type) {
      case "audio": return "음성";
      case "document": return "문서";
      default: return "노트";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
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
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative
        rounded-xl p-5
        border-2
        transition-all cursor-pointer
        hover:shadow-lg hover:-translate-y-1
        ${
        selected
          ? "border-accent bg-accent-soft/50"
          : "border-border-light dark:border-border-dark hover:border-accent"
      }
      `}
    >
      {/* 체크박스 (왼쪽 상단) */}
      <div
        className="absolute top-3 left-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          label=""
          checked={selected}
          onChange={onToggleSelect}
        />
      </div>

      {/* 타입 레이블 (오른쪽 상단) */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-1 rounded text-xs bg-surface-light dark:bg-surface-dark">
          {getTypeLabel()}
        </span>
      </div>

      {/* 아이콘 */}
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 mt-6">
        {getIcon()}
      </div>

      {/* 제목 */}
      <h3 className="font-medium text-center mb-2 line-clamp-2 min-h-[3rem]">
        {item.title}
      </h3>

      {/* 날짜 */}
      <p className="text-xs text-text-muted-light text-center mb-4">
        {new Date(item.date).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })}
      </p>

      {/* 액션 버튼들 */}
      <div
        data-no-navigate
        className="flex items-center justify-center gap-2 pt-3 border-t border-border-light dark:border-border-dark opacity-0 group-hover:opacity-100 transition-opacity"
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
      </div>
    </div>
  );
}