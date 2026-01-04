"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import NoteContent from "@/app/components/layout/WorkspaceLayout/panel/contents/NoteContent";
import PanelFooter from "@/app/components/layout/WorkspaceLayout/panel/PanelFooter";
import PanelHeader, {
  PanelTab,
} from "@/app/components/layout/WorkspaceLayout/panel/PanelHeader";

export default function NoteDetailPage() {
  const router = useRouter();
  const { sessionId, id } = useParams<{
    sessionId: string;
    id: string;
  }>();

  const [currentTab, setCurrentTab] = useState<PanelTab>("edit");

  // 라우팅/UX 검증 단계이므로 footer 상태는 고정
  const saved = true;
  const saving = false;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* 상단 헤더 */}
      <PanelHeader
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        isNote={true}
        saved={saved}
        saving={saving}
        onSave={() => {}}
        onClose={() => {
          router.push(`/workspace/${sessionId}`);
        }}
      />

      {/* 노트 본문 */}
      <div className="flex-1 overflow-y-auto">
        <NoteContent
          noteId={id}
          sessionId={Number(sessionId)}
          tab={currentTab}
          onCreated={(newNoteId) => {
            router.replace(
              `/workspace/${sessionId}/notes/${newNoteId}`
            );
          }}
        />
      </div>

      {/* 하단 푸터 */}
      <PanelFooter
        saved={saved}
        wordCount={0}
        charCount={0}
      />
    </div>
  );
}
