# Setas de la Peña — Design System

> _Hand-grown mushrooms from the rock._
> A small-batch artisanal mushroom brand. The visual identity is rooted in old botanical illustration, hand-lettering, and warm paper.

---

## What is this brand?

**Setas de la Peña** (Spanish: _"Mushrooms of the Cliff / Crag"_) is — based on the materials provided — a small artisanal mushroom cultivator. The name evokes a specific place (the _peña_, a rocky outcrop in the Spanish/Latin landscape), and the products in the source imagery are clearly **gourmet & medicinal mushrooms**: lion's mane (the shaggy one), oyster mushrooms (the fan-shaped clusters), and what looks like reishi or a polypore (the kidney-shaped one).

The brand is positioned squarely against industrial agriculture and corporate-feeling food brands. It is:

- **Slow-craft.** Hand-drawn everything. No vector logos, no glossy renders.
- **Botanical & scientific.** Pen-and-ink, naturalist's-field-journal vibe.
- **Bilingual / Spanish-leaning.** Brand name and likely copy mix Spanish & English.
- **Quietly confident.** Small, honest, doesn't shout.

There is **no website, app, or codebase yet** — this design system is being built from the brand foundations alone (logo sketch, botanical illustration, two typefaces). The included UI kit is therefore a **proposed first surface** (a marketing site for a small producer), not a recreation of an existing product.

### Sources provided

| Source | Path | Notes |
|---|---|---|
| Logo sketch | `assets/logo-sketch.png` | Hand-drawn ink lettering, "Setas de la Peña" |
| Botanical illustration | `assets/botanical-mushrooms-mountain.png` | Lion's mane + mountain + oyster cluster + polypore |
| Display typeface | `fonts/GayaPatched-*.otf` | "Patched" — sketchy, irregular serif. Display only. |
| Body typeface | `fonts/PPObjectSans-*.otf` | Pangram Pangram's modern geometric grotesque. UI/body. |

No Figma file, no GitHub repo, no codebase were attached. **If those exist, please attach them via Import** so the UI kit can be made faithful instead of speculative.

---

## CONTENT FUNDAMENTALS

How copy is written for Setas de la Peña.

### Voice
The brand speaks like a **field notebook**: observational, calm, factual, with a quiet poetry. Never marketing-speak. Never exclamation marks. The reader is treated as a curious adult, not a customer to be activated.

### Person & address
- **First-person plural** ("we grow", "we harvest") when speaking as the farm.
- **Second-person familiar** ("you'll notice", "you can keep them") — never "valued customer" register.
- In Spanish copy, use **tú**, never **usted**. The brand is intimate, not formal.

### Casing
- **Sentence case** for everything: headings, labels, buttons, nav.
- **No Title Case** anywhere. ("Our mushrooms", not "Our Mushrooms".)
- **UPPERCASE only for eyebrows** (tiny tracking-wide section labels), and even then sparingly.
- Latin / scientific names always _italicized_: _Pleurotus ostreatus_, _Hericium erinaceus_.

### Tone examples

✅ Good:
- "Lion's mane, picked this morning."
- "We grow eight varieties on oak and beech sawdust. No additives. No bleach."
- "Hericium erinaceus — slightly seafood, slightly nutty. Best torn, not sliced."
- "Pickup Tuesday at the market in Pamplona, or come up to the farm."

❌ Off-brand:
- "Discover our premium mushroom selection!"
- "Unlock the power of functional fungi."
- "🍄 NEW! Now with 30% more antioxidants 🍄"
- "Don't miss out — order today!"

### Emoji & punctuation
- **No emoji.** Anywhere. The brand's "emoji" is its botanical illustrations.
- **Em dashes** — used liberally — as in field notes.
- **Ellipses…** sparingly, for a pause.
- **No exclamation marks** in body copy. Period.
- Spanish punctuation is correct: ¿Cómo se cocina?, ¡Hola! is fine only in dialogue.

### Length
- Headlines: **3–6 words.** Almost always.
- Body paragraphs: **2–4 sentences.**
- Captions: **one short clause.** Like a botanical label.

### Bilingual handling
When mixing Spanish and English, use Spanish for **proper nouns and brand vocabulary** (setas, peña, finca, lonja), and English for the rest unless the audience is clearly Spanish-speaking. Italicize the Spanish: _setas_.

---

## VISUAL FOUNDATIONS

### Colors
A warm, earth-pigment palette matched to the 2026 brand board. Defined in `colors_and_type.css`.

