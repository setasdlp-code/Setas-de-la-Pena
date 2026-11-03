---
title: "Factibilidad de shiitake en Tenjo — evaluación e incorporación de hallazgos"
document_id: DOC-0133
category: research
load_priority: selective
last_reviewed: 2026-11-03
status: draft
confidence: medium
primary_sources:
  - NISTIR 5078, tablas 1 y 2, IAPWS-95
  - Resolución 3168 de 2015, artículo 1
  - Resolución 2674 de 2013, artículos 3, 50 y 51
  - Resolución 719 de 2015, anexo 4.8.1
  - ICA, Resolución 115708 de 2021 y programa de exportación en fresco
related_documents:
  - colombia_mushroom_market_synthesis_2026-11-03.md
  - intake/factibilidad_shiitake_tenjo_reporte_externo_2026-11-03.md
  - ../02_substrates/sterilization.md
  - ../DECISIONS.md
  - ../CURRENT_OPERATIONS.md
  - ../07_business/regulatory_framework.md
  - ../07_business/economics.md
  - ../07_business/pricing.md
  - unresolved_questions.md
---

# Pregunta y posición del proyecto

¿Qué hallazgos del reporte recibido pueden incorporarse y aplicarse al programa modular de *Lentinula edodes* en Tenjo?

La línea base consultada es `main`, commit `2b3d72f2`. El proyecto documenta preproducción y ningún costo/kg validado. Tiene un All American 1941X en sitio con ciclo representativo pendiente de validación; el microlote candidato es de cuatro bolsas, no una compra de 200 bloques. DEC-019 admite cepa no identificada en el lote 1 con riesgo explícito; DEC-020 fija margen de contribución mínimo del 40 %. Ver [decisiones](../DECISIONS.md), [estado operativo](../CURRENT_OPERATIONS.md) y [esterilización](../02_substrates/sterilization.md).

El [original íntegro](intake/factibilidad_shiitake_tenjo_reporte_externo_2026-11-03.md) es **no verificado**: no hereda el nivel de las fuentes que enumera. Esta evaluación distingue evidencia oficial Tier 1, cálculo derivado e hipótesis. Confianza alta en las correcciones físicas y en el alcance de los textos legales consultados; baja en tarifas, demanda y rendimiento local. Las consultas no son un concepto emitido para el predio ni certifican exhaustividad de la normativa vigente.

# Correcciones críticas

## F01 — Presión y temperatura en altitud

