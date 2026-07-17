---
title: INDEX Generation Specification
document_id: SPEC-001
version: 1.1
status: canonical
authority: architecture
load_priority: on_request
owner: Setas de la Peña
last_reviewed: 2026-07-09
related_documents:
  - SETAS_DE_LA_PENA_CANON.md
  - CROSS_REFERENCE_STANDARD.md
  - IDENTIFIER_STANDARD.md
  - AI_AGENT_PROTOCOL.md
  - ROADMAP.md
supersedes: null
---

# INDEX Generation Specification

## 0. Status of This Document

This document is normative for the future implementation of the `INDEX.yaml` generator. It is authorized by `DECISIONS.md` DEC-011, which classified `INDEX.yaml` as generated infrastructure rather than manually maintained content, but DEC-011 explicitly does not authorize building the generator itself. This specification is the design that a future implementation decision (its own CANON §16 entry) would authorize into code. Writing this document does not authorize implementation. It exists so that when implementation is authorized, the design question has already been answered once, carefully, instead of being decided ad hoc inside a pull request.

This document defines **what** the generator must do and **why**. It intentionally does not define **how**, in the sense of programming language, libraries, or execution environment — see §12, Out of Scope. Two engineers implementing this specification independently, in different languages, should produce generators whose output — given the same repository state — is identical.

---

## 1. Purpose

### 1.1 Why `INDEX.yaml` exists

`AI_AGENT_PROTOCOL.md` §23 and `ROADMAP.md` describe the same gap: an AI agent answering a query today must either already know which document is canonical for a topic, or discover it by searching the repository — grepping filenames, opening candidate documents, and reasoning about which one governs. That search is repeated, by every agent, for every query, indefinitely. `INDEX.yaml` exists to make that search a single structured lookup instead: given a topic, a keyword, or a document id, resolve directly to the canonical document, its authority tier, and its relationships to other documents, without re-deriving any of that from prose.

### 1.2 Why it is generated

The alternative — a hand-maintained catalog — was evaluated and rejected once already, in DEC-010 (deferring population) and definitively in DEC-011 (classifying the artifact). The reasoning carries forward into this specification rather than being re-litigated here: almost every field `INDEX.yaml` needs already has a canonical origin elsewhere in the repository (a document's own frontmatter, CANON §14's precedence tables, in-body cross-references). A hand-maintained catalog would be a second, manually-synchronized copy of facts that already have one home. Two copies of the same fact, synchronized by human discipline rather than by construction, diverge — not eventually, but predictably, the first time an editor updates one and not the other. `INDEX.yaml` is generated so that divergence between the catalog and the documents it describes becomes structurally impossible rather than merely detectable after the fact.

### 1.3 Why it must never become a manually maintained document

This is not a preference to be revisited on convenience — DEC-011 made it permanent ("La población manual completa queda descartada permanentemente como modelo de mantenimiento"). The reason is architectural, not procedural: the moment any field in `INDEX.yaml` can legitimately be edited by hand without a corresponding change to its source document, `INDEX.yaml` stops being a mirror and becomes a second authority. At that point every one of the guarantees in §2 below (single source of truth, no inferred authority, reproducibility) is void, and the catalog reverts to exactly the failure mode DEC-011 was written to close: an artifact that looks authoritative and is quietly wrong. Any future proposal to hand-edit a generated field is a proposal to reverse DEC-011, and must go through CANON §16 as such — it is not a bug fix or a convenience exception.

---

## 2. Architectural Principles

These principles bind every design decision in the sections that follow. Where a later section appears to conflict with one of these, the principle governs and the later section is in error.

- **Single source of truth (P-02, CANON).** Every fact `INDEX.yaml` carries has exactly one authored origin outside `INDEX.yaml` itself. The generator reads that origin and writes a derived copy; it never accepts a value that has no source other than a previous run of `INDEX.yaml`.
- **Deterministic generation.** Given the same repository content, the generator produces the same output, every time, on every machine. No field's value may depend on wall-clock time, execution order, filesystem iteration order, random identifiers, or any other non-repository input. (`schema_version` and structural comments are the only content permitted to be authored directly in the generator rather than derived from repository state — see §5.)
- **Reproducibility.** A third party, given only the repository at a specific commit and this specification, can reconstruct the exact `INDEX.yaml` that a correct generator would have produced for that commit — without needing to know anything about who ran the generator, when, or on what hardware.
- **No inferred authority.** The generator never guesses. Authority tier, category, and every other classification field are resolved by deterministic lookup against an explicit, versioned mapping (§6) — never by pattern-matching a filename, guessing from a document's position in a directory listing, or applying a heuristic that could be right most of the time and silently wrong some of the time. If the mapping does not cover a document, that is a validation failure (§7), not an opportunity for the generator to infer an answer.
- **Fail closed.** When the generator cannot determine a required fact with certainty, it does not emit a best guess. It either omits the affected entry with a recorded reason (soft failure) or aborts the run entirely (hard failure), per the classification in §7 and §10. An incomplete `INDEX.yaml` that is honestly incomplete is acceptable; a complete-looking `INDEX.yaml` that contains a guess is not.
- **Stable output.** Byte-for-byte identical output across runs when no relevant repository content has changed (§8). This is what makes diffs meaningful: a diff in `INDEX.yaml` after a regeneration must mean "something in the repository changed," never "the generator ran again."
- **No hidden state.** The generator holds no memory of prior runs, no cache that can diverge from the repository, and no configuration that lives outside version control. Every input the generator consults is itself a versioned, reviewable repository artifact (§3). Re-running the generator from a clean checkout must be indistinguishable from running it on a machine that has run it a hundred times before.
- **Minimal manual work.** The only manual work this architecture requires, once implemented, is: writing and maintaining frontmatter and in-body cross-references on source documents (work that is already required by `EDITORIAL_GUIDELINES.md` independent of `INDEX.yaml`), and reviewing the generator's own diff before committing it. No person should ever need to hand-edit a field inside `INDEX.yaml`'s `documents:` block.

---

## 3. Inputs

The generator has exactly the inputs listed below. Nothing else may influence output. For each input, this section states its source, its owner (who is authorized to change it), its authority (what happens if it disagrees with `INDEX.yaml`), and its expected format.

### 3.1 Repository filesystem

- **Source:** the working tree at the commit being processed — specifically, every Markdown (`.md`) file under `knowledge_base/`, plus `/README.md` at the repository root.
- **Owner:** whoever authors or moves repository documents, under the normal editorial process (`EDITORIAL_GUIDELINES.md`).
- **Authority:** absolute, for the fact of a document's existence and its path. The generator does not maintain a separate list of "known documents" — the filesystem walk (§4.1) is the only source of document membership. A file present in the tree and absent from `INDEX.yaml` after generation is a validation gap (§7), never evidence the file doesn't exist.
- **Expected format:** standard repository directory layout as described in `REPOSITORY_MAP.md`. The generator does not require a particular layout beyond "Markdown files with YAML frontmatter" — it does not hardcode assumptions about the numbered top-level directories (`01_species/`, `02_substrates/`, etc.) beyond what §6's authority mapping already encodes.

