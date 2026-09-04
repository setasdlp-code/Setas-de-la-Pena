# Setas OS — Design & UX Skills

Which agent skills to reach for when changing this app's interface, and which to
avoid. Written 2026-09-03 so the choice doesn't get re-litigated every session.

Siblings: [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md) (the token system),
[`SETAS_OS_UX_ARCHITECTURE_V2.md`](SETAS_OS_UX_ARCHITECTURE_V2.md) (IA, lifecycle,
§14 field-vs-desk density), [`MOBILE_A11Y_REVIEW_2026-08-30.md`](MOBILE_A11Y_REVIEW_2026-08-30.md)
(the open field backlog).

---

## The constraint that decides everything

Setas OS is **not** a greenfield site. It is a large operational app (840K
`simulador-app.jsx`, 232K `sim.css`) with an established token system, a written
IA, and a documented a11y backlog. Its users are farm staff on phones, gloved,
in a humid growing room, under glare, on unreliable connectivity.

So the useful skills are **audit-first and constraint-driven**. Skills that
generate a fresh aesthetic will fight `DESIGN_TOKENS.md` and lose — or worse,
win.

---

## Core stack

| Skill | Use it for | Why it fits here |
|---|---|---|
| `mcpmarket-me:mobile-design` | Touch targets, thumb zone, type floors, gloved-hand interaction | Reasons about the actual field context. Its floors (44–48px targets, 11px captions, 12px secondary text) are the numbers Tier 1 of the a11y review is measured against. |
| `web-interface-guidelines` | Reviewing UI code you just wrote | Mechanical catch-net: focus states, hover states, `aria-label` on icon-only buttons, `touch-action`, contrast. Run it *after* a change, on the changed surfaces. |
| `frontend-lighthouse` | The CWV gate in `lighthouserc.cjs` | Turns performance from a comment into a contract. Owns item 4 of the review. |
| `ui-ux-pro-max:design-system` | Token layer work | Three-layer tokens (primitive → semantic → component); the natural next step for `DESIGN_TOKENS.md`'s "Future Work". |
| `dataviz` | **Mandatory** before any chart code or chart colors | `climate-dashboard`, `climate-bench.html`, `climate-math.js`, `recipe-optimizer.js`. Also carries the accessible-palette validator — relevant given the two categories already failing contrast (review item 6). |

## Situational

- `taste-skill:redesign-skill` — broad visual pass on a whole surface, audit-first,
  no rewrites. (`redesign-existing-projects` is a near-duplicate; pick one.)
- `ui-ux-pro-max:ui-ux-pro-max` — as a **lookup** (its 98 UX guidelines), not a generator.
- `frontend-design:frontend-design` — only for genuinely new surfaces, never for
  reshaping screens that already conform to the tokens.

## Skip

`gpt-taste`, `premium-3d-website`, `high-end-visual-design`, `emil-design-eng`,
`design-it`, `banner-design`, `minimalist-ui`, `stitch-*`, `soft-skill` — all
marketing/greenfield-shaped.

**The trap: `industrial-brutalist-ui`.** It reads like a perfect thematic match —
rigid grids, high-density data, tactical telemetry. It is not. Extreme type-scale
contrast, CRT degradation and stark utilitarian color are precisely wrong for a
gloved worker reading a phone in glare. The review's Tier 1 #2 is *text shrinking
below legibility*; that skill would institutionalize the failure.

---

## Working order

1. Start from `MOBILE_A11Y_REVIEW_*.md`, not from a skill. The backlog is written.
2. `mcpmarket-me:mobile-design` over the specific surfaces.
3. `web-interface-guidelines` to verify what you produced.
4. Performance is an independent track — `frontend-lighthouse`, never bundled
   into a UX change.

### Two constraints that bite

- **`main` is protected** (`CLAUDE.md`). Branch per task.
- **Tests pin the shell's structure.** `navigation-workspaces.test.js` asserts the
  literal `<nav class="app-rail" aria-label="Espacios de trabajo">` tag, the
  `.rail-btn { flex:1 1 25%; … min-height:48px; }` rule, and
  `.workspace-subnav { position:sticky; top:0;`. `e2e/mobile.spec.js` asserts the
  rail never scrolls horizontally. Read those before moving chrome around — they
  ruled out putting the gloves toggle in the rail.

### Browser-testing this app

The shell is Firebase-gated. See the recipe in agent memory
(`feedback-ui-testing-playwright-harness`): throwaway harness + `sim-root` class +
Playwright with `channel:'chrome'`. For pure CSS changes, a static fixture of just
the affected component against `sim.css` is far cheaper than booting the app.

---

## Applied so far

2026-09-03, branch `fix/mobile-field-tier1` — review items 1, 2, 3 and 7:

- **1 + 7** gloves mode: toggle wired into `.workspace-subnav` (sticky-left so it
  can't scroll out of reach), state persisted via the existing `persist()` key list.
- **2** species-bridge type floor: 6.5–8px → 11px, stat values → 13px. Verified in
  Chrome at 390/700px — no overflow.
- **3** "Más": items moved out of the hidden `overflow-x` scroller into a normal-flow
  panel below the subnav, with `aria-haspopup`/`aria-controls`.
- **4** `lighthouserc.cjs` re-measured. The config's "~10.2s LCP / ~2.0s TBT" was
  **stale**: actual median is LCP 3307ms, TBT 16ms, performance 0.87. The
  2026-09-02 auth-gate change had already fixed it. TBT promoted warn → error,
  `PERF_FLOOR` 0.35 → 0.70, LCP gated on a ratcheting ceiling.
