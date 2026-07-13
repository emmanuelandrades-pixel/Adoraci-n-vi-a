#!/usr/bin/env node
/**
 * Valida los datos canónicos de canciones en public/data/songs/.
 *
 * Comprueba:
 *  - JSON parseable y esquema conforme a src/types/cancion.ts
 *  - index.json ↔ archivos song-*.json sincronizados (sin huérfanos ni faltantes)
 *  - songs_summary.json sincronizado (id, titulo, tonalidad, versions_count)
 *  - tipos de sección válidos
 *  - acordes: notación inglesa plausible y pos entero >= 0
 *  - pos dentro del largo del texto (warning: puede ser legítimo en colas de línea)
 *
 * Uso: npm run validate:songs   (exit 1 si hay errores; warnings no fallan)
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SONGS_DIR = join(process.cwd(), "public", "data", "songs");
const TIPOS_VALIDOS = new Set([
  "intro", "verso", "pre-coro", "coro",
  "puente", "final-coro", "outro", "instrumental",
]);
// Raíz A-G con #/b, sufijo libre razonable, bajo opcional (C/E). Solo sanidad, no teoría musical.
const RE_ACORDE = /^[A-G][#b]?[A-Za-z0-9#+°()\-]*(\/[A-G][#b]?)?$/;

const errores = [];
const warnings = [];
const err = (f, msg) => errores.push(`${f}: ${msg}`);
const warn = (f, msg) => warnings.push(`${f}: ${msg}`);

function leerJson(nombre) {
  const ruta = join(SONGS_DIR, nombre);
  try {
    return JSON.parse(readFileSync(ruta, "utf8"));
  } catch (e) {
    err(nombre, `JSON inválido: ${e.message}`);
    return null;
  }
}

const archivos = readdirSync(SONGS_DIR).filter((f) => /^song-\d+\.json$/.test(f));
const idsArchivos = new Set(archivos.map((f) => f.replace(".json", "")));

// --- index.json ---
const index = leerJson("index.json");
const idsIndex = new Set(index?.ids ?? []);
if (index) {
  for (const id of idsIndex) {
    if (!idsArchivos.has(id)) err("index.json", `id "${id}" no tiene archivo ${id}.json`);
  }
  for (const id of idsArchivos) {
    if (!idsIndex.has(id)) err("index.json", `archivo ${id}.json no está listado en index.json`);
  }
  const dup = index.ids.filter((id, i) => index.ids.indexOf(id) !== i);
  if (dup.length) err("index.json", `ids duplicados: ${[...new Set(dup)].join(", ")}`);
}

// --- canciones ---
const canciones = new Map();
const titulos = new Map();
for (const archivo of archivos) {
  const c = leerJson(archivo);
  if (!c) continue;
  const id = archivo.replace(".json", "");
  canciones.set(id, c);

  if (c.id !== id) err(archivo, `campo id "${c.id}" no coincide con el nombre de archivo`);
  for (const campo of ["titulo", "artista", "autor", "genero", "idioma"]) {
    if (typeof c[campo] !== "string") err(archivo, `campo "${campo}" ausente o no es string`);
  }
  if (typeof c.titulo === "string" && c.titulo.trim()) {
    const clave = c.titulo.trim().toLowerCase();
    if (titulos.has(clave)) warn(archivo, `título duplicado con ${titulos.get(clave)}: "${c.titulo}"`);
    else titulos.set(clave, id);
  }
  if (!Array.isArray(c.versions) || c.versions.length === 0) {
    err(archivo, "sin versions");
    continue;
  }
  c.versions.forEach((v, vi) => {
    const ctx = `versions[${vi}]`;
    if (!v.tonalidad) warn(archivo, `${ctx} sin tonalidad — la transposición no funcionará`);
    if (!Array.isArray(v.secciones) || v.secciones.length === 0) {
      err(archivo, `${ctx} sin secciones`);
      return;
    }
    v.secciones.forEach((s, si) => {
      const sctx = `${ctx}.secciones[${si}]`;
      if (!TIPOS_VALIDOS.has(s.tipo)) err(archivo, `${sctx} tipo inválido: "${s.tipo}"`);
      if (!Array.isArray(s.lineas)) {
        err(archivo, `${sctx} sin lineas`);
        return;
      }
      s.lineas.forEach((l, li) => {
        const lctx = `${sctx}.lineas[${li}]`;
        if (typeof l.texto !== "string") err(archivo, `${lctx} texto no es string`);
        if (!Array.isArray(l.acordes)) {
          err(archivo, `${lctx} acordes no es array`);
          return;
        }
        let posAnterior = -1;
        l.acordes.forEach((a, ai) => {
          const actx = `${lctx}.acordes[${ai}]`;
          if (!Number.isInteger(a.pos) || a.pos < 0) {
            err(archivo, `${actx} pos inválida: ${a.pos}`);
          } else {
            if (typeof l.texto === "string" && l.texto.length > 0 && a.pos > l.texto.length) {
              warn(archivo, `${actx} pos ${a.pos} excede el largo del texto (${l.texto.length}): "${a.acorde}" sobre "${l.texto.slice(0, 40)}…"`);
            }
            if (a.pos <= posAnterior) warn(archivo, `${actx} pos ${a.pos} no crece respecto al acorde anterior (${posAnterior})`);
            posAnterior = a.pos;
          }
          if (typeof a.acorde !== "string" || !RE_ACORDE.test(a.acorde.trim())) {
            err(archivo, `${actx} acorde no reconocido: "${a.acorde}" (¿notación latina o texto suelto?)`);
          }
        });
      });
    });
  });
}

// --- songs_summary.json ---
const summary = leerJson("songs_summary.json");
if (summary) {
  const lista = Array.isArray(summary) ? summary : summary.songs ?? summary.canciones ?? [];
  if (!Array.isArray(lista)) {
    err("songs_summary.json", "estructura no reconocida (se esperaba array de resúmenes)");
  } else {
    const idsSummary = new Set(lista.map((s) => s.id));
    for (const id of idsArchivos) {
      if (!idsSummary.has(id)) err("songs_summary.json", `falta resumen de ${id}`);
    }
    for (const s of lista) {
      const c = canciones.get(s.id);
      if (!c) {
        err("songs_summary.json", `resumen de "${s.id}" sin archivo de canción`);
        continue;
      }
      if (s.titulo !== c.titulo) err("songs_summary.json", `${s.id}: titulo desincronizado ("${s.titulo}" vs "${c.titulo}")`);
      if (Number.isInteger(s.versions_count) && s.versions_count !== c.versions.length) {
        err("songs_summary.json", `${s.id}: versions_count=${s.versions_count} pero hay ${c.versions.length}`);
      }
      const tonalidad = c.versions.find((v) => v.es_original)?.tonalidad ?? c.versions[0]?.tonalidad;
      if (s.tonalidad !== undefined && s.tonalidad !== tonalidad) {
        err("songs_summary.json", `${s.id}: tonalidad desincronizada ("${s.tonalidad}" vs "${tonalidad}")`);
      }
    }
  }
}

// --- reporte ---
console.log(`Canciones: ${archivos.length} archivos, ${idsIndex.size} en index.json`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warnings:`);
  for (const w of warnings.slice(0, 40)) console.log(`  ${w}`);
  if (warnings.length > 40) console.log(`  … y ${warnings.length - 40} más`);
}
if (errores.length) {
  console.error(`\n✖ ${errores.length} errores:`);
  for (const e of errores.slice(0, 60)) console.error(`  ${e}`);
  if (errores.length > 60) console.error(`  … y ${errores.length - 60} más`);
  process.exit(1);
}
console.log("\n✓ Validación OK (sin errores)");
