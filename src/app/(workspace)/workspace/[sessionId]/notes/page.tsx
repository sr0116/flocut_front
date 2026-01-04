"use client";

import { useState } from "react";
import NotesFilterBar from "@/app/components/notes/NotesFilterBar";
import NotesGridView from "@/app/components/notes/NotesGridView";
import NotesListView from "@/app/components/notes/NotesListView";
import { useParams, useRouter } from "next/navigation";
import { useNotesBySession } from "@/hooks/notes/useNotesBySession";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NotesPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");

  const { data, loading } = useNotesBySession(Number(sessionId));
  const notes = data?.notesBySession ?? [];

  const handleNoteClick = (noteId: number) => {
    // 전체 화면 에디터로 이동
    router.push(`/workspace/${sessionId}/notes/${noteId}`);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
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
          <div className="p-6">
            {viewMode === "grid" ? (
              <NotesGridView notes={notes} onNoteClick={handleNoteClick} />
            ) : (
              <NotesListView notes={notes} onNoteClick={handleNoteClick} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}