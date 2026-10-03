---
title: "Corroboración de discrepancias entre Setas OS y knowledge_base"
category: research
status: "PENDIENTE DE VALIDACIÓN · REVISADA"
confidence: medium
date: 2026-09-28
last_reviewed: 2026-10-03
revisions:
  - date: 2026-10-02
    change: "Corregida la conclusión de temperatura de incubación (iba en dirección contraria) y reclasificado el delta de autocalentamiento como supuesto, no hallazgo. Añadidos los veredictos de la segunda ronda de investigación."
  - date: 2026-10-03
    change: "Anulada la afirmación de que el delta núcleo-aire no está cuantificado: sí lo está, en paper_026 (Shi et al. 2026, 4-8 °C), y ya estaba en el propio KB. Fallo de búsqueda, no de evidencia. La conclusión de dirección no cambia; se refuerza."
species:
  - "Pleurotus ostreatus"
  - "Ganoderma lucidum"
  - "Hericium erinaceus"
scope:
  - temperatura de incubación y fructificación
  - eficiencia biológica como objetivo operativo
  - umbral de contaminación
  - CO2 como control morfológico
  - parámetros de extracción (UAE y decocción acuosa)
related:
  - "knowledge_base/06_operations/production_schedule.md"
  - "knowledge_base/02_substrates/contamination.md"
  - "knowledge_base/01_species/pleurotus_ostreatus.md"
  - "knowledge_base/01_species/ganoderma_lucidum.md"
  - "knowledge_base/09_research/deep_research_synthesis_2026.md"
---

# Corroboración de discrepancias entre Setas OS y knowledge_base

> Estado: **PENDIENTE DE VALIDACIÓN**. Esta ficha no modifica SOP, CANON ni
> parámetros activos. Registra evidencia externa para que las decisiones sobre
> qué lado corregir se tomen con las fuentes a la vista, y para que no haya que
> re-derivarlas. Ningún valor de `knowledge_base/` fue editado a partir de ella.
>
> **Revisada el 2026-10-02.** Una segunda ronda de investigación corrigió dos
> afirmaciones de la primera versión: la conclusión sobre temperatura de
> incubación estaba invertida, y el delta de autocalentamiento del bloque se daba
> como hallazgo cuando no tenía respaldo localizado. Ambas quedan anuladas y
> anotadas en su sección. Los veredictos de esa segunda ronda están en
> «Preguntas abiertas».
>
> **Revisada el 2026-10-03.** La segunda corrección era a su vez errónea en su
> parte factual: el delta núcleo–aire **sí** está cuantificado y revisado por
> pares (`paper_026`, 4–8 °C), y ya estaba consignado en `04_facility/
> incubation.md` y `01_species/lentinula_edodes.md`. Las dos rondas buscaron
> fuera y no revisaron el KB para ese parámetro. La conclusión de dirección de
> la temperatura de incubación no cambia — se refuerza. Ver la sección de
> incubación.

## Por qué existe

`scripts/quality/check_kb_sync.py` detecta divergencias entre los valores que
Setas OS hard-codea y los que `knowledge_base/` documenta, pero no puede decir
**cuál de los dos lados tiene razón**. Esta ficha corrobora siete de esas
divergencias contra literatura externa.

El resultado general: en seis de siete, `knowledge_base/` estaba mejor
respaldado que el app. Eso es una señal sobre el origen de los valores del app
—parecen heredados de techos de literatura o de compromisos de amplio
espectro— más que sobre la calidad del KB.

## Matriz de evidencia

| Parámetro | App | knowledge_base | Veredicto de literatura | Nivel |
|---|---|---|---|---|
| EB objetivo / óptimo | 80 / 100% | "referencia 40–70%, sin validar" | App calibrado al techo; >100% son acumulados de 4–6 cosechas | **Media-alta** |
| Umbral de contaminación | 15% (alerta) | revisar a 10% | Benchmark comercial real 2–5%; el KB es incluso laxo | **Media** |
| Fructificación *P. ostreatus* | 10–21 °C | 13–24 °C (óptimo 15–20) | KB gana; el valor del app no corresponde a ninguna fuente | **Media-alta** |
| Incubación *P. ostreatus* | 22–27 °C (antes) | 20–24 °C | KB correcto como aire; núcleo objetivo 23–25 °C (corregido 2026-10-02) | **Media-alta** |
| CO₂ fructificación *G. lucidum* | escalar 2000 ppm | régimen de 3 estados | KB gana: es control morfológico, no techo | **Alta** |
| UAE etanol *H. erinaceus* | 70% | 75–95% | KB gana; 80% es el único valor optimizado publicado | **Media-alta** |
| Decocción acuosa reishi | 95 °C | 85–90 °C | **Sin diferencia sustantiva**; ambos dentro de lo aceptado | **Media-alta** |

