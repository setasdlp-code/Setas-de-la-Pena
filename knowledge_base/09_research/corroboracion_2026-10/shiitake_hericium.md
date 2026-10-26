# Fisiología de cultivo: Shiitake (Lentinula edodes) y Melena de León (Hericium erinaceus) — parámetros KB_SPP de Setas OS

Fecha: 2026-10-26. Contexto: Tenjo, ~2.570 m s.n.m., T media 13–14 °C, HR alta.

## 0. Limitaciones del método (leer primero)

- WebFetch y curl fueron bloqueados por la política de egreso del sandbox (doi.org, ohioline.osu.edu, pmc.ncbi.nlm.nih.gov, api.crossref.org, mdpi-res.com devolvieron 403 o ENOTFOUND). No se intentó eludir el bloqueo.
- Por eso NO pude leer textos completos. Toda cifra viene de resúmenes/fragmentos devueltos por WebSearch. Cada referencia lleva su estado: "verificada" = título/autores/revista/año coinciden en resultados de búsqueda; "parcial" = existe la página pero faltan autores o revista.
- Nada se extrapola de libros que no pude abrir (Chang & Miles 2004, Stamets 2000): se citan solo vía la KB del repo o vía fuentes secundarias, y se marca así.
- Las cifras de bloques sintéticos de shiitake con evidencia revisada por pares son escasas; gran parte de la literatura de extensión es de troncos naturales.

## 1. Hallazgos críticos sobre la KB actual (acción recomendada)

1. **Cita "Tabi et al. 2021" posiblemente errónea.** El artículo *The effect of different fruiting temperatures on the yield and nutritional parameters of some wild and hybrid Hericium isolates* (Sci. Hortic. 280, 109915, DOI 10.1016/j.scienta.2021.109915) aparece en las búsquedas con autores **Atila, Tüzel, Pekşen, Cano & Fernández**, no Tabi. Revisar `hericium_erinaceus.md` y `references/high_altitude_microclimate_bibliography_2026-08-05.md`.
2. **Cita "Atila 2019 (paper_024), Sci. Hortic. 254:185–194" no verificada.** No encontré un artículo con ese título en esa revista. Lo más cercano: *The Use of Phenolic-rich Agricultural Wastes for Hericium erinaceus and Lentinula edodes Cultivation* (Atila, 2019, revista turca, vol. 56; revista exacta no verificada), sobre orujo de uva, cáscara de nuez verde, torta de oliva y té en aserrín de roble. Ese resumen no menciona CO2 < 1.200 ppm / 18 ± 2 °C / 85–90 % HR. La KB atribuye esos tres valores a "paper_024"; **hay que comprobarlo contra el PDF original antes de usarlos como fuente**. También existen Atila 2018, Sci. Hortic. 238:246–254 (rendimiento de H. erinaceus con residuos agroindustriales) y Atila 2019, Sci. Hortic. 258 (cambios lignocelulósicos en H. erinaceus), que podrían ser el origen real.
3. Los tres valores de la app que más lejos están de la evidencia: **hr de Hericium [90,97]** (la literatura apoya 85–95 con pico 95 solo en inducción), **fruitT de Hericium [18,24]** (el techo de 24 °C es alto frente a 16–20 °C de los estudios), **co2 de shiitake 1500 ppm** (sin fuente específica de fructificación).

## 2. Tabla resumen

Confianza: A = alta, M = media, B = baja.

| Parámetro | Valor app | Rango propuesto | Setpoint | Confianza | Fuente principal |
|---|---|---|---|---|---|
| Shiitake incT (aire, colonización) | 21–27 °C | 21–25 °C (núcleo del bloque ≤ 28 °C) | 23 °C | M-A | Ohio State F-0041 (72–77 °F); Chang & Miles vía KB; micelio óptimo 25 °C en 6/7 cepas |
| Shiitake maduración/browning | no existe | 22–25 °C, 50–60 d (señales, no calendario) | 23 °C | B-M | Chang & Miles 2004 vía KB (sin verificar directo) |
| Shiitake fruitT (pinning/fructificación) | 10–16 °C | 12–18 °C (cepa media); 8–14 si es cepa fría | 15 °C | M (B si cepa desconocida) | Ohio State F-0041 (55–65 °F); Cornell Small Farms; estudio 13 cepas 15/25 °C |
| Shiitake HR fructificación | 80–90 % | 80–92 % | 85 % (pinning 88–90) | M | Ohio State F-0041 (≥85 %); estudio 13 cepas (80–95 %) |
| Shiitake CO2 fructificación | 1500 ppm | 800–2000 ppm; techo operativo 1500 | ≤1200 ppm | B | Sin umbral específico; Lee 2012 (fase de colonización); analogía con otras especies |
| Hericium incT | 21–24 °C | 21–25 °C | 23 °C | M-A | Imtiaj et al. 2008 (25 °C, 20–30); tabla de proveedor atribuida a Stamets (21–24) |
| Hericium fruitT | 18–24 °C | Inducción 14–18 °C; desarrollo 16–20 °C; techo 22 °C | 18 °C | M | Estudios coreanos de cámara (18–20 °C); Atila et al. 2021 (15/20/25 °C, depende de cepa) |
| Hericium HR | 90–97 % | 85–95 % (95 solo en inducción 5–7 d, luego 85–90) | 92 % → 88 % | M | Estudios coreanos (95 % → 85 %); proveedor/Stamets (85–95) |
| Hericium CO2 | 1000 ppm | 500–1200 ppm | 800–1000 ppm | B-M | Estudios coreanos de cámara (500–1000 ppm); KB (Atila 2019, no verificado) |

