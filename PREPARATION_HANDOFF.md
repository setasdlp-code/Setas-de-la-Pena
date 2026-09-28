# Preparation snapshot — local checkpoint

Goal: every executed batch has one explicit versioned preparation specification. Preserve biology/scoring, recipe locks and dry mass semantics. No production data exists; use isolated synthetic browser fixtures only.

Baseline: fresh origin/main c489960e3b799fc0f9c523f8a5f7431fdddd70f2. Branch codex/preparation-snapshot. Worktree /private/tmp/setas-preparation-snapshot. All changes uncommitted. No push, PR, merge, deployment, credentials, production writes authorized.

Implemented: launch-plan.js buildPreparationSnapshot / isPreparationCurrent, additive plan.preparation and lote.preparation plus spawnKg; target dry mass retained for historical peseSeco, achieved rounded mass separate; explicit inventory 1g conversion vs requested scale. JSX shared numBags/kgBag/hObj with prod aliases and session drafts, snapshot inputs/provenance, calcBatch optional snapshot, shared print rows, readiness, both launch paths and stale guards. Readiness now uses snapshot inventory requirements and provenance. Invalid moisture controls stay visible outside suppressed print sheet. Generated bundle and sw stamp rebuilt with node build.js.

Evidence already read: AGENTS.md, SETAS_OS_CANONICAL.md, manifest, architecture, formulation-engine skill and references, launch-plan.js/tests, launch-lote-records.test.js, perito-readiness.js/tests, relevant JSX only. Production search remains runHybridRecipeSearch -> perito-scenarios; unchanged. Read-only reviewer confirmed additive protected Firestore storage passes current rules; public trace remains whitelist. Reviewer final diff review failed due usage limit; initial review complete only.

Verified: initial focused 36/36 passed; existing e2e/perito-readiness.browser.cjs passed (real React + mobile). Full npm test before final refinements: 898/899, one obsolete source regex expected effectiveINGS; updated it to prodIngs. Focused perito-ui-bridge + snapshot after update 8/8 passed. Final complete npm test still needed. Final diff check still needed.

Immediate remaining blocker: NEW e2e/preparation-snapshot.browser.cjs timed out on #prod-bags after navigate(produccion). Likely harness navigation helper changes URL without React navigation event; inspect navigation-state.js and existing harness UI navigation. Do NOT change product navigation just to satisfy harness. Local log /private/tmp/preparation-e2e.log. New test has network blocked except 127.0.0.1, fresh browser context, synthetic localStorage only; must verify moisture/water/stock/print, invalid input recovery, stale previews in both launch paths, isolated records/stock consumption, mobile. Screenshots planned /private/tmp/preparation-mobile.png. None produced yet by new test.

Next: fix harness navigation, run new test, fix actual defects only; inspect desktop/mobile screenshot. Run npm test to log and read summary/failing names only, node build.js if JSX changed, git diff --check. Review final diff. Write final handoff with limitations; no publication. Review rounding target versus achieved and legacy economics semantics carefully.

Dependency reuse: app/node_modules is a task-created symlink to /private/tmp/setas-history-eligibility/field-os-simulador/setas-os/node_modules; no packages installed. Exclude/remove only this symlink from deliverable (never delete target). Other contributors worktrees preserved. Original worktree .codex untracked untouched.

Budget constraints: user has only ~5% weekly allowance until September 19. No more subagents unless specifically reauthorized. Do not reread entire JSX or dump assertion actuals (over 1MB source). Read small line ranges, bounded logs. Keep work to finishing verification and minimal fixes. All larger logs are /private/tmp/preparation-*.log.
