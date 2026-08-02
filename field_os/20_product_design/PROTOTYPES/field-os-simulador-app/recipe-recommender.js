// ════════════════════════════════════════════════════════════════
// RECIPE RECOMMENDER & PDF EXPORT
// ════════════════════════════════════════════════════════════════

/**
 * Recommender: Given available ingredients, suggest optimal recipes
 */
function recommendRecipes(available, targetSpecies, allIngredients, allSpecies) {
  // available = { [ingredientId]: quantityKg, ... }
  // targetSpecies = null (find all) or speciesKey
  // Returns: [ { species, ingredients: [{id, amt, pct}], score, notes } ]
  
  const candidates = targetSpecies ? [allSpecies[targetSpecies]] : Object.values(allSpecies);
  const results = [];
  
  for (const species of candidates) {
    if (!species) continue;
    
    // Try to build a recipe with available ingredients
    const recipe = tryBuildRecipe(available, species, allIngredients);
    if (recipe) {
      results.push({
        speciesKey: species.name,
        speciesScientific: species.scientific,
        ingredients: recipe.ingredients,
        cn: recipe.cn,
        totalKg: recipe.totalKg,
        score: recipe.score, // 0-100, higher = better match
        notes: recipe.notes,
        costPerKg: recipe.costPerKg
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

function tryBuildRecipe(available, species, allIngredients) {
  // Greedy algorithm: fill recipe proportions using available ingredients
  // Prioritize: base carbon > supplements > aerators
  
  const cn_target = species.cn_optimal.ideal;
  const n_target = species.n_optimal.ideal;
  
  // Separate available by role
  const byRole = {};
  for (const [ingId, qty] of Object.entries(available)) {
    if (qty <= 0) continue;
    const ing = allIngredients.find(i => i.id === ingId);
    if (!ing) continue;
    
    if (!byRole[ing.role]) byRole[ing.role] = [];
    byRole[ing.role].push({ ...ing, availableQty: qty });
  }
  
  // Must have base carbon
  if (!byRole.base_carbono || byRole.base_carbono.length === 0) {
    return null;
  }
  
  // Try to hit C:N by mixing base + supplement
  let recipe = [];
  let totalC = 0, totalN = 0, totalQty = 0;
  let usedQty = {};
  
  // Start with base (70% of dry matter)
  const baseIng = byRole.base_carbono[0];
  const baseQty = 70;
  recipe.push({ id: baseIng.id, name: baseIng.name, pct: 70, kg: 0 });
  totalC += baseIng.c * 0.7;
  totalN += baseIng.n * 0.7;
  usedQty[baseIng.id] = baseQty;
  
  // Fill remaining 30% with supplements
  let remaining = 30;
  if (byRole.suplemento_n && byRole.suplemento_n.length > 0) {
    const suppIng = byRole.suplemento_n[0];
    const suppQty = Math.min(remaining, 20);
    recipe.push({ id: suppIng.id, name: suppIng.name, pct: suppQty, kg: 0 });
    totalC += suppIng.c * (suppQty / 100);
    totalN += suppIng.n * (suppQty / 100);
    usedQty[suppIng.id] = suppQty;
    remaining -= suppQty;
  }
  
  if (remaining > 0 && byRole.aireador && byRole.aireador.length > 0) {
    const aerIng = byRole.aireador[0];
    recipe.push({ id: aerIng.id, name: aerIng.name, pct: remaining, kg: 0 });
    totalC += aerIng.c * (remaining / 100);
    totalN += aerIng.n * (remaining / 100);
    usedQty[aerIng.id] = remaining;
  }
  
  // Validate against available qty
  let canMake = 1000; // max bags
  for (const [ingId, pctUsed] of Object.entries(usedQty)) {
    const ing = allIngredients.find(i => i.id === ingId);
    const availableKg = available[ingId] || 0;
    const bagsWithThisIng = Math.floor((availableKg * 100) / pctUsed);
    canMake = Math.min(canMake, bagsWithThisIng);
  }
  
  if (canMake <= 0) return null;
  
  // Calculate actual C:N
  const actualCN = totalC > 0 ? totalC / (totalN || 0.001) : 0;
  const cnError = Math.abs(actualCN - cn_target);
  const cnScore = Math.max(0, 100 - (cnError * 10)); // deduct 10 points per CN unit of error
  
  // Calculate cost
  let totalCost = 0;
  for (const item of recipe) {
    const ing = allIngredients.find(i => i.id === item.id);
    if (ing) totalCost += ing.cost * (item.pct / 100);
  }
  
  const costPerKg = totalCost > 0 ? totalCost : 0;
  const score = Math.max(0, cnScore - (totalCost / 100)); // slight penalty for cost
  
  return {
    ingredients: recipe,
    cn: actualCN,
    totalKg: canMake,
    costPerKg: costPerKg,
    score: Math.round(score),
    notes: canMake < 5 ? `⚠️ Solo puedes hacer ~${canMake} bolsas con estos ingredientes` : 
           canMake < 20 ? `⚠️ Limitado a ~${canMake} bolsas` : ''
  };
}

/**
 * PDF Export: Generate printable PDF of recipe
 */
function generatePDF(recipe, species, allIngredients, totalKg) {
  // Uses html2pdf library — must be loaded separately
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; padding: 20px; color: #333;">
      <h1 style="text-align: center; margin-bottom: 5px;">${species.name}</h1>
      <p style="text-align: center; color: #666; font-style: italic; margin-bottom: 20px;">
        ${species.scientific} · Síntesis para ${totalKg} bolsas
      </p>
      
      <h2 style="border-bottom: 2px solid #C5562D; padding-bottom: 8px; font-size: 14px;">
        INGREDIENTES
      </h2>
      <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Ingrediente</th>
            <th style="text-align: center; padding: 8px; border: 1px solid #ddd;">%</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">kg/bolsa</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Total (${totalKg})</th>
          </tr>
        </thead>
        <tbody>
          ${recipe.map(item => {
            const ing = allIngredients.find(i => i.id === item.id);
            if (!ing) return '';
            const kgPerBag = (item.pct / 100) * 1.5; // assuming 1.5kg per bag
            const kgTotal = kgPerBag * totalKg;
            return `
              <tr style="border: 1px solid #ddd;">
                <td style="padding: 8px;">${item.name}</td>
                <td style="text-align: center; padding: 8px;">${item.pct.toFixed(1)}%</td>
                <td style="text-align: right; padding: 8px;">${kgPerBag.toFixed(2)}</td>
                <td style="text-align: right; padding: 8px; font-weight: bold;">${kgTotal.toFixed(1)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <h2 style="border-bottom: 2px solid #C5562D; padding-bottom: 8px; font-size: 14px;">
        INSTRUCCIONES
      </h2>
      <ol style="line-height: 1.6;">
        <li>Mezclar ingredientes en seco. Homogenizar bien.</li>
        <li>Ajustar humedad a ${species.moisture?.ideal || 65}% (escurrir con presión moderada).</li>
        <li>Empacar en bolsas perforadas de ${totalKg > 10 ? '5–10kg' : '1.5–2kg'}.</li>
        <li>Esterilizar a 15 PSI, 121°C durante 2.5 horas.</li>
        <li>Enfriar completamente antes de inocular.</li>
        <li>Inocular con spawn @ 5–10% en peso seco.</li>
        <li>Incubar a ${species.temp_fruit} en oscuridad, 70–80% humedad.</li>
        <li>Esperar primordios en día 15–25. Cosechar cuando los sombreros se abran.</li>
      </ol>
      
      <h2 style="border-bottom: 2px solid #C5562D; padding-bottom: 8px; font-size: 14px;">
        PARÁMETROS ÓPTIMOS
      </h2>
      <ul style="line-height: 1.6;">
        <li><strong>C:N:</strong> ${species.cn_optimal.min}–${species.cn_optimal.max}:1 (ideal ${species.cn_optimal.ideal}:1)</li>
        <li><strong>pH:</strong> ${species.ph_optimal.min}–${species.ph_optimal.max}</li>
        <li><strong>Humedad:</strong> ${species.moisture.ideal}%</li>
        <li><strong>Temperatura frutificación:</strong> ${species.temp_fruit}</li>
        <li><strong>Ciclo total:</strong> ${species.cycle || '60–90 días'}</li>
      </ul>
      
      <p style="margin-top: 30px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 10px;">
        Generado por Setas de la Peña — Simulador de Recetas
      </p>
    </div>
  `;
  
  return html;
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.RecipeTools = {
    recommendRecipes,
    generatePDF
  };
}
