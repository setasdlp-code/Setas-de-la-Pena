# AI Workflow Library — Setas de la Peña Knowledge System
*Version 1.1*

## Purpose

This directory contains the reusable AI workflow library for the Setas de la Peña Knowledge System. It is a repository of standardized, versioned interaction patterns between human operators and AI assistants operating within this knowledge base.

This directory does **not** contain mushroom cultivation knowledge, protocols, or operational data. Those belong in their respective knowledge base sections.

---

## Library Philosophy

The AI Workflow Library is the operational interface between humans, AI agents, and the Knowledge System.

Workflows are repeatable operational procedures designed for AI execution. They are the equivalent of SOPs for human-AI collaboration: structured, validated, and traceable. Their purpose is to improve consistency across sessions — not to replace human judgment. The AI organizes information and follows defined procedures; humans retain decision authority at every step.

A workflow that has not been validated through repeated operational use has no place in this library.

---

## Document Types — Definitions

Understanding the distinction between document types is essential for maintaining repository integrity.

**Knowledge Documents**
Contain factual information about mushroom cultivation: species parameters, substrate formulas, environmental targets, inoculation protocols, contamination prevention, harvest procedures. These documents describe *what* is known about the cultivation system.

**Operational Documents**
Contain procedures, checklists, logs, and records generated during daily farm operation. These documents describe *what is happening* in the cultivation system at a given point in time.

**AI Workflows**
Describe repeatable, structured interactions between human operators and AI assistants. AI Workflows do not contain cultivation knowledge — they define *how* to engage the AI effectively to accomplish a recurring operational task using the Knowledge System. They are interaction patterns, not mushroom procedures.

---

## Workflow Invocation

A workflow may be invoked by any of the following:

- **Workflow ID** — `WF-001`
- **Official Title** — `End of Day Assistant`
- **Registered Alias** — `Daily Review`, `End of Day`, `Cierre del Día`

Upon invocation, the AI follows this execution sequence:

```
User invokes workflow
       ↓
AI locates and loads workflow document
       ↓
AI follows workflow exactly as documented
       ↓
AI generates the defined outputs
       ↓
AI follows AI_AGENT_PROTOCOL for all repository interactions
```

Improvisation is not permitted during workflow execution. If a workflow does not cover the situation, the AI should flag the gap and revert to the AI_AGENT_PROTOCOL.

---

## Workflow Registry

| ID | Title | Purpose | Status | Version | Owner |
|----|-------|---------|--------|---------|-------|
| WF-001 | End of Day Assistant | Structured daily close: log events, generate summary, flag issues | Active | 1.0 | Sebastián Pinzón |

---

## Workflow Governance

Workflows are operational assets of the Knowledge System. They represent proven, repeatable interactions that have demonstrated consistent value in real operational use. The following principles govern all workflows in this library.

**Workflows are operational assets.**
Each workflow must solve a demonstrated, recurring operational need. Speculative workflows are not permitted.

**Workflows are versioned.**
Every change to a workflow increments its version. The revision history within each workflow document is mandatory and must be kept current.

**Workflows are technology-independent.**
Workflows describe the interaction pattern, not the specific AI tool or model used. A workflow must remain valid regardless of which AI assistant executes it, provided that assistant has access to the required repository documents.

**Workflows should remain concise.**
A workflow that requires extensive explanation to execute is a sign that either the workflow is too complex or the knowledge base documents it references need improvement. Prefer simplicity.

**Existing workflows should be improved before creating new ones.**
When a recurring operational need arises, first evaluate whether an existing workflow can be extended or revised to address it. New workflows increase maintenance burden.

### The Three-Use Rule

> **A new workflow shall only be created after the same interaction or operational task has occurred successfully at least three independent times and demonstrates a stable, repeatable pattern.**

Until that threshold is reached, operators should use temporary prompts (see `templates/prompt_template.md`) rather than creating permanent workflow documents.

This policy exists to prevent unnecessary complexity and workflow proliferation. The value of a workflow library depends on its precision and restraint. A library containing ten proven workflows is more useful than one containing forty speculative ones.

**The library grows through operational validation, not feature accumulation.**

### Creation Criteria

A workflow shall only be created when all of the following conditions are met:

- The interaction has occurred successfully at least three independent times.
- The interaction follows a stable, repeatable structure.
- The workflow produces reusable operational outputs.
- No existing workflow already solves the problem.

If any condition is unmet, use a temporary prompt instead.

---

## Workflow Lifecycle

Every workflow in this library follows the same lifecycle. Workflows evolve from operational experience, not anticipation.

```
Operational Need
       ↓
Temporary Prompt
       ↓
Repeated Use
       ↓
Validation (Three-Use Rule)
       ↓
Workflow Proposal
       ↓
Review
       ↓
WF-XXX Created
       ↓
Revision
       ↓
Archive (if obsolete)
```

**Temporary Prompt** — A structured prompt is written using `templates/prompt_template.md` and used informally to accomplish an operational task.

