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

Each category has three states: default (border), hover (tinted background), and active (solid fill).

| Token | Use | Default | Hover | Active text |
|-------|-----|---------|-------|------------|
| `--cat-base` | Legumes, cereals, substrate bases | #5A7042 | 12% tint | #3a4f2a |
| `--cat-cafe` | Composted coffee, fermented media | #7A4A2F | 12% tint | #7A4A2F |
| `--cat-sup` | Premium/supplement layers | #C68F2C | 12% tint | #8B6014 |
| `--cat-est` | Stabilizers, structural amendments | #6B4E31 | 12% tint | #6B4E31 |
| `--cat-local` | Locally-sourced materials | #7A5A3F | 12% tint | #7A5A3F |
| `--cat-trop` | Tropical specialty materials | #B8694B | 12% tint | #B8694B |
| `--cat-circ` | Circular/waste materials, by-products | #6B7C5F | 12% tint | #6B7C5F |
| `--cat-adit` | Additives, amendments, biotech | `--accent-blue-grey` | 12% tint | `--accent-blue-grey` |

**Usage**: Applied to ingredient badges, category tabs, and ingredient list filters. The color encodes ingredient *function* in the recipe, not visual hierarchy.

```css
.cat[data-cat="base"] {
  border-left: 3px solid var(--cat-base);
}
.cat[data-cat="base"]:hover {
  background: var(--cat-base-hover);
  color: var(--cat-base-text);
}
```

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

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 2px | Hairline gaps, micro-spacing |
| `--space-2` | 3px | Tight spacing on dense grids |
| `--space-3` | 4px | Button/input padding, badge margins |
| `--space-4` | 6px | Preset chip gaps, icon spacing |
| `--space-5` | 8px | List item padding, section gaps, form field spacing |
| `--space-6` | 10px | Card internal spacing, category buttons |
| `--space-7` | 12px | Recipe row padding, panel margins |
| `--space-8` | 14px | Medium component margins |
| `--space-9` | 16px | Standard padding, section margins, grid gaps |
| `--space-10` | 20px | Large component spacing, batch calculator |
| `--space-12` | 24px | Dashboard card gaps, heading margins |
| `--space-14` | 28px | Large section breaks |
| `--space-16` | 32px | Major layout spacing |
| `--space-20` | 40px | Hero section gaps |

**Pattern**: Avoid direct px values in new CSS. Prefer `--space-*` tokens. If you need a value not in the scale, add it here rather than inlining a px value.

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
- **Mobile**: Spacing scale is already dense; responsive overrides in mobile media query may need +1 step (e.g., `--space-6` → `--space-7`) for touch-friendly spacing.
