# Stage 0 — Containment Implementation Plan (for Gemini 4 Argon)

> **For agentic workers:** execute task by task, in order. Each task is one branch and one PR. Steps use checkbox (`- [ ]`) syntax. Read **Global Constraints** and **Stop Conditions** before starting, and re-read them before each commit.

**Goal:** Stop Setas OS from producing misleading data or allowing unsafe actions in field use for Lot 1 (*Lentinula edodes*), without waiting for the larger sync, science or shell work.

**Architecture:** These are small, local fixes inside the existing app. They add no new modules and do no refactors. React code lives in `simulador-app.jsx` and is bundled by `node build.js` into `simulador-app.js` + `sw.js`, both versioned. Domain logic lives in plain JS modules (`substrate-*.js`, `scoring.js`, `bitacora-model.js`), and each has a `node:test` file next to it.

**Tech Stack:** React (JSX via `build.js`), vanilla JS UMD modules, `node --test` (unit), Playwright `.browser.cjs` scripts in `e2e/` (browser), Firebase (not touched here).

**Spec:** [`docs/superpowers/plans/2026-10-17-setas-os-lot1-viability-final-plan.md`](./2026-10-17-setas-os-lot1-viability-final-plan.md), §4 Stage 0. Read it first. Its appendix explains why some original audit findings are excluded here.

**App root:** every path below is relative to `field-os-simulador/setas-os/` unless it starts with `docs/` or `knowledge_base/`. Line numbers are as of `main` @ `259c37bc` and **will drift**, so always locate code by the quoted symbol or string and use the line number only as a hint.

## Global Constraints

- Read `SETAS_OS_CANONICAL.md`, `AGENTS.md`, `CLAUDE.md` and `CONTEXT.md` (repo root) before Task 1.
- Create one branch per task from up-to-date `main`, named `gemini/stage0-<task-slug>`. Never commit to `main`; only Sebastián merges.
- Run `git status` and `git diff` before editing. Do not overwrite uncommitted work you did not create.
- If you edit `simulador-app.jsx`, run `node build.js` and commit the regenerated `simulador-app.js` and `sw.js` in the same commit. Never hand-edit those two files.
- To bring `main` into a branch, run `sh scripts/git/merge-main.sh` from the repo root. Do not merge by hand.
- Run `npm test` and `git diff --check` before every commit. Both must pass.
- Do not modify `knowledge_base/`, `firebase/firestore.rules`, `setasdlp-code/Field-OS` or `setasdlp-code/simulador`. Do not touch credentials or `firebase/` config.
- UI copy is Spanish and uses the `CONTEXT.md` vocabulary (Formulador, Perito, Escenario, Lote). Do not write "óptimo", "mejor" or "siempre" about a cultivation parameter.
- Never fabricate a number to fill an empty state. Show that the data is missing.
- Commit messages are in Spanish, conventional style (`fix(hoy): …`), and end with your own agent attribution line.

## Stop Conditions (halt and ask Sebastián; do not work around)

1. Any change to `scoring.js` (it has a SHA-256 guard, `scoring-integrity.test.js`, under ADR-0004). Task 1 needs this. Prepare the diff, then **stop before merging** and get written approval of decision D-3.
2. `npm run perito:regression` fails because `ground-truth-fixtures.json` is missing. This is expected today. Report it as **BLOCKED (no corpus)**, never as passed. Do not create or fake the corpus.
3. A finding in this plan does not reproduce on current `main`. Close the task as "not reproduced" with evidence (a grep or test output). Do not invent a fix.
4. A fix would need a new collection, a rule change or a sync change. That belongs to Stage 1 and is out of scope.

## Review Focus

- **No treatment selected yet (`ctx.treatment` undefined) for shiitake.** The recipe must not be marked approved for production. The diagnosis must say an autoclave is required. → Task 1, test `sin tratamiento: diagnóstico exige autoclave`.
- **Species key arrives as a Taxonomy B alias** (`melena_leon`). The gate must still apply, or the gap must be documented. → Task 1, test `alias de especie no evade el bloqueo`.
- **A telemetry room exists but every metric is stale.** Copilot must not receive that series. → Task 3, test `serie obsoleta no alimenta al copiloto`.
- **Old bags already stored with `estado: null`.** They show as "sin evaluar", not as healthy and not as 0% healthy. No migration write happens. → Task 5, test `bolsas legadas con estado null cuentan como sin evaluar`.
- **Desktop viewport with Modo Guantes on.** React controls in the harvest sheet are ≥ 48 px. → Task 7, browser assertion.

