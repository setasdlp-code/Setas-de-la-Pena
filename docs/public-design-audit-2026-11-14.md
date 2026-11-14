# Web pública: implementación y auditoría de diseño

14 de noviembre de 2026. Base: `origin/main` en `6939cba1`; rama local `codex/public-species-ui-audit`. Revisión de la fuente vigente servida localmente, más comprobación HTTPS de los textos de despensa/fichas. No se ha publicado esta implementación.

## Resultado

Se corrigieron el foco de los filtros, la atribución de sus recomendaciones, la jerarquía de las tarjetas y el acceso a las fichas. El catálogo y las tres fichas comparten cabecera y pie. Las fichas presentan el recetario junto a la introducción y comienzan la lectura práctica por cocina. Los datos adicionales se pueden desplegar y permanecen disponibles sin JavaScript y al imprimir.

A 390 px, cada tarjeta pasó de aproximadamente 472 a 232 px de altura; la tercera especie aparece en y≈776, antes en y≈1321. El acceso inicial al recetario de las fichas está en y≈538–572, y «En la cocina» en y≈1253–1297, antes en y≈2496–2864. Son mediciones de disposición en este navegador, no resultados de conversión o pruebas con personas.

La aplicación de `minimalist-ui` conserva la identidad canónica Gaya + IBM Plex y los grabados existentes: papel cálido, tinta, titulares contrastados, bordes `1px solid #EAEAEA`, tarjetas de radio 8 px, acciones de 44 px y entradas suaves por `IntersectionObserver`, desactivadas con movimiento reducido. No se añadieron fuentes, bibliotecas de iconos, imágenes de stock, gradientes ni dependencias del producto. Las fichas mantienen una columna de lectura y una lámina lateral en escritorio; en móvil, la información se apila.

## Hallazgos pendientes de la auditoría completa

1. **P1 — Despensa y fichas comerciales mezclan propuestas con afirmaciones sin validación de vida útil.** En `/despensa` se lee «Duran meses sin nevera» y, en la misma página, «vida útil por validar en laboratorio». `/fichas` afirma «cultivados y secados en Tenjo», «Duran meses fuera de la nevera» y «Cultivo propio en Tenjo, con lote y fecha de cosecha». Las frases también se verificaron en las respuestas HTTPS publicadas de ambas rutas. Su presencia está verificada; la duración y la procedencia de lotes concretos siguen **sin verificar en esta auditoría**. Hace falta contrastarlas con evidencia de producto o formularlas como propuestas. El rediseño no cambia estos textos ni sus PDFs asociados. Fuentes: `despensa.html`, `fichas.html`; copias de respuesta en `/tmp/setas-live-{despensa,fichas}-20261114.html`.
2. **P2 — La navegación visual todavía cambia en páginas anteriores.** `/shiitake`, `/despensa` y `/mundo-micelar` conservan cabecera territorial, más enlaces y avisos globales; `/restaurantes` actúa como puente a cultivo/técnicas. El catálogo, las fichas de especie y los recetarios comparten ahora la cabecera reducida. La unificación de las demás plantillas queda señalada como siguiente intervención de diseño, preservando el formulario comercial.
3. **P2 — Dos referencias del sistema de diseño no son responsivas.** `08_brand/ds-2026/mockups/ficha-editorial.html` desborda a 320/390/768 px; `08_brand/ds-2026/mockups/receta.html`, a 320/390 px. Son prototipos rotulados «datos ilustrativos», enlazados desde `/`, no fichas de producto. No deberían confundirse con las páginas comerciales ni usarse como procedimientos de cultivo. Decidir si deben seguir en el artefacto público o adaptarse como referencias responsivas.
4. **P3 — Semántica de páginas auxiliares.** Axe identifica contenido fuera de regiones en `/shiitake`, `/despensa`, `/restaurantes` y `/mundo-micelar`; `/fichas` carece de `main`. `/restaurantes` salta de `h1` a `h3`. Las dos referencias que desbordan también tienen avisos de idioma y regiones. Son hallazgos de buenas prácticas y accesibilidad automática; no equivalen por sí solos a una evaluación WCAG completa.
5. **Decisión de publicación pendiente.** La raíz `/` sigue siendo el sistema de diseño y la portada comercial es `/home`. No se modificaron redirecciones ni reglas de indexación. La elección de la entrada comercial requiere una decisión de publicación separada.

## Revisión individual de las 26 páginas

Se inspeccionó cada página a 320/390/768/1440 px, con capturas de escritorio y móvil y comprobación automática de accesibilidad. La lista comprende las veinte rutas nominales, la respuesta 404 y las cinco referencias HTML alcanzables por el grafo del exportador. Las 21 rutas principales suman 84 combinaciones sin desbordamientos ni imágenes rotas. Las cinco referencias suman otras 20; sus desbordamientos se detallan arriba.

