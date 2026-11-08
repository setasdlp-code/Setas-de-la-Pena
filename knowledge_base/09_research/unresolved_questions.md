---
title: Preguntas Abiertas y Áreas de Investigación
document_id: DOC-0045
category: research
load_priority: on_request
last_reviewed: 2026-11-08
confidence: high
primary_sources:
  - Internal records
  - literature_audit_2026-07-23.md
  - facility_adaptation_literature_2026-08-03.md
  - high_altitude_microclimate_shiitake_hericium_2026-08-05.md
related_documents:
  - jerky_setas_procesamiento_2026-11-05.md
  - calidad_poscosecha_economia_shiitake_2026-11-04.md
  - literature_database.md
  - literature_audit_2026-07-23.md
  - facility_adaptation_literature_2026-08-03.md
  - high_altitude_microclimate_shiitake_hericium_2026-08-05.md
  - ../04_facility/marranera_medium_scale_design_basis.md
  - ../01_species/lentinula_edodes.md
  - ../01_species/hericium_erinaceus.md
  - ../CURRENT_OPERATIONS.md
  - research_validation_audit_2026-08-29.md
  - colombia_mushroom_market_synthesis_2026-11-03.md
  - factibilidad_shiitake_tenjo_evaluacion_2026-11-03.md
  - genetica_sustratos_shiitake_2026-11-04/informe.md
---

# Executive Summary

Registro de decisiones todavía abiertas. La prioridad biológica inmediata es habilitar un primer lote trazable de shiitake. En infraestructura, la prioridad es levantar y comisionar una celda interior representativa antes de replicar una instalación de escala media.

La auditoría de microclima de alta altitud añadió tres límites: no existe una corrección universal de ACH para 2.600 m, la distribución de CO₂ no se resuelve con una regla fija de extracción baja y los parámetros publicados para *Hericium erinaceus* no justifican un umbral universal de 1.000 ppm.

La auditoría documental de pendientes del 2026-08-29 confirmó que SH01–SH06 siguen abiertos por ausencia de ejecución de campo; ver `research_validation_audit_2026-08-29.md` para la matriz de promoción.

# Bloqueadores del lote 1 — Shiitake

| ID | Pregunta | Evidencia requerida | Estado |
|---|---|---|---|
| SH01 | ¿Qué proveedor, cepa, lote y clase térmica tendrá el spawn? | Ficha del proveedor y trazabilidad de compra | Bloqueante |
| SH02 | ¿La cepa es de temperatura baja, media o alta y qué inducción recomienda? | Identidad de cepa y documentación técnica | Bloqueante |
| SH03 | ¿Qué formulación única se usará en el lote 1? | Receta aprobada con base húmeda/seca explícita | Bloqueante |
| SH04 | ¿Cuál es el criterio de madurez antes de inducción? | Ficha de cepa más indicadores visuales documentados | Bloqueante |
| SH05 | ¿Qué ciclo de autoclave funciona con la carga representativa? | Comisionamiento, registro y validación del ciclo | Bloqueante |
| SH06 | ¿Cuál es el perfil real de temperatura/HR de incubación y fructificación en Tenjo? | Serie de sensores con ubicación y calibración registradas | Alta |
| SH07 | ¿Se necesita choque frío o basta la fluctuación natural? | Respuesta de la cepa en piloto instrumentado | Alta |
| SH08 | ¿Qué definición se usará para rendimiento y BE? | Fórmula canónica y masa seca inicial registrada | Alta |
| SH09 | ¿Qué relación CO₂–morfología presenta la cepa bajo el caudal real de la cámara? | Serie de CO₂, caudal, posición y fotografías | Alta antes de escalar |
| SH10 | ¿Qué pH real dan 1 % Ca(OH)₂ frente a 1 % CaCO₃ en la mezcla de pellets + salvado, antes y después del autoclave, y cuál coloniza mejor? | pH medido con método registrado; comparación exploratoria 2 + 2 (DOC-0130) | Alta |
| SH11 | ¿Es el retamo espinoso (*Ulex europaeus*) compatible con shiitake, y en qué proporción de leño? | Análisis N/C del chip leñoso (CERESA/CAR); placa con extracto; microensayo exploratorio (DOC-0129). Requisitos CAR para Tenjo sin confirmar (2026-11-06) | Baja (fuera del piloto) |
| SH12 | ¿Siecha, Nutrisetas o Los Fungis entregan spawn en grano estéril o bloques colonizados de *L. edodes* con código de cepa y lote? | Respuesta escrita al cuestionario Q-01 a Q-06 (DOC-0135) | Alta (no bloquea el lote 1) |
| SH13 | ¿Cuál es el precio B2B, el mínimo de pedido y el plazo de cada candidato para 5, 15 y 30 kg de spawn? | Cotización con fecha | Media |
| SH14 | ¿Se puede ampliar o rediseñar el lote de 30 bloques para comparar un segundo proveedor sin perder el control del piloto? | Decisión del propietario sobre tamaño y capacidad del autoclave de 39 L | Media |
| SH15 | ¿Qué requisitos, costo y plazo tiene importar micelio de *L. edodes* al país? | Respuesta de Cuarentena Vegetal del ICA; texto y vigencia de las resoluciones citadas | Baja (solo si fallan los nacionales) |