---

### Task 1: Sterilization policy gate for species that require autoclave

Today the canonical shiitake block (79 % `aserrin_roble`, 20 % `salvado_trigo`, 1 % `carbonato_calcio`) scored with treatment `thermal` returns status `needs_work` and is not blocked. The catalog note says "REQUIERE ESTERILIZACIÓN". This task makes it a blocking condition.

**Files:**
- Modify: `substrate-catalog.js` (the `SPP` object, around line 21): add `requires_sterilization:true` to `shiitake`, `lions_mane`, `reishi`, `nameko`. This is the list `simulador-app.jsx` already treats as autoclave by default (search `['shiitake','lions_mane','reishi','nameko']`). Do not add other species.
- Modify: `substrate-analysis.js`, `analyze()` return object: add `requiresSterilization: Boolean(sp?.requires_sterilization)`.
- Modify: `substrate-diagnosis.js` (around line 33, next to the `suppP>sp.supplementation_max` check): push `{t:'error', i:'!', tx:'Especie con esterilización obligatoria: solo autoclave. Pasteurización y cal no son aceptables para este lote.'}` when `requiresSterilization` is true.
- Modify: `scoring.js`, `buildDimensions`: add `sterilizationUnsafe = !!(an?.requiresSterilization && ctx.treatment?.col !== 'autoclave')` and OR it into `blocked`. **Change nothing else in `scoring.js`.** Do not touch `assessSeverity`, weights, caps or the `eb *= .85` line in `analyze()`.
- Modify: `scoring-integrity.test.js`: update `EXPECTED_SHA256`, and add a comment line naming this change and "aprobado D-3 por Sebastián (fecha)". Leave the date as `PENDIENTE` until approval.
- Modify: `simulador-app.jsx`, the `readyForProduction` definition (search `const readyForProduction`, around line 8282: `balanced&&hasPickedSpecies&&prepValid`): also false when the current recipe's `scoreAn(...).dimensions.safety.status === 'hold'`. The `ejecutarLote` button (search `onClick={()=>ejecutarLote(`) is already disabled on `!readyForProduction`. Update its `title` to explain the block.
- Test: create `sterilization-gate.test.js`.

**Interfaces:**
- Produces: `an.requiresSterilization: boolean` and `scoreRecipe(an, {treatment:{col}}).dimensions.safety.status === 'hold'` for unsafe combinations.

- [ ] **Step 1: Write the failing tests** in `sterilization-gate.test.js` using `node:test` + `assert/strict`, requiring `./substrate-catalog.js`, `./substrate-analysis.js`, `./scoring.js`, `./substrate-diagnosis.js` (check how `substrate-diagnosis.js` exports before requiring it):
  - `shiitake 79/20/1 con thermal queda en hold`: `analyze(r,'shiitake',INGS,SPP)` → `scoreRecipe(an,{treatment:{col:'thermal'}}).dimensions.safety.status === 'hold'`.
  - `shiitake 79/20/1 con cwlp queda en hold`: same with `'cwlp'`.
  - `shiitake con autoclave no cambia`: `score` and `status` with `{col:'autoclave'}` equal the pre-change values (record them in Step 2 from `main`: score 67, status `good`).
  - `orellana gris con thermal no se bloquea`: `p_ostreatus_gris` with a straw recipe and `thermal` → safety status ≠ `'hold'` caused by this rule (assert `an.requiresSterilization === false`).
  - `sin tratamiento: diagnóstico exige autoclave`: the diagnosis for the shiitake recipe contains an entry with `t==='error'` whose `tx` includes `'autoclave'`.
  - `alias de especie no evade el bloqueo`: `analyze(r,'melena_leon',…)`. If `sp` resolves to undefined, assert that and add `// GAP: alias resolver — Stage 5` (this documents the gap; it is not a fix).
