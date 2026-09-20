# design-sync notes · DS-2026

- **Target project**: `b53651ed-f007-438c-8784-7ae97466211e` — "Setas de la Peña · DS-2026".
  Two other Setas projects exist and are NOT this one:
  `d39a2369…` (Field Operating System) and `2b03b4d8…` (legacy Design System export).
  Never sync DS-2026 into either.

- **Shape is `cards`, not `package`.** DS-2026 is pure CSS + HTML with no React
  components and no `dist/`, so there is nothing for the esbuild converter to
  bundle and no `_ds_bundle.js` is produced. Authoring React wrappers would be a
  reimplementation, not the customer's build. The card layout mirrors
  `08_brand/field-os-identity/`, which this app already consumes for this brand.

- **Build → verify → upload**:
  ```
  node claude-design/build.mjs         # assembles ds-bundle/
  node claude-design/render-cards.mjs  # renders + grades all 21 cards
  ```
  `render-cards.mjs` walks the DOM for content clipped inside any
  `overflow:hidden` box. That check is load-bearing: cards use a fixed-height
  root, so `documentElement.scrollHeight` alone reports everything as fine while
  content is silently cut. It caught six clipped cards on first run.

- **Card viewports must clear the component's own breakpoints.** `.sdp-ficha`
  collapses at `max-width: 700px`, so its card is 760px wide — a 700px card
  showed the mobile footer and misrepresented the component.

- `ds-bundle/` is derived output. Regenerate it; never hand-edit it.

- **`templates/archive-unificado/ArchivoUnificado.dc.html`** lives in the
  project (not this repo) — a prior proposal sketch merging `.sdp-ficha`/
  `.sdp-pack` into ARCHIVE's editorial voice. It is NOT synced content (its
  own header says so); it's a `.dc.html` design-canvas file the project
  happens to hold. Useful as a directional reference: it independently
  landed on the same `--accent-warm: oklch(57% 0.15 38)` value and the
  hairline downgrade for `.sdp-ficha`/`.sdp-pack`, which is corroborating,
  not authoritative. Don't copy it verbatim — it also uses `--accent-warm`
  as text color on an `.ed-eyebrow` ("Disponible"), which fails the 4.5:1
  AA floor the real token is constrained to (4.38:1 on paper). Fetch it via
  `DesignSync(get_file)` if revisiting this work; it isn't mirrored to disk.

- 2026-09-09 sync (74 files, 23 cards, atomic path — project was already
  non-empty from the 2026-09-04 sync): pushed the ARCHIVE/editorial
  unification of `.sdp-ficha`/`.sdp-pack` — `--accent-warm`, the
  `--t-display-cover` masthead, hairline rules, `.ed-eyebrow` labels,
  default `.ed-drop`, `.sdp-fig--bleed`. `component-ficha.html` and
  `brand-packaging.html` needed their inline `font-size` overrides on
  `.sdp-species__common` removed — inline styles beat the new cover-scale
  CSS rule, so the masthead silently stayed small until that was fixed.
