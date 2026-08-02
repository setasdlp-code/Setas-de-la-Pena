import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

// Inventory is current-state, not append-only history (DATA_MODEL §2.17,
// MODULE_MAP §5.3): a stock quantity is overwritten in place by the latest
// count, unlike the ledger, which never overwrites. Each item's `status` is
// always derived (cantidad <= minimo), never stored, so it can't drift out
// of sync with the numbers that produced it.

const LOTE_ID = /^[A-Za-z0-9][A-Za-z0-9-]{0,39}$/;
const MAX_TEXT_LENGTH = 200;

const isNonEmptyText = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TEXT_LENGTH;

const deriveStatus = (item) => (item.cantidad <= item.minimo ? 'Reponer' : 'OK');

export const validateItemInput = (candidate) => {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new TypeError('El ítem debe ser un objeto.');
  }
  if (typeof candidate.lote !== 'string' || !LOTE_ID.test(candidate.lote)) {
    throw new TypeError('lote inválido.');
  }
  if (!isNonEmptyText(candidate.insumo)) throw new TypeError('insumo requerido.');
  if (!isNonEmptyText(candidate.unidad)) throw new TypeError('unidad requerida.');
  if (typeof candidate.cantidad !== 'number' || !Number.isFinite(candidate.cantidad) || candidate.cantidad < 0) {
    throw new TypeError('cantidad inválida.');
  }
  if (typeof candidate.minimo !== 'number' || !Number.isFinite(candidate.minimo) || candidate.minimo < 0) {
    throw new TypeError('minimo inválido.');
  }
  return {
    lote: candidate.lote,
    insumo: candidate.insumo,
    unidad: candidate.unidad,
    cantidad: candidate.cantidad,
    minimo: candidate.minimo
  };
};

const withStatus = (item) => ({ ...item, status: deriveStatus(item) });

export const createInventoryStore = async (inventoryPath) => {
  const absolutePath = resolve(inventoryPath);
  const backupPath = `${absolutePath}.backup`;
  let items = new Map();
  let writeQueue = Promise.resolve();

  try {
    const parsed = JSON.parse(await readFile(absolutePath, 'utf8'));
    for (const raw of Array.isArray(parsed.items) ? parsed.items : []) {
      try {
        const validated = validateItemInput(raw);
        items.set(validated.lote, validated);
      } catch (_) {
        // Skip a corrupted record rather than fail startup entirely.
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const persist = async () => {
    const snapshot = JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      items: [...items.values()]
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
      return [...items.values()].map(withStatus);
    },
    async upsert(input) {
      const validated = validateItemInput(input);
      items.set(validated.lote, validated);
      await persist();
      return withStatus(validated);
    },
    async remove(lote) {
      if (typeof lote !== 'string' || !LOTE_ID.test(lote)) {
        throw Object.assign(new TypeError('lote inválido.'), { statusCode: 400 });
      }
      const existed = items.delete(lote);
      if (existed) await persist();
      return existed;
    },
    async flush() {
      await writeQueue;
    }
  };
};
