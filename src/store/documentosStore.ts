import { create } from "zustand";
import { Documento, CategoriaDocumento } from "@/types/documento";
import { cargarDocumentos } from "@/lib/data-loader/cargarDocumentos";
import { supabase } from "@/lib/supabase";

interface DocumentosState {
  documentos: Documento[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (doc: Documento) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  nuevo: () => Documento;
  suscribir: () => () => void;
}

export const useDocumentosStore = create<DocumentosState>((set, get) => ({
  documentos: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });

    // Documentos base del JSON (estáticos, ej: la guía de canciones)
    const baseData = await cargarDocumentos();
    const base = baseData.documentos;

    // Documentos creados por los integrantes en Supabase
    const { data, error } = await supabase
      .from("documentos")
      .select("id, data")
      .order("created_at", { ascending: false });

    if (error) { console.error("Error cargando documentos:", error); }

    const deSupabase: Documento[] = (data ?? []).map((row) => ({ id: row.id, ...row.data }));

    // Supabase sobreescribe base por id; los nuevos se agregan
    const mapa = new Map(base.map((d) => [d.id, d]));
    for (const d of deSupabase) mapa.set(d.id, d);

    set({ documentos: Array.from(mapa.values()), cargando: false });
  },

  guardar: async (doc: Documento) => {
    const { id, ...data } = doc;
    const { error } = await supabase
      .from("documentos")
      .upsert({ id, data }, { onConflict: "id" });

    if (error) { console.error("Error guardando documento:", error); return; }

    const { documentos } = get();
    const idx = documentos.findIndex((d) => d.id === id);
    const nuevos = idx >= 0 ? documentos.map((d) => d.id === id ? doc : d) : [...documentos, doc];
    set({ documentos: nuevos });
  },

  eliminar: async (id: string) => {
    const { error } = await supabase.from("documentos").delete().eq("id", id);
    if (error) { console.error("Error eliminando documento:", error); return; }
    set({ documentos: get().documentos.filter((d) => d.id !== id) });
  },

  nuevo: (): Documento => ({
    id: `doc-${Date.now()}`,
    titulo: "",
    categoria: "otro" as CategoriaDocumento,
    descripcion: "",
    url: "",
    subido_por: "",
    fecha: new Date().toISOString().split("T")[0],
  }),

  suscribir: () => {
    const channel = supabase
      .channel("documentos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "documentos" }, (payload) => {
        const { documentos } = get();
        if (payload.eventType === "DELETE") {
          set({ documentos: documentos.filter((d) => d.id !== payload.old.id) });
        } else {
          const row = payload.new as { id: string; data: object };
          const updated: Documento = { id: row.id, ...row.data } as Documento;
          const idx = documentos.findIndex((d) => d.id === updated.id);
          set({ documentos: idx >= 0 ? documentos.map((d) => d.id === updated.id ? updated : d) : [updated, ...documentos] });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
}));
