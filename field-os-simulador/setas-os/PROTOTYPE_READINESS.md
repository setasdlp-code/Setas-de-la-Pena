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
