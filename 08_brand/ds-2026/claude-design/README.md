# Setas de la Peña · DS-2026

Design system for a mushroom farm at 2.600 m in Tenjo, Colombia. One system
covers field operations (lot records, substrate recipes, room signage, SOPs)
and customer-facing surfaces (packaging, fichas, market cards).

Everything is plain CSS custom properties and BEM-ish classes. **No React, no
build step, no runtime.** You style with the classes below and the `var(--*)`
tokens — do not invent class names, and do not introduce a raw hex.

## Setup

There is no provider and no wrapper component. Load the one stylesheet:

```html
<link rel="stylesheet" href="styles.css">
```

`styles.css` is the whole system — it `@import`s the fonts, tokens, base layer
and every component, in that order. Nothing else needs importing.

**Density is a mode, set with an attribute on any container:**

```html
<body data-mode="field">   <!-- archive | field | control -->
```

`archive` (gutter 32px) for editorial and print · `field` (24px) is the default
for reports and labels · `control` (12px) for dense dashboards. The mode drives
`--gutter` and `--page-margin`; it does not change the column count, which is
always 12.

## The styling idiom

**Colour — eight roles.** Use the semantic alias where one exists.

| Token | Use |
|---|---|
| `--paper` `--paper-panel` `--paper-recessed` | page ground · panels · wells |
| `--ink` `--ink-muted` | primary text · secondary text and captions |
| `--rule` | hairlines, frames, table borders |
| `--soil` | infill, inverted signage ground, proportion bars |
| `--moss` / `--moss-tint` | OK · in-spec · active |
| `--rust` / `--rust-tint` | **error and contamination only** |
| `--warning` / `--warning-tint` / `--warning-text` | caution |

Semantic aliases: `--surface-page`, `--surface-panel`, `--surface-recessed`,
`--surface-inverse`, `--text-primary`, `--text-secondary`, `--text-metadata`,
`--text-inverse`, `--border-hairline`, `--border-heavy`, `--status-ok`,
`--status-warn`, `--status-error`, `--focus-ring`.

> **`--warning` is 2.39:1 on paper.** Use it as a fill or a bar with `--ink` on
> top, or as the 4px leading rule of a banner. **Never as text.** When ochre
> must be the text colour use `--warning-text`.

**Type — nine roles, as classes or as `font:` shorthand tokens.**

`.t-display-01` `.t-display-02` `.t-heading-01` `.t-heading-02` `.t-heading-03`
`.t-species` `.t-latin` `.t-body` `.t-small` `.t-data` `.t-label` `.t-micro`

The matching tokens are `--t-display-01` … `--t-micro`, usable as
`font: var(--t-body)`. Families: `--font-editorial` (Gaya Patched — species and
titles), `--font-sans` (IBM Plex Sans — prose), `--font-mono` (IBM Plex Mono —
metadata; always uppercase, always `letter-spacing: var(--tracking-label)`).

**Space — 8px steps.** `--space-1` (8px) through `--space-9` (96px), plus
`--space-half` (4px), the only sub-8 value. Grid: `.grid` with `.col-1`…`.col-12`.

**Structure.** `--rule-hairline`, `--rule-heavy`, `--rule-frame`,
`--radius-none`, `--radius-sm` (2px), `--tap-target-min` (44px).
`--shadow-none` is the only legal shadow.

## Components

`.sdp-ficha` · `.sdp-lote` · `.sdp-receta` · `.sdp-table` · `.sdp-alert` ·
`.sdp-nav` · `.sdp-tele` · `.sdp-sign` · `.sdp-pack` · `.sdp-sop`
Atoms: `.sdp-species` · `.sdp-plateline` · `.sdp-statusline` · `.sdp-fig` · `.sdp-sep`

State modifiers are `--ok`, `--warn`, `--error` on `.sdp-lote`, `.sdp-alert`
and `.sdp-tele`. Figure variants are `.sdp-fig--plate` (4:5, `contain`),
`--specimen` (1:1), `--cultivation` (3:2), `--ingredient` (64px), `--diagram` (16:9).

## The editorial layer (Archive only)

On `data-mode="archive"` surfaces — fichas, plates, packaging inserts, printed
SOP covers — running text set inside `.ed-prose` switches to **Gaya Patched
Light 17.5px**, measure 58ch. Field and Control keep IBM Plex Sans. That
contrast is deliberate: the archive reads like a journal, the field reads like
an instrument.

`.ed-prose` · `.ed-lede` · `.ed-drop` (three-line cap) · `.ed-eyebrow` ·
`.ed-sec` (`__k` `__h`) · `.ed-folio` (`__t` `__n`, `--foot`) · `.ed-div`
(`__m`) · `.ed-cartouche` (`__n` `__l` `__d`) · `.ed-note` (`__k`) · `.ed-cols`

**Always write chemical formulae as `<span class="chem">CO₂</span>`.** Gaya
draws U+2082 at full size, so an unwrapped `CO₂` in editorial prose reads as
"CO2". `.chem` routes just the formula to the sans, which has a true subscript.

## Rules that are not negotiable

- **No shadows, no gradients, no glass.** Depth is a rule, never a blur.
- **One accent per view.** Colour is classification or state, never decoration.
- **Status is colour AND word** — never a colour alone; it must survive a
  photocopy and a colour-blind reader.
- **Biological imagery is evidence**: frame + image + caption, or it does not ship.
- **Latin binomials are always italic**, sentence case: *Ganoderma lucidum*.
- **Prose never below 16px.** Operative content never below 13px.
- Customer-facing surfaces never expose lot codes, room names or operator names.

## An idiomatic example

```html
<div data-mode="field">
  <article class="sdp-lote sdp-lote--warn" style="width: 300px">
    <div class="sdp-lote__media sdp-lote__media--plate">
      <img src="assets/img/hericium-erinaceus-plate.svg" alt="">
    </div>
    <div class="sdp-lote__body">
      <div class="sdp-species sdp-species--compact">
        <div class="sdp-species__common">Melena de león</div>
        <div class="sdp-species__latin">Hericium erinaceus</div>
      </div>
      <div class="sdp-lote__id">LOTE 026 · HER-01</div>
      <div class="sdp-lote__status">
        <span class="sdp-lote__state">CO₂ alto</span>
        <span class="sdp-lote__bar"><span style="width: 88%"></span></span>
      </div>
      <div class="sdp-lote__meta">
        <div><span class="sdp-lote__mk">Sala</span><span class="sdp-lote__mv">03</span></div>
        <div><span class="sdp-lote__mk">HR</span><span class="sdp-lote__mv">86 %</span></div>
        <div><span class="sdp-lote__mk">CO₂</span><span class="sdp-lote__mv">1240</span></div>
      </div>
    </div>
  </article>
</div>
```

For your own layout glue, use the grid and the space tokens —
`gap: var(--space-3)`, `border-top: var(--rule-hairline)` — rather than
hand-rolled values.

## Where the truth lives

`styles.css` and its imports: `tokens/tokens.css` (every token, commented),
`tokens/fonts.css`, `components/base.css` (reset, type classes, grid),
`components/components.css` (all components, with the rules inline as comments).
Read those before styling — they are authoritative over this summary.
