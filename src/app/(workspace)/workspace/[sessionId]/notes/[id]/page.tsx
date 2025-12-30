import EditorPage from "@/app/components/notes/editor/EditorPage";

export default async function NoteDetailPage({
                                               params,
                                             }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditorPage noteId={id} />;
}
