---
title: Setas de la Peña — Design System Documentation (FOS)
document_id: DOC-0119
category: brand
load_priority: selective
last_reviewed: 2026-09-04
confidence: high
---

# Setas de la Peña — Design System Documentation

**Sistema vigente: Field Operating System (FOS) — Arquitectura de Doble Capa.** Este documento reemplaza por completo la versión anterior (moss/coral, PP Object Sans, esquinas redondeadas, sombras). FOS es ahora la única fuente de verdad para color, tipografía, geometría y componentes, articulado en dos capas funcionales que comparten el mismo rigor biológico y territorial:

1. **FOS Core (Operación de Campo y Laboratorio):** Diseñado para la realidad física del cultivo en Tenjo (2.600 msnm). Plano (`radius-none`), de alto contraste, sin sombras y con mínimos táctiles normativos (48px) para operarios con guantes en salas de inoculación/fructificación y bajo deslumbramiento solar. Gobierna fichas de lote, bitácoras, autoclave, telemetría y dashboards operativos.
2. **FOS Editorial (Capa de Cliente / Mesa, Mercado y Gastronomía):** Extensión editorial que traslada el rigor científico y la trazabilidad andina al lenguaje de la alta cocina, las publicaciones gastronómicas de referencia y la venta especializada. Gobierna fichas de cata para chefs, empaque kraft táctil, venta mayorista, retail gourmet y el pasaporte digital de origen vía QR.

Fuente canónica: [`08_brand/field-os-identity/`](08_brand/field-os-identity) — tokens CSS reales, páginas de referencia HTML (`guidelines/`) y plantillas funcionales (`templates/`). Este documento es un resumen legible; ante cualquier discrepancia, los archivos `tokens/*.css` mandan.

---

## Design Tokens

### Color palette

Filosofía: **cada color es funcional (clasificación o estado), nunca decorativo.** No hay color "de marca" libre para acentuar a discreción.

#### Paper (fondo)
| Token | Hex | Rol |
|-------|-----|------|
| `paper-0` | #F7F4EC | Fondo de página |
| `paper-1` | #EFEBE0 | Panel / sección |
| `paper-2` | #E5DFD0 | Franja de tabla, campo recesado |
| `paper-3` | #DCD5C2 | Recesado fuerte / presionado |

#### Ink (texto y trazo)
| Token | Hex | Rol |
|-------|-----|------|
| `ink-0` | #1E1D19 | Texto primario, casi negro cálido |
| `ink-1` | #3C392F | Texto secundario |
| `ink-2` | #6B6759 | Terciario, captions, metadata |
| `ink-3` | #96907C | Deshabilitado / placeholder |

#### Line (reglas y bordes)
| Token | Hex | Rol |
|-------|-----|------|
| `line-0` | #988C6C | Hairline por defecto — auditado 2026: oscurecido desde #C9C1A9 (1.64:1) para cumplir el piso WCAG 1.4.11 de 3:1 no-texto (ahora 3.03:1) |
| `line-1` | #8C7F5B | Borde de tabla, subrayado activo — oscurecido desde #A69E86 (2.43:1) a 3.6:1; se mantiene `line-1` > `line-0` |
| `line-2` | #1E1D19 | Divisor de sección, borde de impresión |

**Nota de accesibilidad (`ink-3`)**: #96907C da 2.90:1 sobre `paper-0`, por debajo del WCAG 4.5:1. Auditado 2026 y aceptable únicamente porque todo uso actual (`.fos-annot__blank`, placeholder de `.fos-market__img`, guías de llenado manual en fichas) es contenido no esencial/placeholder, nunca información que el usuario deba leer. Si un nuevo uso lleva información requerida, no reusar `ink-3` — usar `ink-2`.

#### Accents — Operación (clasificación y estado funcional)
| Token | Hex | Hover/pressed | Uso |
|-------|-----|-----|-----|
| `accent-olive` | #5B6B44 | #4A5737 | Activo / positivo |
| `accent-terracotta` | #A85C32 | #894B29 | Atención |
| `accent-blue-grey` | #5E7080 | #4D5B68 | Informativo, enlaces |
| `accent-mushroom` | #7A6A52 | #645643 | Archivado |
| `accent-rust` | #8C3223 | #72291C | **Reservado exclusivamente para error / contaminación** |

