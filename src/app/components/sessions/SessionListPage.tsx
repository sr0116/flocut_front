"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  Plus,
  Clock,
  Calendar,
  MoreVertical,
  FolderOpen,
  SortAsc,
  SortDesc,
  Search,
  Edit2,
  Trash2
} from "lucide-react";

import { useSessions } from "@/hooks/sessions/useSessions";
import Card from "@/app/components/ui/card/Card";
import Button from "@/app/components/ui/button/Button";
import EmptyState from "@/app/components/ui/empty-state/EmptyState";
import ToggleGroup from "@/app/components/ui/toggle/ToggleGroup";
import Pagination from "@/app/components/ui/pagination/Pagination";
import SearchInput from "@/app/components/ui/input/SearchInput";


import SessionEditModal from "@/app/components/sessions/SessionEditModal";
import SessionDeleteModal from "@/app/components/sessions/SessionDeleteModal";

export default function SessionListPage({ pageSize = 10 }: { pageSize?: number }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [page, setPage] = useState(0);

  // 메뉴 및 모달 상태
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: number; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const { sessions, loading, refetch } = useSessions();

  const filteredSessions = useMemo(() => {
    let result = [...sessions];
    if (searchQuery) {
      result = result.filter(s =>
        s.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result.sort((a, b) => {
      const dateA = new Date(a.moddate || a.regdate).getTime();
      const dateB = new Date(b.moddate || b.regdate).getTime();
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [sessions, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredSessions.length / pageSize);
  const paginatedSessions = filteredSessions.slice(page * pageSize, (page + 1) * pageSize);

  if (loading) return <div className="p-8 animate-pulse bg-surface-light dark:bg-surface-dark rounded-xl h-96" />;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">세션 라이브러리</h1>
          <p className="text-sm text-text-muted-light mt-1">총 {filteredSessions.length}개의 분석 세션을 관리하고 있습니다.</p>
        </div>
        <Button onClick={() => router.push("/workspace")} className="gap-2 shadow-lg shadow-accent/20">
          <Plus size={16} /> 새 세션 시작하기
        </Button>
      </div>

      <Card className="p-4 border-none shadow-sm bg-white dark:bg-surface-dark/50">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="세션 제목이나 설명으로 검색..." className="w-full" />
          </div>
          <ToggleGroup
            value={sortBy}
            onChange={(v: any) => setSortBy(v)}
            options={[
              { value: "latest", label: "최신순", icon: <SortDesc size={14} /> },
              { value: "oldest", label: "과거순", icon: <SortAsc size={14} /> },
            ]}
            size="sm"
          />
        </div>
      </Card>

      <Card padding="none" className="border-none shadow-sm overflow-hidden bg-white dark:bg-surface-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-light dark:bg-surface-hover/50 border-b border-border-light dark:border-border-dark font-bold text-xs uppercase text-text-muted-light">
            <tr>
              <th className="px-6 py-4">세션 정보</th>
              <th className="hidden md:table-cell px-6 py-4">상태</th>
              <th className="px-6 py-4">최종 활동</th>
              <th className="px-6 py-4 w-16 text-center">액션</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {paginatedSessions.map((session) => (
              <tr
                key={session.sessionId}
                className="group hover:bg-surface-light/50 dark:hover:bg-surface-hover/30 transition-colors cursor-pointer relative"
                onClick={() => router.push(`/workspace/${session.sessionId}`)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center text-accent">
                      <FolderOpen size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate text-text-primary-light dark:text-text-primary-dark group-hover:text-accent transition-colors">
                        {session.sessionTitle}
                      </p>
                      {session.description && <p className="text-xs text-text-muted-light truncate max-w-md">{session.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${session.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-500'}`}>
                      {session.status}
                    </span>
                </td>
                <td className="px-6 py-5 text-sm">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 font-medium"><Clock size={14} className="text-accent" /> {new Date(session.moddate || session.regdate).toLocaleDateString()}</span>
                    <span className="text-[10px] text-text-muted-light ml-5">{new Date(session.moddate || session.regdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === session.sessionId ? null : session.sessionId)}
                    className="p-2 rounded-xl hover:bg-accent-soft text-text-muted-light transition-all"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {/* 행 내부 드롭다운 메뉴 */}
                  {activeMenuId === session.sessionId && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={() => setActiveMenuId(null)} />
                      <div className="absolute right-6 top-14 min-w-[140px] py-1 rounded-lg shadow-2xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark z-[100] text-left">
                        <button
                          onClick={() => { setEditTarget({ id: session.sessionId, title: session.sessionTitle }); setActiveMenuId(null); }}
                          className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-accent-soft text-text-primary-light dark:text-text-primary-dark"
                        >
                          <Edit2 size={14} /> 이름 변경
                        </button>
                        <div className="h-px bg-border-light dark:bg-border-dark my-1" />
                        <button
                          onClick={() => { setDeleteTarget({ id: session.sessionId, title: session.sessionTitle }); setActiveMenuId(null); }}
                          className="w-full px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={14} /> 삭제
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-border-light dark:border-border-dark flex flex-col items-center gap-2">
            <Pagination pageNumber={page} totalPages={totalPages} hasNext={page < totalPages - 1} hasPrevious={page > 0} isFirst={page === 0} isLast={page === totalPages - 1} onChange={setPage} />
          </div>
        )}
      </Card>

      {/* 모달 연결 */}
      {editTarget && (
        <SessionEditModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          sessionId={editTarget.id}
          initialTitle={editTarget.title}
          onUpdated={refetch}
        />
      )}
      {deleteTarget && (
        <SessionDeleteModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          sessionId={deleteTarget.id}
          sessionTitle={deleteTarget.title}
          onDeleted={refetch}
        />
      )}
    </div>
  );
}