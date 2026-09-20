# Criterio Theme Lab

Internal development surface for DS-2026 · Criterio Edition.

## Open locally

From `field-os-simulador/setas-os/`:

```bash
npm run theme-lab
```

Then open:

```text
http://localhost:4173/theme-lab.html
```

The Theme Lab is intentionally **not linked into production navigation**. It is a developer/design tool, not an operational Setas OS destination.

## What it edits

### Exportable color contracts

The Lab loads the packaged copies of:

- `ds-2026/tokens/primitives.json`
- `ds-2026/tokens/semantic.json`

The packaged copies are distribution artifacts of the canonical sources in:

- `08_brand/ds-2026/tokens/primitives.json`
- `08_brand/ds-2026/tokens/semantic.json`

Color changes update CSS variables live and can be copied/downloaded as normalized JSON.

Derived washes are recalculated only after an edit or non-canonical preset. Loading or resetting preserves the exact canonical derived values.

### Preview-only controls

Spacing scale, border geometry, radius and dominant typography are visual experiments only.

Their canonical sources are:

- `spacing.json`
- `typography.json`

The Theme Lab does not write those values into `primitives.json` or `semantic.json`.

## Component canvas

The canvas deliberately uses real DS-2026 APIs:

- `.sdp-btn`
- `.sdp-lote`
- `.sdp-reading`
- `.sdp-provenance[data-provenance]`
- `.sdp-task`
- `.sdp-band`

Do not add parallel `.os-*` visual component APIs to the Theme Lab.

## Applying an exported theme

1. Copy the exported values into the canonical files under `08_brand/ds-2026/tokens/`.
2. Run:

```bash
node 08_brand/ds-2026/scripts/build-tokens.mjs
node 08_brand/ds-2026/scripts/sync-consumers.mjs
```

3. Validate:

```bash
node 08_brand/ds-2026/scripts/build-tokens.mjs --check
node 08_brand/ds-2026/scripts/visual-contract.mjs
cd field-os-simulador/setas-os
npm test
```

## Contrast

The contrast panel evaluates the current semantic mappings rather than fixed pigments. It checks critical text/action combinations against a 4.5:1 threshold and updates immediately when primitive colors or semantic references change.

A green preview is not permission to bypass the repository contrast audit. The canonical audit remains authoritative.