Cada accent operativo tiene su variante `-dim` (tinte suave para fondos/chips) y su variante `-hover` (FOS-09, auditado 2026: ~18% más oscuro, mismo pigmento — sin tonos nuevos, sin degradados — para estados hover/pressed de cualquier control interactivo construido sobre un fill de accent).

**Regla de contraste sobre fill sólido (FOS-07, auditado 2026)**: sobre un fill sólido de accent, texto o logo deben usar `paper-0`, nunca `ink-0` (`ink-0` sobre `accent-olive` = 2.92:1, falla WCAG incluso en texto grande; `paper-0` sobre `accent-olive` = 5.26:1, pasa).

#### Accents — Capa Editorial y Terroir Gastronómico (FOS Editorial)
Pigmentos de acento destinados a superficies de cara al cliente (empaque, fichas de cata para chefs, pasaporte digital y hojas de venta mayorista). **Prohibido su uso en interfaces de control de cultivo**, donde los estados funcionales de máquina no admiten ambigüedad.

| Token | Hex | Rol Gastronómico | Aplicación de Cara al Cliente |
|-------|-----|------------------|-------------------------------|
| `accent-forest-moss` | #2D3D24 | Musgo de bosque andino de niebla | Sello de marca primario, origen geográfico en Tenjo, sello botánico |
| `accent-tenjo-terracotta` | #A44C27 | Arcilla mineral de la Sabana | Altitud (2.600 msnm), hora de corte matutina, notas de tostado |
| `accent-shiitake-umber` | #4F4339 | Umbra terrosa de sustrato maduro | Notas organolépticas, densidad cárnica, perfil de umami profundo |
| `accent-spore-blush` | #D99C8D | Rosa tenue de espora (*P. djamor*) | Destacados de cosecha estacional, maridajes delicados |
| `paper-linen` | #ECE6D8 | Fibra de lino crudo / cardstock | Fondos recesados en empaque, tarjetas sensoriales, fajillas |

**Regla de separación de color (FOS-08)**: En pantallas operativas (telemetría, autoclave, cuartos fríos), rigen exclusivamente los accents funcionales (`accent-rust` reservado para contaminación/error). En la capa editorial de cliente, rige la paleta botánica y gastronómica sin degradados artificiales ni brillos sintéticos.

### Semantic aliases
- `surface-page` / `surface-panel` / `surface-recessed` / `surface-pressed` → escala paper
- `text-primary` / `text-secondary` / `text-metadata` / `text-disabled` → escala ink
- `border-hairline` / `border-strong` / `border-heavy` → escala line
- `status-active` / `status-attention` / `status-info` / `status-archived` / `status-error` → accents + su `-dim` como fondo
- `link` = `accent-blue-grey`, `link-hover` = `ink-0`
- `focus-ring` = `accent-olive`

**Regla (FOS)**: sin gradientes, sin degradados. Pigmento plano únicamente.

---

## Typography

### Familias

| Familia | Uso | Pesos |
|---------|-----|-------|
| **Gaya Patched** | Display, títulos | 100–900, con itálicas |
| **IBM Plex Sans Display** | Cuerpo, UI, labels (reemplaza a PP Object Sans) | 300–700 |
| **IBM Plex Mono** | Códigos de lote, datos tabulares, metadata técnica | 400/500/600, vía Google Fonts CDN |

```css
--font-sans: 'Gaya Patched', 'Helvetica Neue', Arial, sans-serif;
--font-display: 'IBM Plex Sans Display', 'Gaya Patched', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Consolas, monospace;
```

### Escala tipográfica

| Token | Tamaño | Rol |
|-------|--------|-----|
| `text-2xs` | 10.5px | Nota fina, estilo legal |
| `text-xs` | 11.5px | Metadata, captions, headers de tabla |
| `text-sm` | 13px | Cuerpo de tabla densa, UI secundaria |
| `text-base` | 14.5px | Labels/valores de campo, UI compacta |
| `text-prose` | 16px | **Piso normativo** — prosa, guías, párrafos de documento |
| `text-md` | 16px | Cuerpo enfatizado, labels de formulario de laboratorio |
| `text-lg` | 19px | Encabezados de sección |
| `text-xl` | 24px | Encabezados de página |
| `text-2xl` | 32px | Título de documento |
| `text-3xl` | 44px | Título de portada / división únicamente |

