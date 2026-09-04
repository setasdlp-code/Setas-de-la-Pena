# Setas de la Peña · DS-2026

A standalone design system for Setas de la Peña — field operations and
customer-facing surfaces on one set of tokens.

**Start here:** [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — foundations, grid,
imagery, metadata grammar, components, compositions, mockups, sources.
Per-component detail is in [`components/COMPONENTS.md`](components/COMPONENTS.md).
References are in [`SOURCES.md`](SOURCES.md).

> ⚠️ **This is not FOS.** `08_brand/field-os-identity/` is a separate, independently
> audited system in this repo. DS-2026 does not import or replace it, and the two
> stylesheets **must not be loaded on the same surface** — both define
> `--paper-*`, `--ink-*` and `--space-*`. See `DESIGN_SYSTEM.md` §10.

## Use it

```html
<link rel="stylesheet" href="tokens/tokens.css">      <!-- pulls in fonts.css -->
<link rel="stylesheet" href="components/base.css">
<link rel="stylesheet" href="components/components.css">

<body data-mode="field">                              <!-- archive | field | control -->
  <div class="grid">
    <article class="sdp-lote sdp-lote--ok col-3">…</article>
  </div>
</body>
```

Everything is CSS custom properties and plain classes — no build step, no
framework, no runtime. Fonts are vendored: it works offline.

## The short version of the rules

| | |
|---|---|
| **Type** | Gaya Patched = species & titles · IBM Plex Sans = prose · IBM Plex Mono = metadata (uppercase, tracked ≥ 0.15em) |
| **Colour** | 8 roles. Colour is classification or state, never decoration. One accent per view. |
| **Ochre** | `WARNING #C49A4C` is 2.39:1 — fills and bars only, never text. Use `WARNING_TEXT #8C6B2E` for ochre text. |
| **Space** | 8px baseline. `--space-half` (4px) is the only exception. |
| **Grid** | 12 columns always; density is a `data-mode`, not another grid. |
| **Depth** | No shadows. Frames and rules only. |
| **Imagery** | Biological imagery is evidence: frame + image + caption, or it doesn't ship. |
| **Status** | Colour **and** word. Never colour alone. |
| **Minimums** | Prose ≥ 16px · operative content ≥ 13px · tap target ≥ 44px · printed lot code ≥ 3mm x-height |

## Rebuild

```bash
python3 scripts/validate.py          # structural gate — tokens, fonts, assets, parity
python3 scripts/contrast-audit.py    # WCAG gate — must exit 0 (22/22)
node     scripts/render.mjs          # eight mockups → mockups/out/*.png
```

All three are CI-ready. `validate.py` catches an undefined token, a missing
font file, a broken asset path, or colours drifting between `colors.json` and
`tokens.css`. `contrast-audit.py` fails the build if a sanctioned colour
pair drops below its ratio **or** if a banned pair starts passing (which would
mean the palette moved and the ban went stale). `render.mjs` fails if any brand
font silently falls back.

Other generators — all deterministic, all re-runnable:

| Script | Output |
|---|---|
| `scripts/gen-hericium.py` | `assets/img/hericium-erinaceus-plate.svg` — seeded botanical plate |
| `scripts/gen-textures.py` | `assets/textures/*.png` — tileable paper grain, no image library |
| `scripts/make-cutout.mjs` | `assets/img/*-engraving.png` — scan → transparent PNG |

## Fonts

| Family | Files | Source |
|---|---|---|
| Gaya Patched | 12 (Thin/Light/Regular/Medium/Bold/Black + italics) | vendored from `field-os-identity/` + the legacy `_ds` export |
| IBM Plex Sans | 5 (300–700) | vendored from `field-os-identity/fonts/` |
| IBM Plex Mono | 3 (400/500/600) | fetched from the IBM/plex repository during setup |

Gaya Patched is proprietary to the brand. IBM Plex is SIL OFL 1.1.
