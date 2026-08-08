import { ESCALA_CROMATICA, ESCALA_BEMOLES, PREFERIR_BEMOL } from "@/lib/constants/tonalidades";

// Notas raíz — las más largas primero para evitar match parcial (C# antes que C)
const NOTAS_RAIZ = [
  "C#","Db","D#","Eb","F#","Gb","G#","Ab","A#","Bb",
  "C","D","E","F","G","A","B"
];

function notaAIndice(nota: string): number {
  const idx = ESCALA_CROMATICA.indexOf(nota);
  if (idx !== -1) return idx;
  return ESCALA_BEMOLES.indexOf(nota);
}

function indiceANota(indice: number, usarBemol: boolean): string {
  const i = ((indice % 12) + 12) % 12;
  return usarBemol ? ESCALA_BEMOLES[i] : ESCALA_CROMATICA[i];
}

function transponerNotaBase(nota: string, semitonos: number, usarBemol: boolean): string {
  const idx = notaAIndice(nota);
  if (idx === -1) return nota;
  return indiceANota(idx + semitonos, usarBemol);
}

/**
 * Extrae la nota raíz de un acorde y devuelve { raiz, sufijo }.
 * Ej: "Am7" → { raiz: "A", sufijo: "m7" }
 *     "C#maj7" → { raiz: "C#", sufijo: "maj7" }
 *     "Dsus4"  → { raiz: "D",  sufijo: "sus4" }
 */
function descomponerAcorde(acorde: string): { raiz: string; sufijo: string } {
  for (const nota of NOTAS_RAIZ) {
    if (acorde.startsWith(nota)) {
      return { raiz: nota, sufijo: acorde.slice(nota.length) };
    }
  }
  return { raiz: "", sufijo: acorde };
}

/**
 * Transpone un acorde completo manteniendo su modificador intacto.
 * Soporta: mayores, menores, 7, m7, maj7, sus2, sus4, dim, aug, add9,
 * slash chords (G/B, D/F#), y cualquier combinación.
 */
export function transponerAcorde(acorde: string, semitonos: number, tonalidad?: string): string {
  if (semitonos === 0) return acorde;

  // Determinar si la tonalidad destino prefiere bemoles
  const tonalDestino = (() => {
    const { raiz } = descomponerAcorde(acorde);
    const idx = notaAIndice(raiz);
    if (idx === -1) return tonalidad ?? "";
    const nuevaRaiz = indiceANota(idx + semitonos, false); // provisional en sostenidos
    // Si la tonalidad base prefiere bemol, usar bemol en el resultado
    return PREFERIR_BEMOL[tonalidad ?? ""] ? nuevaRaiz : (tonalidad ?? "");
  })();
  const usarBemol = !!PREFERIR_BEMOL[tonalidad ?? ""];

  // Slash chord: "G/B", "D/F#", "Am/C" → transponer ambas partes por separado
  const slashIdx = acorde.indexOf("/");
  if (slashIdx !== -1) {
    const parteBase = acorde.slice(0, slashIdx);
    const parteBajo = acorde.slice(slashIdx + 1);
    const { raiz: raizBajo } = descomponerAcorde(parteBajo);
    // El bajo es siempre una nota simple sin sufijo
    let nuevoBajo = raizBajo
      ? transponerNotaBase(raizBajo, semitonos, usarBemol)
      : parteBajo;
    // Gb como bajo es una grafía poco habitual; se prefiere F# (ej. D/Gb → D/F#)
    if (nuevoBajo === "Gb") nuevoBajo = "F#";
    return transponerAcorde(parteBase, semitonos, tonalidad) + "/" + nuevoBajo;
  }

  const { raiz, sufijo } = descomponerAcorde(acorde);
  if (!raiz) return acorde;

  const nuevaRaiz = transponerNotaBase(raiz, semitonos, usarBemol);
  return nuevaRaiz + sufijo;
}

// Transpone todos los acordes en una línea de texto (separados por espacios)
export function transponerLinea(linea: string, semitonos: number, tonalidad?: string): string {
  if (semitonos === 0) return linea;
  return linea
    .split(" ")
    .map((parte) => (parte.trim() ? transponerAcorde(parte, semitonos, tonalidad) : parte))
    .join(" ");
}

// Calcula los semitonos entre dos tonalidades
export function calcularSemitonos(desde: string, hasta: string): number {
  const idxDesde = notaAIndice(desde);
  const idxHasta = notaAIndice(hasta);
  if (idxDesde === -1 || idxHasta === -1) return 0;
  return ((idxHasta - idxDesde) + 12) % 12;
}
