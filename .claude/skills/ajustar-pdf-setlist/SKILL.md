---
name: ajustar-pdf-setlist
description: Ajustar el PDF de set list (fuentes, portada, columnas, alineación de acordes) en src/components/pdf/SetListDocument.tsx. Usar cuando se pida cambiar el aspecto del PDF exportado, porque iterar a ciegas sobre react-pdf ha costado muchas sesiones.
---

# Ajustar el PDF del set list

## Contexto

`src/components/pdf/SetListDocument.tsx` genera el PDF con @react-pdf/renderer.
No hay preview: históricamente los tamaños se calibraron subiendo commits a
producción y mirando el resultado (7+ commits de puro ajuste). Evita repetirlo.

## Reglas

1. **Genera el PDF localmente antes de commitear.** `npm run dev`, arma un set
   list con 2-3 canciones (incluye una con acordes densos y una con secciones
   instrumentales) y exporta. Si estás en un entorno sin navegador visible, usa
   Playwright/Chromium para descargar el PDF y ábrelo con Read para inspeccionarlo.

2. **La alineación de acordes está duplicada.** El PDF reconstruye la línea de
   acordes insertando espacios según `pos` (función `construirLineaAcordes`);
   la pantalla usa CSS `left: pos ch` en
   `src/components/canciones/LineaConAcordes.tsx`. Si cambias la lógica de
   alineación en el PDF, revisa la de pantalla y viceversa.

3. **Bug histórico a no reintroducir:** el ancho de carácter debe medirse con la
   MISMA fuente monoespaciada de la letra. Medir con la fuente de acordes (más
   chica) produce un desfase que crece hacia la derecha.

4. **Cambios de tamaño de fuente:** letra y acordes se escalan juntos (la
   proporción actual letra 14 / acordes 12 fue calibrada por el usuario; no la
   cambies sin que lo pida). El reparto en dos columnas por peso de sección es
   heurístico: tras cambiar fuentes, verifica que ninguna sección se corte.

5. Página tamaño LETTER. La portada lleva logo, título, fecha e índice.
