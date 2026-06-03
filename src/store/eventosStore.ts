import { create } from "zustand";
import { Evento } from "@/types/evento";
import { cargarEventos } from "@/lib/data-loader/cargarEventos";

interface EventosState {
  eventos: Evento[];
  cargando: boolean;
  cargar: () => Promise<void>;
}

export const useEventosStore = create<EventosState>((set) => ({
  eventos: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });
    const data = await cargarEventos();
    set({ eventos: data.eventos, cargando: false });
  },
}));
