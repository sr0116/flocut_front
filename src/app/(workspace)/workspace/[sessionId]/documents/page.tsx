"use client";

import { useRouter, useParams } from "next/navigation";
import { useMyFiles } from "@/hooks/files/useMyFiles";
import FileUploadButton from "@/app/components/files/FileUploadButton";
import { useState } from "react";
import Checkbox from "@/app/components/ui/form/Checkbox";
import DocumentListItem from "@/app/components/documents/DocumentListItem";
import { Upload, FileText, Loader2 } from "lucide-react";

export default function DocumentsPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { files, loading, refetch } = useMyFiles();
  const [requestSummary, setRequestSummary] = useState(false);

  const openDetail = (fileId: number) => {
    // 워크스페이스 패널로 열기
    router.push(`/workspace/${sessionId}?type=document&id=${fileId}`);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            문서
          </h1>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {files.length}개
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            label="업로드 후 AI 요약"
            checked={requestSummary}
            onChange={setRequestSummary}
          />
          <FileUploadButton
            sessionId={Number(sessionId)}
            requestSummary={requestSummary}
            onSuccess={refetch}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-pink-500" size={32} />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              문서가 없습니다
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              첫 번째 문서를 업로드해보세요
            </p>
            <FileUploadButton
              sessionId={Number(sessionId)}
              requestSummary={requestSummary}
              onSuccess={refetch}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.fileId}
                  onClick={() => openDetail(file.fileId)}
                  className="cursor-pointer"
                >
                  <DocumentListItem
                    file={file}
                    sessionId={Number(sessionId)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}