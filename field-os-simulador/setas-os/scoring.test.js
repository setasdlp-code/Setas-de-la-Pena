'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreRecipe, assessSeverity } = require('./scoring.js');

// ── Fixtures compartidas ──────────────────────────────────────────
// Especie de referencia: mismos rangos que p_ostreatus_gris en simulador-app.jsx
const SP = {
  name: 'Orellana Gris',
  cn_optimal: { min: 25, max: 50, ideal: 35 },
  n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 },
  ph_optimal: { min: 6.0, max: 7.5 },
  eb_baseline: 90,
  eb_optimal: 130,
  supplementation_max: 20,
};

const baseAn = (overrides = {}) => ({
  sp: SP,
  cn: 35,
  avgN: 1.4,
  avgPh: 6.75,
  eb: 100,
  ebIndex: 25,
  cost: 1000,
  tot: 100,
  suppP: 10,
  cafeP: 0,
  manP: 0,
  densaP: 0,
  airP: 20,
  trichoderma: false,
  incompat: [],
  ...overrides,
});

const baseCtx = (overrides = {}) => ({
  profileKey: 'produccion',
  treatment: { col: 'thermal' },
  stockIds: new Set(),
  criticals: 0,
  warnings: 0,
  ...overrides,
});

test('score se mantiene en [0,100] incluso con EB muy por debajo del baseline de la especie', () => {
  // Bug original: ebNorm = (eb-eb_baseline)/(eb_optimal-eb_baseline) sin piso en 0
  // podía dar recipeScore negativo. eb=20 está muy por debajo de eb_baseline=90.
  const an = baseAn({ eb: 20, ebIndex: 0 });
  const result = scoreRecipe(an, baseCtx());
  assert.ok(result.score >= 0 && result.score <= 100, `score fuera de rango: ${result.score}`);
});

test('nutrition se mantiene alto (>=90) en cualquier punto dentro del rango óptimo de C:N, no solo en el ideal', () => {
  // Bug original: cnNear = 1 - |cn-ideal|/(max-min) usaba el rango completo
  // como tolerancia. Con ideal=35 no centrado en [25,50], el borde superior
  // (cn=50) caía a cnNear=0.40 y el inferior (cn=25) a 0.60 — asimétrico y
  // penalizaba con dureza estar dentro del rango que la propia especie
  // declara óptimo. La corrección normaliza por semi-rango a cada lado del
  // ideal, así que cualquier punto dentro de [min,max] vale >=90.
  const atUpperEdge = scoreRecipe(baseAn({ cn: 50 }), baseCtx());
  const atLowerEdge = scoreRecipe(baseAn({ cn: 25 }), baseCtx());
  const atIdeal = scoreRecipe(baseAn({ cn: 35 }), baseCtx());

  assert.ok(atUpperEdge.breakdown.nutrition >= 90, `borde superior: ${atUpperEdge.breakdown.nutrition}`);
  assert.ok(atLowerEdge.breakdown.nutrition >= 90, `borde inferior: ${atLowerEdge.breakdown.nutrition}`);
  assert.equal(atIdeal.breakdown.nutrition, 100, 'en el C:N ideal, nutrition debe ser exactamente 100');
});

test('cost es monótono no-creciente al subir el costo — una sola escala, sin las dos tablas incompatibles del código original', () => {
  // Bug original: recipeScore usaba cost<2000→1.0 / <3500→0.7 / <5500→0.4 / else 0.15
  // mientras runAutoOptimizer usaba cost<800→100 / <1500→70 / <2500→45 / else 20.
  // Un costo de 1900 caía en la MEJOR categoría de una tabla y en la SEGUNDA
  // PEOR de la otra. Con una sola escala, subir el costo nunca puede subir el score.
  const costs = [500, 900, 1600, 2600, 3600, 5600, 9000];
  const scores = costs.map((cost) => scoreRecipe(baseAn({ cost }), baseCtx()).breakdown.cost);
  for (let i = 1; i < scores.length; i++) {
    assert.ok(
      scores[i] <= scores[i - 1],
      `cost=${costs[i]} (score ${scores[i]}) no debe superar a cost=${costs[i - 1]} (score ${scores[i - 1]})`
    );
  }
});

