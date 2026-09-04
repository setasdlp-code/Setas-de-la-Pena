# Setas OS Design Tokens

Canonical token reference for `sim.css`. These tokens define the visual language for the Setas OS simulator UI — a data-dense, field-journal aesthetic for recipe formulation, inventory, and batch management.

## Overview

- **Status**: Active (v2, 2026-08 refresh)
- **Scope**: `.sim-root` — all Setas OS component styles
- **Dependencies**: Design system tokens from main project CSS (colors, typography, shadows)
- **Changes**: Tokenized 120+ hardcoded hex values; defined spacing scale; standardized button states

---

## Token Categories

### Color Tokens

#### Ingredient Categories

> **Defined in the design system**, not `sim.css`: see
> `_ds/<bundle>/tokens/colors.css`, section "Ingredient categories".
> The values and WCAG rationale below are mirrored there verbatim; edit that
> file, not `sim.css`.

Each category has four states: default (border), hover (tinted background), hover-text, and `-on` (solid-fill "selected" state).

| Token | Use | Default | Hover | Hover text | `-on` fill |
|-------|-----|---------|-------|-----------|-----------|
| `--cat-base` | Legumes, cereals, substrate bases | #5A7042 | 12% tint | #3a4f2a | #5A7042 |
| `--cat-cafe` | Composted coffee, fermented media | #7A4A2F | 12% tint | #7A4A2F | #7A4A2F |
| `--cat-sup` | Premium/supplement layers | #C68F2C | 12% tint | #8B6014 | **#8B641F** ⚠️ |
| `--cat-est` | Stabilizers, structural amendments | #6B4E31 | 12% tint | #6B4E31 | #6B4E31 |
| `--cat-local` | Locally-sourced materials | #7A5A3F | 12% tint | #7A5A3F | #7A5A3F |
| `--cat-trop` | Tropical specialty materials | #B8694B | 12% tint | **#8C5039** ⚠️ | **#8C5039** ⚠️ |
| `--cat-circ` | Circular/waste materials, by-products | #6B7C5F | 12% tint | **#56634C** ⚠️ | **#56634C** ⚠️ |
| `--cat-adit` | Additives, amendments, biotech | `--accent-blue-grey` | 12% tint | `--accent-blue-grey` | same as default |

⚠️ = the value is **darkened from the base hue** to pass WCAG AA. See Accessibility Audit below — do not "fix" these back to the base color, that reintroduces the contrast failure.

**Usage**: Applied to ingredient badges, category tabs, and ingredient list filters. The color encodes ingredient *function* in the recipe, not visual hierarchy. The border/hover states always use the natural brand hue (`--cat-base` etc); the `.on` fill uses the `-on` variant and the `:hover` text uses the `-text` variant, both computed against their *actual* rendered foreground/background (see below — not white).

```css
.cat[data-cat="base"] {
  border-left: 3px solid var(--cat-base);
}
.cat[data-cat="base"]:hover {
  background: var(--cat-base-hover);
  color: var(--cat-base-text);
}
.cat[data-cat="base"].on {
  background: var(--cat-base-on);  /* not --cat-base — see WCAG note */
  color: var(--text-on-dark);
}
```

### Accessibility Audit — Ingredient Category Colors

**v2 — corrected foreground.** The first pass of this audit computed `.on`-state contrast against pure white (`#FFFFFF`). That was wrong: `.on` renders `color: var(--text-on-dark)`, which resolves `--text-on-dark → --paper-50 → --paper-0 → #F7F4EC` — a warm cream, not white. Cream has *lower* luminance than white, so every ratio computed against white overstated the real contrast; the first-pass `-on` fixes for `sup`/`trop`/`circ` still failed 4.5:1 against the color that's actually behind the text (4.36:1, 4.44:1, 4.44:1). Re-run below against `#F7F4EC`, the true resolved value.

The first pass also never checked the `:hover` text pairing (`--cat-*-text` as foreground on `--cat-*-hover`, a light tint over `--paper-0`) against its own worst case — the untinted `--paper-0` background. Two categories fail there too.

