# Setas de la Peña · DS-2026

A standalone design system for Setas de la Peña — field operations and
customer-facing surfaces on one set of tokens.

**Start here:** [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — foundations, grid,
imagery, metadata grammar, components, compositions, mockups, sources.
Per-component detail is in [`components/COMPONENTS.md`](components/COMPONENTS.md).
References are in [`SOURCES.md`](SOURCES.md).
The product architecture and content-provenance contract are in
[`PROFILES.md`](PROFILES.md).

> `08_brand/field-os-identity/` preserves the earlier FOS identity. Setas OS is
> the explicit compatibility surface: it loads legacy FOS first, DS-2026 second,
> then maps legacy spacing to `--fos-space-*` in `fieldos-tokens.css`. New or
> migrated UI uses the packaged DS-2026 core and its Operations profile. Other
> surfaces must not mix both systems without an explicit adapter. See §10.

## Use it

```html
<link rel="stylesheet" href="tokens/tokens.css">      <!-- pulls in fonts.css -->
<link rel="stylesheet" href="components/base.css">
<link rel="stylesheet" href="components/components.css">

<body data-mode="field">              <!-- archive | field | control | culinary-market -->
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
| **Type** | Gaya Patched = species & titles · IBM Plex Sans = prose · IBM Plex Mono = data and metadata. Labels are uppercase/tracked; measurements are not. |
| **Colour** | 8 roles. One identity accent per composition; semantic status colours may coexist when they carry real state. |
| **Ochre** | `WARNING #C49A4C` is 2.39:1 — fills and bars only, never text. Use `WARNING_TEXT #826326` for ochre text. |
| **Space** | 8px composition baseline. `--space-half` (4px) and documented internal optical corrections are allowed. |
| **Grid** | Page compositions align to a 12-column macro-grid; components may use local grids. |
| **Depth** | No shadows. Frames and rules only. |
| **Imagery** | Every image declares its role: documentary, illustrative, reconstruction or reference. |
| **Status** | Operational state and data provenance are independent. Colour **and** word; never colour alone. |
| **Minimums** | Prose ≥ 16px · operative content ≥ 13px · tap target ≥ 44px · printed lot code ≥ 3mm x-height |

## Rebuild

```bash
python3 scripts/validate.py          # structural gate — tokens, fonts, assets, parity
python3 scripts/contrast-audit.py    # WCAG gate — must exit 0 (25/25)
node     scripts/render.mjs          # ten mockups → mockups/out/*.png
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
| `scripts/gen-textures.py` | `assets/textures/*.png` — tileable paper grain, no image library |
| `scripts/make-cutout.mjs` | `assets/img/species/*.png` — studio ground → transparent PNG, by edge flood fill |

## Fonts

| Family | Files | Source |
|---|---|---|
| Gaya Patched | 12 (Thin/Light/Regular/Medium/Bold/Black + italics) | vendored from `field-os-identity/` + the legacy `_ds` export |
| IBM Plex Sans | 5 (300–700) | vendored from `field-os-identity/fonts/` |
| IBM Plex Mono | 3 (400/500/600) | fetched from the IBM/plex repository during setup |

Gaya Patched is proprietary to the brand. IBM Plex is SIL OFL 1.1.
