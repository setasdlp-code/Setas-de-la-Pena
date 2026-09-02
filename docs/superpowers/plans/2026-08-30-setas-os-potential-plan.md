# Setas OS — Capability Plan (Skills, Guardrails, Verticals)

Status: proposed, not started
Author: Claude Code (Opus 5), 2026-08-30
Scope: `field-os-simulador/setas-os/`, `knowledge_base/`, `.claude/skills/`, `docs/adr/`
Governing docs: [`AGENTS.md`](../../../AGENTS.md), [`SETAS_OS_CANONICAL.md`](../../../SETAS_OS_CANONICAL.md), [`CONTEXT.md`](../../../CONTEXT.md), [`PRODUCTION_LEARNING_LOOP_V1.md`](../../../field-os-simulador/setas-os/PRODUCTION_LEARNING_LOOP_V1.md)

## 0. Baseline correction

`PRODUCTION_LEARNING_LOOP_V1.md` lists five "Next vertical" items. Verified status as of 2026-08-30:

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Auto-trigger `CycleEvidence` at harvest/close milestones | **Not done** | `materializeCycleEvidence()` exists in `production-learning-bridge.js:70` but has no milestone caller |
| 2 | ESP32 payload adapter → `setas.telemetry.v1` | **DONE** | `esp32-telemetry-adapter.js` (14.7KB) + `esp32-telemetry-adapter.test.js` |
| 3 | `Hoy` exceptions (stale sensors, quarantined readings, deviations) | **Data layer only** | quarantine logic in `telemetry-contract.js`; no UI surface |
| 4 | Surface contextual evidence in Perito explanations | **Wired, not shown** | bridge attaches `historicalEvidence`/`productionLearning` (`production-learning-bridge.js:133`); zero `.jsx` consumers |
| 5 | Gated calibration model | **Correctly blocked** | only `ground-truth-fixtures.example.json` exists; no real corpus |

The doc should be updated to reflect this (W0.3 below).

## 1. The thesis

Setas OS has strong bones: 51 `node:test` files, Playwright e2e, Lighthouse CI, versioned data contracts (`setas.*.v1`), server-side mass-balance validation in `firestore.rules`, and an MCP server exposing the knowledge base. Its scientific governance is genuinely thoughtful — the confidence caps, the data-class separation rule, the refusal to let observational history touch ranking weights.

**The gap is that none of that governance is enforceable.** It lives in prose that an agent reads only by accident. Meanwhile `.claude/skills/` holds 14 skills, all of them visual-design. The plan below converts governance-as-prose into governance-as-tooling, then unblocks the four remaining verticals.

## 2. Model routing policy for this plan

This plan's delegation respects the live CCR rules in [`ccr-routing-strategy.md`](../../ccr-routing-strategy.md). Claude Code defaults to `claude-sonnet-5`; the priority-2.5 rule explicitly blocks auto-escalation to Opus below 50k tokens unless the prompt contains `architecture`, `cross-module`, `implementation plan`, or `research synthesis`.

**Consequence for these prompts:** Opus-tier task cards below deliberately contain one of those keywords in the Goal line. Sonnet-tier cards deliberately avoid them, so routine implementation doesn't burn flagship budget on a false-positive match.

| Tier | Route | Use for | Why |
|------|-------|---------|-----|
| Flagship | `claude-opus-5` | Scientific governance, ADRs, security-rule audit, calibration gating | AGENTS.md §3 escalation tier: cross-module design, scientific claims, irreversible decisions |
| Workhorse | `claude-sonnet-5` | Skill authoring, checker scripts, UI verticals, tests | Bounded diffs with clear acceptance checks |
| Budget | `claude-haiku-4-5` | Bulk value extraction, inventory sweeps, link checks | Mechanical, single-turn, no reasoning |
| Forensics/delivery | Codex → `gpt-5.6-terra` | Git/CI evidence, integration, PR delivery | AGENTS.md §2 role table |
| Read-only challenge | Antigravity | Independent audit of W1 outputs | AGENTS.md §2: independent reviewer for high-consequence work |

## 3. Workstreams

### Wave 0 — Foundations (blocking; nothing else should start first)

