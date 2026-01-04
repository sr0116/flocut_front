"use client";

import { FileText } from "lucide-react";

interface Note {
  noteId: number;
  title?: string | null;
  content?: string | null;
  regdate?: string | null;
  moddate?: string | null;
  sourceType?: string | null;
}

interface Props {
  notes: Note[];
  onNoteClick?: (noteId: number) => void;
}

export default function NotesListView({ notes, onNoteClick }: Props) {
  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.noteId}
          onClick={() => onNoteClick?.(note.noteId)}
          className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all cursor-pointer bg-white dark:bg-slate-900"
        >
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/20 transition-colors flex-shrink-0">
            <FileText size={18} className="text-green-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate mb-1">
              {note.title || "제목 없음"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {note.moddate
                ? new Date(note.moddate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "방금 전"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}