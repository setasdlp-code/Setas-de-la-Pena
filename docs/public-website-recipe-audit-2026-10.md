# Auditoría culinaria y manejo de setas · Web pública

14 de octubre de 2026 · Alcance: tres recetas con shiitake, guía de conservación, cantidades y consulta. Auditoría documental; sin prueba en cocina.

## Dictamen

Las recetas tienen una base útil y distinguen correctamente las adaptaciones propuestas de las recetas probadas. La orientación de limpieza y frío está respaldada. **La opción de yuca cruda en la sopa requiere una corrección preventiva antes de considerar cerrada esa formulación.** También conviene precisar la cocción completa del shiitake, completar la técnica de los patacones y añadir recalentamiento de sobras.

No se ha demostrado que una preparación concreta cause una intoxicación. Las prioridades siguientes reflejan el defecto de instrucción y la consecuencia posible, no una estimación de incidencia. Los tiempos, rendimientos y resultados sensoriales continúan sin validar en cocina.

## Versión y método

Se revisaron `recetas.html`, `shiitake.html`, `recipe-data.js` y `recetas.js`. Los cuatro archivos publicados se contrastaron por HTTPS con la exportación vigente; coinciden. El texto de los HTML coincide con las fuentes locales, aunque el exportador transforma los enlaces de `index.html` a `home.html`.

Se leyeron las cinco fuentes culinarias enlazadas, las guías de conservación citadas y fuentes sanitarias adicionales. Se revisaron por separado técnica y escalado, con una segunda revisión de las conclusiones sobre yuca y shiitake. No se cocinaron platos, midieron mermas ni hicieron análisis de producto.

Evidencia y páginas descargadas: `/workspace/reports/setas-recipe-audit/`. El inventario distingue páginas obtenidas, búsquedas de descubrimiento e intentos fallidos; una búsqueda o un enlace no accesible no se usa como prueba sanitaria.

## Hallazgos priorizados

| Prioridad | Hallazgo | Ubicación | Recomendación |
| --- | --- | --- | --- |
| Alta | Yuca pelada sin preparación previa definida, cocida directamente en el caldo que se consume | `recetas.html:46–47` | Omitir provisionalmente la opción de yuca cruda. Reintroducirla cuando se defina producto alimentario, tratamiento y preparación específicos. |
| Media | Cocción de shiitake poco reproducible y sin advertencia específica | `recetas.html:39,47,55` | Mantener «bien cocido» y explicar que no debe consumirse crudo ni poco cocido; documentar método según corte, cantidad y equipo. |
| Media | Las sobras no tienen instrucciones de recalentamiento | `recetas.html:63` | Añadir 74 °C en todo el alimento al recalentar sobras y hervor de sopas/salsas, con fuentes. |
| Media | El primer paso de patacones omite detalles presentes en su referencia | `recetas.html:55` | Explicar preparación de la piel, cocción cubierta con agua, precalentado y bandeja. Probar textura y tiempo de la adaptación. |
| Media | Se escala la cantidad, pero faltan instrucciones de capacidad y tandas | `recetas.html:39,52–55`; `recetas.js:33` | Mantener el aviso existente y concretar tandas para sartén/horno y capacidad de olla. No multiplicar tiempos automáticamente. |
| Media | Gramos netos de receta se trasladan a consulta sin distinguir peso de compra | `recetas.html:33`; `recetas.js:25–31` | Aclarar que son gramos limpios y que presentación, peso de compra y merma se confirman por separado. |
| Baja | Tamaños y rendimientos dependen de unidades sin especificar | `recetas.html:36,44,52`; `recipe-data.js` | Medir tamaño de arepa/plátano, peso cocido y ración en una prueba de receta base. |
| Baja | Aceite de patacones descrito para pincelar, aunque también se usa para saltear | `recetas.html:54–55` | Distinguir ambos usos; fijar cantidades después de probar. |

### 1. Sopa: yuca opcional

El ingrediente actual es «200 g de yuca pelada en cubos pequeños, opcional». El paso indica «Agrega el caldo y, si la usas, la yuca. Cocina hasta que esté tierna; no la sirvas cruda o dura».

