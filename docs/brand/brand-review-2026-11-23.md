# Revisión de marca — sitio público, 23 nov 2026

Responsable: Claude · Rama: `claude/modest-mendel-vmykeo` · Base: `main` en `7d7ac3a`.

**Alcance.** Las 15 rutas del `sitemap.xml`, más `/despensa`, `/fichas` y la respuesta 404, servidas en local (`scripts/serve_public_website.py --source`) y capturadas a 1440 y 390 px. Se revisaron el texto visible, `alt`, `aria-label`, meta descripciones, títulos, JSON-LD, CSS públicos, firma, favicon e imagen social. Es la primera revisión después de los cambios del 8 al 20 nov (#485, #487, #512, #516, #523, #525, #526).

**Autoridad.** Identidad comercial v1.2 (`docs/brand-guidelines.md`), tokens DS-2026 (`08_brand/ds-2026/tokens/`), voz v2.5 (`.claude/brand-voice-guidelines.md`) y decisiones del fundador del 8 nov recogidas en `brand-brief-2026-11-08.md` §10. Donde una implementación aceptada después contradice una regla escrita, se trata como conflicto que decide Sebastián, no como error.

**Resultado de la primera pasada: no cumple.** Tras la segunda pasada (guía de marca al pie, pedida por Sebastián) quedan resueltos los 16 hallazgos en el alcance revisado; el n.º 15 se resuelve sin cambio. Aceptación: pendiente de Sebastián.

## Veredicto

La base visual se sostiene: la firma original aparece en todas las páginas del sitemap, «Del micelio a la mesa.» encabeza la portada y la imagen social, Gaya Patched se renderiza en los titulares (comprobado por CDP: `GayaPatched-Medium`) y los validadores de DS-2026 pasan. Los problemas aparecieron en lo añadido después del 8 nov:

1. **Las fichas de especie están abiertas al índice sin licencia de Gaya anotada.** Es la única condición de la guía que tiene consecuencia legal.
2. **Afirmaciones de producto sin producto.** `/despensa` y `/fichas` dicen «secados en la finca», «cultivados y secados en Tenjo», «Cultivo propio en Tenjo, con lote y fecha de cosecha», «Duran meses sin nevera» y «pedido fijo semanal». Hay 0 lotes (`knowledge_base/CURRENT_OPERATIONS.md`, 11 nov). La portada enlaza a `/despensa` desde el pie.
3. **Dos plantillas y dos sistemas de nombres conviven.** `/shiitake` y `/especies/shiitake` son dos fichas de la misma especie con títulos, numeración, navegación y peso tipográfico distintos.
4. **Dos decisiones del 8 nov no se reflejan en el sitio:** la ficha de melena no tiene aviso de cosecha y el bloque «Lo que se investiga» sigue en las tres fichas indexadas.
5. **Una capa de estilo paralela a los tokens.** `species-editorial.css` y `public-minimal.css` redefinen papel, filetes y acento, y redondean tarjetas. Los validadores de DS-2026 no leen esos archivos.

## Reparaciones aplicadas en esta rama

Solo conformidad con reglas confirmadas; ninguna elección creativa.

| Regla | Cambio | Archivos |
|---|---|---|
| Voz §3: sin tuteo, infinitivo | `/recetas-encurtidos` estaba entera en tuteo (13 pasos, avisos de conservación y JSON-LD): «Pon», «Lava», «Refrigera», «Mantén… compruébalo», «Si vas a guardarlo». Pasada a infinitivo; «los hongos» → «las setas» en pasos, como en la corrección del 4 nov | `recetas-encurtidos.html` |
| Voz §3 | «Elige qué cocinar.» (3 recetarios), «Prueba con otro ingrediente», «para tu búsqueda» → «Elegir qué cocinar.», «Probar…», «para esta búsqueda» | `recipe-showcase.js` |
| Voz §3 | «Mira un detalle de la lámina», «Pulsa un número», «Encuentra la explicación» → infinitivo | `especies/{shiitake,melena-de-leon,eryngii}.html` |
| Voz §3 | Meta, Open Graph y Twitter de portada: «Conoce las setas y encuentra ideas para tu cocina» → «Conocer las setas y encontrar ideas para cocinarlas» | `index.html` |
| Voz §3 | «Cocina completamente el shiitake. No lo consumas…» → «Cocinar… No consumirlo…»; «deja que se evapore» → «dejar…»; «Cocina por tandas y ajusta» → «Cocinar… ajustar» | `recetas.html`, `tecnicas.html`, `species-recipes.js` |
| Guía §5: `paper-100` es el fondo principal | `#fafaf7` → `var(--paper-100)`; tarjeta `#F9F9F8` → `var(--paper-50)`. La portada mostraba dos papeles en la misma pantalla (250,250,247 arriba; 250,248,243 abajo) y el catálogo usaba un papel distinto al de `/shiitake` | `home-hero.css`, `public-minimal.css` |
| Consistencia | La portada era la única página con el icono de interfaz de trazo fino como favicon; ahora usa el mismo `assets/favicon.svg` y `apple-touch-icon` que el resto | `index.html` |
| Datos estructurados | JSON-LD de `recetas.html` regenerado con `scripts/inject_public_structured_data.py` (deriva previa en `recipeYield`, ya presente en `main`) | `recetas.html` |

No se tocaron `/despensa` ni `/fichas`: son instrumentos de una prueba con chefs y tienen un PDF asociado; reescribirlos sin regenerar el PDF los desincroniza.

## Segunda pasada: guía de marca al pie · 23 nov

Sebastián pidió aplicar las 16 propuestas tal como las escribe la guía, incluidas las que esperaban su decisión. Donde la propuesta ofrecía opciones, se eligió la que cumple la letra de la guía. Cada cambio se puede revertir por separado.

| # | Aplicado | Archivos |
|---|---|---|
| 1 | Las fichas vuelven a `noindex`: la guía §5 pide la licencia de Gaya anotada antes de abrir el índice. Para reabrir, anotar la licencia y revertir este cambio (`docs/public-launch-switch.md`) | `public-headers.txt`, `robots.txt`, `scripts/serve_public_website.py`, `check_public_delivery.cjs`, `check_public_live.py` |
| 2 | `/despensa` y `/fichas` se escriben como propuesta: «Proponemos secar…», «vida útil por medir», «frecuencia por acordar», «lote y fecha previstos en la etiqueta». Sin «gourmet», «mejor precio» ni «del día». Encuesta sin tuteo. PDF regenerado (3 hojas A4). La portada y los pies ya no enlazan a la despensa | `despensa.html`, `fichas.html`, `outputs/fichas-lineas/fichas-lineas-setas.pdf`, pies de 12 páginas |
| 3 | Lema de portada: «Hongos para cocinar con criterio.»; meta: «Setas de la Peña. Hongos para cocinar con criterio, desde Tenjo, Colombia.» (guía §3, texto de presentación) | `index.html` |
| 4 | `/shiitake` pasa a ser la página de aviso, con la cabecera compartida. Se retiran la lámina, el perfil, la cocina, «De cerca», la conservación y las fuentes que duplicaban `/especies/shiitake`. `/despensa` y `/mundo-micelar` usan la misma cabecera de 4 enlaces, sin barra territorial ni botón en la navegación | `shiitake.html`, `despensa.html`, `mundo-micelar.html`, `public-minimal.css` |
| 5 | Título «Shiitake · Aviso de primera cosecha»; el bloque de entrega y pago queda oculto mientras `availability === 'pilot'` | `shiitake.html`, `shiitake.js` |
| 6 | La ficha de melena enlaza a `/shiitake?especie=melena-de-leon#producto`. El formulario cambia nombre, ficha, recetas y mensaje, y siempre queda en modo aviso, sin presentaciones ni entrega | `especies/melena-de-leon.html`, `shiitake.js`, `shiitake.html` |
| 7 | «Lo que se investiga» sale de las tres fichas. Sus estudios pasan a `/mundo-micelar#investigacion` como fuentes 5–8. Las citas de cada ficha se renumeran y la ficha enlaza a El mundo micelar desde sus fuentes | `especies/*.html`, `mundo-micelar.html` |
| 8 | Tokens: `species-editorial.css` toma papel, tinta, acento, filetes y tipos de DS-2026 (`--brand-accent` vuelve a coral; filetes `--border-hairline`); radio 0 en tarjetas. Se retira el alias `Editorial Plex` | `species-editorial.css`, `public-minimal.css` |
| 9 | `validate.py` añade la comprobación 11: los CSS que importa `commercial.css` no admiten colores sueltos ni `border-radius` distinto de 0/50 %. Detecta los 4 problemas de `main` en `public-minimal.css` | `08_brand/ds-2026/scripts/validate.py` |
| 10 | Rótulos: «Las imágenes son ilustraciones culinarias, no fotografías de producto» en `/cocina` y los cuatro recetarios; «Ilustraciones culinarias» en `/tecnicas`; «Ilustraciones de especie; no representan una cosecha» y «Ilustraciones del equipo, no fotografías de la finca» en `/cultivo` | 7 páginas |
| 11 | Guía de voz v2.6: §1 en modo cuaderno; ejemplos de §4 y §6 con shiitake; los que suponen cosecha marcados «cuando haya cosecha»; sin pedido mínimo | `.claude/brand-voice-guidelines.md` |
| 12 | `/restaurantes` → «Para un servicio»; en `/setas` y `/cultivo`, «La forma y el corte» | `restaurantes.html`, `setas.html`, `cultivo.html` |
| 13 | Imagen social regenerada: «Las setas · Recetas · Para un servicio» | `assets/social/card.html`, `assets/social/setas-de-la-pena.png` |
| 14 | Firma original en las tres hojas de `/fichas` y en las nueve maquetas de `/despensa`. Se recolocó para que no toque la ilustración (medido en cada formato) | `fichas.html`, `fichas.css`, `despensa.html`, `despensa.css` |
| 15 | Sin cambio. La guía §4 prohíbe introducir isotipo o monograma, así que no se deriva un favicon de la «ñ». El icono de hongo sigue como recurso de interfaz | — |
| 16 | Titulares de `/shiitake` en Gaya 500, como en las fichas. IBM Plex se carga una sola vez | Resuelto con n.º 4 y 8 |

Pruebas actualizadas, sin quitar comprobaciones: la navegación compartida se exige también en `/restaurantes`, `/mundo-micelar` y `/shiitake`. El piloto añade el caso `aviso-melena` y verifica que la entrega no aparece en piloto. La prueba de fichas sin JavaScript comprueba que la investigación ya no está y que hay enlace a El mundo micelar. La de El mundo micelar cuenta 8 fuentes y sus citas.

## Hallazgos de la primera pasada

Severidad: **Alta** bloquea el lanzamiento o expone a un reclamo; **Media** contradice una regla o decisión confirmada; **Baja** coherencia.

| # | Sev. | Artefacto | Evidencia | Regla | Reparación mínima | Decide |
|---|---|---|---|---|---|---|
| 1 | Alta | `/especies/*` | `public-headers.txt` quita `X-Robots-Tag` en las tres fichas desde el 14 nov (#512, a pedido de Sebastián el 13 nov). `SOURCES.md` §Gaya: «Licencia comercial: en trámite», tabla sin comprobante | Guía §5: la licencia «debe estar anotada… antes de abrir el sitio al índice» | (a) anotar la licencia; o (b) restituir `noindex` en las fichas hasta tenerla; o (c) servir las fichas con la pila de respaldo `Iowan Old Style, Georgia` | Sebastián |
| 2 | Alta | `/despensa`, `/fichas` | «Shiitake y melena de león secados en la finca», «cultivados y secados en Tenjo», «Cultivo propio en Tenjo, con lote y fecha de cosecha», «Cosecha reciente frente al importado», «Duran meses sin nevera», «Restaurantes de Bogotá y la Sabana · pedido fijo semanal», «al mejor precio por gramo», «Tiendas gourmet». Enlazada desde el pie de la portada y la navegación de la plantilla anterior | Brief §1: «Ninguna pieza puede insinuar producto disponible»; guía §2: sin calendario recurrente; AGENTS.md §1: no inventar estado de producto | Escribir cada línea como propuesta («Proponemos secar…», «vida útil por medir», «frecuencia por acordar») y retirar el enlace de la portada hasta que haya lote. Si la prueba de 4 semanas exige el texto actual, sacar ambas páginas del pie y de la navegación | Sebastián |
| 3 | Alta | Portada | Lema visible «Hongos cultivados a la sombra de Juaica.» (#485). Con 0 lotes, «cultivados» afirma un hecho que aún no ocurre. Además ocupa el lugar del descriptor, que solo queda en `<title>` y en `og.png` | Guía §1: descriptor «Hongos para cocinar con criterio» en presentación; «Esta definición editorial no demuestra… procedencia de una cosecha» | Propuestas: «Hongos para cocinar con criterio, desde la Peña de Juaica.» o «Un cuaderno de cocina a la sombra de Juaica.» Mantener «cultivados» cuando haya primer lote | Sebastián |
| 4 | Media | `/shiitake` frente a `/especies/shiitake` | Dos fichas de shiitake. La primera: «La colección · Ficha 01 · SP. 001 · Archivo de hongos», titular en musgo y peso 900, barra territorial, 6 enlaces y botón de aviso. La segunda: «Cuaderno de especies · Lámina I», titular en tinta y peso 500, 4 enlaces. Lo mismo en `/despensa` y `/mundo-micelar` | Guía §1: secciones «Las setas», «En la cocina», «Origen», «El cuaderno» | Dejar `/especies/shiitake` como ficha y `/shiitake` solo como página de aviso («Aviso de primera cosecha · Shiitake»), con la cabecera compartida. Pasar `/despensa` y `/mundo-micelar` a la misma cabecera | Sebastián (estructura) |
| 5 | Media | `/shiitake` | `<title>` y pie «Shiitake · Cocina y pedidos»; bloque «Condiciones de entrega y pago» visible con `availability: 'pilot'`. Abierto desde la revisión del 4 nov (decisión B) | Brief §1: «Ninguna pieza puede insinuar producto disponible»; estrategia 1 nov, política de afirmaciones: «Precio, formato y stock solo con datos confirmados» | Título «Shiitake · Aviso de primera cosecha»; ocultar el bloque mientras `availability === 'pilot'` | Sebastián |
| 6 | Media | `/especies/melena-de-leon` | 0 enlaces de aviso; shiitake tiene dos. Eryngii no lleva aviso, y eso es correcto («sigue como lámina del cuaderno, sin CTA») | Decisión 8 nov (brief §10 #2; estrategia §4 #1): «La melena lleva el aviso de interés de la primera cosecha» | El formulario de `/shiitake` solo admite shiitake. Hace falta un parámetro de especie en `shiitake.js` (o un formulario común) antes de enlazarlo | Implementación; decisión ya tomada |
| 7 | Media | Las tres fichas | Sección «03 · Lectura y evidencia · Lo que se investiga» (cognición, marcadores inmunitarios, colesterol, vitamina D₂). El texto informa resultados nulos con fuente, pero nombra los beneficios en una página indexada. Se reaplicó el 17 nov (#523) como «textos revisados y aceptados» | Decisión 8 nov (brief §10 #4): el bloque «sale de la ficha de especie y pasa al cuaderno» | Elegir entre la decisión del 8 nov y la implementación del 17 nov. Si se mantiene la del 8 nov: retirar la sección de las fichas y enlazar a `/mundo-micelar#investigacion`, que ya trata la melena | Sebastián |
| 8 | Media | `species-editorial.css:5,281`, `public-minimal.css:15`, `species-editorial.css:130` | `--brand-accent:#EAEAEA` anula el coral en las fichas; filetes `#EAEAEA` en lugar de `--border-hairline`; `--muted:#5A534C`, paneles `#F1F1EB` y `#F3F1EA` sin token; tarjetas con `border-radius: 8px`. Llegaron con la pasada `minimalist-ui` (#516, #523) | Guía §5 «Único entrypoint comercial: `market.css`… no constituyen otra fuente de tokens»; §6 «Bordes rectos» | Adoptar estos valores en DS-2026 y en la guía, o volver a los tokens (`--border-hairline`, `--brand-accent`, radio 0) | Sebastián |
| 9 | Media | `08_brand/ds-2026/scripts/` | `contrast-audit.py` 34/34, `visual-contract.mjs` 17/17 y `validate.py` pasan con el n.º 8 presente: no leen los CSS del sitio | — | Añadir a `validate.py` una comprobación de hex sueltos y `border-radius` en los CSS que importa `commercial.css` | Agente |
| 10 | Media | `/recetas*`, `/cocina`, `/tecnicas`, `/cultivo` | 0 rótulos visibles en 90 imágenes, casi todas gouaches. Las fichas sí rotulan («Ilustración de especie», «Ilustración orientativa de la receta») | Guía §3 y §6: «Ilustración culinaria», rotular y conservar procedencia; brief principio 2 | Pie breve «Ilustración culinaria» en la receta seleccionada y en la tarjeta de `/cocina`. La aprobación de los gouaches más allá de arepa, sopa y patacones sigue sin documentar (brief §10 #12) | Agente tras aprobar #12 |
| 11 | Media | `.claude/brand-voice-guidelines.md` §1, §6 | «Setas de la Peña cultiva y vende hongos comestibles… producción controlada, trazable»; ejemplos con orellana y kilos. `/brand-voice:enforce-voice` carga este archivo. Probable origen del lema del n.º 3 | Estrategia D; decisión D de la revisión del 4 nov, sin ejecutar | Reescribir §1 en modo cuaderno («cultivará…», «prepara el primer lote de shiitake») y marcar los ejemplos de cosecha como «cuando haya cosecha» | Sebastián |
| 12 | Baja | `/restaurantes`, `/setas`, `/cultivo` | «Del cultivo a la cocina» es título y `h1` de `/restaurantes` y rótulo de sección en `/setas` y `/cultivo`. Se acerca a «Del cultivo a tu mesa» (Setas de Cuivá) y compite con la frase principal | Guía §1: una frase principal; la investigación ya señaló a Cuivá | `/restaurantes` → «Para un servicio»; en `/setas` y `/cultivo`, «La forma y el corte» o similar. Resuelve también el n.º 13 | Sebastián |
| 13 | Baja | `og.png` | Pie «Las setas · Recetas · Para chefs». La navegación no tiene sección para chefs; `/restaurantes` no está en el menú | Brief §10 #9, abierta | Unificar el nombre y regenerar con `scripts/render_public_social.cjs` | Sebastián |
| 14 | Baja | `/fichas`, maquetas de `/despensa` | Nombre compuesto en Gaya («Setas de la Peña») en lugar de la firma | Guía §4: no sustituir la firma por texto reescrito | Usar el PNG de la firma en cabecera de ficha y en maquetas de empaque | Agente |
| 15 | Baja | Favicon | El icono de hongo funciona como isotipo aunque el SVG diga lo contrario. Abierto desde el 4 nov | Guía §4 | Decidir si se acepta como símbolo o derivar un favicon de la «ñ» de la firma | Sebastián |
| 16 | Baja | Tipografía | Titulares en Gaya 500 en la plantilla nueva y 900 en `/shiitake` y `/despensa`. IBM Plex se carga dos veces (`Editorial Plex`, TTF) en las fichas | Guía §5 | Se resuelve con el n.º 4 | — |

## Comprobaciones

| Control | Estado | Evidencia |
|---|---|---|
| Firma original en cabecera y pie | Pasa (15/15 del sitemap) | `firma-setas-de-la-pena-original.png` en todas; falla en `/fichas` y maquetas (n.º 14); la 404 no la lleva |
| Jerarquía de mensajes | Falla | Frase principal correcta; descriptor desplazado (n.º 3); frase paralela (n.º 12) |
| Voz: tuteo y ustedeo | Pasa en el sitemap tras esta rama; falla en `/despensa` y `/fichas` | Barrido de imperativos y formas de tú en texto visible, JS y JSON-LD |
| Voz: superlativos, misticismo, exclamaciones, emojis | Pasa | 0 casos en el sitemap. «Sagradas»/«espiritual» en la ficha de melena describen el Shugendō con fuente; «gourmet» solo en `/despensa` |
| Estado del producto | Falla | n.º 2, 3 y 5 |
| Tokens de color | Falla | n.º 8; papel corregido en esta rama |
| Tipografía y licencia | Falla | Gaya renderiza; licencia frente a indexación (n.º 1) |
| Imagen social | Pasa con nota | Firma, frase, descriptor y firma territorial; «Para chefs» (n.º 13) |
| Rotulación de ilustraciones | Falla | n.º 10 |
| Decisiones del 8 nov | Falla | Altitud 2.600 sin rastro de 2.592 en páginas públicas (pasa); melena sin aviso y bloque de investigación (n.º 6 y 7) |
| Desbordamiento móvil | Pasa | 0 px a 390 px en las 18 rutas |

**Sin probar:** sitio publicado en `pages.dev` (solo fuente local), redes sociales (handles sin reservar), presentación a socios (`.pptx`), PDF de `/fichas`, empaque físico, correo y Setas OS (pista B).

## Validación

- `node scripts/quality/check_public_website.cjs`: **85 comprobaciones, 45 renders, 0 errores** (segunda ejecución; la primera falló solo por una petición abortada de `navigation.js` al navegar, sin aserción funcional fallida).
- `check_public_pilot.cjs` 15/15, `check_public_species.cjs` 15 layouts, `check_recipe_showcase.cjs` 9/9.
- `python3 scripts/inject_public_structured_data.py --check`: sin cambios.
- `check_species_ui.cjs` fallaba en `main` (`7d7ac3a`): el primer foco de teclado en `/especies/shiitake` caía en `#fuente-1` y no en `#cocina`. **Corregido en esta rama:** enlace «Ir a las secciones» tras «Imprimir ficha» y selectores de la prueba actualizados a la plantilla del 17 nov. Pasa con 12 recorridos.
- DS-2026: `contrast-audit.py` 34/34, `visual-contract.mjs` 17/17, `validate.py` sin problemas (ver n.º 9 sobre su cobertura).
- `git diff --check` limpio.
