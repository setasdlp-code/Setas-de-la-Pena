# Setas de la Peña — Investigación de marcas y decisiones de identidad

12 de octubre de 2026 · Chefs primero; también hogares · Responsable: Codex.

**Recomendación:** especializar la marca en la relación entre especie y plato. Smallhold aporta claridad culinaria; Foraged y Far West Fungi, preguntas útiles para una cocina profesional; Burlap & Barrel, información del ingrediente; Goldi y los casos Gaya, jerarquía editorial. La combinación propia es **hongos + cocina con ingredientes cercanos + origen documentado en Tenjo**, expresada mediante grabados, gouache y Gaya + IBM.

«Del micelio a la mesa» sigue como firma. No basta como diferenciador: Setas de Cuivá publica «Del cultivo a tu mesa». El trabajo distintivo está en la experiencia, la voz y la composición recurrente, no en una promesa de origen genérica.

[Guía vigente](../brand-guidelines.md) · [Manual visual](../../08_brand/ds-2026/brand-kit/index.html) · [Índice verificable de fuentes](competitive-sources-2026-10.json)

## 1. Método y límites

Pregunta: **¿cómo puede una marca de hongos con ilustración como lenguaje principal ayudar a un chef a imaginar un plato y preparar una consulta comercial?**

Se revisaron diez marcas, una de ellas colombiana, y cinco casos tipográficos elegidos por el usuario. Se capturaron **31 páginas con respuesta HTTP 200, de 32 intentadas**: portadas, fichas, rutas profesionales, recetas y casos tipográficos. Las páginas elegidas sirven para estudiar patrones; no constituyen una muestra representativa del mercado colombiano ni una clasificación de cuota de mercado.

Se capturaron e inspeccionaron **16 imágenes de navegador, de ocho referentes**, a 1440 × 1000: cabecera y segundo tramo. Son vistas puntuales, no auditorías completas de sus sitios. Rancho Gordo y Hi-Fi Mycology se evaluaron mediante HTML y contenido. Los cinco casos Fonts In Use se contrastaron con los créditos actuales y las imágenes inspeccionadas en la investigación previa del 10 de octubre.

Evidencia local en `/workspace/reports/brand-deep-research/`: HTML, texto, URL final, fecha UTC, hashes SHA-256, capturas, metadatos de navegador y registro del transporte. Chromium no aceptó inicialmente la CA del entorno. La captura posterior entregó los recursos GET mediante Python `urllib`, conservando proxy y validación TLS del sistema; bloqueó POST. No se desactivó la validación de certificados. Esta limitación puede afectar elementos dinámicos: Goldi terminó mostrando un error de GraphQL en la segunda captura; Foraged mostró espacios de contenido no cargado; algunas ventanas promocionales y recetas de Cuivá quedaron incompletas. No se atribuyen esos fallos al funcionamiento habitual de las marcas.

Un intento con el dominio supuesto `champinonesdonajulia.com` no fue accesible y **no se usó como referente**. No demuestra que la marca no tenga una web o que exista un bloqueo general de internet.

Clasificación:

- **Observación de fuente primaria:** alta confianza en que la página publica la estructura, texto o imagen descritos. Sus afirmaciones de calidad, certificación, ventas o impacto siguen atribuidas al anunciante; no se verificaron independientemente.
- **Caso tipográfico publicado:** prueba del crédito de aquel proyecto; no demuestra la fuente actual de todo el sitio ni una licencia para Setas.
- **Hipótesis de diseño — Tier 3:** adaptación propuesta para Setas; requiere validación con chefs y hogares. No se midió conversión, preferencia, recuerdo ni ventas.

No se hicieron compras, registros, envíos de formularios, entrevistas ni pruebas de accesibilidad de competidores. Sus imágenes permanecen como evidencia privada de investigación; no se incorporan al kit de Setas.

## 2. Marcas de hongos y alimentos especiales

