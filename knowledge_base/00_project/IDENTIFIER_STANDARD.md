---
title: Identifier Standard
document_id: STD-001
version: 1.2
status: canonical
authority: technical_standard
load_priority: always
owner: Setas de la Peña
last_reviewed: 2026-07-17
---

# Identifier Standard

## 1. Purpose

This document defines the mandatory identification system for all persistent objects in the Setas de la Peña Knowledge System. It establishes the format, registry, governance rules, and traceability requirements that apply across biological, operational, and knowledge domains.

---

## 2. Scope

Every persistent object in this project receives a unique, permanent identifier. Temporary field observations that are not promoted to formal records are exempt.

Persistent objects include, without limitation: biological materials, laboratory records, production batches, harvests, equipment, sensors, raw materials, suppliers, experiments, observations, lessons learned, decisions, standard operating procedures, and repository documents.

---

## 3. Design Principles

| Principle | Definition |
|-----------|------------|
| Globally unique | No two objects share an identifier, ever. |
| Human readable | Identifiers can be read, spoken, and typed without ambiguity. |
| Stable | An identifier does not change after assignment. |
| Immutable | An identifier is never modified, corrected, or reformatted. |
| Concise | Identifiers are short enough for manual entry and physical labeling. |
| Scalable | The format supports growth without structural revision. |
| Location-independent | Physical location is not encoded in the identifier. |
| Date-independent | Dates are not encoded in the identifier. |
| Context-free | Species names, operator names, and equipment names are not encoded in the identifier. |
| Non-recyclable | An identifier retired with a deprecated object is never reassigned. |
| Single owner | Every identifier has exactly one owning record. |

---

## 4. Identifier Format

### 4.1 General Format

```
PREFIX-XXXX
```

Where:

- `PREFIX` is a registered alphabetic code (see Section 5).
- `XXXX` is a zero-padded sequential integer, minimum four digits.

### 4.2 Rules

- Sequential numbers begin at `0001` for each prefix and increment by one.
- Numbers do not reset on any calendar boundary.
- No dates, locations, species names, strain names, operator names, or equipment names are embedded in the identifier.
- All metadata belongs in the associated record, not in the identifier itself.
- Each identifier has exactly one owning record. No identifier may be claimed by more than one record.

### 4.3 Examples of valid identifiers

```
MC-0001
BL-0058
EXP-0003
SOP-0012
EQ-0007
```

---

## 5. Identifier Registry

The following prefixes are officially registered. All prefixes are reserved exclusively for their designated object type.

### 5.1 Biological Material

| Prefix | Object Type |
|--------|-------------|
| MC | Master Culture |
| WC | Working Culture |
| AG | Agar Plate |
| LC | Liquid Culture |
| GS | Grain Spawn |
| SB | Bulk Substrate Batch |
| BL | Fruiting Block |
| SP | Original Specimen |

### 5.2 Production & Commercial

| Prefix | Object Type |
|--------|-------------|
| BT | Production Batch |
| HV | Harvest |
| PK | Packaging Lot |
| CB | Customer Batch |
| QR | Quality Record |

### 5.3 Knowledge Records

| Prefix | Object Type |
|--------|-------------|
| EXP | Experiment |
| OBS | Observation |
| LL | Lesson Learned |
| DEC | Decision |
| SOP | Standard Operating Procedure |
| DOC | Repository Document |
| STD | Technical Standard |
| TMP | Operational Template |
| WF | AI Workflow |
| DOR | Daily Operational Review |
| AIR | Daily AI Review |
| QST | Open Question |

### 5.4 Infrastructure & Supply

| Prefix | Object Type |
|--------|-------------|
| EQ | Equipment |
| SNS | Sensor |
| RM | Raw Material |
| SUP | Supplier |
| ENV | Growing Environment (room, tent, chamber) |
| INC | Operational Incident |

### 5.5 Future Prefixes

New prefixes may be added by appending an entry to this registry. Adding a prefix does not require a version revision of this standard, provided the addition does not alter any existing prefix definition. All new prefixes must be registered before use.

---

## 6. Parent-Child Relationships

### 6.1 Principle

Every child object references the identifier of its direct parent. This reference is recorded in the child's record metadata. The parent identifier is not encoded in the child's identifier.

### 6.2 Traceability Chain

A complete chain from biological origin to commercial delivery is expressed as a sequence of parent-child references:

```
MC-0004
  └─ WC-0012
       └─ AG-0048
            └─ LC-0007
                 └─ GS-0018
                      └─ SB-0032
                           └─ BL-0141
                                └─ HV-0026
                                     └─ CB-0009
```

