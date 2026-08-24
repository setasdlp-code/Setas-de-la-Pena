'use strict';

// SETAS OS — candidatos de investigación de ingredientes (Sabana de Bogotá, 2026)
//
// Este registro NO forma parte todavía de INGS ni del optimizador. Su propósito es
// conservar evidencia y priorización sin convertir rangos de literatura o costos de
// planeación en valores canónicos. Un candidato solo debe promoverse a INGS después
// de caracterización de lote/proveedor y, cuando aplique, ensayo biológico.
//
// Campos numéricos composicionales pueden ser null cuando la investigación no soporta
// un valor suficientemente defendible. No rellenar esos null con promedios inventados.

const RESEARCH_CANDIDATES = [
  {
    id:'cascarilla_algodon', name:'Cascarilla de algodón', scientific:'Gossypium spp.',
    priority:1, cat:'base', role:'base_carbono', researchStatus:'candidate',
    availability:'Distribuidores de alimento animal; seca y almacenable; transporte desde zonas algodoneras.',
    locality:'Colombia → Sabana de Bogotá', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:{min:3,max:9}, cn:null, n_pct:null, c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'],
    risks:['plaguicidas','micotoxinas','variabilidad de fibra'],
    suggestedTrial:'15–40% de la fracción seca como base/aireador; comparar contra cascarilla de arroz.',
    costPlanningCopKg:{min:3000,max:6000,basis:'pilot_budget_not_market_quote'},
    sources:['https://www.feedipedia.org/node/743','https://pmc.ncbi.nlm.nih.gov/articles/PMC11263479/','https://www.sciencedirect.com/science/article/pii/S1319562X1300017X']
  },
  {
    id:'cascarilla_avena', name:'Cascarilla de avena', scientific:'Avena sativa',
    priority:2, cat:'base', role:'aireador', researchStatus:'candidate',
    availability:'Molinos y distribuidores de alimento animal; seca y relativamente estable.',
    locality:'Bogotá/Sabana', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:5.2, ndf_pct_dm:75, crude_fiber_pct_dm:30.6, cn:null, n_pct:null, c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],
    risks:['cereal_con_gluten','micotoxinas'],
    suggestedTrial:'15–40% como aireador/base; no confundir con salvado de avena.',
    costPlanningCopKg:{min:1200,max:3000,basis:'pilot_budget_not_market_quote'},
    sources:['https://www.feedipedia.org/node/707','https://normograma.invima.gov.co/compilacion/docs/resolucion_minproteccion_5109_2005.htm']
  },
  {
    id:'rastrojo_arveja', name:'Rastrojo de arveja', scientific:'Pisum sativum',
    priority:3, cat:'local', role:'base_carbono', researchStatus:'candidate',
    availability:'Residuo postcosecha de fincas de Cundinamarca; estacional.', locality:'Sabana de Bogotá/Cundinamarca',
    moistureBasis:'dry_matter', composition:{protein_pct_dm:{min:8,max:12},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['moho_si_secado_lento','variabilidad_estacional'],
    suggestedTrial:'20–60% como base; evaluar capacidad de elevar N frente a pajas cerealistas.',
    costPlanningCopKg:{min:300,max:1200,basis:'pilot_budget_not_market_quote'},
    sources:['https://www.feedipedia.org/node/7047','https://upra.gov.co/en/node/2422']
  },
  {
    id:'rastrojo_haba', name:'Rastrojo/vainas de haba', scientific:'Vicia faba',
    priority:4, cat:'local', role:'base_carbono', researchStatus:'candidate',
    availability:'Cultivo de altiplano frío; disponibilidad postcosecha.', locality:'Cundinamarca/Boyacá → Sabana',
    moistureBasis:'dry_matter', composition:{protein_pct_dm:{min:5,max:11},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['factores_antinutricionales_en_semilla','variabilidad_de_vaina_y_tallo'],
    suggestedTrial:'20–50% como base; caracterizar por separado tallo/vaina si el flujo lo permite.',
    costPlanningCopKg:{min:300,max:1200,basis:'pilot_budget_not_market_quote'}, sources:['https://www.feedipedia.org/node/4926']
  },
  {
    id:'rastrojo_quinua', name:'Rastrojo de quinua', scientific:'Chenopodium quinoa',
    priority:5, cat:'local', role:'base_carbono', researchStatus:'candidate',
    availability:'Postcosecha regional; cadena andina.', locality:'Cundinamarca/Boyacá', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:7.5,crude_fiber_pct_dm:43,cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['saponinas_variables','variabilidad_por_fraccion'],
    suggestedTrial:'20–60% como base; documentar si incluye tallo, hoja o cascarilla.',
    costPlanningCopKg:{min:500,max:1500,basis:'pilot_budget_not_market_quote'}, sources:['https://www.feedipedia.org/node/229']
  },
  {
    id:'bagazo_zanahoria', name:'Bagazo de zanahoria', scientific:'Daucus carota',
    priority:6, cat:'local', role:'suplemento_medio', researchStatus:'candidate',
    availability:'Productores de Tenjo, Corabastos, juguerías y procesadores.', locality:'Tenjo/Bogotá', moistureBasis:'as_received',
    composition:{protein_pct_dm:7.7,adf_pct_dm:28,moisture_pct_as_received:88,cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['perecedero','fermentacion_rapida'],
    suggestedTrial:'5–20% de la materia seca; estabilizar el mismo día de generación.',
    costPlanningCopKg:{min:300,max:1000,basis:'pilot_budget_fresh_material'}, sources:['https://www.feedipedia.org/node/539','https://upra.gov.co/en/node/2422']
  },
  {
    id:'residuo_pina', name:'Cáscara/corona de piña', scientific:'Ananas comosus',
    priority:7, cat:'trop', role:'base_carbono', researchStatus:'candidate',
    availability:'Corabastos, fruterías y procesadores durante todo el año.', locality:'Bogotá → Tenjo', moistureBasis:'as_received',
    composition:{moisture_pct_as_received:90,protein_pct_dm:{min:4,max:8},fiber_pct_dm:{min:16,max:25},ndf_pct_dm:{min:60,max:72},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['fermentacion_rapida','residuos_plaguicidas','metales_segun_fuente'],
    suggestedTrial:'10–30% de la materia seca; separar corona/hoja de pulpa si es posible.',
    costPlanningCopKg:{min:300,max:1200,basis:'pilot_budget_fresh_material'}, sources:['https://www.feedipedia.org/node/676','https://clium.org.uk/index.php/editions/article/view/521']
  },
  {
    id:'bagazo_manzana', name:'Bagazo de manzana', scientific:'Malus domestica',
    priority:8, cat:'local', role:'suplemento_medio', researchStatus:'candidate',
    availability:'Juguerías y procesadores; estacionalidad moderada.', locality:'Bogotá/Sabana', moistureBasis:'as_received',
    composition:{dry_matter_pct_as_received:{min:15,max:30},protein_pct_dm:{min:3,max:11},ndf_pct_dm:{min:48,max:75},lignin_pct_dm:{min:16,max:35},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['fermentacion_espontanea','alta_humedad'],
    suggestedTrial:'5–20% de materia seca como suplemento, no como base principal.',
    costPlanningCopKg:{min:500,max:1500,basis:'pilot_budget_fresh_material'}, sources:['https://www.feedipedia.org/node/20703','https://www.tandfonline.com/doi/abs/10.5941/MYCO.2014.42.2.193']
  },
  {
    id:'torta_canola', name:'Torta/pasta de canola', scientific:'Brassica napus',
    priority:9, cat:'sup', role:'suplemento_n', researchStatus:'candidate', availability:'Distribuidores de alimento animal.', locality:'Bogotá/Sabana',
    moistureBasis:'dry_matter', composition:{protein_pct_dm:{min:35,max:44},fiber_pct_dm:{min:10,max:18},lignin_pct_dm:10,cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane'], risks:['glucosinolatos','contaminacion_por_sobredosificacion'],
    suggestedTrial:'2.5–10% como suplemento N.', costPlanningCopKg:{min:3500,max:6000,basis:'pilot_budget_not_market_quote'}, sources:['https://www.feedipedia.org/node/52']
  },
  {
    id:'torta_palmiste', name:'Torta de palmiste', scientific:'Elaeis guineensis',
    priority:10, cat:'sup', role:'suplemento_medio', researchStatus:'candidate', availability:'Coproducto nacional vía industria de palma y distribuidores de alimento animal.', locality:'Colombia → Bogotá/Sabana',
    moistureBasis:'dry_matter', composition:{protein_pct_dm:{min:14,max:20},ndf_pct_dm:{min:60,max:80},lignin_pct_dm:{min:10,max:18},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane'], risks:['variabilidad_por_cascara_y_molienda'], suggestedTrial:'5–20% como suplemento medio/fibroso.',
    costPlanningCopKg:{min:2000,max:4000,basis:'pilot_budget_not_market_quote'}, sources:['https://www.feedipedia.org/node/43']
  },
  {
    id:'ddgs_maiz', name:'DDGS de maíz', scientific:'Zea mays',
    priority:11, cat:'sup', role:'suplemento_n', researchStatus:'candidate', availability:'Distribuidores de alimento animal; seco y relativamente estandarizado.', locality:'Bogotá/Sabana',
    moistureBasis:'as_received', composition:{dry_matter_pct_as_received:89,protein_pct_dm:29.5,fat_pct_dm:11.1,ndf_pct_dm:34.2,starch_pct_dm:9.3,cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane'], risks:['micotoxinas','grasa_alta','contaminacion_por_sobredosificacion'], suggestedTrial:'2.5–10% como suplemento concentrado.',
    costPlanningCopKg:{min:2500,max:4500,basis:'pilot_budget_not_market_quote'}, sources:['https://www.feedipedia.org/node/71']
  },
  {
    id:'corn_gluten_feed', name:'Corn gluten feed / gluten feed de maíz', scientific:'Zea mays',
    priority:12, cat:'sup', role:'suplemento_n', researchStatus:'candidate', availability:'Distribuidores de alimento animal.', locality:'Bogotá/Sabana', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:{min:20,max:25},ndf_pct_dm:{min:31,max:49},fat_pct_dm:{min:0,max:4},starch_pct_dm:{min:11,max:30},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane'], risks:['confusion_con_corn_gluten_meal'], suggestedTrial:'2.5–10%; exigir ficha del producto exacto.',
    costPlanningCopKg:{min:3000,max:5500,basis:'pilot_budget_not_market_quote'}, sources:['https://www.feedipedia.org/node/714']
  },
  {
    id:'heno_ryegrass', name:'Heno de ryegrass', scientific:'Lolium spp.',
    priority:13, cat:'local', role:'base_carbono', researchStatus:'candidate', availability:'Forraje coherente con la zona lechera de la Sabana; varios cortes/año.', locality:'Sabana de Bogotá', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:{min:10,max:18},ndf_pct_dm:{min:50,max:65},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['variabilidad_por_edad_de_corte'], suggestedTrial:'Comparar 20–60% contra kikuyo con análisis bromatológico del lote.',
    costPlanningCopKg:{min:1200,max:3000,basis:'pilot_budget_not_market_quote'}, sources:[]
  },
  {
    id:'cascarilla_cebada_maltera', name:'Cascarilla de cebada maltera', scientific:'Hordeum vulgare',
    priority:14, cat:'base', role:'aireador', researchStatus:'candidate', availability:'Cervecerías, malterías y feed mills.', locality:'Bogotá/Sabana', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:{min:4,max:8},fiber_pct_dm:{min:35,max:45},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['cereal_con_gluten','confusion_con_afrecho_cerveceria_humedo'], suggestedTrial:'15–40% como aireador/base seca.',
    costPlanningCopKg:{min:1000,max:2500,basis:'pilot_budget_not_market_quote'}, sources:['https://normograma.invima.gov.co/compilacion/docs/resolucion_minproteccion_5109_2005.htm']
  },
  {
    id:'orujo_naranja', name:'Orujo/piel de naranja', scientific:'Citrus × sinensis',
    priority:15, cat:'local', role:'suplemento_medio', researchStatus:'candidate', availability:'Corabastos, plazas y juguerías; prácticamente anual.', locality:'Bogotá', moistureBasis:'as_received',
    composition:{dry_matter_pct_as_received:20,ph_as_received:{min:3.9,max:4.0},pectin_pct_dm:{min:0,max:40},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris','p_ostreatus_blanco'], risks:['aceites_esenciales','limonina','residuos_plaguicidas'], suggestedTrial:'5–15% de materia seca con prelavado; evaluar inhibición.',
    costPlanningCopKg:{min:300,max:1000,basis:'pilot_budget_fresh_material'}, sources:['https://www.feedipedia.org/node/679']
  },
  {
    id:'cascara_cebolla', name:'Cáscara seca de cebolla', scientific:'Allium cepa',
    priority:16, cat:'local', role:'base_carbono', researchStatus:'candidate', availability:'Corabastos y plazas; anual.', locality:'Bogotá', moistureBasis:'dry_matter',
    composition:{cn:null,n_pct:null,c_pct:null}, species:['p_ostreatus_gris'], risks:['compuestos_azufrados','posible_inhibicion_antimicrobiana'],
    suggestedTrial:'Microensayos 2.5–10% antes de cualquier escala.', costPlanningCopKg:{min:300,max:1000,basis:'pilot_budget_not_market_quote'}, sources:[]
  },
  {
    id:'residuo_brocoli', name:'Tallos y hojas de brócoli', scientific:'Brassica oleracea var. italica',
    priority:17, cat:'local', role:'suplemento_medio', researchStatus:'candidate', availability:'Horticultura regional y mercados.', locality:'Cundinamarca/Bogotá', moistureBasis:'as_received',
    composition:{moisture_pct_as_received:90,protein_pct_as_received:{min:2,max:4},carbohydrate_pct_as_received:{min:5,max:8},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris'], risks:['glucosinolatos','perecibilidad'], suggestedTrial:'Baja inclusión tras secado o escaldado; caracterizar materia seca primero.',
    costPlanningCopKg:{min:300,max:1000,basis:'pilot_budget_fresh_material'}, sources:[]
  },
  {
    id:'residuo_coliflor', name:'Hojas y tallos de coliflor', scientific:'Brassica oleracea var. botrytis',
    priority:18, cat:'local', role:'suplemento_medio', researchStatus:'candidate', availability:'Horticultura fría regional y mercados.', locality:'Cundinamarca/Bogotá', moistureBasis:'as_received',
    composition:{moisture_pct_as_received:90,protein_pct_as_received:2,carbohydrate_pct_as_received:5,cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris'], risks:['glucosinolatos','perecibilidad'], suggestedTrial:'Comparar con brócoli en baja inclusión.',
    costPlanningCopKg:{min:300,max:1000,basis:'pilot_budget_fresh_material'}, sources:[]
  },
  {
    id:'descartes_lechuga', name:'Descartes de lechuga', scientific:'Lactuca sativa',
    priority:19, cat:'local', role:'co_sustrato_humedo', researchStatus:'candidate', availability:'Muy alta en Tenjo/Bogotá; residuo concentrable en mercados.', locality:'Tenjo/Bogotá', moistureBasis:'as_received',
    composition:{moisture_pct_as_received:95,protein_pct_as_received:{min:1,max:2},carbohydrate_pct_as_received:{min:2,max:4},cn:null,n_pct:null,c_pct:null},
    species:['p_ostreatus_gris'], risks:['muy_baja_materia_seca','logistica_de_agua','perecibilidad'], suggestedTrial:'Solo cuando el residuo se genere cerca de la planta; comparar costo por kg de MS.',
    costPlanningCopKg:{min:300,max:800,basis:'pilot_budget_fresh_material'}, sources:['https://upra.gov.co/en/node/2422']
  },
  {
    id:'torta_algodon', name:'Torta de algodón', scientific:'Gossypium spp.',
    priority:20, cat:'sup', role:'suplemento_n', researchStatus:'candidate', availability:'Distribuidores de alimento animal.', locality:'Colombia → Bogotá/Sabana', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:{min:35,max:45},fiber_pct_dm:{min:10,max:20},cn:null,n_pct:null,c_pct:null}, species:['p_ostreatus_gris','p_ostreatus_blanco'],
    risks:['gossypol','micotoxinas'], suggestedTrial:'2.5–7.5% como suplemento fuerte; exigir COA.', costPlanningCopKg:{min:3500,max:6000,basis:'pilot_budget_not_market_quote'}, sources:[]
  },
  {
    id:'orujo_tomate', name:'Bagazo/orujo de tomate', scientific:'Solanum lycopersicum',
    priority:21, cat:'local', role:'suplemento_medio', researchStatus:'candidate', availability:'Mercados, restaurantes y procesadores.', locality:'Bogotá/Sabana', moistureBasis:'as_received',
    composition:{protein_pct_dm:{min:15,max:25},fiber_pct_dm:{min:30,max:50},fat_pct_dm:{min:5,max:15},cn:null,n_pct:null,c_pct:null}, species:['p_ostreatus_gris','p_ostreatus_blanco'],
    risks:['alta_humedad','acidez','variabilidad_piel_semilla'], suggestedTrial:'5–20% de materia seca; caracterizar piel/semilla del flujo local.',
    costPlanningCopKg:{min:300,max:1200,basis:'pilot_budget_fresh_material'}, sources:[]
  },
  {
    id:'aserrin_acacia_negra', name:'Astilla/aserrín de acacia negra', scientific:'Acacia melanoxylon',
    priority:22, cat:'base', role:'base_carbono', researchStatus:'candidate', availability:'Podas/carpintería si se segrega por especie.', locality:'Bogotá/Sabana', moistureBasis:'dry_matter',
    composition:{cn:null,n_pct:null,c_pct:null}, species:['shiitake','lions_mane','reishi','p_ostreatus_gris'], risks:['madera_tratada','contaminacion_de_poda_vial'],
    suggestedTrial:'Caracterizar C, N, celulosa, hemicelulosa y lignina antes de formular.', costPlanningCopKg:{min:300,max:1200,basis:'pilot_budget_not_market_quote'}, sources:[]
  },
  {
    id:'aserrin_urapan', name:'Astilla/aserrín de urapán', scientific:'Fraxinus uhdei',
    priority:23, cat:'base', role:'base_carbono', researchStatus:'candidate', availability:'Poda urbana/carpintería; disponibilidad puntual.', locality:'Bogotá/Sabana', moistureBasis:'dry_matter',
    composition:{cn:null,n_pct:null,c_pct:null}, species:['shiitake','lions_mane','reishi','p_ostreatus_gris'], risks:['madera_tratada','contaminacion_de_poda_vial'],
    suggestedTrial:'Candidato de madera dura local; medir composición lignocelulósica y hacer ensayo con control de roble.', costPlanningCopKg:{min:300,max:1200,basis:'pilot_budget_not_market_quote'}, sources:[]
  },
  {
    id:'aserrin_aliso', name:'Astilla/aserrín de aliso', scientific:'Alnus acuminata',
    priority:24, cat:'base', role:'base_carbono', researchStatus:'candidate', availability:'Fincas andinas, madera y poda segregada.', locality:'Cundinamarca/Boyacá', moistureBasis:'dry_matter',
    composition:{cn:null,n_pct:null,c_pct:null}, species:['shiitake','lions_mane','nameko'], risks:['identificacion_de_especie','madera_tratada'],
    suggestedTrial:'Ensayo frente a roble para Hericium/Shiitake/Nameko después de caracterización.', costPlanningCopKg:{min:800,max:2000,basis:'pilot_budget_not_market_quote'}, sources:[]
  },
  {
    id:'paja_centeno', name:'Paja de centeno', scientific:'Secale cereale',
    priority:25, cat:'base', role:'base_carbono', researchStatus:'candidate', availability:'Proveedores de forraje/cereal; menos abundante que trigo/avena.', locality:'Bogotá/Sabana', moistureBasis:'dry_matter',
    composition:{protein_pct_dm:4.1,ndf_pct_dm:73.7,adf_pct_dm:45.6,lignin_pct_dm:6.5,cn:null,n_pct:null,c_pct:null}, species:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],
    risks:['cereal_con_gluten'], suggestedTrial:'20–70% como base y control comparativo entre pajas.', costPlanningCopKg:{min:1000,max:2500,basis:'pilot_budget_not_market_quote'},
    sources:['https://www.feedipedia.org/node/60','https://normograma.invima.gov.co/compilacion/docs/resolucion_minproteccion_5109_2005.htm']
  }
];

const RESEARCH_CANDIDATES_BY_ID = Object.fromEntries(RESEARCH_CANDIDATES.map(x => [x.id, x]));

function validateResearchCandidates(candidates = RESEARCH_CANDIDATES) {
  const errors = [];
  const ids = new Set();
  for (const item of candidates) {
    if (!item.id || !item.name || !item.researchStatus) errors.push(`missing required fields: ${item.id || '<no-id>'}`);
    if (ids.has(item.id)) errors.push(`duplicate id: ${item.id}`);
    ids.add(item.id);
    if (item.researchStatus !== 'candidate') errors.push(`invalid researchStatus for ${item.id}`);
    if (!Number.isInteger(item.priority) || item.priority < 1 || item.priority > 25) errors.push(`invalid priority for ${item.id}`);
    const comp = item.composition || {};
    for (const key of ['cn','n_pct','c_pct']) {
      if (comp[key] !== null && typeof comp[key] !== 'number') errors.push(`${item.id}.${key} must be number|null`);
    }
    if (item.costPlanningCopKg?.basis && !item.costPlanningCopKg.basis.startsWith('pilot_budget')) {
      errors.push(`non-planning cost basis in candidate ${item.id}`);
    }
  }
  if (candidates.length !== 25) errors.push(`expected 25 candidates, got ${candidates.length}`);
  const priorities = candidates.map(x => x.priority).sort((a,b) => a-b);
  for (let i=1;i<=25;i++) if (priorities[i-1] !== i) errors.push(`priority set must be exactly 1..25`);
  return errors;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RESEARCH_CANDIDATES, RESEARCH_CANDIDATES_BY_ID, validateResearchCandidates };
}
if (typeof window !== 'undefined') {
  window.SETAS_OS_RESEARCH_CANDIDATES = RESEARCH_CANDIDATES;
}