## 3. Shiitake (Lentinula edodes)

### 3.1 Qué ya está en la KB (no repetido)
Clases térmicas de cepa (Chang & Miles), 22–25 °C en tronco sintético, Cenicafé (57,6 %), Rocha 2025, Holgado-Rojas 2019, Shi 2026. Aquí solo se añade evidencia nueva o contrastada. Nota: no pude verificar Rocha 2025 ni Shi 2026 (revista y volumen que da la KB); tratar sus cifras como no auditadas.

### 3.2 Incubación (incT)

Evidencia:
- **Tier B, Ohio State Extension, F-0041** (URL abajo): temperatura óptima de crecimiento del spawn en el tronco 72–77 °F (22–25 °C); por encima de 105 °F (~41 °C) es letal generalmente.
- **Tier A (parcial)**: estudio de cepas con crecimiento micelial óptimo a 25 °C en 6 de 7 cepas (agar). Otros trabajos: 25 °C como óptimo en cultivar coreano 'Hwadam' (PDA); un estudio de seis cepas de alta temperatura reporta 20 y 25 °C; un trabajo de 2024 reporta 28 °C y pH 5,5. Todos en agar, no en bloque.
- **Tier B/KB**: Chang & Miles, 22–25 °C para colonización y maduración de troncos sintéticos.

Discrepancias: 25 vs 28 °C. Causa probable: cepa (alta temperatura) y medio (agar vs bloque). En bloque la temperatura real del núcleo supera la del aire por calor metabólico, por lo que un óptimo de agar no se transfiere al setpoint de aire.

Propuesta: rango de aire 21–25 °C, setpoint 23 °C, alarma de núcleo 28 °C (consistente con `incCoreMaxT:28` de la app). El límite de 27 °C de la app para aire deja poco margen sobre el núcleo; recomiendo bajarlo a 25. Confianza media-alta para el rango, media para la alarma de núcleo (apoyada en Shi 2026 vía KB, no verificado por mí).

Tenjo: a 13–14 °C medios la colonización necesita calefacción; las 10–12 °C nocturnas ralentizan el crecimiento (el micelio casi se detiene bajo ~10–12 °C; cifra sin fuente verificada, medir en piloto).

### 3.3 Maduración / browning
Chang & Miles (vía KB): protuberancias a 50–60 d y retiro de bolsa ~60 d, a 22–25 °C. No reuní una fuente verificada sobre HR o luz específicas para browning; **no propongo valores**. Es un vacío de evidencia: registrar en piloto. Para planificar, el ciclo total [90,150] d de la app es compatible con 60–120 d (Cenicafé vía KB) más fructificación.

### 3.4 Choque de inducción
- **Cornell Small Farms, "Forcing Bolts"** (Tier B): cepas de clima frío fructifican naturalmente con más facilidad que las de clima cálido o todo-clima; forzar con remojo/choque da control de calendario a cambio de mano de obra.
- **Ohio State F-0041/F-0042** (Tier B): tras el choque, los primordios aparecen y la manta de fructificación se retira a los 7–10 d. Son troncos naturales.
- **Mushroom Research (ICAR) 2022**, ensayo de choque con agua helada en troncos sintéticos con sustratos locales (Tier A parcial; autores no verificados, URL abajo).
- KB: remojo 2–4 h a 12 °C (Cenicafé) o 12–24 h en sistemas tradicionales.

Propuesta: para cepa media, remojo en agua limpia 12 °C, 2–4 h, y medir masa antes/después; ya está en KB. No hay evidencia que justifique un ΔT numérico universal. Confianza baja-media.

### 3.5 Fructificación: temperatura (fruitT)

