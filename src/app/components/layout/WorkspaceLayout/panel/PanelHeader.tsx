"use client";

import { X, Save, Sparkles, MessageSquare, GitCompare, Calendar } from "lucide-react";
import {Button} from "@/app/components/ui/button";
import IconButton from "@/app/components/ui/icon-button/IconButton";

// 패널 상단에서 사용하는 탭 타입
export type PanelTab = "edit" | "summary" | "feedback" | "compare" | "calendar";

interface Props {
  currentTab: PanelTab;
  onChangeTab: (tab: PanelTab) => void;

  // 노트 관련
  isNote: boolean;
  saved: boolean;
  saving: boolean;
  onSave: () => void;

  // 공통
  onClose: () => void;
}

export default function PanelHeader({
                                      currentTab,
                                      onChangeTab,
                                      isNote,
                                      saved,
                                      saving,
                                      onSave,
                                      onClose,
                                    }: Props) {

  return (
    <div
      className="
        h-14
        flex items-center justify-between
        px-4 sm:px-6
        border-b border-border-light dark:border-border-dark
        flex-shrink-0
      "
    >
      {/* 좌측 탭 영역 */}
      <div className="flex items-center gap-1 overflow-x-auto">
        <TabButton
          label="편집"
          active={currentTab === "edit"}
          onClick={() => onChangeTab("edit")}
        />

        <TabButton
          label="요약"
          icon={<Sparkles size={14} />}
          active={currentTab === "summary"}
          onClick={() => onChangeTab("summary")}
          disabled={!isNote}
        />

        <TabButton
          label="피드백"
          icon={<MessageSquare size={14} />}
          active={currentTab === "feedback"}
          onClick={() => onChangeTab("feedback")}
          disabled={!isNote}
        />

        <TabButton
          label="비교"
          icon={<GitCompare size={14} />}
          active={currentTab === "compare"}
          onClick={() => onChangeTab("compare")}
          disabled={!isNote}
        />

        <TabButton
          label="일정"
          icon={<Calendar size={14} />}
          active={currentTab === "calendar"}
          onClick={() => onChangeTab("calendar")}
          disabled={!isNote}
        />
      </div>

      {/* 우측 액션 영역 */}
      <div className="flex items-center gap-2">
        {isNote && (
          <Button
            size="sm"
            loading={saving}
            disabled={saved}
            onClick={onSave}
          >
            <Save size={14} />
            {saved ? "저장됨" : "저장"}
          </Button>
        )}

        <IconButton
          icon={<X size={16} />}
          onClick={onClose}
        />
      </div>
    </div>
  );
}

// 탭 버튼 전용 컴포넌트
function TabButton({
                     label,
                     icon,
                     active,
                     disabled,
                     onClick,
                   }: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        flex items-center gap-1.5
        px-3 py-1.5 rounded-md text-sm
        transition-colors whitespace-nowrap
        ${active
        ? "bg-accent text-white"
        : "hover:bg-accent-soft text-text-primary-light dark:text-text-primary-dark"}
        disabled:opacity-40
      `}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
