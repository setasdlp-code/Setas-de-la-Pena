import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';

export const MAX_PHOTO_BYTES = 5_000_000;

// Signatures sniffed from the actual bytes, not trusted from the client-supplied
// MIME type or filename extension.
const SIGNATURES = [
  { ext: 'jpg', mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff] },
  { ext: 'png', mime: 'image/png', magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: 'webp', mime: 'image/webp', magic: [0x52, 0x49, 0x46, 0x46], offsetCheck: (buffer) => (
    buffer.length > 12 && buffer.toString('ascii', 8, 12) === 'WEBP'
  ) }
];

const sniff = (buffer) => {
  for (const signature of SIGNATURES) {
    const matches = signature.magic.every((byte, index) => buffer[index] === byte);
    if (matches && (!signature.offsetCheck || signature.offsetCheck(buffer))) return signature;
  }
  return null;
};

const decodeDataUrl = (input) => {
  const match = /^data:([-\w./+]+);base64,(.+)$/.exec(input);
  const base64 = match ? match[2] : input;
  try {
    return Buffer.from(base64, 'base64');
  } catch (_) {
    throw Object.assign(new TypeError('Contenido base64 inválido.'), { statusCode: 400 });
  }
};

export const createPhotoStore = (photosDir) => {
  const absoluteDir = resolve(photosDir);

  return {
    async save(dataUrlOrBase64, { containerHint } = {}) {
      const buffer = decodeDataUrl(String(dataUrlOrBase64 || ''));
      if (buffer.length === 0) {
        throw Object.assign(new TypeError('Foto vacía.'), { statusCode: 400 });
      }
      if (buffer.length > MAX_PHOTO_BYTES) {
        throw Object.assign(new TypeError('Foto demasiado grande (máx. 5MB).'), { statusCode: 413 });
      }
      const signature = sniff(buffer);
      if (!signature) {
        throw Object.assign(new TypeError('Formato de imagen no soportado (solo JPEG/PNG/WebP).'), { statusCode: 415 });
      }
      const safeHint = typeof containerHint === 'string' && /^[a-zA-Z0-9-]{1,40}$/.test(containerHint)
        ? `${containerHint}-`
        : '';
      const datePrefix = new Date().toISOString().slice(0, 10);
      const filename = `${datePrefix}-${safeHint}${randomUUID()}.${signature.ext}`;
      await mkdir(absoluteDir, { recursive: true });
      await writeFile(resolve(absoluteDir, filename), buffer, { mode: 0o600 });
      return { photoRef: filename, mime: signature.mime, bytes: buffer.length };
    },

    resolvePath(filename) {
      if (typeof filename !== 'string' || !/^[a-zA-Z0-9._-]+$/.test(filename)) return null;
      const filePath = resolve(absoluteDir, filename);
      if (!filePath.startsWith(`${absoluteDir}${sep}`)) return null;
      return filePath;
    },

    async read(filename) {
      const filePath = this.resolvePath(filename);
      if (!filePath) throw Object.assign(new Error('Nombre inválido.'), { code: 'ENOENT' });
      return readFile(filePath);
    }
  };
};
