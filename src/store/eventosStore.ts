import { create } from "zustand";
import { Evento } from "@/types/evento";
import { supabase } from "@/lib/supabase";

const LS_KEY = "eventos-usuario";

function lsGuardar(eventos: Evento[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(eventos)); } catch { /* ignore */ }
}
function lsCargar(): Evento[] {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

interface EventosState {
  eventos: Evento[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (evento: Evento) => void;
  eliminar: (id: string) => void;
  nuevo: () => Evento;
  suscribir: () => () => void;
}

export const useEventosStore = create<EventosState>((set, get) => ({
  eventos: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true, eventos: lsCargar() });

    try {
      const { data, error } = await supabase
        .from("eventos")
        .select("id, data")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const eventos: Evento[] = (data ?? []).map((row) => ({ id: row.id, ...row.data } as Evento));
      set({ eventos, cargando: false });
      lsGuardar(eventos);
    } catch {
      set({ cargando: false });
    }
  },

  guardar: (evento: Evento) => {
    const { eventos } = get();
    const idx = eventos.findIndex((e) => e.id === evento.id);
    const nuevos = idx >= 0
      ? eventos.map((e) => e.id === evento.id ? evento : e)
      : [evento, ...eventos];
    set({ eventos: nuevos });
    lsGuardar(nuevos);

    const { id, ...data } = evento;
    supabase.from("eventos").upsert({ id, data }, { onConflict: "id" })
      .then(({ error }) => { if (error) console.error("Supabase evento error:", error); });
  },

  eliminar: (id: string) => {
    const nuevos = get().eventos.filter((e) => e.id !== id);
    set({ eventos: nuevos });
    lsGuardar(nuevos);

    supabase.from("eventos").delete().eq("id", id)
      .then(({ error }) => { if (error) console.error("Supabase delete evento:", error); });
  },

  nuevo: (): Evento => ({
    id: `evento-${Date.now()}`,
    nombre: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "10:00",
    lugar: "",
    descripcion: "",
    tipo: "culto",
    estado: "confirmado",
    setlists: [],
  }),

  suscribir: () => {
    const channel = supabase
      .channel("eventos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, (payload) => {
        const { eventos } = get();
        if (payload.eventType === "DELETE") {
          const nuevos = eventos.filter((e) => e.id !== (payload.old as { id: string }).id);
          set({ eventos: nuevos }); lsGuardar(nuevos);
        } else {
          const row = payload.new as { id: string; data: object };
          const updated = { id: row.id, ...row.data } as Evento;
          const idx = eventos.findIndex((e) => e.id === updated.id);
          const nuevos = idx >= 0
            ? eventos.map((e) => e.id === updated.id ? updated : e)
            : [updated, ...eventos];
          set({ eventos: nuevos }); lsGuardar(nuevos);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));
