"use client";

import { useEffect } from "react";
import { useEventosStore } from "@/store/eventosStore";
import { Evento } from "@/types/evento";
import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

function formatFecha(fecha: string): string {
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function diasRestantes(fecha: string): number {
  const hoy = new Date();
  const evento = new Date(fecha + "T00:00:00");
  hoy.setHours(0, 0, 0, 0);
  return Math.ceil((evento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

const TIPO_BADGE: Record<string, string> = {
  culto: "bg-purple-500/20 text-purple-300",
  ensayo: "bg-blue-500/20 text-blue-300",
  especial: "bg-orange-500/20 text-orange-300",
  conferencia: "bg-green-500/20 text-green-300",
};

const TIPO_LABEL: Record<string, string> = {
  culto: "Culto",
  ensayo: "Ensayo",
  especial: "Especial",
  conferencia: "Conferencia",
};

const ESTADO_BADGE: Record<string, string> = {
  confirmado: "bg-green-500/20 text-green-400",
  tentativo: "bg-yellow-500/20 text-yellow-400",
  cancelado: "bg-red-500/20 text-red-400",
};

export function ListaEventos() {
  const { eventos, cargar, cargando } = useEventosStore();

  useEffect(() => { cargar(); }, [cargar]);

  const hoy = new Date().toISOString().split("T")[0];
  const proximos = eventos
    .filter((e) => e.fecha >= hoy && e.estado !== "cancelado")
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pasados = eventos
    .filter((e) => e.fecha < hoy || e.estado === "cancelado")
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (cargando) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const CardEvento = ({ evento }: { evento: Evento }) => {
    const dias = diasRestantes(evento.fecha);
    const esPasado = dias < 0;

    return (
      <div className={cn(
        "bg-card border rounded-xl p-5 transition-all duration-200",
        esPasado ? "border-border opacity-60" : "border-border hover:border-primary/40"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{evento.nombre}</h3>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TIPO_BADGE[evento.tipo] ?? "bg-secondary text-muted-foreground")}>
                {TIPO_LABEL[evento.tipo] ?? evento.tipo}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", ESTADO_BADGE[evento.estado] ?? "bg-secondary text-muted-foreground")}>
                {evento.estado}
              </span>
            </div>

            {evento.descripcion && (
              <p className="text-sm text-muted-foreground mb-3">{evento.descripcion}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatFecha(evento.fecha)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {evento.hora}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {evento.lugar}
              </span>
            </div>
          </div>

          {!esPasado && (
            <div className="flex-shrink-0 text-right">
              {dias === 0 ? (
                <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">HOY</span>
              ) : dias === 1 ? (
                <span className="text-xs font-bold text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-lg">MAÑANA</span>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-foreground">{dias}</p>
                  <p className="text-xs text-muted-foreground">días</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Próximos */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Próximos eventos ({proximos.length})</h2>
        {proximos.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay eventos próximos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proximos.map((e) => <CardEvento key={e.id} evento={e} />)}
          </div>
        )}
      </section>

      {/* Pasados */}
      {pasados.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Eventos pasados ({pasados.length})</h2>
          <div className="space-y-3">
            {pasados.map((e) => <CardEvento key={e.id} evento={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