### Mínimos normativos (FOS-04) — no negociables
- **Prosa** (documentos, guías, párrafos): nunca por debajo de 16px, pantalla o impresión.
- **Label/valor de ficha**: 14.5px, leading 1.45, solo fragmentos cortos.
- **Tabla densa**: 13px, leading ≥1.6, solo escritorio — nunca en impreso de campo.
- **Código de lote impreso**: x-height ≥ 3mm.
- **Pictograma impreso**: mínimo 8mm; en pantalla, mínimo 16px.
- Por debajo de 13px no hay contenido operativo — solo metadata.

### Reglas de voz tipográfica (heredadas, siguen vigentes)
- Sentence case siempre — títulos, labels, botones. Nunca Title Case.
- Nombres científicos siempre en *itálica*.
- Sin signos de exclamación en cuerpo de texto.

### Jerarquía y emparejamiento editorial (FOS Editorial)

Para materiales de cara al cliente (dossiers de chefs, empaque, pasaporte digital y monografías), las tres familias normativas se emparejan con cadencia editorial:

| Rol | Familia | Tratamiento | Función |
|---|---|---|---|
| **Masthead / Títulos** | **Gaya Patched Display** | Sentence case o mayúsculas con espaciado amplio, peso 500–700 | Porte clásico, alto contraste visual, solemnidad botánica |
| **Especie / Sensorial** | **Gaya Patched Italic** | Siempre en *itálica*, espaciado natural | Nombres científicos (*L. edodes*, *H. erinaceus*) y notas de cata |
| **Cuerpo / Prosa** | **IBM Plex Sans Display** | 16px mínimo (`text-prose`), leading 1.5–1.6 | Guías de cocción, historia de origen, notas del recolector |
| **Terroir / Provenance** | **IBM Plex Mono** | 11–13px, tracking amplio (`0.06em`) | Altitud (`2.600 msnm`), hora de cosecha (`06:15 AM`), lote en QR |

---

## Spacing & Layout

### Escala de espaciado (base 4px)
`space-1` 4px · `space-2` 8px · `space-3` 12px · `space-4` 16px · `space-5` 24px · `space-6` 32px · `space-7` 48px · `space-8` 64px · `space-9` 96px

### Ritmo de documento
- `gutter`: 24px
- `page-margin`: 48px
- `column-gap`: 24px

---

## Geometría — cambio de filosofía respecto a versiones anteriores

