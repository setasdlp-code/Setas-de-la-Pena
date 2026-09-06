# Mobile Field QR Action Sheet with Offline-First Event Queueing

**Date:** 2026-09-05  
**Status:** Design Review  
**Scope:** Setas OS v5 mobile field operations — QR-triggered state transitions + offline resilience

---

## 1. Overview & Goals

Field operators at Setas de la Peña require rapid, offline-capable batch state transitions during in-field work. Currently, field logging depends on persistent connectivity and lacks resilience when WiFi/cellular is unavailable.

**This design introduces:**
1. **Mobile QR Scanner** — scan 40×30mm or 50×30mm thermal printed QR codes to open batch action sheets
2. **Offline-First Event Queue** — capture state transitions and field events locally; sync when connectivity returns
3. **Optimistic UI** — show pending transitions immediately while sync happens in background
4. **Concurrency Safety** — prevent lost updates (revision conflicts) when multiple devices modify the same batch
5. **Audit Trail** — immutable event records separate requests from server-accepted transitions

**Out of scope (v1):**
- Batch scan auditing (separate `batch_scanned` event system)
- Rich photo/attachment uploads (v2)
- Multi-device conflict resolution UI (handled as explicit "review & retry")

---

## 2. Data Model

### 2.1 FieldEvent (Immutable Domain Event)

Records an operator's request to transition a batch state. Created once, never mutated; sent to server for authorization and acceptance.

```typescript
interface FieldEvent {
  schemaVersion: 1;
  id: string;                    // "evt_<uuid>" — persisted before first send
  
  type: "batch_state_transition"; // Extensible for harvest, inspection, etc.
  
  batchId: string;               // Identifies the batch
  expectedBatchRevision: number;  // Client's last-known revision
  
  occurredAt: ISO8601;           // Device time when operator confirmed
  operatorId: string;            // Derived from auth session (server validates)
  source: "mobile_qr" | "mobile_form" | "web";
  
  payload: {
    from: string;                // Current state (validated against batch)
    to: string;                  // Target state (checked via state machine)
    reasonCode: string | null;   // e.g., "normal_advance", "correction", "environmental"
    notes: string | null;        // Max 500 chars; optional
  };
  
  attachmentIds: [];             // Always empty array in v1; deferred to v2
  
  metadata: {
    qrVersion?: string;          // "1.0"
    [key: string]: any;          // Extensible
  };
}
```

**Semantics:**
- Immutable after creation and first queue entry
- Represents operator's intent, not server acceptance
- Server must validate both event content and `expectedBatchRevision`
- No successful transition without an authoritative receipt

### 2.2 QueueEntry (Mutable Local Delivery State)

Tracks local transmission lifecycle for a queued FieldEvent. Survives app restarts; cleaned up after confirmation or permanent rejection.

```typescript
interface QueueEntry {
  eventId: string;               // References immutable FieldEvent.id
  localSequence: number;         // Queue order (per device, not global)
  queuedAt: ISO8601;             // When event was persisted locally
  
  status: "pending" 
    | "sending"                  // Actively posting to Firestore
    | "retry_wait"               // Waiting before next attempt
    | "confirmed"                // Authoritative receipt received
    | "conflict"                 // Revision mismatch (operator review needed)
    | "rejected";                // Server rejected (auth, validation, or business rule)
  
  syncAttempts: number;          // Retry counter (0 = first attempt)
  nextAttemptAt: ISO8601 | null; // Backoff timer for retry_wait
  lastSyncError: string | null;  // Error message from last failed sync
}
```

**Lifecycle:**
```
pending → sending → confirmed (success path)
       ↓
       retry_wait → sending → ... (backoff retry)
       ↓
       conflict | rejected (terminal, manual intervention)
```

### 2.3 Attachments (v2 Feature, Deferred)

**v1 Contract:** `attachmentIds` must always be an empty array `[]`. 

The Attachment model, photo capture, upload tracking, and binary persistence are **deferred to v2**. Client and server reject any FieldEvent with non-empty `attachmentIds` in v1.

**Why deferred:** Photo capture and upload add concurrency, storage, and recovery complexity beyond the v1 scope of reliable state transitions. v2 will introduce:
- Photo capture & local durable storage
- Separate upload lifecycle (independent of event confirmation)
- Server-side attachment association & proof
- Retry & recovery for interrupted uploads

**v1 Implementation:** Omit photo UI entirely; set `attachmentIds: []` always. Remove all photo-related test scenarios from v1 validation.

### 2.3a Atomicity Guarantees

**Local Atomicity (Client):**
- Persisting FieldEvent, QueueEntry, and the batch's pending-transition reservation must complete in a single IndexedDB transaction.
- "Saved on this device" feedback is shown **only after the entire transaction commits successfully**, not after individual writes.
- The pending-transition reservation (one per batch per device) must be enforced across browser tabs using IndexedDB locks or conflict-on-write detection.
- If the transaction fails (e.g., quota exceeded, IDB error), retain the draft, explain the failure, and prevent "saved" feedback until retry succeeds.

