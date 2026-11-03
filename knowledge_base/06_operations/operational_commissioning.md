---
title: Operational Commissioning Protocol v0.1
document_id: DOC-OPS-COMM-001
category: operations
load_priority: selective
last_reviewed: 2026-11-03
confidence: medium
primary_sources:
  - SETAS_DE_LA_PENA_CANON.md
  - batch_tracking.md
  - quality_control.md
  - production_schedule.md
  - ../02_substrates/sterilization.md
  - ../09_research/commissioning_validation_research.md
related_documents:
  - batch_tracking.md
  - quality_control.md
  - production_schedule.md
  - ../02_substrates/sterilization.md
  - ../02_substrates/contamination.md
  - ../05_equipment/autoclaves.md
  - ../07_business/economics.md
  - ../09_research/commissioning_validation_research.md
---

# Purpose

This protocol defines the minimum commissioning program required before Setas de la Peña treats production capacity, thermal processing, substrate economics, formulation performance, or loss rates as validated operational knowledge.

It implements CANON principles **P-01 Verifiability over assumption**, **P-05 Measurement before optimization**, **P-08 Observation precedes intervention**, and the batch-based production philosophy.

This document is a **validation framework**, not a source of fixed biological setpoints. Values that have not been demonstrated locally remain hypotheses or planning inputs.

The research basis, transfer limits and external evidence supporting this protocol are maintained in `../09_research/commissioning_validation_research.md`. External literature does not itself create an operational setpoint.

# Scope

Commissioning is organized into five connected operational questions:

1. **Capacity / bottleneck** — What throughput can the current line sustain without hidden queues, space constraints or excessive operator load?
2. **Thermal validation** — Does a defined representative load receive a reproducible thermal process sufficient for the intended substrate/process specification?
3. **Full cost per bag** — What is the actual accumulated cost per inoculated block, productive block and sellable kilogram?
4. **Recipe performance** — Which shiitake substrate formulation performs best under controlled, traceable conditions?
5. **Loss / contamination map** — Where is value lost, and which causes are probable versus confirmed?

These questions share the same identifiers and production records. They must not be operated as five disconnected studies.

# Program order

| Phase | Validation target | Output |
|---|---|---|
| C0 | Instrumentation + traceability readiness | Reliable data capture |
| C1 | Capacity and bottleneck baseline | Sustainable throughput + space-time capacity model |
| C2 | Thermal process characterization and validation | Versioned thermal cycle for a defined load |
| C3 | Full-cost accounting | Variable and fully loaded COP/block and COP/kg sellable |
| C4 | Shiitake formulation comparison | Locally supported baseline formulation |
| C5 | Loss and contamination Pareto | Ranked loss mechanisms and corrective priorities |
| C6 | Second-species commissioning | Only after primary species gate is satisfied |

The initial species remains **Lentinula edodes (shiitake)**. A second species must not be promoted to normal production before the primary species satisfies the project’s existing multi-cycle validation gate.

# Evidence and authority

Use three distinct statuses:

- **Published evidence** — external research, standards or official technical guidance.
- **Design recommendation** — the project’s chosen way to structure measurement or analysis.
- **Validated local parameter** — a value demonstrated in the actual Setas de la Peña process and promoted through the applicable governance path.

Never present the first two as the third.

# C0 — Traceability and measurement readiness

## Identifier hierarchy

The existing `LOT_ID` remains the biological production lot assigned at inoculation. Commissioning adds identifiers for events before inoculation and for individual blocks.

### `PROCESS_BATCH_ID`

Assigned at substrate preparation, before inoculation.

Recommended format:

`PB-YYYY-MM-###`

Connects:

`raw material lots -> recipe version -> mixing/hydration -> bagging -> thermal cycle -> cooling -> production lot`

### `LOT_ID`

Retain existing format from `batch_tracking.md`:

`YYYY-MM-SPECIES-###`

### `BLOCK_ID`

Recommended format:

`LOT_ID-B###`

Example:

`2026-08-LE-001-B017`

Each block should be traceable to `PROCESS_BATCH_ID`, `thermal_cycle_id`, recipe version, spawn lot and physical position where relevant.

## Measurement-device records

Any instrument used for a commissioning decision should have:

- `device_id`
- sensor/probe type;
- measurement range where available;
- last verification/calibration date;
- reference device or method;
- observed offset/error;
- disposition (`accepted`, `restricted`, `rejected`).

A cycle is not considered well characterized if the decisive temperature measurement comes from an unidentified or unverified probe.

## Mandatory readiness checks

Before a dataset is considered valid for commissioning:

- balances used for formulation and harvest are verified;
- temperature probes used for thermal studies are identified and cross-checked;
- clocks/timestamps are synchronized sufficiently for event correlation;
- recipe version and ingredient lots are recorded;
- spawn identity and lot are recorded;
- thermal cycle records have unique IDs;
- operators and major deviations are recorded;
- wet/dry basis is explicit for substrate values;
- missing critical data are reported as missing, not imputed silently.

# C1 — Capacity and bottleneck baseline

## Process map

Measure the production path as actually executed:

`receiving -> weighing -> hydration -> mixing -> bagging -> thermal processing -> cooling -> inoculation -> incubation -> fruiting -> harvest -> postharvest`

