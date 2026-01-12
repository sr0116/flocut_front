// src/app/components/summary/SummaryContent.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useMediaQuery } from "@/hooks/common/useMediaQuery";

import { SummaryStatus } from "@/lib/graphql/summary/summary.type";
import { useSummaryView } from "@/hooks/summaries/useSummaryView";

import SummaryRequestButton from "@/app/components/shared/SummaryRequestButton";
import SummaryActions from "./SummaryActions";
import { SummaryStatusBadge } from "./SummaryStatusBadge";

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
    const [selectedSummaryId, setSelectedSummaryId] = useState<number | null>(null);

    // ✅ 반응형 감지
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");
    const isSmallPanel = useMediaQuery("(max-width: 1280px)");

    const selectedHistoryItem = history.find((h) => h.summaryId === selectedSummaryId);

    const { summary: detail, loading: loadingDetail } = useSummaryView(selectedSummaryId ?? undefined);

    useEffect(() => {
        if (!selectedSummaryId && history.length > 0) {
            setSelectedSummaryId(history[0].summaryId);
        }
    }, [history, selectedSummaryId]);

    if (loadingHistory) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* 헤더 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-accent flex-shrink-0" />
                        <h4 className="font-bold text-base sm:text-lg text-text-primary-light dark:text-text-primary-dark">
                            AI 요약
                        </h4>
                    </div>

                    <SummaryRequestButton
                        type={type}
                        targetId={targetId}
                        sessionId={sessionId}
                        onRequested={onRequestSuccess}
                    />
                </div>

                {/* 빈 상태 */}
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl sm:rounded-3xl">
                    <Sparkles size={48} className="text-accent opacity-20 mb-4" />
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        아직 생성된 요약이 없습니다
                    </p>
                </div>
            </div>
        );
    }

    // ✅ 모바일/태블릿: 세로 레이아웃
    if (isMobile || isTablet) {
        return (
            <div className="flex flex-col h-full">
                {/* 요약 내역 - 상단 */}
                <div className="flex-shrink-0 border-b border-border-light dark:border-border-dark p-3 sm:p-4 bg-surface-light dark:bg-surface-dark">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                            요약 내역
                        </h5>

                        <SummaryRequestButton
                            type={type}
                            targetId={targetId}
                            sessionId={sessionId}
                            size="sm"
                            onRequested={onRequestSuccess}
                        />
                    </div>

                    {/* 가로 스크롤 */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar-hide">
                        {history.map((item) => {
                            const selected = selectedSummaryId === item.summaryId;

                            return (
                                <button
                                    key={item.summaryId}
                                    onClick={() => setSelectedSummaryId(item.summaryId)}
                                    className={`
                    flex-shrink-0 p-3 rounded-lg border text-sm space-y-1.5 min-w-[140px]
                    transition-all
                    ${
                                        selected
                                            ? "border-accent bg-accent-soft shadow-md"
                                            : "border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-input"
                                    }
                  `}
                                >
                                    <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      v{item.versionNo}
                    </span>
                                        <SummaryStatusBadge status={item.status} />
                                    </div>

                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark truncate">
                                        {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 요약 상세 - 하단 */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    {loadingDetail ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-accent" size={32} />
                        </div>
                    ) : !detail ? (
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark text-center py-10">
                            요약을 선택하세요
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {/* 헤더 */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <h4 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
                                    요약 상세 (v{selectedHistoryItem?.versionNo})
                                </h4>

                                <SummaryActions summaryId={detail.summaryId} sessionId={sessionId} />
                            </div>

                            {/* 본문 */}
                            <div className="border border-border-light dark:border-border-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white dark:bg-surface-dark">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                                    {detail.finalDocument}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    //  데스크톱: 가로 레이아웃 (패널 크기에 따라 조정)
    return (
        <div className="flex h-full">
            {/* 요약 내역 - 왼쪽 */}
            <aside
                className={`
          flex-shrink-0 border-r border-border-light dark:border-border-dark overflow-y-auto
          ${isSmallPanel ? "w-48" : "w-64"}
        `}
            >
                <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                            요약 내역
                        </h5>

                        <SummaryRequestButton
                            type={type}
                            targetId={targetId}
                            sessionId={sessionId}
                            size="sm"
                            onRequested={onRequestSuccess}
                        />
                    </div>

                    {history.map((item) => {
                        const selected = selectedSummaryId === item.summaryId;

                        return (
                            <button
                                key={item.summaryId}
                                onClick={() => setSelectedSummaryId(item.summaryId)}
                                className={`
                  w-full text-left p-3 rounded-lg border text-sm space-y-1.5
                  transition-all
                  ${
                                    selected
                                        ? "border-accent bg-accent-soft shadow-md"
                                        : "border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-input"
                                }
                `}
                            >
                                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    v{item.versionNo}
                  </span>
                                    <SummaryStatusBadge status={item.status} />
                                </div>

                                <p className="text-xs text-text-muted-light dark:text-text-muted-dark truncate">
                                    {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                                        year: "2-digit",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* 요약 상세 - 오른쪽 */}
            <section className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {loadingDetail ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-accent" size={32} />
                    </div>
                ) : !detail ? (
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        왼쪽에서 요약을 선택하세요
                    </p>
                ) : (
                    <div className="space-y-6">
                        {/* 헤더 */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h4 className="font-bold text-base sm:text-lg text-text-primary-light dark:text-text-primary-dark">
                                요약 상세 (v{selectedHistoryItem?.versionNo})
                            </h4>

                            <SummaryActions summaryId={detail.summaryId} sessionId={sessionId} />
                        </div>

                        {/* 본문 */}
                        <div className="border border-border-light dark:border-border-dark rounded-2xl p-4 sm:p-6 bg-white dark:bg-surface-dark">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                                {detail.finalDocument}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}