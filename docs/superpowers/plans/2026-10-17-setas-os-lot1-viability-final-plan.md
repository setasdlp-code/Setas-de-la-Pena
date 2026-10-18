# Setas OS: final plan for Lot 1 operational viability

**Date:** 2026-10-17 · **Verified against:** `main` @ `259c37bc` · **Supersedes:** "Setas OS Master Audit & Implementation Plan" (baseline `47379a32`) and its external review.

## 1. How this plan was produced

The source plan was written against `47379a32`, which is **141 commits behind** current `main`. The external review checked the plan's reasoning but not its repository claims. This plan does three things:

1. It re-checks every major finding against `259c37bc`, by grep, by reading source, and in one case (L-01) by running the code. See the appendix.
2. It keeps the review's corrections where they hold up.
3. It reorders delivery around one trustworthy Lot 1 *Lentinula edodes* workflow, as the review recommended.

Code references use symbols, not line numbers, because line numbers have drifted by about 1,300 lines since the baseline. The original plan's `.gemini/...` file links point to a machine-local worktree and should not be reused.

## 2. Verdict on the source plan

**What the plan got right:** integration failures, not missing domain modules, are what block field use. Most of its UI and wiring defects still exist.

**What the plan got wrong or outdated:**

- **Showstopper #1 (no multi-device read sync) is largely resolved.** ADR-0009 (accepted and implemented 2026-10-06) added:
  - live `onSnapshot` reads (`firebase/remote-sync.js`, wired in `auth-gate.js`);
  - a three-way merge (`sync-merge.js`);
  - tombstone deletes;
  - an append-only Bodega ledger (`inventario_asientos`);
  - a single sync queue;
  - a two-browser-context E2E test (`e2e/multi-device-sync.browser.cjs`).

  The gap that remains is narrower: the collections outside `COLECCIONES`.
- **L-13 is mostly stale.** `room_cycles`, `cycle_evidence` and `telemetry_readings` all have rule blocks now, and `masaBalanceada` accepts 12 ingredients. Only the `public_lotes` permission question still stands.
- **L-01 has the right conclusion but the wrong arithmetic.** In the catalog, `salvado_trigo` is a `suplemento_n` (so `suppEffectiveP = 20`, not 12). Running the canonical 79/20/1 shiitake block through `analyze()` + `scoreRecipe()` gives:
  - thermal treatment: score 64, status `needs_work`;
  - autoclave: score 67, status `good`.

  Pasteurization is therefore **not blocked**, even though the catalog entry itself says "REQUIERE ESTERILIZACIÓN". It is not "approved at 100" either.
- **L-03 is partial.** `scoring.js` already uses `suppEffectiveP`. `substrate-diagnosis.js` (line 33), `perito-workbench-core.js` (`suppP` check) and the EB warning in `scoring.js` still use raw `suppP`.
- **U-07 (the raw `<AppIcon>` string) is fixed.** Room cycles are now partly wired into the JSX (L-09 is partial). Only 4 `MutationObserver` bridges remain, not 5.

**Review points accepted in full:** 1 (consistency design), 2 (15 PSI is not an acceptance criterion), 3 (no simulated data in production decisions), 4 (rules validation versus `hasOnly`), 5 (containment first), 6 (consistency is not validity), 7 (`'sana'` default and quarantine), 8 (migration), 9 (multi-device failure tests), 10 (measurable boundaries).

**Review points narrowed by what the repo already has:**

- **Point 1.** ADR-0009 already defines duplicate suppression (deterministic IDs, ADR-0005), tombstones, per-entity resolvers (`lifecycleEvents` union, reservation status monotonic) and a single queue. Do not redesign this. Extend it.
- **Point 9.** A two-context browser test already exists. Extend it; don't build it from scratch.
- **The "no over-allocation" criterion conflicts with ADR-0009 D3.** That decision chose *detect and surface* over-allocation offline (`sobregiroKg`, "Recuento necesario"). It does not *prevent* it. Sebastián has to settle which one applies (decision D-1).

