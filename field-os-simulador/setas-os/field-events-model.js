'use strict';

const { v4: uuidv4 } = require('uuid');
const SetasOSWorkflow = require('./setas-os-workflow.js');

function createFieldEvent(batchId, from, to, operatorId, occurredAt) {
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

function canonicalizeTimestamp(ts) {
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

function contentEquals(submitted, stored) {
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

function validateTransition(batch, from, to, operatorRole = 'standard') {
  // Validate from state matches batch's current state
  if (from !== batch.state) {
    throw new Error(`invalid_state_transition: batch is currently in ${batch.state}, not ${from}`);
  }

  // Validate transition is allowed by state machine
  if (!SetasOSWorkflow.canTransition(from, to)) {
    throw new Error(`invalid_state_transition: ${from} → ${to} is not allowed`);
  }

  // Validate operator can perform advance_stage action (enables state transitions)
  const validActions = SetasOSWorkflow.validActions(batch.state, operatorRole);
  if (!validActions.includes('advance_stage')) {
    throw new Error(`unauthorized_action: role ${operatorRole} cannot advance batch state from ${from}`);
  }

  return true;
}

module.exports = {
  createFieldEvent,
  canonicalizeTimestamp,
  contentEquals,
  validateTransition,
};
