# Prototype readiness — local implementation

Goal: complete pending recommendations from the ten-item prototype review.
Scope: Setas OS setup, experiment plans/evidence, trial release, durable local
writes, economics provenance and backup; preserve biological weights and current
reservation/lifecycle contracts. No production or knowledge-base writes.
Baseline: fresh origin/main 79cf46d, isolated codex/prototype-readiness-20260926.
Mode: implement. Owner: Codex. Collaborator: readiness_review (read-only).
Evidence: ARCHITECTURE.md, HISTORY_ELIGIBILITY.md, experiment-model.js,
perito-readiness.js, launch-plan.js, sync-queue.js, inventory-consumption.js.
Acceptance: focused domain regressions, build, npm test, isolated browser flows
at desktop/mobile, diff check. Authority: local edits/validation/commit only;
no publication, deployment or merge. Stop after verified local handoff.

The earlier temporary worktree was purged between sessions; unfinished code
was not delivered. This persistent worktree incorporates current main, including
reservation-before-preparation and the Bitácora sync queue. Completed main work:
#3 input capture, #4 history eligibility, and most of #6 preparation snapshots.

## Integrated result — 2026-09-27

Rebased onto `origin/main` `c0d8eed`, including purchase receipts, nutrient
provenance, the `mass-balance.js` rename and serialized Bitácora queue draining.

| Original recommendation | Result |
| --- | --- |
| 1. Honest empty setup (UX) | Removed automatic operational inventory seeding; Bodega offers a first-purchase action. Catalog values remain references. |
| 2. Guided trial plans (UX) | Three-step plan with hypothesis, metric, immutable recipe copies and independent batch counts. A plan alone creates no batches or observations; linking a batch checks recipe identity and group capacity. |
| 3. Missing-aware field forms (UX) | Already on main; regression suite retained for blanks, null, zero, units and draft recovery. |
| 4. Eligible history for Perito | Already on main; retained completion/zero-yield/recipe similarity gates and theoretical fallback without data. |
| 5. Explicit trial release (Formulador) | Preparation records equipment, protocol, reviewer and uncertainty acceptance against the batch specification. Impossible water targets, incomplete stock plans and previous partial consumption block preparation. This is human trial authorization, not model approval or routine-production validation. |
| 6. Shared weighing snapshot (Formulador) | Existing snapshot preserved; saved dry mass now uses its actual rounded weighing totals, labeled planned/calculated. |
| 7. Recoverable planning and consumption | A write-ahead record covers reservations, batch/bags, stock, movements and outboxes. Lifecycle validation precedes stock changes. Retries and restored records preserve consumed identities; server stage authority remains unchanged. |
| 8. Experimental evidence eligibility (Perito) | Unique completed batches, matching recipe/group/experiment, lot traceability and executed randomization records required. Missing values and duplicate cycles cannot become independent replicates. |
| 9. Economics provenance | Estimated costs/harvest value labeled as estimates. Recorded cost completeness and recorded sales are separate; missing actuals remain unknown. Four supported cost categories: substrate, spawn, energy and consumables. |
| 10. Portable backup/recovery (UX) | Download JSON and preview/restore into an empty local workspace. Preserves null/zero, IDs and archived outboxes across repeated restores. Does not automatically replay old network operations. |

Validation uses synthetic fixtures only; no field observations or biological
calibration were fabricated. Independent read-only review found two recovery
issues and an excess-water guard; these now have regression coverage.

Operational boundaries: inventory remains device-local per the existing
architecture. These local writes are recoverable in one browser; they are not a
cross-device inventory transaction or a multi-tab locking protocol. Backups
include operational records, not credentials. Archived delivery operations need
reconciliation before intentional replay. Formal randomization is never inferred
from merely selecting a comparison design. Authenticated production-service sync
and a rehearsal on the actual field devices remain pre-test operational checks.

## Verification

- `node build.js` and `node build.test.js`: generated bundle current.
- `npm test`: 1,260 unit tests and 19 interface gates passed on the integrated baseline.
- `npm run test:browser`: all 14 browser workflows passed, including the new mobile plan/export/restore flow and current purchase/nutrient workflows.
- Follow-up targeted verification: 16 prototype domain tests passed after the partial-consumption guard; the plan/preparation browser test passed with explicit experiment/group/version linkage assertions.
- `git diff --check`: clean. Mobile screenshot inspected at 390 × 844.
- No remote publication, deployment, live stock changes or production authentication tests performed.