| Página | Resultado de diseño y observación |
| --- | --- |
| `/home` | Revisada. Titular, ilustración y acciones mantienen una entrada clara; menú móvil abre/cierra con Escape y devuelve el foco. |
| `/setas` | Corregida. Tarjetas compactas en móvil, `h2`, «Leer ficha» y «Ver recetas» explícitos; filtros y foco comprobados. |
| `/especies/shiitake` | Corregida. Cabecera/pie compartidos, recetario temprano, cocina primero, datos desplegables e impresión. Registro del cultivo y aviso de cosecha conservados en contexto. |
| `/especies/melena-de-leon` | Corregida. Mismo sistema de lectura y acciones; no hay aviso global que envíe a comprar otra especie. |
| `/especies/eryngii` | Corregida. Corte y cocina legibles; mismo sistema de navegación, datos e impresión. |
| `/cocina` | Revisada. Índice por especie y lista ilustrada de 25 preparaciones; composición de una columna en móvil y varias en escritorio. |
| `/recetas` | Revisada. Galería, búsqueda, receta seleccionada y escalas comprobadas por la suite funcional; nota de receta en desarrollo conservada. |
| `/recetas-melena` | Revisada. Siete preparaciones y estados de receta; título largo se adapta a móvil. |
| `/recetas-eryngii` | Revisada. Seis preparaciones y estados de receta; cantidades y enlaces conservados. |
| `/recetas-encurtidos` | Revisada. Tres preparaciones; conserva su contenido y avisos de seguridad sin modificar cantidades ni conservación. |
| `/tecnicas` | Revisada. Jerarquía por técnica, ilustraciones y enlaces a cocina/cultivo; sin desbordamientos. |
| `/cultivo` | Revisada. Relato e ilustraciones del sistema se apilan en móvil. No se modifican parámetros ni afirmaciones operativas. |
| `/shiitake` | Revisada. El formulario conserva validación, borrador y estados comerciales. Pendiente alinear cabecera y duplicidad visual con la ficha editorial; aviso semántico de región. |
| `/restaurantes` | Revisada. Puente a cultivo y técnicas, dos pasos/enlaces. Pendiente jerarquía de encabezados y unificación de plantilla. |
| `/mundo-micelar` | Revisada. Lectura editorial e índice; cabecera/pie anteriores y aviso de región pendientes. |
| `/despensa` | Revisada. Filtros y líneas de producto visibles; plantilla anterior y contradicción de vida útil requieren atención antes de tratarla como oferta validada. |
| `/fichas` | Revisada. Composición para impresión y adaptación de tablas. Pendientes afirmaciones de producto, firma textual anterior y `main`; el PDF existente no fue regenerado. |
| `/manual` | Revisada como documentación de marca. Jerarquía y enlaces legibles; se conserva su función de referencia. |
| `/typography` | Revisada como laboratorio. Variantes tipográficas deliberadas, separadas de la tipografía comercial; no se incorporan nuevas fuentes al producto. |
| `/` | Revisada como entrada del DS. Enlaces a web, manual y prototipos; no es la portada comercial. |
| Respuesta `404` | Revisada mediante ruta inexistente. Estado HTTP 404 y accesos a inicio/recetas; sin desbordamientos. |
| `08_brand/ds-2026/brand-kit/index.html` | Revisada. Manual largo y navegación de referencia; sin desbordamientos en los cuatro anchos. |
| `08_brand/ds-2026/mockups/market/04-brand-board.html` | Revisada. Tablero de identidad rotulado como prototipo; sin desbordamientos. Sus muestras de color no se trasladan a la web comercial. |
| `08_brand/ds-2026/mockups/market/17-culinary-market.html` | Revisada. Referencia de mercado/cocina rotulada como prototipo; sin desbordamientos. |
| `08_brand/ds-2026/mockups/ficha-editorial.html` | Revisada. Diseño de ancho fijo: desbordamiento a 320/390/768 px y avisos semánticos. |
| `08_brand/ds-2026/mockups/receta.html` | Revisada. Tarjeta técnica de ancho fijo: desbordamiento a 320/390 px y avisos semánticos. No es una receta culinaria del catálogo. |

## Validación y evidencia

