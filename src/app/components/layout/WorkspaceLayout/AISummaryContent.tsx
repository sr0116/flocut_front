// src/app/components/layout/WorkspaceLayout/AISummaryContent.tsx
"use client";

import { useDocumentSummary } from "@/hooks/summaries/useDocumentSummary";

interface Props {
  fileId: number;
}

export default function AISummaryContent({ fileId }: Props) {
  const { data, loading } = useDocumentSummary(fileId);

  if (loading) {
    return (
      <p className="p-4 text-sm">
        요약 상태 확인 중...
      </p>
    );
  }

  if (!data?.documentSummaryByFileId) {
    return (
      <p className="p-4 text-sm">
        요약 요청 전입니다.
      </p>
    );
  }

  const summary = data.documentSummaryByFileId;

  if (summary.status === "REQUESTED") {
    return (
      <p className="p-4 text-sm">
        요약 진행 중입니다...
      </p>
    );
  }

  if (summary.status === "FAILED") {
    return (
      <p className="p-4 text-sm text-red-500">
        요약에 실패했습니다.
      </p>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold">
        요약 결과
      </h3>
      <p className="text-sm whitespace-pre-line">
        {summary.summaryText}
      </p>
    </div>
  );
}
