---
title: Editorial Guidelines
document_id: GOV-001
version: 1.2
status: canonical
authority: editorial
load_priority: on_request
owner: Setas de la Peña
last_updated: 2026-07-09
---

# Editorial Guidelines

## 1. Purpose

This document establishes editorial standards for maintaining the Setas de la Peña knowledge base. Editorial governance exists to preserve coherence across the repository, ensure consistency with the CANON, prevent information duplication, and guarantee that the knowledge base remains operationally reliable as the project evolves. Every modification to the repository must serve these objectives.

---

## 2. Scope

This document governs every Markdown file in the Setas de la Peña knowledge base except:

- `SETAS_DE_LA_PENA_CANON.md` (governed by its own revision policy, Section 21)

Editorial guidelines apply to:

- Decision records
- Standard Operating Procedures (SOPs)
- Species profiles
- Substrate documentation
- Equipment specifications
- Facility blueprints
- Operations procedures
- Research summaries
- Research literature database entries
- Business documentation
- Brand documentation
- Current operational state (`FARM_BRAIN.md`)

---

## 3. Editorial Objectives

Every edit must serve at least one of the following objectives:

| Objective | Definition |
|---|---|
| **Consistency** | Terminology, structure, and referenced information align across related documents. |
| **Traceability** | Every operational claim is sourced. Every decision is recorded with rationale. |
| **Clarity** | Language is technical and unambiguous. Procedures can be executed from documentation without external interpretation. |
| **Maintainability** | Documents remain findable, updateable, and current. Scope violations and duplications are eliminated. |
| **Minimal Duplication** | Information appears in a single authoritative location. Related documents reference that location rather than copying. |
| **Evidence-Based** | Operational parameters are supported by field measurement or Tier 1/2 literature. Speculative content is labeled as such. |

An edit that does not serve at least one of these objectives is rejected.

---

## 4. Repository Hierarchy

The knowledge base enforces a strict precedence order, defined in full in `SETAS_DE_LA_PENA_CANON.md` Section 14 — the single source of truth for document precedence. Section 14.1 (Normative Authority) resolves conflicts between documents. Section 14.2 (Operational State) describes current reality and never overrides Normative Authority, however recent it is. This document does not restate that order; editors resolve precedence questions by consulting CANON Section 14 directly.

### 4.1 Editorial Authority

The repository distinguishes between architectural authority and editorial authority.

Architectural authority is defined by SETAS_DE_LA_PENA_CANON.md.

Editorial authority is defined by this document.

Operational documents inherit both.

Editors may modify operational documents to improve consistency, clarity, or accuracy.

Editors shall not modify the CANON unless an architectural decision has been formally approved and documented in DECISIONS.md.

Architectural changes always precede editorial changes.

---

## 5. Editorial Principles

### 5.1 Structure Preservation

Document structure is never modified without documented justification. If a section header, table, or list structure requires change, the rationale is recorded in `FARM_BRAIN.md`.

### 5.2 Frontmatter Preservation

Every Markdown file includes YAML frontmatter defining metadata. Frontmatter must never be removed. Fields required in all documents:

- `title`
- `document_id` (unique identifier)
- `category`
- `load_priority` (always, selective, on_request)
- `last_reviewed` (date, YYYY-MM-DD format)

Frontmatter is updated only when metadata content changes (e.g., `last_reviewed` after substantive revision).

### 5.3 Minimal Editing

The guideline is: **change as little as possible**. An edit that modifies 200 words to fix one inconsistency has failed this principle. Use `Find and Replace` to change terminology globally. Use targeted edits to update specific sections. Preserve the 90% of the document that is correct.

### 5.4 Preference for References

Avoid duplicating information. When a concept is defined in Document A and referenced in Document B, Document B should cite Document A rather than repeat the definition. Internal links use the syntax: `[[document_name]]` or `See: document_name.md`. See `CROSS_REFERENCE_STANDARD.md` for the full standard: canonical-home determination, reference syntax, and synchronization with `INDEX.yaml`.

### 5.5 Consistency as Prerequisite

Before modifying a document, check related documents for terminology, structure, and methodology consistency. If an edit makes one document inconsistent with a related document, the related document must be updated as well.

### 5.6 Principle: Every Edit Improves

Every edit must leave the repository in a more consistent, clearer, or more maintainable state than it was before. An edit that does not meet this standard is rejected.

### 5.7 Change Classification

Changes shall be classified as one of the following:

| Classification | Definition | Authority |
|---|---|---|
| **Editorial** | Grammar, formatting, references, wording. | Editorial authority; does not require architectural review. |
| **Structural** | Document organization without changing meaning. | Editorial authority with documentation in FARM_BRAIN.md. |
| **Operational** | Updates to procedures or workflows. | Requires SOP revision or CURRENT_OPERATIONS.md update. |
| **Architectural** | Changes to governing principles. | Requires formal decision in DECISIONS.md; CANON modification authority. |

Only Architectural changes modify the CANON. Operational changes update SOPs or CURRENT_OPERATIONS.md. Editorial changes do not require architectural review.

