import { create } from "zustand";
import { Cancion } from "@/types/cancion";
import { cargarCanciones } from "@/lib/data-loader/cargarCanciones";

interface FiltrosCanciones {
  busqueda: string;
  genero: string;
  tonalidad: string;
  soloFavoritas: boolean;
  soloActivas: boolean;
  orden: "recientes" | "az" | "za";
}

interface CancionesState {
  canciones: Cancion[];
  cargando: boolean;
  filtros: FiltrosCanciones;
  pagina: number;
  porPagina: number;
  cargar: () => Promise<void>;
  toggleFavorita: (id: string) => void;
  setFiltros: (filtros: Partial<FiltrosCanciones>) => void;
  setPagina: (pagina: number) => void;
  cancionesFiltradas: () => Cancion[];
}

const FILTROS_INICIAL: FiltrosCanciones = {
  busqueda: "",
  genero: "",
  tonalidad: "",
  soloFavoritas: false,
  soloActivas: true,
  orden: "recientes",
};

export const useCancionesStore = create<CancionesState>((set, get) => ({
  canciones: [],
  cargando: false,
  filtros: FILTROS_INICIAL,
  pagina: 1,
  porPagina: 12,

  cargar: async () => {
    set({ cargando: true });
    const canciones = await cargarCanciones();

    // Cargar favoritas desde localStorage
    const favoritasGuardadas = localStorage.getItem("canciones-favoritas");
    const favoritas: string[] = favoritasGuardadas ? JSON.parse(favoritasGuardadas) : [];

    const cancionesConFavoritas = canciones.map((c) => ({
      ...c,
      favorita: favoritas.includes(c.id) ? true : c.favorita,
    }));

    set({ canciones: cancionesConFavoritas, cargando: false });
  },

  toggleFavorita: (id: string) => {
    const { canciones } = get();
    const nuevas = canciones.map((c) =>
      c.id === id ? { ...c, favorita: !c.favorita } : c
    );
    set({ canciones: nuevas });

    const favoritas = nuevas.filter((c) => c.favorita).map((c) => c.id);
    localStorage.setItem("canciones-favoritas", JSON.stringify(favoritas));
  },

  setFiltros: (filtros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...filtros },
      pagina: 1,
    }));
  },

  setPagina: (pagina) => set({ pagina }),

  cancionesFiltradas: () => {
    const { canciones, filtros } = get();
    let resultado = [...canciones];

    if (filtros.soloActivas) resultado = resultado.filter((c) => c.activa);
    if (filtros.soloFavoritas) resultado = resultado.filter((c) => c.favorita);
    if (filtros.genero) resultado = resultado.filter((c) => c.genero === filtros.genero);
    if (filtros.tonalidad) {
      resultado = resultado.filter((c) =>
        c.versions.some((v) => v.tonalidad === filtros.tonalidad)
      );
    }
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.titulo.toLowerCase().includes(q) ||
          c.artista.toLowerCase().includes(q) ||
          c.autor.toLowerCase().includes(q)
      );
    }

    switch (filtros.orden) {
      case "az":
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case "za":
        resultado.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
      case "recientes":
      default:
        resultado.sort(
          (a, b) =>
            new Date(b.fecha_actualizacion).getTime() -
            new Date(a.fecha_actualizacion).getTime()
        );
    }

    return resultado;
  },
}));
