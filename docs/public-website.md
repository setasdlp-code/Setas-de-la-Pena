# Web pública de Setas de la Peña

Sitio estático independiente de Setas OS. La portada presenta un catálogo micológico de shiitake, melena de león y eryngii, y enlaza el origen y nueve recetas; la ficha de shiitake conecta la información culinaria con una consulta de disponibilidad y pedido.

## Páginas y diseño

- `index.html`: portada, filtros, fichas breves y enlaces de consulta.
- `shiitake.html`: ficha completa, solicitud de cantidad y municipio, entrega y conservación.
- `recetas.html`: nueve propuestas con shiitake: arepa, sopa de coco, patacones, atollado, ajiaco, mote de ñame, encocado, sudado y maduro con queso. Incluye ingredientes, pasos, fuentes, cantidades ajustables e impresión.
- `recipe-data.js`: IDs estables y gramos base de shiitake por receta (`receta-arepa` 300 g, `receta-sopa` 300 g, `receta-patacones` 250 g). Cada receta enlaza a `/shiitake?recipe=<id>&scale=<1-3>#producto`; solo se aceptan IDs conocidos y factores `1`, `2` o `3`, cualquier otro valor deja la consulta normal. Sin presentaciones, la cantidad precargada son los gramos; con presentaciones, los gramos de la receta se mantienen aparte y se propone `ceil(gramos / peso por presentación)` con la diferencia de peso visible. Los datos de 300/300/250 g deben coincidir con `recetas.html` (el chequeo lo comprueba).
- Home botánico (`index.html`, `home-catalog.css`, `website.js`): entrada breve con la montaña ilustrada, tres láminas con género, nombre común, nombre científico y perfil culinario. Cada lámina abre la ficha de especie con teclado, cierre con Escape y restitución del foco. Shiitake conserva su ficha completa y consulta; melena y eryngii son informativos. No se publican ofertas ni datos agronómicos de Setas OS.
- Guía de preparación: «Elegir por preparación» despliega los filtros sopa/caldo, saltear, asar y desmenuzar/en piezas, con usos de referencia citados. «Quitar filtro» restaura las tres especies. Sin JavaScript se leen las tres láminas y hay un enlace a la ficha completa de shiitake. Las referencias de eryngii se apoyan en la sección Trumpet Mushrooms de Smallhold; no son una cata de nuestra cosecha.
- Cantidades ajustables (`recetas.html`): `recipe-data.js` guarda cada ingrediente con cantidad como dato base inmutable (`data-ing` en el HTML enlaza ambos) y `recetas.js` recalcula siempre desde él para ×1/×2/×3 (Receta base/Doble/Triple), por receta. «Al gusto», ingredientes sin cantidad, tiempos y consejos de cocción no se escalan; los rangos (`1–2`, `2–4 personas`) escalan como rangos. Sin JavaScript se ven las cantidades base. Un enlace `/recetas?recipe=<id>&scale=<1-3>` aplica el factor solo a esa receta; `/shiitake?recipe=<id>&scale=<1-3>` pide `base × factor` gramos. Hay un chequeo de concordancia modelo/HTML en `scripts/quality/check_public_website.cjs`. No hay selector de comensales (2/4/6) hasta definir una base de porciones.
- `typography.html`: estudio tipográfico, excluido de indexación.

La entrada comercial es `commercial.css`, que combina el DS `08_brand/ds-2026/market.css` y `website.css`. El exportador la aplana, resuelve sus recursos y minifica en un único CSS versionado sin imports. Gaya + IBM Plex es la combinación comercial; Bricolage y Libre Baskerville permanecen en `typography.html`. Los parámetros históricos `pairing` se conservan en navegación mediante `commercial-navigation.js`, sin cargar el laboratorio ni cambiar fuentes comerciales.

Las especies usan grabados del DS; las recetas usan nueve gouaches con lápiz generados con IA y rotulados como ilustraciones. Procedencia, prompts y hashes: `assets/illustrations/culinary/sources.json`. Las rutas de los PNG originales describen el entorno de generación y no son dependencias del sitio.

## Datos comerciales

`commercial-data.js` contiene exclusivamente datos públicos confirmados. Por defecto faltan WhatsApp, presentaciones, precios, disponibilidad, entrega y pago; la ficha funciona como consulta, sin prometer producto disponible.

- `whatsapp`: número internacional con `+` y código de país. Sin un número válido no aparece el enlace de WhatsApp.
- `availability`: `unconfirmed`, `available` o `unavailable`.
- `presentations`: lista de `{ id, name, weightGrams, priceCOP }`; peso positivo en gramos y precio en pesos enteros, o `null` si falta precio.
- `deliveryAreas`, `deliveryDays`, `paymentMethods`, `batch`, `harvestDate`: texto confirmado o `null`.
- `deliveryFeeCOP`: pesos enteros, `null` si falta el costo; `0` representa entrega sin costo, sujeta a cobertura.

