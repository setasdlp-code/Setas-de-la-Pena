# Setas de la Peña — Design System (legacy bundle → FOS alias bridge)

> **Superado.** Este export original (moss/coral, PP Object Sans, "hand-drawn everything") ya no es el sistema vigente. Fue reemplazado por completo por el **Field Operating System (FOS)**.
>
> - **Sistema vigente**: [`08_brand/field-os-identity/`](../../08_brand/field-os-identity) — tokens CSS reales, páginas de referencia (`guidelines/`), plantillas funcionales (`templates/`).
> - **Documentación legible**: [`design-system-documentation.md`](../../../design-system-documentation.md) (raíz del repo).
> - **Este folder hoy**: `design/colors_and_type.css` ya no define su propia paleta — es una **capa de alias** que importa los tokens FOS reales y traduce los nombres de variable antiguos (`--moss-700`, `--coral-500`, `--r-md`, `--shadow-card`, etc.) a sus equivalentes FOS, para que el HTML/CSS legado que aún los referencia (los simuladores de sustrato) siga funcionando sin tocar cada archivo uno por uno.

---

## Qué queda realmente en este folder

```
README.md              ← este archivo
design/
  colors_and_type.css   ← capa de alias hacia los tokens FOS (ver arriba)
  fonts/                ← copias de las tipografías de marca (Gaya, IBM Plex Sans/Mono)
styles.css              ← hoja auxiliar del export original
_ds_bundle.js           ← metadata del export original (Claude Design)
_ds_manifest.json       ← metadata del export original
_adherence.oxlintrc.json← config de lint del export original
```

Este README describía originalmente un kit mucho más grande (`preview/`, `ui_kits/website/`, `assets/products/`, etc.) que **nunca llegó a existir físicamente en este folder** — era la propuesta especulativa de un primer surface de marketing. Esa propuesta quedó descartada al adoptarse FOS como sistema único; no se documenta aquí para evitar confusión sobre qué existe realmente.

---

## Qué es FOS y por qué reemplazó a este bundle

FOS (**Field Operating System**) es el sistema de diseño único de Setas de la Peña — cubre tanto la operación de campo (fichas de lote, trazabilidad, dashboards) como la capa de cara al cliente (empaque, venta, mercado). A diferencia de este bundle original (cálido, ilustrado, con sombras y esquinas redondeadas, pensado como sitio de marketing especulativo), FOS es:

- **Funcional, no decorativo**: cada color es clasificación o estado, nunca un acento libre.
- **Plano**: sin sombras (`--shadow-none`), casi sin radio de esquina (2–3px).
- **Print-derived**: con mínimos tipográficos y de impresión normativos (código de lote ≥3mm de x-height, etc.).
- **Con componentes citables**: `FOS-01` a `FOS-06`, documentados en [`08_brand/field-os-identity/tokens/components.css`](../../08_brand/field-os-identity/tokens/components.css).

Detalle completo de la comparación y migración en [`design-system-documentation.md`](../../../design-system-documentation.md).

---

## Voz de marca — sigue vigente, sin cambios

A diferencia de lo visual, las reglas de contenido/voz de este README **siguen siendo correctas** y coinciden con [`brand-voice-guidelines.md`](../../../brand-voice-guidelines.md) y las reglas FOS-06.5 de cara al cliente:

- Primera persona del plural, tú (nunca usted).
- Sentence case siempre, nunca Title Case.
- Nombres científicos en itálica.
- Sin emoji, sin exclamaciones en cuerpo de texto.
- Titulares de 3–6 palabras; párrafos de 2–4 frases.

No se requiere ninguna migración en esta parte — es contenido, no CSS/tokens.

---

## Mapeo rápido de variables (para quien edite HTML legado)

| Variable antigua | Alias FOS actual |
|---|---|
| `--moss-700`, `--moss-900`, `--moss-500` | `--accent-olive` |
| `--coral-500`, `--coral-700` | `--accent-terracotta` |
| `--sand-*`, `--bark-*` | `--accent-mushroom` |
| `--slate-*` | `--accent-blue-grey` |
| `--ochre-*` | `--accent-terracotta` |
| `--paper-50/100/200/300` | `--paper-0/1/2/3` |
| `--ink-900/700/500/300` | `--ink-0/1/2/3` |
| `--r-md` (antes 14px), `--r-lg` (antes 22px) | `--radius-md` (3px) — FOS es casi plano |
| `--shadow-soft/card/lift/inset` | `--shadow-none` — FOS prohíbe sombras |
| `PP Object Sans` (`--font-body`) | `IBM Plex Sans Display` (`--font-sans`) |

Ver el mapeo completo en [`design/colors_and_type.css`](design/colors_and_type.css).

---

**Estado**: histórico + capa de compatibilidad activa. No agregar hex, sombras o radios nuevos aquí — añadir un alias que apunte a un token FOS existente en `08_brand/field-os-identity/tokens/`.
