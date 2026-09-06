# Mobile Field QR Action Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable field operators to scan QR codes on physical batches and execute state transitions (Inoculación → Incubación → Fructificación → Cosecha) with offline-first resilience, automatic sync when connectivity returns, and account-safe event recovery.

**Architecture:** 
QR scanner opens action sheet showing confirmed batch state + available transitions (validated by state machine). Operator confirmation creates immutable FieldEvent + QueueEntry, persisted atomically to IndexedDB with account-scoped reservation preventing concurrent edits. Background sync posts to Firestore Cloud Function, which validates all reads inside transaction (receipt check → batch read → revision verify → permissions → apply). Conflict releases reservation; operator refreshes and creates new event. Logout preserves events; re-login recovers them. Timestamp canonicalization ensures idempotency across retries.

**Tech Stack:** 
- React (simulador-app.jsx) for UI
- IndexedDB for local persistence
- Firestore + Cloud Functions for server acceptance
- SetasOSWorkflow for state machine validation
- Browser Geolocation/Camera APIs (QR scanner via browser)

**Spec:** 
`field-os-simulador/setas-os/docs/superpowers/specs/2026-09-05-mobile-field-qr-offline-design.md`

## Global Constraints

- **v1 scope:** batch_state_transition only; attachmentIds always empty (no photo capture)
- **Offline first:** all events queued locally before sync attempted
- **Atomicity:** local (IDB transaction: Event + QueueEntry + reservation) and server (Firestore: Event + batch state + receipt)
- **Idempotency:** stable persisted UUID + content normalization (ISO8601 ms precision, canonical field order)
- **Account safety:** operatorId derived from auth session; events isolated by accountId; logout preserves, re-login recovers
- **Conflict:** releases reservation atomically; operator must refresh + create new event with new eventId
- **State machine:** reuse SetasOSWorkflow.assertTransition(), validActions(); no custom transitions
- **Receipt:** embedded in FieldEvent document (not separate subcollection); required for idempotency proof

---

## File Structure

### New Files to Create

1. **`field-event-queue.js`** — IndexedDB schema, persistence, lifecycle
   - Manages ObjectStore: field_events, queue_entries, pending_batch_transitions, auth_receipts
   - `persistFieldEvent(event, queueEntry, accountId)` — atomic write
   - `releaseReservation(accountId, batchId)` — remove reservation
   - `queryPendingByStatus(status)`, `recoverEventsByAccount(accountId)` — recovery on login
   - `getReservation(accountId, batchId)` — check before confirm

2. **`field-events-model.js`** — Event validation, local caching, canonicalization
   - `createFieldEvent(batchId, from, to, operatorId, occurredAt)` — immutable event builder
   - `canonicalizeTimestamp(ts)` — ISO8601 → UTC → ms precision
   - `contentEquals(submitted, stored)` — idempotency comparison
   - `validateTransition(batch, from, to, operatorRole)` — state machine + permissions

3. **`offline-sync-engine.js`** — Sync loop, retry backoff, receipt reconciliation
   - `startSyncLoop(db, firebaseApp, accountId)` — begins polling/listener
   - `syncPendingEvents(accountId)` — batch sync of pending/retry_wait entries
   - `handleSyncSuccess(eventId, receipt)` — confirm + release reservation
   - `handleSyncConflict(eventId, currentRevision, currentState)` — set conflict status, release reservation
   - `handleSyncError(eventId, error)` — update retry_wait + backoff timer
   - Exponential backoff: 30s → 60s → 120s → 240s (capped at 1 hour)

4. **`field-action-sheet.jsx`** — QR action menu, state display, confirmation
   - `<FieldActionSheet batch={} onConfirm={} onDismiss={} />` component
   - Shows: "Current State: Incubation (confirmed) | Pending: Fruiting (Saved on device)"
   - Lists available actions via SetasOSWorkflow.validActions()
   - Confirm button triggers validation recheck + persistence
   - Handles: conflict alert ("refresh required"), permission error, offline state

5. **`qr-scanner-integration.jsx`** — QR scanner UI with two entry points
   - Global quick-scan button (always available)
   - In-batch-detail scanner (context-aware)
   - Camera permission handling + fallback manual code entry
   - Debounces rapid scans (pause after first accepted scan)
   - Resolves batch via SetasOSBatchCache (online: Firestore; offline: localStorage)

6. **`acceptFieldEvent.js`** (Cloud Function) — Server acceptance with transactional validation
   - Entry point: `POST /api/field-events`
   - All reads (receipt check, batch fetch, revision verify, permissions) inside `db.runTransaction()`
   - Returns `{ receipt: { eventId, acceptedAt, batchRevision } }` or error
   - Idempotency: same eventId + same content → original receipt; different content → error
   - Incomplete record: event exists without receipt → error

### Modified Files

- **`simulador-app.jsx`** — Add QR scanner button, action sheet, sync listener
- **`navigation-state.js`** — (no changes expected; routing already supports scanner dismissal)
- **`setas-os-workflow.js`** — (no changes; reuse existing)
- **`firebase/firestore.rules`** — Add rules for field-events collection (read: own operatorId, write: only Cloud Function)

### Test Files to Create

- `field-event-queue.test.js` — IDB persistence, atomic transactions, recovery
- `field-events-model.test.js` — Event creation, canonicalization, idempotency
- `offline-sync-engine.test.js` — Sync flow, conflict handling, backoff
- `field-action-sheet.test.js` — Component rendering, state transitions, error display
- `acceptFieldEvent.test.js` — Cloud Function acceptance, idempotency, conflicts

---

## Implementation Tasks

### Phase 1: Local Persistence & Event Model (Foundation)

#### Task 1: IndexedDB Schema & Persistence (field-event-queue.js)

**Files:**
- Create: `field-event-queue.js`
- Create: `field-event-queue.test.js`

**Interfaces:**
- Consumes: None (foundational)
- Produces:
  - `persistFieldEvent(event, queueEntry, accountId)` → Promise<void> (throws on IDB error)
  - `releaseReservation(accountId, batchId)` → Promise<void>
  - `queryPendingByStatus(status)` → Promise<Array<{eventId, queueEntry}>>
  - `recoverEventsByAccount(accountId)` → Promise<Array<{event, queueEntry}>>
  - `getReservation(accountId, batchId)` → Promise<{reservationId, eventId} | null>

- [ ] **Step 1: Write test for opening IndexedDB and creating schema**

Create `field-event-queue.test.js`:

```javascript
import { initializeQueue, persistFieldEvent } from './field-event-queue.js';

describe('FieldEventQueue', () => {
  let db;
  
  beforeEach(async () => {
    db = await initializeQueue('test-queue');
  });
  
  afterEach(async () => {
    db.close();
    indexedDB.deleteDatabase('test-queue');
  });
  
  it('should create ObjectStores on initialization', async () => {
    const stores = db.objectStoreNames;
    expect(stores).toContain('field_events');
    expect(stores).toContain('queue_entries');
    expect(stores).toContain('pending_batch_transitions');
    expect(stores).toContain('auth_receipts');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd field-os-simulador/setas-os
npm test -- field-event-queue.test.js 2>&1 | head -20
```

