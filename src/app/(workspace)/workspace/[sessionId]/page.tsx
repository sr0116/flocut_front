"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import UnifiedPanel from "@/app/components/layout/WorkspaceLayout/UnifiedPanel";

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
  const selectedType = searchParams.get("type") as "note" | "document" | "audio" | null;

  const { data: notesData, loading: notesLoading, refetch: refetchNotes } = useNotesBySession(Number(sessionId));
  const { files, loading: filesLoading, refetch: refetchFiles } = useMyFiles();

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
      filtered = filtered.filter(item => {
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
    paginatedItems.length > 0 && selectedItems.size === paginatedItems.length;

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
      router.push(`/workspace/${sessionId}?type=note&id=${item.noteId}`, { scroll: false });
    } else if (item.fileId) {
      router.push(`/workspace/${sessionId}?type=document&id=${item.fileId}`, { scroll: false });
    }
  };

  const handleClosePanel = () => {
    router.push(`/workspace/${sessionId}`, { scroll: false });
  };

  const handleNewNote = () => {
    router.push(`/workspace/${sessionId}?type=note&id=new`, { scroll: false });
  };

  const handleBulkSummary = () => {
    console.log("요약 요청:", [...selectedItems]);
  };

  const handleBulkCompare = () => {
    console.log("비교 요청:", [...selectedItems]);
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
          width: selectedId ? `calc(100% - ${panelWidth}px)` : "100%"
        }}
      >
        {/* 헤더 영역 */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">워크스페이스</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {unifiedItems.length}개 항목
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {selectedItems.size > 0 && (
                <>
                  <Button variant="secondary" size="sm" onClick={handleBulkSummary}>
                    <span className="hidden sm:inline">선택 요약 ({selectedItems.size})</span>
                    <span className="sm:hidden">요약 ({selectedItems.size})</span>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleBulkCompare}>
                    <span className="hidden sm:inline">선택 비교</span>
                    <span className="sm:hidden">비교</span>
                  </Button>
                </>
              )}

              <div className="hidden md:block">
                <Checkbox
                  label="업로드 후 AI 요약"
                  checked={requestSummary}
                  onChange={setRequestSummary}
                />
              </div>

              <FileUploadButton
                sessionId={Number(sessionId)}
                requestSummary={requestSummary}
                onSuccess={() => {
                  refetchFiles();
                  refetchNotes();
                }}
              />

              <Button variant="primary" size="sm" onClick={handleNewNote}>
                <Plus size={16} />
                <span className="hidden sm:inline">새 노트</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 sm:px-8 py-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
              <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />

              <div className="flex gap-1 sm:gap-2 border rounded-lg px-1 sm:px-2 py-1.5">
                {(
                  [
                    ["all", "전체", null],
                    ["notes", "노트", FileText],
                    ["documents", "문서", File],
                    ["audio", "음성", Mic],
                  ] as const
                ).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setContentType(key)}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center gap-1 transition-colors whitespace-nowrap ${
                      contentType === key
                        ? "bg-pink-500 text-white"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {Icon && <Icon size={14} />}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-2 sm:px-3 py-1.5 rounded border text-xs sm:text-sm bg-white dark:bg-slate-900"
              >
                <option value="recent">최근순</option>
                <option value="created">생성순</option>
                <option value="title">제목순</option>
              </select>

              <input
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2 sm:px-3 py-1.5 rounded border text-xs sm:text-sm w-32 sm:w-64 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex gap-1 p-1 rounded border">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list" ? "bg-pink-500 text-white" : ""
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid" ? "bg-pink-500 text-white" : ""
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {loading ? (
            <div className="text-center text-slate-500">불러오는 중...</div>
          ) : paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText size={64} className="text-slate-300 mb-4" />
              <p className="text-slate-500 mb-6">작업물이 없습니다</p>
              <Button variant="primary" onClick={handleNewNote}>
                <Plus size={16} />
                첫 노트 만들기
              </Button>
            </div>
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
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
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
                  </React.Fragment>
                ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                다음
              </button>
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
                router.replace(`/workspace/${sessionId}?type=note&id=${noteId}`, { scroll: false });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}