For each active-processing stage record:

- `stage_start`
- `stage_end`
- `operator_minutes`
- `setup_clean_minutes`
- `kg_processed`
- `blocks_processed`
- `queue_wait_minutes`
- `equipment_id`
- `rework_minutes`
- `failure_count`
- `utility_constraint` when applicable.

For biological holding stages record:

- blocks entering;
- blocks exiting;
- occupied slots;
- entry date;
- exit date;
- `stage_duration_days`;
- losses while occupying the stage.

## Bottleneck types

Commissioning must distinguish:

- **throughput bottleneck** — limits units per batch or per active process period;
- **scheduling bottleneck** — limits how many batches can be completed over time;
- **resource bottleneck** — labor, heat source, utilities, racks, room space or operator attention;
- **biological occupancy bottleneck** — long residence time consumes incubation/fruition capacity even when active labor is low.

## Core calculations

**Observed throughput**

`completed_units / elapsed_process_time`

**Labor intensity**

`operator_minutes / completed_block`

**Stage utilization**

`equipment_busy_time / equipment_available_time`

**Observed weekly capacity**

Derived from validated cycle capacity and actual available cycles, not nameplate ratings.

**Space-time requirement**

For planning a stable stage:

`required_slots ≈ arrival_rate_blocks_per_day × mean_stage_duration_days`

Use local stage-duration data once available. Literature durations remain planning priors, not validated capacity inputs.

**System capacity**

The sustainable system throughput is constrained by the lowest effective capacity among dependent stages after accounting for setup, cleaning, queues, cooling, operator time, utility limits and biological occupancy.

## Commissioning method

Use multiple representative production days/cycles before declaring a stable bottleneck. A single unusually efficient or disrupted day is not sufficient.

Model proposed production rates only after baseline measurement. Scenario modeling supports investment decisions but does not itself validate capacity.

The current 60-bags/week planning target remains a target until this section is populated with field data.

## Capacity output

Commissioning should identify:

1. current limiting stage;
2. second-order limiting stage;
3. observed sustainable throughput range;
4. operator-minute requirement per block;
5. queue/wait contribution;
6. incubation/fruition slot requirement;
7. smallest intervention likely to increase throughput;
8. new bottleneck expected after that intervention.

# C2 — Thermal process qualification and validation

## Governing rule

A thermal cycle is **not validated merely because the equipment gauge reaches a target temperature or pressure**. Generic time recommendations from literature are starting references only.

Commissioning separates two technical questions that must not be conflated:

1. **Heat distribution** — is the thermal environment across the defined equipment/load configuration acceptably uniform and reproducible?
2. **Heat penetration** — how does the actual substrate inside the bags heat, and where is the slowest-heating product location?

## C2A — Heat-distribution study

Use `study_type = HEAT_DISTRIBUTION`.

Temperature sensors are positioned through the defined load/chamber environment, external to the substrate product, to characterize spatial and temporal temperature distribution.

Record:

- `thermal_study_id`
- `equipment_id`
- heat-source configuration;
- rack/container configuration;
- bag count or equivalent dummy load;
- load pattern/orientation;
- initial conditions;
- `sensor_id` and sensor position;
- chamber temperature series;
- pressure series when applicable;
- time to stable distribution;
- deviations.

Do not import FDA retort uniformity thresholds as Setas de la Peña acceptance limits. They inform methodology; the actual acceptance basis must be appropriate to the commissioned equipment and process.

## C2B — Product heat-penetration study

Use `study_type = HEAT_PENETRATION`.

The operational cycle must be tied to a defined:

- equipment configuration;
- bag type and dimensions;
- substrate formulation;
- substrate particle structure where relevant;
- initial moisture;
- wet mass per bag;
- number of bags;
- load arrangement;
- initial product temperature;
- heating source/configuration;
- process objective.

Changing any of these materially can invalidate direct transfer of a previous cycle.

## Thermal study record

Each study must record, when technically available:

- `thermal_study_id`
- `thermal_cycle_id`
- `study_type`
- `equipment_id`
- `process_batch_id`
- `recipe_version`
- `bag_count`
- `wet_mass_per_bag`
- `total_load_mass`
- `bag_dimensions`
- `load_arrangement`
- `initial_product_temperature`
- `ambient_temperature`
- `sensor_id`
- `probe_location`
- `chamber_temperature_series`
- `product_temperature_series`
- `pressure_series`
- `heat_start_time`
- `chamber_setpoint_reached_at`
- `distribution_ready_at`
- `product_target_reached_at`
- `hold_start`
- `hold_end`
- `cooldown_time`
- `fuel_or_energy_consumed`
- `operator`
- `deviations`.

## Probe placement and cold-spot logic

The purpose of internal probe placement is to identify the **slowest-heating product location**, not the most convenient measurement point.

The geometric center of a bag is a candidate location, not an assumption. Initial mapping should include multiple internal and load positions where technically feasible. The apparent cold spot should be confirmed across comparable loads before it is treated as established.

## Come-up time

The moment the equipment indicator first reaches a nominal temperature does not necessarily mark the start of an effective hold period for the whole load.

Record equipment come-up, distribution readiness and product heat penetration separately. Do not collapse them into one `sterilization_time` field.

