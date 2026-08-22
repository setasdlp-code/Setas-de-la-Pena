


const {useState,useMemo,useEffect,useRef}=React;

const IMG={
  p_ostreatus_gris:(window.__resources&&window.__resources.img_p_ostreatus_gris)||'_standalone_imgs/grey-mushroom.png',
  p_ostreatus_blanco:(window.__resources&&window.__resources.img_p_ostreatus_blanco)||'_standalone_imgs/orellana-blanca.png',
  p_djamor_rosa:(window.__resources&&window.__resources.img_p_djamor_rosa)||'_standalone_imgs/orellana-rosa.png',
  p_eryngii:(window.__resources&&window.__resources.img_p_eryngii)||'_standalone_imgs/cardo.png',
  shiitake:(window.__resources&&window.__resources.img_shiitake)||'_standalone_imgs/shiitake.png',
  lions_mane:(window.__resources&&window.__resources.img_lions_mane)||'_standalone_imgs/lions-mane.png',
  reishi:(window.__resources&&window.__resources.img_reishi)||'_standalone_imgs/reishi.png',
  enoki:(window.__resources&&window.__resources.img_enoki)||'_standalone_imgs/enoki.png',
  nameko:(window.__resources&&window.__resources.img_nameko)||'_standalone_imgs/nameko.png',
};

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
    'Es la única orellana que fructifica bien a 28–30°C. Si en verano tu cuarto no baja de 26°C, djamor rosa es literalmente la única opción viable — las demás cederán ante el calor.',
    'Su tasa de spawn óptima es inusualmente alta (18–22%). Bajar a 10% alarga la colonización 8–12 días y el riesgo de contaminación se multiplica por tres en climas cálidos.',
    'Pierde el color rosa en menos de 6 horas tras la cosecha a temperatura ambiente. Para mantenerlo, cosecha en primordia pequeña y refrigera de inmediato. El simulador no puede optimizar esto — es post-cosecha pura.'
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
    'La única especie del catálogo que no debes formular con salvado de trigo. El exceso de nitrógeno suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Más nitrógeno = más masa, menos principio activo.',
    'Produce el antílago (polvillo esporal) más denso de todas las especies cultivadas: hasta 20g de esporas por bloque. Ese polvo tiene más concentración de triterpenoides que el cuerpo fructifícola. Colectarlo es tan valioso como la cosecha.',
    'Con aserrín de roble sin enriquecer y temperatura constante de 26°C, el sombrero lacado tarda 45–60 días en completarse. Cada grado extra de temperatura acelera el crecimiento pero reduce la calidad del lacado superficial.'
  ]},
  enoki:{hechos:[
    'El enoki "largo y blanco" del supermercado es un artefacto de cultivo en oscuridad con CO₂ elevado. Si ventiles bien tu cuarto, obtendrás sombreros marrones abiertos — igual de comestibles, radicalmente distintos visualmente.',
    'Fructifica óptimamente a 8–12°C — la temperatura más baja del catálogo. Esto lo hace complementario estacional perfecto: mientras otras especies no fructifican en invierno, enoki llega a su máximo rendimiento.',
    'La colonización es notablemente lenta (18–25 días a 20°C), pero el sustrato colonizado tolera refrigeración hasta 4 semanas sin perder capacidad. Puedes preparar bloques en lote y activarlos cuando necesites.'
  ]},
  nameko:{hechos:[
    'El mucílago que recubre su sombrero es un polisacárido que el propio hongo sintetiza como protección ante pérdida de agua. Paradoja: a mayor humedad relativa (>92%), produce más mucílago, no menos. Es una señal de bienestar, no de estrés.',
    'Requiere la mayor humedad relativa del catálogo durante fructificación (90–95%). Por debajo del 88%, las primordias se secan antes de crecer. Un higrometro preciso es equipamiento no-negociable para esta especie.',
    'Produce consistentemente dos cosechas de calidad similar — inusual. La mayoría de especies caen 30–50% en segunda cosecha. Nameko mantiene el 80–85% del primer rendimiento si el bloque se sumerge en agua fría 12 horas entre flush.'
  ]},
};

// ── GUÍA DE FORMULACIÓN — criterios de selección de ingredientes por especie ──
const SPP_SUBSTRATE_GUIDE={
  p_ostreatus_gris:[
    'Base Cóptima: paja de trigo o cebada (C:N 75–85) al 55–70%. Evita aserín sin compostar — su lignina es inaccesible para esta especie y solo encarece sin aportar.',
    'Suplemento N: salvado de trigo 15–25% más borra de café 7–12%. Esta combinación baja costo y aporta N progresivo; no uses solo uno de los dos si puedes combinarlos.',
    'Ajuste de pH obligatorio: carbonato de calcio 2–5% + yeso 2–3%. Sin tamponamiento, la fermentación acidifica el bloque y colapsa la cosecha 2 y 3.',
    'Evita superar 25% total de suplementos N (salvado + borra + café juntos). Por encima de ese umbral el riesgo de Trichoderma se dispara, especialmente sin autoclave.',
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
    'Evita aserín de madera y sustratos lígneos pesados: el djamor rosa es lignínolítico débil y no aprovechará esa fracción, generando sustrato sin colonizar.',
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
    'Master Mix de referencia: aserín de madera dura 50–60% + cascarilla de soya 35–45%. Esta combinación logra EB 150–180%. No reemplaces cascarilla de soya por salvado de trigo en proporciones iguales — son distintos en densidad nutricional.',
    'Humedad del sustrato seco: apunta a 60–65%, más seco que otras especies. Ingredientes húmedos (borra fresca, pseudotallo de plátano) suben la actividad acuosa y favorecen contaminación.',
    'Evita absolutamente aserín de eucalipto. Sus aceites esenciales inhiben el micelio de Hericium de forma directa e irreversible. Usa solo maderas duras neutras: roble, álamo, sauce.',
    'Afrecho de cervecería 10–15% es un buen suplemento secundario. La cascarilla de soya ya aporta N suficiente — el afrecho suma perfil de aminoácidos sin saturar nitrógeno.',
  ],
  reishi:[
    'No uses salvado de trigo como suplemento principal. El exceso de N libre suprime la síntesis de triterpenoides — los compuestos que hacen valioso al reishi. Máximo 8–10% de suplemento N total.',
    'Base C: aserín de roble 55–65% + corteza de árbol molida 10–15%. La corteza aporta lignina compleja que ralentiza la colonización y estimula la producción de lacasa, necesaria para el lacado del sombrero.',
    'Cascarilla de soya 8–12% es el suplemento N preferido: nitrógeno de liberación lenta que no dispara contaminación ni suprime la ruta de triterpenoides.',
    'Evita ingredientes cálidos o de rápida descomposición (borra de café fresca, pulpa de cacao). El reishi requiere sustrato estático y de baja actividad microbiana durante los 60–90 días de colonización.',
  ],
  enoki:[
    'Base C: paja de arroz 30–40% + aserín de álamo o sauce 15–20%. La paja de arroz da la textura ligera que necesita el enoki para colonizar a baja temperatura (5–12°C).',
    'Suplemento N estrella: afrecho de cervecería 18–25%. Su perfil de aminoácidos estimula el desarrollo de los cuerpos fructíferos alargados que caracterizan al enoki comercial.',
    'Evita cartones y papel como base principal: el enoki necesita sustrato estructuralmente firme para colonizar correctamente en frío. La celulosa pura colapsa y ahoga el micelio.',
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
const BANDS={p_ostreatus_gris:'oklch(50% 0.12 25)',p_ostreatus_blanco:'oklch(55% 0.10 28)',p_djamor_rosa:'oklch(48% 0.13 20)',p_eryngii:'oklch(45% 0.09 265)',shiitake:'var(--accent-olive)',lions_mane:'oklch(52% 0.11 35)',reishi:'oklch(42% 0.10 10)',enoki:'oklch(43% 0.08 260)',nameko:'oklch(46% 0.09 95)'};

const SPP={
  p_ostreatus_gris:{name:'Orellana Gris',scientific:'Pleurotus ostreatus',cn_optimal:{min:25,max:50,ideal:35},n_optimal:{min:0.8,max:2.0,ideal:1.4},ph_optimal:{min:6.0,max:7.5},moisture:{ideal:65},eb_baseline:90,eb_optimal:130,supplementation_max:20,spawn_rate:8,notes:'La más fácil de cultivar. Tolera amplio rango de C:N. Ideal clima Sabana.',temp_fruit:'12–22°C'},
  p_ostreatus_blanco:{name:'Orellana Blanca',scientific:'Pleurotus florida',cn_optimal:{min:25,max:45,ideal:30},n_optimal:{min:1.0,max:2.0,ideal:1.5},ph_optimal:{min:6.0,max:7.0},moisture:{ideal:65},eb_baseline:80,eb_optimal:120,supplementation_max:18,spawn_rate:8,notes:'Tallos blancos premium.',temp_fruit:'14–20°C'},
  p_djamor_rosa:{name:'Orellana Rosa',scientific:'Pleurotus djamor',cn_optimal:{min:30,max:50,ideal:40},n_optimal:{min:0.8,max:1.8,ideal:1.2},ph_optimal:{min:5.5,max:6.5},moisture:{ideal:67},eb_baseline:70,eb_optimal:110,supplementation_max:15,spawn_rate:7,notes:'TERMÓFILA. Aborta primordios bajo 15°C.',temp_fruit:'20–28°C'},
  p_eryngii:{name:'Seta de Cardo',scientific:'Pleurotus eryngii',cn_optimal:{min:40,max:65,ideal:50},n_optimal:{min:0.8,max:1.6,ideal:1.2},ph_optimal:{min:5.5,max:7.0},moisture:{ideal:63},eb_baseline:60,eb_optimal:90,supplementation_max:25,spawn_rate:5,notes:'PREMIUM. Requiere esterilización. C:N alto 40–65 (literatura Kim 2011). Precio 2–3× orellana.',temp_fruit:'12–18°C'},
  shiitake:{name:'Shiitake',scientific:'Lentinula edodes',cn_optimal:{min:35,max:70,ideal:50},n_optimal:{min:0.6,max:1.2,ideal:0.9},ph_optimal:{min:5.0,max:6.0},moisture:{ideal:60},eb_baseline:50,eb_optimal:100,supplementation_max:20,spawn_rate:5,notes:'Ciclo largo 90–120 d. REQUIERE ESTERILIZACIÓN.',temp_fruit:'12–18°C'},
  lions_mane:{name:'Melena de León',scientific:'Hericium erinaceus',cn_optimal:{min:25,max:48,ideal:33},n_optimal:{min:1.0,max:2.0,ideal:1.5},ph_optimal:{min:5.0,max:6.5},moisture:{ideal:65},eb_baseline:50,eb_optimal:160,supplementation_max:25,spawn_rate:5,notes:'MEDICINAL premium. Master Mix (madera dura + cascarilla de soya 50:50) = sustrato óptimo, EB 150–180%. Evitar eucalipto.',temp_fruit:'15–20°C'},
  reishi:{name:'Reishi',scientific:'Ganoderma lucidum',cn_optimal:{min:35,max:65,ideal:50},n_optimal:{min:0.7,max:1.2,ideal:0.9},ph_optimal:{min:4.5,max:6.0},moisture:{ideal:60},eb_baseline:30,eb_optimal:60,supplementation_max:15,spawn_rate:5,notes:'MEDICINAL. Ciclo 4–6 meses.',temp_fruit:'20–26°C'},
  enoki:{name:'Enoki',scientific:'Flammulina velutipes',cn_optimal:{min:25,max:40,ideal:27},n_optimal:{min:1.2,max:2.5,ideal:1.8},ph_optimal:{min:5.0,max:7.0},moisture:{ideal:65},eb_baseline:60,eb_optimal:90,supplementation_max:30,spawn_rate:10,notes:'CRIÓFILOS: 5–12°C. EB óptima 90% en cond. artesanales (120% requiere refrigeración activa <12°C). Ideal Tenjo en invierno.',temp_fruit:'5–12°C'},
  nameko:{name:'Nameko',scientific:'Pholiota nameko',cn_optimal:{min:30,max:50,ideal:40},n_optimal:{min:0.8,max:1.5,ideal:1.1},ph_optimal:{min:5.0,max:6.5},moisture:{ideal:65},eb_baseline:40,eb_optimal:100,supplementation_max:20,spawn_rate:5,notes:'Gelatinoso, precio alto gourmet. EB hasta 100% en roble+salvado optimizado (Stamets 2000).',temp_fruit:'10–18°C'},
};

const INGS=[
  // cra=Capacidad Retención Agua 0-5 | ph=pH propio | dig=digestibilidad 1-10 (celulosa accesible/lignina)
  // === BASE CARBONO ===
  {id:'paja_trigo',name:'Paja de trigo',cat:'base',cn:90,n:.5,c:45,moisture:12,cra:4,ph:6.5,dig:7,role:'base_carbono',tags:['Base','Carbono'],cost:2500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii'],notes:'Comparte cn/n/c con paja_cebada — a diferencia de otros grupos de valores idénticos hallados en el peritaje, este caso es agronómicamente plausible: paja de trigo y de cebada son cereales de paja muy similares en composición. No se trató como placeholder sin verificar.'},
  {id:'paja_cebada',name:'Paja de cebada',cat:'base',cn:90,n:.5,c:45,moisture:12,cra:4,ph:6.5,dig:7,role:'base_carbono',tags:['Base','Carbono'],cost:2400,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii'],notes:'Ver nota en paja_trigo — mismo cn/n/c, plausible por similitud agronómica entre ambos cereales de paja.'},
  {id:'paja_avena',name:'Paja de avena',cat:'base',cn:75,n:.6,c:45,moisture:12,cra:4.5,ph:6.5,dig:8,role:'base_carbono',tags:['Base','Cereales'],cost:2200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii']},
  {id:'paja_arroz',name:'Paja de arroz',cat:'base',cn:65,n:.7,c:46,moisture:12,cra:2.5,ph:6.8,dig:4,role:'base_carbono',tags:['Base','Cereales'],cost:1800,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','nameko','enoki']},
  {id:'bagazo_caña',name:'Bagazo de caña fresco',cat:'base',cn:60,n:.7,c:42,moisture:55,cra:4,ph:5.5,dig:7,role:'base_carbono',tags:['Base','Local','Fresco 50–60% H₂O'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','shiitake'],notes:'Compatibilidad con shiitake verificada en literatura: bagazo+salvado de trigo+aserrín en mezcla optimizada (Frontiers in Microbiology 2024, PMC11151849).'},
  {id:'aserrin_roble',name:'Aserrín de roble',cat:'base',cn:500,n:.1,c:50,moisture:12,cra:3,ph:4.5,dig:2,role:'base_carbono',tags:['Base','Madera dura'],cost:2500,cs:['shiitake','lions_mane','reishi','nameko']},
  {id:'aserrin_caucho',name:'Aserrín de caucho (Hevea brasiliensis)',cat:'base',cn:65,n:.75,c:49,moisture:12,cra:3,ph:5.8,dig:5,role:'base_carbono',tags:['Base','Madera','No disponible en Tenjo — requiere transporte desde zonas cálidas (Meta/Caquetá)'],cost:9000,cs:['lions_mane'],notes:'C:N=65.48 verificado en Nature Sci Rep 2023 (doi:10.1038/s41598-023-40601-y) — rinde mejor que aserrín de bambú (C:N=33.44) para Hericium erinaceus. %N y %C estimados a partir del C:N reportado (no medidos directamente en la fuente). El caucho no se cultiva en la Sabana de Bogotá (2600msnm, clima frío) — este insumo requeriría transporte desde plantaciones en clima cálido colombiano; costo estimado incluye ese transporte, sin cotización real de proveedor.'},
  {id:'aserrin_eucalipto',name:'Aserrín de eucalipto',cat:'base',cn:350,n:.15,c:50,moisture:12,cra:3,ph:5.0,dig:3,role:'base_carbono',tags:['Base','Madera','⚠Aceites: rinde menos que madera dura'],cost:2000,cs:['p_ostreatus_gris','shiitake']},
  {id:'aserrin_pino',name:'Aserrín de pino fresco (requiere pretratamiento)',cat:'base',cn:600,n:.08,c:50,moisture:12,cra:2.5,ph:4.5,dig:1,role:'base_carbono',tags:['NO usar fresco','Terpenos inhibitorios','Exige lavado/compostaje 3–4 m'],cost:1500,cs:[],notes:'Terpenos y resinas abortan el micelio de Pleurotus/Hericium de inmediato. PROHIBIDO en fresco: requiere compostaje térmico prolongado (3–4 meses) o lavado químico parametrizado antes de cualquier uso. Para producción real usar la variante compostada.'},
  {id:'aserrin_pino_compostado',name:'Aserrín pino compostado (3–4 m)',cat:'base',cn:200,n:.2,c:40,moisture:15,cra:3,ph:5.5,dig:4,role:'base_carbono',tags:['Base','Gratis'],cost:2200,cs:['p_ostreatus_gris','shiitake','lions_mane']},
  {id:'aserrin_alamo',name:'Aserrín de álamo/sauce (Sabana)',cat:'base',cn:200,n:.20,c:45,moisture:12,cra:3.5,ph:5.5,dig:4,role:'base_carbono',tags:['Base','Madera','Sabana','Fácil conseguir'],cost:1800,cs:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane','shiitake','reishi','nameko','enoki']},
  {id:'cascarilla_arroz',name:'Cascarilla de arroz',cat:'base',cn:80,n:.5,c:40,moisture:10,cra:1.5,ph:6.8,dig:3,role:'aireador',tags:['Aireador','Local'],cost:960,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],notes:'Precio $960/kg — Lombricultura de Tenjo, bulto de 50 kg a $48.000 (ago. 2026). Corregido desde $4.000/kg (fuente no verificada).',provenance:{version:1,sources:{tenjo_2026_08:{type:'supplier_quote',label:'Lombricultura de Tenjo — bulto 50kg',organization:'Lombricultura de Tenjo',location:'Tenjo, Cundinamarca',observedAt:'2026-08-01'}},claims:[{fields:['cost'],sourceIds:['tenjo_2026_08'],confidence:'high',method:'reported',verifiedAt:'2026-08-17'}]}},
  {id:'tamo_trigo',name:'Tamo de trigo',cat:'base',cn:100,n:.4,c:40,moisture:10,cra:2,ph:6.8,dig:5,role:'aireador',tags:['Aireador','Carbono'],cost:1600,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'cascarilla_coco',name:'Fibra de coco',cat:'base',cn:93,n:.5,c:47,moisture:13,cra:3,ph:6.0,dig:3,role:'aireador',tags:['Aireador','Tropical'],cost:9500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','lions_mane'],notes:'Ficha técnica del usuario: N 0.4–0.6%, C 45–48%, C:N 75–110:1, celulosa 20–30%, hemicelulosa 15–20%, lignina 40–50%, cenizas 2–6%, pH 5.5–6.5, CE 1.5–3.0 mS/cm (alto K⁺/Na⁺ residual — sin lavar), humedad 10–15%. dig bajado de 4→3 por la lignina alta (40–50%) frente a la turba de coco buferizada. Precio $9.500/kg — Lombricultura de Tenjo, presentación 4 kg a $38.000 (ago. 2026); corregido desde $8.500/kg.'},
  {id:'turba_coco_buferizada',name:'Turba de coco buferizada',cat:'base',cn:75,n:.6,c:46,moisture:11,cra:4,ph:6.5,dig:4,role:'aireador',tags:['Aireador','Tropical','Buferizada'],cost:5000,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','lions_mane'],notes:'Ficha técnica del usuario: N 0.5–0.7% (incremento leve por remanente de Ca(NO₃)₂), C 44–47%, C:N 65–85:1, celulosa 15–25%, hemicelulosa 10–18%, lignina 35–45%, cenizas 4–8% (intercambio catiónico Ca²⁺/Mg²⁺), pH 6.2–6.8, CE <0.5–0.8 mS/cm (sales lavadas y estabilizadas — mucho más baja que la fibra de coco sin procesar), humedad 10–12%. CRA más alta (4) que fibra de coco por el buferizado; dig levemente mejor (4) por su procesamiento. Precio $5.000/kg — BioEspacio (Bogotá), 1 kg (ago. 2026); otra presentación de 5 kg da $7.600/kg. Corregido desde $8.500/kg (que era una estimación por analogía, ya marcada como no confirmada).'},
  {id:'tusa_maiz',name:'Tuza de maíz (Tusa / Zuro)',cat:'base',cn:70,n:.7,c:45,moisture:15,cra:3,ph:6.5,dig:6,role:'base_carbono',tags:['Base','Local','Tuza','Tusa','Zuro','Maíz'],cost:1500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii'],notes:'Excelente sustrato base rico en hemicelulosa (C:N 70:1). Muy abundante en la Sabana de Bogotá y Cundinamarca.'},
  {id:'rastrojo_maiz',name:'Rastrojo de maíz',cat:'base',cn:60,n:.6,c:45,moisture:15,cra:3.5,ph:6.5,dig:6,role:'base_carbono',tags:['Base','Local'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_eryngii','nameko'],notes:'Compatibilidad con P. eryngii (sustituye aserrín/bagazo en 10.5–42%, Horticulturae 2023, doi:10.3390/horticulturae9030319) y con Pholiota microspora/nameko (mezclado con aserrín de álamo, PMC9060681) verificada en literatura revisada por pares.'},
  {id:'kikuyo',name:'Kikuyo seco',cat:'base',cn:25,n:1.8,c:45,moisture:12,cra:4,ph:6.5,dig:8,role:'base_carbono',tags:['Local','Sabana','Valor sin diferenciar — ver peritaje'],cost:1400,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'C:N/%N/%C idénticos a paja de soya, estiércol equino y rastrojo de fríjol — 4 materiales botánica/agronómicamente distintos con la misma ficha, sospecha de placeholder copiado sin diferenciar. No se encontró cifra de reemplazo verificada; pendiente de análisis propio.'},
  {id:'hojarasca',name:'Hojarasca de bosque',cat:'base',cn:50,n:.9,c:45,moisture:20,cra:3.5,ph:5.8,dig:5,role:'base_carbono',tags:['Local'],cost:200,notes:'Costo $200/kg por recolección y cernido — no es un insumo gratuito real (estaba en $0, favoreciéndolo frente a bases con costo de mercado).',cs:['p_ostreatus_gris','p_ostreatus_blanco']},
  {id:'retamo_espinoso',name:'Retamo espinoso',cat:'base',cn:32,n:1.5,c:47,moisture:11,cra:3,ph:6.0,dig:5,role:'base_carbono',tags:['Base','Local','Tenjo'],cost:400,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],notes:'Ficha técnica del usuario: N 1.4–1.6%, C 46–48%, C:N 30–34:1, celulosa 45–47.5%, hemicelulosa 21–22.5%, lignina 23–24.5%, cenizas 3.5–4.5%, pH 5.8–6.2, humedad 10–12%. Digestibilidad y compatibilidad de especies estimadas por analogía con arbustos leñosos similares (no verificadas en ensayo) — confirmar con prueba piloto antes de escalar. Costo $400/kg procesado (recolección + molienda) — evita distorsión del optimizador de costos al no tratarlo como insumo gratuito.'},
  {id:'guadua',name:'Guadua astillada',cat:'base',cn:120,n:.35,c:42,moisture:15,cra:3,ph:6.0,dig:4,role:'base_carbono',tags:['Base','Bambú'],cost:2500,cs:['p_ostreatus_gris','shiitake','lions_mane']},
  {id:'heno_pangola',name:'Heno de pangola',cat:'base',cn:60,n:.8,c:48,moisture:12,cra:4,ph:6.5,dig:7,role:'base_carbono',tags:['Base','Local'],cost:6500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'chips_poda_urbana',name:'Chips poda urbana (sauce/fresno)',cat:'base',cn:150,n:.30,c:45,moisture:15,cra:3,ph:6.2,dig:5,role:'base_carbono',tags:['Base','Tenjo'],cost:300,notes:'Costo $300/kg procesado (recolección + astillado de poda urbana) — insumo no es gratuito, incluye alistamiento.',cs:['p_ostreatus_gris','p_ostreatus_blanco','shiitake','lions_mane']},
  // === CELULÓSICOS / PAPEL ===
  {id:'carton_corrugado',name:'Cartón corrugado troceado',cat:'base',cn:350,n:.13,c:45,moisture:8,cra:3.5,ph:7.0,dig:9,role:'base_carbono',tags:['Base','Gratis','Celulosa'],cost:800,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','shiitake','lions_mane']},
  {id:'carton_huevo',name:'Cartón de huevo',cat:'base',cn:150,n:.28,c:42,moisture:8,cra:4,ph:7.0,dig:8,role:'base_carbono',tags:['Base','Gratis','Aireador'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'papel_periodico',name:'Papel periódico / kraft',cat:'base',cn:170,n:.25,c:43,moisture:6,cra:2.5,ph:7.0,dig:8,role:'base_carbono',tags:['Base','Celulosa'],cost:1500,cs:['p_ostreatus_gris','p_ostreatus_blanco']},
  {id:'pulpa_papel',name:'Pulpa de papel (residuo industrial)',cat:'base',cn:200,n:.20,c:44,moisture:50,cra:4,ph:7.0,dig:9,role:'base_carbono',tags:['Base','Celulosa','Industrial'],cost:1800,cs:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane']},
  // === FIBRAS LOCALES ===
  {id:'fique_cabuya',name:'Fique / cabuya (fibra)',cat:'base',cn:80,n:.55,c:44,moisture:12,cra:3.5,ph:6.3,dig:5,role:'base_carbono',tags:['Base','Local','Colombia'],cost:4500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'tallo_girasol',name:'Tallo de girasol triturado',cat:'base',cn:55,n:.8,c:44,moisture:12,cra:3.5,ph:6.5,dig:7,role:'base_carbono',tags:['Base','Sabana'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii']},
  {id:'paja_soya',name:'Paja / rastrojo de soya',cat:'base',cn:25,n:1.8,c:45,moisture:12,cra:3.5,ph:6.5,dig:7,role:'suplemento_medio',tags:['Base','N medio','Leguminosa','Valor sin diferenciar — ver peritaje'],cost:500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_eryngii'],notes:'C:N/%N/%C idénticos a kikuyo, estiércol equino y rastrojo de fríjol — ver nota en kikuyo.'},
  {id:'fibra_palma',name:'Fibra de palma de aceite',cat:'base',cn:70,n:.7,c:49,moisture:18,cra:3,ph:5.8,dig:4,role:'base_carbono',tags:['Base','Industrial'],cost:1800,cs:['p_ostreatus_gris','p_ostreatus_blanco']},
  // === TROPICALES ===
  {id:'pseudotallo_platano',name:'Pseudotallo plátano',cat:'trop',cn:42,n:1.1,c:46,moisture:85,cra:5,ph:6.2,dig:8,role:'base_carbono',tags:['Tropical','EB alto'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'cascara_platano',name:'Cáscara de plátano',cat:'trop',cn:30,n:1.5,c:45,moisture:12,cra:3.5,ph:5.8,dig:7,role:'suplemento_medio',tags:['Tropical','N medio','Valor sin diferenciar — ver peritaje'],cost:1500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],notes:'C:N/%N/%C idénticos a cascarilla de quinua — materiales sin relación botánica, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada.'},
  {id:'hoja_platano',name:'Hoja de plátano seca',cat:'trop',cn:35,n:1.3,c:46,moisture:12,cra:3.5,ph:6.0,dig:7,role:'base_carbono',tags:['Tropical','Local','Valor sin diferenciar — ver peritaje'],cost:2500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],notes:'C:N/%N/%C idénticos a cáscara de cacao — materiales sin relación botánica, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada.'},
  {id:'cascara_aguacate',name:'Cáscara de aguacate',cat:'trop',cn:45,n:1.0,c:45,moisture:15,cra:2.5,ph:5.5,dig:4,role:'base_carbono',tags:['Tropical','Valor sin diferenciar — ver peritaje'],cost:1400,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'C:N/%N/%C idénticos a tallo de rosa y residuo de clavel — 3 materiales sin relación botánica, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada.'},
  {id:'bagazo_lulo',name:'Bagazo de lulo/mora',cat:'trop',cn:22,n:2.0,c:44,moisture:70,cra:4,ph:4.5,dig:8,role:'suplemento_medio',tags:['Tropical','N medio','Gratis'],cost:1500,cs:['p_ostreatus_gris','p_djamor_rosa']},
  {id:'cascara_cacao',name:'Cáscara de cacao',cat:'local',cn:35,n:1.3,c:46,moisture:10,cra:3,ph:5.5,dig:6,role:'suplemento_medio',tags:['Local','Colombia','N medio','Valor sin diferenciar — ver peritaje'],cost:3500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii'],notes:'C:N/%N/%C idénticos a hoja de plátano seca — ver nota en hoja_platano.'},
  {id:'pulpa_cacao',name:'Pulpa / mucílago de cacao',cat:'trop',cn:18,n:2.5,c:45,moisture:80,cra:4,ph:4.0,dig:9,role:'suplemento_n',tags:['Tropical','N alto','Colombia','Valor sin diferenciar — ver peritaje'],cost:4500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],notes:'C:N/%N/%C idénticos a sustrato agotado de champiñón (SMS) — materiales sin relación, sospecha de placeholder copiado. No se encontró cifra de reemplazo verificada.'},
  // === CAFÉ ===
  {id:'borra_cafe',name:'Borra de café (SCG)',cat:'cafe',cn:22,n:2.0,c:47,moisture:68,cra:4,ph:6.0,dig:5,role:'suplemento_n',tags:['Café','N alto','Gratis/Muy bajo','Humedad 65–72%'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','shiitake','nameko']},
  {id:'cascara_cafe',name:'Cáscara de café',cat:'cafe',cn:32,n:1.4,c:45,moisture:12,cra:3,ph:5.8,dig:5,role:'suplemento_medio',tags:['Café','N medio'],cost:3000,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'pulpa_cafe',name:'Pulpa de café',cat:'cafe',cn:25,n:2.5,c:45,moisture:70,cra:4,ph:5.5,dig:6,role:'suplemento_n',tags:['Café','N alto'],cost:2500,cs:['p_ostreatus_gris','p_djamor_rosa'],notes:'Literatura reporta C:N=18.1–21.0 para pulpa de café YA COMPOSTADA con estiércol de cabra (ve.scielo.org S1316-33612009000200004) — no para pulpa fresca sola. El compostaje reduce el C:N a medida que se respira carbono, así que la pulpa fresca (lo que describe este insumo) probablemente tenga un C:N igual o mayor a esa cifra de compost terminado — el valor actual (25) es consistente con esa lectura, no contradictorio. No se ajustó.'},
  // === SUPLEMENTOS N ===
  {id:'salvado_trigo',name:'Salvado de trigo',cat:'sup',cn:16,n:2.8,c:45,moisture:12,cra:3,ph:6.2,dig:8,role:'suplemento_n',tags:['N alto','Estándar'],cost:5000,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii','shiitake','lions_mane','reishi','nameko'],notes:'Precio $5.000/kg — Mercado Libre Colombia, presentación 5 kg a $25.000 (ago. 2026); uno de los mejor alineados del catálogo. Corregido desde $5.200/kg.',provenance:{version:1,sources:{ml_2026_08:{type:'supplier_quote',label:'Mercado Libre Colombia — presentación 5kg',observedAt:'2026-08-01'}},claims:[{fields:['cost'],sourceIds:['ml_2026_08'],confidence:'high',method:'reported',verifiedAt:'2026-08-17'}]}},
  {id:'salvado_arroz',name:'Salvado de arroz',cat:'sup',cn:18,n:2.2,c:47,moisture:12,cra:2.5,ph:6.5,dig:7,role:'suplemento_n',tags:['N alto'],cost:4200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii','shiitake','lions_mane']},
  {id:'salvado_maiz',name:'Salvado de maíz',cat:'sup',cn:20,n:2.2,c:44,moisture:12,cra:2.5,ph:6.3,dig:7,role:'suplemento_n',tags:['N alto','Local'],cost:3800,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii','shiitake']},
  {id:'cascarilla_soya',name:'Cascarilla de soya/soja (hull)',cat:'sup',cn:17,n:2.8,c:47,moisture:10,cra:2.5,ph:6.8,dig:7,role:'suplemento_n',tags:['N muy alto','Leguminosa'],cost:5800,cs:['shiitake','lions_mane','reishi','p_eryngii','p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','enoki','nameko']},
  {id:'harina_soya',name:'Harina de soya tostada',cat:'sup',cn:8,n:7.0,c:52,moisture:8,cra:2,ph:6.5,dig:8,role:'suplemento_n',tags:['N muy alto'],cost:8500,cs:['p_eryngii','shiitake','lions_mane']},
  {id:'afrecho_cerveceria',name:'Afrecho de cervecería (spent grain)',cat:'sup',cn:11,n:4.2,c:46,moisture:75,cra:4.5,ph:5.5,dig:7,role:'suplemento_n',tags:['N muy alto'],cost:1125,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii','shiitake','lions_mane','nameko','enoki'],notes:'Precio $1.125/kg — Frescorgánico, bulto 40 kg a $45.000, pedido mínimo 10 bultos (ago. 2026); desde 3 toneladas baja a ≈$1.013/kg. Tag "Gratis" retirado — no es insumo sin costo, corregido desde $2.500/kg.'},
  {id:'cascarilla_quinua',name:'Cascarilla de quinua',cat:'sup',cn:30,n:1.5,c:45,moisture:10,cra:2,ph:6.5,dig:6,role:'suplemento_medio',tags:['N medio','Boyacá','Valor sin diferenciar — ver peritaje'],cost:4500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii'],notes:'C:N/%N/%C idénticos a cáscara de plátano — ver nota en cascara_platano.'},
  {id:'torta_girasol',name:'Torta de girasol',cat:'sup',cn:7,n:5.0,c:45,moisture:10,cra:2,ph:6.2,dig:7,role:'suplemento_n',tags:['N muy alto'],cost:4800,cs:['p_eryngii','shiitake','lions_mane','reishi']},
  // === ESTIÉRCOL ===
  {id:'gallinaza',name:'Gallinaza compostada',cat:'est',cn:10,n:3.5,c:35,moisture:20,cra:2.5,ph:7.5,dig:8,role:'suplemento_n',tags:['N alto'],cost:1700,cs:['p_ostreatus_gris'],notes:'Precio $1.700/kg — Viveros de Colombia, Bogotá, gallinaza compostada en bulto (ago. 2026). Corregido desde $2.500/kg.'},
  {id:'estiercol_equino',name:'Estiércol equino puro',cat:'est',cn:25,n:1.8,c:45,moisture:30,cra:3,ph:7.5,dig:7,role:'suplemento_n',tags:['Local','Tenjo','Valor sin diferenciar — ver peritaje'],cost:1800,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'C:N/%N/%C idénticos a kikuyo, paja de soya y rastrojo de fríjol — ver nota en kikuyo. La literatura reporta C:N de estiércol muy variable (5–25:1) según especie animal y cama, así que un valor puntual no es descabellado, pero coincidir EXACTO con tres materiales vegetales distintos sí es sospechoso.'},
  // === LOCALES SABANA ===
  {id:'capacho_uchuva',name:'Capacho de uchuva',cat:'local',cn:40,n:1.1,c:44,moisture:14,cra:2.5,ph:6.0,dig:6,role:'suplemento_medio',tags:['Local','Tenjo','Gratis','Valor sin diferenciar — ver peritaje'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'Parece describir el mismo residuo físico que cascara_uchuva ("Cáscara de Uchuva (capacho)") pero con cn/n/c y costo distintos ($1.200 vs $500/kg) sin una diferencia de procesamiento documentada que lo justifique — revisar si deberían fusionarse en un solo insumo. Etiqueta "Gratis" tampoco verificada como costo puesto en granja.'},
  {id:'cascara_arveja',name:'Cáscara de arveja',cat:'local',cn:35,n:1.3,c:45,moisture:12,cra:3,ph:6.3,dig:6,role:'suplemento_medio',tags:['Local','Cundinamarca'],cost:1400,cs:['p_ostreatus_gris','p_ostreatus_blanco']},
  {id:'tallo_rosa',name:'Tallo de rosa molido',cat:'local',cn:45,n:1.0,c:45,moisture:15,cra:3.5,ph:6.5,dig:5,role:'base_carbono',tags:['Local','Floricultura','Valor sin diferenciar — ver peritaje'],cost:1500,cs:['p_ostreatus_gris'],notes:'C:N/%N/%C idénticos a cáscara de aguacate y residuo de clavel — ver nota en cascara_aguacate.'},
  {id:'follaje_crisantemo',name:'Follaje de crisantemo',cat:'local',cn:40,n:1.2,c:45,moisture:18,cra:3.5,ph:6.5,dig:6,role:'base_carbono',tags:['Local','Floricultura'],cost:1200,cs:['p_ostreatus_gris']},
  {id:'residuo_clavel',name:'Residuo de clavel (Madrid/Facatativá)',cat:'local',cn:45,n:1.0,c:45,moisture:18,cra:4.5,ph:6.5,dig:5,role:'base_carbono',tags:['Local','Floricultura','Gratis','Valor sin diferenciar — ver peritaje'],cost:1000,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'C:N/%N/%C idénticos a cáscara de aguacate y tallo de rosa — ver nota en cascara_aguacate.'},
  {id:'rastrojo_papa',name:'Rastrojo de papa (Villapinzón)',cat:'local',cn:35,n:1.2,c:42,moisture:12,cra:3,ph:6.3,dig:7,role:'suplemento_medio',tags:['Local','Cundinamarca'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'rastrojo_frijol',name:'Rastrojo de fríjol',cat:'local',cn:25,n:1.8,c:45,moisture:12,cra:3,ph:6.5,dig:7,role:'suplemento_medio',tags:['Local','N medio','Valor sin diferenciar — ver peritaje'],cost:1600,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'C:N/%N/%C idénticos a kikuyo, paja de soya y estiércol equino — ver nota en kikuyo.'},
  {id:'cascara_maní',name:'Cáscara de maní',cat:'local',cn:28,n:1.6,c:45,moisture:8,cra:2,ph:6.3,dig:6,role:'suplemento_medio',tags:['N medio','Leguminosa'],cost:300,cs:['p_ostreatus_gris','p_ostreatus_blanco']},
  {id:'cascara_papa',name:'Cáscara de papa',cat:'local',cn:15,n:3.0,c:45,moisture:80,cra:4,ph:6.0,dig:8,role:'suplemento_n',tags:['Local','N alto','Gratis'],cost:1500,cs:['p_ostreatus_gris']},
  // === ECONOMÍA CIRCULAR ===
  {id:'sms',name:'Sustrato agotado (SMS)',cat:'circ',cn:18,n:2.5,c:45,moisture:70,cra:4,ph:6.5,dig:6,role:'suplemento_medio',tags:['Circular','N alto','Valor sin diferenciar — ver peritaje'],cost:0,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa'],notes:'C:N/%N/%C idénticos a pulpa de cacao — ver nota en pulpa_cacao. Costo $0: investigación de precios confirma que es defendible SOLO si el SMS se genera en la misma granja (subproducto propio del ciclo de cultivo) — registrar aparte el costo de manejo/transporte/almacenamiento por separado en vez de inflar el costo de adquisición del material.'},
  {id:'lombricompost',name:'Lombricompost',cat:'circ',cn:12,n:3.0,c:36,moisture:35,cra:3.5,ph:7.0,dig:8,role:'suplemento_n',tags:['N alto','Microflora'],cost:680,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'Precio $680/kg — Lombricultura de Tenjo, humus sólido a $680.000/tonelada con lona reciclada (ago. 2026). Corregido desde $5.000/kg.',provenance:{version:1,sources:{tenjo_2026_08:{type:'supplier_quote',label:'Lombricultura de Tenjo — humus sólido, tonelada con lona reciclada',organization:'Lombricultura de Tenjo',location:'Tenjo, Cundinamarca',observedAt:'2026-08-01'}},claims:[{fields:['cost'],sourceIds:['tenjo_2026_08'],confidence:'high',method:'reported',verifiedAt:'2026-08-17'}]}},
  {id:'compost_maduro',name:'Compost maduro (>3 meses)',cat:'circ',cn:15,n:2.8,c:42,moisture:35,cra:3.5,ph:7.0,dig:8,role:'suplemento_n',tags:['N alto','Estable'],cost:798,cs:['p_ostreatus_gris','p_ostreatus_blanco'],notes:'Precio $798/kg — Tumatera (Bogotá/Sabana), bulto 50 kg a $39.900 (ago. 2026); la fuente no confirma explícitamente madurez >3 meses. Corregido desde $2.500/kg.'},
  // === ADITIVOS ===
  {id:'carbonato_calcio',name:'Carbonato de calcio',cat:'adit',cn:0,n:0,c:0,moisture:0,cra:0,ph:9.5,dig:0,role:'aditivo_ph',tags:['pH','Mineral'],cost:3000,cs:Object.keys(SPP)},
  {id:'yeso',name:'Yeso agrícola',cat:'adit',cn:0,n:0,c:0,moisture:0,cra:0,ph:7.0,dig:0,role:'aditivo_estructura',tags:['Estructura','Ca'],cost:1482,cs:Object.keys(SPP),notes:'Precio $1.482/kg — Yesoplant, bulto 50 kg a $74.100 (ago. 2026). Corregido desde $2.200/kg.'},
  {id:'sulfato_magnesio',name:'Sulfato de magnesio',cat:'adit',cn:0,n:0,c:0,moisture:0,cra:0,ph:7.0,dig:0,role:'aditivo_micronutriente',tags:['Mg','Cofactor'],cost:10000,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii','shiitake','lions_mane']},
  {id:'melaza',name:'Melaza',cat:'adit',cn:30,n:.5,c:38,moisture:25,cra:1,ph:5.5,dig:9,role:'aditivo_arrancador',tags:['Arrancador'],cost:6500,cs:['p_ostreatus_gris','p_ostreatus_blanco']},
  {id:'ceniza_vegetal',name:'Ceniza vegetal',cat:'adit',cn:0,n:0,c:0,moisture:0,cra:0,ph:11.0,dig:0,role:'aditivo_ph',tags:['pH','K','Gratis'],cost:3000,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'zeolita',name:'Zeolita natural',cat:'adit',cn:0,n:0,c:0,moisture:0,cra:5,ph:7.2,dig:0,role:'aditivo_estructura',tags:['Estructura','Retención'],cost:3708,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_eryngii','shiitake','lions_mane'],notes:'Precio $3.708/kg — La Leñería (Bogotá), bulto 25 kg a $92.700 (ago. 2026). Corregido desde $8.500/kg.'},
  {id:'tiamina',name:'Tiamina (Vit B1)',cat:'adit',cn:0,n:0,c:0,moisture:0,cra:0,ph:7.0,dig:0,role:'aditivo_micronutriente',tags:['Vitamina','Cofactor'],cost:120000,cs:Object.keys(SPP)},
  // === NUEVOS INGREDIENTES v21.5 ===
  {id:'harina_alfalfa',name:'Harina de Alfalfa',cat:'sup',cn:14,n:2.5,c:35,moisture:8,cra:3.2,ph:7.2,dig:7,role:'suplemento_n',tags:['Proteína','Leguminosa','Bioestimulante'],cost:8000,cs:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane','enoki','nameko','p_djamor_rosa']},
  {id:'cascarilla_huevo_molida',name:'Cascarilla de Huevo Molida',cat:'adit',cn:0,n:0,c:0,moisture:2,cra:0.8,ph:8.8,dig:0,role:'aditivo_ph',tags:['Calcio','Lento','Biodegradable'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','shiitake','lions_mane','reishi','enoki','nameko']},
  {id:'polvo_hueso',name:'Polvo de Hueso',cat:'sup',cn:11,n:2.5,c:28,moisture:3,cra:1.2,ph:7.0,dig:2,role:'suplemento_n',tags:['Fósforo','Lento','Premium'],cost:8500,cs:['p_eryngii','shiitake','lions_mane','reishi','nameko']},
  {id:'corteza_molida',name:'Corteza de Árbol Molida',cat:'base',cn:160,n:0.3,c:48,moisture:25,cra:2.1,ph:6.5,dig:3,role:'base_carbono',tags:['Estructura','Lento','Shiitake'],cost:1400,cs:['shiitake','lions_mane','reishi']},
  {id:'harina_trigo',name:'Harina de Trigo Integral',cat:'sup',cn:12,n:2.8,c:40,moisture:10,cra:2.5,ph:6.5,dig:6,role:'suplemento_n',tags:['Proteína','Gluten','Bioestimulante'],cost:1200,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii','nameko']},
  {id:'harina_maiz',name:'Harina de Maíz (Afrecho)',cat:'sup',cn:8,n:3.2,c:36,moisture:12,cra:3.0,ph:6.8,dig:7,role:'suplemento_n',tags:['Proteína','Local','Económico'],cost:1000,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii','lions_mane','enoki'],notes:'El nombre mezcla dos productos distintos: harina de maíz (Mercado Libre Colombia, 12,5 kg a $59.400 = ~$4.752/kg, ago. 2026) y afrecho de maíz (subproducto grueso, más barato, sin cotización propia encontrada). No se ajustó el costo porque no está claro cuál de los dos describen realmente cn/n/c — separar en dos insumos o aclarar cuál es antes de corregir el precio.'},
  {id:'harina_pescado',name:'Harina de Pescado Deshidratada',cat:'sup',cn:4,n:9.5,c:38,moisture:6,cra:0.8,ph:6.5,dig:2,role:'suplemento_n',tags:['Proteína Pura','Premium','Olor fuerte','Autoclave obligatorio'],cost:14000,cs:['p_ostreatus_gris','enoki'],notes:'Uso experimental. Olor fuerte atrae ácaros/Sciaridae. Solo autoclave. Máx 3%.'},
  {id:'salvado_avena',name:'Salvado de Avena',cat:'sup',cn:15,n:2.6,c:39,moisture:10,cra:3.5,ph:6.6,dig:8,role:'suplemento_n',tags:['Fibra','N medio','Local','Requiere control sanitario'],cost:7500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','enoki','nameko','lions_mane','shiitake']},
  {id:'cascarilla_girasol',name:'Cascarilla de Girasol',cat:'sup',cn:25,n:1.8,c:42,moisture:12,cra:3.2,ph:6.5,dig:5,role:'suplemento_medio',tags:['Fibra','Aireador','Económico'],cost:3500,cs:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane','enoki']},
  {id:'algas_marinas',name:'Algas Marinas Molidas',cat:'adit',cn:13,n:1.5,c:20,moisture:12,cra:2.2,ph:7.8,dig:2,role:'aditivo_micronutriente',tags:['Bioácidos','Yodo','Premium'],cost:18000,cs:['lions_mane','nameko','p_ostreatus_blanco']},
  {id:'estierc_gallina_deshid',name:'Estiércol de Gallina Deshidratado',cat:'est',cn:7,n:3.5,c:25,moisture:8,cra:3.8,ph:7.5,dig:6,role:'suplemento_n',tags:['Balanceado','Local','Rápido'],cost:300,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','enoki','nameko'],notes:'Precio $300/kg — Croper, gallinaza de jaula seca, El Rosal (Cundinamarca), bulto 40 kg, escala 1–25 bultos (ago. 2026); baja a $250/kg en 26–100 bultos y $200/kg sobre 100. Fuente local pero no confirma "deshidratado" industrial (es "seca y empacada"). Corregido desde $2.200/kg.'},
  {id:'vermicompost',name:'Vermicompost',cat:'circ',cn:15,n:1.8,c:27,moisture:35,cra:4.2,ph:6.9,dig:8,role:'suplemento_medio',tags:['Microbios','Bioestimulante'],cost:680,cs:['lions_mane','p_ostreatus_blanco','nameko','p_eryngii'],notes:'Precio $680/kg — mismo referente de humus/lombricompost de Lombricultura de Tenjo ($680.000/t, ago. 2026); "vermicompost", "humus de lombriz" y "lombricompost" son la misma clase de producto en el mercado local. Corregido desde $6.000/kg (tag "Premium" quitado, no se sostiene frente al precio mayorista real).'},
  /* ── NUEVOS v3.1 — Investigación Sabana de Bogotá 2026 ──────────────── */
  {id:'pulpa_alfalfa',name:'Pulpa de Alfalfa (fresca/henificada)',cat:'local',cn:11,n:3.0,c:33,moisture:72,cra:4.8,ph:6.9,dig:9,role:'suplemento_n',tags:['EB 166%','Sabana','N Alto','Nuevo'],cost:4000,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','lions_mane','nameko'],notes:'El nombre mezcla dos estados de humedad muy distintos ("fresca/henificada") con costos y logística distintos; "pulpa de alfalfa" no aparece como categoría comercial estandarizada en Colombia (se investigó por separado harina de alfalfa, que sí es distinta). moisture:72 sugiere que este registro describe la forma fresca — separar en dos insumos (fresca vs. henificada) antes de ajustar el costo.'},
  {id:'cascara_uchuva',name:'Cáscara de Uchuva (capacho)',cat:'local',cn:30,n:1.2,c:35,moisture:10,cra:3.5,ph:6.1,dig:5,role:'base_carbono',tags:['EB 76%','Cundinamarca','Validado CO','Nuevo','Valor sin diferenciar — ver peritaje'],cost:500,cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa','p_eryngii'],notes:'El nombre entre paréntesis ("capacho") coincide con capacho_uchuva, que tiene cn/n/c y costo distintos ($500 vs $1.200/kg) sin diferencia de procesamiento documentada — probable duplicado del mismo residuo físico bajo dos IDs. Revisar si deberían fusionarse.'},
  {id:'tallo_floricultura',name:'Tallo de Rosa / Clavel (Sabana)',cat:'local',cn:48,n:0.9,c:42,moisture:80,cra:3.0,ph:6.3,dig:4,role:'base_carbono',tags:['Sin estudiar','Sabana 85%','Potencial alto','Nuevo'],cost:200,notes:'Costo $200/kg procesado (recolección + alistamiento de tallos de floricultura) — evita subestimar el costo real frente a residuo "gratis".',cs:['p_ostreatus_gris','p_ostreatus_blanco','p_djamor_rosa']},
  {id:'raices_hidroponicas',name:'Raíces Hidropónicas + SMS',cat:'circ',cn:14,n:2.1,c:29,moisture:88,cra:3.8,ph:6.5,dig:7,role:'suplemento_n',tags:['EB 61%','Economía Circular','Nuevo'],cost:1800,cs:['p_ostreatus_blanco','lions_mane','nameko','p_eryngii'],notes:'El nombre indica que es una mezcla propia (raíces hidropónicas + SMS), no una materia prima con mercado independiente — no existe un producto comercial estandarizado con esta denominación. El costo debería derivarse de sus componentes en vez de cotizarse como insumo único; $1.800/kg no está validado contra mercado.'},
  {id:'hemp_hurds',name:'Hemp Hurds (cáñamo industrial)',cat:'sup',cn:70,n:0.5,c:47,moisture:10,cra:4.0,ph:6.8,dig:3,role:'base_carbono',tags:['Mejor Pleurotus EU','Aireador','Premium','Nuevo'],cost:28000,cs:['p_ostreatus_gris','p_ostreatus_blanco','lions_mane','shiitake']},
];
const CATS={all:'Todos',base_carbono:'Carbono',suplemento_n:'N alto',suplemento_medio:'N medio',aireador:'Aireación',aditivo:'Correctores'};

const PRESETS={
  /* ── RECETAS PRINCIPALES — Proporciones validadas contra C:N objetivo ── */
  // Orellana Gris: C:N ideal 35. Calc: paja_trigo(c45,n0.5)×60 + salvado(c45,n2.8)×28 + borra(c47,n2.0)×7 → C:N≈35.0 ✓
  'orellana_gris_basica':{name:'Orellana Gris — Estándar Sabana (C:N≈35)',s:'p_ostreatus_gris',i:[{id:'paja_trigo',p:60},{id:'salvado_trigo',p:28},{id:'borra_cafe',p:7},{id:'carbonato_calcio',p:3},{id:'yeso',p:2}]},
  // Económico: paja_cebada(c45,n0.5)×50 + salvado×20 + borra×15 + cascarilla×7 → C:N≈36 ✓
  'orellana_gris_economico':{name:'Orellana Gris — Económico Cero (C:N≈36)',s:'p_ostreatus_gris',i:[{id:'paja_cebada',p:50},{id:'salvado_trigo',p:20},{id:'borra_cafe',p:15},{id:'cascarilla_arroz',p:7},{id:'carbonato_calcio',p:5},{id:'yeso',p:3}]},
  // Orellana Blanca: C:N ideal 30. paja×55 + afrecho(c42,n3.5)×15 + salvado×15 + borra×8 → C:N≈30.1 ✓
  'orellana_blanca_premium':{name:'Orellana Blanca — Afrecho Premium (C:N≈30)',s:'p_ostreatus_blanco',i:[{id:'paja_trigo',p:55},{id:'afrecho_cerveceria',p:15},{id:'salvado_trigo',p:15},{id:'borra_cafe',p:8},{id:'carbonato_calcio',p:4},{id:'yeso',p:3}]},
  // Eryngii: C:N ideal 30. paja×40 + roble(c50,n0.1)×15 + afrecho×20 + salvado×17 → C:N≈29 ✓ (requiere autoclave)
  'eringii_tecnico':{name:'Seta de Cardo — Técnico Autoclave (C:N≈29)',s:'p_eryngii',i:[{id:'paja_trigo',p:40},{id:'aserrin_roble',p:15},{id:'afrecho_cerveceria',p:20},{id:'salvado_trigo',p:17},{id:'polvo_hueso',p:3},{id:'carbonato_calcio',p:3},{id:'yeso',p:2}]},
  // Shiitake: C:N ideal 50. roble×62 + guadua(c42,n0.35)×8 + salvado×20 + cascarilla_soya×5 → C:N≈54 ✓
  'shiitake_clasico':{name:'Shiitake — Tradicional Asiático (C:N≈50)',s:'shiitake',i:[{id:'aserrin_roble',p:62},{id:'guadua',p:8},{id:'salvado_trigo',p:20},{id:'cascarilla_soya',p:5},{id:'polvo_hueso',p:3},{id:'carbonato_calcio',p:2}]},
  // Lions Mane: C:N ideal 40. roble×60 + afrecho×12 + salvado×12 + cascarilla_soya×8 → C:N≈39 ✓
  'melena_leon_bioest':{name:'Melena de León — Master Enriquecido (C:N≈39)',s:'lions_mane',i:[{id:'aserrin_roble',p:60},{id:'afrecho_cerveceria',p:12},{id:'salvado_trigo',p:12},{id:'cascarilla_soya',p:8},{id:'carbonato_calcio',p:5},{id:'yeso',p:3}]},
  // Reishi: C:N ideal 50. roble×55 + corteza(c48,n0.3)×15 + cascarilla_soya×12 + salvado×12 → C:N≈50 ✓
  'reishi_especialista':{name:'Reishi — Ultra Especialista (C:N≈50, 4–6 meses)',s:'reishi',i:[{id:'aserrin_roble',p:55},{id:'corteza_molida',p:15},{id:'cascarilla_soya',p:12},{id:'salvado_trigo',p:12},{id:'carbonato_calcio',p:4},{id:'yeso',p:2}]},
  // Enoki: C:N ideal 27. paja_arroz×35 + pino_comp×15 + afrecho×22 + salvado×15 + cascarilla×5 → C:N≈27 ✓ (5–12°C)
  // Enoki: paja_arroz×35 + alamo(c45,n0.2)×15 + afrecho×22 + salvado×15 → C:N≈27 ✓ | alamo cs incluye enoki ✓
  'enoki_comercial':{name:'Enoki — Comercial Frío 5–12°C (C:N≈27)',s:'enoki',i:[{id:'paja_arroz',p:35},{id:'aserrin_alamo',p:15},{id:'afrecho_cerveceria',p:22},{id:'salvado_trigo',p:15},{id:'cascarilla_arroz',p:5},{id:'carbonato_calcio',p:5},{id:'yeso',p:3}]},
  // Nameko: C:N ideal 40. roble×45 + paja_arroz×20 + afrecho×15 + salvado×10 + borra×5 → C:N≈41 ✓
  'nameko_balanceado':{name:'Nameko — Umami Balanceado (C:N≈41)',s:'nameko',i:[{id:'aserrin_roble',p:45},{id:'paja_arroz',p:20},{id:'afrecho_cerveceria',p:15},{id:'salvado_trigo',p:10},{id:'borra_cafe',p:5},{id:'carbonato_calcio',p:3},{id:'yeso',p:2}]},
  // Orellana Rosa: C:N ideal 40. bagazo_caña(c42,n0.7)×50 + paja_arroz×20 + borra×10 + salvado×12 → C:N≈39 ✓
  'orellana_rosa_calida':{name:'Orellana Rosa — Cálida Caña+Arroz (C:N≈39)',s:'p_djamor_rosa',i:[{id:'bagazo_caña',p:50},{id:'paja_arroz',p:20},{id:'borra_cafe',p:10},{id:'salvado_trigo',p:12},{id:'carbonato_calcio',p:5},{id:'yeso',p:3}]},
  /* ── Presets Sabana de Bogotá 2026 — ingredientes locales validados ── */
  // Alfalfa: paja_trigo×68 + pulpa_alfalfa(c33,n3.0)×17 + afrecho×8 → C:N≈35 ✓ | EB referenciado 166%
  'alfalfa_eb166':{name:'★ Pulpa de Alfalfa — Máximo EB (C:N≈35)',s:'p_ostreatus_gris',i:[{id:'paja_trigo',p:68},{id:'pulpa_alfalfa',p:17},{id:'afrecho_cerveceria',p:8},{id:'carbonato_calcio',p:5},{id:'yeso',p:2}]},
  // Uchuva: cascara_uchuva(c35,n1.2)×50 + paja_trigo×28 + borra×5 + salvado×10 → C:N≈33 ✓ (validado Colombia)
  'uchuva_local':{name:'★ Uchuva Cundinamarca — Validado CO (C:N≈33)',s:'p_ostreatus_gris',i:[{id:'cascara_uchuva',p:50},{id:'paja_trigo',p:28},{id:'borra_cafe',p:5},{id:'salvado_trigo',p:10},{id:'carbonato_calcio',p:5},{id:'yeso',p:2}]},
  // Floricultura: tallo_floricultura(c42,n0.9)×50 + paja_arroz×25 + afrecho×15 + borra×5 → C:N≈33 ✓ (exploración)
  'floricultura_exploracion':{name:'★ Tallo de Floricultura — Exploración (C:N≈33)',s:'p_ostreatus_blanco',i:[{id:'tallo_floricultura',p:50},{id:'paja_arroz',p:25},{id:'afrecho_cerveceria',p:15},{id:'borra_cafe',p:5},{id:'carbonato_calcio',p:3},{id:'yeso',p:2}]},
  // Tuza de maíz: tusa_maiz(c45,n0.7)×60 + salvado(c45,n2.8)×25 + borra(c47,n2.0)×8 → C:N≈35.2 ✓
  'tuza_maiz_sabana':{name:'★ Tuza de Maíz — Estándar Sabana (C:N≈35)',s:'p_ostreatus_gris',i:[{id:'tusa_maiz',p:60},{id:'salvado_trigo',p:25},{id:'borra_cafe',p:8},{id:'carbonato_calcio',p:4},{id:'yeso',p:3}]},
  // Circular: chips_poda×35 + raices_hidrop×15 + roble×25 + cascarilla_soya×8 + salvado×10 → C:N≈39 ✓
  'circular_hidroponico':{name:'★ Circular Hidropónico — Economía Circular (C:N≈39)',s:'lions_mane',i:[{id:'chips_poda_urbana',p:35},{id:'raices_hidroponicas',p:15},{id:'aserrin_roble',p:25},{id:'cascarilla_soya',p:8},{id:'salvado_trigo',p:10},{id:'carbonato_calcio',p:5},{id:'yeso',p:2}]},
  /* ── Bodega Tenjo 2026 — formuladas con inventario propio (sin afrecho de cervecería) ── */
  'bodega_gris':{name:'⬡ Bodega — Orellana Gris (C:N≈33, solo inventario)',s:'p_ostreatus_gris',i:[{id:'bagazo_caña',p:50},{id:'salvado_trigo',p:20},{id:'borra_cafe',p:13},{id:'cascarilla_arroz',p:11},{id:'carbonato_calcio',p:4},{id:'sulfato_magnesio',p:2}]},
  'bodega_rosa':{name:'⬡ Bodega — Orellana Rosa (C:N≈42, solo inventario)',s:'p_djamor_rosa',i:[{id:'bagazo_caña',p:60},{id:'cascarilla_arroz',p:10},{id:'borra_cafe',p:9},{id:'cascara_cafe',p:8},{id:'salvado_trigo',p:7},{id:'carbonato_calcio',p:4},{id:'sulfato_magnesio',p:2}]},
  'bodega_blanca':{name:'⬡ Bodega — Orellana Blanca (C:N≈31, esterilizar: suplemento alto)',s:'p_ostreatus_blanco',i:[{id:'bagazo_caña',p:50},{id:'salvado_trigo',p:24},{id:'borra_cafe',p:13},{id:'cascarilla_arroz',p:8},{id:'carbonato_calcio',p:3},{id:'sulfato_magnesio',p:2}]},
  'bodega_blanca_maiz':{name:'⬡ Bodega+ — Blanca con harina de maíz (C:N≈28, $600/kg N)',s:'p_ostreatus_blanco',i:[{id:'bagazo_caña',p:50},{id:'harina_maiz',p:16},{id:'salvado_trigo',p:12},{id:'borra_cafe',p:8},{id:'cascarilla_arroz',p:8},{id:'carbonato_calcio',p:4},{id:'sulfato_magnesio',p:2}]},
  'bodega_melena_mastermix':{name:'⬡ Melena — Master’s Mix roble+soya (C:N≈30, literatura 150–180% EB)',s:'lions_mane',i:[{id:'aserrin_roble',p:55},{id:'cascarilla_soya',p:30},{id:'salvado_trigo',p:10},{id:'carbonato_calcio',p:3},{id:'sulfato_magnesio',p:2}]},
  /* ── Presets clásicos (compatibilidad) ── */
  kk1c:{name:'KK-1c (Sabana clásico)',s:'p_ostreatus_gris',i:[{id:'kikuyo',p:43},{id:'aserrin_eucalipto',p:28},{id:'cascarilla_arroz',p:8},{id:'salvado_trigo',p:8},{id:'yeso',p:2},{id:'carbonato_calcio',p:1}]},
  paja:{name:'Paja + Salvado (básico)',s:'p_ostreatus_gris',i:[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:18},{id:'yeso',p:1},{id:'carbonato_calcio',p:1}]},
  master:{name:"Master's Mix (Stamets)",s:'lions_mane',i:[{id:'aserrin_roble',p:50},{id:'cascarilla_soya',p:50}]},
  cafe:{name:'Café + Uchuva (circular)',s:'p_ostreatus_gris',i:[{id:'paja_trigo',p:45},{id:'borra_cafe',p:25},{id:'capacho_uchuva',p:20},{id:'salvado_trigo',p:7},{id:'yeso',p:2},{id:'carbonato_calcio',p:1}]},
  platano:{name:'Plátano + Salvado',s:'p_djamor_rosa',i:[{id:'pseudotallo_platano',p:55},{id:'cascara_platano',p:20},{id:'salvado_trigo',p:15},{id:'carbonato_calcio',p:5},{id:'yeso',p:3},{id:'melaza',p:2}]},
  hojarasca:{name:'Hojarasca UNAL',s:'p_ostreatus_gris',i:[{id:'kikuyo',p:50},{id:'hojarasca',p:30},{id:'rastrojo_frijol',p:10},{id:'carbonato_calcio',p:7},{id:'yeso',p:3}]},
};

// ── TIPOS DE CONTENEDOR / BOLSA ─────────────────────────────────────────────
// kgHumedo: carga típica en kg húmedo por unidad
// vol_L: volumen útil aproximado en litros
// El simulador usa kgHumedo como valor por defecto de prodKg al seleccionar el tipo
const BAG_TYPES=[
  {id:'bolsa_20x50',icon:'',
   name:'Bolsa 20×50 cm · filtro 0.06mm',
   kgHumedo:1.8,vol_L:3.6,
   tratamiento:'cwlp_thermal',
   color:'var(--moss-500,var(--accent-olive))',
   dim:'20×50 cm',
   notas:'Formato estándar Setas de la Peña. Compatible con CWLP o pasteurización. Inocular mezclando en capas o por la boca superior antes de cerrar con filtro.',
   produccion:'Colgar o apoyar verticalmente. Sin orificios adicionales — el filtro maneja el intercambio gaseoso.',
  },
  {id:'bolsa_18x35',icon:'',
   name:'Bolsa 18×35 cm · filtro 0.06mm',
   kgHumedo:1.0,vol_L:2.0,
   tratamiento:'cwlp_thermal',
   color:'var(--ochre-600)',
   dim:'18×35 cm',
   notas:'Formato pequeño. Ideal para pruebas de receta, especies exigentes (P. eryngii, Lions Mane), o Martha tent con poco espacio.',
   produccion:'Apilar en estantería o colgar. Bajo peso = fácil manejo. 30 bolsas = ~30 kg de sustrato húmedo.',
  },
  {id:'punch_bag_martha',icon:'',
   name:'Bolsa colgante (punch bag · Martha tent)',
   kgHumedo:3.5,vol_L:7.0,
   tratamiento:'thermal',
   color:'var(--coral-700)',
   dim:'~22×70 cm relleno',
   notas:'Versión escalada para Martha tent (1 bolsa de polipropileno 22×80cm aprox.). Llenar 3.5–4 kg. Colgar del centro del tent con cuerda o gancho. Cortar 6–8 orificios Ø2–2.5cm en espiral cada ~10 cm desde la base. Ideal Pleurotus — alta densidad de fructificación por m².',
   produccion:'Un solo punch bag ocupa el espacio central del tent y deja espacio alrededor para humidificación uniforme. Escalar a 2 bolsas para un tent 120×60cm. Pinchar con cuchillo o sacabocado caliente, no con tijeras.',
  },
];
const Bag=()=><><rect x="5" y="48" width="60" height="40" rx="2" fill="var(--ink-900)"/><rect x="5" y="48" width="60" height="7" rx="2" fill="var(--ink-900)"/></>;
const IcoTherm=()=><svg width="8" height="13" viewBox="0 0 8 13" fill="currentColor"><path d="M3 7.8V2.5a1.5 1.5 0 013 0v5.3a3 3 0 11-3 0z" opacity=".6"/></svg>;
const IcoDrop=()=><svg width="9" height="12" viewBox="0 0 9 12" fill="currentColor"><path d="M4.5.5S1 5.5 1 8a3.5 3.5 0 007 0c0-2.5-3.5-7.5-3.5-7.5z" opacity=".6"/></svg>;
const IcoLayers=()=><svg width="12" height="9" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".6"><path d="M1 2.5l5 2.5 5-2.5M1 5.5l5 2.5 5-2.5"/></svg>;
const IcoArrow=()=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" opacity=".4"/><path d="M5.5 8h5M8.5 5.5L11 8l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SppSvg=({sKey,c})=>{
  const lt='rgba(255,255,255,0.15)';
  const m={
    p_ostreatus_gris:(<><line x1="26" y1="38" x2="25" y2="52" stroke={c} strokeWidth="4.5" strokeLinecap="round"/><line x1="40" y1="34" x2="39" y2="52" stroke={c} strokeWidth="4" strokeLinecap="round"/><line x1="53" y1="39" x2="52" y2="52" stroke={c} strokeWidth="3.5" strokeLinecap="round"/><Bag/><path d="M4,30 Q14,12 32,16 Q22,28 20,38Z" fill={c} opacity=".9"/><path d="M14,24 Q28,6 48,10 Q38,24 36,38Z" fill={c}/><path d="M34,28 Q46,12 62,18 Q56,30 52,40Z" fill={c} opacity=".88"/></>),
    p_ostreatus_blanco:(<><line x1="26" y1="38" x2="25" y2="52" stroke={c} strokeWidth="4.5" strokeLinecap="round"/><line x1="40" y1="34" x2="39" y2="52" stroke={c} strokeWidth="4" strokeLinecap="round"/><Bag/><path d="M6,32 Q16,14 34,18 Q24,30 22,40Z" fill={c} opacity=".88"/><path d="M22,26 Q36,8 54,14 Q44,26 42,40Z" fill={c}/></>),
    p_djamor_rosa:(<><line x1="24" y1="38" x2="23" y2="52" stroke={c} strokeWidth="4" strokeLinecap="round"/><line x1="40" y1="35" x2="39" y2="52" stroke={c} strokeWidth="3.5" strokeLinecap="round"/><line x1="54" y1="40" x2="53" y2="52" stroke={c} strokeWidth="3" strokeLinecap="round"/><Bag/><path d="M6,33 Q16,15 32,18 Q22,30 20,40Z" fill={c} opacity=".86"/><path d="M18,26 Q32,8 50,12 Q40,26 38,40Z" fill={c}/><path d="M36,30 Q48,16 62,22 Q56,32 54,42Z" fill={c} opacity=".83"/></>),
    p_eryngii:(<><rect x="26" y="28" width="18" height="24" rx="7" fill={c} opacity=".88"/><Bag/><ellipse cx="35" cy="20" rx="29" ry="13" fill={c}/><ellipse cx="35" cy="24" rx="29" ry="9" fill={c} opacity=".4"/></>),
    shiitake:(<><rect x="28" y="32" width="14" height="20" rx="6" fill={c} opacity=".82"/><Bag/><path d="M7,27 Q22,4 35,5 Q48,4 63,27 Q56,42 35,44 Q14,42 7,27Z" fill={c}/>{[[22,15],[30,10],[40,11],[50,16],[44,22],[24,22]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.5" fill={lt}/>)}</>),
    lions_mane:(<><Bag/><circle cx="44" cy="22" r="18" fill={c} opacity=".65"/><circle cx="28" cy="26" r="21" fill={c} opacity=".88"/>{[-16,-10,-4,2,8,14,20].map((dx,i)=><line key={i} x1={28+dx} y1={42+i%2*3} x2={27+dx} y2={56+i%3*4+i} stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity=".82"/>)}</>),
    reishi:(<><rect x="8" y="14" width="10" height="38" rx="4" fill={c} opacity=".88"/><Bag/><path d="M14,16 Q14,6 44,8 Q66,8 66,22 Q66,34 44,36 Q16,36 14,28Z" fill={c}/><path d="M14,28 Q14,18 44,20 Q66,20 66,34 Q66,46 44,48 Q16,48 14,40Z" fill={c} opacity=".85"/><path d="M14,40 Q14,30 44,32 Q64,32 64,46 Q64,56 44,58 Q16,58 14,50Z" fill={c} opacity=".72"/></>),
    enoki:(<>{[12,19,26,33,40,48,56].map((x,i)=><line key={i} x1={x} y1={16+i%3*4} x2={x} y2={52} stroke={c} strokeWidth="2.2" strokeLinecap="round"/>)}<Bag/>{[12,19,26,33,40,48,56].map((x,i)=><ellipse key={i} cx={x} cy={13+i%3*4} rx="7" ry="5" fill={c}/>)}</>),
    nameko:(<><line x1="24" y1="35" x2="23" y2="52" stroke={c} strokeWidth="4" strokeLinecap="round"/><line x1="38" y1="31" x2="37" y2="52" stroke={c} strokeWidth="3.5" strokeLinecap="round"/><line x1="50" y1="35" x2="49" y2="52" stroke={c} strokeWidth="3" strokeLinecap="round"/><Bag/><path d="M6,35 Q16,22 28,24 Q22,33 22,40Z" fill={c} opacity=".83"/><path d="M20,30 Q30,16 44,18 Q38,30 36,40Z" fill={c} opacity=".9"/><path d="M38,33 Q48,20 60,24 Q54,34 52,42Z" fill={c} opacity=".86"/><path d="M16,20 Q24,10 34,12 Q29,20 28,28Z" fill={c} opacity=".78"/><path d="M34,17 Q42,7 52,10 Q46,19 44,26Z" fill={c} opacity=".76"/></>),
  };
  return <svg viewBox="0 0 70 90" width="66" height="79" style={{display:'block',overflow:'visible'}}>{m[sKey]||m.p_ostreatus_gris}</svg>;
};

const analyze=(recipe,sKey,ings=INGS)=>{
  if(!recipe.length) return null;
  const tot=recipe.reduce((s,r)=>s+(parseFloat(r.p)||0),0);if(!tot) return null;
  let wC=0,wN=0,wPh=0,wDig=0,wCra=0,nP=0,suppP=0,baseP=0,addP=0,cafeP=0,manP=0,airP=0,densaP=0,incompat=[];
  const DENSOS=['aserrin_roble','aserrin_eucalipto','aserrin_pino','aserrin_pino_compostado','borra_cafe','afrecho_cerveceria','chips_poda_urbana','guadua','carton_corrugado','pulpa_papel'];
  recipe.forEach(r=>{
    const g=ings.find(i=>i.id===r.id);if(!g) return;
    const p=parseFloat(r.p)||0;
    // A · Aislamiento de la matriz nutritiva: los aditivos minerales/estructurales secos
    // (carbonato, yeso, zeolita, cascarilla de huevo, vermicompost…) NO entran en la
    // relación C:N — se usan solo como modificadores de pH y textura. Evita el sesgo de
    // dilución del denominador lignocelulósico.
    const esAditivoSeco=(g.role==='aditivo_ph'||g.role==='aditivo_estructura');
    // C:N BASE SECA: los valores c/n de la BD son % materia seca → ponderar por fracción seca
    // para corregir diferencias de humedad entre insumos (borra café 60% vs paja 12%).
    const dryFrac=p*(1-Math.min(0.92,Math.max(0,(g.moisture||0)/100)));
    if(g.cn>0&&!esAditivoSeco){wC+=g.c*dryFrac;wN+=g.n*dryFrac;nP+=dryFrac;}
    wPh+=g.ph*p; wDig+=g.dig*p; wCra+=g.cra*p;
    if(g.role==='suplemento_n') suppP+=p;
    if(g.role==='base_carbono') baseP+=p;
    if(['aditivo_ph','aditivo_estructura','aditivo_micronutriente'].includes(g.role)) addP+=p;
    if(g.role==='aireador') airP+=p;
    if(g.cat==='cafe') cafeP+=p;
    if(g.cat==='est') manP+=p;
    if(DENSOS.includes(g.id)) densaP+=p;
    if(sKey&&!g.cs.includes(sKey)&&g.cn>0) incompat.push(g.name);
  });
  const avgN=nP?wN/nP:0,cn=avgN>0?(nP?wC/nP:0)/avgN:0;
  const avgPh=tot?wPh/tot:7;
  const avgDig=tot?wDig/tot:5;
  const avgCra=tot?wCra/tot:3;
  const cost=recipe.reduce((s,r)=>{const g=ings.find(i=>i.id===r.id);return g?s+(g.cost*(parseFloat(r.p)||0)/100):s;},0);
  const sp=SPP[sKey];let eb=0,trichoderma=false,dynSpawn=sp?.spawn_rate||8;
  if(sp){
    const cF=Math.max(0,1-Math.pow(Math.abs(cn-sp.cn_optimal.ideal)/((sp.cn_optimal.max-sp.cn_optimal.min)/2),1.5));
    const nF=Math.max(0,1-Math.pow(Math.abs(avgN-sp.n_optimal.ideal)/((sp.n_optimal.max-sp.n_optimal.min)/2),1.5));
    eb=sp.eb_baseline+(sp.eb_optimal-sp.eb_baseline)*(cF*.6+nF*.4);
    const needsAutoclave=suppP>sp.supplementation_max;
    const nThresh=needsAutoclave?sp.n_optimal.max*1.2:sp.n_optimal.max*1.15;
    if(avgN>nThresh&&!needsAutoclave){trichoderma=true;eb*=.45;}
    else if(avgN>nThresh&&needsAutoclave){eb*=.80;}
    else if(needsAutoclave) eb*=.85;
    if(incompat.length) eb*=.9;
    if(tot<95||tot>105) eb*=.95;
    // ── Modificadores multifactor de EB (penalizaciones ≤1: una receta en óptimo no se ve afectada) ──
    // pH fuera de rango: la acidez excesiva bloquea más que la alcalinidad ligera
    var phF=1;
    if(sp.ph_optimal){
      if(avgPh<sp.ph_optimal.min) phF=Math.max(.70,1-(sp.ph_optimal.min-avgPh)*0.12);
      else if(avgPh>sp.ph_optimal.max) phF=Math.max(.80,1-(avgPh-sp.ph_optimal.max)*0.10);
    }
    // Aireación: riesgo de anaerobiosis con mucho material denso y poco aireador
    var aerF=1;
    if(densaP>60&&airP<10) aerF=.85;
    else if(densaP>40&&airP<8) aerF=.93;
    // Digestibilidad: sustratos muy lignificados colonizan lento y rinden algo menos
    // F-19: shiitake/reishi son degradadores de lignina — digF no aplica en madera dura
    const isLigninSpp=['shiitake','reishi'].includes(sKey);
    var digF=isLigninSpp?1:(avgDig>=6?1:Math.max(.85,1-(6-avgDig)*0.03));
    eb=eb*phF*aerF*digF;
    var ebMods={phF,aerF,digF};
    // ── Banda de incertidumbre EB — CV base 18%, crece con penalizadores activos ──
    var ebCvVal=0.18;
    if(ebMods.phF<0.95) ebCvVal+=0.05;
    if(ebMods.aerF<0.95) ebCvVal+=0.05;
    if(ebMods.digF<0.95) ebCvVal+=0.04;
    if(incompat.length) ebCvVal+=0.08;
    if(suppP>sp.supplementation_max) ebCvVal+=0.10;
    if(trichoderma) ebCvVal=0.50;
    ebCvVal=Math.min(trichoderma?0.50:0.40,ebCvVal);
    var ebLow=Math.round(eb*(1-ebCvVal));
    var ebHigh=Math.round(eb*(1+ebCvVal));
    var ebIndex=Math.round(Math.max(0,Math.min(100,(eb-sp.eb_baseline)/Math.max(1,sp.eb_optimal-sp.eb_baseline)*100)));
    dynSpawn=Math.min(15,(sp.spawn_rate||8)+Math.floor(suppP/5));
  }
    const eucPct=recipe.reduce((s,r)=>r.id==='aserrin_eucalipto'?s+(parseFloat(r.p)||0):s,0);const pescPct=recipe.reduce((s,r)=>r.id==='harina_pescado'?s+(parseFloat(r.p)||0):s,0);return{tot,avgN,cn,cost,eb,suppP,baseP,addP,cafeP,manP,airP,densaP,incompat,sp,trichoderma,dynSpawn,avgPh,avgDig,avgCra,eucPct,pescPct,ebLow:typeof ebLow!=='undefined'?ebLow:Math.round(eb),ebHigh:typeof ebHigh!=='undefined'?ebHigh:Math.round(eb),ebIndex:typeof ebIndex!=='undefined'?ebIndex:0,ebMods:typeof ebMods!=='undefined'?ebMods:null};
};

// ── Balance de masa: única fuente de verdad usada por Formulador, Ficha,
//    Comparador, Dashboard y Bitácora. Tolerancia explícita: ±0.5 pp.
const MASS_BALANCE_TOL=0.5;
const isMassBalanced=a=>!!a&&Math.abs(a.tot-100)<=MASS_BALANCE_TOL;
const massBalanceMsg=a=>{
  if(!a) return'';
  const d=a.tot-100;
  if(Math.abs(d)<=MASS_BALANCE_TOL) return`Balance de masa: ${a.tot.toFixed(1)}% = 100% ✓`;
  return d<0?`Balance de masa: ${a.tot.toFixed(1)}% − 100% = ${d.toFixed(1)} pp · faltan ${Math.abs(d).toFixed(1)}%`
            :`Balance de masa: ${a.tot.toFixed(1)}% − 100% = +${d.toFixed(1)} pp · sobran ${d.toFixed(1)}%`;
};

const diagnose=(a,sKey)=>{
  if(!a) return{main:'Selecciona ingredientes para comenzar.',sugs:[]};
  const{tot,cn,avgN,suppP,baseP,addP,cafeP,airP,densaP,incompat,eb,sp,trichoderma,dynSpawn,avgPh,avgDig,avgCra,eucPct,pescPct}=a;const s=[];
  if(tot<95) s.push({t:'error',i:'⚠',tx:`Total ${tot.toFixed(1)}% — necesitas ${(100-tot).toFixed(1)}% más.`});
  else if(tot>105) s.push({t:'error',i:'⚠',tx:`Total ${tot.toFixed(1)}% — reduce ${(tot-100).toFixed(1)}%.`});
  if(sp){
    if(cn<sp.cn_optimal.min) s.push({t:'warning',i:'↓',tx:`C:N bajo (${cn.toFixed(1)}:1). Agrega base carbono. Objetivo ${sp.cn_optimal.min}–${sp.cn_optimal.max}:1.`});
    else if(cn>sp.cn_optimal.max) s.push({t:'warning',i:'↑',tx:`C:N alto (${cn.toFixed(1)}:1). Agrega salvado o café.`});
    else s.push({t:'success',i:'✓',tx:`C:N óptimo (${cn.toFixed(1)}:1) para ${sp.name}.`});
    if(trichoderma) s.push({t:'error',i:'⚠',tx:`COLAPSO TRICHODERMA: N=${avgN.toFixed(2)}% supera umbral crítico sin autoclave. EB cae ~85%. Opciones: reducir N, usar autoclave 121°C×90min, spawn ${dynSpawn}%+.`});
    else if(avgN<sp.n_optimal.min) s.push({t:'warning',i:'↓',tx:`Nitrógeno bajo (${avgN.toFixed(2)}%). Aumenta salvado o borra de café.`});
    else if(avgN>sp.n_optimal.max) s.push({t:'warning',i:'↑',tx:`Nitrógeno elevado (${avgN.toFixed(2)}%). Riesgo moderado. Spawn ajustado: ${dynSpawn}%.`});
    else s.push({t:'success',i:'✓',tx:`Nitrógeno óptimo (${avgN.toFixed(2)}%). Spawn dinámico: ${dynSpawn}%.`});
    if(suppP>sp.supplementation_max) s.push({t:'error',i:'!',tx:`Suplementación ${suppP.toFixed(0)}% excede ${sp.supplementation_max}%. REQUIERE AUTOCLAVE 121°C×90min. Spawn: ${dynSpawn}%.`});
    // pH
    if(sp.ph_optimal){
      if(avgPh<sp.ph_optimal.min) s.push({t:'error',i:'',tx:`pH estimado ${avgPh.toFixed(1)} — demasiado ácido para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Agrega carbonato de calcio o ceniza vegetal.`});
      else if(avgPh>sp.ph_optimal.max) s.push({t:'warning',i:'',tx:`pH estimado ${avgPh.toFixed(1)} — ligeramente alcalino para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Reduce cal/yeso o agrega borra de café/aserrín.`});
      else s.push({t:'success',i:'',tx:`pH estimado ${avgPh.toFixed(1)} — dentro del rango óptimo para ${sp.name} (${sp.ph_optimal.min}–${sp.ph_optimal.max}).`});
    }
  }
  if(baseP<50) s.push({t:'warning',i:'↓',tx:`Base carbono baja (${baseP.toFixed(0)}%). Mínimo 50%.`});
  if(addP<2) s.push({t:'warning',i:'!',tx:`Sin minerales. Agrega 2–4% carbonato/yeso.`});
  if(cafeP>30) s.push({t:'error',i:'!',tx:`Borra café ${cafeP.toFixed(0)}% — compactación. Máx 30%.`});
  if(eucPct>20) s.push({t:'warning',i:'⚠',tx:`Aserín de eucalipto ${eucPct.toFixed(0)}% — aceites esenciales (cineol, terpineol) reducen colonización 20–35%. Máximo recomendado: 20%.`});
  if(pescPct>3) s.push({t:'error',i:'⚠',tx:`Harina de pescado ${pescPct.toFixed(0)}% supera el 3% — riesgo elevado de ácaros y Sciaridae por olor. Reducir a ≤3% o eliminar.`});
  else if(cafeP>0) s.push({t:'success',i:'',tx:`Café en proporción saludable (${cafeP.toFixed(0)}%).`});
  if(densaP>60&&airP<10) s.push({t:'error',i:'',tx:`Riesgo anaerobiosis: ${densaP.toFixed(0)}% material denso + solo ${airP.toFixed(0)}% aireador. Agrega 10–15% cascarilla de arroz o tamo.`});
  else if(densaP>40&&airP<8) s.push({t:'warning',i:'',tx:`Estructura densa (${densaP.toFixed(0)}% fino, ${airP.toFixed(0)}% aireador). Agrega 8–10% cascarilla.`});
  else s.push({t:'success',i:'',tx:`Buena aireación (${airP.toFixed(0)}% aireador). O₂ adecuado.`});
  // Digestibilidad
  const digLbl=avgDig>=8?'Alta — colonización rápida (7–14 días)':avgDig>=5?'Media — colonización estándar (14–21 días)':'Baja — sustrato lignificado (21–35+ días). Considera pretratamiento o esporas de Shiitake/Reishi.';
  s.push({t:avgDig>=8?'success':avgDig>=5?'warning':'warning',i:'',tx:`Digestibilidad ${avgDig.toFixed(1)}/10 — ${digLbl}`});
  // CRA
  const craLbl=avgCra>=4?'Alta — reduce agua de hidratación ~10%':avgCra<=2?'Baja — hidratar bien, revisar punto de campo':null;
  if(craLbl) s.push({t:'warning',i:'',tx:`CRA ${avgCra.toFixed(1)}/5 — ${craLbl}`});
  s.push({t:'success',i:'△',tx:`Tenjo 2.580 msnm: humedad objetivo 67–68%. Pasteurización sin presión: +25% tiempo. CWLP: pH≥12.`});
  if(incompat.length) s.push({t:'warning',i:'!',tx:`No ideales para ${sp?.name}: ${incompat.join(', ')}.`});
  // Transparencia del modelo: qué factores penalizan la EB y cuánto
  if(a.ebMods){
    const m=a.ebMods,pen=[];
    if(m.phF<1) pen.push(`pH −${Math.round((1-m.phF)*100)}%`);
    if(m.aerF<1) pen.push(`aireación −${Math.round((1-m.aerF)*100)}%`);
    if(m.digF<1) pen.push(`digestibilidad −${Math.round((1-m.digF)*100)}%`);
    if(pen.length) s.push({t:'warning',i:'⚙',tx:`EB ajustada por: ${pen.join(', ')}. Corrige estos factores para acercarte al EB máximo de la especie.`});
  }
  let main='';
  if(s.filter(x=>x.t==='error').length) main='Problemas críticos. Revisar antes de continuar.';
  else if(s.filter(x=>x.t==='warning').length>2) main='Receta funcional con margen de optimización.';
  else if(eb>100) main='Receta excelente — eficiencia biológica esperada superior al promedio.';
  else if(eb>80) main='Receta satisfactoria para producción estándar.';
  else main='Receta funcional. Revisar sugerencias.';
  return{main,sugs:s};
};

// ── Módulo de Optimización de Recetas (recipe-optimizer.js) ──
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
  OPT_PROFILES,
} = (typeof SetasRecipeOptimizer !== 'undefined'
  ? SetasRecipeOptimizer
  : (typeof require !== 'undefined' ? require('./recipe-optimizer.js') : {}));

// ── Calibración histórica — puente hacia historical-calibration.js ──
// Deriva la eficiencia biológica de lotes REALES de Bitácora. Antes esto se
// alimentaba del array `yields` del shell, que son 5 filas de demo inventadas.
const { bitacoraEBRows, historicalEB } = (typeof SetasHistoricalCalibration !== 'undefined'
  ? SetasHistoricalCalibration
  : (typeof require !== 'undefined' ? require('./historical-calibration.js') : {}));

const METRIC_LABEL = { cn: 'C:N', n: 'N', ph: 'pH' };
const fmtMetric = (metric, v) => metric === 'cn' ? `${v.toFixed(1)}:1` : metric === 'n' ? `${v.toFixed(2)}%` : v.toFixed(1);

// ── scoreAn — puente hacia scoring.js (SetasScoring), fuente única del score ──
const scoreAn = (an, extraCtx = {}) => {
  if (!an || !an.sp) return { score: 0, status: 'sin_receta', breakdown: null, weights: null, caps: null };
  const sev = SetasScoring.assessSeverity(an);
  return SetasScoring.scoreRecipe(an, { ...extraCtx, criticals: sev.criticals, warnings: sev.warnings, severity: sev.severity });
};


// B · Balance de masas húmedas industrial.
// Convierte la receta teórica (% base seca) en órdenes de pesado reales en báscula,
// derivando la masa seca del objetivo de humedad del lote y la humedad intrínseca de
// cada insumo comercial. Cierra el balance al peso húmedo objetivo exacto.
const calcBatch=(recipe,n,kg,hObj=67,spawnCostKg=12000,ings=INGS,dynSpawn=8)=>{
  if(!recipe.length||!n||!kg) return null;
  const wet=n*kg;                                   // sustrato húmedo final objetivo (kg)
  const hF=Math.min(0.85,Math.max(0.40,hObj/100));  // fracción de humedad objetivo
  const dry=wet*(1-hF);                             // masa seca total requerida (kg)
  const spawnRate=Math.min(0.15,Math.max(0.05,dynSpawn/100));
  const items=recipe.map(r=>{
    const g=ings.find(i=>i.id===r.id);if(!g) return null;
    const masaSeca=dry*(parseFloat(r.p)/100);       // aporte seco del insumo
    const m=Math.min(0.92,Math.max(0,(g.moisture||0)/100)); // humedad intrínseca
    const kr=masaSeca/(1-m);                         // kg comerciales reales a pesar en báscula
    const aguaOculta=kr*m;                           // agua que ya trae el insumo
    return{name:g.name,kr,masaSeca,aguaOculta,cost:kr*g.cost,unit:kr<.5?`${Math.round(kr*1000)} g`:`${kr.toFixed(2)} kg`};
  }).filter(Boolean);
  const aguaTot=dry*(hF/(1-hF));                     // agua total que debe contener la mezcla
  const aguaInh=items.reduce((s,i)=>s+i.aguaOculta,0); // agua aportada por los insumos
  const agua=Math.max(0,aguaTot-aguaInh);            // agua neta a inyectar (L ≈ kg)
  const kgComercialTotal=items.reduce((s,i)=>s+i.kr,0); // peso total a pesar (base húmeda comercial)
  const sustCost=items.reduce((s,i)=>s+i.cost,0);
  const spawnKg=wet*spawnRate;
  const spawnCostTotal=spawnKg*spawnCostKg;
  const totalCost=sustCost+spawnCostTotal;
  const costPerBag=n>0?totalCost/n:0;
  return{items,wet,dry,kgComercialTotal,aguaTot,aguaInh,cost:sustCost,spawn:spawnKg,spawnCostTotal,totalCost,costPerBag,agua,hObj};
};

const calcSchedule=(sKey,dateStr,eb)=>{
  const sp=SPP[sKey];if(!sp||!dateStr) return null;
  const base=new Date(dateStr+'T12:00:00');
  const add=(d,n)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r;};
  const fmt=d=>d.toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'});
  const T={p_ostreatus_gris:{c50:12,c100:22,pr:28,f1:35,f2:52,f3:68},p_ostreatus_blanco:{c50:14,c100:26,pr:32,f1:40,f2:57,f3:74},p_djamor_rosa:{c50:14,c100:28,pr:34,f1:42,f2:59,f3:76},p_eryngii:{c50:18,c100:32,pr:40,f1:48,f2:66,f3:84},shiitake:{c50:30,c100:55,pr:75,f1:90,f2:115,f3:140},lions_mane:{c50:20,c100:35,pr:42,f1:50,f2:68,f3:86},reishi:{c50:25,c100:50,pr:80,f1:120,f2:160,f3:200},enoki:{c50:15,c100:28,pr:35,f1:42,f2:58,f3:74},nameko:{c50:20,c100:38,pr:48,f1:60,f2:80,f3:100}};
  const d=T[sKey]||T.p_ostreatus_gris;
  const adj=n=>Math.round(n/Math.max(.85,Math.min(1.2,(eb||100)/100)));
  // Especies sensibles a bajas temperaturas: fructifican mal o no fructifican bajo el
  // clima ambiente de la Sabana/Tenjo (~14–18°C) y requieren cámara con control térmico
  // activo. p_djamor_rosa es cálida-estricta (28–30°C ideal).
  const COLD_SENSITIVE={p_djamor_rosa:'28–30°C'};
  const coldWarn=COLD_SENSITIVE[sKey]?` ⚠️ Especie sensible al frío: requiere ${COLD_SENSITIVE[sKey]}. El clima ambiente de la Sabana/Tenjo (~14–18°C) no alcanza este rango — usa cámara de fructificación con control térmico activo (>22°C), no fructificación pasiva a temperatura ambiente.`:'';
  const evts=[
    {key:'in',type:'inoculation',day:0,title:'Inoculación',detail:`Empacar bolsas. Spawn ${sp.spawn_rate}%.`},
    {key:'c5',type:'normal',day:adj(d.c50),title:'Colonización 50%',detail:'Micelio blanco visible en la bolsa.'},
    {key:'c1',type:coldWarn?'warning':'normal',day:adj(d.c100),title:'Colonización completa',detail:`Pasar a cámara de fructificación. ${sp.temp_fruit}.${coldWarn}`},
    {key:'pr',type:'normal',day:adj(d.pr),title:'Primordios',detail:'HR 90–95%. Abrir bolsa o cortar.'},
    {key:'f1',type:'harvest',day:adj(d.f1),title:'Primera cosecha',detail:`~${eb?(eb*.55).toFixed(0):'?'}% EB.`},
    {key:'f2',type:'harvest',day:adj(d.f2),title:'Segunda cosecha',detail:`~${eb?(eb*.35).toFixed(0):'?'}% EB.`},
    {key:'f3',type:'harvest',day:adj(d.f3),title:'Tercera cosecha',detail:'Evaluar si compostar el bloque.'}
  ];
  return{evts:evts.map(e=>({...e,ds:fmt(add(base,e.day))})),tot:adj(d.f3),first:fmt(add(base,adj(d.f1))),inc:adj(d.c100)};
};

const PasteGuide=({tr,recipe,numBags,kgBag})=>{
  if(!tr) return null;
  const wet=(numBags*kgBag).toFixed(1);
  const guides={
    autoclave:[
      {n:1,t:'Empaque las bolsas',d:`Llena cada bolsa PP hasta ${kgBag} kg de sustrato húmedo. Cierra con filtro 0.2 µm o algodón + papel kraft + cinta autoclave. No comprimas.`},
      {n:2,t:'Carga el autoclave',d:'Apila las bolsas sin sobrecargar. Deja espacio para circulación de vapor. Coloca indicador de esterilización (tira o pellet).' },
      {n:3,t:'Purga de aire',d:'Al iniciar, abre la válvula de purga 2–3 min para expulsar el aire frío. El vapor debe salir continuo antes de cerrar.'},
      {n:4,t:'Esteriliza',d:`Mantén 121°C / 18.5–19 PSI manométricos durante 90–120 min. A 2.580 msnm 15 PSI NO alcanzan 121°C reales — usa 18.5–19 PSI manométricos, o valida con sensor de núcleo que el sustrato llegue a 121°C real.`},
      {n:5,t:'Enfría (crítico)',d:`Deja enfriar dentro del autoclave apagado. Saca las bolsas cuando estén a <35°C (mínimo 4–6 h). Nunca abras caliente — la condensación abre los poros y contamina.`},
      {n:6,t:'Inocula en condiciones estériles',d:`Usa cámara de flujo laminar o caja SAB. Alcohol 70% en todas las superficies. Spawn rate: ${tr.spawn}%. Sella inmediatamente.`},
    ],
    thermal:[
      {n:1,t:'Prepara el baño de pasteurización',d:`Calienta agua para sumergir ${wet} kg de sustrato. Usa termómetro calibrado de pincho. En Tenjo (2.580 msnm) el agua hierve a ~91°C: el calor llega más lento al núcleo, por eso se trabaja por tiempo extendido y se mide el centro de la masa, no solo el agua.`},
      {n:2,t:'Sumerge el sustrato',d:'Introduce el sustrato en bolsas o costales permeables. Asegura que todo quede bajo el agua con un peso. Sin burbujas de aire atrapadas.'},
      {n:3,t:'Pasteuriza por núcleo',d:`Sostén el NÚCLEO del sustrato entre 65–75°C durante 6–8 h (base 5–6 h +25% por altitud). Clava el termómetro en el centro de la masa y verifica cada 20 min — el agua puede estar más caliente que el núcleo. No superes 80°C: por encima se esteriliza de más y se pierde la microbiota protectora.`},
      {n:4,t:'Enfría tapado',d:'Escurre y deja enfriar en lugar limpio tapado con plástico. No muevas hasta que esté <30°C (mínimo 3–4 h en ambiente Tenjo 14°C).'},
      {n:5,t:'Prueba de campo',d:'Aprieta un puñado — debe caer máximo 1–2 gotas de agua. Si chorrea, escurre más. Si no sale nada, agrega agua.'},
      {n:6,t:'Inocula',d:`Spawn rate: ${tr.spawn}%. Mezcla bien o distribuye en capas. Cierra con polyfil o filtro. Registra fecha y lote.`},
    ],
    cwlp:[
      {n:1,t:'Prepara la solución de cal',d:`Disuelve 150–200 g de cal hidratada por cada 100 L de agua. Mezcla bien y verifica pH ≥ 12 con tira indicadora (pH 12–13 es el rango activo contra patógenos). A 2.580 msnm CWLP funciona igual que a nivel del mar — independiente de temperatura.`},
      {n:2,t:'Sumerge el sustrato',d:`Introduce ${wet} kg de sustrato. Usa pesos para mantenerlo sumergido. Todo debe estar en contacto con la solución — sin partes secas.`},
      {n:3,t:'Tiempo de inmersión',d:'Mantén sumergido 18–24 horas. No es necesario calentar. La alcalinidad (no el calor) es el agente sanitizante.'},
      {n:4,t:'Escurre y neutraliza',d:'Saca y escurre bien. Si el pH final del sustrato es >9, enjuaga brevemente con agua limpia. El pH objetivo del sustrato escurrido es 7–8.'},
      {n:5,t:'Punto de campo',d:'Misma prueba: 1–2 gotas al apretar. En Tenjo el aire seco acelera el secado — a veces hay que agregar agua después del escurrido.'},
      {n:6,t:'Inocula',d:`Spawn rate: ${tr.spawn}%. Inocula máximo 2–3 h después de escurrir. Tiempo de exposición al aire aumenta riesgo de recontaminación.`},
    ],
  };
  const steps=guides[tr.col]||[];
  return(
    <div style={{marginTop:14,background:'var(--paper-200)',border:'1px solid var(--border-soft)',padding:'var(--space-4)'}}>
      <div className="sec">Guía de {tr.name} · Tenjo 2.580 msnm</div>
      {steps.map(st=>(
        <div key={st.n} style={{display:'flex',gap:14,marginBottom:12,paddingBottom:12,borderBottom:'1px solid var(--paper-300)'}}>
          <div style={{fontFamily:"var(--font-num)",fontSize:28,fontWeight:300,color:'var(--coral-500)',lineHeight:1,minWidth:32,paddingTop:2}}>{st.n}</div>
          <div>
            <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)',marginBottom:4}}>{st.t}</div>
            <div style={{fontSize:"var(--text-base)",color:'var(--ink-700)',lineHeight:1.55}}>{st.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RadarChart=({an,cAn,sKey,cmpKey})=>{
  if(!an||!an.sp) return null;
  const spA=an.sp,spB=cAn&&cAn.sp?cAn.sp:spA;
  const norm=(v,min,max)=>Math.min(1,Math.max(0,(v-min)/(max-min||1)));
  const axes=[
    {label:'C:N',va:norm(an.cn,spA.cn_optimal.min,spA.cn_optimal.max*(1+0.3)),vb:cAn?norm(cAn.cn,spB.cn_optimal.min,spB.cn_optimal.max*(1+0.3)):0,inv:true},
    {label:'N%',va:norm(an.avgN,spA.n_optimal.min*0.5,spA.n_optimal.max*1.3),vb:cAn?norm(cAn.avgN,spB.n_optimal.min*0.5,spB.n_optimal.max*1.3):0,inv:false},
    {label:'EB%',va:norm(an.eb,spA.eb_baseline*0.5,spA.eb_optimal*1.1),vb:cAn?norm(cAn.eb,spB.eb_baseline*0.5,spB.eb_optimal*1.1):0,inv:false},
    {label:'Costo',va:1-norm(an.cost,0,3000),vb:cAn?1-norm(cAn.cost,0,3000):0,inv:false},
    {label:'pH',va:an.sp.ph_optimal?norm(an.avgPh,an.sp.ph_optimal.min,an.sp.ph_optimal.max):0.5,vb:cAn&&cAn.sp&&cAn.sp.ph_optimal?norm(cAn.avgPh,cAn.sp.ph_optimal.min,cAn.sp.ph_optimal.max):0.5,inv:false},
    {label:'Digest.',va:norm(an.avgDig,0,10),vb:cAn?norm(cAn.avgDig,0,10):0,inv:false},
  ];
  const N=axes.length;const cx=150,cy=150,r=100;
  const angle=(i)=>((i*2*Math.PI)/N)-Math.PI/2;
  const pt=(i,v)=>[cx+r*v*Math.cos(angle(i)),cy+r*v*Math.sin(angle(i))];
  const rings=[0.25,0.5,0.75,1];
  const polyA=axes.map((ax,i)=>pt(i,ax.va)).map(p=>p.join(',')).join(' ');
  const polyB=axes.map((ax,i)=>pt(i,ax.vb)).map(p=>p.join(',')).join(' ');
  const [fullscreen,setFullscreen]=React.useState(false);
  
  const RadarSVG=({size=260})=>(
    <svg viewBox="0 0 300 300" width={size} height={size} style={{overflow:'visible'}}>
      {rings.map(rv=>(
        <polygon key={rv} points={axes.map((_,i)=>pt(i,rv).join(',')).join(' ')}
          fill="none" stroke="var(--border-soft)" strokeWidth={rv===1?1.5:0.8} strokeDasharray={rv<1?'3,3':'none'}/>
      ))}
      {axes.map((_,i)=>(
        <line key={i} x1={cx} y1={cy} x2={pt(i,1)[0]} y2={pt(i,1)[1]} stroke="var(--border-soft)" strokeWidth="0.8"/>
      ))}
      <polygon points={polyA} fill="rgba(184,97,77,0.15)" stroke="var(--coral-700)" strokeWidth="2" strokeLinejoin="round"/>
      {cAn&&<polygon points={polyB} fill="rgba(42,90,139,0.12)" stroke="var(--accent-blue-grey)" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3"/>}
      {axes.map((ax,i)=>{const p=pt(i,1.18);const ta=Math.cos(angle(i))>0.1?'start':Math.cos(angle(i))<-0.1?'end':'middle';return(
        <text key={i} x={p[0]} y={p[1]} textAnchor={ta} dominantBaseline="middle"
          fontFamily="var(--font-body)" fontSize="9" fill="var(--ink-500)" letterSpacing=".08em" textTransform="uppercase">
          {ax.label}
        </text>
      );})}
      {axes.map((ax,i)=>{const pa=pt(i,ax.va);return(
        <circle key={i} cx={pa[0]} cy={pa[1]} r="3.5" fill="var(--coral-700)"/>
      );})}
      {cAn&&axes.map((ax,i)=>{const pb=pt(i,ax.vb);return(
        <circle key={i} cx={pb[0]} cy={pb[1]} r="3" fill="none" stroke="var(--accent-blue-grey)" strokeWidth="2"/>
      );})}
      <circle cx={cx} cy={cy} r="3" fill="var(--border-soft)"/>
      <rect x="6" y="6" width="10" height="10" fill="rgba(184,97,77,0.3)" stroke="var(--coral-700)" strokeWidth="1.5"/>
      <text x="20" y="14" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-900)">Receta A</text>
      {cAn&&<><rect x="6" y="22" width="10" height="2" fill="none" stroke="var(--accent-blue-grey)" strokeWidth="2" strokeDasharray="4,2"/><text x="20" y="27" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-900)">Receta B</text></>}
    </svg>
  );
  
  if(fullscreen) return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:'var(--z-overlay)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:20}}>
      <button onClick={()=>setFullscreen(false)} aria-label="Cerrar vista de radar" style={{position:'absolute',top:20,right:20,fontSize:28,background:'none',border:'none',color:'var(--paper-0)',cursor:'pointer',minWidth:44,minHeight:44}}>✕</button>
      <RadarSVG size={600}/>
      <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-base)",color:'var(--paper-0)',textAlign:'center'}}>Presiona Esc o haz clic en ✕ para cerrar</div>
    </div>
  );
  
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'var(--space-5) 0 var(--space-4)',background:'var(--paper-200)',marginBottom:14}}>
      <RadarSVG size={260}/>
      <button onClick={()=>setFullscreen(true)} style={{marginTop:12,fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'var(--space-2) var(--space-3)',background:'var(--coral-500)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-sm)',cursor:'pointer',letterSpacing:'var(--tracking-label)'}}>⛶ Pantalla completa</button>
    </div>
  );
};

const NitrogenChart=({recipe})=>{
  if(!recipe||!recipe.length) return null;
  const items=recipe.map(r=>{
    const g=INGS.find(i=>i.id===r.id);
    if(!g||!g.cn||!g.n) return null;
    const contrib=g.n*(parseFloat(r.p)||0)/100;
    return contrib>0?{name:g.name,contrib}:null;
  }).filter(Boolean).sort((a,b)=>b.contrib-a.contrib);
  const total=items.reduce((s,i)=>s+i.contrib,0);
  if(!total||items.length===0) return null;
  const PAL=['var(--coral-700)','var(--accent-olive)','var(--ochre-600)','var(--accent-blue-grey)','var(--accent-terracotta)','var(--moss-700)','var(--ochre-500)','var(--slate-600,var(--accent-blue-grey))','var(--coral-700)','var(--moss-500)'];
  return(
    <div style={{marginBottom:20,background:'var(--paper-100)',border:'1px solid var(--border-soft)',padding:'14px 16px'}}>
      <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:10}}>Contribución de Nitrógeno por ingrediente</div>
      <div style={{height:18,display:'flex',borderRadius:2,overflow:'hidden',marginBottom:11,border:'1px solid rgba(0,0,0,.07)'}}>
        {items.map((it,i)=>(
          <div key={i} title={`${it.name}: ${((it.contrib/total)*100).toFixed(1)}% del N total`}
            style={{width:`${(it.contrib/total)*100}%`,background:PAL[i%PAL.length],transition:'width .35s',minWidth:it.contrib/total>0.01?2:0}}/>
        ))}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'5px 16px'}}>
        {items.map((it,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:9,height:9,background:PAL[i%PAL.length],flexShrink:0,border:'1px solid rgba(0,0,0,.1)'}}/>
            <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-700)',fontWeight:500}}>
              {it.name.length>22?it.name.slice(0,22)+'…':it.name}&nbsp;<strong style={{color:'var(--ink-900)'}}>{((it.contrib/total)*100).toFixed(1)}%</strong>
            </span>
          </div>
        ))}
      </div>
      <div style={{marginTop:9,fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--ink-600)',borderTop:'1px solid var(--paper-300)',paddingTop:7}}>
        N absoluto en sustrato: {total.toFixed(3)} g/100g (masa seca)
      </div>
    </div>
  );
};

// ── v3: FlushChart — projected yield per flush ──
const FlushChart=({an})=>{
  if(!an||!an.eb||an.eb<10) return null;
  const eb=an.eb;
  const ebLow=an.ebLow??Math.round(eb*0.82);
  const ebHigh=an.ebHigh??Math.round(eb*1.18);
  const flushes=[
    {label:'1ª',sub:'Cosecha',pct:0.55,days:'35–45 d',color:'var(--coral-500)',bg:'rgba(184,97,77,.08)'},
    {label:'2ª',sub:'Cosecha',pct:0.30,days:'55–70 d',color:'var(--accent-olive)',bg:'rgba(77,98,53,.07)'},
    {label:'3ª',sub:'Cosecha',pct:0.15,days:'75–95 d',color:'var(--ochre-500,#A07828)',bg:'rgba(160,120,40,.07)'},
  ];
  const maxPct=flushes[0].pct;
  return(
    <div style={{marginBottom:16,background:'var(--paper-50,var(--paper-100))',border:'1px solid var(--border-soft)',overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'10px 14px 8px',borderBottom:'1px solid var(--border-soft)',display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
        <span style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-400)',fontWeight:600}}>Proyección de cosechas</span>
        <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-600)',fontWeight:700}}>EB {ebLow}–{ebHigh}%</span>
      </div>
      {/* Flush columns */}
      <div style={{display:'flex',gap:0}}>
        {flushes.map((f,i)=>{
          const val=(eb*f.pct);
          const barH=Math.round((f.pct/maxPct)*72);
          return(
            <div key={i} style={{flex:1,borderRight:i<2?'1px solid var(--border-soft)':'none',padding:'12px 12px 10px',background:f.bg,position:'relative',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:4}}>
              {/* ordinal label */}
              <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:f.color,fontWeight:700,opacity:.85}}>{f.label} {f.sub}</div>
              {/* big number */}
              <div style={{fontFamily:'var(--font-mono)',fontSize:28,fontWeight:700,lineHeight:1,color:f.color,letterSpacing:'var(--tracking-tight)'}}>{val.toFixed(0)}<span style={{fontSize:"var(--text-base)",fontWeight:400,opacity:.7}}>%</span></div>
              {/* kg/kg */}
              <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',letterSpacing:'var(--tracking-label)'}}>{(val/100).toFixed(2)} kg/kg</div>
              {/* bar visual */}
              <div style={{width:'100%',marginTop:6,height:4,background:'rgba(0,0,0,.07)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(f.pct/maxPct)*100}%`,background:f.color,borderRadius:2,transition:'width .6s cubic-bezier(.4,0,.2,1)'}}/>
              </div>
              {/* days */}
              <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-400)',marginTop:1}}>{f.days}</div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div style={{padding:'6px 14px',borderTop:'1px solid var(--border-soft)',fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-400)',background:'var(--paper-100)'}}>
        Distribución 55/30/15% · ±{Math.round((ebHigh-ebLow)/2/eb*100)}% incertidumbre · por kg sustrato seco
      </div>
    </div>
  );
};

// ── v3: CompositionChart — stacked bar by role ──
const CompositionChart=({recipe})=>{
  if(!recipe||!recipe.length) return null;
  const ROLE_LABELS={base_carbono:'Base C',suplemento_n:'Supl. N',suplemento_medio:'Supl. Medio',aireador:'Aireador',aditivo_ph:'pH',aditivo_estructura:'Estructura',aditivo_micronutriente:'Micronut.',aditivo_arrancador:'Arrancador'};
  const ROLE_COLORS={base_carbono:'#5A7042',suplemento_n:'#C68F2C',suplemento_medio:'#D4A838',aireador:'#4E7A6A',aditivo_ph:'#8B5C28',aditivo_estructura:'#7A6B58',aditivo_micronutriente:'#2A6A7A',aditivo_arrancador:'#9B4F3A'};
  const groups={};
  recipe.forEach(r=>{
    const g=INGS.find(i=>i.id===r.id);
    if(!g) return;
    const role=g.role||'base_carbono';
    groups[role]=(groups[role]||0)+(parseFloat(r.p)||0);
  });
  const total=Object.values(groups).reduce((s,v)=>s+v,0);
  if(!total) return null;
  const entries=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  return(
    <div style={{marginBottom:16,padding:'14px 16px',background:'var(--paper-100)',border:'1px solid var(--border-soft)'}}>
      <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:10}}>Composición por función</div>
      <div style={{height:18,display:'flex',borderRadius:2,overflow:'hidden',border:'1px solid rgba(0,0,0,.07)',marginBottom:10}}>
        {entries.map(([role,val],i)=>(
          <div key={i} title={`${ROLE_LABELS[role]||role}: ${val.toFixed(1)}%`}
            style={{width:`${(val/total)*100}%`,background:ROLE_COLORS[role]||'var(--ink-2)',transition:'width .4s'}}/>
        ))}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'4px 14px'}}>
        {entries.map(([role,val],i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:9,height:9,background:ROLE_COLORS[role]||'var(--ink-2)',flexShrink:0,border:'1px solid rgba(0,0,0,.1)'}}/>
            <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-700)',fontWeight:500}}>
              {ROLE_LABELS[role]||role}&nbsp;<strong style={{color:'var(--ink-900)'}}>{val.toFixed(1)}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── SPECIES GUIDE — guía de especie al inicio del constructor ──
const SpeciesGuide=({sKey,sp,recipe,onAddIngredient,onRemoveIngredient})=>{
  const [open,setOpen]=useState(false);
  const [showCompat,setShowCompat]=useState(false);
  if(!sp||!sKey) return null;
  const guia=SPP_SUBSTRATE_GUIDE[sKey]||[];
  const diff=SPP_DIFFICULTY[sKey]||'Media';
  const band=BANDS[sKey]||'var(--ink-700)';
  const recipeIds=new Set((recipe||[]).map(r=>r.id));
  const num=String(Object.keys(SPP).indexOf(sKey)+1).padStart(2,'0');
  const code=SPP_CODE[sKey]||'—';
  const family=SPP_FAMILY[sKey]||'';
  const img=IMG[sKey];

  const recIng=INGS.filter(i=>i.cs&&i.cs.includes(sKey)&&i.cn>0);
  const bycat={};
  recIng.forEach(i=>{
    const roleKey=['aditivo_ph','aditivo_estructura','aditivo_micronutriente','aditivo_arrancador'].includes(i.role)?'aditivo_correctores':i.role;
    if(!bycat[roleKey])bycat[roleKey]=[];
    bycat[roleKey].push(i);
  });
  const catOrder=['base_carbono','suplemento_n','suplemento_medio','aireador','aditivo_correctores'];
  const catLabels2={base_carbono:'Carbono',suplemento_n:'N alto',suplemento_medio:'N medio',aireador:'Aireación',aditivo_correctores:'Correctores'};
  const catEntries=catOrder.filter(k=>bycat[k]).map(k=>[k,bycat[k]]);

  if(!open) return(
    <div style={{position:'sticky',top:54,zIndex:'var(--z-sticky-panel)',marginBottom:12,borderRadius:5,border:`1px solid color-mix(in oklab,${band} 30%,rgba(26,20,16,0.11))`,background:`color-mix(in oklab,${band} 5%,var(--paper-50))`,boxShadow:'0 1px 4px rgba(26,20,16,0.07)',cursor:'pointer',display:'flex',alignItems:'center',gap:10,padding:'8px 14px'}} onClick={()=>setOpen(true)} title="Ver guía de especie">
      <div style={{width:20,height:4,borderRadius:2,background:band,flexShrink:0}}/>
      <span style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
        <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>Guía de especie</span>
        <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:band,opacity:.8}}>ver ▼</span>
      </span>
      <span style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:"var(--text-md)",color:`color-mix(in oklab,${band} 85%,var(--ink-900))`}}>{sp.name}</span>
    </div>
  );

  return(
    <div style={{position:'sticky',top:54,zIndex:'var(--z-sticky-panel)',marginBottom:12,borderRadius:5,border:'1px solid rgba(26,20,16,0.11)',boxShadow:'0 1px 6px rgba(26,20,16,0.08)',background:'var(--paper-50)',overflow:'hidden'}}>
      {/* Franja lateral familia */}
      <div className="p-family-strip" style={{background:`color-mix(in oklab,${band} 10%,var(--paper-100))`,borderRight:`1px solid color-mix(in oklab,${band} 25%,transparent)`}}>
        <span style={{color:band}}>{family}</span>
      </div>
      <div style={{marginLeft:15}}>
        {/* Cabecera archival */}
        <div className="p-arch-head" style={{marginLeft:0,cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
          <div className="p-arch-left">
            <span className="p-arch-num" style={{color:band}}>{num}</span>
            <span className="p-arch-code">{code}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:band,opacity:.7}}>Guía de especie</span>
            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-400)'}}>▲</span>
          </div>
        </div>
        {/* Nombre + imagen — editorial full-bleed */}
        <div style={{position:'relative',borderBottom:'1px solid rgba(26,20,16,0.07)',overflow:'hidden',minHeight:img?140:70}}>
          {img&&<img src={img} alt={sp.name} width="320" height="240" style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',height:'160%',width:'auto',maxWidth:'55%',objectFit:'contain',objectPosition:'right center',filter:'saturate(.45) contrast(1.08)',mixBlendMode:'multiply',opacity:.55,pointerEvents:'none'}}/>}
          <div style={{padding:'14px 16px 16px',position:'relative',zIndex:'var(--z-local)',maxWidth:img?'60%':'100%'}}>
            <div style={{fontFamily:'var(--font-sci)',fontSize:"var(--text-sm)",fontStyle:'italic',color:'var(--ink-400)',marginBottom:3,letterSpacing:'var(--tracking-label)'}}>{sp.scientific}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:36,color:`color-mix(in oklab,${band} 90%,var(--ink-900))`,lineHeight:.9,letterSpacing:'var(--tracking-tight)',marginBottom:open?8:0}}>{sp.name}</div>
            {open&&sp.notes&&<div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-sm)",color:'var(--ink-600)',lineHeight:1.5,textWrap:'pretty',marginTop:5,maxWidth:300}}>{sp.notes}</div>}
          </div>
        </div>
        {open&&(
          <>
            {/* Chip-grid de parámetros */}
            <div className="p-chips" style={{marginLeft:0,paddingTop:0,borderTop:'none'}}>
              <div className="p-chips-row" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr',borderBottom:'1px solid rgba(26,20,16,0.1)'}}>
                <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">C:N</span><span className="p-chip-val">{sp.cn_optimal.min}–{sp.cn_optimal.max}</span></span></div>
                <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">N%</span><span className="p-chip-val">{sp.n_optimal.min}–{sp.n_optimal.max}</span></span></div>
                <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">pH</span><span className="p-chip-val">{sp.ph_optimal.min}–{sp.ph_optimal.max}</span></span></div>
                <div className="p-chip" style={{borderRight:'none'}}><span className="p-chip-txt"><span className="p-chip-lbl">Humedad</span><span className="p-chip-val">{sp.moisture.ideal}%</span></span></div>
              </div>
              <div className="p-chips-row" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
                <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">Temp.</span><span className="p-chip-val">{sp.temp_fruit}</span></span></div>
                <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">EB</span><span className="p-chip-val">{sp.eb_baseline}–{sp.eb_optimal}%</span></span></div>
                <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">Dificultad</span><span className="p-chip-val">{diff}</span></span></div>
                <div className="p-chip" style={{borderRight:'none'}}><span className="p-chip-txt"><span className="p-chip-lbl">Spawn</span><span className="p-chip-val">{sp.spawn_rate}%</span></span></div>
              </div>
            </div>
            {/* Criterios */}
            {guia.length>0&&(
              <div className="sguide-section">
                <div className="sguide-section-lbl">Criterios de formulación</div>
                <div className="sguide-hechos">
                  {guia.map((h,i)=>(
                    <div key={i} className="sguide-hecho">
                      <span className="sguide-hecho-n">{i+1}.</span>
                      <span className="sguide-hecho-txt">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── v3: SpeciesRecommender — ranks all species for current recipe ──
const SpeciesRecommender=({recipe})=>{
  if(!recipe||!recipe.length) return null;
  const scores=Object.entries(SPP).map(([key,sp])=>{
    const a=analyze(recipe,key);
    return{key,sp,score:a?scoreAn(a).score:0,eb:a?a.eb:0};
  }).sort((a,b)=>b.score-a.score);
  const maxScore=scores[0]?.score||1;
  const bandColors=Object.fromEntries(Object.entries(BANDS));
  return(
    <div style={{padding:'14px 16px',background:'var(--paper-100)',border:'1px solid var(--border-soft)',marginBottom:16}}>
      <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:10}}>Compatibilidad por especie</div>
      {scores.map(({key,sp,score,eb},i)=>{
        const col=bandColors[key]||'var(--ink-2)';
        return(
          <div key={key} className="spr-row">
            <div className="spr-rank">{i+1}</div>
            <div style={{width:10,height:10,background:col,borderRadius:'50%',flexShrink:0}}/>
            <div style={{flex:1,fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:'var(--ink-900)'}}>{sp.name}</div>
            <div className="spr-bar">
              <div className="spr-fill" style={{width:`${maxScore>0?(score/maxScore)*100:0}%`,background:col}}/>
            </div>
            <div className="spr-score" style={{color:i===0?col:'var(--ink-900)'}}>{score}</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--border-soft)',minWidth:48,textAlign:'right'}}>EB {eb.toFixed(0)}%</div>
          </div>
        );
      })}
    </div>
  );
};




// ── PERITO: componente estable a nivel módulo (no redefinido en cada render) ──
const PERITO_STATUS={
  excellent:{label:'Apta',veredicto:'Apta',accion:'Producir normalmente.',bg:'#EDF4E8',border:'#7FA05A',badge:'var(--accent-olive)',txt:'#3D4A38'},
  good:{label:'Apta con ajustes',veredicto:'Apta con ajustes',accion:'Aplicar las mejoras del Perito antes de escalar.',bg:'#F5F0E0',border:'#C8A840',badge:'#7A5A10',txt:'#5A4010'},
  needs_work:{label:'Experimental',veredicto:'Experimental',accion:'Máximo 3–5 bolsas de prueba. Registrar colonización al día 7, 14 y 21.',bg:'#FBF0E8',border:'#C87040',badge:'#8C4020',txt:'#6A3010'},
  critical:{label:'No ejecutar',veredicto:'No ejecutar — Riesgo alto',accion:'Corregir problemas críticos antes de cualquier producción.',bg:'#FBE8E8',border:'#C53030',badge:'#8B1A1A',txt:'#6A0000'},
  sin_receta:{label:'—',veredicto:'—',accion:'',bg:'var(--paper-50)',border:'var(--border-soft)',badge:'var(--ink-500)',txt:'var(--ink-500)'},
};
const peritoMainLimiter=(opt,an)=>{
  if(!opt||!an) return null;
  const first=opt.items.find(i=>i.priority==='critical')||opt.items.find(i=>i.priority==='warning');
  if(!first) return null;
  const MAP={'↓C:N':'C:N demasiado alto — exceso de carbono sin aprovechar','↑C:N':'C:N demasiado bajo — exceso de nitrógeno, riesgo contaminación','↑N':'Nitrógeno insuficiente — colonización lenta y EB reducida','↓N':'Exceso de nitrógeno — riesgo Trichoderma','⚠':'Carga sanitaria crítica — Trichoderma probable sin autoclave','↑pH':'pH demasiado ácido — enzimas del micelio trabajan a rendimiento parcial','↓pH':'pH demasiado alcalino — inhibe el crecimiento y favorece bacterias','↑EB':'Potencial de EB sin explotar','Ca':'Sin mineral estabilizador de pH','Dig':'Sustrato de baja digestibilidad — colonización lenta'};
  return MAP[first.icon]||first.label;
};
const peritoCorreccionMinima=(opt)=>{
  const first=opt&&opt.items.find(i=>i.priority==='critical'&&i.apply);
  if(!first) return null;
  return first.action.replace(/<[^>]+>/g,'');
};
const PeritoItem=React.memo(({item,onApply,baseScore})=>{
  const hasPrediction=item.predictedScore!=null&&baseScore!=null;
  const scoreDelta=hasPrediction?Math.round(item.predictedScore-baseScore):null;
  return(
  <div className={`perito-item pi-${item.priority}`}>
    <div className="pi-icon-col">
      <span className="pi-icon">{item.icon}</span>
    </div>
    <div className="pi-body">
      <div className="pi-head">
        <span className="pi-label">{item.label}</span>
        {item.capped&&<span style={{fontSize:"var(--text-2xs)",fontWeight:700,color:'#8C4020',background:'rgba(200,112,64,.12)',border:'1px solid rgba(200,112,64,.3)',borderRadius:3,padding:'1px 6px'}}>tope alcanzado</span>}
        {item.notInStock&&<span style={{fontSize:"var(--text-2xs)",fontWeight:700,color:'#7A5A10',background:'rgba(160,120,40,.12)',border:'1px solid rgba(160,120,40,.3)',borderRadius:3,padding:'1px 6px'}}>🛒 no en bodega — a comprar</span>}
        {item.delta&&<span className="pi-delta">{item.delta}</span>}
      </div>
      {item.repeatedApply&&<div style={{fontSize:"var(--text-sm)",color:'#7A5A10',fontFamily:'var(--font-mono)',marginBottom:2}}>↻ Ya aplicaste esto {item.repeatedApply}x en esta sesión y el problema sigue — considera un ingrediente distinto o cambia a "Todo el catálogo".</div>}
      <div className="pi-action" dangerouslySetInnerHTML={{__html:item.action}}/>
      <div className="pi-effect">{item.effect}</div>
      {item.why&&<div style={{fontSize:"var(--text-sm)",color:'var(--ink-600)',fontFamily:'var(--font-mono)',marginTop:3,opacity:.85}}><span style={{fontWeight:700}}>Por qué:</span> {item.why}</div>}
      {item.riskIfIgnored&&<div style={{fontSize:"var(--text-sm)",color:'var(--coral-600,#B5451F)',fontFamily:'var(--font-mono)',marginTop:2}}><span style={{fontWeight:700}}>Riesgo:</span> {item.riskIfIgnored}</div>}
      {hasPrediction&&<div style={{fontSize:"var(--text-sm)",color:scoreDelta>0?'var(--accent-olive)':'var(--ink-600)',fontFamily:'var(--font-mono)',marginTop:2,fontWeight:700}}>Score si se aplica: {Math.round(item.predictedScore)}/100 ({scoreDelta>=0?'+':''}{scoreDelta})</div>}
      {item.sideEffect&&<div style={{fontSize:"var(--text-sm)",color:'var(--coral-600,#B5451F)',fontFamily:'var(--font-mono)',marginTop:2,fontWeight:700}}>⚠ {item.sideEffect}</div>}
      {item.comboApply&&<div style={{marginTop:4,padding:'6px 8px',background:'rgba(74,107,74,.08)',border:'1px solid rgba(74,107,74,.2)',borderRadius:4}}>
        <div style={{fontSize:"var(--text-sm)",color:'var(--accent-olive)',fontFamily:'var(--font-mono)',fontWeight:700}}>{item.comboLabel}</div>
        <div style={{fontSize:"var(--text-sm)",color:'var(--accent-olive)',fontFamily:'var(--font-mono)'}}>Score si se aplica junto: {Math.round(item.comboPredictedScore)}/100</div>
        <button onClick={()=>onApply(item.comboApply,item.icon)} className="pi-apply" style={{marginTop:4}}>Aplicar corrección combinada</button>
      </div>}
    </div>
    <div className="pi-actions">
      {item.apply
        ?<button onClick={()=>onApply(item.apply,item.icon)} className="pi-apply">Aplicar</button>
        :<div className="pi-spacer"/>}
    </div>
  </div>
  );
});

// ── Modales genéricos: reemplazan window.confirm/prompt/alert en el flujo de recetas ──
const ConfirmModal=({dlg,onClose})=>(
  <div className="inv-modal-bg" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="inv-modal" role="dialog" aria-modal="true" aria-label={dlg.title||'Confirmar'} style={{width:420}}>
      <div className="inv-modal-title">{dlg.title||'Confirmar'}</div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-700)',marginBottom:18,lineHeight:1.5}}>{dlg.msg}</div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button onClick={onClose} className="inv-btn inv-btn-sec">Cancelar</button>
        <button onClick={()=>{dlg.onConfirm();onClose();}} className={`inv-btn ${dlg.danger?'inv-btn-danger':'inv-btn-pri'}`}>{dlg.confirmLabel||'Confirmar'}</button>
      </div>
    </div>
  </div>
);
const PromptModal=({dlg,onClose})=>{
  const[val,setVal]=React.useState(dlg.defaultValue||'');
  const submit=()=>{if(!val.trim())return;dlg.onSubmit(val.trim());onClose();};
  return(
    <div className="inv-modal-bg" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="inv-modal" role="dialog" aria-modal="true" aria-label={dlg.title||'Nombre'} style={{width:420}}>
        <div className="inv-modal-title">{dlg.title||'Nombre'}</div>
        {dlg.label&&<label className="inv-label" htmlFor="setas-prompt-input">{dlg.label}</label>}
        <input id="setas-prompt-input" name="promptValue" className="inv-input" value={val} placeholder={dlg.placeholder||''} autoComplete="off" onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} style={{marginBottom:18}}/>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onClose} className="inv-btn inv-btn-sec">Cancelar</button>
          <button onClick={submit} disabled={!val.trim()} className="inv-btn inv-btn-pri">{dlg.confirmLabel||'Guardar'}</button>
        </div>
      </div>
    </div>
  );
};
const NoticeModal=({dlg,onClose})=>(
  <div className="inv-modal-bg" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="inv-modal" role="dialog" aria-modal="true" aria-label={dlg.title||'Aviso'} style={{width:420}}>
      <div className="inv-modal-title">{dlg.title||'Aviso'}</div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-700)',marginBottom:18,lineHeight:1.5}}>{dlg.msg}</div>
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button onClick={onClose} className="inv-btn inv-btn-pri">Aceptar</button>
      </div>
    </div>
  </div>
);

// ── NOVEL SIGNATURE VISUAL — inked "barómetro" of biological efficiency ──
// ── COLOR MAP for ingredient category badges ──
const CAT_COLORS={
  base:'#5A7042',       // moss (base carbons)
  sup:'#C68F2C',        // ochre (supplements)
  est:'#8C6B4A',        // bark (manure)
  cafe:'#4A3728',       // dark brown (coffee)
  trop:'#B8694B',       // warm brown (tropical)
  circ:'#6B7C5F',       // sage (circular)
  local:'#7A5A3F',      // tan (local),
  default:'#999'
};

// ── MICRO SVG ICONS (sin emojis) ──────────────────────────────
const IcoBlock=()=>(<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent-terracotta)" strokeWidth="2" strokeLinecap="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:4,flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>);
const IcoWarn=()=>(<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--status-attention)" strokeWidth="2" strokeLinecap="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:4,flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const IcoBox=({color='currentColor',size=13})=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const parseIngName=(name)=>{const hasBlock=name.includes('⛔');const hasWarn=name.includes('⚠️')||name.includes('⚠');const clean=name.replace(/⛔\s*/g,'').replace(/⚠️\s*/g,'').replace(/⚠\s*/g,'').trim();return{hasBlock,hasWarn,clean};};

// ── INGREDIENT ITEM with expandable profile ──
const IngredientItem=({ing,onAdd,stockKg=0})=>{
  const [expanded,setExpanded]=React.useState(false);
  const cat=CAT_COLORS[ing.cat]||CAT_COLORS.default;
  const costStr=ing.cost===0?'Gratis':`$${ing.cost}`;
  // Normalize scales for visual bars (0–1)
  const cnPct=Math.min(100,Math.max(0,(ing.cn/600)*100))/100; // 0–600 → 0–1
  const nPct=Math.min(100,ing.n*15)/100;                     // 0–7% → 0–1
  const craPct=ing.cra/5;                                     // 0–5 → 0–1
  const digPct=ing.dig/10;                                    // 0–10 → 0–1
  return (
    <div className={'ing-item '+(expanded?'expanded':'')} onClick={()=>setExpanded(!expanded)}>
      <div className="ing-badge" style={{background:cat}} title={ing.cat}>{ing.cat.substring(0,2).toUpperCase()}</div>
      <div className="ing-info">
        <div className="ing-name">{(()=>{const{hasBlock,hasWarn,clean}=parseIngName(ing.name);return(<>{stockKg>0&&<span className="ing-stock-dot" style={{background:stockKg>5?'var(--accent-olive)':'var(--ochre-500,#A07828)'}}></span>}{hasBlock&&<IcoBlock/>}{hasWarn&&<IcoWarn/>}{clean}</>);})()}</div>
        <div className="ing-meta">
          <span>C:N {ing.cn}</span>
          <span>N {ing.n.toFixed(1)}%</span>
          <span>{costStr}</span>
          {stockKg>0&&<span className="ing-stock-kg">{stockKg.toFixed(1)} kg</span>}
        </div>
        {expanded&&(
          <div className="ing-profile">
            <div className="ing-profile-row">
              <span className="k">Carbono</span>
              <div className="ing-profile-bar"><div className="ing-profile-bar-fill" style={{width:(ing.c/50)*100+'%',background:'#5A7042'}}></div></div>
              <span className="v">{ing.c}<span className="unit">%</span></span>
            </div>
            <div className="ing-profile-row">
              <span className="k">Humedad</span>
              <div className="ing-profile-bar"><div className="ing-profile-bar-fill" style={{width:Math.min(100,ing.moisture)+'%',background:'var(--accent-blue-grey)'}}></div></div>
              <span className="v">{ing.moisture}<span className="unit">%</span></span>
            </div>
            <div className="ing-profile-row">
              <span className="k">Ret. agua</span>
              <div className="ing-profile-bar"><div className="ing-profile-bar-fill" style={{width:(ing.cra/5)*100+'%',background:'var(--accent-blue-grey)'}}></div></div>
              <span className="v">{ing.cra}<span className="unit">/5</span></span>
            </div>
            <div className="ing-profile-row">
              <span className="k">pH</span>
              <div className="ing-profile-bar"><div className="ing-profile-bar-fill" style={{width:((ing.ph-4)/3)*100+'%',background:'#C68F2C'}}></div></div>
              <span className="v">{ing.ph}</span>
            </div>
            <div className="ing-profile-row">
              <span className="k">Dig.</span>
              <div className="ing-profile-bar"><div className="ing-profile-bar-fill" style={{width:(ing.dig/10)*100+'%',background:'#B6532A'}}></div></div>
              <span className="v">{ing.dig}<span className="unit">/10</span></span>
            </div>
            <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--paper-300)'}}>
              <button className="add-btn" onClick={e=>{e.stopPropagation();onAdd(ing);}}>Agregar a receta</button>
            </div>
          </div>

        )}
      </div>
    </div>
  );
};

const EBDial=({an,sp})=>{
  if(!an||!sp||!an.cn) return null;
  const eb=Math.max(0,an.eb||0);
  const base=sp.eb_baseline, opt=sp.eb_optimal;
  const maxV=Math.max(160, Math.ceil((opt*1.2)/10)*10);
  const cx=130, cy=112, R=90;
  const rad=d=>d*Math.PI/180;
  const ang=v=>135+(Math.min(Math.max(v,0),maxV)/maxV)*270;
  const pt=(v,r)=>[cx+r*Math.cos(rad(ang(v))), cy+r*Math.sin(rad(ang(v)))];
  const arc=(v0,v1,r)=>{const[x0,y0]=pt(v0,r);const[x1,y1]=pt(v1,r);const large=(ang(v1)-ang(v0))>180?1:0;return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;};
  const status=eb<base?'low':eb<=opt?'good':'high';
  const needleCol=status==='low'?'var(--coral-500)':status==='high'?'#3D4A38':'var(--accent-olive)';
  const stLabel=status==='low'?'Por debajo del rango':status==='high'?'Excelente — sobre el óptimo':'Dentro del rango óptimo';
  const [nx,ny]=pt(eb,R-8);
  const ticks=[0,0.25,0.5,0.75,1].map(f=>Math.round((f*maxV)/5)*5);
  return (
    <div className="ebdial">
      <svg viewBox="0 0 260 200" width="100%" style={{maxWidth:288}}>
        <path d={arc(0,maxV,R)} fill="none" stroke="var(--paper-300)" strokeWidth="10" strokeLinecap="round"/>
        <path d={arc(base,opt,R)} fill="none" stroke="#9FB07F" strokeWidth="10" strokeLinecap="round"/>
        <path d={arc(0,maxV,R+9)} fill="none" stroke="var(--ink-900)" strokeWidth="1"/>
        <path d={arc(0,maxV,R-9)} fill="none" stroke="var(--ink-900)" strokeWidth="0.7" opacity="0.45"/>
        {ticks.map((tv,i)=>{const[a0,b0]=pt(tv,R-9);const[a1,b1]=pt(tv,R+9);const[lx,ly]=pt(tv,R+24);return (
          <g key={i}>
            <line x1={a0} y1={b0} x2={a1} y2={b1} stroke="var(--ink-700)" strokeWidth="1.2"/>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-500)">{tv}</text>
          </g>
        );})}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={needleCol} strokeWidth="3" strokeLinecap="round" style={{transition:'transform .5s cubic-bezier(0.32,0.72,0.36,1)'}}/>
        <circle cx={cx} cy={cy} r="7" fill="var(--paper-50)" stroke="var(--ink-900)" strokeWidth="1.6"/>
        <circle cx={cx} cy={cy} r="2.4" fill="var(--ink-900)"/>
        <text x={cx} y={cy+36} textAnchor="middle" fontFamily="var(--font-num)" fontSize="32" fill="#9C3F1F">{an.ebLow}–{an.ebHigh}</text>
        <text x={cx} y={cy+52} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-400)">% RANGO ESPERADO</text>
        <text x={cx} y={cy+66} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-300)">central {eb.toFixed(0)}% · índice {an.ebIndex}/100</text>
      </svg>
      <div className="ebdial-note">{stLabel} · franja óptima {base}–{opt}%</div>
    </div>
  );
};



// ── BAND GAUGES ──────────────────────────────────────────────────────────────────────────
const BandGauge=({label,unit,min,max,ideal,value,reference,scaleMin,scaleMax,color='var(--accent-olive)',warnColor='#A8432A'})=>{
  const sMin=scaleMin??min*0.5;
  const sMax=scaleMax??max*1.5;
  const range=sMax-sMin;
  const toPos=v=>Math.max(0,Math.min(100,((v-sMin)/range)*100));
  const bandLeft=toPos(min);
  const bandW=toPos(max)-bandLeft;
  const idealPos=toPos(ideal);
  const valPos=value!=null?toPos(value):null;
  const inRange=value!=null&&value>=min&&value<=max;
  const cursorCol=inRange?color:warnColor;
  const fmtVal=v=>typeof v==='number'?(v<10?v.toFixed(2):v.toFixed(1)):'—';
  return (
    <div className="bg-row">
      <div className="bg-header">
        <span className="bg-label">{label}</span>
        <span className="bg-val" style={{color:cursorCol}}>{fmtVal(value)}{unit}</span>
      </div>
      <div className="bg-track">
        <div className="bg-band" style={{left:`${bandLeft}%`,width:`${bandW}%`,background:`${color}28`}}/>
        <div className="bg-ideal" style={{left:`${idealPos}%`,background:`${color}66`}}/>
        {reference!=null&&<div style={{position:'absolute',left:`${toPos(reference)}%`,top:0,bottom:0,width:'1.5px',background:'rgba(191,169,139,0.7)',borderLeft:'1.5px dashed rgba(191,169,139,0.8)',pointerEvents:'none'}} title={`Referencia óptima: ${reference}${unit}`}/>}
        {valPos!=null&&<div className="bg-cursor" style={{left:`${valPos}%`,background:cursorCol,boxShadow:`0 0 0 1.5px ${cursorCol}`}}/>}
      </div>
      <div className="bg-foot">
        <span>{min}{unit}</span>
        <span style={{color:`${color}99`}}>ideal {ideal}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

// Mezcla el EB teórico de an.eb con el EB real promedio de lotes históricos
// de la misma especie (historicalEBFor), ponderado por cuántos lotes reales
// hay (historical.weight, hasta 70%). Antes esta fórmula solo vivía inline
// en RecipeGauges y solo pintaba el gauge — el score del Perito (scoreAn)
// seguía usando an.eb puro, ignorando por completo los lotes reales que el
// usuario ya tenía registrados. Se extrajo aquí para reusarla también como
// override de scoreYield (ver ctx.blendedEB en scoring.js).
const blendEBWithHistory=(an,historical)=>{
  const hasHist=historical&&historical.n>0&&historical.avg!=null;
  return hasHist?(an.eb*(1-historical.weight)+historical.avg*historical.weight):an.eb;
};

// ── Minimalist SVG Icons (Design System compliant) ──
const IconTarget = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7" />
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
  </svg>
);
const IconBolt = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="9 1 2 9 8 9 7 15 14 7 8 7 9 1" fill="currentColor" stroke="none" />
  </svg>
);
const IconRecipe = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M3 2h8l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    <path d="M11 2v4h4" />
    <path d="M5 8h6M5 11h4" />
  </svg>
);
const IconDisk = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M3 2h8l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    <rect x="5" y="9" width="6" height="5" />
    <rect x="5" y="2" width="5" height="3" />
  </svg>
);
const IconCheck = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="3 8.5 6.5 12 13 4" />
  </svg>
);
const IconAlert = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 2L1 14h14L8 2z" />
    <line x1="8" y1="6" x2="8" y2="10" />
    <circle cx="8" cy="12" r="0.5" fill={color} stroke="none" />
  </svg>
);
const IconLock = ({ size = 10, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="7" width="10" height="8" rx="1.5" />
    <path d="M5 7V4.5a3 3 0 0 1 6 0V7" />
  </svg>
);
const IconSprout = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2 14c2-4 5-6 10-6" />
    <path d="M12 8c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z" />
    <path d="M9 8c0-2-1.5-3.5-3.5-3.5 0 2 1.5 3.5 3.5 3.5z" />
  </svg>
);
const IconBox = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2 4.5L8 1.5l6 3v7l-6 3-6-3v-7z" />
    <path d="M2 4.5L8 7.5l6-3M8 7.5v7" />
  </svg>
);
const IconFlame = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 1c.5 2.5 3 4 3 7a5 5 0 0 1-10 0c0-3 2.5-4.5 3-7 1 2 2 3 4 0z" />
  </svg>
);
const IconChevronDown = ({ size = 10, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="4 6 8 10 12 6" />
  </svg>
);
const IconChevronUp = ({ size = 10, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="4 10 8 6 12 10" />
  </svg>
);
const IconClose = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="3" y1="3" x2="13" y2="13" />
    <line x1="13" y1="3" x2="3" y2="13" />
  </svg>
);
const IconMountain = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M1 14L6 4l4 8 2-4 3 6H1z" />
  </svg>
);
const IconDroplet = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 1.5C8 1.5 3 7 3 10.5a5 5 0 0 0 10 0C13 7 8 1.5 8 1.5z" />
  </svg>
);
const IconClipboard = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M10 2H6a1 1 0 0 0-1 1v1h6V3a1 1 0 0 0-1-1z" />
    <path d="M5 4H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="11" x2="9" y2="11" />
  </svg>
);
const IconMushroom = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 2a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />
    <path d="M6 8v5a2 2 0 0 0 4 0V8" />
  </svg>
);
const IconMicroscope = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M6 1h4M8 1v4M5 5h6v3H5zM8 8v3M4 14h8M4 11h8" />
    <path d="M12 8a4 4 0 0 1-4 4" />
  </svg>
);
const IconBook = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2 3h5a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2H2V3z" />
    <path d="M14 3H9a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h5V3z" />
  </svg>
);
const IconFactory = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M1 14h14V7l-4 3V7L7 10V2L1 5v9z" />
  </svg>
);
const IconSeed = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M3 13c1-4 4-7 10-10 0 6-3 9-10 10z" />
    <path d="M3 13l5-5" />
  </svg>
);
const IconNut = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 1.5c-2.5 1.5-4 4-4 7 0 2.7 1.8 5.5 4 6 2.2-.5 4-3.3 4-6 0-3-1.5-5.5-4-7z" />
    <path d="M8 6.2v8.3" />
  </svg>
);
const IconScale = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="8" y1="1" x2="8" y2="14" />
    <line x1="2" y1="4" x2="14" y2="4" />
    <path d="M2 4l2 5h-4l2-5zM14 4l2 5h-4l2-5zM5 14h6" />
  </svg>
);
const IconWind = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2 5h9a2 2 0 1 0-2-2" />
    <path d="M1 9h12a2 2 0 1 0-2-2" />
    <path d="M3 13h6a2 2 0 1 0-2-2" />
  </svg>
);
const IconSnowflake = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="8" y1="1" x2="8" y2="15" />
    <line x1="1" y1="8" x2="15" y2="8" />
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);
const IconEdit = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M11 2l3 3-8 8H3v-3l8-8z" />
  </svg>
);
const IconCamera = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M1 5a1 1 0 0 1 1-1h2.5l1.5-2h4l1.5 2H14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5z" />
    <circle cx="8" cy="9" r="3" />
  </svg>
);
const IconMail = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="2" y="3" width="12" height="10" rx="1.5" />
    <path d="M2 4l6 5 6-5" />
  </svg>
);
const IconSparkles = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" />
  </svg>
);
const IconStar = ({ size = 12, color = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={fill} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="8 1.5 10 6 15 6.5 11.5 10 12.5 15 8 12.5 3.5 15 4.5 10 1 6.5 6 6 8 1.5" />
  </svg>
);
const IconCart = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="6" cy="13" r="1.5" />
    <circle cx="13" cy="13" r="1.5" />
    <path d="M1 2h2.5l1.6 7h8.5l1.4-5H4" />
  </svg>
);
const IconRotate = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M1.5 2.5v4h4" />
    <path d="M2.5 10a6 6 0 1 0 1.2-6.5L1.5 6.5" />
  </svg>
);
const IconPause = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3.5" y="3" width="3" height="10" rx="0.5" />
    <rect x="9.5" y="3" width="3" height="10" rx="0.5" />
  </svg>
);

const RecipeGauges=({an,sp,optimalAn,historical})=>{
  if(!sp||!an||!an.cn) return null;
  const hasHist=historical&&historical.n>0&&historical.avg!=null;
  const blendedEB=blendEBWithHistory(an,historical);
  return (
    <div className="bg-wrap">
      <div className="bg-eyebrow">Parámetros de sustrato</div>
      <BandGauge label="C:N" unit=":1"
        min={sp.cn_optimal.min} max={sp.cn_optimal.max} ideal={sp.cn_optimal.ideal}
        value={an.cn} scaleMin={10} scaleMax={90}
        color="var(--accent-olive)" warnColor="#A8432A"/>
      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',marginTop:-6,marginBottom:8,paddingLeft:2,fontWeight:500}}>Calculado en base seca · corrige H₂O por insumo</div>
      <BandGauge label="N" unit="%"
        min={sp.n_optimal.min} max={sp.n_optimal.max} ideal={sp.n_optimal.ideal}
        value={an.avgN} scaleMin={0} scaleMax={3.5}
        color="var(--accent-blue-grey)" warnColor="#A8432A"/>
      <BandGauge label="EB estimado" unit="%"
        min={sp.eb_baseline} max={sp.eb_optimal} ideal={sp.eb_optimal}
        value={an?Math.round(blendedEB):null}
        reference={optimalAn?Math.round(optimalAn.eb):null}
        scaleMin={0} scaleMax={Math.max(200,Math.ceil(sp.eb_optimal*1.4/10)*10)}
        color="#A8432A" warnColor="var(--accent-terracotta)"/>
      {an&&<div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',marginTop:-6,marginBottom:8,paddingLeft:2,fontWeight:500}}>Rango {an.ebLow}–{an.ebHigh}% · índice {an.ebIndex}/100 · la aguja es el valor central</div>}
      <div style={{marginTop:2,padding:'8px 10px',borderRadius:6,background:hasHist?'rgba(122,142,96,0.12)':'rgba(0,0,0,0.04)',border:'1px solid '+(hasHist?'var(--accent-olive)':'var(--border-soft, #ddd)')}}>
        {hasHist?(
          <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-800,#333)',lineHeight:1.5}}>
            <b>Proyección ajustada con {historical.n} lote{historical.n>1?'s':''} real{historical.n>1?'es':''}{historical.matched?' con receta similar':''}</b> · EB histórica {historical.avg.toFixed(0)}% ({historical.subs.join(', ')}) · mezcla {Math.round(historical.weight*100)}% histórico / {Math.round((1-historical.weight)*100)}% fórmula
          </div>
        ):(
          <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700,#666)',lineHeight:1.5}}>
            Estimación teórica — sin lotes previos de {sp.name} en el registro para proyectar EB real.
          </div>
        )}
      </div>
    </div>
  );
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
const stockActual=(ingredienteId,lotes)=>
  lotes.filter(l=>l.activo&&l.ingredienteId===ingredienteId)
       .reduce((s,l)=>s+(l.cantidadKgDisponible||0),0);

const precioPonderado=(ingredienteId,lotes)=>{
  const active=lotes.filter(l=>l.activo&&l.ingredienteId===ingredienteId&&l.cantidadKgDisponible>0);
  const totalKg=active.reduce((s,l)=>s+l.cantidadKgDisponible,0);
  if(!totalKg) return null;
  return active.reduce((s,l)=>s+l.precioPorKgCOP*l.cantidadKgDisponible,0)/totalKg;
};

// Descuenta inventario FIFO — misma lógica que SetasInventario.consumirInventarioFIFO
// en inventario.js (ver el comentario de arriba sobre por qué está duplicada).
const consumirInventarioFIFOLocal=(lotes,rows)=>{
  let updated=[...lotes];
  for(const row of rows){
    let remaining=row.krKg;
    const lotesIng=updated.filter(l=>l.activo&&l.ingredienteId===row.id).sort((a,b)=>new Date(a.fechaIngreso)-new Date(b.fechaIngreso));
    for(const lote of lotesIng){
      if(remaining<=0.001) break;
      const consume=Math.min(lote.cantidadKgDisponible,remaining);
      updated=updated.map(l=>l.id===lote.id?{...l,cantidadKgDisponible:Math.max(0,Math.round((l.cantidadKgDisponible-consume)*1000)/1000)}:l);
      remaining-=consume;
    }
  }
  return updated;
};

const SEED_PROVEEDORES=[
  {id:'prov_paloquemao',nombre:'Plaza de Paloquemao',tipo:'plaza',municipio:'Bogotá'},
  {id:'prov_bavaria',nombre:'Bavaria Tocancipá',tipo:'industrial',municipio:'Tocancipá'},
  {id:'prov_elrosal',nombre:'Agrícola El Rosal',tipo:'directo',municipio:'El Rosal'},
];
// Tres compras separadas: una por proveedor
const SEED_CID_PALO='compra_seed_palo';
const SEED_CID_ELROSAL='compra_seed_elrosal';
const SEED_CID_BAV='compra_seed_bav';
const SEED_LOTES=[
  {id:'lote_s1',compraId:SEED_CID_PALO,ingredienteId:'paja_trigo',cantidadKgTotal:15,precioPorKgCOP:1200,fechaIngreso:'2026-06-01',cantidadKgDisponible:15,activo:true},
  {id:'lote_s3',compraId:SEED_CID_PALO,ingredienteId:'salvado_trigo',cantidadKgTotal:5,precioPorKgCOP:2100,fechaIngreso:'2026-06-01',cantidadKgDisponible:5,activo:true},
  {id:'lote_s2',compraId:SEED_CID_ELROSAL,ingredienteId:'aserrin_roble',cantidadKgTotal:8,precioPorKgCOP:800,fechaIngreso:'2026-06-01',cantidadKgDisponible:8,activo:true},
  {id:'lote_s4',compraId:SEED_CID_BAV,ingredienteId:'afrecho_cerveceria',cantidadKgTotal:3,precioPorKgCOP:500,fechaIngreso:'2026-06-01',cantidadKgDisponible:3,activo:true},
];
const SEED_COMPRAS=[
  {id:SEED_CID_PALO,fecha:'2026-06-01',proveedorId:'prov_paloquemao',
   items:[{ingredienteId:'paja_trigo',kg:15,precio:1200},{ingredienteId:'salvado_trigo',kg:5,precio:2100}],
   fuenteCaptura:'manual',revisadoManualmente:true},
  {id:SEED_CID_ELROSAL,fecha:'2026-06-01',proveedorId:'prov_elrosal',
   items:[{ingredienteId:'aserrin_roble',kg:8,precio:800}],
   fuenteCaptura:'manual',revisadoManualmente:true},
  {id:SEED_CID_BAV,fecha:'2026-06-01',proveedorId:'prov_bavaria',
   items:[{ingredienteId:'afrecho_cerveceria',kg:3,precio:500}],
   fuenteCaptura:'manual',revisadoManualmente:true},
];
const SEED_MOVIMIENTOS=SEED_LOTES.map((l,i)=>({
  id:`mov_seed_${i}`,loteId:l.id,ingredienteId:l.ingredienteId,
  tipo:'entrada',cantidadKg:l.cantidadKgTotal,fecha:'2026-06-01',referencia:l.compraId
}));

// Alias de claves del shell (species.yaml / KB) -> claves internas del SPP del simulador.
const SPP_KEY_ALIAS={
  pleurotus_ostreatus:'p_ostreatus_gris',
  pleurotus_djamor:'p_djamor_rosa',
  pleurotus_eryngii:'p_eryngii',
  hericium_erinaceus:'lions_mane',
  lentinula_edodes:'shiitake',
  ganoderma_lucidum:'reishi',
  flammulina_velutipes:'enoki',
  pholiota_nameko:'nameko',
};
const normSpp=k=>{ if(!k) return k; if(SPP[k]) return k; return SPP_KEY_ALIAS[k]||k; };

// HIST_SUB_NAME / HIST_SUB_TO_ING / historicalEBFor se eliminaron en 2026-08:
// calibraban contra el array `yields` del shell, que son 5 filas de demo
// inventadas (Setas OS v5.dc.html), presentadas en la UI como "lotes reales".
// La calibración vive ahora en historical-calibration.js y se alimenta de
// lotes de Bitácora con peso seco y cosechas registradas.

// ── Hybrid recipe-search adapter for the React simulator ───────────────────
// Keep the React call sites small while the legacy optimizer remains available
// only as a parity oracle in recipe-optimizer.test.js / parity tests.
const hybridRoleCaps=sp=>({
  base_carbono:100,
  suplemento_n:Number(sp?.supplementation_max)||20,
  suplemento_medio:Number(sp?.supplementation_max)||20,
  aditivo_ph:8,
  aditivo_estructura:15,
  aditivo_micronutriente:5,
  aireador:30,
});
const hybridIngredientCaps=(ings,sp)=>{
  const caps={};const suppMax=Number(sp?.supplementation_max)||20;
  (ings||[]).forEach(g=>{
    if(g.role==='suplemento_n'||g.role==='suplemento_medio') caps[g.id]=suppMax;
    else if(g.role==='aditivo_ph') caps[g.id]=8;
    else if(g.role==='aditivo_estructura') caps[g.id]=15;
    else if(g.role==='aditivo_micronutriente') caps[g.id]=5;
    else if(g.role==='aireador') caps[g.id]=30;
  });
  return caps;
};
const hybridSupplementPct=(rec,ings)=>{
  const byId=new Map((ings||[]).map(g=>[g.id,g]));
  return (rec||[]).reduce((sum,r)=>{
    const role=byId.get(r.id)?.role;
    return sum+((role==='suplemento_n'||role==='suplemento_medio')?(Number(r.p)||0):0);
  },0);
};
const runHybridRecipeSearch=({
  targetKey,
  recipe=[],
  invLotes=[],
  maxCost=0,
  ingredients=[],
  useStock=false,
  profileKey='produccion',
  stockMap={},
  lockedIds=[],
})=>{
  const engine=globalThis.SetasPeritoScenarios;
  if(!engine?.searchScenarios) throw new Error('SetasPeritoScenarios no disponible');
  const target=SPP[targetKey];
  if(!target) return{ranked:[],pareto:[],recommended:[],noStock:false,diagnostics:{error:'Especie no encontrada'}};
  const stockIds=new Set((invLotes||[]).filter(l=>l?.activo&&Number(l.cantidadKgDisponible)>0).map(l=>l.ingredienteId));
  const compatible=(ingredients||[]).filter(g=>!Array.isArray(g.cs)||g.cs.length===0||g.cs.includes(targetKey));
  const analyzeAdapter=rec=>analyze(rec,targetKey,ingredients);
  const scoreAdapter=(analysis,ctx)=>{
    const treatment=calcTreatment(analysis,targetKey,SPP);
    return scoreAn(analysis,{
      treatment,
      recipe:ctx.recipe,
      stockIds:useStock?stockIds:undefined,
    });
  };
  return engine.searchScenarios({
    recipe,
    context:{sKey:targetKey,spp:SPP,stockIds},
    searchMode:'hybrid',
    targetKey,
    spp:SPP,
    ingredients:compatible,
    analyze:analyzeAdapter,
    score:scoreAdapter,
    history:[],
    generations:3,
    beamWidth:14,
    stepPct:4,
    useStock,
    stockIds,
    invLotes,
    stockMap,
    profileKey,
    maxCost,
    roleCaps:hybridRoleCaps(target),
    ingredientCaps:hybridIngredientCaps(compatible,target),
    lockedIds:new Set(lockedIds||[]),
  });
};
const hybridOptimizerRow=(candidate,targetKey,ingredients,stockMap,profileKey)=>{
  const an=candidate?.evaluation?.analysis;
  const sp=SPP[targetKey];
  const profile=OPT_PROFILES[profileKey]||OPT_PROFILES.produccion;
  const speciesSupp=Number(sp?.supplementation_max)||20;
  const suppLimit=profile.maxSupp!=null?Math.min(speciesSupp,profile.maxSupp):speciesSupp;
  const suppPct=hybridSupplementPct(candidate?.recipe||[],ingredients);
  const maxKgWet=Object.keys(stockMap||{}).length&&candidate?.recipe?.length
    ?calcMaxBatchFromStock(candidate.recipe,stockMap,10,sp?.moisture?.ideal||65,ingredients)
    :null;
  return{
    recipe:candidate.recipe,
    an,
    score:Number(candidate.evaluation?.score)||0,
    riskScore:Number(candidate.evaluation?.riskScore??candidate.evaluation?.breakdown?.risk??50),
    maxKgWet,
    suppPct,
    suppOverLimit:suppPct>suppLimit,
    realCostKnown:!!an?.realCostKnown,
    scenario:candidate,
  };
};
const hybridOptimizerDiag=(out,targetKey,ingredients,useStock,invLotes,profileKey)=>{
  const stockIds=new Set((invLotes||[]).filter(l=>l?.activo&&Number(l.cantidadKgDisponible)>0).map(l=>l.ingredienteId));
  const pool=useStock
    ?(ingredients||[]).filter(g=>stockIds.has(g.id))
    :(ingredients||[]).filter(g=>!Array.isArray(g.cs)||g.cs.length===0||g.cs.includes(targetKey));
  const compatible=g=>!Array.isArray(g.cs)||g.cs.length===0||g.cs.includes(targetKey);
  const bases=pool.filter(g=>g.role==='base_carbono'&&compatible(g)&&Number(g.cn)>0&&Number(g.n)>0);
  const supps=pool.filter(g=>(g.role==='suplemento_n'||g.role==='suplemento_medio')&&compatible(g)&&Number(g.cn)>0&&Number(g.n)>0);
  const aers=pool.filter(g=>g.role==='aireador');
  return{
    stockIds:stockIds.size,
    poolSize:pool.length,
    bases:bases.length,
    supps:supps.length,
    aers:aers.length,
    tried:Number(out?.explored)||0,
    resultsRaw:Number(out?.diagnostics?.allowedCount??out?.ranked?.length??0),
    suppLimit:Number(out?.profile?.maxSupp??SPP[targetKey]?.supplementation_max??20),
    profileKey,
    targetKey,
    baseNames:bases.map(g=>g.name),
    suppNames:supps.map(g=>g.name),
  };
};

function App(props){
  const [bridgeOpen,setBridgeOpen]=useState(true);
  // Oculta la barra fija de especie al bajar (deja más alto útil en mobile, donde
  // ya compite con el rail inferior) y la reaparece al subir o cerca del tope.
  const [bridgeHidden,setBridgeHidden]=useState(false);
  useEffect(()=>{
    const scroller=document.querySelector('.app-main')||window;
    let lastY=scroller===window?window.scrollY:scroller.scrollTop;
    let raf=null;
    const onScroll=()=>{
      if(raf) return;
      raf=requestAnimationFrame(()=>{
        raf=null;
        const y=scroller===window?window.scrollY:scroller.scrollTop;
        const delta=y-lastY;
        if(y<80) setBridgeHidden(false);
        else if(delta>16) setBridgeHidden(true);
        else if(delta<-8) setBridgeHidden(false);
        lastY=y;
      });
    };
    scroller.addEventListener('scroll',onScroll,{passive:true});
    return ()=>{scroller.removeEventListener('scroll',onScroll);if(raf) cancelAnimationFrame(raf);};
  },[]);
  const [hasPickedSpecies,setHasPickedSpecies]=useState(()=>{
    try{
      const p=normSpp(props.preselectSpecies);
      if(p&&SPP[p]) return true;
      const pre=normSpp(localStorage.getItem('sim_preselect_spp'));
      if(pre&&SPP[pre]) return true;
    }catch(e){}
    return false;
  });
  const [sKey,setSKeyRaw]=useState(()=>{
    try{
      const p=normSpp(props.preselectSpecies);
      if(p&&SPP[p]) return p;
      const pre=normSpp(localStorage.getItem('sim_preselect_spp'));
      if(pre&&SPP[pre]){localStorage.removeItem('sim_preselect_spp');return pre;}
    }catch(e){}
    return 'p_ostreatus_gris';
  });
  const setSKey=(k)=>{setHasPickedSpecies(true);setSKeyRaw(k);};
  const [catalogModalOpen,setCatalogModalOpen]=useState(false);
  useEffect(()=>{if(!catalogModalOpen)return;const onEsc=e=>{if(e.key==='Escape')setCatalogModalOpen(false);};document.addEventListener('keydown',onEsc);return()=>document.removeEventListener('keydown',onEsc);},[catalogModalOpen]);
  const [sppPickerOpen,setSppPickerOpen]=useState(true); // legacy — kept for compat
  const [recipe,setRecipe]=useState([]);
  const [search,setSearch]=useState('');
  const [cat,setCat]=useState('all');
  const [numBags,setNumBags]=useState(6);
  const [kgBag,setKgBag]=useState(1.5);
  const [spawnCost,setSpawnCost]=useState(12000);
  const [showOpt,setShowOpt]=useState(false);
  const [hObj,setHObj]=useState(67);
  const [showGuide,setShowGuide]=useState(false);
  const [showBatch,setShowBatch]=useState(false);
  const [saved,setSaved]=useState([]);
  const [saveName,setSaveName]=useState('');
  const [showSaved,setShowSaved]=useState(false);
  const [flash,setFlash]=useState(false);
  const [saveSyncErr,setSaveSyncErr]=useState('');
  const [loteSyncErr,setLoteSyncErr]=useState('');
  const [bitSyncErr,setBitSyncErr]=React.useState('');
  const [cmpRecipe,setCmpRecipe]=useState([]);
  const [cmpKey,setCmpKey]=useState('p_ostreatus_gris');
  const [tab,setTab]=useState(()=>{try{return new URLSearchParams(window.location.search).get('view')||'home';}catch(e){return'home';}});
  const TAB_LABELS={home:'Hoy',inicio:'Inicio',catalogo:'Catálogo',formular:'Formular',inventario:'Bodega',produccion:'Preparar mezcla',schedule:'Cronograma',dashboard:'Recetario',bitacora:'Bitácora'};
  const NAV_GROUPS=[
    {key:'inicio',label:'Inicio',tabs:['home','inicio'],icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>},
    {key:'recetas',label:'Formular',tabs:['catalogo','formular','dashboard'],icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9"/></svg>},
    {key:'produccion',label:'Producción',tabs:['produccion','inventario','schedule'],icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6"/></svg>},
    {key:'registro',label:'Bitácora',tabs:['bitacora'],icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h14v16H5zM9 4V2h6v2M8 10h8M8 14h8M8 18h5"/></svg>}
  ];
  const TAB_PAGE_TITLES={home:'Centro de Mando · Hoy',inicio:'Inicio',catalogo:'Catálogo de especies',formular:'Formulador de receta',inventario:'Bodega',produccion:'Preparar mezcla',schedule:'Cronograma de cultivo',dashboard:'Recetario',bitacora:'Bitácora de pruebas'};
  const [mode,setMode]=useState('receta');
  const RECETA_TABS=['catalogo','formular','dashboard'];
  const CULTIVO_TABS=['inventario','produccion','schedule','bitacora'];
  const TAB_ALIASES={optimizar:'formular'};
  const applyTab=t=>{t=TAB_ALIASES[t]||t;setTab(t);setMode(RECETA_TABS.includes(t)?'receta':'cultivo');return t;};
  const goTab=t=>{const next=applyTab(t);try{const url=new URL(window.location.href);url.searchParams.set('view',next);window.history.replaceState(null,'',url);}catch(e){}if(typeof props.onTabChange==='function')props.onTabChange(next);};
  useEffect(()=>{const onPop=()=>{try{applyTab(new URLSearchParams(window.location.search).get('view')||'home');}catch(e){}};window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop);},[]);
  useEffect(()=>{ if(props.tab) applyTab(props.tab); },[props.tab, props.tabNonce]);
  const _preInit=useRef(true);
  useEffect(()=>{
    if(_preInit.current){ _preInit.current=false; return; }
    const k=normSpp(props.preselectSpecies);
    if(k&&SPP[k]){ setSKey(k); goTab('formular'); }
  },[props.preselectSpecies, props.preselectNonce]);
  const [schDate,setSchDate]=useState((()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;})());
  const [schKey,setSchKey]=useState('p_ostreatus_gris');
  const [normMode,setNormMode]=useState(false);
  const [vegPrice,setVegPrice]=useState(12000);
  const [priceOverrides,setPriceOverrides]=useState({});
  const [showPrices,setShowPrices]=useState(false);
  const [invBase,setInvBase]=useState('');
  const [invSupp,setInvSupp]=useState('');
  const [invAer,setInvAer]=useState('');
  const [invMin,setInvMin]=useState(3);
  const [invAerPct,setInvAerPct]=useState(10);
  const [invTargetCN,setInvTargetCN]=useState(35);
  const [invResult,setInvResult]=useState(null);
  const [dashFilter,setDashFilter]=useState('all');
  const [lockedIds,setLockedIds]=useState([]);
  const [balanceMode,setBalanceMode]=useState('proportional');
  // v3 new state
  const [pantryIds,setPantryIds]=useState([]);
  const [usePantry,setUsePantry]=useState(false);
  const [showCompatOnly,setShowCompatOnly]=useState(false);
  const [disabledIngIds,setDisabledIngIds]=useState([]);
  const toggleDisabledIng=(id)=>setDisabledIngIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const [justAddedIds,setJustAddedIds]=useState([]);
  const flashAdded=(id)=>{setJustAddedIds(p=>[...p,id]);setTimeout(()=>setJustAddedIds(p=>p.filter(x=>x!==id)),650);};
  const [optTarget,setOptTarget]=useState(sKey||'p_ostreatus_gris');
  React.useEffect(()=>{setOptTarget(sKey);setOptResults(null);},[sKey]);
  const [optMaxCost,setOptMaxCost]=useState(0);
  const [optResults,setOptResults]=useState(null);
  const [optRunning,setOptRunning]=useState(false);
  // Modo de trabajo del Formulador: bodega (solo stock real) vs. catálogo
  // completo. Antes solo alimentaba el Generador automático — ahora también
  // controla las sugerencias individuales del Perito (bestStock en
  // generateOptimizer), para que ambos exploren siempre el mismo universo de
  // ingredientes y no queden desincronizados. Persistido: es una preferencia
  // de cómo el usuario quiere trabajar, no un dato de la receta activa.
  // Modo de trabajo global del Formulador: 'produccion' (Bodega, stock real, lotes) vs. 'investigacion' (Catálogo completo, I+D)
  const [globalMode, setGlobalMode] = useState(() => {
    try {
      const v = localStorage.getItem('setas_global_workmode');
      if (v === 'investigacion' || v === 'catalogo') return 'investigacion';
      const w = localStorage.getItem('setas_workmode');
      if (w === 'catalogo') return 'investigacion';
    } catch(e) {}
    return 'produccion';
  });
  const [optUseStock, setOptUseStock] = useState(globalMode === 'produccion');
  const setGlobalWorkMode = (mode) => {
    setGlobalMode(mode);
    setOptUseStock(mode === 'produccion');
    try {
      localStorage.setItem('setas_global_workmode', mode);
      localStorage.setItem('setas_workmode', mode === 'produccion' ? 'bodega' : 'catalogo');
    } catch(e) {}
  };
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [showLiveChips,setShowLiveChips]=useState(false);
  const [groupByRole,setGroupByRole]=useState(true);
  const [collapsedRoles,setCollapsedRoles]=useState({});
  const toggleRoleCollapse=(roleKey)=>setCollapsedRoles(prev=>({...prev,[roleKey]:!prev[roleKey]}));
  const [optProfile,setOptProfile]=useState('produccion');
  // ── Producción: lote propio de la hoja imprimible ──
  const [prodBags,setProdBags]=useState(6);
  const [prodKg,setProdKg]=useState(1.5);
  const [prodH,setProdH]=useState(67);
  const [prodDate,setProdDate]=useState((()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;})());
  const [prodScaleG,setProdScaleG]=useState(0.1); // resolución de báscula en gramos (0.1 g = 100 mg)
  const [prodMoist,setProdMoist]=useState({});    // override de humedad real por insumo {id: %} para el lote del día
  const [prodLoteNum,setProdLoteNum]=useState('');  // número de lote imprimible
  const [checkedSteps,setCheckedSteps]=useState({}); // checkboxes interactivos de la hoja
  const [loteBatchConfirm,setLoteBatchConfirm]=useState(null); // modal confirmar descuento de inventario
  const [confirmDlg,setConfirmDlg]=useState(null); // {title,msg,onConfirm,danger,confirmLabel} — reemplaza window.confirm
  const [promptDlg,setPromptDlg]=useState(null); // {title,label,placeholder,onSubmit} — reemplaza window.prompt
  const [noticeDlg,setNoticeDlg]=useState(null); // {title,msg} — reemplaza alert()
  // ── Bitácora de pruebas ──
  const [bitLotes,setBitLotes]=useState([]);
  const [bitBolsas,setBitBolsas]=useState([]);
  const [bitCosechas,setBitCosechas]=useState([]);
  const [bitTab,setBitTab]=useState('bit_dash');
  const [bitActiveLoteId,setBitActiveLoteId]=useState(null);
  const applyBitTab=(raw,hasActiveLote=!!bitActiveLoteId)=>{
    const allowed=['bit_dash','bit_bolsas','bit_cosechas','bit_comparador','bit_ficha'];
    const requested=allowed.includes(raw)?raw:'bit_dash';
    const needsLote=['bit_bolsas','bit_cosechas','bit_ficha'].includes(requested);
    const next=needsLote&&!hasActiveLote?'bit_dash':requested;
    setBitTab(next);
    return next;
  };
  const goBitTab=(raw,hasActiveLote)=>{const next=applyBitTab(raw,hasActiveLote);if(typeof props.onBitSubtabChange==='function')props.onBitSubtabChange(next);};
  useEffect(()=>{
    if(!props.bitSubtab)return;
    const next=applyBitTab(props.bitSubtab);
    if(next!==props.bitSubtab&&typeof props.onBitSubtabChange==='function')props.onBitSubtabChange(next);
  },[props.bitSubtab,props.bitSubtabNonce,bitActiveLoteId]);
  const [bitDashView,setBitDashView]=useState('grid');
  const [showBitNuevo,setShowBitNuevo]=useState(false);
  const [bitNuevoForm,setBitNuevoForm]=useState({});
  const [showBitCosecha,setShowBitCosecha]=useState(false);
  const [bitCosechaForm,setBitCosechaForm]=useState({});
  const [prodBagType,setProdBagType]=useState('bolsa_20x50'); // tipo de contenedor activo
  const [showFlush,setShowFlush]=useState(false);
  const [showCompChart,setShowCompChart]=useState(false);
  const [showSpeciesRec,setShowSpeciesRec]=useState(false);

  // ── v4: estado inventario
  const [invProveedores,setInvProveedores]=useState([]);
  const [invCompras,setInvCompras]=useState([]);
  const [invLotes,setInvLotes]=useState([]);
  const [invMovimientos,setInvMovimientos]=useState([]);
  const [invTab,setInvTab]=useState('stock');
  const [formularMode,setFormularMode]=useState('auto');
  const [showOptimizer,setShowOptimizer]=useState(true);
  const [builderSubTab,setBuilderSubTab]=useState('formular');
  const [loadedFlash,setLoadedFlash]=useState(false);
  const [cmpFecha,setCmpFecha]=useState((()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;})());
  const [cmpProvId,setCmpProvId]=useState('');
  const [cmpFuente,setCmpFuente]=useState('manual');
  const [cmpItems,setCmpItems]=useState([{uid:1,ingId:'',kg:'',precio:''}]);
  const [cmpMode,setCmpMode]=useState('manual');
  const [cmpPasteText,setCmpPasteText]=useState('');
  const [cmpParsing,setCmpParsing]=useState(false);
  const [cmpParseErr,setCmpParseErr]=useState('');
  const [huboParseIA,setHuboParseIA]=useState(false); // true tras interpretar foto/texto — el resumen se deriva de cmpItems en cada render, no se guarda como snapshot
  const [cmpLastFoto,setCmpLastFoto]=useState(null); // {fileBlock,esPDF,name} — para reintentar sin resubir
  const [cmpConfirm,setCmpConfirm]=useState(null);
  const cmpFileRef=useRef(null);
  const [showProvModal,setShowProvModal]=useState(false);
  const [newProv,setNewProv]=useState({nombre:'',tipo:'plaza',municipio:''});

  // Bloquea el scroll del body mientras cualquier modal esté abierto — en iOS Safari
  // el fondo puede seguir haciendo rubber-band scroll detrás de un overlay fixed.
  React.useEffect(()=>{
    const anyModalOpen=!!(confirmDlg||promptDlg||noticeDlg||loteBatchConfirm||showBitNuevo||showBitCosecha||showProvModal||catalogModalOpen);
    if(!anyModalOpen) return;
    const prevOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=prevOverflow;};
  },[confirmDlg,promptDlg,noticeDlg,loteBatchConfirm,showBitNuevo,showBitCosecha,showProvModal,catalogModalOpen]);
  const [collapsedMonths,setCollapsedMonths]=useState({});
  const [editingRowId,setEditingRowId]=useState(null);
  const [editingRowData,setEditingRowData]=useState({stock:'',precio:'',proveedorId:'',alertaMin:'',ingredienteNuevoId:''});
  const [showAddStockForm,setShowAddStockForm]=useState(false);
  const [addStockId,setAddStockId]=useState('');
  const [addStockKg,setAddStockKg]=useState('');
  const [alertaConfig,setAlertaConfig]=useState({});
  const [provOverride,setProvOverride]=useState({});
  const saveRowEdit=(ingredienteId)=>{
    const {stock,precio,proveedorId,alertaMin,ingredienteNuevoId}=editingRowData;
    const kg=Math.max(0,parseFloat(stock)||0);
    const pr=Math.max(0,parseFloat(precio)||0);
    const nuevoId=(ingredienteNuevoId&&ingredienteNuevoId!==ingredienteId)?ingredienteNuevoId:null;
    const targetId=nuevoId||ingredienteId;
    // Reasignar ingredienteId en lotes si cambió
    setInvLotes(prev=>{
      let updated=nuevoId?prev.map(l=>l.ingredienteId===ingredienteId?{...l,ingredienteId:nuevoId}:l):[...prev];
      const activos=updated.filter(l=>l.activo&&l.ingredienteId===targetId);
      if(activos.length===0){
        const loteId='lote_manual_'+Date.now();
        updated=[...updated,{id:loteId,compraId:'ajuste_manual',ingredienteId:targetId,cantidadKgTotal:kg,precioPorKgCOP:pr,fechaIngreso:new Date().toISOString().split('T')[0],cantidadKgDisponible:kg,activo:true}];
      } else if(activos.length===1){
        updated=updated.map(l=>l.id===activos[0].id?{...l,cantidadKgDisponible:kg,cantidadKgTotal:Math.max(l.cantidadKgTotal,kg),precioPorKgCOP:pr}:l);
      } else {
        const totalActual=activos.reduce((s,l)=>s+l.cantidadKgDisponible,0);
        updated=updated.map(l=>{
          if(!l.activo||l.ingredienteId!==targetId) return l;
          const fraccion=totalActual>0?l.cantidadKgDisponible/totalActual:1/activos.length;
          return{...l,cantidadKgDisponible:Math.round(kg*fraccion*100)/100,precioPorKgCOP:pr};
        });
      }
      try{localStorage.setItem('sdp_lotes',JSON.stringify(updated));}catch(e){}
      return updated;
    });
    // Reasignar en compras si cambió el tipo
    if(nuevoId){
      setInvCompras(prev=>{
        const upd=prev.map(c=>({...c,items:c.items.map(it=>it.ingredienteId===ingredienteId?{...it,ingredienteId:nuevoId}:it)}));
        try{localStorage.setItem('sdp_compras',JSON.stringify(upd));}catch(e){}
        return upd;
      });
    }
    // Proveedor override
    if(proveedorId){
      const upd={...provOverride,[targetId]:proveedorId};
      setProvOverride(upd);try{localStorage.setItem('sdp_prov_override',JSON.stringify(upd));}catch(e){}
    }
    // Alerta mínima
    const am=parseFloat(alertaMin);
    if(!isNaN(am)&&am>=0){
      const upd={...alertaConfig,[targetId]:am};
      setAlertaConfig(upd);try{localStorage.setItem('sdp_alertas',JSON.stringify(upd));}catch(e){}
    }
    setEditingRowId(null);
  };

  const eliminarIngrediente=(ingredienteId,nombre)=>{
    const doDelete=()=>{
      setInvLotes(prev=>{
        const upd=prev.map(l=>l.ingredienteId===ingredienteId?{...l,activo:false}:l);
        try{localStorage.setItem('sdp_lotes',JSON.stringify(upd));}catch(e){}
        return upd;
      });
      // Limpiar pantry
      try{
        const pantry=JSON.parse(localStorage.getItem('sdp_pantry')||'{}');
        delete pantry[ingredienteId];
        localStorage.setItem('sdp_pantry',JSON.stringify(pantry));
      }catch(e){}
    };
    setConfirmDlg({title:'Eliminar stock',msg:`¿Eliminar todo el stock de "${nombre}"? Esto marcará los lotes como inactivos. Los movimientos e historial de compras se conservan.`,danger:true,confirmLabel:'Eliminar',onConfirm:doDelete});
  };
  // Compatibilidad legacy (usada en botón "Agregar ingrediente al stock")
  const saveStockEdit=(ingredienteId,nuevoKg)=>{
    const kg=Math.max(0,parseFloat(nuevoKg)||0);
    setInvLotes(prev=>{
      let updated=[...prev];
      const activos=updated.filter(l=>l.activo&&l.ingredienteId===ingredienteId);
      if(activos.length===0){
        const loteId='lote_manual_'+Date.now();
        updated=[...updated,{id:loteId,compraId:'ajuste_manual',ingredienteId,cantidadKgTotal:kg,precioPorKgCOP:0,fechaIngreso:new Date().toISOString().split('T')[0],cantidadKgDisponible:kg,activo:true}];
      } else if(activos.length===1){
        updated=updated.map(l=>l.id===activos[0].id?{...l,cantidadKgDisponible:kg,cantidadKgTotal:Math.max(l.cantidadKgTotal,kg)}:l);
      } else {
        const totalActual=activos.reduce((s,l)=>s+l.cantidadKgDisponible,0);
        updated=updated.map(l=>{
          if(!l.activo||l.ingredienteId!==ingredienteId) return l;
          const fraccion=totalActual>0?l.cantidadKgDisponible/totalActual:1/activos.length;
          return{...l,cantidadKgDisponible:Math.round(kg*fraccion*100)/100};
        });
      }
      try{localStorage.setItem('sdp_lotes',JSON.stringify(updated));}catch(e){}
      return updated;
    });
  };



  // ── v4: cargar / seed inventario
  useEffect(()=>{
    try{
      const seeded=localStorage.getItem('sdp_seeded');
      if(!seeded){
        localStorage.setItem('sdp_proveedores',JSON.stringify(SEED_PROVEEDORES));
        localStorage.setItem('sdp_compras',JSON.stringify(SEED_COMPRAS));
        localStorage.setItem('sdp_lotes',JSON.stringify(SEED_LOTES));
        localStorage.setItem('sdp_movimientos',JSON.stringify(SEED_MOVIMIENTOS));
        localStorage.setItem('sdp_seeded','1');
        setInvProveedores(SEED_PROVEEDORES);
        setInvCompras(SEED_COMPRAS);
        setInvLotes(SEED_LOTES);
        setInvMovimientos(SEED_MOVIMIENTOS);
      } else {
        const p=localStorage.getItem('sdp_proveedores');const c=localStorage.getItem('sdp_compras');
        const l=localStorage.getItem('sdp_lotes');const m=localStorage.getItem('sdp_movimientos');
        if(p) setInvProveedores(JSON.parse(p));
        if(c) setInvCompras(JSON.parse(c));
        if(l) setInvLotes(JSON.parse(l));
        if(m) setInvMovimientos(JSON.parse(m));
      }
    }catch(e){}
    // Bitácora en su propio try/catch: un JSON dañado en las claves de Bodega
    // no debe impedir cargar (ni ocultar) los lotes experimentales guardados.
    try{
      const bl=localStorage.getItem('sdp_bit_lotes');const bb=localStorage.getItem('sdp_bit_bolsas');const bc=localStorage.getItem('sdp_bit_cosechas');
      if(bl) setBitLotes(JSON.parse(bl));if(bb) setBitBolsas(JSON.parse(bb));if(bc) setBitCosechas(JSON.parse(bc));
    }catch(e){
      setNoticeDlg({title:'No se pudo cargar la Bitácora',msg:'Los datos guardados de lotes experimentales no se pudieron leer (formato dañado). No se sobrescribieron: revisa el almacenamiento del navegador antes de crear nuevos lotes.'});
    }
  },[]);

  // ── v4: sincronizar pantry con stock
  useEffect(()=>{
    if(!invLotes.length) return;
    const inStockIds=[...new Set(invLotes.filter(l=>l.activo&&l.cantidadKgDisponible>0).map(l=>l.ingredienteId))];
    // Reemplazar (no acumular) para que ítems con stock=0 queden fuera
    setPantryIds(inStockIds);
  },[invLotes]);

  useEffect(()=>{try{const s=localStorage.getItem('setas_v6');if(s) setSaved(JSON.parse(s));}catch(e){};},[]);
  useEffect(()=>{ if(props.onSavedChange) props.onSavedChange(saved); },[saved]);
  useEffect(()=>{try{const s=localStorage.getItem('setas_prices_v1');if(s) setPriceOverrides(JSON.parse(s));}catch(e){};},[]);
  useEffect(()=>{try{const s=localStorage.getItem('sdp_alertas');if(s) setAlertaConfig(JSON.parse(s));}catch(e){};},[]);
  useEffect(()=>{try{const s=localStorage.getItem('sdp_prov_override');if(s) setProvOverride(JSON.parse(s));}catch(e){};},[]);

  const saveR=()=>{
    const nm=saveName.trim();if(!nm||!recipe.length||!balanced) return;
    const trSave=an?calcTreatment(an, sKey, SPP):null;
    const e={id:Date.now(),name:nm,sKey,recipe:[...recipe],date:new Date().toLocaleDateString('es-CO'),eb:an?an.eb.toFixed(0):'—',cn:an?an.cn.toFixed(1):'—',score:opt.score,cost:an?Math.round(an.cost):0,treatCol:trSave?.col||null,energyCopKg:trSave?.energy?.cop_per_kg_seco||0};
    const u=[e,...saved];setSaved(u);try{localStorage.setItem('setas_v6',JSON.stringify(u));}catch(e2){}
    setSaveName('');setFlash(true);setSaveSyncErr('');setTimeout(()=>setFlash(false),1500);
    // Escritura en Firestore en segundo plano — localStorage ya guardó al instante,
    // así que un fallo de red no bloquea al operador; solo se avisa si no sincronizó.
    if(window.SetasDB){
      window.SetasDB.saveReceta({
        nombre:nm, sKey, ingredientes:recipe.map(r=>({id:r.id,pct:parseFloat(r.p)||0})),
        cn:an?an.cn:null, eb:an?an.eb:null, cost:an?Math.round(an.cost):null, score:opt.score,
      }).catch(err=>setSaveSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido')));
    }
  };
  const promoverReceta=(recetaObj)=>{
    const targetRecipe=recetaObj?.recipe||recipe;
    const targetSKey=recetaObj?.sKey||sKey;
    const targetName=recetaObj?.name||'Receta activa';

    if(!targetRecipe.length){
      setNoticeDlg({title:'Sin receta',msg:'No hay ingredientes en la receta para promover a producción.'});
      return;
    }

    const missingStock=[];
    targetRecipe.forEach(r=>{
      const g=effectiveINGS.find(x=>x.id===r.id);
      const inStockKg=stockMap[r.id]||0;
      if(inStockKg<=0||!stockIds.has(r.id)){
        missingStock.push({name:g?.name||r.id,pct:r.p,inStockKg});
      }
    });

    const executePromotion=()=>{
      setGlobalWorkMode('produccion');
      if(recetaObj&&recetaObj.id){
        const u=saved.map(s=>s.id===recetaObj.id?{...s,esProduccion:true,fechaPromocion:new Date().toLocaleDateString('es-CO')}:s);
        setSaved(u);
        try{localStorage.setItem('setas_v6',JSON.stringify(u));}catch(e){}
      }
      setSKey(targetSKey);
      setRecipe(targetRecipe);
      goTab('produccion');
      setNoticeDlg({
        title:'⭐ Receta promovida a Producción',
        msg:`La receta "${targetName}" ha sido promovida a Producción oficial. Se han cargado los parámetros en la Hoja de Producción lista para lote.`
      });
    };

    if(missingStock.length>0){
      setConfirmDlg({
        title:'⭐ Promover a Producción — Insumos Faltantes',
        msg:`La receta "${targetName}" incluye ingredientes sin stock suficiente en Bodega Tenjo:\n\n• ${missingStock.map(m=>`${m.name} (${m.pct}%) — Stock actual: ${m.inStockKg.toFixed(1)} kg`).join('\n• ')}\n\n¿Deseas promoverla para planificar la producción y compra de insumos?`,
        confirmLabel:'Promover y planificar',
        onConfirm:executePromotion,
      });
    }else{
      executePromotion();
    }
  };
  const loadR=e=>{
    const apply=()=>{setSKey(e.sKey);setRecipe(e.recipe);setLockedIds([]);goTab('formular');setLoadedFlash(true);setTimeout(()=>setLoadedFlash(false),2200);};
    if(recipe.length>0){setConfirmDlg({title:'Reemplazar receta activa',msg:`¿Reemplazar la receta activa con "${e.name}"? Se perderán los cambios sin guardar.`,onConfirm:apply});return;}
    apply();
  };
  // Protección de UI: solo evita el clic accidental de un operador de campo en
  // una acción destructiva e irreversible — no es seguridad real (toda la app
  // comparte una sola cuenta de Firebase; ver nota junto a OPERATORS en
  // "Setas OS v5.dc.html"). props.isAdmin viene del operador elegido en el
  // picker del encabezado.
  const requireAdmin=fn=>(...args)=>{
    if(!props.isAdmin){ setNoticeDlg({title:'Acción restringida',msg:'Solo un administrador puede hacer esto. Si te corresponde, cámbiate de operador en el encabezado (ícono de usuario).'}); return; }
    fn(...args);
  };
  const delR=id=>{
    setConfirmDlg({title:'Eliminar receta',msg:'¿Eliminar esta receta guardada? Esta acción no se puede deshacer.',danger:true,confirmLabel:'Eliminar',onConfirm:()=>{const u=saved.filter(r=>r.id!==id);setSaved(u);try{localStorage.setItem('setas_v6',JSON.stringify(u));}catch(e){}}});
  };
  // Registra el EB real observado tras cosechar un lote de una prueba guardada.
  // Antes cada análisis del Perito/Formulador era puramente teórico (fórmulas
  // fijas) sin retroalimentación de qué pasó realmente en producción — esto
  // no cambia el score todavía, pero deja el dato (eb estimado vs ebReal)
  // visible en el Recetario para que el usuario vea qué tan bien predice el
  // modelo en su bodega concreta, y es la base para calibrar la matriz más
  // adelante con datos reales en vez de solo teoría.
  const setEbRealFor=id=>{
    const entry=saved.find(s=>s.id===id);
    if(!entry) return;
    setPromptDlg({title:'Registrar EB real',label:`EB real obtenida al final del ciclo (%) · estimado: ${entry.eb}%`,placeholder:String(entry.eb),confirmLabel:'Guardar',onSubmit:val=>{
      const n=parseFloat(val);
      if(!Number.isFinite(n)) return;
      const u=saved.map(s=>s.id===id?{...s,ebReal:Math.round(n*10)/10}:s);
      setSaved(u);
      try{localStorage.setItem('setas_v6',JSON.stringify(u));}catch(e){}
    }});
  };

  const sp=SPP[sKey];
  const effectiveINGS=useMemo(()=>INGS.map(ing=>{
    const invPr=precioPonderado(ing.id,invLotes);
    if(invPr!==null) return{...ing,cost:Math.round(invPr)};
    if(priceOverrides[ing.id]!==undefined) return{...ing,cost:priceOverrides[ing.id]};
    return ing;
  }),[priceOverrides,invLotes]);
  const optimizerINGS=useMemo(()=>effectiveINGS.filter(g=>!disabledIngIds.includes(g.id)),[effectiveINGS,disabledIngIds]);
  const fings=useMemo(()=>effectiveINGS.filter(g=>{
    const ms=search===''||g.name.toLowerCase().includes(search.toLowerCase())||g.tags.some(t=>t.toLowerCase().includes(search.toLowerCase()));
    const roleMatch=cat==='all'||(cat==='aditivo'?['aditivo_ph','aditivo_estructura','aditivo_micronutriente','aditivo_arrancador'].includes(g.role):g.role===cat);
    return ms&&roleMatch;
  }).sort((a,b)=>a.name.localeCompare(b.name)),[search,cat,effectiveINGS]);

  // Calibración por evidencia real: lotes de Bitácora con peso seco y cosechas
  // registradas. Sin lotes reales n=0 y weight=0 — el score cae limpio al EB
  // teórico en vez de mezclarse con las filas de demo del shell.
  const histRows=useMemo(()=>bitacoraEBRows(bitLotes,bitCosechas),[bitLotes,bitCosechas]);
  const histStats=useMemo(()=>historicalEB(sKey,histRows,recipe),[sKey,histRows,recipe]);
  const an=useMemo(()=>analyze(recipe,sKey,effectiveINGS),[recipe,sKey,effectiveINGS]);
  const balanced=isMassBalanced(an);
  const balMsg=balanced?'':massBalanceMsg(an);
  const optimalAn=useMemo(()=>{try{
    const r=runHybridRecipeSearch({
      targetKey:sKey,
      recipe:[],
      invLotes,
      maxCost:0,
      ingredients:optimizerINGS,
      useStock:false,
      profileKey:'produccion',
      stockMap:{},
    });
    return r.ranked?.[0]?.evaluation?.analysis||null;
  }catch(e){return null;}},[sKey,invLotes,optimizerINGS]);
  const dg=useMemo(()=>diagnose(an,sKey),[an,sKey]);
  const tr=useMemo(()=>calcTreatment(an, sKey, SPP),[an,sKey]);
  const bd=useMemo(()=>showBatch?calcBatch(recipe,numBags,kgBag,hObj,spawnCost,effectiveINGS,an?.dynSpawn):null,[recipe,numBags,kgBag,showBatch,hObj,spawnCost,effectiveINGS,an?.dynSpawn]);
  // ── Ficha: rows precalculados para botón Ejecutar Lote ──
  const prodRows=useMemo(()=>{
    if(!recipe.length||!balanced) return null;
    const prodIngs=effectiveINGS.map(g=>prodMoist[g.id]!=null?{...g,moisture:prodMoist[g.id]}:g);
    const pb=calcBatch(recipe,prodBags||1,prodKg||1.5,prodH||67,spawnCost,prodIngs,an?.dynSpawn);
    if(!pb) return null;
    const resG=prodScaleG||0.1;
    const roundG=x=>Math.round(x/resG)*resG;
    return recipe.map(r=>{
      const g=prodIngs.find(x=>x.id===r.id);
      const it=g?pb.items.find(x=>x.name===g.name):null;
      const krTeo=it?it.kr:0;
      const grR=roundG(krTeo*1000);
      const m=g?Math.min(0.92,Math.max(0,(g.moisture||0)/100)):0;
      const masaSecaR=(grR/1000)*(1-m);
      return{g,r,krTeo,grR,m,masaSecaR};
    });
  },[recipe,effectiveINGS,prodMoist,prodBags,prodKg,prodH,spawnCost,prodScaleG,an]);
  const stockIds=useMemo(()=>new Set(invLotes.filter(l=>l.activo&&l.cantidadKgDisponible>0).map(l=>l.ingredienteId)),[invLotes]);
  const stockMap=useMemo(()=>{const m={};invLotes.filter(l=>l.activo&&l.cantidadKgDisponible>0).forEach(l=>{m[l.ingredienteId]=(m[l.ingredienteId]||0)+l.cantidadKgDisponible;});return m;},[invLotes]);
  const lowStockCount=useMemo(()=>{
    const registeredIds=[...new Set(invLotes.filter(l=>l.activo).map(l=>l.ingredienteId))];
    return registeredIds.filter(id=>(stockMap[id]||0)<(alertaConfig[id]??2)).length;
  },[invLotes,stockMap,alertaConfig]);
  useEffect(()=>{if(typeof props.onStockAlertChange==='function')props.onStockAlertChange(lowStockCount);},[lowStockCount]);
  // Mismo EB mezclado con historial real que ya se pinta en el gauge
  // (RecipeGauges/blendEBWithHistory) — se pasa como override al score del
  // Perito para que ambos coincidan: antes el gauge mostraba un EB ajustado
  // por lotes reales pero el score de al lado seguía siendo 100% teórico.
  const blendedEB=an?blendEBWithHistory(an,histStats):null;
  // Memoria de sesión de qué bandera/ícono se atacó desde el Perito — ver
  // repeatedApply en generateOptimizer. Por ícono, no por operación exacta:
  // refinar el mismo ingrediente para un problema distinto no cuenta como
  // repetición. Se reinicia al cambiar de especie (contexto nuevo).
  const [appliedIcons,setAppliedIcons]=React.useState({});
  React.useEffect(()=>{setAppliedIcons({});},[sKey]);
  // Cuántas veces se recomendó/aplicó cada ingrediente en esta sesión — sin
  // esto, bestStock() en generateOptimizer siempre desempataba hacia el mismo
  // candidato "mejor por sortFn" entre alternativas igual de viables (logic-lens).
  // Por ingrediente, no por ícono (appliedIcons ya cubre eso a otro nivel).
  const [usageCounts,setUsageCounts]=React.useState({});
  React.useEffect(()=>{setUsageCounts({});},[sKey]);
  const opt=useMemo(()=>generateOptimizer(an,sKey,stockIds,recipe,optimizerINGS,lockedIds,blendedEB,optUseStock,appliedIcons,undefined,usageCounts),[an,sKey,stockIds,recipe,optimizerINGS,lockedIds,blendedEB,optUseStock,appliedIcons,usageCounts]);
  // Costo real de bodega (precio ponderado por lote FIFO, precioPonderado) vs.
  // costo de catálogo que usa an.cost/scoreCost. Antes el Perito solo conocía
  // el precio de catálogo aunque dos ingredientes del mismo rol tuvieran costo
  // de compra distinto en bodega — se muestra aparte, sin tocar el score, para
  // no introducir un cambio de comportamiento en runAutoOptimizer/scoreCost
  // que ya son consumidos en varios sitios con el costo de catálogo.
  const realCostPerKg=useMemo(()=>{
    if(!recipe.length) return null;
    let known=false;
    const total=recipe.reduce((s,r)=>{
      const pp=precioPonderado(r.id,invLotes);
      const g=effectiveINGS.find(i=>i.id===r.id);
      if(pp!=null) known=true;
      const price=pp!=null?pp:(g?g.cost:0);
      return s+price*(parseFloat(r.p)||0)/100;
    },0);
    return known?Math.round(total):null;
  },[recipe,invLotes,effectiveINGS]);
  // Similitud de Jaccard entre conjuntos de ingredientes (ignora %, solo IDs).
  const recipeSimilarity=(recA,recB)=>{
    const a=new Set(recA.map(r=>r.id)),b=new Set(recB.map(r=>r.id));
    const inter=[...a].filter(x=>b.has(x)).length;
    const union=new Set([...a,...b]).size;
    return union?inter/union:0;
  };
  // Historial de resultados reales para esta especie: antes cada diagnóstico
  // del Perito era puramente teórico — ahora, si ya se registró EB real (ver
  // setEbRealFor) en pruebas guardadas de la misma especie, se usa para (a)
  // mostrar qué tan preciso ha sido el modelo aquí en esta bodega y (b) avisar
  // si la receta activa se parece a una prueba ya hecha, con su resultado real.
  const trialsWithReal=useMemo(()=>saved.filter(s=>s.sKey===sKey&&s.ebReal!=null),[saved,sKey]);
  const modelAccuracy=useMemo(()=>{
    if(!trialsWithReal.length) return null;
    const avgAbsDiff=trialsWithReal.reduce((s,t)=>s+Math.abs(t.ebReal-parseFloat(t.eb)),0)/trialsWithReal.length;
    return Math.round(avgAbsDiff*10)/10;
  },[trialsWithReal]);
  const similarTrial=useMemo(()=>{
    if(!recipe.length||!trialsWithReal.length) return null;
    let best=null,bestSim=0;
    trialsWithReal.forEach(t=>{
      const sim=recipeSimilarity(recipe,t.recipe||[]);
      if(sim>bestSim){bestSim=sim;best=t;}
    });
    return bestSim>=0.5?{...best,similarity:bestSim}:null;
  },[recipe,trialsWithReal]);
  const cAn=useMemo(()=>analyze(cmpRecipe,cmpKey,effectiveINGS),[cmpRecipe,cmpKey,effectiveINGS]);
  const sch=useMemo(()=>calcSchedule(schKey,schDate,an?.eb),[schKey,schDate,an]);
  // Score de una receta guardada (Recetario/Dashboard), recalculado en vivo con
  // la matriz actual en vez de confiar en el número persistido al guardarla —
  // así una receta guardada antes de una recalibración de pesos no queda con
  // un número que ya no es comparable con las recetas nuevas.
  const liveScoreFor=e=>{
    if(!e?.recipe?.length) return 0;
    const a2=analyze(e.recipe,e.sKey,effectiveINGS);
    if(!a2) return 0;
    const tr2=calcTreatment(a2, e.sKey, SPP);
    // stockIds debe pasarse igual que en el Perito (línea ~768) — de lo contrario
    // scoreStock cae siempre en el guard "sin restricción" y la misma receta
    // guardada muestra un score distinto en el Recetario que al abrirla en el Formulador.
    return scoreAn(a2,{treatment:tr2,recipe:e.recipe,stockIds}).score;
  };

  const addI=id=>{if(recipe.find(r=>r.id===id)) return;setRecipe([...recipe,{id,p:10}]);};
  const [recipeHistory,setRecipeHistory]=React.useState([]);
  const applyOptStep=(apply,icon)=>{
    if(!apply) return;
    setRecipeHistory(h=>[...h,recipe]);
    setRecipe(applyOptToRecipe(recipe,apply,lockedIds,optimizerINGS));
    if(icon) setAppliedIcons(s=>({...s,[icon]:(s[icon]||0)+1}));
    const applyOps=Array.isArray(apply)?apply:[apply];
    setUsageCounts(s=>{
      const next={...s};
      applyOps.forEach(op=>{if(op&&op.id) next[op.id]=(next[op.id]||0)+1;});
      return next;
    });
  };
  const undoLastRec=()=>{
    if(recipeHistory.length===0) return;
    setRecipe(recipeHistory[recipeHistory.length-1]);
    setRecipeHistory(h=>h.slice(0,-1));
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
  const autoImprove=()=>{
    let cur=recipe;let bestScore=-1;
    for(let i=0;i<6;i++){
      const a=analyze(cur,sKey,effectiveINGS);
      if(!a) break;
      const o=generateOptimizer(a,sKey,stockIds,cur,optimizerINGS,lockedIds,blendEBWithHistory(a,histStats),optUseStock,undefined,undefined,usageCounts);
      if(o.score<=bestScore) break;
      bestScore=o.score;
      const candidates=o.items
        .filter(it=>it.apply&&(it.priority==='critical'||it.priority==='warning'))
        .sort((x,y)=>(y.predictedScore??-1)-(x.predictedScore??-1))
        .slice(0,3);
      if(!candidates.length) break;
      let bestCandScore=-1,bestCandidate=null,bestA2=null,bestO2=null;
      for(const cand of candidates){
        const tryRec=applyOptToRecipe(cur,cand.apply,lockedIds,optimizerINGS);
        const tryA=analyze(tryRec,sKey,effectiveINGS);
        if(!tryA) continue;
        const tryO=generateOptimizer(tryA,sKey,stockIds,tryRec,optimizerINGS,lockedIds,blendEBWithHistory(tryA,histStats),optUseStock,undefined,undefined,usageCounts);
        if(tryO.score>bestCandScore){bestCandScore=tryO.score;bestCandidate=tryRec;bestA2=tryA;bestO2=tryO;}
      }
      if(!bestCandidate) break;
      const candidate=bestCandidate;
      const a2=bestA2;
      if(!a2) break;
      const o2=bestO2;
      if(o2.score<=o.score) break; // no aceptar si no mejora el score global
      cur=candidate;
    }
    setRecipe(cur);
  };
  // Impresión de la Hoja de Producción.
  // ── openPrintWindow: abre una ventana nueva con la hoja de producción y la imprime.
  // Usa getComputedStyle para resolver variables CSS (oklab, etc.) antes de escribir la ventana.
  // Recoge solo <style> inline (sin CORS) para evitar ventana en blanco.
  const openPrintWindow=(mode)=>{
    const el=document.querySelector('.prod-sheet');
    if(!el){setNoticeDlg({msg:'Genera la hoja primero (debe haber una receta activa).'});return;}
    el.querySelectorAll('input').forEach(inp=>inp.setAttribute('value',inp.value));
    const nombre=(an?.sp?.name||'Sustrato').replace(/\s+/g,'_');
    const fecha=prodDate||new Date().toISOString().slice(0,10);
    const lote=prodLoteNum?'_'+prodLoteNum.replace(/\s+/g,'-'):'';
    const filename='HojaProd_'+nombre+lote+'_'+fecha;
    // Resolver variables CSS a valores concretos (evita color-mix/oklab en la ventana nueva)
    const rs=getComputedStyle(document.documentElement);
    const varLines=[];
    for(let i=0;i<rs.length;i++){const p=rs[i];if(p.startsWith('--'))varLines.push(`${p}:${rs.getPropertyValue(p)};`);}
    // Solo <style> inline: sin CORS, sin hojas externas que fallan
    const inlineCSS=Array.from(document.querySelectorAll('style')).map(s=>s.textContent).join('\n');
    const fullHtml=`<!DOCTYPE html><html lang="es"><head>
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
    const pw=window.open('','_blank','width=900,height=1100');
    if(!pw){
      setNoticeDlg({title:'Ventana bloqueada',msg:'El navegador bloqueó la ventana emergente. Permite pop-ups para este sitio e inténtalo de nuevo (ícono en la barra de direcciones → Permitir pop-ups).'});
      return;
    }
    pw.document.open();
    pw.document.write(fullHtml);
    pw.document.close();
    pw.document.title=filename;
    setTimeout(()=>{if(pw&&!pw.closed){pw.focus();pw.print();}},900);
  };
  const printProdSheet=()=>openPrintWindow('print');
  // Exporta la hoja como PDF — misma ventana, mismo mecanismo; el usuario elige "Guardar como PDF".
  const exportPDF=()=>openPrintWindow('pdf');
  // ── Ejecutar Lote: muestra modal de confirmación antes de descontar inventario ──
  const ejecutarLote=(rows,loteNum,fecha)=>{
    if(!rows||!rows.length) return;
    const preview=rows.filter(x=>x.g).map(x=>{
      const krKg=x.grR/1000;
      const stockActual=invLotes.filter(l=>l.activo&&l.ingredienteId===x.g.id).reduce((s,l)=>s+l.cantidadKgDisponible,0);
      return{id:x.g.id,name:x.g.name,krKg,stockActual,ok:stockActual>=krKg*0.999};
    });
    setLoteBatchConfirm({preview,loteNum,fecha});
  };
  const confirmarEjecucion=()=>{
    if(!loteBatchConfirm) return;
    const{preview,loteNum,fecha}=loteBatchConfirm;
    const now=new Date().toISOString();
    setInvLotes(prev=>{
      const updated=consumirInventarioFIFOLocal(prev,preview);
      try{localStorage.setItem('sdp_lotes',JSON.stringify(updated));}catch(e){}
      return updated;
    });
    const ts=Date.now();
    const newMovs=preview.map((row,i)=>({id:'mov_lote_'+ts+'_'+i,tipo:'consumo_lote',ingredienteId:row.id,kgMovidos:row.krKg,loteNum:loteNum||'—',fecha,nota:`Lote ${loteNum||'—'} · ${fecha}`,timestamp:now}));
    saveMovimientos([...invMovimientos,...newMovs]);
    setLoteBatchConfirm(null);
    setLoteSyncErr('');
    // localStorage ya descontó al instante (mismo patrón que saveR): la transacción de
    // Firestore corre en segundo plano y es la que de verdad evita el doble descuento
    // entre operadores/dispositivos concurrentes — un fallo de red no bloquea al operador,
    // solo se avisa si no sincronizó.
    if(window.SetasDB){
      (async()=>{
        try{
          for(const row of preview){
            await window.SetasDB.descontarInventarioFIFO(row.id, row.krKg);
          }
          await window.SetasDB.crearLoteProduccion({
            codigo: loteNum || ('LOTE-'+ts),
            especie: SPP[sKey]?.name || sKey,
            camara: '—',
            operador: '—',
            receta: { ingredientes: recipe.map(r=>({id:r.id,pct:parseFloat(r.p)||0})) },
          });
        }catch(err){
          setLoteSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));
        }
      })();
    }
  };
  // ── Bitácora helpers ──
  const buildBitNuevoForm=()=>{
    const today=new Date().toISOString().split('T')[0];
    const sp=SPP[sKey];const tr=an?calcTreatment(an, sKey, SPP):null;
    const SC={p_ostreatus_gris:'OST',p_ostreatus_blanco:'OBL',p_djamor_rosa:'ROS',p_eryngii:'ERY',shiitake:'SHI',lions_mane:'MEL',reishi:'REI',enoki:'ENO',nameko:'NAM'};
    const sppCode=SC[sKey]||'EXP';const dc=today.replace(/-/g,'').slice(2);
    const cnt=bitLotes.length+1;const nb=prodBags||6;const kb=prodKg||1.5;const hm=prodH||67;
    return{
      codigo:`SDP-${dc}-${sppCode}-R${String(cnt).padStart(2,'0')}`,
      especie:sp?.name||'',especieCientifico:sp?.scientific||'',cepa:'',
      fechaMezcla:today,fechaInoculacion:today,
      numBolsas:nb,pesoHumedo:kb,peseSeco:parseFloat((nb*kb*(1-hm/100)).toFixed(3)),
      spawnPct:an?.dynSpawn||tr?.spawn||8,humedad:hm,tratamiento:tr?.name||'',
      costoIngKg:an?Math.round(an.cost):0,operador:'',objetivo:'',notas:'',
      estado:'incubacion',veredicto:'',
      recipeRef:recipe.length&&balanced?{id:Date.now(),name:saveName||'Receta activa',sKey,recipe:[...recipe],cn:an.cn.toFixed(1),eb:an.eb.toFixed(0),score:opt.score,cost:Math.round(an.cost)}:null,
    };
  };
  const bitQuotaWarn=()=>setNoticeDlg({title:'No se pudo guardar',msg:'El almacenamiento local está lleno y el cambio no quedó guardado. Elimina fotos de bolsas antiguas (clic sobre la foto para quitarla) y vuelve a intentar.'});
  const crearBitLote=(form)=>{
    const lote={...form,id:'BIT_'+Date.now(),createdAt:new Date().toISOString()};
    const nb=parseInt(form.numBolsas)||1;const ts=Date.now();
    const bolsas=Array.from({length:nb},(_,i)=>({id:'BOLSA_'+ts+'_'+i,loteId:lote.id,codigo:`${lote.codigo}-B${String(i+1).padStart(2,'0')}`,num:i+1,estado:'sana',col25:null,col50:null,col100:null,pesoInicial:form.pesoHumedo||1.5,fechaDescarte:null,motivoDescarte:'',observaciones:'',foto:null}));
    setBitLotes(prev=>{const upd=[lote,...prev];try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){bitQuotaWarn();}return upd;});
    setBitBolsas(prev=>{const upd=[...prev,...bolsas];try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){bitQuotaWarn();}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{
          await window.SetasBitacoraDB.guardarLote(lote);
          await window.SetasBitacoraDB.guardarBolsas(bolsas);
          setBitSyncErr('');
        }catch(err){
          setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));
        }
      })();
    }
    return lote.id;
  };
  const updateBitLote=(loteId,fields)=>{
    setBitLotes(prev=>{const upd=prev.map(l=>l.id===loteId?{...l,...fields}:l);try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){bitQuotaWarn();}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.actualizarLote(loteId,fields);setBitSyncErr('');}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
  const updateBitBolsa=(bolsaId,fields)=>{
    const fechaKey=['col25','col50','col100'].find(k=>k in fields);
    if(fechaKey&&fields[fechaKey]){
      const bolsa=bitBolsas.find(b=>b.id===bolsaId);
      const lote=bolsa&&bitLotes.find(l=>l.id===bolsa.loteId);
      if(lote&&!window.SetasBitacora.isFechaColValida(fields[fechaKey],lote.fechaInoculacion)){
        setNoticeDlg({title:'Fecha inválida',msg:'La fecha de colonización no puede ser anterior a la fecha de inoculación del lote ('+lote.fechaInoculacion+').'});
        return;
      }
    }
    setBitBolsas(prev=>{const upd=prev.map(b=>b.id===bolsaId?{...b,...fields}:b);try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){bitQuotaWarn();}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.actualizarBolsa(bolsaId,fields);setBitSyncErr('');}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
  const addBitCosecha=(cosecha)=>{
    const e={...cosecha,id:'COS_'+Date.now()};
    setBitCosechas(prev=>{const upd=[...prev,e];try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(err){bitQuotaWarn();}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.guardarCosecha(e);setBitSyncErr('');}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
  const deleteBitCosecha=(id)=>{
    setBitCosechas(prev=>{const upd=prev.filter(c=>c.id!==id);try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(e){}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.eliminarCosecha(id);setBitSyncErr('');}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
  const deleteBitLote=(loteId)=>{
    const doDelete=()=>{
      const bolsaIds=bitBolsas.filter(b=>b.loteId===loteId).map(b=>b.id);
      const cosechaIds=bitCosechas.filter(c=>c.loteId===loteId).map(c=>c.id);
      setBitLotes(prev=>{const upd=prev.filter(l=>l.id!==loteId);try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){}return upd;});
      setBitBolsas(prev=>{const upd=prev.filter(b=>b.loteId!==loteId);try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){}return upd;});
      setBitCosechas(prev=>{const upd=prev.filter(c=>c.loteId!==loteId);try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(e){}return upd;});
      if(bitActiveLoteId===loteId){setBitActiveLoteId(null);goBitTab('bit_dash');}
      if(window.SetasBitacoraDB){
        (async()=>{
          try{await window.SetasBitacoraDB.eliminarLoteCascade(loteId,bolsaIds,cosechaIds);setBitSyncErr('');}
          catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
        })();
      }
    };
    setConfirmDlg({title:'Eliminar lote',msg:'¿Eliminar este lote y todas sus bolsas y cosechas? Esta acción no se puede deshacer.',danger:true,confirmLabel:'Eliminar',onConfirm:doDelete});
  };
  // Cálculo puro en bitacora-model.js (testeado por separado) — aquí solo se
  // resuelve el loteId contra el estado de React y se delega.
  const calcLoteStats=(loteId)=>{
    const lote=bitLotes.find(lt=>lt.id===loteId);if(!lote) return null;
    return window.SetasBitacora.calcLoteStats(lote,bitBolsas.filter(b=>b.loteId===loteId),bitCosechas.filter(c=>c.loteId===loteId));
  };
  const calcLoteScore=(stats)=>window.SetasBitacora.calcLoteScore(stats);
  // Genera la receta óptima para la especie activa con toda la paleta y la carga
  const loadOptimal=()=>{
    try{
      const r=runHybridRecipeSearch({
        targetKey:sKey,
        recipe:[],
        invLotes,
        maxCost:0,
        ingredients:optimizerINGS,
        useStock:false,
        profileKey:'produccion',
        stockMap:{},
      });
      if(r.ranked?.length){setRecipe(r.ranked[0].recipe);setLockedIds([]);}
      else setNoticeDlg({msg:'No se encontró una combinación óptima para esta especie con los ingredientes disponibles.'});
    }catch(e){
      setNoticeDlg({msg:'No se pudo ejecutar el optimizador híbrido: '+(e.message||'error desconocido')});
    }
  };
  const updP=(id,p)=>{
    if(!normMode){setRecipe(recipe.map(r=>r.id===id?{...r,p}:r));return;}
    const pVal=Math.max(0,Math.min(100,parseFloat(p)||0));
    const free=recipe.filter(r=>r.id!==id&&!lockedIds.includes(r.id));
    const sumLocked=recipe.filter(r=>r.id!==id&&lockedIds.includes(r.id)).reduce((s,r)=>s+(parseFloat(r.p)||0),0);
    const remaining=Math.max(0,100-pVal-sumLocked);
    const sumFree=free.reduce((s,r)=>s+(parseFloat(r.p)||0),0);
    setRecipe(recipe.map(r=>{
      if(r.id===id) return{...r,p:pVal};
      if(lockedIds.includes(r.id)) return r;
      if(sumFree===0) return{...r,p:Math.round((remaining/free.length)*10)/10};
      return{...r,p:Math.round((parseFloat(r.p)/sumFree)*remaining*10)/10};
    }));
  };
  const remI=id=>setRecipe(recipe.filter(r=>r.id!==id));

  const toggleLock=id=>setLockedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);


  // ── v4: helpers persistencia inventario
  const saveProveedores=list=>{setInvProveedores(list);try{localStorage.setItem('sdp_proveedores',JSON.stringify(list));}catch(e){}};
  const saveCompras=list=>{setInvCompras(list);try{localStorage.setItem('sdp_compras',JSON.stringify(list));}catch(e){}};
  const saveLotes=list=>{setInvLotes(list);try{localStorage.setItem('sdp_lotes',JSON.stringify(list));}catch(e){}};
  const saveMovimientos=list=>{setInvMovimientos(list);try{localStorage.setItem('sdp_movimientos',JSON.stringify(list));}catch(e){}};

  const agregarProveedor=()=>{
    const n=newProv.nombre.trim();if(!n||!newProv.municipio.trim()) return;
    const prov={id:'prov_'+Date.now(),nombre:n,tipo:newProv.tipo,municipio:newProv.municipio.trim()};
    const list=[...invProveedores,prov];
    saveProveedores(list);
    setCmpProvId(prov.id);
    setNewProv({nombre:'',tipo:'plaza',municipio:''});
    setShowProvModal(false);
  };

  const eliminarProveedor=id=>{
    setConfirmDlg({title:'Eliminar proveedor',msg:'¿Eliminar este proveedor? Esta acción no se puede deshacer.',danger:true,confirmLabel:'Eliminar',onConfirm:()=>saveProveedores(invProveedores.filter(p=>p.id!==id))});
  };

  const addCmpItem=()=>setCmpItems(prev=>[...prev,{uid:Date.now(),ingId:'',kg:'',precio:''}]);
  const updCmpItem=(uid,field,val)=>setCmpItems(prev=>prev.map(it=>it.uid===uid?{...it,[field]:val}:it));
  const remCmpItem=uid=>setCmpItems(prev=>prev.filter(it=>it.uid!==uid));

  // ── Captura automática de compras (foto de recibo / texto pegado) ──
  const fileToBase64=file=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(file);});
  // Redimensiona y recomprime una foto a JPEG antes de guardarla como dataURL en localStorage —
  // una foto de celular sin comprimir (2-4 MB) agota rápido la cuota de ~5 MB del navegador.
  const compressImageToDataURL=(file,maxDim=1280,quality=0.72)=>new Promise((resolve,reject)=>{
    const img=new Image();
    const url=URL.createObjectURL(file);
    img.onload=()=>{
      let w=img.naturalWidth,h=img.naturalHeight;
      if(w>maxDim||h>maxDim){const scale=maxDim/Math.max(w,h);w=Math.round(w*scale);h=Math.round(h*scale);}
      const canvas=document.createElement('canvas');
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg',quality));
    };
    img.onerror=e=>{URL.revokeObjectURL(url);reject(e);};
    img.src=url;
  });
  // Empareja un nombre (de la IA o pegado) contra una lista con {id,<getName>} por
  // coincidencia exacta y luego por substring — solo si el substring tiene largo
  // suficiente (evita falsos positivos con fragmentos cortos tipo "el"/"sas") y solo
  // si es inequívoco (si matchean 2+ candidatos por substring, no se autocompleta).
  const matchByName=(list,getName,nombre,minSubstringLen=4)=>{
    if(!nombre) return '';
    const n=String(nombre).toLowerCase().trim();
    if(!n) return '';
    const exact=list.find(x=>getName(x).toLowerCase()===n||x.id===n);
    if(exact) return exact.id;
    if(n.length<minSubstringLen) return '';
    const subHits=list.filter(x=>{
      const gn=getName(x).toLowerCase();
      return (gn.length>=minSubstringLen&&gn.includes(n))||(n.length>=minSubstringLen&&n.includes(gn));
    });
    return subHits.length===1?subHits[0].id:'';
  };
  const matchIngId=nombre=>matchByName(INGS,g=>g.name,nombre);
  // Empareja el nombre de proveedor que devuelve la IA contra los proveedores ya
  // registrados — solo precarga si hay coincidencia inequívoca; nunca crea proveedores nuevos.
  const matchProvId=nombre=>matchByName(invProveedores,p=>p.nombre,nombre);
  const applyParsedItems=parsed=>{
    const items=Array.isArray(parsed)?parsed:(parsed&&Array.isArray(parsed.items)?parsed.items:null);
    if(!items||!items.length){setCmpParseErr('No se detectaron ítems. Prueba con Manual.');setHuboParseIA(false);return;}
    const mapped=items.map((p,i)=>({uid:Date.now()+i,ingId:matchIngId(p.ingrediente||p.nombre||''),kg:p.kg||p.cantidad||'',precio:p.precio||p.precio_kg||''}));
    setCmpItems(mapped);
    setHuboParseIA(true);
    if(parsed&&!Array.isArray(parsed)){
      if(parsed.proveedor){const pid=matchProvId(parsed.proveedor);if(pid) setCmpProvId(pid);}
      if(parsed.fecha&&/^\d{4}-\d{2}-\d{2}$/.test(parsed.fecha)) setCmpFecha(parsed.fecha);
    }
    setCmpMode('manual');
  };
  // Acepta tanto el formato nuevo {proveedor,fecha,items:[...]} como un array plano de
  // ítems (compatibilidad con respuestas que no incluyan proveedor/fecha).
  const extraerJSON=txt=>{
    // Solo se acepta el objeto {proveedor,fecha,items} si de verdad trae la clave
    // "items" — si no, un array plano en formato legado (p.ej. un solo ítem suelto)
    // podría matchear las llaves de su único elemento y perder el resto de la data.
    const objMatch=txt.match(/\{[\s\S]*\}/);
    if(objMatch){
      try{
        const o=JSON.parse(objMatch[0]);
        if(o&&typeof o==='object'&&Array.isArray(o.items)) return o;
      }catch(e){}
    }
    const arrMatch=txt.match(/\[[\s\S]*\]/);
    if(arrMatch) return JSON.parse(arrMatch[0]);
    return JSON.parse(objMatch?objMatch[0]:txt);
  };
  const CMP_MAX_BYTES=10*1024*1024;
  // Ejecuta el parseo de una foto/PDF ya codificado — separado de capturarFoto para
  // poder reintentar (botón "Reintentar") sin pedirle al usuario que resuba el archivo.
  const parseFotoPayload=async(fileBlock,esPDF)=>{
    setCmpParsing(true);setCmpParseErr('');
    try{
      const listaIngs=INGS.map(g=>g.name).join(', ');
      const resp=await window.claude.complete({messages:[{role:'user',content:[
        fileBlock,
        {type:'text',text:`Esta es ${esPDF?'un PDF':'una foto'} de una factura/recibo de compra de insumos para cultivo de hongos. Puede tener varias páginas o incluir varias facturas: extrae los ítems de todas ellas. Devuelve JSON puro (sin texto ni markdown) con esta forma: {"proveedor":"nombre del proveedor/vendedor tal cual aparece, o null si no aparece","fecha":"YYYY-MM-DD de la compra/factura, o null si no aparece","items":[{"ingrediente":"nombre tal cual","kg":numero,"precio":numero_precio_por_kg_COP}]}. Si el recibo trae precio total por línea en vez de precio por kg, calcula precio/kg dividiendo entre los kg. Ignora subtotales, impuestos y totales generales — solo ítems comprados. Ingredientes conocidos del inventario (usa el más parecido si aplica): ${listaIngs}.`}
      ]}]});
      try{
        applyParsedItems(extraerJSON(resp));
      }catch(parseErr){
        setCmpParseErr(`No se pudo interpretar la respuesta para ${esPDF?'el PDF':'la foto'}. Revisa que sea legible o usa Manual.`);
      }
    }catch(err){setCmpParseErr(`No se pudo leer ${esPDF?'el PDF':'la foto'}. Intenta de nuevo o usa Manual.`);}
    setCmpParsing(false);
  };
  const capturarFoto=async e=>{
    const file=e.target.files&&e.target.files[0]; if(!file) return;
    const esPDF=file.type==='application/pdf'||/\.pdf$/i.test(file.name||'');
    if(file.size>CMP_MAX_BYTES){
      setCmpParseErr(`El archivo pesa ${(file.size/1024/1024).toFixed(1)} MB — el máximo es 10 MB. Comprime ${esPDF?'el PDF':'la foto'} o usa Manual.`);
      e.target.value=''; return;
    }
    if(!window.claude||typeof window.claude.complete!=='function'){
      setCmpParseErr('La lectura automática no está disponible en este entorno. Usa Manual para cargar los ítems.');
      e.target.value=''; return;
    }
    setCmpParseErr('');setHuboParseIA(false);setCmpParsing(true);setCmpFuente('ocr');
    try{
      const b64=await fileToBase64(file);
      const fileBlock=esPDF
        ?{type:'document',source:{type:'base64',media_type:'application/pdf',data:b64}}
        :{type:'image',source:{type:'base64',media_type:file.type||'image/jpeg',data:b64}};
      setCmpLastFoto({fileBlock,esPDF,name:file.name});
      await parseFotoPayload(fileBlock,esPDF);
    }catch(err){setCmpParsing(false);setCmpParseErr(`No se pudo leer ${esPDF?'el PDF':'la foto'}. Intenta de nuevo o usa Manual.`);}
    e.target.value='';
  };
  const reintentarFoto=()=>{
    if(!cmpLastFoto||cmpParsing) return;
    setHuboParseIA(false);setCmpFuente('ocr');
    parseFotoPayload(cmpLastFoto.fileBlock,cmpLastFoto.esPDF);
  };
  const parsearTexto=async()=>{
    if(!cmpPasteText.trim()) return;
    setCmpParsing(true);setCmpParseErr('');setHuboParseIA(false);setCmpFuente('email');
    try{
      const listaIngs=INGS.map(g=>g.name).join(', ');
      const resp=await window.claude.complete({messages:[{role:'user',content:`Este es un mensaje (email o WhatsApp) de un proveedor confirmando una compra de insumos para cultivo de hongos:\n\n"""${cmpPasteText}"""\n\nDevuelve JSON puro (sin texto ni markdown) con esta forma: {"proveedor":"nombre del proveedor tal cual aparece, o null si no aparece","fecha":"YYYY-MM-DD de la compra, o null si no aparece","items":[{"ingrediente":"nombre","kg":numero,"precio":numero_precio_por_kg_COP}]}. Ingredientes conocidos: ${listaIngs}.`}]});
      applyParsedItems(extraerJSON(resp));
    }catch(err){setCmpParseErr('No se pudo interpretar el texto. Intenta de nuevo o usa Manual.');}
    setCmpParsing(false);
  };

  const registrarCompra=()=>{
    const valid=cmpItems.filter(it=>it.ingId&&parseFloat(it.kg)>0);
    if(!cmpProvId||valid.length===0){setNoticeDlg({msg:'Selecciona proveedor y agrega al menos un ítem.'});return;}
    const cId='compra_'+Date.now();
    const nuevaCompra={id:cId,fecha:cmpFecha,proveedorId:cmpProvId,
      items:valid.map(it=>({ingredienteId:it.ingId,kg:parseFloat(it.kg),precio:parseFloat(it.precio)||0})),
      fuenteCaptura:cmpFuente,revisadoManualmente:true};
    const newLotes=valid.map((it,i)=>({
      id:'lote_'+Date.now()+'_'+i,compraId:cId,
      ingredienteId:it.ingId,cantidadKgTotal:parseFloat(it.kg),
      precioPorKgCOP:parseFloat(it.precio)||0,fechaIngreso:cmpFecha,
      cantidadKgDisponible:parseFloat(it.kg),activo:true
    }));
    const newMovs=newLotes.map(l=>({
      id:'mov_'+Date.now()+'_'+l.id,loteId:l.id,ingredienteId:l.ingredienteId,
      tipo:'entrada',cantidadKg:l.cantidadKgTotal,fecha:cmpFecha,referencia:cId
    }));
    saveCompras([...invCompras,nuevaCompra]);
    saveLotes([...invLotes,...newLotes]);
    saveMovimientos([...invMovimientos,...newMovs]);
    const prov=invProveedores.find(p=>p.id===cmpProvId);
    const resumen=valid.map(it=>{
      const g=INGS.find(x=>x.id===it.ingId);
      const stockPrevio=invLotes.filter(l=>l.activo&&l.ingredienteId===it.ingId).reduce((s,l)=>s+l.cantidadKgDisponible,0);
      return{nombre:g?g.name:it.ingId,kgComprado:parseFloat(it.kg),stockNuevo:stockPrevio+parseFloat(it.kg)};
    });
    setCmpConfirm({proveedor:prov?prov.nombre:'',fecha:cmpFecha,total:valid.reduce((s,it)=>s+(parseFloat(it.kg)||0)*(parseFloat(it.precio)||0),0),items:resumen});
    setCmpItems([{uid:Date.now(),ingId:'',kg:'',precio:''}]);
    setCmpMode('manual');setCmpPasteText('');setCmpFuente('manual');setHuboParseIA(false);setCmpLastFoto(null);
  };

  const autoBalance=(mode=balanceMode)=>{
    if(recipe.length===0) return;
    const free=recipe.filter(r=>!lockedIds.includes(r.id));
    if(free.length===0) return;
    const sumLocked=recipe.filter(r=>lockedIds.includes(r.id)).reduce((s,r)=>s+(parseFloat(r.p)||0),0);
    const target=Math.max(0,100-sumLocked);
    if(mode==='proportional'){
      const sumFree=free.reduce((s,r)=>s+(parseFloat(r.p)||0),0);
      if(sumFree===0){
        const eq=Math.round((target/free.length)*10)/10;
        setRecipe(recipe.map(r=>lockedIds.includes(r.id)?r:{...r,p:eq}));
      } else {
        const factor=target/sumFree;
        setRecipe(recipe.map(r=>lockedIds.includes(r.id)?r:{...r,p:Math.round(parseFloat(r.p)*factor*10)/10}));
      }
    } else if(mode==='equal'){
      const eq=Math.round((target/free.length)*10)/10;
      setRecipe(recipe.map(r=>lockedIds.includes(r.id)?r:{...r,p:eq}));
    } else {
      // 'last': ajusta el último ingrediente libre
      const lastFree=[...recipe].reverse().find(r=>!lockedIds.includes(r.id));
      if(!lastFree) return;
      const sumOthers=recipe.reduce((s,r)=>r.id!==lastFree.id?s+(parseFloat(r.p)||0):s,0);
      const newP=Math.max(0,Math.round((100-sumOthers)*10)/10);
      setRecipe(recipe.map(r=>r.id===lastFree.id?{...r,p:newP}:r));
    }
  };
  const exportR=()=>{
    if(!recipe.length) return;
    const t=calcTreatment(an, sKey, SPP);const batch=calcBatch(recipe,numBags,kgBag,67,12000,INGS,an?.dynSpawn);
    let txt=`SETAS DE LA PEÑA — FICHA DE RECETA\nValle de Tenjo · ${new Date().toLocaleDateString('es-CO')}\n${'─'.repeat(44)}\nESPECIE: ${sp.name} (${sp.scientific})\n\nINGREDIENTES:\n`;
    recipe.forEach(r=>{const g=INGS.find(i=>i.id===r.id);if(g) txt+=`  ${g.name.padEnd(32)}${r.p}%\n`;});
    if(an) txt+=`\nANÁLISIS:\n  C:N ${an.cn.toFixed(1)}:1  ·  N ${an.avgN.toFixed(2)}%  ·  EB ${an.eb.toFixed(0)}%  ·  $${Math.round(an.cost)}/kg\n`;
    if(t) txt+=`\nTRATAMIENTO: ${t.name}\n  ${t.temp}  ·  ${t.time}  ·  Spawn ${t.spawn}%\n  ${t.prep}\n`;
    if(batch){txt+=`\nBATCH (${numBags}×${kgBag} kg):\n`;batch.items.forEach(i=>{txt+=`  ${i.name.padEnd(32)}${i.unit.padStart(9)}  $${Math.round(i.cost).toLocaleString()}\n`;});txt+=`  Spawn ${batch.spawn.toFixed(2)} kg  ·  TOTAL $${Math.round(batch.cost).toLocaleString()} COP\n`;}
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));a.download=`receta_${sp.name.replace(/\s+/g,'_')}.txt`;a.click();
  };

  const CVal=({av,bv,hb=true})=>{
    const an2=parseFloat(av)||0,bn2=parseFloat(bv)||0;
    const ac=an2===bn2?'':(hb?(an2>bn2?'better':'worse'):(an2<bn2?'better':'worse'));
    const bc=an2===bn2?'':(hb?(bn2>an2?'better':'worse'):(bn2<an2?'better':'worse'));
    return <><span className={`cval ${ac}`}>{av}</span><span className={`cval ${bc}`}>{bv}</span></>;
  };
  const BodegaSection=()=>(

          <div>
            <div className="panel">
              {/* STATS ROW — editorial */}
              <div className="inv-stat-row">
                <div className="inv-stat">
                  <div className="inv-stat-val">{[...new Set(invLotes.filter(l=>l.activo&&l.cantidadKgDisponible>0).map(l=>l.ingredienteId))].length}</div>
                  <div className="inv-stat-lbl">En stock</div>
                </div>
                <div className="inv-stat">
                  <div className="inv-stat-val">{invLotes.filter(l=>l.activo).reduce((s,l)=>s+l.cantidadKgDisponible,0).toFixed(1)}</div>
                  <div className="inv-stat-lbl">kg disp.</div>
                </div>
                <div className="inv-stat">
                  <div className="inv-stat-val">{invCompras.length}</div>
                  <div className="inv-stat-lbl">Compras</div>
                </div>
                <div className="inv-stat">
                  <div className="inv-stat-val">{invProveedores.length}</div>
                  <div className="inv-stat-lbl">Proveedores</div>
                </div>
              </div>

              {/* SUB-TABS */}
              <div className="inv-subtab-bar">
                {[['stock','Stock'],['compra','Compra'],['historial','Historial'],['proveedores','Proveedores']].map(([k,l])=>(
                  <button key={k} className={`inv-subtab${invTab===k?' on':''}`} onClick={()=>setInvTab(k)}>{l}</button>
                ))}
              </div>

              {/* ── STOCK ACTUAL ─────────────────────────────────────────── */}
              {invTab==='stock'&&(
                <div>
                  {(()=>{
                    const ingIds=[...new Set(invLotes.filter(l=>l.activo).map(l=>l.ingredienteId))];
                    if(!ingIds.length) return(
                      <div style={{textAlign:'center',padding:'32px 20px',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--border-soft)',border:'1px dashed var(--border-soft)',borderRadius:'var(--r-sm)'}}>
                        Sin inventario.
                        <div><button className="inv-btn inv-btn-pri" style={{marginTop:12}} onClick={()=>setInvTab('compra')}>Registrar primera compra →</button></div>
                      </div>
                    );
                    const rows=ingIds.map(id=>{
                      const g=INGS.find(i=>i.id===id);
                      const stock=stockActual(id,invLotes);
                      const pp=precioPonderado(id,invLotes);
                      const alertaMin=alertaConfig[id]??2;
                      const alertaAm=alertaMin*2.5;
                      const dotColor=stock<alertaMin?'var(--coral-500)':stock<alertaAm?'var(--ochre-500,#A07828)':'var(--accent-olive)';
                      const provId=provOverride[id]||(invProveedores.find(p=>p.id===invCompras.find(c=>c.id===invLotes.filter(l=>l.activo&&l.ingredienteId===id).sort((a,b)=>new Date(b.fechaIngreso)-new Date(a.fechaIngreso))[0]?.compraId)?.proveedorId)?.id)||'';
                      const prov=invProveedores.find(p=>p.id===provId);
                      return{id,name:g?.name||id,stock,pp,prov,dotColor,alertaMin,provId};
                    }).sort((a,b)=>b.stock-a.stock);
                    const INP={fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",border:'1px solid var(--coral-500)',borderRadius:'var(--r-xs)',padding:'4px 6px',background:'var(--paper-50)',color:'var(--ink-900)',outline:'none',width:'100%',boxSizing:'border-box'};
                    return(
                      <div className="inv-section">
                        <table className="inv-table">
                          <thead>
                            <tr>
                              <th>Ingrediente</th>
                              <th>Stock (kg)</th>
                              <th>Precio / kg</th>
                              <th>Proveedor</th>
                              <th>Alerta mín. (kg)</th>
                              <th>Estado</th>
                              <th style={{width:80}}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(r=>{
                              const isEditing=editingRowId===r.id;
                              return(
                                <tr key={r.id} style={{background:isEditing?'var(--paper-200)':''}}>
                                  {/* INGREDIENTE */}
                                  <td style={{fontFamily:"var(--font-body)",fontSize:"var(--text-base)",minWidth:160}}>
                                    {isEditing?(
                                      <select value={editingRowData.ingredienteNuevoId||r.id} onChange={e=>setEditingRowData(p=>({...p,ingredienteNuevoId:e.target.value}))} style={{...INP,fontSize:"var(--text-sm)"}}>
                                        {INGS.sort((a,b)=>a.name.localeCompare(b.name,'es')).map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
                                      </select>
                                    ):(
                                      <><span className="stock-dot" style={{background:r.dotColor}}/>{r.name}</>
                                    )}
                                  </td>
                                  {/* STOCK */}
                                  <td style={{fontFamily:"var(--font-num)",fontSize:"var(--text-md)",fontWeight:600,color:r.dotColor,minWidth:90}}>
                                    {isEditing?(
                                      <input type="number" min="0" step="0.5"
                                        value={editingRowData.stock}
                                        onChange={e=>setEditingRowData(p=>({...p,stock:e.target.value}))}
                                        onKeyDown={e=>{if(e.key==='Enter') saveRowEdit(r.id);if(e.key==='Escape') setEditingRowId(null);}}
                                        style={{...INP,width:80,fontWeight:600}}
                                      />
                                    ):(
                                      <span>{r.stock.toFixed(1)} kg</span>
                                    )}
                                  </td>
                                  {/* PRECIO */}
                                  <td style={{color:'var(--ink-500)',minWidth:100}}>
                                    {isEditing?(
                                      <input type="number" min="0" step="100"
                                        value={editingRowData.precio}
                                        onChange={e=>setEditingRowData(p=>({...p,precio:e.target.value}))}
                                        style={INP}
                                        placeholder="$/kg"
                                      />
                                    ):(
                                      r.pp!=null?`$${Math.round(r.pp).toLocaleString('es-CO')}/kg`:'—'
                                    )}
                                  </td>
                                  {/* PROVEEDOR */}
                                  <td style={{color:'var(--ink-500)',fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",minWidth:130}}>
                                    {isEditing?(
                                      <select value={editingRowData.proveedorId} onChange={e=>setEditingRowData(p=>({...p,proveedorId:e.target.value}))} style={{...INP,fontSize:"var(--text-sm)"}}>
                                        <option value="">Sin especificar</option>
                                        {invProveedores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                                      </select>
                                    ):(
                                      r.prov?.nombre||'—'
                                    )}
                                  </td>
                                  {/* ALERTA MÍN */}
                                  <td style={{minWidth:90}}>
                                    {isEditing?(
                                      <input type="number" min="0" step="0.5"
                                        value={editingRowData.alertaMin}
                                        onChange={e=>setEditingRowData(p=>({...p,alertaMin:e.target.value}))}
                                        style={INP}
                                        placeholder="kg"
                                      />
                                    ):(
                                      <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-500)'}}>{r.alertaMin} kg</span>
                                    )}
                                  </td>
                                  {/* ESTADO */}
                                  <td>
                                    {r.stock<r.alertaMin
                                      ?<span style={{color:'var(--coral-500)',fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",fontWeight:700}}>Crítico</span>
                                      :r.stock<r.alertaMin*2.5
                                        ?<span style={{color:'var(--ochre-500,#A07828)',fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)"}}>Bajo</span>
                                        :<span style={{color:'var(--accent-olive)',fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)"}}>OK</span>}
                                  </td>
                                  {/* ACCIONES */}
                                  <td>
                                    {isEditing?(
                                      <div style={{display:'flex',gap:4}}>
                                        <button className="inv-btn inv-btn-pri inv-btn-sm" onClick={()=>saveRowEdit(r.id)} title="Guardar">✓</button>
                                        <button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>setEditingRowId(null)} title="Cancelar">✕</button>
                                      </div>
                                    ):(
                                      <div style={{display:'flex',gap:4}}>
                                        <button className="inv-btn inv-btn-sec inv-btn-sm" title="Editar fila completa"
                                          onClick={()=>{setEditingRowId(r.id);setEditingRowData({stock:r.stock.toFixed(1),precio:r.pp!=null?Math.round(r.pp):'',proveedorId:r.provId||'',alertaMin:r.alertaMin,ingredienteNuevoId:r.id});}}>
                                          ✎ Editar
                                        </button>
                                        <button className="inv-btn inv-btn-sm" title="Eliminar stock de este ingrediente"
                                          style={{background:'var(--coral-500)',color:'var(--paper-0)',border:'none'}}
                                          onClick={()=>eliminarIngrediente(r.id,r.name)}>
                                          ×
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                  <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                    <button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>setShowAddStockForm(v=>!v)}>＋ Agregar ingrediente al stock</button>
                    {showAddStockForm&&(
                      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',padding:'10px 12px',background:'var(--paper-100)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',width:'100%',boxSizing:'border-box'}}>
                        <select className="inv-input" style={{flex:2,minWidth:180}} value={addStockId} onChange={e=>setAddStockId(e.target.value)}>
                          <option value="">Seleccionar ingrediente…</option>
                          {INGS.map(i=>(<option key={i.id} value={i.id}>{i.name}</option>))}
                        </select>
                        <input type="number" className="inv-input" style={{width:100,flex:'none'}} placeholder="kg" min="0" step="0.5" value={addStockKg} onChange={e=>setAddStockKg(e.target.value)}/>
                        <button className="inv-btn inv-btn-pri inv-btn-sm" onClick={()=>{
                          if(!addStockId) return;
                          const kg=parseFloat(addStockKg)||0;
                          if(kg<=0) return;
                          saveStockEdit(addStockId, kg);
                          setAddStockId(''); setAddStockKg(''); setShowAddStockForm(false);
                        }}>Guardar</button>
                        <button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>{setShowAddStockForm(false);setAddStockId('');setAddStockKg('');}}>Cancelar</button>
                      </div>
                    )}
                    <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--border-soft)'}}>
                      ≥5 kg · 2–5 kg · &lt;2 kg — Clic en el número de kg para editar directamente. Enter para guardar, Esc para cancelar.
                    </span>
                  </div>
                </div>
              )}

              {/* ── REGISTRAR COMPRA ──────────────────────────────────────── */}
              {invTab==='compra'&&(
                <div style={{maxWidth:560}}>
                  {cmpConfirm?(
                    <div>
                      <div style={{padding:'14px 16px',background:'var(--moss-50,#F0F4EB)',border:'1px solid var(--moss-300,#B8C9A0)',borderRadius:'var(--r-sm)',marginBottom:14}}>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",fontWeight:700,color:'var(--ink-800)',marginBottom:2}}>✓ Compra registrada</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-500)'}}>{cmpConfirm.proveedor||'Sin proveedor'} · {cmpConfirm.fecha} · ${cmpConfirm.total.toLocaleString('es-CO')} COP</div>
                      </div>
                      <div className="inv-section" style={{marginBottom:14}}>
                        {cmpConfirm.items.map((it,i)=>(
                          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',borderBottom:i<cmpConfirm.items.length-1?'1px solid var(--border-soft)':'none'}}>
                            <div>
                              <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-base)",fontWeight:600,color:'var(--ink-800)'}}>{it.nombre}</div>
                              <div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--ink-500)'}}>+{it.kgComprado} kg comprados</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-base)",fontWeight:700,color:'var(--accent-olive)'}}>{it.stockNuevo.toFixed(1)} kg</div>
                              <div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--border-soft)'}}>stock actual</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="inv-btn inv-btn-pri" onClick={()=>setCmpConfirm(null)}>＋ Registrar otra compra</button>
                    </div>
                  ):(
                  <div>
                  <div style={{display:'flex',gap:8,marginBottom:14}}>
                    {[['manual','✎','Manual'],['foto',<IconCamera size={16}/>,'Foto / PDF'],['texto','✉','Pegar texto']].map(([v,icon,l])=>(
                      <button key={v} className="inv-btn inv-btn-sec" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'10px 8px',...(cmpMode===v?{background:'var(--ink-0)',color:'var(--paper-0)',borderColor:'var(--ink-0)'}:{})}} onClick={()=>{setCmpMode(v);setCmpParseErr('');setCmpLastFoto(null);setHuboParseIA(false);}}>
                        <span style={{fontSize:16,lineHeight:1}}>{icon}</span>
                        <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",fontWeight:700,textTransform:'uppercase',letterSpacing:'var(--tracking-label)'}}>{l}</span>
                      </button>
                    ))}
                  </div>

                  {cmpMode==='foto'&&(
                    <div style={{marginBottom:16,padding:14,border:'1px dashed var(--border-soft)',borderRadius:'var(--r-sm)',textAlign:'center'}}>
                      <input type="file" accept="image/*,application/pdf" capture="environment" ref={cmpFileRef} style={{display:'none'}} onChange={capturarFoto}/>
                      <button className="inv-btn inv-btn-pri inv-btn-sm" style={{display:'inline-flex',alignItems:'center',gap:6}} disabled={cmpParsing} onClick={()=>cmpFileRef.current&&cmpFileRef.current.click()}>{cmpParsing?'Leyendo recibo…':<><IconCamera size={12}/> Tomar foto / subir recibo (o PDF)</>}</button>
                      {cmpLastFoto&&!cmpParsing&&(
                        <button className="inv-btn inv-btn-sec inv-btn-sm" style={{marginLeft:8,maxWidth:220,overflow:'hidden',textOverflow:'ellipsis'}} onClick={reintentarFoto} title={`Reintentar con ${cmpLastFoto.name}`}>↻ Reintentar{cmpLastFoto.name?` (${cmpLastFoto.name.length>18?cmpLastFoto.name.slice(0,15)+'…':cmpLastFoto.name})`:''}</button>
                      )}
                      <div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--border-soft)',marginTop:8}}>La foto o PDF se lee y llena proveedor, fecha e ítems abajo — revisa antes de registrar.</div>
                      {cmpParseErr&&<div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--coral-500)',marginTop:8}}>{cmpParseErr}</div>}
                    </div>
                  )}
                  {cmpMode==='texto'&&(
                    <div style={{marginBottom:16}}>
                      <textarea className="inv-input" rows="4" style={{width:'100%',resize:'vertical',fontFamily:"var(--font-body)"}} placeholder="Pega aquí el mensaje o correo del proveedor…" value={cmpPasteText} onChange={e=>setCmpPasteText(e.target.value)}/>
                      <button className="inv-btn inv-btn-pri inv-btn-sm" style={{marginTop:8}} disabled={cmpParsing||!cmpPasteText.trim()} onClick={parsearTexto}>{cmpParsing?'Interpretando…':cmpParseErr?'↻ Reintentar':'Interpretar texto'}</button>
                      {cmpParseErr&&<div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--coral-500)',marginTop:8}}>{cmpParseErr}</div>}
                    </div>
                  )}

                  {huboParseIA&&(()=>{
                    const total=cmpItems.length;
                    const sinMatch=cmpItems.filter(it=>!it.ingId).length;
                    return(
                      <div style={{marginBottom:14,padding:'10px 12px',borderRadius:'var(--r-sm)',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",background:sinMatch?'#FBF6E8':'var(--moss-50,#F0F4EB)',border:`1px solid ${sinMatch?'var(--status-attention)':'var(--moss-300,#B8C9A0)'}`,color:'var(--ink-800)'}}>
                        Se {total===1?'detectó 1 ítem':`detectaron ${total} ítems`}
                        {sinMatch>0?` — ${sinMatch} sin coincidencia automática, revísalos abajo.`:' — revisa cantidades y precios antes de registrar.'}
                      </div>
                    );
                  })()}

                  <div className="inv-row inv-row-2">
                    <div>
                      <label className="inv-label">Proveedor</label>
                      <div style={{display:'flex',gap:6}}>
                        <select className="inv-input" value={cmpProvId} onChange={e=>setCmpProvId(e.target.value)} style={{flex:1}}>
                          <option value="">Seleccionar…</option>
                          {invProveedores.map(p=>(
                            <option key={p.id} value={p.id}>{p.nombre} — {p.municipio}</option>
                          ))}
                        </select>
                        <button className="inv-btn inv-btn-sec inv-btn-sm" style={{flexShrink:0,padding:'9px 12px'}} onClick={()=>setShowProvModal(true)}>＋ Nuevo</button>
                      </div>
                    </div>
                    <div>
                      <label className="inv-label">Fecha de compra</label>
                      <input type="date" className="inv-input" value={cmpFecha} onChange={e=>setCmpFecha(e.target.value)}/>
                    </div>
                  </div>

                  <label className="inv-label">Ítems</label>
                  {cmpItems.map(it=>{
                    const g=INGS.find(x=>x.id===it.ingId);
                    return(
                    <div key={it.uid} style={{border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',padding:'10px 12px',marginBottom:8,background:'var(--paper-50)'}}>
                      <div style={{display:'flex',gap:8,marginBottom:8}}>
                        <select className="inv-input" style={{flex:1,fontSize:"var(--text-sm)"}} value={it.ingId} onChange={e=>updCmpItem(it.uid,'ingId',e.target.value)}>
                          <option value="">Seleccionar ingrediente…</option>
                          {INGS.map(gg=>(<option key={gg.id} value={gg.id}>{gg.name}</option>))}
                        </select>
                        <button className="inv-btn inv-btn-danger inv-btn-sm" onClick={()=>remCmpItem(it.uid)} disabled={cmpItems.length===1}>✕</button>
                      </div>
                      {!it.ingId&&(it.kg||it.precio)&&<div style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--coral-500)',marginBottom:8}}>⚠ Sin coincidencia automática — elige el ingrediente.</div>}
                      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                        <div style={{display:'flex',alignItems:'center',gap:4}}>
                          <button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>updCmpItem(it.uid,'kg',String(Math.max(0,(parseFloat(it.kg)||0)-1)))}>−</button>
                          <input type="number" className="inv-input" style={{width:64,textAlign:'center',fontSize:"var(--text-sm)"}} min="0" step="0.5" value={it.kg} onChange={e=>updCmpItem(it.uid,'kg',e.target.value)} placeholder="kg"/>
                          <button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>updCmpItem(it.uid,'kg',String((parseFloat(it.kg)||0)+1))}>＋</button>
                          <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--ink-500)'}}>kg</span>
                        </div>
                        <input type="number" className="inv-input" style={{width:90,fontSize:"var(--text-sm)"}} min="0" step="100" value={it.precio} onChange={e=>updCmpItem(it.uid,'precio',e.target.value)} placeholder="$/kg"/>
                        <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-700)',marginLeft:'auto',whiteSpace:'nowrap'}}>${((parseFloat(it.kg)||0)*(parseFloat(it.precio)||0)).toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  );})}

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <button className="inv-btn inv-btn-sec inv-btn-sm" onClick={addCmpItem}>＋ Agregar ítem</button>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",fontWeight:700,color:'var(--ink-800)'}}>
                      Total: ${cmpItems.reduce((s,it)=>s+(parseFloat(it.kg)||0)*(parseFloat(it.precio)||0),0).toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div style={{display:'flex',gap:10}}>
                    <button className="inv-btn inv-btn-pri" onClick={registrarCompra}>✓ Registrar compra</button>
                    <button className="inv-btn inv-btn-sec" onClick={()=>{setCmpItems([{uid:Date.now(),ingId:'',kg:'',precio:''}]);setCmpProvId('');setCmpFecha(new Date().toISOString().split('T')[0]);setCmpMode('manual');setCmpPasteText('');setCmpFuente('manual');setHuboParseIA(false);setCmpLastFoto(null);setCmpParseErr('');}}>✕ Limpiar</button>
                  </div>
                  </div>
                  )}
                </div>
              )}

              {/* ── HISTORIAL ─────────────────────────────────────────────── */}
              {invTab==='historial'&&(
                <div>
                  {invCompras.length===0
                    ?<div style={{textAlign:'center',padding:'32px 20px',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--border-soft)',border:'1px dashed var(--border-soft)',borderRadius:'var(--r-sm)'}}>
                        Sin compras registradas.
                        <div><button className="inv-btn inv-btn-pri" style={{marginTop:12}} onClick={()=>setInvTab('compra')}>Registrar primera compra →</button></div>
                      </div>
                    :(()=>{
                      const byMonth={};
                      [...invCompras].sort((a,b)=>b.fecha.localeCompare(a.fecha)).forEach(c=>{
                        const mes=c.fecha.slice(0,7);
                        if(!byMonth[mes]) byMonth[mes]=[];
                        byMonth[mes].push(c);
                      });
                      return Object.entries(byMonth).sort((a,b)=>b[0].localeCompare(a[0])).map(([mes,cmpras])=>{
                        const totalMes=cmpras.reduce((s,c)=>s+c.items.reduce((si,it)=>si+(it.kg||0)*(it.precio||0),0),0);
                        const collapsed=!!collapsedMonths[mes];
                        const [yr,mo]=mes.split('-');
                        const label=new Date(parseInt(yr),parseInt(mo)-1,1).toLocaleDateString('es-CO',{month:'long',year:'numeric'});
                        return(
                          <div key={mes} className="inv-month-group">
                            <div className="inv-month-head" onClick={()=>setCollapsedMonths(prev=>({...prev,[mes]:!prev[mes]}))}>
                              <span className="inv-month-label">{label}</span>
                              <div style={{display:'flex',alignItems:'center',gap:12}}>
                                <span className="inv-month-total">${totalMes.toLocaleString('es-CO')} COP</span>
                                <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--border-soft)'}}>{collapsed?'▶':'▼'}</span>
                              </div>
                            </div>
                            {!collapsed&&(
                              <table className="inv-table">
                                <thead>
                                  <tr>
                                    <th>Fecha</th><th>Proveedor</th><th>Ítems</th><th>Total COP</th><th>Fuente</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {cmpras.map(c=>{
                                    const prov=invProveedores.find(p=>p.id===c.proveedorId);
                                    const tot=c.items.reduce((s,it)=>s+(it.kg||0)*(it.precio||0),0);
                                    return(
                                      <tr key={c.id}>
                                        <td>{c.fecha}</td>
                                        <td style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)"}}>{prov?.nombre||c.proveedorId}</td>
                                        <td>
                                          <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                                            {c.items.map((it,i)=>{
                                              const g=INGS.find(x=>x.id===it.ingredienteId);
                                              return<span key={i} style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",padding:'1px 5px',background:'var(--paper-100)',border:'1px solid var(--paper-300)',color:'var(--ink-500)',borderRadius:2}}>{g?.name||it.ingredienteId} {it.kg}kg</span>;
                                            })}
                                          </div>
                                        </td>
                                        <td style={{fontFamily:"var(--font-num)",fontSize:"var(--text-base)",color:'var(--ink-900)'}}>${tot.toLocaleString('es-CO')}</td>
                                        <td style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-700)',fontWeight:500}}>{c.fuenteCaptura}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        );
                      });
                    })()
                  }
                </div>
              )}

              {/* ── PROVEEDORES ───────────────────────────────────────────── */}
              {invTab==='proveedores'&&(
                <div>
                  <div style={{marginBottom:12}}>
                    <button className="inv-btn inv-btn-pri" onClick={()=>setShowProvModal(true)}>＋ Agregar proveedor</button>
                  </div>
                  {invProveedores.length===0
                    ?<div style={{textAlign:'center',padding:24,fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--border-soft)'}}>Sin proveedores. Agrega el primero.</div>
                    :<div className="inv-section">
                      {invProveedores.map(p=>(
                        <div key={p.id} className="prov-row">
                          <span className="prov-tipo-chip">{p.tipo}</span>
                          <div style={{flex:1}}>
                            <div className="prov-name">{p.nombre}</div>
                            <div className="prov-muni">{p.municipio}</div>
                          </div>
                          <button className="inv-btn inv-btn-danger inv-btn-sm" onClick={()=>requireAdmin(eliminarProveedor)(p.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              )}
            </div>

            {/* MODAL NUEVO PROVEEDOR */}
            {showProvModal&&(
              <div className="inv-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setShowProvModal(false);}}>
                <div className="inv-modal" role="dialog" aria-modal="true" aria-label="Nuevo proveedor">
                  <div className="inv-modal-title">Nuevo Proveedor</div>
                  <div style={{marginBottom:12}}>
                    <label className="inv-label">Nombre</label>
                    <input className="inv-input" value={newProv.nombre} onChange={e=>setNewProv(p=>({...p,nombre:e.target.value}))} placeholder="Ej. Distribuidora Agro Sabana"/>
                  </div>
                  <div className="inv-row inv-row-2" style={{marginBottom:12}}>
                    <div>
                      <label className="inv-label">Tipo</label>
                      <select className="inv-input" value={newProv.tipo} onChange={e=>setNewProv(p=>({...p,tipo:e.target.value}))}>
                        {[['plaza','Plaza de mercado'],['industrial','Industrial'],['artesanal','Artesanal'],['directo','Directo / Finca'],['otro','Otro']].map(([v,l])=>(
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="inv-label">Municipio</label>
                      <input className="inv-input" value={newProv.municipio} onChange={e=>setNewProv(p=>({...p,municipio:e.target.value}))} placeholder="Ej. Tenjo"/>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                    <button className="inv-btn inv-btn-sec" onClick={()=>setShowProvModal(false)}>Cancelar</button>
                    <button className="inv-btn inv-btn-pri" onClick={agregarProveedor}>Guardar proveedor</button>
                  </div>
                </div>
              </div>
            )}
          </div>
  );

  const workflow=typeof window!=='undefined'?window.SetasOSWorkflow:null;
  const legacyLifecycle={incubacion:'incubation',fructificacion:'fruiting',completado:'closed',descartado:'discarded'};
  const lifecycleLabel={incubation:'Incubación',fruiting:'Fructificación',closed:'Cerrado',discarded:'Descartado'};
  const lifecycleColor={incubation:'var(--status-info)',fruiting:'var(--status-active)',closed:'var(--status-archived)',discarded:'var(--status-error)'};
  const actionLabel={inspection:'Inspeccionar',move:'Mover lote',contamination:'Reportar contaminación',note:'Foto / nota',advance_stage:'Avanzar etapa',harvest:'Registrar cosecha',close:'Cerrar lote'};
  const openBatchDetail=(id)=>{setBitActiveLoteId(id);goTab('bitacora');goBitTab('bit_ficha',true);};
  const runBatchAction=(action,lote)=>{
    if(action==='harvest'){
      const bolsa=bitBolsas.find(b=>b.loteId===lote.id&&b.estado==='sana');
      setBitCosechaForm({bolsaId:bolsa?.id||'',loteId:lote.id,codigo:bolsa?.codigo||'',flush:1,fecha:new Date().toISOString().split('T')[0],pesoFresco:'',calidad:4,observaciones:''});
      setShowBitCosecha(true);return;
    }
    if(action==='advance_stage'){
      const next=lote.estado==='incubacion'?'fructificacion':lote.estado;
      const from=legacyLifecycle[lote.estado];const to=legacyLifecycle[next];
      if(next!==lote.estado&&workflow&&workflow.canTransition(from,to)){
        const event=workflow.transitionEvent({batchId:lote.id,from,to,operatorId:lote.operador||'operador-local'});
        updateBitLote(lote.id,{estado:next,lifecycleState:to,lifecycleEvents:[...(lote.lifecycleEvents||[]),event]});
      }
      return;
    }
    if(action==='close'){updateBitLote(lote.id,{estado:'completado'});return;}
    if(action==='inspection'){goBitTab('bit_bolsas',true);return;}
    if(action==='contamination'){goBitTab('bit_bolsas',true);return;}
    setNoticeDlg({title:actionLabel[action]||'Acción de lote',msg:'Esta captura conserva el flujo operativo existente del lote.'});
  };
  const TodayV2=()=>{
    const now=Date.now();
    const source=bitLotes.filter(l=>!['completado','descartado'].includes(l.estado)).map((lote,index)=>{
      const stats=calcLoteStats(lote.id);
      const contaminated=stats&&stats.contPct>0;
      const inoculated=Date.parse(lote.fechaInoculacion||'');
      const age=Number.isFinite(inoculated)?Math.max(0,Math.floor((now-inoculated)/86400000)):0;
      return {id:lote.id,lote,severity:stats&&stats.contPct>=20?'critical':undefined,blocked:contaminated&&stats.contPct<20,
        dueAt:!contaminated&&age>=14?new Date(now-(index+1)*3600000).toISOString():new Date(now+(index+1)*3600000).toISOString(),
        title:contaminated?'Revisar contaminación':lote.estado==='fructificacion'?'Registrar cosecha':'Inspeccionar colonización',
        why:`${lote.especie||'Lote'} · ${lifecycleLabel[legacyLifecycle[lote.estado]]||lote.estado} · día ${age}`};
    });
    const queue=workflow?workflow.buildTodayQueue(source,now):source;
    const groups=[['critical','Crítico'],['overdue','Vencido'],['now','Ahora'],['blocked','Bloqueos'],['later','Después'],['context','Contexto']];
    return <section className="os-today-v2" data-testid="ux-v2-today">
      <div className="os-page-kicker">Operación · turno actual</div><h1 className="os-page-title">Hoy</h1>
      <button className="os-scan-target" type="button" onClick={()=>setNoticeDlg({title:'Escanear lote',msg:'Usa el lector de campo para resolver el lote y mostrar sus acciones válidas.'})}>Escanear lote o registrar evento</button>
      {queue.length===0&&<div className="os-v2-empty">No hay excepciones ni trabajo pendiente. Los lotes nuevos aparecerán aquí según su estado.</div>}
      {groups.map(([bucket,label])=>{const rows=queue.filter(item=>item.bucket===bucket);if(!rows.length)return null;return <section className="os-today-group" key={bucket}>
        <div className="os-section-head"><h2>{label}</h2><span>{rows.length}</span></div>
        {rows.map(item=><div key={item.id} className={'os-task-row '+(bucket==='critical'?'os-alert-row--critical':'')}>
          <span className="os-task-marker" aria-hidden="true"></span><div><div className="os-task-row__title">{item.title}</div><div className="os-task-row__meta">{item.lote.codigo} · {item.why}</div></div>
          <button className="os-action" type="button" onClick={()=>openBatchDetail(item.id)}>Abrir lote</button>
        </div>)}
      </section>;})}
    </section>;
  };
  const BatchDetailV2=({lote})=>{
    const stats=calcLoteStats(lote.id);const state=legacyLifecycle[lote.estado]||'planned';
    const isAdmin=props.isAdmin===true||props.isAdmin==='true';
    const actions=workflow?workflow.validActions(state,isAdmin?'direccion':'operario'):[];
    const bolsas=bitBolsas.filter(b=>b.loteId===lote.id);const cosechas=bitCosechas.filter(c=>c.loteId===lote.id);
    const events=[...cosechas.map(c=>({id:c.id,title:`Cosecha · flush ${c.flush}`,meta:`${c.fecha} · ${c.pesoFresco} g`,kind:'measured'})),...bolsas.filter(b=>b.col100).map(b=>({id:b.id,title:`Colonización completa · ${b.codigo}`,meta:b.col100,kind:'manual'}))];
    return <article className="os-batch-detail-v2" data-testid="ux-v2-batch-detail">
      <button className="os-action os-detail-back" type="button" onClick={()=>goBitTab('bit_dash')}>Volver a lotes</button>
      <header className="os-batch-header" data-testid="active-lote" data-lote-id={lote.id}><div className="os-batch-header__top"><div><div className="os-batch-header__code">{lote.codigo}</div><div className="os-batch-header__species">{lote.especie}</div></div><span className="os-lifecycle-state" style={{borderTopColor:lifecycleColor[state]||'var(--text-metadata)',color:lifecycleColor[state]||'var(--text-metadata)'}}>{lifecycleLabel[state]||state}</span></div>
        <div className="os-batch-header__meta"><span>{lote.numBolsas} bolsas</span><span>Inoculación {lote.fechaInoculacion}</span><span>{lote.recipeRef?.name||'Receta sin vincular'}</span></div>
        <div className="os-batch-header__next"><span className="os-batch-header__next-label">Siguiente acción válida</span><span className="os-batch-header__next-value">{actionLabel[actions[0]]||'Sin acciones pendientes'}</span></div></header>
      <div className="os-metric-grid"><div className="os-metric"><span className="os-metric__label">Bolsas sanas</span><span className="os-metric__value">{stats?`${stats.bolsasSanas}/${stats.numBolsas}`:'—'}</span><span className="os-provenance os-provenance--calculated">Calculado</span></div><div className="os-metric"><span className="os-metric__label">Contaminación</span><span className="os-metric__value">{stats?stats.contPct.toFixed(0)+'%':'—'}</span><span className="os-provenance os-provenance--calculated">Calculado</span></div><div className="os-metric"><span className="os-metric__label">Cosechado</span><span className="os-metric__value">{stats?stats.totalFresco.toFixed(3)+' kg':'—'}</span><span className="os-provenance os-provenance--measured">Medido</span></div></div>
      <div className="os-detail-grid"><section className="os-detail-panel"><h2>Actividad</h2>{events.length===0?<div className="os-v2-empty">Todavía no hay eventos medidos o manuales para este lote.</div>:events.map(e=><div className="os-event-row" key={e.id}><span className="os-task-marker"></span><div><div className="os-event-row__title">{e.title}</div><div className="os-event-row__meta">{e.meta}</div></div><span className={'os-provenance os-provenance--'+e.kind}>{e.kind==='measured'?'Medido':'Manual'}</span></div>)}</section>
        <aside className="os-detail-panel"><h2>Acciones válidas ahora</h2><div className="os-valid-actions">{actions.filter(a=>actionLabel[a]).map(action=><button key={action} className="os-action" type="button" onClick={()=>runBatchAction(action,lote)}>{actionLabel[action]}</button>)}</div><span className={'os-sync-state '+(bitSyncErr?'os-sync-state--error':'os-sync-state--synced')}>{bitSyncErr?'Sin sincronizar':'Sincronizado'}</span></aside></div>
    </article>;
  };

  const BitacoraSection=()=>(
<div>
            <div className="panel" style={{paddingBottom:0,marginBottom:0}}>
              <div className="bit-context-actions" style={{display:'flex',alignItems:'center',gap:6,minHeight:44,paddingBottom:8}}>
                <button className={'inv-btn inv-btn-sec inv-btn-sm'+(bitTab==='bit_comparador'?' on':'')} onClick={()=>goBitTab('bit_comparador')}>Comparar lotes</button>
                <button className={'inv-btn inv-btn-sec inv-btn-sm'+(bitTab==='bit_ficha'?' on':'')} onClick={()=>goBitTab('bit_ficha')} disabled={!bitActiveLoteId} style={{opacity:bitActiveLoteId?1:0.45}}>Ficha experimental</button>
                {bitActiveLoteId&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginLeft:'auto',alignSelf:'center',paddingRight:4}}>{bitLotes.find(lt=>lt.id===bitActiveLoteId)?.codigo}</span>}
                {bitSyncErr&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#C53030',marginLeft:8,alignSelf:'center'}} title={bitSyncErr}>⚠ sin sincronizar</span>}
              </div>
            </div>

            {bitTab==='bit_dash'&&(
              <div className="panel">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
                  <div className="sec" style={{marginBottom:0,borderBottom:'none'}}>Lotes experimentales <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-500)',fontWeight:400}}>({bitLotes.length})</span></div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>setBitDashView('grid')} style={{padding:'6px 12px',background:bitDashView==='grid'?'var(--ink-900)':'var(--paper-50)',color:bitDashView==='grid'?'var(--paper-0)':'var(--ink-700)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",cursor:'pointer',transition:'background-color .12s,border-color .12s,color .12s,transform .12s'}}>⊞ Cuadrícula</button>
                    <button onClick={()=>setBitDashView('tabla')} style={{padding:'6px 12px',background:bitDashView==='tabla'?'var(--ink-900)':'var(--paper-50)',color:bitDashView==='tabla'?'var(--paper-0)':'var(--ink-700)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",cursor:'pointer',transition:'background-color .12s,border-color .12s,color .12s,transform .12s'}}>≡ Tabla</button>
                    <button onClick={()=>{setBitNuevoForm(buildBitNuevoForm());setShowBitNuevo(true);}} className="inv-btn inv-btn-pri">+ Nueva prueba</button>
                  </div>
                </div>
                {bitLotes.length>0&&(()=>{const allStats=bitLotes.map(lt=>({lt,s:calcLoteStats(lt.id)}));const wd=allStats.filter(x=>x.s&&x.s.totalFresco>0);const avgBE=wd.length?wd.reduce((s,x)=>s+(x.s.be||0),0)/wd.length:null;const ws=allStats.filter(x=>x.s);const avgCont=ws.length?ws.reduce((s,x)=>s+(x.s.contPct||0),0)/ws.length:null;const totalKg=allStats.reduce((s,x)=>s+(x.s?.totalFresco||0),0);return(<div className="inv-stat-row" style={{marginBottom:16}}><div className="inv-stat"><div className="inv-stat-val">{bitLotes.length}</div><div className="inv-stat-lbl">Lotes</div></div><div className="inv-stat"><div className="inv-stat-val">{avgBE!=null?avgBE.toFixed(0)+'%':'—'}</div><div className="inv-stat-lbl">BE media</div></div><div className="inv-stat"><div className="inv-stat-val" style={{color:avgCont!=null&&avgCont>15?'var(--coral-700)':'inherit'}}>{avgCont!=null?avgCont.toFixed(0)+'%':'—'}</div><div className="inv-stat-lbl">Contam. media</div></div><div className="inv-stat"><div className="inv-stat-val">{totalKg.toFixed(2)} kg</div><div className="inv-stat-lbl">Cosechado</div></div></div>);})()} 
                {bitLotes.length===0&&(<div style={{textAlign:'center',padding:'48px 20px',color:'var(--ink-500)',fontFamily:'var(--font-mono)',fontSize:"var(--text-base)",border:'1px dashed var(--border-soft)',borderRadius:'var(--r-md)'}}>Sin lotes experimentales registrados.<br/><button onClick={()=>{setBitNuevoForm(buildBitNuevoForm());setShowBitNuevo(true);}} className="inv-btn inv-btn-pri" style={{marginTop:14}}>+ Crear primer lote</button></div>)}
                {bitLotes.length>0&&bitDashView==='grid'&&(
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                    {bitLotes.map(lote=>{
                      const stats=calcLoteStats(lote.id);const score=stats?calcLoteScore(stats):null;
                      const EC={incubacion:'var(--ochre-500)',fructificacion:'var(--moss-500)',completado:'var(--coral-700)',descartado:'var(--ink-400)'};
                      return(
                        <div key={lote.id} data-lote-id={lote.id} className="panel" style={{padding:0,overflow:'hidden',cursor:'pointer',margin:0,transition:'box-shadow .18s,transform .18s'}}
                          onClick={()=>{setBitActiveLoteId(lote.id);goBitTab('bit_bolsas',true);}}
                          onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-lift)';e.currentTarget.style.transform='translateY(-2px)';}}
                          onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform='';}}
                        >
                          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--paper-300)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                            <div style={{minWidth:0}}>
                              <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lote.codigo}</div>
                              <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-base)",color:'var(--ink-900)',lineHeight:1.2}}>{lote.especie||'—'}</div>
                              {lote.especieCientifico&&<div style={{fontFamily:'var(--font-sci)',fontStyle:'italic',fontSize:"var(--text-sm)",color:'var(--ink-600)',marginTop:1}}>{lote.especieCientifico}</div>}
                            </div>
                            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
                              <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'2px 7px',borderRadius:10,background:EC[lote.estado]||'var(--ink-400)',color:'var(--paper-0)',textTransform:'uppercase',letterSpacing:'var(--tracking-label)'}}>{lote.estado}</span>
                              {score!==null&&<span style={{fontFamily:'var(--font-num)',fontSize:22,color:'var(--coral-700)',lineHeight:1}}>{score}<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-400)'}}>/100</span></span>}
                            </div>
                          </div>
                          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'var(--paper-300)'}}>
                            {[['Sanas',stats?`${stats.bolsasSanas}/${stats.numBolsas}`:'—'],['BE',stats?.be!=null?stats.be.toFixed(0)+'%':'—'],['Cosecha',stats?.totalFresco?stats.totalFresco.toFixed(2)+' kg':'—']].map(([lb,v])=>(<div key={lb} style={{background:'var(--paper-50)',padding:'8px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',marginBottom:2}}>{lb}</div><div style={{fontFamily:'var(--font-num)',fontSize:"var(--text-md)",color:'var(--ink-900)'}}>{v}</div></div>))}
                          </div>
                          <div style={{padding:'6px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--paper-100)'}}>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)'}}>{lote.fechaInoculacion}</span>
                            {lote.veredicto?<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'2px 7px',borderRadius:10,background:'var(--moss-200)',color:'var(--moss-700)',fontWeight:700}}>{lote.veredicto}</span>:<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-400)'}}>sin veredicto</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {bitLotes.length>0&&bitDashView==='tabla'&&(
                  <div className="inv-section">
                    <table className="inv-table">
                      <thead><tr><th>Código</th><th>Especie</th><th>Fecha inoc.</th><th>Bolsas</th><th>BE</th><th>Contam.</th><th>Cosecha</th><th>Score</th><th>Estado</th><th>Veredicto</th><th></th></tr></thead>
                      <tbody>{bitLotes.map(lote=>{const stats=calcLoteStats(lote.id);const score=stats?calcLoteScore(stats):null;return(<tr key={lote.id} style={{cursor:'pointer'}} onClick={()=>{setBitActiveLoteId(lote.id);goBitTab('bit_bolsas',true);}}><td style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",whiteSpace:'nowrap'}}>{lote.codigo}</td><td style={{fontFamily:'var(--font-body)',fontWeight:700}}>{lote.especie}</td><td style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)"}}>{lote.fechaInoculacion}</td><td>{stats?`${stats.bolsasSanas}/${stats.numBolsas}`:lote.numBolsas}</td><td style={{color:stats?.be>80?'var(--moss-700)':stats?.be>60?'var(--ochre-600)':'var(--coral-700)',fontWeight:700}}>{stats?.be!=null?stats.be.toFixed(0)+'%':'—'}</td><td style={{color:stats?.contPct>20?'var(--coral-700)':'inherit'}}>{stats?.contPct!=null?stats.contPct.toFixed(0)+'%':'—'}</td><td>{stats?.totalFresco?stats.totalFresco.toFixed(2)+' kg':'0 kg'}</td><td>{score!==null?score+'/100':'—'}</td><td><span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'2px 6px',borderRadius:8,background:'var(--paper-300)'}}>{lote.estado}</span></td><td>{lote.veredicto?<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'2px 6px',borderRadius:8,background:'var(--moss-200)',color:'var(--moss-700)'}}>{lote.veredicto}</span>:'—'}</td><td onClick={e=>e.stopPropagation()}><button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>requireAdmin(deleteBitLote)(lote.id)} aria-label={"Eliminar lote "+lote.codigo}>✕</button></td></tr>);})}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {bitTab==='bit_bolsas'&&bitActiveLoteId&&(()=>{
              const lote=bitLotes.find(lt=>lt.id===bitActiveLoteId);if(!lote) return null;
              const bolsas=bitBolsas.filter(b=>b.loteId===bitActiveLoteId);
              const stats=calcLoteStats(bitActiveLoteId);
              const EB={sana:{c:'var(--moss-700)',l:'Sana'},contaminada:{c:'var(--coral-700)',l:'Contaminada'},dudosa:{c:'var(--ochre-500)',l:'Dudosa'},descartada:{c:'var(--ink-400)',l:'Descartada'}};
              return(
                <div className="panel" data-testid="active-lote" data-lote-id={lote.id}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,flexWrap:'wrap',gap:8}}>
                    <div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-500)'}}>{lote.codigo}</div>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:17,color:'var(--ink-900)'}}>{lote.especie}</div>
                      {lote.especieCientifico&&<div style={{fontFamily:'var(--font-sci)',fontStyle:'italic',fontSize:"var(--text-sm)",color:'var(--ink-600)'}}>{lote.especieCientifico}</div>}
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <select value={lote.veredicto||''} onChange={e=>updateBitLote(lote.id,{veredicto:e.target.value})} className="inv-input" style={{width:'auto',fontSize:"var(--text-sm)",padding:'6px 10px'}}>
                        <option value="">— veredicto —</option>
                        {['prometedora','descartar','repetir','ajustar humedad','riesgo contaminación','buena para escalar'].map(v=><option key={v} value={v}>{v}</option>)}
                      </select>
                      <select value={lote.estado} onChange={e=>updateBitLote(lote.id,{estado:e.target.value})} className="inv-input" style={{width:'auto',fontSize:"var(--text-sm)",padding:'6px 10px'}}>
                        {['incubacion','fructificacion','completado','descartado'].map(st=><option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                  </div>
                  {stats&&(<div className="inv-stat-row" style={{marginBottom:14}}><div className="inv-stat"><div className="inv-stat-val">{stats.bolsasSanas}/{stats.numBolsas}</div><div className="inv-stat-lbl">Sanas</div></div><div className="inv-stat"><div className="inv-stat-val" style={{color:stats.contPct>20?'var(--coral-700)':'inherit'}}>{stats.contPct.toFixed(0)}%</div><div className="inv-stat-lbl">Contam.</div></div><div className="inv-stat"><div className="inv-stat-val">{stats.be!=null?stats.be.toFixed(0)+'%':'—'}</div><div className="inv-stat-lbl">BE</div></div><div className="inv-stat"><div className="inv-stat-val">{stats.totalFresco.toFixed(3)} kg</div><div className="inv-stat-lbl">Cosechado</div></div></div>)}
                  <div className="inv-section">
                    <table className="inv-table bolsas-table">
                      <thead><tr><th scope="col">Código</th><th scope="col">Estado</th><th scope="col">Col 25%</th><th scope="col">Col 50%</th><th scope="col">Col 100%</th><th scope="col">Observaciones</th><th scope="col">Foto</th><th scope="col">Cosechas</th></tr></thead>
                      <tbody>{bolsas.map(bolsa=>{const cosBolsa=bitCosechas.filter(c=>c.bolsaId===bolsa.id);const totalBolsa=cosBolsa.reduce((s,c)=>s+(parseFloat(c.pesoFresco)||0),0);const est=EB[bolsa.estado]||EB.sana;return(<tr key={bolsa.id}><td data-label="Código" style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",whiteSpace:'nowrap'}}>{bolsa.codigo}</td><td data-label="Estado"><select value={bolsa.estado} onChange={e=>updateBitBolsa(bolsa.id,{estado:e.target.value})} style={{width:'100%',padding:'3px 4px',fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",border:`1px solid ${est.c}`,borderRadius:3,background:'var(--paper-50)',color:est.c,cursor:'pointer'}}>{Object.entries(EB).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></td>{[['col25','Col 25%'],['col50','Col 50%'],['col100','Col 100%']].map(([f,lbl])=>(<td key={f} data-label={lbl}><input type="date" value={bolsa[f]||''} onChange={e=>updateBitBolsa(bolsa.id,{[f]:e.target.value})} style={{width:'100%',padding:'2px 3px',fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",border:'1px solid var(--paper-300)',borderRadius:3,background:'var(--paper-50)'}}/></td>))}<td data-label="Observaciones"><input type="text" value={bolsa.observaciones||''} placeholder="…" onChange={e=>updateBitBolsa(bolsa.id,{observaciones:e.target.value})} style={{width:'100%',padding:'2px 5px',fontFamily:'var(--font-body)',fontSize:"var(--text-sm)",border:'1px solid var(--paper-300)',borderRadius:3,background:'var(--paper-50)'}}/></td><td data-label="Foto" style={{textAlign:'center'}}>{bolsa.foto?<img src={bolsa.foto} alt="" style={{width:28,height:28,objectFit:'cover',borderRadius:3,cursor:'pointer',display:'block',margin:'0 auto'}} onClick={()=>updateBitBolsa(bolsa.id,{foto:null})} title="Clic para quitar"/>:<label style={{cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--coral-500)',textDecoration:'underline',display:'block',textAlign:'center'}}>+foto<input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(!f) return;compressImageToDataURL(f).then(dataUrl=>updateBitBolsa(bolsa.id,{foto:dataUrl})).catch(()=>setNoticeDlg({title:'No se pudo procesar la foto',msg:'Intenta con otra imagen.'}));e.target.value='';}}/></label>}</td><td data-label="Cosechas"><div style={{display:'flex',alignItems:'center',gap:5}}><span style={{fontFamily:'var(--font-num)',fontSize:"var(--text-base)"}}>{totalBolsa>0?(totalBolsa/1000).toFixed(3)+' kg':'—'}</span><button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>{setBitCosechaForm({bolsaId:bolsa.id,loteId:bitActiveLoteId,codigo:bolsa.codigo,flush:cosBolsa.length+1,fecha:new Date().toISOString().split('T')[0],pesoFresco:'',calidad:4,observaciones:''});setShowBitCosecha(true);}}>+</button></div></td></tr>);})}</tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {bitTab==='bit_cosechas'&&bitActiveLoteId&&(()=>{
              const lote=bitLotes.find(lt=>lt.id===bitActiveLoteId);if(!lote) return null;
              const bolsas=bitBolsas.filter(b=>b.loteId===bitActiveLoteId);
              const cosechas=[...bitCosechas.filter(c=>c.loteId===bitActiveLoteId)].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
              const stats=calcLoteStats(bitActiveLoteId);
              return(
                <div className="panel">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div className="sec" style={{marginBottom:0,borderBottom:'none'}}>Cosechas — {lote.codigo}</div>
                    <button className="inv-btn inv-btn-pri" onClick={()=>{const fb=bolsas.find(b=>b.estado==='sana');setBitCosechaForm({bolsaId:fb?.id||'',loteId:bitActiveLoteId,codigo:fb?.codigo||'',flush:1,fecha:new Date().toISOString().split('T')[0],pesoFresco:'',calidad:4,observaciones:''});setShowBitCosecha(true);}}>+ Registrar cosecha</button>
                  </div>
                  {stats&&stats.totalFresco>0&&(<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'var(--border-soft)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',overflow:'hidden',marginBottom:14}}>{[['Total fresco',stats.totalFresco.toFixed(3)+' kg'],['BE estimada',stats.be!=null?stats.be.toFixed(1)+'%':'—'],['kg/bolsa sana',stats.bolsasSanas>0?(stats.totalFresco/stats.bolsasSanas).toFixed(3)+' kg':'—'],['Costo/kg',stats.costoKg!=null?'$'+Math.round(stats.costoKg).toLocaleString('es-CO'):'—']].map(([lb,v])=>(<div key={lb} style={{background:'var(--paper-50)',padding:'10px 8px',textAlign:'center'}}><div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',marginBottom:3}}>{lb}</div><div style={{fontFamily:'var(--font-num)',fontSize:18,color:'var(--ink-900)'}}>{v}</div></div>))}</div>)}
                  {cosechas.length===0&&<div style={{textAlign:'center',padding:'32px',color:'var(--ink-500)',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",border:'1px dashed var(--border-soft)',borderRadius:'var(--r-sm)'}}>Sin cosechas registradas aún.</div>}
                  {cosechas.length>0&&(<div className="inv-section"><table className="inv-table"><thead><tr><th>Bolsa</th><th>Flush</th><th>Fecha</th><th style={{textAlign:'right'}}>Peso fresco (g)</th><th>Calidad</th><th>Observaciones</th><th></th></tr></thead><tbody>{cosechas.map(c=>(<tr key={c.id}><td style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)"}}>{c.codigo}</td><td style={{fontFamily:'var(--font-num)',fontSize:"var(--text-base)",textAlign:'center'}}>{c.flush}</td><td style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)"}}>{c.fecha}</td><td style={{textAlign:'right',fontFamily:'var(--font-num)',fontSize:"var(--text-base)"}}>{c.pesoFresco}</td><td style={{textAlign:'center',fontSize:"var(--text-sm)"}}>{'★'.repeat(c.calidad||0)}</td><td style={{fontFamily:'var(--font-body)',fontSize:"var(--text-sm)",color:'var(--ink-600)'}}>{c.observaciones}</td><td><button className="inv-btn inv-btn-sec inv-btn-sm" onClick={()=>deleteBitCosecha(c.id)}>✕</button></td></tr>))}<tr style={{borderTop:'2px solid var(--ink-900)'}}><td colSpan={3} style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",padding:'7px 12px'}}>Total</td><td style={{textAlign:'right',fontFamily:'var(--font-num)',fontSize:"var(--text-base)",fontWeight:700,padding:'7px 12px'}}>{cosechas.reduce((s,c)=>s+(parseFloat(c.pesoFresco)||0),0).toFixed(0)} g</td><td colSpan={3}></td></tr></tbody></table></div>)}
                </div>
              );
            })()}

            {bitTab==='bit_comparador'&&(()=>{
              const lotesConDatos=bitLotes.filter(lt=>{const s=calcLoteStats(lt.id);return s&&(s.totalFresco>0||s.numBolsas>0);});
              return(
                <div className="panel">
                  <div className="sec">Comparador de recetas</div>
                  {lotesConDatos.length<2&&<div style={{textAlign:'center',padding:'32px',color:'var(--ink-500)',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",border:'1px dashed var(--border-soft)',borderRadius:'var(--r-sm)'}}>Necesitas al menos 2 lotes para comparar. Actualmente: {lotesConDatos.length}.</div>}
                  {lotesConDatos.length>=2&&(<div className="inv-section"><table className="inv-table"><thead><tr><th>Lote / Receta</th><th>Especie</th><th style={{textAlign:'right'}}>Contam.</th><th style={{textAlign:'right'}}>Días col.</th><th style={{textAlign:'right'}}>BE</th><th style={{textAlign:'right'}}>kg/bolsa</th><th style={{textAlign:'right'}}>Costo/kg</th><th style={{textAlign:'center'}}>Score</th><th>Veredicto</th></tr></thead><tbody>{lotesConDatos.map(lote=>{const stats=calcLoteStats(lote.id);const score=calcLoteScore(stats);const VC={'prometedora':'var(--moss-500)','descartar':'var(--coral-700)','buena para escalar':'var(--moss-700)','riesgo contaminación':'var(--ochre-500)','repetir':'var(--ink-600)','ajustar humedad':'var(--ochre-600)'};return(<tr key={lote.id}><td style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)"}}><div style={{fontWeight:700,color:'var(--ink-900)'}}>{lote.codigo}</div>{lote.recipeRef&&<div style={{fontSize:"var(--text-xs)",color:'var(--ink-500)'}}>{lote.recipeRef.name}</div>}</td><td style={{fontFamily:'var(--font-body)',fontSize:"var(--text-base)"}}>{lote.especie}</td><td style={{textAlign:'right',color:stats?.contPct>20?'var(--coral-700)':'var(--moss-700)',fontWeight:700}}>{stats?.contPct!=null?stats.contPct.toFixed(0)+'%':'—'}</td><td style={{textAlign:'right'}}>{stats?.diasCol!=null?stats.diasCol.toFixed(1)+'d':'—'}</td><td style={{textAlign:'right',fontWeight:700,color:stats?.be>80?'var(--moss-700)':stats?.be>60?'var(--ochre-600)':'var(--coral-700)'}}>{stats?.be!=null?stats.be.toFixed(0)+'%':'—'}</td><td style={{textAlign:'right'}}>{stats?.bolsasSanas>0&&stats.totalFresco?(stats.totalFresco/stats.bolsasSanas).toFixed(3)+' kg':'—'}</td><td style={{textAlign:'right'}}>{stats?.costoKg!=null?'$'+Math.round(stats.costoKg).toLocaleString('es-CO'):'—'}</td><td style={{textAlign:'center',fontFamily:'var(--font-num)',fontSize:"var(--text-md)",color:'var(--coral-700)',fontWeight:700}}>{score!==null?score:'—'}</td><td><select value={lote.veredicto||''} onChange={e=>updateBitLote(lote.id,{veredicto:e.target.value})} style={{padding:'4px 7px',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",border:'1px solid var(--border-soft)',borderRadius:4,background:'var(--paper-50)',color:VC[lote.veredicto]||'var(--ink-700)',width:'100%'}}><option value="">— sin veredicto —</option>{['prometedora','descartar','repetir','ajustar humedad','riesgo contaminación','buena para escalar'].map(v=><option key={v} value={v}>{v}</option>)}</select></td></tr>);})}</tbody></table></div>)}
                </div>
              );
            })()}

            {bitTab==='bit_ficha'&&bitActiveLoteId&&(()=>{
              const lote=bitLotes.find(lt=>lt.id===bitActiveLoteId);if(!lote) return null;
              const cosechas=[...bitCosechas.filter(c=>c.loteId===bitActiveLoteId)].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
              const stats=calcLoteStats(bitActiveLoteId);const score=stats?calcLoteScore(stats):null;
              return <BatchDetailV2 lote={lote}/>;
              /* Legacy printable sheet retained below during migration, but no longer rendered. */
              return(
                <div className="panel prod-sheet" style={{padding:'26px 28px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2px solid var(--ink-900)',paddingBottom:12,marginBottom:16}}>
                    <div>
                      <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)'}}>Setas de la Peña · Bitácora experimental</div>
                      <div style={{fontFamily:'var(--font-num)',fontSize:26,fontWeight:700,color:'var(--ink-900)',lineHeight:1.1,marginTop:2}}>Ficha experimental</div>
                      <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-base)",color:'var(--ink-900)',marginTop:2}}>{lote.especie}{lote.especieCientifico&&<> · <i>{lote.especieCientifico}</i></>}</div>
                    </div>
                    <div style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-500)'}}>
                      <div>Lote: <b style={{color:'var(--ink-900)'}}>{lote.codigo}</b></div>
                      <div>Inoculación: {lote.fechaInoculacion}</div>
                      <div>{lote.numBolsas} bolsas × {lote.pesoHumedo} kg · {lote.humedad}% H₂O</div>
                      {lote.veredicto&&<div style={{fontWeight:700,color:'var(--moss-700)',marginTop:4}}>{lote.veredicto}</div>}
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                    <div>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-800)',marginBottom:6}}>Datos del experimento</div>
                      {[['Cepa/proveedor',lote.cepa||'—'],['Operador',lote.operador||'—'],['Humedad obj.',lote.humedad+'%'],['Tratamiento',lote.tratamiento||'—'],['Objetivo',lote.objetivo||'—']].map(([lb,v])=>(<div key={lb} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid var(--paper-300)'}}><span style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-sm)",color:'var(--ink-700)',width:110,flexShrink:0}}>{lb}</span><span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-900)'}}>{v}</span></div>))}
                    </div>
                    <div>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-800)',marginBottom:6}}>Resultados</div>
                      {[['Bolsas sanas',stats?`${stats.bolsasSanas}/${stats.numBolsas}`:'—'],['Contaminación',stats?stats.contPct.toFixed(0)+'%':'—'],['BE estimada',stats?.be!=null?stats.be.toFixed(1)+'%':'—'],['Total cosechado',stats?stats.totalFresco.toFixed(3)+' kg':'—'],['Score',score!==null?score+'/100':'—']].map(([lb,v])=>(<div key={lb} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid var(--paper-300)'}}><span style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-sm)",color:'var(--ink-700)',width:110,flexShrink:0}}>{lb}</span><span style={{fontFamily:'var(--font-num)',fontSize:"var(--text-base)",color:'var(--ink-900)'}}>{v}</span></div>))}
                    </div>
                  </div>
                  {lote.recipeRef&&(<div style={{border:'1px solid var(--paper-300)',padding:'10px 14px',marginBottom:14,background:'var(--paper-50)'}}><div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)',marginBottom:5}}>Receta vinculada — {lote.recipeRef.name}</div><div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:5}}>{lote.recipeRef.recipe.map(r=>{const g=INGS.find(i=>i.id===r.id);return g?<span key={r.id} style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'2px 6px',background:'var(--paper-200)',border:'1px solid var(--paper-300)',borderRadius:3}}>{g.name} {parseFloat(r.p).toFixed(1)}%</span>:null;})}</div><div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)'}}>C:N {lote.recipeRef.cn} · EB ~{lote.recipeRef.eb}% · Score {lote.recipeRef.score}/100{lote.recipeRef.cost?` · $${lote.recipeRef.cost.toLocaleString('es-CO')}/kg`:''}</div></div>)}
                  {cosechas.length>0&&(<div><div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)',marginBottom:6}}>Registro de cosechas</div><table className="prod-tbl" style={{marginBottom:14}}><thead><tr><th>Bolsa</th><th style={{textAlign:'center'}}>Flush</th><th>Fecha</th><th style={{textAlign:'right'}}>Peso fresco (g)</th><th style={{textAlign:'center'}}>Calidad</th><th>Obs.</th></tr></thead><tbody>{cosechas.map(c=><tr key={c.id}><td style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)"}}>{c.codigo}</td><td style={{textAlign:'center'}}>{c.flush}</td><td style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)"}}>{c.fecha}</td><td className="num">{c.pesoFresco}</td><td style={{textAlign:'center'}}>{'★'.repeat(c.calidad||0)}</td><td style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",color:'var(--ink-600)'}}>{c.observaciones}</td></tr>)}<tr className="tot"><td colSpan={3}>Total</td><td className="num">{cosechas.reduce((s,c)=>s+(parseFloat(c.pesoFresco)||0),0).toFixed(0)} g</td><td colSpan={2}></td></tr></tbody></table></div>)}
                  {lote.notas&&<div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-sm)",color:'var(--ink-700)',padding:'8px 12px',background:'var(--paper-100)',border:'1px solid var(--paper-300)',marginBottom:12}}><b>Notas:</b> {lote.notas}</div>}
                  <div style={{marginTop:16,paddingTop:12,borderTop:'2px solid var(--ink-900)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-400)'}}>Setas de la Peña · Tenjo 2.600 msnm · {new Date().toLocaleDateString('es-CO')}</div>
                    <button className="no-print" onClick={()=>window.print()} style={{padding:'7px 14px',background:'var(--moss-700)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-sm)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",letterSpacing:'var(--tracking-label)',textTransform:'uppercase',cursor:'pointer'}}>Imprimir ficha</button>
                  </div>
                </div>
              );
            })()}
          </div>
  );


  return(
    <div>
      <div className="topbar">
        <div className="topbar-mark" onClick={()=>goTab('catalogo')} style={{cursor:'pointer'}}>Setas de la Peña</div>
      </div>
      <nav className="fos-rail">
        <span className="fos-rail-mark" style={{position:'relative',width:91,height:106,display:'block'}}>
          <span style={{textAlign:'center',fontStyle:'normal',fontSize:17,display:'block'}}>Setas</span>
          <div style={{fontSize:"var(--text-md)",lineHeight:0.95,position:'absolute',left:30,top:49,fontStyle:'italic',letterSpacing:'-0.1px'}}>de la</div>
          <div style={{fontSize:18,lineHeight:1,position:'absolute',left:27,top:65}}>Peña</div>
        </span>
        {NAV_GROUPS.map(g=>{const on=g.tabs.includes(tab);return(
          <button key={g.key} className={'fos-rail-btn'+(on?' on':'')} onClick={()=>goTab(g.tabs[0])}>{g.icon}<span>{g.label}</span></button>
        );})}
      </nav>
      <header className="hero" style={{display: (tab==='inicio'||tab==='home') ? 'none' : undefined}}>
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-eyebrow">Setas de la Peña — Simulador de recetas</div>
            <div className="hero-title">Diseño de<br/>Sustratos</div>
            <div className="hero-lede" style={{display:'block',marginTop:14,fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>Cálculo, optimización y trazabilidad de mezclas.</div>
          </div>
          <div className="hero-art">
            <img src={(window.__resources&&window.__resources.img_banner)||'_standalone_imgs/banner.png'} alt="" aria-hidden="true" width="720" height="480" />
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="print-header">
          <h1>Setas de la Peña</h1>
          <p>Biogranja fungícola · Tenjo, Cundinamarca · 2.600 msnm</p>
        </div>
        <div className="page-title-bar" style={{display:(tab==='catalogo'||tab==='inicio'||tab==='home')?'none':undefined}}>
          <span className="page-title-eyebrow">{RECETA_TABS.includes(tab)?'Receta':'Cultivo'}</span>
          <h2 className="page-title-h">{TAB_PAGE_TITLES[tab]}</h2>
          <div className="page-title-rule"></div>
        </div>
        {tab!=='inicio'&&(()=>{
          const activeGroup=NAV_GROUPS.find(g=>g.tabs.includes(tab));
          // El grupo "recetas" ya tiene su propio selector (catálogo/formular/optimizar arriba,
          // vía el shell externo Setas OS v5.dc.html) — evita duplicar esa sub-navegación aquí.
          if(!activeGroup||activeGroup.key==='recetas'||activeGroup.tabs.length<2) return null;
          return(
          <div className="fos-chips">
            {activeGroup.tabs.map(t=>(
              <button key={t} className={t===tab?'on':''} onClick={()=>goTab(t)}>{TAB_LABELS[t]}</button>
            ))}
          </div>
          );
        })()}

        {(tab==='home'||tab==='inicio')&&(()=>{
          // Cálculos y Métricas en vivo para el Centro de Mando
          const totalStockKg = invLotes.filter(l=>l.activo).reduce((s,l)=>s+(Number(l.cantidadKgDisponible)||0),0);
          const totalBolsasCount = bitBolsas.length;
          const bolsasIncubacion = bitBolsas.filter(b=>b.estado==='sana'&&!b.col100).length;
          const bolsasFructificacion = bitBolsas.filter(b=>b.estado==='sana'&&b.col100).length;
          const bolsasContaminadas = bitBolsas.filter(b=>b.estado==='contaminada').length;
          const totalCosechasKg = bitCosechas.reduce((s,c)=>s+(parseFloat(c.pesoFresco)||0),0)/1000;
          const totalCosechasCount = bitCosechas.length;
          const activeRecipeCount = recipe.length;
          const activeScore = opt?.score ?? (an ? scoreAn(an, { treatment: tr, recipe, stockIds }).score : null);
          const activeLotes = bitLotes.filter(l=>!['completado','descartado'].includes(l.estado));
          const operationalNow = Date.now();
          const operationalSource = activeLotes.map((lote,index)=>{
            const stats=calcLoteStats(lote.id);
            const contaminated=stats&&stats.contPct>0;
            const inoculated=Date.parse(lote.fechaInoculacion||'');
            const age=Number.isFinite(inoculated)?Math.max(0,Math.floor((operationalNow-inoculated)/86400000)):0;
            return {id:lote.id,lote,severity:stats&&stats.contPct>=20?'critical':undefined,blocked:contaminated&&stats.contPct<20,
              dueAt:!contaminated&&age>=14?new Date(operationalNow-(index+1)*3600000).toISOString():new Date(operationalNow+(index+1)*3600000).toISOString()};
          });
          const operationalQueue=workflow?workflow.buildTodayQueue(operationalSource,operationalNow):operationalSource;
          const criticalTaskCount=operationalQueue.filter(item=>item.bucket==='critical').length;
          const overdueTaskCount=operationalQueue.filter(item=>item.bucket==='overdue').length;
          const blockedTaskCount=operationalQueue.filter(item=>item.bucket==='blocked').length;
          const pendingTaskCount=operationalQueue.filter(item=>!['later','context'].includes(item.bucket)).length;
          const incidentCount=criticalTaskCount+blockedTaskCount+lowStockCount;
          const operationStatus=criticalTaskCount>0
            ?{label:`${criticalTaskCount} crítica${criticalTaskCount===1?'':'s'}`,color:'var(--coral-700)'}
            :(overdueTaskCount>0||incidentCount>0)
              ?{label:`${overdueTaskCount+incidentCount} pendiente${overdueTaskCount+incidentCount===1?'':'s'}`,color:'var(--ochre-700)'}
              :{label:'Operación estable',color:'var(--moss-700)'};

          // Ambientes & Sensores: cámaras físicas REALES (mismos datos que el
          // módulo Cámaras — id, temp/hum/CO₂ en vivo, sparkline). Antes esta
          // sección mostraba 4 "salas" ilustrativas sin relación con las cámaras
          // reales (incub/martha/cloudlab); ahora son los mismos 3 registros,
          // así que un clic en "Ver en Cámaras" siempre abre la cámara correcta.
          let camaras=[];
          try{ camaras=JSON.parse(props.hoyCamarasJson||'[]'); }catch(e){ camaras=[]; }

          // Sección E: Fases del ciclo de cultivo
          // accent/icon de cada fase retoman el mismo color que ya usa el workspace
          // donde esa fase realmente ocurre (incubación=slate, fructificación=moss,
          // etc.) — el color del pipeline anticipa a dónde lleva el clic, no es
          // decorativo.
          const pipelineStages = [
            {
              num: '01',
              title: 'Preparación & Mezcla',
              sub: 'Pesado, hidratación 65–68% y pasteurización/autoclave Tenjo (P.Eb 91.4°C)',
              badge: activeRecipeCount > 0 ? `${activeRecipeCount} insumos en receta activa` : 'En espera de receta',
              active: activeRecipeCount > 0,
              linkTab: 'formular',
              accent: 'var(--coral-500)',
              icon: IconFlame
            },
            {
              num: '02',
              title: 'Inoculación & Incubación',
              sub: 'Días 1–18 · Oscuridad 22–24°C · Inoculación spawn 8–10%',
              badge: `${bolsasIncubacion} bolsas en incubación`,
              active: bolsasIncubacion > 0,
              linkTab: 'bitacora',
              accent: 'var(--slate-500)',
              icon: IconSprout
            },
            {
              num: '03',
              title: 'Inducción / Primordios',
              sub: 'Días 19–23 · Shock térmico Sabana (12–16°C), luz difusa y CO₂ <900ppm',
              badge: `${bitBolsas.filter(b=>b.col100).length} bolsas colonizadas 100%`,
              active: bitBolsas.filter(b=>b.col100).length > 0,
              linkTab: 'schedule',
              accent: 'var(--sand-500)',
              icon: IconSnowflake
            },
            {
              num: '04',
              title: 'Fructificación & Cosecha',
              sub: 'Días 24–45 · Humedad 85–92% · Cosecha en botón / sombrero',
              badge: `${totalCosechasCount} cortes (${totalCosechasKg.toFixed(1)} kg totales)`,
              active: totalCosechasCount > 0,
              linkTab: 'bitacora',
              accent: 'var(--moss-700)',
              icon: IconMushroom
            },
            {
              num: '05',
              title: 'Post-Cosecha & Descanso',
              sub: '2° y 3° flush · Trazabilidad de Eficiencia Biológica · Sustrato gastado (SMS)',
              badge: `${bitLotes.length} lotes con trazabilidad`,
              active: bitLotes.length > 0,
              linkTab: 'dashboard',
              accent: 'var(--ink-700)',
              icon: IconScale
            }
          ];

          return (
            <div className="home-cockpit" style={{display:'flex',flexDirection:'column',gap:24,marginBottom:48}}>
              {/* CABECERA PRINCIPAL DEL CENTRO DE MANDO */}
              <div style={{
                background:'var(--paper-0)',
                border:'1px solid var(--border-soft)',
                borderRadius:'var(--r-md)',
                padding:'18px 22px',
                position:'relative',
                overflow:'hidden'
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
                  <div style={{minWidth:240}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <span style={{width:8,height:8,borderRadius:'50%',background:operationStatus.color,display:'inline-block'}}></span>
                      <span style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',fontWeight:800,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:operationStatus.color}}>
                        CONTROL · TURNO ACTUAL
                      </span>
                    </div>
                    <h1 style={{fontFamily:'var(--font-display)',fontWeight:400,fontSize:'var(--text-2xl)',lineHeight:1.1,letterSpacing:'-0.02em',color:'var(--ink-900)',margin:0}}>
                      Hoy
                    </h1>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
                    {[
                      {value:activeLotes.length,label:'Lotes activos',icon:IconMicroscope,tone:'neutral'},
                      {value:pendingTaskCount,label:'Tareas pendientes',icon:IconClipboard,tone:pendingTaskCount>0?'attention':'neutral'},
                      {value:incidentCount,label:'Incidencias',icon:IconAlert,tone:incidentCount>0?'critical':'neutral'}
                    ].map(kpi=>{
                      const tones={
                        neutral:{bg:'var(--paper-100)',border:'var(--paper-300)',ink:'var(--ink-700)',weight:700},
                        attention:{bg:'color-mix(in oklab,var(--ochre-500) 12%,var(--paper-0))',border:'var(--ochre-500)',ink:'var(--ochre-700)',weight:800},
                        critical:{bg:'color-mix(in oklab,var(--coral-500) 14%,var(--paper-0))',border:'var(--coral-700)',ink:'var(--coral-700)',weight:800}
                      };
                      const t=tones[kpi.tone];
                      return <span key={kpi.label} style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',padding:'6px 10px',background:t.bg,border:`1px solid ${t.border}`,borderRadius:'var(--r-xs)',color:t.ink,fontWeight:t.weight}}>
                        <kpi.icon size={12}/>
                        <strong style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)',color:t.ink}}>{kpi.value}</strong> {kpi.label}
                      </span>;
                    })}
                    <span role="status" aria-label={`Estado operativo: ${operationStatus.label}`} style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:'var(--text-xs)',padding:'6px 10px',background:'var(--paper-50)',border:`1px solid ${operationStatus.color}`,borderRadius:'var(--r-xs)',color:operationStatus.color}}>
                      {operationStatus.label}
                    </span>
                  </div>
                </div>

                {/* JORNADA + MODOS DE OPERACIÓN — consolidado desde el antiguo módulo "Sesión" */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:14,flexWrap:'wrap',marginTop:16,paddingTop:16,borderTop:'1px solid var(--paper-300)'}}>
                  <button
                    onClick={()=>{
                      const hasActiveSession=props.hasActiveSession===true||props.hasActiveSession==='true';
                      if(hasActiveSession) props.onContinueSession&&props.onContinueSession();
                      else props.onStartSession&&props.onStartSession();
                    }}
                    style={{cursor:'pointer',flex:'1 1 260px',minWidth:220,textAlign:'left',border:'none',background:'var(--ink-900)',color:'var(--paper-0)',borderRadius:'var(--r-sm)',padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
                    <span style={{flex:1,display:'flex',flexDirection:'column',gap:2}}>
                      <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-base)'}}>{props.sessionLabel||'Iniciar jornada'}</span>
                      <span style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'rgba(255,255,255,0.7)'}}>{props.sessionSub}</span>
                    </span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)'}}>→</span>
                  </button>
                  <div data-testid="role-selector" style={{display:'flex',border:'1px solid var(--border-soft)',borderRadius:'var(--r-xs)',overflow:'hidden',flex:'none'}}>
                    {[{key:'operator',label:'Operario'},{key:'production',label:'Producción'},{key:'direction',label:'Dirección'}].map((r,i)=>{
                      const sel=props.role===r.key;
                      return (
                        <button key={r.key} onClick={()=>props.onSetRole&&props.onSetRole(r.key)} aria-pressed={sel}
                          style={{cursor:'pointer',padding:'8px 12px',border:'none',borderRight:i<2?'1px solid var(--border-soft)':'none',background:sel?'var(--ink-900)':'var(--paper-0)',color:sel?'var(--paper-0)':'var(--ink-700)',fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',textTransform:'uppercase',letterSpacing:'var(--tracking-button)',fontWeight:700}}>
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {(props.hasHandoff===true||props.hasHandoff==='true')&&(
                  <div style={{marginTop:12,border:'1px solid var(--slate-500)',borderRadius:'var(--r-sm)',padding:'10px 14px',background:'var(--paper-50)'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                      <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',color:'var(--slate-700)'}}>Traspaso del turno anterior</span>
                      <button onClick={()=>props.onClearHandoff&&props.onClearHandoff()} style={{cursor:'pointer',background:'none',border:'none',padding:0,fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',color:'var(--ink-500)'}}>Leído</button>
                    </div>
                    <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-700)',marginTop:4,lineHeight:1.4}}>{props.handoffText}</div>
                  </div>
                )}
              </div>

              {/* SECCIÓN A: TAREAS DE HOY + ACTIVIDAD RECIENTE — mismo bloque, mismo estilo que las demás secciones: título fuera, un solo cuadro adentro */}
              {(()=>{
                let tasksHoy=[], recentActivity=[];
                try{ tasksHoy=JSON.parse(props.tasksHoyJson||'[]'); }catch(e){ tasksHoy=[]; }
                try{ recentActivity=JSON.parse(props.recentActivityJson||'[]'); }catch(e){ recentActivity=[]; }
                if(!tasksHoy.length && !recentActivity.length) return null;
                const prioColor=p=>p==='alta'?'var(--coral-700)':(p==='media'?'var(--ochre-500)':'var(--ink-400)');
                return (
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
                      <div>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>
                          SECCIÓN A · SEGUIMIENTO DEL DÍA
                        </span>
                        <h2 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-lg)',letterSpacing:'-0.01em',color:'var(--ink-900)',marginTop:2,marginBottom:0}}>
                          Tareas y Actividad
                        </h2>
                      </div>
                      {tasksHoy.length>0 && <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--ink-400)'}}>{props.tasksOpenCount}</span>}
                    </div>
                    <div style={{background:'var(--paper-0)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-md)',padding:'18px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:20}}>
                      {tasksHoy.length>0 && (
                        <div>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:10}}>Tareas de hoy</span>
                          <div style={{display:'flex',flexDirection:'column',gap:8}}>
                            {tasksHoy.map(t=>(
                              <div key={t.key} style={{display:'flex',alignItems:'center',gap:2,padding:'4px 12px 4px 4px',border:'1px solid var(--paper-300)',borderRadius:'var(--r-sm)',opacity:t.done?0.5:1}}>
                                <button onClick={()=>props.onTaskToggle&&props.onTaskToggle(t.key)} aria-pressed={t.done} aria-label="Marcar tarea"
                                  style={{cursor:'pointer',flexShrink:0,width:36,height:36,display:'grid',placeItems:'center',padding:0,background:'none',border:'none'}}>
                                  <span style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${t.done?'var(--moss-600)':'var(--paper-300)'}`,background:t.done?'var(--moss-600)':'transparent',display:'grid',placeItems:'center',color:'var(--paper-0)',fontSize:11}}>{t.done?'✓':''}</span>
                                </button>
                                <button onClick={()=>props.onTaskGo&&props.onTaskGo(t.key)} style={{cursor:'pointer',flex:1,minWidth:0,textAlign:'left',background:'none',border:'none',padding:0,display:'flex',flexDirection:'column',gap:2}}>
                                  <span style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--text-sm)',color:'var(--ink-900)',textDecoration:t.done?'line-through':'none'}}>{t.title}</span>
                                  <span style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-500)'}}><span style={{fontFamily:'var(--font-mono)'}}>{t.id}</span> · {t.why}</span>
                                </button>
                                <span style={{flexShrink:0,fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',fontWeight:700,textTransform:'uppercase',letterSpacing:'var(--tracking-button)',color:prioColor(t.prio),border:`1px solid ${prioColor(t.prio)}`,padding:'2px 7px',borderRadius:3}}>{t.prio}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {recentActivity.length>0 && (
                        <div style={{borderLeft:tasksHoy.length>0?'1px solid var(--paper-300)':'none',paddingLeft:tasksHoy.length>0?20:0}}>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:10}}>Actividad reciente</span>
                          <div style={{display:'flex',flexDirection:'column'}}>
                            {recentActivity.map((ev,i)=>(
                              <div key={i} style={{display:'flex',gap:12,padding:'11px 0',borderBottom:'1px solid var(--paper-300)'}}>
                                <span style={{flexShrink:0,width:8,height:8,borderRadius:'50%',background:ev.accent,marginTop:6}}></span>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                                    <span style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--text-sm)',color:'var(--ink-900)'}}>{ev.typeLabel}</span>
                                    <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--slate-600)'}}>{ev.container}</span>
                                  </div>
                                  <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-600)',marginTop:1}}>{ev.note}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* SECCIÓN B: ACCIONES RÁPIDAS (columna izquierda) + REGISTRO DE CULTIVO (columna izquierda, abajo) */}
              {(()=>{
                return (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:20,alignItems:'start'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:20}}>
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
                          <div>
                            <span style={{fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',fontWeight:800,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>
                              SECCIÓN B · OPERACIÓN INMEDIATA
                            </span>
                            <h2 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-lg)',letterSpacing:'-0.01em',color:'var(--ink-900)',marginTop:2,marginBottom:0}}>
                              Acciones Rápidas
                            </h2>
                          </div>
                          <span style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-400)'}}>Acceso a 1 clic</span>
                        </div>
                        <div style={{
                          display:'grid',
                          gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',
                          gap:12
                        }}>
                          {[
                            {label:'Escanear lote',sub:'Registro de campo por QR',icon:IconTarget,tab:'registro',onClick:()=>props.onScanLot&&props.onScanLot(),pri:true},
                            {label:'Formular Receta',sub:'Balance C:N & Perito',icon:IconBolt,tab:'formular',onClick:()=>goTab('formular')},
                            {label:'Entrada a Bodega',sub:'Compras & stock FIFO',icon:IconBox,tab:'inventario',onClick:()=>{goTab('inventario');setInvTab('compra');}},
                            {label:'Lotes',sub:'Crear y gestionar lotes',icon:IconMicroscope,tab:'bitacora',onClick:()=>goTab('bitacora')},
                            {label:'Módulos de cultivo',sub:'Mezcla, clima y producción',icon:IconClipboard,tab:'produccion',onClick:()=>goTab('produccion')}
                          ].map(btn=>(
                            <button
                              key={btn.label}
                              onClick={btn.onClick}
                              className={'home-quick-action'+(btn.pri?' is-primary':'')}
                              style={{
                                display:'flex',
                                alignItems:'center',
                                gap:12,
                                padding:'14px 16px',
                                borderRadius:'var(--r-sm)',
                                textAlign:'left',
                                cursor:'pointer',
                                position:'relative'
                              }}
                            >
                              <span style={{display:'inline-flex',flexShrink:0,color:btn.pri?'var(--moss-700)':'var(--ink-700)'}}><btn.icon size={20}/></span>
                              <div style={{minWidth:0,flex:1}}>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-sm)',color:btn.pri?'var(--moss-700)':'var(--ink-900)',lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                                  {btn.label}
                                </div>
                                <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-500)',marginTop:2,lineHeight:1.1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                                  {btn.sub}
                                </div>
                              </div>
                              <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)',color:btn.pri?'var(--moss-700)':'var(--ink-400)',fontWeight:700}}>→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{background:'var(--paper-0)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-md)',padding:'18px 20px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12,flexWrap:'wrap',gap:8}}>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>Registro de cultivo · vista previa</span>
                          <button onClick={()=>props.onGoRegistro&&props.onGoRegistro()} style={{cursor:'pointer',background:'none',border:'none',padding:0,fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',fontWeight:700,color:'var(--coral-600)'}}>Ver registro completo →</button>
                        </div>
                        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:2}}>
                          {[
                            {label:'Eventos',value:props.hoyPreviewEventos,onClick:props.onGoRevEventos},
                            {label:'Rendimiento (EB)',value:`${props.hoyPreviewBe}%`,onClick:props.onGoRevRendimiento},
                            {label:'Trabajo',value:`${props.hoyPreviewHoras} h`,onClick:props.onGoRevTrabajo},
                            {label:'Supervisión',value:props.hoyPreviewAnomalias,onClick:props.onGoRevSuper,color:props.hoyPreviewAnomaliasColor},
                            {label:'Salidas',value:`${props.hoyPreviewSalidas} kg`,onClick:props.onGoRevSalidas}
                          ].map(m=>(
                            <button key={m.label} onClick={()=>m.onClick&&m.onClick()} style={{cursor:'pointer',flex:'1 0 100px',minWidth:100,textAlign:'left',background:'var(--paper-50)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',padding:'12px 14px'}}>
                              <div style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:'var(--text-lg)',color:m.color||'var(--ink-900)'}}>{m.value}</div>
                              <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-500)'}}>{m.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SECCIÓN C: AMBIENTES & SENSORES — cámaras físicas reales, no salas ilustrativas */}
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
                  <div>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>
                      SECCIÓN C · AMBIENTES & SENSORES
                    </span>
                    <h2 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-lg)',letterSpacing:'-0.01em',color:'var(--ink-900)',marginTop:2,marginBottom:0}}>
                      Cámaras de Cultivo
                    </h2>
                  </div>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--moss-700)'}}>● {camaras.length} {camaras.length===1?'cámara monitoreada':'cámaras monitoreadas'}</span>
                </div>

                {/* 2×2 responsive: dos columnas fijas, colapsa a una por debajo de 640px */}
                <div className="home-salas-grid">
                  {camaras.map(c=>{
                    const hasSpark = c.tempSpark && c.humSpark && c.co2Spark;
                    return (
                    <div
                      key={c.id}
                      style={{
                        background:'var(--paper-0)',
                        border:'1px solid var(--border-soft)',
                        borderTop:`3px solid ${c.estadoAccent||'var(--ink-500)'}`,
                        borderRadius:'var(--r-md)',
                        padding:'20px',
                        display:'flex',
                        flexDirection:'column',
                        justifyContent:'space-between',
                        gap:16,
                        boxShadow:'var(--shadow-card-rest)'
                      }}
                    >
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                          <div style={{display:'flex',alignItems:'center',gap:7}}>
                            <span style={{display:'inline-flex',flexShrink:0,color:c.estadoAccent||'var(--ink-500)'}}><IconCamera size={14}/></span>
                            <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-base)',color:'var(--ink-900)'}}>
                              {c.name}
                            </div>
                          </div>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,padding:'2px 8px',borderRadius:'var(--r-xs)',background:'var(--status-active-bg)',color:'var(--moss-700)',textTransform:'uppercase',letterSpacing:'var(--tracking-button)'}}>
                            {c.estadoLabel}
                          </span>
                        </div>
                        <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-500)',marginBottom:14}}>
                          Zona {c.zona} · {c.sppName}
                        </div>

                        {/* Indicadores climáticos en vivo */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:8,background:'var(--paper-50)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',padding:'10px 8px',textAlign:'center'}}>
                          <div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Temp</div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-md)',fontWeight:700,color:'var(--ink-900)',marginTop:2}}>{c.liveTemp}°C</div>
                          </div>
                          <div style={{borderLeft:'1px solid var(--paper-300)',borderRight:'1px solid var(--paper-300)'}}>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Humedad</div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-md)',fontWeight:700,color:'var(--ink-900)',marginTop:2}}>{c.liveHum}%</div>
                          </div>
                          <div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>CO₂</div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-md)',fontWeight:700,color:'var(--ink-900)',marginTop:2}}>{c.liveCo2} <span style={{fontSize:'var(--text-micro)'}}>ppm</span></div>
                          </div>
                        </div>
                        {c.hasLiveAlert && (
                          <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--coral-700)',marginTop:8}}>{c.liveAlertNote}</div>
                        )}
                      </div>

                      {/* Footer con ocupación real (contenedores activos / capacidad kg) */}
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--paper-300)',paddingTop:12,fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--ink-600)'}}>
                        <span>Ocupación / Carga:</span>
                        <b style={{color:'var(--ink-900)',fontFamily:'var(--font-body)',fontWeight:700}}>{c.occupancy}% <span style={{fontWeight:400,color:'var(--ink-500)'}}>· {c.capKg} kg cap.</span></b>
                      </div>

                      {/* Gráfica de tendencia real (temp/hum/CO₂) — mismos datos y mismo lenguaje
                          visual que el módulo Cámaras: trazo 2px redondeado, punto "ahora", leyenda. */}
                      {hasSpark && (
                        <div style={{borderTop:'1px solid var(--paper-300)',paddingTop:12}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase',letterSpacing:'var(--tracking-button)'}}>Tendencia</span>
                            <button onClick={()=>props.onOpenCamara&&props.onOpenCamara(c.id)} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',padding:0,cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',color:'var(--coral-600)',fontWeight:700}}>
                              <IconCamera size={11}/> Ver detalle →
                            </button>
                          </div>
                          <svg viewBox="0 0 280 40" preserveAspectRatio="none" role="img" aria-label={`Tendencia últimas horas en ${c.name}: temperatura, humedad y CO₂`} style={{width:'100%',height:36,overflow:'visible',display:'block'}}>
                            <polyline points={c.tempSpark} fill="none" stroke="var(--coral-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points={c.humSpark} fill="none" stroke="var(--slate-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points={c.co2Spark} fill="none" stroke="var(--moss-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx={280} cy={c.tempSparkEndY} r="3" fill="var(--coral-500)"/>
                            <circle cx={280} cy={c.humSparkEndY} r="3" fill="var(--slate-500)"/>
                            <circle cx={280} cy={c.co2SparkEndY} r="3" fill="var(--moss-500)"/>
                          </svg>
                          <div style={{display:'flex',gap:10,marginTop:6}}>
                            <span style={{display:'flex',alignItems:'center',gap:4,fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',color:'var(--ink-500)'}}><span style={{width:9,height:2,background:'var(--coral-500)',display:'inline-block'}}/>Temp.</span>
                            <span style={{display:'flex',alignItems:'center',gap:4,fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',color:'var(--ink-500)'}}><span style={{width:9,height:2,background:'var(--slate-500)',display:'inline-block'}}/>Humedad</span>
                            <span style={{display:'flex',alignItems:'center',gap:4,fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',color:'var(--ink-500)'}}><span style={{width:9,height:2,background:'var(--moss-500)',display:'inline-block'}}/>CO₂</span>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN D: ESPACIOS DE TRABAJO / MÓDULOS DE OPERACIÓN */}
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
                  <div>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>
                      SECCIÓN D · MÓDULOS DE CAMPO
                    </span>
                    <h2 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-lg)',letterSpacing:'-0.01em',color:'var(--ink-900)',marginTop:2,marginBottom:0}}>
                      Espacios de Trabajo
                    </h2>
                  </div>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--ink-500)'}}>Flujos principales</span>
                </div>

                <div style={{
                  display:'grid',
                  gridTemplateColumns:props.isAdmin!==false ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap:20
                }}>
                  {/* WORKSPACE 1: FORMULACIÓN & I+D */}
                  <div style={{
                    background:'var(--paper-0)',
                    border:'1px solid var(--border-soft)',
                    borderTop:'3px solid var(--coral-500)',
                    borderRadius:'var(--r-md)',
                    padding:'24px',
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'space-between',
                    gap:18,
                    boxShadow:'var(--shadow-card-rest)'
                  }}>
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--coral-500)'}}>
                          <IconMicroscope size={11}/> LABORATORIO & NUTRICIÓN
                        </span>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--ink-400)'}}>{saved.length} guardadas</span>
                      </div>
                      <h3 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-md)',color:'var(--ink-900)',marginBottom:8}}>
                        Formulación & Recetario
                      </h3>
                      <p style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-600)',lineHeight:1.45,marginBottom:16}}>
                        Balance estequiométrico de carbono y nitrógeno (C:N), suplementación y cálculo predictivo de Eficiencia Biológica (EB).
                      </p>

                      {/* Métricas en vivo del workspace */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:8,background:'var(--paper-50)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',padding:'12px',marginBottom:16}}>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Score Perito</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:activeScore>=80?'var(--moss-700)':activeScore>=60?'var(--ochre-500)':'var(--coral-700)'}}>
                            {activeScore!==null ? `${activeScore}/100` : '—'}
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>C:N Activo</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:'var(--ink-900)'}}>
                            {an?.cn ? `${an.cn.toFixed(1)}:1` : '—'}
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>EB Estimada</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:!an?.eb?'var(--ink-900)':(sp?.eb_optimal&&an.eb>=sp.eb_optimal?'var(--moss-700)':sp?.eb_baseline&&an.eb>=sp.eb_baseline?'var(--ochre-500)':'var(--coral-700)')}}>
                            {an?.eb ? `~${an.eb}%` : '—'}
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Ingredientes</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:'var(--ink-900)'}}>
                            {recipe.length} insumos
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>goTab('formular')} className="home-panel-btn is-primary" style={{flex:1,padding:'8px 12px',background:'var(--moss-700)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',cursor:'pointer'}}>
                        Ir al Formulador
                      </button>
                      <button onClick={()=>goTab('catalogo')} className="home-panel-btn is-secondary" style={{padding:'8px 12px',background:'transparent',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',cursor:'pointer'}}>
                        Catálogo
                      </button>
                    </div>
                  </div>

                  {/* WORKSPACE 2: PRODUCCIÓN & BODEGA */}
                  <div style={{
                    background:'var(--paper-0)',
                    border:'1px solid var(--border-soft)',
                    borderTop:'3px solid var(--moss-700)',
                    borderRadius:'var(--r-md)',
                    padding:'24px',
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'space-between',
                    gap:18,
                    boxShadow:'var(--shadow-card-rest)'
                  }}>
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--moss-700)'}}>
                          <IconBox size={11}/> PLANTA & INSUMOS
                        </span>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--ink-400)'}}>{stockIds.size} variedades</span>
                      </div>
                      <h3 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-md)',color:'var(--ink-900)',marginBottom:8}}>
                        Producción & Bodega
                      </h3>
                      <p style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-600)',lineHeight:1.45,marginBottom:16}}>
                        Ficha de mezclado con tolerancia de báscula de campo, gestión FIFO de inventario y trazabilidad de proveedores.
                      </p>

                      {/* Métricas en vivo */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:8,background:'var(--paper-50)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',padding:'12px',marginBottom:16}}>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Stock Disponible</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:'var(--ink-900)'}}>
                            {totalStockKg.toFixed(1)} <span style={{fontSize:'var(--text-xs)',color:'var(--ink-500)'}}>kg</span>
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Lotes de Insumos</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:'var(--ink-900)'}}>
                            {invLotes.filter(l=>l.activo).length}
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Proveedores</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:'var(--ink-900)'}}>
                            {invProveedores.length} activos
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Compras Reg.</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:'var(--ink-900)'}}>
                            {invCompras.length} facturas
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>goTab('produccion')} className="home-panel-btn is-primary" style={{flex:1,padding:'8px 12px',background:'var(--moss-700)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',cursor:'pointer'}}>
                        Ficha de Mezclado
                      </button>
                      <button onClick={()=>goTab('inventario')} className="home-panel-btn is-secondary" style={{padding:'8px 12px',background:'transparent',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',cursor:'pointer'}}>
                        Bodega
                      </button>
                    </div>
                  </div>

                  {/* WORKSPACE 3: BITÁCORA & COSECHAS */}
                  <div style={{
                    background:'var(--paper-0)',
                    border:'1px solid var(--border-soft)',
                    borderTop:'3px solid var(--slate-500)',
                    borderRadius:'var(--r-md)',
                    padding:'24px',
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'space-between',
                    gap:18,
                    boxShadow:'var(--shadow-card-rest)'
                  }}>
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--slate-500)'}}>
                          <IconMushroom size={11}/> TRAZABILIDAD & CAMPO
                        </span>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--ink-400)'}}>{bitLotes.length} lotes</span>
                      </div>
                      <h3 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-md)',color:'var(--ink-900)',marginBottom:8}}>
                        Bitácora & Cosechas
                      </h3>
                      <p style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-600)',lineHeight:1.45,marginBottom:16}}>
                        Seguimiento individual de bolsas, registro de colonización, alertas fitosanitarias y pesaje de cosechas.
                      </p>

                      {/* Métricas en vivo */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:8,background:'var(--paper-50)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',padding:'12px',marginBottom:16}}>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Bolsas Monitoreadas</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:'var(--ink-900)'}}>
                            {totalBolsasCount}
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Total Cosechado</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:'var(--ink-900)'}}>
                            {totalCosechasKg.toFixed(2)} <span style={{fontSize:'var(--text-xs)'}}>kg</span>
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Contaminación</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:bolsasContaminadas===0?'var(--moss-700)':'var(--coral-700)'}}>
                            {totalBolsasCount>0 ? `${((bolsasContaminadas/totalBolsasCount)*100).toFixed(0)}%` : '0%'}
                          </div>
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Eventos Corte</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:'var(--ink-900)'}}>
                            {totalCosechasCount} flushes
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>setShowBitCosecha(true)} className="home-panel-btn is-primary" style={{flex:1,padding:'8px 12px',background:'var(--sand-500)',color:'var(--ink-900)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',cursor:'pointer'}}>
                        + Registrar Cosecha
                      </button>
                      <button onClick={()=>goTab('bitacora')} className="home-panel-btn is-secondary" style={{padding:'8px 12px',background:'transparent',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',cursor:'pointer'}}>
                        Ver Bitácora
                      </button>
                    </div>
                  </div>

                  {/* WORKSPACE 4: FINANZAS & DASHBOARD (Solo visible para Administradores / Roles no-operario) */}
                  {props.isAdmin!==false && (
                    <div style={{
                      background:'var(--paper-0)',
                      border:'1px solid var(--border-soft)',
                      borderTop:'3px solid var(--ink-700)',
                      borderRadius:'var(--r-md)',
                      padding:'24px',
                      display:'flex',
                      flexDirection:'column',
                      justifyContent:'space-between',
                      gap:18,
                      boxShadow:'var(--shadow-card-rest)'
                    }}>
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                          <span style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)'}}>
                            <IconScale size={11}/> GESTIÓN & FINANZAS (ADMIN)
                          </span>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--moss-700)'}}>Activo</span>
                        </div>
                        <h3 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-md)',color:'var(--ink-900)',marginBottom:8}}>
                          Finanzas & Rendimiento
                        </h3>
                        <p style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-600)',lineHeight:1.45,marginBottom:16}}>
                          Análisis de costo unitario por kilo seco y por bolsa comercial, balance de proveedores y simulación de márgenes.
                        </p>

                        {/* Métricas en vivo */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:8,background:'var(--paper-50)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',padding:'12px',marginBottom:16}}>
                          <div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Costo/kg Sustrato</div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:'var(--ink-900)'}}>
                              ${an?.cost ? Math.round(an.cost).toLocaleString('es-CO') : '0'} <span style={{fontSize:'var(--text-xs)',color:'var(--ink-500)'}}>COP</span>
                            </div>
                          </div>
                          <div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Bolsa Estándar</div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-lg)',fontWeight:700,color:'var(--ink-900)'}}>
                              ${an?.cost ? Math.round(an.cost * 1.5 * 0.35).toLocaleString('es-CO') : '0'} <span style={{fontSize:'var(--text-xs)',color:'var(--ink-500)'}}>COP</span>
                            </div>
                          </div>
                          <div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Recetas Evaluadas</div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:'var(--ink-900)'}}>
                              {saved.length} fórmulas
                            </div>
                          </div>
                          <div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-500)',textTransform:'uppercase'}}>Ciclo Planificado</div>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-base)',fontWeight:700,color:'var(--ink-900)'}}>
                              {sch?.totDays || 45} días
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>goTab('dashboard')} className="home-panel-btn is-primary" style={{flex:1,padding:'8px 12px',background:'var(--ink-900)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',cursor:'pointer'}}>
                          Dashboard
                        </button>
                        <button onClick={()=>goTab('schedule')} className="home-panel-btn is-secondary" style={{padding:'8px 12px',background:'transparent',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',cursor:'pointer'}}>
                          Cronograma
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN E: PIPELINE DE LOTES ACTIVOS / CICLO DE CULTIVO */}
              <div style={{
                background:'var(--paper-0)',
                border:'1px solid var(--border-soft)',
                borderRadius:'var(--r-md)',
                padding:'28px',
                boxShadow:'var(--shadow-card-rest)'
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:16,flexWrap:'wrap',gap:8}}>
                  <div>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>
                      SECCIÓN E · CICLO BIOLÓGICO TENJO
                    </span>
                    <h2 style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-lg)',letterSpacing:'-0.01em',color:'var(--ink-900)',marginTop:2,marginBottom:0}}>
                      Pipeline de Lotes & Fases de Cultivo
                    </h2>
                  </div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--ink-600)'}}>
                    Ciclo total promedio: ~42–48 días
                  </div>
                </div>

                {/* 5 Stages Horizontal Stepper */}
                <div style={{
                  display:'grid',
                  gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',
                  gap:12,
                  marginBottom:20
                }}>
                  {pipelineStages.map((st,idx)=>(
                    <div
                      key={st.num}
                      role="button"
                      tabIndex={0}
                      aria-label={`${st.title} — ${st.active?'en curso':'planificado'}`}
                      onClick={()=>goTab(st.linkTab)}
                      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();goTab(st.linkTab);}}}
                      className={'home-stage-card'+(st.active?' is-active':'')}
                      style={{
                        '--stage-accent':st.accent,
                        borderRadius:'var(--r-sm)',
                        padding:'14px',
                        cursor:'pointer',
                        position:'relative'
                      }}
                    >
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:20,height:20,borderRadius:'50%',flexShrink:0,background:st.active?st.accent:'var(--paper-200)',color:st.active?'var(--paper-0)':'var(--ink-500)',fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',fontWeight:700}}>
                          {st.num.replace(/^0/,'')}
                        </span>
                        <span style={{fontSize:'var(--text-micro)',fontFamily:'var(--font-mono)',padding:'1px 5px',borderRadius:2,background:st.active?'var(--status-active-bg)':'var(--paper-200)',color:st.active?st.accent:'var(--ink-500)'}}>
                          {st.active?'En curso':'Plan'}
                        </span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                        <span style={{display:'inline-flex',flexShrink:0,color:st.accent}}><st.icon size={13}/></span>
                        <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--text-sm)',color:'var(--ink-900)'}}>
                          {st.title}
                        </div>
                      </div>
                      <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-2xs)',color:'var(--ink-600)',lineHeight:1.35,marginBottom:8}}>
                        {st.sub}
                      </div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',fontWeight:700,color:'var(--ink-800)',borderTop:'1px solid var(--paper-300)',paddingTop:6}}>
                        {st.badge}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen de lotes activos si existen en la bitácora */}
                {bitLotes.length>0 ? (
                  <div style={{borderTop:'1px solid var(--paper-300)',paddingTop:16}}>
                    <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',marginBottom:10}}>
                      Lotes Recientes en Seguimiento
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {bitLotes.slice(0,4).map(lt=>{
                        const stats = calcLoteStats(lt.id);
                        return (
                          <div
                            key={lt.id}
                            data-lote-id={lt.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`Abrir lote ${lt.codigo} · ${lt.especie||'sin especie'}`}
                            onClick={()=>{setBitActiveLoteId(lt.id);goTab('bitacora');goBitTab('bit_bolsas',true);}}
                            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setBitActiveLoteId(lt.id);goTab('bitacora');goBitTab('bit_bolsas',true);}}}
                            className="home-lote-row"
                            style={{
                              display:'flex',
                              justifyContent:'space-between',
                              alignItems:'center',
                              padding:'10px 14px',
                              borderRadius:'var(--r-xs)',
                              cursor:'pointer',
                              flexWrap:'wrap',
                              gap:8
                            }}
                          >
                            <div style={{display:'flex',alignItems:'center',gap:12}}>
                              <span style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:'var(--text-sm)',color:'var(--ink-900)'}}>
                                {lt.codigo}
                              </span>
                              <span style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-600)'}}>
                                {lt.especie} · {lt.numBolsas || 1} bolsas · {lt.fechaInoculacion || lt.fechaMezcla || 'Sin fecha'}
                              </span>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:16}}>
                              {stats?.totalFresco>0 && (
                                <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--moss-700)',fontWeight:700}}>
                                  {stats.totalFresco.toFixed(2)} kg cosechados
                                </span>
                              )}
                              <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--moss-700)',fontWeight:700}}>
                                Ver lote →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{borderTop:'1px solid var(--paper-300)',paddingTop:14,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                    <span style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-500)'}}>
                      No hay lotes registrados aún. Puedes iniciar un nuevo lote desde la Ficha de Producción o la Bitácora.
                    </span>
                    <button onClick={()=>setShowBitNuevo(true)} style={{padding:'5px 12px',background:'var(--moss-700)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-xs)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',cursor:'pointer'}}>
                      + Iniciar Primer Lote
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })()}
        {tab==='catalogo'&&(
          <div className="spp-sect spp-sect-catalog">
            <div className="catalog-hdr">
              <div>
                <span className="catalog-eyebrow">Receta</span>
                <h2 className="catalog-title">Catálogo de especies</h2>
              </div>

            </div>
            <div className="spp-grid">
              {Object.entries(SPP).map(([k,d],idx)=>{
                const hasImg=!!IMG[k];
                const isOn=sKey===k;
                const num=String(idx+1).padStart(2,'0');
                return(
                  <button key={k} className={`spp-card${(isOn&&hasPickedSpecies)?' on':''}`} aria-pressed={isOn&&hasPickedSpecies} onClick={()=>{setSKey(k);setCatalogModalOpen(true);}}>
                    <div style={{position:'relative',display:'flex',flexDirection:'column',flex:1,overflow:'hidden',borderRadius:'var(--r-xs)'}}>
                    <div className="p-family-strip"><span>{SPP_FAMILY[k]||''}</span></div>
                    <div className="p-arch-head">
                      <div className="p-arch-left"><span className="p-arch-num">{num}</span><span className="p-arch-code">{SPP_CODE[k]}</span></div>
                      <span className="p-activa">Activa</span>
                    </div>
                    {hasImg
                      ?<div className="p-img"><img src={IMG[k]} alt={d.name} width="320" height="240" loading="lazy" decoding="async"/></div>
                      :<div className="p-svg" style={{marginLeft:16}}><SppSvg sKey={k} c={isOn?'var(--accent-blue-grey)':'var(--accent-mushroom)'}/></div>
                    }
                    <div className="p-body">
                      <div className="p-sci">{d.scientific}</div>
                      <div className="p-common">{d.name}</div>
                    </div>
                    <div className="p-chips">
                      <div className="p-chips-row p-chips-row1">
                        <div className="p-chip"><span className="p-chip-ico"><IcoTherm/></span><span className="p-chip-txt"><span className="p-chip-lbl">Temp</span><span className="p-chip-val">{d.temp_fruit}</span></span></div>
                        <div className="p-chip"><span className="p-chip-ico"><IcoDrop/></span><span className="p-chip-txt"><span className="p-chip-lbl">HR</span><span className="p-chip-val">{SPP_HR[k]}</span></span></div>
                        <div className="p-chip"><span className="p-chip-ico"><IcoLayers/></span><span className="p-chip-txt"><span className="p-chip-lbl">Sustrato</span><span className="p-chip-val">{d.substrate||'Paja + Madera'}</span></span></div>
                      </div>
                      <div className="p-chips-row p-chips-row2">
                        <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">pH</span><span className="p-chip-val">{d.ph_optimal.min}–{d.ph_optimal.max}</span></span></div>
                        <div className="p-chip"><span className="p-chip-txt"><span className="p-chip-lbl">C:N</span><span className="p-chip-val">{d.cn_optimal.min}–{d.cn_optimal.max}</span></span></div>
                        <div className="p-chip p-chip-arr" onClick={e=>{e.stopPropagation();setSKey(k);setCatalogModalOpen(true);}}><IcoArrow/></div>
                      </div>
                    </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {catalogModalOpen&&sp&&(()=>{
              const det=SPP_DETAILS[sKey]||{};
              const IcoAp=()=><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="6" cy="5" r="3"/><path d="M2 10c0-2 1.5-3 4-3s4 1 4 3"/></svg>;
              const IcoSab=()=><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M6 2c-2.5 0-4 1.5-4 3.5 0 3 4 5.5 4 5.5s4-2.5 4-5.5C10 3.5 8.5 2 6 2z"/></svg>;
              const IcoUso=()=><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M2 6h8M6 2v8"/><rect x="1" y="1" width="10" height="10" rx="1"/></svg>;
              return(
              <div className="cat-modal-bg" onClick={()=>setCatalogModalOpen(false)}>
              <div className="cat-modal-box" onClick={e=>e.stopPropagation()}>
              <button className="cat-modal-close" onClick={()=>setCatalogModalOpen(false)} title="Cerrar" aria-label="Cerrar ficha de especie">✕</button>
              <div className="spp-info-2col" style={{margin:0}}>
                {/* LEFT: Texto + franja de parámetros + CTA */}
                <div className="spp-info-left">
                  <div className="spp-info-top" style={{background:'color-mix(in oklab,var(--moss-100) 40%,var(--paper-50))'}}>
                    <div className="spp-info-sci">{sp.scientific}</div>
                    <h2 className="spp-info-name">{sp.name}</h2>
                    <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:12,paddingBottom:12,borderBottom:'1px solid color-mix(in oklab,var(--moss-400) 20%,transparent)'}}>
                      <div style={{display:'flex',gap:12}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:800,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--moss-700)',marginBottom:4}}>Característica</div>
                          <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-base)",lineHeight:1.4,color:'var(--ink-900)'}}>{sp.notes.split('.')[0]+'.'}</div>
                        </div>
                      </div>
                    </div>
                    {det.hechos&&(
                      <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>
                        {det.hechos.map((h,i)=>(
                          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",fontWeight:700,color:'var(--coral-500)',background:'color-mix(in oklab,var(--coral-200) 40%,var(--paper-50))',border:'1px solid var(--coral-200)',borderRadius:3,padding:'2px 6px',flexShrink:0,marginTop:1,lineHeight:1.6}}>{String(i+1).padStart(2,'0')}</span>
                            <p style={{fontFamily:'var(--font-body)',fontSize:"var(--text-sm)",lineHeight:1.65,color:'var(--ink-700)',margin:0,textWrap:'pretty'}}>{h}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {(()=>{
                      const diffMap={'Baja':1,'Media':2,'Alta':3,'Muy alta':4};
                      const diff=diffMap[SPP_DIFFICULTY[sKey]||'Media']||2;
                      const bars=[
                        {lbl:'Ef. Biológica',min:sp.eb_baseline,max:sp.eb_optimal,abs:150,unit:'%',color:'var(--coral-500)'},
                        {lbl:'Spawn',min:sp.spawn_rate,max:sp.spawn_rate,abs:20,unit:'%',color:'var(--moss-600)'},
                        {lbl:'C:N',min:sp.cn_optimal.min,max:sp.cn_optimal.max,abs:80,unit:'',color:'#594631'},
                        {lbl:'pH',min:sp.ph_optimal.min,max:sp.ph_optimal.max,abs:10,unit:'',color:'var(--ochre-500)'},
                      ];
                      return(
                        <div style={{marginTop:20,padding:'14px 0 2px',borderTop:'1px solid color-mix(in oklab,var(--moss-400) 30%,transparent)'}}>
                          <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--moss-700)',marginBottom:8}}>Parámetros de cultivo</div>
                          <div style={{display:'flex',flexDirection:'column',gap:5}}>
                            {bars.map(b=>{
                              const lo=Math.min(b.min,b.max)/b.abs*100;
                              const hi=Math.max(b.min,b.max)/b.abs*100;
                              const w=Math.max(hi-lo,4);
                              return(
                                <div key={b.lbl} style={{display:'flex',alignItems:'center',gap:8}}>
                                  <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",fontWeight:700,color:'var(--ink-800)',width:90,flexShrink:0}}>{b.lbl}</span>
                                  <div style={{flex:1,height:5,background:'var(--paper-300)',borderRadius:3,position:'relative',overflow:'hidden'}}>
                                    <div style={{position:'absolute',left:`${lo}%`,width:`${w}%`,height:'100%',background:b.color,borderRadius:3,transition:'width .5s cubic-bezier(.32,.72,.36,1)'}}></div>
                                  </div>
                                  <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',width:54,textAlign:'right',flexShrink:0}}>{b.min===b.max?`${b.min}${b.unit}`:`${b.min}–${b.max}${b.unit}`}</span>
                                </div>
                              );
                            })}
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",fontWeight:700,color:'var(--ink-800)',width:90,flexShrink:0}}>Dificultad</span>
                              <div style={{flex:1,display:'flex',gap:3}}>
                                {[1,2,3,4].map(d=>(
                                  <div key={d} style={{flex:1,height:5,borderRadius:3,background:d<=diff?'var(--coral-500)':'var(--paper-300)',transition:'background .3s'}}></div>
                                ))}
                              </div>
                              <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',width:54,textAlign:'right',flexShrink:0}}>{SPP_DIFFICULTY[sKey]||'Media'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
                {/* RIGHT: Ilustración full-bleed + CTA */}
                <div className="spp-info-center" style={{display:'flex',flexDirection:'column'}}>
                  <div className="spp-img-wrap" style={{flex:1,position:'relative',minHeight:320}}>
                    {IMG[sKey]&&<img src={IMG[sKey]} alt={sp.name} width="520" height="390" className="spp-info-img" style={{objectPosition:'center 65%'}} loading="lazy" decoding="async"/>}
                  </div>
                  <div className="spp-cta-row">
                    <span className="spp-cta-note">Dificultad: {SPP_DIFFICULTY[sKey]||'Media'}</span>
                    <button onClick={()=>{setCatalogModalOpen(false);goTab('formular');}} className="spp-cta">Formular con {sp.name} →</button>
                  </div>
                </div>
              </div>
              </div>
              </div>
              );
            })()}
          </div>
        )}

        {tab==='formular'&&(
        <div className="builder-wrap" data-tab={tab}>
          {loadedFlash&&<div className="loaded-toast">✓ Receta cargada</div>}

          {/* ── SELECTOR DE MODO GLOBAL: PRODUCCIÓN VS INVESTIGACIÓN ── */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'10px 14px',background:'var(--paper-100)',border:'1.5px solid '+(globalMode==='produccion'?'var(--moss-600)':'var(--coral-500)'),borderRadius:'var(--r-sm)',marginBottom:10,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{display:'inline-flex',color:globalMode==='produccion'?'var(--moss-700)':'var(--coral-600)'}}>{globalMode==='produccion'?<IconFactory size={22}/>:<IconMicroscope size={22}/>}</span>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:globalMode==='produccion'?'var(--moss-700)':'var(--coral-600)'}}>
                    Modo {globalMode==='produccion'?'Producción Oficial (Bodega Tenjo)':'Investigación y Desarrollo (I+D Catálogo)'}
                  </span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',padding:'2px 6px',background:globalMode==='produccion'?'var(--moss-200)':'var(--coral-100)',borderRadius:3,color:'var(--ink-900)',fontWeight:600}}>
                    {globalMode==='produccion'?'Stock Bodega Restringido':'Catálogo Abierto sin límites'}
                  </span>
                </div>
                <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',color:'var(--ink-600)',marginTop:2}}>
                  {globalMode==='produccion'
                    ? 'Optimiza formulaciones con insumos disponibles en Bodega Tenjo y planifica hojas de lote de producción.'
                    : 'Libre exploración botánica sin límite de stock para maximizar Eficiencia Biológica (EB) y crear fórmulas experimentales.'}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <button
                onClick={()=>setGlobalWorkMode('produccion')}
                style={{
                  fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--text-xs)',padding:'6px 12px',
                  background:globalMode==='produccion'?'var(--moss-700,#2E3B2F)':'transparent',
                  color:globalMode==='produccion'?'var(--paper-0)':'var(--ink-700)',
                  border:`1px solid ${globalMode==='produccion'?'var(--moss-700)':'var(--border-soft)'}`,
                  borderRadius:'var(--r-xs)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5
                }}>
                <IconFactory size={12}/> Producción
              </button>
              <button
                onClick={()=>setGlobalWorkMode('investigacion')}
                style={{
                  fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--text-xs)',padding:'6px 12px',
                  background:globalMode==='investigacion'?'var(--coral-500)':'transparent',
                  color:globalMode==='investigacion'?'var(--paper-0)':'var(--ink-700)',
                  border:`1px solid ${globalMode==='investigacion'?'var(--coral-500)':'var(--border-soft)'}`,
                  borderRadius:'var(--r-xs)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5
                }}>
                <IconMicroscope size={12}/> Investigación
              </button>
              {recipe.length>0&&(
                <button
                  onClick={()=>promoverReceta()}
                  title="Promover esta receta a Producción oficial (alerta si faltan insumos)"
                  style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-xs)',padding:'6px 12px',background:'var(--moss-600, #4D6235)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-xs)',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                  <IconStar size={12} fill="currentColor"/> Promover
                </button>
              )}
            </div>
          </div>

          {/* ── STICKY LIVE MINI DASHBOARD (ULTRA-COMPACT SINGLE-LINE & COLLAPSIBLE TRAY) ──
              Decisión de diseño:
              El dashboard pegajoso superior (sim-live-dashboard) centraliza en tiempo real:
              1) Especie activa y modo de trabajo global (PROD / INV).
              2) Score Perito interactivo con acceso directo al dictamen.
              3) Eficiencia Biológica (EB) y Balance de masa (%) con auto-balance 100%.
              4) Conexión en vivo (online/offline) e insumos con edición/eliminación directa.
              5) Sub-navegación contextual por anclas (Insumos, Receta, Perito, Batch, Tratamiento).
              Esto sustituye y unifica sin pérdida las barras estáticas previas, manteniendo
              en bl-perito los análisis profundos (mgrid, EBDial, rangos C:N/N%, nitrógeno y sugerencias).
          ── */}
          <div className="sim-live-dashboard" id="sim-live-dash">
            {recipe.length>0 ? (()=>{
              const sm2=PERITO_STATUS[opt.status]||PERITO_STATUS.sin_receta;
              const limiter=peritoMainLimiter(opt,an);
              const ebVal=an?blendEBWithHistory(an,histStats):0;
              const ebOpt=sp?.eb_optimal||100;
              const ebBase=sp?.eb_baseline||80;
              const ebOk=ebVal>=ebOpt;
              const ebMid=ebVal>=ebBase;
              const ebColor=ebOk?'var(--moss-700,#2E3B2F)':(ebMid?'#976E1A':'#A8432A');
              const totOk=an?Math.abs(an.tot-100)<=0.5:false;
              const totColor=totOk?'var(--moss-700,#2E3B2F)':'#A8432A';

              return(
                <div>
                  {/* Fila única ultra-compacta (~38px) */}
                  <div className="live-dash-bar">
                    {/* Especie y modo */}
                    <div className="live-dash-left">
                      <span className="live-dash-species" title={sp?.name||'Pleurotus ostreatus'}>
                        {sp?.name||'Pleurotus'}
                      </span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:'9px',padding:'1px 4px',borderRadius:2,background:globalMode==='produccion'?'rgba(77,98,53,.15)':'rgba(200,90,50,.15)',color:globalMode==='produccion'?'var(--moss-700)':'var(--coral-500)',fontWeight:700,textTransform:'uppercase'}}>
                        {globalMode==='produccion'?'PROD':'INV'}
                      </span>
                    </div>

                    {/* Métricas clave en micro-píldoras */}
                    <div className="live-dash-metrics">
                      {/* Score Perito */}
                      <button
                        onClick={()=>document.getElementById('bl-perito')?.scrollIntoView({behavior:'smooth',block:'start'})}
                        className="live-dash-pill"
                        style={{background:sm2.bg||'var(--paper-100)',borderColor:`${sm2.badge}40`,cursor:'pointer'}}
                        aria-label={`Score Perito: ${Math.round(opt.score)} de 100, ${sm2.label}. Ver análisis completo`}
                        title={`Score Perito: ${Math.round(opt.score)}/100 · ${sm2.label}\nClick para ver análisis completo`}>
                        <IconTarget size={11} color={sm2.badge} />
                        <span style={{color:sm2.badge,fontWeight:800}}>{Math.round(opt.score)}</span>
                      </button>

                      {/* EB */}
                      <div className="live-dash-pill" title={`Eficiencia Biológica Estimada: ${Math.round(ebVal)}% (Meta: ${ebOpt}%)`}>
                        <span className="live-dash-pill-label">EB</span>
                        <span style={{color:ebColor}}>{Math.round(ebVal)}%</span>
                      </div>

                      {/* Masa Total % */}
                      <div
                        className="live-dash-pill"
                        style={{background:totOk?'rgba(77,98,53,.08)':'rgba(168,67,42,.08)',borderColor:`${totColor}40`}}
                        title={`Balance de masa: ${an?an.tot.toFixed(1):'0'}% (ideal 100%)`}>
                        <span style={{color:totColor,display:'inline-flex',alignItems:'center',gap:3}}>
                          {an?an.tot.toFixed(0):'0'}%
                          {totOk ? <IconCheck size={10} color={totColor} /> : <IconAlert size={10} color={totColor} />}
                        </span>
                      </div>
                    </div>

                    {/* Región viva para lectores de pantalla: anuncia cambios de estado
                        que hoy solo se comunican por color (score/EB/balance de masa). */}
                    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                      {`Score Perito ${Math.round(opt.score)} de 100, ${sm2.label}. `}
                      {`Eficiencia biológica estimada ${Math.round(ebVal)} por ciento${ebOk?', meta alcanzada':(ebMid?', por debajo de la meta':', por debajo de la línea base')}. `}
                      {`Balance de masa ${an?an.tot.toFixed(0):'0'} por ciento${totOk?', correcto':', requiere ajuste al 100 por ciento'}.`}
                    </div>

                    {/* Acciones compactas */}
                    <div className="live-dash-actions">
                      {an&&!totOk&&(
                        <button
                          onClick={()=>autoBalance(balanceMode)}
                          className="live-dash-btn"
                          style={{background:'var(--coral-500)',color:'#fff',borderColor:'var(--coral-600)'}}
                          aria-label="Ajustar ingredientes libres al 100%"
                          title="Ajustar ingredientes libres al 100%">
                          <IconBolt size={10} color="#fff" />
                          <span>100%</span>
                        </button>
                      )}
                      <button
                        onClick={()=>setShowLiveChips(!showLiveChips)}
                        className="live-dash-btn"
                        style={{background:showLiveChips?'var(--paper-300)':'var(--paper-100)'}}
                        aria-label={`${recipe.length} insumos en receta. ${showLiveChips?'Ocultar detalle de fórmula':'Ver fórmula e insumos'}`}
                        aria-expanded={showLiveChips}
                        title={showLiveChips?'Ocultar detalle de fórmula':'Ver fórmula e insumos'}>
                        <IconRecipe size={11} color="var(--ink-700)" />
                        <span>{recipe.length}</span>
                        {showLiveChips ? <IconChevronUp size={9} color="var(--ink-700)" /> : <IconChevronDown size={9} color="var(--ink-700)" />}
                      </button>
                      <button
                        onClick={()=>{
                          if(saveName.trim()){
                            saveR();
                          } else {
                            document.getElementById('bl-receta')?.scrollIntoView({behavior:'smooth',block:'start'});
                            setTimeout(()=>{
                              const inp=document.querySelector('.sbar input');
                              if(inp){ inp.focus(); inp.style.outline='2px solid var(--coral-500)'; setTimeout(()=>inp.style.outline='',1200); }
                            },300);
                          }
                        }}
                        className="live-dash-btn"
                        style={{background:flash?'var(--moss-600)':'var(--ink-900)',color:'#fff',borderColor:'var(--ink-900)'}}
                        aria-label={flash?'Receta guardada':'Guardar receta en Recetario'}
                        title="Guardar receta en Recetario">
                        {flash ? <IconCheck size={11} color="#fff" /> : <IconDisk size={11} color="#fff" />}
                      </button>
                    </div>
                  </div>

                  {/* Bandeja expandible con detalle, chips e hipervínculos */}
                  {showLiveChips&&(
                    <div className="live-dash-tray">
                      {/* Sub-navegación rápida */}
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6,marginBottom:6,flexWrap:'wrap'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {[
                            {id:'bl-ingredientes',l:'Insumos',icon:IconSprout},
                            {id:'bl-receta',l:'Receta',icon:IconRecipe},
                            {id:'bl-perito',l:'Perito',icon:IconTarget},
                            {id:'bl-batch',l:'Batch',icon:IconBox},
                            ...(tr?[{id:'bl-tratamiento',l:'Tratamiento',icon:IconFlame}]:[]),
                          ].map(s=>{
                            const IconComp=s.icon;
                            return (
                              <button
                                key={s.id}
                                onClick={()=>document.getElementById(s.id)?.scrollIntoView({behavior:'smooth',block:'start'})}
                                style={{
                                  fontFamily:'var(--font-body)',fontSize:'10px',fontWeight:700,
                                  textTransform:'uppercase',padding:'3px 6px',background:'var(--paper-0)',
                                  color:'var(--ink-700)',border:'1px solid var(--border-soft)',
                                  borderRadius:'var(--r-xs)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4
                                }}>
                                <IconComp size={10} color="var(--ink-600)" />
                                <span>{s.l}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className={`offline-status-chip ${isOnline?'is-online':'is-offline'}`} style={{fontSize:'10px',padding:'2px 6px'}}>
                          <span className="offline-status-dot"></span>
                          <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
                        </div>
                      </div>

                      {/* Observación perito si aplica */}
                      {limiter&&(
                        <div style={{marginBottom:6,padding:'3px 8px',background:sm2.bg||'var(--paper-100)',borderRadius:2,fontSize:'11px',fontFamily:'var(--font-mono)',color:sm2.txt,display:'flex',alignItems:'center',justifyContent:'space-between',gap:6}}>
                          <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                            <IconAlert size={11} color={sm2.txt} />
                            <span>{limiter}</span>
                          </span>
                          <button onClick={()=>document.getElementById('bl-perito')?.scrollIntoView({behavior:'smooth',block:'start'})} style={{background:'none',border:'none',color:sm2.txt,fontWeight:700,fontSize:'10px',cursor:'pointer',textDecoration:'underline'}}>Ver dictamen</button>
                        </div>
                      )}

                      {/* Fila horizontal de chips de insumos */}
                      <div className="live-dash-chips-row">
                        <span style={{fontFamily:'var(--font-body)',fontSize:'10px',fontWeight:700,textTransform:'uppercase',color:'var(--ink-500)',marginRight:2,flexShrink:0}}>
                          Fórmula:
                        </span>
                        {recipe.map(r=>{
                          const g=INGS.find(i=>i.id===r.id);
                          if(!g) return null;
                          const isLocked=lockedIds.includes(r.id);
                          const roleCol=ROLE_COLORS[g.role]||'var(--ink-500)';
                          return(
                            <div
                              key={r.id}
                              className="live-ing-chip"
                              onClick={()=>document.getElementById(`rec-row-${r.id}`)?.scrollIntoView({behavior:'smooth',block:'center'})}
                              title={`${g.name} (${ROLE_LABELS[g.role]||g.role}) · ${r.p}%\nClick para editar`}>
                              <span style={{width:6,height:6,borderRadius:'50%',background:roleCol,flexShrink:0}}></span>
                              <span style={{fontWeight:600}}>{g.name}</span>
                              <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:isLocked?'var(--coral-600)':'var(--ink-800)',display:'inline-flex',alignItems:'center',gap:2}}>
                                {r.p}%{isLocked ? <IconLock size={9} color="var(--coral-600)" /> : null}
                              </span>
                              <button
                                className="live-ing-chip-del"
                                onClick={(e)=>{e.stopPropagation();remI(r.id);}}
                                title={`Quitar ${g.name}`}>
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="live-dash-bar" style={{background:'var(--paper-50)'}}>
                <div className="live-dash-left">
                  <span className="live-dash-species">{sp?.name||'Pleurotus ostreatus'}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'11px',color:'var(--ink-500)'}}>
                    · Sin receta activa
                  </span>
                </div>
                <button
                  onClick={()=>document.getElementById('bl-ingredientes')?.scrollIntoView({behavior:'smooth',block:'start'})}
                  className="live-dash-btn"
                  style={{fontSize:'10.5px'}}>
                  + Agregar insumos
                </button>
              </div>
            )}
          </div>
          <div className="builder-cols">
            <div className="builder-left">
            <div className="panel" id="bl-ingredientes">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12,paddingBottom:10,borderBottom:'1px solid rgba(26,20,16,.1)'}}>
                <span style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:18,color:'var(--ink-900)',lineHeight:1}}>Ingredientes</span>
              </div>
              <div style={{display:'flex',gap:6,marginBottom:8,alignItems:'center',flexWrap:'wrap'}}>
                <input className="search" style={{marginBottom:0,flex:'1 1 auto',minWidth:'200px'}} placeholder="Buscar ingrediente o etiqueta…" value={search} onChange={e=>setSearch(e.target.value)}/>
                <button className={`tog${showPrices?' on':''}`} onClick={()=>setShowPrices(!showPrices)} title="Editar precios por kg" style={{flexShrink:0,whiteSpace:'nowrap'}}>Precios</button>
              </div>
              {showPrices&&(
                <div style={{border:'1px solid var(--border-soft)',marginBottom:10,background:'var(--paper-50)'}}>
                  <div style={{padding:'7px 12px',background:'var(--paper-200)',borderBottom:'1px solid var(--border-soft)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',fontWeight:700}}>Precios por kg (COP) — se guardan localmente</span>
                    {Object.keys(priceOverrides).length>0&&(
                      <button onClick={()=>{setPriceOverrides({});try{localStorage.removeItem('setas_prices_v1');}catch(e){}}} style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",padding:'3px 8px',border:'1px solid var(--coral-500)',background:'none',color:'var(--coral-500)',cursor:'pointer'}}>Restaurar todo</button>
                    )}
                  </div>
                  <div style={{maxHeight:260,overflowY:'auto'}}>
                    {fings.filter(g=>g.cn>0||g.cost>0).map(ing=>{
                      const isEdited=priceOverrides[ing.id]!==undefined;
                      const orig=INGS.find(i=>i.id===ing.id)?.cost||0;
                      return(
                        <div key={ing.id} className="price-row">
                          <div>
                            <div style={{fontSize:"var(--text-base)",fontWeight:500,color:'var(--ink-900)'}}>{ing.name}</div>
                            {isEdited&&<div style={{fontSize:"var(--text-sm)",color:'var(--ink-700)',fontFamily:"var(--font-mono)",fontWeight:500}}>Orig: ${orig}/kg</div>}
                          </div>
                          <input type="number" min="0" step="100" required
                            aria-label={`Precio ${ing.name} por kg`}
                            className={`price-inp${isEdited?' edited':''}`}
                            value={ing.cost}
                            onChange={e=>{
                              const v=Math.max(0,parseInt(e.target.value)||0);
                              const n={...priceOverrides,[ing.id]:v};
                              setPriceOverrides(n);
                              try{localStorage.setItem('setas_prices_v1',JSON.stringify(n));}catch(err){}
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
                <div className="bodega-bar" role="button" tabIndex={0} onClick={()=>goTab('inventario')} onKeyDown={e=>{if(e.key==='Enter')goTab('inventario');}} style={{cursor:'pointer'}} title="Abrir bodega / inventario">
                <span className="bodega-bar-icon" style={{color:pantryIds.length>0?'var(--accent-olive)':'var(--border-soft)',display:'flex',alignItems:'center'}}><IcoBox color={pantryIds.length>0?'var(--accent-olive)':'var(--border-soft)'}/></span>
                <div style={{flex:1,minWidth:0}}>
                  <div className="bodega-bar-title">{pantryIds.length>0?pantryIds.length+' ingredientes en bodega':'Bodega vacía — sin stock registrado'}</div>
                  {pantryIds.length>0&&<div className="bodega-bar-sub">{Object.values(stockMap).reduce((a,b)=>a+b,0).toFixed(1)} kg disponibles</div>}
                </div>
                <div className="bodega-bar-right">
                  <button className={'tog'+(usePantry?' on':'')} onClick={e=>{e.stopPropagation();setUsePantry(!usePantry);}} title={pantryIds.length===0?'Carga ingredientes en Bodega primero':(usePantry?'Ver todos los ingredientes':'Ver solo bodega')}>{usePantry?'Ver todos':'Ver bodega'}</button>
                  <button className="bodega-bar-refresh" onClick={e=>{e.stopPropagation();goTab('inventario');}} title="Actualizar stock" aria-label="Actualizar stock">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>
                  </button>
                </div>
              </div>
              {usePantry&&pantryIds.length>0&&(
                <div className="pantry-grid" style={{marginBottom:8}}>
                  {pantryIds.slice(0,12).map(id=>{const g=INGS.find(i=>i.id===id);const kg=stockMap[id]||0;return g?(
                    <span key={id} className="pantry-chip on" style={{borderColor:INGS.find(i=>i.id===id)?.cs?.includes(sKey)?'var(--moss-500)':undefined,background:INGS.find(i=>i.id===id)?.cs?.includes(sKey)?'color-mix(in oklab,var(--moss-500) 10%,var(--paper-50))':undefined}} title={INGS.find(i=>i.id===id)?.cs?.includes(sKey)?'Compatible con '+sp.name:undefined} onClick={()=>setPantryIds(prev=>prev.filter(x=>x!==id))}>{INGS.find(i=>i.id===id)?.cs?.includes(sKey)&&<span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'var(--moss-500)',marginRight:4,verticalAlign:'middle',marginTop:-1}}/>}{g.name.length>18?g.name.slice(0,18)+'…':g.name}{kg>0&&<span className="pantry-chip-kg">{kg.toFixed(1)} kg</span>}{' ✕'}</span>
                  ):null;})}
                  {pantryIds.length>12&&<span className="pantry-chip" style={{opacity:0.5}}>+{pantryIds.length-12} más</span>}
                </div>
              )}
              <div className="cats">
                {Object.entries(CATS).map(([k,l])=><button key={k} data-cat={k} className={`cat${cat===k?' on':''}`} onClick={()=>setCat(k)}>{l}</button>)}
                <button className={`cat${showCompatOnly?' on':''}`} style={{borderColor:showCompatOnly?'var(--moss-600)':'',color:showCompatOnly?'var(--moss-600)':'',background:showCompatOnly?'color-mix(in oklab,var(--moss-600) 8%,var(--paper-50))':''}} onClick={()=>setShowCompatOnly(s=>!s)} title="Ver solo ingredientes compatibles con la especie seleccionada">{showCompatOnly?'Solo compatibles ✕':'Compatibles'}</button>
                <button className={`cat${groupByRole?' on':''}`} onClick={()=>setGroupByRole(g=>!g)} title="Agrupar ingredientes por rol funcional botánico (Base, Suplemento N, Minerales/pH)">{groupByRole?'Agrupado por Rol ✓':'Lista simple'}</button>
              </div>
              <div className="ing-list">
                {(()=>{
                  let base=usePantry&&pantryIds.length>0?fings.filter(g=>pantryIds.includes(g.id)):fings;
                  if(showCompatOnly){
                    const compat=new Set(INGS.filter(i=>i.cs&&i.cs.includes(sKey)).map(i=>i.id));
                    base=base.filter(g=>compat.has(g.id));
                  }

                  const renderIngRow=(ing)=>{
                    const inR=recipe.find(r=>r.id===ing.id);
                    const inPantry=pantryIds.includes(ing.id);
                    const isCompat=ing.cs&&ing.cs.includes(sKey);
                    return(
                      <div key={ing.id} className={`ing-card-item${justAddedIds.includes(ing.id)?' ing-row-flash':''}`} style={{display:'flex',flexDirection:'column',opacity:disabledIngIds.includes(ing.id)?0.42:1,transition:'opacity .15s'}}>
                        <div style={{position:'relative'}}>
                          <IngredientItem ing={ing} onAdd={ing=>{if(!recipe.find(r=>r.id===ing.id)){addI(ing.id);flashAdded(ing.id);}}} stockKg={stockMap[ing.id]||0} isCompat={isCompat} spName={sp?.name}/>
                          {inPantry&&isCompat&&<div title="En bodega y compatible con esta especie" style={{position:'absolute',left:4,top:'50%',transform:'translateY(-50%)',width:7,height:7,borderRadius:'50%',background:'var(--moss-500)',boxShadow:'0 0 0 2px var(--paper-50)'}}/>}
                        </div>
                        <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:6,padding:'4px 4px 6px'}}>
                          <button className="qa-mini-btn" onClick={e=>{e.stopPropagation();toggleDisabledIng(ing.id);}}
                            title={disabledIngIds.includes(ing.id)?'Habilitar para el optimizador':'Excluir del optimizador'}
                            aria-label={disabledIngIds.includes(ing.id)?`Habilitar ${ing.name} para el optimizador`:`Excluir ${ing.name} del optimizador`}
                            style={{width:'clamp(13px,3vw,15px)',height:'clamp(13px,3vw,15px)',borderRadius:'50%',background:disabledIngIds.includes(ing.id)?'var(--coral-500)':'var(--border-soft)',color:disabledIngIds.includes(ing.id)?'var(--paper-0)':'rgba(26,20,16,.5)',border:'none',cursor:'pointer',fontSize:'clamp(7px,1.5vw,8px)',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>
                            {disabledIngIds.includes(ing.id)?'⊘':'–'}
                          </button>
                          <span aria-hidden="true" style={{width:1,alignSelf:'stretch',minHeight:13,background:'var(--border-soft)',flexShrink:0}}/>
                          <button className="qa-mini-btn" onClick={e=>{e.stopPropagation();setPantryIds(prev=>inPantry?prev.filter(x=>x!==ing.id):[...prev,ing.id]);}}
                            title={inPantry?'Quitar de bodega':'Agregar a bodega'}
                            aria-label={inPantry?`Quitar ${ing.name} de bodega`:`Agregar ${ing.name} a bodega`}
                            style={{width:'clamp(13px,3vw,15px)',height:'clamp(13px,3vw,15px)',borderRadius:'50%',background:inPantry?'var(--moss-500)':'var(--border-soft)',color:inPantry?'var(--paper-0)':'rgba(26,20,16,.5)',border:'none',cursor:'pointer',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <IcoBox color="currentColor" size={8}/>
                          </button>
                          {!inR&&(
                            <button className={'qa-mini-btn qa-add-btn'+(justAddedIds.includes(ing.id)?' qa-pulse':'')} onClick={e=>{e.stopPropagation();addI(ing.id);flashAdded(ing.id);}}
                              title="Agregar a receta"
                              aria-label={`Agregar ${ing.name} a la receta`}
                              style={{width:'clamp(13px,3vw,15px)',height:'clamp(13px,3vw,15px)',borderRadius:'50%',background:'var(--coral-500)',color:'var(--paper-0)',border:'none',cursor:'pointer',fontSize:'clamp(8px,1.8vw,9px)',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  };

                  if(!groupByRole || cat!=='all' || search.trim().length>0){
                    return base.map(renderIngRow);
                  }

                  const ROLE_GROUPS=[
                    {
                      key:'base_carbono',
                      label:'Bases de Carbono',
                      icon:IconSeed,
                      desc:'Estructura primaria de lignina y celulosa (60–85% de la receta)',
                      primary:g=>g.role==='base_carbono',
                      fallback:g=>g.cat==='base'||g.cn>=40
                    },
                    {
                      key:'suplemento_n',
                      label:'Suplementos Nitrogenados',
                      icon:IconNut,
                      desc:'Aporte de proteína y arranque micelial (5–20% máx según especie)',
                      primary:g=>g.role==='suplemento_n'||g.role==='suplemento_medio',
                      fallback:g=>g.n>=1.4
                    },
                    {
                      key:'aditivo',
                      label:'Minerales y Tampones de pH',
                      icon:IconScale,
                      desc:'Estabilizadores de acidez, calcio y estructura (1–4%)',
                      primary:g=>!!g.role?.startsWith('aditivo_'),
                      fallback:g=>g.cat==='adit'||g.cn===0
                    },
                    {
                      key:'aireador',
                      label:'Aireadores y Estructurantes',
                      icon:IconWind,
                      desc:'Porosidad y difusión de oxígeno gaseoso',
                      primary:g=>g.role==='aireador',
                      fallback:g=>g.cat==='trop'||g.cat==='circ'
                    }
                  ];

                  // Dos pasadas: el rol explícito del catálogo siempre gana sobre las
                  // heurísticas de cat/cn — evita que un insumo con role='aireador' pero
                  // cn===0 (o similar solape) caiga en el grupo equivocado solo por el
                  // orden en que se evalúan los grupos.
                  const roleAssignment={};
                  ROLE_GROUPS.forEach(grp=>{
                    base.forEach(g=>{ if(!roleAssignment[g.id]&&grp.primary(g)) roleAssignment[g.id]=grp.key; });
                  });
                  ROLE_GROUPS.forEach(grp=>{
                    base.forEach(g=>{ if(!roleAssignment[g.id]&&grp.fallback(g)) roleAssignment[g.id]=grp.key; });
                  });

                  return ROLE_GROUPS.map(grp=>{
                    const grpIngs=base.filter(g=>roleAssignment[g.id]===grp.key);
                    if(grpIngs.length===0) return null;
                    const isCollapsed=collapsedRoles[grp.key];
                    const compatCount=grpIngs.filter(g=>g.cs&&g.cs.includes(sKey)).length;

                    return(
                      <div key={grp.key} className="role-group-box" style={{marginBottom:10,border:'1px solid var(--border-soft)',borderRadius:'var(--r-xs)',background:'var(--paper-50)',overflow:'hidden'}}>
                        <div
                          onClick={()=>toggleRoleCollapse(grp.key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e=>{if(e.key==='Enter') toggleRoleCollapse(grp.key);}}
                          style={{
                            padding:'8px 10px',
                            background:'var(--paper-100)',
                            borderBottom:isCollapsed?'none':'1px solid var(--border-soft)',
                            display:'flex',
                            justifyContent:'space-between',
                            alignItems:'center',
                            cursor:'pointer',
                            userSelect:'none'
                          }}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <span style={{display:'inline-flex',color:'var(--ink-700)'}}><grp.icon size={16}/></span>
                            <div>
                              <div style={{fontFamily:'var(--font-body)',fontSize:'var(--text-xs)',fontWeight:800,letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)'}}>
                                {grp.label} <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-600)',fontWeight:500}}>({grpIngs.length})</span>
                              </div>
                              <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',color:'var(--ink-600)',lineHeight:1.2}}>
                                {grp.desc}
                              </div>
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-2xs)',background:'rgba(77,98,53,.12)',color:'var(--moss-700)',padding:'2px 5px',borderRadius:3,fontWeight:600}}>
                              {compatCount} comp.
                            </span>
                            <span style={{fontSize:'var(--text-xs)',color:'var(--ink-500)',transform:isCollapsed?'rotate(-90deg)':'rotate(0deg)',transition:'transform .15s'}}>
                              ▼
                            </span>
                          </div>
                        </div>
                        {!isCollapsed&&(
                          <div style={{padding:'4px 6px'}}>
                            {grpIngs.map(renderIngRow)}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            </div>
            <div className="builder-right">
            {an&&(()=>{
              const hasPer=recipe.length>0;
              const {score,status,items}=hasPer?opt:{score:0,status:'sin_receta',items:[]};
              const criticals=items.filter(s=>s.priority==='critical');
              const warnings=items.filter(s=>s.priority==='warning');
              const tips=items.filter(s=>s.priority==='tip');
              const infos=items.filter(s=>s.priority==='info');
              const sm=PERITO_STATUS[status]||PERITO_STATUS.sin_receta;
              const max=150,oMin=sp?.cn_optimal?.min,oMax=sp?.cn_optimal?.max;
              const cur=sp?Math.min(an.cn,max):0;
              const cnOk=sp&&an.cn>=oMin&&an.cn<=oMax;
              return(
                <div className="panel print-panel" id="bl-perito" style={{background:hasPer?sm.bg:'var(--paper-50)',border:`1.5px solid ${hasPer?sm.border:'var(--border-soft)'}`,marginBottom:12,transition:'background .3s,border-color .3s'}}>
                  {/* ── HEADER: SCORE + VEREDICTO + ACCIONES ── */}
                  {hasPer&&(
                    <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${sm.border}40`,flexWrap:'wrap'}}>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:62,height:62,borderRadius:'50%',background:sm.badge,flexShrink:0,transition:'background .3s'}}>
                        <span style={{fontFamily:'var(--font-num)',fontSize:24,fontWeight:900,color:'var(--paper-0)',lineHeight:1}}>{score}</span>
                        <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-micro)",color:'rgba(255,255,255,.7)',letterSpacing:'var(--tracking-button)',marginTop:1}}>SCORE</span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:sm.badge,marginBottom:2}}>Perito · Veredicto</div>
                        <div style={{fontFamily:'var(--font-body)',fontSize:20,fontWeight:800,color:sm.txt,lineHeight:1,transition:'color .3s'}}>{sm.veredicto}</div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:sm.badge,marginTop:4,lineHeight:1.4}}>
                          {sm.accion&&<div style={{fontWeight:700}}>{sm.accion}</div>}
                          {(()=>{const causa=peritoMainLimiter(opt,an);return causa?<div style={{opacity:.8,marginTop:2}}><b>Causa:</b> {causa}</div>:null;})()}
                          {an.trichoderma&&<div style={{color:'#C53030',fontWeight:700,marginTop:2}}>Autoclave 121°C × 90 min obligatorio</div>}
                          {!an.trichoderma&&tr&&<div style={{opacity:.6,marginTop:2}}>Trat.: {tr.name}</div>}
                        </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
                        {(criticals.length>0||warnings.length>0)&&<button onClick={autoImprove} style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'6px 10px',background:'var(--coral-500)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-sm)',cursor:'pointer',whiteSpace:'nowrap'}}>✦ Auto-mejorar</button>}
                        {recipeHistory.length>0&&<button onClick={undoLastRec} style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'6px 10px',background:'transparent',color:'var(--ink-600)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13C5.5 7 12 4 18 7a9 9 0 010 10"/></svg>
                          Deshacer ({recipeHistory.length})
                        </button>}
                        <button onClick={()=>goTab('produccion')} style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'6px 10px',background:'var(--moss-600,var(--accent-olive))',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-sm)',cursor:'pointer',whiteSpace:'nowrap'}}>Producir</button>
                        {(status==='needs_work'||status==='critical')&&<button onClick={()=>{setPromptDlg({title:'Nueva prueba experimental',label:'Nombre de la prueba',placeholder:'ej. Ostra gris — ajuste C:N lote 12',confirmLabel:'Guardar prueba',onSubmit:nm=>{const trSave=calcTreatment(an, sKey, SPP);const e={id:Date.now(),name:nm,sKey,recipe:[...recipe],date:new Date().toLocaleDateString('es-CO'),eb:an.eb.toFixed(0),cn:an.cn.toFixed(1),score:opt.score,cost:Math.round(an.cost),treatCol:trSave?.col||null,energyCopKg:trSave?.energy?.cop_per_kg_seco||0};const u=[e,...saved];setSaved(u);try{localStorage.setItem('setas_v6',JSON.stringify(u));}catch(e2){}setNoticeDlg({msg:`Guardada como prueba: ${nm}`});}});}} style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'6px 10px',background:'transparent',color:sm.badge,border:`1px solid ${sm.border}`,borderRadius:'var(--r-sm)',cursor:'pointer',whiteSpace:'nowrap'}}>+ Crear prueba</button>}
                      </div>
                    </div>
                  )}

                  {/* ── MÉTRICAS CLAVE (siempre visibles) ── */}
                  <div className="mgrid" style={{marginBottom:12}}>
                    {[
                      {l:'C:N',v:`${an.cn.toFixed(1)}:1`,ok:sp&&an.cn>=sp.cn_optimal.min&&an.cn<=sp.cn_optimal.max},
                      {l:'Nitrógeno',v:`${an.avgN.toFixed(2)}%`,ok:sp&&an.avgN>=sp.n_optimal.min&&an.avgN<=sp.n_optimal.max},
                      {l:'EB esperada',v:an.ebLow&&an.ebHigh?`${an.ebLow}–${an.ebHigh}%`:`${an.eb.toFixed(0)}%`,ok:an.eb>100,w:an.eb>70&&an.eb<=100},
                      {l:'Costo / kg',v:`$${Math.round(an.cost)}`,ok:an.cost<800,w:an.cost<2000&&an.cost>=800},
                      {l:'pH estimado',v:an.avgPh?.toFixed(1)||'—',ok:sp&&an.avgPh>=sp.ph_optimal?.min&&an.avgPh<=sp.ph_optimal?.max,w:false},
                      {l:'Digestibilidad',v:`${an.avgDig?.toFixed(1)||'—'}/10`,ok:an.avgDig>=7,w:an.avgDig>=4&&an.avgDig<7},
                    ].map(m=>(
                      <div key={m.l} className="mc">
                        <div className="mlbl">{m.l}</div>
                        <div className="mval">{m.v}</div>
                        <span className={`mbadge ${m.ok?'bgood':m.w?'bwarn':'bbad'}`}>{m.ok?'Óptimo':m.w?'Aceptable':'Ajustar'}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── EBDial + C:N gauge ── */}
                  <EBDial an={an} sp={sp}/>
                  {sp&&an.cn>0&&(
                    <div className="gauge-wrap">
                      <div className="gauge-hdr">
                        <span className="gauge-cur">C:N {an.cn.toFixed(1)}:1</span>
                        <span className="gauge-tgt">objetivo {oMin}–{oMax}:1</span>
                      </div>
                      <div className="gauge-tr">
                        <div className="gauge-zn" style={{left:`${(oMin/max)*100}%`,width:`${((oMax-oMin)/max)*100}%`}}/>
                        <div className="gauge-nd" style={{left:`${(cur/max)*100}%`,background:cnOk?'var(--accent-olive)':an.cn<oMin?'var(--coral-500)':'var(--ochre-500,#A07828)'}}/>
                      </div>
                      <div className="gauge-ft"><span>0</span><span>{oMin}–{oMax}</span><span>150+</span></div>
                    </div>
                  )}
                  <NitrogenChart recipe={recipe}/>

                  {/* ── PERITO: INDICADORES + ITEMS ── */}
                  {hasPer&&(
                    <>
                      {/* ── Modo de trabajo: mismo estado que el Generador — cambiarlo
                          aquí también cambia qué explora "Calcular" más abajo. ── */}
                      <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:8}}>
                        <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)'}}>Modo:</span>
                        {[['stock','Solo bodega',true],['full','Todo el catálogo',false]].map(([k,l,v])=>(
                          <button key={k} className={'chip'+(optUseStock===v?' on':'')} onClick={()=>setOptUseStock(v)}>{l}</button>
                        ))}
                      </div>
                      {/* ── barra resumen live: score + EB + costo ── */}
                      <div style={{display:'flex',gap:0,margin:'10px 0 8px',border:'1px solid rgba(26,20,16,.1)',borderRadius:6,overflow:'hidden',background:'var(--paper-100)'}}>
                        {[
                          {l:'Calificación',v:`${opt?.score??'—'}/100`,ok:(opt?.score||0)>=85,w:(opt?.score||0)>=60},
                          {l:'EB estimada',v:an.ebLow&&an.ebHigh?`${an.ebLow}–${an.ebHigh}%`:`${an.eb?.toFixed(0)||'—'}%`,ok:an.eb>100,w:an.eb>70&&an.eb<=100},
                          {l:'Costo / kg',v:`$${Math.round(an.cost||0).toLocaleString('es-CO')}`,ok:an.cost<800,w:an.cost<2000&&an.cost>=800},
                        ].map((m,i)=>(
                          <div key={m.l} style={{flex:1,padding:'7px 10px',borderLeft:i>0?'1px solid rgba(26,20,16,.08)':'none',textAlign:'center'}}>
                            <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:2}}>{m.l}</div>
                            <div style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:"var(--text-md)",color:m.ok?'#3D5A38':m.w?'#7A5A10':'var(--coral-500)',lineHeight:1}}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                      {realCostPerKg!=null&&Math.abs(realCostPerKg-Math.round(an.cost||0))>=20&&
                        <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-600)',marginBottom:8}}>
                          Costo real de bodega (precio ponderado de tus lotes): <b>${realCostPerKg.toLocaleString('es-CO')}/kg</b> · catálogo: ${Math.round(an.cost||0).toLocaleString('es-CO')}/kg
                        </div>}
                      {histStats&&histStats.n>0&&
                        <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-600)',marginBottom:8}}>
                          Score ajustado con {histStats.n} lote{histStats.n!==1?'s':''} real{histStats.n!==1?'es':''}{histStats.matched?' con receta similar':' de la especie'} ({histStats.subs.join(', ')}) — peso {Math.round(histStats.weight*100)}% histórico / {Math.round((1-histStats.weight)*100)}% fórmula
                        </div>}
                      {modelAccuracy!=null&&
                        <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-600)',marginBottom:8}}>
                          Precisión del modelo para {sp?.name||'esta especie'} en tu bodega: ±{modelAccuracy}% EB (basado en {trialsWithReal.length} prueba{trialsWithReal.length!==1?'s':''} con EB real registrado)
                        </div>}
                      {similarTrial&&
                        <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#7A5A10',background:'rgba(160,120,40,.08)',border:'1px solid rgba(160,120,40,.2)',borderRadius:4,padding:'6px 9px',marginBottom:8}}>
                          Ya probaste algo parecido (<b>{Math.round(similarTrial.similarity*100)}%</b> de ingredientes en común, "{similarTrial.name}"): dio <b>EB real {similarTrial.ebReal}%</b> (estimado entonces: {similarTrial.eb}%).
                        </div>}
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                        {criticals.length>0&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'3px 9px',background:'rgba(197,48,48,.12)',border:'1px solid rgba(197,48,48,.3)',borderRadius:3,color:'#C53030',fontWeight:700}}>{criticals.length} crítico{criticals.length!==1?'s':''}</span>}
                        {warnings.length>0&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'3px 9px',background:'rgba(160,120,40,.1)',border:'1px solid rgba(160,120,40,.25)',borderRadius:3,color:'#7A5A10',fontWeight:700}}>{warnings.length} ajuste{warnings.length!==1?'s':''}</span>}
                        {criticals.length===0&&warnings.length===0&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'3px 9px',background:'rgba(74,107,74,.1)',border:'1px solid rgba(74,107,74,.2)',borderRadius:3,color:'#3D5A38'}}>Todos los parámetros en rango</span>}
                        {(an.tot<97||an.tot>103)&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",padding:'3px 9px',background:'rgba(197,48,48,.1)',border:'1px solid rgba(197,48,48,.25)',borderRadius:3,color:'#C53030',fontWeight:700}}>⚠ Total {an.tot.toFixed(1)}%</span>}
                      </div>
                      {(criticals.length>0||warnings.length>0)&&<div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:sm.badge,padding:'6px 10px',background:'rgba(0,0,0,.04)',borderLeft:`2px solid ${sm.border}`,marginBottom:8,lineHeight:1.4}}><b>Aplica una sugerencia a la vez</b> — cada cambio recalcula. Usa <b>✦ Auto-mejorar</b> para automatizar.</div>}
                      {criticals.length>0&&<div style={{marginBottom:8}}><div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'#C53030',padding:'5px 10px',background:'rgba(197,48,48,.07)',borderBottom:'1px solid rgba(197,48,48,.2)'}}>Críticos ({criticals.length})</div>{criticals.map((item,i)=><PeritoItem key={i} item={item} onApply={applyOptStep} baseScore={opt.score}/>)}</div>}
                      {warnings.length>0&&<div style={{marginBottom:8}}><div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',padding:'5px 10px',background:'rgba(160,120,40,.07)',borderBottom:'1px solid rgba(160,120,40,.2)'}}>Mejoras ({warnings.length})</div>{warnings.map((item,i)=><PeritoItem key={i} item={item} onApply={applyOptStep} baseScore={opt.score}/>)}</div>}
                      {tips.length>0&&<details open style={{marginBottom:6}}><summary style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:"var(--text-sm)",padding:'5px 10px',background:'rgba(74,107,74,.05)',borderBottom:'1px solid rgba(74,107,74,.15)',cursor:'pointer',listStyle:'none',display:'flex',justifyContent:'space-between'}}><span>Opcionales ({tips.length})</span><span style={{fontSize:"var(--text-xs)"}}>▾</span></summary>{tips.map((item,i)=><PeritoItem key={i} item={item} onApply={applyOptStep} baseScore={opt.score}/>)}</details>}
                      {infos.map((item,i)=><div key={i} style={{display:'flex',gap:8,padding:'7px 12px',background:'rgba(74,90,58,.06)',borderTop:'1px solid rgba(74,90,58,.12)',alignItems:'flex-start',marginTop:4}}><span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:item.color,flexShrink:0}}>{item.icon}</span><div><span style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,color:item.color,marginRight:6}}>{item.label}</span><span style={{fontSize:"var(--text-sm)",color:'var(--ink-500)',fontFamily:'var(--font-mono)'}}>{item.action}</span></div></div>)}
                    </>
                  )}

                  {/* ── CHARTS TOGGLE + CHARTS ── */}
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:10,marginBottom:8}}>
                    <button className={`tog${showFlush?' on':''}`} onClick={()=>setShowFlush(!showFlush)}>Cosechas</button>
                    <button className={`tog${showCompChart?' on':''}`} onClick={()=>setShowCompChart(!showCompChart)}>Composición</button>
                    <button className={`tog${showSpeciesRec?' on':''}`} onClick={()=>setShowSpeciesRec(!showSpeciesRec)}>Compat. especies</button>
                  </div>
                  {showFlush&&<FlushChart an={an}/>}
                  {showCompChart&&<CompositionChart recipe={recipe}/>}
                  {showSpeciesRec&&<SpeciesRecommender recipe={recipe}/>}

                  {/* ── EVALUACIÓN TÉCNICA ── */}
                  <div className="dbox" style={{marginTop:8}}>
                    <div className="dttl">Evaluación</div>
                    <div className="dtxt">{dg.main}</div>
                  </div>
                  {dg.sugs.length>0&&(<>
                    <div className="sec" style={{marginTop:8}}>A considerar</div>
                    {dg.sugs.map((s2,i)=><div key={i} className={`sug ${s2.t}`}><span className="sug-mark">{s2.t==='success'?'Ok':s2.t==='error'?'Rev':'—'}</span><span style={{fontWeight:700,flexShrink:0,fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-500)'}}>{s2.i}</span><span>{s2.t==='warning'?<><span style={{color:'var(--ink-400)',fontStyle:'italic'}}>Podrías considerar — </span>{s2.tx}</>:s2.tx}</span></div>)}
                  </>)}
                </div>
              );
            })()}
            <RecipeGauges an={an} sp={sp} optimalAn={optimalAn} historical={histStats}/>
            <div className="panel panel-accent" id="bl-receta">
              {/* ── HEADER EDITORIAL ── */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14,paddingBottom:10,borderBottom:'1px solid rgba(26,20,16,.12)'}}>
                <div style={{display:'flex',alignItems:'baseline',gap:8}}>
                  <span style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:20,color:'var(--ink-900)',lineHeight:1}}>Receta activa</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-500)',fontWeight:400}}>({recipe.length})</span>
                </div>
                {recipe.length>0&&<div style={{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap'}}>
                  {an&&Math.abs(an.tot-100)>0.5&&(
                    <div style={{display:'flex',gap:2,alignItems:'center'}}>
                      <button className="tog" onClick={()=>autoBalance(balanceMode)}>Balancear</button>
                      <select className="bal-mode" value={balanceMode} onChange={e=>setBalanceMode(e.target.value)} title="Estrategia de balanceo">
                        <option value="proportional">Proporcional</option>
                        <option value="equal">Igualando</option>
                        <option value="last">Al último</option>
                      </select>
                    </div>
                  )}
                  <button className={`tog${normMode?' on':''}`} onClick={()=>setNormMode(!normMode)} title="Al cambiar un %, los demás se ajustan proporcionalmente (respeta ●)">Auto-ajustar</button>
                  <button className="tog" onClick={()=>setConfirmDlg({title:'Limpiar receta',msg:'¿Limpiar la receta activa? Se perderán los ingredientes y porcentajes actuales.',danger:true,confirmLabel:'Limpiar',onConfirm:()=>{setRecipe([]);setLockedIds([]);}})}>Limpiar</button>
                </div>}
              </div>
              {recipe.length===0
                ?<div className="rec-empty">
                  <div className="rec-empty-hed">Sin ingredientes aún.</div>
                  <div className="rec-empty-sub">Selecciona ingredientes a la izquierda para comenzar a formular.</div>
                  <div style={{marginTop:18,padding:'14px 16px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-100)',textAlign:'center'}}>
                    <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-600)',marginBottom:6}}>¿No sabes por dónde empezar?</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-700)',lineHeight:1.6,marginBottom:12}}>El <strong>Generador</strong> crea automáticamente las mejores combinaciones de ingredientes para tu especie — con los ratios C:N, humedad y costo ya calculados. Solo elige especie y pulsa calcular.</div>
                    <button onClick={()=>{setShowOptimizer(true);document.getElementById('gen-panel')?.scrollIntoView({behavior:'smooth',block:'start'});}} style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',padding:'9px 16px',background:'var(--moss-700)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-xs)',cursor:'pointer'}}>Ver Generador ↓</button>
                  </div>
                </div>
                :<div style={{border:'1px solid var(--paper-300)'}}>
                  {recipe.map(r=>{const g=INGS.find(i=>i.id===r.id);if(!g) return null;const isLocked=lockedIds.includes(r.id);
                    const gName=(g.name||'').toLowerCase();
                    const roleMatch=(it)=>{
                      const txt=(it.action||'').replace(/<[^>]+>/g,'').toLowerCase();
                      if(txt.includes(gName)) return true;
                      const isCarbBase=g.role==='base_carbono', isNSupp=g.role==='suplemento_n'||g.n>=1.5;
                      if((it.icon==='↓C:N'||it.icon==='↑N')&&isNSupp) return true;
                      if((it.icon==='↑C:N'||it.icon==='↓N')&&isCarbBase) return true;
                      return false;
                    };
                    const rowFlag=recipe.length>0?(opt.items.find(it=>it.priority==='critical'&&roleMatch(it))||opt.items.find(it=>it.priority==='warning'&&roleMatch(it))):null;
                    return(
                    <div key={r.id} className={`rec-row${isLocked?' rec-locked':''}`} style={{display:'flex',flexDirection:'column',gap:8,padding:'12px 14px',borderBottom:'1px solid var(--paper-300)'}}>
                      {/* Header: nombre + lock + remove */}
                      <div style={{display:'flex',alignItems:'flex-start',gap:6,justifyContent:'space-between'}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3}}>
                            <div style={{fontSize:"var(--text-base)",fontWeight:500}}>{g.name}</div>
                            <button className={`lock-btn${isLocked?' on':''}`} onClick={()=>toggleLock(r.id)} aria-label={isLocked?`Desbloquear porcentaje de ${g?.name||''}`:`Fijar porcentaje de ${g?.name||''}`} title={isLocked?'Desbloquear (incluir en auto-ajuste)':'Fijar este % (excluir del auto-ajuste)'} style={{fontSize:"var(--text-sm)",padding:'2px 4px',flexShrink:0}}>
                              {isLocked?'●':'○'}
                            </button>
                          </div>
                          <div className="imeta" style={{fontSize:"var(--text-xs)"}}>C:N {g.cn||'—'} · N {g.n||'—'}%</div>
                          {rowFlag&&<div style={{marginTop:4,fontSize:"var(--text-xs)",fontWeight:700,color:rowFlag.priority==='critical'?'var(--coral-500)':'#7A5A10',display:'flex',alignItems:'center',gap:4}}><span>{rowFlag.priority==='critical'?'⚠':'!'}</span><span>{rowFlag.label}</span></div>}
                        </div>
                        <button className="rem" onClick={()=>{remI(r.id);setLockedIds(l=>l.filter(x=>x!==r.id));}} aria-label={`Quitar ${g?.name||'ingrediente'} de la receta`} style={{flexShrink:0,fontSize:"var(--text-base)",padding:'4px 8px'}}>✕</button>
                      </div>
                      {/* Controls: slider + number input */}
                      <div style={{display:'flex',flexDirection:'column',gap:4}}>
                        <input type="range" min="0" max="100" step=".5" value={r.p} onChange={e=>!isLocked&&updP(r.id,parseFloat(e.target.value)||0)} disabled={isLocked} aria-label={`Porcentaje de ${g.name}`} aria-valuetext={`${r.p}%`} aria-disabled={isLocked} style={{opacity:isLocked?.5:1,width:'100%'}}/>
                        <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'space-between'}}>
                          <input type="number" min="0" max="100" step=".5" required value={r.p} onChange={e=>!isLocked&&updP(r.id,parseFloat(e.target.value)||0)} readOnly={isLocked} aria-label={`Porcentaje de ${g?.name||'ingrediente'} (numérico)`} className="rec-pct-input" style={{width:'70px',padding:'6px 8px',border:'1px solid var(--paper-300)',background:isLocked?'var(--paper-200)':'var(--paper-100)',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",textAlign:'center',color:'var(--ink-900)',outline:'none',borderRadius:'var(--r-xs)'}}/>
                          <span className="pct" style={{fontSize:"var(--text-sm)",fontWeight:600,color:'var(--ink-600)'}}>%</span>
                        </div>
                      </div>
                    </div>
                  );})}
                </div>
              }
              {an&&<div className={`tbar ${an.tot>=99&&an.tot<=101?'ok':an.tot<95||an.tot>105?'err':'warn'}`}><span>Total</span><span style={{fontWeight:600}}>{an.tot.toFixed(1)}% / 100%</span></div>}
              {normMode&&recipe.length>0&&(
                <div className="norm-bar">
                  <span>⇌</span>
                  <span>Auto-ajustar activo — al cambiar un %, los demás se reescalan proporcionalmente</span>
                  {lockedIds.length>0&&<span style={{marginLeft:'auto',opacity:.8}}>● {lockedIds.length} fijado{lockedIds.length!==1?'s':''}</span>}
                </div>
              )}
              {an&&an.sp&&opt?.score>0&&(()=>{const sc=opt.score;const col=sc>=80?'var(--moss-500)':sc>=60?'var(--ochre-500,#A07828)':'var(--coral-500)';const bg=sc>=80?'#F2F5EE':sc>=60?'#FBF6E8':'#F9EDEA';const lbl=sc>=85?'Óptima':sc>=70?'Muy buena':sc>=55?'Aceptable':sc>=40?'Mejorable':'Deficiente';return(
                <div style={{background:bg,border:`1px solid ${col}`,borderLeft:`4px solid ${col}`,padding:'12px 14px 10px',marginTop:3,transition:'background-color .4s ease,border-color .4s ease,color .4s ease'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',fontWeight:800,marginBottom:2}}>Score de receta</div>
                      <div style={{fontFamily:'var(--font-display)',fontSize:"var(--text-base)",fontStyle:'italic',color:col,lineHeight:1,transition:'color .4s'}}>{lbl}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'baseline',gap:2}}>
                      <span style={{fontFamily:'var(--font-display)',fontSize:42,fontWeight:400,lineHeight:1,color:col,letterSpacing:'var(--tracking-tight)',transition:'background-color .4s ease,border-color .4s ease,color .4s ease'}}>{sc}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-400)',fontWeight:600,marginBottom:4}}>/100</span>
                    </div>
                  </div>
                  <div style={{height:3,background:'rgba(26,20,16,0.08)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${sc}%`,background:col,borderRadius:2,transition:'width .6s cubic-bezier(.32,.72,.36,1)'}}></div>
                  </div>
                </div>
              );})()}
              {an&&an.sp&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,margin:'10px 0 4px'}}>
                  {[
                    {label:'C:N',val:an.cn,min:an.sp.cn_optimal.min,max:an.sp.cn_optimal.max,ideal:an.sp.cn_optimal.ideal,fmt:v=>`${v.toFixed(1)}:1`,scale:Math.max(an.sp.cn_optimal.max*1.5,an.cn*1.1||1)},
                    {label:'N%',val:an.avgN,min:an.sp.n_optimal.min,max:an.sp.n_optimal.max,ideal:an.sp.n_optimal.ideal,fmt:v=>`${v.toFixed(2)}%`,scale:Math.max(an.sp.n_optimal.max*1.5,an.avgN*1.1||1)}
                  ].map(m=>{
                    const inRange=m.val>=m.min&&m.val<=m.max;
                    const pct=Math.min(100,(m.val/m.scale)*100);
                    const idealPct=(m.ideal/m.scale)*100;
                    const minPct=(m.min/m.scale)*100;
                    const maxPct=(m.max/m.scale)*100;
                    const barColor=inRange?'var(--moss-500)':m.val<m.min?'var(--coral-500)':'#d4a04a';
                    return(
                      <div key={m.label} style={{background:'var(--paper-100)',border:'1px solid var(--border-soft)',padding:'8px 10px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:5}}>
                          <span style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",textTransform:'uppercase',letterSpacing:'var(--tracking-button)',color:'var(--ink-700)',fontWeight:700}}>{m.label}</span>
                          <span style={{fontFamily:"var(--font-num)",fontSize:"var(--text-md)",color:barColor,fontWeight:600}}>{m.fmt(m.val)}</span>
                        </div>
                        <div style={{position:'relative',height:6,background:'#e0dbd3',borderRadius:3}}>
                          <div style={{position:'absolute',left:`${minPct}%`,width:`${maxPct-minPct}%`,height:'100%',background:'rgba(77,98,53,.2)',borderRadius:3}}/>
                          <div style={{position:'absolute',left:`${idealPct}%`,width:2,height:'160%',top:'-30%',background:'rgba(77,98,53,.5)',borderRadius:1}}/>
                          <div style={{position:'absolute',left:0,width:`${pct}%`,height:'100%',background:barColor,borderRadius:3,transition:'width .3s'}}/>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:3,fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--ink-700)',fontWeight:500}}>
                          <span>{m.fmt(m.min)}</span><span style={{opacity:.7}}>↑{m.fmt(m.ideal)}</span><span>{m.fmt(m.max)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {recipe.length>0&&(
                <div className="bwrap" id="bl-batch">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:13}}>
                    <div className="sec" style={{marginBottom:0,borderBottom:'none'}}>Batch</div>
                    <button className={`tog${showBatch?' on':''}`} onClick={()=>setShowBatch(!showBatch)}>{showBatch?'Ocultar':'Calcular'}</button>
                  </div>
                  <div className="bgrid" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
                    <div className="bf"><label htmlFor="bf-numbags">Nº bolsas</label><input id="bf-numbags" type="number" min="1" max="500" required value={numBags} onChange={e=>setNumBags(parseInt(e.target.value)||1)}/></div>
                    <div className="bf"><label htmlFor="bf-kgbag">kg / bolsa</label><input id="bf-kgbag" type="number" min=".5" max="5" step=".1" required value={kgBag} onChange={e=>setKgBag(parseFloat(e.target.value)||1)}/></div>
                    <div className="bf"><label htmlFor="bf-hobj">Humedad obj. % △</label><input id="bf-hobj" type="number" min="55" max="80" required value={hObj} onChange={e=>setHObj(parseInt(e.target.value)||67)} style={{borderColor:hObj>=67?'var(--moss-500)':'var(--coral-500)'}}/></div>
                    <div className="bf"><label htmlFor="bf-spawncost">Costo spawn ($/kg)</label><input id="bf-spawncost" type="number" min="0" step="1000" required value={spawnCost} onChange={e=>setSpawnCost(parseInt(e.target.value)||0)}/></div>
                    <div className="bf"><label htmlFor="bf-vegprice">Precio venta ($/kg )</label><input id="bf-vegprice" type="number" min="0" step="1000" required value={vegPrice} onChange={e=>setVegPrice(parseInt(e.target.value)||0)}/></div>
                    <div className="bf"><label htmlFor="bf-total">Total</label><input id="bf-total" readOnly value={`${(numBags*kgBag).toFixed(1)} kg`} style={{fontWeight:700,color:'var(--coral-500)'}}/></div>
                  </div>
                  {showBatch&&bd&&(
                    <div>
                      {bd.items.map((it,i)=>(
                        <div key={i} className="brow">
                          <span className="bn">{it.name}</span>
                          <div style={{display:'flex',gap:11,alignItems:'center'}}>
                            {it.cost>0&&<span className="bc">${Math.round(it.cost).toLocaleString()}</span>}
                            <span className="bq">{it.unit}</span>
                          </div>
                        </div>
                      ))}
                      <div className="brow" style={{borderTop:'2px solid var(--border-soft)',marginTop:4,paddingTop:8}}>
                        <span className="bn" style={{color:'#2A5078',fontWeight:600}}> Agua a agregar (obj. {bd.hObj}%)</span>
                        <span className="bq" style={{background:'#E8F2FA',border:'1px solid #9AC0D8',color:'#2A5078'}}>{bd.agua.toFixed(2)} L</span>
                      </div>
                      <div className="brow" style={{borderTop:'1px solid var(--paper-300)',marginTop:4,paddingTop:8}}>
                        <span className="bn"> Spawn ({an?.dynSpawn||8}% · {bd.spawn.toFixed(2)} kg)</span>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <span className="bc">${Math.round(bd.spawnCostTotal).toLocaleString()}</span>
                          <span className="bq" style={{background:'#E8F5E8',border:'1px solid #7AB87A',color:'#2A5A2A'}}>{bd.spawn.toFixed(2)} kg</span>
                        </div>
                      </div>
                      <div className="btots" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
                        <div className="btot"><div className="bv">{bd.wet.toFixed(1)} kg</div><div className="bl">Sustrato</div></div>
                        <div className="btot"><div className="bv">${Math.round(bd.cost).toLocaleString()}</div><div className="bl">Insumos</div></div>
                        <div className="btot"><div className="bv">${Math.round(bd.spawnCostTotal).toLocaleString()}</div><div className="bl">Spawn</div></div>
                        <div className="btot" style={{background:'var(--coral-500)'}}><div className="bv">${Math.round(bd.totalCost).toLocaleString()}</div><div className="bl">Total COP</div></div>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
                        <div style={{background:'var(--paper-100)',padding:'8px 12px',border:'1px solid var(--border-soft)'}}>
                          <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",textTransform:'uppercase',letterSpacing:'var(--tracking-button)',color:'var(--ink-500)',marginBottom:3}}>Costo por bolsa</div>
                          <div style={{fontFamily:"var(--font-num)",fontSize:22,fontWeight:600,color:'var(--coral-500)'}}>${Math.round(bd.costPerBag).toLocaleString()}</div>
                        </div>
                        <div style={{background:'var(--paper-100)',padding:'8px 12px',border:'1px solid var(--border-soft)'}}>
                          <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",textTransform:'uppercase',letterSpacing:'var(--tracking-button)',color:'var(--ink-500)',marginBottom:3}}>Costo / kg sustrato</div>
                          <div style={{fontFamily:"var(--font-num)",fontSize:22,fontWeight:600,color:'var(--coral-500)'}}>${Math.round(bd.cost/bd.wet).toLocaleString()}</div>
                        </div>
                      </div>
                      {vegPrice>0&&an&&an.eb>0&&(()=>{
                        const yieldKg=bd.dry*(an.eb/100);
                        const revenue=yieldKg*vegPrice;
                        const margin=revenue-bd.totalCost;
                        const marginPct=revenue>0?((margin/revenue)*100).toFixed(1):0;
                        const positive=margin>=0;
                        return(
                          <div style={{marginTop:8,border:`1px solid ${positive?'var(--moss-500)':'var(--coral-500)'}`,background:positive?'#F2F5EE':'#F9EDEA'}}>
                            <div style={{padding:'8px 12px',borderBottom:`1px solid ${positive?'var(--moss-500)':'var(--coral-500)'}`,fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:positive?'var(--moss-500)':'var(--coral-500)'}}>Proyección de ingresos · EB {an.eb.toFixed(0)}%</div>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:positive?'var(--moss-500)':'var(--coral-500)'}}>
                              {[
                                {l:'Cosecha est.',v:`${yieldKg.toFixed(1)} kg`},
                                {l:'Ingresos brutos',v:`$${Math.round(revenue).toLocaleString()}`},
                                {l:`Margen ${marginPct}%`,v:`$${Math.round(margin).toLocaleString()}`,bold:true,good:positive},
                              ].map((cell,i)=>(
                                <div key={i} style={{background:'var(--paper-50)',padding:'10px 12px',textAlign:'center'}}>
                                  <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:4}}>{cell.l}</div>
                                  <div style={{fontFamily:"var(--font-num)",fontSize:20,fontWeight:600,color:cell.bold?(cell.good?'var(--moss-500)':'var(--coral-500)'):'var(--ink-900)'}}>{cell.v}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{padding:'6px 12px',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-700)',fontWeight:500}}>Precio venta ${vegPrice.toLocaleString()}/kg · Costo total ${Math.round(bd.totalCost).toLocaleString()} COP · Sin contar labor ni servicios · EB sobre materia seca (${bd.dry.toFixed(1)} kg de ${bd.wet.toFixed(1)} kg húmedos).</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
              {recipe.length>0&&<div className="act-row no-print">
                <button className="btn" onClick={()=>window.print()}>Imprimir ficha</button>
                <button className="btn pri" onClick={exportR}>↓ Exportar .txt</button>
                <button className="btn" onClick={()=>{
                  if(typeof html2pdf==='undefined'){setNoticeDlg({msg:'html2pdf no disponible.'});return;}
                  const el=document.querySelector('.print-panel');
                  if(!el){setNoticeDlg({msg:'Genera análisis primero.'});return;}
                  html2pdf().set({margin:10,filename:`receta_${sKey}_${new Date().toISOString().slice(0,10)}.pdf`,html2canvas:{scale:2},jsPDF:{format:'a4',orientation:'portrait'}}).from(el).save();
                }}>↓ PDF</button>
                <button className="btn" onClick={()=>{
                  if(!recipe.length){setNoticeDlg({msg:'No hay receta.'});return;}
                  const p={version:'1.0',exportedAt:new Date().toISOString(),especie:{key:sKey,nombre:an?.sp?.name},receta:recipe.map(r=>{const g=INGS.find(i=>i.id===r.id);return{id:r.id,nombre:g?.name,porcentaje:r.p};}),analisis:an?{cn:an.cn,n:an.avgN,eb:an.eb,costo:an.cost,score:opt.score}:null,tratamiento:tr?{metodo:tr.name,temp:tr.temp,tiempo:tr.time}:null};
                  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}));a.download=`receta_${sKey}_${new Date().toISOString().slice(0,10)}.json`;a.click();
                }}>↓ JSON</button>
                <button className="btn" onClick={()=>{
                  const input=document.createElement('input');input.type='file';input.accept='.json';
                  input.onchange=e=>{
                    const file=e.target.files[0];if(!file) return;
                    const reader=new FileReader();
                    reader.onload=ev=>{
                      try{
                        const p=JSON.parse(ev.target.result);
                        if(p.receta&&p.especie){
                          const apply=()=>{
                            if(p.especie.key&&SPP[p.especie.key]) setSKey(p.especie.key);
                            setRecipe(p.receta.map(r=>({id:r.id,p:r.porcentaje})));
                          };
                          if(recipe.length>0){setConfirmDlg({title:'Reemplazar receta activa',msg:`¿Reemplazar la receta actual con "${p.especie.nombre||p.especie.key}"?`,onConfirm:apply});}
                          else apply();
                        } else {setNoticeDlg({msg:'JSON inválido — no contiene los campos receta/especie.'});}
                      } catch(err){setNoticeDlg({msg:'Error al leer el archivo JSON. Verifica que sea un archivo exportado desde el simulador.'});}
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}>↑ Importar</button>
              </div>}
              
{/* viejo optimizador colapsado eliminado — reemplazado por Perito de Receta */}

{recipe.length>0&&(
                <div className="sbar">
                  <input placeholder="Nombre de la receta…" value={saveName} onChange={e=>setSaveName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveR()} maxLength={60}/>
                  <button className={`sbtn${flash?' fl':''}`} onClick={saveR} disabled={!saveName.trim()||!balanced} title={balanced?'':balMsg}>{flash?'✓ Guardada':'Guardar'}</button>
                  {recipe.length>0&&an&&<button className="sbtn" onClick={()=>{setBitNuevoForm(buildBitNuevoForm());setShowBitNuevo(true);}} disabled={!balanced} title={balanced?'Crear lote experimental en la Bitácora con esta receta':balMsg} style={{background:balanced?'var(--moss-700,#2E3B2F)':'var(--paper-300)',color:balanced?'var(--paper-0)':'var(--ink-500)',border:'none',cursor:balanced?'pointer':'not-allowed'}}>Prueba →</button>}
                  {saveSyncErr&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#C53030'}} title={saveSyncErr}>⚠ sin sincronizar</span>}
                </div>
              )}
            </div>





            </div>
          </div>
          {tab==='formular'&&tr&&recipe.length>0&&(
            <div className="panel treatment-section" id="bl-tratamiento">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,paddingBottom:13,borderBottom:'1px solid var(--paper-300)'}}>
                <div className="sec" style={{marginBottom:0,borderBottom:'none'}}>Tratamiento recomendado</div>
                <button className={`tog${showGuide?' on':''}`} onClick={()=>setShowGuide(!showGuide)}>{showGuide?'Ocultar guía':'Ver guía paso a paso'}</button>
              </div>
              <div className={`tcard ${tr.col}`}>
                <div className="tttl">{tr.name}</div>
                <div className="tparams">{[tr.temp,tr.time,`Spawn ${tr.spawn}%`].map((p,i)=><span key={i} className="tp">{p}</span>)}</div>
                <div className="twhy">{tr.reasons.map((r,i)=><span key={i}>{r}</span>)}</div>
                <div className="tproc">{tr.prep}</div>
                {tr.alt&&<div style={{marginTop:10,fontSize:"var(--text-sm)",color:'var(--ink-500)',background:'var(--paper-200)',border:'1px solid var(--paper-300)',padding:'6px 10px',borderLeft:'2px solid var(--border-soft)'}}>{tr.alt}</div>}
                {tr.energy&&(
                  <div style={{marginTop:10,display:'flex',gap:12,alignItems:'center',padding:'7px 10px',background:'rgba(0,0,0,.04)',borderRadius:'var(--r-xs)',borderTop:'1px solid rgba(0,0,0,.08)'}}>
                    <span style={{fontSize:"var(--text-md)"}}>⚡</span>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",fontWeight:700}}>
                        {tr.energy.cop_per_kg_humedo>0
                          ?`Consumo eléctrico estimado: ${tr.energy.kwh_per_kg} kWh/kg húmedo · $${tr.energy.cop_per_kg_humedo.toLocaleString('es-CO')} COP/kg húmedo · $${(tr.energy.cop_per_kg_seco||0).toLocaleString('es-CO')} COP/kg seco`
                          :'Sin consumo eléctrico — proceso en frío'}
                      </div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",opacity:.7,marginTop:2}}>{tr.energy.detalle}</div>
                    </div>
                    {an&&an.cost>0&&tr.energy.cop_per_kg_seco>0&&(
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontFamily:'var(--font-num)',fontSize:"var(--text-md)",fontWeight:700}}>${(Math.round(an.cost)+tr.energy.cop_per_kg_seco).toLocaleString('es-CO')}</div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-2xs)",opacity:.7}}>COP/kg total</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {showGuide&&<PasteGuide tr={tr} recipe={recipe} numBags={numBags} kgBag={kgBag}/>}
            </div>
          )}

                        <div className="panel rec-panel" style={{display:'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(26,20,16,.1)'}}>
                <div className="sec" style={{marginBottom:0,borderBottom:'none'}}>
                  Recetario <span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-500)',fontWeight:400}}>({saved.length})</span>
                </div>
              </div>
              {showSaved&&<div style={{marginTop:0}}>
                {saved.length===0
                  ?<div className="sempty">Sin recetas en el recetario aún.</div>
                  :<div style={{position:'relative'}}>
                    <div style={{position:'absolute',left:15,top:0,bottom:0,width:'1px',background:'var(--border-soft)',opacity:0}}/>
                    {saved.map((e,idx)=>{const s2=SPP[e.sKey];const isEven=idx%2===0;return(
                      <div key={e.id} style={{display:'flex',alignItems:'flex-start',marginBottom:20,paddingLeft:40}}>
                        <div style={{position:'absolute',left:8,top:6,width:14,height:14,background:'var(--coral-500)',border:'2px solid var(--paper-50)',borderRadius:'50%',zIndex:'var(--z-sticky)'}}/>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-sm)",fontWeight:700,color:'var(--ink-900)',marginBottom:2}}>{e.name}</div>
                          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',background:'var(--paper-200)',padding:'2px 7px',borderRadius:3,fontWeight:600}}>{s2?.name}</span>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',fontWeight:600}}>C:N {e.cn}:1</span>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",fontWeight:700,color:e.eb>=100?'var(--accent-olive)':e.eb>=70?'var(--ochre-500,#A07828)':'#C53030'}}>EB estimada {e.eb}%</span>
                            {e.ebReal!=null&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",fontWeight:700,color:Math.abs(e.ebReal-parseFloat(e.eb))<=10?'var(--accent-olive)':'#C53030'}}>EB real {e.ebReal}% ({e.ebReal>=parseFloat(e.eb)?'+':''}{Math.round((e.ebReal-parseFloat(e.eb))*10)/10})</span>}
                            {liveScoreFor(e)>0&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--coral-500)',fontWeight:600}}>Score {liveScoreFor(e)}/100</span>}
                            {e.cost&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',fontWeight:500}}>${e.cost}/kg</span>}
                          </div>
                          <div style={{display:'flex',gap:6,alignItems:'center'}}>
                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-600)',fontWeight:500}}>{e.date}</span>
                            <button className="sload" onClick={()=>loadR(e)} style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'3px 8px',background:'var(--moss-700)',color:'var(--paper-0)',border:'none',borderRadius:'var(--r-xs)',cursor:'pointer'}}>Cargar</button>
                            <button className="sebreal" onClick={()=>setEbRealFor(e.id)} style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'3px 8px',background:'transparent',color:'var(--ink-700)',border:'1px solid var(--paper-300)',borderRadius:'var(--r-xs)',cursor:'pointer'}}>{e.ebReal!=null?'Editar EB real':'+ EB real'}</button>
                            <button className="sdel" onClick={()=>delR(e.id)} style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",fontWeight:700,padding:'3px 8px',background:'transparent',color:'var(--coral-500)',border:'1px solid var(--coral-200)',borderRadius:'var(--r-xs)',cursor:'pointer'}}>Eliminar</button>
                          </div>
                        </div>
                      </div>
                    );})}
                  </div>}
              </div>}
            </div>


        </div>

        )}

        {tab==='formular'&&(
          <div>
{/* ── GENERADOR DE RECETAS ── */}
            <div id="gen-panel" className="panel opt-panel" style={{marginTop:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(26,20,16,.1)',position:'sticky',top:0,zIndex:'var(--z-sticky-panel)',background:'var(--paper-50,#fff)'}}>
                <div className="sec" style={{marginBottom:0,borderBottom:'none'}}>Generador de recetas</div>
                <button className="tog" onClick={()=>setShowOptimizer(s=>!s)}>{showOptimizer?'Ocultar':'Mostrar'}</button>
              </div>
              {showOptimizer&&(<>
                <div style={{marginTop:0}}>
                  <div className="seg-row" style={{marginBottom:14}}>
                    <button className={'seg'+(formularMode==='auto'?' on':'')} onClick={()=>setFormularMode('auto')}>Automática</button>
                    <button className={'seg'+(formularMode==='manual'?' on':'')} onClick={()=>setFormularMode('manual')}>Por objetivo C:N</button>
                  </div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)',color:'var(--ink-700)',marginBottom:12,paddingBottom:10,borderBottom:'1px solid var(--paper-300)'}}>
                    {formularMode==='auto'
                      ?'Genera combinaciones base×suplemento óptimas para tu especie — desde tu bodega o toda la paleta.'
                      :'Elige dos ingredientes y un C:N objetivo. El sistema calcula las proporciones exactas.'}
                  </div>
            {formularMode==='auto'&&(
              <div>
                          <div style={{marginBottom:16}}>
                            {/* ── controles editoriales ── */}
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px',marginBottom:14}}>
                              <div style={{borderBottom:'1px solid var(--ink-900)',paddingBottom:4}}>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:4}}>Especie objetivo</div>
                                <select style={{width:'100%',border:'none',background:'transparent',fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:"var(--text-md)",color:'var(--ink-900)',outline:'none',padding:'2px 0',cursor:'pointer'}}
                                  value={optTarget} onChange={e=>setOptTarget(e.target.value)}>
                                  {Object.entries(SPP).map(([k,s])=><option key={k} value={k}>{s.name}</option>)}
                                </select>
                              </div>
                              <div style={{borderBottom:'1px solid var(--ink-900)',paddingBottom:4}}>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:4}}>Costo máx. $/kg</div>
                                <input type="number" min="0" step="100" value={optMaxCost} onChange={e=>setOptMaxCost(parseInt(e.target.value)||0)}
                                  aria-label="Costo máximo por kg (vacío = sin límite)"
                                  style={{width:'100%',border:'none',background:'transparent',fontFamily:'var(--font-mono)',fontSize:"var(--text-md)",color:'var(--ink-900)',outline:'none',padding:'2px 0'}} placeholder="Sin límite"/>
                              </div>
                            </div>
                            {/* fuente + perfil en una sola fila compacta */}
                            <div style={{display:'flex',gap:16,alignItems:'flex-end',marginBottom:14,flexWrap:'wrap',position:'sticky',top:0,zIndex:'var(--z-sticky)',background:'var(--paper-50,#fff)',padding:'10px 0 10px',borderBottom:'1px solid var(--border-soft)',marginLeft:0,marginRight:0}}>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-2xs)',letterSpacing:'var(--tracking-label)',textTransform:'uppercase',color:'var(--ink-500)'}}>Origen</div>
                                <div className="chip-row">
                                  {[['stock','Solo bodega',true],['full','Paleta completa',false]].map(([k,l,v])=>(
                                    <button key={k} className={'chip'+(optUseStock===v?' on':'')} onClick={()=>setOptUseStock(v)}>{l}</button>
                                  ))}
                                </div>
                              </div>
                              <div style={{width:1,height:16,background:'var(--border-soft)'}}></div>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:'var(--text-2xs)',letterSpacing:'var(--tracking-label)',textTransform:'uppercase',color:'var(--ink-500)'}}>Nivel</div>
                                <div className="chip-row">
                                  {Object.entries(OPT_PROFILES).map(([k,p])=>(
                                    <button key={k} className={'chip'+(optProfile===k?' on':'')} style={optProfile===k?{color:p.color,borderBottomColor:p.color}:undefined} onClick={()=>setOptProfile(k)}>{p.label}</button>
                                  ))}
                                </div>
                              </div>
                              <button
                                className="btn dark"
                                onClick={()=>{
                                  setOptRunning(true);setOptResults(null);
                                  setTimeout(()=>{
                                    let noStock=false;let _diag=null;
                                    const byProfile={};
                                    Object.keys(OPT_PROFILES).forEach(pk=>{
                                      try{
                                        const out=runHybridRecipeSearch({
                                          targetKey:optTarget,
                                          recipe:[],
                                          invLotes,
                                          maxCost:optMaxCost,
                                          ingredients:optimizerINGS,
                                          useStock:optUseStock,
                                          profileKey:pk,
                                          stockMap,
                                        });
                                        noStock=noStock||!!out.noStock;
                                        byProfile[pk]=(out.ranked||[]).slice(0,12).map(c=>
                                          hybridOptimizerRow(c,optTarget,optimizerINGS,stockMap,pk)
                                        );
                                        const diag=hybridOptimizerDiag(out,optTarget,optimizerINGS,optUseStock,invLotes,pk);
                                        const stockCount=diag.stockIds;
                                        byProfile[`_diag_${pk}`]={stockCount,diag};
                                        if(pk===optProfile)_diag={stockCount,diag};
                                      }catch(e){
                                        byProfile[pk]=[];
                                        const diag={error:e.message||String(e),profileKey:pk,targetKey:optTarget};
                                        byProfile[`_diag_${pk}`]={stockCount:0,diag};
                                        if(pk===optProfile)_diag={stockCount:0,diag};
                                      }
                                    });
                                    // Sin fallback — cada perfil muestra solo lo que le corresponde
                                    setOptResults({...byProfile,noStock,_diag});
                                    setOptRunning(false);
                                  },50);
                                }}
                                style={{marginLeft:'auto',flex:'none',minWidth:0,padding:'6px 16px'}}>
                                {optRunning?<span><span className="spin">↻</span> …</span>:'Calcular'}
                              </button>
                            </div>
                            {optUseStock?(()=>{const sc=[...new Set(invLotes.filter(l=>l.activo&&l.cantidadKgDisponible>0).map(l=>l.ingredienteId))].length;
                              return sc>0?(
                                <div style={{padding:'8px 12px',background:'var(--moss-50,#F0F4EB)',border:'1px solid var(--moss-300,#B8C9A0)',borderRadius:'var(--r-sm)',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--moss-700,var(--accent-olive))',marginBottom:12}}>
                                  Usando solo ingredientes en stock · {sc} disponibles en inventario
                                </div>
                              ):(
                                <div style={{padding:'10px 14px',background:'#FBF6E8',border:'1px solid #D4A838',borderRadius:'var(--r-sm)',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'#7A5A10',marginBottom:12}}>
                                  Inventario vacío. Cambia a <strong>Paleta completa</strong> para generar recetas con toda la paleta, o registra compras en Inventario.
                                </div>
                              );
                            })():(
                              <div style={{padding:'8px 12px',background:'var(--coral-50,#FCEEE9)',border:'1px solid var(--coral-300,#E8B4A0)',borderRadius:'var(--r-sm)',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--coral-600,#B5451F)',marginBottom:12}}>
                                Generando con toda la paleta compatible con {SPP[optTarget]?.name} · ignora inventario · ideal para diseñar la receta antes de comprar
                              </div>
                            )}
                            {optResults&&optResults[optProfile]&&(
                              <div>
                                <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:12,paddingBottom:8,borderBottom:'1px solid var(--border-soft)'}}>
                                  {optResults[optProfile].length} combinaciones exclusivas · perfil <b>{OPT_PROFILES[optProfile]?.label}</b> · {optUseStock?'solo stock':'paleta completa'} · C:N objetivo {SPP[optTarget]?.cn_optimal.ideal}:1
                                </div>
                                {optResults[optProfile].map((r,i)=>{
                                  const mainIngs=r.recipe.map(x=>{const g=INGS.find(ing=>ing.id===x.id);return g?`${g.name} ${x.p}%`:x.id;}).filter(Boolean);
                                  const baseSig=r.recipe.map(x=>x.id).filter(id=>{const g=INGS.find(ing=>ing.id===id);return g&&g.role==='base_carbono';}).sort().join('+');
                                  return(
                                    <div key={i} className="opt-result" data-result-id={i} data-base-signature={baseSig}>
                                      <div className="opt-result-head">
                                        <div className="opt-rank">#{i+1}</div>
                                        <div style={{display:'flex',flexDirection:'column',gap:1}}>
                                          <div className="opt-score">{r.score}</div>
                                          <div className="opt-score-lbl">SCORE</div>
                                        </div>
                                        <div className="opt-pills" style={{flex:1}}>
                                          {mainIngs.map((s,j)=><span key={j} className="opt-pill">{s}</span>)}
                                          {r.suppOverLimit&&<span className="opt-pill" style={{background:'var(--status-attention-bg)',borderColor:'var(--status-attention)',color:'var(--status-attention)'}}>⚠ Supl. {r.suppPct.toFixed(0)}% &gt; límite</span>}
                                        </div>
                                        <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                          <button className="opt-load" onClick={()=>{setSKey(optTarget);setRecipe(r.recipe);setLockedIds([]);goTab('formular');;setLoadedFlash(true);setTimeout(()=>setLoadedFlash(false),2200);}}>Cargar</button>
                                          <button className="opt-load" style={{background:'var(--moss-600,var(--accent-olive))',borderColor:'var(--moss-700,var(--accent-olive))'}} onClick={()=>{setSKey(optTarget);setRecipe(r.recipe);setLockedIds([]);goTab('produccion');}}>Producir</button>
                                        </div>
                                      </div>
                                      <div className="opt-metrics">
                                        {(()=>{
                                          const tOpt=calcTreatment(r.an, optTarget, SPP);
                                          const eCost=tOpt?.energy?.cop_per_kg_seco||0;
                                          const totalCost=Math.round(r.an.cost)+eCost;
                                          return[
                                            {l:'C:N',v:`${r.an.cn.toFixed(1)}:1`},
                                            {l:'N%',v:`${r.an.avgN.toFixed(2)}%`},
                                            {l:'EB',v:r.an.ebLow&&r.an.ebHigh?`${r.an.ebLow}–${r.an.ebHigh}%`:`${r.an.eb.toFixed(0)}%`},
                                            {l:'Costo total/kg',v:totalCost>0?`${totalCost.toLocaleString('es-CO')}`:'--',
                                             sub:eCost>0?`ing ${Math.round(r.an.cost).toLocaleString()}+proc ${eCost.toLocaleString()}`:null},
                                          ];
                                        })().map(m=>(
                                          <div key={m.l} className="opt-met">
                                            <div className="opt-met-lbl">{m.l}</div>
                                            <div className="opt-met-val" style={{fontSize:m.v&&m.v.length>6?14:18}}>{m.v}</div>
                                            {m.sub&&<div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-micro)",color:'var(--ink-500)',lineHeight:1.3,marginTop:1}}>{m.sub}</div>}
                                          </div>
                                        ))}
                                      </div>
                                      {/* Riesgo + bodega produce */}
                                      <div style={{display:'flex',gap:0,background:'var(--paper-100)',borderTop:'1px solid var(--border-soft)'}}>
                                        <div style={{flex:1,padding:'7px 10px',borderRight:'1px solid var(--border-soft)'}}>
                                          <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-600)',marginBottom:2}}>Riesgo</div>
                                          <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-base)",fontWeight:700,color:r.riskScore>=80?'var(--accent-olive)':r.riskScore>=55?'var(--ochre-500,#A07828)':'#C53030'}}>{r.riskScore??'—'}/100</div>
                                        </div>
                                        {r.maxKgWet!=null&&(
                                          <div style={{flex:2,padding:'7px 10px'}}>
                                            <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-600)',marginBottom:2}}>Bodega produce</div>
                                            <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-base)",fontWeight:700,color:'var(--slate-700,var(--accent-blue-grey))'}}>{r.maxKgWet>0?`hasta ${r.maxKgWet} kg húmedos`:'stock insuficiente'}</div>
                                          </div>
                                        )}
                                      </div>
                                      {r.an.cost>0&&(()=>{
                                        const tOpt2=calcTreatment(r.an, optTarget, SPP);
                                        const eCost2=tOpt2?.energy?.cop_per_kg_seco||0;
                                        const bags=[
                                          {nom:'Bolsa 20×50',kgH:1.8},
                                          {nom:'Bolsa 18×35',kgH:1.0},
                                          {nom:'Punch bag',kgH:3.5},
                                        ];
                                        const hFactor=optTarget.includes('shiitake')||optTarget.includes('lions')||optTarget.includes('reishi')?0.40:0.35;
                                        return(
                                          <div style={{display:'flex',gap:0,borderTop:'1px solid var(--border-soft)',borderBottom:'none'}}>
                                            {bags.map(b=>{
                                              const kgSeco=b.kgH*hFactor;
                                              const costBolsa=Math.round((r.an.cost+eCost2)*kgSeco);
                                              return(
                                                <div key={b.nom} style={{flex:1,padding:'5px 8px',borderRight:'1px solid var(--border-soft)',textAlign:'center',background:'var(--paper-50)'}}>
                                                  <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-700)',marginBottom:2,letterSpacing:'var(--tracking-label)',fontWeight:600}}>{b.nom}</div>
                                                  <div style={{fontFamily:'var(--font-num)',fontSize:"var(--text-base)",color:'var(--coral-700)',fontWeight:700}}>${costBolsa.toLocaleString('es-CO')}</div>
                                                  <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-600)',fontWeight:500}}>COP / bolsa</div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })()}
                                      {(()=>{
                                        const t=calcTreatment(r.an, optTarget, SPP);
                                        if(!t) return null;
                                        const tc=t.col==='autoclave'
                                          ?{bg:'#FCEEE9',br:'#E8B4A0',fg:'#B5451F',lbl:'Autoclave 121°C / 18.5–19 PSI'}
                                          :t.col==='thermal'
                                          ?{bg:'var(--status-attention-bg)',br:'var(--status-attention)',fg:'var(--status-attention)',lbl:'Pasteurización 65–75°C núcleo'}
                                          :{bg:'#EEF3EA',br:'#90A870',fg:'#3D5520',icon:'❄',lbl:'CWLP — Cal en Frío pH≥12'};
                                        return(
                                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 14px',background:tc.bg,borderTop:`1px solid ${tc.br}`}}>
                                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:tc.fg,fontWeight:700}}>{tc.icon} {tc.lbl} · {t.time.split('(')[0].trim()}</span>
                                            <span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:tc.fg,opacity:.8}}>Spawn {t.spawn}%</span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!optRunning&&optResults&&!optResults.noStock&&optResults[optProfile]?.length===0&&(
                              <div style={{padding:'18px',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--ink-700)',border:'1px dashed var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-100)'}}>
                                {(()=>{const d=optResults[`_diag_${optProfile}`]||{diag:optResults._diag?.diag};const diag=d?.diag;return diag?(
                                  <div>
                                    <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--coral-700)',marginBottom:10}}>Sin combinaciones válidas — diagnóstico</div>
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 16px',marginBottom:12}}>
                                      {[
                                        ['Stock en bodega',diag.stockIds],
                                        ['Disponibles para especie (pool)',diag.poolSize],
                                        ['Bases carbono compatibles',diag.bases],
                                        ['Suplementos N compatibles',diag.supps],
                                        ['Combinaciones evaluadas',diag.tried],
                                        ['Resultados antes de filtros',diag.resultsRaw],
                                        ['Límite suplementación',diag.suppLimit+'%'],
                                        ['Perfil activo',OPT_PROFILES[diag.profileKey]?.label||diag.profileKey],
                                      ].map(([lb,v])=>(
                                        <div key={lb} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:'1px solid var(--paper-300)'}}>
                                          <span style={{color:'var(--ink-500)'}}>{lb}</span>
                                          <span style={{fontWeight:700,color:Number(v)===0?'var(--coral-700)':'var(--ink-900)'}}>{v}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {diag.bases===0&&<div style={{color:'var(--coral-700)',marginBottom:6}}>⚠ Ningún ingrediente en bodega tiene rol <b>base carbono</b> compatible con esta especie.</div>}
                                    {diag.supps===0&&<div style={{color:'var(--coral-700)',marginBottom:6}}>⚠ Ningún suplemento N en bodega es compatible con esta especie.</div>}
                                    {diag.bases>0&&diag.supps>0&&diag.tried===0&&<div style={{color:'var(--coral-700)',marginBottom:6}}>⚠ C y N de base y suplemento son demasiado similares para resolver la ecuación.</div>}
                                    {diag.tried>0&&diag.resultsRaw===0&&<div style={{color:'#7A5A10',marginBottom:6}}>⚠ Tus bases requieren más suplementación de la que permite el perfil <b>{OPT_PROFILES[optProfile]?.label}</b> (límite {diag.suppLimit}%). Prueba con perfil <b>Producción</b> o añade paja de trigo/cebada a tu bodega.</div>}
                                    {diag.bases>0&&<div style={{marginTop:8,lineHeight:1.6}}><b>Bases:</b> {diag.baseNames.join(', ')}</div>}
                                    {diag.supps>0&&<div style={{marginTop:3,lineHeight:1.6}}><b>Suplementos:</b> {diag.suppNames.join(', ')}</div>}
                                  </div>
                                ):(<div style={{textAlign:'center',padding:'20px 0',color:'var(--ink-500)'}}>Selecciona especie y presiona Calcular.</div>);})()}</div>
                            )}
                            {!optRunning&&optResults&&optResults.noStock&&(
                              <div role="button" tabIndex={0} onClick={()=>{goTab('inventario');setInvTab('compra');}} onKeyDown={e=>{if(e.key==='Enter'){goTab('inventario');setInvTab('compra');}}} style={{cursor:'pointer',textAlign:'center',padding:'32px 20px',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--status-attention)',border:'1px dashed var(--status-attention)',borderRadius:'var(--r-sm)',background:'#FBF6E8'}}>
                                Sin stock registrado. Ve a <strong>Bodega → Compra</strong> para agregar ingredientes.
                              </div>
                            )}
                          </div>
                        </div>
            )}                              {formularMode==='manual'&&(
              <div className="panel panel-accent">
                          <div className="sec">Formulación por Objetivo C:N</div>
                          <div style={{marginBottom:16,padding:'8px 12px',background:'var(--paper-200)',border:'1px solid var(--paper-300)',fontFamily:"var(--font-body)",fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',lineHeight:1.6}}>
                            Selecciona dos ingredientes y un C:N objetivo — el sistema calcula las proporciones exactas.
                          </div>
                          {sp&&(
                            <div style={{display:'flex',gap:24,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--border-soft)'}}>
                              <div>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:2}}>Especie activa</div>
                                <div style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:"var(--text-md)",color:'var(--ink-900)'}}>{sp.name}</div>
                              </div>
                              <div>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:2}}>C:N ideal</div>
                                <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-md)",color:'var(--ink-900)'}}>{sp.cn_optimal.ideal}:1</div>
                              </div>
                              <div>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:2}}>Rango</div>
                                <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-md)",color:'var(--ink-900)'}}>{sp.cn_optimal.min}–{sp.cn_optimal.max}</div>
                              </div>
                              <div>
                                <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:2}}>N objetivo</div>
                                <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-md)",color:'var(--ink-900)'}}>{sp.n_optimal.min}–{sp.n_optimal.max}%</div>
                              </div>
                            </div>
                          )}
                          <div className="inv-grid">
                            <div className="inv-field">
                              <label htmlFor="inv-base">Ingrediente base (carbono)</label>
                              <select id="inv-base" value={invBase} onChange={e=>setInvBase(e.target.value)}>
                                <option value="">— Seleccionar —</option>
                                {INGS.filter(g=>g.role==='base_carbono'&&g.cn>0&&g.n>0&&g.cs.includes(sKey)).map(g=>(
                                  <option key={g.id} value={g.id}>{g.name} · C:N {g.cn}:1 · N {g.n}%</option>
                                ))}
                              </select>
                            </div>
                            <div className="inv-field">
                              <label htmlFor="inv-supp">Suplemento nitrógeno</label>
                              <select id="inv-supp" value={invSupp} onChange={e=>setInvSupp(e.target.value)}>
                                <option value="">— Seleccionar —</option>
                                {INGS.filter(g=>['suplemento_n','suplemento_medio'].includes(g.role)&&g.cn>0&&g.n>0&&g.cs.includes(sKey)).map(g=>(
                                  <option key={g.id} value={g.id}>{g.name} · C:N {g.cn}:1 · N {g.n}%</option>
                                ))}
                              </select>
                            </div>
                            <div className="inv-field">
                              <label htmlFor="inv-aer">Aireador (opcional)</label>
                              <select id="inv-aer" value={invAer} onChange={e=>setInvAer(e.target.value)}>
                                <option value="">— Ninguno —</option>
                                {INGS.filter(g=>g.role==='aireador'&&g.cs.includes(sKey)).map(g=>(
                                  <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="inv-field">
                              <label htmlFor="inv-min">Mineral / corrector pH (%)</label>
                              <input id="inv-min" type="number" min="0" max="10" step="0.5" required value={invMin} onChange={e=>setInvMin(parseFloat(e.target.value)||0)}/>
                            </div>
                            {invAer&&(
                              <div className="inv-field">
                                <label htmlFor="inv-aerpct">Aireador fijo (%)</label>
                                <input id="inv-aerpct" type="number" min="5" max="25" step="1" required value={invAerPct} onChange={e=>setInvAerPct(parseInt(e.target.value)||10)}/>
                              </div>
                            )}
                          </div>
                          <div style={{marginBottom:18}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}>
                              <span style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)'}}>C:N objetivo</span>
                              <span style={{fontFamily:"var(--font-num)",fontSize:28,fontWeight:600,color:sp&&invTargetCN>=sp.cn_optimal.min&&invTargetCN<=sp.cn_optimal.max?'var(--moss-500)':'var(--coral-500)'}}>{invTargetCN}:1</span>
                            </div>
                            <input type="range" min="10" max="120" step="1" value={invTargetCN} onChange={e=>setInvTargetCN(parseInt(e.target.value))} aria-label="Relación C:N objetivo" aria-valuetext={`${invTargetCN}:1`} style={{width:'100%',accentColor:'var(--coral-500)',marginBottom:6}}/>
                            {sp&&(
                              <div style={{position:'relative',height:4,background:'var(--paper-300)',borderRadius:2}}>
                                <div style={{position:'absolute',left:`${((sp.cn_optimal.min-10)/110)*100}%`,width:`${((sp.cn_optimal.max-sp.cn_optimal.min)/110)*100}%`,height:'100%',background:'rgba(77,98,53,.35)',borderRadius:2}}/>
                                <div style={{position:'absolute',left:`${((sp.cn_optimal.ideal-10)/110)*100}%`,width:2,height:'220%',top:'-60%',background:'var(--moss-500)',borderRadius:1}}/>
                              </div>
                            )}
                            <div style={{display:'flex',justifyContent:'space-between',marginTop:7,fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--border-soft)'}}>
                              <span>10</span>
                              {sp&&<span style={{color:'var(--moss-500)'}}>óptimo {sp.cn_optimal.min}–{sp.cn_optimal.max}</span>}
                              <span>120</span>
                            </div>
                          </div>
                          <button className="btn pri" style={{width:'100%',padding:13,fontSize:"var(--text-sm)",letterSpacing:'var(--tracking-button)'}} disabled={!invBase||!invSupp}
                            onClick={()=>{
                              const bI=INGS.find(i=>i.id===invBase);
                              const sI=INGS.find(i=>i.id===invSupp);
                              if(!bI||!sI) return;
                              const T=invTargetCN, pMin=invMin, pAer=invAer?invAerPct:0;
                              const pRem=100-pMin-pAer;
                              if(pRem<=2){setInvResult({error:'Los porcentajes fijos superan 98%. Reduce mineral o aireador.'});return;}
                              const bDry=1-Math.min(0.92,Math.max(0,(bI.moisture||0)/100));
                              const sDry=1-Math.min(0.92,Math.max(0,(sI.moisture||0)/100));
                              const cb=bI.c*bDry, nb=bI.n*bDry, cs=sI.c*sDry, ns=sI.n*sDry;
                              const denom=(cb-cs)-T*(nb-ns);
                              if(Math.abs(denom)<0.001){setInvResult({error:'Ingredientes demasiado similares en C:N. Elige una base de mayor C:N o un suplemento con más N.'});return;}
                              const ps=pRem*(cb-T*nb)/denom;
                              const pb=pRem-ps;
                              if(ps<0||pb<0||ps>pRem){
                                const cnMin=Math.min(bI.cn,sI.cn).toFixed(0), cnMax=Math.max(bI.cn,sI.cn).toFixed(0);
                                setInvResult({error:`C:N ${T}:1 no alcanzable con estos ingredientes. Rango posible: ${cnMin}–${cnMax}:1`});
                                return;
                              }
                              const res=[];
                              res.push({id:invBase,p:Math.round(pb*10)/10});
                              res.push({id:invSupp,p:Math.round(ps*10)/10});
                              if(invAer&&pAer>0) res.push({id:invAer,p:pAer});
                              if(pMin>0) res.push({id:'carbonato_calcio',p:pMin});
                              const anRes=analyze(res,sKey,effectiveINGS);
                              setInvResult({recipe:res,an:anRes});
                            }}
                          >⇌ Calcular proporciones exactas</button>
                          {invResult&&(
                            <div className="inv-result">
                              {invResult.error
                                ?<div style={{color:'var(--coral-500)',fontFamily:"var(--font-num)",fontSize:18,fontStyle:'italic',lineHeight:1.5}}>{invResult.error}</div>
                                :(<>
                                  <div className="sec" style={{marginTop:0}}>Resultado</div>
                                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
                                    {invResult.recipe.map(r=>{
                                      const g=INGS.find(i=>i.id===r.id);
                                      return g?(
                                        <div key={r.id} style={{padding:'10px 16px',background:'var(--paper-50)',border:'1px solid var(--border-soft)',minWidth:100,textAlign:'center'}}>
                                          <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:4}}>{g.name.length>18?g.name.slice(0,18)+'…':g.name}</div>
                                          <div style={{fontFamily:"var(--font-num)",fontSize:32,fontWeight:300,color:'var(--coral-500)',lineHeight:1}}>{r.p}<span style={{fontSize:"var(--text-base)",color:'var(--ink-500)',marginLeft:1}}>%</span></div>
                                        </div>
                                      ):null;
                                    })}
                                  </div>
                                  {invResult.an&&(
                                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:14}}>
                                      {[
                                        {l:'C:N logrado',v:`${invResult.an.cn.toFixed(1)}:1`,ok:sp&&invResult.an.cn>=sp.cn_optimal.min&&invResult.an.cn<=sp.cn_optimal.max},
                                        {l:'Nitrógeno',v:`${invResult.an.avgN.toFixed(2)}%`,ok:sp&&invResult.an.avgN>=sp.n_optimal.min&&invResult.an.avgN<=sp.n_optimal.max},
                                        {l:'EB esperada',v:invResult.an.ebLow&&invResult.an.ebHigh?`${invResult.an.ebLow}–${invResult.an.ebHigh}%`:`${invResult.an.eb.toFixed(0)}%`,ok:invResult.an.eb>=90},
                                        {l:'Costo/kg',v:`${Math.round(invResult.an.cost)}`,ok:invResult.an.cost<1000},
                                      ].map((m,i)=>(
                                        <div key={i} style={{background:'var(--paper-50)',border:`1px solid ${m.ok?'var(--moss-500)':'var(--border-soft)'}`,padding:'10px 12px',textAlign:'center'}}>
                                          <div style={{fontFamily:"var(--font-body)",fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:4}}>{m.l}</div>
                                          <div style={{fontFamily:"var(--font-num)",fontSize:20,fontWeight:600,color:m.ok?'var(--moss-500)':'var(--coral-500)'}}>{m.v}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <button className="btn pri" style={{width:'100%'}} onClick={()=>{setRecipe(invResult.recipe);goTab('formular');}}>Cargar en Formulador</button>
                                </>)
                              }
                            </div>
                          )}
                        </div>
            )}
                </div>
              </>)}
            </div>
          </div>
        )}

        {tab==='schedule'&&(
          <div className="panel panel-accent">
            <div className="schctrl">
              <div className="schctl"><label htmlFor="sch-date">Fecha de inoculación</label><input id="sch-date" type="date" value={schDate} onChange={e=>setSchDate(e.target.value)}/></div>
              <div className="schctl"><label htmlFor="sch-key">Especie</label><select id="sch-key" value={schKey} onChange={e=>setSchKey(e.target.value)}>{Object.entries(SPP).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select></div>
              {an&&<div style={{padding:'9px 13px',border:'1px solid var(--border-soft)',background:'var(--paper-100)',fontSize:"var(--text-sm)",color:'var(--coral-500)',fontFamily:"var(--font-mono)",alignSelf:'flex-end'}}>EB {an.eb.toFixed(0)}% → tiempos ajustados</div>}
            </div>
            {sch&&(<>
              <div className="schsum">
                <div className="ssc"><div className="ssv">{sch.inc} días</div><div className="ssl">Incubación</div></div>
                <div className="ssc"><div className="ssv" style={{fontSize:20,fontWeight:400,paddingTop:5}}>{sch.first}</div><div className="ssl">Primera cosecha</div></div>
                <div className="ssc"><div className="ssv">{sch.tot} días</div><div className="ssl">Ciclo completo</div></div>
              </div>
              <div className="tl">
                {sch.evts.map(e=>(
                  <div key={e.key} className={`tle ${e.type}`}>
                    <div className="tle-dt">Día {e.day} · {e.ds}</div>
                    <div className="tle-t">{e.title}</div>
                    <div className="tle-d">{e.detail}</div>
                  </div>
                ))}
              </div>
              <div className="lnote">Tiempos para Tenjo, Cundinamarca (2600 m.s.n.m., 12–18°C ambiente). Ajustados por EB estimada de la receta activa.</div>
            </>)}
          </div>
        )}


        {tab==='produccion'&&(
          <div>
            {/* Selector de tipo de bolsa / recipiente */}
            <div className="panel no-print" style={{marginBottom:10}}>
              <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:10}}>Tipo de contenedor</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
                {BAG_TYPES.map(bt=>{
                  const on=prodBagType===bt.id;
                  return(
                    <button key={bt.id} onClick={()=>{setProdBagType(bt.id);setProdKg(bt.kgHumedo);}} style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:2,padding:'8px 12px',border:`1.5px solid ${on?bt.color:'var(--border-soft)'}`,borderRadius:'var(--r-sm)',background:on?'var(--paper-100)':'var(--paper-50)',cursor:'pointer',textAlign:'left',minWidth:170,transition:'background-color .12s,border-color .12s,color .12s,transform .12s'}}>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",color:on?bt.color:'var(--ink-900)'}}>{bt.icon} {bt.name.split('·')[0].trim()}</div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)'}}>{bt.dim} · {bt.kgHumedo} kg húmedo · {bt.vol_L} L</div>
                    </button>
                  );
                })}
              </div>
              {(()=>{
                const bt=BAG_TYPES.find(b=>b.id===prodBagType);
                if(!bt) return null;
                const tc=bt.tratamiento==='thermal'
                  ?{bg:'#FBF6E8',br:'#D4A838',fg:'#7A5A10',icon:'♨',lbl:'Requiere pasteurización térmica (núcleo 65–75°C · 6–8h + 25% altitud)'}
                  :bt.tratamiento==='cwlp_thermal'
                  ?{bg:'#EEF3EA',br:'#90A870',fg:'#3D5520',lbl:'Compatible con CWLP (cal en frío) o pasteurización'}
                  :{bg:'#FCEEE9',br:'#E8B4A0',fg:'#B5451F',lbl:'Requiere autoclave 121°C / 18.5–19 PSI'};
                return(
                  <div>
                    <div style={{padding:'7px 11px',background:tc.bg,border:`1px solid ${tc.br}`,borderRadius:'var(--r-xs)',fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:tc.fg,marginBottom:7}}>
                      {tc.icon} <b>Tratamiento:</b> {tc.lbl}
                    </div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-700)',lineHeight:1.5}}>
                      <b style={{color:'var(--ink-900)'}}>Uso:</b> {bt.notas}
                    </div>
                    {bt.produccion&&<div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-700)',lineHeight:1.5,marginTop:4}}>
                      <b style={{color:'var(--ink-900)'}}>Producción:</b> {bt.produccion}
                    </div>}
                  </div>
                );
              })()}
            </div>

            {/* Controles del lote (no se imprimen) */}
            <div className="panel no-print" style={{marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,paddingBottom:12,borderBottom:'1px solid var(--border-soft)'}}><span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-800)'}}>Hoja de Producción — Lote</span></div>
              {!recipe.length?(
                <div style={{padding:'14px',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--status-attention)',background:'var(--status-attention-bg)',border:'1px solid var(--status-attention)',borderRadius:'var(--r-sm)'}}>
                  No hay receta activa. Arma una en <strong>Formulador</strong> o genera una automáticamente en <strong>Generar</strong>.
                </div>
              ):(
                <>
                {an&&!balanced&&(
                  <div style={{padding:'14px',marginBottom:14,fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'#C53030',background:'rgba(197,48,48,.08)',border:'1px solid #C53030',borderRadius:'var(--r-sm)'}}>
                    ⚠ {balMsg} — no se puede ejecutar el lote ni guardar la receta hasta que la mezcla cierre en 100% (±{MASS_BALANCE_TOL}%). Ajusta los porcentajes en el <strong>Formulador</strong>.
                  </div>
                )}
                <div className="prod-batch-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1.2fr 1fr auto',gap:10,alignItems:'end'}}>
                  <div>
                    <label htmlFor="prod-skey" style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:5}}>Especie</label>
                    <select id="prod-skey" value={sKey} onChange={e=>setSKey(e.target.value)} style={{width:'100%',padding:'9px 11px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-50)',fontFamily:'var(--font-body)',fontSize:"var(--text-base)"}}>
                      {Object.entries(SPP).map(([k,s])=><option key={k} value={k}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prod-bags" style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:5}}># Bolsas</label>
                    <input id="prod-bags" type="number" min="1" step="1" value={prodBags} onChange={e=>{const v=e.target.value;setProdBags(v===''?'':(parseInt(v)||''));}} onBlur={()=>{if(prodBags===''||isNaN(prodBags))setProdBags(1);}} style={{width:'100%',padding:'9px 11px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-50)',fontFamily:'var(--font-mono)',fontSize:"var(--text-base)"}}/>
                  </div>
                  <div>
                    <label htmlFor="prod-kg" style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:5}}>kg / bolsa</label>
                    <input id="prod-kg" type="number" min="0.1" step="0.1" value={prodKg} onChange={e=>{const v=e.target.value;setProdKg(v===''?'':(parseFloat(v)||''));}} onBlur={()=>{if(prodKg===''||isNaN(prodKg))setProdKg(1.5);}} style={{width:'100%',padding:'9px 11px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-50)',fontFamily:'var(--font-mono)',fontSize:"var(--text-base)"}}/>
                  </div>
                  <div>
                    <label htmlFor="prod-h" style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:5}}>Humedad % · Inóculo</label>
                    <div style={{display:'flex',gap:6}}>
                      <input id="prod-h" type="number" min="55" max="75" step="1" value={prodH} onChange={e=>{const v=e.target.value;setProdH(v===''?'':(parseInt(v)||''));}} onBlur={()=>{if(prodH===''||isNaN(prodH))setProdH(67);}} style={{width:'50%',padding:'9px 8px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-50)',fontFamily:'var(--font-mono)',fontSize:"var(--text-base)"}}/>
                      <input type="date" name="fechaInoculo" aria-label="Fecha de inóculo" value={prodDate} onChange={e=>setProdDate(e.target.value)} style={{width:'50%',padding:'9px 6px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-50)',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)"}}/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="prod-scale" style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:5}}>Báscula (g)</label>
                    <select id="prod-scale" value={prodScaleG} onChange={e=>setProdScaleG(parseFloat(e.target.value))} style={{width:'100%',padding:'9px 11px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-50)',fontFamily:'var(--font-mono)',fontSize:"var(--text-base)"}}>
                      {[['0.1','0.1 g (100 mg)'],['1','1 g'],['5','5 g'],['10','10 g'],['50','50 g']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'flex-end'}}>
                    <div style={{flex:1,minWidth:140}}>
                      <label htmlFor="prod-lote" style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-500)',display:'block',marginBottom:5}}>N.º lote</label>
                      <input id="prod-lote" name="numeroLote" autoComplete="off" type="text" value={prodLoteNum} onChange={e=>setProdLoteNum(e.target.value)} placeholder="Ej. L-2026-047…" maxLength={24} style={{width:'100%',padding:'9px 11px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',background:'var(--paper-50)',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",boxSizing:'border-box'}}/>
                    </div>
                    {Object.keys(prodMoist).length>0&&<button onClick={()=>setProdMoist({})} title="Volver a las humedades de la base de datos" style={{padding:'9px 12px',background:'var(--paper-50)',color:'var(--ink-500)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-sm)',fontFamily:'var(--font-body)',fontWeight:700,fontSize:"var(--text-sm)",cursor:'pointer',whiteSpace:'nowrap',alignSelf:'flex-end'}}>↺ H₂O</button>}
                    <button onClick={exportPDF} disabled={!balanced} title={balanced?'':balMsg} style={{padding:'9px 14px',background:balanced?'var(--ink-900)':'var(--paper-300)',color:balanced?'var(--paper-50)':'var(--ink-500)',border:'none',borderRadius:'var(--r-sm)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",letterSpacing:'var(--tracking-label)',textTransform:'uppercase',cursor:balanced?'pointer':'not-allowed',whiteSpace:'nowrap',alignSelf:'flex-end'}}>↓ PDF</button>
                    <button onClick={printProdSheet} disabled={!balanced} title={balanced?'':balMsg} style={{padding:'9px 14px',background:balanced?'var(--coral-500)':'var(--paper-300)',color:balanced?'var(--paper-0)':'var(--ink-500)',border:'none',borderRadius:'var(--r-sm)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",letterSpacing:'var(--tracking-label)',textTransform:'uppercase',cursor:balanced?'pointer':'not-allowed',whiteSpace:'nowrap',alignSelf:'flex-end'}}>Imprimir</button>
                    <button onClick={()=>prodRows&&ejecutarLote(prodRows,prodLoteNum,prodDate)} disabled={!prodRows} title={prodRows?"Descontar kg comerciales del inventario (FIFO)":(!balanced?balMsg:'Completa # bolsas y kg/bolsa para generar la ficha')} style={{padding:'9px 14px',background:prodRows?'var(--moss-700)':'var(--paper-300)',color:prodRows?'var(--paper-0)':'var(--ink-500)',border:'none',borderRadius:'var(--r-sm)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-sm)",letterSpacing:'var(--tracking-label)',textTransform:'uppercase',cursor:prodRows?'pointer':'not-allowed',whiteSpace:'nowrap',alignSelf:'flex-end',transition:'background .15s'}}>⚡ Ejecutar lote</button>
                    {loteSyncErr&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#C53030',alignSelf:'flex-end',marginBottom:9}} title={loteSyncErr}>⚠ sin sincronizar</span>}
                  </div>
                </div>
                </>
              )}
            </div>

            {/* LA HOJA IMPRIMIBLE — bloqueada si la receta no cierra en 100% (balance de masa) */}
            {recipe.length>0&&an&&balanced&&(()=>{
              // Override de humedad por insumo: usa el valor real medido del lote del día
              const prodIngs=effectiveINGS.map(g=>prodMoist[g.id]!=null?{...g,moisture:prodMoist[g.id]}:g);
              const pb=calcBatch(recipe,prodBags||1,prodKg||1.5,prodH||67,spawnCost,prodIngs,an?.dynSpawn);
              const ptr=calcTreatment(an, sKey, SPP);
              const psch=calcSchedule(sKey,prodDate,an?.eb);
              const spn=an?.dynSpawn||ptr?.spawn||8;
              if(!pb) return null;
              // ── Redondeo a resolución real de báscula + recálculo del C:N efectivo ──
              const resG=prodScaleG||0.1;
              const roundG=x=>Math.round(x/resG)*resG;
              const rows=recipe.map(r=>{
                const g=prodIngs.find(x=>x.id===r.id);
                const it=g?pb.items.find(x=>x.name===g.name):null;
                const krTeo=it?it.kr:0;
                const grR=roundG(krTeo*1000);                 // gramos redondeados a báscula
                const m=g?Math.min(0.92,Math.max(0,(g.moisture||0)/100)):0;
                const masaSecaR=(grR/1000)*(1-m);             // masa seca real tras redondeo
                return{g,r,krTeo,grR,m,masaSecaR};
              });
              const dryR=rows.reduce((s,x)=>s+x.masaSecaR,0);
              const kgComR=rows.reduce((s,x)=>s+x.grR/1000,0);
              const recipeR=rows.filter(x=>x.g).map(x=>({id:x.g.id,p:dryR>0?(x.masaSecaR/dryR*100):0}));
              const anR=analyze(recipeR,sKey,effectiveINGS)||an;
              const hFr=Math.min(0.85,Math.max(0.40,(prodH||67)/100));
              const aguaTotR=dryR*(hFr/(1-hFr));
              const aguaInhR=rows.reduce((s,x)=>s+(x.grR/1000)*x.m,0);
              const aguaR=Math.max(0,aguaTotR-aguaInhR);
              const cnDrift=Math.abs(anR.cn-an.cn);
              const trSteps={
                autoclave:`Esterilizar en autoclave a ${ptr?.temp||'121°C/18.5–19 PSI'} durante ${ptr?.time||'90–120 min'}. Purgar aire al inicio. A 2.600 msnm, 15 PSI no alcanza 121°C real — usar 18.5–19 PSI manométricos o sensor de núcleo.`,
                thermal:`Pasteurizar sosteniendo el núcleo del sustrato a 65–75°C por ${ptr?.time||'6–8 h'} (factor +25% por altitud, agua ~91°C a 2.580 msnm). Medir el centro de la masa con termómetro de pincho, no solo el agua.`,
                cwlp:`Inmersión en cal hidratada (150–200 g/100 L, pH≥12) por ${ptr?.time||'18–24 h'}. No requiere calor.`,
              };
              const steps=[
                `Pesar los ingredientes según la tabla (báscula ${resG} g · total seco ${dryR.toFixed(2)} kg). Verificar cada peso.`,
                `Mezclar en seco hasta color y textura homogéneos.`,
                `Hidratar: añadir ${aguaR.toFixed(2)} L de agua limpia. Humedad objetivo ${prodH}%. Prueba de puño: al apretar caen 1–2 gotas.`,
                trSteps[ptr?.col]||'Aplicar tratamiento térmico/químico recomendado.',
                `Escurrir y enfriar a <25°C (mín. 4–6 h) en superficie limpia tapada.`,
                `Inocular spawn ${spn}% (${pb.spawn.toFixed(2)} kg) con manos/superficies desinfectadas (alcohol 70%). ${ptr?.col==='autoclave'?'Usar flujo laminar o caja SAB.':''}`,
                `Embolsar ${prodBags} bolsas × ${prodKg} kg. Cerrar con filtro. Rotular lote y fecha (${prodDate}).`,
                `Incubar en oscuridad${an.sp?.temp_fruit?` · fructificación ${an.sp.temp_fruit}`:''}. Seguir cronograma de abajo.`,
              ];
              const fechas=psch?psch.evts.filter(e=>['in','c1','pr','f1'].includes(e.key)).map(e=>[e.title,`${e.ds} · día ${e.day}`]):[];
              // Progreso del checklist en pantalla — la hoja sigue siendo un documento imprimible
              // de una sola página (uso en campo/papel), así que esto se agrega como ayuda de
              // navegación no impresa en vez de partirla en pasos/wizard.
              const totalChecks=rows.length+steps.length;
              const doneChecks=rows.reduce((s,_,i)=>s+(checkedSteps['ing_'+i]?1:0),0)+steps.reduce((s,_,i)=>s+(checkedSteps['step_'+i]?1:0),0);
              const psSections=[
                {id:'ps-sec-1',l:'1 · Pesado'},
                ...(ptr?[{id:'ps-sec-2',l:'2 · Tratamiento'}]:[]),
                {id:'ps-sec-3',l:'3 · Procedimiento'},
                ...(fechas.length>0?[{id:'ps-sec-4',l:'4 · Fechas'}]:[]),
              ];
              return(
              <div>
                <div className="no-print" style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',padding:'8px 12px',background:'var(--paper-100)',border:'1px solid var(--border-soft)',borderBottom:'none',position:'sticky',top:0,zIndex:'var(--z-sticky-sub)'}}>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',flex:1}}>
                    {psSections.map(s=>(
                      <button key={s.id} onClick={()=>document.getElementById(s.id)?.scrollIntoView({behavior:'smooth',block:'start'})} style={{fontFamily:'var(--font-body)',fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',padding:'6px 10px',background:'var(--paper-50)',color:'var(--ink-700)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-xs)',cursor:'pointer',whiteSpace:'nowrap'}}>{s.l}</button>
                    ))}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                    <div style={{width:70,height:6,background:'var(--paper-300)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{width:`${totalChecks>0?Math.round(doneChecks/totalChecks*100):0}%`,height:'100%',background:doneChecks===totalChecks&&totalChecks>0?'var(--moss-600,var(--accent-olive))':'var(--coral-500)',transition:'width .2s'}}></div>
                    </div>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,color:'var(--ink-700)',whiteSpace:'nowrap'}}>{doneChecks}/{totalChecks} pasos</span>
                  </div>
                </div>
              <div className="panel prod-sheet" style={{padding:'26px 28px'}}>
                {/* Encabezado */}
                <div className="ps-head" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2px solid var(--ink-900,#222)',paddingBottom:12,marginBottom:16}}>
                  <div>
                    <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-500)'}}>Setas de la Peña · Tenjo 2.600 msnm</div>
                    <div style={{fontFamily:'var(--font-num)',fontSize:26,fontWeight:700,color:'var(--ink-900,#222)',lineHeight:1.1,marginTop:2}}>Hoja de Producción</div>
                    <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-base)",color:'var(--ink-900)',marginTop:2}}>{an.sp?.name} · <i>{an.sp?.scientific}</i></div>
                  </div>
                  <div className="ps-head-right" style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-500)'}}>
                    <div>Fecha lote: <b style={{color:'var(--ink-900)'}}>{prodDate}</b></div>
                    <div>{prodBags} bolsas × {prodKg} kg = {pb.wet.toFixed(1)} kg húmedo</div>
                    <div>{(()=>{const bt=BAG_TYPES.find(b=>b.id===prodBagType);return bt?<span>{bt.icon} {bt.name.split('·')[0].trim()} · {bt.dim}</span>:null;})()}</div>
                    <div style={{fontWeight:700,color:'var(--ink-900)'}}>{'N.\u00ba '+(prodLoteNum||'___________')}</div>
                  </div>
                </div>
                {/* KPIs */}
                <div className="ps-kpi" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:1,background:'var(--border-soft)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-xs)',overflow:'hidden',marginBottom:20}}>
                  {[
                    ['C:N',an.cn.toFixed(1)+':1','relaci\u00f3n'],
                    ['Nitr\u00f3geno',an.avgN.toFixed(2)+'%','total'],
                    ['Ef. biol\u00f3gica',(an.ebLow??an.eb.toFixed(0))+'\u2013'+(an.ebHigh??an.eb.toFixed(0))+'%','estimada'],
                    ['Score',opt.score+'/100','perito'],
                    ['Costo/kg','$'+Math.round(an.cost).toLocaleString('es-CO'),'estimado'],
                  ].map(([l,v,s])=>(
                    <div key={l} style={{background:'var(--paper-50)',padding:'10px 6px',textAlign:'center'}}>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',marginBottom:3}}>{l}</div>
                      <div style={{fontFamily:'var(--font-num)',fontSize:20,color:'var(--ink-900)',lineHeight:1,marginBottom:2}}>{v}</div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-2xs)",color:'var(--ink-400)'}}>{s}</div>
                    </div>
                  ))}
                </div>
                {/* Tabla de pesado — kg comerciales reales (báscula) por balance de masas */}
                <div id="ps-sec-1" style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:8,scrollMarginTop:52}}>
                  <span style={{fontFamily:'var(--font-num)',fontSize:22,color:'var(--coral-500)',lineHeight:1,flexShrink:0}}>1</span>
                  <div>
                    <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)'}}>Pesado de ingredientes</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginTop:1}}>báscula · res. {resG} g</div>
                  </div>
                </div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginBottom:8}}>Masa seca requerida: <b style={{color:'var(--ink-900)'}}>{dryR.toFixed(2)} kg</b> = {pb.wet.toFixed(1)} kg húmedo × (1 − {prodH}%). Gramos redondeados a la báscula ({resG} g). Edita la columna <b style={{color:'var(--ink-900)'}}>H₂O%</b> con la humedad real del insumo del día.</div>
                <div className="ps-tbl-wrap">
                <table className="prod-tbl" style={{marginBottom:8}}>
                  <thead><tr><th>Ingrediente</th><th style={{textAlign:'right'}}>%</th><th style={{textAlign:'center',width:62}}>H₂O%</th><th style={{textAlign:'right'}}>Gramos</th><th style={{textAlign:'right'}}>Kg</th><th style={{textAlign:'right'}}>Seco kg</th><th style={{textAlign:'center',width:46}}>Hecho</th></tr></thead>
                  <tbody>
                    {rows.map((x,i)=>{const id=x.r.id;const baseM=x.g?x.g.moisture:0;const ov=prodMoist[id]!=null;return(
                      <tr key={i}>
                        <td>{x.g?x.g.name:id}{ov?<span style={{color:'var(--coral-500)',fontSize:"var(--text-xs)"}}> · ajustado</span>:null}</td>
                        <td className="num">{parseFloat(x.r.p).toFixed(1)}</td>
                        <td style={{textAlign:'center'}}>
                          <input type="number" min="0" max="92" step="1" value={prodMoist[id]!=null?prodMoist[id]:baseM}
                            onChange={e=>{const v=e.target.value;setProdMoist(prev=>{const n={...prev};if(v==='')delete n[id];else n[id]=Math.min(92,Math.max(0,parseFloat(v)||0));return n;});}}
                            style={{width:44,padding:'2px 4px',textAlign:'center',border:`1px solid ${ov?'var(--coral-500)':'var(--paper-300)'}`,borderRadius:3,fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",background:ov?'var(--coral-50,#FCEEE9)':'var(--paper-0)'}}/>
                        </td>
                        <td className="num">{Math.round(x.grR).toLocaleString()}</td>
                        <td className="num">{x.grR>=500?(x.grR/1000).toFixed(2):'—'}</td>
                        <td className="num" style={{color:'var(--ink-500)'}}>{x.masaSecaR.toFixed(2)}</td>
                        <td style={{textAlign:'center'}}><input type="checkbox" checked={!!checkedSteps['ing_'+i]} onChange={e=>setCheckedSteps(prev=>({...prev,['ing_'+i]:e.target.checked}))} style={{accentColor:'var(--coral-500)',width:14,height:14,cursor:'pointer'}}/></td>
                      </tr>
                    );})}
                    <tr className="tot"><td>Total a pesar (húmedo comercial)</td><td className="num">100</td><td></td><td className="num">{Math.round(kgComR*1000).toLocaleString()}</td><td className="num">{kgComR.toFixed(2)}</td><td className="num">{dryR.toFixed(2)}</td><td></td></tr>
                  </tbody>
                </table>
                </div>
                {/* C:N efectivo tras redondeo / humedad real */}
                <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:cnDrift>0.5?'var(--coral-600,#B5451F)':'var(--ink-500)',marginBottom:16,padding:'5px 9px',background:cnDrift>0.5?'var(--coral-50,#FCEEE9)':'var(--paper-50)',border:`1px solid ${cnDrift>0.5?'var(--coral-300,#E8B4A0)':'var(--paper-300)'}`}}>
                  C:N teórico {an.cn.toFixed(1)} → <b style={{color:'var(--ink-900)'}}>efectivo {anR.cn.toFixed(1)}</b> · N {anR.avgN.toFixed(2)}% · EB ~{anR.eb.toFixed(0)}%{cnDrift>0.5?' · ⚠ el redondeo desvía el C:N: considera un lote más grande':' · desvío despreciable a esta resolución'}
                </div>
                {/* Agua / spawn / húmedo */}
                <div className="ps-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:18}}>
                  {[
                    ['Agua neta a inyectar',`${aguaR.toFixed(2)} L`,`req. ${aguaTotR.toFixed(1)} L − ${aguaInhR.toFixed(1)} L ya en insumos`],
                    [`Spawn (${spn}%)`,`${pb.spawn.toFixed(2)} kg`,'micelio en grano · 8% del húmedo'],
                    ['Sustrato húmedo final',`${pb.wet.toFixed(1)} kg`,`${prodBags} bolsas × ${prodKg} kg · ${prodH}% H₂O`],
                  ].map(([l,v,s])=>(
                    <div key={l} style={{border:'1px solid var(--paper-300)',padding:'10px 12px',background:'var(--paper-50)'}}>
                      <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-label)',textTransform:'uppercase',color:'var(--ink-700)',marginBottom:3,fontWeight:700}}>{l}</div>
                      <div style={{fontFamily:'var(--font-num)',fontSize:20,fontWeight:600,color:'var(--ink-900,#222)'}}>{v}</div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-600)',marginTop:1,fontWeight:500}}>{s}</div>
                    </div>
                  ))}
                </div>
                {/* Tratamiento */}
                {ptr&&(
                  <div id="ps-sec-2" style={{border:'1px solid var(--paper-300)',padding:'10px 14px',marginBottom:18,background:'var(--paper-50)',scrollMarginTop:52}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:6}}>
                      <span style={{fontFamily:'var(--font-num)',fontSize:20,color:'var(--coral-500)',lineHeight:1,flexShrink:0}}>2</span>
                      <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)'}}>Tratamiento — {ptr.name}</span>
                    </div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-900)'}}>{ptr.temp} · {ptr.time} · Spawn {ptr.spawn}%</div>
                    {ptr.reasons?.length>0&&<div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginTop:4}}>{ptr.reasons.join(' · ')}</div>}
                  </div>
                )}
                {/* Pasos */}
                <div id="ps-sec-3" style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:8,scrollMarginTop:52}}>
                  <span style={{fontFamily:'var(--font-num)',fontSize:22,color:'var(--coral-500)',lineHeight:1,flexShrink:0}}>3</span>
                  <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)'}}>Procedimiento</span>
                </div>
                <div style={{marginBottom:18}}>
                  {steps.map((t,i)=>(
                    <div key={i} className="prod-step" style={{opacity:checkedSteps['step_'+i]?0.4:1,transition:'opacity .2s'}}>
                      <input type="checkbox" checked={!!checkedSteps['step_'+i]} onChange={e=>setCheckedSteps(prev=>({...prev,['step_'+i]:e.target.checked}))} style={{accentColor:'var(--coral-500)',width:14,height:14,cursor:'pointer',flexShrink:0,marginTop:3}}/>
                      <div className="prod-step-n">{i+1}</div>
                      <div className="prod-step-t" style={{textDecoration:checkedSteps['step_'+i]?'line-through':'none'}}>{t}</div>
                    </div>
                  ))}
                </div>
                {/* Fechas */}
                {fechas.length>0&&(
                  <div id="ps-sec-4" style={{scrollMarginTop:52}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:8}}>
                      <span style={{fontFamily:'var(--font-num)',fontSize:22,color:'var(--coral-500)',lineHeight:1,flexShrink:0}}>4</span>
                      <div>
                        <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-900)'}}>Fechas clave</div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginTop:1}}>estimadas · EB {an.eb.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="ps-fechas-wrap"><div className="ps-fechas" style={{display:'grid',gridTemplateColumns:`repeat(${fechas.length},1fr)`,gap:1,background:'var(--paper-300)',border:'1px solid var(--paper-300)'}}>
                      {fechas.map(([l,v])=>(
                        <div key={l} style={{background:'var(--paper-0)',padding:'8px 6px',textAlign:'center'}}>
                          <div style={{fontFamily:'var(--font-body)',fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-label)',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:2}}>{l}</div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-900,#222)'}}>{v}</div>
                        </div>
                      ))}
                    </div></div>
                  </div>
                )}
                <div style={{marginTop:20,paddingTop:14,borderTop:'2px solid var(--ink-900)'}}>
                  <div className="ps-sig" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginBottom:18}}>
                    {[['Operario'],['Hora inicio'],['Verificado por']].map(([l])=>(
                      <div key={l}>
                        <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',marginBottom:6}}>{l}</div>
                        <div style={{borderBottom:'1px solid var(--ink-600)',height:26}}></div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-700)',marginBottom:6}}>Observaciones del lote</div>
                    <div style={{borderBottom:'1px solid var(--paper-400)',height:22,marginBottom:10}}></div>
                    <div style={{borderBottom:'1px solid var(--paper-400)',height:22}}></div>
                  </div>
                  <div style={{marginTop:14,fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-400)',textAlign:'right',letterSpacing:'var(--tracking-label)'}}>Setas de la Pe\u00f1a · Tenjo 2.600 msnm · simulador v9.1</div>
                </div>
              </div>
              </div>
              );
            })()}
          </div>
        )}

        {tab==='inventario'&&BodegaSection()}

        {tab==='dashboard'&&(
          <div>
            <div className="panel">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
                <span style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-2xs)",letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--ink-400)'}}>{saved.length} receta{saved.length!==1?'s':''}</span>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {['all',...Object.keys(SPP)].map(k=>(
                    <button key={k} className={`cat${dashFilter===k?' on':''}`} onClick={()=>setDashFilter(k)}>
                      {k==='all'?'Todas':SPP[k]?.name}
                    </button>
                  ))}
                </div>
              </div>
              {saved.length===0
                ?<div className="rec-empty">No hay recetas guardadas.<br/>Crea y guarda desde el Formulador.</div>
                :(()=>{
                  const filtered=saved.filter(e=>dashFilter==='all'||e.sKey===dashFilter);
                  if(!filtered.length) return <div className="sempty">Sin recetas para esta especie.</div>;
                  const sorted=[...filtered].sort((a,b)=>(parseFloat(b.eb)||0)-(parseFloat(a.eb)||0));
                  return(
                    <div className="dash-grid">
                      {sorted.map(e=>{
                        const s2=SPP[e.sKey];
                        const band=BANDS[e.sKey]||'var(--ink-700)';
                        const eb=parseFloat(e.eb)||0;
                        const sc=liveScoreFor(e);
                        // Costo ingredientes + tratamiento: guardado, o recalculado al vuelo con el mismo motor (analyze/calcTreatment) para recetas antiguas
                        const needsA2=!(e.cost>0)||e.energyCopKg==null;
                        const a2=needsA2?analyze(e.recipe,e.sKey,effectiveINGS):null;
                        const costIngKg=e.cost>0?e.cost:(a2?Math.round(a2.cost):0);
                        // Costo energético: guardado (recetas nuevas) o derivado del tratamiento real de la receta (recetas antiguas)
                        const eDash=e.energyCopKg!=null?e.energyCopKg:(()=>{
                          const tr2=a2?calcTreatment(a2, e.sKey, SPP):null;
                          const col=tr2?.col||(['shiitake','lions_mane','reishi','nameko'].includes(e.sKey)?'autoclave':'thermal');
                          return energyCostPerKgSeco(col,e.sKey);
                        })();
                        const costKg=costIngKg+eDash;
                        const hFactor=e.sKey==='shiitake'||e.sKey==='lions_mane'||e.sKey==='reishi'?0.40:0.35;
                        return(
                          <div key={e.id} data-recipe-id={e.id} className="dash-card" style={{borderTopColor:band}}>
                            <div className="dash-card-top">
                              <div className="dash-card-name">{e.name}</div>
                              <div className="dash-card-spp">{s2?.name} · {e.date}</div>
                            </div>
                            <div className="dash-card-body">
                              <div className="dash-kv">
                                <span className="dk">EB estimada</span>
                                <span className="dv" style={{color:eb>=100?'var(--moss-500)':eb>=80?'var(--ochre-500,#A07828)':'var(--coral-500)'}}>{e.eb}%</span>
                              </div>
                              {sc>0&&<div className="dash-kv">
                                <span className="dk">Score</span>
                                <span className="dv" style={{color:sc>=80?'var(--moss-500)':sc>=60?'var(--ochre-500,#A07828)':'var(--coral-500)'}}>{sc}<span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",color:'var(--border-soft)'}}>/100</span></span>
                              </div>}
                              <div className="dash-kv">
                                <span className="dk">C:N</span>
                                <span className="dv">{e.cn}:1</span>
                              </div>
                              <div className="dash-kv">
                                <span className="dk">Ingredientes</span>
                                <span className="dv">{e.recipe.length}</span>
                              </div>
                              {costKg>0&&(
                                <div className="dash-kv">
                                  <span className="dk">Costo total/kg</span>
                                  <span className="dv" style={{color:'var(--ink-900)',fontFamily:'var(--font-num)',fontSize:"var(--text-base)"}} title={`Ingredientes: $${costIngKg.toLocaleString('es-CO')} + Energía proceso: $${eDash.toLocaleString('es-CO')}`}>${costKg.toLocaleString('es-CO')} COP{eDash>0&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginLeft:4}}>⚡+${eDash.toLocaleString()}</span>}</span>
                                </div>
                              )}
                            </div>
                            {costKg>0&&(
                              <div style={{display:'flex',gap:0,borderTop:'1px solid var(--paper-300)'}}>
                                {[{nom:'20×50',kgH:1.8},{nom:'18×35',kgH:1.0},{nom:'Punch',kgH:3.5}].map(b=>(
                                  <div key={b.nom} style={{flex:1,padding:'4px 6px',borderRight:'1px solid var(--paper-300)',textAlign:'center',background:'var(--paper-50)'}}>
                                    <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-micro)",color:'var(--ink-500)',marginBottom:1}}>{b.nom}</div>
                                    <div style={{fontFamily:'var(--font-num)',fontSize:"var(--text-sm)",color:'var(--ink-900)',fontWeight:700}}>${Math.round(costKg*b.kgH*hFactor).toLocaleString('es-CO')}</div>
                                    <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-micro)",color:'var(--ink-500)'}}>COP/bolsa</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{padding:'4px 16px 10px',background:'var(--paper-50)'}}>
                              <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                                {e.recipe.slice(0,4).map(r=>{const g=INGS.find(i=>i.id===r.id);return g?<span key={r.id} style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",padding:'1px 5px',background:'var(--paper-100)',border:'1px solid var(--paper-300)',color:'var(--ink-500)'}}>{g.name.length>15?g.name.slice(0,15)+'…':g.name} {r.p}%</span>:null;})}
                                {e.recipe.length>4&&<span style={{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:'var(--border-soft)',padding:'1px 3px'}}>+{e.recipe.length-4} más</span>}
                              </div>
                            </div>
                            <div className="dash-card-foot">
                              <button className="dash-sload" style={{flex:1}} onClick={()=>{loadR(e);}}>Cargar</button>
                              <button className="dash-sdel" onClick={()=>requireAdmin(delR)(e.id)}>✕</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              }
            </div>
          </div>
        
        )}

        {tab==='bitacora'&&BitacoraSection()}

        {confirmDlg&&<ConfirmModal dlg={confirmDlg} onClose={()=>setConfirmDlg(null)}/>}
        {promptDlg&&<PromptModal dlg={promptDlg} onClose={()=>setPromptDlg(null)}/>}
        {noticeDlg&&<NoticeModal dlg={noticeDlg} onClose={()=>setNoticeDlg(null)}/>}

        {/* MODAL EJECUTAR LOTE */}
        {loteBatchConfirm&&(
          <div className="inv-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setLoteBatchConfirm(null);}}>
            <div className="inv-modal" role="dialog" aria-modal="true" aria-label="Ejecutar lote" style={{width:520,maxWidth:'calc(100vw - 32px)'}}>
              <div className="inv-modal-title">⚡ Ejecutar lote — confirmar descuento de inventario</div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--ink-700)',marginBottom:14}}>Lote <b style={{color:'var(--ink-900)'}}>{loteBatchConfirm.loteNum||'—'}</b> · {loteBatchConfirm.fecha} — se descontarán los kg comerciales (FIFO, del lote más antiguo al más nuevo).</div>
              <table style={{width:'100%',borderCollapse:'collapse',fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",marginBottom:12}}>
                <thead><tr>{['Ingrediente','Requerido kg','Stock kg',''].map(h=>(<th key={h} style={{textAlign:h==='Requerido kg'||h==='Stock kg'?'right':'left',fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',color:'var(--ink-800)',borderBottom:'1.5px solid var(--ink-900)',padding:'6px 8px'}}>{h}</th>))}</tr></thead>
                <tbody>
                  {loteBatchConfirm.preview.map(row=>(
                    <tr key={row.id} style={{background:row.ok?'transparent':'color-mix(in oklab,var(--coral-200) 30%,var(--paper-50))'}}>
                      <td style={{padding:'6px 8px',borderBottom:'1px solid var(--paper-300)',color:'var(--ink-900)'}}>{row.name}</td>
                      <td style={{padding:'6px 8px',borderBottom:'1px solid var(--paper-300)',textAlign:'right',fontVariantNumeric:'tabular-nums'}}>{row.krKg.toFixed(3)}</td>
                      <td style={{padding:'6px 8px',borderBottom:'1px solid var(--paper-300)',textAlign:'right',color:row.ok?'var(--moss-700)':'var(--coral-700)',fontVariantNumeric:'tabular-nums'}}>{row.stockActual.toFixed(3)}</td>
                      <td style={{padding:'6px 8px',borderBottom:'1px solid var(--paper-300)',textAlign:'center',fontSize:"var(--text-base)"}}>{row.ok?'✓':'⚠'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loteBatchConfirm.preview.some(r=>!r.ok)&&<div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--coral-700)',background:'color-mix(in oklab,var(--coral-100) 60%,var(--paper-50))',border:'1px solid var(--coral-200)',borderRadius:4,padding:'8px 12px',marginBottom:12}}>⚠ Uno o más ingredientes no tienen stock suficiente — se descontará lo disponible y el faltante quedará a 0.</div>}
              <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:4}}>
                <button onClick={()=>setLoteBatchConfirm(null)} className="inv-btn inv-btn-sec">Cancelar</button>
                <button onClick={confirmarEjecucion} className="inv-btn inv-btn-pri">Confirmar y descontar</button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL NUEVA PRUEBA EXPERIMENTAL */}
        {showBitNuevo&&(
          <div className="inv-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setShowBitNuevo(false);}}>
            <div className="inv-modal" role="dialog" aria-modal="true" aria-label="Nueva prueba experimental" style={{width:560,maxWidth:'calc(100vw - 32px)',maxHeight:'calc(100vh - 100px)',overflowY:'auto'}}>
              <div className="inv-modal-title">Nueva prueba experimental</div>
              <div className="inv-row inv-row-2" style={{marginBottom:12}}>
                <div><label className="inv-label" htmlFor="bit-codigo">Código de lote</label><input id="bit-codigo" name="codigoLote" autoComplete="off" className="inv-input" value={bitNuevoForm.codigo||''} onChange={e=>setBitNuevoForm(p=>({...p,codigo:e.target.value}))}/></div>
                <div><label className="inv-label" htmlFor="bit-especie">Especie</label><input id="bit-especie" name="especie" autoComplete="off" className="inv-input" value={bitNuevoForm.especie||''} onChange={e=>setBitNuevoForm(p=>({...p,especie:e.target.value}))}/></div>
              </div>
              <div className="inv-row inv-row-2" style={{marginBottom:12}}>
                <div><label className="inv-label" htmlFor="bit-cepa">Cepa / proveedor</label><input id="bit-cepa" name="cepaProveedor" autoComplete="off" className="inv-input" placeholder="Ej. Spawn proveedor X…" value={bitNuevoForm.cepa||''} onChange={e=>setBitNuevoForm(p=>({...p,cepa:e.target.value}))}/></div>
                <div><label className="inv-label" htmlFor="bit-operador">Operador</label><input id="bit-operador" name="operador" autoComplete="off" className="inv-input" value={bitNuevoForm.operador||''} onChange={e=>setBitNuevoForm(p=>({...p,operador:e.target.value}))}/></div>
              </div>
              <div className="inv-row inv-row-2" style={{marginBottom:12}}>
                <div><label className="inv-label" htmlFor="bit-fecha-mezcla">Fecha mezcla</label><input id="bit-fecha-mezcla" name="fechaMezcla" type="date" className="inv-input" value={bitNuevoForm.fechaMezcla||''} onChange={e=>setBitNuevoForm(p=>({...p,fechaMezcla:e.target.value}))}/></div>
                <div><label className="inv-label" htmlFor="bit-fecha-inoculacion">Fecha inoculación</label><input id="bit-fecha-inoculacion" name="fechaInoculacion" type="date" className="inv-input" value={bitNuevoForm.fechaInoculacion||''} onChange={e=>setBitNuevoForm(p=>({...p,fechaInoculacion:e.target.value}))}/></div>
              </div>
              <div className="inv-row inv-row-4" style={{marginBottom:12}}>
                <div><label className="inv-label"># Bolsas</label><input type="number" className="inv-input" min={1} value={bitNuevoForm.numBolsas||6} onChange={e=>setBitNuevoForm(p=>({...p,numBolsas:parseInt(e.target.value)||1}))}/></div>
                <div><label className="inv-label">kg húmedo/bolsa</label><input type="number" className="inv-input" min={0.1} step={0.1} value={bitNuevoForm.pesoHumedo||1.5} onChange={e=>setBitNuevoForm(p=>({...p,pesoHumedo:parseFloat(e.target.value)||0.1}))}/></div>
                <div><label className="inv-label">% spawn</label><input type="number" className="inv-input" min={1} max={30} value={bitNuevoForm.spawnPct||8} onChange={e=>setBitNuevoForm(p=>({...p,spawnPct:parseFloat(e.target.value)||8}))}/></div>
                <div><label className="inv-label">Humedad %</label><input type="number" className="inv-input" min={55} max={80} value={bitNuevoForm.humedad||67} onChange={e=>setBitNuevoForm(p=>({...p,humedad:parseInt(e.target.value)||67}))}/></div>
              </div>
              <div className="inv-row inv-row-2" style={{marginBottom:12}}>
                <div><label className="inv-label">Tratamiento</label><select className="inv-input" value={bitNuevoForm.tratamiento||''} onChange={e=>setBitNuevoForm(p=>({...p,tratamiento:e.target.value}))}><option value="">—</option>{['Pasteurización','Autoclave','Cal hidratada (CWLP)','Sin tratamiento'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="inv-label">Peso seco (kg)</label><input type="number" className="inv-input" step={0.01} value={bitNuevoForm.peseSeco||''} placeholder="auto" onChange={e=>setBitNuevoForm(p=>({...p,peseSeco:parseFloat(e.target.value)||0}))}/></div>
              </div>
              <div style={{marginBottom:12}}><label className="inv-label">Objetivo de la prueba</label><input className="inv-input" placeholder="ej. Comparar humedad 63% vs 66%" value={bitNuevoForm.objetivo||''} onChange={e=>setBitNuevoForm(p=>({...p,objetivo:e.target.value}))}/></div>
              <div style={{marginBottom:16}}><label className="inv-label">Notas</label><textarea className="inv-input" rows={2} value={bitNuevoForm.notas||''} onChange={e=>setBitNuevoForm(p=>({...p,notas:e.target.value}))} style={{resize:'vertical'}}/></div>
              {bitNuevoForm.recipeRef&&(<div style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-sm)",color:'var(--moss-700)',background:'var(--paper-100)',border:'1px solid var(--moss-200)',borderRadius:4,padding:'7px 12px',marginBottom:14}}>Receta vinculada: <b>{bitNuevoForm.recipeRef.name}</b> · C:N {bitNuevoForm.recipeRef.cn} · EB ~{bitNuevoForm.recipeRef.eb}%</div>)}
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button onClick={()=>setShowBitNuevo(false)} className="inv-btn inv-btn-sec">Cancelar</button>
                <button onClick={()=>{if(!bitNuevoForm.codigo?.trim()||!bitNuevoForm.especie?.trim()){setNoticeDlg({msg:'Completa código y especie.'});return;}const newId=crearBitLote(bitNuevoForm);setBitActiveLoteId(newId);goTab('bitacora');goBitTab('bit_bolsas',true);setShowBitNuevo(false);}} className="inv-btn inv-btn-pri">Crear lote y generar bolsas</button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL NUEVA COSECHA */}
        {showBitCosecha&&(
          <div className="inv-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setShowBitCosecha(false);}}>
            <div className="inv-modal" role="dialog" aria-modal="true" aria-label="Registrar cosecha" style={{width:440}}>
              <div className="inv-modal-title">Registrar cosecha</div>
              <div className="inv-row inv-row-2" style={{marginBottom:12}}>
                <div><label className="inv-label">Bolsa</label><select className="inv-input" value={bitCosechaForm.bolsaId||''} onChange={e=>{const b=bitBolsas.find(x=>x.id===e.target.value);setBitCosechaForm(p=>({...p,bolsaId:e.target.value,codigo:b?.codigo||''}));}}><option value="">— seleccionar —</option>{bitBolsas.filter(b=>b.loteId===(bitCosechaForm.loteId||bitActiveLoteId)).map(b=><option key={b.id} value={b.id}>{b.codigo}</option>)}</select></div>
                <div><label className="inv-label">Flush #</label><input type="number" className="inv-input" min={1} value={bitCosechaForm.flush||1} onChange={e=>setBitCosechaForm(p=>({...p,flush:parseInt(e.target.value)||1}))}/></div>
              </div>
              <div className="inv-row inv-row-2" style={{marginBottom:12}}>
                <div><label className="inv-label">Fecha</label><input type="date" className="inv-input" value={bitCosechaForm.fecha||''} onChange={e=>setBitCosechaForm(p=>({...p,fecha:e.target.value}))}/></div>
                <div><label className="inv-label">Peso fresco (g)</label><input type="number" className="inv-input" min={0} step={1} placeholder="430" value={bitCosechaForm.pesoFresco||''} onChange={e=>setBitCosechaForm(p=>({...p,pesoFresco:parseFloat(e.target.value)||''}))}/></div>
              </div>
              <div style={{marginBottom:12}}><span className="inv-label">Calidad</span><div role="group" aria-label="Calidad de la cosecha" style={{display:'flex',gap:6,paddingTop:4}}>{[1,2,3,4,5].map(n=>(<button key={n} aria-label={`${n} de 5 estrellas`} aria-pressed={(bitCosechaForm.calidad||0)===n} onClick={()=>setBitCosechaForm(p=>({...p,calidad:n}))} style={{padding:'6px 12px',border:'1px solid var(--border-soft)',borderRadius:'var(--r-xs)',fontFamily:'var(--font-num)',fontSize:"var(--text-md)",cursor:'pointer',background:(bitCosechaForm.calidad||0)>=n?'var(--ochre-500)':'var(--paper-50)',color:(bitCosechaForm.calidad||0)>=n?'var(--paper-0)':'var(--ink-500)',transition:'background-color .1s,color .1s,border-color .1s'}}>★</button>))}</div></div>
              <div style={{marginBottom:16}}><label className="inv-label">Observaciones</label><input className="inv-input" placeholder="Buen racimo, amarillamiento leve…" value={bitCosechaForm.observaciones||''} onChange={e=>setBitCosechaForm(p=>({...p,observaciones:e.target.value}))}/></div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button onClick={()=>setShowBitCosecha(false)} className="inv-btn inv-btn-sec">Cancelar</button>
                <button onClick={()=>{if(!bitCosechaForm.bolsaId||!bitCosechaForm.pesoFresco){setNoticeDlg({msg:'Selecciona bolsa y peso.'});return;}addBitCosecha({...bitCosechaForm,loteId:bitActiveLoteId||bitCosechaForm.loteId});setShowBitCosecha(false);}} className="inv-btn inv-btn-pri">Guardar cosecha</button>
              </div>
            </div>
          </div>
        )}
        <div style={{height:40}}/>
        
      </div>

      {(RECETA_TABS.includes(tab)||tab==='produccion'||tab==='schedule')&&(<div data-testid="species-bridge" className={'species-bridge'+(bridgeHidden?' bridge-hidden':'')} role="button" tabIndex={0} aria-expanded={bridgeOpen} style={{cursor:'pointer'}} onClick={()=>setBridgeOpen(o=>!o)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setBridgeOpen(o=>!o);}}}>
        <div className="bridge-inner">
          {!hasPickedSpecies?(<>
            <span className="bridge-activo"><span className="bridge-dot">●</span>Sin especie</span>
            <span className="bridge-name">Elige una especie para empezar</span>
            <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <select className="bridge-select" value="" onClick={e=>e.stopPropagation()} onChange={e=>{if(e.target.value)setSKey(e.target.value);}} aria-label="Elegir especie">
                <option value="" disabled>Elegir especie…</option>
                {Object.entries(SPP).map(([k,d])=><option key={k} value={k}>{d.name}</option>)}
              </select>
              <button className="bridge-cambiar" onClick={e=>{e.stopPropagation();goTab('catalogo');}} style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',padding:'6px 12px',background:'var(--accent-terracotta)',color:'#fff',border:'1px solid var(--accent-terracotta)',cursor:'pointer',transition:'background-color .15s,border-color .15s,color .15s,transform .15s',whiteSpace:'nowrap',flexShrink:0}}>
                Ver catálogo
              </button>
            </div>
          </>):(<>
          <span className="bridge-activo"><span className="bridge-dot">●</span>Activo</span>
          <span className="bridge-name">{sp.name}</span>
          {bridgeOpen&&<em className="bridge-sci">{sp.scientific}</em>}
          {bridgeOpen&&(<div style={{display:'flex',gap:24,alignItems:'center',flexShrink:0}} className="bridge-stats-group">
            <div className="bridge-stat"><span className="bridge-stat-lbl">C:N</span><span className="bridge-stat-val">{sp.cn_optimal.ideal} : 1</span></div>
            <div className="bridge-stat"><span className="bridge-stat-lbl">Temp</span><span className="bridge-stat-val">{sp.temp_fruit}</span></div>
            <div className="bridge-stat"><span className="bridge-stat-lbl">CO Base</span><span className="bridge-stat-val">{sp.eb_baseline} %</span></div>
          </div>)}
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <select className="bridge-select" value={sKey} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();setSKey(e.target.value);}} aria-label="Cambiar especie" title="Cambiar especie sin salir del formulador">
              {Object.entries(SPP).map(([k,d])=><option key={k} value={k}>{d.name}</option>)}
            </select>
            {bridgeOpen&&<button className="bridge-cambiar" onClick={e=>{e.stopPropagation();goTab('catalogo');}} style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",letterSpacing:'var(--tracking-button)',textTransform:'uppercase',padding:'6px 12px',background:'var(--accent-terracotta)',color:'#fff',border:'1px solid var(--accent-terracotta)',cursor:'pointer',transition:'background-color .15s,border-color .15s,color .15s,transform .15s',whiteSpace:'nowrap',flexShrink:0}}>
              Ver catálogo
            </button>}
            <span style={{color:'var(--paper-0)',opacity:.6,fontSize:"var(--text-sm)",lineHeight:1,transform:bridgeOpen?'rotate(0deg)':'rotate(180deg)',transition:'transform .15s'}}>▾</span>
          </div>
          </>)}
        </div>
      </div>)}
    </div>
  );
}
window.SimuladorApp = App;


// Sombra izquierda en tiras de scroll horizontal una vez el usuario ha scrolleado
document.addEventListener('scroll',e=>{
  const t=e.target;
  if(t&&t.classList&&(t.classList.contains('cats')||t.classList.contains('presets')||t.classList.contains('sub-tabs')||t.classList.contains('mode-switcher')||t.classList.contains('builder-subtabs'))){
    t.classList.toggle('scrolled',t.scrollLeft>4);
  }
},true);