Expected: "Cannot find module './field-event-queue.js'"

- [ ] **Step 3: Implement minimal schema initialization**

Create `field-event-queue.js`:

```javascript
export async function initializeQueue(dbName = 'setas-field-events') {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // field_events: immutable event records
      if (!db.objectStoreNames.contains('field_events')) {
        db.createObjectStore('field_events', { keyPath: 'id' });
      }
      
      // queue_entries: mutable delivery state
      if (!db.objectStoreNames.contains('queue_entries')) {
        const qe = db.createObjectStore('queue_entries', { keyPath: 'eventId' });
        qe.createIndex('status', 'status');
        qe.createIndex('nextAttemptAt', 'nextAttemptAt');
      }
      
      // pending_batch_transitions: reservations (key: accountId:batchId)
      if (!db.objectStoreNames.contains('pending_batch_transitions')) {
        const pbt = db.createObjectStore('pending_batch_transitions', { keyPath: 'reservationId' });
        pbt.createIndex('accountBatch', ['accountId', 'batchId']);
      }
      
      // auth_receipts: cached server receipts
      if (!db.objectStoreNames.contains('auth_receipts')) {
        db.createObjectStore('auth_receipts', { keyPath: 'eventId' });
      }
    };
  });
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- field-event-queue.test.js 2>&1
```

Expected: PASS

- [ ] **Step 5: Add test for atomic persistence**

```javascript
it('should persist event, queue entry, and reservation atomically', async () => {
  const event = {
    id: 'evt_test_1',
    type: 'batch_state_transition',
    batchId: 'lote_123',
    payload: { from: 'incubation', to: 'fruiting' },
    operatorId: 'op_123',
  };
  const queueEntry = {
    eventId: 'evt_test_1',
    status: 'pending',
  };
  
  await persistFieldEvent(event, queueEntry, 'account_123');
  
  // Verify all three written
  const eventStore = db.transaction('field_events', 'readonly').objectStore('field_events');
  const storedEvent = await eventStore.get('evt_test_1');
  expect(storedEvent).toBeDefined();
  expect(storedEvent.id).toBe('evt_test_1');
});
```

- [ ] **Step 6: Implement persistFieldEvent**

```javascript
export async function persistFieldEvent(event, queueEntry, accountId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      ['field_events', 'queue_entries', 'pending_batch_transitions'],
      'readwrite'
    );
    
    const reservationId = `${accountId}:${event.batchId}`;
    
    // Check no existing reservation
    const existingRes = tx.objectStore('pending_batch_transitions').get(reservationId);
    existingRes.onsuccess = () => {
      if (existingRes.result) {
        reject(new Error('batch_already_has_pending_transition'));
        return;
      }
      
      // Write all three
      tx.objectStore('field_events').add(event);
      tx.objectStore('queue_entries').add(queueEntry);
      tx.objectStore('pending_batch_transitions').put({
        reservationId,
        accountId,
        batchId: event.batchId,
        eventId: event.id,
        reservedAt: new Date().toISOString(),
      });
    };
    
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
}
```

- [ ] **Step 7: Run full test suite for field-event-queue**

```bash
npm test -- field-event-queue.test.js 2>&1
```

Expected: All tests PASS

- [ ] **Step 8: Implement remaining queue functions (getReservation, releaseReservation, queryPendingByStatus, recoverEventsByAccount)**

Add to `field-event-queue.js`:

```javascript
export async function getReservation(db, accountId, batchId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_batch_transitions', 'readonly');
    const store = tx.objectStore('pending_batch_transitions');
    const index = store.index('accountBatch');
    const req = index.get([accountId, batchId]);
    
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function releaseReservation(db, accountId, batchId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_batch_transitions', 'readwrite');
    const store = tx.objectStore('pending_batch_transitions');
    const reservationId = `${accountId}:${batchId}`;
    const req = store.delete(reservationId);
    
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve();
  });
}

export async function queryPendingByStatus(db, status) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue_entries', 'readonly');
    const store = tx.objectStore('queue_entries');
    const index = store.index('status');
    const req = index.getAll(status);
    
    req.onsuccess = () => {
      const entries = req.result;
      const results = entries.map(qe => ({
        eventId: qe.eventId,
        queueEntry: qe,
      }));
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function recoverEventsByAccount(db, accountId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['field_events', 'queue_entries'], 'readonly');
    const qeStore = tx.objectStore('queue_entries');
    const eventStore = tx.objectStore('field_events');
    
    const allQE = qeStore.getAll();
    allQE.onsuccess = () => {
      const entries = allQE.result.filter(qe => {
        // Filter by account (operatorId stored in event)
        // This is a limitation: need to fetch event; better to store accountId in queueEntry
        return true; // TODO: refactor to store accountId in queueEntry
      });
      
      const results = [];
      for (const qe of entries) {
        const eventReq = eventStore.get(qe.eventId);
        eventReq.onsuccess = () => {
          results.push({
            event: eventReq.result,
            queueEntry: qe,
          });
        };
      }
      
      tx.oncomplete = () => resolve(results);
    };
    allQE.onerror = () => reject(allQE.error);
  });
}
```

- [ ] **Step 9: Add accountId to queueEntry schema (refactor)**

Update test and implementation to include `accountId` in queueEntry:

```javascript
// In persistFieldEvent
const queueEntry = {
  eventId: event.id,
  accountId,
  status: 'pending',
  // ...
};

// In recoverEventsByAccount
const accountEntries = allQE.result.filter(qe => qe.accountId === accountId);
```

- [ ] **Step 10: Run full tests, commit**

```bash
npm test -- field-event-queue.test.js
git add field-event-queue.js field-event-queue.test.js
git commit -m "feat: IndexedDB schema and persistence for field events

- field_events, queue_entries, pending_batch_transitions, auth_receipts stores
- persistFieldEvent: atomic write of event + queue entry + reservation
- releaseReservation: remove block after confirm/conflict/reject
- queryPendingByStatus: recover queued events for sync
- recoverEventsByAccount: recover all events for account (used on re-login)
- Cross-account isolation via accountId in pending_batch_transitions
- All persistence ops wrapped in IDB transactions"

---

#### Task 2: Field Event Model & Canonicalization (field-events-model.js)

**Files:**
- Create: `field-events-model.js`
- Create: `field-events-model.test.js`

**Interfaces:**
- Consumes: SetasOSWorkflow (assertTransition, validActions)
- Produces:
  - `createFieldEvent(batchId, from, to, operatorId, occurredAt)` → {id, type, batchId, expectedBatchRevision, occurredAt, operatorId, source, payload, attachmentIds, metadata}
  - `canonicalizeTimestamp(ts)` → ISO8601 (UTC, .SSSZ format) or throws
  - `contentEquals(submitted, stored)` → boolean (normalized comparison)
  - `validateTransition(batch, from, to, operatorRole)` → boolean or throws

- [ ] **Step 1: Write test for FieldEvent creation**

Create `field-events-model.test.js`:

```javascript
import { createFieldEvent, contentEquals, canonicalizeTimestamp } from './field-events-model.js';
import { v4 as uuidv4 } from 'uuid'; // Assume available

