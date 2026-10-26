# Extracción de hongos: corroboración de `extraction-factors.json`

Fecha: 2026-10-26. Autor: Investigador de Extracción y Productos Derivados (agente). Repo no modificado.

## 0. Limitaciones (leer primero)
- WebFetch y curl están bloqueados por el proxy (403 / ENOTFOUND para ncbi, rsc, mdpi). **Ningún texto completo fue leído.** Todas las cifras externas provienen de resúmenes/snippets devueltos por WebSearch. Cada cifra lleva su nivel de verificación: [S] = visto en snippet de búsqueda; [KB] = ya documentado en el repo; [EST] = estimación mía, sin fuente.
- No se encontró ninguna fuente que reporte, para las 12 combinaciones especie×método, rendimiento en % p/p base seca bajo las condiciones exactas de la app. Los valores propuestos son rangos de la literatura general, no calibraciones.
- No se inventaron DOIs. Donde no hay DOI verificado, se da URL del resultado de búsqueda.

## 1. Qué significa `yield_factor`
El JSON no lo define. Se asume (hipótesis) masa de extracto seco / masa seca de hongo. Con esa lectura: 0,09–0,20. Dos problemas:
1. **El rendimiento depende del solvente, no del "método".** El rendimiento de masa de un extracto etanólico de reishi (~5 %) es menor que el de uno acuoso (~10 %), pero la app pone ultrasonido (etanol) como el MAYOR en las 4 especies (0,13 > 0,10 > 0,09 en reishi). Para reishi eso contradice la evidencia visible.
2. **Masa de extracto ≠ calidad.** Un extracto acuoso "rinde" más masa (incluye azúcares, proteínas) pero puede tener pocos β-glucanos/triterpenos. Sin marcador (β-glucano %, triterpenos %) el rendimiento no sirve para decidir negocio.
3. Contradicción interna con el KB: `deep_research_synthesis_2026.md` §1.1 dice 18–25 % p/p para la fracción hidrosoluble de Hericium (sin cita, no verificado), y el JSON pone 0,13 para decocción de Hericium. No cuadran entre sí.

## 2. Lo que ya existe en el repo (no repetir)
- `knowledge_base/09_research/deep_research_synthesis_2026.md` §1: esquema dual (UAE etanol 70–80 %/75–95 % a 45–50 °C 30–45 min; agua 85–90 °C 2–3 h, relación 15–20:1). Sin citas verificables; afirma "+100–120 % vs reflujo" sin fuente.
- `knowledge_base/09_research/intake/app_kb_parameter_discrepancies_2026-09-28.md`: ya resolvió etanol 80 % para erinacina A (Valu 2020, DOI 10.3390/foods9121889, Box-Behnken, 45 min, 1:30) y advierte que un estudio de 2026 optimiza polifenoles de Hericium en ~44,6 % EtOH (PMID 38921415). Reconoce que no se leyeron textos completos.
- `01_species/ganoderma_lucidum.md` l.105: "enfocar en extracto doble". `07_business/regulatory_framework.md` l.36: suplementos = INVIMA, Decreto 3249/2006. `shiitake_medicinal_properties_evidence_2026-08-16.md`: no priorizar extractos terapéuticos; identidad de materia prima, relación, solvente, marcadores.
- No hay en el KB ningún precio de etanol ni ninguna tabla de rendimientos de extracto con fuente.

## 3. Evidencia por especie

Clasificación: A = experimental revisado por pares; B = revisión; C = industria/patente.

### 3.1 Reishi (Ganoderma lucidum)
| Dato | Condiciones | Marcador | Tier | Verif. |
|---|---|---|---|---|
| Rendimiento 4,9 ± 0,6 % con UAE; 435,6 ± 21,1 mg/g triterpenos (en el extracto) | UAE 40 min, 100 W, EtOH 89,5 %; cuerpo fructífero | triterpenos | A | [S] Taofiq et al. 2018, Food & Function, https://pubs.rsc.org/en/content/articlehtml/2018/fo/c7fo01601h (título completo/DOI no verificados) |
| Calor (HAE) óptimo: 78,9 min, 90 °C, EtOH 62,5 % | mismo estudio | triterpenos | A | [S] misma fuente (rendimiento HAE no visto) |
| Extracto acuoso total: 5,3 / 7,6 / 10,7 / 13,2 % a TA / 50 / 100 / 200 °C | agua; materia/basis no confirmada | rendimiento total | A | [S] J Food Drug Anal (jfda-online.com/journal/vol12/iss1/3, atribución no verificada) |
| Polisacárido (precipitado) en agua caliente 1,9–2,5 % ; optimizado 2,97 % (92,4 °C, 5 h, 21:1) | agua | polisacáridos | A | [S] scholars.lib.ntu.edu.tw/bitstream/123456789/98192/1/05.pdf; castjournals.cast.org.cn |
| UAE en EtOH 50 %: polisacáridos 0,63 %, triterpenos 0,38 % | simultánea | ambos | A | [S] sin autor verificado |
| UAE triterpenos 9,58 mg/g | 55 min, 480 W, 27:1 | triterpenos | A | [S] vjs.ac.vn/.../15485 |
| Productos comerciales: polisacáridos 4,5–16,9 %, triterpenos 0,9–2,6 % (en producto) | mercado | | C/A | [S] PMC7774858 (no verificado) |
Conclusión: etanólico ~5 % de masa; acuoso ~10 % de masa (100 °C), pero polisacárido puro solo ~2–3 % del hongo seco. Ninguna fuente visible mide "yield" de maceración 120 h a 28 °C.

