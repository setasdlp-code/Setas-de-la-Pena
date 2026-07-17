---
workflow_id: WF-XXX
title: [Workflow Title]
version: 1.0
status: Active  # Active | Draft | Deprecated | Archived
owner: [Name]
purpose: [One-sentence description of what this workflow accomplishes]
required_documents:
  - [knowledge_base/XX_section/document.md]
inputs:
  - [List of inputs the operator must provide before starting]
outputs:
  - [List of outputs produced upon successful completion]
revision_history:
  - version: 1.0
    date: YYYY-MM-DD
    author: [Name]
    notes: Initial version
---

# WF-XXX — [Workflow Title]

## Purpose

[Describe what problem this workflow solves and why it exists. Be specific. Reference the operational context in which it is used. This section should explain the *why*, not just the *what*.]

---

## When to Use

[Describe the specific conditions under which an operator should invoke this workflow. Include:
- Trigger events or conditions
- Frequency of use (daily, weekly, ad hoc)
- Who is authorized to run this workflow
- What should NOT trigger this workflow]

---

## Inputs

Before starting this workflow, the operator must have the following available:

| Input | Description | Required |
|-------|-------------|----------|
| [Input 1] | [Description] | Yes / No |
| [Input 2] | [Description] | Yes / No |

---

## Repository Documents Required

The AI assistant must have access to the following Knowledge System documents to execute this workflow correctly:

| Document | Path | Purpose |
|----------|------|---------|
| [Document Name] | `knowledge_base/XX_section/file.md` | [Why it is needed] |

---

## Workflow Steps

### Step 1 — [Step Name]

**Operator action:**
[What the human does in this step.]

**AI action:**
[What the AI does in this step, including which documents to reference.]

**Output:**
[What is produced at the end of this step.]

---

### Step 2 — [Step Name]

**Operator action:**
[What the human does in this step.]

**AI action:**
[What the AI does in this step.]

**Output:**
[What is produced at the end of this step.]

---

### Step N — [Step Name]

**Operator action:**
[What the human does in this step.]

**AI action:**
[What the AI does in this step.]

**Output:**
[What is produced at the end of this step.]

---

## Expected Outputs

Upon successful completion of this workflow, the following outputs should exist:

1. [Output 1 — description and location]
2. [Output 2 — description and location]

---

## Limitations

[Document known limitations, edge cases, or conditions under which this workflow will not perform reliably. Be honest about failure modes. This section prevents over-reliance on the workflow in conditions it was not designed to handle.]

- [Limitation 1]
- [Limitation 2]

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | YYYY-MM-DD | [Name] | Initial version |
