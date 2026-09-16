---
title: Setas de la Peña — Design System Documentation (FOS Core + FOS Editorial)
document_id: DOC-0119
category: brand
load_priority: selective
last_reviewed: 2026-09-05
confidence: high
---

# Setas de la Peña — Design System Documentation (FOS Core + FOS Editorial)

**Sistema vigente: Field Operating System (FOS v3.0).** Este documento es la norma técnica unificada para la identidad visual, tipográfica, cromática y de empaque de Setas de la Peña en Tenjo, Cundinamarca (2.592 msnm).

FOS opera bajo una **arquitectura bimodal integrada**:
1. **FOS Core (Capa Operativa de Campo):** Software de producción (Setas OS), formularios de captura táctil, telemetría ambiental, tablas de sustratos y cuadernos de laboratorio. Alta densidad, cero sombras, contraste estricto y bordes de 1px de tinta cálida.
2. **FOS Editorial (Capa de Marca, Cliente y Gastronomía):** Publicaciones de terroir, dossiers para chefs de alta cocina, pasaportes digitales de trazabilidad, empaques táctiles en cartón kraft FSC y monografías botánicas. Fusión entre el grabado científico del siglo XIX (herencia de la expedición de Mutis y los tratados micológicos de Giacomo Bresadola) y la tipografía suiza.

Fuente canónica: [`08_brand/field-os-identity/`](08_brand/field-os-identity) y [`docs/brand/DESIGN_SYSTEM_CANONICAL.md`](docs/brand/DESIGN_SYSTEM_CANONICAL.md).

---

## 1. Design Tokens & Arquitectura Cromática

El sistema utiliza Custom Properties en la escala **Paper**, **Ink**, **Line**, **Accents Funcionales** (campo) y **Pigmentos Botánicos** (cliente/empaque).

### 1.1. Escala Paper (superficie pergamino / celulosa)

| Token | Hex | Rol Operativo | Rol Editorial / Cliente |
|-------|-----|---------------|-------------------------|
| `paper-0` | `#F7F4EC` | Fondo de página / lienzo base | Papel de lino crudo desaturado |
| `paper-1` | `#EFEBE0` | Panel / sección agrupada | Tarjeta sensorial / recuadros |
| `paper-2` | `#E5DFD0` | Fila de tabla / recesado | Cardstock de empaque / fajas |
| `paper-3` | `#DCD5C2` | Estado presionado / activo | Fondos hundidos / separadores |

### 1.2. Escala Ink (tinta cálida de carbón)

| Token | Hex | Rol Operativo | Rol Editorial / Cliente |
|-------|-----|---------------|-------------------------|
| `ink-0` | `#1E1D19` | Texto primario / títulos | Tinta negra de hachurado |
| `ink-1` | `#3C392F` | Texto secundario / labels | Descripciones y notas de cata |
| `ink-2` | `#6B6759` | Captions / metadata de lote | Metadatos de cosecha y terroir |
| `ink-3` | `#96907C` | Guías de llenado manual (solamente) | Filas secundarias / anotaciones |

### 1.3. Escala Line (filetes y reglas)

| Token | Hex | Rol | Piso WCAG 1.4.11 |
|-------|-----|-----|------------------|
| `line-0` | `#988C6C` | Hairline por defecto (1px solid) | 3.03:1 sobre `paper-0` (Cumple no-texto 3:1) |
| `line-1` | `#8C7F5B` | Borde estructural / tabla activa | 3.60:1 sobre `paper-0` |
| `line-2` | `#1E1D19` | Divisor de sección / marco de cartela | 12.80:1 sobre `paper-0` |

### 1.4. Accents Funcionales (Operación de Campo — FOS Core)

| Token | Hex | Hover / Active | Aplicación Exclusiva |
|-------|-----|----------------|----------------------|
| `accent-olive` | `#5B6B44` | `#4A5737` | Estado activo / parámetros de laboratorio en rango óptimo |
| `accent-terracotta` | `#A85C32` | `#894B29` | Atención requerida / cierres institucionales |
| `accent-blue-grey` | `#5E7080` | `#4D5B68` | Telemetría / lecturas de sensores fríos / enlaces |
| `accent-mushroom` | `#7A6A52` | `#645643` | Sustratos / estados archivados / registros históricos |
| `accent-rust` | `#8C3223` | `#72291C` | **Reservado exclusivamente para error biológico o contaminación** |

