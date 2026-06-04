import { create } from "zustand";
import { Evento } from "@/types/evento";
import { cargarEventos } from "@/lib/data-loader/cargarEventos";

interface EventosState {
  eventos: Evento[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (evento: Evento) => void;
  eliminar: (id: string) => void;
  nuevo: () => Evento;
}

function persistir(eventos: Evento[]) {
  try { localStorage.setItem("eventos-usuario", JSON.stringify(eventos)); } catch { /* ignore */ }
}

export const useEventosStore = create<EventosState>((set, get) => ({
  eventos: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });
    const data = await cargarEventos();
    const base = data.eventos;

    let usuario: Evento[] = [];
    try {
      const saved = localStorage.getItem("eventos-usuario");
      if (saved) usuario = JSON.parse(saved);
    } catch { /* ignore */ }

    // Merge: usuario sobreescribe base por id, los nuevos se agregan
    const mapa = new Map(base.map((e) => [e.id, e]));
    for (const e of usuario) mapa.set(e.id, e);
    set({ eventos: Array.from(mapa.values()), cargando: false });
  },

  guardar: (evento: Evento) => {
    const { eventos } = get();
    const idx = eventos.findIndex((e) => e.id === evento.id);
    const nuevos = idx >= 0
      ? eventos.map((e) => (e.id === evento.id ? evento : e))
      : [...eventos, evento];
    set({ eventos: nuevos });
    persistir(nuevos);
  },

  eliminar: (id: string) => {
    const nuevos = get().eventos.filter((e) => e.id !== id);
    set({ eventos: nuevos });
    persistir(nuevos);
  },

  nuevo: () => ({
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
}));
