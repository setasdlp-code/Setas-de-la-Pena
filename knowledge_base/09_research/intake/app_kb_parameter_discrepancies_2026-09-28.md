---
title: "Corroboración de discrepancias entre Setas OS y knowledge_base"
category: research
status: "PENDIENTE DE VALIDACIÓN"
confidence: medium
date: 2026-09-28
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
| Incubación *P. ostreatus* | 22–27 °C (antes) | 20–24 °C | Ninguno exacto; aire objetivo 22–25 °C | **Media-alta** |
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

### La incubación se mide en aire, no en micelio

El óptimo de **velocidad** del micelio in vitro es mayor (~28 °C) que la
temperatura de **aire** recomendada (23–25 °C), porque el bloque se autocalienta
2–5 °C por encima del aire. Considerando todos los rasgos agronómicos y no solo
velocidad, un estudio sobre cascarilla de algodón sitúa el óptimo integral en
22 °C. Por encima de ~28 °C el beneficio de velocidad se paga con
susceptibilidad a *Trichoderma*.

Confundir ambas medidas es lo que produce rangos con techo de 27 °C.

- https://doi.org/10.3390/horticulturae9010095
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5658199/

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
  de la especie. **Esta corroboración lo matiza**: el valor mejor respaldado como
  aire objetivo es 22–25 °C, así que el KB y el app coinciden hoy en un valor que
  la literatura deja 1 °C corto arriba. Pendiente de decisión.
- `KPI.beAlert / beTarget / beOptimal`: 70/80/100 → 40/55/70. El piso y el techo
  salen del rango documentado en `production_schedule.md`; el 55 es un setpoint
  elegido dentro de la banda, **no un valor medido**.

## Preguntas abiertas

1. ¿Se adopta 22–25 °C como aire objetivo de incubación, corrigiendo ambos lados?
2. ¿Se modela el CO₂ de *Ganoderma* como régimen por fase? ¿Con qué umbral de
   asta, dado que las fuentes discrepan entre 1.500 y 5.000 ppm?
3. ¿Se separan los umbrales de EB por especie y número de cosecha? Requiere
   corpus de campo.
4. ¿Se marca la temperatura de fructificación como dependiente de cepa en vez de
   hard-codearla?
