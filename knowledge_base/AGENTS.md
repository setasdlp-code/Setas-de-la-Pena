# Knowledge Base Addendum — Agent Instructions

This addendum applies only inside `knowledge_base/`. Read the root [`AGENTS.md`](../AGENTS.md) first. If this file conflicts with it on knowledge governance, this file and the CANON prevail.

## Context to load, by task

Load the least that supports the answer.

| Task | Load |
| --- | --- |
| Read or answer from the Knowledge Base | This file, then the documents the question needs. Use `INDEX.yaml` to locate them. |
| Two documents disagree | [`SETAS_DE_LA_PENA_CANON.md`](./SETAS_DE_LA_PENA_CANON.md) §14 (precedence). |
| Edit operational state, changelog, lessons, or research | [`00_project/EDITORIAL_GUIDELINES.md`](./00_project/EDITORIAL_GUIDELINES.md) §5 and the target document. |
| Edit a canonical parameter, SOP, decision, or governance document | The CANON, [`00_project/AI_AGENT_PROTOCOL.md`](./00_project/AI_AGENT_PROTOCOL.md), the editorial guidelines, the target document, and its directly related documents. |

Starting points by request:

| Request | Load first |
| --- | --- |
| Strategic decision | `DECISIONS.md` → CANON → `FARM_BRAIN.md` |
| Daily operation | `CURRENT_OPERATIONS.md` → relevant SOP → `06_operations/batch_tracking.md` → `LESSONS_LEARNED.md` |
| Troubleshooting | Relevant SOP → `LESSONS_LEARNED.md` → domain document → `CURRENT_OPERATIONS.md` |
| Research | Relevant domain document → `09_research/` summary/index → `DECISIONS.md` → external sources |
| Equipment/purchase | `FARM_BRAIN.md` → `DECISIONS.md` → equipment document → `LESSONS_LEARNED.md` |
| Production planning | `06_operations/production_schedule.md` → batch tracking → `FARM_BRAIN.md` → relevant SOP |

## Evidence and authority

- Answer from project knowledge when it exists; cite the canonical source and separate it from inference. Fall back to general knowledge only when the repository has nothing, and say so.
- External findings are research inputs, not a replacement for project decisions. Classify them as Tier 1, Tier 2, Tier 3/hypothesis, field-measured, or unverified.
- Keep **normative authority** (what governs) separate from **operational state** (what is happening). Current observations do not silently change a governing document.
- No biological parameter becomes an SOP or an operational recommendation without a source, evidence strength, and local-validation status. Avoid “best,” “always,” or “optimal” without measured evidence; when you find such wording, correct it and report it.
- When evidence is insufficient, default to observation and diagnosis. An AI proposal is not permission to act in the cultivation environment.

## Editing authority

`main` is protected and every change reaches it through a PR that Sebastián reviews. That review is the approval for low-risk edits; higher-risk edits also need authorization before the edit is made.

| Change | Examples | Authorization |
| --- | --- | --- |
| Editorial | Typos, formatting, broken links, `last_reviewed`, `INDEX.yaml` regeneration | None beyond PR review |
| Operational state and records | `FARM_BRAIN.md`, `CURRENT_OPERATIONS.md`, `CHANGELOG.md`, `LESSONS_LEARNED.md`, batch records, when the task produced or received the fact | None beyond PR review; cite where the fact came from |
| Research | New or revised entries in `09_research/`, `references/`, `unresolved_questions.md` | None beyond PR review; tier and applicability stated |
| Canonical knowledge and procedure | Parameters in `01_species/`–`05_equipment/`, `metadata/*.yaml`, SOPs in `06_operations/`, business figures in `07_business/` | Explicit user authorization for that change |
| Decision | New or amended `DECISIONS.md` entry | Explicit user authorization; follows CANON §16 |
| Architectural | CANON and the governance standards in `00_project/` | Explicit user authorization and a `DECISIONS.md` entry |

When editing:

1. Put the content in its one authoritative destination; do not duplicate.
2. Preserve YAML frontmatter, section hierarchy, and cross-references.
3. Update `last_reviewed` when content changes and check affected links.
4. State the change class in the PR.

| Knowledge created or discovered | Destination |
| --- | --- |
| Current status, bottleneck, or near-term priority | `FARM_BRAIN.md` or `CURRENT_OPERATIONS.md` |
| Decision, rationale, and measurements | `DECISIONS.md` |
| Stable procedure | Relevant SOP/domain file |
| Experiment result or field lesson | `LESSONS_LEARNED.md` and relevant record |
| Literature assessment or evidence gap | `09_research/` and `unresolved_questions.md` |
| Repeatable human–AI interaction | A draft prompt under `10_ai_workflows/templates/`; promote to a permanent workflow after three successful independent uses |

## Research and review outputs

Research answers state: question, current project position, evidence summary with source tier, agreement/conflict/novelty, confidence, local relevance, and a validation or routing recommendation.

Audits state: finding, affected document(s), evidence, impact, and the smallest corrective action. An audit does not apply its corrections unless asked.

Keep language technical-agronomic, traceable, and compact.
