import { EditorSetList } from "@/components/setlists/EditorSetList";

export default function SetListPage({ params }: { params: { id: string } }) {
  return <EditorSetList id={params.id} />;
}
