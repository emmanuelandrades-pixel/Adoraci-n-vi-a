import { create } from "zustand";
import { Evento } from "@/types/evento";
import { supabase } from "@/lib/supabase";

interface EventosState {
  eventos: Evento[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (evento: Evento) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  nuevo: () => Evento;
  suscribir: () => () => void;
}

export const useEventosStore = create<EventosState>((set, get) => ({
  eventos: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });
    const { data, error } = await supabase
      .from("eventos")
      .select("id, data")
      .order("created_at", { ascending: false });

    if (error) { console.error("Error cargando eventos:", error); set({ cargando: false }); return; }

    const eventos: Evento[] = (data ?? []).map((row) => ({ id: row.id, ...row.data }));
    set({ eventos, cargando: false });
  },

  guardar: async (evento: Evento) => {
    const { id, ...data } = evento;
    const { error } = await supabase
      .from("eventos")
      .upsert({ id, data }, { onConflict: "id" });

    if (error) { console.error("Error guardando evento:", error); return; }

    const { eventos } = get();
    const idx = eventos.findIndex((e) => e.id === id);
    const nuevos = idx >= 0 ? eventos.map((e) => e.id === id ? evento : e) : [...eventos, evento];
    set({ eventos: nuevos });
  },

  eliminar: async (id: string) => {
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) { console.error("Error eliminando evento:", error); return; }
    set({ eventos: get().eventos.filter((e) => e.id !== id) });
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
          set({ eventos: eventos.filter((e) => e.id !== payload.old.id) });
        } else {
          const row = payload.new as { id: string; data: object };
          const updated: Evento = { id: row.id, ...row.data } as Evento;
          const idx = eventos.findIndex((e) => e.id === updated.id);
          set({ eventos: idx >= 0 ? eventos.map((e) => e.id === updated.id ? updated : e) : [updated, ...eventos] });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
}));
