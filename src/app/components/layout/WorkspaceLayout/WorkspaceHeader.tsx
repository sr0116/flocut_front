"use client";

import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useState } from "react";

export default function WorkspaceHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-pink-500 outline-none text-sm transition-colors"
          />
          <kbd className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 py-0.5 text-xs text-slate-500 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            검색
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full"></span>
        </button>

        <button
          onClick={() => router.push("/settings/profile")}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 text-white flex items-center justify-center font-semibold text-sm hover:shadow-lg transition-all"
        >
          F
        </button>
      </div>
    </header>
  );
}