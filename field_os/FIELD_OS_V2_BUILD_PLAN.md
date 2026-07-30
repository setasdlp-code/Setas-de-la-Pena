---
title: SdP Field OS — v2 Build Plan (Sesión module + handoff behaviors)
document_id: PPLAN-001
authority: implementation-plan
category: build-plan
version: 1.1
last_reviewed: 2026-07-27
status: draft
governed_by:
  - FIELD_OS_MVP_ARCHITECTURE.md
  - PRODUCT_CANON.md
  - DATA_MODEL.md
  - MODULE_MAP.md
  - adr/ADR-0001_Central_Operational_Unit.md
  - adr/ADR-0002_Product_Priority.md
  - adr/ADR-0003_System_Boundary.md
  - adr/ADR-0004_V1_Scope_Expansion.md
source_handoff: "Field OS Simulador App .zip (design_handoff_setas_os, 2026-07-27) — Setas OS v5 (reference).dc.html"
---

# Field OS v2 — Build Plan

## 0. What actually exists today vs. what the handoff assumes

The only module built to production quality is the **Simulador/Formulador** (substrate & recipe tool): `field-os-simulador-app/src/simulador.source.html` (6,160 lines), served via `server/server.mjs` + `server/store.mjs`, with a build (`scripts/build.mjs`), quality gate (`scripts/quality-check.mjs`), tests (`tests/*.test.mjs`), and CI. It persists arbitrary `sdp_*/setas_*/sim_*` string entries to a single JSON file (`data/state.json`) via `/api/state`.

The handoff's `Setas OS v5 (reference).dc.html` documents a much larger app — **Inicio, Sesión, Simulador, Cámaras, Plan, Inventario, Calidad, Aprender, Comercial, Revisión** — of which only Simulador exists in real code. Two older, never-built design references already sit in the repo (`Setas OS.dc.html`, `Field OS MVP-1.dc.html`), confirming Sesión/Inicio/Cámaras have been *designed* multiple times but never implemented.

**Conclusion:** most of this plan is new construction — a real Sesión (session/ledger) module, a real photo-upload path, and the persistence/data-model changes to support them — not a port of small tweaks.

---

## 1. Governance conflicts — resolved 2026-07-27 by ADR-0004

The ratified `FIELD_OS_MVP_ARCHITECTURE.md` (§3, "Capabilities explicitly deferred") originally excluded three things the handoff's newest session assumed existed: climate alert escalation, `ROLE_GATE`, and a low-stock banner — each in tension with ADR-0002's deferred-capability list and with `IN-3`/`GR-2` remaining `Proposed` in `PRODUCT_ASSUMPTIONS.md`.

**Resolution.** The product-foundation owner decided, 2026-07-27, that these three become real v1 scope now — see `field_os/adr/ADR-0004_V1_Scope_Expansion.md` for the full record. This is a **logged risk acceptance**, not a claim that `IN-3` or `GR-2` were validated; both remain `Proposed` in `PRODUCT_ASSUMPTIONS.md`, each with a note pointing back to ADR-0004. `FIELD_OS_MVP_ARCHITECTURE.md` §2/§3, `DATA_MODEL.md` (§2.15–2.17, Operator Role), and `MODULE_MAP.md` (§4.5, §5.2, §5.3) were all amended to v1.1 to reflect this. Phase 2 below is therefore no longer blocked on governance — it is blocked only on the engineering already noted as ADR-0004's required follow-up: server-side role enforcement and `IN-3` validation before the escalation banner is trusted operationally. A real inventory data source (`server/inventory-store.mjs`, `/api/inventory`) shipped 2026-07-27, same day; the remaining inventory gap is an audit trail of stock changes (today's store overwrites in place), not the data source itself.

---

## 2. Phase 1 — Sesión module (this phase is MVP-1-faithful, buildable now)

### 2.1 Data model additions (extends DATA_MODEL.md; new entities, no changes to existing ones)

