---
name: kb-sync
description: Use when checking whether the numeric values Setas OS hard-codes (KB_SPP, KB_SUB, KPI in "Setas OS v5.dc.html", extraction-factors.json) still match what knowledge_base/ documents, or after editing either side of that pair. Runs scripts/quality/check_kb_sync.py and reports value mismatches, KB-only parameters, and app-only parameters — it never edits either side.
---

# Divergencia knowledge_base ↔ Setas OS

`knowledge_base/` es la fuente canónica de parámetros agronómicos. El app
(`field-os-simulador/setas-os/`) los usa hard-codeados en objetos JS
(`KB_SPP`, `KB_SUB`, `KPI` dentro de `Setas OS v5.dc.html`) y en
`extraction-factors.json`. Nada mantiene esas dos copias sincronizadas
automáticamente: si alguien actualiza un rango en `01_species/*.md` y no
propaga el cambio a `KB_SPP`, el app sigue operando con el valor viejo sin
que nada lo señale. Este skill corre el detector de esa divergencia.

## Cuándo usarlo

- Antes de abrir PR que toque `knowledge_base/01_species/`,
  `knowledge_base/02_substrates/`, o los objetos `KB_SPP` / `KB_SUB` / `KPI`
  en `Setas OS v5.dc.html`.
- Periódicamente como auditoría, incluso sin cambios recientes — la
  divergencia se acumula en silencio.
- Nunca como gate de CI todavía: no está cableado en
  `scripts/quality/run.sh` ni en `.github/workflows/quality.yml` (ver
  «Por qué no es un gate todavía»).

## Cómo correrlo

```bash
python3 scripts/quality/check_kb_sync.py
```

Sale `0` siempre que el script termine de correr, tenga o no divergencias —
es un reporte, no una compuerta. Para usarlo como compuerta manual:

```bash
python3 scripts/quality/check_kb_sync.py --fail-on-mismatch
```

Sale `1` solo si hay al menos un `value_mismatch` de severidad `real`
(`present_in_kb_absent_in_app` y `present_in_app_absent_from_kb` nunca
fallan la compuerta, incluso con `--fail-on-mismatch`: son huecos de
cobertura conocidos, no errores de valor).

## Qué reporta

Tres categorías, por cada punto de comparación curado en el script:

| Categoría | Significa |
|---|---|
| `value_mismatch` | Ambos lados definen el parámetro y los números no coinciden |
| `present_in_kb_absent_in_app` | `knowledge_base/` lo documenta; el app no tiene valor |
| `present_in_app_absent_from_kb` | El app lo hard-codea; no hay fuente en `knowledge_base/` |

Cada `value_mismatch` lleva además una severidad:

- **`real`** — los números difieren de verdad; alguien tiene que decidir cuál
  es correcto y corregir el lado que quedó atrás.
- **`representation`** — probablemente es el mismo hecho en otra forma (un
  punto único del app cae dentro de un rango documentado, o viceversa). Sigue
  siendo una divergencia reportable, pero de menor prioridad.

## Cómo leer el reporte

```
[real] pleurotus_ostreatus / Fructificación temperatura
    KB  (knowledge_base/01_species/pleurotus_ostreatus.md): 13–24
    App (KB_SPP.pleurotus_ostreatus.fruitT): [10, 21]
```

`KB` cita el archivo fuente y el texto numérico crudo que se extrajo de la
tabla o el párrafo (puede incluir varias lecturas candidatas separadas por
`;` cuando el texto ofrece un rango "óptimo" y uno "tolerado" — el checker no
elige entre ellos, compara contra todos). `App` cita la ruta exacta dentro
del objeto JS o el JSON. Ninguna de las dos líneas es "la correcta" por
default: la decisión de cuál corregir es humana.

## Qué NO hace

- **No edita nada.** Ni `knowledge_base/` ni los archivos del app. Ver
  [`knowledge_base/AGENTS.md`](../../../knowledge_base/AGENTS.md): cualquier
  edición canónica requiere autorización humana explícita. Este script solo
  reporta; corregir el valor divergente es un paso separado y manual.
- **No infiere nuevos puntos de comparación.** La lista de qué comparar
  (`SPECIES_SYNC_POINTS`, `SUBSTRATE_SYNC_POINTS`, `KPI_SYNC_POINTS` en
  `check_kb_sync.py`) está escrita a mano, igual que
  `check_repository.py` hardcodea sus propias reglas conocidas. Un matcher
  genérico por NLP produciría más falsos positivos que un catálogo corto y
  revisable — la fraseología varía entre archivos de especie (compara
  `ganoderma_lucidum.md`, que separa temperatura de inducción y de
  fructificación en filas distintas, contra `pleurotus_ostreatus.md`, que
  las junta en una). Si agregas una especie o sustrato nuevo al app, agrega
  también su punto de comparación aquí — el checker no lo va a descubrir solo.
- **No resuelve ambigüedad de unidades por ti.** Distingue coma decimal
  (`11,5%`) de coma de miles (`1,000 ppm`) con una heurística de cantidad de
  dígitos después de la coma; si un valor nuevo rompe esa heurística,
  aparecerá como no parseado (sin candidatos) en vez de como número
  incorrecto — revisa el texto fuente si ves eso.

## Por qué no es un gate todavía

La primera corrida real produjo ruido esperado, en particular:
`extraction-factors.json` completo no tiene ninguna fuente en
`knowledge_base/` — sus `yield_factor`, `optimal_alcohol_pct`, etc. no están
documentados en ningún archivo de especie ni de investigación. Eso es un
hueco de documentación real, pero cablear el checker como gate bloqueante
antes de triar ese ruido rompería el primer PR que lo toque por una razón
que no tiene nada que ver con ese PR. Cuando el ruido conocido esté triado
(documentar las fuentes que faltan, o marcar explícitamente el gap como
aceptado), agregar la línea a `scripts/quality/run.sh` y a
`.github/workflows/quality.yml` es la única extensión pendiente.

## Extender el catálogo de puntos de comparación

Cada punto (`SyncPoint` en `check_kb_sync.py`) declara: la entidad, el
archivo de `knowledge_base/`, un patrón de encabezado de sección, un patrón
de etiqueta de fila/línea, y cómo leer el valor del app (`app_getter`).
`kb_candidates_for` concatena todos los encabezados que matchean el patrón
de sección, busca filas de tabla o líneas de prosa que matcheen el patrón de
etiqueta, y extrae todas las lecturas numéricas plausibles de cada una — no
solo la primera. Si necesitas comparar un parámetro nuevo, sigue el patrón
de `species_point` / `substrate_point` / `kpi_point` ya existentes en vez de
escribir extracción a mano.
