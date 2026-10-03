# SETAS OS · PERITAJE VISUAL FORENSE CONTRA DS-2026
**Fecha:** Septiembre 2026  
**Entorno:** Setas OS v5 (`Setas OS v5.dc.html`, `sim.css`, `fieldos-tokens.css`, `ds-2026`)  
**Metodología:** Medición en vivo mediante Chromium Headless (Playwright) autenticado con sesión real sobre 5 viewports y 6 superficies operativas.  
**Propósito:** Producir el inventario cerrado de valores computados para ejecutar la Fase P0 de forma quirúrgica y sin regresiones.

---

## 1. Resumen Ejecutivo y Dictamen

El peritaje confirma con evidencia matemática y visual el diagnóstico: **la identidad botánica y de marca de Setas OS es sólida y reconocible, pero el producto opera bajo una crisis de gobernanza CSS y disciplina de diseño**.

### Métricas Globales del Peritaje
* **30 capturas renderizadas** (5 viewports × 6 superficies).
* **28 selectores con microtexto activo (< 11 px)** detectados en pantallas operativas (llegando hasta 7 px en `.form-summary-k` y `.os-provenance-line`).
* **3 zonas de glass / backdrop-filter blur (10–12 px)** activas en barras de navegación y headers sticky.
* **2 zonas con `linear-gradient`** en superficies de campo (footer sticky de Sesión y zonas de gauges).
* **Marca de agua de Juaica (`.fos-bg-mountain`)** presente como fondo fijo con `mix-blend-mode: multiply` en áreas de captura operativa.
* **Múltiples botones con altura visible < 44 px** (26–29 px) que delegan la accesibilidad táctil a padding virtual en vez de affordance real.

---

## 2. Metodología de Inspección y Viewports

Se configuró un harness de medición automatizado (`scratch/run-visual-forensic-audit.js`) que inyectó un evaluador de DOM para extraer geometrías (`getBoundingClientRect()`), estilos computados (`window.getComputedStyle()`), contraste WCAG y detección de anomalías.

### Viewports Evaluados
1. **Desktop operativo:** `1440 × 900 px`
2. **Laptop:** `1280 × 800 px`
3. **Tablet:** `768 × 1024 px`
4. **iPhone campo:** `390 × 844 px`
5. **Móvil angosto:** `360 × 800 px`

---

## 3. Inventario Forense por Superficie

---

### Superficie 1: Hoy / Sesión (Field OS Home)

> **Modo esperado:** `FIELD`  
> **Propósito:** Registro rápido en sala con luz deficiente y uso con guantes.  
> **Regla DS-2026:** Alta legibilidad (≥16 px lectura, 13 px dato, 11 px mono metadata), 0 elevación, 0 glass, 0 gradients.

![Hoy / Sesión Desktop 1440](/Users/sebastianpinzon/.gemini/antigravity/brain/ef69df6f-719c-4e80-a743-796379ae2822/screenshots/desktop_1440_1_hoy_sesion.png)

#### Mediciones Computadas

| Elemento / Selector | Propiedad | Render Actual | DS-2026 Esperado | Delta | Severidad | Categoría |
|---|---|---:|---:|---:|---|---|
| `.workspace-subnav` | `backdrop-filter` | `blur(10px)` | `none` | Incompatible | **P1** | Violación DS Real |
| `.workspace-subnav` | `border-bottom` | `1px solid rgba(...)` | `1px solid var(--rule)` | Blur/soft | **P1** | Violación DS Real |
| Header sticky Sesión | `backdrop-filter` | `blur(12px) saturate(1.1)` | `none` (sólido) | Incompatible | **P1** | Violación DS Real |
| Header sticky Sesión | `background` | `color-mix(84% paper, transp)` | `var(--paper-panel)` | Translúcido | **P1** | Violación DS Real |
| Sync pill (`button[onClick*="toggleOnline"]`) | `font-size` | `10px` | `11px` | −1.0 px | **P0** | Violación DS Real |
| Sync pill | `font-family` | `IBM Plex Mono` | `IBM Plex Mono` | OK | — | Conforme |
| Sync pill | `border-radius` | `6px` (`--radius-md`) | `0px` o `2px` | Incompatible | **P1** | Violación DS Real |
| Eyebrow "Registrado en esta sesión" | `font-size` | `10.5px` | `11px` | −0.5 px | **P0** | Violación DS Real |
| Eyebrow "Registrado en esta sesión" | `letter-spacing` | `0.16em` | `0.15em–0.18em` | OK | — | Conforme |
| Ledger count ("3 eventos") | `font-size` | `38px` / `15px` | `32px` / `16px` | +6 px / −1 px | **P2** | Desviación menor |
| Footer sticky acciones | `background` | `linear-gradient(...)` | `var(--paper)` sólido | Incompatible | **P1** | Violación DS Real |
| CTA "Registrar" | `height` | `54px` (padding 18px) | `≥48px` | +6 px | OK | Conforme |
| Botones secundarios (Escanear, etc.) | `border-radius` | `3px` (`--radius-sm`) | `0px` | +3 px | **P2** | Deuda técnica |
| Botones secundarios | `padding` | `13px` (height ~45px) | `≥44px` | OK | — | Conforme |

