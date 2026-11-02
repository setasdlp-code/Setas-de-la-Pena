# Home redesign audit and implementation plan · 1 November 2026

Audited page: https://setas-de-la-pena.pages.dev/home, plus the repo's own `index.html` served locally (`public-web` in `.claude/launch.json`, port 4187).
Checklist: taste-skill `redesign-skill`, read against DS-2026 (`08_brand/ds-2026/`) and `docs/brand-guidelines.md`.
Viewports checked: 375, 1024, 1440 and 1920 px.
Scope: audit and plan only. No code was changed.

## 0. Summary

The home page is already distinctive. It has its own type system (Gaya with IBM Plex), a warm paper and ink palette, no radii or drop shadows, real engravings and plain copy, and none of the usual template look. The problems are smaller and more specific:

1. **The live site is behind `main`.** Cloudflare Pages is published by a manual export (`scripts/export_public_website.py`). `deploy.yml` only publishes Setas OS to GitHub Pages. PR #438's species strip and engraving caption aren't live.
2. **The hero's colour intent is cancelled.** `home-hero.css` uses moss for the headline and coral for *a la mesa.*, but `home-catalog.css:3-15` resets every accent token to ink on `.home-page`. The result is monochrome, and it's an accident rather than a decision. **Decided:** use more of the DS-2026 accent set, each colour with a fixed role (Phase 2).
3. **The same three species appear twice in a row.** The hero strip (shiitake, melena, eryngii) sits directly above the catalog of the same three. On mobile they're less than one screen apart.
4. **A few small bugs and gaps in interaction states**: an empty location strip on mobile, two link styles inside the same card, no pressed state on the main call to action, no `aria-current`, and dead CSS from earlier home versions.
5. **Thin content.** The page promises *Conocer la seta. Imaginar el plato.* but no dish appears on it. Recetas, Restaurantes and Mundo micelar only show up in the top nav.

## 1. Skill rules this plan doesn't follow, and why

| Skill default | Decision | Reason |
| --- | --- | --- |
| Swap the font (Geist, Satoshi, …) | **Keep Gaya with IBM Plex** | It's the DS-2026 system and already has character. |
| All-caps labels are generic | **Keep the mono caps `.t-label`** | It's the DS label style. Only check that it isn't overused (see 4.3). |
| Background photos and picsum placeholders | **None** | Brand §3: an illustration doesn't prove harvested product. No stock or product-looking photos. |
| Use a single accent colour | **Use the DS-2026 accent set, each colour with a fixed role** (Sebastián, 1 Nov 2026) | The DS already defines moss, terracotta, slate and ochre (`tokens.css`, `color-bands.css`). Fixed roles keep it from turning into a rainbow. See Phase 2. |
| Avoid three equal card columns | **Optional** | Exactly three species presented as herbarium plates is a deliberate choice. See 5.2. |
| Add legal links and a cookie banner | **Only if the site starts collecting data** | The home page sends nothing and sets no cookies. Revisit if the shiitake inquiry form starts sending. |
| Invent believable numbers | **Never** | Brand §3: no claim without data. Keep «Disponibilidad por confirmar». |

## 2. Findings

Severity: **H** = visible bug or broken intent · **M** = clear quality gain · **L** = polish.

### Delivery
| # | Sev | Finding | Evidence |
| --- | --- | --- | --- |
| D1 | H | The live `/home` is an older export. It has no `.hero-pena-species` and no figcaption. | Live DOM compared with `index.html:52-57`. Bundle `commercial.da717abbf37d.css`. |

### Colour and surfaces
| # | Sev | Finding | Evidence |
| --- | --- | --- | --- |
| C1 | H | The headline and *a la mesa.* render in ink (`#1A1410`). The hero CSS expects `--brand-primary` (moss) and `--brand-accent-text` (coral 700). | `home-catalog.css:3-15` resets all accents to `--text-primary`. Reproduces on both live and local. |
| C2 | L | The paper is completely flat, while the engravings have a printed, tactile quality. | `body { background-image: none }` |
| C3 | L | The hero CTA hover goes from ink to `--moss-900`, a barely visible change. | `home-hero.css:11` |

