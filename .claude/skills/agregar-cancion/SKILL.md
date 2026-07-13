---
name: agregar-cancion
description: Agregar una o más canciones nuevas al cancionero desde texto (formato de GUIA_INGRESO_CANCIONES.md), un .docx o dictado del usuario. Usar SIEMPRE que se pida agregar, importar o corregir canciones, porque hay 3 archivos que mantener sincronizados.
---

# Agregar una canción al cancionero

## Regla de oro

Una canción vive en **3 archivos** de `public/data/songs/` y los tres deben
quedar consistentes. NUNCA edites la carpeta `data/` de la raíz (es un fósil
que nada lee).

## Flujo

1. **Determina el próximo id**: mira el mayor `song-XXX.json` existente en
   `public/data/songs/` y suma 1 (relleno a 3 dígitos).

2. **Convierte la letra al JSON** con el esquema de `src/types/cancion.ts`:
   - Entrada esperada: formato de `GUIA_INGRESO_CANCIONES.md` (cabecera
     `TITULO:`/`TONALIDAD:`/etc., secciones `[VERSO 1]`, línea de acordes
     ENCIMA de cada línea de letra).
   - Cada acorde se convierte a `{ "acorde": "F", "pos": N }` donde `pos` es la
     **columna en caracteres** donde empieza el acorde en su línea original.
     La alineación visual depende de ese offset exacto: no lo estimes, cuéntalo.
   - Tipos de sección válidos: `intro`, `verso`, `pre-coro`, `coro`, `puente`,
     `final-coro`, `outro`, `instrumental`.
   - Acordes en notación inglesa (`C`, no `Do`). Si la entrada viene en notación
     latina, tradúcela y avísale al usuario.
   - ids internos: versión `song-XXX-v001`, secciones `s001`, `s002`, …
   - Si la fuente es un `.docx` a dos columnas: las columnas son SECUENCIALES
     (primero toda la izquierda, luego toda la derecha). No las mezcles línea a
     línea — este error costó semanas de retrabajo en el pasado.

3. **Escribe los 3 archivos**:
   - `public/data/songs/song-XXX.json` — la canción completa.
   - `public/data/songs/index.json` — agrega el id a `ids` (orden ascendente).
     Si falta, la canción no aparece al armar set lists.
   - `public/data/songs/songs_summary.json` — agrega el resumen
     (`CancionResumen` en `src/types/cancion.ts`: id, titulo, artista, autor,
     genero, idioma, favorita, activa, tonalidad, bpm, versions_count,
     versions_nombres).

4. **Valida**: `npm run validate:songs` debe salir en verde. Revisa también los
   warnings de la canción nueva (pos fuera de rango suele ser acorde mal contado).

5. **Verifica visualmente** si es posible: `npm run dev` y abre la canción; los
   acordes deben caer sobre la sílaba correcta.

## Correcciones a canciones existentes

Si el usuario reporta acordes desalineados, NO parchees `pos` a ojo: pide el
documento original (o el texto en formato guía) y reconstruye la canción entera
desde la fuente. Los parches a mano fueron la causa #1 de retrabajo del proyecto.