---

### Superficie 2: Lotes + BatchDetail

> **Modo esperado:** `FIELD`  
> **Propósito:** Consulta de lote, historial de bolsas, esterilización y avance de fase.  
> **Regla DS-2026:** Estructura técnica tabular, datos en mono 13 px, estados cromáticos con soporte de texto.

![Lotes Desktop 1440](/Users/sebastianpinzon/.gemini/antigravity/brain/ef69df6f-719c-4e80-a743-796379ae2822/screenshots/desktop_1440_2_lotes_batchdetail.png)

#### Mediciones Computadas

| Elemento / Selector | Propiedad | Render Actual | DS-2026 Esperado | Delta | Severidad | Categoría |
|---|---|---:|---:|---:|---|---|
| Eyebrow de página (`.page-title-eyebrow`) | `font-size` | `10px` | `11px` | −1.0 px | **P0** | Violación DS Real |
| Código de lote en tabla (`span`) | `font-size` | `9.5px` | `13px` (dato mono) | −3.5 px | **P0** | Violación DS Real |
| Botón "Comparar Lotes" (`.inv-btn-sm`) | `height` | `26px` (target real) | `≥44px` | −18 px | **P1** | Violación DS Real |
| Botón "Comparar Lotes" | `font-size` | `10.5px` | `11px` | −0.5 px | **P0** | Violación DS Real |
| Botón "Ficha Experimental" | `height` | `26px` | `≥44px` | −18 px | **P1** | Violación DS Real |
| BatchDetail primary action button | `height` | `29px` | `≥44px` | −15 px | **P1** | Violación DS Real |
| BatchDetail primary action button | `font-size` | `11.5px` | `13px` o `14px` | −1.5 px | **P1** | Violación DS Real |
| Active-lote container | `border-radius` | `6px` | `0px` | Incompatible | **P1** | Deuda técnica |
| Active-lote container | `box-shadow` | `none` | `none` | OK | — | Conforme |

---

### Superficie 3: Salas / Control (Cámaras & IoT)

> **Modo esperado:** `CONTROL`  
> **Propósito:** Supervisión de variables ambientales críticas (T°, HR, CO₂) y actuación correctiva.  
> **Regla DS-2026:** Reglas de separación 1 px / 2 px, datos numéricos 13 px mono tabular, estado `moss` / `warning` / `rust`.

![Salas Desktop 1440](/Users/sebastianpinzon/.gemini/antigravity/brain/ef69df6f-719c-4e80-a743-796379ae2822/screenshots/desktop_1440_3_salas_control.png)

#### Mediciones Computadas

| Elemento / Selector | Propiedad | Render Actual | DS-2026 Esperado | Delta | Severidad | Categoría |
|---|---|---:|---:|---:|---|---|
| Ubicación granja (`span`) | `font-size` | `8px` | `11px` | −3.0 px | **P0** | Violación DS Real |
| Botón "Ver registro completo →" | `font-size` | `9.5px` | `11px` | −1.5 px | **P0** | Violación DS Real |
| Telemetría label (`.live-telemetry-status__label`) | `font-size` | `9.5px` | `11px` | −1.5 px | **P0** | Violación DS Real |
| Lecturas climáticas (`.climate-module-readings small`) | `font-size` | `7.5px` (`--text-micro`) | `11px` mono | −3.5 px | **P0** | Violación DS Real |
| Sala card (`.clima-card`) | `border-radius` | `6px` | `0px` | +6 px | **P2** | Deuda técnica |
| Lectura numérica principal | `font-size` | `28px` mono | `24px` o `32px` | Conforme | — | Conforme |
| Contraste de estado de sala | `contrast` | `4.8:1` (`--moss`) | `≥4.5:1` | OK | — | Conforme |

---

### Superficie 4: Bodega / Inventario

> **Modo esperado:** `FIELD`  
> **Propósito:** Stock físico de insumos, control de humedad de pajas/salvados, alertas de stock mínimo.  
> **Regla DS-2026:** Panel sobrio, valores de inventario legibles a distancia de estante.