### 6.3 Multiple Children

One parent may produce multiple children. Each child carries the same parent reference. The parent record does not enumerate its children; that relationship is resolved by querying child records.

---

## 7. Document References

### 7.1 Citation Format

When referencing an identifier within any document, use the identifier exactly as assigned:

```
See BL-0141 for block parameters.
Derived from MC-0004.
Authorized by DEC-0007.
```

### 7.2 Prohibited Practices

- Do not rename, abbreviate, or reformat a historical identifier.
- Do not recycle an identifier from a deprecated or destroyed object.
- Do not create informal aliases or shortened forms of identifiers in official records.

---

## 8. Biological Traceability

### 8.1 Lineage Requirements

Every production batch must be traceable, without interruption, to its biological origin. The complete lineage is:

```
Original Specimen (SP)
  └─ Master Culture (MC)
       └─ Working Culture (WC)
            └─ Agar Plate (AG) — optional intermediate
                 └─ Liquid Culture (LC) — optional intermediate
                      └─ Grain Spawn (GS)
                           └─ Bulk Substrate Batch (SB)
                                └─ Fruiting Block (BL)
                                     └─ Harvest (HV)
                                          └─ Packaging Lot (PK)
                                               └─ Customer Batch (CB)
```

Intermediate steps (AG, LC) are optional depending on the production route chosen. When omitted, the child references the nearest valid parent. No step in the registered chain may be skipped without a parent reference to the preceding step.

### 8.2 Traceability Breaks

A traceability break occurs when a child record does not reference a valid parent identifier. Traceability breaks must be documented and investigated. Material with an unresolvable lineage must be quarantined and flagged.

### 8.3 Genetic Identity

Species and strain information is stored as metadata in the Master Culture record (MC), not in the identifier. All downstream objects inherit genetic identity through the parent-child chain.

---

## 9. Operational Traceability

### 9.1 Scope

Operational traceability links physical infrastructure, personnel actions, and production outcomes.

### 9.2 Required Relationships

| Child Object | Required Parent Reference |
|---|---|
| Fruiting Block (BL) | Bulk Substrate Batch (SB) |
| Production Batch (BT) | Fruiting Block (BL) |
| Harvest (HV) | Production Batch (BT) |
| Packaging Lot (PK) | Harvest (HV) |
| Customer Batch (CB) | Packaging Lot (PK) |
| Quality Record (QR) | Production Batch (BT) or Harvest (HV) |
| Experiment (EXP) | Equipment (EQ), Substrate Batch (SB), or Growing Environment (ENV) as applicable |
| Observation (OBS) | Equipment (EQ), Fruiting Block (BL), or Growing Environment (ENV) as applicable |
| Sensor reading series | Sensor (SNS) and Equipment (EQ) |
| Lesson Learned (LL) | Observation (OBS) or Experiment (EXP) |
| Decision (DEC) | Lesson Learned (LL) or Experiment (EXP) |
| SOP revision | Authorizing Decision (DEC) |
| Sensor (SNS) | Equipment (EQ) or Growing Environment (ENV) |

### 9.3 Operator Attribution

Operator records are associated with objects through record metadata, not through the identifier structure.

---

## 10. Knowledge Traceability

### 10.1 Knowledge Chain

Knowledge generated in this system follows a defined progression. Identifiers connect each stage:

```
Observation (OBS)
  └─ Experiment (EXP)
       └─ Lesson Learned (LL)
            └─ Decision (DEC)
                 └─ SOP
                      └─ Knowledge Base (DOC)
```

### 10.2 Cross-Domain Links

An identifier from any domain may be referenced in a record from any other domain. Links are expressed in record metadata. A single observation may link to multiple experiments; a single decision may authorize multiple SOPs.

### 10.3 Retroactive Linkage

When a historical record is identified as the origin of a current object, the parent reference is added to the child record. Historical identifiers are not modified.

---

## 11. Identifier Governance

### 11.1 Permanence

Once assigned, an identifier is permanent. It survives:

- Document revisions
- File system reorganization
- Repository restructuring
- Software platform migrations
- Object deprecation or destruction

### 11.2 Immutability

An identifier is never modified, corrected, abbreviated, or reformatted after assignment. This applies regardless of typographic errors in the prefix, errors in sequencing, or later changes to naming conventions.

### 11.3 Non-Reassignment

An identifier is never reassigned to a different object, regardless of the status of the original object. Once an identifier is assigned to one object, it belongs to that object in perpetuity.

### 11.4 Non-Encoding Requirement

