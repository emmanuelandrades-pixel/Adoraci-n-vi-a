export type TipoEvento = "culto" | "ensayo" | "especial" | "conferencia";
export type EstadoEvento = "confirmado" | "tentativo" | "cancelado";

export interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  descripcion: string;
  tipo: TipoEvento;
  estado: EstadoEvento;
  setlists: string[];
}

export interface EventosData {
  eventos: Evento[];
}
