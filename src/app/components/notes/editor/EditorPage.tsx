"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import EditorContainer from "./EditorContainer";
import ContextPanel from "@/app/components/layout/WorkspaceLayout/panel/ContextPanel";

type PanelMode =
  | "properties"
  | "ai-summary"
  | "ai-feedback"
  | "ai-compare";

export default function EditorPage() {
  const router = useRouter();
  const { sessionId, id: noteId } = useParams<{
    sessionId: string;
    id: string;
  }>();

  const isNew = noteId === "new";
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>("properties");

  return (
    <div className="h-full flex overflow-hidden">
      <EditorContainer
        noteId={noteId}
        sessionId={Number(sessionId)}
        isNew={isNew}
        onCreated={(id) => {
          router.replace(`/workspace/${sessionId}/notes/${id}`);
        }}
        onAIAction={(mode) => {
          setPanelMode(`ai-${mode}` as PanelMode);
          setRightPanelOpen(true);
        }}
        onToggleRightPanel={() => setRightPanelOpen((v) => !v)}
        rightPanelOpen={rightPanelOpen}
      />

      {rightPanelOpen && !isNew && (
        <ContextPanel
          mode={panelMode}
          noteId={Number(noteId)}
          onClose={() => setRightPanelOpen(false)}
        />
      )}
    </div>
  );
}
