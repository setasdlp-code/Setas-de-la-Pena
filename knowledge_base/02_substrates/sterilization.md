---
title: Esterilización de Sustratos
document_id: DOC-0012
category: substrates
load_priority: selective
last_reviewed: 2026-08-19
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Zied & Pardo-Giménez 2017
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006, ruta atmosférica)
  - Xiong et al. 2019, Bioresource Technology 274:65–72
  - Levanon et al. 1993, Bioresource Technology 45:63–64
  - FDA thermal-process guidance, methodological transfer only
related_documents:
  - pasteurization.md
  - supplementation.md
  - contamination.md
  - ../05_equipment/autoclaves.md
  - ../06_operations/operational_commissioning.md
  - ../09_research/commissioning_validation_research.md
---

# Executive Summary

La esterilización por vapor a presión es una herramienta de control microbiológico particularmente útil para sustratos nutritivos y suplementados, spawn y otras operaciones donde una carga microbiana residual baja es importante. Sin embargo, **la especie por sí sola no determina que un sustrato deba procesarse siempre a 121 °C**. Existen estudios publicados de *Lentinula edodes* producida sobre sustratos pasteurizados, incluidos procesos térmicos por debajo de la esterilización a presión.

Para el programa inicial de Setas de la Peña, el vapor a presión permanece como la **ruta conservadora candidata** para sustrato de aserrín suplementado, pero su ciclo real debe validarse localmente. Las alternativas de pasteurización permanecen como hipótesis de proceso separadas y no son intercambiables automáticamente con el proceso a presión.

**Regla operacional:** los rangos de temperatura, presión y tiempo citados en este documento son referencias de literatura y no constituyen por sí solos un ciclo aprobado. Antes de liberar un lote para inoculación, la configuración real de equipo, formulación, masa de bolsa, número de bolsas y geometría de carga debe estar vinculada a un ciclo versionado validado según `../06_operations/operational_commissioning.md` y `../06_operations/quality_control.md`.

# Research Consensus

## Vapor a presión como baseline de alta reducción microbiana

**Published evidence:** la esterilización por vapor a presión es ampliamente utilizada para sustratos suplementados y para preparación de spawn. Estudios de shiitake usan con frecuencia 121 °C, pero los tiempos publicados varían ampliamente con masa, geometría, formulación y equipo.

**Transfer limit:** no existe un tiempo universal de 2, 3 o 4 horas aplicable a cualquier bolsa ni un umbral de suplementación que, por sí solo, establezca un ciclo válido para Setas de la Peña.

## Pasteurización como alternativa condicionada

**Published evidence:**

- Xiong et al. (2019) compararon pasteurización por aire caliente de 75–100 °C con autoclave a 121 °C en sustrato de abedul para shiitake y reportaron colonización más rápida, fructificación más temprana y rendimiento igual o superior en el proceso de aire caliente.
- Levanon et al. (1993) desarrollaron tratamiento a granel por pasteurización para shiitake en mezcla de pajas.
- Rodríguez Valencia & Jaramillo López (2005) documentaron una ruta colombiana de vapor atmosférico prolongado en sustratos lignocelulósicos para hongos, incluida producción de shiitake.

**Project implication:** la pasteurización no se descarta por principio, pero cada combinación de sustrato, suplementación, equipo y práctica de inoculación requiere validación propia.

# Core Principles

- **Referencia de literatura:** 121 °C y vapor a presión son un marco común de esterilización húmeda, no una receta universal.
- **No usar tiempo genérico como autorización:** 2–4 h o cualquier otro rango no es un criterio de liberación hasta que la carga real haya sido caracterizada y validada.
- La temperatura o presión de cámara no demuestra automáticamente la temperatura en el punto más lento del producto.
- El estudio térmico debe separar distribución de temperatura del equipo y penetración térmica dentro del sustrato.
- La posición geométrica central de una bolsa es una ubicación candidata de medición, no un cold spot asumido.
- Cambios materiales de formulación, humedad, masa por bolsa, cantidad de bolsas o distribución de carga requieren evaluación antes de transferir un ciclo previo.
- Después del tratamiento térmico, la inoculación y manipulación deben proteger el sustrato de recontaminación.