## Evidencia consultiva para SH01–SH04/SH07/SH08 — 2026-11-05

Véase `genetica_sustratos_shiitake_2026-11-04/informe.md` (DOC-0140), especialmente §§4–6, y su bibliografía. Mantener abiertas las validaciones de campo: DEC-019 permite identidad desconocida para lote 1, sin eliminar lote/recepción; una comparación de proveedores con genética y matriz diferentes estima material comercial, no genética pura. SH08 cuenta con la aclaración documental de Cenicafé sobre bolsas productivas frente a todas las sembradas, pero la definición que empleará el proyecto todavía requiere aprobación y masa seca registrada. Los tamaños de ensayo y criterios de retención del informe son propuestas, no liberaciones.

# Alta altitud y balance gaseoso

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| ALT01 | ¿Cuál es la presión barométrica real de la finca y su variación diaria/estacional? | Sensor barométrico verificado o estación cercana con localizador | Alta |
| ALT02 | ¿Qué presión o altitud está configurada en cada SCD30? | Inventario de firmware, configuración y fecha | Alta |
| ALT03 | ¿Cuál es el caudal volumétrico efectivo con ductos, filtros y compuertas instalados? | Medición de caudal y presión estática | Bloqueante para expresar ACH |
| ALT04 | ¿Cuánto CO₂ generan los bloques por kg, especie y fase? | Ensayo con masa conocida y balance de concentración | Alta |
| ALT05 | ¿La corrección teórica de caudal por presión describe la respuesta real de la celda? | Comparación entre cálculo, caudal y recuperación de CO₂ | Alta |
| ALT06 | ¿Existen gradientes de CO₂ entre niveles, racks y esquinas? | Mapeo simultáneo o rotación controlada de sensores | Alta |
| ALT07 | ¿La menor presión parcial de O₂ afecta crecimiento o morfología bajo las condiciones del proyecto? | Diseño comparativo o evidencia primaria directamente comparable | Investigación; no asumir |

La estimación de atmósfera estándar a 2.600 m produce una relación volumétrica cercana a 1,37 frente a nivel del mar a igual temperatura y transporte molar. No se cierra ALT05 aplicando ese factor a una tabla externa; requiere carga y caudal medidos.

