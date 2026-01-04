"use client";

import { useState } from "react";
import Checkbox from "@/app/components/ui/form/Checkbox";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { toast } from "sonner";
import { FileText, Sparkles } from "lucide-react";

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
    <div className="group flex items-center gap-4 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800 hover:shadow-md transition-all bg-white dark:bg-slate-900">
      {/* Icon */}
      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/20 transition-colors">
        <FileText size={20} className="text-pink-500" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Checkbox
            label=""
            checked={checked}
            onChange={setChecked}
          />
          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
            {file.fileName}
          </h3>
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={!checked || loading}
        onClick={handleRequest}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all"
      >
        <Sparkles size={14} />
        {loading ? "요청 중..." : "요약"}
      </button>
    </div>
  );
}