### 3.2 Melena de león (Hericium erinaceus)
- Valu et al. 2020, Foods 9(12):1889, DOI 10.3390/foods9121889, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7766035/ : UAE para erinacina A y polifenoles en **micelio** de cultivo sólido (no cuerpo fructífero). Tier A. Existencia confirmada [S]; 80 % EtOH/45 min/1:30 solo [KB], no verificado por mí.
- Rendimiento de triterpenos 0,28 % con EtOH 60 %, 55 °C, 1:15 (Box-Behnken) [S], https://www.spgykj.com/en/article/Y2021/I22/153 . Tier A; es contenido de triterpenos, no masa de extracto.
- Patente CN1453295A: 1 kg cuerpo fructífero, 20 kg agua, 96 °C, 3 h → 70 g de precipitado alcohólico (~7 % p/p) [S]. Tier C; fracción polisacárida precipitada, no extracto total.
- Foods 2024 13(1560), https://mdpi-res.com/d_attachment/foods/foods-13-01560/article_deploy/foods-13-01560.pdf : cita la optimización 80 %/1:30/45 min [S].
- **No se halló** ningún % p/p de extracto etanólico de cuerpo fructífero ni contenido de hericenonas por solvente. Importante: las erinacinas están sobre todo en micelio, las hericenonas en cuerpo fructífero [KB]; la app no distingue materia prima (cuerpo fructífero vs micelio en grano), y el negocio actual produce cuerpo fructífero.

### 3.3 Shiitake (Lentinula edodes)
- Ultrasonido vs agua caliente: UAE +88,7 % rendimiento de polisacárido vs agua caliente (Cheung et al. 2012, citado en PolyU, ira.lib.polyu.edu.hk/bitstream/10397/115175) [S, de segunda mano].
- Comparación 2025 (Chiang Mai): UAE-agua dio el mayor β-glucano, 34,51 ± 0,82 g/100 g de extracto; agua caliente conserva mejor la estructura. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12295568/ [S], Tier A.
- Rendimientos de polisacárido: 10,17 % (UAE con solvente eutéctico, 60 °C, 1:30), 13,38 % (agua hirviendo asistida por US, 1:20, 60 °C), 14,25 % lentinano (agua alta temperatura) [S], fuentes chinas no verificadas individualmente.
- Eritadenina: PLE en agua a 142 °C rindió más que etanol acuoso clásico [S] (avesis.kayseri.edu.tr). Implica que la eritadenina no necesita alcohol.
- Extracto con EtOH 95 %: 31,16 % (basis y material poco claros) [S], baja confianza.
- **No se halló** rendimiento de extracto con EtOH 65 %/72 h/25 °C como en la app.

### 3.4 Orellana (Pleurotus ostreatus; en la app "gris")
- PLoS ONE 2019 (PMC6317818): agua ~70,5 °C, 62 min, 26 mL/g → polisacárido 5,32 ± 0,12 %. [S] Tier A.
- Rev. Iran. J. Food Sci. Technol. 2019 (sid.ir/paper/72281/en): UAE 337 W, 65 °C, 21,7 min → 17,71 % (basis no declarada) [S]. Tier A.
- Innov. Food Sci. Emerg. Technol. 2025 (NTU): plasma+US 12,0 % crudo; agua caliente implícito ~7 % (cálculo mío, [EST]).
- Sin datos de EtOH. Orellana no tiene marcadores de alto valor comparables; el JSON la trata igual que las otras.