**Contradice el reporte; apoya el KB.** La tabla 1 de [NISTIR 5078](https://www.nist.gov/document/nistir5078-tab1pdf), página 3 del PDF, da presión de saturación de 205,05 kPa absolutos a 121 °C. Aceptando solo para el cálculo los 74,6 kPa ambientales del reporte:

- `P_abs = P_amb + P_man`; `15 psi × 6,894757 = 103,42 kPa`.
- `P_abs = 178,02 kPa`, aproximadamente 116,6 °C por interpolación entre 116 y 117 °C en esa tabla.
- La diferencia teórica hasta 205,05 kPa es 130,45 kPa (~18,92 psig), **no una instrucción de operación ni autorización para elevar presión**.
- A 74,6 kPa el agua hierve aproximadamente a 91,6 °C; la presión real de la finca sigue sin medir.

**Tier 1 para propiedades físicas; cálculo derivado, no medición local.** Supone agua/vapor en equilibrio y ausencia de aire residual. La temperatura del producto puede diferir de la de cámara. Conservar el commissioning de la carga, instrumentos verificados y límites/instrucciones del fabricante. No cambiar válvulas, purga, tiempo ni consigna desde este cálculo.

La afirmación de contaminación inevitable >35 % sin autoclave no tiene datos verificables. Tampoco se adopta la exclusividad biológica de 121 °C: [sterilization.md](../02_substrates/sterilization.md) ya distingue la ruta candidata a presión de alternativas publicadas y condicionadas de pasteurización.

## F02 — Obligaciones sanitarias y ambientales

**Parcialmente apoya; corrige errores.** Fuentes oficiales consultadas el 2026-11-03:

| Afirmación | Evaluación y límite |
|---|---|
| Fresco natural sin transformar exceptuado de NSA/PSA/RSA | Apoyada por [Res. 3168/2015, art. 1](https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%203168%20de%202015.pdf). Confirmar presentación/proceso; no extender automáticamente a troceado o transformado. |
| Inscripción del establecimiento e inspección | [Res. 2674/2013, arts. 50–51](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?dt=S&i=54030). La exención del producto no sustituye inscripción, higiene o vigilancia; no se presume concepto favorable. |
| Deshidratado de riesgo medio con NSA | Incorrecto: el anexo 4.8.1 de [Res. 719/2015](https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%200719%20de%202015.pdf), página 10 y continuación en 11, marca **B (menor riesgo)** para vegetales desecados, incluidos hongos. NSA es la ruta general de menor riesgo; producto, formulación, destino y excepciones requieren evaluación propia. |
| Res. ICA 115708/2021 obliga a registrar el cultivo | Incorrecto: [ICA, texto y objeto](https://www.ica.gov.co/normatividad/normas-ica/resoluciones-oficinas-nacionales/2021/2021r115708) se refieren a predios de animales para carne/leche. El [programa ICA de vegetales frescos](https://www.ica.gov.co/areas/agricola/servicios/epidemiologia-agricola/registros-para-exportacion-de-vegetales) consultado corresponde a **exportación**, bajo Res. 824/2022; no prueba registro universal para venta nacional de setas. Consultar aplicabilidad al proyecto. |
| Pagar alcantarillado elimina toda obligación de descarga | Incompleto: distinguir permiso de vertimiento, cumplimiento de límites y condiciones del prestador. Confirmar conexión y descarga reales; ver [CAR, permiso a cuerpos de agua o suelo](https://car1.car.gov.co/vercontenido/1168) y [SSPD, Concepto 77/2023](https://normas.cra.gov.co/gestor/docs/concepto_superservicios_0000077_2023.htm), orientación general no vinculante. |

**Implementación documental:** corregidas las entradas afectadas de [regulatory_framework.md](../07_business/regulatory_framework.md). No se declara al predio habilitado para vender ni se radican trámites.

La síntesis de mercado `09_research/colombia_mushroom_market_synthesis_2026-11-03.md` (DOC-0132) aporta contexto independiente por formato; el original de este análisis se conserva como DOC-0134. Las preguntas de factibilidad son AB13–AB16; AB12 pertenece a la medición de contribución y recompra.

# Hallazgos conservados con límites

| ID | Hallazgo del reporte | Evidencia / relación | Aplicación y validación pendiente |
|---|---|---|---|
| F03 | Medir consumo por etapa y carga térmica nocturna | Oportunidad de medición; coincide con el modelo económico. Los 20–24 kWh/día y tarifas son no verificados. | Ficha ampliada en [economics.md](../07_business/economics.md). Registrar kWh, horas, carga, tarifa facturada y denominador vendible; no presupuestar con potencias nominales como consumo real. |
| F04 | Aislamiento y aire exterior podrían reducir costo climático | Hipótesis de diseño; no demuestra PIR superior para esta finca. | Comparar sistema completo: área, espesor, juntas, infiltración, condensación, filtración, caudal y consumo. `R = 1,34` da `U ≈ 0,746` por inversión, pero no demuestra transmitancia de la envolvente instalada. Sin compra ni especificación nueva. |
| F05 | Diferenciar fresco y seco por uso culinario | Hipótesis comercial útil; no demuestra insustituibilidad, demanda ni superioridad universal. | Ficha de entrevista en [pricing.md](../07_business/pricing.md): plato, producto sustituto, calidad acordada, precio neto y pago. Muestras y entregas solo cuando producción/calidad estén liberadas. |
| F06 | Prospección Tenjo–Chía–Cota–Cajicá–Bogotá | Lista exploratoria no verificada. | Osaki/Takami, Wok, Ukiyo, Amen Ramen, Tomodachi, Arigato y Watakushi se conservan como prospectos del original, sin asignar contactos, kg/semana, precios o crédito confirmados. Ver AB13 en [preguntas](unresolved_questions.md). |
| F07 | Evaluar bloques precolonizados frente a producción propia | Alternativa de negocio; contradice la prescripción de arranque único y compra futura del autoclave. | Comparar costo por kg **vendible**, calidad, trazabilidad, transporte, madurez y continuidad de suministro. El bloque comprado traslada parte del proceso, no todo riesgo. Requiere cotización y prueba independiente antes de cambiar ruta. |
| F08 | Evitar condensación y validar empaque/cadena fría | Coincide con trazabilidad y calidad; cifras de 8 días y humedad/temperatura no validadas localmente. | Medir por lote/empaque tiempo-temperatura, pérdida de masa, daño y vida útil. No prometer entrega martes/viernes o vida útil por este reporte. |
| F09 | Patología, eucalipto y SMS | Hipótesis sin fuente por afirmación. | No adoptar dosis de peracético/Bti, 50 mesh, pH 6,0, lavado de eucalipto de tres semanas ni CaCO₃ 1,5–2 %. Requieren identificación, evidencia específica, compatibilidad y revisión de seguridad. SMS: no reconocer ingresos ni sustitución energética sin caracterización, legalidad, mercado y balance neto. |

# Comprobaciones económicas del propio reporte

Son cálculos de auditoría, no proyecciones de la finca:

- `120.000–180.000 COP/kg seco ÷ 4–5 kg hidratado/kg seco` implica **24.000–45.000 COP/kg hidratado**, no 16.000–22.000. No incluye mano de obra, rendimiento culinario ni merma.
- A la tarifa hipotética de 1.050 COP/kWh, 20–24 kWh/día durante 30 días cuestan 630.000–756.000 COP; dividido por 150 kg/mes da 4.200–5.040 COP/kg. La aritmética concuerda; consumo, tarifa y producción **no están medidos**. No añadir contribución dos veces si ya viene en tarifa total.
- Bloque de 14.000–18.000 COP vendido como seta a 48.000–58.000 COP/kg: con margen de contribución de DEC-020, solo el bloque exigiría `costo_bloque / (precio × 0,60)` = **0,402–0,625 kg vendibles/bloque** según extremos. Los demás costos elevan el requisito. La masa húmeda del bloque de 2,2 kg no permite inferir BE sin materia seca.
- El objetivo de 25–35 kg/semana, cuatro a seis cuentas o 300 kg/mes por cuatro meses no se convierte en compuerta aprobada. El margen operativo >30 % del reporte y el margen de contribución de DEC-020 son métricas distintas.

# Resultado y madurez

**Implementado:** archivo original trazable, correcciones del marco regulatorio, fichas de costos/entrevista ampliadas y preguntas de validación asignadas. Cambio editorial y de investigación con aplicación documental a negocio, sin cambio de arquitectura, SOP, formulación, setpoints ni Setas OS.

**Siguiente evidencia:** cerrar commissioning térmico existente; obtener factura/tarifa aplicable y consumo por etapa; respuesta de autoridad sobre establecimiento/producto/agua; entrevistas y cotizaciones fechadas. Cada registro conserva fuente, fecha, responsable y estado `pendiente` hasta existir evidencia. No hay ensayo ni venta nueva acreditados por esta incorporación.
