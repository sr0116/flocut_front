// hooks/summaries/useNoteSummary.ts
"use client";

import { useState, useEffect } from "react";
import { checkNoteSummary } from "@/lib/rest/summary/summary.rest";
import { useSummaryView } from "./useSummaryView";
import { SummaryStatus } from "@/lib/graphql/summary/summary.type";

/**
 * 노트 요약 조회 (단일 요약만 존재)
 * 1. REST API로 요약 존재 확인
 * 2. summaryId로 GraphQL 상세 조회
 */
export function useNoteSummary(noteId: number | null) {
    const [summaryId, setSummaryId] = useState<number | null>(null);
    const [status, setStatus] = useState<SummaryStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // 요약 존재 여부 확인
    useEffect(() => {
        if (noteId == null) return;

        setLoading(true);
        checkNoteSummary(noteId)
            .then((response) => {
                setSummaryId(response.summaryId);
                setStatus(response.status);
            })
            .catch((err) => {
                console.error(" [useNoteSummary] Check Error:", err);
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [noteId]);

    // 요약 상세 조회 (GraphQL)
    const {
        summary,
        loading: summaryLoading,
        error: summaryError,
    } = useSummaryView(summaryId ?? undefined);

    const refetch = async () => {
        if (noteId == null) return;

        setLoading(true);
        try {
            const response = await checkNoteSummary(noteId);
            setSummaryId(response.summaryId);
            setStatus(response.status);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return {
        summaryId,
        status,
        summary,
        loading: loading || summaryLoading,
        error: error || summaryError,
        refetch,
    };
}