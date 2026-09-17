'use strict';

/**
 * @file trace-identity.js
 * Módulo puro y determinista de resolución semántica de identidad para códigos
 * QR, etiquetas físicas, URLs de trazabilidad y deep-links en Setas de la Peña.
 *
 * Invariante: no accede a DOM, Firestore, localStorage ni estado React.
 * Convierte cualquier entrada admisible en un único objeto canónico uniforme.
 */

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SetasTraceIdentity = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  // Patrones canónicos de sintaxis
  const CRATE_CODE_REGEX = /^CAN-(\d{1,4})$/i;
  const BAG_CODE_REGEX = /^([A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*)-B(\d{1,4})$/i;
  const BATCH_CODE_REGEX = /^[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*$/;
  const HISTORICAL_HARVEST_REGEX = /^CAN-(.+?)-(?:F|FLUSH)(\d{1,3})$/i;

  const INVALID_CHARS_REGEX = /[<>"'\\`\s\u0000-\u001F\u007F]/;

  const INTENT_PARAM_KEYS = Object.freeze({
    crate: ['crate', 'canastilla'],
    batch: ['lote', 'batch'],
    bag: ['bolsa', 'bag'],
    generic: ['codigo', 'code', 'c', 'id']
  });

  function emptyResult(raw, kind = 'unknown', valid = false, reason = null, intent = null) {
    return Object.freeze({
      kind,
      intent,
      batchCode: null,
      bagCode: null,
      bagNumber: null,
      crateCode: null,
      flush: null,
      raw: raw == null ? '' : String(raw),
      valid,
      reason
    });
  }

  function safeDecode(val) {
    if (typeof val !== 'string') return '';
    try {
      return decodeURIComponent(val.replace(/\+/g, ' ')).trim();
    } catch (_) {
      return val.trim();
    }
  }

  function parseQueryParams(queryStr) {
    const params = Object.create(null);
    if (!queryStr) return params;

    const clean = queryStr.startsWith('?') ? queryStr.slice(1) : queryStr;
    const pairs = clean.split(/[&;]/);
    for (const pair of pairs) {
      if (!pair) continue;
      const eq = pair.indexOf('=');
      if (eq < 0) {
        const key = safeDecode(pair).toLowerCase();
        if (key && !(key in params)) params[key] = '';
        continue;
      }
      const key = safeDecode(pair.slice(0, eq)).toLowerCase();
      const val = safeDecode(pair.slice(eq + 1));
      if (key && !(key in params)) {
        params[key] = val;
      }
    }
    return params;
  }

  /**
   * Resuelve cualquier representación (texto crudo, URL, JSON, query params) a
   * una identidad semántica uniforme y canónica.
   *
   * @param {string|object} rawInput
   * @returns {{
   *   kind: 'batch'|'bag'|'flush'|'crate'|'unknown',
   *   batchCode: string|null,
   *   bagCode: string|null,
   *   bagNumber: number|null,
   *   crateCode: string|null,
   *   flush: number|null,
   *   raw: string,
   *   valid: boolean,
   *   reason: string|null
   * }}
   */
  function resolveTraceIdentity(rawInput) {
    if (rawInput == null) {
      return emptyResult(rawInput, 'unknown', false, 'empty_payload');
    }

    let raw = '';
    if (typeof rawInput === 'object' && rawInput !== null) {
      raw = rawInput.href || ((rawInput.pathname || '') + (rawInput.search || ''));
      if (!raw && rawInput.search) raw = rawInput.search;
    } else {
      raw = String(rawInput).trim();
    }

    if (!raw) {
      return emptyResult(rawInput, 'unknown', false, 'empty_payload');
    }

    let candidate = raw;
    let explicitIntent = null; // 'crate' | 'batch' | 'bag' | null
    let queryParams = Object.create(null);
    let rawFlushVal = null;
    let explicitBolsaParam = null;

    // 1. JSON Payloads
    if (candidate.startsWith('{')) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed.crate) {
          candidate = String(parsed.crate);
          explicitIntent = 'crate';
        } else if (parsed.bag || parsed.bolsa) {
          candidate = String(parsed.bag || parsed.bolsa);
          explicitIntent = 'bag';
        } else if (parsed.batch || parsed.batchCode) {
          candidate = String(parsed.batch || parsed.batchCode);
          explicitIntent = 'batch';
        } else if (parsed.codigo || parsed.id) {
          candidate = String(parsed.codigo || parsed.id);
        }
        if (parsed.flush != null) {
          rawFlushVal = String(parsed.flush);
        }
      } catch (_) {
        // no es JSON válido, continúa como cadena de texto
      }
    }

    // 2. Esquemas explícitos (setas:crate:, setas:lote:, setas:bag:, SDP-CERT-)
    if (/^setas:crate:/i.test(candidate)) {
      explicitIntent = 'crate';
      candidate = candidate.replace(/^setas:crate:/i, '').trim();
    } else if (/^setas:(?:lote):|^SDP-CERT-/i.test(candidate)) {
      explicitIntent = 'batch';
      candidate = candidate.replace(/^(?:setas:lote:|SDP-CERT-)/i, '').trim();
    } else if (/^setas:(?:bag|bolsa):/i.test(candidate)) {
      explicitIntent = 'bag';
      candidate = candidate.replace(/^setas:(?:bag|bolsa):/i, '').trim();
    }

    // 3. URLs, rutas y Query Strings
    if (/[:/?#]/.test(candidate)) {
      const [beforeHash, ...hashRest] = candidate.split('#');
      const queryAt = beforeHash.indexOf('?');
      const pathPart = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;
      const queryStr = queryAt >= 0 ? beforeHash.slice(queryAt + 1) : '';
      const fullQueryStr = [queryStr, hashRest.join('#')].filter(Boolean).join('&');

      queryParams = parseQueryParams(fullQueryStr);

      if (queryParams.flush != null && queryParams.flush !== '') {
        rawFlushVal = queryParams.flush;
      }

      // Extracción de parámetros según intención
      const crateParamKey = INTENT_PARAM_KEYS.crate.find(k => k in queryParams && queryParams[k] !== '');
      const batchParamKey = INTENT_PARAM_KEYS.batch.find(k => k in queryParams && queryParams[k] !== '');
      const bagParamKey = INTENT_PARAM_KEYS.bag.find(k => k in queryParams && queryParams[k] !== '');
      const genericParamKey = INTENT_PARAM_KEYS.generic.find(k => k in queryParams && queryParams[k] !== '');

      const crateVal = crateParamKey ? queryParams[crateParamKey] : null;
      const batchVal = batchParamKey ? queryParams[batchParamKey] : null;
      const bagVal = bagParamKey ? queryParams[bagParamKey] : null;
      const genericVal = genericParamKey ? queryParams[genericParamKey] : null;

      if (bagVal) explicitBolsaParam = bagVal;

      // DETECCIÓN DE CONFLICTOS / AMBIGÜEDAD DE PARÁMETROS
      // A) Conflicto entre crate y lote/bolsa/genérico
      if (crateVal) {
        if (batchVal && crateVal.toUpperCase() !== batchVal.toUpperCase()) {
          return emptyResult(raw, 'unknown', false, 'ambiguous-target');
        }
        if (bagVal) {
          return emptyResult(raw, 'unknown', false, 'ambiguous-target');
        }
        if (genericVal && crateVal.toUpperCase() !== genericVal.toUpperCase()) {
          return emptyResult(raw, 'unknown', false, 'ambiguous-target');
        }
        if (rawFlushVal != null) {
          // Una canastilla física no tiene oleadas/flushes de cultivo
          return emptyResult(raw, 'unknown', false, 'ambiguous-target');
        }
        candidate = crateVal;
        explicitIntent = 'crate';
      } else if (batchVal && genericVal && batchVal.toUpperCase() !== genericVal.toUpperCase()) {
        // Conflicto de lote vs codigo contradictorio
        return emptyResult(raw, 'unknown', false, 'ambiguous-target');
      } else if (batchVal) {
        candidate = batchVal;
        if (!explicitIntent) explicitIntent = 'batch';
      } else if (genericVal) {
        candidate = genericVal;
      } else if (pathPart) {
        // Si la entrada contiene caracteres inválidos peligrosos (<>"'` etc.), no los descartemos como URL vacía
        if (INVALID_CHARS_REGEX.test(pathPart)) {
          return emptyResult(raw, 'unknown', false, 'invalid-characters');
        }
        // Sin query params reconocidos, extraer de ruta sólo si tiene prefijo explícito de trazabilidad
        // (/trace/<codigo>, /c/<codigo>, /lote/<codigo>, /batch/<codigo>)
        // Evita interpretar segmentos raíz como el nombre del repo (ej: /Setas-de-la-Pena/) como lote.
        const segments = pathPart.split('/').filter(Boolean);
        const TRACE_PREFIXES = new Set(['trace', 'c', 'lote', 'batch', 'qr']);
        candidate = '';
        for (let i = 0; i < segments.length - 1; i++) {
          const seg = safeDecode(segments[i]).toLowerCase();
          if (TRACE_PREFIXES.has(seg)) {
            const nextSeg = safeDecode(segments[i + 1]);
            if (nextSeg && !nextSeg.endsWith('.html') && !nextSeg.endsWith('.dc')) {
              candidate = nextSeg;
              break;
            }
          }
        }
      }
    }

    candidate = candidate.trim();
    if (!candidate) {
      return emptyResult(raw, 'unknown', false, 'empty_payload');
    }

    // 4. Validación de Caracteres y Longitud
    if (candidate.length > 64 || INVALID_CHARS_REGEX.test(candidate)) {
      return emptyResult(raw, 'unknown', false, 'invalid-characters');
    }

    // 5. Validación de Flush si está presente
    let flushNum = null;
    if (rawFlushVal != null) {
      const parsedFlush = Number(rawFlushVal);
      if (!Number.isInteger(parsedFlush) || parsedFlush < 1 || parsedFlush > 100) {
        return emptyResult(raw, 'unknown', false, 'invalid-flush');
      }
      flushNum = parsedFlush;
    }

    // 6. Entregas Históricas (CAN-<lote>-F<flush> o CAN-<lote>-FLUSH<flush>)
    const histMatch = candidate.match(HISTORICAL_HARVEST_REGEX);
    if (histMatch) {
      const parentCode = histMatch[1].trim();
      const histFlush = parseInt(histMatch[2], 10);
      if (histFlush < 1 || histFlush > 100) {
        return emptyResult(raw, 'unknown', false, 'invalid-flush');
      }
      return Object.freeze({
        kind: 'flush',
        intent: 'flush',
        batchCode: parentCode,
        bagCode: null,
        bagNumber: null,
        crateCode: null,
        flush: histFlush,
        raw,
        valid: true,
        reason: null
      });
    }

    // 7. Resolución de Canastillas (CAN-01 a CAN-9999)
    const crateMatch = candidate.match(CRATE_CODE_REGEX);
    if (explicitIntent === 'crate' || (!explicitIntent && crateMatch)) {
      if (!crateMatch) {
        return emptyResult(raw, 'unknown', false, 'invalid-crate-code', explicitIntent);
      }
      const num = parseInt(crateMatch[1], 10);
      if (num === 0) {
        return emptyResult(raw, 'unknown', false, 'invalid-crate-code', explicitIntent);
      }
      const canonicalCrateCode = 'CAN-' + String(num).padStart(2, '0');
      return Object.freeze({
        kind: 'crate',
        intent: explicitIntent,
        batchCode: null,
        bagCode: null,
        bagNumber: null,
        crateCode: canonicalCrateCode,
        flush: null,
        raw,
        valid: true,
        reason: null
      });
    }

    // 8. Resolución de Bolsa
    // Caso A: el candidato ya incluye el sufijo canónico -B<num>
    const bagMatch = candidate.match(BAG_CODE_REGEX);
    if (bagMatch) {
      const parentCode = bagMatch[1];
      const parsedBagNum = parseInt(bagMatch[2], 10);
      if (parsedBagNum === 0) {
        return emptyResult(raw, 'unknown', false, 'invalid-bag-number', explicitIntent);
      }

      // Si además venía explicitBolsaParam, verificar que no contradiga
      if (explicitBolsaParam) {
        const explicitNumMatch = explicitBolsaParam.match(/^(?:B)?(\d{1,4})$/i);
        if (explicitNumMatch && parseInt(explicitNumMatch[1], 10) !== parsedBagNum) {
          return emptyResult(raw, 'unknown', false, 'ambiguous-target', explicitIntent);
        }
      }

      const canonicalBagCode = parentCode + '-B' + String(parsedBagNum).padStart(2, '0');
      return Object.freeze({
        kind: 'bag',
        intent: explicitIntent,
        batchCode: parentCode,
        bagCode: canonicalBagCode,
        bagNumber: parsedBagNum,
        crateCode: null,
        flush: flushNum,
        raw,
        valid: true,
        reason: null
      });
    }

    // Caso B: candidate es el lote, y explicitBolsaParam especifica la bolsa (corta 'B02'/'2' o completa '<lote>-B02')
    if (explicitBolsaParam) {
      let parsedBagNum = null;
      const fullBagMatch = explicitBolsaParam.match(BAG_CODE_REGEX);
      if (fullBagMatch) {
        if (fullBagMatch[1].toUpperCase() !== candidate.toUpperCase()) {
          return emptyResult(raw, 'unknown', false, 'ambiguous-target', explicitIntent);
        }
        parsedBagNum = parseInt(fullBagMatch[2], 10);
      } else {
        const shortMatch = explicitBolsaParam.match(/^(?:B)?(\d{1,4})$/i);
        if (shortMatch) {
          parsedBagNum = parseInt(shortMatch[1], 10);
        }
      }

      if (!parsedBagNum) {
        return emptyResult(raw, 'unknown', false, 'invalid-bag-code', explicitIntent);
      }
      if (parsedBagNum === 0) {
        return emptyResult(raw, 'unknown', false, 'invalid-bag-number', explicitIntent);
      }
      const canonicalBagCode = candidate + '-B' + String(parsedBagNum).padStart(2, '0');
      return Object.freeze({
        kind: 'bag',
        intent: explicitIntent || 'bag',
        batchCode: candidate,
        bagCode: canonicalBagCode,
        bagNumber: parsedBagNum,
        crateCode: null,
        flush: flushNum,
        raw,
        valid: true,
        reason: null
      });
    }

    // 9. Resolución de Flush sobre Lote
    if (flushNum != null) {
      if (!BATCH_CODE_REGEX.test(candidate)) {
        return emptyResult(raw, 'unknown', false, 'invalid-code-format', explicitIntent);
      }
      return Object.freeze({
        kind: 'flush',
        intent: explicitIntent || 'flush',
        batchCode: candidate,
        bagCode: null,
        bagNumber: null,
        crateCode: null,
        flush: flushNum,
        raw,
        valid: true,
        reason: null
      });
    }

    // 10. Resolución de Lote Maestro (Batch)
    if (BATCH_CODE_REGEX.test(candidate)) {
      return Object.freeze({
        kind: 'batch',
        intent: explicitIntent,
        batchCode: candidate,
        bagCode: null,
        bagNumber: null,
        crateCode: null,
        flush: null,
        raw,
        valid: true,
        reason: null
      });
    }

    return emptyResult(raw, 'unknown', false, 'invalid-code-format', explicitIntent);
  }

  /**
   * Genera la URL canónica de trazabilidad pública a partir de una identidad.
   * Garantiza round-trip simétrico con resolveTraceIdentity().
   */
  function buildTraceUrl(identity, baseUrl = 'https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html') {
    if (!identity || !identity.valid) return baseUrl;

    if (identity.kind === 'crate' && identity.crateCode) {
      return `${baseUrl}?crate=${encodeURIComponent(identity.crateCode)}`;
    }
    if (identity.kind === 'bag' && identity.bagCode) {
      return `${baseUrl}?codigo=${encodeURIComponent(identity.bagCode)}${identity.flush ? `&flush=${identity.flush}` : ''}`;
    }
    if (identity.kind === 'flush' && identity.batchCode && identity.flush) {
      return `${baseUrl}?codigo=${encodeURIComponent(identity.batchCode)}&flush=${identity.flush}`;
    }
    if (identity.kind === 'batch' && identity.batchCode) {
      return `${baseUrl}?codigo=${encodeURIComponent(identity.batchCode)}`;
    }
    return baseUrl;
  }

  /**
   * Genera la URL de deep-link hacia Setas OS a partir de una identidad.
   */
  function buildSetasOSUrl(identity, baseUrl = '../Setas OS v5.dc.html') {
    if (!identity || !identity.valid) return `${baseUrl}?view=bitacora`;

    if (identity.kind === 'crate' && identity.crateCode) {
      return `${baseUrl}?view=bitacora&crate=${encodeURIComponent(identity.crateCode)}`;
    }
    if (identity.kind === 'bag' && identity.batchCode && identity.bagCode) {
      return `${baseUrl}?view=bitacora&lote=${encodeURIComponent(identity.batchCode)}&bolsa=${encodeURIComponent(identity.bagCode)}`;
    }
    if (identity.kind === 'flush' && identity.batchCode && identity.flush) {
      return `${baseUrl}?view=bitacora&lote=${encodeURIComponent(identity.batchCode)}&flush=${identity.flush}`;
    }
    if (identity.kind === 'batch' && identity.batchCode) {
      return `${baseUrl}?view=bitacora&lote=${encodeURIComponent(identity.batchCode)}`;
    }
    return `${baseUrl}?view=bitacora`;
  }

  return Object.freeze({
    resolveTraceIdentity,
    buildTraceUrl,
    buildSetasOSUrl,
    CRATE_CODE_REGEX,
    BAG_CODE_REGEX,
    BATCH_CODE_REGEX,
    HISTORICAL_HARVEST_REGEX
  });
});