## Acceptance logic

A process may advance from characterization to a candidate validated cycle only when:

1. equipment identity and safe operating configuration are confirmed;
2. the load configuration is explicitly defined and reproducible;
3. decisive instruments are sufficiently verified for the decision;
4. heat distribution has been characterized for the defined load/configuration;
5. the slowest-heating product zone/location has been investigated with appropriate probe placement;
6. time-temperature behavior at that location is recorded, not inferred from chamber conditions;
7. repeated representative runs show sufficient reproducibility for the intended decision;
8. no unexplained process deviation remains open;
9. downstream contamination/performance data are linked to the cycle;
10. the process objective and acceptance basis are documented.

No universal `2 h`, `3 h` or `4 h` rule is considered an approved Setas de la Peña cycle without this validation path.

## Equivalent lethality

Time-temperature data should be retained at sufficient resolution to permit equivalent-lethality analysis if a scientifically justified target organism, reference temperature and z-value are established.

An `F0`-style metric must **not** be adopted automatically as a mushroom-substrate pass/fail criterion. In other thermal-processing fields F0 is tied to a defined microbial target and thermal-resistance model. Setas de la Peña has not yet validated that microbiological basis for its substrate.

## Biological indicators

Biological indicators for moist-heat sterilization may be used as an additional equipment/process evidence channel during commissioning. They do not replace heat-distribution, heat-penetration, bag-integrity, contamination and crop-performance evidence, and health-care sterilization standards are not automatically cultivation standards.

## Uninoculated sentinel controls

During commissioning, retain sealed uninoculated processed bags where practical. These can help separate process/bag-integrity problems from contamination introduced during inoculation or later handling.

A contaminated sentinel does not by itself identify the root cause; it narrows the likely origin to stages before inoculation.

## Altitude and pressure

At Tenjo altitude, ambient pressure differs materially from sea level. Therefore:

- record the actual instrument type and whether pressure is gauge or absolute;
- do not infer product temperature from an unverified pressure assumption;
- treat product temperature measurement and instrument verification as decisive evidence;
- do not alter a pressure setpoint solely from altitude intuition without equipment-specific verification.

## Current equipment note

The manufacturer specification for the non-electric All American `1941X` lists **41 qt / 39 L**, not 44 L. Vessel liters do not establish bag capacity. Actual Setas de la Peña bags/cycle and the corresponding thermal behavior remain commissioning measurements.

## Matriz de demostración Go / No-Go — 1941X y shiitake

**Procedencia:** requisitos aportados por Sebastián el 2026-11-03, incorporados como plan de demostración. Los valores numéricos sin respaldo específico para esta carga son **no verificados**, con confianza local baja; no son mediciones ni un ciclo aprobado. Esta matriz complementa C0–C2 y `quality_control.md`; no sustituye seguridad del fabricante ni DEC-019. No se han recibido certificados, curvas ni resultados de estos ensayos.

| ID / requisito | Evidencia objetiva por reunir | Criterio de cierre y límite de transferencia | Estado documental al incorporar |
|---|---|---|---|
| G1 — Seguridad mecánica y manometría | Identificación de componentes; manual aplicable al serial; certificado de calibración con error, incertidumbre y corrección; informe técnico de integridad y aptitud; registro presión/temperatura | Error corregido o instrumento sustituido y aceptado. La propuesta de ensayo a **19–20 psig** y estabilidad a **19,0 psig durante 90 min** requiere previamente rango y tolerancias aprobados por fabricante/servicio competente. No demuestra por sí sola temperatura de producto ni esterilidad. | **Pendiente — No-Go** |
| G2 — Penetración térmica (`t_lag`, letalidad e indicadores) | Series continuas de cámara y producto; mapeo de posiciones, núcleo de bolsas de mayor masa/densidad prevista y punto frío investigado; indicadores de *Geobacillus stearothermophilus* vinculados a ciclo/posición | Meta candidata actualizada por la ficha PQ-1: **F₀ ≥15,0 min en el punto frío en 3 corridas consecutivas** de la misma configuración y **100% de indicadores procesados negativos**, con controles válidos. Antes del cierre se exige justificar organismo objetivo, resistencia térmica, referencia, z, carga inicial y reducción requerida. No usar F₀≥15 como aprobación automática del sustrato; la meta anterior de 12 min queda como antecedente, no como alternativa de aprobación. | **Pendiente — No-Go** |
| G3 — Integridad de bolsa y asepsia (PQ-2 A/B) | Controles A sellados sin inocular y B abiertos/resellados sin spawn; registros individuales, bolsa/filtro/sello, ciclo, manipulación y temperatura de observación | Meta de ensayo aportada: **0/n contaminados en A y 0/n en B**, tras **15–21 días a 23 °C**. Fijar antes de ejecutar n, duración exacta dentro de esa ventana, tolerancia térmica y frecuencia de lectura; cerrar solo tras completar la duración elegida. Condiciones candidatas, no setpoint del cultivo. | **Pendiente — No-Go** |
| G4 — Pureza y vigor del spawn (PQ-2 C) | Muestra trazable del lote de spawn en PDA, blanco de medio/manipulación, fotos fechadas, temperatura y evolución; identidad o declaración del proveedor sobre uso en sustrato sintético | Meta aportada: ausencia de bacterias/mohos acompañantes detectables y **salto micelial <5 días**, con definición observable y condiciones de ensayo fijadas previamente. PDA no demuestra identidad genética ni adaptación productiva. DEC-019 conserva la excepción de cepa no identificada para lote 1; exige trazabilidad y caracterización, sin habilitar escala comercial. | **Pendiente — No-Go** |
| G5 — Rol y tamaño de lote | Comparar rol del 1941X para spawn o bloques; bloques/ciclo validado, ciclos/semana factibles, enfriamiento, trabajo, ocupación, merma, costo/kg vendible y demanda Bogotá | Si el piloto planificado **supera 30 bloques/semana**, exigir validación de una alternativa de mayor volumen antes de comprometer capital de trabajo comercial. Es una compuerta de planificación solicitada, no capacidad demostrada ni autorización de compra; aplicar además C1, C3 y el análisis de cuello de botella de `autoclaves.md`. | **Pendiente — No-Go comercial** |

