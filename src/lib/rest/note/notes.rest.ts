import { api } from "@/lib/axios";
import { NoteCreateInput, NoteUpdateInput } from "@/lib/graphql/note/note.type";

import { NOTE_LIST_QUERY, NOTE_DETAIL_QUERY } from "@/lib/graphql/note/note.query";
import {apolloClient} from "@/lib/apollo/clients";

export const createNote = async (input: NoteCreateInput) => {
    const response = await api.post<number>("/api/notes", input);
    const newNoteId = response;

    // 캐시 직접 업데이트 - 리스트에 새 노트 추가
    try {
        const existingData = apolloClient.readQuery<any>({
            query: NOTE_LIST_QUERY,
            variables: { sessionId: input.sessionId },
        });

        if (existingData) {
            apolloClient.writeQuery({
                query: NOTE_LIST_QUERY,
                variables: { sessionId: input.sessionId },
                data: {
                    notesBySession: [
                        {
                            __typename: "Note",
                            noteId: newNoteId,
                            title: input.title,
                            regdate: new Date().toISOString(),
                            moddate: new Date().toISOString(),
                            sourceType: input.sourceType || null,
                            sourceId: input.sourceId || null,
                        },
                        ...existingData.notesBySession,
                    ],
                },
            });
        }
    } catch (error) {
        // 캐시에 데이터가 없으면 무시
        console.log("Cache miss for NotesBySession");
    }

    return response;
};

export const updateNote = async (input: NoteUpdateInput) => {
    const { noteId, ...body } = input;

    const response = await api.put<void>(`/api/notes/${noteId}`, body);

    // 캐시 직접 업데이트 - 상세 페이지
    try {
        const existingDetail = apolloClient.readQuery<any>({
            query: NOTE_DETAIL_QUERY,
            variables: { noteId },
        });

        if (existingDetail) {
            apolloClient.writeQuery({
                query: NOTE_DETAIL_QUERY,
                variables: { noteId },
                data: {
                    note: {
                        ...existingDetail.note,
                        title: body.title ?? existingDetail.note.title,
                        content: body.content ?? existingDetail.note.content,
                        moddate: new Date().toISOString(),
                    },
                },
            });
        }
    } catch (error) {
        console.log("Cache miss for note detail");
    }

    // 캐시 직접 업데이트 - 리스트
    try {
        const cache = apolloClient.cache as any;
        const cacheId = cache.identify({ __typename: "Note", noteId });

        if (cacheId) {
            apolloClient.cache.modify({
                id: cacheId,
                fields: {
                    title: () => body.title,
                    moddate: () => new Date().toISOString(),
                },
            });
        }
    } catch (error) {
        console.log("Cache miss for note list item");
    }

    return response;
};

export const deleteNote = async (noteId: number) => {
    const response = await api.delete(`/api/notes/${noteId}`);

    // 캐시에서 노트 제거
    try {
        const cache = apolloClient.cache as any;
        const cacheId = cache.identify({ __typename: "Note", noteId });

        if (cacheId) {
            apolloClient.cache.evict({ id: cacheId });
            apolloClient.cache.gc();
        }
    } catch (error) {
        console.log("Cache eviction failed");
    }

    return response;
};