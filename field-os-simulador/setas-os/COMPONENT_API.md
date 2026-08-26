# Setas OS Component API

Production component specifications for `.sim-root` UI elements. Each component has defined variants, states, accessibility rules, and usage patterns.

---

## Button `.btn`

**Purpose**: Primary action control for recipe operations, modal confirmations, and workflow progression.

### Variants

| Class | Use | Background | Border | Text | Hover |
|-------|-----|------------|--------|------|-------|
| `.btn` (default) | Secondary actions | `var(--btn-bg)` | `var(--btn-border)` | `var(--btn-text)` | Lighter bg + shadow |
| `.btn.pri` | Primary/affirmative actions | `var(--btn-pri-bg)` | `var(--btn-pri-border)` | `var(--btn-pri-text)` | `var(--btn-pri-hover-bg)` |
| `.btn.dark` | Destructive/final actions | `var(--btn-dark-bg)` | `var(--btn-dark-border)` | `var(--btn-dark-text)` | `var(--btn-dark-hover-bg)` |

### States

| State | Behavior | CSS | Visual |
|-------|----------|-----|--------|
| **Default** | Ready to interact | `:not(:hover, :active, :disabled)` | Flat, no shadow |
| **Hover** | User has focused/pointed at button | `:hover` | Lighter background, subtle shadow, -1px Y translate |
| **Active** | User is pressing the button | `:active` | Reset Y translate, no shadow |
| **Disabled** | Action unavailable | `:disabled` | 40% opacity, `cursor: not-allowed` |
| **Focus** | Keyboard navigation | `:focus-visible` | Outline ring (inherited from form controls) |

### Sizing & Spacing

| Property | Value | Notes |
|----------|-------|-------|
| Min height | 44px | Touch-friendly minimum (mobile accessible) |
| Padding | 12px 18px | Button text comfortable spacing |
| Border radius | 0 | Square edges, laboratory aesthetic |
| Letter spacing | 0.14em | Uppercase tracking for emphasis |
| Font size | 9.5px | Condensed for dense layouts |
| Font weight | 800 | Bold for visual weight |

### Accessibility

- **Role**: Implicit `<button>` (use semantic HTML)
- **Keyboard**: Tab to focus, Enter/Space to activate
- **Screen reader**: Button text announces automatically
- **Disabled**: Communicate via `aria-disabled="true"` if using a div; prefer `<button disabled>`
- **Focus indicator**: Built-in via `:focus-visible` outline ring

### Code Example

```html
<!-- Default secondary action -->
<button class="btn">Cancel</button>

<!-- Primary affirmative action -->
<button class="btn pri">Save Recipe</button>

<!-- Destructive action -->
<button class="btn dark">Delete</button>

<!-- Disabled state -->
<button class="btn pri" disabled>Save (validation pending)</button>
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use `.btn.pri` for the main CTA | Use more than one `.btn.pri` per screen |
| Disable buttons during async operations | Remove buttons instead of disabling (breaks layout) |
| Use semantic `<button>` HTML | Use `<div role="button">` (breaks keyboard, screen readers) |
| Pair actions contextually (Save + Cancel) | Mix button variants randomly (confuses intent) |
| Use button text that describes the action | Use vague labels ("OK", "Submit") |

---

## Input `.rec-row input[type=number]`

**Purpose**: Numeric data entry for recipe ingredient quantities, formulation parameters, and batch calculations.

### Input Types Supported

| Type | Use | Validation | Example |
|------|-----|-----------|---------|
| `type="number"` | Ingredient quantities | Min/max, step size | `<input type="number" min="0" max="100" step="0.1">` |
| `type="text"` | Formula names, notes | None (free text) | `<input type="text" placeholder="Recipe name">` |
| `type="email"` | Contact fields (rare) | Email format | `<input type="email">` |

### States

| State | Appearance | CSS | Use |
|-------|-----------|-----|-----|
| **Default** | Soft border, light bg | `border: 1px solid var(--line-1)` | Ready for input |
| **Hover** | No visible change | N/A | Prepare for focus |
| **Focus** | Coral border + outline | `border-color: var(--coral-500); outline: 2px solid var(--coral-500)` | User is actively typing |
| **Filled** | Text visible | N/A | Value entered |
| **Error** | Red/attention border | `border-color: var(--accent-terracotta)` | Validation failed |
| **Disabled** | Grayed out | `opacity: 0.4; cursor: not-allowed` | Action unavailable |

### Sizing & Spacing

| Property | Value | Notes |
|----------|-------|-------|
| Min height | 44px | Touch-friendly |
| Padding | 9px 11px | Compact, vertical centering for numerics |
| Border radius | 0 | Consistent with buttons |
| Font family | `var(--font-mono)` | Monospace for numeric clarity |
| Font size | 12px | Readable for small values |
| Text align | center | Numbers centered for quick scanning |

### Validation & Behavior

```html
<!-- Number input with constraints -->
<input 
  type="number" 
  min="0" 
  max="100" 
  step="0.5"
  placeholder="0–100"
  aria-label="Ingredient percentage"