- **Paper** — near-white warm cream, lightened to the board: `#FCFBF6` → `#F6F4EC` → `#EDE8DB` → `#DBD4C3`. This is the canvas. Always present.
- **Ink** — never pure black. Warm near-black `#1A1410` for text and line art, with three softer tints for hierarchy.
- **Moss** (`#2E3B2F` deep, `#6D7C5A` sage) — the primary brand color. The wordmark green. Display headings, key marks.
- **Coral** (`#C5562D`) — secondary accent. Used for CTAs, links, the polypore highlights.
- **Sand** (`#BFA98B`) & **Bark** (`#594631`) — warm neutrals: oyster/lion's-mane body, stems, oak substrate.
- **Slate** (`#4E6A7A`) — cool neutral: shadow, mountain stone, dates.
- **Ochre** (`#C68F2C`) — retained for warning semantics and the paper wash; no longer a board headline.

Use color **sparingly**, like watercolor over ink. The page should feel like paper first, color second.

### Type
- **Display: Gaya Patched.** A sketchy, irregular serif whose "patched" quality matches the hand-lettered logo. Use for all headings ≥ 26px. Never for body.
- **Body: PP Object Sans.** Clean modern grotesque. Used for body, UI, labels, buttons.
- Two weights only — **Regular (400)** and **Heavy (800)**. No 500/600/700.
- Slanted (italic) is used for: scientific names, asides, captions.
- Display headings get tight tracking (`-0.005em` to `-0.01em`). Body is default. Eyebrows are tracked wide (`+0.18em`).

### Backgrounds
- **Primary surface is paper** — flat warm cream, optionally with a subtle SVG-noise grain (`.paper` class).
- **Full-bleed botanical illustrations** are the brand's signature backdrop. Used at section breaks, hero areas, and as decorative side margins. Always in ink-on-paper, never re-tinted.
- **No gradients.** Anywhere. Except very subtle radial paper-wash inside the `.paper` texture utility.
- **No stock photos.** Imagery is either (a) hand-drawn illustration or (b) warm photography of actual mushrooms, with grain and natural light.

### Imagery feel
- Warm. Slight grain. Daylight, never studio lighting.
- Black ink line work over cream.
- If color photography is used: shallow depth of field, brown-paper or wood surfaces, no digital saturation.

### Animation
- **Restrained.** Fades and slight translations, never bounces.
- Easing: `cubic-bezier(0.32, 0.72, 0.36, 1)` — a soft ease-out that feels like paper settling.
- Duration: **200ms** for state changes, **400ms** for entrances, **600ms** for hero reveals.
- Hover transforms are limited to ±2px translation max. No scaling, no rotation.

### Hover & press
- **Buttons (filled, ink):** hover → background darkens by ~6% toward `--rust-700`. Press → translate-y +1px, shadow collapses.
- **Buttons (outline, ink-bordered):** hover → fill becomes `--paper-200`. Press → translate-y +1px.
- **Links:** hover → color shifts from `--rust-500` to `--rust-700`, underline thickens 1px → 2px.
- **Cards:** hover → shadow deepens (`--shadow-card` → `--shadow-lift`), translate-y −2px.

### Borders
- **1px borders only.** Use `--border-soft` (10% ink) for dividers, `--border-strong` (22% ink) for input outlines, `--border-ink` (full ink) for the "drawn" framing style.
- **Drawn-frame style:** for hero cards and product tiles, use a 1px solid `--ink-900` border with `border-radius: var(--r-md)` and a soft drop shadow. Feels like an inked label.

### Shadows
A two-step system, both warm and soft (color-mixed from ink, never pure black-alpha):
- `--shadow-soft` — UI elements (chips, dropdowns).
- `--shadow-card` — cards at rest.
- `--shadow-lift` — cards on hover, modals, popovers.
- `--shadow-inset` — pressed states, deboss.

### Corner radii
Moderate. The brand isn't sharp-edged industrial, but isn't bubbly either.
- `--r-xs: 4px` — tags, inline chips.
- `--r-sm: 8px` — inputs, small buttons.
- `--r-md: 14px` — primary buttons, cards.
- `--r-lg: 22px` — large hero cards, modals.
- `--r-pill: 999px` — pill chips (used sparingly).

### Cards
The default card is: `--bg-card` fill, `1px solid var(--border-soft)`, `--r-md` corners, `--shadow-card` shadow, generous padding (`--space-6` minimum). Botanical illustrations may bleed outside one edge of a card as an asymmetric decoration — a brand signature.

