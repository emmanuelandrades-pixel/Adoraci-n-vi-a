export type TipoSeccion =
  | "intro" | "verso" | "pre-coro" | "coro"
  | "puente" | "final-coro" | "outro" | "instrumental";

export interface AcordePosicionado {
  acorde: string;
  pos: number;
}

export interface Linea {
  texto: string;
  acordes: AcordePosicionado[];
}

export interface Seccion {
  id: string;
  tipo: TipoSeccion;
  numero: number | null;
  lineas: Linea[];
}

export interface Version {
  id: string;
  nombre: string;
  tonalidad: string;
  bpm: number;
  compas: string;
  duracion_segundos: number;
  es_original: boolean;
  secciones: Seccion[];
}

export interface Cancion {
  id: string;
  titulo: string;
  artista: string;
  autor: string;
  genero: string;
  idioma: string;
  favorita: boolean;
  activa: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  versions: Version[];
}

// Resumen para biblioteca (carga rápida desde songs_summary.json)
export interface CancionResumen {
  id: string;
  titulo: string;
  artista: string;
  autor: string;
  genero: string;
  idioma: string;
  favorita: boolean;
  activa: boolean;
  tonalidad: string;
  bpm: number;
  versions_count: number;
  versions_nombres: string[];
}
