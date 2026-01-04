"use client";

import { FileText, Mic, File, Calendar } from "lucide-react";
import Checkbox from "@/app/components/ui/form/Checkbox";

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
  onClick: () => void;
};

export default function WorkspaceGridItem({
                                            item,
                                            sessionId,
                                            selected,
                                            onToggleSelect,
                                            onClick,
                                          }: Props) {
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

  return (
    <div
      onClick={onClick}
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

      <div className="absolute top-3 right-3">
        <span className="px-2 py-1 rounded text-xs bg-surface-light dark:bg-surface-dark">
          {getTypeLabel()}
        </span>
      </div>

      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 mt-6">
        {getIcon()}
      </div>

      <h3 className="font-medium text-center mb-2 line-clamp-2 min-h-[3rem]">
        {item.title}
      </h3>

      <div className="flex items-center justify-center gap-2 text-xs text-text-muted-light">
        <Calendar size={12} />
        <span>
          {new Date(item.date).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
      </div>
    </div>
  );
}