>

<!-- Text input with length limit -->
<input 
  type="text" 
  maxlength="50"
  placeholder="Recipe name (50 chars max)"
>
```

### Accessibility

- **Label**: Always pair with `<label for="inputId">`. If visual label hidden, use `aria-label`.
- **Placeholder**: Descriptive but not a substitute for label
- **Error messages**: Associate with `aria-describedby="error-id"` and display error text in element with that id
- **Focus**: Outline visible, color-adjacent to border for contrast
- **Screen reader**: Announces label, type (number/text), validation errors

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use `type="number"` for numeric-only fields | Use `type="text"` for numbers (allows invalid input) |
| Provide min/max/step constraints | Rely only on client-side validation (validate server-side too) |
| Label every input, visually or with aria-label | Use placeholder as the only label |
| Show validation errors inline next to input | Show errors in a summary far from the field |
| Disable inputs during processing (show loading state) | Remove inputs (breaks tab order) |

---

## Toggle `.tog`

**Purpose**: Binary state control for mode selection, recipe locking, and field notebook view options.

### Visual States

| State | Background | Text | Border | Use |
|-------|------------|------|--------|-----|
| **Off** (default) | `var(--btn-bg)` | `var(--btn-text)` | `var(--btn-border)` | Option not selected |
| **On** (`.on`) | `var(--ink-900)` | `#fff` | `var(--ink-900)` | Option selected/active |
| **Hover** (off) | `var(--btn-hover-bg)` | `var(--btn-text)` | `var(--btn-border)` | User considering toggle |
| **Disabled** | `var(--btn-bg)` | `var(--btn-text)` | `var(--btn-border)` | 40% opacity |

### Interaction Model

Toggles are **toggle buttons**, not checkboxes. They switch a binary state within a context (mode, view, lock).

```html
<!-- Toggle pair: mode selector -->
<div class="tog-group">
  <button class="tog on" data-mode="edit" aria-pressed="true">Edit Mode</button>
  <button class="tog" data-mode="view" aria-pressed="false">View Mode</button>
</div>

<!-- Single toggle: lock state -->
<button class="tog" id="recipe-lock" aria-label="Lock recipe" aria-pressed="false">
  🔓 Unlock
</button>

<!-- Toggle when on -->
<button class="tog on" aria-pressed="true">
  🔒 Locked
</button>
```

### States

| State | Selector | Behavior | Use |
|-------|----------|----------|-----|
| **Off (default)** | `:not(.on)` | Ready to toggle on | Default state |
| **On (active)** | `.on` | Toggled to active state | Selected option |
| **Hover** (off) | `:hover:not(.on)` | Light bg, shadow (same as `.btn:hover`) | User considering |
| **Disabled** | `:disabled` | 40% opacity, non-interactive | Action unavailable |