Sin canal confirmado se muestra un aviso de prelanzamiento y el resultado se identifica como borrador local no enviado. Para restaurantes se admiten frecuencia y fecha deseada opcionales; esas preferencias no prometen disponibilidad ni entrega. La consulta genera un mensaje revisable y permite copiarlo. Con presentaciones confirmadas calcula el peso y subtotal; el envío queda separado. WhatsApp se abre solo por acción del cliente y el pedido se confirma en la conversación. No existe backend de pedidos, cobro, reserva de inventario ni persistencia de datos del cliente.

Las recetas son adaptaciones de fuentes publicadas, pendientes de prueba en cocina. La revisión culinaria añade higiene común, cocción completa de shiitake con fuente ANSES, tandas, patacones con método completo y recalentamiento de sobras a 74 °C con fuentes FDA/FoodSafety.gov. La sopa no incluye yuca cruda opcional. Modelo y HTML mantienen 300/300/250 g netos en las tres recetas originales y 500/400/300/350/500/250 g en las seis propuestas nuevas; consulta y mensaje distinguen necesidad limpia y peso de compra sin inventar merma. La información doméstica de conservación conserva sus referencias y no establece la vida útil de un lote. La investigación de Gemini se contrastó como hipótesis de I+D: sus protocolos numéricos de vacío, enzimas y conservación no se presentan como recetas validadas.

## Desarrollo y verificación

Desde la raíz del repositorio, iniciar el servidor en una terminal:

```sh
python3 scripts/serve_public_website.py --source --port 4187 --directory .
```

En otra terminal:

```sh
node scripts/quality/check_public_website.cjs
```

El chequeo reutiliza `@playwright/test` de `field-os-simulador/setas-os`. En un checkout nuevo, ejecutar `npm ci` en ese directorio e instalar Chromium con `npx playwright install chromium`. El script usa Chromium del sistema si existe o el navegador de Playwright. `CHROMIUM_EXECUTABLE_PATH` permite elegir otro ejecutable.

`SETAS_WEBSITE_BASE_URL` permite cambiar el servidor de prueba; `SETAS_WEBSITE_AUDIT_DIR` cambia la carpeta de resultados. Por defecto crea una carpeta temporal con capturas, PDFs y `audit.json` con hashes del código y los renders.

El chequeo cubre 320, 390, 768 y 1440 píxeles, imágenes, enlaces y fragmentos, tipografías, navegación, teclado, validación, copia y alternativa ante permiso denegado, precios y cantidades con fixtures sintéticos, falta de stock, números inválidos, invalidación del mensaje y ausencia de persistencia. También comprueba navegación e impresión de las recetas y fallback sin JavaScript. Los fixtures se interceptan solo en el navegador y nunca se escriben en `commercial-data.js` ni se envían por WhatsApp.

## Publicación

El workflow de GitHub Pages actual publica `field-os-simulador/setas-os`. Esta web de la raíz requiere una configuración de publicación propia; esta implementación no cambia el despliegue de Setas OS.


## Iteración comercial: recorrido para chefs

La portada usa «Conocer la seta. Imaginar el plato.» y el descriptor «Hongos para cocinar con criterio.». La sección `#para-chefs` conecta especie, uso culinario, cantidad y consulta. Los enlaces con `purpose=restaurante` preseleccionan el contexto de restaurante en shiitake; desde recetas, ese contexto se conserva al ajustar ×1/×2/×3 y transferir los gramos. Valores desconocidos no modifican la selección doméstica predeterminada. No hay persistencia de datos.

Plex Sans sirve prosa e interfaz; Plex Mono se limita a datos y metadatos. El identificador histórico `data-pairing="mono"` se conserva por compatibilidad de enlaces. En móvil las fichas culinarias se leen en una columna.

`design-system.html` y `manual.html` son páginas de acceso y resumen. En la integración del PR 381 se recuperaron las fuentes canónicas: `08_brand/ds-2026/mockups/market/17-culinary-market.html` (componentes culinarios) y `08_brand/ds-2026/brand-kit/index.html` (manual completo, firmas, referencias y aplicaciones). Cada acceso enlaza a su fuente, incluida con sus dependencias en la exportación. Los originales permanecen en su ubicación; no se reconstruyen ni duplican como una segunda fuente.

### Exportación local reproducible

```sh
python3 scripts/export_public_website.py --output /workspace/reports/cloudflare-setas/public
```

