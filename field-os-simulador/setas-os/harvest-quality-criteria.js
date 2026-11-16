'use strict';
// SETAS OS — criterios de grado por especie, tomados de knowledge_base/.
//
// REGLA: aquí no se inventa ningún umbral. Cada entrada cita el documento de la
// base de conocimiento del que sale; una especie sin criterio documentado se
// declara `undocumented` y el formulario captura el grado como juicio del
// operario, marcado «sin criterio documentado». Lo que la KB dice que NO está
// definido (diámetros, colores, porcentajes, tamaño por grado) se conserva como
// `numericThresholds: null` con su cita: el hueco es un dato.
//
// Vocabulario de grado de la app: primera / segunda / descarte.
// Equivalencias con la KB (provisionales, ver `knowledge_base/07_business/pricing.md`
// §Grados: «Los nombres Premium y Estándar son provisionales»):
//   primera  ≡ «Premium provisional» (shiitake, quality_control.md) · «Grado A» (CANON §13)
//   segunda  ≡ «Estándar provisional»
//   descarte ≡ «Descarte»
//
// NO se usa aquí «Grade A Yield ≥ 80 %» (CANON §13) como umbral: la auditoría
// 09_research/auditoria_seleccion_inoculo_shiitake_2026-11-03.md (§4) lo declara
// hipótesis no aprobada localmente. Se muestra el porcentaje medido, sin juicio.
//
// Para cambiar un criterio hay que cambiar la KB (autorización humana según
// knowledge_base/AGENTS.md) y luego esta tabla; harvest-quality-criteria.test.js
// verifica que cada cita exista literalmente en el documento fuente.
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;

  // Claves de especie de substrate-catalog.js (SPP). El test las contrasta con
  // el catálogo para que ninguna especie quede fuera de la lista de vacíos.
  const SPECIES_KEYS = Object.freeze([
    'p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii',
    'shiitake', 'lions_mane', 'reishi', 'enoki', 'nameko',
  ]);

  const QC = 'knowledge_base/06_operations/quality_control.md';

  const REGISTRY = Object.freeze({
    shiitake: Object.freeze({
      status: 'documented',
      level: 'provisional_qualitative',
      source: Object.freeze({
        file: QC,
        section: 'Clasificación del producto',
        reviewed: '2026-11-03',
        confidence: 'medium',
      }),
      grades: Object.freeze({
        primera: Object.freeze({
          kbLabel: 'Premium provisional',
          criteria: Object.freeze([
            'sombreros intactos, firmes y de superficie limpia',
            'color y morfología coherentes dentro del lote',
            'sin viscosidad, moho, plagas, golpes severos ni olor anormal',
            'cosecha en la etapa definida en la especificación del lote',
            'corte y presentación consistentes',
          ]),
        }),
        segunda: Object.freeze({
          kbLabel: 'Estándar provisional',
          criteria: Object.freeze([
            'producto apto, trazable y sin deterioro',
            'variación cosmética o de tamaño fuera del grado premium',
            'condición compatible con el canal de venta definido',
          ]),
        }),
        descarte: Object.freeze({
          kbLabel: 'Descarte',
          criteria: Object.freeze([
            'moho, viscosidad, deterioro, olor agrio o anormal',
            'daño físico severo, infestación o deshidratación incompatible con venta',
            'pérdida de trazabilidad o ruptura de la condición de almacenamiento sin evaluación',
          ]),
        }),
      }),
      // La KB es explícita: no hay límites numéricos. No se rellenan.
      numericThresholds: null,
      thresholdNote: 'Los límites de tamaño y grado comercial se definirán con compradores y validación local',
      thresholdSource: Object.freeze({ file: QC, section: 'Clasificación del producto' }),
    }),

    p_eryngii: Object.freeze({
      status: 'partial',
      level: 'single_numeric_reference',
      source: Object.freeze({
        file: 'knowledge_base/01_species/pleurotus_eryngii.md',
        section: 'Best Practices',
        reviewed: '2026-09-13',
        confidence: 'file_confidence_high_but_criterion_has_no_direct_citation',
      }),
      // Único criterio de grado en la KB para esta especie. No define segunda ni
      // descarte, y se expresa por peso de unidad, que esta captura no mide.
      grades: Object.freeze({
        primera: Object.freeze({
          kbLabel: 'Grado A',
          criteria: Object.freeze(['Grado A > 80 g por unidad']),
        }),
      }),
      numericThresholds: Object.freeze({ primera: Object.freeze({ unitWeightMinG: 80 }) }),
      thresholdNote: 'Criterio documentado solo para el grado A y por peso de unidad; no hay criterio para segunda ni descarte',
      thresholdSource: Object.freeze({ file: 'knowledge_base/01_species/pleurotus_eryngii.md', section: 'Best Practices' }),
    }),
  });

  // Especies que la KB nombra pero cuyo criterio de grado NO existe o fue retirado.
  const UNDOCUMENTED_NOTES = Object.freeze({
    p_djamor_rosa: 'Sus antiguos criterios de color y rangos quedaron retirados de la operación activa (quality_control.md, §Alcance y estado).',
  });

  const normalizeKey = (value) => (typeof value === 'string' ? value.trim() : '');

  /**
   * Criterio de grado de una especie. Nunca lanza ni inventa: una especie
   * desconocida o sin criterio devuelve `status: 'undocumented'`.
   */
  const criteriaFor = (speciesKey) => {
    const key = normalizeKey(speciesKey);
    const entry = REGISTRY[key];
    if (entry) return Object.assign({ speciesKey: key }, entry);
    return {
      speciesKey: key || null,
      status: 'undocumented',
      level: null,
      source: null,
      grades: Object.freeze({}),
      numericThresholds: null,
      thresholdNote: UNDOCUMENTED_NOTES[key] || 'La base de conocimiento no documenta criterios de grado para esta especie',
      thresholdSource: null,
    };
  };

  /**
   * Clave de especie de un lote. Los lotes lanzados desde el Formulador traen la
   * clave (`sKey` / `recipeRef.sKey`); los creados a mano solo el nombre, que se
   * resuelve contra el catálogo `spp` si se pasa. Sin coincidencia exacta es
   * `null` (criterio no documentado): no se adivina por parecido.
   */
  const resolveSpeciesKey = (lote, spp) => {
    if (!lote || typeof lote !== 'object') return null;
    const direct = [lote.sKey, lote.speciesKey, lote.recipeRef && lote.recipeRef.sKey]
      .map(normalizeKey).find((k) => k && SPECIES_KEYS.includes(k));
    if (direct) return direct;
    if (spp && typeof spp === 'object' && typeof lote.especie === 'string') {
      const name = lote.especie.trim();
      const hit = SPECIES_KEYS.find((k) => spp[k] && spp[k].name === name);
      if (hit) return hit;
    }
    return null;
  };

  /** Especies del catálogo cuyo criterio no está (o está solo parcialmente) documentado. */
  const gapReport = () => SPECIES_KEYS.map((key) => {
    const c = criteriaFor(key);
    return { speciesKey: key, status: c.status, note: c.thresholdNote };
  }).filter((row) => row.status !== 'documented');

  const api = { SPECIES_KEYS, REGISTRY, criteriaFor, resolveSpeciesKey, gapReport };
  if (isNode) module.exports = api;
  if (root) root.SetasHarvestQualityCriteria = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