- [ ] **Step 2:** Run `node --test sterilization-gate.test.js`. Expect FAIL on the hold assertions. Record the autoclave baseline numbers.
- [ ] **Step 3:** Make the catalog, analysis, diagnosis and `buildDimensions` changes listed above.
- [ ] **Step 4:** Run `node --test sterilization-gate.test.js`. Expect PASS. Then run `npm test`. Expect only `scoring-integrity.test.js` to fail, on the hash.
- [ ] **Step 5:** Update the hash in `scoring-integrity.test.js`. Make the `readyForProduction` change in `simulador-app.jsx`. Run `node build.js`, then `npm test`, then `npm run perito:regression`. Expect the last one to be BLOCKED (no corpus). Paste its output into the PR.
- [ ] **Step 6:** Browser check. Formulador, species Shiitake, treatment Pasteurización: the "Planificar lote" button is disabled and its tooltip shows the reason. Screenshot it for the PR.
- [ ] **Step 7:** Commit (`fix(perito): bloquear tratamientos no autoclave en especies con esterilización obligatoria`). Open the PR and **STOP** (Stop Condition 1). Do not start Task 2 on top of this branch. Task 2 starts from `main`.

### Task 2: Remove demo task fallback on Hoy

**Files:**
- Modify: `simulador-app.jsx`, Hoy block. Search `tasksHoy=JSON.parse(props.tasksHoyJson` (around line 13847). When `motorRows` is empty, `tasksHoy` stays `[]`. Delete the fallback and the comment that justifies it.
- Modify: the task list render in the same block. When `tasksHoy.length===0`, render `Sin tareas registradas para hoy.` plus a button `Registrar observación` that opens the QR/registration sheet (`setShowQrSheet(true)`).
- Test: extend `e2e/today-exceptions.browser.cjs` (or add an assertion file next to it, following its pattern).

- [ ] **Step 1:** Add a browser assertion: on a clean account (no `sdp_bit_tasks`), the Hoy page text contains none of `C-0414`, `L-2608`, and contains `Sin tareas registradas para hoy.`
- [ ] **Step 2:** Run `node e2e/today-exceptions.browser.cjs`. Expect FAIL (demo tasks shown).
- [ ] **Step 3:** Remove the fallback and add the empty state.
- [ ] **Step 4:** Run `node build.js`, `node e2e/today-exceptions.browser.cjs` and `npm test`. Expect PASS.
- [ ] **Step 5:** Commit `fix(hoy): sin tareas demo cuando el motor no tiene tareas`.

### Task 3: Copilot, biological clock and contamination risk read only real telemetry

Today `copilotSeriesByRoom` (search for it, around line 13864) is built from `props.hoyCamarasJson`. That is the shell's synthetic sine-wave cameras (`liveMonitor` in `Setas OS v5.dc.html`, around line 2402), dated "1 reading per hour ending now".

**Files:**
- Create: `copilot-series.js` (UMD like its siblings; export on `globalThis.SetasCopilotSeries` and `module.exports`) with `buildCopilotSeriesByRoom(snapshotRooms: object, { nowMs: number, maxAgeMs: number, minPoints: number }) -> { seriesByRoom: { [roomId]: Array<{t, temperature_c, rh_pct, co2_ppm}> }, stateByRoom: { [roomId]: 'measured'|'stale'|'missing'|'insufficient' } }`. Input is `liveTelemetry.snapshot.rooms`; read the per-room `series` shape in `live-telemetry-bridge.js` (around line 288, `SERIES_METRICS`). Defaults are `maxAgeMs = 30*60*1000` and `minPoints = 6`. Mark both as provisional in a comment. Only `measured` rooms get a series.
- Modify: `auth-gate.js` script list. Load `copilot-series.js` before `simulador-app.js`, following the existing deferred-script pattern.
- Modify: `simulador-app.jsx`. Replace the `camaras.forEach` series construction with `SetasCopilotSeries.buildCopilotSeriesByRoom(liveTelemetry.snapshot.rooms, {nowMs: operationalNow})`. Check whether `liveTelemetry` is in scope at that point (it is created around line 6961). Thread it in if needed. In the Copilot / clock / risk cards, show `Sin telemetría medida` or `Telemetría desactualizada` per `stateByRoom` instead of a recommendation.
- Do **not** remove `hoyCamarasJson` from the climate dashboard in this task (around line 12006). Leave a `// TODO Stage 4: cámaras demo` comment there and list it in the PR.
- Test: `copilot-series.test.js`.

- [ ] **Step 1: Failing tests** in `copilot-series.test.js`:
  - `sala sin datos → missing`: `{}` → `stateByRoom` is empty and `seriesByRoom` is `{}`.
  - `serie fresca y suficiente → measured`: 6 points, newest 1 min old → state `measured`, 6 entries with numeric `t`.
  - `serie obsoleta no alimenta al copiloto`: newest point 31 min old → state `stale`, no entry in `seriesByRoom`.
  - `serie corta → insufficient`: 3 fresh points → state `insufficient`, no series.
