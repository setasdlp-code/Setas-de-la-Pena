'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  COLOR_CLASSES,
  FLAG_THRESHOLDS,
  rgbToHsv,
  classifyPixel,
  analyzeImageData,
  compareSnapshots,
  analyzeImageElement
} = require('./vision-diagnosis.js');

// --- Colores de referencia por clase, elegidos para caer con margen dentro
// --- de cada regla de classifyPixel.
const COLORS = {
  mycelium: [240, 238, 232],       // blanco/crema: s baja, v alta
  substrate: [130, 90, 55],        // marrón tostado (v y s moderados, fuera del rango de neurospora)
  trichoderma: [30, 150, 45],      // verde
  neurospora: [255, 140, 60],      // naranja/salmón intenso: h~25°, s~0.76, v=1 (dentro de la banda estrecha afinada)
  amarillo_marron: [190, 160, 80], // banda antes clasificada como bacterial_blotch: ahora debe caer en substrate
  dark_rot: [15, 15, 12],          // muy oscuro
  background: [40, 60, 220],       // azul, no cae en ninguna regla cálida
  // Colores de sustrato reales de la granja (hallazgo de revisión #9): antes
  // se clasificaban erróneamente como bacterial_blotch/neurospora.
  straw: [200, 170, 110],          // paja: h=40°, s=0.45, v=0.78
  sawdust: [180, 140, 90],         // aserrín: h=33°, s=0.5, v=0.71
  oakShavings: [195, 165, 115],    // viruta de encino: h=37.5°, s=0.41, v=0.76
  // Micelio muy iluminado pero no puramente blanco (hallazgo de revisión #10).
  brightMycelium: [250, 245, 240]  // v=0.98, s=0.04 — no debe marcarse sobreexpuesto
};

/** Crea un ImageData-like plano de un solo color RGBA. */
function makeSolidImage(width, height, [r, g, b], alpha = 255) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = alpha;
  }
  return { data, width, height };
}

