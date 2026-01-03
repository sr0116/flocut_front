"use client";

import { useRef, useState } from "react";
import Button from "@/app/components/ui/button/Button";
import { Upload } from "lucide-react";
import { uploadFile } from "@/lib/rest/file/file.rest";
import { requestDocumentSummary } from "@/lib/rest/summary/summary.rest";
import { toast } from "sonner";

type FileUploadButtonProps = {
  sessionId: number;
  requestSummary?: boolean;
  onSuccess?: () => void;
};

export default function FileUploadButton({
                                           sessionId,
                                           requestSummary = false,
                                           onSuccess,
                                         }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const openPicker = () => {
    if (!loading) inputRef.current?.click();
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      //  파일 업로드
      const uploaded = await uploadFile(file);
      toast.success("문서 업로드 완료");

      // 체크된 경우만 요약 요청
      if (requestSummary) {
        await requestDocumentSummary({
          fileId: uploaded.fileId, //  업로드 응답 기준
          sessionId,
          roundNo: 1,
        });
        toast.success("AI 요약 요청이 접수되었습니다.");
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("업로드 또는 요약 요청 실패");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={openPicker}
        disabled={loading}
      >
        <Upload size={18} />
        {loading ? "업로드 중..." : "문서 업로드"}
      </Button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".pdf,.docx,.txt"
      />
    </>
  );
}
