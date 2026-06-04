"use client";

import { useEffect, useState } from "react";
import { useCancionesStore } from "@/store/cancionesStore";
import { Version, Seccion } from "@/types/cancion";
import { transponerAcorde } from "@/lib/utils/transposicion";
import { Star, Minus, Plus, RotateCcw, Maximize2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LineaConAcordes } from "./LineaConAcordes";

const ETIQUETAS_SECCION: Record<string, string> = {
  intro: "Intro", verso: "Verso", "pre-coro": "Pre-Coro", coro: "Coro",
  puente: "Puente", "final-coro": "Final Coro", outro: "Outro", instrumental: "Instrumental",
};

const COLORES_SECCION: Record<string, string> = {
  intro: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  verso: "bg-secondary text-muted-foreground border-border",
  "pre-coro": "bg-orange-500/10 text-orange-400 border-orange-500/30",
  coro: "bg-primary/10 text-primary border-primary/30",
  puente: "bg-green-500/10 text-green-400 border-green-500/30",
  "final-coro": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  outro: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  instrumental: "bg-secondary text-muted-foreground border-border",
};

function etiquetaSeccion(s: Seccion): string {
  const base = ETIQUETAS_SECCION[s.tipo] ?? s.tipo;
  return s.numero ? `${base} ${s.numero}` : base;
}

interface Props { id: string; }

export function VisorCancion({ id }: Props) {
  const { cancionActiva, cargandoCancion, cargarCancionCompleta, toggleFavorita } = useCancionesStore();
  const [versionActiva, setVersionActiva] = useState<Version | null>(null);
  const [semitonos, setSemitonos] = useState(0);

  useEffect(() => {
    cargarCancionCompleta(id);
  }, [id, cargarCancionCompleta]);

  useEffect(() => {
    if (cancionActiva?.id === id) {
      const v = cancionActiva.versions.find((v) => v.es_original) ?? cancionActiva.versions[0];
      setVersionActiva(v ?? null);
      setSemitonos(0);
    }
  }, [cancionActiva, id]);

  if (cargandoCancion || (!cancionActiva && cargandoCancion !== false)) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-card rounded animate-pulse" />
        <div className="h-36 bg-card rounded-xl border border-border animate-pulse" />
        <div className="h-64 bg-card rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!cancionActiva || cancionActiva.id !== id || !versionActiva) {
    if (cargandoCancion) return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-36 bg-card rounded-xl animate-pulse" />
      </div>
    );
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Canción no encontrada</p>
        <Link href="/canciones" className="mt-2 text-primary hover:underline text-sm">Volver a la biblioteca</Link>
      </div>
    );
  }

  const cancion = cancionActiva;
  const tonalidad_transpuesta = transponerAcorde(versionActiva.tonalidad, semitonos);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/canciones" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a la biblioteca
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{cancion.titulo}</h1>
            <p className="text-muted-foreground">{cancion.artista}</p>
            {cancion.autor && cancion.autor !== cancion.artista && (
              <p className="text-xs text-muted-foreground mt-0.5">Autor: {cancion.autor}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => toggleFavorita(cancion.id)} className="p-2 rounded-lg text-muted-foreground hover:text-yellow-400 transition-colors">
              <Star className={cn("w-5 h-5", cancion.favorita && "fill-yellow-400 text-yellow-400")} />
            </button>
            <Link
              href={`/ensayo/${cancion.id}?version=${versionActiva.id}&semitonos=${semitonos}`}
              className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg text-sm hover:bg-primary/20 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              Modo Ensayo
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground flex-wrap">
          <span>🎵 <span className="text-blue-400 font-mono font-semibold">{tonalidad_transpuesta}</span></span>
          {versionActiva.duracion_segundos > 0 && (
            <span>⏱ {Math.floor(versionActiva.duracion_segundos / 60)}:{(versionActiva.duracion_segundos % 60).toString().padStart(2, "0")}</span>
          )}
          {versionActiva.bpm > 0 && <span>♩ {versionActiva.bpm} BPM</span>}
          <span>⏲ {versionActiva.compas}</span>
          {cancion.genero && <span className="bg-secondary px-2 py-0.5 rounded text-xs">{cancion.genero}</span>}
        </div>
      </div>

      {/* Selector versiones */}
      {cancion.versions.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Versión:</span>
          {cancion.versions.map((v) => (
            <button key={v.id} onClick={() => { setVersionActiva(v); setSemitonos(0); }}
              className={cn("px-3 py-1.5 rounded-lg text-sm border transition-colors",
                versionActiva.id === v.id ? "bg-primary/15 text-primary border-primary/40" : "bg-card text-muted-foreground border-border hover:text-foreground")}>
              {v.nombre}
              {v.es_original && <span className="ml-1 text-[10px] text-muted-foreground">(original)</span>}
            </button>
          ))}
        </div>
      )}

      {/* Transpositor */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Transposición</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Original: <span className="font-mono text-blue-400">{versionActiva.tonalidad}</span>
              {semitonos !== 0 && (
                <> → <span className="font-mono text-blue-400">{tonalidad_transpuesta}</span>
                  <span className="ml-1 text-green-400">({semitonos > 0 ? `+${semitonos}` : semitonos} st)</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSemitonos((s) => s - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-primary/20 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-mono font-semibold">
              {semitonos > 0 ? `+${semitonos}` : semitonos}
            </span>
            <button onClick={() => setSemitonos((s) => s + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-primary/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            {semitonos !== 0 && (
              <button onClick={() => setSemitonos(0)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-secondary transition-colors">
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-8">
        {versionActiva.secciones.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Esta versión no tiene secciones definidas.</p>
        ) : (
          versionActiva.secciones.map((seccion) => (
            <div key={seccion.id} className="space-y-2">
              <span className={cn("inline-block text-xs font-semibold px-2.5 py-1 rounded-full border",
                COLORES_SECCION[seccion.tipo] ?? "bg-secondary text-muted-foreground border-border")}>
                {etiquetaSeccion(seccion)}
              </span>
              <div className="space-y-0">
                {seccion.lineas.map((linea, i) => (
                  <LineaConAcordes
                    key={i}
                    texto={linea.texto}
                    acordes={linea.acordes}
                    semitonos={semitonos}
                    tonalidad={versionActiva.tonalidad}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