## 3. Decisions required from Sebastián before Stage 1 closes

**Recorded 2026-10-17 in `knowledge_base/DECISIONS.md`:** D-3 → DEC-016 (hard block), D-1 → DEC-017 (detect and surface), D-5 → DEC-018 (retire `field_events`). D-2 and D-4 remain open.

| ID | Decision | Options | Blocks |
|---|---|---|---|
| D-1 | Concurrent stock reservation | (a) Keep ADR-0009 detect-and-surface; the acceptance test becomes "overdraw surfaced, no silent loss". (b) Server-acknowledged pending reservations: a reservation stays `pending` until accepted online, and offline planning is not a commitment. | Stage 2 test matrix |
| D-2 | Operators publishing `public_lotes` | (a) Keep admin/sync-service only; operators queue a publish request. (b) Let operators publish a validated projection. This is a permission-policy change. | QR traceability in Stage 2 |
| D-3 | Sterilization policy encoding | Hard block of non-autoclave treatments for species × substrate combinations, as stated in `FARM_BRAIN.md` and the catalog notes, versus a severity warning only. Recommended: hard block for Lot 1 shiitake on supplemented sawdust. | Stage 0.1 |
| D-4 | Ground-truth corpus | Who supplies real `ebReal` lots for `ground-truth-fixtures.json`. Only `.example.json` exists today, so `perito:regression` cannot validate any EB-affecting change. | All EB/scoring calibration work |
| D-5 | `field_events` pipeline | Retire `field-event-sync.js` (rules deny all writes and the Spark plan has no Cloud Functions), or route it through `remote-sync`'s queue. | Stage 1.1 |

## 4. Delivery stages

Every stage passes the `AGENTS.md` §5 gates: `node build.js` when `.jsx` changes, `npm test`, `git diff --check`, and `perito:regression` where it applies (which is **blocked**, not passed, while the corpus is missing). Firestore rule edits go through the `firestore-rules-author` subagent, and only a human deploys them. Each PR has one owner, states its rollback (revert the PR; rules: redeploy the previous ruleset) and adds tests in the same PR, not in a later stage.

### Stage 0 — Containment (no sync dependency; start now)

**Exit gate:** production actions only write persisted state, missing data is shown as missing, and no lifecycle bypass remains.

| # | Change | Acceptance | Owner |
|---|---|---|---|
| 0.1 | **Sterilization gate.** When the species/substrate policy (D-3) requires sterilization and the treatment is not autoclave, `scoreRecipe`/`assessSeverity` return a blocking viability. Implement it as a *policy gate*, not an EB weight change. Ranking among autoclave recipes must stay unchanged. Also review the unconditional `eb *= .85` in `analyze()` when `needsAutoclave`. | Unit test: shiitake 79/20/1 with thermal or cwlp is blocked; autoclave scores the same as before. | agent; policy by Sebastián |
| 0.2 | Remove demo fallbacks from Hoy. Drop `tasksHoyJson` (`C-0414`) when there are no tasks. Copilot, biological clock and contamination risk must not read `hoyCamarasJson` sine waves; show "sin datos / desactualizado" instead. Simulation is allowed only behind an explicit demo mode. | E2E: a clean account shows no demo lot IDs anywhere. | agent |
| 0.3 | Reroute or disable Hoy CTAs (`onQuickLog`, `onGoRev*`, `onOpenCamara`, mobile *Más* items) that land in DCLogic demo screens. Point them to React flows (QR sheet, Bitácora, Clima), or hide them. | No navigation path reaches a DCLogic screen with demo data. | agent |
| 0.4 | Close the lifecycle bypasses: the raw `<select>` on `lote.estado` in the desktop `bit_bolsas` view goes through `SetasOSWorkflow`. Batch cards open `BatchDetailV2` on desktop too. `+ Crear lote en Bitácora` either goes through the planning flow or is explicitly marked experimental. | A forbidden transition is rejected in the UI and the persisted state stays valid. | agent |
| 0.5 | Bag state: new bags from `crearBitLote` get `estado: 'sin_evaluar'`, not `null` and not `'sana'`. `calcLoteStats` reports *unassessed* separately. Track health, location and production eligibility as separate fields. `aislada` bags still count toward room occupancy but are flagged as not eligible. | KPI shows "N sin evaluar", not 0% sanas. | agent |
| 0.6 | `calcDynamicFAE` call site: it reads the nonexistent `pesoLote`/`especieKey` and silently defaults to 25 kg of orellana gris. Until per-batch biomass exists (Stage 3), show "sin datos de biomasa" instead of a fabricated value. | No FAE number is shown without real inputs. | agent |
| 0.7 | Field ergonomics: QR sheet mode tabs, scale, flush and quality buttons, and the triage steppers (currently `3px` padding, 32px controls) get at least 48px targets. Make *Modo Guantes* reachable from Hoy and Salas, and add `.gloves` rules that cover `.sim-root`. | Measured: every control in the harvest/triage path is ≥ 48px. | agent |

