import { Cancion } from "@/types/cancion";

export async function cargarCanciones(): Promise<Cancion[]> {
  const canciones: Cancion[] = [];

  // Cargar índice de canciones
  try {
    const indexRes = await fetch("/data/songs/index.json");
    if (indexRes.ok) {
      const { ids }: { ids: string[] } = await indexRes.json();
      for (const id of ids) {
        try {
          const res = await fetch(`/data/songs/${id}.json`);
          if (res.ok) {
            const cancion: Cancion = await res.json();
            canciones.push(cancion);
          }
        } catch {
          console.warn(`No se pudo cargar ${id}`);
        }
      }
      return canciones;
    }
  } catch {
    // Si no hay índice, usar lista fija
  }

  // Fallback: lista fija de canciones base
  const IDS_BASE = ["song-001", "song-002", "song-003", "song-004", "song-005"];
  for (const id of IDS_BASE) {
    try {
      const res = await fetch(`/data/songs/${id}.json`);
      if (res.ok) {
        const cancion: Cancion = await res.json();
        canciones.push(cancion);
      }
    } catch {
      console.warn(`No se pudo cargar ${id}`);
    }
  }

  return canciones;
}
