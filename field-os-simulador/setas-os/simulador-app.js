// AUTO-GENERATED from simulador-app.jsx by build.js — do not edit directly.
// Run `node build.js` after changing simulador-app.jsx and commit this file.
// source-hash: 6925e666995641c1d54872d68804592a3c3e71d7770bae95628d4d5c50c176a4
const { useState, useMemo, useEffect, useRef } = React;
const IMG = {
  p_ostreatus_gris: window.__resources && window.__resources.img_p_ostreatus_gris || "_standalone_imgs/grey-mushroom.png",
  p_ostreatus_blanco: window.__resources && window.__resources.img_p_ostreatus_blanco || "_standalone_imgs/orellana-blanca.png",
  p_djamor_rosa: window.__resources && window.__resources.img_p_djamor_rosa || "_standalone_imgs/orellana-rosa.png",
  p_eryngii: window.__resources && window.__resources.img_p_eryngii || "_standalone_imgs/cardo.png",
  shiitake: window.__resources && window.__resources.img_shiitake || "_standalone_imgs/shiitake.png",
  lions_mane: window.__resources && window.__resources.img_lions_mane || "_standalone_imgs/lions-mane.png",
  reishi: window.__resources && window.__resources.img_reishi || "_standalone_imgs/reishi.png",
  enoki: window.__resources && window.__resources.img_enoki || "_standalone_imgs/enoki.png",
  nameko: window.__resources && window.__resources.img_nameko || "_standalone_imgs/nameko.png"
};
const SPP_DIFFICULTY = { p_ostreatus_gris: "Baja", p_ostreatus_blanco: "Baja", p_djamor_rosa: "Media", p_eryngii: "Alta", shiitake: "Alta", lions_mane: "Media", reishi: "Muy alta", enoki: "Alta", nameko: "Media" };
const SPP_DETAILS = {
  p_ostreatus_gris: { hechos: [
    "Con paja de trigo a C:N 40, puede superar el 120% de eficiencia biológica — es decir, produce más peso fresco que el sustrato seco del que parte. Pocos organismos logran esto.",
    "Tolera hasta un 5% de contaminación visible en bloque sin colapsar la cosecha. Su agresividad colonizadora suprime hongos competidores mejor que cualquier otra orellana.",
    "Cada 5°C que bajes la temperatura de fructificación (dentro del rango), el sombrero se vuelve un 15–20% más oscuro y la textura más firme. La misma receta, sabor distinto."
  ] },
  p_ostreatus_blanco: { hechos: [
    "Requiere exactamente el mismo rango C:N que la orellana gris, pero responde mucho más al exceso de nitrógeno: sobre C:N 25, las primordias abortan antes de abrirse. El margen de error es más estrecho.",
    "Su micelio coloniza paja sin pasteurizar más rápido que con pasteurización ácida — una curiosidad contraintuitiva. La flora nativa de la paja fresca no la suprime; la estimula.",
    "A 24°C de fructificación produce el mayor rendimiento pero el menor sabor. A 18°C produce 20% menos masa pero concentra compuestos aromáticos: vale la pena si vendes a cocineros."
  ] },
  p_djamor_rosa: { hechos: [
    "Es la única orellana que fructifica bien a 28–30°C. Si en verano tu cuarto no baja de 26°C, djamor rosa es literalmente la única opción viable — las demás cederán ante el calor.",
    "Su tasa de spawn óptima es inusualmente alta (18–22%). Bajar a 10% alarga la colonización 8–12 días y el riesgo de contaminación se multiplica por tres en climas cálidos.",
    "Pierde el color rosa en menos de 6 horas tras la cosecha a temperatura ambiente. Para mantenerlo, cosecha en primordia pequeña y refrigera de inmediato. El simulador no puede optimizar esto — es post-cosecha pura."
  ] },
  p_eryngii: { hechos: [
    "Es la única seta de este simulador que requiere una fase de inducción de frío obligatoria (4–10°C, 4–7 días) para primordializar. Sin ese choque térmico, el sustrato con receta perfecta no producirá nada.",
    "C:N óptimo para eryngii: 40–65:1 (ideal 50). Este rango alto significa que el sustrato debe tener más carbono que nitrógeno — sustratos ricos en N (salvado >15%) generan colonización sin fructificación. Dato corregido: el rango anterior 25–35 correspondía a P. ostreatus, no a eryngii.",
    "Su eficiencia biológica parece baja en papel (40–70%), pero el rendimiento económico por kg supera al shiitake: el pie carnoso pesa el triple que el sombrero de otras especies a igual tamaño."
  ] },
  shiitake: { hechos: [
    "La relación C:N ideal (60–80) es la segunda más alta del catálogo. Añadir salvado de trigo más allá del 10% no mejora el rendimiento — lo destruye: exceso de nitrógeno genera bloque verde en 48 horas.",
    "El periodo de incubación en aserrín de roble puede ser de 60–90 días. Pero cada día extra de madurez post-colonización antes del choque se traduce en +3–5% de eficiencia biológica. La paciencia tiene retorno medible.",
    "Produce lentinan principalmente en el cuerpo fructifícola, no en el micelio. Las recetas de alto rendimiento rápido (substrato enriquecido, alta temperatura) producen más masa pero menos lentinan por gramo."
  ] },
  lions_mane: { hechos: [
    "Extremadamente sensible al CO₂: concentraciones superiores a 1000 ppm durante la fructificación producen el elongamiento característico de espinas — bonito visualmente, pero indica estrés y reduce rendimiento un 20–30%.",
    "Es la especie más sensible al exceso de H₂O en sustrato. Con humedad superior al 68% en la mezcla, el micelio se ahoga antes de colonizar completamente. El rango óptimo de 60–65% es estrecho y no perdona.",
    "La primera cosecha puede superar el 30% de la masa del bloque — la más concentrada del catálogo. Pero la segunda cosecha cae al 10–15%. No es una especie para ciclos largos; optimiza para primera flush."
  ] },
  reishi: { hechos: [
    "La única especie del catálogo que no debes formular con salvado de trigo. El exceso de nitrógeno suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Más nitrógeno = más masa, menos principio activo.",
    "Produce el antílago (polvillo esporal) más denso de todas las especies cultivadas: hasta 20g de esporas por bloque. Ese polvo tiene más concentración de triterpenoides que el cuerpo fructifícola. Colectarlo es tan valioso como la cosecha.",
    "Con aserrín de roble sin enriquecer y temperatura constante de 26°C, el sombrero lacado tarda 45–60 días en completarse. Cada grado extra de temperatura acelera el crecimiento pero reduce la calidad del lacado superficial."
  ] },
  enoki: { hechos: [
    'El enoki "largo y blanco" del supermercado es un artefacto de cultivo en oscuridad con CO₂ elevado. Si ventiles bien tu cuarto, obtendrás sombreros marrones abiertos — igual de comestibles, radicalmente distintos visualmente.',
    "Fructifica óptimamente a 8–12°C — la temperatura más baja del catálogo. Esto lo hace complementario estacional perfecto: mientras otras especies no fructifican en invierno, enoki llega a su máximo rendimiento.",
    "La colonización es notablemente lenta (18–25 días a 20°C), pero el sustrato colonizado tolera refrigeración hasta 4 semanas sin perder capacidad. Puedes preparar bloques en lote y activarlos cuando necesites."
  ] },
  nameko: { hechos: [
    "El mucílago que recubre su sombrero es un polisacárido que el propio hongo sintetiza como protección ante pérdida de agua. Paradoja: a mayor humedad relativa (>92%), produce más mucílago, no menos. Es una señal de bienestar, no de estrés.",
    "Requiere la mayor humedad relativa del catálogo durante fructificación (90–95%). Por debajo del 88%, las primordias se secan antes de crecer. Un higrometro preciso es equipamiento no-negociable para esta especie.",
    "Produce consistentemente dos cosechas de calidad similar — inusual. La mayoría de especies caen 30–50% en segunda cosecha. Nameko mantiene el 80–85% del primer rendimiento si el bloque se sumerge en agua fría 12 horas entre flush."
  ] }
};
const SPECIES_GASTRONOMY = {
  p_ostreatus_gris: {
    title: "Orellana Gris · Pleurotus ostreatus",
    botanical: "Lámina I · Basidiomycota · Pleurotaceae",
    organoleptic: {
      aroma: "Terroso suave, bosque andino tras la lluvia, sutil aroma a avellana fresca.",
      flavor: "Umami equilibrado, dulce vegetal ligero con final almendrado.",
      texture: "Carnosa, aterciopelada y elástica; gran retención de jugos en cocción."
    },
    metrics: { umami: 4, meatiness: 5, aromatics: 3, sweetness: 2 },
    cooking: [
      { method: "Salteado a fuego vivo", tip: "En sartén de hierro con mantequilla clarificada y sal marina; no tapar para lograr bordes dorados crujientes." },
      { method: "Pasta fresca & Risottos", tip: "Incorporar al final del salteado con salvia fresca y reducción de vino blanco." }
    ],
    pairings: [
      { category: "Vinos", item: "Chardonnay con crianza en roble o Sauvignon Blanc de altura." },
      { category: "Quesos", item: "Parmesano Reggiano, queso Paipa añejo o gruyère." },
      { category: "Hierbas", item: "Salvia, tomillo limonero, ajo negro y estragón." }
    ],
    presentation: "Bandeja kraft de 250 g con papel sulfurizado o faja de madera artesanal."
  },
  p_djamor: {
    title: "Orellana Rosada · Pleurotus djamor",
    botanical: "Lámina II · Basidiomycota · Pleurotaceae",
    organoleptic: {
      aroma: "Fresco, ligeramente marino con notas florales y cítricas suaves.",
      flavor: "Umami brillante, toque mineral que evoca mariscos tiernos (camarón/langostilla).",
      texture: "Firme, crujiente en láminas finas; tierna y elástica al diente."
    },
    metrics: { umami: 3, meatiness: 4, aromatics: 4, sweetness: 3 },
    cooking: [
      { method: "Ceviches templados & Carpaccios", tip: "Sellado relámpago de 90 segundos con aceite de oliva y jugo de mandarina o limón mandarino." },
      { method: "Tacos gourmet & Woks", tip: "Cocción rápida con jengibre fresco, cebolla morada y cilantro cimarrón." }
    ],
    pairings: [
      { category: "Vinos", item: "Vino rosado seco (Garnacha/Pinot Noir) o espumoso Brut." },
      { category: "Aromáticos", item: "Cilantro cimarrón, ají dulce, ralladura de lima y jengibre." },
      { category: "Aceites", item: "Aceite de oliva virgen extra monovarietal (Picual/Arbequina)." }
    ],
    presentation: "Bandeja kraft de 250 g ventilada; consumo preferente dentro de los 4 días."
  },
  shiitake: {
    title: "Shiitake Roble · Lentinula edodes",
    botanical: "Lámina III · Basidiomycota · Omphalotaceae",
    organoleptic: {
      aroma: "Intenso, sotobosque húmedo, notas de humo noble y corteza de roble.",
      flavor: "Máxima concentración de ácido glutámico natural y guanilato; umami profundo y persistente.",
      texture: "Densa, coriácea en pie (ideal para caldos), sombrero suculento y esponjoso."
    },
    metrics: { umami: 5, meatiness: 5, aromatics: 5, sweetness: 1 },
    cooking: [
      { method: "Glaseado & Confitado", tip: "Cocción lenta en salsa de soya artesanal, mirin y miel de Tenjo hasta reducir a textura laca." },
      { method: "Fondo Dashi & Reducciones", tip: "Extracción en agua a 65 °C durante 45 minutos para maximizar liberación de ribonucleótidos." }
    ],
    pairings: [
      { category: "Vinos", item: "Tintos de cuerpo medio: Pinot Noir, Nebbiolo o Carmenere." },
      { category: "Proteínas", item: "Cortes de res madurada, magret de pato o cerdo confitado." },
      { category: "Caldos", item: "Dashi, caldos concentrados de hueso y ramen de autor." }
    ],
    presentation: "Caja de madera noble con puente QR de trazabilidad de sustrato de roble."
  },
  lions_mane: {
    title: "Melena de León · Hericium erinaceus",
    botanical: "Lámina IV · Basidiomycota · Hericiaceae",
    organoleptic: {
      aroma: "Dulce, notas de mantequilla tibia, frutos secos y rocío matutino.",
      flavor: "Extraordinaria semejanza gustativa con bogavante, langosta o carne de cangrejo real.",
      texture: "Mullida, tierna, filamentosa que se deshace delicadamente en boca."
    },
    metrics: { umami: 4, meatiness: 4, aromatics: 4, sweetness: 4 },
    cooking: [
      { method: "Medallones a la plancha", tip: "Cortar en filetes gruesos de 2 cm, prensar suavemente para dorar en mantequilla marrón y ajo confitado." },
      { method: "Rolls & Guisos marineros", tip: "Deshilachar a mano en hebras e incorporar en brioche tostado con mayonesa de estragón." }
    ],
    pairings: [
      { category: "Vinos", item: "Chardonnay fermentado en barrica, Viognier o Champagne Brut Nature." },
      { category: "Salsas", item: "Holandesa, bearnesa, mantequilla café de París." },
      { category: "Botánicos", item: "Flor de sal marina, eneldo fresco y pimienta rosa." }
    ],
    presentation: "Caja protectora de madera con lecho de viruta de roble orgánico."
  },
  reishi: {
    title: "Reishi Rojo · Ganoderma lucidum",
    botanical: "Lámina V · Basidiomycota · Ganodermataceae",
    organoleptic: {
      aroma: "Amaderado noble, resina de pino, cuero curtido y tierra profunda.",
      flavor: "Amargor tónico medicinal elegante con regusto terroso complejo.",
      texture: "Leñosa no masticable; destinada exclusivamente a extracción hidroalcohólica o decocción."
    },
    metrics: { umami: 2, meatiness: 1, aromatics: 5, sweetness: 0 },
    cooking: [
      { method: "Doble extracción tónica", tip: "Decocción acuosa de 2 horas seguida de maceración en alcohol neutro de caña al 70%." },
      { method: "Caldos adaptogénicos", tip: "Infusionar 5 g de láminas secas en caldos de cocción larga con jengibre y cardamomo." }
    ],
    pairings: [
      { category: "Bebidas", item: "Café de especialidad de altura, té negro fermentado (Pu-erh) o mezcal artesanal." },
      { category: "Chocolates", item: "Cacao colombiano al 75% o 85% de origen Tumaco o Arauca." },
      { category: "Mieles", item: "Miel cruda de bosque andino y polen de páramo." }
    ],
    presentation: "Frasco boticario ámbar de 50 ml con gotero o láminas selladas al vacío."
  }
};
const SPP_SUBSTRATE_GUIDE = {
  p_ostreatus_gris: [
    "Base Cóptima: paja de trigo o cebada (C:N 75–85) al 55–70%. Evita aserín sin compostar — su lignina es inaccesible para esta especie y solo encarece sin aportar.",
    "Suplemento N: salvado de trigo 15–25% más borra de café 7–12%. Esta combinación baja costo y aporta N progresivo; no uses solo uno de los dos si puedes combinarlos.",
    "Ajuste de pH obligatorio: carbonato de calcio 2–5% + yeso 2–3%. Sin tamponamiento, la fermentación acidifica el bloque y colapsa la cosecha 2 y 3.",
    "Evita superar 25% total de suplementos N (salvado + borra + café juntos). Por encima de ese umbral el riesgo de Trichoderma se dispara, especialmente sin autoclave."
  ],
  p_ostreatus_blanco: [
    "Base C: paja de trigo 50–60%. El blanco tolera menos variación de C:N que el gris — apunta siempre a 28–32 como objetivo final calculado.",
    "Suplemento N preferido: afrecho de cervecería 12–18%. Libera nitrógeno más lentamente que el salvado puro y reduce el riesgo de contaminación temprana.",
    "Salvado de trigo máximo 15%. Más allá de ese punto la primordiación falla en blanco aunque el micelio colonice bien — el N alto suprime la formación de sombrero.",
    "Borra de café: máximo 8–10%. Más acidifica el pH por debajo de 6.0, inhibiendo el desarrollo del sombrero blanco que distingue a esta variedad."
  ],
  p_djamor_rosa: [
    "Base C tropical: bagazo de caña 40–55% + paja de arroz 20–30%. Estas bases tolera la humedad alta que requiere el djamor y son idóneas para clima cálido.",
    "Suplemento N moderado: salvado de trigo 10–15% o borra de café 10–15%. La especie no requiere N muy alto — C:N objetivo 35–45, no más bajo.",
    "Tasa de spawn alta (18–22%) es parte de la fórmula. No la intercambión por más suplemento — el spawn agresivo suprime contaminantes mejor que ningún ingrediente.",
    "Evita aserín de madera y sustratos lígneos pesados: el djamor rosa es lignínolítico débil y no aprovechará esa fracción, generando sustrato sin colonizar."
  ],
  p_eryngii: [
    "Base C: paja de trigo 35–45% + aserín de roble o álamo 10–18%. La combinación de paja y madera dura da la textura necesaria para el stípite carnoso del eryngii.",
    "Suplemento N: afrecho de cervecería 18–22% es el más eficiente. El salvado de trigo funciona pero eleva el riesgo de contaminación — si lo usas, no pases del 15%.",
    "Polvo de hueso 2–4% mejora el desarrollo del pie. El fósforo de liberación lenta favorece la formación del stípite sin subir el N total disponible.",
    "Cero gallinaza ni estiércol de alta carga N. El eryngii requiere C:N ≥40 — cualquier fuente de N muy alto baja la relación por debajo del mínimo y suprime la fructificación."
  ],
  shiitake: [
    "Base C exclusiva: aserín de madera dura (roble, álamo) 55–70%. La lignina de madera dura es la fuente de carbono que el shiitake degrada con sus enzimas lacasas. Paja sola no funciona.",
    "Salvado de trigo: máximo 15–18%. Pasado ese punto el bloque verde (Trichoderma) aparece en 48 h incluso con autoclave. Prefiere cascarilla de soya 5–8% como suplemento complementario.",
    "Yeso agrícola 2–3% es no-negociable: estabiliza pH durante la esterilización y mejora la textura del bloque. Sin yeso, el pH puede subir a 8.5 y el micelio no germina.",
    "Periodo de colonización largo (60–90 d): no compenses acortando con más suplemento N. Más N = más contaminación, no más velocidad en shiitake."
  ],
  lions_mane: [
    "Master Mix de referencia: aserín de madera dura 50–60% + cascarilla de soya 35–45%. Esta combinación logra EB 150–180%. No reemplaces cascarilla de soya por salvado de trigo en proporciones iguales — son distintos en densidad nutricional.",
    "Humedad del sustrato seco: apunta a 60–65%, más seco que otras especies. Ingredientes húmedos (borra fresca, pseudotallo de plátano) suben la actividad acuosa y favorecen contaminación.",
    "Evita absolutamente aserín de eucalipto. Sus aceites esenciales inhiben el micelio de Hericium de forma directa e irreversible. Usa solo maderas duras neutras: roble, álamo, sauce.",
    "Afrecho de cervecería 10–15% es un buen suplemento secundario. La cascarilla de soya ya aporta N suficiente — el afrecho suma perfil de aminoácidos sin saturar nitrógeno."
  ],
  reishi: [
    "No uses salvado de trigo como suplemento principal. El exceso de N libre suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Máximo 8–10% de suplemento N total.",
    "Base C: aserín de roble 55–65% + corteza de árbol molida 10–15%. La corteza aporta lignina compleja que ralentiza la colonización y estimula la producción de lacasa, necesaria para el lacado del sombrero.",
    "Cascarilla de soya 8–12% es el suplemento N preferido: nitrógeno de liberación lenta que no dispara contaminación ni suprime la ruta de triterpenoides.",
    "Evita ingredientes cálidos o de rápida descomposición (borra de café fresca, pulpa de cacao). El reishi requiere sustrato estático y de baja actividad microbiana durante los 60–90 días de colonización."
  ],
  enoki: [
    "Base C: paja de arroz 30–40% + aserín de álamo o sauce 15–20%. La paja de arroz da la textura ligera que necesita el enoki para colonizar a baja temperatura (5–12°C).",
    "Suplemento N estrella: afrecho de cervecería 18–25%. Su perfil de aminoácidos estimula el desarrollo de los cuerpos fructíferos alargados que caracterizan al enoki comercial.",
    "Evita cartones y papel como base principal: el enoki necesita sustrato estructuralmente firme para colonizar correctamente en frío. La celulosa pura colapsa y ahoga el micelio.",
    "C:N objetivo muy preciso: 25–30. Cada punto por encima de 30 alarga la colonización (ya de por sí 18–25 días), elevando el riesgo de contaminación en cámara fría."
  ],
  nameko: [
    "Base C: aserín de roble 40–50% + paja de arroz 15–25%. El nameko degrada lignocelulosa más lento que el shiitake — la combinación de madera y paja le da fibras accesibles para arrancar.",
    "Borra de café 5–8% en la mezcla mejora rendimiento en primera cosecha y reduce el tiempo de colonización. Más del 10% puede inhibir la segunda cosecha — que en nameko es excepcionalmente buena.",
    "Suplemento N bajo: afrecho de cervecería 10–15% como máximo. La tasa de N ideal es 0.8–1.5% — evita gallinaza, harina de soya o cualquier fuente de N muy alto.",
    "Yeso 2–3% + carbonato de calcio 2–3% son obligatorios. El nameko necesita pH 5.5–6.5 estable y el yeso mejora la textura del bloque para las dos cosechas de calidad similar."
  ]
};
const SPP_FAMILY = { p_ostreatus_gris: "Pleurotaceae", p_ostreatus_blanco: "Pleurotaceae", p_djamor_rosa: "Pleurotaceae", p_eryngii: "Pleurotaceae", shiitake: "Omphalotaceae", lions_mane: "Hericiaceae", reishi: "Polyporaceae", enoki: "Physalacriaceae", nameko: "Strophariaceae" };
const SPP_HR = { p_ostreatus_gris: "88–95%", p_ostreatus_blanco: "88–95%", p_djamor_rosa: "85–95%", p_eryngii: "85–95%", shiitake: "80–95%", lions_mane: "85–95%", reishi: "85–95%", enoki: "80–90%", nameko: "85–95%" };
const SPP_CODE = { p_ostreatus_gris: "SDP-001", p_ostreatus_blanco: "SDP-002", p_djamor_rosa: "SDP-003", p_eryngii: "SDP-004", shiitake: "SDP-005", lions_mane: "SDP-006", reishi: "SDP-007", enoki: "SDP-008", nameko: "SDP-009" };
const BANDS = { p_ostreatus_gris: "oklch(50% 0.12 25)", p_ostreatus_blanco: "oklch(55% 0.10 28)", p_djamor_rosa: "oklch(48% 0.13 20)", p_eryngii: "oklch(45% 0.09 265)", shiitake: "var(--accent-olive)", lions_mane: "oklch(52% 0.11 35)", reishi: "oklch(42% 0.10 10)", enoki: "oklch(43% 0.08 260)", nameko: "oklch(46% 0.09 95)" };
const SPP = {
  p_ostreatus_gris: { name: "Orellana Gris", scientific: "Pleurotus ostreatus", cn_optimal: { min: 25, max: 50, ideal: 35 }, n_optimal: { min: 0.8, max: 2, ideal: 1.4 }, ph_optimal: { min: 6, max: 7.5 }, moisture: { ideal: 65 }, eb_baseline: 90, eb_optimal: 130, supplementation_max: 20, spawn_rate: 8, notes: "La más fácil de cultivar. Tolera amplio rango de C:N. Ideal clima Sabana.", temp_fruit: "12–22°C" },
  p_ostreatus_blanco: { name: "Orellana Blanca", scientific: "Pleurotus florida", cn_optimal: { min: 25, max: 45, ideal: 30 }, n_optimal: { min: 1, max: 2, ideal: 1.5 }, ph_optimal: { min: 6, max: 7 }, moisture: { ideal: 65 }, eb_baseline: 80, eb_optimal: 120, supplementation_max: 18, spawn_rate: 8, notes: "Tallos blancos premium.", temp_fruit: "14–20°C" },
  p_djamor_rosa: { name: "Orellana Rosa", scientific: "Pleurotus djamor", cn_optimal: { min: 30, max: 50, ideal: 40 }, n_optimal: { min: 0.8, max: 1.8, ideal: 1.2 }, ph_optimal: { min: 5.5, max: 6.5 }, moisture: { ideal: 67 }, eb_baseline: 70, eb_optimal: 110, supplementation_max: 15, spawn_rate: 7, notes: "TERMÓFILA. Aborta primordios bajo 15°C.", temp_fruit: "20–28°C" },
  p_eryngii: { name: "Seta de Cardo", scientific: "Pleurotus eryngii", cn_optimal: { min: 40, max: 65, ideal: 50 }, n_optimal: { min: 0.8, max: 1.6, ideal: 1.2 }, ph_optimal: { min: 5.5, max: 7 }, moisture: { ideal: 63 }, eb_baseline: 60, eb_optimal: 90, supplementation_max: 25, spawn_rate: 5, notes: "PREMIUM. Requiere esterilización. C:N alto 40–65 (literatura Kim 2011). Precio 2–3× orellana.", temp_fruit: "12–18°C" },
  shiitake: { name: "Shiitake", scientific: "Lentinula edodes", cn_optimal: { min: 35, max: 70, ideal: 50 }, n_optimal: { min: 0.6, max: 1.2, ideal: 0.9 }, ph_optimal: { min: 5, max: 6 }, moisture: { ideal: 60 }, eb_baseline: 50, eb_optimal: 100, supplementation_max: 20, spawn_rate: 5, notes: "Ciclo largo 90–120 d. REQUIERE ESTERILIZACIÓN.", temp_fruit: "12–18°C" },
  lions_mane: { name: "Melena de León", scientific: "Hericium erinaceus", cn_optimal: { min: 25, max: 48, ideal: 33 }, n_optimal: { min: 1, max: 2, ideal: 1.5 }, ph_optimal: { min: 5, max: 6.5 }, moisture: { ideal: 65 }, eb_baseline: 50, eb_optimal: 160, supplementation_max: 25, spawn_rate: 5, notes: "MEDICINAL premium. Master Mix (madera dura + cascarilla de soya 50:50) = sustrato óptimo, EB 150–180%. Evitar eucalipto.", temp_fruit: "15–20°C" },
  reishi: { name: "Reishi", scientific: "Ganoderma lucidum", cn_optimal: { min: 35, max: 65, ideal: 50 }, n_optimal: { min: 0.7, max: 1.2, ideal: 0.9 }, ph_optimal: { min: 4.5, max: 6 }, moisture: { ideal: 60 }, eb_baseline: 30, eb_optimal: 60, supplementation_max: 15, spawn_rate: 5, notes: "MEDICINAL. Ciclo 4–6 meses.", temp_fruit: "20–26°C" },
  enoki: { name: "Enoki", scientific: "Flammulina velutipes", cn_optimal: { min: 25, max: 40, ideal: 27 }, n_optimal: { min: 1.2, max: 2.5, ideal: 1.8 }, ph_optimal: { min: 5, max: 7 }, moisture: { ideal: 65 }, eb_baseline: 60, eb_optimal: 90, supplementation_max: 30, spawn_rate: 10, notes: "CRIÓFILOS: 5–12°C. EB óptima 90% en cond. artesanales (120% requiere refrigeración activa <12°C). Ideal Tenjo en invierno.", temp_fruit: "5–12°C" },
  nameko: { name: "Nameko", scientific: "Pholiota nameko", cn_optimal: { min: 30, max: 50, ideal: 40 }, n_optimal: { min: 0.8, max: 1.5, ideal: 1.1 }, ph_optimal: { min: 5, max: 6.5 }, moisture: { ideal: 65 }, eb_baseline: 40, eb_optimal: 100, supplementation_max: 20, spawn_rate: 5, notes: "Gelatinoso, precio alto gourmet. EB hasta 100% en roble+salvado optimizado (Stamets 2000).", temp_fruit: "10–18°C" }
};
const INGS = [
  // cra=Capacidad Retención Agua 0-5 | ph=pH propio | dig=digestibilidad 1-10 (celulosa accesible/lignina)
  // === BASE CARBONO ===
  { id: "paja_trigo", name: "Paja de trigo", cat: "base", cn: 90, n: 0.5, c: 45, moisture: 12, cra: 4, ph: 6.5, dig: 7, role: "base_carbono", tags: ["Base", "Carbono"], cost: 2500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"], notes: "Comparte cn/n/c con paja_cebada — a diferencia de otros grupos de valores idénticos hallados en el peritaje, este caso es agronómicamente plausible: paja de trigo y de cebada son cereales de paja muy similares en composición. No se trató como placeholder sin verificar." },
  { id: "paja_cebada", name: "Paja de cebada", cat: "base", cn: 90, n: 0.5, c: 45, moisture: 12, cra: 4, ph: 6.5, dig: 7, role: "base_carbono", tags: ["Base", "Carbono"], cost: 2400, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"], notes: "Ver nota en paja_trigo — mismo cn/n/c, plausible por similitud agronómica entre ambos cereales de paja." },
  { id: "paja_avena", name: "Paja de avena", cat: "base", cn: 75, n: 0.6, c: 45, moisture: 12, cra: 4.5, ph: 6.5, dig: 8, role: "base_carbono", tags: ["Base", "Cereales"], cost: 2200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"] },
  { id: "paja_arroz", name: "Paja de arroz", cat: "base", cn: 65, n: 0.7, c: 46, moisture: 12, cra: 2.5, ph: 6.8, dig: 4, role: "base_carbono", tags: ["Base", "Cereales"], cost: 1800, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "nameko", "enoki"] },
  { id: "bagazo_caña", name: "Bagazo de caña fresco", cat: "base", cn: 60, n: 0.7, c: 42, moisture: 55, cra: 4, ph: 5.5, dig: 7, role: "base_carbono", tags: ["Base", "Local", "Fresco 50–60% H₂O"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "shiitake"], notes: "Compatibilidad con shiitake verificada en literatura: bagazo+salvado de trigo+aserrín en mezcla optimizada (Frontiers in Microbiology 2024, PMC11151849)." },
  { id: "aserrin_roble", name: "Aserrín de roble", cat: "base", cn: 500, n: 0.1, c: 50, moisture: 12, cra: 3, ph: 4.5, dig: 2, role: "base_carbono", tags: ["Base", "Madera dura"], cost: 2500, cs: ["shiitake", "lions_mane", "reishi", "nameko"] },
  { id: "aserrin_caucho", name: "Aserrín de caucho (Hevea brasiliensis)", cat: "base", cn: 65, n: 0.75, c: 49, moisture: 12, cra: 3, ph: 5.8, dig: 5, role: "base_carbono", tags: ["Base", "Madera", "No disponible en Tenjo — requiere transporte desde zonas cálidas (Meta/Caquetá)"], cost: 9e3, cs: ["lions_mane"], notes: "C:N=65.48 verificado en Nature Sci Rep 2023 (doi:10.1038/s41598-023-40601-y) — rinde mejor que aserrín de bambú (C:N=33.44) para Hericium erinaceus. %N y %C estimados a partir del C:N reportado (no medidos directamente en la fuente). El caucho no se cultiva en la Sabana de Bogotá (2600msnm, clima frío) — este insumo requeriría transporte desde plantaciones en clima cálido colombiano; costo estimado incluye ese transporte, sin cotización real de proveedor." },
  { id: "aserrin_eucalipto", name: "Aserrín de eucalipto", cat: "base", cn: 350, n: 0.15, c: 50, moisture: 12, cra: 3, ph: 5, dig: 3, role: "base_carbono", tags: ["Base", "Madera", "⚠Aceites: rinde menos que madera dura"], cost: 2e3, cs: ["p_ostreatus_gris", "shiitake"] },
  { id: "aserrin_pino", name: "Aserrín de pino fresco (requiere pretratamiento)", cat: "base", cn: 600, n: 0.08, c: 50, moisture: 12, cra: 2.5, ph: 4.5, dig: 1, role: "base_carbono", tags: ["NO usar fresco", "Terpenos inhibitorios", "Exige lavado/compostaje 3–4 m"], cost: 1500, cs: [], notes: "Terpenos y resinas abortan el micelio de Pleurotus/Hericium de inmediato. PROHIBIDO en fresco: requiere compostaje térmico prolongado (3–4 meses) o lavado químico parametrizado antes de cualquier uso. Para producción real usar la variante compostada." },
  { id: "aserrin_pino_compostado", name: "Aserrín pino compostado (3–4 m)", cat: "base", cn: 200, n: 0.2, c: 40, moisture: 15, cra: 3, ph: 5.5, dig: 4, role: "base_carbono", tags: ["Base", "Gratis"], cost: 2200, cs: ["p_ostreatus_gris", "shiitake", "lions_mane"] },
  { id: "aserrin_alamo", name: "Aserrín de álamo/sauce (Sabana)", cat: "base", cn: 200, n: 0.2, c: 45, moisture: 12, cra: 3.5, ph: 5.5, dig: 4, role: "base_carbono", tags: ["Base", "Madera", "Sabana", "Fácil conseguir"], cost: 1800, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "lions_mane", "shiitake", "reishi", "nameko", "enoki"] },
  { id: "cascarilla_arroz", name: "Cascarilla de arroz", cat: "base", cn: 80, n: 0.5, c: 40, moisture: 10, cra: 1.5, ph: 6.8, dig: 3, role: "aireador", tags: ["Aireador", "Local"], cost: 960, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"], notes: "Precio $960/kg — Lombricultura de Tenjo, bulto de 50 kg a $48.000 (ago. 2026). Corregido desde $4.000/kg (fuente no verificada).", provenance: { version: 1, sources: { tenjo_2026_08: { type: "supplier_quote", label: "Lombricultura de Tenjo — bulto 50kg", organization: "Lombricultura de Tenjo", location: "Tenjo, Cundinamarca", observedAt: "2026-08-01" } }, claims: [{ fields: ["cost"], sourceIds: ["tenjo_2026_08"], confidence: "high", method: "reported", verifiedAt: "2026-08-17" }] } },
  { id: "tamo_trigo", name: "Tamo de trigo", cat: "base", cn: 100, n: 0.4, c: 40, moisture: 10, cra: 2, ph: 6.8, dig: 5, role: "aireador", tags: ["Aireador", "Carbono"], cost: 1600, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "cascarilla_coco", name: "Fibra de coco", cat: "base", cn: 93, n: 0.5, c: 47, moisture: 13, cra: 3, ph: 6, dig: 3, role: "aireador", tags: ["Aireador", "Tropical"], cost: 9500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "lions_mane"], notes: "Ficha técnica del usuario: N 0.4–0.6%, C 45–48%, C:N 75–110:1, celulosa 20–30%, hemicelulosa 15–20%, lignina 40–50%, cenizas 2–6%, pH 5.5–6.5, CE 1.5–3.0 mS/cm (alto K⁺/Na⁺ residual — sin lavar), humedad 10–15%. dig bajado de 4→3 por la lignina alta (40–50%) frente a la turba de coco buferizada. Precio $9.500/kg — Lombricultura de Tenjo, presentación 4 kg a $38.000 (ago. 2026); corregido desde $8.500/kg." },
  { id: "turba_coco_buferizada", name: "Turba de coco buferizada", cat: "base", cn: 75, n: 0.6, c: 46, moisture: 11, cra: 4, ph: 6.5, dig: 4, role: "aireador", tags: ["Aireador", "Tropical", "Buferizada"], cost: 5e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "lions_mane"], notes: "Ficha técnica del usuario: N 0.5–0.7% (incremento leve por remanente de Ca(NO₃)₂), C 44–47%, C:N 65–85:1, celulosa 15–25%, hemicelulosa 10–18%, lignina 35–45%, cenizas 4–8% (intercambio catiónico Ca²⁺/Mg²⁺), pH 6.2–6.8, CE <0.5–0.8 mS/cm (sales lavadas y estabilizadas — mucho más baja que la fibra de coco sin procesar), humedad 10–12%. CRA más alta (4) que fibra de coco por el buferizado; dig levemente mejor (4) por su procesamiento. Precio $5.000/kg — BioEspacio (Bogotá), 1 kg (ago. 2026); otra presentación de 5 kg da $7.600/kg. Corregido desde $8.500/kg (que era una estimación por analogía, ya marcada como no confirmada)." },
  { id: "tusa_maiz", name: "Tuza de maíz (Tusa / Zuro)", cat: "base", cn: 70, n: 0.7, c: 45, moisture: 15, cra: 3, ph: 6.5, dig: 6, role: "base_carbono", tags: ["Base", "Local", "Tuza", "Tusa", "Zuro", "Maíz"], cost: 1500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"], notes: "Excelente sustrato base rico en hemicelulosa (C:N 70:1). Muy abundante en la Sabana de Bogotá y Cundinamarca." },
  { id: "rastrojo_maiz", name: "Rastrojo de maíz", cat: "base", cn: 60, n: 0.6, c: 45, moisture: 15, cra: 3.5, ph: 6.5, dig: 6, role: "base_carbono", tags: ["Base", "Local"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_eryngii", "nameko"], notes: "Compatibilidad con P. eryngii (sustituye aserrín/bagazo en 10.5–42%, Horticulturae 2023, doi:10.3390/horticulturae9030319) y con Pholiota microspora/nameko (mezclado con aserrín de álamo, PMC9060681) verificada en literatura revisada por pares." },
  { id: "kikuyo", name: "Kikuyo seco", cat: "base", cn: 25, n: 1.8, c: 45, moisture: 12, cra: 4, ph: 6.5, dig: 8, role: "base_carbono", tags: ["Local", "Sabana", "Valor sin diferenciar — ver peritaje"], cost: 1400, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: "C:N/%N/%C idénticos a paja de soya, estiércol equino y rastrojo de fríjol — 4 materiales botánica/agronómicamente distintos con la misma ficha, sospecha de placeholder copiado sin diferenciar. No se encontró cifra de reemplazo verificada; pendiente de análisis propio." },
  { id: "hojarasca", name: "Hojarasca de bosque", cat: "base", cn: 50, n: 0.9, c: 45, moisture: 20, cra: 3.5, ph: 5.8, dig: 5, role: "base_carbono", tags: ["Local"], cost: 200, notes: "Costo $200/kg por recolección y cernido — no es un insumo gratuito real (estaba en $0, favoreciéndolo frente a bases con costo de mercado).", cs: ["p_ostreatus_gris", "p_ostreatus_blanco"] },
  { id: "retamo_espinoso", name: "Retamo espinoso", cat: "base", cn: 32, n: 1.5, c: 47, moisture: 11, cra: 3, ph: 6, dig: 5, role: "base_carbono", tags: ["Base", "Local", "Tenjo"], cost: 400, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"], notes: "Ficha técnica del usuario: N 1.4–1.6%, C 46–48%, C:N 30–34:1, celulosa 45–47.5%, hemicelulosa 21–22.5%, lignina 23–24.5%, cenizas 3.5–4.5%, pH 5.8–6.2, humedad 10–12%. Digestibilidad y compatibilidad de especies estimadas por analogía con arbustos leñosos similares (no verificadas en ensayo) — confirmar con prueba piloto antes de escalar. Costo $400/kg procesado (recolección + molienda) — evita distorsión del optimizador de costos al no tratarlo como insumo gratuito." },
  { id: "guadua", name: "Guadua astillada", cat: "base", cn: 120, n: 0.35, c: 42, moisture: 15, cra: 3, ph: 6, dig: 4, role: "base_carbono", tags: ["Base", "Bambú"], cost: 2500, cs: ["p_ostreatus_gris", "shiitake", "lions_mane"] },
  { id: "heno_pangola", name: "Heno de pangola", cat: "base", cn: 60, n: 0.8, c: 48, moisture: 12, cra: 4, ph: 6.5, dig: 7, role: "base_carbono", tags: ["Base", "Local"], cost: 6500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "chips_poda_urbana", name: "Chips poda urbana (sauce/fresno)", cat: "base", cn: 150, n: 0.3, c: 45, moisture: 15, cra: 3, ph: 6.2, dig: 5, role: "base_carbono", tags: ["Base", "Tenjo"], cost: 300, notes: "Costo $300/kg procesado (recolección + astillado de poda urbana) — insumo no es gratuito, incluye alistamiento.", cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "shiitake", "lions_mane"] },
  // === CELULÓSICOS / PAPEL ===
  { id: "carton_corrugado", name: "Cartón corrugado troceado", cat: "base", cn: 350, n: 0.13, c: 45, moisture: 8, cra: 3.5, ph: 7, dig: 9, role: "base_carbono", tags: ["Base", "Gratis", "Celulosa"], cost: 800, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "shiitake", "lions_mane"] },
  { id: "carton_huevo", name: "Cartón de huevo", cat: "base", cn: 150, n: 0.28, c: 42, moisture: 8, cra: 4, ph: 7, dig: 8, role: "base_carbono", tags: ["Base", "Gratis", "Aireador"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "papel_periodico", name: "Papel periódico / kraft", cat: "base", cn: 170, n: 0.25, c: 43, moisture: 6, cra: 2.5, ph: 7, dig: 8, role: "base_carbono", tags: ["Base", "Celulosa"], cost: 1500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"] },
  { id: "pulpa_papel", name: "Pulpa de papel (residuo industrial)", cat: "base", cn: 200, n: 0.2, c: 44, moisture: 50, cra: 4, ph: 7, dig: 9, role: "base_carbono", tags: ["Base", "Celulosa", "Industrial"], cost: 1800, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "lions_mane"] },
  // === FIBRAS LOCALES ===
  { id: "fique_cabuya", name: "Fique / cabuya (fibra)", cat: "base", cn: 80, n: 0.55, c: 44, moisture: 12, cra: 3.5, ph: 6.3, dig: 5, role: "base_carbono", tags: ["Base", "Local", "Colombia"], cost: 4500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "tallo_girasol", name: "Tallo de girasol triturado", cat: "base", cn: 55, n: 0.8, c: 44, moisture: 12, cra: 3.5, ph: 6.5, dig: 7, role: "base_carbono", tags: ["Base", "Sabana"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"] },
  { id: "paja_soya", name: "Paja / rastrojo de soya", cat: "base", cn: 25, n: 1.8, c: 45, moisture: 12, cra: 3.5, ph: 6.5, dig: 7, role: "suplemento_medio", tags: ["Base", "N medio", "Leguminosa", "Valor sin diferenciar — ver peritaje"], cost: 500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_eryngii"], notes: "C:N/%N/%C idénticos a kikuyo, estiércol equino y rastrojo de fríjol — ver nota en kikuyo." },
  { id: "fibra_palma", name: "Fibra de palma de aceite", cat: "base", cn: 70, n: 0.7, c: 49, moisture: 18, cra: 3, ph: 5.8, dig: 4, role: "base_carbono", tags: ["Base", "Industrial"], cost: 1800, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"] },
  // === TROPICALES ===
  { id: "pseudotallo_platano", name: "Pseudotallo plátano", cat: "trop", cn: 42, n: 1.1, c: 46, moisture: 85, cra: 5, ph: 6.2, dig: 8, role: "base_carbono", tags: ["Tropical", "EB alto"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "cascara_platano", name: "Cáscara de plátano", cat: "trop", cn: 30, n: 1.5, c: 45, moisture: 12, cra: 3.5, ph: 5.8, dig: 7, role: "suplemento_medio", tags: ["Tropical", "N medio", "Valor sin diferenciar — ver peritaje"], cost: 1500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"], notes: "C:N/%N/%C idénticos a cascarilla de quinua — materiales sin relación botánica, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada." },
  { id: "hoja_platano", name: "Hoja de plátano seca", cat: "trop", cn: 35, n: 1.3, c: 46, moisture: 12, cra: 3.5, ph: 6, dig: 7, role: "base_carbono", tags: ["Tropical", "Local", "Valor sin diferenciar — ver peritaje"], cost: 2500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"], notes: "C:N/%N/%C idénticos a cáscara de cacao — materiales sin relación botánica, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada." },
  { id: "cascara_aguacate", name: "Cáscara de aguacate", cat: "trop", cn: 45, n: 1, c: 45, moisture: 15, cra: 2.5, ph: 5.5, dig: 4, role: "base_carbono", tags: ["Tropical", "Valor sin diferenciar — ver peritaje"], cost: 1400, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: "C:N/%N/%C idénticos a tallo de rosa y residuo de clavel — 3 materiales sin relación botánica, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada." },
  { id: "bagazo_lulo", name: "Bagazo de lulo/mora", cat: "trop", cn: 22, n: 2, c: 44, moisture: 70, cra: 4, ph: 4.5, dig: 8, role: "suplemento_medio", tags: ["Tropical", "N medio", "Gratis"], cost: 1500, cs: ["p_ostreatus_gris", "p_djamor_rosa"] },
  { id: "cascara_cacao", name: "Cáscara de cacao", cat: "local", cn: 35, n: 1.3, c: 46, moisture: 10, cra: 3, ph: 5.5, dig: 6, role: "suplemento_medio", tags: ["Local", "Colombia", "N medio", "Valor sin diferenciar — ver peritaje"], cost: 3500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"], notes: "C:N/%N/%C idénticos a hoja de plátano seca — ver nota en hoja_platano." },
  { id: "pulpa_cacao", name: "Pulpa / mucílago de cacao", cat: "trop", cn: 18, n: 2.5, c: 45, moisture: 80, cra: 4, ph: 4, dig: 9, role: "suplemento_n", tags: ["Tropical", "N alto", "Colombia", "Valor sin diferenciar — ver peritaje"], cost: 4500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"], notes: "C:N/%N/%C idénticos a sustrato agotado de champiñón (SMS) — materiales sin relación, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada." },
  // === CAFÉ ===
  { id: "borra_cafe", name: "Borra de café (SCG)", cat: "cafe", cn: 22, n: 2, c: 47, moisture: 68, cra: 4, ph: 6, dig: 5, role: "suplemento_n", tags: ["Café", "N alto", "Gratis/Muy bajo", "Humedad 65–72%"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "shiitake", "nameko"] },
  { id: "cascara_cafe", name: "Cáscara de café", cat: "cafe", cn: 32, n: 1.4, c: 45, moisture: 12, cra: 3, ph: 5.8, dig: 5, role: "suplemento_medio", tags: ["Café", "N medio"], cost: 3e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "pulpa_cafe", name: "Pulpa de café", cat: "cafe", cn: 25, n: 2.5, c: 45, moisture: 70, cra: 4, ph: 5.5, dig: 6, role: "suplemento_n", tags: ["Café", "N alto"], cost: 2500, cs: ["p_ostreatus_gris", "p_djamor_rosa"], notes: "Literatura reporta C:N=18.1–21.0 para pulpa de café YA COMPOSTADA con estiércol de cabra (ve.scielo.org S1316-33612009000200004) — no para pulpa fresca sola. El compostaje reduce el C:N a medida que se respira carbono, así que la pulpa fresca (lo que describe este insumo) probablemente tenga un C:N igual o mayor a esa cifra de compost terminado — el valor actual (25) es consistente con esa lectura, no contradictorio. No se ajustó." },
  // === SUPLEMENTOS N ===
  { id: "salvado_trigo", name: "Salvado de trigo", cat: "sup", cn: 16, n: 2.8, c: 45, moisture: 12, cra: 3, ph: 6.2, dig: 8, role: "suplemento_n", tags: ["N alto", "Estándar"], cost: 5e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii", "shiitake", "lions_mane", "reishi", "nameko"], notes: "Precio $5.000/kg — Mercado Libre Colombia, presentación 5 kg a $25.000 (ago. 2026); uno de los mejor alineados del catálogo. Corregido desde $5.200/kg.", provenance: { version: 1, sources: { ml_2026_08: { type: "supplier_quote", label: "Mercado Libre Colombia — presentación 5kg", observedAt: "2026-08-01" } }, claims: [{ fields: ["cost"], sourceIds: ["ml_2026_08"], confidence: "high", method: "reported", verifiedAt: "2026-08-17" }] } },
  { id: "salvado_arroz", name: "Salvado de arroz", cat: "sup", cn: 18, n: 2.2, c: 47, moisture: 12, cra: 2.5, ph: 6.5, dig: 7, role: "suplemento_n", tags: ["N alto"], cost: 4200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii", "shiitake", "lions_mane"] },
  { id: "salvado_maiz", name: "Salvado de maíz", cat: "sup", cn: 20, n: 2.2, c: 44, moisture: 12, cra: 2.5, ph: 6.3, dig: 7, role: "suplemento_n", tags: ["N alto", "Local"], cost: 3800, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii", "shiitake"] },
  { id: "cascarilla_soya", name: "Cascarilla de soya/soja (hull)", cat: "sup", cn: 17, n: 2.8, c: 47, moisture: 10, cra: 2.5, ph: 6.8, dig: 7, role: "suplemento_n", tags: ["N muy alto", "Leguminosa"], cost: 5800, cs: ["shiitake", "lions_mane", "reishi", "p_eryngii", "p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "enoki", "nameko"] },
  { id: "harina_soya", name: "Harina de soya tostada", cat: "sup", cn: 8, n: 7, c: 52, moisture: 8, cra: 2, ph: 6.5, dig: 8, role: "suplemento_n", tags: ["N muy alto"], cost: 8500, cs: ["p_eryngii", "shiitake", "lions_mane"] },
  { id: "afrecho_cerveceria", name: "Afrecho de cervecería (spent grain)", cat: "sup", cn: 11, n: 4.2, c: 46, moisture: 75, cra: 4.5, ph: 5.5, dig: 7, role: "suplemento_n", tags: ["N muy alto"], cost: 1125, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii", "shiitake", "lions_mane", "nameko", "enoki"], notes: 'Precio $1.125/kg — Frescorgánico, bulto 40 kg a $45.000, pedido mínimo 10 bultos (ago. 2026); desde 3 toneladas baja a ≈$1.013/kg. Tag "Gratis" retirado — no es insumo sin costo, corregido desde $2.500/kg.' },
  { id: "cascarilla_quinua", name: "Cascarilla de quinua", cat: "sup", cn: 30, n: 1.5, c: 45, moisture: 10, cra: 2, ph: 6.5, dig: 6, role: "suplemento_medio", tags: ["N medio", "Boyacá", "Valor sin diferenciar — ver peritaje"], cost: 4500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"], notes: "C:N/%N/%C idénticos a cáscara de plátano — ver nota en cascara_platano." },
  { id: "torta_girasol", name: "Torta de girasol", cat: "sup", cn: 7, n: 5, c: 45, moisture: 10, cra: 2, ph: 6.2, dig: 7, role: "suplemento_n", tags: ["N muy alto"], cost: 4800, cs: ["p_eryngii", "shiitake", "lions_mane", "reishi"] },
  // === ESTIÉRCOL ===
  { id: "gallinaza", name: "Gallinaza compostada", cat: "est", cn: 10, n: 3.5, c: 35, moisture: 20, cra: 2.5, ph: 7.5, dig: 8, role: "suplemento_n", tags: ["N alto"], cost: 1700, cs: ["p_ostreatus_gris"], notes: "Precio $1.700/kg — Viveros de Colombia, Bogotá, gallinaza compostada en bulto (ago. 2026). Corregido desde $2.500/kg." },
  { id: "estiercol_equino", name: "Estiércol equino puro", cat: "est", cn: 25, n: 1.8, c: 45, moisture: 30, cra: 3, ph: 7.5, dig: 7, role: "suplemento_n", tags: ["Local", "Tenjo", "Valor sin diferenciar — ver peritaje"], cost: 1800, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: "C:N/%N/%C idénticos a kikuyo, paja de soya y rastrojo de fríjol — ver nota en kikuyo. La literatura reporta C:N de estiércol muy variable (5–25:1) según especie animal y cama, así que un valor puntual no es descabellado, pero coincidir EXACTO con tres materiales vegetales distintos sí es sospechoso." },
  // === LOCALES SABANA ===
  { id: "capacho_uchuva", name: "Capacho de uchuva", cat: "local", cn: 40, n: 1.1, c: 44, moisture: 14, cra: 2.5, ph: 6, dig: 6, role: "suplemento_medio", tags: ["Local", "Tenjo", "Gratis", "Valor sin diferenciar — ver peritaje"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: 'Parece describir el mismo residuo físico que cascara_uchuva ("Cáscara de Uchuva (capacho)") pero con cn/n/c y costo distintos ($1.200 vs $500/kg) sin una diferencia de procesamiento documentada que lo justifique — revisar si deberían fusionarse en un solo insumo. Etiqueta "Gratis" tampoco verificada como costo puesto en granja.' },
  { id: "cascara_arveja", name: "Cáscara de arveja", cat: "local", cn: 35, n: 1.3, c: 45, moisture: 12, cra: 3, ph: 6.3, dig: 6, role: "suplemento_medio", tags: ["Local", "Cundinamarca"], cost: 1400, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"] },
  { id: "tallo_rosa", name: "Tallo de rosa molido", cat: "local", cn: 45, n: 1, c: 45, moisture: 15, cra: 3.5, ph: 6.5, dig: 5, role: "base_carbono", tags: ["Local", "Floricultura", "Valor sin diferenciar — ver peritaje"], cost: 1500, cs: ["p_ostreatus_gris"], notes: "C:N/%N/%C idénticos a cáscara de aguacate y residuo de clavel — ver nota en cascara_aguacate." },
  { id: "follaje_crisantemo", name: "Follaje de crisantemo", cat: "local", cn: 40, n: 1.2, c: 45, moisture: 18, cra: 3.5, ph: 6.5, dig: 6, role: "base_carbono", tags: ["Local", "Floricultura"], cost: 1200, cs: ["p_ostreatus_gris"] },
  { id: "residuo_clavel", name: "Residuo de clavel (Madrid/Facatativá)", cat: "local", cn: 45, n: 1, c: 45, moisture: 18, cra: 4.5, ph: 6.5, dig: 5, role: "base_carbono", tags: ["Local", "Floricultura", "Gratis", "Valor sin diferenciar — ver peritaje"], cost: 1e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: "C:N/%N/%C idénticos a cáscara de aguacate y tallo de rosa — ver nota en cascara_aguacate." },
  { id: "rastrojo_papa", name: "Rastrojo de papa (Villapinzón)", cat: "local", cn: 35, n: 1.2, c: 42, moisture: 12, cra: 3, ph: 6.3, dig: 7, role: "suplemento_medio", tags: ["Local", "Cundinamarca"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "rastrojo_frijol", name: "Rastrojo de fríjol", cat: "local", cn: 25, n: 1.8, c: 45, moisture: 12, cra: 3, ph: 6.5, dig: 7, role: "suplemento_medio", tags: ["Local", "N medio", "Valor sin diferenciar — ver peritaje"], cost: 1600, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: "C:N/%N/%C idénticos a kikuyo, paja de soya y estiércol equino — ver nota en kikuyo." },
  { id: "cascara_maní", name: "Cáscara de maní", cat: "local", cn: 28, n: 1.6, c: 45, moisture: 8, cra: 2, ph: 6.3, dig: 6, role: "suplemento_medio", tags: ["N medio", "Leguminosa"], cost: 300, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"] },
  { id: "cascara_papa", name: "Cáscara de papa", cat: "local", cn: 15, n: 3, c: 45, moisture: 80, cra: 4, ph: 6, dig: 8, role: "suplemento_n", tags: ["Local", "N alto", "Gratis"], cost: 1500, cs: ["p_ostreatus_gris"] },
  // === ECONOMÍA CIRCULAR ===
  { id: "sms", name: "Sustrato agotado (SMS)", cat: "circ", cn: 18, n: 2.5, c: 45, moisture: 70, cra: 4, ph: 6.5, dig: 6, role: "suplemento_medio", tags: ["Circular", "N alto", "Valor sin diferenciar — ver peritaje"], cost: 0, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"], notes: "C:N/%N/%C idénticos a pulpa de cacao — ver nota en pulpa_cacao. Costo $0: investigación de precios confirma que es defendible SOLO si el SMS se genera en la misma granja (subproducto propio del ciclo de cultivo) — registrar aparte el costo de manejo/transporte/almacenamiento por separado en vez de inflar el costo de adquisición del material." },
  { id: "lombricompost", name: "Lombricompost", cat: "circ", cn: 12, n: 3, c: 36, moisture: 35, cra: 3.5, ph: 7, dig: 8, role: "suplemento_n", tags: ["N alto", "Microflora"], cost: 680, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: "Precio $680/kg — Lombricultura de Tenjo, humus sólido a $680.000/tonelada con lona reciclada (ago. 2026). Corregido desde $5.000/kg.", provenance: { version: 1, sources: { tenjo_2026_08: { type: "supplier_quote", label: "Lombricultura de Tenjo — humus sólido, tonelada con lona reciclada", organization: "Lombricultura de Tenjo", location: "Tenjo, Cundinamarca", observedAt: "2026-08-01" } }, claims: [{ fields: ["cost"], sourceIds: ["tenjo_2026_08"], confidence: "high", method: "reported", verifiedAt: "2026-08-17" }] } },
  { id: "compost_maduro", name: "Compost maduro (>3 meses)", cat: "circ", cn: 15, n: 2.8, c: 42, moisture: 35, cra: 3.5, ph: 7, dig: 8, role: "suplemento_n", tags: ["N alto", "Estable"], cost: 798, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"], notes: "Precio $798/kg — Tumatera (Bogotá/Sabana), bulto 50 kg a $39.900 (ago. 2026); la fuente no confirma explícitamente madurez >3 meses. Corregido desde $2.500/kg." },
  // === ADITIVOS ===
  { id: "carbonato_calcio", name: "Carbonato de calcio", cat: "adit", cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 9.5, dig: 0, role: "aditivo_ph", tags: ["pH", "Mineral"], cost: 3e3, cs: Object.keys(SPP) },
  { id: "yeso", name: "Yeso agrícola", cat: "adit", cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 7, dig: 0, role: "aditivo_estructura", tags: ["Estructura", "Ca"], cost: 1482, cs: Object.keys(SPP), notes: "Precio $1.482/kg — Yesoplant, bulto 50 kg a $74.100 (ago. 2026). Corregido desde $2.200/kg." },
  { id: "sulfato_magnesio", name: "Sulfato de magnesio", cat: "adit", cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 7, dig: 0, role: "aditivo_micronutriente", tags: ["Mg", "Cofactor"], cost: 1e4, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii", "shiitake", "lions_mane"] },
  { id: "melaza", name: "Melaza", cat: "adit", cn: 30, n: 0.5, c: 38, moisture: 25, cra: 1, ph: 5.5, dig: 9, role: "aditivo_arrancador", tags: ["Arrancador"], cost: 6500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco"] },
  { id: "ceniza_vegetal", name: "Ceniza vegetal", cat: "adit", cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 11, dig: 0, role: "aditivo_ph", tags: ["pH", "K", "Gratis"], cost: 3e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "zeolita", name: "Zeolita natural", cat: "adit", cn: 0, n: 0, c: 0, moisture: 0, cra: 5, ph: 7.2, dig: 0, role: "aditivo_estructura", tags: ["Estructura", "Retención"], cost: 3708, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_eryngii", "shiitake", "lions_mane"], notes: "Precio $3.708/kg — La Leñería (Bogotá), bulto 25 kg a $92.700 (ago. 2026). Corregido desde $8.500/kg." },
  { id: "tiamina", name: "Tiamina (Vit B1)", cat: "adit", cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 7, dig: 0, role: "aditivo_micronutriente", tags: ["Vitamina", "Cofactor"], cost: 12e4, cs: Object.keys(SPP) },
  // === NUEVOS INGREDIENTES v21.5 ===
  { id: "harina_alfalfa", name: "Harina de Alfalfa", cat: "sup", cn: 14, n: 2.5, c: 35, moisture: 8, cra: 3.2, ph: 7.2, dig: 7, role: "suplemento_n", tags: ["Proteína", "Leguminosa", "Bioestimulante"], cost: 8e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "lions_mane", "enoki", "nameko", "p_djamor_rosa"] },
  { id: "cascarilla_huevo_molida", name: "Cascarilla de Huevo Molida", cat: "adit", cn: 0, n: 0, c: 0, moisture: 2, cra: 0.8, ph: 8.8, dig: 0, role: "aditivo_ph", tags: ["Calcio", "Lento", "Biodegradable"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "shiitake", "lions_mane", "reishi", "enoki", "nameko"] },
  { id: "polvo_hueso", name: "Polvo de Hueso", cat: "sup", cn: 11, n: 2.5, c: 28, moisture: 3, cra: 1.2, ph: 7, dig: 2, role: "suplemento_n", tags: ["Fósforo", "Lento", "Premium"], cost: 8500, cs: ["p_eryngii", "shiitake", "lions_mane", "reishi", "nameko"] },
  { id: "corteza_molida", name: "Corteza de Árbol Molida", cat: "base", cn: 160, n: 0.3, c: 48, moisture: 25, cra: 2.1, ph: 6.5, dig: 3, role: "base_carbono", tags: ["Estructura", "Lento", "Shiitake"], cost: 1400, cs: ["shiitake", "lions_mane", "reishi"] },
  { id: "harina_trigo", name: "Harina de Trigo Integral", cat: "sup", cn: 12, n: 2.8, c: 40, moisture: 10, cra: 2.5, ph: 6.5, dig: 6, role: "suplemento_n", tags: ["Proteína", "Gluten", "Bioestimulante"], cost: 1200, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii", "nameko"] },
  { id: "harina_maiz", name: "Harina de Maíz (Afrecho)", cat: "sup", cn: 8, n: 3.2, c: 36, moisture: 12, cra: 3, ph: 6.8, dig: 7, role: "suplemento_n", tags: ["Proteína", "Local", "Económico"], cost: 1e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii", "lions_mane", "enoki"], notes: "El nombre mezcla dos productos distintos: harina de maíz (Mercado Libre Colombia, 12,5 kg a $59.400 = ~$4.752/kg, ago. 2026) y afrecho de maíz (subproducto grueso, más barato, sin cotización propia encontrada). No se ajustó el costo porque no está claro cuál de los dos describen realmente cn/n/c — separar en dos insumos o aclarar cuál es antes de corregir el precio." },
  { id: "harina_pescado", name: "Harina de Pescado Deshidratada", cat: "sup", cn: 4, n: 9.5, c: 38, moisture: 6, cra: 0.8, ph: 6.5, dig: 2, role: "suplemento_n", tags: ["Proteína Pura", "Premium", "Olor fuerte", "Autoclave obligatorio"], cost: 14e3, cs: ["p_ostreatus_gris", "enoki"], notes: "Uso experimental. Olor fuerte atrae ácaros/Sciaridae. Solo autoclave. Máx 3%." },
  { id: "salvado_avena", name: "Salvado de Avena", cat: "sup", cn: 15, n: 2.6, c: 39, moisture: 10, cra: 3.5, ph: 6.6, dig: 8, role: "suplemento_n", tags: ["Fibra", "N medio", "Local", "Requiere control sanitario"], cost: 7500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "enoki", "nameko", "lions_mane", "shiitake"] },
  { id: "cascarilla_girasol", name: "Cascarilla de Girasol", cat: "sup", cn: 25, n: 1.8, c: 42, moisture: 12, cra: 3.2, ph: 6.5, dig: 5, role: "suplemento_medio", tags: ["Fibra", "Aireador", "Económico"], cost: 3500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "lions_mane", "enoki"] },
  { id: "algas_marinas", name: "Algas Marinas Molidas", cat: "adit", cn: 13, n: 1.5, c: 20, moisture: 12, cra: 2.2, ph: 7.8, dig: 2, role: "aditivo_micronutriente", tags: ["Bioácidos", "Yodo", "Premium"], cost: 18e3, cs: ["lions_mane", "nameko", "p_ostreatus_blanco"] },
  { id: "estierc_gallina_deshid", name: "Estiércol de Gallina Deshidratado", cat: "est", cn: 7, n: 3.5, c: 25, moisture: 8, cra: 3.8, ph: 7.5, dig: 6, role: "suplemento_n", tags: ["Balanceado", "Local", "Rápido"], cost: 300, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "enoki", "nameko"], notes: 'Precio $300/kg — Croper, gallinaza de jaula seca, El Rosal (Cundinamarca), bulto 40 kg, escala 1–25 bultos (ago. 2026); baja a $250/kg en 26–100 bultos y $200/kg sobre 100. Fuente local pero no confirma "deshidratado" industrial (es "seca y empacada"). Corregido desde $2.200/kg.' },
  { id: "vermicompost", name: "Vermicompost", cat: "circ", cn: 15, n: 1.8, c: 27, moisture: 35, cra: 4.2, ph: 6.9, dig: 8, role: "suplemento_medio", tags: ["Microbios", "Bioestimulante"], cost: 680, cs: ["lions_mane", "p_ostreatus_blanco", "nameko", "p_eryngii"], notes: 'Precio $680/kg — mismo referente de humus/lombricompost de Lombricultura de Tenjo ($680.000/t, ago. 2026); "vermicompost", "humus de lombriz" y "lombricompost" son la misma clase de producto en el mercado local. Corregido desde $6.000/kg (tag "Premium" quitado, no se sostiene frente al precio mayorista real).' },
  /* ── NUEVOS v3.1 — Investigación Sabana de Bogotá 2026 ──────────────── */
  { id: "pulpa_alfalfa", name: "Pulpa de Alfalfa (fresca/henificada)", cat: "local", cn: 11, n: 3, c: 33, moisture: 72, cra: 4.8, ph: 6.9, dig: 9, role: "suplemento_n", tags: ["EB 166%", "Sabana", "N Alto", "Nuevo"], cost: 4e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "lions_mane", "nameko"], notes: 'El nombre mezcla dos estados de humedad muy distintos ("fresca/henificada") con costos y logística distintos; "pulpa de alfalfa" no aparece como categoría comercial estandarizada en Colombia (se investigó por separado harina de alfalfa, que sí es distinta). moisture:72 sugiere que este registro describe la forma fresca — separar en dos insumos (fresca vs. henificada) antes de ajustar el costo.' },
  { id: "cascara_uchuva", name: "Cáscara de Uchuva (capacho)", cat: "local", cn: 30, n: 1.2, c: 35, moisture: 10, cra: 3.5, ph: 6.1, dig: 5, role: "base_carbono", tags: ["EB 76%", "Cundinamarca", "Validado CO", "Nuevo", "Valor sin diferenciar — ver peritaje"], cost: 500, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa", "p_eryngii"], notes: 'El nombre entre paréntesis ("capacho") coincide con capacho_uchuva, que tiene cn/n/c y costo distintos ($500 vs $1.200/kg) sin diferencia de procesamiento documentada — probable duplicado del mismo residuo físico bajo dos IDs. Revisar si deberían fusionarse.' },
  { id: "tallo_floricultura", name: "Tallo de Rosa / Clavel (Sabana)", cat: "local", cn: 48, n: 0.9, c: 42, moisture: 80, cra: 3, ph: 6.3, dig: 4, role: "base_carbono", tags: ["Sin estudiar", "Sabana 85%", "Potencial alto", "Nuevo"], cost: 200, notes: 'Costo $200/kg procesado (recolección + alistamiento de tallos de floricultura) — evita subestimar el costo real frente a residuo "gratis".', cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "p_djamor_rosa"] },
  { id: "raices_hidroponicas", name: "Raíces Hidropónicas + SMS", cat: "circ", cn: 14, n: 2.1, c: 29, moisture: 88, cra: 3.8, ph: 6.5, dig: 7, role: "suplemento_n", tags: ["EB 61%", "Economía Circular", "Nuevo"], cost: 1800, cs: ["p_ostreatus_blanco", "lions_mane", "nameko", "p_eryngii"], notes: "El nombre indica que es una mezcla propia (raíces hidropónicas + SMS), no una materia prima con mercado independiente — no existe un producto comercial estandarizado con esta denominación. El costo debería derivarse de sus componentes en vez de cotizarse como insumo único; $1.800/kg no está validado contra mercado." },
  { id: "hemp_hurds", name: "Hemp Hurds (cáñamo industrial)", cat: "sup", cn: 70, n: 0.5, c: 47, moisture: 10, cra: 4, ph: 6.8, dig: 3, role: "base_carbono", tags: ["Mejor Pleurotus EU", "Aireador", "Premium", "Nuevo"], cost: 28e3, cs: ["p_ostreatus_gris", "p_ostreatus_blanco", "lions_mane", "shiitake"] }
];
const CATS = { all: "Todos", base_carbono: "Carbono", suplemento_n: "N alto", suplemento_medio: "N medio", aireador: "Aireación", aditivo: "Correctores" };
const PRESETS = {
  /* ── RECETAS PRINCIPALES — Proporciones validadas contra C:N objetivo ── */
  // Orellana Gris: C:N ideal 35. Calc: paja_trigo(c45,n0.5)×60 + salvado(c45,n2.8)×28 + borra(c47,n2.0)×7 → C:N≈35.0 ✓
  "orellana_gris_basica": { name: "Orellana Gris — Estándar Sabana (C:N≈35)", s: "p_ostreatus_gris", i: [{ id: "paja_trigo", p: 60 }, { id: "salvado_trigo", p: 28 }, { id: "borra_cafe", p: 7 }, { id: "carbonato_calcio", p: 3 }, { id: "yeso", p: 2 }] },
  // Económico: paja_cebada(c45,n0.5)×50 + salvado×20 + borra×15 + cascarilla×7 → C:N≈36 ✓
  "orellana_gris_economico": { name: "Orellana Gris — Económico Cero (C:N≈36)", s: "p_ostreatus_gris", i: [{ id: "paja_cebada", p: 50 }, { id: "salvado_trigo", p: 20 }, { id: "borra_cafe", p: 15 }, { id: "cascarilla_arroz", p: 7 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 3 }] },
  // Orellana Blanca: C:N ideal 30. paja×55 + afrecho(c42,n3.5)×15 + salvado×15 + borra×8 → C:N≈30.1 ✓
  "orellana_blanca_premium": { name: "Orellana Blanca — Afrecho Premium (C:N≈30)", s: "p_ostreatus_blanco", i: [{ id: "paja_trigo", p: 55 }, { id: "afrecho_cerveceria", p: 15 }, { id: "salvado_trigo", p: 15 }, { id: "borra_cafe", p: 8 }, { id: "carbonato_calcio", p: 4 }, { id: "yeso", p: 3 }] },
  // Eryngii: C:N ideal 30. paja×40 + roble(c50,n0.1)×15 + afrecho×20 + salvado×17 → C:N≈29 ✓ (requiere autoclave)
  "eringii_tecnico": { name: "Seta de Cardo — Técnico Autoclave (C:N≈29)", s: "p_eryngii", i: [{ id: "paja_trigo", p: 40 }, { id: "aserrin_roble", p: 15 }, { id: "afrecho_cerveceria", p: 20 }, { id: "salvado_trigo", p: 17 }, { id: "polvo_hueso", p: 3 }, { id: "carbonato_calcio", p: 3 }, { id: "yeso", p: 2 }] },
  // Shiitake: C:N ideal 50. roble×62 + guadua(c42,n0.35)×8 + salvado×20 + cascarilla_soya×5 → C:N≈54 ✓
  "shiitake_clasico": { name: "Shiitake — Tradicional Asiático (C:N≈50)", s: "shiitake", i: [{ id: "aserrin_roble", p: 62 }, { id: "guadua", p: 8 }, { id: "salvado_trigo", p: 20 }, { id: "cascarilla_soya", p: 5 }, { id: "polvo_hueso", p: 3 }, { id: "carbonato_calcio", p: 2 }] },
  // Lions Mane: C:N ideal 40. roble×60 + afrecho×12 + salvado×12 + cascarilla_soya×8 → C:N≈39 ✓
  "melena_leon_bioest": { name: "Melena de León — Master Enriquecido (C:N≈39)", s: "lions_mane", i: [{ id: "aserrin_roble", p: 60 }, { id: "afrecho_cerveceria", p: 12 }, { id: "salvado_trigo", p: 12 }, { id: "cascarilla_soya", p: 8 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 3 }] },
  // Reishi: C:N ideal 50. roble×55 + corteza(c48,n0.3)×15 + cascarilla_soya×12 + salvado×12 → C:N≈50 ✓
  "reishi_especialista": { name: "Reishi — Ultra Especialista (C:N≈50, 4–6 meses)", s: "reishi", i: [{ id: "aserrin_roble", p: 55 }, { id: "corteza_molida", p: 15 }, { id: "cascarilla_soya", p: 12 }, { id: "salvado_trigo", p: 12 }, { id: "carbonato_calcio", p: 4 }, { id: "yeso", p: 2 }] },
  // Enoki: C:N ideal 27. paja_arroz×35 + pino_comp×15 + afrecho×22 + salvado×15 + cascarilla×5 → C:N≈27 ✓ (5–12°C)
  // Enoki: paja_arroz×35 + alamo(c45,n0.2)×15 + afrecho×22 + salvado×15 → C:N≈27 ✓ | alamo cs incluye enoki ✓
  "enoki_comercial": { name: "Enoki — Comercial Frío 5–12°C (C:N≈27)", s: "enoki", i: [{ id: "paja_arroz", p: 35 }, { id: "aserrin_alamo", p: 15 }, { id: "afrecho_cerveceria", p: 22 }, { id: "salvado_trigo", p: 15 }, { id: "cascarilla_arroz", p: 5 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 3 }] },
  // Nameko: C:N ideal 40. roble×45 + paja_arroz×20 + afrecho×15 + salvado×10 + borra×5 → C:N≈41 ✓
  "nameko_balanceado": { name: "Nameko — Umami Balanceado (C:N≈41)", s: "nameko", i: [{ id: "aserrin_roble", p: 45 }, { id: "paja_arroz", p: 20 }, { id: "afrecho_cerveceria", p: 15 }, { id: "salvado_trigo", p: 10 }, { id: "borra_cafe", p: 5 }, { id: "carbonato_calcio", p: 3 }, { id: "yeso", p: 2 }] },
  // Orellana Rosa: C:N ideal 40. bagazo_caña(c42,n0.7)×50 + paja_arroz×20 + borra×10 + salvado×12 → C:N≈39 ✓
  "orellana_rosa_calida": { name: "Orellana Rosa — Cálida Caña+Arroz (C:N≈39)", s: "p_djamor_rosa", i: [{ id: "bagazo_caña", p: 50 }, { id: "paja_arroz", p: 20 }, { id: "borra_cafe", p: 10 }, { id: "salvado_trigo", p: 12 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 3 }] },
  /* ── Presets Sabana de Bogotá 2026 — ingredientes locales validados ── */
  // Alfalfa: paja_trigo×68 + pulpa_alfalfa(c33,n3.0)×17 + afrecho×8 → C:N≈35 ✓ | EB referenciado 166%
  "alfalfa_eb166": { name: "★ Pulpa de Alfalfa — Máximo EB (C:N≈35)", s: "p_ostreatus_gris", i: [{ id: "paja_trigo", p: 68 }, { id: "pulpa_alfalfa", p: 17 }, { id: "afrecho_cerveceria", p: 8 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 2 }] },
  // Uchuva: cascara_uchuva(c35,n1.2)×50 + paja_trigo×28 + borra×5 + salvado×10 → C:N≈33 ✓ (validado Colombia)
  "uchuva_local": { name: "★ Uchuva Cundinamarca — Validado CO (C:N≈33)", s: "p_ostreatus_gris", i: [{ id: "cascara_uchuva", p: 50 }, { id: "paja_trigo", p: 28 }, { id: "borra_cafe", p: 5 }, { id: "salvado_trigo", p: 10 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 2 }] },
  // Floricultura: tallo_floricultura(c42,n0.9)×50 + paja_arroz×25 + afrecho×15 + borra×5 → C:N≈33 ✓ (exploración)
  "floricultura_exploracion": { name: "★ Tallo de Floricultura — Exploración (C:N≈33)", s: "p_ostreatus_blanco", i: [{ id: "tallo_floricultura", p: 50 }, { id: "paja_arroz", p: 25 }, { id: "afrecho_cerveceria", p: 15 }, { id: "borra_cafe", p: 5 }, { id: "carbonato_calcio", p: 3 }, { id: "yeso", p: 2 }] },
  // Tuza de maíz: tusa_maiz(c45,n0.7)×60 + salvado(c45,n2.8)×25 + borra(c47,n2.0)×8 → C:N≈35.2 ✓
  "tuza_maiz_sabana": { name: "★ Tuza de Maíz — Estándar Sabana (C:N≈35)", s: "p_ostreatus_gris", i: [{ id: "tusa_maiz", p: 60 }, { id: "salvado_trigo", p: 25 }, { id: "borra_cafe", p: 8 }, { id: "carbonato_calcio", p: 4 }, { id: "yeso", p: 3 }] },
  // Circular: chips_poda×35 + raices_hidrop×15 + roble×25 + cascarilla_soya×8 + salvado×10 → C:N≈39 ✓
  "circular_hidroponico": { name: "★ Circular Hidropónico — Economía Circular (C:N≈39)", s: "lions_mane", i: [{ id: "chips_poda_urbana", p: 35 }, { id: "raices_hidroponicas", p: 15 }, { id: "aserrin_roble", p: 25 }, { id: "cascarilla_soya", p: 8 }, { id: "salvado_trigo", p: 10 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 2 }] },
  /* ── Bodega Tenjo 2026 — formuladas con inventario propio (sin afrecho de cervecería) ── */
  "bodega_gris": { name: "⬡ Bodega — Orellana Gris (C:N≈33, solo inventario)", s: "p_ostreatus_gris", i: [{ id: "bagazo_caña", p: 50 }, { id: "salvado_trigo", p: 20 }, { id: "borra_cafe", p: 13 }, { id: "cascarilla_arroz", p: 11 }, { id: "carbonato_calcio", p: 4 }, { id: "sulfato_magnesio", p: 2 }] },
  "bodega_rosa": { name: "⬡ Bodega — Orellana Rosa (C:N≈42, solo inventario)", s: "p_djamor_rosa", i: [{ id: "bagazo_caña", p: 60 }, { id: "cascarilla_arroz", p: 10 }, { id: "borra_cafe", p: 9 }, { id: "cascara_cafe", p: 8 }, { id: "salvado_trigo", p: 7 }, { id: "carbonato_calcio", p: 4 }, { id: "sulfato_magnesio", p: 2 }] },
  "bodega_blanca": { name: "⬡ Bodega — Orellana Blanca (C:N≈31, esterilizar: suplemento alto)", s: "p_ostreatus_blanco", i: [{ id: "bagazo_caña", p: 50 }, { id: "salvado_trigo", p: 24 }, { id: "borra_cafe", p: 13 }, { id: "cascarilla_arroz", p: 8 }, { id: "carbonato_calcio", p: 3 }, { id: "sulfato_magnesio", p: 2 }] },
  "bodega_blanca_maiz": { name: "⬡ Bodega+ — Blanca con harina de maíz (C:N≈28, $600/kg N)", s: "p_ostreatus_blanco", i: [{ id: "bagazo_caña", p: 50 }, { id: "harina_maiz", p: 16 }, { id: "salvado_trigo", p: 12 }, { id: "borra_cafe", p: 8 }, { id: "cascarilla_arroz", p: 8 }, { id: "carbonato_calcio", p: 4 }, { id: "sulfato_magnesio", p: 2 }] },
  "bodega_melena_mastermix": { name: "⬡ Melena — Master’s Mix roble+soya (C:N≈30, literatura 150–180% EB)", s: "lions_mane", i: [{ id: "aserrin_roble", p: 55 }, { id: "cascarilla_soya", p: 30 }, { id: "salvado_trigo", p: 10 }, { id: "carbonato_calcio", p: 3 }, { id: "sulfato_magnesio", p: 2 }] },
  /* ── Presets clásicos (compatibilidad) ── */
  kk1c: { name: "KK-1c (Sabana clásico)", s: "p_ostreatus_gris", i: [{ id: "kikuyo", p: 43 }, { id: "aserrin_eucalipto", p: 28 }, { id: "cascarilla_arroz", p: 8 }, { id: "salvado_trigo", p: 8 }, { id: "yeso", p: 2 }, { id: "carbonato_calcio", p: 1 }] },
  paja: { name: "Paja + Salvado (básico)", s: "p_ostreatus_gris", i: [{ id: "paja_trigo", p: 80 }, { id: "salvado_trigo", p: 18 }, { id: "yeso", p: 1 }, { id: "carbonato_calcio", p: 1 }] },
  master: { name: "Master's Mix (Stamets)", s: "lions_mane", i: [{ id: "aserrin_roble", p: 50 }, { id: "cascarilla_soya", p: 50 }] },
  cafe: { name: "Café + Uchuva (circular)", s: "p_ostreatus_gris", i: [{ id: "paja_trigo", p: 45 }, { id: "borra_cafe", p: 25 }, { id: "capacho_uchuva", p: 20 }, { id: "salvado_trigo", p: 7 }, { id: "yeso", p: 2 }, { id: "carbonato_calcio", p: 1 }] },
  platano: { name: "Plátano + Salvado", s: "p_djamor_rosa", i: [{ id: "pseudotallo_platano", p: 55 }, { id: "cascara_platano", p: 20 }, { id: "salvado_trigo", p: 15 }, { id: "carbonato_calcio", p: 5 }, { id: "yeso", p: 3 }, { id: "melaza", p: 2 }] },
  hojarasca: { name: "Hojarasca UNAL", s: "p_ostreatus_gris", i: [{ id: "kikuyo", p: 50 }, { id: "hojarasca", p: 30 }, { id: "rastrojo_frijol", p: 10 }, { id: "carbonato_calcio", p: 7 }, { id: "yeso", p: 3 }] }
};
const BAG_TYPES = [
  {
    id: "bolsa_20x50",
    icon: "",
    name: "Bolsa 20×50 cm · filtro 0.06mm",
    kgHumedo: 1.8,
    vol_L: 3.6,
    tratamiento: "cwlp_thermal",
    color: "var(--moss-500,var(--accent-olive))",
    dim: "20×50 cm",
    notas: "Formato estándar Setas de la Peña. Compatible con CWLP o pasteurización. Inocular mezclando en capas o por la boca superior antes de cerrar con filtro.",
    produccion: "Colgar o apoyar verticalmente. Sin orificios adicionales — el filtro maneja el intercambio gaseoso."
  },
  {
    id: "bolsa_18x35",
    icon: "",
    name: "Bolsa 18×35 cm · filtro 0.06mm",
    kgHumedo: 1,
    vol_L: 2,
    tratamiento: "cwlp_thermal",
    color: "var(--ochre-600)",
    dim: "18×35 cm",
    notas: "Formato pequeño. Ideal para pruebas de receta, especies exigentes (P. eryngii, Lions Mane), o Martha tent con poco espacio.",
    produccion: "Apilar en estantería o colgar. Bajo peso = fácil manejo. 30 bolsas = ~30 kg de sustrato húmedo."
  },
  {
    id: "punch_bag_martha",
    icon: "",
    name: "Bolsa colgante (punch bag · Martha tent)",
    kgHumedo: 3.5,
    vol_L: 7,
    tratamiento: "thermal",
    color: "var(--coral-700)",
    dim: "~22×70 cm relleno",
    notas: "Versión escalada para Martha tent (1 bolsa de polipropileno 22×80cm aprox.). Llenar 3.5–4 kg. Colgar del centro del tent con cuerda o gancho. Cortar 6–8 orificios Ø2–2.5cm en espiral cada ~10 cm desde la base. Ideal Pleurotus — alta densidad de fructificación por m².",
    produccion: "Un solo punch bag ocupa el espacio central del tent y deja espacio alrededor para humidificación uniforme. Escalar a 2 bolsas para un tent 120×60cm. Pinchar con cuchillo o sacabocado caliente, no con tijeras."
  }
];
const Bag = () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "48", width: "60", height: "40", rx: "2", fill: "var(--ink-900)" }), /* @__PURE__ */ React.createElement("rect", { x: "5", y: "48", width: "60", height: "7", rx: "2", fill: "var(--ink-900)" }));
const IcoTherm = () => /* @__PURE__ */ React.createElement("svg", { width: "8", height: "13", viewBox: "0 0 8 13", fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M3 7.8V2.5a1.5 1.5 0 013 0v5.3a3 3 0 11-3 0z", opacity: ".6" }));
const IcoDrop = () => /* @__PURE__ */ React.createElement("svg", { width: "9", height: "12", viewBox: "0 0 9 12", fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M4.5.5S1 5.5 1 8a3.5 3.5 0 007 0c0-2.5-3.5-7.5-3.5-7.5z", opacity: ".6" }));
const IcoLayers = () => /* @__PURE__ */ React.createElement("svg", { width: "12", height: "9", viewBox: "0 0 12 9", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round", opacity: ".6" }, /* @__PURE__ */ React.createElement("path", { d: "M1 2.5l5 2.5 5-2.5M1 5.5l5 2.5 5-2.5" }));
const IcoArrow = () => /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none" }, /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "8", r: "7", stroke: "currentColor", strokeWidth: "1.2", opacity: ".4" }), /* @__PURE__ */ React.createElement("path", { d: "M5.5 8h5M8.5 5.5L11 8l-2.5 2.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }));
const SppSvg = ({ sKey, c }) => {
  const lt = "rgba(255,255,255,0.15)";
  const m = {
    p_ostreatus_gris: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "26", y1: "38", x2: "25", y2: "52", stroke: c, strokeWidth: "4.5", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("line", { x1: "40", y1: "34", x2: "39", y2: "52", stroke: c, strokeWidth: "4", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("line", { x1: "53", y1: "39", x2: "52", y2: "52", stroke: c, strokeWidth: "3.5", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("path", { d: "M4,30 Q14,12 32,16 Q22,28 20,38Z", fill: c, opacity: ".9" }), /* @__PURE__ */ React.createElement("path", { d: "M14,24 Q28,6 48,10 Q38,24 36,38Z", fill: c }), /* @__PURE__ */ React.createElement("path", { d: "M34,28 Q46,12 62,18 Q56,30 52,40Z", fill: c, opacity: ".88" })),
    p_ostreatus_blanco: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "26", y1: "38", x2: "25", y2: "52", stroke: c, strokeWidth: "4.5", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("line", { x1: "40", y1: "34", x2: "39", y2: "52", stroke: c, strokeWidth: "4", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("path", { d: "M6,32 Q16,14 34,18 Q24,30 22,40Z", fill: c, opacity: ".88" }), /* @__PURE__ */ React.createElement("path", { d: "M22,26 Q36,8 54,14 Q44,26 42,40Z", fill: c })),
    p_djamor_rosa: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "24", y1: "38", x2: "23", y2: "52", stroke: c, strokeWidth: "4", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("line", { x1: "40", y1: "35", x2: "39", y2: "52", stroke: c, strokeWidth: "3.5", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("line", { x1: "54", y1: "40", x2: "53", y2: "52", stroke: c, strokeWidth: "3", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("path", { d: "M6,33 Q16,15 32,18 Q22,30 20,40Z", fill: c, opacity: ".86" }), /* @__PURE__ */ React.createElement("path", { d: "M18,26 Q32,8 50,12 Q40,26 38,40Z", fill: c }), /* @__PURE__ */ React.createElement("path", { d: "M36,30 Q48,16 62,22 Q56,32 54,42Z", fill: c, opacity: ".83" })),
    p_eryngii: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "26", y: "28", width: "18", height: "24", rx: "7", fill: c, opacity: ".88" }), /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("ellipse", { cx: "35", cy: "20", rx: "29", ry: "13", fill: c }), /* @__PURE__ */ React.createElement("ellipse", { cx: "35", cy: "24", rx: "29", ry: "9", fill: c, opacity: ".4" })),
    shiitake: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "28", y: "32", width: "14", height: "20", rx: "6", fill: c, opacity: ".82" }), /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("path", { d: "M7,27 Q22,4 35,5 Q48,4 63,27 Q56,42 35,44 Q14,42 7,27Z", fill: c }), [[22, 15], [30, 10], [40, 11], [50, 16], [44, 22], [24, 22]].map(([x, y], i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: x, cy: y, r: "2.5", fill: lt }))),
    lions_mane: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("circle", { cx: "44", cy: "22", r: "18", fill: c, opacity: ".65" }), /* @__PURE__ */ React.createElement("circle", { cx: "28", cy: "26", r: "21", fill: c, opacity: ".88" }), [-16, -10, -4, 2, 8, 14, 20].map((dx, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: 28 + dx, y1: 42 + i % 2 * 3, x2: 27 + dx, y2: 56 + i % 3 * 4 + i, stroke: c, strokeWidth: "1.6", strokeLinecap: "round", opacity: ".82" }))),
    reishi: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "8", y: "14", width: "10", height: "38", rx: "4", fill: c, opacity: ".88" }), /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("path", { d: "M14,16 Q14,6 44,8 Q66,8 66,22 Q66,34 44,36 Q16,36 14,28Z", fill: c }), /* @__PURE__ */ React.createElement("path", { d: "M14,28 Q14,18 44,20 Q66,20 66,34 Q66,46 44,48 Q16,48 14,40Z", fill: c, opacity: ".85" }), /* @__PURE__ */ React.createElement("path", { d: "M14,40 Q14,30 44,32 Q64,32 64,46 Q64,56 44,58 Q16,58 14,50Z", fill: c, opacity: ".72" })),
    enoki: /* @__PURE__ */ React.createElement(React.Fragment, null, [12, 19, 26, 33, 40, 48, 56].map((x, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: x, y1: 16 + i % 3 * 4, x2: x, y2: 52, stroke: c, strokeWidth: "2.2", strokeLinecap: "round" })), /* @__PURE__ */ React.createElement(Bag, null), [12, 19, 26, 33, 40, 48, 56].map((x, i) => /* @__PURE__ */ React.createElement("ellipse", { key: i, cx: x, cy: 13 + i % 3 * 4, rx: "7", ry: "5", fill: c }))),
    nameko: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "24", y1: "35", x2: "23", y2: "52", stroke: c, strokeWidth: "4", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("line", { x1: "38", y1: "31", x2: "37", y2: "52", stroke: c, strokeWidth: "3.5", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("line", { x1: "50", y1: "35", x2: "49", y2: "52", stroke: c, strokeWidth: "3", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement(Bag, null), /* @__PURE__ */ React.createElement("path", { d: "M6,35 Q16,22 28,24 Q22,33 22,40Z", fill: c, opacity: ".83" }), /* @__PURE__ */ React.createElement("path", { d: "M20,30 Q30,16 44,18 Q38,30 36,40Z", fill: c, opacity: ".9" }), /* @__PURE__ */ React.createElement("path", { d: "M38,33 Q48,20 60,24 Q54,34 52,42Z", fill: c, opacity: ".86" }), /* @__PURE__ */ React.createElement("path", { d: "M16,20 Q24,10 34,12 Q29,20 28,28Z", fill: c, opacity: ".78" }), /* @__PURE__ */ React.createElement("path", { d: "M34,17 Q42,7 52,10 Q46,19 44,26Z", fill: c, opacity: ".76" }))
  };
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 70 90", width: "66", height: "79", style: { display: "block", overflow: "visible" } }, m[sKey] || m.p_ostreatus_gris);
};
const analyze = (recipe, sKey, ings = INGS) => {
  if (!recipe.length) return null;
  const tot = recipe.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  if (!tot) return null;
  let wC = 0, wN = 0, wPh = 0, wDig = 0, wCra = 0, nP = 0, suppP = 0, baseP = 0, addP = 0, cafeP = 0, manP = 0, airP = 0, densaP = 0, incompat = [];
  const DENSOS = ["aserrin_roble", "aserrin_eucalipto", "aserrin_pino", "aserrin_pino_compostado", "borra_cafe", "afrecho_cerveceria", "chips_poda_urbana", "guadua", "carton_corrugado", "pulpa_papel"];
  recipe.forEach((r) => {
    const g = ings.find((i) => i.id === r.id);
    if (!g) return;
    const p = parseFloat(r.p) || 0;
    const esAditivoSeco = g.role === "aditivo_ph" || g.role === "aditivo_estructura";
    const dryFrac = p * (1 - Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)));
    if (g.cn > 0 && !esAditivoSeco) {
      wC += g.c * dryFrac;
      wN += g.n * dryFrac;
      nP += dryFrac;
    }
    wPh += g.ph * p;
    wDig += g.dig * p;
    wCra += g.cra * p;
    if (g.role === "suplemento_n") suppP += p;
    if (g.role === "base_carbono") baseP += p;
    if (["aditivo_ph", "aditivo_estructura", "aditivo_micronutriente"].includes(g.role)) addP += p;
    if (g.role === "aireador") airP += p;
    if (g.cat === "cafe") cafeP += p;
    if (g.cat === "est") manP += p;
    if (DENSOS.includes(g.id)) densaP += p;
    if (sKey && !g.cs.includes(sKey) && g.cn > 0) incompat.push(g.name);
  });
  const avgN = nP ? wN / nP : 0, cn = avgN > 0 ? (nP ? wC / nP : 0) / avgN : 0;
  const avgPh = tot ? wPh / tot : 7;
  const avgDig = tot ? wDig / tot : 5;
  const avgCra = tot ? wCra / tot : 3;
  const cost = recipe.reduce((s, r) => {
    const g = ings.find((i) => i.id === r.id);
    return g ? s + g.cost * (parseFloat(r.p) || 0) / 100 : s;
  }, 0);
  const sp = SPP[sKey];
  let eb = 0, trichoderma = false, dynSpawn = sp?.spawn_rate || 8;
  if (sp) {
    const cF = Math.max(0, 1 - Math.pow(Math.abs(cn - sp.cn_optimal.ideal) / ((sp.cn_optimal.max - sp.cn_optimal.min) / 2), 1.5));
    const nF = Math.max(0, 1 - Math.pow(Math.abs(avgN - sp.n_optimal.ideal) / ((sp.n_optimal.max - sp.n_optimal.min) / 2), 1.5));
    eb = sp.eb_baseline + (sp.eb_optimal - sp.eb_baseline) * (cF * 0.6 + nF * 0.4);
    const needsAutoclave = suppP > sp.supplementation_max;
    const nThresh = needsAutoclave ? sp.n_optimal.max * 1.2 : sp.n_optimal.max * 1.15;
    if (avgN > nThresh && !needsAutoclave) {
      trichoderma = true;
      eb *= 0.45;
    } else if (avgN > nThresh && needsAutoclave) {
      eb *= 0.8;
    } else if (needsAutoclave) eb *= 0.85;
    if (incompat.length) eb *= 0.9;
    if (tot < 95 || tot > 105) eb *= 0.95;
    var phF = 1;
    if (sp.ph_optimal) {
      if (avgPh < sp.ph_optimal.min) phF = Math.max(0.7, 1 - (sp.ph_optimal.min - avgPh) * 0.12);
      else if (avgPh > sp.ph_optimal.max) phF = Math.max(0.8, 1 - (avgPh - sp.ph_optimal.max) * 0.1);
    }
    var aerF = 1;
    if (densaP > 60 && airP < 10) aerF = 0.85;
    else if (densaP > 40 && airP < 8) aerF = 0.93;
    const isLigninSpp = ["shiitake", "reishi"].includes(sKey);
    var digF = isLigninSpp ? 1 : avgDig >= 6 ? 1 : Math.max(0.85, 1 - (6 - avgDig) * 0.03);
    eb = eb * phF * aerF * digF;
    var ebMods = { phF, aerF, digF };
    var ebCvVal = 0.18;
    if (ebMods.phF < 0.95) ebCvVal += 0.05;
    if (ebMods.aerF < 0.95) ebCvVal += 0.05;
    if (ebMods.digF < 0.95) ebCvVal += 0.04;
    if (incompat.length) ebCvVal += 0.08;
    if (suppP > sp.supplementation_max) ebCvVal += 0.1;
    if (trichoderma) ebCvVal = 0.5;
    ebCvVal = Math.min(trichoderma ? 0.5 : 0.4, ebCvVal);
    var ebLow = Math.round(eb * (1 - ebCvVal));
    var ebHigh = Math.round(eb * (1 + ebCvVal));
    var ebIndex = Math.round(Math.max(0, Math.min(100, (eb - sp.eb_baseline) / Math.max(1, sp.eb_optimal - sp.eb_baseline) * 100)));
    dynSpawn = Math.min(15, (sp.spawn_rate || 8) + Math.floor(suppP / 5));
  }
  const eucPct = recipe.reduce((s, r) => r.id === "aserrin_eucalipto" ? s + (parseFloat(r.p) || 0) : s, 0);
  const pescPct = recipe.reduce((s, r) => r.id === "harina_pescado" ? s + (parseFloat(r.p) || 0) : s, 0);
  return { tot, avgN, cn, cost, eb, suppP, baseP, addP, cafeP, manP, airP, densaP, incompat, sp, trichoderma, dynSpawn, avgPh, avgDig, avgCra, eucPct, pescPct, ebLow: typeof ebLow !== "undefined" ? ebLow : Math.round(eb), ebHigh: typeof ebHigh !== "undefined" ? ebHigh : Math.round(eb), ebIndex: typeof ebIndex !== "undefined" ? ebIndex : 0, ebMods: typeof ebMods !== "undefined" ? ebMods : null };
};
if (typeof window !== "undefined") {
  window.INGS = INGS;
  window.SPP = SPP;
  window.analyze = analyze;
}
if (typeof globalThis !== "undefined") {
  globalThis.INGS = INGS;
  globalThis.SPP = SPP;
  globalThis.analyze = analyze;
}
const MASS_BALANCE_TOL = 0.5;
const isMassBalanced = (a) => !!a && Math.abs(a.tot - 100) <= MASS_BALANCE_TOL;
const massBalanceMsg = (a) => {
  if (!a) return "";
  const d = a.tot - 100;
  if (Math.abs(d) <= MASS_BALANCE_TOL) return `Balance de masa: ${a.tot.toFixed(1)}% = 100% ✓`;
  return d < 0 ? `Balance de masa: ${a.tot.toFixed(1)}% − 100% = ${d.toFixed(1)} pp · faltan ${Math.abs(d).toFixed(1)}%` : `Balance de masa: ${a.tot.toFixed(1)}% − 100% = +${d.toFixed(1)} pp · sobran ${d.toFixed(1)}%`;
};
const diagnose = (a, sKey) => {
  if (!a) return { main: "Selecciona ingredientes para comenzar.", sugs: [] };
  const { tot, cn, avgN, suppP, baseP, addP, cafeP, airP, densaP, incompat, eb, sp, trichoderma, dynSpawn, avgPh, avgDig, avgCra, eucPct, pescPct } = a;
  const s = [];
  if (tot < 95) s.push({ t: "error", i: "⚠", tx: `Total ${tot.toFixed(1)}% — necesitas ${(100 - tot).toFixed(1)}% más.` });
  else if (tot > 105) s.push({ t: "error", i: "⚠", tx: `Total ${tot.toFixed(1)}% — reduce ${(tot - 100).toFixed(1)}%.` });
  if (sp) {
    if (cn < sp.cn_optimal.min) s.push({ t: "warning", i: "↓", tx: `C:N bajo (${cn.toFixed(1)}:1). Agrega base carbono. Objetivo ${sp.cn_optimal.min}–${sp.cn_optimal.max}:1.` });
    else if (cn > sp.cn_optimal.max) s.push({ t: "warning", i: "↑", tx: `C:N alto (${cn.toFixed(1)}:1). Agrega salvado o café.` });
    else s.push({ t: "success", i: "✓", tx: `C:N óptimo (${cn.toFixed(1)}:1) para ${sp.name}.` });
    if (trichoderma) s.push({ t: "error", i: "⚠", tx: `COLAPSO TRICHODERMA: N=${avgN.toFixed(2)}% supera umbral crítico sin autoclave. EB cae ~85%. Opciones: reducir N, usar autoclave 121°C×90min, spawn ${dynSpawn}%+.` });
    else if (avgN < sp.n_optimal.min) s.push({ t: "warning", i: "↓", tx: `Nitrógeno bajo (${avgN.toFixed(2)}%). Aumenta salvado o borra de café.` });
    else if (avgN > sp.n_optimal.max) s.push({ t: "warning", i: "↑", tx: `Nitrógeno elevado (${avgN.toFixed(2)}%). Riesgo moderado. Spawn ajustado: ${dynSpawn}%.` });
    else s.push({ t: "success", i: "✓", tx: `Nitrógeno óptimo (${avgN.toFixed(2)}%). Spawn dinámico: ${dynSpawn}%.` });
    if (suppP > sp.supplementation_max) s.push({ t: "error", i: "!", tx: `Suplementación ${suppP.toFixed(0)}% excede ${sp.supplementation_max}%. REQUIERE AUTOCLAVE 121°C×90min. Spawn: ${dynSpawn}%.` });
    if (sp.ph_optimal) {
      if (avgPh < sp.ph_optimal.min) s.push({ t: "error", i: "", tx: `pH estimado ${avgPh.toFixed(1)} — demasiado ácido para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Agrega carbonato de calcio o ceniza vegetal.` });
      else if (avgPh > sp.ph_optimal.max) s.push({ t: "warning", i: "", tx: `pH estimado ${avgPh.toFixed(1)} — ligeramente alcalino para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Reduce cal/yeso o agrega borra de café/aserrín.` });
      else s.push({ t: "success", i: "", tx: `pH estimado ${avgPh.toFixed(1)} — dentro del rango óptimo para ${sp.name} (${sp.ph_optimal.min}–${sp.ph_optimal.max}).` });
    }
  }
  if (baseP < 50) s.push({ t: "warning", i: "↓", tx: `Base carbono baja (${baseP.toFixed(0)}%). Mínimo 50%.` });
  if (addP < 2) s.push({ t: "warning", i: "!", tx: `Sin minerales. Agrega 2–4% carbonato/yeso.` });
  if (cafeP > 30) s.push({ t: "error", i: "!", tx: `Borra café ${cafeP.toFixed(0)}% — compactación. Máx 30%.` });
  if (eucPct > 20) s.push({ t: "warning", i: "⚠", tx: `Aserín de eucalipto ${eucPct.toFixed(0)}% — aceites esenciales (cineol, terpineol) reducen colonización 20–35%. Máximo recomendado: 20%.` });
  if (pescPct > 3) s.push({ t: "error", i: "⚠", tx: `Harina de pescado ${pescPct.toFixed(0)}% supera el 3% — riesgo elevado de ácaros y Sciaridae por olor. Reducir a ≤3% o eliminar.` });
  else if (cafeP > 0) s.push({ t: "success", i: "", tx: `Café en proporción saludable (${cafeP.toFixed(0)}%).` });
  if (densaP > 60 && airP < 10) s.push({ t: "error", i: "", tx: `Riesgo anaerobiosis: ${densaP.toFixed(0)}% material denso + solo ${airP.toFixed(0)}% aireador. Agrega 10–15% cascarilla de arroz o tamo.` });
  else if (densaP > 40 && airP < 8) s.push({ t: "warning", i: "", tx: `Estructura densa (${densaP.toFixed(0)}% fino, ${airP.toFixed(0)}% aireador). Agrega 8–10% cascarilla.` });
  else s.push({ t: "success", i: "", tx: `Buena aireación (${airP.toFixed(0)}% aireador). O₂ adecuado.` });
  const digLbl = avgDig >= 8 ? "Alta — colonización rápida (7–14 días)" : avgDig >= 5 ? "Media — colonización estándar (14–21 días)" : "Baja — sustrato lignificado (21–35+ días). Considera pretratamiento o esporas de Shiitake/Reishi.";
  s.push({ t: avgDig >= 8 ? "success" : avgDig >= 5 ? "warning" : "warning", i: "", tx: `Digestibilidad ${avgDig.toFixed(1)}/10 — ${digLbl}` });
  const craLbl = avgCra >= 4 ? "Alta — reduce agua de hidratación ~10%" : avgCra <= 2 ? "Baja — hidratar bien, revisar punto de campo" : null;
  if (craLbl) s.push({ t: "warning", i: "", tx: `CRA ${avgCra.toFixed(1)}/5 — ${craLbl}` });
  s.push({ t: "success", i: "△", tx: `Tenjo 2.580 msnm: humedad objetivo 67–68%. Pasteurización sin presión: +25% tiempo. CWLP: pH≥12.` });
  if (incompat.length) s.push({ t: "warning", i: "!", tx: `No ideales para ${sp?.name}: ${incompat.join(", ")}.` });
  if (a.ebMods) {
    const m = a.ebMods, pen = [];
    if (m.phF < 1) pen.push(`pH −${Math.round((1 - m.phF) * 100)}%`);
    if (m.aerF < 1) pen.push(`aireación −${Math.round((1 - m.aerF) * 100)}%`);
    if (m.digF < 1) pen.push(`digestibilidad −${Math.round((1 - m.digF) * 100)}%`);
    if (pen.length) s.push({ t: "warning", i: "⚙", tx: `EB ajustada por: ${pen.join(", ")}. Corrige estos factores para acercarte al EB máximo de la especie.` });
  }
  let main = "";
  if (s.filter((x) => x.t === "error").length) main = "Problemas críticos. Revisar antes de continuar.";
  else if (s.filter((x) => x.t === "warning").length > 2) main = "Receta funcional con margen de optimización.";
  else if (eb > 100) main = "Receta excelente — eficiencia biológica esperada superior al promedio.";
  else if (eb > 80) main = "Receta satisfactoria para producción estándar.";
  else main = "Receta funcional. Revisar sugerencias.";
  return { main, sugs: s };
};
const {
  setPctProportional,
  solveTargetPct,
  normalizeRecipe,
  capFreeIngredient,
  ROLE_CAP_ADD,
  ROLE_CAP_INCREASE,
  capForRole,
  applyOptToRecipe,
  calcMaxBatchFromStock,
  quantifyItem,
  generateOptimizer,
  ENERGY_COST,
  energyCostPerKgSeco,
  calcTreatment,
  OPT_PROFILES
} = typeof SetasRecipeOptimizer !== "undefined" ? SetasRecipeOptimizer : typeof require !== "undefined" ? require("./recipe-optimizer.js") : {};
const { bitacoraEBRows, historicalEB } = typeof SetasHistoricalCalibration !== "undefined" ? SetasHistoricalCalibration : typeof require !== "undefined" ? require("./historical-calibration.js") : {};
const METRIC_LABEL = { cn: "C:N", n: "N", ph: "pH" };
const fmtMetric = (metric, v) => metric === "cn" ? `${v.toFixed(1)}:1` : metric === "n" ? `${v.toFixed(2)}%` : v.toFixed(1);
const scoreAn = (an, extraCtx = {}) => {
  if (!an || !an.sp) return { score: 0, status: "sin_receta", breakdown: null, weights: null, caps: null };
  const sev = SetasScoring.assessSeverity(an);
  return SetasScoring.scoreRecipe(an, { ...extraCtx, criticals: sev.criticals, warnings: sev.warnings, severity: sev.severity });
};
const DEFAULT_FRESH_PRICES = {
  p_ostreatus_gris: 2e4,
  p_ostreatus_blanco: 22e3,
  p_djamor_rosa: 25e3,
  p_eryngii: 35e3,
  shiitake: 38e3,
  lions_mane: 55e3,
  reishi: 6e4,
  enoki: 28e3,
  nameko: 32e3
};
const calcBatch = (recipe, n, kg, hObj = 67, spawnCostKg = 12e3, ings = INGS, dynSpawn = 8, tr = null, eb = null, sKey = "p_ostreatus_gris", customFreshPrice = null, customBagConsumable = 300) => {
  if (!recipe.length || !n || !kg) return null;
  const wet = n * kg;
  const hF = Math.min(0.85, Math.max(0.4, hObj / 100));
  const dry = wet * (1 - hF);
  const spawnRate = Math.min(0.15, Math.max(0.05, dynSpawn / 100));
  const items = recipe.map((r) => {
    const g = ings.find((i) => i.id === r.id);
    if (!g) return null;
    const masaSeca = dry * (parseFloat(r.p) / 100);
    const m = Math.min(0.92, Math.max(0, (g.moisture || 0) / 100));
    const kr = masaSeca / (1 - m);
    const aguaOculta = kr * m;
    return { name: g.name, kr, masaSeca, aguaOculta, cost: kr * g.cost, unit: kr < 0.5 ? `${Math.round(kr * 1e3)} g` : `${kr.toFixed(2)} kg` };
  }).filter(Boolean);
  const aguaTot = dry * (hF / (1 - hF));
  const aguaInh = items.reduce((s, i) => s + i.aguaOculta, 0);
  const agua = Math.max(0, aguaTot - aguaInh);
  const kgComercialTotal = items.reduce((s, i) => s + i.kr, 0);
  const sustCost = items.reduce((s, i) => s + i.cost, 0);
  const spawnKg = wet * spawnRate;
  const spawnCostTotal = spawnKg * spawnCostKg;
  const energyCostKgSeco = tr?.energy?.cop_per_kg_seco || 0;
  const energyCostTotal = dry * energyCostKgSeco;
  const bagConsumableCostUnit = customBagConsumable != null ? customBagConsumable : 300;
  const bagConsumableCostTotal = n * bagConsumableCostUnit;
  const totalCost = sustCost + spawnCostTotal + energyCostTotal + bagConsumableCostTotal;
  const costPerBag = n > 0 ? totalCost / n : 0;
  const dryPerBag = n > 0 ? dry / n : 0;
  const ebRate = Math.max(0, (eb != null ? eb : 85) / 100);
  const projectedFreshKgPerBag = dryPerBag * ebRate;
  const projectedFreshKgTotal = dry * ebRate;
  const freshPriceKg = customFreshPrice || DEFAULT_FRESH_PRICES[sKey] || 22e3;
  const projectedRevenuePerBag = projectedFreshKgPerBag * freshPriceKg;
  const projectedGrossMarginPerBag = projectedRevenuePerBag - costPerBag;
  const projectedMarginPct = projectedRevenuePerBag > 0 ? projectedGrossMarginPerBag / projectedRevenuePerBag * 100 : 0;
  const productionCostPerKgFresh = projectedFreshKgPerBag > 0 ? costPerBag / projectedFreshKgPerBag : 0;
  return {
    items,
    wet,
    dry,
    kgComercialTotal,
    aguaTot,
    aguaInh,
    cost: sustCost,
    spawn: spawnKg,
    spawnCostTotal,
    energyCostTotal,
    energyCostKgSeco,
    bagConsumableCostUnit,
    bagConsumableCostTotal,
    totalCost,
    costPerBag,
    agua,
    hObj,
    dryPerBag,
    ebRate,
    projectedFreshKgPerBag,
    projectedFreshKgTotal,
    freshPriceKg,
    projectedRevenuePerBag,
    projectedGrossMarginPerBag,
    projectedMarginPct,
    productionCostPerKgFresh,
    costBreakdown: {
      sustrato: sustCost,
      spawn: spawnCostTotal,
      energia: energyCostTotal,
      consumibles: bagConsumableCostTotal
    },
    costBreakdownPerBag: {
      sustrato: n > 0 ? sustCost / n : 0,
      spawn: n > 0 ? spawnCostTotal / n : 0,
      energia: n > 0 ? energyCostTotal / n : 0,
      consumibles: bagConsumableCostUnit
    }
  };
};
const calcSchedule = (sKey, dateStr, eb) => {
  const sp = SPP[sKey];
  if (!sp || !dateStr) return null;
  const base = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
  const add = (d2, n) => {
    const r = new Date(d2);
    r.setDate(r.getDate() + n);
    return r;
  };
  const fmt = (d2) => d2.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
  const T = { p_ostreatus_gris: { c50: 12, c100: 22, pr: 28, f1: 35, f2: 52, f3: 68 }, p_ostreatus_blanco: { c50: 14, c100: 26, pr: 32, f1: 40, f2: 57, f3: 74 }, p_djamor_rosa: { c50: 14, c100: 28, pr: 34, f1: 42, f2: 59, f3: 76 }, p_eryngii: { c50: 18, c100: 32, pr: 40, f1: 48, f2: 66, f3: 84 }, shiitake: { c50: 30, c100: 55, pr: 75, f1: 90, f2: 115, f3: 140 }, lions_mane: { c50: 20, c100: 35, pr: 42, f1: 50, f2: 68, f3: 86 }, reishi: { c50: 25, c100: 50, pr: 80, f1: 120, f2: 160, f3: 200 }, enoki: { c50: 15, c100: 28, pr: 35, f1: 42, f2: 58, f3: 74 }, nameko: { c50: 20, c100: 38, pr: 48, f1: 60, f2: 80, f3: 100 } };
  const d = T[sKey] || T.p_ostreatus_gris;
  const adj = (n) => Math.round(n / Math.max(0.85, Math.min(1.2, (eb || 100) / 100)));
  const COLD_SENSITIVE = { p_djamor_rosa: "28–30°C" };
  const coldWarn = COLD_SENSITIVE[sKey] ? ` ⚠️ Especie sensible al frío: requiere ${COLD_SENSITIVE[sKey]}. El clima ambiente de la Sabana/Tenjo (~14–18°C) no alcanza este rango — usa cámara de fructificación con control térmico activo (>22°C), no fructificación pasiva a temperatura ambiente.` : "";
  const evts = [
    { key: "in", type: "inoculation", day: 0, title: "Inoculación", detail: `Empacar bolsas. Spawn ${sp.spawn_rate}%.` },
    { key: "c5", type: "normal", day: adj(d.c50), title: "Colonización 50%", detail: "Micelio blanco visible en la bolsa." },
    { key: "c1", type: coldWarn ? "warning" : "normal", day: adj(d.c100), title: "Colonización completa", detail: `Pasar a cámara de fructificación. ${sp.temp_fruit}.${coldWarn}` },
    { key: "pr", type: "normal", day: adj(d.pr), title: "Primordios", detail: "HR 90–95%. Abrir bolsa o cortar." },
    { key: "f1", type: "harvest", day: adj(d.f1), title: "Primera cosecha", detail: `~${eb ? (eb * 0.55).toFixed(0) : "?"}% EB.` },
    { key: "f2", type: "harvest", day: adj(d.f2), title: "Segunda cosecha", detail: `~${eb ? (eb * 0.35).toFixed(0) : "?"}% EB.` },
    { key: "f3", type: "harvest", day: adj(d.f3), title: "Tercera cosecha", detail: "Evaluar si compostar el bloque." }
  ];
  return { evts: evts.map((e) => ({ ...e, ds: fmt(add(base, e.day)) })), tot: adj(d.f3), first: fmt(add(base, adj(d.f1))), inc: adj(d.c100) };
};
const PasteGuide = ({ tr, recipe, numBags, kgBag }) => {
  if (!tr) return null;
  const wet = (numBags * kgBag).toFixed(1);
  const guides = {
    autoclave: [
      { n: 1, t: "Empaque las bolsas", d: `Llena cada bolsa PP hasta ${kgBag} kg de sustrato húmedo. Cierra con filtro 0.2 µm o algodón + papel kraft + cinta autoclave. No comprimas.` },
      { n: 2, t: "Carga el autoclave", d: "Apila las bolsas sin sobrecargar. Deja espacio para circulación de vapor. Coloca indicador de esterilización (tira o pellet)." },
      { n: 3, t: "Purga de aire", d: "Al iniciar, abre la válvula de purga 2–3 min para expulsar el aire frío. El vapor debe salir continuo antes de cerrar." },
      { n: 4, t: "Esteriliza", d: `Mantén 121°C / 18.5–19 PSI manométricos durante 90–120 min. A 2.580 msnm 15 PSI NO alcanzan 121°C reales — usa 18.5–19 PSI manométricos, o valida con sensor de núcleo que el sustrato llegue a 121°C real.` },
      { n: 5, t: "Enfría (crítico)", d: `Deja enfriar dentro del autoclave apagado. Saca las bolsas cuando estén a <35°C (mínimo 4–6 h). Nunca abras caliente — la condensación abre los poros y contamina.` },
      { n: 6, t: "Inocula en condiciones estériles", d: `Usa cámara de flujo laminar o caja SAB. Alcohol 70% en todas las superficies. Spawn rate: ${tr.spawn}%. Sella inmediatamente.` }
    ],
    thermal: [
      { n: 1, t: "Prepara el baño de pasteurización", d: `Calienta agua para sumergir ${wet} kg de sustrato. Usa termómetro calibrado de pincho. En Tenjo (2.580 msnm) el agua hierve a ~91°C: el calor llega más lento al núcleo, por eso se trabaja por tiempo extendido y se mide el centro de la masa, no solo el agua.` },
      { n: 2, t: "Sumerge el sustrato", d: "Introduce el sustrato en bolsas o costales permeables. Asegura que todo quede bajo el agua con un peso. Sin burbujas de aire atrapadas." },
      { n: 3, t: "Pasteuriza por núcleo", d: `Sostén el NÚCLEO del sustrato entre 65–75°C durante 6–8 h (base 5–6 h +25% por altitud). Clava el termómetro en el centro de la masa y verifica cada 20 min — el agua puede estar más caliente que el núcleo. No superes 80°C: por encima se esteriliza de más y se pierde la microbiota protectora.` },
      { n: 4, t: "Enfría tapado", d: "Escurre y deja enfriar en lugar limpio tapado con plástico. No muevas hasta que esté <30°C (mínimo 3–4 h en ambiente Tenjo 14°C)." },
      { n: 5, t: "Prueba de campo", d: "Aprieta un puñado — debe caer máximo 1–2 gotas de agua. Si chorrea, escurre más. Si no sale nada, agrega agua." },
      { n: 6, t: "Inocula", d: `Spawn rate: ${tr.spawn}%. Mezcla bien o distribuye en capas. Cierra con polyfil o filtro. Registra fecha y lote.` }
    ],
    cwlp: [
      { n: 1, t: "Prepara la solución de cal", d: `Disuelve 150–200 g de cal hidratada por cada 100 L de agua. Mezcla bien y verifica pH ≥ 12 con tira indicadora (pH 12–13 es el rango activo contra patógenos). A 2.580 msnm CWLP funciona igual que a nivel del mar — independiente de temperatura.` },
      { n: 2, t: "Sumerge el sustrato", d: `Introduce ${wet} kg de sustrato. Usa pesos para mantenerlo sumergido. Todo debe estar en contacto con la solución — sin partes secas.` },
      { n: 3, t: "Tiempo de inmersión", d: "Mantén sumergido 18–24 horas. No es necesario calentar. La alcalinidad (no el calor) es el agente sanitizante." },
      { n: 4, t: "Escurre y neutraliza", d: "Saca y escurre bien. Si el pH final del sustrato es >9, enjuaga brevemente con agua limpia. El pH objetivo del sustrato escurrido es 7–8." },
      { n: 5, t: "Punto de campo", d: "Misma prueba: 1–2 gotas al apretar. En Tenjo el aire seco acelera el secado — a veces hay que agregar agua después del escurrido." },
      { n: 6, t: "Inocula", d: `Spawn rate: ${tr.spawn}%. Inocula máximo 2–3 h después de escurrir. Tiempo de exposición al aire aumenta riesgo de recontaminación.` }
    ]
  };
  const steps = guides[tr.col] || [];
  return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, background: "var(--paper-200)", border: "1px solid var(--border-soft)", padding: "var(--space-4)" } }, /* @__PURE__ */ React.createElement("div", { className: "sec" }, "Guía de ", tr.name, " · Tenjo 2.580 msnm"), steps.map((st) => /* @__PURE__ */ React.createElement("div", { key: st.n, style: { display: "flex", gap: 14, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 28, fontWeight: 300, color: "var(--coral-500)", lineHeight: 1, minWidth: 32, paddingTop: 2 } }, st.n), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-900)", marginBottom: 4 } }, st.t), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-base)", color: "var(--ink-700)", lineHeight: 1.55 } }, st.d)))));
};
const RadarChart = ({ an, cAn, sKey, cmpKey }) => {
  if (!an || !an.sp) return null;
  const spA = an.sp, spB = cAn && cAn.sp ? cAn.sp : spA;
  const norm = (v, min, max) => Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  const axes = [
    { label: "C:N", va: norm(an.cn, spA.cn_optimal.min, spA.cn_optimal.max * (1 + 0.3)), vb: cAn ? norm(cAn.cn, spB.cn_optimal.min, spB.cn_optimal.max * (1 + 0.3)) : 0, inv: true },
    { label: "N%", va: norm(an.avgN, spA.n_optimal.min * 0.5, spA.n_optimal.max * 1.3), vb: cAn ? norm(cAn.avgN, spB.n_optimal.min * 0.5, spB.n_optimal.max * 1.3) : 0, inv: false },
    { label: "EB%", va: norm(an.eb, spA.eb_baseline * 0.5, spA.eb_optimal * 1.1), vb: cAn ? norm(cAn.eb, spB.eb_baseline * 0.5, spB.eb_optimal * 1.1) : 0, inv: false },
    { label: "Costo", va: 1 - norm(an.cost, 0, 3e3), vb: cAn ? 1 - norm(cAn.cost, 0, 3e3) : 0, inv: false },
    { label: "pH", va: an.sp.ph_optimal ? norm(an.avgPh, an.sp.ph_optimal.min, an.sp.ph_optimal.max) : 0.5, vb: cAn && cAn.sp && cAn.sp.ph_optimal ? norm(cAn.avgPh, cAn.sp.ph_optimal.min, cAn.sp.ph_optimal.max) : 0.5, inv: false },
    { label: "Digest.", va: norm(an.avgDig, 0, 10), vb: cAn ? norm(cAn.avgDig, 0, 10) : 0, inv: false }
  ];
  const N = axes.length;
  const cx = 150, cy = 150, r = 100;
  const angle = (i) => i * 2 * Math.PI / N - Math.PI / 2;
  const pt = (i, v) => [cx + r * v * Math.cos(angle(i)), cy + r * v * Math.sin(angle(i))];
  const rings = [0.25, 0.5, 0.75, 1];
  const polyA = axes.map((ax, i) => pt(i, ax.va)).map((p) => p.join(",")).join(" ");
  const polyB = axes.map((ax, i) => pt(i, ax.vb)).map((p) => p.join(",")).join(" ");
  const [fullscreen, setFullscreen] = React.useState(false);
  const RadarSVG = ({ size = 260 }) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 300 300", width: size, height: size, style: { overflow: "visible" } }, rings.map((rv) => /* @__PURE__ */ React.createElement(
    "polygon",
    {
      key: rv,
      points: axes.map((_, i) => pt(i, rv).join(",")).join(" "),
      fill: "none",
      stroke: "var(--border-soft)",
      strokeWidth: rv === 1 ? 1.5 : 0.8,
      strokeDasharray: rv < 1 ? "3,3" : "none"
    }
  )), axes.map((_, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: cx, y1: cy, x2: pt(i, 1)[0], y2: pt(i, 1)[1], stroke: "var(--border-soft)", strokeWidth: "0.8" })), /* @__PURE__ */ React.createElement("polygon", { points: polyA, fill: "rgba(184,97,77,0.15)", stroke: "var(--coral-700)", strokeWidth: "2", strokeLinejoin: "round" }), cAn && /* @__PURE__ */ React.createElement("polygon", { points: polyB, fill: "rgba(42,90,139,0.12)", stroke: "var(--accent-blue-grey)", strokeWidth: "2", strokeLinejoin: "round", strokeDasharray: "5,3" }), axes.map((ax, i) => {
    const p = pt(i, 1.18);
    const ta = Math.cos(angle(i)) > 0.1 ? "start" : Math.cos(angle(i)) < -0.1 ? "end" : "middle";
    return /* @__PURE__ */ React.createElement(
      "text",
      {
        key: i,
        x: p[0],
        y: p[1],
        textAnchor: ta,
        dominantBaseline: "middle",
        fontFamily: "var(--font-body)",
        fontSize: "9",
        fill: "var(--ink-500)",
        letterSpacing: ".08em",
        textTransform: "uppercase"
      },
      ax.label
    );
  }), axes.map((ax, i) => {
    const pa = pt(i, ax.va);
    return /* @__PURE__ */ React.createElement("circle", { key: i, cx: pa[0], cy: pa[1], r: "3.5", fill: "var(--coral-700)" });
  }), cAn && axes.map((ax, i) => {
    const pb = pt(i, ax.vb);
    return /* @__PURE__ */ React.createElement("circle", { key: i, cx: pb[0], cy: pb[1], r: "3", fill: "none", stroke: "var(--accent-blue-grey)", strokeWidth: "2" });
  }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: "3", fill: "var(--border-soft)" }), /* @__PURE__ */ React.createElement("rect", { x: "6", y: "6", width: "10", height: "10", fill: "rgba(184,97,77,0.3)", stroke: "var(--coral-700)", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("text", { x: "20", y: "14", fontFamily: "var(--font-mono)", fontSize: "9", fill: "var(--ink-900)" }, "Receta A"), cAn && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "6", y: "22", width: "10", height: "2", fill: "none", stroke: "var(--accent-blue-grey)", strokeWidth: "2", strokeDasharray: "4,2" }), /* @__PURE__ */ React.createElement("text", { x: "20", y: "27", fontFamily: "var(--font-mono)", fontSize: "9", fill: "var(--ink-900)" }, "Receta B")));
  if (fullscreen) return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: "var(--z-overlay)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setFullscreen(false), "aria-label": "Cerrar vista de radar", style: { position: "absolute", top: 20, right: 20, fontSize: 28, background: "none", border: "none", color: "var(--paper-0)", cursor: "pointer", minWidth: 44, minHeight: 44 } }, "✕"), /* @__PURE__ */ React.createElement(RadarSVG, { size: 600 }), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--paper-0)", textAlign: "center" } }, "Presiona Esc o haz clic en ✕ para cerrar"));
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--space-5) 0 var(--space-4)", background: "var(--paper-200)", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(RadarSVG, { size: 260 }), /* @__PURE__ */ React.createElement("button", { onClick: () => setFullscreen(true), style: { marginTop: 12, fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "var(--space-2) var(--space-3)", background: "var(--coral-500)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", letterSpacing: "var(--tracking-label)" } }, "⛶ Pantalla completa"));
};
const NitrogenChart = ({ recipe }) => {
  if (!recipe || !recipe.length) return null;
  const items = recipe.map((r) => {
    const g = INGS.find((i) => i.id === r.id);
    if (!g || !g.cn || !g.n) return null;
    const contrib = g.n * (parseFloat(r.p) || 0) / 100;
    return contrib > 0 ? { name: g.name, contrib } : null;
  }).filter(Boolean).sort((a, b) => b.contrib - a.contrib);
  const total = items.reduce((s, i) => s + i.contrib, 0);
  if (!total || items.length === 0) return null;
  const PAL = ["var(--coral-700)", "var(--accent-olive)", "var(--ochre-600)", "var(--accent-blue-grey)", "var(--accent-terracotta)", "var(--moss-700)", "var(--ochre-500)", "var(--slate-600,var(--accent-blue-grey))", "var(--coral-700)", "var(--moss-500)"];
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20, background: "var(--paper-100)", border: "1px solid var(--border-soft)", padding: "14px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 10 } }, "Contribución de Nitrógeno por ingrediente"), /* @__PURE__ */ React.createElement("div", { style: { height: 18, display: "flex", borderRadius: 2, overflow: "hidden", marginBottom: 11, border: "1px solid rgba(0,0,0,.07)" } }, items.map((it, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      title: `${it.name}: ${(it.contrib / total * 100).toFixed(1)}% del N total`,
      style: { width: `${it.contrib / total * 100}%`, background: PAL[i % PAL.length], transition: "width .35s", minWidth: it.contrib / total > 0.01 ? 2 : 0 }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "5px 16px" } }, items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 9, height: 9, background: PAL[i % PAL.length], flexShrink: 0, border: "1px solid rgba(0,0,0,.1)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", fontWeight: 500 } }, it.name.length > 22 ? it.name.slice(0, 22) + "…" : it.name, " ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--ink-900)" } }, (it.contrib / total * 100).toFixed(1), "%"))))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 9, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", borderTop: "1px solid var(--paper-300)", paddingTop: 7 } }, "N absoluto en sustrato: ", total.toFixed(3), " g/100g (masa seca)"));
};
const FlushChart = ({ an }) => {
  if (!an || !an.eb || an.eb < 10) return null;
  const eb = an.eb;
  const ebLow = an.ebLow ?? Math.round(eb * 0.82);
  const ebHigh = an.ebHigh ?? Math.round(eb * 1.18);
  const flushes = [
    { label: "1ª", sub: "Cosecha", pct: 0.55, days: "35–45 d", color: "var(--coral-500)", bg: "rgba(184,97,77,.08)" },
    { label: "2ª", sub: "Cosecha", pct: 0.3, days: "55–70 d", color: "var(--accent-olive)", bg: "rgba(77,98,53,.07)" },
    { label: "3ª", sub: "Cosecha", pct: 0.15, days: "75–95 d", color: "var(--ochre-500,#A07828)", bg: "rgba(160,120,40,.07)" }
  ];
  const maxPct = flushes[0].pct;
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16, background: "var(--paper-50,var(--paper-100))", border: "1px solid var(--border-soft)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px 8px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-400)", fontWeight: 600 } }, "Proyección de cosechas"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", fontWeight: 700 } }, "EB ", ebLow, "–", ebHigh, "%")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0 } }, flushes.map((f, i) => {
    const val = eb * f.pct;
    const barH = Math.round(f.pct / maxPct * 72);
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, borderRight: i < 2 ? "1px solid var(--border-soft)" : "none", padding: "12px 12px 10px", background: f.bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: f.color, fontWeight: 700, opacity: 0.85 } }, f.label, " ", f.sub), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, lineHeight: 1, color: f.color, letterSpacing: "var(--tracking-tight)" } }, val.toFixed(0), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-base)", fontWeight: 400, opacity: 0.7 } }, "%")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", letterSpacing: "var(--tracking-label)" } }, (val / 100).toFixed(2), " kg/kg"), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", marginTop: 6, height: 4, background: "rgba(0,0,0,.07)", borderRadius: 2, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${f.pct / maxPct * 100}%`, background: f.color, borderRadius: 2, transition: "width .6s cubic-bezier(.4,0,.2,1)" } })), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)", marginTop: 1 } }, f.days));
  })), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 14px", borderTop: "1px solid var(--border-soft)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)", background: "var(--paper-100)" } }, "Distribución 55/30/15% · ±", Math.round((ebHigh - ebLow) / 2 / eb * 100), "% incertidumbre · por kg sustrato seco"));
};
const CompositionChart = ({ recipe }) => {
  if (!recipe || !recipe.length) return null;
  const ROLE_LABELS = { base_carbono: "Base C", suplemento_n: "Supl. N", suplemento_medio: "Supl. Medio", aireador: "Aireador", aditivo_ph: "pH", aditivo_estructura: "Estructura", aditivo_micronutriente: "Micronut.", aditivo_arrancador: "Arrancador" };
  const ROLE_COLORS = { base_carbono: "#5A7042", suplemento_n: "#C68F2C", suplemento_medio: "#D4A838", aireador: "#4E7A6A", aditivo_ph: "#8B5C28", aditivo_estructura: "#7A6B58", aditivo_micronutriente: "#2A6A7A", aditivo_arrancador: "#9B4F3A" };
  const groups = {};
  recipe.forEach((r) => {
    const g = INGS.find((i) => i.id === r.id);
    if (!g) return;
    const role = g.role || "base_carbono";
    groups[role] = (groups[role] || 0) + (parseFloat(r.p) || 0);
  });
  const total = Object.values(groups).reduce((s, v) => s + v, 0);
  if (!total) return null;
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16, padding: "14px 16px", background: "var(--paper-100)", border: "1px solid var(--border-soft)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 10 } }, "Composición por función"), /* @__PURE__ */ React.createElement("div", { style: { height: 18, display: "flex", borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,.07)", marginBottom: 10 } }, entries.map(([role, val], i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      title: `${ROLE_LABELS[role] || role}: ${val.toFixed(1)}%`,
      style: { width: `${val / total * 100}%`, background: ROLE_COLORS[role] || "var(--ink-2)", transition: "width .4s" }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px 14px" } }, entries.map(([role, val], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 9, height: 9, background: ROLE_COLORS[role] || "var(--ink-2)", flexShrink: 0, border: "1px solid rgba(0,0,0,.1)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", fontWeight: 500 } }, ROLE_LABELS[role] || role, " ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--ink-900)" } }, val.toFixed(1), "%"))))));
};
const SpeciesGuide = ({ sKey, sp, recipe, onAddIngredient, onRemoveIngredient }) => {
  const [open, setOpen] = useState(false);
  const [showCompat, setShowCompat] = useState(false);
  if (!sp || !sKey) return null;
  const guia = SPP_SUBSTRATE_GUIDE[sKey] || [];
  const diff = SPP_DIFFICULTY[sKey] || "Media";
  const band = BANDS[sKey] || "var(--ink-700)";
  const recipeIds = new Set((recipe || []).map((r) => r.id));
  const num = String(Object.keys(SPP).indexOf(sKey) + 1).padStart(2, "0");
  const code = SPP_CODE[sKey] || "—";
  const family = SPP_FAMILY[sKey] || "";
  const img = IMG[sKey];
  const recIng = INGS.filter((i) => i.cs && i.cs.includes(sKey) && i.cn > 0);
  const bycat = {};
  recIng.forEach((i) => {
    const roleKey = ["aditivo_ph", "aditivo_estructura", "aditivo_micronutriente", "aditivo_arrancador"].includes(i.role) ? "aditivo_correctores" : i.role;
    if (!bycat[roleKey]) bycat[roleKey] = [];
    bycat[roleKey].push(i);
  });
  const catOrder = ["base_carbono", "suplemento_n", "suplemento_medio", "aireador", "aditivo_correctores"];
  const catLabels2 = { base_carbono: "Carbono", suplemento_n: "N alto", suplemento_medio: "N medio", aireador: "Aireación", aditivo_correctores: "Correctores" };
  const catEntries = catOrder.filter((k) => bycat[k]).map((k) => [k, bycat[k]]);
  if (!open) return /* @__PURE__ */ React.createElement("button", { type: "button", "aria-expanded": "false", style: { position: "sticky", top: 54, zIndex: "var(--z-sticky-panel)", width: "100%", marginBottom: 12, borderRadius: 5, border: `1px solid color-mix(in oklab,${band} 30%,rgba(26,20,16,0.11))`, background: `color-mix(in oklab,${band} 5%,var(--paper-50))`, boxShadow: "0 1px 4px rgba(26,20,16,0.07)", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", font: "inherit", textAlign: "left" }, onClick: () => setOpen(true), title: "Ver guía de especie" }, /* @__PURE__ */ React.createElement("div", { style: { width: 20, height: 4, borderRadius: 2, background: band, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "Guía de especie"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: band, opacity: 0.8 } }, "ver ▼")), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-md)", color: `color-mix(in oklab,${band} 85%,var(--ink-900))` } }, sp.name));
  return /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 54, zIndex: "var(--z-sticky-panel)", marginBottom: 12, borderRadius: 5, border: "1px solid rgba(26,20,16,0.11)", boxShadow: "0 1px 6px rgba(26,20,16,0.08)", background: "var(--paper-50)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "p-family-strip", style: { background: `color-mix(in oklab,${band} 10%,var(--paper-100))`, borderRight: `1px solid color-mix(in oklab,${band} 25%,transparent)` } }, /* @__PURE__ */ React.createElement("span", { style: { color: band } }, family)), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: 15 } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "p-arch-head", "aria-expanded": "true", style: { marginLeft: 0, cursor: "pointer", width: "100%", border: 0, background: "transparent", font: "inherit", textAlign: "left" }, onClick: () => setOpen((o) => !o) }, /* @__PURE__ */ React.createElement("div", { className: "p-arch-left" }, /* @__PURE__ */ React.createElement("span", { className: "p-arch-num", style: { color: band } }, num), /* @__PURE__ */ React.createElement("span", { className: "p-arch-code" }, code)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: band, opacity: 0.7 } }, "Guía de especie"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, "▲"))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", borderBottom: "1px solid rgba(26,20,16,0.07)", overflow: "hidden", minHeight: img ? 140 : 70 } }, img && /* @__PURE__ */ React.createElement("img", { src: img, alt: sp.name, width: "320", height: "240", style: { position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", height: "160%", width: "auto", maxWidth: "55%", objectFit: "contain", objectPosition: "right center", filter: "saturate(.45) contrast(1.08)", mixBlendMode: "multiply", opacity: 0.55, pointerEvents: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px 16px", position: "relative", zIndex: "var(--z-local)", maxWidth: img ? "60%" : "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sci)", fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--ink-400)", marginBottom: 3, letterSpacing: "var(--tracking-label)" } }, sp.scientific), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 36, color: `color-mix(in oklab,${band} 90%,var(--ink-900))`, lineHeight: 0.9, letterSpacing: "var(--tracking-tight)", marginBottom: open ? 8 : 0 } }, sp.name), open && sp.notes && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-600)", lineHeight: 1.5, textWrap: "pretty", marginTop: 5, maxWidth: 300 } }, sp.notes))), open && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "p-chips", style: { marginLeft: 0, paddingTop: 0, borderTop: "none" } }, /* @__PURE__ */ React.createElement("div", { className: "p-chips-row", style: { gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(26,20,16,0.1)" } }, /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "C:N"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, sp.cn_optimal.min, "–", sp.cn_optimal.max))), /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "N%"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, sp.n_optimal.min, "–", sp.n_optimal.max))), /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "pH"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, sp.ph_optimal.min, "–", sp.ph_optimal.max))), /* @__PURE__ */ React.createElement("div", { className: "p-chip", style: { borderRight: "none" } }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "Humedad"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, sp.moisture.ideal, "%")))), /* @__PURE__ */ React.createElement("div", { className: "p-chips-row", style: { gridTemplateColumns: "1fr 1fr 1fr 1fr" } }, /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "Temp."), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, sp.temp_fruit))), /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "EB"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, sp.eb_baseline, "–", sp.eb_optimal, "%"))), /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "Dificultad"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, diff))), /* @__PURE__ */ React.createElement("div", { className: "p-chip", style: { borderRight: "none" } }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "Spawn"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, sp.spawn_rate, "%"))))), guia.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "sguide-section" }, /* @__PURE__ */ React.createElement("div", { className: "sguide-section-lbl" }, "Criterios de formulación"), /* @__PURE__ */ React.createElement("div", { className: "sguide-hechos" }, guia.map((h, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "sguide-hecho" }, /* @__PURE__ */ React.createElement("span", { className: "sguide-hecho-n" }, i + 1, "."), /* @__PURE__ */ React.createElement("span", { className: "sguide-hecho-txt" }, h))))))));
};
const SpeciesRecommender = ({ recipe }) => {
  if (!recipe || !recipe.length) return null;
  const scores = Object.entries(SPP).map(([key, sp]) => {
    const a = analyze(recipe, key);
    return { key, sp, score: a ? scoreAn(a).score : 0, eb: a ? a.eb : 0 };
  }).sort((a, b) => b.score - a.score);
  const maxScore = scores[0]?.score || 1;
  const bandColors = Object.fromEntries(Object.entries(BANDS));
  return /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "var(--paper-100)", border: "1px solid var(--border-soft)", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 10 } }, "Compatibilidad por especie"), scores.map(({ key, sp, score, eb }, i) => {
    const col = bandColors[key] || "var(--ink-2)";
    return /* @__PURE__ */ React.createElement("div", { key, className: "spr-row" }, /* @__PURE__ */ React.createElement("div", { className: "spr-rank" }, i + 1), /* @__PURE__ */ React.createElement("div", { style: { width: 10, height: 10, background: col, borderRadius: "50%", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-900)" } }, sp.name), /* @__PURE__ */ React.createElement("div", { className: "spr-bar" }, /* @__PURE__ */ React.createElement("div", { className: "spr-fill", style: { width: `${maxScore > 0 ? score / maxScore * 100 : 0}%`, background: col } })), /* @__PURE__ */ React.createElement("div", { className: "spr-score", style: { color: i === 0 ? col : "var(--ink-900)" } }, score), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--border-soft)", minWidth: 48, textAlign: "right" } }, "EB ", eb.toFixed(0), "%"));
  }));
};
const PERITO_STATUS = {
  excellent: { label: "Apta", veredicto: "Apta", accion: "Producir normalmente.", bg: "#EDF4E8", border: "#7FA05A", badge: "var(--accent-olive)", txt: "#3D4A38" },
  good: { label: "Apta con ajustes", veredicto: "Apta con ajustes", accion: "Aplicar las mejoras del Perito antes de escalar.", bg: "#F5F0E0", border: "#C8A840", badge: "#7A5A10", txt: "#5A4010" },
  needs_work: { label: "Experimental", veredicto: "Experimental", accion: "Máximo 3–5 bolsas de prueba. Registrar colonización al día 7, 14 y 21.", bg: "#FBF0E8", border: "#C87040", badge: "#8C4020", txt: "#6A3010" },
  critical: { label: "No ejecutar", veredicto: "No ejecutar — Riesgo alto", accion: "Corregir problemas críticos antes de cualquier producción.", bg: "#FBE8E8", border: "#C53030", badge: "#8B1A1A", txt: "#6A0000" },
  sin_receta: { label: "—", veredicto: "—", accion: "", bg: "var(--paper-50)", border: "var(--border-soft)", badge: "var(--ink-500)", txt: "var(--ink-500)" }
};
const FORM_ROLE_LABELS = { base_carbono: "Base C", suplemento_n: "Supl. N", suplemento_medio: "Supl. Medio", aireador: "Aireador", aditivo_ph: "pH", aditivo_estructura: "Estructura", aditivo_micronutriente: "Micronut.", aditivo_arrancador: "Arrancador" };
const FORM_ROLE_COLORS = { base_carbono: "#5A7042", suplemento_n: "#C68F2C", suplemento_medio: "#D4A838", aireador: "#4E7A6A", aditivo_ph: "#8B5C28", aditivo_estructura: "#7A6B58", aditivo_micronutriente: "#2A6A7A", aditivo_arrancador: "#9B4F3A" };
const peritoMainLimiter = (opt, an) => {
  if (!opt || !an) return null;
  const first = opt.items.find((i) => i.priority === "critical") || opt.items.find((i) => i.priority === "warning");
  if (!first) return null;
  const MAP = { "↓C:N": "C:N demasiado alto — exceso de carbono sin aprovechar", "↑C:N": "C:N demasiado bajo — exceso de nitrógeno, riesgo contaminación", "↑N": "Nitrógeno insuficiente — colonización lenta y EB reducida", "↓N": "Exceso de nitrógeno — riesgo Trichoderma", "⚠": "Carga sanitaria crítica — Trichoderma probable sin autoclave", "↑pH": "pH demasiado ácido — enzimas del micelio trabajan a rendimiento parcial", "↓pH": "pH demasiado alcalino — inhibe el crecimiento y favorece bacterias", "↑EB": "Potencial de EB sin explotar", "Ca": "Sin mineral estabilizador de pH", "Dig": "Sustrato de baja digestibilidad — colonización lenta" };
  return MAP[first.icon] || first.label;
};
const peritoCorreccionMinima = (opt) => {
  const first = opt && opt.items.find((i) => i.priority === "critical" && i.apply);
  if (!first) return null;
  return first.action.replace(/<[^>]+>/g, "");
};
const PeritoItem = React.memo(({ item, onApply, baseScore }) => {
  const hasPrediction = item.predictedScore != null && baseScore != null;
  const scoreDelta = hasPrediction ? Math.round(item.predictedScore - baseScore) : null;
  return /* @__PURE__ */ React.createElement("div", { className: `perito-item pi-${item.priority}` }, /* @__PURE__ */ React.createElement("div", { className: "pi-icon-col" }, /* @__PURE__ */ React.createElement("span", { className: "pi-icon" }, item.icon)), /* @__PURE__ */ React.createElement("div", { className: "pi-body" }, /* @__PURE__ */ React.createElement("div", { className: "pi-head" }, /* @__PURE__ */ React.createElement("span", { className: "pi-label" }, item.label), item.capped && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-2xs)", fontWeight: 700, color: "#8C4020", background: "rgba(200,112,64,.12)", border: "1px solid rgba(200,112,64,.3)", borderRadius: 3, padding: "1px 6px" } }, "tope alcanzado"), item.notInStock && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-2xs)", fontWeight: 700, color: "#7A5A10", background: "rgba(160,120,40,.12)", border: "1px solid rgba(160,120,40,.3)", borderRadius: 3, padding: "1px 6px" } }, "🛒 no en bodega — a comprar"), item.delta && /* @__PURE__ */ React.createElement("span", { className: "pi-delta" }, item.delta)), item.repeatedApply && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "#7A5A10", fontFamily: "var(--font-mono)", marginBottom: 2 } }, "↻ Ya aplicaste esto ", item.repeatedApply, "x en esta sesión y el problema sigue — considera un ingrediente distinto o cambia a “Paleta completa”."), /* @__PURE__ */ React.createElement("div", { className: "pi-action", dangerouslySetInnerHTML: { __html: item.action } }), /* @__PURE__ */ React.createElement("div", { className: "pi-effect" }, item.effect), item.why && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "var(--ink-600)", fontFamily: "var(--font-mono)", marginTop: 3, opacity: 0.85 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, "Por qué:"), " ", item.why), item.riskIfIgnored && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "var(--coral-600,#B5451F)", fontFamily: "var(--font-mono)", marginTop: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, "Riesgo:"), " ", item.riskIfIgnored), hasPrediction && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: scoreDelta > 0 ? "var(--accent-olive)" : "var(--ink-600)", fontFamily: "var(--font-mono)", marginTop: 2, fontWeight: 700 } }, "Score si se aplica: ", Math.round(item.predictedScore), "/100 (", scoreDelta >= 0 ? "+" : "", scoreDelta, ")"), item.sideEffect && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "var(--coral-600,#B5451F)", fontFamily: "var(--font-mono)", marginTop: 2, fontWeight: 700 } }, "⚠ ", item.sideEffect), item.comboApply && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, padding: "6px 8px", background: "rgba(74,107,74,.08)", border: "1px solid rgba(74,107,74,.2)", borderRadius: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "var(--accent-olive)", fontFamily: "var(--font-mono)", fontWeight: 700 } }, item.comboLabel), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "var(--accent-olive)", fontFamily: "var(--font-mono)" } }, "Score si se aplica junto: ", Math.round(item.comboPredictedScore), "/100"), /* @__PURE__ */ React.createElement("button", { onClick: () => onApply(item.comboApply, item.icon), className: "pi-apply", style: { marginTop: 4 } }, "Aplicar corrección combinada"))), /* @__PURE__ */ React.createElement("div", { className: "pi-actions" }, item.apply ? /* @__PURE__ */ React.createElement("button", { onClick: () => onApply(item.apply, item.icon), className: "pi-apply" }, "Aplicar") : /* @__PURE__ */ React.createElement("div", { className: "pi-spacer" })));
});
const useDialogA11y = (onClose) => {
  const dialogRef = React.useRef(null);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const selector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(dialog.querySelectorAll(selector));
    const preferred = dialog.querySelector("[data-autofocus]") || focusables()[0] || dialog;
    preferred.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, []);
  return dialogRef;
};
const AppIcon = ({ name, size = 14, className = "", style = {}, color = "currentColor" }) => {
  const s = { display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style };
  switch (name) {
    case "print":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("polyline", { points: "6 9 6 2 18 2 18 9" }), /* @__PURE__ */ React.createElement("path", { d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" }), /* @__PURE__ */ React.createElement("rect", { x: "6", y: "14", width: "12", height: "8" }));
    case "tag":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" }), /* @__PURE__ */ React.createElement("path", { d: "M7 7h.01" }));
    case "qr":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "7", height: "7" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "3", width: "7", height: "7" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "14", width: "7", height: "7" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "14", width: "7", height: "7" }), /* @__PURE__ */ React.createElement("path", { d: "M7 7h.01M17 7h.01M7 17h.01M17 17h.01" }));
    case "rocket":
    case "launch":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" }), /* @__PURE__ */ React.createElement("path", { d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" }), /* @__PURE__ */ React.createElement("path", { d: "M9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 15v5s3.03-.55 4.5-2c1.47-1.45 2-4.5 2-4.5" }));
    case "sprout":
    case "harvest":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M7 20h10" }), /* @__PURE__ */ React.createElement("path", { d: "M10 20c5.5-2.5.8-6.4 3-10" }), /* @__PURE__ */ React.createElement("path", { d: "M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" }), /* @__PURE__ */ React.createElement("path", { d: "M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.4 1.7-4.6-2.7.2-4.1 1.1-4.9 2z" }));
    case "pantry":
    case "warehouse":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" }), /* @__PURE__ */ React.createElement("path", { d: "M6 18h12" }), /* @__PURE__ */ React.createElement("path", { d: "M6 14h12" }), /* @__PURE__ */ React.createElement("path", { d: "M6 10h12" }));
    case "temp":
    case "thermometer":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9v5" }));
    case "camera":
    case "scan":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "13", r: "3" }));
    case "alert":
    case "warning":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }));
    case "globe":
    case "trace":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "2", y1: "12", x2: "22", y2: "12" }), /* @__PURE__ */ React.createElement("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" }));
    case "sparkles":
    case "wand":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" }));
    case "check":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("polyline", { points: "20 6 9 17 4 12" }));
    case "close":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }));
    case "droplet":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" }));
    case "wind":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" }), /* @__PURE__ */ React.createElement("path", { d: "M9.6 4.6A2 2 0 1 1 11 8H2" }), /* @__PURE__ */ React.createElement("path", { d: "M12.6 19.4A2 2 0 1 0 14 16H2" }));
    case "clock":
    case "history":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("polyline", { points: "12 6 12 12 16 14" }));
    case "chevron-left":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("polyline", { points: "15 18 9 12 15 6" }));
    case "chevron-right":
      return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style: s, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("polyline", { points: "9 18 15 12 9 6" }));
    default:
      return null;
  }
};
const ColonizationScaleSelector = ({ value = 0, onChange, onQuickAction }) => {
  const steps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return /* @__PURE__ */ React.createElement("div", { className: "col-scale-container", "data-testid": "colonization-scale-selector" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-700)" } }, "Avance de Micelio: ", /* @__PURE__ */ React.createElement("strong", { style: { color: value >= 80 ? "var(--moss-700)" : "var(--ink-900)", fontSize: 13 } }, value, "%")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "inv-btn inv-btn-sec inv-btn-sm",
      style: { padding: "2px 8px", fontSize: 11, minHeight: 32 },
      onClick: () => onChange(Math.max(10, (Number(value) || 0) - 10)),
      disabled: (Number(value) || 0) <= 10,
      title: "Restar 10%"
    },
    "-10%"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "inv-btn inv-btn-sec inv-btn-sm",
      style: { padding: "2px 8px", fontSize: 11, minHeight: 32 },
      onClick: () => onChange(Math.min(100, (Number(value) || 0) + 10)),
      disabled: (Number(value) || 0) >= 100,
      title: "Sumar 10%"
    },
    "+10%"
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 3 } }, steps.map((step) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: step,
      type: "button",
      className: "col-step-chip",
      onClick: () => onChange(step),
      style: {
        fontWeight: value === step ? 800 : 500,
        background: value >= step ? "var(--moss-600)" : "var(--paper-200)",
        color: value >= step ? "var(--paper-0)" : "var(--ink-600)",
        border: value === step ? "1px solid var(--ink-900)" : "1px solid transparent"
      },
      title: `Marcar ${step}% de colonización`
    },
    step
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "inv-btn inv-btn-sec inv-btn-sm",
      style: { flex: 1, minWidth: 90, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
      onClick: () => onQuickAction("primordios"),
      title: "Detectados primordios visibles (inicio de fructificación)"
    },
    /* @__PURE__ */ React.createElement(AppIcon, { name: "sprout", size: 12, color: "var(--moss-600)" }),
    " Primordios"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "inv-btn inv-btn-sec inv-btn-sm",
      style: { flex: 1, minWidth: 90, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
      onClick: () => onQuickAction("riego"),
      title: "Verificación de humedad y niebla"
    },
    /* @__PURE__ */ React.createElement(AppIcon, { name: "droplet", size: 12, color: "var(--accent-blue-grey)" }),
    " Riego OK"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "inv-btn inv-btn-sec inv-btn-sm",
      style: { flex: 1, minWidth: 90, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
      onClick: () => onQuickAction("ventilacion"),
      title: "Extracción y recambio de aire"
    },
    /* @__PURE__ */ React.createElement(AppIcon, { name: "wind", size: 12, color: "var(--ink-500)" }),
    " Ventilación"
  )));
};
const PublicTraceabilityModal = ({ loteId, loteCode, lotes = [], cosechas = [], onClose }) => {
  const lote = lotes.find((l) => l.id === loteId || l.codigo === loteCode || l.id === loteCode) || lotes[0];
  const harvests = lote ? cosechas.filter((c) => c.loteId === lote.id) : [];
  const totalKg = harvests.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0);
  const spImg = lote?.especieKey ? IMG[lote.especieKey] || IMG.p_ostreatus_gris : IMG.p_ostreatus_gris;
  return /* @__PURE__ */ React.createElement(
    AccessibleModal,
    {
      onClose,
      label: "Ficha Pública de Trazabilidad · Setas de la Peña",
      dialogStyle: { width: "min(520px,94vw)", padding: 0, background: "var(--paper-50,#FDFCF7)", border: "1px solid var(--border-soft,#D8D3C5)", borderRadius: "var(--r-md,6px)", overflow: "hidden", boxShadow: "var(--shadow-lift)" }
    },
    /* @__PURE__ */ React.createElement("div", { style: { background: "var(--ink-900,#1B1A17)", color: "var(--paper-50,#FDFCF7)", padding: "24px 22px 20px", position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--paper-300,#C8C3B5)" } }, /* @__PURE__ */ React.createElement(AppIcon, { name: "globe", size: 13, color: "var(--moss-400,#8BA870)" }), " Trazabilidad de Origen · Tenjo, Colombia"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-body)", fontSize: 22, fontWeight: 900, color: "var(--paper-50,#FDFCF7)", margin: "6px 0 2px", letterSpacing: "-.01em" } }, lote?.especie || "Seta Cultivada"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sci)", fontStyle: "italic", fontSize: 13, color: "var(--paper-200,#E5E0D3)" } }, lote?.especieCientifico || "Pleurotus ostreatus")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "modal-icon-close", style: { color: "var(--paper-200)", background: "rgba(255,255,255,.08)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }, onClick: onClose, "aria-label": "Cerrar ficha" }, "✕"))),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, alignItems: "center", background: "var(--paper-100,#F5F2E9)", padding: "12px 14px", borderRadius: "var(--r-sm,4px)", border: "1px solid var(--border-soft,#D8D3C5)" } }, /* @__PURE__ */ React.createElement("img", { src: spImg, alt: lote?.especie || "Seta", style: { width: 54, height: 54, objectFit: "contain", borderRadius: 4, background: "#fff", border: "1px solid var(--border-soft)" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--ink-900)" } }, "Lote #", lote?.codigo || "SDP-LOTE"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-600)", marginTop: 2 } }, "Finca El Peñón · Altitud 2.587 msnm · Clima frío de montaña"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-0,#FFFFFF)", border: "1px solid var(--border-soft)", borderRadius: 4, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-500)" } }, "Inoculación"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--ink-900)", marginTop: 2 } }, lote?.fechaInoculacion || "—")), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-0,#FFFFFF)", border: "1px solid var(--border-soft)", borderRadius: 4, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-500)" } }, "Cosecha Registrada"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 15, fontWeight: 700, color: "var(--moss-700)", marginTop: 2 } }, totalKg > 0 ? `${totalKg.toFixed(2)} kg` : "En proceso"))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--surface-accent-soft,#E8F0E0)", border: "1px solid var(--moss-300,#A8C090)", borderRadius: 4, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, color: "var(--moss-900)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 12 } }, /* @__PURE__ */ React.createElement(AppIcon, { name: "check", size: 14, color: "var(--moss-700)" }), " Sustrato 100% Botánico Limpio"), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--moss-900)", margin: "4px 0 0", lineHeight: 1.45 } }, "Cultivado sin pesticidas químicos ni fertilizantes sintéticos. Hidratado con agua de montaña y monitoreado bajo control ambiental continuo.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "inv-btn inv-btn-sec",
        style: { fontSize: 11, display: "flex", alignItems: "center", gap: 6 },
        onClick: () => {
          const url = `${window.location.origin}${window.location.pathname}?trace=${lote?.codigo || ""}`;
          navigator.clipboard?.writeText?.(url);
          alert("Enlace público de trazabilidad copiado al portapapeles: " + url);
        }
      },
      /* @__PURE__ */ React.createElement(AppIcon, { name: "globe", size: 13 }),
      " Copiar Enlace QR"
    ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-pri", onClick: onClose, style: { fontSize: 11 } }, "Cerrar")))
  );
};
const DEFAULT_IOT_NODES = [
  {
    id: "node_martha_01",
    name: "Nodo Carpa 01 · Fructificación Orellanas",
    roomId: "martha_01",
    mcu: "esp32dev",
    ip: "192.168.1.101",
    mac: "24:6F:28:B4:72:01",
    rssi: -58,
    status: "online",
    sensors: ["sht3xd", "scd30"],
    relays: ["ch1_humidifier", "ch2_fae"],
    lastSeen: "hace 12s",
    metrics: { temp: 18.2, rh: 89.5, co2: 720, subTemp: 19.1 }
  },
  {
    id: "node_martha_02",
    name: "Nodo Carpa 02 · Fructificación Shiitake",
    roomId: "martha_02",
    mcu: "esp32c3",
    ip: "192.168.1.102",
    mac: "24:6F:28:C9:14:02",
    rssi: -64,
    status: "online",
    sensors: ["sht45", "scd30"],
    relays: ["ch1_humidifier", "ch2_fae"],
    lastSeen: "hace 18s",
    metrics: { temp: 17.5, rh: 85, co2: 840, subTemp: 18 }
  },
  {
    id: "node_incubacion",
    name: "Nodo Incubación · Sala Oscura Térmica",
    roomId: "incubacion_01",
    mcu: "sonoff_th16",
    ip: "192.168.1.105",
    mac: "E8:DB:84:9A:88:05",
    rssi: -52,
    status: "online",
    sensors: ["dht22", "ds18b20"],
    relays: ["ch1_humidifier"],
    lastSeen: "hace 35s",
    metrics: { temp: 23.4, rh: 72, co2: 2400, subTemp: 24.8 }
  }
];
const generateESPHomeYaml = ({ deviceName = "setas-carpa-01", roomId = "martha_01", mcu = "esp32dev", sensors = ["sht3xd", "scd30"], relays = ["ch1_humidifier", "ch2_fae"], wifiSsid = "SetasPeña_2.4G", wifiPass = "**********", serverHost = "192.168.1.100", serverPort = "8080" }) => {
  return `# ==============================================================================
# Setas de la Peña — Tenjo, Cundinamarca (2.587 msnm)
# ESPHome Telemetry & Actuation Firmware
# ==============================================================================

substitutions:
  device_name: "${deviceName}"
  room_id: "${roomId}"
  adapter_host: "${serverHost}"
  adapter_port: "${serverPort}"

esphome:
  name: \${device_name}
  friendly_name: "\${device_name} (Tenjo)"

${mcu.includes("esp8266") || mcu.includes("sonoff") ? `esp8266:
  board: ${mcu.includes("sonoff") ? "esp01_1m" : "d1_mini"}` : `esp32:
  board: ${mcu}
  framework:
    type: arduino`}

wifi:
  ssid: "${wifiSsid}"
  password: "${wifiPass}"
  fast_connect: true
  ap:
    ssid: "Setas-Fallback-\${device_name}"
    password: "setas-recovery"

captive_portal:
logger:
  level: INFO

ota:
  password: "setas-ota-secure"

i2c:
  sda: ${mcu.includes("esp8266") ? "GPIO4" : "GPIO21"}
  scl: ${mcu.includes("esp8266") ? "GPIO5" : "GPIO22"}
  scan: true
  id: bus_a

sensor:
${sensors.includes("sht3xd") ? `  - platform: sht3xd
    i2c_id: bus_a
    address: 0x44
    temperature:
      name: "Temperatura Sala"
      id: room_temp
      accuracy_decimals: 1
    humidity:
      name: "Humedad Relativa Sala"
      id: room_humidity
      accuracy_decimals: 1
    update_interval: 15s
` : ""}${sensors.includes("scd30") ? `  - platform: scd30
    i2c_id: bus_a
    address: 0x61
    altitude_compensation: 2587m # Compensación barométrica de Tenjo
    co2:
      name: "CO2 NDIR Sala"
      id: room_co2
      accuracy_decimals: 0
    update_interval: 15s
` : ""}${sensors.includes("ds18b20") ? `  - platform: dallas
    address: 0x28...
    name: "Temperatura Sonda Sustrato"
    id: sub_temp
    update_interval: 20s
` : ""}${sensors.includes("dht22") ? `  - platform: dht
    pin: GPIO14
    model: DHT22
    temperature:
      name: "Temperatura Incubación"
      id: room_temp
    humidity:
      name: "Humedad Incubación"
      id: room_humidity
    update_interval: 15s
` : ""}
switch:
${relays.includes("ch1_humidifier") ? `  - platform: gpio
    pin: ${mcu.includes("esp8266") ? "GPIO12" : "GPIO25"}
    id: relay_humidifier
    name: "Relé Humidificador T7 (Ch1)"
    inverted: false
` : ""}${relays.includes("ch2_fae") ? `  - platform: gpio
    pin: ${mcu.includes("esp8266") ? "GPIO13" : "GPIO26"}
    id: relay_fae
    name: "Relé Extractor FAE (Ch2)"
    inverted: false
` : ""}
http_request:
  verify_ssl: false

interval:
  - interval: 15s
    then:
      - http_request.post:
          url: !lambda |-
            return "http://" + id(adapter_host) + ":" + id(adapter_port) + "/api/telemetry";
          headers:
            Content-Type: application/json
          json: |-
            root["room_id"] = "${roomId}";
            root["observed_at"] = "";
            root["temperature_c"] = id(room_temp).state;
            root["rh_pct"] = id(room_humidity).state;
            ${sensors.includes("scd30") ? 'root["co2_ppm"] = id(room_co2).state;' : ""}
            ${sensors.includes("ds18b20") ? 'root["substrate_temperature_c"] = id(sub_temp).state;' : ""}
`;
};
const generateArduinoIno = ({ deviceName = "setas-carpa-01", roomId = "martha_01", wifiSsid = "SetasPeña_2.4G", wifiPass = "**********", serverHost = "192.168.1.100", serverPort = "8080" }) => {
  return `/* ==============================================================================
 * Setas de la Peña — Tenjo, Cundinamarca (2.587 msnm)
 * Sketch Nativo Arduino C++ para Telemetría ESP32 / Setas OS
 * ============================================================================== */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_SHT31.h>

const char* ssid = "${wifiSsid}";
const char* password = "${wifiPass}";
const char* serverUrl = "http://${serverHost}:${serverPort}/api/telemetry";
const char* roomId = "${roomId}";

Adafruit_SHT31 sht31 = Adafruit_SHT31();

unsigned long lastSend = 0;
const unsigned long sendInterval = 15000; // Cada 15s

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // I2C SDA=21, SCL=22
  
  if (!sht31.begin(0x44)) {
    Serial.println("Error: Sensor SHT31 no encontrado en 0x44");
  }

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi en Tenjo...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi conectado. IP: " + WiFi.localIP().toString());
}

void loop() {
  if (millis() - lastSend >= sendInterval) {
    lastSend = millis();
    
    if (WiFi.status() == WL_CONNECTED) {
      float t = sht31.readTemperature();
      float h = sht31.readHumidity();
      
      if (!isnan(t) && !isnan(h)) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        String jsonPayload = String("{\\"room_id\\":\\"") + roomId + 
                             "\\",\\"temperature_c\\":" + String(t, 2) + 
                             ",\\"rh_pct\\":" + String(h, 2) + "}";
        
        int httpCode = http.POST(jsonPayload);
        Serial.println("POST a Setas OS [" + String(httpCode) + "]: " + jsonPayload);
        http.end();
      }
    }
  }
}
`;
};
const generateCurlPayload = ({ roomId = "martha_01", temp = 18.2, rh = 89.5, co2 = 720, subTemp = 19, serverHost = "192.168.1.100", serverPort = "8080" }) => {
  return `curl -X POST "http://${serverHost}:${serverPort}/api/telemetry" \\
  -H "Content-Type: application/json" \\
  -d '{
    "room_id": "${roomId}",
    "observed_at": "${(/* @__PURE__ */ new Date()).toISOString()}",
    "temperature_c": ${temp},
    "rh_pct": ${rh},
    "co2_ppm": ${co2},
    "substrate_temperature_c": ${subTemp}
  }'`;
};
const handleTestWebhook = (rawJson, onInjectReading, setSelectedClimateRoom, setNoticeDlg) => {
  try {
    const data = JSON.parse(rawJson);
    const roomId = data.room_id || data.roomId || "martha_01";
    const temp = Number(data.temperature_c ?? data.temp ?? data.temperature ?? 18);
    const rh = Number(data.rh_pct ?? data.rh ?? data.humidity ?? 85);
    const co2 = Number(data.co2_ppm ?? data.co2 ?? 700);
    const subTemp = data.substrate_temperature_c != null ? Number(data.substrate_temperature_c) : null;
    if (typeof onInjectReading === "function") {
      onInjectReading({
        roomId,
        temp,
        rh,
        co2,
        subTemp,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      });
    }
    if (typeof setSelectedClimateRoom === "function") {
      setSelectedClimateRoom(roomId);
    }
    return {
      success: true,
      msg: `Telemetría recibida con éxito para sala "${roomId}": ${temp.toFixed(1)}°C, ${rh.toFixed(1)}% HR, ${co2.toFixed(0)} ppm CO2.`
    };
  } catch (err) {
    return {
      success: false,
      msg: `Error al procesar JSON: ${err.message}`
    };
  }
};
const IoTHubModal = ({ isOpen, onClose, selectedRoomId = "martha_01", onInjectReading, setSelectedClimateRoom, setNoticeDlg }) => {
  const [tab, setTab] = useState("nodos");
  const [nodes, setNodes] = useState(DEFAULT_IOT_NODES);
  const [fwMcu, setFwMcu] = useState("esp32dev");
  const [fwSensors, setFwSensors] = useState(["sht3xd", "scd30"]);
  const [fwRelays, setFwRelays] = useState(["ch1_humidifier", "ch2_fae"]);
  const [fwRoom, setFwRoom] = useState(selectedRoomId || "martha_01");
  const [fwWifiSsid, setFwWifiSsid] = useState("SetasPeña_2.4G");
  const [fwWifiPass, setFwWifiPass] = useState("**********");
  const [fwServerHost, setFwServerHost] = useState("192.168.1.100");
  const [fwServerPort, setFwServerPort] = useState("8080");
  const [fwFormat, setFwFormat] = useState("esphome");
  const [webhookJson, setWebhookJson] = useState(`{
  "room_id": "${selectedRoomId || "martha_01"}",
  "temperature_c": 18.4,
  "rh_pct": 89.2,
  "co2_ppm": 710,
  "substrate_temperature_c": 19.3
}`);
  const [webhookFeedback, setWebhookFeedback] = useState(null);
  const [autoRhMin, setAutoRhMin] = useState(85);
  const [autoRhTarget, setAutoRhTarget] = useState(90);
  const [autoCo2Max, setAutoCo2Max] = useState(900);
  const [autoFaeDuration, setAutoFaeDuration] = useState(35);
  const [autoSubTempMax, setAutoSubTempMax] = useState(28);
  if (!isOpen) return null;
  const generatedCode = fwFormat === "esphome" ? generateESPHomeYaml({ deviceName: `setas-${fwRoom}`, roomId: fwRoom, mcu: fwMcu, sensors: fwSensors, relays: fwRelays, wifiSsid: fwWifiSsid, wifiPass: fwWifiPass, serverHost: fwServerHost, serverPort: fwServerPort }) : fwFormat === "arduino" ? generateArduinoIno({ deviceName: `setas-${fwRoom}`, roomId: fwRoom, wifiSsid: fwWifiSsid, wifiPass: fwWifiPass, serverHost: fwServerHost, serverPort: fwServerPort }) : generateCurlPayload({ roomId: fwRoom, temp: 18.4, rh: 89.2, co2: 710, subTemp: 19.3, serverHost: fwServerHost, serverPort: fwServerPort });
  const toggleSensor = (id) => {
    setFwSensors((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleRelay = (id) => {
    setFwRelays((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  return /* @__PURE__ */ React.createElement(
    AccessibleModal,
    {
      onClose,
      label: "Hub de Integración IoT & Telemetría",
      dialogStyle: { width: "min(860px, 94vw)", padding: 0, background: "var(--paper-0, #F7F4EC)", border: "1px solid var(--border-hairline, #8C7F5B)", borderRadius: "var(--radius-sm, 2px)", overflow: "hidden", boxShadow: "0 12px 40px rgba(26,20,16,0.18)" }
    },
    /* @__PURE__ */ React.createElement("div", { style: { background: "var(--ink-0, #1A1410)", color: "#FAF8F5", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(AppIcon, { name: "temp", size: 20, color: "var(--accent-olive, #5B6B44)" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-display)", fontSize: 18, margin: 0, fontWeight: 700 } }, "Hub de Integración IoT & Hardware de Bajo Costo"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-300, #C8C3B5)", marginTop: 2 } }, "Setas de la Peña · Tenjo (2.587 msnm) · ESP32 / Sonoff / SHT3x / SCD30"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "modal-icon-close", style: { color: "#FAF8F5", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer" }, onClick: onClose }, "✕")),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px 0", background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { className: "iot-hub-pills" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: `iot-hub-pill ${tab === "nodos" ? "on" : ""}`, onClick: () => setTab("nodos") }, "📡 Nodos en Finca (", nodes.length, ")"), /* @__PURE__ */ React.createElement("button", { type: "button", className: `iot-hub-pill ${tab === "firmware" ? "on" : ""}`, onClick: () => setTab("firmware") }, "⚡ Generador de Firmware"), /* @__PURE__ */ React.createElement("button", { type: "button", className: `iot-hub-pill ${tab === "webhook" ? "on" : ""}`, onClick: () => setTab("webhook") }, "🧪 Consola Webhook / Test"), /* @__PURE__ */ React.createElement("button", { type: "button", className: `iot-hub-pill ${tab === "reglas" ? "on" : ""}`, onClick: () => setTab("reglas") }, "⚙ Reglas de Automatización"))),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px", maxHeight: "68vh", overflowY: "auto" } }, tab === "nodos" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-2)" } }, "Nodos ESP32 y microcontroladores transmitiendo telemetría activa en las carpas de Tenjo:"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--sm btn--secondary",
        onClick: () => setTab("firmware"),
        style: { fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }
      },
      "+ Configurar Nuevo Dispositivo"
    )), nodes.map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id, className: "iot-node-card" }, /* @__PURE__ */ React.createElement("div", { className: "iot-node-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-0)" } }, n.name), /* @__PURE__ */ React.createElement("span", { className: "iot-node-badge online" }, "● ", n.status)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)", marginTop: 2 } }, "IP: ", n.ip, " · MAC: ", n.mac, " · RSSI: ", n.rssi, " dBm (Excelente) · Visto ", n.lastSeen)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--sm",
        style: { fontSize: 10.5, padding: "3px 8px" },
        onClick: () => {
          if (typeof setSelectedClimateRoom === "function") setSelectedClimateRoom(n.roomId);
          onClose();
        }
      },
      "Ver Sala en Clima"
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginTop: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: "8px 10px", borderRadius: 2, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-2)", textTransform: "uppercase" } }, "Temperatura"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 16, fontWeight: 700, color: "var(--ink-0)", marginTop: 2 } }, n.metrics.temp.toFixed(1), "°C")), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: "8px 10px", borderRadius: 2, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-2)", textTransform: "uppercase" } }, "Humedad Relativa"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 16, fontWeight: 700, color: "var(--ink-0)", marginTop: 2 } }, n.metrics.rh.toFixed(1), "%")), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: "8px 10px", borderRadius: 2, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-2)", textTransform: "uppercase" } }, "Dióxido de Carbono"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 16, fontWeight: 700, color: "var(--ink-0)", marginTop: 2 } }, n.metrics.co2, " ppm")), n.metrics.subTemp != null && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: "8px 10px", borderRadius: 2, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-2)", textTransform: "uppercase" } }, "Sonda Sustrato"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 16, fontWeight: 700, color: "var(--ink-0)", marginTop: 2 } }, n.metrics.subTemp.toFixed(1), "°C")))))), tab === "firmware" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, marginBottom: 4 } }, "Microcontrolador"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: fwMcu, onChange: (e) => setFwMcu(e.target.value), style: { width: "100%", fontSize: 12 } }, /* @__PURE__ */ React.createElement("option", { value: "esp32dev" }, "ESP32 NodeMCU / WROOM-32 (Recomendado)"), /* @__PURE__ */ React.createElement("option", { value: "esp32c3" }, "ESP32-C3 SuperMini (Compacto)"), /* @__PURE__ */ React.createElement("option", { value: "esp8266" }, "ESP8266 Wemos D1 Mini"), /* @__PURE__ */ React.createElement("option", { value: "sonoff_th16" }, "Sonoff TH16 / DualR3 (Tasmota)"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, marginBottom: 4 } }, "Sala Asignada"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: fwRoom, onChange: (e) => setFwRoom(e.target.value), style: { width: "100%", fontSize: 12 } }, /* @__PURE__ */ React.createElement("option", { value: "martha_01" }, "Carpa 01 · Fructificación Orellanas"), /* @__PURE__ */ React.createElement("option", { value: "martha_02" }, "Carpa 02 · Fructificación Shiitake"), /* @__PURE__ */ React.createElement("option", { value: "incubacion_01" }, "Sala 03 · Incubación Térmica"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, marginBottom: 4 } }, "Servidor Setas OS (Host : Puerto)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("input", { type: "text", className: "field-input", value: fwServerHost, onChange: (e) => setFwServerHost(e.target.value), style: { flex: 2, fontSize: 12 } }), /* @__PURE__ */ React.createElement("input", { type: "text", className: "field-input", value: fwServerPort, onChange: (e) => setFwServerPort(e.target.value), style: { flex: 1, fontSize: 12 } })))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: 12, borderRadius: 4, marginBottom: 16, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" } }, "Sensores Conectados:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 14 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: fwSensors.includes("sht3xd"), onChange: () => toggleSensor("sht3xd") }), "SHT3x / SHT45 (T/HR I2C)"), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: fwSensors.includes("scd30"), onChange: () => toggleSensor("scd30") }), "SCD30 NDIR CO2 (I2C · 2.587 msnm)"), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: fwSensors.includes("ds18b20"), onChange: () => toggleSensor("ds18b20") }), "DS18B20 Sonda de Sustrato (OneWire)"), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: fwSensors.includes("dht22"), onChange: () => toggleSensor("dht22") }), "DHT22 Sensor Digital")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, margin: "12px 0 8px", textTransform: "uppercase" } }, "Actuadores / Relés:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 14 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: fwRelays.includes("ch1_humidifier"), onChange: () => toggleRelay("ch1_humidifier") }), "Relé Ch1: Humidificador Ultrasónico T7"), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: fwRelays.includes("ch2_fae"), onChange: () => toggleRelay("ch2_fae") }), "Relé Ch2: Extractor FAE Cloudline H4"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: `iot-hub-pill ${fwFormat === "esphome" ? "on" : ""}`, onClick: () => setFwFormat("esphome") }, "📄 ESPHome (YAML)"), /* @__PURE__ */ React.createElement("button", { type: "button", className: `iot-hub-pill ${fwFormat === "arduino" ? "on" : ""}`, onClick: () => setFwFormat("arduino") }, "🛠 Arduino C++ (.ino)"), /* @__PURE__ */ React.createElement("button", { type: "button", className: `iot-hub-pill ${fwFormat === "curl" ? "on" : ""}`, onClick: () => setFwFormat("curl") }, "🌐 cURL / Webhook")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "iot-copy-btn",
        onClick: () => {
          navigator.clipboard?.writeText?.(generatedCode);
          if (typeof setNoticeDlg === "function") {
            setNoticeDlg({ title: "Código Copiado", msg: "La configuración de firmware ha sido copiada al portapapeles." });
          } else {
            alert("Código copiado al portapapeles");
          }
        }
      },
      /* @__PURE__ */ React.createElement(AppIcon, { name: "print", size: 12 }),
      " Copiar Código"
    )), /* @__PURE__ */ React.createElement("pre", { className: "iot-code-box" }, /* @__PURE__ */ React.createElement("code", null, generatedCode))), tab === "webhook" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-1)", marginBottom: 12 } }, "Simula el envío de una petición HTTP POST desde un sensor o pasarela MQTT hacia Setas OS. Al procesarse, los datos validarán el contrato canónico y actualizarán en vivo la sala seleccionada:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--sm",
        onClick: () => setWebhookJson(`{
  "room_id": "${selectedRoomId || "martha_01"}",
  "temperature_c": 18.2,
  "rh_pct": 91.0,
  "co2_ppm": 680,
  "substrate_temperature_c": 19.0
}`)
      },
      "Cargar Lectura Nominal (18.2°C · 91% HR)"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--sm",
        onClick: () => setWebhookJson(`{
  "room_id": "${selectedRoomId || "martha_01"}",
  "temperature_c": 19.5,
  "rh_pct": 76.5,
  "co2_ppm": 1150,
  "substrate_temperature_c": 20.2
}`)
      },
      "Cargar Alerta (CO2 Alto · HR Baja)"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--sm",
        onClick: () => setWebhookJson(`{
  "room_id": "incubacion_01",
  "temperature_c": 24.2,
  "rh_pct": 70.0,
  "co2_ppm": 2600,
  "substrate_temperature_c": 29.1
}`)
      },
      "Cargar Alerta Incubación (Sustrato 29.1°C)"
    )), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "field-input",
        rows: 8,
        style: { width: "100%", fontFamily: "var(--font-mono)", fontSize: 12, background: "#181512", color: "#E6E1D8", padding: 12, borderRadius: 4, boxSizing: "border-box" },
        value: webhookJson,
        onChange: (e) => setWebhookJson(e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--primary",
        onClick: () => {
          const res = handleTestWebhook(webhookJson, onInjectReading, setSelectedClimateRoom, setNoticeDlg);
          setWebhookFeedback(res);
        }
      },
      "🚀 Inyectar Telemetría de Prueba"
    ), webhookFeedback && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: webhookFeedback.success ? "var(--moss-800)" : "var(--accent-terracotta)", fontWeight: 700 } }, webhookFeedback.success ? "✓ " : "✕ ", " ", webhookFeedback.msg))), tab === "reglas" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-1)", marginBottom: 14 } }, "Configura los umbrales de actuación local por histéresis y pulsos de recambio de aire (FAE) para las carpas de cultivo en Tenjo:"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: 14, borderRadius: 4, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "💧 Humidificación (Bang-Bang con Histéresis)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontFamily: "var(--font-mono)", fontSize: 11, display: "block" } }, "HR Mínima de Arranque (%)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: autoRhMin, onChange: (e) => setAutoRhMin(Number(e.target.value)), style: { width: "100%", fontSize: 12 } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontFamily: "var(--font-mono)", fontSize: 11, display: "block" } }, "HR Target de Reposo (%)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: autoRhTarget, onChange: (e) => setAutoRhTarget(Number(e.target.value)), style: { width: "100%", fontSize: 12 } })))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: 14, borderRadius: 4, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "💨 Renovación de Aire FAE (Extractor Cloudline)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontFamily: "var(--font-mono)", fontSize: 11, display: "block" } }, "Límite Máximo CO2 (ppm)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: autoCo2Max, onChange: (e) => setAutoCo2Max(Number(e.target.value)), style: { width: "100%", fontSize: 12 } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontFamily: "var(--font-mono)", fontSize: 11, display: "block" } }, "Duración Pulso FAE (segundos)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: autoFaeDuration, onChange: (e) => setAutoFaeDuration(Number(e.target.value)), style: { width: "100%", fontSize: 12 } })))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: 14, borderRadius: 4, border: "1px solid var(--border-hairline)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "🌡 Seguridad Biológica de Sustrato"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontFamily: "var(--font-mono)", fontSize: 11, display: "block" } }, "Temperatura Crítica de Sustrato (°C)"), /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.5", className: "field-input", value: autoSubTempMax, onChange: (e) => setAutoSubTempMax(Number(e.target.value)), style: { width: "100%", fontSize: 12 } }), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-2)", marginTop: 4 } }, "Si $T_", "{sustrato}", " > 28^\\circ\\text", C, "$ durante incubación, se dispara alerta de riesgo de daño al micelio.")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--primary",
        onClick: () => {
          if (typeof setNoticeDlg === "function") {
            setNoticeDlg({ title: "Reglas Actualizadas", msg: "Las reglas de automatización climática para carpas han sido guardadas." });
          }
          onClose();
        }
      },
      "Guardar Parámetros de Automatización"
    )))),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 24px", background: "var(--paper-100)", borderTop: "1px solid var(--border-hairline)", display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-pri", onClick: onClose, style: { fontSize: 11 } }, "Cerrar"))
  );
};
const AccessibleModal = ({ onClose, label, children, backdropClassName = "inv-modal-bg", dialogClassName = "inv-modal", dialogStyle }) => {
  const dialogRef = useDialogA11y(onClose);
  return /* @__PURE__ */ React.createElement("div", { className: backdropClassName, onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { ref: dialogRef, tabIndex: -1, className: dialogClassName, role: "dialog", "aria-modal": "true", "aria-label": label, style: dialogStyle }, children));
};
const ConfirmModal = ({ dlg, onClose }) => {
  const dialogRef = useDialogA11y(onClose);
  return /* @__PURE__ */ React.createElement("div", { className: "inv-modal-bg", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { ref: dialogRef, tabIndex: -1, className: "inv-modal", role: "dialog", "aria-modal": "true", "aria-label": dlg.title || "Confirmar", style: { width: 420 } }, /* @__PURE__ */ React.createElement("div", { className: "inv-modal-title" }, dlg.title || "Confirmar"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", marginBottom: 18, lineHeight: 1.5 } }, dlg.msg), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "inv-btn inv-btn-sec" }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    dlg.onConfirm();
    onClose();
  }, className: `inv-btn ${dlg.danger ? "inv-btn-danger" : "inv-btn-pri"}` }, dlg.confirmLabel || "Confirmar"))));
};
const PromptModal = ({ dlg, onClose }) => {
  const [val, setVal] = React.useState(dlg.defaultValue || "");
  const dialogRef = useDialogA11y(onClose);
  const submit = () => {
    if (!val.trim()) return;
    dlg.onSubmit(val.trim());
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "inv-modal-bg", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { ref: dialogRef, tabIndex: -1, className: "inv-modal", role: "dialog", "aria-modal": "true", "aria-label": dlg.title || "Nombre", style: { width: 420 } }, /* @__PURE__ */ React.createElement("div", { className: "inv-modal-title" }, dlg.title || "Nombre"), dlg.label && /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "setas-prompt-input" }, dlg.label), /* @__PURE__ */ React.createElement("input", { "data-autofocus": true, id: "setas-prompt-input", name: "promptValue", className: "inv-input", value: val, placeholder: dlg.placeholder || "", autoComplete: "off", onChange: (e) => setVal(e.target.value), onKeyDown: (e) => e.key === "Enter" && submit(), style: { marginBottom: 18 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "inv-btn inv-btn-sec" }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { onClick: submit, disabled: !val.trim(), className: "inv-btn inv-btn-pri" }, dlg.confirmLabel || "Guardar"))));
};
const NoticeModal = ({ dlg, onClose }) => {
  const dialogRef = useDialogA11y(onClose);
  return /* @__PURE__ */ React.createElement("div", { className: "inv-modal-bg", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { ref: dialogRef, tabIndex: -1, className: "inv-modal", role: "dialog", "aria-modal": "true", "aria-label": dlg.title || "Aviso", style: { width: 420 } }, /* @__PURE__ */ React.createElement("div", { className: "inv-modal-title" }, dlg.title || "Aviso"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", marginBottom: 18, lineHeight: 1.5 } }, dlg.msg), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "inv-btn inv-btn-pri" }, "Aceptar"))));
};
const CAT_COLORS = {
  base: "#5A7042",
  // moss (base carbons)
  sup: "#C68F2C",
  // ochre (supplements)
  est: "#8C6B4A",
  // bark (manure)
  cafe: "#4A3728",
  // dark brown (coffee)
  trop: "#B8694B",
  // warm brown (tropical)
  circ: "#6B7C5F",
  // sage (circular)
  local: "#7A5A3F",
  // tan (local),
  default: "#999"
};
const IcoBlock = () => /* @__PURE__ */ React.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "var(--accent-terracotta)", strokeWidth: "2", strokeLinecap: "round", style: { display: "inline-block", verticalAlign: "middle", marginRight: 4, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "4.93", y1: "4.93", x2: "19.07", y2: "19.07" }));
const IcoWarn = () => /* @__PURE__ */ React.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "var(--status-attention)", strokeWidth: "2", strokeLinecap: "round", style: { display: "inline-block", verticalAlign: "middle", marginRight: 4, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }));
const IcoBox = ({ color = "currentColor", size = 13 }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.5", strokeLinecap: "round", style: { display: "inline-block", verticalAlign: "middle", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" }), /* @__PURE__ */ React.createElement("polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "22.08", x2: "12", y2: "12" }));
const parseIngName = (name) => {
  const hasBlock = name.includes("⛔");
  const hasWarn = name.includes("⚠️") || name.includes("⚠");
  const clean = name.replace(/⛔\s*/g, "").replace(/⚠️\s*/g, "").replace(/⚠\s*/g, "").trim();
  return { hasBlock, hasWarn, clean };
};
const IngredientItem = ({ ing, onAdd, stockKg = 0 }) => {
  const [expanded, setExpanded] = React.useState(false);
  const cat = CAT_COLORS[ing.cat] || CAT_COLORS.default;
  const costStr = ing.cost === 0 ? "Gratis" : `$${ing.cost}`;
  const cnPct = Math.min(100, Math.max(0, ing.cn / 600 * 100)) / 100;
  const nPct = Math.min(100, ing.n * 15) / 100;
  const craPct = ing.cra / 5;
  const digPct = ing.dig / 10;
  return /* @__PURE__ */ React.createElement("div", { className: "ing-item " + (expanded ? "expanded" : "") }, /* @__PURE__ */ React.createElement("div", { className: "ing-badge", style: { background: cat }, title: ing.cat }, ing.cat.substring(0, 2).toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "ing-info" }, /* @__PURE__ */ React.createElement("div", { className: "ing-name" }, (() => {
    const { hasBlock, hasWarn, clean } = parseIngName(ing.name);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, stockKg > 0 && /* @__PURE__ */ React.createElement("span", { className: "ing-stock-dot", style: { background: stockKg > 5 ? "var(--accent-olive)" : "var(--ochre-500,#A07828)" } }), hasBlock && /* @__PURE__ */ React.createElement(IcoBlock, null), hasWarn && /* @__PURE__ */ React.createElement(IcoWarn, null), clean);
  })()), /* @__PURE__ */ React.createElement("div", { className: "ing-meta" }, /* @__PURE__ */ React.createElement("span", null, "C:N ", ing.cn), /* @__PURE__ */ React.createElement("span", null, "N ", ing.n.toFixed(1), "%"), /* @__PURE__ */ React.createElement("span", null, costStr), stockKg > 0 && /* @__PURE__ */ React.createElement("span", { className: "ing-stock-kg" }, stockKg.toFixed(1), " kg")), expanded && /* @__PURE__ */ React.createElement("div", { className: "ing-profile" }, /* @__PURE__ */ React.createElement("div", { className: "ing-profile-row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "Carbono"), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar" }, /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar-fill", style: { width: ing.c / 50 * 100 + "%", background: "#5A7042" } })), /* @__PURE__ */ React.createElement("span", { className: "v" }, ing.c, /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%"))), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "Humedad"), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar" }, /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar-fill", style: { width: Math.min(100, ing.moisture) + "%", background: "var(--accent-blue-grey)" } })), /* @__PURE__ */ React.createElement("span", { className: "v" }, ing.moisture, /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%"))), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "Ret. agua"), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar" }, /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar-fill", style: { width: ing.cra / 5 * 100 + "%", background: "var(--accent-blue-grey)" } })), /* @__PURE__ */ React.createElement("span", { className: "v" }, ing.cra, /* @__PURE__ */ React.createElement("span", { className: "unit" }, "/5"))), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "pH"), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar" }, /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar-fill", style: { width: (ing.ph - 4) / 3 * 100 + "%", background: "#C68F2C" } })), /* @__PURE__ */ React.createElement("span", { className: "v" }, ing.ph)), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "Dig."), /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar" }, /* @__PURE__ */ React.createElement("div", { className: "ing-profile-bar-fill", style: { width: ing.dig / 10 * 100 + "%", background: "#B6532A" } })), /* @__PURE__ */ React.createElement("span", { className: "v" }, ing.dig, /* @__PURE__ */ React.createElement("span", { className: "unit" }, "/10"))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("button", { className: "add-btn", onClick: (e) => {
    e.stopPropagation();
    onAdd(ing);
  } }, "Agregar a receta")))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "ing-expand-btn", "aria-expanded": expanded, "aria-label": `${expanded ? "Ocultar" : "Mostrar"} perfil de ${ing.name}`, onClick: () => setExpanded(!expanded) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, expanded ? "−" : "+")));
};
const EBDial = ({ an, sp }) => {
  if (!an || !sp || !an.cn) return null;
  const eb = Math.max(0, an.eb || 0);
  const base = sp.eb_baseline, opt = sp.eb_optimal;
  const maxV = Math.max(160, Math.ceil(opt * 1.2 / 10) * 10);
  const cx = 130, cy = 112, R = 90;
  const rad = (d) => d * Math.PI / 180;
  const ang = (v) => 135 + Math.min(Math.max(v, 0), maxV) / maxV * 270;
  const pt = (v, r) => [cx + r * Math.cos(rad(ang(v))), cy + r * Math.sin(rad(ang(v)))];
  const arc = (v0, v1, r) => {
    const [x0, y0] = pt(v0, r);
    const [x1, y1] = pt(v1, r);
    const large = ang(v1) - ang(v0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const status = eb < base ? "low" : eb <= opt ? "good" : "high";
  const needleCol = status === "low" ? "var(--coral-500)" : status === "high" ? "#3D4A38" : "var(--accent-olive)";
  const stLabel = status === "low" ? "Por debajo del rango" : status === "high" ? "Excelente — sobre el óptimo" : "Dentro del rango óptimo";
  const [nx, ny] = pt(eb, R - 8);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * maxV / 5) * 5);
  return /* @__PURE__ */ React.createElement("div", { className: "ebdial" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 260 200", width: "100%", style: { maxWidth: 288 } }, /* @__PURE__ */ React.createElement("path", { d: arc(0, maxV, R), fill: "none", stroke: "var(--paper-300)", strokeWidth: "10", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("path", { d: arc(base, opt, R), fill: "none", stroke: "#9FB07F", strokeWidth: "10", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("path", { d: arc(0, maxV, R + 9), fill: "none", stroke: "var(--ink-900)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("path", { d: arc(0, maxV, R - 9), fill: "none", stroke: "var(--ink-900)", strokeWidth: "0.7", opacity: "0.45" }), ticks.map((tv, i) => {
    const [a0, b0] = pt(tv, R - 9);
    const [a1, b1] = pt(tv, R + 9);
    const [lx, ly] = pt(tv, R + 24);
    return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("line", { x1: a0, y1: b0, x2: a1, y2: b1, stroke: "var(--ink-700)", strokeWidth: "1.2" }), /* @__PURE__ */ React.createElement("text", { x: lx, y: ly, textAnchor: "middle", dominantBaseline: "middle", fontFamily: "var(--font-mono)", fontSize: "9.5", fill: "var(--ink-500)" }, tv));
  }), /* @__PURE__ */ React.createElement("line", { x1: cx, y1: cy, x2: nx, y2: ny, stroke: needleCol, strokeWidth: "3", strokeLinecap: "round", style: { transition: "transform .5s cubic-bezier(0.32,0.72,0.36,1)" } }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: "7", fill: "var(--paper-50)", stroke: "var(--ink-900)", strokeWidth: "1.6" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: "2.4", fill: "var(--ink-900)" }), /* @__PURE__ */ React.createElement("text", { x: cx, y: cy + 36, textAnchor: "middle", fontFamily: "var(--font-num)", fontSize: "32", fill: "#9C3F1F" }, an.ebLow, "–", an.ebHigh), /* @__PURE__ */ React.createElement("text", { x: cx, y: cy + 52, textAnchor: "middle", fontFamily: "var(--font-mono)", fontSize: "10", fill: "var(--ink-400)" }, "% RANGO ESPERADO"), /* @__PURE__ */ React.createElement("text", { x: cx, y: cy + 66, textAnchor: "middle", fontFamily: "var(--font-mono)", fontSize: "9", fill: "var(--ink-300)" }, "central ", eb.toFixed(0), "% · índice ", an.ebIndex, "/100")), /* @__PURE__ */ React.createElement("div", { className: "ebdial-note" }, stLabel, " · franja óptima ", base, "–", opt, "%"));
};
const BandGauge = ({ label, unit, min, max, ideal, value, reference, scaleMin, scaleMax, color = "var(--accent-olive)", warnColor = "#A8432A" }) => {
  const sMin = scaleMin ?? min * 0.5;
  const sMax = scaleMax ?? max * 1.5;
  const range = sMax - sMin;
  const toPos = (v) => Math.max(0, Math.min(100, (v - sMin) / range * 100));
  const bandLeft = toPos(min);
  const bandW = toPos(max) - bandLeft;
  const idealPos = toPos(ideal);
  const valPos = value != null ? toPos(value) : null;
  const inRange = value != null && value >= min && value <= max;
  const cursorCol = inRange ? color : warnColor;
  const fmtVal = (v) => typeof v === "number" ? v < 10 ? v.toFixed(2) : v.toFixed(1) : "—";
  return /* @__PURE__ */ React.createElement("div", { className: "bg-row" }, /* @__PURE__ */ React.createElement("div", { className: "bg-header" }, /* @__PURE__ */ React.createElement("span", { className: "bg-label" }, label), /* @__PURE__ */ React.createElement("span", { className: "bg-val", style: { color: cursorCol } }, fmtVal(value), unit)), /* @__PURE__ */ React.createElement("div", { className: "bg-track" }, /* @__PURE__ */ React.createElement("div", { className: "bg-band", style: { left: `${bandLeft}%`, width: `${bandW}%`, background: `${color}28` } }), /* @__PURE__ */ React.createElement("div", { className: "bg-ideal", style: { left: `${idealPos}%`, background: `${color}66` } }), reference != null && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: `${toPos(reference)}%`, top: 0, bottom: 0, width: "1.5px", background: "rgba(191,169,139,0.7)", borderLeft: "1.5px dashed rgba(191,169,139,0.8)", pointerEvents: "none" }, title: `Referencia óptima: ${reference}${unit}` }), valPos != null && /* @__PURE__ */ React.createElement("div", { className: "bg-cursor", style: { left: `${valPos}%`, background: cursorCol, boxShadow: `0 0 0 1.5px ${cursorCol}` } })), /* @__PURE__ */ React.createElement("div", { className: "bg-foot" }, /* @__PURE__ */ React.createElement("span", null, min, unit), /* @__PURE__ */ React.createElement("span", { style: { color: `${color}99` } }, "ideal ", ideal, unit), /* @__PURE__ */ React.createElement("span", null, max, unit)));
};
const blendEBWithHistory = (an, historical) => {
  const hasHist = historical && historical.n > 0 && historical.avg != null;
  return hasHist ? an.eb * (1 - historical.weight) + historical.avg * historical.weight : an.eb;
};
const IconTarget = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "8", r: "7" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "8", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M8 1v2M8 13v2M1 8h2M13 8h2" }));
const IconBolt = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polygon", { points: "9 1 2 9 8 9 7 15 14 7 8 7 9 1", fill: "currentColor", stroke: "none" }));
const IconRecipe = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M3 2h8l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" }), /* @__PURE__ */ React.createElement("path", { d: "M11 2v4h4" }), /* @__PURE__ */ React.createElement("path", { d: "M5 8h6M5 11h4" }));
const IconDisk = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M3 2h8l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" }), /* @__PURE__ */ React.createElement("rect", { x: "5", y: "9", width: "6", height: "5" }), /* @__PURE__ */ React.createElement("rect", { x: "5", y: "2", width: "5", height: "3" }));
const IconCheck = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polyline", { points: "3 8.5 6.5 12 13 4" }));
const IconAlert = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M8 2L1 14h14L8 2z" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "6", x2: "8", y2: "10" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "12", r: "0.5", fill: color, stroke: "none" }));
const IconLock = ({ size = 10, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "7", width: "10", height: "8", rx: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M5 7V4.5a3 3 0 0 1 6 0V7" }));
const IconSprout = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M2 14c2-4 5-6 10-6" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z" }), /* @__PURE__ */ React.createElement("path", { d: "M9 8c0-2-1.5-3.5-3.5-3.5 0 2 1.5 3.5 3.5 3.5z" }));
const IconBox = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M2 4.5L8 1.5l6 3v7l-6 3-6-3v-7z" }), /* @__PURE__ */ React.createElement("path", { d: "M2 4.5L8 7.5l6-3M8 7.5v7" }));
const IconFlame = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M8 1c.5 2.5 3 4 3 7a5 5 0 0 1-10 0c0-3 2.5-4.5 3-7 1 2 2 3 4 0z" }));
const IconChevronDown = ({ size = 10, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polyline", { points: "4 6 8 10 12 6" }));
const IconChevronUp = ({ size = 10, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polyline", { points: "4 10 8 6 12 10" }));
const IconClose = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "3", x2: "13", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "13", y1: "3", x2: "3", y2: "13" }));
const IconMountain = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M1 14L6 4l4 8 2-4 3 6H1z" }));
const IconDroplet = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M8 1.5C8 1.5 3 7 3 10.5a5 5 0 0 0 10 0C13 7 8 1.5 8 1.5z" }));
const IconClipboard = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M10 2H6a1 1 0 0 0-1 1v1h6V3a1 1 0 0 0-1-1z" }), /* @__PURE__ */ React.createElement("path", { d: "M5 4H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "8", x2: "11", y2: "8" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "11", x2: "9", y2: "11" }));
const IconMushroom = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M8 2a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" }), /* @__PURE__ */ React.createElement("path", { d: "M6 8v5a2 2 0 0 0 4 0V8" }));
const IconMicroscope = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M6 1h4M8 1v4M5 5h6v3H5zM8 8v3M4 14h8M4 11h8" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8a4 4 0 0 1-4 4" }));
const IconBook = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M2 3h5a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2H2V3z" }), /* @__PURE__ */ React.createElement("path", { d: "M14 3H9a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h5V3z" }));
const IconFactory = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M1 14h14V7l-4 3V7L7 10V2L1 5v9z" }));
const IconSeed = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M3 13c1-4 4-7 10-10 0 6-3 9-10 10z" }), /* @__PURE__ */ React.createElement("path", { d: "M3 13l5-5" }));
const IconNut = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M8 1.5c-2.5 1.5-4 4-4 7 0 2.7 1.8 5.5 4 6 2.2-.5 4-3.3 4-6 0-3-1.5-5.5-4-7z" }), /* @__PURE__ */ React.createElement("path", { d: "M8 6.2v8.3" }));
const IconScale = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "1", x2: "8", y2: "14" }), /* @__PURE__ */ React.createElement("line", { x1: "2", y1: "4", x2: "14", y2: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M2 4l2 5h-4l2-5zM14 4l2 5h-4l2-5zM5 14h6" }));
const IconWind = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M2 5h9a2 2 0 1 0-2-2" }), /* @__PURE__ */ React.createElement("path", { d: "M1 9h12a2 2 0 1 0-2-2" }), /* @__PURE__ */ React.createElement("path", { d: "M3 13h6a2 2 0 1 0-2-2" }));
const IconSnowflake = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "1", x2: "8", y2: "15" }), /* @__PURE__ */ React.createElement("line", { x1: "1", y1: "8", x2: "15", y2: "8" }), /* @__PURE__ */ React.createElement("path", { d: "M3 3l10 10M13 3L3 13" }));
const IconEdit = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M11 2l3 3-8 8H3v-3l8-8z" }));
const IconCamera = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M1 5a1 1 0 0 1 1-1h2.5l1.5-2h4l1.5 2H14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5z" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "9", r: "3" }));
const IconMail = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("rect", { x: "2", y: "3", width: "12", height: "10", rx: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M2 4l6 5 6-5" }));
const IconSparkles = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" }));
const IconStar = ({ size = 12, color = "currentColor", fill = "none" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill, stroke: color, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polygon", { points: "8 1.5 10 6 15 6.5 11.5 10 12.5 15 8 12.5 3.5 15 4.5 10 1 6.5 6 6 8 1.5" }));
const IconCart = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("circle", { cx: "6", cy: "13", r: "1.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "13", cy: "13", r: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M1 2h2.5l1.6 7h8.5l1.4-5H4" }));
const IconRotate = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("path", { d: "M1.5 2.5v4h4" }), /* @__PURE__ */ React.createElement("path", { d: "M2.5 10a6 6 0 1 0 1.2-6.5L1.5 6.5" }));
const IconPause = ({ size = 12, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("rect", { x: "3.5", y: "3", width: "3", height: "10", rx: "0.5" }), /* @__PURE__ */ React.createElement("rect", { x: "9.5", y: "3", width: "3", height: "10", rx: "0.5" }));
const RecipeGauges = ({ an, sp, optimalAn, historical }) => {
  if (!sp || !an || !an.cn) return /* @__PURE__ */ React.createElement("aside", { className: "bg-wrap recipe-live-evaluation is-empty", id: "recipe-live-evaluation", "aria-labelledby": "recipe-live-title" }, /* @__PURE__ */ React.createElement("div", { className: "bg-eyebrow", id: "recipe-live-title" }, "Evaluación en vivo"), /* @__PURE__ */ React.createElement("div", { className: "recipe-live-empty" }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(IconTarget, { size: 22 })), /* @__PURE__ */ React.createElement("strong", null, "Aún no hay una fórmula que evaluar"), /* @__PURE__ */ React.createElement("span", null, "Agrega el primer ingrediente y aquí aparecerán C:N, nitrógeno y EB estimada.")));
  const hasHist = historical && historical.n > 0 && historical.avg != null;
  const blendedEB = blendEBWithHistory(an, historical);
  return /* @__PURE__ */ React.createElement("aside", { className: "bg-wrap recipe-live-evaluation", id: "recipe-live-evaluation", "aria-labelledby": "recipe-live-title" }, /* @__PURE__ */ React.createElement("div", { className: "bg-eyebrow", id: "recipe-live-title" }, "Evaluación en vivo"), /* @__PURE__ */ React.createElement(
    BandGauge,
    {
      label: "C:N",
      unit: ":1",
      min: sp.cn_optimal.min,
      max: sp.cn_optimal.max,
      ideal: sp.cn_optimal.ideal,
      value: an.cn,
      scaleMin: 10,
      scaleMax: 90,
      color: "var(--accent-olive)",
      warnColor: "#A8432A"
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", marginTop: -6, marginBottom: 8, paddingLeft: 2, fontWeight: 500 } }, "Calculado en base seca · corrige H₂O por insumo"), /* @__PURE__ */ React.createElement(
    BandGauge,
    {
      label: "N",
      unit: "%",
      min: sp.n_optimal.min,
      max: sp.n_optimal.max,
      ideal: sp.n_optimal.ideal,
      value: an.avgN,
      scaleMin: 0,
      scaleMax: 3.5,
      color: "var(--accent-blue-grey)",
      warnColor: "#A8432A"
    }
  ), /* @__PURE__ */ React.createElement(
    BandGauge,
    {
      label: "EB estimado",
      unit: "%",
      min: sp.eb_baseline,
      max: sp.eb_optimal,
      ideal: sp.eb_optimal,
      value: an ? Math.round(blendedEB) : null,
      reference: optimalAn ? Math.round(optimalAn.eb) : null,
      scaleMin: 0,
      scaleMax: Math.max(200, Math.ceil(sp.eb_optimal * 1.4 / 10) * 10),
      color: "#A8432A",
      warnColor: "var(--accent-terracotta)"
    }
  ), an && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", marginTop: -6, marginBottom: 8, paddingLeft: 2, fontWeight: 500 } }, "Rango ", an.ebLow, "–", an.ebHigh, "% · índice ", an.ebIndex, "/100 · la aguja es el valor central"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 2, padding: "8px 10px", borderRadius: 6, background: hasHist ? "rgba(122,142,96,0.12)" : "rgba(0,0,0,0.04)", border: "1px solid " + (hasHist ? "var(--accent-olive)" : "var(--border-soft, #ddd)") } }, hasHist ? /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-800,#333)", lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("b", null, "Proyección ajustada con ", historical.n, " lote", historical.n > 1 ? "s" : "", " real", historical.n > 1 ? "es" : "", historical.matched ? " con receta similar" : ""), " · EB histórica ", historical.avg.toFixed(0), "% (", historical.subs.join(", "), ") · mezcla ", Math.round(historical.weight * 100), "% histórico / ", Math.round((1 - historical.weight) * 100), "% fórmula") : /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700,#666)", lineHeight: 1.5 } }, "Estimación teórica — sin lotes previos de ", sp.name, " en el registro para proyectar EB real.")));
};
const stockActual = (ingredienteId, lotes) => lotes.filter((l) => l.activo && l.ingredienteId === ingredienteId).reduce((s, l) => s + (l.cantidadKgDisponible || 0), 0);
const precioPonderado = (ingredienteId, lotes) => {
  const active = lotes.filter((l) => l.activo && l.ingredienteId === ingredienteId && l.cantidadKgDisponible > 0);
  const totalKg = active.reduce((s, l) => s + l.cantidadKgDisponible, 0);
  if (!totalKg) return null;
  return active.reduce((s, l) => s + l.precioPorKgCOP * l.cantidadKgDisponible, 0) / totalKg;
};
const consumirInventarioFIFOLocal = (lotes, rows) => {
  let updated = [...lotes];
  for (const row of rows) {
    let remaining = row.krKg;
    const lotesIng = updated.filter((l) => l.activo && l.ingredienteId === row.id).sort((a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso));
    for (const lote of lotesIng) {
      if (remaining <= 1e-3) break;
      const consume = Math.min(lote.cantidadKgDisponible, remaining);
      updated = updated.map((l) => l.id === lote.id ? { ...l, cantidadKgDisponible: Math.max(0, Math.round((l.cantidadKgDisponible - consume) * 1e3) / 1e3) } : l);
      remaining -= consume;
    }
  }
  return updated;
};
const SEED_PROVEEDORES = [
  { id: "prov_paloquemao", nombre: "Plaza de Paloquemao", tipo: "plaza", municipio: "Bogotá" },
  { id: "prov_bavaria", nombre: "Bavaria Tocancipá", tipo: "industrial", municipio: "Tocancipá" },
  { id: "prov_elrosal", nombre: "Agrícola El Rosal", tipo: "directo", municipio: "El Rosal" }
];
const SEED_CID_PALO = "compra_seed_palo";
const SEED_CID_ELROSAL = "compra_seed_elrosal";
const SEED_CID_BAV = "compra_seed_bav";
const SEED_LOTES = [
  { id: "lote_s1", compraId: SEED_CID_PALO, ingredienteId: "paja_trigo", cantidadKgTotal: 15, precioPorKgCOP: 1200, fechaIngreso: "2026-06-01", cantidadKgDisponible: 15, activo: true },
  { id: "lote_s3", compraId: SEED_CID_PALO, ingredienteId: "salvado_trigo", cantidadKgTotal: 5, precioPorKgCOP: 2100, fechaIngreso: "2026-06-01", cantidadKgDisponible: 5, activo: true },
  { id: "lote_s2", compraId: SEED_CID_ELROSAL, ingredienteId: "aserrin_roble", cantidadKgTotal: 8, precioPorKgCOP: 800, fechaIngreso: "2026-06-01", cantidadKgDisponible: 8, activo: true },
  { id: "lote_s4", compraId: SEED_CID_BAV, ingredienteId: "afrecho_cerveceria", cantidadKgTotal: 3, precioPorKgCOP: 500, fechaIngreso: "2026-06-01", cantidadKgDisponible: 3, activo: true }
];
const SEED_COMPRAS = [
  {
    id: SEED_CID_PALO,
    fecha: "2026-06-01",
    proveedorId: "prov_paloquemao",
    items: [{ ingredienteId: "paja_trigo", kg: 15, precio: 1200 }, { ingredienteId: "salvado_trigo", kg: 5, precio: 2100 }],
    fuenteCaptura: "manual",
    revisadoManualmente: true
  },
  {
    id: SEED_CID_ELROSAL,
    fecha: "2026-06-01",
    proveedorId: "prov_elrosal",
    items: [{ ingredienteId: "aserrin_roble", kg: 8, precio: 800 }],
    fuenteCaptura: "manual",
    revisadoManualmente: true
  },
  {
    id: SEED_CID_BAV,
    fecha: "2026-06-01",
    proveedorId: "prov_bavaria",
    items: [{ ingredienteId: "afrecho_cerveceria", kg: 3, precio: 500 }],
    fuenteCaptura: "manual",
    revisadoManualmente: true
  }
];
const SEED_MOVIMIENTOS = SEED_LOTES.map((l, i) => ({
  id: `mov_seed_${i}`,
  loteId: l.id,
  ingredienteId: l.ingredienteId,
  tipo: "entrada",
  cantidadKg: l.cantidadKgTotal,
  fecha: "2026-06-01",
  referencia: l.compraId
}));
const SPP_KEY_ALIAS = {
  pleurotus_ostreatus: "p_ostreatus_gris",
  pleurotus_djamor: "p_djamor_rosa",
  pleurotus_eryngii: "p_eryngii",
  hericium_erinaceus: "lions_mane",
  lentinula_edodes: "shiitake",
  ganoderma_lucidum: "reishi",
  flammulina_velutipes: "enoki",
  pholiota_nameko: "nameko"
};
const normSpp = (k) => {
  if (!k) return k;
  if (SPP[k]) return k;
  return SPP_KEY_ALIAS[k] || k;
};
const hybridRoleCaps = (sp) => ({
  base_carbono: 100,
  suplemento_n: Number(sp?.supplementation_max) || 20,
  suplemento_medio: Number(sp?.supplementation_max) || 20,
  aditivo_ph: 8,
  aditivo_estructura: 15,
  aditivo_micronutriente: 5,
  aireador: 30
});
const hybridIngredientCaps = (ings, sp) => {
  const caps = {};
  const suppMax = Number(sp?.supplementation_max) || 20;
  (ings || []).forEach((g) => {
    if (g.role === "suplemento_n" || g.role === "suplemento_medio") caps[g.id] = suppMax;
    else if (g.role === "aditivo_ph") caps[g.id] = 8;
    else if (g.role === "aditivo_estructura") caps[g.id] = 15;
    else if (g.role === "aditivo_micronutriente") caps[g.id] = 5;
    else if (g.role === "aireador") caps[g.id] = 30;
  });
  return caps;
};
const hybridSupplementPct = (rec, ings) => {
  const byId = new Map((ings || []).map((g) => [g.id, g]));
  return (rec || []).reduce((sum, r) => {
    const role = byId.get(r.id)?.role;
    return sum + (role === "suplemento_n" || role === "suplemento_medio" ? Number(r.p) || 0 : 0);
  }, 0);
};
const runHybridRecipeSearch = ({
  targetKey,
  recipe = [],
  invLotes = [],
  maxCost = 0,
  ingredients = [],
  useStock = false,
  profileKey = "produccion",
  stockMap = {},
  lockedIds = []
}) => {
  const engine = globalThis.SetasPeritoScenarios;
  if (!engine?.searchScenarios) throw new Error("SetasPeritoScenarios no disponible");
  const target = SPP[targetKey];
  if (!target) return { ranked: [], pareto: [], recommended: [], noStock: false, diagnostics: { error: "Especie no encontrada" } };
  const stockIds = /* @__PURE__ */ new Set([
    ...Object.keys(stockMap || {}).filter((k) => Number(stockMap[k]) > 0),
    ...(invLotes || []).filter((l) => l?.activo !== false && Number(l?.cantidadKgDisponible) > 0).map((l) => l.ingredienteId)
  ]);
  const compatible = useStock ? (ingredients || []).filter((g) => stockIds.has(g.id)) : (ingredients || []).filter((g) => !Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(targetKey));
  const analyzeAdapter = (rec) => analyze(rec, targetKey, ingredients);
  const scoreAdapter = (analysis, ctx) => {
    const treatment = calcTreatment(analysis, targetKey, SPP);
    return scoreAn(analysis, {
      treatment,
      recipe: ctx.recipe,
      stockIds: useStock ? stockIds : void 0
    });
  };
  return engine.searchScenarios({
    recipe,
    context: { sKey: targetKey, spp: SPP, stockIds },
    searchMode: "hybrid",
    targetKey,
    spp: SPP,
    ingredients: compatible,
    analyze: analyzeAdapter,
    score: scoreAdapter,
    history: [],
    generations: 3,
    beamWidth: 14,
    stepPct: 4,
    useStock,
    stockIds,
    invLotes,
    stockMap,
    profileKey,
    maxCost,
    roleCaps: hybridRoleCaps(target),
    ingredientCaps: hybridIngredientCaps(compatible, target),
    lockedIds: new Set(lockedIds || [])
  });
};
const hybridOptimizerRow = (candidate, targetKey, ingredients, stockMap, profileKey) => {
  const an = candidate?.evaluation?.analysis;
  const sp = SPP[targetKey];
  const profile = OPT_PROFILES[profileKey] || OPT_PROFILES.produccion;
  const speciesSupp = Number(sp?.supplementation_max) || 20;
  const suppLimit = profile.maxSupp != null ? Math.min(speciesSupp, profile.maxSupp) : speciesSupp;
  const suppPct = hybridSupplementPct(candidate?.recipe || [], ingredients);
  const maxKgWet = Object.keys(stockMap || {}).length && candidate?.recipe?.length ? calcMaxBatchFromStock(candidate.recipe, stockMap, 10, sp?.moisture?.ideal || 65, ingredients) : null;
  return {
    recipe: candidate.recipe,
    an,
    score: Number(candidate.evaluation?.score) || 0,
    riskScore: Number(candidate.evaluation?.riskScore ?? candidate.evaluation?.breakdown?.risk ?? 50),
    maxKgWet,
    suppPct,
    suppOverLimit: suppPct > suppLimit,
    realCostKnown: !!an?.realCostKnown,
    scenario: candidate
  };
};
const hybridOptimizerDiag = (out, targetKey, ingredients, useStock, invLotes, profileKey) => {
  const stockIds = new Set((invLotes || []).filter((l) => l?.activo && Number(l.cantidadKgDisponible) > 0).map((l) => l.ingredienteId));
  const pool = useStock ? (ingredients || []).filter((g) => stockIds.has(g.id)) : (ingredients || []).filter((g) => !Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(targetKey));
  const compatible = (g) => !Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(targetKey);
  const bases = pool.filter((g) => g.role === "base_carbono" && compatible(g) && Number(g.cn) > 0 && Number(g.n) > 0);
  const supps = pool.filter((g) => (g.role === "suplemento_n" || g.role === "suplemento_medio") && compatible(g) && Number(g.cn) > 0 && Number(g.n) > 0);
  const aers = pool.filter((g) => g.role === "aireador");
  return {
    stockIds: stockIds.size,
    poolSize: pool.length,
    bases: bases.length,
    supps: supps.length,
    aers: aers.length,
    tried: Number(out?.explored) || 0,
    resultsRaw: Number(out?.diagnostics?.allowedCount ?? out?.ranked?.length ?? 0),
    suppLimit: Number(out?.profile?.maxSupp ?? SPP[targetKey]?.supplementation_max ?? 20),
    profileKey,
    targetKey,
    baseNames: bases.map((g) => g.name),
    suppNames: supps.map((g) => g.name)
  };
};
const generateQrSvgDataUrl = (text) => {
  try {
    const qrMini = typeof window !== "undefined" ? window.QRMini : typeof globalThis !== "undefined" ? globalThis.QRMini : null;
    if (!qrMini || typeof qrMini.matrix !== "function") {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 10 10"><rect width="10" height="10" fill="%23000"/></svg>';
    }
    const m = qrMini.matrix(text || "SETAS-OS");
    const n = m.length;
    const q = 4;
    const dim = n + q * 2;
    let rects = "";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (m[r][c]) rects += `<rect x="${c + q}" y="${r + q}" width="1" height="1"/>`;
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges"><rect width="${dim}" height="${dim}" fill="#fff"/><g fill="#000">${rects}</g></svg>`;
    return "data:image/svg+xml;base64," + (typeof btoa === "function" ? btoa(svg) : Buffer.from(svg).toString("base64"));
  } catch (e) {
    return "";
  }
};
const FORM_DRAFT_KEY = "setas_formulator_draft_v1";
const readFormDraft = () => {
  try {
    const raw = localStorage.getItem(FORM_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || draft.version !== 1 || !Array.isArray(draft.recipe)) return null;
    const validIds = new Set(INGS.map((g) => g.id));
    const seenIds = /* @__PURE__ */ new Set();
    const recipe = draft.recipe.filter((r) => {
      if (!r || !validIds.has(r.id) || seenIds.has(r.id) || !Number.isFinite(Number(r.p))) return false;
      seenIds.add(r.id);
      return true;
    }).map((r) => ({ id: r.id, p: Math.max(0, Math.min(100, Number(r.p))) }));
    if (!recipe.length) return null;
    const sKey = SPP[draft.sKey] ? draft.sKey : "p_ostreatus_gris";
    const recipeIds = new Set(recipe.map((r) => r.id));
    return {
      recipe,
      sKey,
      hasPickedSpecies: draft.hasPickedSpecies === true && !!SPP[draft.sKey],
      lockedIds: Array.isArray(draft.lockedIds) ? draft.lockedIds.filter((id) => recipeIds.has(id)) : [],
      saveName: typeof draft.saveName === "string" ? draft.saveName.slice(0, 60) : ""
    };
  } catch (e) {
    return null;
  }
};
function App(props) {
  const initialFormDraft = useMemo(() => readFormDraft(), []);
  const [bridgeOpen, setBridgeOpen] = useState(true);
  const [bridgeHidden, setBridgeHidden] = useState(false);
  useEffect(() => {
    const scroller = document.querySelector(".app-main") || window;
    let lastY = scroller === window ? window.scrollY : scroller.scrollTop;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const y = scroller === window ? window.scrollY : scroller.scrollTop;
        const delta = y - lastY;
        if (y < 80) setBridgeHidden(false);
        else if (delta > 16) setBridgeHidden(true);
        else if (delta < -8) setBridgeHidden(false);
        lastY = y;
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const [hasPickedSpecies, setHasPickedSpecies] = useState(() => {
    try {
      const p = normSpp(props.preselectSpecies);
      if (p && SPP[p]) return true;
      const pre = normSpp(localStorage.getItem("sim_preselect_spp"));
      if (pre && SPP[pre]) return true;
    } catch (e) {
    }
    return initialFormDraft?.hasPickedSpecies || false;
  });
  const [sKey, setSKeyRaw] = useState(() => {
    try {
      const p = normSpp(props.preselectSpecies);
      if (p && SPP[p]) return p;
      const pre = normSpp(localStorage.getItem("sim_preselect_spp"));
      if (pre && SPP[pre]) {
        localStorage.removeItem("sim_preselect_spp");
        return pre;
      }
    } catch (e) {
    }
    return initialFormDraft?.sKey || "p_ostreatus_gris";
  });
  const setSKey = (k) => {
    setHasPickedSpecies(true);
    setSKeyRaw(k);
  };
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [sppPickerOpen, setSppPickerOpen] = useState(true);
  const [recipe, setRecipe] = useState(() => initialFormDraft?.recipe || []);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [numBags, setNumBags] = useState(6);
  const [kgBag, setKgBag] = useState(1.5);
  const [spawnCost, setSpawnCost] = useState(12e3);
  const [showOpt, setShowOpt] = useState(false);
  const [hObj, setHObj] = useState(67);
  const [showGuide, setShowGuide] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [saved, setSaved] = useState([]);
  const [saveName, setSaveName] = useState(() => initialFormDraft?.saveName || "");
  const [showSaved, setShowSaved] = useState(false);
  const [flash, setFlash] = useState(false);
  const [saveSyncErr, setSaveSyncErr] = useState("");
  const [loteSyncErr, setLoteSyncErr] = useState("");
  const [bitSyncErr, setBitSyncErr] = React.useState("");
  const [cmpRecipe, setCmpRecipe] = useState([]);
  const [cmpKey, setCmpKey] = useState("p_ostreatus_gris");
  const [tab, setTab] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("view") || "home";
    } catch (e) {
      return "home";
    }
  });
  const TAB_LABELS = { home: "Tablero de Control", inicio: "Inicio", catalogo: "Catálogo", formular: "Formular", inventario: "Bodega", produccion: "Preparar mezcla", schedule: "Cronograma", dashboard: "Recetario", clima: "Clima & IoT", bitacora: "Bitácora" };
  const NAV_GROUPS = [
    { key: "inicio", label: "Inicio", tabs: ["home", "inicio"], icon: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }, /* @__PURE__ */ React.createElement("path", { d: "M3 11l9-7 9 7M5 10v10h14V10" })) },
    { key: "recetas", label: "Formular", tabs: ["catalogo", "formular", "dashboard"], icon: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }, /* @__PURE__ */ React.createElement("path", { d: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9" })) },
    { key: "produccion", label: "Producción", tabs: ["produccion", "inventario", "schedule"], icon: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }, /* @__PURE__ */ React.createElement("path", { d: "M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6" })) },
    { key: "clima", label: "Clima & IoT", tabs: ["clima"], icon: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }, /* @__PURE__ */ React.createElement("path", { d: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })) },
    { key: "registro", label: "Bitácora", tabs: ["bitacora"], icon: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }, /* @__PURE__ */ React.createElement("path", { d: "M5 4h14v16H5zM9 4V2h6v2M8 10h8M8 14h8M8 18h5" })) }
  ];
  const TAB_PAGE_TITLES = { home: "Centro de Mando · Hoy", inicio: "Inicio", catalogo: "Catálogo de especies", formular: "Formulador de receta", inventario: "Bodega", produccion: "Preparar mezcla", schedule: "Cronograma de cultivo", dashboard: "Recetario", clima: "Control Ambiental & Telemetría IoT", bitacora: "Bitácora de pruebas" };
  const [mode, setMode] = useState("receta");
  const RECETA_TABS = ["catalogo", "formular", "dashboard"];
  const CULTIVO_TABS = ["inventario", "produccion", "schedule", "clima", "bitacora"];
  const TAB_ALIASES = { optimizar: "formular" };
  const applyTab = (t) => {
    t = TAB_ALIASES[t] || t;
    setTab(t);
    setMode(RECETA_TABS.includes(t) ? "receta" : "cultivo");
    return t;
  };
  const goTab = (t) => {
    const next = applyTab(t);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("view", next);
      window.history.replaceState(null, "", url);
    } catch (e) {
    }
    if (typeof props.onTabChange === "function") props.onTabChange(next);
  };
  useEffect(() => {
    const onPop = () => {
      try {
        applyTab(new URLSearchParams(window.location.search).get("view") || "home");
      } catch (e) {
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (props.tab) applyTab(props.tab);
  }, [props.tab, props.tabNonce]);
  const _preInit = useRef(true);
  useEffect(() => {
    if (_preInit.current) {
      _preInit.current = false;
      return;
    }
    const k = normSpp(props.preselectSpecies);
    if (k && SPP[k]) {
      setSKey(k);
      goTab("formular");
    }
  }, [props.preselectSpecies, props.preselectNonce]);
  const [schDate, setSchDate] = useState((() => {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })());
  const [schKey, setSchKey] = useState("p_ostreatus_gris");
  const [normMode, setNormMode] = useState(false);
  const [vegPrice, setVegPrice] = useState(12e3);
  const [priceOverrides, setPriceOverrides] = useState({});
  const [showPrices, setShowPrices] = useState(false);
  const [invBase, setInvBase] = useState("");
  const [invSupp, setInvSupp] = useState("");
  const [invAer, setInvAer] = useState("");
  const [invMin, setInvMin] = useState(3);
  const [invAerPct, setInvAerPct] = useState(10);
  const [invTargetCN, setInvTargetCN] = useState(35);
  const [invResult, setInvResult] = useState(null);
  const [dashFilter, setDashFilter] = useState("all");
  const [lockedIds, setLockedIds] = useState(() => initialFormDraft?.lockedIds || []);
  const [balanceMode, setBalanceMode] = useState("proportional");
  const [pantryIds, setPantryIds] = useState([]);
  const [showCompatOnly, setShowCompatOnly] = useState(false);
  const [disabledIngIds, setDisabledIngIds] = useState([]);
  const toggleDisabledIng = (id) => setDisabledIngIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const [justAddedIds, setJustAddedIds] = useState([]);
  const flashAdded = (id) => {
    setJustAddedIds((p) => [...p, id]);
    setTimeout(() => setJustAddedIds((p) => p.filter((x) => x !== id)), 650);
  };
  const [optTarget, setOptTarget] = useState(sKey || "p_ostreatus_gris");
  React.useEffect(() => {
    setOptTarget(sKey);
    setOptResults(null);
  }, [sKey]);
  const [optMaxCost, setOptMaxCost] = useState(0);
  const [optResults, setOptResults] = useState(null);
  const [optRunning, setOptRunning] = useState(false);
  const [optProfile, setOptProfile] = useState("produccion");
  const [showQrSheet, setShowQrSheet] = useState(false);
  const [qrSelectedLoteId, setQrSelectedLoteId] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [showEsp32ConfigModal, setShowEsp32ConfigModal] = useState(false);
  const videoRef = React.useRef(null);
  const scannerIntervalRef = React.useRef(null);
  const stopCameraScanner = () => {
    setIsCameraActive(false);
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };
  const startCameraScanner = async () => {
    setCameraError("");
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Cámara no disponible o no compatible en este navegador");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      if ("BarcodeDetector" in window) {
        const detector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13"] });
        scannerIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue;
              handleScannedValue(rawVal);
            }
          } catch (e) {
          }
        }, 300);
      }
    } catch (err) {
      setCameraError(err.message || "No se pudo acceder al hardware de cámara");
      setIsCameraActive(false);
    }
  };
  const handleScannedValue = (raw) => {
    if (!raw) return;
    const match = raw.match(/(?:(?:trace|c|l)\/|CAN-)?([A-Za-z0-9_-]+)/);
    const code = match ? match[1] : raw;
    const foundLote = bitLotes.find((l) => l.codigo === code || l.id === code || raw.includes(l.codigo) || code && code.startsWith(l.codigo));
    if (foundLote) {
      setQrSelectedLoteId(foundLote.id);
      stopCameraScanner();
      try {
        if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      } catch (e) {
      }
    }
  };
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [thermalLote, setThermalLote] = useState(null);
  const [thermalSize, setThermalSize] = useState("50x30");
  const [thermalScope, setThermalScope] = useState("all");
  const [thermalBagStart, setThermalBagStart] = useState(1);
  const [thermalBagEnd, setThermalBagEnd] = useState(20);
  const [thermalCosechaItem, setThermalCosechaItem] = useState(null);
  const [showTastingModal, setShowTastingModal] = useState(false);
  const [tastingSpeciesKey, setTastingSpeciesKey] = useState("p_ostreatus_gris");
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [diagLoteId, setDiagLoteId] = useState("");
  const [diagBolsaId, setDiagBolsaId] = useState("");
  const [diagImageBase64, setDiagImageBase64] = useState("");
  const [diagImageMime, setDiagImageMime] = useState("image/jpeg");
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [diagError, setDiagError] = useState("");
  const [diagNotes, setDiagNotes] = useState("");
  const ROOMS_CONFIG = {
    martha_01: {
      id: "martha_01",
      name: "Martha Tent 01",
      spec: 'Terra Fungus 63" (165 × 70 × 51 cm)',
      device: "ESP32-WROOM-32 (setas-martha-01)",
      sensors: "Sensirion SHT3x + Sensirion SCD30 (NDIR)",
      altitude: "2.600 msnm (Tenjo)"
    },
    cloudlab_844: {
      id: "cloudlab_844",
      name: "Cloudlab 844",
      spec: 'AC Infinity 48×48×80" (122 × 122 × 203 cm · 3.02 m³)',
      device: "ESP32-WROOM-32 (setas-cloudlab-01)",
      sensors: "Sensirion SHT45 + Sensirion SCD30 (NDIR)",
      altitude: "2.600 msnm (Tenjo)"
    }
  };
  const [selectedClimateRoom, setSelectedClimateRoom] = useState("martha_01");
  const [climateTimeRange, setClimateTimeRange] = useState("24h");
  const [faePulseActive, setFaePulseActive] = useState(false);
  const [humidifierOverride, setHumidifierOverride] = useState(null);
  const [showProdLaunchModal, setShowProdLaunchModal] = useState(false);
  const [prodLaunchForm, setProdLaunchForm] = useState(null);
  const [showIoTHub, setShowIoTHub] = useState(false);
  const [injectedClimateReadings, setInjectedClimateReadings] = useState({});
  const [globalMode, setGlobalMode] = useState(() => {
    try {
      const v = localStorage.getItem("setas_global_workmode");
      if (v === "investigacion" || v === "catalogo") return "investigacion";
      const w = localStorage.getItem("setas_workmode");
      if (w === "catalogo") return "investigacion";
    } catch (e) {
    }
    return "produccion";
  });
  const [usePantry, setUsePantry] = useState(globalMode === "produccion");
  const recipeRef = React.useRef(recipe);
  React.useEffect(() => {
    recipeRef.current = recipe;
  }, [recipe]);
  const lockedIdsRef = React.useRef(lockedIds);
  React.useEffect(() => {
    lockedIdsRef.current = lockedIds;
  }, [lockedIds]);
  const batchRef = React.useRef({ numBags, kgBag });
  React.useEffect(() => {
    batchRef.current = { numBags, kgBag };
  }, [numBags, kgBag]);
  React.useEffect(() => {
    const api = globalThis.SetasFormulatorAPI;
    if (!api || typeof api.registerNativeAdapter !== "function") return;
    const adapter = {
      getRecipe: () => recipeRef.current,
      getLockedIds: () => new Set(lockedIdsRef.current),
      getBatchWetKg: () => batchRef.current.numBags * batchRef.current.kgBag,
      applyRecipe: async (targetRecipe) => {
        setRecipe(targetRecipe);
        return { ok: true, recipe: targetRecipe, adapter: "native" };
      }
    };
    const unregister = api.registerNativeAdapter(adapter);
    return () => {
      if (typeof unregister === "function") unregister();
    };
  }, []);
  const [optUseStock, setOptUseStock] = useState(globalMode === "produccion");
  const setGlobalWorkMode = (mode2) => {
    setGlobalMode(mode2);
    const stockOnly = mode2 === "produccion";
    setOptUseStock(stockOnly);
    setUsePantry(stockOnly);
    try {
      localStorage.setItem("setas_global_workmode", mode2);
      localStorage.setItem("setas_workmode", mode2 === "produccion" ? "bodega" : "catalogo");
    } catch (e) {
    }
  };
  useEffect(() => {
    try {
      if (!recipe.length) {
        localStorage.removeItem(FORM_DRAFT_KEY);
        return;
      }
      localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify({
        version: 1,
        savedAt: (/* @__PURE__ */ new Date()).toISOString(),
        recipe: recipe.map((r) => ({ id: r.id, p: Number(r.p) || 0 })),
        sKey,
        hasPickedSpecies,
        lockedIds: lockedIds.filter((id) => recipe.some((r) => r.id === id)),
        saveName: saveName.slice(0, 60)
      }));
    } catch (e) {
    }
  }, [recipe, sKey, hasPickedSpecies, lockedIds, saveName]);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const [showLiveChips, setShowLiveChips] = useState(true);
  const [groupByRole, setGroupByRole] = useState(true);
  const [collapsedRoles, setCollapsedRoles] = useState({ base_carbono: false, suplemento_n: false, aditivo: false, aireador: false, otro: false });
  const toggleRoleCollapse = (roleKey) => setCollapsedRoles((prev) => ({ ...prev, [roleKey]: !prev[roleKey] }));
  const setAllRoleGroups = (collapsed) => setCollapsedRoles({ base_carbono: collapsed, suplemento_n: collapsed, aditivo: collapsed, aireador: collapsed, otro: collapsed });
  const [prodBags, setProdBags] = useState(6);
  const [prodKg, setProdKg] = useState(1.5);
  const [prodH, setProdH] = useState(67);
  const [prodDate, setProdDate] = useState((() => {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })());
  const [prodScaleG, setProdScaleG] = useState(0.1);
  const [prodMoist, setProdMoist] = useState({});
  const [prodLoteNum, setProdLoteNum] = useState("");
  const [checkedSteps, setCheckedSteps] = useState({});
  const [loteBatchConfirm, setLoteBatchConfirm] = useState(null);
  const [confirmDlg, setConfirmDlg] = useState(null);
  const [promptDlg, setPromptDlg] = useState(null);
  const [noticeDlg, setNoticeDlg] = useState(null);
  const [bitLotes, setBitLotes] = useState([]);
  const [bitBolsas, setBitBolsas] = useState([]);
  const [bitCosechas, setBitCosechas] = useState([]);
  const [bitTab, setBitTab] = useState("bit_dash");
  const [bitActiveLoteId, setBitActiveLoteId] = useState(null);
  const applyBitTab = (raw, hasActiveLote = !!bitActiveLoteId) => {
    const allowed = ["bit_dash", "bit_bolsas", "bit_cosechas", "bit_comparador", "bit_ficha"];
    const requested = allowed.includes(raw) ? raw : "bit_dash";
    const needsLote = ["bit_bolsas", "bit_cosechas", "bit_ficha"].includes(requested);
    const next = needsLote && !hasActiveLote ? "bit_dash" : requested;
    setBitTab(next);
    return next;
  };
  const goBitTab = (raw, hasActiveLote) => {
    const next = applyBitTab(raw, hasActiveLote);
    if (typeof props.onBitSubtabChange === "function") props.onBitSubtabChange(next);
  };
  useEffect(() => {
    if (!props.bitSubtab) return;
    const next = applyBitTab(props.bitSubtab);
    if (next !== props.bitSubtab && typeof props.onBitSubtabChange === "function") props.onBitSubtabChange(next);
  }, [props.bitSubtab, props.bitSubtabNonce, bitActiveLoteId]);
  const [bitDashView, setBitDashView] = useState("grid");
  const [showBitNuevo, setShowBitNuevo] = useState(false);
  const [bitNuevoForm, setBitNuevoForm] = useState({});
  const [showBitCosecha, setShowBitCosecha] = useState(false);
  const [bitCosechaForm, setBitCosechaForm] = useState({});
  const [prodBagType, setProdBagType] = useState("bolsa_20x50");
  const [showFlush, setShowFlush] = useState(false);
  const [showCompChart, setShowCompChart] = useState(false);
  const [showSpeciesRec, setShowSpeciesRec] = useState(false);
  const [invProveedores, setInvProveedores] = useState([]);
  const [invCompras, setInvCompras] = useState([]);
  const [invLotes, setInvLotes] = useState([]);
  const [invMovimientos, setInvMovimientos] = useState([]);
  const [invTab, setInvTab] = useState("stock");
  const [formularMode, setFormularMode] = useState("auto");
  const [showOptimizer, setShowOptimizer] = useState(true);
  const [builderSubTab, setBuilderSubTab] = useState("formular");
  const focusFormTop = () => requestAnimationFrame(() => {
    const main = document.getElementById("setas-main");
    if (main) main.scrollTo({ top: 0, left: 0 });
  });
  const focusIngredientCatalog = () => {
    document.getElementById("bl-ingredientes")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => document.querySelector("#bl-ingredientes .search")?.focus(), 250);
  };
  const focusActiveRecipe = () => {
    setShowLiveChips(true);
    setTimeout(() => {
      document.getElementById("bl-receta")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => document.querySelector("#bl-receta .rec-pct-input")?.focus(), 250);
    }, 0);
  };
  const openBuilderSubTab = (next, { focusTab = false } = {}) => {
    setBuilderSubTab(next);
    focusFormTop();
    if (focusTab) {
      requestAnimationFrame(() => document.getElementById(next === "formular" ? "formular-tab-mesa" : "formular-tab-generador")?.focus());
    }
  };
  const onBuilderTabKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === "Home" || e.key === "ArrowLeft" ? "formular" : "generador";
    openBuilderSubTab(next, { focusTab: true });
  };
  const [loadedFlash, setLoadedFlash] = useState(false);
  const [cmpFecha, setCmpFecha] = useState((() => {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })());
  const [cmpProvId, setCmpProvId] = useState("");
  const [cmpFuente, setCmpFuente] = useState("manual");
  const [cmpItems, setCmpItems] = useState([{ uid: 1, ingId: "", kg: "", precio: "" }]);
  const [cmpMode, setCmpMode] = useState("manual");
  const [cmpPasteText, setCmpPasteText] = useState("");
  const [cmpParsing, setCmpParsing] = useState(false);
  const [cmpParseErr, setCmpParseErr] = useState("");
  const [huboParseIA, setHuboParseIA] = useState(false);
  const [cmpLastFoto, setCmpLastFoto] = useState(null);
  const [cmpConfirm, setCmpConfirm] = useState(null);
  const cmpFileRef = useRef(null);
  const [showProvModal, setShowProvModal] = useState(false);
  const [newProv, setNewProv] = useState({ nombre: "", tipo: "plaza", municipio: "" });
  const [publicTraceModalLoteId, setPublicTraceModalLoteId] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get("trace") || p.get("c") || null;
    } catch (e) {
      return null;
    }
  });
  React.useEffect(() => {
    const anyModalOpen = !!(confirmDlg || promptDlg || noticeDlg || loteBatchConfirm || showBitNuevo || showBitCosecha || showQrSheet || showThermalModal || showDiagModal || showProvModal || catalogModalOpen || showProdLaunchModal || publicTraceModalLoteId);
    if (!anyModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [confirmDlg, promptDlg, noticeDlg, loteBatchConfirm, showBitNuevo, showBitCosecha, showQrSheet, showThermalModal, showDiagModal, showProvModal, catalogModalOpen, showProdLaunchModal, publicTraceModalLoteId]);
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRowData, setEditingRowData] = useState({ stock: "", precio: "", proveedorId: "", alertaMin: "", ingredienteNuevoId: "" });
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [addStockId, setAddStockId] = useState("");
  const [addStockKg, setAddStockKg] = useState("");
  const [alertaConfig, setAlertaConfig] = useState({});
  const [provOverride, setProvOverride] = useState({});
  const saveRowEdit = (ingredienteId) => {
    const { stock, precio, proveedorId, alertaMin, ingredienteNuevoId } = editingRowData;
    const kg = Math.max(0, parseFloat(stock) || 0);
    const pr = Math.max(0, parseFloat(precio) || 0);
    const nuevoId = ingredienteNuevoId && ingredienteNuevoId !== ingredienteId ? ingredienteNuevoId : null;
    const targetId = nuevoId || ingredienteId;
    setInvLotes((prev) => {
      let updated = nuevoId ? prev.map((l) => l.ingredienteId === ingredienteId ? { ...l, ingredienteId: nuevoId } : l) : [...prev];
      const activos = updated.filter((l) => l.activo && l.ingredienteId === targetId);
      if (activos.length === 0) {
        const loteId = "lote_manual_" + Date.now();
        updated = [...updated, { id: loteId, compraId: "ajuste_manual", ingredienteId: targetId, cantidadKgTotal: kg, precioPorKgCOP: pr, fechaIngreso: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], cantidadKgDisponible: kg, activo: true }];
      } else if (activos.length === 1) {
        updated = updated.map((l) => l.id === activos[0].id ? { ...l, cantidadKgDisponible: kg, cantidadKgTotal: Math.max(l.cantidadKgTotal, kg), precioPorKgCOP: pr } : l);
      } else {
        const totalActual = activos.reduce((s, l) => s + l.cantidadKgDisponible, 0);
        updated = updated.map((l) => {
          if (!l.activo || l.ingredienteId !== targetId) return l;
          const fraccion = totalActual > 0 ? l.cantidadKgDisponible / totalActual : 1 / activos.length;
          return { ...l, cantidadKgDisponible: Math.round(kg * fraccion * 100) / 100, precioPorKgCOP: pr };
        });
      }
      try {
        localStorage.setItem("sdp_lotes", JSON.stringify(updated));
      } catch (e) {
      }
      return updated;
    });
    if (nuevoId) {
      setInvCompras((prev) => {
        const upd = prev.map((c) => ({ ...c, items: c.items.map((it) => it.ingredienteId === ingredienteId ? { ...it, ingredienteId: nuevoId } : it) }));
        try {
          localStorage.setItem("sdp_compras", JSON.stringify(upd));
        } catch (e) {
        }
        return upd;
      });
    }
    if (proveedorId) {
      const upd = { ...provOverride, [targetId]: proveedorId };
      setProvOverride(upd);
      try {
        localStorage.setItem("sdp_prov_override", JSON.stringify(upd));
      } catch (e) {
      }
    }
    const am = parseFloat(alertaMin);
    if (!isNaN(am) && am >= 0) {
      const upd = { ...alertaConfig, [targetId]: am };
      setAlertaConfig(upd);
      try {
        localStorage.setItem("sdp_alertas", JSON.stringify(upd));
      } catch (e) {
      }
    }
    setEditingRowId(null);
  };
  const eliminarIngrediente = (ingredienteId, nombre) => {
    const doDelete = () => {
      setInvLotes((prev) => {
        const upd = prev.map((l) => l.ingredienteId === ingredienteId ? { ...l, activo: false } : l);
        try {
          localStorage.setItem("sdp_lotes", JSON.stringify(upd));
        } catch (e) {
        }
        return upd;
      });
      try {
        const pantry = JSON.parse(localStorage.getItem("sdp_pantry") || "{}");
        delete pantry[ingredienteId];
        localStorage.setItem("sdp_pantry", JSON.stringify(pantry));
      } catch (e) {
      }
    };
    setConfirmDlg({ title: "Eliminar stock", msg: `¿Eliminar todo el stock de "${nombre}"? Esto marcará los lotes como inactivos. Los movimientos e historial de compras se conservan.`, danger: true, confirmLabel: "Eliminar", onConfirm: doDelete });
  };
  const saveStockEdit = (ingredienteId, nuevoKg) => {
    const kg = Math.max(0, parseFloat(nuevoKg) || 0);
    setInvLotes((prev) => {
      let updated = [...prev];
      const activos = updated.filter((l) => l.activo && l.ingredienteId === ingredienteId);
      if (activos.length === 0) {
        const loteId = "lote_manual_" + Date.now();
        updated = [...updated, { id: loteId, compraId: "ajuste_manual", ingredienteId, cantidadKgTotal: kg, precioPorKgCOP: 0, fechaIngreso: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], cantidadKgDisponible: kg, activo: true }];
      } else if (activos.length === 1) {
        updated = updated.map((l) => l.id === activos[0].id ? { ...l, cantidadKgDisponible: kg, cantidadKgTotal: Math.max(l.cantidadKgTotal, kg) } : l);
      } else {
        const totalActual = activos.reduce((s, l) => s + l.cantidadKgDisponible, 0);
        updated = updated.map((l) => {
          if (!l.activo || l.ingredienteId !== ingredienteId) return l;
          const fraccion = totalActual > 0 ? l.cantidadKgDisponible / totalActual : 1 / activos.length;
          return { ...l, cantidadKgDisponible: Math.round(kg * fraccion * 100) / 100 };
        });
      }
      try {
        localStorage.setItem("sdp_lotes", JSON.stringify(updated));
      } catch (e) {
      }
      return updated;
    });
  };
  useEffect(() => {
    try {
      const seeded = localStorage.getItem("sdp_seeded");
      if (!seeded) {
        localStorage.setItem("sdp_proveedores", JSON.stringify(SEED_PROVEEDORES));
        localStorage.setItem("sdp_compras", JSON.stringify(SEED_COMPRAS));
        localStorage.setItem("sdp_lotes", JSON.stringify(SEED_LOTES));
        localStorage.setItem("sdp_movimientos", JSON.stringify(SEED_MOVIMIENTOS));
        localStorage.setItem("sdp_seeded", "1");
        setInvProveedores(SEED_PROVEEDORES);
        setInvCompras(SEED_COMPRAS);
        setInvLotes(SEED_LOTES);
        setInvMovimientos(SEED_MOVIMIENTOS);
      } else {
        const p = localStorage.getItem("sdp_proveedores");
        const c = localStorage.getItem("sdp_compras");
        const l = localStorage.getItem("sdp_lotes");
        const m = localStorage.getItem("sdp_movimientos");
        if (p) setInvProveedores(JSON.parse(p));
        if (c) setInvCompras(JSON.parse(c));
        if (l) setInvLotes(JSON.parse(l));
        if (m) setInvMovimientos(JSON.parse(m));
      }
    } catch (e) {
    }
    try {
      const bl = localStorage.getItem("sdp_bit_lotes");
      const bb = localStorage.getItem("sdp_bit_bolsas");
      const bc = localStorage.getItem("sdp_bit_cosechas");
      if (bl) setBitLotes(JSON.parse(bl));
      if (bb) setBitBolsas(JSON.parse(bb));
      if (bc) setBitCosechas(JSON.parse(bc));
    } catch (e) {
      setNoticeDlg({ title: "No se pudo cargar la Bitácora", msg: "Los datos guardados de lotes experimentales no se pudieron leer (formato dañado). No se sobrescribieron: revisa el almacenamiento del navegador antes de crear nuevos lotes." });
    }
  }, []);
  useEffect(() => {
    if (!invLotes.length) return;
    const inStockIds = [...new Set(invLotes.filter((l) => l.activo && l.cantidadKgDisponible > 0).map((l) => l.ingredienteId))];
    setPantryIds(inStockIds);
  }, [invLotes]);
  useEffect(() => {
    try {
      const s = localStorage.getItem("setas_v6");
      if (s) setSaved(JSON.parse(s));
    } catch (e) {
    }
    ;
  }, []);
  useEffect(() => {
    if (props.onSavedChange) props.onSavedChange(saved);
  }, [saved]);
  useEffect(() => {
    try {
      const s = localStorage.getItem("setas_prices_v1");
      if (s) setPriceOverrides(JSON.parse(s));
    } catch (e) {
    }
    ;
  }, []);
  useEffect(() => {
    try {
      const s = localStorage.getItem("sdp_alertas");
      if (s) setAlertaConfig(JSON.parse(s));
    } catch (e) {
    }
    ;
  }, []);
  useEffect(() => {
    try {
      const s = localStorage.getItem("sdp_prov_override");
      if (s) setProvOverride(JSON.parse(s));
    } catch (e) {
    }
    ;
  }, []);
  const saveR = () => {
    const nm = saveName.trim();
    if (!nm || !recipe.length || !balanced || !hasPickedSpecies) return;
    const trSave = an ? calcTreatment(an, sKey, SPP) : null;
    const e = { id: Date.now(), name: nm, sKey, recipe: [...recipe], date: (/* @__PURE__ */ new Date()).toLocaleDateString("es-CO"), eb: an ? an.eb.toFixed(0) : "—", cn: an ? an.cn.toFixed(1) : "—", score: opt.score, cost: an ? Math.round(an.cost) : 0, treatCol: trSave?.col || null, energyCopKg: trSave?.energy?.cop_per_kg_seco || 0 };
    const u = [e, ...saved];
    setSaved(u);
    try {
      localStorage.setItem("setas_v6", JSON.stringify(u));
    } catch (e2) {
    }
    setSaveName("");
    setFlash(true);
    setSaveSyncErr("");
    setTimeout(() => setFlash(false), 1500);
    if (window.SetasDB) {
      window.SetasDB.saveReceta({
        nombre: nm,
        sKey,
        ingredientes: recipe.map((r) => ({ id: r.id, pct: parseFloat(r.p) || 0 })),
        cn: an ? an.cn : null,
        eb: an ? an.eb : null,
        cost: an ? Math.round(an.cost) : null,
        score: opt.score
      }).catch((err) => setSaveSyncErr("No se sincronizó con el servidor: " + (err.message || err.code || "error desconocido")));
    }
  };
  const promoverReceta = (recetaObj) => {
    const targetRecipe = recetaObj?.recipe || recipe;
    const targetSKey = recetaObj?.sKey || sKey;
    const targetName = recetaObj?.name || "Receta activa";
    if (!targetRecipe.length) {
      setNoticeDlg({ title: "Sin receta", msg: "No hay ingredientes en la receta para promover a producción." });
      return;
    }
    const missingStock = [];
    targetRecipe.forEach((r) => {
      const g = effectiveINGS.find((x) => x.id === r.id);
      const inStockKg = stockMap[r.id] || 0;
      if (inStockKg <= 0 || !stockIds.has(r.id)) {
        missingStock.push({ name: g?.name || r.id, pct: r.p, inStockKg });
      }
    });
    const executePromotion = () => {
      setGlobalWorkMode("produccion");
      if (recetaObj && recetaObj.id) {
        const u = saved.map((s) => s.id === recetaObj.id ? { ...s, esProduccion: true, fechaPromocion: (/* @__PURE__ */ new Date()).toLocaleDateString("es-CO") } : s);
        setSaved(u);
        try {
          localStorage.setItem("setas_v6", JSON.stringify(u));
        } catch (e) {
        }
      }
      setSKey(targetSKey);
      setRecipe(targetRecipe);
      goTab("produccion");
      setNoticeDlg({
        title: "⭐ Receta promovida a Producción",
        msg: `La receta "${targetName}" ha sido promovida a Producción oficial. Se han cargado los parámetros en la Hoja de Producción lista para lote.`
      });
    };
    if (missingStock.length > 0) {
      setConfirmDlg({
        title: "⭐ Promover a Producción — Insumos Faltantes",
        msg: `La receta "${targetName}" incluye ingredientes sin stock suficiente en Bodega Tenjo:

• ${missingStock.map((m) => `${m.name} (${m.pct}%) — Stock actual: ${m.inStockKg.toFixed(1)} kg`).join("\n• ")}

¿Deseas promoverla para planificar la producción y compra de insumos?`,
        confirmLabel: "Promover y planificar",
        onConfirm: executePromotion
      });
    } else {
      executePromotion();
    }
  };
  const loadR = (e) => {
    const apply = () => {
      setSKey(e.sKey);
      setRecipe(e.recipe);
      setLockedIds([]);
      openBuilderSubTab("formular");
      goTab("formular");
      setLoadedFlash(true);
      setTimeout(() => setLoadedFlash(false), 2200);
    };
    if (recipe.length > 0) {
      setConfirmDlg({ title: "Reemplazar receta activa", msg: `¿Reemplazar la receta activa con "${e.name}"? Se perderán los cambios sin guardar.`, onConfirm: apply });
      return;
    }
    apply();
  };
  const requireAdmin = (fn) => (...args) => {
    if (!props.isAdmin) {
      setNoticeDlg({ title: "Acción restringida", msg: "Solo un administrador puede hacer esto. Si te corresponde, cámbiate de operador en el encabezado (ícono de usuario)." });
      return;
    }
    fn(...args);
  };
  const delR = (id) => {
    setConfirmDlg({ title: "Eliminar receta", msg: "¿Eliminar esta receta guardada? Esta acción no se puede deshacer.", danger: true, confirmLabel: "Eliminar", onConfirm: () => {
      const u = saved.filter((r) => r.id !== id);
      setSaved(u);
      try {
        localStorage.setItem("setas_v6", JSON.stringify(u));
      } catch (e) {
      }
    } });
  };
  const setEbRealFor = (id) => {
    const entry = saved.find((s) => s.id === id);
    if (!entry) return;
    setPromptDlg({ title: "Registrar EB real", label: `EB real obtenida al final del ciclo (%) · estimado: ${entry.eb}%`, placeholder: String(entry.eb), confirmLabel: "Guardar", onSubmit: (val) => {
      const n = parseFloat(val);
      if (!Number.isFinite(n)) return;
      const u = saved.map((s) => s.id === id ? { ...s, ebReal: Math.round(n * 10) / 10 } : s);
      setSaved(u);
      try {
        localStorage.setItem("setas_v6", JSON.stringify(u));
      } catch (e) {
      }
    } });
  };
  const sp = SPP[sKey];
  const effectiveINGS = useMemo(() => INGS.map((ing) => {
    const invPr = precioPonderado(ing.id, invLotes);
    if (invPr !== null) return { ...ing, cost: Math.round(invPr) };
    if (priceOverrides[ing.id] !== void 0) return { ...ing, cost: priceOverrides[ing.id] };
    return ing;
  }), [priceOverrides, invLotes]);
  const optimizerINGS = useMemo(() => effectiveINGS.filter((g) => !disabledIngIds.includes(g.id)), [effectiveINGS, disabledIngIds]);
  const fings = useMemo(() => effectiveINGS.filter((g) => {
    const ms = search === "" || g.name.toLowerCase().includes(search.toLowerCase()) || g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const roleMatch = cat === "all" || (cat === "aditivo" ? ["aditivo_ph", "aditivo_estructura", "aditivo_micronutriente", "aditivo_arrancador"].includes(g.role) : g.role === cat);
    return ms && roleMatch;
  }).sort((a, b) => a.name.localeCompare(b.name)), [search, cat, effectiveINGS]);
  const visibleIngredients = useMemo(() => {
    let rows = usePantry ? fings.filter((g) => pantryIds.includes(g.id)) : fings;
    if (showCompatOnly) {
      const compatibleIds = new Set(INGS.filter((i) => i.cs && i.cs.includes(sKey)).map((i) => i.id));
      rows = rows.filter((g) => compatibleIds.has(g.id));
    }
    return rows;
  }, [usePantry, fings, pantryIds, showCompatOnly, sKey]);
  const showRoleGroups = groupByRole && cat === "all" && search.trim().length === 0;
  const hasIngredientViewFilters = cat !== "all" || search.trim().length > 0 || showCompatOnly;
  const resetIngredientView = () => {
    setSearch("");
    setCat("all");
    setShowCompatOnly(false);
    setGroupByRole(true);
    setAllRoleGroups(false);
  };
  const histRows = useMemo(() => bitacoraEBRows(bitLotes, bitCosechas), [bitLotes, bitCosechas]);
  const histStats = useMemo(() => historicalEB(sKey, histRows, recipe), [sKey, histRows, recipe]);
  const an = useMemo(() => analyze(recipe, sKey, effectiveINGS), [recipe, sKey, effectiveINGS]);
  const balanced = isMassBalanced(an);
  const balMsg = balanced ? "" : massBalanceMsg(an);
  const readyForProduction = balanced && hasPickedSpecies;
  const productionBlockMsg = !hasPickedSpecies ? "Selecciona explícitamente la especie antes de guardar o producir." : balMsg;
  const optimalAn = useMemo(() => {
    try {
      const r = runHybridRecipeSearch({
        targetKey: sKey,
        recipe: [],
        invLotes,
        maxCost: 0,
        ingredients: optimizerINGS,
        useStock: false,
        profileKey: "produccion",
        stockMap: {}
      });
      return r.ranked?.[0]?.evaluation?.analysis || null;
    } catch (e) {
      return null;
    }
  }, [sKey, invLotes, optimizerINGS]);
  const dg = useMemo(() => diagnose(an, sKey), [an, sKey]);
  const tr = useMemo(() => calcTreatment(an, sKey, SPP), [an, sKey]);
  const bd = useMemo(() => showBatch ? calcBatch(recipe, numBags, kgBag, hObj, spawnCost, effectiveINGS, an?.dynSpawn) : null, [recipe, numBags, kgBag, showBatch, hObj, spawnCost, effectiveINGS, an?.dynSpawn]);
  const prodRows = useMemo(() => {
    if (!recipe.length || !balanced) return null;
    const prodIngs = effectiveINGS.map((g) => prodMoist[g.id] != null ? { ...g, moisture: prodMoist[g.id] } : g);
    const pb = calcBatch(recipe, prodBags || 1, prodKg || 1.5, prodH || 67, spawnCost, prodIngs, an?.dynSpawn);
    if (!pb) return null;
    const resG = prodScaleG || 0.1;
    const roundG = (x) => Math.round(x / resG) * resG;
    return recipe.map((r) => {
      const g = prodIngs.find((x) => x.id === r.id);
      const it = g ? pb.items.find((x) => x.name === g.name) : null;
      const krTeo = it ? it.kr : 0;
      const grR = roundG(krTeo * 1e3);
      const m = g ? Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)) : 0;
      const masaSecaR = grR / 1e3 * (1 - m);
      return { g, r, krTeo, grR, m, masaSecaR };
    });
  }, [recipe, effectiveINGS, prodMoist, prodBags, prodKg, prodH, spawnCost, prodScaleG, an]);
  const stockIds = useMemo(() => new Set(invLotes.filter((l) => l.activo && l.cantidadKgDisponible > 0).map((l) => l.ingredienteId)), [invLotes]);
  const stockMap = useMemo(() => {
    const m = {};
    invLotes.filter((l) => l.activo && l.cantidadKgDisponible > 0).forEach((l) => {
      m[l.ingredienteId] = (m[l.ingredienteId] || 0) + l.cantidadKgDisponible;
    });
    return m;
  }, [invLotes]);
  const lowStockCount = useMemo(() => {
    const registeredIds = [...new Set(invLotes.filter((l) => l.activo).map((l) => l.ingredienteId))];
    return registeredIds.filter((id) => (stockMap[id] || 0) < (alertaConfig[id] ?? 2)).length;
  }, [invLotes, stockMap, alertaConfig]);
  useEffect(() => {
    if (typeof props.onStockAlertChange === "function") props.onStockAlertChange(lowStockCount);
  }, [lowStockCount]);
  const formularConStockBodega = () => {
    const availableStockIds = Object.keys(stockMap).filter((id) => Number(stockMap[id]) > 0);
    if (!availableStockIds.length) {
      setNoticeDlg({
        title: "Bodega sin existencias",
        msg: "No hay ingredientes con stock disponible en bodega. Registra compras o inventario en la pestaña Bodega antes de formular."
      });
      return;
    }
    try {
      const r = runHybridRecipeSearch({
        targetKey: sKey,
        recipe: [],
        invLotes,
        useStock: true,
        stockMap,
        ingredients: INGS,
        profileKey: optProfile || "produccion"
      });
      let cand = r.recommended && r.recommended[0] || r.ranked && r.ranked[0] || r.pareto && r.pareto[0] || (r.best?.recipe?.length ? r.best : null);
      if (!cand || !cand.recipe || !cand.recipe.length) {
        const availableBases = availableStockIds.filter((id) => INGS.find((g) => g.id === id)?.role === "base_carbono");
        const availableSupps = availableStockIds.filter((id) => {
          const role = INGS.find((g) => g.id === id)?.role;
          return role === "suplemento_n" || role === "suplemento_medio";
        });
        if (availableBases.length) {
          const baseId = availableBases[0];
          const suppId = availableSupps.length ? availableSupps[0] : null;
          const hasCal = availableStockIds.includes("carbonato_calcio");
          const hasYeso = availableStockIds.includes("yeso");
          const calPct = hasCal ? 3 : 0;
          const yesoPct = hasYeso ? 2 : 0;
          const suppPct = suppId ? 15 : 0;
          const basePct = 100 - calPct - yesoPct - suppPct;
          const fallbackRec = [{ id: baseId, pct: basePct }];
          if (suppId) fallbackRec.push({ id: suppId, pct: suppPct });
          if (hasCal) fallbackRec.push({ id: "carbonato_calcio", pct: calPct });
          if (hasYeso) fallbackRec.push({ id: "yeso", pct: yesoPct });
          cand = { recipe: fallbackRec };
        }
      }
      if (!cand || !cand.recipe || !cand.recipe.length) {
        setNoticeDlg({
          title: "Sin combinación viable con stock actual",
          msg: `Los ingredientes disponibles en bodega no alcanzan para balancear la relación C:N y humedad de ${sp?.name || "la especie"}. Intenta agregar una base de carbono o suplemento nitrogenado en Bodega.`
        });
        return;
      }
      const formatted = cand.recipe.map((item) => ({ id: item.id, pct: Number(item.p || item.pct || 0) }));
      setRecipe(formatted);
      const maxBatch = calcMaxBatchFromStock(cand.recipe, stockMap, 10, sp?.moisture?.ideal || 65, INGS);
      setNoticeDlg({
        title: "Receta formulada con stock de bodega",
        msg: `Se cargó la fórmula óptima para ${sp?.name || "la especie"} usando exclusivamente insumos en existencia. Capacidad estimada: ${maxBatch?.maxBolsas || 10} bolsas (${(maxBatch?.maxKgWet || 15).toFixed(1)} kg sustrato húmedo).`
      });
    } catch (err) {
      setNoticeDlg({
        title: "Error al formular con stock",
        msg: err?.message || "No se pudo generar la receta con el stock actual."
      });
    }
  };
  const blendedEB = an ? blendEBWithHistory(an, histStats) : null;
  const [appliedIcons, setAppliedIcons] = React.useState({});
  React.useEffect(() => {
    setAppliedIcons({});
  }, [sKey]);
  const [usageCounts, setUsageCounts] = React.useState({});
  React.useEffect(() => {
    setUsageCounts({});
  }, [sKey]);
  const opt = useMemo(() => generateOptimizer(an, sKey, stockIds, recipe, optimizerINGS, lockedIds, blendedEB, optUseStock, appliedIcons, void 0, usageCounts), [an, sKey, stockIds, recipe, optimizerINGS, lockedIds, blendedEB, optUseStock, appliedIcons, usageCounts]);
  const realCostPerKg = useMemo(() => {
    if (!recipe.length) return null;
    let known = false;
    const total = recipe.reduce((s, r) => {
      const pp = precioPonderado(r.id, invLotes);
      const g = effectiveINGS.find((i) => i.id === r.id);
      if (pp != null) known = true;
      const price = pp != null ? pp : g ? g.cost : 0;
      return s + price * (parseFloat(r.p) || 0) / 100;
    }, 0);
    return known ? Math.round(total) : null;
  }, [recipe, invLotes, effectiveINGS]);
  const recipeSimilarity = (recA, recB) => {
    const a = new Set(recA.map((r) => r.id)), b = new Set(recB.map((r) => r.id));
    const inter = [...a].filter((x) => b.has(x)).length;
    const union = (/* @__PURE__ */ new Set([...a, ...b])).size;
    return union ? inter / union : 0;
  };
  const trialsWithReal = useMemo(() => saved.filter((s) => s.sKey === sKey && s.ebReal != null), [saved, sKey]);
  const modelAccuracy = useMemo(() => {
    if (!trialsWithReal.length) return null;
    const avgAbsDiff = trialsWithReal.reduce((s, t) => s + Math.abs(t.ebReal - parseFloat(t.eb)), 0) / trialsWithReal.length;
    return Math.round(avgAbsDiff * 10) / 10;
  }, [trialsWithReal]);
  const similarTrial = useMemo(() => {
    if (!recipe.length || !trialsWithReal.length) return null;
    let best = null, bestSim = 0;
    trialsWithReal.forEach((t) => {
      const sim = recipeSimilarity(recipe, t.recipe || []);
      if (sim > bestSim) {
        bestSim = sim;
        best = t;
      }
    });
    return bestSim >= 0.5 ? { ...best, similarity: bestSim } : null;
  }, [recipe, trialsWithReal]);
  const cAn = useMemo(() => analyze(cmpRecipe, cmpKey, effectiveINGS), [cmpRecipe, cmpKey, effectiveINGS]);
  const sch = useMemo(() => calcSchedule(schKey, schDate, an?.eb), [schKey, schDate, an]);
  const liveScoreFor = (e) => {
    if (!e?.recipe?.length) return 0;
    const a2 = analyze(e.recipe, e.sKey, effectiveINGS);
    if (!a2) return 0;
    const tr2 = calcTreatment(a2, e.sKey, SPP);
    return scoreAn(a2, { treatment: tr2, recipe: e.recipe, stockIds }).score;
  };
  const addI = (id) => {
    if (recipe.find((r) => r.id === id)) return;
    setRecipe([...recipe, { id, p: 10 }]);
  };
  const [recipeHistory, setRecipeHistory] = React.useState([]);
  const applyOptStep = (apply, icon) => {
    if (!apply) return;
    setRecipeHistory((h) => [...h, recipe]);
    setRecipe(applyOptToRecipe(recipe, apply, lockedIds, optimizerINGS));
    if (icon) setAppliedIcons((s) => ({ ...s, [icon]: (s[icon] || 0) + 1 }));
    const applyOps = Array.isArray(apply) ? apply : [apply];
    setUsageCounts((s) => {
      const next = { ...s };
      applyOps.forEach((op) => {
        if (op && op.id) next[op.id] = (next[op.id] || 0) + 1;
      });
      return next;
    });
  };
  const undoLastRec = () => {
    if (recipeHistory.length === 0) return;
    setRecipe(recipeHistory[recipeHistory.length - 1]);
    setRecipeHistory((h) => h.slice(0, -1));
  };
  const autoImprove = () => {
    let cur = recipe;
    let bestScore = -1;
    for (let i = 0; i < 6; i++) {
      const a = analyze(cur, sKey, effectiveINGS);
      if (!a) break;
      const o = generateOptimizer(a, sKey, stockIds, cur, optimizerINGS, lockedIds, blendEBWithHistory(a, histStats), optUseStock, void 0, void 0, usageCounts);
      if (o.score <= bestScore) break;
      bestScore = o.score;
      const candidates = o.items.filter((it) => it.apply && (it.priority === "critical" || it.priority === "warning")).sort((x, y) => (y.predictedScore ?? -1) - (x.predictedScore ?? -1)).slice(0, 3);
      if (!candidates.length) break;
      let bestCandScore = -1, bestCandidate = null, bestA2 = null, bestO2 = null;
      for (const cand of candidates) {
        const tryRec = applyOptToRecipe(cur, cand.apply, lockedIds, optimizerINGS);
        const tryA = analyze(tryRec, sKey, effectiveINGS);
        if (!tryA) continue;
        const tryO = generateOptimizer(tryA, sKey, stockIds, tryRec, optimizerINGS, lockedIds, blendEBWithHistory(tryA, histStats), optUseStock, void 0, void 0, usageCounts);
        if (tryO.score > bestCandScore) {
          bestCandScore = tryO.score;
          bestCandidate = tryRec;
          bestA2 = tryA;
          bestO2 = tryO;
        }
      }
      if (!bestCandidate) break;
      const candidate = bestCandidate;
      const a2 = bestA2;
      if (!a2) break;
      const o2 = bestO2;
      if (o2.score <= o.score) break;
      cur = candidate;
    }
    setRecipe(cur);
  };
  const openPrintWindow = (mode2) => {
    const el = document.querySelector(".prod-sheet");
    if (!el) {
      setNoticeDlg({ msg: "Genera la hoja primero (debe haber una receta activa)." });
      return;
    }
    el.querySelectorAll("input").forEach((inp) => inp.setAttribute("value", inp.value));
    const nombre = (an?.sp?.name || "Sustrato").replace(/\s+/g, "_");
    const fecha = prodDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const lote = prodLoteNum ? "_" + prodLoteNum.replace(/\s+/g, "-") : "";
    const filename = "HojaProd_" + nombre + lote + "_" + fecha;
    const rs = getComputedStyle(document.documentElement);
    const varLines = [];
    for (let i = 0; i < rs.length; i++) {
      const p = rs[i];
      if (p.startsWith("--")) varLines.push(`${p}:${rs.getPropertyValue(p)};`);
    }
    const inlineCSS = Array.from(document.querySelectorAll("style")).map((s) => s.textContent).join("\n");
    const fullHtml = `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><title>${filename}</title>
<style>
:root{${varLines.join("")}}
${inlineCSS}
body{margin:0;padding:20px 24px;background:#fff;}
.prod-sheet{position:static!important;box-shadow:none!important;border:none!important;width:100%!important;}
.no-print{display:none!important;}
@media print{@page{margin:1.2cm 1.5cm;}body{padding:0;zoom:0.92;}}
.spp-attrs{display:flex;flex-direction:column;gap:12px;}
.spp-attr{display:flex;gap:12px;align-items:flex-start;}
.spp-attr-ico{flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;color:var(--ink-600);}
.spp-attr .k{font-family:var(--font-body);font-weight:800;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-700);margin-bottom:2px;}
.spp-attr .v{font-size:13px;color:var(--ink-700);line-height:1.4;}
.spp-param{padding:14px 16px;border-right:1px solid rgba(26,20,16,0.1);border-bottom:1px solid rgba(26,20,16,0.1);display:flex;gap:10px;align-items:flex-start;}
.spp-param:nth-child(2n){border-right:none;}
.spp-param:nth-child(n+7){border-bottom:none;}
.spp-param .ico{flex-shrink:0;width:18px;height:18px;display:flex;align-items:center;justify-content:center;color:var(--coral-500);font-family:var(--font-body);font-weight:800;font-size:10px;}
.spp-param .k{font-family:var(--font-body);font-weight:800;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-600);margin-bottom:3px;}
.spp-param .v{font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--ink-900);line-height:1.2;}
.spp-secondary-row>div{display:flex;flex-direction:column;gap:3px;}
.spp-secondary-row .label{font-family:var(--font-body);font-weight:800;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-600);}
.spp-secondary-row .value{font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--ink-900);}
.spp-cta:hover{background:var(--moss-800);transform:translateY(-1px);}
</style><template id="__bundler_thumbnail"><svg viewBox="0 0 80 56" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="56" fill="#F6F4EC"/><rect x="12" y="10" width="56" height="36" rx="4" fill="#2E3B2F" opacity=".15"/><text x="40" y="31" text-anchor="middle" font-size="10" fill="#2E3B2F" font-family="serif">Recetas</text></svg></template>
</head>
<body>${el.outerHTML}</body></html>`;
    const pw = window.open("", "_blank", "width=900,height=1100");
    if (!pw) {
      setNoticeDlg({ title: "Ventana bloqueada", msg: "El navegador bloqueó la ventana emergente. Permite pop-ups para este sitio e inténtalo de nuevo (ícono en la barra de direcciones → Permitir pop-ups)." });
      return;
    }
    pw.document.open();
    pw.document.write(fullHtml);
    pw.document.close();
    pw.document.title = filename;
    setTimeout(() => {
      if (pw && !pw.closed) {
        pw.focus();
        pw.print();
      }
    }, 900);
  };
  const printProdSheet = () => openPrintWindow("print");
  const exportPDF = () => openPrintWindow("pdf");
  const ejecutarLote = (rows, loteNum, fecha) => {
    if (!rows || !rows.length) return;
    const preview = rows.filter((x) => x.g).map((x) => {
      const krKg = x.grR / 1e3;
      const stockActual2 = invLotes.filter((l) => l.activo && l.ingredienteId === x.g.id).reduce((s, l) => s + l.cantidadKgDisponible, 0);
      return { id: x.g.id, name: x.g.name, krKg, stockActual: stockActual2, ok: stockActual2 >= krKg * 0.999 };
    });
    setLoteBatchConfirm({ preview, loteNum, fecha });
  };
  const confirmarEjecucion = () => {
    if (!loteBatchConfirm) return;
    const { preview, loteNum, fecha } = loteBatchConfirm;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    setInvLotes((prev) => {
      const updated = consumirInventarioFIFOLocal(prev, preview);
      try {
        localStorage.setItem("sdp_lotes", JSON.stringify(updated));
      } catch (e) {
      }
      return updated;
    });
    const ts = Date.now();
    const newMovs = preview.map((row, i) => ({ id: "mov_lote_" + ts + "_" + i, tipo: "consumo_lote", ingredienteId: row.id, kgMovidos: row.krKg, loteNum: loteNum || "—", fecha, nota: `Lote ${loteNum || "—"} · ${fecha}`, timestamp: now }));
    saveMovimientos([...invMovimientos, ...newMovs]);
    setLoteBatchConfirm(null);
    setLoteSyncErr("");
    if (window.SetasDB) {
      (async () => {
        try {
          for (const row of preview) {
            await window.SetasDB.descontarInventarioFIFO(row.id, row.krKg);
          }
          await window.SetasDB.crearLoteProduccion({
            codigo: loteNum || "LOTE-" + ts,
            especie: SPP[sKey]?.name || sKey,
            camara: "—",
            operador: "—",
            receta: { ingredientes: recipe.map((r) => ({ id: r.id, pct: parseFloat(r.p) || 0 })) }
          });
        } catch (err) {
          setLoteSyncErr("No se sincronizó con el servidor: " + (err.message || err.code || "error desconocido"));
        }
      })();
    }
  };
  const buildBitNuevoForm = () => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const sp2 = SPP[sKey];
    const tr2 = an ? calcTreatment(an, sKey, SPP) : null;
    const SC = { p_ostreatus_gris: "OST", p_ostreatus_blanco: "OBL", p_djamor_rosa: "ROS", p_eryngii: "ERY", shiitake: "SHI", lions_mane: "MEL", reishi: "REI", enoki: "ENO", nameko: "NAM" };
    const sppCode = SC[sKey] || "EXP";
    const dc = today.replace(/-/g, "").slice(2);
    const cnt = bitLotes.length + 1;
    const nb = prodBags || 6;
    const kb = prodKg || 1.5;
    const hm = prodH || 67;
    return {
      codigo: `SDP-${dc}-${sppCode}-R${String(cnt).padStart(2, "0")}`,
      especie: sp2?.name || "",
      especieCientifico: sp2?.scientific || "",
      cepa: "",
      fechaMezcla: today,
      fechaInoculacion: today,
      numBolsas: nb,
      pesoHumedo: kb,
      peseSeco: parseFloat((nb * kb * (1 - hm / 100)).toFixed(3)),
      spawnPct: an?.dynSpawn || tr2?.spawn || 8,
      humedad: hm,
      tratamiento: tr2?.name || "",
      costoIngKg: an ? Math.round(an.cost) : 0,
      operador: "",
      objetivo: "",
      notas: "",
      estado: "incubacion",
      veredicto: "",
      recipeRef: recipe.length && balanced ? { id: Date.now(), name: saveName || "Receta activa", sKey, recipe: [...recipe], cn: an.cn.toFixed(1), eb: an.eb.toFixed(0), score: opt.score, cost: Math.round(an.cost) } : null
    };
  };
  const openThermalForLote = (loteId, options = {}) => {
    const lote = bitLotes.find((l) => l.id === loteId) || bitLotes[0];
    if (!lote) return;
    setThermalLote(lote);
    setThermalScope(options.scope || (options.bagNum ? "custom" : "all"));
    if (options.bagNum) {
      setThermalBagStart(options.bagNum);
      setThermalBagEnd(options.bagNum);
    } else {
      setThermalBagStart(1);
      setThermalBagEnd(lote.numBolsas || 12);
    }
    setThermalCosechaItem(null);
    setShowThermalModal(true);
  };
  const openThermalForCosecha = (loteId, cosechaData = {}) => {
    const lote = bitLotes.find((l) => l.id === loteId) || bitLotes[0];
    if (!lote) return;
    setThermalLote(lote);
    setThermalScope("cosecha");
    setThermalCosechaItem({
      ...cosechaData,
      loteCodigo: lote.codigo
    });
    setShowThermalModal(true);
  };
  const openProdLauncher = () => {
    if (!readyForProduction || !recipe.length || !an) {
      setNoticeDlg({ title: "Receta no lista", msg: productionBlockMsg || "Balancea la receta al 100% antes de lanzar producción." });
      return;
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const sp2 = SPP[sKey];
    const SC = { p_ostreatus_gris: "OST", p_ostreatus_blanco: "OBL", p_djamor_rosa: "ROS", p_eryngii: "ERY", shiitake: "SHI", lions_mane: "MEL", reishi: "REI", enoki: "ENO", nameko: "NAM" };
    const sppCode = SC[sKey] || "EXP";
    const dc = today.replace(/-/g, "").slice(2);
    const cnt = bitLotes.length + 1;
    const codigo = `SDP-${dc}-${sppCode}-R${String(cnt).padStart(2, "0")}`;
    const insumos = (bd?.items || []).map((it) => {
      const g = INGS.find((i) => i.name === it.name || i.id === it.id);
      const id = g ? g.id : it.name;
      const krKg = it.asIsKg || (parseFloat(it.unit) || 0);
      const stockActual2 = invLotes.filter((l) => l.activo && l.ingredienteId === id).reduce((s, l) => s + l.cantidadKgDisponible, 0);
      return {
        id,
        name: it.name,
        krKg,
        stockActual: stockActual2,
        ok: stockActual2 >= krKg * 0.999
      };
    });
    if (bd?.spawn && bd.spawn > 0) {
      const spawnStock = invLotes.filter((l) => l.activo && l.ingredienteId === "spawn_grano").reduce((s, l) => s + l.cantidadKgDisponible, 0);
      insumos.push({
        id: "spawn_grano",
        name: `Spawn / Micelio (${sp2?.name || sKey})`,
        krKg: bd.spawn,
        stockActual: spawnStock,
        ok: spawnStock >= bd.spawn * 0.999
      });
    }
    setProdLaunchForm({
      codigo,
      especie: sp2?.name || "",
      especieCientifico: sp2?.scientific || "",
      cepa: "",
      fechaMezcla: today,
      fechaInoculacion: today,
      numBolsas: numBags || 10,
      pesoHumedo: kgBag || 1.5,
      humedad: hObj || 67,
      sala: selectedClimateRoom || "martha_01",
      operador: "Operario Granja Tenjo",
      notas: "",
      printQr: true,
      insumos
    });
    setShowProdLaunchModal(true);
  };
  const ejecutarLanzamientoProduccion = () => {
    if (!prodLaunchForm) return;
    const { codigo, especie, especieCientifico, cepa, fechaMezcla, fechaInoculacion, numBolsas, pesoHumedo, humedad, sala, operador, notas, printQr, insumos } = prodLaunchForm;
    const nb = parseInt(numBolsas) || 1;
    const kb = parseFloat(pesoHumedo) || 1.5;
    const hm = parseFloat(humedad) || 67;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ts = Date.now();
    const insumosADescontar = (insumos || []).filter((i) => i.krKg > 0);
    if (insumosADescontar.length > 0) {
      setInvLotes((prev) => {
        const updated = consumirInventarioFIFOLocal(prev, insumosADescontar);
        try {
          localStorage.setItem("sdp_lotes", JSON.stringify(updated));
        } catch (e) {
        }
        return updated;
      });
      const newMovs = insumosADescontar.map((row, i) => ({
        id: "mov_lote_" + ts + "_" + i,
        tipo: "consumo_lote",
        ingredienteId: row.id,
        kgMovidos: row.krKg,
        loteNum: codigo,
        fecha: fechaInoculacion,
        nota: `Lote ${codigo} (${nb} bolsas × ${kb} kg) · ${fechaInoculacion}`,
        timestamp: now
      }));
      saveMovimientos([...invMovimientos, ...newMovs]);
      if (window.SetasDB) {
        (async () => {
          try {
            for (const row of insumosADescontar) {
              await window.SetasDB.descontarInventarioFIFO(row.id, row.krKg);
            }
          } catch (e) {
            console.warn("Error sincronizando descuento FIFO a Firestore:", e);
          }
        })();
      }
    }
    const lote = {
      id: "BIT_" + ts,
      codigo,
      especie,
      especieCientifico,
      cepa,
      fechaMezcla,
      fechaInoculacion,
      numBolsas: nb,
      pesoHumedo: kb,
      peseSeco: parseFloat((nb * kb * (1 - hm / 100)).toFixed(3)),
      spawnPct: an?.dynSpawn || 8,
      humedad: hm,
      tratamiento: tr?.name || "Pasteurización Térmica",
      costoIngKg: an ? Math.round(an.cost) : 0,
      operador,
      objetivo: "Lanzamiento directo desde Formulador",
      notas,
      estado: "incubacion",
      veredicto: "",
      sala,
      ubicacion: sala,
      recipeRef: {
        id: ts,
        name: saveName || `Receta ${especie} (${codigo})`,
        sKey,
        recipe: [...recipe],
        cn: an ? an.cn.toFixed(1) : "—",
        eb: an ? an.eb.toFixed(0) : "—",
        score: opt ? opt.score : 0,
        cost: an ? Math.round(an.cost) : 0
      },
      createdAt: now
    };
    const bolsas = Array.from({ length: nb }, (_, i) => ({
      id: "BOLSA_" + ts + "_" + i,
      loteId: lote.id,
      codigo: `${lote.codigo}-B${String(i + 1).padStart(2, "0")}`,
      num: i + 1,
      estado: "sana",
      col25: null,
      col50: null,
      col100: null,
      pesoInicial: kb,
      fechaDescarte: null,
      motivoDescarte: "",
      observaciones: "",
      foto: null
    }));
    setBitLotes((prev) => {
      const upd = [lote, ...prev];
      try {
        localStorage.setItem("sdp_bit_lotes", JSON.stringify(upd));
      } catch (e) {
        bitQuotaWarn();
      }
      return upd;
    });
    setBitBolsas((prev) => {
      const upd = [...prev, ...bolsas];
      try {
        localStorage.setItem("sdp_bit_bolsas", JSON.stringify(upd));
      } catch (e) {
        bitQuotaWarn();
      }
      return upd;
    });
    if (window.SetasBitacoraDB) {
      (async () => {
        try {
          await window.SetasBitacoraDB.guardarLote(lote);
          await window.SetasBitacoraDB.guardarBolsas(bolsas);
        } catch (e) {
          console.warn("Error respaldando lote en Firestore:", e);
        }
      })();
    }
    setShowProdLaunchModal(false);
    if (printQr) {
      setThermalLoteId(lote.id);
      setShowThermalModal(true);
    } else {
      setBitActiveLoteId(lote.id);
      goTab("bitacora");
    }
    setNoticeDlg({
      title: "🚀 Producción de Lote Lanzada",
      msg: `El lote "${codigo}" (${nb} bolsas de ${kb} kg) ha sido creado exitosamente en Bitácora. Las materias primas fueron descontadas de Bodega y el lote quedó asignado a la sala "${ROOMS_CONFIG[sala]?.name || sala}".`
    });
  };
  const bitQuotaWarn = () => setNoticeDlg({ title: "No se pudo guardar", msg: "El almacenamiento local está lleno y el cambio no quedó guardado. Elimina fotos de bolsas antiguas (clic sobre la foto para quitarla) y vuelve a intentar." });
  const crearBitLote = (form) => {
    const lote = { ...form, id: "BIT_" + Date.now(), createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    const nb = parseInt(form.numBolsas) || 1;
    const ts = Date.now();
    const bolsas = Array.from({ length: nb }, (_, i) => ({ id: "BOLSA_" + ts + "_" + i, loteId: lote.id, codigo: `${lote.codigo}-B${String(i + 1).padStart(2, "0")}`, num: i + 1, estado: "sana", col25: null, col50: null, col100: null, pesoInicial: form.pesoHumedo || 1.5, fechaDescarte: null, motivoDescarte: "", observaciones: "", foto: null }));
    setBitLotes((prev) => {
      const upd = [lote, ...prev];
      try {
        localStorage.setItem("sdp_bit_lotes", JSON.stringify(upd));
      } catch (e) {
        bitQuotaWarn();
      }
      return upd;
    });
    setBitBolsas((prev) => {
      const upd = [...prev, ...bolsas];
      try {
        localStorage.setItem("sdp_bit_bolsas", JSON.stringify(upd));
      } catch (e) {
        bitQuotaWarn();
      }
      return upd;
    });
    if (window.SetasBitacoraDB) {
      (async () => {
        const results = await Promise.allSettled([
          window.SetasBitacoraDB.guardarLote(lote),
          window.SetasBitacoraDB.guardarBolsas(bolsas)
        ]);
        const failed = results.find((r) => r.status === "rejected");
        if (failed) {
          const err = failed.reason;
          setBitSyncErr("No se sincronizó con el servidor: " + (err?.message || err?.code || "error desconocido"));
        } else {
          setBitSyncErr("");
        }
      })();
    } else {
      console.warn("SetasBitacoraDB no disponible — Bitácora no se respaldó en Firestore.");
    }
    return lote.id;
  };
  const updateBitLote = (loteId, fields) => {
    setBitLotes((prev) => {
      const upd = prev.map((l) => l.id === loteId ? { ...l, ...fields } : l);
      try {
        localStorage.setItem("sdp_bit_lotes", JSON.stringify(upd));
      } catch (e) {
        bitQuotaWarn();
      }
      return upd;
    });
    if (window.SetasBitacoraDB) {
      (async () => {
        try {
          await window.SetasBitacoraDB.actualizarLote(loteId, fields);
          setBitSyncErr("");
        } catch (err) {
          setBitSyncErr("No se sincronizó con el servidor: " + (err.message || err.code || "error desconocido"));
        }
      })();
    } else {
      console.warn("SetasBitacoraDB no disponible — Bitácora no se respaldó en Firestore.");
    }
  };
  const updateBitBolsa = (bolsaId, fields) => {
    const fechaKey = ["col25", "col50", "col100"].find((k) => k in fields);
    if (fechaKey && fields[fechaKey]) {
      const bolsa = bitBolsas.find((b) => b.id === bolsaId);
      const lote = bolsa && bitLotes.find((l) => l.id === bolsa.loteId);
      if (lote && !window.SetasBitacora.isFechaColValida(fields[fechaKey], lote.fechaInoculacion)) {
        setNoticeDlg({ title: "Fecha inválida", msg: "La fecha de colonización no puede ser anterior a la fecha de inoculación del lote (" + lote.fechaInoculacion + ")." });
        return;
      }
    }
    setBitBolsas((prev) => {
      const upd = prev.map((b) => b.id === bolsaId ? { ...b, ...fields } : b);
      try {
        localStorage.setItem("sdp_bit_bolsas", JSON.stringify(upd));
      } catch (e) {
        bitQuotaWarn();
      }
      return upd;
    });
    if (window.SetasBitacoraDB) {
      (async () => {
        try {
          await window.SetasBitacoraDB.actualizarBolsa(bolsaId, fields);
          setBitSyncErr("");
        } catch (err) {
          setBitSyncErr("No se sincronizó con el servidor: " + (err.message || err.code || "error desconocido"));
        }
      })();
    } else {
      console.warn("SetasBitacoraDB no disponible — Bitácora no se respaldó en Firestore.");
    }
  };
  const addBitCosecha = (cosecha) => {
    const e = { ...cosecha, id: "COS_" + Date.now() };
    setBitCosechas((prev) => {
      const upd = [...prev, e];
      try {
        localStorage.setItem("sdp_bit_cosechas", JSON.stringify(upd));
      } catch (err) {
        bitQuotaWarn();
      }
      return upd;
    });
    if (window.SetasBitacoraDB) {
      (async () => {
        try {
          await window.SetasBitacoraDB.guardarCosecha(e);
          setBitSyncErr("");
        } catch (err) {
          setBitSyncErr("No se sincronizó con el servidor: " + (err.message || err.code || "error desconocido"));
        }
      })();
    } else {
      console.warn("SetasBitacoraDB no disponible — Bitácora no se respaldó en Firestore.");
    }
  };
  const deleteBitCosecha = (id) => {
    setBitCosechas((prev) => {
      const upd = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem("sdp_bit_cosechas", JSON.stringify(upd));
      } catch (e) {
      }
      return upd;
    });
    if (window.SetasBitacoraDB) {
      (async () => {
        try {
          await window.SetasBitacoraDB.eliminarCosecha(id);
          setBitSyncErr("");
        } catch (err) {
          setBitSyncErr("No se sincronizó con el servidor: " + (err.message || err.code || "error desconocido"));
        }
      })();
    } else {
      console.warn("SetasBitacoraDB no disponible — Bitácora no se respaldó en Firestore.");
    }
  };
  const deleteBitLote = (loteId) => {
    const doDelete = () => {
      const bolsaIds = bitBolsas.filter((b) => b.loteId === loteId).map((b) => b.id);
      const cosechaIds = bitCosechas.filter((c) => c.loteId === loteId).map((c) => c.id);
      setBitLotes((prev) => {
        const upd = prev.filter((l) => l.id !== loteId);
        try {
          localStorage.setItem("sdp_bit_lotes", JSON.stringify(upd));
        } catch (e) {
        }
        return upd;
      });
      setBitBolsas((prev) => {
        const upd = prev.filter((b) => b.loteId !== loteId);
        try {
          localStorage.setItem("sdp_bit_bolsas", JSON.stringify(upd));
        } catch (e) {
        }
        return upd;
      });
      setBitCosechas((prev) => {
        const upd = prev.filter((c) => c.loteId !== loteId);
        try {
          localStorage.setItem("sdp_bit_cosechas", JSON.stringify(upd));
        } catch (e) {
        }
        return upd;
      });
      if (bitActiveLoteId === loteId) {
        setBitActiveLoteId(null);
        goBitTab("bit_dash");
      }
      if (window.SetasBitacoraDB) {
        (async () => {
          try {
            await window.SetasBitacoraDB.eliminarLoteCascade(loteId, bolsaIds, cosechaIds);
            setBitSyncErr("");
          } catch (err) {
            setBitSyncErr("No se sincronizó con el servidor: " + (err.message || err.code || "error desconocido"));
          }
        })();
      } else {
        console.warn("SetasBitacoraDB no disponible — Bitácora no se respaldó en Firestore.");
      }
    };
    setConfirmDlg({ title: "Eliminar lote", msg: "¿Eliminar este lote y todas sus bolsas y cosechas? Esta acción no se puede deshacer.", danger: true, confirmLabel: "Eliminar", onConfirm: doDelete });
  };
  const calcLoteStats = (loteId) => {
    const lote = bitLotes.find((lt) => lt.id === loteId);
    if (!lote) return null;
    return window.SetasBitacora.calcLoteStats(lote, bitBolsas.filter((b) => b.loteId === loteId), bitCosechas.filter((c) => c.loteId === loteId));
  };
  const calcLoteScore = (stats) => window.SetasBitacora.calcLoteScore(stats);
  const loadOptimal = () => {
    try {
      const r = runHybridRecipeSearch({
        targetKey: sKey,
        recipe: [],
        invLotes,
        maxCost: 0,
        ingredients: optimizerINGS,
        useStock: false,
        profileKey: "produccion",
        stockMap: {}
      });
      if (r.ranked?.length) {
        setRecipe(r.ranked[0].recipe);
        setLockedIds([]);
      } else setNoticeDlg({ msg: "No se encontró una combinación óptima para esta especie con los ingredientes disponibles." });
    } catch (e) {
      setNoticeDlg({ msg: "No se pudo ejecutar el optimizador híbrido: " + (e.message || "error desconocido") });
    }
  };
  const updP = (id, p) => {
    if (!normMode) {
      setRecipe(recipe.map((r) => r.id === id ? { ...r, p } : r));
      return;
    }
    const pVal = Math.max(0, Math.min(100, parseFloat(p) || 0));
    const free = recipe.filter((r) => r.id !== id && !lockedIds.includes(r.id));
    const sumLocked = recipe.filter((r) => r.id !== id && lockedIds.includes(r.id)).reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const remaining = Math.max(0, 100 - pVal - sumLocked);
    const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    setRecipe(recipe.map((r) => {
      if (r.id === id) return { ...r, p: pVal };
      if (lockedIds.includes(r.id)) return r;
      if (sumFree === 0) return { ...r, p: Math.round(remaining / free.length * 10) / 10 };
      return { ...r, p: Math.round(parseFloat(r.p) / sumFree * remaining * 10) / 10 };
    }));
  };
  const remI = (id) => setRecipe(recipe.filter((r) => r.id !== id));
  const toggleLock = (id) => setLockedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const saveProveedores = (list) => {
    setInvProveedores(list);
    try {
      localStorage.setItem("sdp_proveedores", JSON.stringify(list));
    } catch (e) {
    }
  };
  const saveCompras = (list) => {
    setInvCompras(list);
    try {
      localStorage.setItem("sdp_compras", JSON.stringify(list));
    } catch (e) {
    }
  };
  const saveLotes = (list) => {
    setInvLotes(list);
    try {
      localStorage.setItem("sdp_lotes", JSON.stringify(list));
    } catch (e) {
    }
  };
  const saveMovimientos = (list) => {
    setInvMovimientos(list);
    try {
      localStorage.setItem("sdp_movimientos", JSON.stringify(list));
    } catch (e) {
    }
  };
  const agregarProveedor = () => {
    const n = newProv.nombre.trim();
    if (!n || !newProv.municipio.trim()) return;
    const prov = { id: "prov_" + Date.now(), nombre: n, tipo: newProv.tipo, municipio: newProv.municipio.trim() };
    const list = [...invProveedores, prov];
    saveProveedores(list);
    setCmpProvId(prov.id);
    setNewProv({ nombre: "", tipo: "plaza", municipio: "" });
    setShowProvModal(false);
  };
  const eliminarProveedor = (id) => {
    setConfirmDlg({ title: "Eliminar proveedor", msg: "¿Eliminar este proveedor? Esta acción no se puede deshacer.", danger: true, confirmLabel: "Eliminar", onConfirm: () => saveProveedores(invProveedores.filter((p) => p.id !== id)) });
  };
  const addCmpItem = () => setCmpItems((prev) => [...prev, { uid: Date.now(), ingId: "", kg: "", precio: "" }]);
  const updCmpItem = (uid, field, val) => setCmpItems((prev) => prev.map((it) => it.uid === uid ? { ...it, [field]: val } : it));
  const remCmpItem = (uid) => setCmpItems((prev) => prev.filter((it) => it.uid !== uid));
  const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const compressImageToDataURL = (file, maxDim = 1280, quality = 0.72) => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
  const matchByName = (list, getName, nombre, minSubstringLen = 4) => {
    if (!nombre) return "";
    const n = String(nombre).toLowerCase().trim();
    if (!n) return "";
    const exact = list.find((x) => getName(x).toLowerCase() === n || x.id === n);
    if (exact) return exact.id;
    if (n.length < minSubstringLen) return "";
    const subHits = list.filter((x) => {
      const gn = getName(x).toLowerCase();
      return gn.length >= minSubstringLen && gn.includes(n) || n.length >= minSubstringLen && n.includes(gn);
    });
    return subHits.length === 1 ? subHits[0].id : "";
  };
  const matchIngId = (nombre) => matchByName(INGS, (g) => g.name, nombre);
  const matchProvId = (nombre) => matchByName(invProveedores, (p) => p.nombre, nombre);
  const applyParsedItems = (parsed) => {
    const items = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.items) ? parsed.items : null;
    if (!items || !items.length) {
      setCmpParseErr("No se detectaron ítems. Prueba con Manual.");
      setHuboParseIA(false);
      return;
    }
    const mapped = items.map((p, i) => ({ uid: Date.now() + i, ingId: matchIngId(p.ingrediente || p.nombre || ""), kg: p.kg || p.cantidad || "", precio: p.precio || p.precio_kg || "" }));
    setCmpItems(mapped);
    setHuboParseIA(true);
    if (parsed && !Array.isArray(parsed)) {
      if (parsed.proveedor) {
        const pid = matchProvId(parsed.proveedor);
        if (pid) setCmpProvId(pid);
      }
      if (parsed.fecha && /^\d{4}-\d{2}-\d{2}$/.test(parsed.fecha)) setCmpFecha(parsed.fecha);
    }
    setCmpMode("manual");
  };
  const extraerJSON = (txt) => {
    const objMatch = txt.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        const o = JSON.parse(objMatch[0]);
        if (o && typeof o === "object" && Array.isArray(o.items)) return o;
      } catch (e) {
      }
    }
    const arrMatch = txt.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    return JSON.parse(objMatch ? objMatch[0] : txt);
  };
  const CMP_MAX_BYTES = 10 * 1024 * 1024;
  const parseFotoPayload = async (fileBlock, esPDF) => {
    setCmpParsing(true);
    setCmpParseErr("");
    try {
      if (window.SetasAI && typeof window.SetasAI.parseInvoiceImage === "function") {
        const parsed = await window.SetasAI.parseInvoiceImage({
          base64Data: fileBlock.source.data,
          mimeType: fileBlock.source.media_type,
          knownIngredients: INGS
        });
        applyParsedItems(parsed);
        setCmpParsing(false);
        return;
      }
      if (window.claude && typeof window.claude.complete === "function") {
        const listaIngs = INGS.map((g) => g.name).join(", ");
        const resp = await window.claude.complete({ messages: [{ role: "user", content: [
          fileBlock,
          { type: "text", text: `Esta es ${esPDF ? "un PDF" : "una foto"} de una factura/recibo de compra de insumos para cultivo de hongos. Puede tener varias páginas o incluir varias facturas: extrae los ítems de todas ellas. Devuelve JSON puro (sin texto ni markdown) con esta forma: {"proveedor":"nombre del proveedor/vendedor tal cual aparece, o null si no aparece","fecha":"YYYY-MM-DD de la compra/factura, o null si no aparece","items":[{"ingrediente":"nombre tal cual","kg":numero,"precio":numero_precio_por_kg_COP}]}. Si el recibo trae precio total por línea en vez de precio por kg, calcula precio/kg dividiendo entre los kg. Ignora subtotales, impuestos y totales generales — solo ítems comprados. Ingredientes conocidos del inventario (usa el más parecido si aplica): ${listaIngs}.` }
        ] }] });
        try {
          applyParsedItems(extraerJSON(resp));
        } catch (parseErr) {
          setCmpParseErr(`No se pudo interpretar la respuesta para ${esPDF ? "el PDF" : "la foto"}. Revisa que sea legible o usa Manual.`);
        }
        setCmpParsing(false);
        return;
      }
      throw new Error("Servicio de IA no disponible");
    } catch (err) {
      setCmpParseErr(`No se pudo leer ${esPDF ? "el PDF" : "la foto"}. Intenta de nuevo o usa Manual.`);
    }
    setCmpParsing(false);
  };
  const capturarFoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const esPDF = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
    if (file.size > CMP_MAX_BYTES) {
      setCmpParseErr(`El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB — el máximo es 10 MB. Comprime ${esPDF ? "el PDF" : "la foto"} o usa Manual.`);
      e.target.value = "";
      return;
    }
    const hasAI = window.SetasAI && typeof window.SetasAI.parseInvoiceImage === "function" || window.claude && typeof window.claude.complete === "function";
    if (!hasAI) {
      setCmpParseErr("La lectura automática no está disponible en este entorno. Usa Manual para cargar los ítems.");
      e.target.value = "";
      return;
    }
    setCmpParseErr("");
    setHuboParseIA(false);
    setCmpParsing(true);
    setCmpFuente("ocr");
    try {
      const b64 = await fileToBase64(file);
      const fileBlock = esPDF ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } } : { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: b64 } };
      setCmpLastFoto({ fileBlock, esPDF, name: file.name });
      await parseFotoPayload(fileBlock, esPDF);
    } catch (err) {
      setCmpParsing(false);
      setCmpParseErr(`No se pudo leer ${esPDF ? "el PDF" : "la foto"}. Intenta de nuevo o usa Manual.`);
    }
    e.target.value = "";
  };
  const reintentarFoto = () => {
    if (!cmpLastFoto || cmpParsing) return;
    setHuboParseIA(false);
    setCmpFuente("ocr");
    parseFotoPayload(cmpLastFoto.fileBlock, cmpLastFoto.esPDF);
  };
  const parsearTexto = async () => {
    if (!cmpPasteText.trim()) return;
    setCmpParsing(true);
    setCmpParseErr("");
    setHuboParseIA(false);
    setCmpFuente("email");
    try {
      if (window.SetasAI && typeof window.SetasAI.parseInvoiceText === "function") {
        const parsed = await window.SetasAI.parseInvoiceText({
          text: cmpPasteText,
          knownIngredients: INGS
        });
        applyParsedItems(parsed);
        setCmpParsing(false);
        return;
      }
      if (window.claude && typeof window.claude.complete === "function") {
        const listaIngs = INGS.map((g) => g.name).join(", ");
        const resp = await window.claude.complete({ messages: [{ role: "user", content: `Este es un mensaje (email o WhatsApp) de un proveedor confirmando una compra de insumos para cultivo de hongos:

"""${cmpPasteText}"""

Devuelve JSON puro (sin texto ni markdown) con esta forma: {"proveedor":"nombre del proveedor tal cual aparece, o null si no aparece","fecha":"YYYY-MM-DD de la compra, o null si no aparece","items":[{"ingrediente":"nombre","kg":numero,"precio":numero_precio_por_kg_COP}]}. Ingredientes conocidos: ${listaIngs}.` }] });
        applyParsedItems(extraerJSON(resp));
        setCmpParsing(false);
        return;
      }
      throw new Error("Servicio de IA no disponible");
    } catch (err) {
      setCmpParseErr("No se pudo interpretar el texto. Intenta de nuevo o usa Manual.");
    }
    setCmpParsing(false);
  };
  const registrarCompra = () => {
    const valid = cmpItems.filter((it) => it.ingId && parseFloat(it.kg) > 0);
    if (!cmpProvId || valid.length === 0) {
      setNoticeDlg({ msg: "Selecciona proveedor y agrega al menos un ítem." });
      return;
    }
    const cId = "compra_" + Date.now();
    const nuevaCompra = {
      id: cId,
      fecha: cmpFecha,
      proveedorId: cmpProvId,
      items: valid.map((it) => ({ ingredienteId: it.ingId, kg: parseFloat(it.kg), precio: parseFloat(it.precio) || 0 })),
      fuenteCaptura: cmpFuente,
      revisadoManualmente: true
    };
    const newLotes = valid.map((it, i) => ({
      id: "lote_" + Date.now() + "_" + i,
      compraId: cId,
      ingredienteId: it.ingId,
      cantidadKgTotal: parseFloat(it.kg),
      precioPorKgCOP: parseFloat(it.precio) || 0,
      fechaIngreso: cmpFecha,
      cantidadKgDisponible: parseFloat(it.kg),
      activo: true
    }));
    const newMovs = newLotes.map((l) => ({
      id: "mov_" + Date.now() + "_" + l.id,
      loteId: l.id,
      ingredienteId: l.ingredienteId,
      tipo: "entrada",
      cantidadKg: l.cantidadKgTotal,
      fecha: cmpFecha,
      referencia: cId
    }));
    saveCompras([...invCompras, nuevaCompra]);
    saveLotes([...invLotes, ...newLotes]);
    saveMovimientos([...invMovimientos, ...newMovs]);
    const prov = invProveedores.find((p) => p.id === cmpProvId);
    const resumen = valid.map((it) => {
      const g = INGS.find((x) => x.id === it.ingId);
      const stockPrevio = invLotes.filter((l) => l.activo && l.ingredienteId === it.ingId).reduce((s, l) => s + l.cantidadKgDisponible, 0);
      return { nombre: g ? g.name : it.ingId, kgComprado: parseFloat(it.kg), stockNuevo: stockPrevio + parseFloat(it.kg) };
    });
    setCmpConfirm({ proveedor: prov ? prov.nombre : "", fecha: cmpFecha, total: valid.reduce((s, it) => s + (parseFloat(it.kg) || 0) * (parseFloat(it.precio) || 0), 0), items: resumen });
    setCmpItems([{ uid: Date.now(), ingId: "", kg: "", precio: "" }]);
    setCmpMode("manual");
    setCmpPasteText("");
    setCmpFuente("manual");
    setHuboParseIA(false);
    setCmpLastFoto(null);
  };
  const autoBalance = (mode2 = balanceMode) => {
    if (recipe.length === 0) return;
    const free = recipe.filter((r) => !lockedIds.includes(r.id));
    if (free.length === 0) return;
    const sumLocked = recipe.filter((r) => lockedIds.includes(r.id)).reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const target = Math.max(0, 100 - sumLocked);
    if (mode2 === "proportional") {
      const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
      if (sumFree === 0) {
        const eq = Math.round(target / free.length * 10) / 10;
        setRecipe(recipe.map((r) => lockedIds.includes(r.id) ? r : { ...r, p: eq }));
      } else {
        const factor = target / sumFree;
        setRecipe(recipe.map((r) => lockedIds.includes(r.id) ? r : { ...r, p: Math.round(parseFloat(r.p) * factor * 10) / 10 }));
      }
    } else if (mode2 === "equal") {
      const eq = Math.round(target / free.length * 10) / 10;
      setRecipe(recipe.map((r) => lockedIds.includes(r.id) ? r : { ...r, p: eq }));
    } else {
      const lastFree = [...recipe].reverse().find((r) => !lockedIds.includes(r.id));
      if (!lastFree) return;
      const sumOthers = recipe.reduce((s, r) => r.id !== lastFree.id ? s + (parseFloat(r.p) || 0) : s, 0);
      const newP = Math.max(0, Math.round((100 - sumOthers) * 10) / 10);
      setRecipe(recipe.map((r) => r.id === lastFree.id ? { ...r, p: newP } : r));
    }
  };
  const formNextState = !hasPickedSpecies ? "species" : !balanced ? "balance" : "produce";
  const formNextLabel = formNextState === "species" ? "Elegir especie" : formNextState === "balance" ? "Balancear 100%" : "Preparar lote";
  const runFormNextAction = () => {
    if (formNextState === "species") {
      focusFormTop();
      requestAnimationFrame(() => document.getElementById("form-species-context-select")?.focus());
      return;
    }
    if (formNextState === "balance") {
      autoBalance(balanceMode);
      return;
    }
    goTab("produccion");
  };
  const exportR = () => {
    if (!recipe.length) return;
    const t = calcTreatment(an, sKey, SPP);
    const batch = calcBatch(recipe, numBags, kgBag, 67, 12e3, INGS, an?.dynSpawn);
    let txt = `SETAS DE LA PEÑA — FICHA DE RECETA
Valle de Tenjo · ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-CO")}
${"─".repeat(44)}
ESPECIE: ${sp.name} (${sp.scientific})

INGREDIENTES:
`;
    recipe.forEach((r) => {
      const g = INGS.find((i) => i.id === r.id);
      if (g) txt += `  ${g.name.padEnd(32)}${r.p}%
`;
    });
    if (an) txt += `
ANÁLISIS:
  C:N ${an.cn.toFixed(1)}:1  ·  N ${an.avgN.toFixed(2)}%  ·  EB ${an.eb.toFixed(0)}%  ·  $${Math.round(an.cost)}/kg
`;
    if (t) txt += `
TRATAMIENTO: ${t.name}
  ${t.temp}  ·  ${t.time}  ·  Spawn ${t.spawn}%
  ${t.prep}
`;
    if (batch) {
      txt += `
BATCH (${numBags}×${kgBag} kg):
`;
      batch.items.forEach((i) => {
        txt += `  ${i.name.padEnd(32)}${i.unit.padStart(9)}  $${Math.round(i.cost).toLocaleString()}
`;
      });
      txt += `  Spawn ${batch.spawn.toFixed(2)} kg  ·  TOTAL $${Math.round(batch.cost).toLocaleString()} COP
`;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" }));
    a.download = `receta_${sp.name.replace(/\s+/g, "_")}.txt`;
    a.click();
  };
  const CVal = ({ av, bv, hb = true }) => {
    const an2 = parseFloat(av) || 0, bn2 = parseFloat(bv) || 0;
    const ac = an2 === bn2 ? "" : hb ? an2 > bn2 ? "better" : "worse" : an2 < bn2 ? "better" : "worse";
    const bc = an2 === bn2 ? "" : hb ? bn2 > an2 ? "better" : "worse" : bn2 < an2 ? "better" : "worse";
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: `cval ${ac}` }, av), /* @__PURE__ */ React.createElement("span", { className: `cval ${bc}` }, bv));
  };
  const BodegaSection = () => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "panel" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-row" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, [...new Set(invLotes.filter((l) => l.activo && l.cantidadKgDisponible > 0).map((l) => l.ingredienteId))].length), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "En stock")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, invLotes.filter((l) => l.activo).reduce((s, l) => s + l.cantidadKgDisponible, 0).toFixed(1)), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "kg disp.")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, invCompras.length), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Compras")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, invProveedores.length), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Proveedores"))), /* @__PURE__ */ React.createElement("div", { className: "inv-subtab-bar" }, [["stock", "Stock"], ["compra", "Compra"], ["historial", "Historial"], ["proveedores", "Proveedores"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, className: `inv-subtab${invTab === k ? " on" : ""}`, onClick: () => setInvTab(k) }, l))), invTab === "stock" && /* @__PURE__ */ React.createElement("div", null, (() => {
    const ingIds = [...new Set(invLotes.filter((l) => l.activo).map((l) => l.ingredienteId))];
    if (!ingIds.length) return /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "32px 20px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--border-soft)", border: "1px dashed var(--border-soft)", borderRadius: "var(--r-sm)" } }, "Sin inventario.", /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri", style: { marginTop: 12 }, onClick: () => setInvTab("compra") }, "Registrar primera compra →")));
    const rows = ingIds.map((id) => {
      const g = INGS.find((i) => i.id === id);
      const stock = stockActual(id, invLotes);
      const pp = precioPonderado(id, invLotes);
      const alertaMin = alertaConfig[id] ?? 2;
      const alertaAm = alertaMin * 2.5;
      const dotColor = stock < alertaMin ? "var(--coral-500)" : stock < alertaAm ? "var(--ochre-500,#A07828)" : "var(--accent-olive)";
      const provId = provOverride[id] || invProveedores.find((p) => p.id === invCompras.find((c) => c.id === invLotes.filter((l) => l.activo && l.ingredienteId === id).sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso))[0]?.compraId)?.proveedorId)?.id || "";
      const prov = invProveedores.find((p) => p.id === provId);
      return { id, name: g?.name || id, stock, pp, prov, dotColor, alertaMin, provId };
    }).sort((a, b) => b.stock - a.stock);
    const INP = { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", border: "1px solid var(--coral-500)", borderRadius: "var(--r-xs)", padding: "4px 6px", background: "var(--paper-50)", color: "var(--ink-900)", outline: "none", width: "100%", boxSizing: "border-box" };
    return /* @__PURE__ */ React.createElement("div", { className: "inv-section" }, /* @__PURE__ */ React.createElement("table", { className: "inv-table inventory-stock-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Ingrediente"), /* @__PURE__ */ React.createElement("th", null, "Stock (kg)"), /* @__PURE__ */ React.createElement("th", null, "Precio / kg"), /* @__PURE__ */ React.createElement("th", null, "Proveedor"), /* @__PURE__ */ React.createElement("th", null, "Alerta mín. (kg)"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", { style: { width: 80 } }))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r) => {
      const isEditing = editingRowId === r.id;
      return /* @__PURE__ */ React.createElement("tr", { key: r.id, style: { background: isEditing ? "var(--paper-200)" : "" } }, /* @__PURE__ */ React.createElement("td", { "data-label": "Ingrediente", style: { fontFamily: "var(--font-body)", fontSize: "var(--text-base)", minWidth: 160 } }, isEditing ? /* @__PURE__ */ React.createElement("select", { name: `stockIngredient-${r.id}`, "aria-label": `Ingrediente de la fila ${r.name}`, value: editingRowData.ingredienteNuevoId || r.id, onChange: (e) => setEditingRowData((p) => ({ ...p, ingredienteNuevoId: e.target.value })), style: { ...INP, fontSize: "var(--text-sm)" } }, INGS.sort((a, b) => a.name.localeCompare(b.name, "es")).map((i) => /* @__PURE__ */ React.createElement("option", { key: i.id, value: i.id }, i.name))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "stock-dot", style: { background: r.dotColor } }), r.name)), /* @__PURE__ */ React.createElement("td", { "data-label": "Stock", style: { fontFamily: "var(--font-num)", fontSize: "var(--text-md)", fontWeight: 600, color: r.dotColor, minWidth: 90 } }, isEditing ? /* @__PURE__ */ React.createElement(
        "input",
        {
          name: `stockKg-${r.id}`,
          "aria-label": `Stock de ${r.name} en kg`,
          type: "number",
          min: "0",
          step: "0.5",
          value: editingRowData.stock,
          onChange: (e) => setEditingRowData((p) => ({ ...p, stock: e.target.value })),
          onKeyDown: (e) => {
            if (e.key === "Enter") saveRowEdit(r.id);
            if (e.key === "Escape") setEditingRowId(null);
          },
          style: { ...INP, width: 80, fontWeight: 600 }
        }
      ) : /* @__PURE__ */ React.createElement("span", null, r.stock.toFixed(1), " kg")), /* @__PURE__ */ React.createElement("td", { "data-label": "Precio / kg", style: { color: "var(--ink-500)", minWidth: 100 } }, isEditing ? /* @__PURE__ */ React.createElement(
        "input",
        {
          name: `stockPrice-${r.id}`,
          "aria-label": `Precio de ${r.name} por kg`,
          type: "number",
          min: "0",
          step: "100",
          value: editingRowData.precio,
          onChange: (e) => setEditingRowData((p) => ({ ...p, precio: e.target.value })),
          style: INP,
          placeholder: "$/kg"
        }
      ) : r.pp != null ? `$${Math.round(r.pp).toLocaleString("es-CO")}/kg` : "—"), /* @__PURE__ */ React.createElement("td", { "data-label": "Proveedor", style: { color: "var(--ink-500)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", minWidth: 130 } }, isEditing ? /* @__PURE__ */ React.createElement("select", { name: `stockProvider-${r.id}`, "aria-label": `Proveedor de ${r.name}`, value: editingRowData.proveedorId, onChange: (e) => setEditingRowData((p) => ({ ...p, proveedorId: e.target.value })), style: { ...INP, fontSize: "var(--text-sm)" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Sin especificar"), invProveedores.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.nombre))) : r.prov?.nombre || "—"), /* @__PURE__ */ React.createElement("td", { "data-label": "Alerta mínima", style: { minWidth: 90 } }, isEditing ? /* @__PURE__ */ React.createElement(
        "input",
        {
          name: `stockAlert-${r.id}`,
          "aria-label": `Alerta mínima de ${r.name} en kg`,
          type: "number",
          min: "0",
          step: "0.5",
          value: editingRowData.alertaMin,
          onChange: (e) => setEditingRowData((p) => ({ ...p, alertaMin: e.target.value })),
          style: INP,
          placeholder: "kg"
        }
      ) : /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)" } }, r.alertaMin, " kg")), /* @__PURE__ */ React.createElement("td", { "data-label": "Estado" }, r.stock < r.alertaMin ? /* @__PURE__ */ React.createElement("span", { style: { color: "var(--coral-500)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700 } }, "Crítico") : r.stock < r.alertaMin * 2.5 ? /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ochre-500,#A07828)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" } }, "Bajo") : /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent-olive)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" } }, "OK")), /* @__PURE__ */ React.createElement("td", { "data-label": "Acciones" }, isEditing ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri inv-btn-sm", onClick: () => saveRowEdit(r.id), title: "Guardar", "aria-label": `Guardar cambios de ${r.name}` }, "✓"), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm", onClick: () => setEditingRowId(null), title: "Cancelar", "aria-label": `Cancelar edición de ${r.name}` }, "✕")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "inv-btn inv-btn-sec inv-btn-sm",
          title: "Editar fila completa",
          onClick: () => {
            setEditingRowId(r.id);
            setEditingRowData({ stock: r.stock.toFixed(1), precio: r.pp != null ? Math.round(r.pp) : "", proveedorId: r.provId || "", alertaMin: r.alertaMin, ingredienteNuevoId: r.id });
          }
        },
        "✎ Editar"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "inv-btn inv-btn-sm",
          title: "Eliminar stock de este ingrediente",
          "aria-label": `Eliminar ${r.name} del stock`,
          style: { background: "var(--coral-500)", color: "var(--paper-0)", border: "none" },
          onClick: () => eliminarIngrediente(r.id, r.name)
        },
        "×"
      ))));
    }))));
  })(), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm", onClick: () => setShowAddStockForm((v) => !v) }, "＋ Agregar ingrediente al stock"), showAddStockForm && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "10px 12px", background: "var(--paper-100)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", width: "100%", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("select", { name: "newStockIngredient", "aria-label": "Ingrediente que se agregará al stock", className: "inv-input", style: { flex: 2, minWidth: 180 }, value: addStockId, onChange: (e) => setAddStockId(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Seleccionar ingrediente…"), INGS.map((i) => /* @__PURE__ */ React.createElement("option", { key: i.id, value: i.id }, i.name))), /* @__PURE__ */ React.createElement("input", { name: "newStockKg", "aria-label": "Cantidad que se agregará al stock, en kg", type: "number", className: "inv-input", style: { width: 100, flex: "none" }, placeholder: "kg", min: "0", step: "0.5", value: addStockKg, onChange: (e) => setAddStockKg(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri inv-btn-sm", onClick: () => {
    if (!addStockId) return;
    const kg = parseFloat(addStockKg) || 0;
    if (kg <= 0) return;
    saveStockEdit(addStockId, kg);
    setAddStockId("");
    setAddStockKg("");
    setShowAddStockForm(false);
  } }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm", onClick: () => {
    setShowAddStockForm(false);
    setAddStockId("");
    setAddStockKg("");
  } }, "Cancelar")), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--border-soft)" } }, "≥5 kg · 2–5 kg · <2 kg — Clic en el número de kg para editar directamente. Enter para guardar, Esc para cancelar."))), invTab === "compra" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 560 } }, cmpConfirm ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "var(--moss-50,#F0F4EB)", border: "1px solid var(--moss-300,#B8C9A0)", borderRadius: "var(--r-sm)", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink-800)", marginBottom: 2 } }, "✓ Compra registrada"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)" } }, cmpConfirm.proveedor || "Sin proveedor", " · ", cmpConfirm.fecha, " · $", cmpConfirm.total.toLocaleString("es-CO"), " COP")), /* @__PURE__ */ React.createElement("div", { className: "inv-section", style: { marginBottom: 14 } }, cmpConfirm.items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: i < cmpConfirm.items.length - 1 ? "1px solid var(--border-soft)" : "none" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: 600, color: "var(--ink-800)" } }, it.nombre), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "+", it.kgComprado, " kg comprados")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--accent-olive)" } }, it.stockNuevo.toFixed(1), " kg"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--border-soft)" } }, "stock actual"))))), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri", onClick: () => setCmpConfirm(null) }, "＋ Registrar otra compra")) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14 } }, [["manual", "✎", "Manual"], ["foto", /* @__PURE__ */ React.createElement(IconCamera, { size: 16 }), "Foto / PDF"], ["texto", "✉", "Pegar texto"]].map(([v, icon, l]) => /* @__PURE__ */ React.createElement("button", { key: v, className: "inv-btn inv-btn-sec", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 8px", ...cmpMode === v ? { background: "var(--ink-0)", color: "var(--paper-0)", borderColor: "var(--ink-0)" } : {} }, onClick: () => {
    setCmpMode(v);
    setCmpParseErr("");
    setCmpLastFoto(null);
    setHuboParseIA(false);
  } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, lineHeight: 1 } }, icon), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "var(--tracking-label)" } }, l)))), cmpMode === "foto" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16, padding: 14, border: "1px dashed var(--border-soft)", borderRadius: "var(--r-sm)", textAlign: "center" } }, /* @__PURE__ */ React.createElement("input", { type: "file", accept: "image/*,application/pdf", capture: "environment", ref: cmpFileRef, style: { display: "none" }, onChange: capturarFoto }), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri inv-btn-sm", style: { display: "inline-flex", alignItems: "center", gap: 6 }, disabled: cmpParsing, onClick: () => cmpFileRef.current && cmpFileRef.current.click() }, cmpParsing ? "Leyendo recibo…" : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(IconCamera, { size: 12 }), " Tomar foto / subir recibo (o PDF)")), cmpLastFoto && !cmpParsing && /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm", style: { marginLeft: 8, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }, onClick: reintentarFoto, title: `Reintentar con ${cmpLastFoto.name}` }, "↻ Reintentar", cmpLastFoto.name ? ` (${cmpLastFoto.name.length > 18 ? cmpLastFoto.name.slice(0, 15) + "…" : cmpLastFoto.name})` : ""), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--border-soft)", marginTop: 8 } }, "La foto o PDF se lee y llena proveedor, fecha e ítems abajo — revisa antes de registrar."), cmpParseErr && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--coral-500)", marginTop: 8 } }, cmpParseErr)), cmpMode === "texto" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("textarea", { className: "inv-input", rows: "4", style: { width: "100%", resize: "vertical", fontFamily: "var(--font-body)" }, placeholder: "Pega aquí el mensaje o correo del proveedor…", value: cmpPasteText, onChange: (e) => setCmpPasteText(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri inv-btn-sm", style: { marginTop: 8 }, disabled: cmpParsing || !cmpPasteText.trim(), onClick: parsearTexto }, cmpParsing ? "Interpretando…" : cmpParseErr ? "↻ Reintentar" : "Interpretar texto"), cmpParseErr && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--coral-500)", marginTop: 8 } }, cmpParseErr)), huboParseIA && (() => {
    const total = cmpItems.length;
    const sinMatch = cmpItems.filter((it) => !it.ingId).length;
    return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14, padding: "10px 12px", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", background: sinMatch ? "#FBF6E8" : "var(--moss-50,#F0F4EB)", border: `1px solid ${sinMatch ? "var(--status-attention)" : "var(--moss-300,#B8C9A0)"}`, color: "var(--ink-800)" } }, "Se ", total === 1 ? "detectó 1 ítem" : `detectaron ${total} ítems`, sinMatch > 0 ? ` — ${sinMatch} sin coincidencia automática, revísalos abajo.` : " — revisa cantidades y precios antes de registrar.");
  })(), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "purchase-provider" }, "Proveedor"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("select", { id: "purchase-provider", name: "purchaseProvider", className: "inv-input", value: cmpProvId, onChange: (e) => setCmpProvId(e.target.value), style: { flex: 1 } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Seleccionar…"), invProveedores.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.nombre, " — ", p.municipio))), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm", style: { flexShrink: 0, padding: "9px 12px" }, onClick: () => setShowProvModal(true) }, "＋ Nuevo"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "purchase-date" }, "Fecha de compra"), /* @__PURE__ */ React.createElement("input", { id: "purchase-date", name: "purchaseDate", type: "date", className: "inv-input", value: cmpFecha, onChange: (e) => setCmpFecha(e.target.value) }))), /* @__PURE__ */ React.createElement("span", { className: "inv-label" }, "Ítems"), cmpItems.map((it) => {
    const g = INGS.find((x) => x.id === it.ingId);
    return /* @__PURE__ */ React.createElement("div", { key: it.uid, style: { border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", padding: "10px 12px", marginBottom: 8, background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("select", { name: `purchaseIngredient-${it.uid}`, "aria-label": "Ingrediente de la compra", className: "inv-input", style: { flex: 1, fontSize: "var(--text-sm)" }, value: it.ingId, onChange: (e) => updCmpItem(it.uid, "ingId", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Seleccionar ingrediente…"), INGS.map((gg) => /* @__PURE__ */ React.createElement("option", { key: gg.id, value: gg.id }, gg.name))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-danger inv-btn-sm", onClick: () => remCmpItem(it.uid), disabled: cmpItems.length === 1, "aria-label": `Quitar ${g?.name || "ítem"} de la compra` }, "✕")), !it.ingId && (it.kg || it.precio) && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--coral-500)", marginBottom: 8 } }, "⚠ Sin coincidencia automática — elige el ingrediente."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-sec inv-btn-sm", onClick: () => updCmpItem(it.uid, "kg", String(Math.max(0, (parseFloat(it.kg) || 0) - 1))), "aria-label": `Reducir cantidad de ${g?.name || "ingrediente"} en 1 kg` }, "−"), /* @__PURE__ */ React.createElement("input", { name: `purchaseKg-${it.uid}`, "aria-label": `Cantidad en kg de ${g?.name || "ingrediente"}`, type: "number", className: "inv-input", style: { width: 64, textAlign: "center", fontSize: "var(--text-sm)" }, min: "0", step: "0.5", value: it.kg, onChange: (e) => updCmpItem(it.uid, "kg", e.target.value), placeholder: "kg" }), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-sec inv-btn-sm", onClick: () => updCmpItem(it.uid, "kg", String((parseFloat(it.kg) || 0) + 1)), "aria-label": `Aumentar cantidad de ${g?.name || "ingrediente"} en 1 kg` }, "＋"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "kg")), /* @__PURE__ */ React.createElement("input", { name: `purchasePrice-${it.uid}`, "aria-label": `Precio por kg de ${g?.name || "ingrediente"} en pesos colombianos`, type: "number", className: "inv-input", style: { width: 90, fontSize: "var(--text-sm)" }, min: "0", step: "100", value: it.precio, onChange: (e) => updCmpItem(it.uid, "precio", e.target.value), placeholder: "$/kg" }), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", marginLeft: "auto", whiteSpace: "nowrap" } }, "$", ((parseFloat(it.kg) || 0) * (parseFloat(it.precio) || 0)).toLocaleString("es-CO"))));
  }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm", onClick: addCmpItem }, "＋ Agregar ítem"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink-800)" } }, "Total: $", cmpItems.reduce((s, it) => s + (parseFloat(it.kg) || 0) * (parseFloat(it.precio) || 0), 0).toLocaleString("es-CO"), " COP")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri", onClick: registrarCompra }, "✓ Registrar compra"), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec", onClick: () => {
    setCmpItems([{ uid: Date.now(), ingId: "", kg: "", precio: "" }]);
    setCmpProvId("");
    setCmpFecha((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
    setCmpMode("manual");
    setCmpPasteText("");
    setCmpFuente("manual");
    setHuboParseIA(false);
    setCmpLastFoto(null);
    setCmpParseErr("");
  } }, "✕ Limpiar")))), invTab === "historial" && /* @__PURE__ */ React.createElement("div", null, invCompras.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "32px 20px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--border-soft)", border: "1px dashed var(--border-soft)", borderRadius: "var(--r-sm)" } }, "Sin compras registradas.", /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri", style: { marginTop: 12 }, onClick: () => setInvTab("compra") }, "Registrar primera compra →"))) : (() => {
    const byMonth = {};
    [...invCompras].sort((a, b) => b.fecha.localeCompare(a.fecha)).forEach((c) => {
      const mes = c.fecha.slice(0, 7);
      if (!byMonth[mes]) byMonth[mes] = [];
      byMonth[mes].push(c);
    });
    return Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([mes, cmpras]) => {
      const totalMes = cmpras.reduce((s, c) => s + c.items.reduce((si, it) => si + (it.kg || 0) * (it.precio || 0), 0), 0);
      const collapsed = !!collapsedMonths[mes];
      const [yr, mo] = mes.split("-");
      const label = new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleDateString("es-CO", { month: "long", year: "numeric" });
      return /* @__PURE__ */ React.createElement("div", { key: mes, className: "inv-month-group" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-month-head", "aria-expanded": !collapsed, onClick: () => setCollapsedMonths((prev) => ({ ...prev, [mes]: !prev[mes] })) }, /* @__PURE__ */ React.createElement("span", { className: "inv-month-label" }, label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { className: "inv-month-total" }, "$", totalMes.toLocaleString("es-CO"), " COP"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--border-soft)" } }, collapsed ? "▶" : "▼"))), !collapsed && /* @__PURE__ */ React.createElement("table", { className: "inv-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Fecha"), /* @__PURE__ */ React.createElement("th", null, "Proveedor"), /* @__PURE__ */ React.createElement("th", null, "Ítems"), /* @__PURE__ */ React.createElement("th", null, "Total COP"), /* @__PURE__ */ React.createElement("th", null, "Fuente"))), /* @__PURE__ */ React.createElement("tbody", null, cmpras.map((c) => {
        const prov = invProveedores.find((p) => p.id === c.proveedorId);
        const tot = c.items.reduce((s, it) => s + (it.kg || 0) * (it.precio || 0), 0);
        return /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", null, c.fecha), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-sm)" } }, prov?.nombre || c.proveedorId), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3 } }, c.items.map((it, i) => {
          const g = INGS.find((x) => x.id === it.ingredienteId);
          return /* @__PURE__ */ React.createElement("span", { key: i, style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "1px 5px", background: "var(--paper-100)", border: "1px solid var(--paper-300)", color: "var(--ink-500)", borderRadius: 2 } }, g?.name || it.ingredienteId, " ", it.kg, "kg");
        }))), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-base)", color: "var(--ink-900)" } }, "$", tot.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", fontWeight: 500 } }, c.fuenteCaptura));
      }))));
    });
  })()), invTab === "proveedores" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri", onClick: () => setShowProvModal(true) }, "＋ Agregar proveedor")), invProveedores.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: 24, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--border-soft)" } }, "Sin proveedores. Agrega el primero.") : /* @__PURE__ */ React.createElement("div", { className: "inv-section" }, invProveedores.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, className: "prov-row" }, /* @__PURE__ */ React.createElement("span", { className: "prov-tipo-chip" }, p.tipo), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "prov-name" }, p.nombre), /* @__PURE__ */ React.createElement("div", { className: "prov-muni" }, p.municipio)), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-danger inv-btn-sm", onClick: () => requireAdmin(eliminarProveedor)(p.id), "aria-label": `Eliminar proveedor ${p.nombre}` }, "✕")))))), showProvModal && /* @__PURE__ */ React.createElement(AccessibleModal, { onClose: () => setShowProvModal(false), label: "Nuevo proveedor" }, /* @__PURE__ */ React.createElement("div", { className: "inv-modal-title" }, "Nuevo Proveedor"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "provider-name" }, "Nombre"), /* @__PURE__ */ React.createElement("input", { id: "provider-name", name: "providerName", autoComplete: "organization", className: "inv-input", value: newProv.nombre, onChange: (e) => setNewProv((p) => ({ ...p, nombre: e.target.value })), placeholder: "Ej. Distribuidora Agro Sabana" })), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "provider-type" }, "Tipo"), /* @__PURE__ */ React.createElement("select", { id: "provider-type", name: "providerType", className: "inv-input", value: newProv.tipo, onChange: (e) => setNewProv((p) => ({ ...p, tipo: e.target.value })) }, [["plaza", "Plaza de mercado"], ["industrial", "Industrial"], ["artesanal", "Artesanal"], ["directo", "Directo / Finca"], ["otro", "Otro"]].map(([v, l]) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, l)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "provider-city" }, "Municipio"), /* @__PURE__ */ React.createElement("input", { id: "provider-city", name: "providerCity", autoComplete: "address-level2", className: "inv-input", value: newProv.municipio, onChange: (e) => setNewProv((p) => ({ ...p, municipio: e.target.value })), placeholder: "Ej. Tenjo" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec", onClick: () => setShowProvModal(false) }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri", onClick: agregarProveedor }, "Guardar proveedor"))));
  const workflow = typeof window !== "undefined" ? window.SetasOSWorkflow : null;
  const legacyLifecycle = { incubacion: "incubation", fructificacion: "fruiting", completado: "closed", descartado: "discarded" };
  const lifecycleLabel = { incubation: "Incubación", fruiting: "Fructificación", closed: "Cerrado", discarded: "Descartado" };
  const lifecycleColor = { incubation: "var(--status-info)", fruiting: "var(--status-active)", closed: "var(--status-archived)", discarded: "var(--status-error)" };
  const actionLabel = { inspection: "Inspeccionar", move: "Mover lote", contamination: "Reportar contaminación", note: "Foto / nota", advance_stage: "Avanzar etapa", harvest: "Registrar cosecha", close: "Cerrar lote" };
  const openBatchDetail = (id) => {
    setBitActiveLoteId(id);
    goTab("bitacora");
    goBitTab("bit_ficha", true);
  };
  const runBatchAction = (action, lote) => {
    if (action === "harvest") {
      const bolsa = bitBolsas.find((b) => b.loteId === lote.id && b.estado === "sana");
      setBitCosechaForm({ bolsaId: bolsa?.id || "", loteId: lote.id, codigo: bolsa?.codigo || "", flush: 1, fecha: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], pesoFresco: "", calidad: 4, observaciones: "" });
      setShowBitCosecha(true);
      return;
    }
    if (action === "advance_stage") {
      const next = lote.estado === "incubacion" ? "fructificacion" : lote.estado;
      const from = legacyLifecycle[lote.estado];
      const to = legacyLifecycle[next];
      if (next !== lote.estado && workflow && workflow.canTransition(from, to)) {
        const event = workflow.transitionEvent({ batchId: lote.id, from, to, operatorId: lote.operador || "operador-local" });
        updateBitLote(lote.id, { estado: next, lifecycleState: to, lifecycleEvents: [...lote.lifecycleEvents || [], event] });
      }
      return;
    }
    if (action === "close") {
      updateBitLote(lote.id, { estado: "completado" });
      return;
    }
    if (action === "inspection") {
      goBitTab("bit_bolsas", true);
      return;
    }
    if (action === "contamination") {
      setDiagLoteId(lote.id);
      const b = bitBolsas.find((x) => x.loteId === lote.id && x.estado !== "descartada");
      setDiagBolsaId(b?.id || "");
      setDiagImageBase64("");
      setDiagResult(null);
      setDiagError("");
      setDiagNotes("");
      setShowDiagModal(true);
      return;
    }
    setNoticeDlg({ title: actionLabel[action] || "Acción de lote", msg: "Esta captura conserva el flujo operativo existente del lote." });
  };
  const TodayV2 = () => {
    const now = Date.now();
    const source = bitLotes.filter((l) => !["completado", "descartado"].includes(l.estado)).map((lote, index) => {
      const stats = calcLoteStats(lote.id);
      const contaminated = stats && stats.contPct > 0;
      const inoculated = Date.parse(lote.fechaInoculacion || "");
      const age = Number.isFinite(inoculated) ? Math.max(0, Math.floor((now - inoculated) / 864e5)) : 0;
      return {
        id: lote.id,
        lote,
        severity: stats && stats.contPct >= 20 ? "critical" : void 0,
        blocked: contaminated && stats.contPct < 20,
        dueAt: !contaminated && age >= 14 ? new Date(now - (index + 1) * 36e5).toISOString() : new Date(now + (index + 1) * 36e5).toISOString(),
        title: contaminated ? "Revisar contaminación" : lote.estado === "fructificacion" ? "Registrar cosecha" : "Inspeccionar colonización",
        why: `${lote.especie || "Lote"} · ${lifecycleLabel[legacyLifecycle[lote.estado]] || lote.estado} · día ${age}`
      };
    });
    const queue = workflow ? workflow.buildTodayQueue(source, now) : source;
    const groups = [["critical", "Crítico"], ["overdue", "Vencido"], ["now", "Ahora"], ["blocked", "Bloqueos"], ["later", "Después"], ["context", "Contexto"]];
    return /* @__PURE__ */ React.createElement("section", { className: "os-today-v2", "data-testid": "ux-v2-today" }, /* @__PURE__ */ React.createElement("div", { className: "os-page-kicker" }, "Operación · turno actual"), /* @__PURE__ */ React.createElement("h1", { className: "os-page-title" }, "Hoy"), /* @__PURE__ */ React.createElement("button", { className: "os-scan-target", type: "button", onClick: () => {
      const firstActive = bitLotes.find((l) => !["completado", "descartado"].includes(l.estado));
      setQrSelectedLoteId(bitActiveLoteId || firstActive?.id || bitLotes[0]?.id || "");
      setShowQrSheet(true);
    } }, "Escanear lote o registrar evento"), /* @__PURE__ */ React.createElement("div", { className: "today-climate-strip", "data-testid": "today-climate-strip" }, Object.values(ROOMS_CONFIG).map((r) => {
      const isMartha = r.id === "martha_01";
      const t = isMartha ? 17.2 : 18.4;
      const rh = isMartha ? 91.5 : 88;
      const co2 = isMartha ? 680 : 750;
      const climateMath = typeof window !== "undefined" ? window.SetasClimate : null;
      const vpd = climateMath ? climateMath.calcVPD(t, rh) : 0.21;
      const health = climateMath ? climateMath.evalClimateHealth({
        tC: t,
        rhPct: rh,
        co2Ppm: co2,
        targets: isMartha ? { temperature_c: { min: 14, max: 20 }, rh_pct: { min: 85, max: 95 }, co2_ppm: { max: 900 } } : { temperature_c: { min: 16, max: 22 }, rh_pct: { min: 80, max: 92 }, co2_ppm: { max: 1e3 } }
      }) : { severity: "optimal" };
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: r.id,
          className: `today-climate-card ${health.severity === "critical" ? "os-alert-row--critical" : ""}`,
          onClick: () => {
            setSelectedClimateRoom(r.id);
            goTab("clima");
          },
          title: "Ver telemetría y curvas en vivo"
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--ink-0)" } }, "🌱 ", r.name), /* @__PURE__ */ React.createElement("span", { style: {
          padding: "2px 6px",
          borderRadius: 2,
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          background: health.severity === "critical" ? "var(--accent-terracotta-dim)" : "var(--moss-100)",
          color: health.severity === "critical" ? "var(--accent-terracotta)" : "var(--moss-800)"
        } }, health.severity === "critical" ? "⚠ ALERTA" : "● EN RANGO")),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "var(--font-num)", fontSize: 14, color: "var(--ink-0)", marginTop: 4 } }, /* @__PURE__ */ React.createElement("span", null, "🌡 ", t, "°C"), /* @__PURE__ */ React.createElement("span", null, "💧 ", rh, "%"), /* @__PURE__ */ React.createElement("span", null, "💨 ", co2, " ppm"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-2)" } }, "VPD ", vpd, " kPa"))
      );
    })), queue.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "os-v2-empty" }, "No hay excepciones ni trabajo pendiente. Los lotes nuevos aparecerán aquí según su estado."), groups.map(([bucket, label]) => {
      const rows = queue.filter((item) => item.bucket === bucket);
      if (!rows.length) return null;
      return /* @__PURE__ */ React.createElement("section", { className: "os-today-group", key: bucket }, /* @__PURE__ */ React.createElement("div", { className: "os-section-head" }, /* @__PURE__ */ React.createElement("h2", null, label), /* @__PURE__ */ React.createElement("span", null, rows.length)), rows.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.id, className: "os-task-row " + (bucket === "critical" ? "os-alert-row--critical" : "") }, /* @__PURE__ */ React.createElement("span", { className: "os-task-marker", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "os-task-row__title" }, item.title), /* @__PURE__ */ React.createElement("div", { className: "os-task-row__meta" }, item.lote.codigo, " · ", item.why)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { className: "os-action", type: "button", onClick: () => openBatchDetail(item.id) }, "Abrir lote"), /* @__PURE__ */ React.createElement("button", { className: "os-action", type: "button", title: "Imprimir etiquetas térmicas del lote", onClick: () => openThermalForLote(item.id) }, "🖨")))));
    }));
  };
  const BatchDetailV2 = ({ lote }) => {
    const stats = calcLoteStats(lote.id);
    const state = legacyLifecycle[lote.estado] || "planned";
    const isAdmin = props.isAdmin === true || props.isAdmin === "true";
    const actions = workflow ? workflow.validActions(state, isAdmin ? "direccion" : "operario") : [];
    const bolsas = bitBolsas.filter((b) => b.loteId === lote.id);
    const cosechas = bitCosechas.filter((c) => c.loteId === lote.id);
    const events = [...cosechas.map((c) => ({ id: c.id, title: `Cosecha · flush ${c.flush}`, meta: `${c.fecha} · ${c.pesoFresco} g`, kind: "measured" })), ...bolsas.filter((b) => b.col100).map((b) => ({ id: b.id, title: `Colonización completa · ${b.codigo}`, meta: b.col100, kind: "manual" }))];
    return /* @__PURE__ */ React.createElement("article", { className: "os-batch-detail-v2", "data-testid": "ux-v2-batch-detail" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "os-action os-detail-back", type: "button", onClick: () => goBitTab("bit_dash") }, "Volver a lotes"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { className: "os-action", type: "button", onClick: () => setPublicTraceModalLoteId(lote.id), style: { display: "flex", alignItems: "center", gap: 6 }, title: "Ver ficha pública de trazabilidad botánica" }, /* @__PURE__ */ React.createElement(AppIcon, { name: "globe", size: 13, color: "var(--moss-700)" }), " Ver Ficha Pública QR"), /* @__PURE__ */ React.createElement("button", { className: "os-action", type: "button", onClick: () => openThermalForLote(lote.id), style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(AppIcon, { name: "print", size: 13 }), " 🏷 Imprimir Etiquetas Térmicas"))), /* @__PURE__ */ React.createElement("header", { className: "os-batch-header", "data-testid": "active-lote", "data-lote-id": lote.id }, /* @__PURE__ */ React.createElement("div", { className: "os-batch-header__top" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "os-batch-header__code" }, lote.codigo), /* @__PURE__ */ React.createElement("div", { className: "os-batch-header__species" }, lote.especie)), /* @__PURE__ */ React.createElement("span", { className: "os-lifecycle-state", style: { borderTopColor: lifecycleColor[state] || "var(--text-metadata)", color: lifecycleColor[state] || "var(--text-metadata)" } }, lifecycleLabel[state] || state)), /* @__PURE__ */ React.createElement("div", { className: "os-batch-header__meta" }, /* @__PURE__ */ React.createElement("span", null, lote.numBolsas, " bolsas"), /* @__PURE__ */ React.createElement("span", null, "Inoculación ", lote.fechaInoculacion), /* @__PURE__ */ React.createElement("span", null, lote.recipeRef?.name || "Receta sin vincular")), /* @__PURE__ */ React.createElement("div", { className: "os-batch-header__next" }, /* @__PURE__ */ React.createElement("span", { className: "os-batch-header__next-label" }, "Siguiente acción válida"), /* @__PURE__ */ React.createElement("span", { className: "os-batch-header__next-value" }, actionLabel[actions[0]] || "Sin acciones pendientes"))), /* @__PURE__ */ React.createElement("div", { className: "os-metric-grid" }, /* @__PURE__ */ React.createElement("div", { className: "os-metric" }, /* @__PURE__ */ React.createElement("span", { className: "os-metric__label" }, "Bolsas sanas"), /* @__PURE__ */ React.createElement("span", { className: "os-metric__value" }, stats ? `${stats.bolsasSanas}/${stats.numBolsas}` : "—"), /* @__PURE__ */ React.createElement("span", { className: "os-provenance os-provenance--calculated" }, "Calculado")), /* @__PURE__ */ React.createElement("div", { className: "os-metric" }, /* @__PURE__ */ React.createElement("span", { className: "os-metric__label" }, "Contaminación"), /* @__PURE__ */ React.createElement("span", { className: "os-metric__value" }, stats ? stats.contPct.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("span", { className: "os-provenance os-provenance--calculated" }, "Calculado")), /* @__PURE__ */ React.createElement("div", { className: "os-metric" }, /* @__PURE__ */ React.createElement("span", { className: "os-metric__label" }, "Cosechado"), /* @__PURE__ */ React.createElement("span", { className: "os-metric__value" }, stats ? stats.totalFresco.toFixed(3) + " kg" : "—"), /* @__PURE__ */ React.createElement("span", { className: "os-provenance os-provenance--measured" }, "Medido"))), stats && /* @__PURE__ */ React.createElement("section", { className: "os-finance-panel", "data-testid": "batch-financial-closure" }, /* @__PURE__ */ React.createElement("div", { className: "os-finance-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "os-finance-title" }, "💰 Cierre Financiero & Rendimiento Real"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-1)", marginTop: 2 } }, "Balance económico del lote · Precio venta: $", Math.round(stats.precioVentaKg).toLocaleString("es-CO"), " COP/kg")), stats.totalFresco > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 2, background: stats.margenRealTotal >= 0 ? "var(--moss-200,#DCE1D1)" : "var(--coral-100,#FDE8E8)", color: stats.margenRealTotal >= 0 ? "var(--moss-700,#404D2E)" : "var(--coral-700,#A83232)" } }, stats.margenRealTotal >= 0 ? "+" : "", "$", Math.round(stats.margenRealTotal).toLocaleString("es-CO"), " (", stats.margenRealPct.toFixed(1), "% margen)")), /* @__PURE__ */ React.createElement("div", { className: "os-finance-grid" }, /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box" }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label" }, "Inversión Incurrida"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value" }, "$", Math.round(stats.costoIncurridoTotal).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub" }, "$", Math.round(stats.costoIncurridoPorBolsa).toLocaleString("es-CO"), " / bolsa (", stats.numBolsas, " bolsas)")), /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box" }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label" }, "Ingreso Cosechas"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value" }, "$", Math.round(stats.ingresoRealTotal).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub" }, stats.totalFresco.toFixed(2), " kg hongo fresco")), /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box" }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label" }, "EB Real vs Estimada"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value" }, stats.be != null ? stats.be.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub" }, stats.varianzaEB != null ? `${stats.varianzaEB >= 0 ? "+" : ""}${stats.varianzaEB.toFixed(1)}% vs receta (${stats.ebEstimada}%)` : "Sin receta base")), /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box", style: { background: stats.margenRealTotal >= 0 ? "var(--paper-100,#EFEBE0)" : "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label" }, "Costo / kg Cosechado"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value" }, stats.costoRealPorKgCosechado != null ? "$" + Math.round(stats.costoRealPorKgCosechado).toLocaleString("es-CO") : "—"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub" }, stats.totalFresco > 0 ? "Costo unitario real" : "Pendiente cosecha"))), stats.flushes && stats.flushes.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-2)" } }, "Aporte por Oleada (Flushes)"), /* @__PURE__ */ React.createElement("div", { className: "os-flush-bar-container" }, stats.flushes.map((f, i) => /* @__PURE__ */ React.createElement("div", { key: f.flush, style: { width: `${f.pctTotal}%`, height: "100%", background: ["#5B6B44", "#8C7F5B", "#A85C32"][i % 3] || "#555" }, title: `Flush ${f.flush}: ${f.kg.toFixed(2)} kg (${f.pctTotal.toFixed(1)}%)` }))), /* @__PURE__ */ React.createElement("div", { className: "os-flush-list" }, stats.flushes.map((f) => /* @__PURE__ */ React.createElement("div", { className: "os-flush-item", key: f.flush }, /* @__PURE__ */ React.createElement("span", null, "Flush ", f.flush), /* @__PURE__ */ React.createElement("span", null, f.kg.toFixed(2), " kg (", f.pctTotal.toFixed(1), "%)"), /* @__PURE__ */ React.createElement("span", null, "+$", Math.round(f.ingreso).toLocaleString("es-CO"))))))), /* @__PURE__ */ React.createElement("div", { className: "os-detail-grid" }, /* @__PURE__ */ React.createElement("section", { className: "os-detail-panel" }, /* @__PURE__ */ React.createElement("h2", null, "Actividad"), events.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "os-v2-empty" }, "Todavía no hay eventos medidos o manuales para este lote.") : events.map((e) => /* @__PURE__ */ React.createElement("div", { className: "os-event-row", key: e.id }, /* @__PURE__ */ React.createElement("span", { className: "os-task-marker" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "os-event-row__title" }, e.title), /* @__PURE__ */ React.createElement("div", { className: "os-event-row__meta" }, e.meta)), /* @__PURE__ */ React.createElement("span", { className: "os-provenance os-provenance--" + e.kind }, e.kind === "measured" ? "Medido" : "Manual")))), /* @__PURE__ */ React.createElement("aside", { className: "os-detail-panel" }, /* @__PURE__ */ React.createElement("h2", null, "Acciones válidas ahora"), /* @__PURE__ */ React.createElement("div", { className: "os-valid-actions" }, actions.filter((a) => actionLabel[a]).map((action) => /* @__PURE__ */ React.createElement("button", { key: action, className: "os-action", type: "button", onClick: () => runBatchAction(action, lote) }, actionLabel[action])), /* @__PURE__ */ React.createElement("button", { className: "os-action", type: "button", style: { marginTop: 8, background: "var(--paper-1,#EFEBE0)", border: "1px solid var(--border-hairline,#8C7F5B)", color: "var(--ink-0)" }, onClick: () => {
      setThermalLote(lote);
      setThermalBagEnd(lote.numBolsas || 12);
      setThermalScope("all");
      setShowThermalModal(true);
    } }, "🏷 Imprimir Etiquetas Térmicas (50×30 / 60×40)")), /* @__PURE__ */ React.createElement("span", { role: "status", "aria-live": "polite", "aria-atomic": "true", className: "os-sync-state " + (bitSyncErr ? "os-sync-state--error" : "os-sync-state--synced") }, bitSyncErr ? "Sin sincronizar" : "Sincronizado"))));
  };
  const ClimateDashboardSection = () => {
    const climateMath = typeof window !== "undefined" ? window.SetasClimate : null;
    const room = ROOMS_CONFIG[selectedClimateRoom] || ROOMS_CONFIG.martha_01;
    const lotesEnSala = bitLotes.filter((l) => (l.sala === selectedClimateRoom || l.ubicacion === selectedClimateRoom || !l.sala && selectedClimateRoom === "martha_01") && !["completado", "descartado"].includes(l.estado));
    const mainLote = lotesEnSala[0] || bitLotes[0];
    const defaultTargets = selectedClimateRoom === "martha_01" ? {
      temperature_c: { min: 14, max: 20, target: 17 },
      rh_pct: { min: 85, max: 95, target: 90 },
      co2_ppm: { min: 400, max: 900, target: 600 }
    } : {
      temperature_c: { min: 16, max: 22, target: 18.5 },
      rh_pct: { min: 80, max: 92, target: 86 },
      co2_ppm: { min: 450, max: 1e3, target: 700 }
    };
    const baseMetrics = selectedClimateRoom === "martha_01" ? { temp: 17.2, rh: 91.5, co2: 680, subTemp: 17.8, timestamp: "hace 45s" } : selectedClimateRoom === "martha_02" ? { temp: 18.4, rh: 88, co2: 750, subTemp: 18.9, timestamp: "hace 1m" } : { temp: 23.4, rh: 72, co2: 2400, subTemp: 24.8, timestamp: "hace 35s" };
    const injected = injectedClimateReadings[selectedClimateRoom];
    const currentMetrics = injected ? { ...baseMetrics, ...injected } : baseMetrics;
    const vpd = climateMath ? climateMath.calcVPD(currentMetrics.temp, currentMetrics.rh) : 0.21;
    const dewPoint = climateMath ? climateMath.calcDewPoint(currentMetrics.temp, currentMetrics.rh) : 15.7;
    const climateHealth = climateMath ? climateMath.evalClimateHealth({
      tC: currentMetrics.temp,
      rhPct: currentMetrics.rh,
      co2Ppm: currentMetrics.co2,
      targets: defaultTargets
    }) : { severity: "optimal", alerts: [] };
    const numPoints = climateTimeRange === "1h" ? 12 : climateTimeRange === "6h" ? 24 : 36;
    const baseTemp = currentMetrics.temp;
    const baseRh = currentMetrics.rh;
    const baseCo2 = currentMetrics.co2;
    const tempSeries = Array.from({ length: numPoints }, (_, i) => {
      const noise = Math.sin(i * 0.4) * 0.6 + Math.cos(i * 0.7) * 0.3;
      return Math.round((baseTemp + noise) * 10) / 10;
    });
    const rhSeries = Array.from({ length: numPoints }, (_, i) => {
      const noise = Math.cos(i * 0.3) * 2.5 + Math.sin(i * 0.8) * 1.2;
      return Math.round(Math.min(99, Math.max(70, baseRh + noise)) * 10) / 10;
    });
    const co2Series = Array.from({ length: numPoints }, (_, i) => {
      const noise = Math.sin(i * 0.5) * 80 + Math.cos(i * 0.3) * 45;
      return Math.round(baseCo2 + noise);
    });
    const tempMin = Math.min(...tempSeries);
    const tempMax = Math.max(...tempSeries);
    const rhMin = Math.min(...rhSeries);
    const rhMax = Math.max(...rhSeries);
    const co2Min = Math.min(...co2Series);
    const co2Max = Math.max(...co2Series);
    const tempPoints = climateMath ? climateMath.generateSvgPolyline(tempSeries, null, { width: 500, height: 120, padding: 8, yMin: 12, yMax: 24 }) : "";
    const rhPoints = climateMath ? climateMath.generateSvgPolyline(rhSeries, null, { width: 500, height: 120, padding: 8, yMin: 70, yMax: 100 }) : "";
    const co2Points = climateMath ? climateMath.generateSvgPolyline(co2Series, null, { width: 500, height: 120, padding: 8, yMin: 300, yMax: 1200 }) : "";
    return /* @__PURE__ */ React.createElement("div", { className: "climate-dashboard", "data-testid": "climate-dashboard" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "climate-room-nav" }, Object.values(ROOMS_CONFIG).map((r) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: r.id,
        type: "button",
        className: `climate-room-btn ${selectedClimateRoom === r.id ? "on" : ""}`,
        onClick: () => setSelectedClimateRoom(r.id)
      },
      /* @__PURE__ */ React.createElement("span", null, "🌱"),
      /* @__PURE__ */ React.createElement("span", null, r.name)
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn--sm btn--secondary",
        onClick: () => setShowIoTHub(true),
        style: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", fontSize: 11 }
      },
      /* @__PURE__ */ React.createElement(AppIcon, { name: "temp", size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, "Hub IoT & Firmware")
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "var(--moss-500)", display: "inline-block" } }), /* @__PURE__ */ React.createElement("span", null, "ESP32 conectado · ", currentMetrics.timestamp)))), /* @__PURE__ */ React.createElement("div", { className: "climate-cycle-banner" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-terracotta)" } }, room.name, " · ", room.spec), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink-0)", marginTop: 2 } }, mainLote ? `${mainLote.especie} · Lote ${mainLote.codigo}` : "Sala en Acondicionamiento / Standby"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-2)", marginTop: 2 } }, "Nodo IoT: ", /* @__PURE__ */ React.createElement("code", null, room.device), " · Sensores: ", room.sensors, " · Altitud: ", room.altitude)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowEsp32ConfigModal(true),
        className: "inv-btn inv-btn-sec",
        style: { minHeight: 34, padding: "4px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 6, borderColor: "var(--accent-olive, #5B6B44)", color: "var(--accent-olive, #5B6B44)", fontWeight: 700 },
        title: "Generar y descargar firmware ESPHome YAML para este cuarto de cultivo"
      },
      "⚡ Exportar ESPHome YAML"
    ), /* @__PURE__ */ React.createElement("div", { style: {
      padding: "6px 12px",
      borderRadius: "var(--radius-sm)",
      background: climateHealth.severity === "critical" ? "var(--accent-terracotta-dim)" : "var(--moss-100)",
      color: climateHealth.severity === "critical" ? "var(--accent-terracotta)" : "var(--moss-800)",
      border: `1px solid ${climateHealth.severity === "critical" ? "var(--accent-terracotta)" : "var(--moss-600)"}`,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      fontWeight: 700
    } }, climateHealth.severity === "critical" ? "⚠ ALERTA AMBIENTAL" : "● CONDICIONES NOMINALES"))), climateHealth.alerts.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, climateHealth.alerts.map((al, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, style: {
      padding: "8px 12px",
      background: al.level === "alert" ? "#FEE2E2" : "#FEF3C7",
      color: al.level === "alert" ? "#991B1B" : "#92400E",
      borderLeft: `4px solid ${al.level === "alert" ? "#DC2626" : "#D97706"}`,
      borderRadius: "var(--radius-sm)",
      fontSize: 12,
      fontFamily: "var(--font-sans)",
      display: "flex",
      alignItems: "center",
      gap: 8
    } }, /* @__PURE__ */ React.createElement("span", null, al.level === "alert" ? "🚨" : "⚠️"), /* @__PURE__ */ React.createElement("span", null, al.msg)))), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-grid" }, /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-header" }, /* @__PURE__ */ React.createElement("span", null, "Temperatura"), /* @__PURE__ */ React.createElement("span", null, "Target: ", defaultTargets.temperature_c.target, "°C")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-value" }, /* @__PURE__ */ React.createElement("span", null, currentMetrics.temp), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: "var(--ink-2)" } }, "°C")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-sub" }, /* @__PURE__ */ React.createElement("span", null, "24h: ", tempMin, "°C – ", tempMax, "°C · Sustrato: ", currentMetrics.subTemp, "°C"))), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-header" }, /* @__PURE__ */ React.createElement("span", null, "Humedad Relativa"), /* @__PURE__ */ React.createElement("span", null, "Target: ", defaultTargets.rh_pct.target, "%")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-value" }, /* @__PURE__ */ React.createElement("span", null, currentMetrics.rh), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: "var(--ink-2)" } }, "%")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-sub" }, /* @__PURE__ */ React.createElement("span", null, "24h: ", rhMin, "% – ", rhMax, "% · Banda: [", defaultTargets.rh_pct.min, "% - ", defaultTargets.rh_pct.max, "%]"))), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-header" }, /* @__PURE__ */ React.createElement("span", null, "Dióxido de Carbono"), /* @__PURE__ */ React.createElement("span", null, "Max: ", defaultTargets.co2_ppm.max, " ppm")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-value" }, /* @__PURE__ */ React.createElement("span", null, currentMetrics.co2), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--ink-2)" } }, "ppm")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-sub" }, /* @__PURE__ */ React.createElement("span", null, "SCD30 NDIR · Comp. 2.600m · 24h: ", co2Min, " – ", co2Max, " ppm"))), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-card" }, /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-header" }, /* @__PURE__ */ React.createElement("span", null, "VPD & Psicrometría"), /* @__PURE__ */ React.createElement("span", { style: { color: vpd >= 0.1 && vpd <= 0.5 ? "var(--moss-700)" : "var(--accent-terracotta)" } }, vpd >= 0.1 && vpd <= 0.5 ? "Transpiración Óptima" : "Fuera de Rango")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-value" }, /* @__PURE__ */ React.createElement("span", null, vpd), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: "var(--ink-2)" } }, "kPa")), /* @__PURE__ */ React.createElement("div", { className: "climate-kpi-sub" }, /* @__PURE__ */ React.createElement("span", null, "Punto de Rocío (Tdp): ", dewPoint, "°C · ΔT anti-rocío: ", (currentMetrics.temp - dewPoint).toFixed(1), "°C")))), /* @__PURE__ */ React.createElement("div", { className: "climate-chart-panel" }, /* @__PURE__ */ React.createElement("div", { className: "climate-chart-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, fontFamily: "var(--font-display)", fontSize: 15, color: "var(--ink-0)" } }, "📈 Series Temporales de Telemetría Ambiental"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-2)", marginTop: 2 } }, "Lecturas recibidas del ESP32 comparadas con las bandas óptimas del RoomCycle activo")), /* @__PURE__ */ React.createElement("div", { className: "climate-range-pills" }, ["1h", "6h", "24h"].map((rng) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: rng,
        type: "button",
        className: `climate-range-pill ${climateTimeRange === rng ? "on" : ""}`,
        onClick: () => setClimateTimeRange(rng)
      },
      rng
    )))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-1)", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", null, "TEMPERATURA (°C)"), /* @__PURE__ */ React.createElement("span", null, "Banda: ", defaultTargets.temperature_c.min, "°C - ", defaultTargets.temperature_c.max, "°C")), /* @__PURE__ */ React.createElement("div", { className: "climate-svg-wrap" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 500 120", preserveAspectRatio: "none", style: { width: "100%", height: "100%", display: "block" } }, /* @__PURE__ */ React.createElement("rect", { x: "0", y: "40", width: "500", height: "45", fill: "rgba(74, 110, 66, 0.12)" }), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "62.5", x2: "500", y2: "62.5", stroke: "rgba(74, 110, 66, 0.4)", strokeDasharray: "4 4", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polyline", { fill: "none", stroke: "var(--moss-700)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", points: tempPoints })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-1)", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", null, "HUMEDAD RELATIVA (%RH)"), /* @__PURE__ */ React.createElement("span", null, "Banda: ", defaultTargets.rh_pct.min, "% - ", defaultTargets.rh_pct.max, "%")), /* @__PURE__ */ React.createElement("div", { className: "climate-svg-wrap" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 500 120", preserveAspectRatio: "none", style: { width: "100%", height: "100%", display: "block" } }, /* @__PURE__ */ React.createElement("rect", { x: "0", y: "20", width: "500", height: "60", fill: "rgba(56, 120, 180, 0.12)" }), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "40", x2: "500", y2: "40", stroke: "rgba(56, 120, 180, 0.4)", strokeDasharray: "4 4", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polyline", { fill: "none", stroke: "#2563EB", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", points: rhPoints })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-1)", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", null, "CO₂ (PPM)"), /* @__PURE__ */ React.createElement("span", null, "Límite FAE: < ", defaultTargets.co2_ppm.max, " ppm")), /* @__PURE__ */ React.createElement("div", { className: "climate-svg-wrap" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 500 120", preserveAspectRatio: "none", style: { width: "100%", height: "100%", display: "block" } }, /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "40", x2: "500", y2: "40", stroke: "rgba(168, 92, 50, 0.5)", strokeDasharray: "4 4", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polyline", { fill: "none", stroke: "var(--accent-terracotta)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", points: co2Points })))))), /* @__PURE__ */ React.createElement("div", { className: "climate-actuators-panel", "data-testid": "climate-actuators-panel" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, fontFamily: "var(--font-display)", fontSize: 15, color: "var(--ink-0)" } }, "⚡ Actuadores y Relés de Potencia (Hosyond 2ch)"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-2)", marginTop: 2 } }, "Control automatizado por histéresis y pulsos de renovación con protección anti-ciclo corto")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--moss-700)", fontWeight: 700 } }, "● Lógica Local Activa (ESP32)")), /* @__PURE__ */ React.createElement("div", { className: "climate-actuators-grid" }, /* @__PURE__ */ React.createElement("div", { className: "climate-actuator-card" }, /* @__PURE__ */ React.createElement("div", { className: "climate-actuator-head" }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ink-0)" } }, "💧 Humidificador (Relay Ch1 · T7/H05)"), /* @__PURE__ */ React.createElement("span", { className: `climate-actuator-badge ${humidifierOverride === "ON" || humidifierOverride === null && currentMetrics.rh < defaultTargets.rh_pct.min ? "on" : "off"}` }, humidifierOverride === "ON" ? "OVERRIDE [ON]" : humidifierOverride === "OFF" ? "OVERRIDE [OFF]" : currentMetrics.rh < defaultTargets.rh_pct.min ? "AUTO [ENCENDIDO]" : "AUTO [REPOSO]")), /* @__PURE__ */ React.createElement("div", { className: "climate-actuator-meta" }, /* @__PURE__ */ React.createElement("b", null, "Potencia:"), " 100% · ", /* @__PURE__ */ React.createElement("b", null, "Modo:"), " ", humidifierOverride ? "Manual" : "Bang-Bang con Histéresis", " (Min idle: 120s)", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", null, "Diagnóstico:"), " ", humidifierOverride === "ON" ? "Forzado manualmente por el operario." : currentMetrics.rh >= defaultTargets.rh_pct.target ? `Target alcanzado (${currentMetrics.rh}% >= ${defaultTargets.rh_pct.target}%)` : `Humidificando hacia ${defaultTargets.rh_pct.target}%`), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 4 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "climate-actuator-btn",
        onClick: () => setHumidifierOverride((prev) => prev === "ON" ? null : "ON")
      },
      humidifierOverride === "ON" ? "↺ Modo Auto" : "⚡ Forzar Humidificación (1m)"
    ), humidifierOverride !== null && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "climate-actuator-btn",
        onClick: () => setHumidifierOverride(null)
      },
      "Restablecer"
    ))), /* @__PURE__ */ React.createElement("div", { className: "climate-actuator-card" }, /* @__PURE__ */ React.createElement("div", { className: "climate-actuator-head" }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ink-0)" } }, "💨 Extractor FAE (Relay Ch2 · Cloudline H4)"), /* @__PURE__ */ React.createElement("span", { className: `climate-actuator-badge ${faePulseActive || currentMetrics.co2 > defaultTargets.co2_ppm.max ? "pulse" : "off"}` }, faePulseActive || currentMetrics.co2 > defaultTargets.co2_ppm.max ? "PULSO ACTIVO (35s)" : "AUTO [EN ESPERA]")), /* @__PURE__ */ React.createElement("div", { className: "climate-actuator-meta" }, /* @__PURE__ */ React.createElement("b", null, "Velocidad física:"), " 1–2 (~18 CFM efectivo) · ", /* @__PURE__ */ React.createElement("b", null, "Duración pulso:"), " 35s", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", null, "Diagnóstico:"), " ", faePulseActive ? "Evacuando CO2 y renovando aire fresco..." : currentMetrics.co2 > defaultTargets.co2_ppm.max ? `CO₂ alto (${currentMetrics.co2} ppm > ${defaultTargets.co2_ppm.max} ppm)` : `CO₂ en rango (${currentMetrics.co2} ppm). Próximo pulso programado en ~12 min`), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 4 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "climate-actuator-btn",
        onClick: () => {
          setFaePulseActive(true);
          setTimeout(() => setFaePulseActive(false), 5e3);
        },
        disabled: faePulseActive
      },
      faePulseActive ? "⏳ Pulso en Curso..." : "🌀 Disparar Pulso FAE (35s)"
    )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ink-1)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" } }, "📋 Historial Reciente de Conmutación de Relés"), /* @__PURE__ */ React.createElement("div", { className: "climate-actuator-logs" }, /* @__PURE__ */ React.createElement("div", { className: "climate-log-row" }, /* @__PURE__ */ React.createElement("span", null, "[Ch2 · Extractor H4] Pulso periódico FAE completado (35s a vel. 1)"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-2)" } }, "hace 14m")), /* @__PURE__ */ React.createElement("div", { className: "climate-log-row" }, /* @__PURE__ */ React.createElement("span", null, "[Ch1 · Humidificador T7] Apagado al alcanzar HR target (91.5% >= 90%)"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-2)" } }, "hace 22m")), /* @__PURE__ */ React.createElement("div", { className: "climate-log-row" }, /* @__PURE__ */ React.createElement("span", null, "[Ch1 · Humidificador T7] Encendido por banda mínima (84.2% < 85%)"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-2)" } }, "hace 26m"))))));
  };
  const BitacoraSection = () => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "panel", style: { paddingBottom: 0, marginBottom: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "bit-context-actions", style: { display: "flex", alignItems: "center", gap: 6, minHeight: 44, paddingBottom: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm" + (bitTab === "bit_comparador" ? " on" : ""), onClick: () => goBitTab("bit_comparador") }, "Comparar lotes"), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-sec inv-btn-sm" + (bitTab === "bit_ficha" ? " on" : ""), onClick: () => goBitTab("bit_ficha"), disabled: !bitActiveLoteId, style: { opacity: bitActiveLoteId ? 1 : 0.45 } }, "Ficha experimental"), bitActiveLoteId && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "inv-btn inv-btn-sec inv-btn-sm",
      onClick: () => openThermalForLote(bitActiveLoteId),
      title: "Imprimir etiquetas térmicas para este lote",
      style: { display: "flex", alignItems: "center", gap: 4 }
    },
    "🖨 Etiquetas"
  ), bitActiveLoteId && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginLeft: "auto", alignSelf: "center", paddingRight: 4 } }, bitLotes.find((lt) => lt.id === bitActiveLoteId)?.codigo), bitSyncErr && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "#C53030", marginLeft: 8, alignSelf: "center" }, title: bitSyncErr }, "⚠ sin sincronizar"))), bitTab === "bit_dash" && /* @__PURE__ */ React.createElement("div", { className: "panel" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "sec", style: { marginBottom: 0, borderBottom: "none" } }, "Lotes experimentales ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)", fontWeight: 400 } }, "(", bitLotes.length, ")")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setBitDashView("grid"), style: { padding: "6px 12px", background: bitDashView === "grid" ? "var(--ink-900)" : "var(--paper-50)", color: bitDashView === "grid" ? "var(--paper-0)" : "var(--ink-700)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", cursor: "pointer", transition: "background-color .12s,border-color .12s,color .12s,transform .12s" } }, "⊞ Cuadrícula"), /* @__PURE__ */ React.createElement("button", { onClick: () => setBitDashView("tabla"), style: { padding: "6px 12px", background: bitDashView === "tabla" ? "var(--ink-900)" : "var(--paper-50)", color: bitDashView === "tabla" ? "var(--paper-0)" : "var(--ink-700)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", cursor: "pointer", transition: "background-color .12s,border-color .12s,color .12s,transform .12s" } }, "≡ Tabla"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setBitNuevoForm(buildBitNuevoForm());
    setShowBitNuevo(true);
  }, className: "inv-btn inv-btn-pri" }, "+ Nueva prueba"))), bitLotes.length > 0 && (() => {
    const allStats = bitLotes.map((lt) => ({ lt, s: calcLoteStats(lt.id) }));
    const wd = allStats.filter((x) => x.s && x.s.totalFresco > 0);
    const avgBE = wd.length ? wd.reduce((s, x) => s + (x.s.be || 0), 0) / wd.length : null;
    const ws = allStats.filter((x) => x.s);
    const avgCont = ws.length ? ws.reduce((s, x) => s + (x.s.contPct || 0), 0) / ws.length : null;
    const totalKg = allStats.reduce((s, x) => s + (x.s?.totalFresco || 0), 0);
    return /* @__PURE__ */ React.createElement("div", { className: "inv-stat-row", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, bitLotes.length), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Lotes")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, avgBE != null ? avgBE.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "BE media")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val", style: { color: avgCont != null && avgCont > 15 ? "var(--coral-700)" : "inherit" } }, avgCont != null ? avgCont.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Contam. media")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, totalKg.toFixed(2), " kg"), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Cosechado")));
  })(), bitLotes.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "48px 20px", color: "var(--ink-500)", fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", border: "1px dashed var(--border-soft)", borderRadius: "var(--r-md)" } }, "Sin lotes experimentales registrados.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setBitNuevoForm(buildBitNuevoForm());
    setShowBitNuevo(true);
  }, className: "inv-btn inv-btn-pri", style: { marginTop: 14 } }, "+ Crear primer lote")), bitLotes.length > 0 && bitDashView === "grid" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 } }, bitLotes.map((lote) => {
    const stats = calcLoteStats(lote.id);
    const score = stats ? calcLoteScore(stats) : null;
    const EC = { incubacion: "var(--ochre-500)", fructificacion: "var(--moss-500)", completado: "var(--coral-700)", descartado: "var(--ink-400)" };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: lote.id,
        "data-lote-id": lote.id,
        className: "panel",
        style: { padding: 0, overflow: "hidden", cursor: "pointer", margin: 0, transition: "box-shadow .18s,transform .18s" },
        onClick: () => {
          setBitActiveLoteId(lote.id);
          goBitTab("bit_bolsas", true);
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-lift)";
          e.currentTarget.style.transform = "translateY(-2px)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.boxShadow = "";
          e.currentTarget.style.transform = "";
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 14px", borderBottom: "1px solid var(--paper-300)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, lote.codigo), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-base)", color: "var(--ink-900)", lineHeight: 1.2 } }, lote.especie || "—"), lote.especieCientifico && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sci)", fontStyle: "italic", fontSize: "var(--text-sm)", color: "var(--ink-600)", marginTop: 1 } }, lote.especieCientifico)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "2px 7px", borderRadius: 10, background: EC[lote.estado] || "var(--ink-400)", color: "var(--paper-0)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)" } }, lote.estado), score !== null && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: 22, color: "var(--coral-700)", lineHeight: 1 } }, score, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, "/100")))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--paper-300)" } }, [["Sanas", stats ? `${stats.bolsasSanas}/${stats.numBolsas}` : "—"], ["BE", stats?.be != null ? stats.be.toFixed(0) + "%" : "—"], ["Cosecha", stats?.totalFresco ? stats.totalFresco.toFixed(2) + " kg" : "—"]].map(([lb, v]) => /* @__PURE__ */ React.createElement("div", { key: lb, style: { background: "var(--paper-50)", padding: "8px 4px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", marginBottom: 2 } }, lb), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-md)", color: "var(--ink-900)" } }, v)))),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-100)", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, lote.fechaInoculacion), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, lote.veredicto ? /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "2px 7px", borderRadius: 10, background: "var(--moss-200)", color: "var(--moss-700)", fontWeight: 700 } }, lote.veredicto) : /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, "sin veredicto"), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "inv-btn inv-btn-sec inv-btn-sm",
          onClick: (e) => {
            e.stopPropagation();
            openThermalForLote(lote.id);
          },
          title: "Imprimir etiquetas térmicas del lote",
          style: { padding: "3px 8px", fontSize: 12 }
        },
        "🖨"
      )))
    );
  })), bitLotes.length > 0 && bitDashView === "tabla" && /* @__PURE__ */ React.createElement("div", { className: "inv-section" }, /* @__PURE__ */ React.createElement("table", { className: "inv-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Código"), /* @__PURE__ */ React.createElement("th", null, "Especie"), /* @__PURE__ */ React.createElement("th", null, "Fecha inoc."), /* @__PURE__ */ React.createElement("th", null, "Bolsas"), /* @__PURE__ */ React.createElement("th", null, "BE"), /* @__PURE__ */ React.createElement("th", null, "Contam."), /* @__PURE__ */ React.createElement("th", null, "Cosecha"), /* @__PURE__ */ React.createElement("th", null, "Score"), /* @__PURE__ */ React.createElement("th", null, "Estado"), /* @__PURE__ */ React.createElement("th", null, "Veredicto"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Acciones"))), /* @__PURE__ */ React.createElement("tbody", null, bitLotes.map((lote) => {
    const stats = calcLoteStats(lote.id);
    const score = stats ? calcLoteScore(stats) : null;
    return /* @__PURE__ */ React.createElement("tr", { key: lote.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-table-link", onClick: () => {
      setBitActiveLoteId(lote.id);
      goBitTab("bit_bolsas", true);
    }, "aria-label": `Abrir lote ${lote.codigo}` }, lote.codigo)), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-body)", fontWeight: 700 } }, lote.especie), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" } }, lote.fechaInoculacion), /* @__PURE__ */ React.createElement("td", null, stats ? `${stats.bolsasSanas}/${stats.numBolsas}` : lote.numBolsas), /* @__PURE__ */ React.createElement("td", { style: { color: stats?.be > 80 ? "var(--moss-700)" : stats?.be > 60 ? "var(--ochre-600)" : "var(--coral-700)", fontWeight: 700 } }, stats?.be != null ? stats.be.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("td", { style: { color: stats?.contPct > 20 ? "var(--coral-700)" : "inherit" } }, stats?.contPct != null ? stats.contPct.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("td", null, stats?.totalFresco ? stats.totalFresco.toFixed(2) + " kg" : "0 kg"), /* @__PURE__ */ React.createElement("td", null, score !== null ? score + "/100" : "—"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "2px 6px", borderRadius: 8, background: "var(--paper-300)" } }, lote.estado)), /* @__PURE__ */ React.createElement("td", null, lote.veredicto ? /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "2px 6px", borderRadius: 8, background: "var(--moss-200)", color: "var(--moss-700)" } }, lote.veredicto) : "—"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-sec inv-btn-sm", onClick: () => openThermalForLote(lote.id), title: "Imprimir etiquetas térmicas" }, "🖨"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-sec inv-btn-sm", onClick: () => requireAdmin(deleteBitLote)(lote.id), "aria-label": "Eliminar lote " + lote.codigo }, "✕"))));
  }))))), bitTab === "bit_bolsas" && bitActiveLoteId && (() => {
    const lote = bitLotes.find((lt) => lt.id === bitActiveLoteId);
    if (!lote) return null;
    const bolsas = bitBolsas.filter((b) => b.loteId === bitActiveLoteId);
    const stats = calcLoteStats(bitActiveLoteId);
    const EB = { sana: { c: "var(--moss-700)", l: "Sana" }, contaminada: { c: "var(--coral-700)", l: "Contaminada" }, dudosa: { c: "var(--ochre-500)", l: "Dudosa" }, descartada: { c: "var(--ink-400)", l: "Descartada" } };
    return /* @__PURE__ */ React.createElement("div", { className: "panel", "data-testid": "active-lote", "data-lote-id": lote.id }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)" } }, lote.codigo), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 17, color: "var(--ink-900)" } }, lote.especie), lote.especieCientifico && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sci)", fontStyle: "italic", fontSize: "var(--text-sm)", color: "var(--ink-600)" } }, lote.especieCientifico)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "inv-btn inv-btn-sec",
        onClick: () => setPublicTraceModalLoteId(lote.id),
        style: { display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", padding: "6px 12px" },
        title: "Ver ficha pública de trazabilidad de cara al cliente"
      },
      /* @__PURE__ */ React.createElement(AppIcon, { name: "globe", size: 13, color: "var(--moss-700)" }),
      " Ficha Pública QR"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "inv-btn inv-btn-sec",
        onClick: () => openThermalForLote(lote.id),
        style: { display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", padding: "6px 12px" },
        title: "Imprimir rollo completo de etiquetas térmicas con QR"
      },
      "🏷 Imprimir Rollo QR (",
      lote.numBolsas || 12,
      " bolsas)"
    ), /* @__PURE__ */ React.createElement("select", { name: `loteVerdict-${lote.id}`, "aria-label": `Veredicto del lote ${lote.codigo}`, value: lote.veredicto || "", onChange: (e) => updateBitLote(lote.id, { veredicto: e.target.value }), className: "inv-input", style: { width: "auto", fontSize: "var(--text-sm)", padding: "6px 10px" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— veredicto —"), ["prometedora", "descartar", "repetir", "ajustar humedad", "riesgo contaminación", "buena para escalar"].map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v))), /* @__PURE__ */ React.createElement("select", { name: `loteStatus-${lote.id}`, "aria-label": `Estado del lote ${lote.codigo}`, value: lote.estado, onChange: (e) => updateBitLote(lote.id, { estado: e.target.value }), className: "inv-input", style: { width: "auto", fontSize: "var(--text-sm)", padding: "6px 10px" } }, ["incubacion", "fructificacion", "completado", "descartado"].map((st) => /* @__PURE__ */ React.createElement("option", { key: st, value: st }, st))))), stats && /* @__PURE__ */ React.createElement("div", { className: "inv-stat-row", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, stats.bolsasSanas, "/", stats.numBolsas), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Sanas")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val", style: { color: stats.contPct > 20 ? "var(--coral-700)" : "inherit" } }, stats.contPct.toFixed(0), "%"), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Contam.")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, stats.be != null ? stats.be.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "BE")), /* @__PURE__ */ React.createElement("div", { className: "inv-stat" }, /* @__PURE__ */ React.createElement("div", { className: "inv-stat-val" }, stats.totalFresco.toFixed(3), " kg"), /* @__PURE__ */ React.createElement("div", { className: "inv-stat-lbl" }, "Cosechado"))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement(
      ColonizationScaleSelector,
      {
        value: (() => {
          if (!bolsas.length) return 0;
          const avgPct = bolsas.reduce((acc, cur) => acc + (cur.colonizationPct || (cur.col100 ? 100 : cur.col50 ? 50 : cur.col25 ? 25 : 0)), 0) / bolsas.length;
          return Math.round(avgPct / 10) * 10 || (bolsas.some((x) => x.col100) ? 100 : bolsas.some((x) => x.col50) ? 50 : bolsas.some((x) => x.col25) ? 25 : 10);
        })(),
        onChange: (pct) => {
          const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          bolsas.forEach((b) => {
            const up = {};
            if (pct >= 25 && !b.col25) up.col25 = today;
            if (pct >= 50 && !b.col50) up.col50 = today;
            if (pct >= 100 && !b.col100) up.col100 = today;
            up.colonizationPct = pct;
            updateBitBolsa(b.id, up);
          });
          if (pct >= 100 && lote.estado === "incubacion") {
            updateBitLote(lote.id, { estado: "fructificacion" });
          }
          setNoticeDlg({
            title: "Avance registrado",
            msg: `Se actualizó el avance de micelio al ${pct}% en las bolsas de ${lote.codigo}.`
          });
        },
        onQuickAction: (act) => {
          const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          if (act === "primordios") {
            updateBitLote(lote.id, { estado: "fructificacion" });
            bolsas.forEach((b) => {
              updateBitBolsa(b.id, { col100: b.col100 || today, colonizationPct: 100 });
            });
            setNoticeDlg({ title: "Primordios confirmados", msg: `Lote ${lote.codigo} actualizado a fructificación.` });
          } else if (act === "riego") {
            setNoticeDlg({ title: "Riego y Humedad OK", msg: `Verificación de humedad registrada para ${lote.codigo}.` });
          } else if (act === "ventilacion") {
            setNoticeDlg({ title: "Ventilación activada", msg: `Ciclo de recambio de aire verificado para ${lote.codigo}.` });
          }
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "inv-section" }, /* @__PURE__ */ React.createElement("table", { className: "inv-table bolsas-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Código"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Estado"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Col 25%"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Col 50%"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Col 100%"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Observaciones"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Foto"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Cosechas"), /* @__PURE__ */ React.createElement("th", { scope: "col", style: { textAlign: "center" } }, "Etiqueta"))), /* @__PURE__ */ React.createElement("tbody", null, bolsas.map((bolsa) => {
      const cosBolsa = bitCosechas.filter((c) => c.bolsaId === bolsa.id);
      const totalBolsa = cosBolsa.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0);
      const est = EB[bolsa.estado] || EB.sana;
      return /* @__PURE__ */ React.createElement("tr", { key: bolsa.id }, /* @__PURE__ */ React.createElement("td", { "data-label": "Código", style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" } }, bolsa.codigo), /* @__PURE__ */ React.createElement("td", { "data-label": "Estado" }, /* @__PURE__ */ React.createElement("select", { name: `bagStatus-${bolsa.id}`, "aria-label": `Estado de la bolsa ${bolsa.codigo}`, value: bolsa.estado, onChange: (e) => updateBitBolsa(bolsa.id, { estado: e.target.value }), style: { width: "100%", padding: "3px 4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", border: `1px solid ${est.c}`, borderRadius: 3, background: "var(--paper-50)", color: est.c, cursor: "pointer" } }, Object.entries(EB).map(([k, v]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, v.l)))), [["col25", "Col 25%"], ["col50", "Col 50%"], ["col100", "Col 100%"]].map(([f, lbl]) => /* @__PURE__ */ React.createElement("td", { key: f, "data-label": lbl }, /* @__PURE__ */ React.createElement("input", { name: `${f}-${bolsa.id}`, "aria-label": `${lbl} de la bolsa ${bolsa.codigo}`, type: "date", value: bolsa[f] || "", onChange: (e) => updateBitBolsa(bolsa.id, { [f]: e.target.value }), style: { width: "100%", padding: "2px 3px", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", border: "1px solid var(--paper-300)", borderRadius: 3, background: "var(--paper-50)" } }))), /* @__PURE__ */ React.createElement("td", { "data-label": "Observaciones" }, /* @__PURE__ */ React.createElement("input", { name: `bagObservations-${bolsa.id}`, "aria-label": `Observaciones de la bolsa ${bolsa.codigo}`, type: "text", value: bolsa.observaciones || "", placeholder: "…", onChange: (e) => updateBitBolsa(bolsa.id, { observaciones: e.target.value }), style: { width: "100%", padding: "2px 5px", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", border: "1px solid var(--paper-300)", borderRadius: 3, background: "var(--paper-50)" } })), /* @__PURE__ */ React.createElement("td", { "data-label": "Foto", style: { textAlign: "center" } }, bolsa.foto ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-photo-remove", onClick: () => updateBitBolsa(bolsa.id, { foto: null }), "aria-label": `Quitar foto de la bolsa ${bolsa.codigo}`, title: "Quitar foto" }, /* @__PURE__ */ React.createElement("img", { src: bolsa.foto, alt: "", "aria-hidden": "true", width: "28", height: "28" })) : /* @__PURE__ */ React.createElement("label", { className: "inv-photo-upload" }, "+foto", /* @__PURE__ */ React.createElement("input", { name: `bagPhoto-${bolsa.id}`, "aria-label": `Agregar foto a la bolsa ${bolsa.codigo}`, type: "file", accept: "image/*", onChange: (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        compressImageToDataURL(f).then((dataUrl) => updateBitBolsa(bolsa.id, { foto: dataUrl })).catch(() => setNoticeDlg({ title: "No se pudo procesar la foto", msg: "Intenta con otra imagen." }));
        e.target.value = "";
      } }))), /* @__PURE__ */ React.createElement("td", { "data-label": "Cosechas" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-base)" } }, totalBolsa > 0 ? (totalBolsa / 1e3).toFixed(3) + " kg" : "—"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-sec inv-btn-sm", "aria-label": `Registrar cosecha para la bolsa ${bolsa.codigo}`, onClick: () => {
        setBitCosechaForm({ bolsaId: bolsa.id, loteId: bitActiveLoteId, codigo: bolsa.codigo, flush: cosBolsa.length + 1, fecha: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], pesoFresco: "", calidad: 4, observaciones: "" });
        setShowBitCosecha(true);
      } }, "+"))), /* @__PURE__ */ React.createElement("td", { "data-label": "Etiqueta", style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "inv-btn inv-btn-sec inv-btn-sm",
          "aria-label": `Imprimir etiqueta térmica para la bolsa ${bolsa.codigo}`,
          title: `Imprimir etiqueta de la bolsa ${bolsa.codigo}`,
          onClick: () => openThermalForLote(bitActiveLoteId, { bagNum: bolsa.num })
        },
        "🖨"
      )));
    })))));
  })(), bitTab === "bit_cosechas" && bitActiveLoteId && (() => {
    const lote = bitLotes.find((lt) => lt.id === bitActiveLoteId);
    if (!lote) return null;
    const bolsas = bitBolsas.filter((b) => b.loteId === bitActiveLoteId);
    const cosechas = [...bitCosechas.filter((c) => c.loteId === bitActiveLoteId)].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const stats = calcLoteStats(bitActiveLoteId);
    return /* @__PURE__ */ React.createElement("div", { className: "panel" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "sec", style: { marginBottom: 0, borderBottom: "none" } }, "Cosechas — ", lote.codigo), /* @__PURE__ */ React.createElement("button", { className: "inv-btn inv-btn-pri", onClick: () => {
      const fb = bolsas.find((b) => b.estado === "sana");
      setBitCosechaForm({ bolsaId: fb?.id || "", loteId: bitActiveLoteId, codigo: fb?.codigo || "", flush: 1, fecha: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], pesoFresco: "", calidad: 4, observaciones: "" });
      setShowBitCosecha(true);
    } }, "+ Registrar cosecha")), stats && stats.totalFresco > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--border-soft)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", overflow: "hidden", marginBottom: 14 } }, [["Total fresco", stats.totalFresco.toFixed(3) + " kg"], ["BE estimada", stats.be != null ? stats.be.toFixed(1) + "%" : "—"], ["kg/bolsa sana", stats.bolsasSanas > 0 ? (stats.totalFresco / stats.bolsasSanas).toFixed(3) + " kg" : "—"], ["Costo/kg", stats.costoKg != null ? "$" + Math.round(stats.costoKg).toLocaleString("es-CO") : "—"]].map(([lb, v]) => /* @__PURE__ */ React.createElement("div", { key: lb, style: { background: "var(--paper-50)", padding: "10px 8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", marginBottom: 3 } }, lb), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 18, color: "var(--ink-900)" } }, v)))), cosechas.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "32px", color: "var(--ink-500)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", border: "1px dashed var(--border-soft)", borderRadius: "var(--r-sm)" } }, "Sin cosechas registradas aún."), cosechas.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "inv-section" }, /* @__PURE__ */ React.createElement("table", { className: "inv-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Bolsa"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Flush"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Fecha"), /* @__PURE__ */ React.createElement("th", { scope: "col", style: { textAlign: "right" } }, "Peso fresco (g)"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Calidad"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "Observaciones"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, /* @__PURE__ */ React.createElement("span", { className: "sr-only" }, "Acciones")))), /* @__PURE__ */ React.createElement("tbody", null, cosechas.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" } }, c.codigo), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-base)", textAlign: "center" } }, c.flush), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" } }, c.fecha), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontFamily: "var(--font-num)", fontSize: "var(--text-base)" } }, c.pesoFresco), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", fontSize: "var(--text-sm)" } }, "★".repeat(c.calidad || 0)), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-600)" } }, c.observaciones), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-sec inv-btn-sm", "aria-label": `Imprimir etiqueta de canastilla para ${c.codigo}, flush ${c.flush}`, title: "Imprimir etiqueta térmica de canastilla", onClick: () => openThermalForCosecha(bitActiveLoteId, c) }, "🖨"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-sec inv-btn-sm", "aria-label": `Eliminar cosecha de ${c.codigo}, flush ${c.flush}`, onClick: () => setConfirmDlg({ title: "Eliminar cosecha", msg: `¿Eliminar la cosecha de ${c.codigo}, flush ${c.flush}? Esta acción no se puede deshacer.`, danger: true, confirmLabel: "Eliminar", onConfirm: () => deleteBitCosecha(c.id) }) }, "✕"))))), /* @__PURE__ */ React.createElement("tr", { style: { borderTop: "2px solid var(--ink-900)" } }, /* @__PURE__ */ React.createElement("td", { colSpan: 3, style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", padding: "7px 12px" } }, "Total"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontFamily: "var(--font-num)", fontSize: "var(--text-base)", fontWeight: 700, padding: "7px 12px" } }, cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0).toFixed(0), " g"), /* @__PURE__ */ React.createElement("td", { colSpan: 3 }))))));
  })(), bitTab === "bit_comparador" && (() => {
    const lotesConDatos = bitLotes.filter((lt) => {
      const s = calcLoteStats(lt.id);
      return s && (s.totalFresco > 0 || s.numBolsas > 0);
    });
    return /* @__PURE__ */ React.createElement("div", { className: "panel" }, /* @__PURE__ */ React.createElement("div", { className: "sec" }, "Comparador de recetas"), lotesConDatos.length < 2 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "32px", color: "var(--ink-500)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", border: "1px dashed var(--border-soft)", borderRadius: "var(--r-sm)" } }, "Necesitas al menos 2 lotes para comparar. Actualmente: ", lotesConDatos.length, "."), lotesConDatos.length >= 2 && /* @__PURE__ */ React.createElement("div", { className: "inv-section" }, /* @__PURE__ */ React.createElement("table", { className: "inv-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Lote / Receta"), /* @__PURE__ */ React.createElement("th", null, "Especie"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Contam."), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Días col."), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "BE"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "kg/bolsa"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Costo/kg"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Score"), /* @__PURE__ */ React.createElement("th", null, "Veredicto"))), /* @__PURE__ */ React.createElement("tbody", null, lotesConDatos.map((lote) => {
      const stats = calcLoteStats(lote.id);
      const score = calcLoteScore(stats);
      const VC = { "prometedora": "var(--moss-500)", "descartar": "var(--coral-700)", "buena para escalar": "var(--moss-700)", "riesgo contaminación": "var(--ochre-500)", "repetir": "var(--ink-600)", "ajustar humedad": "var(--ochre-600)" };
      return /* @__PURE__ */ React.createElement("tr", { key: lote.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: "var(--ink-900)" } }, lote.codigo), lote.recipeRef && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, lote.recipeRef.name)), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-base)" } }, lote.especie), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: stats?.contPct > 20 ? "var(--coral-700)" : "var(--moss-700)", fontWeight: 700 } }, stats?.contPct != null ? stats.contPct.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, stats?.diasCol != null ? stats.diasCol.toFixed(1) + "d" : "—"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 700, color: stats?.be > 80 ? "var(--moss-700)" : stats?.be > 60 ? "var(--ochre-600)" : "var(--coral-700)" } }, stats?.be != null ? stats.be.toFixed(0) + "%" : "—"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, stats?.bolsasSanas > 0 && stats.totalFresco ? (stats.totalFresco / stats.bolsasSanas).toFixed(3) + " kg" : "—"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, stats?.costoKg != null ? "$" + Math.round(stats.costoKg).toLocaleString("es-CO") : "—"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", fontFamily: "var(--font-num)", fontSize: "var(--text-md)", color: "var(--coral-700)", fontWeight: 700 } }, score !== null ? score : "—"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("select", { value: lote.veredicto || "", onChange: (e) => updateBitLote(lote.id, { veredicto: e.target.value }), style: { padding: "4px 7px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", border: "1px solid var(--border-soft)", borderRadius: 4, background: "var(--paper-50)", color: VC[lote.veredicto] || "var(--ink-700)", width: "100%" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— sin veredicto —"), ["prometedora", "descartar", "repetir", "ajustar humedad", "riesgo contaminación", "buena para escalar"].map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v)))));
    })))));
  })(), bitTab === "bit_ficha" && bitActiveLoteId && (() => {
    const lote = bitLotes.find((lt) => lt.id === bitActiveLoteId);
    if (!lote) return null;
    const cosechas = [...bitCosechas.filter((c) => c.loteId === bitActiveLoteId)].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const stats = calcLoteStats(bitActiveLoteId);
    const score = stats ? calcLoteScore(stats) : null;
    return /* @__PURE__ */ React.createElement(BatchDetailV2, { lote });
    return /* @__PURE__ */ React.createElement("div", { className: "panel prod-sheet", style: { padding: "26px 28px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--ink-900)", paddingBottom: 12, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)" } }, "Setas de la Peña · Bitácora experimental"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 26, fontWeight: 700, color: "var(--ink-900)", lineHeight: 1.1, marginTop: 2 } }, "Ficha experimental"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--ink-900)", marginTop: 2 } }, lote.especie, lote.especieCientifico && /* @__PURE__ */ React.createElement(React.Fragment, null, " · ", /* @__PURE__ */ React.createElement("i", null, lote.especieCientifico)))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)" } }, /* @__PURE__ */ React.createElement("div", null, "Lote: ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, lote.codigo)), /* @__PURE__ */ React.createElement("div", null, "Inoculación: ", lote.fechaInoculacion), /* @__PURE__ */ React.createElement("div", null, lote.numBolsas, " bolsas × ", lote.pesoHumedo, " kg · ", lote.humedad, "% H₂O"), lote.veredicto && /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: "var(--moss-700)", marginTop: 4 } }, lote.veredicto))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-800)", marginBottom: 6 } }, "Datos del experimento"), [["Cepa/proveedor", lote.cepa || "—"], ["Operador", lote.operador || "—"], ["Humedad obj.", lote.humedad + "%"], ["Tratamiento", lote.tratamiento || "—"], ["Objetivo", lote.objetivo || "—"]].map(([lb, v]) => /* @__PURE__ */ React.createElement("div", { key: lb, style: { display: "flex", gap: 8, padding: "3px 0", borderBottom: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--ink-700)", width: 110, flexShrink: 0 } }, lb), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-900)" } }, v)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-800)", marginBottom: 6 } }, "Resultados"), [["Bolsas sanas", stats ? `${stats.bolsasSanas}/${stats.numBolsas}` : "—"], ["Contaminación", stats ? stats.contPct.toFixed(0) + "%" : "—"], ["BE estimada", stats?.be != null ? stats.be.toFixed(1) + "%" : "—"], ["Total cosechado", stats ? stats.totalFresco.toFixed(3) + " kg" : "—"], ["Score", score !== null ? score + "/100" : "—"]].map(([lb, v]) => /* @__PURE__ */ React.createElement("div", { key: lb, style: { display: "flex", gap: 8, padding: "3px 0", borderBottom: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--ink-700)", width: 110, flexShrink: 0 } }, lb), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-base)", color: "var(--ink-900)" } }, v))))), lote.recipeRef && /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--paper-300)", padding: "10px 14px", marginBottom: 14, background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-900)", marginBottom: 5 } }, "Receta vinculada — ", lote.recipeRef.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 5 } }, lote.recipeRef.recipe.map((r) => {
      const g = INGS.find((i) => i.id === r.id);
      return g ? /* @__PURE__ */ React.createElement("span", { key: r.id, style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "2px 6px", background: "var(--paper-200)", border: "1px solid var(--paper-300)", borderRadius: 3 } }, g.name, " ", parseFloat(r.p).toFixed(1), "%") : null;
    })), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "C:N ", lote.recipeRef.cn, " · EB ~", lote.recipeRef.eb, "% · Score ", lote.recipeRef.score, "/100", lote.recipeRef.cost ? ` · $${lote.recipeRef.cost.toLocaleString("es-CO")}/kg` : "")), cosechas.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-900)", marginBottom: 6 } }, "Registro de cosechas"), /* @__PURE__ */ React.createElement("table", { className: "prod-tbl", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Bolsa"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Flush"), /* @__PURE__ */ React.createElement("th", null, "Fecha"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Peso fresco (g)"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Calidad"), /* @__PURE__ */ React.createElement("th", null, "Obs."))), /* @__PURE__ */ React.createElement("tbody", null, cosechas.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" } }, c.codigo), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, c.flush), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" } }, c.fecha), /* @__PURE__ */ React.createElement("td", { className: "num" }, c.pesoFresco), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, "★".repeat(c.calidad || 0)), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-600)" } }, c.observaciones))), /* @__PURE__ */ React.createElement("tr", { className: "tot" }, /* @__PURE__ */ React.createElement("td", { colSpan: 3 }, "Total"), /* @__PURE__ */ React.createElement("td", { className: "num" }, cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0).toFixed(0), " g"), /* @__PURE__ */ React.createElement("td", { colSpan: 2 }))))), lote.notas && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-700)", padding: "8px 12px", background: "var(--paper-100)", border: "1px solid var(--paper-300)", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("b", null, "Notas:"), " ", lote.notas), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, paddingTop: 12, borderTop: "2px solid var(--ink-900)", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, "Setas de la Peña · Tenjo 2.600 msnm · ", (/* @__PURE__ */ new Date()).toLocaleDateString("es-CO")), /* @__PURE__ */ React.createElement("button", { className: "no-print", onClick: () => window.print(), style: { padding: "7px 14px", background: "var(--moss-700)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", cursor: "pointer" } }, "Imprimir ficha")));
  })());
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "topbar" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "topbar-mark", onClick: () => goTab("catalogo"), style: { cursor: "pointer" } }, "Setas de la Peña")), /* @__PURE__ */ React.createElement("nav", { className: "fos-rail" }, /* @__PURE__ */ React.createElement("span", { className: "fos-rail-mark", style: { position: "relative", width: 91, height: 106, display: "block" } }, /* @__PURE__ */ React.createElement("span", { style: { textAlign: "center", fontStyle: "normal", fontSize: 17, display: "block" } }, "Setas"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-md)", lineHeight: 0.95, position: "absolute", left: 30, top: 49, fontStyle: "italic", letterSpacing: "-0.1px" } }, "de la"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, lineHeight: 1, position: "absolute", left: 27, top: 65 } }, "Peña")), NAV_GROUPS.map((g) => {
    const on = g.tabs.includes(tab);
    return /* @__PURE__ */ React.createElement("button", { key: g.key, className: "fos-rail-btn" + (on ? " on" : ""), onClick: () => goTab(g.tabs[0]) }, g.icon, /* @__PURE__ */ React.createElement("span", null, g.label));
  })), /* @__PURE__ */ React.createElement("header", { className: "hero", style: { display: tab === "inicio" || tab === "home" ? "none" : void 0 } }, /* @__PURE__ */ React.createElement("div", { className: "hero-inner" }, /* @__PURE__ */ React.createElement("div", { className: "hero-copy" }, /* @__PURE__ */ React.createElement("div", { className: "hero-eyebrow" }, "Setas de la Peña — Simulador de recetas"), /* @__PURE__ */ React.createElement("div", { className: "hero-title" }, "Diseño de", /* @__PURE__ */ React.createElement("br", null), "Sustratos"), /* @__PURE__ */ React.createElement("div", { className: "hero-lede", style: { display: "block", marginTop: 14, fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "Cálculo, optimización y trazabilidad de mezclas.")), /* @__PURE__ */ React.createElement("div", { className: "hero-art" }, /* @__PURE__ */ React.createElement("img", { src: window.__resources && window.__resources.img_banner || "_standalone_imgs/banner.png", alt: "", "aria-hidden": "true", width: "720", height: "480" })))), /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement("div", { className: "print-header" }, /* @__PURE__ */ React.createElement("h1", null, "Setas de la Peña"), /* @__PURE__ */ React.createElement("p", null, "Biogranja fungícola · Tenjo, Cundinamarca · 2.600 msnm")), /* @__PURE__ */ React.createElement("div", { className: "page-title-bar", style: { display: tab === "catalogo" || tab === "inicio" || tab === "home" ? "none" : void 0 } }, /* @__PURE__ */ React.createElement("span", { className: "page-title-eyebrow" }, RECETA_TABS.includes(tab) ? "Receta" : "Cultivo"), /* @__PURE__ */ React.createElement("h1", { className: "page-title-h" }, TAB_PAGE_TITLES[tab]), /* @__PURE__ */ React.createElement("div", { className: "page-title-rule" })), tab !== "inicio" && (() => {
    const activeGroup = NAV_GROUPS.find((g) => g.tabs.includes(tab));
    if (!activeGroup || activeGroup.key === "recetas" || activeGroup.tabs.length < 2) return null;
    return /* @__PURE__ */ React.createElement("div", { className: "fos-chips" }, activeGroup.tabs.map((t) => /* @__PURE__ */ React.createElement("button", { key: t, className: t === tab ? "on" : "", onClick: () => goTab(t) }, TAB_LABELS[t])));
  })(), (tab === "home" || tab === "inicio") && (() => {
    const totalStockKg = invLotes.filter((l) => l.activo).reduce((s, l) => s + (Number(l.cantidadKgDisponible) || 0), 0);
    const lowStockThresholds = { base: 20, suplemento: 5, corrector: 2 };
    const aggregatedStock = {};
    invLotes.filter((l) => l.activo).forEach((l) => {
      aggregatedStock[l.ingredienteId] = (aggregatedStock[l.ingredienteId] || 0) + (Number(l.cantidadKgDisponible) || 0);
    });
    const criticalStockItems = INGS.map((ing) => {
      const stockKg = aggregatedStock[ing.id] || 0;
      const threshold = lowStockThresholds[ing.type] || 5;
      return { ing, stockKg, threshold, isLow: stockKg < threshold };
    }).filter((item) => item.isLow);
    const lowStockCount2 = criticalStockItems.length;
    const totalBolsasCount = bitBolsas.length;
    const bolsasIncubacion = bitBolsas.filter((b) => b.estado === "sana" && !b.col100).length;
    const bolsasFructificacion = bitBolsas.filter((b) => b.estado === "sana" && b.col100).length;
    const bolsasContaminadas = bitBolsas.filter((b) => b.estado === "contaminada").length;
    const totalCosechasKg = bitCosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0) / 1e3;
    const totalCosechasCount = bitCosechas.length;
    const activeRecipeCount = recipe.length;
    const activeScore = opt?.score ?? (an ? scoreAn(an, { treatment: tr, recipe, stockIds }).score : null);
    const activeLotes = bitLotes.filter((l) => !["completado", "descartado"].includes(l.estado));
    const operationalNow = Date.now();
    const operationalSource = activeLotes.map((lote, index) => {
      const stats = calcLoteStats(lote.id);
      const contaminated = stats && stats.contPct > 0;
      const inoculated = Date.parse(lote.fechaInoculacion || "");
      const age = Number.isFinite(inoculated) ? Math.max(0, Math.floor((operationalNow - inoculated) / 864e5)) : 0;
      return {
        id: lote.id,
        lote,
        severity: stats && stats.contPct >= 20 ? "critical" : void 0,
        blocked: contaminated && stats.contPct < 20,
        dueAt: !contaminated && age >= 14 ? new Date(operationalNow - (index + 1) * 36e5).toISOString() : new Date(operationalNow + (index + 1) * 36e5).toISOString()
      };
    });
    const operationalQueue = workflow ? workflow.buildTodayQueue(operationalSource, operationalNow) : operationalSource;
    const criticalTaskCount = operationalQueue.filter((item) => item.bucket === "critical").length;
    const overdueTaskCount = operationalQueue.filter((item) => item.bucket === "overdue").length;
    const blockedTaskCount = operationalQueue.filter((item) => item.bucket === "blocked").length;
    const pendingTaskCount = operationalQueue.filter((item) => !["later", "context"].includes(item.bucket)).length;
    const incidentCount = criticalTaskCount + blockedTaskCount + lowStockCount2;
    const operationStatus = criticalTaskCount > 0 ? { label: `${criticalTaskCount} crítica${criticalTaskCount === 1 ? "" : "s"}`, color: "var(--coral-700)" } : overdueTaskCount > 0 || incidentCount > 0 ? { label: `${overdueTaskCount + incidentCount} pendiente${overdueTaskCount + incidentCount === 1 ? "" : "s"}`, color: "var(--ochre-700)" } : { label: "Operación estable", color: "var(--moss-700)" };
    let camaras = [];
    try {
      camaras = JSON.parse(props.hoyCamarasJson || "[]");
    } catch (e) {
      camaras = [];
    }
    let tasksHoy = [], recentActivity = [];
    try {
      tasksHoy = JSON.parse(props.tasksHoyJson || "[]");
    } catch (e) {
      tasksHoy = [];
    }
    try {
      recentActivity = JSON.parse(props.recentActivityJson || "[]");
    } catch (e) {
      recentActivity = [];
    }
    const prioColor = (p) => p === "alta" ? "var(--coral-700)" : p === "media" ? "var(--ochre-500)" : "var(--ink-400)";
    return /* @__PURE__ */ React.createElement("div", { className: "home-cockpit", style: { display: "flex", flexDirection: "column", gap: 24, marginBottom: 48 } }, /* @__PURE__ */ React.createElement("div", { style: {
      background: "var(--paper-0)",
      border: "1px solid var(--border-soft)",
      borderRadius: "var(--r-md)",
      padding: "18px 22px",
      position: "relative",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 240 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: operationStatus.color, display: "inline-block" } }), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: operationStatus.color } }, "CONTROL · TURNO ACTUAL")), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--text-2xl)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--ink-900)", margin: 0 } }, "Tablero de Control")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" } }, [
      { value: activeLotes.length, label: "Lotes activos", icon: IconMicroscope, tone: "neutral" },
      { value: pendingTaskCount, label: "Tareas pendientes", icon: IconClipboard, tone: pendingTaskCount > 0 ? "attention" : "neutral" },
      { value: incidentCount, label: "Incidencias", icon: IconAlert, tone: incidentCount > 0 ? "critical" : "neutral" }
    ].map((kpi) => {
      const tones = {
        neutral: { bg: "var(--paper-100)", border: "var(--paper-300)", ink: "var(--ink-700)", weight: 700 },
        attention: { bg: "color-mix(in oklab,var(--ochre-500) 12%,var(--paper-0))", border: "var(--ochre-500)", ink: "var(--ochre-700)", weight: 800 },
        critical: { bg: "color-mix(in oklab,var(--coral-500) 14%,var(--paper-0))", border: "var(--coral-700)", ink: "var(--coral-700)", weight: 800 }
      };
      const t = tones[kpi.tone];
      return /* @__PURE__ */ React.createElement("span", { key: kpi.label, style: { display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", padding: "6px 10px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "var(--r-xs)", color: t.ink, fontWeight: t.weight } }, /* @__PURE__ */ React.createElement(kpi.icon, { size: 12 }), /* @__PURE__ */ React.createElement("strong", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: t.ink } }, kpi.value), " ", kpi.label);
    }), /* @__PURE__ */ React.createElement("span", { role: "status", "aria-label": `Estado operativo: ${operationStatus.label}`, style: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "var(--text-xs)", padding: "6px 10px", background: "var(--paper-50)", border: `1px solid ${operationStatus.color}`, borderRadius: "var(--r-xs)", color: operationStatus.color } }, operationStatus.label))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", flexShrink: 0 } }, "Registro de cultivo · vista previa"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, flex: 1 } }, [
      { label: "Eventos", value: props.hoyPreviewEventos, onClick: props.onGoRevEventos },
      { label: "Rendimiento (EB)", value: `${props.hoyPreviewBe}%`, onClick: props.onGoRevRendimiento },
      { label: "Trabajo", value: `${props.hoyPreviewHoras} h`, onClick: props.onGoRevTrabajo },
      { label: "Supervisión", value: props.hoyPreviewAnomalias, onClick: props.onGoRevSuper, color: props.hoyPreviewAnomaliasColor },
      { label: "Salidas", value: `${props.hoyPreviewSalidas} kg`, onClick: props.onGoRevSalidas }
    ].map((m) => /* @__PURE__ */ React.createElement("button", { key: m.label, onClick: () => m.onClick && m.onClick(), className: "home-registro-chip", style: { cursor: "pointer", display: "inline-flex", alignItems: "baseline", gap: 5, background: "var(--paper-100)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", padding: "5px 10px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, m.label), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "var(--text-sm)", color: m.color || "var(--ink-900)" } }, m.value)))), /* @__PURE__ */ React.createElement("button", { onClick: () => props.onGoRegistro && props.onGoRegistro(), style: { cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--coral-600)", flexShrink: 0, whiteSpace: "nowrap" } }, "Ver registro completo →")), (props.hasHandoff === true || props.hasHandoff === "true") && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--slate-500)", borderRadius: "var(--r-sm)", padding: "10px 14px", background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", color: "var(--slate-700)" } }, "Traspaso del turno anterior"), /* @__PURE__ */ React.createElement("button", { onClick: () => props.onClearHandoff && props.onClearHandoff(), className: "home-handoff-dismiss", style: { cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-500)" } }, "Leído")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-700)", marginTop: 4, lineHeight: 1.4 } }, props.handoffText)))), (() => {
      return /* @__PURE__ */ React.createElement("div", { className: "home-acciones-espacios-row" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "SECCIÓN A · OPERACIÓN INMEDIATA"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: "-0.01em", color: "var(--ink-900)", marginTop: 2, marginBottom: 0 } }, "Acciones Rápidas")), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, "Acceso a 1 clic")), /* @__PURE__ */ React.createElement("div", { style: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 12
      } }, [
        { label: props.sessionLabel || "Iniciar jornada", sub: props.sessionSub || "Registro de campo", icon: IconFlame, onClick: () => {
          const hasActiveSession = props.hasActiveSession === true || props.hasActiveSession === "true";
          if (hasActiveSession) props.onContinueSession && props.onContinueSession();
          else props.onStartSession && props.onStartSession();
        }, jornada: true },
        { label: "Escanear lote", sub: "Registro de campo por QR", icon: IconTarget, tab: "registro", onClick: () => props.onScanLot && props.onScanLot(), pri: true },
        { label: "Entrada a Bodega", sub: "Compras & stock FIFO", icon: IconBox, tab: "inventario", onClick: () => {
          goTab("inventario");
          setInvTab("compra");
        } },
        { label: "Formular Sustrato", sub: "Balance C:N & Perito", icon: IconBolt, tab: "formular", onClick: () => goTab("formular") },
        { label: "Registrar Evento", sub: "Observación, traslado o corrección", icon: IconEdit, onClick: () => props.onGoSesion && props.onGoSesion() }
      ].map((btn) => {
        const accent = btn.jornada ? "var(--coral-600)" : btn.pri ? "var(--moss-700)" : null;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: btn.label,
            onClick: btn.onClick,
            className: "home-quick-action" + (btn.pri ? " is-primary" : "") + (btn.jornada ? " is-jornada" : ""),
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: "var(--r-sm)",
              textAlign: "left",
              cursor: "pointer",
              position: "relative"
            }
          },
          /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", flexShrink: 0, color: accent || "var(--ink-700)" } }, /* @__PURE__ */ React.createElement(btn.icon, { size: 20 })),
          /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", color: accent || "var(--ink-900)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, btn.label), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginTop: 2, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, btn.sub)),
          /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: accent || "var(--ink-400)", fontWeight: 700 } }, "→")
        );
      }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "MÓDULOS DE CAMPO"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: "-0.01em", color: "var(--ink-900)", marginTop: 2, marginBottom: 0 } }, "Espacios de Trabajo")), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "Flujos principales")), /* @__PURE__ */ React.createElement("div", { className: "home-workspaces-grid", style: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 20
      } }, /* @__PURE__ */ React.createElement("div", { className: "home-workspace-card", style: {
        background: "var(--paper-0)",
        border: "1px solid var(--border-soft)",
        borderTop: "3px solid var(--coral-500)",
        borderRadius: "var(--r-md)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 18,
        boxShadow: "var(--shadow-card-rest)"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--coral-500)" } }, /* @__PURE__ */ React.createElement(IconMicroscope, { size: 11 }), " LABORATORIO & NUTRICIÓN"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, saved.length, " guardadas")), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-md)", color: "var(--ink-900)", marginBottom: 8 } }, "Formulación & Recetario"), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-600)", lineHeight: 1.45, marginBottom: 16 } }, "Balance estequiométrico de carbono y nitrógeno (C:N), suplementación y cálculo predictivo de Eficiencia Biológica (EB)."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, background: "var(--paper-50)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", padding: "12px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Score Perito"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: activeScore >= 80 ? "var(--moss-700)" : activeScore >= 60 ? "var(--ochre-500)" : "var(--coral-700)" } }, activeScore !== null ? `${activeScore}/100` : "—")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "C:N Activo"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" } }, an?.cn ? `${an.cn.toFixed(1)}:1` : "—")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "EB Estimada"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: !an?.eb ? "var(--ink-900)" : sp?.eb_optimal && an.eb >= sp.eb_optimal ? "var(--moss-700)" : sp?.eb_baseline && an.eb >= sp.eb_baseline ? "var(--ochre-500)" : "var(--coral-700)" } }, an?.eb ? `~${an.eb}%` : "—")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Ingredientes"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--ink-900)" } }, recipe.length, " insumos")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => goTab("formular"), className: "home-panel-btn is-primary", style: { flex: 1, padding: "8px 12px", background: "var(--moss-700)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", cursor: "pointer" } }, "Ir al Formulador"), /* @__PURE__ */ React.createElement("button", { onClick: () => goTab("catalogo"), className: "home-panel-btn is-secondary", style: { padding: "8px 12px", background: "transparent", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", cursor: "pointer" } }, "Catálogo"))), /* @__PURE__ */ React.createElement("div", { className: "home-workspace-card", style: {
        background: "var(--paper-0)",
        border: "1px solid var(--border-soft)",
        borderTop: "3px solid var(--moss-700)",
        borderRadius: "var(--r-md)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 18,
        boxShadow: "var(--shadow-card-rest)"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--moss-700)" } }, /* @__PURE__ */ React.createElement(IconBox, { size: 11 }), " PLANTA & INSUMOS"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, stockIds.size, " variedades")), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-md)", color: "var(--ink-900)", marginBottom: 8 } }, "Producción & Bodega"), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-600)", lineHeight: 1.45, marginBottom: 16 } }, "Ficha de mezclado con tolerancia de báscula de campo, gestión FIFO de inventario y trazabilidad de proveedores."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, background: "var(--paper-50)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", padding: "12px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Stock Disponible"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" } }, totalStockKg.toFixed(1), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "kg"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Lotes de Insumos"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" } }, invLotes.filter((l) => l.activo).length)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Proveedores"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--ink-900)" } }, invProveedores.length, " activos")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Compras Reg."), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--ink-900)" } }, invCompras.length, " facturas"))), criticalStockItems.length > 0 ? /* @__PURE__ */ React.createElement("div", { style: { background: "color-mix(in oklab, var(--coral-500) 8%, var(--paper-0))", border: "1px solid var(--coral-500)", borderLeft: "4px solid var(--coral-700)", borderRadius: "var(--r-xs)", padding: "10px 12px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--coral-700)" } }, "⚠ Alerta de Stock Crítico (", criticalStockItems.length, ")"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
        setInvTab("compra");
        goTab("inventario");
      }, style: { background: "none", border: "none", color: "var(--coral-700)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textDecoration: "underline", cursor: "pointer", padding: 0 } }, "Registrar Compra +")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, criticalStockItems.slice(0, 3).map(({ ing, stockKg, threshold }) => /* @__PURE__ */ React.createElement("span", { key: ing.id, style: { fontFamily: "var(--font-mono)", fontSize: 9.5, padding: "2px 5px", background: "var(--paper-0)", border: "1px solid var(--coral-300)", borderRadius: 2, color: "var(--coral-700)" } }, ing.name, ": ", stockKg.toFixed(1), " kg (< ", threshold, " kg)")), criticalStockItems.length > 3 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-400)", padding: "2px 4px" } }, "+", criticalStockItems.length - 3, " más"))) : /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-50)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", padding: "6px 10px", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--moss-700)", fontSize: 12 } }, "✓"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-600)" } }, "Todos los insumos con stock operativo adecuado"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => goTab("produccion"), className: "home-panel-btn is-primary", style: { flex: 1, padding: "8px 12px", background: "var(--moss-700)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", cursor: "pointer" } }, "Ficha de Mezclado"), /* @__PURE__ */ React.createElement("button", { onClick: () => goTab("inventario"), className: "home-panel-btn is-secondary", style: { padding: "8px 12px", background: "transparent", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", cursor: "pointer" } }, "Bodega"))), /* @__PURE__ */ React.createElement("div", { className: "home-workspace-card", style: {
        background: "var(--paper-0)",
        border: "1px solid var(--border-soft)",
        borderTop: "3px solid var(--slate-500)",
        borderRadius: "var(--r-md)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 18,
        boxShadow: "var(--shadow-card-rest)"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--slate-500)" } }, /* @__PURE__ */ React.createElement(IconMushroom, { size: 11 }), " TRAZABILIDAD & CAMPO"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, bitLotes.length, " lotes")), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-md)", color: "var(--ink-900)", marginBottom: 8 } }, "Bitácora & Cosechas"), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-600)", lineHeight: 1.45, marginBottom: 16 } }, "Seguimiento individual de bolsas, registro de colonización, alertas fitosanitarias y pesaje de cosechas."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, background: "var(--paper-50)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", padding: "12px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Bolsas Monitoreadas"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" } }, totalBolsasCount)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Total Cosechado"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" } }, totalCosechasKg.toFixed(2), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-xs)" } }, "kg"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Contaminación"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: bolsasContaminadas === 0 ? "var(--moss-700)" : "var(--coral-700)" } }, totalBolsasCount > 0 ? `${(bolsasContaminadas / totalBolsasCount * 100).toFixed(0)}%` : "0%")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Eventos Corte"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--ink-900)" } }, totalCosechasCount, " flushes")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowBitCosecha(true), className: "home-panel-btn is-primary", style: { flex: 1, padding: "8px 12px", background: "var(--sand-500)", color: "var(--ink-900)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", cursor: "pointer" } }, "+ Registrar Cosecha"), /* @__PURE__ */ React.createElement("button", { onClick: () => goTab("bitacora"), className: "home-panel-btn is-secondary", style: { padding: "8px 12px", background: "transparent", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", cursor: "pointer" } }, "Ver Bitácora"))), props.isAdmin !== false && /* @__PURE__ */ React.createElement("div", { className: "home-workspace-card", style: {
        background: "var(--paper-0)",
        border: "1px solid var(--border-soft)",
        borderTop: "3px solid var(--ink-700)",
        borderRadius: "var(--r-md)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 18,
        boxShadow: "var(--shadow-card-rest)"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)" } }, /* @__PURE__ */ React.createElement(IconScale, { size: 11 }), " GESTIÓN & FINANZAS (ADMIN)"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--moss-700)" } }, "Activo")), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-md)", color: "var(--ink-900)", marginBottom: 8 } }, "Finanzas & Rendimiento"), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-600)", lineHeight: 1.45, marginBottom: 16 } }, "Análisis de costo unitario por kilo seco y por bolsa comercial, balance de proveedores y simulación de márgenes."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, background: "var(--paper-50)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", padding: "12px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Costo/kg Sustrato"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" } }, "$", an?.cost ? Math.round(an.cost).toLocaleString("es-CO") : "0", " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "COP"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Bolsa Estándar"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" } }, "$", an?.cost ? Math.round(an.cost * 1.5 * 0.35).toLocaleString("es-CO") : "0", " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "COP"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Recetas Evaluadas"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--ink-900)" } }, saved.length, " fórmulas")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Ciclo Planificado"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--ink-900)" } }, sch?.totDays || 45, " días")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => goTab("dashboard"), className: "home-panel-btn is-primary", style: { flex: 1, padding: "8px 12px", background: "var(--ink-900)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", cursor: "pointer" } }, "Dashboard"), /* @__PURE__ */ React.createElement("button", { onClick: () => goTab("schedule"), className: "home-panel-btn is-secondary", style: { padding: "8px 12px", background: "transparent", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", cursor: "pointer" } }, "Cronograma"))))));
    })(), /* @__PURE__ */ React.createElement("div", { className: "home-tareas-lotes-row" }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-0)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-md)", padding: "18px 20px", height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "Tareas de hoy"), tasksHoy.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)" } }, props.tasksOpenCount)), tasksHoy.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "20px", color: "var(--ink-500)", fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", border: "1px dashed var(--paper-300)", borderRadius: "var(--r-sm)" } }, "Sin tareas pendientes por ahora.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, tasksHoy.slice(0, 5).map((t) => /* @__PURE__ */ React.createElement("div", { key: t.key, style: { display: "flex", alignItems: "center", gap: 2, padding: "4px 12px 4px 4px", border: "1px solid var(--paper-300)", borderRadius: "var(--r-sm)", opacity: t.done ? 0.5 : 1 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => props.onTaskToggle && props.onTaskToggle(t.key),
        "aria-pressed": t.done,
        "aria-label": "Marcar tarea",
        style: { cursor: "pointer", flexShrink: 0, width: 36, height: 36, display: "grid", placeItems: "center", padding: 0, background: "none", border: "none" }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${t.done ? "var(--moss-600)" : "var(--paper-300)"}`, background: t.done ? "var(--moss-600)" : "transparent", display: "grid", placeItems: "center", color: "var(--paper-0)", fontSize: 11 } }, t.done ? "✓" : "")
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => props.onTaskGo && props.onTaskGo(t.key), style: { cursor: "pointer", flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--ink-900)", textDecoration: t.done ? "line-through" : "none" } }, t.title), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)" } }, t.id), " · ", t.why)), /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "var(--tracking-button)", color: prioColor(t.prio), border: `1px solid ${prioColor(t.prio)}`, padding: "2px 7px", borderRadius: 3 } }, t.prio))), tasksHoy.length > 5 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)", paddingTop: 2 } }, "+", tasksHoy.length - 5, " tarea", tasksHoy.length - 5 === 1 ? "" : "s", " más — ver contador arriba")))), /* @__PURE__ */ React.createElement("div", { style: {
      background: "var(--paper-0)",
      border: "1px solid var(--border-soft)",
      borderRadius: "var(--r-md)",
      padding: "28px",
      boxShadow: "var(--shadow-card-rest)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "SECCIÓN B · CICLO BIOLÓGICO TENJO"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: "-0.01em", color: "var(--ink-900)", marginTop: 2, marginBottom: 0 } }, "Seguimiento de Lotes por Fase")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)" } }, "Ciclo total promedio: ~42–48 días")), bitLotes.length > 0 ? (() => {
      const columnas = [
        { key: "incubacion", title: "Incubación", sub: "Días 1–18 · Oscuridad 22–24°C", accent: "var(--slate-500)", icon: IconSprout, linkTab: "bitacora" },
        { key: "primordios", title: "Primordios", sub: "Colonización 100% · Espera de shock térmico", accent: "var(--sand-500)", icon: IconSnowflake, linkTab: "schedule" },
        { key: "fruta", title: "Fructificación & Cosecha", sub: "Días 24–45 · Cosecha en botón/sombrero", accent: "var(--moss-700)", icon: IconMushroom, linkTab: "bitacora" },
        { key: "post", title: "Post-Cosecha", sub: "2°/3° flush · Trazabilidad de EB", accent: "var(--ink-700)", icon: IconScale, linkTab: "dashboard" }
      ];
      const clasificados = bitLotes.filter((l) => l.estado !== "descartado").map((lote) => {
        const stats = calcLoteStats(lote.id);
        const bolsasLote = bitBolsas.filter((b) => b.loteId === lote.id);
        const sanas = bolsasLote.filter((b) => b.estado === "sana");
        const colonizado = sanas.length > 0 && sanas.every((b) => !!b.col100);
        const columna = lote.estado === "completado" ? "post" : lote.estado === "fructificacion" ? "fruta" : colonizado ? "primordios" : "incubacion";
        const inoculated = Date.parse(lote.fechaInoculacion || "");
        const age = Number.isFinite(inoculated) ? Math.max(0, Math.floor((operationalNow - inoculated) / 864e5)) : null;
        return { lote, stats, columna, age };
      });
      const descartados = bitLotes.length - clasificados.length;
      return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 } }, columnas.map((col) => {
        const items = clasificados.filter((c) => c.columna === col.key);
        return /* @__PURE__ */ React.createElement("div", { key: col.key, style: { background: "var(--paper-50)", border: "1px solid var(--paper-300)", borderTop: `3px solid ${col.accent}`, borderRadius: "var(--r-sm)", padding: "14px", display: "flex", flexDirection: "column", gap: 10, minHeight: 120 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => goTab(col.linkTab), style: { background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, color: col.accent } }, /* @__PURE__ */ React.createElement(col.icon, { size: 13 }), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", color: "var(--ink-900)" } }, col.title)), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ink-600)" } }, items.length)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", lineHeight: 1.3 } }, col.sub)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, items.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-400)", fontStyle: "italic" } }, "Sin lotes"), items.map(({ lote: lt, stats, age }) => {
          const critical = stats && stats.contPct >= 20;
          const contaminated = stats && stats.contPct > 0;
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: lt.id,
              "data-lote-id": lt.id,
              "aria-label": `Abrir lote ${lt.codigo} · ${lt.especie || "sin especie"}`,
              onClick: () => {
                setBitActiveLoteId(lt.id);
                goTab("bitacora");
                goBitTab("bit_bolsas", true);
              },
              className: "home-lote-card",
              style: {
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "9px 10px",
                background: "var(--paper-0)",
                border: `1px solid ${critical ? "var(--coral-500)" : "var(--paper-300)"}`,
                borderRadius: "var(--r-xs)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                width: "100%"
              }
            },
            /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--ink-900)" } }, lt.codigo), age != null && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)" } }, "día ", age)),
            /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-600)" } }, lt.especie, " · ", lt.numBolsas || 1, " bolsas"),
            (contaminated || stats?.totalFresco > 0) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } }, contaminated && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", fontWeight: 700, padding: "1px 5px", borderRadius: 2, color: critical ? "var(--coral-700)" : "var(--ochre-700)", background: critical ? "color-mix(in oklab,var(--coral-500) 14%,var(--paper-0))" : "color-mix(in oklab,var(--ochre-500) 12%,var(--paper-0))" } }, stats.contPct.toFixed(0), "% contam."), stats?.totalFresco > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--moss-700)", fontWeight: 700 } }, stats.totalFresco.toFixed(2), " kg"))
          );
        })));
      })), descartados > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-400)" } }, descartados, " lote", descartados === 1 ? "" : "s", " descartado", descartados === 1 ? "" : "s", " (oculto", descartados === 1 ? "" : "s", " del tablero)"));
    })() : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "No hay lotes registrados aún. Puedes iniciar un nuevo lote desde la Ficha de Producción o la Bitácora."), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowBitNuevo(true), style: { padding: "5px 12px", background: "var(--moss-700)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-xs)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", cursor: "pointer" } }, "+ Iniciar Primer Lote")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "SECCIÓN C · AMBIENTES & SENSORES"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: "-0.01em", color: "var(--ink-900)", marginTop: 2, marginBottom: 0 } }, "Cámaras de Cultivo")), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--moss-700)" } }, "● ", camaras.length, " ", camaras.length === 1 ? "cámara monitoreada" : "cámaras monitoreadas")), camaras.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { border: "1px dashed var(--paper-300)", borderRadius: "var(--r-md)", padding: "20px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, "Sin datos de cámaras disponibles.") : /* @__PURE__ */ React.createElement("div", { className: "home-salas-grid" }, camaras.map((c) => {
      const hasSpark = c.tempSpark && c.humSpark && c.co2Spark;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: c.id,
          style: {
            background: "var(--paper-0)",
            border: "1px solid var(--border-soft)",
            borderTop: `3px solid ${c.estadoAccent || "var(--ink-500)"}`,
            borderRadius: "var(--r-md)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
            boxShadow: "var(--shadow-card-rest)"
          }
        },
        /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", flexShrink: 0, color: c.estadoAccent || "var(--ink-500)" } }, /* @__PURE__ */ React.createElement(IconCamera, { size: 14 })), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-base)", color: "var(--ink-900)" } }, c.name)), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, padding: "2px 8px", borderRadius: "var(--r-xs)", background: "var(--status-active-bg)", color: "var(--moss-700)", textTransform: "uppercase", letterSpacing: "var(--tracking-button)" } }, c.estadoLabel)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginBottom: 14 } }, "Zona ", c.zona, " · ", c.sppName), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, background: "var(--paper-50)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", padding: "10px 8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Temp"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", fontWeight: 700, color: "var(--ink-900)", marginTop: 2 } }, c.liveTemp, "°C")), /* @__PURE__ */ React.createElement("div", { style: { borderLeft: "1px solid var(--paper-300)", borderRight: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "Humedad"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", fontWeight: 700, color: "var(--ink-900)", marginTop: 2 } }, c.liveHum, "%")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase" } }, "CO₂"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", fontWeight: 700, color: "var(--ink-900)", marginTop: 2 } }, c.liveCo2, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-micro)" } }, "ppm")))), c.hasLiveAlert && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--coral-700)", marginTop: 8 } }, c.liveAlertNote)),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--paper-300)", paddingTop: 12, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)" } }, /* @__PURE__ */ React.createElement("span", null, "Ocupación / Carga:"), /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)", fontFamily: "var(--font-body)", fontWeight: 700 } }, c.occupancy, "% ", /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400, color: "var(--ink-500)" } }, "· ", c.capKg, " kg cap."))),
        hasSpark && /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--paper-300)", paddingTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "var(--tracking-button)" } }, "Tendencia"), /* @__PURE__ */ React.createElement("button", { onClick: () => props.onOpenCamara && props.onOpenCamara(c.id), style: { display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--coral-600)", fontWeight: 700 } }, /* @__PURE__ */ React.createElement(IconCamera, { size: 11 }), " Ver detalle →")), /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 280 40", preserveAspectRatio: "none", role: "img", "aria-label": `Tendencia últimas horas en ${c.name}: temperatura, humedad y CO₂`, style: { width: "100%", height: 36, overflow: "visible", display: "block" } }, /* @__PURE__ */ React.createElement("polyline", { points: c.tempSpark, fill: "none", stroke: "var(--coral-500)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("polyline", { points: c.humSpark, fill: "none", stroke: "var(--slate-500)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("polyline", { points: c.co2Spark, fill: "none", stroke: "var(--moss-500)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("circle", { cx: 280, cy: c.tempSparkEndY, r: "3", fill: "var(--coral-500)" }), /* @__PURE__ */ React.createElement("circle", { cx: 280, cy: c.humSparkEndY, r: "3", fill: "var(--slate-500)" }), /* @__PURE__ */ React.createElement("circle", { cx: 280, cy: c.co2SparkEndY, r: "3", fill: "var(--moss-500)" })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-500)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 9, height: 2, background: "var(--coral-500)", display: "inline-block" } }), "Temp."), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-500)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 9, height: 2, background: "var(--slate-500)", display: "inline-block" } }), "Humedad"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", color: "var(--ink-500)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 9, height: 2, background: "var(--moss-500)", display: "inline-block" } }), "CO₂")))
      );
    }))), recentActivity.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "SECCIÓN D · SEGUIMIENTO DEL DÍA"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: "-0.01em", color: "var(--ink-900)", marginTop: 2, marginBottom: 0 } }, "Actividad Reciente"))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-0)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-md)", padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, recentActivity.map((ev, i) => /* @__PURE__ */ React.createElement("button", { key: i, onClick: () => props.onActivityGo && props.onActivityGo(ev.container, ev.type), className: "home-activity-row", style: { cursor: "pointer", display: "flex", gap: 12, padding: "11px 4px", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: i < recentActivity.length - 1 ? "1px solid var(--paper-300)" : "none", background: "none", width: "100%", textAlign: "left", borderRadius: "var(--r-xs)" } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, width: 8, height: 8, borderRadius: "50%", background: ev.accent, marginTop: 6 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--ink-900)" } }, ev.typeLabel), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--slate-600)" } }, ev.container)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-600)", marginTop: 1 } }, ev.note)), /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, alignSelf: "center", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-400)", fontWeight: 700 } }, "→")))))));
  })(), tab === "catalogo" && /* @__PURE__ */ React.createElement("div", { className: "spp-sect spp-sect-catalog" }, /* @__PURE__ */ React.createElement("div", { className: "catalog-hdr" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "catalog-eyebrow" }, "Receta"), /* @__PURE__ */ React.createElement("h2", { className: "catalog-title" }, "Catálogo de especies"))), /* @__PURE__ */ React.createElement("div", { className: "spp-grid" }, Object.entries(SPP).map(([k, d], idx) => {
    const hasImg = !!IMG[k];
    const isOn = sKey === k;
    const num = String(idx + 1).padStart(2, "0");
    return /* @__PURE__ */ React.createElement("button", { key: k, className: `spp-card${isOn && hasPickedSpecies ? " on" : ""}`, "aria-pressed": isOn && hasPickedSpecies, onClick: () => {
      setSKey(k);
      setCatalogModalOpen(true);
    } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", borderRadius: "var(--r-xs)" } }, /* @__PURE__ */ React.createElement("div", { className: "p-family-strip" }, /* @__PURE__ */ React.createElement("span", null, SPP_FAMILY[k] || "")), /* @__PURE__ */ React.createElement("div", { className: "p-arch-head" }, /* @__PURE__ */ React.createElement("div", { className: "p-arch-left" }, /* @__PURE__ */ React.createElement("span", { className: "p-arch-num" }, num), /* @__PURE__ */ React.createElement("span", { className: "p-arch-code" }, SPP_CODE[k])), /* @__PURE__ */ React.createElement("span", { className: "p-activa" }, "Activa")), hasImg ? /* @__PURE__ */ React.createElement("div", { className: "p-img" }, /* @__PURE__ */ React.createElement("img", { src: IMG[k], alt: d.name, width: "320", height: "240", loading: "lazy", decoding: "async" })) : /* @__PURE__ */ React.createElement("div", { className: "p-svg", style: { marginLeft: 16 } }, /* @__PURE__ */ React.createElement(SppSvg, { sKey: k, c: isOn ? "var(--accent-blue-grey)" : "var(--accent-mushroom)" })), /* @__PURE__ */ React.createElement("div", { className: "p-body" }, /* @__PURE__ */ React.createElement("div", { className: "p-sci" }, d.scientific), /* @__PURE__ */ React.createElement("div", { className: "p-common" }, d.name)), /* @__PURE__ */ React.createElement("div", { className: "p-chips" }, /* @__PURE__ */ React.createElement("div", { className: "p-chips-row p-chips-row1" }, /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-ico" }, /* @__PURE__ */ React.createElement(IcoTherm, null)), /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "Temp"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, d.temp_fruit))), /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-ico" }, /* @__PURE__ */ React.createElement(IcoDrop, null)), /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "HR"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, SPP_HR[k]))), /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-ico" }, /* @__PURE__ */ React.createElement(IcoLayers, null)), /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "Sustrato"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, d.substrate || "Paja + Madera")))), /* @__PURE__ */ React.createElement("div", { className: "p-chips-row p-chips-row2" }, /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "pH"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, d.ph_optimal.min, "–", d.ph_optimal.max))), /* @__PURE__ */ React.createElement("div", { className: "p-chip" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-txt" }, /* @__PURE__ */ React.createElement("span", { className: "p-chip-lbl" }, "C:N"), /* @__PURE__ */ React.createElement("span", { className: "p-chip-val" }, d.cn_optimal.min, "–", d.cn_optimal.max))), /* @__PURE__ */ React.createElement("div", { className: "p-chip p-chip-arr", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(IcoArrow, null))))));
  })), catalogModalOpen && sp && (() => {
    const det = SPP_DETAILS[sKey] || {};
    const IcoAp = () => /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }, /* @__PURE__ */ React.createElement("circle", { cx: "6", cy: "5", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M2 10c0-2 1.5-3 4-3s4 1 4 3" }));
    const IcoSab = () => /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M6 2c-2.5 0-4 1.5-4 3.5 0 3 4 5.5 4 5.5s4-2.5 4-5.5C10 3.5 8.5 2 6 2z" }));
    const IcoUso = () => /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M2 6h8M6 2v8" }), /* @__PURE__ */ React.createElement("rect", { x: "1", y: "1", width: "10", height: "10", rx: "1" }));
    return /* @__PURE__ */ React.createElement(AccessibleModal, { onClose: () => setCatalogModalOpen(false), label: `Ficha de especie: ${sp.name}`, backdropClassName: "cat-modal-bg", dialogClassName: "cat-modal-box" }, /* @__PURE__ */ React.createElement("button", { className: "cat-modal-close", onClick: () => setCatalogModalOpen(false), title: "Cerrar", "aria-label": "Cerrar ficha de especie" }, "✕"), /* @__PURE__ */ React.createElement("div", { className: "spp-info-2col", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "spp-info-left" }, /* @__PURE__ */ React.createElement("div", { className: "spp-info-top", style: { background: "color-mix(in oklab,var(--moss-100) 40%,var(--paper-50))" } }, /* @__PURE__ */ React.createElement("div", { className: "spp-info-sci" }, sp.scientific), /* @__PURE__ */ React.createElement("h2", { className: "spp-info-name" }, sp.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid color-mix(in oklab,var(--moss-400) 20%,transparent)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--moss-700)", marginBottom: 4 } }, "Característica"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-base)", lineHeight: 1.4, color: "var(--ink-900)" } }, sp.notes.split(".")[0] + ".")))), det.hechos && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginTop: 4 } }, det.hechos.map((h, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 10, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--coral-500)", background: "color-mix(in oklab,var(--coral-200) 40%,var(--paper-50))", border: "1px solid var(--coral-200)", borderRadius: 3, padding: "2px 6px", flexShrink: 0, marginTop: 1, lineHeight: 1.6 } }, String(i + 1).padStart(2, "0")), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", lineHeight: 1.65, color: "var(--ink-700)", margin: 0, textWrap: "pretty" } }, h)))), (() => {
      const diffMap = { "Baja": 1, "Media": 2, "Alta": 3, "Muy alta": 4 };
      const diff = diffMap[SPP_DIFFICULTY[sKey] || "Media"] || 2;
      const bars = [
        { lbl: "Ef. Biológica", min: sp.eb_baseline, max: sp.eb_optimal, abs: 150, unit: "%", color: "var(--coral-500)" },
        { lbl: "Spawn", min: sp.spawn_rate, max: sp.spawn_rate, abs: 20, unit: "%", color: "var(--moss-600)" },
        { lbl: "C:N", min: sp.cn_optimal.min, max: sp.cn_optimal.max, abs: 80, unit: "", color: "#594631" },
        { lbl: "pH", min: sp.ph_optimal.min, max: sp.ph_optimal.max, abs: 10, unit: "", color: "var(--ochre-500)" }
      ];
      return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 20, padding: "14px 0 2px", borderTop: "1px solid color-mix(in oklab,var(--moss-400) 30%,transparent)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--moss-700)", marginBottom: 8 } }, "Parámetros de cultivo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } }, bars.map((b) => {
        const lo = Math.min(b.min, b.max) / b.abs * 100;
        const hi = Math.max(b.min, b.max) / b.abs * 100;
        const w = Math.max(hi - lo, 4);
        return /* @__PURE__ */ React.createElement("div", { key: b.lbl, style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ink-800)", width: 90, flexShrink: 0 } }, b.lbl), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 5, background: "var(--paper-300)", borderRadius: 3, position: "relative", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: `${lo}%`, width: `${w}%`, height: "100%", background: b.color, borderRadius: 3, transition: "width .5s cubic-bezier(.32,.72,.36,1)" } })), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", width: 54, textAlign: "right", flexShrink: 0 } }, b.min === b.max ? `${b.min}${b.unit}` : `${b.min}–${b.max}${b.unit}`));
      }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ink-800)", width: 90, flexShrink: 0 } }, "Dificultad"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", gap: 3 } }, [1, 2, 3, 4].map((d) => /* @__PURE__ */ React.createElement("div", { key: d, style: { flex: 1, height: 5, borderRadius: 3, background: d <= diff ? "var(--coral-500)" : "var(--paper-300)", transition: "background .3s" } }))), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", width: 54, textAlign: "right", flexShrink: 0 } }, SPP_DIFFICULTY[sKey] || "Media"))));
    })())), /* @__PURE__ */ React.createElement("div", { className: "spp-info-center", style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { className: "spp-img-wrap", style: { flex: 1, position: "relative", minHeight: 320 } }, IMG[sKey] && /* @__PURE__ */ React.createElement("img", { src: IMG[sKey], alt: sp.name, width: "520", height: "390", className: "spp-info-img", style: { objectPosition: "center 65%" }, loading: "lazy", decoding: "async" })), /* @__PURE__ */ React.createElement("div", { className: "spp-cta-row", style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { className: "spp-cta-note" }, "Dificultad: ", SPP_DIFFICULTY[sKey] || "Media"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setTastingSpeciesKey(sKey);
      setShowTastingModal(true);
    }, className: "spp-cta", style: { background: "var(--paper-0,#F7F4EC)", color: "var(--accent-olive,#5B6B44)", border: "1px solid var(--border-hairline,#8C7F5B)" } }, "🍷 Ficha de Cata"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setCatalogModalOpen(false);
      openBuilderSubTab("formular");
      goTab("formular");
    }, className: "spp-cta" }, "Formular con ", sp.name, " →")))));
  })()), tab === "formular" && /* @__PURE__ */ React.createElement("nav", { className: "formular-mode-nav", role: "tablist", "aria-label": "Modo de formulación" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      role: "tab",
      id: "formular-tab-mesa",
      "aria-controls": "formular-panel-mesa",
      "aria-selected": builderSubTab === "formular",
      tabIndex: builderSubTab === "formular" ? 0 : -1,
      className: `formular-mode-btn${builderSubTab === "formular" ? " is-active" : ""}`,
      onKeyDown: onBuilderTabKeyDown,
      onClick: () => openBuilderSubTab("formular")
    },
    /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "🥣"),
    /* @__PURE__ */ React.createElement("span", null, "Mesa de Mezcla"),
    recipe.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "formular-mode-badge", "aria-label": `${recipe.length} ingredientes` }, recipe.length)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      role: "tab",
      id: "formular-tab-generador",
      "aria-controls": "formular-panel-generador",
      "aria-selected": builderSubTab === "generador",
      tabIndex: builderSubTab === "generador" ? 0 : -1,
      className: `formular-mode-btn${builderSubTab === "generador" ? " is-active" : ""}`,
      onKeyDown: onBuilderTabKeyDown,
      onClick: () => openBuilderSubTab("generador")
    },
    /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "⚡"),
    /* @__PURE__ */ React.createElement("span", null, "Generador de Recetas")
  )), tab === "formular" && builderSubTab === "formular" && recipe.length === 0 && /* @__PURE__ */ React.createElement("section", { className: "form-mobile-start", "data-testid": "form-mobile-start", "aria-labelledby": "form-mobile-start-title" }, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement("span", null, "Inicio rápido"), /* @__PURE__ */ React.createElement("strong", { id: "form-mobile-start-title" }, "Configura y empieza la receta")), /* @__PURE__ */ React.createElement("label", { className: "form-mobile-start-field", htmlFor: "form-mobile-species-select" }, /* @__PURE__ */ React.createElement("span", null, "1 · Especie"), /* @__PURE__ */ React.createElement("select", { id: "form-mobile-species-select", value: hasPickedSpecies ? sKey : "", onChange: (e) => e.target.value && setSKey(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "Elegir especie…"), Object.entries(SPP).map(([k, d]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, d.name)))), /* @__PURE__ */ React.createElement("div", { className: "form-mobile-start-field" }, /* @__PURE__ */ React.createElement("span", null, "2 · Origen"), /* @__PURE__ */ React.createElement("div", { className: "form-mobile-origin-options", role: "group", "aria-label": "Origen de ingredientes para inicio rápido" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: globalMode === "produccion" ? "is-active" : "", "aria-pressed": globalMode === "produccion", onClick: () => setGlobalWorkMode("produccion") }, "Bodega"), /* @__PURE__ */ React.createElement("button", { type: "button", className: globalMode === "investigacion" ? "is-active" : "", "aria-pressed": globalMode === "investigacion", onClick: () => setGlobalWorkMode("investigacion") }, "Catálogo"))), /* @__PURE__ */ React.createElement("div", { className: "form-mobile-start-actions", "aria-label": "Método para comenzar" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "is-primary", onClick: focusIngredientCatalog }, "Elegir insumos"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => openBuilderSubTab("generador") }, "Usar generador"))), tab === "formular" && builderSubTab === "formular" && recipe.length > 0 && /* @__PURE__ */ React.createElement("section", { className: `form-production-command is-${formNextState}`, "aria-label": "Siguiente paso de producción" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-testid": "formulator-review-recipe",
      className: "form-production-command-copy",
      onClick: focusActiveRecipe,
      "aria-label": `Revisar receta activa: ${recipe.length} ingrediente${recipe.length === 1 ? "" : "s"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Ruta de producción"),
    /* @__PURE__ */ React.createElement("strong", null, formNextState === "species" ? "Falta definir la especie" : formNextState === "balance" ? "Falta cerrar el balance" : "Receta lista para preparar"),
    /* @__PURE__ */ React.createElement("em", null, recipe.length, " ingrediente", recipe.length === 1 ? "" : "s", " · Revisar receta · Autoguardado")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-testid": "formulator-next-action",
      onClick: runFormNextAction,
      className: `form-production-command-btn is-${formNextState}`,
      "aria-label": `${formNextLabel}. ${formNextState === "produce" ? "Abrir preparación del lote" : "Completar requisito para producción"}`
    },
    formNextState === "species" ? /* @__PURE__ */ React.createElement(IconTarget, { size: 15, color: "currentColor" }) : formNextState === "balance" ? /* @__PURE__ */ React.createElement(IconBolt, { size: 15, color: "currentColor" }) : /* @__PURE__ */ React.createElement(IconBox, { size: 15, color: "currentColor" }),
    /* @__PURE__ */ React.createElement("span", null, formNextLabel)
  )), tab === "formular" && builderSubTab === "formular" && /* @__PURE__ */ React.createElement("div", { id: "formular-panel-mesa", className: "builder-wrap", "data-tab": tab, role: "tabpanel", "aria-labelledby": "formular-tab-mesa" }, loadedFlash && /* @__PURE__ */ React.createElement("div", { className: "loaded-toast", role: "status", "aria-live": "polite" }, "✓ Receta cargada en Mesa de Mezcla"), /* @__PURE__ */ React.createElement("section", { className: "form-flow", "aria-labelledby": "form-flow-title" }, /* @__PURE__ */ React.createElement("div", { className: "form-flow-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "form-flow-eyebrow" }, "Nueva formulación"), /* @__PURE__ */ React.createElement("h2", { id: "form-flow-title" }, "Especie → Origen → Ingredientes → Validar y guardar")), /* @__PURE__ */ React.createElement("span", { className: "form-flow-progress", "aria-live": "polite" }, recipe.length > 0 ? `${recipe.length} ingrediente${recipe.length === 1 ? "" : "s"} · Perito ${Math.round(opt.score)}/100` : "Preparado para comenzar")), /* @__PURE__ */ React.createElement("ol", { className: "form-flow-grid" }, /* @__PURE__ */ React.createElement("li", { className: "form-step is-ready" }, /* @__PURE__ */ React.createElement("span", { className: "form-step-num" }, "01"), /* @__PURE__ */ React.createElement("span", { className: "form-step-label" }, "Especie"), /* @__PURE__ */ React.createElement("div", { className: "form-step-species-state" }, /* @__PURE__ */ React.createElement("strong", null, hasPickedSpecies ? sp.name : "Pendiente"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    document.querySelector(".form-species-context")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => document.getElementById("form-species-context-select")?.focus(), 250);
  } }, hasPickedSpecies ? "Cambiar" : "Seleccionar")), /* @__PURE__ */ React.createElement("span", { className: "form-step-help" }, "Define los rangos C:N, pH y EB.")), /* @__PURE__ */ React.createElement("li", { className: "form-step is-ready" }, /* @__PURE__ */ React.createElement("span", { className: "form-step-num" }, "02"), /* @__PURE__ */ React.createElement("span", { className: "form-step-label" }, "Origen"), /* @__PURE__ */ React.createElement("div", { className: "form-step-options", role: "group", "aria-label": "Origen de ingredientes" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: globalMode === "produccion" ? "is-active" : "", "aria-pressed": globalMode === "produccion", onClick: () => setGlobalWorkMode("produccion") }, "Solo bodega"), /* @__PURE__ */ React.createElement("button", { type: "button", className: globalMode === "investigacion" ? "is-active" : "", "aria-pressed": globalMode === "investigacion", onClick: () => setGlobalWorkMode("investigacion") }, "Paleta completa")), /* @__PURE__ */ React.createElement("span", { className: "form-step-help" }, globalMode === "produccion" ? "Usa únicamente el stock disponible." : "Permite explorar todo el catálogo.")), /* @__PURE__ */ React.createElement("li", { className: `form-step${hasPickedSpecies ? " is-ready" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "form-step-num" }, "03"), /* @__PURE__ */ React.createElement("span", { className: "form-step-label" }, "Ingredientes"), /* @__PURE__ */ React.createElement("div", { className: "form-step-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: focusIngredientCatalog }, "Elegir manualmente"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => openBuilderSubTab("generador") }, "Usar generador")), /* @__PURE__ */ React.createElement("span", { className: "form-step-help" }, "Agrega insumos o calcula una base.")), /* @__PURE__ */ React.createElement("li", { className: `form-step${recipe.length > 0 ? " is-ready" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "form-step-num" }, "04"), /* @__PURE__ */ React.createElement("span", { className: "form-step-label" }, "Validar y guardar"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "form-step-primary", disabled: recipe.length === 0, onClick: () => document.getElementById("bl-receta")?.scrollIntoView({ behavior: "smooth", block: "start" }) }, recipe.length > 0 ? "Revisar receta" : "Agrega ingredientes"), /* @__PURE__ */ React.createElement("span", { className: "form-step-help" }, "Revisa balance, riesgo, costo y tratamiento.")))), /* @__PURE__ */ React.createElement("section", { className: `form-species-context ${recipe.length > 0 ? "has-recipe" : "is-empty"}`, "aria-labelledby": "form-species-context-title" }, /* @__PURE__ */ React.createElement("div", { className: "form-species-identity" }, /* @__PURE__ */ React.createElement("span", { className: "form-species-kicker" }, "Especie activa"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { id: "form-species-context-title" }, hasPickedSpecies ? sp.name : "Selecciona una especie"), /* @__PURE__ */ React.createElement("em", null, hasPickedSpecies ? sp.scientific : "La evaluación se adapta a sus objetivos biológicos."))), /* @__PURE__ */ React.createElement("label", { className: "form-species-picker", htmlFor: "form-species-context-select" }, /* @__PURE__ */ React.createElement("span", null, "Cambiar especie"), /* @__PURE__ */ React.createElement("select", { id: "form-species-context-select", name: "formSpeciesContext", value: hasPickedSpecies ? sKey : "", onChange: (e) => e.target.value && setSKey(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "Elegir especie…"), Object.entries(SPP).map(([k, d]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, d.name)))), /* @__PURE__ */ React.createElement("div", { className: "form-species-origin-toggle" }, /* @__PURE__ */ React.createElement("span", null, "Origen de ingredientes"), /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": "Origen de ingredientes en la receta activa" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: globalMode === "produccion" ? "is-active" : "", "aria-pressed": globalMode === "produccion", onClick: () => setGlobalWorkMode("produccion") }, "Bodega"), /* @__PURE__ */ React.createElement("button", { type: "button", className: globalMode === "investigacion" ? "is-active" : "", "aria-pressed": globalMode === "investigacion", onClick: () => setGlobalWorkMode("investigacion") }, "Catálogo"))), /* @__PURE__ */ React.createElement("div", { className: "form-species-targets", "aria-label": "Objetivos de la especie activa" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("small", null, "C:N objetivo"), /* @__PURE__ */ React.createElement("b", null, hasPickedSpecies ? `${sp.cn_optimal.min}–${sp.cn_optimal.max}:1` : "—")), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("small", null, "N objetivo"), /* @__PURE__ */ React.createElement("b", null, hasPickedSpecies ? `${sp.n_optimal.min}–${sp.n_optimal.max}%` : "—")), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("small", null, "EB meta"), /* @__PURE__ */ React.createElement("b", null, hasPickedSpecies ? `${sp.eb_optimal}%` : "—")), /* @__PURE__ */ React.createElement("span", { className: `form-species-mode is-${globalMode}` }, /* @__PURE__ */ React.createElement("small", null, "Origen"), /* @__PURE__ */ React.createElement("b", null, globalMode === "produccion" ? "Bodega" : "Paleta completa")))), /* @__PURE__ */ React.createElement("div", { className: "sim-live-dashboard", id: "sim-live-dash" }, recipe.length === 0 ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "live-dash-bar" }, /* @__PURE__ */ React.createElement("div", { className: "live-dash-left" }, /* @__PURE__ */ React.createElement("span", { className: "live-dash-species", title: "Aún no hay ingredientes en la receta" }, "Receta activa"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "9px", padding: "1px 4px", borderRadius: 2, background: "rgba(77,98,53,.15)", color: "var(--moss-700)", fontWeight: 700, textTransform: "uppercase" } }, "sin ingredientes"))), /* @__PURE__ */ React.createElement("div", { className: "live-dash-tray", id: "bl-receta" }, /* @__PURE__ */ React.createElement("div", { className: "rec-empty" }, /* @__PURE__ */ React.createElement("div", { className: "rec-empty-hed" }, "Sin ingredientes aún."), /* @__PURE__ */ React.createElement("div", { className: "rec-empty-sub" }, "Selecciona ingredientes a la izquierda para comenzar a formular."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18, padding: "14px 16px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-100)", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-600)", marginBottom: 6 } }, "¿No sabes por dónde empezar?"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", lineHeight: 1.6, marginBottom: 12 } }, "El ", /* @__PURE__ */ React.createElement("strong", null, "Generador"), " crea automáticamente las mejores combinaciones de ingredientes para tu especie — con los ratios C:N, humedad y costo ya calculados. Solo elige especie y pulsa calcular."), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setShowOptimizer(true);
    openBuilderSubTab("generador");
  }, style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", padding: "9px 16px", background: "var(--moss-700)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-xs)", cursor: "pointer" } }, "Abrir Generador"))))) : (() => {
    const sm2 = PERITO_STATUS[opt.status] || PERITO_STATUS.sin_receta;
    const limiter = peritoMainLimiter(opt, an);
    const ebVal = an ? blendEBWithHistory(an, histStats) : 0;
    const ebOpt = sp?.eb_optimal || 100;
    const ebBase = sp?.eb_baseline || 80;
    const ebOk = ebVal >= ebOpt;
    const ebMid = ebVal >= ebBase;
    const ebColor = ebOk ? "var(--moss-700,#2E3B2F)" : ebMid ? "#976E1A" : "#A8432A";
    const totOk = an ? Math.abs(an.tot - 100) <= 0.5 : false;
    const totColor = totOk ? "var(--moss-700,#2E3B2F)" : "#A8432A";
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "live-dash-bar" }, /* @__PURE__ */ React.createElement("div", { className: "live-dash-left" }, /* @__PURE__ */ React.createElement("span", { className: "live-dash-species", title: "Ingredientes y evaluación de la receta activa" }, "Receta activa"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "9px", padding: "1px 4px", borderRadius: 2, background: "rgba(77,98,53,.15)", color: "var(--moss-700)", fontWeight: 700, textTransform: "uppercase" } }, "evaluación en vivo")), /* @__PURE__ */ React.createElement("div", { className: "live-dash-metrics" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => document.getElementById("bl-perito")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        className: "live-dash-pill",
        style: { background: sm2.bg || "var(--paper-100)", borderColor: `${sm2.badge}40`, cursor: "pointer" },
        "aria-label": `Score Perito: ${Math.round(opt.score)} de 100, ${sm2.label}. Ver análisis completo`,
        title: `Score Perito: ${Math.round(opt.score)}/100 · ${sm2.label}
Click para ver análisis completo`
      },
      /* @__PURE__ */ React.createElement(IconTarget, { size: 11, color: sm2.badge }),
      /* @__PURE__ */ React.createElement("span", { style: { color: sm2.badge, fontWeight: 800 } }, Math.round(opt.score))
    ), /* @__PURE__ */ React.createElement("div", { className: "live-dash-pill", title: `Eficiencia Biológica Estimada: ${Math.round(ebVal)}% (Meta: ${ebOpt}%)` }, /* @__PURE__ */ React.createElement("span", { className: "live-dash-pill-label" }, "EB"), /* @__PURE__ */ React.createElement("span", { style: { color: ebColor } }, Math.round(ebVal), "%")), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "live-dash-pill",
        style: { background: totOk ? "rgba(77,98,53,.08)" : "rgba(168,67,42,.08)", borderColor: `${totColor}40` },
        title: `Balance de masa: ${an ? an.tot.toFixed(1) : "0"}% (ideal 100%)`
      },
      /* @__PURE__ */ React.createElement("span", { style: { color: totColor, display: "inline-flex", alignItems: "center", gap: 3 } }, an ? an.tot.toFixed(0) : "0", "%", totOk ? /* @__PURE__ */ React.createElement(IconCheck, { size: 10, color: totColor }) : /* @__PURE__ */ React.createElement(IconAlert, { size: 10, color: totColor }))
    )), /* @__PURE__ */ React.createElement("div", { className: "sr-only", role: "status", "aria-live": "polite", "aria-atomic": "true" }, `Score Perito ${Math.round(opt.score)} de 100, ${sm2.label}. `, `Eficiencia biológica estimada ${Math.round(ebVal)} por ciento${ebOk ? ", meta alcanzada" : ebMid ? ", por debajo de la meta" : ", por debajo de la línea base"}. `, `Balance de masa ${an ? an.tot.toFixed(0) : "0"} por ciento${totOk ? ", correcto" : ", requiere ajuste al 100 por ciento"}.`), /* @__PURE__ */ React.createElement("div", { className: "live-dash-actions" }, an && !totOk && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => autoBalance(balanceMode),
        className: "live-dash-btn",
        style: { background: "var(--coral-500)", color: "#fff", borderColor: "var(--coral-600)" },
        "aria-label": "Ajustar ingredientes libres al 100%",
        title: "Ajustar ingredientes libres al 100%"
      },
      /* @__PURE__ */ React.createElement(IconBolt, { size: 10, color: "#fff" }),
      /* @__PURE__ */ React.createElement("span", null, "100%")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowLiveChips(!showLiveChips),
        className: "live-dash-btn live-dash-recipe-toggle",
        style: { background: showLiveChips ? "var(--paper-300)" : "var(--paper-100)" },
        "aria-label": `${recipe.length} insumos en receta. ${showLiveChips ? "Ocultar receta editable" : "Ver y editar receta"}`,
        "aria-expanded": showLiveChips,
        "aria-controls": "bl-receta",
        title: showLiveChips ? "Ocultar receta editable" : "Ver y editar receta"
      },
      /* @__PURE__ */ React.createElement(IconRecipe, { size: 11, color: "var(--ink-700)" }),
      /* @__PURE__ */ React.createElement("span", null, recipe.length),
      showLiveChips ? /* @__PURE__ */ React.createElement(IconChevronUp, { size: 9, color: "var(--ink-700)" }) : /* @__PURE__ */ React.createElement(IconChevronDown, { size: 9, color: "var(--ink-700)" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (saveName.trim()) {
            saveR();
          } else {
            document.getElementById("bl-receta")?.scrollIntoView({ behavior: "smooth", block: "start" });
            setTimeout(() => {
              const inp = document.querySelector(".sbar input");
              if (inp) {
                inp.focus();
                inp.style.outline = "2px solid var(--coral-500)";
                setTimeout(() => inp.style.outline = "", 1200);
              }
            }, 300);
          }
        },
        className: "live-dash-btn",
        style: { background: flash ? "var(--moss-600)" : "var(--ink-900)", color: "#fff", borderColor: "var(--ink-900)" },
        "aria-label": flash ? "Receta guardada" : "Guardar receta en Recetario",
        title: "Guardar receta en Recetario"
      },
      flash ? /* @__PURE__ */ React.createElement(IconCheck, { size: 11, color: "#fff" }) : /* @__PURE__ */ React.createElement(IconDisk, { size: 11, color: "#fff" })
    ))), /* @__PURE__ */ React.createElement("div", { className: "live-dash-tray", id: "bl-receta", hidden: !showLiveChips }, /* @__PURE__ */ React.createElement("div", { className: "live-dash-secondary-nav", style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, [
      { id: "bl-ingredientes", l: "Insumos", icon: IconSprout },
      { id: "bl-receta", l: "Receta", icon: IconRecipe },
      { id: "bl-perito", l: "Perito", icon: IconTarget },
      { id: "bl-batch", l: "Batch", icon: IconBox },
      ...tr ? [{ id: "bl-tratamiento", l: "Tratamiento", icon: IconFlame }] : []
    ].map((s) => {
      const IconComp = s.icon;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: s.id,
          onClick: () => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
          style: {
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 6px",
            background: "var(--paper-0)",
            color: "var(--ink-700)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--r-xs)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4
          }
        },
        /* @__PURE__ */ React.createElement(IconComp, { size: 10, color: "var(--ink-600)" }),
        /* @__PURE__ */ React.createElement("span", null, s.l)
      );
    })), /* @__PURE__ */ React.createElement("div", { className: `offline-status-chip ${isOnline ? "is-online" : "is-offline"}`, style: { fontSize: "10px", padding: "2px 6px" } }, /* @__PURE__ */ React.createElement("span", { className: "offline-status-dot" }), /* @__PURE__ */ React.createElement("span", null, isOnline ? "En línea" : "Sin conexión"))), limiter && /* @__PURE__ */ React.createElement("div", { className: "live-dash-limiter", style: { marginBottom: 6, padding: "3px 8px", background: sm2.bg || "var(--paper-100)", borderRadius: 2, fontSize: "11px", fontFamily: "var(--font-mono)", color: sm2.txt, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(IconAlert, { size: 11, color: sm2.txt }), /* @__PURE__ */ React.createElement("span", null, limiter)), /* @__PURE__ */ React.createElement("button", { onClick: () => document.getElementById("bl-perito")?.scrollIntoView({ behavior: "smooth", block: "start" }), style: { background: "none", border: "none", color: sm2.txt, fontWeight: 700, fontSize: "10px", cursor: "pointer", textDecoration: "underline" } }, "Ver dictamen")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", marginBottom: 8 } }, an && Math.abs(an.tot - 100) > 0.5 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 2, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "tog mass-balance-action", onClick: () => autoBalance(balanceMode) }, "⚡ Auto-balancear 100%"), /* @__PURE__ */ React.createElement("select", { name: "balanceStrategy", "aria-label": "Estrategia de balanceo", className: "bal-mode", value: balanceMode, onChange: (e) => setBalanceMode(e.target.value), title: "Estrategia de balanceo" }, /* @__PURE__ */ React.createElement("option", { value: "proportional" }, "Proporcional"), /* @__PURE__ */ React.createElement("option", { value: "equal" }, "Igualando"), /* @__PURE__ */ React.createElement("option", { value: "last" }, "Al último"))), /* @__PURE__ */ React.createElement("button", { className: `tog${normMode ? " on" : ""}`, "aria-pressed": normMode, onClick: () => setNormMode(!normMode), title: "Al cambiar un %, los demás se ajustan proporcionalmente (respeta ●)" }, "Auto-ajustar"), /* @__PURE__ */ React.createElement("button", { className: "tog", onClick: () => setConfirmDlg({ title: "Limpiar receta", msg: "¿Limpiar la receta activa? Se perderán los ingredientes y porcentajes actuales.", danger: true, confirmLabel: "Limpiar", onConfirm: () => {
      setRecipe([]);
      setLockedIds([]);
    } }) }, "Limpiar")), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--paper-300)" } }, recipe.map((r) => {
      const g = INGS.find((i) => i.id === r.id);
      if (!g) return null;
      const isLocked = lockedIds.includes(r.id);
      const gName = (g.name || "").toLowerCase();
      const roleMatch = (it) => {
        const txt = (it.action || "").replace(/<[^>]+>/g, "").toLowerCase();
        if (txt.includes(gName)) return true;
        const isCarbBase = g.role === "base_carbono", isNSupp = g.role === "suplemento_n" || g.n >= 1.5;
        if ((it.icon === "↓C:N" || it.icon === "↑N") && isNSupp) return true;
        if ((it.icon === "↑C:N" || it.icon === "↓N") && isCarbBase) return true;
        return false;
      };
      const rowFlag = recipe.length > 0 ? opt.items.find((it) => it.priority === "critical" && roleMatch(it)) || opt.items.find((it) => it.priority === "warning" && roleMatch(it)) : null;
      return /* @__PURE__ */ React.createElement("div", { key: r.id, className: `rec-row${isLocked ? " rec-locked" : ""}${!balanced && !isLocked ? " is-adjustable" : ""}`, style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderBottom: "1px solid var(--paper-300)", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: `lock-btn mix-lock-btn${isLocked ? " on" : ""}`, onClick: () => toggleLock(r.id), "aria-label": isLocked ? `Desbloquear porcentaje de ${g?.name || ""}` : `Fijar porcentaje de ${g?.name || ""}`, title: isLocked ? "Desbloquear (incluir en auto-ajuste)" : "Fijar este % (excluir del auto-ajuste)", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, isLocked ? "●" : "○")), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 100px", minWidth: 0, display: "flex", alignItems: "center", gap: 4 }, title: `${g.name} · C:N ${g.cn || "—"} · N ${g.n || "—"}%${rowFlag ? ` · ${rowFlag.label}` : ""}` }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-sm)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, g.name), rowFlag && /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { color: rowFlag.priority === "critical" ? "var(--coral-500)" : "#7A5A10", fontWeight: 700, fontSize: "var(--text-xs)", flexShrink: 0 } }, rowFlag.priority === "critical" ? "⚠" : "!"), /* @__PURE__ */ React.createElement("span", { className: "sr-only" }, "C:N ", g.cn || "—", " · N ", g.n || "—", "%", rowFlag ? `, ${rowFlag.label}` : "")), /* @__PURE__ */ React.createElement("div", { className: "mix-steppers", role: "group", "aria-label": `Ajustar porcentaje de ${g.name}` }, [-5, -1].map((delta) => /* @__PURE__ */ React.createElement("button", { key: delta, type: "button", className: "mix-step-btn", disabled: isLocked || Number(r.p) <= 0, onClick: () => updP(r.id, Math.max(0, Math.min(100, (parseFloat(r.p) || 0) + delta))) }, delta, "%")), /* @__PURE__ */ React.createElement("label", { className: "mix-number-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "sr-only" }, "Porcentaje de ", g.name), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", max: "100", step: ".5", inputMode: "decimal", required: true, value: r.p, onChange: (e) => !isLocked && updP(r.id, parseFloat(e.target.value) || 0), readOnly: isLocked, "aria-label": `Porcentaje de ${g?.name || "ingrediente"} (numérico)`, className: "rec-pct-input mix-num-input" }), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "%")), [1, 5].map((delta) => /* @__PURE__ */ React.createElement("button", { key: delta, type: "button", className: "mix-step-btn", disabled: isLocked || Number(r.p) >= 100, onClick: () => updP(r.id, Math.max(0, Math.min(100, (parseFloat(r.p) || 0) + delta))) }, "+", delta, "%"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "rem mix-remove-btn", onClick: () => {
        remI(r.id);
        setLockedIds((l) => l.filter((x) => x !== r.id));
      }, "aria-label": `Quitar ${g?.name || "ingrediente"} de la receta`, style: { flexShrink: 0 } }, "✕"));
    })), an && /* @__PURE__ */ React.createElement("div", { className: `tbar ${an.tot >= 99 && an.tot <= 101 ? "ok" : an.tot < 95 || an.tot > 105 ? "err" : "warn"}` }, /* @__PURE__ */ React.createElement("span", null, "Total"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, an.tot.toFixed(1), "% / 100%")), normMode && recipe.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "norm-bar" }, /* @__PURE__ */ React.createElement("span", null, "⇌"), /* @__PURE__ */ React.createElement("span", null, "Auto-ajustar activo — al cambiar un %, los demás se reescalan proporcionalmente"), lockedIds.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", opacity: 0.8 } }, "● ", lockedIds.length, " fijado", lockedIds.length !== 1 ? "s" : ""))));
  })()), /* @__PURE__ */ React.createElement("section", { className: "builder-cols form-recipe-workspace", "aria-labelledby": "active-recipe-workspace-title" }, /* @__PURE__ */ React.createElement("header", { className: "active-recipe-workspace-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "ingredient-section-eyebrow" }, "Área de trabajo principal"), /* @__PURE__ */ React.createElement("h2", { id: "active-recipe-workspace-title" }, "Puntaje, gauges y lote"), /* @__PURE__ */ React.createElement("p", null, "Edita la receta desde la barra superior — aquí queda su lectura técnica: puntaje, balance C:N/N% y preparación del lote.")), /* @__PURE__ */ React.createElement("span", { className: "active-recipe-count", "aria-live": "polite" }, recipe.length, " ingrediente", recipe.length === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("div", { className: "builder-left" }, /* @__PURE__ */ React.createElement("div", { className: "panel", id: "bl-ingredientes" }, /* @__PURE__ */ React.createElement("div", { className: "ingredient-section-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "ingredient-section-eyebrow" }, "Paso 03 · Selección manual"), /* @__PURE__ */ React.createElement("h2", null, "Ingredientes"), /* @__PURE__ */ React.createElement("p", null, "Explora el catálogo completo con el scroll de la página. Agrega insumos sin perder de vista los grupos.")), /* @__PURE__ */ React.createElement("span", { className: "ingredient-section-count", "aria-live": "polite" }, visibleIngredients.length, " de ", effectiveINGS.length)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("input", { name: "ingredientSearch", type: "search", className: "search", "aria-label": "Buscar ingrediente o etiqueta", autoComplete: "off", style: { marginBottom: 0, flex: "1 1 auto", minWidth: "200px" }, placeholder: "Buscar ingrediente o etiqueta…", value: search, onChange: (e) => setSearch(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: `tog${showPrices ? " on" : ""}`, "aria-pressed": showPrices, onClick: () => setShowPrices(!showPrices), title: "Editar precios por kg", style: { flexShrink: 0, whiteSpace: "nowrap" } }, "Precios")), showPrices && /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--border-soft)", marginBottom: 10, background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "7px 12px", background: "var(--paper-200)", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", fontWeight: 700 } }, "Precios por kg (COP) — se guardan localmente"), Object.keys(priceOverrides).length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setPriceOverrides({});
    try {
      localStorage.removeItem("setas_prices_v1");
    } catch (e) {
    }
  }, style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "3px 8px", border: "1px solid var(--coral-500)", background: "none", color: "var(--coral-500)", cursor: "pointer" } }, "Restaurar todo")), /* @__PURE__ */ React.createElement("div", null, fings.filter((g) => g.cn > 0 || g.cost > 0).map((ing) => {
    const isEdited = priceOverrides[ing.id] !== void 0;
    const orig = INGS.find((i) => i.id === ing.id)?.cost || 0;
    return /* @__PURE__ */ React.createElement("div", { key: ing.id, className: "price-row" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-base)", fontWeight: 500, color: "var(--ink-900)" } }, ing.name), isEdited && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "var(--ink-700)", fontFamily: "var(--font-mono)", fontWeight: 500 } }, "Orig: $", orig, "/kg")), /* @__PURE__ */ React.createElement(
      "input",
      {
        name: `ingredientPrice-${ing.id}`,
        type: "number",
        min: "0",
        step: "100",
        inputMode: "numeric",
        required: true,
        "aria-label": `Precio ${ing.name} por kg`,
        className: `price-inp${isEdited ? " edited" : ""}`,
        value: ing.cost,
        onChange: (e) => {
          const v = Math.max(0, parseInt(e.target.value) || 0);
          const n = { ...priceOverrides, [ing.id]: v };
          setPriceOverrides(n);
          try {
            localStorage.setItem("setas_prices_v1", JSON.stringify(n));
          } catch (err) {
          }
        }
      }
    ));
  }))), /* @__PURE__ */ React.createElement("div", { className: "bodega-bar", title: "Abrir bodega / inventario" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => goTab("inventario"),
      style: { display: "flex", alignItems: "center", gap: "inherit", flex: 1, minWidth: 0, background: "none", border: "none", padding: 0, margin: 0, font: "inherit", color: "inherit", textAlign: "left", cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement("span", { className: "bodega-bar-icon", "aria-hidden": "true", style: { color: pantryIds.length > 0 ? "var(--accent-olive)" : "var(--border-soft)", display: "flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement(IcoBox, { color: pantryIds.length > 0 ? "var(--accent-olive)" : "var(--border-soft)" })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "bodega-bar-title" }, pantryIds.length > 0 ? pantryIds.length + " ingredientes en bodega" : "Bodega vacía — sin stock registrado"), pantryIds.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bodega-bar-sub" }, Object.values(stockMap).reduce((a, b) => a + b, 0).toFixed(1), " kg disponibles"))
  ), /* @__PURE__ */ React.createElement("div", { className: "bodega-bar-right", style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "inv-btn inv-btn-pri inv-btn-sm",
      style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 10px", whiteSpace: "nowrap" },
      onClick: (e) => {
        e.stopPropagation();
        formularConStockBodega();
      },
      title: "Formular automáticamente la mejor receta usando exclusivamente el stock disponible en bodega"
    },
    /* @__PURE__ */ React.createElement(AppIcon, { name: "pantry", size: 13, color: "var(--paper-50)" }),
    " Formular con Stock"
  ), /* @__PURE__ */ React.createElement("button", { className: "bodega-bar-refresh", onClick: (e) => {
    e.stopPropagation();
    goTab("inventario");
  }, title: "Actualizar stock", "aria-label": "Actualizar stock" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", viewBox: "0 0 24 24", width: "14", height: "14", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React.createElement("path", { d: "M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" }))))), usePantry && pantryIds.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "pantry-grid", style: { marginBottom: 8 } }, pantryIds.slice(0, 12).map((id) => {
    const g = INGS.find((i) => i.id === id);
    const kg = stockMap[id] || 0;
    return g ? /* @__PURE__ */ React.createElement("button", { key: id, type: "button", className: "pantry-chip on", style: { borderColor: INGS.find((i) => i.id === id)?.cs?.includes(sKey) ? "var(--moss-500)" : void 0, background: INGS.find((i) => i.id === id)?.cs?.includes(sKey) ? "color-mix(in oklab,var(--moss-500) 10%,var(--paper-50))" : void 0 }, title: INGS.find((i) => i.id === id)?.cs?.includes(sKey) ? "Compatible con " + sp.name : void 0, "aria-label": `Quitar ${g.name} de bodega`, onClick: () => setPantryIds((prev) => prev.filter((x) => x !== id)) }, INGS.find((i) => i.id === id)?.cs?.includes(sKey) && /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--moss-500)", marginRight: 4, verticalAlign: "middle", marginTop: -1 } }), g.name.length > 18 ? g.name.slice(0, 18) + "…" : g.name, kg > 0 && /* @__PURE__ */ React.createElement("span", { className: "pantry-chip-kg" }, kg.toFixed(1), " kg"), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, " ✕")) : null;
  }), pantryIds.length > 12 && /* @__PURE__ */ React.createElement("span", { className: "pantry-chip", style: { opacity: 0.5 } }, "+", pantryIds.length - 12, " más")), /* @__PURE__ */ React.createElement("div", { className: "cats", role: "group", "aria-label": "Filtrar por categoría" }, Object.entries(CATS).map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, "data-cat": k, className: `cat${cat === k ? " on" : ""}`, "aria-pressed": cat === k, onClick: () => setCat(k) }, l)), /* @__PURE__ */ React.createElement("button", { className: `cat${showCompatOnly ? " on" : ""}`, "aria-pressed": showCompatOnly, style: { borderColor: showCompatOnly ? "var(--moss-600)" : "", color: showCompatOnly ? "var(--moss-600)" : "", background: showCompatOnly ? "color-mix(in oklab,var(--moss-600) 8%,var(--paper-50))" : "" }, onClick: () => setShowCompatOnly((s) => !s), title: "Ver solo ingredientes compatibles con la especie seleccionada" }, showCompatOnly ? "Solo compatibles ✕" : "Compatibles"), /* @__PURE__ */ React.createElement("button", { className: `cat${groupByRole ? " on" : ""}`, "aria-pressed": groupByRole, onClick: () => setGroupByRole((g) => !g), title: "Agrupar ingredientes por rol funcional botánico (Base, Suplemento N, Minerales/pH)" }, groupByRole ? "Agrupado por Rol ✓" : "Lista simple")), /* @__PURE__ */ React.createElement("div", { className: "ingredient-view-toolbar" }, /* @__PURE__ */ React.createElement("span", null, visibleIngredients.length, " ingrediente", visibleIngredients.length === 1 ? "" : "s", " con el origen y filtros actuales"), /* @__PURE__ */ React.createElement("div", null, showRoleGroups && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setAllRoleGroups(false) }, "Expandir grupos"), showRoleGroups && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setAllRoleGroups(true) }, "Colapsar grupos"), hasIngredientViewFilters && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: resetIngredientView }, "Restablecer vista"))), /* @__PURE__ */ React.createElement("div", { className: `ing-list${showRoleGroups ? " is-grouped" : " is-simple"}` }, (() => {
    const base = visibleIngredients;
    if (usePantry && pantryIds.length === 0) {
      return /* @__PURE__ */ React.createElement("button", { type: "button", className: "ingredient-empty-action", onClick: () => {
        goTab("inventario");
        setInvTab("compra");
      } }, /* @__PURE__ */ React.createElement("strong", null, "Bodega sin ingredientes disponibles."), /* @__PURE__ */ React.createElement("span", null, "Registra una compra o cambia el origen a “Paleta completa”."));
    }
    if (base.length === 0) {
      return /* @__PURE__ */ React.createElement("div", { className: "ingredient-no-results", role: "status" }, /* @__PURE__ */ React.createElement("strong", null, "No hay ingredientes para esta vista."), /* @__PURE__ */ React.createElement("span", null, "Prueba otra búsqueda o restablece los filtros."), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: resetIngredientView }, "Restablecer vista"));
    }
    const renderIngRow = (ing) => {
      const inR = recipe.find((r) => r.id === ing.id);
      const inPantry = pantryIds.includes(ing.id);
      const isCompat = ing.cs && ing.cs.includes(sKey);
      return /* @__PURE__ */ React.createElement("div", { key: ing.id, className: `ing-card-item${justAddedIds.includes(ing.id) ? " ing-row-flash" : ""}`, style: { display: "flex", flexDirection: "column", opacity: disabledIngIds.includes(ing.id) ? 0.42 : 1, transition: "opacity .15s" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(IngredientItem, { ing, onAdd: (ing2) => {
        if (!recipe.find((r) => r.id === ing2.id)) {
          addI(ing2.id);
          flashAdded(ing2.id);
        }
      }, stockKg: stockMap[ing.id] || 0, isCompat, spName: sp?.name }), inPantry && isCompat && /* @__PURE__ */ React.createElement("div", { title: "En bodega y compatible con esta especie", style: { position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", width: 7, height: 7, borderRadius: "50%", background: "var(--moss-500)", boxShadow: "0 0 0 2px var(--paper-50)" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, padding: "4px 4px 6px" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "qa-mini-btn",
          onClick: (e) => {
            e.stopPropagation();
            toggleDisabledIng(ing.id);
          },
          title: disabledIngIds.includes(ing.id) ? "Habilitar para el optimizador" : "Excluir del optimizador",
          "aria-label": disabledIngIds.includes(ing.id) ? `Habilitar ${ing.name} para el optimizador` : `Excluir ${ing.name} del optimizador`,
          style: { width: "clamp(13px,3vw,15px)", height: "clamp(13px,3vw,15px)", borderRadius: "50%", background: disabledIngIds.includes(ing.id) ? "var(--coral-500)" : "var(--border-soft)", color: disabledIngIds.includes(ing.id) ? "var(--paper-0)" : "rgba(26,20,16,.5)", border: "none", cursor: "pointer", fontSize: "clamp(7px,1.5vw,8px)", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }
        },
        disabledIngIds.includes(ing.id) ? "⊘" : "–"
      ), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { width: 1, alignSelf: "stretch", minHeight: 13, background: "var(--border-soft)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "qa-mini-btn",
          onClick: (e) => {
            e.stopPropagation();
            setPantryIds((prev) => inPantry ? prev.filter((x) => x !== ing.id) : [...prev, ing.id]);
          },
          title: inPantry ? "Quitar de bodega" : "Agregar a bodega",
          "aria-label": inPantry ? `Quitar ${ing.name} de bodega` : `Agregar ${ing.name} a bodega`,
          style: { width: "clamp(13px,3vw,15px)", height: "clamp(13px,3vw,15px)", borderRadius: "50%", background: inPantry ? "var(--moss-500)" : "var(--border-soft)", color: inPantry ? "var(--paper-0)" : "rgba(26,20,16,.5)", border: "none", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }
        },
        /* @__PURE__ */ React.createElement(IcoBox, { color: "currentColor", size: 8 })
      ), !inR && /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "qa-mini-btn qa-add-btn" + (justAddedIds.includes(ing.id) ? " qa-pulse" : ""),
          onClick: (e) => {
            e.stopPropagation();
            addI(ing.id);
            flashAdded(ing.id);
          },
          title: "Agregar a receta",
          "aria-label": `Agregar ${ing.name} a la receta`,
          style: { width: "clamp(13px,3vw,15px)", height: "clamp(13px,3vw,15px)", borderRadius: "50%", background: "var(--coral-500)", color: "var(--paper-0)", border: "none", cursor: "pointer", fontSize: "clamp(8px,1.8vw,9px)", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }
        },
        "+"
      )));
    };
    if (!showRoleGroups) {
      return base.map(renderIngRow);
    }
    const ROLE_GROUPS = [
      {
        key: "base_carbono",
        label: "Bases de Carbono",
        icon: IconSeed,
        desc: "Estructura primaria de lignina y celulosa (60–85% de la receta)",
        primary: (g) => g.role === "base_carbono",
        fallback: (g) => g.cat === "base" || g.cn >= 40
      },
      {
        key: "suplemento_n",
        label: "Suplementos Nitrogenados",
        icon: IconNut,
        desc: "Aporte de proteína y arranque micelial (5–20% máx según especie)",
        primary: (g) => g.role === "suplemento_n" || g.role === "suplemento_medio",
        fallback: (g) => g.n >= 1.4
      },
      {
        key: "aditivo",
        label: "Minerales y Tampones de pH",
        icon: IconScale,
        desc: "Estabilizadores de acidez, calcio y estructura (1–4%)",
        primary: (g) => !!g.role?.startsWith("aditivo_"),
        fallback: (g) => g.cat === "adit" || g.cn === 0
      },
      {
        key: "aireador",
        label: "Aireadores y Estructurantes",
        icon: IconWind,
        desc: "Porosidad y difusión de oxígeno gaseoso",
        primary: (g) => g.role === "aireador",
        fallback: (g) => g.cat === "trop" || g.cat === "circ"
      },
      {
        key: "otro",
        label: "Otros Insumos",
        icon: IconSprout,
        desc: "Ingredientes complementarios aún no clasificados en los roles anteriores",
        primary: () => false,
        fallback: () => true
      }
    ];
    const roleAssignment = {};
    ROLE_GROUPS.forEach((grp) => {
      base.forEach((g) => {
        if (!roleAssignment[g.id] && grp.primary(g)) roleAssignment[g.id] = grp.key;
      });
    });
    ROLE_GROUPS.forEach((grp) => {
      base.forEach((g) => {
        if (!roleAssignment[g.id] && grp.fallback(g)) roleAssignment[g.id] = grp.key;
      });
    });
    return ROLE_GROUPS.map((grp) => {
      const grpIngs = base.filter((g) => roleAssignment[g.id] === grp.key);
      if (grpIngs.length === 0) return null;
      const isCollapsed = collapsedRoles[grp.key];
      const compatCount = grpIngs.filter((g) => g.cs && g.cs.includes(sKey)).length;
      return /* @__PURE__ */ React.createElement("section", { key: grp.key, className: `role-group-box${isCollapsed ? " is-collapsed" : ""}` }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "role-group-hdr",
          onClick: () => toggleRoleCollapse(grp.key),
          "aria-expanded": !isCollapsed,
          "aria-controls": `role-group-${grp.key}`
        },
        /* @__PURE__ */ React.createElement("div", { className: "role-group-heading" }, /* @__PURE__ */ React.createElement("span", { className: "role-group-icon", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(grp.icon, { size: 18 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "role-group-title" }, grp.label, " ", /* @__PURE__ */ React.createElement("span", null, "(", grpIngs.length, ")")), /* @__PURE__ */ React.createElement("div", { className: "role-group-desc" }, grp.desc))),
        /* @__PURE__ */ React.createElement("div", { className: "role-group-summary" }, /* @__PURE__ */ React.createElement("span", { className: "role-group-compatible" }, compatCount, " compatible", compatCount === 1 ? "" : "s"), /* @__PURE__ */ React.createElement("span", { className: "role-group-chevron", "aria-hidden": "true" }, "⌄"))
      ), /* @__PURE__ */ React.createElement("div", { id: `role-group-${grp.key}`, className: "role-group-content", hidden: isCollapsed }, grpIngs.map(renderIngRow)));
    });
  })()))), /* @__PURE__ */ React.createElement("div", { className: "builder-right" }, /* @__PURE__ */ React.createElement("header", { className: "form-advanced-tools-head", id: "form-advanced-tools-title" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "ingredient-section-eyebrow" }, "Herramientas avanzadas"), /* @__PURE__ */ React.createElement("h2", null, "Perito + Automejora"), /* @__PURE__ */ React.createElement("p", null, "Diagnóstico profundo, correcciones sugeridas y mejora automática de la fórmula.")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => openBuilderSubTab("generador") }, "Abrir generador")), an && (() => {
    const hasPer = recipe.length > 0;
    const { score, status, items } = hasPer ? opt : { score: 0, status: "sin_receta", items: [] };
    const criticals = items.filter((s) => s.priority === "critical");
    const warnings = items.filter((s) => s.priority === "warning");
    const tips = items.filter((s) => s.priority === "tip");
    const infos = items.filter((s) => s.priority === "info");
    const sm = PERITO_STATUS[status] || PERITO_STATUS.sin_receta;
    const max = 150, oMin = sp?.cn_optimal?.min, oMax = sp?.cn_optimal?.max;
    const cur = sp ? Math.min(an.cn, max) : 0;
    const cnOk = sp && an.cn >= oMin && an.cn <= oMax;
    return /* @__PURE__ */ React.createElement("div", { className: "panel print-panel", id: "bl-perito", style: { background: hasPer ? sm.bg : "var(--paper-50)", border: `1.5px solid ${hasPer ? sm.border : "var(--border-soft)"}`, marginBottom: 12, transition: "background .3s,border-color .3s" } }, hasPer && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${sm.border}40`, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 62, height: 62, borderRadius: "50%", background: sm.badge, flexShrink: 0, transition: "background .3s" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: 24, fontWeight: 900, color: "var(--paper-0)", lineHeight: 1 } }, score), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-micro)", color: "rgba(255,255,255,.7)", letterSpacing: "var(--tracking-button)", marginTop: 1 } }, "SCORE")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: sm.badge, marginBottom: 2 } }, "Perito · Veredicto"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: 20, fontWeight: 800, color: sm.txt, lineHeight: 1, transition: "color .3s" } }, sm.veredicto), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: sm.badge, marginTop: 4, lineHeight: 1.4 } }, sm.accion && /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700 } }, sm.accion), (() => {
      const causa = peritoMainLimiter(opt, an);
      return causa ? /* @__PURE__ */ React.createElement("div", { style: { opacity: 0.8, marginTop: 2 } }, /* @__PURE__ */ React.createElement("b", null, "Causa:"), " ", causa) : null;
    })(), an.trichoderma && /* @__PURE__ */ React.createElement("div", { style: { color: "#C53030", fontWeight: 700, marginTop: 2 } }, "Autoclave 121°C × 90 min obligatorio"), !an.trichoderma && tr && /* @__PURE__ */ React.createElement("div", { style: { opacity: 0.6, marginTop: 2 } }, "Trat.: ", tr.name))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 } }, (criticals.length > 0 || warnings.length > 0) && /* @__PURE__ */ React.createElement("button", { onClick: autoImprove, style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "6px 10px", background: "var(--coral-500)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "✦"), " Auto-mejorar"), recipeHistory.length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: undoLastRec, style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "6px 10px", background: "transparent", color: "var(--ink-600)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M3 7v6h6" }), /* @__PURE__ */ React.createElement("path", { d: "M3 13C5.5 7 12 4 18 7a9 9 0 010 10" })), "Deshacer (", recipeHistory.length, ")"), /* @__PURE__ */ React.createElement("button", { onClick: runFormNextAction, style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "6px 10px", background: "var(--moss-600,var(--accent-olive))", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", whiteSpace: "nowrap" } }, formNextLabel), (status === "needs_work" || status === "critical") && /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setPromptDlg({ title: "Nueva prueba experimental", label: "Nombre de la prueba", placeholder: "ej. Ostra gris — ajuste C:N lote 12", confirmLabel: "Guardar prueba", onSubmit: (nm) => {
        const trSave = calcTreatment(an, sKey, SPP);
        const e = { id: Date.now(), name: nm, sKey, recipe: [...recipe], date: (/* @__PURE__ */ new Date()).toLocaleDateString("es-CO"), eb: an.eb.toFixed(0), cn: an.cn.toFixed(1), score: opt.score, cost: Math.round(an.cost), treatCol: trSave?.col || null, energyCopKg: trSave?.energy?.cop_per_kg_seco || 0 };
        const u = [e, ...saved];
        setSaved(u);
        try {
          localStorage.setItem("setas_v6", JSON.stringify(u));
        } catch (e2) {
        }
        setNoticeDlg({ msg: `Guardada como prueba: ${nm}` });
      } });
    }, style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "6px 10px", background: "transparent", color: sm.badge, border: `1px solid ${sm.border}`, borderRadius: "var(--r-sm)", cursor: "pointer", whiteSpace: "nowrap" } }, "+ Crear prueba"))), /* @__PURE__ */ React.createElement("div", { className: "mgrid", style: { marginBottom: 12 } }, [
      { l: "C:N", v: `${an.cn.toFixed(1)}:1`, ok: sp && an.cn >= sp.cn_optimal.min && an.cn <= sp.cn_optimal.max },
      { l: "Nitrógeno", v: `${an.avgN.toFixed(2)}%`, ok: sp && an.avgN >= sp.n_optimal.min && an.avgN <= sp.n_optimal.max },
      { l: "EB esperada", v: an.ebLow && an.ebHigh ? `${an.ebLow}–${an.ebHigh}%` : `${an.eb.toFixed(0)}%`, ok: an.eb > 100, w: an.eb > 70 && an.eb <= 100 },
      { l: "Costo / kg", v: `$${Math.round(an.cost)}`, ok: an.cost < 800, w: an.cost < 2e3 && an.cost >= 800 },
      { l: "pH estimado", v: an.avgPh?.toFixed(1) || "—", ok: sp && an.avgPh >= sp.ph_optimal?.min && an.avgPh <= sp.ph_optimal?.max, w: false },
      { l: "Digestibilidad", v: `${an.avgDig?.toFixed(1) || "—"}/10`, ok: an.avgDig >= 7, w: an.avgDig >= 4 && an.avgDig < 7 }
    ].map((m) => /* @__PURE__ */ React.createElement("div", { key: m.l, className: "mc" }, /* @__PURE__ */ React.createElement("div", { className: "mlbl" }, m.l), /* @__PURE__ */ React.createElement("div", { className: "mval" }, m.v), /* @__PURE__ */ React.createElement("span", { className: `mbadge ${m.ok ? "bgood" : m.w ? "bwarn" : "bbad"}` }, m.ok ? "Óptimo" : m.w ? "Aceptable" : "Ajustar")))), /* @__PURE__ */ React.createElement(EBDial, { an, sp }), sp && an.cn > 0 && /* @__PURE__ */ React.createElement("div", { className: "gauge-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "gauge-hdr" }, /* @__PURE__ */ React.createElement("span", { className: "gauge-cur" }, "C:N ", an.cn.toFixed(1), ":1"), /* @__PURE__ */ React.createElement("span", { className: "gauge-tgt" }, "objetivo ", oMin, "–", oMax, ":1")), /* @__PURE__ */ React.createElement("div", { className: "gauge-tr" }, /* @__PURE__ */ React.createElement("div", { className: "gauge-zn", style: { left: `${oMin / max * 100}%`, width: `${(oMax - oMin) / max * 100}%` } }), /* @__PURE__ */ React.createElement("div", { className: "gauge-nd", style: { left: `${cur / max * 100}%`, background: cnOk ? "var(--accent-olive)" : an.cn < oMin ? "var(--coral-500)" : "var(--ochre-500,#A07828)" } })), /* @__PURE__ */ React.createElement("div", { className: "gauge-ft" }, /* @__PURE__ */ React.createElement("span", null, "0"), /* @__PURE__ */ React.createElement("span", null, oMin, "–", oMax), /* @__PURE__ */ React.createElement("span", null, "150+"))), /* @__PURE__ */ React.createElement(NitrogenChart, { recipe }), hasPer && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, margin: "10px 0 8px", border: "1px solid rgba(26,20,16,.1)", borderRadius: 6, overflow: "hidden", background: "var(--paper-100)" } }, [
      { l: "Calificación", v: `${opt?.score ?? "—"}/100`, ok: (opt?.score || 0) >= 85, w: (opt?.score || 0) >= 60 },
      { l: "EB estimada", v: an.ebLow && an.ebHigh ? `${an.ebLow}–${an.ebHigh}%` : `${an.eb?.toFixed(0) || "—"}%`, ok: an.eb > 100, w: an.eb > 70 && an.eb <= 100 },
      { l: "Costo / kg", v: `$${Math.round(an.cost || 0).toLocaleString("es-CO")}`, ok: an.cost < 800, w: an.cost < 2e3 && an.cost >= 800 }
    ].map((m, i) => /* @__PURE__ */ React.createElement("div", { key: m.l, style: { flex: 1, padding: "7px 10px", borderLeft: i > 0 ? "1px solid rgba(26,20,16,.08)" : "none", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 2 } }, m.l), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-md)", color: m.ok ? "#3D5A38" : m.w ? "#7A5A10" : "var(--coral-500)", lineHeight: 1 } }, m.v)))), realCostPerKg != null && Math.abs(realCostPerKg - Math.round(an.cost || 0)) >= 20 && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", marginBottom: 8 } }, "Costo real de bodega (precio ponderado de tus lotes): ", /* @__PURE__ */ React.createElement("b", null, "$", realCostPerKg.toLocaleString("es-CO"), "/kg"), " · catálogo: $", Math.round(an.cost || 0).toLocaleString("es-CO"), "/kg"), histStats && histStats.n > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", marginBottom: 8 } }, "Score ajustado con ", histStats.n, " lote", histStats.n !== 1 ? "s" : "", " real", histStats.n !== 1 ? "es" : "", histStats.matched ? " con receta similar" : " de la especie", " (", histStats.subs.join(", "), ") — peso ", Math.round(histStats.weight * 100), "% histórico / ", Math.round((1 - histStats.weight) * 100), "% fórmula"), modelAccuracy != null && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", marginBottom: 8 } }, "Precisión del modelo para ", sp?.name || "esta especie", " en tu bodega: ±", modelAccuracy, "% EB (basado en ", trialsWithReal.length, " prueba", trialsWithReal.length !== 1 ? "s" : "", " con EB real registrado)"), similarTrial && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "#7A5A10", background: "rgba(160,120,40,.08)", border: "1px solid rgba(160,120,40,.2)", borderRadius: 4, padding: "6px 9px", marginBottom: 8 } }, "Ya probaste algo parecido (", /* @__PURE__ */ React.createElement("b", null, Math.round(similarTrial.similarity * 100), "%"), ' de ingredientes en común, "', similarTrial.name, '"): dio ', /* @__PURE__ */ React.createElement("b", null, "EB real ", similarTrial.ebReal, "%"), " (estimado entonces: ", similarTrial.eb, "%)."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } }, criticals.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "3px 9px", background: "rgba(197,48,48,.12)", border: "1px solid rgba(197,48,48,.3)", borderRadius: 3, color: "#C53030", fontWeight: 700 } }, criticals.length, " crítico", criticals.length !== 1 ? "s" : ""), warnings.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "3px 9px", background: "rgba(160,120,40,.1)", border: "1px solid rgba(160,120,40,.25)", borderRadius: 3, color: "#7A5A10", fontWeight: 700 } }, warnings.length, " ajuste", warnings.length !== 1 ? "s" : ""), criticals.length === 0 && warnings.length === 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "3px 9px", background: "rgba(74,107,74,.1)", border: "1px solid rgba(74,107,74,.2)", borderRadius: 3, color: "#3D5A38" } }, "Todos los parámetros en rango"), (an.tot < 97 || an.tot > 103) && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "3px 9px", background: "rgba(197,48,48,.1)", border: "1px solid rgba(197,48,48,.25)", borderRadius: 3, color: "#C53030", fontWeight: 700 } }, "⚠ Total ", an.tot.toFixed(1), "%")), (criticals.length > 0 || warnings.length > 0) && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: sm.badge, padding: "6px 10px", background: "rgba(0,0,0,.04)", borderLeft: `2px solid ${sm.border}`, marginBottom: 8, lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement("b", null, "Aplica una sugerencia a la vez"), " — cada cambio recalcula. Usa ", /* @__PURE__ */ React.createElement("b", null, "✦ Auto-mejorar"), " para automatizar."), criticals.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "#C53030", padding: "5px 10px", background: "rgba(197,48,48,.07)", borderBottom: "1px solid rgba(197,48,48,.2)" } }, "Críticos (", criticals.length, ")"), criticals.map((item, i) => /* @__PURE__ */ React.createElement(PeritoItem, { key: i, item, onApply: applyOptStep, baseScore: opt.score }))), warnings.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", padding: "5px 10px", background: "rgba(160,120,40,.07)", borderBottom: "1px solid rgba(160,120,40,.2)" } }, "Mejoras (", warnings.length, ")"), warnings.map((item, i) => /* @__PURE__ */ React.createElement(PeritoItem, { key: i, item, onApply: applyOptStep, baseScore: opt.score }))), tips.length > 0 && /* @__PURE__ */ React.createElement("details", { open: true, style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("summary", { style: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-sm)", padding: "5px 10px", background: "rgba(74,107,74,.05)", borderBottom: "1px solid rgba(74,107,74,.15)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", null, "Opcionales (", tips.length, ")"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-xs)" } }, "▾")), tips.map((item, i) => /* @__PURE__ */ React.createElement(PeritoItem, { key: i, item, onApply: applyOptStep, baseScore: opt.score }))), infos.map((item, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 8, padding: "7px 12px", background: "rgba(74,90,58,.06)", borderTop: "1px solid rgba(74,90,58,.12)", alignItems: "flex-start", marginTop: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: item.color, flexShrink: 0 } }, item.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, color: item.color, marginRight: 6 } }, item.label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-sm)", color: "var(--ink-500)", fontFamily: "var(--font-mono)" } }, item.action))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("button", { className: `tog${showFlush ? " on" : ""}`, "aria-pressed": showFlush, onClick: () => setShowFlush(!showFlush) }, "Cosechas"), /* @__PURE__ */ React.createElement("button", { className: `tog${showCompChart ? " on" : ""}`, "aria-pressed": showCompChart, onClick: () => setShowCompChart(!showCompChart) }, "Composición"), /* @__PURE__ */ React.createElement("button", { className: `tog${showSpeciesRec ? " on" : ""}`, "aria-pressed": showSpeciesRec, onClick: () => setShowSpeciesRec(!showSpeciesRec) }, "Compat. especies")), showFlush && /* @__PURE__ */ React.createElement(FlushChart, { an }), showCompChart && /* @__PURE__ */ React.createElement(CompositionChart, { recipe }), showSpeciesRec && /* @__PURE__ */ React.createElement(SpeciesRecommender, { recipe }), /* @__PURE__ */ React.createElement("div", { className: "dbox", style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "dttl" }, "Evaluación"), /* @__PURE__ */ React.createElement("div", { className: "dtxt" }, dg.main)), dg.sugs.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "sec", style: { marginTop: 8 } }, "A considerar"), dg.sugs.map((s2, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `sug ${s2.t}` }, /* @__PURE__ */ React.createElement("span", { className: "sug-mark" }, s2.t === "success" ? "Ok" : s2.t === "error" ? "Rev" : "—"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)" } }, s2.i), /* @__PURE__ */ React.createElement("span", null, s2.t === "warning" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-400)", fontStyle: "italic" } }, "Podrías considerar — "), s2.tx) : s2.tx)))));
  })(), /* @__PURE__ */ React.createElement(RecipeGauges, { an, sp, optimalAn, historical: histStats }), recipe.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "panel panel-accent", id: "bl-receta-summary" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid rgba(26,20,16,.12)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "var(--ink-900)", lineHeight: 1 } }, "Puntaje y lote"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)", fontWeight: 400 } }, "(", recipe.length, ")"))), an && an.sp && opt?.score > 0 && (() => {
    const sc = opt.score;
    const col = sc >= 80 ? "var(--moss-500)" : sc >= 60 ? "var(--ochre-500,#A07828)" : "var(--coral-500)";
    const bg = sc >= 80 ? "#F2F5EE" : sc >= 60 ? "#FBF6E8" : "#F9EDEA";
    const lbl = sc >= 85 ? "Óptima" : sc >= 70 ? "Muy buena" : sc >= 55 ? "Aceptable" : sc >= 40 ? "Mejorable" : "Deficiente";
    return /* @__PURE__ */ React.createElement("div", { style: { background: bg, border: `1px solid ${col}`, borderLeft: `4px solid ${col}`, padding: "12px 14px 10px", marginTop: 3, transition: "background-color .4s ease,border-color .4s ease,color .4s ease" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", fontWeight: 800, marginBottom: 2 } }, "Score de receta"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontStyle: "italic", color: col, lineHeight: 1, transition: "color .4s" } }, lbl)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 400, lineHeight: 1, color: col, letterSpacing: "var(--tracking-tight)", transition: "background-color .4s ease,border-color .4s ease,color .4s ease" } }, sc), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-400)", fontWeight: 600, marginBottom: 4 } }, "/100"))), /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "rgba(26,20,16,0.08)", borderRadius: 2, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${sc}%`, background: col, borderRadius: 2, transition: "width .6s cubic-bezier(.32,.72,.36,1)" } })));
  })(), an && an.sp && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "10px 0 4px" } }, [
    { label: "C:N", val: an.cn, min: an.sp.cn_optimal.min, max: an.sp.cn_optimal.max, ideal: an.sp.cn_optimal.ideal, fmt: (v) => `${v.toFixed(1)}:1`, scale: Math.max(an.sp.cn_optimal.max * 1.5, an.cn * 1.1 || 1) },
    { label: "N%", val: an.avgN, min: an.sp.n_optimal.min, max: an.sp.n_optimal.max, ideal: an.sp.n_optimal.ideal, fmt: (v) => `${v.toFixed(2)}%`, scale: Math.max(an.sp.n_optimal.max * 1.5, an.avgN * 1.1 || 1) }
  ].map((m) => {
    const inRange = m.val >= m.min && m.val <= m.max;
    const pct = Math.min(100, m.val / m.scale * 100);
    const idealPct = m.ideal / m.scale * 100;
    const minPct = m.min / m.scale * 100;
    const maxPct = m.max / m.scale * 100;
    const barColor = inRange ? "var(--moss-500)" : m.val < m.min ? "var(--coral-500)" : "#d4a04a";
    return /* @__PURE__ */ React.createElement("div", { key: m.label, style: { background: "var(--paper-100)", border: "1px solid var(--border-soft)", padding: "8px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-button)", color: "var(--ink-700)", fontWeight: 700 } }, m.label), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-md)", color: barColor, fontWeight: 600 } }, m.fmt(m.val))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: 6, background: "#e0dbd3", borderRadius: 3 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: `${minPct}%`, width: `${maxPct - minPct}%`, height: "100%", background: "rgba(77,98,53,.2)", borderRadius: 3 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: `${idealPct}%`, width: 2, height: "160%", top: "-30%", background: "rgba(77,98,53,.5)", borderRadius: 1 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, width: `${pct}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width .3s" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 3, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("span", null, m.fmt(m.min)), /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.7 } }, "↑", m.fmt(m.ideal)), /* @__PURE__ */ React.createElement("span", null, m.fmt(m.max))));
  })), recipe.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bwrap", id: "bl-batch" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 } }, /* @__PURE__ */ React.createElement("div", { className: "sec", style: { marginBottom: 0, borderBottom: "none" } }, "Batch"), /* @__PURE__ */ React.createElement("button", { className: `tog${showBatch ? " on" : ""}`, "aria-pressed": showBatch, onClick: () => setShowBatch(!showBatch) }, showBatch ? "Ocultar" : "Calcular")), /* @__PURE__ */ React.createElement("div", { className: "bgrid", style: { gridTemplateColumns: "1fr 1fr 1fr 1fr" } }, /* @__PURE__ */ React.createElement("div", { className: "bf" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "bf-numbags" }, "Nº bolsas"), /* @__PURE__ */ React.createElement("input", { id: "bf-numbags", type: "number", min: "1", max: "500", inputMode: "numeric", required: true, value: numBags, onChange: (e) => setNumBags(parseInt(e.target.value) || 1) })), /* @__PURE__ */ React.createElement("div", { className: "bf" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "bf-kgbag" }, "kg / bolsa"), /* @__PURE__ */ React.createElement("input", { id: "bf-kgbag", type: "number", min: ".5", max: "5", step: ".1", inputMode: "decimal", required: true, value: kgBag, onChange: (e) => setKgBag(parseFloat(e.target.value) || 1) })), /* @__PURE__ */ React.createElement("div", { className: "bf" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "bf-hobj" }, "Humedad obj. % △"), /* @__PURE__ */ React.createElement("input", { id: "bf-hobj", type: "number", min: "55", max: "80", inputMode: "numeric", required: true, value: hObj, onChange: (e) => setHObj(parseInt(e.target.value) || 67), style: { borderColor: hObj >= 67 ? "var(--moss-500)" : "var(--coral-500)" } })), /* @__PURE__ */ React.createElement("div", { className: "bf" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "bf-spawncost" }, "Costo spawn ($/kg)"), /* @__PURE__ */ React.createElement("input", { id: "bf-spawncost", type: "number", min: "0", step: "1000", inputMode: "numeric", required: true, value: spawnCost, onChange: (e) => setSpawnCost(parseInt(e.target.value) || 0) })), /* @__PURE__ */ React.createElement("div", { className: "bf" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "bf-vegprice" }, "Precio venta ($/kg )"), /* @__PURE__ */ React.createElement("input", { id: "bf-vegprice", type: "number", min: "0", step: "1000", inputMode: "numeric", required: true, value: vegPrice, onChange: (e) => setVegPrice(parseInt(e.target.value) || 0) })), /* @__PURE__ */ React.createElement("div", { className: "bf" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "bf-total" }, "Total"), /* @__PURE__ */ React.createElement("input", { id: "bf-total", readOnly: true, value: `${(numBags * kgBag).toFixed(1)} kg`, style: { fontWeight: 700, color: "var(--coral-500)" } }))), showBatch && bd && /* @__PURE__ */ React.createElement("div", null, bd.items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "brow" }, /* @__PURE__ */ React.createElement("span", { className: "bn" }, it.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 11, alignItems: "center" } }, it.cost > 0 && /* @__PURE__ */ React.createElement("span", { className: "bc" }, "$", Math.round(it.cost).toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "bq" }, it.unit)))), /* @__PURE__ */ React.createElement("div", { className: "brow", style: { borderTop: "2px solid var(--border-soft)", marginTop: 4, paddingTop: 8 } }, /* @__PURE__ */ React.createElement("span", { className: "bn", style: { color: "#2A5078", fontWeight: 600 } }, " Agua a agregar (obj. ", bd.hObj, "%)"), /* @__PURE__ */ React.createElement("span", { className: "bq", style: { background: "#E8F2FA", border: "1px solid #9AC0D8", color: "#2A5078" } }, bd.agua.toFixed(2), " L")), /* @__PURE__ */ React.createElement("div", { className: "brow", style: { borderTop: "1px solid var(--paper-300)", marginTop: 4, paddingTop: 8 } }, /* @__PURE__ */ React.createElement("span", { className: "bn" }, " Spawn (", an?.dynSpawn || 8, "% · ", bd.spawn.toFixed(2), " kg)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { className: "bc" }, "$", Math.round(bd.spawnCostTotal).toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "bq", style: { background: "#E8F5E8", border: "1px solid #7AB87A", color: "#2A5A2A" } }, bd.spawn.toFixed(2), " kg"))), /* @__PURE__ */ React.createElement("div", { className: "btots", style: { gridTemplateColumns: "repeat(4,1fr)" } }, /* @__PURE__ */ React.createElement("div", { className: "btot" }, /* @__PURE__ */ React.createElement("div", { className: "bv" }, bd.wet.toFixed(1), " kg"), /* @__PURE__ */ React.createElement("div", { className: "bl" }, "Sustrato")), /* @__PURE__ */ React.createElement("div", { className: "btot" }, /* @__PURE__ */ React.createElement("div", { className: "bv" }, "$", Math.round(bd.cost).toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "bl" }, "Insumos")), /* @__PURE__ */ React.createElement("div", { className: "btot" }, /* @__PURE__ */ React.createElement("div", { className: "bv" }, "$", Math.round(bd.spawnCostTotal).toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "bl" }, "Spawn")), /* @__PURE__ */ React.createElement("div", { className: "btot", style: { background: "var(--coral-500)" } }, /* @__PURE__ */ React.createElement("div", { className: "bv" }, "$", Math.round(bd.totalCost).toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "bl" }, "Total COP"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: "8px 12px", border: "1px solid var(--border-soft)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-button)", color: "var(--ink-500)", marginBottom: 3 } }, "Costo por bolsa"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 22, fontWeight: 600, color: "var(--coral-500)" } }, "$", Math.round(bd.costPerBag).toLocaleString())), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-100)", padding: "8px 12px", border: "1px solid var(--border-soft)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-button)", color: "var(--ink-500)", marginBottom: 3 } }, "Costo / kg sustrato"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 22, fontWeight: 600, color: "var(--coral-500)" } }, "$", Math.round(bd.cost / bd.wet).toLocaleString()))), vegPrice > 0 && an && an.eb > 0 && (() => {
    const yieldKg = bd.dry * (an.eb / 100);
    const revenue = yieldKg * vegPrice;
    const margin = revenue - bd.totalCost;
    const marginPct = revenue > 0 ? (margin / revenue * 100).toFixed(1) : 0;
    const positive = margin >= 0;
    return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, border: `1px solid ${positive ? "var(--moss-500)" : "var(--coral-500)"}`, background: positive ? "#F2F5EE" : "#F9EDEA" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", borderBottom: `1px solid ${positive ? "var(--moss-500)" : "var(--coral-500)"}`, fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: positive ? "var(--moss-500)" : "var(--coral-500)" } }, "Proyección de ingresos · EB ", an.eb.toFixed(0), "%"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: positive ? "var(--moss-500)" : "var(--coral-500)" } }, [
      { l: "Cosecha est.", v: `${yieldKg.toFixed(1)} kg` },
      { l: "Ingresos brutos", v: `$${Math.round(revenue).toLocaleString()}` },
      { l: `Margen ${marginPct}%`, v: `$${Math.round(margin).toLocaleString()}`, bold: true, good: positive }
    ].map((cell, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "var(--paper-50)", padding: "10px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 4 } }, cell.l), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 20, fontWeight: 600, color: cell.bold ? cell.good ? "var(--moss-500)" : "var(--coral-500)" : "var(--ink-900)" } }, cell.v)))), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 12px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", fontWeight: 500 } }, "Precio venta $", vegPrice.toLocaleString(), "/kg · Costo total $", Math.round(bd.totalCost).toLocaleString(), " COP · Sin contar labor ni servicios · EB sobre materia seca ($", bd.dry.toFixed(1), " kg de $", bd.wet.toFixed(1), " kg húmedos)."));
  })(), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border-soft)", display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn-launch-prod",
      onClick: openProdLauncher,
      disabled: !readyForProduction,
      title: readyForProduction ? `Lanzar producción de ${numBags} bolsas de ${kgBag} kg con descuento automático de inventario` : productionBlockMsg
    },
    "🚀 Lanzar Producción de Lote (",
    numBags,
    " bolsas · ",
    (numBags * kgBag).toFixed(1),
    " kg)"
  )))), recipe.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "act-row no-print" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => window.print() }, "Imprimir ficha"), /* @__PURE__ */ React.createElement("button", { className: "btn pri", onClick: exportR }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "↓"), " Exportar .txt"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
    if (typeof html2pdf === "undefined") {
      setNoticeDlg({ msg: "html2pdf no disponible." });
      return;
    }
    const el = document.querySelector(".print-panel");
    if (!el) {
      setNoticeDlg({ msg: "Genera análisis primero." });
      return;
    }
    html2pdf().set({ margin: 10, filename: `receta_${sKey}_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`, html2canvas: { scale: 2 }, jsPDF: { format: "a4", orientation: "portrait" } }).from(el).save();
  } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "↓"), " PDF"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
    if (!recipe.length) {
      setNoticeDlg({ msg: "No hay receta." });
      return;
    }
    const p = { version: "1.0", exportedAt: (/* @__PURE__ */ new Date()).toISOString(), especie: { key: sKey, nombre: an?.sp?.name }, receta: recipe.map((r) => {
      const g = INGS.find((i) => i.id === r.id);
      return { id: r.id, nombre: g?.name, porcentaje: r.p };
    }), analisis: an ? { cn: an.cn, n: an.avgN, eb: an.eb, costo: an.cost, score: opt.score } : null, tratamiento: tr ? { metodo: tr.name, temp: tr.temp, tiempo: tr.time } : null };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }));
    a.download = `receta_${sKey}_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
  } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "↓"), " JSON"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const p = JSON.parse(ev.target.result);
          if (p.receta && p.especie) {
            const apply = () => {
              if (p.especie.key && SPP[p.especie.key]) setSKey(p.especie.key);
              setRecipe(p.receta.map((r) => ({ id: r.id, p: r.porcentaje })));
            };
            if (recipe.length > 0) {
              setConfirmDlg({ title: "Reemplazar receta activa", msg: `¿Reemplazar la receta actual con "${p.especie.nombre || p.especie.key}"?`, onConfirm: apply });
            } else apply();
          } else {
            setNoticeDlg({ msg: "JSON inválido — no contiene los campos receta/especie." });
          }
        } catch (err) {
          setNoticeDlg({ msg: "Error al leer el archivo JSON. Verifica que sea un archivo exportado desde el simulador." });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "↑"), " Importar")), recipe.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sbar" }, /* @__PURE__ */ React.createElement("input", { name: "recipeName", "aria-label": "Nombre de la receta", autoComplete: "off", placeholder: "Nombre de la receta…", value: saveName, onChange: (e) => setSaveName(e.target.value), onKeyDown: (e) => e.key === "Enter" && saveR(), maxLength: 60 }), /* @__PURE__ */ React.createElement("button", { className: `sbtn${flash ? " fl" : ""}`, onClick: saveR, disabled: !saveName.trim() || !readyForProduction, title: readyForProduction ? "" : productionBlockMsg }, flash ? "✓ Guardada" : "Guardar"), recipe.length > 0 && an && /* @__PURE__ */ React.createElement("button", { className: "btn-launch-prod", type: "button", onClick: openProdLauncher, disabled: !readyForProduction, title: readyForProduction ? "Lanzar producción de lote con descuento en bodega y asignación de sala" : productionBlockMsg, style: { padding: "7px 14px", fontSize: "12px" } }, "🚀 Lanzar Lote"), saveSyncErr && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "#C53030" }, title: saveSyncErr }, "⚠ sin sincronizar")), !readyForProduction && /* @__PURE__ */ React.createElement("div", { role: "status", "aria-live": "polite", style: { marginTop: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "#C53030" } }, /* @__PURE__ */ React.createElement("span", null, "⚠ ", productionBlockMsg), !balanced && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: autoImprove, style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", padding: "5px 10px", background: "var(--coral-500)", color: "#fff", border: "none", cursor: "pointer" } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "✦"), " Auto-mejorar")))))), tab === "formular" && tr && recipe.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "panel treatment-section", id: "bl-tratamiento" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 13, borderBottom: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("div", { className: "sec", style: { marginBottom: 0, borderBottom: "none" } }, "Tratamiento recomendado"), /* @__PURE__ */ React.createElement("button", { className: `tog${showGuide ? " on" : ""}`, "aria-pressed": showGuide, onClick: () => setShowGuide(!showGuide) }, showGuide ? "Ocultar guía" : "Ver guía paso a paso")), /* @__PURE__ */ React.createElement("div", { className: `tcard ${tr.col}` }, /* @__PURE__ */ React.createElement("div", { className: "tttl" }, tr.name), /* @__PURE__ */ React.createElement("div", { className: "tparams" }, [tr.temp, tr.time, `Spawn ${tr.spawn}%`].map((p, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "tp" }, p))), /* @__PURE__ */ React.createElement("div", { className: "twhy" }, tr.reasons.map((r, i) => /* @__PURE__ */ React.createElement("span", { key: i }, r))), /* @__PURE__ */ React.createElement("div", { className: "tproc" }, tr.prep), tr.alt && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, fontSize: "var(--text-sm)", color: "var(--ink-500)", background: "var(--paper-200)", border: "1px solid var(--paper-300)", padding: "6px 10px", borderLeft: "2px solid var(--border-soft)" } }, tr.alt), tr.energy && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", gap: 12, alignItems: "center", padding: "7px 10px", background: "rgba(0,0,0,.04)", borderRadius: "var(--r-xs)", borderTop: "1px solid rgba(0,0,0,.08)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-md)" } }, "⚡"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700 } }, tr.energy.cop_per_kg_humedo > 0 ? `Consumo eléctrico estimado: ${tr.energy.kwh_per_kg} kWh/kg húmedo · $${tr.energy.cop_per_kg_humedo.toLocaleString("es-CO")} COP/kg húmedo · $${(tr.energy.cop_per_kg_seco || 0).toLocaleString("es-CO")} COP/kg seco` : "Sin consumo eléctrico — proceso en frío"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", opacity: 0.7, marginTop: 2 } }, tr.energy.detalle)), an && an.cost > 0 && tr.energy.cop_per_kg_seco > 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-md)", fontWeight: 700 } }, "$", (Math.round(an.cost) + tr.energy.cop_per_kg_seco).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", opacity: 0.7 } }, "COP/kg total")))), showGuide && /* @__PURE__ */ React.createElement(PasteGuide, { tr, recipe, numBags, kgBag })), /* @__PURE__ */ React.createElement("div", { className: "panel rec-panel", style: { display: "none" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(26,20,16,.1)" } }, /* @__PURE__ */ React.createElement("div", { className: "sec", style: { marginBottom: 0, borderBottom: "none" } }, "Recetario ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)", fontWeight: 400 } }, "(", saved.length, ")"))), showSaved && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 0 } }, saved.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "sempty" }, "Sin recetas en el recetario aún.") : /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 15, top: 0, bottom: 0, width: "1px", background: "var(--border-soft)", opacity: 0 } }), saved.map((e, idx) => {
    const s2 = SPP[e.sKey];
    const isEven = idx % 2 === 0;
    return /* @__PURE__ */ React.createElement("div", { key: e.id, style: { display: "flex", alignItems: "flex-start", marginBottom: 20, paddingLeft: 40 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 8, top: 6, width: 14, height: 14, background: "var(--coral-500)", border: "2px solid var(--paper-50)", borderRadius: "50%", zIndex: "var(--z-sticky)" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink-900)", marginBottom: 2 } }, e.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", background: "var(--paper-200)", padding: "2px 7px", borderRadius: 3, fontWeight: 600 } }, s2?.name), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", fontWeight: 600 } }, "C:N ", e.cn, ":1"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: e.eb >= 100 ? "var(--accent-olive)" : e.eb >= 70 ? "var(--ochre-500,#A07828)" : "#C53030" } }, "EB estimada ", e.eb, "%"), e.ebReal != null && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: Math.abs(e.ebReal - parseFloat(e.eb)) <= 10 ? "var(--accent-olive)" : "#C53030" } }, "EB real ", e.ebReal, "% (", e.ebReal >= parseFloat(e.eb) ? "+" : "", Math.round((e.ebReal - parseFloat(e.eb)) * 10) / 10, ")"), liveScoreFor(e) > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--coral-500)", fontWeight: 600 } }, "Score ", liveScoreFor(e), "/100"), e.cost && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", fontWeight: 500 } }, "$", e.cost, "/kg")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", fontWeight: 500 } }, e.date), /* @__PURE__ */ React.createElement("button", { className: "sload", onClick: () => loadR(e), style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 8px", background: "var(--moss-700)", color: "var(--paper-0)", border: "none", borderRadius: "var(--r-xs)", cursor: "pointer" } }, "Cargar"), /* @__PURE__ */ React.createElement("button", { className: "sebreal", onClick: () => setEbRealFor(e.id), style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 8px", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--paper-300)", borderRadius: "var(--r-xs)", cursor: "pointer" } }, e.ebReal != null ? "Editar EB real" : "+ EB real"), /* @__PURE__ */ React.createElement("button", { className: "sdel", onClick: () => delR(e.id), style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 8px", background: "transparent", color: "var(--coral-500)", border: "1px solid var(--coral-200)", borderRadius: "var(--r-xs)", cursor: "pointer" } }, "Eliminar"))));
  }))))), tab === "formular" && builderSubTab === "generador" && /* @__PURE__ */ React.createElement("div", { id: "formular-panel-generador", className: "formular-workspace", role: "tabpanel", "aria-labelledby": "formular-tab-generador" }, /* @__PURE__ */ React.createElement("div", { id: "gen-panel", className: "panel opt-panel", "aria-labelledby": "gen-panel-title", style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(26,20,16,.1)", position: "sticky", top: 0, zIndex: "var(--z-sticky-panel)", background: "var(--paper-50,#fff)" } }, /* @__PURE__ */ React.createElement("div", { className: "sec", id: "gen-panel-title", style: { marginBottom: 0, borderBottom: "none" } }, "Automejora · Generador de recetas"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "tog", onClick: () => openBuilderSubTab("formular") }, "← Mesa de Mezcla"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "tog", "aria-pressed": showOptimizer, onClick: () => setShowOptimizer((s) => !s) }, showOptimizer ? "Ocultar" : "Mostrar"))), showOptimizer && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "seg-row", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("button", { className: "seg" + (formularMode === "auto" ? " on" : ""), "aria-pressed": formularMode === "auto", onClick: () => setFormularMode("auto") }, "Automática"), /* @__PURE__ */ React.createElement("button", { className: "seg" + (formularMode === "manual" ? " on" : ""), "aria-pressed": formularMode === "manual", onClick: () => setFormularMode("manual") }, "Por objetivo C:N")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--paper-300)" } }, formularMode === "auto" ? "Genera combinaciones base×suplemento óptimas para tu especie — desde tu bodega o toda la paleta." : "Elige dos ingredientes y un C:N objetivo. El sistema calcula las proporciones exactas."), formularMode === "auto" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid var(--ink-900)", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 4 } }, "Especie objetivo"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-md)", color: "var(--ink-900)", padding: "2px 0" } }, SPP[optTarget]?.name)), /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid var(--ink-900)", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "opt-max-cost", style: { display: "block", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 4 } }, "Costo máximo por kg"), /* @__PURE__ */ React.createElement(
    "input",
    {
      id: "opt-max-cost",
      name: "optimizerMaxCost",
      type: "number",
      inputMode: "numeric",
      min: "0",
      step: "100",
      value: optMaxCost || "",
      onChange: (e) => setOptMaxCost(parseInt(e.target.value) || 0),
      autoComplete: "off",
      "aria-describedby": "opt-max-cost-help",
      style: { width: "100%", border: "none", background: "transparent", fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink-900)", padding: "2px 0" },
      placeholder: "Sin límite"
    }
  ), /* @__PURE__ */ React.createElement("span", { id: "opt-max-cost-help", className: "sr-only" }, "Deja el campo vacío para no aplicar un límite de costo."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", position: "sticky", top: 0, zIndex: "var(--z-sticky)", background: "var(--paper-50,#fff)", padding: "10px 0 10px", borderBottom: "1px solid var(--border-soft)", marginLeft: 0, marginRight: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--ink-500)" } }, "Nivel"), /* @__PURE__ */ React.createElement("div", { className: "chip-row" }, Object.entries(OPT_PROFILES).map(([k, p]) => /* @__PURE__ */ React.createElement("button", { key: k, className: "chip" + (optProfile === k ? " on" : ""), "aria-pressed": optProfile === k, style: optProfile === k ? { color: p.color, borderBottomColor: p.color } : void 0, onClick: () => setOptProfile(k) }, p.label)))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn dark",
      onClick: () => {
        setOptRunning(true);
        setOptResults(null);
        setTimeout(() => {
          let noStock = false;
          let _diag = null;
          const byProfile = {};
          Object.keys(OPT_PROFILES).forEach((pk) => {
            try {
              const out = runHybridRecipeSearch({
                targetKey: optTarget,
                recipe: [],
                invLotes,
                maxCost: optMaxCost,
                ingredients: optimizerINGS,
                useStock: optUseStock,
                profileKey: pk,
                stockMap
              });
              noStock = noStock || !!out.noStock;
              byProfile[pk] = (out.ranked || []).slice(0, 12).map(
                (c) => hybridOptimizerRow(c, optTarget, optimizerINGS, stockMap, pk)
              );
              const diag = hybridOptimizerDiag(out, optTarget, optimizerINGS, optUseStock, invLotes, pk);
              const stockCount = diag.stockIds;
              byProfile[`_diag_${pk}`] = { stockCount, diag };
              if (pk === optProfile) _diag = { stockCount, diag };
            } catch (e) {
              byProfile[pk] = [];
              const diag = { error: e.message || String(e), profileKey: pk, targetKey: optTarget };
              byProfile[`_diag_${pk}`] = { stockCount: 0, diag };
              if (pk === optProfile) _diag = { stockCount: 0, diag };
            }
          });
          setOptResults({ ...byProfile, noStock, _diag });
          setOptRunning(false);
        }, 50);
      },
      style: { marginLeft: "auto", flex: "none", minWidth: 0, padding: "6px 16px" }
    },
    optRunning ? /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "spin" }, "↻"), " …") : "Calcular"
  )), optUseStock ? (() => {
    const sc = [...new Set(invLotes.filter((l) => l.activo && l.cantidadKgDisponible > 0).map((l) => l.ingredienteId))].length;
    return sc > 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", background: "var(--moss-50,#F0F4EB)", border: "1px solid var(--moss-300,#B8C9A0)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--moss-700,var(--accent-olive))", marginBottom: 12 } }, "Usando solo ingredientes en stock · ", sc, " disponibles en inventario") : /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px", background: "#FBF6E8", border: "1px solid #D4A838", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "#7A5A10", marginBottom: 12 } }, "Inventario vacío. Cambia a ", /* @__PURE__ */ React.createElement("strong", null, "Paleta completa"), " para generar recetas con toda la paleta, o registra compras en Inventario.");
  })() : /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", background: "var(--coral-50,#FCEEE9)", border: "1px solid var(--coral-300,#E8B4A0)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--coral-600,#B5451F)", marginBottom: 12 } }, "Generando con toda la paleta compatible con ", SPP[optTarget]?.name, " · ignora inventario · ideal para diseñar la receta antes de comprar"), optResults && optResults[optProfile] && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border-soft)" } }, optResults[optProfile].length, " combinaciones exclusivas · perfil ", /* @__PURE__ */ React.createElement("b", null, OPT_PROFILES[optProfile]?.label), " · ", optUseStock ? "solo stock" : "paleta completa", " · C:N objetivo ", SPP[optTarget]?.cn_optimal.ideal, ":1"), optResults[optProfile].map((r, i) => {
    const mainIngs = r.recipe.map((x) => {
      const g = INGS.find((ing) => ing.id === x.id);
      return g ? `${g.name} ${x.p}%` : x.id;
    }).filter(Boolean);
    const baseSig = r.recipe.map((x) => x.id).filter((id) => {
      const g = INGS.find((ing) => ing.id === id);
      return g && g.role === "base_carbono";
    }).sort().join("+");
    return /* @__PURE__ */ React.createElement("div", { key: i, className: "opt-result", "data-result-id": i, "data-base-signature": baseSig }, /* @__PURE__ */ React.createElement("div", { className: "opt-result-head" }, /* @__PURE__ */ React.createElement("div", { className: "opt-rank" }, "#", i + 1), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "opt-score" }, r.score), /* @__PURE__ */ React.createElement("div", { className: "opt-score-lbl" }, "SCORE")), /* @__PURE__ */ React.createElement("div", { className: "opt-pills", style: { flex: 1 } }, mainIngs.map((s, j) => /* @__PURE__ */ React.createElement("span", { key: j, className: "opt-pill" }, s)), r.suppOverLimit && /* @__PURE__ */ React.createElement("span", { className: "opt-pill", style: { background: "var(--status-attention-bg)", borderColor: "var(--status-attention)", color: "var(--status-attention)" } }, "⚠ Supl. ", r.suppPct.toFixed(0), "% > límite")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { className: "opt-load", onClick: () => {
      setSKey(optTarget);
      setRecipe(r.recipe);
      setLockedIds([]);
      openBuilderSubTab("formular");
      goTab("formular");
      setLoadedFlash(true);
      setTimeout(() => setLoadedFlash(false), 2200);
    } }, "🥣 Cargar en Mesa"), /* @__PURE__ */ React.createElement("button", { className: "opt-load", style: { background: "var(--moss-600,var(--accent-olive))", borderColor: "var(--moss-700,var(--accent-olive))" }, onClick: () => {
      setSKey(optTarget);
      setRecipe(r.recipe);
      setLockedIds([]);
      goTab("produccion");
    } }, "Producir"))), /* @__PURE__ */ React.createElement("div", { className: "opt-metrics" }, (() => {
      const tOpt = calcTreatment(r.an, optTarget, SPP);
      const eCost = tOpt?.energy?.cop_per_kg_seco || 0;
      const totalCost = Math.round(r.an.cost) + eCost;
      return [
        { l: "C:N", v: `${r.an.cn.toFixed(1)}:1` },
        { l: "N%", v: `${r.an.avgN.toFixed(2)}%` },
        { l: "EB", v: r.an.ebLow && r.an.ebHigh ? `${r.an.ebLow}–${r.an.ebHigh}%` : `${r.an.eb.toFixed(0)}%` },
        {
          l: "Costo total/kg",
          v: totalCost > 0 ? `${totalCost.toLocaleString("es-CO")}` : "--",
          sub: eCost > 0 ? `ing ${Math.round(r.an.cost).toLocaleString()}+proc ${eCost.toLocaleString()}` : null
        }
      ];
    })().map((m) => /* @__PURE__ */ React.createElement("div", { key: m.l, className: "opt-met" }, /* @__PURE__ */ React.createElement("div", { className: "opt-met-lbl" }, m.l), /* @__PURE__ */ React.createElement("div", { className: "opt-met-val", style: { fontSize: m.v && m.v.length > 6 ? 14 : 18 } }, m.v), m.sub && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--ink-500)", lineHeight: 1.3, marginTop: 1 } }, m.sub)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, background: "var(--paper-100)", borderTop: "1px solid var(--border-soft)" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "7px 10px", borderRight: "1px solid var(--border-soft)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-600)", marginBottom: 2 } }, "Riesgo"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: r.riskScore >= 80 ? "var(--accent-olive)" : r.riskScore >= 55 ? "var(--ochre-500,#A07828)" : "#C53030" } }, r.riskScore ?? "—", "/100")), r.maxKgWet != null && /* @__PURE__ */ React.createElement("div", { style: { flex: 2, padding: "7px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-600)", marginBottom: 2 } }, "Bodega produce"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--slate-700,var(--accent-blue-grey))" } }, r.maxKgWet > 0 ? `hasta ${r.maxKgWet} kg húmedos` : "stock insuficiente"))), r.an.cost > 0 && (() => {
      const tOpt2 = calcTreatment(r.an, optTarget, SPP);
      const eCost2 = tOpt2?.energy?.cop_per_kg_seco || 0;
      const bags = [
        { nom: "Bolsa 20×50", kgH: 1.8 },
        { nom: "Bolsa 18×35", kgH: 1 },
        { nom: "Punch bag", kgH: 3.5 }
      ];
      const hFactor = optTarget.includes("shiitake") || optTarget.includes("lions") || optTarget.includes("reishi") ? 0.4 : 0.35;
      return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, borderTop: "1px solid var(--border-soft)", borderBottom: "none" } }, bags.map((b) => {
        const kgSeco = b.kgH * hFactor;
        const costBolsa = Math.round((r.an.cost + eCost2) * kgSeco);
        return /* @__PURE__ */ React.createElement("div", { key: b.nom, style: { flex: 1, padding: "5px 8px", borderRight: "1px solid var(--border-soft)", textAlign: "center", background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-700)", marginBottom: 2, letterSpacing: "var(--tracking-label)", fontWeight: 600 } }, b.nom), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-base)", color: "var(--coral-700)", fontWeight: 700 } }, "$", costBolsa.toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", fontWeight: 500 } }, "COP / bolsa"));
      }));
    })(), (() => {
      const t = calcTreatment(r.an, optTarget, SPP);
      if (!t) return null;
      const tc = t.col === "autoclave" ? { bg: "#FCEEE9", br: "#E8B4A0", fg: "#B5451F", lbl: "Autoclave 121°C / 18.5–19 PSI" } : t.col === "thermal" ? { bg: "var(--status-attention-bg)", br: "var(--status-attention)", fg: "var(--status-attention)", lbl: "Pasteurización 65–75°C núcleo" } : { bg: "#EEF3EA", br: "#90A870", fg: "#3D5520", icon: "❄", lbl: "CWLP — Cal en Frío pH≥12" };
      return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 14px", background: tc.bg, borderTop: `1px solid ${tc.br}` } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: tc.fg, fontWeight: 700 } }, tc.icon, " ", tc.lbl, " · ", t.time.split("(")[0].trim()), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: tc.fg, opacity: 0.8 } }, "Spawn ", t.spawn, "%"));
    })());
  })), !optRunning && optResults && !optResults.noStock && optResults[optProfile]?.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "18px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", border: "1px dashed var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-100)" } }, (() => {
    const d = optResults[`_diag_${optProfile}`] || { diag: optResults._diag?.diag };
    const diag = d?.diag;
    return diag ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--coral-700)", marginBottom: 10 } }, "Sin combinaciones válidas — diagnóstico"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: 12 } }, [
      ["Stock en bodega", diag.stockIds],
      ["Disponibles para especie (pool)", diag.poolSize],
      ["Bases carbono compatibles", diag.bases],
      ["Suplementos N compatibles", diag.supps],
      ["Combinaciones evaluadas", diag.tried],
      ["Resultados antes de filtros", diag.resultsRaw],
      ["Límite suplementación", diag.suppLimit + "%"],
      ["Perfil activo", OPT_PROFILES[diag.profileKey]?.label || diag.profileKey]
    ].map(([lb, v]) => /* @__PURE__ */ React.createElement("div", { key: lb, style: { display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid var(--paper-300)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-500)" } }, lb), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, color: Number(v) === 0 ? "var(--coral-700)" : "var(--ink-900)" } }, v)))), diag.bases === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--coral-700)", marginBottom: 6 } }, "⚠ Ningún ingrediente en bodega tiene rol ", /* @__PURE__ */ React.createElement("b", null, "base carbono"), " compatible con esta especie."), diag.supps === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--coral-700)", marginBottom: 6 } }, "⚠ Ningún suplemento N en bodega es compatible con esta especie."), diag.bases > 0 && diag.supps > 0 && diag.tried === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--coral-700)", marginBottom: 6 } }, "⚠ C y N de base y suplemento son demasiado similares para resolver la ecuación."), diag.tried > 0 && diag.resultsRaw === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "#7A5A10", marginBottom: 6 } }, "⚠ Tus bases requieren más suplementación de la que permite el perfil ", /* @__PURE__ */ React.createElement("b", null, OPT_PROFILES[optProfile]?.label), " (límite ", diag.suppLimit, "%). Prueba con perfil ", /* @__PURE__ */ React.createElement("b", null, "Producción"), " o añade paja de trigo/cebada a tu bodega."), diag.bases > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("b", null, "Bases:"), " ", diag.baseNames.join(", ")), diag.supps > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 3, lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("b", null, "Suplementos:"), " ", diag.suppNames.join(", "))) : /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "20px 0", color: "var(--ink-500)" } }, "Selecciona especie y presiona Calcular.");
  })()), !optRunning && optResults && optResults.noStock && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    goTab("inventario");
    setInvTab("compra");
  }, style: { width: "100%", font: "inherit", cursor: "pointer", textAlign: "center", padding: "32px 20px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--status-attention)", border: "1px dashed var(--status-attention)", borderRadius: "var(--r-sm)", background: "#FBF6E8" } }, "Sin stock registrado. Ve a ", /* @__PURE__ */ React.createElement("strong", null, "Bodega → Compra"), " para agregar ingredientes."))), "                              ", formularMode === "manual" && /* @__PURE__ */ React.createElement("div", { className: "panel panel-accent" }, /* @__PURE__ */ React.createElement("div", { className: "sec" }, "Formulación por Objetivo C:N"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16, padding: "8px 12px", background: "var(--paper-200)", border: "1px solid var(--paper-300)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", lineHeight: 1.6 } }, "Selecciona dos ingredientes y un C:N objetivo — el sistema calcula las proporciones exactas."), sp && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 24, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-soft)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 2 } }, "Especie activa"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-md)", color: "var(--ink-900)" } }, sp.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 2 } }, "C:N ideal"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink-900)" } }, sp.cn_optimal.ideal, ":1")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 2 } }, "Rango"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink-900)" } }, sp.cn_optimal.min, "–", sp.cn_optimal.max)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 2 } }, "N objetivo"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink-900)" } }, sp.n_optimal.min, "–", sp.n_optimal.max, "%"))), /* @__PURE__ */ React.createElement("div", { className: "inv-grid" }, /* @__PURE__ */ React.createElement("div", { className: "inv-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "inv-base" }, "Ingrediente base (carbono)"), /* @__PURE__ */ React.createElement("select", { id: "inv-base", value: invBase, onChange: (e) => setInvBase(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— Seleccionar —"), INGS.filter((g) => g.role === "base_carbono" && g.cn > 0 && g.n > 0 && g.cs.includes(sKey)).map((g) => /* @__PURE__ */ React.createElement("option", { key: g.id, value: g.id }, g.name, " · C:N ", g.cn, ":1 · N ", g.n, "%")))), /* @__PURE__ */ React.createElement("div", { className: "inv-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "inv-supp" }, "Suplemento nitrógeno"), /* @__PURE__ */ React.createElement("select", { id: "inv-supp", value: invSupp, onChange: (e) => setInvSupp(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— Seleccionar —"), INGS.filter((g) => ["suplemento_n", "suplemento_medio"].includes(g.role) && g.cn > 0 && g.n > 0 && g.cs.includes(sKey)).map((g) => /* @__PURE__ */ React.createElement("option", { key: g.id, value: g.id }, g.name, " · C:N ", g.cn, ":1 · N ", g.n, "%")))), /* @__PURE__ */ React.createElement("div", { className: "inv-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "inv-aer" }, "Aireador (opcional)"), /* @__PURE__ */ React.createElement("select", { id: "inv-aer", value: invAer, onChange: (e) => setInvAer(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— Ninguno —"), INGS.filter((g) => g.role === "aireador" && g.cs.includes(sKey)).map((g) => /* @__PURE__ */ React.createElement("option", { key: g.id, value: g.id }, g.name)))), /* @__PURE__ */ React.createElement("div", { className: "inv-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "inv-min" }, "Mineral / corrector pH (%)"), /* @__PURE__ */ React.createElement("input", { id: "inv-min", type: "number", min: "0", max: "10", step: "0.5", inputMode: "decimal", required: true, value: invMin, onChange: (e) => setInvMin(parseFloat(e.target.value) || 0) })), invAer && /* @__PURE__ */ React.createElement("div", { className: "inv-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "inv-aerpct" }, "Aireador fijo (%)"), /* @__PURE__ */ React.createElement("input", { id: "inv-aerpct", type: "number", min: "5", max: "25", step: "1", inputMode: "numeric", required: true, value: invAerPct, onChange: (e) => setInvAerPct(parseInt(e.target.value) || 10) }))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)" } }, "C:N objetivo"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: 28, fontWeight: 600, color: sp && invTargetCN >= sp.cn_optimal.min && invTargetCN <= sp.cn_optimal.max ? "var(--moss-500)" : "var(--coral-500)" } }, invTargetCN, ":1")), /* @__PURE__ */ React.createElement("input", { type: "range", min: "10", max: "120", step: "1", value: invTargetCN, onChange: (e) => setInvTargetCN(parseInt(e.target.value)), "aria-label": "Relación C:N objetivo", "aria-valuetext": `${invTargetCN}:1`, style: { width: "100%", accentColor: "var(--coral-500)", marginBottom: 6 } }), sp && /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: 4, background: "var(--paper-300)", borderRadius: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: `${(sp.cn_optimal.min - 10) / 110 * 100}%`, width: `${(sp.cn_optimal.max - sp.cn_optimal.min) / 110 * 100}%`, height: "100%", background: "rgba(77,98,53,.35)", borderRadius: 2 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: `${(sp.cn_optimal.ideal - 10) / 110 * 100}%`, width: 2, height: "220%", top: "-60%", background: "var(--moss-500)", borderRadius: 1 } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--border-soft)" } }, /* @__PURE__ */ React.createElement("span", null, "10"), sp && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--moss-500)" } }, "óptimo ", sp.cn_optimal.min, "–", sp.cn_optimal.max), /* @__PURE__ */ React.createElement("span", null, "120"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn pri",
      style: { width: "100%", padding: 13, fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-button)" },
      disabled: !invBase || !invSupp,
      onClick: () => {
        const bI = INGS.find((i) => i.id === invBase);
        const sI = INGS.find((i) => i.id === invSupp);
        if (!bI || !sI) return;
        const T = invTargetCN, pMin = invMin, pAer = invAer ? invAerPct : 0;
        const pRem = 100 - pMin - pAer;
        if (pRem <= 2) {
          setInvResult({ error: "Los porcentajes fijos superan 98%. Reduce mineral o aireador." });
          return;
        }
        const bDry = 1 - Math.min(0.92, Math.max(0, (bI.moisture || 0) / 100));
        const sDry = 1 - Math.min(0.92, Math.max(0, (sI.moisture || 0) / 100));
        const cb = bI.c * bDry, nb = bI.n * bDry, cs = sI.c * sDry, ns = sI.n * sDry;
        const denom = cb - cs - T * (nb - ns);
        if (Math.abs(denom) < 1e-3) {
          setInvResult({ error: "Ingredientes demasiado similares en C:N. Elige una base de mayor C:N o un suplemento con más N." });
          return;
        }
        const ps = pRem * (cb - T * nb) / denom;
        const pb = pRem - ps;
        if (ps < 0 || pb < 0 || ps > pRem) {
          const cnMin = Math.min(bI.cn, sI.cn).toFixed(0), cnMax = Math.max(bI.cn, sI.cn).toFixed(0);
          setInvResult({ error: `C:N ${T}:1 no alcanzable con estos ingredientes. Rango posible: ${cnMin}–${cnMax}:1` });
          return;
        }
        const res = [];
        res.push({ id: invBase, p: Math.round(pb * 10) / 10 });
        res.push({ id: invSupp, p: Math.round(ps * 10) / 10 });
        if (invAer && pAer > 0) res.push({ id: invAer, p: pAer });
        if (pMin > 0) res.push({ id: "carbonato_calcio", p: pMin });
        const anRes = analyze(res, sKey, effectiveINGS);
        setInvResult({ recipe: res, an: anRes });
      }
    },
    "⇌ Calcular proporciones exactas"
  ), invResult && /* @__PURE__ */ React.createElement("div", { className: "inv-result" }, invResult.error ? /* @__PURE__ */ React.createElement("div", { style: { color: "var(--coral-500)", fontFamily: "var(--font-num)", fontSize: 18, fontStyle: "italic", lineHeight: 1.5 } }, invResult.error) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "sec", style: { marginTop: 0 } }, "Resultado"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 } }, invResult.recipe.map((r) => {
    const g = INGS.find((i) => i.id === r.id);
    return g ? /* @__PURE__ */ React.createElement("div", { key: r.id, style: { padding: "10px 16px", background: "var(--paper-50)", border: "1px solid var(--border-soft)", minWidth: 100, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 4 } }, g.name.length > 18 ? g.name.slice(0, 18) + "…" : g.name), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 32, fontWeight: 300, color: "var(--coral-500)", lineHeight: 1 } }, r.p, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--text-base)", color: "var(--ink-500)", marginLeft: 1 } }, "%"))) : null;
  })), invResult.an && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 } }, [
    { l: "C:N logrado", v: `${invResult.an.cn.toFixed(1)}:1`, ok: sp && invResult.an.cn >= sp.cn_optimal.min && invResult.an.cn <= sp.cn_optimal.max },
    { l: "Nitrógeno", v: `${invResult.an.avgN.toFixed(2)}%`, ok: sp && invResult.an.avgN >= sp.n_optimal.min && invResult.an.avgN <= sp.n_optimal.max },
    { l: "EB esperada", v: invResult.an.ebLow && invResult.an.ebHigh ? `${invResult.an.ebLow}–${invResult.an.ebHigh}%` : `${invResult.an.eb.toFixed(0)}%`, ok: invResult.an.eb >= 90 },
    { l: "Costo/kg", v: `${Math.round(invResult.an.cost)}`, ok: invResult.an.cost < 1e3 }
  ].map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "var(--paper-50)", border: `1px solid ${m.ok ? "var(--moss-500)" : "var(--border-soft)"}`, padding: "10px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 4 } }, m.l), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 20, fontWeight: 600, color: m.ok ? "var(--moss-500)" : "var(--coral-500)" } }, m.v)))), /* @__PURE__ */ React.createElement("button", { className: "btn pri", style: { width: "100%", minHeight: 44 }, onClick: () => {
    setSKey(sKey);
    setRecipe(invResult.recipe);
    openBuilderSubTab("formular");
    goTab("formular");
    setLoadedFlash(true);
    setTimeout(() => setLoadedFlash(false), 2200);
  } }, "🥣 Cargar en Mesa de Mezcla")))))))), tab === "schedule" && /* @__PURE__ */ React.createElement("div", { className: "panel panel-accent" }, /* @__PURE__ */ React.createElement("div", { className: "schctrl" }, /* @__PURE__ */ React.createElement("div", { className: "schctl" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "sch-date" }, "Fecha de inoculación"), /* @__PURE__ */ React.createElement("input", { id: "sch-date", type: "date", value: schDate, onChange: (e) => setSchDate(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "schctl" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "sch-key" }, "Especie"), /* @__PURE__ */ React.createElement("select", { id: "sch-key", value: schKey, onChange: (e) => setSchKey(e.target.value) }, Object.entries(SPP).map(([k, v]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, v.name)))), an && /* @__PURE__ */ React.createElement("div", { style: { padding: "9px 13px", border: "1px solid var(--border-soft)", background: "var(--paper-100)", fontSize: "var(--text-sm)", color: "var(--coral-500)", fontFamily: "var(--font-mono)", alignSelf: "flex-end" } }, "EB ", an.eb.toFixed(0), "% → tiempos ajustados")), sch && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "schsum" }, /* @__PURE__ */ React.createElement("div", { className: "ssc" }, /* @__PURE__ */ React.createElement("div", { className: "ssv" }, sch.inc, " días"), /* @__PURE__ */ React.createElement("div", { className: "ssl" }, "Incubación")), /* @__PURE__ */ React.createElement("div", { className: "ssc" }, /* @__PURE__ */ React.createElement("div", { className: "ssv", style: { fontSize: 20, fontWeight: 400, paddingTop: 5 } }, sch.first), /* @__PURE__ */ React.createElement("div", { className: "ssl" }, "Primera cosecha")), /* @__PURE__ */ React.createElement("div", { className: "ssc" }, /* @__PURE__ */ React.createElement("div", { className: "ssv" }, sch.tot, " días"), /* @__PURE__ */ React.createElement("div", { className: "ssl" }, "Ciclo completo"))), /* @__PURE__ */ React.createElement("div", { className: "tl" }, sch.evts.map((e) => /* @__PURE__ */ React.createElement("div", { key: e.key, className: `tle ${e.type}` }, /* @__PURE__ */ React.createElement("div", { className: "tle-dt" }, "Día ", e.day, " · ", e.ds), /* @__PURE__ */ React.createElement("div", { className: "tle-t" }, e.title), /* @__PURE__ */ React.createElement("div", { className: "tle-d" }, e.detail)))), /* @__PURE__ */ React.createElement("div", { className: "lnote" }, "Tiempos para Tenjo, Cundinamarca (2600 m.s.n.m., 12–18°C ambiente). Ajustados por EB estimada de la receta activa."))), tab === "produccion" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "panel no-print", style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 10 } }, "Tipo de contenedor"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 } }, BAG_TYPES.map((bt) => {
    const on = prodBagType === bt.id;
    return /* @__PURE__ */ React.createElement("button", { key: bt.id, onClick: () => {
      setProdBagType(bt.id);
      setProdKg(bt.kgHumedo);
    }, style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, padding: "8px 12px", border: `1.5px solid ${on ? bt.color : "var(--border-soft)"}`, borderRadius: "var(--r-sm)", background: on ? "var(--paper-100)" : "var(--paper-50)", cursor: "pointer", textAlign: "left", minWidth: 170, transition: "background-color .12s,border-color .12s,color .12s,transform .12s" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", color: on ? bt.color : "var(--ink-900)" } }, bt.icon, " ", bt.name.split("·")[0].trim()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)" } }, bt.dim, " · ", bt.kgHumedo, " kg húmedo · ", bt.vol_L, " L"));
  })), (() => {
    const bt = BAG_TYPES.find((b) => b.id === prodBagType);
    if (!bt) return null;
    const tc = bt.tratamiento === "thermal" ? { bg: "#FBF6E8", br: "#D4A838", fg: "#7A5A10", icon: "♨", lbl: "Requiere pasteurización térmica (núcleo 65–75°C · 6–8h + 25% altitud)" } : bt.tratamiento === "cwlp_thermal" ? { bg: "#EEF3EA", br: "#90A870", fg: "#3D5520", lbl: "Compatible con CWLP (cal en frío) o pasteurización" } : { bg: "#FCEEE9", br: "#E8B4A0", fg: "#B5451F", lbl: "Requiere autoclave 121°C / 18.5–19 PSI" };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { padding: "7px 11px", background: tc.bg, border: `1px solid ${tc.br}`, borderRadius: "var(--r-xs)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: tc.fg, marginBottom: 7 } }, tc.icon, " ", /* @__PURE__ */ React.createElement("b", null, "Tratamiento:"), " ", tc.lbl), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, "Uso:"), " ", bt.notas), bt.produccion && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", lineHeight: 1.5, marginTop: 4 } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, "Producción:"), " ", bt.produccion));
  })()), /* @__PURE__ */ React.createElement("div", { className: "panel no-print", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-soft)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-800)" } }, "Hoja de Producción — Lote")), !recipe.length ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--status-attention)", background: "var(--status-attention-bg)", border: "1px solid var(--status-attention)", borderRadius: "var(--r-sm)" } }, /* @__PURE__ */ React.createElement("span", null, "No hay receta activa. Crea o carga una receta antes de preparar el lote."), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-pri", onClick: () => goTab("formular") }, "Ir al Formulador")) : /* @__PURE__ */ React.createElement(React.Fragment, null, an && !balanced && /* @__PURE__ */ React.createElement("div", { style: { padding: "14px", marginBottom: 14, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "#C53030", background: "rgba(197,48,48,.08)", border: "1px solid #C53030", borderRadius: "var(--r-sm)" } }, "⚠ ", balMsg, " — no se puede ejecutar el lote ni guardar la receta hasta que la mezcla cierre en 100% (±", MASS_BALANCE_TOL, "%). Ajusta los porcentajes en el ", /* @__PURE__ */ React.createElement("strong", null, "Formulador"), "."), /* @__PURE__ */ React.createElement("div", { className: "prod-batch-grid", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr 1fr auto", gap: 10, alignItems: "end" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { htmlFor: "prod-skey", style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", display: "block", marginBottom: 5 } }, "Especie"), /* @__PURE__ */ React.createElement("select", { id: "prod-skey", value: sKey, onChange: (e) => setSKey(e.target.value), style: { width: "100%", padding: "9px 11px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-50)", fontFamily: "var(--font-body)", fontSize: "var(--text-base)" } }, Object.entries(SPP).map(([k, s]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, s.name)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { htmlFor: "prod-bags", style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", display: "block", marginBottom: 5 } }, "# Bolsas"), /* @__PURE__ */ React.createElement("input", { id: "prod-bags", type: "number", min: "1", step: "1", value: prodBags, onChange: (e) => {
    const v = e.target.value;
    setProdBags(v === "" ? "" : parseInt(v) || "");
  }, onBlur: () => {
    if (prodBags === "" || isNaN(prodBags)) setProdBags(1);
  }, style: { width: "100%", padding: "9px 11px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-50)", fontFamily: "var(--font-mono)", fontSize: "var(--text-base)" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { htmlFor: "prod-kg", style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", display: "block", marginBottom: 5 } }, "kg / bolsa"), /* @__PURE__ */ React.createElement("input", { id: "prod-kg", type: "number", min: "0.1", step: "0.1", value: prodKg, onChange: (e) => {
    const v = e.target.value;
    setProdKg(v === "" ? "" : parseFloat(v) || "");
  }, onBlur: () => {
    if (prodKg === "" || isNaN(prodKg)) setProdKg(1.5);
  }, style: { width: "100%", padding: "9px 11px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-50)", fontFamily: "var(--font-mono)", fontSize: "var(--text-base)" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { htmlFor: "prod-h", style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", display: "block", marginBottom: 5 } }, "Humedad % · Inóculo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("input", { id: "prod-h", type: "number", min: "55", max: "75", step: "1", value: prodH, onChange: (e) => {
    const v = e.target.value;
    setProdH(v === "" ? "" : parseInt(v) || "");
  }, onBlur: () => {
    if (prodH === "" || isNaN(prodH)) setProdH(67);
  }, style: { width: "50%", padding: "9px 8px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-50)", fontFamily: "var(--font-mono)", fontSize: "var(--text-base)" } }), /* @__PURE__ */ React.createElement("input", { type: "date", name: "fechaInoculo", "aria-label": "Fecha de inóculo", value: prodDate, onChange: (e) => setProdDate(e.target.value), style: { width: "50%", padding: "9px 6px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-50)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" } }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { htmlFor: "prod-scale", style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", display: "block", marginBottom: 5 } }, "Báscula (g)"), /* @__PURE__ */ React.createElement("select", { id: "prod-scale", value: prodScaleG, onChange: (e) => setProdScaleG(parseFloat(e.target.value)), style: { width: "100%", padding: "9px 11px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-50)", fontFamily: "var(--font-mono)", fontSize: "var(--text-base)" } }, [["0.1", "0.1 g (100 mg)"], ["1", "1 g"], ["5", "5 g"], ["10", "10 g"], ["50", "50 g"]].map(([v, l]) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, l)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 140 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "prod-lote", style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-500)", display: "block", marginBottom: 5 } }, "N.º lote"), /* @__PURE__ */ React.createElement("input", { id: "prod-lote", name: "numeroLote", autoComplete: "off", type: "text", value: prodLoteNum, onChange: (e) => setProdLoteNum(e.target.value), placeholder: "Ej. L-2026-047…", maxLength: 24, style: { width: "100%", padding: "9px 11px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", background: "var(--paper-50)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", boxSizing: "border-box" } })), Object.keys(prodMoist).length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => setProdMoist({}), title: "Volver a las humedades de la base de datos", style: { padding: "9px 12px", background: "var(--paper-50)", color: "var(--ink-500)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-sm)", cursor: "pointer", whiteSpace: "nowrap", alignSelf: "flex-end" } }, "↺ H₂O"), /* @__PURE__ */ React.createElement("button", { onClick: exportPDF, disabled: !balanced, title: balanced ? "" : balMsg, style: { padding: "9px 14px", background: balanced ? "var(--ink-900)" : "var(--paper-300)", color: balanced ? "var(--paper-50)" : "var(--ink-500)", border: "none", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", cursor: balanced ? "pointer" : "not-allowed", whiteSpace: "nowrap", alignSelf: "flex-end" } }, "↓ PDF"), /* @__PURE__ */ React.createElement("button", { onClick: printProdSheet, disabled: !balanced, title: balanced ? "" : balMsg, style: { padding: "9px 14px", background: balanced ? "var(--coral-500)" : "var(--paper-300)", color: balanced ? "var(--paper-0)" : "var(--ink-500)", border: "none", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", cursor: balanced ? "pointer" : "not-allowed", whiteSpace: "nowrap", alignSelf: "flex-end" } }, "Imprimir"), /* @__PURE__ */ React.createElement("button", { onClick: () => prodRows && ejecutarLote(prodRows, prodLoteNum, prodDate), disabled: !prodRows, title: prodRows ? "Descontar kg comerciales del inventario (FIFO)" : !balanced ? balMsg : "Completa # bolsas y kg/bolsa para generar la ficha", style: { padding: "9px 14px", background: prodRows ? "var(--moss-700)" : "var(--paper-300)", color: prodRows ? "var(--paper-0)" : "var(--ink-500)", border: "none", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", cursor: prodRows ? "pointer" : "not-allowed", whiteSpace: "nowrap", alignSelf: "flex-end", transition: "background .15s" } }, "⚡ Ejecutar lote"), loteSyncErr && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "#C53030", alignSelf: "flex-end", marginBottom: 9 }, title: loteSyncErr }, "⚠ sin sincronizar"))))), recipe.length > 0 && an && balanced && (() => {
    const prodIngs = effectiveINGS.map((g) => prodMoist[g.id] != null ? { ...g, moisture: prodMoist[g.id] } : g);
    const ptr = calcTreatment(an, sKey, SPP);
    const pb = calcBatch(recipe, prodBags || 1, prodKg || 1.5, prodH || 67, spawnCost, prodIngs, an?.dynSpawn, ptr, an?.eb, sKey);
    const psch = calcSchedule(sKey, prodDate, an?.eb);
    const spn = an?.dynSpawn || ptr?.spawn || 8;
    if (!pb) return null;
    const resG = prodScaleG || 0.1;
    const roundG = (x) => Math.round(x / resG) * resG;
    const rows = recipe.map((r) => {
      const g = prodIngs.find((x) => x.id === r.id);
      const it = g ? pb.items.find((x) => x.name === g.name) : null;
      const krTeo = it ? it.kr : 0;
      const grR = roundG(krTeo * 1e3);
      const m = g ? Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)) : 0;
      const masaSecaR = grR / 1e3 * (1 - m);
      return { g, r, krTeo, grR, m, masaSecaR };
    });
    const dryR = rows.reduce((s, x) => s + x.masaSecaR, 0);
    const kgComR = rows.reduce((s, x) => s + x.grR / 1e3, 0);
    const recipeR = rows.filter((x) => x.g).map((x) => ({ id: x.g.id, p: dryR > 0 ? x.masaSecaR / dryR * 100 : 0 }));
    const anR = analyze(recipeR, sKey, effectiveINGS) || an;
    const hFr = Math.min(0.85, Math.max(0.4, (prodH || 67) / 100));
    const aguaTotR = dryR * (hFr / (1 - hFr));
    const aguaInhR = rows.reduce((s, x) => s + x.grR / 1e3 * x.m, 0);
    const aguaR = Math.max(0, aguaTotR - aguaInhR);
    const cnDrift = Math.abs(anR.cn - an.cn);
    const trSteps = {
      autoclave: `Esterilizar en autoclave a ${ptr?.temp || "121°C/18.5–19 PSI"} durante ${ptr?.time || "90–120 min"}. Purgar aire al inicio. A 2.600 msnm, 15 PSI no alcanza 121°C real — usar 18.5–19 PSI manométricos o sensor de núcleo.`,
      thermal: `Pasteurizar sosteniendo el núcleo del sustrato a 65–75°C por ${ptr?.time || "6–8 h"} (factor +25% por altitud, agua ~91°C a 2.580 msnm). Medir el centro de la masa con termómetro de pincho, no solo el agua.`,
      cwlp: `Inmersión en cal hidratada (150–200 g/100 L, pH≥12) por ${ptr?.time || "18–24 h"}. No requiere calor.`
    };
    const steps = [
      `Pesar los ingredientes según la tabla (báscula ${resG} g · total seco ${dryR.toFixed(2)} kg). Verificar cada peso.`,
      `Mezclar en seco hasta color y textura homogéneos.`,
      `Hidratar: añadir ${aguaR.toFixed(2)} L de agua limpia. Humedad objetivo ${prodH}%. Prueba de puño: al apretar caen 1–2 gotas.`,
      trSteps[ptr?.col] || "Aplicar tratamiento térmico/químico recomendado.",
      `Escurrir y enfriar a <25°C (mín. 4–6 h) en superficie limpia tapada.`,
      `Inocular spawn ${spn}% (${pb.spawn.toFixed(2)} kg) con manos/superficies desinfectadas (alcohol 70%). ${ptr?.col === "autoclave" ? "Usar flujo laminar o caja SAB." : ""}`,
      `Embolsar ${prodBags} bolsas × ${prodKg} kg. Cerrar con filtro. Rotular lote y fecha (${prodDate}).`,
      `Incubar en oscuridad${an.sp?.temp_fruit ? ` · fructificación ${an.sp.temp_fruit}` : ""}. Seguir cronograma de abajo.`
    ];
    const fechas = psch ? psch.evts.filter((e) => ["in", "c1", "pr", "f1"].includes(e.key)).map((e) => [e.title, `${e.ds} · día ${e.day}`]) : [];
    const totalChecks = rows.length + steps.length;
    const doneChecks = rows.reduce((s, _, i) => s + (checkedSteps["ing_" + i] ? 1 : 0), 0) + steps.reduce((s, _, i) => s + (checkedSteps["step_" + i] ? 1 : 0), 0);
    const psSections = [
      { id: "ps-sec-1", l: "1 · Pesado" },
      ...ptr ? [{ id: "ps-sec-2", l: "2 · Tratamiento" }] : [],
      { id: "ps-sec-3", l: "3 · Procedimiento" },
      ...fechas.length > 0 ? [{ id: "ps-sec-4", l: "4 · Fechas" }] : []
    ];
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "no-print", style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "8px 12px", background: "var(--paper-100)", border: "1px solid var(--border-soft)", borderBottom: "none", position: "sticky", top: 0, zIndex: "var(--z-sticky-sub)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", flex: 1 } }, psSections.map((s) => /* @__PURE__ */ React.createElement("button", { key: s.id, onClick: () => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }), style: { fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "6px 10px", background: "var(--paper-50)", color: "var(--ink-700)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-xs)", cursor: "pointer", whiteSpace: "nowrap" } }, s.l))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 70, height: 6, background: "var(--paper-300)", borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${totalChecks > 0 ? Math.round(doneChecks / totalChecks * 100) : 0}%`, height: "100%", background: doneChecks === totalChecks && totalChecks > 0 ? "var(--moss-600,var(--accent-olive))" : "var(--coral-500)", transition: "width .2s" } })), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ink-700)", whiteSpace: "nowrap" } }, doneChecks, "/", totalChecks, " pasos"))), /* @__PURE__ */ React.createElement("div", { className: "panel prod-sheet", style: { padding: "26px 28px" } }, /* @__PURE__ */ React.createElement("div", { className: "ps-head", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--ink-900,#222)", paddingBottom: 12, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-500)" } }, "Setas de la Peña · Tenjo 2.600 msnm"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 26, fontWeight: 700, color: "var(--ink-900,#222)", lineHeight: 1.1, marginTop: 2 } }, "Hoja de Producción"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--ink-900)", marginTop: 2 } }, an.sp?.name, " · ", /* @__PURE__ */ React.createElement("i", null, an.sp?.scientific))), /* @__PURE__ */ React.createElement("div", { className: "ps-head-right", style: { textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-500)" } }, /* @__PURE__ */ React.createElement("div", null, "Fecha lote: ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, prodDate)), /* @__PURE__ */ React.createElement("div", null, prodBags, " bolsas × ", prodKg, " kg = ", pb.wet.toFixed(1), " kg húmedo"), /* @__PURE__ */ React.createElement("div", null, (() => {
      const bt = BAG_TYPES.find((b) => b.id === prodBagType);
      return bt ? /* @__PURE__ */ React.createElement("span", null, bt.icon, " ", bt.name.split("·")[0].trim(), " · ", bt.dim) : null;
    })()), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: "var(--ink-900)" } }, "N.º " + (prodLoteNum || "___________")))), /* @__PURE__ */ React.createElement("div", { className: "ps-kpi", style: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: "var(--border-soft)", border: "1px solid var(--border-soft)", borderRadius: "var(--r-xs)", overflow: "hidden", marginBottom: 14 } }, [
      ["C:N", an.cn.toFixed(1) + ":1", "relación"],
      ["Nitrógeno", an.avgN.toFixed(2) + "%", "total"],
      ["Ef. biológica", (an.ebLow ?? an.eb.toFixed(0)) + "–" + (an.ebHigh ?? an.eb.toFixed(0)) + "%", "estimada"],
      ["Score", opt.score + "/100", "perito"],
      ["Costo/kg", "$" + Math.round(an.cost).toLocaleString("es-CO"), "estimado"]
    ].map(([l, v, s]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { background: "var(--paper-50)", padding: "10px 6px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", marginBottom: 3 } }, l), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 20, color: "var(--ink-900)", lineHeight: 1, marginBottom: 2 } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-400)" } }, s)))), /* @__PURE__ */ React.createElement("div", { className: "economic-summary-card", style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-2,#6B6759)" } }, "💰 Análisis Económico & Rentabilidad por Bolsa"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-1,#3C392F)", marginTop: 2 } }, "Costeo unitario real en Tenjo para bolsa de ", prodKg, " kg húmedo al ", prodH, "% H₂O")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Precio venta fresco:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ink-0)" } }, "$", Math.round(pb.freshPriceKg).toLocaleString("es-CO"), " COP/kg"))), /* @__PURE__ */ React.createElement("div", { className: "economics-metric-grid" }, /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box" }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label" }, "Costo por Bolsa"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value" }, "$", Math.round(pb.costPerBag).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub" }, "Sustrato + Spawn + Autoclave + Bolsa")), /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box" }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label" }, "Cosecha Estimada"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value" }, pb.projectedFreshKgPerBag.toFixed(2), " kg"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub" }, "Hongo fresco (EB ", Math.round(pb.ebRate * 100), "%)")), /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box" }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label" }, "Costo / kg Fresco"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value" }, "$", Math.round(pb.productionCostPerKgFresh).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub" }, "Costo unitario de cosecha")), /* @__PURE__ */ React.createElement("div", { className: "econ-metric-box", style: { background: "var(--accent-olive-dim, #DCE1D1)", borderColor: "var(--accent-olive, #5B6B44)" } }, /* @__PURE__ */ React.createElement("span", { className: "econ-metric-label", style: { color: "var(--accent-olive, #5B6B44)" } }, "Margen Bruto / Bolsa"), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-value", style: { color: "var(--accent-olive, #5B6B44)" } }, "+$", Math.round(pb.projectedGrossMarginPerBag).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("span", { className: "econ-metric-sub", style: { fontWeight: 700, color: "var(--accent-olive, #5B6B44)" } }, pb.projectedMarginPct.toFixed(1), "% margen"))), /* @__PURE__ */ React.createElement("div", { className: "econ-pills-row" }, /* @__PURE__ */ React.createElement("span", { className: "econ-pill" }, /* @__PURE__ */ React.createElement("span", { className: "econ-dot", style: { background: "#5E7080" } }), "Sustrato: $", Math.round(pb.costBreakdownPerBag.sustrato).toLocaleString("es-CO"), "/bolsa"), /* @__PURE__ */ React.createElement("span", { className: "econ-pill" }, /* @__PURE__ */ React.createElement("span", { className: "econ-dot", style: { background: "#5B6B44" } }), "Micelio: $", Math.round(pb.costBreakdownPerBag.spawn).toLocaleString("es-CO"), "/bolsa"), /* @__PURE__ */ React.createElement("span", { className: "econ-pill" }, /* @__PURE__ */ React.createElement("span", { className: "econ-dot", style: { background: "#A85C32" } }), "Tratamiento Térmico: $", Math.round(pb.costBreakdownPerBag.energia).toLocaleString("es-CO"), "/bolsa"), /* @__PURE__ */ React.createElement("span", { className: "econ-pill" }, /* @__PURE__ */ React.createElement("span", { className: "econ-dot", style: { background: "#7A6A52" } }), "Bolsa PP: $", Math.round(pb.costBreakdownPerBag.consumibles).toLocaleString("es-CO"), "/bolsa"))), /* @__PURE__ */ React.createElement("div", { id: "ps-sec-1", style: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, scrollMarginTop: 52 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: 22, color: "var(--coral-500)", lineHeight: 1, flexShrink: 0 } }, "1"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-900)" } }, "Pesado de ingredientes"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginTop: 1 } }, "báscula · res. ", resG, " g"))), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginBottom: 8 } }, "Masa seca requerida: ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, dryR.toFixed(2), " kg"), " = ", pb.wet.toFixed(1), " kg húmedo × (1 − ", prodH, "%). Gramos redondeados a la báscula (", resG, " g). Edita la columna ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, "H₂O%"), " con la humedad real del insumo del día."), /* @__PURE__ */ React.createElement("div", { className: "ps-tbl-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "prod-tbl", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Ingrediente"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "%"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center", width: 62 } }, "H₂O%"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Gramos"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Kg"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Seco kg"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center", width: 46 } }, "Hecho"))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((x, i) => {
      const id = x.r.id;
      const baseM = x.g ? x.g.moisture : 0;
      const ov = prodMoist[id] != null;
      return /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", null, x.g ? x.g.name : id, ov ? /* @__PURE__ */ React.createElement("span", { style: { color: "var(--coral-500)", fontSize: "var(--text-xs)" } }, " · ajustado") : null), /* @__PURE__ */ React.createElement("td", { className: "num" }, parseFloat(x.r.p).toFixed(1)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          name: `ingredientMoisture-${id}`,
          "aria-label": `Humedad real de ${x.g ? x.g.name : id}, porcentaje`,
          type: "number",
          min: "0",
          max: "92",
          step: "1",
          value: prodMoist[id] != null ? prodMoist[id] : baseM,
          onChange: (e) => {
            const v = e.target.value;
            setProdMoist((prev) => {
              const n = { ...prev };
              if (v === "") delete n[id];
              else n[id] = Math.min(92, Math.max(0, parseFloat(v) || 0));
              return n;
            });
          },
          style: { width: 44, padding: "2px 4px", textAlign: "center", border: `1px solid ${ov ? "var(--coral-500)" : "var(--paper-300)"}`, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", background: ov ? "var(--coral-50,#FCEEE9)" : "var(--paper-0)" }
        }
      )), /* @__PURE__ */ React.createElement("td", { className: "num" }, Math.round(x.grR).toLocaleString()), /* @__PURE__ */ React.createElement("td", { className: "num" }, x.grR >= 500 ? (x.grR / 1e3).toFixed(2) : "—"), /* @__PURE__ */ React.createElement("td", { className: "num", style: { color: "var(--ink-500)" } }, x.masaSecaR.toFixed(2)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("input", { name: `ingredientDone-${id}`, type: "checkbox", "aria-label": `${x.g ? x.g.name : id} pesado`, checked: !!checkedSteps["ing_" + i], onChange: (e) => setCheckedSteps((prev) => ({ ...prev, ["ing_" + i]: e.target.checked })), style: { accentColor: "var(--coral-500)", width: 14, height: 14, cursor: "pointer" } })));
    }), /* @__PURE__ */ React.createElement("tr", { className: "tot" }, /* @__PURE__ */ React.createElement("td", null, "Total a pesar (húmedo comercial)"), /* @__PURE__ */ React.createElement("td", { className: "num" }, "100"), /* @__PURE__ */ React.createElement("td", null), /* @__PURE__ */ React.createElement("td", { className: "num" }, Math.round(kgComR * 1e3).toLocaleString()), /* @__PURE__ */ React.createElement("td", { className: "num" }, kgComR.toFixed(2)), /* @__PURE__ */ React.createElement("td", { className: "num" }, dryR.toFixed(2)), /* @__PURE__ */ React.createElement("td", null))))), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: cnDrift > 0.5 ? "var(--coral-600,#B5451F)" : "var(--ink-500)", marginBottom: 16, padding: "5px 9px", background: cnDrift > 0.5 ? "var(--coral-50,#FCEEE9)" : "var(--paper-50)", border: `1px solid ${cnDrift > 0.5 ? "var(--coral-300,#E8B4A0)" : "var(--paper-300)"}` } }, "C:N teórico ", an.cn.toFixed(1), " → ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, "efectivo ", anR.cn.toFixed(1)), " · N ", anR.avgN.toFixed(2), "% · EB ~", anR.eb.toFixed(0), "%", cnDrift > 0.5 ? " · ⚠ el redondeo desvía el C:N: considera un lote más grande" : " · desvío despreciable a esta resolución"), /* @__PURE__ */ React.createElement("div", { className: "ps-3col", style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 } }, [
      ["Agua neta a inyectar", `${aguaR.toFixed(2)} L`, `req. ${aguaTotR.toFixed(1)} L − ${aguaInhR.toFixed(1)} L ya en insumos`],
      [`Spawn (${spn}%)`, `${pb.spawn.toFixed(2)} kg`, "micelio en grano · 8% del húmedo"],
      ["Sustrato húmedo final", `${pb.wet.toFixed(1)} kg`, `${prodBags} bolsas × ${prodKg} kg · ${prodH}% H₂O`]
    ].map(([l, v, s]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { border: "1px solid var(--paper-300)", padding: "10px 12px", background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--ink-700)", marginBottom: 3, fontWeight: 700 } }, l), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: 20, fontWeight: 600, color: "var(--ink-900,#222)" } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-600)", marginTop: 1, fontWeight: 500 } }, s)))), ptr && /* @__PURE__ */ React.createElement("div", { id: "ps-sec-2", style: { border: "1px solid var(--paper-300)", padding: "10px 14px", marginBottom: 18, background: "var(--paper-50)", scrollMarginTop: 52 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: 20, color: "var(--coral-500)", lineHeight: 1, flexShrink: 0 } }, "2"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-900)" } }, "Tratamiento — ", ptr.name)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-900)" } }, ptr.temp, " · ", ptr.time, " · Spawn ", ptr.spawn, "%"), ptr.reasons?.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginTop: 4 } }, ptr.reasons.join(" · "))), /* @__PURE__ */ React.createElement("div", { id: "ps-sec-3", style: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, scrollMarginTop: 52 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: 22, color: "var(--coral-500)", lineHeight: 1, flexShrink: 0 } }, "3"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-900)" } }, "Procedimiento")), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18 } }, steps.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "prod-step", style: { opacity: checkedSteps["step_" + i] ? 0.4 : 1, transition: "opacity .2s" } }, /* @__PURE__ */ React.createElement("input", { name: `procedureStep-${i}`, type: "checkbox", "aria-label": `Paso ${i + 1} completado: ${t}`, checked: !!checkedSteps["step_" + i], onChange: (e) => setCheckedSteps((prev) => ({ ...prev, ["step_" + i]: e.target.checked })), style: { accentColor: "var(--coral-500)", width: 14, height: 14, cursor: "pointer", flexShrink: 0, marginTop: 3 } }), /* @__PURE__ */ React.createElement("div", { className: "prod-step-n" }, i + 1), /* @__PURE__ */ React.createElement("div", { className: "prod-step-t", style: { textDecoration: checkedSteps["step_" + i] ? "line-through" : "none" } }, t)))), fechas.length > 0 && /* @__PURE__ */ React.createElement("div", { id: "ps-sec-4", style: { scrollMarginTop: 52 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-num)", fontSize: 22, color: "var(--coral-500)", lineHeight: 1, flexShrink: 0 } }, "4"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-900)" } }, "Fechas clave"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginTop: 1 } }, "estimadas · EB ", an.eb.toFixed(0), "%"))), /* @__PURE__ */ React.createElement("div", { className: "ps-fechas-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "ps-fechas", style: { display: "grid", gridTemplateColumns: `repeat(${fechas.length},1fr)`, gap: 1, background: "var(--paper-300)", border: "1px solid var(--paper-300)" } }, fechas.map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { background: "var(--paper-0)", padding: "8px 6px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 2 } }, l), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-900,#222)" } }, v)))))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 20, paddingTop: 14, borderTop: "2px solid var(--ink-900)" } }, /* @__PURE__ */ React.createElement("div", { className: "ps-sig", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 18 } }, [["Operario"], ["Hora inicio"], ["Verificado por"]].map(([l]) => /* @__PURE__ */ React.createElement("div", { key: l }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", marginBottom: 6 } }, l), /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid var(--ink-600)", height: 26 } })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-700)", marginBottom: 6 } }, "Observaciones del lote"), /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid var(--paper-400)", height: 22, marginBottom: 10 } }), /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid var(--paper-400)", height: 22 } })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-400)", textAlign: "right", letterSpacing: "var(--tracking-label)" } }, "Setas de la Pe\\u00f1a · Tenjo 2.600 msnm · simulador v9.1"))));
  })()), tab === "inventario" && BodegaSection(), tab === "dashboard" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "panel" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--ink-400)" } }, saved.length, " receta", saved.length !== 1 ? "s" : ""), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, ["all", ...Object.keys(SPP)].map((k) => /* @__PURE__ */ React.createElement("button", { key: k, className: `cat${dashFilter === k ? " on" : ""}`, onClick: () => setDashFilter(k) }, k === "all" ? "Todas" : SPP[k]?.name)))), saved.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rec-empty" }, /* @__PURE__ */ React.createElement("div", { className: "rec-empty-hed" }, "No hay recetas guardadas."), /* @__PURE__ */ React.createElement("div", { className: "rec-empty-sub" }, "Crea una fórmula, valida sus parámetros y guárdala aquí."), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inv-btn inv-btn-pri", onClick: () => goTab("formular") }, "Crear primera receta")) : (() => {
    const filtered = saved.filter((e) => dashFilter === "all" || e.sKey === dashFilter);
    if (!filtered.length) return /* @__PURE__ */ React.createElement("div", { className: "sempty" }, "Sin recetas para esta especie.");
    const sorted = [...filtered].sort((a, b) => (parseFloat(b.eb) || 0) - (parseFloat(a.eb) || 0));
    return /* @__PURE__ */ React.createElement("div", { className: "dash-grid" }, sorted.map((e) => {
      const s2 = SPP[e.sKey];
      const band = BANDS[e.sKey] || "var(--ink-700)";
      const eb = parseFloat(e.eb) || 0;
      const sc = liveScoreFor(e);
      const needsA2 = !(e.cost > 0) || e.energyCopKg == null;
      const a2 = needsA2 ? analyze(e.recipe, e.sKey, effectiveINGS) : null;
      const costIngKg = e.cost > 0 ? e.cost : a2 ? Math.round(a2.cost) : 0;
      const eDash = e.energyCopKg != null ? e.energyCopKg : (() => {
        const tr2 = a2 ? calcTreatment(a2, e.sKey, SPP) : null;
        const col = tr2?.col || (["shiitake", "lions_mane", "reishi", "nameko"].includes(e.sKey) ? "autoclave" : "thermal");
        return energyCostPerKgSeco(col, e.sKey);
      })();
      const costKg = costIngKg + eDash;
      const hFactor = e.sKey === "shiitake" || e.sKey === "lions_mane" || e.sKey === "reishi" ? 0.4 : 0.35;
      return /* @__PURE__ */ React.createElement("div", { key: e.id, "data-recipe-id": e.id, className: "dash-card", style: { borderTopColor: band } }, /* @__PURE__ */ React.createElement("div", { className: "dash-card-top" }, /* @__PURE__ */ React.createElement("div", { className: "dash-card-name" }, e.name), /* @__PURE__ */ React.createElement("div", { className: "dash-card-spp" }, s2?.name, " · ", e.date)), /* @__PURE__ */ React.createElement("div", { className: "dash-card-body" }, /* @__PURE__ */ React.createElement("div", { className: "dash-kv" }, /* @__PURE__ */ React.createElement("span", { className: "dk" }, "EB estimada"), /* @__PURE__ */ React.createElement("span", { className: "dv", style: { color: eb >= 100 ? "var(--moss-500)" : eb >= 80 ? "var(--ochre-500,#A07828)" : "var(--coral-500)" } }, e.eb, "%")), sc > 0 && /* @__PURE__ */ React.createElement("div", { className: "dash-kv" }, /* @__PURE__ */ React.createElement("span", { className: "dk" }, "Score"), /* @__PURE__ */ React.createElement("span", { className: "dv", style: { color: sc >= 80 ? "var(--moss-500)" : sc >= 60 ? "var(--ochre-500,#A07828)" : "var(--coral-500)" } }, sc, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--border-soft)" } }, "/100"))), /* @__PURE__ */ React.createElement("div", { className: "dash-kv" }, /* @__PURE__ */ React.createElement("span", { className: "dk" }, "C:N"), /* @__PURE__ */ React.createElement("span", { className: "dv" }, e.cn, ":1")), /* @__PURE__ */ React.createElement("div", { className: "dash-kv" }, /* @__PURE__ */ React.createElement("span", { className: "dk" }, "Ingredientes"), /* @__PURE__ */ React.createElement("span", { className: "dv" }, e.recipe.length)), costKg > 0 && /* @__PURE__ */ React.createElement("div", { className: "dash-kv" }, /* @__PURE__ */ React.createElement("span", { className: "dk" }, "Costo total/kg"), /* @__PURE__ */ React.createElement("span", { className: "dv", style: { color: "var(--ink-900)", fontFamily: "var(--font-num)", fontSize: "var(--text-base)" }, title: `Ingredientes: $${costIngKg.toLocaleString("es-CO")} + Energía proceso: $${eDash.toLocaleString("es-CO")}` }, "$", costKg.toLocaleString("es-CO"), " COP", eDash > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-500)", marginLeft: 4 } }, "⚡+$", eDash.toLocaleString())))), costKg > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, borderTop: "1px solid var(--paper-300)" } }, [{ nom: "20×50", kgH: 1.8 }, { nom: "18×35", kgH: 1 }, { nom: "Punch", kgH: 3.5 }].map((b) => /* @__PURE__ */ React.createElement("div", { key: b.nom, style: { flex: 1, padding: "4px 6px", borderRight: "1px solid var(--paper-300)", textAlign: "center", background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--ink-500)", marginBottom: 1 } }, b.nom), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-num)", fontSize: "var(--text-sm)", color: "var(--ink-900)", fontWeight: 700 } }, "$", Math.round(costKg * b.kgH * hFactor).toLocaleString("es-CO")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--ink-500)" } }, "COP/bolsa")))), /* @__PURE__ */ React.createElement("div", { style: { padding: "4px 16px 10px", background: "var(--paper-50)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3 } }, e.recipe.slice(0, 4).map((r) => {
        const g = INGS.find((i) => i.id === r.id);
        return g ? /* @__PURE__ */ React.createElement("span", { key: r.id, style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", padding: "1px 5px", background: "var(--paper-100)", border: "1px solid var(--paper-300)", color: "var(--ink-500)" } }, g.name.length > 15 ? g.name.slice(0, 15) + "…" : g.name, " ", r.p, "%") : null;
      }), e.recipe.length > 4 && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--border-soft)", padding: "1px 3px" } }, "+", e.recipe.length - 4, " más"))), /* @__PURE__ */ React.createElement("div", { className: "dash-card-foot", style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "dash-sload", style: { background: "var(--paper-0,#F7F4EC)", color: "var(--accent-olive,#5B6B44)", border: "1px solid var(--border-hairline,#8C7F5B)", padding: "4px 10px" }, onClick: () => {
        setTastingSpeciesKey(e.sKey);
        setShowTastingModal(true);
      }, title: "Abrir dossier gastronómico y maridaje" }, "🍷 Cata"), /* @__PURE__ */ React.createElement("button", { className: "dash-sload", style: { flex: 1 }, onClick: () => {
        loadR(e);
      } }, "Cargar"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "dash-sdel", onClick: () => requireAdmin(delR)(e.id), "aria-label": `Eliminar receta ${e.name}` }, "✕")));
    }));
  })())), tab === "clima" && ClimateDashboardSection(), tab === "bitacora" && BitacoraSection(), confirmDlg && /* @__PURE__ */ React.createElement(ConfirmModal, { dlg: confirmDlg, onClose: () => setConfirmDlg(null) }), promptDlg && /* @__PURE__ */ React.createElement(PromptModal, { dlg: promptDlg, onClose: () => setPromptDlg(null) }), noticeDlg && /* @__PURE__ */ React.createElement(NoticeModal, { dlg: noticeDlg, onClose: () => setNoticeDlg(null) }), loteBatchConfirm && /* @__PURE__ */ React.createElement(AccessibleModal, { onClose: () => setLoteBatchConfirm(null), label: "Ejecutar lote", dialogStyle: { width: 520, maxWidth: "calc(100vw - 32px)" } }, /* @__PURE__ */ React.createElement("div", { className: "inv-modal-title" }, "⚡ Ejecutar lote — confirmar descuento de inventario"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-700)", marginBottom: 14 } }, "Lote ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)" } }, loteBatchConfirm.loteNum || "—"), " · ", loteBatchConfirm.fecha, " — se descontarán los kg comerciales (FIFO, del lote más antiguo al más nuevo)."), /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, ["Ingrediente", "Requerido kg", "Stock kg", ""].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: { textAlign: h === "Requerido kg" || h === "Stock kg" ? "right" : "left", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", color: "var(--ink-800)", borderBottom: "1.5px solid var(--ink-900)", padding: "6px 8px" } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, loteBatchConfirm.preview.map((row) => /* @__PURE__ */ React.createElement("tr", { key: row.id, style: { background: row.ok ? "transparent" : "color-mix(in oklab,var(--coral-200) 30%,var(--paper-50))" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 8px", borderBottom: "1px solid var(--paper-300)", color: "var(--ink-900)" } }, row.name), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 8px", borderBottom: "1px solid var(--paper-300)", textAlign: "right", fontVariantNumeric: "tabular-nums" } }, row.krKg.toFixed(3)), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 8px", borderBottom: "1px solid var(--paper-300)", textAlign: "right", color: row.ok ? "var(--moss-700)" : "var(--coral-700)", fontVariantNumeric: "tabular-nums" } }, row.stockActual.toFixed(3)), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 8px", borderBottom: "1px solid var(--paper-300)", textAlign: "center", fontSize: "var(--text-base)" } }, row.ok ? "✓" : "⚠"))))), loteBatchConfirm.preview.some((r) => !r.ok) && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--coral-700)", background: "color-mix(in oklab,var(--coral-100) 60%,var(--paper-50))", border: "1px solid var(--coral-200)", borderRadius: 4, padding: "8px 12px", marginBottom: 12 } }, "⚠ Uno o más ingredientes no tienen stock suficiente — se descontará lo disponible y el faltante quedará a 0."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setLoteBatchConfirm(null), className: "inv-btn inv-btn-sec" }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { onClick: confirmarEjecucion, className: "inv-btn inv-btn-pri" }, "Confirmar y descontar"))), showBitNuevo && /* @__PURE__ */ React.createElement(AccessibleModal, { onClose: () => setShowBitNuevo(false), label: "Nueva prueba experimental", dialogStyle: { width: 560, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 100px)", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "inv-modal-title" }, "Nueva prueba experimental"), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-codigo" }, "Código de lote"), /* @__PURE__ */ React.createElement("input", { id: "bit-codigo", name: "codigoLote", autoComplete: "off", className: "inv-input", value: bitNuevoForm.codigo || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, codigo: e.target.value })) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-especie" }, "Especie"), /* @__PURE__ */ React.createElement("input", { id: "bit-especie", name: "especie", autoComplete: "off", className: "inv-input", value: bitNuevoForm.especie || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, especie: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-cepa" }, "Cepa / proveedor"), /* @__PURE__ */ React.createElement("input", { id: "bit-cepa", name: "cepaProveedor", autoComplete: "off", className: "inv-input", placeholder: "Ej. Spawn proveedor X…", value: bitNuevoForm.cepa || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, cepa: e.target.value })) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-operador" }, "Operador"), /* @__PURE__ */ React.createElement("input", { id: "bit-operador", name: "operador", autoComplete: "off", className: "inv-input", value: bitNuevoForm.operador || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, operador: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-fecha-mezcla" }, "Fecha mezcla"), /* @__PURE__ */ React.createElement("input", { id: "bit-fecha-mezcla", name: "fechaMezcla", type: "date", className: "inv-input", value: bitNuevoForm.fechaMezcla || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, fechaMezcla: e.target.value })) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-fecha-inoculacion" }, "Fecha inoculación"), /* @__PURE__ */ React.createElement("input", { id: "bit-fecha-inoculacion", name: "fechaInoculacion", type: "date", className: "inv-input", value: bitNuevoForm.fechaInoculacion || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, fechaInoculacion: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-4", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-bags" }, "# Bolsas"), /* @__PURE__ */ React.createElement("input", { id: "bit-bags", name: "bagCount", type: "number", className: "inv-input", min: 1, value: bitNuevoForm.numBolsas || 6, onChange: (e) => setBitNuevoForm((p) => ({ ...p, numBolsas: parseInt(e.target.value) || 1 })) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-wet-kg" }, "kg húmedo/bolsa"), /* @__PURE__ */ React.createElement("input", { id: "bit-wet-kg", name: "wetKgPerBag", type: "number", className: "inv-input", min: 0.1, step: 0.1, value: bitNuevoForm.pesoHumedo || 1.5, onChange: (e) => setBitNuevoForm((p) => ({ ...p, pesoHumedo: parseFloat(e.target.value) || 0.1 })) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-spawn" }, "% spawn"), /* @__PURE__ */ React.createElement("input", { id: "bit-spawn", name: "spawnPercent", type: "number", className: "inv-input", min: 1, max: 30, value: bitNuevoForm.spawnPct || 8, onChange: (e) => setBitNuevoForm((p) => ({ ...p, spawnPct: parseFloat(e.target.value) || 8 })) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-moisture" }, "Humedad %"), /* @__PURE__ */ React.createElement("input", { id: "bit-moisture", name: "moisturePercent", type: "number", className: "inv-input", min: 55, max: 80, value: bitNuevoForm.humedad || 67, onChange: (e) => setBitNuevoForm((p) => ({ ...p, humedad: parseInt(e.target.value) || 67 })) }))), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-treatment" }, "Tratamiento"), /* @__PURE__ */ React.createElement("select", { id: "bit-treatment", name: "treatment", className: "inv-input", value: bitNuevoForm.tratamiento || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, tratamiento: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "—"), ["Pasteurización", "Autoclave", "Cal hidratada (CWLP)", "Sin tratamiento"].map((t) => /* @__PURE__ */ React.createElement("option", { key: t, value: t }, t)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-dry-weight" }, "Peso seco (kg)"), /* @__PURE__ */ React.createElement("input", { id: "bit-dry-weight", name: "dryWeight", type: "number", className: "inv-input", step: 0.01, value: bitNuevoForm.peseSeco || "", placeholder: "Calculado automáticamente…", onChange: (e) => setBitNuevoForm((p) => ({ ...p, peseSeco: parseFloat(e.target.value) || 0 })) }))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-objective" }, "Objetivo de la prueba"), /* @__PURE__ */ React.createElement("input", { id: "bit-objective", name: "testObjective", autoComplete: "off", className: "inv-input", placeholder: "Ej. comparar humedad 63% vs. 66%…", value: bitNuevoForm.objetivo || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, objetivo: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "bit-notes" }, "Notas"), /* @__PURE__ */ React.createElement("textarea", { id: "bit-notes", name: "testNotes", autoComplete: "off", className: "inv-input", rows: 2, value: bitNuevoForm.notas || "", onChange: (e) => setBitNuevoForm((p) => ({ ...p, notas: e.target.value })), style: { resize: "vertical" } })), bitNuevoForm.recipeRef && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--moss-700)", background: "var(--paper-100)", border: "1px solid var(--moss-200)", borderRadius: 4, padding: "7px 12px", marginBottom: 14 } }, "Receta vinculada: ", /* @__PURE__ */ React.createElement("b", null, bitNuevoForm.recipeRef.name), " · C:N ", bitNuevoForm.recipeRef.cn, " · EB ~", bitNuevoForm.recipeRef.eb, "%"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowBitNuevo(false), className: "inv-btn inv-btn-sec" }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    if (!bitNuevoForm.codigo?.trim() || !bitNuevoForm.especie?.trim()) {
      setNoticeDlg({ msg: "Completa código y especie." });
      return;
    }
    const newId = crearBitLote(bitNuevoForm);
    setBitActiveLoteId(newId);
    goTab("bitacora");
    goBitTab("bit_bolsas", true);
    setShowBitNuevo(false);
  }, className: "inv-btn inv-btn-pri" }, "Crear lote y generar bolsas"))), showBitCosecha && /* @__PURE__ */ React.createElement(AccessibleModal, { onClose: () => setShowBitCosecha(false), label: "Registrar cosecha", dialogStyle: { width: 440 } }, /* @__PURE__ */ React.createElement("div", { className: "inv-modal-title" }, "Registrar cosecha"), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "harvest-bag" }, "Bolsa"), /* @__PURE__ */ React.createElement("select", { id: "harvest-bag", name: "harvestBag", className: "inv-input", value: bitCosechaForm.bolsaId || "", onChange: (e) => {
    const b = bitBolsas.find((x) => x.id === e.target.value);
    setBitCosechaForm((p) => ({ ...p, bolsaId: e.target.value, codigo: b?.codigo || "" }));
  } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— seleccionar —"), bitBolsas.filter((b) => b.loteId === (bitCosechaForm.loteId || bitActiveLoteId)).map((b) => /* @__PURE__ */ React.createElement("option", { key: b.id, value: b.id }, b.codigo)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "harvest-flush" }, "Flush #"), /* @__PURE__ */ React.createElement("input", { id: "harvest-flush", name: "harvestFlush", type: "number", className: "inv-input", min: 1, value: bitCosechaForm.flush || 1, onChange: (e) => setBitCosechaForm((p) => ({ ...p, flush: parseInt(e.target.value) || 1 })) }))), /* @__PURE__ */ React.createElement("div", { className: "inv-row inv-row-2", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "harvest-date" }, "Fecha"), /* @__PURE__ */ React.createElement("input", { id: "harvest-date", name: "harvestDate", type: "date", className: "inv-input", value: bitCosechaForm.fecha || "", onChange: (e) => setBitCosechaForm((p) => ({ ...p, fecha: e.target.value })) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "harvest-weight" }, "Peso fresco (g)"), /* @__PURE__ */ React.createElement("input", { id: "harvest-weight", name: "harvestWeight", type: "number", className: "inv-input", min: 0, step: 1, placeholder: "Ej. 430…", value: bitCosechaForm.pesoFresco || "", onChange: (e) => setBitCosechaForm((p) => ({ ...p, pesoFresco: parseFloat(e.target.value) || "" })) }))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("span", { className: "inv-label" }, "Calidad"), /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": "Calidad de la cosecha", style: { display: "flex", gap: 6, paddingTop: 4 } }, [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, "aria-label": `${n} de 5 estrellas`, "aria-pressed": (bitCosechaForm.calidad || 0) === n, onClick: () => setBitCosechaForm((p) => ({ ...p, calidad: n })), style: { padding: "6px 12px", border: "1px solid var(--border-soft)", borderRadius: "var(--r-xs)", fontFamily: "var(--font-num)", fontSize: "var(--text-md)", cursor: "pointer", background: (bitCosechaForm.calidad || 0) >= n ? "var(--ochre-500)" : "var(--paper-50)", color: (bitCosechaForm.calidad || 0) >= n ? "var(--paper-0)" : "var(--ink-500)", transition: "background-color .1s,color .1s,border-color .1s" } }, "★")))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("label", { className: "inv-label", htmlFor: "harvest-observations" }, "Observaciones"), /* @__PURE__ */ React.createElement("input", { id: "harvest-observations", name: "harvestObservations", autoComplete: "off", className: "inv-input", placeholder: "Ej. buen racimo, amarillamiento leve…", value: bitCosechaForm.observaciones || "", onChange: (e) => setBitCosechaForm((p) => ({ ...p, observaciones: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowBitCosecha(false), className: "inv-btn inv-btn-sec" }, "Cancelar"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        if (!bitCosechaForm.bolsaId || !bitCosechaForm.pesoFresco) {
          setNoticeDlg({ msg: "Selecciona bolsa y peso." });
          return;
        }
        const cData = { ...bitCosechaForm, loteId: bitActiveLoteId || bitCosechaForm.loteId };
        addBitCosecha(cData);
        setShowBitCosecha(false);
        openThermalForCosecha(cData.loteId, cData);
      },
      className: "inv-btn inv-btn-sec",
      title: "Guardar cosecha e imprimir inmediatamente la etiqueta de canastilla térmica"
    },
    "Guardar y 🖨 Canastilla"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        if (!bitCosechaForm.bolsaId || !bitCosechaForm.pesoFresco) {
          setNoticeDlg({ msg: "Selecciona bolsa y peso." });
          return;
        }
        addBitCosecha({ ...bitCosechaForm, loteId: bitActiveLoteId || bitCosechaForm.loteId });
        setShowBitCosecha(false);
      },
      className: "inv-btn inv-btn-pri"
    },
    "Guardar cosecha"
  ))), showQrSheet && (() => {
    const activeBatches = bitLotes.filter((l) => !["completado", "descartado"].includes(l.estado));
    const currentLote = bitLotes.find((l) => l.id === (qrSelectedLoteId || bitActiveLoteId)) || activeBatches[0] || bitLotes[0];
    return /* @__PURE__ */ React.createElement(
      AccessibleModal,
      {
        onClose: () => {
          stopCameraScanner();
          setShowQrSheet(false);
        },
        label: "Captura rápida de campo",
        dialogStyle: { width: "min(460px,94vw)", padding: "18px 16px", background: "var(--paper-1,#EFEBE0)", border: "1px solid var(--border-hairline,#8C7F5B)", borderRadius: "var(--radius-md,3px)" }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-0)", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(AppIcon, { name: "camera", size: 14, color: "var(--ink-0)" }), " Ronda de Campo · Registro Rápido"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "modal-icon-close", "aria-label": "Cerrar captura rápida", onClick: () => {
        stopCameraScanner();
        setShowQrSheet(false);
      } }, "✕")),
      isCameraActive ? /* @__PURE__ */ React.createElement("div", { className: "qr-scanner-viewport" }, /* @__PURE__ */ React.createElement(
        "video",
        {
          ref: videoRef,
          className: "qr-scanner-video",
          autoPlay: true,
          playsInline: true,
          muted: true
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "qr-scanner-reticle" }, /* @__PURE__ */ React.createElement("div", { className: "qr-scanner-laser" })), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: stopCameraScanner,
          style: { position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#fff", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 2, fontSize: 10, padding: "4px 8px", cursor: "pointer", fontFamily: "var(--font-mono)" }
        },
        "⏹ Detener Cámara"
      )) : /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: startCameraScanner,
          style: { minHeight: 42, width: "100%", cursor: "pointer", background: "var(--paper-0,#F7F4EC)", color: "var(--accent-olive,#5B6B44)", border: "1px solid var(--accent-olive,#5B6B44)", borderRadius: "var(--radius-md,3px)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }
        },
        "📷 Iniciar Escaneo con Cámara Móvil"
      ),
      cameraError && /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 10px", background: "#FEE2E2", color: "#991B1B", borderLeft: "3px solid #DC2626", borderRadius: 2, fontSize: 11, marginBottom: 12, fontFamily: "var(--font-sans)" } }, "⚠️ ", cameraError),
      currentLote ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "inv-btn inv-btn-sec inv-btn-sm",
          style: { padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: 11 },
          disabled: activeBatches.length <= 1,
          onClick: () => {
            const idx = activeBatches.findIndex((l) => l.id === currentLote.id);
            const prevIdx = (idx - 1 + activeBatches.length) % activeBatches.length;
            setQrSelectedLoteId(activeBatches[prevIdx]?.id);
          },
          "aria-label": "Lote anterior"
        },
        /* @__PURE__ */ React.createElement(AppIcon, { name: "chevron-left", size: 12 }),
        " Anterior"
      ), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-600)", fontWeight: 600 } }, "Lote ", activeBatches.findIndex((l) => l.id === currentLote.id) + 1 || 1, " de ", activeBatches.length || 1), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "inv-btn inv-btn-sec inv-btn-sm",
          style: { padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: 11 },
          disabled: activeBatches.length <= 1,
          onClick: () => {
            const idx = activeBatches.findIndex((l) => l.id === currentLote.id);
            const nextIdx = (idx + 1) % activeBatches.length;
            setQrSelectedLoteId(activeBatches[nextIdx]?.id);
          },
          "aria-label": "Siguiente lote"
        },
        "Siguiente ",
        /* @__PURE__ */ React.createElement(AppIcon, { name: "chevron-right", size: 12 })
      )), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", background: "var(--paper-0,#F7F4EC)", border: "1px solid var(--border-hairline,#8C7F5B)", borderRadius: "var(--radius-sm,2px)", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("strong", { style: { fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-0)" } }, currentLote.codigo), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-2)" } }, currentLote.especie)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)", marginTop: 4 } }, "Estado: ", currentLote.estado, " · ", currentLote.numBolsas || 0, " bolsas"), activeBatches.length > 1 && /* @__PURE__ */ React.createElement(
        "select",
        {
          className: "inv-input",
          style: { marginTop: 8, fontSize: 11, minHeight: 38 },
          value: currentLote.id,
          onChange: (e) => setQrSelectedLoteId(e.target.value),
          "aria-label": "Cambiar lote activo"
        },
        activeBatches.map((l) => /* @__PURE__ */ React.createElement("option", { key: l.id, value: l.id }, l.codigo, " — ", l.especie, " (", l.estado, ")"))
      )), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement(
        ColonizationScaleSelector,
        {
          value: (() => {
            const b = bitBolsas.filter((x) => x.loteId === currentLote.id);
            if (!b.length) return 0;
            const avgPct = b.reduce((acc, cur) => acc + (cur.colonizationPct || (cur.col100 ? 100 : cur.col50 ? 50 : cur.col25 ? 25 : 0)), 0) / b.length;
            return Math.round(avgPct / 10) * 10 || (b.some((x) => x.col100) ? 100 : b.some((x) => x.col50) ? 50 : b.some((x) => x.col25) ? 25 : 10);
          })(),
          onChange: (pct) => {
            const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            const loteBolsas = bitBolsas.filter((b) => b.loteId === currentLote.id);
            loteBolsas.forEach((b) => {
              const up = {};
              if (pct >= 25 && !b.col25) up.col25 = today;
              if (pct >= 50 && !b.col50) up.col50 = today;
              if (pct >= 100 && !b.col100) up.col100 = today;
              up.colonizationPct = pct;
              updateBitBolsa(b.id, up);
            });
            if (pct >= 100 && currentLote.estado === "incubacion") {
              updateBitLote(currentLote.id, { estado: "fructificacion" });
            }
            setNoticeDlg({
              title: "Avance registrado",
              msg: `Se registró ${pct}% de colonización en las bolsas del lote ${currentLote.codigo}.`
            });
          },
          onQuickAction: (act) => {
            const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            if (act === "primordios") {
              updateBitLote(currentLote.id, { estado: "fructificacion" });
              const loteBolsas = bitBolsas.filter((b) => b.loteId === currentLote.id);
              loteBolsas.forEach((b) => {
                updateBitBolsa(b.id, { col100: b.col100 || today, colonizationPct: 100 });
              });
              setNoticeDlg({ title: "Primordios confirmados", msg: `Lote ${currentLote.codigo} pasado a etapa de fructificación.` });
            } else if (act === "riego") {
              setNoticeDlg({ title: "Riego y Humedad OK", msg: `Verificación de humedad y niebla registrada para ${currentLote.codigo}.` });
            } else if (act === "ventilacion") {
              setNoticeDlg({ title: "Ventilación activada", msg: `Ciclo de extracción y renovación de aire verificado para ${currentLote.codigo}.` });
            }
          }
        }
      )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          style: { minHeight: 46, cursor: "pointer", background: "var(--accent-olive,#5B6B44)", color: "var(--paper-0,#F7F4EC)", border: "1px solid var(--accent-olive,#5B6B44)", borderRadius: "var(--radius-md,3px)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
          onClick: () => {
            setBitActiveLoteId(currentLote.id);
            setBitCosechaForm({
              loteId: currentLote.id,
              bolsaId: "",
              flush: 1,
              fecha: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              pesoFresco: "",
              calidad: 3,
              observaciones: ""
            });
            setShowQrSheet(false);
            setShowBitCosecha(true);
          }
        },
        /* @__PURE__ */ React.createElement(AppIcon, { name: "harvest", size: 15, color: "var(--paper-0)" }),
        " Registrar Cosecha (g)"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          style: { minHeight: 44, cursor: "pointer", background: "var(--paper-0,#F7F4EC)", color: "var(--ink-0)", border: "1px solid var(--border-hairline,#8C7F5B)", borderRadius: "var(--radius-md,3px)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
          onClick: () => {
            setShowQrSheet(false);
            goTab("control");
          }
        },
        /* @__PURE__ */ React.createElement(AppIcon, { name: "temp", size: 14, color: "var(--ink-0)" }),
        " Registrar Clima / Sala"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          style: { minHeight: 44, cursor: "pointer", background: "var(--accent-terracotta-dim,#EFE0D3)", color: "var(--accent-terracotta,#A85C32)", border: "1px solid var(--accent-terracotta,#A85C32)", borderRadius: "var(--radius-md,3px)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
          onClick: () => {
            setDiagLoteId(currentLote.id);
            const b = bitBolsas.find((x) => x.loteId === currentLote.id && x.estado !== "descartada");
            setDiagBolsaId(b?.id || "");
            setDiagImageBase64("");
            setDiagResult(null);
            setDiagError("");
            setDiagNotes("");
            setShowQrSheet(false);
            setShowDiagModal(true);
          }
        },
        /* @__PURE__ */ React.createElement(AppIcon, { name: "alert", size: 14, color: "var(--accent-terracotta)" }),
        " Reportar Contaminación / Merma"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          style: { minHeight: 44, cursor: "pointer", background: "var(--paper-0,#F7F4EC)", color: "var(--ink-0)", border: "1px solid var(--border-hairline,#8C7F5B)", borderRadius: "var(--radius-md,3px)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
          onClick: () => {
            setThermalLote(currentLote);
            setThermalBagEnd(currentLote.numBolsas || 12);
            setThermalScope("all");
            setShowQrSheet(false);
            setShowThermalModal(true);
          }
        },
        /* @__PURE__ */ React.createElement(AppIcon, { name: "print", size: 14, color: "var(--ink-0)" }),
        " 🏷 Imprimir Etiquetas Térmicas (50×30 / 60×40)"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          style: { minHeight: 44, cursor: "pointer", background: "var(--paper-0,#F7F4EC)", color: "var(--ink-1)", border: "1px solid var(--border-hairline,#8C7F5B)", borderRadius: "var(--radius-md,3px)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
          onClick: () => {
            setShowQrSheet(false);
            setPublicTraceModalLoteId(currentLote.id);
          }
        },
        /* @__PURE__ */ React.createElement(AppIcon, { name: "globe", size: 14, color: "var(--moss-700)" }),
        " Ver Ficha Pública QR (Trazabilidad)"
      ))) : /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "16px 0", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-2)" } }, "No hay lotes activos registrados para escanear.")
    );
  })(), showThermalModal && thermalLote && (() => {
    const lote = thermalLote;
    const totalBags = Math.max(1, lote.numBolsas || 12);
    const items = [];
    if (thermalScope === "cosecha" && thermalCosechaItem) {
      const c = thermalCosechaItem;
      items.push({
        id: `CAN-${lote.codigo}-F${c.flush || 1}`,
        bagCode: `CANASTILLA · FLUSH #${c.flush || 1}`,
        species: lote.especie || "Seta Fresca",
        date: c.fecha || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        recipe: `${c.pesoFresco} g (${(parseFloat(c.pesoFresco || 0) / 1e3).toFixed(2)} kg) · Calidad ${"★".repeat(c.calidad || 4)}`,
        bagsText: `Lote ${lote.codigo} · Bolsa ${c.codigo || "General"}`,
        qrUrl: `https://setasdelapena.co/trace/${lote.codigo}?flush=${c.flush || 1}`
      });
    } else if (thermalScope === "lote") {
      items.push({
        id: lote.codigo,
        bagCode: "LOTE MAESTRO",
        species: lote.especie || "Sustrato colonizado",
        date: lote.fechaInoculacion || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        recipe: lote.recipeRef?.name || "Receta Estándar",
        bagsText: `${totalBags} bolsas`,
        qrUrl: `https://setasdelapena.co/l/${lote.codigo}`
      });
    } else {
      const start = thermalScope === "custom" ? Math.max(1, Math.min(thermalBagStart, totalBags)) : 1;
      const end = thermalScope === "custom" ? Math.max(start, Math.min(thermalBagEnd, totalBags)) : totalBags;
      for (let i = start; i <= end; i++) {
        const bagNum = String(i).padStart(2, "0");
        const bagId = `${lote.codigo}-B${bagNum}`;
        items.push({
          id: bagId,
          bagCode: `BOLSA #${bagNum} de ${totalBags}`,
          species: lote.especie || "Sustrato colonizado",
          date: lote.fechaInoculacion || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          recipe: lote.recipeRef?.name || "Receta Estándar",
          bagsText: `Bolsa ${i}/${totalBags}`,
          qrUrl: `https://setasdelapena.co/c/${bagId}`
        });
      }
    }
    return /* @__PURE__ */ React.createElement(
      AccessibleModal,
      {
        onClose: () => setShowThermalModal(false),
        label: "Generador de etiquetas térmicas",
        dialogStyle: { width: "min(580px, 95vw)", padding: "20px 18px", background: "var(--paper-1, #EFEBE0)", border: "1px solid var(--border-hairline, #8C7F5B)", borderRadius: "var(--radius-md, 3px)" }
      },
      /* @__PURE__ */ React.createElement("style", { dangerouslySetInnerHTML: { __html: `
                  @media print {
                    @page {
                      size: ${thermalSize === "40x30" ? "40mm 30mm" : thermalSize === "50x30" ? "50mm 30mm" : thermalSize === "60x40" ? "60mm 40mm" : thermalSize === "gourmet-wood" ? "180mm 60mm" : thermalSize === "kraft-tray" ? "80mm 120mm" : thermalSize === "apothecary-50" ? "85mm 42mm" : "auto"};
                      margin: 0 !important;
                    }
                    body {
                      margin: 0 !important;
                      padding: 0 !important;
                      background: #ffffff !important;
                    }
                    .thermal-print-roll {
                      background: #ffffff !important;
                    }
                    .thermal-card-print {
                      background: #ffffff !important;
                      color: #000000 !important;
                      border: none !important;
                      box-shadow: none !important;
                      filter: contrast(300%) grayscale(100%) !important;
                    }
                    .thermal-card-print * {
                      background: transparent !important;
                      color: #000000 !important;
                    }
                    .thermal-qr-img {
                      image-rendering: pixelated !important;
                    }
                  }
                ` } }),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid var(--border-hairline, #8C7F5B)", paddingBottom: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-0)" } }, "🏷 Impresión Térmica · Rollo Adhesivo"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--ink-0)", marginTop: 2 } }, "Lote ", lote.codigo, " · ", lote.especie, " ", thermalScope === "cosecha" ? "· Etiqueta Canastilla Cosecha" : "")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "modal-icon-close", "aria-label": "Cerrar generador de etiquetas", onClick: () => setShowThermalModal(false) }, "✕")),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { id: "thermal-format-label", style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ink-2)", marginBottom: 4, textTransform: "uppercase" } }, "Formato de Impresión / Empaque"), /* @__PURE__ */ React.createElement("div", { role: "group", "aria-labelledby": "thermal-format-label", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 6 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setThermalSize("40x30"),
          style: { minHeight: 44, padding: "6px 8px", border: `1px solid ${thermalSize === "40x30" ? "var(--accent-olive, #5B6B44)" : "var(--border-hairline, #8C7F5B)"}`, background: thermalSize === "40x30" ? "var(--accent-olive-dim, #DCE1D1)" : "var(--paper-0, #F7F4EC)", color: thermalSize === "40x30" ? "var(--accent-olive, #5B6B44)" : "var(--ink-0)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, borderRadius: 2, cursor: "pointer" }
        },
        "40 × 30 mm"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setThermalSize("50x30"),
          style: { minHeight: 44, padding: "6px 8px", border: `1px solid ${thermalSize === "50x30" ? "var(--accent-olive, #5B6B44)" : "var(--border-hairline, #8C7F5B)"}`, background: thermalSize === "50x30" ? "var(--accent-olive-dim, #DCE1D1)" : "var(--paper-0, #F7F4EC)", color: thermalSize === "50x30" ? "var(--accent-olive, #5B6B44)" : "var(--ink-0)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, borderRadius: 2, cursor: "pointer" }
        },
        "50 × 30 mm"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setThermalSize("60x40"),
          style: { minHeight: 44, padding: "6px 8px", border: `1px solid ${thermalSize === "60x40" ? "var(--accent-olive, #5B6B44)" : "var(--border-hairline, #8C7F5B)"}`, background: thermalSize === "60x40" ? "var(--accent-olive-dim, #DCE1D1)" : "var(--paper-0, #F7F4EC)", color: thermalSize === "60x40" ? "var(--accent-olive, #5B6B44)" : "var(--ink-0)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, borderRadius: 2, cursor: "pointer" }
        },
        "60 × 40 mm"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setThermalSize("gourmet-wood"),
          style: { minHeight: 44, padding: "6px 8px", border: `1px solid ${thermalSize === "gourmet-wood" ? "var(--accent-olive, #5B6B44)" : "var(--border-hairline, #8C7F5B)"}`, background: thermalSize === "gourmet-wood" ? "var(--accent-olive-dim, #DCE1D1)" : "var(--paper-0, #F7F4EC)", color: thermalSize === "gourmet-wood" ? "var(--accent-olive, #5B6B44)" : "var(--ink-0)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, borderRadius: 2, cursor: "pointer" }
        },
        "Faja Madera (180×60)"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setThermalSize("kraft-tray"),
          style: { minHeight: 44, padding: "6px 8px", border: `1px solid ${thermalSize === "kraft-tray" ? "var(--accent-olive, #5B6B44)" : "var(--border-hairline, #8C7F5B)"}`, background: thermalSize === "kraft-tray" ? "var(--accent-olive-dim, #DCE1D1)" : "var(--paper-0, #F7F4EC)", color: thermalSize === "kraft-tray" ? "var(--accent-olive, #5B6B44)" : "var(--ink-0)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, borderRadius: 2, cursor: "pointer" }
        },
        "Bandeja Kraft (80×120)"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setThermalSize("apothecary-50"),
          style: { minHeight: 44, padding: "6px 8px", border: `1px solid ${thermalSize === "apothecary-50" ? "var(--accent-olive, #5B6B44)" : "var(--border-hairline, #8C7F5B)"}`, background: thermalSize === "apothecary-50" ? "var(--accent-olive-dim, #DCE1D1)" : "var(--paper-0, #F7F4EC)", color: thermalSize === "apothecary-50" ? "var(--accent-olive, #5B6B44)" : "var(--ink-0)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, borderRadius: 2, cursor: "pointer" }
        },
        "Apotecario (50 ml)"
      ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { htmlFor: "thermal-scope", style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ink-2)", marginBottom: 4, textTransform: "uppercase" } }, "Alcance de Impresión"), /* @__PURE__ */ React.createElement(
        "select",
        {
          id: "thermal-scope",
          name: "thermal-scope",
          className: "inv-input",
          style: { minHeight: 44, fontSize: 11 },
          value: thermalScope,
          onChange: (e) => setThermalScope(e.target.value)
        },
        /* @__PURE__ */ React.createElement("option", { value: "all" }, "Todas las bolsas (1 a ", totalBags, ")"),
        /* @__PURE__ */ React.createElement("option", { value: "lote" }, "Solo etiqueta maestra de lote"),
        /* @__PURE__ */ React.createElement("option", { value: "custom" }, "Rango personalizado"),
        /* @__PURE__ */ React.createElement("option", { value: "cosecha" }, "Etiqueta de Canastilla / Cosecha")
      ))),
      thermalScope === "custom" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, background: "var(--paper-0, #F7F4EC)", padding: "8px 10px", borderRadius: 2, border: "1px solid var(--border-hairline, #8C7F5B)" } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "thermal-bag-start", style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Desde bolsa:"), /* @__PURE__ */ React.createElement("input", { id: "thermal-bag-start", name: "thermal-bag-start", type: "number", min: 1, max: totalBags, value: thermalBagStart, onChange: (e) => setThermalBagStart(parseInt(e.target.value) || 1), style: { width: 68, minHeight: 44, fontSize: 11, textAlign: "center" } }), /* @__PURE__ */ React.createElement("label", { htmlFor: "thermal-bag-end", style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Hasta:"), /* @__PURE__ */ React.createElement("input", { id: "thermal-bag-end", name: "thermal-bag-end", type: "number", min: thermalBagStart, max: totalBags, value: thermalBagEnd, onChange: (e) => setThermalBagEnd(parseInt(e.target.value) || totalBags), style: { width: 68, minHeight: 44, fontSize: 11, textAlign: "center" } })),
      /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ink-2)", textTransform: "uppercase" } }, "Vista Previa (", items.length, " etiqueta", items.length === 1 ? "" : "s", ")"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Formato: ", thermalSize === "40x30" ? "40×30 mm" : thermalSize === "50x30" ? "50×30 mm" : thermalSize === "60x40" ? "60×40 mm" : thermalSize === "gourmet-wood" ? "Faja Madera 180×60 mm" : thermalSize === "kraft-tray" ? "Bandeja Kraft 80×120 mm" : "Apotecario 50 ml")), /* @__PURE__ */ React.createElement("div", { className: "thermal-preview-container" }, items.map((item) => {
        const qrSrc = generateQrSvgDataUrl(item.qrUrl);
        return /* @__PURE__ */ React.createElement("div", { key: item.id, className: `thermal-card-preview thermal-card-${thermalSize}` }, /* @__PURE__ */ React.createElement("img", { className: "thermal-qr-img", src: qrSrc, alt: `QR ${item.id}`, width: "96", height: "96" }), /* @__PURE__ */ React.createElement("div", { className: "thermal-body" }, /* @__PURE__ */ React.createElement("div", { className: "thermal-code" }, item.id), /* @__PURE__ */ React.createElement("div", { className: "thermal-species" }, item.species), /* @__PURE__ */ React.createElement("div", { className: "thermal-meta" }, /* @__PURE__ */ React.createElement("div", null, item.bagCode), /* @__PURE__ */ React.createElement("div", null, "Inoc: ", item.date), /* @__PURE__ */ React.createElement("div", null, "Fórmula: ", item.recipe)), /* @__PURE__ */ React.createElement("div", { className: "thermal-footer" }, "Setas de la Peña · Tenjo · 2.592 m")));
      }))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--border-hairline, #8C7F5B)", paddingTop: 12 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowThermalModal(false), className: "inv-btn inv-btn-sec", style: { minHeight: 44, padding: "8px 14px" } }, "Cancelar"), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            try {
              window.print();
            } catch (e) {
              console.error(e);
            }
          },
          className: "inv-btn inv-btn-pri",
          style: { minHeight: 44, padding: "8px 18px", background: "var(--accent-olive, #5B6B44)", borderColor: "var(--accent-olive, #5B6B44)" }
        },
        "🖨 Imprimir ",
        items.length,
        " etiqueta",
        items.length === 1 ? "" : "s"
      )),
      /* @__PURE__ */ React.createElement("div", { className: "thermal-print-roll" }, items.map((item) => {
        const qrSrc = generateQrSvgDataUrl(item.qrUrl);
        return /* @__PURE__ */ React.createElement("div", { key: "print-" + item.id, className: `thermal-card-print thermal-card-${thermalSize}` }, /* @__PURE__ */ React.createElement("img", { className: "thermal-qr-img", src: qrSrc, alt: `QR ${item.id}`, width: "96", height: "96" }), /* @__PURE__ */ React.createElement("div", { className: "thermal-body" }, /* @__PURE__ */ React.createElement("div", { className: "thermal-code" }, item.id), /* @__PURE__ */ React.createElement("div", { className: "thermal-species" }, item.species), /* @__PURE__ */ React.createElement("div", { className: "thermal-meta" }, /* @__PURE__ */ React.createElement("div", null, item.bagCode), /* @__PURE__ */ React.createElement("div", null, "Inoc: ", item.date), /* @__PURE__ */ React.createElement("div", null, "Fórmula: ", item.recipe)), /* @__PURE__ */ React.createElement("div", { className: "thermal-footer" }, "Setas de la Peña · Tenjo · 2.592 m")));
      }))
    );
  })(), showProdLaunchModal && prodLaunchForm && (() => {
    const f = prodLaunchForm;
    const allInsumosOk = f.insumos.every((i) => i.ok);
    const room = ROOMS_CONFIG[f.sala] || ROOMS_CONFIG.martha_01;
    return /* @__PURE__ */ React.createElement(
      AccessibleModal,
      {
        id: "prod-launch-modal",
        isOpen: showProdLaunchModal,
        onClose: () => setShowProdLaunchModal(false),
        title: "🚀 Lanzador de Producción de Lote",
        ariaLabel: "Lanzador de Producción de Lote",
        maxWidth: "680px"
      },
      /* @__PURE__ */ React.createElement("div", { className: "prod-launch-modal", "data-testid": "prod-launch-modal" }, /* @__PURE__ */ React.createElement("div", { className: "prod-launch-summary" }, /* @__PURE__ */ React.createElement("div", { className: "prod-launch-stat" }, /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-lbl" }, "Lote"), /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-val", style: { fontFamily: "var(--font-mono)", fontSize: 14 } }, f.codigo)), /* @__PURE__ */ React.createElement("div", { className: "prod-launch-stat" }, /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-lbl" }, "Especie"), /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-val", style: { fontSize: 14 } }, f.especie)), /* @__PURE__ */ React.createElement("div", { className: "prod-launch-stat" }, /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-lbl" }, "Tamaño"), /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-val" }, f.numBolsas, " bolsas (", (f.numBolsas * f.pesoHumedo).toFixed(1), " kg)")), /* @__PURE__ */ React.createElement("div", { className: "prod-launch-stat" }, /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-lbl" }, "Humedad"), /* @__PURE__ */ React.createElement("span", { className: "prod-launch-stat-val" }, f.humedad, "%"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-1)" } }, "📦 Insumos a Descontar de Bodega"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: allInsumosOk ? "var(--moss-700)" : "var(--coral-500)" } }, allInsumosOk ? "● Stock suficiente para todo el batch" : "⚠ Algunos insumos requieren compra")), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-sm)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("table", { className: "prod-launch-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Insumo"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Requerido"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Stock Actual"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Estado"))), /* @__PURE__ */ React.createElement("tbody", null, f.insumos.map((ins, i) => /* @__PURE__ */ React.createElement("tr", { key: i, style: { background: ins.ok ? "transparent" : "#FFF5F5" } }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 600 } }, ins.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontFamily: "var(--font-num)" } }, ins.krKg.toFixed(2), " kg"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontFamily: "var(--font-num)", color: ins.ok ? "var(--ink-1)" : "var(--coral-500)" } }, ins.stockActual.toFixed(1), " kg"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: ins.ok ? "var(--moss-700)" : "var(--coral-500)" } }, ins.ok ? "✓ OK" : "⚠ Escaso"))))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { htmlFor: "prod-launch-sala", style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-1)", display: "block", marginBottom: 6 } }, "🌱 Sala / Carpa de Destino"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, Object.values(ROOMS_CONFIG).map((r) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: r.id,
          type: "button",
          onClick: () => setProdLaunchForm((prev) => ({ ...prev, sala: r.id })),
          style: {
            padding: "10px 12px",
            border: `1.5px solid ${f.sala === r.id ? "var(--moss-700)" : "var(--border-hairline)"}`,
            background: f.sala === r.id ? "var(--paper-0)" : "#ffffff",
            borderRadius: "var(--radius-sm)",
            textAlign: "left",
            cursor: "pointer"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ink-0)" } }, r.name),
        /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-2)", marginTop: 2 } }, r.spec)
      )))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, padding: "10px 12px", background: "var(--paper-1)", borderRadius: "var(--radius-sm)" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-0)" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: f.printQr,
          onChange: (e) => setProdLaunchForm((prev) => ({ ...prev, printQr: e.target.checked })),
          style: { width: 16, height: 16, accentColor: "var(--moss-700)" }
        }
      ), /* @__PURE__ */ React.createElement("span", null, "🖨 ", /* @__PURE__ */ React.createElement("b", null, "Imprimir etiquetas térmicas con códigos QR"), " para las ", f.numBolsas, " bolsas inmediatamente tras crear."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--border-hairline)", paddingTop: 12 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setShowProdLaunchModal(false),
          className: "inv-btn inv-btn-sec",
          style: { minHeight: 44, padding: "8px 16px" }
        },
        "Cancelar"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: ejecutarLanzamientoProduccion,
          className: "btn-launch-prod",
          style: { minHeight: 44, padding: "8px 20px" }
        },
        "🚀 Confirmar y Lanzar Producción"
      )))
    );
  })(), showTastingModal && (() => {
    const sKey2 = tastingSpeciesKey || "p_ostreatus_gris";
    const gastro = SPECIES_GASTRONOMY[sKey2] || SPECIES_GASTRONOMY.p_ostreatus_gris;
    const spInfo = SPP[sKey2] || SPP.p_ostreatus_gris;
    return /* @__PURE__ */ React.createElement(
      AccessibleModal,
      {
        onClose: () => setShowTastingModal(false),
        label: `Dossier Gastronómico: ${gastro.title}`,
        dialogStyle: { width: "min(720px, 95vw)", padding: "24px 22px", background: "var(--paper-0, #F7F4EC)", border: "1px solid var(--border-hairline, #8C7F5B)", borderRadius: "var(--radius-md, 3px)" }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--accent-olive, #5B6B44)", paddingBottom: 12, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--accent-olive, #5B6B44)" } }, "Ficha Técnica Comercial & Maridaje · Restaurantes de Alta Gama"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-display, Georgia, serif)", fontSize: 22, fontWeight: 700, color: "var(--ink-0, #1A1410)", margin: "4px 0 2px 0" } }, gastro.title), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2, #6E6246)" } }, gastro.botanical, " · Cultivo Agroecológico en Tenjo (2.592 m)")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "modal-icon-close", "aria-label": "Cerrar dossier de cata", onClick: () => setShowTastingModal(false) }, "✕")),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--paper-1, #EFEBE0)", padding: "16px 14px", borderRadius: 2, border: "1px solid var(--border-hairline, #8C7F5B)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 } }, "Notas de Cata & Organolépticas"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--ink-0)" } }, "👃 Aroma:"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-1, #382E2B)", lineHeight: 1.35 } }, gastro.organoleptic.aroma)), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--ink-0)" } }, "👅 Sabor & Umami:"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-1, #382E2B)", lineHeight: 1.35 } }, gastro.organoleptic.flavor)), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--ink-0)" } }, "🥩 Textura en Boca:"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-1, #382E2B)", lineHeight: 1.35 } }, gastro.organoleptic.texture)), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px dashed var(--border-hairline, #8C7F5B)", paddingTop: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "80px 1fr 24px", alignItems: "center", gap: 6, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Umami"), /* @__PURE__ */ React.createElement("div", { className: "tasting-radar-bar" }, /* @__PURE__ */ React.createElement("div", { className: "tasting-radar-fill", style: { width: `${gastro.metrics.umami / 5 * 100}%` } })), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textAlign: "right" } }, gastro.metrics.umami, "/5")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "80px 1fr 24px", alignItems: "center", gap: 6, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Carnosidad"), /* @__PURE__ */ React.createElement("div", { className: "tasting-radar-bar" }, /* @__PURE__ */ React.createElement("div", { className: "tasting-radar-fill", style: { width: `${gastro.metrics.meatiness / 5 * 100}%` } })), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textAlign: "right" } }, gastro.metrics.meatiness, "/5")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "80px 1fr 24px", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Aromáticos"), /* @__PURE__ */ React.createElement("div", { className: "tasting-radar-bar" }, /* @__PURE__ */ React.createElement("div", { className: "tasting-radar-fill", style: { width: `${gastro.metrics.aromatics / 5 * 100}%` } })), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textAlign: "right" } }, gastro.metrics.aromatics, "/5")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 } }, "🍳 Técnicas Sugeridas por el Chef"), gastro.cooking.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { marginBottom: 8, background: "var(--paper-50, #F3EFE6)", padding: "8px 10px", borderRadius: 2, borderLeft: "3px solid var(--accent-olive, #5B6B44)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--ink-0)" } }, c.method), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-1)", marginTop: 2 } }, c.tip)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 } }, "🍷 Armonía & Maridajes Recomendados"), gastro.pairings.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { marginBottom: 6, display: "flex", gap: 6, alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 700, color: "var(--accent-olive, #5B6B44)", minWidth: 70 } }, p.category, ":"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-0)" } }, p.item)))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "8px 10px", background: "var(--paper-1, #EFEBE0)", borderRadius: 2, border: "1px dashed var(--border-hairline, #8C7F5B)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ink-2)" } }, "📦 Presentación Óptima: "), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-0)" } }, gastro.presentation)))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-hairline, #8C7F5B)", paddingTop: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-2)" } }, "Setas de la Peña · Sabana Centro · info@setasdelapena.co"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowTastingModal(false), className: "inv-btn inv-btn-sec", style: { minHeight: 44, padding: "8px 14px" } }, "Cerrar"), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            try {
              window.print();
            } catch (e) {
              console.error(e);
            }
          },
          className: "inv-btn inv-btn-pri",
          style: { minHeight: 44, padding: "8px 18px", background: "var(--accent-olive, #5B6B44)", borderColor: "var(--accent-olive, #5B6B44)" }
        },
        "🖨 Imprimir Ficha de Cata"
      )))
    );
  })(), showEsp32ConfigModal && (() => {
    const roomKey = selectedClimateRoom || "martha_01";
    const room = ROOMS_CONFIG[roomKey] || ROOMS_CONFIG.martha_01;
    const defaultTargets = roomKey === "martha_01" ? {
      temperature_c: { min: 14, max: 20, target: 17 },
      rh_pct: { min: 85, max: 95, target: 90 },
      co2_ppm: { min: 400, max: 900, target: 600 }
    } : {
      temperature_c: { min: 16, max: 22, target: 18.5 },
      rh_pct: { min: 80, max: 92, target: 86 },
      co2_ppm: { min: 450, max: 1e3, target: 700 }
    };
    const isMartha = roomKey === "martha_01";
    const yamlCode = `# ==============================================================================
# Setas de la Peña — Tenjo, Cundinamarca (2.600 msnm)
# Firmware ESPHome: ${room.name} (${room.device})
# Generado automáticamente por Setas OS para control microclimático
# ==============================================================================

substitutions:
  device_name: "${isMartha ? "setas-martha-01" : "setas-cloudlab-01"}"
  friendly_name: "${room.name} (Tenjo)"
  room_id: "${roomKey}"
  adapter_host: "192.168.1.100" # IP del servidor Node.js de Setas OS
  adapter_port: "8080"
  target_temp_min: "${defaultTargets.temperature_c.min}"
  target_temp_max: "${defaultTargets.temperature_c.max}"
  target_rh_min: "${defaultTargets.rh_pct.min}"
  target_rh_max: "${defaultTargets.rh_pct.max}"
  target_co2_max: "${defaultTargets.co2_ppm.max}"

esphome:
  name: \${device_name}
  friendly_name: \${friendly_name}

esp32:
  board: esp32dev
  framework:
    type: arduino

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  ap:
    ssid: "Setas-Fallback-AP"
    password: !secret fallback_password

captive_portal:

logger:
  level: INFO

api:
  encryption:
    key: !secret api_key

ota:
  password: !secret ota_password

# ── I2C Bus para Sensores Ambientales ─────────────────────────────────────────
i2c:
  sda: GPIO21
  scl: GPIO22
  scan: true
  id: bus_a

# ── Sensores Físicos en Sala ──────────────────────────────────────────────────
sensor:
  # AC Infinity SHT3x / Sensirion SHT45 (Temperatura y Humedad)
  - platform: sht3xd
    i2c_id: bus_a
    address: 0x44
    temperature:
      name: "Temperatura Sala"
      id: room_temp
      accuracy_decimals: 1
    humidity:
      name: "Humedad Relativa Sala"
      id: room_humidity
      accuracy_decimals: 1
    update_interval: 15s

  # Sensirion SCD30 (Dióxido de Carbono NDIR)
  # Compensación barométrica fija para altitud de Tenjo (2.600 msnm)
  - platform: scd30
    i2c_id: bus_a
    address: 0x61
    co2:
      name: "CO2 Sala"
      id: room_co2
      accuracy_decimals: 0
    altitude_compensation: 2600m
    automatic_self_calibration: false
    update_interval: 30s

# ── Relés de Potencia Hosyond (Actuadores de Sala) ────────────────────────────
switch:
  # Canal 1: Humidificador AC Infinity CloudForge T7 (Control HR)
  - platform: gpio
    pin: GPIO18
    name: "Humidificador Sala"
    id: relay_ch1_humidifier
    restore_mode: ALWAYS_OFF

  # Canal 2: Extractor FAE AC Infinity Cloudline H4 (Pulsos renovación)
  - platform: gpio
    pin: GPIO19
    name: "Extractor FAE Sala"
    id: relay_ch2_fae
    restore_mode: ALWAYS_OFF

http_request:
  id: http_client
  timeout: 5s

# ── Enlace Periódico de Telemetría con Setas OS ──────────────────────────────
interval:
  - interval: 60s
    then:
      - if:
          condition:
            wifi.connected:
          then:
            - http_request.post:
                url: !lambda |-
                  return "http://" + std::string("\${adapter_host}") + ":" + std::string("\${adapter_port}") + "/api/telemetry";
                headers:
                  Content-Type: application/json
                json:
                  room_id: \${room_id}
                  device_id: \${device_name}
                  temperature: !lambda 'return id(room_temp).state;'
                  humidity: !lambda 'return id(room_humidity).state;'
                  co2: !lambda 'return id(room_co2).state;'
                  source: "esp32_esphome"
`;
    const downloadYaml = () => {
      const blob = new Blob([yamlCode], { type: "text/yaml;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${room.device ? room.device.replace(/[^a-zA-Z0-9_-]/g, "_") : "setas_node"}_esphome.yaml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    const copyYaml = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(yamlCode);
        setNoticeDlg({ msg: "Configuración ESPHome YAML copiada al portapapeles." });
      }
    };
    return /* @__PURE__ */ React.createElement(
      AccessibleModal,
      {
        onClose: () => setShowEsp32ConfigModal(false),
        label: `Configuración ESPHome YAML: ${room.name}`,
        dialogStyle: { width: "min(720px, 95vw)", padding: "22px 20px", background: "var(--paper-0, #F7F4EC)", border: "1px solid var(--border-hairline, #8C7F5B)", borderRadius: "var(--radius-md, 3px)" }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-hairline)", paddingBottom: 12, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-olive, #5B6B44)" } }, "Firmware de Microcontrolador · ESPHome / ESP32"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink-0)", margin: "4px 0 2px 0" } }, room.name, " · ", room.device), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)" } }, "Compensación barométrica a 2.600 msnm (Tenjo) · SHT3x (0x44) + SCD30 (0x61)")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "modal-icon-close", "aria-label": "Cerrar modal de configuración ESP32", onClick: () => setShowEsp32ConfigModal(false) }, "✕")),
      /* @__PURE__ */ React.createElement("div", { className: "esp32-code-preview", style: { marginBottom: 16 } }, yamlCode),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-hairline)", paddingTop: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-2)" } }, "Listo para flashear con ESPHome Dashboard o CLI"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setShowEsp32ConfigModal(false), className: "inv-btn inv-btn-sec", style: { minHeight: 40, padding: "6px 14px" } }, "Cerrar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: copyYaml, className: "inv-btn inv-btn-sec", style: { minHeight: 40, padding: "6px 14px" } }, "📋 Copiar YAML"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: downloadYaml, className: "inv-btn inv-btn-pri", style: { minHeight: 40, padding: "6px 16px", background: "var(--accent-olive, #5B6B44)", borderColor: "var(--accent-olive, #5B6B44)" } }, "📥 Descargar .yaml")))
    );
  })(), showDiagModal && (() => {
    const currentLote = bitLotes.find((l) => l.id === diagLoteId) || bitLotes[0];
    const bolsasDelLote = currentLote ? bitBolsas.filter((b) => b.loteId === currentLote.id) : [];
    const currentBolsa = bolsasDelLote.find((b) => b.id === diagBolsaId) || bolsasDelLote[0];
    const handleFileSelect = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setDiagError("La imagen supera los 10 MB. Comprímela o toma una foto de menor resolución.");
        return;
      }
      try {
        const b64 = await fileToBase64(file);
        setDiagImageBase64(b64);
        setDiagImageMime(file.type || "image/jpeg");
        setDiagError("");
        setDiagResult(null);
      } catch (err) {
        setDiagError("Error al cargar la fotografía.");
      }
    };
    const handleRunDiagnosis = async () => {
      if (!diagImageBase64) {
        setDiagError("Selecciona o toma una fotografía primero.");
        return;
      }
      setDiagRunning(true);
      setDiagError("");
      try {
        if (window.SetasAI && typeof window.SetasAI.diagnoseContaminationImage === "function") {
          const diag = await window.SetasAI.diagnoseContaminationImage({
            base64Data: diagImageBase64,
            mimeType: diagImageMime,
            speciesName: currentLote?.especie || "",
            stage: currentLote?.estado || "",
            roomName: currentLote?.sala || "",
            notes: diagNotes
          });
          setDiagResult(diag);
          setDiagRunning(false);
          return;
        }
        if (window.claude && typeof window.claude.complete === "function") {
          const prompt = `Eres el experto micólogo de Setas de la Peña en Tenjo. Analiza esta foto de una bolsa de cultivo de ${currentLote?.especie || "hongos"}. Emite un JSON estricto: {"patogeno":"nombre","tipo":"hongo_competidor|moho_parasito|bacteria|micelio_sano|estres_ambiental","urgencia":"critica|alta|media|baja|ninguna","confianza":"alta|media|bajo","descripcion_visual":"...","accion_recomendada":"...","posible_causa":"...","estado_bolsa_sugerido":"contaminada|dudosa|descartada|sana"}`;
          const fileBlock = { type: "image", source: { type: "base64", media_type: diagImageMime, data: diagImageBase64 } };
          const resp = await window.claude.complete({
            messages: [{ role: "user", content: [fileBlock, { type: "text", text: prompt }] }]
          });
          setDiagResult(extraerJSON(resp));
          setDiagRunning(false);
          return;
        }
        throw new Error("Servicio de IA no configurado en este navegador.");
      } catch (err) {
        setDiagError(err.message || "No se pudo completar el diagnóstico.");
        setDiagRunning(false);
      }
    };
    const handleApplyVerdict = () => {
      if (!currentBolsa || !diagResult) return;
      const nuevoEstado = diagResult.estado_bolsa_sugerido || "contaminada";
      const anotacion = `[IA Gemini] ${diagResult.patogeno} (${diagResult.urgencia}): ${diagResult.accion_recomendada}`;
      const obsFinal = currentBolsa.obs ? `${currentBolsa.obs} · ${anotacion}` : anotacion;
      updateBitBolsa(currentBolsa.id, {
        estado: nuevoEstado,
        obs: obsFinal
      });
      if (workflow && currentLote) {
        const fromState = legacyLifecycle[currentLote.estado] || "incubation";
        const contBags = bolsasDelLote.filter((b) => b.id !== currentBolsa.id && b.estado === "contaminada").length + (nuevoEstado === "contaminada" ? 1 : 0);
        const contPct = bolsasDelLote.length ? Math.round(contBags / bolsasDelLote.length * 100) : 0;
        if (contPct >= 50 && fromState !== "discarded") {
          const evt = workflow.transitionEvent({
            batchId: currentLote.id,
            from: fromState,
            to: "discarded",
            reason: `Contaminación masiva detectada por IA: ${diagResult.patogeno} (${contPct}%)`
          });
          updateBitLote(currentLote.id, {
            estado: "descartado",
            lifecycleState: "discarded",
            lifecycleEvents: [...currentLote.lifecycleEvents || [], evt]
          });
        }
      }
      setShowDiagModal(false);
      setNoticeDlg({
        title: "🛡 Dictamen Aplicado",
        msg: `Bolsa ${currentBolsa.codigo} actualizada a estado: ${nuevoEstado.toUpperCase()}. ${diagResult.accion_recomendada}`
      });
    };
    return /* @__PURE__ */ React.createElement("div", { className: "inv-modal-bg", style: { zIndex: 99999 }, onClick: () => setShowDiagModal(false) }, /* @__PURE__ */ React.createElement("div", { className: "os-diag-modal", "data-testid": "ai-contamination-diagnosis-modal", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-terracotta)", textTransform: "uppercase", letterSpacing: "0.06em" } }, "Microbiología & Sanidad · Setas OS"), /* @__PURE__ */ React.createElement("h2", { style: { margin: "2px 0 0", fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-0)" } }, "🔬 Diagnóstico Visual de Contaminaciones")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        style: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--ink-2)" },
        onClick: () => setShowDiagModal(false),
        "aria-label": "Cerrar diagnóstico"
      },
      "×"
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-1)", marginBottom: 2 } }, "Lote"), /* @__PURE__ */ React.createElement(
      "select",
      {
        style: { width: "100%", padding: "6px 8px", fontFamily: "var(--font-sans)", fontSize: 12, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-sm)" },
        value: currentLote?.id || "",
        onChange: (e) => {
          setDiagLoteId(e.target.value);
          const b = bitBolsas.find((x) => x.loteId === e.target.value);
          setDiagBolsaId(b?.id || "");
          setDiagResult(null);
        }
      },
      bitLotes.map((l) => /* @__PURE__ */ React.createElement("option", { key: l.id, value: l.id }, l.codigo, " — ", l.especie))
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-1)", marginBottom: 2 } }, "Bolsa Específica"), /* @__PURE__ */ React.createElement(
      "select",
      {
        style: { width: "100%", padding: "6px 8px", fontFamily: "var(--font-sans)", fontSize: 12, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-sm)" },
        value: currentBolsa?.id || "",
        onChange: (e) => setDiagBolsaId(e.target.value)
      },
      bolsasDelLote.map((b) => /* @__PURE__ */ React.createElement("option", { key: b.id, value: b.id }, b.codigo, " (", b.estado, ")"))
    ))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-1)", marginBottom: 4 } }, "Fotografía de la Bolsa / Síntoma"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "file",
        accept: "image/*",
        capture: "environment",
        style: { fontFamily: "var(--font-sans)", fontSize: 12, width: "100%" },
        onChange: handleFileSelect
      }
    ), diagImageBase64 && /* @__PURE__ */ React.createElement(
      "img",
      {
        src: `data:${diagImageMime};base64,${diagImageBase64}`,
        alt: "Muestra de bolsa",
        className: "os-diag-preview"
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-1)", marginBottom: 2 } }, "Observaciones del Operario (opcional)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Ej. Olor agrio, manchas circulares, 3 días de incubación...",
        style: { width: "100%", boxSizing: "border-box", padding: "6px 8px", fontFamily: "var(--font-sans)", fontSize: 12, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-sm)" },
        value: diagNotes,
        onChange: (e) => setDiagNotes(e.target.value)
      }
    )), diagError && /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", background: "#FEE2E2", color: "#991B1B", borderRadius: "var(--radius-sm)", fontSize: 12, marginBottom: 12 } }, "⚠ ", diagError), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        style: {
          width: "100%",
          minHeight: 44,
          cursor: !diagImageBase64 || diagRunning ? "not-allowed" : "pointer",
          background: !diagImageBase64 || diagRunning ? "var(--paper-2)" : "var(--accent-terracotta)",
          color: !diagImageBase64 || diagRunning ? "var(--ink-2)" : "#ffffff",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8
        },
        disabled: !diagImageBase64 || diagRunning,
        onClick: handleRunDiagnosis
      },
      diagRunning ? "⏳ Analizando imagen con Gemini 2.5 Flash..." : "🔍 Diagnosticar con Gemini AI"
    ), diagResult && /* @__PURE__ */ React.createElement("div", { className: "os-diag-result-card" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-0)" } }, diagResult.patogeno), /* @__PURE__ */ React.createElement("span", { className: `os-diag-urgency-${diagResult.urgencia}`, style: { padding: "3px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700, textTransform: "uppercase", fontFamily: "var(--font-mono)" } }, "Urgencia: ", diagResult.urgencia)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--ink-1)", lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement("strong", null, "Signos visibles:"), " ", diagResult.descripcion_visual), diagResult.posible_causa && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--ink-2)" } }, /* @__PURE__ */ React.createElement("strong", null, "Posible causa:"), " ", diagResult.posible_causa), /* @__PURE__ */ React.createElement("div", { className: "os-diag-protocol-box" }, /* @__PURE__ */ React.createElement("strong", null, "Protocolo Inmediato:"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 2 } }, diagResult.accion_recomendada)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 6 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        style: {
          flex: 1,
          minHeight: 42,
          cursor: "pointer",
          background: "var(--moss-700,#385933)",
          color: "#ffffff",
          border: "none",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 700
        },
        onClick: handleApplyVerdict
      },
      "🛡 Aplicar Dictamen & Actualizar Bolsa"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        style: {
          minHeight: 42,
          padding: "0 14px",
          cursor: "pointer",
          background: "var(--paper-1)",
          color: "var(--ink-0)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 600
        },
        onClick: () => setShowDiagModal(false)
      },
      "Cerrar"
    )))));
  })(), publicTraceModalLoteId && /* @__PURE__ */ React.createElement(
    PublicTraceabilityModal,
    {
      loteId: publicTraceModalLoteId,
      loteCode: publicTraceModalLoteId,
      lotes: bitLotes,
      cosechas: bitCosechas,
      onClose: () => setPublicTraceModalLoteId(null)
    }
  ), showIoTHub && /* @__PURE__ */ React.createElement(
    IoTHubModal,
    {
      isOpen: showIoTHub,
      onClose: () => setShowIoTHub(false),
      selectedRoomId: selectedClimateRoom,
      onInjectReading: (r) => {
        setInjectedClimateReadings((prev) => ({
          ...prev,
          [r.roomId]: {
            temp: r.temp,
            rh: r.rh,
            co2: r.co2,
            subTemp: r.subTemp,
            timestamp: r.timestamp || "hace 1s"
          }
        }));
      },
      setSelectedClimateRoom,
      setNoticeDlg
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { height: 40 } })), (RECETA_TABS.includes(tab) && tab !== "formular" || tab === "produccion" || tab === "schedule") && /* @__PURE__ */ React.createElement("section", { "data-testid": "species-bridge", className: "species-bridge" + (bridgeHidden ? " bridge-hidden" : ""), "aria-label": "Especie activa" }, /* @__PURE__ */ React.createElement("div", { className: "bridge-inner" }, !hasPickedSpecies ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "bridge-activo" }, /* @__PURE__ */ React.createElement("span", { className: "bridge-dot" }, "●"), "Sin especie"), /* @__PURE__ */ React.createElement("span", { className: "bridge-name" }, "Elige una especie para empezar"), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("select", { className: "bridge-select", value: "", onClick: (e) => e.stopPropagation(), onChange: (e) => {
    if (e.target.value) setSKey(e.target.value);
  }, "aria-label": "Elegir especie" }, /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "Elegir especie…"), Object.entries(SPP).map(([k, d]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, d.name))), /* @__PURE__ */ React.createElement("button", { className: "bridge-cambiar", onClick: (e) => {
    e.stopPropagation();
    goTab("catalogo");
  }, style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", padding: "6px 12px", background: "var(--accent-terracotta)", color: "#fff", border: "1px solid var(--accent-terracotta)", cursor: "pointer", transition: "background-color .15s,border-color .15s,color .15s,transform .15s", whiteSpace: "nowrap", flexShrink: 0 } }, "Ver catálogo"))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "bridge-activo" }, /* @__PURE__ */ React.createElement("span", { className: "bridge-dot" }, "●"), "Activo"), /* @__PURE__ */ React.createElement("span", { className: "bridge-name" }, sp.name), bridgeOpen && /* @__PURE__ */ React.createElement("em", { className: "bridge-sci" }, sp.scientific), bridgeOpen && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 24, alignItems: "center", flexShrink: 0 }, className: "bridge-stats-group" }, /* @__PURE__ */ React.createElement("div", { className: "bridge-stat" }, /* @__PURE__ */ React.createElement("span", { className: "bridge-stat-lbl" }, "C:N"), /* @__PURE__ */ React.createElement("span", { className: "bridge-stat-val" }, sp.cn_optimal.ideal, " : 1")), /* @__PURE__ */ React.createElement("div", { className: "bridge-stat" }, /* @__PURE__ */ React.createElement("span", { className: "bridge-stat-lbl" }, "Temp"), /* @__PURE__ */ React.createElement("span", { className: "bridge-stat-val" }, sp.temp_fruit)), /* @__PURE__ */ React.createElement("div", { className: "bridge-stat" }, /* @__PURE__ */ React.createElement("span", { className: "bridge-stat-lbl" }, "CO Base"), /* @__PURE__ */ React.createElement("span", { className: "bridge-stat-val" }, sp.eb_baseline, " %"))), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("select", { className: "bridge-select", value: sKey, onClick: (e) => e.stopPropagation(), onChange: (e) => {
    e.stopPropagation();
    setSKey(e.target.value);
  }, "aria-label": "Cambiar especie", title: "Cambiar especie sin salir del formulador" }, Object.entries(SPP).map(([k, d]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, d.name))), bridgeOpen && /* @__PURE__ */ React.createElement("button", { className: "bridge-cambiar", onClick: (e) => {
    e.stopPropagation();
    goTab("catalogo");
  }, style: { fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-button)", textTransform: "uppercase", padding: "6px 12px", background: "var(--accent-terracotta)", color: "#fff", border: "1px solid var(--accent-terracotta)", cursor: "pointer", transition: "background-color .15s,border-color .15s,color .15s,transform .15s", whiteSpace: "nowrap", flexShrink: 0 } }, "Ver catálogo"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "bridge-toggle", "aria-expanded": bridgeOpen, "aria-label": bridgeOpen ? "Ocultar parámetros de especie" : "Mostrar parámetros de especie", onClick: () => setBridgeOpen((o) => !o) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { display: "inline-block", transform: bridgeOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform .15s" } }, "▾")))))));
}
window.SimuladorApp = App;
document.addEventListener("scroll", (e) => {
  const t = e.target;
  if (t && t.classList && (t.classList.contains("cats") || t.classList.contains("presets") || t.classList.contains("sub-tabs") || t.classList.contains("mode-switcher") || t.classList.contains("builder-subtabs"))) {
    t.classList.toggle("scrolled", t.scrollLeft > 4);
  }
}, true);