# Hericium erinaceus — piloto futuro

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| HE01 | ¿Qué cepa, lote y procedencia tendrá el spawn de *H. erinaceus*? | Ficha y trazabilidad de proveedor | Bloqueante para piloto |
| HE02 | ¿Qué temperatura recomienda la cepa para incubación, inducción y fructificación? | Documentación de cepa y piloto a bandas definidas | Alta |
| HE03 | ¿Qué curva CO₂–morfología se observa en la celda de Tenjo? | Fotografías normalizadas, serie CO₂ y comparación controlada | Alta antes de escala |
| HE04 | ¿Qué velocidad de aire junto al carpóforo evita zonas estancadas sin desecar? | Anemometría, pérdida de masa y morfología | Alta |
| HE05 | ¿Qué rango de HR evita desecación y agua libre bajo esa velocidad de aire? | T/HR, superficie, condensación y peso | Alta |
| HE06 | ¿Qué formulación regional produce BE repetible y contaminación aceptable? | Ensayo con control, base seca y réplicas | Media |
| HE07 | ¿La sustitución parcial de madera con paja, cascarilla o residuos locales es viable? | Piloto comparativo y análisis de proceso | Media |
| HE08 | ¿Qué vida útil real se logra a 4–5°C con el empaque y transporte disponibles? | Ensayo de calidad y microbiología | Alta antes de venta |
| HE09 | ¿Tolera *H. erinaceus* el retamo espinoso (*Ulex europaeus*), rico en fenólicos? Sin evidencia publicada; riesgo juzgado mayor que en shiitake (DOC-0129, 2026-11-06) | Placa con decocción de retamo 0/1/5/10 %; bolsas solo si la placa no inhibe y SH11 T1/T2 salen limpios | Baja (fuera del piloto) |

No usar `<1.000 ppm`, `18–22°C`, `14–21 días`, `2–3 flushes` o una BE esperada como especificación hasta resolver HE01–HE05 con la cepa adquirida.

# Marranera — base física y capacidad

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| M01 | ¿Cuáles son dimensiones, materiales, espesores y patologías as-built? | Levantamiento métrico, fotografías y mapa de materiales | Bloqueante para obra |
| M02 | ¿Qué comportamiento térmico e higrométrico tiene la marranera vacía? | Mínimo dos semanas de T/HR multipunto; exterior, bajo cubierta, piso y techo | Alta |
| M03 | ¿Dónde y cuándo aparece condensación? | Temperaturas superficiales, punto de rocío y registro en amanecer/lluvia | Alta |
| M04 | ¿Qué nivel de infiltración producen cubierta, puertas y penetraciones? | Prueba de humo y, si es viable, prueba cuantitativa de estanqueidad | Alta |
| M05 | ¿Qué carga soportan cubierta, placa y estructuras existentes? | Evaluación estructural y estado de corrosión | Bloqueante para equipos/recintos |
| M06 | ¿Cuál es la capacidad semanal objetivo a 1, 3 y 5 años? | Modelo de demanda, masa y mano de obra | Bloqueante para dimensionar salas |
| M07 | ¿Cuántos lotes y etapas coexistirán? | Cronograma por especie/cepa y duración real | Alta |
| M08 | ¿Qué área debe reservarse para contingencia y celda fuera de servicio? | Modelo de continuidad operacional | Media |

# Envolvente y celdas interiores

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| E01 | ¿Qué solución de panel, juntas y puertas resiste alta HR y limpieza? | Fichas técnicas, muestra y prueba de lavado/sellado | Alta |
| E02 | ¿Dónde debe ubicarse la barrera de aire/vapor? | Cálculo higrotérmico para Tenjo y condiciones interiores | Alta |
| E03 | ¿Qué aislamiento minimiza costo total sin perder volumen útil? | Comparación térmica, sanitaria, de incendio y mantenimiento | Alta |
| E04 | ¿La marranera funciona como amortiguador suficiente para reducir especificación de celdas? | Medición exterior/bajo cubierta/dentro de prototipo | Media |
| E05 | ¿Qué dimensión de celda es replicable y limpiable con la mano de obra disponible? | Prototipo a escala real y recorrido de operación | Alta |

