"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCancionesStore } from "@/store/cancionesStore";
import { Cancion, Version, Seccion } from "@/types/cancion";
import { transponerAcorde } from "@/lib/utils/transposicion";
import {
  X, ChevronLeft, ChevronRight, Minus, Plus,
  Play, Pause, Settings
} from "lucide-react";
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
};

interface Props { id: string; }

export function ModoEnsayo({ id }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canciones, cargar } = useCancionesStore();

  const [cancion, setCancion] = useState<Cancion | null>(null);
  const [version, setVersion] = useState<Version | null>(null);
  const [seccionIdx, setSeccionIdx] = useState(0);
  const [semitonos, setSemitonos] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);

  useEffect(() => {
    if (canciones.length === 0) cargar();
  }, []);

  useEffect(() => {
    const c = canciones.find((c) => c.id === id);
    if (!c) return;
    setCancion(c);
    const versionId = searchParams.get("version");
    const v = versionId
      ? c.versions.find((v) => v.id === versionId) ?? c.versions[0]
      : c.versions.find((v) => v.es_original) ?? c.versions[0];
    setVersion(v);
    const semi = parseInt(searchParams.get("semitonos") ?? "0", 10);
    setSemitonos(isNaN(semi) ? 0 : semi);
  }, [canciones, id, searchParams]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      autoScrollRef.current = window.setInterval(() => {
        if (scrollRef.current) scrollRef.current.scrollTop += scrollSpeed;
      }, 50);
    } else {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    }
    return () => { if (autoScrollRef.current) clearInterval(autoScrollRef.current); };
  }, [autoScroll, scrollSpeed]);

  // Teclado
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!version) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      setSeccionIdx((i) => Math.min(i + 1, version.secciones.length - 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      setSeccionIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      router.back();
    } else if (e.key === " ") {
      e.preventDefault();
      setAutoScroll((a) => !a);
    }
  }, [version, router]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!cancion || !version) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  const secciones = version.secciones;
  const seccionActual = secciones[seccionIdx];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Barra superior */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300",
          "bg-black/80 backdrop-blur-sm border-b border-white/10"
        )}
      >
        <div>
          <p className="font-bold text-lg">{cancion.titulo}</p>
          <p className="text-sm text-white/60">{version.nombre} · {transponerAcorde(version.tonalidad, semitonos)}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Transposición */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1">
            <button onClick={() => setSemitonos((s) => s - 1)} className="p-1 hover:text-white/60">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono w-6 text-center">{semitonos > 0 ? `+${semitonos}` : semitonos}</span>
            <button onClick={() => setSemitonos((s) => s + 1)} className="p-1 hover:text-white/60">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Tamaño fuente */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1">
            <button onClick={() => setFontSize((f) => Math.max(14, f - 2))} className="p-1 text-xs hover:text-white/60">A-</button>
            <button onClick={() => setFontSize((f) => Math.min(40, f + 2))} className="p-1 text-xs hover:text-white/60">A+</button>
          </div>

          {/* Auto-scroll */}
          <button
            onClick={() => setAutoScroll((a) => !a)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
              autoScroll ? "bg-green-500/30 text-green-400" : "bg-white/10"
            )}
          >
            {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            Scroll
          </button>

          <button onClick={() => router.back()} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-20 pb-24 px-6 max-w-3xl mx-auto w-full">
        {/* Secciones */}
        {secciones.map((seccion, idx) => {
          const esActual = idx === seccionIdx;
          const acordes = seccion.acordes.map((a) => transponerAcorde(a, semitonos, version.tonalidad));

          return (
            <div
              key={seccion.id}
              onClick={() => setSeccionIdx(idx)}
              className={cn(
                "mb-8 p-5 rounded-xl border transition-all duration-200 cursor-pointer",
                esActual
                  ? "border-purple-500/50 bg-purple-500/5"
                  : "border-white/5 bg-white/2 opacity-50 hover:opacity-75"
              )}
            >
              {/* Etiqueta */}
              <div className="flex items-center gap-3 mb-3">
                <span className={cn(
                  "text-xs font-bold tracking-widest",
                  COLORES[seccion.tipo] ?? "text-white/50"
                )}>
                  {seccion.numero ? `${ETIQUETAS[seccion.tipo] ?? seccion.tipo} ${seccion.numero}` : ETIQUETAS[seccion.tipo] ?? seccion.tipo}
                </span>
                <div className="flex gap-1.5">
                  {acordes.map((a, i) => (
                    <span key={i} className="text-xs font-mono text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Letra */}
              <pre
                className="font-sans text-white/90 leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: `${fontSize}px` }}
              >
                {seccion.contenido}
              </pre>
            </div>
          );
        })}
      </div>

      {/* Navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-6 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={() => setSeccionIdx((i) => Math.max(0, i - 1))}
            disabled={seccionIdx === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {secciones.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSeccionIdx(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === seccionIdx ? "bg-purple-400 w-4" : "bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => setSeccionIdx((i) => Math.min(secciones.length - 1, i + 1))}
            disabled={seccionIdx === secciones.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