### 1.5. Pigmentos Botánicos & Terroir (Capa de Cliente — FOS Editorial)

| Token | Hex | Referencia Botánica / Terroir | Aplicación Editorial / Gastronómica |
|-------|-----|-------------------------------|-------------------------------------|
| `accent-forest-moss` | `#2D3D24` | Musgo de bosque andino de niebla | Sello de marca primario, origen Tenjo, sello botánico |
| `accent-tenjo-terracotta` | `#A44C27` | Arcilla mineral de la Peña de Juaica | Altitud (2.592 msnm), hora de corte, notas de tostado |
| `accent-shiitake-umber` | `#4F4339` | Umbra terrosa de sustrato maduro | Densidad cárnica, perfil de umami profundo, maridajes |
| `accent-spore-blush` | `#D99C8D` | Rosa tenue de espora (*P. djamor*) | Destacados de cosecha estacional, notas florales |
| `accent-ochre-ray` | `#8A6312` | Ocre solar de espora madura | Sellos de certificación orgánicos, notas de cata doradas |
| `paper-linen` | `#ECE6D8` | Lino crudo / fibra de algodón | Superficie de dossiers para chefs y pasaportes |

**Regla de separación de color (FOS-08)**: En pantallas operativas (telemetría, autoclave, cuartos fríos), rigen exclusivamente los accents funcionales. En la capa editorial de cliente, rige la paleta botánica y gastronómica sin degradados artificiales ni brillos sintéticos.

---

## 2. Sistema Tipográfico Bimodal & Jerarquía Gaya Patched

La tipografía fusiona el rigor taxonómico de los tratados de botánica con la pureza funcional de la escuela suiza.

### 2.1. Familias Normativas

| Familia | Identificador CSS | Rol Principal |
|---------|-------------------|---------------|
| **Gaya Patched** | `'Gaya Patched'`, `'GayaPatched'`, Georgia, serif | **Display Identidad**: Títulos de vista, marcas de empaque, monografías, dossiers de cata |
| **IBM Plex Sans Display** | `'IBM Plex Sans Display'`, `'IBM Plex Sans'`, sans-serif | **Cuerpo & UI**: Prosa de manuales, botones, labels de formulario, guías de cocción |
| **IBM Plex Mono** | `'IBM Plex Mono'`, ui-monospace, monospace | **Datos & Terroir**: Códigos de lote (SDP-..), telemetría, altitud (2.592 msnm), tablas nutricionales |

### 2.2. Espectro Tipográfico Multi-Peso (Gaya Patched Editorial)

| Rol Editorial | Gaya Patched Style | Peso / Estilo | Aplicación Típica |
|---------------|--------------------|---------------|-------------------|
| **Masthead / Titular Principal** | `Black 900` | 900 Normal | Portadas de documentos, cabezales de dossier |
| **Acento de Masthead** | `Black Italic 900` | 900 Italica | Énfasis de una frase corta dentro del titular |
| **Encabezado de Sección** | `Bold 700` | 700 Normal | Secciones principales, totales clave |
| **Subtítulo / Especie** | `Medium 500` | 500 Normal | Nombres comunes de especie, subsecciones |
| **Nombre Científico / Sensorial** | `Medium Italic 500` | 500 Italica | Taxonomía binomial (*Pleurotus ostreatus*), notas organolépticas |
| **Nota Editorial Silenciosa** | `Light 300` | 300 Normal | Transiciones de texto, epígrafes, intro de dossier |
| **Coda / Pie Editorial** | `Light Italic 300` | 300 Italica | Cita de recolector, nota de finca |
| **Exhibición Fina Decosección** | `Thin 100` / `Thin Italic 100` | 100 Normal / Italica | Uso decorativo de gran formato en publicaciones impresas |

