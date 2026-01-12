"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

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
    SortBy,
    ViewMode,
} from "@/hooks/workspace/workspace";
import { useNoteAction } from "@/hooks/notes/useNoteAction";

export default function WorkspacePage() {
    const { sessionId } = useParams<{ sessionId: string }>();

    // 상태
    const [filter, setFilter] = useState<WorkspaceFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortBy>("recent");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [clientPage, setClientPage] = useState(0);

    const {
        allNotes,
        files,
        loading,
        refetchNotes,
        refetchFiles,
        forceRefetch,
    } = useWorkspaceQuery(sortBy);

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

    const { handleSoftDelete } = useNoteAction();

    //  전체 아이템 목록 생성 + 필터링 + 검색 + 정렬
    const allItems: WorkspaceItem[] = useMemo(() => {
        // 1. 병합 (전체 데이터)
        const merged: WorkspaceItem[] = [
            ...allNotes.map((n) => ({
                id: `note-${n.noteId}`,
                type: "note" as const,
                title: n.title ?? "제목 없음",
                date: n.moddate ?? n.regdate ?? "",
                regdate: n.regdate ?? "",
                moddate: n.moddate ?? "",
                noteId: n.noteId,
            })),
            ...files.map((f) => ({
                id: `document-${f.fileId}`,
                type: "document" as const,
                title: f.fileName,
                date: f.regdate ?? "",
                regdate: f.regdate ?? "",
                moddate: f.regdate ?? "",
                fileId: f.fileId,
            })),
        ];

        // 2. 타입 필터
        const filtered =
            filter === "all"
                ? merged
                : merged.filter((i) => i.type === filter);

        // 3. 검색 필터
        const searched = searchQuery.trim()
            ? filtered.filter((item) =>
                item.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase().trim())
            )
            : filtered;

        // 4. 정렬
        const sorted = [...searched].sort((a, b) => {
            if (sortBy === "title") {
                return a.title.localeCompare(b.title, "ko-KR");
            }

            if (sortBy === "created") {
                const dateA = new Date(a.regdate || a.date).getTime();
                const dateB = new Date(b.regdate || b.date).getTime();
                return dateB - dateA;
            }

            // recent
            const dateA = new Date(a.moddate || a.regdate || a.date).getTime();
            const dateB = new Date(b.moddate || b.regdate || b.date).getTime();
            return dateB - dateA;
        });

        return sorted;
    }, [allNotes, files, filter, searchQuery, sortBy]);

    // 클라이언트 페이지네이션
    const pageSize = 20;
    const totalPages = Math.ceil(allItems.length / pageSize);
    const startIdx = clientPage * pageSize;
    const pagedItems = allItems.slice(startIdx, startIdx + pageSize);

    const pageData = {
        pageNumber: clientPage,
        totalPages,
        totalElements: allItems.length,
        hasNext: clientPage < totalPages - 1,
        hasPrevious: clientPage > 0,
        isFirst: clientPage === 0,
        isLast: clientPage === totalPages - 1,
    };

    // 정렬 변경 시 페이지 리셋
    useEffect(() => {
        setClientPage(0);
    }, [sortBy, filter, searchQuery]);

    // 노트 생성 완료 핸들러
    const handleNoteCreated = useCallback(
        async (noteId: number) => {
            console.log("[WorkspacePage] 새 노트 생성됨:", noteId);
            await forceRefetch();
            setClientPage(0);
        },
        [forceRefetch]
    );

    // 노트 업데이트 핸들러
    const handleNoteUpdated = useCallback(
        async () => {
            console.log("[WorkspacePage] 노트 업데이트됨");
            await refetchNotes();
        },
        [refetchNotes]
    );

    //  전체 선택
    const handleSelectAll = useCallback(() => {
        const allItemIds = pagedItems.map((item) => item.id);
        allItemIds.forEach((id) => {
            if (!selectedItems.has(id)) {
                toggleSelectItem(id);
            }
        });
    }, [pagedItems, selectedItems, toggleSelectItem]);

    //  대량 삭제
    const handleBulkDelete = useCallback(async () => {
        if (selectedItems.size === 0) return;

        const confirmed = window.confirm(
            `${selectedItems.size}개 항목을 휴지통으로 이동하시겠습니까?`
        );

        if (!confirmed) return;

        try {
            const selectedNoteIds = allItems
                .filter((item) => selectedItems.has(item.id) && item.noteId)
                .map((item) => item.noteId!);

            // 순차 삭제
            for (const noteId of selectedNoteIds) {
                await handleSoftDelete(noteId);
            }

            toast.success(`${selectedNoteIds.length}개 항목이 휴지통으로 이동되었습니다.`);
            clearSelection();
            await refetchNotes();
        } catch (error) {
            toast.error("삭제 중 오류가 발생했습니다.");
            console.error(error);
        }
    }, [selectedItems, allItems, handleSoftDelete, clearSelection, refetchNotes]);

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
                        onSelectAll={handleSelectAll}
                        onBulkDelete={handleBulkDelete}
                        totalItems={pagedItems.length}
                        sessionId={Number(sessionId)}
                        onUploaded={refetchFiles}
                        onNewNote={openNewNote}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />

                    <WorkspaceContent
                        compact={isCompact}
                        loading={loading}
                        items={pagedItems}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleSelectItem}
                        onItemClick={(item) =>
                            openItem(item.type, item.noteId ?? item.fileId!)
                        }
                        notePageData={pageData}
                        onPageChange={setClientPage}
                        onDeleted={handleNoteUpdated}
                        viewMode={viewMode}
                    />
                </div>
            )}
            right={
                <WorkspacePanel
                    selectedId={selectedId}
                    selectedType={selectedType}
                    onClose={closePanel}
                    onCreated={handleNoteCreated}
                    onUpdated={handleNoteUpdated}
                />
            }
        />
    );
}