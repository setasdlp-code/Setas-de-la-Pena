# Brand Guidelines v1.0 — Setas de la Peña

**Status:** Consolidated 2026-08-19 from scattered sources into one canonical doc. See **Provenance & Discrepancies** at the bottom before treating any single field as final — one section (Voice & Tone, Illustration) is carried over from an older concept doc and hasn't been re-confirmed against the current visual system.

## Quick Reference

- **Primary Color:** `#2E3B2F` (Moss 700 — wordmark green)
- **Secondary Color:** `#B8614D` (Coral 500 — terracotta accent)
- **Tertiary / Cool Neutral:** `#4E6A7A` (Slate 500)
- **Display Font:** Gaya Patched (headings, wordmark)
- **Body Font:** PP Object Sans
- **Mono Font:** JetBrains Mono
- **Voice:** sobrio (sober), honesto (honest), técnico sin ser frío (technical without being cold)

---

## 1. Color Palette

Source of truth: `_ds/.../design/colors_and_type.css`, "2026 board." Warm paper + ink + earth pigments — moss is primary, coral is secondary, sand/bark are warm neutrals, slate is the cool neutral.

### Paper (backgrounds)
| Name | Hex | Usage |
|------|-----|-------|
| Paper 50 | `#FCFBF6` | Lightest — highlights, inset cards |
| Paper 100 | `#F6F4EC` | Primary canvas / default page background |
| Paper 200 | `#EDE8DB` | Slightly darker cream, hover-on-paper |
| Paper 300 | `#DBD4C3` | Subtle dividers, deboss |