## Hallazgos que cambian la lectura del parámetro, no solo su valor

### CO₂ en *Ganoderma* no es un techo

Evidencia revisada por pares confirma que el CO₂ elevado **inhibe la
diferenciación del píleo**: produce cuerpos tipo asta (solo estipe, sin
esporas), con genes de percepción de CO₂ y remodelado de pared celular
diferencialmente expresados, y con acumulación marcada de triterpenoides. Es
decir, el CO₂ selecciona morfología **y** perfil bioactivo.

Un escalar único no puede representar eso. Modelarlo requiere régimen por fase
con rango y dirección de cambio.

**Dos incertidumbres que conviene no borrar:** el umbral de asta **no está
acordado** entre fuentes (el KB usa >1.500 ppm; varias guías de cultivo citan
5.000+ ppm; coinciden en la dirección, no en el corte). Y la caída brusca a
~350 ppm hacia el día 50 como inductor del píleo es **práctica de finca
documentada, sin paper que valide esa fecha ni ese escalón**.

- https://doi.org/10.3390/jof12010005
- https://www.sciencedirect.com/science/article/abs/pii/S1878614618300096

### La EB alta se reporta acumulada, no por ciclo

Los valores >100% que justificarían un objetivo de 100 se reportan casi siempre
(a) acumulados sobre 4–6 flushes, (b) con cepa seleccionada, (c) con
suplementación alta que exige esterilización estricta, no pasteurización.
Compararlos contra una EB por ciclo enfrenta **dos magnitudes distintas**.

Rangos por ensayo: *P. ostreatus* sobre paja 36–93% (paja envejecida cae a
15–26%); *P. djamor* sobre paja de arroz 19,0–61,3%; shiitake sobre aserrín
suplementado 45% a 74–88% según nivel de salvado. Comercial sostenido para
Pleurotus: 50–100%.

Nada en la literatura corrige por altitud (2.600 m), pero temperaturas bajas
alargan ciclos y no favorecen el extremo alto del rango.

- https://www.mdpi.com/2311-7524/9/4/439
- https://www.scielo.org.mx/scielo.php?script=sci_arttext_plus&pid=S2007-90282025000100006
- https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0309787

### La temperatura de fructificación es dependiente de cepa

La variación es **por cepa, no ruido**: cepas americanas fructifican de 4 a
24 °C, las alemanas solo por debajo de 15 °C; en híbridos la iniciación de
primordios depende de <15 °C mientras la expansión del píleo sigue por encima
de 20 °C. Cepas comerciales concretas van de 2–10 °C (Cold Blue) a 10–27 °C
(Warm Blue).