- **Container** `{ id, especie, receta_ref?, creado_en, estado_derivado }` — `estado_derivado` is computed from its event timeline, never stored directly (INV-4).
- **Ledger event** (append-only, one per row) `{ id, container_ids[], type: 'registro'|'cosecha'|'observacion'|'evento_rapido', operator, ts, payload }`. `payload` shape varies by `type`:
  - `registro`: `{ especie, receta_ref?, count }`
  - `cosecha`: `{ container_id, peso_g, destino, cierre? }`
  - `observacion`: `{ container_ids[], tags[], nota, photo_ref? }`
  - `evento_rapido`: `{ container_ids[], subtype: 'traslado'|'contaminacion'|'marca'|'descarte', causa_raiz? (required if contaminacion), nota, photo_ref? }`
- **Photo reference**: `photo_ref` is a server-assigned opaque filename (e.g. `2026-07-27-c-0412-<uuid>.jpg`), never a data URL, once Phase 1 ships (see §2.3).

This is additive to `DATA_MODEL.md`'s existing Operational Event concept, not a redefinition — write it up as a DATA_MODEL amendment once implemented, per PC-10 (governance follows validated reality).

### 2.2 Server changes (`server/server.mjs`, `server/store.mjs`)

- New store: ledger is append-only, so it cannot reuse `store.replace()` (which overwrites). Add `store.append(event)` (validates + pushes, atomic write, same temp-file+rename pattern as today) and keep `store.snapshot()` for full-state reads.
- New routes:
  - `POST /api/ledger` — append one event, returns the assigned `id` + server timestamp (server is the timestamp authority, not the client, so undo/ordering is trustworthy).
  - `GET /api/ledger` — full ledger read (MVP-1 has one operator/reviewer; no pagination needed yet).
  - `POST /api/photos` — multipart or base64-in-JSON upload, capped (e.g. 5MB), writes to `data/photos/<generated-name>`, returns `{ photo_ref }`. Validate MIME type from content, not just the client-supplied one.
  - `GET /photos/<name>` — static serve from `data/photos/`, added to `STATIC_PREFIXES` equivalent but scoped to that directory (not the general static allowlist, since these are user-uploaded, not build artifacts).
- `MAX_BODY_BYTES` (currently 2MB) needs a separate, larger cap for the photo route — don't raise the global JSON cap for the ledger route.
- Undo is **not** a server concept — per INV-3 (append-only, immutable), the server never deletes or rewrites a ledger entry. Undo must be implemented as: client shows the "Deshacer" toast; if clicked within 10s, client sends a *new* compensating event (e.g. a `type: 'anulacion', ref_event_id` event) rather than deleting the original — this preserves append-only truthfully instead of faking it client-side only. This is a meaningful deviation from the .dc.html reference (which snapshots and restores in-memory state with no compensating record) and should be called out to the product owner as the MVP-1-faithful alternative.

### 2.3 Photo storage (per your local-filesystem preference)

