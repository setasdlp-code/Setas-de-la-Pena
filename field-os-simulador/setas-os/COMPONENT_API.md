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