![Bodega Desktop 1440](/Users/sebastianpinzon/.gemini/antigravity/brain/ef69df6f-719c-4e80-a743-796379ae2822/screenshots/desktop_1440_4_bodega_inventario.png)

#### Mediciones Computadas

| Elemento / Selector | Propiedad | Render Actual | DS-2026 Esperado | Delta | Severidad | Categoría |
|---|---|---:|---:|---:|---|---|
| Stat label (`.inv-stat-lbl`) | `font-size` | **`8px`** | **`11px`** | **−3.0 px** | **P0** | **Violación DS Real** |
| Stat label (`.inv-stat-lbl`) | `letter-spacing` | `0.1em` | `0.15em` | −0.05em | **P1** | Violación DS Real |
| Stat value (`.inv-stat-val`) | `font-family` | `Gaya Patched` | `IBM Plex Mono` / Sans | Exceso Gaya | **P1** | Fuga ARCHIVE a FIELD |
| Stat value | `font-size` | `32px` (desktop) / `22px` (mob) | `24px`–`32px` | OK | — | Conforme |
| Subtabs Stock / Compra (`.inv-subtab`) | `font-size` | `10px` | `11px` o `13px` | −1.0 px | **P0** | Violación DS Real |
| Input de búsqueda (`.inv-search`) | `font-size` | `16px` | `16px` | 0 px | OK | Conforme móvil |
| Input de búsqueda | `min-height` | `44px` | `≥44px` | OK | — | Conforme |

---

### Superficie 5: Formular (Mesa de Formulación)

> **Modo esperado:** `FIELD con momentos analíticos`  
> **Propósito:** Ajuste de masa, balance C:N, humedad estimada, cálculo de bolsas e insumos.  
> **Regla DS-2026:** Inputs numéricos precisos, targets de 44–48 px, feedback instantáneo sin decoraciones superfluas.

![Formular Desktop 1440](/Users/sebastianpinzon/.gemini/antigravity/brain/ef69df6f-719c-4e80-a743-796379ae2822/screenshots/desktop_1440_5_formular.png)

#### Mediciones Computadas

| Elemento / Selector | Propiedad | Render Actual | DS-2026 Esperado | Delta | Severidad | Categoría |
|---|---|---:|---:|---:|---|---|
| Species select desktop (`#form-species-context-select`) | `font-size` | **`9.5px`** | **`13px`** / **`14px`** | **−3.5 px** | **P0** | **Violación DS Real** |
| Species select desktop | `height` | `38px` | `≥44px` | −6 px | **P1** | Violación DS Real |
| Species select móvil (`#form-mobile-species-select`) | `height` | `46px` | `≥44px` | +2 px | OK | Conforme móvil |
| Mode badge (`.formular-mode-badge`) | `font-size` | `8px` | `11px` | −3.0 px | **P0** | Violación DS Real |
| Subtexto especie (`small`) | `font-size` | `8px` | `11px` | −3.0 px | **P0** | Violación DS Real |
| Resumen de receta (`em`) | `font-size` | `8px` | `11px` | −3.0 px | **P0** | Violación DS Real |
| Metadata de insumo (`.ing-meta span`) | `font-size` | `11.5px` | `11px` mono | +0.5 px | OK | Conforme |
| Input de porcentaje (`.rec-pct-input`) | `font-size` | `13px` mono | `13px` mono | 0 px | OK | Conforme |
| Input de porcentaje | `height` | `42px` (desk) / `48px` (mob) | `≥44px` | −2 px desk | **P2** | Ajuste menor |
| Zonas de Gauges (`.gauge-zn`) | `background` | `linear-gradient(...)` | Regla o color plano | Incompatible | **P1** | Violación DS Real |

---

### Superficie 6: Perito (Análisis Experto y Escenarios)

> **Modo esperado:** `CONTROL`  
> **Propósito:** Evaluación de aptitud de receta, detección de cuellos de botella (N, C:N, coste) y aplicación de automejoras.  
> **Regla DS-2026:** Diagnóstico austero basado en evidencia, sin decoraciones de app contemporánea.

![Perito Desktop 1440](/Users/sebastianpinzon/.gemini/antigravity/brain/ef69df6f-719c-4e80-a743-796379ae2822/screenshots/desktop_1440_6_perito.png)

#### Mediciones Computadas

