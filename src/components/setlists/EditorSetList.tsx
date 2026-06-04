"use client";

import { useEffect, useState, useCallback } from "react";
import { useSetListStore } from "@/store/setlistStore";
import { useCancionesStore } from "@/store/cancionesStore";
import { SetList, CancionSetList } from "@/types/setlist";
import { CancionResumen } from "@/types/cancion";
import { cargarMinisterio } from "@/lib/data-loader/cargarMinisterio";
import { Integrante } from "@/types/ministerio";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Download, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function segundosAMinutos(s: number): string {
  const m = Math.floor(s / 60);
  const seg = s % 60;
  return `${m}:${seg.toString().padStart(2, "0")}`;
}

interface ModalParticipacionesProps {
  cancionSL: CancionSetList;
  cancion: CancionResumen | undefined;
  integrantes: Integrante[];
  onGuardar: (updated: CancionSetList) => void;
  onCerrar: () => void;
}

function ModalParticipaciones({ cancionSL, cancion, integrantes, onGuardar, onCerrar }: ModalParticipacionesProps) {
  const [datos, setDatos] = useState(cancionSL);

  const nombres = integrantes.map((i) => i.nombre);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">Participaciones</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{cancion?.titulo ?? cancionSL.cancion_id}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Tonalidad evento */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tonalidad para este evento</label>
            <input
              type="text"
              value={datos.tonalidad_evento}
              onChange={(e) => setDatos({ ...datos, tonalidad_evento: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ej: G, Am, Bb"
            />
          </div>

          {/* Vocalista principal */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Vocalista Principal</label>
            <select
              value={datos.participaciones.vocalista_principal}
              onChange={(e) => setDatos({
                ...datos,
                participaciones: { ...datos.participaciones, vocalista_principal: e.target.value }
              })}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Sin asignar</option>
              {nombres.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Coristas */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Coristas</label>
            <div className="space-y-1.5">
              {nombres.map((n) => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={datos.participaciones.coristas.includes(n)}
                    onChange={(e) => {
                      const coristas = e.target.checked
                        ? [...datos.participaciones.coristas, n]
                        : datos.participaciones.coristas.filter((c) => c !== n);
                      setDatos({ ...datos, participaciones: { ...datos.participaciones, coristas } });
                    }}
                    className="w-4 h-4 rounded border-border bg-secondary accent-primary"
                  />
                  <span className="text-sm text-foreground">{n}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Instrumentistas */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Instrumentistas</label>
            <div className="space-y-2">
              {["guitarra", "bajo", "bateria", "teclado"].map((inst) => (
                <div key={inst} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20 capitalize">{inst}</span>
                  <select
                    value={datos.participaciones.instrumentistas[inst] ?? ""}
                    onChange={(e) => setDatos({
                      ...datos,
                      participaciones: {
                        ...datos.participaciones,
                        instrumentistas: { ...datos.participaciones.instrumentistas, [inst]: e.target.value || undefined }
                      }
                    })}
                    className="flex-1 px-2 py-1.5 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none"
                  >
                    <option value="">Sin asignar</option>
                    {nombres.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Observaciones</label>
            <textarea
              value={datos.notas.observaciones}
              onChange={(e) => setDatos({ ...datos, notas: { ...datos.notas, observaciones: e.target.value } })}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none resize-none"
              rows={2}
              placeholder="Ej: Repetir coro 2 veces..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Arreglos especiales</label>
            <textarea
              value={datos.notas.arreglos_especiales}
              onChange={(e) => setDatos({ ...datos, notas: { ...datos.notas, arreglos_especiales: e.target.value } })}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none resize-none"
              rows={2}
              placeholder="Ej: Intro extendida..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onCerrar} className="px-4 py-2 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { onGuardar(datos); onCerrar(); }}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props { id: string; }

export function EditorSetList({ id }: Props) {
  const { setlists, cargar, guardar, cargando } = useSetListStore();
  const { resumenes, cargarBiblioteca, cargarCancionCompleta } = useCancionesStore();
  const [setlist, setSetlist] = useState<SetList | null>(null);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [modalCancion, setModalCancion] = useState<CancionSetList | null>(null);
  const [buscador, setBuscador] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    cargar();
    cargarBiblioteca();
    cargarMinisterio().then((m) => {
      if (m) setIntegrantes(m.integrantes);
    });
  }, []);

  useEffect(() => {
    const sl = setlists.find((s) => s.id === id);
    if (sl) setSetlist(JSON.parse(JSON.stringify(sl)));
  }, [setlists, id]);

  const handleGuardar = () => {
    if (!setlist) return;
    const duracion = setlist.canciones.reduce((acc, c) => acc + c.duracion_segundos, 0);
    const actualizado = {
      ...setlist,
      duracion_total_segundos: duracion,
      metadata: { ...setlist.metadata, modificado: new Date().toISOString() },
    };
    guardar(actualizado);
    setSetlist(actualizado);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const agregarCancion = async (resumen: CancionResumen) => {
    if (!setlist || agregando) return;
    setAgregando(true);
    await cargarCancionCompleta(resumen.id);
    const cancion = useCancionesStore.getState().cancionActiva;
    const version = cancion?.versions.find((v) => v.es_original) ?? cancion?.versions[0];
    const nueva: CancionSetList = {
      orden: setlist.canciones.length + 1,
      cancion_id: resumen.id,
      version_id: version?.id ?? `${resumen.id}-v1`,
      tonalidad_evento: version?.tonalidad ?? resumen.tonalidad,
      duracion_segundos: version?.duracion_segundos ?? 0,
      participaciones: { vocalista_principal: "", coristas: [], instrumentistas: {} },
      notas: { observaciones: "", arreglos_especiales: "" },
    };
    setSetlist((prev) => prev ? { ...prev, canciones: [...prev.canciones, nueva] } : prev);
    setBuscador("");
    setAgregando(false);
  };

  const moverCancion = (idx: number, dir: -1 | 1) => {
    if (!setlist) return;
    const nuevas = [...setlist.canciones];
    const temp = nuevas[idx];
    nuevas[idx] = nuevas[idx + dir];
    nuevas[idx + dir] = temp;
    const reordenadas = nuevas.map((c, i) => ({ ...c, orden: i + 1 }));
    setSetlist({ ...setlist, canciones: reordenadas });
  };

  const eliminarCancion = (idx: number) => {
    if (!setlist) return;
    const nuevas = setlist.canciones.filter((_, i) => i !== idx).map((c, i) => ({ ...c, orden: i + 1 }));
    setSetlist({ ...setlist, canciones: nuevas });
  };

  const actualizarCancion = (updated: CancionSetList) => {
    if (!setlist) return;
    const nuevas = setlist.canciones.map((c) => c.orden === updated.orden ? updated : c);
    setSetlist({ ...setlist, canciones: nuevas });
  };

  const cancionesFiltradas = resumenes.filter((c) =>
    c.titulo.toLowerCase().includes(buscador.toLowerCase()) ||
    c.artista.toLowerCase().includes(buscador.toLowerCase())
  ).slice(0, 8);

  const exportarJSON = () => {
    if (!setlist) return;
    const blob = new Blob([JSON.stringify(setlist, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${setlist.nombre.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cargando || !setlist) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Cargando...</div>;
  }

  const duracionTotal = setlist.canciones.reduce((a, c) => a + c.duracion_segundos, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Nav */}
      <Link href="/set-lists" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a Set Lists
      </Link>

      {/* Header editable */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={setlist.nombre}
              onChange={(e) => setSetlist({ ...setlist, nombre: e.target.value })}
              className="text-xl font-bold bg-transparent text-foreground border-b border-border focus:border-primary focus:outline-none w-full pb-1"
              placeholder="Nombre del set list"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Fecha</label>
                <input
                  type="date"
                  value={setlist.evento_detalles.fecha}
                  onChange={(e) => setSetlist({
                    ...setlist,
                    evento_detalles: { ...setlist.evento_detalles, fecha: e.target.value }
                  })}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-foreground text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Hora</label>
                <input
                  type="time"
                  value={setlist.evento_detalles.hora}
                  onChange={(e) => setSetlist({
                    ...setlist,
                    evento_detalles: { ...setlist.evento_detalles, hora: e.target.value }
                  })}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-foreground text-xs focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Lugar</label>
                <input
                  type="text"
                  value={setlist.evento_detalles.lugar}
                  onChange={(e) => setSetlist({
                    ...setlist,
                    evento_detalles: { ...setlist.evento_detalles, lugar: e.target.value }
                  })}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded-lg text-foreground text-xs focus:outline-none"
                  placeholder="Lugar del evento"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportarJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-sm transition-colors"
              title="Exportar JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={handleGuardar}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                guardado
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Save className="w-4 h-4" />
              {guardado ? "¡Guardado!" : "Guardar"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <span>🎵 {setlist.canciones.length} canciones</span>
          <span>⏱ {segundosAMinutos(duracionTotal)} total</span>
        </div>
      </div>

      {/* Lista de canciones */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Canciones del Set</h2>
        {setlist.canciones.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-sm">Agrega canciones desde el buscador de abajo</p>
          </div>
        ) : (
          setlist.canciones.map((csl, idx) => {
            const cancion = resumenes.find((c) => c.id === csl.cancion_id);
            return (
              <div key={`${csl.cancion_id}-${idx}`} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-5 text-center">{csl.orden}</span>
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{cancion?.titulo ?? csl.cancion_id}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono text-blue-400">{csl.tonalidad_evento}</span>
                    {csl.duracion_segundos > 0 && <span>{segundosAMinutos(csl.duracion_segundos)}</span>}
                    {csl.participaciones.vocalista_principal && (
                      <span>🎤 {csl.participaciones.vocalista_principal}</span>
                    )}
                  </div>
                  {csl.notas.observaciones && (
                    <p className="text-xs text-muted-foreground mt-1 italic truncate">"{csl.notas.observaciones}"</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setModalCancion(csl)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Participaciones"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moverCancion(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moverCancion(idx, 1)}
                    disabled={idx === setlist.canciones.length - 1}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => eliminarCancion(idx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Buscador de canciones para agregar */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Agregar canción
        </h2>
        <input
          type="text"
          value={buscador}
          onChange={(e) => setBuscador(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Buscar canción por nombre o artista..."
        />
        {buscador && (
          <div className="space-y-1">
            {cancionesFiltradas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No se encontraron canciones</p>
            ) : (
              cancionesFiltradas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => agregarCancion(c)}
                  disabled={agregando}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <span className="text-foreground font-medium">{c.titulo}</span>
                    <span className="text-muted-foreground ml-2">{c.artista}</span>
                  </div>
                  <span className="text-xs font-mono text-blue-400">{c.tonalidad}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal participaciones */}
      {modalCancion && (
        <ModalParticipaciones
          cancionSL={modalCancion}
          cancion={resumenes.find((c) => c.id === modalCancion.cancion_id)}
          integrantes={integrantes}
          onGuardar={actualizarCancion}
          onCerrar={() => setModalCancion(null)}
        />
      )}
    </div>
  );
}
