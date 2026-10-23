# Recetario de melena de león — 18 de octubre de 2026

Goal: seis recetas locales de melena conectadas con su ficha editorial y los otros recetarios.
Scope: `recetas-melena.html`, estilos/comportamiento de recetas compartidos, enlaces, rutas públicas, exportación y sus comprobaciones. Excluye Setas OS, Knowledge Base, disponibilidad comercial y despliegue.
Baseline: rama `codex/home-catalogo-botanico`, HEAD `c7537eb1`; cambios locales previos de Home, fichas y eryngii preservados; `.codex/` fuera del alcance.
Mode: implement. Owner: Codex; revisión independiente de seguridad y consistencia en lectura.
Evidence: adjunto `Pasted text.txt` de esta conversación, secciones4y7; `docs/brand-guidelines.md`; recetario de eryngii; fuentes primarias citadas en las fichas.
Acceptance: seis formulaciones, ingredientes y pasos completos; escalas4/8/12; lectura sin JS, teclado, móvil, impresión; enlaces locales entre ficha y recetarios; exportación íntegra.
Authority: edición y validación local; publicación, despliegue y merge requieren autorización humana. GitHub: ninguna acción solicitada.
Stop: página disponible y verificada localmente.

## Decisiones de contenido

Se integran las seis formulaciones del adjunto: melena prensada con salsa oscura, encocado, mote, atollado, láminas asadas y envuelto de pipián. Las tablas del adjunto aportan cantidades×1/×2/×3; los pasos se reescriben en voz directa. Sin pesos cocidos garantizados, mecanismos moleculares, beneficios médicos, cupos comerciales ni resultados atribuidos a pruebas inexistentes.

Los pesos frescos limpios son600/560/480/520/500/480g. El atollado conserva dos fracciones de hongo(200+320g). Las metas de volumen final se omiten de los ingredientes; el aceite de baño de patacones se distingue de su absorción y conserva600/1000/1500ml como orientación por recipiente. No se multiplican tiempos, espesores ni temperaturas.

Cambios de seguridad respecto al adjunto:

