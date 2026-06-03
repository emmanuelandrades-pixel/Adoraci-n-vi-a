export type TipoSeccion =
  | "intro" | "verso" | "pre-coro" | "coro"
  | "puente" | "final-coro" | "outro" | "instrumental";

export interface Seccion {
  id: string;
  tipo: TipoSeccion;
  numero: number | null;
  acordes: string[];
  contenido: string;
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
