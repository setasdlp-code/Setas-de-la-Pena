# Criterio Theme Lab — Entorno Oficial de Authoring DS-2026

Entorno visual integral de diseño, autoría y verificación de **DS-2026 · Criterio Edition**. Permite experimentar interactivamente con todos los tokens canónicos del sistema, previsualizar componentes operacionales, simular etiquetas físicas térmicas y aplicar cambios validados directamente al repositorio.

## Apertura Local

Desde `field-os-simulador/setas-os/`:

```bash
npm run theme-lab
```

Abre en tu navegador:

```text
http://localhost:4173/theme-lab.html
```

> **Nota:** El Theme Lab está intencionalmente fuera de la navegación productiva de Setas OS. Es una herramienta de diseño y authoring, no un módulo del cockpit operacional.

---

## 1. Los 5 Editores Canónicos de Tokens

El Theme Lab carga, edita y exporta las 5 fuentes canónicas sin pérdida de claves no reconocidas:

1. **`primitives.json`**:
   - Pigmentos minerales absolutos (`paper-100`, `paper-50`, `paper-200`, `ink-900`, `ink-700`, `ink-500`, `moss-900`, `moss-700`, `moss-500`, `coral-500`, `coral-700`, `slate-500`, `sand-500`, `bark-700`, `warning`, `warning-text`, `rule-500`).
   - Lavados derivados (`moss-tint`, `coral-tint`, `warning-tint`, `bark-tint`). Se recalculan reactivamente al modificar un pigmento primitivo, pero se preservan intactos si no se editan.
2. **`semantic.json`**:
   - Mappings de roles funcionales: `brand.*`, `action.*`, `status.*`, `text.*`, `border.*`, `surface.*`.
3. **`typography.json`**:
   - Escala tipográfica completa: `display-01`, `display-02`, `heading-01` a `03`, `species`, `latin`, `body`, `small`, `data`, `label`, `micro`.
   - Controles de pesos tipográficos (`weights`: 300 Light a 900 Black) para roles principales.
   - Controles de interlineado (`leading`), espaciado entre caracteres (`tracking`) y dominancia de familia tipográfica (`Gaya` editorial vs `IBM Plex`).
   - Probador de tipografía en vivo interactivo con selector de rol y muestra editable.
4. **`spacing.json`**:
   - Escala base 8px (`space-half` a `space-9`).
   - Suelo táctil de campo (`tapTargetMin`: 44px estándar vs 48px con guantes).
   - Geometría de reglas (1px hairline / 2px heavy) y micro-radios (0px vs 2px).
   - Gutters y márgenes por modo de superficie (`field`, `control`, `culinary`, `archive`).
5. **`domain.json`**:
   - Símbolos de procedencia de datos (`●` medido, `◆` calculado, `◇` estimado, `△` manual, `◎` target).
   - Símbolos de estado de sincronización (`✓`, `◌`, `✕`, `⚡`).
   - Tratamiento y severidad de cuarentena (`dashed`, `solid`, `double`).

---

## 2. Working Copies & Diff Inspector

- **Indicador de Estado**: Muestra `CANONICAL (BASELINE)` cuando no hay modificaciones, o `NOT CANONICAL · N TOKENS MODIFICADOS` cuando se alteran valores.
- **Variaciones de Trabajo**:
  - `Criterio Canónico`: Restablece exactamente a los archivos base sin drift.
  - `Alto Contraste Campo`: Variación orientada a legibilidad bajo luz solar directa en invernaderos.
  - `Cálido Botánico`: Exploración con mayor presencia de tonos tierra y papel crema.
  - `Cámara Oscura / Low-Glare`: Paleta mineral oscura de baja emisión lumínica para cuartos de incubación o cosechas nocturnas (4 AM) sin deslumbrar al operario.
- **Diff Inspector Granular**:
  - Tabla comparativa `CANONICAL` vs `WORKING`.
  - Filtros por categoría: *Todos*, *Colores*, *Tipografía*, *Espaciado*, *Dominio*.
  - Botón individual **[Revertir]** por cada token modificado.

---

