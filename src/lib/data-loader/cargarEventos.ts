import { EventosData } from "@/types/evento";

export async function cargarEventos(): Promise<EventosData> {
  const res = await fetch("/data/events/events.json");
  if (!res.ok) return { eventos: [] };
  return res.json();
}
