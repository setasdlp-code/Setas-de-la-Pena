# Knowledge Base Addendum — Agent Instructions

This addendum applies only inside `knowledge_base/`. Read the root [`AGENTS.md`](../AGENTS.md) first. If this file conflicts with it on knowledge governance, this file and the CANON prevail.

## Required minimal context

Before answering from, auditing, or editing the Knowledge Base, load in this order:

1. [`SETAS_DE_LA_PENA_CANON.md`](./SETAS_DE_LA_PENA_CANON.md) — governing principles and document precedence.
2. [`00_project/AI_AGENT_PROTOCOL.md`](./00_project/AI_AGENT_PROTOCOL.md) — retrieval sequence, uncertainty, and mode-specific output.
3. For an edit: [`00_project/EDITORIAL_GUIDELINES.md`](./00_project/EDITORIAL_GUIDELINES.md), the target document, and its directly related documents.
4. The smallest mode-specific set below. Do not read unrelated knowledge domains.

| Request | Load first |
| --- | --- |
| Strategic decision | `DECISIONS.md` → CANON → `FARM_BRAIN.md` |
| Daily operation | `CURRENT_OPERATIONS.md` → relevant SOP → `06_operations/batch_tracking.md` → `LESSONS_LEARNED.md` |
| Troubleshooting | Relevant SOP → `LESSONS_LEARNED.md` → domain document → `CURRENT_OPERATIONS.md` |
| Research | Relevant domain document → `09_research/` summary/index → `DECISIONS.md` → external sources |
| Equipment/purchase | `FARM_BRAIN.md` → `DECISIONS.md` → equipment document → `LESSONS_LEARNED.md` |
| Production planning | `06_operations/production_schedule.md` → batch tracking → `FARM_BRAIN.md` → relevant SOP |
| Documentation edit | Editorial guidelines → target frontmatter/content → `00_project/SYSTEM_FLOW.md` |

## Evidence and authority

- Never answer from general knowledge when project knowledge is available. Cite the canonical source and distinguish it from an inference.
- External findings are research inputs, not a replacement for project decisions. Classify them as Tier 1, Tier 2, Tier 3/hypothesis, field-measured, or unverified.
- Preserve the distinction between **normative authority** (what governs) and **operational state** (what is currently happening). Current observations do not silently change a governing document.
- No biological parameter becomes an SOP or an operational recommendation without a source, evidence strength, and local-validation status. Do not use absolute language such as “best,” “always,” or “optimal” without supporting measured evidence.
- Default to observation and diagnosis when evidence is insufficient. An AI proposal is not permission to act in the cultivation environment.

## Editing contract

Canonical/documentation changes require explicit user authorization. When authorized:

1. Identify the document type and the one authoritative destination; avoid duplication.
2. Preserve YAML frontmatter, section hierarchy, cross-references, and correct existing content.
3. Apply the minimum coherent edit; update `last_reviewed` when content changes.
4. Read the modified section in context and validate affected links/references and related documents.
5. State whether the result is an editorial, operational, or architectural change. Architectural changes require the formal decision process and `DECISIONS.md`; do not edit the CANON casually.

Route knowledge deliberately:

| Knowledge created or discovered | Destination |
| --- | --- |
| Current status, bottleneck, or near-term priority | `FARM_BRAIN.md` or `CURRENT_OPERATIONS.md` |
| Decision, rationale, and measurements | `DECISIONS.md` |
| Stable procedure | Relevant SOP/domain file |
| Experiment result or field lesson | `LESSONS_LEARNED.md` and relevant record |
| Literature assessment or evidence gap | `09_research/` and `unresolved_questions.md` |
| Repeatable human–AI interaction | A temporary prompt first; promote to `10_ai_workflows/` only after three successful independent uses |

## Research and review outputs

Research answers must state: question, current project position, evidence summary with source tier, agreement/conflict/novelty, confidence, local relevance, and validation or routing recommendation.

Audits must state: finding, affected document(s), evidence, authority/consistency issue, impact, and the smallest corrective action. Do not make the edits in an audit unless explicitly requested.

Keep all language technical-agronomic, traceable, and compact. Documentation is operational infrastructure: an undocumented decision, procedure, configuration, or finding is not reliable project knowledge.