test('cost usa el costo real inyectado de Bodega y conserva el catálogo como fallback', () => {
  const an = baseAn({ cost: 700 });
  const catalog = scoreRecipe(an, baseCtx());
  const inventory = scoreRecipe(an, baseCtx({ realCost: 4200 }));

  assert.equal(catalog.breakdown.cost, 100);
  assert.equal(inventory.breakdown.cost, 25);
  assert.equal(inventory.costDetail.source, 'inventory');
  assert.equal(inventory.costDetail.value, 4200);
  assert.equal(catalog.costDetail.source, 'catalog');
  assert.equal(catalog.costDetail.value, 700);
});

test('cost ignora un costo real inválido en vez de convertirlo silenciosamente en costo cero', () => {
  const an = baseAn({ cost: 1700 });
  const result = scoreRecipe(an, baseCtx({ realCost: Number.NaN }));
  assert.equal(result.breakdown.cost, 65);
  assert.deepEqual(result.costDetail, { value: 1700, source: 'catalog' });
});

test('risk cae fuertemente cuando la receta dispara Trichoderma', () => {
  // calcRiskScore original recibía (recipe, an, sKey, treatment, ings) pero
  // solo leía an y treatment — los otros tres eran parámetros muertos que
  // sugerían una dependencia inexistente. La reimplementación toma solo lo
  // que de verdad usa, expuesto vía an/ctx.treatment.
  const safe = scoreRecipe(baseAn({ trichoderma: false }), baseCtx());
  const risky = scoreRecipe(baseAn({ trichoderma: true }), baseCtx());
  assert.ok(risky.breakdown.risk < safe.breakdown.risk - 30, `risk no cayó lo suficiente: seguro=${safe.breakdown.risk} riesgoso=${risky.breakdown.risk}`);
});

test('treatment penaliza con dureza no escalar a autoclave cuando hay Trichoderma, sin importar el perfil activo', () => {
  // Bug original: el Perito (treatmentScore13) y el optimizador (treatScore
  // en runAutoOptimizer) median cosas distintas bajo el mismo nombre — uno
  // evaluaba riesgo real, el otro solo si coincidía con profile.preferTreatment.
  // Con la unificación, escalar a autoclave ante Trichoderma es correcto en
  // CUALQUIER perfil; no escalar es grave incluso si el perfil "prefiere" otra cosa.
  const an = baseAn({ trichoderma: true });
  const escalatedCtx = baseCtx({ treatment: { col: 'autoclave' } });
  const notEscalatedCtx = baseCtx({ treatment: { col: 'thermal' } });

  const escalated = scoreRecipe(an, escalatedCtx);
  const notEscalated = scoreRecipe(an, notEscalatedCtx);

  assert.ok(escalated.breakdown.treatment >= 90, `escalar a autoclave debe puntuar alto: ${escalated.breakdown.treatment}`);
  assert.ok(notEscalated.breakdown.treatment <= 20, `no escalar debe puntuar muy bajo: ${notEscalated.breakdown.treatment}`);
});

test('massBalance premia un total cercano a 100% y penaliza desviaciones grandes', () => {
  const balanced = scoreRecipe(baseAn({ tot: 100 }), baseCtx());
  const mild = scoreRecipe(baseAn({ tot: 102 }), baseCtx());
  const bad = scoreRecipe(baseAn({ tot: 90 }), baseCtx());
  assert.equal(balanced.breakdown.massBalance, 100);
  assert.ok(mild.breakdown.massBalance < balanced.breakdown.massBalance);
  assert.ok(bad.breakdown.massBalance < mild.breakdown.massBalance);
});