## 4. Propuesta (base: extracto/ masa seca de hongo, fracción de masa)
Los rangos son del conjunto de estudios arriba; la recomendación es mi juicio, no una medición. Confianza: Baja = un solo estudio o snippet; Media = varios estudios coherentes.

| Especie | Método | App | Rango propuesto | Recomendado | Confianza | Fuentes |
|---|---|---|---|---|---|---|
| Reishi | Hidroalc. (80 %, 120 h) | 0,09 | 0,04–0,08 | 0,05 | Media-baja | Taofiq 2018 (4,9 %) |
| Reishi | Acuosa 95 °C | 0,10 | 0,05–0,13 | 0,10 | Media-baja | J Food Drug Anal (10,7 % a 100 °C) |
| Reishi | UAE (75 %) | 0,13 | 0,04–0,07 | 0,05 | Media-baja | Taofiq 2018 (4,9 %) |
| Hericium | Hidroalc. doble | 0,11 | 0,05–0,15 (no verificado) | 0,10 | Baja | patente CN1453295A; sin dato etanol |
| Hericium | Acuosa 88 °C | 0,13 | 0,07–0,25 | 0,10 | Baja | CN1453295A (7 % precipitado); KB sin cita 18–25 % |
| Hericium | UAE (80 %) | 0,16 | 0,03–0,10 | 0,06 | Baja | sin dato directo |
| Shiitake | Hidroalc. (65 %) | 0,14 | sin evidencia | mantener 0,14, marcar [EST] | Muy baja | - |
| Shiitake | Acuosa 90 °C | 0,16 | 0,08–0,15 | 0,12 | Media | fuentes chinas 10–14 % [S] |
| Shiitake | UAE (55 %) | 0,20 | 0,10–0,20 | 0,13 | Media-baja | Cheung 2012 (+88,7 % vs agua), 13,38 % [S] |
| Orellana | Hidroalc. (70 %) | 0,12 | sin evidencia | mantener, marcar [EST] | Muy baja | - |
| Orellana | Acuosa 85 °C | 0,15 | 0,05–0,12 | 0,07 | Media-baja | PLoS ONE 2019 (5,3 %) |
| Orellana | UAE (60 %) | 0,18 | 0,07–0,18 | 0,12 | Baja | Iran J 2019 (17,7 %); NTU 2025 |

Observaciones:
- Para Hericium, reishi y shiitake con UAE, las cifras de la app son plausibles solo para el brazo acuoso asistido por ultrasonido, no para el brazo etanólico; en reishi y Hericium el etanol rinde menos masa que el agua.
- Los parámetros de proceso (temperatura, tiempo) sí tienen respaldo parcial: reishi UAE EtOH ~89,5 %/40 min/100 W (Taofiq), HAE 62,5 %/90 °C/79 min; Hericium 80 %/45 min/1:30 (Valu); Pleurotus UAE 65 °C/22 min; agua reishi 92 °C/5 h/21:1. La app usa maceración fría de 48–120 h a 25–28 °C, sin fuente encontrada que la respalde como "óptima"; 120 h es probablemente un valor de práctica herbolaria, no de optimización.

## 5. ¿Debe el modelo representar extracción dual?
Sí, para reishi y Hericium, y es el cambio de mayor valor.
- Hoy el modelo trata "hidroalcohólica", "acuosa" y "UAE" como alternativas excluyentes. En la práctica comercial, para reishi/Hericium se combinan agua + etanol (industria, tier C y el propio KB). El JSON ya llama "Doble" a la hidroalcohólica de Hericium pero con un solo costo de solvente, un solo etanol y un solo yield.
- Propuesta mínima: modelar `dual` = etapa 1 etanol (triterpenos/hericenonas) + etapa 2 agua caliente sobre el residuo; rendimiento total = y_EtOH + y_agua × (1 − y_EtOH), costo = suma de solventes de ambas etapas, con un campo `marker` por etapa (triterpenos %, β-glucano %). Evidencia directa de rendimiento dual cuantificado: **no encontrada** [S]; hay que calibrar con ensayo propio.
- Agregar `feedstock` (cuerpo fructífero vs micelio) y `marker_target`. Sin marcador el yield_factor no permite comparar rentabilidad.
- Separar el costo de solvente en `ethanol_pct` × precio_etanol + (1 − pct) × precio_agua, en vez de un valor fijo por método (hoy 18.000 para 70 % pero 22.000 para UAE 60 % y 24.000 para UAE 80 %: el UAE a 60 % cuesta más que la hidroalcohólica a 70 %, incoherente).