**Server Atomicity:**
- Accepting the FieldEvent, updating batch state and revision, and creating the AuthorizationReceipt must occur in a single Firestore transaction.
- The transaction executor is a Cloud Function (`acceptFieldEvent`) or Firestore Security Rules with transactional validation (see §6.2).
- The transaction must validate authorization once (before commit); failed validation rolls back the entire operation.
- **No partial acceptance:** Event record, receipt, and batch state change are all-or-nothing.

**Points of No Return:**
1. **After local commit:** FieldEvent becomes immutable. QueueEntry and batch reservation are durably written. Client must not modify the event.
2. **After server commit:** Batch state changed, revision incremented. Client's observation is "result unknown until receipt arrives." Network failure, timeout, or lost response = unknown, not rejection. Retry with same `eventId` recovers the original receipt.

**Content Equivalence (for Idempotency Check):**
When retrying with the same `eventId`, the server compares the submitted event against the stored event using:
- Canonical field order (JSON lexicographic sort)
- Normalized timestamps (ISO8601, UTC, no microseconds beyond ms precision)
- Payload values: exact match (including null vs. missing field distinction)
- Example: `{eventId, type, batchId, expectedBatchRevision, occurredAt, operatorId, source, payload, attachmentIds}` (in that order, serialized)

### 2.4 AuthorizationReceipt (Server Acceptance Record)

Proves the server accepted the event and applied the batch change. **Embedded in the FieldEvent document on the server** (not a separate sub-document). Returned by server in the response and stored locally to prove idempotency.

```typescript
interface AuthorizationReceipt {
  eventId: string;               // Which event this receipt authorizes
  acceptedAt: ISO8601;           // Server's UTC timestamp (ms precision)
  batchRevision: number;         // New revision after transition applied
}

// On server, the full document looks like:
interface StoredFieldEvent {
  // ... all FieldEvent fields ...
  receipt: AuthorizationReceipt;  // Embedded proof of acceptance
}
```

**Storage:**
- Client stores received receipt in IndexedDB alongside QueueEntry (status = confirmed)
- Server stores receipt as field of field-events/{eventId} document
- Canonical receipt is server-stored; client receipt is recovery copy
- On idempotency check, compare eventId and content; if match and receipt exists, return that receipt

---

## 3. QR Scanner & Action Flow

### 3.1 Two Entry Points

**Entry Point 1: Quick-Scan Button (Global)**
- Always available from mobile interface
- Tap → camera opens with QR targeting overlay
- Scan any batch QR → resolves batch, opens Action Sheet

**Entry Point 2: In-Batch Detail View**
- Camera available within batch tracking view
- Scanned QR must match current batch (sanity check)
- Mismatch → alert "wrong batch" and offer "Open scanned batch"

### 3.2 Scan Resolution & Validation

**On scan:**
1. Parse QR content (format version, batch identifier)
2. Validate format explicitly (no trust of embedded state/revision)
3. Resolve batch through application data layer
   - Online: fetch from Firestore (current state + revision)
   - Offline: use cached state (show "last confirmed [timestamp]")
4. If offline and batch unknown locally, explain "connection required for new batches"
5. Debounce subsequent frames (pause after first accepted scan)

**QR Format (v1):**
```
setas://batch/<batchId>?v=1.0
```
- Batch ID only; no embedded state
- Explicit version for forward compatibility

### 3.3 Action Sheet: Confirmed vs. Pending States

**Before any transition:**
```
Current State: Incubation
Last Confirmed: [timestamp]
Revision: 12

[Available Actions]
→ Start Fruiting
→ Move to Another Room
→ Report Issue
```

**After operator selects action and confirms:**
```
Current State: Incubation (confirmed)

Pending Transition: Fruiting
Status: Saved on this device
[Will sync when online]

[Actions disabled until outcome known]
```

**Critical constraint:** Never overwrite "Current State" with pending; always show both.

### 3.4 Confirmation Flow (Client-Side Validation)

Before creating FieldEvent, revalidate:

1. **Batch identity** — scan resolution matched current batch
2. **State & revision** — are they still what we cached?
3. **Operator permission** — can this role perform this action?
4. **Required fields** — reasonCode, notes, or evidence required for this transition?
5. **No unresolved pending** — one pending per batch per device (v1)
6. **State machine** — `SetasOSWorkflow.assertTransition(from, to)` succeeds

**If any check fails:** Show error, offer retry or cancel.

**If all pass:**
1. Create immutable FieldEvent with deterministic `id`
2. Create QueueEntry with `status: "pending"`
3. Persist FieldEvent, QueueEntry, and pending-batch-transition reservation to IndexedDB atomically
4. Only then show "Saved on this device" + optimistic UI
5. Trigger background sync (see §4)

---

## 4. Offline Queue Storage & Sync Strategy

### 4.1 Local Storage (IndexedDB)

**Schema:**
```
ObjectStore "field_events"
  keyPath: "id"
  indexes: [
    { name: "batchId", keyPath: "batchId" },
    { name: "queuedAt", keyPath: "queuedAt" },
    { name: "status", keyPath: "status" },
  ]

ObjectStore "queue_entries"
  keyPath: "eventId"
  indexes: [
    { name: "status", keyPath: "status" },
    { name: "nextAttemptAt", keyPath: "nextAttemptAt" },
  ]

ObjectStore "pending_batch_transitions"
  keyPath: "reservationId"  // Composite key: `${accountId}:${batchId}`
  // Ensures max one pending transition per batch per account per device
  // Structure: { reservationId, accountId, batchId, eventId, reservedAt }
  indexes: [
    { name: "accountBatch", keyPath: ["accountId", "batchId"] },
  ]

ObjectStore "auth_receipts"
  keyPath: "eventId"
  indexes: [
    { name: "acceptedAt", keyPath: "acceptedAt" },
  ]
```