## 3. Compuertas Pre-Flight (Integrity Gates)

Antes de permitir aplicar los cambios al repositorio, el sistema valida 8 compuertas duras:
1. `JSON valid`: Todos los objetos serializan a JSON válido.
2. `semantic refs resolve`: Toda referencia `{color.primitive.*}` apunta a un pigmento existente.
3. `body >= 16px`: El cuerpo de texto no baja de 16px (suelo de lectura canónico).
4. `screen metadata >= 11px`: Los metadatos en pantalla respetan el suelo de 11px.
5. `FIELD target >= 44px`: Los controles en modo campo garantizan accesibilidad táctil.
6. `contrast sanctioned pairs`: Los pares críticos de texto y acción cumplen WCAG AA (≥ 4.5:1).
7. `unknown keys preserved`: Se verifica que ninguna clave o metadata ajena al formulario haya sido eliminada.
8. `canonical repo selected`: Se verifica que la carpeta de destino sea `08_brand/ds-2026/tokens`.

---

## 4. Simulador Físico Phomemo M110

En la pestaña **Print (Phomemo)**:
- **Editor dinámico en vivo**: Permite alternar la especie (*Shiitake*, *Melena de León*, *Orellana*, *Reishi*), editar el código de lote, la ubicación/fila y la generación para ver en tiempo real cómo quiebra el texto y cómo se re-renderiza el código QR vectorial.
- **Formatos físicos exactos**:
  - **40 × 30 mm** (Etiquetas de bolsa, inóculo y ensayo).
  - **50 × 30 mm** (Etiquetas comerciales y de despacho).
- **Modo 1-Bit Térmico**:
  - Simulación de impresión directa sin escala de grises (blanco o negro puro, sin antialiasing).
  - Permite verificar si códigos QR, líneas finas o tipografía pierden contraste físico en la impresora térmica de 203 DPI.
- **Código QR Dinámico**: Generado mediante `qr-mini.js` con el enlace de trazabilidad pública del lote.

---

## 5. Canvas Agronómico & Culinario

- **Ficha de Formulación**:
  - Barra de relación **C:N** con indicación de zona óptima (25:1 a 40:1, ideal 28:1).
  - Humedad proyectada de mezcla (65.2%).
  - Eficiencia Biológica estimada (BE: 92%).
  - Contenido de nitrógeno N% (1.52%).
  - Clasificación explícita de procedencia (`CALCULATED`, `TARGET`, `MEASURED`, `ESTIMATED`).
- **Dossier Organoléptico de Cata**:
  - Ficha sensorial para chefs y mercado culinario con notas de cata, perfil de textura y maridajes recomendados.

---

## 6. Guardado Seguro al Repo

El botón **[Aplicar JSON al Repo]**:
1. Utiliza la **File System Access API** del navegador (`window.showDirectoryPicker()`).
2. Requiere seleccionar la carpeta canónica `08_brand/ds-2026/tokens`.
3. Escribe **únicamente** los 5 archivos JSON canónicos (`primitives.json`, `semantic.json`, `typography.json`, `spacing.json`, `domain.json`).
4. **Nunca** escribe directamente en los artefactos distribuidos (`setas-os/ds-2026/`).

### Paso posterior a la aplicación:

Tras guardar los archivos, ejecuta en tu terminal:

```bash
node 08_brand/ds-2026/scripts/build-tokens.mjs
node 08_brand/ds-2026/scripts/sync-consumers.mjs
node 08_brand/ds-2026/scripts/visual-contract.mjs
cd field-os-simulador/setas-os && node build.js && npm test
```


## Click-to-Edit Inspector

The canvas includes a token-aware Inspect Mode inspired by Figma Inspect / DevTools.

Activate it with **⌖ Inspeccionar** or `Alt + I`. Press `Escape` to cancel and clear the selection.

While Inspect Mode is active:

- hover draws a non-destructive reticle around the nearest canonical component;
- click selects the nearest known DS component rather than an incidental nested span/icon;
- the **Inspector** sidebar opens automatically;
- computed font, colour, surface, border, padding and minimum size are shown;
- known components expose only token paths that actually govern them;
- unresolved nodes are **computed-only** and never receive invented JSON paths.

