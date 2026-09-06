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

Proves the server accepted the event and applied the batch change. Returned by server; stored locally to prove idempotency.

```typescript
interface AuthorizationReceipt {
  eventId: string;               // Which event this receipt authorizes
  acceptedAt: ISO8601;           // Server's timestamp
  batchRevision: number;         // New revision after transition applied
  
  // Optional fields for future extensibility
  appliedAt?: ISO8601;           // If different from acceptedAt
  proof?: string;                // e.g., Firestore document reference
}
```

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
3. Persist both to IndexedDB atomically
4. Persist attachments with stable `id`, `localBlobKey`
5. Only then show "Saved on this device" + optimistic UI
6. Trigger background sync (see §4)

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
  keyPath: "batchId"
  // Ensures max one pending transition per batch per device
  // Structure: { batchId, eventId, reservedAt, accountId }
  indexes: [
    { name: "accountId", keyPath: "accountId" },
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
  const tx = db.transaction(
    ["field_events", "queue_entries", "pending_batch_transitions"],
    "readwrite"
  );
  
  // Check: no other pending transition for this batch
  const existing = await tx.objectStore("pending_batch_transitions")
    .get(event.batchId);
  if (existing && existing.accountId === accountId) {
    throw new Error("batch_already_has_pending_transition");
  }
  
  // Write all-or-nothing
  await tx.objectStore("field_events").add(event);
  await tx.objectStore("queue_entries").add(queueEntry);
  await tx.objectStore("pending_batch_transitions").put({
    batchId: event.batchId,
    eventId: event.id,
    reservedAt: new Date().toISOString(),
    accountId,
  });
  
  await tx.done;
  // Only now: show "Saved on this device"
}
```

**Cross-Tab Enforcement:**
The `pending_batch_transitions` store is checked on every action-sheet confirmation, across all tabs sharing the same IndexedDB. If another tab (same browser, same account) already has a pending transition for this batch, the new confirmation is rejected with "Another action is pending for this batch."

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
4. Fetch FieldEvent and Attachments
5. POST /api/field-events (Firestore transaction)
   {
     event: FieldEvent,
     expectedBatchRevision: event.expectedBatchRevision,
     attachmentIds: event.attachmentIds
   }
6. If success:
   - Store AuthorizationReceipt
   - Set QueueEntry.status ← confirmed
   - Update local batch cache with new revision
   - Mark attachments as confirmed (or pending if not included in response)
7. If failure:
   - If "idempotency: already accepted" → recover receipt, set confirmed
   - If "revision conflict" → set status ← conflict, wait for operator review
   - If "authorization denied" or "validation failed" → set status ← rejected
   - If "network/timeout" → set status ← retry_wait, backoff
8. Persist updated QueueEntry & receipts to IndexedDB
```

### 4.3 Idempotency & Conflict Resolution

**Server Acceptance Order (Cloud Function `acceptFieldEvent`):**

