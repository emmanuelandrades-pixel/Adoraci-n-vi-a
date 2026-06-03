import { create } from "zustand";
import { SetList } from "@/types/setlist";
import { cargarSetLists } from "@/lib/data-loader/cargarSetLists";

interface SetListState {
  setlists: SetList[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (setlist: SetList) => void;
  eliminar: (id: string) => void;
  nuevo: () => SetList;
}

export const useSetListStore = create<SetListState>((set, get) => ({
  setlists: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });
    const base = await cargarSetLists();

    const guardados = localStorage.getItem("setlists-usuario");
    const usuario: SetList[] = guardados ? JSON.parse(guardados) : [];

    const todos = [...base];
    for (const u of usuario) {
      if (!todos.find((s) => s.id === u.id)) todos.push(u);
      else {
        const idx = todos.findIndex((s) => s.id === u.id);
        todos[idx] = u;
      }
    }

    set({ setlists: todos, cargando: false });
  },

  guardar: (setlist: SetList) => {
    const { setlists } = get();
    const idx = setlists.findIndex((s) => s.id === setlist.id);
    const nuevos = idx >= 0
      ? setlists.map((s) => (s.id === setlist.id ? setlist : s))
      : [...setlists, setlist];

    set({ setlists: nuevos });

    localStorage.setItem("setlists-usuario", JSON.stringify(nuevos));
  },

  eliminar: (id: string) => {
    const { setlists } = get();
    const nuevos = setlists.filter((s) => s.id !== id);
    set({ setlists: nuevos });
    localStorage.setItem("setlists-usuario", JSON.stringify(nuevos));
  },

  nuevo: () => {
    const id = `setlist-${Date.now()}`;
    const sl: SetList = {
      id,
      nombre: "Nuevo Set List",
      evento_id: null,
      evento_detalles: {
        nombre: "",
        fecha: new Date().toISOString().split("T")[0],
        hora: "10:00",
        lugar: "",
      },
      metadata: {
        creado: new Date().toISOString(),
        modificado: new Date().toISOString(),
        descripcion: "",
      },
      duracion_total_segundos: 0,
      canciones: [],
    };
    return sl;
  },
}));
