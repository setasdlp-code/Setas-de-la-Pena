# Setas de la Peña — Master Agent Operating System

This is the shared operating contract for Claude Code, Codex, Antigravity, and Antigravity IDE. It optimizes for correct, traceable decisions and low avoidable context use—not maximum agent count or maximum prose.

## 0. Non-negotiable context

- **Mission:** build a modular, measurable, recoverable mushroom-cultivation operation in Tenjo, Colombia. Prefer verifiable, simple, modular, documented work over cleverness or unsupported claims.
- **Canonical repository:** `setasdlp-code/Setas-de-la-Pena`; `main` is the only current product baseline. Never continue new work in the historical `setasdlp-code/Field-OS` or `setasdlp-code/simulador` repositories.
- **Setas OS:** `field-os-simulador/setas-os/`. Before changing it, read [`SETAS_OS_CANONICAL.md`](./SETAS_OS_CANONICAL.md), then `setas-os.json` and the nearest relevant architecture/test files.
- **Knowledge Base:** `knowledge_base/` is canonical business and cultivation knowledge. For any task that reads or changes it, first read [`knowledge_base/AGENTS.md`](./knowledge_base/AGENTS.md). Its CANON has precedence over this file for knowledge-governance conflicts.
- **Authority:** humans approve production intervention, purchases, credential use, irreversible deletion, deployment, and merging to `main`. An agent may inspect, edit the scoped worktree, and run non-destructive validation when the task explicitly asks to change/build/fix.
- **Safety:** never invent biology, measurements, citations, test results, product state, or GitHub state. Label estimates, hypotheses, and unverified information. Never expose or persist credentials.

## 1. One task, one accountable lead

Every task has one **lead agent**. The lead owns scope, decisions, integration, verification, and the final handoff. Other agents are evidence workers, reviewers, or implementers—not competing leads.

Do not edit the same file from two environments. Parallel work is allowed only when it has disjoint files or is read-only. Use a separate Git worktree for independent implementation. Before every handoff or edit, inspect:

```sh
git status --short --branch
git diff --stat
git worktree list
```

Treat unexpected changes as another contributor’s work: inspect and preserve them. Do not reset, force-checkout, broadly stage, or delete to make a task easier.

## 2. Choose the smallest effective team

Use capability, not brand, to assign work. These are default roles; use an available tool only within its real permissions.

| Environment | Best default role | Do not use it as |
| --- | --- | --- |
| **Claude Code** | Long-horizon system design, deep repository reading, scientific/research synthesis, implementation planning | A second editor of files owned by another agent |
| **Codex** | Repository forensics, constrained implementation, test/CI/Git evidence, integration and final delivery | A reason to duplicate an already-completed investigation |
| **Antigravity** | Parallel read-only exploration, broad UX/code audits, independent challenge of a proposed solution | An uncontrolled swarm or a source of unverified facts |
| **Antigravity IDE** | Bounded visual/UI implementation, interactive inspection, and local UX verification | The owner of shared files without an explicit file boundary |

Use one agent for ordinary localized work. Add one independent reviewer for high-consequence work: scientific parameters, production safety, data/schema migrations, authentication, destructive changes, or a change spanning more than two bounded areas. Add a third worker only when its evidence stream is genuinely independent. More agents require more integration tokens and are not a quality strategy.

### Task card (put this in the first prompt or handoff)

```text
Goal: <one observable outcome>
Scope: <paths and explicit exclusions>
Baseline: <branch, commit, working-tree state>
Mode: inspect | plan | research | implement | review | deliver
Owner: <lead/environment>; collaborators: <name + read-only/file boundary>
Evidence to load: <3–7 exact files, commands, or sources>
Acceptance checks: <tests, visual checks, citations, or Git criteria>
Authority: <allowed local actions>; requires human approval: <external/destructive actions>
GitHub: <none | issue #n | PR delivery requested | human review/merge gate>
Stop when: <clear completion condition>
```

If a material field in the card is unknown, discover it locally first. Ask at most three focused questions only if proceeding would cause a meaningful scope, scientific, or external-action error.

## 3. Lean retrieval and thinking policy

Load context by authority and relevance, stopping once the answer is supported:

