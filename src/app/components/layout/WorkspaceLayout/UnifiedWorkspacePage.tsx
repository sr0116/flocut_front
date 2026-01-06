"use client";

import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutGrid,
    List as ListIcon,
    Plus,
    FileText,
    File,
    Search,
    ChevronDown,
    Loader2,
} from "lucide-react";

import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
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

export default function UnifiedWorkspacePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { sessionId } = useParams<{ sessionId: string }>();

    // 상태 관리
    const [contentType, setContentType] = useState<ContentType>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [sortBy, setSortBy] = useState<SortBy>("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
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

    // 데이터 조회
    const {
        data: notesData,
        loading: notesLoading,
        refetch: refetchNotes,
    } = useNoteDetail(Number(sessionId));

    const {
        files,
        loading: filesLoading,
        refetch: refetchFiles,
    } = useMyFiles();

    const notes = notesData?.notesBySession ?? [];

    // ESC 키로 패널 닫기
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedId) {
                handleClosePanel();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [selectedId]);

    // 패널 리사이즈
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

    // 통합 아이템 목록 생성
    const unifiedItems = useMemo(() => {
        const items: {
            id: string;
            type: "note" | "document" | "audio";
            title: string;
            date: string;
            noteId?: number;
            fileId?: number;
            sourceType?: string;
            status?: string;
        }[] = [];

        // 노트 추가
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

        // 파일 추가
        files.forEach((file) => {
            items.push({
                id: `document-${file.fileId}`,
                type: "document",
                title: file.fileName,
                date: file.regdate ?? "",
                fileId: file.fileId,
                status: file.status,
            });
        });

        // 컨텐츠 타입 필터링
        let filtered = items;
        if (contentType !== "all") {
            filtered = filtered.filter((item) => {
                if (contentType === "notes") return item.type === "note";
                if (contentType === "documents") return item.type === "document";
                if (contentType === "audio") return item.type === "audio";
                return true;
            });
        }

        // 검색어 필터링
        if (searchQuery) {
            filtered = filtered.filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 정렬
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
    }, [unifiedItems, currentPage]);

    const totalPages = Math.ceil(unifiedItems.length / itemsPerPage);
    const loading = notesLoading || filesLoading;

    // 전체 선택 체크
    const isAllSelected =
        paginatedItems.length > 0 && selectedItems.size === paginatedItems.length;

    // 전체 선택 토글
    const toggleSelectAll = () => {
        setSelectedItems(
            isAllSelected ? new Set() : new Set(paginatedItems.map((i) => i.id))
        );
    };

    // 개별 선택 토글
    const toggleSelectItem = (id: string) => {
        setSelectedItems((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // 아이템 클릭
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

    // 패널 닫기
    const handleClosePanel = () => {
        router.push(`/workspace/${sessionId}`, { scroll: false });
    };

    // 새 노트 생성
    const handleNewNote = () => {
        router.push(`/workspace/${sessionId}?type=note&id=new`, { scroll: false });
    };

    // 리사이즈 시작
    const handleStartResize = () => {
        isDraggingRef.current = true;
        document.body.style.cursor = "ew-resize";
        document.body.style.userSelect = "none";
    };

    return (
        <div className="h-full flex overflow-hidden bg-background-light dark:bg-background-dark">
            {/* 메인 컨텐츠 영역 */}
            <div
                className="flex-1 flex flex-col overflow-hidden transition-all"
                style={{
                    width: selectedId ? `calc(100% - ${panelWidth}px)` : "100%",
                }}
            >
                {/* 상단 필터바 */}
                <div className="flex-shrink-0 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
                    {/* 첫 번째 줄: 필터 칩 + 정렬 + 검색 + 액션 버튼 */}
                    <div className="px-4 sm:px-8 py-4 flex items-center gap-3 flex-wrap">
                        {/* 콘텐츠 타입 필터 */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setContentType("all")}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    contentType === "all"
                                        ? "bg-accent text-white"
                                        : "bg-surface-light dark:bg-surface-input text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft"
                                }`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setContentType("notes")}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    contentType === "notes"
                                        ? "bg-accent text-white"
                                        : "bg-surface-light dark:bg-surface-input text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft"
                                }`}
                            >
                                노트
                            </button>
                            <button
                                onClick={() => setContentType("documents")}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    contentType === "documents"
                                        ? "bg-accent text-white"
                                        : "bg-surface-light dark:bg-surface-input text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft"
                                }`}
                            >
                                문서
                            </button>
                            <button
                                onClick={() => setContentType("audio")}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    contentType === "audio"
                                        ? "bg-accent text-white"
                                        : "bg-surface-light dark:bg-surface-input text-text-primary-light dark:text-text-primary-dark hover:bg-accent-soft"
                                }`}
                            >
                                음성
                            </button>
                        </div>

                        <div className="h-6 w-px bg-border-light dark:bg-border-dark" />

                        {/* 정렬 드롭다운 */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortBy)}
                                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm bg-surface-light dark:bg-surface-input border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark cursor-pointer hover:bg-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="recent">최신순</option>
                                <option value="title">제목순</option>
                                <option value="created">생성순</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted-light dark:text-text-muted-dark"
                            />
                        </div>

                        {/* 검색창 */}
                        <div className="flex-1 min-w-[200px] max-w-md relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark"
                            />
                            <input
                                type="text"
                                placeholder="검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm bg-surface-light dark:bg-surface-input border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>

                        {/* 우측: 뷰 모드 + 파일 업로드 + 새 노트 */}
                        <div className="ml-auto flex items-center gap-2">
                            {/* 뷰 모드 토글 */}
                            <div className="flex items-center rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "list"
                                            ? "bg-accent text-white"
                                            : "bg-white dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark hover:bg-surface-light dark:hover:bg-surface-input"
                                    }`}
                                    title="리스트 뷰"
                                >
                                    <ListIcon size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-accent text-white"
                                            : "bg-white dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark hover:bg-surface-light dark:hover:bg-surface-input"
                                    }`}
                                    title="그리드 뷰"
                                >
                                    <LayoutGrid size={16} />
                                </button>
                            </div>

                            {/* 파일 업로드 버튼 */}
                            <FileUploadButton
                                sessionId={Number(sessionId)}
                                onUploadComplete={refetchFiles}
                            />

                            {/* 새 노트 버튼 */}
                            <Button variant="primary" size="sm" onClick={handleNewNote}>
                                <Plus size={16} />
                                새 노트
                            </Button>
                        </div>
                    </div>

                    {/* 두 번째 줄: 전체 선택 + 일괄 작업 (선택 시만 표시) */}
                    {selectedItems.size > 0 && (
                        <div className="px-4 sm:px-8 py-3 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-input flex items-center gap-4">
                            <Checkbox
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                label={`${selectedItems.size}개 선택됨`}
                            />
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm">
                                    요약
                                </Button>
                                <Button variant="secondary" size="sm">
                                    비교
                                </Button>
                                <Button variant="ghost" size="sm">
                                    삭제
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 리스트 영역 */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-accent" size={32} />
                        </div>
                    ) : paginatedItems.length === 0 ? (
                        <div className="text-center py-16">
                            <File
                                size={48}
                                className="mx-auto mb-4 text-text-muted-light dark:text-text-muted-dark"
                            />
                            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                                노트가 없습니다
                            </h3>
                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-6">
                                새 노트를 만들거나 문서를 업로드해보세요
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <Button variant="primary" onClick={handleNewNote}>
                                    <Plus size={16} />
                                    새 노트
                                </Button>
                                <FileUploadButton
                                    sessionId={Number(sessionId)}
                                    onUploadComplete={refetchFiles}
                                />
                            </div>
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
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                    (page) =>
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 2 && page <= currentPage + 2)
                                )
                                .map((page, idx, arr) => (
                                    <Fragment key={page}>
                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                            <span className="px-2 text-text-muted-light dark:text-text-muted-dark">
                        ...
                      </span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === page
                                                    ? "bg-accent text-white"
                                                    : "text-text-primary-light dark:text-text-primary-dark hover:bg-surface-light dark:hover:bg-surface-input"
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

            {/* 우측 패널 */}
            {selectedId && selectedType && (
                <>
                    {/* 리사이즈 핸들 */}
                    <div
                        onMouseDown={handleStartResize}
                        className="w-1 bg-border-light dark:bg-border-dark hover:bg-accent cursor-ew-resize transition-colors flex-shrink-0"
                    />
                    {/* 패널 컨텐츠 */}
                    <div
                        className="flex-shrink-0 bg-white dark:bg-surface-dark border-l border-border-light dark:border-border-dark overflow-hidden"
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