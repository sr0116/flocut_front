"use client";

import Link from "next/link";
import { Filter, LayoutGrid, List, Plus, SlidersHorizontal } from "lucide-react";

export default function NotesFilterBar({
                                         sortBy,
                                         viewMode,
                                         onChangeSort,
                                         onChangeViewMode,
                                         sessionId,
                                       }: {
  sortBy: string;
  viewMode: "grid" | "list";
  onChangeSort: (v: string) => void;
  onChangeViewMode: (v: "grid" | "list") => void;
  sessionId: number;
}) {
  return (
    <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-950">
      {/* Left: Filter & Sort */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">필터</span>
        </button>

        <select
          value={sortBy}
          onChange={(e) => onChangeSort(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg bg-transparent border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer outline-none"
        >
          <option value="recent">최근 수정순</option>
          <option value="created">생성일순</option>
          <option value="title">제목순</option>
        </select>
      </div>

      {/* Right: New Note & View Mode */}
      <div className="flex items-center gap-2">
        <Link
          href={`/workspace/${sessionId}/notes/new`}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">새 노트</span>
        </Link>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900">
          <button
            onClick={() => onChangeViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-800 text-pink-500 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <LayoutGrid size={16} />
          </button>

          <button
            onClick={() => onChangeViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-800 text-pink-500 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}