"use client";

import { useEffect, useState } from "react";
import { useSetListStore } from "@/store/setlistStore";
import { SetList } from "@/types/setlist";
import Link from "next/link";
import { Plus, List, Calendar, Clock, Music, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function segundosAMinutos(s: number): string {
  const m = Math.floor(s / 60);
  return `${m} min`;
}

function formatFecha(fecha: string): string {
  if (!fecha) return "";
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "long" });
}

export function ListaSetLists() {
  const { setlists, cargar, cargando, eliminar, nuevo, guardar } = useSetListStore();
  const router = useRouter();

  useEffect(() => { cargar(); }, [cargar]);

  const crearNuevo = () => {
    const sl = nuevo();
    guardar(sl);
    router.push(`/set-lists/${sl.id}`);
  };

  if (cargando) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{setlists.length} set list{setlists.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={crearNuevo}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Set List
        </button>
      </div>

      {/* Lista */}
      {setlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <List className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No hay set lists</p>
          <p className="text-sm mt-1">Crea tu primer set list para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {setlists.map((sl) => (
            <div
              key={sl.id}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <Link href={`/set-lists/${sl.id}`} className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {sl.nombre}
                  </h3>
                  {sl.metadata.descripcion && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{sl.metadata.descripcion}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                    {sl.evento_detalles.fecha && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatFecha(sl.evento_detalles.fecha)}
                        {sl.evento_detalles.hora && ` · ${sl.evento_detalles.hora}`}
                      </span>
                    )}
                    {sl.evento_detalles.lugar && (
                      <span>📍 {sl.evento_detalles.lugar}</span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      {sl.canciones.length} canción{sl.canciones.length !== 1 ? "es" : ""}
                    </span>
                    {sl.duracion_total_segundos > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {segundosAMinutos(sl.duracion_total_segundos)}
                      </span>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${sl.nombre}"?`)) eliminar(sl.id);
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
