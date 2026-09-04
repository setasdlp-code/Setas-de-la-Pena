# Setas de la Peña · DS-2026

A design system for a mushroom farm at 2.600 m in Tenjo, Cundinamarca — one
system covering the field (lot records, substrate recipes, room signage, SOPs)
and the shelf (packaging, fichas, market cards).

**Governing idea:** every mark on the page is either evidence or navigation.
Colour is classification or state. Imagery is documentation. Type carries the
difference between what a person reads, what a person acts on, and what a
machine emitted. Nothing is decoration.

> **Relationship to FOS.** This is a **standalone** system. The repo also
> contains `08_brand/field-os-identity/` (the Field Operating System), which is
> a different, independently audited system with its own palette and rules.
> DS-2026 does not import from it, alias it, or replace it — the two are kept
> apart deliberately. See [§10](#10-relationship-to-fos) before mixing them.

---

## 1 · Foundations

### 1.1 Typefaces

Three families, three jobs. A face used outside its job is a bug.

| Family | Role | Where it appears | Stack |
|---|---|---|---|
| **Gaya Patched** | Editorial / species | Common names, latin binomials, titles, packaging, signage | `'Gaya Patched', 'Iowan Old Style', Georgia, serif` |
| **IBM Plex Sans** | Body / UI | Prose, descriptions, navigation, button labels | `'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif` |
| **IBM Plex Mono** | Field metadata | Lot codes, taxon codes, coordinates, telemetry, table headers | `'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace` |

All faces are **vendored** in `assets/fonts/` — no CDN. A field tablet at 2.600 m
with no signal must render the system identically to a desktop.

Gaya Patched ships the full family: Thin (100), Light (300), Regular (400),
Medium (500), Bold (700), Black (900), each with a matching italic.

**Mono is always uppercase and always tracked ≥ 0.15em.** Untracked uppercase
mono is unreadable at 9–11px; the tracking is not a stylistic preference.

### 1.2 Type scale

`DISPLAY 01` (64px Gaya Black) down to `MICRO` (9px Mono). Nine roles.

| Role | Size | Family | Weight | Leading | Tracking | Case | Use |
|---|---|---|---|---|---|---|---|
| `display-01` | 64px | Gaya Patched | 900 Black | 0.98 | −0.02em | — | Cover titles, packaging front, poster. One per surface. |
| `display-02` | 44px | Gaya Patched | 700 Bold | 1.10 | −0.02em | — | Section openers, signage room name. |
| `heading-01` | 32px | Gaya Patched | 500 Medium | 1.10 | −0.01em | — | Document title, dashboard masthead. |
| `heading-02` | 24px | Gaya Patched | 500 Medium | 1.10 | −0.01em | — | Card and panel titles. |
| `heading-03` | 19px | IBM Plex Sans | 600 SemiBold | 1.30 | 0 | — | Sub-headings in prose and SOP steps. |
| `species` | 28px | Gaya Patched | 700 Bold | 1.10 | −0.01em | — | Common name — *Reishi*, *Melena de león*. |
| `latin` | 18px | Gaya Patched | 400 *Italic* | 1.30 | 0 | — | Binomial — *Ganoderma lucidum*. Always italic, always sentence case. |
| `body` | 16px | IBM Plex Sans | 400 Regular | 1.55 | 0 | — | Prose floor. Never lower, screen or print. |
| `small` | 14px | IBM Plex Sans | 400 Regular | 1.55 | 0 | — | Captions, secondary UI, dense card copy. |
| `data` | 13px | IBM Plex Mono | 400 Regular | 1.40 | 0 | — | Table numbers, telemetry, measurements. Tabular figures. |
| `label` | 11px | IBM Plex Mono | 500 Medium | 1.10 | **0.15em** | UPPER | Field keys, table headers, taxon codes, lot lines. |
| `micro` | 9px | IBM Plex Mono | 400 Regular | 1.10 | **0.18em** | UPPER | Plate refs, folio marks, fine print. Never operative content. |

**Normative minimums**

- Prose never below **16px**, screen or print.
- Below **13px** there is no operative content — metadata only.
- Printed lot code: **x-height ≥ 3mm**.

### 1.3 Colour

Eight pigment roles. Each is a job.

| Token | Hex | Role |
|---|---|---|
| `PAPER` | `#FAF5E9` | Warm ivory. Every page ground, every printed substrate. |
| `INK` | `#222222` | Charcoal. Primary text, heavy rules, pictogram stroke. |
| `INK_MUTED` | `#555555` | Warm gray. Secondary text, captions, metadata values. |
| `RULE` | `#888888` | Mineral gray. Hairlines, specimen frames, table borders. |
| `SOIL` | `#4A3C31` | Dark earth. Infill blocks, inverted panels, signage ground. |
| `MOSS` | `#4E6B3F` | Restrained forest green. OK / active / in-spec. |
| `RUST` | `#8E2C14` | Oxidised red-brown. **Error and contamination only.** |
| `WARNING` | `#C49A4C` | Muted ochre. Caution. **Non-text use only** — see 1.4. |

Derived surfaces — mixed from the eight above, introducing no new pigment:

| Token | Hex | Derivation |
|---|---|---|
| `PAPER_PANEL` | `#F3EEE2` | paper + 4 % soil — panels, table stripe |
| `PAPER_RECESSED` | `#EAE4D8` | paper + 9 % soil — wells, image placeholders |
| `MOSS_TINT` | `#E5E4D5` | 12 % moss on paper — OK banner ground |
| `RUST_TINT` | `#EDDDCF` | 12 % rust on paper — error banner ground |
| `WARNING_TINT` | `#F4EAD6` | 12 % warning on paper — caution banner ground |
| `SOIL_TINT` | `#E5DFD3` | 12 % soil on paper — neutral infill |
| `WARNING_TEXT` | `#8C6B2E` | warning at hue 39°, same saturation, darkened to 36.5 % lightness |

**One accent per view.** A dashboard showing moss, ochre and rust at once has
stopped classifying and started decorating.

### 1.4 Contrast audit — the ochre constraint

`WARNING #C49A4C` measures **2.39:1** on `PAPER`. That fails WCAG AA for text
(4.5:1) *and* the non-text floor (3:1). The value is kept as specified, and its
**usage is constrained instead**:

- ✅ ochre as a **solid fill or bar**, with `INK` on top → 6.12:1
- ✅ ochre as the **4px leading rule** of a caution banner, text in `INK` on `WARNING_TINT` → 13.32:1
- ❌ ochre as **text** on paper or on its own tint
- ❌ ochre as a **lone hairline or meter** carrying meaning with no ink alongside

Where ochre itself must be the text colour, use `WARNING_TEXT #8C6B2E` — same
hue and saturation, darkened until it clears AA at **4.53:1**.

`scripts/contrast-audit.py` asserts all of this and **exits non-zero if any
expectation breaks**, including the bans (a forbidden pair that starts passing
means the palette moved and the ban is stale). Run it in CI.

| Foreground | Background | Purpose | Needs | Ratio | Rule |
|---|---|---|---|---|---|
| `INK` | `PAPER` | Body, headings, species names | 4.5:1 | 14.62:1 | Sanctioned |
| `INK` | `PAPER_PANEL` | Text on panels | 4.5:1 | 13.74:1 | Sanctioned |
| `INK` | `PAPER_RECESSED` | Text in recessed wells | 4.5:1 | 12.57:1 | Sanctioned |
| `INK_MUTED` | `PAPER` | Captions, metadata values | 4.5:1 | 6.85:1 | Sanctioned |
| `INK_MUTED` | `PAPER_PANEL` | Metadata on panels | 4.5:1 | 6.44:1 | Sanctioned |
| `MOSS` | `PAPER` | OK status text | 4.5:1 | 5.52:1 | Sanctioned |
| `MOSS` | `MOSS_TINT` | OK text on OK banner | 4.5:1 | 4.68:1 | Sanctioned |
| `RUST` | `PAPER` | Error status text | 4.5:1 | 7.66:1 | Sanctioned |
| `RUST` | `RUST_TINT` | Error text on error banner | 4.5:1 | 6.29:1 | Sanctioned |
| `SOIL` | `PAPER` | Infill label text | 4.5:1 | 9.74:1 | Sanctioned |
| `PAPER` | `SOIL` | Inverse text on soil block (signage) | 4.5:1 | 9.74:1 | Sanctioned |
| `PAPER` | `MOSS` | Text on solid moss fill | 4.5:1 | 5.52:1 | Sanctioned |
| `PAPER` | `RUST` | Text on solid rust fill | 4.5:1 | 7.66:1 | Sanctioned |
| `INK` | `WARNING` | Text on solid ochre fill | 4.5:1 | 6.12:1 | Sanctioned |
| `WARNING_TEXT` | `PAPER` | Caution text (sanctioned ochre) | 4.5:1 | 4.53:1 | Sanctioned |
| `INK` | `WARNING_TINT` | Caution banner text (sanctioned) | 4.5:1 | 13.32:1 | Sanctioned |
| `RULE` | `PAPER` | Hairlines, specimen frames (non-text) | 3.0:1 | 3.26:1 | Sanctioned |
| `MOSS` | `PAPER` | Meter fill (non-text) | 3.0:1 | 5.52:1 | Sanctioned |
| `WARNING` | `PAPER` | Ochre as TEXT — use WARNING_TEXT | 4.5:1 | 2.39:1 | **Banned** |
| `WARNING` | `WARNING_TINT` | Ochre text on its own tint — use INK | 4.5:1 | 2.18:1 | **Banned** |
| `PAPER` | `WARNING` | Paper on ochre fill — use INK | 4.5:1 | 2.39:1 | **Banned** |
| `WARNING` | `PAPER` | Ochre hairline/meter alone — needs INK | 3.0:1 | 2.39:1 | **Banned** |

22/22 expectations hold

---

## 2 · Grid & spacing

### 2.1 Spacing

An **8px** baseline. Every gap, pad and offset is a multiple.

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--space-half` | 4px | | `--space-5` | 40px |
| `--space-1` | 8px | | `--space-6` | 48px |
| `--space-2` | 16px | | `--space-7` | 64px |
| `--space-3` | 24px | | `--space-8` | 80px |
| `--space-4` | 32px | | `--space-9` | 96px |

`--space-half` (4px) is the **single** sub-8 exception, for optical alignment
against a 1px hairline. There is no 2px, no 6px, no 10px.

### 2.2 The 12-column grid and its three modes

Twelve columns everywhere. **Density is a mode, not a new grid.** Set
`data-mode` on any container and the gutter and page margin follow.

| Mode | Gutter | Page margin | Used by |
|---|---|---|---|
| `archive` | **32px** | 64px | Editorial and print — fichas, packaging, posters, the folio system. Air is the point. |
| `field` | **24px** | 32px | Reports, labels, lot records, SOPs. **The default.** |
| `control` | **12px** | 16px | Dense telemetry — dashboards, metric tables, room monitors. |

```html
<div data-mode="control">
  <div class="grid">
    <div class="col-8">…</div>
    <div class="col-4">…</div>
  </div>
</div>
```

Below 900px every column collapses to full width; the mode keeps its gutter, so
a Control dashboard stays dense on a phone rather than turning into an Archive
page. Prose is capped at `--measure-prose: 68ch` regardless of column span.

---

## 3 · Imagery

> **Biological imagery is evidence, not decoration.**

Every figure is **frame + image + caption**. A specimen photograph with no
caption is an unlabelled sample; it does not ship. Captions set the latin
binomial in Gaya italic and the plate reference in mono micro.

| Class | Ratio | Frame | Caption | Use |
|---|---|---|---|---|
| **Botanical plate** `.sdp-fig--plate` | **4:5** portrait | `frame-specimen` — hairline + 3px offset outline | 14px Sans + `micro` plate ref | Full specimen, whole organism, contained. The archive image. |
| **Specimen photo** `.sdp-fig--specimen` | **1:1** | single hairline | 14px Sans, `INK_MUTED` | Detail shot — gills, spines, contamination. |
| **Cultivation photo** `.sdp-fig--cultivation` | **3:2** landscape | single hairline | 14px Sans, `INK_MUTED` | Context — room, rack, block in situ. |
| **Ingredient photo** `.sdp-fig--ingredient` | **1:1**, 64px wide | single hairline | `micro` uppercase | Inline in recipes; the substrate component itself. |
| **Diagram** `.sdp-fig--diagram` | **16:9** | hairline on `PAPER` | 14px Sans | Technical drawing. Ink on paper, never photographic. |

**Cropping.** Plates are `object-fit: contain` — a specimen is never cropped,
because the silhouette is the identifying information. Photos are `cover`.

**Ground.** Engravings and line art sit directly on `PAPER`. Scans arriving on
white stock are cut to transparency once
(`scripts/make-cutout.mjs`) rather than composited with `multiply` at every
call site — a near-white scan ground leaves a visible grey rectangle otherwise.

---

## 4 · Metadata grammar

The taxonomic and production label set. These atoms compose into every
component; they are never re-ordered or re-styled per surface.

### 4.1 Species block

Three lines, always in this order:

```
Reishi                                    ← species  · Gaya Bold 28px
Ganoderma lucidum                         ← latin    · Gaya Italic 18px
GAN-LUC · BASIDIOMYCOTA · LOTE 026        ← label    · Mono 11px / 0.15em UPPER
```

- **Common name** in the local register — *Melena de león*, not "Lion's mane".
- **Latin binomial** always italic, always sentence case: genus capitalised,
  species lower. `Ganoderma lucidum`, never `Ganoderma Lucidum`.
- **Taxon code** is `GEN-SPE`: first three of genus, first three of species,
  uppercase, hyphenated. `Ganoderma lucidum → GAN-LUC`. `Hericium erinaceus →
  HER-ERI`. Strain codes append a serial: `HER-01`.

### 4.2 Plate line

Provenance, coarse to fine, middot-separated, mono uppercase:

```
LÁM. IV · TENJO · CUNDINAMARCA · 2.600 M
plate    town    department      altitude
```

Altitude uses the Spanish thousands separator (`2.600`) and a capital `M`.

### 4.3 Production lines

| Line | Format | Example |
|---|---|---|
| **Lot / date** | `LOTE nnn · STRAIN · DD MMM YYYY` | `LOTE 026 · HER-01 · 17 AGO 2026` |
| **Environment** | `SALA nn · HR nn% · CO₂ nnn PPM` | `SALA 02 · HR 91% · CO₂ 742 PPM` |
| **Phase** | `PHASE · D day/total` | `INCUBACIÓN · D 12/19` |

Rules: months are three-letter Spanish uppercase (`ENE FEB MAR ABR MAY JUN JUL
AGO SEP OCT NOV DIC`). Lot numbers are zero-padded to three. `CO₂` uses the real
subscript. The middot always carries hair spacing on both sides.

Status is **colour *and* word**, never colour alone — a green bar with no
"EN ESPECIFICACIÓN" beside it fails for a colour-blind operator and dies in a
photocopy.

---

## 5 · Components

### 5.1 Component table

| # | Component | Class | Content | Columns | Mode |
|---|---|---|---|---|---|
| 1 | **Ficha / Lámina** | `.sdp-ficha` | Species header, plate, prose, 3-col footer (presentación / preparación / precio) | 12 | Archive |
| 2 | **Lote card** | `.sdp-lote` | Photo or plate, species, lot ID, status bar, 3-up metadata (sala/HR/CO₂) | 3–4 | Field |
| 3 | **Receta card** | `.sdp-receta` | Title, ingredients with proportion rules, numbered process, ingredient image | 6 | Field |
| 4 | **Metric table** | `.sdp-table` | Uppercase mono header, mono tabular data rows, status column | 8–12 | Control |
| 5 | **Alert banner** | `.sdp-alert` | 4px pigment rule, uppercase label, message, optional pictogram | 4–12 | any |
| 6 | **Navigation bar** | `.sdp-nav` | Sans breadcrumb + mono meta | 12 | any |
| 7 | **Telemetry tile** | `.sdp-tele` | Mono key, large value + unit, meter | 3 | Control |
| 8 | **Signage** | `.sdp-sign` | Soil header w/ room name, 3-up stats, footer lot line | 12 | Field (print) |
| 9 | **Packaging front** | `.sdp-pack--front` | Brand, plate, species, latin, net weight | — | Archive |
| 10 | **Packaging back** | `.sdp-pack--back` | Species block, ingredients, preparation, storage, traceability + QR | — | Archive |
| 11 | **SOP document** | `.sdp-sop` | Header w/ species, conditions table, numbered step boxes, stop banner | 12 | Field |

### 5.2 Anatomy and states

**Ficha / Lámina** — the archive object.
`__hd` (species block ‖ plate line) → `__body` (2-col: plate ‖ prose) →
`__ft` (3 equal cells, hairline-divided).
Header and footer are separated by `--rule-heavy` (2px `INK`); internal
divisions are hairlines. Below 700px body and footer both collapse to one
column and the cell borders move from right to bottom.
*States:* none — a ficha is a document, not a control.

**Lote card** — the field object.
`__media` (3:2 photo, or `--plate` variant at fixed 148px for line art) →
`__body` (species compact, `__id`, `__status`, `__meta`).
*States:* `--ok` (moss), `--warn` (ochre bar + `WARNING_TEXT` word),
`--error` (rust). The state drives the bar fill **and** the status word.
The bar is a 4px rule, never a pill or badge.

**Receta card.** `__hd` → ingredient rows (`64px key | name | %`) each followed
by a 2px proportion rule whose width equals its share → numbered `__steps`
(counter, `decimal-leading-zero`) → optional alert.
*States:* none.

**Metric table.** `th` = mono 11px uppercase tracked, `--rule-heavy` beneath.
`td` = mono 13px tabular. `.num` right-aligns. Even rows take `PAPER_PANEL`.
Status cells take `.is-ok` / `.is-warn` / `.is-error`.

**Alert banner.** 4px left rule in the state pigment, tint ground, uppercase
label, message in `INK`. Optional 20px pictogram inherits the label colour.
*States:* `--ok`, `--warn`, `--error`. No fourth state; "info" is body text.

**Navigation bar.** Sans breadcrumb, `›` separators in `RULE`, current page in
`INK` medium. Mono meta right-aligned. Never mono for the crumbs themselves.

**Telemetry tile.** Mono key → 28px semibold value with small unit → 4px meter.
*States:* `--warn`, `--error` recolour the meter fill only; the number stays
`INK` so the reading is never harder to read than when it was fine.

**Signage.** `SOIL` header band with `PAPER` text (9.74:1) → 3 stat cells →
footer lot line. Printed at A2; the room name is `display-02` in Gaya.

**Packaging.** Front is a 3-row grid (brand / plate / naming block) centred.
Back is a **flex column** so the traceability block sits at the foot regardless
of copy length. Front carries **no** operational codes; the back carries the lot
line and QR. A customer never sees a room name or an operator name.

**SOP.** `__hd` (title + species block ‖ revision) → conditions `sdp-table` →
`__step` boxes (`40px` mono numeral | title + body) → stop banner → folio.

---

## 6 · Compositions

Three page types. The mode is the page's contract with the reader.

| Layout | Mode | Structure | Contains |
|---|---|---|---|
| **Archive** | `archive` | Single object, generous margin, one display size | Ficha, packaging face, poster, plate |
| **Field** | `field` | Multi-column report, printable A4/A2 | SOP, lote cards, receta, signage |
| **Control** | `control` | Dense grid, 12-col, telemetry-first | Dashboard desktop/mobile, metric tables |

```mermaid
graph LR
  subgraph Atoms
    SP[Species block]
    PL[Plate line]
    ST[Status line]
    FIG[Figure: frame+caption]
  end

  subgraph Components
    FICHA[Ficha / Lamina]
    LOTE[Lote card]
    REC[Receta card]
    TBL[Metric table]
    ALERT[Alert banner]
    NAV[Navigation bar]
    TELE[Telemetry tile]
    SIGN[Signage]
    PACK[Packaging]
    SOP[SOP document]
  end

  subgraph Pages
    ARCHIVE[Archive layout]
    FIELD[Field layout]
    CONTROL[Control layout]
  end

  SP --> FICHA & LOTE & PACK & SOP
  PL --> FICHA & PACK
  ST --> LOTE & SIGN & TELE
  FIG --> FICHA & LOTE & REC & PACK

  FICHA --> ARCHIVE
  PACK --> ARCHIVE
  REC --> FIELD
  SOP --> FIELD
  SIGN --> FIELD
  LOTE --> FIELD & CONTROL
  ALERT --> FIELD & CONTROL
  NAV --> CONTROL
  TELE --> CONTROL
  TBL --> CONTROL
```

---

## 7 · Mockups

Eight, all in `mockups/`, all rendered from the real tokens by
`node scripts/render.mjs` → `mockups/out/*.png` at 2–3×. The renderer force-loads
every brand face and **fails the build** if one silently falls back.

| # | File | Surface | Type calls |
|---|---|---|---|
| 1 | `01-packaging.png` | **Packaging front + back**, Reishi, 420 × 620 each | Front: `font-family:"Gaya Patched"; font-weight:700; font-size:36px` (Reishi) over `font-family:"Gaya Patched"; font-style:italic; font-weight:400; font-size:18px` (*Ganoderma lucidum*). Brand + net weight in Mono 11px/0.15em upper. Back adds the traceability line `LOTE 026 · HER-01 · 17 AGO 2026` and a QR. |
| 2 | `02-ficha.png` | **Ficha botánica**, Reishi, 760px Archive | `species` 28px Gaya Bold, `latin` 18px Gaya Italic, plate in `frame-specimen` 4:5, prose 16px Plex Sans, footer cells presentación / preparación / precio. |
| 3 | `03-lote-card.png` | **Lote cards** (`--ok`, `--warn`) + all three **alert banners** | Card title 22px Gaya Bold, lot ID Mono 16px, state word Mono 11px/0.15em. Hericium plate on the `--plate` media variant. |
| 4 | `04-receta.png` | **Receta de sustrato**, melena de león, 640px Field | Heading 24px Gaya Medium, ingredient names 16px Sans, percentages Mono 16px, proportion rules in `SOIL`, steps numbered `01…05` in Mono. Ingredient thumbnail 64px 1:1. |
| 5 | `05-dashboard-desktop.png` | **Dashboard escritorio**, 1600px Control | Masthead "Setas de la Peña" `display-02` 44px Gaya Bold. Four telemetry tiles, 14-day CO₂ chart (moss = Sala 02, soil dashed = Sala 03, ochre dashed = umbral), 5-row metric table, aside with two lote cards. |
| 6 | `06-dashboard-mobile.png` | **Dashboard móvil**, 430 × 932 @3× | `heading-02` masthead, hamburger at 44px tap target, 2-up tiles, compact chart, horizontal lote cards (88px media ‖ body). |
| 7 | `07-signage.png` | **Señalética Sala 02**, 840 × 520, A2 | `SOIL` band, "Sala 02 — Incubación" `display-02` 44px Gaya Bold in `PAPER`. Stats 36px Mono SemiBold: HR 91 %, CO₂ 742 ppm, 24,0 °C. |
| 8 | `08-sop.png` | **SOP-04 Procedimiento Shiitake**, 720px A4 | `heading-01` 32px Gaya Medium title, *Lentinula edodes* in `latin`, 4-row conditions table, five step boxes with 24px Mono numerals, rust stop banner. |

Example content is **Reishi** (*Ganoderma lucidum*) and **melena de león**
(*Hericium erinaceus*) throughout, per brief.

---

## 8 · Deliverables

```
08_brand/ds-2026/
├── DESIGN_SYSTEM.md              ← this document
├── COMPONENTS.md                 ← per-component spec sheets
├── SOURCES.md                    ← references, verified
├── README.md                     ← how to use / how to rebuild
├── tokens/
│   ├── tokens.css                ← the single source of truth
│   ├── fonts.css                 ← @font-face, all vendored
│   ├── colors.json               ← colour tokens, primitive + derived + semantic
│   ├── typography.json           ← families, weights, 12-role scale, minimums
│   └── spacing.json              ← scale, 12-col grid, three modes, structure
├── components/
│   ├── base.css                  ← reset, type classes, grid, rules
│   └── components.css            ← all eleven components
├── assets/
│   ├── fonts/                    ← Gaya ×12, IBM Plex Sans ×5, IBM Plex Mono ×3
│   ├── icons/                    ← 12 SVG pictograms, 48-grid, 1.5px stroke
│   ├── img/                      ← reishi engraving (jpg + alpha cutout), hericium plate, logo
│   └── textures/                 ← paper-grain.png, paper-fibre.png (tileable RGBA)
├── mockups/
│   ├── *.html                    ← eight mockups on the real tokens
│   ├── manifest.json             ← render sizes
│   └── out/*.png                 ← eight rendered images
└── scripts/
    ├── validate.py               ← structural gate: tokens, fonts, assets, parity
    ├── contrast-audit.py         ← WCAG gate; exits non-zero on violation
    ├── render.mjs                ← mockups → PNG, with font-load verification
    ├── gen-hericium.py           ← botanical plate generator (seeded)
    ├── gen-textures.py           ← tileable paper textures, no image library
    └── make-cutout.mjs           ← scan → transparent PNG
```

### Icon set

Twelve pictograms on a **48px grid, 1.5px stroke, no fill**, inheriting
`currentColor`: `leaf`, `mushroom`, `flask`, `substrate-bag`, `alert`, `check`,
`droplet`, `thermometer`, `atmosphere` (CO₂), `clock`, `package`, `room`.

A pictogram is monochrome `INK`. An accent may sit *beside* a glyph, never
inside it.

---

## 9 · Reproducing everything

```bash
cd 08_brand/ds-2026

python3 scripts/validate.py             # structural gate — exit 0 required
python3 scripts/contrast-audit.py       # WCAG gate — exit 0 required
python3 scripts/gen-hericium.py         # regenerate the plate (deterministic)
python3 scripts/gen-textures.py         # regenerate paper textures (~1s)
node     scripts/make-cutout.mjs        # re-cut the engraving
node     scripts/render.mjs             # all eight mockups → mockups/out/
node     scripts/render.mjs 05          # just one
```

`render.mjs` serves the folder over HTTP rather than `file://` so the vendored
faces load without CORS trouble, and it asserts that Gaya (Bold, Black, Italic),
Plex Sans and Plex Mono all resolved before it writes a PNG.

---

## 10 · Relationship to FOS

`08_brand/field-os-identity/` (FOS) is a **separate, independently audited**
system in this same repo. DS-2026 was built standalone at the client's
direction and does **not** import, alias or supersede it.

Where they differ materially:

| | DS-2026 | FOS |
|---|---|---|
| Paper | `#FAF5E9` | `#F7F4EC` |
| Ink | `#222222` | `#1E1D19` |
| Rule | `#888888` (3.26:1) | `#988C6C` (3.03:1) |
| Green | `MOSS #4E6B3F` | `--accent-olive #5B6B44` |
| Error | `RUST #8E2C14` | `--accent-rust #8C3223` |
| Caution | `WARNING #C49A4C` + `WARNING_TEXT` | routed through terracotta `#A85C32` |
| Earth | `SOIL #4A3C31` | `--accent-mushroom #7A6A52` |
| Editorial face | Gaya Patched | Gaya |
| Body face | IBM Plex Sans | *(`--font-sans` is set to Gaya — see below)* |
| Baseline | 8px | 4px |
| Radius | 0 / 2px | 0 / 2 / 3px |

**Do not mix the two stylesheets on one surface.** Both define `--paper-*`,
`--ink-*` and `--space-*`; loading both means the later import silently wins and
you get a page that is neither system.

> **Finding, unrelated to this work.** `field-os-identity/tokens/fonts.css` sets
> `--font-sans: 'Gaya'` and `--font-display: 'IBM Plex Sans Display'` — the two
> roles appear inverted relative to how every other FOS document describes them
> (Gaya is the identity/display face). This was not changed, since FOS was out
> of scope here, but it is worth a look.
