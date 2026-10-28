---
title: "Auditoría técnica — Manual Monte Jongas, shiitake con pellets (2026-10-27)"
document_id: DOC-0126
category: research
load_priority: selective
last_reviewed: 2026-10-27
confidence: medium
status: draft
primary_sources:
  - "Monte Jongas, Manual Sustrato Shiitake Pellets, octubre 2026 (13 páginas, PDF recibido)"
  - "All American 1915X/1925X/1941X: instrucciones oficiales de operación"
  - "Desisa et al., J. Fungi 2023, 9(8):811, DOI:10.3390/jof9080811"
  - "Frontiers in Microbiology 2023, DOI:10.3389/fmicb.2023.1290180"
  - "Furlan et al., Agronomy 2026, DOI:10.3390/agronomy16050509"
related_documents:
  - ../02_substrates/manual_monte_jongas_shiitake_pellets_transcripcion_2026-10-27.md
  - ../02_substrates/substrate_library.md
  - ../02_substrates/supplementation.md
  - ../02_substrates/sterilization.md
  - ../06_operations/quality_control.md
  - ../06_operations/lote1_shiitake_especificacion_ambiental.md
  - ../06_operations/piloto_shiitake_incubacion_protocolo.md
  - ../CURRENT_OPERATIONS.md
  - ../DECISIONS.md
---

# Dictamen y alcance

El manual original de **Monte Jongas** sirve como receta **candidata de microlote** de *Lentinula edodes* con pellets de madera dura. Su aritmética central es consistente, condicionada a los porcentajes de humedad supuestos. El documento no proporciona aún evidencia de validación operacional en Tenjo, ni autoriza declarar comisionado el All American 1941X.

**Estatus propuesto: referencia de receta experimental / microlote de cuatro bolsas; pendiente de revisión para convertirlo en procedimiento operativo aprobado.** No cambiar el lote 1 activo ni el firmware por la existencia de este documento. La palabra «final» describe la versión editorial entregada, no un resultado de validación del cultivo.

## 1. Comprobación de fórmula (verificada matemáticamente)

Manual, páginas 1 y 6–10: 80% pellets de madera dura + 20% salvado en **base seca**; 1% de cal hidratada Ca(OH)₂ agregado respecto de la mezcla base seca; humedad objetivo del sustrato **60% en base húmeda**; inóculo 10% del sustrato húmedo antes de sembrar.

Para 10 kg de sustrato SIN spawn:
- Masa seca total: 10.000 × 0,40 = **4,000 kg**.
- Mezcla base seca: 4,000 / 1,01 = **3,960396 kg**.
- Madera seca: 0,80 × mezcla base = **3,168317 kg**.
- Salvado seco: 0,20 × mezcla base = **0,792079 kg**.
- Cal seca: 0,01 × mezcla base = **0,039604 kg**.
- Si pellets contienen 8% de humedad y salvado 12%: pellets **3,443823 kg** como vienen; salvado **0,900090 kg** como viene; agua a añadir **5,616483 kg** (≈5,616 L).
- Redondeo operativo del manual: **3,44 kg pellets + 0,90 kg salvado + 0,04 kg cal + 5,6 L agua = 9,98 kg** (aproximado), a repartir en cuatro bolsas.
- Cada bolsa: ~861 g pellets, 225 g salvado, 9,9–10 g Ca(OH)₂, 1.404 mL agua; 2,5 kg de sustrato; **250 g spawn**; bolsa sembrada **2,75 kg**.
- 250 g equivale al **10% del peso de sustrato antes de inocular** y al **9,09% de la masa final sembrada**. Expresar siempre el denominador.
- Regla «1,3 L de agua por kg de pellets»: se refiere a hidratar **solo los pellets supuestos a 8%** al 60%, no a toda la formulación; el salvado y la cal requieren agua adicional.

**Limitación:** la consistencia numérica no verifica que los insumos reales tengan 8%/12% de agua. Medir humedad o documentar estimación. La «prueba del puño» es comprobación cualitativa, no medición exacta de humedad; si se corrige con agua o sólidos, pesar y recalcular el lote.

