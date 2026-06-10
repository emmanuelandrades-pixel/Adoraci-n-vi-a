"use client";

import { useEffect, useState } from "react";
import { useDocumentosStore } from "@/store/documentosStore";
import { Documento, CategoriaDocumento } from "@/types/documento";
import {
  FileText, Plus, ExternalLink, Pencil, Trash2, X, Save,
  Music, FileCheck, BookOpen, BookMarked, File,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Metadatos de categoría ────────────────────────────────────────────────────

const CATEGORIAS: { value: CategoriaDocumento; label: string; icon: typeof File; color: string }[] = [
  { value: "liturgia",   label: "Liturgia",   icon: BookMarked, color: "bg-purple-500/15 text-purple-300 border-purple-500/25" },
  { value: "partitura",  label: "Partitura",  icon: Music,      color: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
  { value: "acta",       label: "Acta",       icon: FileCheck,  color: "bg-green-500/15 text-green-300 border-green-500/25" },
  { value: "devocional", label: "Devocional", icon: BookOpen,   color: "bg-orange-500/15 text-orange-300 border-orange-500/25" },
  { value: "otro",       label: "Otro",       icon: File,       color: "bg-secondary text-muted-foreground border-border" },
];

function infoCategoria(cat: CategoriaDocumento) {
  return CATEGORIAS.find((c) => c.value === cat) ?? CATEGORIAS[CATEGORIAS.length - 1];
}

function formatFecha(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function ModalDocumento({
  doc, onGuardar, onCerrar,
}: {
  doc: Documento;
  onGuardar: (d: Documento) => void;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState<Documento>(doc);
  const campo = <K extends keyof Documento>(k: K, v: Documento[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valido = form.titulo.trim() && form.url.trim();

  const inputCls = "w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelCls = "text-xs font-medium text-muted-foreground block mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {doc.titulo ? "Editar documento" : "Agregar documento"}
          </h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className={labelCls}>Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => campo("titulo", e.target.value)}
              className={inputCls}
              placeholder="Ej: Guía de Adoración — Julio 2026"
              autoFocus
            />
          </div>

          {/* Enlace */}
          <div>
            <label className={labelCls}>Enlace de Google Drive *</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => campo("url", e.target.value)}
              className={inputCls}
              placeholder="https://drive.google.com/file/d/..."
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              En Google Drive: clic derecho en el archivo → Compartir → Copiar enlace
            </p>
          </div>

          {/* Categoría */}
          <div>
            <label className={labelCls}>Categoría</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIAS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => campo("categoria", value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors",
                    form.categoria === value
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Subido por */}
          <div>
            <label className={labelCls}>Subido por</label>
            <input
              type="text"
              value={form.subido_por}
              onChange={(e) => campo("subido_por", e.target.value)}
              className={inputCls}
              placeholder="Tu nombre"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => campo("descripcion", e.target.value)}
              className={inputCls}
              rows={2}
              placeholder="Breve descripción del contenido..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onCerrar} className="px-4 py-2 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (valido) { onGuardar(form); onCerrar(); } }}
            disabled={!valido}
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

// ── Card de documento ─────────────────────────────────────────────────────────

function CardDocumento({
  doc, onEditar, onEliminar,
}: {
  doc: Documento;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const cat = infoCategoria(doc.categoria);
  const Icon = cat.icon;

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all duration-200 flex items-start gap-4">
      {/* Ícono categoría */}
      <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0", cat.color)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-foreground text-sm leading-tight mb-1 truncate">{doc.titulo}</h3>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", cat.color)}>
                {cat.label}
              </span>
              {doc.subido_por && (
                <span className="text-[10px] text-muted-foreground">{doc.subido_por}</span>
              )}
              <span className="text-[10px] text-muted-foreground">{formatFecha(doc.fecha)}</span>
            </div>
            {doc.descripcion && (
              <p className="text-xs text-muted-foreground line-clamp-2">{doc.descripcion}</p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors"
          title="Abrir documento"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir
        </a>
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
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function GestorDocumentos() {
  const { documentos, cargar, cargando, guardar, eliminar, nuevo } = useDocumentosStore();
  const [modal, setModal] = useState<Documento | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaDocumento | "">("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = documentos
    .filter((d) => !filtroCategoria || d.categoria === filtroCategoria)
    .filter((d) =>
      !busqueda ||
      d.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.subido_por.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (cargando) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Búsqueda */}
            <input
              type="text"
              placeholder="Buscar documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-52"
            />
            {/* Filtro categoría */}
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as CategoriaDocumento | "")}
              className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setModal(nuevo())}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar documento
          </button>
        </div>

        {/* Contador */}
        <p className="text-xs text-muted-foreground">
          {filtrados.length} documento{filtrados.length !== 1 ? "s" : ""}
          {(filtroCategoria || busqueda) ? " encontrados" : " en total"}
        </p>

        {/* Lista */}
        {filtrados.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium">
              {busqueda || filtroCategoria ? "No se encontraron documentos" : "Aún no hay documentos"}
            </p>
            {!busqueda && !filtroCategoria && (
              <>
                <p className="text-xs mt-1 max-w-xs mx-auto">
                  Sube tus archivos a Google Drive, copia el enlace compartido y agrégalo aquí.
                </p>
                <button
                  onClick={() => setModal(nuevo())}
                  className="mt-4 text-xs text-primary hover:underline"
                >
                  Agregar el primero
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtrados.map((doc) => (
              <CardDocumento
                key={doc.id}
                doc={doc}
                onEditar={() => setModal({ ...doc })}
                onEliminar={() => setConfirmar(doc.id)}
              />
            ))}
          </div>
        )}

        {/* Nota informativa */}
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
          <p className="text-xs text-blue-400/80 leading-relaxed">
            <strong className="text-blue-400">¿Cómo agregar un documento?</strong><br />
            Sube el archivo a Google Drive → clic derecho → <em>Compartir</em> → activa <em>"Cualquier persona con el enlace"</em> → copia el enlace → pégalo aquí.
          </p>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ModalDocumento
          doc={modal}
          onGuardar={guardar}
          onCerrar={() => setModal(null)}
        />
      )}

      {/* Confirmación eliminar */}
      {confirmar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-foreground mb-2">¿Eliminar documento?</h3>
            <p className="text-sm text-muted-foreground mb-5">El archivo en Google Drive no se borrará.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmar(null)} className="px-4 py-2 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => { eliminar(confirmar); setConfirmar(null); }}
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