### G1 — Condiciones previas del ensayo mecánico

La frase de entrada «19,0 psig = 121,1 °C en Tenjo» queda **sin demostrar**: registrar presión ambiente absoluta, presión corregida, purga y temperatura medida; la presión de cámara no sustituye temperatura de núcleo. Tampoco se acepta «válvula de 23 psig» como identificación del componente instalado. El manual oficial consultado describe dispositivos distintos; verificar pieza y revisión aplicable con el fabricante antes de evaluar un supuesto disparo prematuro.

La calibración debe informar puntos de lectura, correcciones e incertidumbre en el rango del ensayo, criterio de aceptación y responsable. La inspección determina si corresponde prueba hidrostática o de vapor: no son pruebas intercambiables. Cualquier prueba de integridad queda a cargo de servicio competente, con procedimiento autorizado y aprobación humana; esta matriz no autoriza al cuidador a presurizar ni a alterar válvulas. Una anomalía mecánica mantiene G1 abierto e impide ensayos presurizados posteriores.

### G2 — Registro térmico e indicadores

- Congelar la configuración de carga descrita en C2B; incluir peor masa, densidad, humedad, geometría y posición. Investigar el punto frío; no presumir que coincide con el centro geométrico o con la bolsa más pesada.
- Conservar archivos crudos con unidades, timestamps, intervalo de muestreo aprobado, identificación/calibración de sondas y huecos de datos. Definir `t_lag = product_target_reached_at − chamber_setpoint_reached_at`, con objetivo térmico explícito y ambos eventos registrados; no confundirlo con hold.
- Para cualquier cálculo de letalidad conservar `T_ref`, `z`, modelo/método de integración, intervalo integrado y justificación microbiológica. Sin esa base, reportar caracterización térmica y mantener la meta F₀ pendiente.
- Registrar fabricante/modelo/lote/caducidad, resistencia declarada y posición de cada indicador. Procesados negativos solo son interpretables con control positivo no procesado del mismo lote que muestre crecimiento y lectura/incubación según instrucciones del indicador; **23 °C y 15–21 días de A/B no se transfieren a los indicadores**.
- La serie exige tres corridas consecutivas aceptables de una configuración estable, sin omitir fallos. Una corrida fallida o inválida interrumpe la serie; investigar y documentar la corrección antes de reiniciarla. Cambios materiales requieren evaluar recalificación.

### PQ-1 — Ficha candidata de tres corridas

**Estado: borrador de calificación, no ejecutado / No-Go.** Fuente: segunda tabla del propietario del 2026-11-03. Sustituye la meta candidata F₀≥12 por **F₀≥15,0 min**; no aporta resultados ni justificación microbiológica del nuevo umbral. Los demás umbrales de esta ficha son requisitos propuestos por el propietario, **no verificados localmente**, sujetos a aprobación del protocolo y compatibilidad con instrumentos/indicadores. Las celdas `—` significan pendiente, nunca resultado negativo o aprobado.

| Indicador / métrica | Ubicación | Corrida 1 | Corrida 2 | Corrida 3 | Criterio candidato de aceptación PQ-1 |
|---|---|---|---|---|---|
| Diferencial de vapor saturado `ΔT = T_sat(P_abs) − T_DL1` | Cámara baja, DL-1 | — | — | — | Durante toda la meseta: `T_DL1 ≥120,1 °C` y `abs(ΔT) ≤1,0 °C`; registrar mínimo/máximo y cobertura de datos. Véase precisión de signo abajo. |
| Retardo térmico máximo `max(t_lag_DL2, t_lag_DL3)` | Producto, DL-2 y DL-3 | — | — | — | Documentado en cada corrida; rango máximo−mínimo entre las tres corridas ≤10 min, interpretación conservadora de «±10 min» sujeta a aprobación previa. |
| Minuto de meseta en que ambas sondas acumulan F₀≥15,0 min | `min(F₀_DL2(t), F₀_DL3(t))` | — | — | — | Primer cruce del mínimo acumulado; informa un límite térmico candidato, no libera ni fija por sí solo duración operacional. |
| Integradores químicos Clase 5, B1 / B2 / B3 | Centro geométrico de cada bloque, ubicación candidata | — / — / — | — / — / — | — / — / — | Resultado Pass conforme a IFU en **9 de 9 tiras**, con rango/ciclo de uso compatible. |
| IB-1, *G. stearothermophilus* | Centro de B1 | — | — | — | Negativo al completar lectura válida en las tres corridas; propuesta: 48 h a 57 °C, púrpura sin turbidez, solo si corresponde a la IFU. |
| IB-2, *G. stearothermophilus* | Centro de B3 | — | — | — | Mismo criterio que IB-1; conservar la correspondencia IB-2 → B3. |
| IB-3, *G. stearothermophilus* | Centro de B2 | — | — | — | Mismo criterio que IB-1; conservar la correspondencia IB-3 → B2. |
| IB-4, control positivo sin procesar | Incubadora, mismo lote que IB-1–3 | — | — | — | Positivo obligatorio en cada corrida; propuesta: viraje amarillo/turbio en **<24 h**, dentro de observación de 48 h a 57 °C, sujeto a IFU. Registrar hora real de primera lectura positiva. |