### Layout
| # | Sev | Finding | Evidence |
| --- | --- | --- | --- |
| L1 | H | The species strip in the hero repeats the catalog directly below it. | `index.html:52-57` and `:78-100`. Mobile screenshot. |
| L2 | M | Mobile: the engraving plus the strip push «Las setas» to y≈877, and each card is about 513 px tall, so the page runs to about 3400 px for three species. | Measured at 375 px |
| L3 | M | Hero padding is `24px 40px`. The heading starts tight under the masthead rule, and the bottom padding isn't optically larger. | `home-hero.css:3` |
| L4 | L | The location is repeated three times: top strip, footer paragraph and footer bottom line. | `index.html:35`, footer |

### Interaction and states
| # | Sev | Finding | Evidence |
| --- | --- | --- | --- |
| S1 | H | The mobile location strip is empty. `.location-line > span:last-child { display:none }` hides its only span, leaving a 25 px bordered bar. | `website.css:58` |
| S2 | M | Card links look different from each other: «Leer la ficha» has no underline and an edge-aligned ↗, while «Cocinar con…» is underlined. | `home-catalog.css:54`. Mobile screenshot. |
| S3 | M | No pressed state on `.hero-cta`, the secondary hero link, `.text-link` or species cards. Only `.sdp-btn:active` and `.nav-inquiry:active` exist. | Stylesheet rule scan |
| S4 | M | The nav has no `aria-current` or active style, although CSS for it exists (`website.css:486`). | `index.html:39` |
| S5 | M | Each species has two destinations: the image opens a `<dialog>` and «Leer la ficha» goes to `/especies/*`. The modal duplicates the species page. | `index.html:87-88`, `#species-dialog` |
| S6 | L | «Volver al inicio ↑» links to `/home`, which reloads the page instead of scrolling to the top. | Footer |
| S7 | L | «Elegir por preparación» uses a `<details>` accordion to filter three cards. It costs a click to hide two options. | `index.html:62-74` |

### Content
| # | Sev | Finding | Evidence |
| --- | --- | --- | --- |
| K1 | M | No dish on the home page. The *imaginar el plato* half of the promise isn't shown. Plate illustrations exist (`recipe-artwork` and `recipe-feature` styles, `cocina.html`). | Page text |
| K2 | M | Restaurants and the mundo micelar have no entry point below the fold. The footer has no nav. | Footer links: wordmark, «Volver al inicio», Smallhold |
| K3 | L | Shiitake's «Cocinar con shiitake» goes to `/recetas`, while the others go to `/recetas-<especie>`. | `index.html:88, 95, 100` |

### Code quality
| # | Sev | Finding | Evidence |
| --- | --- | --- | --- |
| Q1 | M | Dead CSS. `.origin*`, `.home-intro*`, `.recipe-feature*`, `.recipe-artwork*` and `.hero*` match nothing on `/home`. | `home-catalog.css:60-125, 190-238`, `website.css:14-58` (check for other pages using them before deleting) |
| Q2 | L | The favicon is a generic mushroom icon (`icons/mushroom.svg`), not the Peña emblem. | `index.html:27` |

## 3. Decisions needed before Phase 2

1. ~~Accent on the home page~~ **Decided 1 Nov 2026: more accent colour across the page**, using the DS-2026 set with fixed roles (Phase 2).
2. **Hero species strip:** remove it (recommended), or keep it and drop the catalog header so it acts as the index.
3. **Species dialog:** retire it in favour of `/especies/*` (recommended), or keep it for quick comparison.

## 4. Implementation phases

Each phase is its own branch and PR, kept small. Check each one locally with `public-web` at **320, 390, 768 and 1440 px**, then run:

```bash
node scripts/quality/check_public_website.cjs
```

After an authorised export, also run `check_public_export.cjs` and `check_public_delivery.cjs`, then `scripts/quality/check_public_live.py`. **Publishing to Cloudflare needs Sebastián's approval each time.**

### Phase 0 · Bring live up to date with `main` (D1)
- Install the exporter dependency (`fontTools`) and run `python3 scripts/export_public_website.py --output <empty dir>`.
- Sebastián deploys to project `setas-de-la-pena`, then run `check_public_live.py`.
- Optional, separate PR: document or automate the Cloudflare step so a merged change to `index.html` doesn't quietly stay unpublished.
- **Acceptance:** the live `/home` DOM includes everything `index.html` has.

### Status · 1 Nov 2026

Phases 1 and 2 are built on branch `claude/taste-skill-redesign-audit-8bdf5b`. `check_public_website.cjs` passes 72/72 with 0 browser errors (same as the baseline). Checked at 320, 768 and 1440 px.

