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
