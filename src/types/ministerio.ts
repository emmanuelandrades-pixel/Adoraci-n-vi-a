export interface Integrante {
  id: string;
  nombre: string;
  instrumento_principal: string;
  instrumentos_secundarios: string[];
  rol_ministerial: string;
  telefono: string;
  email: string;
}

export interface MinisterioConfig {
  ministerio: {
    nombre_oficial: string;
    ubicacion: string;
    quienes_somos: string;
    mision: string;
    vision: string;
    valores: string[];
  };
  contacto: {
    email: string;
    telefono: string;
    ubicacion: string;
  };
  redes_sociales: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  integrantes: Integrante[];
}
