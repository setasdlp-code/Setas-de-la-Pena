# Setas de la Peña — Design System Documentation

## Design Tokens

### Color palette

#### Paper (background)
| Token | Hex | Role |
|-------|-----|------|
| paper-50 | #FCFBF6 | Lightest surface |
| paper-100 | #F6F4EC | Primary surface |
| paper-200 | #EDE8DB | Secondary surface |
| paper-300 | #DBD4C3 | Tertiary surface |

#### Ink (text & stroke)
| Token | Hex | Role |
|-------|-----|------|
| ink-900 | #1A1410 | Primary text, logo stroke |
| ink-700 | #3A2F26 | Secondary text |
| ink-500 | #6B5B4A | Tertiary text |
| ink-300 | #A89682 | Hint text |

#### Moss (primary accent)
| Token | Hex | Role |
|-------|-----|------|
| moss-900 | #1E2A16 | Dark accents |
| moss-700 | #2E3B2F | **Primary brand color** — logo, display titles, key marks |
| moss-500 | #6D7C5A | Secondary emphasis, success state |
| moss-300 | #A0AE80 | Light emphasis |

#### Coral (secondary accent)
| Token | Hex | Role |
|-------|-----|------|
| coral-700 | #9C3F1F | Dark variant |
| coral-500 | #C5562D | **CTA color** — buttons, links, accents |
| coral-300 | #D98A63 | Light variant |
| coral-200 | #EBC4AC | Lightest variant |

#### Warm & cool neutrals
| Token | Hex | Role |
|-------|-----|------|
| sand-500 | #BFA98B | Body, stem illustration |
| bark-700 | #594631 | Dark earth tone |
| slate-500 | #4E6A7A | Cool shadow, depth |
| ochre-500 | #C68F2C | Warning, seasonal accent |

### Semantic roles
- **Acento primario**: moss-700 (brand marks, emphasis)
- **Acento secundario**: coral-500 (CTAs, links, interactive)
- **Texto primario**: ink-900 (body copy, stroke)
- **Superficie**: paper-100 (canvas base)
- **Éxito / temporada**: moss-500 (seasonal, positive states)
- **Aviso**: ochre-500 (caution, alert)

**Rule**: No gradients. All color is flat pigment. Subtle radial wash on paper only.

---

## Typography

### Typeface families

| Family | Usage | Weights |
|--------|-------|---------|
| Gaya Patched | Display, headlines (≥26px) | Regular 400, Heavy 800 |
| PP Object Sans | Body, UI, labels, buttons | Regular 400, Heavy 800 |

**Note**: Only Regular (400) and Heavy (800) weights. No 500, 600, 700. Italic available for scientific names and quotes.

### Type scale

| Role | Font | Weight | Size | Line height | Letter spacing |
|------|------|--------|------|-------------|---|
| Display 1 | Gaya Patched | Heavy 800 | 88px | 0.95 | — |
| H1 | Gaya Patched | Regular 400 | 52px | 1.05 | — |
| H2 | Gaya Patched | Regular 400 | 40px | 1.1 | — |
| H3 | PP Object Sans | Heavy 800 | 26px | 1.2 | — |
| Lede | PP Object Sans | Regular 400 | 22px | 1.45 | — |
| Body | PP Object Sans | Regular 400 | 17px | 1.55 | — |
| Eyebrow | PP Object Sans | Heavy 800 | 12px | 1.2 | +0.18em (uppercase) |

### Rules
- **Sentence case everywhere** — titles, labels, buttons. Never Title Case.
- **Scientific names** always in *italic* (slanted): *Pleurotus ostreatus*, *Hericium erinaceus*
- **No exclamation marks** in body copy. Period. Discrete punctuation matches the voice.
- **Gaya Patched** used only for display (≥26px). Never for body text.

---

## Spacing & Layout

### Horizontal widths
- **Text width**: 720px (readable line length)
- **Grid width**: 1200px (component layouts)

### Principles
- **Asymmetry**: Text left-weighted, illustrations in right margin
- **Breathing room**: Air over crowding; margins > gutters
- **Paper first**: Digital surface is cream, not white

### Motion (digital)
- **Easing**: `cubic-bezier(.32, .72, .36, 1)` — paper settling
- **Hover translation**: Max ±2px (no scale, no rotation)
- **Nav fade on scroll**: `backdrop-filter: blur(12px)` on sticky header at 80% opacity (only place glassmorphism appears)

---

## Iconography

### Interface icons (Lucide)
- **Stroke width**: Always 1.5px, never filled
- **Color**: `currentColor` (inherits text color)
- **Sizes**:
  - Text & buttons: 20px
  - Nav & cards: 24px
  - Hero sections: 32px
- **Function**: Search, cart, menu, arrows, user, location, calendar, check, etc.

**Prohibition**: No emoji. No Unicode glyphs as icons (✓ ★). Always use Lucide `check` / `star` / etc.

