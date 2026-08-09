// AUTO-GENERATED from simulador-app.jsx by build.js — do not edit directly.
// Run `node build.js` after changing simulador-app.jsx and commit this file.
// source-hash: 00719cce643fc8f02f106b888ebe18654bdb82019da1a8eeba4d2e806d950046
const {
  useState,
  useMemo,
  useEffect,
  useRef
} = React;
const IMG = {
  p_ostreatus_gris: window.__resources && window.__resources.img_p_ostreatus_gris || '_standalone_imgs/grey-mushroom.png',
  p_ostreatus_blanco: window.__resources && window.__resources.img_p_ostreatus_blanco || '_standalone_imgs/orellana-blanca.png',
  p_djamor_rosa: window.__resources && window.__resources.img_p_djamor_rosa || '_standalone_imgs/orellana-rosa.png',
  p_eryngii: window.__resources && window.__resources.img_p_eryngii || '_standalone_imgs/cardo.png',
  shiitake: window.__resources && window.__resources.img_shiitake || '_standalone_imgs/shiitake.png',
  lions_mane: window.__resources && window.__resources.img_lions_mane || '_standalone_imgs/lions-mane.png',
  reishi: window.__resources && window.__resources.img_reishi || '_standalone_imgs/reishi.png',
  enoki: window.__resources && window.__resources.img_enoki || '_standalone_imgs/enoki.png',
  nameko: window.__resources && window.__resources.img_nameko || '_standalone_imgs/nameko.png'
};
const SPP_DIFFICULTY = {
  p_ostreatus_gris: 'Baja',
  p_ostreatus_blanco: 'Baja',
  p_djamor_rosa: 'Media',
  p_eryngii: 'Alta',
  shiitake: 'Alta',
  lions_mane: 'Media',
  reishi: 'Muy alta',
  enoki: 'Alta',
  nameko: 'Media'
};
const SPP_DETAILS = {
  p_ostreatus_gris: {
    hechos: ['Con paja de trigo a C:N 40, puede superar el 120% de eficiencia biológica — es decir, produce más peso fresco que el sustrato seco del que parte. Pocos organismos logran esto.', 'Tolera hasta un 5% de contaminación visible en bloque sin colapsar la cosecha. Su agresividad colonizadora suprime hongos competidores mejor que cualquier otra orellana.', 'Cada 5°C que bajes la temperatura de fructificación (dentro del rango), el sombrero se vuelve un 15–20% más oscuro y la textura más firme. La misma receta, sabor distinto.']
  },
  p_ostreatus_blanco: {
    hechos: ['Requiere exactamente el mismo rango C:N que la orellana gris, pero responde mucho más al exceso de nitrógeno: sobre C:N 25, las primordias abortan antes de abrirse. El margen de error es más estrecho.', 'Su micelio coloniza paja sin pasteurizar más rápido que con pasteurización ácida — una curiosidad contraintuitiva. La flora nativa de la paja fresca no la suprime; la estimula.', 'A 24°C de fructificación produce el mayor rendimiento pero el menor sabor. A 18°C produce 20% menos masa pero concentra compuestos aromáticos: vale la pena si vendes a cocineros.']
  },
  p_djamor_rosa: {
    hechos: ['Es la única orellana que fructifica bien a 28–30°C. Si en verano tu cuarto no baja de 26°C, djamor rosa es literalmente la única opción viable — las demás cederán ante el calor.', 'Su tasa de spawn óptima es inusualmente alta (18–22%). Bajar a 10% alarga la colonización 8–12 días y el riesgo de contaminación se multiplica por tres en climas cálidos.', 'Pierde el color rosa en menos de 6 horas tras la cosecha a temperatura ambiente. Para mantenerlo, cosecha en primordia pequeña y refrigera de inmediato. El simulador no puede optimizar esto — es post-cosecha pura.']
  },
  p_eryngii: {
    hechos: ['Es la única seta de este simulador que requiere una fase de inducción de frío obligatoria (4–10°C, 4–7 días) para primordializar. Sin ese choque térmico, el sustrato con receta perfecta no producirá nada.', 'C:N óptimo para eryngii: 40–65:1 (ideal 50). Este rango alto significa que el sustrato debe tener más carbono que nitrógeno — sustratos ricos en N (salvado >15%) generan colonización sin fructificación. Dato corregido: el rango anterior 25–35 correspondía a P. ostreatus, no a eryngii.', 'Su eficiencia biológica parece baja en papel (40–70%), pero el rendimiento económico por kg supera al shiitake: el pie carnoso pesa el triple que el sombrero de otras especies a igual tamaño.']
  },
  shiitake: {
    hechos: ['La relación C:N ideal (60–80) es la segunda más alta del catálogo. Añadir salvado de trigo más allá del 10% no mejora el rendimiento — lo destruye: exceso de nitrógeno genera bloque verde en 48 horas.', 'El periodo de incubación en aserrín de roble puede ser de 60–90 días. Pero cada día extra de madurez post-colonización antes del choque se traduce en +3–5% de eficiencia biológica. La paciencia tiene retorno medible.', 'Produce lentinan principalmente en el cuerpo fructifícola, no en el micelio. Las recetas de alto rendimiento rápido (substrato enriquecido, alta temperatura) producen más masa pero menos lentinan por gramo.']
  },
  lions_mane: {
    hechos: ['Extremadamente sensible al CO₂: concentraciones superiores a 1000 ppm durante la fructificación producen el elongamiento característico de espinas — bonito visualmente, pero indica estrés y reduce rendimiento un 20–30%.', 'Es la especie más sensible al exceso de H₂O en sustrato. Con humedad superior al 68% en la mezcla, el micelio se ahoga antes de colonizar completamente. El rango óptimo de 60–65% es estrecho y no perdona.', 'La primera cosecha puede superar el 30% de la masa del bloque — la más concentrada del catálogo. Pero la segunda cosecha cae al 10–15%. No es una especie para ciclos largos; optimiza para primera flush.']
  },
  reishi: {
    hechos: ['La única especie del catálogo que no debes formular con salvado de trigo. El exceso de nitrógeno suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Más nitrógeno = más masa, menos principio activo.', 'Produce el antílago (polvillo esporal) más denso de todas las especies cultivadas: hasta 20g de esporas por bloque. Ese polvo tiene más concentración de triterpenoides que el cuerpo fructifícola. Colectarlo es tan valioso como la cosecha.', 'Con aserrín de roble sin enriquecer y temperatura constante de 26°C, el sombrero lacado tarda 45–60 días en completarse. Cada grado extra de temperatura acelera el crecimiento pero reduce la calidad del lacado superficial.']
  },
  enoki: {
    hechos: ['El enoki "largo y blanco" del supermercado es un artefacto de cultivo en oscuridad con CO₂ elevado. Si ventiles bien tu cuarto, obtendrás sombreros marrones abiertos — igual de comestibles, radicalmente distintos visualmente.', 'Fructifica óptimamente a 8–12°C — la temperatura más baja del catálogo. Esto lo hace complementario estacional perfecto: mientras otras especies no fructifican en invierno, enoki llega a su máximo rendimiento.', 'La colonización es notablemente lenta (18–25 días a 20°C), pero el sustrato colonizado tolera refrigeración hasta 4 semanas sin perder capacidad. Puedes preparar bloques en lote y activarlos cuando necesites.']
  },
  nameko: {
    hechos: ['El mucílago que recubre su sombrero es un polisacárido que el propio hongo sintetiza como protección ante pérdida de agua. Paradoja: a mayor humedad relativa (>92%), produce más mucílago, no menos. Es una señal de bienestar, no de estrés.', 'Requiere la mayor humedad relativa del catálogo durante fructificación (90–95%). Por debajo del 88%, las primordias se secan antes de crecer. Un higrometro preciso es equipamiento no-negociable para esta especie.', 'Produce consistentemente dos cosechas de calidad similar — inusual. La mayoría de especies caen 30–50% en segunda cosecha. Nameko mantiene el 80–85% del primer rendimiento si el bloque se sumerge en agua fría 12 horas entre flush.']
  }
};

// ── GUÍA DE FORMULACIÓN — criterios de selección de ingredientes por especie ──
const SPP_SUBSTRATE_GUIDE = {
  p_ostreatus_gris: ['Base Cóptima: paja de trigo o cebada (C:N 75–85) al 55–70%. Evita aserín sin compostar — su lignina es inaccesible para esta especie y solo encarece sin aportar.', 'Suplemento N: salvado de trigo 15–25% más borra de café 7–12%. Esta combinación baja costo y aporta N progresivo; no uses solo uno de los dos si puedes combinarlos.', 'Ajuste de pH obligatorio: carbonato de calcio 2–5% + yeso 2–3%. Sin tamponamiento, la fermentación acidifica el bloque y colapsa la cosecha 2 y 3.', 'Evita superar 25% total de suplementos N (salvado + borra + café juntos). Por encima de ese umbral el riesgo de Trichoderma se dispara, especialmente sin autoclave.'],
  p_ostreatus_blanco: ['Base C: paja de trigo 50–60%. El blanco tolera menos variación de C:N que el gris — apunta siempre a 28–32 como objetivo final calculado.', 'Suplemento N preferido: afrecho de cervecería 12–18%. Libera nitrógeno más lentamente que el salvado puro y reduce el riesgo de contaminación temprana.', 'Salvado de trigo máximo 15%. Más allá de ese punto la primordiación falla en blanco aunque el micelio colonice bien — el N alto suprime la formación de sombrero.', 'Borra de café: máximo 8–10%. Más acidifica el pH por debajo de 6.0, inhibiendo el desarrollo del sombrero blanco que distingue a esta variedad.'],
  p_djamor_rosa: ['Base C tropical: bagazo de caña 40–55% + paja de arroz 20–30%. Estas bases tolera la humedad alta que requiere el djamor y son idóneas para clima cálido.', 'Suplemento N moderado: salvado de trigo 10–15% o borra de café 10–15%. La especie no requiere N muy alto — C:N objetivo 35–45, no más bajo.', 'Tasa de spawn alta (18–22%) es parte de la fórmula. No la intercambión por más suplemento — el spawn agresivo suprime contaminantes mejor que ningún ingrediente.', 'Evita aserín de madera y sustratos lígneos pesados: el djamor rosa es lignínolítico débil y no aprovechará esa fracción, generando sustrato sin colonizar.'],
  p_eryngii: ['Base C: paja de trigo 35–45% + aserín de roble o álamo 10–18%. La combinación de paja y madera dura da la textura necesaria para el stípite carnoso del eryngii.', 'Suplemento N: afrecho de cervecería 18–22% es el más eficiente. El salvado de trigo funciona pero eleva el riesgo de contaminación — si lo usas, no pases del 15%.', 'Polvo de hueso 2–4% mejora el desarrollo del pie. El fósforo de liberación lenta favorece la formación del stípite sin subir el N total disponible.', 'Cero gallinaza ni estiércol de alta carga N. El eryngii requiere C:N ≥40 — cualquier fuente de N muy alto baja la relación por debajo del mínimo y suprime la fructificación.'],
  shiitake: ['Base C exclusiva: aserín de madera dura (roble, álamo) 55–70%. La lignina de madera dura es la fuente de carbono que el shiitake degrada con sus enzimas lacasas. Paja sola no funciona.', 'Salvado de trigo: máximo 15–18%. Pasado ese punto el bloque verde (Trichoderma) aparece en 48 h incluso con autoclave. Prefiere cascarilla de soya 5–8% como suplemento complementario.', 'Yeso agrícola 2–3% es no-negociable: estabiliza pH durante la esterilización y mejora la textura del bloque. Sin yeso, el pH puede subir a 8.5 y el micelio no germina.', 'Periodo de colonización largo (60–90 d): no compenses acortando con más suplemento N. Más N = más contaminación, no más velocidad en shiitake.'],
  lions_mane: ['Master Mix de referencia: aserín de madera dura 50–60% + cascarilla de soya 35–45%. Esta combinación logra EB 150–180%. No reemplaces cascarilla de soya por salvado de trigo en proporciones iguales — son distintos en densidad nutricional.', 'Humedad del sustrato seco: apunta a 60–65%, más seco que otras especies. Ingredientes húmedos (borra fresca, pseudotallo de plátano) suben la actividad acuosa y favorecen contaminación.', 'Evita absolutamente aserín de eucalipto. Sus aceites esenciales inhiben el micelio de Hericium de forma directa e irreversible. Usa solo maderas duras neutras: roble, álamo, sauce.', 'Afrecho de cervecería 10–15% es un buen suplemento secundario. La cascarilla de soya ya aporta N suficiente — el afrecho suma perfil de aminoácidos sin saturar nitrógeno.'],
  reishi: ['No uses salvado de trigo como suplemento principal. El exceso de N libre suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Máximo 8–10% de suplemento N total.', 'Base C: aserín de roble 55–65% + corteza de árbol molida 10–15%. La corteza aporta lignina compleja que ralentiza la colonización y estimula la producción de lacasa, necesaria para el lacado del sombrero.', 'Cascarilla de soya 8–12% es el suplemento N preferido: nitrógeno de liberación lenta que no dispara contaminación ni suprime la ruta de triterpenoides.', 'Evita ingredientes cálidos o de rápida descomposición (borra de café fresca, pulpa de cacao). El reishi requiere sustrato estático y de baja actividad microbiana durante los 60–90 días de colonización.'],
  enoki: ['Base C: paja de arroz 30–40% + aserín de álamo o sauce 15–20%. La paja de arroz da la textura ligera que necesita el enoki para colonizar a baja temperatura (5–12°C).', 'Suplemento N estrella: afrecho de cervecería 18–25%. Su perfil de aminoácidos estimula el desarrollo de los cuerpos fructíferos alargados que caracterizan al enoki comercial.', 'Evita cartones y papel como base principal: el enoki necesita sustrato estructuralmente firme para colonizar correctamente en frío. La celulosa pura colapsa y ahoga el micelio.', 'C:N objetivo muy preciso: 25–30. Cada punto por encima de 30 alarga la colonización (ya de por sí 18–25 días), elevando el riesgo de contaminación en cámara fría.'],
  nameko: ['Base C: aserín de roble 40–50% + paja de arroz 15–25%. El nameko degrada lignocelulosa más lento que el shiitake — la combinación de madera y paja le da fibras accesibles para arrancar.', 'Borra de café 5–8% en la mezcla mejora rendimiento en primera cosecha y reduce el tiempo de colonización. Más del 10% puede inhibir la segunda cosecha — que en nameko es excepcionalmente buena.', 'Suplemento N bajo: afrecho de cervecería 10–15% como máximo. La tasa de N ideal es 0.8–1.5% — evita gallinaza, harina de soya o cualquier fuente de N muy alto.', 'Yeso 2–3% + carbonato de calcio 2–3% son obligatorios. El nameko necesita pH 5.5–6.5 estable y el yeso mejora la textura del bloque para las dos cosechas de calidad similar.']
};
const SPP_FAMILY = {
  p_ostreatus_gris: 'Pleurotaceae',
  p_ostreatus_blanco: 'Pleurotaceae',
  p_djamor_rosa: 'Pleurotaceae',
  p_eryngii: 'Pleurotaceae',
  shiitake: 'Omphalotaceae',
  lions_mane: 'Hericiaceae',
  reishi: 'Polyporaceae',
  enoki: 'Physalacriaceae',
  nameko: 'Strophariaceae'
};
const SPP_HR = {
  p_ostreatus_gris: '88–95%',
  p_ostreatus_blanco: '88–95%',
  p_djamor_rosa: '85–95%',
  p_eryngii: '85–95%',
  shiitake: '80–95%',
  lions_mane: '85–95%',
  reishi: '85–95%',
  enoki: '80–90%',
  nameko: '85–95%'
};
const SPP_CODE = {
  p_ostreatus_gris: 'SDP-001',
  p_ostreatus_blanco: 'SDP-002',
  p_djamor_rosa: 'SDP-003',
  p_eryngii: 'SDP-004',
  shiitake: 'SDP-005',
  lions_mane: 'SDP-006',
  reishi: 'SDP-007',
  enoki: 'SDP-008',
  nameko: 'SDP-009'
};
const BANDS = {
  p_ostreatus_gris: 'oklch(50% 0.12 25)',
  p_ostreatus_blanco: 'oklch(55% 0.10 28)',
  p_djamor_rosa: 'oklch(48% 0.13 20)',
  p_eryngii: 'oklch(45% 0.09 265)',
  shiitake: 'var(--accent-olive)',
  lions_mane: 'oklch(52% 0.11 35)',
  reishi: 'oklch(42% 0.10 10)',
  enoki: 'oklch(43% 0.08 260)',
  nameko: 'oklch(46% 0.09 95)'
};
const SPP = {
  p_ostreatus_gris: {
    name: 'Orellana Gris',
    scientific: 'Pleurotus ostreatus',
    cn_optimal: {
      min: 25,
      max: 50,
      ideal: 35
    },
    n_optimal: {
      min: 0.8,
      max: 2.0,
      ideal: 1.4
    },
    ph_optimal: {
      min: 6.0,
      max: 7.5
    },
    moisture: {
      ideal: 65
    },
    eb_baseline: 90,
    eb_optimal: 130,
    supplementation_max: 20,
    spawn_rate: 8,
    notes: 'La más fácil de cultivar. Tolera amplio rango de C:N. Ideal clima Sabana.',
    temp_fruit: '12–22°C'
  },
  p_ostreatus_blanco: {
    name: 'Orellana Blanca',
    scientific: 'Pleurotus florida',
    cn_optimal: {
      min: 25,
      max: 45,
      ideal: 30
    },
    n_optimal: {
      min: 1.0,
      max: 2.0,
      ideal: 1.5
    },
    ph_optimal: {
      min: 6.0,
      max: 7.0
    },
    moisture: {
      ideal: 65
    },
    eb_baseline: 80,
    eb_optimal: 120,
    supplementation_max: 18,
    spawn_rate: 8,
    notes: 'Tallos blancos premium.',
    temp_fruit: '14–20°C'
  },
  p_djamor_rosa: {
    name: 'Orellana Rosa',
    scientific: 'Pleurotus djamor',
    cn_optimal: {
      min: 30,
      max: 50,
      ideal: 40
    },
    n_optimal: {
      min: 0.8,
      max: 1.8,
      ideal: 1.2
    },
    ph_optimal: {
      min: 5.5,
      max: 6.5
    },
    moisture: {
      ideal: 67
    },
    eb_baseline: 70,
    eb_optimal: 110,
    supplementation_max: 15,
    spawn_rate: 7,
    notes: 'TERMÓFILA. Aborta primordios bajo 15°C.',
    temp_fruit: '20–28°C'
  },
  p_eryngii: {
    name: 'Seta de Cardo',
    scientific: 'Pleurotus eryngii',
    cn_optimal: {
      min: 40,
      max: 65,
      ideal: 50
    },
    n_optimal: {
      min: 0.8,
      max: 1.6,
      ideal: 1.2
    },
    ph_optimal: {
      min: 5.5,
      max: 7.0
    },
    moisture: {
      ideal: 63
    },
    eb_baseline: 60,
    eb_optimal: 90,
    supplementation_max: 25,
    spawn_rate: 5,
    notes: 'PREMIUM. Requiere esterilización. C:N alto 40–65 (literatura Kim 2011). Precio 2–3× orellana.',
    temp_fruit: '12–18°C'
  },
  shiitake: {
    name: 'Shiitake',
    scientific: 'Lentinula edodes',
    cn_optimal: {
      min: 35,
      max: 70,
      ideal: 50
    },
    n_optimal: {
      min: 0.6,
      max: 1.2,
      ideal: 0.9
    },
    ph_optimal: {
      min: 5.0,
      max: 6.0
    },
    moisture: {
      ideal: 60
    },
    eb_baseline: 50,
    eb_optimal: 100,
    supplementation_max: 20,
    spawn_rate: 5,
    notes: 'Ciclo largo 90–120 d. REQUIERE ESTERILIZACIÓN.',
    temp_fruit: '12–18°C'
  },
  lions_mane: {
    name: 'Melena de León',
    scientific: 'Hericium erinaceus',
    cn_optimal: {
      min: 25,
      max: 48,
      ideal: 33
    },
    n_optimal: {
      min: 1.0,
      max: 2.0,
      ideal: 1.5
    },
    ph_optimal: {
      min: 5.0,
      max: 6.5
    },
    moisture: {
      ideal: 65
    },
    eb_baseline: 50,
    eb_optimal: 160,
    supplementation_max: 25,
    spawn_rate: 5,
    notes: 'MEDICINAL premium. Master Mix (madera dura + cascarilla de soya 50:50) = sustrato óptimo, EB 150–180%. Evitar eucalipto.',
    temp_fruit: '15–20°C'
  },
  reishi: {
    name: 'Reishi',
    scientific: 'Ganoderma lucidum',
    cn_optimal: {
      min: 35,
      max: 65,
      ideal: 50
    },
    n_optimal: {
      min: 0.7,
      max: 1.2,
      ideal: 0.9
    },
    ph_optimal: {
      min: 4.5,
      max: 6.0
    },
    moisture: {
      ideal: 60
    },
    eb_baseline: 30,
    eb_optimal: 60,
    supplementation_max: 15,
    spawn_rate: 5,
    notes: 'MEDICINAL. Ciclo 4–6 meses.',
    temp_fruit: '20–26°C'
  },
  enoki: {
    name: 'Enoki',
    scientific: 'Flammulina velutipes',
    cn_optimal: {
      min: 25,
      max: 40,
      ideal: 27
    },
    n_optimal: {
      min: 1.2,
      max: 2.5,
      ideal: 1.8
    },
    ph_optimal: {
      min: 5.0,
      max: 7.0
    },
    moisture: {
      ideal: 65
    },
    eb_baseline: 60,
    eb_optimal: 90,
    supplementation_max: 30,
    spawn_rate: 10,
    notes: 'CRIÓFILOS: 5–12°C. EB óptima 90% en cond. artesanales (120% requiere refrigeración activa <12°C). Ideal Tenjo en invierno.',
    temp_fruit: '5–12°C'
  },
  nameko: {
    name: 'Nameko',
    scientific: 'Pholiota nameko',
    cn_optimal: {
      min: 30,
      max: 50,
      ideal: 40
    },
    n_optimal: {
      min: 0.8,
      max: 1.5,
      ideal: 1.1
    },
    ph_optimal: {
      min: 5.0,
      max: 6.5
    },
    moisture: {
      ideal: 65
    },
    eb_baseline: 40,
    eb_optimal: 100,
    supplementation_max: 20,
    spawn_rate: 5,
    notes: 'Gelatinoso, precio alto gourmet. EB hasta 100% en roble+salvado optimizado (Stamets 2000).',
    temp_fruit: '10–18°C'
  }
};
const INGS = [
// cra=Capacidad Retención Agua 0-5 | ph=pH propio | dig=digestibilidad 1-10 (celulosa accesible/lignina)
// === BASE CARBONO ===
{
  id: 'paja_trigo',
  name: 'Paja de trigo',
  cat: 'base',
  cn: 90,
  n: .5,
  c: 45,
  moisture: 12,
  cra: 4,
  ph: 6.5,
  dig: 7,
  role: 'base_carbono',
  tags: ['Base', 'Carbono'],
  cost: 2500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii']
}, {
  id: 'paja_cebada',
  name: 'Paja de cebada',
  cat: 'base',
  cn: 90,
  n: .5,
  c: 45,
  moisture: 12,
  cra: 4,
  ph: 6.5,
  dig: 7,
  role: 'base_carbono',
  tags: ['Base', 'Carbono'],
  cost: 2400,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii']
}, {
  id: 'paja_avena',
  name: 'Paja de avena',
  cat: 'base',
  cn: 75,
  n: .6,
  c: 45,
  moisture: 12,
  cra: 4.5,
  ph: 6.5,
  dig: 8,
  role: 'base_carbono',
  tags: ['Base', 'Cereales'],
  cost: 2200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii']
}, {
  id: 'paja_arroz',
  name: 'Paja de arroz',
  cat: 'base',
  cn: 65,
  n: .7,
  c: 46,
  moisture: 12,
  cra: 2.5,
  ph: 6.8,
  dig: 4,
  role: 'base_carbono',
  tags: ['Base', 'Cereales'],
  cost: 1800,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'nameko', 'enoki']
}, {
  id: 'bagazo_caña',
  name: 'Bagazo de caña fresco',
  cat: 'base',
  cn: 60,
  n: .7,
  c: 42,
  moisture: 55,
  cra: 4,
  ph: 5.5,
  dig: 7,
  role: 'base_carbono',
  tags: ['Base', 'Local', 'Fresco 50–60% H₂O'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'aserrin_roble',
  name: 'Aserrín de roble',
  cat: 'base',
  cn: 500,
  n: .1,
  c: 50,
  moisture: 12,
  cra: 3,
  ph: 4.5,
  dig: 2,
  role: 'base_carbono',
  tags: ['Base', 'Madera dura'],
  cost: 2500,
  cs: ['shiitake', 'lions_mane', 'reishi', 'nameko']
}, {
  id: 'aserrin_eucalipto',
  name: 'Aserrín de eucalipto',
  cat: 'base',
  cn: 350,
  n: .15,
  c: 50,
  moisture: 12,
  cra: 3,
  ph: 5.0,
  dig: 3,
  role: 'base_carbono',
  tags: ['Base', 'Madera', '⚠Aceites: rinde menos que madera dura'],
  cost: 2000,
  cs: ['p_ostreatus_gris', 'shiitake']
}, {
  id: 'aserrin_pino',
  name: 'Aserrín de pino fresco (requiere pretratamiento)',
  cat: 'base',
  cn: 600,
  n: .08,
  c: 50,
  moisture: 12,
  cra: 2.5,
  ph: 4.5,
  dig: 1,
  role: 'base_carbono',
  tags: ['NO usar fresco', 'Terpenos inhibitorios', 'Exige lavado/compostaje 3–4 m'],
  cost: 1500,
  cs: [],
  notes: 'Terpenos y resinas abortan el micelio de Pleurotus/Hericium de inmediato. PROHIBIDO en fresco: requiere compostaje térmico prolongado (3–4 meses) o lavado químico parametrizado antes de cualquier uso. Para producción real usar la variante compostada.'
}, {
  id: 'aserrin_pino_compostado',
  name: 'Aserrín pino compostado (3–4 m)',
  cat: 'base',
  cn: 200,
  n: .2,
  c: 40,
  moisture: 15,
  cra: 3,
  ph: 5.5,
  dig: 4,
  role: 'base_carbono',
  tags: ['Base', 'Gratis'],
  cost: 2200,
  cs: ['p_ostreatus_gris', 'shiitake', 'lions_mane']
}, {
  id: 'aserrin_alamo',
  name: 'Aserrín de álamo/sauce (Sabana)',
  cat: 'base',
  cn: 200,
  n: .20,
  c: 45,
  moisture: 12,
  cra: 3.5,
  ph: 5.5,
  dig: 4,
  role: 'base_carbono',
  tags: ['Base', 'Madera', 'Sabana', 'Fácil conseguir'],
  cost: 1800,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'lions_mane', 'shiitake', 'reishi', 'nameko', 'enoki']
}, {
  id: 'cascarilla_arroz',
  name: 'Cascarilla de arroz',
  cat: 'base',
  cn: 80,
  n: .5,
  c: 40,
  moisture: 10,
  cra: 1.5,
  ph: 6.8,
  dig: 3,
  role: 'aireador',
  tags: ['Aireador', 'Local'],
  cost: 4000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'tamo_trigo',
  name: 'Tamo de trigo',
  cat: 'base',
  cn: 100,
  n: .4,
  c: 40,
  moisture: 10,
  cra: 2,
  ph: 6.8,
  dig: 5,
  role: 'aireador',
  tags: ['Aireador', 'Carbono'],
  cost: 1600,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'cascarilla_coco',
  name: 'Fibra de coco',
  cat: 'base',
  cn: 93,
  n: .5,
  c: 47,
  moisture: 13,
  cra: 3,
  ph: 6.0,
  dig: 3,
  role: 'aireador',
  tags: ['Aireador', 'Tropical'],
  cost: 8500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'lions_mane'],
  notes: 'Ficha técnica del usuario: N 0.4–0.6%, C 45–48%, C:N 75–110:1, celulosa 20–30%, hemicelulosa 15–20%, lignina 40–50%, cenizas 2–6%, pH 5.5–6.5, CE 1.5–3.0 mS/cm (alto K⁺/Na⁺ residual — sin lavar), humedad 10–15%. dig bajado de 4→3 por la lignina alta (40–50%) frente a la turba de coco buferizada.'
}, {
  id: 'turba_coco_buferizada',
  name: 'Turba de coco buferizada',
  cat: 'base',
  cn: 75,
  n: .6,
  c: 46,
  moisture: 11,
  cra: 4,
  ph: 6.5,
  dig: 4,
  role: 'aireador',
  tags: ['Aireador', 'Tropical', 'Buferizada', 'Precio no confirmado — actualizar en Precios'],
  cost: 0,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'lions_mane'],
  notes: 'Ficha técnica del usuario: N 0.5–0.7% (incremento leve por remanente de Ca(NO₃)₂), C 44–47%, C:N 65–85:1, celulosa 15–25%, hemicelulosa 10–18%, lignina 35–45%, cenizas 4–8% (intercambio catiónico Ca²⁺/Mg²⁺), pH 6.2–6.8, CE <0.5–0.8 mS/cm (sales lavadas y estabilizadas — mucho más baja que la fibra de coco sin procesar), humedad 10–12%. CRA más alta (4) que fibra de coco por el buferizado; dig levemente mejor (4) por su procesamiento.'
}, {
  id: 'tusa_maiz',
  name: 'Tusa de maíz',
  cat: 'base',
  cn: 70,
  n: .7,
  c: 45,
  moisture: 15,
  cra: 3,
  ph: 6.5,
  dig: 6,
  role: 'base_carbono',
  tags: ['Base', 'Local'],
  cost: 1500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'rastrojo_maiz',
  name: 'Rastrojo de maíz',
  cat: 'base',
  cn: 60,
  n: .6,
  c: 45,
  moisture: 15,
  cra: 3.5,
  ph: 6.5,
  dig: 6,
  role: 'base_carbono',
  tags: ['Base', 'Local'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'kikuyo',
  name: 'Kikuyo seco',
  cat: 'base',
  cn: 25,
  n: 1.8,
  c: 45,
  moisture: 12,
  cra: 4,
  ph: 6.5,
  dig: 8,
  role: 'base_carbono',
  tags: ['Local', 'Sabana'],
  cost: 1400,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'hojarasca',
  name: 'Hojarasca de bosque',
  cat: 'base',
  cn: 50,
  n: .9,
  c: 45,
  moisture: 20,
  cra: 3.5,
  ph: 5.8,
  dig: 5,
  role: 'base_carbono',
  tags: ['Local', 'Gratis'],
  cost: 0,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'retamo_espinoso',
  name: 'Retamo espinoso',
  cat: 'base',
  cn: 32,
  n: 1.5,
  c: 47,
  moisture: 11,
  cra: 3,
  ph: 6.0,
  dig: 5,
  role: 'base_carbono',
  tags: ['Base', 'Local', 'Precio no confirmado — actualizar en Precios'],
  cost: 0,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa'],
  notes: 'Ficha técnica del usuario: N 1.4–1.6%, C 46–48%, C:N 30–34:1, celulosa 45–47.5%, hemicelulosa 21–22.5%, lignina 23–24.5%, cenizas 3.5–4.5%, pH 5.8–6.2, humedad 10–12%. Digestibilidad y compatibilidad de especies estimadas por analogía con arbustos leñosos similares (no verificadas en ensayo) — confirmar con prueba piloto antes de escalar.'
}, {
  id: 'guadua',
  name: 'Guadua astillada',
  cat: 'base',
  cn: 120,
  n: .35,
  c: 42,
  moisture: 15,
  cra: 3,
  ph: 6.0,
  dig: 4,
  role: 'base_carbono',
  tags: ['Base', 'Bambú'],
  cost: 2500,
  cs: ['p_ostreatus_gris', 'shiitake', 'lions_mane']
}, {
  id: 'heno_pangola',
  name: 'Heno de pangola',
  cat: 'base',
  cn: 60,
  n: .8,
  c: 48,
  moisture: 12,
  cra: 4,
  ph: 6.5,
  dig: 7,
  role: 'base_carbono',
  tags: ['Base', 'Local'],
  cost: 6500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'chips_poda_urbana',
  name: 'Chips poda urbana (sauce/fresno)',
  cat: 'base',
  cn: 150,
  n: .30,
  c: 45,
  moisture: 15,
  cra: 3,
  ph: 6.2,
  dig: 5,
  role: 'base_carbono',
  tags: ['Base', 'Gratis', 'Tenjo'],
  cost: 0,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'shiitake', 'lions_mane']
},
// === CELULÓSICOS / PAPEL ===
{
  id: 'carton_corrugado',
  name: 'Cartón corrugado troceado',
  cat: 'base',
  cn: 350,
  n: .13,
  c: 45,
  moisture: 8,
  cra: 3.5,
  ph: 7.0,
  dig: 9,
  role: 'base_carbono',
  tags: ['Base', 'Gratis', 'Celulosa'],
  cost: 800,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'shiitake', 'lions_mane']
}, {
  id: 'carton_huevo',
  name: 'Cartón de huevo',
  cat: 'base',
  cn: 150,
  n: .28,
  c: 42,
  moisture: 8,
  cra: 4,
  ph: 7.0,
  dig: 8,
  role: 'base_carbono',
  tags: ['Base', 'Gratis', 'Aireador'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'papel_periodico',
  name: 'Papel periódico / kraft',
  cat: 'base',
  cn: 170,
  n: .25,
  c: 43,
  moisture: 6,
  cra: 2.5,
  ph: 7.0,
  dig: 8,
  role: 'base_carbono',
  tags: ['Base', 'Celulosa'],
  cost: 1500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'pulpa_papel',
  name: 'Pulpa de papel (residuo industrial)',
  cat: 'base',
  cn: 200,
  n: .20,
  c: 44,
  moisture: 50,
  cra: 4,
  ph: 7.0,
  dig: 9,
  role: 'base_carbono',
  tags: ['Base', 'Celulosa', 'Industrial'],
  cost: 1800,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'lions_mane']
},
// === FIBRAS LOCALES ===
{
  id: 'fique_cabuya',
  name: 'Fique / cabuya (fibra)',
  cat: 'base',
  cn: 80,
  n: .55,
  c: 44,
  moisture: 12,
  cra: 3.5,
  ph: 6.3,
  dig: 5,
  role: 'base_carbono',
  tags: ['Base', 'Local', 'Colombia'],
  cost: 4500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'tallo_girasol',
  name: 'Tallo de girasol triturado',
  cat: 'base',
  cn: 55,
  n: .8,
  c: 44,
  moisture: 12,
  cra: 3.5,
  ph: 6.5,
  dig: 7,
  role: 'base_carbono',
  tags: ['Base', 'Sabana'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii']
}, {
  id: 'paja_soya',
  name: 'Paja / rastrojo de soya',
  cat: 'base',
  cn: 25,
  n: 1.8,
  c: 45,
  moisture: 12,
  cra: 3.5,
  ph: 6.5,
  dig: 7,
  role: 'suplemento_medio',
  tags: ['Base', 'N medio', 'Leguminosa'],
  cost: 500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_eryngii']
}, {
  id: 'fibra_palma',
  name: 'Fibra de palma de aceite',
  cat: 'base',
  cn: 70,
  n: .7,
  c: 49,
  moisture: 18,
  cra: 3,
  ph: 5.8,
  dig: 4,
  role: 'base_carbono',
  tags: ['Base', 'Industrial'],
  cost: 1800,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
},
// === TROPICALES ===
{
  id: 'pseudotallo_platano',
  name: 'Pseudotallo plátano',
  cat: 'trop',
  cn: 42,
  n: 1.1,
  c: 46,
  moisture: 85,
  cra: 5,
  ph: 6.2,
  dig: 8,
  role: 'base_carbono',
  tags: ['Tropical', 'EB alto'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'cascara_platano',
  name: 'Cáscara de plátano',
  cat: 'trop',
  cn: 30,
  n: 1.5,
  c: 45,
  moisture: 12,
  cra: 3.5,
  ph: 5.8,
  dig: 7,
  role: 'suplemento_medio',
  tags: ['Tropical', 'N medio'],
  cost: 1500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'hoja_platano',
  name: 'Hoja de plátano seca',
  cat: 'trop',
  cn: 35,
  n: 1.3,
  c: 46,
  moisture: 12,
  cra: 3.5,
  ph: 6.0,
  dig: 7,
  role: 'base_carbono',
  tags: ['Tropical', 'Local'],
  cost: 2500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'cascara_aguacate',
  name: 'Cáscara de aguacate',
  cat: 'trop',
  cn: 45,
  n: 1.0,
  c: 45,
  moisture: 15,
  cra: 2.5,
  ph: 5.5,
  dig: 4,
  role: 'base_carbono',
  tags: ['Tropical'],
  cost: 1400,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'bagazo_lulo',
  name: 'Bagazo de lulo/mora',
  cat: 'trop',
  cn: 22,
  n: 2.0,
  c: 44,
  moisture: 70,
  cra: 4,
  ph: 4.5,
  dig: 8,
  role: 'suplemento_medio',
  tags: ['Tropical', 'N medio', 'Gratis'],
  cost: 1500,
  cs: ['p_ostreatus_gris', 'p_djamor_rosa']
}, {
  id: 'cascara_cacao',
  name: 'Cáscara de cacao',
  cat: 'local',
  cn: 35,
  n: 1.3,
  c: 46,
  moisture: 10,
  cra: 3,
  ph: 5.5,
  dig: 6,
  role: 'suplemento_medio',
  tags: ['Local', 'Colombia', 'N medio'],
  cost: 3500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii']
}, {
  id: 'pulpa_cacao',
  name: 'Pulpa / mucílago de cacao',
  cat: 'trop',
  cn: 18,
  n: 2.5,
  c: 45,
  moisture: 80,
  cra: 4,
  ph: 4.0,
  dig: 9,
  role: 'suplemento_n',
  tags: ['Tropical', 'N alto', 'Colombia'],
  cost: 4500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
},
// === CAFÉ ===
{
  id: 'borra_cafe',
  name: 'Borra de café (SCG)',
  cat: 'cafe',
  cn: 22,
  n: 2.0,
  c: 47,
  moisture: 68,
  cra: 4,
  ph: 6.0,
  dig: 5,
  role: 'suplemento_n',
  tags: ['Café', 'N alto', 'Gratis/Muy bajo', 'Humedad 65–72%'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'shiitake', 'nameko']
}, {
  id: 'cascara_cafe',
  name: 'Cáscara de café',
  cat: 'cafe',
  cn: 32,
  n: 1.4,
  c: 45,
  moisture: 12,
  cra: 3,
  ph: 5.8,
  dig: 5,
  role: 'suplemento_medio',
  tags: ['Café', 'N medio'],
  cost: 3000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'pulpa_cafe',
  name: 'Pulpa de café',
  cat: 'cafe',
  cn: 25,
  n: 2.5,
  c: 45,
  moisture: 70,
  cra: 4,
  ph: 5.5,
  dig: 6,
  role: 'suplemento_n',
  tags: ['Café', 'N alto'],
  cost: 2500,
  cs: ['p_ostreatus_gris', 'p_djamor_rosa']
},
// === SUPLEMENTOS N ===
{
  id: 'salvado_trigo',
  name: 'Salvado de trigo',
  cat: 'sup',
  cn: 16,
  n: 2.8,
  c: 45,
  moisture: 12,
  cra: 3,
  ph: 6.2,
  dig: 8,
  role: 'suplemento_n',
  tags: ['N alto', 'Estándar'],
  cost: 5200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'shiitake', 'lions_mane', 'reishi', 'nameko']
}, {
  id: 'salvado_arroz',
  name: 'Salvado de arroz',
  cat: 'sup',
  cn: 18,
  n: 2.2,
  c: 47,
  moisture: 12,
  cra: 2.5,
  ph: 6.5,
  dig: 7,
  role: 'suplemento_n',
  tags: ['N alto'],
  cost: 4200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'shiitake', 'lions_mane']
}, {
  id: 'salvado_maiz',
  name: 'Salvado de maíz',
  cat: 'sup',
  cn: 20,
  n: 2.2,
  c: 44,
  moisture: 12,
  cra: 2.5,
  ph: 6.3,
  dig: 7,
  role: 'suplemento_n',
  tags: ['N alto', 'Local'],
  cost: 3800,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'shiitake']
}, {
  id: 'cascarilla_soya',
  name: 'Cascarilla de soya/soja (hull)',
  cat: 'sup',
  cn: 17,
  n: 2.8,
  c: 47,
  moisture: 10,
  cra: 2.5,
  ph: 6.8,
  dig: 7,
  role: 'suplemento_n',
  tags: ['N muy alto', 'Leguminosa'],
  cost: 5800,
  cs: ['shiitake', 'lions_mane', 'reishi', 'p_eryngii', 'p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'enoki', 'nameko']
}, {
  id: 'harina_soya',
  name: 'Harina de soya tostada',
  cat: 'sup',
  cn: 8,
  n: 7.0,
  c: 52,
  moisture: 8,
  cra: 2,
  ph: 6.5,
  dig: 8,
  role: 'suplemento_n',
  tags: ['N muy alto'],
  cost: 8500,
  cs: ['p_eryngii', 'shiitake', 'lions_mane']
}, {
  id: 'afrecho_cerveceria',
  name: 'Afrecho de cervecería (spent grain)',
  cat: 'sup',
  cn: 11,
  n: 4.2,
  c: 46,
  moisture: 75,
  cra: 4.5,
  ph: 5.5,
  dig: 7,
  role: 'suplemento_n',
  tags: ['N muy alto', 'Gratis'],
  cost: 2500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'shiitake', 'lions_mane', 'nameko', 'enoki']
}, {
  id: 'cascarilla_quinua',
  name: 'Cascarilla de quinua',
  cat: 'sup',
  cn: 30,
  n: 1.5,
  c: 45,
  moisture: 10,
  cra: 2,
  ph: 6.5,
  dig: 6,
  role: 'suplemento_medio',
  tags: ['N medio', 'Boyacá'],
  cost: 4500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii']
}, {
  id: 'torta_girasol',
  name: 'Torta de girasol',
  cat: 'sup',
  cn: 7,
  n: 5.0,
  c: 45,
  moisture: 10,
  cra: 2,
  ph: 6.2,
  dig: 7,
  role: 'suplemento_n',
  tags: ['N muy alto'],
  cost: 4800,
  cs: ['p_eryngii', 'shiitake', 'lions_mane', 'reishi']
},
// === ESTIÉRCOL ===
{
  id: 'gallinaza',
  name: 'Gallinaza compostada',
  cat: 'est',
  cn: 10,
  n: 3.5,
  c: 35,
  moisture: 20,
  cra: 2.5,
  ph: 7.5,
  dig: 8,
  role: 'suplemento_n',
  tags: ['N alto'],
  cost: 2500,
  cs: ['p_ostreatus_gris']
}, {
  id: 'estiercol_equino',
  name: 'Estiércol equino puro',
  cat: 'est',
  cn: 25,
  n: 1.8,
  c: 45,
  moisture: 30,
  cra: 3,
  ph: 7.5,
  dig: 7,
  role: 'suplemento_n',
  tags: ['Local', 'Tenjo'],
  cost: 1800,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'pesebrera_completa',
  name: 'Cama de pesebrera (viruta+esc) ⚠️C:N50',
  cat: 'est',
  cn: 50,
  n: .9,
  c: 45,
  moisture: 30,
  cra: 3.5,
  ph: 7.2,
  dig: 5,
  role: 'base_carbono',
  tags: ['Local', 'Tenjo', 'Gratis'],
  cost: 0,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
},
// === LOCALES SABANA ===
{
  id: 'capacho_uchuva',
  name: 'Capacho de uchuva',
  cat: 'local',
  cn: 40,
  n: 1.1,
  c: 44,
  moisture: 14,
  cra: 2.5,
  ph: 6.0,
  dig: 6,
  role: 'suplemento_medio',
  tags: ['Local', 'Tenjo', 'Gratis'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'cascara_arveja',
  name: 'Cáscara de arveja',
  cat: 'local',
  cn: 35,
  n: 1.3,
  c: 45,
  moisture: 12,
  cra: 3,
  ph: 6.3,
  dig: 6,
  role: 'suplemento_medio',
  tags: ['Local', 'Cundinamarca'],
  cost: 1400,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'tallo_rosa',
  name: 'Tallo de rosa molido',
  cat: 'local',
  cn: 45,
  n: 1.0,
  c: 45,
  moisture: 15,
  cra: 3.5,
  ph: 6.5,
  dig: 5,
  role: 'base_carbono',
  tags: ['Local', 'Floricultura'],
  cost: 1500,
  cs: ['p_ostreatus_gris']
}, {
  id: 'follaje_crisantemo',
  name: 'Follaje de crisantemo',
  cat: 'local',
  cn: 40,
  n: 1.2,
  c: 45,
  moisture: 18,
  cra: 3.5,
  ph: 6.5,
  dig: 6,
  role: 'base_carbono',
  tags: ['Local', 'Floricultura'],
  cost: 1200,
  cs: ['p_ostreatus_gris']
}, {
  id: 'residuo_clavel',
  name: 'Residuo de clavel (Madrid/Facatativá)',
  cat: 'local',
  cn: 45,
  n: 1.0,
  c: 45,
  moisture: 18,
  cra: 4.5,
  ph: 6.5,
  dig: 5,
  role: 'base_carbono',
  tags: ['Local', 'Floricultura', 'Gratis'],
  cost: 1000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'rastrojo_papa',
  name: 'Rastrojo de papa (Villapinzón)',
  cat: 'local',
  cn: 35,
  n: 1.2,
  c: 42,
  moisture: 12,
  cra: 3,
  ph: 6.3,
  dig: 7,
  role: 'suplemento_medio',
  tags: ['Local', 'Cundinamarca'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'rastrojo_frijol',
  name: 'Rastrojo de fríjol',
  cat: 'local',
  cn: 25,
  n: 1.8,
  c: 45,
  moisture: 12,
  cra: 3,
  ph: 6.5,
  dig: 7,
  role: 'suplemento_medio',
  tags: ['Local', 'N medio'],
  cost: 1600,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'cascara_maní',
  name: 'Cáscara de maní',
  cat: 'local',
  cn: 28,
  n: 1.6,
  c: 45,
  moisture: 8,
  cra: 2,
  ph: 6.3,
  dig: 6,
  role: 'suplemento_medio',
  tags: ['N medio', 'Leguminosa'],
  cost: 300,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'cascara_papa',
  name: 'Cáscara de papa',
  cat: 'local',
  cn: 15,
  n: 3.0,
  c: 45,
  moisture: 80,
  cra: 4,
  ph: 6.0,
  dig: 8,
  role: 'suplemento_n',
  tags: ['Local', 'N alto', 'Gratis'],
  cost: 1500,
  cs: ['p_ostreatus_gris']
},
// === ECONOMÍA CIRCULAR ===
{
  id: 'sms',
  name: 'Sustrato agotado (SMS)',
  cat: 'circ',
  cn: 18,
  n: 2.5,
  c: 45,
  moisture: 70,
  cra: 4,
  ph: 6.5,
  dig: 6,
  role: 'suplemento_medio',
  tags: ['Circular', 'N alto'],
  cost: 0,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'lombricompost',
  name: 'Lombricompost',
  cat: 'circ',
  cn: 12,
  n: 3.0,
  c: 36,
  moisture: 35,
  cra: 3.5,
  ph: 7.0,
  dig: 8,
  role: 'suplemento_n',
  tags: ['N alto', 'Microflora'],
  cost: 5000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'compost_maduro',
  name: 'Compost maduro (>3 meses)',
  cat: 'circ',
  cn: 15,
  n: 2.8,
  c: 42,
  moisture: 35,
  cra: 3.5,
  ph: 7.0,
  dig: 8,
  role: 'suplemento_n',
  tags: ['N alto', 'Estable'],
  cost: 2500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
},
// === ADITIVOS ===
{
  id: 'carbonato_calcio',
  name: 'Carbonato de calcio',
  cat: 'adit',
  cn: 0,
  n: 0,
  c: 0,
  moisture: 0,
  cra: 0,
  ph: 9.5,
  dig: 0,
  role: 'aditivo_ph',
  tags: ['pH', 'Mineral'],
  cost: 3000,
  cs: Object.keys(SPP)
}, {
  id: 'yeso',
  name: 'Yeso agrícola',
  cat: 'adit',
  cn: 0,
  n: 0,
  c: 0,
  moisture: 0,
  cra: 0,
  ph: 7.0,
  dig: 0,
  role: 'aditivo_estructura',
  tags: ['Estructura', 'Ca'],
  cost: 2200,
  cs: Object.keys(SPP)
}, {
  id: 'sulfato_magnesio',
  name: 'Sulfato de magnesio',
  cat: 'adit',
  cn: 0,
  n: 0,
  c: 0,
  moisture: 0,
  cra: 0,
  ph: 7.0,
  dig: 0,
  role: 'aditivo_micronutriente',
  tags: ['Mg', 'Cofactor'],
  cost: 10000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'shiitake', 'lions_mane']
}, {
  id: 'melaza',
  name: 'Melaza',
  cat: 'adit',
  cn: 30,
  n: .5,
  c: 38,
  moisture: 25,
  cra: 1,
  ph: 5.5,
  dig: 9,
  role: 'aditivo_arrancador',
  tags: ['Arrancador'],
  cost: 6500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco']
}, {
  id: 'ceniza_vegetal',
  name: 'Ceniza vegetal',
  cat: 'adit',
  cn: 0,
  n: 0,
  c: 0,
  moisture: 0,
  cra: 0,
  ph: 11.0,
  dig: 0,
  role: 'aditivo_ph',
  tags: ['pH', 'K', 'Gratis'],
  cost: 3000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'zeolita',
  name: 'Zeolita natural',
  cat: 'adit',
  cn: 0,
  n: 0,
  c: 0,
  moisture: 0,
  cra: 5,
  ph: 7.2,
  dig: 0,
  role: 'aditivo_estructura',
  tags: ['Estructura', 'Retención'],
  cost: 8500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_eryngii', 'shiitake', 'lions_mane']
}, {
  id: 'tiamina',
  name: 'Tiamina (Vit B1)',
  cat: 'adit',
  cn: 0,
  n: 0,
  c: 0,
  moisture: 0,
  cra: 0,
  ph: 7.0,
  dig: 0,
  role: 'aditivo_micronutriente',
  tags: ['Vitamina', 'Cofactor'],
  cost: 120000,
  cs: Object.keys(SPP)
},
// === NUEVOS INGREDIENTES v21.5 ===
{
  id: 'harina_alfalfa',
  name: 'Harina de Alfalfa',
  cat: 'sup',
  cn: 14,
  n: 2.5,
  c: 35,
  moisture: 8,
  cra: 3.2,
  ph: 7.2,
  dig: 7,
  role: 'suplemento_n',
  tags: ['Proteína', 'Leguminosa', 'Bioestimulante'],
  cost: 8000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'lions_mane', 'enoki', 'nameko', 'p_djamor_rosa']
}, {
  id: 'cascarilla_huevo_molida',
  name: 'Cascarilla de Huevo Molida',
  cat: 'adit',
  cn: 0,
  n: 0,
  c: 0,
  moisture: 2,
  cra: 0.8,
  ph: 8.8,
  dig: 0,
  role: 'aditivo_ph',
  tags: ['Calcio', 'Lento', 'Biodegradable'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'shiitake', 'lions_mane', 'reishi', 'enoki', 'nameko']
}, {
  id: 'polvo_hueso',
  name: 'Polvo de Hueso',
  cat: 'sup',
  cn: 11,
  n: 2.5,
  c: 28,
  moisture: 3,
  cra: 1.2,
  ph: 7.0,
  dig: 2,
  role: 'suplemento_n',
  tags: ['Fósforo', 'Lento', 'Premium'],
  cost: 8500,
  cs: ['p_eryngii', 'shiitake', 'lions_mane', 'reishi', 'nameko']
}, {
  id: 'corteza_molida',
  name: 'Corteza de Árbol Molida',
  cat: 'base',
  cn: 160,
  n: 0.3,
  c: 48,
  moisture: 25,
  cra: 2.1,
  ph: 6.5,
  dig: 3,
  role: 'base_carbono',
  tags: ['Estructura', 'Lento', 'Shiitake'],
  cost: 1400,
  cs: ['shiitake', 'lions_mane', 'reishi']
}, {
  id: 'harina_trigo',
  name: 'Harina de Trigo Integral',
  cat: 'sup',
  cn: 12,
  n: 2.8,
  c: 40,
  moisture: 10,
  cra: 2.5,
  ph: 6.5,
  dig: 6,
  role: 'suplemento_n',
  tags: ['Proteína', 'Gluten', 'Bioestimulante'],
  cost: 1200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'nameko']
}, {
  id: 'harina_maiz',
  name: 'Harina de Maíz (Afrecho)',
  cat: 'sup',
  cn: 8,
  n: 3.2,
  c: 36,
  moisture: 12,
  cra: 3.0,
  ph: 6.8,
  dig: 7,
  role: 'suplemento_n',
  tags: ['Proteína', 'Local', 'Económico'],
  cost: 1000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'lions_mane', 'enoki']
}, {
  id: 'harina_pescado',
  name: 'Harina de Pescado Deshidratada',
  cat: 'sup',
  cn: 4,
  n: 9.5,
  c: 38,
  moisture: 6,
  cra: 0.8,
  ph: 6.5,
  dig: 2,
  role: 'suplemento_n',
  tags: ['Proteína Pura', 'Premium', 'Olor fuerte', 'Autoclave obligatorio'],
  cost: 14000,
  cs: ['p_ostreatus_gris', 'enoki'],
  notes: 'Uso experimental. Olor fuerte atrae ácaros/Sciaridae. Solo autoclave. Máx 3%.'
}, {
  id: 'salvado_avena',
  name: 'Salvado de Avena',
  cat: 'sup',
  cn: 15,
  n: 2.6,
  c: 39,
  moisture: 10,
  cra: 3.5,
  ph: 6.6,
  dig: 8,
  role: 'suplemento_n',
  tags: ['Fibra', 'N medio', 'Local', 'Requiere control sanitario'],
  cost: 7500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'enoki', 'nameko', 'lions_mane', 'shiitake']
}, {
  id: 'cascarilla_girasol',
  name: 'Cascarilla de Girasol',
  cat: 'sup',
  cn: 25,
  n: 1.8,
  c: 42,
  moisture: 12,
  cra: 3.2,
  ph: 6.5,
  dig: 5,
  role: 'suplemento_medio',
  tags: ['Fibra', 'Aireador', 'Económico'],
  cost: 3500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'lions_mane', 'enoki']
}, {
  id: 'algas_marinas',
  name: 'Algas Marinas Molidas',
  cat: 'adit',
  cn: 13,
  n: 1.5,
  c: 20,
  moisture: 12,
  cra: 2.2,
  ph: 7.8,
  dig: 2,
  role: 'aditivo_micronutriente',
  tags: ['Bioácidos', 'Yodo', 'Premium'],
  cost: 18000,
  cs: ['lions_mane', 'nameko', 'p_ostreatus_blanco']
}, {
  id: 'estierc_gallina_deshid',
  name: 'Estiércol de Gallina Deshidratado',
  cat: 'est',
  cn: 7,
  n: 3.5,
  c: 25,
  moisture: 8,
  cra: 3.8,
  ph: 7.5,
  dig: 6,
  role: 'suplemento_n',
  tags: ['Balanceado', 'Local', 'Rápido'],
  cost: 2200,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'enoki', 'nameko']
}, {
  id: 'vermicompost',
  name: 'Vermicompost',
  cat: 'circ',
  cn: 15,
  n: 1.8,
  c: 27,
  moisture: 35,
  cra: 4.2,
  ph: 6.9,
  dig: 8,
  role: 'suplemento_medio',
  tags: ['Microbios', 'Bioestimulante', 'Premium'],
  cost: 6000,
  cs: ['lions_mane', 'p_ostreatus_blanco', 'nameko', 'p_eryngii']
}, /* ── NUEVOS v3.1 — Investigación Sabana de Bogotá 2026 ──────────────── */
{
  id: 'pulpa_alfalfa',
  name: 'Pulpa de Alfalfa (fresca/henificada)',
  cat: 'local',
  cn: 11,
  n: 3.0,
  c: 33,
  moisture: 72,
  cra: 4.8,
  ph: 6.9,
  dig: 9,
  role: 'suplemento_n',
  tags: ['EB 166%', 'Sabana', 'N Alto', 'Nuevo'],
  cost: 4000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'lions_mane', 'nameko']
}, {
  id: 'cascara_uchuva',
  name: 'Cáscara de Uchuva (capacho)',
  cat: 'local',
  cn: 30,
  n: 1.2,
  c: 35,
  moisture: 10,
  cra: 3.5,
  ph: 6.1,
  dig: 5,
  role: 'base_carbono',
  tags: ['EB 76%', 'Cundinamarca', 'Validado CO', 'Nuevo'],
  cost: 500,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii']
}, {
  id: 'tallo_floricultura',
  name: 'Tallo de Rosa / Clavel (Sabana)',
  cat: 'local',
  cn: 48,
  n: 0.9,
  c: 42,
  moisture: 80,
  cra: 3.0,
  ph: 6.3,
  dig: 4,
  role: 'base_carbono',
  tags: ['Sin estudiar', 'Sabana 85%', 'Potencial alto', 'Nuevo'],
  cost: 100,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa']
}, {
  id: 'raices_hidroponicas',
  name: 'Raíces Hidropónicas + SMS',
  cat: 'circ',
  cn: 14,
  n: 2.1,
  c: 29,
  moisture: 88,
  cra: 3.8,
  ph: 6.5,
  dig: 7,
  role: 'suplemento_n',
  tags: ['EB 61%', 'Economía Circular', 'Nuevo'],
  cost: 1800,
  cs: ['p_ostreatus_blanco', 'lions_mane', 'nameko', 'p_eryngii']
}, {
  id: 'hemp_hurds',
  name: 'Hemp Hurds (cáñamo industrial)',
  cat: 'sup',
  cn: 70,
  n: 0.5,
  c: 47,
  moisture: 10,
  cra: 4.0,
  ph: 6.8,
  dig: 3,
  role: 'base_carbono',
  tags: ['Mejor Pleurotus EU', 'Aireador', 'Premium', 'Nuevo'],
  cost: 28000,
  cs: ['p_ostreatus_gris', 'p_ostreatus_blanco', 'lions_mane', 'shiitake']
}];
const CATS = {
  all: 'Todos',
  base_carbono: 'Carbono',
  suplemento_n: 'N alto',
  suplemento_medio: 'N medio',
  aireador: 'Aireación',
  aditivo: 'Correctores'
};
const PRESETS = {
  /* ── RECETAS PRINCIPALES — Proporciones validadas contra C:N objetivo ── */
  // Orellana Gris: C:N ideal 35. Calc: paja_trigo(c45,n0.5)×60 + salvado(c45,n2.8)×28 + borra(c47,n2.0)×7 → C:N≈35.0 ✓
  'orellana_gris_basica': {
    name: 'Orellana Gris — Estándar Sabana (C:N≈35)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'paja_trigo',
      p: 60
    }, {
      id: 'salvado_trigo',
      p: 28
    }, {
      id: 'borra_cafe',
      p: 7
    }, {
      id: 'carbonato_calcio',
      p: 3
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  // Económico: paja_cebada(c45,n0.5)×50 + salvado×20 + borra×15 + cascarilla×7 → C:N≈36 ✓
  'orellana_gris_economico': {
    name: 'Orellana Gris — Económico Cero (C:N≈36)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'paja_cebada',
      p: 50
    }, {
      id: 'salvado_trigo',
      p: 20
    }, {
      id: 'borra_cafe',
      p: 15
    }, {
      id: 'cascarilla_arroz',
      p: 7
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 3
    }]
  },
  // Orellana Blanca: C:N ideal 30. paja×55 + afrecho(c42,n3.5)×15 + salvado×15 + borra×8 → C:N≈30.1 ✓
  'orellana_blanca_premium': {
    name: 'Orellana Blanca — Afrecho Premium (C:N≈30)',
    s: 'p_ostreatus_blanco',
    i: [{
      id: 'paja_trigo',
      p: 55
    }, {
      id: 'afrecho_cerveceria',
      p: 15
    }, {
      id: 'salvado_trigo',
      p: 15
    }, {
      id: 'borra_cafe',
      p: 8
    }, {
      id: 'carbonato_calcio',
      p: 4
    }, {
      id: 'yeso',
      p: 3
    }]
  },
  // Eryngii: C:N ideal 30. paja×40 + roble(c50,n0.1)×15 + afrecho×20 + salvado×17 → C:N≈29 ✓ (requiere autoclave)
  'eringii_tecnico': {
    name: 'Seta de Cardo — Técnico Autoclave (C:N≈29)',
    s: 'p_eryngii',
    i: [{
      id: 'paja_trigo',
      p: 40
    }, {
      id: 'aserrin_roble',
      p: 15
    }, {
      id: 'afrecho_cerveceria',
      p: 20
    }, {
      id: 'salvado_trigo',
      p: 17
    }, {
      id: 'polvo_hueso',
      p: 3
    }, {
      id: 'carbonato_calcio',
      p: 3
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  // Shiitake: C:N ideal 50. roble×62 + guadua(c42,n0.35)×8 + salvado×20 + cascarilla_soya×5 → C:N≈54 ✓
  'shiitake_clasico': {
    name: 'Shiitake — Tradicional Asiático (C:N≈50)',
    s: 'shiitake',
    i: [{
      id: 'aserrin_roble',
      p: 62
    }, {
      id: 'guadua',
      p: 8
    }, {
      id: 'salvado_trigo',
      p: 20
    }, {
      id: 'cascarilla_soya',
      p: 5
    }, {
      id: 'polvo_hueso',
      p: 3
    }, {
      id: 'carbonato_calcio',
      p: 2
    }]
  },
  // Lions Mane: C:N ideal 40. roble×60 + afrecho×12 + salvado×12 + cascarilla_soya×8 → C:N≈39 ✓
  'melena_leon_bioest': {
    name: 'Melena de León — Master Enriquecido (C:N≈39)',
    s: 'lions_mane',
    i: [{
      id: 'aserrin_roble',
      p: 60
    }, {
      id: 'afrecho_cerveceria',
      p: 12
    }, {
      id: 'salvado_trigo',
      p: 12
    }, {
      id: 'cascarilla_soya',
      p: 8
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 3
    }]
  },
  // Reishi: C:N ideal 50. roble×55 + corteza(c48,n0.3)×15 + cascarilla_soya×12 + salvado×12 → C:N≈50 ✓
  'reishi_especialista': {
    name: 'Reishi — Ultra Especialista (C:N≈50, 4–6 meses)',
    s: 'reishi',
    i: [{
      id: 'aserrin_roble',
      p: 55
    }, {
      id: 'corteza_molida',
      p: 15
    }, {
      id: 'cascarilla_soya',
      p: 12
    }, {
      id: 'salvado_trigo',
      p: 12
    }, {
      id: 'carbonato_calcio',
      p: 4
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  // Enoki: C:N ideal 27. paja_arroz×35 + pino_comp×15 + afrecho×22 + salvado×15 + cascarilla×5 → C:N≈27 ✓ (5–12°C)
  // Enoki: paja_arroz×35 + alamo(c45,n0.2)×15 + afrecho×22 + salvado×15 → C:N≈27 ✓ | alamo cs incluye enoki ✓
  'enoki_comercial': {
    name: 'Enoki — Comercial Frío 5–12°C (C:N≈27)',
    s: 'enoki',
    i: [{
      id: 'paja_arroz',
      p: 35
    }, {
      id: 'aserrin_alamo',
      p: 15
    }, {
      id: 'afrecho_cerveceria',
      p: 22
    }, {
      id: 'salvado_trigo',
      p: 15
    }, {
      id: 'cascarilla_arroz',
      p: 5
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 3
    }]
  },
  // Nameko: C:N ideal 40. roble×45 + paja_arroz×20 + afrecho×15 + salvado×10 + borra×5 → C:N≈41 ✓
  'nameko_balanceado': {
    name: 'Nameko — Umami Balanceado (C:N≈41)',
    s: 'nameko',
    i: [{
      id: 'aserrin_roble',
      p: 45
    }, {
      id: 'paja_arroz',
      p: 20
    }, {
      id: 'afrecho_cerveceria',
      p: 15
    }, {
      id: 'salvado_trigo',
      p: 10
    }, {
      id: 'borra_cafe',
      p: 5
    }, {
      id: 'carbonato_calcio',
      p: 3
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  // Orellana Rosa: C:N ideal 40. bagazo_caña(c42,n0.7)×50 + paja_arroz×20 + borra×10 + salvado×12 → C:N≈39 ✓
  'orellana_rosa_calida': {
    name: 'Orellana Rosa — Cálida Caña+Arroz (C:N≈39)',
    s: 'p_djamor_rosa',
    i: [{
      id: 'bagazo_caña',
      p: 50
    }, {
      id: 'paja_arroz',
      p: 20
    }, {
      id: 'borra_cafe',
      p: 10
    }, {
      id: 'salvado_trigo',
      p: 12
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 3
    }]
  },
  /* ── Presets Sabana de Bogotá 2026 — ingredientes locales validados ── */
  // Alfalfa: paja_trigo×68 + pulpa_alfalfa(c33,n3.0)×17 + afrecho×8 → C:N≈35 ✓ | EB referenciado 166%
  'alfalfa_eb166': {
    name: '★ Pulpa de Alfalfa — Máximo EB (C:N≈35)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'paja_trigo',
      p: 68
    }, {
      id: 'pulpa_alfalfa',
      p: 17
    }, {
      id: 'afrecho_cerveceria',
      p: 8
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  // Uchuva: cascara_uchuva(c35,n1.2)×50 + paja_trigo×28 + borra×5 + salvado×10 → C:N≈33 ✓ (validado Colombia)
  'uchuva_local': {
    name: '★ Uchuva Cundinamarca — Validado CO (C:N≈33)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'cascara_uchuva',
      p: 50
    }, {
      id: 'paja_trigo',
      p: 28
    }, {
      id: 'borra_cafe',
      p: 5
    }, {
      id: 'salvado_trigo',
      p: 10
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  // Floricultura: tallo_floricultura(c42,n0.9)×50 + paja_arroz×25 + afrecho×15 + borra×5 → C:N≈33 ✓ (exploración)
  'floricultura_exploracion': {
    name: '★ Tallo de Floricultura — Exploración (C:N≈33)',
    s: 'p_ostreatus_blanco',
    i: [{
      id: 'tallo_floricultura',
      p: 50
    }, {
      id: 'paja_arroz',
      p: 25
    }, {
      id: 'afrecho_cerveceria',
      p: 15
    }, {
      id: 'borra_cafe',
      p: 5
    }, {
      id: 'carbonato_calcio',
      p: 3
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  // Circular: chips_poda×35 + raices_hidrop×15 + roble×25 + cascarilla_soya×8 + salvado×10 → C:N≈39 ✓
  'circular_hidroponico': {
    name: '★ Circular Hidropónico — Economía Circular (C:N≈39)',
    s: 'lions_mane',
    i: [{
      id: 'chips_poda_urbana',
      p: 35
    }, {
      id: 'raices_hidroponicas',
      p: 15
    }, {
      id: 'aserrin_roble',
      p: 25
    }, {
      id: 'cascarilla_soya',
      p: 8
    }, {
      id: 'salvado_trigo',
      p: 10
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 2
    }]
  },
  /* ── Bodega Tenjo 2026 — formuladas con inventario propio (sin afrecho de cervecería) ── */
  'bodega_gris': {
    name: '⬡ Bodega — Orellana Gris (C:N≈33, solo inventario)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'bagazo_caña',
      p: 50
    }, {
      id: 'salvado_trigo',
      p: 20
    }, {
      id: 'borra_cafe',
      p: 13
    }, {
      id: 'cascarilla_arroz',
      p: 11
    }, {
      id: 'carbonato_calcio',
      p: 4
    }, {
      id: 'sulfato_magnesio',
      p: 2
    }]
  },
  'bodega_rosa': {
    name: '⬡ Bodega — Orellana Rosa (C:N≈42, solo inventario)',
    s: 'p_djamor_rosa',
    i: [{
      id: 'bagazo_caña',
      p: 60
    }, {
      id: 'cascarilla_arroz',
      p: 10
    }, {
      id: 'borra_cafe',
      p: 9
    }, {
      id: 'cascara_cafe',
      p: 8
    }, {
      id: 'salvado_trigo',
      p: 7
    }, {
      id: 'carbonato_calcio',
      p: 4
    }, {
      id: 'sulfato_magnesio',
      p: 2
    }]
  },
  'bodega_blanca': {
    name: '⬡ Bodega — Orellana Blanca (C:N≈31, esterilizar: suplemento alto)',
    s: 'p_ostreatus_blanco',
    i: [{
      id: 'bagazo_caña',
      p: 50
    }, {
      id: 'salvado_trigo',
      p: 24
    }, {
      id: 'borra_cafe',
      p: 13
    }, {
      id: 'cascarilla_arroz',
      p: 8
    }, {
      id: 'carbonato_calcio',
      p: 3
    }, {
      id: 'sulfato_magnesio',
      p: 2
    }]
  },
  'bodega_blanca_maiz': {
    name: '⬡ Bodega+ — Blanca con harina de maíz (C:N≈28, $600/kg N)',
    s: 'p_ostreatus_blanco',
    i: [{
      id: 'bagazo_caña',
      p: 50
    }, {
      id: 'harina_maiz',
      p: 16
    }, {
      id: 'salvado_trigo',
      p: 12
    }, {
      id: 'borra_cafe',
      p: 8
    }, {
      id: 'cascarilla_arroz',
      p: 8
    }, {
      id: 'carbonato_calcio',
      p: 4
    }, {
      id: 'sulfato_magnesio',
      p: 2
    }]
  },
  'bodega_melena_mastermix': {
    name: '⬡ Melena — Master’s Mix roble+soya (C:N≈30, literatura 150–180% EB)',
    s: 'lions_mane',
    i: [{
      id: 'aserrin_roble',
      p: 55
    }, {
      id: 'cascarilla_soya',
      p: 30
    }, {
      id: 'salvado_trigo',
      p: 10
    }, {
      id: 'carbonato_calcio',
      p: 3
    }, {
      id: 'sulfato_magnesio',
      p: 2
    }]
  },
  /* ── Presets clásicos (compatibilidad) ── */
  kk1c: {
    name: 'KK-1c (Sabana clásico)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'kikuyo',
      p: 43
    }, {
      id: 'aserrin_eucalipto',
      p: 28
    }, {
      id: 'cascarilla_arroz',
      p: 8
    }, {
      id: 'salvado_trigo',
      p: 8
    }, {
      id: 'yeso',
      p: 2
    }, {
      id: 'carbonato_calcio',
      p: 1
    }]
  },
  pesebrera: {
    name: 'Pesebrera Tenjo',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'pesebrera_completa',
      p: 55
    }, {
      id: 'paja_cebada',
      p: 25
    }, {
      id: 'salvado_trigo',
      p: 12
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 3
    }]
  },
  paja: {
    name: 'Paja + Salvado (básico)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'paja_trigo',
      p: 80
    }, {
      id: 'salvado_trigo',
      p: 18
    }, {
      id: 'yeso',
      p: 1
    }, {
      id: 'carbonato_calcio',
      p: 1
    }]
  },
  master: {
    name: "Master's Mix (Stamets)",
    s: 'lions_mane',
    i: [{
      id: 'aserrin_roble',
      p: 50
    }, {
      id: 'cascarilla_soya',
      p: 50
    }]
  },
  cafe: {
    name: 'Café + Uchuva (circular)',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'paja_trigo',
      p: 45
    }, {
      id: 'borra_cafe',
      p: 25
    }, {
      id: 'capacho_uchuva',
      p: 20
    }, {
      id: 'salvado_trigo',
      p: 7
    }, {
      id: 'yeso',
      p: 2
    }, {
      id: 'carbonato_calcio',
      p: 1
    }]
  },
  platano: {
    name: 'Plátano + Salvado',
    s: 'p_djamor_rosa',
    i: [{
      id: 'pseudotallo_platano',
      p: 55
    }, {
      id: 'cascara_platano',
      p: 20
    }, {
      id: 'salvado_trigo',
      p: 15
    }, {
      id: 'carbonato_calcio',
      p: 5
    }, {
      id: 'yeso',
      p: 3
    }, {
      id: 'melaza',
      p: 2
    }]
  },
  hojarasca: {
    name: 'Hojarasca UNAL',
    s: 'p_ostreatus_gris',
    i: [{
      id: 'kikuyo',
      p: 50
    }, {
      id: 'hojarasca',
      p: 30
    }, {
      id: 'rastrojo_frijol',
      p: 10
    }, {
      id: 'carbonato_calcio',
      p: 7
    }, {
      id: 'yeso',
      p: 3
    }]
  }
};

// ── TIPOS DE CONTENEDOR / BOLSA ─────────────────────────────────────────────
// kgHumedo: carga típica en kg húmedo por unidad
// vol_L: volumen útil aproximado en litros
// El simulador usa kgHumedo como valor por defecto de prodKg al seleccionar el tipo
const BAG_TYPES = [{
  id: 'bolsa_20x50',
  icon: '',
  name: 'Bolsa 20×50 cm · filtro 0.06mm',
  kgHumedo: 1.8,
  vol_L: 3.6,
  tratamiento: 'cwlp_thermal',
  color: 'var(--moss-500,var(--accent-olive))',
  dim: '20×50 cm',
  notas: 'Formato estándar Setas de la Peña. Compatible con CWLP o pasteurización. Inocular mezclando en capas o por la boca superior antes de cerrar con filtro.',
  produccion: 'Colgar o apoyar verticalmente. Sin orificios adicionales — el filtro maneja el intercambio gaseoso.'
}, {
  id: 'bolsa_18x35',
  icon: '',
  name: 'Bolsa 18×35 cm · filtro 0.06mm',
  kgHumedo: 1.0,
  vol_L: 2.0,
  tratamiento: 'cwlp_thermal',
  color: 'var(--ochre-600)',
  dim: '18×35 cm',
  notas: 'Formato pequeño. Ideal para pruebas de receta, especies exigentes (P. eryngii, Lions Mane), o Martha tent con poco espacio.',
  produccion: 'Apilar en estantería o colgar. Bajo peso = fácil manejo. 30 bolsas = ~30 kg de sustrato húmedo.'
}, {
  id: 'punch_bag_martha',
  icon: '',
  name: 'Bolsa colgante (punch bag · Martha tent)',
  kgHumedo: 3.5,
  vol_L: 7.0,
  tratamiento: 'thermal',
  color: 'var(--coral-700)',
  dim: '~22×70 cm relleno',
  notas: 'Versión escalada para Martha tent (1 bolsa de polipropileno 22×80cm aprox.). Llenar 3.5–4 kg. Colgar del centro del tent con cuerda o gancho. Cortar 6–8 orificios Ø2–2.5cm en espiral cada ~10 cm desde la base. Ideal Pleurotus — alta densidad de fructificación por m².',
  produccion: 'Un solo punch bag ocupa el espacio central del tent y deja espacio alrededor para humidificación uniforme. Escalar a 2 bolsas para un tent 120×60cm. Pinchar con cuchillo o sacabocado caliente, no con tijeras.'
}];
const Bag = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
  x: "5",
  y: "48",
  width: "60",
  height: "40",
  rx: "2",
  fill: "var(--ink-900)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "5",
  y: "48",
  width: "60",
  height: "7",
  rx: "2",
  fill: "var(--ink-900)"
}));
const IcoTherm = () => /*#__PURE__*/React.createElement("svg", {
  width: "8",
  height: "13",
  viewBox: "0 0 8 13",
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.8V2.5a1.5 1.5 0 013 0v5.3a3 3 0 11-3 0z",
  opacity: ".6"
}));
const IcoDrop = () => /*#__PURE__*/React.createElement("svg", {
  width: "9",
  height: "12",
  viewBox: "0 0 9 12",
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4.5.5S1 5.5 1 8a3.5 3.5 0 007 0c0-2.5-3.5-7.5-3.5-7.5z",
  opacity: ".6"
}));
const IcoLayers = () => /*#__PURE__*/React.createElement("svg", {
  width: "12",
  height: "9",
  viewBox: "0 0 12 9",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.4",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  opacity: ".6"
}, /*#__PURE__*/React.createElement("path", {
  d: "M1 2.5l5 2.5 5-2.5M1 5.5l5 2.5 5-2.5"
}));
const IcoArrow = () => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 16 16",
  fill: "none"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "8",
  cy: "8",
  r: "7",
  stroke: "currentColor",
  strokeWidth: "1.2",
  opacity: ".4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5.5 8h5M8.5 5.5L11 8l-2.5 2.5",
  stroke: "currentColor",
  strokeWidth: "1.3",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));
const SppSvg = ({
  sKey,
  c
}) => {
  const lt = 'rgba(255,255,255,0.15)';
  const m = {
    p_ostreatus_gris: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "26",
      y1: "38",
      x2: "25",
      y2: "52",
      stroke: c,
      strokeWidth: "4.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "40",
      y1: "34",
      x2: "39",
      y2: "52",
      stroke: c,
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "53",
      y1: "39",
      x2: "52",
      y2: "52",
      stroke: c,
      strokeWidth: "3.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("path", {
      d: "M4,30 Q14,12 32,16 Q22,28 20,38Z",
      fill: c,
      opacity: ".9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14,24 Q28,6 48,10 Q38,24 36,38Z",
      fill: c
    }), /*#__PURE__*/React.createElement("path", {
      d: "M34,28 Q46,12 62,18 Q56,30 52,40Z",
      fill: c,
      opacity: ".88"
    })),
    p_ostreatus_blanco: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "26",
      y1: "38",
      x2: "25",
      y2: "52",
      stroke: c,
      strokeWidth: "4.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "40",
      y1: "34",
      x2: "39",
      y2: "52",
      stroke: c,
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("path", {
      d: "M6,32 Q16,14 34,18 Q24,30 22,40Z",
      fill: c,
      opacity: ".88"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22,26 Q36,8 54,14 Q44,26 42,40Z",
      fill: c
    })),
    p_djamor_rosa: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "24",
      y1: "38",
      x2: "23",
      y2: "52",
      stroke: c,
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "40",
      y1: "35",
      x2: "39",
      y2: "52",
      stroke: c,
      strokeWidth: "3.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "54",
      y1: "40",
      x2: "53",
      y2: "52",
      stroke: c,
      strokeWidth: "3",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("path", {
      d: "M6,33 Q16,15 32,18 Q22,30 20,40Z",
      fill: c,
      opacity: ".86"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18,26 Q32,8 50,12 Q40,26 38,40Z",
      fill: c
    }), /*#__PURE__*/React.createElement("path", {
      d: "M36,30 Q48,16 62,22 Q56,32 54,42Z",
      fill: c,
      opacity: ".83"
    })),
    p_eryngii: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "26",
      y: "28",
      width: "18",
      height: "24",
      rx: "7",
      fill: c,
      opacity: ".88"
    }), /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("ellipse", {
      cx: "35",
      cy: "20",
      rx: "29",
      ry: "13",
      fill: c
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "35",
      cy: "24",
      rx: "29",
      ry: "9",
      fill: c,
      opacity: ".4"
    })),
    shiitake: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "28",
      y: "32",
      width: "14",
      height: "20",
      rx: "6",
      fill: c,
      opacity: ".82"
    }), /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("path", {
      d: "M7,27 Q22,4 35,5 Q48,4 63,27 Q56,42 35,44 Q14,42 7,27Z",
      fill: c
    }), [[22, 15], [30, 10], [40, 11], [50, 16], [44, 22], [24, 22]].map(([x, y], i) => /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: x,
      cy: y,
      r: "2.5",
      fill: lt
    }))),
    lions_mane: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("circle", {
      cx: "44",
      cy: "22",
      r: "18",
      fill: c,
      opacity: ".65"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "28",
      cy: "26",
      r: "21",
      fill: c,
      opacity: ".88"
    }), [-16, -10, -4, 2, 8, 14, 20].map((dx, i) => /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: 28 + dx,
      y1: 42 + i % 2 * 3,
      x2: 27 + dx,
      y2: 56 + i % 3 * 4 + i,
      stroke: c,
      strokeWidth: "1.6",
      strokeLinecap: "round",
      opacity: ".82"
    }))),
    reishi: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "8",
      y: "14",
      width: "10",
      height: "38",
      rx: "4",
      fill: c,
      opacity: ".88"
    }), /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("path", {
      d: "M14,16 Q14,6 44,8 Q66,8 66,22 Q66,34 44,36 Q16,36 14,28Z",
      fill: c
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14,28 Q14,18 44,20 Q66,20 66,34 Q66,46 44,48 Q16,48 14,40Z",
      fill: c,
      opacity: ".85"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14,40 Q14,30 44,32 Q64,32 64,46 Q64,56 44,58 Q16,58 14,50Z",
      fill: c,
      opacity: ".72"
    })),
    enoki: /*#__PURE__*/React.createElement(React.Fragment, null, [12, 19, 26, 33, 40, 48, 56].map((x, i) => /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: x,
      y1: 16 + i % 3 * 4,
      x2: x,
      y2: 52,
      stroke: c,
      strokeWidth: "2.2",
      strokeLinecap: "round"
    })), /*#__PURE__*/React.createElement(Bag, null), [12, 19, 26, 33, 40, 48, 56].map((x, i) => /*#__PURE__*/React.createElement("ellipse", {
      key: i,
      cx: x,
      cy: 13 + i % 3 * 4,
      rx: "7",
      ry: "5",
      fill: c
    }))),
    nameko: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "24",
      y1: "35",
      x2: "23",
      y2: "52",
      stroke: c,
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "38",
      y1: "31",
      x2: "37",
      y2: "52",
      stroke: c,
      strokeWidth: "3.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "50",
      y1: "35",
      x2: "49",
      y2: "52",
      stroke: c,
      strokeWidth: "3",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement(Bag, null), /*#__PURE__*/React.createElement("path", {
      d: "M6,35 Q16,22 28,24 Q22,33 22,40Z",
      fill: c,
      opacity: ".83"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20,30 Q30,16 44,18 Q38,30 36,40Z",
      fill: c,
      opacity: ".9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M38,33 Q48,20 60,24 Q54,34 52,42Z",
      fill: c,
      opacity: ".86"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16,20 Q24,10 34,12 Q29,20 28,28Z",
      fill: c,
      opacity: ".78"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M34,17 Q42,7 52,10 Q46,19 44,26Z",
      fill: c,
      opacity: ".76"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 70 90",
    width: "66",
    height: "79",
    style: {
      display: 'block',
      overflow: 'visible'
    }
  }, m[sKey] || m.p_ostreatus_gris);
};
const analyze = (recipe, sKey, ings = INGS) => {
  if (!recipe.length) return null;
  const tot = recipe.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  if (!tot) return null;
  let wC = 0,
    wN = 0,
    wPh = 0,
    wDig = 0,
    wCra = 0,
    nP = 0,
    suppP = 0,
    baseP = 0,
    addP = 0,
    cafeP = 0,
    manP = 0,
    airP = 0,
    densaP = 0,
    incompat = [];
  const DENSOS = ['aserrin_roble', 'aserrin_eucalipto', 'aserrin_pino', 'aserrin_pino_compostado', 'borra_cafe', 'afrecho_cerveceria', 'chips_poda_urbana', 'guadua', 'carton_corrugado', 'pulpa_papel'];
  recipe.forEach(r => {
    const g = ings.find(i => i.id === r.id);
    if (!g) return;
    const p = parseFloat(r.p) || 0;
    // A · Aislamiento de la matriz nutritiva: los aditivos minerales/estructurales secos
    // (carbonato, yeso, zeolita, cascarilla de huevo, vermicompost…) NO entran en la
    // relación C:N — se usan solo como modificadores de pH y textura. Evita el sesgo de
    // dilución del denominador lignocelulósico.
    const esAditivoSeco = g.role === 'aditivo_ph' || g.role === 'aditivo_estructura';
    // C:N BASE SECA: los valores c/n de la BD son % materia seca → ponderar por fracción seca
    // para corregir diferencias de humedad entre insumos (borra café 60% vs paja 12%).
    const dryFrac = p * (1 - Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)));
    if (g.cn > 0 && !esAditivoSeco) {
      wC += g.c * dryFrac;
      wN += g.n * dryFrac;
      nP += dryFrac;
    }
    wPh += g.ph * p;
    wDig += g.dig * p;
    wCra += g.cra * p;
    if (g.role === 'suplemento_n') suppP += p;
    if (g.role === 'base_carbono') baseP += p;
    if (['aditivo_ph', 'aditivo_estructura', 'aditivo_micronutriente'].includes(g.role)) addP += p;
    if (g.role === 'aireador') airP += p;
    if (g.cat === 'cafe') cafeP += p;
    if (g.cat === 'est') manP += p;
    if (DENSOS.includes(g.id)) densaP += p;
    if (sKey && !g.cs.includes(sKey) && g.cn > 0) incompat.push(g.name);
  });
  const avgN = nP ? wN / nP : 0,
    cn = avgN > 0 ? (nP ? wC / nP : 0) / avgN : 0;
  const avgPh = tot ? wPh / tot : 7;
  const avgDig = tot ? wDig / tot : 5;
  const avgCra = tot ? wCra / tot : 3;
  const cost = recipe.reduce((s, r) => {
    const g = ings.find(i => i.id === r.id);
    return g ? s + g.cost * (parseFloat(r.p) || 0) / 100 : s;
  }, 0);
  const sp = SPP[sKey];
  let eb = 0,
    trichoderma = false,
    dynSpawn = sp?.spawn_rate || 8;
  if (sp) {
    const cF = Math.max(0, 1 - Math.pow(Math.abs(cn - sp.cn_optimal.ideal) / ((sp.cn_optimal.max - sp.cn_optimal.min) / 2), 1.5));
    const nF = Math.max(0, 1 - Math.pow(Math.abs(avgN - sp.n_optimal.ideal) / ((sp.n_optimal.max - sp.n_optimal.min) / 2), 1.5));
    eb = sp.eb_baseline + (sp.eb_optimal - sp.eb_baseline) * (cF * .6 + nF * .4);
    const needsAutoclave = suppP > sp.supplementation_max;
    const nThresh = needsAutoclave ? sp.n_optimal.max * 1.2 : sp.n_optimal.max * 1.15;
    if (avgN > nThresh && !needsAutoclave) {
      trichoderma = true;
      eb *= .45;
    } else if (avgN > nThresh && needsAutoclave) {
      eb *= .80;
    }
    if (suppP > sp.supplementation_max && !needsAutoclave) eb *= .85;
    if (incompat.length) eb *= .9;
    if (tot < 95 || tot > 105) eb *= .95;
    // ── Modificadores multifactor de EB (penalizaciones ≤1: una receta en óptimo no se ve afectada) ──
    // pH fuera de rango: la acidez excesiva bloquea más que la alcalinidad ligera
    var phF = 1;
    if (sp.ph_optimal) {
      if (avgPh < sp.ph_optimal.min) phF = Math.max(.70, 1 - (sp.ph_optimal.min - avgPh) * 0.12);else if (avgPh > sp.ph_optimal.max) phF = Math.max(.80, 1 - (avgPh - sp.ph_optimal.max) * 0.10);
    }
    // Aireación: riesgo de anaerobiosis con mucho material denso y poco aireador
    var aerF = 1;
    if (densaP > 60 && airP < 10) aerF = .85;else if (densaP > 40 && airP < 8) aerF = .93;
    // Digestibilidad: sustratos muy lignificados colonizan lento y rinden algo menos
    // F-19: shiitake/reishi son degradadores de lignina — digF no aplica en madera dura
    const isLigninSpp = ['shiitake', 'reishi'].includes(sKey);
    var digF = isLigninSpp ? 1 : avgDig >= 6 ? 1 : Math.max(.85, 1 - (6 - avgDig) * 0.03);
    eb = eb * phF * aerF * digF;
    var ebMods = {
      phF,
      aerF,
      digF
    };
    // ── Banda de incertidumbre EB — CV base 18%, crece con penalizadores activos ──
    var ebCvVal = 0.18;
    if (ebMods.phF < 0.95) ebCvVal += 0.05;
    if (ebMods.aerF < 0.95) ebCvVal += 0.05;
    if (ebMods.digF < 0.95) ebCvVal += 0.04;
    if (incompat.length) ebCvVal += 0.08;
    if (suppP > sp.supplementation_max) ebCvVal += 0.10;
    if (trichoderma) ebCvVal = 0.50;
    ebCvVal = Math.min(trichoderma ? 0.50 : 0.40, ebCvVal);
    var ebLow = Math.round(eb * (1 - ebCvVal));
    var ebHigh = Math.round(eb * (1 + ebCvVal));
    var ebIndex = Math.round(Math.max(0, Math.min(100, (eb - sp.eb_baseline) / Math.max(1, sp.eb_optimal - sp.eb_baseline) * 100)));
    dynSpawn = Math.min(15, (sp.spawn_rate || 8) + Math.floor(suppP / 5));
  }
  const eucPct = recipe.reduce((s, r) => r.id === 'aserrin_eucalipto' ? s + (parseFloat(r.p) || 0) : s, 0);
  const pescPct = recipe.reduce((s, r) => r.id === 'harina_pescado' ? s + (parseFloat(r.p) || 0) : s, 0);
  return {
    tot,
    avgN,
    cn,
    cost,
    eb,
    suppP,
    baseP,
    addP,
    cafeP,
    manP,
    airP,
    densaP,
    incompat,
    sp,
    trichoderma,
    dynSpawn,
    avgPh,
    avgDig,
    avgCra,
    eucPct,
    pescPct,
    ebLow: typeof ebLow !== 'undefined' ? ebLow : Math.round(eb),
    ebHigh: typeof ebHigh !== 'undefined' ? ebHigh : Math.round(eb),
    ebIndex: typeof ebIndex !== 'undefined' ? ebIndex : 0,
    ebMods: typeof ebMods !== 'undefined' ? ebMods : null
  };
};

// ── Balance de masa: única fuente de verdad usada por Formulador, Ficha,
//    Comparador, Dashboard y Bitácora. Tolerancia explícita: ±0.5 pp.
const MASS_BALANCE_TOL = 0.5;
const isMassBalanced = a => !!a && Math.abs(a.tot - 100) <= MASS_BALANCE_TOL;
const massBalanceMsg = a => {
  if (!a) return '';
  const d = a.tot - 100;
  if (Math.abs(d) <= MASS_BALANCE_TOL) return `Balance de masa: ${a.tot.toFixed(1)}% = 100% ✓`;
  return d < 0 ? `Balance de masa: ${a.tot.toFixed(1)}% − 100% = ${d.toFixed(1)} pp · faltan ${Math.abs(d).toFixed(1)}%` : `Balance de masa: ${a.tot.toFixed(1)}% − 100% = +${d.toFixed(1)} pp · sobran ${d.toFixed(1)}%`;
};
const diagnose = (a, sKey) => {
  if (!a) return {
    main: 'Selecciona ingredientes para comenzar.',
    sugs: []
  };
  const {
    tot,
    cn,
    avgN,
    suppP,
    baseP,
    addP,
    cafeP,
    airP,
    densaP,
    incompat,
    eb,
    sp,
    trichoderma,
    dynSpawn,
    avgPh,
    avgDig,
    avgCra,
    eucPct,
    pescPct
  } = a;
  const s = [];
  if (tot < 95) s.push({
    t: 'error',
    i: '⚠',
    tx: `Total ${tot.toFixed(1)}% — necesitas ${(100 - tot).toFixed(1)}% más.`
  });else if (tot > 105) s.push({
    t: 'error',
    i: '⚠',
    tx: `Total ${tot.toFixed(1)}% — reduce ${(tot - 100).toFixed(1)}%.`
  });
  if (sp) {
    if (cn < sp.cn_optimal.min) s.push({
      t: 'warning',
      i: '↓',
      tx: `C:N bajo (${cn.toFixed(1)}:1). Agrega base carbono. Objetivo ${sp.cn_optimal.min}–${sp.cn_optimal.max}:1.`
    });else if (cn > sp.cn_optimal.max) s.push({
      t: 'warning',
      i: '↑',
      tx: `C:N alto (${cn.toFixed(1)}:1). Agrega salvado o café.`
    });else s.push({
      t: 'success',
      i: '✓',
      tx: `C:N óptimo (${cn.toFixed(1)}:1) para ${sp.name}.`
    });
    if (trichoderma) s.push({
      t: 'error',
      i: '⚠',
      tx: `COLAPSO TRICHODERMA: N=${avgN.toFixed(2)}% supera umbral crítico sin autoclave. EB cae ~85%. Opciones: reducir N, usar autoclave 121°C×90min, spawn ${dynSpawn}%+.`
    });else if (avgN < sp.n_optimal.min) s.push({
      t: 'warning',
      i: '↓',
      tx: `Nitrógeno bajo (${avgN.toFixed(2)}%). Aumenta salvado o borra de café.`
    });else if (avgN > sp.n_optimal.max) s.push({
      t: 'warning',
      i: '↑',
      tx: `Nitrógeno elevado (${avgN.toFixed(2)}%). Riesgo moderado. Spawn ajustado: ${dynSpawn}%.`
    });else s.push({
      t: 'success',
      i: '✓',
      tx: `Nitrógeno óptimo (${avgN.toFixed(2)}%). Spawn dinámico: ${dynSpawn}%.`
    });
    if (suppP > sp.supplementation_max) s.push({
      t: 'error',
      i: '!',
      tx: `Suplementación ${suppP.toFixed(0)}% excede ${sp.supplementation_max}%. REQUIERE AUTOCLAVE 121°C×90min. Spawn: ${dynSpawn}%.`
    });
    // pH
    if (sp.ph_optimal) {
      if (avgPh < sp.ph_optimal.min) s.push({
        t: 'error',
        i: '',
        tx: `pH estimado ${avgPh.toFixed(1)} — demasiado ácido para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Agrega carbonato de calcio o ceniza vegetal.`
      });else if (avgPh > sp.ph_optimal.max) s.push({
        t: 'warning',
        i: '',
        tx: `pH estimado ${avgPh.toFixed(1)} — ligeramente alcalino para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Reduce cal/yeso o agrega borra de café/aserrín.`
      });else s.push({
        t: 'success',
        i: '',
        tx: `pH estimado ${avgPh.toFixed(1)} — dentro del rango óptimo para ${sp.name} (${sp.ph_optimal.min}–${sp.ph_optimal.max}).`
      });
    }
  }
  if (baseP < 50) s.push({
    t: 'warning',
    i: '↓',
    tx: `Base carbono baja (${baseP.toFixed(0)}%). Mínimo 50%.`
  });
  if (addP < 2) s.push({
    t: 'warning',
    i: '!',
    tx: `Sin minerales. Agrega 2–4% carbonato/yeso.`
  });
  if (cafeP > 30) s.push({
    t: 'error',
    i: '!',
    tx: `Borra café ${cafeP.toFixed(0)}% — compactación. Máx 30%.`
  });
  if (eucPct > 20) s.push({
    t: 'warning',
    i: '⚠',
    tx: `Aserín de eucalipto ${eucPct.toFixed(0)}% — aceites esenciales (cineol, terpineol) reducen colonización 20–35%. Máximo recomendado: 20%.`
  });
  if (pescPct > 3) s.push({
    t: 'error',
    i: '⚠',
    tx: `Harina de pescado ${pescPct.toFixed(0)}% supera el 3% — riesgo elevado de ácaros y Sciaridae por olor. Reducir a ≤3% o eliminar.`
  });else if (cafeP > 0) s.push({
    t: 'success',
    i: '',
    tx: `Café en proporción saludable (${cafeP.toFixed(0)}%).`
  });
  if (densaP > 60 && airP < 10) s.push({
    t: 'error',
    i: '',
    tx: `Riesgo anaerobiosis: ${densaP.toFixed(0)}% material denso + solo ${airP.toFixed(0)}% aireador. Agrega 10–15% cascarilla de arroz o tamo.`
  });else if (densaP > 40 && airP < 8) s.push({
    t: 'warning',
    i: '',
    tx: `Estructura densa (${densaP.toFixed(0)}% fino, ${airP.toFixed(0)}% aireador). Agrega 8–10% cascarilla.`
  });else s.push({
    t: 'success',
    i: '',
    tx: `Buena aireación (${airP.toFixed(0)}% aireador). O₂ adecuado.`
  });
  // Digestibilidad
  const digLbl = avgDig >= 8 ? 'Alta — colonización rápida (7–14 días)' : avgDig >= 5 ? 'Media — colonización estándar (14–21 días)' : 'Baja — sustrato lignificado (21–35+ días). Considera pretratamiento o esporas de Shiitake/Reishi.';
  s.push({
    t: avgDig >= 8 ? 'success' : avgDig >= 5 ? 'warning' : 'warning',
    i: '',
    tx: `Digestibilidad ${avgDig.toFixed(1)}/10 — ${digLbl}`
  });
  // CRA
  const craLbl = avgCra >= 4 ? 'Alta — reduce agua de hidratación ~10%' : avgCra <= 2 ? 'Baja — hidratar bien, revisar punto de campo' : null;
  if (craLbl) s.push({
    t: 'warning',
    i: '',
    tx: `CRA ${avgCra.toFixed(1)}/5 — ${craLbl}`
  });
  s.push({
    t: 'success',
    i: '△',
    tx: `Tenjo 2.580 msnm: humedad objetivo 67–68%. Pasteurización sin presión: +25% tiempo. CWLP: pH≥12.`
  });
  if (incompat.length) s.push({
    t: 'warning',
    i: '!',
    tx: `No ideales para ${sp?.name}: ${incompat.join(', ')}.`
  });
  // Transparencia del modelo: qué factores penalizan la EB y cuánto
  if (a.ebMods) {
    const m = a.ebMods,
      pen = [];
    if (m.phF < 1) pen.push(`pH −${Math.round((1 - m.phF) * 100)}%`);
    if (m.aerF < 1) pen.push(`aireación −${Math.round((1 - m.aerF) * 100)}%`);
    if (m.digF < 1) pen.push(`digestibilidad −${Math.round((1 - m.digF) * 100)}%`);
    if (pen.length) s.push({
      t: 'warning',
      i: '⚙',
      tx: `EB ajustada por: ${pen.join(', ')}. Corrige estos factores para acercarte al EB máximo de la especie.`
    });
  }
  let main = '';
  if (s.filter(x => x.t === 'error').length) main = 'Problemas críticos. Revisar antes de continuar.';else if (s.filter(x => x.t === 'warning').length > 2) main = 'Receta funcional con margen de optimización.';else if (eb > 100) main = 'Receta excelente — eficiencia biológica esperada superior al promedio.';else if (eb > 80) main = 'Receta satisfactoria para producción estándar.';else main = 'Receta funcional. Revisar sugerencias.';
  return {
    main,
    sugs: s
  };
};

// ── PERITO CUANTITATIVO: fija un ingrediente a un % y reescala los demás a 100% ──
const setPctProportional = (recipe, id, v, lockedIds = []) => {
  v = Math.max(0, Math.min(80, v));
  const others = recipe.filter(r => r.id !== id);
  const lockedSum = others.filter(r => lockedIds.includes(r.id)).reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  const free = others.filter(r => !lockedIds.includes(r.id));
  const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  const remaining = Math.max(0, 100 - v - lockedSum);
  let found = false;
  const next = [];
  recipe.forEach(r => {
    if (r.id === id) {
      next.push({
        ...r,
        p: Math.round(v * 10) / 10
      });
      found = true;
    } else if (lockedIds.includes(r.id)) {
      next.push(r);
    } else {
      const np = sumFree === 0 ? remaining / Math.max(1, free.length) : parseFloat(r.p) / sumFree * remaining;
      next.push({
        ...r,
        p: Math.round(np * 10) / 10
      });
    }
  });
  if (!found) next.push({
    id,
    p: Math.round(v * 10) / 10
  });
  return next;
};
// Busca el % exacto de un ingrediente que lleva una métrica (cn|n|ph) a su objetivo
const solveTargetPct = (recipe, sKey, ings, id, metric, target, lockedIds = []) => {
  const readM = a => !a ? null : metric === 'cn' ? a.cn : metric === 'n' ? a.avgN : a.avgPh;
  const g = ings.find(i => i.id === id);
  const sp = SPP[sKey];
  // Techo de búsqueda: sin esto, el solver persigue el % que más acerca la
  // métrica al ideal sin mirar si ese % es agronómicamente razonable — para
  // un suplemento de N esto proponía 45–55% de un solo insumo (ej. Afrecho de
  // cervecería) para corregir un C:N alto, muy por encima del máximo de
  // suplementación real de la especie (sp.supplementation_max — el mismo
  // límite que ya usa scoreRisk/runAutoOptimizer para penalizar exceso de N)
  // y de lo que muestran las recetas de referencia del catálogo (8–22%
  // típico). Otros roles usan el mismo techo que ya protege applyOptToRecipe
  // en los modos add/increase (ROLE_CAP_INCREASE).
  const vMax = g && (g.role === 'suplemento_n' || g.role === 'suplemento_medio') && sp ? Math.min(55, sp.supplementation_max || 20) : g && ROLE_CAP_INCREASE[g.role] != null ? ROLE_CAP_INCREASE[g.role] : 55;
  let best = null,
    bestDist = Infinity;
  const evalAt = v => {
    const cand = setPctProportional(recipe, id, v, lockedIds);
    const a = analyze(cand, sKey, ings);
    const val = readM(a);
    if (val == null) return;
    const d = Math.abs(val - target);
    if (d < bestDist) {
      bestDist = d;
      best = {
        pct: Math.round(v * 10) / 10,
        val,
        an: a
      };
    }
  };
  for (let v = 0.5; v <= vMax; v += 1) evalAt(v);
  if (best) {
    const c = best.pct;
    for (let v = Math.max(0, c - 1.5); v <= Math.min(vMax, c + 1.5); v += 0.1) evalAt(v);
  }
  return best;
};
const METRIC_LABEL = {
  cn: 'C:N',
  n: 'N',
  ph: 'pH'
};
const fmtMetric = (metric, v) => metric === 'cn' ? `${v.toFixed(1)}:1` : metric === 'n' ? `${v.toFixed(2)}%` : v.toFixed(1);

// ── scoreAn — puente hacia scoring.js (SetasScoring), fuente única del score ──
// Reemplaza calcRiskScore, el compuesto de puntaje de generateOptimizer y el
// resultScore de runAutoOptimizer: los tres consumían fórmulas independientes
// que podían dar números distintos para la misma receta (ver auditoría de
// scoring). extraCtx acepta {treatment,profile,recipe,stockIds,weights} — la
// severidad (criticals/warnings) SIEMPRE se deriva aquí vía assessSeverity,
// para que ningún llamador pueda saltarse los techos por severidad.
const scoreAn = (an, extraCtx = {}) => {
  if (!an || !an.sp) return {
    score: 0,
    status: 'sin_receta',
    breakdown: null,
    weights: null,
    caps: null
  };
  const sev = SetasScoring.assessSeverity(an);
  return SetasScoring.scoreRecipe(an, {
    ...extraCtx,
    criticals: sev.criticals,
    warnings: sev.warnings,
    severity: sev.severity
  });
};

// ── v13: normalizeRecipe — rebalancear a 100% respetando bloqueos ──
const normalizeRecipe = (rec, lockedIds = []) => {
  const locked = rec.filter(r => lockedIds.includes(r.id));
  const free = rec.filter(r => !lockedIds.includes(r.id));
  const lockedSum = locked.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  const freeSum = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  const remaining = Math.max(0, 100 - lockedSum);
  if (freeSum <= 0) return rec;
  return rec.map(r => {
    if (lockedIds.includes(r.id)) return r;
    return {
      ...r,
      p: Math.round((parseFloat(r.p) || 0) / freeSum * remaining * 10) / 10
    };
  });
};

// Aplica un tope a un ingrediente DESPUÉS de normalizar (no antes): normalizeRecipe
// reescala proporcionalmente usando el valor previo como peso, así que un clamp
// aplicado antes de normalizar no sobrevive si ese ingrediente es el único (o
// dominante) libre — la reescala lo vuelve a empujar por encima del tope. Aquí el
// excedente se reparte solo entre los demás ingredientes libres; si no hay ninguno,
// el excedente simplemente no se asigna (la receta queda <100%, visible en el score
// de mass-balance, en vez de romper el tope en silencio).
const capFreeIngredient = (rec, id, cap, lockedIds = []) => {
  const item = rec.find(r => r.id === id);
  if (!item || lockedIds.includes(id) || (parseFloat(item.p) || 0) <= cap) return rec;
  const excess = (parseFloat(item.p) || 0) - cap;
  const others = rec.filter(r => r.id !== id && !lockedIds.includes(r.id));
  const othersSum = others.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  return rec.map(r => {
    if (r.id === id) return {
      ...r,
      p: cap
    };
    if (lockedIds.includes(r.id) || othersSum <= 0) return r;
    const add = excess * (parseFloat(r.p) || 0) / othersSum;
    return {
      ...r,
      p: Math.round(((parseFloat(r.p) || 0) + add) * 10) / 10
    };
  });
};

// Techo físico razonable por rol de ingrediente para el modo 'add'/'increase'
// de applyOptToRecipe. Antes el tope era una constante (45% add / 60%
// increase) igual para cualquier insumo — un aditivo de pH o un arrancador
// terminaba con el mismo límite que una base de carbono, cuando en la
// práctica un suplemento de N por encima de ~20% o un aditivo de pH por
// encima de ~10% ya son composiciones poco realistas para producción.
const ROLE_CAP_ADD = {
  base_carbono: 80,
  suplemento_n: 20,
  suplemento_medio: 30,
  aditivo_ph: 10,
  aditivo_arrancador: 10,
  aditivo_estructura: 15,
  aditivo_micronutriente: 5,
  aireador: 15
};
const ROLE_CAP_INCREASE = {
  base_carbono: 90,
  suplemento_n: 25,
  suplemento_medio: 35,
  aditivo_ph: 12,
  aditivo_arrancador: 12,
  aditivo_estructura: 18,
  aditivo_micronutriente: 6,
  aireador: 18
};
const capForRole = (id, map, fallback, ings = INGS) => {
  const g = ings.find(x => x.id === id);
  return g && map[g.role] != null ? map[g.role] : fallback;
};
// Pure: aplica una sugerencia del Perito a una receta dada y retorna la nueva.
// No muta estado. Vivía dentro del componente SimuladorApp (nueva closure en
// cada render) — se movió a nivel de módulo para que generateOptimizer pueda
// simular "qué pasaría si aplico este ítem" y mostrar el score resultante
// antes de que el usuario decida aplicarlo (ver predictedScore más abajo).
const applyOptToRecipe = (rec, apply, locked = [], ings = INGS) => {
  if (!apply) return rec;
  // Corrección combinada (ver comboApply en generateOptimizer): un array de
  // operaciones se aplica en secuencia, cada una sobre el resultado de la
  // anterior — misma función, sin lógica nueva para el caso multi-ingrediente.
  if (Array.isArray(apply)) return apply.reduce((r, a) => applyOptToRecipe(r, a, locked, ings), rec);
  const {
    mode,
    id,
    delta,
    value
  } = apply;
  const existing = rec.find(r => r.id === id);
  if (mode === 'set') {
    return setPctProportional(rec, id, value, locked);
  }
  if (mode === 'add') {
    if (existing) {
      const curP = parseFloat(existing.p) || 0;
      // Clamp DESPUÉS de normalizar — ver comentario en capFreeIngredient: si se
      // clampea antes, la reescala proporcional de normalizeRecipe puede volver a
      // empujar el valor por encima del tope cuando es el único ingrediente libre.
      const normalized = normalizeRecipe(rec.map(r => r.id === id ? {
        ...r,
        p: curP + delta
      } : r), locked);
      return capFreeIngredient(normalized, id, capForRole(id, ROLE_CAP_ADD, 45, ings), locked);
    } else {
      const free = rec.filter(r => !locked.includes(r.id));
      const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
      const scale = Math.max(0, sumFree - delta) / Math.max(1, sumFree);
      return [...rec.map(r => locked.includes(r.id) ? r : {
        ...r,
        p: Math.round((parseFloat(r.p) || 0) * scale * 10) / 10
      }), {
        id,
        p: delta
      }];
    }
  } else if (mode === 'increase') {
    const cur = existing ? parseFloat(existing.p) || 0 : 0;
    const normalized = normalizeRecipe(rec.map(r => r.id === id ? {
      ...r,
      p: cur + delta
    } : r), locked);
    return capFreeIngredient(normalized, id, capForRole(id, ROLE_CAP_INCREASE, 60, ings), locked);
  } else if (mode === 'decrease') {
    const cur = existing ? parseFloat(existing.p) || 0 : 0;
    return normalizeRecipe(rec.map(r => r.id === id ? {
      ...r,
      p: Math.max(0, cur - delta)
    } : r).filter(r => r.p > 0.1), locked);
  }
  return normalizeRecipe(rec, locked);
};

// ── v13: calcMaxBatchFromStock — kg húmedos máximos producibles con bodega ──
const calcMaxBatchFromStock = (recipe, stockMap, batchKgWet = 10, hObj = 65, ings = INGS) => {
  const dry = batchKgWet * (1 - hObj / 100);
  let max = Infinity;
  recipe.forEach(r => {
    const g = ings.find(x => x.id === r.id);
    if (!g) return;
    const dryNeed = dry * (r.p / 100);
    const wetNeed = dryNeed / (1 - Math.min(0.92, (g.moisture || 0) / 100));
    const available = stockMap[g.id] || 0;
    if (wetNeed > 0) max = Math.min(max, available / wetNeed);
  });
  return Number.isFinite(max) ? Math.floor(max * batchKgWet) : 0;
};

// Reescribe un item del Perito con el % objetivo exacto y la predicción
const quantifyItem = (item, recipe, sKey, ings, lockedIds) => {
  if (!item.apply || !item.apply.id || !item._solve) return item;
  const {
    metric,
    target
  } = item._solve;
  const id = item.apply.id;
  const g = ings.find(i => i.id === id);
  if (!g) return item;
  const res = solveTargetPct(recipe, sKey, ings, id, metric, target, lockedIds);
  if (!res) return item;
  const cur = recipe.find(r => r.id === id);
  const curP = cur ? parseFloat(cur.p) || 0 : 0;
  // Si el % ya solucionado (curP===res.pct, p.ej. el suplemento ya está en su
  // techo de suplementación) es prácticamente el mismo de antes, no hay nada
  // nuevo que aplicar — sin esto el verbo por defecto caía en 'Bajar' aunque
  // curP y res.pct fueran iguales, y el ítem seguía mostrándose como una
  // acción pendiente indefinidamente (la sensación de "loop" reportada).
  const noChange = cur && Math.abs(res.pct - curP) < 0.15;
  const verb = !cur ? 'Agregar' : noChange ? 'Ya está en' : res.pct > curP ? 'Subir' : 'Bajar';
  item.action = `${verb} <b>${g.name}</b> a <b>${res.pct}%</b>${cur ? ` (actual ${curP.toFixed(0)}%)` : ' (nuevo)'}`;
  item.delta = `→ ${METRIC_LABEL[metric]} ${fmtMetric(metric, res.val)}`;
  item.apply = noChange ? null : {
    mode: 'set',
    id,
    value: res.pct
  };
  // Techo de suplementación alcanzado sin llegar al rango óptimo: antes el
  // ítem se veía idéntico a una corrección normal, así que aplicar (o ver
  // que ya estaba aplicado) no cambiaba nada — el usuario lo percibía como
  // que el Perito insistía en lo mismo sin avanzar. Ahora se marca
  // explícitamente que este insumo, solo, no alcanza para cerrar el
  // problema dentro del límite seguro.
  const sp = SPP[sKey];
  let inRange = true;
  if (sp) {
    if (metric === 'cn' && sp.cn_optimal) inRange = res.val >= sp.cn_optimal.min && res.val <= sp.cn_optimal.max;else if (metric === 'n' && sp.n_optimal) inRange = res.val >= sp.n_optimal.min && res.val <= sp.n_optimal.max;else if (metric === 'ph' && sp.ph_optimal) inRange = res.val >= sp.ph_optimal.min && res.val <= sp.ph_optimal.max;
  }
  if (!inRange) {
    item.capped = true;
    item.riskIfIgnored = (item.riskIfIgnored ? item.riskIfIgnored + ' · ' : '') + `${g.name} solo no alcanza el rango seguro (tope de suplementación) — se necesita un segundo ingrediente o ampliar bodega.`;
  }
  return item;
};
const generateOptimizer = (an, sKey, stockIds = new Set(), recipe = [], ings = INGS, lockedIds = [], blendedEB = null, useStock = true, appliedIcons = {}) => {
  if (!an || !an.sp) return {
    score: 0,
    status: 'sin_receta',
    items: []
  };
  const sp = an.sp;
  const items = [];
  // flags: única fuente de qué es crítico/warning, compartida con assessSeverity
  // (scoring.js) — ver comentario ahí. Este bloque solo decide texto/acción por
  // cada bandera en true, nunca redefine la condición.
  const flags = SetasScoring.detectSeverity(an);
  // Escala un delta base según qué tan lejos está el parámetro fuera de su
  // rango (flags.*OverDist, 0 = justo en el borde, 1 = un rango completo más
  // allá). Solo importa cuando todavía no hay receta cargada o el ingrediente
  // sugerido no está en ella: si hay receta, quantifyItem() más abajo
  // recalcula el % exacto vía solveTargetPct y sobreescribe este valor. Antes
  // este delta era la misma constante sin importar la magnitud del problema.
  const scaledDelta = (base, overDist) => Math.round(base * (1 + Math.min(1.5, Math.max(0, overDist || 0))));
  // Helper: mejor ingrediente en stock para un filtro+sort dados. Antes
  // siempre devolvía "el mejor" del catálogo global según sortFn, sin mirar
  // si la receta activa ya usa alguno de los candidatos válidos — dos recetas
  // muy distintas para la misma especie recibían siempre la misma sugerencia
  // de ingrediente. Ahora, entre los candidatos igualmente válidos, prefiere
  // uno que ya está en la receta (ajustar % en vez de sumar un insumo nuevo:
  // menos cambios, más fácil de ejecutar en bodega).
  // recommendedIds: qué ingredientes ya se sugirieron para OTRA bandera en
  // este mismo diagnóstico. Con bodegas chicas, el mismo insumo (el único
  // con N alto, p.ej.) suele ser el "mejor" candidato para C:N, N y EB a la
  // vez — antes bestStock lo devolvía siempre, así que el veredicto entero
  // terminaba apuntando a un solo ingrediente para todo. Ahora, si el top
  // candidato ya fue usado por otra bandera, se prueba una alternativa
  // razonable antes de repetirlo — solo si no hay alternativa, se repite
  // (mejor repetir lo correcto que forzar algo peor).
  const recommendedIds = new Set();
  // useStock=false ("Todo el catálogo"): ignora stockIds por completo, busca
  // en toda la paleta compatible con la especie. Antes bestStock SIEMPRE
  // priorizaba bodega si había aunque sea 1 coincidencia — "alternativas
  // razonables" terminaba significando "las mismas 4 cosas que ya tienes",
  // nunca un ingrediente mejor que simplemente no está en stock hoy. Mismo
  // estado (optUseStock) que ya usa el Generador de recetas, para que Perito
  // y Generador nunca queden desincronizados sobre qué modo se está usando.
  const bestStock = (filter, sortFn = (a, b) => 0) => {
    const candidates = ings.filter(g => g.cs.includes(sKey) && filter(g)).sort(sortFn);
    const inStock = useStock ? candidates.filter(g => stockIds.size === 0 || stockIds.has(g.id)) : [];
    const pool = inStock.length > 0 ? inStock : candidates;
    if (!pool.length) return null;
    const inRecipe = recipe && recipe.length ? pool.find(g => recipe.some(r => r.id === g.id)) : null;
    if (inRecipe) {
      recommendedIds.add(inRecipe.id);
      return inRecipe;
    }
    const top = pool[0];
    if (recommendedIds.has(top.id) && pool.length > 1) {
      const alt = pool.find(g => !recommendedIds.has(g.id));
      if (alt) {
        recommendedIds.add(alt.id);
        return alt;
      }
    }
    recommendedIds.add(top.id);
    return top;
  };

  // ── CRÍTICOS: fuera de rango ──
  if (flags.cnHigh) {
    const best = bestStock(g => g.n >= 1.5 && g.role !== 'base_carbono', (a, b) => b.n - a.n);
    const inRec = recipe?.find(r => best && r.id === best.id);
    items.push({
      priority: 'critical',
      icon: '↓C:N',
      label: 'C:N demasiado alto',
      action: best ? `Aumentar <b>${best.name}</b> (N=${best.n}%) — ${inRec ? 'ya en receta, sube %' : 'agregar a receta'}` : `Reducir base de carbono`,
      effect: `C:N ${an.cn.toFixed(1)}:1 > máximo ${sp.cn_optimal.max}:1 · ideal ${sp.cn_optimal.ideal}:1 · colonización tardía`,
      delta: `C:N actual ${an.cn.toFixed(0)} → objetivo ${sp.cn_optimal.ideal}`,
      apply: best ? {
        mode: inRec ? 'increase' : 'add',
        id: best.id,
        delta: scaledDelta(7, flags.cnOverDist)
      } : null
    });
  }
  if (flags.cnLow) {
    const best = bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
    const inRec = recipe?.find(r => best && r.id === best.id);
    items.push({
      priority: 'critical',
      icon: '↑C:N',
      label: 'C:N demasiado bajo',
      action: best ? `Aumentar <b>${best.name}</b> (C:N ${best.cn}:1)` : `Reducir suplementos N`,
      effect: `C:N ${an.cn.toFixed(1)}:1 < mínimo ${sp.cn_optimal.min}:1 · exceso N → riesgo contaminación`,
      delta: `C:N actual ${an.cn.toFixed(0)} → objetivo ${sp.cn_optimal.ideal}`,
      apply: best ? {
        mode: inRec ? 'increase' : 'add',
        id: best.id,
        delta: scaledDelta(8, flags.cnOverDist)
      } : null
    });
  }
  if (flags.nLow) {
    const best = bestStock(g => g.n >= 2 && g.role !== 'base_carbono', (a, b) => a.cost - b.cost);
    const inRec = recipe?.find(r => best && r.id === best.id);
    items.push({
      priority: 'critical',
      icon: '↑N',
      label: 'Nitrógeno insuficiente',
      action: best ? `${inRec ? 'Aumentar' : 'Agregar'} <b>${best.name}</b> (N=${best.n}%, $${best.cost}/kg)` : 'Agregar suplemento nitrogenado',
      effect: `N ${an.avgN.toFixed(2)}% < mínimo ${sp.n_optimal.min}% · colonización lenta y EB reducida`,
      delta: `N ${an.avgN.toFixed(2)}% → objetivo >${sp.n_optimal.min}%`,
      apply: best ? {
        mode: inRec ? 'increase' : 'add',
        id: best.id,
        delta: scaledDelta(8, flags.nOverDist)
      } : null
    });
  }
  if (flags.nHigh) {
    const base = bestStock(g => g.cn > 80 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
    const suppInRec = recipe?.filter(r => {
      const g = ings.find(i => i.id === r.id);
      return g && g.n >= 2 && g.role !== 'base_carbono';
    }) || [];
    items.push({
      priority: 'critical',
      icon: '↓N',
      label: 'Exceso de Nitrógeno',
      action: suppInRec.length > 0 ? `Reducir <b>${ings.find(g => g.id === suppInRec[0]?.id)?.name || 'suplementos'}</b> en 5–8%` : `Aumentar base de carbono`,
      effect: `N ${an.avgN.toFixed(2)}% > máximo ${sp.n_optimal.max}% · riesgo bacterias y moho verde`,
      delta: `N ${an.avgN.toFixed(2)}% → objetivo <${sp.n_optimal.max}%`,
      apply: suppInRec.length > 0 ? {
        mode: 'decrease',
        id: suppInRec[0].id,
        delta: scaledDelta(6, flags.nOverDist)
      } : base ? {
        mode: 'increase',
        id: base.id,
        delta: scaledDelta(8, flags.nOverDist)
      } : null
    });
  }
  if (flags.trichoderma) {
    items.push({
      priority: 'critical',
      icon: '⚠',
      label: 'Riesgo Trichoderma',
      action: 'Esterilizar en autoclave 121°C × 90 min, o reducir N total por debajo del umbral',
      effect: `N crítico sin esterilización → EB cae ~85% · Trichoderma compite activamente con el micelio`,
      delta: 'Acción inmediata requerida',
      apply: null
    });
  }
  if (flags.phLow) {
    const best = bestStock(g => g.ph > 7.5, (a, b) => b.ph - a.ph);
    items.push({
      priority: 'critical',
      icon: '↑pH',
      label: 'pH demasiado ácido',
      action: best ? `Agregar <b>${best.name}</b> 1–3% (pH ${best.ph})` : 'Agregar carbonato de calcio 1–2%',
      effect: `pH ${an.avgPh.toFixed(1)} < mínimo ${sp.ph_optimal.min} · enzimas del micelio trabajan a rendimiento parcial`,
      delta: `pH ${an.avgPh.toFixed(1)} → objetivo ${((sp.ph_optimal.min + sp.ph_optimal.max) / 2).toFixed(1)}`,
      apply: best ? {
        mode: 'add',
        id: best.id,
        delta: scaledDelta(2, flags.phOverDist)
      } : null
    });
  }
  if (flags.phHigh) {
    const cafe = bestStock(g => g.ph < 6 && g.n >= 0.5, (a, b) => a.ph - b.ph);
    items.push({
      priority: 'critical',
      icon: '↓pH',
      label: 'pH demasiado alcalino',
      action: cafe ? `Agregar <b>${cafe.name}</b> 8–15% (pH ${cafe.ph})` : 'Incorporar borra de café o aserrín (ácidos)',
      effect: `pH ${an.avgPh.toFixed(1)} > máximo ${sp.ph_optimal.max} · inhibe enzimas y favorece bacterias`,
      delta: `pH ${an.avgPh.toFixed(1)} → objetivo ${((sp.ph_optimal.min + sp.ph_optimal.max) / 2).toFixed(1)}`,
      apply: cafe ? {
        mode: 'add',
        id: cafe.id,
        delta: scaledDelta(10, flags.phOverDist)
      } : null
    });
  }

  // ── MEJORAS: dentro de rango pero lejos del ideal ──
  const cnDist = flags.cnDist;
  if (flags.cnWarn) {
    const subir = an.cn > sp.cn_optimal.ideal;
    const ing = subir ? bestStock(g => g.n >= 1.5 && g.role !== 'base_carbono', (a, b) => b.n - a.n) : bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
    const inRec = recipe?.find(r => ing && r.id === ing.id);
    if (ing) items.push({
      priority: 'warning',
      icon: subir ? '→N' : '→C',
      label: 'Afinar C:N al ideal',
      action: `${inRec ? 'Subir %' : 'Agregar'} <b>${ing.name}</b> en 3–5%`,
      effect: `C:N ${an.cn.toFixed(1)}:1 · ideal ${sp.cn_optimal.ideal}:1 · acercarse al centro sube EB ~${Math.round(cnDist * 15)}%`,
      delta: `+${Math.round(cnDist * 15)}% EB estimada`,
      apply: {
        mode: inRec ? 'increase' : 'add',
        id: ing.id,
        delta: 4
      }
    });
  }
  const nDist = flags.nDist;
  if (flags.nWarn) {
    const subir = an.avgN < sp.n_optimal.ideal;
    const ing = subir ? bestStock(g => g.n >= 2 && g.role !== 'base_carbono', (a, b) => a.cost - b.cost) : bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
    const inRec = recipe?.find(r => ing && r.id === ing.id);
    if (ing) items.push({
      priority: 'warning',
      icon: subir ? '→N+' : '→N-',
      label: 'Afinar Nitrógeno',
      action: `${subir ? inRec ? 'Aumentar' : 'Agregar' : 'Reducir'} <b>${ing.name}</b> en 3–5%`,
      effect: `N ${an.avgN.toFixed(2)}% · ideal ${sp.n_optimal.ideal}% · diferencia del ${Math.round(nDist * 100)}% del rango`,
      delta: `N → ${sp.n_optimal.ideal}% (+EB)`,
      apply: {
        mode: subir ? inRec ? 'increase' : 'add' : 'decrease',
        id: ing.id,
        delta: 4
      }
    });
  }
  if (flags.ebWarn) {
    const margen = sp.supplementation_max - an.suppP;
    const ing = bestStock(g => g.n >= 2 && g.role === 'suplemento_n', (a, b) => a.cost - b.cost);
    const inRec = recipe?.find(r => ing && r.id === ing.id);
    if (ing) {
      const d = Math.min(8, Math.round(margen));
      items.push({
        priority: 'warning',
        icon: '↑EB',
        label: 'Potencial de EB sin explotar',
        action: `${inRec ? 'Aumentar' : 'Agregar'} <b>${ing.name}</b> ${d}% · quedan ${Math.round(margen)}% de margen seguro`,
        effect: `EB actual ${an.eb.toFixed(0)}% · máximo especie ${sp.eb_optimal}% · suplementación dentro de límite seguro`,
        delta: `EB ${an.eb.toFixed(0)}% → ~${Math.min(sp.eb_optimal, an.eb + Math.round(margen * 1.5)).toFixed(0)}%`,
        apply: {
          mode: inRec ? 'increase' : 'add',
          id: ing.id,
          delta: d
        }
      });
    }
  }
  if (sp.ph_optimal) {
    const phIdeal = (sp.ph_optimal.min + sp.ph_optimal.max) / 2;
    const phDist = Math.abs(an.avgPh - phIdeal) / Math.max(0.01, sp.ph_optimal.max - sp.ph_optimal.min);
    if (phDist > 0.08 && an.avgPh >= sp.ph_optimal.min && an.avgPh <= sp.ph_optimal.max) {
      const subir = an.avgPh < phIdeal;
      const ajuste = subir ? bestStock(g => g.ph > 7.5, (a, b) => b.ph - a.ph) : bestStock(g => g.ph < 6, (a, b) => a.ph - b.ph);
      items.push({
        priority: 'tip',
        icon: subir ? 'pH+' : 'pH-',
        label: 'Centrar pH',
        action: ajuste ? `Agregar <b>${ajuste.name}</b> 1–2% adicional` : subir ? 'Agregar CaCO₃ 0.5–1%' : 'Agregar borra de café 5–8%',
        effect: `pH ${an.avgPh.toFixed(1)} · centro ideal ${phIdeal.toFixed(1)} · pH centrado mejora rendimiento enzimático ~5%`,
        delta: `pH ${an.avgPh.toFixed(1)} → ${phIdeal.toFixed(1)}`,
        apply: ajuste ? {
          mode: 'add',
          id: ajuste.id,
          delta: 2
        } : null
      });
    }
  }
  if (an.cost > 800) {
    const alt = bestStock(g => g.role === 'suplemento_n' && g.cost < 700 && g.n >= 1.5, (a, b) => a.cost - b.cost);
    if (alt) items.push({
      priority: 'tip',
      icon: '$↓',
      label: 'Oportunidad de costo',
      action: `<b>${alt.name}</b> ($${alt.cost}/kg, N=${alt.n}%) como suplemento parcial en bodega`,
      effect: `Costo actual $${Math.round(an.cost)}/kg · sustitución parcial puede bajar 20–30%`,
      delta: `$${Math.round(an.cost)} → ~$${Math.round(an.cost * 0.75)}/kg`,
      apply: null
    });
  }
  if (an.addP < 2) {
    const m = bestStock(g => g.role === 'aditivo_ph') || INGS.find(g => g.role === 'aditivo_ph' && g.cs.includes(sKey));
    if (m) items.push({
      priority: 'tip',
      icon: 'Ca',
      label: 'Sin mineral estabilizador',
      action: `Agregar <b>${m.name}</b> 1–2% · bajo costo, alto impacto`,
      effect: `Sin minerales detectados · CaCO₃ estabiliza pH y aporta calcio para pared celular del micelio`,
      delta: 'pH más estable · micelio más vigoroso',
      apply: {
        mode: 'add',
        id: m.id,
        delta: 2
      }
    });
  }
  if (an.avgDig < 6) {
    const dig = bestStock(g => g.dig >= 7 && g.role === 'base_carbono', (a, b) => b.dig - a.dig);
    if (dig) items.push({
      priority: 'tip',
      icon: 'Dig',
      label: 'Baja digestibilidad',
      action: `Incorporar <b>${dig.name}</b> (dig. ${dig.dig}/10) reemplazando parte de la base`,
      effect: `Digestibilidad ${an.avgDig.toFixed(1)}/10 · sustrato difícil para el micelio · pajas finas mejoran colonización`,
      delta: `Dig. ${an.avgDig.toFixed(1)} → ${dig.dig}/10`,
      apply: {
        mode: 'add',
        id: dig.id,
        delta: 10
      }
    });
  }
  // Nota altitud
  items.push({
    priority: 'info',
    icon: '⛰',
    label: 'Tenjo 2.600 msnm',
    action: 'Pasteurización: extender tiempo +25% (agua hierve ~92°C). CWLP: verificar pH≥12 antes de sumergir.',
    effect: 'La altitud no afecta incubación ni fructificación — solo el tratamiento térmico.',
    delta: null,
    apply: null
  });

  // ── CUANTIFICACIÓN: asigna métrica objetivo por ícono y resuelve el % exacto ──
  if (recipe && recipe.length) {
    const phIdeal = sp.ph_optimal ? (sp.ph_optimal.min + sp.ph_optimal.max) / 2 : null;
    items.forEach(it => {
      if (!it.apply || !it.apply.id) return;
      const ic = it.icon || '';
      let solve = null;
      if (ic === '→N' || ic === '→C' || ic.indexOf('C:N') >= 0) solve = {
        metric: 'cn',
        target: sp.cn_optimal.ideal
      };else if (ic.toLowerCase().indexOf('ph') >= 0 && phIdeal != null) solve = {
        metric: 'ph',
        target: phIdeal
      };else if (ic.indexOf('N') >= 0) solve = {
        metric: 'n',
        target: sp.n_optimal.ideal
      };
      if (solve) {
        it._solve = solve;
        quantifyItem(it, recipe, sKey, ings, lockedIds);
        delete it._solve;
      }
    });
  }
  // ── v13: enriquecer ítems con "por qué" y "riesgo si no se corrige" ──
  const WHY_MAP = {
    '↓C:N': 'La relación C:N determina velocidad de colonización y rendimiento. Alto C:N = carbono sin aprovechar.',
    '↑C:N': 'C:N bajo = exceso de nitrógeno, el nutriente que activa mohos competidores.',
    '↑N': 'El nitrógeno es el nutriente limitante para el crecimiento del micelio.',
    '↓N': 'Exceso de N activa bacterias y Trichoderma que colonizan más rápido que el micelio.',
    '⚠': 'Trichoderma colapsa el bloque — compite más rápido que cualquier micelio de seta.',
    '↑pH': 'pH ácido bloquea enzimas hidrolíticas del micelio que degradan la lignina.',
    '↓pH': 'pH alcalino inhibe el crecimiento y favorece bacterias contaminantes.',
    '↑EB': 'EB no explotada = dinero en el sustrato que el hongo no puede aprovechar.',
    'Ca': 'Sin minerales, el pH cae durante la incubación y el micelio pierde vigor a mitad del ciclo.',
    '$↓': 'El costo de ingredientes es el mayor gasto variable de la producción.',
    'Dig': 'Baja digestibilidad requiere más energía del micelio, aumentando el riesgo de contaminación.',
    '→N': 'N y C:N están relacionados: ajustar uno afecta el otro en la misma receta.',
    '→C': 'La base de carbono define la estructura física y el C:N base del sustrato.'
  };
  const RISK_MAP = {
    '↓C:N': 'Colonización lenta, EB reducida, mayor ventana de contaminación.',
    '↑C:N': 'Exceso de N → bacterias → olor a amoniaco → contaminación del lote completo.',
    '↑N': 'EB reducida 30–50%. En casos extremos, colapso completo del bloque.',
    '↓N': 'Sin corrección: probabilidad alta de Trichoderma y pérdida del lote.',
    '⚠': 'Sin autoclave: pérdida del lote completo en 5–10 días de colonización.',
    '↑pH': 'Colonización parcial, EB reducida, mayor riesgo bacteriano.',
    '↓pH': 'Bloqueo enzimático completo en pH>8 para la mayoría de Pleurotus.',
    '↑EB': 'Receta subóptima — EB 20–40% menor a lo posible con los ingredientes disponibles.',
    'Ca': 'pH variable lote-a-lote — resultados inconsistentes.',
    'Dig': 'Colonización 50–100% más lenta; mayor riesgo de contaminación por exposición prolongada.',
    '→N': 'EB por debajo del potencial óptimo de la especie.',
    '→C': 'C:N alejado del ideal reduce la eficiencia biológica estimada.'
  };
  // Cuánto se sale cada métrica de su rango (0=en el borde, 1+=un rango
  // completo más allá), por ícono — para anotar el riesgo con la magnitud
  // real en vez de un texto idéntico sin importar qué tan grave es el caso.
  const OVERDIST_BY_ICON = {
    '↓C:N': flags.cnOverDist,
    '↑C:N': flags.cnOverDist,
    '↑N': flags.nOverDist,
    '↓N': flags.nOverDist,
    '↑pH': flags.phOverDist,
    '↓pH': flags.phOverDist
  };
  items.forEach(it => {
    if (!it.why && WHY_MAP[it.icon]) it.why = WHY_MAP[it.icon];
    if (!it.riskIfIgnored && RISK_MAP[it.icon]) it.riskIfIgnored = RISK_MAP[it.icon];
    const od = OVERDIST_BY_ICON[it.icon];
    if (od != null && od > 0 && it.riskIfIgnored) {
      it.riskIfIgnored += ` · desviación actual: ${Math.round(Math.min(150, od * 100))}% más allá del límite.`;
    }
  });
  // ── Score: única fuente de verdad, compartida con runAutoOptimizer ──
  // (ver scoring.js). Perito y Optimizador ya no pueden divergir para la
  // misma receta porque ambos llaman a scoreAn/SetasScoring.scoreRecipe.
  const tr13 = calcTreatment(an, sKey);
  // blendedEB: override opcional de scoreYield con el EB mezclado con lotes
  // reales de esta especie (ver blendEBWithHistory). null/undefined = mismo
  // comportamiento de siempre (usa an.eb puro) — es estrictamente aditivo,
  // ningún llamador existente que no lo pase cambia de resultado.
  const {
    score,
    status: statusFromScore
  } = scoreAn(an, {
    treatment: tr13,
    recipe,
    stockIds,
    blendedEB
  });
  // ── Predicción: score resultante si se aplica cada ítem accionable ──
  // Antes cada sugerencia solo describía el ajuste ("sube X en Y%") sin decir
  // cuánto mejora realmente el score — dos ítems con texto de longitud/tono
  // parecido podían tener impacto muy distinto y no había forma de saberlo
  // sin aplicar y recalcular a mano. Simula con la misma función que usa el
  // botón "Aplicar" (applyOptToRecipe) y guarda el score resultante.
  // Bandera crítica → qué otra bandera crítica vigilar como posible efecto
  // colateral (mismo ingrediente/mecanismo puede mover más de una métrica:
  // subir un suplemento de N para arreglar N bajo también sube C:N hacia
  // abajo y puede pasar a "C:N demasiado bajo"). Antes cada ítem se
  // calculaba de forma aislada — nada avisaba si "arreglar" uno rompía otro.
  const SIDE_EFFECT_FLAGS = ['cnHigh', 'cnLow', 'nLow', 'nHigh', 'phLow', 'phHigh'];
  const FLAG_OWNER_ICON = {
    cnHigh: '↓C:N',
    cnLow: '↑C:N',
    nLow: '↑N',
    nHigh: '↓N',
    phLow: '↑pH',
    phHigh: '↓pH'
  };
  const FLAG_LABEL = {
    cnHigh: 'C:N demasiado alto',
    cnLow: 'C:N demasiado bajo',
    nLow: 'N insuficiente',
    nHigh: 'exceso de N',
    phLow: 'pH ácido',
    phHigh: 'pH alcalino'
  };
  // Corrección combinada: el mismo ingrediente/mecanismo que arregla un flag
  // puede empeorar otro (ver sideEffect abajo). Antes el Perito solo avisaba
  // del problema sin ofrecer la solución conjunta — el usuario tenía que
  // iterar manualmente. FLAG_FIX describe, por bandera, qué ingrediente y
  // qué métrica/objetivo usar para corregirla (mismos filtros que ya usan
  // los bloques CRÍTICOS de arriba para elegir ingrediente por bandera).
  const phIdealForCombo = sp.ph_optimal ? (sp.ph_optimal.min + sp.ph_optimal.max) / 2 : null;
  const FLAG_FIX = {
    cnHigh: () => ({
      ing: bestStock(g => g.n >= 1.5 && g.role !== 'base_carbono', (a, b) => b.n - a.n),
      metric: 'cn',
      target: sp.cn_optimal.ideal
    }),
    cnLow: () => ({
      ing: bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn),
      metric: 'cn',
      target: sp.cn_optimal.ideal
    }),
    nLow: () => ({
      ing: bestStock(g => g.n >= 2 && g.role !== 'base_carbono', (a, b) => a.cost - b.cost),
      metric: 'n',
      target: sp.n_optimal.ideal
    }),
    nHigh: () => ({
      ing: bestStock(g => g.cn > 80 && g.role === 'base_carbono', (a, b) => b.cn - a.cn),
      metric: 'n',
      target: sp.n_optimal.ideal
    }),
    phLow: () => ({
      ing: bestStock(g => g.ph > 7.5, (a, b) => b.ph - a.ph),
      metric: 'ph',
      target: phIdealForCombo
    }),
    phHigh: () => ({
      ing: bestStock(g => g.ph < 6 && g.n >= 0.5, (a, b) => a.ph - b.ph),
      metric: 'ph',
      target: phIdealForCombo
    })
  };
  if (recipe && recipe.length) {
    items.forEach(it => {
      if (!it.apply || it.priority !== 'critical' && it.priority !== 'warning') return;
      try {
        const candidate = applyOptToRecipe(recipe, it.apply, lockedIds, ings);
        const a2 = analyze(candidate, sKey, ings);
        if (!a2) return;
        const s2 = scoreAn(a2, {
          treatment: calcTreatment(a2, sKey),
          recipe: candidate,
          stockIds
        });
        it.predictedScore = s2.score;
        const newFlags = SetasScoring.detectSeverity(a2) || {};
        const worsened = SIDE_EFFECT_FLAGS.filter(k => newFlags[k] && !flags[k] && FLAG_OWNER_ICON[k] !== it.icon);
        if (worsened.length) {
          it.sideEffect = `Ojo: aplicar esto puede generar ${worsened.map(k => FLAG_LABEL[k]).join(' y ')}.`;
          // Intenta un segundo ajuste, resuelto sobre la receta YA corregida
          // por el primero, que apague el efecto colateral sin deshacer el
          // arreglo original — no es una regresión simultánea de las dos
          // métricas, es un solve en dos pasos, pero cada paso usa el mismo
          // solveTargetPct exacto que ya usa "Aplicar" individualmente.
          const fixKey = worsened[0];
          const fix = FLAG_FIX[fixKey] ? FLAG_FIX[fixKey]() : null;
          if (fix && fix.ing && fix.target != null) {
            const res2 = solveTargetPct(candidate, sKey, ings, fix.ing.id, fix.metric, fix.target, lockedIds);
            if (res2) {
              const secondApply = {
                mode: 'set',
                id: fix.ing.id,
                value: res2.pct
              };
              const candidate2 = applyOptToRecipe(candidate, secondApply, lockedIds, ings);
              const a3 = analyze(candidate2, sKey, ings);
              if (a3) {
                const s3 = scoreAn(a3, {
                  treatment: calcTreatment(a3, sKey),
                  recipe: candidate2,
                  stockIds
                });
                if (s3.score > it.predictedScore) {
                  it.comboApply = [it.apply, secondApply];
                  it.comboPredictedScore = s3.score;
                  it.comboLabel = `Aplicar junto con ${fix.ing.name} — evita ${FLAG_LABEL[fixKey]}`;
                }
              }
            }
          }
        }
      } catch (e) {/* candidato inválido (p.ej. ingrediente sin datos) — se omite la predicción */}
    });
  }
  // Garantía: si la receta es casi-óptima pero no hay tips útiles, sugerir refinamiento mineral.
  const hasTips = items.some(s => s.priority === 'tip');
  if (score >= 85 && !hasTips && recipe && recipe.length) {
    const mineral = INGS.filter(g => g.role === 'aditivo_ph' && g.cs.includes(sKey))[0];
    if (mineral && !recipe.find(r => r.id === mineral.id)) {
      items.push({
        priority: 'tip',
        icon: 'Ca',
        label: 'Afinar con mineral estabilizador',
        action: `Agregar <b>${mineral.name}</b> 1–2% · estabiliza pH durante toda la incubación`,
        effect: `Receta ya óptima · CaCO₃ amortigua la caída de pH por ácidos del micelio y reduce variabilidad lote-a-lote`,
        delta: 'pH estable +5% consistencia EB',
        apply: {
          mode: 'add',
          id: mineral.id,
          delta: 2
        }
      });
    } else {
      items.push({
        priority: 'tip',
        icon: '$↓',
        label: 'Refinamiento de costo',
        action: 'Revisar si algún suplemento se puede sustituir por un residuo local más barato sin perder N',
        effect: `Receta dentro de óptimo · oportunidad es bajar costo manteniendo C:N y N`,
        delta: null,
        apply: null
      });
    }
  }
  // Marca genérica "no está en bodega hoy": en modo catálogo (useStock=false)
  // el ingrediente elegido puede no estar en stock — sin esto, el veredicto
  // mezclaba sugerencias ejecutables ahora mismo con sugerencias que en
  // realidad son "comprar esto primero", indistinguibles en la UI.
  if (stockIds && stockIds.size > 0) {
    items.forEach(it => {
      const apOps = Array.isArray(it.apply) ? it.apply : it.apply ? [it.apply] : [];
      if (apOps.some(op => op.id && !stockIds.has(op.id))) it.notInStock = true;
    });
  }
  // "Ya aplicaste esto y el problema sigue": appliedIcons cuenta, por
  // ícono/bandera (no por operación exacta — un refinamiento legítimo del
  // mismo ingrediente, ej. subir Harina de Pescado de 8%→9.4% para afinar N
  // después de haberla usado para C:N, NO es "lo mismo otra vez"), cuántas
  // veces se aplicó una corrección apuntando a ESE problema en la sesión
  // activa (ver applyOptStep). Si la bandera sigue activa después de
  // haberla atacado antes, antes se veía idéntica a la primera vez —
  // sensación de estancamiento sin ninguna señal de que ya se intentó.
  items.forEach(it => {
    if (it.apply && appliedIcons[it.icon] > 0) it.repeatedApply = appliedIcons[it.icon];
  });
  // Orden por impacto real (predictedScore), no por el orden fijo en que se
  // evalúan las banderas (cnHigh, cnLow, nLow...). Antes la lista se veía con
  // la misma forma sesión tras sesión aunque el problema más urgente
  // cambiara — el usuario lo percibía como sugerencias "formulaicas". Los
  // grupos criticals/warnings/tips se separan después con items.filter()
  // (preserva orden) — sort() es estable, así que items sin predictedScore
  // mantienen su orden relativo entre sí.
  items.sort((a, b) => (b.predictedScore ?? -1) - (a.predictedScore ?? -1));
  return {
    score,
    status: statusFromScore,
    items
  };
};

// ── Costos energéticos de procesamiento (COP / kg de sustrato húmedo) ──
// Autoclave  : ~3.5 kWh / ciclo 90 min (resistencia 3.5 kW) ÷ 15 kg por ciclo × $800 COP/kWh ≈ 187 COP/kg
// Pasteuriz. : agua+resistencia ~0.8 kWh/kg sustrato (calentado + mantenimiento 6–8h) × $800 ≈ 640 COP/kg
// CWLP       : cal + agua fría → consumo eléctrico despreciable ≈ 0 COP/kg
// Tarifa eléctrica Tenjo (estrato 1–2 industria pequeña): ~$800 COP/kWh (jun 2026)
const ENERGY_COST = {
  autoclave: {
    cop_per_kg_humedo: 187,
    kwh_per_kg: .234,
    detalle: 'Autoclave 3.5 kW · ciclo 90 min · 15 kg/ciclo · tarifa $800/kWh'
  },
  thermal: {
    cop_per_kg_humedo: 640,
    kwh_per_kg: .800,
    detalle: 'Resistencia + agua · 6–8 h · sostenida 65–75°C núcleo · tarifa $800/kWh'
  },
  cwlp: {
    cop_per_kg_humedo: 0,
    kwh_per_kg: 0,
    detalle: 'Cal en frío — sin consumo eléctrico significativo'
  }
};
// Factor húmedo→seco para convertir costo/kg húmedo a costo/kg seco (≈ HR objetivo)
// Pleurotus: H~65% → kg_seco = kg_humedo × 0.35
// Madera (shiitake, lions_mane, reishi, nameko): H~60% → kg_seco = kg_humedo × 0.40
const energyCostPerKgSeco = (col, sKey) => {
  const e = ENERGY_COST[col];
  if (!e) return 0;
  const hFactor = ['shiitake', 'lions_mane', 'reishi', 'nameko'].includes(sKey) ? 0.40 : 0.35;
  return Math.round(e.cop_per_kg_humedo / hFactor);
};
const calcTreatment = (a, sKey) => {
  if (!a) return null;
  const {
    suppP,
    manP,
    cafeP,
    avgN,
    trichoderma,
    dynSpawn
  } = a;
  const sp = SPP[sKey];
  let score = 0,
    reasons = [];
  if (trichoderma) {
    score += 3;
    reasons.push('⚠ Colapso Trichoderma — N crítico sin esterilización');
  }
  if (suppP > (sp?.supplementation_max || 20)) {
    score += 2;
    reasons.push(`Supl ${suppP.toFixed(0)}% > máx`);
  } else if (suppP > 15) {
    score += 1;
    reasons.push('Supl alta');
  }
  if (avgN > 2.5) {
    score += 2;
    reasons.push(`N ${avgN.toFixed(2)}%`);
  } else if (avgN > 1.8) {
    score += 1;
    reasons.push('N elevado');
  }
  if (['shiitake', 'lions_mane', 'reishi', 'nameko'].includes(sKey)) {
    score += 2;
    reasons.push(`${sp?.name} requiere esterilización`);
  }
  if (manP > 20) {
    score += 1;
    reasons.push('Estiércol alto');
  }
  if (cafeP > 0 && cafeP <= 30) {
    score -= .5;
    reasons.push('Café pre-pasteurizado');
  }
  const spawn = dynSpawn || sp?.spawn_rate || 8;
  const ec = col => ({
    ...ENERGY_COST[col],
    cop_per_kg_seco: energyCostPerKgSeco(col, sKey)
  });
  if (score >= 2) return {
    name: 'Esterilización en Autoclave',
    temp: '121°C / 15 PSI',
    time: '90–120 min',
    spawn,
    col: 'autoclave',
    reasons,
    prep: 'Empacar bolsas, esterilizar, enfriar 4–6h antes de inocular.',
    alt: '△ Tenjo: la presión del autoclave compensa altitud. Mantener 15 PSI constante.',
    energy: ec('autoclave')
  };
  if (score >= .5) return {
    name: 'Pasteurización Térmica',
    temp: 'Núcleo 65–75°C',
    time: '6–8 h (base 5–6 h +25% altitud)',
    spawn,
    col: 'thermal',
    reasons,
    prep: 'Sumergir el sustrato y sostener el NÚCLEO entre 65–75°C de forma constante. Verificar con termómetro de pincho en el centro de la masa, no solo el agua.',
    alt: '△ Tenjo (2.580 msnm): el agua hierve a ~91°C, por lo que la transferencia de calor al núcleo es más lenta — se aplica un factor de +25% sobre el tiempo de receta estándar para garantizar pasteurización efectiva en el centro.',
    energy: ec('thermal')
  };
  return {
    name: 'CWLP — Cal en Frío',
    temp: 'Ambiente (~14°C Tenjo)',
    time: '18–24 h inmersión',
    spawn,
    col: 'cwlp',
    reasons,
    prep: '150–200 g cal / 100 L agua. Sumergir, escurrir, inocular.',
    alt: '△ Tenjo: CWLP funciona independiente de altitud. Verificar pH≥12 antes de sumergir.',
    energy: ec('cwlp')
  };
};

// B · Balance de masas húmedas industrial.
// Convierte la receta teórica (% base seca) en órdenes de pesado reales en báscula,
// derivando la masa seca del objetivo de humedad del lote y la humedad intrínseca de
// cada insumo comercial. Cierra el balance al peso húmedo objetivo exacto.
const calcBatch = (recipe, n, kg, hObj = 67, spawnCostKg = 12000, ings = INGS, dynSpawn = 8) => {
  if (!recipe.length || !n || !kg) return null;
  const wet = n * kg; // sustrato húmedo final objetivo (kg)
  const hF = Math.min(0.85, Math.max(0.40, hObj / 100)); // fracción de humedad objetivo
  const dry = wet * (1 - hF); // masa seca total requerida (kg)
  const spawnRate = Math.min(0.15, Math.max(0.05, dynSpawn / 100));
  const items = recipe.map(r => {
    const g = ings.find(i => i.id === r.id);
    if (!g) return null;
    const masaSeca = dry * (parseFloat(r.p) / 100); // aporte seco del insumo
    const m = Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)); // humedad intrínseca
    const kr = masaSeca / (1 - m); // kg comerciales reales a pesar en báscula
    const aguaOculta = kr * m; // agua que ya trae el insumo
    return {
      name: g.name,
      kr,
      masaSeca,
      aguaOculta,
      cost: kr * g.cost,
      unit: kr < .5 ? `${Math.round(kr * 1000)} g` : `${kr.toFixed(2)} kg`
    };
  }).filter(Boolean);
  const aguaTot = dry * (hF / (1 - hF)); // agua total que debe contener la mezcla
  const aguaInh = items.reduce((s, i) => s + i.aguaOculta, 0); // agua aportada por los insumos
  const agua = Math.max(0, aguaTot - aguaInh); // agua neta a inyectar (L ≈ kg)
  const kgComercialTotal = items.reduce((s, i) => s + i.kr, 0); // peso total a pesar (base húmeda comercial)
  const sustCost = items.reduce((s, i) => s + i.cost, 0);
  const spawnKg = wet * spawnRate;
  const spawnCostTotal = spawnKg * spawnCostKg;
  const totalCost = sustCost + spawnCostTotal;
  const costPerBag = n > 0 ? totalCost / n : 0;
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
    totalCost,
    costPerBag,
    agua,
    hObj
  };
};
const calcSchedule = (sKey, dateStr, eb) => {
  const sp = SPP[sKey];
  if (!sp || !dateStr) return null;
  const base = new Date(dateStr + 'T12:00:00');
  const add = (d, n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };
  const fmt = d => d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const T = {
    p_ostreatus_gris: {
      c50: 12,
      c100: 22,
      pr: 28,
      f1: 35,
      f2: 52,
      f3: 68
    },
    p_ostreatus_blanco: {
      c50: 14,
      c100: 26,
      pr: 32,
      f1: 40,
      f2: 57,
      f3: 74
    },
    p_djamor_rosa: {
      c50: 14,
      c100: 28,
      pr: 34,
      f1: 42,
      f2: 59,
      f3: 76
    },
    p_eryngii: {
      c50: 18,
      c100: 32,
      pr: 40,
      f1: 48,
      f2: 66,
      f3: 84
    },
    shiitake: {
      c50: 30,
      c100: 55,
      pr: 75,
      f1: 90,
      f2: 115,
      f3: 140
    },
    lions_mane: {
      c50: 20,
      c100: 35,
      pr: 42,
      f1: 50,
      f2: 68,
      f3: 86
    },
    reishi: {
      c50: 25,
      c100: 50,
      pr: 80,
      f1: 120,
      f2: 160,
      f3: 200
    },
    enoki: {
      c50: 15,
      c100: 28,
      pr: 35,
      f1: 42,
      f2: 58,
      f3: 74
    },
    nameko: {
      c50: 20,
      c100: 38,
      pr: 48,
      f1: 60,
      f2: 80,
      f3: 100
    }
  };
  const d = T[sKey] || T.p_ostreatus_gris;
  const adj = n => Math.round(n / Math.max(.85, Math.min(1.2, (eb || 100) / 100)));
  const evts = [{
    key: 'in',
    type: 'inoculation',
    day: 0,
    title: 'Inoculación',
    detail: `Empacar bolsas. Spawn ${sp.spawn_rate}%.`
  }, {
    key: 'c5',
    type: 'normal',
    day: adj(d.c50),
    title: 'Colonización 50%',
    detail: 'Micelio blanco visible en la bolsa.'
  }, {
    key: 'c1',
    type: 'normal',
    day: adj(d.c100),
    title: 'Colonización completa',
    detail: `Pasar a cámara de fructificación. ${sp.temp_fruit}.`
  }, {
    key: 'pr',
    type: 'normal',
    day: adj(d.pr),
    title: 'Primordios',
    detail: 'HR 90–95%. Abrir bolsa o cortar.'
  }, {
    key: 'f1',
    type: 'harvest',
    day: adj(d.f1),
    title: 'Primera cosecha',
    detail: `~${eb ? (eb * .55).toFixed(0) : '?'}% EB.`
  }, {
    key: 'f2',
    type: 'harvest',
    day: adj(d.f2),
    title: 'Segunda cosecha',
    detail: `~${eb ? (eb * .35).toFixed(0) : '?'}% EB.`
  }, {
    key: 'f3',
    type: 'harvest',
    day: adj(d.f3),
    title: 'Tercera cosecha',
    detail: 'Evaluar si compostar el bloque.'
  }];
  return {
    evts: evts.map(e => ({
      ...e,
      ds: fmt(add(base, e.day))
    })),
    tot: adj(d.f3),
    first: fmt(add(base, adj(d.f1))),
    inc: adj(d.c100)
  };
};
const PasteGuide = ({
  tr,
  recipe,
  numBags,
  kgBag
}) => {
  if (!tr) return null;
  const wet = (numBags * kgBag).toFixed(1);
  const guides = {
    autoclave: [{
      n: 1,
      t: 'Empaque las bolsas',
      d: `Llena cada bolsa PP hasta ${kgBag} kg de sustrato húmedo. Cierra con filtro 0.2 µm o algodón + papel kraft + cinta autoclave. No comprimas.`
    }, {
      n: 2,
      t: 'Carga el autoclave',
      d: 'Apila las bolsas sin sobrecargar. Deja espacio para circulación de vapor. Coloca indicador de esterilización (tira o pellet).'
    }, {
      n: 3,
      t: 'Purga de aire',
      d: 'Al iniciar, abre la válvula de purga 2–3 min para expulsar el aire frío. El vapor debe salir continuo antes de cerrar.'
    }, {
      n: 4,
      t: 'Esteriliza',
      d: `Mantén 121°C / 15 PSI durante 90–120 min. A 2.580 msnm la presión del autoclave compensa la altitud — los parámetros son los mismos que a nivel del mar.`
    }, {
      n: 5,
      t: 'Enfría (crítico)',
      d: `Deja enfriar dentro del autoclave apagado. Saca las bolsas cuando estén a <35°C (mínimo 4–6 h). Nunca abras caliente — la condensación abre los poros y contamina.`
    }, {
      n: 6,
      t: 'Inocula en condiciones estériles',
      d: `Usa cámara de flujo laminar o caja SAB. Alcohol 70% en todas las superficies. Spawn rate: ${tr.spawn}%. Sella inmediatamente.`
    }],
    thermal: [{
      n: 1,
      t: 'Prepara el baño de pasteurización',
      d: `Calienta agua para sumergir ${wet} kg de sustrato. Usa termómetro calibrado de pincho. En Tenjo (2.580 msnm) el agua hierve a ~91°C: el calor llega más lento al núcleo, por eso se trabaja por tiempo extendido y se mide el centro de la masa, no solo el agua.`
    }, {
      n: 2,
      t: 'Sumerge el sustrato',
      d: 'Introduce el sustrato en bolsas o costales permeables. Asegura que todo quede bajo el agua con un peso. Sin burbujas de aire atrapadas.'
    }, {
      n: 3,
      t: 'Pasteuriza por núcleo',
      d: `Sostén el NÚCLEO del sustrato entre 65–75°C durante 6–8 h (base 5–6 h +25% por altitud). Clava el termómetro en el centro de la masa y verifica cada 20 min — el agua puede estar más caliente que el núcleo. No superes 80°C: por encima se esteriliza de más y se pierde la microbiota protectora.`
    }, {
      n: 4,
      t: 'Enfría tapado',
      d: 'Escurre y deja enfriar en lugar limpio tapado con plástico. No muevas hasta que esté <30°C (mínimo 3–4 h en ambiente Tenjo 14°C).'
    }, {
      n: 5,
      t: 'Prueba de campo',
      d: 'Aprieta un puñado — debe caer máximo 1–2 gotas de agua. Si chorrea, escurre más. Si no sale nada, agrega agua.'
    }, {
      n: 6,
      t: 'Inocula',
      d: `Spawn rate: ${tr.spawn}%. Mezcla bien o distribuye en capas. Cierra con polyfil o filtro. Registra fecha y lote.`
    }],
    cwlp: [{
      n: 1,
      t: 'Prepara la solución de cal',
      d: `Disuelve 150–200 g de cal hidratada por cada 100 L de agua. Mezcla bien y verifica pH ≥ 12 con tira indicadora (pH 12–13 es el rango activo contra patógenos). A 2.580 msnm CWLP funciona igual que a nivel del mar — independiente de temperatura.`
    }, {
      n: 2,
      t: 'Sumerge el sustrato',
      d: `Introduce ${wet} kg de sustrato. Usa pesos para mantenerlo sumergido. Todo debe estar en contacto con la solución — sin partes secas.`
    }, {
      n: 3,
      t: 'Tiempo de inmersión',
      d: 'Mantén sumergido 18–24 horas. No es necesario calentar. La alcalinidad (no el calor) es el agente sanitizante.'
    }, {
      n: 4,
      t: 'Escurre y neutraliza',
      d: 'Saca y escurre bien. Si el pH final del sustrato es >9, enjuaga brevemente con agua limpia. El pH objetivo del sustrato escurrido es 7–8.'
    }, {
      n: 5,
      t: 'Punto de campo',
      d: 'Misma prueba: 1–2 gotas al apretar. En Tenjo el aire seco acelera el secado — a veces hay que agregar agua después del escurrido.'
    }, {
      n: 6,
      t: 'Inocula',
      d: `Spawn rate: ${tr.spawn}%. Inocula máximo 2–3 h después de escurrir. Tiempo de exposición al aire aumenta riesgo de recontaminación.`
    }]
  };
  const steps = guides[tr.col] || [];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: 'var(--paper-200)',
      border: '1px solid var(--border-soft)',
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec"
  }, "Gu\xEDa de ", tr.name, " \xB7 Tenjo 2.580 msnm"), steps.map(st => /*#__PURE__*/React.createElement("div", {
    key: st.n,
    style: {
      display: 'flex',
      gap: 14,
      marginBottom: 12,
      paddingBottom: 12,
      borderBottom: '1px solid var(--paper-300)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 28,
      fontWeight: 300,
      color: 'var(--coral-500)',
      lineHeight: 1,
      minWidth: 32,
      paddingTop: 2
    }
  }, st.n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-900)',
      marginBottom: 4
    }
  }, st.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      color: 'var(--ink-700)',
      lineHeight: 1.55
    }
  }, st.d)))));
};
const RadarChart = ({
  an,
  cAn,
  sKey,
  cmpKey
}) => {
  if (!an || !an.sp) return null;
  const spA = an.sp,
    spB = cAn && cAn.sp ? cAn.sp : spA;
  const norm = (v, min, max) => Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  const axes = [{
    label: 'C:N',
    va: norm(an.cn, spA.cn_optimal.min, spA.cn_optimal.max * (1 + 0.3)),
    vb: cAn ? norm(cAn.cn, spB.cn_optimal.min, spB.cn_optimal.max * (1 + 0.3)) : 0,
    inv: true
  }, {
    label: 'N%',
    va: norm(an.avgN, spA.n_optimal.min * 0.5, spA.n_optimal.max * 1.3),
    vb: cAn ? norm(cAn.avgN, spB.n_optimal.min * 0.5, spB.n_optimal.max * 1.3) : 0,
    inv: false
  }, {
    label: 'EB%',
    va: norm(an.eb, spA.eb_baseline * 0.5, spA.eb_optimal * 1.1),
    vb: cAn ? norm(cAn.eb, spB.eb_baseline * 0.5, spB.eb_optimal * 1.1) : 0,
    inv: false
  }, {
    label: 'Costo',
    va: 1 - norm(an.cost, 0, 3000),
    vb: cAn ? 1 - norm(cAn.cost, 0, 3000) : 0,
    inv: false
  }, {
    label: 'pH',
    va: an.sp.ph_optimal ? norm(an.avgPh, an.sp.ph_optimal.min, an.sp.ph_optimal.max) : 0.5,
    vb: cAn && cAn.sp && cAn.sp.ph_optimal ? norm(cAn.avgPh, cAn.sp.ph_optimal.min, cAn.sp.ph_optimal.max) : 0.5,
    inv: false
  }, {
    label: 'Digest.',
    va: norm(an.avgDig, 0, 10),
    vb: cAn ? norm(cAn.avgDig, 0, 10) : 0,
    inv: false
  }];
  const N = axes.length;
  const cx = 150,
    cy = 150,
    r = 100;
  const angle = i => i * 2 * Math.PI / N - Math.PI / 2;
  const pt = (i, v) => [cx + r * v * Math.cos(angle(i)), cy + r * v * Math.sin(angle(i))];
  const rings = [0.25, 0.5, 0.75, 1];
  const polyA = axes.map((ax, i) => pt(i, ax.va)).map(p => p.join(',')).join(' ');
  const polyB = axes.map((ax, i) => pt(i, ax.vb)).map(p => p.join(',')).join(' ');
  const [fullscreen, setFullscreen] = React.useState(false);
  const RadarSVG = ({
    size = 260
  }) => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 300 300",
    width: size,
    height: size,
    style: {
      overflow: 'visible'
    }
  }, rings.map(rv => /*#__PURE__*/React.createElement("polygon", {
    key: rv,
    points: axes.map((_, i) => pt(i, rv).join(',')).join(' '),
    fill: "none",
    stroke: "var(--border-soft)",
    strokeWidth: rv === 1 ? 1.5 : 0.8,
    strokeDasharray: rv < 1 ? '3,3' : 'none'
  })), axes.map((_, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: cx,
    y1: cy,
    x2: pt(i, 1)[0],
    y2: pt(i, 1)[1],
    stroke: "var(--border-soft)",
    strokeWidth: "0.8"
  })), /*#__PURE__*/React.createElement("polygon", {
    points: polyA,
    fill: "rgba(184,97,77,0.15)",
    stroke: "var(--coral-700)",
    strokeWidth: "2",
    strokeLinejoin: "round"
  }), cAn && /*#__PURE__*/React.createElement("polygon", {
    points: polyB,
    fill: "rgba(42,90,139,0.12)",
    stroke: "var(--accent-blue-grey)",
    strokeWidth: "2",
    strokeLinejoin: "round",
    strokeDasharray: "5,3"
  }), axes.map((ax, i) => {
    const p = pt(i, 1.18);
    const ta = Math.cos(angle(i)) > 0.1 ? 'start' : Math.cos(angle(i)) < -0.1 ? 'end' : 'middle';
    return /*#__PURE__*/React.createElement("text", {
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
    }, ax.label);
  }), axes.map((ax, i) => {
    const pa = pt(i, ax.va);
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: pa[0],
      cy: pa[1],
      r: "3.5",
      fill: "var(--coral-700)"
    });
  }), cAn && axes.map((ax, i) => {
    const pb = pt(i, ax.vb);
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: pb[0],
      cy: pb[1],
      r: "3",
      fill: "none",
      stroke: "var(--accent-blue-grey)",
      strokeWidth: "2"
    });
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: "3",
    fill: "var(--border-soft)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "6",
    width: "10",
    height: "10",
    fill: "rgba(184,97,77,0.3)",
    stroke: "var(--coral-700)",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("text", {
    x: "20",
    y: "14",
    fontFamily: "var(--font-mono)",
    fontSize: "9",
    fill: "var(--ink-900)"
  }, "Receta A"), cAn && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "22",
    width: "10",
    height: "2",
    fill: "none",
    stroke: "var(--accent-blue-grey)",
    strokeWidth: "2",
    strokeDasharray: "4,2"
  }), /*#__PURE__*/React.createElement("text", {
    x: "20",
    y: "27",
    fontFamily: "var(--font-mono)",
    fontSize: "9",
    fill: "var(--ink-900)"
  }, "Receta B")));
  if (fullscreen) return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setFullscreen(false),
    "aria-label": "Cerrar vista de radar",
    style: {
      position: 'absolute',
      top: 20,
      right: 20,
      fontSize: 28,
      background: 'none',
      border: 'none',
      color: 'var(--paper-0)',
      cursor: 'pointer',
      minWidth: 44,
      minHeight: 44
    }
  }, "\u2715"), /*#__PURE__*/React.createElement(RadarSVG, {
    size: 600
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: "var(--text-base)",
      color: 'var(--paper-0)',
      textAlign: 'center'
    }
  }, "Presiona Esc o haz clic en \u2715 para cerrar"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-5) 0 var(--space-4)',
      background: 'var(--paper-200)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(RadarSVG, {
    size: 260
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFullscreen(true),
    style: {
      marginTop: 12,
      fontFamily: 'var(--font-body)',
      fontSize: "var(--text-xs)",
      fontWeight: 700,
      padding: 'var(--space-2) var(--space-3)',
      background: 'var(--coral-500)',
      color: 'var(--paper-0)',
      border: 'none',
      borderRadius: 'var(--r-sm)',
      cursor: 'pointer',
      letterSpacing: 'var(--tracking-label)'
    }
  }, "\u26F6 Pantalla completa"));
};
const NitrogenChart = ({
  recipe
}) => {
  if (!recipe || !recipe.length) return null;
  const items = recipe.map(r => {
    const g = INGS.find(i => i.id === r.id);
    if (!g || !g.cn || !g.n) return null;
    const contrib = g.n * (parseFloat(r.p) || 0) / 100;
    return contrib > 0 ? {
      name: g.name,
      contrib
    } : null;
  }).filter(Boolean).sort((a, b) => b.contrib - a.contrib);
  const total = items.reduce((s, i) => s + i.contrib, 0);
  if (!total || items.length === 0) return null;
  const PAL = ['var(--coral-700)', 'var(--accent-olive)', 'var(--ochre-600)', 'var(--accent-blue-grey)', 'var(--accent-terracotta)', 'var(--moss-700)', 'var(--ochre-500)', 'var(--slate-600,var(--accent-blue-grey))', 'var(--coral-700)', 'var(--moss-500)'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      background: 'var(--paper-100)',
      border: '1px solid var(--border-soft)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 10
    }
  }, "Contribuci\xF3n de Nitr\xF3geno por ingrediente"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18,
      display: 'flex',
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 11,
      border: '1px solid rgba(0,0,0,.07)'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: `${it.name}: ${(it.contrib / total * 100).toFixed(1)}% del N total`,
    style: {
      width: `${it.contrib / total * 100}%`,
      background: PAL[i % PAL.length],
      transition: 'width .35s',
      minWidth: it.contrib / total > 0.01 ? 2 : 0
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '5px 16px'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 9,
      height: 9,
      background: PAL[i % PAL.length],
      flexShrink: 0,
      border: '1px solid rgba(0,0,0,.1)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--ink-700)',
      fontWeight: 500
    }
  }, it.name.length > 22 ? it.name.slice(0, 22) + '…' : it.name, "\xA0", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink-900)'
    }
  }, (it.contrib / total * 100).toFixed(1), "%"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 9,
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: 'var(--ink-600)',
      borderTop: '1px solid var(--paper-300)',
      paddingTop: 7
    }
  }, "N absoluto en sustrato: ", total.toFixed(3), " g/100g (masa seca)"));
};

// ── v3: FlushChart — projected yield per flush ──
const FlushChart = ({
  an
}) => {
  if (!an || !an.eb || an.eb < 10) return null;
  const eb = an.eb;
  const ebLow = an.ebLow ?? Math.round(eb * 0.82);
  const ebHigh = an.ebHigh ?? Math.round(eb * 1.18);
  const flushes = [{
    label: '1ª',
    sub: 'Cosecha',
    pct: 0.55,
    days: '35–45 d',
    color: 'var(--coral-500)',
    bg: 'rgba(184,97,77,.08)'
  }, {
    label: '2ª',
    sub: 'Cosecha',
    pct: 0.30,
    days: '55–70 d',
    color: 'var(--accent-olive)',
    bg: 'rgba(77,98,53,.07)'
  }, {
    label: '3ª',
    sub: 'Cosecha',
    pct: 0.15,
    days: '75–95 d',
    color: 'var(--ochre-500,#A07828)',
    bg: 'rgba(160,120,40,.07)'
  }];
  const maxPct = flushes[0].pct;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      background: 'var(--paper-50,var(--paper-100))',
      border: '1px solid var(--border-soft)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px 8px',
      borderBottom: '1px solid var(--border-soft)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-400)',
      fontWeight: 600
    }
  }, "Proyecci\xF3n de cosechas"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-600)',
      fontWeight: 700
    }
  }, "EB ", ebLow, "\u2013", ebHigh, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 0
    }
  }, flushes.map((f, i) => {
    const val = eb * f.pct;
    const barH = Math.round(f.pct / maxPct * 72);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        borderRight: i < 2 ? '1px solid var(--border-soft)' : 'none',
        padding: '12px 12px 10px',
        background: f.bg,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: f.color,
        fontWeight: 700,
        opacity: .85
      }
    }, f.label, " ", f.sub), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1,
        color: f.color,
        letterSpacing: 'var(--tracking-tight)'
      }
    }, val.toFixed(0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-base)",
        fontWeight: 400,
        opacity: .7
      }
    }, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)',
        letterSpacing: 'var(--tracking-label)'
      }
    }, (val / 100).toFixed(2), " kg/kg"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        marginTop: 6,
        height: 4,
        background: 'rgba(0,0,0,.07)',
        borderRadius: 2,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${f.pct / maxPct * 100}%`,
        background: f.color,
        borderRadius: 2,
        transition: 'width .6s cubic-bezier(.4,0,.2,1)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-400)',
        marginTop: 1
      }
    }, f.days));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 14px',
      borderTop: '1px solid var(--border-soft)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-400)',
      background: 'var(--paper-100)'
    }
  }, "Distribuci\xF3n 55/30/15% \xB7 \xB1", Math.round((ebHigh - ebLow) / 2 / eb * 100), "% incertidumbre \xB7 por kg sustrato seco"));
};

// ── v3: CompositionChart — stacked bar by role ──
const CompositionChart = ({
  recipe
}) => {
  if (!recipe || !recipe.length) return null;
  const ROLE_LABELS = {
    base_carbono: 'Base C',
    suplemento_n: 'Supl. N',
    suplemento_medio: 'Supl. Medio',
    aireador: 'Aireador',
    aditivo_ph: 'pH',
    aditivo_estructura: 'Estructura',
    aditivo_micronutriente: 'Micronut.',
    aditivo_arrancador: 'Arrancador'
  };
  const ROLE_COLORS = {
    base_carbono: '#5A7042',
    suplemento_n: '#C68F2C',
    suplemento_medio: '#D4A838',
    aireador: '#4E7A6A',
    aditivo_ph: '#8B5C28',
    aditivo_estructura: '#7A6B58',
    aditivo_micronutriente: '#2A6A7A',
    aditivo_arrancador: '#9B4F3A'
  };
  const groups = {};
  recipe.forEach(r => {
    const g = INGS.find(i => i.id === r.id);
    if (!g) return;
    const role = g.role || 'base_carbono';
    groups[role] = (groups[role] || 0) + (parseFloat(r.p) || 0);
  });
  const total = Object.values(groups).reduce((s, v) => s + v, 0);
  if (!total) return null;
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: '14px 16px',
      background: 'var(--paper-100)',
      border: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 10
    }
  }, "Composici\xF3n por funci\xF3n"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18,
      display: 'flex',
      borderRadius: 2,
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,.07)',
      marginBottom: 10
    }
  }, entries.map(([role, val], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: `${ROLE_LABELS[role] || role}: ${val.toFixed(1)}%`,
    style: {
      width: `${val / total * 100}%`,
      background: ROLE_COLORS[role] || 'var(--ink-2)',
      transition: 'width .4s'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px 14px'
    }
  }, entries.map(([role, val], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 9,
      height: 9,
      background: ROLE_COLORS[role] || 'var(--ink-2)',
      flexShrink: 0,
      border: '1px solid rgba(0,0,0,.1)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--ink-700)',
      fontWeight: 500
    }
  }, ROLE_LABELS[role] || role, "\xA0", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink-900)'
    }
  }, val.toFixed(1), "%"))))));
};

// ── SPECIES GUIDE — guía de especie al inicio del constructor ──
const SpeciesGuide = ({
  sKey,
  sp,
  recipe,
  onAddIngredient,
  onRemoveIngredient
}) => {
  const [open, setOpen] = useState(false);
  const [showCompat, setShowCompat] = useState(false);
  if (!sp || !sKey) return null;
  const guia = SPP_SUBSTRATE_GUIDE[sKey] || [];
  const diff = SPP_DIFFICULTY[sKey] || 'Media';
  const band = BANDS[sKey] || 'var(--ink-700)';
  const recipeIds = new Set((recipe || []).map(r => r.id));
  const num = String(Object.keys(SPP).indexOf(sKey) + 1).padStart(2, '0');
  const code = SPP_CODE[sKey] || '—';
  const family = SPP_FAMILY[sKey] || '';
  const img = IMG[sKey];
  const recIng = INGS.filter(i => i.cs && i.cs.includes(sKey) && i.cn > 0);
  const bycat = {};
  recIng.forEach(i => {
    const roleKey = ['aditivo_ph', 'aditivo_estructura', 'aditivo_micronutriente', 'aditivo_arrancador'].includes(i.role) ? 'aditivo_correctores' : i.role;
    if (!bycat[roleKey]) bycat[roleKey] = [];
    bycat[roleKey].push(i);
  });
  const catOrder = ['base_carbono', 'suplemento_n', 'suplemento_medio', 'aireador', 'aditivo_correctores'];
  const catLabels2 = {
    base_carbono: 'Carbono',
    suplemento_n: 'N alto',
    suplemento_medio: 'N medio',
    aireador: 'Aireación',
    aditivo_correctores: 'Correctores'
  };
  const catEntries = catOrder.filter(k => bycat[k]).map(k => [k, bycat[k]]);
  if (!open) return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 54,
      zIndex: 20,
      marginBottom: 12,
      borderRadius: 5,
      border: `1px solid color-mix(in oklab,${band} 30%,rgba(26,20,16,0.11))`,
      background: `color-mix(in oklab,${band} 5%,var(--paper-50))`,
      boxShadow: '0 1px 4px rgba(26,20,16,0.07)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px'
    },
    onClick: () => setOpen(true),
    title: "Ver gu\xEDa de especie"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 4,
      borderRadius: 2,
      background: band,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)'
    }
  }, "Gu\xEDa de especie"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: band,
      opacity: .8
    }
  }, "ver \u25BC")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: "var(--text-md)",
      color: `color-mix(in oklab,${band} 85%,var(--ink-900))`
    }
  }, sp.name));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 54,
      zIndex: 20,
      marginBottom: 12,
      borderRadius: 5,
      border: '1px solid rgba(26,20,16,0.11)',
      boxShadow: '0 1px 6px rgba(26,20,16,0.08)',
      background: 'var(--paper-50)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-family-strip",
    style: {
      background: `color-mix(in oklab,${band} 10%,var(--paper-100))`,
      borderRight: `1px solid color-mix(in oklab,${band} 25%,transparent)`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: band
    }
  }, family)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 15
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-arch-head",
    style: {
      marginLeft: 0,
      cursor: 'pointer'
    },
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-arch-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-arch-num",
    style: {
      color: band
    }
  }, num), /*#__PURE__*/React.createElement("span", {
    className: "p-arch-code"
  }, code)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: band,
      opacity: .7
    }
  }, "Gu\xEDa de especie"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-400)'
    }
  }, "\u25B2"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      borderBottom: '1px solid rgba(26,20,16,0.07)',
      overflow: 'hidden',
      minHeight: img ? 140 : 70
    }
  }, img && /*#__PURE__*/React.createElement("img", {
    src: img,
    alt: sp.name,
    style: {
      position: 'absolute',
      right: -10,
      top: '50%',
      transform: 'translateY(-50%)',
      height: '160%',
      width: 'auto',
      maxWidth: '55%',
      objectFit: 'contain',
      objectPosition: 'right center',
      filter: 'saturate(.45) contrast(1.08)',
      mixBlendMode: 'multiply',
      opacity: .55,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 16px',
      position: 'relative',
      zIndex: 1,
      maxWidth: img ? '60%' : '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sci)',
      fontSize: "var(--text-sm)",
      fontStyle: 'italic',
      color: 'var(--ink-400)',
      marginBottom: 3,
      letterSpacing: 'var(--tracking-label)'
    }
  }, sp.scientific), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      color: `color-mix(in oklab,${band} 90%,var(--ink-900))`,
      lineHeight: .9,
      letterSpacing: 'var(--tracking-tight)',
      marginBottom: open ? 8 : 0
    }
  }, sp.name), open && sp.notes && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: "var(--text-sm)",
      color: 'var(--ink-600)',
      lineHeight: 1.5,
      textWrap: 'pretty',
      marginTop: 5,
      maxWidth: 300
    }
  }, sp.notes))), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "p-chips",
    style: {
      marginLeft: 0,
      paddingTop: 0,
      borderTop: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-chips-row",
    style: {
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      borderBottom: '1px solid rgba(26,20,16,0.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "C:N"), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, sp.cn_optimal.min, "\u2013", sp.cn_optimal.max))), /*#__PURE__*/React.createElement("div", {
    className: "p-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "N%"), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, sp.n_optimal.min, "\u2013", sp.n_optimal.max))), /*#__PURE__*/React.createElement("div", {
    className: "p-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "pH"), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, sp.ph_optimal.min, "\u2013", sp.ph_optimal.max))), /*#__PURE__*/React.createElement("div", {
    className: "p-chip",
    style: {
      borderRight: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "Humedad"), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, sp.moisture.ideal, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "p-chips-row",
    style: {
      gridTemplateColumns: '1fr 1fr 1fr 1fr'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "Temp."), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, sp.temp_fruit))), /*#__PURE__*/React.createElement("div", {
    className: "p-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "EB"), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, sp.eb_baseline, "\u2013", sp.eb_optimal, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "p-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "Dificultad"), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, diff))), /*#__PURE__*/React.createElement("div", {
    className: "p-chip",
    style: {
      borderRight: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "p-chip-lbl"
  }, "Spawn"), /*#__PURE__*/React.createElement("span", {
    className: "p-chip-val"
  }, sp.spawn_rate, "%"))))), guia.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sguide-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sguide-section-lbl"
  }, "Criterios de formulaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    className: "sguide-hechos"
  }, guia.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "sguide-hecho"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sguide-hecho-n"
  }, i + 1, "."), /*#__PURE__*/React.createElement("span", {
    className: "sguide-hecho-txt"
  }, h))))))));
};

// ── v3: SpeciesRecommender — ranks all species for current recipe ──
const SpeciesRecommender = ({
  recipe
}) => {
  if (!recipe || !recipe.length) return null;
  const scores = Object.entries(SPP).map(([key, sp]) => {
    const a = analyze(recipe, key);
    return {
      key,
      sp,
      score: a ? scoreAn(a).score : 0,
      eb: a ? a.eb : 0
    };
  }).sort((a, b) => b.score - a.score);
  const maxScore = scores[0]?.score || 1;
  const bandColors = Object.fromEntries(Object.entries(BANDS));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      background: 'var(--paper-100)',
      border: '1px solid var(--border-soft)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 10
    }
  }, "Compatibilidad por especie"), scores.map(({
    key,
    sp,
    score,
    eb
  }, i) => {
    const col = bandColors[key] || 'var(--ink-2)';
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: "spr-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spr-rank"
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 10,
        height: 10,
        background: col,
        borderRadius: '50%',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        color: 'var(--ink-900)'
      }
    }, sp.name), /*#__PURE__*/React.createElement("div", {
      className: "spr-bar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spr-fill",
      style: {
        width: `${maxScore > 0 ? score / maxScore * 100 : 0}%`,
        background: col
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "spr-score",
      style: {
        color: i === 0 ? col : 'var(--ink-900)'
      }
    }, score), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: 'var(--border-soft)',
        minWidth: 48,
        textAlign: 'right'
      }
    }, "EB ", eb.toFixed(0), "%"));
  }));
};

// ── v13: Perfiles de optimización ──
const OPT_PROFILES = {
  rescate: {
    label: 'Rescate',
    maxSupp: 8,
    maxCafe: 8,
    forceLowRisk: true,
    preferTreatment: ['autoclave', 'thermal'],
    spawnOverride: 20,
    description: 'Spón viejo, sustrato dudoso o primera prueba. Minimiza contaminación.',
    color: 'var(--accent-blue-grey)'
  },
  produccion: {
    label: 'Producción',
    maxSupp: null,
    maxCafe: 15,
    forceLowRisk: true,
    preferTreatment: ['thermal', 'autoclave'],
    spawnOverride: null,
    description: 'Balance entre rendimiento, costo y estabilidad.',
    color: 'var(--accent-olive)'
  },
  premium: {
    label: 'Premium',
    maxSupp: null,
    maxCafe: 20,
    forceLowRisk: false,
    preferTreatment: ['autoclave'],
    spawnOverride: null,
    description: 'Maximiza EB y calidad. Acepta más costo y autoclave.',
    color: 'var(--coral-500)'
  }
};

// ── v13: Auto-Optimizer logic — multiobjetivo + perfiles + 2 bases + yeso + stock kg ──
const runAutoOptimizer = (targetKey, invLotes, maxCost, effectiveINGS, useStock = true, profileKey = 'produccion', stockMap = {}) => {
  const sp = SPP[targetKey];
  if (!sp) return {
    results: [],
    noStock: false
  };
  const profile = OPT_PROFILES[profileKey] || OPT_PROFILES.produccion;
  const stockIds = new Set(invLotes.filter(l => l.activo && l.cantidadKgDisponible > 0).map(l => l.ingredienteId));
  const hasStock = stockIds.size > 0;
  if (useStock && !hasStock) return {
    results: [],
    noStock: true
  };
  const pool = useStock ? effectiveINGS.filter(g => stockIds.has(g.id)) : effectiveINGS.filter(g => g.cs.includes(targetKey));
  const bases = pool.filter(g => g.role === 'base_carbono' && g.cs.includes(targetKey) && g.cn > 0 && g.n > 0);
  const supps = pool.filter(g => (g.role === 'suplemento_n' || g.role === 'suplemento_medio') && g.cs.includes(targetKey) && g.cn > 0 && g.n > 0);
  const aers = pool.filter(g => g.role === 'aireador');
  // Cal y yeso: siempre disponibles como aditivos de ajuste, incluso fuera de bodega
  const calAvail = effectiveINGS.some(g => g.id === 'carbonato_calcio');
  const yesoAvail = effectiveINGS.some(g => g.id === 'yeso');
  // suppLimit: en modo stock usamos el máximo de la especie sin restricción de perfil rescate
  // (rescate limita a 8% lo que elimina casi todas las combinaciones válidas)
  const suppLimit = profile.maxSupp != null ? Math.min(sp.supplementation_max || 20, profile.maxSupp) : sp.supplementation_max || 20;
  const cafeLimit = profile.maxCafe != null ? profile.maxCafe : 30;
  const results = [];
  const tried = new Set();

  // Costo real de bodega (precio ponderado FIFO, precioPonderado) en vez del
  // costo de catálogo — mismo ajuste que ya se muestra en el Perito
  // (realCostPerKg). Antes runAutoOptimizer siempre rankeaba con g.cost de
  // catálogo aunque estuviera generando "solo bodega": dos ingredientes del
  // mismo rol con costo de compra distinto en la bodega real puntuaban igual
  // aquí, y el ranking de "mejores recetas" podía no coincidir con el costo
  // real que se ve en el Perito al cargar esa misma receta.
  const realCostFor = rec => {
    let known = false;
    const total = rec.reduce((s, r) => {
      const pp = precioPonderado(r.id, invLotes);
      const g = effectiveINGS.find(i => i.id === r.id);
      if (pp != null) known = true;
      const price = pp != null ? pp : g ? g.cost : 0;
      return s + price * (parseFloat(r.p) || 0) / 100;
    }, 0);
    return known ? Math.round(total) : null;
  };
  const evalRec = rec => {
    const an0 = analyze(rec, targetKey, effectiveINGS);
    if (!an0) return;
    const realCost = useStock ? realCostFor(rec) : null;
    const an = realCost != null ? {
      ...an0,
      cost: realCost
    } : an0;
    const suppOverLimit = an.suppP > suppLimit;
    if (suppOverLimit && profileKey === 'rescate') return;
    if (an.cafeP > cafeLimit) return;
    if (maxCost > 0 && an.cost > maxCost) return;
    const tr = calcTreatment(an, targetKey);
    // ── Score: misma fuente que el Perito (scoreAn → scoring.js) — ver
    // generateOptimizer. Antes esta función tenía su propia combinación de
    // pesos (0.28/0.22/0.18/0.14/0.10/0.08 + un suppPenalty aplicado por
    // fuera de la fórmula), distinta de la del Perito, así que la receta #1
    // del Optimizador podía puntuar distinto al cargarla en el Constructor.
    // No se pasa `profile`: scoreTreatment lo ignora deliberadamente (ver
    // scoring.js) para que el score no dependa de si el llamador se acuerda
    // de pasarlo — eso fue justo lo que causó una divergencia real de 3
    // puntos entre esta función y generateOptimizer durante la migración.
    // stockIds solo aplica en modo bodega — en "paleta completa" el pool ya ignora
    // el inventario, así que scoreStock no debe penalizar cobertura que nunca se buscó.
    const {
      score: resultScore,
      breakdown
    } = scoreAn(an, {
      treatment: tr,
      recipe: rec,
      stockIds: useStock ? stockIds : undefined
    });
    const maxKgWet = Object.keys(stockMap).length > 0 ? calcMaxBatchFromStock(rec, stockMap, 10, sp.moisture?.ideal || 65, effectiveINGS) : null;
    results.push({
      recipe: rec,
      an,
      score: resultScore,
      riskScore: breakdown.risk,
      treatmentName: tr?.name || '',
      maxKgWet,
      suppOverLimit,
      realCostKnown: realCost != null
    });
  };
  const aerOpts = [null, ...aers.slice(0, 2)];
  const calOpts = calAvail ? [0, 3] : [0];
  const yesoOpts = yesoAvail ? [0, 2] : [0];

  // ── MODO 1: 1 base + 1 suplemento ──
  bases.forEach(base => {
    supps.forEach(supp => {
      if (base.id === supp.id) return;
      aerOpts.forEach(aer => {
        calOpts.forEach(calP => {
          yesoOpts.forEach(yesoP => {
            const aerP = aer ? 10 : 0;
            const fixedPct = calP + yesoP + aerP;
            const remaining = 100 - fixedPct;
            if (remaining < 40) return;
            const key = `1b1s|${base.id}|${supp.id}|${aer?.id || ''}|${calP}|${yesoP}`;
            if (tried.has(key)) return;
            tried.add(key);
            const T = sp.cn_optimal.ideal;
            const bDry1 = 1 - Math.min(0.92, Math.max(0, (base.moisture || 0) / 100));
            const sDry1 = 1 - Math.min(0.92, Math.max(0, (supp.moisture || 0) / 100));
            const bCe1 = base.c * bDry1,
              bNe1 = base.n * bDry1,
              sCe1 = supp.c * sDry1,
              sNe1 = supp.n * sDry1;
            const denom = bCe1 - sCe1 - T * (bNe1 - sNe1);
            if (Math.abs(denom) < 0.001) return;
            const ps = remaining * (bCe1 - T * bNe1) / denom;
            const pb = remaining - ps;
            if (ps < 2 || pb < 15 || ps > 40 || pb > 95) return;
            const rec = [{
              id: base.id,
              p: Math.round(pb * 10) / 10
            }, {
              id: supp.id,
              p: Math.round(ps * 10) / 10
            }];
            if (calP > 0) rec.push({
              id: 'carbonato_calcio',
              p: calP
            });
            if (yesoP > 0) rec.push({
              id: 'yeso',
              p: yesoP
            });
            if (aer) rec.push({
              id: aer.id,
              p: aerP
            });
            evalRec(rec);
          });
        });
      });
    });
  });

  // ── MODO 2: 2 bases + 1 suplemento ──
  for (let bi = 0; bi < bases.length; bi++) {
    for (let bj = bi + 1; bj < bases.length; bj++) {
      const b1 = bases[bi],
        b2 = bases[bj];
      supps.forEach(supp => {
        if (b1.id === supp.id || b2.id === supp.id) return;
        aerOpts.forEach(aer => {
          const aerP = aer ? 10 : 0,
            calP = calAvail ? 3 : 0,
            yesoP = yesoAvail ? 2 : 0;
          const fixedPct = calP + yesoP + aerP;
          const remaining = 100 - fixedPct;
          if (remaining < 40) return;
          [[0.5, 0.5], [0.6, 0.4], [0.4, 0.6]].forEach(([f1, f2]) => {
            const key = `2b1s|${b1.id}|${b2.id}|${supp.id}|${aer?.id || ''}|${f1}`;
            if (tried.has(key)) return;
            tried.add(key);
            const b1Dry2 = 1 - Math.min(0.92, Math.max(0, (b1.moisture || 0) / 100));
            const b2Dry2 = 1 - Math.min(0.92, Math.max(0, (b2.moisture || 0) / 100));
            const sDry2 = 1 - Math.min(0.92, Math.max(0, (supp.moisture || 0) / 100));
            const cBlend = b1.c * b1Dry2 * f1 + b2.c * b2Dry2 * f2,
              nBlend = b1.n * b1Dry2 * f1 + b2.n * b2Dry2 * f2;
            const sCe2 = supp.c * sDry2,
              sNe2 = supp.n * sDry2,
              T = sp.cn_optimal.ideal;
            const denom = cBlend - sCe2 - T * (nBlend - sNe2);
            if (Math.abs(denom) < 0.001) return;
            const ps = remaining * (cBlend - T * nBlend) / denom;
            const pb = remaining - ps;
            if (ps < 2 || pb < 15 || ps > 40 || pb > 95) return;
            const rec = [{
              id: b1.id,
              p: Math.round(pb * f1 * 10) / 10
            }, {
              id: b2.id,
              p: Math.round(pb * f2 * 10) / 10
            }, {
              id: supp.id,
              p: Math.round(ps * 10) / 10
            }];
            if (calP > 0) rec.push({
              id: 'carbonato_calcio',
              p: calP
            });
            if (yesoP > 0) rec.push({
              id: 'yeso',
              p: yesoP
            });
            if (aer) rec.push({
              id: aer.id,
              p: aerP
            });
            evalRec(rec);
          });
        });
      });
    }
  }

  // ── MODO 3: 1 base + 2 suplementos ──
  const suppSplits = [[0.6, 0.4], [0.5, 0.5]];
  bases.forEach(base => {
    for (let i = 0; i < supps.length; i++) {
      for (let j = i + 1; j < supps.length; j++) {
        const s1 = supps[i],
          s2 = supps[j];
        if (base.id === s1.id || base.id === s2.id) continue;
        aerOpts.forEach(aer => {
          const aerP = aer ? 10 : 0;
          const calP = calAvail ? 3 : 0;
          const yesoP = yesoAvail ? 2 : 0;
          const fixedPct = calP + yesoP + aerP;
          const remaining = 100 - fixedPct;
          if (remaining < 35) return;
          suppSplits.forEach(([f1, f2]) => {
            const key = `1b2s|${base.id}|${s1.id}|${s2.id}|${aer?.id || ''}|${f1}`;
            if (tried.has(key)) return;
            tried.add(key);
            const bDry3 = 1 - Math.min(0.92, Math.max(0, (base.moisture || 0) / 100));
            const s1Dry3 = 1 - Math.min(0.92, Math.max(0, (s1.moisture || 0) / 100));
            const s2Dry3 = 1 - Math.min(0.92, Math.max(0, (s2.moisture || 0) / 100));
            const cBlend = s1.c * s1Dry3 * f1 + s2.c * s2Dry3 * f2;
            const nBlend = s1.n * s1Dry3 * f1 + s2.n * s2Dry3 * f2;
            const T = sp.cn_optimal.ideal;
            const cb = base.c * bDry3,
              nb = base.n * bDry3;
            const denom = cb - cBlend - T * (nb - nBlend);
            if (Math.abs(denom) < 0.001) return;
            const psTotal = remaining * (cb - T * nb) / denom;
            const pb = remaining - psTotal;
            if (psTotal < 4 || psTotal > suppLimit || pb < 20 || pb > 85) return;
            const ps1 = Math.round(psTotal * f1 * 10) / 10;
            const ps2 = Math.round(psTotal * f2 * 10) / 10;
            const rec = [{
              id: base.id,
              p: Math.round(pb * 10) / 10
            }, {
              id: s1.id,
              p: ps1
            }, {
              id: s2.id,
              p: ps2
            }];
            if (calP > 0) rec.push({
              id: 'carbonato_calcio',
              p: calP
            });
            if (yesoP > 0) rec.push({
              id: 'yeso',
              p: yesoP
            });
            if (aer) rec.push({
              id: aer.id,
              p: aerP
            });
            evalRec(rec);
          });
        });
      }
    }
  });

  // forceLowRisk: aplicar solo si quedan resultados tras el filtro —
  // si el inventario no tiene opciones de bajo riesgo, mostrar lo mejor disponible
  const filteredResults = profile.forceLowRisk ? (() => {
    const hi = results.filter(r => r.riskScore >= 30);
    return hi.length > 0 ? hi : results;
  })() : results;
  const seen = new Set();
  const top = filteredResults.sort((a, b) => b.score - a.score).filter(r => {
    const k = `${r.score}_${Math.round(r.an.cn)}_${Math.round(r.an.cost / 100)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 12);
  const diag = {
    stockIds: stockIds.size,
    poolSize: pool.length,
    bases: bases.length,
    supps: supps.length,
    aers: aers.length,
    tried: tried.size,
    resultsRaw: results.length,
    suppLimit,
    profileKey,
    targetKey,
    baseNames: bases.map(g => g.name),
    suppNames: supps.map(g => g.name)
  };
  return {
    results: top,
    noStock: false,
    stockCount: stockIds.size,
    diag
  };
};

// ── PERITO: componente estable a nivel módulo (no redefinido en cada render) ──
const PERITO_STATUS = {
  excellent: {
    label: 'Apta',
    veredicto: 'Apta',
    accion: 'Producir normalmente.',
    bg: '#EDF4E8',
    border: '#7FA05A',
    badge: 'var(--accent-olive)',
    txt: '#3D4A38'
  },
  good: {
    label: 'Apta con ajustes',
    veredicto: 'Apta con ajustes',
    accion: 'Aplicar las mejoras del Perito antes de escalar.',
    bg: '#F5F0E0',
    border: '#C8A840',
    badge: '#7A5A10',
    txt: '#5A4010'
  },
  needs_work: {
    label: 'Experimental',
    veredicto: 'Experimental',
    accion: 'Máximo 3–5 bolsas de prueba. Registrar colonización al día 7, 14 y 21.',
    bg: '#FBF0E8',
    border: '#C87040',
    badge: '#8C4020',
    txt: '#6A3010'
  },
  critical: {
    label: 'No ejecutar',
    veredicto: 'No ejecutar — Riesgo alto',
    accion: 'Corregir problemas críticos antes de cualquier producción.',
    bg: '#FBE8E8',
    border: '#C53030',
    badge: '#8B1A1A',
    txt: '#6A0000'
  },
  sin_receta: {
    label: '—',
    veredicto: '—',
    accion: '',
    bg: 'var(--paper-50)',
    border: 'var(--border-soft)',
    badge: 'var(--ink-500)',
    txt: 'var(--ink-500)'
  }
};
const peritoMainLimiter = (opt, an) => {
  if (!opt || !an) return null;
  const first = opt.items.find(i => i.priority === 'critical') || opt.items.find(i => i.priority === 'warning');
  if (!first) return null;
  const MAP = {
    '↓C:N': 'C:N demasiado alto — exceso de carbono sin aprovechar',
    '↑C:N': 'C:N demasiado bajo — exceso de nitrógeno, riesgo contaminación',
    '↑N': 'Nitrógeno insuficiente — colonización lenta y EB reducida',
    '↓N': 'Exceso de nitrógeno — riesgo Trichoderma',
    '⚠': 'Carga sanitaria crítica — Trichoderma probable sin autoclave',
    '↑pH': 'pH demasiado ácido — enzimas del micelio trabajan a rendimiento parcial',
    '↓pH': 'pH demasiado alcalino — inhibe el crecimiento y favorece bacterias',
    '↑EB': 'Potencial de EB sin explotar',
    'Ca': 'Sin mineral estabilizador de pH',
    'Dig': 'Sustrato de baja digestibilidad — colonización lenta'
  };
  return MAP[first.icon] || first.label;
};
const peritoCorreccionMinima = opt => {
  const first = opt && opt.items.find(i => i.priority === 'critical' && i.apply);
  if (!first) return null;
  return first.action.replace(/<[^>]+>/g, '');
};
const PeritoItem = React.memo(({
  item,
  onApply,
  baseScore
}) => {
  const hasPrediction = item.predictedScore != null && baseScore != null;
  const scoreDelta = hasPrediction ? Math.round(item.predictedScore - baseScore) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: `perito-item pi-${item.priority}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "pi-icon-col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pi-icon"
  }, item.icon)), /*#__PURE__*/React.createElement("div", {
    className: "pi-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pi-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pi-label"
  }, item.label), item.capped && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      fontWeight: 700,
      color: '#8C4020',
      background: 'rgba(200,112,64,.12)',
      border: '1px solid rgba(200,112,64,.3)',
      borderRadius: 3,
      padding: '1px 6px'
    }
  }, "tope alcanzado"), item.notInStock && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      fontWeight: 700,
      color: '#7A5A10',
      background: 'rgba(160,120,40,.12)',
      border: '1px solid rgba(160,120,40,.3)',
      borderRadius: 3,
      padding: '1px 6px'
    }
  }, "\uD83D\uDED2 no en bodega \u2014 a comprar"), item.delta && /*#__PURE__*/React.createElement("span", {
    className: "pi-delta"
  }, item.delta)), item.repeatedApply && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: '#7A5A10',
      fontFamily: 'var(--font-mono)',
      marginBottom: 2
    }
  }, "\u21BB Ya aplicaste esto ", item.repeatedApply, "x en esta sesi\xF3n y el problema sigue \u2014 considera un ingrediente distinto o cambia a \"Todo el cat\xE1logo\"."), /*#__PURE__*/React.createElement("div", {
    className: "pi-action",
    dangerouslySetInnerHTML: {
      __html: item.action
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "pi-effect"
  }, item.effect), item.why && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: 'var(--ink-600)',
      fontFamily: 'var(--font-mono)',
      marginTop: 3,
      opacity: .85
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "Por qu\xE9:"), " ", item.why), item.riskIfIgnored && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: 'var(--coral-600,#B5451F)',
      fontFamily: 'var(--font-mono)',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "Riesgo:"), " ", item.riskIfIgnored), hasPrediction && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: scoreDelta > 0 ? 'var(--accent-olive)' : 'var(--ink-600)',
      fontFamily: 'var(--font-mono)',
      marginTop: 2,
      fontWeight: 700
    }
  }, "Score si se aplica: ", Math.round(item.predictedScore), "/100 (", scoreDelta >= 0 ? '+' : '', scoreDelta, ")"), item.sideEffect && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: 'var(--coral-600,#B5451F)',
      fontFamily: 'var(--font-mono)',
      marginTop: 2,
      fontWeight: 700
    }
  }, "\u26A0 ", item.sideEffect), item.comboApply && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      padding: '6px 8px',
      background: 'rgba(74,107,74,.08)',
      border: '1px solid rgba(74,107,74,.2)',
      borderRadius: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: 'var(--accent-olive)',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700
    }
  }, item.comboLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: 'var(--accent-olive)',
      fontFamily: 'var(--font-mono)'
    }
  }, "Score si se aplica junto: ", Math.round(item.comboPredictedScore), "/100"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onApply(item.comboApply, item.icon),
    className: "pi-apply",
    style: {
      marginTop: 4
    }
  }, "Aplicar correcci\xF3n combinada"))), /*#__PURE__*/React.createElement("div", {
    className: "pi-actions"
  }, item.apply ? /*#__PURE__*/React.createElement("button", {
    onClick: () => onApply(item.apply, item.icon),
    className: "pi-apply"
  }, "Aplicar") : /*#__PURE__*/React.createElement("div", {
    className: "pi-spacer"
  })));
});

// ── Modales genéricos: reemplazan window.confirm/prompt/alert en el flujo de recetas ──
const ConfirmModal = ({
  dlg,
  onClose
}) => /*#__PURE__*/React.createElement("div", {
  className: "inv-modal-bg",
  onClick: e => {
    if (e.target === e.currentTarget) onClose();
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "inv-modal",
  style: {
    width: 420
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "inv-modal-title"
}, dlg.title || 'Confirmar'), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'var(--font-mono)',
    fontSize: "var(--text-sm)",
    color: 'var(--ink-700)',
    marginBottom: 18,
    lineHeight: 1.5
  }
}, dlg.msg), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end'
  }
}, /*#__PURE__*/React.createElement("button", {
  onClick: onClose,
  className: "inv-btn inv-btn-sec"
}, "Cancelar"), /*#__PURE__*/React.createElement("button", {
  onClick: () => {
    dlg.onConfirm();
    onClose();
  },
  className: `inv-btn ${dlg.danger ? 'inv-btn-danger' : 'inv-btn-pri'}`
}, dlg.confirmLabel || 'Confirmar'))));
const PromptModal = ({
  dlg,
  onClose
}) => {
  const [val, setVal] = React.useState(dlg.defaultValue || '');
  const submit = () => {
    if (!val.trim()) return;
    dlg.onSubmit(val.trim());
    onClose();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-bg",
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal",
    style: {
      width: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-title"
  }, dlg.title || 'Nombre'), dlg.label && /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, dlg.label), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    autoFocus: true,
    value: val,
    placeholder: dlg.placeholder || '',
    onChange: e => setVal(e.target.value),
    onKeyDown: e => e.key === 'Enter' && submit(),
    style: {
      marginBottom: 18
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "inv-btn inv-btn-sec"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: !val.trim(),
    className: "inv-btn inv-btn-pri"
  }, dlg.confirmLabel || 'Guardar'))));
};
const NoticeModal = ({
  dlg,
  onClose
}) => /*#__PURE__*/React.createElement("div", {
  className: "inv-modal-bg",
  onClick: e => {
    if (e.target === e.currentTarget) onClose();
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "inv-modal",
  style: {
    width: 420
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "inv-modal-title"
}, dlg.title || 'Aviso'), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'var(--font-mono)',
    fontSize: "var(--text-sm)",
    color: 'var(--ink-700)',
    marginBottom: 18,
    lineHeight: 1.5
  }
}, dlg.msg), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}, /*#__PURE__*/React.createElement("button", {
  onClick: onClose,
  className: "inv-btn inv-btn-pri"
}, "Aceptar"))));

// ── NOVEL SIGNATURE VISUAL — inked "barómetro" of biological efficiency ──
// ── COLOR MAP for ingredient category badges ──
const CAT_COLORS = {
  base: '#5A7042',
  // moss (base carbons)
  sup: '#C68F2C',
  // ochre (supplements)
  est: '#8C6B4A',
  // bark (manure)
  cafe: '#4A3728',
  // dark brown (coffee)
  trop: '#B8694B',
  // warm brown (tropical)
  circ: '#6B7C5F',
  // sage (circular)
  local: '#7A5A3F',
  // tan (local),
  default: '#999'
};

// ── MICRO SVG ICONS (sin emojis) ──────────────────────────────
const IcoBlock = () => /*#__PURE__*/React.createElement("svg", {
  width: "11",
  height: "11",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "var(--accent-terracotta)",
  strokeWidth: "2",
  strokeLinecap: "round",
  style: {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 4,
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4.93",
  y1: "4.93",
  x2: "19.07",
  y2: "19.07"
}));
const IcoWarn = () => /*#__PURE__*/React.createElement("svg", {
  width: "11",
  height: "11",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "var(--status-attention)",
  strokeWidth: "2",
  strokeLinecap: "round",
  style: {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 4,
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "9",
  x2: "12",
  y2: "13"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "17",
  x2: "12.01",
  y2: "17"
}));
const IcoBox = ({
  color = 'currentColor'
}) => /*#__PURE__*/React.createElement("svg", {
  width: "13",
  height: "13",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: "1.5",
  strokeLinecap: "round",
  style: {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "3.27 6.96 12 12.01 20.73 6.96"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "22.08",
  x2: "12",
  y2: "12"
}));
const IcoCheck = () => /*#__PURE__*/React.createElement("svg", {
  width: "6",
  height: "6",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round",
  style: {
    maxWidth: '70%',
    maxHeight: '70%'
  }
}, /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
const IcoPlus = () => /*#__PURE__*/React.createElement("svg", {
  width: "6",
  height: "6",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round",
  style: {
    maxWidth: '70%',
    maxHeight: '70%'
  }
}, /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "5",
  x2: "12",
  y2: "19"
}), /*#__PURE__*/React.createElement("line", {
  x1: "5",
  y1: "12",
  x2: "19",
  y2: "12"
}));
const parseIngName = name => {
  const hasBlock = name.includes('⛔');
  const hasWarn = name.includes('⚠️') || name.includes('⚠');
  const clean = name.replace(/⛔\s*/g, '').replace(/⚠️\s*/g, '').replace(/⚠\s*/g, '').trim();
  return {
    hasBlock,
    hasWarn,
    clean
  };
};

// ── INGREDIENT ITEM with expandable profile ──
const IngredientItem = ({
  ing,
  onAdd,
  stockKg = 0
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const cat = CAT_COLORS[ing.cat] || CAT_COLORS.default;
  const costStr = ing.cost === 0 ? 'Gratis' : `$${ing.cost}`;
  // Normalize scales for visual bars (0–1)
  const cnPct = Math.min(100, Math.max(0, ing.cn / 600 * 100)) / 100; // 0–600 → 0–1
  const nPct = Math.min(100, ing.n * 15) / 100; // 0–7% → 0–1
  const craPct = ing.cra / 5; // 0–5 → 0–1
  const digPct = ing.dig / 10; // 0–10 → 0–1
  return /*#__PURE__*/React.createElement("div", {
    className: 'ing-item ' + (expanded ? 'expanded' : ''),
    onClick: () => setExpanded(!expanded)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-badge",
    style: {
      background: cat
    },
    title: ing.cat
  }, ing.cat.substring(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "ing-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-name"
  }, (() => {
    const {
      hasBlock,
      hasWarn,
      clean
    } = parseIngName(ing.name);
    return /*#__PURE__*/React.createElement(React.Fragment, null, stockKg > 0 && /*#__PURE__*/React.createElement("span", {
      className: "ing-stock-dot",
      style: {
        background: stockKg > 5 ? 'var(--accent-olive)' : 'var(--ochre-500,#A07828)'
      }
    }), hasBlock && /*#__PURE__*/React.createElement(IcoBlock, null), hasWarn && /*#__PURE__*/React.createElement(IcoWarn, null), clean);
  })()), /*#__PURE__*/React.createElement("div", {
    className: "ing-meta"
  }, /*#__PURE__*/React.createElement("span", null, "C:N ", ing.cn), /*#__PURE__*/React.createElement("span", null, "N ", ing.n.toFixed(1), "%"), /*#__PURE__*/React.createElement("span", null, costStr), stockKg > 0 && /*#__PURE__*/React.createElement("span", {
    className: "ing-stock-kg"
  }, stockKg.toFixed(1), " kg")), expanded && /*#__PURE__*/React.createElement("div", {
    className: "ing-profile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Carbono"), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar-fill",
    style: {
      width: ing.c / 50 * 100 + '%',
      background: '#5A7042'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, ing.c, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Humedad"), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar-fill",
    style: {
      width: Math.min(100, ing.moisture) + '%',
      background: 'var(--accent-blue-grey)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, ing.moisture, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Ret. agua"), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar-fill",
    style: {
      width: ing.cra / 5 * 100 + '%',
      background: 'var(--accent-blue-grey)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, ing.cra, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "/5"))), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "pH"), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar-fill",
    style: {
      width: (ing.ph - 4) / 3 * 100 + '%',
      background: '#C68F2C'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, ing.ph)), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Dig."), /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ing-profile-bar-fill",
    style: {
      width: ing.dig / 10 * 100 + '%',
      background: '#B6532A'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, ing.dig, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "/10"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--paper-300)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "add-btn",
    onClick: e => {
      e.stopPropagation();
      onAdd(ing);
    }
  }, "Agregar a receta")))));
};
const EBDial = ({
  an,
  sp
}) => {
  if (!an || !sp || !an.cn) return null;
  const eb = Math.max(0, an.eb || 0);
  const base = sp.eb_baseline,
    opt = sp.eb_optimal;
  const maxV = Math.max(160, Math.ceil(opt * 1.2 / 10) * 10);
  const cx = 130,
    cy = 112,
    R = 90;
  const rad = d => d * Math.PI / 180;
  const ang = v => 135 + Math.min(Math.max(v, 0), maxV) / maxV * 270;
  const pt = (v, r) => [cx + r * Math.cos(rad(ang(v))), cy + r * Math.sin(rad(ang(v)))];
  const arc = (v0, v1, r) => {
    const [x0, y0] = pt(v0, r);
    const [x1, y1] = pt(v1, r);
    const large = ang(v1) - ang(v0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const status = eb < base ? 'low' : eb <= opt ? 'good' : 'high';
  const needleCol = status === 'low' ? 'var(--coral-500)' : status === 'high' ? '#3D4A38' : 'var(--accent-olive)';
  const stLabel = status === 'low' ? 'Por debajo del rango' : status === 'high' ? 'Excelente — sobre el óptimo' : 'Dentro del rango óptimo';
  const [nx, ny] = pt(eb, R - 8);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * maxV / 5) * 5);
  return /*#__PURE__*/React.createElement("div", {
    className: "ebdial"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 260 200",
    width: "100%",
    style: {
      maxWidth: 288
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: arc(0, maxV, R),
    fill: "none",
    stroke: "var(--paper-300)",
    strokeWidth: "10",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: arc(base, opt, R),
    fill: "none",
    stroke: "#9FB07F",
    strokeWidth: "10",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: arc(0, maxV, R + 9),
    fill: "none",
    stroke: "var(--ink-900)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: arc(0, maxV, R - 9),
    fill: "none",
    stroke: "var(--ink-900)",
    strokeWidth: "0.7",
    opacity: "0.45"
  }), ticks.map((tv, i) => {
    const [a0, b0] = pt(tv, R - 9);
    const [a1, b1] = pt(tv, R + 9);
    const [lx, ly] = pt(tv, R + 24);
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("line", {
      x1: a0,
      y1: b0,
      x2: a1,
      y2: b1,
      stroke: "var(--ink-700)",
      strokeWidth: "1.2"
    }), /*#__PURE__*/React.createElement("text", {
      x: lx,
      y: ly,
      textAnchor: "middle",
      dominantBaseline: "middle",
      fontFamily: "var(--font-mono)",
      fontSize: "9.5",
      fill: "var(--ink-500)"
    }, tv));
  }), /*#__PURE__*/React.createElement("line", {
    x1: cx,
    y1: cy,
    x2: nx,
    y2: ny,
    stroke: needleCol,
    strokeWidth: "3",
    strokeLinecap: "round",
    style: {
      transition: 'all .5s cubic-bezier(0.32,0.72,0.36,1)'
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: "7",
    fill: "var(--paper-50)",
    stroke: "var(--ink-900)",
    strokeWidth: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: "2.4",
    fill: "var(--ink-900)"
  }), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy + 36,
    textAnchor: "middle",
    fontFamily: "var(--font-num)",
    fontSize: "32",
    fill: "#9C3F1F"
  }, an.ebLow, "\u2013", an.ebHigh), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy + 52,
    textAnchor: "middle",
    fontFamily: "var(--font-mono)",
    fontSize: "10",
    fill: "var(--ink-400)"
  }, "% RANGO ESPERADO"), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy + 66,
    textAnchor: "middle",
    fontFamily: "var(--font-mono)",
    fontSize: "9",
    fill: "var(--ink-300)"
  }, "central ", eb.toFixed(0), "% \xB7 \xEDndice ", an.ebIndex, "/100")), /*#__PURE__*/React.createElement("div", {
    className: "ebdial-note"
  }, stLabel, " \xB7 franja \xF3ptima ", base, "\u2013", opt, "%"));
};

// ── BAND GAUGES ──────────────────────────────────────────────────────────────────────────
const BandGauge = ({
  label,
  unit,
  min,
  max,
  ideal,
  value,
  reference,
  scaleMin,
  scaleMax,
  color = 'var(--accent-olive)',
  warnColor = '#A8432A'
}) => {
  const sMin = scaleMin ?? min * 0.5;
  const sMax = scaleMax ?? max * 1.5;
  const range = sMax - sMin;
  const toPos = v => Math.max(0, Math.min(100, (v - sMin) / range * 100));
  const bandLeft = toPos(min);
  const bandW = toPos(max) - bandLeft;
  const idealPos = toPos(ideal);
  const valPos = value != null ? toPos(value) : null;
  const inRange = value != null && value >= min && value <= max;
  const cursorCol = inRange ? color : warnColor;
  const fmtVal = v => typeof v === 'number' ? v < 10 ? v.toFixed(2) : v.toFixed(1) : '—';
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bg-label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "bg-val",
    style: {
      color: cursorCol
    }
  }, fmtVal(value), unit)), /*#__PURE__*/React.createElement("div", {
    className: "bg-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-band",
    style: {
      left: `${bandLeft}%`,
      width: `${bandW}%`,
      background: `${color}28`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "bg-ideal",
    style: {
      left: `${idealPos}%`,
      background: `${color}66`
    }
  }), reference != null && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${toPos(reference)}%`,
      top: 0,
      bottom: 0,
      width: '1.5px',
      background: 'rgba(191,169,139,0.7)',
      borderLeft: '1.5px dashed rgba(191,169,139,0.8)',
      pointerEvents: 'none'
    },
    title: `Referencia óptima: ${reference}${unit}`
  }), valPos != null && /*#__PURE__*/React.createElement("div", {
    className: "bg-cursor",
    style: {
      left: `${valPos}%`,
      background: cursorCol,
      boxShadow: `0 0 0 1.5px ${cursorCol}`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "bg-foot"
  }, /*#__PURE__*/React.createElement("span", null, min, unit), /*#__PURE__*/React.createElement("span", {
    style: {
      color: `${color}99`
    }
  }, "ideal ", ideal, unit), /*#__PURE__*/React.createElement("span", null, max, unit)));
};

// Mezcla el EB teórico de an.eb con el EB real promedio de lotes históricos
// de la misma especie (historicalEBFor), ponderado por cuántos lotes reales
// hay (historical.weight, hasta 70%). Antes esta fórmula solo vivía inline
// en RecipeGauges y solo pintaba el gauge — el score del Perito (scoreAn)
// seguía usando an.eb puro, ignorando por completo los lotes reales que el
// usuario ya tenía registrados. Se extrajo aquí para reusarla también como
// override de scoreYield (ver ctx.blendedEB en scoring.js).
const blendEBWithHistory = (an, historical) => {
  const hasHist = historical && historical.n > 0 && historical.avg != null;
  return hasHist ? an.eb * (1 - historical.weight) + historical.avg * historical.weight : an.eb;
};
const RecipeGauges = ({
  an,
  sp,
  optimalAn,
  historical
}) => {
  if (!sp || !an || !an.cn) return null;
  const hasHist = historical && historical.n > 0 && historical.avg != null;
  const blendedEB = blendEBWithHistory(an, historical);
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-eyebrow"
  }, "Par\xE1metros de sustrato"), /*#__PURE__*/React.createElement(BandGauge, {
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
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-700)',
      marginTop: -6,
      marginBottom: 8,
      paddingLeft: 2,
      fontWeight: 500
    }
  }, "Calculado en base seca \xB7 corrige H\u2082O por insumo"), /*#__PURE__*/React.createElement(BandGauge, {
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
  }), /*#__PURE__*/React.createElement(BandGauge, {
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
  }), an && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-700)',
      marginTop: -6,
      marginBottom: 8,
      paddingLeft: 2,
      fontWeight: 500
    }
  }, "Rango ", an.ebLow, "\u2013", an.ebHigh, "% \xB7 \xEDndice ", an.ebIndex, "/100 \xB7 la aguja es el valor central"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      padding: '8px 10px',
      borderRadius: 6,
      background: hasHist ? 'rgba(122,142,96,0.12)' : 'rgba(0,0,0,0.04)',
      border: '1px solid ' + (hasHist ? 'var(--accent-olive)' : 'var(--border-soft, #ddd)')
    }
  }, hasHist ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-800,#333)',
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("b", null, "Proyecci\xF3n ajustada con ", historical.n, " lote", historical.n > 1 ? 's' : '', " real", historical.n > 1 ? 'es' : '', historical.matched ? ' del mismo sustrato' : ''), " \xB7 EB hist\xF3rica ", historical.avg.toFixed(0), "% (", historical.subs.join(', '), ") \xB7 mezcla ", Math.round(historical.weight * 100), "% hist\xF3rico / ", Math.round((1 - historical.weight) * 100), "% f\xF3rmula") : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-700,#666)',
      lineHeight: 1.5
    }
  }, "Estimaci\xF3n te\xF3rica \u2014 sin lotes previos de ", sp.name, " en el registro para proyectar EB real.")));
};

// MobileQuickJump se retiró — los chips de .builder-subnav (Ingredientes/Receta/
// Score·Perito/Batch/Tratamiento) ya cubren la misma navegación con destinos
// explícitos, sin duplicar el patrón con un botón flotante ambiguo.

// ── v4: INVENTARIO helpers ──
// Duplicados a propósito respecto a inventario.js (mismo patrón que MASS_BALANCE_TOL
// en firebase/db.js): el bundler de este .dc.html (dc-runtime, ver support.js) ejecuta
// este archivo dentro de un `new Function(...)` propio y no engancha de forma confiable
// los globals de un <script src> añadido a mano, así que no puede depender en vivo de
// inventario.js. inventario.js + inventario.test.js son la fuente de verdad probada;
// si cambias la lógica aquí, cambia también inventario.js (y viceversa).
const stockActual = (ingredienteId, lotes) => lotes.filter(l => l.activo && l.ingredienteId === ingredienteId).reduce((s, l) => s + (l.cantidadKgDisponible || 0), 0);
const precioPonderado = (ingredienteId, lotes) => {
  const active = lotes.filter(l => l.activo && l.ingredienteId === ingredienteId && l.cantidadKgDisponible > 0);
  const totalKg = active.reduce((s, l) => s + l.cantidadKgDisponible, 0);
  if (!totalKg) return null;
  return active.reduce((s, l) => s + l.precioPorKgCOP * l.cantidadKgDisponible, 0) / totalKg;
};

// Descuenta inventario FIFO — misma lógica que SetasInventario.consumirInventarioFIFO
// en inventario.js (ver el comentario de arriba sobre por qué está duplicada).
const consumirInventarioFIFOLocal = (lotes, rows) => {
  let updated = [...lotes];
  for (const row of rows) {
    let remaining = row.krKg;
    const lotesIng = updated.filter(l => l.activo && l.ingredienteId === row.id).sort((a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso));
    for (const lote of lotesIng) {
      if (remaining <= 0.001) break;
      const consume = Math.min(lote.cantidadKgDisponible, remaining);
      updated = updated.map(l => l.id === lote.id ? {
        ...l,
        cantidadKgDisponible: Math.max(0, Math.round((l.cantidadKgDisponible - consume) * 1000) / 1000)
      } : l);
      remaining -= consume;
    }
  }
  return updated;
};
const SEED_PROVEEDORES = [{
  id: 'prov_paloquemao',
  nombre: 'Plaza de Paloquemao',
  tipo: 'plaza',
  municipio: 'Bogotá'
}, {
  id: 'prov_bavaria',
  nombre: 'Bavaria Tocancipá',
  tipo: 'industrial',
  municipio: 'Tocancipá'
}, {
  id: 'prov_elrosal',
  nombre: 'Agrícola El Rosal',
  tipo: 'directo',
  municipio: 'El Rosal'
}];
// Tres compras separadas: una por proveedor
const SEED_CID_PALO = 'compra_seed_palo';
const SEED_CID_ELROSAL = 'compra_seed_elrosal';
const SEED_CID_BAV = 'compra_seed_bav';
const SEED_LOTES = [{
  id: 'lote_s1',
  compraId: SEED_CID_PALO,
  ingredienteId: 'paja_trigo',
  cantidadKgTotal: 15,
  precioPorKgCOP: 1200,
  fechaIngreso: '2026-06-01',
  cantidadKgDisponible: 15,
  activo: true
}, {
  id: 'lote_s3',
  compraId: SEED_CID_PALO,
  ingredienteId: 'salvado_trigo',
  cantidadKgTotal: 5,
  precioPorKgCOP: 2100,
  fechaIngreso: '2026-06-01',
  cantidadKgDisponible: 5,
  activo: true
}, {
  id: 'lote_s2',
  compraId: SEED_CID_ELROSAL,
  ingredienteId: 'aserrin_roble',
  cantidadKgTotal: 8,
  precioPorKgCOP: 800,
  fechaIngreso: '2026-06-01',
  cantidadKgDisponible: 8,
  activo: true
}, {
  id: 'lote_s4',
  compraId: SEED_CID_BAV,
  ingredienteId: 'afrecho_cerveceria',
  cantidadKgTotal: 3,
  precioPorKgCOP: 500,
  fechaIngreso: '2026-06-01',
  cantidadKgDisponible: 3,
  activo: true
}];
const SEED_COMPRAS = [{
  id: SEED_CID_PALO,
  fecha: '2026-06-01',
  proveedorId: 'prov_paloquemao',
  items: [{
    ingredienteId: 'paja_trigo',
    kg: 15,
    precio: 1200
  }, {
    ingredienteId: 'salvado_trigo',
    kg: 5,
    precio: 2100
  }],
  fuenteCaptura: 'manual',
  revisadoManualmente: true
}, {
  id: SEED_CID_ELROSAL,
  fecha: '2026-06-01',
  proveedorId: 'prov_elrosal',
  items: [{
    ingredienteId: 'aserrin_roble',
    kg: 8,
    precio: 800
  }],
  fuenteCaptura: 'manual',
  revisadoManualmente: true
}, {
  id: SEED_CID_BAV,
  fecha: '2026-06-01',
  proveedorId: 'prov_bavaria',
  items: [{
    ingredienteId: 'afrecho_cerveceria',
    kg: 3,
    precio: 500
  }],
  fuenteCaptura: 'manual',
  revisadoManualmente: true
}];
const SEED_MOVIMIENTOS = SEED_LOTES.map((l, i) => ({
  id: `mov_seed_${i}`,
  loteId: l.id,
  ingredienteId: l.ingredienteId,
  tipo: 'entrada',
  cantidadKg: l.cantidadKgTotal,
  fecha: '2026-06-01',
  referencia: l.compraId
}));

// Alias de claves del shell (species.yaml / KB) -> claves internas del SPP del simulador.
const SPP_KEY_ALIAS = {
  pleurotus_ostreatus: 'p_ostreatus_gris',
  pleurotus_djamor: 'p_djamor_rosa',
  pleurotus_eryngii: 'p_eryngii',
  hericium_erinaceus: 'lions_mane',
  lentinula_edodes: 'shiitake',
  ganoderma_lucidum: 'reishi',
  flammulina_velutipes: 'enoki',
  pholiota_nameko: 'nameko'
};
const normSpp = k => {
  if (!k) return k;
  if (SPP[k]) return k;
  return SPP_KEY_ALIAS[k] || k;
};

// Nombres legibles de sustratos históricos (yields.sub del shell / batch_tracking.md)
const HIST_SUB_NAME = {
  wheat_straw: 'paja de trigo',
  coffee_shiitake: 'sustrato maestro shiitake',
  masters_mix: "master's mix"
};
// Mapa de códigos de sustrato histórico -> id real en INGS, para poder saber
// si la receta activa usa ese mismo sustrato. Solo cubre los códigos con
// correspondencia 1:1 clara — códigos como 'masters_mix' son una mezcla sin
// un ingrediente único al que mapear, así que se quedan sin match (no rompen
// nada, simplemente no participan en el filtro por similitud).
const HIST_SUB_TO_ING = {
  wheat_straw: 'paja_trigo'
};

// Proyección de EB real: agrega lotes históricos (yields del shell) por especie (y sustrato si coincide)
// para dar una EB proyectada distinta de la fórmula teórica C:N/N — "no solo texto estático".
// `recipe` (opcional): si se pasa y hay lotes históricos cuyo sustrato
// coincide con algún ingrediente de la receta activa, el promedio se calcula
// SOLO con esos lotes en vez de con todos los de la especie — antes un lote
// de "master's mix" y uno de "paja de trigo" pesaban igual en el promedio
// aunque la receta activa fuera puramente de paja de trigo. `matched:true`
// en el resultado indica que se usó este filtro más preciso.
const historicalEBFor = (sKey, historicalYields, recipe = null) => {
  if (!sKey || !Array.isArray(historicalYields) || !historicalYields.length) return {
    n: 0,
    avg: null,
    subs: [],
    weight: 0,
    matched: false
  };
  let rows = historicalYields.filter(y => normSpp(y.spp) === sKey && y.dryKg > 0);
  if (!rows.length) return {
    n: 0,
    avg: null,
    subs: [],
    weight: 0,
    matched: false
  };
  let matched = false;
  if (recipe && recipe.length) {
    const recipeIds = new Set(recipe.map(r => r.id));
    const matchedRows = rows.filter(y => HIST_SUB_TO_ING[y.sub] && recipeIds.has(HIST_SUB_TO_ING[y.sub]));
    if (matchedRows.length) {
      rows = matchedRows;
      matched = true;
    }
  }
  const ebs = rows.map(y => y.freshG / (y.dryKg * 1000) * 100);
  const avg = ebs.reduce((a, b) => a + b, 0) / ebs.length;
  const subs = [...new Set(rows.map(y => HIST_SUB_NAME[y.sub] || y.sub))];
  const weight = Math.min(0.7, 0.25 * rows.length);
  return {
    n: rows.length,
    avg,
    subs,
    weight,
    matched
  };
};
function App(props) {
  const [bridgeOpen, setBridgeOpen] = useState(true);
  // Oculta la barra fija de especie al bajar (deja más alto útil en mobile, donde
  // ya compite con el rail inferior) y la reaparece al subir o cerca del tope.
  const [bridgeHidden, setBridgeHidden] = useState(false);
  useEffect(() => {
    const scroller = document.querySelector('.app-main') || window;
    let lastY = scroller === window ? window.scrollY : scroller.scrollTop;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const y = scroller === window ? window.scrollY : scroller.scrollTop;
        const delta = y - lastY;
        if (y < 80) setBridgeHidden(false);else if (delta > 16) setBridgeHidden(true);else if (delta < -8) setBridgeHidden(false);
        lastY = y;
      });
    };
    scroller.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const [hasPickedSpecies, setHasPickedSpecies] = useState(() => {
    try {
      const p = normSpp(props.preselectSpecies);
      if (p && SPP[p]) return true;
      const pre = normSpp(localStorage.getItem('sim_preselect_spp'));
      if (pre && SPP[pre]) return true;
    } catch (e) {}
    return false;
  });
  const [sKey, setSKeyRaw] = useState(() => {
    try {
      const p = normSpp(props.preselectSpecies);
      if (p && SPP[p]) return p;
      const pre = normSpp(localStorage.getItem('sim_preselect_spp'));
      if (pre && SPP[pre]) {
        localStorage.removeItem('sim_preselect_spp');
        return pre;
      }
    } catch (e) {}
    return 'p_ostreatus_gris';
  });
  const setSKey = k => {
    setHasPickedSpecies(true);
    setSKeyRaw(k);
  };
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  useEffect(() => {
    if (!catalogModalOpen) return;
    const onEsc = e => {
      if (e.key === 'Escape') setCatalogModalOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [catalogModalOpen]);
  const [sppPickerOpen, setSppPickerOpen] = useState(true); // legacy — kept for compat
  const [recipe, setRecipe] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [numBags, setNumBags] = useState(6);
  const [kgBag, setKgBag] = useState(1.5);
  const [spawnCost, setSpawnCost] = useState(12000);
  const [showOpt, setShowOpt] = useState(false);
  const [hObj, setHObj] = useState(67);
  const [showGuide, setShowGuide] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [saved, setSaved] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [flash, setFlash] = useState(false);
  const [saveSyncErr, setSaveSyncErr] = useState('');
  const [loteSyncErr, setLoteSyncErr] = useState('');
  const [cmpRecipe, setCmpRecipe] = useState([]);
  const [cmpKey, setCmpKey] = useState('p_ostreatus_gris');
  const [tab, setTab] = useState('formular');
  const TAB_LABELS = {
    inicio: 'Inicio',
    catalogo: 'Especies',
    formular: 'Formular',
    inventario: 'Bodega',
    produccion: 'Ficha',
    schedule: 'Cronograma',
    dashboard: 'Dashboard',
    bitacora: 'Bitácora'
  };
  const NAV_GROUPS = [{
    key: 'inicio',
    label: 'Inicio',
    tabs: ['inicio'],
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 11l9-7 9 7M5 10v10h14V10"
    }))
  }, {
    key: 'recetas',
    label: 'Recetas',
    tabs: ['catalogo', 'formular'],
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9"
    }))
  }, {
    key: 'registro',
    label: 'Bitácora',
    tabs: ['bitacora', 'dashboard'],
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 4h14v16H5zM9 4V2h6v2M8 10h8M8 14h8M8 18h5"
    }))
  }];
  const TAB_PAGE_TITLES = {
    inicio: 'Inicio',
    catalogo: 'Catálogo de especies',
    formular: 'Formulador de receta',
    inventario: 'Bodega',
    produccion: 'Ficha de producción',
    schedule: 'Cronograma de cultivo',
    dashboard: 'Dashboard',
    bitacora: 'Bitácora de pruebas'
  };
  const [mode, setMode] = useState('receta');
  const RECETA_TABS = ['catalogo', 'formular'];
  const CULTIVO_TABS = ['inventario', 'produccion', 'schedule', 'dashboard', 'bitacora'];
  const TAB_ALIASES = {
    optimizar: 'formular'
  };
  const goTab = t => {
    t = TAB_ALIASES[t] || t;
    setTab(t);
    setMode(RECETA_TABS.includes(t) ? 'receta' : 'cultivo');
  };
  useEffect(() => {
    if (props.tab) goTab(props.tab);
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
      goTab('formular');
    }
  }, [props.preselectSpecies, props.preselectNonce]);
  const [schDate, setSchDate] = useState((() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })());
  const [schKey, setSchKey] = useState('p_ostreatus_gris');
  const [normMode, setNormMode] = useState(false);
  const [vegPrice, setVegPrice] = useState(12000);
  const [priceOverrides, setPriceOverrides] = useState({});
  const [showPrices, setShowPrices] = useState(false);
  const [invBase, setInvBase] = useState('');
  const [invSupp, setInvSupp] = useState('');
  const [invAer, setInvAer] = useState('');
  const [invMin, setInvMin] = useState(3);
  const [invAerPct, setInvAerPct] = useState(10);
  const [invTargetCN, setInvTargetCN] = useState(35);
  const [invResult, setInvResult] = useState(null);
  const [dashFilter, setDashFilter] = useState('all');
  const [lockedIds, setLockedIds] = useState([]);
  const [balanceMode, setBalanceMode] = useState('proportional');
  // v3 new state
  const [pantryIds, setPantryIds] = useState([]);
  const [usePantry, setUsePantry] = useState(false);
  const [showCompatOnly, setShowCompatOnly] = useState(false);
  const [disabledIngIds, setDisabledIngIds] = useState([]);
  const toggleDisabledIng = id => setDisabledIngIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const [justAddedIds, setJustAddedIds] = useState([]);
  const flashAdded = id => {
    setJustAddedIds(p => [...p, id]);
    setTimeout(() => setJustAddedIds(p => p.filter(x => x !== id)), 650);
  };
  const [optTarget, setOptTarget] = useState(sKey || 'p_ostreatus_gris');
  React.useEffect(() => {
    setOptTarget(sKey);
    setOptResults(null);
  }, [sKey]);
  const [optMaxCost, setOptMaxCost] = useState(0);
  const [optResults, setOptResults] = useState(null);
  const [optRunning, setOptRunning] = useState(false);
  // Modo de trabajo del Formulador: bodega (solo stock real) vs. catálogo
  // completo. Antes solo alimentaba el Generador automático — ahora también
  // controla las sugerencias individuales del Perito (bestStock en
  // generateOptimizer), para que ambos exploren siempre el mismo universo de
  // ingredientes y no queden desincronizados. Persistido: es una preferencia
  // de cómo el usuario quiere trabajar, no un dato de la receta activa.
  const [optUseStock, setOptUseStock] = useState(() => {
    try {
      const v = localStorage.getItem('setas_workmode');
      if (v === 'catalogo') return false;
    } catch (e) {}
    return true;
  });
  useEffect(() => {
    try {
      localStorage.setItem('setas_workmode', optUseStock ? 'bodega' : 'catalogo');
    } catch (e) {}
  }, [optUseStock]);
  const [optProfile, setOptProfile] = useState('produccion');
  // ── Producción: lote propio de la hoja imprimible ──
  const [prodBags, setProdBags] = useState(6);
  const [prodKg, setProdKg] = useState(1.5);
  const [prodH, setProdH] = useState(67);
  const [prodDate, setProdDate] = useState((() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })());
  const [prodScaleG, setProdScaleG] = useState(0.1); // resolución de báscula en gramos (0.1 g = 100 mg)
  const [prodMoist, setProdMoist] = useState({}); // override de humedad real por insumo {id: %} para el lote del día
  const [prodLoteNum, setProdLoteNum] = useState(''); // número de lote imprimible
  const [checkedSteps, setCheckedSteps] = useState({}); // checkboxes interactivos de la hoja
  const [loteBatchConfirm, setLoteBatchConfirm] = useState(null); // modal confirmar descuento de inventario
  const [confirmDlg, setConfirmDlg] = useState(null); // {title,msg,onConfirm,danger,confirmLabel} — reemplaza window.confirm
  const [promptDlg, setPromptDlg] = useState(null); // {title,label,placeholder,onSubmit} — reemplaza window.prompt
  const [noticeDlg, setNoticeDlg] = useState(null); // {title,msg} — reemplaza alert()
  // ── Bitácora de pruebas ──
  const [bitLotes, setBitLotes] = useState([]);
  const [bitBolsas, setBitBolsas] = useState([]);
  const [bitCosechas, setBitCosechas] = useState([]);
  const [bitTab, setBitTab] = useState('bit_dash');
  const [bitActiveLoteId, setBitActiveLoteId] = useState(null);
  const [bitDashView, setBitDashView] = useState('grid');
  const [showBitNuevo, setShowBitNuevo] = useState(false);
  const [bitNuevoForm, setBitNuevoForm] = useState({});
  const [showBitCosecha, setShowBitCosecha] = useState(false);
  const [bitCosechaForm, setBitCosechaForm] = useState({});
  const [prodBagType, setProdBagType] = useState('bolsa_20x50'); // tipo de contenedor activo
  const [showFlush, setShowFlush] = useState(false);
  const [showCompChart, setShowCompChart] = useState(false);
  const [showSpeciesRec, setShowSpeciesRec] = useState(false);

  // ── v4: estado inventario
  const [invProveedores, setInvProveedores] = useState([]);
  const [invCompras, setInvCompras] = useState([]);
  const [invLotes, setInvLotes] = useState([]);
  const [invMovimientos, setInvMovimientos] = useState([]);
  const [invTab, setInvTab] = useState('stock');
  const [formularMode, setFormularMode] = useState('auto');
  const [showOptimizer, setShowOptimizer] = useState(true);
  const [builderSubTab, setBuilderSubTab] = useState('formular');
  const [loadedFlash, setLoadedFlash] = useState(false);
  const [cmpFecha, setCmpFecha] = useState((() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })());
  const [cmpProvId, setCmpProvId] = useState('');
  const [cmpFuente, setCmpFuente] = useState('manual');
  const [cmpItems, setCmpItems] = useState([{
    uid: 1,
    ingId: '',
    kg: '',
    precio: ''
  }]);
  const [cmpMode, setCmpMode] = useState('manual');
  const [cmpPasteText, setCmpPasteText] = useState('');
  const [cmpParsing, setCmpParsing] = useState(false);
  const [cmpParseErr, setCmpParseErr] = useState('');
  const [cmpConfirm, setCmpConfirm] = useState(null);
  const cmpFileRef = useRef(null);
  const [showProvModal, setShowProvModal] = useState(false);
  const [newProv, setNewProv] = useState({
    nombre: '',
    tipo: 'plaza',
    municipio: ''
  });

  // Bloquea el scroll del body mientras cualquier modal esté abierto — en iOS Safari
  // el fondo puede seguir haciendo rubber-band scroll detrás de un overlay fixed.
  React.useEffect(() => {
    const anyModalOpen = !!(confirmDlg || promptDlg || noticeDlg || loteBatchConfirm || showBitNuevo || showBitCosecha || showProvModal || catalogModalOpen);
    if (!anyModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [confirmDlg, promptDlg, noticeDlg, loteBatchConfirm, showBitNuevo, showBitCosecha, showProvModal, catalogModalOpen]);
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRowData, setEditingRowData] = useState({
    stock: '',
    precio: '',
    proveedorId: '',
    alertaMin: '',
    ingredienteNuevoId: ''
  });
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [addStockId, setAddStockId] = useState('');
  const [addStockKg, setAddStockKg] = useState('');
  const [alertaConfig, setAlertaConfig] = useState({});
  const [provOverride, setProvOverride] = useState({});
  const saveRowEdit = ingredienteId => {
    const {
      stock,
      precio,
      proveedorId,
      alertaMin,
      ingredienteNuevoId
    } = editingRowData;
    const kg = Math.max(0, parseFloat(stock) || 0);
    const pr = Math.max(0, parseFloat(precio) || 0);
    const nuevoId = ingredienteNuevoId && ingredienteNuevoId !== ingredienteId ? ingredienteNuevoId : null;
    const targetId = nuevoId || ingredienteId;
    // Reasignar ingredienteId en lotes si cambió
    setInvLotes(prev => {
      let updated = nuevoId ? prev.map(l => l.ingredienteId === ingredienteId ? {
        ...l,
        ingredienteId: nuevoId
      } : l) : [...prev];
      const activos = updated.filter(l => l.activo && l.ingredienteId === targetId);
      if (activos.length === 0) {
        const loteId = 'lote_manual_' + Date.now();
        updated = [...updated, {
          id: loteId,
          compraId: 'ajuste_manual',
          ingredienteId: targetId,
          cantidadKgTotal: kg,
          precioPorKgCOP: pr,
          fechaIngreso: new Date().toISOString().split('T')[0],
          cantidadKgDisponible: kg,
          activo: true
        }];
      } else if (activos.length === 1) {
        updated = updated.map(l => l.id === activos[0].id ? {
          ...l,
          cantidadKgDisponible: kg,
          cantidadKgTotal: Math.max(l.cantidadKgTotal, kg),
          precioPorKgCOP: pr
        } : l);
      } else {
        const totalActual = activos.reduce((s, l) => s + l.cantidadKgDisponible, 0);
        updated = updated.map(l => {
          if (!l.activo || l.ingredienteId !== targetId) return l;
          const fraccion = totalActual > 0 ? l.cantidadKgDisponible / totalActual : 1 / activos.length;
          return {
            ...l,
            cantidadKgDisponible: Math.round(kg * fraccion * 100) / 100,
            precioPorKgCOP: pr
          };
        });
      }
      try {
        localStorage.setItem('sdp_lotes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    // Reasignar en compras si cambió el tipo
    if (nuevoId) {
      setInvCompras(prev => {
        const upd = prev.map(c => ({
          ...c,
          items: c.items.map(it => it.ingredienteId === ingredienteId ? {
            ...it,
            ingredienteId: nuevoId
          } : it)
        }));
        try {
          localStorage.setItem('sdp_compras', JSON.stringify(upd));
        } catch (e) {}
        return upd;
      });
    }
    // Proveedor override
    if (proveedorId) {
      const upd = {
        ...provOverride,
        [targetId]: proveedorId
      };
      setProvOverride(upd);
      try {
        localStorage.setItem('sdp_prov_override', JSON.stringify(upd));
      } catch (e) {}
    }
    // Alerta mínima
    const am = parseFloat(alertaMin);
    if (!isNaN(am) && am >= 0) {
      const upd = {
        ...alertaConfig,
        [targetId]: am
      };
      setAlertaConfig(upd);
      try {
        localStorage.setItem('sdp_alertas', JSON.stringify(upd));
      } catch (e) {}
    }
    setEditingRowId(null);
  };
  const eliminarIngrediente = (ingredienteId, nombre) => {
    const doDelete = () => {
      setInvLotes(prev => {
        const upd = prev.map(l => l.ingredienteId === ingredienteId ? {
          ...l,
          activo: false
        } : l);
        try {
          localStorage.setItem('sdp_lotes', JSON.stringify(upd));
        } catch (e) {}
        return upd;
      });
      // Limpiar pantry
      try {
        const pantry = JSON.parse(localStorage.getItem('sdp_pantry') || '{}');
        delete pantry[ingredienteId];
        localStorage.setItem('sdp_pantry', JSON.stringify(pantry));
      } catch (e) {}
    };
    setConfirmDlg({
      title: 'Eliminar stock',
      msg: `¿Eliminar todo el stock de "${nombre}"? Esto marcará los lotes como inactivos. Los movimientos e historial de compras se conservan.`,
      danger: true,
      confirmLabel: 'Eliminar',
      onConfirm: doDelete
    });
  };
  // Compatibilidad legacy (usada en botón "Agregar ingrediente al stock")
  const saveStockEdit = (ingredienteId, nuevoKg) => {
    const kg = Math.max(0, parseFloat(nuevoKg) || 0);
    setInvLotes(prev => {
      let updated = [...prev];
      const activos = updated.filter(l => l.activo && l.ingredienteId === ingredienteId);
      if (activos.length === 0) {
        const loteId = 'lote_manual_' + Date.now();
        updated = [...updated, {
          id: loteId,
          compraId: 'ajuste_manual',
          ingredienteId,
          cantidadKgTotal: kg,
          precioPorKgCOP: 0,
          fechaIngreso: new Date().toISOString().split('T')[0],
          cantidadKgDisponible: kg,
          activo: true
        }];
      } else if (activos.length === 1) {
        updated = updated.map(l => l.id === activos[0].id ? {
          ...l,
          cantidadKgDisponible: kg,
          cantidadKgTotal: Math.max(l.cantidadKgTotal, kg)
        } : l);
      } else {
        const totalActual = activos.reduce((s, l) => s + l.cantidadKgDisponible, 0);
        updated = updated.map(l => {
          if (!l.activo || l.ingredienteId !== ingredienteId) return l;
          const fraccion = totalActual > 0 ? l.cantidadKgDisponible / totalActual : 1 / activos.length;
          return {
            ...l,
            cantidadKgDisponible: Math.round(kg * fraccion * 100) / 100
          };
        });
      }
      try {
        localStorage.setItem('sdp_lotes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // ── v4: cargar / seed inventario
  useEffect(() => {
    try {
      const seeded = localStorage.getItem('sdp_seeded');
      if (!seeded) {
        localStorage.setItem('sdp_proveedores', JSON.stringify(SEED_PROVEEDORES));
        localStorage.setItem('sdp_compras', JSON.stringify(SEED_COMPRAS));
        localStorage.setItem('sdp_lotes', JSON.stringify(SEED_LOTES));
        localStorage.setItem('sdp_movimientos', JSON.stringify(SEED_MOVIMIENTOS));
        localStorage.setItem('sdp_seeded', '1');
        setInvProveedores(SEED_PROVEEDORES);
        setInvCompras(SEED_COMPRAS);
        setInvLotes(SEED_LOTES);
        setInvMovimientos(SEED_MOVIMIENTOS);
      } else {
        const p = localStorage.getItem('sdp_proveedores');
        const c = localStorage.getItem('sdp_compras');
        const l = localStorage.getItem('sdp_lotes');
        const m = localStorage.getItem('sdp_movimientos');
        if (p) setInvProveedores(JSON.parse(p));
        if (c) setInvCompras(JSON.parse(c));
        if (l) setInvLotes(JSON.parse(l));
        if (m) setInvMovimientos(JSON.parse(m));
        const bl = localStorage.getItem('sdp_bit_lotes');
        const bb = localStorage.getItem('sdp_bit_bolsas');
        const bc = localStorage.getItem('sdp_bit_cosechas');
        if (bl) setBitLotes(JSON.parse(bl));
        if (bb) setBitBolsas(JSON.parse(bb));
        if (bc) setBitCosechas(JSON.parse(bc));
      }
    } catch (e) {}
  }, []);

  // ── v4: sincronizar pantry con stock
  useEffect(() => {
    if (!invLotes.length) return;
    const inStockIds = [...new Set(invLotes.filter(l => l.activo && l.cantidadKgDisponible > 0).map(l => l.ingredienteId))];
    // Reemplazar (no acumular) para que ítems con stock=0 queden fuera
    setPantryIds(inStockIds);
  }, [invLotes]);
  useEffect(() => {
    try {
      const s = localStorage.getItem('setas_v6');
      if (s) setSaved(JSON.parse(s));
    } catch (e) {}
    ;
  }, []);
  useEffect(() => {
    if (props.onSavedChange) props.onSavedChange(saved);
  }, [saved]);
  useEffect(() => {
    try {
      const s = localStorage.getItem('setas_prices_v1');
      if (s) setPriceOverrides(JSON.parse(s));
    } catch (e) {}
    ;
  }, []);
  useEffect(() => {
    try {
      const s = localStorage.getItem('sdp_alertas');
      if (s) setAlertaConfig(JSON.parse(s));
    } catch (e) {}
    ;
  }, []);
  useEffect(() => {
    try {
      const s = localStorage.getItem('sdp_prov_override');
      if (s) setProvOverride(JSON.parse(s));
    } catch (e) {}
    ;
  }, []);
  const saveR = () => {
    const nm = saveName.trim();
    if (!nm || !recipe.length || !balanced) return;
    const trSave = an ? calcTreatment(an, sKey) : null;
    const e = {
      id: Date.now(),
      name: nm,
      sKey,
      recipe: [...recipe],
      date: new Date().toLocaleDateString('es-CO'),
      eb: an ? an.eb.toFixed(0) : '—',
      cn: an ? an.cn.toFixed(1) : '—',
      score: opt.score,
      cost: an ? Math.round(an.cost) : 0,
      treatCol: trSave?.col || null,
      energyCopKg: trSave?.energy?.cop_per_kg_seco || 0
    };
    const u = [e, ...saved];
    setSaved(u);
    try {
      localStorage.setItem('setas_v6', JSON.stringify(u));
    } catch (e2) {}
    setSaveName('');
    setFlash(true);
    setSaveSyncErr('');
    setTimeout(() => setFlash(false), 1500);
    // Escritura en Firestore en segundo plano — localStorage ya guardó al instante,
    // así que un fallo de red no bloquea al operador; solo se avisa si no sincronizó.
    if (window.SetasDB) {
      window.SetasDB.saveReceta({
        nombre: nm,
        sKey,
        ingredientes: recipe.map(r => ({
          id: r.id,
          pct: parseFloat(r.p) || 0
        })),
        cn: an ? an.cn : null,
        eb: an ? an.eb : null,
        cost: an ? Math.round(an.cost) : null,
        score: opt.score
      }).catch(err => setSaveSyncErr('No se sincronizó con el servidor: ' + (err.message || err.code || 'error desconocido')));
    }
  };
  const loadR = e => {
    const apply = () => {
      setSKey(e.sKey);
      setRecipe(e.recipe);
      setLockedIds([]);
      setTab('formular');
      setLoadedFlash(true);
      setTimeout(() => setLoadedFlash(false), 2200);
      setNavOpen(false);
    };
    if (recipe.length > 0) {
      setConfirmDlg({
        title: 'Reemplazar receta activa',
        msg: `¿Reemplazar la receta activa con "${e.name}"? Se perderán los cambios sin guardar.`,
        onConfirm: apply
      });
      return;
    }
    apply();
  };
  const delR = id => {
    setConfirmDlg({
      title: 'Eliminar receta',
      msg: '¿Eliminar esta receta guardada? Esta acción no se puede deshacer.',
      danger: true,
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        const u = saved.filter(r => r.id !== id);
        setSaved(u);
        try {
          localStorage.setItem('setas_v6', JSON.stringify(u));
        } catch (e) {}
      }
    });
  };
  // Registra el EB real observado tras cosechar un lote de una prueba guardada.
  // Antes cada análisis del Perito/Formulador era puramente teórico (fórmulas
  // fijas) sin retroalimentación de qué pasó realmente en producción — esto
  // no cambia el score todavía, pero deja el dato (eb estimado vs ebReal)
  // visible en el Recetario para que el usuario vea qué tan bien predice el
  // modelo en su bodega concreta, y es la base para calibrar la matriz más
  // adelante con datos reales en vez de solo teoría.
  const setEbRealFor = id => {
    const entry = saved.find(s => s.id === id);
    if (!entry) return;
    setPromptDlg({
      title: 'Registrar EB real',
      label: `EB real obtenida al final del ciclo (%) · estimado: ${entry.eb}%`,
      placeholder: String(entry.eb),
      confirmLabel: 'Guardar',
      onSubmit: val => {
        const n = parseFloat(val);
        if (!Number.isFinite(n)) return;
        const u = saved.map(s => s.id === id ? {
          ...s,
          ebReal: Math.round(n * 10) / 10
        } : s);
        setSaved(u);
        try {
          localStorage.setItem('setas_v6', JSON.stringify(u));
        } catch (e) {}
      }
    });
  };
  const sp = SPP[sKey];
  const effectiveINGS = useMemo(() => INGS.map(ing => {
    const invPr = precioPonderado(ing.id, invLotes);
    if (invPr !== null) return {
      ...ing,
      cost: Math.round(invPr)
    };
    if (priceOverrides[ing.id] !== undefined) return {
      ...ing,
      cost: priceOverrides[ing.id]
    };
    return ing;
  }), [priceOverrides, invLotes]);
  const optimizerINGS = useMemo(() => effectiveINGS.filter(g => !disabledIngIds.includes(g.id)), [effectiveINGS, disabledIngIds]);
  const fings = useMemo(() => effectiveINGS.filter(g => {
    const ms = search === '' || g.name.toLowerCase().includes(search.toLowerCase()) || g.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const roleMatch = cat === 'all' || (cat === 'aditivo' ? ['aditivo_ph', 'aditivo_estructura', 'aditivo_micronutriente', 'aditivo_arrancador'].includes(g.role) : g.role === cat);
    return ms && roleMatch;
  }).sort((a, b) => a.name.localeCompare(b.name)), [search, cat, effectiveINGS]);
  const historicalYields = useMemo(() => {
    try {
      const v = JSON.parse(props.historicalYields || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }, [props.historicalYields]);
  const histStats = useMemo(() => historicalEBFor(sKey, historicalYields, recipe), [sKey, historicalYields, recipe]);
  const an = useMemo(() => analyze(recipe, sKey, effectiveINGS), [recipe, sKey, effectiveINGS]);
  const balanced = isMassBalanced(an);
  const balMsg = balanced ? '' : massBalanceMsg(an);
  const optimalAn = useMemo(() => {
    try {
      const r = runAutoOptimizer(sKey, invLotes, 0, optimizerINGS, false);
      if (r.results?.length) return analyze(r.results[0].recipe, sKey, optimizerINGS);
    } catch (e) {}
    return null;
  }, [sKey, invLotes, optimizerINGS]);
  const dg = useMemo(() => diagnose(an, sKey), [an, sKey]);
  const tr = useMemo(() => calcTreatment(an, sKey), [an, sKey]);
  const bd = useMemo(() => showBatch ? calcBatch(recipe, numBags, kgBag, hObj, spawnCost, effectiveINGS, an?.dynSpawn) : null, [recipe, numBags, kgBag, showBatch, hObj, spawnCost, effectiveINGS, an?.dynSpawn]);
  // ── Ficha: rows precalculados para botón Ejecutar Lote ──
  const prodRows = useMemo(() => {
    if (!recipe.length || !balanced) return null;
    const prodIngs = effectiveINGS.map(g => prodMoist[g.id] != null ? {
      ...g,
      moisture: prodMoist[g.id]
    } : g);
    const pb = calcBatch(recipe, prodBags || 1, prodKg || 1.5, prodH || 67, spawnCost, prodIngs, an?.dynSpawn);
    if (!pb) return null;
    const resG = prodScaleG || 0.1;
    const roundG = x => Math.round(x / resG) * resG;
    return recipe.map(r => {
      const g = prodIngs.find(x => x.id === r.id);
      const it = g ? pb.items.find(x => x.name === g.name) : null;
      const krTeo = it ? it.kr : 0;
      const grR = roundG(krTeo * 1000);
      const m = g ? Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)) : 0;
      const masaSecaR = grR / 1000 * (1 - m);
      return {
        g,
        r,
        krTeo,
        grR,
        m,
        masaSecaR
      };
    });
  }, [recipe, effectiveINGS, prodMoist, prodBags, prodKg, prodH, spawnCost, prodScaleG, an]);
  const stockIds = useMemo(() => new Set(invLotes.filter(l => l.activo && l.cantidadKgDisponible > 0).map(l => l.ingredienteId)), [invLotes]);
  const stockMap = useMemo(() => {
    const m = {};
    invLotes.filter(l => l.activo && l.cantidadKgDisponible > 0).forEach(l => {
      m[l.ingredienteId] = (m[l.ingredienteId] || 0) + l.cantidadKgDisponible;
    });
    return m;
  }, [invLotes]);
  // Mismo EB mezclado con historial real que ya se pinta en el gauge
  // (RecipeGauges/blendEBWithHistory) — se pasa como override al score del
  // Perito para que ambos coincidan: antes el gauge mostraba un EB ajustado
  // por lotes reales pero el score de al lado seguía siendo 100% teórico.
  const blendedEB = an ? blendEBWithHistory(an, histStats) : null;
  // Memoria de sesión de qué bandera/ícono se atacó desde el Perito — ver
  // repeatedApply en generateOptimizer. Por ícono, no por operación exacta:
  // refinar el mismo ingrediente para un problema distinto no cuenta como
  // repetición. Se reinicia al cambiar de especie (contexto nuevo).
  const [appliedIcons, setAppliedIcons] = React.useState({});
  React.useEffect(() => {
    setAppliedIcons({});
  }, [sKey]);
  const opt = useMemo(() => generateOptimizer(an, sKey, stockIds, recipe, optimizerINGS, lockedIds, blendedEB, optUseStock, appliedIcons), [an, sKey, stockIds, recipe, optimizerINGS, lockedIds, blendedEB, optUseStock, appliedIcons]);
  // Costo real de bodega (precio ponderado por lote FIFO, precioPonderado) vs.
  // costo de catálogo que usa an.cost/scoreCost. Antes el Perito solo conocía
  // el precio de catálogo aunque dos ingredientes del mismo rol tuvieran costo
  // de compra distinto en bodega — se muestra aparte, sin tocar el score, para
  // no introducir un cambio de comportamiento en runAutoOptimizer/scoreCost
  // que ya son consumidos en varios sitios con el costo de catálogo.
  const realCostPerKg = useMemo(() => {
    if (!recipe.length) return null;
    let known = false;
    const total = recipe.reduce((s, r) => {
      const pp = precioPonderado(r.id, invLotes);
      const g = effectiveINGS.find(i => i.id === r.id);
      if (pp != null) known = true;
      const price = pp != null ? pp : g ? g.cost : 0;
      return s + price * (parseFloat(r.p) || 0) / 100;
    }, 0);
    return known ? Math.round(total) : null;
  }, [recipe, invLotes, effectiveINGS]);
  // Similitud de Jaccard entre conjuntos de ingredientes (ignora %, solo IDs).
  const recipeSimilarity = (recA, recB) => {
    const a = new Set(recA.map(r => r.id)),
      b = new Set(recB.map(r => r.id));
    const inter = [...a].filter(x => b.has(x)).length;
    const union = new Set([...a, ...b]).size;
    return union ? inter / union : 0;
  };
  // Historial de resultados reales para esta especie: antes cada diagnóstico
  // del Perito era puramente teórico — ahora, si ya se registró EB real (ver
  // setEbRealFor) en pruebas guardadas de la misma especie, se usa para (a)
  // mostrar qué tan preciso ha sido el modelo aquí en esta bodega y (b) avisar
  // si la receta activa se parece a una prueba ya hecha, con su resultado real.
  const trialsWithReal = useMemo(() => saved.filter(s => s.sKey === sKey && s.ebReal != null), [saved, sKey]);
  const modelAccuracy = useMemo(() => {
    if (!trialsWithReal.length) return null;
    const avgAbsDiff = trialsWithReal.reduce((s, t) => s + Math.abs(t.ebReal - parseFloat(t.eb)), 0) / trialsWithReal.length;
    return Math.round(avgAbsDiff * 10) / 10;
  }, [trialsWithReal]);
  const similarTrial = useMemo(() => {
    if (!recipe.length || !trialsWithReal.length) return null;
    let best = null,
      bestSim = 0;
    trialsWithReal.forEach(t => {
      const sim = recipeSimilarity(recipe, t.recipe || []);
      if (sim > bestSim) {
        bestSim = sim;
        best = t;
      }
    });
    return bestSim >= 0.5 ? {
      ...best,
      similarity: bestSim
    } : null;
  }, [recipe, trialsWithReal]);
  const cAn = useMemo(() => analyze(cmpRecipe, cmpKey, effectiveINGS), [cmpRecipe, cmpKey, effectiveINGS]);
  const sch = useMemo(() => calcSchedule(schKey, schDate, an?.eb), [schKey, schDate, an]);
  // Score de una receta guardada (Recetario/Dashboard), recalculado en vivo con
  // la matriz actual en vez de confiar en el número persistido al guardarla —
  // así una receta guardada antes de una recalibración de pesos no queda con
  // un número que ya no es comparable con las recetas nuevas.
  const liveScoreFor = e => {
    if (!e?.recipe?.length) return 0;
    const a2 = analyze(e.recipe, e.sKey, effectiveINGS);
    if (!a2) return 0;
    const tr2 = calcTreatment(a2, e.sKey);
    // stockIds debe pasarse igual que en el Perito (línea ~768) — de lo contrario
    // scoreStock cae siempre en el guard "sin restricción" y la misma receta
    // guardada muestra un score distinto en el Recetario que al abrirla en el Formulador.
    return scoreAn(a2, {
      treatment: tr2,
      recipe: e.recipe,
      stockIds
    }).score;
  };
  const addI = id => {
    if (recipe.find(r => r.id === id)) return;
    setRecipe([...recipe, {
      id,
      p: 10
    }]);
  };
  const [recipeHistory, setRecipeHistory] = React.useState([]);
  const applyOptStep = (apply, icon) => {
    if (!apply) return;
    setRecipeHistory(h => [...h, recipe]);
    setRecipe(applyOptToRecipe(recipe, apply, lockedIds, optimizerINGS));
    if (icon) setAppliedIcons(s => ({
      ...s,
      [icon]: (s[icon] || 0) + 1
    }));
  };
  const undoLastRec = () => {
    if (recipeHistory.length === 0) return;
    setRecipe(recipeHistory[recipeHistory.length - 1]);
    setRecipeHistory(h => h.slice(0, -1));
  };
  // Auto-mejorar: itera aplicando la mejor sugerencia válida, recalcula y para cuando
  // el score deja de subir. Máximo 6 vueltas. Evita el ciclo "aplico la 1 → la 2 ya no aplica".
  // Antes siempre tomaba el PRIMER ítem accionable de la lista (orden fijo por
  // tipo de bandera, no por impacto real) — dos recetas con el mismo conjunto
  // de problemas podían converger a resultados distintos según en qué orden
  // aparecían los flags. Ahora, en cada vuelta, prueba los hasta 3 ítems
  // accionables con mejor predictedScore (generateOptimizer ya lo calcula) y
  // se queda con el que de verdad produce el mejor resultado tras aplicarlo —
  // no solo el primero de la lista.
  const autoImprove = () => {
    let cur = recipe;
    let bestScore = -1;
    for (let i = 0; i < 6; i++) {
      const a = analyze(cur, sKey, effectiveINGS);
      if (!a) break;
      const o = generateOptimizer(a, sKey, stockIds, cur, optimizerINGS, lockedIds, blendEBWithHistory(a, histStats), optUseStock);
      if (o.score <= bestScore) break;
      bestScore = o.score;
      const candidates = o.items.filter(it => it.apply && (it.priority === 'critical' || it.priority === 'warning')).sort((x, y) => (y.predictedScore ?? -1) - (x.predictedScore ?? -1)).slice(0, 3);
      if (!candidates.length) break;
      let bestCandScore = -1,
        bestCandidate = null,
        bestA2 = null,
        bestO2 = null;
      for (const cand of candidates) {
        const tryRec = applyOptToRecipe(cur, cand.apply, lockedIds, optimizerINGS);
        const tryA = analyze(tryRec, sKey, effectiveINGS);
        if (!tryA) continue;
        const tryO = generateOptimizer(tryA, sKey, stockIds, tryRec, optimizerINGS, lockedIds, blendEBWithHistory(tryA, histStats), optUseStock);
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
      if (o2.score <= o.score) break; // no aceptar si no mejora el score global
      cur = candidate;
    }
    setRecipe(cur);
  };
  // Impresión de la Hoja de Producción.
  // ── openPrintWindow: abre una ventana nueva con la hoja de producción y la imprime.
  // Usa getComputedStyle para resolver variables CSS (oklab, etc.) antes de escribir la ventana.
  // Recoge solo <style> inline (sin CORS) para evitar ventana en blanco.
  const openPrintWindow = mode => {
    const el = document.querySelector('.prod-sheet');
    if (!el) {
      setNoticeDlg({
        msg: 'Genera la hoja primero (debe haber una receta activa).'
      });
      return;
    }
    el.querySelectorAll('input').forEach(inp => inp.setAttribute('value', inp.value));
    const nombre = (an?.sp?.name || 'Sustrato').replace(/\s+/g, '_');
    const fecha = prodDate || new Date().toISOString().slice(0, 10);
    const lote = prodLoteNum ? '_' + prodLoteNum.replace(/\s+/g, '-') : '';
    const filename = 'HojaProd_' + nombre + lote + '_' + fecha;
    // Resolver variables CSS a valores concretos (evita color-mix/oklab en la ventana nueva)
    const rs = getComputedStyle(document.documentElement);
    const varLines = [];
    for (let i = 0; i < rs.length; i++) {
      const p = rs[i];
      if (p.startsWith('--')) varLines.push(`${p}:${rs.getPropertyValue(p)};`);
    }
    // Solo <style> inline: sin CORS, sin hojas externas que fallan
    const inlineCSS = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
    const fullHtml = `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><title>${filename}</title>
<style>
:root{${varLines.join('')}}
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
    const pw = window.open('', '_blank', 'width=900,height=1100');
    if (!pw) {
      setNoticeDlg({
        title: 'Ventana bloqueada',
        msg: 'El navegador bloqueó la ventana emergente. Permite pop-ups para este sitio e inténtalo de nuevo (ícono en la barra de direcciones → Permitir pop-ups).'
      });
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
  const printProdSheet = () => openPrintWindow('print');
  // Exporta la hoja como PDF — misma ventana, mismo mecanismo; el usuario elige "Guardar como PDF".
  const exportPDF = () => openPrintWindow('pdf');
  // ── Ejecutar Lote: muestra modal de confirmación antes de descontar inventario ──
  const ejecutarLote = (rows, loteNum, fecha) => {
    if (!rows || !rows.length) return;
    const preview = rows.filter(x => x.g).map(x => {
      const krKg = x.grR / 1000;
      const stockActual = invLotes.filter(l => l.activo && l.ingredienteId === x.g.id).reduce((s, l) => s + l.cantidadKgDisponible, 0);
      return {
        id: x.g.id,
        name: x.g.name,
        krKg,
        stockActual,
        ok: stockActual >= krKg * 0.999
      };
    });
    setLoteBatchConfirm({
      preview,
      loteNum,
      fecha
    });
  };
  const confirmarEjecucion = () => {
    if (!loteBatchConfirm) return;
    const {
      preview,
      loteNum,
      fecha
    } = loteBatchConfirm;
    const now = new Date().toISOString();
    setInvLotes(prev => {
      const updated = consumirInventarioFIFOLocal(prev, preview);
      try {
        localStorage.setItem('sdp_lotes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    const ts = Date.now();
    const newMovs = preview.map((row, i) => ({
      id: 'mov_lote_' + ts + '_' + i,
      tipo: 'consumo_lote',
      ingredienteId: row.id,
      kgMovidos: row.krKg,
      loteNum: loteNum || '—',
      fecha,
      nota: `Lote ${loteNum || '—'} · ${fecha}`,
      timestamp: now
    }));
    saveMovimientos([...invMovimientos, ...newMovs]);
    setLoteBatchConfirm(null);
    setLoteSyncErr('');
    // localStorage ya descontó al instante (mismo patrón que saveR): la transacción de
    // Firestore corre en segundo plano y es la que de verdad evita el doble descuento
    // entre operadores/dispositivos concurrentes — un fallo de red no bloquea al operador,
    // solo se avisa si no sincronizó.
    if (window.SetasDB) {
      (async () => {
        try {
          for (const row of preview) {
            await window.SetasDB.descontarInventarioFIFO(row.id, row.krKg);
          }
          await window.SetasDB.crearLoteProduccion({
            codigo: loteNum || 'LOTE-' + ts,
            especie: SPP[sKey]?.name || sKey,
            camara: '—',
            operador: '—',
            receta: {
              ingredientes: recipe.map(r => ({
                id: r.id,
                pct: parseFloat(r.p) || 0
              }))
            }
          });
        } catch (err) {
          setLoteSyncErr('No se sincronizó con el servidor: ' + (err.message || err.code || 'error desconocido'));
        }
      })();
    }
  };
  // ── Bitácora helpers ──
  const buildBitNuevoForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const sp = SPP[sKey];
    const tr = an ? calcTreatment(an, sKey) : null;
    const SC = {
      p_ostreatus_gris: 'OST',
      p_ostreatus_blanco: 'OBL',
      p_djamor_rosa: 'ROS',
      p_eryngii: 'ERY',
      shiitake: 'SHI',
      lions_mane: 'MEL',
      reishi: 'REI',
      enoki: 'ENO',
      nameko: 'NAM'
    };
    const sppCode = SC[sKey] || 'EXP';
    const dc = today.replace(/-/g, '').slice(2);
    const cnt = bitLotes.length + 1;
    const nb = prodBags || 6;
    const kb = prodKg || 1.5;
    const hm = prodH || 67;
    return {
      codigo: `SDP-${dc}-${sppCode}-R${String(cnt).padStart(2, '0')}`,
      especie: sp?.name || '',
      especieCientifico: sp?.scientific || '',
      cepa: '',
      fechaMezcla: today,
      fechaInoculacion: today,
      numBolsas: nb,
      pesoHumedo: kb,
      peseSeco: parseFloat((nb * kb * (1 - hm / 100)).toFixed(3)),
      spawnPct: an?.dynSpawn || tr?.spawn || 8,
      humedad: hm,
      tratamiento: tr?.name || '',
      costoIngKg: an ? Math.round(an.cost) : 0,
      operador: '',
      objetivo: '',
      notas: '',
      estado: 'incubacion',
      veredicto: '',
      recipeRef: recipe.length && balanced ? {
        id: Date.now(),
        name: saveName || 'Receta activa',
        sKey,
        recipe: [...recipe],
        cn: an.cn.toFixed(1),
        eb: an.eb.toFixed(0),
        score: opt.score,
        cost: Math.round(an.cost)
      } : null
    };
  };
  const crearBitLote = form => {
    const lote = {
      ...form,
      id: 'BIT_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const nb = parseInt(form.numBolsas) || 1;
    const ts = Date.now();
    const bolsas = Array.from({
      length: nb
    }, (_, i) => ({
      id: 'BOLSA_' + ts + '_' + i,
      loteId: lote.id,
      codigo: `${lote.codigo}-B${String(i + 1).padStart(2, '0')}`,
      num: i + 1,
      estado: 'sana',
      col25: null,
      col50: null,
      col100: null,
      pesoInicial: form.pesoHumedo || 1.5,
      fechaDescarte: null,
      motivoDescarte: '',
      observaciones: '',
      foto: null
    }));
    setBitLotes(prev => {
      const upd = [lote, ...prev];
      try {
        localStorage.setItem('sdp_bit_lotes', JSON.stringify(upd));
      } catch (e) {}
      return upd;
    });
    setBitBolsas(prev => {
      const upd = [...prev, ...bolsas];
      try {
        localStorage.setItem('sdp_bit_bolsas', JSON.stringify(upd));
      } catch (e) {}
      return upd;
    });
    return lote.id;
  };
  const updateBitLote = (loteId, fields) => {
    setBitLotes(prev => {
      const upd = prev.map(l => l.id === loteId ? {
        ...l,
        ...fields
      } : l);
      try {
        localStorage.setItem('sdp_bit_lotes', JSON.stringify(upd));
      } catch (e) {}
      return upd;
    });
  };
  const updateBitBolsa = (bolsaId, fields) => {
    setBitBolsas(prev => {
      const upd = prev.map(b => b.id === bolsaId ? {
        ...b,
        ...fields
      } : b);
      try {
        localStorage.setItem('sdp_bit_bolsas', JSON.stringify(upd));
      } catch (e) {
        setNoticeDlg({
          title: 'No se pudo guardar',
          msg: 'El almacenamiento local está lleno y el cambio no quedó guardado. Elimina fotos de bolsas antiguas (clic sobre la foto para quitarla) y vuelve a intentar.'
        });
      }
      return upd;
    });
  };
  const addBitCosecha = cosecha => {
    setBitCosechas(prev => {
      const upd = [...prev, {
        ...cosecha,
        id: 'COS_' + Date.now()
      }];
      try {
        localStorage.setItem('sdp_bit_cosechas', JSON.stringify(upd));
      } catch (e) {}
      return upd;
    });
  };
  const deleteBitCosecha = id => {
    setBitCosechas(prev => {
      const upd = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem('sdp_bit_cosechas', JSON.stringify(upd));
      } catch (e) {}
      return upd;
    });
  };
  const deleteBitLote = loteId => {
    const doDelete = () => {
      setBitLotes(prev => {
        const upd = prev.filter(l => l.id !== loteId);
        try {
          localStorage.setItem('sdp_bit_lotes', JSON.stringify(upd));
        } catch (e) {}
        return upd;
      });
      setBitBolsas(prev => {
        const upd = prev.filter(b => b.loteId !== loteId);
        try {
          localStorage.setItem('sdp_bit_bolsas', JSON.stringify(upd));
        } catch (e) {}
        return upd;
      });
      setBitCosechas(prev => {
        const upd = prev.filter(c => c.loteId !== loteId);
        try {
          localStorage.setItem('sdp_bit_cosechas', JSON.stringify(upd));
        } catch (e) {}
        return upd;
      });
      if (bitActiveLoteId === loteId) {
        setBitActiveLoteId(null);
        setBitTab('bit_dash');
      }
    };
    setConfirmDlg({
      title: 'Eliminar lote',
      msg: '¿Eliminar este lote y todas sus bolsas y cosechas? Esta acción no se puede deshacer.',
      danger: true,
      confirmLabel: 'Eliminar',
      onConfirm: doDelete
    });
  };
  const calcLoteStats = loteId => {
    const lote = bitLotes.find(lt => lt.id === loteId);
    if (!lote) return null;
    const bolsas = bitBolsas.filter(b => b.loteId === loteId);
    if (!bolsas.length) return null;
    const cosechas = bitCosechas.filter(c => c.loteId === loteId);
    const bolsasSanas = bolsas.filter(b => b.estado === 'sana').length;
    const bolsasContaminadas = bolsas.filter(b => b.estado === 'contaminada').length;
    const contPct = bolsas.length ? bolsasContaminadas / bolsas.length * 100 : 0;
    const totalFresco = cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0) / 1000;
    const peseSeco = parseFloat(lote.peseSeco) || 0;
    const be = peseSeco > 0 ? totalFresco / peseSeco * 100 : null;
    const col100s = bolsas.filter(b => b.col100 && lote.fechaInoculacion).map(b => Math.round((new Date(b.col100) - new Date(lote.fechaInoculacion)) / 86400000));
    const diasCol = col100s.length ? col100s.reduce((s, d) => s + d, 0) / col100s.length : null;
    const costoKg = totalFresco > 0 && lote.costoIngKg > 0 ? lote.costoIngKg * peseSeco / totalFresco : null;
    return {
      bolsasSanas,
      bolsasContaminadas,
      contPct,
      totalFresco,
      be,
      diasCol,
      costoKg,
      numBolsas: bolsas.length
    };
  };
  const calcLoteScore = stats => {
    if (!stats || stats.totalFresco === 0) return null;
    let s = 0;
    if (stats.be != null) s += Math.min(40, stats.be / 150 * 40);
    s += (1 - stats.contPct / 100) * 30;
    s += stats.diasCol != null ? stats.diasCol <= 18 ? 15 : stats.diasCol <= 25 ? 10 : 5 : 7;
    s += stats.costoKg != null ? stats.costoKg <= 2000 ? 15 : stats.costoKg <= 4000 ? 10 : 5 : 7;
    return Math.round(s);
  };
  // Genera la receta óptima para la especie activa con toda la paleta y la carga
  const loadOptimal = () => {
    const r = runAutoOptimizer(sKey, invLotes, 0, optimizerINGS, false);
    if (r.results && r.results.length) {
      setRecipe(r.results[0].recipe);
      setLockedIds([]);
    } else setNoticeDlg({
      msg: 'No se encontró una combinación óptima para esta especie con los ingredientes disponibles.'
    });
  };
  const updP = (id, p) => {
    if (!normMode) {
      setRecipe(recipe.map(r => r.id === id ? {
        ...r,
        p
      } : r));
      return;
    }
    const pVal = Math.max(0, Math.min(100, parseFloat(p) || 0));
    const free = recipe.filter(r => r.id !== id && !lockedIds.includes(r.id));
    const sumLocked = recipe.filter(r => r.id !== id && lockedIds.includes(r.id)).reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const remaining = Math.max(0, 100 - pVal - sumLocked);
    const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    setRecipe(recipe.map(r => {
      if (r.id === id) return {
        ...r,
        p: pVal
      };
      if (lockedIds.includes(r.id)) return r;
      if (sumFree === 0) return {
        ...r,
        p: Math.round(remaining / free.length * 10) / 10
      };
      return {
        ...r,
        p: Math.round(parseFloat(r.p) / sumFree * remaining * 10) / 10
      };
    }));
  };
  const remI = id => setRecipe(recipe.filter(r => r.id !== id));
  const toggleLock = id => setLockedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ── v4: helpers persistencia inventario
  const saveProveedores = list => {
    setInvProveedores(list);
    try {
      localStorage.setItem('sdp_proveedores', JSON.stringify(list));
    } catch (e) {}
  };
  const saveCompras = list => {
    setInvCompras(list);
    try {
      localStorage.setItem('sdp_compras', JSON.stringify(list));
    } catch (e) {}
  };
  const saveLotes = list => {
    setInvLotes(list);
    try {
      localStorage.setItem('sdp_lotes', JSON.stringify(list));
    } catch (e) {}
  };
  const saveMovimientos = list => {
    setInvMovimientos(list);
    try {
      localStorage.setItem('sdp_movimientos', JSON.stringify(list));
    } catch (e) {}
  };
  const agregarProveedor = () => {
    const n = newProv.nombre.trim();
    if (!n || !newProv.municipio.trim()) return;
    const prov = {
      id: 'prov_' + Date.now(),
      nombre: n,
      tipo: newProv.tipo,
      municipio: newProv.municipio.trim()
    };
    const list = [...invProveedores, prov];
    saveProveedores(list);
    setCmpProvId(prov.id);
    setNewProv({
      nombre: '',
      tipo: 'plaza',
      municipio: ''
    });
    setShowProvModal(false);
  };
  const eliminarProveedor = id => {
    setConfirmDlg({
      title: 'Eliminar proveedor',
      msg: '¿Eliminar este proveedor? Esta acción no se puede deshacer.',
      danger: true,
      confirmLabel: 'Eliminar',
      onConfirm: () => saveProveedores(invProveedores.filter(p => p.id !== id))
    });
  };
  const addCmpItem = () => setCmpItems(prev => [...prev, {
    uid: Date.now(),
    ingId: '',
    kg: '',
    precio: ''
  }]);
  const updCmpItem = (uid, field, val) => setCmpItems(prev => prev.map(it => it.uid === uid ? {
    ...it,
    [field]: val
  } : it));
  const remCmpItem = uid => setCmpItems(prev => prev.filter(it => it.uid !== uid));

  // ── Captura automática de compras (foto de recibo / texto pegado) ──
  const fileToBase64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  // Redimensiona y recomprime una foto a JPEG antes de guardarla como dataURL en localStorage —
  // una foto de celular sin comprimir (2-4 MB) agota rápido la cuota de ~5 MB del navegador.
  const compressImageToDataURL = (file, maxDim = 1280, quality = 0.72) => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth,
        h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = e => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
  const matchIngId = nombre => {
    if (!nombre) return '';
    const n = nombre.toLowerCase().trim();
    let hit = INGS.find(g => g.name.toLowerCase() === n || g.id === n);
    if (hit) return hit.id;
    hit = INGS.find(g => g.name.toLowerCase().includes(n) || n.includes(g.name.toLowerCase()));
    return hit ? hit.id : '';
  };
  const applyParsedItems = parsed => {
    if (!Array.isArray(parsed) || !parsed.length) {
      setCmpParseErr('No se detectaron ítems. Prueba con Manual.');
      return;
    }
    setCmpItems(parsed.map((p, i) => ({
      uid: Date.now() + i,
      ingId: matchIngId(p.ingrediente || p.nombre || ''),
      kg: p.kg || p.cantidad || '',
      precio: p.precio || p.precio_kg || ''
    })));
    setCmpMode('manual');
  };
  const extraerJSON = txt => {
    const m = txt.match(/\[[\s\S]*\]/);
    return JSON.parse(m ? m[0] : txt);
  };
  const CMP_MAX_BYTES = 10 * 1024 * 1024;
  const capturarFoto = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const esPDF = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    if (file.size > CMP_MAX_BYTES) {
      setCmpParseErr(`El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB — el máximo es 10 MB. Comprime ${esPDF ? 'el PDF' : 'la foto'} o usa Manual.`);
      e.target.value = '';
      return;
    }
    if (!window.claude || typeof window.claude.complete !== 'function') {
      setCmpParseErr('La lectura automática no está disponible en este entorno. Usa Manual para cargar los ítems.');
      e.target.value = '';
      return;
    }
    setCmpParsing(true);
    setCmpParseErr('');
    setCmpFuente('ocr');
    try {
      const b64 = await fileToBase64(file);
      const listaIngs = INGS.map(g => g.name).join(', ');
      const fileBlock = esPDF ? {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: b64
        }
      } : {
        type: 'image',
        source: {
          type: 'base64',
          media_type: file.type || 'image/jpeg',
          data: b64
        }
      };
      const resp = await window.claude.complete({
        messages: [{
          role: 'user',
          content: [fileBlock, {
            type: 'text',
            text: `Esta es ${esPDF ? 'un PDF' : 'una foto'} de una factura/recibo de compra de insumos para cultivo de hongos. Puede tener varias páginas o incluir varias facturas: extrae los ítems de todas ellas. Extrae cada ítem comprado como JSON puro (sin texto ni markdown): [{"ingrediente":"nombre tal cual","kg":numero,"precio":numero_precio_por_kg_COP}]. Si el recibo trae precio total por línea en vez de precio por kg, calcula precio/kg dividiendo entre los kg. Ignora subtotales, impuestos y totales generales — solo ítems comprados. Ingredientes conocidos del inventario (usa el más parecido si aplica): ${listaIngs}.`
          }]
        }]
      });
      try {
        applyParsedItems(extraerJSON(resp));
      } catch (parseErr) {
        setCmpParseErr(`No se pudo interpretar la respuesta para ${esPDF ? 'el PDF' : 'la foto'}. Revisa que sea legible o usa Manual.`);
      }
    } catch (err) {
      setCmpParseErr(`No se pudo leer ${esPDF ? 'el PDF' : 'la foto'}. Intenta de nuevo o usa Manual.`);
    }
    setCmpParsing(false);
    e.target.value = '';
  };
  const parsearTexto = async () => {
    if (!cmpPasteText.trim()) return;
    setCmpParsing(true);
    setCmpParseErr('');
    setCmpFuente('email');
    try {
      const listaIngs = INGS.map(g => g.name).join(', ');
      const resp = await window.claude.complete({
        messages: [{
          role: 'user',
          content: `Este es un mensaje (email o WhatsApp) de un proveedor confirmando una compra de insumos para cultivo de hongos:\n\n"""${cmpPasteText}"""\n\nExtrae cada ítem como JSON puro (sin texto ni markdown): [{"ingrediente":"nombre","kg":numero,"precio":numero_precio_por_kg_COP}]. Ingredientes conocidos: ${listaIngs}.`
        }]
      });
      applyParsedItems(extraerJSON(resp));
    } catch (err) {
      setCmpParseErr('No se pudo interpretar el texto. Intenta de nuevo o usa Manual.');
    }
    setCmpParsing(false);
  };
  const registrarCompra = () => {
    const valid = cmpItems.filter(it => it.ingId && parseFloat(it.kg) > 0);
    if (!cmpProvId || valid.length === 0) {
      setNoticeDlg({
        msg: 'Selecciona proveedor y agrega al menos un ítem.'
      });
      return;
    }
    const cId = 'compra_' + Date.now();
    const nuevaCompra = {
      id: cId,
      fecha: cmpFecha,
      proveedorId: cmpProvId,
      items: valid.map(it => ({
        ingredienteId: it.ingId,
        kg: parseFloat(it.kg),
        precio: parseFloat(it.precio) || 0
      })),
      fuenteCaptura: cmpFuente,
      revisadoManualmente: true
    };
    const newLotes = valid.map((it, i) => ({
      id: 'lote_' + Date.now() + '_' + i,
      compraId: cId,
      ingredienteId: it.ingId,
      cantidadKgTotal: parseFloat(it.kg),
      precioPorKgCOP: parseFloat(it.precio) || 0,
      fechaIngreso: cmpFecha,
      cantidadKgDisponible: parseFloat(it.kg),
      activo: true
    }));
    const newMovs = newLotes.map(l => ({
      id: 'mov_' + Date.now() + '_' + l.id,
      loteId: l.id,
      ingredienteId: l.ingredienteId,
      tipo: 'entrada',
      cantidadKg: l.cantidadKgTotal,
      fecha: cmpFecha,
      referencia: cId
    }));
    saveCompras([...invCompras, nuevaCompra]);
    saveLotes([...invLotes, ...newLotes]);
    saveMovimientos([...invMovimientos, ...newMovs]);
    const prov = invProveedores.find(p => p.id === cmpProvId);
    const resumen = valid.map(it => {
      const g = INGS.find(x => x.id === it.ingId);
      const stockPrevio = invLotes.filter(l => l.activo && l.ingredienteId === it.ingId).reduce((s, l) => s + l.cantidadKgDisponible, 0);
      return {
        nombre: g ? g.name : it.ingId,
        kgComprado: parseFloat(it.kg),
        stockNuevo: stockPrevio + parseFloat(it.kg)
      };
    });
    setCmpConfirm({
      proveedor: prov ? prov.nombre : '',
      fecha: cmpFecha,
      total: valid.reduce((s, it) => s + (parseFloat(it.kg) || 0) * (parseFloat(it.precio) || 0), 0),
      items: resumen
    });
    setCmpItems([{
      uid: Date.now(),
      ingId: '',
      kg: '',
      precio: ''
    }]);
    setCmpMode('manual');
    setCmpPasteText('');
    setCmpFuente('manual');
  };
  const autoBalance = (mode = balanceMode) => {
    if (recipe.length === 0) return;
    const free = recipe.filter(r => !lockedIds.includes(r.id));
    if (free.length === 0) return;
    const sumLocked = recipe.filter(r => lockedIds.includes(r.id)).reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const target = Math.max(0, 100 - sumLocked);
    if (mode === 'proportional') {
      const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
      if (sumFree === 0) {
        const eq = Math.round(target / free.length * 10) / 10;
        setRecipe(recipe.map(r => lockedIds.includes(r.id) ? r : {
          ...r,
          p: eq
        }));
      } else {
        const factor = target / sumFree;
        setRecipe(recipe.map(r => lockedIds.includes(r.id) ? r : {
          ...r,
          p: Math.round(parseFloat(r.p) * factor * 10) / 10
        }));
      }
    } else if (mode === 'equal') {
      const eq = Math.round(target / free.length * 10) / 10;
      setRecipe(recipe.map(r => lockedIds.includes(r.id) ? r : {
        ...r,
        p: eq
      }));
    } else {
      // 'last': ajusta el último ingrediente libre
      const lastFree = [...recipe].reverse().find(r => !lockedIds.includes(r.id));
      if (!lastFree) return;
      const sumOthers = recipe.reduce((s, r) => r.id !== lastFree.id ? s + (parseFloat(r.p) || 0) : s, 0);
      const newP = Math.max(0, Math.round((100 - sumOthers) * 10) / 10);
      setRecipe(recipe.map(r => r.id === lastFree.id ? {
        ...r,
        p: newP
      } : r));
    }
  };
  const exportR = () => {
    if (!recipe.length) return;
    const t = calcTreatment(an, sKey);
    const batch = calcBatch(recipe, numBags, kgBag, 67, 12000, INGS, an?.dynSpawn);
    let txt = `SETAS DE LA PEÑA — FICHA DE RECETA\nValle de Tenjo · ${new Date().toLocaleDateString('es-CO')}\n${'─'.repeat(44)}\nESPECIE: ${sp.name} (${sp.scientific})\n\nINGREDIENTES:\n`;
    recipe.forEach(r => {
      const g = INGS.find(i => i.id === r.id);
      if (g) txt += `  ${g.name.padEnd(32)}${r.p}%\n`;
    });
    if (an) txt += `\nANÁLISIS:\n  C:N ${an.cn.toFixed(1)}:1  ·  N ${an.avgN.toFixed(2)}%  ·  EB ${an.eb.toFixed(0)}%  ·  $${Math.round(an.cost)}/kg\n`;
    if (t) txt += `\nTRATAMIENTO: ${t.name}\n  ${t.temp}  ·  ${t.time}  ·  Spawn ${t.spawn}%\n  ${t.prep}\n`;
    if (batch) {
      txt += `\nBATCH (${numBags}×${kgBag} kg):\n`;
      batch.items.forEach(i => {
        txt += `  ${i.name.padEnd(32)}${i.unit.padStart(9)}  $${Math.round(i.cost).toLocaleString()}\n`;
      });
      txt += `  Spawn ${batch.spawn.toFixed(2)} kg  ·  TOTAL $${Math.round(batch.cost).toLocaleString()} COP\n`;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], {
      type: 'text/plain;charset=utf-8'
    }));
    a.download = `receta_${sp.name.replace(/\s+/g, '_')}.txt`;
    a.click();
  };
  const CVal = ({
    av,
    bv,
    hb = true
  }) => {
    const an2 = parseFloat(av) || 0,
      bn2 = parseFloat(bv) || 0;
    const ac = an2 === bn2 ? '' : hb ? an2 > bn2 ? 'better' : 'worse' : an2 < bn2 ? 'better' : 'worse';
    const bc = an2 === bn2 ? '' : hb ? bn2 > an2 ? 'better' : 'worse' : bn2 < an2 ? 'better' : 'worse';
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: `cval ${ac}`
    }, av), /*#__PURE__*/React.createElement("span", {
      className: `cval ${bc}`
    }, bv));
  };
  const BodegaSection = () => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-val"
  }, [...new Set(invLotes.filter(l => l.activo && l.cantidadKgDisponible > 0).map(l => l.ingredienteId))].length), /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-lbl"
  }, "En stock")), /*#__PURE__*/React.createElement("div", {
    className: "inv-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-val"
  }, invLotes.filter(l => l.activo).reduce((s, l) => s + l.cantidadKgDisponible, 0).toFixed(1)), /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-lbl"
  }, "kg disp.")), /*#__PURE__*/React.createElement("div", {
    className: "inv-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-val"
  }, invCompras.length), /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-lbl"
  }, "Compras")), /*#__PURE__*/React.createElement("div", {
    className: "inv-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-val"
  }, invProveedores.length), /*#__PURE__*/React.createElement("div", {
    className: "inv-stat-lbl"
  }, "Proveedores"))), /*#__PURE__*/React.createElement("div", {
    className: "inv-subtab-bar"
  }, [['stock', 'Stock'], ['compra', 'Compra'], ['historial', 'Historial'], ['proveedores', 'Proveedores']].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: `inv-subtab${invTab === k ? ' on' : ''}`,
    onClick: () => setInvTab(k)
  }, l))), invTab === 'stock' && /*#__PURE__*/React.createElement("div", null, (() => {
    const ingIds = [...new Set(invLotes.filter(l => l.activo).map(l => l.ingredienteId))];
    if (!ingIds.length) return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '32px 20px',
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: 'var(--border-soft)',
        border: '1px dashed var(--border-soft)',
        borderRadius: 'var(--r-sm)'
      }
    }, "Sin inventario.", /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      className: "inv-btn inv-btn-pri",
      style: {
        marginTop: 12
      },
      onClick: () => setInvTab('compra')
    }, "Registrar primera compra \u2192")));
    const rows = ingIds.map(id => {
      const g = INGS.find(i => i.id === id);
      const stock = stockActual(id, invLotes);
      const pp = precioPonderado(id, invLotes);
      const alertaMin = alertaConfig[id] ?? 2;
      const alertaAm = alertaMin * 2.5;
      const dotColor = stock < alertaMin ? 'var(--coral-500)' : stock < alertaAm ? 'var(--ochre-500,#A07828)' : 'var(--accent-olive)';
      const provId = provOverride[id] || invProveedores.find(p => p.id === invCompras.find(c => c.id === invLotes.filter(l => l.activo && l.ingredienteId === id).sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso))[0]?.compraId)?.proveedorId)?.id || '';
      const prov = invProveedores.find(p => p.id === provId);
      return {
        id,
        name: g?.name || id,
        stock,
        pp,
        prov,
        dotColor,
        alertaMin,
        provId
      };
    }).sort((a, b) => b.stock - a.stock);
    const INP = {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      border: '1px solid var(--coral-500)',
      borderRadius: 'var(--r-xs)',
      padding: '4px 6px',
      background: 'var(--paper-50)',
      color: 'var(--ink-900)',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "inv-section"
    }, /*#__PURE__*/React.createElement("table", {
      className: "inv-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Ingrediente"), /*#__PURE__*/React.createElement("th", null, "Stock (kg)"), /*#__PURE__*/React.createElement("th", null, "Precio / kg"), /*#__PURE__*/React.createElement("th", null, "Proveedor"), /*#__PURE__*/React.createElement("th", null, "Alerta m\xEDn. (kg)"), /*#__PURE__*/React.createElement("th", null, "Estado"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 80
      }
    }))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => {
      const isEditing = editingRowId === r.id;
      return /*#__PURE__*/React.createElement("tr", {
        key: r.id,
        style: {
          background: isEditing ? 'var(--paper-200)' : ''
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          minWidth: 160
        }
      }, isEditing ? /*#__PURE__*/React.createElement("select", {
        value: editingRowData.ingredienteNuevoId || r.id,
        onChange: e => setEditingRowData(p => ({
          ...p,
          ingredienteNuevoId: e.target.value
        })),
        style: {
          ...INP,
          fontSize: "var(--text-sm)"
        }
      }, INGS.sort((a, b) => a.name.localeCompare(b.name, 'es')).map(i => /*#__PURE__*/React.createElement("option", {
        key: i.id,
        value: i.id
      }, i.name))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        className: "stock-dot",
        style: {
          background: r.dotColor
        }
      }), r.name)), /*#__PURE__*/React.createElement("td", {
        style: {
          fontFamily: "var(--font-num)",
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: r.dotColor,
          minWidth: 90
        }
      }, isEditing ? /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        type: "number",
        min: "0",
        step: "0.5",
        value: editingRowData.stock,
        onChange: e => setEditingRowData(p => ({
          ...p,
          stock: e.target.value
        })),
        onKeyDown: e => {
          if (e.key === 'Enter') saveRowEdit(r.id);
          if (e.key === 'Escape') setEditingRowId(null);
        },
        style: {
          ...INP,
          width: 80,
          fontWeight: 600
        }
      }) : /*#__PURE__*/React.createElement("span", null, r.stock.toFixed(1), " kg")), /*#__PURE__*/React.createElement("td", {
        style: {
          color: 'var(--ink-500)',
          minWidth: 100
        }
      }, isEditing ? /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        step: "100",
        value: editingRowData.precio,
        onChange: e => setEditingRowData(p => ({
          ...p,
          precio: e.target.value
        })),
        style: INP,
        placeholder: "$/kg"
      }) : r.pp != null ? `$${Math.round(r.pp).toLocaleString('es-CO')}/kg` : '—'), /*#__PURE__*/React.createElement("td", {
        style: {
          color: 'var(--ink-500)',
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          minWidth: 130
        }
      }, isEditing ? /*#__PURE__*/React.createElement("select", {
        value: editingRowData.proveedorId,
        onChange: e => setEditingRowData(p => ({
          ...p,
          proveedorId: e.target.value
        })),
        style: {
          ...INP,
          fontSize: "var(--text-sm)"
        }
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Sin especificar"), invProveedores.map(p => /*#__PURE__*/React.createElement("option", {
        key: p.id,
        value: p.id
      }, p.nombre))) : r.prov?.nombre || '—'), /*#__PURE__*/React.createElement("td", {
        style: {
          minWidth: 90
        }
      }, isEditing ? /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        step: "0.5",
        value: editingRowData.alertaMin,
        onChange: e => setEditingRowData(p => ({
          ...p,
          alertaMin: e.target.value
        })),
        style: INP,
        placeholder: "kg"
      }) : /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: 'var(--ink-500)'
        }
      }, r.alertaMin, " kg")), /*#__PURE__*/React.createElement("td", null, r.stock < r.alertaMin ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--coral-500)',
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          fontWeight: 700
        }
      }, "Cr\xEDtico") : r.stock < r.alertaMin * 2.5 ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--ochre-500,#A07828)',
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)"
        }
      }, "Bajo") : /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--accent-olive)',
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)"
        }
      }, "OK")), /*#__PURE__*/React.createElement("td", null, isEditing ? /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("button", {
        className: "inv-btn inv-btn-pri inv-btn-sm",
        onClick: () => saveRowEdit(r.id),
        title: "Guardar"
      }, "\u2713"), /*#__PURE__*/React.createElement("button", {
        className: "inv-btn inv-btn-sec inv-btn-sm",
        onClick: () => setEditingRowId(null),
        title: "Cancelar"
      }, "\u2715")) : /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("button", {
        className: "inv-btn inv-btn-sec inv-btn-sm",
        title: "Editar fila completa",
        onClick: () => {
          setEditingRowId(r.id);
          setEditingRowData({
            stock: r.stock.toFixed(1),
            precio: r.pp != null ? Math.round(r.pp) : '',
            proveedorId: r.provId || '',
            alertaMin: r.alertaMin,
            ingredienteNuevoId: r.id
          });
        }
      }, "\u270E Editar"), /*#__PURE__*/React.createElement("button", {
        className: "inv-btn inv-btn-sm",
        title: "Eliminar stock de este ingrediente",
        style: {
          background: 'var(--coral-500)',
          color: 'var(--paper-0)',
          border: 'none'
        },
        onClick: () => eliminarIngrediente(r.id, r.name)
      }, "\xD7"))));
    }))));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-sec inv-btn-sm",
    onClick: () => setShowAddStockForm(v => !v)
  }, "\uFF0B Agregar ingrediente al stock"), showAddStockForm && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '10px 12px',
      background: 'var(--paper-100)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      width: '100%',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "inv-input",
    style: {
      flex: 2,
      minWidth: 180
    },
    value: addStockId,
    onChange: e => setAddStockId(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Seleccionar ingrediente\u2026"), INGS.map(i => /*#__PURE__*/React.createElement("option", {
    key: i.id,
    value: i.id
  }, i.name))), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    style: {
      width: 100,
      flex: 'none'
    },
    placeholder: "kg",
    min: "0",
    step: "0.5",
    value: addStockKg,
    onChange: e => setAddStockKg(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri inv-btn-sm",
    onClick: () => {
      if (!addStockId) return;
      const kg = parseFloat(addStockKg) || 0;
      if (kg <= 0) return;
      saveStockEdit(addStockId, kg);
      setAddStockId('');
      setAddStockKg('');
      setShowAddStockForm(false);
    }
  }, "Guardar"), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-sec inv-btn-sm",
    onClick: () => {
      setShowAddStockForm(false);
      setAddStockId('');
      setAddStockKg('');
    }
  }, "Cancelar")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: 'var(--border-soft)'
    }
  }, "\u22655 kg \xB7 2\u20135 kg \xB7 <2 kg \u2014 Clic en el n\xFAmero de kg para editar directamente. Enter para guardar, Esc para cancelar."))), invTab === 'compra' && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560
    }
  }, cmpConfirm ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      background: 'var(--moss-50,#F0F4EB)',
      border: '1px solid var(--moss-300,#B8C9A0)',
      borderRadius: 'var(--r-sm)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      fontWeight: 700,
      color: 'var(--ink-800)',
      marginBottom: 2
    }
  }, "\u2713 Compra registrada"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--ink-500)'
    }
  }, cmpConfirm.proveedor || 'Sin proveedor', " \xB7 ", cmpConfirm.fecha, " \xB7 $", cmpConfirm.total.toLocaleString('es-CO'), " COP")), /*#__PURE__*/React.createElement("div", {
    className: "inv-section",
    style: {
      marginBottom: 14
    }
  }, cmpConfirm.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderBottom: i < cmpConfirm.items.length - 1 ? '1px solid var(--border-soft)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      fontWeight: 600,
      color: 'var(--ink-800)'
    }
  }, it.nombre), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: 'var(--ink-500)'
    }
  }, "+", it.kgComprado, " kg comprados")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-base)",
      fontWeight: 700,
      color: 'var(--accent-olive)'
    }
  }, it.stockNuevo.toFixed(1), " kg"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: 'var(--border-soft)'
    }
  }, "stock actual"))))), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri",
    onClick: () => setCmpConfirm(null)
  }, "\uFF0B Registrar otra compra")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 14
    }
  }, [['manual', '✎ Manual'], ['foto', '📷 Foto / PDF de recibo'], ['texto', '✉ Pegar texto']].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: "inv-btn inv-btn-sec inv-btn-sm",
    style: {
      flex: 1,
      ...(cmpMode === v ? {
        background: 'var(--ink-0)',
        color: 'var(--paper-0)',
        borderColor: 'var(--ink-0)'
      } : {})
    },
    onClick: () => {
      setCmpMode(v);
      setCmpParseErr('');
    }
  }, l))), cmpMode === 'foto' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: 14,
      border: '1px dashed var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*,application/pdf",
    ref: cmpFileRef,
    style: {
      display: 'none'
    },
    onChange: capturarFoto
  }), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri inv-btn-sm",
    disabled: cmpParsing,
    onClick: () => cmpFileRef.current && cmpFileRef.current.click()
  }, cmpParsing ? 'Leyendo recibo…' : '📷 Tomar foto / subir recibo (o PDF)'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: 'var(--border-soft)',
      marginTop: 8
    }
  }, "La foto o PDF se lee y llena los \xEDtems abajo \u2014 revisa antes de registrar."), cmpParseErr && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--coral-500)',
      marginTop: 8
    }
  }, cmpParseErr)), cmpMode === 'texto' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "inv-input",
    rows: "4",
    style: {
      width: '100%',
      resize: 'vertical',
      fontFamily: "var(--font-body)"
    },
    placeholder: "Pega aqu\xED el mensaje o correo del proveedor\u2026",
    value: cmpPasteText,
    onChange: e => setCmpPasteText(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri inv-btn-sm",
    style: {
      marginTop: 8
    },
    disabled: cmpParsing || !cmpPasteText.trim(),
    onClick: parsearTexto
  }, cmpParsing ? 'Interpretando…' : 'Interpretar texto'), cmpParseErr && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--coral-500)',
      marginTop: 8
    }
  }, cmpParseErr)), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Proveedor"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "inv-input",
    value: cmpProvId,
    onChange: e => setCmpProvId(e.target.value),
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Seleccionar\u2026"), invProveedores.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.nombre, " \u2014 ", p.municipio))), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-sec inv-btn-sm",
    style: {
      flexShrink: 0,
      padding: '9px 12px'
    },
    onClick: () => setShowProvModal(true)
  }, "\uFF0B Nuevo"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Fecha de compra"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "inv-input",
    value: cmpFecha,
    onChange: e => setCmpFecha(e.target.value)
  }))), /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "\xCDtems"), cmpItems.map(it => {
    const g = INGS.find(x => x.id === it.ingId);
    return /*#__PURE__*/React.createElement("div", {
      key: it.uid,
      style: {
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-sm)',
        padding: '10px 12px',
        marginBottom: 8,
        background: 'var(--paper-50)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("select", {
      className: "inv-input",
      style: {
        flex: 1,
        fontSize: "var(--text-sm)"
      },
      value: it.ingId,
      onChange: e => updCmpItem(it.uid, 'ingId', e.target.value)
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Seleccionar ingrediente\u2026"), INGS.map(gg => /*#__PURE__*/React.createElement("option", {
      key: gg.id,
      value: gg.id
    }, gg.name))), /*#__PURE__*/React.createElement("button", {
      className: "inv-btn inv-btn-danger inv-btn-sm",
      onClick: () => remCmpItem(it.uid),
      disabled: cmpItems.length === 1
    }, "\u2715")), !it.ingId && (it.kg || it.precio) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: 'var(--coral-500)',
        marginBottom: 8
      }
    }, "\u26A0 Sin coincidencia autom\xE1tica \u2014 elige el ingrediente."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "inv-btn inv-btn-sec inv-btn-sm",
      onClick: () => updCmpItem(it.uid, 'kg', String(Math.max(0, (parseFloat(it.kg) || 0) - 1)))
    }, "\u2212"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "inv-input",
      style: {
        width: 64,
        textAlign: 'center',
        fontSize: "var(--text-sm)"
      },
      min: "0",
      step: "0.5",
      value: it.kg,
      onChange: e => updCmpItem(it.uid, 'kg', e.target.value),
      placeholder: "kg"
    }), /*#__PURE__*/React.createElement("button", {
      className: "inv-btn inv-btn-sec inv-btn-sm",
      onClick: () => updCmpItem(it.uid, 'kg', String((parseFloat(it.kg) || 0) + 1))
    }, "\uFF0B"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)'
      }
    }, "kg")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "inv-input",
      style: {
        width: 90,
        fontSize: "var(--text-sm)"
      },
      min: "0",
      step: "100",
      value: it.precio,
      onChange: e => updCmpItem(it.uid, 'precio', e.target.value),
      placeholder: "$/kg"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        marginLeft: 'auto',
        whiteSpace: 'nowrap'
      }
    }, "$", ((parseFloat(it.kg) || 0) * (parseFloat(it.precio) || 0)).toLocaleString('es-CO'))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-sec inv-btn-sm",
    onClick: addCmpItem
  }, "\uFF0B Agregar \xEDtem"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      fontWeight: 700,
      color: 'var(--ink-800)'
    }
  }, "Total: $", cmpItems.reduce((s, it) => s + (parseFloat(it.kg) || 0) * (parseFloat(it.precio) || 0), 0).toLocaleString('es-CO'), " COP")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri",
    onClick: registrarCompra
  }, "\u2713 Registrar compra"), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-sec",
    onClick: () => {
      setCmpItems([{
        uid: Date.now(),
        ingId: '',
        kg: '',
        precio: ''
      }]);
      setCmpProvId('');
      setCmpFecha(new Date().toISOString().split('T')[0]);
      setCmpMode('manual');
      setCmpPasteText('');
    }
  }, "\u2715 Limpiar")))), invTab === 'historial' && /*#__PURE__*/React.createElement("div", null, invCompras.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '32px 20px',
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--border-soft)',
      border: '1px dashed var(--border-soft)',
      borderRadius: 'var(--r-sm)'
    }
  }, "Sin compras registradas.", /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri",
    style: {
      marginTop: 12
    },
    onClick: () => setInvTab('compra')
  }, "Registrar primera compra \u2192"))) : (() => {
    const byMonth = {};
    [...invCompras].sort((a, b) => b.fecha.localeCompare(a.fecha)).forEach(c => {
      const mes = c.fecha.slice(0, 7);
      if (!byMonth[mes]) byMonth[mes] = [];
      byMonth[mes].push(c);
    });
    return Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([mes, cmpras]) => {
      const totalMes = cmpras.reduce((s, c) => s + c.items.reduce((si, it) => si + (it.kg || 0) * (it.precio || 0), 0), 0);
      const collapsed = !!collapsedMonths[mes];
      const [yr, mo] = mes.split('-');
      const label = new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleDateString('es-CO', {
        month: 'long',
        year: 'numeric'
      });
      return /*#__PURE__*/React.createElement("div", {
        key: mes,
        className: "inv-month-group"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inv-month-head",
        onClick: () => setCollapsedMonths(prev => ({
          ...prev,
          [mes]: !prev[mes]
        }))
      }, /*#__PURE__*/React.createElement("span", {
        className: "inv-month-label"
      }, label), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "inv-month-total"
      }, "$", totalMes.toLocaleString('es-CO'), " COP"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: 'var(--border-soft)'
        }
      }, collapsed ? '▶' : '▼'))), !collapsed && /*#__PURE__*/React.createElement("table", {
        className: "inv-table"
      }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Fecha"), /*#__PURE__*/React.createElement("th", null, "Proveedor"), /*#__PURE__*/React.createElement("th", null, "\xCDtems"), /*#__PURE__*/React.createElement("th", null, "Total COP"), /*#__PURE__*/React.createElement("th", null, "Fuente"))), /*#__PURE__*/React.createElement("tbody", null, cmpras.map(c => {
        const prov = invProveedores.find(p => p.id === c.proveedorId);
        const tot = c.items.reduce((s, it) => s + (it.kg || 0) * (it.precio || 0), 0);
        return /*#__PURE__*/React.createElement("tr", {
          key: c.id
        }, /*#__PURE__*/React.createElement("td", null, c.fecha), /*#__PURE__*/React.createElement("td", {
          style: {
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)"
          }
        }, prov?.nombre || c.proveedorId), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3
          }
        }, c.items.map((it, i) => {
          const g = INGS.find(x => x.id === it.ingredienteId);
          return /*#__PURE__*/React.createElement("span", {
            key: i,
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              padding: '1px 5px',
              background: 'var(--paper-100)',
              border: '1px solid var(--paper-300)',
              color: 'var(--ink-500)',
              borderRadius: 2
            }
          }, g?.name || it.ingredienteId, " ", it.kg, "kg");
        }))), /*#__PURE__*/React.createElement("td", {
          style: {
            fontFamily: "var(--font-num)",
            fontSize: "var(--text-base)",
            color: 'var(--coral-700)'
          }
        }, "$", tot.toLocaleString('es-CO')), /*#__PURE__*/React.createElement("td", {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            color: 'var(--ink-700)',
            fontWeight: 500
          }
        }, c.fuenteCaptura));
      }))));
    });
  })()), invTab === 'proveedores' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri",
    onClick: () => setShowProvModal(true)
  }, "\uFF0B Agregar proveedor")), invProveedores.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 24,
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--border-soft)'
    }
  }, "Sin proveedores. Agrega el primero.") : /*#__PURE__*/React.createElement("div", {
    className: "inv-section"
  }, invProveedores.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "prov-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "prov-tipo-chip"
  }, p.tipo), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prov-name"
  }, p.nombre), /*#__PURE__*/React.createElement("div", {
    className: "prov-muni"
  }, p.municipio)), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-danger inv-btn-sm",
    onClick: () => eliminarProveedor(p.id)
  }, "\u2715")))))), showProvModal && /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-bg",
    onClick: e => {
      if (e.target === e.currentTarget) setShowProvModal(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-title"
  }, "Nuevo Proveedor"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Nombre"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    value: newProv.nombre,
    onChange: e => setNewProv(p => ({
      ...p,
      nombre: e.target.value
    })),
    placeholder: "Ej. Distribuidora Agro Sabana"
  })), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Tipo"), /*#__PURE__*/React.createElement("select", {
    className: "inv-input",
    value: newProv.tipo,
    onChange: e => setNewProv(p => ({
      ...p,
      tipo: e.target.value
    }))
  }, [['plaza', 'Plaza de mercado'], ['industrial', 'Industrial'], ['artesanal', 'Artesanal'], ['directo', 'Directo / Finca'], ['otro', 'Otro']].map(([v, l]) => /*#__PURE__*/React.createElement("option", {
    key: v,
    value: v
  }, l)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Municipio"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    value: newProv.municipio,
    onChange: e => setNewProv(p => ({
      ...p,
      municipio: e.target.value
    })),
    placeholder: "Ej. Tenjo"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-sec",
    onClick: () => setShowProvModal(false)
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "inv-btn inv-btn-pri",
    onClick: agregarProveedor
  }, "Guardar proveedor")))));
  const BitacoraSection = () => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      paddingBottom: 0,
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-subtab-bar",
    style: {
      marginBottom: 0
    }
  }, [['bit_dash', 'Dashboard'], ['bit_bolsas', 'Bolsas'], ['bit_cosechas', 'Cosechas'], ['bit_comparador', 'Comparador'], ['bit_ficha', 'Ficha']].map(([k, label]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: 'inv-subtab' + (bitTab === k ? ' on' : ''),
    onClick: () => setBitTab(k),
    disabled: k !== 'bit_dash' && k !== 'bit_comparador' && !bitActiveLoteId,
    style: {
      opacity: k !== 'bit_dash' && k !== 'bit_comparador' && !bitActiveLoteId ? 0.4 : 1
    }
  }, label)), bitActiveLoteId && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: 'var(--ink-500)',
      marginLeft: 'auto',
      alignSelf: 'center',
      paddingRight: 4
    }
  }, bitLotes.find(lt => lt.id === bitActiveLoteId)?.codigo))), bitTab === 'bit_dash' && /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec",
    style: {
      marginBottom: 0,
      borderBottom: 'none'
    }
  }, "Lotes experimentales ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: 'var(--ink-500)',
      fontWeight: 400
    }
  }, "(", bitLotes.length, ")")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setBitDashView('grid'),
    style: {
      padding: '6px 12px',
      background: bitDashView === 'grid' ? 'var(--ink-900)' : 'var(--paper-50)',
      color: bitDashView === 'grid' ? 'var(--paper-0)' : 'var(--ink-700)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-xs)',
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-sm)",
      cursor: 'pointer',
      transition: 'all .12s'
    }
  }, "\u229E Cuadr\xEDcula"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setBitDashView('tabla'),
    style: {
      padding: '6px 12px',
      background: bitDashView === 'tabla' ? 'var(--ink-900)' : 'var(--paper-50)',
      color: bitDashView === 'tabla' ? 'var(--paper-0)' : 'var(--ink-700)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-xs)',
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-sm)",
      cursor: 'pointer',
      transition: 'all .12s'
    }
  }, "\u2261 Tabla"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setBitNuevoForm(buildBitNuevoForm());
      setShowBitNuevo(true);
    },
    className: "inv-btn inv-btn-pri"
  }, "+ Nueva prueba"))), bitLotes.length > 0 && (() => {
    const allStats = bitLotes.map(lt => ({
      lt,
      s: calcLoteStats(lt.id)
    }));
    const wd = allStats.filter(x => x.s && x.s.totalFresco > 0);
    const avgBE = wd.length ? wd.reduce((s, x) => s + (x.s.be || 0), 0) / wd.length : null;
    const ws = allStats.filter(x => x.s);
    const avgCont = ws.length ? ws.reduce((s, x) => s + (x.s.contPct || 0), 0) / ws.length : null;
    const totalKg = allStats.reduce((s, x) => s + (x.s?.totalFresco || 0), 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-row",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val"
    }, bitLotes.length), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "Lotes")), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val"
    }, avgBE != null ? avgBE.toFixed(0) + '%' : '—'), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "BE media")), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val",
      style: {
        color: avgCont != null && avgCont > 15 ? 'var(--coral-700)' : 'inherit'
      }
    }, avgCont != null ? avgCont.toFixed(0) + '%' : '—'), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "Contam. media")), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val"
    }, totalKg.toFixed(2), " kg"), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "Cosechado")));
  })(), bitLotes.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '48px 20px',
      color: 'var(--ink-500)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-base)",
      border: '1px dashed var(--border-soft)',
      borderRadius: 'var(--r-md)'
    }
  }, "Sin lotes experimentales registrados.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setBitNuevoForm(buildBitNuevoForm());
      setShowBitNuevo(true);
    },
    className: "inv-btn inv-btn-pri",
    style: {
      marginTop: 14
    }
  }, "+ Crear primer lote")), bitLotes.length > 0 && bitDashView === 'grid' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 14
    }
  }, bitLotes.map(lote => {
    const stats = calcLoteStats(lote.id);
    const score = stats ? calcLoteScore(stats) : null;
    const EC = {
      incubacion: 'var(--ochre-500)',
      fructificacion: 'var(--moss-500)',
      completado: 'var(--coral-700)',
      descartado: 'var(--ink-400)'
    };
    return /*#__PURE__*/React.createElement("div", {
      key: lote.id,
      className: "panel",
      style: {
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        margin: 0,
        transition: 'box-shadow .18s,transform .18s'
      },
      onClick: () => {
        setBitActiveLoteId(lote.id);
        setBitTab('bit_bolsas');
      },
      onMouseEnter: e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lift)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = '';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        borderBottom: '1px solid var(--paper-300)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)',
        marginBottom: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, lote.codigo), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-base)",
        color: 'var(--ink-900)',
        lineHeight: 1.2
      }
    }, lote.especie || '—'), lote.especieCientifico && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sci)',
        fontStyle: 'italic',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-600)',
        marginTop: 1
      }
    }, lote.especieCientifico)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '2px 7px',
        borderRadius: 10,
        background: EC[lote.estado] || 'var(--ink-400)',
        color: 'var(--paper-0)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)'
      }
    }, lote.estado), score !== null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 22,
        color: 'var(--coral-700)',
        lineHeight: 1
      }
    }, score, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-400)'
      }
    }, "/100")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 1,
        background: 'var(--paper-300)'
      }
    }, [['Sanas', stats ? `${stats.bolsasSanas}/${stats.numBolsas}` : '—'], ['BE', stats?.be != null ? stats.be.toFixed(0) + '%' : '—'], ['Cosecha', stats?.totalFresco ? stats.totalFresco.toFixed(2) + ' kg' : '—']].map(([lb, v]) => /*#__PURE__*/React.createElement("div", {
      key: lb,
      style: {
        background: 'var(--paper-50)',
        padding: '8px 4px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-2xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-700)',
        marginBottom: 2
      }
    }, lb), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: "var(--text-md)",
        color: 'var(--ink-900)'
      }
    }, v)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '6px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--paper-100)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)'
      }
    }, lote.fechaInoculacion), lote.veredicto ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '2px 7px',
        borderRadius: 10,
        background: 'var(--moss-200)',
        color: 'var(--moss-700)',
        fontWeight: 700
      }
    }, lote.veredicto) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-400)'
      }
    }, "sin veredicto")));
  })), bitLotes.length > 0 && bitDashView === 'tabla' && /*#__PURE__*/React.createElement("div", {
    className: "inv-section"
  }, /*#__PURE__*/React.createElement("table", {
    className: "inv-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "C\xF3digo"), /*#__PURE__*/React.createElement("th", null, "Especie"), /*#__PURE__*/React.createElement("th", null, "Fecha inoc."), /*#__PURE__*/React.createElement("th", null, "Bolsas"), /*#__PURE__*/React.createElement("th", null, "BE"), /*#__PURE__*/React.createElement("th", null, "Contam."), /*#__PURE__*/React.createElement("th", null, "Cosecha"), /*#__PURE__*/React.createElement("th", null, "Score"), /*#__PURE__*/React.createElement("th", null, "Estado"), /*#__PURE__*/React.createElement("th", null, "Veredicto"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, bitLotes.map(lote => {
    const stats = calcLoteStats(lote.id);
    const score = stats ? calcLoteScore(stats) : null;
    return /*#__PURE__*/React.createElement("tr", {
      key: lote.id,
      style: {
        cursor: 'pointer'
      },
      onClick: () => {
        setBitActiveLoteId(lote.id);
        setBitTab('bit_bolsas');
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        whiteSpace: 'nowrap'
      }
    }, lote.codigo), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 700
      }
    }, lote.especie), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)"
      }
    }, lote.fechaInoculacion), /*#__PURE__*/React.createElement("td", null, stats ? `${stats.bolsasSanas}/${stats.numBolsas}` : lote.numBolsas), /*#__PURE__*/React.createElement("td", {
      style: {
        color: stats?.be > 80 ? 'var(--moss-700)' : stats?.be > 60 ? 'var(--ochre-600)' : 'var(--coral-700)',
        fontWeight: 700
      }
    }, stats?.be != null ? stats.be.toFixed(0) + '%' : '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        color: stats?.contPct > 20 ? 'var(--coral-700)' : 'inherit'
      }
    }, stats?.contPct != null ? stats.contPct.toFixed(0) + '%' : '—'), /*#__PURE__*/React.createElement("td", null, stats?.totalFresco ? stats.totalFresco.toFixed(2) + ' kg' : '0 kg'), /*#__PURE__*/React.createElement("td", null, score !== null ? score + '/100' : '—'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '2px 6px',
        borderRadius: 8,
        background: 'var(--paper-300)'
      }
    }, lote.estado)), /*#__PURE__*/React.createElement("td", null, lote.veredicto ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '2px 6px',
        borderRadius: 8,
        background: 'var(--moss-200)',
        color: 'var(--moss-700)'
      }
    }, lote.veredicto) : '—'), /*#__PURE__*/React.createElement("td", {
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("button", {
      className: "inv-btn inv-btn-sec inv-btn-sm",
      onClick: () => deleteBitLote(lote.id)
    }, "\u2715")));
  }))))), bitTab === 'bit_bolsas' && bitActiveLoteId && (() => {
    const lote = bitLotes.find(lt => lt.id === bitActiveLoteId);
    if (!lote) return null;
    const bolsas = bitBolsas.filter(b => b.loteId === bitActiveLoteId);
    const stats = calcLoteStats(bitActiveLoteId);
    const EB = {
      sana: {
        c: 'var(--moss-700)',
        l: 'Sana'
      },
      contaminada: {
        c: 'var(--coral-700)',
        l: 'Contaminada'
      },
      dudosa: {
        c: 'var(--ochre-500)',
        l: 'Dudosa'
      },
      descartada: {
        c: 'var(--ink-400)',
        l: 'Descartada'
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "panel"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        flexWrap: 'wrap',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-500)'
      }
    }, lote.codigo), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: 17,
        color: 'var(--ink-900)'
      }
    }, lote.especie), lote.especieCientifico && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sci)',
        fontStyle: 'italic',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-600)'
      }
    }, lote.especieCientifico)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: lote.veredicto || '',
      onChange: e => updateBitLote(lote.id, {
        veredicto: e.target.value
      }),
      className: "inv-input",
      style: {
        width: 'auto',
        fontSize: "var(--text-sm)",
        padding: '6px 10px'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "\u2014 veredicto \u2014"), ['prometedora', 'descartar', 'repetir', 'ajustar humedad', 'riesgo contaminación', 'buena para escalar'].map(v => /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, v))), /*#__PURE__*/React.createElement("select", {
      value: lote.estado,
      onChange: e => updateBitLote(lote.id, {
        estado: e.target.value
      }),
      className: "inv-input",
      style: {
        width: 'auto',
        fontSize: "var(--text-sm)",
        padding: '6px 10px'
      }
    }, ['incubacion', 'fructificacion', 'completado', 'descartado'].map(st => /*#__PURE__*/React.createElement("option", {
      key: st,
      value: st
    }, st))))), stats && /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-row",
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val"
    }, stats.bolsasSanas, "/", stats.numBolsas), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "Sanas")), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val",
      style: {
        color: stats.contPct > 20 ? 'var(--coral-700)' : 'inherit'
      }
    }, stats.contPct.toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "Contam.")), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val"
    }, stats.be != null ? stats.be.toFixed(0) + '%' : '—'), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "BE")), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-val"
    }, stats.totalFresco.toFixed(3), " kg"), /*#__PURE__*/React.createElement("div", {
      className: "inv-stat-lbl"
    }, "Cosechado"))), /*#__PURE__*/React.createElement("div", {
      className: "inv-section"
    }, /*#__PURE__*/React.createElement("table", {
      className: "inv-table bolsas-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "C\xF3digo"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Estado"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Col 25%"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Col 50%"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Col 100%"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Observaciones"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Foto"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Cosechas"))), /*#__PURE__*/React.createElement("tbody", null, bolsas.map(bolsa => {
      const cosBolsa = bitCosechas.filter(c => c.bolsaId === bolsa.id);
      const totalBolsa = cosBolsa.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0);
      const est = EB[bolsa.estado] || EB.sana;
      return /*#__PURE__*/React.createElement("tr", {
        key: bolsa.id
      }, /*#__PURE__*/React.createElement("td", {
        "data-label": "C\xF3digo",
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          whiteSpace: 'nowrap'
        }
      }, bolsa.codigo), /*#__PURE__*/React.createElement("td", {
        "data-label": "Estado"
      }, /*#__PURE__*/React.createElement("select", {
        value: bolsa.estado,
        onChange: e => updateBitBolsa(bolsa.id, {
          estado: e.target.value
        }),
        style: {
          width: '100%',
          padding: '3px 4px',
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          border: `1px solid ${est.c}`,
          borderRadius: 3,
          background: 'var(--paper-50)',
          color: est.c,
          cursor: 'pointer'
        }
      }, Object.entries(EB).map(([k, v]) => /*#__PURE__*/React.createElement("option", {
        key: k,
        value: k
      }, v.l)))), [['col25', 'Col 25%'], ['col50', 'Col 50%'], ['col100', 'Col 100%']].map(([f, lbl]) => /*#__PURE__*/React.createElement("td", {
        key: f,
        "data-label": lbl
      }, /*#__PURE__*/React.createElement("input", {
        type: "date",
        value: bolsa[f] || '',
        onChange: e => updateBitBolsa(bolsa.id, {
          [f]: e.target.value
        }),
        style: {
          width: '100%',
          padding: '2px 3px',
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          border: '1px solid var(--paper-300)',
          borderRadius: 3,
          background: 'var(--paper-50)'
        }
      }))), /*#__PURE__*/React.createElement("td", {
        "data-label": "Observaciones"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: bolsa.observaciones || '',
        placeholder: "\u2026",
        onChange: e => updateBitBolsa(bolsa.id, {
          observaciones: e.target.value
        }),
        style: {
          width: '100%',
          padding: '2px 5px',
          fontFamily: 'var(--font-body)',
          fontSize: "var(--text-sm)",
          border: '1px solid var(--paper-300)',
          borderRadius: 3,
          background: 'var(--paper-50)'
        }
      })), /*#__PURE__*/React.createElement("td", {
        "data-label": "Foto",
        style: {
          textAlign: 'center'
        }
      }, bolsa.foto ? /*#__PURE__*/React.createElement("img", {
        src: bolsa.foto,
        alt: "",
        style: {
          width: 28,
          height: 28,
          objectFit: 'cover',
          borderRadius: 3,
          cursor: 'pointer',
          display: 'block',
          margin: '0 auto'
        },
        onClick: () => updateBitBolsa(bolsa.id, {
          foto: null
        }),
        title: "Clic para quitar"
      }) : /*#__PURE__*/React.createElement("label", {
        style: {
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          color: 'var(--coral-500)',
          textDecoration: 'underline',
          display: 'block',
          textAlign: 'center'
        }
      }, "+foto", /*#__PURE__*/React.createElement("input", {
        type: "file",
        accept: "image/*",
        style: {
          display: 'none'
        },
        onChange: e => {
          const f = e.target.files?.[0];
          if (!f) return;
          compressImageToDataURL(f).then(dataUrl => updateBitBolsa(bolsa.id, {
            foto: dataUrl
          })).catch(() => setNoticeDlg({
            title: 'No se pudo procesar la foto',
            msg: 'Intenta con otra imagen.'
          }));
          e.target.value = '';
        }
      }))), /*#__PURE__*/React.createElement("td", {
        "data-label": "Cosechas"
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-num)',
          fontSize: "var(--text-base)"
        }
      }, totalBolsa > 0 ? (totalBolsa / 1000).toFixed(3) + ' kg' : '—'), /*#__PURE__*/React.createElement("button", {
        className: "inv-btn inv-btn-sec inv-btn-sm",
        onClick: () => {
          setBitCosechaForm({
            bolsaId: bolsa.id,
            loteId: bitActiveLoteId,
            codigo: bolsa.codigo,
            flush: cosBolsa.length + 1,
            fecha: new Date().toISOString().split('T')[0],
            pesoFresco: '',
            calidad: 4,
            observaciones: ''
          });
          setShowBitCosecha(true);
        }
      }, "+"))));
    })))));
  })(), bitTab === 'bit_cosechas' && bitActiveLoteId && (() => {
    const lote = bitLotes.find(lt => lt.id === bitActiveLoteId);
    if (!lote) return null;
    const bolsas = bitBolsas.filter(b => b.loteId === bitActiveLoteId);
    const cosechas = [...bitCosechas.filter(c => c.loteId === bitActiveLoteId)].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const stats = calcLoteStats(bitActiveLoteId);
    return /*#__PURE__*/React.createElement("div", {
      className: "panel"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sec",
      style: {
        marginBottom: 0,
        borderBottom: 'none'
      }
    }, "Cosechas \u2014 ", lote.codigo), /*#__PURE__*/React.createElement("button", {
      className: "inv-btn inv-btn-pri",
      onClick: () => {
        const fb = bolsas.find(b => b.estado === 'sana');
        setBitCosechaForm({
          bolsaId: fb?.id || '',
          loteId: bitActiveLoteId,
          codigo: fb?.codigo || '',
          flush: 1,
          fecha: new Date().toISOString().split('T')[0],
          pesoFresco: '',
          calidad: 4,
          observaciones: ''
        });
        setShowBitCosecha(true);
      }
    }, "+ Registrar cosecha")), stats && stats.totalFresco > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 1,
        background: 'var(--border-soft)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-sm)',
        overflow: 'hidden',
        marginBottom: 14
      }
    }, [['Total fresco', stats.totalFresco.toFixed(3) + ' kg'], ['BE estimada', stats.be != null ? stats.be.toFixed(1) + '%' : '—'], ['kg/bolsa sana', stats.bolsasSanas > 0 ? (stats.totalFresco / stats.bolsasSanas).toFixed(3) + ' kg' : '—'], ['Costo/kg', stats.costoKg != null ? '$' + Math.round(stats.costoKg).toLocaleString('es-CO') : '—']].map(([lb, v]) => /*#__PURE__*/React.createElement("div", {
      key: lb,
      style: {
        background: 'var(--paper-50)',
        padding: '10px 8px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-700)',
        marginBottom: 3
      }
    }, lb), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 18,
        color: 'var(--ink-900)'
      }
    }, v)))), cosechas.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '32px',
        color: 'var(--ink-500)',
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        border: '1px dashed var(--border-soft)',
        borderRadius: 'var(--r-sm)'
      }
    }, "Sin cosechas registradas a\xFAn."), cosechas.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "inv-section"
    }, /*#__PURE__*/React.createElement("table", {
      className: "inv-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Bolsa"), /*#__PURE__*/React.createElement("th", null, "Flush"), /*#__PURE__*/React.createElement("th", null, "Fecha"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Peso fresco (g)"), /*#__PURE__*/React.createElement("th", null, "Calidad"), /*#__PURE__*/React.createElement("th", null, "Observaciones"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, cosechas.map(c => /*#__PURE__*/React.createElement("tr", {
      key: c.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)"
      }
    }, c.codigo), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: "var(--text-base)",
        textAlign: 'center'
      }
    }, c.flush), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)"
      }
    }, c.fecha), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        fontFamily: 'var(--font-num)',
        fontSize: "var(--text-base)"
      }
    }, c.pesoFresco), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center',
        fontSize: "var(--text-sm)"
      }
    }, '★'.repeat(c.calidad || 0)), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-600)'
      }
    }, c.observaciones), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
      className: "inv-btn inv-btn-sec inv-btn-sm",
      onClick: () => deleteBitCosecha(c.id)
    }, "\u2715")))), /*#__PURE__*/React.createElement("tr", {
      style: {
        borderTop: '2px solid var(--ink-900)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: 3,
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-sm)",
        padding: '7px 12px'
      }
    }, "Total"), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        fontFamily: 'var(--font-num)',
        fontSize: "var(--text-base)",
        fontWeight: 700,
        padding: '7px 12px'
      }
    }, cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0).toFixed(0), " g"), /*#__PURE__*/React.createElement("td", {
      colSpan: 3
    }))))));
  })(), bitTab === 'bit_comparador' && (() => {
    const lotesConDatos = bitLotes.filter(lt => {
      const s = calcLoteStats(lt.id);
      return s && (s.totalFresco > 0 || s.numBolsas > 0);
    });
    return /*#__PURE__*/React.createElement("div", {
      className: "panel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sec"
    }, "Comparador de recetas"), lotesConDatos.length < 2 && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '32px',
        color: 'var(--ink-500)',
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        border: '1px dashed var(--border-soft)',
        borderRadius: 'var(--r-sm)'
      }
    }, "Necesitas al menos 2 lotes para comparar. Actualmente: ", lotesConDatos.length, "."), lotesConDatos.length >= 2 && /*#__PURE__*/React.createElement("div", {
      className: "inv-section"
    }, /*#__PURE__*/React.createElement("table", {
      className: "inv-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Lote / Receta"), /*#__PURE__*/React.createElement("th", null, "Especie"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Contam."), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "D\xEDas col."), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "BE"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "kg/bolsa"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Costo/kg"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'center'
      }
    }, "Score"), /*#__PURE__*/React.createElement("th", null, "Veredicto"))), /*#__PURE__*/React.createElement("tbody", null, lotesConDatos.map(lote => {
      const stats = calcLoteStats(lote.id);
      const score = calcLoteScore(stats);
      const VC = {
        'prometedora': 'var(--moss-500)',
        'descartar': 'var(--coral-700)',
        'buena para escalar': 'var(--moss-700)',
        'riesgo contaminación': 'var(--ochre-500)',
        'repetir': 'var(--ink-600)',
        'ajustar humedad': 'var(--ochre-600)'
      };
      return /*#__PURE__*/React.createElement("tr", {
        key: lote.id
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-sm)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: 'var(--ink-900)'
        }
      }, lote.codigo), lote.recipeRef && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: 'var(--ink-500)'
        }
      }, lote.recipeRef.name)), /*#__PURE__*/React.createElement("td", {
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: "var(--text-base)"
        }
      }, lote.especie), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'right',
          color: stats?.contPct > 20 ? 'var(--coral-700)' : 'var(--moss-700)',
          fontWeight: 700
        }
      }, stats?.contPct != null ? stats.contPct.toFixed(0) + '%' : '—'), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'right'
        }
      }, stats?.diasCol != null ? stats.diasCol.toFixed(1) + 'd' : '—'), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'right',
          fontWeight: 700,
          color: stats?.be > 80 ? 'var(--moss-700)' : stats?.be > 60 ? 'var(--ochre-600)' : 'var(--coral-700)'
        }
      }, stats?.be != null ? stats.be.toFixed(0) + '%' : '—'), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'right'
        }
      }, stats?.bolsasSanas > 0 && stats.totalFresco ? (stats.totalFresco / stats.bolsasSanas).toFixed(3) + ' kg' : '—'), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'right'
        }
      }, stats?.costoKg != null ? '$' + Math.round(stats.costoKg).toLocaleString('es-CO') : '—'), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'center',
          fontFamily: 'var(--font-num)',
          fontSize: "var(--text-md)",
          color: 'var(--coral-700)',
          fontWeight: 700
        }
      }, score !== null ? score : '—'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("select", {
        value: lote.veredicto || '',
        onChange: e => updateBitLote(lote.id, {
          veredicto: e.target.value
        }),
        style: {
          padding: '4px 7px',
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-sm)",
          border: '1px solid var(--border-soft)',
          borderRadius: 4,
          background: 'var(--paper-50)',
          color: VC[lote.veredicto] || 'var(--ink-700)',
          width: '100%'
        }
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "\u2014 sin veredicto \u2014"), ['prometedora', 'descartar', 'repetir', 'ajustar humedad', 'riesgo contaminación', 'buena para escalar'].map(v => /*#__PURE__*/React.createElement("option", {
        key: v,
        value: v
      }, v)))));
    })))));
  })(), bitTab === 'bit_ficha' && bitActiveLoteId && (() => {
    const lote = bitLotes.find(lt => lt.id === bitActiveLoteId);
    if (!lote) return null;
    const cosechas = [...bitCosechas.filter(c => c.loteId === bitActiveLoteId)].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const stats = calcLoteStats(bitActiveLoteId);
    const score = stats ? calcLoteScore(stats) : null;
    return /*#__PURE__*/React.createElement("div", {
      className: "panel prod-sheet",
      style: {
        padding: '26px 28px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid var(--ink-900)',
        paddingBottom: 12,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)'
      }
    }, "Setas de la Pe\xF1a \xB7 Bit\xE1cora experimental"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 26,
        fontWeight: 700,
        color: 'var(--ink-900)',
        lineHeight: 1.1,
        marginTop: 2
      }
    }, "Ficha experimental"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-base)",
        color: 'var(--ink-900)',
        marginTop: 2
      }
    }, lote.especie, lote.especieCientifico && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 ", /*#__PURE__*/React.createElement("i", null, lote.especieCientifico)))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-500)'
      }
    }, /*#__PURE__*/React.createElement("div", null, "Lote: ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-900)'
      }
    }, lote.codigo)), /*#__PURE__*/React.createElement("div", null, "Inoculaci\xF3n: ", lote.fechaInoculacion), /*#__PURE__*/React.createElement("div", null, lote.numBolsas, " bolsas \xD7 ", lote.pesoHumedo, " kg \xB7 ", lote.humedad, "% H\u2082O"), lote.veredicto && /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: 'var(--moss-700)',
        marginTop: 4
      }
    }, lote.veredicto))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-800)',
        marginBottom: 6
      }
    }, "Datos del experimento"), [['Cepa/proveedor', lote.cepa || '—'], ['Operador', lote.operador || '—'], ['Humedad obj.', lote.humedad + '%'], ['Tratamiento', lote.tratamiento || '—'], ['Objetivo', lote.objetivo || '—']].map(([lb, v]) => /*#__PURE__*/React.createElement("div", {
      key: lb,
      style: {
        display: 'flex',
        gap: 8,
        padding: '3px 0',
        borderBottom: '1px solid var(--paper-300)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        width: 110,
        flexShrink: 0
      }
    }, lb), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-900)'
      }
    }, v)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-800)',
        marginBottom: 6
      }
    }, "Resultados"), [['Bolsas sanas', stats ? `${stats.bolsasSanas}/${stats.numBolsas}` : '—'], ['Contaminación', stats ? stats.contPct.toFixed(0) + '%' : '—'], ['BE estimada', stats?.be != null ? stats.be.toFixed(1) + '%' : '—'], ['Total cosechado', stats ? stats.totalFresco.toFixed(3) + ' kg' : '—'], ['Score', score !== null ? score + '/100' : '—']].map(([lb, v]) => /*#__PURE__*/React.createElement("div", {
      key: lb,
      style: {
        display: 'flex',
        gap: 8,
        padding: '3px 0',
        borderBottom: '1px solid var(--paper-300)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        width: 110,
        flexShrink: 0
      }
    }, lb), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: "var(--text-base)",
        color: 'var(--ink-900)'
      }
    }, v))))), lote.recipeRef && /*#__PURE__*/React.createElement("div", {
      style: {
        border: '1px solid var(--paper-300)',
        padding: '10px 14px',
        marginBottom: 14,
        background: 'var(--paper-50)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-900)',
        marginBottom: 5
      }
    }, "Receta vinculada \u2014 ", lote.recipeRef.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        marginBottom: 5
      }
    }, lote.recipeRef.recipe.map(r => {
      const g = INGS.find(i => i.id === r.id);
      return g ? /*#__PURE__*/React.createElement("span", {
        key: r.id,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          padding: '2px 6px',
          background: 'var(--paper-200)',
          border: '1px solid var(--paper-300)',
          borderRadius: 3
        }
      }, g.name, " ", parseFloat(r.p).toFixed(1), "%") : null;
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)'
      }
    }, "C:N ", lote.recipeRef.cn, " \xB7 EB ~", lote.recipeRef.eb, "% \xB7 Score ", lote.recipeRef.score, "/100", lote.recipeRef.cost ? ` · $${lote.recipeRef.cost.toLocaleString('es-CO')}/kg` : '')), cosechas.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-900)',
        marginBottom: 6
      }
    }, "Registro de cosechas"), /*#__PURE__*/React.createElement("table", {
      className: "prod-tbl",
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Bolsa"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'center'
      }
    }, "Flush"), /*#__PURE__*/React.createElement("th", null, "Fecha"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Peso fresco (g)"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'center'
      }
    }, "Calidad"), /*#__PURE__*/React.createElement("th", null, "Obs."))), /*#__PURE__*/React.createElement("tbody", null, cosechas.map(c => /*#__PURE__*/React.createElement("tr", {
      key: c.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)"
      }
    }, c.codigo), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, c.flush), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)"
      }
    }, c.fecha), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, c.pesoFresco), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, '★'.repeat(c.calidad || 0)), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-600)'
      }
    }, c.observaciones))), /*#__PURE__*/React.createElement("tr", {
      className: "tot"
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: 3
    }, "Total"), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0).toFixed(0), " g"), /*#__PURE__*/React.createElement("td", {
      colSpan: 2
    }))))), lote.notas && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        padding: '8px 12px',
        background: 'var(--paper-100)',
        border: '1px solid var(--paper-300)',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("b", null, "Notas:"), " ", lote.notas), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        paddingTop: 12,
        borderTop: '2px solid var(--ink-900)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-400)'
      }
    }, "Setas de la Pe\xF1a \xB7 Tenjo 2.600 msnm \xB7 ", new Date().toLocaleDateString('es-CO')), /*#__PURE__*/React.createElement("button", {
      className: "no-print",
      onClick: () => window.print(),
      style: {
        padding: '7px 14px',
        background: 'var(--coral-500)',
        color: 'var(--paper-0)',
        border: 'none',
        borderRadius: 'var(--r-sm)',
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-sm)",
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        cursor: 'pointer'
      }
    }, "Imprimir ficha")));
  })());
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "topbar-mark",
    onClick: () => goTab('catalogo'),
    style: {
      cursor: 'pointer'
    }
  }, "Setas de la Pe\xF1a")), /*#__PURE__*/React.createElement("nav", {
    className: "fos-rail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fos-rail-mark",
    style: {
      position: 'relative',
      width: 91,
      height: 106,
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'center',
      fontStyle: 'normal',
      fontSize: 17,
      display: 'block'
    }
  }, "Setas"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-md)",
      lineHeight: 0.95,
      position: 'absolute',
      left: 30,
      top: 49,
      fontStyle: 'italic',
      letterSpacing: '-0.1px'
    }
  }, "de la"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      lineHeight: 1,
      position: 'absolute',
      left: 27,
      top: 65
    }
  }, "Pe\xF1a")), NAV_GROUPS.map(g => {
    const on = g.tabs.includes(tab);
    return /*#__PURE__*/React.createElement("button", {
      key: g.key,
      className: 'fos-rail-btn' + (on ? ' on' : ''),
      onClick: () => goTab(g.tabs[0])
    }, g.icon, /*#__PURE__*/React.createElement("span", null, g.label));
  })), /*#__PURE__*/React.createElement("header", {
    className: "hero",
    style: {
      display: tab === 'inicio' ? 'none' : undefined
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-copy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-eyebrow"
  }, "Setas de la Pe\xF1a \u2014 Simulador de recetas"), /*#__PURE__*/React.createElement("div", {
    className: "hero-title"
  }, "Dise\xF1o de", /*#__PURE__*/React.createElement("br", null), "Sustratos"), /*#__PURE__*/React.createElement("div", {
    className: "hero-lede",
    style: {
      display: 'block',
      marginTop: 14,
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)'
    }
  }, "C\xE1lculo, optimizaci\xF3n y trazabilidad de mezclas.")), /*#__PURE__*/React.createElement("div", {
    className: "hero-art"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.img_banner || '_standalone_imgs/banner.png',
    alt: "",
    "aria-hidden": "true"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "print-header"
  }, /*#__PURE__*/React.createElement("h1", null, "Setas de la Pe\xF1a"), /*#__PURE__*/React.createElement("p", null, "Biogranja fung\xEDcola \xB7 Tenjo, Cundinamarca \xB7 2.600 msnm")), /*#__PURE__*/React.createElement("div", {
    className: "page-title-bar",
    style: {
      display: tab === 'catalogo' || tab === 'inicio' ? 'none' : undefined
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "page-title-eyebrow"
  }, RECETA_TABS.includes(tab) ? 'Receta' : 'Cultivo'), /*#__PURE__*/React.createElement("h2", {
    className: "page-title-h"
  }, TAB_PAGE_TITLES[tab]), /*#__PURE__*/React.createElement("div", {
    className: "page-title-rule"
  })), tab === 'inicio' && (() => {
    const TILES = [{
      t: 'Formular una receta',
      s: 'Mezcla · C:N · humedad · generador automático',
      tb: 'formular',
      pri: true
    }, {
      t: 'Catálogo de especies',
      s: 'Elegir o cambiar la especie activa',
      tb: 'catalogo'
    }, {
      t: 'Preparar un lote',
      s: 'Ficha de producción del día · báscula',
      tb: 'produccion'
    }, {
      t: 'Cronograma',
      s: 'Fechas de siembra y cosecha',
      tb: 'schedule'
    }, {
      t: 'Revisar bodega',
      s: 'Stock · compras · proveedores',
      tb: 'inventario'
    }, {
      t: 'Registrar en bitácora',
      s: 'Lotes · cosechas · eficiencia biológica',
      tb: 'bitacora'
    }, {
      t: 'Dashboard',
      s: 'Indicadores de la operación',
      tb: 'dashboard'
    }];
    return /*#__PURE__*/React.createElement("div", {
      className: "fos-home"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fos-home-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "fos-eyebrow"
    }, "Herramienta de especulaci\xF3n e investigaci\xF3n"), /*#__PURE__*/React.createElement("div", {
      className: "fos-kicker"
    }, "Buenas, equipo"), /*#__PURE__*/React.createElement("h1", {
      className: "fos-h1"
    }, "Laboratorio", /*#__PURE__*/React.createElement("br", null), "SdlP")), /*#__PURE__*/React.createElement("div", {
      className: "fos-home-art"
    }, /*#__PURE__*/React.createElement("img", {
      src: window.__resources && window.__resources.img_banner || '_standalone_imgs/banner-botanico-sketch.jpg',
      width: "560",
      height: "210",
      loading: "lazy",
      decoding: "async",
      alt: "",
      "aria-hidden": "true"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "fos-tiles"
    }, TILES.map(ti => /*#__PURE__*/React.createElement("button", {
      key: ti.tb,
      className: 'fos-tile' + (ti.pri ? ' pri' : ''),
      onClick: () => goTab(ti.tb)
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "fos-tile-t"
    }, ti.t), /*#__PURE__*/React.createElement("span", {
      className: "fos-tile-s"
    }, ti.s)), /*#__PURE__*/React.createElement("span", {
      className: "fos-tile-arrow"
    }, "\u2192")))), /*#__PURE__*/React.createElement("div", {
      className: "fos-species"
    }, /*#__PURE__*/React.createElement("span", {
      className: "fos-species-dot"
    }), /*#__PURE__*/React.createElement("span", null, "Especie activa"), /*#__PURE__*/React.createElement("b", null, sp.name), /*#__PURE__*/React.createElement("em", null, sp.scientific), /*#__PURE__*/React.createElement("button", {
      className: "bridge-cambiar",
      onClick: () => goTab('catalogo'),
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        padding: '6px 12px',
        background: 'transparent',
        color: 'var(--coral-500)',
        border: '1px solid var(--coral-500)',
        cursor: 'pointer',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }
    }, "Cambiar especie")));
  })(), tab === 'catalogo' && /*#__PURE__*/React.createElement("div", {
    className: "spp-sect spp-sect-catalog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "catalog-hdr"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "catalog-eyebrow"
  }, "Receta"), /*#__PURE__*/React.createElement("h2", {
    className: "catalog-title"
  }, "Cat\xE1logo de especies"))), /*#__PURE__*/React.createElement("div", {
    className: "spp-grid"
  }, Object.entries(SPP).map(([k, d], idx) => {
    const hasImg = !!IMG[k];
    const isOn = sKey === k;
    const num = String(idx + 1).padStart(2, '0');
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      className: `spp-card${isOn && hasPickedSpecies ? ' on' : ''}`,
      "aria-pressed": isOn && hasPickedSpecies,
      onClick: () => {
        setSKey(k);
        setCatalogModalOpen(true);
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        borderRadius: 'var(--r-xs)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-family-strip"
    }, /*#__PURE__*/React.createElement("span", null, SPP_FAMILY[k] || '')), /*#__PURE__*/React.createElement("div", {
      className: "p-arch-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-arch-left"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-arch-num"
    }, num), /*#__PURE__*/React.createElement("span", {
      className: "p-arch-code"
    }, SPP_CODE[k])), /*#__PURE__*/React.createElement("span", {
      className: "p-activa"
    }, "Activa")), hasImg ? /*#__PURE__*/React.createElement("div", {
      className: "p-img"
    }, /*#__PURE__*/React.createElement("img", {
      src: IMG[k],
      alt: d.name
    })) : /*#__PURE__*/React.createElement("div", {
      className: "p-svg",
      style: {
        marginLeft: 16
      }
    }, /*#__PURE__*/React.createElement(SppSvg, {
      sKey: k,
      c: isOn ? 'var(--accent-blue-grey)' : 'var(--accent-mushroom)'
    })), /*#__PURE__*/React.createElement("div", {
      className: "p-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-sci"
    }, d.scientific), /*#__PURE__*/React.createElement("div", {
      className: "p-common"
    }, d.name)), /*#__PURE__*/React.createElement("div", {
      className: "p-chips"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-chips-row p-chips-row1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-ico"
    }, /*#__PURE__*/React.createElement(IcoTherm, null)), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-txt"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-lbl"
    }, "Temp"), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-val"
    }, d.temp_fruit))), /*#__PURE__*/React.createElement("div", {
      className: "p-chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-ico"
    }, /*#__PURE__*/React.createElement(IcoDrop, null)), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-txt"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-lbl"
    }, "HR"), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-val"
    }, SPP_HR[k]))), /*#__PURE__*/React.createElement("div", {
      className: "p-chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-ico"
    }, /*#__PURE__*/React.createElement(IcoLayers, null)), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-txt"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-lbl"
    }, "Sustrato"), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-val"
    }, d.substrate || 'Paja + Madera')))), /*#__PURE__*/React.createElement("div", {
      className: "p-chips-row p-chips-row2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-txt"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-lbl"
    }, "pH"), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-val"
    }, d.ph_optimal.min, "\u2013", d.ph_optimal.max))), /*#__PURE__*/React.createElement("div", {
      className: "p-chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-txt"
    }, /*#__PURE__*/React.createElement("span", {
      className: "p-chip-lbl"
    }, "C:N"), /*#__PURE__*/React.createElement("span", {
      className: "p-chip-val"
    }, d.cn_optimal.min, "\u2013", d.cn_optimal.max))), /*#__PURE__*/React.createElement("div", {
      className: "p-chip p-chip-arr",
      onClick: e => {
        e.stopPropagation();
        setSKey(k);
        setCatalogModalOpen(true);
      }
    }, /*#__PURE__*/React.createElement(IcoArrow, null))))));
  })), catalogModalOpen && sp && (() => {
    const det = SPP_DETAILS[sKey] || {};
    const IcoAp = () => /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.3",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "5",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 10c0-2 1.5-3 4-3s4 1 4 3"
    }));
    const IcoSab = () => /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.3",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M6 2c-2.5 0-4 1.5-4 3.5 0 3 4 5.5 4 5.5s4-2.5 4-5.5C10 3.5 8.5 2 6 2z"
    }));
    const IcoUso = () => /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.3",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2 6h8M6 2v8"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "1",
      y: "1",
      width: "10",
      height: "10",
      rx: "1"
    }));
    return /*#__PURE__*/React.createElement("div", {
      className: "cat-modal-bg",
      onClick: () => setCatalogModalOpen(false)
    }, /*#__PURE__*/React.createElement("div", {
      className: "cat-modal-box",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("button", {
      className: "cat-modal-close",
      onClick: () => setCatalogModalOpen(false),
      title: "Cerrar",
      "aria-label": "Cerrar ficha de especie"
    }, "\u2715"), /*#__PURE__*/React.createElement("div", {
      className: "spp-info-2col",
      style: {
        margin: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spp-info-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spp-info-top",
      style: {
        background: 'color-mix(in oklab,var(--moss-100) 40%,var(--paper-50))'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spp-info-sci"
    }, sp.scientific), /*#__PURE__*/React.createElement("h2", {
      className: "spp-info-name"
    }, sp.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: '1px solid color-mix(in oklab,var(--moss-400) 20%,transparent)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 800,
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--moss-700)',
        marginBottom: 4
      }
    }, "Caracter\xEDstica"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-base)",
        lineHeight: 1.4,
        color: 'var(--ink-900)'
      }
    }, sp.notes.split('.')[0] + '.')))), det.hechos && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginTop: 4
      }
    }, det.hechos.map((h, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: 'var(--coral-500)',
        background: 'color-mix(in oklab,var(--coral-200) 40%,var(--paper-50))',
        border: '1px solid var(--coral-200)',
        borderRadius: 3,
        padding: '2px 6px',
        flexShrink: 0,
        marginTop: 1,
        lineHeight: 1.6
      }
    }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-sm)",
        lineHeight: 1.65,
        color: 'var(--ink-700)',
        margin: 0,
        textWrap: 'pretty'
      }
    }, h)))), (() => {
      const diffMap = {
        'Baja': 1,
        'Media': 2,
        'Alta': 3,
        'Muy alta': 4
      };
      const diff = diffMap[SPP_DIFFICULTY[sKey] || 'Media'] || 2;
      const bars = [{
        lbl: 'Ef. Biológica',
        min: sp.eb_baseline,
        max: sp.eb_optimal,
        abs: 150,
        unit: '%',
        color: 'var(--coral-500)'
      }, {
        lbl: 'Spawn',
        min: sp.spawn_rate,
        max: sp.spawn_rate,
        abs: 20,
        unit: '%',
        color: 'var(--moss-600)'
      }, {
        lbl: 'C:N',
        min: sp.cn_optimal.min,
        max: sp.cn_optimal.max,
        abs: 80,
        unit: '',
        color: '#594631'
      }, {
        lbl: 'pH',
        min: sp.ph_optimal.min,
        max: sp.ph_optimal.max,
        abs: 10,
        unit: '',
        color: 'var(--ochre-500)'
      }];
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 20,
          padding: '14px 0 2px',
          borderTop: '1px solid color-mix(in oklab,var(--moss-400) 30%,transparent)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-body)',
          fontWeight: 800,
          fontSize: "var(--text-xs)",
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          color: 'var(--moss-700)',
          marginBottom: 8
        }
      }, "Par\xE1metros de cultivo"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 5
        }
      }, bars.map(b => {
        const lo = Math.min(b.min, b.max) / b.abs * 100;
        const hi = Math.max(b.min, b.max) / b.abs * 100;
        const w = Math.max(hi - lo, 4);
        return /*#__PURE__*/React.createElement("div", {
          key: b.lbl,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            color: 'var(--ink-800)',
            width: 90,
            flexShrink: 0
          }
        }, b.lbl), /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1,
            height: 5,
            background: 'var(--paper-300)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'absolute',
            left: `${lo}%`,
            width: `${w}%`,
            height: '100%',
            background: b.color,
            borderRadius: 3,
            transition: 'width .5s cubic-bezier(.32,.72,.36,1)'
          }
        })), /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: "var(--text-xs)",
            color: 'var(--ink-700)',
            width: 54,
            textAlign: 'right',
            flexShrink: 0
          }
        }, b.min === b.max ? `${b.min}${b.unit}` : `${b.min}–${b.max}${b.unit}`));
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: 'var(--ink-800)',
          width: 90,
          flexShrink: 0
        }
      }, "Dificultad"), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          display: 'flex',
          gap: 3
        }
      }, [1, 2, 3, 4].map(d => /*#__PURE__*/React.createElement("div", {
        key: d,
        style: {
          flex: 1,
          height: 5,
          borderRadius: 3,
          background: d <= diff ? 'var(--coral-500)' : 'var(--paper-300)',
          transition: 'background .3s'
        }
      }))), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          color: 'var(--ink-700)',
          width: 54,
          textAlign: 'right',
          flexShrink: 0
        }
      }, SPP_DIFFICULTY[sKey] || 'Media'))));
    })())), /*#__PURE__*/React.createElement("div", {
      className: "spp-info-center",
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spp-img-wrap",
      style: {
        flex: 1,
        position: 'relative',
        minHeight: 320
      }
    }, IMG[sKey] && /*#__PURE__*/React.createElement("img", {
      src: IMG[sKey],
      alt: sp.name,
      className: "spp-info-img",
      style: {
        objectPosition: 'center 65%'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "spp-cta-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "spp-cta-note"
    }, "Dificultad: ", SPP_DIFFICULTY[sKey] || 'Media'), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setCatalogModalOpen(false);
        goTab('formular');
      },
      className: "spp-cta"
    }, "Formular con ", sp.name, " \u2192"))))));
  })()), tab === 'formular' && /*#__PURE__*/React.createElement("div", {
    className: "builder-wrap",
    "data-tab": tab
  }, loadedFlash && /*#__PURE__*/React.createElement("div", {
    className: "loaded-toast"
  }, "\u2713 Receta cargada"), /*#__PURE__*/React.createElement("div", {
    className: "builder-subnav",
    style: {
      gap: 6,
      flexWrap: 'wrap',
      marginBottom: 0,
      padding: '8px 10px',
      background: 'var(--paper-50)',
      border: '1px solid var(--border-soft)',
      borderBottom: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 6
    }
  }, [{
    id: 'bl-ingredientes',
    l: 'Ingredientes'
  }, {
    id: 'bl-receta',
    l: 'Receta'
  }, ...(recipe.length > 0 ? [{
    id: 'bl-perito',
    l: 'Score / Perito'
  }, {
    id: 'bl-batch',
    l: 'Batch'
  }] : []), ...(recipe.length > 0 && tr ? [{
    id: 'bl-tratamiento',
    l: 'Tratamiento'
  }] : [])].map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    onClick: () => document.getElementById(s.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    }),
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: "var(--text-xs)",
      fontWeight: 700,
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      padding: '6px 10px',
      background: 'var(--paper-100)',
      color: 'var(--ink-700)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-xs)',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, s.l))), recipe.length > 0 && (() => {
    const sm2 = PERITO_STATUS[opt.status] || PERITO_STATUS.sin_receta;
    const limiter = peritoMainLimiter(opt, an);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '8px 12px',
        background: 'var(--paper-100)',
        border: '1px solid var(--border-soft)',
        borderTop: 'none',
        position: 'sticky',
        top: 37,
        zIndex: 6,
        fontFamily: 'var(--font-body)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: 'var(--ink-900)'
      }
    }, sp?.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)'
      }
    }, recipe.length, " insumo", recipe.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 60,
        height: 6,
        background: 'var(--paper-300)',
        borderRadius: 3,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${Math.max(0, Math.min(100, opt.score))}%`,
        height: '100%',
        background: sm2.badge
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 800,
        color: sm2.badge
      }
    }, Math.round(opt.score)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)',
        color: sm2.txt
      }
    }, sm2.label)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)'
      }
    }, numBags, "\xD7", kgBag, "kg = ", (numBags * kgBag).toFixed(1), "kg")), limiter && /*#__PURE__*/React.createElement("button", {
      onClick: () => document.getElementById('bl-perito')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      }),
      style: {
        textAlign: 'left',
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: sm2.txt,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        lineHeight: 1.4
      }
    }, "\u2192 ", limiter));
  })(), /*#__PURE__*/React.createElement("div", {
    className: "builder-cols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "builder-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    id: "bl-ingredientes"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 12,
      paddingBottom: 10,
      borderBottom: '1px solid rgba(26,20,16,.1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 18,
      color: 'var(--ink-900)',
      lineHeight: 1
    }
  }, "Ingredientes")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "search",
    style: {
      marginBottom: 0,
      flex: '1 1 auto',
      minWidth: '200px'
    },
    placeholder: "Buscar ingrediente o etiqueta\u2026",
    value: search,
    onChange: e => setSearch(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    className: `tog${showPrices ? ' on' : ''}`,
    onClick: () => setShowPrices(!showPrices),
    title: "Editar precios por kg",
    style: {
      flexShrink: 0,
      whiteSpace: 'nowrap'
    }
  }, "Precios")), showPrices && /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-soft)',
      marginBottom: 10,
      background: 'var(--paper-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '7px 12px',
      background: 'var(--paper-200)',
      borderBottom: '1px solid var(--border-soft)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-700)',
      fontWeight: 700
    }
  }, "Precios por kg (COP) \u2014 se guardan localmente"), Object.keys(priceOverrides).length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPriceOverrides({});
      try {
        localStorage.removeItem('setas_prices_v1');
      } catch (e) {}
    },
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      padding: '3px 8px',
      border: '1px solid var(--coral-500)',
      background: 'none',
      color: 'var(--coral-500)',
      cursor: 'pointer'
    }
  }, "Restaurar todo")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 260,
      overflowY: 'auto'
    }
  }, fings.filter(g => g.cn > 0 || g.cost > 0).map(ing => {
    const isEdited = priceOverrides[ing.id] !== undefined;
    const orig = INGS.find(i => i.id === ing.id)?.cost || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: ing.id,
      className: "price-row"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-base)",
        fontWeight: 500,
        color: 'var(--ink-900)'
      }
    }, ing.name), isEdited && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        fontFamily: "var(--font-mono)",
        fontWeight: 500
      }
    }, "Orig: $", orig, "/kg")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      step: "100",
      className: `price-inp${isEdited ? ' edited' : ''}`,
      value: ing.cost,
      onChange: e => {
        const v = Math.max(0, parseInt(e.target.value) || 0);
        const n = {
          ...priceOverrides,
          [ing.id]: v
        };
        setPriceOverrides(n);
        try {
          localStorage.setItem('setas_prices_v1', JSON.stringify(n));
        } catch (err) {}
      }
    }));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bodega-bar",
    role: "button",
    tabIndex: 0,
    onClick: () => goTab('inventario'),
    onKeyDown: e => {
      if (e.key === 'Enter') goTab('inventario');
    },
    style: {
      cursor: 'pointer'
    },
    title: "Abrir bodega / inventario"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bodega-bar-icon",
    style: {
      color: pantryIds.length > 0 ? 'var(--accent-olive)' : 'var(--border-soft)',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IcoBox, {
    color: pantryIds.length > 0 ? 'var(--accent-olive)' : 'var(--border-soft)'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bodega-bar-title"
  }, pantryIds.length > 0 ? pantryIds.length + ' ingredientes en bodega' : 'Bodega vacía — sin stock registrado'), pantryIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bodega-bar-sub"
  }, Object.values(stockMap).reduce((a, b) => a + b, 0).toFixed(1), " kg disponibles")), /*#__PURE__*/React.createElement("div", {
    className: "bodega-bar-right"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'tog' + (usePantry ? ' on' : ''),
    onClick: e => {
      e.stopPropagation();
      setUsePantry(!usePantry);
    },
    title: pantryIds.length === 0 ? 'Carga ingredientes en Bodega primero' : usePantry ? 'Ver todos los ingredientes' : 'Ver solo bodega'
  }, usePantry ? 'Ver todos' : 'Ver bodega'), /*#__PURE__*/React.createElement("button", {
    className: "bodega-bar-refresh",
    onClick: e => {
      e.stopPropagation();
      goTab('inventario');
    },
    title: "Actualizar stock",
    "aria-label": "Actualizar stock"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"
  }))))), usePantry && pantryIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "pantry-grid",
    style: {
      marginBottom: 8
    }
  }, pantryIds.slice(0, 12).map(id => {
    const g = INGS.find(i => i.id === id);
    const kg = stockMap[id] || 0;
    return g ? /*#__PURE__*/React.createElement("span", {
      key: id,
      className: "pantry-chip on",
      style: {
        borderColor: INGS.find(i => i.id === id)?.cs?.includes(sKey) ? 'var(--moss-500)' : undefined,
        background: INGS.find(i => i.id === id)?.cs?.includes(sKey) ? 'color-mix(in oklab,var(--moss-500) 10%,var(--paper-50))' : undefined
      },
      title: INGS.find(i => i.id === id)?.cs?.includes(sKey) ? 'Compatible con ' + sp.name : undefined,
      onClick: () => setPantryIds(prev => prev.filter(x => x !== id))
    }, INGS.find(i => i.id === id)?.cs?.includes(sKey) && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'var(--moss-500)',
        marginRight: 4,
        verticalAlign: 'middle',
        marginTop: -1
      }
    }), g.name.length > 18 ? g.name.slice(0, 18) + '…' : g.name, kg > 0 && /*#__PURE__*/React.createElement("span", {
      className: "pantry-chip-kg"
    }, kg.toFixed(1), " kg"), ' ✕') : null;
  }), pantryIds.length > 12 && /*#__PURE__*/React.createElement("span", {
    className: "pantry-chip",
    style: {
      opacity: 0.5
    }
  }, "+", pantryIds.length - 12, " m\xE1s")), /*#__PURE__*/React.createElement("div", {
    className: "cats"
  }, Object.entries(CATS).map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    "data-cat": k,
    className: `cat${cat === k ? ' on' : ''}`,
    onClick: () => setCat(k)
  }, l)), /*#__PURE__*/React.createElement("button", {
    className: `cat${showCompatOnly ? ' on' : ''}`,
    style: {
      borderColor: showCompatOnly ? 'var(--moss-600)' : '',
      color: showCompatOnly ? 'var(--moss-600)' : '',
      background: showCompatOnly ? 'color-mix(in oklab,var(--moss-600) 8%,var(--paper-50))' : ''
    },
    onClick: () => setShowCompatOnly(s => !s),
    title: "Ver solo ingredientes compatibles con la especie seleccionada"
  }, showCompatOnly ? 'Solo compatibles ✕' : 'Compatibles')), /*#__PURE__*/React.createElement("div", {
    className: "ing-list"
  }, (() => {
    let base = usePantry && pantryIds.length > 0 ? fings.filter(g => pantryIds.includes(g.id)) : fings;
    if (showCompatOnly) {
      const compat = new Set(INGS.filter(i => i.cs && i.cs.includes(sKey)).map(i => i.id));
      base = base.filter(g => compat.has(g.id));
    }
    return base;
  })().map(ing => {
    const inR = recipe.find(r => r.id === ing.id);
    const inPantry = pantryIds.includes(ing.id);
    const compatSet = new Set(INGS.filter(i => i.cs && i.cs.includes(sKey)).map(i => i.id));
    const isCompat = compatSet.has(ing.id);
    return /*#__PURE__*/React.createElement("div", {
      key: ing.id,
      className: justAddedIds.includes(ing.id) ? 'ing-row-flash' : '',
      style: {
        display: 'flex',
        flexDirection: 'column',
        opacity: disabledIngIds.includes(ing.id) ? 0.42 : 1,
        transition: 'opacity .15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(IngredientItem, {
      ing: ing,
      onAdd: ing => {
        if (!recipe.find(r => r.id === ing.id)) {
          addI(ing.id);
          flashAdded(ing.id);
        }
      },
      stockKg: stockMap[ing.id] || 0
    }), inPantry && isCompat && /*#__PURE__*/React.createElement("div", {
      title: "En bodega y compatible con esta especie",
      style: {
        position: 'absolute',
        left: 4,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--moss-500)',
        boxShadow: '0 0 0 2px var(--paper-50)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 6,
        padding: '4px 4px 6px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "qa-mini-btn",
      onClick: e => {
        e.stopPropagation();
        toggleDisabledIng(ing.id);
      },
      title: disabledIngIds.includes(ing.id) ? 'Habilitar para el optimizador' : 'Excluir del optimizador',
      "aria-label": disabledIngIds.includes(ing.id) ? `Habilitar ${ing.name} para el optimizador` : `Excluir ${ing.name} del optimizador`,
      style: {
        width: 'clamp(13px,3vw,15px)',
        height: 'clamp(13px,3vw,15px)',
        borderRadius: '50%',
        background: disabledIngIds.includes(ing.id) ? 'var(--coral-500)' : 'var(--border-soft)',
        color: disabledIngIds.includes(ing.id) ? 'var(--paper-0)' : 'rgba(26,20,16,.5)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'clamp(7px,1.5vw,8px)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        flexShrink: 0
      }
    }, disabledIngIds.includes(ing.id) ? '⊘' : '–'), /*#__PURE__*/React.createElement("button", {
      className: "qa-mini-btn",
      onClick: e => {
        e.stopPropagation();
        setPantryIds(prev => inPantry ? prev.filter(x => x !== ing.id) : [...prev, ing.id]);
      },
      title: inPantry ? 'Quitar de bodega' : 'Agregar a bodega',
      "aria-label": inPantry ? `Quitar ${ing.name} de bodega` : `Agregar ${ing.name} a bodega`,
      style: {
        width: 'clamp(13px,3vw,15px)',
        height: 'clamp(13px,3vw,15px)',
        borderRadius: '50%',
        background: inPantry ? 'var(--moss-500)' : 'var(--border-soft)',
        color: 'var(--paper-0)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'clamp(6px,1.4vw,7px)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, inPantry ? /*#__PURE__*/React.createElement(IcoCheck, null) : /*#__PURE__*/React.createElement(IcoPlus, null)), !inR && /*#__PURE__*/React.createElement("button", {
      className: 'qa-mini-btn qa-add-btn' + (justAddedIds.includes(ing.id) ? ' qa-pulse' : ''),
      onClick: e => {
        e.stopPropagation();
        addI(ing.id);
        flashAdded(ing.id);
      },
      title: "Agregar a receta",
      "aria-label": `Agregar ${ing.name} a la receta`,
      style: {
        width: 'clamp(13px,3vw,15px)',
        height: 'clamp(13px,3vw,15px)',
        borderRadius: '50%',
        background: 'var(--coral-500)',
        color: 'var(--paper-0)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'clamp(8px,1.8vw,9px)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, "+")));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "builder-right"
  }, an && (() => {
    const hasPer = recipe.length > 0;
    const {
      score,
      status,
      items
    } = hasPer ? opt : {
      score: 0,
      status: 'sin_receta',
      items: []
    };
    const criticals = items.filter(s => s.priority === 'critical');
    const warnings = items.filter(s => s.priority === 'warning');
    const tips = items.filter(s => s.priority === 'tip');
    const infos = items.filter(s => s.priority === 'info');
    const sm = PERITO_STATUS[status] || PERITO_STATUS.sin_receta;
    const max = 150,
      oMin = sp?.cn_optimal?.min,
      oMax = sp?.cn_optimal?.max;
    const cur = sp ? Math.min(an.cn, max) : 0;
    const cnOk = sp && an.cn >= oMin && an.cn <= oMax;
    return /*#__PURE__*/React.createElement("div", {
      className: "panel print-panel",
      id: "bl-perito",
      style: {
        background: hasPer ? sm.bg : 'var(--paper-50)',
        border: `1.5px solid ${hasPer ? sm.border : 'var(--border-soft)'}`,
        marginBottom: 12,
        transition: 'background .3s,border-color .3s'
      }
    }, hasPer && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 14,
        paddingBottom: 12,
        borderBottom: `1px solid ${sm.border}40`,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 62,
        height: 62,
        borderRadius: '50%',
        background: sm.badge,
        flexShrink: 0,
        transition: 'background .3s'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 24,
        fontWeight: 900,
        color: 'var(--paper-0)',
        lineHeight: 1
      }
    }, score), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-micro)",
        color: 'rgba(255,255,255,.7)',
        letterSpacing: 'var(--tracking-button)',
        marginTop: 1
      }
    }, "SCORE")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: sm.badge,
        marginBottom: 2
      }
    }, "Perito \xB7 Veredicto"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 20,
        fontWeight: 800,
        color: sm.txt,
        lineHeight: 1,
        transition: 'color .3s'
      }
    }, sm.veredicto), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: sm.badge,
        marginTop: 4,
        lineHeight: 1.4
      }
    }, sm.accion && /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700
      }
    }, sm.accion), (() => {
      const causa = peritoMainLimiter(opt, an);
      return causa ? /*#__PURE__*/React.createElement("div", {
        style: {
          opacity: .8,
          marginTop: 2
        }
      }, /*#__PURE__*/React.createElement("b", null, "Causa:"), " ", causa) : null;
    })(), an.trichoderma && /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#C53030',
        fontWeight: 700,
        marginTop: 2
      }
    }, "Autoclave 121\xB0C \xD7 90 min obligatorio"), !an.trichoderma && tr && /*#__PURE__*/React.createElement("div", {
      style: {
        opacity: .6,
        marginTop: 2
      }
    }, "Trat.: ", tr.name))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        flexShrink: 0
      }
    }, (criticals.length > 0 || warnings.length > 0) && /*#__PURE__*/React.createElement("button", {
      onClick: autoImprove,
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: '6px 10px',
        background: 'var(--coral-500)',
        color: 'var(--paper-0)',
        border: 'none',
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, "\u2726 Auto-mejorar"), recipeHistory.length > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: undoLastRec,
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: '6px 10px',
        background: 'transparent',
        color: 'var(--ink-600)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "10",
      height: "10",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 7v6h6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 13C5.5 7 12 4 18 7a9 9 0 010 10"
    })), "Deshacer (", recipeHistory.length, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => goTab('produccion'),
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: '6px 10px',
        background: 'var(--moss-600,var(--accent-olive))',
        color: 'var(--paper-0)',
        border: 'none',
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, "Producir"), (status === 'needs_work' || status === 'critical') && /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setPromptDlg({
          title: 'Nueva prueba experimental',
          label: 'Nombre de la prueba',
          placeholder: 'ej. Ostra gris — ajuste C:N lote 12',
          confirmLabel: 'Guardar prueba',
          onSubmit: nm => {
            const trSave = calcTreatment(an, sKey);
            const e = {
              id: Date.now(),
              name: nm,
              sKey,
              recipe: [...recipe],
              date: new Date().toLocaleDateString('es-CO'),
              eb: an.eb.toFixed(0),
              cn: an.cn.toFixed(1),
              score: opt.score,
              cost: Math.round(an.cost),
              treatCol: trSave?.col || null,
              energyCopKg: trSave?.energy?.cop_per_kg_seco || 0
            };
            const u = [e, ...saved];
            setSaved(u);
            try {
              localStorage.setItem('setas_v6', JSON.stringify(u));
            } catch (e2) {}
            setNoticeDlg({
              msg: `Guardada como prueba: ${nm}`
            });
          }
        });
      },
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: '6px 10px',
        background: 'transparent',
        color: sm.badge,
        border: `1px solid ${sm.border}`,
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, "+ Crear prueba"))), /*#__PURE__*/React.createElement("div", {
      className: "mgrid",
      style: {
        marginBottom: 12
      }
    }, [{
      l: 'C:N',
      v: `${an.cn.toFixed(1)}:1`,
      ok: sp && an.cn >= sp.cn_optimal.min && an.cn <= sp.cn_optimal.max
    }, {
      l: 'Nitrógeno',
      v: `${an.avgN.toFixed(2)}%`,
      ok: sp && an.avgN >= sp.n_optimal.min && an.avgN <= sp.n_optimal.max
    }, {
      l: 'EB esperada',
      v: an.ebLow && an.ebHigh ? `${an.ebLow}–${an.ebHigh}%` : `${an.eb.toFixed(0)}%`,
      ok: an.eb > 100,
      w: an.eb > 70 && an.eb <= 100
    }, {
      l: 'Costo / kg',
      v: `$${Math.round(an.cost)}`,
      ok: an.cost < 800,
      w: an.cost < 2000 && an.cost >= 800
    }, {
      l: 'pH estimado',
      v: an.avgPh?.toFixed(1) || '—',
      ok: sp && an.avgPh >= sp.ph_optimal?.min && an.avgPh <= sp.ph_optimal?.max,
      w: false
    }, {
      l: 'Digestibilidad',
      v: `${an.avgDig?.toFixed(1) || '—'}/10`,
      ok: an.avgDig >= 7,
      w: an.avgDig >= 4 && an.avgDig < 7
    }].map(m => /*#__PURE__*/React.createElement("div", {
      key: m.l,
      className: "mc"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mlbl"
    }, m.l), /*#__PURE__*/React.createElement("div", {
      className: "mval"
    }, m.v), /*#__PURE__*/React.createElement("span", {
      className: `mbadge ${m.ok ? 'bgood' : m.w ? 'bwarn' : 'bbad'}`
    }, m.ok ? 'Óptimo' : m.w ? 'Aceptable' : 'Ajustar')))), /*#__PURE__*/React.createElement(EBDial, {
      an: an,
      sp: sp
    }), sp && an.cn > 0 && /*#__PURE__*/React.createElement("div", {
      className: "gauge-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "gauge-hdr"
    }, /*#__PURE__*/React.createElement("span", {
      className: "gauge-cur"
    }, "C:N ", an.cn.toFixed(1), ":1"), /*#__PURE__*/React.createElement("span", {
      className: "gauge-tgt"
    }, "objetivo ", oMin, "\u2013", oMax, ":1")), /*#__PURE__*/React.createElement("div", {
      className: "gauge-tr"
    }, /*#__PURE__*/React.createElement("div", {
      className: "gauge-zn",
      style: {
        left: `${oMin / max * 100}%`,
        width: `${(oMax - oMin) / max * 100}%`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "gauge-nd",
      style: {
        left: `${cur / max * 100}%`,
        background: cnOk ? 'var(--accent-olive)' : an.cn < oMin ? 'var(--coral-500)' : 'var(--ochre-500,#A07828)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "gauge-ft"
    }, /*#__PURE__*/React.createElement("span", null, "0"), /*#__PURE__*/React.createElement("span", null, oMin, "\u2013", oMax), /*#__PURE__*/React.createElement("span", null, "150+"))), /*#__PURE__*/React.createElement(NitrogenChart, {
      recipe: recipe
    }), hasPer && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-2xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)'
      }
    }, "Modo:"), [['stock', 'Solo bodega', true], ['full', 'Todo el catálogo', false]].map(([k, l, v]) => /*#__PURE__*/React.createElement("button", {
      key: k,
      className: 'chip' + (optUseStock === v ? ' on' : ''),
      onClick: () => setOptUseStock(v)
    }, l))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 0,
        margin: '10px 0 8px',
        border: '1px solid rgba(26,20,16,.1)',
        borderRadius: 6,
        overflow: 'hidden',
        background: 'var(--paper-100)'
      }
    }, [{
      l: 'Calificación',
      v: `${opt?.score ?? '—'}/100`,
      ok: (opt?.score || 0) >= 85,
      w: (opt?.score || 0) >= 60
    }, {
      l: 'EB estimada',
      v: an.ebLow && an.ebHigh ? `${an.ebLow}–${an.ebHigh}%` : `${an.eb?.toFixed(0) || '—'}%`,
      ok: an.eb > 100,
      w: an.eb > 70 && an.eb <= 100
    }, {
      l: 'Costo / kg',
      v: `$${Math.round(an.cost || 0).toLocaleString('es-CO')}`,
      ok: an.cost < 800,
      w: an.cost < 2000 && an.cost >= 800
    }].map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: m.l,
      style: {
        flex: 1,
        padding: '7px 10px',
        borderLeft: i > 0 ? '1px solid rgba(26,20,16,.08)' : 'none',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)',
        marginBottom: 2
      }
    }, m.l), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: "var(--text-md)",
        color: m.ok ? '#3D5A38' : m.w ? '#7A5A10' : 'var(--coral-500)',
        lineHeight: 1
      }
    }, m.v)))), realCostPerKg != null && Math.abs(realCostPerKg - Math.round(an.cost || 0)) >= 20 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-600)',
        marginBottom: 8
      }
    }, "Costo real de bodega (precio ponderado de tus lotes): ", /*#__PURE__*/React.createElement("b", null, "$", realCostPerKg.toLocaleString('es-CO'), "/kg"), " \xB7 cat\xE1logo: $", Math.round(an.cost || 0).toLocaleString('es-CO'), "/kg"), histStats && histStats.n > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-600)',
        marginBottom: 8
      }
    }, "Score ajustado con ", histStats.n, " lote", histStats.n !== 1 ? 's' : '', " real", histStats.n !== 1 ? 'es' : '', histStats.matched ? ' del mismo sustrato' : ' de la especie', " (", histStats.subs.join(', '), ") \u2014 peso ", Math.round(histStats.weight * 100), "% hist\xF3rico / ", Math.round((1 - histStats.weight) * 100), "% f\xF3rmula"), modelAccuracy != null && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-600)',
        marginBottom: 8
      }
    }, "Precisi\xF3n del modelo para ", sp?.name || 'esta especie', " en tu bodega: \xB1", modelAccuracy, "% EB (basado en ", trialsWithReal.length, " prueba", trialsWithReal.length !== 1 ? 's' : '', " con EB real registrado)"), similarTrial && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: '#7A5A10',
        background: 'rgba(160,120,40,.08)',
        border: '1px solid rgba(160,120,40,.2)',
        borderRadius: 4,
        padding: '6px 9px',
        marginBottom: 8
      }
    }, "Ya probaste algo parecido (", /*#__PURE__*/React.createElement("b", null, Math.round(similarTrial.similarity * 100), "%"), " de ingredientes en com\xFAn, \"", similarTrial.name, "\"): dio ", /*#__PURE__*/React.createElement("b", null, "EB real ", similarTrial.ebReal, "%"), " (estimado entonces: ", similarTrial.eb, "%)."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 8
      }
    }, criticals.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '3px 9px',
        background: 'rgba(197,48,48,.12)',
        border: '1px solid rgba(197,48,48,.3)',
        borderRadius: 3,
        color: '#C53030',
        fontWeight: 700
      }
    }, criticals.length, " cr\xEDtico", criticals.length !== 1 ? 's' : ''), warnings.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '3px 9px',
        background: 'rgba(160,120,40,.1)',
        border: '1px solid rgba(160,120,40,.25)',
        borderRadius: 3,
        color: '#7A5A10',
        fontWeight: 700
      }
    }, warnings.length, " ajuste", warnings.length !== 1 ? 's' : ''), criticals.length === 0 && warnings.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '3px 9px',
        background: 'rgba(74,107,74,.1)',
        border: '1px solid rgba(74,107,74,.2)',
        borderRadius: 3,
        color: '#3D5A38'
      }
    }, "Todos los par\xE1metros en rango"), (an.tot < 97 || an.tot > 103) && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        padding: '3px 9px',
        background: 'rgba(197,48,48,.1)',
        border: '1px solid rgba(197,48,48,.25)',
        borderRadius: 3,
        color: '#C53030',
        fontWeight: 700
      }
    }, "\u26A0 Total ", an.tot.toFixed(1), "%")), (criticals.length > 0 || warnings.length > 0) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: sm.badge,
        padding: '6px 10px',
        background: 'rgba(0,0,0,.04)',
        borderLeft: `2px solid ${sm.border}`,
        marginBottom: 8,
        lineHeight: 1.4
      }
    }, /*#__PURE__*/React.createElement("b", null, "Aplica una sugerencia a la vez"), " \u2014 cada cambio recalcula. Usa ", /*#__PURE__*/React.createElement("b", null, "\u2726 Auto-mejorar"), " para automatizar."), criticals.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-2xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: '#C53030',
        padding: '5px 10px',
        background: 'rgba(197,48,48,.07)',
        borderBottom: '1px solid rgba(197,48,48,.2)'
      }
    }, "Cr\xEDticos (", criticals.length, ")"), criticals.map((item, i) => /*#__PURE__*/React.createElement(PeritoItem, {
      key: i,
      item: item,
      onApply: applyOptStep,
      baseScore: opt.score
    }))), warnings.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-2xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        padding: '5px 10px',
        background: 'rgba(160,120,40,.07)',
        borderBottom: '1px solid rgba(160,120,40,.2)'
      }
    }, "Mejoras (", warnings.length, ")"), warnings.map((item, i) => /*#__PURE__*/React.createElement(PeritoItem, {
      key: i,
      item: item,
      onApply: applyOptStep,
      baseScore: opt.score
    }))), tips.length > 0 && /*#__PURE__*/React.createElement("details", {
      open: true,
      style: {
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("summary", {
      style: {
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: "var(--text-sm)",
        padding: '5px 10px',
        background: 'rgba(74,107,74,.05)',
        borderBottom: '1px solid rgba(74,107,74,.15)',
        cursor: 'pointer',
        listStyle: 'none',
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Opcionales (", tips.length, ")"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)"
      }
    }, "\u25BE")), tips.map((item, i) => /*#__PURE__*/React.createElement(PeritoItem, {
      key: i,
      item: item,
      onApply: applyOptStep,
      baseScore: opt.score
    }))), infos.map((item, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 8,
        padding: '7px 12px',
        background: 'rgba(74,90,58,.06)',
        borderTop: '1px solid rgba(74,90,58,.12)',
        alignItems: 'flex-start',
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: item.color,
        flexShrink: 0
      }
    }, item.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: item.color,
        marginRight: 6
      }
    }, item.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: 'var(--ink-500)',
        fontFamily: 'var(--font-mono)'
      }
    }, item.action))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        marginTop: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: `tog${showFlush ? ' on' : ''}`,
      onClick: () => setShowFlush(!showFlush)
    }, "Cosechas"), /*#__PURE__*/React.createElement("button", {
      className: `tog${showCompChart ? ' on' : ''}`,
      onClick: () => setShowCompChart(!showCompChart)
    }, "Composici\xF3n"), /*#__PURE__*/React.createElement("button", {
      className: `tog${showSpeciesRec ? ' on' : ''}`,
      onClick: () => setShowSpeciesRec(!showSpeciesRec)
    }, "Compat. especies")), showFlush && /*#__PURE__*/React.createElement(FlushChart, {
      an: an
    }), showCompChart && /*#__PURE__*/React.createElement(CompositionChart, {
      recipe: recipe
    }), showSpeciesRec && /*#__PURE__*/React.createElement(SpeciesRecommender, {
      recipe: recipe
    }), /*#__PURE__*/React.createElement("div", {
      className: "dbox",
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "dttl"
    }, "Evaluaci\xF3n"), /*#__PURE__*/React.createElement("div", {
      className: "dtxt"
    }, dg.main)), dg.sugs.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "sec",
      style: {
        marginTop: 8
      }
    }, "A considerar"), dg.sugs.map((s2, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: `sug ${s2.t}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "sug-mark"
    }, s2.t === 'success' ? 'Ok' : s2.t === 'error' ? 'Rev' : '—'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: 'var(--ink-500)'
      }
    }, s2.i), /*#__PURE__*/React.createElement("span", null, s2.t === 'warning' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-400)',
        fontStyle: 'italic'
      }
    }, "Podr\xEDas considerar \u2014 "), s2.tx) : s2.tx)))));
  })(), /*#__PURE__*/React.createElement(RecipeGauges, {
    an: an,
    sp: sp,
    optimalAn: optimalAn,
    historical: histStats
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel panel-accent",
    id: "bl-receta"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14,
      paddingBottom: 10,
      borderBottom: '1px solid rgba(26,20,16,.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 20,
      color: 'var(--ink-900)',
      lineHeight: 1
    }
  }, "Receta activa"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: 'var(--ink-500)',
      fontWeight: 400
    }
  }, "(", recipe.length, ")")), recipe.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, an && Math.abs(an.tot - 100) > 0.5 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "tog",
    onClick: () => autoBalance(balanceMode)
  }, "Balancear"), /*#__PURE__*/React.createElement("select", {
    className: "bal-mode",
    value: balanceMode,
    onChange: e => setBalanceMode(e.target.value),
    title: "Estrategia de balanceo"
  }, /*#__PURE__*/React.createElement("option", {
    value: "proportional"
  }, "Proporcional"), /*#__PURE__*/React.createElement("option", {
    value: "equal"
  }, "Igualando"), /*#__PURE__*/React.createElement("option", {
    value: "last"
  }, "Al \xFAltimo"))), /*#__PURE__*/React.createElement("button", {
    className: `tog${normMode ? ' on' : ''}`,
    onClick: () => setNormMode(!normMode),
    title: "Al cambiar un %, los dem\xE1s se ajustan proporcionalmente (respeta \u25CF)"
  }, "Auto-ajustar"), /*#__PURE__*/React.createElement("button", {
    className: "tog",
    onClick: () => setConfirmDlg({
      title: 'Limpiar receta',
      msg: '¿Limpiar la receta activa? Se perderán los ingredientes y porcentajes actuales.',
      danger: true,
      confirmLabel: 'Limpiar',
      onConfirm: () => {
        setRecipe([]);
        setLockedIds([]);
      }
    })
  }, "Limpiar"))), recipe.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "rec-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rec-empty-hed"
  }, "Sin ingredientes a\xFAn."), /*#__PURE__*/React.createElement("div", {
    className: "rec-empty-sub"
  }, "Selecciona ingredientes a la izquierda para comenzar a formular."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      padding: '14px 16px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-100)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-600)',
      marginBottom: 6
    }
  }, "\xBFNo sabes por d\xF3nde empezar?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: 'var(--ink-700)',
      lineHeight: 1.6,
      marginBottom: 12
    }
  }, "El ", /*#__PURE__*/React.createElement("strong", null, "Generador"), " crea autom\xE1ticamente las mejores combinaciones de ingredientes para tu especie \u2014 con los ratios C:N, humedad y costo ya calculados. Solo elige especie y pulsa calcular."), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowOptimizer(true);
      document.getElementById('gen-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    },
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      padding: '9px 16px',
      background: 'var(--coral-500)',
      color: 'var(--paper-0)',
      border: 'none',
      borderRadius: 'var(--r-xs)',
      cursor: 'pointer'
    }
  }, "Ver Generador \u2193"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--paper-300)'
    }
  }, recipe.map(r => {
    const g = INGS.find(i => i.id === r.id);
    if (!g) return null;
    const isLocked = lockedIds.includes(r.id);
    const gName = (g.name || '').toLowerCase();
    const roleMatch = it => {
      const txt = (it.action || '').replace(/<[^>]+>/g, '').toLowerCase();
      if (txt.includes(gName)) return true;
      const isCarbBase = g.role === 'base_carbono',
        isNSupp = g.role === 'suplemento_n' || g.n >= 1.5;
      if ((it.icon === '↓C:N' || it.icon === '↑N') && isNSupp) return true;
      if ((it.icon === '↑C:N' || it.icon === '↓N') && isCarbBase) return true;
      return false;
    };
    const rowFlag = recipe.length > 0 ? opt.items.find(it => it.priority === 'critical' && roleMatch(it)) || opt.items.find(it => it.priority === 'warning' && roleMatch(it)) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      className: `rec-row${isLocked ? ' rec-locked' : ''}`,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 14px',
        borderBottom: '1px solid var(--paper-300)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-base)",
        fontWeight: 500
      }
    }, g.name), /*#__PURE__*/React.createElement("button", {
      className: `lock-btn${isLocked ? ' on' : ''}`,
      onClick: () => toggleLock(r.id),
      "aria-label": isLocked ? `Desbloquear porcentaje de ${g?.name || ''}` : `Fijar porcentaje de ${g?.name || ''}`,
      title: isLocked ? 'Desbloquear (incluir en auto-ajuste)' : 'Fijar este % (excluir del auto-ajuste)',
      style: {
        fontSize: "var(--text-sm)",
        padding: '2px 4px',
        flexShrink: 0
      }
    }, isLocked ? '●' : '○')), /*#__PURE__*/React.createElement("div", {
      className: "imeta",
      style: {
        fontSize: "var(--text-xs)"
      }
    }, "C:N ", g.cn || '—', " \xB7 N ", g.n || '—', "%"), rowFlag && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: rowFlag.priority === 'critical' ? 'var(--coral-500)' : '#7A5A10',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", null, rowFlag.priority === 'critical' ? '⚠' : '!'), /*#__PURE__*/React.createElement("span", null, rowFlag.label))), /*#__PURE__*/React.createElement("button", {
      className: "rem",
      onClick: () => {
        remI(r.id);
        setLockedIds(l => l.filter(x => x !== r.id));
      },
      "aria-label": `Quitar ${g?.name || 'ingrediente'} de la receta`,
      style: {
        flexShrink: 0,
        fontSize: "var(--text-base)",
        padding: '4px 8px'
      }
    }, "\u2715")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "0",
      max: "100",
      step: ".5",
      value: r.p,
      onChange: e => !isLocked && updP(r.id, parseFloat(e.target.value) || 0),
      disabled: isLocked,
      "aria-label": `Porcentaje de ${g.name}`,
      "aria-valuetext": `${r.p}%`,
      "aria-disabled": isLocked,
      style: {
        opacity: isLocked ? .5 : 1,
        width: '100%'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      max: "100",
      step: ".5",
      value: r.p,
      onChange: e => !isLocked && updP(r.id, parseFloat(e.target.value) || 0),
      readOnly: isLocked,
      className: "rec-pct-input",
      style: {
        width: '70px',
        padding: '6px 8px',
        border: '1px solid var(--paper-300)',
        background: isLocked ? 'var(--paper-200)' : 'var(--paper-100)',
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        textAlign: 'center',
        color: 'var(--ink-900)',
        outline: 'none',
        borderRadius: 'var(--r-xs)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "pct",
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: 'var(--ink-600)'
      }
    }, "%"))));
  })), an && /*#__PURE__*/React.createElement("div", {
    className: `tbar ${an.tot >= 99 && an.tot <= 101 ? 'ok' : an.tot < 95 || an.tot > 105 ? 'err' : 'warn'}`
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, an.tot.toFixed(1), "% / 100%")), normMode && recipe.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "norm-bar"
  }, /*#__PURE__*/React.createElement("span", null, "\u21CC"), /*#__PURE__*/React.createElement("span", null, "Auto-ajustar activo \u2014 al cambiar un %, los dem\xE1s se reescalan proporcionalmente"), lockedIds.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      opacity: .8
    }
  }, "\u25CF ", lockedIds.length, " fijado", lockedIds.length !== 1 ? 's' : '')), an && an.sp && opt?.score > 0 && (() => {
    const sc = opt.score;
    const col = sc >= 80 ? 'var(--moss-500)' : sc >= 60 ? 'var(--ochre-500,#A07828)' : 'var(--coral-500)';
    const bg = sc >= 80 ? '#F2F5EE' : sc >= 60 ? '#FBF6E8' : '#F9EDEA';
    const lbl = sc >= 85 ? 'Óptima' : sc >= 70 ? 'Muy buena' : sc >= 55 ? 'Aceptable' : sc >= 40 ? 'Mejorable' : 'Deficiente';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: bg,
        border: `1px solid ${col}`,
        borderLeft: `4px solid ${col}`,
        padding: '12px 14px 10px',
        marginTop: 3,
        transition: 'all .4s ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)',
        fontWeight: 800,
        marginBottom: 2
      }
    }, "Score de receta"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: "var(--text-base)",
        fontStyle: 'italic',
        color: col,
        lineHeight: 1,
        transition: 'color .4s'
      }
    }, lbl)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 42,
        fontWeight: 400,
        lineHeight: 1,
        color: col,
        letterSpacing: 'var(--tracking-tight)',
        transition: 'all .4s ease'
      }
    }, sc), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-400)',
        fontWeight: 600,
        marginBottom: 4
      }
    }, "/100"))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 3,
        background: 'rgba(26,20,16,0.08)',
        borderRadius: 2,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${sc}%`,
        background: col,
        borderRadius: 2,
        transition: 'width .6s cubic-bezier(.32,.72,.36,1)'
      }
    })));
  })(), an && an.sp && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      margin: '10px 0 4px'
    }
  }, [{
    label: 'C:N',
    val: an.cn,
    min: an.sp.cn_optimal.min,
    max: an.sp.cn_optimal.max,
    ideal: an.sp.cn_optimal.ideal,
    fmt: v => `${v.toFixed(1)}:1`,
    scale: Math.max(an.sp.cn_optimal.max * 1.5, an.cn * 1.1 || 1)
  }, {
    label: 'N%',
    val: an.avgN,
    min: an.sp.n_optimal.min,
    max: an.sp.n_optimal.max,
    ideal: an.sp.n_optimal.ideal,
    fmt: v => `${v.toFixed(2)}%`,
    scale: Math.max(an.sp.n_optimal.max * 1.5, an.avgN * 1.1 || 1)
  }].map(m => {
    const inRange = m.val >= m.min && m.val <= m.max;
    const pct = Math.min(100, m.val / m.scale * 100);
    const idealPct = m.ideal / m.scale * 100;
    const minPct = m.min / m.scale * 100;
    const maxPct = m.max / m.scale * 100;
    const barColor = inRange ? 'var(--moss-500)' : m.val < m.min ? 'var(--coral-500)' : '#d4a04a';
    return /*#__PURE__*/React.createElement("div", {
      key: m.label,
      style: {
        background: 'var(--paper-100)',
        border: '1px solid var(--border-soft)',
        padding: '8px 10px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-xs)",
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-button)',
        color: 'var(--ink-700)',
        fontWeight: 700
      }
    }, m.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-num)",
        fontSize: "var(--text-md)",
        color: barColor,
        fontWeight: 600
      }
    }, m.fmt(m.val))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 6,
        background: '#e0dbd3',
        borderRadius: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: `${minPct}%`,
        width: `${maxPct - minPct}%`,
        height: '100%',
        background: 'rgba(77,98,53,.2)',
        borderRadius: 3
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: `${idealPct}%`,
        width: 2,
        height: '160%',
        top: '-30%',
        background: 'rgba(77,98,53,.5)',
        borderRadius: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        width: `${pct}%`,
        height: '100%',
        background: barColor,
        borderRadius: 3,
        transition: 'width .3s'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 3,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: 'var(--ink-700)',
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement("span", null, m.fmt(m.min)), /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: .7
      }
    }, "\u2191", m.fmt(m.ideal)), /*#__PURE__*/React.createElement("span", null, m.fmt(m.max))));
  })), recipe.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bwrap",
    id: "bl-batch"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec",
    style: {
      marginBottom: 0,
      borderBottom: 'none'
    }
  }, "Batch"), /*#__PURE__*/React.createElement("button", {
    className: `tog${showBatch ? ' on' : ''}`,
    onClick: () => setShowBatch(!showBatch)
  }, showBatch ? 'Ocultar' : 'Calcular')), /*#__PURE__*/React.createElement("div", {
    className: "bgrid",
    style: {
      gridTemplateColumns: '1fr 1fr 1fr 1fr'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bf"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "bf-numbags"
  }, "N\xBA bolsas"), /*#__PURE__*/React.createElement("input", {
    id: "bf-numbags",
    type: "number",
    min: "1",
    max: "500",
    value: numBags,
    onChange: e => setNumBags(parseInt(e.target.value) || 1)
  })), /*#__PURE__*/React.createElement("div", {
    className: "bf"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "bf-kgbag"
  }, "kg / bolsa"), /*#__PURE__*/React.createElement("input", {
    id: "bf-kgbag",
    type: "number",
    min: ".5",
    max: "5",
    step: ".1",
    value: kgBag,
    onChange: e => setKgBag(parseFloat(e.target.value) || 1)
  })), /*#__PURE__*/React.createElement("div", {
    className: "bf"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "bf-hobj"
  }, "Humedad obj. % \u25B3"), /*#__PURE__*/React.createElement("input", {
    id: "bf-hobj",
    type: "number",
    min: "55",
    max: "80",
    value: hObj,
    onChange: e => setHObj(parseInt(e.target.value) || 67),
    style: {
      borderColor: hObj >= 67 ? 'var(--moss-500)' : 'var(--coral-500)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "bf"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "bf-spawncost"
  }, "Costo spawn ($/kg)"), /*#__PURE__*/React.createElement("input", {
    id: "bf-spawncost",
    type: "number",
    min: "0",
    step: "1000",
    value: spawnCost,
    onChange: e => setSpawnCost(parseInt(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", {
    className: "bf"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "bf-vegprice"
  }, "Precio venta ($/kg )"), /*#__PURE__*/React.createElement("input", {
    id: "bf-vegprice",
    type: "number",
    min: "0",
    step: "1000",
    value: vegPrice,
    onChange: e => setVegPrice(parseInt(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", {
    className: "bf"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "bf-total"
  }, "Total"), /*#__PURE__*/React.createElement("input", {
    id: "bf-total",
    readOnly: true,
    value: `${(numBags * kgBag).toFixed(1)} kg`,
    style: {
      fontWeight: 700,
      color: 'var(--coral-500)'
    }
  }))), showBatch && bd && /*#__PURE__*/React.createElement("div", null, bd.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "brow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bn"
  }, it.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, it.cost > 0 && /*#__PURE__*/React.createElement("span", {
    className: "bc"
  }, "$", Math.round(it.cost).toLocaleString()), /*#__PURE__*/React.createElement("span", {
    className: "bq"
  }, it.unit)))), /*#__PURE__*/React.createElement("div", {
    className: "brow",
    style: {
      borderTop: '2px solid var(--border-soft)',
      marginTop: 4,
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bn",
    style: {
      color: '#2A5078',
      fontWeight: 600
    }
  }, " Agua a agregar (obj. ", bd.hObj, "%)"), /*#__PURE__*/React.createElement("span", {
    className: "bq",
    style: {
      background: '#E8F2FA',
      border: '1px solid #9AC0D8',
      color: '#2A5078'
    }
  }, bd.agua.toFixed(2), " L")), /*#__PURE__*/React.createElement("div", {
    className: "brow",
    style: {
      borderTop: '1px solid var(--paper-300)',
      marginTop: 4,
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bn"
  }, " Spawn (", an?.dynSpawn || 8, "% \xB7 ", bd.spawn.toFixed(2), " kg)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bc"
  }, "$", Math.round(bd.spawnCostTotal).toLocaleString()), /*#__PURE__*/React.createElement("span", {
    className: "bq",
    style: {
      background: '#E8F5E8',
      border: '1px solid #7AB87A',
      color: '#2A5A2A'
    }
  }, bd.spawn.toFixed(2), " kg"))), /*#__PURE__*/React.createElement("div", {
    className: "btots",
    style: {
      gridTemplateColumns: 'repeat(4,1fr)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "btot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv"
  }, bd.wet.toFixed(1), " kg"), /*#__PURE__*/React.createElement("div", {
    className: "bl"
  }, "Sustrato")), /*#__PURE__*/React.createElement("div", {
    className: "btot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv"
  }, "$", Math.round(bd.cost).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "bl"
  }, "Insumos")), /*#__PURE__*/React.createElement("div", {
    className: "btot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv"
  }, "$", Math.round(bd.spawnCostTotal).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "bl"
  }, "Spawn")), /*#__PURE__*/React.createElement("div", {
    className: "btot",
    style: {
      background: 'var(--coral-500)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bv"
  }, "$", Math.round(bd.totalCost).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "bl"
  }, "Total COP"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper-100)',
      padding: '8px 12px',
      border: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-button)',
      color: 'var(--ink-500)',
      marginBottom: 3
    }
  }, "Costo por bolsa"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--coral-500)'
    }
  }, "$", Math.round(bd.costPerBag).toLocaleString())), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper-100)',
      padding: '8px 12px',
      border: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-button)',
      color: 'var(--ink-500)',
      marginBottom: 3
    }
  }, "Costo / kg sustrato"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--coral-500)'
    }
  }, "$", Math.round(bd.cost / bd.wet).toLocaleString()))), vegPrice > 0 && an && an.eb > 0 && (() => {
    const yieldKg = bd.dry * (an.eb / 100);
    const revenue = yieldKg * vegPrice;
    const margin = revenue - bd.totalCost;
    const marginPct = revenue > 0 ? (margin / revenue * 100).toFixed(1) : 0;
    const positive = margin >= 0;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        border: `1px solid ${positive ? 'var(--moss-500)' : 'var(--coral-500)'}`,
        background: positive ? '#F2F5EE' : '#F9EDEA'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 12px',
        borderBottom: `1px solid ${positive ? 'var(--moss-500)' : 'var(--coral-500)'}`,
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: positive ? 'var(--moss-500)' : 'var(--coral-500)'
      }
    }, "Proyecci\xF3n de ingresos \xB7 EB ", an.eb.toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 1,
        background: positive ? 'var(--moss-500)' : 'var(--coral-500)'
      }
    }, [{
      l: 'Cosecha est.',
      v: `${yieldKg.toFixed(1)} kg`
    }, {
      l: 'Ingresos brutos',
      v: `$${Math.round(revenue).toLocaleString()}`
    }, {
      l: `Margen ${marginPct}%`,
      v: `$${Math.round(margin).toLocaleString()}`,
      bold: true,
      good: positive
    }].map((cell, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: 'var(--paper-50)',
        padding: '10px 12px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)',
        marginBottom: 4
      }
    }, cell.l), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-num)",
        fontSize: 20,
        fontWeight: 600,
        color: cell.bold ? cell.good ? 'var(--moss-500)' : 'var(--coral-500)' : 'var(--ink-900)'
      }
    }, cell.v)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '6px 12px',
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        fontWeight: 500
      }
    }, "Precio venta $", vegPrice.toLocaleString(), "/kg \xB7 Costo total $", Math.round(bd.totalCost).toLocaleString(), " COP \xB7 Sin contar labor ni servicios \xB7 EB sobre materia seca ($", bd.dry.toFixed(1), " kg de $", bd.wet.toFixed(1), " kg h\xFAmedos)."));
  })())), recipe.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "act-row no-print"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => window.print()
  }, "Imprimir ficha"), /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    onClick: exportR
  }, "\u2193 Exportar .txt"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      if (typeof html2pdf === 'undefined') {
        setNoticeDlg({
          msg: 'html2pdf no disponible.'
        });
        return;
      }
      const el = document.querySelector('.print-panel');
      if (!el) {
        setNoticeDlg({
          msg: 'Genera análisis primero.'
        });
        return;
      }
      html2pdf().set({
        margin: 10,
        filename: `receta_${sKey}_${new Date().toISOString().slice(0, 10)}.pdf`,
        html2canvas: {
          scale: 2
        },
        jsPDF: {
          format: 'a4',
          orientation: 'portrait'
        }
      }).from(el).save();
    }
  }, "\u2193 PDF"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      if (!recipe.length) {
        setNoticeDlg({
          msg: 'No hay receta.'
        });
        return;
      }
      const p = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        especie: {
          key: sKey,
          nombre: an?.sp?.name
        },
        receta: recipe.map(r => {
          const g = INGS.find(i => i.id === r.id);
          return {
            id: r.id,
            nombre: g?.name,
            porcentaje: r.p
          };
        }),
        analisis: an ? {
          cn: an.cn,
          n: an.avgN,
          eb: an.eb,
          costo: an.cost,
          score: opt.score
        } : null,
        tratamiento: tr ? {
          metodo: tr.name,
          temp: tr.temp,
          tiempo: tr.time
        } : null
      };
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(p, null, 2)], {
        type: 'application/json'
      }));
      a.download = `receta_${sKey}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    }
  }, "\u2193 JSON"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const p = JSON.parse(ev.target.result);
            if (p.receta && p.especie) {
              const apply = () => {
                if (p.especie.key && SPP[p.especie.key]) setSKey(p.especie.key);
                setRecipe(p.receta.map(r => ({
                  id: r.id,
                  p: r.porcentaje
                })));
              };
              if (recipe.length > 0) {
                setConfirmDlg({
                  title: 'Reemplazar receta activa',
                  msg: `¿Reemplazar la receta actual con "${p.especie.nombre || p.especie.key}"?`,
                  onConfirm: apply
                });
              } else apply();
            } else {
              setNoticeDlg({
                msg: 'JSON inválido — no contiene los campos receta/especie.'
              });
            }
          } catch (err) {
            setNoticeDlg({
              msg: 'Error al leer el archivo JSON. Verifica que sea un archivo exportado desde el simulador.'
            });
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  }, "\u2191 Importar")), recipe.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sbar"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Nombre de la receta\u2026",
    value: saveName,
    onChange: e => setSaveName(e.target.value),
    onKeyDown: e => e.key === 'Enter' && saveR(),
    maxLength: 60
  }), /*#__PURE__*/React.createElement("button", {
    className: `sbtn${flash ? ' fl' : ''}`,
    onClick: saveR,
    disabled: !saveName.trim() || !balanced,
    title: balanced ? '' : balMsg
  }, flash ? '✓ Guardada' : 'Guardar'), recipe.length > 0 && an && /*#__PURE__*/React.createElement("button", {
    className: "sbtn",
    onClick: () => {
      setBitNuevoForm(buildBitNuevoForm());
      setShowBitNuevo(true);
    },
    disabled: !balanced,
    title: balanced ? 'Crear lote experimental en la Bitácora con esta receta' : balMsg,
    style: {
      background: balanced ? 'var(--moss-700,#2E3B2F)' : 'var(--paper-300)',
      color: balanced ? 'var(--paper-0)' : 'var(--ink-500)',
      border: 'none',
      cursor: balanced ? 'pointer' : 'not-allowed'
    }
  }, "Prueba \u2192"), saveSyncErr && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: '#C53030'
    },
    title: saveSyncErr
  }, "\u26A0 sin sincronizar"))))), tab === 'formular' && tr && recipe.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "panel treatment-section",
    id: "bl-tratamiento"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 13,
      borderBottom: '1px solid var(--paper-300)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec",
    style: {
      marginBottom: 0,
      borderBottom: 'none'
    }
  }, "Tratamiento recomendado"), /*#__PURE__*/React.createElement("button", {
    className: `tog${showGuide ? ' on' : ''}`,
    onClick: () => setShowGuide(!showGuide)
  }, showGuide ? 'Ocultar guía' : 'Ver guía paso a paso')), /*#__PURE__*/React.createElement("div", {
    className: `tcard ${tr.col}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "tttl"
  }, tr.name), /*#__PURE__*/React.createElement("div", {
    className: "tparams"
  }, [tr.temp, tr.time, `Spawn ${tr.spawn}%`].map((p, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "tp"
  }, p))), /*#__PURE__*/React.createElement("div", {
    className: "twhy"
  }, tr.reasons.map((r, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, r))), /*#__PURE__*/React.createElement("div", {
    className: "tproc"
  }, tr.prep), tr.alt && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: "var(--text-sm)",
      color: 'var(--ink-500)',
      background: 'var(--paper-200)',
      border: '1px solid var(--paper-300)',
      padding: '6px 10px',
      borderLeft: '2px solid var(--border-soft)'
    }
  }, tr.alt), tr.energy && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      padding: '7px 10px',
      background: 'rgba(0,0,0,.04)',
      borderRadius: 'var(--r-xs)',
      borderTop: '1px solid rgba(0,0,0,.08)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-md)"
    }
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      fontWeight: 700
    }
  }, tr.energy.cop_per_kg_humedo > 0 ? `Consumo eléctrico estimado: ${tr.energy.kwh_per_kg} kWh/kg húmedo · $${tr.energy.cop_per_kg_humedo.toLocaleString('es-CO')} COP/kg húmedo · $${(tr.energy.cop_per_kg_seco || 0).toLocaleString('es-CO')} COP/kg seco` : 'Sin consumo eléctrico — proceso en frío'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      opacity: .7,
      marginTop: 2
    }
  }, tr.energy.detalle)), an && an.cost > 0 && tr.energy.cop_per_kg_seco > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-num)',
      fontSize: "var(--text-md)",
      fontWeight: 700
    }
  }, "$", (Math.round(an.cost) + tr.energy.cop_per_kg_seco).toLocaleString('es-CO')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-2xs)",
      opacity: .7
    }
  }, "COP/kg total")))), showGuide && /*#__PURE__*/React.createElement(PasteGuide, {
    tr: tr,
    recipe: recipe,
    numBags: numBags,
    kgBag: kgBag
  })), /*#__PURE__*/React.createElement("div", {
    className: "panel rec-panel",
    style: {
      display: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 10,
      borderBottom: '1px solid rgba(26,20,16,.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec",
    style: {
      marginBottom: 0,
      borderBottom: 'none'
    }
  }, "Recetario ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--ink-500)',
      fontWeight: 400
    }
  }, "(", saved.length, ")"))), showSaved && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 0
    }
  }, saved.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "sempty"
  }, "Sin recetas en el recetario a\xFAn.") : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 15,
      top: 0,
      bottom: 0,
      width: '1px',
      background: 'var(--border-soft)',
      opacity: 0
    }
  }), saved.map((e, idx) => {
    const s2 = SPP[e.sKey];
    const isEven = idx % 2 === 0;
    return /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingLeft: 40
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 8,
        top: 6,
        width: 14,
        height: 14,
        background: 'var(--coral-500)',
        border: '2px solid var(--paper-50)',
        borderRadius: '50%',
        zIndex: 10
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: 'var(--ink-900)',
        marginBottom: 2
      }
    }, e.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-700)',
        background: 'var(--paper-200)',
        padding: '2px 7px',
        borderRadius: 3,
        fontWeight: 600
      }
    }, s2?.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-700)',
        fontWeight: 600
      }
    }, "C:N ", e.cn, ":1"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: e.eb >= 100 ? 'var(--accent-olive)' : e.eb >= 70 ? 'var(--ochre-500,#A07828)' : '#C53030'
      }
    }, "EB estimada ", e.eb, "%"), e.ebReal != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: Math.abs(e.ebReal - parseFloat(e.eb)) <= 10 ? 'var(--accent-olive)' : '#C53030'
      }
    }, "EB real ", e.ebReal, "% (", e.ebReal >= parseFloat(e.eb) ? '+' : '', Math.round((e.ebReal - parseFloat(e.eb)) * 10) / 10, ")"), liveScoreFor(e) > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--coral-500)',
        fontWeight: 600
      }
    }, "Score ", liveScoreFor(e), "/100"), e.cost && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-700)',
        fontWeight: 500
      }
    }, "$", e.cost, "/kg")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-600)',
        fontWeight: 500
      }
    }, e.date), /*#__PURE__*/React.createElement("button", {
      className: "sload",
      onClick: () => loadR(e),
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: '3px 8px',
        background: 'var(--coral-500)',
        color: 'var(--paper-0)',
        border: 'none',
        borderRadius: 'var(--r-xs)',
        cursor: 'pointer'
      }
    }, "Cargar"), /*#__PURE__*/React.createElement("button", {
      className: "sebreal",
      onClick: () => setEbRealFor(e.id),
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: '3px 8px',
        background: 'transparent',
        color: 'var(--ink-700)',
        border: '1px solid var(--paper-300)',
        borderRadius: 'var(--r-xs)',
        cursor: 'pointer'
      }
    }, e.ebReal != null ? 'Editar EB real' : '+ EB real'), /*#__PURE__*/React.createElement("button", {
      className: "sdel",
      onClick: () => delR(e.id),
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: '3px 8px',
        background: 'transparent',
        color: 'var(--coral-500)',
        border: '1px solid var(--coral-200)',
        borderRadius: 'var(--r-xs)',
        cursor: 'pointer'
      }
    }, "Eliminar"))));
  }))))), tab === 'formular' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "gen-panel",
    className: "panel opt-panel",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 10,
      borderBottom: '1px solid rgba(26,20,16,.1)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'var(--paper-50,#fff)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec",
    style: {
      marginBottom: 0,
      borderBottom: 'none'
    }
  }, "Generador de recetas"), /*#__PURE__*/React.createElement("button", {
    className: "tog",
    onClick: () => setShowOptimizer(s => !s)
  }, showOptimizer ? 'Ocultar' : 'Mostrar')), showOptimizer && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg-row",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: 'seg' + (formularMode === 'auto' ? ' on' : ''),
    onClick: () => setFormularMode('auto')
  }, "Autom\xE1tica"), /*#__PURE__*/React.createElement("button", {
    className: 'seg' + (formularMode === 'manual' ? ' on' : ''),
    onClick: () => setFormularMode('manual')
  }, "Por objetivo C:N")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-700)',
      marginBottom: 12,
      paddingBottom: 10,
      borderBottom: '1px solid var(--paper-300)'
    }
  }, formularMode === 'auto' ? 'Genera combinaciones base×suplemento óptimas para tu especie — desde tu bodega o toda la paleta.' : 'Elige dos ingredientes y un C:N objetivo. El sistema calcula las proporciones exactas.'), formularMode === 'auto' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0 20px',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--ink-900)',
      paddingBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-2xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 4
    }
  }, "Especie objetivo"), /*#__PURE__*/React.createElement("select", {
    style: {
      width: '100%',
      border: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: "var(--text-md)",
      color: 'var(--ink-900)',
      outline: 'none',
      padding: '2px 0',
      cursor: 'pointer'
    },
    value: optTarget,
    onChange: e => setOptTarget(e.target.value)
  }, Object.entries(SPP).map(([k, s]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, s.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--ink-900)',
      paddingBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-2xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 4
    }
  }, "Costo m\xE1x. $/kg"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    step: "100",
    value: optMaxCost,
    onChange: e => setOptMaxCost(parseInt(e.target.value) || 0),
    style: {
      width: '100%',
      border: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-md)",
      color: 'var(--ink-900)',
      outline: 'none',
      padding: '2px 0'
    },
    placeholder: "Sin l\xEDmite"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'flex-end',
      marginBottom: 14,
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'var(--paper-50,#fff)',
      padding: '10px 0 10px',
      borderBottom: '1px solid var(--border-soft)',
      marginLeft: 0,
      marginRight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: 'var(--text-2xs)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)'
    }
  }, "Origen"), /*#__PURE__*/React.createElement("div", {
    className: "chip-row"
  }, [['stock', 'Solo bodega', true], ['full', 'Paleta completa', false]].map(([k, l, v]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: 'chip' + (optUseStock === v ? ' on' : ''),
    onClick: () => setOptUseStock(v)
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 16,
      background: 'var(--border-soft)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: 'var(--text-2xs)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)'
    }
  }, "Nivel"), /*#__PURE__*/React.createElement("div", {
    className: "chip-row"
  }, Object.entries(OPT_PROFILES).map(([k, p]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: 'chip' + (optProfile === k ? ' on' : ''),
    style: optProfile === k ? {
      color: p.color,
      borderBottomColor: p.color
    } : undefined,
    onClick: () => setOptProfile(k)
  }, p.label)))), /*#__PURE__*/React.createElement("button", {
    className: "btn dark",
    onClick: () => {
      setOptRunning(true);
      setOptResults(null);
      setTimeout(() => {
        let noStock = false;
        let _diag = null;
        const byProfile = {};
        Object.keys(OPT_PROFILES).forEach(pk => {
          const r = runAutoOptimizer(optTarget, invLotes, optMaxCost, optimizerINGS, optUseStock, pk, stockMap);
          noStock = noStock || r.noStock;
          byProfile[pk] = r.results.slice(0, 6);
          byProfile[`_diag_${pk}`] = {
            stockCount: r.stockCount,
            diag: r.diag
          };
          if (pk === optProfile) _diag = {
            stockCount: r.stockCount,
            diag: r.diag
          };
        });
        // Sin fallback — cada perfil muestra solo lo que le corresponde
        setOptResults({
          ...byProfile,
          noStock,
          _diag
        });
        setOptRunning(false);
      }, 50);
    },
    style: {
      marginLeft: 'auto',
      flex: 'none',
      minWidth: 0,
      padding: '6px 16px'
    }
  }, optRunning ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }, "\u21BB"), " \u2026") : 'Calcular')), optUseStock ? (() => {
    const sc = [...new Set(invLotes.filter(l => l.activo && l.cantidadKgDisponible > 0).map(l => l.ingredienteId))].length;
    return sc > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 12px',
        background: 'var(--moss-50,#F0F4EB)',
        border: '1px solid var(--moss-300,#B8C9A0)',
        borderRadius: 'var(--r-sm)',
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: 'var(--moss-700,var(--accent-olive))',
        marginBottom: 12
      }
    }, "Usando solo ingredientes en stock \xB7 ", sc, " disponibles en inventario") : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 14px',
        background: '#FBF6E8',
        border: '1px solid #D4A838',
        borderRadius: 'var(--r-sm)',
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: '#7A5A10',
        marginBottom: 12
      }
    }, "Inventario vac\xEDo. Cambia a ", /*#__PURE__*/React.createElement("strong", null, "Paleta completa"), " para generar recetas con toda la paleta, o registra compras en Inventario.");
  })() : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      background: 'var(--coral-50,#FCEEE9)',
      border: '1px solid var(--coral-300,#E8B4A0)',
      borderRadius: 'var(--r-sm)',
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--coral-600,#B5451F)',
      marginBottom: 12
    }
  }, "Generando con toda la paleta compatible con ", SPP[optTarget]?.name, " \xB7 ignora inventario \xB7 ideal para dise\xF1ar la receta antes de comprar"), optResults && optResults[optProfile] && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottom: '1px solid var(--border-soft)'
    }
  }, optResults[optProfile].length, " combinaciones exclusivas \xB7 perfil ", /*#__PURE__*/React.createElement("b", null, OPT_PROFILES[optProfile]?.label), " \xB7 ", optUseStock ? 'solo stock' : 'paleta completa', " \xB7 C:N objetivo ", SPP[optTarget]?.cn_optimal.ideal, ":1"), optResults[optProfile].map((r, i) => {
    const mainIngs = r.recipe.map(x => {
      const g = INGS.find(ing => ing.id === x.id);
      return g ? `${g.name} ${x.p}%` : x.id;
    }).filter(Boolean);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "opt-result"
    }, /*#__PURE__*/React.createElement("div", {
      className: "opt-result-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "opt-rank"
    }, "#", i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "opt-score"
    }, r.score), /*#__PURE__*/React.createElement("div", {
      className: "opt-score-lbl"
    }, "SCORE")), /*#__PURE__*/React.createElement("div", {
      className: "opt-pills",
      style: {
        flex: 1
      }
    }, mainIngs.map((s, j) => /*#__PURE__*/React.createElement("span", {
      key: j,
      className: "opt-pill"
    }, s)), r.suppOverLimit && /*#__PURE__*/React.createElement("span", {
      className: "opt-pill",
      style: {
        background: 'var(--status-attention-bg)',
        borderColor: 'var(--status-attention)',
        color: 'var(--status-attention)'
      }
    }, "\u26A0 Supl. ", r.an.suppP.toFixed(0), "% > l\xEDmite")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "opt-load",
      onClick: () => {
        setSKey(optTarget);
        setRecipe(r.recipe);
        setLockedIds([]);
        goTab('formular');
        ;
        setLoadedFlash(true);
        setTimeout(() => setLoadedFlash(false), 2200);
      }
    }, "Cargar"), /*#__PURE__*/React.createElement("button", {
      className: "opt-load",
      style: {
        background: 'var(--moss-600,var(--accent-olive))',
        borderColor: 'var(--moss-700,var(--accent-olive))'
      },
      onClick: () => {
        setSKey(optTarget);
        setRecipe(r.recipe);
        setLockedIds([]);
        goTab('produccion');
      }
    }, "Producir"))), /*#__PURE__*/React.createElement("div", {
      className: "opt-metrics"
    }, (() => {
      const tOpt = calcTreatment(r.an, optTarget);
      const eCost = tOpt?.energy?.cop_per_kg_seco || 0;
      const totalCost = Math.round(r.an.cost) + eCost;
      return [{
        l: 'C:N',
        v: `${r.an.cn.toFixed(1)}:1`
      }, {
        l: 'N%',
        v: `${r.an.avgN.toFixed(2)}%`
      }, {
        l: 'EB',
        v: r.an.ebLow && r.an.ebHigh ? `${r.an.ebLow}–${r.an.ebHigh}%` : `${r.an.eb.toFixed(0)}%`
      }, {
        l: 'Costo total/kg',
        v: totalCost > 0 ? `${totalCost.toLocaleString('es-CO')}` : '--',
        sub: eCost > 0 ? `ing ${Math.round(r.an.cost).toLocaleString()}+proc ${eCost.toLocaleString()}` : null
      }];
    })().map(m => /*#__PURE__*/React.createElement("div", {
      key: m.l,
      className: "opt-met"
    }, /*#__PURE__*/React.createElement("div", {
      className: "opt-met-lbl"
    }, m.l), /*#__PURE__*/React.createElement("div", {
      className: "opt-met-val",
      style: {
        fontSize: m.v && m.v.length > 6 ? 14 : 18
      }
    }, m.v), m.sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-micro)",
        color: 'var(--ink-500)',
        lineHeight: 1.3,
        marginTop: 1
      }
    }, m.sub)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 0,
        background: 'var(--paper-100)',
        borderTop: '1px solid var(--border-soft)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: '7px 10px',
        borderRight: '1px solid var(--border-soft)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-600)',
        marginBottom: 2
      }
    }, "Riesgo"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-base)",
        fontWeight: 700,
        color: r.riskScore >= 80 ? 'var(--accent-olive)' : r.riskScore >= 55 ? 'var(--ochre-500,#A07828)' : '#C53030'
      }
    }, r.riskScore ?? '—', "/100")), r.maxKgWet != null && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 2,
        padding: '7px 10px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-600)',
        marginBottom: 2
      }
    }, "Bodega produce"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-base)",
        fontWeight: 700,
        color: 'var(--slate-700,var(--accent-blue-grey))'
      }
    }, r.maxKgWet > 0 ? `hasta ${r.maxKgWet} kg húmedos` : 'stock insuficiente'))), r.an.cost > 0 && (() => {
      const tOpt2 = calcTreatment(r.an, optTarget);
      const eCost2 = tOpt2?.energy?.cop_per_kg_seco || 0;
      const bags = [{
        nom: 'Bolsa 20×50',
        kgH: 1.8
      }, {
        nom: 'Bolsa 18×35',
        kgH: 1.0
      }, {
        nom: 'Punch bag',
        kgH: 3.5
      }];
      const hFactor = optTarget.includes('shiitake') || optTarget.includes('lions') || optTarget.includes('reishi') ? 0.40 : 0.35;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 0,
          borderTop: '1px solid var(--border-soft)',
          borderBottom: 'none'
        }
      }, bags.map(b => {
        const kgSeco = b.kgH * hFactor;
        const costBolsa = Math.round((r.an.cost + eCost2) * kgSeco);
        return /*#__PURE__*/React.createElement("div", {
          key: b.nom,
          style: {
            flex: 1,
            padding: '5px 8px',
            borderRight: '1px solid var(--border-soft)',
            textAlign: 'center',
            background: 'var(--paper-50)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: "var(--text-xs)",
            color: 'var(--ink-700)',
            marginBottom: 2,
            letterSpacing: 'var(--tracking-label)',
            fontWeight: 600
          }
        }, b.nom), /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'var(--font-num)',
            fontSize: "var(--text-base)",
            color: 'var(--coral-700)',
            fontWeight: 700
          }
        }, "$", costBolsa.toLocaleString('es-CO')), /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: "var(--text-xs)",
            color: 'var(--ink-600)',
            fontWeight: 500
          }
        }, "COP / bolsa"));
      }));
    })(), (() => {
      const t = calcTreatment(r.an, optTarget);
      if (!t) return null;
      const tc = t.col === 'autoclave' ? {
        bg: '#FCEEE9',
        br: '#E8B4A0',
        fg: '#B5451F',
        lbl: 'Autoclave 121°C / 15 PSI'
      } : t.col === 'thermal' ? {
        bg: 'var(--status-attention-bg)',
        br: 'var(--status-attention)',
        fg: 'var(--status-attention)',
        lbl: 'Pasteurización 65–75°C núcleo'
      } : {
        bg: '#EEF3EA',
        br: '#90A870',
        fg: '#3D5520',
        icon: '❄',
        lbl: 'CWLP — Cal en Frío pH≥12'
      };
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 14px',
          background: tc.bg,
          borderTop: `1px solid ${tc.br}`
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          color: tc.fg,
          fontWeight: 700
        }
      }, tc.icon, " ", tc.lbl, " \xB7 ", t.time.split('(')[0].trim()), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          color: tc.fg,
          opacity: .8
        }
      }, "Spawn ", t.spawn, "%"));
    })());
  })), !optRunning && optResults && !optResults.noStock && optResults[optProfile]?.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px',
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--ink-700)',
      border: '1px dashed var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-100)'
    }
  }, (() => {
    const d = optResults[`_diag_${optProfile}`] || {
      diag: optResults._diag?.diag
    };
    const diag = d?.diag;
    return diag ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-sm)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--coral-700)',
        marginBottom: 10
      }
    }, "Sin combinaciones v\xE1lidas \u2014 diagn\xF3stico"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 16px',
        marginBottom: 12
      }
    }, [['Stock en bodega', diag.stockIds], ['Disponibles para especie (pool)', diag.poolSize], ['Bases carbono compatibles', diag.bases], ['Suplementos N compatibles', diag.supps], ['Combinaciones evaluadas', diag.tried], ['Resultados antes de filtros', diag.resultsRaw], ['Límite suplementación', diag.suppLimit + '%'], ['Perfil activo', OPT_PROFILES[diag.profileKey]?.label || diag.profileKey]].map(([lb, v]) => /*#__PURE__*/React.createElement("div", {
      key: lb,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '3px 0',
        borderBottom: '1px solid var(--paper-300)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-500)'
      }
    }, lb), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: Number(v) === 0 ? 'var(--coral-700)' : 'var(--ink-900)'
      }
    }, v)))), diag.bases === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--coral-700)',
        marginBottom: 6
      }
    }, "\u26A0 Ning\xFAn ingrediente en bodega tiene rol ", /*#__PURE__*/React.createElement("b", null, "base carbono"), " compatible con esta especie."), diag.supps === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--coral-700)',
        marginBottom: 6
      }
    }, "\u26A0 Ning\xFAn suplemento N en bodega es compatible con esta especie."), diag.bases > 0 && diag.supps > 0 && diag.tried === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--coral-700)',
        marginBottom: 6
      }
    }, "\u26A0 C y N de base y suplemento son demasiado similares para resolver la ecuaci\xF3n."), diag.tried > 0 && diag.resultsRaw === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#7A5A10',
        marginBottom: 6
      }
    }, "\u26A0 Tus bases requieren m\xE1s suplementaci\xF3n de la que permite el perfil ", /*#__PURE__*/React.createElement("b", null, OPT_PROFILES[optProfile]?.label), " (l\xEDmite ", diag.suppLimit, "%). Prueba con perfil ", /*#__PURE__*/React.createElement("b", null, "Producci\xF3n"), " o a\xF1ade paja de trigo/cebada a tu bodega."), diag.bases > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("b", null, "Bases:"), " ", diag.baseNames.join(', ')), diag.supps > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 3,
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("b", null, "Suplementos:"), " ", diag.suppNames.join(', '))) : /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '20px 0',
        color: 'var(--ink-500)'
      }
    }, "Selecciona especie y presiona Calcular.");
  })()), !optRunning && optResults && optResults.noStock && /*#__PURE__*/React.createElement("div", {
    role: "button",
    tabIndex: 0,
    onClick: () => {
      goTab('inventario');
      setInvTab('compra');
    },
    onKeyDown: e => {
      if (e.key === 'Enter') {
        goTab('inventario');
        setInvTab('compra');
      }
    },
    style: {
      cursor: 'pointer',
      textAlign: 'center',
      padding: '32px 20px',
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      color: 'var(--status-attention)',
      border: '1px dashed var(--status-attention)',
      borderRadius: 'var(--r-sm)',
      background: '#FBF6E8'
    }
  }, "Sin stock registrado. Ve a ", /*#__PURE__*/React.createElement("strong", null, "Bodega \u2192 Compra"), " para agregar ingredientes."))), "                              ", formularMode === 'manual' && /*#__PURE__*/React.createElement("div", {
    className: "panel panel-accent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec"
  }, "Formulaci\xF3n por Objetivo C:N"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: '8px 12px',
      background: 'var(--paper-200)',
      border: '1px solid var(--paper-300)',
      fontFamily: "var(--font-body)",
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      lineHeight: 1.6
    }
  }, "Selecciona dos ingredientes y un C:N objetivo \u2014 el sistema calcula las proporciones exactas."), sp && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-2xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 2
    }
  }, "Especie activa"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: "var(--text-md)",
      color: 'var(--ink-900)'
    }
  }, sp.name)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-2xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 2
    }
  }, "C:N ideal"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-md)",
      color: 'var(--ink-900)'
    }
  }, sp.cn_optimal.ideal, ":1")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-2xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 2
    }
  }, "Rango"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-md)",
      color: 'var(--ink-900)'
    }
  }, sp.cn_optimal.min, "\u2013", sp.cn_optimal.max)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-2xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 2
    }
  }, "N objetivo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-md)",
      color: 'var(--ink-900)'
    }
  }, sp.n_optimal.min, "\u2013", sp.n_optimal.max, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "inv-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "inv-base"
  }, "Ingrediente base (carbono)"), /*#__PURE__*/React.createElement("select", {
    id: "inv-base",
    value: invBase,
    onChange: e => setInvBase(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Seleccionar \u2014"), INGS.filter(g => g.role === 'base_carbono' && g.cn > 0 && g.n > 0 && g.cs.includes(sKey)).map(g => /*#__PURE__*/React.createElement("option", {
    key: g.id,
    value: g.id
  }, g.name, " \xB7 C:N ", g.cn, ":1 \xB7 N ", g.n, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "inv-field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "inv-supp"
  }, "Suplemento nitr\xF3geno"), /*#__PURE__*/React.createElement("select", {
    id: "inv-supp",
    value: invSupp,
    onChange: e => setInvSupp(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Seleccionar \u2014"), INGS.filter(g => ['suplemento_n', 'suplemento_medio'].includes(g.role) && g.cn > 0 && g.n > 0 && g.cs.includes(sKey)).map(g => /*#__PURE__*/React.createElement("option", {
    key: g.id,
    value: g.id
  }, g.name, " \xB7 C:N ", g.cn, ":1 \xB7 N ", g.n, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "inv-field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "inv-aer"
  }, "Aireador (opcional)"), /*#__PURE__*/React.createElement("select", {
    id: "inv-aer",
    value: invAer,
    onChange: e => setInvAer(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Ninguno \u2014"), INGS.filter(g => g.role === 'aireador' && g.cs.includes(sKey)).map(g => /*#__PURE__*/React.createElement("option", {
    key: g.id,
    value: g.id
  }, g.name)))), /*#__PURE__*/React.createElement("div", {
    className: "inv-field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "inv-min"
  }, "Mineral / corrector pH (%)"), /*#__PURE__*/React.createElement("input", {
    id: "inv-min",
    type: "number",
    min: "0",
    max: "10",
    step: "0.5",
    value: invMin,
    onChange: e => setInvMin(parseFloat(e.target.value) || 0)
  })), invAer && /*#__PURE__*/React.createElement("div", {
    className: "inv-field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "inv-aerpct"
  }, "Aireador fijo (%)"), /*#__PURE__*/React.createElement("input", {
    id: "inv-aerpct",
    type: "number",
    min: "5",
    max: "25",
    step: "1",
    value: invAerPct,
    onChange: e => setInvAerPct(parseInt(e.target.value) || 10)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)'
    }
  }, "C:N objetivo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 28,
      fontWeight: 600,
      color: sp && invTargetCN >= sp.cn_optimal.min && invTargetCN <= sp.cn_optimal.max ? 'var(--moss-500)' : 'var(--coral-500)'
    }
  }, invTargetCN, ":1")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "10",
    max: "120",
    step: "1",
    value: invTargetCN,
    onChange: e => setInvTargetCN(parseInt(e.target.value)),
    "aria-label": "Relaci\xF3n C:N objetivo",
    "aria-valuetext": `${invTargetCN}:1`,
    style: {
      width: '100%',
      accentColor: 'var(--coral-500)',
      marginBottom: 6
    }
  }), sp && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 4,
      background: 'var(--paper-300)',
      borderRadius: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${(sp.cn_optimal.min - 10) / 110 * 100}%`,
      width: `${(sp.cn_optimal.max - sp.cn_optimal.min) / 110 * 100}%`,
      height: '100%',
      background: 'rgba(77,98,53,.35)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${(sp.cn_optimal.ideal - 10) / 110 * 100}%`,
      width: 2,
      height: '220%',
      top: '-60%',
      background: 'var(--moss-500)',
      borderRadius: 1
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 7,
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: 'var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "10"), sp && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--moss-500)'
    }
  }, "\xF3ptimo ", sp.cn_optimal.min, "\u2013", sp.cn_optimal.max), /*#__PURE__*/React.createElement("span", null, "120"))), /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    style: {
      width: '100%',
      padding: 13,
      fontSize: "var(--text-sm)",
      letterSpacing: 'var(--tracking-button)'
    },
    disabled: !invBase || !invSupp,
    onClick: () => {
      const bI = INGS.find(i => i.id === invBase);
      const sI = INGS.find(i => i.id === invSupp);
      if (!bI || !sI) return;
      const T = invTargetCN,
        pMin = invMin,
        pAer = invAer ? invAerPct : 0;
      const pRem = 100 - pMin - pAer;
      if (pRem <= 2) {
        setInvResult({
          error: 'Los porcentajes fijos superan 98%. Reduce mineral o aireador.'
        });
        return;
      }
      const cb = bI.c,
        nb = bI.n,
        cs = sI.c,
        ns = sI.n;
      const denom = cb - cs - T * (nb - ns);
      if (Math.abs(denom) < 0.001) {
        setInvResult({
          error: 'Ingredientes demasiado similares en C:N. Elige una base de mayor C:N o un suplemento con más N.'
        });
        return;
      }
      const ps = pRem * (cb - T * nb) / denom;
      const pb = pRem - ps;
      if (ps < 0 || pb < 0 || ps > pRem) {
        const cnMin = Math.min(bI.cn, sI.cn).toFixed(0),
          cnMax = Math.max(bI.cn, sI.cn).toFixed(0);
        setInvResult({
          error: `C:N ${T}:1 no alcanzable con estos ingredientes. Rango posible: ${cnMin}–${cnMax}:1`
        });
        return;
      }
      const res = [];
      res.push({
        id: invBase,
        p: Math.round(pb * 10) / 10
      });
      res.push({
        id: invSupp,
        p: Math.round(ps * 10) / 10
      });
      if (invAer && pAer > 0) res.push({
        id: invAer,
        p: pAer
      });
      if (pMin > 0) res.push({
        id: 'carbonato_calcio',
        p: pMin
      });
      const anRes = analyze(res, sKey, effectiveINGS);
      setInvResult({
        recipe: res,
        an: anRes
      });
    }
  }, "\u21CC Calcular proporciones exactas"), invResult && /*#__PURE__*/React.createElement("div", {
    className: "inv-result"
  }, invResult.error ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--coral-500)',
      fontFamily: "var(--font-num)",
      fontSize: 18,
      fontStyle: 'italic',
      lineHeight: 1.5
    }
  }, invResult.error) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sec",
    style: {
      marginTop: 0
    }
  }, "Resultado"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, invResult.recipe.map(r => {
    const g = INGS.find(i => i.id === r.id);
    return g ? /*#__PURE__*/React.createElement("div", {
      key: r.id,
      style: {
        padding: '10px 16px',
        background: 'var(--paper-50)',
        border: '1px solid var(--border-soft)',
        minWidth: 100,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)',
        marginBottom: 4
      }
    }, g.name.length > 18 ? g.name.slice(0, 18) + '…' : g.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-num)",
        fontSize: 32,
        fontWeight: 300,
        color: 'var(--coral-500)',
        lineHeight: 1
      }
    }, r.p, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-base)",
        color: 'var(--ink-500)',
        marginLeft: 1
      }
    }, "%"))) : null;
  })), invResult.an && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 6,
      marginBottom: 14
    }
  }, [{
    l: 'C:N logrado',
    v: `${invResult.an.cn.toFixed(1)}:1`,
    ok: sp && invResult.an.cn >= sp.cn_optimal.min && invResult.an.cn <= sp.cn_optimal.max
  }, {
    l: 'Nitrógeno',
    v: `${invResult.an.avgN.toFixed(2)}%`,
    ok: sp && invResult.an.avgN >= sp.n_optimal.min && invResult.an.avgN <= sp.n_optimal.max
  }, {
    l: 'EB esperada',
    v: invResult.an.ebLow && invResult.an.ebHigh ? `${invResult.an.ebLow}–${invResult.an.ebHigh}%` : `${invResult.an.eb.toFixed(0)}%`,
    ok: invResult.an.eb >= 90
  }, {
    l: 'Costo/kg',
    v: `${Math.round(invResult.an.cost)}`,
    ok: invResult.an.cost < 1000
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--paper-50)',
      border: `1px solid ${m.ok ? 'var(--moss-500)' : 'var(--border-soft)'}`,
      padding: '10px 12px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 4
    }
  }, m.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 20,
      fontWeight: 600,
      color: m.ok ? 'var(--moss-500)' : 'var(--coral-500)'
    }
  }, m.v)))), /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    style: {
      width: '100%'
    },
    onClick: () => {
      setRecipe(invResult.recipe);
      goTab('formular');
    }
  }, "Cargar en Formulador")))))))), tab === 'schedule' && /*#__PURE__*/React.createElement("div", {
    className: "panel panel-accent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schctrl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schctl"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "sch-date"
  }, "Fecha de inoculaci\xF3n"), /*#__PURE__*/React.createElement("input", {
    id: "sch-date",
    type: "date",
    value: schDate,
    onChange: e => setSchDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "schctl"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "sch-key"
  }, "Especie"), /*#__PURE__*/React.createElement("select", {
    id: "sch-key",
    value: schKey,
    onChange: e => setSchKey(e.target.value)
  }, Object.entries(SPP).map(([k, v]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, v.name)))), an && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '9px 13px',
      border: '1px solid var(--border-soft)',
      background: 'var(--paper-100)',
      fontSize: "var(--text-sm)",
      color: 'var(--coral-500)',
      fontFamily: "var(--font-mono)",
      alignSelf: 'flex-end'
    }
  }, "EB ", an.eb.toFixed(0), "% \u2192 tiempos ajustados")), sch && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "schsum"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ssc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ssv"
  }, sch.inc, " d\xEDas"), /*#__PURE__*/React.createElement("div", {
    className: "ssl"
  }, "Incubaci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "ssc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ssv",
    style: {
      fontSize: 20,
      fontWeight: 400,
      paddingTop: 5
    }
  }, sch.first), /*#__PURE__*/React.createElement("div", {
    className: "ssl"
  }, "Primera cosecha")), /*#__PURE__*/React.createElement("div", {
    className: "ssc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ssv"
  }, sch.tot, " d\xEDas"), /*#__PURE__*/React.createElement("div", {
    className: "ssl"
  }, "Ciclo completo"))), /*#__PURE__*/React.createElement("div", {
    className: "tl"
  }, sch.evts.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.key,
    className: `tle ${e.type}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "tle-dt"
  }, "D\xEDa ", e.day, " \xB7 ", e.ds), /*#__PURE__*/React.createElement("div", {
    className: "tle-t"
  }, e.title), /*#__PURE__*/React.createElement("div", {
    className: "tle-d"
  }, e.detail)))), /*#__PURE__*/React.createElement("div", {
    className: "lnote"
  }, "Tiempos para Tenjo, Cundinamarca (2600 m.s.n.m., 12\u201318\xB0C ambiente). Ajustados por EB estimada de la receta activa."))), tab === 'produccion' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "panel no-print",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      marginBottom: 10
    }
  }, "Tipo de contenedor"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 10
    }
  }, BAG_TYPES.map(bt => {
    const on = prodBagType === bt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: bt.id,
      onClick: () => {
        setProdBagType(bt.id);
        setProdKg(bt.kgHumedo);
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        padding: '8px 12px',
        border: `1.5px solid ${on ? bt.color : 'var(--border-soft)'}`,
        borderRadius: 'var(--r-sm)',
        background: on ? 'var(--paper-100)' : 'var(--paper-50)',
        cursor: 'pointer',
        textAlign: 'left',
        minWidth: 170,
        transition: 'all .12s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-sm)",
        color: on ? bt.color : 'var(--ink-900)'
      }
    }, bt.icon, " ", bt.name.split('·')[0].trim()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)'
      }
    }, bt.dim, " \xB7 ", bt.kgHumedo, " kg h\xFAmedo \xB7 ", bt.vol_L, " L"));
  })), (() => {
    const bt = BAG_TYPES.find(b => b.id === prodBagType);
    if (!bt) return null;
    const tc = bt.tratamiento === 'thermal' ? {
      bg: '#FBF6E8',
      br: '#D4A838',
      fg: '#7A5A10',
      icon: '♨',
      lbl: 'Requiere pasteurización térmica (núcleo 65–75°C · 6–8h + 25% altitud)'
    } : bt.tratamiento === 'cwlp_thermal' ? {
      bg: '#EEF3EA',
      br: '#90A870',
      fg: '#3D5520',
      lbl: 'Compatible con CWLP (cal en frío) o pasteurización'
    } : {
      bg: '#FCEEE9',
      br: '#E8B4A0',
      fg: '#B5451F',
      lbl: 'Requiere autoclave 121°C / 15 PSI'
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '7px 11px',
        background: tc.bg,
        border: `1px solid ${tc.br}`,
        borderRadius: 'var(--r-xs)',
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: tc.fg,
        marginBottom: 7
      }
    }, tc.icon, " ", /*#__PURE__*/React.createElement("b", null, "Tratamiento:"), " ", tc.lbl), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        lineHeight: 1.5
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-900)'
      }
    }, "Uso:"), " ", bt.notas), bt.produccion && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-700)',
        lineHeight: 1.5,
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-900)'
      }
    }, "Producci\xF3n:"), " ", bt.produccion));
  })()), /*#__PURE__*/React.createElement("div", {
    className: "panel no-print",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
      paddingBottom: 12,
      borderBottom: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-sm)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-800)'
    }
  }, "Hoja de Producci\xF3n \u2014 Lote")), !recipe.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: 'var(--status-attention)',
      background: 'var(--status-attention-bg)',
      border: '1px solid var(--status-attention)',
      borderRadius: 'var(--r-sm)'
    }
  }, "No hay receta activa. Arma una en ", /*#__PURE__*/React.createElement("strong", null, "Formulador"), " o genera una autom\xE1ticamente en ", /*#__PURE__*/React.createElement("strong", null, "Generar"), ".") : /*#__PURE__*/React.createElement(React.Fragment, null, an && !balanced && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px',
      marginBottom: 14,
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: '#C53030',
      background: 'rgba(197,48,48,.08)',
      border: '1px solid #C53030',
      borderRadius: 'var(--r-sm)'
    }
  }, "\u26A0 ", balMsg, " \u2014 no se puede ejecutar el lote ni guardar la receta hasta que la mezcla cierre en 100% (\xB1", MASS_BALANCE_TOL, "%). Ajusta los porcentajes en el ", /*#__PURE__*/React.createElement("strong", null, "Formulador"), "."), /*#__PURE__*/React.createElement("div", {
    className: "prod-batch-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1.2fr 1fr auto',
      gap: 10,
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "prod-skey",
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      display: 'block',
      marginBottom: 5
    }
  }, "Especie"), /*#__PURE__*/React.createElement("select", {
    id: "prod-skey",
    value: sKey,
    onChange: e => setSKey(e.target.value),
    style: {
      width: '100%',
      padding: '9px 11px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-50)',
      fontFamily: 'var(--font-body)',
      fontSize: "var(--text-base)"
    }
  }, Object.entries(SPP).map(([k, s]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, s.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "prod-bags",
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      display: 'block',
      marginBottom: 5
    }
  }, "# Bolsas"), /*#__PURE__*/React.createElement("input", {
    id: "prod-bags",
    type: "number",
    min: "1",
    step: "1",
    value: prodBags,
    onChange: e => {
      const v = e.target.value;
      setProdBags(v === '' ? '' : parseInt(v) || '');
    },
    onBlur: () => {
      if (prodBags === '' || isNaN(prodBags)) setProdBags(1);
    },
    style: {
      width: '100%',
      padding: '9px 11px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-50)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-base)"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "prod-kg",
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      display: 'block',
      marginBottom: 5
    }
  }, "kg / bolsa"), /*#__PURE__*/React.createElement("input", {
    id: "prod-kg",
    type: "number",
    min: "0.1",
    step: "0.1",
    value: prodKg,
    onChange: e => {
      const v = e.target.value;
      setProdKg(v === '' ? '' : parseFloat(v) || '');
    },
    onBlur: () => {
      if (prodKg === '' || isNaN(prodKg)) setProdKg(1.5);
    },
    style: {
      width: '100%',
      padding: '9px 11px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-50)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-base)"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "prod-h",
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      display: 'block',
      marginBottom: 5
    }
  }, "Humedad % \xB7 In\xF3culo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: "prod-h",
    type: "number",
    min: "55",
    max: "75",
    step: "1",
    value: prodH,
    onChange: e => {
      const v = e.target.value;
      setProdH(v === '' ? '' : parseInt(v) || '');
    },
    onBlur: () => {
      if (prodH === '' || isNaN(prodH)) setProdH(67);
    },
    style: {
      width: '50%',
      padding: '9px 8px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-50)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-base)"
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: prodDate,
    onChange: e => setProdDate(e.target.value),
    style: {
      width: '50%',
      padding: '9px 6px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-50)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)"
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "prod-scale",
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      display: 'block',
      marginBottom: 5
    }
  }, "B\xE1scula (g)"), /*#__PURE__*/React.createElement("select", {
    id: "prod-scale",
    value: prodScaleG,
    onChange: e => setProdScaleG(parseFloat(e.target.value)),
    style: {
      width: '100%',
      padding: '9px 11px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-50)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-base)"
    }
  }, [['0.1', '0.1 g (100 mg)'], ['1', '1 g'], ['5', '5 g'], ['10', '10 g'], ['50', '50 g']].map(([v, l]) => /*#__PURE__*/React.createElement("option", {
    key: v,
    value: v
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 140
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "prod-lote",
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      display: 'block',
      marginBottom: 5
    }
  }, "N.\xBA lote"), /*#__PURE__*/React.createElement("input", {
    id: "prod-lote",
    type: "text",
    value: prodLoteNum,
    onChange: e => setProdLoteNum(e.target.value),
    placeholder: "L-2026-047",
    maxLength: 24,
    style: {
      width: '100%',
      padding: '9px 11px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-50)',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), Object.keys(prodMoist).length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setProdMoist({}),
    title: "Volver a las humedades de la base de datos",
    style: {
      padding: '9px 12px',
      background: 'var(--paper-50)',
      color: 'var(--ink-500)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-sm)',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: "var(--text-sm)",
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      alignSelf: 'flex-end'
    }
  }, "\u21BA H\u2082O"), /*#__PURE__*/React.createElement("button", {
    onClick: exportPDF,
    disabled: !balanced,
    title: balanced ? '' : balMsg,
    style: {
      padding: '9px 14px',
      background: balanced ? 'var(--ink-900)' : 'var(--paper-300)',
      color: balanced ? 'var(--paper-50)' : 'var(--ink-500)',
      border: 'none',
      borderRadius: 'var(--r-sm)',
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-sm)",
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      cursor: balanced ? 'pointer' : 'not-allowed',
      whiteSpace: 'nowrap',
      alignSelf: 'flex-end'
    }
  }, "\u2193 PDF"), /*#__PURE__*/React.createElement("button", {
    onClick: printProdSheet,
    disabled: !balanced,
    title: balanced ? '' : balMsg,
    style: {
      padding: '9px 14px',
      background: balanced ? 'var(--coral-500)' : 'var(--paper-300)',
      color: balanced ? 'var(--paper-0)' : 'var(--ink-500)',
      border: 'none',
      borderRadius: 'var(--r-sm)',
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-sm)",
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      cursor: balanced ? 'pointer' : 'not-allowed',
      whiteSpace: 'nowrap',
      alignSelf: 'flex-end'
    }
  }, "Imprimir"), /*#__PURE__*/React.createElement("button", {
    onClick: () => prodRows && ejecutarLote(prodRows, prodLoteNum, prodDate),
    disabled: !prodRows,
    title: prodRows ? "Descontar kg comerciales del inventario (FIFO)" : !balanced ? balMsg : 'Completa # bolsas y kg/bolsa para generar la ficha',
    style: {
      padding: '9px 14px',
      background: prodRows ? 'var(--moss-700)' : 'var(--paper-300)',
      color: prodRows ? 'var(--paper-0)' : 'var(--ink-500)',
      border: 'none',
      borderRadius: 'var(--r-sm)',
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-sm)",
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      cursor: prodRows ? 'pointer' : 'not-allowed',
      whiteSpace: 'nowrap',
      alignSelf: 'flex-end',
      transition: 'background .15s'
    }
  }, "\u26A1 Ejecutar lote"), loteSyncErr && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-xs)",
      color: '#C53030',
      alignSelf: 'flex-end',
      marginBottom: 9
    },
    title: loteSyncErr
  }, "\u26A0 sin sincronizar"))))), recipe.length > 0 && an && balanced && (() => {
    // Override de humedad por insumo: usa el valor real medido del lote del día
    const prodIngs = effectiveINGS.map(g => prodMoist[g.id] != null ? {
      ...g,
      moisture: prodMoist[g.id]
    } : g);
    const pb = calcBatch(recipe, prodBags || 1, prodKg || 1.5, prodH || 67, spawnCost, prodIngs, an?.dynSpawn);
    const ptr = calcTreatment(an, sKey);
    const psch = calcSchedule(sKey, prodDate, an?.eb);
    const spn = an?.dynSpawn || ptr?.spawn || 8;
    if (!pb) return null;
    // ── Redondeo a resolución real de báscula + recálculo del C:N efectivo ──
    const resG = prodScaleG || 0.1;
    const roundG = x => Math.round(x / resG) * resG;
    const rows = recipe.map(r => {
      const g = prodIngs.find(x => x.id === r.id);
      const it = g ? pb.items.find(x => x.name === g.name) : null;
      const krTeo = it ? it.kr : 0;
      const grR = roundG(krTeo * 1000); // gramos redondeados a báscula
      const m = g ? Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)) : 0;
      const masaSecaR = grR / 1000 * (1 - m); // masa seca real tras redondeo
      return {
        g,
        r,
        krTeo,
        grR,
        m,
        masaSecaR
      };
    });
    const dryR = rows.reduce((s, x) => s + x.masaSecaR, 0);
    const kgComR = rows.reduce((s, x) => s + x.grR / 1000, 0);
    const recipeR = rows.filter(x => x.g).map(x => ({
      id: x.g.id,
      p: dryR > 0 ? x.masaSecaR / dryR * 100 : 0
    }));
    const anR = analyze(recipeR, sKey, effectiveINGS) || an;
    const hFr = Math.min(0.85, Math.max(0.40, (prodH || 67) / 100));
    const aguaTotR = dryR * (hFr / (1 - hFr));
    const aguaInhR = rows.reduce((s, x) => s + x.grR / 1000 * x.m, 0);
    const aguaR = Math.max(0, aguaTotR - aguaInhR);
    const cnDrift = Math.abs(anR.cn - an.cn);
    const trSteps = {
      autoclave: `Esterilizar en autoclave a ${ptr?.temp || '121°C/15 PSI'} durante ${ptr?.time || '90–120 min'}. Purgar aire al inicio. A 2.600 msnm la presión compensa la altitud.`,
      thermal: `Pasteurizar sosteniendo el núcleo del sustrato a 65–75°C por ${ptr?.time || '6–8 h'} (factor +25% por altitud, agua ~91°C a 2.580 msnm). Medir el centro de la masa con termómetro de pincho, no solo el agua.`,
      cwlp: `Inmersión en cal hidratada (150–200 g/100 L, pH≥12) por ${ptr?.time || '18–24 h'}. No requiere calor.`
    };
    const steps = [`Pesar los ingredientes según la tabla (báscula ${resG} g · total seco ${dryR.toFixed(2)} kg). Verificar cada peso.`, `Mezclar en seco hasta color y textura homogéneos.`, `Hidratar: añadir ${aguaR.toFixed(2)} L de agua limpia. Humedad objetivo ${prodH}%. Prueba de puño: al apretar caen 1–2 gotas.`, trSteps[ptr?.col] || 'Aplicar tratamiento térmico/químico recomendado.', `Escurrir y enfriar a <25°C (mín. 4–6 h) en superficie limpia tapada.`, `Inocular spawn ${spn}% (${pb.spawn.toFixed(2)} kg) con manos/superficies desinfectadas (alcohol 70%). ${ptr?.col === 'autoclave' ? 'Usar flujo laminar o caja SAB.' : ''}`, `Embolsar ${prodBags} bolsas × ${prodKg} kg. Cerrar con filtro. Rotular lote y fecha (${prodDate}).`, `Incubar en oscuridad${an.sp?.temp_fruit ? ` · fructificación ${an.sp.temp_fruit}` : ''}. Seguir cronograma de abajo.`];
    const fechas = psch ? psch.evts.filter(e => ['in', 'c1', 'pr', 'f1'].includes(e.key)).map(e => [e.title, `${e.ds} · día ${e.day}`]) : [];
    return /*#__PURE__*/React.createElement("div", {
      className: "panel prod-sheet",
      style: {
        padding: '26px 28px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ps-head",
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid var(--ink-900,#222)',
        paddingBottom: 12,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)'
      }
    }, "Setas de la Pe\xF1a \xB7 Tenjo 2.600 msnm"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 26,
        fontWeight: 700,
        color: 'var(--ink-900,#222)',
        lineHeight: 1.1,
        marginTop: 2
      }
    }, "Hoja de Producci\xF3n"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-base)",
        color: 'var(--ink-900)',
        marginTop: 2
      }
    }, an.sp?.name, " \xB7 ", /*#__PURE__*/React.createElement("i", null, an.sp?.scientific))), /*#__PURE__*/React.createElement("div", {
      className: "ps-head-right",
      style: {
        textAlign: 'right',
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-500)'
      }
    }, /*#__PURE__*/React.createElement("div", null, "Fecha lote: ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-900)'
      }
    }, prodDate)), /*#__PURE__*/React.createElement("div", null, prodBags, " bolsas \xD7 ", prodKg, " kg = ", pb.wet.toFixed(1), " kg h\xFAmedo"), /*#__PURE__*/React.createElement("div", null, (() => {
      const bt = BAG_TYPES.find(b => b.id === prodBagType);
      return bt ? /*#__PURE__*/React.createElement("span", null, bt.icon, " ", bt.name.split('·')[0].trim(), " \xB7 ", bt.dim) : null;
    })()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: 'var(--ink-900)'
      }
    }, 'N.\u00ba ' + (prodLoteNum || '___________')))), /*#__PURE__*/React.createElement("div", {
      className: "ps-kpi",
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5,1fr)',
        gap: 1,
        background: 'var(--border-soft)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-xs)',
        overflow: 'hidden',
        marginBottom: 20
      }
    }, [['C:N', an.cn.toFixed(1) + ':1', 'relaci\u00f3n'], ['Nitr\u00f3geno', an.avgN.toFixed(2) + '%', 'total'], ['Ef. biol\u00f3gica', (an.ebLow ?? an.eb.toFixed(0)) + '\u2013' + (an.ebHigh ?? an.eb.toFixed(0)) + '%', 'estimada'], ['Score', opt.score + '/100', 'perito'], ['Costo/kg', '$' + Math.round(an.cost).toLocaleString('es-CO'), 'estimado']].map(([l, v, s]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        background: 'var(--paper-50)',
        padding: '10px 6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-2xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-700)',
        marginBottom: 3
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 20,
        color: 'var(--ink-900)',
        lineHeight: 1,
        marginBottom: 2
      }
    }, v), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-2xs)",
        color: 'var(--ink-400)'
      }
    }, s)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 22,
        color: 'var(--coral-500)',
        lineHeight: 1,
        flexShrink: 0
      }
    }, "1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-900)'
      }
    }, "Pesado de ingredientes"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)',
        marginTop: 1
      }
    }, "b\\u00e1scula \xB7 res. ", resG, " g"))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)',
        marginBottom: 8
      }
    }, "Masa seca requerida: ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-900)'
      }
    }, dryR.toFixed(2), " kg"), " = ", pb.wet.toFixed(1), " kg h\xFAmedo \xD7 (1 \u2212 ", prodH, "%). Gramos redondeados a la b\xE1scula (", resG, " g). Edita la columna ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-900)'
      }
    }, "H\u2082O%"), " con la humedad real del insumo del d\xEDa."), /*#__PURE__*/React.createElement("div", {
      className: "ps-tbl-wrap"
    }, /*#__PURE__*/React.createElement("table", {
      className: "prod-tbl",
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Ingrediente"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "%"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'center',
        width: 62
      }
    }, "H\u2082O%"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Gramos"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Kg"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Seco kg"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'center',
        width: 46
      }
    }, "Hecho"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((x, i) => {
      const id = x.r.id;
      const baseM = x.g ? x.g.moisture : 0;
      const ov = prodMoist[id] != null;
      return /*#__PURE__*/React.createElement("tr", {
        key: i
      }, /*#__PURE__*/React.createElement("td", null, x.g ? x.g.name : id, ov ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--coral-500)',
          fontSize: "var(--text-xs)"
        }
      }, " \xB7 ajustado") : null), /*#__PURE__*/React.createElement("td", {
        className: "num"
      }, parseFloat(x.r.p).toFixed(1)), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        max: "92",
        step: "1",
        value: prodMoist[id] != null ? prodMoist[id] : baseM,
        onChange: e => {
          const v = e.target.value;
          setProdMoist(prev => {
            const n = {
              ...prev
            };
            if (v === '') delete n[id];else n[id] = Math.min(92, Math.max(0, parseFloat(v) || 0));
            return n;
          });
        },
        style: {
          width: 44,
          padding: '2px 4px',
          textAlign: 'center',
          border: `1px solid ${ov ? 'var(--coral-500)' : 'var(--paper-300)'}`,
          borderRadius: 3,
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-sm)",
          background: ov ? 'var(--coral-50,#FCEEE9)' : 'var(--paper-0)'
        }
      })), /*#__PURE__*/React.createElement("td", {
        className: "num"
      }, Math.round(x.grR).toLocaleString()), /*#__PURE__*/React.createElement("td", {
        className: "num"
      }, x.grR >= 500 ? (x.grR / 1000).toFixed(2) : '—'), /*#__PURE__*/React.createElement("td", {
        className: "num",
        style: {
          color: 'var(--ink-500)'
        }
      }, x.masaSecaR.toFixed(2)), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: !!checkedSteps['ing_' + i],
        onChange: e => setCheckedSteps(prev => ({
          ...prev,
          ['ing_' + i]: e.target.checked
        })),
        style: {
          accentColor: 'var(--coral-500)',
          width: 14,
          height: 14,
          cursor: 'pointer'
        }
      })));
    }), /*#__PURE__*/React.createElement("tr", {
      className: "tot"
    }, /*#__PURE__*/React.createElement("td", null, "Total a pesar (h\xFAmedo comercial)"), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, "100"), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, Math.round(kgComR * 1000).toLocaleString()), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, kgComR.toFixed(2)), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, dryR.toFixed(2)), /*#__PURE__*/React.createElement("td", null))))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: cnDrift > 0.5 ? 'var(--coral-600,#B5451F)' : 'var(--ink-500)',
        marginBottom: 16,
        padding: '5px 9px',
        background: cnDrift > 0.5 ? 'var(--coral-50,#FCEEE9)' : 'var(--paper-50)',
        border: `1px solid ${cnDrift > 0.5 ? 'var(--coral-300,#E8B4A0)' : 'var(--paper-300)'}`
      }
    }, "C:N te\xF3rico ", an.cn.toFixed(1), " \u2192 ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-900)'
      }
    }, "efectivo ", anR.cn.toFixed(1)), " \xB7 N ", anR.avgN.toFixed(2), "% \xB7 EB ~", anR.eb.toFixed(0), "%", cnDrift > 0.5 ? ' · ⚠ el redondeo desvía el C:N: considera un lote más grande' : ' · desvío despreciable a esta resolución'), /*#__PURE__*/React.createElement("div", {
      className: "ps-3col",
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 10,
        marginBottom: 18
      }
    }, [['Agua neta a inyectar', `${aguaR.toFixed(2)} L`, `req. ${aguaTotR.toFixed(1)} L − ${aguaInhR.toFixed(1)} L ya en insumos`], [`Spawn (${spn}%)`, `${pb.spawn.toFixed(2)} kg`, 'micelio en grano · 8% del húmedo'], ['Sustrato húmedo final', `${pb.wet.toFixed(1)} kg`, `${prodBags} bolsas × ${prodKg} kg · ${prodH}% H₂O`]].map(([l, v, s]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        border: '1px solid var(--paper-300)',
        padding: '10px 12px',
        background: 'var(--paper-50)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--ink-700)',
        marginBottom: 3,
        fontWeight: 700
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 20,
        fontWeight: 600,
        color: 'var(--ink-900,#222)'
      }
    }, v), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-600)',
        marginTop: 1,
        fontWeight: 500
      }
    }, s)))), ptr && /*#__PURE__*/React.createElement("div", {
      style: {
        border: '1px solid var(--paper-300)',
        padding: '10px 14px',
        marginBottom: 18,
        background: 'var(--paper-50)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 20,
        color: 'var(--coral-500)',
        lineHeight: 1,
        flexShrink: 0
      }
    }, "2"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-900)'
      }
    }, "Tratamiento \u2014 ", ptr.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-900)'
      }
    }, ptr.temp, " \xB7 ", ptr.time, " \xB7 Spawn ", ptr.spawn, "%"), ptr.reasons?.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)',
        marginTop: 4
      }
    }, ptr.reasons.join(' · '))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 22,
        color: 'var(--coral-500)',
        lineHeight: 1,
        flexShrink: 0
      }
    }, "3"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-900)'
      }
    }, "Procedimiento")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 18
      }
    }, steps.map((t, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "prod-step",
      style: {
        opacity: checkedSteps['step_' + i] ? 0.4 : 1,
        transition: 'opacity .2s'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!checkedSteps['step_' + i],
      onChange: e => setCheckedSteps(prev => ({
        ...prev,
        ['step_' + i]: e.target.checked
      })),
      style: {
        accentColor: 'var(--coral-500)',
        width: 14,
        height: 14,
        cursor: 'pointer',
        flexShrink: 0,
        marginTop: 3
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "prod-step-n"
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      className: "prod-step-t",
      style: {
        textDecoration: checkedSteps['step_' + i] ? 'line-through' : 'none'
      }
    }, t)))), fechas.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-num)',
        fontSize: 22,
        color: 'var(--coral-500)',
        lineHeight: 1,
        flexShrink: 0
      }
    }, "4"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-900)'
      }
    }, "Fechas clave"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-500)',
        marginTop: 1
      }
    }, "estimadas \xB7 EB ", an.eb.toFixed(0), "%"))), /*#__PURE__*/React.createElement("div", {
      className: "ps-fechas-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ps-fechas",
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${fechas.length},1fr)`,
        gap: 1,
        background: 'var(--paper-300)',
        border: '1px solid var(--paper-300)'
      }
    }, fechas.map(([l, v]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        background: 'var(--paper-0)',
        padding: '8px 6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: "var(--text-2xs)",
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--ink-500)',
        marginBottom: 2
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-sm)",
        color: 'var(--ink-900,#222)'
      }
    }, v)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 14,
        borderTop: '2px solid var(--ink-900)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ps-sig",
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
        marginBottom: 18
      }
    }, [['Operario'], ['Hora inicio'], ['Verificado por']].map(([l]) => /*#__PURE__*/React.createElement("div", {
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-700)',
        marginBottom: 6
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        borderBottom: '1px solid var(--ink-600)',
        height: 26
      }
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: "var(--text-xs)",
        letterSpacing: 'var(--tracking-button)',
        textTransform: 'uppercase',
        color: 'var(--ink-700)',
        marginBottom: 6
      }
    }, "Observaciones del lote"), /*#__PURE__*/React.createElement("div", {
      style: {
        borderBottom: '1px solid var(--paper-400)',
        height: 22,
        marginBottom: 10
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        borderBottom: '1px solid var(--paper-400)',
        height: 22
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        fontFamily: 'var(--font-mono)',
        fontSize: "var(--text-xs)",
        color: 'var(--ink-400)',
        textAlign: 'right',
        letterSpacing: 'var(--tracking-label)'
      }
    }, "Setas de la Pe\\u00f1a \xB7 Tenjo 2.600 msnm \xB7 simulador v9.1")));
  })()), tab === 'inventario' && BodegaSection(), tab === 'dashboard' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-2xs)",
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--ink-400)'
    }
  }, saved.length, " receta", saved.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap'
    }
  }, ['all', ...Object.keys(SPP)].map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: `cat${dashFilter === k ? ' on' : ''}`,
    onClick: () => setDashFilter(k)
  }, k === 'all' ? 'Todas' : SPP[k]?.name)))), saved.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "rec-empty"
  }, "No hay recetas guardadas.", /*#__PURE__*/React.createElement("br", null), "Crea y guarda desde el Formulador.") : (() => {
    const filtered = saved.filter(e => dashFilter === 'all' || e.sKey === dashFilter);
    if (!filtered.length) return /*#__PURE__*/React.createElement("div", {
      className: "sempty"
    }, "Sin recetas para esta especie.");
    const sorted = [...filtered].sort((a, b) => (parseFloat(b.eb) || 0) - (parseFloat(a.eb) || 0));
    return /*#__PURE__*/React.createElement("div", {
      className: "dash-grid"
    }, sorted.map(e => {
      const s2 = SPP[e.sKey];
      const band = BANDS[e.sKey] || 'var(--ink-700)';
      const eb = parseFloat(e.eb) || 0;
      const sc = liveScoreFor(e);
      // Costo ingredientes: guardado o recalculado al vuelo
      const costIngKg = e.cost > 0 ? e.cost : (() => {
        const a2 = analyze(e.recipe, e.sKey, effectiveINGS);
        return a2 ? Math.round(a2.cost) : 0;
      })();
      // Costo energético: guardado (recetas nuevas) o estimado por especie (recetas antiguas)
      const eDash = e.energyCopKg != null ? e.energyCopKg : energyCostPerKgSeco(['shiitake', 'lions_mane', 'reishi', 'nameko'].includes(e.sKey) ? 'autoclave' : 'thermal', e.sKey);
      const costKg = costIngKg + eDash;
      const hFactor = e.sKey === 'shiitake' || e.sKey === 'lions_mane' || e.sKey === 'reishi' ? 0.40 : 0.35;
      return /*#__PURE__*/React.createElement("div", {
        key: e.id,
        className: "dash-card",
        style: {
          borderTopColor: band
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "dash-card-top"
      }, /*#__PURE__*/React.createElement("div", {
        className: "dash-card-name"
      }, e.name), /*#__PURE__*/React.createElement("div", {
        className: "dash-card-spp"
      }, s2?.name, " \xB7 ", e.date)), /*#__PURE__*/React.createElement("div", {
        className: "dash-card-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "dash-kv"
      }, /*#__PURE__*/React.createElement("span", {
        className: "dk"
      }, "EB estimada"), /*#__PURE__*/React.createElement("span", {
        className: "dv",
        style: {
          color: eb >= 100 ? 'var(--moss-500)' : eb >= 80 ? 'var(--ochre-500,#A07828)' : 'var(--coral-500)'
        }
      }, e.eb, "%")), sc > 0 && /*#__PURE__*/React.createElement("div", {
        className: "dash-kv"
      }, /*#__PURE__*/React.createElement("span", {
        className: "dk"
      }, "Score"), /*#__PURE__*/React.createElement("span", {
        className: "dv",
        style: {
          color: sc >= 80 ? 'var(--moss-500)' : sc >= 60 ? 'var(--ochre-500,#A07828)' : 'var(--coral-500)'
        }
      }, sc, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: 'var(--border-soft)'
        }
      }, "/100"))), /*#__PURE__*/React.createElement("div", {
        className: "dash-kv"
      }, /*#__PURE__*/React.createElement("span", {
        className: "dk"
      }, "C:N"), /*#__PURE__*/React.createElement("span", {
        className: "dv"
      }, e.cn, ":1")), /*#__PURE__*/React.createElement("div", {
        className: "dash-kv"
      }, /*#__PURE__*/React.createElement("span", {
        className: "dk"
      }, "Ingredientes"), /*#__PURE__*/React.createElement("span", {
        className: "dv"
      }, e.recipe.length)), costKg > 0 && /*#__PURE__*/React.createElement("div", {
        className: "dash-kv"
      }, /*#__PURE__*/React.createElement("span", {
        className: "dk"
      }, "Costo total/kg"), /*#__PURE__*/React.createElement("span", {
        className: "dv",
        style: {
          color: 'var(--coral-700)',
          fontFamily: 'var(--font-num)',
          fontSize: "var(--text-base)"
        },
        title: `Ingredientes: $${costIngKg.toLocaleString('es-CO')} + Energía proceso: $${eDash.toLocaleString('es-CO')}`
      }, "$", costKg.toLocaleString('es-CO'), " COP", eDash > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-xs)",
          color: 'var(--ink-500)',
          marginLeft: 4
        }
      }, "\u26A1+$", eDash.toLocaleString())))), costKg > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 0,
          borderTop: '1px solid var(--paper-300)'
        }
      }, [{
        nom: '20×50',
        kgH: 1.8
      }, {
        nom: '18×35',
        kgH: 1.0
      }, {
        nom: 'Punch',
        kgH: 3.5
      }].map(b => /*#__PURE__*/React.createElement("div", {
        key: b.nom,
        style: {
          flex: 1,
          padding: '4px 6px',
          borderRight: '1px solid var(--paper-300)',
          textAlign: 'center',
          background: 'var(--paper-50)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-micro)",
          color: 'var(--ink-500)',
          marginBottom: 1
        }
      }, b.nom), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-num)',
          fontSize: "var(--text-sm)",
          color: 'var(--coral-700)',
          fontWeight: 700
        }
      }, "$", Math.round(costKg * b.kgH * hFactor).toLocaleString('es-CO')), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: "var(--text-micro)",
          color: 'var(--ink-500)'
        }
      }, "COP/bolsa")))), /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '4px 16px 10px',
          background: 'var(--paper-50)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3
        }
      }, e.recipe.slice(0, 4).map(r => {
        const g = INGS.find(i => i.id === r.id);
        return g ? /*#__PURE__*/React.createElement("span", {
          key: r.id,
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            padding: '1px 5px',
            background: 'var(--paper-100)',
            border: '1px solid var(--paper-300)',
            color: 'var(--ink-500)'
          }
        }, g.name.length > 15 ? g.name.slice(0, 15) + '…' : g.name, " ", r.p, "%") : null;
      }), e.recipe.length > 4 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: 'var(--border-soft)',
          padding: '1px 3px'
        }
      }, "+", e.recipe.length - 4, " m\xE1s"))), /*#__PURE__*/React.createElement("div", {
        className: "dash-card-foot"
      }, /*#__PURE__*/React.createElement("button", {
        className: "sload",
        style: {
          flex: 1
        },
        onClick: () => {
          loadR(e);
        }
      }, "Cargar"), /*#__PURE__*/React.createElement("button", {
        className: "sdel",
        onClick: () => delR(e.id)
      }, "\u2715")));
    }));
  })())), tab === 'bitacora' && BitacoraSection(), confirmDlg && /*#__PURE__*/React.createElement(ConfirmModal, {
    dlg: confirmDlg,
    onClose: () => setConfirmDlg(null)
  }), promptDlg && /*#__PURE__*/React.createElement(PromptModal, {
    dlg: promptDlg,
    onClose: () => setPromptDlg(null)
  }), noticeDlg && /*#__PURE__*/React.createElement(NoticeModal, {
    dlg: noticeDlg,
    onClose: () => setNoticeDlg(null)
  }), loteBatchConfirm && /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-bg",
    onClick: e => {
      if (e.target === e.currentTarget) setLoteBatchConfirm(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal",
    style: {
      width: 520,
      maxWidth: 'calc(100vw - 32px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-title"
  }, "\u26A1 Ejecutar lote \u2014 confirmar descuento de inventario"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: 'var(--ink-700)',
      marginBottom: 14
    }
  }, "Lote ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink-900)'
    }
  }, loteBatchConfirm.loteNum || '—'), " \xB7 ", loteBatchConfirm.fecha, " \u2014 se descontar\xE1n los kg comerciales (FIFO, del lote m\xE1s antiguo al m\xE1s nuevo)."), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ['Ingrediente', 'Requerido kg', 'Stock kg', ''].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: h === 'Requerido kg' || h === 'Stock kg' ? 'right' : 'left',
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-800)',
      borderBottom: '1.5px solid var(--ink-900)',
      padding: '6px 8px'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, loteBatchConfirm.preview.map(row => /*#__PURE__*/React.createElement("tr", {
    key: row.id,
    style: {
      background: row.ok ? 'transparent' : 'color-mix(in oklab,var(--coral-200) 30%,var(--paper-50))'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      borderBottom: '1px solid var(--paper-300)',
      color: 'var(--ink-900)'
    }
  }, row.name), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      borderBottom: '1px solid var(--paper-300)',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }, row.krKg.toFixed(3)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      borderBottom: '1px solid var(--paper-300)',
      textAlign: 'right',
      color: row.ok ? 'var(--moss-700)' : 'var(--coral-700)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, row.stockActual.toFixed(3)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      borderBottom: '1px solid var(--paper-300)',
      textAlign: 'center',
      fontSize: "var(--text-base)"
    }
  }, row.ok ? '✓' : '⚠'))))), loteBatchConfirm.preview.some(r => !r.ok) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: 'var(--coral-700)',
      background: 'color-mix(in oklab,var(--coral-100) 60%,var(--paper-50))',
      border: '1px solid var(--coral-200)',
      borderRadius: 4,
      padding: '8px 12px',
      marginBottom: 12
    }
  }, "\u26A0 Uno o m\xE1s ingredientes no tienen stock suficiente \u2014 se descontar\xE1 lo disponible y el faltante quedar\xE1 a 0."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setLoteBatchConfirm(null),
    className: "inv-btn inv-btn-sec"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: confirmarEjecucion,
    className: "inv-btn inv-btn-pri"
  }, "Confirmar y descontar")))), showBitNuevo && /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-bg",
    onClick: e => {
      if (e.target === e.currentTarget) setShowBitNuevo(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal",
    style: {
      width: 560,
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-title"
  }, "Nueva prueba experimental"), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "C\xF3digo de lote"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    value: bitNuevoForm.codigo || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      codigo: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Especie"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    value: bitNuevoForm.especie || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      especie: e.target.value
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Cepa / proveedor"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    placeholder: "Spawn proveedor X",
    value: bitNuevoForm.cepa || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      cepa: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Operador"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    value: bitNuevoForm.operador || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      operador: e.target.value
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Fecha mezcla"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "inv-input",
    value: bitNuevoForm.fechaMezcla || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      fechaMezcla: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Fecha inoculaci\xF3n"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "inv-input",
    value: bitNuevoForm.fechaInoculacion || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      fechaInoculacion: e.target.value
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-4",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "# Bolsas"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    min: 1,
    value: bitNuevoForm.numBolsas || 6,
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      numBolsas: parseInt(e.target.value) || 1
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "kg h\xFAmedo/bolsa"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    min: 0.1,
    step: 0.1,
    value: bitNuevoForm.pesoHumedo || 1.5,
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      pesoHumedo: parseFloat(e.target.value) || 0.1
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "% spawn"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    min: 1,
    max: 30,
    value: bitNuevoForm.spawnPct || 8,
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      spawnPct: parseFloat(e.target.value) || 8
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Humedad %"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    min: 55,
    max: 80,
    value: bitNuevoForm.humedad || 67,
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      humedad: parseInt(e.target.value) || 67
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Tratamiento"), /*#__PURE__*/React.createElement("select", {
    className: "inv-input",
    value: bitNuevoForm.tratamiento || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      tratamiento: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014"), ['Pasteurización', 'Autoclave', 'Cal hidratada (CWLP)', 'Sin tratamiento'].map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Peso seco (kg)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    step: 0.01,
    value: bitNuevoForm.peseSeco || '',
    placeholder: "auto",
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      peseSeco: parseFloat(e.target.value) || 0
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Objetivo de la prueba"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    placeholder: "ej. Comparar humedad 63% vs 66%",
    value: bitNuevoForm.objetivo || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      objetivo: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Notas"), /*#__PURE__*/React.createElement("textarea", {
    className: "inv-input",
    rows: 2,
    value: bitNuevoForm.notas || '',
    onChange: e => setBitNuevoForm(p => ({
      ...p,
      notas: e.target.value
    })),
    style: {
      resize: 'vertical'
    }
  })), bitNuevoForm.recipeRef && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: "var(--text-sm)",
      color: 'var(--moss-700)',
      background: 'var(--paper-100)',
      border: '1px solid var(--moss-200)',
      borderRadius: 4,
      padding: '7px 12px',
      marginBottom: 14
    }
  }, "Receta vinculada: ", /*#__PURE__*/React.createElement("b", null, bitNuevoForm.recipeRef.name), " \xB7 C:N ", bitNuevoForm.recipeRef.cn, " \xB7 EB ~", bitNuevoForm.recipeRef.eb, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowBitNuevo(false),
    className: "inv-btn inv-btn-sec"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (!bitNuevoForm.codigo?.trim() || !bitNuevoForm.especie?.trim()) {
        setNoticeDlg({
          msg: 'Completa código y especie.'
        });
        return;
      }
      const newId = crearBitLote(bitNuevoForm);
      setBitActiveLoteId(newId);
      goTab('bitacora');
      setBitTab('bit_bolsas');
      setShowBitNuevo(false);
    },
    className: "inv-btn inv-btn-pri"
  }, "Crear lote y generar bolsas")))), showBitCosecha && /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-bg",
    onClick: e => {
      if (e.target === e.currentTarget) setShowBitCosecha(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal",
    style: {
      width: 440
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inv-modal-title"
  }, "Registrar cosecha"), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Bolsa"), /*#__PURE__*/React.createElement("select", {
    className: "inv-input",
    value: bitCosechaForm.bolsaId || '',
    onChange: e => {
      const b = bitBolsas.find(x => x.id === e.target.value);
      setBitCosechaForm(p => ({
        ...p,
        bolsaId: e.target.value,
        codigo: b?.codigo || ''
      }));
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 seleccionar \u2014"), bitBolsas.filter(b => b.loteId === (bitCosechaForm.loteId || bitActiveLoteId)).map(b => /*#__PURE__*/React.createElement("option", {
    key: b.id,
    value: b.id
  }, b.codigo)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Flush #"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    min: 1,
    value: bitCosechaForm.flush || 1,
    onChange: e => setBitCosechaForm(p => ({
      ...p,
      flush: parseInt(e.target.value) || 1
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "inv-row inv-row-2",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Fecha"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "inv-input",
    value: bitCosechaForm.fecha || '',
    onChange: e => setBitCosechaForm(p => ({
      ...p,
      fecha: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Peso fresco (g)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "inv-input",
    min: 0,
    step: 1,
    placeholder: "430",
    value: bitCosechaForm.pesoFresco || '',
    onChange: e => setBitCosechaForm(p => ({
      ...p,
      pesoFresco: parseFloat(e.target.value) || ''
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Calidad"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      paddingTop: 4
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setBitCosechaForm(p => ({
      ...p,
      calidad: n
    })),
    style: {
      padding: '6px 12px',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-xs)',
      fontFamily: 'var(--font-num)',
      fontSize: "var(--text-md)",
      cursor: 'pointer',
      background: (bitCosechaForm.calidad || 0) >= n ? 'var(--ochre-500)' : 'var(--paper-50)',
      color: (bitCosechaForm.calidad || 0) >= n ? 'var(--paper-0)' : 'var(--ink-500)',
      transition: 'all .1s'
    }
  }, "\u2605")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "inv-label"
  }, "Observaciones"), /*#__PURE__*/React.createElement("input", {
    className: "inv-input",
    placeholder: "Buen racimo, amarillamiento leve\u2026",
    value: bitCosechaForm.observaciones || '',
    onChange: e => setBitCosechaForm(p => ({
      ...p,
      observaciones: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowBitCosecha(false),
    className: "inv-btn inv-btn-sec"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (!bitCosechaForm.bolsaId || !bitCosechaForm.pesoFresco) {
        setNoticeDlg({
          msg: 'Selecciona bolsa y peso.'
        });
        return;
      }
      addBitCosecha({
        ...bitCosechaForm,
        loteId: bitActiveLoteId || bitCosechaForm.loteId
      });
      setShowBitCosecha(false);
    },
    className: "inv-btn inv-btn-pri"
  }, "Guardar cosecha")))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40
    }
  })), (RECETA_TABS.includes(tab) || tab === 'produccion' || tab === 'schedule') && /*#__PURE__*/React.createElement("div", {
    className: 'species-bridge' + (bridgeHidden ? ' bridge-hidden' : ''),
    style: {
      cursor: 'pointer'
    },
    onClick: () => setBridgeOpen(o => !o)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bridge-inner"
  }, !hasPickedSpecies ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "bridge-activo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bridge-dot"
  }, "\u25CF"), "Sin especie"), /*#__PURE__*/React.createElement("span", {
    className: "bridge-name"
  }, "Elige una especie para empezar"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "bridge-select",
    value: "",
    onClick: e => e.stopPropagation(),
    onChange: e => {
      if (e.target.value) setSKey(e.target.value);
    },
    "aria-label": "Elegir especie"
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Elegir especie\u2026"), Object.entries(SPP).map(([k, d]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, d.name))), /*#__PURE__*/React.createElement("button", {
    className: "bridge-cambiar",
    onClick: e => {
      e.stopPropagation();
      goTab('catalogo');
    },
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      padding: '6px 12px',
      background: 'var(--accent-terracotta)',
      color: '#fff',
      border: '1px solid var(--accent-terracotta)',
      cursor: 'pointer',
      transition: 'all .15s',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, "Ver cat\xE1logo"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "bridge-activo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bridge-dot"
  }, "\u25CF"), "Activo"), /*#__PURE__*/React.createElement("span", {
    className: "bridge-name"
  }, sp.name), bridgeOpen && /*#__PURE__*/React.createElement("em", {
    className: "bridge-sci"
  }, sp.scientific), bridgeOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      alignItems: 'center',
      flexShrink: 0
    },
    className: "bridge-stats-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bridge-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bridge-stat-lbl"
  }, "C:N"), /*#__PURE__*/React.createElement("span", {
    className: "bridge-stat-val"
  }, sp.cn_optimal.ideal, " : 1")), /*#__PURE__*/React.createElement("div", {
    className: "bridge-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bridge-stat-lbl"
  }, "Temp"), /*#__PURE__*/React.createElement("span", {
    className: "bridge-stat-val"
  }, sp.temp_fruit)), /*#__PURE__*/React.createElement("div", {
    className: "bridge-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bridge-stat-lbl"
  }, "CO Base"), /*#__PURE__*/React.createElement("span", {
    className: "bridge-stat-val"
  }, sp.eb_baseline, " %"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "bridge-select",
    value: sKey,
    onClick: e => e.stopPropagation(),
    onChange: e => {
      e.stopPropagation();
      setSKey(e.target.value);
    },
    "aria-label": "Cambiar especie",
    title: "Cambiar especie sin salir del formulador"
  }, Object.entries(SPP).map(([k, d]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, d.name))), bridgeOpen && /*#__PURE__*/React.createElement("button", {
    className: "bridge-cambiar",
    onClick: e => {
      e.stopPropagation();
      goTab('catalogo');
    },
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 800,
      fontSize: "var(--text-xs)",
      letterSpacing: 'var(--tracking-button)',
      textTransform: 'uppercase',
      padding: '6px 12px',
      background: 'var(--accent-terracotta)',
      color: '#fff',
      border: '1px solid var(--accent-terracotta)',
      cursor: 'pointer',
      transition: 'all .15s',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, "Ver cat\xE1logo"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--paper-0)',
      opacity: .6,
      fontSize: "var(--text-sm)",
      lineHeight: 1,
      transform: bridgeOpen ? 'rotate(0deg)' : 'rotate(180deg)',
      transition: 'transform .15s'
    }
  }, "\u25BE"))))));
}
window.SimuladorApp = App;

// Sombra izquierda en tiras de scroll horizontal una vez el usuario ha scrolleado
document.addEventListener('scroll', e => {
  const t = e.target;
  if (t && t.classList && (t.classList.contains('cats') || t.classList.contains('presets') || t.classList.contains('sub-tabs') || t.classList.contains('mode-switcher') || t.classList.contains('builder-subtabs'))) {
    t.classList.toggle('scrolled', t.scrollLeft > 4);
  }
}, true);