test('stock es 100 cuando no hay restricción de bodega, y cae proporcionalmente cuando la receta no está cubierta por el stock disponible', () => {
  const noStockConstraint = scoreRecipe(baseAn(), baseCtx({ stockIds: new Set() }));
  assert.equal(noStockConstraint.breakdown.stock, 100);

  const recipe = [{ id: 'aserrin_eucalipto' }, { id: 'salvado_trigo' }];
  const fullyCovered = scoreRecipe(baseAn(), baseCtx({ stockIds: new Set(['aserrin_eucalipto', 'salvado_trigo']), recipe }));
  const halfCovered = scoreRecipe(baseAn(), baseCtx({ stockIds: new Set(['aserrin_eucalipto']), recipe }));
  assert.equal(fullyCovered.breakdown.stock, 100);
  assert.equal(halfCovered.breakdown.stock, 50);
});

test('score nunca supera 55 si hay items críticos, ni 88 si hay warnings — y status nunca contradice esos techos', () => {
  // Bug original: runAutoOptimizer.evalRec calculaba resultScore SIN aplicar
  // estos clamps (solo vivían en generateOptimizer/el Perito). Resultado: el
  // optimizador podía rankear #1 una receta que el Perito marcaría crítica.
  // Al vivir el clamp DENTRO de scoreRecipe, cualquier llamador —Perito u
  // optimizador— queda protegido igual.
  const withCriticals = scoreRecipe(baseAn({ eb: 130, cn: 35 }), baseCtx({ criticals: 2, warnings: 0 }));
  assert.ok(withCriticals.score <= 55, `score con criticals debe ser <=55: ${withCriticals.score}`);
  assert.notEqual(withCriticals.status, 'excellent');

  const withWarnings = scoreRecipe(baseAn({ eb: 130, cn: 35 }), baseCtx({ criticals: 0, warnings: 3 }));
  assert.ok(withWarnings.score <= 88, `score con warnings debe ser <=88: ${withWarnings.score}`);
});

test('el score es reconstruible: sin criticals/warnings, es exactamente la suma ponderada del breakdown — sin componentes ocultos', () => {
  // Con las 4 fórmulas originales (recipeScore, calcRiskScore, el compuesto
  // del Perito y el de runAutoOptimizer) era imposible verificar si los pesos
  // declarados en el código coincidían con lo que realmente se sumaba —
  // sobre todo porque recipeScore ya incluía EB y costo por dentro, y el
  // compuesto los volvía a sumar. Aquí Σ(breakdown[k] * weights[k]) === score.
  const result = scoreRecipe(baseAn(), baseCtx());
  const reconstructed = Math.round(
    Object.keys(result.breakdown).reduce((sum, k) => sum + result.breakdown[k] * result.weights[k], 0)
  );
  assert.equal(result.score, reconstructed);
  const weightSum = Object.values(result.weights).reduce((s, w) => s + w, 0);
  assert.ok(Math.abs(weightSum - 1) < 1e-9, `los pesos deben sumar 1.00, suman ${weightSum}`);
});

test('scoreRecipe es puro: no muta an ni ctx, y misma entrada produce siempre el mismo resultado', () => {
  // Precondición para que el Perito y el optimizador puedan compartir esta
  // misma función sin efectos colaterales cruzados entre llamadas — antes,
  // al ser fórmulas separadas, no había riesgo de mutación compartida, pero
  // tampoco garantía de que produjeran el mismo número (finding central).
  const an = baseAn();
  const ctx = baseCtx({ recipe: [{ id: 'aserrin_eucalipto' }] });
  const anSnapshot = JSON.parse(JSON.stringify(an));
  const ctxSnapshot = JSON.parse(JSON.stringify({ ...ctx, stockIds: [...ctx.stockIds] }));

  const first = scoreRecipe(an, ctx);
  const second = scoreRecipe(an, ctx);

  assert.deepEqual(an, anSnapshot, 'scoreRecipe no debe mutar an');
  assert.deepEqual({ ...ctx, stockIds: [...ctx.stockIds] }, ctxSnapshot, 'scoreRecipe no debe mutar ctx');
  assert.deepEqual(first, second, 'misma entrada debe producir el mismo resultado');
});

