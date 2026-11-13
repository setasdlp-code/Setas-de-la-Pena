# ADR-0004 — v1 Scope Expansion: Monitoring, Roles, Inventory

## Status
Accepted

## Context

ADR-0002 fixed Field OS v1 as an operational ledger and explicitly deferred advisory, monitoring, and procedure-enforcement capabilities until "the ledger is in reliable daily use and operational evidence is accumulating faithfully" (ADR-0002, Future Review). `FIELD_OS_MVP_ARCHITECTURE.md` §3 correspondingly excluded notifications/monitoring/alerting (pending sensor trust, `IN-3`), multi-user/roles (pending `GR-2`), and inventory/scheduling from MVP-1.

A Sesión de campo module was subsequently built (container registration, harvest, observation, quick-event capture, an append-only ledger, undo-via-compensating-event, and photo evidence) implementing WF-1/WF-3/WF-4/WF-10 exactly as MVP-1 specified — no conflict there. Alongside it, a design handoff (`design_handoff_setas_os`, 2026-07-27) supplied three additional surfaces that were built for parity with that handoff before this ADR existed: a climate-alert escalation banner (Cámaras), a client-side `ROLE_GATE` hiding modules by role, and a low-stock banner (Inventario/Bodega). Each of these depends on capability ADR-0002 and `FIELD_OS_MVP_ARCHITECTURE.md` §3 named as deferred, and two of them rest on assumptions still `Proposed` in `PRODUCT_ASSUMPTIONS.md`: sensor trustworthiness (`IN-3`, Low confidence) and multi-user expansion (`GR-2`, Low confidence). `PRODUCT_CANON.md` §6 and its Amendment Policy (§7) are explicit that such assumptions may constrain the product only *after validation*, not on the strength of a business decision alone — and neither `IN-3` nor `GR-2` has been validated.

The product-foundation owner has decided these three surfaces should become real v1 scope now, ahead of that validation, accepting the risk explicitly rather than waiting. This ADR is the record of that decision: it is a conscious risk acceptance, not a claim that `IN-3` or `GR-2` have reached `Validated`. It does not amend `PRODUCT_CANON.md` — no Canon principle (PC-01…PC-12) forbids these surfaces; the exclusion lived in ADR-0002's deferred-capability list and `FIELD_OS_MVP_ARCHITECTURE.md`'s scope, which is what this ADR reopens, per ADR-0002's own Future Review clause ("Reconsider this ADR once... at which point the priority question reopens as which deferred capability comes next").

## Decision

Field OS v1 scope is expanded to include, in addition to the ledger:

1. **Climate monitoring with alert escalation** (the "monitor" capability ADR-0002 named as a future option) — chambers are read (never commanded, per ADR-0003) and an unresolved deviation is escalated to a persistent banner after a fixed window.
2. **A role-scoped module view** (a first slice of the `GR-2` multi-user surface) — certain modules are hidden per role.
3. **Inventory/stock visibility** (Bodega) — a low-stock signal surfaces on Inicio.

Each is accepted **with its trust boundary explicitly unresolved**, not silently assumed solved:

- Climate monitoring reads sensor data whose trustworthiness (`IN-3`) remains `Proposed`, Low confidence. The alert/escalation surface is real; the *sensor data behind it* is not yet validated as trustworthy. `IN-3` is not reclassified by this ADR.
- The role-scoped view is **presentation-only**: it hides UI, it does not authorize or restrict any API call. `GR-2` (multi-user) remains `Proposed`, Low confidence. A real permissions model — server-side authorization tied to verified operator identity — is **not** in scope of this ADR and must not be assumed to exist because the UI has role-aware chrome.
- Inventory visibility reads a mocked stock source today; it is scoped in as a *surface*, not as a claim that inventory data is currently real or trustworthy.

## Consequences

**Positive consequences.** The three surfaces the design handoff already specified in detail can be treated as real product scope rather than an unresolved parity gap; `FIELD_OS_MVP_ARCHITECTURE.md` can be corrected to match what is actually built and endorsed, rather than silently diverging from its own governance.

**Tradeoffs.** Field OS v1 now includes a monitoring surface whose underlying sensor trust is unvalidated (`IN-3` Low confidence) and a role-aware surface with no server-side enforcement (`GR-2` Low confidence, and no authorization model exists regardless of `GR-2`'s status). Operators must not treat the escalation banner as a validated safety signal, or the role selector as an access control, until the follow-up work below lands. This ADR accepts that gap consciously rather than closing it.

**Operational implications.** `FIELD_OS_MVP_ARCHITECTURE.md` §2/§3 are amended to move these three capabilities from deferred to included, citing this ADR (see companion edit). `DATA_MODEL.md` and `MODULE_MAP.md` gain the entities/modules these capabilities require. `PRODUCT_ASSUMPTIONS.md`'s `IN-3` and `GR-2` entries gain a note recording this ADR as the reason implementation proceeded despite `Proposed` status — their `Status` field is **not** changed to `Validated`; that would misrepresent unvalidated reality (`PC-09`, `PC-10`).

**Required follow-up, tracked as open work, not covered by this ADR:**
- Server-side role/permission enforcement (today: presentation-only).
- Validation of `IN-3` (sensor accuracy/coverage) before the escalation banner is used as an operational safety signal.
- A real inventory data source, replacing the current mock.

## Alternatives Considered

**Wait for `IN-3`/`GR-2` validation before building.** This is what ADR-0002 and `PRODUCT_CANON` §6/§7 would ordinarily require. Rejected for this specific decision because the product-foundation owner chose to accept the risk explicitly now rather than block on validation with no fixed timeline — a legitimate owner call under the Amendment Policy's "who may adopt" clause, provided it is recorded honestly (this ADR) rather than papered over by silently reclassifying the assumptions.

**Amend `PRODUCT_CANON.md` directly.** Rejected: no Canon principle prohibits these capabilities; the deferral lived in ADR-0002 and `FIELD_OS_MVP_ARCHITECTURE.md`, which is the correct layer to reopen (per ADR-0002's own Future Review clause), leaving the Canon untouched and its §6 caution about `IN-3`/`GR-2` intact and still true.

**Reclassify `IN-3`/`GR-2` as `Validated`.** Rejected outright: no new evidence was produced; this would be a false governance record and would violate `PC-09`/`PC-10` on its face.

## Future Review

Reconsider this ADR's risk acceptance once `IN-3` and `GR-2` reach `Validated` or `Rejected` in `PRODUCT_ASSUMPTIONS.md` (converting an accepted risk into either a confirmed capability or a signal to roll it back), or once server-side role enforcement lands (converting the role surface from cosmetic to real). Reconsider sooner if the mocked climate or inventory data is shown to mislead operational decisions in practice.

---

*Date: 2026-07-27*
*Adopted by: product-foundation owner*
*Amends: ADR-0002 (deferred-capability list, via its own Future Review clause); FIELD_OS_MVP_ARCHITECTURE.md §2/§3 (companion edit)*
*Does not amend: PRODUCT_CANON.md (no principle conflicts); PRODUCT_ASSUMPTIONS.md status fields (IN-3, GR-2 remain Proposed)*