El destino debe estar vacío y fuera del repositorio. El exportador conserva los archivos anteriores y rechaza sobreescribir una carpeta existente. Copia únicamente dependencias locales enlazadas desde las páginas semilla; no lee configuración ni autenticación de hosting. Genera `export-audit.json` con rutas, fuentes y SHA256.

Convierte `index.html` en `home.html`, `design-system.html` en `index.html` y actualiza sus enlaces. Conserva `shiitake.html`, `recetas.html`, `typography.html` y `manual.html`. Cloudflare Pages sirve las rutas limpias `/home`, `/shiitake`, `/recetas` y `/manual`; `scripts/serve_public_website.py` reproduce estas rutas y la respuesta 404 para validación local. Crear la exportación no la publica.


## Mejora técnica publicada · 15 de octubre de 2026

Ver `docs/website-audit-2026-10-15.md` para alcance, evidencia y pendientes. La exportación añade canonical, Open Graph, Twitter Card, Organization sin ofertas ni contacto inventado, imagen social 1200×630, robots, sitemap y404 real. Genera WOFF2, imágenes responsivas WebP y JS con hashes; `_headers` conserva noindex de revisión y caché inmutable solo para nombres versionados. El HTML revalida.

La fuente `404.html` impide el fallback SPA de Pages. `public-headers.txt` y `public-redirects.txt` se copian como controles al artefacto, sin leer credenciales. En esa publicación el sitio comercial mantenía tres especies culinarias y una de archivo. La iteración local del Home del 18 de octubre sustituye esa colección por las tres especies solicitadas: shiitake, melena de león y eryngii.

Después de exportar y servir el paquete, ejecutar `check_public_export.cjs` y `check_public_delivery.cjs` con `SETAS_EXPORT_AUDIT_DIR`, `SETAS_EXPORT_DIR` y `SETAS_EXPORT_BASE_URL` apropiados. Tras un despliegue autorizado, `python3 scripts/quality/check_public_live.py --artifact <public> --report <informe.json>` verifica el paquete exacto por HTTPS, rutas, cabeceras y consultas de URL sin enviar mensajes ni introducir fixtures en producción. Las pruebas locales y las verificaciones remotas son evidencias distintas.

Despliegue verificado: `43b20e8c-746d-4dc3-9f7f-ee442777880c`, proyecto existente `setas-de-la-pena`, producción `main`, https://setas-de-la-pena.pages.dev/home. No implica commit, push ni merge a main.


## Iteración del Home · 18 de octubre de 2026

```text
Goal: Home como catálogo micológico de shiitake, melena de león y eryngii.
Scope: index.html, website.js, home-catalog.css, commercial.css y sus verificaciones/documentación. Excluye Setas OS y datos comerciales.
Baseline: origin/main c7537eb1; rama codex/home-catalogo-botanico; .codex/ ajeno preservado.
Mode: implement
Owner: Codex; sin colaboradores.
Evidence: docs/brand-guidelines.md, index.html, website.js, simulador-app.jsx:14712, scripts/quality/check_public_website.cjs.
Acceptance: navegador a 320/390/768/1440 px, tres especies, fichas y filtros con teclado, consultas y recetas sin regresión, exportación y git diff --check.
Authority: cambios locales y validación no destructiva; publicación y GitHub requieren aprobación humana.
GitHub: none
Stop when: implementación local revisable y comprobaciones completadas.
```

Se conservan Gaya + IBM Plex, los colores de marca, rutas, anclas y navegación principal. La imagen de montaña ya existía en `assets/botanical-mushrooms-mountain.png`; no se genera ni duplica. Los grabados proceden del mismo DS que Setas OS. `home-catalog.css` se importa después de `website.css` y limita sus cambios a `.home-page` o a los nuevos componentes del catálogo. La sección Origen sigue la superficie papel del Home.

La portada anterior priorizaba una consulta de shiitake, repetía la especie en el hero y en la colección, y mostraba orellana/reishi. La nueva entrada prioriza explorar las tres especies solicitadas y deja la elección por preparación en un desplegable. Se mantienen los recorridos de chefs, recetas, cuaderno y consultas. Esta iteración no modifica ni publica producción.

Validación local completada para esta iteración:

- `node scripts/quality/check_public_website.cjs`: 32 comprobaciones, 21 renders, sin errores de navegador. Incluye lectura a 320/390/768/1440 px, nombres visibles a 1280×800, menú móvil, fichas, filtros, consulta, recetas y fallback sin JavaScript.
- `scripts/export_public_website.py`: paquete de 176 archivos generado fuera del repositorio con las dependencias ya declaradas en `scripts/requirements-public-website.txt`.
- `node scripts/quality/check_public_export.cjs`: 36 comprobaciones, sin errores.
- `node scripts/quality/check_public_delivery.cjs`: 15 comprobaciones, sin errores; fuentes WOFF2, imágenes responsivas en las fichas, metadatos, rutas y foco del diálogo.
- `node --check` para los tres JS modificados y `git diff --check`: correctos.

