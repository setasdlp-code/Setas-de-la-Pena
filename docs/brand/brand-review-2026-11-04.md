# Revisión de marca — sitio público, 4 nov 2026

Responsable: Claude · Alcance: las 13 páginas del `sitemap.xml`, el texto que generan `shiitake.js` y `pilot-log.js`, la imagen social y los CSS públicos. Se contrasta con la voz v2.5 (`.claude/brand-voice-guidelines.md`), la identidad comercial v1.2 (`docs/brand-guidelines.md`) y la estrategia del 1 nov (`brand-strategy-2026-11-01.md`). El sitio envía `noindex`: todo lo que sigue es **previo al lanzamiento**.

## Veredicto

La identidad visual y la jerarquía de mensajes se cumplen. La firma original aparece en las 27 cabeceras y pies, «Del micelio a la mesa.» está escrita igual en todas las páginas y no hay exclamaciones, superlativos ni lenguaje místico. Hay tres frentes por resolver:

1. **Tratamiento en recetas.** Unas 42 formas de tuteo («Lávate», «Si usas», «No esperes») en las tres páginas de recetas, el 404 y la ficha de melena.
2. **Comportamiento antes de la primera cosecha.** La ficha de shiitake todavía se presenta como «Cocina y pedidos» y muestra un bloque de entrega y pago.
3. **La guía de voz se quedó atrás de la estrategia.** Sus ejemplos se construyen sobre la orellana con kilos y pedidos mínimos. `/brand-voice:enforce-voice` la carga automáticamente, así que seguirá generando copy fuera de la estrategia.

## 1. Identidad visual

| Aspecto | Estado | Evidencia |
|---|---|---|
| Firma | Cumple | `firma-setas-de-la-pena-original.png` en las 27 apariciones; imagen social con firma, frase, descriptor y firma territorial |
| Paleta | Cumple | 0 hex, rgb o hsl sueltos en los 8 CSS públicos; todo pasa por tokens de DS-2026 vía `commercial.css` → `market.css` |
| Tipografía | Cumple | Titulares con `var(--font-editorial)` (Gaya Patched), lectura con `var(--font-sans)` y cantidades con `var(--font-mono)`; un `@font-face` de IBM Plex Sans en `website.css:435`. *Corregido el 8 nov: esta fila decía «solo sans y mono», lo que no era cierto.* |
| Sombras, degradados y radios | Cumple | 0 en CSS público (la `.franja` de `color-bands.css` es un subrayado de corte duro y ninguna página la usa) |
| Contraste | Cumple | `contrast-audit.py` 34/34 · `visual-contract.mjs` 17/17 · `validate.py` sin errores. Estos validadores cubren las maquetas del DS; la cobertura del sitio sale de la revisión de CSS de arriba |
| Coral como texto pequeño | Cumple | Ningún `color: var(--coral-500)` en CSS público |

Pendientes menores:
- `theme-color` es `#2E3B2F` (musgo), correcto. Pero `manifest.webmanifest` y `sw.js` en la raíz siguen siendo de «Field OS», con `#F6F4EC` (papel antiguo) y PP Object Sans. Ninguna página pública los enlaza. Conviene excluirlos de la exportación pública.
- El favicon es `mushroom.svg`, que la guía §4 define como «recurso de interfaz, no símbolo exclusivo». Usarlo como favicon lo convierte de hecho en símbolo. Hace falta decidirlo o derivar un favicon de la firma.
- `color-bands.css` define `.franja--ocre` con `sand-500`, que no está en la tabla de §5 de la guía. Es CSS muerto: borrarlo o documentarlo.

## 2. Voz en el sitio

