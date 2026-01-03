
import { api } from "@/lib/axios";
import {NoteCreateInput, NoteUpdateInput} from "@/lib/graphql/note/note.type";

export const createNote = (input: NoteCreateInput) =>
  api.post<number>("/api/notes", input);

export const updateNote = (input: NoteUpdateInput) => {
  const { noteId, ...body } = input;

  return api.put<void>(
    `/api/notes/${noteId}`,
    body
  );
};
