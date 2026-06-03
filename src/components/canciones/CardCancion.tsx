"use client";

import Link from "next/link";
import { Cancion } from "@/types/cancion";
import { useCancionesStore } from "@/store/cancionesStore";
import { Star, Music, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  cancion: Cancion;
}

function segundosAMinutos(s: number): string {
  const m = Math.floor(s / 60);
  const seg = s % 60;
  return `${m}:${seg.toString().padStart(2, "0")}`;
}

const BADGE_GENERO: Record<string, string> = {
  "Adoración": "bg-purple-500/20 text-purple-300",
  "Alabanza": "bg-blue-500/20 text-blue-300",
  "Gozo": "bg-green-500/20 text-green-300",
  "Reflexión": "bg-orange-500/20 text-orange-300",
};

export function CardCancion({ cancion }: Props) {
  const { toggleFavorita } = useCancionesStore();
  const versionOriginal = cancion.versions.find((v) => v.es_original) ?? cancion.versions[0];

  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200">
      {/* Botón favorita */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorita(cancion.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-yellow-400 transition-colors z-10"
        title={cancion.favorita ? "Quitar de favoritas" : "Agregar a favoritas"}
      >
        <Star
          className={cn("w-4 h-4", cancion.favorita && "fill-yellow-400 text-yellow-400")}
        />
      </button>

      <Link href={`/canciones/${cancion.id}`} className="block">
        {/* Ícono */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <Music className="w-5 h-5 text-primary" />
        </div>

        {/* Título */}
        <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 pr-6 group-hover:text-primary transition-colors line-clamp-2">
          {cancion.titulo}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 truncate">{cancion.artista}</p>

        {/* Metadatos */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {cancion.genero && (
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              BADGE_GENERO[cancion.genero] ?? "bg-secondary text-muted-foreground"
            )}>
              {cancion.genero}
            </span>
          )}
          {versionOriginal && (
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {versionOriginal.tonalidad}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {versionOriginal ? segundosAMinutos(versionOriginal.duracion_segundos) : "--"}
          </div>
          <div className="flex items-center gap-1">
            <span>{cancion.versions.length} versión{cancion.versions.length !== 1 ? "es" : ""}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
