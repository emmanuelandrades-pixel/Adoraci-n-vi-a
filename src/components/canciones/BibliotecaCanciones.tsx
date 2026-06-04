"use client";

import { useEffect } from "react";
import { useCancionesStore } from "@/store/cancionesStore";
import { CardCancion } from "./CardCancion";
import { Search, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GENEROS = ["Adoración", "Alabanza", "Gozo", "Reflexión", "Ofertorio"];
const TONALIDADES = ["C","C#","Db","D","D#","Eb","E","F","F#","G","Ab","A","Bb","B"];
const ORDENES = [
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "recientes", label: "Recientes" },
];

export function BibliotecaCanciones() {
  const {
    cargarBiblioteca, cargandoBiblioteca,
    filtros, setFiltros,
    pagina, setPagina, porPagina,
    resumenesFiltrados,
  } = useCancionesStore();

  useEffect(() => { cargarBiblioteca(); }, [cargarBiblioteca]);

  const todas = resumenesFiltrados();
  const totalPaginas = Math.max(1, Math.ceil(todas.length / porPagina));
  const canciones = todas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div className="space-y-6">
      {/* Búsqueda y filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar canción, artista..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros({ busqueda: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filtros.genero}
            onChange={(e) => setFiltros({ genero: e.target.value })}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todos los géneros</option>
            {GENEROS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={filtros.tonalidad}
            onChange={(e) => setFiltros({ tonalidad: e.target.value })}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todas las tonalidades</option>
            {TONALIDADES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filtros.orden}
            onChange={(e) => setFiltros({ orden: e.target.value as "recientes" | "az" | "za" })}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {ORDENES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFiltros({ soloFavoritas: !filtros.soloFavoritas })}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors",
              filtros.soloFavoritas
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Star className="w-3.5 h-3.5" />
            Favoritas
          </button>
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{todas.length} canciones</span>
        {totalPaginas > 1 && <span>Página {pagina} de {totalPaginas}</span>}
      </div>

      {/* Grid */}
      {cargandoBiblioteca ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : canciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Search className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No se encontraron canciones</p>
          <p className="text-sm mt-1">Prueba con otros filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {canciones.map((r) => <CardCancion key={r.id} resumen={r} />)}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}
            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button key={i} onClick={() => setPagina(i + 1)}
              className={cn("w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                pagina === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPagina(pagina + 1)} disabled={pagina === totalPaginas}
            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