/** Crea una imagen dividida en bandas verticales, cada una de un color. */
function makeBandedImage(width, height, colors) {
  const data = new Uint8ClampedArray(width * height * 4);
  const bandW = Math.floor(width / colors.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bandIdx = Math.min(colors.length - 1, Math.floor(x / bandW));
      const [r, g, b] = colors[bandIdx];
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  return { data, width, height };
}

// ---------------------------------------------------------------------------
// rgbToHsv
// ---------------------------------------------------------------------------

test('rgbToHsv: blanco puro es s=0, v=1', () => {
  const { h, s, v } = rgbToHsv(255, 255, 255);
  assert.equal(s, 0);
  assert.equal(v, 1);
  assert.equal(h, 0);
});

test('rgbToHsv: negro puro es v=0', () => {
  const { s, v } = rgbToHsv(0, 0, 0);
  assert.equal(v, 0);
  assert.equal(s, 0);
});

test('rgbToHsv: verde puro tiene matiz ~120', () => {
  const { h, s, v } = rgbToHsv(0, 255, 0);
  assert.equal(h, 120);
  assert.equal(s, 1);
  assert.equal(v, 1);
});

test('rgbToHsv: rojo puro tiene matiz 0', () => {
  const { h } = rgbToHsv(255, 0, 0);
  assert.equal(h, 0);
});

// ---------------------------------------------------------------------------
// classifyPixel — una clase por cada color de referencia
// ---------------------------------------------------------------------------

test('classifyPixel: blanco/crema clasifica como mycelium', () => {
  assert.equal(classifyPixel(...COLORS.mycelium), 'mycelium');
});

test('classifyPixel: marrón tostado clasifica como substrate', () => {
  assert.equal(classifyPixel(...COLORS.substrate), 'substrate');
});

test('classifyPixel: verde clasifica como trichoderma', () => {
  assert.equal(classifyPixel(...COLORS.trichoderma), 'trichoderma');
});

test('classifyPixel: naranja/salmón brillante clasifica como neurospora', () => {
  assert.equal(classifyPixel(...COLORS.neurospora), 'neurospora');
});

// Hallazgo de revisión #9: la regla absoluta de color 'bacterial_blotch' se
// retiró porque marcaba sustrato sano como posible contaminación bacteriana.
// La banda amarillo-marrón ahora cae en 'substrate'.
test('classifyPixel: amarillo-marrón medio clasifica como substrate (bacterial_blotch retirado)', () => {
  assert.equal(classifyPixel(...COLORS.amarillo_marron), 'substrate');
});

test('classifyPixel: paja (straw) real de sustrato clasifica como substrate, no como patógeno', () => {
  assert.equal(classifyPixel(...COLORS.straw), 'substrate');
});

test('classifyPixel: aserrín (sawdust) real de sustrato clasifica como substrate, no neurospora', () => {
  assert.equal(classifyPixel(...COLORS.sawdust), 'substrate');
});

test('classifyPixel: viruta de encino (oak shavings) real de sustrato clasifica como substrate', () => {
  assert.equal(classifyPixel(...COLORS.oakShavings), 'substrate');
});

test('classifyPixel: muy oscuro clasifica como dark_rot sin importar matiz', () => {
  assert.equal(classifyPixel(...COLORS.dark_rot), 'dark_rot');
  // Un verde muy oscuro también debe ser dark_rot, no trichoderma.
  assert.equal(classifyPixel(5, 20, 5), 'dark_rot');
});

test('classifyPixel: azul fuera de las bandas cálidas clasifica como background', () => {
  assert.equal(classifyPixel(...COLORS.background), 'background');
});

test('COLOR_CLASSES: todas las clases están congeladas y tienen provenance heuristic', () => {
  assert.ok(Object.isFrozen(COLOR_CLASSES));
  Object.values(COLOR_CLASSES).forEach((cls) => {
    assert.equal(cls.provenance.class, 'heuristic');
    assert.ok(typeof cls.provenance.note === 'string' && cls.provenance.note.length > 0);
  });
});

test('FLAG_THRESHOLDS: cada entrada tiene provenance heuristic y umbrales crecientes', () => {
  Object.values(FLAG_THRESHOLDS).forEach((t) => {
    assert.equal(t.provenance.class, 'heuristic');
    assert.ok(t.observar < t.sospecha);
    assert.ok(t.sospecha < t.alerta);
  });
});

// ---------------------------------------------------------------------------
// analyzeImageData — robustez
// ---------------------------------------------------------------------------

test('analyzeImageData: imagen vacía (null) es no usable y sin banderas', () => {
  const result = analyzeImageData(null);
  assert.equal(result.pixelsAnalyzed, 0);
  assert.equal(result.quality.usable, false);
  assert.deepEqual(result.flags, []);
  assert.equal(result.confidence, 'low');
  assert.ok(result.disclaimer.length > 0);
});

test('analyzeImageData: data con longitud menor a width*height*4 es tratada como inválida', () => {
  const bad = { data: new Uint8ClampedArray(4), width: 10, height: 10 };
  const result = analyzeImageData(bad);
  assert.equal(result.pixelsAnalyzed, 0);
  assert.equal(result.quality.usable, false);
});

test('analyzeImageData: imagen toda negra es underexposed y no usable', () => {
  const img = makeSolidImage(20, 20, [0, 0, 0]);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.underexposed, true);
  assert.equal(result.quality.usable, false);
  assert.deepEqual(result.flags, []);
  assert.match(result.recommendation, /oscura|no utilizable/i);
});

test('analyzeImageData: imagen toda blanca es overexposed y no usable', () => {
  const img = makeSolidImage(20, 20, [255, 255, 255]);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.overexposed, true);
  assert.equal(result.quality.usable, false);
  assert.match(result.recommendation, /sobreexpuesta/i);
});

test('analyzeImageData: imagen homogénea de micelio da colonizationPct alto y es usable', () => {
  const img = makeSolidImage(30, 30, COLORS.mycelium);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.usable, true);
  assert.ok(result.fractions.mycelium > 0.99);
  assert.equal(result.colonizationPct, 100);
  assert.deepEqual(result.flags, []);
  // Hallazgo de revisión #19: los umbrales solo se afinaron sobre casos
  // sintéticos, sin corpus fotográfico validado — nunca debe declarar 'medium'.
  assert.equal(result.confidence, 'low');
});

// ---------------------------------------------------------------------------
// Hallazgo de revisión #9 — sustrato sano no debe producir banderas de patógeno
// ---------------------------------------------------------------------------

test('analyzeImageData: imagen homogénea de paja (straw) es substrate puro, sin banderas', () => {
  const img = makeSolidImage(30, 30, COLORS.straw);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.usable, true);
  assert.ok(result.fractions.substrate > 0.99);
  assert.deepEqual(result.flags, []);
});

test('analyzeImageData: imagen homogénea de aserrín (sawdust) es substrate puro, sin banderas', () => {
  const img = makeSolidImage(30, 30, COLORS.sawdust);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.usable, true);
  assert.ok(result.fractions.substrate > 0.99);
  assert.deepEqual(result.flags, []);
});

test('analyzeImageData: imagen homogénea de viruta de encino es substrate puro, sin banderas', () => {
  const img = makeSolidImage(30, 30, COLORS.oakShavings);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.usable, true);
  assert.ok(result.fractions.substrate > 0.99);
  assert.deepEqual(result.flags, []);
});

