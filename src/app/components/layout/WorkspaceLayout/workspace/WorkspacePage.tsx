"use client";

import { useState, useEffect, useCallback } from "react";
import SummaryContent from "@/app/components/summary/SummaryContent";
import {FileText} from "lucide-react";
import WorkspaceListItem from "@/app/components/layout/WorkspaceLayout/workspace/WorkspaceListItem";

type WorkspaceItem = {
  id: string;
  type: "note" | "document" | "audio";
  title: string;
  date: string;
  noteId?: number;
};

export default function WorkspacePage({ params }: { params: { sessionId: string } }) {
  const sessionId = Number(params.sessionId);

  // 상태 관리
  const [notes, setNotes] = useState<WorkspaceItem[]>([]);
  const [documents, setDocuments] = useState<WorkspaceItem[]>([]);
  const [selectedNote, setSelectedNote] = useState<WorkspaceItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 노트 리스트 가져오기 함수
  const fetchNotes = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/notes`);
      if (!response.ok) throw new Error("Failed to fetch notes");

      const data = await response.json();

      const transformedNotes: WorkspaceItem[] = data.notes.map((note: any) => ({
        id: `note-${note.noteId}`,
        type: "note",
        title: note.title,
        date: new Date(note.createdAt).toLocaleDateString("ko-KR"),
        noteId: note.noteId,
      }));

      setNotes(transformedNotes);
    } catch (error) {
      console.error("노트 로딩 실패:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [sessionId]);

  // 문서 리스트 가져오기 함수 (필요시)
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/documents`);
      if (!response.ok) throw new Error("Failed to fetch documents");

      const data = await response.json();

      const transformedDocs: WorkspaceItem[] = data.documents.map((doc: any) => ({
        id: `document-${doc.documentId}`,
        type: "document",
        title: doc.title,
        date: new Date(doc.createdAt).toLocaleDateString("ko-KR"),
        noteId: doc.documentId,
      }));

      setDocuments(transformedDocs);
    } catch (error) {
      console.error("문서 로딩 실패:", error);
    }
  }, [sessionId]);

  // 초기 로드
  useEffect(() => {
    fetchNotes();
    fetchDocuments();
  }, [fetchNotes, fetchDocuments]);

  //  노트 생성 성공 시 콜백
  const handleNoteCreated = useCallback(() => {
    console.log(" 노트가 생성되었습니다! 리스트를 새로고침합니다.");
    fetchNotes(); // 리스트 다시 가져오기
  }, [fetchNotes]);

  // 삭제 후 콜백
  const handleDeleted = useCallback(() => {
    console.log(" 노트가 삭제되었습니다! 리스트를 새로고침합니다.");
    fetchNotes();
  }, [fetchNotes]);

  // 아이템 선택
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleItemClick = useCallback((item: WorkspaceItem) => {
    setSelectedNote(item);
  }, []);

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 리스트 영역 */}
      <div className="w-1/3 border-r border-border-light dark:border-border-dark overflow-y-auto p-4 space-y-2">
        {/* 노트 섹션 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              노트
            </h2>
            {isRefreshing && (
              <div className="text-xs text-accent animate-pulse">
                새로고침 중...
              </div>
            )}
          </div>

          {notes.length === 0 ? (
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark text-center py-8">
              노트가 없습니다
            </p>
          ) : (
            notes.map((note) => (
              <WorkspaceListItem
                key={note.id}
                item={note}
                selected={selectedItems.includes(note.id)}
                compact={false}
                onToggleSelect={() => handleToggleSelect(note.id)}
                onClick={() => handleItemClick(note)}
                onDeleted={handleDeleted} // 삭제 후 리스트 갱신
              />
            ))
          )}
        </div>

        {/* 문서 섹션 */}
        <div>
          <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            문서
          </h2>
          {documents.length === 0 ? (
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark text-center py-8">
              문서가 없습니다
            </p>
          ) : (
            documents.map((doc) => (
              <WorkspaceListItem
                key={doc.id}
                item={doc}
                selected={selectedItems.includes(doc.id)}
                compact={false}
                onToggleSelect={() => handleToggleSelect(doc.id)}
                onClick={() => handleItemClick(doc)}
                onDeleted={handleDeleted}
              />
            ))
          )}
        </div>
      </div>

      {/* 오른쪽: 상세 & 요약 영역 */}
      <div className="flex-1 overflow-y-auto bg-surface-light dark:bg-surface-dark">
        {selectedNote ? (
          <SummaryContent
            type={selectedNote.type as "note" | "document"}
            targetId={selectedNote.noteId || 0}
            sessionId={sessionId}
            history={[]} // 실제 요약 히스토리 데이터로 교체하세요
            loadingHistory={false}
            onRequestSuccess={fetchNotes} // 요약 요청 성공 시에도 리스트 갱신
            onNoteCreated={handleNoteCreated} // 노트 생성 시 리스트 갱신
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted-light dark:text-text-muted-dark">
            <div className="text-center space-y-2">
              <FileText size={48} className="mx-auto opacity-20" />
              <p>노트나 문서를 선택하세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}