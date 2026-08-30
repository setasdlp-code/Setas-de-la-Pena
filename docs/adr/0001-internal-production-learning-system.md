# ADR-0001: Setas OS is an internal production and learning system, not a farm SaaS

Status: Accepted
Date: 2026-08-29 (recorded 2026-08-30)

## Context

Setas OS could plausibly grow into a multi-tenant farm-management product. Choosing
that path changes almost every design decision: tenancy, billing, onboarding, public
APIs, and generic feature coverage over farm-specific depth.

## Decision

Setas OS is an internal production and learning system for Setas de la Peña. The
primary value loop is:

`ingredient lot → recipe version → production batch → room cycle → telemetry/events →
flushes → EB/contamination/cost → evidence → Perito context`

Billing, tenant administration, public APIs, customer onboarding, and generic
farm-management features are deliberately deprioritized.

## Consequences

- Depth on this farm's actual loop beats breadth of features.
- Data models may assume a single organization.
- A future multi-tenant migration is a rewrite of assumptions, not an increment.

## Source

`field-os-simulador/setas-os/PRODUCTION_LEARNING_LOOP_V1.md`, "Product decision" and
"Explicit non-goals".
