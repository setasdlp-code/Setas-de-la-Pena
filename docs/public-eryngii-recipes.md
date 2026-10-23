# Recetario de eryngii — 18 de octubre de 2026

Goal: ficha de eryngii conectada con un recetario propio de seis preparaciones.
Scope: `recetas-eryngii.html`, `species-recipes.css`, `species-recipes.js`, enlaces desde las fichas/recetas y configuración pública de rutas, exportación y validación. Excluye Setas OS, Knowledge Base, oferta comercial y despliegue.
Baseline: `codex/home-catalogo-botanico`, HEAD `c7537eb1`; trabajo previo de Home y fichas editoriales sin confirmar, preservado. `.codex/` ajeno al alcance.
Mode: implement. Owner: Codex; revisión independiente de seguridad y consistencia en lectura.
Evidence: investigación facilitada por el usuario en esta conversación; `docs/brand-guidelines.md`, recetario existente, fuentes culinarias y organismos citados en la página.
Acceptance: seis recetas legibles sin JS; escalas de ingredientes ×1/×2/×3 sin multiplicar tiempos; enlaces de ida y vuelta; anchos 320/390/768/1440; ruta y exportación; impresión; `git diff --check`.
Authority: edición y pruebas locales; publicación, despliegue y merge requieren autorización humana. GitHub: ninguna acción solicitada.
Stop: recetario y enlace disponibles en vista previa, con validación local documentada.

## Contenido y límites

Se adaptan las seis propuestas del usuario: medallones con panela/tamarindo, láminas con papas chorreadas, sudado, arroz atollado, chuzos y tartaletas de pipián. Las fichas conservan ingredientes y fracciones; tiempos totales se expresan como rangos estimados para incluir tandas domésticas. Se omiten pesos cocidos, mermas, número fijo de medallones, beneficios moleculares y protocolos profesionales que no fueron validados con esta cosecha.

Las cantidades se muestran para cuatro porciones sin JavaScript. Con JavaScript se habilitan ocho y doce. Los fondos del sudado (500/950/1350 ml), atollado (960/1850/2700 ml) y agua de papas conservan los escalados explícitos de la investigación; son puntos de partida sujetos al recipiente. No se multiplican los tiempos, espesores o temperaturas. Los pasos utilizan fracciones del lote elegido.

**Corrección de seguridad:** el documento suministrado afirma que hervir yuca elimina todo riesgo; FSANZ advierte que los métodos culinarios por sí solos no garantizan una reducción inocua de glucósidos cianogénicos. La receta utiliza yuca comercial ya cocida/lista para calentar según etiqueta; cambia el peso a neto cocido y escurrido. No prescribe tratamiento de yuca cruda. [FSANZ](https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/cassava), revisado el 18 de octubre de 2026.

La conservación doméstica distingue setas frescas de sobras. Para estas últimas: refrigeración en recipientes poco profundos antes de dos horas (una si supera 32 °C), ≤4 °C, 3–4 días o congelación, recalentamiento a74 °C. No se aplica esa temperatura como mínimo específico para eryngii fresco. Fuentes [FDA](https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely) y [USDA](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety).

Cada receta acredita la tradición o guía correspondiente y delimita qué no valida: las cantidades, el uso del hongo y los formatos propuestos siguen pendientes de prueba culinaria. Sin garantías sobre ausencia de alérgenos ni disponibilidad comercial.

La revisión independiente no encontró problemas accionables de seguridad o consistencia entre ingredientes, fracciones y pasos. Es una revisión documental; no acredita resultados de cocina.

## Validación local completada

- `node scripts/quality/check_public_website.cjs` con Chromium local: **50 comprobaciones, 29 capturas, 0 errores de navegador**. Incluye recorrido ficha → recetas → ficha, seis recetas, escalas para 4/8/12, fondos no lineales, apertura desde enlaces incluso al repetir ancla, expansión/restauración de impresión y lectura sin JavaScript; anchos 320/390/768/1440.
- `scripts/export_public_website.py --output /tmp/setas-eryngii-reviewed-20261018/public`: **185 archivos**; ruta `/recetas-eryngii` registrada. Se usa el entorno temporal con los requisitos existentes, sin nuevas dependencias del producto.
- `node scripts/quality/check_public_export.cjs`: **52 comprobaciones, 0 errores** contra ese paquete.
- `node scripts/quality/check_public_delivery.cjs`: **31 comprobaciones, 0 errores** contra ese paquete.
- `node --check species-recipes.js`, compilación sintáctica de scripts Python y `git diff --check`: correctos.

