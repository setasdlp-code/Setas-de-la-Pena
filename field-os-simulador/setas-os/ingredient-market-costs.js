'use strict';

// SETAS OS — costos de mercado para ingredientes investigados.
//
// Este registro mantiene separados tres conceptos que no deben mezclarse:
// - verified_market_price: precio público verificable del producto exacto.
// - planning_proxy: valor de planeación inferido de materiales comparables; NO debe
//   participar en el ranking económico del optimizador.
// - quote_required: existe cadena/proveedor plausible, pero no precio público
//   suficientemente específico para usar como costo.
//
// Todos los valores son COP/kg de material tal como se comercializa, salvo que
// costBasis indique otra cosa. El transporte a Tenjo no se presume incluido.

const INGREDIENT_MARKET_COSTS = {
  torta_palmiste: {
    status: 'verified_market_price',
    optimizerEligible: true,
    canonicalCopKg: 1400,
    rangeCopKg: { min: 1260, max: 2653 },
    costBasis: 'as_sold_ex_transport_to_tenjo',
    verifiedAt: '2026-08-23',
    evidence: [
      {
        type: 'supplier_public_price',
        supplier: 'Frescorgánico',
        product: 'Torta de palmiste expeller',
        packageKg: 40,
        packagePriceCop: 56000,
        copKg: 1400,
        minimumOrder: '10 bultos',
        url: 'https://frescorganico.com/producto/torta-de-palmiste-expelier'
      },
      {
        type: 'supplier_bulk_discount',
        supplier: 'Frescorgánico',
        threshold: '>=3 toneladas',
        discountPct: 10,
        copKg: 1260,
        url: 'https://frescorganico.com/materia-primas'
      }
    ],
    notes: 'Costo canónico actual = precio público por bulto. El extremo inferior refleja descuento mayorista; el superior proviene de referencia retail secundaria y no reemplaza el precio canónico.'
  },

  cascarilla_avena: {
    status: 'planning_proxy',
    optimizerEligible: false,
    canonicalCopKg: null,
    planningCopKg: 1200,
    rangeCopKg: { min: 700, max: 2000 },
    costBasis: 'planning_proxy_ex_transport_to_tenjo',
    verifiedAt: '2026-08-23',
    evidence: [
      {
        type: 'proxy_material',
        material: 'Heno',
        supplier: 'Frescorgánico',
        packageKg: 40,
        observedPackagePriceCop: 17000,
        observedCopKg: 425,
        url: 'https://frescorganico.com/producto/heno'
      },
      {
        type: 'proxy_material',
        material: 'Torta de palmiste expeller',
        supplier: 'Frescorgánico',
        observedCopKg: 1400,
        url: 'https://frescorganico.com/producto/torta-de-palmiste-expelier'
      }
    ],
    notes: 'No se encontró una cotización pública colombiana inequívoca para cascarilla de avena. El valor central y rango son solo presupuesto piloto; requieren cotización del producto exacto antes de habilitar economía.'
  },

  ddgs_maiz: {
    status: 'quote_required',
    optimizerEligible: false,
    canonicalCopKg: null,
    costBasis: 'supplier_quote_required',
    verifiedAt: '2026-08-23',
    notes: 'Existe disponibilidad comercial en Colombia, pero no se localizó precio público suficientemente específico y comparable puesto en Bogotá/Tenjo.'
  },

  torta_canola: {
    status: 'quote_required',
    optimizerEligible: false,
    canonicalCopKg: null,
    costBasis: 'supplier_quote_required',
    verifiedAt: '2026-08-23',
    notes: 'Referencias internacionales sirven como benchmark, no como costo local canónico. Requiere cotización colombiana.'
  },

  corn_gluten_feed: {
    status: 'quote_required',
    optimizerEligible: false,
    canonicalCopKg: null,
    costBasis: 'identity_and_supplier_quote_required',
    verifiedAt: '2026-08-23',
    evidence: [
      {
        type: 'identity_ambiguous_public_price',
        supplier: 'Frescorgánico',
        product: 'Gluten de maíz',
        packageKg: 40,
        packagePriceCop: 374250,
        copKg: 9356.25,
        url: 'https://frescorganico.com/materia-primas'
      }
    ],
    notes: 'No usar el precio publicado hasta confirmar que el producto sea corn gluten feed y no corn gluten meal; son ingredientes diferentes.'
  },

  bagazo_zanahoria: freshWasteCost(),
  residuo_pina: freshWasteCost(),
  bagazo_manzana: freshWasteCost(),
  orujo_naranja: freshWasteCost(),
};

function freshWasteCost() {
  return {
    status: 'quote_required',
    optimizerEligible: false,
    canonicalCopKg: null,
    costBasis: 'acquisition_plus_segregation_transport_stabilization_drying',
    verifiedAt: '2026-08-23',
    notes: 'Para residuos frescos el costo de adquisición no representa el costo utilizable. Cotizar por separado residuo, recolección/segregación, transporte y estabilización/secado; normalizar después a kg de materia seca.'
  };
}

function validateMarketCosts(costs = INGREDIENT_MARKET_COSTS) {
  const errors = [];
  const allowed = new Set(['verified_market_price', 'planning_proxy', 'quote_required']);
  for (const [id, item] of Object.entries(costs)) {
    if (!allowed.has(item.status)) errors.push(`${id}: invalid status ${item.status}`);
    if (item.optimizerEligible && item.status !== 'verified_market_price') errors.push(`${id}: only verified market prices may be optimizerEligible`);
    if (item.optimizerEligible && !(item.canonicalCopKg > 0)) errors.push(`${id}: optimizerEligible requires canonicalCopKg > 0`);
    if (item.status !== 'verified_market_price' && item.canonicalCopKg != null) errors.push(`${id}: non-verified cost cannot be canonical`);
    if (!item.costBasis) errors.push(`${id}: missing costBasis`);
    if (!item.verifiedAt) errors.push(`${id}: missing verifiedAt`);
  }
  return errors;
}

function optimizerCostFor(id) {
  const item = INGREDIENT_MARKET_COSTS[id];
  return item?.optimizerEligible ? item.canonicalCopKg : null;
}

module.exports = { INGREDIENT_MARKET_COSTS, validateMarketCosts, optimizerCostFor };

if (typeof window !== 'undefined') {
  window.SETAS_OS_INGREDIENT_MARKET_COSTS = INGREDIENT_MARKET_COSTS;
}
