'use strict';

/**
 * @file sync-merge.js — Fusión a tres bandas entre el dispositivo y Firestore.
 *
 * Varios dispositivos escriben a la vez (ADR-0009). Cada uno guarda tres
 * versiones de cada documento:
 *
 *   - local:  lo que la app tiene ahora (localStorage);
 *   - base:   la última versión que este dispositivo vio en el servidor;
 *   - remote: lo que el servidor tiene ahora.
 *
 * Comparar local y remote solos no alcanza: si difieren no se sabe quién
 * cambió. Con la base sí: un campo que cambió solo en local se conserva y se
 * envía; uno que cambió solo en remoto se adopta; uno que cambió en ambos es
 * un conflicto y gana local (es lo que el servidor tendrá cuando la cola de
 * este dispositivo se vacíe), salvo que la colección declare un resolvedor.
 *
 * Borrados: el servidor guarda una lápida (`deleted: true`) en vez de borrar
 * el documento, para que los demás dispositivos se enteren. Un documento que
 * desaparece del servidor sin lápida solo se interpreta como borrado si la
 * lectura vino del servidor (no de la caché) y el dispositivo no lo cambió.
 *
 * Lógica pura (patrón UMD de sync-queue.js): sin red, DOM ni localStorage.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // Campos que pone el servidor o la capa de sincronización: nunca son datos
  // del operario y no participan en la comparación.
  const META_FIELDS = Object.freeze(['syncedAt', 'deleted', 'deletedAt']);

  const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

  // Firestore no conserva el orden de las claves de un mapa: sin ordenarlas,
  // el mismo documento parecería cambiado en cada lectura.
  const stableStringify = value => {
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    if (isPlainObject(value)) {
      return '{' + Object.keys(value).filter(k => value[k] !== undefined).sort()
        .map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
    }
    return JSON.stringify(value);
  };

  const sameValue = (a, b) => stableStringify(a) === stableStringify(b);

  const isTombstone = doc => Boolean(doc && doc.deleted === true);

  /** Quita los campos de servidor. Una lápida se devuelve como null. */
  const cleanRemote = doc => {
    if (!doc || isTombstone(doc)) return null;
    const out = {};
    for (const k of Object.keys(doc)) if (!META_FIELDS.includes(k)) out[k] = doc[k];
    return out;
  };

  const comparableKeys = (docs, ignore) => {
    const keys = new Set();
    for (const d of docs) if (d) for (const k of Object.keys(d)) keys.add(k);
    return [...keys].filter(k => !META_FIELDS.includes(k) && !ignore.includes(k));
  };

  const sameDoc = (a, b, ignore = []) =>
    comparableKeys([a, b], ignore).every(k => sameValue(a[k], b[k]));

  /**
   * Fusiona un documento campo por campo. Sin base (primer contacto de este
   * dispositivo con el documento) gana el servidor en cada campo que tenga, y
   * se conservan los campos que solo existen en local: no hay forma de saber
   * si la copia local es más nueva, y el servidor es lo que comparten todos.
   */
  const mergeDoc = ({ local, base, remote, ignore = [], resolvers = {} }) => {
    const out = {};
    const conflicts = [];
    // Campos ignorados (p. ej. la foto de una bolsa, que nunca sube): se
    // conserva la copia local.
    for (const k of ignore) {
      if (local && local[k] !== undefined) out[k] = local[k];
      else if (remote && remote[k] !== undefined) out[k] = remote[k];
    }
    for (const k of comparableKeys([local, base, remote], ignore)) {
      const l = local ? local[k] : undefined;
      const r = remote ? remote[k] : undefined;
      let v;
      if (!base) {
        v = r !== undefined ? r : l;
      } else {
        const b = base[k];
        const localChanged = !sameValue(l, b);
        const remoteChanged = !sameValue(r, b);
        if (!localChanged) v = r;
        else if (!remoteChanged || sameValue(l, r)) v = l;
        else {
          conflicts.push(k);
          v = typeof resolvers[k] === 'function' ? resolvers[k](l, r, b) : l;
        }
      }
      if (v !== undefined) out[k] = v;
    }
    return { doc: out, conflicts };
  };

  /** Campos de `doc` que el servidor (`remote`) todavía no tiene. */
  const diffFields = (doc, remote, ignore = []) => {
    const fields = {};
    for (const k of comparableKeys([doc, remote], ignore)) {
      if (!sameValue(doc[k], remote ? remote[k] : undefined)) {
        // Un campo que desaparece se envía como null: Firestore no tiene
        // "undefined" y un merge sin el campo no lo borraría.
        fields[k] = doc[k] === undefined ? null : doc[k];
      }
    }
    return fields;
  };

  /**
   * Fusiona una colección completa.
   *
   * @param {object} p
   * @param {object[]} p.local     documentos locales (con `id`)
   * @param {object[]} p.base      última versión vista del servidor
   * @param {object[]} p.remote    documentos del servidor, lápidas incluidas
   * @param {boolean}  p.fromCache la lectura vino de la caché de Firestore
   * @param {Set|string[]} p.pendingIds ids con una operación ya encolada
   * @param {object}   [p.spec]    { ignore: string[], resolvers: {campo: fn} }
   * @returns {{ local: object[], base: object[], pushes: object[], removed: string[], conflicts: object[], changed: boolean }}
   *   pushes: { op: 'create'|'update'|'delete', id, doc?, fields? }
   */
  const mergeCollection = ({ local = [], base = [], remote = [], fromCache = false, pendingIds = [], spec = {} } = {}) => {
    const ignore = spec.ignore || [];
    const resolvers = spec.resolvers || {};
    const pending = pendingIds instanceof Set ? pendingIds : new Set(pendingIds || []);
    const byId = rows => new Map((rows || []).filter(r => r && r.id != null).map(r => [String(r.id), r]));
    const L = byId(local);
    const B = byId(base);
    const R = byId(remote);

    const merged = new Map();
    const nextBase = new Map();
    const pushes = [];
    const removed = [];
    const conflicts = [];

    const ids = [...new Set([...L.keys(), ...R.keys(), ...B.keys()])];
    for (const id of ids) {
      const l = L.get(id);
      const b = B.get(id);
      const rawRemote = R.get(id);

      if (isTombstone(rawRemote)) {
        // El borrado gana: cualquier cambio local sobre un documento que otro
        // dispositivo eliminó no tiene dónde vivir.
        if (l) removed.push(id);
        continue;
      }

      const r = cleanRemote(rawRemote);
      if (r) {
        nextBase.set(id, r);
        if (l) {
          const res = mergeDoc({ local: l, base: b, remote: r, ignore, resolvers });
          merged.set(id, res.doc);
          if (res.conflicts.length) conflicts.push({ id, fields: res.conflicts });
          const fields = diffFields(res.doc, r, ignore);
          if (Object.keys(fields).length) pushes.push({ op: 'update', id, fields });
        } else if (b && sameDoc(r, b, ignore)) {
          // Borrado en este dispositivo y nadie más lo tocó: se propaga.
          if (!pending.has(id)) pushes.push({ op: 'delete', id });
        } else {
          // Nuevo en el servidor, o borrado aquí pero cambiado en otro
          // dispositivo: se adopta la versión del servidor.
          merged.set(id, r);
        }
        continue;
      }

      // Sin documento en el servidor.
      if (!l) continue; // ya no existe en ningún lado; la base se descarta
      if (b && !fromCache) {
        if (sameDoc(l, b, ignore)) {
          // Borrado en el servidor sin lápida (registro antiguo) y sin cambios
          // aquí: se acepta el borrado.
          removed.push(id);
          continue;
        }
        // Cambiado aquí después de que desapareció: se recrea.
        merged.set(id, l);
        if (!pending.has(id)) pushes.push({ op: 'create', id, doc: l });
        continue;
      }
      merged.set(id, l);
      if (b) nextBase.set(id, b); // lectura de caché: no se decide nada
      else if (!pending.has(id)) pushes.push({ op: 'create', id, doc: l });
    }

    // Orden: el de la copia local, y después lo que llegó del servidor en el
    // orden en que llegó. Una fila local sin id no se puede sincronizar, pero
    // tampoco se pierde: queda donde estaba.
    const out = [];
    const placed = new Set();
    for (const row of local || []) {
      if (!row || row.id == null) { out.push(row); continue; }
      const id = String(row.id);
      if (placed.has(id) || !merged.has(id)) continue;
      placed.add(id);
      out.push(merged.get(id));
    }
    for (const id of R.keys()) {
      if (placed.has(id) || !merged.has(id)) continue;
      placed.add(id);
      out.push(merged.get(id));
    }
    const changed = out.length !== (local || []).length
      || out.some((doc, i) => !sameValue(doc, local[i]));

    return {
      local: out,
      base: [...nextBase.values()],
      pushes,
      removed,
      conflicts,
      changed,
    };
  };

  // ── Resolvedores reutilizables ──────────────────────────────────────────

  /** Une dos listas de eventos sin duplicar (por `id`, o por contenido). */
  const unionList = (l, r) => {
    const a = Array.isArray(l) ? l : [];
    const b = Array.isArray(r) ? r : [];
    const keyOf = e => (e && e.id != null ? 'id:' + e.id : 'v:' + stableStringify(e));
    const seen = new Set();
    const out = [];
    for (const e of [...b, ...a]) {
      const k = keyOf(e);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(e);
    }
    const at = e => (e && (e.at || e.timestamp || e.fecha)) || '';
    return out.sort((x, y) => String(at(x)).localeCompare(String(at(y))));
  };

  /** Elige el valor con mayor rango (para estados que solo avanzan). */
  const byRank = ranks => (l, r) => ((ranks[r] ?? -1) > (ranks[l] ?? -1) ? r : l);

  const api = {
    META_FIELDS,
    stableStringify,
    sameValue,
    sameDoc,
    isTombstone,
    cleanRemote,
    mergeDoc,
    diffFields,
    mergeCollection,
    unionList,
    byRank,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasSyncMerge = api;
})();
