export interface Participaciones {
  vocalista_principal: string;
  coristas: string[];
  instrumentistas: {
    guitarra?: string;
    bajo?: string;
    bateria?: string;
    teclado?: string;
    [key: string]: string | undefined;
  };
}

export interface NotasCancion {
  observaciones: string;
  arreglos_especiales: string;
}

export interface CancionSetList {
  orden: number;
  cancion_id: string;
  version_id: string;
  tonalidad_evento: string;
  duracion_segundos: number;
  participaciones: Participaciones;
  notas: NotasCancion;
}

export interface EventoDetalles {
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
}

export interface SetList {
  id: string;
  nombre: string;
  evento_id: string | null;
  evento_detalles: EventoDetalles;
  metadata: {
    creado: string;
    modificado: string;
    descripcion: string;
  };
  duracion_total_segundos: number;
  canciones: CancionSetList[];
}
