Goal: Trial, preparation and harvest capture represent only what the operator knows.
Scope: simulador-app.jsx and generated bundle/cache; focused capture contracts/tests and local browser harness. Preserve formulation/scoring, authentication, inventory and existing gram/kg contracts; no synthetic operational records.
Baseline: fresh origin/main 5217ff3bc78a5b7998f24580fe4d727d24a376ed; codex/operator-capture; clean isolated /Users/sebastianpinzon/Projects/setas-operator-capture. Original checkout and two existing worktrees preserved.
Mode: implement
Owner: Codex lead; capture_review read-only schema/science/cross-module reviewer.
Evidence: AGENTS.md; SETAS_OS_CANONICAL.md; setas-os.json; ARCHITECTURE.md; simulador-app.jsx capture handlers; bitacora-model.js and historical-calibration.js/tests; e2e/field-qr-capture.browser.cjs.
Baseline findings: numeric fallback coercion in trial and preparation inputs; assumed harvest quality; calculated dry mass stored as observation; local save failures swallowed; reopening resets drafts. Existing harvest storage is grams, dry substrate storage kg.
Acceptance checks: clearing stays blank through blur; missing optional measurements serialize as null and zero stays zero; explicit grams/kg boundaries; invalid/failed saves keep input and focus first invalid field; draft recovery after navigation/reload; keyboard and 390px browser flows; focused behavioral tests; node build.js; npm test; git diff --check.
Authority: local implementation and non-destructive isolated validation only. No production writes, deployment, push, PR, merge, purchases or credential changes.
GitHub: none.
Stop when: acceptance checks pass and local handoff reports evidence and limitations.
