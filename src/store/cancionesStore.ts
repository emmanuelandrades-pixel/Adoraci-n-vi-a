import { create } from "zustand";
import { Cancion, CancionResumen } from "@/types/cancion";
import { cargarResumenes, cargarCancion } from "@/lib/data-loader/cargarCanciones";

interface FiltrosCanciones {
  busqueda: string;
  genero: string;
  tonalidad: string;
  soloFavoritas: boolean;
  soloActivas: boolean;
  orden: "recientes" | "az" | "za";
}

interface CancionesState {
  resumenes: CancionResumen[];
  cargandoBiblioteca: boolean;
  cancionActiva: Cancion | null;
  cargandoCancion: boolean;
  filtros: FiltrosCanciones;
  pagina: number;
  porPagina: number;
  cargarBiblioteca: () => Promise<void>;
  cargarCancionCompleta: (id: string) => Promise<void>;
  toggleFavorita: (id: string) => void;
  setFiltros: (filtros: Partial<FiltrosCanciones>) => void;
  setPagina: (pagina: number) => void;
  resumenesFiltrados: () => CancionResumen[];
}

const FILTROS_INICIAL: FiltrosCanciones = {
  busqueda: "",
  genero: "",
  tonalidad: "",
  soloFavoritas: false,
  soloActivas: true,
  orden: "az",
};

export const useCancionesStore = create<CancionesState>((set, get) => ({
  resumenes: [],
  cargandoBiblioteca: false,
  cancionActiva: null,
  cargandoCancion: false,
  filtros: FILTROS_INICIAL,
  pagina: 1,
  porPagina: 12,

  cargarBiblioteca: async () => {
    if (get().resumenes.length > 0) return;
    set({ cargandoBiblioteca: true });
    const resumenes = await cargarResumenes();
    let favoritas: string[] = [];
    try {
      const saved = localStorage.getItem("canciones-favoritas");
      if (saved) favoritas = JSON.parse(saved);
    } catch { /* ignore */ }
    const conFavoritas = resumenes.map((r) => ({
      ...r,
      favorita: favoritas.includes(r.id) ? true : r.favorita,
    }));
    set({ resumenes: conFavoritas, cargandoBiblioteca: false });
  },

  cargarCancionCompleta: async (id: string) => {
    set({ cargandoCancion: true, cancionActiva: null });
    const cancion = await cargarCancion(id);
    const resumen = get().resumenes.find((r) => r.id === id);
    if (cancion && resumen) cancion.favorita = resumen.favorita;
    set({ cancionActiva: cancion, cargandoCancion: false });
  },

  toggleFavorita: (id: string) => {
    const { resumenes, cancionActiva } = get();
    const nuevos = resumenes.map((r) =>
      r.id === id ? { ...r, favorita: !r.favorita } : r
    );
    set({ resumenes: nuevos });
    if (cancionActiva?.id === id) {
      set({ cancionActiva: { ...cancionActiva, favorita: !cancionActiva.favorita } });
    }
    const favoritas = nuevos.filter((r) => r.favorita).map((r) => r.id);
    try { localStorage.setItem("canciones-favoritas", JSON.stringify(favoritas)); } catch { /* ignore */ }
  },

  setFiltros: (filtros) => {
    set((state) => ({ filtros: { ...state.filtros, ...filtros }, pagina: 1 }));
  },

  setPagina: (pagina) => set({ pagina }),

  resumenesFiltrados: () => {
    const { resumenes, filtros } = get();
    let resultado = [...resumenes];
    if (filtros.soloActivas) resultado = resultado.filter((r) => r.activa);
    if (filtros.soloFavoritas) resultado = resultado.filter((r) => r.favorita);
    if (filtros.genero) resultado = resultado.filter((r) => r.genero === filtros.genero);
    if (filtros.tonalidad) resultado = resultado.filter((r) => r.tonalidad === filtros.tonalidad);
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (r) =>
          r.titulo.toLowerCase().includes(q) ||
          r.artista.toLowerCase().includes(q) ||
          r.autor.toLowerCase().includes(q)
      );
    }
    switch (filtros.orden) {
      case "az": resultado.sort((a, b) => a.titulo.localeCompare(b.titulo, "es")); break;
      case "za": resultado.sort((a, b) => b.titulo.localeCompare(a.titulo, "es")); break;
    }
    return resultado;
  },
}));
