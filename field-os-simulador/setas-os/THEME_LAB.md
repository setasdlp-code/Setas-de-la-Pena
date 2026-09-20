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

The Lab loads packaged distribution copies of all five canonical token documents:

- `ds-2026/tokens/primitives.json`
- `ds-2026/tokens/semantic.json`
- `ds-2026/tokens/typography.json`
- `ds-2026/tokens/spacing.json`
- `ds-2026/tokens/domain.json`

Their sources of truth live under `08_brand/ds-2026/tokens/`.

Each document has a complete working copy. Global sidebar editors and the click-to-edit Inspector mutate those working copies and the Diff/Export surface reflects all five.

The quick **Preview de superficie** controls remain non-persistent experiments. They are separate from the canonical Typography, Spacing and Domain editors and do not create a diff by themselves.

Derived colour washes are recalculated only after a colour edit or non-canonical preset. Loading or resetting preserves the exact canonical derived values.

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


## Inspect Mode · click-to-edit

Activate the inspector from the canvas toolbar with **⌖ Inspeccionar** or press `Alt + I`. Press `Escape` to leave inspect mode.

Hovering shows the nearest canonical DS component. Clicking selects it and opens the contextual Inspector in the left sidebar.

The resolver is intentionally conservative:

- known DS components resolve to exact canonical token paths;
- nested text/icons inside a component resolve to the nearest known component;
- unknown nodes show computed styles only;
- the Inspector never invents a JSON path for a CSS literal.

Examples:

- `.sdp-btn--primary` → `semantic.action.primary`, `semantic.text.inverse`, typography `label`, FIELD target height;
- `.sdp-species__common` → `semantic.text.primary`, typography `species`, actual shared tracking source;
- `.sdp-reading__value` → `semantic.text.primary`, operational value typography;
- `.sdp-provenance[data-provenance]` → surface/text/border roles plus `domain.provenance.*`.

When the DS still contains a literal such as a legacy `14px` task title, the Inspector reports the debt instead of pretending it is tokenized.

## Five canonical working copies

The Theme Lab now loads and preserves complete working copies of:

- `primitives.json`
- `semantic.json`
- `typography.json`
- `spacing.json`
- `domain.json`

Unknown metadata and fields are preserved because edits mutate cloned canonical documents instead of reconstructing partial schemas.

The Diff view includes changes across all five documents, and all five can be downloaded.

## Apply JSON to Repo

On browsers that support the File System Access API (Chromium-based browsers), **Aplicar JSON al Repo…** lets you select the repository root and writes only:

```text
08_brand/ds-2026/tokens/primitives.json
08_brand/ds-2026/tokens/semantic.json
08_brand/ds-2026/tokens/typography.json
08_brand/ds-2026/tokens/spacing.json
08_brand/ds-2026/tokens/domain.json
```

The browser must receive explicit user permission. The Theme Lab does not write to the packaged consumer under `field-os-simulador/setas-os/ds-2026/`.

Before writing, Apply is blocked when the working copy violates core contracts:

- semantic references must resolve;
- body ≥ 16px;
- operative data ≥ 13px;
- label and screen metadata ≥ 11px;
- touch target ≥ 44px;
- FIELD cell ≥ 48px;
- critical semantic text/action pairs must meet 4.5:1 contrast.

After a successful write, the repository build/sync commands remain explicit:

```bash
node 08_brand/ds-2026/scripts/build-tokens.mjs
node 08_brand/ds-2026/scripts/sync-consumers.mjs
```

This separation is deliberate: a static browser tool can edit user-authorized files, but it does not silently execute repository commands.
