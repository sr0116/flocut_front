"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, Zap, Clock, CheckCircle2, FileText, RefreshCw } from "lucide-react";

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

    const selectedHistoryItem = history.find((h) => h.summaryId === selectedSummaryId);
    const { summary: detail, loading: loadingDetail } = useSummaryView(selectedSummaryId ?? undefined);

    useEffect(() => {
        if (!selectedSummaryId && history.length > 0) {
            setSelectedSummaryId(history[0].summaryId);
        }
    }, [history, selectedSummaryId]);

    // 로딩 상태
    if (loadingHistory) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" />
                    <div className="absolute inset-4 rounded-full bg-accent/20 animate-pulse" />
                    <div className="absolute inset-8 rounded-full border-4 border-transparent border-t-accent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                </div>

                <p className="mt-6 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    요약 정보를 불러오는 중...
                </p>
            </div>
        );
    }

    // 빈 상태
    if (history.length === 0) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-6">
                    {/* 헤더 */}
                    <div className="flex flex-col gap-3 pb-4 border-b border-border-light dark:border-border-dark">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-accent/10">
                                <Sparkles size={20} className="text-accent" />
                            </div>
                            <div>
                                <h4 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
                                    AI 요약
                                </h4>
                                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                    AI가 핵심 내용을 빠르게 정리합니다
                                </p>
                            </div>
                        </div>

                        <SummaryRequestButton
                            type={type}
                            targetId={targetId}
                            sessionId={sessionId}
                            onRequested={onRequestSuccess}
                        />
                    </div>

                    {/* 빈 상태 */}
                    <div className="flex flex-col items-center justify-center py-8 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 blur-2xl bg-accent/20 rounded-full" />
                            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-surface-light to-white dark:from-surface-dark dark:to-surface-input border-2 border-dashed border-accent/30">
                                <Sparkles size={48} className="text-accent" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h5 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                                아직 생성된 요약이 없습니다
                            </h5>
                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark px-4">
                                AI 요약을 요청하면 긴 문서도 빠르게 파악할 수 있습니다
                            </p>
                        </div>

                        {/* 특징 카드 */}
                        <div className="grid grid-cols-1 gap-3 w-full">
                            {[
                                { icon: Zap, title: "빠른 처리", desc: "몇 초 만에 요약 완료" },
                                { icon: CheckCircle2, title: "정확한 추출", desc: "핵심만 정확하게" },
                                { icon: Clock, title: "버전 관리", desc: "이전 요약 자동 보관" },
                            ].map(({ icon: Icon, title, desc }, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 p-2 rounded-lg bg-accent/10">
                                            <Icon size={16} className="text-accent" />
                                        </div>
                                        <div className="min-w-0">
                                            <h6 className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
                                                {title}
                                            </h6>
                                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isSelectedProcessing = selectedHistoryItem?.status === "REQUESTED";

    //  통합 레이아웃
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* 상단: 헤더 + 버전 슬라이더 (고정) */}
            <div className="flex-shrink-0 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-3 border-b border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Sparkles size={16} className="flex-shrink-0 text-accent" />
                        <h5 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark truncate">
                            요약 내역
                        </h5>
                    </div>

                    <div className="flex-shrink-0 ml-2">
                        <SummaryRequestButton
                            type={type}
                            targetId={targetId}
                            sessionId={sessionId}
                            size="sm"
                            onRequested={onRequestSuccess}
                        />
                    </div>
                </div>

                {/* 버전 슬라이더 */}
                <div className="p-3">
                    {/* 스크롤 컨테이너 */}
                    <div
                        className="flex gap-2 overflow-x-auto pb-2"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        {history.map((item) => {
                            const selected = selectedSummaryId === item.summaryId;

                            return (
                                <button
                                    key={item.summaryId}
                                    onClick={() => setSelectedSummaryId(item.summaryId)}
                                    className={`
                                        flex-shrink-0 p-3 rounded-xl border text-sm min-w-[120px]
                                        transition-colors duration-200
                                        ${
                                        selected
                                            ? "border-accent bg-accent-soft shadow-md"
                                            : "border-border-light dark:border-border-dark hover:border-accent/50 hover:bg-accent/5"
                                    }
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                                            v{item.versionNo}
                                        </span>
                                        <div className="flex-shrink-0 ml-2">
                                            <SummaryStatusBadge status={item.status} />
                                        </div>
                                    </div>

                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark text-left truncate">
                                        {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* 스크롤 인디케이터 */}
                    {history.length > 3 && (
                        <div className="flex justify-center gap-1 mt-2">
                            {history.map((item, idx) => {
                                const isActive = item.summaryId === selectedSummaryId;
                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            h-1 rounded-full transition-all duration-200
                                            ${isActive ? "w-4 bg-accent" : "w-1 bg-border-light dark:bg-border-dark"}
                                        `}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 하단: 요약 상세 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4">
                    {isSelectedProcessing ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                                <RefreshCw className="absolute inset-0 m-auto w-6 h-6 text-accent animate-spin" />
                            </div>
                            <p className="mt-4 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                                현재 요약 생성 중입니다
                            </p>
                            <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                                잠시만 기다려주세요
                            </p>
                        </div>
                    ) : loadingDetail ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 text-accent animate-spin" />
                            <p className="mt-3 text-xs text-text-muted-light dark:text-text-muted-dark">
                                요약을 불러오는 중...
                            </p>
                        </div>
                    ) : !detail ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <FileText size={40} className="text-accent opacity-20 mb-3" />
                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                요약을 선택하세요
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* 헤더 카드 */}
                            <div className="p-4 rounded-xl bg-accent/5 border-l-4 border-accent">
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
                                            요약 v{selectedHistoryItem?.versionNo}
                                        </h4>
                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                                            {new Date(selectedHistoryItem?.createdAt ?? "").toLocaleString("ko-KR")}
                                        </p>
                                    </div>
                                    <SummaryActions summaryId={detail.summaryId} sessionId={sessionId} />
                                </div>
                            </div>

                            {/* 본문 */}
                            <div className="rounded-xl p-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark">
                                <div
                                    className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark"
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}
                                >
                                    {detail.finalDocument}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}