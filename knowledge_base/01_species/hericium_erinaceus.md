---
title: Hericium erinaceus — Lion's Mane / Melena de León
document_id: DOC-0006
category: species
load_priority: selective
last_reviewed: 2026-09-03
confidence: medium
primary_sources:
  - Friedman 2015 (paper_003)
  - Mori et al. 2009 (paper_002)
  - Atila 2019 (paper_024)
  - Tabi et al. 2021
  - Lu et al. 2024
  - Stamets 2000
related_documents:
  - pleurotus_djamor.md
  - lentinula_edodes.md
  - ../02_substrates/substrate_library.md
  - ../04_facility/fruiting.md
  - ../05_equipment/environmental_control.md
  - ../09_research/active_research_knowledge.md
  - ../09_research/high_altitude_microclimate_shiitake_hericium_2026-08-05.md
  - ../09_research/unresolved_questions.md
---

# Executive Summary

*Hericium erinaceus* es una especie de alto valor culinario y nutracéutico para Setas de la Peña (Fase de I+D / preproducción; stock de ~2.0 kg de spawn en refrigeración en Tenjo para ensayos de cámara). El proyecto no dispone todavía de una cepa comercial caracterizada a nivel de lote de producción ni de una curva local de temperatura, HR, CO₂ y velocidad de aire. Por ello, este perfil describe evidencia y requisitos de validación; no fija setpoints operativos rígidos.

La literatura primaria confirma variación entre aislamientos. Un estudio comparó fructificación a 15, 20 y 25°C y encontró respuestas diferentes incluso entre cepas de *H. erinaceus*. La evidencia revisada no justifica presentar **CO₂ <1.000 ppm** como umbral universal, ni una única banda térmica, duración, número de flushes o eficiencia biológica.

La especie puede desarrollar morfología elongada o coralina bajo condiciones inadecuadas de intercambio gaseoso, y puede deshidratarse cuando el flujo incide directamente sobre el carpóforo. Estas relaciones deben medirse con la cepa y el sistema de Setas de la Peña antes de escalar.

# Research Consensus

## Compuestos y evidencia de salud

Friedman (2015) revisa hericenonas, erinacinas, polisacáridos y otros compuestos de cuerpos fructíferos y micelio. Mori et al. (2009) evaluó una preparación oral en un ensayo pequeño de 30 participantes con deterioro cognitivo leve.

**Uso permitido:** contexto de investigación y desarrollo futuro.  
**Límite:** estos estudios no autorizan claims terapéuticos del hongo fresco, polvo o extracto producido por Setas de la Peña. Cualquier claim requiere evidencia del producto, dosis, proceso y revisión regulatoria vigente.

## Región de Referencia Ambiental Experimental (Atila 2019 — paper_024; ARK-001)

Atila (2019) evaluó el cultivo controlado de *H. erinaceus* bajo un régimen experimental caracterizado por:
- **CO₂:** < 1.200 ppm
- **Temperatura de fructificación:** 18 ± 2 °C
- **Humedad Relativa:** 85–90%
- **Fotoperiodo:** 1.000 lux durante 8 h/día

**Conclusión para el proyecto:** La región `< 1.200 ppm` y `18 ± 2 °C` representa una referencia experimental acotada y defendible, no un umbral fisiológico universal ni un techo estricto de 1.000 ppm. Sirve como punto de partida para los ensayos preliminares de caracterización en la carpa CLOUDLAB 844.

## Temperatura de fructificación

Tabi et al. (2021) evaluó aislamientos silvestres e híbridos de *Hericium* a 15, 20 y 25°C. La respuesta de rendimiento y composición dependió del aislamiento; incluso cepas de la misma especie no compartieron una temperatura única de mejor desempeño.

**Conclusión:** la temperatura se define por cepa y piloto. Los rangos de libros y productores sirven para diseñar una primera prueba, no para declarar un óptimo universal.

## Humedad, CO₂ y velocidad de aire