### Sizing & Spacing

| Property | Value | Notes |
|----------|-------|-------|
| Min height | 44px | Touch-friendly |
| Padding | 10px 16px | Slightly compact vs buttons |
| Border radius | 0 | Square, consistent |
| Letter spacing | 0.14em | Uppercase tracking |
| Font size | 9.5px | Same as buttons |
| Font weight | 800 | Bold for clarity |

### Accessibility

- **Role**: `<button>` (semantic HTML)
- **State**: Use `aria-pressed="true"` (on) or `aria-pressed="false"` (off)
- **Label**: Button text or `aria-label` describing the state being toggled
- **Keyboard**: Tab to focus, Enter/Space to toggle
- **Group behavior**: If toggles are part of a mutually-exclusive group, use `role="group"` on the container and manage `:focus-visible` carefully

### Code Example

```html
<!-- Recipe lock toggle -->
<button 
  class="tog" 
  id="lock-recipe"
  aria-label="Lock recipe to prevent accidental changes"
  aria-pressed="false"
  data-action="lock"
>
  Unlock
</button>

<!-- Mode switcher (mutually exclusive) -->
<div role="group" aria-label="View mode">
  <button class="tog on" aria-pressed="true" data-view="form">Form</button>
  <button class="tog" aria-pressed="false" data-view="table">Table</button>
  <button class="tog" aria-pressed="false" data-view="chart">Chart</button>
</div>
```

### Managed via JavaScript

Toggles often manage their own state or are controlled by a parent. Example pattern:

```javascript
const toggleBtn = document.getElementById('lock-recipe');

toggleBtn.addEventListener('click', () => {
  const isPressed = toggleBtn.getAttribute('aria-pressed') === 'true';
  toggleBtn.setAttribute('aria-pressed', !isPressed);
  toggleBtn.classList.toggle('on');
  toggleBtn.textContent = isPressed ? 'Unlock' : 'Lock';
});
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use `aria-pressed` to communicate state | Omit aria-pressed (screen readers can't announce state) |
| Update text content when toggled (Unlock → Lock) | Keep text static (confuses users) |
| Use in mutually-exclusive groups sparingly | Chain 5+ toggles (use a `<select>` instead) |
| Provide clear labels (what does "on" mean?) | Use cryptic labels ("Mode A / Mode B") |
| Confirm destructive toggles (lock, finalize) | Toggle without confirmation (risky operations) |

### When to Use Toggles vs Other Controls

| Use Toggle | Use Radio | Use Checkbox | Use Select |
|------------|-----------|-------------|------------|
| Binary state (on/off) | Mutually exclusive option (3–5 items) | Multiple selections | Many options (6+) |
| Within a feature (lock recipe) | Part of a form (view mode: list/table/grid) | Multiple features (show hints, dark mode) | Picking from a long list |
| Immediate feedback | Select then confirm | Set and forget | Browsing options |

---

## Integration with Spacing & Color Tokens

All components use the design system tokens for consistency:

### Colors Used

- **Buttons**: `--btn-*`, `--btn-pri-*`, `--btn-dark-*` for states
- **Inputs**: `--line-1`, `--paper-0`, `--paper-50`, `--coral-500` for focus
- **Toggles**: Same as buttons, plus `--ink-900` for active state

### Spacing Used

- **Buttons**: `--space-6` (padding), `--space-9` (gap in button groups)
- **Inputs**: `--space-4` (padding), `--space-5` (margin-bottom in forms)
- **Toggles**: `--space-6` (padding), `--space-4` (gap between toggles in groups)

---

## Dark Mode Readiness

All three components work in dark mode via existing token definitions. No special dark-mode CSS needed. Test behavior when:
- Button text remains readable on dark backgrounds
- Input focus ring is visible on dark surfaces
- Toggle active state (`--ink-900`) contrasts in dark mode (may need adjustment; monitor in production)

---

## Chip / Pill / Badge

**Purpose**: Compact status/category markers. Setas OS uses three near-identical patterns under different names (`.p-chip`, `.fos-chip`, `.pantry-chip`, `.opt-pill`, `.econ-pill`, `.ing-badge`, `.climate-actuator-badge`) — this section is the canonical spec new chips should follow instead of inventing a fourth variant.

### When to use which term

| Name | Use | Example |
|------|-----|---------|
| **Chip** | Removable or interactive filter/tag (has an action) | Ingredient category filter, active recipe tag |
| **Pill** | Small read-only status/value display | Optimizer score, economic delta |
| **Badge** | Count or state indicator attached to another element | Stock quantity on ingredient row, actuator on/off |

### Base spec (all three)

| Property | Value | Notes |
|----------|-------|-------|
| Padding | `--space-2` to `--space-5` (varies by density) | Chips denser than pills |
| Border radius | `var(--r-xs)` for chip/badge; pill-shaped (999px) only if named `.pill` | Squared = lab aesthetic; round = explicit exception |
| Font | `var(--font-mono)`, 9–12px | Numeric/status clarity |
| Font weight | 700 | Legible at small size |

### States

| State | Behavior |
|-------|----------|
| **Default** | Border + tinted background matching semantic color (e.g. `--cat-*`, `--surface-accent-soft`) |
| **Interactive (chip)** | `:hover` lightens background; `:active` on click if removable |
| **Selected** | Solid fill (same pattern as `.cat.on`) |
| **Disabled/stale** | 40% opacity, no pointer events |

### Code Example

```html
<!-- Chip: removable ingredient filter -->
<button class="p-chip" data-cat="base">
  Substrate base <span aria-hidden="true">×</span>