### 3.2 Frontmatter

- **Source:** the YAML frontmatter block at the top of each Markdown file, delimited by `---` lines, as required by `EDITORIAL_GUIDELINES.md` §5.2.
- **Owner:** the author/editor of the individual document.
- **Authority:** absolute, for every field it defines. `title`, `category`, `confidence`, `status`, `supersedes`/`superseded_by`, and `related_documents` are authored once, in frontmatter, and the generator only ever copies them outward — never the reverse.
- **Expected format:** valid YAML, parseable independent of document body content. `EDITORIAL_GUIDELINES.md` §5.2 lists `title`, `document_id`, `category`, `load_priority`, and `last_reviewed` as required on every document; in practice (see §7.6) not every existing document carries every one of these fields yet, and the generator's validation behavior for that gap is specified explicitly rather than assumed.

### 3.3 CANON §14 (Normative Authority and Operational State tables)

- **Source:** `SETAS_DE_LA_PENA_CANON.md` §14.1 (Normative Authority, nine ranked tiers) and §14.2 (Operational State, a separate unranked axis), as prose lists of files and directories per tier.
- **Owner:** changes to CANON §14 follow CANON's own revision policy (§21) — the highest-friction change process in the repository, deliberately.
- **Authority:** absolute and final. Nothing in `INDEX.yaml`, including the `authority` field, may ever disagree with CANON §14 and be treated as correct. Per `AI_AGENT_PROTOCOL.md` §23.2, `INDEX.yaml`'s `authority` field is a cache of this table for fast lookup, not an alternative to it.
- **Expected format:** CANON §14.1/§14.2 are prose, not structured data, and this specification does not propose changing that (`ROADMAP.md` already names "CANON §14.1 tier-membership decoupling" as separate, unauthorized future work; DEC-011 explicitly does not authorize touching CANON). The generator therefore does not parse CANON §14's prose directly. It consults a **structured authority lookup** (§6) that is a faithful, versioned transcription of CANON §14's current tier membership, kept outside CANON itself.

### 3.4 Structured authority lookup

- **Source:** a versioned mapping from path pattern (or, for the small number of individually-named documents, exact path) to CANON §14 tier. This is new infrastructure introduced by this specification, not a pre-existing repository artifact.
- **Owner:** whoever maintains the generator's configuration. Per DEC-011's explicit scope, this mapping may live either as internal generator configuration or inside `REPOSITORY_MAP.md` — this specification does not decide between those two placements (see §12); it only requires that wherever it lives, it is version-controlled, reviewable, and never generated or inferred.
- **Authority:** derivative of CANON §14 by definition — this mapping's entire justification is "this is what CANON §14 already says, in a form a generator can look up." It has no independent authority. Any time CANON §14.1/§14.2 changes, this mapping must be updated in the same change or an immediately following one; a stale mapping is a validation failure (§7.5), not a silent divergence.
- **Expected format:** a closed, finite table — every path pattern maps to exactly one of the ten controlled-vocabulary values already defined in `INDEX.yaml`'s `authority` field (the nine Normative Authority tiers plus `operational_state`), or the document is out of the table's coverage entirely (§6.3).

### 3.5 Reference syntax and in-body cross-references

- **Source:** the two reference forms defined in `CROSS_REFERENCE_STANDARD.md` §3 — inline document references (`` `path/to/file.md` ``, optionally with a section pointer) appearing in document body text. The reserved wiki-style `[[document_name]]` form is not currently used anywhere in the repository and is out of scope until `CROSS_REFERENCE_STANDARD.md` §3 says otherwise.
- **Owner:** the author/editor of the referencing document's body text.
- **Authority:** absolute over the *fact of a relationship's existence*. Per `CROSS_REFERENCE_STANDARD.md` §4, if an in-body reference and an `INDEX.yaml` relationship field disagree, the in-body reference governs and `INDEX.yaml` is corrected — which, once generation is authorized, is precisely what a regeneration run does automatically.
- **Expected format:** a document-relative or repository-relative path, in backticks, matching an actual file in the repository. A reference to a path that does not resolve to a real file is a broken reference (§7.3).

### 3.6 `related_documents` frontmatter

