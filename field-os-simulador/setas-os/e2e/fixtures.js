'use strict';

// Datos deterministas para los E2E — separados de cualquier dato real de
// producción. Los shapes replican exactamente lo que simulador-app.jsx
// escribe a localStorage (ver saveR() y crearBitLote()), no inventados.

const E2E_RECETA_CARGADA = {
  id: 999000001,
  name: 'E2E_RECETA_CARGADA',
  sKey: 'p_ostreatus_gris',
  recipe: [
    { id: 'paja_trigo', p: 60 },
    { id: 'salvado_trigo', p: 28 },
    { id: 'borra_cafe', p: 7 },
    { id: 'carbonato_calcio', p: 3 },
    { id: 'yeso', p: 2 },
  ],
  date: '01/06/2026',
  eb: '120',
  cn: '35.0',
  score: 80,
  cost: 3000,
  treatCol: null,
  energyCopKg: 0,
};

const E2E_LOTES = [
  {
    id: 'E2E-L001',
    codigo: 'SDP-E2E-L001',
    especie: 'Orellana Gris',
    especieCientifico: 'Pleurotus ostreatus',
    cepa: '',
    fechaMezcla: '2026-06-01',
    fechaInoculacion: '2026-06-01',
    numBolsas: 6,
    pesoHumedo: 1.5,
    peseSeco: 0.5,
    spawnPct: 8,
    humedad: 67,
    tratamiento: '',
    costoIngKg: 0,
    operador: '',
    objetivo: '',
    notas: 'Fixture E2E — lote 1',
    estado: 'incubacion',
    veredicto: '',
    recipeRef: null,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'E2E-L002',
    codigo: 'SDP-E2E-L002',
    especie: 'Shiitake',
    especieCientifico: 'Lentinula edodes',
    cepa: '',
    fechaMezcla: '2026-06-02',
    fechaInoculacion: '2026-06-02',
    numBolsas: 4,
    pesoHumedo: 2.0,
    peseSeco: 0.7,
    spawnPct: 10,
    humedad: 70,
    tratamiento: '',
    costoIngKg: 0,
    operador: '',
    objetivo: '',
    notas: 'Fixture E2E — lote 2',
    estado: 'fructificacion',
    veredicto: '',
    recipeRef: null,
    createdAt: '2026-06-02T00:00:00.000Z',
  },
];

module.exports = { E2E_RECETA_CARGADA, E2E_LOTES };