## 2. Hallazgos por severidad

| Prioridad | Páginas | Hallazgo | Acción |
|---|---|---|---|
| **Crítica** | 1 y 9 (tratamiento) | El manual iguala «121 °C (15 psi)». En **Tenjo (~2.600 m)** la presión manométrica de 15 psi no equivale a 121 °C de vapor saturado. El fabricante del 1941X indica compensar la altitud; su tabla da 19–21 psi a 8.000 pies, aproximados a la elevación del sitio. | **No ejecutar el ciclo de 15 psi como si estuviera validado a 121 °C.** Verificar con fabricante el régimen permitido para el modelo y la instalación, purga correcta de aire, medición de T real, calibración y seguridad. Nunca exceder límites del equipo. |
| **Crítica** | 9 | «90–120 min desde alcanzar presión» no demuestra que el **centro** de una bolsa de 2,5 kg alcance y mantenga temperatura suficiente. | Comisionar con **carga representativa**, registro tiempo/temperatura en bolsa testigo, distribución de bolsas, purga y enfriamiento. No fijar ciclo final con la regla general. |
| **Alta** | 1, 2, 9 | Se indica pH inicial 5,5–6,0 y Ca(OH)₂ al 1%; **el pH obtenido es desconocido** y depende de madera, agua, salvado y método de medición. No confundir Ca(OH)₂ con CaCO₃ ni CaSO₄. | Tratar 1% Ca(OH)₂ como **hipótesis experimental**; medir pH de cada mezcla con método consistente y equipo calibrado. No «corregir» con cal adicional sin protocolo documentado. |
| **Alta** | 1, 8, 10 | **Diferencia con expediente vigente:** este manual = 4 × 2,5 kg sustrato + 10% spawn (2,75 kg final); especificación `DOC-0122` = 30 bloques de 2,0 kg y dosis propuesta 5% spawn de grano / 7–9% de aserrín, pendiente de aprobación. | Registrar el material como microlote separado; no reemplazar el lote 1. Si se adopta como lote 1, tramitar versión nueva de especificación, masa, dosificación, trazabilidad y decisión. |
| **Alta** | 10 | Área «con la mejor limpieza de aire» no define control verificable de contaminación al abrir bolsas esterilizadas y añadir 20% salvado. | Aplicar SOP aséptico con zona designada, técnica de manos, herramientas, bolsas filtro/sellado, secuencia, control de exposición y registro de incidentes. Verificar entorno disponible (SAB o flujo laminar) antes de abrir. |
| **Media** | 1–2 | Pellets para parrilla pueden ser mezcla de especies y no garantizan por nombre comercial «100% madera dura sin aditivos». | Exigir ficha/etiqueta de **composición específica**, lote, madera sin tratar, ausencia de aromatizantes/adhesivos y proveedor. Precios Easy/Homecenter son ilustrativos, no costo validado. |
| **Media** | 3–8 | Humedades base 8% pellets / 12% salvado; la prueba del puño tiene variación de operador. | Registrar humedad por lote, masa pesada y volumen real de agua; método gravimétrico de referencia y versión del SOP de prueba. |
| **Media** | 12 | Choque frío/remojo se presentan como inducción general y se ofrecen tiempos de pardeamiento discordantes. La cepa es aún no identificada en `DOC-0122`; el KB no presupone un choque obligatorio. | Definir criterio observado de madurez y estrategia de inducción según cepa/lote. No abrir solo por número de semanas. |
| **Media** | 12 | Ensayo 2+2 bolsas por condición y cambios múltiples entre tandas dificultan separar efectos. | Primer microlote: fijar spawn, madera, bolsa, incubación y tratamiento. Si hay comparación, cambiar **una variable** y explicitar que n=2 por grupo solo produce señales exploratorias. |
| **Editorial** | todas | Documento se identifica como **MONTE JONGAS**, no «Setas de la Peña». | Preservar atribución; definir si el manual será referencia externa o adaptación propia antes de publicación con la marca. |

