"use client";

import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";

export default function WorkspaceHeader() {
  const router = useRouter();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
      {/* 왼쪽: 브레드크럼 영역 (나중에 추가) */}
      <div className="flex items-center gap-3">
        {/* 나중에 페이지 타이틀 표시 */}
      </div>

      {/* 오른쪽: 액션 */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-surface-light dark:hover:bg-surface-dark transition-colors">
          <Search size={18} />
        </button>

        <button className="p-2 rounded-md hover:bg-surface-light dark:hover:bg-surface-dark transition-colors">
          <Bell size={18} />
        </button>

        <button
          onClick={() => router.push("/settings/profile")}
          className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          F
        </button>
      </div>
    </header>
  );
}