**Definiciones y condiciones para interpretar la ficha:**

1. **Mapa:** vincular DL-1/2/3 e IB-1/2/3/4 con ID de dispositivo, calibración, bloque, profundidad/posición y foto de carga. B1/B2/B3 no significan solo tres bolsas totales: documentar la carga completa. Las ubicaciones centrales son candidatas; si el mapeo identifica otro punto frío, adaptar la instrumentación y revisar el protocolo antes de calificar. No extrapolar la ficha a una carga de cuatro bolsas sin demostrar representatividad.
2. **Vapor y meseta:** calcular `P_abs = P_manométrica_corregida + P_ambiente_absoluta`, en unidades coherentes, usando una tabla/formulación de saturación identificada. No fijar `T_teórica =121,1 °C` por suposición. El requisito original `ΔT≤1,0` era unilateral y admitía diferencias negativas arbitrarias; se propone **magnitud ≤1,0 °C** para cerrar esa ambigüedad, pendiente de aprobación previa. No demuestra ausencia de aire ni calidad de vapor por sí solo. Definir inicio/fin de meseta, banda superior, estabilidad, tolerancias, muestreo y tratamiento de incertidumbre antes del ensayo; no recortar a posteriori segmentos fallidos para aprobar. Huecos o incertidumbre que impidan demostrar el criterio mantienen No-Go.
3. **Retardo:** usar el mismo objetivo térmico declarado para producto y cámara, con eventos sincronizados conforme a G2. Calcular primero el retardo de cada sonda y después su máximo; no tomar el máximo de temperaturas. La frase «entre corridas ±10 min» no especifica referencia: ±10 alrededor de una referencia permitiría extremos separados por 20 min. Esta ficha propone la interpretación más restrictiva **rango máximo−mínimo de los tres retardos máximos ≤10 min**, sin referencia elegida a posteriori. Informar mínimo, máximo y rango; aprobar esta definición antes de ejecutar la serie. Mientras no esté aprobada, el criterio sigue pendiente.
4. **Letalidad:** declarar referencia, z y método de integración antes de calcular; F₀ convencional usa `T_ref=121,1 °C` y `z=10 °C`, lo que no prueba que ese modelo ni 15 min satisfagan el objetivo microbiológico del sustrato. Para esta ficha, acumular desde el inicio de meseta declarado (sin crédito previo) y registrar, por sonda, el primer tiempo que alcanza 15,0 min. El tiempo de la fila es el **más tardío de esos dos cruces**, equivalente al primer cruce del mínimo de ambas curvas acumuladas, no la menor lectura de temperatura instantánea. Si alguna no alcanza el umbral, registrar «no alcanzado». Para proponer un tiempo común de ciclo usar la corrida más lenta, margen justificado y nueva verificación cuando corresponda; no acortar ciclos automáticamente desde esta tabla.
5. **Indicadores:** registrar modelo, lote, caducidad, IFU y compatibilidad con el proceso tanto de Clase 5 como de IB. Las condiciones 48 h / 57 °C, colores y control positivo <24 h no se transfieren entre marcas; si la IFU difiere, revisar y aprobar la ficha antes de ejecutar. No declarar negativos antes de completar el tiempo de lectura requerido, ni prolongar un control ya positivo si la IFU indica retirarlo. Un control positivo que no cumple su criterio hace la corrida inválida y rompe la serie, aunque los IB procesados parezcan negativos. El viraje químico no sustituye evidencia biológica ni penetración.
6. **Registro y cierre:** por corrida conservar fecha, operador, versión/configuración, `thermal_cycle_id`, datos crudos, presiones, meseta, retardos, cálculo reproducible de letalidad, fotos de las tres tiras, resultados/horas de los cuatro IB e incubadora verificada. Son **9 tiras y 9 IB procesados más 3 controles positivos** en la serie completa, sin reutilizarlos. PQ-1 solo puede declararse conforme con G1 cerrado, fundamento microbiológico y protocolo aprobados, tres corridas consecutivas válidas y todos los criterios satisfechos. Su conformidad alimenta G2; no cierra PQ-2, G3/G4 ni autoriza producción o ventas.