```css
/* Declaración Canónica CSS */
--font-display: 'Gaya Patched', 'GayaPatched', Georgia, serif;
--font-body: 'IBM Plex Sans Display', 'IBM Plex Sans', sans-serif;
--font-mono: 'IBM Plex Mono', monospace;
```

### 2.3. Escala Tipográfica & Mínimos Normativos (FOS-04)

- **Prosa / Guías de Cocción**: Mínimo 16px (`text-prose`), leading 1.5–1.6. Nunca por debajo de 16px en pantalla o impreso.
- **Labels / Valores de Ficha**: 14.5px, leading 1.45, fragmentos cortos.
- **Tabla Densa Tabular**: 13px, leading ≥1.6, solo en escritorio.
- **Metadata de Terroir (Plex Mono)**: 11px–13px, tracking amplio (`0.06em`).
- **Regla de Caja**: Sentence case siempre en títulos y botones. Nombres científicos siempre en *itálica*. Cero signos de exclamación.

---

## 3. Geometría, Espaciado y Materialidad Física

### 3.1. Ritmo & Espaciado (Base 4px)

- **Escala de Espaciado**: `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-5` (24px), `space-6` (32px), `space-7` (48px), `space-8` (64px), `space-9` (96px).
- **Margen de Página Impresa / PDF**: 48px / inset táctil de 10mm en etiquetas.
- **Altura Mínima Táctil**: 48px para cualquier campo o botón interactivo (`field-cell-min-height: 48px`).

### 3.2. Geometría Plana (Cero Sombras Cosméticas)

- `radius-none`: 0px (Default para paneles, cartas y contenedores).
- `radius-sm`: 2px (Tags y campos de entrada).
- `shadow-none`: `none` (Todos los componentes operativos y editoriales).
- `rule-hairline`: `1px solid var(--line-0)`
- `rule-strong`: `1px solid var(--line-1)`
- `rule-heavy`: `2px solid var(--line-2)` (Divisores principales y bordes de cartela).

### 3.3. Materialidad Física & Empaque Editorial (FOS Editorial)

En piezas impresas y empaques para alta cocina, la ausencia de ornamentos digitales se traduce en calidad táctil de materiales físicos reales:

- **Sustrato Principal:** Cartón kraft rígido sin blanquear, fibra virgen o reciclada con certificación FSC (mínimo 350 g/m²).
- **Tratamiento del Logo:** Golpe seco / bajo relieve ciego (`blind deboss`, sin tinta ni foil brillante) estampado en la tapa.
- **Fajilla Perimetral (`.fos-sleeve`):** Papel de lino vegetal sin laminar (`paper-linen`) impreso a 1 tinta plana al agua (forest-moss o soot-ink).
- **Ventana de Exhibición:** Papel glassine translúcido vegetal (100% libre de plásticos de un solo uso).
- **Sellado de Frescura:** Tira de papel perforado con sello fechador manual (hora y fecha de corte matutino a mano).

---

## 4. Ilustración Botánica Científica (Estilo Mutis & Bresadola)

- **Estilo Exclusivo:** Grabados botánicos científicos del siglo XIX (xilografía / calcografía con hachurado fino de línea limpia).
- **Inspiración Histórica:** Dibujos botánicos de la Real Expedición de José Celestino Mutis y los tratados micológicos de Giacomo Bresadola (*Iconographia Mycologica*).
- **Técnica:** Trazo negro de tinta pura sobre papel pergamino, sin rellenos planos de color sintético, sin tramas sintéticas densas.
- **Prohibición Absoluta:** Prohibido el uso de fotografías de stock comerciales, vectores clip-art planos, renders 3D o ilustraciones kawaii/cartoon. La identidad es 100% científica y botánica.

---

## 5. Componentes Normativos y Extensión FOS Editorial

Clases CSS en [`08_brand/field-os-identity/tokens/components.css`](08_brand/field-os-identity/tokens/components.css) y [`08_brand/ds-2026/components/editorial.css`](08_brand/ds-2026/components/editorial.css).

### 5.1. Componentes FOS Core (Operación)