**Local Atomicity:**
Before showing "Saved on this device," execute a single IDB transaction:
```javascript
async function persistFieldEvent(event, queueEntry, accountId) {
  const reservationId = `${accountId}:${event.batchId}`;
  
  const tx = db.transaction(
    ["field_events", "queue_entries", "pending_batch_transitions"],
    "readwrite"
  );
  
  // Check: no other pending transition for this (account, batch) pair
  const existing = await tx.objectStore("pending_batch_transitions")
    .get(reservationId);
  if (existing) {
    throw new Error("batch_already_has_pending_transition");
  }
  
  // Write all-or-nothing
  await tx.objectStore("field_events").add(event);
  await tx.objectStore("queue_entries").add(queueEntry);
  await tx.objectStore("pending_batch_transitions").put({
    reservationId,
    accountId,
    batchId: event.batchId,
    eventId: event.id,
    reservedAt: new Date().toISOString(),
  });
  
  await tx.done;
  // Only now: show "Saved on this device"
}

// Called when sync completes (confirmed or rejected)
async function releaseReservation(accountId, batchId) {
  const reservationId = `${accountId}:${batchId}`;
  const tx = db.transaction(
    ["pending_batch_transitions"],
    "readwrite"
  );
  await tx.objectStore("pending_batch_transitions").delete(reservationId);
  await tx.done;
}
```

**Cross-Tab & Cross-Account Enforcement:**
The `pending_batch_transitions` store is indexed by `[accountId, batchId]` and checked on every action-sheet confirmation. If another tab (same browser, **same account**) already has a pending transition for this batch, the new confirmation is rejected with "Another action is pending for this batch." Different accounts have separate reservations and do not block each other.

**Reservation Lifecycle:**
1. Created: when operator confirms action (atomically with FieldEvent & QueueEntry)
2. Held: while QueueEntry.status ∈ [pending, sending, retry_wait]
3. Released: when QueueEntry.status ∈ [confirmed, conflict, rejected]
   - On confirm: event accepted by server, new state + revision applied; release allows next transition
   - On conflict: operator must resolve (refresh batch state, submit new transition); release allows new attempt
   - On reject: authorization or validation failed; release allows retry or different action

### 4.2 Sync Trigger & Retry Strategy

**Sync triggers:**
1. `navigator.onLine` event (primary)
2. Polling fallback every 30 seconds (if Service Worker unavailable)
3. Explicit "retry now" button in UI (for operator-initiated retry)

**Retry backoff:**
- Attempt 1: immediate
- Attempt 2+: exponential backoff (30s, 60s, 120s, 240s, capped at 1 hour)
- Max 5 attempts per event before user intervention required
- `nextAttemptAt` persisted; resume on app restart

**Sync flow:**

```
1. For each QueueEntry with status ∈ [pending, sending, retry_wait]:
2. If now < nextAttemptAt: skip
3. Set status ← sending
4. Fetch FieldEvent from IndexedDB
5. POST /api/field-events (Firestore transaction)
   {
     event: FieldEvent,
     expectedBatchRevision: event.expectedBatchRevision,
     attachmentIds: []
   }
6. If success:
   - Extract receipt from response
   - Set QueueEntry.status ← confirmed
   - Release pending-batch-transition reservation
   - Update local batch cache with new revision
   - Store receipt in IndexedDB (with QueueEntry or separately)
7. If failure:
   - If "idempotency: already accepted" → recover receipt from response, set confirmed, release reservation
   - If "revision conflict" → set status ← conflict, do NOT release reservation (operator must review)
   - If "authorization denied" or "validation failed" → set status ← rejected, release reservation
   - If "network/timeout" → set status ← retry_wait, backoff (reservation remains held)
8. Persist updated QueueEntry & receipt to IndexedDB
```

### 4.3 Idempotency & Conflict Resolution

**Server Acceptance Order (Cloud Function `acceptFieldEvent`):**