</button>

<!-- Pill: read-only score -->
<span class="opt-pill">Score: 87</span>

<!-- Badge: stock count -->
<span class="ing-stock-kg" aria-label="12 kilograms in stock">12kg</span>
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Reuse this spec for new chip/pill/badge components | Invent a 4th visual pattern for the same job |
| Use `--cat-*` tokens for category chips | Hardcode a new color per chip type |
| Make removable chips real `<button>`s | Use a `<span onclick>` (breaks keyboard access) |

---

## Card

**Purpose**: Bounded content container for dashboard summaries, species specimens, and thermal/climate readouts. Canonical pattern: `.dash-card` and `.spp-card`.

### Anatomy

| Part | Class | Purpose |
|------|-------|---------|
| Container | `.dash-card` | Outer bounds, border, shadow |
| Header | `.dash-card-top` | Eyebrow + title |
| Eyebrow | `.dash-card-spp` | Small uppercase metadata label |
| Title | `.dash-card-name` | Primary heading (display font) |
| Body | `.dash-card-body` | Key-value rows or content |
| Footer | `.dash-card-foot` | Action buttons (load/delete) |

### States

| State | Behavior | CSS |
|-------|----------|-----|
| **Default** | Flat, resting shadow | `box-shadow: var(--shadow-card-rest)` |
| **Hover** | Lifts, deeper shadow | `box-shadow: var(--shadow-card-hover); transform: translateY(-1px)` |
| **Selected** (`.spp-card.on`) | Highlighted background + checkmark badge | `background: var(--surface-selected)` |
| **Transition** | All state changes | `var(--duration-standard) var(--ease)` |

### Sizing & Spacing

| Property | Value |
|----------|-------|
| Border radius | `var(--radius-md)` (dash-card: 0, squared) |
| Border | `1px solid rgba(26,20,16,0.11)` |
| Grid gap (card grids) | `--space-9` (16px) |
| Internal padding | `--space-9` to `--space-10` |

### Code Example

