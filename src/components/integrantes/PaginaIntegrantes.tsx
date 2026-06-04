"use client";

import { useEffect, useState } from "react";
import { cargarMinisterio } from "@/lib/data-loader/cargarMinisterio";
import { Integrante } from "@/types/ministerio";
import { Mail, Phone } from "lucide-react";

const INSTRUMENT_EMOJI: Record<string, string> = {
  "guitarra": "🎸",
  "bajo": "🎸",
  "batería": "🥁",
  "bateria": "🥁",
  "teclado": "🎹",
  "piano": "🎹",
  "voz": "🎤",
  "voces": "🎤",
  "sonido": "🎚️",
  "multimedia": "🎬",
  "gestión": "📋",
};

const ROL_COLOR: Record<string, string> = {
  "Pastor":             "text-yellow-400",
  "Directora":          "text-purple-400",
  "Director Musical":   "text-purple-400",
  "Coordinadora":       "text-blue-400",
  "Tesorera":           "text-green-400",
  "Técnico de Sonido":  "text-orange-400",
  "Técnico Multimedia": "text-cyan-400",
};

function getEmoji(instrumento: string): string {
  const lower = instrumento.toLowerCase();
  for (const [key, emoji] of Object.entries(INSTRUMENT_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🎵";
}

function getRolColor(rol: string): string {
  return ROL_COLOR[rol] ?? "text-primary";
}

export function PaginaIntegrantes() {
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMinisterio().then((m) => {
      if (m) setIntegrantes(m.integrantes);
      setCargando(false);
    });
  }, []);

  if (cargando) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">{integrantes.length} integrantes del ministerio</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrantes.map((integrante) => (
          <div
            key={integrante.id}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                {getEmoji(integrante.instrumento_principal)}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{integrante.nombre}</h3>
                <p className={`text-sm font-medium truncate ${getRolColor(integrante.rol_ministerial)}`}>{integrante.rol_ministerial}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1.5">Instrumentos</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {integrante.instrumento_principal}
                </span>
                {integrante.instrumentos_secundarios.map((inst) => (
                  <span key={inst} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {integrante.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{integrante.email}</span>
                </div>
              )}
              {integrante.telefono && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  <span>{integrante.telefono}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
