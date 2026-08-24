'use strict';

// SETAS OS — Promotion gate for researched ingredients.
//
// `promotion_ready` means the candidate has a trustworthy technical source for
// its identity/composition and is allowed to advance from research to local
// validation. It does NOT automatically make the ingredient eligible for the
// recipe optimizer. Promotion into canonical INGS still requires the numeric
// fields used by scoring (C:N, %N, %C, moisture basis) plus a real delivered
// cost or an explicitly non-economic optimizer mode.
//
// Accepted source classes for this gate:
// - Feedipedia / INRAE-CIRAD-AFZ / FAO feed tables
// - peer-reviewed journal papers
// - official Colombian agricultural datasets when they support locality/supply
//
// A source that only supports allergen/labelling regulation, generic market
// presence, or an unreferenced estimate is insufficient by itself.

const PROMOTION_READY = [
  {
    id:'cascarilla_algodon',
    status:'promotion_ready',
    evidenceGrade:'A',
    rationale:'Composición respaldada por Feedipedia/INRAE-CIRAD-AFZ y literatura revisada por pares; además existe evidencia de uso de cottonseed hulls en formulaciones de hongos.',
    reliableSources:[
      'https://www.feedipedia.org/node/12020',
      'https://www.mdpi.com/2311-7524/11/8/947'
    ],
    nextGate:['costo_puesto_en_Tenjo','C_total_y_N_total_del_lote_o_fuente_especifica','ensayo_Pleurotus']
  },
  {
    id:'cascarilla_avena',
    status:'promotion_ready',
    evidenceGrade:'A',
    rationale:'Feedipedia reporta composición con gran número de muestras; literatura revisada por pares aporta análisis elemental directo de C y N.',
    reliableSources:[
      'https://www.feedipedia.org/node/12387',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC8890773/'
    ],
    canonicalCandidate:{c_pct:43.3,n_pct:0.6,cn:72.17,moisture_pct:6.9,basis:'reported ultimate analysis; verify local lot before optimizer'},
    nextGate:['costo_puesto_en_Tenjo','confirmar_lote_local','ensayo_Pleurotus']
  },
  {
    id:'rastrojo_arveja',
    status:'promotion_ready',
    evidenceGrade:'B',
    rationale:'Feedipedia respalda composición de residuos de arveja y UPRA respalda relevancia agrícola regional; falta caracterización C/N específica del flujo local.',
    reliableSources:['https://www.feedipedia.org/node/7047','https://upra.gov.co/en/node/2422'],
    nextGate:['C_total_y_N_total','humedad_del_lote','costo_recoleccion_secado','ensayo_Pleurotus']
  },
  {
    id:'rastrojo_haba',
    status:'promotion_ready',
    evidenceGrade:'B',
    rationale:'Feedipedia es fuente técnica institucional suficiente para avanzar a validación local; la fracción exacta tallo/vaina debe estandarizarse.',
    reliableSources:['https://www.feedipedia.org/node/4926'],
    nextGate:['definir_fraccion','C_total_y_N_total','costo_local','ensayo_Pleurotus']
  },
  {
    id:'rastrojo_quinua',
    status:'promotion_ready',
    evidenceGrade:'B',
    rationale:'Composición respaldada por Feedipedia; requiere separar tallo/hoja/cascarilla y verificar saponinas del flujo real.',
    reliableSources:['https://www.feedipedia.org/node/229'],
    nextGate:['definir_fraccion','C_total_y_N_total','saponinas','costo_local','ensayo_Pleurotus']
  },
  {
    id:'bagazo_zanahoria',
    status:'promotion_ready',
    evidenceGrade:'A-',
    rationale:'Feedipedia aporta composición y UPRA respalda pertinencia de la cadena agrícola regional; la alta humedad exige costeo por materia seca.',
    reliableSources:['https://www.feedipedia.org/node/539','https://upra.gov.co/en/node/2422'],
    nextGate:['C_total_y_N_total','costo_por_kg_MS_puesto_en_Tenjo','estabilizacion_mismo_dia','ensayo_Pleurotus']
  },
  {
    id:'residuo_pina',
    status:'promotion_ready',
    evidenceGrade:'A-',
    rationale:'Feedipedia documenta composición y existe literatura aplicada al aprovechamiento del residuo; debe controlarse la fracción usada y la carga de plaguicidas.',
    reliableSources:['https://www.feedipedia.org/node/676','https://clium.org.uk/index.php/editions/article/view/521'],
    nextGate:['separar_corona_cascara_pulpa','C_total_y_N_total','residuos_plaguicidas','costo_por_kg_MS','ensayo_Pleurotus']
  },
  {
    id:'bagazo_manzana',
    status:'promotion_ready',
    evidenceGrade:'A',
    rationale:'Feedipedia respalda composición y existe publicación revisada por pares sobre cultivo de Pleurotus con residuos de manzana.',
    reliableSources:['https://www.feedipedia.org/node/20703','https://www.tandfonline.com/doi/abs/10.5941/MYCO.2014.42.2.193'],
    nextGate:['C_total_y_N_total','costo_por_kg_MS','estabilizacion','ensayo_local_Pleurotus']
  },
  {
    id:'torta_canola',
    status:'promotion_ready',
    evidenceGrade:'B+',
    rationale:'Feedipedia/INRAE-CIRAD-AFZ proporciona una ficha composicional sólida; por su alta proteína debe tratarse como suplemento concentrado y no como base.',
    reliableSources:['https://www.feedipedia.org/node/52'],
    nextGate:['C_total_y_N_total','glucosinolatos_o_ficha_proveedor','costo_local','ensayo_2_5_a_10_pct']
  },
  {
    id:'torta_palmiste',
    status:'promotion_ready',
    evidenceGrade:'B+',
    rationale:'Coproducto bien caracterizado por Feedipedia y disponible a través de la cadena nacional de palma; falta validar la presentación que llegue a Bogotá.',
    reliableSources:['https://www.feedipedia.org/node/43'],
    nextGate:['C_total_y_N_total','porcentaje_cascara','costo_puesto_en_Tenjo','ensayo_5_a_20_pct']
  },
  {
    id:'ddgs_maiz',
    status:'promotion_ready',
    evidenceGrade:'A-',
    rationale:'Ingrediente industrial estandarizado con ficha técnica robusta en Feedipedia; el gate local debe enfocarse en micotoxinas, grasa y costo real.',
    reliableSources:['https://www.feedipedia.org/node/71'],
    nextGate:['C_total_y_N_total','COA_micotoxinas','grasa_del_lote','costo_puesto_en_Tenjo','ensayo_baja_inclusion']
  },
  {
    id:'corn_gluten_feed',
    status:'promotion_ready',
    evidenceGrade:'B+',
    rationale:'Feedipedia respalda composición, pero debe fijarse explícitamente la identidad como corn gluten feed para evitar confusión con corn gluten meal.',
    reliableSources:['https://www.feedipedia.org/node/714'],
    nextGate:['confirmar_producto_exacto','C_total_y_N_total','costo_local','ensayo_baja_inclusion']
  },
  {
    id:'orujo_naranja',
    status:'promotion_ready',
    evidenceGrade:'B+',
    rationale:'Feedipedia documenta bien el residuo cítrico; aceites esenciales, acidez y plaguicidas justifican un ensayo de baja inclusión antes de uso operativo.',
    reliableSources:['https://www.feedipedia.org/node/679'],
    nextGate:['C_total_y_N_total','lavado_o_pretratamiento','residuos_plaguicidas','costo_por_kg_MS','ensayo_5_a_15_pct']
  },
  {
    id:'paja_centeno',
    status:'promotion_ready',
    evidenceGrade:'A-',
    rationale:'Feedipedia aporta una ficha composicional robusta para paja de centeno; es suficientemente análoga a otras pajas del catálogo para pasar a validación local.',
    reliableSources:['https://www.feedipedia.org/node/60'],
    nextGate:['C_total_y_N_total','costo_puesto_en_Tenjo','ensayo_comparativo_con_paja_trigo_avena']
  }
];