```html
<div class="dash-card">
  <div class="dash-card-top">
    <p class="dash-card-spp">Pleurotus ostreatus · 2026-08-20</p>
    <h3 class="dash-card-name">Sustrato Café + Paja</h3>
  </div>
  <div class="dash-card-body">
    <div class="dash-kv"><span class="dk">C:N</span><span class="dv">28:1</span></div>
  </div>
  <div class="dash-card-foot">
    <button class="dash-sload">Load</button>
    <button class="dash-sdel">Delete</button>
  </div>
</div>
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Keep one primary action per card footer + one destructive | Stack 3+ footer buttons (crowds touch targets) |
| Use `--shadow-card-rest`/`--shadow-card-hover` pair | Invent a new shadow value per card type |
| Reserve `.on`/selected state for single-select contexts | Apply `.on` to multiple cards simultaneously in a single-select grid |

---

## Modal

**Purpose**: Focused overlay for category selection, confirmations, and detail views. Two canonical patterns: `.inv-modal` (compact, form-style) and `.cat-modal` (large, content-heavy).

### Anatomy

| Part | Class | Purpose |
|------|-------|---------|
| Backdrop | `.inv-modal-bg` / `.cat-modal-bg` | Fixed overlay, click-outside-to-close target |
| Box | `.inv-modal` / `.cat-modal-box` | The modal panel itself |
| Title | `.inv-modal-title` | Heading with bottom border |
| Close | `.cat-modal-close` | Circular ✕ button, top-right |

### Sizing Variants

| Variant | Width | Use |
|---------|-------|-----|
| `.inv-modal` | 440px, `calc(100vw - 32px)` on mobile | Confirmations, small forms |
| `.cat-modal-box` | 900px max, `calc(100vh - 64px)` | Category browsers, detail panels |

### Motion

| Event | Animation | Duration |
|-------|-----------|----------|
| Backdrop appears | `catFadeIn` | `var(--duration-exit)` (.18s) — reused as entrance timing |
| Box appears | `catSlideIn` | `var(--duration-entrance)` (.22s) |

### Accessibility

- **Role**: `role="dialog"` `aria-modal="true"` on the box
- **Focus trap**: Focus moves into modal on open, returns to trigger on close
- **Label**: `aria-labelledby` pointing to `.inv-modal-title` / modal heading
- **Keyboard**: `Escape` closes; `Tab` cycles within modal only
- **Close button**: `aria-label="Cerrar"` minimum — icon-only buttons must have a label

### Code Example

```html
<div class="inv-modal-bg" data-close-on-backdrop="true">
  <div class="inv-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 class="inv-modal-title" id="modal-title">Confirmar acción</h2>
    <p>¿Eliminar esta receta guardada?</p>
    <div class="act-row">
      <button class="btn">Cancelar</button>
      <button class="btn dark">Eliminar</button>
    </div>
  </div>
</div>
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use `.inv-modal` for anything ≤2 fields or a confirmation | Use `.cat-modal-box` for a simple yes/no |
| Trap focus and restore it on close | Let focus escape to the page behind the backdrop |
| Close on `Escape` and backdrop click | Require a click on the ✕ only (breaks expected UX) |

---

## Table

**Purpose**: Tabular data display for inventory, batch records, and pricing. Canonical pattern: `.inv-table`.

### States

| State | Behavior | CSS |
|-------|----------|-----|
| **Header** | Uppercase, tracked, tinted background | `background: var(--paper-200)` |
| **Row default** | Body text, bottom border | `border-bottom: 1px solid var(--paper-300)` |
| **Row hover** | Subtle highlight | `background: var(--paper-100)` |
| **Last row** | No bottom border | `tr:last-child td { border-bottom: none }` |
| **Inline link** | Underlined, coral, moss on hover | `.inv-table-link` |

### Sizing & Spacing

| Property | Value |
|----------|-------|
| Cell padding | `--space-5` `--space-7` (8px 12px) |
| Header font | 12px, weight 800, `--tracking-label` |
| Body font | `var(--font-mono)`, 13px |