**W0.1 — `agronomic-claims` skill** *(Opus)*
The single highest-value item in this plan. Encode as an auto-loading skill (`user-invocable: false`) the rules currently stranded in prose:
- the data-class separation rule (setpoints / physical validation bounds / literature targets / farm-measured distributions are never interchangeable);
- confidence caps (a single observational cycle never exceeds `medium`; observational history never reaches `high`);
- the prohibition on observational data influencing `scoring.js` ranking weights;
- `knowledge_base/AGENTS.md` evidence tiers (Tier 1/2/3, field-measured, unverified) and the ban on "best"/"always"/"optimal" without measured evidence.

Lands at `.claude/skills/agronomic-claims/SKILL.md`. Acceptance: an agent asked to "improve the EB prediction using recent batch data" cites the rule and refuses to silently recalibrate.

**W0.2 — Bootstrap `docs/adr/`** *(Opus)*
`docs/agents/domain.md` and `CLAUDE.md` both reference `docs/adr/`; it does not exist. Write the decisions already made and justified elsewhere:
- ADR-0001 Setas OS is an internal production/learning system, not multi-tenant SaaS
- ADR-0002 Zero-build static architecture (single esbuild step for `simulador-app.jsx`)
- ADR-0003 localStorage as operational cache, Firebase as persistence
- ADR-0004 Production evidence is contextual to Perito, never an input to ranking
- ADR-0005 Deterministic document IDs for idempotent retries
- ADR-0006 Data-class separation (cross-references W0.1)

**W0.3 — Refresh the loop doc** *(Haiku)*
Update `PRODUCTION_LEARNING_LOOP_V1.md` "Next vertical" to the verified status in §0.

### Wave 1 — Guardrails (parallel; disjoint files)

**W1.1 — Firestore rules audit** *(Opus, read-only; fixes are a separate human-approved PR)*
Run `firebase-security-rules-auditor` against `firebase/firestore.rules`. Specific surfaces: the `get(/usuarios/$(uid))` role lookup on every rule evaluation (cost + resource exhaustion), create-vs-update validation asymmetry, whether `masaBalanceada` is enforced on update as it is on create, missing `hasOnly` ownership constraints, and rules for the three newer collections (`room_cycles`, `telemetry_readings`, `cycle_evidence`). Deploy is human-only per the file's own header.

**W1.2 — `perito-regression` skill** *(Sonnet)*
`ground-truth-regression.js` is a well-built harness with no runner and no corpus. Build the skill that: runs the fixture suite against current `scoring.js`, reports `meanAbsErrorEB` / `maxAbsErrorEB` deltas vs the previous commit, and **fails loudly when the corpus is absent** rather than reporting a vacuous pass. This is the gate the loop doc mandates before any calibration change.

**W1.3 — `kb-sync` checker** *(Sonnet writes the script; Haiku does the extraction pass)*
`knowledge_base/` is declared canonical for content, but nothing verifies the app agrees with it. Cross-check species parameters in `knowledge_base/01_species/*.md` and substrate values in `02_substrates/` against `extraction-factors.json` and the species targets in the app. Output a divergence report; do not auto-fix — per `knowledge_base/AGENTS.md`, canonical edits need explicit authorization.

### Wave 2 — The four remaining verticals

**W2.1 — Auto-trigger `CycleEvidence`** *(Sonnet)* — call `materializeCycleEvidence()` at harvest/close milestones; idempotent via existing `cycleId + batchId` identity.
**W2.2 — `Hoy` exceptions** *(Sonnet)* — surface stale sensors, quarantined readings, environmental deviations, and batches deviating from historical cycle duration. Data layer exists; this is the UI.
**W2.3 — Evidence in Perito explanations** *(Sonnet)* — render `historicalEvidence`/`productionLearning` already attached to scenario results. Explanation only; **must not** touch scoring (ADR-0004).
**W2.4 — Gated calibration** *(Opus; PARKED)* — unblock criterion: enough real `ebReal` batches that `ground-truth-fixtures.json` is evidence rather than noise. Do not start before W1.2 is green on a real corpus.

### Wave 3 — Interface quality

**W3.1 — Field-surface accessibility pass** *(Sonnet)* — `accessibility-review` + `web-interface-guidelines` against the mobile surface covered by `e2e/mobile.spec.js`. Real context: phones, gloves, humid growing room, variable light.
**W3.2 — Prune the skill shelf** *(Haiku)* — 14 aesthetic skills is over-provisioned for an internal ops tool. Inventory, keep at most three, archive the rest.