| Elemento / Selector | Propiedad | Render Actual | DS-2026 Esperado | Delta | Severidad | Categoría |
|---|---|---:|---:|---:|---|---|
| Header "Perito · Veredicto" | `font-size` | **`9.5px`** | **`11px` mono** | **−1.5 px** | **P0** | **Violación DS Real** |
| Provenance line (`.os-provenance-line`) | `font-size` | **`7px`** | **`11px` mono** | **−4.0 px** | **P0** | **Violación DS Real** |
| Summary key (`.form-summary-k`) | `font-size` | **`7px`** | **`11px` mono** | **−4.0 px** | **P0** | **Violación DS Real** |
| Botón de acción ("+ Crear prueba") | `height` | `28px` | `≥44px` | −16 px | **P1** | Violación DS Real |
| Botón de acción ("+ Crear prueba") | `font-size` | `9.5px` | `11px` | −1.5 px | **P0** | Violación DS Real |
| Bloque de críticos / advertencias | `background` | `rgba(197,48,48,.07)` | `var(--rust-tint)` | Incompatible | **P1** | Uso raw rgba |
| Bloque de opcionales | `background` | `rgba(74,107,74,.05)` | `var(--moss-tint)` | Incompatible | **P1** | Uso raw rgba |

---

## 4. Clasificación Tripartita de Hallazgos

### Categoría A: Violaciones DS Reales (Defectos visibles en pantalla)
1. **Microtipografía extrema:** 
   * `7 px`: `.form-summary-k`, `.os-provenance-line`, `span` de ruta de producción.
   * `8 px`: `.inv-stat-lbl`, `.formular-mode-badge`, `small` de combinar especies, subtítulo de ubicación en Tenjo.
   * `9.5 px`: Veredicto Perito, botones de acción en Perito, `select` de especie desktop, labels de telemetría.
   * `10 px`: Eyebrow de página, subtabs de inventario, pastilla de sincronización.
2. **Glass y Translucidez en herramientas de campo:**
   * `.workspace-subnav` con `backdrop-filter: blur(10px)`.
   * Headers sticky con `backdrop-filter: blur(12px) saturate(1.1)`.
3. **Gradientes artificiales:**
   * Sticky bottom bar en Sesión con `linear-gradient(to top, ...)`.
   * Gauges de formulación con `linear-gradient(to right, ...)`.
4. **Watermark invasivo (`.fos-bg-mountain`):**
   * Superpuesto en pantalla completa (`position: fixed`) en módulos FIELD donde degrada la nitidez de lectura.
5. **Affordances táctiles diminutas en pantalla:**
   * Botones con altura visual de 26–29 px (`.inv-btn-sm`, botones de acción de Perito, acciones de lote).

### Categoría B: Deuda Técnica sin Impacto Renderizado Inmediato
1. **La cascada invertida en el `<head>` del HTML:**
   * `ds-2026` cargado antes de `fieldos-tokens.css` y `sim.css`. En varios componentes funciona porque `sim.css` introduce reglas directas, pero rompe la predictibilidad del sistema.
2. **Redefinición redundante de tokens en `fieldos-tokens.css`:**
   * Variables `--paper`, `--ink`, `--t-label`, `--surface-*` redeclaradas cuando deberían emanar puramente de `ds-2026`.
3. **Uso de raw `rgba(...)` en componentes React:**
   * En vez de consumir los tokens normativos `--rust-tint`, `--warning-tint`, `--moss-tint`.

### Categoría C: Excepciones Visuales Legítimas
1. **Uso de `Gaya Patched` en títulos de especie:**
   * El nombre vernáculo y científico en specimen cards y cabeceras de batch es una voz de identidad de marca válida.
2. **Láminas del Catálogo & Recetario:**
   * El catálogo funciona correctamente como registro `ARCHIVE`, donde la riqueza editorial y las composiciones de lámina botánica son apropiadas.

---

## 5. Tabla Maestra de Severidades (P0 – P3)

| Prioridad | Área | Problema | Solución Quirúrgica |
|---|---|---|---|
| **P0** | **Cascada** | `ds-2026` carga antes que `fieldos-tokens.css` | Reordenar en `Setas OS v5.dc.html`: Base → Legacy → Compatibility Aliases → **DS-2026 Authority** → App overrides. |
| **P0** | **Tipografía** | 28 selectores con font-size < 11 px (7–10.5 px) | Normalizar escala en `sim.css`: `--text-micro: 11px`, `--text-2xs: 11px`, `--text-xs: 11px`, `--text-sm: 13px`. Mapear metadata a mono 11 px + 0.15em tracking. |
| **P1** | **Superficies** | `backdrop-filter: blur` en subnav y headers sticky | Eliminar blur; reemplazar por fondo sólido `var(--paper)` o `var(--paper-panel)` con borde `1px solid var(--rule)`. |
| **P1** | **Gradientes** | `linear-gradient` en barra sticky y gauges | Reemplazar por rellenos planos y reglas técnicas de 1 px / 2 px. |
| **P1** | **Identidad** | Watermark de Juaica activo en FIELD | Confinar `.fos-bg-mountain` a login, splash y ARCHIVE. Ocultar en `[data-mode="field"]`. |
| **P1** | **Semántica** | Exceso de `Gaya` en números operativos (Bodega) | Cambiar `.inv-stat-val` a `IBM Plex Mono` / Sans tabular para coherencia técnica. |
| **P2** | **Interacción** | Controles de 26–29 px de altura visible | Elevar altura visible mínima a `44 px` (y `48 px` preferido en sala). |
| **P2** | **Radios** | `border-radius: 6px` disperso en tarjetas operativas | Aplanar a `0px` o `2px` según la gramática de DS-2026. |
| **P3** | **Componentes** | Estilos inline repetidos en JSX | Migrar a contratos de componentes reutilizables `sdp-*` / `instr-*`. |

