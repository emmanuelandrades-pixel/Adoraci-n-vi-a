# Guía para Ingresar Canciones
## Ministerio de Adoración – Viña Casa de Amor, Talca

Esta guía explica cómo escribir una canción en formato de texto para que luego
pueda ser convertida al formato JSON de la plataforma sin errores.

---

## 1. Información general de la canción

Al inicio de cada canción escribe los siguientes datos, uno por línea:

```
TITULO: Abres Caminos
ARTISTA: Way Maker
AUTOR: Israel Houghton
GENERO: Adoración
IDIOMA: Español
TONALIDAD: F
BPM: 72
COMPAS: 4/4
DURACION: 4:30
```

### Campos obligatorios
| Campo | Descripción | Ejemplo |
|---|---|---|
| `TITULO` | Nombre de la canción en español | `Abres Caminos` |
| `ARTISTA` | Nombre artístico / nombre original en inglés si aplica | `Way Maker` |
| `TONALIDAD` | Tonalidad en que se cantará | `F`, `G`, `Am`, `Bb` |

### Campos opcionales (si no sabes, déjalos en blanco)
| Campo | Descripción | Ejemplo |
|---|---|---|
| `AUTOR` | Compositor o letrista | `Israel Houghton` |
| `GENERO` | Estilo musical | `Adoración`, `Alabanza`, `Himno` |
| `IDIOMA` | Idioma de la letra | `Español` (por defecto) |
| `BPM` | Pulsos por minuto | `72` |
| `COMPAS` | Compás | `4/4` (por defecto) |
| `DURACION` | Duración aproximada | `4:30` |

---

## 2. Estructura de la letra y acordes

### 2.1 Secciones

Antes de cada sección escribe su tipo entre corchetes `[ ]`:

```
[INTRO]
[VERSO]
[VERSO 1]
[VERSO 2]
[PRE-CORO]
[CORO]
[PUENTE]
[FINAL-CORO]
[OUTRO]
[INSTRUMENTAL]
```

Si hay varias estrofas del mismo tipo, agrega el número: `[VERSO 1]`, `[VERSO 2]`, etc.
Si una sección no tiene número (por ejemplo un coro único), escríbelo sin número: `[CORO]`.

---

### 2.2 Acordes sobre la letra

Los acordes van en la línea **inmediatamente encima** de la palabra donde suenan,
usando espacios para alinearlos con la sílaba exacta.

**Ejemplo correcto:**

```
[VERSO 1]
F                C
Milagroso abres caminos cumples promesas
G                    Am7
luz en tinieblas mi Dios así eres tú
```

Aquí el acorde `F` va sobre "Milagroso", `C` va sobre "caminos", etc.

**Reglas para los acordes:**
- Una línea de acordes, luego la línea de letra. Siempre en ese orden.
- Si una línea no tiene acordes, escribe directamente la letra sin línea de acordes encima.
- Si la línea de acordes está vacía (la sección es solo instrumental o un acorde suelto), escríbela igual.
- No dejes líneas en blanco dentro de una misma sección, solo entre secciones diferentes.

---

### 2.3 Notación de acordes

Usa la notación estándar inglesa (letras mayúsculas A–G):

| Escribe | Significa |
|---|---|
| `C`, `D`, `E`, `F`, `G`, `A`, `B` | Acordes mayores |
| `Cm`, `Dm`, `Em`... | Acordes menores |
| `Am7`, `Dm7`, `G7` | Con séptima |
| `Cadd9`, `Gsus2` | Con tensiones |
| `C/E`, `G/B` | Bajo en nota diferente (inversiones) |
| `Bb`, `Eb`, `Ab` | Bemoles (usa `b` minúscula) |
| `F#`, `C#` | Sostenidos (usa `#`) |

**No uses:** `Do`, `Re`, `Mi`, `Fa`, `Sol`, `La`, `Si` — escríbelos en inglés: `C`, `D`, `E`, `F`, `G`, `A`, `B`.

---

## 3. Ejemplo completo

