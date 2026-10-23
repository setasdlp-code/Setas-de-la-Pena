# Cuaderno editorial de especies

## Encargo y límite

```text
Goal: una página editorial documentada por especie, enlazada desde el catálogo del Home.
Scope: especies/{shiitake,melena-de-leon,eryngii}.html; species-editorial.css; editorial.js; enlaces del catálogo/consulta; rutas, exportador y comprobaciones de la web pública.
Baseline: rama codex/home-catalogo-botanico, HEAD c7537eb1, iteraciones locales del Home ya aceptadas; .codex/ ajeno preservado.
Mode: implement
Owner: Codex; colaborador editorial_evidence_review, revisión científica de solo lectura de las tres páginas.
Evidence: mockups/ficha-editorial.html; docs/brand-guidelines.md; perfiles de knowledge_base/01_species; fuentes primarias enlazadas en cada ficha; exportador y suite de la web pública.
Acceptance: tres fichas completas, fuentes enlazadas, rutas limpias y navegación entre especies; 320/390/768/1440 px; teclado, lectura sin JS, impresión, consulta y recetas sin regresión; exportación íntegra y git diff --check.
Authority: edición y validación local; sin cambios operativos, Setas OS, Knowledge Base ni publicación externa.
GitHub: none
Stop when: páginas revisables, contenido contrastado y verificaciones completadas.
```

La referencia solicitada es `08_brand/ds-2026/mockups/ficha-editorial.html`: una lámina ilustrativa de reishi con folio, columna de lectura, imagen lateral, pie de figura y notas. Se adopta esa composición y Gaya + Plex con los colores existentes. Sus valores de sala, lote, precio, sustrato y cosecha son ilustrativos y no se trasladan a las páginas públicas.

## Recorrido

- `/especies/shiitake`: identidad, madera y cultivo histórico, sabor, recetas existentes, cocción completa, origen del nombre y conservación.
- `/especies/melena-de-leon`: dientes, ecología de la madera, nombres, textura, ideas culinarias y conservación.
- `/especies/eryngii`: pie carnoso, asociación con Apiaceae, cortes, variedades y contexto de un estudio genómico del Gobi, conservación.
- «Leer la ficha» del catálogo abre la página de su especie. La vista rápida de la ilustración enlaza a la misma ficha.
- `/shiitake` conserva la consulta comercial y el recorrido de cantidades desde recetas. Añade un acceso a la ficha editorial.
- Cada página tiene índice, cinco referencias, dos enlaces a las otras especies y un botón de impresión con mejora progresiva. El contenido y los enlaces funcionan sin JavaScript.
- El Home conserva la eliminación solicitada de «Antes de consultar».

## Evidencia y tratamiento editorial

Consulta de fuentes: 18 de octubre de 2026. Las afirmaciones descriptivas son información general de especies. La confianza en ellas no implica disponibilidad, validación de un lote, vida útil, setpoints de cultivo o promesas de salud de Setas de la Peña.

| Fuente | Evidencia | Uso y alcance |
| --- | --- | --- |
| Cornell Small Farms, Shiitake Mushroom Basics | Tier 1, extensión universitaria | Morfología, árboles y origen del nombre de shiitake. |
| Cornell Small Farms, Outdoor Production | Tier 1, extensión universitaria | Cultivo de Hericium sobre madera; sin trasladar calendarios o rendimientos. |
| Royal Botanic Gardens, Kew, Lion’s mane mushroom | Tier 2, institución científica | Morfología, ecología, distribución general y nombres de melena. Solo se usa ese contenido; no su discusión de suplementos. |
| Dai et al. 2019, DOI 10.3389/fmicb.2019.02024 | Tier 1, investigación primaria | Apiaceae, variedades y comparación genómica. Se conserva «podrían» para genes asociados al ambiente y se evita extrapolar tolerancia a toda cepa. |
| ANSES, comunicado de abril de 2021 | Tier 1, agencia pública | Cocción completa y dermatitis por shiitake crudo/poco cocido. El PDF oficial presenta restricciones al abrirlo; los pasajes pertinentes se verificaron en su representación indexada. |
| FDA, Refrigerator Thermometers | Tier 1, agencia pública | Refrigeración doméstica. 4 °C es una expresión conservadora del límite de 40 °F; no fija duración de un lote. |
| Mushroom Council, Tips & Tricks | Tier 3, guía de sector | Envase y limpieza de setas. La etiqueta del producto sigue teniendo prioridad. |
| Smallhold, Our Mushrooms | Tier 3, productor | Perfiles sensoriales orientativos y formatos de uso. No son una cata de nuestra cosecha. |
| Four Star Mushrooms, King Trumpet | Tier 3, productor | Pie y cortes culinarios de eryngii. No se usan sus claims nutricionales, tiempos ni vida útil. |

La clasificación taxonómica de orden/familia se toma de los perfiles canónicos `knowledge_base/01_species/lentinula_edodes.md`, `hericium_erinaceus.md` y `pleurotus_eryngii.md`. Se leyeron primero el addendum, CANON y protocolo de agentes de la Knowledge Base. No se modifican esos documentos ni se publican sus parámetros de cultivo. Las novedades descriptivas no se promueven a normas operativas.