# Carga térmica y energía

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| T01 | ¿Cuál es la carga por transmisión de cada celda? | U-values verificados, áreas y temperaturas de diseño | Alta |
| T02 | ¿Cuál es la carga de infiltración y ventilación real? | Caudales medidos y condiciones exterior/interior | Alta |
| T03 | ¿Cuánto calor producen bolsas locales por kg y etapa? | Ensayo con carga representativa y sensores internos | Alta |
| T04 | ¿Qué equipos y personas aportan carga sensible/latente? | Inventario de potencia y horario | Media |
| T05 | ¿Qué horas permiten ventilación directa para enfriamiento gratuito? | Serie exterior/interior, CO₂, HR y punto de rocío | Alta |
| T06 | ¿Cuándo conviene recuperación de calor? | Modelo y ensayo comparativo de energía | Media |
| T07 | ¿Qué nivel de fuga o transferencia cruzada tiene el recuperador? | Prueba de estanqueidad y partículas/esporas | Bloqueante para retorno energético |
| T08 | ¿Se justifica geotermia o intercambio con agua? | Perfil térmico de suelo/agua, geotecnia, higiene y retorno económico | Baja/Fase 2 |
| T09 | ¿Qué actuadores deben ser inverter o modulantes? | Curvas de carga y costo de ciclo de vida | Media |

# Aire, racks y uniformidad

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| AER01 | ¿Qué geometría de rack permite acceso, limpieza y circulación? | Mock-up y prueba de operación | Alta |
| AER02 | ¿Dónde se ubican impulsión y retorno para evitar cortocircuito? | Humo, anemometría y mapa multipunto | Alta |
| AER03 | ¿Qué velocidad de aire acepta la cepa junto al producto? | Piloto con morfología y pérdida de agua | Alta antes de réplica |
| AER04 | ¿La inversión periódica del flujo mejora uniformidad? | Comparación A/B en celda instrumentada | Media |
| AER05 | ¿Cuántos sensores representan el campo después de caracterizarlo? | Campaña inicial densa y análisis de redundancia | Media |
| AER06 | ¿Qué caudal y filtración mantienen el laboratorio protegido? | Medición de presión, partículas y operación de puertas | Alta |
| AER07 | ¿Dónde descargar aire de fructificación para evitar reingreso? | Estudio de vientos, tomas y rutas de personas | Alta |
| AER08 | ¿Una impulsión superior difusa y retorno bajo mejora la distribución sin secar producto? | Comparación física con configuración alternativa | Hipótesis alta |
| AER09 | ¿El sensor de control representa la zona del producto y no el chorro o retorno? | Comparación simultánea entre sensor de control y referencias | Alta |

# Agua, drenaje y limpieza

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| W01 | ¿Calidad microbiológica y fisicoquímica del agua? | Análisis de laboratorio | Alta |
| W02 | ¿Caudal, presión y reserva disponibles? | Prueba y plano hidráulico | Alta |
| W03 | ¿Qué pendientes reales tiene la placa? | Levantamiento altimétrico | Alta |
| W04 | ¿Dónde descargan aguas de limpieza, proceso y condensado? | Plano sanitario y consulta normativa | Alta |
| W05 | ¿Cómo se limpian sifones y registros sin cruzar zonas limpias? | Detalle de drenaje y simulación de mantenimiento | Media |
| W06 | ¿Qué zonas deben permanecer secas y sin drenaje abierto? | Matriz de higiene y proceso | Alta |

# Seguridad ocupacional, esporas y plagas

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| S01 | ¿Qué concentración de bioaerosoles aparece en fructificación y cosecha? | Evaluación ocupacional o muestreo especializado | Alta antes de escala |
| S02 | ¿Qué estrategia de cosecha limita esporulación excesiva? | Criterio de calidad y observación por cepa | Alta |
| S03 | ¿Qué respirador y protocolo requiere cada tarea? | Evaluación de riesgo y ajuste con profesional SST | Alta |
| S04 | ¿Qué limpieza evita aerosolizar residuos? | Ensayo de procedimiento y verificación | Alta |
| S05 | ¿Qué insectos ingresan y por dónde? | Monitoreo de trampas y mapa de penetraciones | Media |
| S06 | ¿Qué malla controla la plaga sin impedir el caudal? | Identificación de plaga y curva de caída de presión | Media |
| S07 | ¿Dónde ubicar esclusas y puertas de cierre automático? | Flujo de personas/materiales y prueba de humo | Alta |