---

## 6. Language Policy

### 6.1 Avoid Absolute Categorical Language

Language such as the following is discouraged without supporting evidence:

| Avoid | Use Instead |
|---|---|
| best | most reliable for current known conditions |
| always | in all observed conditions to date |
| never | not observed in documented trials |
| ideal | target parameters based on Tier 1 literature |
| optimal | highest measured performance in field data |
| impossible | not feasible with current equipment/knowledge |

### 6.2 Evidence-Based Wording

Every operational parameter must include evidence strength. Examples:

- "Set to 85–90% RH based on Tier 1 literature (Stamets, 2000) and validated in field trials (Batch 2026-06)."
- "Estimated at $150–200 USD; actual cost pending vendor quotes."
- "Target contamination rate <10%; currently achieved at 8.2% (five-batch average)."

Speculative content must be labeled: "Unverified estimate," "Hypothesis pending field validation," or "Tier 3 practitioner report."

### 6.3 Technical Register

All documentation uses technical-agronomic language. Mystical, animistic, or pseudoscientific language is prohibited. Reference: CANON, Section 3, Principle P-07.

---

## 7. Document Responsibilities

Each document type has a defined scope and responsibility. Content outside this scope creates documentation debt.

| Document Type | Responsibility | Examples |
|---|---|---|
| **CANON** | Governing principles; how the project thinks | `SETAS_DE_LA_PENA_CANON.md` |
| **Formal Decisions** | Decisions made; rationale; measurement results; architectural direction | `DECISIONS.md` |
| **SOPs** | How a specific procedure is performed | `02_substrates/pasteurization.md` |
| **Species Profiles** | Stable biological parameters per species | `01_species/pleurotus_djamor.md` |
| **Substrate Docs** | Substrate composition, preparation, validation | `02_substrates/substrate_library.md` |
| **Equipment Specs** | Equipment description, installation, operation | `05_equipment/environmental_control.md` |
| **Facility Blueprints** | Physical infrastructure; modules; layout | `04_facility/master_blueprint.md` |
| **Operations SOPs** | Batch procedures; quality control; tracking | `06_operations/batch_tracking.md` |
| **Research Summaries** | What literature states; evidence ratings | `09_research/literature_database.md` |
| **Lessons Learned** | Operational experience; failures; recovery procedures; validated insights | `LESSONS_LEARNED.md`, batch logs |
| **Current Operations** | Executive operational snapshot; this week's priorities; immediate constraints | `FARM_BRAIN.md` |

A document that contains content outside its defined scope is marked for revision at the next review cycle.

### 7.1 FARM_BRAIN.md Scope

FARM_BRAIN.md serves as the executive project snapshot. It captures:

- Current operational state (this week's status)
- Immediate constraints and bottlenecks
- Active priorities

FARM_BRAIN.md does NOT store:

- Strategic or architectural decisions (those belong in DECISIONS.md)
- Operational history (those belong in batch logs)
- Lessons learned (those belong in LESSONS_LEARNED.md)
- Production logs (those belong in CURRENT_OPERATIONS.md)

### 7.2 Document Separation Principle

The four operational documents serve distinct functions and must remain separate:

- **FARM_BRAIN.md** — What is happening right now
- **CURRENT_OPERATIONS.md** — What is happening today (detailed operational state)
- **DECISIONS.md** — Why we decided to do it
- **LESSONS_LEARNED.md** — What we learned from doing it

---

## 8. Editing Workflow

### 8.1 Pre-Edit Verification

Before editing:

1. Read the document being edited.
2. Read the CANON, Section 5 (Laboratory Philosophy) and Section 7 (Automation Philosophy) if the edit concerns those areas.
3. Identify the minimal set of changes required.
4. Check related documents for consistency.

### 8.2 Edit Process

1. **Review:** Understand what the current text states and why it was written.
2. **Compare with CANON:** Verify that the current text is consistent with CANON principles.
3. **Identify Inconsistencies:** Note conflicts with other documents or with field evidence.
4. **Apply Minimal Edits:** Modify only what is necessary. Preserve structure, frontmatter, and all correct content.
5. **Validate References:** Ensure all citations are accurate and linked correctly.
6. **Update Metadata:** Update `last_reviewed` date in frontmatter.

### 8.3 Post-Edit Verification

After editing:

1. Read the edited section in full context.
2. Verify that related documents remain consistent.
3. Confirm that the edit does not introduce new scope violations.
4. Check that all hyperlinks remain valid.

---

## 9. Quality Checklist

Before accepting a revision, verify:

- [ ] **Structure preserved** — Section hierarchy, tables, and list format unchanged unless documented justification exists.
- [ ] **Frontmatter preserved** — All YAML fields present; metadata updated if content changed.
- [ ] **No duplicated information** — Content does not repeat what is defined in a higher-precedence document.
- [ ] **References updated** — All citations accurate; hyperlinks valid; cross-document links syntax-correct.
- [ ] **Consistent with CANON** — No content contradicts CANON principles; reference CANON where appropriate.
- [ ] **Scientifically supported** — Operational parameters include evidence source (field data or Tier 1–2 literature).
- [ ] **Technical register maintained** — No mystical, animistic, or pseudoscientific language introduced.
- [ ] **Minimal change principle met** — Only necessary edits applied; 90% of original content preserved.
- [ ] **Scope preserved** — Content belongs in this document type; no scope violations introduced.
- [ ] **Clarity improved** — If procedural language was changed, execution clarity is maintained or improved.

---

## 10. Editorial Anti-Patterns

The following editing practices create documentation debt and are prohibited:

| Anti-Pattern | Why It Fails | Correction |
|---|---|---|
| Duplicating CANON content into subordinate documents | Creates maintenance liability; violates minimal duplication principle | Reference the CANON section instead; do not repeat principles. |
| Moving information between documents without architectural reason | Loses traceability; violates scope definitions | Keep information in its authoritative document; use references. |
| Converting principles into procedures | Confuses governance with operations | Principles stay in CANON; procedures stay in SOPs. |
| Writing operational instructions inside research summaries | Violates document type responsibility | Operational instructions in SOPs; research findings in research files. |
| Adding project decisions directly into species documents | Species documents become mixed-type; loses traceability | Record decisions in FARM_BRAIN.md; reference from species documents. |
| Changing document structure without recording rationale | Future editors lose understanding of why structure changed | Document rationale in FARM_BRAIN.md before making structural changes. |
| Using absolute categorical language without evidence | Makes claims difficult to maintain as conditions change | Use evidence-based wording; cite sources. |
| Omitting evidence source for operational parameters | Readers cannot evaluate confidence or replicate decisions | Include source (field measurement or Tier 1/2 literature) with every parameter. |

---

## 11. Repository Evolution

The repository evolves by modifying the appropriate document type, not by modifying the CANON.

**When biological parameters change:** Update species profiles (`01_species/`).

**When operational procedures change:** Update SOPs (`06_operations/`, `02_substrates/`).

**When equipment is added or modified:** Update equipment documents (`05_equipment/`).

**When supplier or vendor relationships change:** Update business documents (`07_business/suppliers.md`).

**When a production cycle produces unexpected results:** Document in batch logs (`CURRENT_OPERATIONS.md`). If the result reveals a systemic issue, update the relevant operational SOP and record the decision in `FARM_BRAIN.md`.

**When new literature is discovered:** Add to research literature database with evidence rating. Update operational SOPs only if the literature contradicts current practice and is Tier 1.

**When a principle is discovered to be incorrect:** Follow the revision process in CANON Section 16. Do not modify the CANON without formal decision documentation.

---

## 12. Ownership and Accountability

Each document has an owner listed in frontmatter. The owner is responsible for:

- Maintaining consistency with the CANON.
- Updating the document when related documents change.
- Monitoring `FARM_BRAIN.md` for decisions that affect the document's scope.
- Initiating review when field data contradicts documented parameters.

---

## 13. Review Cycles

Scheduled review intervals define the maximum time between reviews. Significant operational changes always take precedence over the review calendar. Documents should be reviewed immediately whenever architectural decisions, operational procedures, or validated knowledge change substantially.

| Document Type | Review Cycle | Trigger for Immediate Review |
|---|---|---|
| Species profiles | Annually or when new Tier 1 literature appears | Field data contradicts documented parameters |
| Equipment documents | When equipment is modified or replaced | Equipment failure or operational limitation encountered |
| SOPs | After each production cycle where metrics exceed thresholds | Contamination rate >10%; BE <80%; sensor uptime <95% |
| Research summaries | When new literature is added | Literature contradicts current SOP; evidence rating changes |
| Business documents | Quarterly or when supplier relationship changes | Price change >10%; lead time change >4 weeks |
| Decision records | After decision implementation | Measurement results contradict decision assumptions |

---

## 14. Knowledge Lifecycle

Knowledge normally progresses through the following stages:

```
Observation
  ↓
Experiment
  ↓
Lesson Learned
  ↓
Decision
  ↓
Standard Operating Procedure
  ↓
Stable Knowledge Base
  ↓
CANON (only when architectural principles change)
```

Knowledge should mature gradually. No information should bypass this lifecycle without explicit justification.

---

## 15. Closing Statement

The knowledge base's long-term value derives from preserving coherence across time, across personnel changes, and across technological iterations. This value is achieved through editorial discipline, not through maximizing documentation volume.

A repository with fewer, coherent documents is superior to a repository with many inconsistent documents. An edit that reduces inconsistency is always preferable to an edit that adds new content.

The goal of every edit is to leave the knowledge base in a more reliable, more maintainable, and more consistent state than it was before.

---

*Document version: 1.2*
*Effective date: 2026-07-09*
*Next scheduled review: 2026-12-29*
*Authority: Knowledge Governance Architect — Setas de la Peña*
*This document may only be revised through the decision process defined in CANON Section 16.*
*Status: Stable — governance baseline established.*
