# Setas OS — Mobile Field Surface Review

**Date:** 2026-08-30 · **Scope:** the mobile surface exercised by `e2e/mobile.spec.js` (390px viewport: bottom `.app-rail`, `.workspace-subnav` tabs, `species-bridge`, and the Formular/Producción/Bitácora/Control workspaces reachable from them) · **Baseline:** `main` · **Mode:** review only, no code changes.

**Context this review weighs findings against:** farm staff, on phones, often with gloved hands, in a humid growing room with variable daylight (glare is common, connectivity is not guaranteed). Touch-target size, contrast under glare, and one-handed reach are treated as more load-bearing than visual polish.

Findings are grouped by **field impact** (would this actually stop or slow down a gloved worker in the room) rather than by WCAG numbering. Within each finding, "Guideline" states what standard it also happens to violate; "Field scenario" states the concrete failure a worker hits. These are kept separate deliberately — several items fail a guideline without being a field blocker, and one item (the gloves-mode dead code) is a field blocker that isn't really a generic WCAG citation at all.

---

## Tier 1 — Would actually fail a gloved user in a humid room

### 1. "Modo guantes" (gloves mode) has no way to turn it on — the app's one feature built for this exact context is unreachable

- **File:** [Setas OS v5.dc.html:3689-3691](Setas%20OS%20v5.dc.html#L3689-L3691)
- **What's there:** `gloves`, `glovesLabel`, and `toggleGloves` are computed every render (`shellCls: s.gloves?'gloves':''`), and the CSS payoff exists and is real — `.gloves button, .gloves label { min-height:56px; }`, `.gloves .rail-btn { min-height:64px; }`, `.gloves textarea, .gloves input { font-size:17px !important; }` ([Setas OS v5.dc.html:201-204](Setas%20OS%20v5.dc.html#L201-L204)).
- **The gap:** neither `glovesLabel` nor `toggleGloves` is referenced anywhere in the template markup (`{{ }}` bindings). There is no button, switch, or menu item anywhere in the mobile shell that calls `toggleGloves`. `s.gloves` can only ever be `false` — it's initialized `false` at [line 2153](Setas%20OS%20v5.dc.html#L2153) and nothing in the rendered UI can flip it.
- **Field scenario:** a worker pulls on nitrile/rubber gloves before entering the growing room, opens the app to log a reading or check a batch, and there is no control anywhere to widen the tap targets for gloved fingers — because the control was never wired to the screen. The 44-48px default targets (see #2) are what they're stuck with, gloves or not.
- **Guideline:** not really a WCAG citation — this is closer to a shipped-but-disconnected feature. Worth flagging as such rather than filing it as 2.5.5.
- **Priority:** highest in this review. It's a single missing button binding, and it's the one accommodation the product already decided this context needed.

### 2. Species-bridge stat labels and status text shrink to 6.5–8px on phones — unreadable under glare, not just "small"

- **File:** [sim.css:1992, 1997, 2008](sim.css#L1992-L2008)
- **What's there:** at `≤900px`, `.bridge-activo{font-size:8px!important}` and `.bridge-stat-lbl{font-size:6.5px!important}`; at `≤480px`, `.bridge-activo{font-size:7px!important}`.
- **Field scenario:** the species-bridge is the bar that tells a worker which species/batch context they're currently acting in — exactly the thing you'd glance at before logging a reading to confirm you're on the right batch. At 6.5-8px, that confirmation text is below what's legible on a phone at arm's length even indoors; direct or reflected daylight on the screen (the stated growing-room condition) makes it effectively invisible, not just hard to read. A worker will act on the wrong batch context because they couldn't verify it, not because they didn't look.
- **Guideline:** WCAG 1.4.4 (resize text) is nominally about zoom support, but the practical guidance against text below ~9-10px on mobile applies here directly.
- **Priority:** high — this sits on the field-verification path (confirm-batch-before-you-log), not a decorative label.

### 3. "Más" (More) workspace tabs render into a hidden horizontal scroller, not a visible menu

- **File:** [Setas OS v5.dc.html:253-260](Setas%20OS%20v5.dc.html#L253-L260), CSS at [Setas OS v5.dc.html:144](Setas%20OS%20v5.dc.html#L144)
- **What's there:** `.workspace-subnav` is `overflow-x:auto` with `scrollbar-width:none` / `::-webkit-scrollbar{display:none}` — a horizontally-scrolling tab strip with the scrollbar deliberately hidden. Tapping "Más" (`aria-expanded`) doesn't open a dropdown or sheet; it appends more `workspace-tab.secondary` buttons into that same scroll row.
- **Field scenario:** on a 390px screen the primary tabs likely already fill or nearly fill the strip. A worker taps "Más" expecting the extra options to appear — nothing visibly changes, because the new buttons landed off-screen to the right in a scroll container with no visible scrollbar and no arrow/chevron affordance. With gloved hands (worse tactile feedback, more likely to treat "nothing happened" as a missed tap and tap again, or give up) this reads as the button being broken.
- **Guideline:** roughly 1.3.1/4.1.2 territory (state change with no perceivable indication) but really a straightforward interaction bug.
- **Priority:** high — it's a live control on a workflow the mobile spec explicitly exercises (workspace switching), and the failure mode is silent.

### 4. Mobile performance floor is set to accept a ~10s LCP — on the connectivity this context actually has

- **File:** [lighthouserc.cjs:34-69](lighthouserc.cjs#L34-L69)
- **What's there:** `PERF_FLOOR = 0.35` (own comment: "LCP simulates at ~10.2s on throttled mobile... the app renders its entire UI... unconditionally, regardless of auth state or active tab"), later re-measured worse (TBT ~2.0s) after a bundle-size increase. LCP and TBT are set to `"warn"`, not `"error"`, specifically so this doesn't block merges.
- **Field scenario:** this is a known, already-diagnosed issue (not new), but it's squarely in scope for a mobile field review: a growing room is exactly the kind of location with weak or no Wi-Fi and patchy cellular. A 10-second-plus load before the login screen is even interactive, on a connection that's often worse than the throttled-4G profile Lighthouse tests, means the tool is frequently not usable at the point of need. This isn't a contrast or tap-target nit; it's the app failing to render before the worker moves on.
- **Guideline:** Core Web Vitals / WCAG 2.2.1 (timing) adjacent, but functionally this is closer to "app doesn't load" than an accessibility footnote.
- **Priority:** flagging for visibility even though it's already tracked and explicitly out-of-scope-for-now in that file's own comments — it's the single biggest number in this review and belongs in the same ranked list as the others, not left implicit in a config comment.

---

## Tier 2 — Fails a guideline, worth fixing, not a field blocker on its own

### 5. "Ver catálogo" species-bridge button is a small, unenforced tap target next to a similarly small native `<select>`

- **File:** simulador-app.jsx (species-bridge markup, `.bridge-cambiar` button) and [sim.css:1448-1458](sim.css#L1448-L1458) (`.bridge-select`)
- **What's there:** `.bridge-cambiar` has no `min-height` anywhere in `sim.css` — its rendered height is whatever `padding:6px 12px` + an 11.5px font line-box produces (roughly mid-20s px), well under the 44px minimum that `.cat` and `.workspace-tab` elsewhere in the same codebase already enforce. `.bridge-select` sits directly next to it at `padding:5px 7px` / `font-size:10px` on `≤600px`.
- **Field scenario:** on first opening a new batch (no species picked yet), "Ver catálogo" is the primary action to get started — and it's the smallest, least gloved-thumb-friendly button on that screen, sitting right beside another small control. A mis-tap opens the wrong control or misses both.
- **Guideline:** WCAG 2.5.5 (target size, ~24px vs. the 44px this codebase uses everywhere else).
- **Priority:** medium — real risk, but it's an entry-point action rather than something repeated dozens of times per shift.

### 6. Two of eight ingredient-category colors still fail contrast against their real rendered background — and are exactly the categories relying purely on color at mobile sizes

- **File:** [DESIGN_TOKENS.md:59-78](DESIGN_TOKENS.md#L59-L78) (already self-documented, not new), CSS at `.cat[data-cat="trop"]` / `.cat[data-cat="circ"]` rules in sim.css (~line 2479+)
- **What's there:** the token doc's own v3 audit shows `trop` and `circ` still fail 4.5:1 in their `-text`/hover pairing (3.70:1 / 4.09:1 unfixed base hue) even in the audit's lab conditions (no glare modeled).
- **Field scenario:** at mobile widths, `.cat` badge text drops to 7-8px ([sim.css:1196, 1328]) — small enough that a worker is already leaning on badge *color*, not the label text, to tell ingredient categories apart while formulating a substrate recipe. Two of those colors are the ones documented as under-contrast. Under glare (which further compresses perceived contrast beyond what a photometric ratio captures), the pairing becomes color-only, low-contrast identification for a step that feeds directly into the C:N/EB calculation — a real misclassification risk, not a cosmetic one.
- **Guideline:** WCAG 1.4.3 (this is the same failure the design doc already tracks).
- **Priority:** medium — already known and tracked in DESIGN_TOKENS.md; this review's contribution is connecting it to the mobile font-size context that makes it worse than the desktop-only lab numbers suggest.

### 7. Gloves-mode state isn't persisted — even once wired up, it resets every reload

- **File:** [Setas OS v5.dc.html:2153, 3691](Setas%20OS%20v5.dc.html#L2153-L3691)
- **What's there:** `gloves:false` lives in component state with no `localStorage`/persistence read or write anywhere near `toggleGloves`.
- **Field scenario:** this only matters once #1 is fixed, but it's worth deciding now rather than re-discovering it later: a worker who turns gloves mode on, then the app reloads (PWA refresh, tab backgrounding on a flaky connection, a new session next shift) loses the setting silently and has to remember to re-enable it every time — for a mode whose entire point is "don't make me fumble with small controls." Filing alongside #1 since they'll likely be fixed together.
- **Guideline:** no direct WCAG citation — a state-persistence gap, not an accessibility criterion.
- **Priority:** low on its own, but pair with #1 rather than let it become a second round-trip.

---

## Explicitly out of scope for this review (checked, not a problem)

- **Pinch-zoom / text scaling:** the viewport meta tag is `width=device-width, initial-scale=1` with no `maximum-scale` or `user-scalable=no` — zoom is not disabled. Good.
- **Bottom-rail touch targets:** `.rail-btn` on mobile is `min-height:48px` (flex `25%` width each), already above the 44px WCAG minimum, independent of gloves mode.
- **Inactive-tab text contrast:** `--ink-2` (#6B6759) on `--paper-0` (#F7F4EC) computes to ~5.17:1 — passes 4.5:1 with margin even before considering the icon is the primary identifier.
- **species-bridge / rail overlap:** already covered by `e2e/mobile.spec.js` (E2E-10) and confirmed by the CSS (`z-index` layering between `.species-bridge` at `z-index:50` and `.app-rail` at a lower nav tier).

---

## Summary for the human read-through

Ranked by what would actually stop a gloved worker in the room, not by WCAG section number:

1. **Gloves mode has no on-switch** — the one field-specific accommodation in the codebase is dead code.
2. **Species-bridge labels shrink to 6.5-8px on phones** — unreadable under glare on the batch-confirmation bar.
3. **"Más" tab menu opens into an invisible scroll region** — a live control that silently does nothing from the user's point of view.
4. **Mobile load time floor accepts ~10s LCP** — already tracked, but the single biggest number in this review, and this context has exactly the weak connectivity that makes it worse than lab-measured.
5. **"Ver catálogo" button is an unenforced small tap target** next to a similarly small `<select>`.
6. **Two ingredient-category colors fail contrast** in exactly the size range where mobile users are reading color, not text.
7. **Gloves mode wouldn't persist** even once switched on — pair with fix #1.

No code changes made in this pass, per scope. Waiting on which of these to act on.
