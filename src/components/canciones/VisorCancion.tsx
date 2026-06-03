"use client";

import { useEffect, useState } from "react";
import { useCancionesStore } from "@/store/cancionesStore";
import { Cancion, Version, Seccion } from "@/types/cancion";
import { transponerAcorde } from "@/lib/utils/transposicion";
import { Star, ChevronDown, ChevronUp, Minus, Plus, RotateCcw, Maximize2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ETIQUETAS_SECCION: Record<string, string> = {
  intro: "Intro",
  verso: "Verso",
  "pre-coro": "Pre-Coro",
  coro: "Coro",
  puente: "Puente",
  "final-coro": "Final Coro",
  outro: "Outro",
  instrumental: "Instrumental",
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

function etiquetaSeccion(seccion: Seccion): string {
  const base = ETIQUETAS_SECCION[seccion.tipo] ?? seccion.tipo;
  return seccion.numero ? `${base} ${seccion.numero}` : base;
}

interface SeccionViewProps {
  seccion: Seccion;
  semitonos: number;
  tonalidad: string;
}

function SeccionView({ seccion, semitonos, tonalidad }: SeccionViewProps) {
  const acordesTranspuestos = seccion.acordes.map((a) =>
    transponerAcorde(a, semitonos, tonalidad)
  );

  return (
    <div className="space-y-3">
      {/* Etiqueta */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-xs font-semibold px-2.5 py-1 rounded-full border",
          COLORES_SECCION[seccion.tipo] ?? "bg-secondary text-muted-foreground border-border"
        )}>
          {etiquetaSeccion(seccion)}
        </span>
        {acordesTranspuestos.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {acordesTranspuestos.map((a, i) => (
              <span key={i} className="text-xs font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Contenido */}
      <pre className="font-sans text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {seccion.contenido}
      </pre>
    </div>
  );
}

interface Props {
  id: string;
}

export function VisorCancion({ id }: Props) {
  const { canciones, cargando, cargar, toggleFavorita } = useCancionesStore();
  const [cancion, setCancion] = useState<Cancion | null>(null);
  const [versionActiva, setVersionActiva] = useState<Version | null>(null);
  const [semitonos, setSemitonos] = useState(0);

  useEffect(() => {
    if (canciones.length === 0) cargar();
  }, []);

  useEffect(() => {
    const c = canciones.find((c) => c.id === id);
    if (c) {
      setCancion(c);
      setVersionActiva(c.versions.find((v) => v.es_original) ?? c.versions[0]);
    }
  }, [canciones, id]);

  if (cargando) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-card rounded animate-pulse" />
        <div className="h-32 bg-card rounded-xl animate-pulse" />
        <div className="h-48 bg-card rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!cancion || !versionActiva) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Canción no encontrada</p>
        <Link href="/canciones" className="mt-2 text-primary hover:underline text-sm">
          Volver a la biblioteca
        </Link>
      </div>
    );
  }

  const tonalidad_transpuesta = transponerAcorde(versionActiva.tonalidad, semitonos);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navegación */}
      <Link
        href="/canciones"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
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
            <button
              onClick={() => toggleFavorita(cancion.id)}
              className="p-2 rounded-lg text-muted-foreground hover:text-yellow-400 transition-colors"
            >
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

        {/* Metadatos */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground flex-wrap">
          <span>🎵 Tonalidad: <span className="text-blue-400 font-mono font-semibold">{tonalidad_transpuesta}</span></span>
          <span>⏱ {Math.floor(versionActiva.duracion_segundos / 60)}:{(versionActiva.duracion_segundos % 60).toString().padStart(2, "0")}</span>
          <span>♩ {versionActiva.bpm} BPM</span>
          <span>⏲ {versionActiva.compas}</span>
          <span className="bg-secondary px-2 py-0.5 rounded text-xs">{cancion.genero}</span>
        </div>
      </div>

      {/* Selector de versiones */}
      {cancion.versions.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Versión:</span>
          {cancion.versions.map((v) => (
            <button
              key={v.id}
              onClick={() => { setVersionActiva(v); setSemitonos(0); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                versionActiva.id === v.id
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
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
                <> → Transpuesto: <span className="font-mono text-blue-400">{tonalidad_transpuesta}</span>
                  <span className="ml-1 text-green-400">({semitonos > 0 ? `+${semitonos}` : semitonos} semitonos)</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSemitonos((s) => s - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-primary/20 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-mono font-semibold text-foreground">
              {semitonos > 0 ? `+${semitonos}` : semitonos}
            </span>
            <button
              onClick={() => setSemitonos((s) => s + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            {semitonos !== 0 && (
              <button
                onClick={() => setSemitonos(0)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-secondary transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {versionActiva.secciones.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            Esta versión no tiene secciones definidas aún.
          </p>
        ) : (
          versionActiva.secciones.map((seccion) => (
            <div key={seccion.id}>
              <SeccionView seccion={seccion} semitonos={semitonos} tonalidad={versionActiva.tonalidad} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
