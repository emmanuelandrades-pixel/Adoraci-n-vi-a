import { create } from "zustand";
import { SetList } from "@/types/setlist";
import { supabase } from "@/lib/supabase";

interface SetListState {
  setlists: SetList[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (setlist: SetList) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  nuevo: () => SetList;
  suscribir: () => () => void;
}

export const useSetListStore = create<SetListState>((set, get) => ({
  setlists: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });
    const { data, error } = await supabase
      .from("setlists")
      .select("id, data")
      .order("created_at", { ascending: false });

    if (error) { console.error("Error cargando setlists:", error); set({ cargando: false }); return; }

    const setlists: SetList[] = (data ?? []).map((row) => ({ id: row.id, ...row.data }));
    set({ setlists, cargando: false });
  },

  guardar: async (setlist: SetList) => {
    const { id, ...data } = setlist;
    const { error } = await supabase
      .from("setlists")
      .upsert({ id, data }, { onConflict: "id" });

    if (error) { console.error("Error guardando setlist:", error); return; }

    const { setlists } = get();
    const idx = setlists.findIndex((s) => s.id === id);
    const nuevos = idx >= 0 ? setlists.map((s) => s.id === id ? setlist : s) : [...setlists, setlist];
    set({ setlists: nuevos });
  },

  eliminar: async (id: string) => {
    const { error } = await supabase.from("setlists").delete().eq("id", id);
    if (error) { console.error("Error eliminando setlist:", error); return; }
    set({ setlists: get().setlists.filter((s) => s.id !== id) });
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
          set({ setlists: setlists.filter((s) => s.id !== payload.old.id) });
        } else {
          const row = payload.new as { id: string; data: object };
          const updated: SetList = { id: row.id, ...row.data } as SetList;
          const idx = setlists.findIndex((s) => s.id === updated.id);
          set({ setlists: idx >= 0 ? setlists.map((s) => s.id === updated.id ? updated : s) : [updated, ...setlists] });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
}));
