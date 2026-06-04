"use client";

import { AcordePosicionado } from "@/types/cancion";
import { transponerAcorde } from "@/lib/utils/transposicion";

interface Props {
  texto: string;
  acordes: AcordePosicionado[];
  semitonos: number;
  tonalidad: string;
}

export function LineaConAcordes({ texto, acordes, semitonos, tonalidad }: Props) {
  // Línea sin acordes: solo texto
  if (acordes.length === 0) {
    return (
      <div className="font-mono text-sm leading-snug">
        <div className="h-5" /> {/* espacio vacío para mantener altura uniforme */}
        <div className="text-foreground/90 whitespace-pre">{texto}</div>
      </div>
    );
  }

  // Construir línea de acordes como string posicionado
  // Calculamos el ancho mínimo necesario para la línea de acordes
  const acordesTranspuestos = acordes.map((a) => ({
    acorde: transponerAcorde(a.acorde, semitonos, tonalidad),
    pos: a.pos,
  }));

  // Armar la línea de acordes con espacios
  let lineaAcordes = "";
  for (const { acorde, pos } of acordesTranspuestos) {
    while (lineaAcordes.length < pos) lineaAcordes += " ";
    lineaAcordes += acorde + " ";
  }

  return (
    <div className="font-mono text-sm leading-snug">
      <div
        className="whitespace-pre text-blue-400 font-semibold select-none"
        style={{ minHeight: "1.25rem" }}
      >
        {lineaAcordes}
      </div>
      <div className="text-foreground/90 whitespace-pre">{texto}</div>
    </div>
  );
}
