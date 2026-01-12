"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { createNoteFromSummary } from "@/lib/rest/note/notes.rest";

type Props = {
  summaryId: number;
  sessionId: number;
  onNoteCreated?: () => void; // 콜백 추가
};

export default function SummaryActions({ summaryId, sessionId, onNoteCreated }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateNote = async (): Promise<void> => {
    setLoading(true);
    try {
      const newNoteId = await createNoteFromSummary({
        summaryId,
        sessionId,
      });

      toast.success("요약으로 노트를 생성했습니다");

      // 콜백 실행하여 리스트 갱신
      if (onNoteCreated) {
        onNoteCreated();
      }

      router.push(`/workspace/${sessionId}?type=note&id=${newNoteId}`);
    } catch (e) {
      console.error(e);
      toast.error("노트 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateNote}
      disabled={loading}
      className="
        inline-flex items-center gap-2
        px-4 py-2 rounded-lg
        text-sm font-medium
        bg-accent text-white
        hover:bg-accent-hover
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        shadow-sm hover:shadow-md
      "
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>생성 중...</span>
        </>
      ) : (
        <>
          <FileText size={16} />
          <span>이 요약으로 노트 생성</span>
        </>
      )}
    </button>
  );
}