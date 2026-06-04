import { DocumentosData } from "@/types/documento";

export async function cargarDocumentos(): Promise<DocumentosData> {
  try {
    const res = await fetch("/data/documentos/documentos.json");
    if (res.ok) return res.json();
  } catch { /* ignore */ }
  return { documentos: [] };
}