## 3. Evidencia externa y matices de la cal

- **Ca(OH)₂:** un experimento revisado por pares sobre *L. edodes* usó 0%, 1%, 3% y 5% de cal hidratada en aserrín y salvado (20 paquetes por réplica, 3 réplicas); reportó cambios de enzimas y polisacáridos durante el pardeamiento. Por tanto, usar 1% **no es químicamente absurdo ni necesariamente inadecuado**. El artículo no demuestra el pH final ni productividad de los pellets específicos de este manual. Fuente: https://doi.org/10.3389/fmicb.2023.1290180
- **CaCO₃ y yeso no son equivalentes:** un ensayo de dos cepas en aserrín de eucalipto encontró efectos diferentes por dosis y cepa; 1% CaCO₃ favoreció ciertos resultados, mientras el yeso redujo rendimiento en las condiciones investigadas. Evitar convertir una recomendación mineral general en regla universal. Fuente: https://doi.org/10.3390/agronomy16050509
- **Tratamiento térmico:** un ensayo académico esterilizó bolsas de **500 g húmedos** a 121 °C durante 120 minutos; eso no valida automáticamente 2,5 kg de otra geometría. Fuente: https://pmc.ncbi.nlm.nih.gov/articles/PMC10456065/
- **All American 1941X:** manual del fabricante (apartados «Elevation above sea level» y «Operation»): compensación +0,5 psi por cada 1.000 pies, tabla 8.000 pies: 19–21 psi; purga continua de vapor durante **al menos siete minutos** antes de cerrar la válvula; respetar procedimiento, rango de presión, cierre, agua, accesorios y despresurización segura. Fuente: https://www.allamerican-chefsdesign.com/admin/FileUploads/product_43.pdf
- **Fuente primaria:** Monte Jongas (octubre 2026), PDF original suministrado por el usuario y texto completo extraído en `02_substrates/manual_monte_jongas_shiitake_pellets_transcripcion_2026-10-27.md`. Diferenciar afirmaciones del manual y observaciones de esta auditoría.

## 4. Compuertas antes del primer microlote

1. Identificar madera/especies y asegurar ausencia de aditivos; registrar lote y humedad real de pellets/salvado.
2. Decidir si las cuatro bolsas son **microlote LE-ensayo** independiente del lote 1 de 30 bloques, sin fusionar masas o dosificaciones.
3. Registrar proveedor, código/estado/fecha del spawn; mantener denominador del porcentaje constante.
4. Acordar formulación experimental y protocolo de pH (antes/después de esterilizar, si procede); no asumir que Ca(OH)₂ al 1% produce pH 5,5–6,0.
5. Verificar instructivo vigente del 1941X para **altitud y seguridad** y completar la validación de ciclo a temperatura con carga representativa. Anotar T al núcleo y tiempo efectivo con instrumentos aptos. **Compuerta de no inoculación** hasta validación.
6. Preparar zona aséptica, bolsas de PP filtradas compatibles, técnica de sellado y enfriamiento verificada.
7. Formular hoja por bolsa: ID, masa sustrato/spawn, mezcla, pH, humedad medida/supuesta, fuente spawn, ciclo, temperatura del bloque, contaminación/resultado, cosecha y masa seca inicial; calcular BE solo con denominador de materia seca consistente.
8. Conservar el manual y la auditoría vinculados al registro de lote, separando parámetros «publicados», «propuestos» y «validados en Tenjo».

## 5. Estado de autoridad

Este documento es **auditoría de fuente externa**, no SOP aprobado ni decisión. `CURRENT_OPERATIONS.md`, `DECISIONS.md`, `DOC-0122`, `quality_control.md` y el SOP de comisionamiento prevalecen para el lote 1 hasta revisión/aprobación explícita. La transcripción no incluye las imágenes del PDF, que debe conservarse por separado.
