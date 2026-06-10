"use client";

import { useEffect, useState } from "react";
import { useEventosStore } from "@/store/eventosStore";
import { Evento, TipoEvento, EstadoEvento } from "@/types/evento";
import { Calendar, Clock, MapPin, Plus, Pencil, Trash2, X, Save } from "lucide-react";
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
  culto: "Culto", ensayo: "Ensayo", especial: "Especial", conferencia: "Conferencia",
};

const ESTADO_BADGE: Record<string, string> = {
  confirmado: "bg-green-500/20 text-green-400",
  tentativo: "bg-yellow-500/20 text-yellow-400",
  cancelado: "bg-red-500/20 text-red-400",
};

// ── Modal crear / editar ──────────────────────────────────────────────────────

interface ModalProps {
  evento: Evento;
  onGuardar: (e: Evento) => void;
  onCerrar: () => void;
}

function ModalEvento({ evento, onGuardar, onCerrar }: ModalProps) {
  const [form, setForm] = useState<Evento>(evento);

  const campo = <K extends keyof Evento>(k: K, v: Evento[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleGuardar = () => {
    if (!form.nombre.trim()) return;
    onGuardar(form);
    onCerrar();
  };

  const inputCls = "w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelCls = "text-xs font-medium text-muted-foreground block mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {evento.nombre ? "Editar evento" : "Nuevo evento"}
          </h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Nombre del evento *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => campo("nombre", e.target.value)}
              className={inputCls}
              placeholder="Ej: Culto Domingo de Adoración"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hora</label>
              <input type="time" value={form.hora} onChange={(e) => campo("hora", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Lugar</label>
            <input
              type="text"
              value={form.lugar}
              onChange={(e) => campo("lugar", e.target.value)}
              className={inputCls}
              placeholder="Ej: Templo Principal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.tipo} onChange={(e) => campo("tipo", e.target.value as TipoEvento)} className={inputCls}>
                <option value="culto">Culto</option>
                <option value="ensayo">Ensayo</option>
                <option value="especial">Especial</option>
                <option value="conferencia">Conferencia</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.estado} onChange={(e) => campo("estado", e.target.value as EstadoEvento)} className={inputCls}>
                <option value="confirmado">Confirmado</option>
                <option value="tentativo">Tentativo</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => campo("descripcion", e.target.value)}
              className={inputCls}
              rows={3}
              placeholder="Tema, contexto u observaciones del evento..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onCerrar} className="px-4 py-2 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!form.nombre.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card de evento ────────────────────────────────────────────────────────────

function CardEvento({
  evento, onEditar, onEliminar,
}: {
  evento: Evento;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const dias = diasRestantes(evento.fecha);
  const esPasado = dias < 0;

  return (
    <div className={cn(
      "bg-card border rounded-xl p-5 transition-all duration-200",
      esPasado ? "border-border opacity-60" : "border-border hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
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
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{evento.descripcion}</p>
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
            {evento.lugar && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {evento.lugar}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          {!esPasado && (
            <div className="text-right mr-2">
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
          <button
            onClick={onEditar}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onEliminar}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

async function notificarEvento(evento: Evento) {
  try {
    const esNuevo = !evento.nombre.includes("(editado)");
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: esNuevo ? `📅 Nuevo evento: ${evento.nombre}` : `✏️ Evento actualizado: ${evento.nombre}`,
        body: `${evento.fecha} ${evento.hora}${evento.lugar ? ` · ${evento.lugar}` : ""}`,
        url: "/eventos",
      }),
    });
  } catch { /* notificación no crítica */ }
}

export function ListaEventos() {
  const { eventos, cargar, cargando, guardar, eliminar, nuevo } = useEventosStore();
  const [modal, setModal] = useState<Evento | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarYNotificar = (evento: Evento) => {
    guardar(evento);
    notificarEvento(evento);
  };

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

  return (
    <>
      <div className="space-y-8">
        {/* Encabezado con botón nuevo */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{eventos.length} evento{eventos.length !== 1 ? "s" : ""} en total</p>
          <button
            onClick={() => setModal(nuevo())}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo evento
          </button>
        </div>

        {/* Próximos */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Próximos ({proximos.length})</h2>
          {proximos.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay eventos próximos</p>
              <button
                onClick={() => setModal(nuevo())}
                className="mt-3 text-xs text-primary hover:underline"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {proximos.map((e) => (
                <CardEvento
                  key={e.id}
                  evento={e}
                  onEditar={() => setModal({ ...e })}
                  onEliminar={() => setConfirmarEliminar(e.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pasados */}
        {pasados.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Pasados / cancelados ({pasados.length})</h2>
            <div className="space-y-3">
              {pasados.map((e) => (
                <CardEvento
                  key={e.id}
                  evento={e}
                  onEditar={() => setModal({ ...e })}
                  onEliminar={() => setConfirmarEliminar(e.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal crear / editar */}
      {modal && (
        <ModalEvento
          evento={modal}
          onGuardar={guardarYNotificar}
          onCerrar={() => setModal(null)}
        />
      )}

      {/* Confirmación eliminar */}
      {confirmarEliminar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-foreground mb-2">¿Eliminar evento?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="px-4 py-2 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { eliminar(confirmarEliminar); setConfirmarEliminar(null); }}
                className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