test('el Perito y el Optimizador obtienen el mismo score para la misma receta y el mismo perfil', () => {
  // Este es el hallazgo central de logic-lens: generateOptimizer (Perito) y
  // runAutoOptimizer (Optimizador) tenían fórmulas independientes con pesos
  // distintos (0.30/0.25/0.20/0.10/0.10/0.05 vs 0.28/0.22/0.18/0.14/0.10/0.08),
  // así que la receta #1 del Optimizador podía puntuar distinto al cargarla
  // en el Perito.
  //
  // Los ctx de abajo son DELIBERADAMENTE distintos, replicando lo que cada
  // sitio de llamada real construye — el Perito (generateOptimizer) nunca
  // pasa `profile`; el Optimizador (runAutoOptimizer) sí. La primera versión
  // de este test pasaba `profile` en AMBOS lados y por eso NO detectó que
  // scoreTreatment usaba profile.preferTreatment para dar un bonus de +25 —
  // solo la verificación manual en el navegador (recomendada tras cualquier
  // migración de scoring) lo sacó a la luz: la receta #1 puntuaba 92 en el
  // Optimizador y 89 al cargarla en el Perito. La corrección fue sacar
  // `profile` de scoreTreatment por completo (ver scoring.js) — así que
  // ambos ctx, aunque distintos, deben seguir dando el mismo score.
  const an = baseAn();
  const recipe = [{ id: 'aserrin_eucalipto' }, { id: 'salvado_trigo' }];
  const treatment = { col: 'autoclave' };
  const profile = { preferTreatment: ['thermal', 'autoclave'] };

  const asPerito = scoreRecipe(an, {
    treatment, recipe,
    stockIds: new Set(), criticals: 0, warnings: 0,
  });
  const asOptimizador = scoreRecipe(an, {
    profileKey: 'produccion', treatment, profile, recipe,
    stockIds: new Set(), criticals: 0, warnings: 0,
  });

  assert.deepEqual(asPerito, asOptimizador);
});

test('assessSeverity detecta criticals y warnings solo a partir de an/sp, sin depender del catálogo de ingredientes', () => {
  // Necesario para que runAutoOptimizer pueda aplicar los mismos clamps que
  // generateOptimizer sin reconstruir la lista completa de items (que hace
  // búsquedas costosas en el catálogo para sugerir ingredientes alternativos
  // — irrelevante para el optimizador, que solo necesita el conteo).
  const clean = assessSeverity(baseAn({ cn: 35, avgN: 1.4, avgPh: 6.75, eb: 128 })); // todo en el ideal, EB cerca del óptimo (130)
  assert.equal(clean.criticals, 0);
  assert.equal(clean.warnings, 0);

  const critical = assessSeverity(baseAn({ cn: 60 })); // fuera del rango óptimo (max 50)
  assert.ok(critical.criticals > 0);

  const warning = assessSeverity(baseAn({ cn: 49 })); // dentro del rango pero lejos del ideal (35)
  assert.equal(warning.criticals, 0);
  assert.ok(warning.warnings > 0);
});

test('risk cae más cuanto más se excede el límite de suplementación de la especie, no con una penalización plana', () => {
  // Bug original: runAutoOptimizer aplicaba, POR FUERA de cualquier fórmula
  // auditable, un suppPenalty=(an.suppP-suppLimit)*3 restado directamente del
  // resultScore final — invisible en el breakdown, imposible de reconstruir
  // desde los pesos declarados. Se absorbe aquí como parte del propio
  // componente risk, escalado por magnitud del exceso (antes era un +8/+20 fijo
  // sin importar si el exceso era de 1% o de 15%).
  // SP.supplementation_max = 20
  const smallExcess = scoreRecipe(baseAn({ suppP: 22 }), baseCtx({ treatment: { col: 'thermal' } }));
  const bigExcess = scoreRecipe(baseAn({ suppP: 35 }), baseCtx({ treatment: { col: 'thermal' } }));
  assert.ok(
    bigExcess.breakdown.risk < smallExcess.breakdown.risk,
    `exceso grande (${bigExcess.breakdown.risk}) debe penalizar más que exceso pequeño (${smallExcess.breakdown.risk})`
  );
});
