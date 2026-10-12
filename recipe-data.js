'use strict';
// Recetas que pueden iniciar una consulta. grams: shiitake fresco limpio de la receta base (ver recetas.html).
// El identificador viene de la URL: solo se aceptan estas claves; nunca texto libre.
// Los ingredientes con cantidad se escalan desde estos valores base, que nunca se modifican.
// qty: { n, max?, unit?, one?, many?, rest? }. 'one'/'many' son el texto según el número; sin cantidad, solo text.
const amount = (n, unit, rest) => ({ n, unit, rest });
const count = (n, one, many) => ({ n, one, many });
const spoon = (n, tail, max) => ({ n, max, one: `cucharada de ${tail}`, many: `cucharadas de ${tail}` });
const recipes = {
  'receta-arepa': {
    name: 'la arepa con shiitake, maíz y aguacate', title: 'Arepa con shiitake', grams: 300,
    yield: [{ n: 2 }, ' personas · ', { n: 4 }, ' arepas pequeñas'],
    ingredients: [
      { id: 'arepas', qty: count(4, 'arepa pequeña lista para calentar', 'arepas pequeñas listas para calentar') },
      { id: 'shiitake', qty: amount(300, 'g', 'de shiitake fresco limpio, en láminas') },
      { id: 'maiz', qty: amount(150, 'g', 'de maíz tierno cocido y escurrido') },
      { id: 'aguacate', qty: count(1, 'aguacate mediano', 'aguacates medianos') },
      { id: 'limon', qty: spoon(1, 'jugo de limón, y más al gusto') },
      { id: 'cilantro', qty: spoon(1, 'cilantro picado') },
      { id: 'cebolla', qty: spoon(2, 'cebolla larga picada') },
      { id: 'ajo', qty: count(1, 'diente de ajo picado', 'dientes de ajo picado') },
      { id: 'aceite', qty: spoon(1, 'aceite, y más si hace falta') },
      { id: 'queso', qty: amount(40, 'g', 'de queso campesino, opcional') },
      { id: 'sal', text: 'Sal y pimienta al gusto' }
    ]
  },
  'receta-sopa': {
    name: 'la sopa de shiitake, coco y jengibre', title: 'Sopa de shiitake y coco', grams: 300,
    yield: [{ n: 4 }, ' entradas o ', { n: 2 }, ' porciones grandes'],
    ingredients: [
      { id: 'shiitake', qty: amount(300, 'g', 'de shiitake fresco limpio, en láminas') },
      { id: 'coco', qty: amount(400, 'ml', 'de leche de coco culinaria sin azúcar añadida') },
      { id: 'caldo', qty: amount(600, 'ml', 'de caldo vegetal') },
      { id: 'yuca', qty: amount(200, 'g', 'de yuca pelada en cubos pequeños, opcional') },
      { id: 'cebolla', qty: spoon(2, 'cebolla larga picada') },
      { id: 'ajo', qty: count(1, 'diente de ajo picado', 'dientes de ajo picado') },
      { id: 'jengibre', qty: amount(8, 'g', 'de jengibre fresco rallado') },
      { id: 'aceite', qty: spoon(1, 'aceite') },
      { id: 'limon', qty: spoon(1, 'jugo de limón', 2) },
      { id: 'al-gusto', text: 'Cilantro y sal al gusto; ají opcional' }
    ]
  },
  'receta-patacones': {
    name: 'los patacones al horno con shiitake', title: 'Patacones con shiitake', grams: 250,
    yield: [{ n: 8 }, ' bases pequeñas · ', { n: 2, max: 4 }, ' personas'],
    ingredients: [
      { id: 'platanos', qty: count(2, 'plátano verde', 'plátanos verdes') },
      { id: 'aceite-sal', text: 'Aceite para pincelar y sal al gusto' },
      { id: 'shiitake', qty: amount(250, 'g', 'de shiitake fresco limpio, en láminas') },
      { id: 'aguacate', qty: count(1, 'aguacate pequeño', 'aguacates pequeños') },
      { id: 'al-gusto', text: 'Limón, cilantro y cebolla larga al gusto' }
    ]
  }
};
const SCALES = [1, 2, 3];
const scaleLabels = { 1: 'Receta base', 2: 'Doble', 3: 'Triple' };
const numeral = (n, max, k) => max ? `${n * k}–${max * k}` : String(n * k);
function ingredientText(item, k) {
  if (!item.qty) return item.text;
  const { n, max, unit, rest, one, many } = item.qty;
  const tail = rest !== undefined ? rest : (n * k === 1 && !max ? one : many);
  return `${numeral(n, max, k)} ${unit ? `${unit} ` : ''}${tail}`;
}
function yieldText(parts, k) {
  return parts.map(part => typeof part === 'string' ? part : numeral(part.n, part.max, k)).join('');
}
// Siempre se calcula desde los valores base: ×1 → ×3 → ×1 devuelve exactamente la receta original.
window.SetasRecipes = Object.fromEntries(Object.entries(recipes).map(([id, recipe]) => [id, {
  ...recipe,
  render: k => ({ yield: yieldText(recipe.yield, k), ingredients: Object.fromEntries(recipe.ingredients.map(item => [item.id, ingredientText(item, k)])) })
}]));
window.SetasRecipeScales = { values: SCALES, labels: scaleLabels };