Examples:

- `.sdp-btn--primary` → semantic action/text mappings, canonical FIELD height, rule/radius and the typography sources it consumes;
- `.species-name` / `.sdp-species__common` → species typography and text semantic role;
- `.sdp-reading__value` → primary text + the canonical size source actually consumed;
- `.sdp-provenance[data-provenance]` → surface/text/border mappings + provenance domain symbol/label;
- `.sdp-sync[data-sync]` → sync-domain symbol/label;
- lot/task/band/panel roots → their surface/border/geometry contracts.

When CSS still contains a literal rather than a canonical token, the Inspector reports it as **tokenization debt** instead of pretending the property is editable through a JSON token.

### Direct editing

Inspector changes mutate the same five working copies used by the global Theme Lab:

- `primitives.json`
- `semantic.json`
- `typography.json`
- `spacing.json`
- `domain.json`

Every edit therefore appears in the Diff Inspector, can be reverted, exported and — if pre-flight passes — written through File System Access.

**Ir a Token en Sidebar** switches to the relevant global editor and highlights the corresponding canonical control when one exists.

### Canonical geometry

Rule thickness is now first-class spacing data:

```json
"rule": {
  "hairline": "1px",
  "heavy": "2px",
  "frame": "1px"
}
```

`build-tokens.mjs` compiles these values into `--rule-hairline`, `--rule-heavy` and `--rule-frame`.

FIELD action height and action/provenance borders were also bound to canonical tokens without changing their baseline appearance, so Inspector edits affect the real components rather than Theme Lab-only overrides.

### Inspector safety

The repository write gate additionally protects:

- body ≥ 16px;
- operative data ≥ 13px;
- label / screen metadata ≥ 11px;
- touch target ≥ 44px;
- FIELD cell ≥ 48px;
- rule geometry within the supported range;
- semantic references resolve;
- critical semantic contrast remains AA.

Selecting a repository folder remains a permission step and is informational until the user invokes **Aplicar JSON al Repo**; it does not disable the button before the folder picker can be opened.


## Gaya Patched Italic

The vendored Gaya Patched family includes six real weights and matching italic faces:

| Weight | Normal | Italic |
| --- | --- | --- |
| 100 Thin | GayaPatched-Thin.otf | GayaPatched-ThinItalic.otf |
| 300 Light | GayaPatched-Light.otf | GayaPatched-LightItalic.otf |
| 400 Regular | GayaPatched-Regular.otf | GayaPatched-Italic.otf |
| 500 Medium | GayaPatched-Medium.otf | GayaPatched-MediumItalic.otf |
| 700 Bold | GayaPatched-Bold.otf | GayaPatched-BoldItalic.otf |
| 900 Black | GayaPatched-Black.otf | GayaPatched-BlackItalic.otf |

There is **no vendored Gaya Semibold 600**. Theme Lab therefore never presents 600 as a real Gaya face.

Typography authoring is modeled as three separate properties:

```json
{
  "family": "editorial",
  "style": "italic",
  "weight": 700
}
```

This is deliberately not modeled as a separate fake family called “Gaya Patched Italic”. The CSS font family remains `Gaya Patched`; `font-style: italic` selects the matching vendored face at the requested real weight.

In **Tipografía → Familia & Estilo**, every typography role can choose its family and supported style. When a role uses Gaya Patched, the Style control exposes **Normal / Italic** and the Weight control is restricted to:

```text
100 Thin
300 Light
400 Regular
500 Medium
700 Bold
900 Black
```

The **Gaya Patched · 12 Faces Reales** matrix renders every normal/italic face side by side for visual comparison.

Two bulk helpers are available:

- **Aplicar Italic a roles Gaya**
- **Aplicar Normal a roles Gaya**

They preserve each role’s current supported weight and only change `style`.

The click-to-edit Inspector uses the same family-aware constraints. Pre-flight blocks repository writes if a role requests a weight/style combination that is not supported by the vendored family metadata.
