"use client";

import { useState, Fragment } from "react";
import NotesFilterBar from "@/app/components/notes/NotesFilterBar";
import NotesGridView from "@/app/components/notes/NotesGridView";
import NotesListView from "@/app/components/notes/NotesListView";
import { useParams, useRouter } from "next/navigation";
import { useNoteDetail } from "@/hooks/notes/useNoteDetail";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NotesPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  const { data, loading } = useNoteDetail(Number(sessionId));
  const notes = data?.notesBySession ?? [];

  // 페이지네이션
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotes = notes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(notes.length / itemsPerPage);

  const handleNoteClick = (noteId: number) => {
    router.push(`/workspace/${sessionId}/notes/${noteId}`);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      <NotesFilterBar
        sortBy={sortBy}
        viewMode={viewMode}
        onChangeSort={setSortBy}
        onChangeViewMode={setViewMode}
        sessionId={Number(sessionId)}
      />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-pink-500" size={32} />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              노트가 없습니다
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              첫 번째 노트를 작성해보세요
            </p>
            <Link
              href={`/workspace/${sessionId}/notes/new`}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium hover:shadow-lg transition-all"
            >
              새 노트 만들기
            </Link>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-6">
              {viewMode === "grid" ? (
                <NotesGridView
                  notes={paginatedNotes}
                  onNoteClick={handleNoteClick}
                />
              ) : (
                <NotesListView
                  notes={paginatedNotes}
                  onNoteClick={handleNoteClick}
                />
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-6">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalPages, prev + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
