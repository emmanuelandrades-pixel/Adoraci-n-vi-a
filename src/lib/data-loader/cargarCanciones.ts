import { Cancion } from "@/types/cancion";

// IDs de canciones disponibles en /data/songs/
const SONG_IDS = ["song-001", "song-002", "song-003", "song-004", "song-005"];

export async function cargarCanciones(): Promise<Cancion[]> {
  const canciones: Cancion[] = [];

  for (const id of SONG_IDS) {
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