describe('FieldEventsModel', () => {
  it('should create immutable FieldEvent with stable UUID', () => {
    const event = createFieldEvent(
      'lote_123',
      'incubation',
      'fruiting',
      'op_123',
      '2026-09-06T14:30:00Z'
    );
    
    expect(event.id).toMatch(/^evt_/);
    expect(event.type).toBe('batch_state_transition');
    expect(event.batchId).toBe('lote_123');
    expect(event.attachmentIds).toEqual([]);
    expect(event.payload.from).toBe('incubation');
    expect(event.payload.to).toBe('fruiting');
  });
  
  it('should normalize timestamps: Z vs .000Z', () => {
    const ts1 = canonicalizeTimestamp('2026-09-06T14:30:00Z');
    const ts2 = canonicalizeTimestamp('2026-09-06T14:30:00.000Z');
    expect(ts1).toBe(ts2);
    expect(ts1).toMatch(/\.\d{3}Z$/);
  });
  
  it('should reject invalid timestamps', () => {
    expect(() => canonicalizeTimestamp('not-a-date')).toThrow('canonicalization_failed');
  });
  
  it('should compare events with content normalization', () => {
    const event1 = {
      id: 'evt_1',
      type: 'batch_state_transition',
      batchId: 'lote_123',
      expectedBatchRevision: 12,
      occurredAt: '2026-09-06T14:30:00Z',
      operatorId: 'op_123',
      source: 'mobile_qr',
      payload: { from: 'incubation', to: 'fruiting', reasonCode: null, notes: null },
      attachmentIds: [],
      metadata: {},
    };
    
    const event2 = {
      ...event1,
      occurredAt: '2026-09-06T14:30:00.000Z', // Different representation
    };
    
    expect(contentEquals(event1, event2)).toBe(true);
  });
  
  it('should detect content mismatch', () => {
    const event1 = { id: 'evt_1', payload: { to: 'fruiting' } };
    const event2 = { id: 'evt_1', payload: { to: 'maturation' } };
    expect(contentEquals(event1, event2)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, expect failures**

```bash
npm test -- field-events-model.test.js 2>&1 | head -30
```

Expected: "Cannot find module"

- [ ] **Step 3: Implement model functions**

Create `field-events-model.js`:

```javascript
import { v4 as uuidv4 } from 'uuid';

export function createFieldEvent(batchId, from, to, operatorId, occurredAt) {
  // Generate stable UUID once; persist before transmission
  const id = `evt_${uuidv4()}`;
  
  return Object.freeze({
    schemaVersion: 1,
    id,
    type: 'batch_state_transition',
    batchId,
    expectedBatchRevision: null, // Will be set by caller (from batch.revision)
    occurredAt: canonicalizeTimestamp(occurredAt),
    operatorId,
    source: 'mobile_qr',
    payload: {
      from,
      to,
      reasonCode: null,
      notes: null,
    },
    attachmentIds: [], // Always empty in v1
    metadata: {},
  });
}

export function canonicalizeTimestamp(ts) {
  if (!ts) return null;
  try {
    // Parse ISO8601: accept any valid format
    const date = new Date(ts);
    if (isNaN(date.getTime())) {
      throw new Error('invalid_timestamp');
    }
    // Return canonical: ISO string (UTC, ms precision)
    const iso = date.toISOString(); // Always YYYY-MM-DDTHH:mm:ss.SSSZ
    return iso;
  } catch (e) {
    throw new Error(`canonicalization_failed: invalid timestamp "${ts}": ${e.message}`);
  }
}

export function contentEquals(submitted, stored) {
  const normalizeTimestamp = (ts) => {
    if (!ts) return null;
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) throw new Error('invalid_timestamp');
      return date.toISOString();
    } catch (e) {
      throw new Error(`canonicalization_failed: ${e.message}`);
    }
  };
  
  const normalize = (obj) => {
    // Remove receipt (added by server, not part of event content)
    const eventOnly = { ...obj };
    delete eventOnly.receipt;
    
    // Canonical form: fields in order, timestamps normalized, metadata included
    const canonical = {
      id: eventOnly.id,
      schemaVersion: eventOnly.schemaVersion ?? 1,
      type: eventOnly.type,
      batchId: eventOnly.batchId,
      expectedBatchRevision: eventOnly.expectedBatchRevision,
      occurredAt: normalizeTimestamp(eventOnly.occurredAt),
      operatorId: eventOnly.operatorId,
      source: eventOnly.source,
      payload: eventOnly.payload,
      attachmentIds: eventOnly.attachmentIds ?? [],
      metadata: eventOnly.metadata ?? {},
    };
    return JSON.stringify(canonical);
  };
  
  return normalize(submitted) === normalize(stored);
}

export function validateTransition(batch, from, to, operatorRole = 'standard') {
  // Reuse SetasOSWorkflow
  const SetasOSWorkflow = global.SetasOSWorkflow || require('./setas-os-workflow.js');
  
  if (!SetasOSWorkflow.canTransition(from, to)) {
    throw new Error(`invalid_state_transition: ${from} → ${to}`);
  }
  
  // Validate operator can perform action
  const validActions = SetasOSWorkflow.validActions(batch.state, operatorRole);
  if (!validActions.includes(`advance_to_${to}`)) {
    throw new Error(`unauthorized_action: role ${operatorRole} cannot transition to ${to}`);
  }
  
  return true;
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- field-events-model.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add field-events-model.js field-events-model.test.js
git commit -m "feat: field event model with canonicalization

- createFieldEvent: immutable event with stable UUID
- canonicalizeTimestamp: ISO8601 → UTC → ms precision, validates format
- contentEquals: normalized comparison (field order, timestamp format, excludes receipt)
- validateTransition: state machine + permission checks via SetasOSWorkflow
- Prevents invalid transitions and unauthorized actions at creation time"```

---

# Phase 1 Audit Result (2026-09-06, lead)

Tasks 1–2 are **implemented and unit-tested (17/17 in Node)** but **not locally
validated end-to-end** and **not loadable by the application**. Seven defects
were found after the task reviews passed. They are remediated in Task 3; Tasks
1–2 are not reopened.

| ID | Severity | Defect | Evidence |
|----|----------|--------|----------|
| F1 | Blocking | Phase 1 files cannot load in the browser | VM sandbox: `require is not defined` / `module is not defined`. App uses classic `<script src>` via `firebase/auth-gate.js`; `build.js` only `transformSync`s JSX — no bundling |
| F2 | Blocking | Headline flow `inoculated → incubation` rejected for every role | `ACTIONS_BY_STATE.inoculated` lacks `advance_stage`; `DEFAULT_TRANSITIONS.inoculated` permits `incubation` |
| F3 | High | Role authorization is a no-op | `validActions` only filters `discard`; role `'banana'` yields `advance_stage:true`. Default `'standard'` is not a real role |
| F4 | High | `uuid` undeclared; resolves transitively via `@lhci/cli` devDependency | `grep '"uuid"' package.json` → absent |
| F5 | High | `auth_receipts` is dead schema — never written or read | grep: only created + asserted |
| F6 | Blocking | `releaseReservation` has no event guard; a stale response can release a newer event's reservation | Signature deletes unconditionally by `accountId:batchId` |
| F7 | Info | No QR decoder exists; `qr-mini.js` is a QR *generator* | `window.QRMini.matrix(text)` |

**Real state vocabulary** (from `setas-os-workflow.js` — use these, not Spanish labels):
`planned → mix_prepared → thermal_treatment → cooling → inoculated → incubation
→ maturation → induction → fruiting → resting → closed`; exceptions
`quarantine`, `discarded`, `failed`. Roles: `direccion`, `produccion`, `operario`.
UI labels map Inoculación=`inoculated`, Incubación=`incubation`,
Fructificación=`fruiting`, Cosecha=`harvest` action within `fruiting`.

## Mandatory Guarantees → Traceability

| # | Guarantee | Task | Acceptance test |
|---|-----------|------|-----------------|
| G1 | `attachmentIds` always `[]` in v1 | 4 | `contracts.test.js` rejects non-empty |
| G2 | Logout preserves pending work, isolated by account | 9 | `account-switch.test.js` |
| G3 | Event IDs stable across retries | 8 | `sync-engine.test.js` retry keeps id |
| G4 | Acceptance reads+writes inside server transaction | 5 | `accept-field-event.test.js` |
| G5 | Existing accepted event returns original receipt | 5 | replay returns identical receipt |
| G6 | Same ID + different content ⇒ rejected | 5 | `content_mismatch` |
| G7 | Confirmation, receipt persist, cache reconcile, reservation release are atomic + recoverable | 7 | `reconcile.test.js` crash injection |
| G8 | Delayed/duplicate response cannot release newer reservation or roll back revision | 3, 7 | `reconcile.test.js` stale guard |
| G9 | Conflict terminates old request; new request gets new eventId | 8, 11 | `conflict.test.js` |
| G10 | Scanning alone creates no transition | 10 | `qr-resolve.test.js` |
| G11 | UI distinguishes saved-locally from server-confirmed | 11 | `action-sheet.test.js` |

---

## Phase 2: Contract Remediation & Shared Contracts

### Task 3: Phase 1 Remediation (browser loading, role model, reservation guard)

**Observable outcome:** `field-event-queue.js` and `field-events-model.js` load
via a classic `<script>` tag and publish globals; `inoculated → incubation`
succeeds for an authorized role; a stale response cannot release a newer
reservation.

**Dependencies:** Tasks 1–2 (committed). Blocks every later task.

**Files to modify** (verified to exist):
- `field-event-queue.js`
- `field-events-model.js`
- `field-event-queue.test.js`
- `field-events-model.test.js`
- `package.json` (declare `uuid`)
- `firebase/auth-gate.js` (`PROTECTED_APP_SCRIPTS` list, line ~41)

**Contract:**
- Both modules adopt the repo's dual pattern, copied from `batch-traceability.js:11-24`:
  `const isNode = typeof module !== 'undefined' && module.exports;` … `if (isNode) module.exports = api; if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventQueue = api;`
  Globals: `SetasFieldEventQueue`, `SetasFieldEvents`.
- Replace `require('uuid')` with a local `generateEventId()` using
  `crypto.randomUUID()` when available, else a `crypto.getRandomValues` v4
  fallback. **Remove the `uuid` dependency entirely** — do not declare it.
  (Ruling: adding a bundler for one UUID is disproportionate; `crypto.randomUUID`
  is available in all target browsers and Node ≥19.)
- `validateTransition(batch, from, to, operatorRole)`:
  - Authorize on the **transition**, not on an action name. Permit when
    `canTransition(from, to)` **and** role is permitted for that transition class.
  - Transition classes: `advance` (forward in `NORMAL_STATES`), `exception`
    (`quarantine`/`failed`), `discard` (`discarded`).
  - Role matrix: `direccion` = all; `produccion` = `advance` + `exception`;
    `operario` = `advance` only. Unknown role ⇒ `unknown_role` error (**no
    silent fallback** — closes F3).
  - Default parameter removed; `operatorRole` is required.
- `releaseReservation(db, accountId, batchId, expectedEventId)` — deletes **only
  if** the stored reservation's `eventId === expectedEventId`; otherwise resolves
  without deleting and returns `false`. Returns `true` when released (closes F6).

**Invariants preserved:** event immutability; `attachmentIds === []`; canonical
timestamp format; atomic 3-store write in `persistFieldEvent`.

**Failure cases:** unknown role; `from !== batch.state`; transition not in
`DEFAULT_TRANSITIONS`; release with mismatched `expectedEventId`; missing
`crypto.randomUUID` (fallback path).

**Acceptance tests** (add to existing test files):
1. `inoculated → incubation` succeeds for `operario`, `produccion`, `direccion`.
2. `fruiting → discarded` succeeds for `direccion`, throws `unauthorized_action` for `operario`.
3. Unknown role `'banana'` throws `unknown_role` (not silently allowed).
4. `releaseReservation` with a mismatched `expectedEventId` returns `false` and the reservation still exists.
5. `releaseReservation` with the matching id returns `true` and the reservation is gone.
6. Both files load in a `vm.runInNewContext` sandbox exposing only `{window, indexedDB, crypto, console}` and publish their global.
7. `createFieldEvent` still returns a frozen object with `attachmentIds: []`.

**Validation commands:**
```bash
cd field-os-simulador/setas-os
node --test field-event-queue.test.js field-events-model.test.js
node -e "const vm=require('vm'),fs=require('fs');for(const f of ['field-event-queue.js','field-events-model.js']){const s={window:{},indexedDB:{},crypto,console};s.globalThis=s;vm.runInNewContext(fs.readFileSync(f,'utf8'),s,{filename:f});console.log(f,'OK',Object.keys(s).filter(k=>k.startsWith('Setas')))}"
```

**Completion criteria:** all tests pass; both sandbox loads print their global;
`grep uuid package.json` empty; both files listed in `PROTECTED_APP_SCRIPTS`.

**Owner:** implementer. **Independent review: REQUIRED** (AGENTS.md §39 —
schema/auth-adjacent change spanning two bounded areas).

---

### Task 4: Shared Contracts — receipt, error taxonomy, canonical envelope

**Observable outcome:** one module defines the receipt shape, the error code
vocabulary, and the canonical request envelope shared by client and server, so
client and Cloud Function cannot drift.

**Dependencies:** Task 3.

**Files to create:**
- `field-event-contracts.js` (dual pattern, global `SetasFieldEventContracts`)
- `field-event-contracts.test.js`

**Contract:**
- `ERROR_CODES` frozen set: `content_mismatch`, `revision_conflict`,
  `invalid_state_transition`, `unauthorized_action`, `unknown_role`,
  `incomplete_event_record`, `batch_not_found`, `batch_already_has_pending_transition`,
  `canonicalization_failed`, `network_error`.
- `isRetryable(code)` → only `network_error` is retryable. Every other code is
  terminal. (Invariant: a terminal code must never re-enter the retry loop.)
- `buildRequestEnvelope(event, accountId)` → `{schemaVersion, accountId, event}`;
  throws if `event.attachmentIds.length !== 0` (**enforces G1 at the boundary**).
- `validateReceipt(receipt)` → requires `{eventId, acceptedAt, batchRevisionAfter, serverEventPath}`;
  throws `incomplete_event_record` if any field is missing or `batchRevisionAfter`
  is not a positive integer.
- `RECEIPT_FIELDS` exported so `contentEquals` and the server share one list.

**Invariants:** contracts module has **no** I/O, no Firestore import, no
IndexedDB import — it must be loadable by both browser and Cloud Function.

**Failure cases:** non-empty `attachmentIds`; missing receipt field;
non-integer `batchRevisionAfter`; unknown error code passed to `isRetryable`.

**Acceptance tests:**
1. `buildRequestEnvelope` throws when `attachmentIds` is non-empty (G1).
2. `validateReceipt` throws `incomplete_event_record` for each missing field (parametrised).
3. `isRetryable('network_error')` true; `isRetryable('content_mismatch')` false; every other code false.
4. `isRetryable('not_a_code')` throws.
5. Module loads in a sandbox with no `indexedDB` and no `firebase` global.

**Validation commands:**
```bash
node --test field-event-contracts.test.js
```

**Completion criteria:** all tests pass; module has zero imports.

**Owner:** implementer. **Independent review:** not required (single bounded area).

---

## Phase 3: Authoritative Server Acceptance

> ### Verified data-model reality (checked 2026-09-06, before implementing Task 5)
>
> The Task 5/6 contracts below were drafted against assumed collection names.
> The repository says otherwise. **Use these, not the assumed names:**
>
> | Assumed | Actual | Evidence |
> |---------|--------|----------|
> | `batches/{id}` | `lotes_produccion/{id}` | `firebase/db.js:51` |
> | `batch.state` | `lote.estado` | `firebase/db.js:53`, `batch-traceability.js:205` |
> | rules at `firestore.rules` | `firebase/firestore.rules` | `firebase.json` |
>
> **Three gaps block a faithful Task 5 implementation. They are schema
> decisions on a collection that already holds production documents, so they
> are NOT the implementer's to invent:**
>
> 1. **`estado` does not hold workflow states.** `firebase/db.js:53` writes
>    `estado: "activo"`. The workflow states (`inoculated`, `incubation`, …)
>    live only in `setas-os-workflow.js` and are not persisted. Accepting a
>    transition requires deciding how the state machine maps onto `estado`,
>    and backfilling existing documents.
> 2. **No `revision` field exists** on `lotes_produccion`. Optimistic
>    concurrency (`expectedBatchRevision`, `revision_conflict`) has no
>    substrate. It must be added and backfilled before Task 5 means anything.
> 3. **Roles are not the workflow's roles.** `firebase/firestore.rules` reads
>    `usuarios/{uid}.rol` and only distinguishes `'admin'`. The workflow's
>    `direccion` / `produccion` / `operario` matrix (Task 3) is not connected
>    to any persisted role.
>
> **Also: this project has no Cloud Functions infrastructure.** `firebase.json`
> declares only `auth`, `firestore` and `hosting` — no `functions` key, and no
> `functions/` directory. Adding one is an infrastructure change, and deploying
> it requires a Blaze billing plan. Writing the function and its emulator tests
> locally is in scope; **creating the Firebase project resources and deploying
> is not** and needs separate authorization.
>
> **Status: Tasks 5 and 6 are `blocked` on items 1–3 above.** They are not
> "not started" — the contracts are specified; the schema decisions are not
> the agent's to make unilaterally on production data.


### Task 5: `acceptFieldEvent` Cloud Function

**Observable outcome:** a callable function is the **only** path that mutates
batch state; it is idempotent, transactional, and returns a valid receipt.

**Dependencies:** Task 4. Independent of Tasks 10–11 (UI may proceed against the
mock contract in Task 11).

**Files to create:**
- `functions/accept-field-event.js`
- `functions/accept-field-event.test.js`

Verify first: `ls functions/` — if absent, create it and note that deploy config
is **out of scope** (no deploy authorized).

**Contract:** `acceptFieldEvent({schemaVersion, accountId, event})` → `receipt`.

Order of operations, **all inside one `db.runTransaction`** (G4):
1. Read `field_events/{event.id}`.
   - Exists **with** receipt → `contentEquals(event, stored)`; equal ⇒ return the
     **stored original receipt** (G5); unequal ⇒ throw `content_mismatch` (G6).
   - Exists **without** receipt → throw `incomplete_event_record`.
2. Read `lotes_produccion/{event.batchId}`; missing ⇒ `batch_not_found`.
3. `batch.revision !== event.expectedBatchRevision` ⇒ `revision_conflict`.
4. `validateTransition(batch, payload.from, payload.to, operatorRole)`.
5. Write batch `{state: payload.to, revision: batch.revision + 1}` and the event
   document with its embedded receipt — **in the same transaction**.

**Invariants:**
- `operatorId` is taken from `context.auth.uid`, **never** from the payload.
- `accountId` is verified against the caller's claim; mismatch ⇒ `unauthorized_action`.
- No read used for an acceptance decision may occur before the transaction opens.
- The receipt is embedded in the event document, not a subcollection.

**Failure cases:** unauthenticated; account mismatch; `batch_not_found`;
`revision_conflict`; `content_mismatch`; `incomplete_event_record`;
`invalid_state_transition`; `unauthorized_action`; non-empty `attachmentIds`.

**Acceptance tests** (Firestore emulator, `@firebase/rules-unit-testing`):
1. First accept commits and returns a receipt passing `validateReceipt`.
2. **Replay** of the identical event returns a receipt **deeply equal** to the first, and `batch.revision` increments **only once** (G5).
3. Same `event.id`, changed `payload.to` ⇒ `content_mismatch`, batch unchanged (G6).
4. Two concurrent accepts from the same `expectedBatchRevision` ⇒ exactly one commits, the other gets `revision_conflict`.
5. Stored event without a receipt ⇒ `incomplete_event_record`.
6. Payload `operatorId` differing from `auth.uid` is ignored; the stored event records `auth.uid`.
7. `attachmentIds: ['x']` ⇒ rejected (G1).

**Validation commands:**
```bash
firebase emulators:exec --only firestore "node --test functions/accept-field-event.test.js"
```
If the emulator is unavailable, that is an **environment blocker**, not a pass —
record it and leave the task `blocked` (AGENTS.md §110).

**Completion criteria:** all 7 tests pass against the emulator; no acceptance read
outside the transaction (verified by reading the diff).

**Owner:** implementer. **Independent review: REQUIRED** (authentication +
authoritative state).

---

### Task 6: Firestore rules preventing client bypass

**Observable outcome:** a client cannot write `batches/*` state or
`field_events/*` directly; only the Cloud Function can.

**Dependencies:** Task 5.

**Files to modify:** `firebase/firestore.rules` (exists; deploy is out of scope).

**Contract:**
- `field_events/{id}`: client `read` allowed when the doc's `accountId` matches
  the caller's; client `create`/`update`/`delete` **denied unconditionally**.
- `lotes_produccion/{id}`: keep the existing `recetaSnapshot` immutability rule; additionally deny client writes to `estado` and `revision`. Other fields keep their current rules.
- Admin SDK (the Cloud Function) bypasses rules — that is the only write path.

**Invariants:** no rule grants a client write to `state` or `revision`; denial is
by default, not by enumeration of bad cases.

**Failure cases:** direct client `set` on a batch state; direct client `create` of
a field event; cross-account read.

**Acceptance tests** (`firestore-rules.test.js`, rules-unit-testing):
1. Authenticated client `set(lotes_produccion/b1, {estado:'fruiting'})` ⇒ **denied**.
2. Authenticated client `set(lotes_produccion/b1, {revision: 99})` ⇒ **denied**.
3. Authenticated client `create(field_events/e1, …)` ⇒ **denied**.
4. Client reads own-account field event ⇒ **allowed**.
5. Client reads another account's field event ⇒ **denied** (G2 boundary).
6. Admin SDK write to both collections ⇒ **allowed**.

**Validation commands:**
```bash
firebase emulators:exec --only firestore "node --test firestore-rules.test.js"
```

**Completion criteria:** all 6 tests pass; no test is skipped for convenience.

**Owner:** implementer. **Independent review: REQUIRED** (authentication /
security boundary).

---

## Phase 4: Account-Isolated Sync & Atomic Reconciliation

### Task 7: Atomic local receipt reconciliation

**Observable outcome:** applying a receipt persists it, marks the queue entry
confirmed, updates the local batch cache, and releases the reservation — as one
IndexedDB transaction that is safe against stale and duplicate responses.

**Dependencies:** Tasks 3, 4. **Closes F5 and G7/G8.**

**Files to modify:** `field-event-queue.js`, `field-event-queue.test.js`.
**Files to create:** `field-event-reconcile.js`, `field-event-reconcile.test.js`
(dual pattern, global `SetasFieldEventReconcile`).

**Contract:** `reconcileReceipt(db, {accountId, eventId, batchId, receipt})` → `{applied: boolean, reason?}`.

Single `readwrite` transaction over `['queue_entries','auth_receipts','pending_batch_transitions','batch_cache']`:
1. Read the queue entry. Missing ⇒ `{applied:false, reason:'unknown_event'}`.
2. Already `confirmed` ⇒ `{applied:false, reason:'already_confirmed'}` (duplicate delivery is a no-op, not an error).
3. Read the reservation. If it exists and its `eventId !== eventId` ⇒
   `{applied:false, reason:'stale_response'}` and **release nothing** (G8).
4. Write `auth_receipts` (closes F5); set queue entry `status:'confirmed'`.
5. Update `batch_cache` **only if** `receipt.batchRevisionAfter > cached.revision`
   — a lower or equal revision must never overwrite a newer one (G8).
6. Delete the reservation only when its `eventId` matches.

Requires a new `batch_cache` objectStore (`keyPath:'batchId'`) — this is an
IndexedDB **version 2** upgrade in `initializeQueue`. The upgrade must be
additive and must not drop existing stores.

**Invariants:** all six steps commit together or none do; a duplicate is a no-op;
revision is monotonic; a stale response never mutates anything.

**Failure cases:** unknown event; already confirmed; stale reservation; older
revision; transaction abort mid-write.

**Acceptance tests:**
1. Happy path: receipt stored, entry `confirmed`, cache revision updated, reservation gone.
2. **Duplicate delivery**: calling twice ⇒ second returns `already_confirmed`; revision unchanged; no throw.
3. **Stale response**: reservation holds `evt_new`, reconcile `evt_old` ⇒ `stale_response`, reservation intact, cache untouched (G8).
4. **Revision rollback**: cache at `revision:5`, receipt with `batchRevisionAfter:3` ⇒ cache stays `5` (G8).
5. **Atomicity**: force the transaction to abort before commit ⇒ no store shows a partial write.
6. v1→v2 upgrade preserves rows written under v1.

**Validation commands:**
```bash
node --test field-event-reconcile.test.js field-event-queue.test.js
```

**Completion criteria:** all 6 tests pass; no store is written outside the single transaction.

**Owner:** implementer. **Independent review: REQUIRED** (schema migration).

---

### Task 8: Sync engine (account-isolated, stable IDs, terminal-vs-retryable)

**Observable outcome:** pending events for the **active account only** are sent
when online; retries reuse the same `eventId`; terminal errors leave the retry
loop; conflicts release the reservation.

**Dependencies:** Tasks 4, 7. Server (Task 5) may be stubbed by the contract
during unit tests; integration is Task 13.

**Files to create:** `field-event-sync.js`, `field-event-sync.test.js`
(dual pattern, global `SetasFieldEventSync`).

**Contract:**
- `createSyncEngine({db, accountId, transport, now})` → `{start, stop, syncOnce}`.
  `transport(envelope)` → `Promise<receipt>` or throws `{code}`; injected so tests
  need no network.
- `syncOnce()` drains `queryPendingByStatus(db,'pending')` **filtered to
  `accountId`**, sends each, and routes the outcome:
  - receipt ⇒ `reconcileReceipt(...)` (Task 7).
  - `isRetryable(code)` ⇒ `status:'retry_wait'`, `attempts+1`,
    `nextAttemptAt = now + backoff(attempts)`; **`eventId` unchanged** (G3).
  - terminal `revision_conflict` ⇒ `status:'conflict'` **and** release the
    reservation with the event guard, so the operator can refresh and create a
    **new** event with a **new** id (G9).
  - other terminal codes ⇒ `status:'rejected'`, release reservation, keep the
    error code for the UI.
- Backoff: `min(30_000, 1000 * 2 ** attempts)` with full jitter; capped at 8 attempts,
  after which the entry becomes `rejected` with `network_error`.
- Concurrency: `syncOnce` is **not re-entrant** — a second call while one is in
  flight returns the in-flight promise (prevents multi-tab double-send amplification).

**Invariants:** an event is never sent for an account other than `accountId`;
`eventId` is never regenerated on retry; a terminal code never re-enters retry;
the reservation is released on every terminal outcome.

**Failure cases:** transport throws non-coded error (treat as `network_error`);
event for another account present in the store; conflict; attempt cap reached.

**Acceptance tests** (fake transport, `fake-indexeddb`, injected clock):
1. Pending event ⇒ transport called once ⇒ entry `confirmed` via reconcile.
2. `network_error` ⇒ `retry_wait`, `attempts=1`, `nextAttemptAt` in the future; retry sends the **same `eventId`** (G3).
3. `revision_conflict` ⇒ `status:'conflict'` **and** reservation released (G9).
4. `content_mismatch` ⇒ `rejected`, **no** retry scheduled.
5. Events belonging to account B are **not** sent while `accountId` is A (G2).
6. Two overlapping `syncOnce()` calls ⇒ transport invoked once per event, not twice.
7. Attempt 8 exhausts the cap ⇒ `rejected` with `network_error`.

**Validation commands:**
```bash
node --test field-event-sync.test.js
```

**Completion criteria:** all 7 tests pass; no real network or timers (clock injected).

**Owner:** implementer. **Independent review: REQUIRED** (concurrency + account isolation).

---

### Task 9: Logout, account switch, and recovery

**Observable outcome:** logging out preserves pending work; logging back in
recovers exactly that account's events; switching accounts never sends or
displays another account's events.

**Dependencies:** Tasks 7, 8. **Implements G2.**

**Files to create:** `field-event-account.js`, `field-event-account.test.js`.
**Files to modify:** `firebase/auth-gate.js` — hook the existing
`AUTH_STATE_EVENT` (`"setas-auth-state"`, line 26) rather than inventing a new
lifecycle.

**Contract:**
- `onAuthChange({db, previousAccountId, nextAccountId, engine})`:
  1. `engine.stop()` for the previous account and await the in-flight send.
  2. **Never delete** any `field_events`, `queue_entries`, or reservations.
  3. If `nextAccountId` is null (logout) ⇒ stop only.
  4. Else `recoverEventsByAccount(db, nextAccountId)`, re-arm entries whose
     `status` is `pending`/`retry_wait`, and start a new engine bound to it.
- An in-flight response that lands **after** the switch is routed through
  `reconcileReceipt` for its **original** account, never the new one.

**Invariants:** no destructive operation on logout; recovery is filtered by
`accountId`; a late response cannot cross accounts.

**Failure cases:** logout while a send is in flight; switch A→B→A; recovery when
the account has no events.

**Acceptance tests:**
1. Logout with 3 pending events ⇒ all 3 still present in IndexedDB (G2).
2. Re-login as the same account ⇒ exactly those 3 recovered and re-armed.
3. Switch A→B ⇒ B's engine sends none of A's events; A's rows untouched (G2).
4. Response for A's in-flight event arriving after switching to B ⇒ reconciled under A; B's cache untouched.
5. Recovery for an account with zero events ⇒ resolves `[]`, no throw.

**Validation commands:**
```bash
node --test field-event-account.test.js
```

**Completion criteria:** all 5 tests pass; grep confirms no `.delete(`/`.clear()`
on event stores in the logout path.

**Owner:** implementer. **Independent review: REQUIRED** (account isolation).

---

## Phase 5: QR Resolution and UI

> UI work (Tasks 10–11) may proceed in parallel with Tasks 5–6 against the
> **mock transport contract** from Task 4. **No file is edited by two tasks at
> once**: Tasks 10–11 own `field-qr-resolve.js`, `field-action-sheet.js` and
> `simulador-app.jsx`; Tasks 5–9 own the queue/sync/server files.

### Task 10: QR resolution (scan → batch, no side effects)

**Observable outcome:** decoding a printed 40×30mm / 50×30mm label yields a
batch reference; **scanning alone changes nothing** (G10).

**Dependencies:** Task 3. **Note F7 — no decoder exists; `qr-mini.js` only
generates.**

**Files to create:** `field-qr-resolve.js`, `field-qr-resolve.test.js`.

**Decoder ruling:** use the browser-native `BarcodeDetector` when present;
otherwise surface `scanner_unavailable` and fall back to **manual batch-code
entry**. Do **not** add a decoding library — it would need a bundler the repo
does not have (see F1). Record this as a v1 limitation.

**Contract:**
- `parseBatchRef(text)` → `{batchId}` or throws `invalid_qr_payload`.
  Accepted forms: the bare batch code, and the trace URL already emitted by
  `batch-traceability.js:260` (`https://setasdelapena.com/trace/<code>`) — reuse
  that format, do not invent a second one.
- `resolveBatch(text, lookup)` → `{batch, allowedTransitions}` where
  `allowedTransitions` comes from `DEFAULT_TRANSITIONS[batch.state]` filtered by
  the operator's role matrix (Task 3). Unknown code ⇒ `batch_not_found`.
- `resolveBatch` is **pure**: it performs no write, enqueues nothing, and
  mutates no state (G10).

**Invariants:** resolution never enqueues an event; payload parsing rejects
unknown schemes rather than guessing.

**Failure cases:** malformed payload; unknown batch; batch in a terminal state
(`closed`/`discarded`/`failed`) ⇒ empty `allowedTransitions`, not an error;
`BarcodeDetector` absent.

**Acceptance tests:**
1. Bare code and trace URL both resolve to the same `batchId`.
2. `"garbage"` ⇒ `invalid_qr_payload`.
3. Unknown code ⇒ `batch_not_found`.
4. **`resolveBatch` writes nothing** — a spy IndexedDB records zero `readwrite` transactions (G10).
5. Batch in `fruiting` for `operario` ⇒ `allowedTransitions` excludes `discarded`.
6. Batch in `closed` ⇒ `allowedTransitions` is `[]`.

**Validation commands:**
```bash
node --test field-qr-resolve.test.js
```

**Completion criteria:** all 6 tests pass; test 4 is the G10 gate.

**Owner:** implementer. **Independent review:** not required.

---

### Task 11: Action sheet with saved-locally vs server-confirmed states

**Observable outcome:** the operator picks a transition, confirms explicitly, and
sees a state that distinguishes **saved on this device** from **confirmed by the
server** (G11).

**Dependencies:** Tasks 3, 4, 10. Consumes the Task 4 mock transport until Task 5
is integrated in Task 13.

**Files to create:** `field-action-sheet.js`, `field-action-sheet.test.js`.
**Files to modify:** `simulador-app.jsx` (mount point + both entry points).
**Build step:** `simulador-app.jsx` changes require `node build.js`; `build.test.js`
fails on a stale `simulador-app.js`, so the rebuild must be committed.

**Contract:**
- `buildActionSheetModel({batch, allowedTransitions, queueEntry})` → a pure view
  model `{title, options[], status}` where `status` is exactly one of:
  `idle` | `saved_local` | `sending` | `confirmed` | `conflict` | `rejected`.
- Status derives **only** from the queue entry: `pending`→`saved_local`,
  `retry_wait`→`saved_local`, in-flight→`sending`, `confirmed`→`confirmed`,
  `conflict`→`conflict`, `rejected`→`rejected`. The UI must **never** render
  `confirmed` from an optimistic local write (G11).
- `confirmTransition(...)` is the **only** function that creates and persists an
  event; it requires an explicit operator confirmation argument.
- On `conflict`, the sheet offers **Refresh**, which re-resolves the batch and
  produces a **new** event with a **new** id on the next confirm (G9).

**Invariants:** two visually distinct states for `saved_local` and `confirmed`;
`confirmed` is only reachable from a receipt; opening the sheet writes nothing.

**Failure cases:** empty `allowedTransitions`; conflict; rejected; sheet opened
for a terminal-state batch.

**Acceptance tests** (pure model tests — no DOM):
1. `pending` ⇒ `status:'saved_local'`; `confirmed` ⇒ `status:'confirmed'`; the two labels differ (G11).
2. Opening the sheet performs no write (spy IndexedDB, zero `readwrite`).
3. `confirmTransition` without the explicit confirmation flag ⇒ throws, nothing persisted.
4. Conflict ⇒ Refresh offered; confirming after refresh yields a **different `eventId`** than the conflicted one (G9).
5. Terminal-state batch ⇒ no transition options rendered.
6. `retry_wait` renders `saved_local`, never `confirmed`.

**Validation commands:**
```bash
node --test field-action-sheet.test.js
node build.js && node --test build.test.js
```

**Completion criteria:** all 6 tests pass; `build.test.js` passes with the
committed `simulador-app.js`.

**Owner:** implementer. **Independent review:** not required (UI, single area).

---

## Phase 6: Recovery, Concurrency, and End-to-End Validation

### Task 12: Concurrency, restart, and account-switch suite

**Observable outcome:** the mandatory guarantees hold under interruption,
duplication, and account switching.

**Dependencies:** Tasks 5–11.

**Files to create:** `field-event-resilience.test.js`.

**Contract:** each scenario below is one executable test. Restart is simulated by
closing and reopening the IndexedDB handle and rebuilding the engine from
persisted state — never by reusing in-memory state.

**Acceptance tests:**
1. **Server commits, response lost** ⇒ retry replays the same `eventId`, server returns the original receipt, batch revision increments **once** (G3, G5).
2. **Two requests from the same `expectedBatchRevision`** ⇒ one accepted, one `revision_conflict`; final revision advanced by exactly 1.
3. **Duplicate delivery from two tabs** ⇒ second reconcile is `already_confirmed`; no double revision bump (G7).
4. **Restart during local persistence** ⇒ either no event or a complete event with its reservation; never an event without a reservation, nor a reservation without an event.
5. **Restart during send** ⇒ event re-armed as `pending`, resent with the same id.
6. **Restart during reconciliation** ⇒ reconcile is idempotent on replay; revision never regresses (G7, G8).
7. **Account switch with pending and in-flight requests** ⇒ per Task 9 tests 3–4, asserted end-to-end (G2).
8. **Unauthorized direct write** ⇒ rules deny (references Task 6 tests).

**Validation commands:**
```bash
node --test field-event-resilience.test.js
firebase emulators:exec --only firestore "node --test firestore-rules.test.js functions/accept-field-event.test.js"
```

**Completion criteria:** all 8 scenarios pass. A scenario that cannot run for
environment reasons is reported `blocked`, never `passed`.

**Owner:** implementer. **Independent review: REQUIRED** (concurrency correctness).

---

### Task 13: End-to-end offline → confirm → restart → reconnect

**Observable outcome:** the headline journey produces **exactly one** accepted
transition with the correct state and revision displayed.

**Dependencies:** Task 12. This is the first task that wires the real transport
to the real Cloud Function.

**Files to create:** `tests/e2e/field-qr-offline.spec.js` (Playwright — already a
devDependency).
**Files to modify:** none.

**Scenario (single test):**
1. Authenticate; open a batch in `inoculated`.
2. Go offline (`context.setOffline(true)`).
3. Resolve a QR payload for that batch; assert **no** state change yet (G10).
4. Confirm `inoculated → incubation`; assert the UI shows **saved locally**, not confirmed (G11).
5. Reload the page (restart) while still offline; assert the pending event survives and still shows **saved locally** (G2).
6. Go online; wait for sync.
7. Assert: UI shows **confirmed**; batch state is `incubation`; revision incremented by exactly **1**; exactly **one** accepted event document exists for that batch.

**Invariants:** exactly one accepted transition; revision advanced by one; no
duplicate event documents.

**Failure cases to assert:** a second reconnect does not create a second
transition; the reservation is released after confirmation.

**Validation commands:**
```bash
npx playwright test tests/e2e/field-qr-offline.spec.js
```
Requires `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`. Missing credentials are an
**environment blocker**, not a failure and not a pass (AGENTS.md §110). Never
print credentials.

**Completion criteria:** the scenario passes against the emulator, or is reported
`blocked` with the specific missing prerequisite named.

**Owner:** implementer. **Independent review: REQUIRED** (integration validation).

---

### Final Review: whole-branch independent review

**Dependencies:** Tasks 3–13.

**Scope:** the full diff from `f9d0271` (spec commit) to branch HEAD.

**Review checklist — each item cites file:line evidence, not a report:**
1. Every guarantee G1–G11 maps to a test that **was executed**, with its output.
2. No acceptance-governing read occurs outside the server transaction (Task 5).
3. No client write path to `lotes_produccion.estado` or `.revision` exists (Task 6).
4. `attachmentIds` is `[]` on every construction path; no attachment code (G1).
5. No destructive operation on logout (G2).
6. `eventId` is never regenerated on retry (G3).
7. Every new module loads in a browser sandbox and is registered in `PROTECTED_APP_SCRIPTS` (F1 regression gate).
8. `package.json` declares every runtime dependency actually used (F4 regression gate).
9. `auth_receipts` is written and read (F5 regression gate).
10. No reservation release without an event-id guard (F6 regression gate).

**Validation commands:**
```bash
cd field-os-simulador/setas-os
npm test
node build.js && node --test build.test.js
firebase emulators:exec --only firestore "node --test firestore-rules.test.js functions/accept-field-event.test.js"
```

**Completion criteria:** the reviewer reports findings in severity order with
file:line evidence. Unresolved blocking findings prevent completion. Delivery
stops at a **review-ready local branch** — no push, no PR, no merge, no deploy
without separate authorization (AGENTS.md §116, §131).

---

## Status Legend

Report each task as exactly one of:

- **implemented** — code written and committed
- **locally validated** — named tests executed locally with output shown
- **blocked** — a named prerequisite is missing (say which)
- **not started**

`implemented` never implies `locally validated`. Planned tests are listed as
planned until their output is shown. Local completion is never production
delivery.