### Wave 4 — Explicitly parked

Splitting `simulador-app.jsx` (11,933 lines). **Not now.** Trigger condition: when two or more Wave 2 verticals are blocked on merge conflicts in that file. Until then the monolith is stable and well-tested; churn buys nothing.

## 4. Delegation prompts

Copy verbatim. Each uses the AGENTS.md §2 task card. Keyword choice is deliberate — see §2.

---

### W0.1 → Claude Code / `claude-opus-5`

```text
Goal: Author an auto-loading agronomic-claims skill encoding Setas OS scientific
      governance — a cross-module research synthesis of rules currently stranded in prose.
Scope: create .claude/skills/agronomic-claims/SKILL.md only. Do not modify app code,
       knowledge_base/, or any scoring/evidence module.
Baseline: branch off current main; new branch feat/skill-agronomic-claims.
Mode: implement
Owner: Claude Code (lead). Collaborators: none.
Evidence to load (exactly these five):
  - field-os-simulador/setas-os/PRODUCTION_LEARNING_LOOP_V1.md  (safety/quality rule; confidence caps)
  - knowledge_base/AGENTS.md                                     (evidence tiers; editing contract)
  - CONTEXT.md                                                   (Formulador/Perito/Escenario/Lote vocabulary)
  - field-os-simulador/setas-os/cycle-evidence.js                (how confidence is actually computed)
  - field-os-simulador/setas-os/scoring.js                       (what must NOT be recalibrated)
Acceptance checks:
  1. Frontmatter sets `user-invocable: false` so it loads without being asked for.
  2. Encodes the data-class rule: setpoints, physical validation bounds, literature
     targets, and farm-measured distributions are four distinct classes, never substituted.
  3. Encodes confidence caps: one observational cycle <= medium; observational history
     never high.
  4. Encodes the ADR-0004 boundary: production evidence is Perito context only, never a
     scoring/ranking input.
  5. Uses CONTEXT.md vocabulary exactly; does not reintroduce "optimizer"/"scenario
     generator" as user-facing terms.
  6. Bans absolute language ("best", "always", "optimal") absent measured evidence.
  7. Includes one worked refusal example: an agent asked to "improve EB prediction from
     recent batch data" cites the rule and declines to recalibrate silently.
Authority: create the skill file, run `node --test *.test.js` to confirm nothing broke.
           Requires human approval: merging to main.
GitHub: PR delivery requested; human review/merge gate.
Stop when: the skill file exists, is under 250 lines, and a fresh agent reading only that
           file could correctly refuse the example in check 7.
```

---

### W0.2 → Claude Code / `claude-opus-5`

```text
Goal: Bootstrap docs/adr/ with the architecture decisions already made and justified
      across scattered docs — a cross-module synthesis, not new decision-making.
Scope: create docs/adr/0001..0006 only. Change no code and no existing doc except
       adding an index if docs/agents/domain.md expects one.
Baseline: branch off current main; new branch docs/adr-bootstrap.
Mode: implement
Owner: Claude Code (lead).
Evidence to load:
  - docs/agents/domain.md                                        (expected ADR format/location)
  - field-os-simulador/setas-os/PRODUCTION_LEARNING_LOOP_V1.md   (ADR-0001, 0004, 0005, 0006)
  - field-os-simulador/setas-os/ARCHITECTURE.md                  (ADR-0002)
  - SETAS_OS_CANONICAL.md                                        (canonical-location decision)
  - field-os-simulador/setas-os/production-learning-bridge.js    (ADR-0003 cache/persistence split)
Acceptance checks:
  1. Six ADRs: 0001 internal-not-SaaS; 0002 zero-build static; 0003 localStorage cache +
     Firebase persistence; 0004 evidence-is-context-not-score; 0005 deterministic doc IDs;
     0006 data-class separation.
  2. Each states Context / Decision / Consequences and cites the file that justifies it.
  3. Each records the decision that was ACTUALLY made — do not invent rationale. Where the
     source docs don't explain a "why", write "Rationale not recorded at decision time"
     rather than reconstructing one.
  4. ADR-0006 cross-references the agronomic-claims skill from W0.1.
  5. Vocabulary matches CONTEXT.md.
Authority: create files only. Requires human approval: merging to main.
GitHub: PR delivery requested; human review/merge gate.
Stop when: six ADRs exist and docs/agents/domain.md's stated expectations are satisfied.
```