- **Phase 1:** S1, S4 and S6 are done. S1 also fixes the empty strip on setas, cocina, restaurantes and mundo micelar. S4 is solved with `aria-current="page"` on the home wordmark, because home has no nav item of its own. K3 needs no change: `/recetas` is the shiitake recipe page («Recetas con shiitake»).
- **Phase 2:** the colour roles are in `home-hero.css` under `.home-page.portada`. Only `index.html` has `portada`, because `.home-page` is shared by `setas`, `cocina`, `restaurantes` and `mundo-micelar`, and those keep their ink-only reset. The bark footer was left out for now. Bands: coral on «Imaginar el plato.» (ink-700 on band 5.7:1), ochre on «Disponibilidad por confirmar.» (8.1:1).
- **Not yet live:** this needs an export and a Cloudflare deploy (Phase 0).

### Phase 1 · Bugs (S1, S4, S6, K3)
- `website.css:58`: change the selector to `.location-line > span:nth-child(2)`, or scope it so a single span is never hidden.
- `index.html:39`: on home, add `aria-current="true"` to «Las setas» while `#coleccion` is in view (small `IntersectionObserver` in `home-navigation.js`), or leave home without a current item and add `aria-current="page"` on the other pages.
- Footer: `href="#inicio"` for «Volver al inicio ↑». Smooth scroll is already on.
- K3: point shiitake to its own recipes route if one exists. Otherwise label it «Ver recetas».
- **Acceptance:** the strip shows «Tenjo · Cundinamarca · Colombia» at 375 px. Keyboard tab order and focus rings are unchanged.

### Phase 2 · Colour (C1, C2, C3), more accent colour with fixed roles

**Step 1. Remove the monochrome reset.** In `home-catalog.css:3-15`, delete the whole `.home-page { --brand-*: …; --action-*: …; --focus-ring: … }` block, so the home page uses the DS-2026 semantic tokens like every other page. This brings back the colours `home-hero.css` already expects.

**Step 2. Give each colour one job.** Every new use of colour on `/home` has to fit one row of this table. Contrast is measured on `paper-100 #FAF8F3`.

