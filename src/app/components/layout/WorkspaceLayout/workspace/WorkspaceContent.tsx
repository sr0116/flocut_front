"use client";

import WorkspaceListItem from "./WorkspaceListItem";
import Pagination from "@/app/components/ui/pagination/Pagination";
import { File } from "lucide-react";
import { NotePage } from "@/lib/graphql/note/note.type";
import { WorkspaceItem } from "@/hooks/workspace/workspace";

type Props = {
    compact: boolean;
    loading: boolean;
    items: WorkspaceItem[];
    selectedItems: Set<string>;
    onToggleSelect: (id: string) => void;
    onItemClick: (item: WorkspaceItem) => void;
    notePageData?: NotePage;
    onPageChange: (page: number) => void;
    onDeleted: () => void;
};

export default function WorkspaceContent({
                                             compact,
                                             loading,
                                             items,
                                             selectedItems,
                                             onToggleSelect,
                                             onItemClick,
                                             notePageData,
                                             onPageChange,
                                             onDeleted,
                                         }: Props) {
    if (loading) {
        return null;
    }

    if (items.length === 0) {
        return (
            <div className="py-20 text-center">
                <File size={48} className="mx-auto opacity-30 mb-3" />
                <p className="text-text-muted-light">콘텐츠가 없습니다</p>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                {items.map((item) => (
                    <WorkspaceListItem
                        key={item.id}
                        item={item}
                        compact={compact}
                        selected={selectedItems.has(item.id)}
                        onToggleSelect={() => onToggleSelect(item.id)}
                        onClick={() => onItemClick(item)}
                        onDeleted={onDeleted}
                    />
                ))}
            </div>

            {notePageData && (
                <Pagination {...notePageData} onChange={onPageChange} />
            )}
        </div>
    );
}