**Repeated Operational Use** — The same prompt is used again in subsequent sessions. Notes and lessons learned are appended to the prompt document.

**Three Successful Uses** — After three independent successful uses demonstrating a stable, repeatable pattern, the prompt is eligible for promotion to a permanent workflow.

**Workflow Proposal** — The operator proposes a new workflow, referencing the temporary prompt and its documented uses.

**Review** — The proposed workflow is reviewed against the governance principles. It receives a WF-XXX identifier only if it passes review.

**Operational Use** — The workflow enters active use. It is referenced in daily operations by its ID.

**Revision** — Workflows are revised when operational experience reveals improvements. Each revision increments the version and updates the revision history.

**Archive** — Workflows that become obsolete are moved to the `archive/` directory rather than deleted. Workflow history is preserved. Archived workflows remain available for historical reference and may be restored if conditions change.

---

## Workflow Quality Checklist

Every workflow in this library must satisfy the following before being assigned a WF-XXX identifier:

- ✓ Clear purpose — one sentence that describes what the workflow accomplishes
- ✓ Defined inputs — what the operator must provide before invocation
- ✓ Defined outputs — what the AI must produce upon completion
- ✓ Repository references — which documents the AI must load or consult
- ✓ Operational usefulness — solves a demonstrated recurring need
- ✓ Minimal ambiguity — the AI can execute it without improvisation
- ✓ Version history — revision log present and current
- ✓ Human validation where appropriate — critical outputs are reviewed by the operator before acting

---

## Archive Policy

Obsolete workflows are archived rather than deleted. The `archive/` directory preserves the complete history of workflows that are no longer in active use. Archived workflows:

- Retain their original WF-XXX identifier
- Are marked with status `Archived` and an archive date in their frontmatter
- Remain readable for historical reference
- May be restored to active status if operational conditions change

---

## Design Principles

| Principle | Description |
|-----------|-------------|
| **Small** | Contains only workflows that have earned their place through demonstrated operational use. |
| **Modular** | Each workflow is self-contained and does not depend on the execution of another workflow. |
| **Versioned** | Every change is tracked; revision history within each workflow is mandatory. |
| **Reusable** | Workflows are written to be applicable across multiple sessions and operators. |
| **Technology-Independent** | Interaction patterns are described, not specific AI tools or models. |
| **Repository-Aware** | Workflows explicitly reference the Knowledge System documents they require. |
| **Traceable** | Outputs generated by workflows can be linked back to their source workflow and version. |
| **Evidence-Based** | No workflow is created without validated operational precedent. |
| **Maintainable** | Workflows are concise enough that a single person can review, revise, or retire them. |

Repository complexity should grow only in response to operational maturity.

---

## Workflow Categories

Categories are organizational aids only. They do not imply governance boundaries or execution priority.

| Category | Purpose | Examples |
|----------|---------|---------|
| **Daily Operations** | Recurring tasks tied to the cultivation cycle | End of day review, shift handover, environmental check |
| **Research** | Literature review, species data gathering, external source synthesis | Species parameter research, substrate comparison |
| **Laboratory** | Procedures supporting inoculation, contamination diagnosis, or spawn work | Contamination review, spawn run assessment |
| **Engineering** | Automation, sensor, and hardware-related interactions | Sensor calibration review, automation log analysis |
| **Business** | Commercial, supplier, and customer-facing tasks | Supplier evaluation, cost analysis |
| **Repository Maintenance** | Knowledge System integrity and updates | Knowledge gap identification, document review |
| **Strategic Review** | Planning, direction-setting, and performance assessment | Quarterly review, expansion planning |

---

## Human Responsibility

Workflows assist operational decision-making. The AI organizes information, follows documented procedures, and proposes outputs. Humans retain responsibility for:

- **Operational decisions** — any action taken in the cultivation environment
- **Repository modifications** — no document is changed without operator approval
- **Biological interventions** — inoculation, harvest, contamination response, disposal
- **Strategic changes** — expansion, species selection, investment, process redesign

The AI does not act autonomously. Every workflow output is a proposal until a human decides to implement it.

---

## Future Growth

New workflows should emerge only when operational maturity demonstrates a repeated need. The correct response to a new operational challenge is a temporary prompt, not a new workflow.

Before creating a new workflow:
1. Verify no existing workflow covers the need.
2. Confirm the Three-Use Rule has been satisfied.
3. Prefer revising an existing workflow over creating a parallel one.

Avoid speculative workflows. A library that grows faster than operational experience justifies will become a liability rather than an asset.

---

## Closing Principle

The AI Workflow Library evolves according to the same engineering philosophy as the cultivation system:

```
Observe
   ↓
Repeat
   ↓
Validate
   ↓
Standardize
   ↓
Improve
```

The objective of the library is not to create more workflows.

The objective is to improve the quality, consistency, and reproducibility of human-AI collaboration over time.