# Regulación y diseño higiénico

| ID | Pregunta | Evidencia requerida | Prioridad |
|---|---|---|---|
| R01 | ¿Qué alcance de la Resolución 2674 aplica al producto fresco y a procesos futuros? | Consulta vigente con INVIMA/asesoría sanitaria | Alta |
| R02 | ¿Qué requisitos locales aplican a vertimientos, agua, obra y energía? | Consulta municipal y autoridades competentes | Alta |
| R03 | ¿Qué separación requiere cosecha/empaque frente a producción primaria? | Revisión normativa y flujo de producto | Alta |
| R04 | ¿Qué requisitos adicionales aplican a deshidratación, polvo o extractos? | Revisión regulatoria específica antes de diseñar | Media/Fase futura |
| R05 | ¿Qué documentos prueban origen legal de cada residuo forestal? | Factura, especie, proveedor, movilización y autoridad aplicable | Alta antes de compra |

# Infraestructura y control del piloto actual

| ID | Pregunta | Prioridad | Estado |
|---|---|---|---|
| I01 | ¿Cuál es modelo, capacidad nominal y estado de placa del autoclave en sitio? | Alta | Verificación física pendiente |
| I02 | ¿Capacidad eléctrica y protecciones soportan autoclave, cámara y automatización? | Alta | Verificación técnica pendiente |
| I03 | ¿Dónde se ubicarán sensores de referencia y cómo se hará la comprobación cruzada? | Alta | Diseño pendiente |
| I04 | ¿Qué pin GPIO corresponde al relay del ESP32 ACEIRMC específico? | Media | Verificar con ficha y multímetro |
| I05 | ¿Se requiere sensor de fuga de agua cerca de electrónica? | Media | Evaluación de riesgo |
| I06 | ¿CLOUDLAB y/o Martha Tent serán cámaras separadas para incubación y fructificación? | Media | Decisión de layout |
| I07 | ¿Se añadirá presión barométrica local al registro ambiental y a la compensación del SCD30? | Alta | Diseño pendiente |

El autoclave está físicamente en el sitio, pero no ha sido comisionado ni validado. La tarea correcta es identificar y validar el equipo existente.

# Abastecimiento y mercado