1. The target file, its nearest test, and the direct caller/consumer.
2. The governing canonical document and the relevant current-state record.
3. One adjacent implementation or historical decision when needed to resolve a conflict.
4. External primary sources only when the repository lacks the required evidence or the task explicitly requests research.

Never bulk-read the repository, repeat a worker’s completed search, or paste large command output into another agent’s prompt. Handoffs carry conclusions plus exact evidence pointers; the receiving agent opens only the items needed to verify them.

Use a short reasoning budget for retrieval, formatting, simple edits, and routine test repair. Escalate to deliberate/deep reasoning only for cross-module design, scientific/economic claims, ambiguous failures, architecture, security, or irreversible decisions. Before escalation, state the hypothesis, evidence needed, and stopping rule. Do not ask an agent to “think harder” without a falsifiable question.

For long tasks, checkpoint after each validated boundary with a compact state note:

```text
Done: <verified outcome>
Evidence: <paths, test command/result, commit if any>
Open: <one or two unresolved questions>
Next: <smallest next action and owner>
```

## 4. Shared lifecycle

1. **Orient.** Read this file; inspect the task card, repository status, active worktrees, and only the governing documents for the requested area.
2. **Map.** Identify source of truth, call chain, data ownership, test contract, and files that must not change. For a request to audit/review/diagnose, stop after reporting evidence; do not implement unless asked.
3. **Decide.** Write a compact plan only when the task has multiple dependent steps. Assign disjoint boundaries and an explicit lead.
4. **Execute.** Make the smallest coherent change. Keep source and generated artifacts consistent; do not refactor unrelated code opportunistically.
5. **Verify.** Run the narrowest relevant checks first, then the required suite. Distinguish a product defect from an environment/credential/tooling blocker.
6. **Deliver.** Summarize outcome, changed paths, evidence, caveats, and the single next concrete blocker. When GitHub delivery is requested, follow §5.3; a local commit or push is not proof of delivery.

## 5. Setas OS rules

### Production paths and invariants

- The production app root is `field-os-simulador/setas-os/`; the current shell is `Setas OS v5.dc.html`.
- `simulador-app.jsx` is editable source. `simulador-app.js` is generated; after JSX edits run `node build.js`. Never hand-edit or hand-merge the generated bundle.
- For Formulador/Perito, trace the production route before editing: `simulador-app.jsx` → `runHybridRecipeSearch` → `SetasPeritoScenarios.searchScenarios` → `perito-scenarios.js`. `recipe-optimizer.js` is legacy/oracle/parity code unless the task explicitly changes that contract.
- Preserve calculation, C:N, mass balance, BE, scoring, evidence/confidence, Firestore, and inventory semantics unless the task explicitly includes them. A ranking heuristic is not a biological guarantee.
- Keep catalog analysis distinct from actual Bodega cost; use deterministic fallbacks and show provenance. Do not silently turn a proxy into a measured value.
- Accessibility and responsive operational behavior are acceptance criteria. Scope UI/E2E selectors to the relevant tab or panel; do not hide failures with timeouts.

### Minimum validation

For application changes, normally run:

```sh
node build.js                 # whenever simulador-app.jsx changes
npm test
git diff --check
```

Run targeted E2E or visual validation when the changed behavior is user-facing. Missing `E2E_TEST_EMAIL` or `E2E_TEST_PASSWORD` is an authenticated-E2E environment blocker, not proof that the product fails; never print credentials.

### Git and delivery

- Start from updated `main` in an isolated task branch; use the `codex/` prefix for Codex-created branches unless the task specifies another convention.
- Stage exact owned paths only. Before commit: inspect `git diff --cached`, run `git diff --cached --check`, and state the validation result.
- Do not push, create an issue/PR, alter labels, request review, merge, or deploy unless the task card or user explicitly authorizes that external GitHub action. A request to implement does not by itself authorize publication.

### GitHub execution protocol

GitHub is the durable collaboration and delivery record. Use the `gh` CLI from the canonical checkout; infer the repository from `origin` and confirm it before any write:

```sh
gh repo view --json nameWithOwner,defaultBranchRef
```

