import { Cancion, CancionResumen } from "@/types/cancion";

// Paso 1: carga rápida de la biblioteca (1 sola request)
export async function cargarResumenes(): Promise<CancionResumen[]> {
  try {
    const res = await fetch("/data/songs/songs_summary.json");
    if (res.ok) return res.json();
  } catch {
    console.warn("No se pudo cargar songs_summary.json");
  }
  return [];
}

// Paso 2: carga completa de una canción individual (bajo demanda)
export async function cargarCancion(id: string): Promise<Cancion | null> {
  try {
    const res = await fetch(`/data/songs/${id}.json`);
    if (res.ok) return res.json();
  } catch {
    console.warn(`No se pudo cargar ${id}.json`);
  }
  return null;
}

// Compatibilidad: carga todas las canciones completas (para set lists, etc.)
export async function cargarCanciones(): Promise<Cancion[]> {
  try {
    const res = await fetch("/data/songs/index.json");
    if (!res.ok) return [];
    const { ids }: { ids: string[] } = await res.json();
    const results = await Promise.allSettled(
      ids.map((id) => cargarCancion(id))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Cancion> =>
        r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);
  } catch {
    return [];
  }
}