const PROMOTION_BLOCKED = [
  {id:'heno_ryegrass',reason:'Sin fuente técnica enlazada en el registro actual.'},
  {id:'cascarilla_cebada_maltera',reason:'La fuente enlazada es normativa de etiquetado; no sustenta la composición declarada.'},
  {id:'cascara_cebolla',reason:'Sin fuente técnica composicional y con riesgo de inhibición antimicrobiana.'},
  {id:'residuo_brocoli',reason:'Sin fuente técnica enlazada para los valores declarados.'},
  {id:'residuo_coliflor',reason:'Sin fuente técnica enlazada para los valores declarados.'},
  {id:'descartes_lechuga',reason:'UPRA puede apoyar disponibilidad regional, pero no sustenta la composición específica del residuo.'},
  {id:'torta_algodon',reason:'Sin fuente técnica enlazada en el registro actual; además requiere control de gossypol.'},
  {id:'orujo_tomate',reason:'Sin fuente técnica enlazada para composición y variabilidad piel/semilla.'},
  {id:'aserrin_acacia_negra',reason:'Sin caracterización composicional específica y riesgo de madera tratada/contaminación vial.'},
  {id:'aserrin_urapan',reason:'Sin caracterización composicional específica y riesgo de madera tratada/contaminación vial.'},
  {id:'aserrin_aliso',reason:'Sin caracterización composicional específica del flujo local.'}
];

const PROMOTION_READY_IDS = new Set(PROMOTION_READY.map(x => x.id));
const PROMOTION_BLOCKED_IDS = new Set(PROMOTION_BLOCKED.map(x => x.id));

function validatePromotionRegistry() {
  const errors = [];
  if (PROMOTION_READY.length !== 14) errors.push(`expected 14 promotion-ready ingredients, got ${PROMOTION_READY.length}`);
  const all = [...PROMOTION_READY.map(x => x.id), ...PROMOTION_BLOCKED.map(x => x.id)];
  if (new Set(all).size !== all.length) errors.push('duplicate id across promotion registry');
  if (all.length !== 25) errors.push(`promotion registry must classify all 25 candidates, got ${all.length}`);
  for (const item of PROMOTION_READY) {
    if (!item.reliableSources || item.reliableSources.length === 0) errors.push(`missing reliable source: ${item.id}`);
    if (!item.nextGate || item.nextGate.length === 0) errors.push(`missing next gate: ${item.id}`);
    if (item.status !== 'promotion_ready') errors.push(`invalid status: ${item.id}`);
  }
  return errors;
}

module.exports = {
  PROMOTION_READY,
  PROMOTION_BLOCKED,
  PROMOTION_READY_IDS,
  PROMOTION_BLOCKED_IDS,
  validatePromotionRegistry,
};
