"use client";

import Link from "next/link";
import { CancionResumen } from "@/types/cancion";
import { useCancionesStore } from "@/store/cancionesStore";
import { Star, Music, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BADGE_GENERO: Record<string, string> = {
  "Adoración": "bg-purple-500/20 text-purple-300",
  "Alabanza": "bg-blue-500/20 text-blue-300",
  "Gozo": "bg-green-500/20 text-green-300",
  "Reflexión": "bg-orange-500/20 text-orange-300",
};

interface Props {
  resumen: CancionResumen;
}

export function CardCancion({ resumen }: Props) {
  const { toggleFavorita } = useCancionesStore();

  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200">
      <button
        onClick={(e) => { e.preventDefault(); toggleFavorita(resumen.id); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-yellow-400 transition-colors z-10"
      >
        <Star className={cn("w-4 h-4", resumen.favorita && "fill-yellow-400 text-yellow-400")} />
      </button>

      <Link href={`/canciones/${resumen.id}`} className="block">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <Music className="w-5 h-5 text-primary" />
        </div>

        <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 pr-6 group-hover:text-primary transition-colors line-clamp-2">
          {resumen.titulo}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 truncate">{resumen.artista}</p>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {resumen.genero && (
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
              BADGE_GENERO[resumen.genero] ?? "bg-secondary text-muted-foreground")}>
              {resumen.genero}
            </span>
          )}
          {resumen.tonalidad && (
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {resumen.tonalidad}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{resumen.versions_count} versión{resumen.versions_count !== 1 ? "es" : ""}</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
