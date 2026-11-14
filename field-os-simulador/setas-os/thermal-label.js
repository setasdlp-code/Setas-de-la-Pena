(function () {
'use strict';
// Etiquetas térmicas: QR en SVG, especificaciones por tamaño y dibujo en canvas
// para compartir o imprimir. Extraído de simulador-app.jsx sin cambios de
// contenido. El componente React ThermalLabelCard sigue en el JSX y consume
// este módulo.

const generateQrSvgDataUrl = (text) => {
  try {
    const qrMini = typeof window !== 'undefined' ? window.QRMini : (typeof globalThis !== 'undefined' ? globalThis.QRMini : null);
    if (!qrMini || typeof qrMini.matrix !== 'function') {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 10 10"><rect width="10" height="10" fill="%23000"/></svg>';
    }
    const m = qrMini.matrix(text || 'SETAS-OS');
    const n = m.length;
    const q = 4;
    const dim = n + q * 2;
    let rects = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (m[r][c]) rects += `<rect x="${c + q}" y="${r + q}" width="1" height="1"/>`;
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges"><rect width="${dim}" height="${dim}" fill="#fff"/><g fill="#000">${rects}</g></svg>`;
    return 'data:image/svg+xml;base64,' + (typeof btoa === 'function' ? btoa(svg) : Buffer.from(svg).toString('base64'));
  } catch (e) {
    return '';
  }
};

// Render de la etiqueta térmica a <canvas> para "Compartir" — el Phomemo M110
// es Bluetooth propietario, no AirPrint, así que window.print() nunca lo
// detecta desde Safari/iOS (WebKit tampoco expone Web Bluetooth). En vez de
// depender de una captura de pantalla manual, se genera aquí la misma
// información que ya pinta la vista previa (QR + especie + código + fecha)
// directo a un PNG que el share sheet del sistema puede mandar a la app de
// Phomemo en un solo toque.
// Escala de exportación: cuántos px de canvas equivalen a 1mm real de la
// etiqueta. 12 da buena nitidez sin generar PNGs pesados en el share sheet.
const THERMAL_PX_PER_MM = 12;
// 1mm de CSS a 96dpi (el estándar del navegador) son 3.7795px — todo valor
// del diseño que en sim.css está en px (fuentes, gaps, letter-spacing), no en
// mm, se reescala con este factor para guardar la misma proporción visual
// que ve el operador en la vista previa, sin importar THERMAL_PX_PER_MM.
const CSS_PX_PER_MM = 96 / 25.4;
const cssPxToCanvas = (px) => px * (THERMAL_PX_PER_MM / CSS_PX_PER_MM);
const FONT_EDITORIAL = "'Gaya Patched','Iowan Old Style',Georgia,serif";
const FONT_SANS = "'IBM Plex Sans','Helvetica Neue',Arial,sans-serif";
const FONT_MONO = "'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace";
// Fuente única de la geometría y los tamaños de texto de la etiqueta (DS-2026 QR
// Maximizado). El PNG de "Compartir" los lee aquí y la vista previa/impresión los
// recibe vía thermalCardTypeVars(); sim.css no repite los px de texto.
const THERMAL_LABEL_SPECS = {
  '40x30': {
    wMm: 40,
    hMm: 30,
    padXMm: 1.5,
    padYMm: 1.5,
    gapPx: 5,
    qrMm: 23.5,
    eyebrowPx: 5.5,
    speciesPx: 11.0,
    badgePx: 6.5,
    codePx: 7.0,
    codeMarginTopPx: 1,
    metaPx: 6.0,
    metaMarginTopPx: 1.5
  },
  '50x30': {
    wMm: 50,
    hMm: 30,
    padXMm: 1.5,
    padYMm: 1.5,
    gapPx: 6,
    qrMm: 26.0,
    eyebrowPx: 6.5,
    speciesPx: 13.5,
    badgePx: 7.5,
    codePx: 8.0,
    codeMarginTopPx: 1.5,
    metaPx: 6.5,
    metaMarginTopPx: 2.0
  },
  // Vertical: logo blanco original, código Gaya, especie Plex Mono, QR, fecha y bolsa.
  // Mismos valores que .thermal-card-50x70 en sim.css.
  '50x70': {
    layout: 'vertical',
    wMm: 50,
    hMm: 70,
    padXMm: 1.5,
    padYMm: 2.5,
    gapPx: 6,
    qrMm: 34.0,
    spineMm: 10.0,
    logoMm: 16.0,
    speciesPx: 12.0,
    badgePx: 8.5,
    codePx: 18.0,
    datePx: 11.0,
    dateLabelPx: 6.5,
    metaPx: 7.0
  },
};

// Render de la etiqueta térmica a <canvas> para "Compartir" — el Phomemo M110
// es Bluetooth propietario, no AirPrint, así que window.print() nunca lo
// detecta desde Safari/iOS (WebKit tampoco expone Web Bluetooth). En vez de
// depender de una captura de pantalla manual, se genera aquí el mismo
// diseño que ya pinta la vista previa/impresión (.thermal-card-* en
// sim.css: QR a la izquierda, especie/código/fecha a la derecha) directo a
// un PNG que el share sheet del sistema puede mandar a PrintMaster.
// Divide texto en líneas para Canvas asegurando que ninguna exceda maxW y
// sin deformar ni aplastar horizontalmente los caracteres (evita fillText con maxWidth).
function wrapCanvasText(ctx, text, maxW) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width <= maxW) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      // Si una sola palabra/token excede maxW (como un código largo: SDP-260904-SHI-R01)
      if (ctx.measureText(word).width > maxW) {
        if (word.includes('-')) {
          const parts = word.split('-');
          let subLine = '';
          for (let p = 0; p < parts.length; p++) {
            const piece = (p < parts.length - 1) ? parts[p] + '-' : parts[p];
            const testSub = subLine ? subLine + piece : piece;
            if (ctx.measureText(testSub).width <= maxW) {
              subLine = testSub;
            } else {
              if (subLine) lines.push(subLine);
              subLine = piece;
            }
          }
          if (subLine) lines.push(subLine);
          currentLine = '';
        } else {
          let chunk = '';
          for (const ch of word) {
            if (ctx.measureText(chunk + ch).width <= maxW) {
              chunk += ch;
            } else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          currentLine = chunk;
        }
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawQrToCanvas(ctx, item, qrX, qrY, qrSize) {
  const qrMini = typeof window !== 'undefined' ? window.QRMini : null;
  if (!qrMini || typeof qrMini.matrix !== 'function') return;
  const m = qrMini.matrix(item.qrUrl || item.id || 'SETAS-OS');
  const n = m.length;
  const q = 4; // Quiet zone ISO/IEC 18004 (4 módulos)
  const cell = qrSize / (n + q * 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  ctx.fillStyle = '#000';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (m[r][c]) ctx.fillRect(Math.round(qrX + (c + q) * cell), Math.round(qrY + (r + q) * cell), Math.ceil(cell), Math.ceil(cell));
    }
  }
}

// Shared geometry for preview, print and PNG. Dates use calendar fields directly
// so the inoculation day cannot shift with the device timezone.
// PNG ya blanco (sin filtros SVG): WebKit/iOS no aplica el feColorMatrix
// del SVG y el logo quedaba negro sobre el lomo negro.
const THERMAL_WORDMARK_URL = 'assets/thermal-wordmark-white.png';
let thermalWordmarkImage;
async function loadThermalWordmark() {
  if (!thermalWordmarkImage) {
    const img = new Image();
    img.src = THERMAL_WORDMARK_URL;
    thermalWordmarkImage = img;
  }
  try { await thermalWordmarkImage.decode(); }
  catch (error) { thermalWordmarkImage = null; throw error; }
}
function formatThermalDate(value) {
  const raw = String(value || '').trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(raw);
  if (!match) return raw;
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const month = months[Number(match[2]) - 1];
  return month ? `${Number(match[3])} ${month} ${match[1]}` : raw;
}
function thermalVerticalText(item) {
  const spec = THERMAL_LABEL_SPECS['50x70'];
  const ctx = document.createElement('canvas').getContext('2d');
  const width = (spec.wMm - spec.spineMm - spec.padXMm * 2) * CSS_PX_PER_MM;
  const fit = (value, size, font, maxLines) => {
    let lines;
    do {
      ctx.font = `700 ${size}px ${font}`;
      lines = wrapCanvasText(ctx, String(value || '').trim(), width);
      if (lines.length <= maxLines) break;
      size -= 0.25;
    } while (size > 3);
    return { lines, size };
  };
  return {
    code: fit(item.lotCode || item.id, spec.codePx, FONT_EDITORIAL, 2),
    species: fit(item.species || 'Seta Cultivada', spec.speciesPx, FONT_MONO, 1),
    badge: fit(item.badge || item.bagCode, spec.badgePx, FONT_MONO, 1),
    date: fit(formatThermalDate(item.date), spec.datePx, FONT_EDITORIAL, 1)
  };
}
// THERMAL_LABEL_SPECS es la única fuente de tamaños de texto: el PNG para la
// Phomemo los lee directo y la vista previa/impresión los recibe aquí como
// custom properties que sim.css usa. Antes sim.css tenía sus propios px y se
// separaron (especie 10px en pantalla y papel del navegador, 11px en el PNG).
function thermalCardTypeVars(size) {
  const spec = THERMAL_LABEL_SPECS[size];
  if (!spec) return undefined;
  const px = (v) => (v == null ? undefined : `${v}px`);
  // 50x70 ajusta especie, código, insignia y fecha en línea (thermalVerticalText).
  if (spec.layout === 'vertical') return { '--thermal-date-label-size': px(spec.dateLabelPx) };
  return {
    '--thermal-eyebrow-size': px(spec.eyebrowPx),
    '--thermal-species-size': px(spec.speciesPx),
    '--thermal-badge-size': px(spec.badgePx),
    '--thermal-code-size': px(spec.codePx),
    '--thermal-meta-size': px(spec.metaPx),
    '--thermal-date-label-size': px(spec.dateLabelPx),
    // El PNG centra el filete en un solo hueco de gapPx; en flex el filete es
    // un hijo más, así que cada lado lleva la mitad.
    '--thermal-gap': px(spec.gapPx / 2),
    '--thermal-pad': `${spec.padYMm}mm ${spec.padXMm}mm`,
  };
}
function drawThermalLabelVertical(ctx, item, x0, y0, spec) {
  const mm = THERMAL_PX_PER_MM;
  const w = spec.wMm * mm, h = spec.hMm * mm;
  const spine = spec.spineMm * mm;
  const cx = (w + spine) / 2;
  const text = thermalVerticalText(item);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, spine, h);
  if (!thermalWordmarkImage?.complete || !thermalWordmarkImage.naturalWidth) throw new Error('No se pudo cargar el logo de la etiqueta');
  ctx.save(); ctx.translate(spine / 2, h / 2); ctx.rotate(-Math.PI / 2);
  const logoW = spec.logoMm * mm, logoH = logoW * 743 / 1563;
  ctx.drawImage(thermalWordmarkImage, -logoW / 2, -logoH / 2, logoW, logoH);
  ctx.restore();
  ctx.fillStyle = '#000'; ctx.textBaseline = 'top';
  const block = (data, y, font, lineHeight = 1.05) => {
    const px = cssPxToCanvas(data.size);
    ctx.font = `700 ${px}px ${font}`;
    data.lines.forEach((line, i) => ctx.fillText(line, cx - ctx.measureText(line).width / 2, y * mm + i * px * lineHeight));
  };
  block(text.code, 4.5, FONT_EDITORIAL);
  block(text.species, 18, FONT_MONO, 1.1);
  const qrSize = spec.qrMm * mm;
  drawQrToCanvas(ctx, item, cx - qrSize / 2, 21 * mm, qrSize);
  if (item.dateLabel) block({lines: [item.dateLabel], size: spec.dateLabelPx}, 55.5, FONT_MONO);
  block(text.date, 59, FONT_EDITORIAL);
  block(text.badge, 65, FONT_MONO);
  ctx.restore();
}

function drawThermalLabelToCanvas(ctx, item, x0, y0, sizeKey) {
  const spec = THERMAL_LABEL_SPECS[sizeKey] || THERMAL_LABEL_SPECS['40x30'];
  if (spec.layout === 'vertical') return drawThermalLabelVertical(ctx, item, x0, y0, spec);
  const w = spec.wMm * THERMAL_PX_PER_MM;
  const h = spec.hMm * THERMAL_PX_PER_MM;
  const padX = spec.padXMm * THERMAL_PX_PER_MM;
  const padY = spec.padYMm * THERMAL_PX_PER_MM;
  const gap = cssPxToCanvas(spec.gapPx);
  const qrSize = spec.qrMm * THERMAL_PX_PER_MM;

  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#777';
  ctx.setLineDash([2, 2]);
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  ctx.setLineDash([]);

  // .thermal-aside: QR maximizado centrado verticalmente
  const qrX = padX;
  const qrY = (h - qrSize) / 2;
  const qrMini = typeof window !== 'undefined' ? window.QRMini : null;
  if (qrMini && typeof qrMini.matrix === 'function') {
    const m = qrMini.matrix(item.qrUrl || item.id || 'SETAS-OS');
    const n = m.length;
    const q = 4; // Quiet zone ISO/IEC 18004 (4 módulos)
    const dim = n + q * 2;
    const cell = qrSize / dim;
    ctx.fillStyle = '#fff';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = '#000';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (m[r][c]) {
          ctx.fillRect(Math.round(qrX + (c + q) * cell), Math.round(qrY + (r + q) * cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  // Filete vertical separador suizo (DS-2026 divider)
  const divX = Math.round(qrX + qrSize + gap / 2);
  ctx.fillStyle = '#000000';
  ctx.fillRect(divX, padY, 1, h - padY * 2);

  // .thermal-body: columna tipográfica estructurada con DS-2026
  const textX = divX + Math.round(gap / 2);
  const textW = w - textX - padX;

  const eyebrow = (item.eyebrow || 'SETAS DE LA PEÑA · TENJO').toUpperCase();
  const species = (item.species || 'Seta Cultivada').trim();
  const badge = (item.badge || item.bagCode || '').toUpperCase().trim();
  const code = (item.id || '').trim();
  const date = (item.date || '').trim();

  // 1. Medidas Eyebrow
  let eyebrowFontPx = Math.round(cssPxToCanvas(spec.eyebrowPx || 5.0));
  ctx.font = `700 ${eyebrowFontPx}px ${FONT_MONO}`;
  const eyebrowLines = wrapCanvasText(ctx, eyebrow, textW);
  const eyebrowLineHeight = Math.round(eyebrowFontPx * 1.15);
  const eyebrowBlockH = eyebrowLines.length * eyebrowLineHeight;
  const eyebrowMarginB = cssPxToCanvas(1.5);

  // 2. Medidas Species (Gaya Patched / Serif)
  let speciesFontPx = Math.round(cssPxToCanvas(spec.speciesPx || 9.5));
  ctx.font = `700 ${speciesFontPx}px ${FONT_EDITORIAL}`;
  const sWords = species.split(/\s+/);
  let maxSW = Math.max(...sWords.map(word => ctx.measureText(word).width));
  while (maxSW > textW && speciesFontPx > 14) {
    speciesFontPx -= 1;
    ctx.font = `700 ${speciesFontPx}px ${FONT_EDITORIAL}`;
    maxSW = Math.max(...sWords.map(word => ctx.measureText(word).width));
  }
  const speciesLines = wrapCanvasText(ctx, species, textW);
  const speciesLineHeight = Math.round(speciesFontPx * 1.08);
  const speciesBlockH = speciesLines.length * speciesLineHeight;
  const speciesMarginB = cssPxToCanvas(2.0);

  // 3. Medidas Badge (Inverted black block)
  let badgeFontPx = Math.round(cssPxToCanvas(spec.badgePx || 6.0));
  const bPadX = cssPxToCanvas(3);
  ctx.font = `800 ${badgeFontPx}px ${FONT_MONO}`;
  let bTextW = ctx.measureText(badge).width;
  if (badge && bTextW + bPadX * 2 > textW) {
    const scale = (textW - bPadX * 2) / bTextW;
    badgeFontPx = Math.max(10, Math.floor(badgeFontPx * scale));
    ctx.font = `800 ${badgeFontPx}px ${FONT_MONO}`;
    bTextW = ctx.measureText(badge).width;
  }
  const badgeW = badge ? Math.min(textW, bTextW + bPadX * 2) : 0;
  const badgeH = badge ? Math.round(badgeFontPx * 1.35) : 0;
  const badgeMarginT = badge ? cssPxToCanvas(1.5) : 0;
  const badgeMarginB = badge ? cssPxToCanvas(2.0) : 0;

  // 4. Medidas Code
  let codeFontPx = Math.round(cssPxToCanvas(spec.codePx || 6.5));
  ctx.font = `800 ${codeFontPx}px ${FONT_MONO}`;
  const codeLines = wrapCanvasText(ctx, code, textW);
  const codeLineHeight = Math.round(codeFontPx * 1.12);
  const codeBlockH = codeLines.length * codeLineHeight;
  const codeMarginB = cssPxToCanvas(1.5);

  // 5. Medidas Meta / Date
  const metaFontPx = Math.round(cssPxToCanvas(spec.metaPx || 5.5));
  const metaLineHeight = Math.round(metaFontPx * 1.15);
  const metaBlockH = date ? metaLineHeight : 0;

  // Altura total y centrado vertical armónico
  const totalHeight = eyebrowBlockH + eyebrowMarginB +
                      speciesBlockH + speciesMarginB +
                      badgeMarginT + badgeH + badgeMarginB +
                      codeBlockH + codeMarginB +
                      metaBlockH;

  let curY = Math.max(padY, Math.round((h - totalHeight) / 2));
  ctx.textBaseline = 'top';

  // Render 1: Eyebrow
  ctx.fillStyle = '#000000';
  ctx.font = `700 ${eyebrowFontPx}px ${FONT_MONO}`;
  eyebrowLines.forEach(line => {
    ctx.fillText(line, textX, curY);
    curY += eyebrowLineHeight;
  });
  curY += eyebrowMarginB;

  // Render 2: Species
  ctx.fillStyle = '#000000';
  ctx.font = `700 ${speciesFontPx}px ${FONT_EDITORIAL}`;
  speciesLines.forEach(line => {
    ctx.fillText(line, textX, curY);
    curY += speciesLineHeight;
  });
  curY += speciesMarginB;

  // Render 3: Badge
  if (badge) {
    curY += badgeMarginT;
    ctx.fillStyle = '#000000';
    ctx.fillRect(textX, curY, badgeW, badgeH);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${badgeFontPx}px ${FONT_MONO}`;
    ctx.fillText(badge, textX + bPadX, curY + Math.round((badgeH - badgeFontPx) / 2));
    curY += badgeH + badgeMarginB;
  }

  // Render 4: Code
  ctx.fillStyle = '#000000';
  ctx.font = `800 ${codeFontPx}px ${FONT_MONO}`;
  codeLines.forEach(line => {
    ctx.fillText(line, textX, curY);
    curY += codeLineHeight;
  });
  curY += codeMarginB;

  // Render 5: Meta / Date
  if (date) {
    ctx.fillStyle = '#000000';
    ctx.font = `600 ${metaFontPx}px ${FONT_MONO}`;
    ctx.fillText(date, textX, curY);
  }

  ctx.restore();
}
function buildThermalShareCanvas(items, sizeKey) {
  const spec = THERMAL_LABEL_SPECS[sizeKey] || THERMAL_LABEL_SPECS['40x30'];
  const wPx = spec.wMm * THERMAL_PX_PER_MM;
  const hPx = spec.hMm * THERMAL_PX_PER_MM;
  const gap = Math.round(THERMAL_PX_PER_MM); // 1mm de separación entre etiquetas apiladas
  const canvas = document.createElement('canvas');
  canvas.width = wPx;
  canvas.height = items.length * hPx + Math.max(0, items.length - 1) * gap;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  items.forEach((item, i) => drawThermalLabelToCanvas(ctx, item, 0, i * (hPx + gap), sizeKey));
  return canvas;
}

const api = { generateQrSvgDataUrl, THERMAL_PX_PER_MM, CSS_PX_PER_MM, cssPxToCanvas, FONT_EDITORIAL, FONT_SANS, FONT_MONO, THERMAL_LABEL_SPECS, wrapCanvasText, drawQrToCanvas, THERMAL_WORDMARK_URL, loadThermalWordmark, formatThermalDate, thermalVerticalText, thermalCardTypeVars, drawThermalLabelVertical, drawThermalLabelToCanvas, buildThermalShareCanvas };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasThermalLabel = api;

})();
