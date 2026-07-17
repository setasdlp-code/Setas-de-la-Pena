import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const ALLOWED_KEY = /^(sdp_|setas_|sim_)[a-z0-9_:-]+$/i;
const MAX_VALUE_LENGTH = 1_000_000;

export const validateEntries = (candidate) => {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new TypeError('entries debe ser un objeto.');
  }
  const normalized = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (!ALLOWED_KEY.test(key)) throw new TypeError(`Clave no permitida: ${key}`);
    if (typeof value !== 'string') throw new TypeError(`El valor de ${key} debe ser texto.`);
    if (value.length > MAX_VALUE_LENGTH) throw new TypeError(`El valor de ${key} excede el límite.`);
    normalized[key] = value;
  }
  return normalized;
};

export const createStateStore = async (statePath) => {
  const absolutePath = resolve(statePath);
  const backupPath = `${absolutePath}.backup`;
  let entries = {};
  let writeQueue = Promise.resolve();

  try {
    const parsed = JSON.parse(await readFile(absolutePath, 'utf8'));
    entries = validateEntries(parsed.entries || {});
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const persist = async () => {
    const snapshot = JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      entries
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
    snapshot() {
      return { ...entries };
    },
    async replace(nextEntries) {
      entries = validateEntries(nextEntries);
      await persist();
      return this.snapshot();
    },
    async flush() {
      await writeQueue;
    }
  };
};