| Regla | Estado | Detalle |
|---|---|---|
| Sin exclamaciones ni superlativos | Cumple | 0 casos |
| Sin misticismo | Cumple | 0 casos |
| Frase, descriptor y nombre | Cumple | Exactos en todas las páginas; 0 «SdP» |
| Sin tuteo ni ustedeo | **No cumple** | ~42 formas: `recetas-eryngii.html` (~19), `recetas-melena.html` (~12), `recetas.html` (~10), `404.html`, `especies/melena-de-leon.html` |
| «Seta» antes que «hongo» | Parcial | 182 frente a 79; el exceso de «hongo(s)» está en recetas («Cómo conservar los hongos», «Cocinar el hongo antes de servir») |
| Nombre científico una sola vez | Parcial | Se repite 4–7 veces por ficha (meta, subtítulo, cuerpo, fuente, pie) |
| Dato con estado | Casi cumple | Una excepción: «La base rinde unas doce tartaletas pequeñas» (`recetas-eryngii.html`), sin «estimado». Además, «Sin probar» (`recetas.html`) convive con «pendiente de prueba» en el resto |
| Titulares de 3–6 palabras | Parcial | ~9 títulos de receta de 7–8 palabras. Son nombres de plato, así que es aceptable |

### Correcciones mecánicas (sin decisión del fundador) — aplicadas el 4 nov

Aplicadas en el HTML, con el JSON-LD regenerado por `scripts/inject_public_structured_data.py` y la línea de la salsa de soya de `recipe-data.js` alineada para que la receta escalada diga lo mismo. Excepciones:
- No se tocó el punto decimal («1.5 g»), porque lo lee el escalado de recetas.
- Se mantuvieron los usos de «hongo» de nivel reino o descriptor y los títulos de fuentes citadas: «Es un hongo saprótrofo», «Hongos · Maíz · Coco · Plátano», el pie «Hongos · Cocina · Origen» y «NCHFP · Congelar hongos».

| Página | Ahora | Propuesta |
|---|---|---|
| `recetas.html` | «Lávate las manos…», «No uses jabón», «Presenta con cilantro», «Guárdalo seco» | «Lavarse las manos…», «No usar jabón», «Presentar con cilantro», «Guardar seco» |
| `recetas-eryngii.html` | «Si usas bebida vegetal», «Marca rombos», «Sala al final», «No esperes… consúmelas… Recalienta» | «Si se usa…», «Marcar rombos», «Salar al final», «No esperar… Consumir… Recalentar» |
| `recetas-melena.html` | «Trabaja por tandas», «Si no consigues chillangua», «deséchalo», «No aprietes» | «Trabajar por tandas», «Si no se consigue…», «Descartar», «No apretar» |
| `404.html` | «Puedes volver a las setas o buscar una receta» | «Volver a las setas o buscar una receta.» |
| `especies/melena-de-leon.html` | «formar cuerpos blancos» · «…un enjuague breve, y seca.» | «forma cuerpos blancos» · «…y secar.» |
| `recetas-melena.html` | «Melena de león fresca, limpiar y aprovechable» (×7) | «limpia y aprovechable» |
| `recetas*.html` | «los hongos», «el hongo» en pasos y conservación | «las setas», «la seta» |
| `recetas-eryngii.html` | «La base rinde unas doce tartaletas» | «Rendimiento estimado: unas doce tartaletas pequeñas.» |
| `recetas.html` | «Sin probar» | «Pendiente de prueba» |
| `<title>` de recetas y shiitake | separador «—» | «·», como en `index.html` y `setas.html` |
| Recetas y cocina | alt «Ilustración de a la plancha, con papas chorreadas» | «Ilustración de eryngii a la plancha con papas chorreadas» |
| Varias | «salsa de soja» frente a «soya», «zumo» frente a «jugo» | «soya», «jugo» |

## 3. Llamadas a la acción

La guía fija «Recibir aviso de la primera cosecha». Sin canal abierto, el botón dice «Preparar mensaje de aviso». El formulario de shiitake y `restaurantes.html` lo cumplen. Lo que se desvía:

- **Navegación (12 páginas): «Aviso de cosecha ↗».** Ese rótulo no figura en la guía y suena a inscripción. Propuesta: «Aviso de primera cosecha», añadido a la tabla de §3 de la guía como rótulo corto de navegación.
- **Recetas 04–09** cambian «Quiero cocinar esto» por «Aviso de primera cosecha». Hay que elegir una pauta: la receta lleva «Quiero cocinar esto» y el aviso va en la ficha de especie.
- **Imagen social: «Para chefs»**, mientras la navegación dice «Restaurantes». Hay que unificar el nombre de la sección.
- Las fichas de melena y eryngii no tienen CTA de aviso. Coincide con la propuesta n.º 1 de la estrategia.

