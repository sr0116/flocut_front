"use client";

import { useRouter, useParams } from "next/navigation";
import { useMyFiles } from "@/hooks/files/useMyFiles";
import UploadHeader from "@/app/components/files/UploadHeader";
import FileUploadButton from "@/app/components/files/FileUploadButton";

import { useState } from "react";
import Checkbox from "@/app/components/ui/form/Checkbox";
import DocumentListItem from "@/app/components/documents/DocumentListItem";

export default function DocumentsPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { files, loading, refetch } = useMyFiles();

  // 요약 요청 여부
  const [requestSummary, setRequestSummary] = useState(false);

  const openDetail = (fileId: number) => {
    router.push(`/documents/${fileId}`);
  };

  return (
    <div>
      <UploadHeader
        title="문서"
        total={files.length}
        rightSlot={
          <div className="flex items-center gap-4">
            <Checkbox
              label="업로드 후 AI 요약 요청"
              checked={requestSummary}
              onChange={setRequestSummary}
            />
            <FileUploadButton
              sessionId={Number(sessionId)}
              requestSummary={requestSummary}
              onSuccess={refetch}
            />
          </div>
        }
      />

      <div className="px-8 py-6">
        {loading && <p>불러오는 중...</p>}

        <ul className="space-y-2">
          {files.map((file) => (
            <DocumentListItem
              key={file.fileId}
              file={file}
              sessionId={Number(sessionId)}
            />
          ))}

        </ul>
      </div>
    </div>
  );
}