### Stage 1 — Contracts: data, sync, rules, science

**Exit gate:** invariants and acceptance fixtures are written down and reviewed by Sebastián; decisions D-1 to D-5 are recorded (ADR or `DECISIONS.md`).

1. **Sync coverage (extending ADR-0009, not redesigning it).** Add tasks (`sdp_bit_tasks`), room events, room assignments, `eventos_cultivo` and `recetas` to `COLECCIONES`, each with a declared resolver: append-only for events, monotonic for status-like fields, and never last-write-wins for harvest records or stock movements. Resolve D-5.
2. **Rules.** Extend `test/firestore.rules.test.js` to cover types, bounds, permitted transitions, immutable identity fields, farm access and the contents of the `public_lotes` projection. Apply D-2. Do not rely on a client-supplied `masaTotalPct`. Any 12+ ingredient limit raise must keep server-side verification of the sum.
3. **Migration and recovery.** Add schema versions on synced documents, preserve legacy IDs and QR identities, migrate local-only records, and produce a reconciliation report. Define cache and queue behaviour on sign-out and account switch. Guard so an empty startup cache never overwrites hydrated cloud data (check against ADR-0009's "sin base → gana el servidor"). Make a backup before each migration, with a documented rollback.
4. **Telemetry contract.** States are `measured | stale | missing | invalid`. Each reading carries a sensor timestamp, units and room mapping. Define freshness limits and the minimum history needed before 6-hour-series engines may run. SCD30: confirm at firmware level whether ESPHome applies pressure compensation, then carry that as a flag through `esp32-telemetry-adapter.js` (today the adapter does not forward `co2_pressure_compensated`; the bridge guard at `compensateCo2Reading` depends on it). Do not adopt a generic `1.36×` correction without the sensor's documented method.
5. **Scientific definitions (reconcile before consolidating).** Follow the `agronomic-claims` skill: every value keeps its data class and tier. Produce versioned operating profiles (species, strain, substrate, stage, units, source tier, uncertainty) for **shiitake Lot 1 only** first. Questions to settle, not assume:
   - Supplement semantics: `suppP` versus `suppEffectiveP`, the `0.6` `suplemento_medio` weighting, and whether `salvado_trigo` is correctly a `suplemento_n`.
   - Moisture basis: D18 dry basis in `analyze()` versus the `(1 − moisture)` conversion in `perito-scenarios.js`. Confirm whether it is a genuine double-discount or a different input basis.
   - `calcSchedule` (shiitake `f1: 90`) versus `flush-forecast-engine.js`: do they count from different start dates (inoculation versus colonization)?
   - `tBase` differences between engines.
   - Shiitake C:N target: the catalog has `cn_optimal.ideal 50`; the KB cites about 40; and the `aserrin_roble` C:N of 500 is itself flagged as doubtful in the catalog notes.
   - Strain class and the >28 °C substrate-core alert (`knowledge_base/01_species/lentinula_edodes.md`).
6. **Corpus (D-4).** Build `ground-truth-fixtures.json`. Until it exists, EB-affecting changes from item 5 stay in proposal form and are not merged into scoring.

### Stage 2 — One complete Lot 1 shiitake workflow on two devices

**Exit gate:** this matrix passes in `e2e/multi-device-sync.browser.cjs` (two isolated browser contexts) plus unit tests:

| Scenario | Required result |
|---|---|
| Two devices reserve or consume the same stock | Per D-1: no over-allocation (a), or the overdraw is surfaced with no silent loss (b) |
| A write succeeds but its acknowledgement is lost | Retry creates no duplicate (deterministic IDs) |
| Phone closes offline and reopens | Pending records survive |
| Phone reconnects after another device edited the batch | Merge per resolver, or the conflict is surfaced |
| Sensor history stale or incomplete | No production recommendation is generated |
| Operator attempts a forbidden transition | Persisted state stays valid |
| Account switch on a shared phone | No cross-account leakage of cache or queue |

The workflow covers: receive oak sawdust, wheat bran and CaCO₃ in Bodega → formulate (thermal blocked by 0.1) → plan the batch (reservation) → record the treatment run (see Stage 3.2) → inoculate (FIFO deduction, label) → incubation checks → harvest via QR → public traceability (per D-2).

### Stage 3 — Telemetry and field validation

**Exit gate:** a real-phone, real-network rehearsal by the caretaker in Tenjo, and a documented treatment process.

1. Feed Copilot, biological clock and contamination risk from `liveTelemetry` under the Stage 1.4 contract. Only then merge `CultivationCopilot.toTasks` into the Hoy task stream and add action buttons to the Copilot cards.
2. **Sterilization acceptance.** Replace "enforce 15 PSI" with an equipment-approved process for the All American 1941X plus a documented load validation (load configuration, a temperature probe at the coldest point, time-at-temperature). At ~745 hPa ambient pressure, 15 PSI gauge saturates at about 117 °C, not 121 °C. Any F₀ calculation needs a recorded temperature history and stated reference parameters, never altitude plus pressure alone. The app records runs and checks them against the documented criteria; it does not infer an operating pressure.
3. Per-batch FAE: compute each batch's contribution with its own species profile and aggregate with explicit units (this handles mixed-species rooms). It replaces the 0.6 placeholder.
4. Actuators: `actuator-controller.js` stays **advisory only** until a separate design covers command acknowledgement, maximum run times, manual override and behaviour on sensor or network failure.
5. Pressure-aware wet-bulb calculation (Tenjo 745 hPa) in `climate-math.js`, with a unit test against a psychrometric reference.

### Stage 4 — Incremental legacy replacement and performance

**Exit gate:** each replaced workflow has a parity checklist, and the performance budgets are measured.

- Retire the DCLogic modules **one workflow at a time**, each with its own parity checklist. Remove the hard-coded demo data as each module goes.
- Replace the 4 remaining DOM-scraping bridges (`perito-ui-bridge`, `perito-scenarios-bridge`, `perito-economy-bridge`, `recetario-model-bridge`) with React components on `formulator-api.js`. That removes the `(0, eval)` calls and the re-fetch of `simulador-app.js`.
- Stop the 2-second `liveMonitor`/`climaTick` re-render, and lazy-mount `climate-bench.html`.
- Bundle the deferred domain scripts in `build.js` **in their dependency order** (82 `.js` references in `auth-gate.js` today). Measure authenticated time-to-usable-screen, interaction latency and sustained telemetry CPU alongside LCP and TBT. Tighten the `lighthouserc.cjs` ceilings only after a baseline is recorded.
- Navigation toward the 6 destinations in `SETAS_OS_UX_ARCHITECTURE_V2.md`. Formular decluttering (score, C:N and EB shown once), and fix the tooltip wording on "descuento automático" (it's a two-phase reservation). Font-token floor in `fieldos-tokens.css`/`sim.css`.

### Stage 5 — Learning, economics, broader species

**Exit gate:** provenance and model limitations are explicit in the UI (Scale A/B/C named, per ADR-0007).

- Production learning loop: create `RoomCycle` on room assignment and close, and show `historicalEvidence` in Perito **as context only** (ADR-0004).
- Load `perito-economy.js`/`perito-evidence.js`, then replace the inline cost calculations in `calcBatch`/`calcLoteStats`.
- Traceability report and certificate in `BatchDetailV2`.
- Canonical species-key resolver (Taxonomy A/B) and targets for lions mane, djamor, nameko and enoki, each as a versioned profile with tier.

## 5. Explicitly out of scope until Stage 3 passes

All-species standardization, the learning loop, the economics refactor, comprehensive UI cleanup beyond Stage 0, and any scoring recalibration.

## Appendix — Finding status at `259c37bc`

| ID | Status | Note |
|---|---|---|
| L-01 | **Confirmed (corrected)** | Thermal not blocked for shiitake (needs_work 64 versus autoclave 67). The 0.6/12% arithmetic in the plan is wrong; `salvado_trigo` is `suplemento_n`. → 0.1 |
| L-02 | Unverified | `(1 − moisture)` conversion exists in `perito-scenarios.js`; whether it double-counts depends on input basis. → 1.5 |
| L-03 | Partial | `scoring.js` uses `suppEffectiveP`; diagnosis, workbench and the EB warning use `suppP`. → 1.5 |
| L-04 | Not rechecked | `species-targets.js` table coverage. → 1.5 |
| L-05 | Plausible | Bridge guard exists; adapter does not forward `co2_pressure_compensated`. Needs firmware check. → 1.4 |
| L-06 | Confirmed | `hoyCamarasJson` still feeds Hoy; `toTasks` has no callers. → 0.2, 3.1 |
| L-07 | Confirmed | `pesoLote`/`especieKey` fields don't exist; 25 kg default. → 0.6, 3.3 |
| L-08 | Partial | Shiitake has `tBase` and colonization cardinals; `FRUITING_CARDINALS` lacks shiitake. → 1.5 |
| L-09 | Partial | `room-cycle` and `production-learning-bridge` are now referenced; `actuator-controller`, `perito-economy`, `perito-evidence` and `batch-traceability` are still unloaded. → 3.4, 5 |
| L-10 | Confirmed (interpretation open) | `calcSchedule` shiitake `f1: 90` versus the forecast engine. → 1.5 |
| L-11 | Confirmed | `estado: null` on new bags. Plan's fix (`'sana'`) rejected. → 0.5 |
| L-12 | **Mostly resolved** | ADR-0009. Gap: tasks, room events, `eventos_cultivo`, `recetas`. → 1.1 |
| L-13 | **Mostly resolved** | Rule blocks exist; `masaBalanceada` is 12-wide; `public_lotes` still admin/sync only. → D-2, 1.2 |
| L-14 | Partial | Single queue per ADR-0009; `field_events` still denied by rules. → D-5 |
| U-01 | Confirmed | DCLogic demo lots (`C-0414`) still in the shell. → 0.3, 4 |
| U-02 | Confirmed | `liveMonitor` loop; 82 script references in `auth-gate.js`. → 4 |
| U-03 | Partial | 4 bridges with `MutationObserver`, not 5. → 4 |
| U-04, U-05, U-06 | Not rechecked line-by-line | → 0.2–0.3, 4 |
| U-07 | Partial | `<AppIcon>` string bug fixed; desktop state-select bypass and dual batch creation remain to verify. → 0.4 |
| U-08 | Confirmed | No `.gloves` rules for `.sim-root`. → 0.7 |
| U-09 | Confirmed | 5 × `padding: '3px 0'` controls in the QR/triage path. → 0.7 |
| U-10 | Partial | `--text-2xs` now maps to `--size-micro-screen`; `sim.css` overrides not rechecked. → 4 |
