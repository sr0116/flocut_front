"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Folder, Plus, Clock, FileText, Loader2 } from "lucide-react";

import { useSessions } from "@/hooks/sessions/useSessions";
import UnifiedWorkspacePage from "@/app/components/layout/WorkspaceLayout/UnifiedWorkspacePage";

export default function WorkspacePage() {
  const params = useParams<{ sessionId?: string }>();
  const sessionId = params?.sessionId;


  if (sessionId) {
    return <UnifiedWorkspacePage />;
  }


  const { sessions, loading } = useSessions();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">워크스페이스</h1>
          <p className="text-text-muted-light">
            모든 세션과 문서를 한 곳에서 관리하세요
          </p>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            href="/workspace/new"
            className="p-6 rounded-xl border-2 border-dashed hover:border-accent hover:bg-accent-soft/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Plus size={24} className="text-accent" />
            </div>
            <h3 className="font-semibold mb-1">새 세션</h3>
            <p className="text-sm text-text-muted-light">
              새로운 프로젝트를 시작하세요
            </p>
          </Link>

          <Link
            href="/recent"
            className="p-6 rounded-xl border hover:border-accent hover:bg-accent-soft/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Clock size={24} className="text-blue-500" />
            </div>
            <h3 className="font-semibold mb-1">최근 작업</h3>
            <p className="text-sm text-text-muted-light">
              최근에 수정한 문서 보기
            </p>
          </Link>

          <Link
            href="/notes"
            className="p-6 rounded-xl border hover:border-accent hover:bg-accent-soft/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <FileText size={24} className="text-green-500" />
            </div>
            <h3 className="font-semibold mb-1">모든 노트</h3>
            <p className="text-sm text-text-muted-light">
              전체 노트 목록 보기
            </p>
          </Link>
        </div>

        {/* 세션 목록 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">내 세션</h2>
            <span className="text-sm text-text-muted-light">
              {sessions.length}개
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Folder size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-text-muted-light">
                아직 세션이 없습니다. 새 세션을 만들어보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Link
                  key={session.sessionId}
                  href={`/workspace/${session.sessionId}`}
                  className="block p-4 rounded-lg border hover:border-accent hover:bg-accent-soft/30 transition-all group"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Folder size={20} className="text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">
                        {session.sessionTitle}
                      </h3>
                      {session.description && (
                        <p className="text-sm text-text-muted-light line-clamp-1">
                          {session.description}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-text-muted-light">
                        생성:{" "}
                        {new Date(session.regdate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-3 py-1 rounded-md bg-accent text-white text-sm">
                        열기
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