### Accessibility

- **Structure**: Real `<table>`, `<th scope="col">`, never a div-grid pretending to be a table
- **Sortable columns**: If added, use `aria-sort` on the `<th>`
- **Row actions**: Inline `.inv-table-link` buttons need distinct, descriptive text (not "click here")

### Code Example

```html
<table class="inv-table">
  <thead>
    <tr><th scope="col">Insumo</th><th scope="col">Stock</th><th scope="col">Acción</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Cascarilla de arroz</td>
      <td>84kg</td>
      <td><button class="inv-table-link">Editar</button></td>
    </tr>
  </tbody>
</table>
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use a real `<table>` for tabular data | Fake tables with flex/grid divs (breaks screen readers) |
| Keep header labels short and scannable | Wrap header text across 3 lines |
| Provide an empty state when data is absent | Render an empty `<table>` with no rows and no message |

---

## Toast / Notice

**Purpose**: Transient confirmation feedback after an action (recipe loaded, save confirmed). Canonical pattern: `.loaded-toast`.

### Behavior

| Property | Value | Notes |
|----------|-------|-------|
| Entrance | `fadeInSlide var(--duration-notice) ease` | Slower than UI transitions — message needs to register |
| Auto-dismiss | App-controlled (typically 2–4s) | Not defined in CSS; set via JS timeout |
| Background | `var(--moss-500, --accent-olive)` | Success/positive semantic only — don't reuse for errors |

### Accessibility

- **Live region**: Wrap in `aria-live="polite"` so screen readers announce it without interrupting
- **Not a modal**: No focus trap; must not block interaction
- **Icon + text**: Always pair a checkmark/icon with text — never icon-only

### Code Example

```html
<div class="loaded-toast" role="status" aria-live="polite">
  <span aria-hidden="true">✓</span> Receta cargada
</div>
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use for confirmations only (loaded, saved) | Use for errors — build a distinct `.toast-error` with `--color-attention` instead |
| Auto-dismiss after 2–4s | Leave toasts on screen indefinitely |
| Use `aria-live="polite"` | Use `aria-live="assertive"` (interrupts screen reader mid-sentence) |

---

## Motion Tokens

Five duration tokens replace 8+ scattered values (.1s–.4s) previously inlined throughout `sim.css`. All pair with the existing `--ease` cubic-bezier unless a component specifies otherwise.

| Token | Value | Use |
|-------|-------|-----|
| `--duration-quick` | .12s | Micro-interactions: hover color/bg swap, active press, icon feedback |
| `--duration-standard` | .15s | Default for buttons, inputs, toggles — most transitions |
| `--duration-entrance` | .22s | Element appearing: modal box slide-in, card entrance |
| `--duration-exit` | .18s | Element leaving: modal backdrop fade, dismissal |
| `--duration-notice` | .3s | Toasts, banners — slower so the message registers before it can be missed |

**Pattern**: `transition: background-color var(--duration-standard) var(--ease);`

**When adding a new transition**: pick the token matching the *role* of the motion (not the effect that "looks right"). A hover state is always `--duration-quick`, a modal is always paired `--duration-exit` (backdrop) + `--duration-entrance` (box), regardless of what property is animating.

One-off animation durations (`spin 0.8s linear`, `qaPulse .5s ease-out`, `rowFlash .65s ease-out`) are intentionally excluded from the scale — they're single-purpose keyframe animations, not reusable interaction timing.

---

## Testing Checklist

- [ ] Default state renders correctly
- [ ] Hover state visible and responsive
- [ ] Active/pressed state updates with click
- [ ] Disabled state non-interactive
- [ ] Focus outline visible with keyboard navigation
- [ ] Screen reader announces all text and states
- [ ] Mobile (44px min-height) touch targets work
- [ ] Dark mode contrast acceptable
- [ ] Form submission works with inputs/buttons
- [ ] Validation errors display and clear properly
