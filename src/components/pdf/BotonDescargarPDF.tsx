"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import { SetList } from "@/types/setlist";
import { Cancion } from "@/types/cancion";
import { SetListDocument } from "./SetListDocument";

interface Props {
  setlist: SetList;
  className?: string;
}

function nombreArchivo(setlist: SetList): string {
  const nombre = setlist.nombre.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-áéíóúñÁÉÍÓÚÑ]/g, "");
  const fecha = setlist.evento_detalles.fecha
    ? setlist.evento_detalles.fecha.split("-").reverse().join("-")
    : "";
  return fecha ? `${nombre}-${fecha}.pdf` : `${nombre}.pdf`;
}

export function BotonDescargarPDF({ setlist, className }: Props) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDescargar = async () => {
    setGenerando(true);
    setError(null);
    try {
      // Cargar todos los JSON de canciones en paralelo
      const resultados = await Promise.all(
        setlist.canciones.map(async (csl) => {
          try {
            const res = await fetch(`/data/songs/${csl.cancion_id}.json`);
            if (!res.ok) return null;
            return (await res.json()) as Cancion;
          } catch {
            return null;
          }
        })
      );
      const canciones = resultados.filter((c): c is Cancion => c !== null);

      // Generar el PDF
      const blob = await pdf(
        <SetListDocument setlist={setlist} canciones={canciones} />
      ).toBlob();

      // Descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo(setlist);
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error generando PDF:", e);
      setError("No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleDescargar}
        disabled={generando}
        className={className ?? [
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          "bg-blue-500/15 text-blue-400 border border-blue-500/30",
          "hover:bg-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        {generando ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        {generando ? "Generando PDF…" : "Descargar PDF completo"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