| ID | Pregunta | Prioridad | Estado |
|---|---|---|---|
| AB01 | ¿Disponibilidad, precio y trazabilidad de spawn shiitake en Colombia? | Alta | Contactar proveedores |
| AB02 | ¿Disponibilidad, especie, origen legal y especificación de aserrín de madera dura? | Alta | Cotizar, documentar y muestrear |
| AB03 | ¿Disponibilidad de bolsas PP aptas para el ciclo validado? | Alta | Cotizar y verificar especificación |
| AB04 | ¿Qué lote, especificación y frecuencia de shiitake aceptan compradores alcanzables? | Media | Menús identificados en la síntesis 2026-11-03; cantidades y recompra siguen sin verificar |
| AB05 | ¿Cadena fría disponible y vida útil real por especie y empaque? | Alta | Diseño consultivo DOC-0136 §§3–4: temperatura del producto bajo carga, calidad y plan microbiológico profesional separados; ensayo local pendiente |
| AB06 | ¿Costo por kg de cada celda y etapa a escala media? | Alta antes de réplica | Modelo después del piloto |
| AB07 | ¿Qué aserraderos/carpinterías entregan residuo sin MDF, pinturas, preservantes o mezcla desconocida? | Alta | Auditoría de proveedor y muestra |
| AB08 | ¿El bagazo cervecero puede recibirse con humedad y estabilidad compatibles con el proceso? | Media | Caracterización, logística y piloto |
| AB09 | ¿La cascarilla de arroz disponible es limpia, homogénea y útil como aireante? | Media | Muestra y ensayo de bloque |
| AB10 | ¿El pélet de «acacia» comercial (Mandra, Mercado Libre) es *Acacia mangium* pura de fuste, sin corteza ni arrastre, y es compatible con shiitake? | Alta | Confirmación escrita del proveedor. Revisión del 2026-11-07 (`../../docs/research/acacia_nogal_shiitake_research_2026-11-07.md`): sigue sin evidencia publicada de *L. edodes* en *A. mangium*; solo *Pleurotus*. Microensayo con control de madera probada y sustitución 0/30/50/100 % tras la ficha del fabricante |
| AB11 | ¿*Acacia decurrens* (acacia sabanera) sirve para shiitake, o sus taninos de corteza la descartan? | Media | Conflicto entre `deep_research_synthesis_2026.md` y DOC-0130; requiere ensayo. La literatura no lo resuelve (2026-11-07): sin datos de shiitake en *A. decurrens*, *A. melanoxylon* ni *A. mearnsii*; los 30–40 % de taninos son de corteza y no hay cifras para leño descortezado. Solo ensayar leño descortezado e identificado (se confunde con *A. mearnsii*) |
| AB12 | ¿Qué precio neto, costos de entrega, rechazo y recompra permiten cumplir DEC-020? | Alta antes de oferta | Cotizaciones fechadas e historial pagado; listados públicos no resuelven el margen |
| AB13 | ¿Qué prospectos del reporte de factibilidad compran shiitake fresco, en qué plato, a qué precio neto y plazo? | Alta antes de comprometer volumen | Entrevista fechada y soporte; lista externa sin contactos/ventas confirmados (DOC-0133 F05/F06) |
| AB14 | ¿Costo y rendimiento vendible de bloque precolonizado frente al microlote interno? | Media, alternativa | Cotización puesta en Tenjo, trazabilidad, prueba propia y ficha de economics.md (DOC-0133 F07) |
| AB15 | ¿Tarifa efectiva y kWh por etapa/kg vendible del módulo real? | Alta antes de presupuestar escala | Factura, medidor y asignación trazable; 20–24 kWh/día externos no verificados (DOC-0133 F03) |
| AB16 | ¿Trámite sanitario/ICA por actividad y destino, y condiciones de agua/descarga del predio? | Alta antes de comercializar | Respuesta oficial/radicado y conexión real; Res. ICA 115708 no aplica a vegetales (DOC-0133 F02) |
| AB17 | ¿Qué actividad de agua (aw) y humedad final alcanza un jerky flexible de melena o shiitake hecho en la finca, y qué vida útil sostiene sin refrigeración? | Baja (fuera de DEC-022) | Medición de aw por lote y ensayo de almacenamiento; sin ella, solo refrigerado 1–2 semanas (DOC-0138) |
| AB18 | ¿Qué ruta INVIMA y qué rotulado aplican a un snack de setas marinado y deshidratado? | Baja hasta abrir la opción C de DEC-022 | Consulta oficial; no hereda la excepción del fresco entero ni la ruta del deshidratado de un solo ingrediente |
| AB19 | ¿El protocolo de jerky de *P. ostreatus* transfiere a *P. eryngii* (tallo denso) y en qué grosor y tiempo? | Baja | Prueba culinaria propia; DOC-0138 no cubre eryngii |
| AB20 | ¿Sirve el aserrín de «nogal» para shiitake: *Cordia alliodora* (nogal cafetero) o *Juglans* (*J. neotropica*), con juglona y extractivos antifúngicos? | Baja | Sin ensayos publicados con *L. edodes* (2026-11-07, `../../docs/research/acacia_nogal_shiitake_research_2026-11-07.md`). Extensión de EE. UU. advierte contra nogal en troncos sin datos; un pariente de *Cordia* tiene duramen antifúngico. Placa con albura y duramen por separado al 0/5/10/25 %; bolsas ≤20–30 % solo si no inhibe |