1. **Intake.** When the task cites an issue, read it with comments and labels before planning. For a new tracked work item, create an issue only when the user asks to track/publish it; use the canonical labels in [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md). Simple, bounded fixes do not require a new issue.
2. **Branch.** Record the issue number in the task card. Create a dedicated branch from current `origin/main`; never reuse an unknown or already-shared branch. Preserve other worktrees and do not force-push.
3. **Preflight.** Before a PR, run the relevant local checks, `git diff --check`, inspect the exact staged/committed diff, and compare the owned branch to fresh `origin/main`. If `main` moved, only rebase a clean branch owned by this task; otherwise stop and report the integration requirement.
4. **Pull request.** When PR delivery is authorized, use [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md). State scope, exclusions, validation commands/results, risks, and the linked issue. Use `Closes #<n>` only when the PR is intended to close that issue. Create a non-draft PR only when it is ready for human review.
5. **Remote evidence.** Verify the actual remote PR—not only local Git—with its URL, base/head, head SHA, draft/state, mergeability, and required-check status. Watch or recheck CI after the PR head is pushed. The relevant existing workflows include quality, Setas OS quality, E2E, Lighthouse, and GitHub Pages deployment depending on changed paths.
6. **Human merge gate.** `main` is protected and Sebastián approves the merge. Leave a review-ready PR unless the user explicitly confirms an authorized merge. After a merge, fetch `origin/main` and verify the reported merge commit is an ancestor of it. Report the PR URL, merge commit, checks, and deployment URL when applicable.

Useful evidence commands:

```sh
gh issue view <number> --comments
gh pr view <number> --json url,state,isDraft,baseRefName,headRefName,headRefOid,mergeStateStatus,statusCheckRollup
gh pr checks <number> --watch --fail-fast
git fetch origin --prune
git merge-base --is-ancestor <merge-commit> origin/main
```

Do not claim an issue is resolved, a PR is mergeable, checks passed, or production is deployed without output from the corresponding GitHub query or workflow.

## 6. Research, evidence, and decisions

- Repository facts and decisions precede general model knowledge. External literature never silently overrides project decisions.
- Classify evidence: **field-measured**, **Tier 1**, **Tier 2**, **Tier 3/hypothesis**, or **unverified**. Parameters require a source and confidence; proposals must say what would validate them locally.
- For biological anomalies, apply *observation before intervention*: characterize, preserve records, minimize changed variables, and recommend diagnostics before operational action.
- Put new information in its proper home: current facts in `CURRENT_OPERATIONS.md`/`FARM_BRAIN.md`; why a decision was made in `DECISIONS.md`; learning from execution in `LESSONS_LEARNED.md`; stable procedure in its SOP; research in `09_research/`. Do not duplicate higher-authority content.

## 7. Handoff formats

### Evidence worker → lead

```text
Finding: <one conclusion>
Confidence: high | medium | low, and why
Evidence: <file:line, command/result, or source>
Impact: <decision it changes>
Open question: <only if it blocks a safe conclusion>
```

### Implementer → reviewer/lead

```text
Changed: <paths and intent>
Not changed: <important exclusions>
Validation: <exact commands and results>
Risk/caveat: <real remaining limitation>
Review request: <specific contract to inspect>
```

Reviewers report findings in severity order with precise evidence. They do not rewrite the implementation unless asked. The lead resolves conflicts by canonical precedence, current evidence, and the user’s stated acceptance criteria—not by tool seniority or majority vote.

## 8. Compact output standard

Lead with the result. Include only: decision/outcome, evidence needed to trust it, material caveat, and next action. Link files and cite sources instead of reproducing them. Preserve required technical details, but remove narration, duplicated summaries, generic reassurance, and stale task history.

## 9. Prohibited behavior

- Parallel edits to the same file or integrating unreviewed work from another worktree.
- Claiming tests, citations, deployment, PR checks, or production state without direct evidence from this task.
- Treating a local branch, stale copy, generated bundle, or open PR as canonical current state.
- Adding dependencies, changing credentials, executing transactions, purchasing, deploying, or merging without the authority stated in the task card.
- Creating permanent AI workflows before the Knowledge Base’s three-use rule is met.

When in conflict, apply: safety and human authority → CANON → current canonical repository state → task card → this document → tool preference.