- [ ] **Step 2:** Run `node --test copilot-series.test.js`. Expect FAIL (module missing).
- [ ] **Step 3:** Implement `buildCopilotSeriesByRoom`.
- [ ] **Step 4:** Run `node --test copilot-series.test.js`. Expect PASS.
- [ ] **Step 5:** Wire it into `simulador-app.jsx` and `auth-gate.js`. Run `node build.js` and `npm test`. Check `auth-gate.test.js` in particular, since it may assert the script list. Update it if so.
- [ ] **Step 6:** Browser check with no ESP32 connected: Hoy shows `Sin telemetría medida`, and no Copilot recommendation cites temperature or CO₂.
- [ ] **Step 7:** Commit `fix(hoy): el copiloto solo usa telemetría medida y vigente`.

### Task 4: Desktop opens the batch sheet, not the legacy bag table

`goBitTab(isMobileViewport ? 'bit_ficha' : 'bit_bolsas', true)` appears at two call sites (around lines 13427 and 14545). On desktop this skips `BatchDetailV2`. Lot state changes already go through `workflow.transitionEvent` (around line 11072), so no raw lot-state bypass was reproduced. The per-bag `bagStatus-*` select is a legitimate bag-health edit, so keep it.

**Files:**
- Modify: `simulador-app.jsx`, both call sites → `goBitTab('bit_ficha', true)`.
- Modify: `BatchDetailV2` (`bit_ficha`). If it does not already link to the bag table, add a button `Ver tabla de bolsas` → `goBitTab('bit_bolsas', true)`.
- Test: extend `e2e/lot-lifecycle.browser.cjs`.

- [ ] **Step 1:** Add an assertion: at a 1280×800 viewport, clicking a batch card lands on the `bit_ficha` view: `[data-testid="ux-v2-batch-detail"]` is visible.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Change both call sites, and add the link if it's missing.
- [ ] **Step 4:** Run `node build.js`, the e2e script and `npm test`. Expect PASS.
- [ ] **Step 5:** Verify the trial path (`crearBitLote(SetasBitacora.normalizeTrialCapture(...))`, around line 17686). Confirm the UI labels it as a trial or experimental lot and that it does not claim to reserve stock. If the label is missing, add `Lote de ensayo · sin reserva de Bodega`. Otherwise note "verified" in the PR.
- [ ] **Step 6:** Commit `fix(bitacora): la ficha del lote es la vista única en escritorio y móvil`.

### Task 5: New bags are "sin evaluar", not null and not "sana"

**Files:**
- Modify: `simulador-app.jsx`, `crearBitLote` (search `const crearBitLote`, around line 9380). In the bag factory, `estado:null` → `estado:'sin_evaluar'`.
- Modify: `bitacora-model.js`, `calcLoteStats`. Add `bolsasSinEvaluar = bolsas.filter(b => b.estado == null || b.estado === 'sin_evaluar').length` to the returned object. Leave `bolsasSanas` unchanged.
- Modify: the `bagStatus-*` select options (around line 13581). Add `<option value="sin_evaluar">Sin evaluar</option>`. Keep the existing options.
- Modify: the lot stat tile `['Bolsas sanas', …]` (around line 13706). When `stats.bolsasSinEvaluar > 0`, append ` · ${n} sin evaluar`.
- Do **not** change the code that defaults `estado || 'sana'` elsewhere (lines 6615, 11896) in this task. List those sites in the PR as follow-ups, because each one needs a decision on whether "sin evaluar" is eligible for harvest.
- Do **not** change room-load counting for `aislada`. Per the spec, quarantined bags still occupy space.
- Test: `bitacora-model.test.js`.

- [ ] **Step 1: Failing tests**:
  - `bolsas legadas con estado null cuentan como sin evaluar`: 3 bags with `estado:null` → `bolsasSinEvaluar === 3` and `bolsasSanas === 0`.
  - `mezcla sana/sin_evaluar/contaminada`: the counts are 1/1/1.
