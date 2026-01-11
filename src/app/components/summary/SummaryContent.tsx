"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { SummaryStatus } from "@/lib/graphql/summary/summary.type";
import { useSummaryView } from "@/hooks/summaries/useSummaryView";
import SummaryRequestButton from "@/app/components/shared/SummaryRequestButton";

type SummaryHistoryItem = {
  summaryId: number;
  versionNo: number;
  status: SummaryStatus;
  createdAt: string;
};

type Props = {
  type: "document" | "note";
  targetId: number;
  sessionId: number;
  history: SummaryHistoryItem[];
  loadingHistory: boolean;
  onRequestSuccess: () => void;
};

export default function SummaryContent({
                                         type,
                                         targetId,
                                         sessionId,
                                         history,
                                         loadingHistory,
                                         onRequestSuccess,
                                       }: Props) {
  const [selectedSummaryId, setSelectedSummaryId] = useState<number | null>(
    null
  );

  const selectedHistoryItem = history.find(
    (h) => h.summaryId === selectedSummaryId
  );

  const { summary: detail, loading: loadingDetail } =
    useSummaryView(selectedSummaryId ?? undefined);

  // 최신 요약 자동 선택
  useEffect(() => {
    if (!selectedSummaryId && history.length > 0) {
      setSelectedSummaryId(history[0].summaryId);
    }
  }, [history, selectedSummaryId]);
  //  로딩
  if (loadingHistory) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  // 요약 없음
  if (history.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            <h4 className="font-bold text-lg">AI 요약</h4>
          </div>

          <SummaryRequestButton
            type={type}
            targetId={targetId}
            sessionId={sessionId}
            onRequested={onRequestSuccess}
          />
        </div>

        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl">
          <Sparkles size={48} className="text-accent opacity-20 mb-4" />
          <p className="text-sm text-text-muted-light text-center">
            아직 생성된 요약이 없습니다
          </p>
        </div>
      </div>
    );
  }

  //  요약 있을 때
  return (
    <div className="flex h-full">
      {/* === 좌측: 요약 히스토리 === */}
      <aside className="w-64 border-r p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-bold text-sm">요약 내역</h5>
          <SummaryRequestButton
            type={type}
            targetId={targetId}
            sessionId={sessionId}
            size="sm"
            onRequested={onRequestSuccess}
          />
        </div>

        {history.map((item) => (
          <button
            key={item.summaryId}
            onClick={() => setSelectedSummaryId(item.summaryId)}
            className={`w-full text-left p-3 rounded-lg border text-sm space-y-1
              ${
              selectedSummaryId === item.summaryId
                ? "border-accent bg-accent-soft"
                : "hover:bg-surface-light"
            }
            `}
          >
            <div className="flex items-center justify-between">
              <span>v{item.versionNo}</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs text-text-muted-light">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </button>
        ))}
      </aside>

      {/* === 우측: 요약 상세 === */}
      <section className="flex-1 p-6 overflow-y-auto">
        {loadingDetail ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : !detail ? (
          <p className="text-sm text-text-muted-light">
            왼쪽에서 요약을 선택하세요
          </p>
        ) : (
          <div className="space-y-4">
            <h4 className="font-bold text-lg">
              요약 상세 (v{selectedHistoryItem?.versionNo})
            </h4>

            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {detail.finalDocument}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

//  나중에 공용 컴포너트로 사용 예정
function StatusBadge({ status }: { status: SummaryStatus }) {
  const map = {
    REQUESTED: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${map[status]}`}
    >
      {status}
    </span>
  );
}
