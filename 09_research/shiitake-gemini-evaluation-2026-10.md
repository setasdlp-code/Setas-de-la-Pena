# Shiitake · Evaluación del informe Gemini para la web culinaria

14 de octubre de 2026 · Decisión de implementación documental, sin ensayo de cocina ni validación de procesos industriales.

## Material recibido y alcance

El usuario entregó «Tratado Técnico de Micología Aplicada y Ciencia de los Alimentos: Lentinula edodes (Shiitake)», atribuido a Gemini Argon. Se leyó completo. Copia preservada en `/workspace/reports/setas-recipe-improvements/gemini-original.txt`; SHA256 `89fc900b7011863b02c4e751bc3410eb9d0d1fdbaebb9ad783f238388a461ec3`.

El texto aporta hipótesis sobre extracción de sabor, modificación de textura y desarrollo de productos. No demuestra resultados en las recetas de Setas de la Peña. Las formulaciones, curvas térmicas, porcentajes y rendimientos no se convierten en parámetros operativos por aparecer en el informe.

Se aplica a la web pública junto con la [auditoría culinaria](../docs/public-website-recipe-audit-2026-10.md). No modifica parámetros de cultivo, lotes, Setas OS ni procedimientos de la base de conocimiento.

## Qué se incorpora

| Aporte cualitativo del informe | Aplicación en la web | Evidencia y límite |
| --- | --- | --- |
| Diferenciar sombrero y tallo según textura | Retirar las partes leñosas y cortar uniformemente las partes aprovechables en las tres recetas | Mejora de preparación; no se promete ablandar cualquier tallo ni producir hebras equivalentes a carne. |
| Controlar humedad superficial y carga de sartén | Secar después del lavado, cocinar por tandas y evaporar líquido en rellenos | Compatible con las fuentes culinarias ya enlazadas y el método de salteado. No se fija porcentaje final de humedad. |
| Elegir la técnica según el plato | Salteado para rellenos; cocción en caldo para sopa, seguida de coco y ácido al final | Propuesta culinaria pendiente de prueba, sin promesa de optimizar GMP ni rendimiento sensorial. |
| Registrar variables de textura y sabor | Se conserva el estado «pendiente de prueba» y se propone medir corte, tandas, rendimiento y ración | Las cantidades siguen siendo formulaciones de trabajo; no se inventan datos medidos. |

Las correcciones sanitarias proceden de fuentes oficiales, no de inferencias bioquímicas del informe: cocción completa del shiitake con ANSES, higiene y enfriamiento con FDA, recalentamiento de sobras con FoodSafety.gov. La opción de yuca cruda se retira conforme al hallazgo de la auditoría y a la incertidumbre de preparación documentada con FSANZ.

## Qué queda como investigación sin validar

No se incorporan a las recetas domésticas los baños a 65 °C, ciclos de congelación/descongelación, sous-vide, impregnación al vacío, enzimas añadidas, acidificación por dosis fija, jerky ni estimaciones de actividad de agua. Faltan la especificación completa del proceso, mediciones del producto y validación de conservación.

Las afirmaciones de triplicar GMP, EUC superior a 950, pérdidas aromáticas nulas, eliminación de turbidez del 100 % o cambios de resiliencia del 45 % no tienen datos de ensayo del proyecto. Tampoco se deduce un pH final o una actividad de agua a partir de una fórmula, tiempo o pérdida de masa.

El adjunto contiene una contradicción interna sobre trehalosa: aparece como ejemplo de azúcar reductor y luego como disacárido no reductor. Los objetivos de actividad de agua del jerky también cambian entre secciones sin aportar mediciones. Estos puntos refuerzan la necesidad de verificar las afirmaciones antes de diseñar un procedimiento.

No se ha evaluado aquí la autorización de aditivos o enzimas para una preparación comercial concreta, ni se presentan las formulaciones como productos listos para fabricar o vender.

## Contraste bibliográfico limitado

Se consultó Crossref para tres referencias. El registro completo está en `/workspace/reports/setas-recipe-improvements/crossref-verification.json`. **Confirmar metadatos no equivale a validar las condiciones experimentales o las conclusiones del adjunto.** No se revisaron íntegramente los ocho trabajos citados.

| Referencia | Resultado del contraste | Alcance admisible |
| --- | --- | --- |
| Yamaguchi et al., 1971 | Coinciden título, revista, volumen y páginas. DOI [10.1111/j.1365-2621.1971.tb15541.x](https://doi.org/10.1111/j.1365-2621.1971.tb15541.x). | Es literatura sobre intensidad y sinergia sensorial. No acredita los valores EUC ni los protocolos térmicos del adjunto para un caldo del proyecto. |
| Dermiki et al., 2013 | El título y los datos del adjunto difieren del artículo registrado: *Contributions of non-volatile and volatile compounds to the umami taste and overall flavour of shiitake mushroom extracts and their application as flavour enhancers in cooked minced meat*, Dermiki, Phanphensophon, Mottram y Methven, *Food Chemistry* 141(1), 77–83. DOI [10.1016/j.foodchem.2013.03.018](https://doi.org/10.1016/j.foodchem.2013.03.018). | Debe corregirse la cita antes de atribuirle tablas concretas. Los metadatos por sí solos no confirman esos parámetros. |
| Zivanovic et al., 2000 | El registro es *Textural Changes in Mushrooms (Agaricus bisporus) Associated with Tissue Ultrastructure and Composition*, *Journal of Food Science* 65(8), 1404–1408. DOI [10.1111/j.1365-2621.2000.tb10621.x](https://doi.org/10.1111/j.1365-2621.2000.tb10621.x). | La especie y los datos bibliográficos difieren de la atribución del adjunto. No valida los regímenes de shiitake sous-vide o autoclave propuestos. |

## Estado de la evidencia y siguiente prueba

- **Confirmado documentalmente:** instrucciones y advertencias de las fuentes oficiales enlazadas; metadatos de las tres referencias consultadas; coherencia calculable de los ingredientes escalados.
- **Hipótesis culinaria:** mejoras de sabor, jugosidad y textura de las formulaciones adaptadas. Deben probarse en cocina.
- **No verificado:** parámetros industriales, valores químicos finales, merma, rendimiento real, vida útil y equivalencia de textura con carne.

La siguiente prueba debe registrar peso de compra, peso limpio, cortes, equipo, tamaño de tanda, tiempos observados, peso cocido y ración servida para una base de cada receta. Después se comprueba ×3 con capacidad real. No sustituir esa prueba por una puntuación editorial ni por las cifras del informe recibido.
