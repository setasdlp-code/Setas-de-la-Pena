'use strict';

/**
 * @file perito-context.js — Puerta entre el Perito (Formulador) y el trabajo de campo.
 *
 * El Perito de Setas OS vive hoy sólo en el Formulador: es una herramienta de diseño
 * de receta. No aparece en Hoy, ni en la ficha de lote, ni en salas — cuando el
 * operario está frente a un lote con un problema, el sistema que más sabe de recetas
 * no dice nada. Este módulo es esa puerta que falta.
 *
 * `explainBatch()` convierte lo que el Perito YA calculó (un `snapshot` de
 * `recipe-lifecycle.js` y un `restrictive` de `perito-workbench-core.js`) más lo que
 * la ficha del lote (`batch-sheet.js`) ya observó, en CONTEXTO para decidir sobre UN
 * lote concreto. No calcula nada nuevo, no puntúa, no ordena, no recomienda recetas.
 *
 * ADR-0004 (docs/adr/0004-evidence-is-context-not-score.md): la evidencia de
 * producción es contexto, nunca entra en ranking. Este módulo vive enteramente del
 * lado "contexto" de esa frontera — no toca scoring.js, no compara recetas entre sí,
 * no ordena nada. Si algo aquí empieza a parecer una comparación de dos recetas, es
 * una señal de que se está cruzando esa frontera: eso está prohibido en este archivo.
 *
 * Reglas de honestidad (ver .claude/skills/agronomic-claims/SKILL.md):
 *   - Sin snapshot no hay receta que explicar: nunca se deduce ni se inventa.
 *   - `restrictive.counterfactualOpportunity` y `restrictive.actionRequired` son de
 *     DISEÑO de receta ("añadir 5-15% de salvado", "salva el 100% del lote"). Un lote
 *     ya inoculado en un cuarto no puede ejecutar un cambio de receta retroactivo, y
 *     "salva el 100%" es una afirmación causal sobre algo que ya pasó. Por eso este
 *     módulo los descarta explícitamente — ver el comentario junto a `pickRestrictive`.
 *   - Los findings son hechos, nunca causas: prohibido "por eso", "causó", "debido a",
 *     "óptimo", "mejor", "siempre". Relacionar hechos es trabajo del humano.
 *   - El historial pasa siempre por `SetasProvenance.describeConfidence('evidence', …)`
 *     — esa escala nunca dice "alta" (techo estructural, no un detalle a "arreglar").
 *
 * Módulo puro (mismo patrón UMD que batch-sheet.js / task-engine.js): sin
 * localStorage, sin red, sin DOM. La única dependencia externa (`SetasProvenance`) se
 * resuelve en cada llamada, no al cargar, igual que en batch-sheet.js.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  const provenanceRef = () => (isNode ? require('./provenance.js') : (glob && glob.SetasProvenance) || null);

  /**
   * Texto exacto del descargo — no es un detalle de copy, es la afirmación central
   * del módulo: lo que aquí se muestra es contexto para decidir, no una causa
   * demostrada. Se expone como constante para que quien consuma este módulo no
   * pueda parafrasearlo por accidente.
   */
  const DISCLAIMER = 'Contexto para decidir, no una causa demostrada: son observaciones de este lote y de su receta, puestas juntas.';

  /** Concordancia singular/plural simple en español. */
  const plural = (n, singular, plural_) => (n === 1 ? singular : plural_);

  /**
   * De `restrictive` (calcRestrictiveFactor de perito-workbench-core.js) sólo se usan
   * `factor`, `severity`, `label` y `rationale`. `counterfactualOpportunity` y
   * `actionRequired` se quedan fuera A PROPÓSITO — ver el comentario de cabecera del
   * archivo. Un futuro lector que quiera "completar" este finding reintroduciendo
   * esos dos campos estaría convirtiendo un diagnóstico de diseño de receta en una
   * orden de acción sobre un lote que ya existe, o en una afirmación causal
   * ("salva el 100% del lote") sobre algo que ya ocurrió. No lo hagas.
   */
  const pickRestrictive = (restrictive) => {
    if (!restrictive || typeof restrictive !== 'object') return null;
    const { factor, severity, label, rationale } = restrictive;
    if (!factor || factor === 'none') return null;
    return { factor, severity: severity ?? null, label: label ?? null, rationale: rationale ?? null };
  };

  /** Finding `receta_del_lote`: con qué receta y versión se guardó el snapshot. */
  const buildRecetaFinding = (snapshot) => {
    const version = snapshot.version != null ? `v${snapshot.version}` : 'sin versión';
    const nombre = snapshot.name || snapshot.recipeId || 'receta sin nombre';
    const cn = Number.isFinite(Number(snapshot.cn)) ? `C:N ${Number(snapshot.cn).toFixed(1)}:1` : null;
    const partes = [`Este lote se produjo con la receta ${nombre} (${version})`];
    if (cn) partes.push(cn);
    return {
      code: 'receta_del_lote',
      text: partes.join(', ') + '.',
      provenance: null,
    };
  };

  /** Finding `factor_restrictivo`: sólo campos de diagnóstico, nunca los de acción. */
  const buildRestrictiveFinding = (picked) => {
    const label = picked.label || picked.factor;
    // El `rationale` del perito ya viene como frase terminada en punto, así que
    // unir con '. ' y añadir otro producía "…procesar..". Se normaliza el punto
    // final de cada parte antes de unir.
    const partes = [`Factor restrictivo identificado en la receta: ${label}`];
    if (picked.rationale) partes.push(picked.rationale);
    return {
      code: 'factor_restrictivo',
      text: partes.map(t => String(t).trim().replace(/\.+$/, '')).join('. ') + '.',
      provenance: null,
    };
  };

  /** Finding `observado_en_lote`: lo que la ficha del lote ya registró (hechos, no causas). */
  const buildObservadoFindings = (sheet) => {
    const findings = [];
    const bagsIsolated = Number(sheet.bagsIsolated) || 0;
    if (bagsIsolated > 0) {
      findings.push({
        code: 'observado_en_lote',
        text: `Este lote lleva ${bagsIsolated} ${plural(bagsIsolated, 'bolsa aislada', 'bolsas aisladas')} en observación.`,
        provenance: null,
      });
    }
    const anomalies = Array.isArray(sheet.anomalies) ? sheet.anomalies : [];
    anomalies.forEach((a) => {
      if (!a || a.kind === 'isolation') return; // ya cubierto arriba con las cuentas de bagsIsolated
      findings.push({
        code: 'observado_en_lote',
        text: `Anomalía registrada en el lote: ${a.detail || a.kind}.`,
        provenance: null,
      });
    });
    return findings;
  };

  /**
   * Finding `historial_de_la_finca`: lotes cerrados de la finca con la misma receta.
   * La confianza SIEMPRE sale de `SetasProvenance.describeConfidence('evidence', …)`,
   * resuelto por llamada — esa escala tiene techo estructural en 'medium', nunca dice
   * 'alta', y este módulo no intenta "arreglar" eso subiendo el nivel a mano.
   */
  const buildHistorialFinding = (history) => {
    const n = Number(history.n) || 0;
    if (n <= 0) return null;
    const provenance = provenanceRef();
    if (!provenance) return null;
    // Mismo umbral que cycle-evidence.js buildHistoricalEvidence(): n>=3 es el piso
    // para no leer 'medium' con una muestra irrelevante; por debajo, 'low'.
    const level = n >= 3 ? 'medium' : 'low';
    const confidence = provenance.describeConfidence('evidence', level, { sampleSize: n });
    if (!confidence) return null;
    const avgTxt = Number.isFinite(Number(history.avg)) ? ` con BE promedio ${Number(history.avg).toFixed(1)}%` : '';
    return {
      code: 'historial_de_la_finca',
      text: `${n} ${plural(n, 'lote cerrado', 'lotes cerrados')} de la finca con esta misma receta${avgTxt} (${confidence.text}).`,
      provenance: confidence,
    };
  };

  /** `question`: sale literalmente de `sheet.nextAction`, nunca de un vocabulario propio. */
  const buildQuestion = (sheet) => {
    const nextAction = sheet && sheet.nextAction;
    if (!nextAction || !nextAction.label) return null;
    return { text: `¿${nextAction.label}?`, action: nextAction.action ?? null };
  };

  /**
   * Punto de entrada único del módulo. Ver el contrato completo en la cabecera del
   * archivo y en el comentario de cada builder de finding.
   *
   * @param {object} params
   * @param {object} params.sheet Ficha del lote (buildBatchSheet de batch-sheet.js)
   * @param {?object} [params.snapshot] buildProductionSnapshot de recipe-lifecycle.js
   * @param {?object} [params.restrictive] calcRestrictiveFactor de perito-workbench-core.js
   * @param {?object} [params.history] { n, avg, similarity } — lotes cerrados de la finca
   * @param {number} params.nowMs Reloj inyectado; obligatorio, nunca cae a Date.now()
   * @returns {object} Objeto congelado { batchId, available, headline, findings, question, disclaimer, generatedAt }
   */
  const explainBatch = ({ sheet, snapshot = null, restrictive = null, history = null, nowMs } = {}) => {
    if (!sheet) throw new Error('explainBatch requiere sheet');
    if (nowMs == null) throw new Error('explainBatch requiere nowMs (no se usa Date.now() por defecto)');

    const batchId = sheet.batchId ?? null;
    const generatedAt = new Date(nowMs).toISOString();

    // Regla 1: sin snapshot no hay receta que explicar. Nunca se deduce de otro
    // lado (el nombre de la receta en la ficha, por ejemplo) ni se inventa: los
    // lotes anteriores al versionado simplemente no guardaron esa prueba.
    if (!snapshot) {
      return Object.freeze({
        batchId,
        available: false,
        headline: 'Este lote no guardó con qué receta se produjo',
        findings: Object.freeze([]),
        question: buildQuestion(sheet),
        disclaimer: DISCLAIMER,
        generatedAt,
      });
    }

    const findings = [];
    findings.push(buildRecetaFinding(snapshot));

    const picked = pickRestrictive(restrictive);
    if (picked) findings.push(buildRestrictiveFinding(picked));

    findings.push(...buildObservadoFindings(sheet));

    if (history) {
      const historial = buildHistorialFinding(history);
      if (historial) findings.push(historial);
    }

    const nombreReceta = snapshot.name || snapshot.recipeId || 'receta';
    const version = snapshot.version != null ? `v${snapshot.version}` : 'sin versión';
    // Regla 8: un panel vacío es mejor que uno relleno de obviedades. Si sólo hay
    // el finding de receta (siempre presente cuando hay snapshot) el headline lo
    // dice tal cual, sin fingir que hay más contexto del que en verdad hay.
    const headline = findings.length > 1
      ? `${nombreReceta} (${version}) — contexto de este lote`
      : `${nombreReceta} (${version}) — sin más observaciones registradas para este lote`;

    return Object.freeze({
      batchId,
      available: true,
      headline,
      findings: Object.freeze(findings.map((f) => Object.freeze(f))),
      question: buildQuestion(sheet),
      disclaimer: DISCLAIMER,
      generatedAt,
    });
  };

  const api = { explainBatch, DISCLAIMER };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') glob.SetasPeritoContext = api;
})();
