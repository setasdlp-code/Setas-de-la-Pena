# Weber Hickory — estimación de trabajo del piloto

Fecha: 2026-11-13. Perfil provisional autorizado por Sebastián para poder formular con este producto. No calibración con resultados de cultivo ni ficha analítica del fabricante.

## Identidad y cálculo

`pellets_weber_hickory` es independiente de `aserrin_roble`. La ficha de [Weber Colombia, ref. 190002](https://www.weber.com/CO/es/accesorios/accesorios-por-tipo-de-asador/accesorios-para-pellets-de-madera/pellets-de-madera-totalmente-naturales-nogal-/190002.html) declara 40 % hickory y 60 % roble por peso, 0 % aditivos, bolsa 20 lb; precio observado $120.000 COP. Confirmar referencia/lote físico; el precio publicado no acredita compra, disponibilidad ni flete. Conversión: 120000/(20 × 0,45359237) ≈13228 COP/kg recibido; los registros de Bodega conservan su prioridad sobre el catálogo.

Estimación química (porcentajes):

| Fracción supuesta | C | N | Fuente |
|---|---:|---:|---|
| 60 % roble | 51,82 | 0,234 | [Koziak et al. 2026, tabla 1](https://www.mdpi.com/1996-1944/19/19/4127) |
| 40 % hickory | 46,8 | 0,100 | [Allison 1965, USDA TB1332, tabla 3, Carya sp.](https://ageconsearch.umn.edu/record/171281/files/tb1332.pdf) |

C = 49,812 %; N = 0,1804 %; C:N = C/N ≈276,12. El cálculo conserva precisión interna; la interfaz resume C≈49,8 %, N≈0,18 %, C:N≈276. Se suman las concentraciones de C y N, nunca se promedian los cocientes.

**Clasificación: hipótesis derivada, confianza baja.** Los datos de partida son muestras publicadas, pero el resultado compuesto no es una medición Weber ni un promedio representativo del mercado. Se aproximan las proporciones comerciales por peso como masa seca, desconociendo humedades separadas; la tabla de Allison consultada no explicita base analítica. Los materiales tienen distintas procedencias y no se conoce la especie exacta de cada fracción Weber. Esta hipótesis no permite sostener que 276 sea estadísticamente el valor más probable.

## Otros supuestos separados

- Humedad 8 %: supuesto de pellets de la receta candidata del proyecto, no medición del saco.
- pH 5,4: aproximación de roble [El Sebaaly et al. 2024, tabla 1](https://pmc.ncbi.nlm.nih.gov/articles/PMC11575786/), no pH medido de Weber ni de la receta hidratada.
- CRA 3, digestibilidad 2, clase de madera dura y penalizador de densidad: proxies del catálogo de aserrín de roble. Su transferencia a pellets no está validada. `analysisProxyId` conserva esa regla explícita del motor; no se elimina silenciosamente para subir la EB.
- Compatibilidad con shiitake: analogía de madera dura para formulación experimental, no ensayo específico de Weber ni receta liberada.

## Uso en el Perito y trazabilidad

El perfil sirve para el cálculo ordinario de la receta manual. El Perito declara la estimación, permite comparar el resultado con sustituciones bibliográficas de C/N manteniendo receta y demás atributos constantes y evita dosis automáticas basadas en la composición estimada. Estas sustituciones representan el pellet completo como proxy; no son diferentes análisis de la mezcla 40/60, no cambian la receta y sus extremos no son un intervalo de confianza.

El guardado de receta/prueba y la creación de lote conservan `predictionSnapshot`: receta, ingredientes con sus supuestos y fuentes, objetivos de especie, fecha, versión de la aplicación, EB cruda, pronóstico mostrado con su historial/banda y comparación de hipótesis. Cambiar posteriormente el catálogo o el borrador no recalcula esa captura histórica. La exportación JSON incluye la captura. La comparación con EB real utiliza el resultado registrado al cerrar el ciclo, sin inventar cosechas.

Validación pendiente: composición química del mismo lote de pellets (C y N sobre base seca común, humedad y límite de cuantificación) y desempeño en el piloto. La incorporación del ingrediente no valida las predicciones ni autoriza intervenir o producir.