La revisión independiente no encontró afirmaciones accionables sin respaldo en las tres fichas. Confianza alta para las afirmaciones revisadas; relevancia local limitada a educación culinaria y lectura del catálogo. Las combinaciones nuevas con arepa, maíz, hierbas o arroz se identifican como ideas pendientes de prueba, no recetas validadas.

## Validación completada

- `node scripts/quality/check_public_website.cjs`: **45 comprobaciones, 27 renders, 0 errores de navegador**. Cubre las tres fichas a 320/390/768/1440 px, navegación desde catálogo, otras especies, fuentes, índices, impresión, sin JavaScript y conservación del recorrido receta/consulta.
- `python scripts/export_public_website.py --output /tmp/setas-editorial-20261018/public`, usando el entorno temporal con los requisitos existentes del exportador: **180 archivos**. Sin dependencias nuevas del producto.
- `check_public_export.cjs`, con `SETAS_EXPORT_AUDIT_DIR=/tmp/setas-editorial-20261018` y `SETAS_EXPORT_DIR=/tmp/setas-editorial-20261018/public`: **48 comprobaciones, 0 errores**.
- `check_public_delivery.cjs`, con los mismos directorios y Chromium instalado: **27 comprobaciones, 0 errores**. Incluye metadatos Article, WOFF2, imágenes responsivas, rutas y foco de las vistas rápidas.
- `node --check` para JS modificados, `python3 -m py_compile` para servidor/exportador y `git diff --check`: correctos.

Evidencia temporal: suite funcional y capturas en `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-4oY6on/`; exportación e informes en `/tmp/setas-editorial-20261018/`. Revisión científica independiente completada sin hallazgos accionables. No se ha hecho commit, push, PR, merge ni despliegue.


## Integración de «Del nombre al origen»

Las tres notas del Home se integran en las fichas existentes: el contenido sobre nombres se incorpora a la identidad de shiitake; el de textura, a la cocina de melena; el de origen, a la vida de eryngii con lote, fecha y procedencia. La revisión posterior de voz integra esas ideas en los párrafos sin conservar sus títulos como subtítulos. Se reutiliza el contenido ya revisado, sin nuevas afirmaciones biológicas ni cambios de conservación.

Se retira la sección `journal` del Home. El enlace desde Origen conduce al catálogo, y el ancla histórica `#cuaderno` se conserva en su cabecera para enlaces compartidos. La vista rápida conserva un único acceso a la ficha editorial: se elimina el botón redundante «Seguir en el cuaderno» y su controlador. El Home mantiene la eliminación previa de «Antes de consultar».

Verificación de esta integración: `node scripts/quality/check_public_website.cjs` terminó con 45 comprobaciones, 27 renders y 0 errores de navegador; `node --check website.js` y `git diff --check` correctos. Se comprobaron también ausencia del bloque repetido y del controlador eliminado, presencia de las tres notas en sus fichas y validez de anclas, incluido `#cuaderno`. Evidencia temporal: `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-WD3RSF/`. Sin publicación.


## Ajuste de voz y jerarquía

Según `docs/brand-guidelines.md` §3 y §5: voz cercana, cuidadosa y precisa, titulares breves, acciones e ingredientes concretos; IBM Plex Sans para lectura y Gaya para firma, especie y entrada editorial. La propuesta de voz de octubre sirve como apoyo, sin sustituir la guía vigente.

Se eliminan los subtítulos narrativos y los encabezados auxiliares de las tres fichas. Identidad, ecología y curiosidades quedan como prosa continua, manteniendo sus anclas y fuentes. Solo cocina, conservación y fuentes conservan encabezados funcionales en el artículo; el índice se reduce a esas tres entradas. Se recortan metáforas, explicaciones de la propia página y avisos repetidos. Los consejos de cocción y refrigeración conservan sus fuentes y su alcance. No se añaden afirmaciones científicas ni comerciales.

Verificación del ajuste de voz: suite funcional con 45 comprobaciones, 27 renders y 0 errores de navegador; `git diff --check` correcto. Revisión visual de la lectura y los tres encabezados en móvil. Evidencia temporal en `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-bIDrVc/`. Cambios locales, sin publicación.


## Enlace de recetas por especie

Shiitake enlaza desde «En la cocina» a las nueve recetas existentes, además de conservar los tres accesos directos por preparación. El recetario vuelve a `/especies/shiitake` desde la ruta de navegación, el perfil del ingrediente y el cierre de página; las acciones de consulta conservan `/shiitake` y sus cantidades.

Melena de león enlaza desde «En la cocina» a las seis preparaciones locales en `/recetas-melena`, incorporadas a partir del adjunto facilitado después por el usuario. Sustituye el enlace a la copia publicada. Ver `public-melena-recipes.md` para alcance, ajustes y validación.

Se retiran de melena y eryngii los enlaces de cocina que llevaban al recetario de shiitake. Con la investigación suministrada después por el usuario, se crea `/recetas-eryngii`: seis formulaciones propuestas, escalas ×1/×2/×3 y conservación doméstica. La ficha de eryngii enlaza a su recetario y a su guía de conservación. Ver `public-eryngii-recipes.md` para alcance, ajustes y validación.
