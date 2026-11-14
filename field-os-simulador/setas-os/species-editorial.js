(function () {
'use strict';
// Fichas editoriales por especie para la interfaz. Extraído de
// simulador-app.jsx sin cambios de contenido. No alimenta analyze(), scoring ni
// las bandas de sala: esos valores viven en substrate-catalog.js y
// room-cycle-targets.js.

const SPP_DIFFICULTY={p_ostreatus_gris:'Baja',p_ostreatus_blanco:'Baja',p_djamor_rosa:'Media',p_eryngii:'Alta',shiitake:'Alta',lions_mane:'Media',reishi:'Muy alta',enoki:'Alta',nameko:'Media'};
const SPP_DETAILS={
  p_ostreatus_gris:{hechos:[
    'Con paja de trigo a C:N 40, puede superar el 120% de eficiencia biológica — es decir, produce más peso fresco que el sustrato seco del que parte. Pocos organismos logran esto.',
    'Tolera hasta un 5% de contaminación visible en bloque sin colapsar la cosecha. Su agresividad colonizadora suprime hongos competidores mejor que cualquier otra orellana.',
    'Cada 5°C que bajes la temperatura de fructificación (dentro del rango), el sombrero se vuelve un 15–20% más oscuro y la textura más firme. La misma receta, sabor distinto.'
  ]},
  p_ostreatus_blanco:{hechos:[
    'Requiere exactamente el mismo rango C:N que la orellana gris, pero responde mucho más al exceso de nitrógeno: sobre C:N 25, las primordias abortan antes de abrirse. El margen de error es más estrecho.',
    'Su micelio coloniza paja sin pasteurizar más rápido que con pasteurización ácida — una curiosidad contraintuitiva. La flora nativa de la paja fresca no la suprime; la estimula.',
    'A 24°C de fructificación produce el mayor rendimiento pero el menor sabor. A 18°C produce 20% menos masa pero concentra compuestos aromáticos: vale la pena si vendes a cocineros.'
  ]},
  p_djamor_rosa:{hechos:[
    'Es la única orellana que fructifica bien a 28–30°C. Si en verano la sala no baja de 26°C, djamor rosa es la única opción viable — las demás cederán ante el calor.',
    'Su tasa de spawn óptima es inusualmente alta (18–22%). Bajar a 10% alarga la colonización 8–12 días y el riesgo de contaminación se multiplica por tres en climas cálidos.',
    'Pierde el color rosa en menos de 6 horas tras la cosecha a temperatura ambiente. Para mantenerlo, cosechar en primordia pequeña y refrigerar de inmediato. El simulador no puede optimizar esto — es post-cosecha pura.'
  ]},
  p_eryngii:{hechos:[
    'Es la única seta de este simulador que requiere una fase de inducción de frío obligatoria (4–10°C, 4–7 días) para primordializar. Sin ese choque térmico, el sustrato con receta perfecta no producirá nada.',
    'C:N óptimo para eryngii: 40–65:1 (ideal 50). Este rango alto significa que el sustrato debe tener más carbono que nitrógeno — sustratos ricos en N (salvado >15%) generan colonización sin fructificación. Dato corregido: el rango anterior 25–35 correspondía a P. ostreatus, no a eryngii.',
    'Su eficiencia biológica parece baja en papel (40–70%), pero el rendimiento económico por kg supera al shiitake: el pie carnoso pesa el triple que el sombrero de otras especies a igual tamaño.'
  ]},
  shiitake:{hechos:[
    'La relación C:N ideal (60–80) es la segunda más alta del catálogo. Añadir salvado de trigo más allá del 10% no mejora el rendimiento — lo destruye: exceso de nitrógeno genera bloque verde en 48 horas.',
    'El periodo de incubación en aserrín de roble puede ser de 60–90 días. Pero cada día extra de madurez post-colonización antes del choque se traduce en +3–5% de eficiencia biológica. La paciencia tiene retorno medible.',
    'Produce lentinan principalmente en el cuerpo fructifícola, no en el micelio. Las recetas de alto rendimiento rápido (substrato enriquecido, alta temperatura) producen más masa pero menos lentinan por gramo.'
  ]},
  lions_mane:{hechos:[
    'Extremadamente sensible al CO₂: concentraciones superiores a 1000 ppm durante la fructificación producen el elongamiento característico de espinas — bonito visualmente, pero indica estrés y reduce rendimiento un 20–30%.',
    'Es la especie más sensible al exceso de H₂O en sustrato. Con humedad superior al 68% en la mezcla, el micelio se ahoga antes de colonizar completamente. El rango óptimo de 60–65% es estrecho y no perdona.',
    'La primera cosecha puede superar el 30% de la masa del bloque — la más concentrada del catálogo. Pero la segunda cosecha cae al 10–15%. No es una especie para ciclos largos; optimiza para primera flush.'
  ]},
  reishi:{hechos:[
    'La única especie del catálogo que no se formula con salvado de trigo. El exceso de nitrógeno suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Más nitrógeno = más masa, menos principio activo.',
    'Produce el antílago (polvillo esporal) más denso de todas las especies cultivadas: hasta 20g de esporas por bloque. Ese polvo tiene más concentración de triterpenoides que el cuerpo fructifícola. Colectarlo es tan valioso como la cosecha.',
    'Con aserrín de roble sin enriquecer y temperatura constante de 26°C, el sombrero lacado tarda 45–60 días en completarse. Cada grado extra de temperatura acelera el crecimiento pero reduce la calidad del lacado superficial.'
  ]},
  enoki:{hechos:[
    'El enoki "largo y blanco" del supermercado es un artefacto de cultivo en oscuridad con CO₂ elevado. Con buena ventilación en la sala se obtienen sombreros marrones abiertos — igual de comestibles, radicalmente distintos visualmente.',
    'Fructifica óptimamente a 8–12°C — la temperatura más baja del catálogo. Esto lo hace complementario estacional perfecto: mientras otras especies no fructifican en invierno, enoki llega a su máximo rendimiento.',
    'La colonización es notablemente lenta (18–25 días a 20°C), pero el sustrato colonizado tolera refrigeración hasta 4 semanas sin perder capacidad. Permite preparar bloques en lote y activarlos según la demanda.'
  ]},
  nameko:{hechos:[
    'El mucílago que recubre su sombrero es un polisacárido que el propio hongo sintetiza como protección ante pérdida de agua. Paradoja: a mayor humedad relativa (>92%), produce más mucílago, no menos. Es una señal de bienestar, no de estrés.',
    'Requiere la mayor humedad relativa del catálogo durante fructificación (90–95%). Por debajo del 88%, las primordias se secan antes de crecer. Un higrometro preciso es equipamiento no-negociable para esta especie.',
    'Produce consistentemente dos cosechas de calidad similar — inusual. La mayoría de especies caen 30–50% en segunda cosecha. Nameko mantiene el 80–85% del primer rendimiento si el bloque se sumerge en agua fría 12 horas entre flush.'
  ]},
};

const SPECIES_GASTRONOMY = {
  p_ostreatus_gris: {
    title: 'Orellana Gris · Pleurotus ostreatus',
    botanical: 'Lámina I · Basidiomycota · Pleurotaceae',
    organoleptic: {
      aroma: 'Terroso suave, bosque andino tras la lluvia, sutil aroma a avellana fresca.',
      flavor: 'Umami equilibrado, dulce vegetal ligero con final almendrado.',
      texture: 'Carnosa, aterciopelada y elástica; gran retención de jugos en cocción.'
    },
    metrics: { umami: 4, meatiness: 5, aromatics: 3, sweetness: 2 },
    cooking: [
      { method: 'Salteado a fuego vivo', tip: 'En sartén de hierro con mantequilla clarificada y sal marina; no tapar para lograr bordes dorados crujientes.' },
      { method: 'Pasta fresca & Risottos', tip: 'Incorporar al final del salteado con salvia fresca y reducción de vino blanco.' }
    ],
    pairings: [
      { category: 'Vinos', item: 'Chardonnay con crianza en roble o Sauvignon Blanc de altura.' },
      { category: 'Quesos', item: 'Parmesano Reggiano, queso Paipa añejo o gruyère.' },
      { category: 'Hierbas', item: 'Salvia, tomillo limonero, ajo negro y estragón.' }
    ],
    presentation: 'Bandeja kraft de 250 g con papel sulfurizado o faja de madera artesanal.'
  },
  p_djamor_rosa: {
    title: 'Orellana Rosada · Pleurotus djamor',
    botanical: 'Lámina II · Basidiomycota · Pleurotaceae',
    organoleptic: {
      aroma: 'Fresco, ligeramente marino con notas florales y cítricas suaves.',
      flavor: 'Umami brillante, toque mineral que evoca mariscos tiernos (camarón/langostilla).',
      texture: 'Firme, crujiente en láminas finas; tierna y elástica al diente.'
    },
    metrics: { umami: 3, meatiness: 4, aromatics: 4, sweetness: 3 },
    cooking: [
      { method: 'Ceviches templados & Carpaccios', tip: 'Sellado relámpago de 90 segundos con aceite de oliva y jugo de mandarina o limón mandarino.' },
      { method: 'Tacos gourmet & Woks', tip: 'Cocción rápida con jengibre fresco, cebolla morada y cilantro cimarrón.' }
    ],
    pairings: [
      { category: 'Vinos', item: 'Vino rosado seco (Garnacha/Pinot Noir) o espumoso Brut.' },
      { category: 'Aromáticos', item: 'Cilantro cimarrón, ají dulce, ralladura de lima y jengibre.' },
      { category: 'Aceites', item: 'Aceite de oliva virgen extra monovarietal (Picual/Arbequina).' }
    ],
    presentation: 'Bandeja kraft de 250 g ventilada; consumo preferente dentro de los 4 días.'
  },
  shiitake: {
    title: 'Shiitake Roble · Lentinula edodes',
    botanical: 'Lámina III · Basidiomycota · Omphalotaceae',
    organoleptic: {
      aroma: 'Intenso, sotobosque húmedo, notas de humo noble y corteza de roble.',
      flavor: 'Máxima concentración de ácido glutámico natural y guanilato; umami profundo y persistente.',
      texture: 'Densa, coriácea en pie (ideal para caldos), sombrero suculento y esponjoso.'
    },
    metrics: { umami: 5, meatiness: 5, aromatics: 5, sweetness: 1 },
    cooking: [
      { method: 'Glaseado & Confitado', tip: 'Cocción lenta en salsa de soya artesanal, mirin y miel de Tenjo hasta reducir a textura laca.' },
      { method: 'Fondo Dashi & Reducciones', tip: 'Extracción en agua a 65 °C durante 45 minutos para maximizar liberación de ribonucleótidos.' }
    ],
    pairings: [
      { category: 'Vinos', item: 'Tintos de cuerpo medio: Pinot Noir, Nebbiolo o Carmenere.' },
      { category: 'Proteínas', item: 'Cortes de res madurada, magret de pato o cerdo confitado.' },
      { category: 'Caldos', item: 'Dashi, caldos concentrados de hueso y ramen de autor.' }
    ],
    presentation: 'Caja de madera noble con puente QR de trazabilidad de sustrato de roble.'
  },
  lions_mane: {
    title: 'Melena de León · Hericium erinaceus',
    botanical: 'Lámina IV · Basidiomycota · Hericiaceae',
    organoleptic: {
      aroma: 'Dulce, notas de mantequilla tibia, frutos secos y rocío matutino.',
      flavor: 'Extraordinaria semejanza gustativa con bogavante, langosta o carne de cangrejo real.',
      texture: 'Mullida, tierna, filamentosa que se deshace delicadamente en boca.'
    },
    metrics: { umami: 4, meatiness: 4, aromatics: 4, sweetness: 4 },
    cooking: [
      { method: 'Medallones a la plancha', tip: 'Cortar en filetes gruesos de 2 cm, prensar suavemente para dorar en mantequilla marrón y ajo confitado.' },
      { method: 'Rolls & Guisos marineros', tip: 'Deshilachar a mano en hebras e incorporar en brioche tostado con mayonesa de estragón.' }
    ],
    pairings: [
      { category: 'Vinos', item: 'Chardonnay fermentado en barrica, Viognier o Champagne Brut Nature.' },
      { category: 'Salsas', item: 'Holandesa, bearnesa, mantequilla café de París.' },
      { category: 'Botánicos', item: 'Flor de sal marina, eneldo fresco y pimienta rosa.' }
    ],
    presentation: 'Caja protectora de madera con lecho de viruta de roble orgánico.'
  },
  reishi: {
    title: 'Reishi Rojo · Ganoderma lucidum',
    botanical: 'Lámina V · Basidiomycota · Ganodermataceae',
    organoleptic: {
      aroma: 'Amaderado noble, resina de pino, cuero curtido y tierra profunda.',
      flavor: 'Amargor tónico medicinal elegante con regusto terroso complejo.',
      texture: 'Leñosa no masticable; destinada exclusivamente a extracción hidroalcohólica o decocción.'
    },
    metrics: { umami: 2, meatiness: 1, aromatics: 5, sweetness: 0 },
    cooking: [
      { method: 'Doble extracción tónica', tip: 'Decocción acuosa de 2 horas seguida de maceración en alcohol neutro de caña al 70%.' },
      { method: 'Caldos adaptogénicos', tip: 'Infusionar 5 g de láminas secas en caldos de cocción larga con jengibre y cardamomo.' }
    ],
    pairings: [
      { category: 'Bebidas', item: 'Café de especialidad de altura, té negro fermentado (Pu-erh) o mezcal artesanal.' },
      { category: 'Chocolates', item: 'Cacao colombiano al 75% o 85% de origen Tumaco o Arauca.' },
      { category: 'Mieles', item: 'Miel cruda de bosque andino y polen de páramo.' }
    ],
    presentation: 'Frasco boticario ámbar de 50 ml con gotero o láminas selladas al vacío.'
  }
};

// ── GUÍA DE FORMULACIÓN — criterios de selección de ingredientes por especie ──
const SPP_SUBSTRATE_GUIDE={
  p_ostreatus_gris:[
    'Base Cóptima: paja de trigo o cebada (C:N 75–85) al 55–70%. Evitar aserín sin compostar — su lignina es inaccesible para esta especie y solo encarece sin aportar.',
    'Suplemento N: salvado de trigo 15–25% más borra de café 7–12%. Esta combinación baja costo y aporta N progresivo; conviene combinarlos en lugar de usar solo uno de los dos.',
    'Ajuste de pH obligatorio: carbonato de calcio 2–5% + yeso 2–3%. Sin tamponamiento, la fermentación acidifica el bloque y colapsa la cosecha 2 y 3.',
    'Evitar superar 25% total de suplementos N (salvado + borra + café juntos). Por encima de ese umbral el riesgo de Trichoderma se dispara, especialmente sin autoclave.',
  ],
  p_ostreatus_blanco:[
    'Base C: paja de trigo 50–60%. El blanco tolera menos variación de C:N que el gris — apunta siempre a 28–32 como objetivo final calculado.',
    'Suplemento N preferido: afrecho de cervecería 12–18%. Libera nitrógeno más lentamente que el salvado puro y reduce el riesgo de contaminación temprana.',
    'Salvado de trigo máximo 15%. Más allá de ese punto la primordiación falla en blanco aunque el micelio colonice bien — el N alto suprime la formación de sombrero.',
    'Borra de café: máximo 8–10%. Más acidifica el pH por debajo de 6.0, inhibiendo el desarrollo del sombrero blanco que distingue a esta variedad.',
  ],
  p_djamor_rosa:[
    'Base C tropical: bagazo de caña 40–55% + paja de arroz 20–30%. Estas bases tolera la humedad alta que requiere el djamor y son idóneas para clima cálido.',
    'Suplemento N moderado: salvado de trigo 10–15% o borra de café 10–15%. La especie no requiere N muy alto — C:N objetivo 35–45, no más bajo.',
    'Tasa de spawn alta (18–22%) es parte de la fórmula. No la intercambión por más suplemento — el spawn agresivo suprime contaminantes mejor que ningún ingrediente.',
    'Evitar aserín de madera y sustratos lígneos pesados: el djamor rosa es lignínolítico débil y no aprovechará esa fracción, generando sustrato sin colonizar.',
  ],
  p_eryngii:[
    'Base C: paja de trigo 35–45% + aserín de roble o álamo 10–18%. La combinación de paja y madera dura da la textura necesaria para el stípite carnoso del eryngii.',
    'Suplemento N: afrecho de cervecería 18–22% es el más eficiente. El salvado de trigo funciona pero eleva el riesgo de contaminación — si lo usas, no pases del 15%.',
    'Polvo de hueso 2–4% mejora el desarrollo del pie. El fósforo de liberación lenta favorece la formación del stípite sin subir el N total disponible.',
    'Cero gallinaza ni estiércol de alta carga N. El eryngii requiere C:N ≥40 — cualquier fuente de N muy alto baja la relación por debajo del mínimo y suprime la fructificación.',
  ],
  shiitake:[
    'Base C exclusiva: aserín de madera dura (roble, álamo) 55–70%. La lignina de madera dura es la fuente de carbono que el shiitake degrada con sus enzimas lacasas. Paja sola no funciona.',
    'Salvado de trigo: máximo 15–18%. Pasado ese punto el bloque verde (Trichoderma) aparece en 48 h incluso con autoclave. Prefiere cascarilla de soya 5–8% como suplemento complementario.',
    'Yeso agrícola 2–3% es no-negociable: estabiliza pH durante la esterilización y mejora la textura del bloque. Sin yeso, el pH puede subir a 8.5 y el micelio no germina.',
    'Periodo de colonización largo (60–90 d): no compenses acortando con más suplemento N. Más N = más contaminación, no más velocidad en shiitake.',
  ],
  lions_mane:[
    'Master Mix de referencia: aserín de madera dura 50–60% + cascarilla de soya 35–45%. Esta combinación logra EB 150–180%. No reemplazar cascarilla de soya por salvado de trigo en proporciones iguales — son distintos en densidad nutricional.',
    'Humedad del sustrato seco: apunta a 60–65%, más seco que otras especies. Ingredientes húmedos (borra fresca, pseudotallo de plátano) suben la actividad acuosa y favorecen contaminación.',
    'Evitar absolutamente aserín de eucalipto. Sus aceites esenciales inhiben el micelio de Hericium de forma directa e irreversible. Usar solo maderas duras neutras: roble, álamo, sauce.',
    'Afrecho de cervecería 10–15% es un buen suplemento secundario. La cascarilla de soya ya aporta N suficiente — el afrecho suma perfil de aminoácidos sin saturar nitrógeno.',
  ],
  reishi:[
    'No usar salvado de trigo como suplemento principal. El exceso de N libre suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Máximo 8–10% de suplemento N total.',
    'Base C: aserín de roble 55–65% + corteza de árbol molida 10–15%. La corteza aporta lignina compleja que ralentiza la colonización y estimula la producción de lacasa, necesaria para el lacado del sombrero.',
    'Cascarilla de soya 8–12% es el suplemento N preferido: nitrógeno de liberación lenta que no dispara contaminación ni suprime la ruta de triterpenoides.',
    'Evitar ingredientes cálidos o de rápida descomposición (borra de café fresca, pulpa de cacao). El reishi requiere sustrato estático y de baja actividad microbiana durante los 60–90 días de colonización.',
  ],
  enoki:[
    'Base C: paja de arroz 30–40% + aserín de álamo o sauce 15–20%. La paja de arroz da la textura ligera que necesita el enoki para colonizar a baja temperatura (5–12°C).',
    'Suplemento N estrella: afrecho de cervecería 18–25%. Su perfil de aminoácidos estimula el desarrollo de los cuerpos fructíferos alargados que caracterizan al enoki comercial.',
    'Evitar cartones y papel como base principal: el enoki necesita sustrato estructuralmente firme para colonizar correctamente en frío. La celulosa pura colapsa y ahoga el micelio.',
    'C:N objetivo muy preciso: 25–30. Cada punto por encima de 30 alarga la colonización (ya de por sí 18–25 días), elevando el riesgo de contaminación en cámara fría.',
  ],
  nameko:[
    'Base C: aserín de roble 40–50% + paja de arroz 15–25%. El nameko degrada lignocelulosa más lento que el shiitake — la combinación de madera y paja le da fibras accesibles para arrancar.',
    'Borra de café 5–8% en la mezcla mejora rendimiento en primera cosecha y reduce el tiempo de colonización. Más del 10% puede inhibir la segunda cosecha — que en nameko es excepcionalmente buena.',
    'Suplemento N bajo: afrecho de cervecería 10–15% como máximo. La tasa de N ideal es 0.8–1.5% — evita gallinaza, harina de soya o cualquier fuente de N muy alto.',
    'Yeso 2–3% + carbonato de calcio 2–3% son obligatorios. El nameko necesita pH 5.5–6.5 estable y el yeso mejora la textura del bloque para las dos cosechas de calidad similar.',
  ],
};

const SPP_FAMILY={p_ostreatus_gris:'Pleurotaceae',p_ostreatus_blanco:'Pleurotaceae',p_djamor_rosa:'Pleurotaceae',p_eryngii:'Pleurotaceae',shiitake:'Omphalotaceae',lions_mane:'Hericiaceae',reishi:'Polyporaceae',enoki:'Physalacriaceae',nameko:'Strophariaceae'};
const SPP_HR={p_ostreatus_gris:'88–95%',p_ostreatus_blanco:'88–95%',p_djamor_rosa:'85–95%',p_eryngii:'85–95%',shiitake:'80–95%',lions_mane:'85–95%',reishi:'85–95%',enoki:'80–90%',nameko:'85–95%'};
const SPP_CODE={p_ostreatus_gris:'SDP-001',p_ostreatus_blanco:'SDP-002',p_djamor_rosa:'SDP-003',p_eryngii:'SDP-004',shiitake:'SDP-005',lions_mane:'SDP-006',reishi:'SDP-007',enoki:'SDP-008',nameko:'SDP-009'};

const api = { SPP_DIFFICULTY, SPP_DETAILS, SPECIES_GASTRONOMY, SPP_SUBSTRATE_GUIDE, SPP_FAMILY, SPP_HR, SPP_CODE };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasSpeciesEditorial = api;

})();