```javascript
// Executor: Cloud Function, triggered by POST /api/field-events
// Input: { event, expectedBatchRevision, attachmentIds }
// Output: { receipt } or error with specific code
// CRITICAL: All reads that govern acceptance happen inside the transaction

async function acceptFieldEvent(event, expectedBatchRevision, attachmentIds) {
  // Pre-transaction validation: only input structure & auth
  if (!event.id || event.type !== "batch_state_transition") {
    throw new Error("invalid_event_structure");
  }
  if (attachmentIds && attachmentIds.length > 0) {
    throw new Error("attachments_not_supported_in_v1");
  }

  // Authenticate: event.operatorId must match authenticated user
  const authUser = context.auth.uid;
  if (event.operatorId !== authUser) {
    throw new Error("operator_id_mismatch_with_auth");
  }

  // All acceptance logic inside transaction to prevent race conditions
  try {
    const receipt = await db.runTransaction(async (tx) => {
      // 1. Idempotency check INSIDE transaction
      const existingEventDoc = await tx.get(db.doc(`field-events/${event.id}`));
      if (existingEventDoc.exists) {
        const storedEvent = existingEventDoc.data();
        const existingReceipt = storedEvent.receipt;
        
        if (contentEquals(event, storedEvent)) {
          // Legitimate retry: return original receipt
          return existingReceipt;
        } else {
          // Same ID, different content: idempotency violation
          throw new Error("idempotency_violation: same eventId, different content");
        }
      }

      // 2. Fetch batch INSIDE transaction (snapshot)
      const batchDoc = await tx.get(db.doc(`batches/${event.batchId}`));
      if (!batchDoc.exists) {
        throw new Error("batch_not_found");
      }
      const batch = batchDoc.data();

      // 3. Verify revision (against client expectation)
      if (batch.revision !== expectedBatchRevision) {
        throw new Error("revision_conflict", {
          currentRevision: batch.revision,
          currentState: batch.state,
        });
      }

      // 4. Validate state machine transition
      if (!isValidTransition(batch.state, event.payload.to)) {
        throw new Error("invalid_state_transition", {
          from: batch.state,
          to: event.payload.to,
        });
      }

      // 5. Authorize operator for this action
      // (fetch operator role doc inside transaction if needed)
      const opRoleDoc = await tx.get(db.doc(`operators/${event.operatorId}`));
      const operatorRole = opRoleDoc.exists ? opRoleDoc.data().role : "standard";
      if (!canPerformAction(operatorRole, event.payload.to)) {
        throw new Error("unauthorized_action", {
          action: event.payload.to,
          role: operatorRole,
        });
      }

      // 6. All checks passed; apply transition atomically
      const newRevision = batch.revision + 1;
      const acceptedAt = serverTimestamp();

      // Write event with embedded receipt
      const receipt = {
        eventId: event.id,
        acceptedAt: acceptedAt,
        batchRevision: newRevision,
      };
      await tx.set(db.doc(`field-events/${event.id}`), {
        ...event,
        receipt, // Embed receipt in the event document
      });

      // Update batch state, revision, and history
      await tx.update(db.doc(`batches/${event.batchId}`), {
        state: event.payload.to,
        revision: newRevision,
        updatedAt: acceptedAt,
        stateHistory: (batch.stateHistory || []).concat([{
          state: event.payload.to,
          revision: newRevision,
          acceptedAt: acceptedAt,
          eventId: event.id,
        }]),
      });

      return receipt;
    });

    return { receipt };
  } catch (err) {
    // Transaction rolled back; error message returned to client
    throw err;
  }
}

// Helper: normalized content comparison (canonical representation)
function contentEquals(submitted, stored) {
  // Normalize: canonical field order, ISO8601 timestamps (no microseconds beyond ms)
  const normalize = (obj) => {
    // Remove receipt before comparison (receipt added by server, not part of event content)
    const eventOnly = { ...obj };
    delete eventOnly.receipt;
    
    return JSON.stringify({
      id: eventOnly.id,
      schemaVersion: eventOnly.schemaVersion || 1,
      type: eventOnly.type,
      batchId: eventOnly.batchId,
      expectedBatchRevision: eventOnly.expectedBatchRevision,
      occurredAt: (eventOnly.occurredAt || "").replace(/\.\d{3}\d+Z$/, ".000Z"), // Normalize to ms
      operatorId: eventOnly.operatorId,
      source: eventOnly.source,
      payload: eventOnly.payload,
      attachmentIds: eventOnly.attachmentIds || [],
      metadata: eventOnly.metadata || {},
    });
  };
  
  return normalize(submitted) === normalize(stored);
}
```

**Why all reads inside transaction:**
- Two requests for same batch (revision 12) arrive simultaneously
- Without transactional reads, both see revision 12, both attempt update
- With reads inside tx, first request enters tx, sees 12, updates to 13; second request enters tx, sees 13, detects conflict
- This prevents lost updates and ensures strict serialization

**Client recovery:**

| Error | QueueEntry.status | UI Action |
|-------|-------------------|-----------|
| Network timeout | `retry_wait` | Show "retrying..." with backoff timer |
| Revision conflict | `conflict` | Show "another device updated this batch; review and retry" |
| Unauthorized/invalid | `rejected` | Show error, offer manual correction |
| Idempotency success | `confirmed` | Recover receipt, show success |

---

## 5. Mobile UI & UX

### 5.1 Scanner Interface

```
[QR Scanner Button] ← always visible, top-right corner

On tap:
├─ Camera opens
├─ Targeting overlay (centered box)
├─ [Cancel] button
├─ Once scan detected → pause detection (debounce)
└─ Close camera on dismissal

Fallback (if camera denied or unavailable):
├─ Show text input "Enter batch code"
├─ Auto-resolve same as QR scan
├─ Or [Open camera settings]
```

### 5.2 Action Sheet States

**Loading State (while resolving batch):**
```
Scanning...
[resolving batch from code]
```

**Offline + Unknown Batch:**
```
Batch not found locally

To queue a transition for a new batch,
please connect to the internet first.

[Dismiss]
```