Evidencia:
- Ohio State F-0041: pinning óptimo 55–65 °F (13–18 °C), HR ≥ 85 %, humedad del tronco 35–60 %. Troncos naturales.
- Estudio de 13 cepas (core.ac.uk/works/25006519; autores no verificados): el régimen 15 °C × 8 h / 25 °C × 16 h con HR 80–95 % dio la mayor EB en 11 de 13 cepas; EB de 7,1–32,7 % (L38) y 7,2–35,5 % (L300). La densidad de micelio en la fase de spawn-run no correlacionó con rendimiento. Cepas de alta temperatura/mixtas.
- Estudio coreano de naves (AGRIS): periodos de fructificación con temperaturas medias de unos 8–23 °C; verano sin fructificación.
- Proveedor (Tier C, mycoboutique): 16–20 °C.
- Chang & Miles vía KB: baja <10, media 10–20, alta >20 °C.

Discrepancias: 10–16 °C (app) vs 13–18 (Ohio) vs 16–20 (proveedor) vs régimen fluctuante con 25 °C (13 cepas). Causa: clase térmica de la cepa. El rango de la app corresponde a cepas bajas-medias.

Propuesta: 12–18 °C, setpoint 15 °C para cepa media. Si la cepa es de baja temperatura, 8–14 °C. Confianza media si se conoce la cepa, baja si no. **Condicionar el rango a la clase de cepa en el registro del spawn.**

Tenjo: T media 13–14 °C cae dentro de la banda. Ventaja: se fructifica sin refrigeración con cepa media/fría. Riesgo: noches <5 °C (Holgado-Rojas 2019 vía KB). Con cepa de alta temperatura habría que calentar.

### 3.6 Fructificación: HR
Ohio ≥ 85 %; 13 cepas 80–95 %; texto indio (NIOS, Tier B-C) 85–95 %. Propuesta: rango 80–92 %, setpoint 85 % (88–90 % los primeros días del pinning), evitar agua libre sobre sombreros. Confianza media. El techo de 90 % de la app es algo bajo respecto a 95 % de varias fuentes; subir a 92 %.

### 3.7 CO2 en fructificación (1500 ppm)
- No encontré ningún estudio de *L. edodes* con umbral de CO2 para sombrero/estípite.
- **Lee et al. 2012, Mycobiology 40(3):164–167** (Tier A, verificada): en bolsas de aserrín (cepa 921) el CO2 interno fue 3,8 ± 1,3 % con tapón de algodón y 6,0 ± 1,6 % con orificio de 15 mm; el crecimiento hifal no difirió entre tamaños de orificio. Es fase de colonización dentro de la bolsa; no se transfiere al aire de la sala.
- Revisiones (resultados de búsqueda, sin título verificado) afirman que alto CO2 suprime la diferenciación del píleo y que la inducción en *L. edodes* se dispara con frío. En otras especies (Flammulina, Ganoderma, Pleurotus) el CO2 alto reduce el diámetro del píleo y alarga el estípite.

Propuesta: mantener 1500 ppm como techo de alarma, con setpoint ≤ 1200 ppm. Es una decisión de ingeniería, no un hallazgo; confianza **baja**. Experimento: dos bandas (≤1000 vs ~2000 ppm) con una cepa.

Nota Tenjo/altitud: ppm es fracción molar; el SCD30 necesita compensación por presión (≈74 kPa). La presión parcial de O2 (~15,5 kPa frente a ~21 kPa al nivel del mar) no tiene estudios en estas especies que yo haya encontrado; no hay evidencia de efecto. El factor de caudal 1,37 está en la KB.

### 3.8 be y cycle de la app
- be [40,70] %: Cenicafé 57,6 % (vía KB, definición propia); el estudio de 13 cepas reporta EB de 7–35 % en su régimen. El rango de la app es optimista para cepa y sustrato no probados. Propuesta de planificación: 30–60 % hasta tener datos propios. Confianza baja.
- cycle [90,150] d: compatible con Chang & Miles + fructificación; confianza media.

## 4. Melena de león (Hericium erinaceus)

### 4.1 Incubación (incT)
- **Imtiaj et al. 2008, Mycobiology 36(2):88–** (DOI 10.4489/MYCO.2008.36.2.088; Tier A, verificada por búsqueda): cuatro cepas, crecimiento óptimo a 25 °C, crecimiento entre 20 y 30 °C; pH óptimo 6 con variación entre cepas. Otros estudios (Vietnam, India) coinciden en 25 °C.
- Tabla de proveedor atribuida a Stamets (Tier C, lamycosphere): incubación 21–24 °C, 10–14 d.

