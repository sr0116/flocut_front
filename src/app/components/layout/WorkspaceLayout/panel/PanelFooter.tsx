"use client";

interface Props {
  saved: boolean;
  wordCount?: number;
  charCount?: number;
}

export default function PanelFooter({
                                      saved,
                                      wordCount,
                                      charCount,
                                    }: Props) {
  return (
    <div
      className="
        h-10 flex items-center justify-between
        px-4 text-xs
        border-t border-slate-200 dark:border-slate-800
        text-slate-500 dark:text-slate-400
      "
    >
      <div className="flex items-center gap-2">
        {typeof charCount === "number" && (
          <span>{charCount.toLocaleString()} 글자</span>
        )}
        {typeof wordCount === "number" && (
          <span className="hidden sm:inline">
            • {wordCount.toLocaleString()} 단어
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`
            w-2 h-2 rounded-full
            ${saved ? "bg-green-500" : "bg-yellow-500 animate-pulse"}
          `}
        />
        <span className="hidden sm:inline">
          {saved ? "저장됨" : "저장 중"}
        </span>
      </div>
    </div>
  );
}
