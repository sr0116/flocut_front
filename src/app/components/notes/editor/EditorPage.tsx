"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import EditorContainer from "@/app/components/notes/editor/EditorContainer";
import ContextPanel from "@/app/components/layout/WorkspaceLayout/ContextPanel";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { toast } from "sonner";

type ContextPanelMode =
  | "properties"
  | "ai-summary"
  | "ai-feedback"
  | "ai-compare"
  | "versions"
  | "comments"
  | "calendar";

export default function EditorPage() {
  const router = useRouter();

  const { sessionId, id: noteId } = useParams<{
    sessionId: string;
    id: string;
  }>();

  const isNew = noteId === "new";

  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [panelMode, setPanelMode] =
    useState<ContextPanelMode>("properties");

  const handleToggleRightPanel = () => {
    setRightPanelOpen((prev) => !prev);
  };

  const handleAIAction = async (
    mode: "summary" | "feedback" | "compare"
  ) => {
    setPanelMode(`ai-${mode}` as ContextPanelMode);
    setRightPanelOpen(true);

    if (mode === "summary") {
      const fileId = Number(noteId);
      if (Number.isNaN(fileId)) return;
    }
  };

  const handleClosePanel = () => {
    setRightPanelOpen(false);
  };

  return (
    <div className="h-full flex overflow-hidden bg-white dark:bg-slate-950">
      <EditorContainer
        noteId={noteId}
        sessionId={Number(sessionId)}
        isNew={isNew}
        onCreated={(createdNoteId) => {
          router.replace(
            `/workspace/${sessionId}/notes/${createdNoteId}`
          );
        }}
        onToggleRightPanel={handleToggleRightPanel}
        onAIAction={handleAIAction}
        rightPanelOpen={rightPanelOpen}
      />

      {rightPanelOpen && !isNew && (
        <ContextPanel
          mode={panelMode}
          noteId={Number(noteId)}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}