Evidencia funcional: `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-Kzscbj/`. Evidencia de exportación: `/tmp/setas-eryngii-reviewed-20261018/`. Cambios locales sin commit, publicación ni despliegue.

## Diferenciación e ilustraciones — 18 de octubre de 2026

El usuario solicita seis imágenes de eryngii y revisar repetición entre especies; luego aprueba expresamente reformular las tres repeticiones fuertes. Alcance: solo eryngii, sus ilustraciones y comprobaciones. No se modifican las formulaciones de shiitake o melena; no se publica esta iteración sin autorización.

| Repetición detectada | Cambio aprobado en eryngii | Diferencia de servicio |
| --- | --- | --- |
| Salsa oscura/panela y puré de maduro, cercana a melena prensada | Medallones con limón y puré de arracacha | Sellado, salsa ligera y raíz andina |
| Sudado de papa/yuca, cercano al shiitake | Cuartos asados con garbanzos y pimentón | Bandeja al horno, legumbre y superficies doradas |
| Arroz atollado, presente en las tres especies | Desmechado en hojas de lechuga con aguacate y ají dulce | Relleno caliente con soporte fresco, sin arroz |

Las otras tres preparaciones se conservan: láminas con papas chorreadas, chuzos en cintas y tartaletas de pipián. El pipián se comparte con el envuelto de melena, pero cambian corte, soporte y cocción(maíz crujiente/dados frente a vapor/tajadas). La arepa se comparte con shiitake como acompañamiento de chuzos; no es el mismo relleno o formato principal. En shiitake/melena permanecen atollado, mote y encocado; se registran como coincidencias pendientes de una eventual curaduría de esas dos colecciones, fuera del cambio aprobado de tres recetas de eryngii.

Las tres propuestas nuevas conservan pesos frescos600/600/560g. Nuevas proporciones estimadas, sujetas a prueba. Garbanzos comerciales ya cocidos según envase; lechuga y aguacate lavados antes de cortar, acompañamientos refrigerados y montaje inmediato. Se actualizan ingredientes, pasos, alérgenos, escalas, fuentes, títulos, metadatos y navegación; se retira la indicación sobre yuca que dejó de ser pertinente. Los IDs de ancla históricos se conservan por compatibilidad, sin títulos antiguos visibles.

Revisión independiente en lectura: sin hallazgos accionables en coherencia ingredientes/pasos/escalado y manejo. Fuente culinaria de referencia: Great British Chefs(cortes y cocción); Far West Fungi(desmechado y relleno cocido). Las combinaciones nuevas no se atribuyen como recetas tradicionales validadas. FDA7tips respalda lavado de productos frescos.

Se generan seis imágenes con el servicio integrado `image_gen`, usando referencias directas de las ilustraciones de shiitake. Gouache y lápiz, cerámica marfil, borde ocre, fondo cálido y encuadre compacto. Se corrige en una segunda edición la arepa de los chuzos a maíz blanco. Archivos `*-eryngii-gouache.webp` en `assets/illustrations/culinary/`,1254×1254, calidad86, sin recorte ni cambio de tamaño. Prompts, originales y hashes en `sources-eryngii.json`. Cada receta muestra leyenda de ilustración orientativa.

Validación de esta iteración: `check_public_website.cjs`55comprobaciones/31capturas/0errores, incluyendo escalas de tres recetas reformuladas, seis imágenes, navegación e impresión. `check_public_export.cjs`56/0; `check_public_delivery.cjs`35/0. Exportación234archivos en `/tmp/setas-eryngii-variety-20261018/public`. Evidencia funcional en `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-wwWBT5/`. `git diff --check` correcto. Vista previa local en `/recetas-eryngii`; esta iteración no se ha desplegado.

Publicación autorizada por el usuario el18deoctubrede2026: paquete validado de234archivos desplegado al proyecto existente Cloudflare Pages `setas-de-la-pena`, Production/`main`. Despliegue `8fe5a439-40a4-471f-bd9a-b47d45a61fd7`, URL https://8fe5a439.setas-de-la-pena.pages.dev . Dominio público https://setas-de-la-pena.pages.dev/recetas-eryngii . El anterior era `fec7df55-ef0a-4d71-ad25-b7250bd0c9e5`.

Verificación HTTPS contra artefacto exacto: `check_public_live.py` passed,232archivos públicos con SHA256 correcto y13rutas, con cabeceras y descubrimiento. Informe en `/tmp/setas-eryngii-variety-20261018/live-verification.json`. Navegador confirmó seis imágenes y los seis títulos finales. Captura `/tmp/setas-eryngii-variety-20261018/published-eryngii.png`. No se hizo commit, push o merge de GitHub; `main` identifica aquí el entorno de despliegue de Cloudflare.
