"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
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

type ContentType = "all" | "notes" | "documents" | "audio";
type ViewMode = "grid" | "list";
type SortBy = "recent" | "created" | "title";

export default function UnifiedWorkspacePage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  /* ================= 상태 ================= */
  const [contentType, setContentType] = useState<ContentType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [requestSummary, setRequestSummary] = useState(false);

  /* ================= 데이터 ================= */
  const { data: notesData, loading: notesLoading } =
    useNotesBySession(Number(sessionId));
  const { files, loading: filesLoading, refetch } = useMyFiles();

  const notes = notesData?.notesBySession ?? [];

  /* ================= 통합 리스트 ================= */
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

    if (contentType === "all" || contentType === "notes") {
      notes.forEach((note) => {
        items.push({
          id: `note-${note.noteId}`,
          type: note.sourceType === "AUDIO" ? "audio" : "note",
          title: note.title,
          date: note.moddate ?? note.regdate,
          noteId: note.noteId,
          sourceType: note.sourceType,
        });
      });
    }

    if (contentType === "all" || contentType === "documents") {
      files.forEach((file) => {
        items.push({
          id: `file-${file.fileId}`,
          type: "document",
          title: file.fileName,
          date: file.uploadDate ?? "",
          fileId: file.fileId,
        });
      });
    }

    const filtered = searchQuery
      ? items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : items;

    return [...filtered].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [notes, files, contentType, searchQuery, sortBy]);

  const loading = notesLoading || filesLoading;

  /* ================= 선택 ================= */
  const isAllSelected =
    unifiedItems.length > 0 && selectedItems.size === unifiedItems.length;

  const toggleSelectAll = () => {
    setSelectedItems(
      isAllSelected ? new Set() : new Set(unifiedItems.map((i) => i.id))
    );
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ================= 액션 ================= */
  const handleBulkSummary = () => {
    console.log("요약 요청:", [...selectedItems]);
  };

  const handleBulkCompare = () => {
    console.log("비교 요청:", [...selectedItems]);
  };

  /* ================= UI ================= */
  return (
    <div className="h-full flex flex-col">
      {/* 상단 */}
      <div className="border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold">워크스페이스</h1>
            <p className="text-sm text-text-muted-light mt-1">
              {unifiedItems.length}개 항목
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedItems.size > 0 && (
              <>
                <Button variant="secondary" onClick={handleBulkSummary}>
                  선택 요약 ({selectedItems.size})
                </Button>
                <Button variant="secondary" onClick={handleBulkCompare}>
                  선택 비교
                </Button>
              </>
            )}

            <Checkbox
              label="업로드 후 AI 요약"
              checked={requestSummary}
              onChange={setRequestSummary}
            />

            <FileUploadButton
              sessionId={Number(sessionId)}
              requestSummary={requestSummary}
              onSuccess={refetch}
            />

            <Button variant="primary">
              <Plus size={16} />
              새 노트
            </Button>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex items-center justify-between px-8 py-3 border-t">
          <div className="flex items-center gap-3">
            <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />

            <div className="flex gap-2 border rounded-lg px-2 py-1.5">
              {[
                ["all", "전체"],
                ["notes", "노트", FileText],
                ["documents", "문서", File],
                ["audio", "음성", Mic],
              ].map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setContentType(key as ContentType)}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    contentType === key
                      ? "bg-accent text-white"
                      : "hover:bg-accent-soft"
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  {label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1.5 rounded border text-sm"
            >
              <option value="recent">최근순</option>
              <option value="created">생성순</option>
              <option value="title">제목순</option>
            </select>

            <input
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded border text-sm w-64"
            />
          </div>

          <div className="flex gap-1 p-1 rounded border">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${
                viewMode === "list" ? "bg-accent text-white" : ""
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${
                viewMode === "grid" ? "bg-accent text-white" : ""
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="text-center text-text-muted-light">불러오는 중...</div>
        ) : viewMode === "list" ? (
          <div className="space-y-1">
            {unifiedItems.map((item) => (
              <WorkspaceListItem
                key={item.id}
                item={item}
                sessionId={Number(sessionId)}
                selected={selectedItems.has(item.id)}
                onToggleSelect={() => toggleSelectItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {unifiedItems.map((item) => (
              <WorkspaceGridItem
                key={item.id}
                item={item}
                sessionId={Number(sessionId)}
                selected={selectedItems.has(item.id)}
                onToggleSelect={() => toggleSelectItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