El enlace «Consultar por WhatsApp» está oculto mientras `commercial-data.js` tenga `whatsapp: null`, así que hoy no se ve. El mensaje que se prepara en modo piloto también está bien: pide aviso y no menciona pedido ni precio.

## 4. Decisiones del fundador

| # | Tema | Situación | Propuesta |
|---|---|---|---|
| A | **Bloque «Lo que se investiga»** en las fichas de melena (función cognitiva), shiitake (marcadores inmunitarios) y eryngii (vitamina D₂) | Cada uno informa un resultado nulo o no transferible, con fuente, así que no es una afirmación de salud. Pero la estrategia §4 #5 dice «Ninguna pieza alude a beneficios», y nombrar cognición o inmunidad en una ficha de especie alude a ellos. | Llevarlo al cuaderno o a «El mundo micelar», o retirarlo hasta la revisión INVIMA. Esto bloquea el lanzamiento según la regla de la propia marca. |
| B | **Ficha de shiitake en modo compra** | `<title>`, cabecera y pie dicen «Cocina y pedidos»; la meta descripción dice «consulta de disponibilidad»; el bloque «Condiciones de entrega y pago» (zona, días de despacho, envío, «Medios de pago: se confirman con el pedido») es visible en modo `pilot`. | «Shiitake · Ficha y recetas»; meta «…y aviso de primera cosecha»; ocultar el bloque de entrega y pago mientras `availability === 'pilot'`. |
| C | **Melena al frente** (estrategia §4 #1, sigue abierta) | El grabado del hero pone «dos melenas de león al frente» y la imagen social le da el mismo peso que al shiitake. La ficha ya no tiene CTA, así que está alineada a medias. | Si se confirma «solo shiitake», poner el shiitake al frente en el hero y en la imagen social. |
| D | **Ejemplos de la guía de voz** (§4 tabla de tono, §6) | Están construidos sobre la orellana con cosecha y stock: «38 kg de orellanas rumbo a Bogotá», «40 kg. Pedido mínimo 5 kg», «Cortada esta mañana», «80 kg/semana». Contradicen DEC-013 (solo shiitake), la estrategia D (sin cosecha) y la guía comercial §2 («No proponer mínimos»). | Reescribirlos con shiitake y en modo cuaderno, y marcar los de cosecha como «cuando haya cosecha». Es el arreglo de más impacto, porque esa guía alimenta a `/brand-voice:enforce-voice`. |
| E | **«Seta» o «hongo»** | La guía de voz §5 prefiere «seta» en uso público, pero el descriptor oficial es «Hongos para cocinar con criterio». | Dejar escrito que «hongos» vale en el descriptor y en lo general, y «seta(s)» para cada especie y en cocina. |
| F | **Licencias** | La licencia comercial de Gaya y los derechos de la firma siguen sin confirmar (guía §4–5). La firma solo existe en PNG rasterizado. | Resolverlo antes de cualquier impresión o empaque. |
| G | **Empaque** (estrategia §4 #6, sigue abierta) | `PACKAGING_SPECS.md` usa `#C85A32`, `#161B14` y `#F6F4EC` en lugar de `coral-500 #B8614D`, `ink-900 #1A1410` y `paper-100 #FAF8F3`, un sello de «2.600m» y un QR a `/trace?lote=`, que no existe. | Alinearlo con los tokens y quitar el QR. |

Estado de los demás puntos de la estrategia §4: la **altitud** (2.592 frente a 2.600) no aparece en ninguna página pública; solo está en DS-2026 (`DESIGN_SYSTEM.md`, `SOURCES.md`, `PACKAGING_SPECS.md`) y en los simuladores antiguos. Los **handles de redes** (`@reallygreatsite`) siguen sin reservar.

## Método

Se extrajo el texto visible de las 13 URL del sitemap (incluidos alt, aria-label y meta descripción) y se revisó regla por regla; los hallazgos principales se comprobaron en el código fuente. El texto que generan `shiitake.js` y `pilot-log.js` se revisó aparte. Los CSS públicos se revisaron buscando colores, fuentes, sombras y degradados, y se corrieron los tres validadores de DS-2026. Quedan fuera las redes sociales, el correo, las presentaciones y el empaque físico.