---

### W1.1 → Claude Code / `claude-opus-5` (invoke `firebase-security-rules-auditor`)

```text
Goal: Security architecture audit of Firestore rules, including the three
      production-learning collections. Read-only — produce findings, change nothing.
Scope: read field-os-simulador/setas-os/firebase/. Write only the report at
       docs/superpowers/specs/2026-08-30-firestore-rules-audit.md.
Baseline: current main. No branch needed (report only).
Mode: review
Owner: Claude Code (lead). Independent challenge: Antigravity, read-only, after report lands.
Evidence to load:
  - field-os-simulador/setas-os/firebase/firestore.rules
  - field-os-simulador/setas-os/firebase/firestore.indexes.json
  - field-os-simulador/setas-os/firebase/db.js            (what the client actually writes)
  - field-os-simulador/setas-os/production-learning-bridge.js  (writes to the 3 new collections)
Acceptance checks — the report must reach a verdict on each:
  1. role() calls get(/usuarios/$(uid)) on every evaluation — document read cost and
     resource-exhaustion exposure.
  2. Is masaBalanceada() enforced on update as strictly as on create?
  3. Any field the client can write that no rule constrains (missing hasOnly)?
  4. Do room_cycles, telemetry_readings, and cycle_evidence have rules at all? If absent,
     that is a finding, not an omission to fix silently.
  5. Can a non-admin escalate via a usuarios/{uid} self-write path?
  6. Do the indexes cover the queries production-learning-bridge.js actually issues?
Authority: read + write the report file. Explicitly forbidden: editing firestore.rules,
           and any `firebase deploy` — the file header reserves deployment for the human's
           own Firebase account.
GitHub: none (report only). Fixes become a separate PR after human review.
Stop when: every check above has an explicit verdict with a rule-line citation, and each
           finding is labeled exploitable / defense-in-depth / cosmetic.
```

---

### W1.2 → Claude Code / `claude-sonnet-5`

```text
Goal: Build the perito-regression skill that gates changes to recipe scoring.
Scope: create .claude/skills/perito-regression/SKILL.md and a runner script under
       field-os-simulador/setas-os/. Do not modify scoring.js or perito-scenarios.js.
Baseline: branch off current main; new branch feat/skill-perito-regression.
Mode: implement
Owner: Claude Code (lead).
Evidence to load:
  - field-os-simulador/setas-os/ground-truth-regression.js       (the existing harness)
  - field-os-simulador/setas-os/ground-truth-regression.test.js  (its contract)
  - field-os-simulador/setas-os/ground-truth-fixtures.example.json
  - field-os-simulador/setas-os/scoring.js                       (scoreRecipe/assessSeverity API)
Acceptance checks:
  1. Runner injects analyzeFn/scoreFn per the harness's existing injection contract —
     do not change that contract.
  2. Reports meanAbsErrorEB and maxAbsErrorEB, and the delta vs the previous commit.
  3. CRITICAL: when ground-truth-fixtures.json is missing or empty, exit NON-ZERO with
     "no corpus — regression not validated". A vacuous pass here is the exact failure
     this tool exists to prevent.
  4. Reports `skipped` from loadFixtures separately; silently dropped fixtures are a defect.
  5. `node --test *.test.js` still passes.
Authority: create the skill and runner; run the test suite.
           Requires human approval: merging to main.
GitHub: PR delivery requested.
Stop when: the runner exits non-zero on an absent corpus and produces a correct delta
           report against the example fixtures.
```

---

### W1.3a → Claude Code / `claude-haiku-4-5` (extraction pass, run first)

```text
Goal: Extract every numeric cultivation parameter from the knowledge base into one
      structured JSON inventory. Mechanical extraction only — no analysis, no judgment.
Scope: read knowledge_base/01_species/*.md and knowledge_base/02_substrates/*.md.
       Write only /tmp scratch output. Change no repository file.
Mode: inspect
Evidence to load: the 11 files in those two directories. Nothing else.
Acceptance checks:
  1. One row per parameter: {file, species_or_substrate, parameter, value, unit, source_line}.
  2. Copy values EXACTLY as written. Do not convert units, round, or normalize.
  3. Where a source states a range, keep it as a range. Do not collapse to a midpoint.
  4. Where a value is qualified ("approx", "reported", "unverified"), carry the qualifier.
Authority: read-only.
Stop when: every numeric parameter in those 11 files appears exactly once in the inventory.
```