test('analyzeImageData: imagen mixta de solo sustratos sanos (paja/aserrín/encino) no da ninguna bandera', () => {
  const img = makeBandedImage(90, 20, [COLORS.straw, COLORS.sawdust, COLORS.oakShavings]);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.usable, true);
  assert.deepEqual(result.flags, []);
});

// ---------------------------------------------------------------------------
// Hallazgo de revisión #10 — micelio muy iluminado no debe marcarse sobreexpuesto
// ---------------------------------------------------------------------------

test('analyzeImageData: bolsa de micelio bien iluminada (v~0.98) sigue siendo usable con colonización alta', () => {
  const img = makeSolidImage(30, 30, COLORS.brightMycelium);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.overexposed, false);
  assert.equal(result.quality.usable, true);
  assert.equal(result.colonizationPct, 100);
});

test('analyzeImageData: blanco puro (v=1, s=0) sí se marca sobreexpuesto', () => {
  const img = makeSolidImage(20, 20, [255, 255, 255]);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.overexposed, true);
  assert.equal(result.quality.usable, false);
});

// ---------------------------------------------------------------------------
// Hallazgo de revisión #13 — zona oscura ya no se atribuye a Mycogone
// ---------------------------------------------------------------------------

test('analyzeImageData: zona oscura extensa genera bandera sin patógeno asignado (anomalia_oscura), no mycogone', () => {
  // 1/3 de zona oscura sobre sustrato: supera el umbral de alerta (0.20) para
  // dark_anomaly sin hacer que la imagen completa sea subexpuesta (meanV>=0.2).
  const img = makeBandedImage(30, 10, [COLORS.substrate, COLORS.substrate, COLORS.dark_rot]);
  const result = analyzeImageData(img, { stride: 1 });
  assert.equal(result.quality.usable, true);
  const flag = result.flags.find((f) => f.anomalyId === 'anomalia_oscura');
  assert.ok(flag, 'debe existir la bandera de anomalía oscura');
  assert.equal(flag.pathogenId, null);
  assert.ok(!result.flags.some((f) => f.pathogenId === 'mycogone'), 'no debe aparecer mycogone');
});

test('analyzeImageData: banda de trichoderma por encima de "alerta" genera bandera alerta', () => {
  // 10% de trichoderma, resto sustrato -> supera el umbral de alerta (6%).
  const colors = [];
  for (let i = 0; i < 9; i++) colors.push(COLORS.substrate);
  colors.push(COLORS.trichoderma);
  const img = makeBandedImage(100, 20, colors);
  const result = analyzeImageData(img, { stride: 1 });

  assert.equal(result.quality.usable, true);
  const flag = result.flags.find((f) => f.pathogenId === 'trichoderma');
  assert.ok(flag, 'debe haber bandera de trichoderma');
  assert.equal(flag.severity, 'alerta');
  assert.match(result.recommendation, /contaminación/i);
});

test('analyzeImageData: banda pequeña de trichoderma (~1%) genera severidad "observar"', () => {
  const colors = new Array(99).fill(COLORS.substrate);
  colors.push(COLORS.trichoderma);
  const img = makeBandedImage(300, 10, colors); // ~1/100 del área
  const result = analyzeImageData(img, { stride: 1 });

  const flag = result.flags.find((f) => f.pathogenId === 'trichoderma');
  assert.ok(flag);
  assert.equal(flag.severity, 'observar');
});

test('analyzeImageData: mezcla mycelium/substrate sin contaminantes no genera banderas', () => {
  const img = makeBandedImage(40, 20, [COLORS.mycelium, COLORS.substrate]);
  const result = analyzeImageData(img, { stride: 1 });
  assert.deepEqual(result.flags, []);
  assert.ok(result.colonizationPct > 0 && result.colonizationPct < 100);
});

test('analyzeImageData: respeta ROI, analizando solo la subregión indicada', () => {
  // Imagen mitad micelio (izquierda) mitad trichoderma (derecha).
  const img = makeBandedImage(40, 20, [COLORS.mycelium, COLORS.trichoderma]);
  const roiLeft = analyzeImageData(img, { stride: 1, roi: { x: 0, y: 0, w: 20, h: 20 } });
  const roiRight = analyzeImageData(img, { stride: 1, roi: { x: 20, y: 0, w: 20, h: 20 } });

  assert.ok(roiLeft.fractions.mycelium > 0.9);
  assert.ok(roiRight.fractions.trichoderma > 0.9);
});