| Referente y fuentes primarias | Qué se observó | Qué adoptar | Límite de transferencia |
| --- | --- | --- | --- |
| **Smallhold** — [especies](https://smallhold.com/pages/our-mushrooms), [inicio](https://smallhold.com/) | Cada especie se presenta con perfil sensorial, textura, posibles técnicas y ruta para encontrarla. La vista usa títulos serif, filetes, columnas y fotografías de producto junto al empaque. | Nombre cotidiano → perfil → una preparación → siguiente paso. La lámina de Setas identifica el organismo; un gouache aparte expresa su uso. | No copiar su símbolo, ornamento, fotografías, packs, certificación ni disponibilidad. Blue Oyster no prueba propiedades específicas de nuestra orellana gris. |
| **Foraged** — [inicio](https://www.foraged.com/), [profesionales](https://wholesale.foraged.com/), [recetas](https://www.foraged.com/recipes) | Marketplace con identificación del productor y lugar. Tipografía editorial, rótulos condensados y categorías ilustradas conviven con fotografías comerciales. La ruta profesional trata mínimos, precios, pago y pedidos programados. | Dos entradas claras dentro de una marca. Para chefs, preguntar cantidad, ciudad, fecha y uso; explicar después las condiciones confirmadas. Ilustración por función, producto identificado y origen contextual. | Setas es una marca de cultivo, no un marketplace de recolectores. No copiar «rare», recolección silvestre, mínimos de 12 lb, logos de restaurantes ni abastecimiento programado. |
| **North Spore** — [inicio](https://northspore.com/), [historia](https://northspore.com/pages/about-north-spore), [recetas](https://northspore.com/blogs/the-black-trumpet/tagged/recipes) | Se organiza por cultivo interior/exterior, especie y aprendizaje. Una llamada ofrece ayuda para elegir según lo que la persona intenta cultivar. La campaña capturada mezcla fotografía, ilustración, color intenso y promoción. | Educación accesible y elección por intención: en Setas, empezar por qué se quiere cocinar. Mostrar el siguiente paso junto a la explicación. | Su negocio principal incluye insumos y kits; no debe definir el catálogo culinario de Setas. No trasladar estética de la campaña temporal, descuentos, garantías o categorías de bienestar. |
| **Far West Fungi** — [inicio](https://farwestfungi.com/), [profesionales](https://farwestfungi.com/pages/wholesale-and-distributors), [historia](https://farwestfungi.com/pages/our-story) | Secciones por especie, recetas, historia familiar y venta profesional. Su ruta profesional enumera formatos y condiciones de entrega. El empaque de deshidratados usa ilustraciones de hongos grandes y nombre visible. | Ficha legible que dialogue con el empaque; jerarquía de especie, preparación y presentación. Historia humana respaldada, no relato ficticio. | No copiar colores por especie, sello, trayectoria, certificación, formato, entrega diaria o regularidad anual. Su navegación también mezcla bienestar y cultivo. |
| **Hi-Fi Mycology** — [inicio](https://www.hifimyco.com/) | La portada capturada en HTML prioriza extractos, beneficios, suscripción y bienestar; conserva una sección de cocina. | Sirve para decidir con claridad el territorio de Setas: ingrediente culinario y conocimiento de uso. | No es el modelo comercial principal para este encargo. Excluir extractos, promesas de rendimiento cognitivo o medicinal y posicionamiento de suplemento. |
| **Setas de Cuivá** — [inicio](https://www.champinonessetasdecuiva.com/), [para tu negocio](https://www.champinonessetasdecuiva.com/para-tu-negocio/) | Referente colombiano con productos, recetas, pedidos por ciudad y ruta de negocio con portafolio y contacto. La vista destaca champiñones empacados, contexto de preparación y navegación para negocio. | Usar lenguaje comercial comprensible en Colombia y separar consulta para restaurante de inspiración para casa. Informar cobertura cuando sea real. | Es otro tamaño de catálogo y operación. No deducir demanda, cobertura en Bogotá/Tenjo ni capacidad de Setas. El enlace al portafolio se identificó, pero no se auditó el documento enlazado. |

## 3. Marcas de ingrediente como referencia editorial

| Referente y fuentes primarias | Qué se observó | Qué adoptar | Límite de transferencia |
| --- | --- | --- | --- |
| **Burlap & Barrel** — [Wild Mountain Cumin](https://www.burlapandbarrel.com/products/wild-mountain-cumin), [profesionales](https://www.burlapandbarrel.com/pages/wholesale) | Ficha con perfil, tamaño y acción; bloques de origen, proceso, notas sensoriales, ingredientes, técnicas, recetas y abastecimiento. Distingue la cuenta profesional. | Información corta y repetible: sabor/textura, preparación, cantidad solicitada, condiciones y origen del lote cuando exista. | La estructura de datos es útil; sus especies, técnicas, garantías, reseñas y comercio directo no prueban nada sobre Setas. No llenar campos desconocidos con valores de ejemplo. |
| **Diaspora Spice Co.** — [inicio](https://www.diasporaco.com/), [Pragati Turmeric](https://www.diasporaco.com/products/pragati-turmeric), [profesionales](https://www.diasporaco.com/pages/wholesale) | Relaciona recetas con productos y presenta formatos para retail, cocina y volumen. La portada usa ilustraciones en etiquetas, fondos intensos y fotografía del producto. La ficha publica información de procedencia y cosecha. | Hacer que el empaque cuente una historia concreta y que las recetas regresen al ingrediente. Diferenciar el campo para un lote de la declaración de origen del proyecto. | No adoptar su paleta, claims éticos o de salud, formatos mayoristas, antigüedad ni fechas de cosecha. La etiqueta no basta para verificar una cadena de abastecimiento. |
| **Rancho Gordo** — [inicio](https://www.ranchogordo.com/), [Christmas Lima Bean](https://www.ranchogordo.com/products/christmas-lima-beans) | Explica variedad, sabor/textura, peso, preparación, recetas asociadas y condiciones de envío. El ingrediente cotidiano merece una ficha completa, no solo una historia aspiracional. | Una receta completa y una referencia de cantidad son parte del valor de la marca. Un nombre científico puede acompañar sin encabezar toda la experiencia. | No trasladar técnicas, conservación, vida útil ni rendimiento de frijoles a hongos. En esta ronda no se auditó su diseño renderizado. |
| **Goldi** — [Punchy](https://tastegoldi.com/shop/punchy), [inicio](https://tastegoldi.com/), [crédito tipográfico](https://fontsinuse.com/uses/69728/goldi) | Nombre expresivo más categoría explícita, descripción sensorial, formatos y acciones. En la primera vista: mucho espacio, título grande y producto protagonista. El caso documenta **Gaya Italic en el logotipo; Cucina en empaque**, no Gaya + IBM en toda la web. | La personalidad del título necesita un sustantivo que explique el producto. Un solo protagonista y texto útil evitan que la imagen sea mera decoración. | No cambiar el stack a Cucina ni imitar el logo. No adoptar claims de salud, promociones, reseñas, datos químicos ni suscripción. La segunda vista falló bajo nuestro transporte; no se probó compra. |

## 4. Continuidad con los cinco referentes elegidos

Estos son proyectos tipográficos/editoriales, no cinco competidores alimentarios. Los créditos se volvieron a consultar el 12 de octubre; el análisis visual usa las piezas ya inspeccionadas el 10 de octubre en `/workspace/reports/user-design-references/`.

| Caso | Crédito relevante | Decisión para Setas |
| --- | --- | --- |
| [God Soppjakt!](https://fontsinuse.com/uses/61619/god-soppjakt-by-mette-alstad) | Gaya + Proxima Nova | Claridad de guía y dibujos de hongos reconocibles. Adaptar a cocina, sin promover identificación o consumo de setas silvestres. |
| [FLOR](https://fontsinuse.com/uses/57468/flor) | Gaya + Neue Helvetica | Dos campos: imagen y contenido breve; numeración discreta. Sustituir la botánica por micología. |
| [Mohamed Elali](https://fontsinuse.com/uses/61172/mohamed-elali-website) | Gaya + Maax Raw | Obra/producto, nombre, explicación y acción en una jerarquía compacta. No incorporar precios sin verificar. |
| [Nous étions là…](https://fontsinuse.com/uses/64311/nous-etions-la-pour-votre-premier-cri-entende) | Gaya + Inferi | Intimidad editorial, título con ritmo y una imagen amplia. El relato de Tenjo debe partir de personas y hechos propios. |
| [James Ensor](https://fontsinuse.com/uses/60895/james-ensor-inspired-by-brussels) | Gaya Italic + Libre Baskerville + Montserrat | Impacto de portada para piezas puntuales, dejando información y acciones legibles. No copiar colores, arte o composiciones completas. |

**Gaya + IBM permanece.** No se encontró evidencia de que las marcas de hongos examinadas utilicen ese mismo DS. En las capturas, los estilos computados de títulos de Foraged declaran Caslon Ionic; North Spore, Softcore; Smallhold, Kansas; Burlap & Barrel, Poppins. Esto es una observación CSS de esas páginas, no una auditoría de las licencias o de todos sus recursos tipográficos.

## 5. Síntesis estratégica

La oportunidad es un **cuaderno de hongos que ayuda a hacer cocina**: atractivo para un chef, comprensible para alguien que cocina en casa. Esto es una elección de posicionamiento, no un vacío de mercado demostrado.

| Pregunta | Respuesta de marca |
| --- | --- |
| ¿Qué es? | Una marca de hongos desde Tenjo, con orientación culinaria. |
| ¿Para quién? | Chefs y equipos de cocina; también hogares. |
| ¿Qué ayuda a decidir? | Reconocer una especie, imaginar su preparación y reunir datos para consultar. |
| ¿Qué hace propio? | Lámina micológica + receta con ingredientes cercanos + consulta precisa + origen contextual. |
| ¿Qué debe demostrar con producto real? | Presentación, cantidad, precio, disponibilidad, lote, conservación y entrega. |

**Frase de entrada:** «Conoce la seta. Imagina el plato.» Es un titular de campaña, subordinado a la firma «Del micelio a la mesa», no una segunda marca.

**Presentación de 30 segundos:** «Somos Setas de la Peña, un proyecto de hongos desde Tenjo. Acercamos cada especie a la cocina con láminas para reconocerla e ideas para prepararla con ingredientes cercanos. Para una cocina profesional, la conversación empieza en el plato y continúa con cantidad, presentación y entrega.» No afirma stock, producción propia de un lote ni asesoría gastronómica contratada.

## 6. Decisiones implementadas en identidad 1.1

| Hallazgo | Cambio concreto | Dónde se revisa |
| --- | --- | --- |
| Firma de origen poco diferenciadora por sí sola | Mantener frase, acompañarla con propuesta culinaria y comportamiento específico | Guía, portada y presentación |
| Un chef necesita información para conversar | Ficha con perfil referenciado, usos y pauta de consulta de cinco datos | Manual, ficha profesional |
| Referentes fuertes conectan producto y receta | Pareja editorial «la seta / el plato», con especies e ingredientes nombrados | Manual, doble pieza para publicación |
| La ilustración puede explicar sin simular un pack real | Grabado para especie, gouache para preparación; evidencia de producto separada | Guía, imágenes y aplicaciones |
| Serif expresiva necesita interfaz tranquila | Gaya en nombre/títulos; IBM Sans en lectura y Mono solo en cantidades/rótulos | DS existente y manual |
| Hogares y chefs tienen tareas distintas | Mensajes y entradas diferentes dentro de una marca | Guía, voz y presentación para chefs |
| El estado comercial aún está pendiente | CTA para preparar consulta; detalles por confirmar en contexto, sin grandes promesas | Maquetas y ficha |

Se conservaron firma, colores, SVG, ilustraciones aprobadas y el DS canónico. La investigación se aplicó al **kit de identidad y su documentación**. La web pública, sus scripts, el catálogo comercial, Setas OS y la distribución del DS no se modificaron en esta ronda.

## 7. Gramática de las piezas

Tres elementos que deben repetirse, sin inventar un símbolo nuevo:

1. **La lámina:** nombre cotidiano grande, grabado completo y nombre científico secundario. El código de archivo acompaña, nunca sustituye el producto.
2. **La nota:** una idea culinaria concreta y una cantidad de receta, si está documentada. Filete fino y rótulo breve en IBM; fuente o estado de prueba al pie.
3. **El plato:** gouache con lápiz, nombre del plato y acceso a ingredientes/pasos. Maíz, coco y plátano aparecen porque están en las recetas existentes, no como patrón tropical genérico.

Usar papel y tinta como campo principal, musgo para firma/acción y terracota puntual para cocina. No asociar cada especie a una nueva paleta. No ampliar el grabado hasta perder el contorno ni decorar la palabra «Setas» con láminas o micelio. La fotografía propia se reserva para demostrar qué producto se recibe o qué proceso se documentó.

## 8. Qué verificar después y cómo

La identidad visual es revisable ahora. La validación de la propuesta comercial requiere personas y producto reales:

| Prioridad | Acción | Criterio de aceptación propuesto |
| --- | --- | --- |
| Antes de una oferta comercial | Confirmar una ficha de shiitake: formato/peso, precio, disponibilidad, canal, cobertura/condiciones, conservación respaldada | Todos los datos tienen responsable y fecha; el canal realmente recibe la consulta |
| Antes de prometer resultados culinarios | Probar las tres adaptaciones; registrar ingredientes, cantidades, técnica y rendimiento | Una receta reproducida y corregida; estado «probada» solo tras la prueba |
| Primera validación de marca | Sesiones con 4 chefs y 2 personas que cocinen en casa | Protocolo y resultados registrados; cifras propuestas abajo, no resultados actuales |
| Antes de impresión/distribución | Confirmar derechos comerciales de Gaya y prueba de empaque con datos reales | Licencia adecuada; nombre legible; campos y soporte comprobados |
| Próxima aplicación web | Revisar entrada «Para chefs» y recorrido receta → cantidad → consulta | Pruebas móviles y de teclado; ninguna ruta aparenta compra o envío inexistente |

Protocolo propuesto, aún **no ejecutado**: mostrar una pieza cinco segundos y preguntar qué vende la marca; pedir que elijan una especie para un plato, encuentren cantidad/condiciones y preparen una consulta. Al final, comprobar que distinguen ilustración, receta y evidencia de cosecha. Umbral inicial de trabajo: al menos 5 de 6 identifican hongos para cocina y completan la consulta sin ayuda; ningún participante cree que el dibujo prueba stock o un lote. Con seis personas se detectan problemas; no se estima conversión del mercado.

No incorporar aún testimonios, colaboraciones con chefs, sellos, productos nuevos, descuentos o suscripciones sin la evidencia y operación correspondientes. La siguiente mejora comercial depende de **datos reales de producto y contacto**, no de otra exploración tipográfica.

## 9. Reproducción de la investigación

El índice JSON acompaña esta decisión con URL solicitada/final, estado, fecha y hash de cada HTML. El material bruto y los renders están fuera del checkout para no distribuir imágenes de terceros en la marca. Scripts de captura y registros permanecen en `/workspace/reports/brand-deep-research/`.

Antecedentes revisados: `/workspace/reports/setas-customer-brand-research.md` (9 de octubre) y `/workspace/reports/setas-selected-design-direction.md` (10 de octubre). Sus recomendaciones de fotografía precedían la preferencia del usuario por ilustración: la guía 1.1 conserva esta última. Una nueva edición del informe requiere volver a consultar las fuentes; los hashes documentan esta observación, no garantizan que la página permanezca igual.