**Apoyo metodológico, sin validación del sustrato:** [NISTIR 5078, propiedades agua/vapor](https://www.nist.gov/srd/nistir-5078) (Tier 1, referencia técnica pública) para la relación de saturación; [STERIGENE, valor esterilizante](https://www.sterigene.com/en/equipements-process/sterilisation-decontamination/valeur-sterilisatrice) (Tier 2, proveedor técnico) para la definición convencional de F₀; [EZTest Biological Indicator-Steam, IFU](https://www.hmark.com/wp-content/uploads/2022/02/Biological-Indicator-Steam-IFU-2022-02-24.pdf) (Tier 2, fabricante) como ejemplo de condiciones y lectura específicas de producto, **no identificación del material disponible en Tenjo**. Consultados 2026-11-03. La procedencia de los umbrales estrictos sigue siendo la tabla del propietario.

### PQ-2 — Controles A, B y C

`PQ-2` identifica aquí el ensayo de integridad/asepsia y spawn solicitado; la ficha PQ-1 precedente sigue sin ejecutar ni aprobar. Antes de comenzar, Sebastián debe aprobar una ficha versionada con n por grupo/corrida, selección y distribución de muestras, método, condiciones y criterios de lectura. **Sin tamaño de muestra definido no hay cierre.** Los controles se dimensionan aparte de las cuatro bolsas productivas del microlote; no se descuenta material ni se aumenta carga térmica sin documentarlo y evaluar su representatividad.

| Grupo | Exposición que se registra | Alcance de interpretación |
|---|---|---|
| A | Sustrato procesado, enfriado y conservado sellado, sin spawn | Una contaminación orienta a proceso, bolsa, sello, enfriamiento o almacenamiento; no identifica una causa única. |
| B | Misma base que A, abierta y resellada en el entorno/procedimiento previsto de inoculación, sin spawn; registrar duración y operador | Comparar con A permite investigar aporte de manipulación; no atribuir causalidad por un único bloque. |
| C | Muestra del spawn del lote previsto en PDA y blanco sin spawn, bajo método aséptico documentado | Registrar crecimiento y contaminantes detectables. El blanco debe permanecer sin crecimiento; un resultado negativo no certifica pureza absoluta ni adaptación a fructificación. |

Registrar por unidad fecha/hora inicial y final, lecturas/fotos, contaminación detectada, incidencias y disposición. Informar `contaminados / evaluables` por separado de `planificados`, `perdidos` y `pendientes`; **0/0, registros ausentes, controles inválidos o unidades perdidas sin resolver mantienen No-Go**. No excluir una unidad contaminada para obtener 0%. `0/n` describe únicamente las unidades y condiciones observadas, no riesgo poblacional cero.

### Ficha de cierre y secuencia de liberación

Para cada G1–G5 completar este registro; los espacios vacíos no equivalen a aprobación:

```text
gate_id / versión de protocolo / alcance (piloto o comercial):
responsable de reunir evidencia / revisor:
equipo y configuración / PROCESS_BATCH_ID / thermal_cycle_id / spawn_lot:
archivos de evidencia / certificados / unidades evaluadas / fechas:
criterio versionado y fundamento / resultados / desviaciones abiertas:
dictamen: PENDIENTE | NO CONFORME | CONFORME
decisión humana: RETENER | AUTORIZAR alcance definido
responsable de autorización / fecha / restricciones / revisión por cambio:
```

Secuencia: **G1 antes de ensayos presurizados → G2 y PQ-2 con protocolo aprobado → revisión G1–G4 antes de liberar inoculación productiva**, además de las otras compuertas de calidad. Los controles de commissioning pertenecen al ensayo autorizado y no son producción liberada. G5 se resuelve antes de comprometer escala/capital comercial; no bloquea por sí sola una caracterización de menor escala autorizada. Ningún Go parcial libera producción ni ventas, y resolver estos cinco requisitos tampoco sustituye las demás compuertas de cultivo/calidad.

### Fuentes y confianza de la matriz

- **Requisitos del propietario, 2026-11-03:** fuente de las metas 19–20 psig/90 min, F₀≥12 en el primer aporte y F₀≥15,0 en la ficha PQ-1 posterior (meta candidata vigente), tres corridas, A/B 15–21 días a 23 °C, C <5 días y >30 bloques/semana. **No verificados localmente**; sin certificados o resultados adjuntos. No atribuirlos a literatura ni a medición de campo.
- **Tier 2 — fabricante:** [All American, instrucciones modelos 1915X/1925X/1941X](https://www.allamerican-chefsdesign.com/admin/FileUploads/product_43.pdf), pp. 2 y 6–7, consultado 2026-11-03. Respalda consulta de altitud, manómetro y dispositivos de seguridad; la revisión debe cotejarse con el equipo físico. No valida la carga de sustrato ni un hold de 90 min.
- **Tier 1 — guía de agencia pública:** [CDC, Sterilizing Practices](https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/sterilizing-practices.html) y [Steam Sterilization](https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/steam-sterilization.html), consultados 2026-11-03. Sustentan el canal de indicadores de *G. stearothermophilus*, control positivo y verificación repetida; transferencia **metodológica desde salud**, no validación del umbral F₀ candidato ni de esterilidad del sustrato local.
- **Decisión vigente:** [DEC-019](../DECISIONS.md#dec-019--lote-1-de-shiitake-con-cepa-no-identificada-riesgo-aceptado), excepción limitada al primer piloto; no sustituida por esta matriz.

# C3 — Full cost per block and sellable kilogram

## Cost hierarchy

Each `PROCESS_BATCH_ID` / `LOT_ID` should accumulate costs in separable categories.

### Materials

- substrate ingredients;
- water where economically relevant;
- bags/filters/ties;
- labels;
- spawn;
- inbound transport attributable to the material.

### Processing

- propane or other thermal energy;
- electricity;
- sanitation consumables;
- water for cleaning/process;
- external services;
- maintenance attributable to usage.

### Labor

Record operator minutes by stage before applying an hourly labor rate.

### Fixed / allocated costs

For fully loaded cost, allocate where appropriate:

- equipment depreciation or capital recovery;
- facility/room occupancy;
- fixed maintenance;
- fixed labor/overhead.

Keep the allocation method explicit and versioned.

### Losses

A discarded unit retains the cost accumulated up to the moment of loss. Loss cost is a diagnostic allocation for root-cause and Pareto analysis.

If total lot cost is already divided by sellable kilograms, those losses are already embedded in unit cost. Do **not** add `cost_accumulated_at_loss` again to total cost unless the accounting model has explicitly removed those costs elsewhere.

## Required KPIs

**Cost per prepared kg**

`total preparation cost / kg wet substrate prepared`

**Cost per inoculated block**

`cost accumulated through inoculation / blocks inoculated`

**Cash variable cost per sellable kg**

`variable attributable cost / kg sellable product`

**Fully loaded cost per sellable kg**

`all attributable + allocated cost / kg sellable product`

**Cost per productive block**

`total attributable lot cost / blocks reaching productive stage`

**Diagnostic cost of loss**

`sum(cost accumulated at each loss event)`

The commercial comparison between recipes should prioritize `COP/kg sellable`, while retaining BE and biological metrics separately.

# C4 — Shiitake formulation comparison

## Sequence

Do not begin with a broad multi-species matrix. Establish a primary-species baseline first.

Initial design families may be:

- `R-A` — conservative/baseline formulation;
- `R-B` — local/economic formulation candidate;
- `R-C` — higher-performance experimental candidate.

The exact recipes are governed elsewhere and must be versioned before the experiment begins.

## Variables to hold constant where possible

Published shiitake work shows interactions among genotype, substrate, maturation/spawn-run time, moisture, block weight and filter porosity. Therefore hold constant or explicitly model:

- strain/spawn source and lot;
- spawn rate;
- bag geometry and target wet mass;
- substrate moisture basis;
- filter type/porosity;
- thermal process version;
- inoculation method;
- incubation environment;
- maturation criterion/time;
- fruiting environment;
- harvest criteria.

If a variable cannot be held constant, record it and incorporate it into interpretation.

## Experimental unit and pseudoreplication

If one recipe is mixed as one bulk preparation, the **independent experimental unit for the recipe treatment is the independently prepared `PROCESS_BATCH_ID`**. Individual bags from that same bulk mix are subsamples sharing preparation-level variation.

Analysis hierarchy:

`recipe treatment -> independent process batch -> individual blocks -> repeated harvest events`

Do not treat 30 bags from one bulk mix as `n = 30` independent recipe replications.

## Randomization and blocking

Where practical:

- replicate recipe treatments across independent preparation/thermal batches;
- randomize recipe run order;
- use production round/date as a blocking factor when appropriate;
- randomize or model rack/chamber position;
- keep spawn lot constant within a comparison block where possible.

## Sample size

Do not fix a universal bag count per recipe as the scientific sample size. Use the first well-controlled pilot to estimate between-process-batch and within-batch variance, then set independent batch replication based on the decision precision/power required.

Extra bags within a process batch improve measurement precision for that batch but do not replace independent process-batch replication.

## Minimum outcomes

Per block / lot, retain:

- days to defined colonization milestone;
- days to first harvest;
- contamination event and timing;
- yield by flush;
- cumulative fresh yield;
- biological efficiency using one documented denominator definition;
- premium/standard/discard mass;
- total sellable mass;
- total cycle duration;
- `sellable_kg_per_slot_day`;
- `operator_min_per_sellable_kg`;
- `COP/kg_sellable`;
- environmental deviations;
- loss/failure events.

No recipe is promoted solely because it has the highest BE. Speed, space occupancy, contamination, quality, labor and economic cost are part of the decision.

# C5 — Loss and contamination map

## Event taxonomy

Use stage-coded failure events rather than a single contaminated/not-contaminated field.

| Prefix | Stage |
|---|---|
| `MAT` | Raw material / receiving |
| `MIX` | Mixing / hydration |
| `BAG` | Bagging / sealing |
| `THM` | Thermal processing |
| `COO` | Cooling / post-process hold |
| `INO` | Inoculation |
| `INC` | Incubation / maturation |
| `CON` | Contamination observation |
| `FRU` | Fruiting |
| `HAR` | Harvest |
| `POS` | Postharvest |

Example codes:

- `BAG-SEAL-FAIL`
- `THM-CYCLE-DEVIATION`
- `CON-EARLY-MOLD`
- `INC-SLOW`
- `FRU-MORPHOLOGY-CO2-SUSPECTED`
- `POS-DEHYDRATION`

## Detection is not origin

A contamination event observed during incubation may originate in raw material, thermal treatment, cooling, bag integrity, inoculation or later handling. Detection timing alone is not proof of origin.

Record separately:

- `detected_stage`
- `suspected_origin_stage`
- `confirmed_origin_stage`.

## Loss event fields

- `loss_event_id`
- `block_id`
- `lot_id`
- `process_batch_id`
- `thermal_cycle_id` where relevant;
- `detected_at`
- `detected_stage`
- `failure_code`
- `severity`
- `suspected_origin_stage`
- `confirmed_origin_stage`
- `probable_cause`
- `confirmed_cause`
- `evidence_reference`
- `mass_lost`
- `cost_accumulated_at_loss`
- `corrective_action`.

`probable_cause` and `confirmed_cause` must remain separate. An observed association is not promoted to confirmed causality without supporting evidence.

## Avoid duplicate loss accounting

A single originating failure may create multiple downstream observations. Preserve the event chain, but designate a primary economic-loss event or explicit parent/child relationships so the same block cost is not counted repeatedly.

## Pareto review

At defined review intervals calculate both:

- event frequency by failure code;
- economic loss by failure code/origin stage.

The highest-frequency failure is not necessarily the most expensive failure. Corrective priorities should consider both.

# Core commissioning dashboard

Keep the primary operations dashboard compact.

| KPI | Operational question |
|---|---|
| Blocks completed / week | What is actual throughput? |
| Required / occupied slot-days | Is biological space becoming the bottleneck? |
| Operator min / block | How labor-intensive is production? |
| Thermal equipment utilization | Is thermal processing the current bottleneck? |
| COP / inoculated block | What does it cost to enter incubation? |
| Cash variable COP / sellable kg | What is the marginal operating cost? |
| Fully loaded COP / sellable kg | What does production cost long-run? |
| Contamination rate | What fraction of inoculated blocks is lost? |
| Diagnostic COP lost | Where is economic value being destroyed? |
| Days to first harvest | How long is capital/space occupied? |
| BE | How productive is the formulation biologically? |
| Premium/sellable kg per lot | How much commercially useful product is produced? |

# Setas OS minimum data model

The implementation should support linked entities rather than one oversized lot record.

## `measurement_devices`

`device_id`, type, location, verification/calibration state, offset, evidence.

## `process_batches`

`process_batch_id`, recipe version, ingredient lots, dry/wet mass, moisture, operator, timestamps.

## `thermal_studies`

`thermal_study_id`, study type, sensor positions, time-series references, load definition, conclusion and evidence state.

## `thermal_cycles`

`thermal_cycle_id`, process batch, equipment, approved load definition, time-series references, energy/fuel, deviations, validation state.

## `production_lots`

`lot_id`, species, strain, spawn lot, process batch, inoculation data, module, status.

## `blocks`

`block_id`, lot, position, mass, status, transitions, harvest totals.

## `harvest_events`

block/lot, flush number, timestamp, fresh mass, grade, sellable mass, discard.

## `loss_events`

stage detected, suspected/confirmed origin, failure code, probable/confirmed cause, evidence, mass and accumulated cost.

## `cost_events`

entity reference, stage, cost category, quantity, unit cost, total cost, evidence state, allocation method when applicable.

This structure allows Setas OS to answer questions such as:

- Which recipe × thermal cycle combination has the lowest COP/kg sellable?
- Are particular thermal configurations associated with early contamination?
- Which stage constrains a proposed increase in throughput?
- How many incubation slots are required by the observed cycle duration?
- Which failure code accounts for the largest share of money lost?
- Does a lower-BE formulation produce a lower total cost or higher sellable kg/slot-day?

# Promotion gates

Commissioning measurements become operational standards only after the applicable project decision/promotion path is satisfied.

Do not promote:

- a single successful thermal run into a permanent cycle;
- chamber temperature alone into proof of substrate thermal adequacy;
- a generic literature time into a thermal schedule;
- an F0 target without a defined microbiological basis;
- a single high-BE process batch into a standard recipe;
- bags within one bulk mix into independent recipe replications;
- a correlation into a confirmed failure cause;
- theoretical capacity into scheduled production cadence;
- a literature value into a local acceptance threshold without project validation.

# Open questions for field validation

1. What load geometry produces the slowest chamber region in the commissioned thermal equipment?
2. What internal bag location and load position produce the slowest product heating?
3. What level of run-to-run thermal variability is observed under nominally identical loads?
4. What process-adequacy criterion is scientifically appropriate for the intended substrate/process objective?
5. What throughput is sustainable when sanitation, cooling, operator availability and biological occupancy are included?
6. Which cost category dominates `COP/kg sellable` at pilot scale?
7. Which failure mechanisms dominate by frequency and by money lost?
8. What is the between-process-batch variance for the first shiitake recipe trials?
9. How many independent preparation/thermal replicates are required for useful recipe decisions?

# Status

**v0.1 — research-informed commissioning framework.** The schema, measurements and gates are approved as a data-capture and validation design. Numerical acceptance thresholds, thermal process parameters, recipe winners, sample sizes and scaling limits remain pending local validation and/or explicit promotion through the project governance path.