La literatura técnica y la práctica comercial coinciden en que *H. erinaceus* requiere humedad alta durante formación y desarrollo, intercambio gaseoso suficiente y ausencia de desecación superficial. Sin embargo, los umbrales exactos varían y la evidencia primaria de una curva universal de CO₂ es insuficiente.

**Conclusión:** controlar simultáneamente temperatura, HR, CO₂, condensación y velocidad de aire. Evaluar morfología, pérdida de masa y longitud de dientes por posición.

## Sustratos y respuesta a suplementos (Lu et al. 2024; Atila 2019 — paper_024; ARK-008)

La base más estudiada es aserrín de madera dura suplementado. Lu et al. (2024) demostró que la sustitución parcial de madera por paja puede producir formulaciones viables y modificar actividad enzimática. Por tanto, queda retirada la afirmación de que la especie no tolera materiales de gramíneas.

Por su parte, Atila (2019) evidenció una fuerte interacción entre la química del suplemento y la respuesta biológica de *H. erinaceus*:
- Respondió vigorosamente a la suplementación con orujo de uva (*grape pomace*).
- Fracasó marcadamente con orujo de nuez verde (*green walnut hull* al 20%), evidenciando una alta sensibilidad a taninos y polifenoles específicos.
- Demuestra que la relación C:N no puede usarse de forma aislada para formular sustratos; la composición química específica de los residuos agroindustriales locales condiciona la colonización y fructificación.

# Core Principles

- Identificar cepa, proveedor y lote antes de definir parámetros.
- Tratar temperatura, HR, CO₂ y velocidad de aire como variables interdependientes.
- Evitar niebla o chorro directo sobre primordios y carpóforos.
- Medir CO₂ en la zona de producto y caracterizar gradientes verticales durante comisionamiento.
- Usar SCD30 con compensación por presión ambiente o altitud registrada.
- No prometer BE, duración, flushes o vida útil sin datos locales.
- Mantener *H. erinaceus* como piloto separado hasta estabilizar trazabilidad, esterilización y control ambiental.

# Technical Details

## Taxonomía

- Reino: Fungi
- Orden: Russulales
- Familia: Hericiaceae
- Nombre común en español: melena de león
- Nombres internacionales: Lion's Mane; Yamabushitake

## Compuestos bioactivos — formulación prudente

| Grupo | Ubicación reportada | Estado de evidencia |
|---|---|---|
| Hericenonas | Principalmente cuerpo fructífero | Investigadas en estudios químicos y preclínicos |
| Erinacinas | Principalmente micelio y cultivos específicos | Investigadas en modelos preclínicos; contenido depende de cepa y proceso |
| Polisacáridos / beta-glucanos | Cuerpo fructífero y micelio | Composición variable; requiere análisis del producto |
| Ergosterol | Tejido fúngico | Precursor de vitamina D₂ bajo condiciones apropiadas |

No asumir concentración, biodisponibilidad o efecto clínico a partir del nombre de la especie.

## Incubación — estado provisional

| Variable | Estado de evidencia | Uso en Setas de la Peña |
|---|---|---|
| Temperatura | Rangos de cultivo publicados, dependientes de cepa | Definir banda inicial con ficha del spawn y piloto |
| HR ambiente | La bolsa limita intercambio hídrico; controlar condensación y pérdida de agua | Registrar HR, peso del bloque y condición de filtro |
| Duración | Frecuentemente descrita como rápida, con variación por cepa y formulación | No usar 14–21 días como criterio de liberación |
| Luz | Requisitos durante incubación no están definidos como universales | Registrar condición; no invertir en control específico sin evidencia |
| CO₂ / calor | Dependen de masa, fase, filtro y densidad de carga | Medir con carga representativa y temperatura interna de bloques |

Criterios mínimos de madurez para ensayo: colonización compatible con la cepa, bloque íntegro, ausencia de contaminación, masa y humedad dentro de especificación y respuesta consistente en unidades replicadas.

## Fructificación — variables de prueba