# Technical Details

## Parámetros de referencia de literatura

| Parámetro | Referencia |
|---|---|
| Temperatura | **121 °C** como referencia habitual de vapor a presión |
| Presión | Valor dependiente del equipo y de la relación presión-temperatura real; registrar gauge vs absoluta |
| Tiempo | Escala de minutos a horas según producto, carga y objetivo; no existe tiempo universal |
| Carga | Masa, geometría, humedad, número de bolsas y disposición afectan penetración térmica |

Estos valores sirven para diseñar el estudio térmico, no para reemplazarlo. El criterio operacional depende del historial tiempo-temperatura del producto en la posición de calentamiento más lento, de la distribución térmica de la carga, de la repetibilidad y del objetivo microbiológico definido.

## Distribución y penetración térmica

Durante commissioning usar dos estudios:

1. `HEAT_DISTRIBUTION` — múltiples sensores distribuidos en la carga/cámara, fuera del producto, para caracterizar el entorno térmico.
2. `HEAT_PENETRATION` — sensores dentro de bolsas representativas para determinar el calentamiento del sustrato y localizar el punto más lento.

Ver metodología completa en `../06_operations/operational_commissioning.md`.

## Letalidad equivalente

Registrar series de tiempo-temperatura con resolución suficiente para permitir análisis posterior de letalidad equivalente.

No usar `F0` como criterio automático de aprobación hasta que exista una base microbiológica definida para el proceso de sustrato: organismo objetivo, `T_ref`, `z`, carga inicial y reducción requerida. Los valores F0 provenientes de alimentos enlatados o esterilización médica no se transfieren automáticamente a cultivo de hongos.

## Altitud y presión

En Tenjo (~2600 m s.n.m.) la presión atmosférica difiere de la del nivel del mar. Por lo tanto:

- registrar si el instrumento indica presión manométrica o absoluta;
- no inferir la temperatura del producto únicamente a partir de la presión;
- verificar instrumentos antes del commissioning;
- medir temperatura del producto cuando sea técnicamente posible;
- seguir el manual y límites del fabricante del equipo.

## Equipos para el programa actual

### All American 1941X

La especificación actual del fabricante para el esterilizador no eléctrico `1941X` es **41 qt / 39 L**. El fabricante lo describe para esterilización de apósitos e instrumental sobre una fuente de calor eficaz y no publica una capacidad validada en bolsas de sustrato.

Para Setas de la Peña:

- no inferir bolsas/ciclo a partir de litros nominales;
- definir la capacidad con las bolsas reales, masa real y rack real;
- registrar la fuente de calor y su estabilidad;
- no usar ciclos de instrumentos médicos como ciclo automático de sustrato.

### Otros recipientes a presión

Cualquier otro equipo debe conservar su configuración de seguridad aprobada por fabricante. **No se autoriza fabricar o modificar cámaras de presión artesanales** como sustituto del equipo certificado.

## Vapor a presión atmosférica — ruta experimental separada

*Fuente interna: Rodríguez Valencia & Jaramillo López 2005 (Cenicafé/FNC — paper_006 / paper_006).*

La literatura colombiana documenta vapor atmosférico prolongado para sustratos lignocelulósicos. Este proceso no debe denominarse esterilización equivalente a un proceso a presión y requiere un banco de pruebas propio en Tenjo.

**Estado:** hipótesis de proceso. No usar como sustituto automático del baseline de vapor a presión en la formulación inicial de aserrín suplementado.

# Protocolo de ejecución