| Colour | Token | Role on `/home` | Where | Contrast |
| --- | --- | --- | --- | --- |
| Moss | `moss-700` | Identity and main action | H1 «Del micelio», `.hero-cta` background, `.nav-inquiry` border and hover fill, the heavy rules (`--rule-heavy`) above «Las setas» and the footer | 11.1:1 |
| Moss (botany) | `moss-700` for text, `moss-tint` for surfaces | Botany | Latin names (`.t-latin`, hero strip `i`). Species names go back to ink so name and Latin name stay distinct. `moss-tint` is the wash for the future «Imaginar el plato» section (K1). | 11.1:1 (`moss-500` is only 4.2:1, which fails AA for 20 px text, so it isn't used for text) |
| Terracotta | `coral-700` | Voice and appetite | *a la mesa.* in italic, «Cocinar con…» links and their ↗, link underline on hover | 7.1:1 |
| Terracotta, light | `coral-500`, `coral-tint` | Highlight | `.franja--coral` band behind one key word per section (e.g. «plato»), focus ring | 4.1:1 (graphic only, no small text) |
| Slate | `slate-500` | Data and metadata | Mono `.t-label` items: «3 especies», «Grabado · Peña de Juaica», footer bottom line, notes `[1]` | 5.4:1 |
| Ochre | `sand-500` | Status | `.franja--ocre` behind «Disponibilidad por confirmar» | 2.1:1, so **only as a band behind ink text**, never as text |
| Bark | `bark-700` | Footer surface (optional) | Footer on `--surface-inverse` with `paper-50` text, closing the page as a printed back cover | 8.8:1 (paper-50 on bark) |

**Rules that keep it coherent:**
- Ink and paper still cover most of the page. Accent colour stays well under a fifth of the visible area. Check by eye at 1440 and 375.
- **No palette per species** (brand guidelines §5). All three cards use the same colours. Colour shows role, never species.
- Terracotta text only at `coral-700`. `coral-500` only for graphics.
- At most one `.franja` band per section.
- Shadows stay off. If one is added later, tint it with `bark-700`, not black.

**Step 3. Hover and focus.**
- Hero CTA: moss-700 at rest, and on hover `moss-900` plus a 2 px coral-500 bottom border, so the change is visible.
- `--focus-ring: var(--coral-500)` on `.home-page`, with a 3 px outline. Check it against both paper and moss backgrounds.

**Step 4. Grain (C2).** The plan in Phase 6 still applies, but tint the noise with `bark-700` so the paper reads warm next to the new colours.

- **Acceptance:**
  - Every coloured element on `/home` maps to one row of the table.
  - Text contrast is ≥ 4.5:1, and ≥ 3:1 for graphics and large text. Record the measured ratios in the PR.
  - No colour differs between species.
  - `forced-colors` and print still render, since `.franja` already drops its band in both.
  - Screenshots at 1440 and 375 attached to the PR.
- **Pages affected:** step 1 only touches `.home-page`. If the roles work well, propose them for `website.css` in a later PR so the species and recipe pages match.

### Phase 3 · States (S2, S3)
- One card link style: both links underlined at rest (offset 5px, thickness 1px), with thickness 2px on hover. The arrow sits inline after the text, not pushed to the edge.
- Pressed state: `transform: translateY(1px)` on `.hero-cta`, `.origin-actions a`, `.text-link` and `.specimen-button` under `:active`. Reuse the `website.css:550` transition list and the reduced-motion block at `:555`.
- **Acceptance:** every interactive element on `/home` has visible hover, focus and pressed states. Reduced motion is respected.

### Phase 4 · Layout and rhythm (L1, L2, L3, L4)
- L1, following decision 3.2: remove `.hero-pena-species` from `index.html`, and its CSS from `home-hero.css:21-31` and the media queries.
- L3: `padding-block: clamp(32px, 5vw, 64px) clamp(48px, 7vw, 96px)`, with more space below than above.
- L2, mobile: cap the hero engraving at about `46svh` and set `.specimen-button img` to about 180 px tall at ≤760 px. Target: «Las setas» visible within roughly 1.3 screens.
- L4: keep the location in the top strip and the footer-bottom line. Remove it from the footer paragraph.
- **Acceptance:** at 375 px, the collection header starts before y≈1100. No species is shown twice above the fold.

### Phase 5 · Components and content (S5, S7, K1, K2)
- S5, following decision 3.3: make the image link to `/especies/*`, then remove `#species-dialog` and its JS in `website.js` (check `check_public_website.cjs` for dialog assertions and update them).
- S7: replace the `<details>` with an always-visible row of filter chips (`.filter` already exists). With only three cards, consider dropping the filter entirely.
- K1: add a section after the catalog, «Del plato» or «Imaginar el plato», with one dish illustration from the recipe set in a two-column zig-zag (plate and short text). Use the brand status line «Adaptación de fuentes publicadas, pendiente de prueba en cocina.» and an infinitive CTA («Ver la receta»).
- K2: add a short footer nav (Las setas · Recetas · Restaurantes · El mundo micelar) above the notes. Add no legal pages unless data collection starts.
- **Acceptance:** the voice rules in brand §3 hold (no tuteo, no «premium», infinitive CTAs). No availability or price claims.

### Phase 6 · Clean-up and polish (Q1, Q2, C2)
- Q1: grep each dead selector across every public page. Delete only the ones used nowhere.
- Q2: favicon from the Juaica emblem (SVG plus a 180 px PNG for `apple-touch-icon`).
- C2: optional paper grain on `body::before`, a fixed, `pointer-events:none` SVG noise layer at about 3–4% opacity, with a `--z-overlay` token instead of a raw number. Leave it out in print.
- **Acceptance:** the CSS file sizes for home go down and Lighthouse performance doesn't drop.

## 5. Optional, not planned

1. Scroll reveal for the catalog cards (stagger, `opacity` and `transform` only, motion intensity ≤3 as in the `home-catalog.css` header).
2. An asymmetric catalog: shiitake wider, as the only species open for inquiry, with melena and eryngii stacked beside it. Only worth doing if the catalog grows past three or shiitake needs more weight.

## 6. What this audit didn't cover

- Other public pages (`/especies/*`, `/cocina`, `/restaurantes`, `/mundo-micelar`). They share `website.css`, so Phases 1, 3 and 6 will reach them and need the same viewport check.
- Lighthouse scores and a full WCAG audit.
- The full export pipeline. `fontTools` is missing in this environment, so the export wasn't run.