- `SETAS_WEBSITE_AUDIT_DIR=/tmp/setas-ui-functional-final node scripts/quality/check_public_website.cjs`: **85 comprobaciones, 45 renders, 0 errores de navegador**. Incluye escenarios de consulta interceptados, escalado de recetas, filtros, enlaces, teclado, sin JavaScript e impresión. Los datos sintéticos solo existen en el navegador de prueba y no se envían mensajes.
- `node scripts/quality/check_public_pilot.cjs`: **15 comprobaciones, 0 errores de navegador**, incluidos aviso de cosecha, escenarios comerciales, registro, fechas y lectura sin JavaScript.
- Comprobación de diseño: `/tmp/setas-design-audit.cjs`; informes en `/tmp/setas-ui-design/report.json`, `/tmp/setas-ui-design-references/report.json` y actualización final del catálogo en `/tmp/setas-ui-design-catalogue-final/report.json`. Total: **26 páginas distintas y 104 combinaciones**; sin errores JavaScript en esos informes.
- Catálogo y tres fichas: **0 infracciones automáticas de axe** bajo las etiquetas seleccionadas (`wcag2a`, `wcag2aa`, `wcag21aa`, `best-practice`). Otros avisos y comprobaciones manuales pendientes están preservados en los informes; no se certifica accesibilidad completa.
- Revisión independiente de solo lectura: 320/390/768 px, filtros, foco, menú/Escape, impresión y PDF sin JavaScript. Los cuatro hallazgos de implementación se corrigieron y la segunda revisión no encontró regresiones en ese alcance.
- Compilación real del CSS con `Exporter.bundle_css()`: `commercial.82a9d614e0c2.css`, 135688 bytes, sin `@import` pendientes, 20 recursos tipográficos transformados/reutilizados por el exportador. Artefacto temporal en `/tmp/setas-ui-css-build/`.
- `node --check website.js`, `navigation.js`, `editorial.js` y `git diff --check`: correctos.

La primera pasada de la suite funcional terminó con errores de recursos del navegador (`ERR_INSUFFICIENT_RESOURCES`) mientras coincidían varias verificaciones; la repetición secuencial pasó íntegra sin suprimir comprobaciones ni errores. La exportación integral de imágenes se interrumpió durante la recodificación WebP: `/tmp/setas-ui-export/public` es parcial y **no es un artefacto entregable**. Se verificaron la fuente, la compilación CSS y los recorridos del navegador; no se afirma que hayan pasado las suites de entrega/exportación completa.

Las capturas y JSON anteriores son evidencia de la auditoría inicial. Al cerrar esa etapa los cambios eran locales, sin publicación. Setas OS, Knowledge Base, fórmulas, recetas, datos comerciales y PDFs no se modifican.


## Entrega posterior autorizada: commit, push, PR y despliegue

Sebastián solicitó después la entrega en GitHub y el despliegue. La implementación está publicada en la rama `codex/public-species-ui-audit`, con [PR #516](https://github.com/setasdlp-code/Setas-de-la-Pena/pull/516) hacia `main`. No se ha hecho merge.

La exportación integral pendiente de la primera etapa ya se completó en `/workspace/reports/setas-ui-release-20261114/public`: **340 archivos, 48.452.357 bytes y 49 imágenes de origen**. Se utilizó el exportador del repositorio, con preparación paralela y caché local de variantes WebP: misma codificación `quality=86`, `method=6`, comprobación de hashes de entradas/salidas y paridad exacta de variantes con `Exporter.responsive`. No cambió el código del exportador ni las dependencias del producto. El CSS resultante mantiene el hash `82a9d614e0c2`.

- `node scripts/quality/check_public_export.cjs`, con `SETAS_EXPORT_AUDIT_DIR=/workspace/reports/setas-ui-release-20261114`: **84 comprobaciones, 0 errores**.
- `node scripts/quality/check_public_delivery.cjs`, con el mismo directorio: **60 comprobaciones, 0 errores**.
- Informes: `export-verification.json`, `delivery-verification.json`, `export-audit.json`, `encoder-parity.json` y `release-provenance.json` en ese directorio. El paquete completo sustituye al artefacto parcial inicial, que no debe utilizarse.
- GitHub confirmó `Repository and knowledge-base checks` con resultado `SUCCESS` para la implementación.

**Despliegue bloqueado por autenticación:** Wrangler informó que la sesión OAuth configurada venció y no pudo renovarse en modo no interactivo. El entorno no tiene `CLOUDFLARE_API_TOKEN` ni un secreto de Cloudflare vinculado. Se solicitó renovar el acceso mediante el canal seguro; no se copiaron credenciales al repositorio ni al informe. Hasta disponer de autenticación válida, no se afirma un despliegue ni una verificación HTTPS de esta versión. El destino previsto conserva el proyecto existente `setas-de-la-pena`; no se crea otro sitio ni se modifica la indexación.