- [ ] **Step 2:** Run `node --test bitacora-model.test.js`. Expect FAIL.
- [ ] **Step 3:** Implement the model change, then the JSX changes.
- [ ] **Step 4:** Run `node build.js` and `npm test`. Expect PASS. `grep -n "sin_evaluar" simulador-app.jsx` should show the factory, the option and the tile.
- [ ] **Step 5:** Commit `fix(bitacora): bolsas nuevas sin evaluar en lugar de estado nulo`.

### Task 6: No fabricated FAE recommendation

`calcDynamicFAE` (around line 12937) reads `mainLote.pesoLote` and `mainLote.especieKey`. Neither field exists on Bitácora lots. It falls back to `25.0` kg of `'orellana_gris'`.

**Files:**
- Modify: `simulador-app.jsx`, that IIFE. If `mainLote` lacks a finite `pesoHumedo` **and** a species key (`sKey || especie`), skip `calcDynamicFAE` and render `Sin datos de biomasa para calcular renovación de aire.` Otherwise call it with `pesoHumedo` and that species key. Keep the existing `* 0.22` factor and mark it `// provisional — Stage 3.3 calcula por lote`. Remove the `25.0` and `'orellana_gris'` literals.
- Test: browser assertion in `e2e/climate-accessibility.browser.cjs` (or the nearest climate e2e).

- [ ] **Step 1:** Add an assertion: with no lots in the selected room, the FAE card text contains `Sin datos de biomasa` and no `CFM` number.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Implement the change.
- [ ] **Step 4:** Run `node build.js`, the e2e script and `npm test`. Expect PASS. `grep -n "orellana_gris'" simulador-app.jsx` must not show the FAE site.
- [ ] **Step 5:** Commit `fix(clima): sin recomendación FAE sin biomasa real`.

### Task 7: Wet-room tap targets and reachable Modo Guantes

**Files:**
- Modify: `simulador-app.jsx`, inside the `showQrSheet` block (search `{showQrSheet&&(()=>{`, around line 17929). Every inline style with `padding: '3px 0'`, `padding: '4px 2px'` or `minHeight: 32` on a **button** (around lines 18045, 18095, 18115, 18348, 18364) gets `minHeight: 48` and `fontSize: 13`. Leave the `padding:'3px 0'` on non-interactive rows (for example around line 16734) alone.
- Modify: the contamination triage stepper (around line 20270): `minWidth: 48, minHeight: 48`.
- Modify: `Setas OS v5.dc.html`. Move the `gloves-toggle` button (around line 419) out of `.workspace-subnav` into the persistent top header, so it is visible on every tab. Reuse the existing styles (around lines 198–202 and 283–284).
- Modify: the `.gloves` CSS (around line 302). Add `.gloves .sim-root button, .gloves .sim-root select, .gloves .sim-root input, .gloves .rail-mobile-btn { min-height:56px; }`. First confirm which element carries the `gloves` class and that `.sim-root` is its descendant; adjust the selector to match.
- Test: extend `e2e/field-qr-capture.browser.cjs`.

- [ ] **Step 1:** Add assertions:
  - At a 390×844 viewport, the gloves toggle is visible on Hoy and Salas.
  - With the QR sheet open in harvest mode, every `button` in it has `getBoundingClientRect().height >= 48`.
  - At 1280×800 with gloves on, those same buttons are ≥ 56.
- [ ] **Step 2:** Run it. Expect FAIL.
- [ ] **Step 3:** Make the changes.
- [ ] **Step 4:** Run `node build.js`, `node e2e/field-qr-capture.browser.cjs`, `npm test` and `npm run test:gates` (the mobile gate). Expect PASS.
- [ ] **Step 5:** Commit `fix(campo): objetivos táctiles ≥48px y modo guantes visible en todas las vistas`.

---

## Out of scope (do not start)

- DCLogic screen retirement and Hoy CTA rerouting (`onGoSesion`, `onGoRev*`, `onActivityGo`, `onOpenCamara`). These need a parity checklist per workflow (Stage 4). If you notice a CTA that lands on demo data, record it in the PR description only.
- Sync, rules and migration work (Stage 1), scientific recalibration (blocked on corpus D-4), and actuators.

## Definition of done for Stage 0

Seven PRs, one per task, each with:
- `npm test` passing;
- `node build.js` artifacts committed when the `.jsx` changed;
- browser evidence (screenshot or e2e output);
- Task 1 explicitly marked **awaiting D-3 approval**, with `perito:regression` reported as BLOCKED (no corpus).