```javascript
// Executor: Cloud Function, triggered by POST /api/field-events
// Input: { event, expectedBatchRevision, attachmentIds }
// Output: { receipt } or error with specific code

async function acceptFieldEvent(event, expectedBatchRevision, attachmentIds) {
  // Validate input
  if (!event.id || event.type !== "batch_state_transition") {
    throw new Error("invalid_event_structure");
  }
  if (attachmentIds && attachmentIds.length > 0) {
    throw new Error("attachments_not_supported_in_v1");
  }

  // 1. Authenticate: event.operatorId must match authenticated user
  const authUser = context.auth.uid;
  if (event.operatorId !== authUser) {
    throw new Error("operator_id_mismatch_with_auth");
  }

  // 2. Look for existing receipt (idempotency check)
  const existingReceipt = await db.doc(`field-events/${event.id}/receipt`).get();
  if (existingReceipt.exists) {
    // Compare content
    const storedEvent = await db.doc(`field-events/${event.id}`).get();
    if (contentEquals(event, storedEvent.data())) {
      return existingReceipt.data();  // Legitimate retry: return original receipt
    } else {
      throw new Error("idempotency_violation: same ID, different content");
    }
  }

  // 3. Fetch batch, verify revision, and check permissions
  const batchDoc = await db.doc(`batches/${event.batchId}`).get();
  const batch = batchDoc.data();
  
  if (!batch) {
    throw new Error("batch_not_found");
  }
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
  const operatorRole = await getOperatorRole(event.operatorId);
  if (!canPerformAction(operatorRole, event.payload.to)) {
    throw new Error("unauthorized_action", {
      action: event.payload.to,
      role: operatorRole,
    });
  }

  // 6. Atomic transaction: apply transition + create receipt
  try {
    await db.runTransaction(async (tx) => {
      // Write immutable event record
      await tx.set(db.doc(`field-events/${event.id}`), event);

      // Update batch state and revision atomically
      const newRevision = batch.revision + 1;
      await tx.update(db.doc(`batches/${event.batchId}`), {
        state: event.payload.to,
        revision: newRevision,
        updatedAt: serverTimestamp(),
        stateHistory: batch.stateHistory || []
          .concat([{
            state: event.payload.to,
            revision: newRevision,
            acceptedAt: serverTimestamp(),
            eventId: event.id,
          }]),
      });

      // Create receipt (proof of acceptance)
      const receipt = {
        eventId: event.id,
        acceptedAt: serverTimestamp(),
        batchRevision: newRevision,
      };
      await tx.set(db.doc(`field-events/${event.id}/receipt`), receipt);
    });
  } catch (err) {
    throw new Error("transaction_failed", { cause: err.message });
  }

  return { receipt: { eventId, acceptedAt, batchRevision } };
}

// Helper: normalized content comparison
function contentEquals(submitted, stored) {
  const normalize = (obj) => JSON.stringify({
    eventId: obj.eventId,
    type: obj.type,
    batchId: obj.batchId,
    expectedBatchRevision: obj.expectedBatchRevision,
    occurredAt: obj.occurredAt,
    operatorId: obj.operatorId,
    source: obj.source,
    payload: obj.payload,
    attachmentIds: obj.attachmentIds || [],
  });
  return normalize(submitted) === normalize(stored);
}
```

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
1. On sign-out, query `pending_batch_transitions` for accountId = A's UID
2. Delete those entries and any associated FieldEvents, QueueEntries
3. On sign-in as Operator B, Operator A's pending events do not appear
4. Show: "X local events from [account name] discarded" (or offer temporary preservation if A logs back in within session)

**Test:** Account switch with pending local events; no transmission under B's identity.

**Scenario B (Request In-Flight):** Operator A submits event (POST in progress); connection is good; during wait for response, A signs out and B signs in.

**Resolution:**
1. The POST may still succeed on the server (event accepted, receipt created)
2. Client-side cancellation of pending XHR does not affect server acceptance
3. On sign-in as Operator B, B must not see or sync Operator A's accepted event
4. If response finally arrives and is cached (due to Service Worker or retry), it is discarded when the IndexedDB account context changes
5. Operator A can recover the event by signing back in (if it's still in the queue or if receipt recovery is implemented)
6. For v1, document this edge case and warn operators not to sign out mid-sync

**Test:** Request in-flight, account switches before response arrives; event accepted on server but not attributed to B; A can recover on re-login or event remains orphaned until cleanup.

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
- ✓ **Account switch with pending local events:** Operator A has 3 pending events; signs out; Operator B signs in → Operator A's pending entries deleted from pending_batch_transitions, operatorId A's FieldEvents not synced under B's auth
- ✓ **Account switch with in-flight request:** Operator A submits event (POST in progress), server accepts during transmission, A signs out and B signs in before response arrives → response is discarded (IDB account context changed), A's event remains accepted on server but not synced under B; A can recover by re-logging in or event is cleaned up after retention period

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

- [ ] Local commit: FieldEvent + QueueEntry + pending-batch-transition in single transaction
- [ ] Server commit: Event + batch state + revision + receipt in single Firestore transaction
- [ ] No partial acceptance (event record exists but transition not applied, or vice versa)
- [ ] Idempotency: legitimate retry (same eventId, same content) returns original receipt
- [ ] Idempotency violation: same eventId, different content → rejected
- [ ] Multi-device: two devices from same revision, one succeeds, other gets conflict
- [ ] Response lost: server accepts, client timeout/disconnect, retry recovers receipt
- [ ] Account switch: in-flight request still accepted on server but not synced under new identity

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
