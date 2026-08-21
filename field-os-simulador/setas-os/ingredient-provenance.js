'use strict';

// Trazabilidad de datos para el catálogo de insumos (INGS en simulador-app.jsx).
//
// Diseño: extensión opcional `provenance` sobre el objeto de insumo existente.
// No toca cost/cn/n/c/notes — las 87 entradas actuales del catálogo siguen
// siendo válidas sin cambios. Un insumo sin `provenance` se audita como
// 'unknown' en vez de 'stale', para no confundir "nunca migrado" con
// "verificado hace mucho tiempo".
//
// Regla de integridad (no forzada en código, sí en revisión): cada campo
// sensible (cost/cn/n/c) debe aparecer en como máximo un FieldClaim vigente
// por insumo. Si cn/n/c comparten fuente y fecha, van en un solo claim con
// fields:['cn','n','c']; si un campo tiene más de una fuente, se agregan
// varios ids a sourceIds en vez de duplicar el claim.
//
// Formas (JSDoc, no TypeScript — el resto del repo es JS plano):
//
// @typedef {'cost'|'cn'|'n'|'c'} SensitiveField
// @typedef {'high'|'medium'|'low'|'unknown'} Confidence
// @typedef {'invoice'|'supplier_quote'|'supplier_datasheet'|'measurement'|
//           'literature'|'official_dataset'|'internal_record'|'legacy'|'other'} SourceType
// @typedef {'measured'|'reported'|'literature'|'derived'|'estimated'|'legacy'} Method
//
// @typedef {Object} EvidenceSource
// @property {SourceType} type
// @property {string} label
// @property {string} [organization]
// @property {string} [location]
// @property {string} [observedAt]  ISO YYYY-MM-DD — fecha de la evidencia (factura, cotización, medición, publicación)
// @property {string} [url]
// @property {string} [reference]   factura, DOI, boletín, código interno...
// @property {string} [notes]
//
// @typedef {Object} FieldClaim
// @property {SensitiveField[]} fields
// @property {string[]} sourceIds
// @property {Confidence} confidence
// @property {Method} method
// @property {string} [verifiedAt]  ISO YYYY-MM-DD — última vez que se confirmó que el valor sigue siendo aceptable
// @property {string} [verifiedBy]
//
// @typedef {Object} IngredientProvenance
// @property {1} version
// @property {Record<string, EvidenceSource>} sources
// @property {FieldClaim[]} claims

const SENSITIVE_FIELDS = ['cost', 'cn', 'n', 'c'];

function addCalendarMonths(date, months) {
  const out = new Date(date);
  out.setUTCMonth(out.getUTCMonth() + months);
  return out;
}

/**
 * @param {*} ingredient
 * @param {SensitiveField} field
 * @param {number} maxAgeMonths
 * @param {Date} [now]
 * @returns {'fresh'|'stale'|'unknown'}
 */
function fieldVerificationStatus(ingredient, field, maxAgeMonths, now = new Date()) {
  if (ingredient[field] == null) return 'unknown'; // el insumo no declara ese campo

  const claim = ingredient.provenance?.claims?.find(c => c.fields.includes(field));
  if (!claim?.verifiedAt) return 'unknown'; // entrada legacy o migración incompleta

  const expiresAt = addCalendarMonths(new Date(`${claim.verifiedAt}T00:00:00Z`), maxAgeMonths);
  return expiresAt < now ? 'stale' : 'fresh';
}

/**
 * @param {*} ingredient
 * @param {number} maxAgeMonths
 * @param {Date} [now]
 */
function auditIngredient(ingredient, maxAgeMonths, now = new Date()) {
  const status = Object.fromEntries(
    SENSITIVE_FIELDS.map(field => [field, fieldVerificationStatus(ingredient, field, maxAgeMonths, now)])
  );
  return {
    status,
    staleFields: SENSITIVE_FIELDS.filter(f => status[f] === 'stale'),
    unknownFields: SENSITIVE_FIELDS.filter(f => status[f] === 'unknown'),
    needsVerification: SENSITIVE_FIELDS.some(f => status[f] !== 'fresh'),
  };
}

/**
 * @param {Array} ingredients
 * @param {number} maxAgeMonths
 * @param {Date} [now]
 */
function auditCatalog(ingredients, maxAgeMonths, now = new Date()) {
  return ingredients.map(g => ({ id: g.id, ...auditIngredient(g, maxAgeMonths, now) }));
}

module.exports = { SENSITIVE_FIELDS, fieldVerificationStatus, auditIngredient, auditCatalog };
