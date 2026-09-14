# Historical outcome eligibility — local handoff

## Task card

Goal: Perito calibrates only explicitly eligible final historical outcomes.
Scope: historical-calibration.js; cycle-evidence.js and production-learning import; three presentation bridges; Formulador/Recetario JSX and generated bundle/cache stamp; focused tests and isolated browser harness. No biological weights, minimum samples, operational backfill, Firebase/auth changes, or production writes.
Baseline: fresh origin/main d61439c9251fa1ab2f2fe8f7bea2610d969eeeae; clean isolated branch codex/perito-history-eligibility at /private/tmp/setas-history-eligibility. Original checkout's staged/unstaged UI work preserved.
Mode: implement → local handoff.
Owner: Codex lead; history_reviewer read-only.
Evidence: ARCHITECTURE.md; SETAS_OS_UX_ARCHITECTURE_V2.md §10/18; historical-calibration.js; historical-calibration.test.js; batch-sheet.js; cycle-evidence.js; simulador-app.jsx.
Acceptance: invalid/missing EB excluded; partial harvest excluded from final outcomes; explicit final zero representable; source deduplication; deterministic empty theory; focused/full tests, build, diff check and desktop/mobile browser.
Authority: local implementation and non-destructive isolated validation. No push, PR, merge or deployment.
GitHub: none.
Stop: acceptance passes and local changes handed off.

## Contract

`outcome: {status, verified}` distinguishes `missing`, `partial`, `completed-success`, and `completed-zero-yield`. The latter two require `verified: true`, a finite EB in the pre-existing 0–400 domain, consistent zero/nonzero status, a recipe array and a source identity. Here “success” only means positive final yield; “verified” means explicit completion confirmation, not scientific confidence or biological approval.

- `finiteEB` rejects null, blank, whitespace, booleans, malformed numeric strings and non-finite values before coercion.
- Bitácora derives a final positive outcome only from a completed batch (`lifecycleState` takes precedence over legacy `estado`; closed/completado/cerrado aliases) and valid, identified harvests with positive dry mass. No harvest stays missing. Final zero requires explicit zero-yield confirmation plus batch completion; no default zero is inferred.
- The existing final-EB handler now persists confirmation and is reachable in the active recipe card. Legacy unmarked EB remains contextual until explicitly reconfirmed. No existing records are modified on load.
- Batch identity (`loteId`/`batchId`) unifies source representations. Otherwise source + record ID identifies a trial. Identical copies count once. Contradictory copies, including partial/final lifecycle conflicts, are excluded without choosing an undocumented “latest” record. Harvest IDs deduplicate weights; invalid/conflicting weights exclude the batch.
- `assessHistory` returns eligible rows, all classified observations, counts and exclusion reasons. `bitacoraEBRows` remains final-only; `bitacoraObservations` and `bitacoraAsTrialRows(..., {includeIncomplete:true})` retain context.
- `historicalEB` keeps its zero-weight empty result; `weightedCalibration` keeps returning null without eligible evidence. Existing weights, similarity thresholds and confidence rules remain unchanged.

## Consumer trace

1. `simulador-app.jsx` → Bitácora observations → `historicalEB` → gauges, `blendEBWithHistory`, Perito/auto-improvement. Saved-trial model accuracy and similar-result claims also use eligibility.
2. React `setas-perito-input` snapshot → `perito-ui-bridge.js` → shared weighted calibration → scoring/readiness. The evidence panel shows counts and exclusion reasons, including when all observations are excluded.
3. `perito-scenarios-bridge.js` and `recetario-model-bridge.js` → shared weighted calibration. Both retain incomplete inputs until the shared eligibility boundary. Recetario's actual-versus-estimated EB claim checks eligibility.
4. Active generator: `runHybridRecipeSearch` → `SetasPeritoScenarios.searchScenarios` in `perito-scenarios.js`. Its theoretical score adapter and `history: []` remain unchanged. The scenario bridge's recipe novelty history remains contextual and makes no final-EB claim.
5. `production-learning-bridge.js` wraps active search with contextual evidence only. `cycle-evidence.js` now distinguishes final batch outcomes from room-stage observations and deduplicates batch samples. A closed room stage does not prove a completed batch. Generator evidence shows exclusions. This path still does not adjust scenario scoring.
6. `recipe-optimizer.js` remains the untouched legacy/parity oracle. `ground-truth-regression.js` is an offline evaluation consumer, not an operational calibration input.

## Validation and limitations

The two original regressions failed before implementation: null produced meanEB=0/n=1; an unfinished batch's first harvest produced final EB50. Focused tests now cover these and boundary cases. The independent reviewer reproduced a conflicting-lifecycle duplicate issue; it was fixed and the reviewer verified 15/15 eligibility/cycle tests with no remaining blocking findings.

Run from this app directory:

```sh
node build.js
node --test history-eligibility.test.js historical-calibration.test.js historical-calibration-wiring.test.js cycle-evidence.test.js
npm test
node e2e/history-eligibility.browser.cjs
git diff --check
```

The browser test uses the repository's real React harness, native adapter and scoring at 1280px and 390px. It blocks external requests, uses fresh browser contexts and localhost storage, verifies visible exclusions, confirms zero via the active recipe card, reloads persisted data, then verifies empty-history theory. Fixtures are synthetic and live only in test code/isolated storage.

Legacy room-stage snapshots without explicit outcomes remain contextual. Contradictory stage snapshots remain excluded until reconciled; no new reconciliation workflow or automatic migration is introduced. Physical duplicates lacking a shared batch/source identity cannot be inferred from recipe similarity. There are no prototype production data or verified yield improvements.

The initial delivery was local and uncommitted. A subsequent user instruction authorized committing and pushing this isolated branch. PR creation, merge and deployment remain unauthorized.

Verified final results: build completed; focused suite 50/50; `npm test` 896/896; browser 1280px and 390px passed with no page errors; both screenshots inspected without overflow; `git diff --check` clean.

Changed files (all relative to this app root):
- Domain: historical-calibration.js, cycle-evidence.js.
- Consumers: perito-scenarios-bridge.js, perito-ui-bridge.js, recetario-model-bridge.js, production-learning-bridge.js, simulador-app.jsx.
- Generated: simulador-app.js, sw.js (from node build.js).
- Tests: history-eligibility.test.js, historical-calibration.test.js, cycle-evidence.test.js, core-logic-engines-robustness.test.js, perito-ui-bridge.test.js, perito-evidence-display.test.js, e2e/history-eligibility.browser.cjs.
- Handoff: HISTORY_ELIGIBILITY.md.
