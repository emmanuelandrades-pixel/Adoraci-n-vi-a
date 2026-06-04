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
  const tieneAcordes = acordes.length > 0;

  return (
    <div style={{ fontFamily: "Courier New, monospace", lineHeight: 1.8 }}>
      {tieneAcordes && (
        <div style={{ position: "relative", height: "1.4em", marginBottom: 2 }}>
          {acordes.map((a, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${a.pos}ch`,
                color: "#60A5FA",
                fontWeight: "bold",
                fontSize: "0.9em",
                whiteSpace: "nowrap",
              }}
            >
              {transponerAcorde(a.acorde, semitonos, tonalidad)}
            </span>
          ))}
        </div>
      )}
      {texto && (
        <div style={{ whiteSpace: "pre", color: "inherit" }}>{texto}</div>
      )}
    </div>
  );
}
