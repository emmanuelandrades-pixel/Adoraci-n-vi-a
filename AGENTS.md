# Adoración Viña — guía para agentes

App de cancionero para el ministerio de adoración (Viña Casa de Amor, Talca):
biblioteca de canciones con acordes, transposición, modo ensayo con auto-scroll,
set lists con export a PDF, eventos con recordatorios push, y documentos.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Comandos y su estado real

| Comando | Estado |
|---|---|
| `npx tsc --noEmit` | ✅ El check confiable (~5 s). Úsalo siempre antes de commitear. |
| `npm run validate:songs` | ✅ Valida los datos de canciones (esquema, index, summary). Córrelo tras tocar `public/data/songs/`. |
| `npm run lint` | ⚠️ Falla con ~14 errores **preexistentes** (comillas sin escapar, setState en efectos, etc.). No los introdujiste tú; no intentes arreglarlos salvo que sea el encargo. |
| `npm run build` | ⚠️ Requiere `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valores dummy sirven) o revienta en `/api/notify`. |
| Tests | No existen. |

## Datos de canciones — LEE ESTO ANTES DE TOCAR CANCIONES

- **`public/data/` es lo canónico.** La carpeta `data/` en la raíz es un fósil
  con esquema viejo: **nada en `src/` la lee; no la edites.**
- Agregar/editar una canción exige tocar **3 archivos** o quedan desincronizados:
  1. `public/data/songs/song-XXX.json` (la canción; esquema en `src/types/cancion.ts`)
  2. `public/data/songs/index.json` (lo usan los set lists — si falta el id, la
     canción existe en la biblioteca pero no se puede agregar a un set list)
  3. `public/data/songs/songs_summary.json` (lo usa la biblioteca)

  Después corre `npm run validate:songs`.
- **Semántica de `pos`:** cada acorde es `{ acorde, pos }` donde `pos` es el
  offset EN CARACTERES dentro de `texto`, pintado con unidades `ch` sobre fuente
  monoespaciada en pantalla y con espacios en el PDF. Es frágil: si cambias
  fuente o escala, se rompe la alineación.
- El formato de entrada humano (txt con acordes encima de la letra) está en
  `GUIA_INGRESO_CANCIONES.md`. Usa la skill `agregar-cancion` para el flujo completo.
- Historial: el formato "dos columnas" de los .docx originales causó semanas de
  retrabajo. Si una canción se ve mal, la fuente de verdad son los documentos
  originales de Drive — no parchees posiciones a mano.

## Zonas frágiles (cambiar con cuidado)

- **La alineación de acordes está DUPLICADA**: `src/components/canciones/LineaConAcordes.tsx`
  (pantalla, CSS `left: pos ch`) y `src/components/pdf/SetListDocument.tsx`
  (PDF, reconstruye la línea de acordes con espacios). Un cambio en una exige
  revisar la otra. Bug histórico: medir `pos` con la fuente de acordes (más
  chica) en vez de la de letra produce desfase creciente hacia la derecha.
- **`src/components/pdf/SetListDocument.tsx`**: react-pdf no da preview; los
  tamaños de fuente se calibraron a prueba y error. Antes de ajustar "a ojo",
  genera el PDF real desde la app y míralo (skill `ajustar-pdf-setlist`).
- **`src/components/canciones/ModoEnsayo.tsx`**: auto-scroll con
  requestAnimationFrame + acumulador de sub-píxeles (el navegador ignora
  `scrollTop += <1px`) y contenedor `h-screen + overflow-hidden`. No "simplifiques"
  esos dos detalles: son fixes de bugs reales.
- **`src/lib/utils/transposicion.ts`**: lógica musical pura sin tests.
- **Stores Zustand (`src/store/`)**: patrón localStorage optimista + upsert a
  Supabase + canal realtime. La UI nunca debe esperar a Supabase (bug histórico
  de UI congelada).

## Restricciones de despliegue

- **Vercel plan Hobby**: cron máximo 1×/día. Por eso `/api/cron/recordatorio`
  corre diario a las 9:00 y usa una ventana de 23–25 h para "24 h antes".
  No propongas crons por hora.
- **Supabase**: RLS con políticas públicas anónimas a propósito (app interna sin
  login). No agregues auth sin que te lo pidan.
- Env vars completas en `.env.example`; las VAPID y `CRON_SECRET` solo las usan
  las rutas `/api/notify` y `/api/cron/recordatorio`.

## Idioma

Todo en español: UI, commits, comentarios, documentación.
