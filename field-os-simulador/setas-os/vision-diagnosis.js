'use strict';

/**
 * @file vision-diagnosis.js — Tamizaje visual offline de fotos de bolsa/bloque de cultivo.
 *
 * Analiza el color de una imagen (sin red, sin ML) para estimar cobertura de
 * micelio, sustrato visible y posibles señales de contaminación por color.
 *
 * IMPORTANTE (ver .claude/skills/agronomic-claims/SKILL.md): este módulo NO
 * diagnostica. Es un heurístico de clasificación de color con umbrales
 * `provenance: { class: 'heuristic' }`, confianza tope 'medium' (normalmente
 * 'low'), y todo resultado incluye un `disclaimer` explícito. La confirmación
 * de cualquier sospecha de patógeno requiere inspección visual/olfativa del
 * operario en campo — nunca se activa un flujo de contaminación solo por esto.
 *
 * ids de patógenos alineados con PATHOGENS_CATALOG de contamination-workflow.js.
 * Solo trichoderma y neurospora tienen una regla de color con especificidad
 * suficiente para emitir un `pathogenId`. La banda amarillo-marrón (posible
 * mancha bacteriana) y las zonas oscuras (v<0.18, posible pudrición) NO se
 * atribuyen a un patógeno por color absoluto — se solapan demasiado con
 * sustrato sano y sombras reales; ver FLAG_THRESHOLDS.dark_anomaly y el
 * comentario de classifyPixel (hallazgos de revisión #9 y #13).
 */

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SetasVisionDiagnosis = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DISCLAIMER =
    'Tamizaje de color asistido por software, no es un diagnóstico. ' +
    'Es una ayuda heurística offline; la confirmación de cualquier señal ' +
    'requiere inspección visual (y olfativa si aplica) del operario en campo.';

  const MAX_PIXELS_DEFAULT = 250000;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  /**
   * Convierte RGB (0-255) a HSV. h en grados [0,360), s y v en [0,1].
   */
  function rgbToHsv(r, g, b) {
    const rn = clamp01((Number(r) || 0) / 255);
    const gn = clamp01((Number(g) || 0) / 255);
    const bn = clamp01((Number(b) || 0) / 255);

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
      else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
      else h = 60 * ((rn - gn) / delta + 4);
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return { h, s, v };
  }

  /**
   * Tabla de clases de color. Todas son heurísticas afinadas sobre casos
   * sintéticos, no sobre un corpus fotográfico validado — de ahí `provenance`
   * y el tope de confianza en los resultados que las usan.
   */
  const COLOR_CLASSES = Object.freeze({
    mycelium: {
      id: 'mycelium',
      label: 'Micelio (blanco/crema)',
      provenance: {
        class: 'heuristic',
        note: 'Blanco/crema: saturación baja y valor alto. Regla afinada sobre casos sintéticos, sin corpus fotográfico validado.'
      }
    },
    substrate: {
      id: 'substrate',
      label: 'Sustrato (marrón/tostado)',
      provenance: {
        class: 'heuristic',
        note: 'Tonos marrón/tostado con saturación y valor medios. Incluye la banda amarillo-marrón que antes se ' +
          'clasificaba como bacterial_blotch: esa regla de color absoluta se retiró (ver dark_rot y FLAG_THRESHOLDS) ' +
          'porque no distinguía de forma confiable sustrato sano de mancha bacteriana; sustrato sano no debe generar ' +
          'una bandera de patógeno.'
      }
    },
    trichoderma: {
      id: 'trichoderma',
      label: 'Posible Trichoderma (verde)',
      provenance: {
        class: 'heuristic',
        note: 'Matiz verde ~70-170°, saturación >0.25. No distingue especie; solo color dominante verde.'
      }
    },
    neurospora: {
      id: 'neurospora',
      label: 'Posible Neurospora (naranja/salmón)',
      provenance: {
        class: 'heuristic',
        note: 'Matiz naranja/salmón acotado 15-35°, saturación >=0.65 y valor >=0.75 (rango estrecho, afinado tras ' +
          'observar falsos positivos sobre sustrato de aserrín/viruta de encino). Puede seguir confundiéndose con ' +
          'sustrato muy anaranjado y brillante.'
      }
    },
    dark_rot: {
      id: 'dark_rot',
      label: 'Zona oscura / posible pudrición',
      provenance: {
        class: 'heuristic',
        note: 'Valor (v) < 0.18 sin importar matiz/saturación. Incluye sombras reales, no solo pudrición.'
      }
    },
    background: {
      id: 'background',
      label: 'Fondo / otro',
      provenance: {
        class: 'heuristic',
        note: 'Cualquier píxel que no cae en las reglas anteriores (p.ej. azules, rosados intensos, fondos plásticos).'
      }
    }
  });

  /**
   * Clasifica un píxel RGB en una de las COLOR_CLASSES.
   * Orden de evaluación: oscuro > micelio (blanco/crema) > verde > naranja/salmón
   * (banda estrecha) > sustrato (banda amplia, incluye amarillo-marrón) > fondo.
   *
   * NOTA (hallazgo de revisión #9): existía una regla absoluta de color para
   * 'bacterial_blotch' (amarillo-marrón, h 30-55°) que se solapaba con sustrato
   * sano recién mezclado (p.ej. paja o aserrín claro), generando falsas
   * banderas de contaminación bacteriana sobre sustrato sin problema alguno.
   * Se retiró: no hay clase de color propia confiable para distinguir mancha
   * bacteriana de sustrato sano por color absoluto. Esa banda de color ahora
   * cae en 'substrate'. Detectar mancha bacteriana requiere comparar contra
   * una línea base del mismo lote (ver compareSnapshots) o inspección directa.
   */
  function classifyPixel(r, g, b) {
    const { h, s, v } = rgbToHsv(r, g, b);

    // Muy oscuro domina cualquier otra regla de color.
    if (v < 0.18) return 'dark_rot';

    // Micelio: blanco/crema — baja saturación, valor alto.
    if (s < 0.18 && v > 0.55) return 'mycelium';

    // Verde: Trichoderma.
    if (h >= 70 && h <= 170 && s > 0.25) return 'trichoderma';

    // Naranja/salmón intenso y brillante: Neurospora. Banda estrecha y alta
    // en saturación/valor para no confundir sustrato de aserrín/viruta de
    // encino (más pálido y menos saturado) con la señal de patógeno.
    if (h >= 15 && h <= 35 && s >= 0.65 && v >= 0.75) return 'neurospora';

    // Sustrato: marrones/tostados en banda amplia de matiz cálido (incluye
    // la banda amarillo-marrón antes atribuida a bacterial_blotch).
    if (h >= 15 && h <= 55 && s >= 0.15 && s <= 0.9 && v >= 0.15 && v <= 0.9) {
      return 'substrate';
    }

    return 'background';
  }

  /**
   * Umbrales de fracción de área para levantar una bandera de posible
   * contaminación, por pathogenId (alineados con PATHOGENS_CATALOG).
   * Todos son heurísticos, no validados clínicamente.
   */
  const FLAG_THRESHOLDS = Object.freeze({
    trichoderma: {
      pathogenId: 'trichoderma',
      observar: 0.005,
      sospecha: 0.02,
      alerta: 0.06,
      provenance: { class: 'heuristic', note: 'Umbrales de fracción de área elegidos por criterio de diseño, no calibrados con fotos reales de bache.' }
    },
    neurospora: {
      pathogenId: 'neurospora',
      observar: 0.005,
      sospecha: 0.02,
      alerta: 0.05,
      provenance: { class: 'heuristic', note: 'Umbrales de fracción de área elegidos por criterio de diseño, no calibrados con fotos reales de bache.' }
    },
    // NOTA (hallazgo de revisión #13): dark_rot (v<0.18, sin importar matiz)
    // incluye sombras reales y zonas oscuras/húmedas de origen no patógeno; no
    // hay clase de color propia y confiable para ningún patógeno específico
    // ahí. Antes se mapeaba a 'mycogone', pero Mycogone es principalmente un
    // patógeno de Agaricus y esta app no cultiva Agaricus como especie
    // primaria — ese mapeo atribuía sombras a un patógeno improbable. Se
    // reemplaza por una bandera sin patógeno asignado (pathogenId: null,
    // anomalyId: 'anomalia_oscura'), que solo indica "zona oscura a revisar",
    // nunca un diagnóstico de especie de patógeno.
    dark_anomaly: {
      pathogenId: null,
      anomalyId: 'anomalia_oscura',
      observar: 0.02,
      sospecha: 0.08,
      alerta: 0.20,
      provenance: { class: 'heuristic', note: 'Zona oscura (v<0.18) sin atribución a un patógeno; incluye sombras reales. No se asigna a Mycogone ni a ningún otro patógeno específico. Confianza siempre baja.' }
    }
  });

  function severityFromFraction(thresholds, fraction) {
    if (fraction >= thresholds.alerta) return 'alerta';
    if (fraction >= thresholds.sospecha) return 'sospecha';
    if (fraction >= thresholds.observar) return 'observar';
    return null;
  }

  /**
   * Normaliza/valida una estructura tipo ImageData: { data, width, height }.
   * Devuelve null si es inválida o vacía.
   */
  function normalizeImageData(imageData) {
    if (!imageData || typeof imageData !== 'object') return null;
    const { data, width, height } = imageData;
    if (!data || typeof width !== 'number' || typeof height !== 'number') return null;
    if (width <= 0 || height <= 0) return null;
    const expectedLen = width * height * 4;
    if (!data.length || data.length < expectedLen) return null;
    return { data, width, height };
  }

  /**
   * Analiza un ImageData-like {data (RGBA), width, height} y produce fracciones
   * de color, % de colonización estimado, banderas de posible contaminación,
   * y una evaluación de calidad/usabilidad de la foto.
   *
   * @param {{data: Uint8ClampedArray|number[], width: number, height: number}} imageData
   * @param {{stride?: number, roi?: {x:number,y:number,w:number,h:number}}} [opts]
   */
  function analyzeImageData(imageData, opts = {}) {
    const img = normalizeImageData(imageData);

    if (!img) {
      return {
        pixelsAnalyzed: 0,
        fractions: {},
        colonizationPct: 0,
        flags: [],
        quality: { meanV: 0, overexposed: false, underexposed: false, usable: false },
        recommendation: 'Imagen inválida o vacía. Vuelve a tomar la foto asegurando buena luz y foco sobre la bolsa/bloque.',
        confidence: 'low',
        disclaimer: DISCLAIMER
      };
    }

    const { data, width, height } = img;

    // Región de interés (ROI), acotada a los límites de la imagen.
    let { x: rx, y: ry, w: rw, h: rh } = opts.roi || {};
    rx = Number.isFinite(rx) ? Math.max(0, Math.min(width - 1, Math.round(rx))) : 0;
    ry = Number.isFinite(ry) ? Math.max(0, Math.min(height - 1, Math.round(ry))) : 0;
    rw = Number.isFinite(rw) ? Math.max(1, Math.min(width - rx, Math.round(rw))) : width - rx;
    rh = Number.isFinite(rh) ? Math.max(1, Math.min(height - ry, Math.round(rh))) : height - ry;

    const totalRoiPixels = rw * rh;

    // Stride: si no se especifica, se calcula para acotar el análisis a
    // ~MAX_PIXELS_DEFAULT píxeles muestreados.
    let stride = Number(opts.stride);
    if (!Number.isFinite(stride) || stride < 1) {
      stride = Math.max(1, Math.floor(Math.sqrt(totalRoiPixels / MAX_PIXELS_DEFAULT)));
    }

    const counts = Object.create(null);
    Object.keys(COLOR_CLASSES).forEach((k) => { counts[k] = 0; });

    let pixelsAnalyzed = 0;
    let sumV = 0;
    let overexposedCount = 0;

    for (let yy = ry; yy < ry + rh; yy += stride) {
      for (let xx = rx; xx < rx + rw; xx += stride) {
        const idx = (yy * width + xx) * 4;
        if (idx + 2 >= data.length) continue;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const cls = classifyPixel(r, g, b);
        counts[cls] += 1;
        pixelsAnalyzed += 1;

        const { s, v } = rgbToHsv(r, g, b);
        sumV += v;
        // Sobreexpuesto: casi blanco puro (v muy alto, saturación casi nula).
        // Un bloque de micelio blanco bien iluminado (v~0.98 pero con algo de
        // matiz/sombra, s no ~0) no debe contar aquí (hallazgo de revisión #10).
        if (v > 0.99 && s < 0.02) overexposedCount += 1;
      }
    }

    const fractions = {};
    Object.keys(counts).forEach((k) => {
      fractions[k] = pixelsAnalyzed > 0 ? counts[k] / pixelsAnalyzed : 0;
    });

    const meanV = pixelsAnalyzed > 0 ? sumV / pixelsAnalyzed : 0;
    const overexposed = pixelsAnalyzed > 0 && overexposedCount / pixelsAnalyzed > 0.6;
    const underexposed = meanV < 0.2;
    const usable = pixelsAnalyzed > 0 && !overexposed && !underexposed;

    const myceliumFrac = fractions.mycelium || 0;
    const substrateFrac = fractions.substrate || 0;
    const contaminantFrac =
      (fractions.trichoderma || 0) +
      (fractions.neurospora || 0) +
      (fractions.dark_rot || 0);
    const colonizationDenom = myceliumFrac + substrateFrac + contaminantFrac;
    const colonizationPct = colonizationDenom > 0
      ? Math.round((myceliumFrac / colonizationDenom) * 1000) / 10
      : 0;

    const flags = [];
    if (usable) {
      const flagInputs = [
        { classId: 'trichoderma', thresholds: FLAG_THRESHOLDS.trichoderma },
        { classId: 'neurospora', thresholds: FLAG_THRESHOLDS.neurospora },
        { classId: 'dark_rot', thresholds: FLAG_THRESHOLDS.dark_anomaly }
      ];
      flagInputs.forEach(({ classId, thresholds }) => {
        const fraction = fractions[classId] || 0;
        const severity = severityFromFraction(thresholds, fraction);
        if (severity) {
          const flag = {
            pathogenId: thresholds.pathogenId ?? null,
            fraction: Math.round(fraction * 10000) / 10000,
            severity
          };
          if (thresholds.anomalyId) flag.anomalyId = thresholds.anomalyId;
          flags.push(flag);
        }
      });
    }

    let recommendation;
    let confidence = 'low';

    if (!usable) {
      if (overexposed) {
        recommendation = 'Foto sobreexpuesta (mucho brillo/reflejo). Repite la toma con menos luz directa o flash apagado.';
      } else if (underexposed) {
        recommendation = 'Foto subexpuesta (muy oscura). Repite la toma con más luz o acércate a una fuente de luz difusa.';
      } else {
        recommendation = 'Foto no utilizable para el tamizaje. Vuelve a tomarla con buena luz, foco nítido y encuadre sobre la bolsa/bloque.';
      }
    } else if (flags.some((f) => f.severity === 'alerta')) {
      recommendation = 'Señal de color fuerte compatible con contaminación. Inspecciona la bolsa/bloque en persona antes de decidir cuarentena o descarte.';
      confidence = 'low';
    } else if (flags.length > 0) {
      recommendation = 'Se detectaron señales de color a vigilar. Revisa visualmente la zona marcada en la próxima ronda.';
      confidence = 'low';
    } else if (colonizationPct >= 70) {
      // Hallazgo de revisión #19: los umbrales de este módulo se afinaron solo
      // sobre casos sintéticos, sin corpus fotográfico validado. No hay base
      // para declarar 'medium' aquí; confidence se queda en 'low' siempre.
      recommendation = 'Colonización visual alta y sin señales de color relevantes. Continúa el monitoreo habitual.';
    } else {
      recommendation = 'Sin señales de color relevantes. Continúa el monitoreo habitual del lote.';
      confidence = 'low';
    }

    return {
      pixelsAnalyzed,
      fractions,
      colonizationPct,
      flags,
      quality: {
        meanV: Math.round(meanV * 1000) / 1000,
        overexposed,
        underexposed,
        usable
      },
      recommendation,
      confidence,
      disclaimer: DISCLAIMER
    };
  }

  function trendLabel(deltaPct, epsilon) {
    if (deltaPct > epsilon) return 'avanza';
    if (deltaPct < -epsilon) return 'retrocede';
    return 'estancado';
  }

  /**
   * Compara dos resultados de analyzeImageData (mismo lote, distinto momento)
   * y produce deltas de colonización y de contaminantes, con etiqueta de
   * tendencia y banderas nuevas o crecientes.
   */
  function compareSnapshots(prev, next) {
    const safePrev = prev && typeof prev === 'object' ? prev : {};
    const safeNext = next && typeof next === 'object' ? next : {};

    const prevColonization = Number(safePrev.colonizationPct) || 0;
    const nextColonization = Number(safeNext.colonizationPct) || 0;
    const colonizationDeltaPct = Math.round((nextColonization - prevColonization) * 10) / 10;

    const prevFractions = safePrev.fractions || {};
    const nextFractions = safeNext.fractions || {};
    const contaminantIds = ['trichoderma', 'neurospora', 'dark_rot'];

    const contaminantDeltas = {};
    contaminantIds.forEach((id) => {
      const before = Number(prevFractions[id]) || 0;
      const after = Number(nextFractions[id]) || 0;
      contaminantDeltas[id] = Math.round((after - before) * 10000) / 10000;
    });

    const trend = trendLabel(colonizationDeltaPct, 1);

    const prevFlags = Array.isArray(safePrev.flags) ? safePrev.flags : [];
    const nextFlags = Array.isArray(safeNext.flags) ? safeNext.flags : [];
    const severityRank = { observar: 1, sospecha: 2, alerta: 3 };

    const newOrGrowingFlags = [];
    nextFlags.forEach((flag) => {
      const before = prevFlags.find((f) => f.pathogenId === flag.pathogenId);
      if (!before) {
        newOrGrowingFlags.push({ ...flag, status: 'nueva' });
      } else if ((severityRank[flag.severity] || 0) > (severityRank[before.severity] || 0)) {
        newOrGrowingFlags.push({ ...flag, status: 'creciente', previousSeverity: before.severity });
      }
    });

    return {
      colonizationDeltaPct,
      contaminantDeltas,
      trend,
      newOrGrowingFlags,
      confidence: 'low',
      disclaimer: DISCLAIMER
    };
  }

  /**
   * Helper de navegador: dibuja un HTMLImageElement/HTMLCanvasElement/ImageBitmap
   * escalado (máx. 640px por lado) sobre un canvas y ejecuta analyzeImageData.
   * No disponible en Node.
   */
  function analyzeImageElement(el, opts = {}) {
    const hasDom = typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined';
    if (!hasDom) {
      throw new Error('analyzeImageElement solo está disponible en navegador (requiere canvas/OffscreenCanvas).');
    }
    if (!el) throw new Error('analyzeImageElement requiere un elemento de imagen/canvas/bitmap válido.');

    const naturalW = el.naturalWidth || el.width || el.videoWidth || 0;
    const naturalH = el.naturalHeight || el.height || el.videoHeight || 0;
    if (!naturalW || !naturalH) {
      throw new Error('No se pudo determinar el tamaño de la imagen a analizar.');
    }

    const maxSide = 640;
    const scale = Math.min(1, maxSide / Math.max(naturalW, naturalH));
    const targetW = Math.max(1, Math.round(naturalW * scale));
    const targetH = Math.max(1, Math.round(naturalH * scale));

    let canvas;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(targetW, targetH);
    } else {
      canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener contexto 2D de canvas para el análisis.');
    ctx.drawImage(el, 0, 0, targetW, targetH);

    const imageData = ctx.getImageData(0, 0, targetW, targetH);
    return analyzeImageData(imageData, opts);
  }

  return Object.freeze({
    DISCLAIMER,
    COLOR_CLASSES,
    FLAG_THRESHOLDS,
    rgbToHsv,
    classifyPixel,
    analyzeImageData,
    compareSnapshots,
    analyzeImageElement
  });
});