Un único par de números no describe la especie. La observación que ya estaba en
`01_species/pleurotus_ostreatus.md` ("hasta 10 °C forma pequeña y densa; hasta
26 °C grande y rápida") coincide con lo reportado y es información de calidad.

- https://link.springer.com/article/10.1007/BF00278373
- https://extension.psu.edu/forage-and-food-crops/mushrooms/production-and-harvesting

### La incubación tiene tres medidas distintas, no dos

> **Corregido el 2026-10-02.** La primera versión de esta ficha concluía que el
> aire objetivo era 22–25 °C y que el `[20,24]` vigente quedaba 1 °C corto
> arriba. **Era un error de dirección** y queda anulado: ver abajo.

Hay tres cosas que la literatura mezcla y que no son intercambiables:

1. **Óptimo in vitro** (micelio en agar): ~25–28 °C. Es velocidad de extensión
   radial, no consigna de sala.
2. **Óptimo integral en sustrato**: 22 °C, considerando vigor, tiempo a
   primordios, morfología y EB — no solo velocidad (Zhang et al. 2023,
   cascarilla de algodón, 8 temperaturas entre 15 y 32 °C).
3. **Consigna comercial**: la industria especifica 23–25 °C de temperatura de
   **SUSTRATO** (núcleo del bloque), no de aire.

El error de la primera versión fue aplicar el autocalentamiento en la dirección
equivocada. Si el objetivo de **núcleo** es 23–25 °C y el bloque corre por
encima del aire, entonces la consigna de **aire** debe ser **más baja** que el
núcleo, no más alta. El `[20, 24]` que hoy comparten KB y app es defendible; lo
que faltaba era un óptimo puntual y la advertencia de qué se está midiendo.

Por encima de ~28 °C de núcleo, el beneficio de velocidad se paga con
susceptibilidad a *Trichoderma*.

> **Corregido el 2026-10-03.** Esta sección afirmaba: *"El autocalentamiento NO
> está cuantificado. No existe medición publicada y revisada por pares del delta
> núcleo–aire en bloques de Pleurotus durante spawn run (…) El delta de 2–5 °C
> que afirmaba la primera versión de esta ficha es un supuesto operativo, no un
> hallazgo."* **Eso es falso, y el fallo fue de búsqueda, no de evidencia:** el
> delta ya estaba en el propio KB, citado y revisado por pares, y no lo busqué
> ahí. Ver abajo.

**El autocalentamiento SÍ está cuantificado, y estaba en el KB desde antes.**
Shi et al. (2026) — `paper_026`, *Computers and Electronics in Agriculture*,
registrado como ARK-012 — midieron la dinámica térmica dentro de bloques de
cultivo sólido: durante el pico de colonización el núcleo corre **4–8 °C por
encima del aire**, con desfase térmico de 2–4 h y memoria térmica.

Ya estaba consignado en `04_facility/incubation.md` (principio de inercia
térmica) y en `01_species/lentinula_edodes.md`, que incluso fija la alarma
operativa en `T_núcleo > 28 °C` y designa el sensor (DS18B20 en bloque testigo).
Las dos rondas de investigación buscaron en literatura externa y no revisaron el
KB para este parámetro — que es exactamente el error que
`knowledge_base/AGENTS.md` prohíbe: *"Never answer from general knowledge when
project knowledge is available."*

Tres consecuencias:

1. El delta es **4–8 °C**, no 2–5. Mi cifra original era baja además de estar
   mal clasificada.
2. La conclusión de dirección **no cambia** — al contrario, se refuerza: con un
   delta de 4–8 °C, el techo de aire de 24 °C ya pone el núcleo en 28–32 °C.
   Subir el aire a 25 °C "para acercarse al óptimo de sustrato" sería
   precisamente cocer el núcleo. `[20, 24]` sigue siendo correcto.
3. Las cifras de divulgación comercial que esta ficha citaba (pico de +3 °C;
   núcleo a 36–37 °C con aire >25 °C) quedan como lo que son: no hacían falta,
   había fuente primaria.

El campo de núcleo quedó definido en el KB el 2026-10-03 — ver
`01_species/pleurotus_ostreatus.md` §Inercia Térmica y
`metadata/species.yaml` (`incubation_core_temp_max_c`,
`incubation_core_over_air_delta_literature_c`).

- https://doi.org/10.3390/horticulturae9010095
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5658199/
- https://doi.org/10.1016/j.scienta.2015.12.035 — "spawn-burning" por anoxia
  bajo estrés térmico en spawn run (*P. eryngii*), revisado por pares
- Penn State Extension (23–25 °C de sustrato): **no verificado en fuente
  primaria**, el proxy de salida bloqueó el dominio y la cifra viene de extracto
  de búsqueda.

### El etanol de UAE depende de qué fracción se busca

El único estudio que optimiza UAE específicamente para **erinacina A** (diseño
Box-Behnken) da 80% etanol, 45 min, ratio 1:30. Los protocolos analíticos
consolidados usan 75% o 95%.

El riesgo de confusión es concreto: un estudio de 2026 optimiza UAE de
*H. erinaceus* para **polifenoles** en ~44,6% etanol, y los protocolos de
β-glucanos usan agua a 100 °C. Son objetivos distintos con óptimos distintos. Un
70% es un compromiso de amplio espectro, incoherente si ya existe un brazo
acuoso caliente separado para β-glucanos: el brazo etanólico debería empujarse
hacia lo apolar.

La diferencia 70→80% es **real pero moderada** (curva suave, no acantilado) y no
hay dato publicado que cuantifique ese delta exacto para hericenonas.

- https://doi.org/10.3390/foods9121889
- https://pubmed.ncbi.nlm.nih.gov/38921415/

## Limitaciones de esta corroboración

- **Textos completos no verificados.** El proxy de salida bloqueó PMC, MDPI y
  EuropePMC en varias consultas; parte de las cifras provienen de resúmenes
  indexados. Antes de citar formalmente cualquiera de estos valores en un SOP,
  verificar el PDF.
- **Ninguna fuente es local.** Todo es literatura externa sobre otras
  localidades y cepas. No sustituye medición en Tenjo, y en particular no hay
  nada que corrija por 2.600 m.
- **No hay EB medida de esta finca.** Mientras `ground-truth-fixtures.json` no
  exista, cualquier umbral de EB es una elección, no una calibración.
- Los niveles de evidencia de la matriz se refieren a la **solidez de la fuente
  externa**, no a su transferibilidad a Setas de la Peña.

## Cambios en el app derivados de esta corroboración

Registrados aquí para trazabilidad. Ninguno tocó `knowledge_base/`:

- `KB_SPP.pleurotus_ostreatus.incT`: 22–27 → 20–24 °C, para alinear con el `.md`
  de la especie. **Confirmado correcto** en la segunda ronda (2026-09-30): como
  consigna de aire, 20–24 °C es defendible. La primera versión de esta ficha
  decía que quedaba 1 °C corto arriba; era un error de dirección, ya corregido
  arriba. No requiere cambio.
- `KB_SPP.pleurotus_ostreatus.fruitT`: 10–21 → 13–24 °C. Alineado con el `.md`,
  pero ver la pregunta abierta 4: para una cepa sin identificar, un par de
  números no es planificable y el sistema debería abstenerse, no dar un número.
- `KPI.beAlert / beTarget / beOptimal`: 70/80/100 → 40/55/70. El piso y el techo
  salen del rango documentado en `production_schedule.md`; el 55 es un setpoint
  elegido dentro de la banda, **no un valor medido**.

## Preguntas abiertas

Las cuatro se investigaron el 2026-09-30 (segunda ronda). Quedan abiertas como
**decisión**, no como duda de evidencia; lo que sigue resume el veredicto.

1. **Incubación.** ~~Adoptar 22–25 °C de aire~~ — **descartado**: iba en
   dirección contraria. El `[20,24]` vigente es correcto como aire. Lo que sí
   procede es añadir `incubation_temp_optimal_c: 22` (Zhang 2023, óptimo
   integral) y registrar aparte el objetivo de núcleo 23–25 °C, con la
   advertencia de que se gobierna el núcleo y el delta no está cuantificado.
2. **CO₂ de *Ganoderma*.** Sí procede modelarlo como régimen, pero **por
   producto objetivo (antler vs conk) con la fase como modulador**: incubación y
   primordios son comunes a ambos y la bifurcación aparece solo después de
   primordios. El umbral de asta **no existe en la literatura**: ninguna fuente
   publica curva dosis-respuesta y el corte va de ~1.000 ppm (literatura china) a
   5.000 ppm (guías comerciales). Corresponde una banda de incertidumbre
   declarada, no un número. Y el CO₂ no va solo: la maduración del conk es un
   descenso simultáneo de CO₂, HR y temperatura, con la luz al alza.
3. **EB por especie y cosecha.** Sí, y con dos ejes: por especie y separando
   1er flush de acumulado. El escalar único es **inalcanzable para *djamor* y
   trivial para shiitake suplementado**. Distribución por flush en Pleurotus:
   F1 = 40–65 % del acumulado, F2 = 25–38 %, F3 = 10–20 %. Antes de fijar nada
   hay que resolver dos definiciones: masa seca **antes** de hidratar (lo
   trazable es la masa seca formulada) y si el spawn entra al denominador
   (incluirlo baja la EB 5–15 %; debe ser campo explícito).
4. **Fructificación dependiente de cepa.** Sí, pero **no clonando el enum de
   shiitake**: en *P. ostreatus* las clases comerciales (wide range / warm /
   cold) se solapan masivamente y no particionan el espacio. El eje real es la
   identidad de cepa. Lo defendible es que el sistema **se abstenga de dar
   recomendación térmica mientras la cepa sea desconocida** — como ya hace el
   `blocked_pending_*` de shiitake — y separar `pinning_temp_c` de
   `pileus_expansion_temp_c`, que están desacoplados en híbridos.

### Lo que las cuatro dicen en conjunto

Tres de las cuatro terminan en el mismo sitio: **la literatura está agotada como
fuente de respuestas**. El umbral de CO₂, los umbrales de EB y la clase de cepa
solo se resuelven con datos propios, y las tres piden listas de campos por lote
muy solapadas. El desbloqueo no es seguir ajustando parámetros, es el **registro
por lote** — que además es el corpus ausente que bloquea `perito-regression`.

Tamaños mínimos reportados: EB necesita ≥12–15 lotes por especie×sustrato×cepa
en ≥3 tandas (CV entre lotes 15–30 %); con <8 lotes, solo mediana y rango, nunca
un umbral derivado. La clase de cepa se infiere con 3–4 lotes en rangos térmicos
distintos, y el dato que más discrimina es la **temperatura ambiente al primer
primordio** más si se aplicó choque frío.

### Nota de altitud (inferencia, no evidencia)

La altitud apareció como modificador real en dos de las cuatro, y en ninguna hay
literatura:

- **CO₂**: a 2.600 m las mismas ppm equivalen a ~73 % de la presión parcial a
  nivel del mar, así que un umbral en ppm importado de literatura de nivel del
  mar sobreestima la dosis fisiológica.
- **Calor**: ~26 % menos densidad implica menor capacidad de remoción convectiva
  a igual caudal volumétrico.

Ambas son inferencias físicas propias. Son legítimas como nota de ingeniería;
**no deben citarse como evidencia** ni usarse para mover un parámetro sin
medición local.