### W1.3b → Claude Code / `claude-sonnet-5` (checker, after W1.3a)

```text
Goal: Build a kb-sync checker reporting divergence between knowledge base values and
      the values the app actually uses.
Scope: create scripts/quality/check_kb_sync.py and .claude/skills/kb-sync/SKILL.md.
       Do NOT edit knowledge_base/ or app data files.
Baseline: branch off current main; new branch feat/kb-sync-checker.
Mode: implement
Owner: Claude Code (lead). Input: the W1.3a inventory.
Evidence to load:
  - the W1.3a inventory
  - field-os-simulador/setas-os/extraction-factors.json
  - knowledge_base/AGENTS.md          (why this reports rather than fixes)
  - scripts/quality/check_repository.py  (match its conventions and exit-code style)
Acceptance checks:
  1. Reports three categories: value mismatch, present-in-KB-absent-in-app,
     present-in-app-absent-from-KB.
  2. REPORTS ONLY. No auto-fix in either direction — knowledge_base/AGENTS.md requires
     explicit human authorization for canonical edits.
  3. Distinguishes a real divergence from a unit/representation difference; the latter is
     a separate, lower-severity class.
  4. Fits the existing scripts/quality/ conventions so it can join the Quality workflow later.
  5. Does not add the check to .github/workflows/quality.yml yet — a first run on real data
     will surface expected noise that needs triage before it becomes a merge gate.
Authority: create the script and skill; run the checker.
           Requires human approval: merging, and any knowledge_base/ edit.
GitHub: PR delivery requested.
Stop when: the checker runs clean against real data and its divergence report is triaged
           into "real" vs "representation" for the human.
```

---

### W2.1 → Claude Code / `claude-sonnet-5`

```text
Goal: Trigger CycleEvidence materialization automatically at harvest and cycle-close.
Scope: field-os-simulador/setas-os/production-learning-bridge.js and its caller.
       Do not modify cycle-evidence.js contracts, scoring.js, or perito-scenarios.js.
Baseline: branch off current main; new branch feat/auto-cycle-evidence.
Mode: implement
Owner: Claude Code (lead).
Evidence to load:
  - field-os-simulador/setas-os/production-learning-bridge.js  (materializeCycleEvidence, line 70)
  - field-os-simulador/setas-os/cycle-evidence.js              (buildCycleEvidence contract)
  - field-os-simulador/setas-os/bitacora-model.js              (where harvest/close happen)
  - field-os-simulador/setas-os/PRODUCTION_LEARNING_LOOP_V1.md (§Next vertical item 1)
Acceptance checks:
  1. Idempotent: re-firing a milestone must not create a second evidence record. The
     existing cycleId + batchId identity already provides this — use it, don't invent one.
  2. Batch-ownership verification (bridge step 4) still runs; a batch not belonging to the
     requested RoomCycle must not silently produce evidence.
  3. Confidence caps unchanged: a single observational cycle stays <= medium.
  4. New tests cover: milestone fires once, fires twice (idempotent), fires with a
     mismatched batch (rejected).
  5. `node --test *.test.js` passes; no scoring.js diff.
Authority: edit the listed files, add tests, run the suite.
           Requires human approval: merging to main.
GitHub: PR delivery requested.
Stop when: tests pass and the git diff touches no scoring or ranking module.
```

---

### W2.3 → Claude Code / `claude-sonnet-5`

```text
Goal: Display historical production evidence inside Perito scenario explanations.
Scope: the Perito explanation UI in simulador-app.jsx. FORBIDDEN: scoring.js,
       perito-scenarios.js ranking logic, historyCalibration, any ranking weight.
Baseline: branch off current main; new branch feat/perito-evidence-display.
Mode: implement
Owner: Claude Code (lead).
Evidence to load:
  - field-os-simulador/setas-os/production-learning-bridge.js:94-138  (the data, already attached)
  - field-os-simulador/setas-os/PRODUCTION_LEARNING_LOOP_V1.md        (Perito integration boundary)
  - CONTEXT.md                                                        (Perito/Escenario vocabulary)
  - docs/adr/0004-*.md                                                (once W0.2 has landed)
Acceptance checks:
  1. Reads historicalEvidence/productionLearning already present on the scenario result.
     Do not re-derive or re-query them.
  2. Displays the confidence level honestly. An observational cycle shows as "medium" —
     never round up, never present as established fact.
  3. Uses CONTEXT.md terms: Escenario, Lote, Perito. Not "optimizer", not "scenario generator".
  4. Scenario ORDER is byte-identical before and after. Add a test asserting this — it is
     the ADR-0004 boundary and the one thing that must not regress.
  5. Renders correctly when evidence is absent (a new species with no history) — empty
     state, not a crash.
  6. `node --test *.test.js` and the Playwright suite both pass.
Authority: edit the UI, add tests, run both suites.
           Requires human approval: merging to main.
GitHub: PR delivery requested.
Stop when: evidence renders, the ranking-order test passes, and `git diff scoring.js
           perito-scenarios.js` is empty.
```