[FSANZ, Cassava and bamboo shoots](https://www.foodstandards.gov.au/consumer/chemicals/cassava) explica que la yuca contiene glucósidos cianogénicos y que la reducción por métodos de cocción varía. No permite deducir que alcanzar una textura tierna, sin definir el producto ni su tratamiento, garantice un resultado seguro. La receta no especifica variedad, presentación alimentaria ni tratamiento previo, y utiliza el líquido como sopa.

**Corrección propuesta:** omitir por ahora la yuca cruda opcional y formular la sopa con shiitake, caldo y coco. Si se desea conservar ese ingrediente, identificar una presentación alimentaria concreta con instrucciones verificables y documentar cómo incorporarla de forma adecuada. No tratar toda yuca comercial colombiana como idéntica ni inventar un tiempo universal de desintoxicación.

Esta auditoría no establece el contenido de cianógenos de los 200 g de yuca ni demuestra toxicidad de la sopa. Tampoco prescribe los métodos de fermentación prolongada del artículo como receta doméstica. En esa misma fuente, la instrucción de hervir ocho a diez minutos y desechar el agua corresponde a **brotes de bambú**, no a yuca; no se debe trasladar esa cita a la raíz.

### 2. Shiitake: cocción completa

Las recetas **ya exigen cocinar** los hongos: «cocinados y tiernos», «tiernos y bien cocidos» y «cocinados y tiernos». No recomiendan servirlos crudos. Lo que falta es una indicación específica sobre el shiitake y un procedimiento que otro cocinero pueda reproducir.

[ANSES y DGCCRF](https://www.anses.fr/en/news/anses-and-dgccrf-reiterate-importance-cooking-shiitake-mushrooms-thoroughly-eating-avoid) advierten de dermatitis por consumo de shiitake crudo o insuficientemente cocido y señalan que un salteado rápido puede resultar insuficiente. La recomendación se refiere también al shiitake seco o en polvo. El documento no establece un tiempo o temperatura universal trasladable sin más a estas tres formulaciones.

**Texto común propuesto:** «Cocina completamente el shiitake antes de consumirlo. No lo sirvas crudo ni poco cocido; un salteado rápido puede ser insuficiente. Sigue las instrucciones del producto y cocina las tandas de manera uniforme».

Para cerrar los métodos, definir el corte, la carga por sartén u olla y la secuencia de cocción; luego registrar el resultado de la prueba. El dorado es una señal culinaria útil, pero no valida por sí solo la cocción completa. No copiar como umbral sanitario los minutos de un blog que permite intercambiar varias especies de hongos.

### 3. Enfriamiento, sobras y recalentamiento

La página indica correctamente refrigerar a 4 °C o menos, dentro de dos horas, o de una hora con ambiente por encima de aproximadamente 32 °C. También propone recipientes pequeños para enfriar y atribuye los tres a cuatro días a sopas/guisos con manejo correcto, sin convertirlo en vida útil del shiitake fresco.

Falta explicar que no hay que esperar a que una olla alcance temperatura ambiente: [FDA](https://www.fda.gov/food/buy-store-serve-safe-food/refrigerator-thermometers-cold-facts-about-food-safety) permite introducir comida caliente dividida en recipientes pequeños. Conviene añadir «poco profundos» y mantener los límites de tiempo. No guardar una olla grande de sopa como única masa de enfriamiento.

**Texto propuesto para completar:** «Recalienta las sobras hasta alcanzar 74 °C en todo el alimento, comprobados con termómetro. Al recalentar sopas o salsas, llévalas a hervor. Divide la comida en recipientes pequeños y poco profundos para refrigerarla pronto; no esperes a que una olla grande se enfríe sobre la mesa».

Fuentes: [FoodSafety.gov, temperatura de sobras de cualquier tipo](https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures), [FDA, refrigeración y recalentamiento](https://www.fda.gov/food/buy-store-serve-safe-food/refrigerator-thermometers-cold-facts-about-food-safety) y [tabla de conservación](https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts).

Los 74 °C citados corresponden a **recalentar sobras**. No se presentan como un umbral validado que sustituya las instrucciones específicas de cocción inicial del shiitake. La guía doméstica tampoco valida por sí sola un procedimiento de enfriamiento o servicio profesional.

### 4. Patacones: recuperar un método completo

La [fuente culinaria enlazada](https://www.mycolombianrecipes.com/baked-patacones-o-tostones/) indica recortar extremos, hacer una incisión longitudinal solo en la piel, cubrir los plátanos con agua y cocer hasta ablandar. También indica precalentar el horno a 400 °F y preparar la bandeja. Luego se pelan y aplastan aún tibios.

La adaptación conserva correctamente el horneado de siete a nueve minutos y unos siete minutos al otro lado como **referencia de la fuente**, pero omite varios pasos anteriores. La aproximación a 200 °C es razonable para 400 °F; esto no demuestra que el tiempo produzca la misma textura en cualquier horno o espesor.

**Corrección propuesta:** recuperar preparación de piel, agua, precalentado y bandeja; indicar grosor objetivo de la base después de una prueba. Mantener el manejo cuidadoso de los plátanos calientes y el montaje justo antes de servir. Para cantidades grandes, usar varias bandejas o tandas sin prometer el mismo tiempo total.

### 5. Escalado y compra

La revisión independiente ejecutó el modelo de ingredientes y comprobó ×1, ×2, ×3 y retorno a ×1. La aritmética, los intervalos y los rendimientos vuelven a la receta base correctamente. El aviso de la interfaz ya explica que los tiempos corresponden a la base y pueden cambiar con más cantidad; no es un error del cálculo.

| Receta a ×3 | Cantidad comprobable en el modelo | Implicación culinaria que falta concretar |
| --- | --- | --- |
| Arepa | 900 g de shiitake limpio y 12 arepas | Varias tandas de hongos y calentamiento de arepas. |
| Sopa | 900 g de shiitake y 3 litros de caldo + leche de coco, antes de sólidos | Olla con espacio suficiente, retorno al hervor y enfriamiento por porciones. |
| Patacones | 750 g de shiitake y 24 bases | Capacidad de bandejas, tandas de salteado y conservación de textura antes del montaje. |

El peso limpio excluye las partes leñosas, de acuerdo con la nota general. Una consulta de 300 g limpios no demuestra que basten 300 g de producto de venta con tallos. **Aclaración propuesta:** «La receta indica peso limpio aprovechable. La consulta comunica esa necesidad; el peso y la presentación de compra se confirman según el producto recibido». Medir merma antes de proponer un porcentaje.

Los rendimientos de dos personas, cuatro entradas o dos a cuatro personas son previsiones transparentemente rotuladas. Para una ficha reproducible faltan pesos/tamaños de las unidades y rendimiento cocido; esta auditoría no demuestra que las porciones sean incorrectas.

## Lo que está bien y debe mantenerse

- Lavar los hongos con agua corriente y secarlos antes de cocinar. [FDA](https://www.fda.gov/consumers/consumer-updates/7-tips-cleaning-fruits-vegetables) y [Mushroom Council](https://www.mushroomcouncil.com/mushroom-101/faqs/) respaldan el lavado; no corresponde cambiarlo por «nunca lavar setas».
- Retirar las partes leñosas y expresar las recetas en shiitake fresco limpio. La sopa y los patacones dependen de esa nota común; puede repetirse brevemente para facilitar recetas leídas por separado.
- Usar tandas en el salteado de arepa, evaporar líquido, añadir ajo hacia el final, dorar el maíz por separado y montar las bases al servir. Son decisiones culinarias coherentes, pendientes de prueba de la formulación.
- Añadir coco con hervor suave y terminar con limón. La secuencia concuerda con la [referencia de sopa](https://www.feastingathome.com/tom-kha-gai/); el sabor y la proporción de la adaptación no se validan leyendo esa referencia.
- Seguir el envase, evitar condensación y separar hongos de carnes crudas y químicos. [Penn State](https://extension.psu.edu/preparing-and-preserving-mushrooms) respalda el recipiente original o la bolsa de papel para hongos sueltos.
- Mantener avisos de adaptación sin prueba en cocina y no inventar caducidad de un lote, tiempos de cocción garantizados ni equivalencias automáticas fresco/seco.

## Complementos útiles

Añadir una preparación higiénica común: manos y utensilios limpios, agua potable, lavar el aguacate antes de cortarlo y las hierbas que se añadirán crudas. [FDA](https://www.fda.gov/consumers/consumer-updates/7-tips-cleaning-fruits-vegetables) indica manos con agua y jabón durante veinte segundos, lavar vegetales antes de pelarlos, agua corriente sin jabón para los alimentos y secado limpio.

La guía de [NCHFP para congelar hongos](https://nchfp.uga.edu/how/freeze/vegetable/freezing-mushrooms/) respalda el pretratamiento antes de congelar. Conviene distinguir ese tratamiento de conservación de una instrucción para comer shiitake: no convertir un escaldado o calentamiento parcial en indicación de que está listo para servir. La preparación posterior sigue necesitando cocción completa.

No recomendar probar un hongo sospechoso para decidir si se conserva. La página ya acierta al señalar que moho, viscosidad u olor anormal justifican descarte y que una apariencia normal no garantiza seguridad.

## Cierre de validación propuesto

1. Resolver primero la yuca y el texto común sobre cocción de shiitake; completar sobras y método de patacones.
2. Cocinar una base de cada receta y registrar producto utilizado, peso neto, corte, equipo, tandas, tiempos observados, rendimiento y evaluación de textura/sabor.
3. Probar ×3 con capacidad real. Confirmar que los tiempos estimados y las porciones siguen siendo útiles; medir la merma entre compra y peso limpio.
4. Actualizar conjuntamente HTML y `recipe-data.js` si cambian ingredientes o cantidades, conservar fuentes y comprobar el recorrido de consulta e impresión.

La auditoría original fue de solo lectura. En la implementación posterior autorizada se retira la yuca cruda, se completan higiene, cocción, patacones, tandas, pesos netos y recalentamiento. Se mantienen pendientes las pruebas de cocina, merma, porciones y validación de tiempos. El contraste del adjunto Gemini y sus límites quedan en [la evaluación de investigación](../09_research/shiitake-gemini-evaluation-2026-10.md). La publicación y comprobaciones se registran por separado en `/workspace/reports/setas-recipe-improvements/`.
