import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const EVENT_TYPES = new Set(['registro', 'cosecha', 'observacion', 'evento_rapido', 'anulacion']);
const QUICK_SUBTYPES = new Set(['traslado', 'contaminacion', 'marca', 'descarte']);
const CONTAINER_ID = /^C-\d{1,6}$/;
const MAX_NOTE_LENGTH = 4_000;
const MAX_CONTAINERS_PER_EVENT = 200;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateContainerIds = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_CONTAINERS_PER_EVENT) {
    throw new TypeError('container_ids debe ser una lista no vacía.');
  }
  for (const id of ids) {
    if (typeof id !== 'string' || !CONTAINER_ID.test(id)) {
      throw new TypeError(`ID de contenedor inválido: ${id}`);
    }
  }
  return [...ids];
};

const validateNote = (nota) => {
  if (nota === undefined || nota === null) return '';
  if (typeof nota !== 'string' || nota.length > MAX_NOTE_LENGTH) {
    throw new TypeError('nota inválida.');
  }
  return nota;
};

const validatePhotoRef = (photoRef) => {
  if (photoRef === undefined || photoRef === null) return null;
  if (typeof photoRef !== 'string' || !/^[a-zA-Z0-9._-]+$/.test(photoRef)) {
    throw new TypeError('photo_ref inválido.');
  }
  return photoRef;
};

const validatePayload = (type, payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('payload debe ser un objeto.');
  }

  if (type === 'registro') {
    if (!isNonEmptyString(payload.especie)) throw new TypeError('especie requerida.');
    if (!Number.isInteger(payload.count) || payload.count < 1 || payload.count > 500) {
      throw new TypeError('count inválido.');
    }
    return {
      especie: payload.especie,
      receta_ref: payload.receta_ref ?? null,
      count: payload.count
    };
  }

  if (type === 'cosecha') {
    if (typeof payload.container_id !== 'string' || !CONTAINER_ID.test(payload.container_id)) {
      throw new TypeError('container_id inválido.');
    }
    if (typeof payload.peso_g !== 'number' || !Number.isFinite(payload.peso_g) || payload.peso_g < 0) {
      throw new TypeError('peso_g inválido.');
    }
    if (!isNonEmptyString(payload.destino)) throw new TypeError('destino requerido.');
    return {
      container_id: payload.container_id,
      peso_g: payload.peso_g,
      destino: payload.destino,
      cierre: Boolean(payload.cierre)
    };
  }

  if (type === 'observacion') {
    return {
      container_ids: validateContainerIds(payload.container_ids),
      tags: Array.isArray(payload.tags) ? payload.tags.filter((tag) => typeof tag === 'string').slice(0, 20) : [],
      nota: validateNote(payload.nota),
      photo_ref: validatePhotoRef(payload.photo_ref)
    };
  }

  if (type === 'evento_rapido') {
    if (!QUICK_SUBTYPES.has(payload.subtype)) throw new TypeError('subtype inválido.');
    if (payload.subtype === 'contaminacion' && !isNonEmptyString(payload.causa_raiz)) {
      throw new TypeError('causa_raiz requerida para contaminación.');
    }
    return {
      container_ids: validateContainerIds(payload.container_ids),
      subtype: payload.subtype,
      causa_raiz: payload.causa_raiz ?? null,
      nota: validateNote(payload.nota),
      photo_ref: validatePhotoRef(payload.photo_ref)
    };
  }

  if (type === 'anulacion') {
    if (!isNonEmptyString(payload.ref_event_id)) throw new TypeError('ref_event_id requerido.');
    return { ref_event_id: payload.ref_event_id };
  }

  throw new TypeError(`type desconocido: ${type}`);
};

export const validateEventInput = (candidate) => {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new TypeError('El evento debe ser un objeto.');
  }
  if (!EVENT_TYPES.has(candidate.type)) throw new TypeError('type inválido.');
  if (!isNonEmptyString(candidate.operator)) throw new TypeError('operator requerido.');
  return {
    type: candidate.type,
    operator: candidate.operator,
    payload: validatePayload(candidate.type, candidate.payload)
  };
};

export const createLedgerStore = async (ledgerPath) => {
  const absolutePath = resolve(ledgerPath);
  const backupPath = `${absolutePath}.backup`;
  let events = [];
  let writeQueue = Promise.resolve();

  try {
    const parsed = JSON.parse(await readFile(absolutePath, 'utf8'));
    events = Array.isArray(parsed.events) ? parsed.events : [];
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const persist = async () => {
    const snapshot = JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      events
    }, null, 2);
    const temporaryPath = `${absolutePath}.${process.pid}.tmp`;

    writeQueue = writeQueue.then(async () => {
      await mkdir(dirname(absolutePath), { recursive: true });
      try {
        await copyFile(absolutePath, backupPath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      await writeFile(temporaryPath, snapshot, { encoding: 'utf8', mode: 0o600 });
      await rename(temporaryPath, absolutePath);
    });
    await writeQueue;
  };

  return {
    all() {
      return [...events];
    },
    // Append-only: never mutates or removes prior entries (INV-3). A correction
    // is recorded as a new 'anulacion' event referencing the one it corrects,
    // never a delete or rewrite of the original.
    async append(input) {
      const validated = validateEventInput(input);
      const event = {
        id: randomUUID(),
        ts: new Date().toISOString(),
        ...validated
      };
      events = [...events, event];
      await persist();
      return event;
    },
    async flush() {
      await writeQueue;
    }
  };
};