Chip/badge text in this UI runs 9.5–13px, below the WCAG "large text" exemption (18px regular / 14px bold minimum), so the full 4.5:1 threshold applies to both pairings.

| Category | Fill vs. `#F7F4EC` (`.on` state) | Result | Text vs. `--paper-0` (hover, untinted worst case) | Result |
|----------|-----------------------------------|--------|------------------------------------------------------|--------|
| base | 4.99:1 | ✅ Pass | 8.69:1 | ✅ Pass |
| cafe | 6.71:1 | ✅ Pass | 7.12:1 | ✅ Pass |
| **sup** | **4.36:1** (first-pass fix) | ❌ **Fail** | 5.05:1 | ✅ Pass |
| est | 6.92:1 | ✅ Pass | 7.35:1 | ✅ Pass |
| local | 5.68:1 | ✅ Pass | 6.03:1 | ✅ Pass |
| **trop** | **4.44:1** (first-pass fix) | ❌ **Fail** | **3.70:1** (unfixed base hue) | ❌ **Fail** |
| **circ** | **4.44:1** (first-pass fix) | ❌ **Fail** | **4.09:1** (unfixed base hue) | ❌ **Fail** |
| **adit** | 4.65:1 | ✅ Pass | **3.98:1** (was an alias to the base hue) | ❌ **Fail** — see v4 |

**v2 fix (superseded — see v3)** — darkened `trop`/`circ` against untinted `--paper-0` as a stand-in for the hover background: sup #8B641F (4.85:1 vs `#F7F4EC`), trop #9C5940, circ #607056.

**v3 — corrected background.** `--cat-trop-hover`/`--cat-circ-hover` are computed with `color-mix(in oklab, <hue> 12%, var(--paper-0))`. OKLab mixing is perceptually non-linear — the actual rendered backgrounds (`~#F1E3D8` for trop, `~#E5E5DA` for circ) turned out *lighter* than plain `--paper-0`, not simply "a light tint of it." The v2 fix, tuned against untinted `--paper-0`, only reached 4.27:1 (trop) / 4.19:1 (circ) against the real `color-mix()` output — both still failing. Recomputed the actual OKLab-mixed hex and darkened further:

| Category | Base hex | Darkened by | New hex | vs. actual `color-mix()` bg | vs. `#F7F4EC` (`.on`) |
|----------|----------|-------------|---------|-------------------------------|---------------------------|
| sup (`-on` only) | #C68F2C | 30% | #8B641F | — | 4.85:1 |
| trop (`-text` + `-on`) | #B8694B | 24% | #8C5039 | 5.03:1 (bg ≈ #F1E3D8) | 5.75:1 |
| circ (`-text` + `-on`) | #6B7C5F | 20% | #56634C | 5.04:1 (bg ≈ #E5E5DA) | 5.82:1 |

**v4 — the "assumed pre-validated" row was not validated.** Re-measured 2026-09-03 in Chrome, resolving every `var()` chain and every `color-mix(in oklab, …)` by painting the computed value to a canvas and reading the pixel back (the browser returns `oklab(…)` from `getComputedStyle`, so parsing its numbers as RGB silently produces nonsense — that mistake produced a false "all 8 categories fail" on the first pass of this re-audit).

The seven hex-valued categories all pass both pairings, confirming the v3 fix landed correctly (trop 5.03:1, circ 5.04:1 against their real `color-mix()` backgrounds). `adit` did not, and it was the one row the v2/v3 audits skipped:

