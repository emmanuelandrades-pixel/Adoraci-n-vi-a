import { create } from "zustand";
import { SetList } from "@/types/setlist";
import { supabase } from "@/lib/supabase";

const LS_KEY = "setlists-usuario";

function lsGuardar(setlists: SetList[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(setlists)); } catch { /* ignore */ }
}
function lsCargar(): SetList[] {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

interface SetListState {
  setlists: SetList[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (setlist: SetList) => void;
  eliminar: (id: string) => void;
  nuevo: () => SetList;
  suscribir: () => () => void;
}

export const useSetListStore = create<SetListState>((set, get) => ({
  setlists: [],
  cargando: false,

  cargar: async () => {
    // Mostrar localStorage inmediatamente mientras carga Supabase
    set({ cargando: true, setlists: lsCargar() });

    try {
      const { data, error } = await supabase
        .from("setlists")
        .select("id, data")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const setlists: SetList[] = (data ?? []).map((row) => ({ id: row.id, ...row.data } as SetList));
      set({ setlists, cargando: false });
      lsGuardar(setlists);
    } catch {
      // Supabase no disponible — seguir con localStorage
      set({ cargando: false });
    }
  },

  guardar: (setlist: SetList) => {
    // Actualización optimista inmediata
    const { setlists } = get();
    const idx = setlists.findIndex((s) => s.id === setlist.id);
    const nuevos = idx >= 0
      ? setlists.map((s) => s.id === setlist.id ? setlist : s)
      : [setlist, ...setlists];
    set({ setlists: nuevos });
    lsGuardar(nuevos);

    // Persistir en Supabase en segundo plano
    const { id, ...data } = setlist;
    supabase.from("setlists").upsert({ id, data }, { onConflict: "id" })
      .then(({ error }) => { if (error) console.error("Supabase setlist error:", error); });
  },

  eliminar: (id: string) => {
    // Optimista
    const nuevos = get().setlists.filter((s) => s.id !== id);
    set({ setlists: nuevos });
    lsGuardar(nuevos);

    supabase.from("setlists").delete().eq("id", id)
      .then(({ error }) => { if (error) console.error("Supabase delete setlist:", error); });
  },

  nuevo: () => {
    const id = `setlist-${Date.now()}`;
    return {
      id,
      nombre: "Nuevo Set List",
      evento_id: null,
      evento_detalles: { nombre: "", fecha: new Date().toISOString().split("T")[0], hora: "10:00", lugar: "" },
      metadata: { creado: new Date().toISOString(), modificado: new Date().toISOString(), descripcion: "" },
      duracion_total_segundos: 0,
      canciones: [],
    };
  },

  suscribir: () => {
    const channel = supabase
      .channel("setlists-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "setlists" }, (payload) => {
        const { setlists } = get();
        if (payload.eventType === "DELETE") {
          const nuevos = setlists.filter((s) => s.id !== (payload.old as { id: string }).id);
          set({ setlists: nuevos }); lsGuardar(nuevos);
        } else {
          const row = payload.new as { id: string; data: object };
          const updated = { id: row.id, ...row.data } as SetList;
          const idx = setlists.findIndex((s) => s.id === updated.id);
          const nuevos = idx >= 0
            ? setlists.map((s) => s.id === updated.id ? updated : s)
            : [updated, ...setlists];
          set({ setlists: nuevos }); lsGuardar(nuevos);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));
