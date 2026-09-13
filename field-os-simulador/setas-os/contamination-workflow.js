'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SetasContaminationWorkflow = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PATHOGENS_CATALOG = Object.freeze({
    trichoderma: {
      id: 'trichoderma',
      scientific: 'Trichoderma spp. (T. viride / T. harzianum)',
      commonName: 'Moho Verde',
      type: 'hongo_competidor',
      dangerLevel: 'critical',
      sporeDispersion: 'explosiva',
      symptoms: 'Manchas algodonosas blancas que tornan rápidamente a verde oscuro granular. Micelio agresivo y parasitario.',
      biosecurityProtocol: [
        'Apagar inmediatamente la ventilación forzada (FAE) en la sala para evitar dispersión aérea de conidiosporas.',
        'Pulverizar solución de alcohol al 70% o solución clorada (10%) suavemente sobre la superficie antes de manipular la bolsa.',
        'Embolsar herméticamente in situ en bolsa de polietileno negra calibre 2 antes de mover.',
        'Desinfectar la balda o estantería con hipoclorito de sodio al 1% o amonio cuaternario.',
        'Revisar pH del sustrato (ideal ≥ 6.8 con carbonato de calcio para inhibir germinación).'
      ]
    },
    neurospora: {
      id: 'neurospora',
      scientific: 'Neurospora sitophila',
      commonName: 'Moho Naranja del Pan',
      type: 'hongo_competidor',
      dangerLevel: 'critical',
      sporeDispersion: 'extrema',
      symptoms: 'Crecimiento exuberante y pulverulento de color naranja a salmón brillante que invade rápidamente el filtro de la bolsa.',
      biosecurityProtocol: [
        'Aislamiento inmediato. No abrir ni apretar la bolsa bajo ninguna circunstancia.',
        'Humedecer con paño desinfectante embebido en alcohol antes del traslado para evitar aerosoles de ascosporas.',
        'Esterilizar o incinerar inmediatamente el material descartado.',
        'Revisar integridad de los filtros microporosos (0.2 a 0.5 micras) en las bolsas del bache.',
        'Evaluar presión y tiempo del autoclave (requiere asegurar F₀ ≥ 12 min a 121 °C).'
      ]
    },
    cobweb: {
      id: 'cobweb',
      scientific: 'Dactylium dendroides / Cladobotryum spp.',
      commonName: 'Moho Telaraña',
      type: 'hongo_parasito',
      dangerLevel: 'high',
      sporeDispersion: 'alta',
      symptoms: 'Fibras grisáceas muy finas y etéreas que cubren rápidamente primordios y carpóforos jóvenes.',
      biosecurityProtocol: [
        'Técnica de salting: cubrir la zona afectada con una capa fina de sal marina fina o bicarbonato antes de remover.',
        'Reducir la humedad relativa (HR) ambiental a 82-84% y aumentar la recirculación de aire suave.',
        'Retirar cuidadosamente los primordios afectados con pinzas o guantes estériles.',
        'Eliminar acumulación de agua líquida libre sobre los bloques de sustrato.'
      ]
    },
    bacillus: {
      id: 'bacillus',
      scientific: 'Bacillus subtilis / B. cereus',
      commonName: 'Grano Húmedo / Mancha Bacteriana',
      type: 'bacteria_endofitica',
      dangerLevel: 'medium',
      sporeDispersion: 'contacto',
      symptoms: 'Sustrato o grano húmedo, grasoso, con olor agrio o fermentado característico y micelio estancado o transparente.',
      biosecurityProtocol: [
        'Descartar las bolsas afectadas: las endosporas bacterianas resisten tratamientos térmicos deficientes.',
        'Asegurar pre-remojo de granos/sustrato mínimo de 12 horas para forzar la germinación de endosporas antes de autoclavar.',
        'Monitorear termocuplas en el centro térmico de la carga de esterilización.',
        'Corregir exceso de agua en la mezcla (humedad máxima según especie, típicamente 65-68%).'
      ]
    },
    mycogone: {
      id: 'mycogone',
      scientific: 'Mycogone perniciosa',
      commonName: 'Burbuja Húmeda',
      type: 'hongo_parasito',
      dangerLevel: 'high',
      sporeDispersion: 'media',
      symptoms: 'Masas de tejido tumoral deforme con pequeñas gotas exudadas color ámbar o café con mal olor.',
      biosecurityProtocol: [
        'Cubrir inmediatamente con alcohol al 70% o solución de yodo al 1%.',
        'Retirar el carpóforo/bolsa afectada en bolsa plástica cerrada herméticamente.',
        'Lavar manos y herramientas con jabón quirúrgico y alcohol antes de tocar otros bloques.',
        'Desinfectar pisos y bandejas de drenaje de la sala de fructificación.'
      ]
    }
  });

  const DECISION_TYPES = Object.freeze({
    isolate_bags: {
      id: 'isolate_bags',
      label: 'Extracción quirúrgica de bolsas (lote continúa en sala)',
      targetStateAction: 'keep_state'
    },
    quarantine: {
      id: 'quarantine',
      label: 'Traslado de lote a Sala de Cuarentena',
      targetStateAction: 'transition_quarantine'
    },
    discard: {
      id: 'discard',
      label: 'Descarte total del lote (pérdida irreparable)',
      targetStateAction: 'transition_discarded'
    }
  });

  /**
   * Calcula el impacto agronómico y financiero de la contaminación en un lote.
   */
  function calculateContaminationLoss({ batch, affectedBags = 0, totalBags = 0, costPerBagOverride = null }) {
    const tot = Math.max(1, Number(totalBags) || Number(batch?.numBolsas) || 1);
    const aff = Math.max(0, Math.min(tot, Number(affectedBags) || 0));
    const lossPct = Math.round((aff / tot) * 100);
    const healthyBags = Math.max(0, tot - aff);

    // Costo por bolsa estimado a partir de la receta, costoIngKg y pesoHumedo, con fallback realista de $3.500 COP
    let unitCost = 3500;
    if (costPerBagOverride != null && Number(costPerBagOverride) > 0) {
      unitCost = Number(costPerBagOverride);
    } else if (batch?.costoBolsa && Number(batch.costoBolsa) > 0) {
      unitCost = Number(batch.costoBolsa);
    } else if (batch?.costoIngKg && batch?.pesoHumedo && Number(batch.costoIngKg) > 0) {
      unitCost = Math.round(Number(batch.costoIngKg) * Number(batch.pesoHumedo));
    }

    const lossCostCop = aff * unitCost;

    let suggestedAction = 'isolate_bags';
    if (lossPct >= 50) {
      suggestedAction = 'discard';
    } else if (lossPct >= 20) {
      suggestedAction = 'quarantine';
    }

    const severity = lossPct >= 20 ? 'critical' : aff > 0 ? 'warning' : 'nominal';

    return Object.freeze({
      totalBags: tot,
      affectedBags: aff,
      healthyBags,
      lossPct,
      unitCostCop: unitCost,
      lossCostCop,
      suggestedAction,
      severity
    });
  }

  /**
   * Determina el estado de ciclo de vida destino según la decisión y el porcentaje de pérdida.
   */
  function determineTargetLifecycleState(currentState, decision, lossPct = 0) {
    if (decision === 'discard' || lossPct >= 50) {
      return 'discarded';
    }
    if (decision === 'quarantine' || (lossPct >= 20 && decision !== 'isolate_bags')) {
      return 'quarantine';
    }
    return currentState;
  }

  /**
   * Construye el evento inmutable de incidente de contaminación para lifecycleEvents.
   */
  function buildContaminationEvent({
    batchId,
    pathogenKey,
    affectedBags,
    totalBags,
    location = '—',
    decision = 'isolate_bags',
    operatorId = 'operador-local',
    notes = '',
    lossCostCop = 0,
    at = null
  }) {
    if (!batchId) throw new Error('batchId is required for contamination event');
    const pathogen = PATHOGENS_CATALOG[pathogenKey] || {
      id: pathogenKey || 'desconocido',
      scientific: 'Patógeno no catalogado',
      commonName: pathogenKey || 'Desconocido',
      dangerLevel: 'medium'
    };

    const lossPct = totalBags > 0 ? Math.round((affectedBags / totalBags) * 100) : 0;

    return Object.freeze({
      type: 'contamination_incident',
      batchId,
      pathogenId: pathogen.id,
      pathogenName: pathogen.commonName,
      pathogenScientific: pathogen.scientific,
      dangerLevel: pathogen.dangerLevel,
      affectedBags: Number(affectedBags) || 0,
      totalBags: Number(totalBags) || 0,
      lossPct,
      lossCostCop: Number(lossCostCop) || 0,
      location,
      decision,
      operatorId,
      notes: (notes || '').trim(),
      at: at || new Date().toISOString()
    });
  }

  return Object.freeze({
    PATHOGENS_CATALOG,
    DECISION_TYPES,
    calculateContaminationLoss,
    determineTargetLifecycleState,
    buildContaminationEvent
  });
});
