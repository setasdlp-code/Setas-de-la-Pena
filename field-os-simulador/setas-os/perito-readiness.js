'use strict';
// Presentation assessment only. Does not change scoring, biological rules or
// authorize production. Inputs belong to one explicit Formulador revision.
(function () {
  const number = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  const assessReadiness = (input, model, history) => {
    const recipe = input.recipe || [];
    const ingredients = new Map((input.ingredients || []).map(g => [g.id, g]));
    const ids = new Set(recipe.map(r => r.id));
    const validRows = recipe.length > 0 && ids.size === recipe.length && recipe.every(r => ingredients.has(r.id) && number(r.p) !== null && number(r.p) > 0);
    const total = recipe.reduce((sum, r) => sum + (number(r.p) || 0), 0);
    // Same acceptance tolerance as SetasFormulatorAPI.validateRecipe.
    const balanced = validRows && Math.abs(total - 100) <= 0.15;
    const checks = [];
    const add = (id, label, status, detail, action, actionLabel) => checks.push({id,label,status,detail,action,actionLabel});
    add('species','Especie',input.species?.confirmed === true ? 'ready' : 'unknown',input.species?.confirmed === true ? 'Especie seleccionada para esta receta.' : 'Confirma la especie antes de evaluar la preparación del lote.','species','Elegir especie');
    add('composition','Composición',balanced ? 'ready' : 'blocked',balanced ? 'Ingredientes identificados y mezcla al 100% en base seca.' : 'Revisa ingredientes, porcentajes y total de la mezcla (100% ±0,15%).','recipe','Revisar receta');
    const safety = model?.dimensions?.safety?.status;
    add('model','Evaluación del modelo',safety === 'hold' ? 'blocked' : safety === 'approved' ? 'ready' : 'unknown',safety === 'hold' ? 'El modelo detecta restricciones que requieren corrección.' : safety === 'approved' ? 'Sin bloqueo en esta evaluación. No equivale a aprobación de producción.' : 'Revisa las advertencias y recomendaciones de esta receta.','recommendations','Ver recomendaciones');
    const wetKg = number(input.batch?.wetKg);
    const moisture = number(input.batch?.targetMoisturePct);
    const batchKnown = wetKg > 0 && moisture !== null && moisture >= 0 && moisture <= 92;
    add('batch','Tamaño y humedad objetivo',batchKnown ? 'ready' : 'unknown',batchKnown ? `${wetKg} kg húmedos · humedad objetivo ${moisture}%.` : 'Falta un tamaño de lote o una humedad objetivo válidos.','batch','Revisar lote');
    const stockMap = input.inventory?.stockKgById;
    const quantityKnown = balanced && batchKnown && input.inventory?.available === true && stockMap && recipe.every(r => {
      const m = number(input.ingredientMoistureById?.[r.id]);
      const stock = number(stockMap[r.id] ?? 0);
      return m !== null && m >= 0 && m <= 92 && stock !== null && stock >= 0;
    });
    let stock = null;
    if (quantityKnown) {
      const rows = recipe.map(r => {
        const requiredWetKg = wetKg * (1 - moisture / 100) * Number(r.p) / 100 / (1 - Number(input.ingredientMoistureById[r.id]) / 100);
        const availableWetKg = Number(stockMap[r.id] ?? 0);
        return {id:r.id,name:ingredients.get(r.id).name || r.id,requiredWetKg,availableWetKg,missingWetKg:Math.max(0,requiredWetKg-availableWetKg)};
      });
      stock = {rows,limiting:rows.filter(r => r.missingWetKg > 0.000001)};
    }
    add('stock','Bodega',!stock ? 'unknown' : stock.limiting.length ? 'blocked' : 'ready',!stock ? 'No se puede verificar cobertura: revisa cantidades, tamaño del lote y humedad de ingredientes.' : stock.limiting.length ? `${stock.limiting.length} ingrediente(s) con faltantes para este lote.` : 'Las cantidades registradas cubren este lote; confirma existencias físicas.','inventory','Revisar Bodega');
    // A recommended treatment is not evidence of available equipment or a
    // validated cycle. Current recipe state has no recorded process signoff.
    add('process','Proceso disponible','unknown','El tratamiento recomendado no confirma equipo disponible ni un ciclo validado para esta carga.','process','Revisar tratamiento');
    add('evidence','Evidencia de producción',history?.matched && history.n > 0 ? 'ready' : 'unknown',history?.matched && history.n > 0 ? `${history.n} registro(s) seleccionado(s) por similitud de receta; revisa también el proceso y las condiciones.` : history?.n > 0 ? 'Hay historial, pero sin recetas suficientemente similares; la estimación es una extrapolación.' : 'Sin historial comparable con EB real. La estimación sigue siendo teórica.','history','Revisar Recetario');
    add('approval','Aprobación humana','unknown','No hay una aprobación humana vinculada a esta versión de la receta. Un índice favorable no autoriza producción.','history','Revisar Recetario');
    return {inputRevision:input.inputRevision,status:checks.some(c=>c.status==='blocked')?'blocked':checks.some(c=>c.status==='unknown')?'verify':'ready',checks,stock};
  };
  const api = {assessReadiness};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  globalThis.SetasPeritoReadiness = api;
})();
