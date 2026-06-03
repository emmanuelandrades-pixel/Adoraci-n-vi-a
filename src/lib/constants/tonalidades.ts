export const TONALIDADES = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
  "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"
] as const;

export const TONALIDADES_MAYORES = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
export const TONALIDADES_MENORES = ["Am","Bbm","Bm","Cm","C#m","Dm","Ebm","Em","Fm","F#m","Gm","G#m"];

export const ESCALA_CROMATICA = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
export const ESCALA_BEMOLES =   ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

export const PREFERIR_BEMOL: Record<string, boolean> = {
  "Db": true, "Eb": true, "Gb": true, "Ab": true, "Bb": true,
  "F": true, "Dm": true, "Gm": true, "Cm": true, "Fm": true, "Bbm": true, "Ebm": true,
};
