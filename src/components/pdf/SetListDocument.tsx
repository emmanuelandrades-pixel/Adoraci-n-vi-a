"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import path from "path";
import { SetList, CancionSetList } from "@/types/setlist";
import { Cancion, Version, Seccion } from "@/types/cancion";
import { transponerAcorde, calcularSemitonos } from "@/lib/utils/transposicion";

// Path absoluto al logo para react-pdf (funciona tanto en servidor como cliente via blob URL)
const LOGO_PATH =
  typeof window === "undefined"
    ? path.join(process.cwd(), "public", "logo.png")
    : "/logo.png";

const ETIQUETAS_SECCION: Record<string, string> = {
  intro: "INTRO", verso: "VERSO", "pre-coro": "PRE-CORO", coro: "CORO",
  puente: "PUENTE", "final-coro": "FINAL CORO", outro: "OUTRO", instrumental: "INSTRUMENTAL",
};

// Tamaños reducidos para caber en una hoja
const FS = { acordes: 12, letra: 14, secLabel: 7, titulo: 14, subtitulo: 8, tonalidad: 11, meta: 9 };

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: FS.letra,
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 46,
    color: "#111111",
    backgroundColor: "#ffffff",
  },

  // ── Portada ───────────────────────────────────────────────────────────────
  portadaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 30,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2D3A",
  },
  portadaLogo: { width: 96, height: 96, borderRadius: 48 },
  portadaHeaderTexto: { flex: 1 },
  ministerioNombre: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: "#1F2430",
    marginBottom: 5,
  },
  eventoNombre: {
    fontFamily: "Helvetica-Bold",
    fontSize: 44,
    color: "#111111",
    marginBottom: 22,
  },
  ministerioUbicacion: { fontSize: 15, color: "#8B8FA8" },
  portadaMeta: { flexDirection: "row", flexWrap: "wrap", gap: 22, marginBottom: 14 },
  portadaMetaItem: { fontSize: 13, color: "#374151" },
  portadaMetaLabel: { color: "#9CA3AF" },
  separadorPortada: { borderBottomWidth: 2, borderBottomColor: "#E5E7EB", marginTop: 26 },

  // ── Cabecera canción ──────────────────────────────────────────────────────
  cancionHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  cancionNumero: {
    fontFamily: "Helvetica-Bold", fontSize: 18, color: "#D1D5DB", width: 32, flexShrink: 0,
  },
  cancionTituloWrap: { flex: 1 },
  cancionTitulo: {
    fontFamily: "Helvetica-Bold", fontSize: FS.titulo, color: "#111111", textTransform: "uppercase",
  },
  cancionSubtitulo: { fontSize: FS.subtitulo, color: "#6B7280", marginTop: 1 },
  tonalidad: {
    fontFamily: "Courier-Bold", fontSize: FS.tonalidad, color: "#3B82F6", marginLeft: 6, paddingTop: 2,
  },

  // ── Participaciones ───────────────────────────────────────────────────────
  participacionesWrap: {
    marginLeft: 32, marginBottom: 6, flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  participacionItem: { fontSize: 8, color: "#374151" },
  participacionLabel: { color: "#9CA3AF" },
  observaciones: { marginLeft: 32, marginBottom: 8, fontSize: 8, color: "#6B7280", fontStyle: "italic" },

  // ── Separador ─────────────────────────────────────────────────────────────
  separadorCancion: {
    borderBottomWidth: 0.5, borderBottomColor: "#D1D5DB", marginLeft: 32, marginBottom: 10,
  },

  // ── Columnas ──────────────────────────────────────────────────────────────
  columnasWrap: { flexDirection: "row", gap: 14 },
  columna: { flex: 1 },

  // ── Sección ───────────────────────────────────────────────────────────────
  seccionWrap: { marginBottom: 8 },
  seccionLabel: {
    fontFamily: "Courier", fontSize: FS.secLabel, color: "#9CA3AF", marginBottom: 2, letterSpacing: 1,
  },

  // ── Líneas ────────────────────────────────────────────────────────────────
  lineaAcordes: {
    fontFamily: "Courier-Bold", fontSize: FS.acordes, color: "#3B82F6", lineHeight: 1.15,
  },
  lineaTexto: {
    fontFamily: "Courier", fontSize: FS.letra, color: "#111111", lineHeight: 1.35,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatearFecha(iso: string): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}/${iso.split("-")[0]}`;
}

function formatearDuracion(seg: number): string {
  return `${Math.floor(seg / 60)}:${(seg % 60).toString().padStart(2, "0")}`;
}

// react-pdf recorta los espacios iniciales de un Text (no respeta "pre"),
// así que rellenar la línea de acordes con espacios para posicionarlos no
// funciona de forma confiable. En su lugar cada acorde se ubica con
// posicionamiento absoluto en puntos, igual que en pantalla (que usa "ch").
// Courier es monoespaciada con avance fijo de 0.6em en las fuentes estándar
// de PDF, por lo que el ancho de carácter es simplemente 0.6 * fontSize.
const ANCHO_CARACTER = FS.letra * 0.6;

// Estima cuántas líneas de Courier ocupa una sección (acordes + texto)
function pesoSeccion(sec: Seccion): number {
  return sec.lineas.reduce((acc, l) => acc + (l.acordes.length > 0 ? 2 : 1), 0) + 2; // +2 etiqueta+margen
}

// Divide las secciones en dos columnas equilibradas por peso
function dividirEnColumnas(secciones: Seccion[]): [Seccion[], Seccion[]] {
  const pesos = secciones.map(pesoSeccion);
  const total = pesos.reduce((a, b) => a + b, 0);
  let acum = 0;
  let corte = secciones.length;
  for (let i = 0; i < pesos.length; i++) {
    acum += pesos[i];
    if (acum >= total / 2) { corte = i + 1; break; }
  }
  return [secciones.slice(0, corte), secciones.slice(corte)];
}

// ── Componente línea ─────────────────────────────────────────────────────────

function LineaPDF({
  linea, semitonos, tonalidad,
}: {
  linea: { texto: string; acordes: { acorde: string; pos: number }[] };
  semitonos: number;
  tonalidad: string;
}) {
  const tieneAcordes = linea.acordes.length > 0;
  return (
    <View>
      {tieneAcordes && (
        <View style={{ position: "relative", height: FS.acordes * 1.15 }}>
          {linea.acordes.map((a, i) => (
            <Text
              key={i}
              style={{
                position: "absolute",
                left: a.pos * ANCHO_CARACTER,
                fontFamily: "Courier-Bold",
                fontSize: FS.acordes,
                color: "#3B82F6",
              }}
            >
              {transponerAcorde(a.acorde, semitonos, tonalidad)}
            </Text>
          ))}
        </View>
      )}
      {linea.texto !== "" && <Text style={s.lineaTexto}>{linea.texto || " "}</Text>}
    </View>
  );
}

// ── Componente sección ───────────────────────────────────────────────────────

function SeccionPDF({
  seccion, semitonos, tonalidad,
}: {
  seccion: Seccion; semitonos: number; tonalidad: string;
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

// ── Página de canción ────────────────────────────────────────────────────────

function PaginaCancion({ csl, cancion }: { csl: CancionSetList; cancion: Cancion }) {
  const version: Version =
    cancion.versions.find((v) => v.id === csl.version_id) ??
    cancion.versions.find((v) => v.es_original) ??
    cancion.versions[0];

  const semitonos = calcularSemitonos(version.tonalidad, csl.tonalidad_evento);
  const { participaciones, notas } = csl;

  const instrumentistasTexto = Object.entries(participaciones.instrumentistas)
    .filter(([, n]) => n)
    .map(([inst, n]) => `${inst}: ${n}`)
    .join(" · ");

  const [col1, col2] = dividirEnColumnas(version.secciones);
  const hayCol2 = col2.length > 0;

  return (
    <Page size="LETTER" style={s.page}>
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
      {(participaciones.vocalista_principal || participaciones.coristas.length > 0 || instrumentistasTexto) && (
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

      <View style={s.separadorCancion} />

      {/* Secciones en 2 columnas */}
      <View style={s.columnasWrap}>
        <View style={s.columna}>
          {col1.map((sec) => (
            <SeccionPDF key={sec.id} seccion={sec} semitonos={semitonos} tonalidad={version.tonalidad} />
          ))}
        </View>
        {hayCol2 && (
          <View style={s.columna}>
            {col2.map((sec) => (
              <SeccionPDF key={sec.id} seccion={sec} semitonos={semitonos} tonalidad={version.tonalidad} />
            ))}
          </View>
        )}
      </View>
    </Page>
  );
}

// ── Página de portada ─────────────────────────────────────────────────────────

function PaginaPortada({ setlist }: { setlist: SetList }) {
  const { evento_detalles, canciones, duracion_total_segundos } = setlist;
  return (
    <Page size="LETTER" style={s.page}>
      <View style={{ flex: 1, justifyContent: "center" }}>
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

        {/* Índice */}
        <View style={{ marginTop: 20 }}>
          {canciones.map((c) => (
            <View key={c.cancion_id} style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontFamily: "Courier", fontSize: 8, color: "#9CA3AF", width: 24 }}>
                {String(c.orden).padStart(2, "0")}
              </Text>
              <Text style={{ fontSize: FS.meta, color: "#374151", flex: 1 }}>
                {/* título se resuelve en el documento raíz */}
                {c.cancion_id}
              </Text>
              <Text style={{ fontFamily: "Courier-Bold", fontSize: 8, color: "#3B82F6" }}>
                {c.tonalidad_evento}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}

// ── Documento raíz ────────────────────────────────────────────────────────────

interface Props {
  setlist: SetList;
  canciones: Cancion[];
}

export function SetListDocument({ setlist, canciones }: Props) {
  const cancionMap = new Map(canciones.map((c) => [c.id, c]));

  const items = setlist.canciones
    .map((csl) => ({ csl, cancion: cancionMap.get(csl.cancion_id) }))
    .filter((x): x is { csl: CancionSetList; cancion: Cancion } => !!x.cancion);

  // Portada con títulos reales
  const setlistConTitulos = {
    ...setlist,
    canciones: setlist.canciones.map((csl) => ({
      ...csl,
      _titulo: cancionMap.get(csl.cancion_id)?.titulo ?? csl.cancion_id,
    })),
  };

  return (
    <Document
      title={setlist.nombre}
      author="Adoración Viña Casa de Amor"
      creator="Set List App"
    >
      {/* Portada con índice */}
      <Page size="LETTER" style={s.page}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* Header con logo */}
          <View style={s.portadaHeader}>
            <Image src={LOGO_PATH} style={s.portadaLogo} />
            <View style={s.portadaHeaderTexto}>
              <Text style={s.ministerioNombre}>Adoración Viña Casa de Amor</Text>
              <Text style={s.ministerioUbicacion}>Talca · Chile</Text>
            </View>
          </View>
          <Text style={s.eventoNombre}>{setlist.nombre}</Text>
          <View style={s.portadaMeta}>
            {setlist.evento_detalles.fecha && (
              <Text style={s.portadaMetaItem}>
                <Text style={s.portadaMetaLabel}>Fecha  </Text>
                {formatearFecha(setlist.evento_detalles.fecha)}
              </Text>
            )}
            {setlist.evento_detalles.hora && (
              <Text style={s.portadaMetaItem}>
                <Text style={s.portadaMetaLabel}>Hora  </Text>
                {setlist.evento_detalles.hora}
              </Text>
            )}
            {setlist.evento_detalles.lugar && (
              <Text style={s.portadaMetaItem}>
                <Text style={s.portadaMetaLabel}>Lugar  </Text>
                {setlist.evento_detalles.lugar}
              </Text>
            )}
            <Text style={s.portadaMetaItem}>
              <Text style={s.portadaMetaLabel}>Canciones  </Text>
              {setlist.canciones.length}
            </Text>
            {setlist.duracion_total_segundos > 0 && (
              <Text style={s.portadaMetaItem}>
                <Text style={s.portadaMetaLabel}>Duración aprox.  </Text>
                {formatearDuracion(setlist.duracion_total_segundos)}
              </Text>
            )}
          </View>
          <View style={s.separadorPortada} />

          {/* Índice con títulos reales */}
          <View style={{ marginTop: 28 }}>
            {items.map(({ csl, cancion }) => (
              <View key={csl.cancion_id} style={{ flexDirection: "row", marginBottom: 12, alignItems: "center" }}>
                <Text style={{ fontFamily: "Courier", fontSize: 13, color: "#9CA3AF", width: 34 }}>
                  {String(csl.orden).padStart(2, "0")}
                </Text>
                <Text style={{ fontSize: 18, color: "#111111", flex: 1 }}>
                  {cancion.titulo}
                </Text>
                <Text style={{ fontFamily: "Courier-Bold", fontSize: 15, color: "#3B82F6" }}>
                  {csl.tonalidad_evento}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* Una página por canción */}
      {items.map(({ csl, cancion }) => (
        <PaginaCancion key={csl.cancion_id} csl={csl} cancion={cancion} />
      ))}
    </Document>
  );
}