Identifiers never encode dates, locations, species, strains, operator names, equipment names, or any other attribute that may change over the lifetime of the object. All such attributes are stored exclusively in the owning record.

### 11.5 Deprecation

When an object is deprecated, destroyed, or superseded, its identifier remains in the registry with a status of `deprecated`. The identifier is not removed from the registry. References to deprecated identifiers in other records are preserved.

### 11.6 Authority

The identifier registry (Section 5) is the sole authoritative source for valid prefixes. Identifiers using unregistered prefixes are invalid.

### 11.7 Single Ownership

Each identifier has exactly one owning record. The owning record is the primary source of truth for that object. No two records may claim ownership of the same identifier.

---

## 12. Future Compatibility

### 12.1 Design Intent

The identifier format defined in this standard is designed to remain valid and unmodified as the project adopts additional technologies. The format is compatible with, but does not depend on:

- Relational and document databases
- QR codes and barcodes applied to physical objects
- RFID tags on equipment and packaging
- IoT sensor networks
- Operational dashboards
- Automation and scripting systems
- ERP and inventory management platforms
- Laboratory Information Management Systems (LIMS)
- Manufacturing Execution Systems (MES)
- Digital twin platforms

### 12.2 Stability Guarantee

Adoption of any of the above technologies does not require modification of assigned identifiers. Systems that interface with this repository must accept identifiers in the `PREFIX-XXXX` format without transformation.

---

## 13. Digital Twin Readiness

A digital twin is a persistent virtual representation of a physical or conceptual object that reflects its current and historical state.

The identifier system defined in this standard is structurally compatible with digital twin architectures. Because every persistent object receives a unique, stable, and immutable identifier at the point of creation, that identifier can serve as the permanent anchor for a corresponding digital representation — regardless of the platform that hosts it.

Biological objects (specimens, cultures, blocks, harvests), operational objects (equipment, environments, sensors), and knowledge objects (experiments, decisions, SOPs) can each be represented as discrete entities in a digital twin system, linked by the same parent-child relationships defined in this standard.

The identifier does not change when a digital twin is created, updated, or migrated. The twin references the identifier; the identifier does not reference the twin.

This property ensures that physical records, repository documents, and digital representations remain permanently synchronized through a single, shared identification key.

---

## 14. Examples

### 14.1 Complete Biological Lifecycle

```
SP-0001          — Original specimen collected in the field
  └─ MC-0003     — Master culture isolated from SP-0001
       └─ AG-0017 — Agar plate expansion from MC-0003
            └─ GS-0009 — Grain spawn inoculated from AG-0017
                 └─ SB-0012 — Substrate batch prepared from GS-0009
                      └─ BL-0058 — Fruiting block from SB-0012
                           └─ BT-0022 — Production batch from BL-0058
                                └─ HV-0011 — Harvest from BT-0022
                                     └─ PK-0006 — Packaging lot from HV-0011
                                          └─ CB-0004 — Customer batch from PK-0006
```

### 14.2 Knowledge Lifecycle

```
OBS-0031         — Field observation: pinning delay at low CO₂
  └─ EXP-0008   — Controlled experiment on CO₂ concentration effect
       └─ LL-0005 — Lesson learned: minimum CO₂ threshold confirmed
            └─ DEC-0003 — Decision to revise FAE cycle parameters
                 └─ SOP-0004 — Updated FAE protocol
                      └─ DOC-0011 — Knowledge base article incorporating SOP-0004
```

### 14.3 Operational Cross-Domain Reference

```
ENV-0002         — Production chamber (Martha tent, Tenjo)
  └─ EQ-0005    — T7 environmental controller assigned to ENV-0002
       └─ SNS-0007 — SHT3x sensor assigned to EQ-0005
            └─ OBS-0031 — Anomalous reading that initiated EXP-0008
                 └─ QR-0003 — Quality record flagging batch BT-0022
```

### 14.4 Quality Traceability

```
BL-0058 — Fruiting block (parent SB-0012, origin MC-0003)
  └─ BT-0022 — Production batch
       └─ QR-0003 — Quality record: contamination flag, batch quarantined
            └─ OBS-0031 — Linked observation
                 └─ LL-0005 — Resulting lesson learned
```

---

## 15. Closing Principle

One identifier. One object. One owner. One history. Unlimited future relationships.

Identifiers preserve relationships, not meaning.

The meaning of an object — its species, location, date, operator, outcome — is stored in the record associated with the identifier. If meaning changes, the record is updated. The identifier does not change.

An identifier is a permanent address. Records are the content at that address.

---

*This document is canonical. It supersedes any prior informal naming conventions used in this repository.*