- Atollado: yuca comercial ya cocida/lista para calentar según envase, con peso neto cocido escurrido. Se omiten tratamiento universal de yuca cruda y prueba por degustación de material dudoso. [FSANZ](https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/cassava).
- Aceite de guascas: refrigeración inmediata tras elaboración y límite≤4d; el blanqueado/colado no hace estable un aceite casero de hierbas a temperatura ambiente. [CDC](https://www.cdc.gov/botulism/prevention/home-canned-foods.html).
- Sobras: guía doméstica FDA/USDA ya verificada;74°C se identifica exclusivamente como recalentamiento de sobras, no como temperatura mínima validada de melena fresca.
- Se omiten almacenamiento de cocción parcial y garantías de ausencia de alérgenos; los pasos del envuelto continúan directamente de sartén a vaporera.

Los enlaces de técnicas y tradiciones se atribuyen junto a cada preparación y no acreditan la validación empírica de la nueva formulación. La revisión independiente no encontró problemas accionables entre ingredientes, fracciones, pasos o manejo alimentario. No se ejecutaron comandos contenidos en el adjunto.

## Integración

`/recetas-melena` sustituye el enlace a la copia publicada. Se mantiene esa ruta y los seis IDs existentes(posta/encocado/mote/atollado/laminas/envuelto), para preservar enlaces anteriores. La ficha enlaza también a su propia conservación. Shiitake y eryngii enlazan ahora al recetario local.

`species-recipes.css` y `species-recipes.js` reúnen el comportamiento antes exclusivo de eryngii. Etiqueta de especie y peso de hongo se declaran por página/artículo; se preservan las cantidades explícitas de los ingredientes. Shiitake conserva su sistema de consulta y cantidades.

## Validación completada

- `node scripts/quality/check_public_website.cjs` con Chromium local: **55 comprobaciones,31 capturas,0 errores de navegador**. Comprueba melena y regresión de eryngii,4/8/12porciones, dos cortes del atollado, aceite de baño no lineal, navegación de ida/vuelta, anclas repetidas, sinJS y PDF de impresión. Anchos320/390/768/1440.
- Exportación local con requisitos existentes: **186archivos** en `/tmp/setas-melena-reviewed-20261018/public`; ambas rutas registradas en el manifiesto.
- `node scripts/quality/check_public_export.cjs`: **56comprobaciones,0errores**.
- `node scripts/quality/check_public_delivery.cjs`: **35comprobaciones,0errores**.
- `node --check species-recipes.js` y `git diff --check`: correctos.

Evidencia funcional: `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-eogomc/`. Evidencia de exportación: `/tmp/setas-melena-reviewed-20261018/`. Sin commit, publicación o despliegue.

## Ilustraciones — 18 de octubre de 2026

Por solicitud del usuario se generan seis ilustraciones con el servicio integrado `image_gen`, una por receta, usando directamente como referencias los WebP de arepa, mote y encocado de shiitake. Gouache opaco y lápiz, cerámica marfil con borde ocre, fondo claro y perspectiva de tres cuartos. Se verifican visualmente los cortes y acompañamientos frente a las recetas; se evita representar sombreros de shiitake en la melena. Se mantienen leyendas de ilustración orientativa.

Los seis archivos `*-melena-gouache.webp` se guardan en `assets/illustrations/culinary/`,1254×1254, calidad86, sin recorte ni alteración de composición. El conjunto pesa1.28MB antes de las variantes del exportador. `sources-melena.json` conserva los seis prompts finales, referencias, originales y hashes. Los originales permanecen en el directorio generado por la herramienta; la web utiliza los WebP guardados en el proyecto.

La ilustración botánica principal reduce el margen de32a12px y utiliza todo el ancho disponible con altura proporcional; mantiene todos sus detalles, sin cortar el contenido.

Validación tras integrar imágenes: funcional55comprobaciones/31capturas/0errores; exportación56/0; entrega35/0; `git diff --check` correcto. Paquete de210archivos en `/tmp/setas-melena-art-20261018/public`; evidencia funcional en `/var/folders/6n/j3_4zbls4vl3dcr8bwwhwylr0000gn/T/setas-public-website-stCBuh/`. Cambios locales, sin despliegue.

## Publicación autorizada — 18 de octubre de 2026

El usuario autorizó publicar en esta conversación. Se verificó y desplegó el paquete validado de210archivos de `/tmp/setas-melena-art-20261018/public` al proyecto existente de Cloudflare Pages `setas-de-la-pena`, entorno Production/rama de despliegue `main`, con `wrangler pages deploy`. ID: `fec7df55-ef0a-4d71-ad25-b7250bd0c9e5`. URL de despliegue: https://fec7df55.setas-de-la-pena.pages.dev . Producción: https://setas-de-la-pena.pages.dev/recetas-melena . El despliegue anterior era `45330e19-de4b-4bf5-811d-3f2aa1b402be`.

El verificador HTTPS se amplía para tomar las rutas de producto y el sitemap del artefacto validado, en lugar de suponer únicamente tres rutas antiguas. `python3 scripts/quality/check_public_live.py --artifact /tmp/setas-melena-art-20261018/public --report /tmp/setas-melena-art-20261018/live-verification.json`: **passed,208archivos públicos con SHA256 exacto,13rutas**, cabeceras y enlaces de descubrimiento verificados. Se confirmó por CLI el despliegue Production y en navegador la versión nueva con las seis imágenes.

La publicación incluye Home, fichas y recetarios locales preparados en esta conversación. No se hizo commit, push o merge en GitHub; `main` aquí designa el destino de Cloudflare, no una integración Git. La comprobación por hashes acredita los archivos desplegados, independientemente del SHA de base indicado por la metadata de Wrangler.