```
TITULO: Abres Caminos
ARTISTA: Way Maker
AUTOR: Sinach
GENERO: Adoración
IDIOMA: Español
TONALIDAD: F
BPM: 68
COMPAS: 4/4
DURACION: 5:00

[INTRO]
F  C  G  Am7

[VERSO]
F           C              G          Am7
Aquí estás, te vemos mover, te adoraré, te adoraré
F          C           G         Am7
Aquí estás, obrando en mí, te adoraré, te adoraré

[VERSO 1]
F                C
Milagroso abres caminos cumples promesas
G                    Am7
luz en tinieblas mi Dios así eres tú

[VERSO 2]
F                  C
Aquí estás sanando mi corazón te adoraré
G               Am7
te adoraré aquí estás tocando mi corazón

[VERSO 3]
F        C             G           Am7
Así eres tú, así eres tú, así eres tú, así eres tú

[PUENTE]
F                          C
Aunque no pueda ver, estás obrando
G                         Am7
siempre estás, siempre estás obrando

[CORO]
F    C     G    Am7
Eres el camino en medio del desierto
F         C        G       Am7
Eres el río en medio de la sequía
```

---

## 4. Errores frecuentes — qué NO hacer

### ❌ Usar notación latina para los acordes
```
DO  RE  MI  SOL
Milagroso abres caminos
```
✅ Correcto: `C  D  E  G`

---

### ❌ Escribir el acorde en la misma línea que la letra
```
Milagroso [F] abres caminos [C] cumples promesas
```
✅ Correcto: el acorde va en la línea de arriba, alineado con la sílaba.

---

### ❌ Dejar el tipo de sección sin formato reconocible
```
-- Estrofa 1 --
Estrofa:
* CORO *
```
✅ Correcto: usar siempre `[VERSO 1]`, `[CORO]`, `[PUENTE]`, etc.

---

### ❌ Mezclar secciones sin línea en blanco entre ellas
```
[VERSO 1]
F
Milagroso abres caminos
[CORO]
F    C
Eres el camino
```
✅ Correcto: dejar **una línea en blanco** entre sección y sección.

---

### ❌ Olvidar la tonalidad
Si no se indica tonalidad, la transposición automática no funcionará.
Siempre incluir `TONALIDAD: X` al inicio.

---

### ❌ Poner dos secciones del mismo tipo sin numerarlas si son distintas
Si hay dos estrofas diferentes, nombrarlas `[VERSO 1]` y `[VERSO 2]`.
Si la letra se repite exactamente, es la misma sección — escríbela una sola vez.

---

## 5. Tipos de sección válidos

| Lo que escribes | Cómo aparece en la app |
|---|---|
| `[INTRO]` | INTRO |
| `[VERSO]` | VERSO |
| `[VERSO 1]`, `[VERSO 2]`... | VERSO 1, VERSO 2... |
| `[PRE-CORO]` | PRE-CORO |
| `[CORO]` | CORO |
| `[PUENTE]` | PUENTE |
| `[FINAL-CORO]` | FINAL CORO |
| `[OUTRO]` | OUTRO |
| `[INSTRUMENTAL]` | INSTRUMENTAL |

---

## 6. Un archivo por canción

Guarda cada canción en un archivo de texto separado (`.txt`).
Nombra el archivo igual que el título de la canción, sin tildes ni caracteres especiales:

```
Abres Caminos.txt
Santo Para Siempre.txt
Agnus Dei.txt
```

No uses: `Abrés Caminos.txt` ni `cancion1.txt`.

---

## 7. Checklist antes de entregar

Antes de enviar el archivo, verifica:

- [ ] El `TITULO` y `TONALIDAD` están completos al inicio
- [ ] Cada sección tiene su etiqueta `[TIPO]` en la línea anterior
- [ ] Los acordes están en la línea **encima** de la letra, alineados con la sílaba
- [ ] Los acordes están en notación inglesa (A, B, C, D, E, F, G)
- [ ] Hay una línea en blanco entre cada sección
- [ ] El archivo se llama igual que la canción

---

*Cualquier duda, consultar con Emmanuel antes de procesar los archivos.*