- **Source:** the `related_documents` frontmatter list already present on most domain documents today (distinct from `CROSS_REFERENCE_STANDARD.md`'s in-body prose references — this is a structured frontmatter field, already in wide use, that predates `INDEX.yaml`).
- **Owner:** the author/editor of the document carrying the field.
- **Authority:** absolute, as a second, independent signal of a relationship alongside §3.5's in-body references. The two are expected to substantially overlap but are not required to be identical — `related_documents` may name a relationship the body prose never states explicitly in citation form.
- **Expected format:** a YAML list of filenames or relative paths, as already used across existing frontmatter blocks (see §5.10 for how this maps onto `INDEX.yaml`'s `id`-based relationship fields).

### 3.7 Literature identifiers

- **Source:** `09_research/literature_index.md` and `09_research/literature_database.md`, and the `paper_XXX` / `book_XXX` / `guide_XXX` identifier tags used inline throughout domain documents' "References" sections.
- **Owner:** whoever maintains the research library, under `CANON §9` (Research Philosophy).
- **Authority:** absolute for the existence and identity of a source. An identifier tag that does not resolve to an entry in `literature_index.md` is a broken reference (§7.3).
- **Expected format:** the existing `paper_NNN` / `book_NNN` / `guide_NNN` convention, unchanged by this specification.

---

## 4. Discovery Algorithm

Generation proceeds as a strict pipeline. Each stage consumes only the output of the stage before it plus the inputs defined in §3 — no stage reaches back into a later stage's output, and no stage may be skipped or reordered.

```
repository walk
      ↓
document detection
      ↓
frontmatter parsing
      ↓
classification
      ↓
validation
      ↓
sorting
      ↓
INDEX generation
```

### 4.1 Repository walk

Enumerate every file under `knowledge_base/` plus `/README.md`, in an implementation-defined traversal order. Traversal order is explicitly **not** meaningful and must not leak into output — see §8 on why sorting is a separate, later stage rather than "whatever order the walk found things in."

### 4.2 Document detection

Filter the walk to files that are in-scope for cataloging: Markdown files (`.md` extension). Non-Markdown files (YAML under `metadata/`, image assets, etc.) are not catalog entries and are excluded here, not silently dropped later. A future extension could catalog non-Markdown structured data (§11) but that is explicitly not this version's scope.

Within Markdown files, apply one exclusion rule deterministically: templates. A document whose sole purpose is to be copied and filled in, not read as content in its own right (e.g. `10_ai_workflows/templates/workflow_template.md`), is still discovered and still gets an entry — DEC-010's own example entry for `workflow-template` establishes that templates are cataloged with `canonical: false`, not excluded from the catalog. There is no document-detection-stage exclusion for templates; the distinction is expressed entirely through the `canonical` field (§5.6), decided later, from data (a template flag or an equivalent convention), never inferred from the filename or directory at this stage.

### 4.3 Frontmatter parsing

For each detected document, parse its YAML frontmatter block in isolation from the body. A document with no frontmatter block at all, or with a frontmatter block that fails to parse as valid YAML, is a malformed-frontmatter validation failure (§7.6) — it proceeds no further through this pipeline for this run, but its failure is recorded, not silenced.

### 4.4 Classification

For each document with successfully parsed frontmatter, resolve every `INDEX.yaml` schema field per §5's field-by-field rules and §6's authority resolution. Classification produces one candidate catalog entry per document — "candidate" because it has not yet passed validation.

### 4.5 Validation

Run every check in §7 against the full set of candidate entries (not one at a time — several checks, such as duplicate-id detection, are only meaningful across the whole set). Each candidate entry either passes, is excluded with a recorded reason (soft failure), or causes the entire run to abort (hard failure), per §7's classification.

### 4.6 Sorting

Arrange the surviving, validated entries into the deterministic order defined in §8.

### 4.7 INDEX generation

Serialize the schema block (authored once, versioned — see §5.0) followed by the sorted `documents:` list, to `INDEX.yaml`, in the exact byte-stable form defined in §8.

---

## 5. Field Generation

### 5.0 The schema block itself

The `schema:` block currently present in `INDEX.yaml` (field definitions, controlled vocabularies, descriptions) is **not** a generated artifact — it is authored documentation of the format, analogous to a header comment, and changes only when this specification changes. The generator emits it verbatim (or the generator's own copy of it, kept identical to this specification's schema by manual review) ahead of the generated `documents:` list. This is the one exception to "generated, never authored" named in §2, and it is named here explicitly so it is never mistaken for a gap in that principle.

For every field below: **source** (where the value comes from), **generated or authored** (whether a human ever writes this value directly, anywhere), **validation** (what the generator checks before emitting it), **default behavior** (what happens when the source is silent), and **failure behavior** (what happens when the source is present but invalid).

### 5.1 `id`

- **Source:** derived deterministically from the document's repository-relative path (§3.1) — not from frontmatter `document_id`, which uses a separate namespace and format (`IDENTIFIER_STANDARD.md` §5.3's unused `DOC` prefix, versus this field's existing lowercase-kebab-case convention; reconciling the two namespaces is explicitly out of scope, per DEC-011's evidence and `ROADMAP.md`'s identifier-convention-reconciliation debt item). The derivation rule itself (e.g., filename minus extension, transliterated to kebab-case, with directory-collision handling) is an implementation detail deferred to the implementing engineer under §12, provided it is deterministic and produces the existing example ids (`canon`, `pleurotus-djamor`, `ai-agent-protocol`, etc.) unchanged for the documents already in the schema's representative examples.
- **Generated or authored:** generated.
- **Validation:** must be unique across the entire generated catalog (§7.1).
- **Default behavior:** none — always derivable from path, which is always present.
- **Failure behavior:** a derivation collision (two distinct paths producing the same `id`) is a hard failure for both affected entries (§7.1) — the generator does not guess a disambiguating suffix.

### 5.2 `title`

- **Source:** frontmatter `title`.
- **Generated or authored:** authored (in the source document's frontmatter); generated (in `INDEX.yaml`, as a direct copy).
- **Validation:** must be present and non-empty.
- **Default behavior:** none.
- **Failure behavior:** missing `title` is malformed frontmatter (§7.6) — hard failure for that document's entry.

### 5.3 `path`

- **Source:** the document's repository-relative path from the walk (§4.1), relative to `knowledge_base/` (or repository root for `/README.md`, matching the existing schema note).
- **Generated or authored:** generated.
- **Validation:** must resolve to the exact file that produced this entry (a tautology by construction, but checked as a guard against a future implementation bug, not against manual error).
- **Default behavior:** none — always present.
- **Failure behavior:** not applicable — this field cannot fail independently of the document existing.

### 5.4 `authority`

- **Source:** the structured authority lookup (§3.4/§6). Never frontmatter — no document in the repository today carries an `authority` frontmatter field, and this specification does not introduce one (that would duplicate CANON §14 in a second location, the exact failure mode §1.2 exists to prevent).
- **Generated or authored:** generated.
- **Validation:** must resolve to exactly one of the controlled-vocabulary values already defined in the existing `INDEX.yaml` schema block.
- **Default behavior:** a document matching no pattern in the lookup and not individually named in CANON §14.1/§14.2 receives `authority: none` (the existing controlled-vocabulary value for "no independent authority") — this is not a failure, it is the correct classification for pure-synthesis documents like `SYSTEM_MAP.md`.
- **Failure behavior:** a document matching **more than one** tier pattern (a genuine ambiguity in the lookup table, e.g. overlapping path prefixes) is a hard failure for the lookup itself (§7.5), not resolved by picking the more specific or more senior match — an overlapping lookup table is a defect in §3.4's data, to be fixed there, not compensated for in the generator.

### 5.5 `category`

- **Source:** frontmatter `category`.
- **Generated or authored:** authored (in source frontmatter); generated (copied into `INDEX.yaml`).
- **Validation:** must be one of the controlled-vocabulary values already listed in the existing schema block.
- **Default behavior:** none.
- **Failure behavior:** a document with no `category` frontmatter field is excluded from the generated catalog as a soft failure (§7.6), with the reason recorded in the generation report (§9). This is a currently real gap — a meaningful fraction of existing documents, including some governance-tier documents, do not yet carry `category` frontmatter — and this specification deliberately does not paper over it with a derived fallback (e.g., inferring category from directory), because that would be exactly the inferred-authority behavior §2 prohibits. Closing this gap is frontmatter authoring work on the source documents, explicitly out of scope for DEC-011 and for the generator itself (§12); the generator's role is to make the gap visible in its report, not to fill it.

### 5.6 `canonical`

- **Source:** not currently backed by any frontmatter field in the repository. This is the sharpest open question this specification identifies — see §5.6.1.
- **Generated or authored:** intended to be generated; today, no deterministic source exists.
- **Validation:** must be a boolean.
- **Default behavior:** see §5.6.1.
- **Failure behavior:** see §5.6.1.

#### 5.6.1 Open question: source of `canonical`

The existing schema defines `canonical` as a scoped, editorial judgment ("is this document the source of truth for its own declared category and scope") — precisely the kind of judgment call `KNOWLEDGE_ARCHITECTURE.md` and `EDITORIAL_GUIDELINES.md` assign to a human author, not a value derivable from a path pattern the way `authority` is. No existing frontmatter field captures it. This specification does not resolve this gap; it names two candidate resolutions for a future decision to choose between, and requires that generation define default behavior only after one is chosen:

- **(a)** Introduce a new frontmatter field (e.g. `canonical: true|false`) that authors set explicitly, mirroring how `confidence` and `status` already work. This keeps the "generated, never authored" discipline intact but requires the frontmatter-field addition that DEC-011 explicitly did not authorize.
- **(b)** Derive `canonical` from `authority` plus a fixed rule (e.g., "every document that CANON §14 assigns to a Normative Authority or Operational State tier is `canonical: true`; every document with `authority: none` is `canonical: false`"). This requires no new frontmatter but is a lossier rule than the existing hand-written examples demonstrate — `workflow-template.md` has `authority: none` and `canonical: false` under this rule, which matches the existing example entry, but the rule cannot express a case like "canonical for this narrow scope, but with an `authority` tier" without further refinement.

Until a follow-up decision selects (a), (b), or a third option, the generator's correct behavior for `canonical` is to treat it as **not yet generatable**: exclude it from generated entries as a known, named gap in the generation report (§9), rather than emit a value under either candidate rule silently. Emitting under an unratified rule would be exactly the kind of unauthorized inference §2 exists to prevent.

### 5.7 `topics` / `keywords`

- **Source:** intended to be frontmatter, but — like `canonical` — no such field exists in current frontmatter practice; today these are hand-authored directly inside `INDEX.yaml`'s example entries, which is precisely the manually-maintained-catalog pattern DEC-011 forbids going forward.
- **Generated or authored:** currently authored (in the schema-stage examples); this is a debt the generator must not perpetuate.
- **Validation:** list of strings, if present.
- **Default behavior:** a document with no frontmatter source for `topics`/`keywords` is generated with these fields **omitted** (both are `required: false` in the existing schema) rather than left populated with stale hand-authored content from a prior manual edit. An empty or absent field is an honest "not yet captured"; a populated-but-unsourced field is not.
- **Failure behavior:** not applicable — omission is the correct behavior, not a failure.
- **Note:** DEC-011's own evidence explicitly names this pair of fields as "editorial-judgment volume too high to justify generation infrastructure" as a possible future review trigger (`DECISIONS.md` DEC-011, "Criterio de revisión"). This specification treats that risk as already realized for these two fields specifically: they remain schema-defined but effectively unpopulated by the generator until a source frontmatter field is authorized, which is consistent with, not a violation of, DEC-011.

### 5.8 `related_documents`

- **Source:** the union of §3.5 (in-body cross-references, resolved to their target document's generated `id`) and §3.6 (`related_documents` frontmatter, resolved the same way).
- **Generated or authored:** authored (as prose citations and/or frontmatter, by the document's editor); generated (as the resolved, `id`-keyed list in `INDEX.yaml`).
- **Validation:** every resolved target must be a real document that also has (or will have, in the same generation run) a catalog entry; every listed target id must exist in the generated `documents:` list.
- **Default behavior:** a document with neither an in-body reference nor a `related_documents` frontmatter entry generates an empty list (or omits the field, per the existing schema's `required: false`) — not a failure, simply nothing to report.
- **Failure behavior:** a reference or `related_documents` entry that names a path with no corresponding file, or a document that failed its own validation (§7) and was excluded, is a broken reference (§7.3) — recorded, and the specific broken link omitted from the referencing document's `related_documents`, without failing the referencing document's entire entry (a broken outbound link is evidence about the target, not disqualifying evidence about the source).

### 5.9 `depends_on` / `implemented_by`

- **Source:** as with `canonical` and `topics`/`keywords`, no current frontmatter or in-body syntax distinguishes an asymmetric "depends on" or "implemented by" relationship from a general "related to" relationship (§3.5/§3.6 only establish that *a* relationship exists, not its direction or asymmetry). `CROSS_REFERENCE_STANDARD.md` §4 explicitly acknowledges this: "`INDEX.yaml` may carry relationships... that have no natural in-body prose form."
- **Generated or authored:** currently authored only, in the schema-stage examples — same debt as §5.7.
- **Validation:** each listed id must exist in the generated catalog (same rule as §5.8).
- **Default behavior:** omitted when no source data distinguishes the asymmetric relationship from a symmetric one — the generator does not infer directionality from, e.g., which document has the higher CANON §14 tier, because tier seniority and dependency direction are not the same relationship (a Tier 5 SOP can depend on a Tier 4 canonical-knowledge document without every such pair being a `depends_on` edge — the existing worked example in `CROSS_REFERENCE_STANDARD.md` §2 demonstrates the distinction).
- **Failure behavior:** not applicable — omission, not failure, exactly as §5.7.

### 5.10 `supersedes`

- **Source:** frontmatter `supersedes` / `superseded_by`, where present (today, only `SETAS_DE_LA_PENA_CANON.md` carries these fields; see §3.2).
- **Generated or authored:** authored (in frontmatter); generated (copied into `INDEX.yaml`).
- **Validation:** if present, must resolve to a real document's generated `id`.
- **Default behavior:** `null`, matching the existing schema, for any document with no `supersedes` frontmatter.
- **Failure behavior:** a `supersedes` value that does not resolve to a real document is a broken reference (§7.3) — the field is omitted (treated as `null`) for that entry, and the gap is recorded.

### 5.11 `source_documents`

- **Source:** `paper_XXX`/`book_XXX`/`guide_XXX` identifier tags appearing in a document's body (typically in a "References" section), resolved against `literature_index.md` (§3.7).
- **Generated or authored:** authored (as inline citation tags, already an existing repository convention per DEC-011's evidence); generated (as the extracted, deduplicated list).
- **Validation:** every extracted tag must resolve to an entry in `literature_index.md`.
- **Default behavior:** omitted for a document with no such tags in its body — most documents outside `01_species/`–`06_operations/` will have none, and that is expected, not a gap.
- **Failure behavior:** a tag that does not resolve to a `literature_index.md` entry is a broken reference (§7.3) — the specific tag is omitted from the generated list; the rest of the document's entry is unaffected.

### 5.12 `confidence`

- **Source:** frontmatter `confidence`.
- **Generated or authored:** authored (in source frontmatter); generated (copied).
- **Validation:** must be one of `high`, `medium`, `low`, `experimental` (the existing controlled vocabulary, matching `AI_AGENT_PROTOCOL.md` §17's four-level scale).
- **Default behavior:** omitted for a document with no `confidence` frontmatter (`required: false` in the existing schema) — never defaulted to a specific level, because defaulting would be an inferred claim about evidence strength the generator has no basis to make.
- **Failure behavior:** a `confidence` value outside the controlled vocabulary is malformed frontmatter (§7.6) for that field specifically — the field is omitted, not coerced to the nearest valid value.

### 5.13 `status`

- **Source:** frontmatter equivalent (today, most domain documents do not carry a `status` field distinct from the 00_project-tier documents' `status: canonical` convention — see §7.6 for how the generator treats this gap).
- **Generated or authored:** authored (where present); generated (copied).
- **Validation:** must be one of `draft`, `active`, `deprecated`, `superseded` (the existing controlled vocabulary).
- **Default behavior:** this field is `required: true` in the existing schema, so, unlike `confidence`, a missing source value cannot simply be omitted without the entry itself failing schema validation. Resolving this — whether by a fallback rule, a required-field-relaxation, or a frontmatter backfill — is a second open question, named explicitly in §5.13.1, and not resolved by this specification.

#### 5.13.1 Open question: source of `status` for documents without frontmatter `status`

Two candidate resolutions, structurally identical to §5.6.1's fork: **(a)** add a `status` frontmatter field to source documents (frontmatter migration, not authorized by DEC-011), or **(b)** relax `status` from `required: true` to `required: false` in a future schema revision, accepting that most entries will simply omit it until (a) happens. This specification does not choose between them. Until a follow-up decision does, generation behavior is the same as §5.6.1: documents lacking a resolvable `status` are excluded from the generated catalog as a named, reported gap (§9), not defaulted to `active` — defaulting would assert a lifecycle claim the generator has no source for.

---

## 6. Authority Resolution

Authority resolution is the single most consequential thing the generator does, because CANON §14.3 makes authority the tie-breaker for every documentation conflict in the repository. This section exists to make that resolution mechanical and auditable — no inference, ever.

### 6.1 The lookup, not the prose, is consulted

The generator never parses CANON §14.1/§14.2's prose text to determine a document's tier. It consults only the structured authority lookup (§3.4) — a separate, explicit, versioned table that is a transcription of CANON §14, not a derivation from it at generation time. This separation exists so that a change in CANON §14's wording (rephrasing a sentence, reordering a list for readability) can never silently change a document's computed authority tier as a side effect of prose parsing — only a deliberate, reviewed update to the lookup table can do that, and per §3.4 that update is required to happen in lockstep with any real CANON §14 change.

### 6.2 Resolution is a single deterministic function

For a given document path, exactly one of the following holds, checked in this fixed order:

1. The path matches an individually-named file in the lookup (e.g. `SETAS_DE_LA_PENA_CANON.md` itself, or another file CANON §14.1 names directly rather than by directory) → that tier.
2. The path falls under a directory prefix the lookup associates with a tier (e.g. `01_species/` → `canonical_knowledge`) → that tier.
3. The path falls under a directory prefix the lookup associates with `operational_state` (a separate, unranked axis per CANON §14.2) → `operational_state`.
4. None of the above → `authority: none`.

A path must match at most one rule among (1)–(3). If the lookup table is constructed such that a path could match more than one, that is a defect in the table (§3.4), surfaced as a hard validation failure (§7.5) — never silently resolved by rule precedence, because CANON §14 itself defines no such precedence between its own tiers being simultaneously true for one document (a document belongs to exactly one tier, by CANON §14's own design).

### 6.3 Coverage is not assumed complete

The lookup table is not required to mention every possible future path — new documents in new directories will exist that the table has not yet been updated for. Case 4 above (`authority: none`) is the correct, non-failing resolution for a path the table does not cover, **provided** the path is not one CANON §14.1/§14.2 discusses by name or clearly-intended directory scope. Distinguishing "genuinely has no independent authority" from "the lookup table is stale and needs an entry" is not something the generator can determine algorithmically — it is a review responsibility for whoever maintains §3.4's table, informed by the generation report (§9) flagging every `authority: none` result for human review before commit.

---

## 7. Validation Pipeline

Every check below is classified as either a **hard failure** (aborts the entire generation run — no `INDEX.yaml` is written or updated) or a **soft failure** (excludes the specific affected entry or field, records the reason in the generation report per §9, and generation continues for everything else). The classification is deliberate, not incidental, and is explained per check.

### 7.1 Duplicate ids

Two documents resolving to the same `id` (§5.1) is a **hard failure**. An id collision means the catalog's sole lookup key is ambiguous — every downstream consumer (`AI_AGENT_PROTOCOL.md` §23.1's discovery-by-id) becomes unreliable for both affected documents, not just one. This cannot be soft-failed by picking one arbitrarily; that would silently drop a real document from discoverability.

### 7.2 Duplicate paths

Two catalog entries claiming the same `path` (§5.3) — this should be structurally impossible given §4.1's walk produces one entry per file, and its presence would indicate a generator defect, not a repository content problem. **Hard failure**, treated as an assertion failure in the generator itself.

### 7.3 Broken references

An in-body reference (§3.5), a `related_documents` frontmatter entry (§3.6), a `supersedes` value (§5.10), or a `source_documents` tag (§5.11) that does not resolve to a real, validated catalog entry. **Soft failure** — the specific broken link is omitted from the affected field, and the gap is recorded (§9), but the referencing document's entry is otherwise generated normally. A broken reference is information about the reference, not a reason to withhold an otherwise-valid entry.

### 7.4 Missing targets

A relationship field naming a document that exists on disk but failed its own validation for an unrelated reason (e.g. malformed frontmatter, §7.6) and was therefore excluded from this run's catalog. Treated identically to §7.3 (soft failure, field-level omission) — the target's exclusion is already recorded under its own entry's failure; the referencing document does not need a second, redundant failure record, only the omitted link.

### 7.5 Invalid authority

A document matching more than one authority-lookup rule (§6.2), or the authority lookup table itself failing basic structural validity (e.g. a tier value not in the controlled vocabulary). **Hard failure.** Authority is the one field this specification treats as too consequential (§6, opening paragraph) to ever emit provisionally — an ambiguous or malformed authority resolution is exactly the kind of "looks confident, is wrong" state §2's fail-closed principle exists to prevent, and it is cheap to detect (the table is small and closed) relative to how expensive it would be to have wrong.

### 7.6 Missing or malformed required frontmatter

A document with no frontmatter block, a frontmatter block that fails to parse as YAML, or a frontmatter block missing a field this specification requires for that document's `INDEX.yaml` entry to be generatable (`title` per §5.2; `category` per §5.5; a resolvable `status` per §5.13, pending §5.13.1). **Soft failure, at the granularity of the individual document** — that document is excluded from this run's generated catalog, with the specific missing/malformed field recorded (§9). This is deliberately not a hard failure for the whole run: given the presently uneven state of frontmatter adoption across the repository (§5.5, §5.13), treating every gap as run-aborting would make the generator unable to produce any output at all until every one of ~68 documents has been individually brought into compliance — which would re-create exactly the "population is a prerequisite, so it never starts" failure mode DEC-010 already deferred once. A partial, honestly-incomplete catalog that keeps growing as frontmatter gaps close is preferable to a permanently-empty one blocked on a full audit.

### 7.7 Invalid category

A `category` frontmatter value present but not in the controlled vocabulary (§5.5). **Soft failure**, same granularity and reasoning as §7.6 — recorded, entry excluded, run continues.

### 7.8 Schema violations

Any generated field whose type or shape does not match the schema block (§5.0) — e.g. a `related_documents` frontmatter value that is a string instead of a list. **Soft failure** at the field level: the specific malformed field is omitted (treated as if absent) and recorded; this does not by itself exclude the whole document's entry unless the malformed field was itself required (in which case §7.6's document-level exclusion applies instead).

### 7.9 Summary table

| Check | Granularity | Classification |
|---|---|---|
| Duplicate id | Run-wide | Hard failure |
| Duplicate path | Run-wide | Hard failure |
| Broken reference | Field | Soft failure |
| Missing/excluded target | Field | Soft failure |
| Invalid/ambiguous authority | Run-wide (table) / document (ambiguous match) | Hard failure |
| Missing or malformed required frontmatter | Document | Soft failure |
| Invalid category | Document | Soft failure |
| Schema violation (non-required field) | Field | Soft failure |
| Schema violation (required field) | Document | Soft failure (via §7.6) |

---

## 8. Deterministic Ordering

`documents:` entries are sorted by `id` (§5.1), lexicographically, byte-wise, ascending — the same ordering already visible by inspection in the existing schema-stage example entries' relative order is coincidental to their manual authorship and is not itself the rule; `id` order is the rule, chosen because `id` is the one field guaranteed unique (§7.1) and independent of any editorial judgment (unlike, say, sorting by `authority` tier, which would require a secondary sort key the moment two documents share a tier).

Byte-identical output additionally requires:

- Fixed key order within each entry, matching the field order already established in the existing schema block (`id`, `title`, `path`, `authority`, `category`, `canonical`, `topics`, `keywords`, `related_documents`, `depends_on`, `implemented_by`, `supersedes`, `source_documents`, `confidence`, `status`) — never alphabetical key order, never insertion order, always this fixed sequence.
- Fixed list-item order within any list-valued field (`topics`, `keywords`, `related_documents`, `depends_on`, `implemented_by`, `source_documents`) — sorted lexicographically by the same rule as top-level entries, so that a list's content, not the order its source citations happened to appear in a document's body, determines its serialized order.
- A fixed, versioned YAML serialization style (indentation width, quoting rules, line width) that does not vary by which underlying library or language produced it — this specification requires that the *style* be fixed and documented at implementation time (§12 leaves the library choice open, but not the resulting byte layout).

This matters for three concrete reasons. First, a diff in `INDEX.yaml` must be a true signal, not noise — a reviewer (human or agent) looking at a regeneration's diff needs "nothing changed here" to mean the bytes are identical, not "roughly the same, modulo key reordering." Second, version control history stays meaningful: `git blame` and `git log -p` on `INDEX.yaml` should show *content* changes, not churn from a generator that made arbitrary ordering choices differently between two runs. Third, it is the only way to satisfy §2's reproducibility principle in a checkable way — "byte-identical" is a test a CI step (conceptually, per §9.2 — not designed here) can actually assert, where "roughly equivalent" cannot.

---

## 9. Regeneration Workflow

### 9.1 The conceptual loop

```
document changes (frontmatter, body references, new/moved/deleted files)
      ↓
generator runs (§4's pipeline)
      ↓
validation (§7) — hard failures abort here, before any file is written
      ↓
INDEX.yaml (rewritten in full, per §8's deterministic serialization)
      ↓
commit (by a human or agent reviewing the diff, exactly as any other
        repository change is committed)
```

`INDEX.yaml` is always rewritten in full on every run, never patched incrementally — partial, in-place updates would reintroduce hidden state (§2: "does the generator remember what it last wrote, or does it derive fresh output every time?") and make byte-stability (§8) far harder to guarantee. A full rewrite that happens to produce identical bytes to the previous version is the expected, common case, not a wasted step.

### 9.2 Generation report

Every run produces a report, separate from `INDEX.yaml` itself, enumerating: every soft-failure exclusion (§7) with its reason, every `authority: none` resolution (§6.3) for the human maintainer to confirm is not a stale-lookup-table symptom, and summary counts (documents discovered, entries generated, entries excluded, by reason). This report is what a human reviewer reads before committing a regenerated `INDEX.yaml` — the diff shows *what changed*, the report shows *what the generator could not do and why*. This specification requires the report exist and requires its contents; it does not prescribe its format (text to stdout, a companion file, structured output) — that is an implementation choice under §12.

### 9.3 Future CI behavior (conceptual only)

Once implemented, a natural future step is running the generator in CI on every change to a source document, failing the check if the committed `INDEX.yaml` does not match what a fresh run produces — catching the case where a document changed but `INDEX.yaml` was not regenerated before commit. This specification names that as the conceptual shape of future automation and explicitly does not design it: no CI platform, no workflow file, no trigger conditions. See §12.

---

## 10. Error Philosophy

### 10.1 When generation should abort entirely

Only for the hard-failure conditions enumerated in §7.9: duplicate ids, duplicate paths, and invalid/ambiguous authority resolution. These share a common property — each represents a state where the generator cannot produce *any* trustworthy output, not merely an incomplete one. A duplicate id doesn't just affect the two colliding entries; it makes the entire catalog's lookup semantics unreliable, because a consumer cannot know in advance whether the id it queries is one of the ambiguous ones. The same reasoning applies to authority ambiguity, given §6's opening point about how consequential that field is.

### 10.2 When generation should continue

For every other validation failure — every soft failure in §7.9. The guiding test is: does this specific failure's blast radius stay contained to the document(s) it directly concerns, without corrupting the meaning of any other entry or the catalog's structural guarantees (§7.1's uniqueness, §7.2's path integrity)? If yes, exclude and report; do not abort. A repository with 68 documents and 40 catalog-ready entries is more useful, and more honest, than a repository with zero entries because one document has malformed YAML.

### 10.3 What constitutes repository corruption

Distinct from a validation failure: a condition where the generator's own inputs (§3) are not merely incomplete but structurally contradictory in a way no amount of soft-failure exclusion can route around — for example, the structured authority lookup (§3.4) itself failing to parse, or the repository walk (§4.1) encountering a filesystem-level error (a file it cannot read at all, a symlink cycle). These are treated as hard failures by extension of §10.1's test: they don't just make one entry untrustworthy, they make the generator's own operation unreliable. The correct response is the same as any hard failure — abort before writing anything, surface the condition clearly, and do not attempt automatic recovery (e.g., silently skipping the unreadable file) — because an automatic recovery here would be exactly the kind of silent inference §2 prohibits, applied to the generator's own inputs instead of to document content.

---

## 11. Future Extensions (Non-Normative)

Everything in this section is explicitly **non-normative** — named to establish that this specification's design does not foreclose them, not to specify them. None of the following is authorized by this document, and none should be treated as implied scope for the generator this specification describes:

- **Automatic graph generation** — rendering `related_documents`/`depends_on`/`implemented_by` as an actual dependency graph (e.g., for visualization), once those fields carry real generated data rather than schema-stage examples.
- **Dependency visualization** — a human-facing view of the same graph, potentially superseding or supplementing `SYSTEM_MAP.md`'s hand-authored architectural diagram.
- **AI retrieval optimization** — embeddings, vector search, or other retrieval mechanisms layered on top of (not replacing) the structured catalog, revisiting the "database vs. generated file" evaluation DEC-011's Option C already declined at current repository scale, should scale change enough to warrant reopening it.
- **Search acceleration** — any indexing structure built from `INDEX.yaml`'s output to make queries faster than a linear scan of ~70-100 entries currently requires, which is not yet a performance problem at this repository's scale.

Any of these, if pursued, requires its own CANON §16 decision, the same as every other extension to this architecture so far.

---

## 12. Out of Scope

This specification defines architecture only. It explicitly does not define, and no future implementation should treat this document as having decided:

- **Implementation language.** Nothing here requires or precludes any specific programming language.
- **Parser library.** YAML/Markdown/frontmatter parsing library choice is an implementation detail, constrained only by this specification's determinism and byte-stability requirements (§2, §8), not by a named library.
- **CI platform.** §9.3 names the conceptual shape of future CI integration; it does not choose one.
- **GitHub Actions**, or any other specific CI/CD system.
- **Embeddings.** Named only as a non-normative future extension (§11), not designed here.
- **Vector databases.** Same as embeddings — DEC-011 Option C already declined a database-backed architecture at current scale; this specification does not reopen that question.
- **Search engine.** Any full-text or semantic search layer is out of scope; `INDEX.yaml`'s structured fields (`topics`, `keywords`) support simple exact/fuzzy lookup per the existing schema's own description, not a search engine.
- **Placement of the structured authority lookup (§3.4)** between "internal generator configuration" and "a section of `REPOSITORY_MAP.md`" — named in §3.4 as an open placement decision, not resolved here.
- **The two open questions in §5.6.1 (`canonical`) and §5.13.1 (`status`)** — both require a follow-up decision before the generator can populate those fields for documents lacking a current source.
- **Timeline or authorization for implementation.** This specification being complete does not itself authorize writing the generator — per §0, that requires a separate decision.

---

## 13. Design Review

This section records the review performed after the first draft of this specification, per the review requirement that produced this document. It identifies ambiguities, missing decisions, and hidden assumptions found in that draft, and states how each was resolved — either by revising the section above, or by converting it into an explicit open question rather than leaving it as an implicit gap.

### 13.1 Ambiguities found and resolved in this revision

- **`canonical` had no source.** The first draft's §5.6 initially described `canonical` as "generated" without naming a source field, which is a contradiction of §2's single-source-of-truth principle — a field cannot be generated from nothing. Resolved by adding §5.6.1, converting the gap into an explicit two-option open question with a defined interim behavior (exclude and report, rather than emit under an unratified rule).
- **`status` required-ness conflicted with observed frontmatter coverage.** The existing schema marks `status` `required: true`, but not all documents carry a frontmatter field that maps to it cleanly. An early draft implicitly assumed every document would have one. Resolved by adding §5.13.1 and by §7.6's explicit soft-failure classification for missing required fields at document granularity — rather than a run-wide hard failure, which would have made the generator unable to produce output at all given current frontmatter coverage.
- **Authority lookup table placement was assumed to be "obviously" internal to the generator.** On review, `REPOSITORY_MAP.md` is an equally plausible home and DEC-011's own text leaves this open explicitly ("puede vivir como configuración interna del generador o en REPOSITORY_MAP.md"). Resolved by naming both candidates in §3.4 and listing the choice explicitly in §12 as undecided, rather than silently picking one in the body text.

### 13.2 Missing decisions identified (converted to explicit open questions)

- Source of `canonical` (§5.6.1).
- Source of `status` for documents without a resolvable value (§5.13.1).
- Placement of the structured authority lookup table (§3.4, §12).

Each of these blocks full population of at least one required or near-universal field. This specification's position is that none of the three blocks *starting* implementation — a generator built to this spec can run today, produce a partial catalog, and report the gaps honestly (§9.2) — but all three should be resolved by explicit follow-up decisions before a claim is made that generation is "complete" for the repository.

### 13.3 Hidden assumptions surfaced

- **The frontmatter schema itself is not fully consistent across the repository today** (§5.5, §7.6, §5.13.1 all touch this from different angles: some documents use the `00_project`-tier frontmatter convention — `document_id`, `version`, `status`, `authority`, `owner` — and others use the domain-document convention — `category`, `load_priority`, `confidence`, `primary_sources`, `related_documents` — with only `title` and `last_reviewed` reliably present across both). An earlier draft implicitly assumed one uniform frontmatter shape. This specification does not resolve that inconsistency (resolving it would be frontmatter migration, out of scope per DEC-011) — it instead makes the generator's behavior in the face of that inconsistency explicit and non-silent (§7.6, §7.9) rather than assuming it away.
- **"Deterministic" was initially stated without specifying tie-breaking rules.** §8's first draft specified sorting by `id` without addressing list-valued fields or key order within an entry. Both were added in this revision because an implementation could otherwise satisfy "sorted by id" while still producing non-byte-stable output via internal list or key ordering — a gap between the letter and the intent of §2's stability principle.
- **The relationship between `related_documents` (§3.6, a frontmatter field) and in-body references (§3.5, prose citations) was treated as a single input in the first draft.** They are related but distinct — a document can have one without the other, and `CROSS_REFERENCE_STANDARD.md` §4 already anticipates this asymmetry for `INDEX.yaml`-only relationships like `implemented_by`. Split into separate subsections (§3.5, §3.6) in this revision so their distinct authority and format are not conflated.

---

## 14. Versioning and Compatibility

This section exists because every prior section describes a generator that produces `INDEX.yaml` for a single point in time. Once other tooling — future AI agents, a future CI check (§9.3), a future implementation of this specification itself — begins depending on `INDEX.yaml`'s shape, that shape must be able to change without silently breaking every consumer built against the version that existed when they were written. This section defines how change is identified, communicated, and survived. As with every other section of this specification, it defines rules a future implementation must follow; it does not itself implement anything, and it does not authorize building the generator, CI, or any versioning tooling — that remains gated by DEC-011 and any follow-on decision, per §0.

### 14.1 Schema Version

`schema_version` identifies the shape of the schema block (§5.0) — its field set, required/optional flags, and controlled vocabularies — not the content of any individual entry, and not the generator implementation that produced a given file. Two `INDEX.yaml` files with identical `schema_version` values are structurally interchangeable by any consumer that understands that version, regardless of which repository state or which generator run produced them.

`schema_version` lives as a top-level key in `INDEX.yaml` itself, exactly as it already does today (`schema_version: "1.0"`), and is mirrored by this specification's own `version` frontmatter field — the two are declared as two distinct things that change together, not one field duplicated: this specification's version tracks the design document, `INDEX.yaml`'s `schema_version` tracks the artifact the design document describes. When this specification's §5 (Field Generation) or §8 (Deterministic Ordering) changes in a way covered by §14.3 below, both are expected to move together.

`schema_version` changes only when the schema itself changes — a field added, removed, or made required/optional differently; a controlled-vocabulary value added, removed, or redefined; a change to field semantics (§14.6); or a change to the ordering guarantees in §8. It does **not** change when documents are added, removed, or updated in the repository, and it does not change between generator runs that produce different content within the same shape. Regenerating `INDEX.yaml` after an ordinary documentation edit must never, by itself, be a reason to bump `schema_version`.

### 14.2 Generator Version

`generator_version` identifies the specific implementation that produced a given `INDEX.yaml` — distinct from `schema_version`, because a generator can change (bug fixes, internal refactors, performance work) without the shape it emits changing at all. This specification requires that generated output be able to record which generator version produced it (the exact mechanism — an emitted field, a report artifact per §9.2, or another means — is an implementation detail deferred to §12), so that a discrepancy between two supposedly-identical runs can be traced to "the generator changed" versus "the repository changed" versus "the schema changed."

The relationship between the two versions is one of declared compatibility, not equivalence: a generator declares which `schema_version` (or range of `schema_version`s, per §14.3) it is built to emit. A single `schema_version` may be produced correctly by many successive `generator_version`s over time, as the generator is fixed and improved without its output shape changing. A single `generator_version`, at any point in time, targets exactly one `schema_version` as current, and may additionally declare support for emitting one or more older `schema_version`s under the compatibility rules below — but it must never emit a file whose declared `schema_version` does not match the shape it actually produced. A generator asked to target a `schema_version` outside its declared support must refuse (fail closed, consistent with §2 and §7) rather than emit a best-effort approximation.

### 14.3 Backward Compatibility

This specification adopts a two-part `MAJOR.MINOR` versioning scheme for `schema_version`, matching the shape already in use today (`"1.0"`). `MAJOR` increments only for breaking changes; `MINOR` increments only for non-breaking ones. This mirrors, at the schema level, the same fail-closed, no-silent-inference discipline §2 already requires of the generator itself: a version number is a claim a consumer is entitled to rely on, not a suggestion.

**A breaking (`MAJOR`) change is any change that could cause a correct existing consumer's assumptions to become wrong**, including but not limited to: removing a field (required or optional); changing a field's type or shape; removing or redefining the meaning of an existing controlled-vocabulary value already in use; changing a field's required-ness in **either** direction (making a required field optional breaks a consumer that assumed the field is always present; making an optional field required breaks every existing entry that omitted it, per §14.6's note on this asymmetry); changing the sort order or fixed key order defined in §8; or changing the meaning of an existing field without changing its name or type (a silent semantic change is still breaking, arguably more dangerously than a structural one, because no schema-level check would catch it).

**A non-breaking (`MINOR`) change is any change a correct existing consumer can safely ignore**, including: adding a new optional field; adding a new controlled-vocabulary value without altering the meaning of existing ones; adding a new document category or authority-lookup entry (§3.4) that does not reclassify any existing document; and clarifying documentation or description text (§5.0's schema block itself) without changing validated behavior.

**Older consumers (readers) encountering a newer `schema_version`:** must ignore fields they do not recognize rather than treat their presence as malformed input, and must not treat an unrecognized `MINOR` increment as a fatal condition — only a `MAJOR` increment they were not built to understand should cause a reader to decline to trust the file rather than risk silently misinterpreting it. This mirrors §2's fail-closed principle applied to the reading side rather than the writing side: a consumer that cannot determine what an unfamiliar `MAJOR` version means should say so, not guess.

**Newer generators (writers) asked to target an older `schema_version`:** may only do so if that version is within the generator's declared supported range (§14.2). Emitting output for an unsupported older version — one whose shape the generator no longer knows how to faithfully reproduce — is a hard failure (consistent with §7's classification of consequential ambiguity), not a best-effort downgrade.

### 14.4 Migration Policy

A migration document is required for every `MAJOR` (breaking) `schema_version` change, describing what changed and how an existing consumer or an existing `INDEX.yaml` adapts. This is not a new category of document invented here — it is the same requirement CANON §16's decision flow already imposes on any architectural change, applied specifically to the case where the change is a schema break: the decision that authorizes the break is the migration document, or names one.

**Automatic migration is acceptable** only where a deterministic, lossless transformation from the old shape to the new shape exists from repository state alone — for example, a field rename with an unambiguous one-to-one mapping. In such cases the generator itself, once re-run, produces a fully compliant new-schema `INDEX.yaml` with no manual data entry required beyond the decision authorizing the change.

**Manual migration is required** whenever the transformation is lossy, ambiguous, or depends on source data that does not yet exist in repository frontmatter — the same condition this specification already names explicitly for `canonical` (§5.6.1) and `status` (§5.13.1): if a future breaking change introduced a new required field with no derivable source, the generator cannot invent the missing values, and someone must author them at the source before the new schema version can be populated. A breaking change that would require manual migration should be recognized as such at decision time, not discovered after the fact when generation starts failing closed for every affected document.

### 14.5 Deprecation Policy

A field or controlled-vocabulary value is deprecated by being marked as such in the schema block (§5.0) while remaining fully functional — still validated, still emitted — for at least one full `MINOR`-version cycle before any `MAJOR` version is permitted to remove it. Deprecation and removal are never the same change: announcing that something is deprecated is non-breaking (§14.3); removing it is breaking and requires its own subsequent, separate decision.

This specification recommends against maintaining multiple `schema_version`s in parallel indefinitely. Consistent with the single-source-of-truth discipline that governs every other part of this architecture (§2), exactly one `schema_version` is current and authoritative at a time; deprecation exists to give consumers advance notice before a breaking removal, not to obligate the generator to support several incompatible shapes simultaneously forever. A generator's declared support for older versions (§14.2, §14.3) is a bridge during a transition, not a permanent commitment.

Removal of a deprecated field or value is permitted only in a `MAJOR` version, only after its warning period has elapsed, and only through its own CANON §16 decision — the same pattern DEC-011 already established for every other step of this architecture.

### 14.6 Stability Guarantees

The following are intended to remain stable across ordinary, non-breaking evolution of this architecture — they are the properties a consumer should be able to build against without expecting routine change:

- **Document ids (§5.1).** The *policy* that an id, once assigned, never changes when a document's title or path changes is a permanent guarantee, independent of which id format (§7 of `DECISIONS.md` DEC-011's evidence names `DOC-XXXX` versus kebab-case as still unresolved) is eventually chosen. Once a format is chosen, the format itself becomes part of this stability guarantee — but the permanence property is stable now, before that choice is made.
- **The authority model.** That `authority` mirrors CANON §14 and is never independently assigned (§2, §6) is an architectural guarantee, not an implementation convenience. It cannot change without also reversing CANON §14's own precedence model — which would be a CANON-level decision, several tiers above anything this specification or a schema-version bump could authorize on its own.
- **Field semantics.** Once a field's meaning is fixed — `depends_on` meaning asymmetric, validity-contingent dependency, not general relatedness, for example — that meaning does not change without a `MAJOR` version bump, even if the field's name, type, and required-ness all stay the same. A silent meaning change is a breaking change (§14.3) regardless of whether anything else about the field's declaration changed.
- **Ordering guarantees (§8).** The sort-by-id rule and the fixed key order within an entry are guarantees a consumer may rely on for diffing and reproducibility; either changing is breaking (§14.3), because both exist specifically so that a diff is a true signal (§8's own stated reason for existing).

### 14.7 Future Evolution

New fields are always introduced as additive and optional, never as required from the moment they appear — a field cannot be `required: true` on introduction, because that would instantly invalidate every existing entry that has not yet been backfilled with a source for it. This is the same treatment §5.5 and §5.13 already give `category` and `status` today: introduced as the intended shape, populated as source coverage allows, promoted to required only in a later, separate change once coverage is actually complete — never before. A new controlled-vocabulary value can be added non-breakingly at any time; an existing one is never silently redefined to mean something else, since that would be a semantic break indistinguishable, from a consumer's point of view, from the field being replaced outright (§14.3, §14.6).

---

*This document is reviewed when the future generator's design needs to change, or when a follow-up decision resolves one of §12's open items — at that point, the resolution is recorded here (or in the follow-up decision itself, referenced from here) before implementation proceeds. It is not reviewed on the same cadence as operational documents.*