- Store under `data/photos/` next to `data/state.json` (already gitignored — confirm `data/` is covered by `.gitignore`, add `data/photos/` explicitly if not).
- Client-side: `FileReader` still reads the file for the *thumbnail preview only*; on submit, `POST /api/photos` uploads the actual bytes and the ledger event stores `photo_ref`, not base64. This directly resolves the handoff's flagged gap ("no upload endpoint exists yet... needs object storage + a URL field instead of inline base64").
- No auth/access-control on `/photos/<name>` in Phase 1 (matches MVP-1's single-instance, single-operator assumption) — note as a residual risk in the audit doc if this ever moves beyond a private LAN deployment.

### 2.4 Frontend — new React components (mirroring the existing prototype's structure: everything currently lives in one `simulador.source.html`; recommend splitting Sesión into its own source file compiled by the same `scripts/build.mjs`, rather than growing the 6k-line file further)

- `SesionHub` (screen: `home`) — quick-action tiles, today's tasks (derived, not stored — per §4 architecture), recent ledger entries.
- `RegistrarForm` (WF-1) — species + recipe reference (reads existing simulator recipe list, per RECIPE_SIMULATOR_INTEGRATION §5/§6 read-only reference — no new coupling) + count.
- `CosechaForm` (WF-4) — container select, weight, destination, optional close-out.
- `ObservacionForm` (WF-3) — multi-container select, tags, note, photo slot (empty/filled states per handoff spec), voice-to-text button (Web Speech API, best-effort, degrade silently if unsupported).
- `EventoRapidoForm` — subtype select (traslado/contaminación/marca/descarte), root-cause required when contaminación, multi-container, photo, note.
- `HistoryView` (WF-7/8) — container/lote timeline, read-only.
- `SessionEndView` — handoff note textarea, "Finalizar sesión" (no persisted session record — just marks end of this working period locally), "Compartir resumen" (WhatsApp share, §2.5), "Seguir trabajando".
- Shared: `ToastWithUndo` component (message, optional undo action, 10s timer, `fos-toast-undo` keyframes ported verbatim from the reference CSS).
- Shared: `PhotoAttach` component (empty/filled states, upload-on-submit not upload-on-select, to avoid orphaned uploads if the form is abandoned).

### 2.5 WhatsApp share

- Build the summary client-side from the already-loaded ledger (harvest count + kg from `cosecha` events, contamination count from `evento_rapido` where `subtype==='contaminacion'`, open tasks from the derived task list, handoff note).
- `navigator.clipboard.writeText` best-effort, then `window.open('https://wa.me/?text=' + encodeURIComponent(summary))`.
- Keep the handoff's own production note: this is a stand-in for a real WhatsApp Business API integration; don't over-invest here.

### 2.6 Command palette

- Extend whatever global search/palette exists today (grep shows none yet in `simulador.source.html` — this is also new, not a port) with the fixed regex grammar from the handoff: `cosecha <ID>`, `observar|observa <ID>`, `contamina\w* <ID>`, `registrar|registra`, `sesión|sesion|iniciar`.
- Container ID format `C-####`, case-insensitive, per handoff.

---

## 3. Phase 1 test plan (extends existing `tests/*.test.mjs` pattern)

- `server-ledger.test.mjs`: append is atomic and never mutates prior entries; concurrent appends don't clobber (mirrors the existing `server-persistence.test.mjs` style); reject malformed payloads per type.
- `server-photos.test.mjs`: rejects >cap size, rejects non-image MIME (sniffed, not trusted from header), returns stable `photo_ref`, served file is byte-identical.
- `undo.test.mjs` (component/unit level): compensating event is recorded, never a delete; toast timer clears on new action.
- `command-palette.test.mjs`: regex grammar matches/mismatches, case-insensitivity, container-ID pre-population.
- Update `scripts/quality-check.mjs` to also validate the new `/api/ledger` and `/api/photos` routes exist and respond correctly, following its existing pattern for `/api/state`.

## 4. Suggested build order (each step independently shippable/testable)

1. `store.append` + `/api/ledger` routes + tests (no UI yet) — proves the persistence model.
2. `/api/photos` upload + static serve + tests — proves the storage model.
3. `RegistrarForm` + `SesionHub` wired to the new ledger API — first real end-to-end path.
4. `CosechaForm`, `ObservacionForm` (with `PhotoAttach`), `EventoRapidoForm`.
5. `ToastWithUndo` + compensating-event undo, wired into all four forms.
6. `HistoryView`, `SessionEndView` + WhatsApp share.
7. Command palette.
8. Laboratorio nav polish + placeholder-contrast fix (small, isolated changes to the existing `simulador.source.html` — safe to do anytime, not dependent on the above).
9. Update `AUDIT_2026-07-17.md` and `field_os/DATA_MODEL.md`/`MODULE_MAP.md` amendments to reflect what actually shipped.

Phase 2 (climate escalation, roles, inventory) shipped as a first slice under ADR-0004, and the inventory data source was made real the same day (`server/inventory-store.mjs`, `/api/inventory`, tested in `tests/server-inventory.test.mjs`) — see [`AUDIT_2026-07-17.md`](20_product_design/PROTOTYPES/field-os-simulador-app/AUDIT_2026-07-17.md) addendum for what was built and its residual risks. Remaining Phase 2 follow-up (server-side role enforcement, `IN-3` validation, an audit trail for inventory changes) is tracked there and in ADR-0004, not re-sequenced here.
