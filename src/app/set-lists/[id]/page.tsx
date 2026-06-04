import { EditorSetList } from "@/components/setlists/EditorSetList";

export default async function SetListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditorSetList id={id} />;
}
