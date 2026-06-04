export type CategoriaDocumento =
  | "liturgia"
  | "partitura"
  | "acta"
  | "devocional"
  | "otro";

export interface Documento {
  id: string;
  titulo: string;
  categoria: CategoriaDocumento;
  descripcion: string;
  url: string;
  subido_por: string;
  fecha: string;
}

export interface DocumentosData {
  documentos: Documento[];
}
