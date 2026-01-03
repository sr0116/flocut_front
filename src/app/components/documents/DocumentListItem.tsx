"use client";

import { useState } from "react";
import Checkbox from "@/app/components/ui/form/Checkbox";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { toast } from "sonner";

type Props = {
  file: {
    fileId: number;
    fileName: string;
  };
  sessionId: number;
};

export default function DocumentListItem({ file, sessionId }: Props) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!checked) {
      toast.info("요약할 문서를 선택해주세요");
      return;
    }

    try {
      setLoading(true);
      await requestDocumentSummary({
        fileId: file.fileId,
        sessionId,
        roundNo: 2,
      });
      toast.success("AI 요약 요청이 접수되었습니다");
    } catch (e) {
      toast.error("요약 요청 실패");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex items-center justify-between border p-3 rounded">
      <div className="flex items-center gap-3">
        <Checkbox
          label={file.fileName}
          checked={checked}
          onChange={setChecked}
        />
      </div>

      <button
        disabled={!checked || loading}
        onClick={handleRequest}
        className="text-sm px-3 py-1 rounded bg-accent text-white disabled:opacity-50"
      >
        {loading ? "요청 중..." : "요약 요청"}
      </button>
    </li>
  );
}