```
1. Preparar sustrato según receta versionada y registrar humedad, masa y lotes de materias primas.
2. Usar bolsa compatible con la temperatura y el proceso declarados por su fabricante.
3. Cargar el equipo según una geometría documentada; registrar número, masa y posición de bolsas.
4. Ejecutar el `thermal_cycle_id` aprobado para esa configuración.
5. Durante commissioning:
   a. realizar estudio de distribución térmica;
   b. realizar estudio de penetración térmica;
   c. registrar come-up, hold y enfriamiento por separado.
6. Registrar tiempo, temperatura, presión, desviaciones y consumo energético/combustible.
7. Enfriar bajo condiciones definidas y registrar el tiempo de enfriamiento.
8. Liberar a inoculación solo si la compuerta térmica de `quality_control.md` está satisfecha.
```

# Bolsas para tratamiento térmico

No usar límites genéricos de temperatura de polímeros como sustituto de la especificación del producto comprado. Registrar fabricante/modelo/lote de bolsa cuando sea posible y conservar la evidencia de compatibilidad con el proceso aplicado.

# Best Practices

- Identificar equipo, instrumentos, receta, humedad, masa, número de bolsas y disposición en cada ciclo.
- Marcar bolsas con fecha, `PROCESS_BATCH_ID` y contenido antes del proceso.
- No abrir equipos presurizados con presión residual.
- Mantener la configuración de seguridad especificada por fabricante.
- No compactar la carga de forma no validada.
- Vincular contaminación posterior con `thermal_cycle_id` antes de atribuir causa.
- Durante commissioning considerar bolsas centinela procesadas y no inoculadas para ayudar a diferenciar fallos previos a inoculación de contaminación introducida después.

# Common Failure Modes

| Fallo | Causa posible | Respuesta |
|---|---|---|
| Cámara alcanza condición nominal pero el producto no | Penetración térmica lenta / carga desfavorable | Mapear temperatura de producto y revisar geometría |
| Zonas de la carga tardan más en calentar | Distribución no uniforme | Ejecutar/ajustar estudio de distribución |
| Ciclo “igual” produce curvas distintas | Variación de masa, humedad, carga, energía o instrumento | Comparar parámetros de carga y verificación de sensores |
| Contaminación post-proceso | Puede originarse en tratamiento, enfriado, bolsa, inoculación u otra etapa | Registrar evento y separar detección de origen probable/confirmado |
| Bolsas se deforman o fallan | Especificación incompatible, contacto térmico o carga inadecuada | Verificar bolsa y disposición |
| Tiempo genérico aplicado a carga nueva | Transferencia no validada | Volver a caracterización/commissioning |

# Open Questions

- ¿Cuál es la geometría de carga con peor distribución térmica en el 1941X?
- ¿Cuál es la posición de bolsa y zona interna con calentamiento más lento?
- ¿Cuál es la variabilidad entre ciclos nominalmente idénticos?
- ¿Qué criterio microbiológico de aceptación es apropiado para la formulación inicial?
- ¿Qué número de bolsas por ciclo maximiza throughput sin perder reproducibilidad térmica?
- ¿Qué alternativa de pasteurización merece banco de pruebas después de establecer el baseline a presión?

# References

- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Zied, D.C. & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms*. Wiley-Blackwell.
- Xiong S. et al. (2019). Energy-efficient substrate pasteurisation for combined production of shiitake mushroom and bioethanol. *Bioresource Technology* 274:65–72. doi:10.1016/j.biortech.2018.11.071.
- Levanon D. et al. (1993). Bulk treatment of substrate for cultivation of Shiitake mushrooms on straw. *Bioresource Technology* 45:63–64. doi:10.1016/0960-8524(93)90145-2.
- U.S. FDA. *Guide to Inspections of Low Acid Canned Food*, sections on temperature distribution and heat penetration. Methodological transfer only; not a mushroom-substrate standard.
- All American 1930. `1941X Sterilizer` manufacturer product specification, accessed 2026-08-19.
- `../09_research/commissioning_validation_research.md` — evidence review and transfer limits.
