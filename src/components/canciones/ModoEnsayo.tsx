"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCancionesStore } from "@/store/cancionesStore";
import { Cancion, Version } from "@/types/cancion";
import { transponerAcorde } from "@/lib/utils/transposicion";
import { X, ChevronLeft, ChevronRight, Minus, Plus, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const ETIQUETAS: Record<string, string> = {
  intro: "INTRO", verso: "VERSO", "pre-coro": "PRE-CORO",
  coro: "CORO", puente: "PUENTE", "final-coro": "FINAL CORO",
  outro: "OUTRO", instrumental: "INSTRUMENTAL",
};

const COLORES: Record<string, string> = {
  coro: "text-purple-400",
  puente: "text-green-400",
  "pre-coro": "text-orange-400",
  intro: "text-blue-400",
  outro: "text-blue-400",
  instrumental: "text-yellow-400",
};

interface Props { id: string; }

export function ModoEnsayo({ id }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cancionActiva, cargarCancionCompleta } = useCancionesStore();

  const [cancion, setCancion] = useState<Cancion | null>(null);
  const [version, setVersion] = useState<Version | null>(null);
  const [seccionIdx, setSeccionIdx] = useState(0);
  const [semitonos, setSemitonos] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed] = useState(2);

  // Refs para auto-scroll (sin re-renders)
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const speedRef = useRef(2);
  const animFrameRef = useRef<number | null>(null);

  // Sincronizar speed state → speedRef
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    cargarCancionCompleta(id);
  }, [id, cargarCancionCompleta]);

  useEffect(() => {
    if (!cancionActiva || cancionActiva.id !== id) return;
    setCancion(cancionActiva);
    const versionId = searchParams.get("version");
    const v = versionId
      ? cancionActiva.versions.find((v) => v.id === versionId) ?? cancionActiva.versions[0]
      : cancionActiva.versions.find((v) => v.es_original) ?? cancionActiva.versions[0];
    setVersion(v ?? null);
    const semi = parseInt(searchParams.get("semitonos") ?? "0", 10);
    setSemitonos(isNaN(semi) ? 0 : semi);
  }, [cancionActiva, id, searchParams]);

  // px por frame según nivel (1–10), curva progresiva
  const SPEED_TABLE = [0, 0.28, 0.38, 0.5, 0.65, 0.82, 1.0, 1.25, 1.55, 1.9, 2.3];

  // Loop de auto-scroll con requestAnimationFrame
  const scrollLoop = useCallback(() => {
    if (!isScrollingRef.current || !containerRef.current) return;
    const el = containerRef.current;
    el.scrollTop += SPEED_TABLE[speedRef.current] ?? 0.28;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      // Llegó al final
      isScrollingRef.current = false;
      setScrolling(false);
      return;
    }
    animFrameRef.current = requestAnimationFrame(scrollLoop);
  }, []);

  const toggleScroll = useCallback(() => {
    const next = !isScrollingRef.current;
    isScrollingRef.current = next;
    setScrolling(next);
    if (next) animFrameRef.current = requestAnimationFrame(scrollLoop);
    else if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [scrollLoop]);

  const reiniciar = useCallback(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    isScrollingRef.current = false;
    setScrolling(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); toggleScroll(); }
      else if (e.key === "Escape") router.back();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setSeccionIdx((i) => version ? Math.min(i + 1, version.secciones.length - 1) : i);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setSeccionIdx((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [toggleScroll, router, version]);

  if (!cancion || !version) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  const secciones = version.secciones;

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      {/* Barra superior */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-sm border-b border-white/10">
        {/* Fila 1: título + controles principales */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0 flex-1 mr-2">
            <p className="font-bold text-sm truncate">{cancion.titulo}</p>
            <p className="text-xs text-white/50">{version.nombre} · {transponerAcorde(version.tonalidad, semitonos)}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Reiniciar */}
            <button
              onClick={reiniciar}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Volver al inicio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={toggleScroll}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                scrolling ? "bg-green-500/30 text-green-400 border border-green-500/30" : "bg-white/10 hover:bg-white/20"
              )}
              title="Espacio para pausar/reanudar"
            >
              {scrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{scrolling ? "Pausar" : "Scroll"}</span>
            </button>

            <button onClick={() => router.back()} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fila 2: controles secundarios */}
        <div className="flex items-center gap-2 px-3 pb-2">
          {/* Transposición */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
            <button onClick={() => setSemitonos((s) => s - 1)} className="p-0.5 hover:text-white/60 text-xs">−</button>
            <span className="text-xs font-mono w-6 text-center">{semitonos > 0 ? `+${semitonos}` : semitonos}</span>
            <button onClick={() => setSemitonos((s) => s + 1)} className="p-0.5 hover:text-white/60 text-xs">+</button>
          </div>

          {/* Fuente */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
            <button onClick={() => setFontSize((f) => Math.max(12, f - 2))} className="p-0.5 text-xs hover:text-white/60">A−</button>
            <button onClick={() => setFontSize((f) => Math.min(40, f + 2))} className="p-0.5 text-xs hover:text-white/60">A+</button>
          </div>

          {/* Velocidad scroll */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
            <button
              onClick={() => setSpeed((s) => Math.max(1, s - 1))}
              className="p-0.5 text-xs hover:text-white/60"
              title="Más lento"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono w-4 text-center">{speed}</span>
            <button
              onClick={() => setSpeed((s) => Math.min(10, s + 1))}
              className="p-0.5 text-xs hover:text-white/60"
              title="Más rápido"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pt-24 pb-20 px-4 md:px-6"
        style={{ scrollBehavior: "auto" }}
      >
        <div className="max-w-3xl mx-auto">
          {secciones.map((seccion, idx) => {
            const esActual = idx === seccionIdx;
            return (
              <div
                key={seccion.id}
                onClick={() => setSeccionIdx(idx)}
                className={cn(
                  "mb-8 p-5 rounded-xl border transition-all duration-200 cursor-pointer",
                  esActual
                    ? "border-purple-500/50 bg-purple-500/5"
                    : "border-white/5 opacity-50 hover:opacity-75"
                )}
              >
                {/* Etiqueta */}
                <div className="mb-3">
                  <span className={cn("text-xs font-bold tracking-widest", COLORES[seccion.tipo] ?? "text-white/50")}>
                    {seccion.numero
                      ? `${ETIQUETAS[seccion.tipo] ?? seccion.tipo} ${seccion.numero}`
                      : ETIQUETAS[seccion.tipo] ?? seccion.tipo}
                  </span>
                </div>

                {/* Formato nuevo: líneas con acordes posicionados */}
                {seccion.lineas && seccion.lineas.length > 0 && (
                  <div className="space-y-0.5">
                    {seccion.lineas.map((linea, i) => {
                      let lineaAcordes = "";
                      for (const { acorde, pos } of linea.acordes) {
                        const a = transponerAcorde(acorde, semitonos, version.tonalidad);
                        while (lineaAcordes.length < pos) lineaAcordes += " ";
                        lineaAcordes += a + " ";
                      }
                      return (
                        <div key={i}>
                          {linea.acordes.length > 0 && (
                            <pre
                              className="font-mono text-blue-400 font-semibold whitespace-pre leading-tight select-none"
                              style={{ fontSize: `${Math.round(fontSize * 0.78)}px` }}
                            >
                              {lineaAcordes}
                            </pre>
                          )}
                          {linea.texto !== "" && (
                            <pre
                              className="font-mono text-white/90 whitespace-pre leading-snug"
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {linea.texto}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/85 backdrop-blur-sm border-t border-white/10 px-4 py-2">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={() => setSeccionIdx((i) => Math.max(0, i - 1))}
            disabled={seccionIdx === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {secciones.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSeccionIdx(idx)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === seccionIdx ? "bg-purple-400 w-4" : "bg-white/20 w-2 hover:bg-white/40"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => setSeccionIdx((i) => Math.min(secciones.length - 1, i + 1))}
            disabled={seccionIdx === secciones.length - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
