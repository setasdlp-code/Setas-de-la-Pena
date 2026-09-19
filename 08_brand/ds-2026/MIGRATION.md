# Guía de migración: DS-2026 v1 → DS-2026 · Criterio edition

**Estado:** Canónico
**Fecha:** Septiembre 2026
**Objetivo:** Evolución in-situ del sistema de diseño unificado preservando compatibilidad retroactiva con Setas OS (`field-os-simulador/setas-os/`).

---

## 1. Resumen de cambios estructurales

| Área | DS-2026 Initial Edition (v1) | DS-2026 · Criterio Edition | Razón / Beneficio |
|---|---|---|---|
| **Paleta Base** | Papel `#FAF5E9`, Ink `#222222`, Moss `#4E6B3F`, Rust `#8E2C14` | Paper 100 `#F6F4EC`, Paper 50 `#FCFBF6`, Ink 900 `#1A1410`, Moss 700 `#2E3B2F`, Coral 500 `#B8614D`, Coral 700 `#8A3E2D`, Slate 500 `#4E6A7A` | Alineación con la paleta de pigmentos minerales auditada y contraste verificado. |
| **Coral Taxonomy** | Tratado como `--accent-warm` oklch informal en modo archive | Separado en Primitives (`coral-500` / `coral-700`) y Semantics (`--brand-accent` / `--brand-accent-text`) | `coral-500` da 3.93:1 sobre Paper 100 (falla AA para texto normal). `coral-700` (`#8A3E2D`) supera 4.5:1 para texto accesible. |
| **Token `micro`** | `9px` general | `micro-screen = 11px`, `micro-print = 9px` | Evita texto ilegible en pantallas y cumple WCAG en interfaces de campo. |
| **Compilación de Tokens** | Edición manual simultánea de JSON y CSS | Compilador automatizado `scripts/build-tokens.mjs` | Elimina fuentes de divergencia (drift) entre JSON y CSS. |
| **Distribución a Setas OS** | Copias no sincronizadas | `scripts/sync-consumers.mjs` con gate CI | `08_brand/ds-2026/` es la única fuente de verdad; Setas OS es un paquete distribuido. |
| **Componentes** | Archivos planos monolíticos (`base.css`, `components.css`, etc.) | Arquitectura modular (`core/`, `shared/`, `operations/`, `market/`) con fachadas legacy | Mejor mantenibilidad sin romper rutas existentes. |
| **Entrypoints Públicos** | Rutas internas directas | `index.css`, `operations.css`, `market.css` | Consumo limpio desacoplado de la estructura interna. |
| **Hero Species** | Centrado en Reishi | Shiitake (*Lentinula edodes*) y Melena de León (*Hericium erinaceus*) como hero assets | Representa la dualidad gastronómica y funcional de Tenjo. Componentes agnósticos de especie. |

---

## 2. Fachadas legacy de compatibilidad (`stable legacy entrypoints`)

Para evitar rupturas en `Setas OS` y en componentes existentes, los siguientes archivos se mantienen en `components/` como fachadas de importación:

1. `components/base.css` → importa `core/foundations.css` y `core/layout.css`.
2. `components/components.css` → importa `shared/*.css` y `market/*.css`.
3. `components/editorial.css` → importa `market/archive.css` y estilos editoriales.
4. `components/instrument.css` → importa `operations/*.css` y telemetría de campo.

Los consumidores pueden seguir apuntando a estas rutas sin cambios inmediatos.

---

## 3. Mapeo de tokens v1 → Criterio

### 3.1 Colores y superficies

| Token v1 | Equivalente Canónico Criterio | Valor Hex Criterio | Nota de Compatibilidad |
|---|---|---|---|
| `--paper` | `--paper-100` / `--surface-page` | `#F6F4EC` | `--paper` se preserva como alias |
| `--paper-panel` | `--paper-50` / `--surface-panel` | `#FCFBF6` | `--paper-panel` se preserva como alias |
| `--paper-recessed` | `--paper-200` / `--surface-recessed` | `#EDE8DB` | `--paper-recessed` se preserva como alias |
| `--ink` | `--ink-900` / `--text-primary` | `#1A1410` | `--ink` se preserva como alias |
| `--ink-muted` | `--ink-500` / `--text-secondary` | `#6B5B4A` | `--ink-muted` se preserva como alias |
| `--rule` | `--border-hairline` / `--ink-500` | `#888888` / regla | `--rule` se preserva como alias |
| `--soil` | `--bark-700` / `--surface-inverse` | `#594631` | `--soil` se preserva como alias |
| `--moss` | `--moss-700` / `--brand-primary` / `--status-ok` | `#2E3B2F` | `--moss` se preserva como alias |
| `--rust` | `--coral-700` / `--status-error` | `#8A3E2D` | `--rust` se preserva como alias |
| `--warning` | `--warning` (primitive) | `#C49A4C` | Se mantiene restricción: solo fills, no texto |
| `--accent-warm` | `--brand-accent` (`--coral-500`) | `#B8614D` | Fills y reglas. Para texto usar `--brand-accent-text` (`--coral-700`) |

### 3.2 Tipografía

| Token v1 | Equivalente Criterio | Valor | Regla |
|---|---|---|---|
| `--size-micro: 9px` | `--size-micro-screen: 11px`<br>`--size-micro-print: 9px` | 11px pantalla<br>9px impresión | `--size-micro` resuelve a 11px por defecto en pantalla |
| `--size-label: 11px` | `--size-label: 11px` | 11px | Requiere tracking `≥ 0.15em` |
| `--size-data: 13px` | `--size-data: 13px` | 13px | Monospace tabular |
| `--size-body: 16px` | `--size-body: 16px` | 16px | Piso normativo de prosa |

---

## 4. Instrucciones para consumidores (Setas OS)

1. **Sincronización:** Ejecutar `node scripts/sync-consumers.mjs` tras cualquier cambio canónico.
2. **Nuevos desarrollos:** Importar `index.css` y `operations.css` en lugar de rutas internas.
3. **Validación:** Correr `node --test ds-2026-sync.test.js` en `field-os-simulador/setas-os/`.