**Ready (Online or Cached):**
```
┌─────────────────────────────────────┐
│ Batch: lote_abc_001                 │
│ Current State: Incubation           │
│ Last Updated: 2 hours ago           │
│ Revision: 12                        │
│                                     │
│ [→ Start Fruiting]                  │
│ [→ Move Room]                       │
│ [Report Issue]                      │
└─────────────────────────────────────┘
```

**After Operator Selects Action & Confirms:**
```
┌─────────────────────────────────────┐
│ Batch: lote_abc_001                 │
│                                     │
│ Current State: Incubation ✓         │
│ (confirmed on server)               │
│                                     │
│ Pending Transition: Fruiting        │
│ ┌─────────────────────────────────┐ │
│ │ ⏳ Saved on this device         │ │
│ │ Will sync when you're online    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Other actions disabled]            │
│                                     │
│ [Dismiss] [Details]                 │
└─────────────────────────────────────┘
```

**Conflict (Revision Mismatch):**
```
┌─────────────────────────────────────┐
│ ⚠️ Update Required                  │
│                                     │
│ Another device changed this batch:  │
│ Incubation → Maturation            │
│ (new revision: 13)                  │
│                                     │
│ Your pending: Incubation → Fruiting │
│ (expected revision: 12)             │
│                                     │
│ [Refresh & Review]                  │
│ [Discard Pending]                   │
└─────────────────────────────────────┘
```

### 5.3 Pending Transitions List

In the main batch list/dashboard, show pending count:
```
Batch lote_abc_001
State: Incubation
⏳ Pending: Fruiting (1 transition not yet synced)
Revision: 12 (local) → will be 13 after sync

[Sync Now] [View Details]
```

---

## 6. Server-Side Contract (Firestore)

### 6.1 Endpoint: POST `/api/field-events`

**Request:**
```json
{
  "event": { /* FieldEvent */ },
  "expectedBatchRevision": 12,
  "attachmentIds": []
}
```

**Response (Success 200):**
```json
{
  "receipt": {
    "eventId": "evt_uuid",
    "acceptedAt": "2026-09-05T14:35:10.000Z",
    "batchRevision": 13
  }
}
```

**Response (Revision Conflict 409):**
```json
{
  "error": "revision_conflict",
  "currentBatchRevision": 13,
  "currentState": "Maturation",
  "conflictingEventId": "evt_other_uuid"
}
```

**Response (Authorization Denied 403):**
```json
{
  "error": "unauthorized",
  "reason": "operator_not_authorized_for_state_transition"
}
```

### 6.2 Firestore Collections

```
/field-events/{eventId}
  - event: FieldEvent
  - receipt: AuthorizationReceipt (added by server)
  - createdAt: timestamp
  - updatedAt: timestamp

/batches/{batchId}
  - state: string
  - revision: number (atomic increment on transition)
  - stateHistory: [ {state, revision, acceptedAt, eventId}, ... ]
  - ... (existing fields)
```

---

## 7. Error Recovery & Edge Cases

### 7.1 Interrupted Delivery

**Scenario:** Event posted, server accepted, but response lost before client received it.

**Resolution:**
1. Client retries with same `eventId`
2. Server finds existing receipt (idempotency check, §4.3)
3. Returns original receipt → client marks as confirmed
4. No duplicate transition

**Test:** First request commits, response lost; retry returns original receipt.

### 7.2 Concurrent Modifications (Multi-Device)

**Scenario:** Device A and Device B both holding revision 12; A submits Incubation→Fruiting first.

**Resolution:**
1. A's event accepted, batch.revision becomes 13
2. B's event arrives with expectedBatchRevision: 12
3. Server returns 409 conflict
4. B's QueueEntry.status ← conflict
5. Operator on B: sees conflict alert, refreshes, sees revision 13 + fruiting state, can submit new transition if needed

**Test:** Two devices with same revision; one accepted, one gets conflict.

### 7.3 Stale Action Sheet

**Scenario:** Operator opens action sheet, app backgrounded for 30 mins, another device advances batch state, operator returns and confirms an action.

**Resolution:**
1. Confirmation revalidates cached state (checks local revision == expected)
2. If mismatch detected before persistence, show "batch changed; refresh to continue"
3. If mismatch discovered after send, server returns conflict
4. Operator must refresh and re-evaluate

**Test:** Stale action sheet; revalidation catches state change before sending.

### 7.4 Camera Denial & Fallback

**Scenario:** User denies camera permission, or device has no camera.

**Resolution:**
1. Show "Camera unavailable" message
2. Offer text input: "Enter batch code (e.g., lote_abc_001)"
3. Resolve same as QR scan
4. Proceed to action sheet

**Test:** Camera denied; manual batch entry works.

### 7.5 Local Storage Exhaustion

**Scenario:** IndexedDB quota exceeded while persisting event + attachments.

**Resolution:**
1. Show operator: "Storage full; please delete old photos or logs"
2. Allow manual cleanup of old confirmed transitions
3. Retain pending transitions
4. Prevent new transitions until space available

**Test:** Full quota; recovery and cleanup paths work.

### 7.6 Account Switch with Pending Events (Local & In-Flight)

**Scenario A (Local Only):** Operator A queues a transition offline; signs out; Operator B signs in.

