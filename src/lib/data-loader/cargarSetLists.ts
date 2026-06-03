import { SetList } from "@/types/setlist";

const SETLIST_IDS = ["setlist-001"];

export async function cargarSetLists(): Promise<SetList[]> {
  const setlists: SetList[] = [];

  for (const id of SETLIST_IDS) {
    try {
      const res = await fetch(`/data/setlists/${id}.json`);
      if (res.ok) {
        const sl: SetList = await res.json();
        setlists.push(sl);
      }
    } catch {
      console.warn(`No se pudo cargar ${id}`);
    }
  }

  return setlists;
}
