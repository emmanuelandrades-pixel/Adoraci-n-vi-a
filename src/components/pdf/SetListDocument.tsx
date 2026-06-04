"use client";

import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import { SetList, CancionSetList } from "@/types/setlist";
import { Cancion, Version, Seccion } from "@/types/cancion";
import { transponerAcorde, calcularSemitonos } from "@/lib/utils/transposicion";

// react-pdf usa las fuentes del sistema — Courier y Helvetica están disponibles sin registro.

const ETIQUETAS_SECCION: Record<string, string> = {
  intro: "INTRO", verso: "VERSO", "pre-coro": "PRE-CORO", coro: "CORO",
  puente: "PUENTE", "final-coro": "FINAL CORO", outro: "OUTRO", instrumental: "INSTRUMENTAL",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    color: "#111111",
    backgroundColor: "#ffffff",
  },

  // ── Portada ───────────────────────────────────────────────────────────────
  portadaWrap: { marginBottom: 32 },
  ministerioNombre: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#6B7280",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  eventoNombre: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: "#111111",
    marginBottom: 12,
  },
  portadaMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 6,
  },
  portadaMetaItem: { fontSize: 10, color: "#374151" },
  portadaMetaLabel: { color: "#9CA3AF" },
  separadorPortada: {
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
    marginTop: 16,
    marginBottom: 0,
  },

  // ── Cabecera canción ──────────────────────────────────────────────────────
  cancionWrap: { marginTop: 32 },
  cancionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  cancionNumero: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: "#D1D5DB",
    width: 36,
    flexShrink: 0,
  },
  cancionTituloWrap: { flex: 1 },
  cancionTitulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    color: "#111111",
    textTransform: "uppercase",
  },
  cancionSubtitulo: { fontSize: 9, color: "#6B7280", marginTop: 2 },
  tonalidad: {
    fontFamily: "Courier-Bold",
    fontSize: 12,
    color: "#3B82F6",
    marginLeft: 8,
    paddingTop: 2,
  },

  // ── Participaciones ───────────────────────────────────────────────────────
  participacionesWrap: {
    marginLeft: 36,
    marginBottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  participacionItem: { fontSize: 9, color: "#374151" },
  participacionLabel: { color: "#9CA3AF" },
  observaciones: {
    marginLeft: 36,
    marginBottom: 10,
    fontSize: 9,
    color: "#6B7280",
    fontStyle: "italic",
  },

  // ── Separador canción ─────────────────────────────────────────────────────
  separadorCancion: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#D1D5DB",
    marginLeft: 36,
    marginBottom: 14,
  },

  // ── Secciones y líneas ────────────────────────────────────────────────────
  seccionWrap: { marginLeft: 36, marginBottom: 12 },
  seccionLabel: {
    fontFamily: "Courier",
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 3,
    letterSpacing: 1,
  },
  lineaWrap: { marginBottom: 0 },
  lineaAcordes: {
    fontFamily: "Courier-Bold",
    fontSize: 10,
    color: "#3B82F6",
    lineHeight: 1.2,
  },
  lineaTexto: {
    fontFamily: "Courier",
    fontSize: 11,
    color: "#111111",
    lineHeight: 1.4,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatearFecha(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatearDuracion(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function construirLineaAcordes(
  acordes: { acorde: string; pos: number }[],
  semitonos: number,
  tonalidad: string
): string {
  // Construye la línea de acordes como cadena monoespaciada usando pos en chars
  let linea = "";
  for (const { acorde, pos } of acordes) {
    const transpuesto = transponerAcorde(acorde, semitonos, tonalidad);
    while (linea.length < pos) linea += " ";
    linea += transpuesto + " ";
  }
  return linea;
}

// ── Componente de una línea (acordes + texto) ────────────────────────────────

function LineaPDF({
  linea, semitonos, tonalidad,
}: {
  linea: { texto: string; acordes: { acorde: string; pos: number }[] };
  semitonos: number;
  tonalidad: string;
}) {
  const lineaAcordes = linea.acordes.length > 0
    ? construirLineaAcordes(linea.acordes, semitonos, tonalidad)
    : null;

  return (
    <View style={s.lineaWrap}>
      {lineaAcordes !== null && (
        <Text style={s.lineaAcordes}>{lineaAcordes}</Text>
      )}
      {linea.texto !== "" && (
        <Text style={s.lineaTexto}>{linea.texto || " "}</Text>
      )}
    </View>
  );
}

// ── Componente de sección ────────────────────────────────────────────────────

function SeccionPDF({
  seccion, semitonos, tonalidad,
}: {
  seccion: Seccion;
  semitonos: number;
  tonalidad: string;
}) {
  const etiqueta = ETIQUETAS_SECCION[seccion.tipo] ?? seccion.tipo.toUpperCase();
  const label = seccion.numero ? `${etiqueta} ${seccion.numero}` : etiqueta;

  return (
    <View style={s.seccionWrap} wrap={false}>
      <Text style={s.seccionLabel}>{label}</Text>
      {seccion.lineas.map((linea, i) => (
        <LineaPDF key={i} linea={linea} semitonos={semitonos} tonalidad={tonalidad} />
      ))}
    </View>
  );
}

// ── Componente de canción ────────────────────────────────────────────────────

function CancionPDF({
  csl, cancion, esUltima,
}: {
  csl: CancionSetList;
  cancion: Cancion;
  esUltima: boolean;
}) {
  const version: Version =
    cancion.versions.find((v) => v.id === csl.version_id) ??
    cancion.versions.find((v) => v.es_original) ??
    cancion.versions[0];

  const semitonos = calcularSemitonos(version.tonalidad, csl.tonalidad_evento);
  const { participaciones, notas } = csl;

  const instrumentistasTexto = Object.entries(participaciones.instrumentistas)
    .filter(([, nombre]) => nombre)
    .map(([inst, nombre]) => `${inst}: ${nombre}`)
    .join(" · ");

  return (
    <View style={s.cancionWrap}>
      {/* Header */}
      <View style={s.cancionHeader}>
        <Text style={s.cancionNumero}>{String(csl.orden).padStart(2, "0")}</Text>
        <View style={s.cancionTituloWrap}>
          <Text style={s.cancionTitulo}>{cancion.titulo}</Text>
          <Text style={s.cancionSubtitulo}>{cancion.artista}</Text>
        </View>
        <Text style={s.tonalidad}>{csl.tonalidad_evento}</Text>
      </View>

      {/* Participaciones */}
      {(participaciones.vocalista_principal ||
        participaciones.coristas.length > 0 ||
        instrumentistasTexto) && (
        <View style={s.participacionesWrap}>
          {participaciones.vocalista_principal && (
            <Text style={s.participacionItem}>
              <Text style={s.participacionLabel}>Voz  </Text>
              {participaciones.vocalista_principal}
            </Text>
          )}
          {participaciones.coristas.length > 0 && (
            <Text style={s.participacionItem}>
              <Text style={s.participacionLabel}>Coristas  </Text>
              {participaciones.coristas.join(", ")}
            </Text>
          )}
          {instrumentistasTexto && (
            <Text style={s.participacionItem}>{instrumentistasTexto}</Text>
          )}
        </View>
      )}

      {/* Observaciones */}
      {notas.observaciones && (
        <Text style={s.observaciones}>"{notas.observaciones}"</Text>
      )}
      {notas.arreglos_especiales && (
        <Text style={s.observaciones}>Arreglos: {notas.arreglos_especiales}</Text>
      )}

      {/* Separador antes de secciones */}
      <View style={s.separadorCancion} />

      {/* Secciones */}
      {version.secciones.map((seccion) => (
        <SeccionPDF
          key={seccion.id}
          seccion={seccion}
          semitonos={semitonos}
          tonalidad={version.tonalidad}
        />
      ))}
    </View>
  );
}

// ── Portada ───────────────────────────────────────────────────────────────────

function PortadaPDF({ setlist }: { setlist: SetList }) {
  const { evento_detalles, canciones, duracion_total_segundos } = setlist;
  return (
    <View style={s.portadaWrap}>
      <Text style={s.ministerioNombre}>Adoración Viña Casa de Amor · Talca</Text>
      <Text style={s.eventoNombre}>{setlist.nombre}</Text>
      <View style={s.portadaMeta}>
        {evento_detalles.fecha && (
          <Text style={s.portadaMetaItem}>
            <Text style={s.portadaMetaLabel}>Fecha  </Text>
            {formatearFecha(evento_detalles.fecha)}
          </Text>
        )}
        {evento_detalles.hora && (
          <Text style={s.portadaMetaItem}>
            <Text style={s.portadaMetaLabel}>Hora  </Text>
            {evento_detalles.hora}
          </Text>
        )}
        {evento_detalles.lugar && (
          <Text style={s.portadaMetaItem}>
            <Text style={s.portadaMetaLabel}>Lugar  </Text>
            {evento_detalles.lugar}
          </Text>
        )}
        <Text style={s.portadaMetaItem}>
          <Text style={s.portadaMetaLabel}>Canciones  </Text>
          {canciones.length}
        </Text>
        {duracion_total_segundos > 0 && (
          <Text style={s.portadaMetaItem}>
            <Text style={s.portadaMetaLabel}>Duración aprox.  </Text>
            {formatearDuracion(duracion_total_segundos)}
          </Text>
        )}
      </View>
      <View style={s.separadorPortada} />
    </View>
  );
}

// ── Documento raíz ────────────────────────────────────────────────────────────

interface Props {
  setlist: SetList;
  canciones: Cancion[];
}

export function SetListDocument({ setlist, canciones }: Props) {
  // Map rápido id → cancion
  const cancionMap = new Map(canciones.map((c) => [c.id, c]));

  // Filtrar solo las que se pudieron cargar
  const items = setlist.canciones
    .map((csl) => ({ csl, cancion: cancionMap.get(csl.cancion_id) }))
    .filter((x): x is { csl: CancionSetList; cancion: Cancion } => !!x.cancion);

  return (
    <Document
      title={setlist.nombre}
      author="Adoración Viña Casa de Amor"
      creator="Set List App"
    >
      <Page size="LETTER" style={s.page}>
        <PortadaPDF setlist={setlist} />
        {items.map(({ csl, cancion }, idx) => (
          <CancionPDF
            key={csl.cancion_id}
            csl={csl}
            cancion={cancion}
            esUltima={idx === items.length - 1}
          />
        ))}
      </Page>
    </Document>
  );
}
