import { MinisterioConfig } from "@/types/ministerio";

export async function cargarMinisterio(): Promise<MinisterioConfig | null> {
  try {
    const res = await fetch("/data/config/ministry.json");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
