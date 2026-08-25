'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  extractValidDiagnosisJson,
  buildDiagnosisPrompt,
  initSetasAI
} = require('./firebase/ai-logic.js');

test('extractValidDiagnosisJson parsea JSON directo correctamente', () => {
  const raw = JSON.stringify({
    patogeno: 'Trichoderma spp. (Moho Verde)',
    tipo: 'hongo_competidor',
    urgencia: 'alta',
    confianza: 'alta',
    descripcion_visual: 'Manchas verde brillante sobre micelio blanco',
    accion_recomendada: 'Aislar inmediatamente sin abrir la bolsa',
    posible_causa: 'Pasteurización insuficiente o humedad >70%',
    estado_bolsa_sugerido: 'contaminada'
  });

  const parsed = extractValidDiagnosisJson(raw);
  assert.equal(parsed.patogeno, 'Trichoderma spp. (Moho Verde)');
  assert.equal(parsed.urgencia, 'alta');
  assert.equal(parsed.estado_bolsa_sugerido, 'contaminada');
});

test('extractValidDiagnosisJson extrae JSON envuelto en texto o markdown', () => {
  const wrapped = `
Aquí está el análisis del micólogo de Setas de la Peña:
\`\`\`json
{
  "patogeno": "Cobweb mold (Dactylium spp.)",
  "tipo": "moho_parasito",
  "urgencia": "media",
  "confianza": "alta",
  "descripcion_visual": "Fibras grisáceas muy finas creciendo velozmente sobre primordios",
  "accion_recomendada": "Cuarentena y evaluar ventilación / humedad en sala",
  "posible_causa": "Alta humedad relativa estancada con baja renovación de aire",
  "estado_bolsa_sugerido": "dudosa"
}
\`\`\`
Favor actuar de inmediato.
`;

  const parsed = extractValidDiagnosisJson(wrapped);
  assert.equal(parsed.patogeno, 'Cobweb mold (Dactylium spp.)');
  assert.equal(parsed.urgencia, 'media');
  assert.equal(parsed.tipo, 'moho_parasito');
});

test('extractValidDiagnosisJson lanza error ante texto sin JSON', () => {
  assert.throws(() => extractValidDiagnosisJson('No se puede diagnosticar la imagen'), {
    message: /No se encontró una estructura JSON válida/
  });
});

test('buildDiagnosisPrompt incluye contexto de especie, etapa y reglas agronómicas', () => {
  const prompt = buildDiagnosisPrompt({
    speciesName: 'Pleurotus ostreatus (Orellana)',
    stage: 'incubacion',
    roomName: 'Martha Tent 01',
    notes: 'Manchas verdosas en el tercio superior'
  });

  assert.ok(prompt.includes('Trichoderma spp.'));
  assert.ok(prompt.includes('Pleurotus ostreatus (Orellana)'));
  assert.ok(prompt.includes('incubacion'));
  assert.ok(prompt.includes('Martha Tent 01'));
  assert.ok(prompt.includes('Manchas verdosas en el tercio superior'));
});

test('initSetasAI expone diagnoseContaminationImage', () => {
  const ai = initSetasAI();
  assert.ok(ai);
  assert.equal(typeof ai.diagnoseContaminationImage, 'function');
});

test('simulador-app.jsx incluye ContaminationDiagnosisModal y disparadores en TodayV2 y BatchDetailV2', () => {
  const jsxPath = path.join(__dirname, 'simulador-app.jsx');
  const content = fs.readFileSync(jsxPath, 'utf8');

  assert.ok(content.includes('ai-contamination-diagnosis-modal'), 'Debe existir el modal de diagnostico AI');
  assert.ok(content.includes('diagnoseContaminationImage'), 'Debe invocar el metodo de diagnostico AI');
  assert.ok(content.includes('showDiagModal'), 'Debe controlar el estado del modal');
  assert.ok(content.includes('os-diag-urgency-'), 'Debe formatear badges de urgencia');
});
