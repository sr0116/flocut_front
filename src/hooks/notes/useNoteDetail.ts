import {NOTE_DETAIL_QUERY} from "@/lib/graphql/note/note.query";
import {NoteDetail, NoteDetailGQL} from "@/lib/graphql/note/note.type";
import {useQuery} from "@apollo/client/react";

export function useNoteDetail(noteId?: number) {
  const { data, loading } = useQuery<
    { note: NoteDetailGQL },
    { noteId: number }
  >(NOTE_DETAIL_QUERY, {
    skip: !noteId,
    variables: { noteId: noteId as number },
  });

  const note: NoteDetail | null = data?.note
    ? {
      noteId: data.note.noteId,
      title: data.note.title ?? "",
      content: data.note.content ?? "",
      sourceType: data.note.sourceType as any,
      sourceId: data.note.sourceId ?? null,
      createdDate: data.note.regdate ?? "",
      modifiedDate: data.note.moddate ?? "",
    }
    : null;

  return { note, loading };
}