| Category | Pairing | Before | After | Result |
|----------|---------|--------|-------|--------|
| adit (`-text`) | `--cat-adit-text` on `--cat-adit-hover` (#E3E3DF) | 3.70–3.98:1 | **5.10:1** | ✅ Fixed |
| adit (`.on`) | `--text-on-dark` on `--cat-adit` | 4.65:1 | 4.65:1 | ✅ Unchanged, passes |

Cause: `--cat-adit-text` was `var(--accent-blue-grey)` — the base hue used as its own text colour. Every other category has a *darkened* `-text` variant; `adit` never got one, because the audit treated "it's a design-system token" as evidence. It isn't: `--accent-blue-grey` passing AA somewhere else says nothing about it on a 12%-tinted background of itself. Darkened 15% → `#505F6D`.

**Lesson for the next audit**: "design-system token, assumed pre-validated" is not an audit result. Measure every row, including the ones you did not choose.

**When adding a new ingredient category**: compute contrast against the *actual resolved* foreground/background — trace `var()` chains all the way down (`--text-on-dark` is not white here), and if a background comes from `color-mix(in oklab, ...)`, resolve the real mixed hex rather than assuming it lands between the two input colors' luminances. Darken by the minimum percentage needed (5% increments), aiming a point or two past 4.5:1 for rounding margin, rather than stopping exactly at the threshold — this audit failed twice at exactly that margin.

#### Button State Tokens

| Token | Use | Value |
|-------|-----|-------|
| `--btn-bg` | Default button background | `var(--paper-0)` |
| `--btn-border` | Default button border | `var(--ink-900)` |
| `--btn-text` | Default button text | `var(--ink-900)` |
| `--btn-hover-bg` | Hover background | `var(--paper-50)` |
| `--btn-hover-shadow` | Hover shadow depth | `0 2px 4px rgba(11, 11, 11, 0.08)` |
| `--btn-active-transform` | Active state shift | `translateY(-1px)` |
| `--btn-disabled-opacity` | Disabled state opacity | `0.4` |

**Primary variant** (`.btn.pri`):
| Token | Value |
|-------|-------|
| `--btn-pri-bg` | `var(--moss-700)` |
| `--btn-pri-border` | `var(--moss-700)` |
| `--btn-pri-text` | `var(--paper-50)` |
| `--btn-pri-hover-bg` | `var(--moss-900)` |

**Dark variant** (`.btn.dark`):
| Token | Value |
|-------|-------|
| `--btn-dark-bg` | `var(--ink-900)` |
| `--btn-dark-border` | `var(--ink-900)` |
| `--btn-dark-text` | `var(--paper-50)` |
| `--btn-dark-hover-bg` | `var(--ink-700)` |

### Spacing Scale

Replaces 41 ad-hoc pixel values with a 14-step scale. Pick by **role**, not visual impression.

**Naming note**: this scale is namespaced `--sp-*`, not `--space-*`. The global design system (loaded via `_ds/…/tokens/spacing.css`) already defines `--space-1` through `--space-9` on `:root` as a 4–96px baseline grid (`--space-1: 4px` … `--space-9: 96px`) — a completely different scale used by pre-existing components (`.os-today-v2`, `.os-batch-detail-v2`, etc). An earlier version of this scale reused the `--space-*` names scoped to `.sim-root`, which silently shadowed the global tokens for everything inside `.sim-root` and collapsed those pre-existing components' spacing (e.g. `--space-7` dropping from 48px to 12px). Renamed to `--sp-*` to eliminate the collision — **never reintroduce a `--space-N` definition inside `.sim-root`**, and if you need a value from the *global* 4–96px scale, reference `var(--space-N)` directly (it resolves correctly since nothing shadows it anymore).

| Token | Value | Use |
|-------|-------|-----|
| `--sp-1` | 2px | Hairline gaps, micro-spacing |
| `--sp-2` | 3px | Tight spacing on dense grids |
| `--sp-3` | 4px | Button/input padding, badge margins |
| `--sp-4` | 6px | Preset chip gaps, icon spacing |
| `--sp-5` | 8px | List item padding, section gaps, form field spacing |
| `--sp-6` | 10px | Card internal spacing, category buttons |
| `--sp-7` | 12px | Recipe row padding, panel margins |
| `--sp-8` | 14px | Medium component margins |
| `--sp-9` | 16px | Standard padding, section margins, grid gaps |
| `--sp-10` | 20px | Large component spacing, batch calculator |
| `--sp-12` | 24px | Dashboard card gaps, heading margins |
| `--sp-14` | 28px | Large section breaks |
| `--sp-16` | 32px | Major layout spacing |
| `--sp-20` | 40px | Hero section gaps |

**Pattern**: Avoid direct px values in new CSS. Prefer `--sp-*` tokens. If you need a value not in the scale, add it here rather than inlining a px value.

### Motion Scale

Replaces 8+ scattered transition durations (.1s–.4s) with 5 role-based tokens. Full usage guidance in `COMPONENT_API.md` → Motion Tokens.

| Token | Value | Use |
|-------|-------|-----|
| `--duration-quick` | .12s | Micro-interactions: hover, active press |
| `--duration-standard` | .15s | Default: buttons, inputs, toggles |
| `--duration-entrance` | .22s | Element appearing: modal box, card slide-in |
| `--duration-exit` | .18s | Element leaving: modal backdrop, dismissal |
| `--duration-notice` | .3s | Toasts, banners |

All pair with the existing `--ease` cubic-bezier: `transition: background-color var(--duration-standard) var(--ease);`

### Responsive Spacing

Four "fluid" spacing tokens compress automatically at two breakpoints, so components that opt in don't need their own media queries.

| Token | Desktop | ≤900px | ≤480px |
|-------|---------|--------|--------|
| `--sp-fluid-tight` | `--sp-5` (8px) | `--sp-4` (6px) | `--sp-3` (4px) |
| `--sp-fluid-base` | `--sp-7` (12px) | `--sp-6` (10px) | `--sp-5` (8px) |
| `--sp-fluid-loose` | `--sp-9` (16px) | `--sp-7` (12px) | `--sp-6` (10px) |
| `--sp-fluid-section` | `--sp-12` (24px) | `--sp-9` (16px) | `--sp-8` (14px) |

**When to use fluid vs. fixed spacing**:
- Use `--sp-fluid-*` for: form field gaps, modal/panel padding, card grid gaps, section margins — anything that should visibly tighten as the viewport shrinks.
- Use fixed `--sp-N` for: icon gaps, badge/chip padding, hairline offsets — anything that must stay constant regardless of viewport (compressing these usually just looks broken, not "responsive").

Defined in `:root` (section 1) and overridden in two `@media` blocks in section 36 (end of file) — the token stays the same name everywhere, only its resolved value changes at the breakpoint. No per-component media query needed once a rule is authored with the fluid token.

```css
/* Before: fixed spacing needs its own breakpoint override */
.sim-root .some-panel { padding: 16px; }
@media (max-width: 480px) { .sim-root .some-panel { padding: 10px; } }

/* After: fluid token handles it automatically */
.sim-root .some-panel { padding: var(--sp-fluid-loose); }
```

---

## Component States

### Button (`.btn`, `.btn.pri`, `.btn.dark`)

| State | Selector | Behavior |
|-------|----------|----------|
| **Default** | `.btn` | Border + light bg, dark text |
| **Hover** | `.btn:hover` | Lighter bg, subtle shadow, -1px translate |
| **Active** | `.btn:active` | Reset translate, no shadow |
| **Disabled** | `.btn:disabled` | 40% opacity, cursor: not-allowed |

**Primary variant** (`.btn.pri`): Moss fill with white text. Disabled = same opacity.

**Dark variant** (`.btn.dark`): Ink fill with white text. Disabled = same opacity.

### Toggle Button (`.tog`)

| State | Selector | Behavior |
|-------|----------|----------|
| **Default** | `.tog` | Outlined, light bg (same as `.btn`) |
| **Hover** | `.tog:hover` | Lighter bg, shadow (same as `.btn:hover`) |
| **On** (active) | `.tog.on` | Solid ink fill, white text |
| **Disabled** | `.tog:disabled` | 40% opacity, cursor: not-allowed |

### Input Fields

- **Default**: `var(--paper-50)` background, soft border
- **Hover**: Slightly lighter, visible focus ring
- **Focus**: `--coral-500` border + outline
- **Disabled**: 40% opacity (inherited from `--btn-disabled-opacity`)

---

## Design Principles

### Color Assignment

1. **Ingredient categories** are fixed to specific earth tones — they don't change per variant or theme, because they encode *botanical material type*, not hierarchy.
2. **Interactive states** (hover, active, disabled) are applied uniformly across all buttons to ensure consistent interaction cost across the UI.
3. **Spacing** is role-based: form padding ≠ section margins ≠ grid gaps, even if they're numerically similar. Use the right token for the right job.

### When to Add a New Token

- If a value repeats in 3+ places, tokenize it.
- If a value doesn't fit the existing scale (colors, spacing, states), add it to the appropriate section here and document its role.
- Do not add tokens for one-off exceptions — use inline styles only if truly exceptional.

### Deprecated/Legacy

The following tokens are kept for backward compatibility with external scripts but should not be used in new CSS:

- `--T`, `--T-hover`, `--V`, `--B`, `--CR`, `--BG`, `--BR`, `--M`, `--MID`, `--SL`, `--WH`, `--TXT`, `--amber`, `--font-num`, `--font-sci`, `--shadow-hard`, `--ease`

Replace these with their referents if found in new code.

---

## Text on Dark Backgrounds

White text on colored/dark backgrounds now uses a unified token for consistency:

| Token | Use | Value |
|-------|-----|-------|
| `--text-on-dark` | Text on moss, ink, coral, olive, or other dark fills | `var(--paper-50)` |
| `--text-on-success` | Text on success/positive state backgrounds | `var(--paper-50)` |
| `--text-on-accent` | Text on accent-color backgrounds | `var(--paper-50)` |

## Surface Variants

Two specialized background tokens for UI patterns that don't fit the standard paper scale:

| Token | Use | Value | Text color |
|-------|-----|-------|-----------|
| `--surface-accent-soft` | Status badges, stock indicators (soft olive) | `#e8f0e0` | `--surface-accent-soft-text` |
| `--surface-accent-soft-text` | Dark olive text on soft olive background | `#3a5a28` | — |
| `--surface-selected` | Card selection highlight (cool blue-gray) | `#F4F7F8` | `--text-primary` |

## Component-Specific Colors

Some specialized UI elements use dedicated color tokens for semantic meaning:

| Token | Use | Value | Notes |
|-------|-----|-------|-------|
| `--color-norm-bar` | Normalization/balance indicators | #6B8E5A | Moss-green for positive status |
| `--color-investigacion` | Investigation/experimental modes | #f0b093 | Warm peach for exploratory states |

These colors are applied to specific features (perito analysis, form modes) and don't conflict with the general palette.

## Implementation Notes

- All ingredient category colors use `color-mix(in oklab, ...)` for the hover tint to ensure perceptually uniform lightness across the palette.
- Button disabled state uses opacity rather than desaturation or border changes, making it uniform across all button variants.
- Spacing tokens are defined in pixel values (not rem) because they're used in dense, fixed-layout components where relative units would create cascading size shifts.
- White text (`#fff`) replaced with `--text-on-dark` throughout. Pure white backgrounds (`#fff`, `#ffffff`) replaced with `--paper-0` (off-white for UI elements).
- Remaining hardcoded colors in CSS are either: (1) token names themselves (intentional hex values for ingredient categories), (2) fallback values inside `var()` expressions (CSS cascade pattern), or (3) single-use specialized colors with their own tokens. True inline `style=""` attributes are not used.

---

## Future Work

- **Small multiples**: If new ingredient categories appear, extend `--cat-*` following the same pattern (3 tokens per category: default, hover, text).
- **Dark mode**: Current tokens use `color-mix()` which works in both light and dark contexts. Test in production dark mode and adjust opacity/lightness ratios if needed.
- **Mobile**: Spacing scale is already dense; responsive overrides in mobile media query may need +1 step (e.g., `--sp-6` → `--sp-7`) for touch-friendly spacing.
