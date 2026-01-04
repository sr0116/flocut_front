"use client";

import { useState } from "react";
import {
  Edit3,
  Eye,
  Sparkles,
  MessageSquare,
  GitCompare,
  Save,
  PanelRight,
} from "lucide-react";

import VoiceRecorder from "@/app/components/ai/VoiceRecorder";
import DocumentCompare from "@/app/components/ai/DocumentCompare";
import {ToolbarButton} from "@/app/components/ui/button";

interface EditorToolbarProps {
  isEditing: boolean;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onToggleEdit: () => void;
  onAIAction: (mode: "summary" | "feedback" | "compare") => void;
  onToggleRightPanel: () => void;
  rightPanelOpen: boolean;
  editorContent: string;
}

export default function EditorToolbar({
                                        isEditing,
                                        saving,
                                        saved,
                                        onSave,
                                        onToggleEdit,
                                        onAIAction,
                                        onToggleRightPanel,
                                        rightPanelOpen,
                                        editorContent,
                                      }: EditorToolbarProps) {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <>
      <div className="h-14 flex items-center justify-between px-4 border-b border-border-light dark:border-border-dark bg-white dark:bg-background-dark">
        {/* Left group */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={isEditing ? <Edit3 size={16} /> : <Eye size={16} />}
            label={isEditing ? "편집 중" : "보기"}
            active={isEditing}
            onClick={onToggleEdit}
          />

          {isEditing && (
            <ToolbarButton
              icon={<MessageSquare size={16} />}
              label="음성"
              onClick={() => setVoiceOpen(true)}
            />
          )}
        </div>

        {/* Right group */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<Sparkles size={16} />}
            label="요약"
            onClick={() => onAIAction("summary")}
          />

          <ToolbarButton
            icon={<MessageSquare size={16} />}
            label="피드백"
            onClick={() => onAIAction("feedback")}
          />

          <ToolbarButton
            icon={<GitCompare size={16} />}
            label="비교"
            onClick={() => setCompareOpen(true)}
          />

          <ToolbarButton
            icon={<Save size={16} />}
            label={saving ? "저장 중" : saved ? "저장됨" : "저장"}
            disabled={saving || saved}
            onClick={onSave}
          />

          <ToolbarButton
            icon={<PanelRight size={16} />}
            active={rightPanelOpen}
            onClick={onToggleRightPanel}
          />
        </div>
      </div>

      {voiceOpen && (
        <VoiceRecorder
          onClose={() => setVoiceOpen(false)}
          onTranscriptionComplete={() => {}}
        />
      )}

      {compareOpen && (
        <DocumentCompare
          currentContent={editorContent}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </>
  );
}
