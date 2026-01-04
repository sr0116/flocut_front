"use client";


import { PanelTab } from "./PanelHeader";
import CalendarContent from "@/app/components/layout/WorkspaceLayout/CalendarContent";
import NoteContent from "@/app/components/layout/WorkspaceLayout/panel/contents/NoteContent";

interface Props {
  type: "note" | "document" | "audio";
  id: string;
  sessionId: number;
  currentTab: PanelTab;
  onNoteCreated: (noteId: number) => void;
}

export default function PanelBody({
                                    type,
                                    id,
                                    sessionId,
                                    currentTab,
                                    onNoteCreated,
                                  }: Props) {
  if (currentTab === "calendar") {
    return <CalendarContent noteId={id} />;
  }

  if (type === "note") {
    return (
      <NoteContent
        noteId={id}
        sessionId={sessionId}
        tab={currentTab}
        onCreated={onNoteCreated}
      />
    );
  }

  return null;
}
