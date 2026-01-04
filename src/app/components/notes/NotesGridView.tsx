"use client";

import { FileText, Calendar } from "lucide-react";

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

export default function NotesGridView({ notes, onNoteClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <div
          key={note.noteId}
          onClick={() => onNoteClick?.(note.noteId)}
          className="group relative rounded-xl p-5 border-2 border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-white dark:bg-slate-900"
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
            <FileText size={32} className="text-green-500" />
          </div>

          <h3 className="font-medium text-center mb-2 line-clamp-2 min-h-[3rem]">
            {note.title || "제목 없음"}
          </h3>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={12} />
            <span>
              {note.moddate
                ? new Date(note.moddate).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "방금 전"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}