**Resolution:**
1. On sign-out, keep all FieldEvents, QueueEntries, and pending_batch_transitions **unchanged** in IndexedDB
2. Flag them by accountId (FieldEvent.operatorId, QueueEntry.accountId, pending_batch_transitions.accountId)
3. On sign-in as Operator B:
   - Operator B sees only their own queued events (filtered by accountId)
   - Operator A's pending events remain in queue, not synced under B's auth
4. When Operator A signs back in (same session or new session):
   - Operator A's pending events are recovered from IndexedDB
   - Sync resumes for A's queued events using A's auth context
   - Receipts (accepted outcomes) are also recovered; Operator A can see which events were already confirmed
5. If IndexedDB is cleared (explicit user action or quota cleanup), pending events are lost; this is not automatic logout behavior

**Test:** Account switch with pending local events; pending events remain isolated by operatorId; B signs in and out, A signs back in → A's pending queue recovers intact.

**Scenario B (Request In-Flight):** Operator A submits event (POST in progress); connection is good; during wait for response, A signs out and B signs in.

**Resolution:**
1. The POST may still succeed on the server (event accepted, receipt created)
2. On server: receipt linked to eventId, which carries operatorId = A's UID
3. Client-side: XHR in progress when A signs out → response handling deferred (or cached by Service Worker)
4. On sign-in as Operator B:
   - Pending queue shows only B's events (filtered by operatorId)
   - A's in-flight event remains in FieldEvent/QueueEntry with operatorId = A
5. When A signs back in:
   - A's pending events recovered
   - If server already accepted (receipt exists), sync process finds it and marks confirmed
   - If server rejected or not yet processed, sync attempts again with A's auth
6. A's event is never attributed to B, never synced under B's credentials

**Test:** Request in-flight, account switches before response arrives; event accepted on server under A; B signs in and out; A signs back in → A recovers the event and its receipt/status.

---

## 8. Testing Strategy

### 8.1 Critical Reliability Tests (Run First)

These tests verify that operator confirmations are trustworthy and that accepted transitions are durable.

**Atomicity & Persistence:**
- ✓ **Local commit:** FieldEvent, QueueEntry, pending-batch-transition written in single IDB transaction; if transaction fails (quota, IDB error), "saved" feedback not shown and draft retained
- ✓ **Server commit:** Event + batch state update + receipt creation in single Firestore transaction; rollback if any step fails
- ✓ **Result visibility:** After local commit, UI shows "Saved on this device"; after server commit, shows "Confirmed on server" with new revision

**Idempotency & Duplicate Prevention:**
- ✓ **Legitimate retry:** Event submitted, server accepts, response lost; client retries same eventId → server returns original receipt, no duplicate transition
- ✓ **Same ID, different payload:** Client submits eventId X with payload {from: A, to: B}; server stores it; client retries with same ID but different payload → server rejects with idempotency_violation
- ✓ **Two tabs, same batch:** Tab 1 opens action sheet for batch X, confirms → pending_batch_transitions[X] written; Tab 2 opens action sheet for same batch, attempts confirm → rejected "another action pending for this batch"

**Revision Conflict Detection:**
- ✓ **Device A and B, same revision:** Both hold revision 12; A submits Incubation→Fruiting first (accepted, revision becomes 13); B submits Incubation→Fruiting with expectedBatchRevision: 12 → server returns conflict with currentRevision: 13
- ✓ **Conflict recovery:** Client receives conflict, shows "batch updated by another device," operator refreshes, sees new state and can submit new transition if needed

**Authorization & Account Safety:**
- ✓ **Operator ID from auth:** Server compares event.operatorId (client-submitted) against authenticated UID; mismatch or missing auth context → rejected
- ✓ **Account switch with pending local events:** Operator A has 3 pending events; signs out; Operator B signs in → Operator A's pending entries remain in pending_batch_transitions (isolated by accountId), operatorId A's FieldEvents not shown to B, not synced under B's auth
- ✓ **Account switch with in-flight request:** Operator A submits event (POST in progress), server accepts during transmission, A signs out and B signs in before response arrives → response handling deferred, A's event remains accepted on server (receipt linked to A's UID), B does not see A's event, A can recover it by re-logging in
- ✓ **Recovery after logout/login:** Operator A logs out with 3 pending events (1 sending, 2 pending) and 1 in-flight request → signs back in → all 3 local events recovered from IDB, sync resumes for A's auth, in-flight request result recovered from server if available

**Server-Side Transaction Concurrency:**
- ✓ **All reads inside transaction:** When two requests for same batch (revision 12) arrive simultaneously, both enter runTransaction; first reads revision 12, second waits; first updates to 13; second reads 13, detects conflict, aborts
- ✓ **No read-before-tx:** All checks (receipt, batch, revision, permissions) happen inside tx snapshot, not before entering tx
- ✓ **Strict ordering:** Conflicting requests are strictly ordered by Firestore transaction scheduling, preventing lost updates

### 8.2 Unit Tests

**FieldEvent creation & immutability:**
- ✓ Event persisted to IDB before first transmission attempt
- ✓ Event ID generated once (UUID) and frozen
- ✓ Event record is immutable (cannot be edited after creation; new linked event required)

**State machine validation:**
- ✓ Invalid transition rejected (SetasOSWorkflow.assertTransition throws)
- ✓ Valid transitions accepted
- ✓ Role-based actions filtered correctly

