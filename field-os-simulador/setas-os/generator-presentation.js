'use strict';
// ── generator-presentation.js — cómo se presentan los Escenarios del generador ──
// Módulo puro: sin DOM ni React. Transforma la salida de runHybridRecipeSearch
// (simulador-app.jsx) antes de pintarla. No puntúa ni reordena: el ranking es
// del Perito (perito-scenarios.js + scoring.js) y aquí solo se colapsan casi
// duplicados, se separan las combinaciones «No ejecutar» y se explican las
// búsquedas vacías.
//
// Consumido por simulador-app.jsx vía require() (empaquetado por build.js) y por
// generator-presentation.test.js en Node.
(function () {
  const round2 = (v) => Math.round(v * 100) / 100;

  // Distancia L1 entre dos recetas en puntos porcentuales, sobre la unión de ids.
  const recipeL1Pct = (a = [], b = []) => {
    const sum = (rec) => {
      const m = new Map();
      (rec || []).forEach((r) => m.set(r.id, (m.get(r.id) || 0) + (Number(r.p) || 0)));
      return m;
    };
    const ma = sum(a);
    const mb = sum(b);
    let l1 = 0;
    new Set([...ma.keys(), ...mb.keys()]).forEach((id) => {
      l1 += Math.abs((ma.get(id) || 0) - (mb.get(id) || 0));
    });
    return round2(l1);
  };

  // Las filas llegan ordenadas por el Perito; de cada grupo de casi duplicados
  // se conserva la primera, sin reordenar.
  const collapseNearDuplicates = (rows = [], { maxL1Pct = 1 } = {}) => {
    const kept = [];
    (rows || []).forEach((row) => {
      if (!kept.some((k) => recipeL1Pct(k.recipe, row.recipe) <= maxL1Pct)) kept.push(row);
    });
    return kept;
  };

  const isViableRow = (row) => !!row && !!row.status
    && row.status !== 'critical' && row.safetyStatus !== 'hold';

  const partitionRows = (rows = []) => {
    const viable = [];
    const blocked = [];
    (rows || []).forEach((r) => (isViableRow(r) ? viable : blocked).push(r));
    return { viable, blocked };
  };

  // Ids de la receta cuyos lotes activos con existencias tienen todos precio <= 0:
  // el costo de esos insumos no está registrado, no es cero.
  const unpricedIds = (recipe = [], invLotes = []) => (recipe || [])
    .map((r) => r.id)
    .filter((id) => {
      const lots = (invLotes || []).filter((l) => l && l.activo !== false
        && l.ingredienteId === id && Number(l.cantidadKgDisponible) > 0);
      return lots.length > 0 && lots.every((l) => !(Number(l.precioPorKgCOP) > 0));
    });

  const explainEmptySearch = (diag = {}, profileLabel = '') => {
    if (!diag) return null;
    if (diag.bases === 0) {
      return { code: 'no_base', message: 'No hay una base de carbono compatible con la especie en el origen elegido.' };
    }
    if (diag.supps === 0) {
      return { code: 'no_supplement', message: 'No hay un suplemento de nitrógeno compatible con la especie en el origen elegido.' };
    }
    if (diag.structuralGenerated === 0 && !(diag.rejectionReasons || []).length) {
      return {
        code: 'no_structural_seed',
        message: `Con el perfil ${profileLabel}, el tope de suplementación (${diag.suppLimit} %) no permite alcanzar el rango de C:N de la especie con las bases disponibles. Prueba el perfil Producción o agrega un suplemento con más nitrógeno.`,
      };
    }
    return null;
  };

  const generatorHeadline = ({ viable = 0, blocked = 0, profileLabel = '' } = {}) => {
    if (viable === 0 && blocked === 0) return `Sin combinaciones válidas para ${profileLabel}.`;
    if (viable === 0) {
      return `Sin Escenario viable para ${profileLabel}: las ${blocked} combinaciones encontradas están marcadas «No ejecutar».`;
    }
    const head = `${viable} Escenario${viable === 1 ? '' : 's'} viable${viable === 1 ? '' : 's'} para ${profileLabel}`;
    return blocked > 0 ? `${head} · ${blocked} descartados («No ejecutar»).` : `${head}.`;
  };

  const api = {
    recipeL1Pct,
    collapseNearDuplicates,
    isViableRow,
    partitionRows,
    unpricedIds,
    explainEmptySearch,
    generatorHeadline,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasGeneratorPresentation = api;
})();
