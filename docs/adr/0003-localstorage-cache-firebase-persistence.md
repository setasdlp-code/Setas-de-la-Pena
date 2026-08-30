# ADR-0003: localStorage is the operational cache, Firebase is persistence

Status: Accepted
Date: 2026-08-29 (recorded 2026-08-30)

## Context

Setas OS runs on phones in a growing room where connectivity is unreliable. The
production learning loop needs durable storage, but field work cannot block on a
network round trip.

## Decision

localStorage remains the immediate operational store. Firebase is the persistence
layer written behind it. `production-learning-bridge.js` writes to localStorage
synchronously, then calls the Firebase layer through `fireAndForget()`, which
swallows and logs sync errors rather than failing the local write.

The bridge loads from `firebase/db.js` after `window.SetasDB` is published, keeping
it independent of React navigation and component lifecycle.

## Consequences

- The UI stays responsive and usable offline.
- Firestore is eventually consistent with the device; a sync failure is a warning in
  the console, not a user-visible error.
- localStorage is the source of truth for the current session; reconciliation
  semantics across devices are not defined by this ADR.

## Source

`field-os-simulador/setas-os/production-learning-bridge.js` (`fireAndForget`, `KEYS`);
`PRODUCTION_LEARNING_LOOP_V1.md`, "Persistence vertical".
