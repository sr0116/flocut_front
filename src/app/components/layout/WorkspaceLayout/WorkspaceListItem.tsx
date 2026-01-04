"use client";

import { FileText, Mic, File } from "lucide-react";
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

export default function WorkspaceListItem({
                                            item,
                                            sessionId,
                                            selected,
                                            onToggleSelect,
                                            onClick,
                                          }: Props) {
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

  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center gap-4 px-4 py-3 rounded-lg
        border border-transparent
        hover:border-border-light dark:hover:border-border-dark
        hover:bg-accent-soft/30
        transition-all cursor-pointer
        ${selected ? "bg-accent-soft/50 border-accent" : ""}
      `}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          label=""
          checked={selected}
          onChange={onToggleSelect}
        />
      </div>

      <div className="flex-shrink-0">
        {getIcon()}
      </div>

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
    </div>
  );
}