| Variable | Evidencia disponible | Estado operacional |
|---|---|---|
| Temperatura | 15, 20 y 25°C han sido comparados experimentalmente; respuesta dependiente del aislamiento | Pendiente por cepa |
| HR | Condiciones altas se repiten en literatura; agua libre aumenta riesgo de defectos y contaminación | Pendiente de mapeo y respuesta superficial |
| CO₂ | Intercambio insuficiente se asocia con morfología anormal en práctica; falta umbral primario universal | Pendiente de curva local |
| Velocidad de aire | Corriente directa puede aumentar desecación; falta límite transferible | Medir junto al producto |
| Luz | Estudios usan intensidades y fotoperiodos distintos | Pendiente de piloto |
| Duración / flushes | Cambian con cepa, sustrato y ambiente | No aprobados |

No se adopta una tabla única de setpoints hasta que exista especificación del lote.

## Indicadores visuales y diagnóstico

| Observación | Hipótesis inicial | Datos necesarios |
|---|---|---|
| Cuerpo compacto con dientes uniformes | Ambiente compatible con la cepa | T/HR/CO₂, posición, velocidad de aire, edad |
| Crecimiento coralino o elongado | CO₂, aire, luz, temperatura o cepa | Serie multipunto y comparación entre posiciones |
| Dientes cortos o desarrollo detenido | Madurez, temperatura, desecación o daño físico | Peso, superficie, T/HR y fotografías secuenciales |
| Amarillamiento o pardeamiento | Edad, calor, sequedad, oxidación o contaminación | Temperatura superficial, pérdida de masa, olor y microbiología si aplica |
| Superficie húmeda o exudado | Niebla directa, condensación, baja evaporación o deterioro | Punto de rocío, ciclos de humidificación y flujo |
| Diferencia marcada por estante | Distribución desigual de aire, humedad o temperatura | Mapa por nivel y velocidad de aire |

Una señal visual no identifica por sí sola la causa. Cambiar una variable principal a la vez cuando sea viable.

## Sustratos candidatos

| Ruta | Estado | Requisito de evaluación |
|---|---|---|
| Aserrín de madera dura + salvado | Referencia principal | Especie de madera, base seca, humedad, tratamiento térmico y cepa |
| Mezclas de maderas legales | Plausible | Trazabilidad, ausencia de tratamientos y consistencia entre lotes |
| Sustitución parcial con paja/gramíneas | Respaldada como línea experimental | Comparación controlada; no extrapolar formulación externa |
| Cascarilla de arroz como aireante | Hipótesis | Densidad, retención de agua, compactación y BE |
| Bagazo cervecero | Hipótesis de suplemento | Secado/proceso, proteína, variabilidad y riesgo de contaminación |
| Borra de café | Experimental | Composición, pH, contaminación, mezcla y tratamiento térmico |

No se mantienen rangos universales de BE. La eficiencia biológica debe calcularse con masa seca inicial documentada.

# Aplicación en Tenjo

La altura modifica presión y densidad molar del aire. A aproximadamente 2.600 m, un mismo transporte molar puede requerir mayor caudal volumétrico que al nivel del mar. Esto no equivale a aumentar automáticamente un porcentaje fijo de ACH.

Para el piloto:

1. medir presión barométrica, temperatura y HR exterior/interior;
2. verificar compensación del SCD30;
3. medir caudal efectivo con ductos y filtros;
4. mapear CO₂, T y HR en varios niveles antes y después de cargar;
5. registrar velocidad de aire junto a los primordios;
6. fotografiar cada bloque desde posición y distancia constantes;
7. registrar peso de bloque y cosecha;
8. correlacionar morfología con series ambientales.

Las noches frías pueden ayudar a mantener una banda apropiada para algunas cepas, pero también aumentar condensación y detener crecimiento si la temperatura cae por debajo de su tolerancia. El aislamiento y la calefacción se dimensionan después de medir la envolvente y definir la cepa.

# Pilot Design

## Fase 1 — Caracterización sin producto

