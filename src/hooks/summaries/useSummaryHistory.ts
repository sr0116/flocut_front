// hooks/summaries/useSummaryHistory.ts
"use client";

import { useState, useEffect } from "react";
import { SUMMARY_HISTORY_QUERY } from "@/lib/graphql/summary/summary.query";
import {
    SummaryHistoryPage,
    DocumentSummaryHistoryResponse,
} from "@/lib/graphql/summary/summary.type";
import { getNoteSummaryHistory } from "@/lib/rest/summary/summary.rest";
import {useQuery} from "@apollo/client/react";

export function useSummaryHistory(
    targetId: number | null,
    sessionId: number,
    type: "note" | "document" = "note",
    pageNumber: number = 0,
    pageSize: number = 10
) {
    //  노트는 REST API 사용
    const [noteHistory, setNoteHistory] = useState<SummaryHistoryPage | null>(
        null
    );
    const [noteLoading, setNoteLoading] = useState(false);
    const [noteError, setNoteError] = useState<Error | null>(null);

    // 문서는 GraphQL 사용
    const {
        data: documentData,
        loading: documentLoading,
        error: documentError,
        refetch: documentRefetch,
    } = useQuery<DocumentSummaryHistoryResponse>(SUMMARY_HISTORY_QUERY, {
        variables: {
            fileId: targetId?.toString(),
            sessionId: sessionId.toString(),
            page: {
                page: pageNumber,
                size: pageSize,
            },
        },
        skip: type !== "document" || targetId == null,
        fetchPolicy: "cache-and-network",
    });

    //  노트 요약 히스토리 REST 호출
    useEffect(() => {
        if (type === "note" && targetId != null) {
            setNoteLoading(true);
            setNoteError(null);

            getNoteSummaryHistory(targetId, pageNumber, pageSize)
                .then((response) => {
                    setNoteHistory(response);
                })
                .catch((error) => {
                    console.error(" [useSummaryHistory] REST Error:", error);
                    setNoteError(error);
                })
                .finally(() => {
                    setNoteLoading(false);
                });
        }
    }, [type, targetId, pageNumber, pageSize]);

    // 노트 refetch 함수
    const noteRefetch = async () => {
        if (type === "note" && targetId != null) {
            setNoteLoading(true);
            try {
                const response = await getNoteSummaryHistory(
                    targetId,
                    pageNumber,
                    pageSize
                );
                setNoteHistory(response);
            } catch (error) {
                setNoteError(error as Error);
            } finally {
                setNoteLoading(false);
            }
        }
    };

    //  type에 따라 반환값 분기
    if (type === "note") {
        return {
            history: noteHistory?.content || [],
            page: noteHistory || undefined,
            loading: noteLoading,
            error: noteError,
            refetch: noteRefetch,
        };
    }

    return {
        history: documentData?.documentSummaryHistory?.content || [],
        page: documentData?.documentSummaryHistory,
        loading: documentLoading,
        error: documentError,
        refetch: documentRefetch,
    };
}