Propuesta: 21–25 °C, setpoint 23 °C (en agar el óptimo es 25; en bloque, el calor metabólico lleva a bajar el aire). Confianza media-alta. El rango de la app (21–24) es defendible.

### 4.2 Fructificación: temperatura
- **Atila, Tüzel, Pekşen, Cano & Fernández 2021, Sci. Hortic. 280, 109915** (Tier A, verificada): aislamientos silvestres e híbridos a 15, 20 y 25 °C. Algunos *H. erinaceus* (He-Denizli, He-Erkel), *H. americanum* y *H. coralloides* formaron primordios y cuerpos a 25 °C; otros requirieron temperaturas menores. Proteína y cenizas bajaron a 25 °C. Respuesta fuertemente dependiente del aislamiento. El resumen señala que >20 °C limita el cultivo en zonas cálidas.
- Estudios coreanos de cámara (earticle A289456 / A280989; autores y revista no verificados, Tier A parcial): 18–20 °C, HR 85–95 %, CO2 500–1000 ppm, primordios en 6–12 d, 110–260 g por bolsa; otro con 16–18 °C y 500 ppm; otro con cámara a 18 °C, 1000 ppm y 95 % de HR para primordios, luego 85 % de HR.
- Artículo tailandés (Springer, doi prefijo 10.1007/s11557-022-01829-6; título no verificado) cita Stamets: primordios a 10–15,6 °C durante 3–5 d y desarrollo a 18–24 °C durante 4–5 d.
- Una revisión de ~40 especies (origen no verificado) clasifica a *H. erinaceus* como especie de baja temperatura, máximo ≤24 °C y óptimo <20 °C.
- Proveedor (Tier C): inicio 10–16 °C con HR 95–100 %, fructificación 12–25 °C, 85–95 %.

Discrepancias: 15–25 °C. Causa: aislamiento (cepas de clima cálido existen) y fase (inducción más fría que el desarrollo).

Propuesta por fase: inducción 14–18 °C; desarrollo 16–20 °C; setpoint 18 °C; techo 22 °C salvo cepa documentada de alta temperatura. Confianza media. El rango de la app (18–24) desplaza el techo demasiado arriba; bajarlo a 16–22.

Tenjo: favorable. T media 13–14 °C permite 16–20 °C con poca energía; el riesgo es el piso nocturno y la condensación.

### 4.3 HR
Estudios coreanos: >85–95 % y 95 % → 85 %; proveedor 85–95 %. La KB con Atila 2019 (no verificado): 85–90 %. La app usa 90–97 %, que es el rango más húmedo de todos; con agua libre aumentan la bacteriosis y la condensación. Propuesta: 85–95 %, inducción a 92–95 % durante 5–7 d y después 85–90 %. Confianza media.

### 4.4 CO2
Estudios coreanos: 500–1000 ppm. Guías de cultivadores (Tier C): ventilación insuficiente produce cuerpos deformes o atrofiados. Ojo: las espinas largas (>1 cm) son rasgo normal de la especie, no señal de CO2 alto. El techo "<1000 ppm" de la app coincide con los estudios coreanos, pero **no es un umbral universal** (coherente con la KB). Propuesta: objetivo 800–1000 ppm, alarma 1200 ppm. Confianza baja-media (diseños sin replicación comparativa de CO2 vista por mí).

### 4.5 be y cycle
No auditados aquí. be [80,120] % es una cifra de rendimiento citada en prácticas comerciales; el estudio coreano reporta 110–260 g por bolsa (masa de bolsa no verificada, no convertible a BE). Sin fuente, tratar como hipótesis (confianza baja).

## 5. Implicaciones para Tenjo (2.570 m)

1. **Temperatura**: un clima fresco favorece cepas medias/frías de shiitake y a Hericium (especie de baja temperatura). Hacia 15–18 °C se llega con poco o ningún enfriamiento; la inversión va a calefacción de incubación y aislamiento.
2. **Presión y O2**: P ≈ 73,8 kPa; p(O2) ≈ 15,5 kPa. No encontré estudios del efecto de esta p(O2) en estas dos especies: dejarlo como pregunta abierta. El efecto práctico sí documentado es físico: ~1,37× más caudal volumétrico para la misma masa de CO2 (KB).
3. **Sensores**: compensar el SCD30 por presión; el CO2 en ppm no cambia por la altitud, pero la lectura sin compensar sí.
4. **Condensación**: noches frías + HR alta → punto de rocío cercano a la temperatura de pared; Hericium lo penaliza más.

## 6. Experimentos propuestos (piloto)

