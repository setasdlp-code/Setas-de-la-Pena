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
      { id: 'aceite-sal', text: 'Aceite para pincelar la bandeja y los plátanos y para saltear los hongos; sal al gusto' },
      { id: 'shiitake', qty: amount(250, 'g', 'de shiitake fresco limpio, en láminas') },
      { id: 'aguacate', qty: count(1, 'aguacate pequeño', 'aguacates pequeños') },
      { id: 'al-gusto', text: 'Limón, cilantro y cebolla larga al gusto' }
    ]
  },
  "receta-atollado": {
  "name": "el arroz atollado con shiitake y papa criolla",
  "title": "Arroz atollado con shiitake",
  "grams": 500,
  "yield": [
    {
      "n": 4,
      "max": 6
    },
    " personas"
  ],
  "ingredients": [
    {
      "id": "shiitake",
      "qty": {
        "n": 500,
        "unit": "g",
        "rest": "de shiitake fresco limpio, la mitad en cuartos y la mitad en láminas"
      }
    },
    {
      "id": "arroz",
      "qty": {
        "n": 400,
        "unit": "g",
        "rest": "de arroz blanco crudo"
      }
    },
    {
      "id": "papa",
      "qty": {
        "n": 500,
        "unit": "g",
        "rest": "de papa criolla lavada, en mitades"
      }
    },
    {
      "id": "caldo",
      "qty": {
        "n": 1500,
        "unit": "ml",
        "rest": "de caldo vegetal caliente, y más si hace falta"
      }
    },
    {
      "id": "cebolla-larga",
      "qty": {
        "n": 2,
        "one": "rama de cebolla larga picada",
        "many": "ramas de cebolla larga picadas"
      }
    },
    {
      "id": "cebolla",
      "qty": {
        "n": 1,
        "one": "cebolla cabezona picada",
        "many": "cebollas cabezonas picadas"
      }
    },
    {
      "id": "pimenton",
      "qty": {
        "n": 1,
        "one": "pimentón rojo picado",
        "many": "pimentones rojos picados"
      }
    },
    {
      "id": "tomate",
      "qty": {
        "n": 3,
        "one": "tomate chonto picado",
        "many": "tomates chontos picados"
      }
    },
    {
      "id": "ajo",
      "qty": {
        "n": 4,
        "one": "diente de ajo picado",
        "many": "dientes de ajo picados"
      }
    },
    {
      "id": "comino",
      "qty": {
        "n": 1,
        "one": "cucharadita de comino molido",
        "many": "cucharaditas de comino molido"
      }
    },
    {
      "id": "achiote",
      "qty": {
        "n": 1,
        "one": "cucharadita de achiote molido de uso culinario",
        "many": "cucharaditas de achiote molido de uso culinario"
      }
    },
    {
      "id": "mantequilla",
      "qty": {
        "n": 2,
        "one": "cucharada de mantequilla",
        "many": "cucharadas de mantequilla"
      }
    },
    {
      "id": "aceite",
      "qty": {
        "n": 2,
        "one": "cucharada de aceite vegetal",
        "many": "cucharadas de aceite vegetal"
      }
    },
    {
      "id": "final",
      "text": "Cilantro, sal y pimienta al gusto; aguacate para acompañar, opcional"
    }
  ]
},
  "receta-ajiaco": {
  "name": "el ajiaco con shiitake y tres papas",
  "title": "Ajiaco con shiitake",
  "grams": 400,
  "yield": [
    {
      "n": 4
    },
    " personas"
  ],
  "ingredients": [
    {
      "id": "shiitake",
      "qty": {
        "n": 400,
        "unit": "g",
        "rest": "de shiitake fresco limpio, en láminas gruesas"
      }
    },
    {
      "id": "pastusa",
      "qty": {
        "n": 300,
        "unit": "g",
        "rest": "de papa pastusa pelada, en rodajas"
      }
    },
    {
      "id": "sabanera",
      "qty": {
        "n": 300,
        "unit": "g",
        "rest": "de papa sabanera pelada, en rodajas"
      }
    },
    {
      "id": "criolla",
      "qty": {
        "n": 400,
        "unit": "g",
        "rest": "de papa criolla lavada, en mitades"
      }
    },
    {
      "id": "mazorca",
      "qty": {
        "n": 2,
        "one": "mazorca tierna cortada en trozos",
        "many": "mazorcas tiernas cortadas en trozos"
      }
    },
    {
      "id": "caldo",
      "qty": {
        "n": 1500,
        "unit": "ml",
        "rest": "de caldo vegetal, y más si hace falta"
      }
    },
    {
      "id": "cebolla",
      "qty": {
        "n": 1,
        "one": "rama de cebolla larga picada",
        "many": "ramas de cebolla larga picadas"
      }
    },
    {
      "id": "ajo",
      "qty": {
        "n": 2,
        "one": "diente de ajo picado",
        "many": "dientes de ajo picados"
      }
    },
    {
      "id": "mantequilla",
      "qty": {
        "n": 2,
        "one": "cucharada de mantequilla",
        "many": "cucharadas de mantequilla"
      }
    },
    {
      "id": "guascas",
      "text": "Guascas frescas o secas al gusto, según la presentación"
    },
    {
      "id": "final",
      "text": "Cilantro, sal y pimienta al gusto; crema de leche, alcaparras y aguacate para servir"
    }
  ]
},
  "receta-mote": {
  "name": "el mote de ñame, queso y shiitake",
  "title": "Mote de ñame con shiitake",
  "grams": 300,
  "yield": [
    {
      "n": 4
    },
    " personas"
  ],
  "ingredients": [
    {
      "id": "shiitake",
      "qty": {
        "n": 300,
        "unit": "g",
        "rest": "de shiitake fresco limpio, en mitades o láminas de grosor uniforme"
      }
    },
    {
      "id": "name",
      "qty": {
        "n": 750,
        "unit": "g",
        "rest": "de ñame de uso culinario, pelado y en trozos"
      }
    },
    {
      "id": "queso",
      "qty": {
        "n": 300,
        "unit": "g",
        "rest": "de queso costeño en cubos"
      }
    },
    {
      "id": "suero",
      "qty": {
        "n": 80,
        "unit": "ml",
        "rest": "de suero costeño"
      }
    },
    {
      "id": "caldo",
      "qty": {
        "n": 1500,
        "unit": "ml",
        "rest": "de caldo vegetal, y más si hace falta"
      }
    },
    {
      "id": "cebolla",
      "qty": {
        "n": 2,
        "one": "cebolla picada",
        "many": "cebollas picadas"
      }
    },
    {
      "id": "cebolla-larga",
      "qty": {
        "n": 1,
        "one": "rama de cebolla larga picada",
        "many": "ramas de cebolla larga picadas"
      }
    },
    {
      "id": "tomate",
      "qty": {
        "n": 1,
        "one": "tomate chonto picado",
        "many": "tomates chontos picados"
      }
    },
    {
      "id": "ajo",
      "qty": {
        "n": 4,
        "one": "diente de ajo picado",
        "many": "dientes de ajo picados"
      }
    },
    {
      "id": "comino",
      "qty": {
        "n": 1,
        "one": "cucharadita de comino molido",
        "many": "cucharaditas de comino molido"
      }
    },
    {
      "id": "mantequilla",
      "qty": {
        "n": 2,
        "one": "cucharada de mantequilla",
        "many": "cucharadas de mantequilla"
      }
    },
    {
      "id": "aceite",
      "qty": {
        "n": 2,
        "one": "cucharada de aceite vegetal",
        "many": "cucharadas de aceite vegetal"
      }
    },
    {
      "id": "limon",
      "qty": {
        "n": 1,
        "one": "limón, su jugo al gusto",
        "many": "limones, su jugo al gusto"
      }
    },
    {
      "id": "final",
      "text": "Cilantro, sal y pimienta al gusto"
    }
  ]
},
  "receta-encocado": {
  "name": "el encocado de shiitake con cúrcuma",
  "title": "Encocado de shiitake",
  "grams": 350,
  "yield": [
    {
      "n": 4
    },
    " personas"
  ],
  "ingredients": [
    {
      "id": "shiitake",
      "qty": {
        "n": 350,
        "unit": "g",
        "rest": "de shiitake fresco limpio, en mitades o láminas gruesas"
      }
    },
    {
      "id": "coco",
      "qty": {
        "n": 400,
        "unit": "ml",
        "rest": "de leche de coco culinaria sin azúcar añadida"
      }
    },
    {
      "id": "caldo",
      "qty": {
        "n": 150,
        "unit": "ml",
        "rest": "de caldo vegetal"
      }
    },
    {
      "id": "cebolla",
      "qty": {
        "n": 1,
        "one": "cebolla morada pequeña picada",
        "many": "cebollas moradas pequeñas picadas"
      }
    },
    {
      "id": "cebolla-larga",
      "qty": {
        "n": 1,
        "one": "rama de cebolla larga picada",
        "many": "ramas de cebolla larga picadas"
      }
    },
    {
      "id": "tomate",
      "qty": {
        "n": 2,
        "one": "tomate chonto picado",
        "many": "tomates chontos picados"
      }
    },
    {
      "id": "ajo",
      "qty": {
        "n": 2,
        "one": "diente de ajo picado",
        "many": "dientes de ajo picados"
      }
    },
    {
      "id": "jengibre",
      "qty": {
        "n": 8,
        "unit": "g",
        "rest": "de jengibre fresco rallado"
      }
    },
    {
      "id": "curcuma",
      "qty": {
        "n": 0.25,
        "one": "cucharadita de cúrcuma molida",
        "many": "cucharaditas de cúrcuma molida"
      }
    },
    {
      "id": "aceite",
      "qty": {
        "n": 2,
        "one": "cucharada de aceite vegetal",
        "many": "cucharadas de aceite vegetal"
      }
    },
    {
      "id": "limon",
      "qty": {
        "n": 1,
        "one": "cucharada de jugo de limón, al gusto",
        "many": "cucharadas de jugo de limón, al gusto"
      }
    },
    {
      "id": "final",
      "text": "Cilantro, sal y pimienta al gusto; arroz cocido para acompañar, opcional"
    }
  ]
},
  "receta-sudado": {
  "name": "el sudado de shiitake con papa",
  "title": "Sudado de shiitake con papa",
  "grams": 500,
  "yield": [
    {
      "n": 4
    },
    " personas"
  ],
  "ingredients": [
    {
      "id": "shiitake",
      "qty": {
        "n": 500,
        "unit": "g",
        "rest": "de shiitake fresco limpio, en mitades o cuartos"
      }
    },
    {
      "id": "papa",
      "qty": {
        "n": 4,
        "one": "papa pastusa mediana pelada y en trozos",
        "many": "papas pastusas medianas peladas y en trozos"
      }
    },
    {
      "id": "cebolla",
      "qty": {
        "n": 1,
        "one": "cebolla pequeña picada",
        "many": "cebollas pequeñas picadas"
      }
    },
    {
      "id": "cebolla-larga",
      "qty": {
        "n": 2,
        "one": "rama de cebolla larga picada",
        "many": "ramas de cebolla larga picadas"
      }
    },
    {
      "id": "tomate",
      "qty": {
        "n": 3,
        "one": "tomate maduro picado",
        "many": "tomates maduros picados"
      }
    },
    {
      "id": "pimenton",
      "qty": {
        "n": 1,
        "one": "pimentón rojo pequeño picado",
        "many": "pimentones rojos pequeños picados"
      }
    },
    {
      "id": "ajo",
      "qty": {
        "n": 2,
        "one": "diente de ajo picado",
        "many": "dientes de ajo picados"
      }
    },
    {
      "id": "comino",
      "qty": {
        "n": 0.5,
        "one": "cucharadita de comino molido",
        "many": "cucharaditas de comino molido"
      }
    },
    {
      "id": "caldo",
      "qty": {
        "n": 500,
        "unit": "ml",
        "rest": "de caldo vegetal, y más si hace falta"
      }
    },
    {
      "id": "mantequilla",
      "qty": {
        "n": 2,
        "one": "cucharada de mantequilla",
        "many": "cucharadas de mantequilla"
      }
    },
    {
      "id": "aceite",
      "qty": {
        "n": 1,
        "one": "cucharada de aceite vegetal",
        "many": "cucharadas de aceite vegetal"
      }
    },
    {
      "id": "hierbas",
      "text": "Laurel y tomillo al gusto; retirar el laurel antes de servir"
    },
    {
      "id": "final",
      "text": "Cilantro, sal y pimienta al gusto; arroz y aguacate para acompañar, opcionales"
    }
  ]
},
  "receta-maduro": {
  "name": "el shiitake al hogao con maduro y queso",
  "title": "Shiitake con maduro y queso",
  "grams": 250,
  "yield": [
    {
      "n": 4
    },
    " personas"
  ],
  "ingredients": [
    {
      "id": "shiitake",
      "qty": {
        "n": 250,
        "unit": "g",
        "rest": "de shiitake fresco limpio, en láminas gruesas"
      }
    },
    {
      "id": "platanos",
      "qty": {
        "n": 4,
        "one": "plátano muy maduro",
        "many": "plátanos muy maduros"
      }
    },
    {
      "id": "queso",
      "qty": {
        "n": 200,
        "unit": "g",
        "rest": "de queso campesino o mozzarella"
      }
    },
    {
      "id": "mantequilla",
      "qty": {
        "n": 2,
        "one": "cucharada de mantequilla, dividida entre el plátano y el guiso",
        "many": "cucharadas de mantequilla, dividida entre el plátano y el guiso"
      }
    },
    {
      "id": "cebolla",
      "qty": {
        "n": 1,
        "one": "cebolla pequeña picada",
        "many": "cebollas pequeñas picadas"
      }
    },
    {
      "id": "ajo",
      "qty": {
        "n": 2,
        "one": "diente de ajo picado",
        "many": "dientes de ajo picados"
      }
    },
    {
      "id": "tomate",
      "qty": {
        "n": 2,
        "one": "tomate chonto picado",
        "many": "tomates chontos picados"
      }
    },
    {
      "id": "jengibre",
      "qty": {
        "n": 1,
        "one": "cucharadita de jengibre fresco rallado",
        "many": "cucharaditas de jengibre fresco rallado"
      }
    },
    {
      "id": "panela",
      "qty": {
        "n": 2,
        "one": "cucharadita de panela rallada",
        "many": "cucharaditas de panela rallada"
      }
    },
    {
      "id": "soja",
      "qty": {
        "n": 15,
        "unit": "ml",
        "rest": "de salsa de soja"
      }
    },
    {
      "id": "caldo",
      "qty": {
        "n": 125,
        "unit": "ml",
        "rest": "de caldo vegetal"
      }
    },
    {
      "id": "final",
      "text": "Tomillo, jugo de limón y pimienta al gusto; sal solo si hace falta"
    }
  ]
}
};
const SCALES = [1, 2, 3];
const scaleLabels = { 1: 'Receta base', 2: 'Doble', 3: 'Triple' };
const formatQuantity = new Intl.NumberFormat('es-CO', { useGrouping: false, maximumFractionDigits: 3 });
const numeral = (n, max, k) => max ? `${formatQuantity.format(n * k)}–${formatQuantity.format(max * k)}` : formatQuantity.format(n * k);
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
