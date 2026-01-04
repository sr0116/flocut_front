
"use client";

import { useState } from "react";
import {
  Edit3,
  Eye,
  Sparkles,
  MessageSquare,
  GitCompare,
  Calendar,
  Save,
} from "lucide-react";

import VoiceRecorder from "@/app/components/ai/VoiceRecorder";
import DocumentCompare from "@/app/components/ai/DocumentCompare";

interface Props {
  isEditing: boolean;
  saving?: boolean;
  saved: boolean;
  onSave: () => void;
  onToggleEdit: () => void;
  onAIAction: (m: "summary" | "feedback" | "compare") => void;
  onToggleRightPanel: () => void;
  rightPanelOpen: boolean;
  editorContent: string;
}

export default function EditorToolbar({
                                        isEditing,
                                        saving = false,
                                        saved,
                                        onSave,
                                        onToggleEdit,
                                        onAIAction,
                                        onToggleRightPanel,
                                        rightPanelOpen,
                                        editorContent,
                                      }: Props) {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <>
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-950">
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEdit}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
              isEditing
                ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }
            `}
          >
            {isEditing ? <Edit3 size={16} /> : <Eye size={16} />}
            {isEditing ? "편집 중" : "보기"}
          </button>

          {isEditing && (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors"
              onClick={() => setVoiceOpen(true)}
            >
              음성 녹음
            </button>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
            onClick={() => onAIAction("summary")}
          >
            <Sparkles size={14} />
            요약
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors"
            onClick={() => onAIAction("feedback")}
          >
            <MessageSquare size={14} />
            피드백
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
            onClick={() => setCompareOpen(true)}
          >
            <GitCompare size={14} />
            비교
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={saving || saved}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
              saved
                ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-default"
                : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg"
            }
              disabled:opacity-60
            `}
          >
            <Save size={14} />
            {saving ? "저장 중..." : saved ? "저장됨" : "저장"}
          </button>

          <button
            onClick={onToggleRightPanel}
            className={`
              p-2 rounded-lg transition-colors
              ${
              rightPanelOpen
                ? "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }
            `}
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Voice Recorder */}
      {voiceOpen && (
        <VoiceRecorder
          onClose={() => setVoiceOpen(false)}
          onTranscriptionComplete={() => {}}
        />
      )}

      {/* Document Compare */}
      {compareOpen && (
        <DocumentCompare
          currentContent={editorContent}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </>
  );
}
