"use client";

import { useParams } from "next/navigation";
import UnifiedPanel from "@/app/components/layout/WorkspaceLayout/workspace/panel/UnifiedPanel";

type Props = {
  selectedId: string | null;
  selectedType: "note" | "document" | "audio" | null;
  onClose: () => void;
  onUpdated: (data: {
    noteId: number;
    title: string;
    moddate: string;
  }) => void;
};

export default function WorkspacePanel({
                                         selectedId,
                                         selectedType,
                                         onClose,
                                         onUpdated,
                                       }: Props) {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!selectedId || !selectedType) return null;

  return (
    <UnifiedPanel
      type={selectedType}
      id={selectedId}
      sessionId={Number(sessionId)}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  );
}