---

### W3.1 → Claude Code / `claude-sonnet-5` (invoke `accessibility-review` + `web-interface-guidelines`)

```text
Goal: Accessibility and interface review of the Setas OS mobile field surface.
Scope: review the mobile surface covered by e2e/mobile.spec.js. Report first; fix only
       what is listed as agreed after the human reads the report.
Baseline: current main.
Mode: review
Owner: Claude Code (lead).
Evidence to load:
  - field-os-simulador/setas-os/e2e/mobile.spec.js   (what mobile actually covers)
  - field-os-simulador/setas-os/fieldos-tokens.css
  - field-os-simulador/setas-os/DESIGN_TOKENS.md
  - field-os-simulador/setas-os/lighthouserc.cjs     (existing CWV budget)
Real usage context — weight findings by it: farm staff, phones, often gloved hands,
high humidity, variable daylight in a growing room. Touch-target size, contrast under
glare, and one-handed reach matter more here than visual refinement.
Acceptance checks:
  1. Findings ranked by field impact, not by WCAG numbering order.
  2. Each finding names the failing element and the concrete field scenario it breaks.
  3. Explicitly separate "fails a guideline" from "would actually fail a gloved user in a
     humid room" — both are worth listing, but they are not the same priority.
  4. Do not propose an aesthetic redesign. This is a usability audit of a working tool.
Authority: read + write the report. No code changes in this pass.
GitHub: none (report first).
Stop when: findings are ranked and each carries a concrete field scenario.
```

---

### Codex → `gpt-5.6-terra` (integration, after any Wave 1 or 2 PR)

```text
Goal: Verify and deliver the branch. Repository forensics and CI evidence only.
Scope: the branch under review. Do not redesign, do not expand scope, do not re-litigate
       decisions already recorded in docs/adr/.
Mode: deliver
Owner: Codex. The originating Claude Code session remains lead on design questions.
Evidence to load: the branch diff, the relevant .github/workflows/ run, the PR template.
Acceptance checks:
  1. `node --test *.test.js` passes; paste the actual output — never summarize a run you
     did not execute.
  2. Diff touches only the files the task card scoped.
  3. For Wave 2 branches: confirm scoring.js and perito-scenarios.js are unchanged.
  4. PR body follows .github/PULL_REQUEST_TEMPLATE.md.
Authority: run tests, open the PR. Requires human approval: merging to main (protected).
Stop when: the PR is open with real test output attached.
```

## 5. Sequencing

```
W0.1 agronomic-claims ──┐
W0.2 docs/adr/ ─────────┼──> W1.1 rules audit ──┐
W0.3 doc refresh ───────┘    W1.2 perito-regression ─┼──> W2.1 auto-evidence
                             W1.3 kb-sync ───────────┘    W2.2 Hoy exceptions
                                                          W2.3 Perito evidence UI
                                                                    │
                                                          W2.4 calibration (PARKED,
                                                          needs real fixture corpus)
W3.1 a11y ── independent, any time
W3.2 skill prune ── independent, any time
W4 jsx split ── PARKED until it actually blocks a vertical
```

Wave 1 items touch disjoint files and may run in parallel per AGENTS.md §1. Wave 2 items
all touch `simulador-app.jsx` — run them sequentially or in separate worktrees.

## 6. Out of scope

Multi-tenant features, billing, public API, customer onboarding (ADR-0001). Autonomous
actuator control. Any scoring recalibration before W1.2 is green on a real corpus. Any
`firebase deploy`. Any `knowledge_base/` content edit without explicit authorization.
