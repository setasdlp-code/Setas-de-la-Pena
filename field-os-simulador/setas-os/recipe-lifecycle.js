'use strict';

/**
 * @file recipe-lifecycle.js — Ciclo de vida de la receta para Setas OS.
 *
 * Una receta guardada no basta (SETAS_OS_UX_ARCHITECTURE_V2.md §9). Hoy vive en
 * `setas_v6` con la forma `{id, name, sKey, recipe[], date, eb, cn, score, cost}`:
 * sin estado, sin versión y sin identidad estable — el `id` es un `Date.now()`, y
 * cuando se crea un lote se copia un `recipeRef` con esos mismos campos, así que el
 * lote lleva una copia pero no puede decir de qué receta salió ni con qué versión
 * se produjo. Si la receta se edita después, el lote histórico ya no se puede
 * comparar honestamente con los nuevos, y el Perito aprende de datos que mienten.
 *
 * Este módulo hace el ciclo `draft → trial → approved → retired` explícito y le
 * pone una regla que lo hace útil: una receta aprobada no se edita, se versiona
 * (newVersionFrom). Es lo que permite que buildProductionSnapshot() congele, en
 * cada lote, la verdad de con qué receta y qué versión se produjo, para siempre.
 *
 * DISTINCIÓN IMPORTANTE — no confundir con otro "approved" que ya existe en el
 * código: la VIABILIDAD del perito (`approved/review/hold` en
 * recetario-model-bridge.js y scoring.js) dice si una formulación es PROMETEDORA
 * desde el punto de vista técnico. El `status` de este módulo dice si la receta
 * está AUTORIZADA para producción. Son preguntas distintas y pueden discrepar:
 * una receta puede estar `approved` (autorizada) con viabilidad `review`
 * (el perito todavía no la ve del todo clara), o al revés. Este módulo nunca lee
 * ni deriva nada de la viabilidad del perito, y viceversa no debería pasar.
 *
 * Es lógica pura (mismo patrón UMD que batch-sheet.js / task-engine.js): no toca
 * React, ni red, ni DOM, ni localStorage. Se prueba con
 * `node --test recipe-lifecycle.test.js`.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // Igual que en batch-sheet.js / task-engine.js: la dependencia se resuelve en
  // cada llamada, no al cargar el módulo, porque en el navegador el orden de
  // carga entre listas de <script> no está garantizado.
  const recipeVersionRef = () => (isNode ? require('./recipe-version.js') : (glob && glob.SetasRecipeVersion) || null);

  const LIFECYCLE_STATES = Object.freeze(['draft', 'trial', 'approved', 'retired', 'legacy']);

  const LIFECYCLE_LABELS = Object.freeze({
    draft: 'Borrador',
    trial: 'En ensayo',
    approved: 'Aprobada',
    retired: 'Retirada',
    // `legacy` es para las recetas que ya existen en setas_v6 y nunca pasaron
    // por aprobación. No se marcan 'draft' (eso implicaría que no se han usado
    // todavía, y sí se usan hoy en producción) ni 'approved' (eso fabricaría
    // una autorización que nadie dio nunca). 'legacy' declara el hueco de dato
    // en vez de inventar uno: es honesto sobre que no sabemos si esa receta
    // pasó algún control.
    legacy: 'Sin versionar',
  });

  // Máquina de estados del ciclo de vida. approved NO puede volver a draft:
  // para cambiar una receta aprobada se crea una versión nueva (newVersionFrom),
  // que es justo la regla que hace útil todo este módulo.
  const TRANSITIONS = Object.freeze({
    draft: Object.freeze(['trial', 'retired']),
    trial: Object.freeze(['approved', 'draft', 'retired']),
    approved: Object.freeze(['retired']),
    legacy: Object.freeze(['trial', 'approved', 'retired']),
    retired: Object.freeze([]),
  });

  const canTransition = (from, to) => Boolean(TRANSITIONS[from] && TRANSITIONS[from].includes(to));

  const assertTransition = (from, to) => {
    if (!LIFECYCLE_STATES.includes(from)) throw new Error(`Estado de origen desconocido: ${from}`);
    if (!LIFECYCLE_STATES.includes(to)) throw new Error(`Estado de destino desconocido: ${to}`);
    if (!canTransition(from, to)) {
      throw new Error(`Transición no permitida: ${from} → ${to}`);
    }
  };

  // Normaliza un nombre a un código estable: mayúsculas, sin acentos, sin
  // espacios (guion en su lugar). "Shiitake aserrín" → "SHIITAKE-ASERRIN".
  const slugifyName = (name) => String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  /**
   * Identidad estable de la receta. El `id` numérico existente (Date.now())
   * NO sirve como identidad: dos ediciones de la misma receta con el mismo
   * `id` de creación no pueden compararse ni versionarse, porque el `id` es
   * un timestamp de captura, no un código de receta. `recipeId` es ese código
   * estable: se usa el que ya traiga la receta, o se deriva del nombre.
   */
  const recipeIdentity = (recipe) => {
    if (!recipe) throw new Error('recipeIdentity requiere una receta');
    const recipeId = recipe.recipeId || slugifyName(recipe.name);
    if (!recipeId) throw new Error('No se pudo derivar recipeId: falta name o recipeId en la receta');
    const version = Number.isInteger(recipe.version) ? recipe.version : 1;
    return { recipeId, version };
  };

  /**
   * Promueve una receta a un nuevo estado del ciclo de vida. Devuelve una
   * receta NUEVA congelada (no muta la original) con el historial
   * `lifecycleLog` ampliado con la entrada de la transición.
   *
   * Permisos: promover a 'approved' o 'retired' exige role === 'direccion'.
   * Es la autorización real de producción (a diferencia de la viabilidad del
   * perito, que es una opinión técnica, no un permiso), así que sólo
   * dirección puede darla o quitarla. draft→trial (empezar a ensayar) lo
   * puede hacer cualquiera que formule: ensayar no compromete producción.
   */
  const promote = (recipe, toState, { actor, role, at, reason } = {}) => {
    if (!recipe) throw new Error('promote requiere una receta');
    const from = recipe.status;
    assertTransition(from, toState);
    if ((toState === 'approved' || toState === 'retired') && role !== 'direccion') {
      throw new Error(`Sólo dirección puede promover una receta a "${LIFECYCLE_LABELS[toState]}"`);
    }
    if (!actor) throw new Error('promote requiere actor');
    if (!at) throw new Error('promote requiere at');

    const entry = Object.freeze({ from, to: toState, actor, role: role || null, at, reason: reason || null });
    const lifecycleLog = [...(recipe.lifecycleLog || []), entry];
    return Object.freeze({ ...recipe, status: toState, lifecycleLog: Object.freeze(lifecycleLog) });
  };

  /**
   * Único camino para modificar una receta 'approved': si se le pasa una
   * receta aprobada, NO la muta — devuelve una receta NUEVA en 'draft', con
   * `version` incrementada, el mismo `recipeId`, los `changes` aplicados, y
   * `derivedFrom` apuntando a la versión de origen. La original sigue
   * existiendo tal cual estaba, para que los lotes que la referencian sigan
   * viendo la misma verdad.
   */
  const newVersionFrom = (recipe, changes = {}, { actor, at } = {}) => {
    if (!recipe) throw new Error('newVersionFrom requiere una receta');
    if (!actor) throw new Error('newVersionFrom requiere actor');
    if (!at) throw new Error('newVersionFrom requiere at');
    const { recipeId, version } = recipeIdentity(recipe);
    const entry = Object.freeze({
      from: recipe.status, to: 'draft', actor, role: null, at,
      reason: `Nueva versión derivada de ${recipeId} v${version}`,
    });
    return Object.freeze({
      ...recipe,
      ...changes,
      recipeId,
      version: version + 1,
      status: 'draft',
      derivedFrom: Object.freeze({ recipeId, version }),
      lifecycleLog: Object.freeze([entry]),
    });
  };

  /** Guarda que la interfaz debe llamar antes de dejar editar una receta. */
  const assertEditable = (recipe) => {
    if (!recipe) throw new Error('assertEditable requiere una receta');
    if (recipe.status === 'approved' || recipe.status === 'retired') {
      throw new Error('una receta aprobada no se edita: crea una versión nueva');
    }
  };

  /**
   * Snapshot congelado que un lote guarda para siempre. Es la respuesta al
   * problema original: el lote deja de llevar una copia muda de la receta y
   * pasa a llevar una prueba de con qué receta, qué versión y qué estado
   * fue producido — inmutable aunque la receta cambie después.
   *
   * Los parámetros de producción (humedad objetivo, tratamiento térmico,
   * tasa de spawn) se toman de la receta si existen, y se dejan en `null`
   * si no: nunca se inventa un valor por defecto para un parámetro de
   * producción, porque eso fabricaría un dato que nadie registró.
   */
  const buildProductionSnapshot = (recipe, { at } = {}) => {
    if (!recipe) throw new Error('buildProductionSnapshot requiere una receta');
    if (!at) throw new Error('buildProductionSnapshot requiere at');
    const { recipeId, version } = recipeIdentity(recipe);
    const ingredients = (recipe.recipe || recipe.ingredients || []).map(row => Object.freeze({
      id: row.id ?? row.ingredienteId ?? null,
      pct: parseFloat(row.p ?? row.pct) || 0,
    }));

    return Object.freeze({
      schema: 'setas.recipe-snapshot.v1',
      recipeId,
      version,
      status: recipe.status ?? null,
      name: recipe.name ?? null,
      sKey: recipe.sKey ?? null,
      ingredients: Object.freeze(ingredients),
      cn: recipe.cn ?? null,
      eb: recipe.eb ?? null,
      cost: recipe.cost ?? null,
      humedadObjetivo: recipe.humedadObjetivo ?? recipe.humedad ?? null,
      tratamientoTermico: recipe.tratamientoTermico ?? recipe.tratamiento ?? null,
      spawnRatePct: recipe.spawnRatePct ?? recipe.spawnPct ?? null,
      snapshotAt: at,
    });
  };

  /** Cadena corta para la ficha del lote, p.ej. "SHI-SAW-03 v4 · Aprobada". */
  const describeSnapshot = (snapshot) => {
    if (!snapshot) throw new Error('describeSnapshot requiere un snapshot');
    const label = LIFECYCLE_LABELS[snapshot.status] || snapshot.status || 'Estado desconocido';
    return `${snapshot.recipeId} v${snapshot.version} · ${label}`;
  };

  /**
   * Migra una receta cruda de setas_v6 (sin estado ni versión) al formato
   * versionado: añade recipeId, version:1, status:'legacy' (ver comentario
   * de LIFECYCLE_LABELS.legacy) y un lifecycleLog vacío — no hay historial
   * de transiciones porque nunca pasó por este módulo. Idempotente: si la
   * receta ya trae `status`, se devuelve tal cual, sin volver a migrarla.
   */
  const migrateLegacyRecipe = (recipe) => {
    if (!recipe) throw new Error('migrateLegacyRecipe requiere una receta');
    if (recipe.status) return recipe;
    const recipeId = recipe.recipeId || slugifyName(recipe.name);
    return Object.freeze({
      ...recipe,
      recipeId,
      version: 1,
      status: 'legacy',
      lifecycleLog: Object.freeze([]),
    });
  };

  /**
   * Lo que impide usar una receta en producción, para que la interfaz nunca
   * ofrezca una receta en ensayo como si fuera de producción.
   */
  const isProductionReady = (recipe) => {
    if (!recipe) throw new Error('isProductionReady requiere una receta');
    const reasons = [];
    if (recipe.status !== 'approved') {
      reasons.push(`la receta no está aprobada (estado actual: ${LIFECYCLE_LABELS[recipe.status] || recipe.status || 'sin estado'})`);
    }
    const ingredients = recipe.recipe || recipe.ingredients || [];
    if (!ingredients.length) {
      reasons.push('la receta no tiene ingredientes');
    } else {
      const rv = recipeVersionRef();
      if (rv) {
        const total = rv.totalPct(ingredients);
        if (!rv.isMassBalancedTotal(total)) {
          reasons.push(`el balance de masa no cuadra (total ${total.toFixed(1)}%, se espera ~100%)`);
        }
      }
    }
    return { ready: reasons.length === 0, reasons };
  };

  const api = {
    LIFECYCLE_STATES,
    LIFECYCLE_LABELS,
    TRANSITIONS,
    canTransition,
    assertTransition,
    recipeIdentity,
    promote,
    newVersionFrom,
    assertEditable,
    buildProductionSnapshot,
    describeSnapshot,
    migrateLegacyRecipe,
    isProductionReady,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasRecipeLifecycle = api;
})();