### Botanical illustration
- **Purpose**: Categories, section headers, empty states, packaging
- **Medium**: Ink on paper (pen line, hand-drawn)
- **Variants**: Lion's mane, oyster, shiitake, reishi, enoki, nameko, turkey tail, cardoncillo
- **Usage**: Full-bleed on section breaks; margin decorations on digital; accent color (coral) on touches

---

## Components

### Logo
- **Primary**: Hand-drawn logotype + botanical scene in single moss green
- **Lockup**: Wordmark (`setas` + *de la peña*) united with scene
- **Variants**:
  - Logo only (small spaces, when scene doesn't fit)
  - On dark background (paper cream on moss-900)
  - Full lockup (default, max use)
- **Minimum size**: 160px wide (screen) / 40mm (print); below that, use logo-only
- **Clearspace**: Margin = height of letter `s` in "setas"
- **Prohibited**: No recolor, no stretch/compress, no rotation, no shadows/effects, no substitution of drawn type with system font

### Buttons
| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| **Fill** (primary) | ink-900 | paper-100 | none | translate-y +1px, shadow collapses |
| **Outline** (secondary) | transparent | ink-900 | ink-900 border | as above |
| **Moss** (brand) | moss-700 | paper-100 | none | as above |

- **Corner radius**: 14px (`border-radius: var(--border-radius-md)`)
- **Active state**: Slight translate down +1px, shadow dissolves
- **Text**: Sentence case, PP Object Sans Regular 400

### Labels & tags
- Derived from color system (semantic role colors)
- Typically paper background with colored border or moss/coral text on paper-200

### Form inputs
- **Border**: ink-300 or paper-300
- **Focus**: moss-700 outline, brief fade-in
- **Placeholder**: ink-300 (tertiary text color)

### Cards & containers
- **Border radius**: 12px (`border-radius: var(--border-radius-lg)`)
- **Background**: paper-100 (default) or paper-50 (lifted)
- **Border**: paper-200 or paper-300 (subtle)
- **Shadow**: Minimal (paper resting on itself, not floating)

---

## Packaging & labels

### Label anatomy
1. **Header**: Logo on moss-900, lot number + origin (right-aligned, mono, ink-300)
2. **Body**: Common name (Display, moss-900), scientific name (*italic*, ink-500), tasting note (2–3 sentences)
3. **Data stripe**: Weight · Substrate · Harvest date (uppercase eyebrow, tracking wide)

### Materials
- **Paper**: Kraft or uncoated cream (matte, tactile)
- **Inks**: One or two colors (moss + ink, or ink only; coral as seal accent)
- **Finish**: Handmade (twine, rubber stamp, paper tape, no plastic)

---

## Digital & web

### Hero layout
- **Text left**: Heading + body on the left 60%
- **Illustration right**: Botanical scene in right margin, bleed off edge
- **Nav**: Lean bar (56–64px sticky), logo + nav links, fades on scroll

### Grid principles
- **Wide text**: 720px max (readable)
- **Component grid**: 12-column, 1200px
- **Gutters**: 20px (scales to 16px on mobile)

### Interaction
- **Hover**: ±2px translate, no bounce
- **Focus**: Subtle outline (moss-700), inner glow (paper-200)
- **Loading**: Gentle fade, never spinners

---

## Brand voice & tone

### Persona
- **We (plural)**: Cultivamos, cosechamos (the finca speaks)
- **You (familiar)**: Tú, never usted
- **Tone**: Observant, quiet, factual, poetic without trying
- **Audience**: Curious adult, not activated customer

### Examples ✓
- *"Melena de león, recogida esta mañana."*
- *"Cultivamos ocho variedades sobre serrín de roble y haya. Sin aditivos. Sin blanqueadores."*
- *"Hericium erinaceus — algo a marisco, algo a nuez. Mejor desgarrada que cortada."*

### Examples ✗
- ~~"¡Descubre nuestra selección premium!"~~
- ~~"Libera el poder de los hongos funcionales."~~
- ~~"No te lo pierdas — ¡pide hoy!"~~

### Punctuation
- No emoji (illustrations are the emoji)
- Dashes — used freely, like field notes
- Ellipses… rarely
- No exclamation marks in body
- Sentence case: *"Nuestras setas", not "Nuestras Setas"*

---

## Implementation notes

### Figma
All tokens should sync to Figma design file as variables and styles. Update the manual when changes ship. **This is a living document** — if something doesn't fit, correct it and re-import.

### Code handoff
When designs move to code:
1. Export color swatches as CSS custom properties (--moss-700, etc.)
2. Type scale maps to font-size + line-height utilities
3. Icons from Lucide via npm (`lucide-react` / `lucide-vue` / etc.)
4. Spacing uses 4px baseline unit (4, 8, 12, 16, 20, 24, 32, 40, 48px)

### For partners & vendors
- **Packaging vendors**: Share the label design + mood (botanical, handmade, earthy)
- **Photography vendors**: Warm grain, short depth of field, kraft/wood surfaces, natural light only
- **Content partners**: Share voice examples + the "no exclamation marks" rule

---

**Document version**: v1.0 · 2026  
**Last updated**: 2026-06-08  
**Status**: Living. If something here doesn't fit, correct it.