## 6. Costos de solvente en Colombia (COP/L)
Sólo se obtuvo una fuente de precios local: listados de MercadoLibre Colombia, vistos vía WebSearch, consulta aproximada, **no verificados uno a uno ni con fecha** (probablemente 2025–2026):
- Etanol 96 % grado alimenticio, 1 L: ~24.900 a ~37.000 COP/L; algunos 50.000 [S]. Un anuncio 29.990.
- "Alcohol potable USP 96 %": ~37.000–39.000 COP/L [S].
- Industrial desnaturalizado 1 L: ~14.900 [S] (no apto para extractos alimentarios).
- Fuentes: https://listado.mercadolibre.com.co/alcohol-etilico-96-grado-alimenticio , https://listado.mercadolibre.com.co/alcohol-etilico-96 .
- Precio a granel (bidón 20 L / tambor 200 L): **no encontrado**. [EST] 12.000–20.000 COP/L al comprar por volumen; hay que cotizar con distribuidores de químicos. Posible carga tributaria sobre alcohol potable (impoconsumo/licores): no verificada, confirmar.
- Agua: [EST] el agua potable es despreciable (<10 COP/L); 2.000 COP/L en el JSON sólo se justifica si incluye agua desmineralizada/energía de calentamiento. Definir qué incluye.

Costo de solvente por litro de mezcla = fracción etanol_96-equivalente × precio. Con 25.000–37.000 COP/L (1 L, retail):
| Mezcla | Fracción de 96 % (v/v) | COP/L retail | COP/L si granel 15.000 [EST] |
|---|---|---|---|
| 55–60 % | 0,57–0,63 | 14.000–23.000 | ~9.000 |
| 65–70 % | 0,68–0,73 | 17.000–27.000 | ~10.500 |
| 75–80 % | 0,78–0,83 | 20.000–31.000 | ~12.000 |
La app (18.000–25.000) cae en el rango retail bajo. Es defendible para escala piloto, pero el valor debe derivarse de la fórmula (arriba), no fijarse por método. Un solvente que se recupera/recircula (destilación) cambia el cálculo; el modelo lo ignora.

Para negocio: relación 15–30 L de solvente por kg seco (KB 15–20:1 agua; Valu 1:30) implica, a ~20.000 COP/L, 300.000–600.000 COP de etanol por kg de hongo seco en una etapa, **antes** de recuperación. Con rendimiento 5 % (50 g extracto/kg), son ~6.000–12.000 COP por g de extracto sólo en solvente. Esto es el hallazgo económico central: el etanol sin recuperación hace inviable al extracto seco etanólico de reishi/Hericium frente a vender polvo o producto fresco; con recuperación (destilación) el costo cae drásticamente. No se halló precio de mercado del extracto en este estudio (no investigado).

## 7. Regulatorio (breve, sólo lo que afecta al método)
- INVIMA tiene una alerta sanitaria sobre productos de **extracto de hongo reishi, extracto de melena de león y cannabis** sin registro sanitario, considerados ilegales bajo Decreto 3249/2006: https://www.invima.gov.co/alertas-sanitarias/extracto-de-hongo-reishi-extracto-de-cannabis-extracto-de-melena-de-leon [S, no leída completa]. Implicación: vender extractos de reishi/Hericium requiere registro de suplemento dietario; un extracto "artesanal" sin registro es un riesgo legal directo.
- Un resultado de 2026 menciona que INVIMA puede ordenar revisión de suplementos con registro en cualquier momento [S, sin verificar].
- Límites de etanol residual en el extracto final y análisis de solventes residuales: **no encontré el texto normativo**; no afirmo cifras. Una tintura (etanol como vehículo) es otro tipo de producto que un extracto seco. Verificar con INVIMA/abogado.

## 8. Recomendaciones de acción
1. Cambiar `yield_factor` a rendimiento por solvente, añadir `basis: "extracto seco / hongo seco"`, `marker`, `feedstock`, `source`, `confidence` en el JSON (a decidir por humano; no edité nada).
2. Rebajar UAE-etanol y hidroalcohólica de reishi/Hericium a ~0,05–0,06 (confianza media-baja); subir al menos una etiqueta [EST] a shiitake/orellana hidroalcohólica.
3. Añadir modo `dual` para reishi y Hericium.
4. Derivar costo de solvente de `pct` y precio de etanol (con parámetro de recuperación).
5. Antes de cualquier decisión de negocio: leer los textos completos (Taofiq 2018, Valu 2020, PLoS ONE 2019, Chiang Mai 2025), cotizar etanol a granel en Colombia, y ensayo piloto propio con cuantificación de marcadores en laboratorio.
6. Verificar con INVIMA el registro sanitario antes de comercializar.
