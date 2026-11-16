'use strict';
// SETAS OS — calidad de cosecha: `setas.harvest-quality.v1`.
//
// POR QUÉ EXISTE
// Hoy se mide cantidad (peso fresco → EB) pero no calidad, y sin calidad
// comparable entre lotes no se puede saber qué decisiones mejoran el producto.
// Este módulo define el bloque de calidad de UNA cosecha, lo valida contra los
// pesos que el flujo de cosecha ya captura, lo migra desde cosechas antiguas y
// lo agrega por lote. Solo captura y agregado por lote: no correlaciona con
// clima, recetas ni cepas.
//
// REGLAS
//   · «No medido» es `null`; «cero» es 0. Un campo vacío nunca se convierte en 0
//     (mismo contrato que `bitacora-model.captureNumber`).
//   · Los kg por grado se validan contra el peso neto de la cosecha, contra el
//     peso comercial y contra el descarte cuando existen. Si no cuadran se
//     MUESTRA el desfase: nada se corrige en silencio.
//   · Una cosecha sin bloque (anterior a esta versión) sigue siendo válida.
//   · Un bloque de una versión futura se conserva intacto y no se agrega.
//   · Con pocas cosechas o poca cobertura el agregado dice «datos
//     insuficientes»; no devuelve un porcentaje.
//   · Los criterios de grado salen de harvest-quality-criteria.js (KB). Los
//     umbrales de presentación de `DEFAULT_POLICY` NO tienen fuente: son
//     configurables y están marcados como pendientes de decisión.
//   · Todo es puro: el reloj entra por parámetro.
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;

  const getCriteria = () => (isNode ? require('./harvest-quality-criteria.js') : root.SetasHarvestQualityCriteria);

  const SCHEMA = 'setas.harvest-quality.v1';
  const SCHEMA_VERSION = 1;

  const GRADES = Object.freeze(['primera', 'segunda', 'descarte']);
  const GRADE_LABELS = Object.freeze({ primera: 'Primera', segunda: 'Segunda', descarte: 'Descarte' });

  // Escalas de juicio del operario. La KB (phenotype_dictionary_v0.1) exige
  // separar medida objetiva de puntuación del observador y registrar el método;
  // no documenta una escala calibrada de firmeza ni de color. Estas son escalas
  // ordinales declaradas como subjetivas y NO comparables con un instrumento.
  const FIRMNESS = Object.freeze(['firme', 'intermedia', 'blanda']);
  const FIRMNESS_LABELS = Object.freeze({ firme: 'Firme', intermedia: 'Intermedia', blanda: 'Blanda' });
  const COLOR = Object.freeze(['coherente', 'variable']);
  const COLOR_LABELS = Object.freeze({ coherente: 'Coherente con el lote', variable: 'Variable' });
  const OBSERVER_SCALE = Object.freeze({
    method: 'operator_judgement',
    calibrated: false,
    note: 'Juicio del operario al tacto y a la vista; sin escala calibrada en la KB. No comparable con un instrumento.',
  });

  // Lista cerrada de defectos de cosecha. `dictionaryCode` es la equivalencia con
  // el vocabulario v0.1 de knowledge_base/09_research/phenotype_dictionary_v0.1.md;
  // `null` marca un defecto que el diccionario aún no tiene (propuesta de
  // ampliación: requiere la compuerta de promoción del diccionario).
  const DEFECTS = Object.freeze([
    Object.freeze({ code: 'borde_enrollado_perdido', label: 'Borde enrollado perdido', dictionaryCode: null, equivalence: 'none' }),
    Object.freeze({ code: 'estipite_alargado', label: 'Estípite alargado', dictionaryCode: null, equivalence: 'none' }),
    Object.freeze({ code: 'manchas_bacterianas', label: 'Manchas bacterianas', dictionaryCode: 'bacterial_suspect', equivalence: 'approximate' }),
    Object.freeze({ code: 'deshidratacion', label: 'Deshidratación', dictionaryCode: 'surface_dryness', equivalence: 'approximate' }),
    Object.freeze({ code: 'dano_mecanico', label: 'Daño mecánico', dictionaryCode: 'mechanical_damage', equivalence: 'direct' }),
    Object.freeze({ code: 'esporulacion', label: 'Esporulación', dictionaryCode: null, equivalence: 'none' }),
  ]);
  const DEFECT_CODES = Object.freeze(DEFECTS.map((d) => d.code));

  const SEVERITIES = Object.freeze(['leve', 'moderada', 'severa']);
  const SEVERITY_LABELS = Object.freeze({ leve: 'Leve', moderada: 'Moderada', severa: 'Severa' });

  // Límites físicos / de tipo (no umbrales biológicos).
  const MAX_GRAMS = 10000000;
  const MAX_CAP_DIAMETER_MM = 1000;

  // POLÍTICA DE PRESENTACIÓN. Ninguno de estos valores sale de la KB: son un
  // piso para no mostrar un porcentaje sobre dos cosechas. Quedan configurables y
  // marcados `unsourced_default_pending_owner_decision`; el informe de entrega
  // los lista como parámetros sin valor aprobado.
  const DEFAULT_POLICY = Object.freeze({
    minGradedHarvests: 3,
    minCoverage: 0.5,
    minAssessedHarvests: 3,
    toleranceG: 1,
    source: 'unsourced_default_pending_owner_decision',
  });

  const resolvePolicy = (override) => {
    const merged = Object.assign({}, DEFAULT_POLICY, override || {});
    const positiveInt = (v, fallback) => (Number.isFinite(v) && v >= 1 ? Math.floor(v) : fallback);
    return Object.freeze({
      minGradedHarvests: positiveInt(merged.minGradedHarvests, DEFAULT_POLICY.minGradedHarvests),
      minCoverage: Number.isFinite(merged.minCoverage) && merged.minCoverage >= 0 && merged.minCoverage <= 1
        ? merged.minCoverage : DEFAULT_POLICY.minCoverage,
      minAssessedHarvests: positiveInt(merged.minAssessedHarvests, DEFAULT_POLICY.minAssessedHarvests),
      toleranceG: Number.isFinite(merged.toleranceG) && merged.toleranceG >= 0 ? merged.toleranceG : DEFAULT_POLICY.toleranceG,
      source: typeof merged.source === 'string' ? merged.source : DEFAULT_POLICY.source,
    });
  };

  // ── números: «no medido» ≠ «cero» ─────────────────────────────────────────
  const round6 = (n) => Math.round(n * 1e6) / 1e6;
  const gramsToKg = (g) => round6(g / 1000);
  const kgToGrams = (kg) => Math.round(kg * 1000 * 1e3) / 1e3;

  /**
   * Lee un número escrito por una persona. Acepta coma o punto como decimal (un
   * solo separador: «1.200» es 1,2, no 1200 — nunca se adivinan miles). Vacío es
   * `null` (no medido), no 0.
   * @returns {{value: number|null, error: string}}
   */
  const parseDecimalInput = (raw, { min = 0, max = Infinity, exclusiveMin = false } = {}) => {
    if (raw === null || raw === undefined) return { value: null, error: '' };
    let n;
    if (typeof raw === 'number') {
      n = raw;
    } else if (typeof raw === 'string') {
      const text = raw.replace(/[\s ]/g, '');
      if (text === '') return { value: null, error: '' };
      if (/[^0-9.,\-]/.test(text)) return { value: null, error: 'Falta un número válido.' };
      if (text.startsWith('-')) return { value: null, error: 'No puede ser negativo.' };
      const commas = (text.match(/,/g) || []).length;
      const dots = (text.match(/\./g) || []).length;
      if (commas + dots > 1) return { value: null, error: 'Use un solo separador decimal (coma o punto).' };
      if (!/^\d*[.,]?\d*$/.test(text) || !/\d/.test(text)) return { value: null, error: 'Falta un número válido.' };
      n = Number(text.replace(',', '.'));
    } else {
      return { value: null, error: 'Falta un número válido.' };
    }
    if (!Number.isFinite(n)) return { value: null, error: 'Falta un número válido.' };
    if (n < 0) return { value: null, error: 'No puede ser negativo.' };
    if (exclusiveMin ? n <= min : n < min) {
      return { value: null, error: exclusiveMin ? `Debe ser mayor que ${min}; deje vacío si no se midió.` : `Debe ser al menos ${min}.` };
    }
    if (n > max) return { value: null, error: `Valor fuera de rango (máximo ${max}).` };
    return { value: n, error: '' };
  };

  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

  // ── pesos de la cosecha (lo que el flujo de cosecha ya captura) ───────────
  const weightKg = (value, unit) => {
    if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return round6(unit === 'kg' ? n : n / 1000); // Bitácora guarda la cosecha en gramos.
  };
  const unitOf = (h) => (h && (h.unit || h.unidad)) || 'g';

  /** Peso neto (comercializable + descarte de esta cosecha) en kg, o null si no se pesó/no se pudo netear. */
  const harvestNetKg = (h) => (h ? weightKg(h.pesoFresco ?? h.pesoFrescoGramos, unitOf(h)) : null);
  const harvestGrossKg = (h) => (h ? weightKg(h.pesoBrutoGramos ?? h.pesoBruto, unitOf(h)) : null);
  const harvestCommercialKg = (h) => (h ? weightKg(h.pesoComercial, unitOf(h)) : null);
  const harvestDiscardKg = (h) => (h ? weightKg(h.pesoDescarte, unitOf(h)) : null);

  const signedG = (kg) => {
    const g = Math.round(kg * 1000 * 10) / 10;
    return `${g > 0 ? '+' : ''}${String(g).replace('.', ',')} g`;
  };

  // ── consistencia: kg por grado vs pesos de la cosecha ─────────────────────
  /**
   * Compara los kg por grado con el peso de la cosecha. NO modifica nada: devuelve
   * el estado y el desfase para mostrarlos.
   *
   * status: `no_weights` (nada que comparar) · `unverifiable` (la cosecha no tiene
   * peso neto) · `partial` (faltan grados por pesar, la suma no excede el total) ·
   * `consistent` · `mismatch`.
   */
  const evaluateConsistency = (block, harvest, policyOverride) => {
    const policy = resolvePolicy(policyOverride);
    const tolKg = policy.toleranceG / 1000;
    const kg = (block && block.kgByGrade) || {};
    const present = GRADES.filter((g) => isNum(kg[g]));
    const gradedKg = present.length ? round6(present.reduce((s, g) => s + kg[g], 0)) : null;
    const netKg = harvestNetKg(harvest);
    const grossKg = harvestGrossKg(harvest);
    const issues = [];
    const base = { toleranceKg: round6(tolKg), netKg, gradedKg, deltaKg: null, ungradedKg: null, issues };

    if (!present.length) return Object.assign(base, { status: 'no_weights' });

    let status = 'consistent';
    if (netKg === null) {
      if (grossKg !== null && gradedKg > grossKg + tolKg) {
        issues.push({
          code: 'grades_exceed_gross',
          deltaKg: round6(gradedKg - grossKg),
          message: `Los kg por grado (${signedG(gradedKg).replace('+', '')}) superan el peso bruto de la cosecha (${signedG(grossKg).replace('+', '')}).`,
        });
        status = 'mismatch';
      } else {
        issues.push({ code: 'harvest_net_weight_missing', deltaKg: null, message: 'La cosecha no tiene peso neto (falta peso o tara): no se puede verificar la suma por grado.' });
        status = 'unverifiable';
      }
      return Object.assign(base, { status });
    }

    if (present.length === GRADES.length) {
      const delta = round6(gradedKg - netKg);
      base.deltaKg = delta;
      if (Math.abs(delta) > tolKg + 1e-9) {
        issues.push({
          code: 'grades_sum_mismatch',
          deltaKg: delta,
          message: `La suma por grado difiere del peso neto de la cosecha en ${signedG(delta)} (grados ${signedG(gradedKg).replace('+', '')}, neto ${signedG(netKg).replace('+', '')}).`,
        });
        status = 'mismatch';
      }
    } else {
      const ungraded = round6(netKg - gradedKg);
      base.ungradedKg = ungraded;
      if (ungraded < -tolKg - 1e-9) {
        issues.push({
          code: 'grades_exceed_total',
          deltaKg: round6(-ungraded),
          message: `Los kg por grado superan el peso neto de la cosecha en ${signedG(-ungraded)}.`,
        });
        status = 'mismatch';
      } else {
        status = 'partial';
      }
    }

    // Contra el peso comercial y el descarte que el flujo de cosecha (§13) pueda
    // traer. Hoy ningún formulario los captura, pero lot-record.js y
    // cycle-evidence.js ya los leen: si existen, la calidad tiene que cuadrar.
    const commercialKg = harvestCommercialKg(harvest);
    if (commercialKg !== null && isNum(kg.primera) && isNum(kg.segunda)) {
      const marketable = round6(kg.primera + kg.segunda);
      const d = round6(marketable - commercialKg);
      if (Math.abs(d) > tolKg + 1e-9) {
        issues.push({ code: 'commercial_weight_mismatch', deltaKg: d, message: `Primera + segunda difiere del peso comercial registrado en ${signedG(d)}.` });
        status = 'mismatch';
      }
    }
    const discardKg = harvestDiscardKg(harvest);
    if (discardKg !== null && isNum(kg.descarte)) {
      const d = round6(kg.descarte - discardKg);
      if (Math.abs(d) > tolKg + 1e-9) {
        issues.push({ code: 'discard_weight_mismatch', deltaKg: d, message: `El descarte por grado difiere del descarte registrado en ${signedG(d)}.` });
        status = 'mismatch';
      }
    }
    return Object.assign(base, { status });
  };

  // ── construcción y validación del bloque ──────────────────────────────────
  const inEnum = (list, v) => typeof v === 'string' && list.includes(v);

  /**
   * Valida lo capturado y arma el bloque. No guarda nada.
   *
   * @param {object} input
   *   grade        'primera'|'segunda'|'descarte'|''|null — grado de TODA la cosecha (juicio)
   *   gramsByGrade {primera,segunda,descarte} — texto de la persona, en GRAMOS
   *   capDiameterMm, firmness, color
   *   defects      null (no evaluado) | [] (evaluado: sin defectos) | [{code, severity?}]
   * @param {object} ctx
   *   clock        () => Date|number|string — inyectado; por defecto el reloj del sistema
   *   speciesKey, harvest, operatorId, policy
   * @returns {{ok:boolean, empty:boolean, errors:Object, block:object|null, consistency:object|null}}
   */
  const buildQualityBlock = (input = {}, ctx = {}) => {
    const errors = {};
    const clock = typeof ctx.clock === 'function' ? ctx.clock : () => new Date();
    const src = input || {};

    // grado de toda la cosecha
    let grade = null;
    if (src.grade !== undefined && src.grade !== null && src.grade !== '') {
      if (inEnum(GRADES, src.grade)) grade = src.grade;
      else errors.grade = 'Grado no válido.';
    }

    // kg por grado (entrada en gramos → salida en kg)
    const kgByGrade = { primera: null, segunda: null, descarte: null };
    const gramsIn = src.gramsByGrade || {};
    GRADES.forEach((g) => {
      const parsed = parseDecimalInput(gramsIn[g], { min: 0, max: MAX_GRAMS });
      if (parsed.error) errors[`grams_${g}`] = parsed.error;
      else if (parsed.value !== null) kgByGrade[g] = gramsToKg(parsed.value);
    });

    const diameter = parseDecimalInput(src.capDiameterMm, { min: 0, exclusiveMin: true, max: MAX_CAP_DIAMETER_MM });
    if (diameter.error) errors.capDiameterMm = diameter.error;

    let firmness = null;
    if (src.firmness !== undefined && src.firmness !== null && src.firmness !== '') {
      if (inEnum(FIRMNESS, src.firmness)) firmness = src.firmness;
      else errors.firmness = 'Firmeza no válida.';
    }
    let color = null;
    if (src.color !== undefined && src.color !== null && src.color !== '') {
      if (inEnum(COLOR, src.color)) color = src.color;
      else errors.color = 'Color no válido.';
    }

    // defectos: null = no evaluado; [] = evaluado y sin defectos
    let defects = null;
    if (src.defects !== undefined && src.defects !== null) {
      if (!Array.isArray(src.defects)) {
        errors.defects = 'Defectos no válidos.';
      } else {
        const seen = new Map();
        src.defects.forEach((d) => {
          const code = d && typeof d === 'object' ? d.code : d;
          const severityRaw = d && typeof d === 'object' ? d.severity : null;
          if (!inEnum(DEFECT_CODES, code)) { errors.defects = `Defecto fuera de la lista cerrada: ${String(code)}.`; return; }
          let severity = null;
          if (severityRaw !== undefined && severityRaw !== null && severityRaw !== '') {
            if (inEnum(SEVERITIES, severityRaw)) severity = severityRaw;
            else { errors.defects = `Severidad no válida para ${code}.`; return; }
          }
          seen.set(code, severity);
        });
        defects = DEFECT_CODES.filter((c) => seen.has(c)).map((c) => ({ code: c, severity: seen.get(c) }));
      }
    }

    const empty = grade === null && GRADES.every((g) => kgByGrade[g] === null)
      && diameter.value === null && firmness === null && color === null && defects === null;
    if (Object.keys(errors).length) return { ok: false, empty, errors, block: null, consistency: null };
    if (empty) return { ok: false, empty: true, errors, block: null, consistency: null };

    const criteria = getCriteria().criteriaFor(ctx.speciesKey);
    const when = new Date(clock());
    const block = {
      schema: SCHEMA,
      schemaVersion: SCHEMA_VERSION,
      capturedAt: Number.isNaN(when.getTime()) ? null : when.toISOString(),
      operatorId: ctx.operatorId || null,
      species: {
        key: criteria.speciesKey,
        criteriaStatus: criteria.status,
        criteriaSource: criteria.source ? criteria.source.file : null,
      },
      grade,
      gradeBasis: 'operator_judgement',
      kgByGrade,
      capDiameterMm: diameter.value,
      firmness,
      color,
      observerScale: (firmness !== null || color !== null) ? OBSERVER_SCALE.method : null,
      defects,
    };
    const consistency = evaluateConsistency(block, ctx.harvest, ctx.policy);
    // Instantánea de lo que la persona vio al guardar. Se recalcula al leer
    // (el peso de la cosecha puede corregirse después): esta copia es auditoría.
    block.consistencyAtCapture = {
      status: consistency.status,
      deltaKg: consistency.deltaKg,
      netKg: consistency.netKg,
      gradedKg: consistency.gradedKg,
      issueCodes: consistency.issues.map((i) => i.code),
    };
    return { ok: true, empty: false, errors, block, consistency };
  };

  // ── lectura y migración tolerante ─────────────────────────────────────────
  /**
   * Lee el bloque de una cosecha sin lanzar. `none` = cosecha anterior a esta
   * versión: es válida. `unsupported_version` = bloque de una versión futura:
   * se conserva sin interpretar.
   */
  const readQuality = (harvest) => {
    if (!harvest || typeof harvest !== 'object') return { status: 'invalid', block: null };
    const q = harvest.quality;
    if (q === undefined || q === null) return { status: 'none', block: null };
    if (typeof q !== 'object' || Array.isArray(q)) return { status: 'invalid', block: null };
    if (q.schema === SCHEMA && q.schemaVersion === SCHEMA_VERSION) {
      const kg = q.kgByGrade && typeof q.kgByGrade === 'object' ? q.kgByGrade : {};
      const normalizedKg = {};
      GRADES.forEach((g) => { normalizedKg[g] = isNum(kg[g]) && kg[g] >= 0 ? kg[g] : null; });
      return {
        status: 'v1',
        block: Object.assign({}, q, {
          kgByGrade: normalizedKg,
          defects: Array.isArray(q.defects) ? q.defects : null,
          grade: inEnum(GRADES, q.grade) ? q.grade : null,
        }),
      };
    }
    const looksQuality = typeof q.schema === 'string' && q.schema.startsWith('setas.harvest-quality.');
    if (looksQuality || (isNum(q.schemaVersion) && q.schemaVersion > SCHEMA_VERSION)) {
      return { status: 'unsupported_version', block: null };
    }
    return { status: 'invalid', block: null };
  };

  /**
   * Migración de lectura: nunca modifica ni descarta la cosecha. Una cosecha sin
   * bloque se devuelve tal cual (sigue siendo válida); `qualityStatus` dice qué
   * se encontró.
   */
  const migrateHarvestRecord = (harvest) => {
    if (!harvest || typeof harvest !== 'object') return { valid: false, record: harvest, qualityStatus: 'invalid', quality: null };
    const read = readQuality(harvest);
    return { valid: true, record: harvest, qualityStatus: read.status, quality: read.block };
  };

  /** Devuelve una NUEVA cosecha con el bloque; la original no se toca. */
  const withQuality = (harvest, block) => Object.assign({}, harvest, { quality: block });

  /**
   * Aplica el bloque a la cosecha `harvestId` de una lista, de forma inmutable.
   * Idempotente: aplicar el mismo bloque dos veces da el mismo resultado.
   */
  const applyQualityToList = (cosechas, harvestId, block) => {
    const list = Array.isArray(cosechas) ? cosechas : [];
    const idx = list.findIndex((c) => c && c.id === harvestId);
    if (idx === -1) throw new Error('harvest_not_found');
    const next = list.slice();
    next[idx] = withQuality(list[idx], block);
    return next;
  };

  // ── agregados por lote ────────────────────────────────────────────────────
  const flushOf = (h) => {
    const n = Math.trunc(Number(h && h.flush));
    return Number.isFinite(n) && n >= 1 ? n : 1;
  };

  // Aporte de una cosecha al % de primera: kg por grado capturados, o el peso
  // neto completo atribuido al grado que el operario declaró para TODA la cosecha.
  const gradedContribution = (read, harvest, consistency) => {
    if (read.status !== 'v1') return null;
    const block = read.block;
    const hasKg = GRADES.some((g) => isNum(block.kgByGrade[g]));
    if (hasKg) {
      if (consistency.status === 'mismatch') return null;
      const out = {};
      GRADES.forEach((g) => { out[g] = isNum(block.kgByGrade[g]) ? block.kgByGrade[g] : 0; });
      const total = round6(GRADES.reduce((s, g) => s + out[g], 0));
      return total > 0 ? { kg: out, totalKg: total, attribution: 'explicit_kg' } : null;
    }
    const net = harvestNetKg(harvest);
    if (block.grade && net !== null && net > 0) {
      const out = { primera: 0, segunda: 0, descarte: 0 };
      out[block.grade] = net;
      return { kg: out, totalKg: net, attribution: 'whole_harvest_declared' };
    }
    return null;
  };

  const emptyAggregate = () => ({
    harvests: { total: 0, withQuality: 0, withoutQuality: 0, unsupported: 0, withMismatch: 0, withGradedKg: 0 },
    coverage: null,
    kgByGrade: { primera: 0, segunda: 0, descarte: 0 },
    gradedKg: 0,
    firstGradePct: null,
    status: 'insufficient',
    insufficientReasons: [],
  });

  const aggregateGroup = (entries, policy) => {
    const agg = emptyAggregate();
    agg.harvests.total = entries.length;
    entries.forEach((e) => {
      if (e.read.status === 'none') agg.harvests.withoutQuality += 1;
      else if (e.read.status === 'v1') agg.harvests.withQuality += 1;
      else agg.harvests.unsupported += 1;
      if (e.consistency && e.consistency.status === 'mismatch') agg.harvests.withMismatch += 1;
      if (e.contribution) {
        agg.harvests.withGradedKg += 1;
        GRADES.forEach((g) => { agg.kgByGrade[g] = round6(agg.kgByGrade[g] + e.contribution.kg[g]); });
      }
    });
    agg.gradedKg = round6(GRADES.reduce((s, g) => s + agg.kgByGrade[g], 0));
    agg.coverage = agg.harvests.total > 0 ? agg.harvests.withGradedKg / agg.harvests.total : null;

    if (agg.harvests.withGradedKg < policy.minGradedHarvests) agg.insufficientReasons.push('few_graded_harvests');
    if (agg.coverage === null || agg.coverage < policy.minCoverage) agg.insufficientReasons.push('low_coverage');
    if (!agg.insufficientReasons.length && agg.gradedKg > 0) {
      agg.status = 'ok';
      agg.firstGradePct = (agg.kgByGrade.primera / agg.gradedKg) * 100;
    }
    return agg;
  };

  const aggregateDefects = (entries, policy) => {
    const assessed = entries.filter((e) => e.read.status === 'v1' && Array.isArray(e.read.block.defects));
    const nAssessed = assessed.length;
    const sufficient = nAssessed >= policy.minAssessedHarvests;
    const withoutDefects = assessed.filter((e) => e.read.block.defects.length === 0).length;
    const rows = DEFECT_CODES.map((code) => {
      const hits = assessed.filter((e) => e.read.block.defects.some((d) => d && d.code === code));
      const severities = { leve: 0, moderada: 0, severa: 0, sin_severidad: 0 };
      hits.forEach((e) => {
        const d = e.read.block.defects.find((x) => x.code === code);
        if (d && inEnum(SEVERITIES, d.severity)) severities[d.severity] += 1; else severities.sin_severidad += 1;
      });
      return {
        code,
        label: DEFECTS.find((d) => d.code === code).label,
        count: hits.length,
        nAssessed,
        // El conteo es un hecho; la frecuencia solo se publica con n suficiente.
        frequency: sufficient && nAssessed > 0 ? hits.length / nAssessed : null,
        severities,
      };
    });
    return {
      nAssessed,
      withoutDefects,
      status: sufficient ? 'ok' : 'insufficient',
      minAssessedHarvests: policy.minAssessedHarvests,
      rows,
    };
  };

  /**
   * Resumen de calidad de un lote: acumulado y por oleada, con n visible. Con n
   * insuficiente o cobertura baja el porcentaje de primera es `null` y el estado
   * es `insufficient` («datos insuficientes»); nunca se muestra un % engañoso.
   *
   * @param {Array<object>} harvests Cosechas del lote (con o sin bloque).
   * @param {{speciesKey?:string, policy?:object}} [opts]
   */
  const aggregateLotQuality = (harvests, opts = {}) => {
    const policy = resolvePolicy(opts.policy);
    const list = (Array.isArray(harvests) ? harvests : []).filter((h) => h && typeof h === 'object');
    const entries = list.map((h) => {
      const read = readQuality(h);
      const consistency = read.status === 'v1' ? evaluateConsistency(read.block, h, policy) : null;
      return { harvest: h, flush: flushOf(h), read, consistency, contribution: gradedContribution(read, h, consistency || { status: 'no_weights' }) };
    });
    const flushes = [...new Set(entries.map((e) => e.flush))].sort((a, b) => a - b);
    const criteria = getCriteria().criteriaFor(opts.speciesKey);
    return {
      schema: 'setas.lot-quality-summary.v1',
      policy,
      species: {
        key: criteria.speciesKey,
        criteriaStatus: criteria.status,
        criteriaSource: criteria.source ? criteria.source.file : null,
        note: criteria.thresholdNote,
      },
      cumulative: aggregateGroup(entries, policy),
      byFlush: flushes.map((flush) => Object.assign({ flush }, aggregateGroup(entries.filter((e) => e.flush === flush), policy))),
      defects: aggregateDefects(entries, policy),
    };
  };

  const api = {
    SCHEMA, SCHEMA_VERSION, GRADES, GRADE_LABELS, FIRMNESS, FIRMNESS_LABELS, COLOR, COLOR_LABELS,
    OBSERVER_SCALE, DEFECTS, DEFECT_CODES, SEVERITIES, SEVERITY_LABELS, DEFAULT_POLICY,
    MAX_GRAMS, MAX_CAP_DIAMETER_MM,
    resolvePolicy, parseDecimalInput, gramsToKg, kgToGrams,
    harvestNetKg, harvestGrossKg, harvestCommercialKg, harvestDiscardKg,
    evaluateConsistency, buildQualityBlock, readQuality, migrateHarvestRecord,
    withQuality, applyQualityToList, aggregateLotQuality,
  };
  if (isNode) module.exports = api;
  if (root) root.SetasHarvestQuality = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