Los municipios mencionados en investigación externa son zonas de prospección, no un mapa confirmado de proveedores. Para AB04/AB12 y el contexto de R01/R04, ver `09_research/colombia_mushroom_market_synthesis_2026-11-03.md`; sus listados y lectura normativa no cierran esas preguntas ni verifican un registro sanitario individual.

La evaluación `09_research/factibilidad_shiitake_tenjo_evaluacion_2026-11-03.md` sustenta AB13–AB16; el reporte externo no convierte prospectos en compradores ni autoriza cifras operativas.

# Investigación futura — Pleurotus djamor

| ID | Pregunta | Estado |
|---|---|---|
| PD01 | ¿Qué cepa comercial trazable está disponible en Colombia? | Pendiente; no bloquea el lote 1 |
| PD02 | ¿Qué formulación local ofrece mejor rendimiento y menor contaminación? | Requiere piloto comparativo |
| PD03 | ¿Qué curva CO₂–morfología se observa con el caudal real de la cámara? | Literatura insuficiente/conflictiva |
| PD04 | ¿Cuál es la vida útil en la cadena fría disponible? | Requiere prueba local |
| PD05 | ¿Cómo afecta la altitud de 2.600 m a colonización y fructificación? | No se identificó estudio directamente comparable |
| PD06 | ¿Existe una vía segura para valorizar sustrato agotado? | Separar de producción alimentaria y analizar riesgos |

# Otras especies y líneas futuras

| ID | Pregunta | Prioridad |
|---|---|---|
| F01 | ¿Condiciones y costo de calefacción para *G. lucidum*? | Baja, Fase 3 |
| F02 | ¿Viabilidad regulatoria de productos funcionales o medicinales? | Media antes de cualquier claim |
| F03 | ¿Capacidad real de Home Assistant/ESP32 bajo la arquitectura final? | Baja; validar en campo |
| F04 | ¿Cuándo existe suficiente información para control predictivo MPC/PINN? | Después de varios ciclos estables |

# Método de resolución

1. **Dato de campo:** medir con instrumentos identificados y registrar contexto.
2. **Investigación:** localizar fuente primaria o documentación institucional.
3. **Piloto controlado:** cambiar una variable principal y usar réplicas cuando sea viable.
4. **Consulta externa:** proveedor, INVIMA, autoridad ambiental, técnico eléctrico, SST, sanitario o estructural.
5. **Decisión documentada:** transferir el resultado al documento canónico y al changelog; no cerrar una pregunta por consenso informal.

# Criterio de cierre

Una pregunta se cierra únicamente cuando existe:

- evidencia o medición adjunta;
- responsable y fecha;
- definición de la decisión;
- actualización del documento afectado;
- identificación de cualquier límite de extrapolación.


## Evidencia consultiva añadida — 2026-11-04

`09_research/calidad_poscosecha_economia_shiitake_2026-11-04.md` desarrolla AB05 (frío/vida útil), AB06 (ocupación y costo por etapa) y AB12 (kg vendidos, contribución, recompra y caja). Incluye diseño de simulacro de trazabilidad/retiro y diez escenarios económicos ilustrativos; no cierra estas preguntas. Sus conflictos documentales de umbrales requieren decisión humana. Para seco gobierna DEC-022: no ensayar antes de tres ciclos cerrados ni activar producto sin sus cuatro condiciones.

## Evidencia consultiva añadida — 2026-11-05

`09_research/jerky_setas_procesamiento_2026-11-05.md` (DOC-0138) sintetiza un informe externo sobre jerky de shiitake, melena de león y orellana: variables de proceso, rangos culinarios Tier 3, conservación conservadora (refrigerado 1–2 semanas) y diagnóstico de fallas. Abre AB17–AB19; no cierra preguntas ni modifica DEC-022.
