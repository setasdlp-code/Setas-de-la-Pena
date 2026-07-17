# Prompt Template — Setas de la Peña Knowledge System

<!--
Use this template to structure temporary prompts before they become permanent workflows.
A temporary prompt is an experimental interaction pattern being tested in real operational use.
Prompts may be promoted to permanent WF-XXX workflows after satisfying the Three-Use Rule
defined in knowledge_base/10_ai_workflows/README.md.

Instructions:
- Complete all sections before first use.
- Append a use record under "Validation Notes" after each successful use.
- After three successful uses, evaluate for workflow promotion.
-->

---

**Prompt Title:** [Descriptive name for this interaction]
**Date Created:** YYYY-MM-DD
**Created By:** [Name]
**Use Count:** 0 / 3

---

## Role

You are the [role description] for Setas de la Peña, a specialty mushroom cultivation operation in Tenjo, Colombia. You have access to the Setas de la Peña Knowledge System.

[Define the specific role the AI should adopt for this interaction. Be precise. A well-defined role prevents the AI from defaulting to generic behavior.]

---

## Context

[Provide the operational context the AI needs to interpret this prompt correctly. Include:
- What is happening in the farm at this moment
- What stage of the cultivation cycle is relevant
- Any recent events that affect the interaction
- What the operator already knows and does not need explained]

---

## Objectives

[List the specific outcomes this prompt is designed to produce. Number them.]

1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

---

## Repository References

The following Knowledge System documents are relevant to this interaction. Reference them when generating outputs.

| Document | Path | Why Relevant |
|----------|------|-------------|
| [Document Name] | `knowledge_base/XX_section/file.md` | [Reason] |

---

## Workflow

[Describe the step-by-step interaction sequence. This is the core of the prompt. Define what the operator provides, what the AI does at each step, and what output is expected.]

**Step 1:**
[Operator provides: ...]
[AI does: ...]

**Step 2:**
[Operator provides: ...]
[AI does: ...]

**Step N:**
[AI produces final output.]

---

## Rules

[Define constraints the AI must follow during this interaction. Rules prevent common failure modes.]

- [Rule 1]
- [Rule 2]
- [Rule 3]

---

## Expected Output

[Describe precisely what a successful output looks like. Include format, length, structure, and tone if relevant. A precise expected output makes validation straightforward.]

---

## Validation Notes

Document each use of this prompt. After three successful uses, evaluate for promotion to a permanent workflow per the governance policy in `README.md`.

### Use 1
- **Date:** YYYY-MM-DD
- **Operator:** [Name]
- **Outcome:** [Successful / Partial / Failed]
- **Notes:** [What worked, what did not, what was adjusted]

### Use 2
- **Date:** YYYY-MM-DD
- **Operator:** [Name]
- **Outcome:** [Successful / Partial / Failed]
- **Notes:** [What worked, what did not, what was adjusted]

### Use 3
- **Date:** YYYY-MM-DD
- **Operator:** [Name]
- **Outcome:** [Successful / Partial / Failed]
- **Notes:** [What worked, what did not, what was adjusted]

---

## Lessons Learned

[Append observations after each use. Identify patterns, recurring issues, or refinements that improve reliability. These notes form the foundation of the workflow document if this prompt is promoted.]

- [Lesson 1]
- [Lesson 2]

---

<!--
PROMOTION CHECKLIST
If this prompt reaches three successful uses, review the following before proposing a permanent workflow:

[ ] The interaction pattern is stable and repeatable across all three uses
[ ] The outputs are consistently useful and accurate
[ ] The required documents are clearly identified
[ ] The rules are sufficient to prevent common failure modes
[ ] The prompt cannot be simplified into an existing workflow via revision
[ ] The operational need is ongoing, not a one-time event

If all items are checked, create a workflow proposal using templates/workflow_template.md
and assign the next available WF-XXX identifier.
-->