1. Shiitake: una cepa de clase térmica conocida; comparar setpoint 13 vs 16 °C en fructificación, con HR 85 % constante; registrar BE sobre masa seca.
2. Shiitake: dos bandas de CO2 (≤1000 vs ~2000 ppm) con T/HR fijos; medir diámetro de píleo y longitud de estípite.
3. Hericium: inducción 5–7 d a 15–16 °C / 95 % vs 18 °C / 90 %; luego 18 °C / 88 %.
4. Hericium: CO2 ≤800 vs ~1500 ppm; fotos normalizadas y longitud de dientes.
5. Registrar temperatura de núcleo en bloques testigo (ambas especies).

## 7. Referencias

Estado: V = verificada (autores/revista/año coinciden en resultados de búsqueda); P = parcial; K = tomada de la KB del repo sin verificar directamente.

Tier A
1. [V] Atila, F., Tüzel, Y., Pekşen, A., Cano, A. F., & Fernández, J. A. (2021). The effect of different fruiting temperatures on the yield and nutritional parameters of some wild and hybrid *Hericium* isolates. *Scientia Horticulturae*, 280, 109915. https://doi.org/10.1016/j.scienta.2021.109915
2. [V] Lee, H.-Y., Ham, E.-J., Yoo, Y.-J., Kim, E.-S., Shim, K.-K., Kim, M.-K., & Koo, C.-D. (2012). Effects of aeration of sawdust cultivation bags on hyphal growth of *Lentinula edodes*. *Mycobiology*, 40(3), 164–167. https://doi.org/10.5941/MYCO.2012.40.3.164 (PMC3483392)
3. [P] Imtiaj, A., et al. (2008). Vegetative growth of four strains of *Hericium erinaceus* collected from different habitats. *Mycobiology*, 36(2). https://doi.org/10.4489/MYCO.2008.36.2.088 (lista de autores completa no verificada)
4. [P] Estudio de 13 cepas de *L. edodes* con regímenes de temperatura de fructificación (L38, L300; 15/25 °C, 80–95 % HR). https://core.ac.uk/works/25006519 (autores y revista no verificados)
5. [P] Estudios coreanos de fructificación de *H. erinaceus* en cámara: https://www.earticle.net/Article/A289456 y https://www.earticle.net/Article/A280989 (autores no verificados)
6. [P] Mushroom Research (ICAR), "Response of shock treatment on fructification of shiitake mushroom using synthetic logs of different substrates". https://epubs.icar.org.in/index.php/MR/article/view/126321 (autores y año no verificados)
7. [P] Atila, F. (2019). The use of phenolic-rich agricultural wastes for *Hericium erinaceus* and *Lentinula edodes* cultivation. Revista turca, vol. 56 (revista exacta no verificada). https://search.trdizin.gov.tr/yayin/detay/386306

Tier B
8. [P] Ohio State University Extension, factsheet F-0041 (cultivo de shiitake en troncos; título exacto no verificado). https://ohioline.osu.edu/factsheet/f-0041 y F-0042 https://ohioline.osu.edu/factsheet/f-0042
9. [P] Cornell Small Farms, "Forcing Bolts", en *Methods of Commercial Mushroom Cultivation in the Northeastern United States*. https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/5-forcing-bolts/
10. [K] Chang, S.-T., & Miles, P. G. (2004). *Mushrooms: Cultivation, Nutritional Value, Medicinal Effect, and Environmental Impact* (2nd ed.). CRC Press. Cap. 13 (citada por la KB).
11. [K] Rodríguez Valencia, N., & Jaramillo López, C. (2005). Cultivo de hongos medicinales en residuos agrícolas de la zona cafetera. Cenicafé/FNC (citada por la KB).

Tier C
12. [P] Mycoboutique, "Growing Shiitake at home". https://mycoboutique.com/blogs/instructions/growing-shiitake-lentinula-edodes-at-home (fructificación 16–20 °C)
13. [P] Lamycosphere, tabla de cultivo de *Hericium* atribuida a Stamets. https://lamycosphere.com/en/products/mycelium-de-lions-manes-yamabushiitakes

No usadas (calidad insuficiente): páginas de contenido genérico "How to grow lion's mane" en dominios no relacionados.

Citas que NO pude verificar y que están en la KB: Rocha 2025 (J. Appl. Mycol. Biotechnol.), Shi 2026 (Comput. Electron. Agric. 218, 108722), Holgado-Rojas 2019 (Cantua), Gaitán-Hernández 2014 (Ann. For. Sci.), Lu 2024 (Front. Plant Sci.), Atila 2019 tal como está citada. Se recomienda auditarlas igual que las dos correcciones de la sección 1.