### Ink (text)
| Name | Hex | Usage |
|------|-----|-------|
| Ink 900 | `#1A1410` | Primary text & line work (warm near-black, never pure #000) |
| Ink 800 | `#2A2218` | Strong secondary text |
| Ink 700 | `#3A2F26` | Secondary text, oak shadow |
| Ink 600 | `#4A3F36` | Tertiary text, muted |
| Ink 500 | `#6B5B4A` | Tertiary text, captions |
| Ink 400 | `#8B7B6A` | Light text, disabled hints |
| Ink 300 | `#A89682` | Placeholder text, disabled |

### Moss — primary brand color (wordmark)
| Name | Hex | Usage |
|------|-----|-------|
| Moss 900 | `#1E2A16` | Deepest — display headings on cream |
| Moss 700 | `#2E3B2F` | Primary brand green — wordmark |
| Moss 500 | `#6D7C5A` | Secondary text, ground tone |
| Moss 300 | `#A0AE80` | Soft moss — borders, dividers |
| Moss 200 | `#CDD5B4` | Moss tint — "in season" freshness cue |

### Coral — secondary accent (mushroom cap / polypore)
| Name | Hex | Usage |
|------|-----|-------|
| Coral 700 | `#8B5243` | Hover, deeper terracotta |
| Coral 500 | `#B8614D` | Secondary accent — warm terracotta siena |
| Coral 300 | `#D4845A` | Soft coral |
| Coral 200 | `#E5C3B0` | Warm tint |

### Sand — warm neutral (oyster / lion's mane body)
| Name | Hex |
|------|-----|
| Sand 500 | `#BFA98B` |
| Sand 300 | `#D4C4AC` |
| Sand 200 | `#E7DCC9` |

### Bark — deep warm brown (stems, oak substrate)
| Name | Hex |
|------|-----|
| Bark 700 | `#594631` |
| Bark 500 | `#7A6248` |
| Bark 300 | `#A89178` |

### Slate — cool neutral (shadow, mountain stone)
| Name | Hex |
|------|-----|
| Slate 500 | `#4E6A7A` |
| Slate 300 | `#8AA0AC` |
| Slate 200 | `#C4D0D7` |

### Ochre — warning semantics + paper wash only (not a headline brand color)
| Name | Hex |
|------|-----|
| Ochre 700 | `#8A6312` |
| Ochre 500 | `#C68F2C` |
| Ochre 200 | `#ECD8A8` |

### Semantic feedback
- `--success` → Moss 500 `#6D7C5A`
- `--warning` → Ochre 500 `#C68F2C`
- `--danger` → Coral 700 `#8B5243`

### Semantic surfaces
| Token | Maps to |
|-------|---------|
| `--bg-page` | Paper 100 |
| `--bg-elevated` / `--bg-card` | Paper 50 |
| `--bg-sunken` | Paper 200 |
| `--bg-inverse` | Ink 900 |
| `--fg-primary` | Ink 900 |
| `--fg-secondary` | Ink 700 |
| `--fg-muted` | Ink 500 |
| `--fg-faint` | Ink 300 |
| `--accent` / `--accent-hover` / `--accent-tint` | Moss 700 / Moss 900 / Moss 200 |
| `--accent-2` / `--accent-2-hover` / `--accent-2-tint` | Coral 500 / Coral 700 / Coral 200 |

### Accessibility
- Body text (Ink 900 on Paper 100) is a warm near-black on warm near-white — high contrast, meets WCAG AA for body copy.
- Do not use Ochre as a headline brand color — it's reserved for warning semantics and the paper-texture wash only.
- Verify Moss 500 / Coral 500 text-on-tint combinations at small sizes before shipping (not yet audited numerically).

---

## 2. Typography

### Font Stack
```css
--font-display: "Gaya Patched", "Cooper Std", "DM Serif Display", Georgia, serif;
--font-body:    "PP Object Sans", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono:    "JetBrains Mono", "SF Mono", ui-monospace, monospace;
```
Font files live in `_ds/setas-de-la-pe-a-design-system-.../design/fonts/`: PP Object Sans (Regular/Slanted/Heavy/HeavySlanted), JetBrains Mono (variable, incl. italic), Gaya Patched (Regular/Italic).

### Type Scale
| Token | Weight/Size/Line-height | Family | Usage |
|-------|--------------------------|--------|-------|
| `--t-display-1` | 800 / 88px / 0.95 | display | Largest hero display |
| `--t-display-2` | 400 / 68px / 1.0 | display | Secondary hero display |
| `--t-h1` | 400 / 52px / 1.05 | display | Page H1 |
| `--t-h2` | 400 / 40px / 1.1 | display | Section H2 |
| `--t-h3` | 800 / 26px / 1.2 | body | H3 |
| `--t-h4` | 800 / 20px / 1.25 | body | H4 |
| `--t-lede` | 400 / 22px / 1.45 | body | Intro/lede paragraph |
| `--t-body` | 400 / 17px / 1.55 | body | Body copy |
| `--t-body-sm` | 400 / 15px / 1.5 | body | Small body |
| `--t-caption` | 400 / 13px / 1.45 | body | Captions |
| `--t-eyebrow` | 800 / 12px / 1.0 | body | Uppercase, tracking +0.18em |
| `--t-label` | 800 / 14px / 1.2 | body | Form/UI labels |
| `--t-button` | 800 / 15px / 1.0 | body | Buttons, tracking +0.02em |
| `--t-quote` | 400 italic / 28px / 1.35 | display | Pull quotes |

---

## 3. Spacing, Radii & Shadow

### Spacing scale
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128px` (`--space-1` … `--space-10`)

### Radii
`--r-xs 4px · --r-sm 8px · --r-md 14px · --r-lg 22px · --r-pill 999px`

### Shadows — soft, like printed ink-bleed
- `--shadow-soft`, `--shadow-card`, `--shadow-lift`, `--shadow-inset` — all built from `color-mix(in oklab, var(--ink-900) N%, transparent)`, never flat black. See `colors_and_type.css` for exact values.

### Paper texture (opt-in via `.paper` class)
Warm radial gradients (ochre + coral tints) plus a fine SVG fractal-noise overlay, applied only where the "printed paper" feel is wanted — not the default surface treatment.

---

## 4. Logo Usage

**Not yet re-confirmed against the current (moss/coral) palette.** The last documented logo normativa (April 2026, see discrepancies below) specified:
- `Setas de la Peña - Logo Burnt Dark Red.png` for technical/operational materials (recipes, protocols, prototypes, workflows, automation).
- `Setas de la Peña - Logo Color.png` for everything else.
- A later revision instead specified a single `Setas de la Peña - Monochrome Cobre.png`, aligned left or centered-top, generous safe margins, no color/proportion changes.

Given the palette has since moved to moss/coral/sand/bark/slate, **confirm which logo file(s) are current** before using either rule as-is. Known asset locations on this machine:
- `~/Documents/SETAS de la PEÑA/Logo Setas de la Peña/`
- `~/Downloads/setasdelapena_icon_v2_peña-hongo.svg`

### General rules (carried forward, still applicable)
- Don't rotate, skew, recolor outside the approved palette, add drop shadows/gradients, or crop/distort proportions.
- Maintain clear space ≥ the height of the logo mark.

---

## 5. Voice & Tone

*(Carried over from the April 2026 concept doc — content/voice guidance, not visual — likely still valid but not re-confirmed in this pass.)*

**Brand personality:** sobriedad y honestidad (sobriety and honesty). Elegance comes from precision of craft and absence of noise, not decoration.

| Trait | We Are | We Are Not |
|-------|--------|------------|
| Sobrio (sober) | Precise, restrained, quiet confidence | Loud, ornamental, hyped |
| Técnico (technical) | Exact like a lab label or botanical manual | Cold, jargon-heavy, inaccessible |
| Honesto (honest) | Direct about process and product | Vague, marketing-speak |

### Prohibited
- Decorative borders, stamps/seals, distressed/worn textures, or purely-filler illustration — if an element doesn't serve an informational or identity function, cut it.

---

## 6. Imagery Guidelines

*(Also carried over from the April concept doc — confirm against current work before treating as final.)*

### Illustration style: technical line drawing
- Pure, consistent line weight; volume comes from contour precision, not dense shading. If shading is needed, use fine stippling or widely-spaced parallel lines — never dense hatching.
- Should read like a scientific/botanical study: exact, elegant, undramatic.
- Illustrations do not fill the frame — negative space around them is the focal device, not empty leftover space.

### Negative space as a design material
- At least 30% of any surface should remain visually clean/unornamented.
- Text follows a strict central axis or block alignment suggesting order and technical care.

---

## Provenance & Discrepancies

This doc was consolidated from three sources that don't fully agree, found on this machine on 2026-08-19:

1. **`colors_and_type.css`** (`_ds/setas-de-la-pe-a-design-system-2b03b4d8-.../design/`, last modified 2026-06-28) — "2026 board." Full moss/coral/sand/bark/slate/ink/paper palette, PP Object Sans + Gaya Patched + JetBrains Mono, full type/spacing/radius/shadow scale. **Treated as canonical here** — it's the newest, most complete, and is the actual design system referenced by the live app (`Setas OS v5.dc.html` / `sim.css`).
2. **`Guía de Diseño y Estilo Visual_ Setas de la Peña.md`** (`~/Downloads/`, dated 2026-04-09) — "Minimalismo de Montaña" / "Mística Rural de Precisión" concept: different fonts (Della Respira + Montserrat), a 4-color palette (`#872e0f #565028 #6F8A8D #5A2E1C`), and specific logo-file rules. **Superseded on color/type** by the CSS system above — a full month older and doesn't match what's shipped. Its voice/tone and illustration-style guidance (Sections 5–6 above) don't conflict with the newer palette, so they're carried forward provisionally.
3. **`Guía de Diseño y Estilo Visual_ Setas de la Peña 2.txt`** (same folder, 2026-04-09, a few minutes newer than #2) — a revision of #2: single primary color `#993f23` instead of 4, single monochrome-copper logo file instead of two, 40% negative-space minimum instead of 30%, "at least two illustrations per infographic" removed. Still pre-dates and conflicts with the CSS system on color.

**Not consulted in this pass** (blocked by a macOS file-permission error on `~/Documents/Claude/Projects/Setas de la Peña/` mid-session — reading pre-existing files in that directory started failing with `Operation not permitted` partway through, even though creating *new* files there, like this one, still worked): `AGENTS.md` in this repo, and the Brand Book PDFs under `~/Documents/SETAS de la PEÑA/` (also permission-blocked). Worth re-reading once that access is restored — they may resolve the logo-file and voice/tone questions above definitively. If you hit the same "Operation not permitted" error again, it's likely a stale per-folder access grant (System Settings → Privacy & Security → Files and Folders) that needs re-approving for this terminal/app.

**Recommended next step:** confirm Sections 4–6 (logo file, voice/tone, imagery) against the Brand Book PDF once that folder is readable again, then bump this to v1.1.

---

## Appendix: Machine-Readable Summary

*(Duplicates data already in Sections 1–5 above, in the exact heading/table shape `scripts/inject-brand-context.cjs` and `scripts/sync-brand-to-tokens.cjs` scan for. Keep this in sync if the sections above change — it's a compatibility shim for this skill's generic tooling, not a second source of truth.)*

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Moss 700 | #2E3B2F | rgb(46,59,47) | Primary brand color — wordmark, headings, buttons |

### Secondary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Coral 500 | #B8614D | rgb(184,97,77) | Secondary accent — mushroom cap / polypore |

### Neutral Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Paper 100 | #F6F4EC | rgb(246,244,236) | Page background |
| Ink 900 | #1A1410 | rgb(26,20,16) | Primary text |
| Slate 500 | #4E6A7A | rgb(78,106,122) | Cool-neutral accent |

### Font Stack
```css
--font-heading: 'Gaya Patched', serif;
--font-body: 'PP Object Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Brand Personality
| Trait | Description |
|-------|-------------|
| **Sobrio** | Precise, restrained, quiet confidence — not loud or ornamental |
| **Técnico** | Exact like a lab label or botanical manual — not cold or jargon-heavy |
| **Honesto** | Direct about process and product — not vague or marketing-speak |

### Prohibited
| Term/Element | Reason |
|------|--------|
| Decorative borders, stamps/seals | Ornament without informational function — cut it |
| Distressed/worn textures | Not part of the current (2026-06) visual system |
| Purely-filler illustration | Every element must serve identity or information |
