---
title: Changelog — Knowledge Base Setas de la Peña
document_id: DOC-0047
category: meta
load_priority: selective
version_format: YYYY-MM-DD | TYPE | Description
last_reviewed: 2026-08-03
---

# CHANGELOG

Registro cronológico de cambios significativos a la knowledge base, equipos, SOPs, especies activas y arquitectura del sistema. No registra eventos de producción individuales (esos van en batch logs). Registra cambios que afectan cómo opera el proyecto.

**Tipos de entrada:**
- `[ARCH]` — Cambio de arquitectura o documento estructural
- `[EQUIP]` — Adición, retiro o reconfiguración de equipo
- `[SOP]` — Nuevo SOP o modificación de procedimiento existente
- `[SPECIES]` — Cambio de estado de especie (activar, retirar, agregar)
- `[DECISION]` — Decisión operacional mayor (ver también DECISIONS.md)
- `[KB]` — Adición o modificación de documento en knowledge base
- `[BIZ]` — Cambio de proveedor, precio, cliente, o condición de mercado

---

## 2026

### 2026-08-29

| Tipo | Descripción |
|---|---|
| `[KB]` | Añadida la auditoría de validación de investigación pendiente (`09_research/research_validation_audit_2026-08-29.md`, `DOC-0107`). La revisión documental confirma que las fichas pueden orientar investigación, pero no cerrar transferencia operacional: con 0 lotes activos siguen bloqueantes spawn trazable, formulación control, comisionamiento térmico y datos de cámara. Se señala además la contradicción entre la clasificación comercial que pone orellana primero y la prioridad vigente de arranque en shiitake; sin cambios a DEC-013, SOPs, CANON o setpoints. |
| `[KB]` | Consolidado el conocimiento de los informes semanales del 31 de julio y 3, 14 y 28 de agosto en `09_research/weekly_reports_knowledge_synthesis_2026-08-29.md` (`DOC-0105`) y promovidas cuatro entradas de investigación asesora (`ARK-026`–`ARK-029`) sobre formulación contextual, sustitución local de sustrato, línea base poscosecha y separación entre secado/polvo/extracto. Sin cambios a SOPs, CANON ni parámetros operativos. |
| `[KB]` | Añadido `04_facility/caseta_compacta_structural_handoff.md` (`DOC-0104`), ficha de entrega para evaluación estructural de la placa de terraza bajo la caseta compacta (DOC-0103). Consolida carga muerta (paneles recuperados, techo, forro) y carga viva (2× CLOUDLAB 844, humidificador T7, ocupación) en un rango estimado de ~750–1,150 kg (~95–150 kg/m² sobre ~7.9 m²), con el peso de bloques de sustrato marcado explícitamente como supuesto no validado (`FARM_BRAIN.md` registra 0 kg/mes de capacidad validada). No determina capacidad de la losa — es insumo para el ingeniero, no un cálculo estructural. Confianza `LOW`. |
| `[DECISION]` | Visita estructural realizada: **aprobada** la placa de terraza para la huella propuesta de la caseta compacta (~1.86 × 4.24 m). Resultado registrado como pass/fail en `DOC-0104` — carga admisible en kg/m², líneas estructurales preferentes y puntos de anclaje exactos aún no se registraron como cifras numéricas; queda como seguimiento en DOC-0104 §7. Ya no es un bloqueante para el checklist de construcción (`DOC-0103`). |
| `[KB]` | Confirmadas dimensiones de las mantas isotérmicas doradas/plateadas (`MAT-INS-THERMAL-BLANKET-001`, `metadata/materials.yaml`): 210×160 cm, 67 g, poliéster aluminizado, según ficha de producto. Con esta medida, las 6 unidades cubren exactamente las 3 posiciones de muro restantes tras Mylar en el plan de aislamiento de la caseta compacta (2 mantas por posición, orientadas 1.60 m vertical / 2.10 m horizontal, traslape ~40 cm). Las 6 posiciones de muro quedan cubiertas con material 100% en inventario, sin necesidad de comprar más lámina reflectiva. Actualizado `caseta_compacta_build_checklist.md` (DOC-0103) y el canvas de diseño (`ZoneCrossSection.dc.html`). |
| `[KB]` | Corregida la cantidad de rollos de manta EVA a comprar para la caseta compacta: **4 rollos, no 3**. El cálculo original solo consideraba área plana (~26.8 m² / 9.3 m²/rollo ≈ 3); el rollo de 110 cm de ancho no cubre el ancho de 1.86 m de una posición de muro en una sola tira, así que el corte real (tira completa + tira angosta + traslape de costura) consume ≈27.8 m², dejando 3 rollos sin margen para cortes, desperdicio de esquina o recorte alrededor de los listones de bloqueo. 4 rollos dan ~34% de margen. Actualizado `caseta_compacta_build_checklist.md` (DOC-0103) y `ZoneCrossSection.dc.html`. |
| `[KB]` | Especificadas las dos aberturas del buffer de la caseta compacta, antes un único ítem sin decidir. **Puerta exterior** (terraza → buffer): abre hacia afuera (el buffer solo tiene 0.8 m de fondo), ~0.80×2.00 m, marco de listón 38×63 mm + cara de tablero PVC 5–6 mm, bisagras exteriores, burlete, pestillo con llave/candado, umbral sellado — construida con material nuevo, no con la pieza de repuesto del panel 7. **Abertura interior** (buffer → cámara): cortina de tiras de PVC (no puerta con bisagra) — sin necesidad de espacio de giro, se pasa con las manos ocupadas, lavable, barrera parcial de aire/humedad. Actualizado `caseta_compacta_build_checklist.md` (DOC-0103) y `Main.dc.html`. |
| `[KB]` | Especificado el sistema de techo de la caseta compacta y su unión con el muro, corrigiendo un vacío de diseño: la descripción previa ("marco liviano + lona") omitía la cubierta rígida que `home_rnd_lab.md` (DOC-0020) exige explícitamente — la lona es piel secundaria, nunca la cubierta estructural. Añadida teja de PVC ondulada sobre cabios 38×89 mm como cubierta rígida real; la lona Toolcraft queda como piel secundaria sobre la teja, con cámara ventilada natural por el perfil ondulado. Especificado el tapajuntas en el borde superior del muro (bajo el borde de la teja) para el punto de falla ya advertido en DOC-0020 (agua escurriendo por la cara del panel). Nota de carga menor (~50–100 kg, cabios + teja) registrada para trazabilidad en `caseta_compacta_structural_handoff.md` (DOC-0104) — dentro del margen ya aprobado, no reabre la evaluación estructural. Actualizado `caseta_compacta_build_checklist.md` (DOC-0103) y `ZoneCrossSection.dc.html`. |
| `[KB]` | Confirmados proveedores en Bogotá para el tablero PVC espumado del forro interior de la caseta compacta (búsqueda web, 2026-08-29): Línea Gráfica SA (PVC Board 1.22×2.44 m, calibres 3/5/10 mm, entrega 24 h hábiles), Acento Suministros & Proyectos (Av Rojas Cra 70 #79a-19), Portelli SAS, y listados equivalentes en MercadoLibre (mismo canal ya usado para Thermolon/Mylar/mantas). El tamaño de hoja 1.22×2.44 m usado en el cálculo de ~10 hojas queda **confirmado**, no supuesto. Precio final por hoja sigue sin cotizar (una referencia sin proveedor específico menciona ~$90.000 COP para calibre 6mm, sin verificar). Confianza subida de MEDIA-BAJA a MEDIA-ALTA para disponibilidad. Actualizado `caseta_compacta_build_checklist.md` (DOC-0103). |
| `[KB]` | Avanzados los últimos cinco ítems pendientes del checklist de la caseta compacta (DOC-0103). **Drenaje de condensado:** el condensado del techo ya queda resuelto por el diseño de cubierta (cae dentro de la cámara ventilada); el condensado del piso de la cámara sigue sin resolver — solo 2 tapetes de caucho (0.5 m²) en inventario frente a ~7.9 m² de huella, y bloqueado por la ubicación aún no confirmada del desagüe existente de la terraza. **Ruta eléctrica:** un solo circuito con RCD/GFCI, cableado por el encuentro muro-piso evitando la capa reflectiva y los listones de bloqueo, caja de conexión y ESP32 en el buffer (menor HR). **Ruta de transferencia:** mapeada como secuencia única (garaje → escalera → puerta exterior → EPP → cortina PVC → cámara), sin decisiones nuevas — encadena especificaciones ya hechas. **Holgura de puerta CLOUDLAB:** la puerta es cremallera de tela, sin holgura frontal publicada por el fabricante; el pasillo de 1.0 m supera la guía general de la comunidad de cultivo pero queda como prueba física pendiente, no cifra verificada. **Ubicación exacta en la terraza:** marcada explícitamente como medición física pendiente, no especificación — la orientación de la caseta depende de la posición de la chimenea (aún sin medir), que también determina el sentido de la pendiente del techo. Actualizado `caseta_compacta_build_checklist.md` (DOC-0103). |
| `[KB]` | Añadido `04_facility/caseta_compacta_site_visit_checklist.md` (`DOC-0105`), consolidando en un solo documento de campo todas las mediciones físicas, pesajes y llamadas de seguimiento pendientes reunidos desde `DOC-0103` y `DOC-0104`: geometría de chimenea y retícula de piso, despeje de baranda, ubicación del desagüe existente, peso real de una pieza de panel y de cada CLOUDLAB 844, dimensión real de largueros para el listón de bloqueo, prueba física de holgura de puerta CLOUDLAB, seguimiento con el ingeniero estructural por las cinco cifras específicas aún pendientes, y cotización final del tablero PVC. Organizado por qué llevar, qué medir y qué documento actualiza cada resultado — no registra datos medidos, solo referencia el destino de cada uno. Referenciado desde `caseta_compacta_build_checklist.md` (DOC-0103). |
| `[DECISION]` | Seguimiento con el ingeniero estructural: **resuelta** una de las cinco cifras pendientes de `DOC-0104` §7 — no hay líneas estructurales específicas (vigas/muros/columnas) requeridas para alinear el perímetro de la caseta compacta; toda el área de la huella (~1.66×4.24 m) está adecuadamente soportada. Esto resuelve uno de los cuatro criterios de ubicación en `DOC-0103` (el criterio estructural); el criterio de la chimenea sigue pendiente de medición en sitio (`DOC-0105`), quedando como el único criterio abierto para fijar la ubicación exacta. Las otras cuatro cifras de DOC-0104 §7 (carga admisible en kg/m², base de reparto, puntos de anclaje, confirmación del rango estimado) siguen sin registrar. |
| `[KB]` | Especificado el tratamiento de la cara exterior del panel para la caseta compacta, cerrando un vacío de diseño: se había especificado el forro interior (PVC/epóxico) pero nunca el lado expuesto al clima. Cara exterior: barniz exterior/marino o sellador impermeabilizante para madera exterior, no barniz de interior (no resiste UV/lluvia de Bogotá a largo plazo). Bordes de corte (las 14 líneas de empalme): sellar la veta expuesta y el interior de la cavidad con el mismo barniz exterior **antes** de instalar el herraje de bloqueo, no después — la veta de corte absorbe humedad más rápido que el resto del panel y es justo donde va el herraje que después no se puede inspeccionar; incorporado a la secuencia de la especificación de bloqueo en `DOC-0103`. Cara interior no requiere barniz, ya cubierta por el forro. |
| `[KB]` | Añadida imprimación previa al tratamiento de la cara exterior del panel (`DOC-0103`): sellador tapaporos, o el mismo barniz exterior diluido ~10–20%, antes de las manos a fuerza completa, con lijado suave entre capas. El MDF/OSB del panel absorbe de forma despareja sin esto — la veta de corte en particular puede hincharse o "afelpar" al primer contacto con líquido. Prioridad más alta en los 14 bordes de corte (misma secuencia ya especificada, ahora con el paso de imprimación explícito); recomendado también, con menor urgencia, en las caras planas exteriores.  |
| `[KB]` | Añadido `04_facility/caseta_compacta_shopping_list.md` (`DOC-0106`), consolidando en una sola lista de compras todo lo que hay que comprar para la caseta compacta — nada de lo listado está en inventario. Organizado por tipo de proveedor (ferretería, PVC/plásticos, pinturas/sellantes, techo, piso/drenaje, eléctrico), con cantidades estimadas y un resumen de prioridad de compra: lo que se puede comprar ya sin bloqueo, lo que falta cotizar (tablero PVC), lo que falta confirmar en cantidad exacta (teja de techo, forro de piso — dependen de resultados de `DOC-0105`), y lo que falta verificar en especificación (listón de bloqueo, 38×63 mm es el mínimo asumido). Referenciado desde `caseta_compacta_build_checklist.md` (DOC-0103). |
| `[DECISION]` | **Desviación documentada de `home_rnd_lab.md` (DOC-0020)**, decisión del propietario 2026-08-29: la caseta compacta usará **lona uso rudo como cobertura exterior única de techo y muros**, retirando la teja de PVC ondulada especificada anteriormente como cubierta rígida. DOC-0020 establece explícitamente que una lona nunca debe ser la cubierta estructural/única — esta desviación se documenta aquí en vez de aplicarse en silencio; DOC-0020 no se modifica y sigue rigiendo la caseta completa de tres zonas, esta decisión aplica solo a la caseta compacta (`DOC-0103`). La lona uso rudo no está registrada en `metadata/materials.yaml` ni `consumables.yaml` — es compra pendiente, no un material ya adquirido pese a la consulta inicial. Consecuencias registradas: (1) riesgo de encharcamiento sube sin cubierta rígida, requiere tensión adecuada; (2) ya no hay cámara de aire para condensación de techo — nuevo punto abierto, vigilar goteo en cara inferior de la lona; (3) peso de techo baja (~15–30 kg vs. ~50–100 kg estimado antes), muros suben levemente (~9–15 kg) — ambos dentro del margen ya aprobado en `DOC-0104`, sin ameritar nueva visita. El barniz exterior de los paneles se mantiene sin cambios — la lona es capa adicional, no sustituto del sellado de madera. Actualizados `DOC-0103`, `DOC-0104`, `DOC-0106` y el canvas de diseño (`ZoneCrossSection.dc.html`). |
| `[KB]` | **Corrección de identidad de material y refuerzo de cita de autoridad, 2026-08-29.** "Lona uso rudo" no era un material nuevo distinto — es la misma **Lona Impermeable Gris Reforzada Toolcraft 5×7m** ya referenciada en DOC-0020 y en `DECISIONS.md` línea 434 (*"La lona Toolcraft 5×7m es una segunda piel de cubierta; no reemplaza la envolvente rígida"* — cita de autoridad más fuerte que la usada en la entrada anterior, una decisión formal registrada, no solo un principio de diseño). El propietario confirmó tenerla en propiedad; **añadida a `metadata/materials.yaml`** como `MAT-TARP-TOOLCRAFT-001` (180 g/m², HDPE, tejido 14×14 hilos/pulgada², ojillos de aluminio, refuerzos remachados, doble costura — especificaciones de ficha de producto). También corregido `MAT-PANEL-RECOVERED-SET-001` (cantidad y dimensiones de los 14 paneles, antes sin confirmar pese a estar establecidas en el diseño desde hace varios turnos). Con el peso real (180 g/m², no el ~300–500 g/m² genérico asumido antes), la lámina completa de 35 m² pesa solo ~6.3 kg — mucho más liviana de lo estimado, reduce aún más la nota de carga de `DOC-0104`. **Cobertura parcial confirmada:** una sola lámina (35 m²) cubre techo (~7.9 m²) + los 6 muros de la cámara principal (~26.78 m²) ≈ 34.68 m², dejando solo ~0.3 m² de margen — el muro del lado de la puerta del buffer queda excluido por decisión del propietario, cubierto con un material aún sin definir. Actualizados `DOC-0103`, `DOC-0104`, `DOC-0106`, `metadata/materials.yaml` y el canvas de diseño. |
| `[KB]` | Resuelto el material de cobertura del muro del lado de la puerta (buffer), único punto pendiente tras la exclusión de la lona: **retal del tablero PVC espumado ya comprado para el forro interior**, no material nuevo. Mylar y mantas isotérmicas descartados para este uso — ambos ya están comprometidos por completo en la barrera radiante interior (`materials.yaml`) y ninguno está pensado para exposición exterior permanente (se rasgan con facilidad, sin clasificación UV/lluvia, ya documentado antes en esta misma sesión). La superficie real a cubrir es pequeña (~0.6 m²) porque la puerta exterior ya lleva su propia cara de tablero PVC — solo el panel alrededor del marco queda expuesto. Secuencia: imprimación → lijado → barniz (igual que el resto del panel) → retal de PVC atornillado encima. Actualizados `DOC-0103` y `DOC-0106`; ítem cerrado, sin compra adicional. |
| `[KB]` | Añadido `04_facility/caseta_compacta_build_checklist.md` (`DOC-0103`) consolidando la sesión de diseño de una caseta compacta en la terraza de Bogotá, dimensionada solo para las dos tiendas CLOUDLAB 844 (subconjunto de la huella descrita en `home_rnd_lab.md`, DOC-0020). Incluye presupuesto de 7 paneles de set recuperados (corregido a corte por mitad exacta, 1.20+1.20 m, sin travesaño en el borde), plan de aislamiento de barrera radiante con materiales existentes (Mylar, mantas isotérmicas, manta EVA — sin EPS), y checklist priorizado de bloqueantes vs. pendientes vs. diferibles. Confianza `LOW`, estado `draft`; ninguna construcción ha iniciado. Diseño visual complementario en `Main.dc.html` / `ZoneCrossSection.dc.html` / `canvas.json` del mismo directorio. |

### 2026-08-28

| Tipo | Descripción |
|---|---|
| `[KB]` | Añadido `09_research/weekly_brief_2026-08-28.md` (`DOC-0102`) con literatura sobre sustratos alternativos, producción circular, poscosecha, deshidratación, beta-glucanos y extracción verde. Registradas las fuentes `paper_033`–`paper_039` en la base de literatura, índice y bibliografía. Todo permanece `PENDIENTE DE VALIDACIÓN`; no se modificaron SOPs, CANON ni setpoints. |


### 2026-08-23

| Tipo | Descripción |
|---|---|
| `[KB]` | Añadido `09_research/incubation_fruiting_chambers_state_of_knowledge_2026.md` (`DOC-0101`) con commissioning multipunto, calor de bloque, CO₂/flujo, punto de rocío/VPD diagnóstico, sensores, control local, IoT, visión, CFD, MPC/PINN y bioaerosoles. Nuevas fuentes `facility_023`–`facility_026` y `safety_003`–`safety_004`; ARK-013–ARK-019. Sin setpoints ni cambios automáticos de SOP. |
| `[DECISION]` | Integrada DEC-014: el pasillo de Bogotá queda como transición sanitaria y el laboratorio limpio se ubica en un recinto separado sobre la terraza; se preserva la arquitectura posterior de Tenjo y DEC-015. |
| `[EQUIP]` | Integrado el registro visual del All American 1941X: modelo y serial C0046139 observados; capacidad canónica 41 qt / 39 L según fabricante; commissioning y validación siguen pendientes. |
| `[KB]` | Aclarada la transcripción de ICAR-DMR: el diagrama imprime `>1500 ppm`; la lectura tipográfica es clara, pero su validez fisiológica/editorial no está demostrada. Permanece fuera de setpoints. |


### 2026-08-15

| Tipo | Descripción |
|---|---|
| [KB] | Pasada profunda de literatura: moho verde en shiitake (paper_029), edad de materia prima antes de deshidratación (paper_030), identidad/fracción de bioactivos de *H. erinaceus* (paper_031) y UV-C poscosecha de shiitake (paper_032). Añadido \`09_research/deep_literature_pass_2026-08-15.md\`; sin cambios a SOPs, CANON ni parámetros activos. |

### 2026-08-14

| Tipo | Descripción |
|---|---|
| [KB] | Curadas cuatro fuentes del briefing: calcio por cepa en shiitake (paper_027), inducción por masa/método (paper_022), sustitución parcial por podas agroforestales (paper_028) y sustrato paja–tuza para *H. erinaceus* (paper_019). Añadido \`09_research/weekly_brief_2026-08-14.md\`; todas permanecen PENDIENTE DE VALIDACIÓN y no modifican SOPs ni el CANON. |

### 2026-08-03

| Tipo | Descripción |
|---|---|
| [KB] | Añadido `09_research/intake/shiitake_lot1_preproduction_validation.md`: ficha de distribución térmica, diseño de formulación control/comparación de contaminación y registro de comisionamiento del autoclave. Estado PENDIENTE DE VALIDACIÓN; no modifica SOPs ni parámetros activos. |

| [KB] | Curadas cuatro fuentes primarias para el primer lote de shiitake: interacción genotipo–formulación–spawn run (paper_013), humedad–masa–filtro de bloque (paper_014), incubación y pardeamiento (paper_015), y empaque activo en frío (paper_016). Añadido `09_research/weekly_brief_2026-08-03.md`; la evidencia no modifica SOPs ni parámetros activos. |

### 2026-08-01

| Tipo | Descripción |
|---|---|
| [KB] | Incorporadas cinco fuentes revisadas en el informe semanal del 2026-07-31: sustrato y suplementación de shiitake (paper_008), shiitake en sustrato compostado (paper_009), preservación poscosecha (paper_010), temperatura de almacenamiento de shiitake (paper_011) y secado/extracción de P. ostreatus (paper_012). Añadido 09_research/weekly_brief_2026-07-31.md. La curaduría no modifica SOPs ni parámetros activos. |

### 2026-07-24

| Tipo | Descripción |
|---|---|
| `[DECISION]` | El propietario autorizó explícitamente implementar el cambio de especie en SOPs y documentos dependientes. La decisión de shiitake queda identificada como **DEC-013**; *P. djamor* permanece como candidato futuro. |
| `[ARCH]` | Resuelta la colisión de IDs: DEC-011 conserva la decisión de arquitectura de `INDEX.yaml`, DEC-012 la línea base de recuperación y DEC-013 la prioridad de shiitake. |
| `[SOP]` | `06_operations/quality_control.md` reescrito para el piloto de shiitake: compuertas de spawn, formulación, ciclo térmico, instrumentación y especificación por cepa; retirados setpoints y criterios heredados de *P. djamor*. |
| `[KB]` | `README_MCP.md`, `INDEX.yaml`, `FARM_BRAIN.md`, `CURRENT_OPERATIONS.md` y el snapshot histórico alineados con DEC-013 y 0 lotes activos. |
| `[KB]` | KPIs, sustratos y síntesis de investigación distinguen literatura de parámetros aprobados; BE, contaminación, vida útil y bandas ambientales quedan pendientes del piloto. |
| `[EQUIP]` | `fruiting.md`, `workflow.md`, `environmental_control.md`, `martha.md` y `mixers.md` pasan a comisionamiento de shiitake sin ciclos ON/OFF universales ni ACH inferido. |
| `[BIZ]` | Economía, proveedores, precios y empaque dejan de modelar *P. djamor* como producto principal; el modelo comercial de shiitake queda pendiente de costo, compradores, vida útil y rendimiento reales. |
| `[SPECIES]` | *H. erinaceus* y *P. ostreatus* quedan explícitamente fuera del arranque; corregida la atribución del ensayo Mori et al. (2009). |
| `[KB]` | `literature_audit_2026-07-23.md` registra como resuelto el hallazgo diferido del SOP de control de calidad. |

### 2026-07-23

| Tipo | Descripción |
|---|---|
| `[KB]` | Auditoría profunda de cinco fuentes adjuntas; nuevo `09_research/literature_audit_2026-07-23.md` con método, localizadores y hallazgos diferidos. |
| `[KB]` | Corregida `paper_001`: Zurbano, Bellere & Savilla (2017), DOI 10.22137/ijst.2017.v2n1.03, máximo 31,10% BE; retirados autores, revista, BE 112% y parámetros no medidos. |
| `[KB]` | Corregida `paper_002`: Mori et al. (2009) es un ensayo clínico pequeño sobre deterioro cognitivo leve, no un estudio celular de NGF. |
| `[KB]` | Incorporada Salmones (2017), DOI 10.33885/sf.2017.46.1177, y ampliadas las fichas de Mycelium Running, ICAR-DMR, UNAPCAEM y Chang & Miles. |
| `[SPECIES]` | Shiitake: temperatura e inducción quedan dependientes de la clase de cepa; se retira la afirmación universal de 10–16°C/no tropical. |
| `[SPECIES]` | P. djamor se mantiene como candidato futuro; retirados setpoints universales de FAE/CO₂/BE, equivalencias timer→ACH e incompatibilidad absoluta con eucalipto. |
| `[KB]` | `metadata/species.yaml`, índice, bibliografía y preguntas abiertas distinguen evidencia de literatura, parámetros operacionales y bloqueadores de preproducción. |
| `[KB]` | La auditoría inicial no modificó SOPs y señaló `06_operations/quality_control.md`; el hallazgo fue autorizado y resuelto el 2026-07-24 bajo DEC-013. |

### 2026-07-14

| Tipo | Descripción |
|---|---|
| `[DECISION]` | **DEC-013:** *Lentinula edodes* (shiitake) pasa a ser la especie prioritaria de arranque. DEC-004 queda supersedida; *Pleurotus djamor* queda como candidato futuro y fuera del foco inicial. |
| `[SPECIES]` | `FARM_BRAIN.md`, `CURRENT_OPERATIONS.md`, `01_species/lentinula_edodes.md` y `metadata/species.yaml` alineados con shiitake como prioridad 1 y estado de pre-producción con 0 lotes activos. |
| `[SOP]` | `06_operations/production_schedule.md` reemplaza el ciclo corto y la proyección semanal de *P. djamor* por un marco shiitake de 90–150 días, sin proyección de rendimiento hasta validación local. |
| `[SOP]` | `06_operations/batch_tracking.md` presenta `LE` como código de ejemplo primario. El primer lote queda condicionado a spawn trazable, formulación aprobada y ciclo de autoclave comisionado y validado. |

### 2026-07-10

| Tipo | Descripción |
|---|---|
| `[EQUIP]` | **Operational Consistency Pass 1 (C2), reconciliado:** `04_facility/home_rnd_lab.md`, `05_equipment/autoclaves.md`, `metadata/equipment.yaml` — autoclave All American presente físicamente en sitio (garaje; confirmado por el propietario, 2026-07-10); capacidad de 44 L atribuida al propietario, modelo y capacidad nominal oficial pendientes de confirmar contra la placa del equipo; puesta en marcha (banco de pruebas) pendiente; validación de ciclos de esterilización pendiente; no utilizado todavía en producción. |
| `[SOP]` | **C3/C5:** `CURRENT_OPERATIONS.md` — CO₂ de colonización ya no se presenta como objetivo de control <2000 ppm (bolsa sellada es tolerante, no controlada); HR de fructificación corregida de 90–95% a 85–90% (canónico en `01_species/pleurotus_djamor.md`). |
| `[SPECIES]` | **C5/M2/M3:** `metadata/species.yaml` alineado con sus documentos canónicos — `pleurotus_djamor.humidity_percent` a [85,90]; `hericium_erinaceus.be_range_percent` a [80,120] (sustrato primario Master's Mix); `pleurotus_ostreatus.co2_ppm_max` a 1000. |
| `[SOP]` | **H2:** `CURRENT_OPERATIONS.md` — plantilla de lote activo corregida de código de especie "SP" a "DJ" para P. djamor, conforme a `06_operations/batch_tracking.md` (fuente canónica de numeración de lotes). |
| `[SOP]` | **H7:** `03_spawn/grain_spawn.md` — disparador de inicio de Fase 2 corregido de tres a un ciclo de producción documentado, conforme a `03_spawn/laboratory_roadmap.md` §9. |
| `[SOP]` | **M4:** `03_spawn/lc.md` — reconciliada contradicción interna entre "usar en 30 días o descartar" y "vida útil de 2–3 meses"; 30 días queda como recomendación operacional de vigor, 2–3 meses como techo de vida útil refrigerada (conforme a `culture_storage.md`). |
| `[SOP]` | **M5:** `06_operations/batch_tracking.md` — añadidos campos de tipo/apariencia de contaminante y día de detección a la plantilla de bitácora de lote, referenciando `02_substrates/contamination.md`. |
| `[KB]` | **M6, reconciliado:** `08_brand/packaging.md` — eliminada distinción de política no sustentada entre un límite "conservador" de 5 días y una observación interna de 5–7 días; la etiqueta remite ahora directamente a la duración de refrigeración de `06_operations/quality_control.md` (5–7 días), con el valor final de etiqueta marcado como pendiente de validación (ver también la verificación INVIMA pendiente en el mismo documento). |

### 2026-07-08

| Tipo | Descripción |
|---|---|
| `[DECISION]` | **DEC-008** — Reconciliación de arquitectura (Opción B): los documentos de gobernanza/navegación deben reflejar el filesystem real, no una estructura aspiracional. Descarta las carpetas idealizadas `05_laboratory/`, `10_living/` y el árbol `operations/` de nivel superior. |
| `[ARCH]` | `00_project/REPOSITORY_MAP.md` — corregidas todas las rutas fantasma: `05_laboratory/`→`05_equipment/`; documentos vivos (`CURRENT_OPERATIONS`, `DECISIONS`, `LESSONS_LEARNED`) a la raíz de `knowledge_base/`; añadidos `10_ai_workflows/` y ubicación de docs vivos/metadata/references. |
| `[ARCH]` | `00_project/KNOWLEDGE_ARCHITECTURE.md` — la sección "Operations Directory" (System 2) marcada como *PLANNED — not yet instantiated*; se enruta a plantillas de `06_operations/` y a `CURRENT_OPERATIONS.md` hasta el primer lote. |
| `[ARCH]` | `00_project/EDITORIAL_GUIDELINES.md` — corregida referencia rota `02_substrates/masters_mix.md` → `substrate_library.md`. |
| `[KB]` | **Cierre de DEC-007:** eliminada la carpeta `knowledge_base/11_sources/` (tombstone `SRC-0004.md`) con `git rm`; contenido recuperable en historia de git. Retirada su línea de `REPOSITORY_MAP.md`. Los alias `SRC-####` en documentos de dominio se difieren a la unificación de identificadores (Fase 2). |
| `[DECISION]` | **Tarea 1.7 completada — DEC-009:** jerarquía de precedencia canónica reconciliada. Adoptado modelo de dos ejes: **Autoridad Normativa** (qué documento prevalece en un conflicto) vs. **Estado Operacional** (qué está pasando ahora; nunca anula la autoridad normativa). Sin cambios a parámetros de cultivo, convenciones de identificadores ni estructura de carpetas. |
| `[ARCH]` | `SETAS_DE_LA_PENA_CANON.md` §14 — reescrita como única fuente de verdad de precedencia: §14.1 Autoridad Normativa (9 niveles, incluye `DECISIONS.md` y Estándares de Gobernanza), §14.2 Estado Operacional (5 niveles), §14.3 Interacción entre los dos ejes. |
| `[ARCH]` | `00_project/AI_AGENT_PROTOCOL.md` §6 — reemplazada tabla de jerarquía propia por referencia a CANON §14. |
| `[ARCH]` | `00_project/EDITORIAL_GUIDELINES.md` §4 — reemplazado diagrama de jerarquía propio por referencia a CANON §14. |
| `[ARCH]` | `00_project/SYSTEM_FLOW.md` §11 — aclarado que el diagrama describe el gobierno por subsistema, no precedencia; referencia CANON §14 como fuente exclusiva de precedencia. |

### 2026-06-29

| Tipo | Descripción |
|---|---|
| `[ARCH]` | Creación inicial de la knowledge base completa — 50 documentos |
| `[ARCH]` | Creación de `SETAS_DE_LA_PENA_CANON.md` — documento arquitectural máximo |
| `[ARCH]` | Creación de `README_MCP.md` — reglas de recuperación para modelos de lenguaje |
| `[ARCH]` | Creación de `FARM_BRAIN.md` — snapshot operacional, carga siempre |
| `[ARCH]` | Adición de `load_priority` en frontmatter de todos los documentos |
| `[KB]` | Creación de `metadata/species.yaml`, `equipment.yaml`, `substrates.yaml`, `kpis.yaml` |
| `[KB]` | Creación de `09_research/literature_database.md` — 5 papers, 4 libros, 4 recursos web |
| `[KB]` | Creación de `references/bibliography.md` — bibliografía completa APA |
| `[EQUIP]` | Pedidos Amazon confirmados: CLOUDLAB 844, T7, SHT3x ×2, ESP32 ×3, SCD30 ×2, TICONN ×2, H4 ×2 |
| `[DECISION]` | ESP32 + ESPHome seleccionado sobre soluciones comerciales cerradas |
| `[DECISION]` | SHT3x (Sensirion) seleccionado como sensor T/HR principal |
| `[DECISION]` | VIVOSUN H05 sensor HR descartado — sesgo confirmado +30–35% |
| `[DECISION]` | P. djamor seleccionado como especie prioritaria Fase 1 |
| `[DECISION]` | Paja de trigo pasteurizada seleccionada como sustrato inicial |
| `[DECISION]` | Timer mecánico descartado como mecanismo de control FAE |
| `[ARCH]` | Creación de `CHANGELOG.md`, `DECISIONS.md`, `CURRENT_OPERATIONS.md`, `LESSONS_LEARNED.md` |

### 2026-07-04

| Tipo | Descripción |
|---|---|
| `[KB]` | **(Reconstrucción de rastro)** Registro de fuente SRC-0004 / `guide_001` (Grassi et al. 2019, IMiBio) — guía de extensión; valor en diseño de planta e IPM, no en parámetros biológicos. Curaduría: incorporación acotada. |
| `[KB]` | **(Reconstrucción de rastro)** Registro de fuente paper_006 / `paper_006` (Rodríguez Valencia & Jaramillo López 2005, Cenicafé/FNC) en índice, base de literatura y bibliografía. Fuente Tier 2 colombiana, ★★★★★ para *L. edodes* y *G. lucidum*. |
| `[KB]` | **(Reconstrucción de rastro)** `02_substrates/substrate_library.md` — nueva sección "Subproductos de Café (Colombia)": C/N de materias primas (pulpa 31, borra 33, aserrín tallo 47, salvado trigo 21, maíz 34), formulaciones T2 (shiitake, 57,6%) y T12/T13/T14 (ganoderma), humedad 62,5%, partícula 0,5–2 cm. Fuente: paper_006. |
| `[KB]` | **(Reconstrucción de rastro)** `01_species/ganoderma_lucidum.md` — parámetros por etapa precisados (pH 4,2–5,3, primordios 30°C, HR escalonada 90→70–80→30–40%, CO₂ ~350 ppm disparador de píleo, luz 50–450 lux, fruiting óptimo 27–32°C); open question de temperatura en Tenjo resuelta (requiere calefacción → Fase 2). `confidence` a `high`. Fuente: paper_006. |
| `[KB]` | Registro de fuente ref_alt_001 / `book_005` (Piepenbring 2015, *Introducción a la Micología en los Trópicos*, APS Press) como referencia académica `on_request` en `bibliography.md`, `literature_index.md` y `literature_database.md`. Curaduría: reference-tier, sin impacto operacional. |
| `[KB]` | `01_species/ganoderma_lucidum.md` — nota nomenclatural *G. lingzhi* (Cao et al. 2012) sin. *G. lucidum*; relevante para etiquetado/claims INVIMA. Fuente: ref_alt_001. |
| `[SOP]` | `02_substrates/sterilization.md` — añadida ruta artesanal de vapor a presión atmosférica (5 h desde ebullición local, ~91°C a 2.600 m) marcada como *pasteurización intensa*, NO esterilización; estado *Supported Hypothesis*, requiere banco de pruebas en Tenjo. Fuente: paper_006 (Cenicafé, paper_006). |
| `[KB]` | `01_species/lentinula_edodes.md` (U-3) — incubación 20–25°C (óptimo 25°C, rango 21–27°C); tasa de inoculación 3,6% comercial / 5–7,5% propia; sustrato de café (formulación T2, ~57%); nota de cepas tolerantes a calor L54/L4055 como *conflicting evidence* al rango 10–16°C; variante corta de choque térmico (12°C, 2–4 h). Fuente: paper_006. |
| `[KB]` | `02_substrates/contamination.md` (U-5) — causa específica de *Neurospora* (sustrato dejado en el esterilizador); baja capacidad antagónica del shiitake → esterilización obligatoria. Fuente: paper_006. |
| `[KB]` | `04_facility/incubation.md` + `fruiting.md` (U-6) — dimensionamiento 1 m³/3,7 kg de sustrato; desinfección de cuarto (formol 0,3% + CaCO₃); cobertura de plástico por clima (negro incubación / transparente fructificación, clima frío). Fuente: paper_006. |
| `[KB]` | `02_substrates/supplementation.md` (U-7) — compuestos de calcio (CaCO₃/CaSO₄) mínimo funcional ≥0,6% para estabilizar producción y estimular crecimiento hifal. Fuente: paper_006 (Royse & Sánchez vía Cenicafé). |
| `[KB]` | `metadata/substrates.yaml` — nuevas entradas `coffee_substrate_shiitake_t2` y `coffee_substrate_ganoderma_t12` (composición, C/N, BE, `validation_status: needs_field_validation_tenjo`); bloque `calcium_compounds` (mín. 0,6%). Sync cross-reference paper_006. |
| `[KB]` | `metadata/species.yaml` — `ganoderma_lucidum` actualizado (fruiting 27–32°C, incubación 25–32°C, pH 4,2–5,3, HR escalonada, CO₂ trigger 350 ppm, luz 50–450 lux, `requires_active_heating_tenjo: true`); `lentinula_edodes` (incubación óptima 25°C, tasa inoculación 3,6–7,5%, cepas L54/L4055, sustrato café). Sync cross-reference paper_006. |
| `[KB]` | Incorporados 5 PDFs subidos por el usuario a `09_research/literature_database.md`, `literature_index.md` y `references/bibliography.md`: `book_006` (Chang, Buswell & Miles 1993, *Genetics and Breeding of Edible Mushrooms* — genética/mating types, hibridación Pleurotus, mejoramiento Lentinula; referencia de fondo para spawn propio Fase 3), `book_007` (Chang & Miles 2004, *Mushrooms: Cultivation, Nutritional Value, Medicinal Effect and Environmental Impact* 2ª ed. — antes en "literatura pendiente"; capítulos dedicados Pleurotus/Lentinula/Ganoderma), `guide_002` (ICAR-DMR 2020, *Growing Oyster Mushroom* — protocolo cuantificado P. djamor: spawn 3%/10%, cultivo madre 25±2°C/pH 7, BE 80–100%), `guide_003` (MushWorld 2004, *Mushroom Growers' Handbook 1* — spawn de grano, sala limpia, growing houses, plagas, poscosecha), `guide_004` (Chang ca. 2010, UNAPCAEM Training Manual — plantilla pedagógica). PDFs originales archivados en `09_research/source_pdfs/`. |
| `[KB]` | `01_species/pleurotus_djamor.md` — nueva sección "Cultivo Madre y Spawn" con datos de guide_002 (PDA/MEA 25±2°C pH 7, spawn 15–20 días, tasa inoculación 3%/10%); nota de precaución sobre cifra "CO₂ >1,500 ppm" de guide_002 (interpretada como techo de tolerancia, no objetivo — mantener 500–1,500 ppm como rango operacional). |

---

## Plantilla de entrada

```
### YYYY-MM-DD

| Tipo | Descripción |
|---|---|
| `[TIPO]` | Descripción concisa del cambio. Referencia a documento afectado si aplica. |
```

---

*Este archivo se actualiza cada vez que un cambio significativo ocurre en el proyecto.*
*Eventos de producción van en `06_operations/batch_tracking.md`.*