Evidencia de esta sesión: `/tmp/setas-home-catalogo-20261018-v2/` (exportación, manifiesto, informes y capturas); suite funcional en `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-mFe5te/`. Son artefactos locales temporales. Ninguna de estas verificaciones confirma un despliegue remoto.

Titular del Home (25 de octubre de 2026): «Del micelio a la mesa.» es el titular de página (44–68 px) bajo el dibujo de la peña, seguido de «Valle de Tenjo, Cundinamarca» en Plex. Sigue la frase principal de `docs/brand-guidelines.md`; reemplaza «Cultivo en sombra.», tagline de `.claude/brand-voice-guidelines.md` §7. No vuelve el bloque de introducción ni el CTA del hero anterior; el titular y «Las setas» siguen visibles a 1280×800.

Ajuste solicitado del Home: se elimina la sección «05 · Antes de consultar» (`#consultas`) y el enlace «Preguntas sobre tu consulta» del pie. Se conservan el pie de marca, las referencias culinarias y los accesos a la ficha de shiitake.

## Cuaderno editorial de especies

Las tres páginas `/especies/shiitake`, `/especies/melena-de-leon` y `/especies/eryngii` desarrollan la identidad, ecología, cocina, conservación y curiosidades de cada especie. Se accede desde «Leer la ficha» del catálogo o desde la vista rápida. La consulta comercial de `/shiitake` conserva su ruta y funcionamiento. Arquitectura, límites y evidencia: [public-species-editorial.md](public-species-editorial.md). Las páginas se incluyen como rutas comerciales en el servidor, exportador y sitemap, con imágenes responsivas y metadatos de artículo.

«Del nombre al origen» se integra en las fichas editoriales: nombres en shiitake, textura en melena y trazabilidad del origen en eryngii. El Home ya no repite esas notas en una sección propia; `#cuaderno` sigue funcionando como entrada al catálogo.

El recetario de eryngii vive en `/recetas-eryngii`, con seis propuestas y cantidades para 4/8/12 porciones. [Alcance y fuentes](public-eryngii-recipes.md). Se enlaza desde su ficha y desde el recetario de shiitake.

El recetario de melena de león vive en `/recetas-melena`, con seis propuestas, cantidades4/8/12 y regreso a la ficha editorial. Comparte estilos y comportamiento con eryngii en `species-recipes.css/js`. [Alcance y fuentes](public-melena-recipes.md).

## Voz sin tratamiento directo · 23 de octubre de 2026

Portada, ficha de shiitake, recetas y mensajes dinámicos siguen la guía de voz v2.2: sin tuteo ni ustedeo, acciones en infinitivo y frases centradas en ingrediente, preparación y pedido. La primera persona del cliente en el borrador de consulta se conserva porque identifica a quien solicita el producto. Se mantienen cantidades, temperaturas, tiempos, fuentes y avisos de seguridad; el cambio de redacción no valida recetas ni datos comerciales.

## Publicación autorizada · 25 de octubre de 2026

El usuario pidió actualizar la web pública en la conversación del PR 404. Producción servía entonces `807d1c9c` (rama local `codex/web-underline-footer`, despliegue `01215fe8-7298-4ff3-b9a0-fe548365db06`), que no estaba en `main`. Por decisión del usuario se integró en la rama del PR 404 antes de publicar, para no retirarla: titular sin franja coral, descriptor «Del micelio a la mesa.», pie verde, bandas de título y pulido de interacción.

Antes de desplegar, la comparación página por página con producción solo mostró cambios en `/home` (descriptor y espacio en «Para chefs»), y la del CSS solo las reglas del titular y de interacción. No se retiró ninguna regla de `807d1c9c`.

- `check_public_website.cjs`: 55 comprobaciones, 31 renders, 0 errores.
- `check_public_export.cjs`: 56 comprobaciones, 0 errores. `check_public_delivery.cjs`: 35 comprobaciones, 0 errores (`CHROMIUM_EXECUTABLE_PATH` apuntando al Chromium de Playwright).
- `wrangler@4.151.1 pages deploy`, proyecto `setas-de-la-pena`, Production/`main`, commit `bdb8fe75`: despliegue `ec9e0d30-8d3d-42a2-bc8b-4d046627f403`, https://ec9e0d30.setas-de-la-pena.pages.dev . Paquete de 234 archivos.
- `check_public_live.py`: passed, 232 archivos públicos con SHA256 exacto, 13 rutas.

`main` designa el destino de Cloudflare, no una integración Git: el PR 404 sigue pendiente de merge.