---

## 6. Lista Exacta de Selectores a Intervenir en Fase P0

### Archivo: `field-os-simulador/setas-os/sim.css`

```css
/* 1. Normalización de la escala base (líneas ~56-65) */
--text-micro: 11px;       /* ANTES: 7px */
--text-2xs:   11px;       /* ANTES: 8px */
--text-xs:    11px;       /* ANTES: 9.5px */
--text-sm:    13px;       /* ANTES: 11.5px */
--text-base:  14px;       /* ANTES: 13px */

/* 2. Selectores puntuales con microtexto hardcodeado */
.inv-stat-lbl                 /* ANTES: font-size: 8px  -> AHORA: var(--size-label, 11px) */
.page-title-eyebrow           /* ANTES: font-size: 10px -> AHORA: var(--size-label, 11px) */
.formular-mode-badge          /* ANTES: font-size: 8px  -> AHORA: var(--size-label, 11px) */
.form-summary-k               /* ANTES: font-size: 7px  -> AHORA: var(--size-label, 11px) */
.os-provenance-line           /* ANTES: font-size: 7px  -> AHORA: var(--size-label, 11px) */
.climate-module-readings small/* ANTES: font-size: 7.5px-> AHORA: var(--size-label, 11px) */
.live-telemetry-status        /* ANTES: font-size: 9.5px-> AHORA: var(--size-label, 11px) */
.inv-subtab                   /* ANTES: font-size: 10px -> AHORA: var(--size-label, 11px) */
```

### Archivo: `field-os-simulador/setas-os/Setas OS v5.dc.html`

```html
<!-- 1. Cascada canónica en <head> (líneas ~74-88) -->
<!-- Paso 1: Sustrato histórico -->
<link rel="stylesheet" href="_ds/.../styles.css">
<!-- Paso 2: Adaptador pasivo de compatibilidad (sin redefinir DS) -->
<link rel="stylesheet" href="fieldos-tokens.css">
<!-- Paso 3: Autoridad canónica DS-2026 -->
<link rel="stylesheet" href="ds-2026/tokens/tokens.css">
<link rel="stylesheet" href="ds-2026/components/base.css">
<link rel="stylesheet" href="ds-2026/components/components.css">
<link rel="stylesheet" href="ds-2026/components/editorial.css">
<link rel="stylesheet" href="ds-2026/components/instrument.css">
<!-- Paso 4: Estilos de aplicación saneados -->
<link rel="stylesheet" href="sim.css">

<!-- 2. Retiro de glass/blur y gradientes en markup dc.html -->
.workspace-subnav             /* Retirar backdrop-filter: blur(10px) */
Header sticky Sesión (l. 397) /* Retirar backdrop-filter: blur(12px) y color-mix translúcido */
Footer sticky Sesión (l. 495) /* Retirar linear-gradient, aplicar background: var(--paper) */
```

### Archivo: `field-os-simulador/setas-os/fieldos-tokens.css`
* Purgar redefiniciones globales de `--paper`, `--ink`, `--rule`, `--moss`, `--rust`, `--warning`, `--t-label`, `--t-body` para que funcionen únicamente como aliases pasivos hacia las variables maestras de `ds-2026/tokens/tokens.css`.

---

## 7. Verificación Post-P0

La ejecución de la Fase P0 se considerará exitosa cuando un nuevo pase del script forense verifique:
1. `microtext.length === 0` (0 elementos visibles con `fontSize < 11px`).
2. `glassOrGradients.length === 0` en todas las superficies FIELD y CONTROL.
3. El orden de la cascada respete `DS-2026` como árbitro final de tokens.
4. Las pruebas automatizadas del simulador (`node build.js && node --test build.test.js` y `npm test`) pasen al 100%.