- prueba de sensores y presión/altitud;
- mapa T/HR/CO₂ a tres alturas;
- caudal y velocidad de aire;
- respuesta a humidificación, extracción y apertura de puerta;
- identificación de condensación.

## Fase 2 — Carga simulada

- masa térmica e hídrica representativa;
- recuperación después de eventos;
- gradiente por rack;
- ajuste de impulsión y retorno.

## Fase 3 — Primer lote biológico

- una cepa y una formulación;
- unidades identificadas por posición;
- sin cambios simultáneos de varias variables principales;
- criterios de retención por contaminación;
- cosecha y BE documentadas;
- revisión antes de segundo lote.

## Fase 4 — Curva CO₂–morfología

Solo después de obtener un primer ciclo estable. Comparar bandas definidas por diseño experimental y mantener temperatura, HR, luz, formulación y densidad tan constantes como sea viable.

# Common Failure Modes

| Problema | Causas posibles | Intervención inicial reversible |
|---|---|---|
| Morfología elongada/coralina | CO₂, distribución de aire, luz, temperatura o cepa | Verificar sensores y mapa antes de aumentar extracción |
| Superficie seca | Flujo directo, baja HR, calentamiento o tiempo de puerta | Reorientar flujo y verificar ciclos |
| Condensación sobre producto | Superficie fría, niebla directa o baja evaporación | Separar descarga, medir punto de rocío y superficies |
| Desarrollo lento | Cepa, bloque inmaduro, temperatura, sustrato o spawn | Revisar trazabilidad y comparar posiciones |
| Variación por nivel | Cortocircuito de aire o gradiente térmico | Mapeo multipunto y ajuste físico |
| Contaminación | Proceso térmico, inoculación, exceso de suplemento o agua libre | Retener unidades y auditar trazabilidad |

# Open Questions

- ¿Qué cepa comercial trazable de *H. erinaceus* está disponible en Colombia?
- ¿Qué temperatura recomienda el proveedor para incubación, inducción y fructificación?
- ¿Qué curva CO₂–morfología produce esa cepa en la celda de Tenjo?
- ¿Qué velocidad de aire junto al producto evita zonas estancadas sin desecar?
- ¿Qué formulación regional ofrece rendimiento repetible con contaminación aceptable?
- ¿La sustitución parcial con paja, cascarilla, café o residuos agrícolas es viable bajo el tratamiento térmico disponible?
- ¿Qué vida útil real se alcanza a 4–5°C con el empaque y transporte disponibles?
- ¿Qué requisitos vigentes de INVIMA aplican a producto fresco, polvo, extracto y claims?

- Atila, F. (2019). Cultivation of *Hericium erinaceus* and *Lentinula edodes* on agro-industrial wastes and effect of environmental factors on yield and morphology. *Scientia Horticulturae*, 254, 185–194. [paper_024]
- Friedman, M. (2015). Chemistry, Nutrition, and Health-Promoting Properties of *Hericium erinaceus*. *Journal of Agricultural and Food Chemistry*, 63(32), 7108–7123. https://doi.org/10.1021/acs.jafc.5b02914
- Mori, K. et al. (2009). Improving effects of Yamabushitake on mild cognitive impairment: a double-blind placebo-controlled clinical trial. *Phytotherapy Research*, 23(3), 367–372. https://doi.org/10.1002/ptr.2634
- Tabi, A. N. M. et al. (2021). The effect of different fruiting temperatures on the yield and nutritional parameters of some wild and hybrid *Hericium* isolates. *Scientia Horticulturae*, 280, 109915. https://doi.org/10.1016/j.scienta.2021.109915
- Lu, Z. et al. (2024). Optimization of substrate formulation for *Hericium erinaceus* by replacing wood by straw and their effect on enzyme activities. *Frontiers in Plant Science*, 15, 1436385. https://doi.org/10.3389/fpls.2024.1436385
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Ver `../09_research/high_altitude_microclimate_shiitake_hericium_2026-08-05.md` para la auditoría de altitud, ventilación, sustratos y poscosecha.