**QueueEntry lifecycle:**
- ✓ pending → sending → confirmed (success path)
- ✓ pending → sending → retry_wait → sending → ... (backoff retry)
- ✓ pending → sending → conflict | rejected (terminal)
- ✓ Exponential backoff: 30s, 60s, 120s, 240s, capped at 1 hour
- ✓ Status transitions are legal (no invalid transitions like rejected → pending)

### 8.3 Integration Tests

**Local Persistence:**
- ✓ Confirmation persists FieldEvent, QueueEntry, pending-batch-transition atomically
- ✓ App restart (kill and reopen) recovers pending events without re-creating them
- ✓ Receipts stored after server acceptance; confirmed status persisted
- ✓ IndexedDB quota exceeded during persistence → "Saved" not shown, error message displayed, retry available

**Sync Flow:**
- ✓ Online: event queued, sync triggered immediately, receipt received, status → confirmed
- ✓ Offline: event queued, sync deferred, nextAttemptAt set, status remains pending until online
- ✓ Network timeout mid-send: status remains sending (or retry_wait after max attempts), event not discarded
- ✓ Sync success with receipt: QueueEntry.status → confirmed, batch cache updated with new revision

**Content Comparison (Idempotency):**
- ✓ Submitted event normalized: JSON lexicographic field order, ISO8601 timestamps without microseconds
- ✓ Stored event normalized same way
- ✓ Byte-exact match required for idempotency success
- ✓ Normalization test: two representations of same content (different field order, trailing zeros in timestamp) → recognized as identical

**Multi-Device Conflicts:**
- ✓ Device A submits with revision 12, accepted, batch.revision → 13
- ✓ Device B submits with revision 12, server returns 409 with currentRevision: 13
- ✓ Client receives conflict, QueueEntry.status → conflict, operator sees refresh prompt
- ✓ Operator refreshes, sees revision 13 + fruiting state, can submit new transition

**Recovery Scenarios:**
- ✓ Response lost mid-flight: client retry (same eventId) recovers original receipt from server
- ✓ App killed during send: restart resumes pending queue, no duplicate events created
- ✓ Interrupted IDB transaction: transaction rolled back, "Saved" not shown, draft available for retry
- ✓ Sign-out mid-transaction: IDB cleared for previous account context, no leakage to new account

### 8.4 E2E User Scenarios

1. **Quick online scan & confirm**
   - Scan QR → Action Sheet → Confirm → event sent, receipt received → "Confirmed on server" with revision ✓

2. **Offline scan, queue, auto-sync**
   - Scan QR (offline) → Action Sheet → Confirm → "Saved on this device" (no network attempt) → Reconnect → sync triggered → "Confirmed on server" ✓

3. **Repeated scans (no duplicate events)**
   - Scan → dismiss → scan same QR → open Action Sheet → no new event created (same batch opened again) ✓

4. **Batch detail scan mismatch**
   - Open batch A detail → scan QR for batch B → alert "scanned wrong batch" → [Scan Again] or [Open Batch B] ✓

5. **Stale action sheet**
   - Open action sheet for batch, app backgrounded 30 mins, another device advances batch → return to app, confirm action → revalidation detects state changed → "batch updated, please refresh" ✓

6. **Pending transition arrives with receipt**
   - Confirm transition → show "Pending · Saved locally" → background sync succeeds → "Confirmed on server · Revision 13" ✓

7. **Conflict & recovery**
   - Device A submits first (accepted, rev 13) → Device B gets 409 conflict → B refreshes → sees rev 13 + new state, can submit new transition ✓

8. **Account switch with pending**
   - Sign out with 3 pending → sign in as different user → pending not shown, not synced under new identity ✓

9. **Camera denial & manual entry**
   - Tap scanner → deny permission → "Camera unavailable" → manual "Enter batch code" → same resolution and action flow ✓

---

## 9. Dependencies & Integration Points

### 9.1 Existing Code to Reuse

- **`setas-os-workflow.js`:** `assertTransition()`, `validActions()` — validate state machine edges
- **`batch-traceability.js`:** Batch model, revision tracking — integrate receipt into traceability
- **`simulador-app.jsx`:** React component tree — embed QR scanner, action sheet
- **`navigation-state.js`:** View routing — handle scanner dismissal, state updates
- **Firebase SDK:** Firestore, Auth — for server acceptance & identity

### 9.2 New Modules to Create

- **`field-event-queue.js`** — IndexedDB schema, persistence, recovery
- **`qr-scanner-component.jsx`** — Mobile QR UI (or integrate existing browser API)
- **`offline-sync-engine.js`** — Sync loop, retry backoff, receipt reconciliation
- **`field-action-sheet.jsx`** — Action menu, pending state display, confirmation
- **`field-events-model.js`** — Validation, local caching, idempotency logic

### 9.3 Firestore Rules & Functions

- **Cloud Function:** `acceptFieldEvent()` — transaction handler for event acceptance
- **Firestore Rules:** Auth check, batch access, revision validation

---

## 10. Success Criteria & Acceptance Tests

### 10.1 Functional

