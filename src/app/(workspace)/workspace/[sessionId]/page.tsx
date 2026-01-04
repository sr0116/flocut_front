"use client";

import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  List,
  Plus,
  FileText,
  Mic,
  File,
} from "lucide-react";

import { useNotesBySession } from "@/hooks/notes/useNotesBySession";
import { useMyFiles } from "@/hooks/files/useMyFiles";

import Button from "@/app/components/ui/button/Button";
import Checkbox from "@/app/components/ui/form/Checkbox";
import FileUploadButton from "@/app/components/files/FileUploadButton";

import WorkspaceGridItem from "@/app/components/layout/WorkspaceLayout/WorkspaceGridItem";
import WorkspaceListItem from "@/app/components/layout/WorkspaceLayout/WorkspaceListItem";
import UnifiedPanel from "@/app/components/layout/WorkspaceLayout/panel/UnifiedPanel";

type ContentType = "all" | "notes" | "documents" | "audio";
type ViewMode = "grid" | "list";
type SortBy = "recent" | "created" | "title";

export default function SessionHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [contentType, setContentType] = useState<ContentType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [requestSummary, setRequestSummary] = useState(false);
  const [panelWidth, setPanelWidth] = useState(600);
  const isDraggingRef = useRef(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const selectedId = searchParams.get("id");
  const selectedType = searchParams.get("type") as
    | "note"
    | "document"
    | "audio"
    | null;

  const {
    data: notesData,
    loading: notesLoading,
    refetch: refetchNotes,
  } = useNotesBySession(Number(sessionId));

  const {
    files,
    loading: filesLoading,
    refetch: refetchFiles,
  } = useMyFiles();

  const notes = notesData?.notesBySession ?? [];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedId) {
        handleClosePanel();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(400, Math.min(1200, newWidth)));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const unifiedItems = useMemo(() => {
    const items: {
      id: string;
      type: "note" | "document" | "audio";
      title: string;
      date: string;
      noteId?: number;
      fileId?: number;
      sourceType?: string;
    }[] = [];

    notes.forEach((note) => {
      items.push({
        id: `note-${note.noteId}`,
        type: note.sourceType === "AUDIO" ? "audio" : "note",
        title: note.title || "제목 없음",
        date: note.moddate ?? note.regdate ?? "",
        noteId: note.noteId,
        sourceType: note.sourceType ?? undefined,
      });
    });

    files.forEach((file) => {
      items.push({
        id: `document-${file.fileId}`,
        type: "document",
        title: file.fileName,
        date: file.regdate ?? "",
        fileId: file.fileId,
      });
    });

    let filtered = items;

    if (contentType !== "all") {
      filtered = filtered.filter((item) => {
        if (contentType === "notes") return item.type === "note";
        if (contentType === "documents") return item.type === "document";
        if (contentType === "audio") return item.type === "audio";
        return true;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [notes, files, searchQuery, sortBy, contentType]);

  // 페이지네이션 적용
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return unifiedItems.slice(startIndex, endIndex);
  }, [unifiedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(unifiedItems.length / itemsPerPage);
  const loading = notesLoading || filesLoading;

  const isAllSelected =
    paginatedItems.length > 0 &&
    selectedItems.size === paginatedItems.length;

  const toggleSelectAll = () => {
    setSelectedItems(
      isAllSelected ? new Set() : new Set(paginatedItems.map((i) => i.id))
    );
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleItemClick = (item: typeof unifiedItems[0]) => {
    if (item.noteId) {
      router.push(`/workspace/${sessionId}?type=note&id=${item.noteId}`, {
        scroll: false,
      });
    } else if (item.fileId) {
      router.push(`/workspace/${sessionId}?type=document&id=${item.fileId}`, {
        scroll: false,
      });
    }
  };

  const handleClosePanel = () => {
    router.push(`/workspace/${sessionId}`, { scroll: false });
  };

  const handleNewNote = () => {
    router.push(`/workspace/${sessionId}?type=note&id=new`, { scroll: false });
  };

  const handleStartResize = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="h-full flex overflow-hidden">
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all"
        style={{
          width: selectedId ? `calc(100% - ${panelWidth}px)` : "100%",
        }}
      >
        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {loading ? (
            <div className="text-center text-slate-500">불러오는 중...</div>
          ) : viewMode === "list" ? (
            <div className="space-y-1">
              {paginatedItems.map((item) => (
                <WorkspaceListItem
                  key={item.id}
                  item={item}
                  sessionId={Number(sessionId)}
                  selected={selectedItems.has(item.id)}
                  onToggleSelect={() => toggleSelectItem(item.id)}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedItems.map((item) => (
                <WorkspaceGridItem
                  key={item.id}
                  item={item}
                  sessionId={Number(sessionId)}
                  selected={selectedItems.has(item.id)}
                  onToggleSelect={() => toggleSelectItem(item.id)}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 &&
                      page <= currentPage + 2)
                )
                .map((page, idx, arr) => (
                  <Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        currentPage === page
                          ? "bg-pink-500 text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  </Fragment>
                ))}
            </div>
          )}
        </div>
      </div>

      {selectedId && selectedType && (
        <>
          <div
            onMouseDown={handleStartResize}
            className="w-1 bg-slate-200 dark:bg-slate-800 hover:bg-pink-500 cursor-ew-resize transition-colors flex-shrink-0"
          />
          <div
            className="flex-shrink-0 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-hidden"
            style={{ width: `${panelWidth}px` }}
          >
            <UnifiedPanel
              type={selectedType}
              id={selectedId}
              sessionId={Number(sessionId)}
              onClose={handleClosePanel}
              onCreated={(noteId) => {
                refetchNotes();
                router.replace(
                  `/workspace/${sessionId}?type=note&id=${noteId}`,
                  { scroll: false }
                );
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
