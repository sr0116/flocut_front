// src/app/components/layout/WorkspaceLayout/ContextPanel.tsx
"use client";

import { X } from "lucide-react";
import AISummaryContent from "../AISummaryContent";

export type ContextPanelMode =
  | "properties"
  | "ai-summary"
  | "ai-feedback"
  | "ai-compare"
  | "versions"
  | "comments"
  | "calendar";

interface Props {
  mode: ContextPanelMode;
  noteId: number;
  onClose: () => void;
}

export default function ContextPanel({
                                       mode,
                                       noteId,
                                       onClose,
                                     }: Props) {
  return (
    <aside className="w-[360px] border-l bg-surface-light flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b">
        <span className="text-sm font-semibold">
          {mode === "ai-summary" && "AI 요약"}
          {mode === "properties" && "속성"}
          {mode === "ai-feedback" && "AI 피드백"}
          {mode === "ai-compare" && "문서 비교"}
        </span>
        <button onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {mode === "ai-summary" && (
          <AISummaryContent fileId={noteId} />
        )}

        {mode === "properties" && (
          <div className="p-4 text-sm">
            속성 패널
          </div>
        )}

      </div>
    </aside>
  );
}