- [ ] QR scan resolves batch and opens action sheet
- [ ] State machine validates transitions (reuse SetasOSWorkflow.assertTransition)
- [ ] Operator confirmation persists FieldEvent, QueueEntry, pending-batch-transition atomically to IndexedDB
- [ ] "Saved on this device" shown only after IDB transaction commits
- [ ] Offline events queue and sync when online (automatic)
- [ ] Confirmed state (Current State) never overwritten by pending
- [ ] Pending state shown separately with "Saved on device / Confirmed on server" clarity
- [ ] Revision conflicts detected and reported (409 response handled correctly)
- [ ] Idempotent retries succeed without duplication (same eventId = original receipt returned)
- [ ] Server-side authorization checks operatorId against authenticated UID
- [ ] Account switch clears previous operator's pending events and prevents sync under new identity
- [ ] Camera denial falls back to manual batch code entry with same resolution flow
- [ ] Repeated scans don't create new events (pending-batch-transition prevents it)
- [ ] Content equivalence check normalizes and compares events (field order, timestamp precision)

### 10.2 Non-Functional

- [ ] FieldEvent persisted to IndexedDB before any sync attempt or "saved" feedback
- [ ] Sync completes in background without blocking operator UI
- [ ] Batch list updates within 2 seconds of receipt arrival
- [ ] Pending transitions survive app kill/restart without re-creating duplicates
- [ ] Retry backoff prevents excessive sync attempts (max 1 attempt/30s when offline; exponential backoff 30/60/120/240s)
- [ ] Confirmed transitions remain visible in batch history even if later edits occur
- [ ] Local IDB transaction failure (quota, IDB error) shows operator clear error, doesn't persist "saved" state

### 10.3 Atomicity & Reliability (Critical)

**Local Persistence:**
- [ ] Local commit: FieldEvent + QueueEntry + pending-batch-transition in single IDB transaction
- [ ] IDB transaction failure (quota, error) → "saved" not shown, draft retained for retry
- [ ] Reservation ID is composite: `${accountId}:${batchId}` (prevents cross-account overwrites)
- [ ] Reservation lifecycle: created (on confirm) → released (on confirmed/rejected/conflict resolution)
- [ ] Cross-tab check: second tab attempting same batch gets "another action pending" error

**Server Acceptance (All Reads Inside Transaction):**
- [ ] All validation reads (receipt, batch, revision, permissions) happen inside Firestore transaction
- [ ] Two devices with same revision cannot both succeed (second sees updated revision inside tx)
- [ ] Idempotency check happens first (inside tx): if eventId exists with matching content, return receipt
- [ ] Content normalization: JSON field order, ISO8601 ms precision, excludes receipt field
- [ ] Server commit: Event + batch state + revision + receipt all-or-nothing in single tx
- [ ] No partial acceptance (event written but transition not applied)

**Idempotency & Conflict:**
- [ ] Legitimate retry (same eventId, identical content) → original receipt returned, no duplicate transition
- [ ] Idempotency violation (same eventId, different content) → rejected with error
- [ ] Multi-device: two devices from revision 12, A succeeds (rev→13), B gets 409 with currentRevision: 13
- [ ] Response lost: server accepts, client timeout/disconnect, retry recovers receipt from server
- [ ] Conflict does NOT release reservation (operator must resolve and retry)

**Account Safety & Recovery:**
- [ ] Logout does NOT delete pending events; keeps them isolated by operatorId
- [ ] Login as different operator: see only their own events (filtered by operatorId)
- [ ] Return to original operator: pending events recovered with their status (pending/confirmed/etc.)
- [ ] In-flight request during logout: event may be accepted on server, recovered on re-login
- [ ] No cross-account transmission (event with operatorId=A never synced under operatorId=B auth)

---

## 11. Rollout & Monitoring

### 11.1 Feature Flag

Wrap mobile QR scanner in feature flag (e.g., `enableFieldQRScanner`). Gradual rollout:
1. Internal testing (Setas team only)
2. Beta field test (single room/operator)
3. Full production (all field operators)

### 11.2 Logging & Observability

Log to Firebase Analytics:
- Scanner opened
- QR scan successful / failed
- Event queued / synced / confirmed / rejected
- Retry attempts & backoff
- Conflicts encountered

Monitor:
- Queue depth (pending events per day)
- Sync latency (time from confirmation to receipt)
- Conflict rate (% of events with revision conflicts)
- Offline event success rate (% eventually confirmed)

---

## 12. Future Extensions (v2+)

1. **Attachments (v2)** — photo capture & upload with durable recovery
   - Photo capture UI integrated with action sheet
   - Local binary storage with separate upload lifecycle
   - Server-side attachment association & proof
   - Recovery for interrupted uploads

2. **Batch Scanned Events** — audit trail separate from transitions
   - Record every QR scan (not just action-triggering scans)
   - Allows field auditing: who scanned what and when

3. **Collaborative Conflict UI** — real-time awareness of multi-device changes
   - Show "Device B just updated this batch to X" before confirming action

4. **Bulk Transitions** — scan multiple batches, apply same action to group

5. **Handoff Workflow** — operator A initiates, operator B completes
   - Two-phase operations (start harvest, weigh, finish)
   - Requires more complex state machine & locks

---

## Appendix: Related Files

- `setas-os-workflow.js` — state machine definition
- `batch-traceability.js` — batch model and lifecycle
- `simulador-app.jsx` — React shell
- `navigation-state.js` — URL routing
- Firebase Firestore schema (docs pending)