| Código | Clase Principal | Descripción y Regla |
|--------|-----------------|---------------------|
| **FOS-01** | `.fos-lot` | Bloque de código de lote en monoespaciada tabular (`SDP-2026-..`). Sin acentos de color. |
| **FOS-02** | `.fos-ficha` | Ficha de campo con celdas de 48px y líneas de anotación manual. |
| **FOS-03** | `.fos-pic` | Pictogramas propios monocromáticos en grid de 48 con stroke de 3px. Cero librerías externas. |
| **FOS-05** | `.fos-status` | Indicadores de estado en texto con acentos funcionales. Prohibidos badges redondeados o rellenos. |

### 5.2. Componentes FOS Editorial (Cliente, Chefs & Terroir)

#### FOS-06.6 · The Chef Tasting Dossier (`.fos-dossier`)
Ficha técnica gastronómica para restaurantes de alta cocina y brigadas de servicio:
- **Matriz Organoléptica:** Diagrama de 4 ejes: densidad cárnica, nivel de umami, retención de humedad al saltear y aroma en crudo.
- **Comportamiento Térmico:** Instrucciones técnicas de sellado y reacción Maillard.
- **Maridajes de Terroir:** Combinaciones con mantequilla avellanada, tomillo limonero, panela reducida y ajo negro.

#### FOS-06.7 · The Terroir & Provenance Passport (`.fos-passport`)
Superficie web responsiva accesible vía QR en empaque o menú:
- **Cabezal Geográfico:** Silueta vectorial minimalista de la Peña de Juaica (2.592 msnm).
- **Métricas de Cosecha:** Hora exacta de corte matutino (ej: `06:15 AM`), sustrato certificado y 0 aditivos.
- **Ilustración Botánica:** Grabado botánico de alta resolución de la especie cosechada.

#### FOS-06.8 · Tactile Packaging Sleeve (`.fos-sleeve`)
Fajilla de empaque para presentaciones de 250g, 500g y 1kg:
- Ventana de papel glassine vegetal translúcido.
- Nombre de especie en gran formato (*Gaya Patched Black*) y binomial en *Gaya Patched Medium Italic*.
- Sello de papel perforado con código QR y fecha/hora estampada a mano.

#### FOS-06.9 · Botanical Monograph Spine (`.fos-monograph`)
Monografía botánica desplegable de una sola especie:
- Taxonomía completa, notas históricas de cultivo en Tenjo, balance de masa de sustrato y sugerencias de conservación profesional.

---

## 6. Prompt Canónico para Prototipado (Claude Design / ChatGPT)

Para generar presentaciones o interfaces editoriales con el sistema completo, utilizar este prompt consolidado:

```markdown
Crea una publicación / presentación de alta gama sobre Setas de la Peña (cultivo de precisión en Tenjo, Cundinamarca, 2.592 msnm).

SISTEMA VISUAL OBLIGATORIO (FOS v3.0 Editorial):
- Paleta: Terracota #A44C27, Musgo de Bosque #2D3D24, Umbra #4F4339, Lino #ECE6D8, Tinta #1E1D19.
- Tipografía: Títulos en Gaya Patched (Serif humanista), cuerpo en IBM Plex Sans (min 16px, Sentence case), datos/lote en IBM Plex Mono.
- Ilustración: Grabado botánico científico del siglo XIX (hachurado fino en tinta, Mutis & Bresadola). Prohibidas fotos de stock o renders 3D.
- Composición: 30%+ espacio negativo, bordes limpios de 1px de tinta cálida, cero gradientes sintéticos, cero sombras flotantes.
- Voz: Técnico-agronómica, sobria, precisa, cálida, sin exclamaciones ni misticismo vacíos.
```

---

**Document version**: v3.0 — FOS Core + FOS Editorial · 2026
**Fuente canónica**: [`08_brand/field-os-identity/`](08_brand/field-os-identity) y [`docs/brand/DESIGN_SYSTEM_CANONICAL.md`](docs/brand/DESIGN_SYSTEM_CANONICAL.md)
**Status**: Living.
