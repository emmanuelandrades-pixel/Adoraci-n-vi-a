import { create } from "zustand";
import { Documento, CategoriaDocumento } from "@/types/documento";
import { cargarDocumentos } from "@/lib/data-loader/cargarDocumentos";
import { supabase } from "@/lib/supabase";

const LS_KEY = "documentos-usuario";

function lsGuardar(docs: Documento[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(docs)); } catch { /* ignore */ }
}
function lsCargar(): Documento[] {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

interface DocumentosState {
  documentos: Documento[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (doc: Documento) => void;
  eliminar: (id: string) => void;
  nuevo: () => Documento;
  suscribir: () => () => void;
}

export const useDocumentosStore = create<DocumentosState>((set, get) => ({
  documentos: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });

    // Documentos base del JSON estático
    const baseData = await cargarDocumentos();
    const base = baseData.documentos;

    // Mostrar base + localStorage mientras carga Supabase
    const lsItems = lsCargar();
    const mapaInicial = new Map(base.map((d) => [d.id, d]));
    for (const d of lsItems) mapaInicial.set(d.id, d);
    set({ documentos: Array.from(mapaInicial.values()) });

    try {
      const { data, error } = await supabase
        .from("documentos")
        .select("id, data")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const deSupabase: Documento[] = (data ?? []).map((row) => ({ id: row.id, ...row.data } as Documento));
      const mapa = new Map(base.map((d) => [d.id, d]));
      for (const d of deSupabase) mapa.set(d.id, d);
      const documentos = Array.from(mapa.values());
      set({ documentos, cargando: false });
      lsGuardar(deSupabase);
    } catch {
      set({ cargando: false });
    }
  },

  guardar: (doc: Documento) => {
    const { documentos } = get();
    const idx = documentos.findIndex((d) => d.id === doc.id);
    const nuevos = idx >= 0
      ? documentos.map((d) => d.id === doc.id ? doc : d)
      : [doc, ...documentos];
    set({ documentos: nuevos });

    const lsItems = lsCargar();
    const lsIdx = lsItems.findIndex((d) => d.id === doc.id);
    const nuevosLs = lsIdx >= 0 ? lsItems.map((d) => d.id === doc.id ? doc : d) : [doc, ...lsItems];
    lsGuardar(nuevosLs);

    const { id, ...data } = doc;
    supabase.from("documentos").upsert({ id, data }, { onConflict: "id" })
      .then(({ error }) => { if (error) console.error("Supabase documento error:", error); });
  },

  eliminar: (id: string) => {
    const nuevos = get().documentos.filter((d) => d.id !== id);
    set({ documentos: nuevos });
    lsGuardar(lsCargar().filter((d) => d.id !== id));

    supabase.from("documentos").delete().eq("id", id)
      .then(({ error }) => { if (error) console.error("Supabase delete documento:", error); });
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
          const nuevos = documentos.filter((d) => d.id !== (payload.old as { id: string }).id);
          set({ documentos: nuevos });
        } else {
          const row = payload.new as { id: string; data: object };
          const updated = { id: row.id, ...row.data } as Documento;
          const idx = documentos.findIndex((d) => d.id === updated.id);
          const nuevos = idx >= 0
            ? documentos.map((d) => d.id === updated.id ? updated : d)
            : [updated, ...documentos];
          set({ documentos: nuevos });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));