test('analyzeImageData: stride reduce pixelsAnalyzed de forma consistente', () => {
  const img = makeSolidImage(50, 50, COLORS.substrate);
  const full = analyzeImageData(img, { stride: 1 });
  const sampled = analyzeImageData(img, { stride: 5 });
  assert.ok(sampled.pixelsAnalyzed < full.pixelsAnalyzed);
  assert.ok(sampled.pixelsAnalyzed > 0);
  // Con color homogéneo, la clasificación no debe cambiar por el muestreo.
  assert.equal(sampled.fractions.substrate, full.fractions.substrate);
});

test('analyzeImageData: imagen grande usa stride por defecto para acotar el trabajo', () => {
  // 1000x1000 = 1e6 píxeles, muy por encima de MAX_PIXELS_DEFAULT (~250k).
  const img = makeSolidImage(1000, 1000, COLORS.mycelium);
  const result = analyzeImageData(img);
  assert.ok(result.pixelsAnalyzed > 0);
  assert.ok(result.pixelsAnalyzed <= 300000);
});

test('analyzeImageData: siempre incluye confidence "low" o "medium", nunca "high"', () => {
  const cases = [
    makeSolidImage(10, 10, COLORS.mycelium),
    makeSolidImage(10, 10, COLORS.substrate),
    makeBandedImage(50, 10, [COLORS.substrate, COLORS.trichoderma])
  ];
  cases.forEach((img) => {
    const result = analyzeImageData(img, { stride: 1 });
    assert.ok(['low', 'medium'].includes(result.confidence));
  });
});

// ---------------------------------------------------------------------------
// compareSnapshots
// ---------------------------------------------------------------------------

test('compareSnapshots: colonización creciente da tendencia "avanza"', () => {
  const prev = { colonizationPct: 40, fractions: { trichoderma: 0 }, flags: [] };
  const next = { colonizationPct: 55, fractions: { trichoderma: 0 }, flags: [] };
  const cmp = compareSnapshots(prev, next);
  assert.equal(cmp.trend, 'avanza');
  assert.equal(cmp.colonizationDeltaPct, 15);
});

test('compareSnapshots: colonización decreciente da tendencia "retrocede"', () => {
  const prev = { colonizationPct: 60, fractions: {}, flags: [] };
  const next = { colonizationPct: 45, fractions: {}, flags: [] };
  const cmp = compareSnapshots(prev, next);
  assert.equal(cmp.trend, 'retrocede');
});

test('compareSnapshots: cambio mínimo de colonización da tendencia "estancado"', () => {
  const prev = { colonizationPct: 50, fractions: {}, flags: [] };
  const next = { colonizationPct: 50.4, fractions: {}, flags: [] };
  const cmp = compareSnapshots(prev, next);
  assert.equal(cmp.trend, 'estancado');
});

test('compareSnapshots: detecta bandera nueva de trichoderma', () => {
  const prev = { colonizationPct: 50, fractions: { trichoderma: 0 }, flags: [] };
  const next = {
    colonizationPct: 50,
    fractions: { trichoderma: 0.03 },
    flags: [{ pathogenId: 'trichoderma', fraction: 0.03, severity: 'sospecha' }]
  };
  const cmp = compareSnapshots(prev, next);
  assert.equal(cmp.newOrGrowingFlags.length, 1);
  assert.equal(cmp.newOrGrowingFlags[0].status, 'nueva');
});

test('compareSnapshots: detecta bandera creciente (sospecha -> alerta)', () => {
  const prev = {
    colonizationPct: 50,
    fractions: { trichoderma: 0.03 },
    flags: [{ pathogenId: 'trichoderma', fraction: 0.03, severity: 'sospecha' }]
  };
  const next = {
    colonizationPct: 48,
    fractions: { trichoderma: 0.08 },
    flags: [{ pathogenId: 'trichoderma', fraction: 0.08, severity: 'alerta' }]
  };
  const cmp = compareSnapshots(prev, next);
  assert.equal(cmp.newOrGrowingFlags.length, 1);
  assert.equal(cmp.newOrGrowingFlags[0].status, 'creciente');
  assert.equal(cmp.newOrGrowingFlags[0].previousSeverity, 'sospecha');
});

test('compareSnapshots: robusto ante entradas vacías/indefinidas', () => {
  const cmp = compareSnapshots(undefined, undefined);
  assert.equal(cmp.colonizationDeltaPct, 0);
  assert.equal(cmp.trend, 'estancado');
  assert.deepEqual(cmp.newOrGrowingFlags, []);
});

// ---------------------------------------------------------------------------
// analyzeImageElement — solo navegador
// ---------------------------------------------------------------------------

test('analyzeImageElement: lanza error claro en entorno Node (sin DOM)', () => {
  assert.throws(() => analyzeImageElement({}), /navegador/i);
});
