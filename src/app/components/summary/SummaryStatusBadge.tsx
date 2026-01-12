import { SummaryStatus } from "@/lib/graphql/summary/summary.type";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export function SummaryStatusBadge({ status }: { status: SummaryStatus }) {
  const config = {
    REQUESTED: {
      label: "생성 중",
      icon: Clock,
      className: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    },
    COMPLETED: {
      label: "완료",
      icon: CheckCircle2,
      className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    },
    FAILED: {
      label: "실패",
      icon: XCircle,
      className: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1
        text-xs px-2 py-1 rounded-full font-medium
        ${className}
      `}
    >
      <Icon size={12} />
      <span>{label}</span>
    </span>
  );
}