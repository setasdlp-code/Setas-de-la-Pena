# Cocina y nutrición de las fichas de especies

Revisión: 18 de noviembre de 2026. Continuación del PR #526 desde `2001b4ec`, rama propia `codex/species-illustrated-stories`; `origin/main` era `3b78ddd8`. Alcance: tres HTML y estilos, sin cambios en imágenes, JS, recetas, seguridad de cocción, estudios clínicos, registro del cultivo, Knowledge Base ni Setas OS. Lead: Codex; revisión independiente de solo lectura: `ui_review`.

Se añaden cuatro temas: qué cambia al cocinar, usos culturales, composición nutricional y preguntas. Se preservan los IDs, enlaces y referencias anteriores. El flujo de commit/push/PR/deploy está autorizado en la conversación; el merge permanece reservado a aprobación humana.

## Fuente y base de la nutrición

Los registros oficiales USDA FoodData Central, tipo **Foundation**, publicados el 28 de octubre de 2021, se consultaron por la API oficial el 18 de noviembre de 2026. Se identifican por FDC ID, no por una entrada comercial de marca. La documentación [Foundation Foods](https://fdc.nal.usda.gov/Foundation_Foods_Documentation/) establece la base de 100 g de parte comestible.

| Ficha | FDC ID y descripción | Energía, kcal | Proteína, g | Grasa, g | Carbohidratos por diferencia, g | Fibra, g | Agua, g |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shiitake | [1999628, Mushrooms, shiitake](https://fdc.nal.usda.gov/fdc-app.html#/food-details/1999628/nutrients) | 36 | 2,4 | 0,2 | 8,2 | 4,2 | 88,6 |
| Melena de león | [1999626, Mushroom, lion's mane](https://fdc.nal.usda.gov/fdc-app.html#/food-details/1999626/nutrients) | 35 | 2,5 | 0,3 | 7,6 | 4,4 | 88,6 |
| Eryngii | [2003599, Mushroom, king oyster](https://fdc.nal.usda.gov/fdc-app.html#/food-details/2003599/nutrients) | 38 | 2,4 | 0,3 | 8,5 | 3,0 | 88,1 |

- Energía: nutriente **2048**, Atwater específico, redondeado a kcal enteras. Valores originales: 36.3915875 / 35.107387 / 38.460412. No se mezclan con los valores del nutriente 2047, Atwater general.
- Proteína: **1003**, calculada; valores originales 2.414375 / 2.5 / 2.40625 g.
- Grasa: **1004**, analítica; 0.195 / 0.2563 / 0.3075 g.
- Carbohidratos: **1005**, por diferencia, calculados e incluyendo la fibra; 8.170625 / 7.5897 / 8.50065 g. No son carbohidratos disponibles ni se les suma otra vez la fibra.
- Fibra: **1079**, analítica; 4.166 / 4.376 / 3.009 g.
- Agua: **1051**, analítica; 88.6 / 88.57 / 88.13 g.
- Los gramos se redondean a un decimal. La porción RACC de 85 g que también aparece en los registros no se utiliza como denominador.
- Las descripciones finales no explicitan preparación. No se publica «fresco/crudo» como dato verificado, ni se deduce ese estado solo a partir del agua. Se muestran como alimentos de referencia USDA, con su base y método. No se extrapolan a producto seco, extractos, recetas o cosecha local.

Clase: **Tier 1, base institucional con medidas analíticas y valores derivados**. Confianza alta para la transcripción y el método; aplicación a la cosecha de Setas de la Peña no verificada. Los JSON completos consultados y la comparación independiente del HTML quedan en `/workspace/reports/species-kitchen-20261118/`.

## Cocina y cultura

| Tema | Fuente exacta | Alcance y clase |
| --- | --- | --- |
| Dorar frente a cocinar al vapor | [USDA AMS / Mushroom Council, Simple Sautéed Mushrooms](https://content.govdelivery.com/attachments/USDAAMS/2020/10/13/file_attachments/1569393/vegu-recipe-october-15-simple-sauteed-mushrooms.pdf), consejo final | Una capa de setas y sartén amplia. Tier 2, referencia culinaria institucional. No se trasladan sus minutos a una cocción universal ni al shiitake. |
| Melena: pérdida de humedad, reducción y piccata | [Smallhold, Mushroom Piccata](https://smallhold.com/blogs/recipes-13/mushroom-piccata-recipe), introducción y método | Tier 3, receta de un productor. Aplicación concreta; sin garantía de resultado local. Prensado y desmenuzado se enlazan a las propuestas locales, señaladas pendientes de prueba. |
| Shiitake seco, dashi y cocina shōjin | [MAFF, The Washoku Way](https://www.maff.go.jp/j/shokusan/gaisyoku/pamphlet/pdf/washoku_english.pdf), p. 39 impresa | Tier 2, publicación institucional sobre cultura culinaria. No se usan sus afirmaciones promocionales de salud. |
| Melena en sopas, sukiyaki y salteados | [FFPRI, informe de 2008](https://www.ffpri.go.jp/research/project/documents/chukanhoukoku_1.pdf), p. 23 impresa, entrada ヤマブシタケ | Tier 2, descripción institucional. Se omiten los pasajes de usos medicinales y no se recuperan relatos de cocina imperial sin verificar. |
| Eryngii en Japón desde alrededor de 1993 | [MAFF/FFPRI, 2014](https://www.affrc.maff.go.jp/docs/project/pdf/seika/before2015/led-kinoko1.pdf), p. 26 impresa, entrada エリンギ | Tier 1, informe de investigación, confianza alta para el dato atribuido. También describe textura, sabor suave y versatilidad. Ningún parámetro de producción se traslada a la finca. |

Las preguntas reutilizan además las fuentes de morfología, ecología, nombres, secado y seguridad ya incluidas en las bibliografías. Las indicaciones de cocción completa del shiitake y los límites de la investigación clínica se conservan. Los perfiles culinarios siguen identificados como referencias generales y las recetas locales siguen pendientes de prueba.

## Revisión y verificación

El revisor independiente comprobó las 18 cifras, unidades, base y método, y contrastó las citas culturales. Se corrigió una atribución de prensado/desmenuzado a la piccata mediante enlaces a las propuestas locales; la observación quedó cerrada. No quedan bloqueos en el alcance revisado.

Las comprobaciones específicas comparan el HTML con los JSON oficiales consultados, preservan el contenido previo de investigación/conservación/registro/recetas/láminas y prueban las cuatro secciones en cinco anchos. La verificación de impresión y los recorridos generales de fichas se ejecutan con las pruebas existentes. No se declara aprobada la suite general de sitio que tuvo un fallo de Chromium en la revisión anterior.

Resultados: fichas, 15 disposiciones y seis recorridos sin errores de navegador; contenido final, otros 15 casos con las 18 cifras correctas, enlaces previos y contenido protegido conservados; los tres PDFs sin JavaScript incluyen tablas y preguntas. El paquete final de 352 archivos pasó 84 comprobaciones de exportación y 60 de entrega. `git diff --check` correcto. La primera ejecución de fichas encontró el servidor local detenido tras reiniciar el entorno; se inició y la ejecución completa terminó correctamente.
