import { ESCALA_CROMATICA, ESCALA_BEMOLES, PREFERIR_BEMOL } from "@/lib/constants/tonalidades";

// Notas raíz reconocidas (orden importa — más largas primero para evitar match parcial)
const NOTAS_RAIZ = ["C#","Db","D#","Eb","F#","Gb","G#","Ab","A#","Bb","C","D","E","F","G","A","B"];

function notaAIndice(nota: string): number {
  const idx = ESCALA_CROMATICA.indexOf(nota);
  if (idx !== -1) return idx;
  return ESCALA_BEMOLES.indexOf(nota);
}

function indicANota(indice: number, usarBemol: boolean): string {
  const i = ((indice % 12) + 12) % 12;
  return usarBemol ? ESCALA_BEMOLES[i] : ESCALA_CROMATICA[i];
}

function transponerNota(nota: string, semitonos: number, usarBemol: boolean): string {
  const idx = notaAIndice(nota);
  if (idx === -1) return nota;
  return indicANota(idx + semitonos, usarBemol);
}

// Transpone un acorde completo (ej: "Am7", "G/B", "Cmaj7", "Dsus4")
export function transponerAcorde(acorde: string, semitonos: number, tonalidad?: string): string {
  if (semitonos === 0) return acorde;

  const usarBemol = tonalidad ? !!PREFERIR_BEMOL[tonalidad] : false;

  // Manejar slash chords: G/B, Am/C
  const slashIdx = acorde.indexOf("/");
  if (slashIdx !== -1) {
    const base = acorde.slice(0, slashIdx);
    const bajo = acorde.slice(slashIdx + 1);
    return transponerAcorde(base, semitonos, tonalidad) + "/" + transponerNota(bajo, semitonos, usarBemol);
  }

  // Encontrar nota raíz
  let raiz = "";
  let sufijo = "";
  for (const nota of NOTAS_RAIZ) {
    if (acorde.startsWith(nota)) {
      raiz = nota;
      sufijo = acorde.slice(nota.length);
      break;
    }
  }

  if (!raiz) return acorde;

  const nuevaRaiz = transponerNota(raiz, semitonos, usarBemol);
  return nuevaRaiz + sufijo;
}

// Transpone una línea de acordes (acordes separados por espacios)
export function transponerLinea(linea: string, semitonos: number, tonalidad?: string): string {
  if (semitonos === 0) return linea;
  return linea
    .split(" ")
    .map((parte) => {
      if (!parte.trim()) return parte;
      return transponerAcorde(parte, semitonos, tonalidad);
    })
    .join(" ");
}

// Calcula los semitonos entre dos tonalidades
export function calcularSemitonos(desde: string, hasta: string): number {
  const idxDesde = notaAIndice(desde);
  const idxHasta = notaAIndice(hasta);
  if (idxDesde === -1 || idxHasta === -1) return 0;
  return ((idxHasta - idxDesde) + 12) % 12;
}