### Transparency & blur
- **Backdrop-blur is allowed once:** the sticky top nav, when the page has scrolled. `backdrop-filter: blur(12px) saturate(1.1)` over `color-mix(in oklab, var(--paper-100) 80%, transparent)`.
- Otherwise, no glassmorphism, no frosted layers.

### Layout
- **Generous whitespace.** Default content max-width: **720px** for text, **1200px** for grids.
- **Asymmetry > centered everything.** Hero text leans left; an illustration sits in the right margin. Captions sit in margins, not under their images.
- **Sticky nav** only at the very top, slim (56–64px). No mega-menus.

### Fixed elements
- Top nav: yes, slim, becomes blurred on scroll.
- Floating elements: avoid. If a "back to top" or cart is needed, dock to the **bottom-right**, small, ink-on-paper.

---

## ICONOGRAPHY

### The brand's primary "icons" are illustrations, not glyphs
The most powerful visual language is the **hand-drawn botanical illustration** (`assets/botanical-mushrooms-mountain.png`). When something needs visual emphasis, the answer is more often "use the mushroom drawing" than "use an icon".

### UI icons
For functional UI (cart, search, menu, arrows, social, etc.), we use **[Lucide](https://lucide.dev/)** via CDN:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

**Why Lucide:** clean 1.5px stroke, no fill, geometric — quiet enough to disappear next to the brand's hand-drawn moments. Stroke weight matches the body type's restraint.

**Substitution flag:** _No icon system was provided in the brief._ Lucide is a reasonable default for this aesthetic, but **if you have a custom illustrated icon set, please attach it** and we'll swap.

### Rules
- **Always 1.5px stroke**, never filled.
- **20px** in body text and buttons, **24px** in nav and cards, **32px** in hero.
- **Color:** `currentColor`. Inherit from text color.
- **No emoji**, ever. (See content fundamentals.)
- **No unicode glyphs as icons** (no ✓ ★ — use Lucide `check` / `star`).

### When to draw, when to glyph
- **Glyph (Lucide):** UI affordances, navigation, status, form controls.
- **Illustration:** product categories, section headers, empty states, marketing hero, packaging.

---

## INDEX — what's in this folder

```
README.md                     ← you are here
SKILL.md                      ← Agent Skills manifest (for Claude Code use)
colors_and_type.css           ← All color & type tokens, font @font-face's, baseline styles

fonts/                        ← Brand typefaces (.otf)
  GayaPatched-Regular.otf
  GayaPatched-Italic.otf
  PPObjectSans-Regular.otf
  PPObjectSans-Slanted.otf
  PPObjectSans-Heavy.otf
  PPObjectSans-HeavySlanted.otf

assets/                       ← Brand visual assets
  logo-primary.png            ← Primary lockup — wordmark + botanical scene, unified moss ink (2.25:1)
  logo-sketch.png             ← Hand-drawn wordmark, mark-only
  botanical-mushrooms-mountain.png  ← Hero illustration
  elements/                   ← Specimen cut-outs keyed from the 2026 board (transparent PNG)
    specimen-coral-shelf.png  specimen-amanita.png  specimen-mountain.png
    specimen-oyster.png       specimen-puffball.png specimen-coral-fan.png
  products/                   ← Per-variety specimens, unified single moss ink (transparent PNG)
    melena-de-leon.png  setas-de-cardo.png  shiitake.png  shiitake-single.png  cola-de-pavo.png

preview/                      ← Cards that populate the Design System tab
  logo.html, colors-paper.html, colors-earth.html, colors-ink.html,
  type-display.html, type-body.html, type-scale.html,
  spacing.html, radii.html, shadows.html,
  buttons.html, inputs.html, badges.html, card.html, nav.html,
  illustration.html, iconography.html

ui_kits/
  website/                    ← Proposed marketing website (no existing site provided)
    index.html                ← Click-thru demo
    Header.jsx, Footer.jsx, Hero.jsx, ProductCard.jsx, Button.jsx, ...
    README.md
```

---

## Caveats & substitutions

- **No existing product** — UI kit is speculative. Marketing-site for a small producer.
- **No icon set provided** — using Lucide via CDN. Easy to swap.
- **No color palette explicitly given** — derived from the warm tones present in the source sketches (cream paper + ink + sienna highlights).
- **PP Object Sans is licensed** by Pangram Pangram. We're using the .otf files you provided. For web production at scale, confirm the license includes web embedding.
- **Gaya Patched** is also commercial — same license note applies.

If anything here is wrong, please correct and re-import; this is a living foundation.