**Cero decoración.** Sin sombras, sin glassmorphism, casi sin esquinas redondeadas.

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-none` | 0px | Default |
| `radius-sm` | 2px | Solo tags, inputs |
| `radius-md` | 3px | Raro — controles pequeños |
| `shadow-none` | none | **Todos los componentes** |
| `rule-hairline` | 1px solid `border-hairline` | — |
| `rule-strong` | 1px solid `border-strong` | — |
| `rule-heavy` | 2px solid `border-heavy` | Divisores de sección, bordes de impresión |
| `focus-outline` | 2px solid `focus-ring` | — |

Geometría específica de campo (FOS-01/02/03):
- `field-cell-min-height`: 48px (objetivo de escritura a mano en fichas impresas)
- `field-print-margin`: 10mm (inset físico de etiqueta)
- `pictogram-grid` / `pictogram-safe` / `pictogram-stroke`: 48 / 36 / 3

**Reglas duras heredadas de la versión anterior que ya NO aplican**: border-radius 12–14px, sombras "paper resting on itself", nav con `backdrop-filter: blur(12px)`. Cualquier CSS que aún use estos valores debe migrarse.

### Materialidad física y empaque editorial (FOS Editorial)

En piezas impresas y empaques de cara al cliente, la ausencia de ornamentos digitales se traduce en calidad táctil de materiales reales:

- **Sustrato principal:** Cartón kraft rígido sin blanquear, fibra virgen o reciclada con certificación FSC (mínimo 350 g/m²).
- **Tratamiento del logo en empaque:** Golpe seco / bajo relieve ciego (`blind deboss`, sin tinta ni foil brillante) estampado en la tapa de cartón.
- **Fajilla perimetral (`.fos-sleeve`):** Papel vegetal o papel de lino sin laminar (`paper-canvas` / `paper-linen`) impreso a 1 tinta plana al agua (forest-moss o soot-ink).
- **Sellado de frescura:** Tira de papel perforado con sello fechador manual (hora y fecha de corte matutino).

---

## Componentes normativos (FOS-EXT-001)

Clases CSS reales en [`08_brand/field-os-identity/tokens/components.css`](08_brand/field-os-identity/tokens/components.css). Citar como `FOS-0n.m` en cualquier SOP.

| Componente | Clase | Uso |
|---|---|---|
| **FOS-01 · Bloque de identidad de lote** | `.fos-lot` (+ `--tray`, `--bulk`) | Código de lote en mono, tabular-nums. Sin sombra, sin radio, nunca lleva color de acento. |
| **FOS-02 · Ficha de campo** | `.fos-ficha`, `.fos-field`, `.fos-annot` | Grid de campos con altura mínima táctil (48px), líneas de anotación manuscritas. Mínimo dos líneas de anotación vacías; las fichas nunca se recopian. |
| **FOS-03 · Pictogramas** | `.fos-pic` (+ `--lg`) | Monocromo `ink-0`, stroke 3, sin relleno. Un acento puede acompañar al glifo, nunca ir dentro de él. |
| **FOS-05 · Estado como texto** | `.fos-status` (+ `--active/--attention/--info/--archived/--error`) | **Prohibido**: badges rellenos, redondeados o con sombra; degradados; rust fuera de error/contaminación; más de un acento por vista. |
| **FOS-06 · Capa de cliente (FOS Editorial)** | `.fos-market` (+ `.fos-dossier`, `.fos-passport`, `.fos-sleeve`) | Mismos tokens, voz más cálida, **sin códigos operativos visibles**. La foto o el QR van dentro de `.fos-market__img`; nunca un pictograma (que es un glifo operativo). |

### Reglas de superficie cliente vs. operación (FOS-06.1)
Lote, sala u operador **nunca** se exponen en la vista de cliente — el puente es el QR (`market-qr-bridge.html`).

### Componentes de la extensión FOS Editorial (FOS-06.6 a FOS-06.8)

#### FOS-06.6 · The Chef Tasting Dossier (`.fos-dossier`)
Ficha técnica gastronómica orientada a cocinas profesionales, chefs y brigadas de servicio:
- **Matriz organoléptica:** Diagrama radar o barras de 4 ejes: densidad cárnica, nivel de umami, retención de humedad al saltear y aroma en crudo.
- **Comportamiento térmico:** Instrucción técnica de cocción (ej. "dorar en seco a fuego medio-alto antes de incorporar grasa; no salar hasta sellar para conservar turgencia celular").
- **Maridajes de terroir:** Combinaciones sugeridas con ingredientes andinos y clásicos (mantequilla avellanada, tomillo limonero, panela reducida, ajo negro).

#### FOS-06.7 · The Terroir & Provenance Passport (`.fos-passport`)
Superficie web responsiva que se abre al escanear el QR del empaque o menú:
- **Cabezal de terroir:** Silueta vectorial minimalista de la Peña de Juaica (Tenjo, Cundinamarca · 2.600 msnm).
- **Métricas de cosecha:** "Cortadas hoy a las 06:15 AM · 0 aditivos químicos · Sustrato orgánico certificado".
- **Ilustración botánica:** Grabado botánico de alta definición del espécimen cosechado (estilo naturalista DOC-0039).

#### FOS-06.8 · Tactile Packaging Sleeve (`.fos-sleeve`)
Fajilla perimetral de empaque para cajas de 250g, 500g y 1kg:
- Ventana de papel glassine translúcido vegetal (cero plástico de un solo uso).
- Identificación de especie con nombre común en gran formato y nombre binomial en *Gaya Patched Italic*.
- Sello de papel perforado con lote codificado en QR y fecha/hora estampada a mano.

---

## Plantillas funcionales

Documentos operativos completos y listos para usar, en [`08_brand/field-os-identity/templates/`](08_brand/field-os-identity/templates):
- **`ficha-de-lote/`** — ficha de trazabilidad de lote de cultivo
- **`hoja-de-mercado/`** — hoja de venta / mercado
- **`panorama-general-v3/`** — dashboard general, con versión de impresión (`-print.html`)

---

## Logo

- **Uso**: solo la marca tipográfica provista; sin variantes de color, sin recomposición.
- **Espacio de seguridad**: altura de la "a" minúscula alrededor de todo el logo.
- **Prohibido**: estirar, rotar, añadir sombra.
- **Variantes disponibles**: sobre papel (`paper-0`) y sobre olive (`accent-olive`) — ver [`guidelines/brand-logo.html`](08_brand/field-os-identity/guidelines/brand-logo.html).

---

## Iconografía

Reemplaza el sistema Lucide anterior: **pictogramas propios FOS-03** (ver componentes arriba), monocromos, construidos sobre grid de 48 con stroke 3. No se usan íconos de librería externa ni emoji ni glifos Unicode.

---

## Voz de marca al cliente (FOS-06.5)

Compatible con y complementario a [`brand-voice-guidelines.md`](brand-voice-guidelines.md) — no lo reemplaza, lo especifica para la capa de venta:

1. **Nombre común primero** — "Seta ostra", nunca el nombre científico como titular.
2. **Frescura con hecho, no adjetivo** — "Cortada esta mañana" ✓ · "Ultra fresca" ✗.
3. **Cocina, no ficha técnica** — uso concreto de cocina, nunca temperatura/HR/sustrato.
4. **Códigos solo en el QR** — el lote nunca se imprime como texto visible.
5. **Primera persona del plural** — "nuestros túneles", personas concretas, no marca abstracta.
6. **Precio sin disculpas** — cifra grande en mono, sin "solo"/"oferta"/tachados.

**Prueba del eslogan (FOS-06.4)**: si una frase serviría para cualquier marca en una valla publicitaria, se reescribe con un dato real de esta finca.

---

## Migración pendiente

Archivos que aún referencian el sistema anterior (moss/coral/PP Object Sans) directamente, sin pasar por capa de alias, y deben migrarse a tokens FOS:

- `simulador_sustrato_v4.0.html`, `simulador_sustrato_v4_OFFLINE.html`, `simulador_sustrato_offline.html`
- `recipe-sim-v2.css`

**Ya migrado / con capa puente**: `field_os/20_product_design/PROTOTYPES/field-os-simulador-app/fieldos-tokens.css` ya actúa como capa de alias (nombres antiguos → tokens FOS reales) — usar este archivo como referencia de mapeo al migrar los archivos de arriba.

---

## Implementation notes

### Code handoff
1. Cargar `08_brand/field-os-identity/tokens/*.css` (colors, typography, spacing, structure, fonts, components) antes de cualquier CSS de aplicación.
2. No definir hex, sombras o radios nuevos fuera de los tokens — si falta algo, añadir un alias que apunte a un token FOS existente.
3. Los pictogramas se construyen sobre el grid de 48 (`pictogram-grid`/`pictogram-safe`/`pictogram-stroke`), no se importan de una librería externa.

### Para partners y proveedores
- **Empaque**: compartir capa `.fos-market` / `.fos-sleeve` + regla FOS-06.1 (sin códigos operativos visibles al cliente, ventana de glassine vegetal sin plástico, sustrato kraft FSC sin blanquear, bajo relieve ciego).
- **Fotografía**: mismo criterio anterior — grano cálido, profundidad de campo corta, superficies de madera/kraft/lino, luz natural rasante, contexto gastronómico real.
- **Contenido y Restaurantes Aliados**: compartir las 6 reglas de voz FOS-06.5 + regla de "sin exclamaciones" + especificación del dossier gastronómico FOS-06.6.

---

**Document version**: v2.0 — FOS · 2026
**Reemplaza**: v1.0 (moss/coral/PP Object Sans), 2026-06-08
**Fuente canónica**: [`08_brand/field-os-identity/`](08_brand/field-os-identity)
**Status**: Living. Ante discrepancia, los `tokens/*.css` mandan sobre este resumen.
