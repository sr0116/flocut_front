// src/app/components/layout/WorkspaceLayout/workspace/WorkspacePage.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import ResizablePanelLayout from "../ResizablePanelLayout";
import WorkspaceContent from "./WorkspaceContent";
import WorkspacePanel from "./WorkspacePanel";
import WorkspaceHeaderBar from "./WorkspaceHeaderBar";

import { useWorkspaceQuery } from "@/hooks/workspace/useWorkspaceQuery";
import { useWorkspaceRouting } from "@/hooks/workspace/useWorkspaceRouting";
import { useWorkspaceSelection } from "@/hooks/workspace/useWorkspaceSelection";
import {
    WorkspaceItem,
    WorkspaceFilter,
} from "@/hooks/workspace/workspace";

export default function WorkspacePage() {
    const { sessionId } = useParams<{ sessionId: string }>();

    const {
        notes,
        files,
        loading,
        notePageData,
        setNotePage,
        refetchNotes,
        refetchFiles,
    } = useWorkspaceQuery();

    const {
        selectedItems,
        toggleSelectItem,
        clearSelection,
    } = useWorkspaceSelection();

    const {
        selectedId,
        selectedType,
        openItem,
        closePanel,
        openNewNote,
    } = useWorkspaceRouting();

    const [filter, setFilter] = useState<WorkspaceFilter>("all");

    const items: WorkspaceItem[] = useMemo(() => {
        const merged: WorkspaceItem[] = [
            ...notes.map((n) => ({
                id: `note-${n.noteId}`,
                type: "note" as const,
                title: n.title ?? "제목 없음",
                date: n.moddate ?? n.regdate ?? "",
                noteId: n.noteId,
            })),
            ...files.map((f) => ({
                id: `document-${f.fileId}`,
                type: "document" as const,
                title: f.fileName,
                date: f.regdate ?? "",
                fileId: f.fileId,
            })),
        ];

        const filtered =
            filter === "all"
                ? merged
                : merged.filter((i) => i.type === filter);

        return filtered.sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            return db - da;
        });
    }, [notes, files, filter]);

    return (
        <ResizablePanelLayout
            isOpen={!!selectedId}
            left={(isCompact) => (
                <div className="flex flex-col h-full min-h-0">
                    <WorkspaceHeaderBar
                        filter={filter}
                        onChangeFilter={setFilter}
                        selectedCount={selectedItems.size}
                        onClearSelection={clearSelection}
                        sessionId={Number(sessionId)}
                        onUploaded={refetchFiles}
                        onNewNote={openNewNote}
                    />

                    <WorkspaceContent
                        compact={isCompact}
                        loading={loading}
                        items={items}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleSelectItem}
                        onItemClick={(item) =>
                            openItem(item.type, item.noteId ?? item.fileId!)
                        }
                        notePageData={notePageData}
                        onPageChange={setNotePage}
                        onDeleted={refetchNotes}
                    />
                </div>
            )}
            right={
                <WorkspacePanel
                    selectedId={selectedId}
                    selectedType={selectedType}
                    onClose={closePanel}
                    onUpdated={() => refetchNotes()}
                />
            }
        />
    );
}
