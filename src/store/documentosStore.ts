import { create } from "zustand";
import { Documento, CategoriaDocumento } from "@/types/documento";
import { cargarDocumentos } from "@/lib/data-loader/cargarDocumentos";

interface DocumentosState {
  documentos: Documento[];
  cargando: boolean;
  cargar: () => Promise<void>;
  guardar: (doc: Documento) => void;
  eliminar: (id: string) => void;
  nuevo: () => Documento;
}

function persistir(documentos: Documento[]) {
  try { localStorage.setItem("documentos-usuario", JSON.stringify(documentos)); } catch { /* ignore */ }
}

export const useDocumentosStore = create<DocumentosState>((set, get) => ({
  documentos: [],
  cargando: false,

  cargar: async () => {
    set({ cargando: true });
    const data = await cargarDocumentos();
    const base = data.documentos;

    let usuario: Documento[] = [];
    try {
      const saved = localStorage.getItem("documentos-usuario");
      if (saved) usuario = JSON.parse(saved);
    } catch { /* ignore */ }

    // Usuario sobreescribe base por id; los nuevos se agregan
    const mapa = new Map(base.map((d) => [d.id, d]));
    for (const d of usuario) mapa.set(d.id, d);
    set({ documentos: Array.from(mapa.values()), cargando: false });
  },

  guardar: (doc: Documento) => {
    const { documentos } = get();
    const idx = documentos.findIndex((d) => d.id === doc.id);
    const nuevos = idx >= 0
      ? documentos.map((d) => (d.id === doc.id ? doc : d))
      : [...documentos, doc];
    set({ documentos: nuevos });
    persistir(nuevos);
  },

  eliminar: (id: string) => {
    const nuevos = get().documentos.filter((d) => d.id !== id);
    set({ documentos: nuevos });
    persistir(nuevos);
  },

  nuevo: (): Documento => ({
    id: `doc-${Date.now()}`,
    titulo: "",
    categoria: "otro" as CategoriaDocumento,
    descripcion: "",
    url: "",
    subido_por: "",
    fecha: new Date().toISOString().split("T")[0],
  }),
}));
