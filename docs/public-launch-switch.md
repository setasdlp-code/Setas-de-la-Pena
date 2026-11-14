# Interruptor de lanzamiento de la web pública

La web pública se sirve con `X-Robots-Tag: noindex, nofollow` a propósito (versión de revisión, ver `docs/website-audit-2026-10-15.md`, «Visibilidad y caché»). Este documento lista, en un solo lugar, qué cambia al abrirla a buscadores. **Nada de esto se aplica sin una decisión explícita de Sebastián.**

## Apertura limitada de las fichas · 13 de noviembre de 2026

Por solicitud de Sebastián se prepara la indexación de `/especies/shiitake`, `/especies/melena-de-leon` y `/especies/eryngii`, incluidas sus variantes `.html`. Las reglas específicas de `public-headers.txt` eliminan la cabecera heredada solo para esas seis rutas; el resto conserva su estado de revisión. El servidor local y las comprobaciones de entrega reflejan esta excepción. Sebastián autorizó explícitamente publicar estos cambios el 13 de noviembre de 2026. El despliegue y su verificación deben registrarse por separado.

## Antes de decidir

- Licencia de Gaya resuelta o fuente sustituida (`docs/brand/brand-audit-2026-10.md`, P0-1). El `noindex` es hoy la mitigación de ese riesgo.
- Favicon e icono de app legibles, sello elegido (P0-2).
- Dominio definitivo decidido. Hoy es `setas-de-la-pena.pages.dev`; no hay dominio propio autorizado.
- Datos comerciales confirmados o textos de piloto revisados (`docs/public-website.md`, «Datos comerciales»). Mientras `availability` sea `pilot`, no se publican precios ni disponibilidad, y tampoco `Product`/`Offer` en datos estructurados.
- Recetas: siguen «sin probar». El JSON-LD `Recipe` ya está generado; decidir si se publican así o tras la prueba en cocina.

## Cambios al lanzar

1. `public-headers.txt`: quitar la línea `X-Robots-Tag: noindex, nofollow` del bloque `/*`.
2. `scripts/serve_public_website.py` (línea del `send_header('X-Robots-Tag', ...)`): quitar el encabezado para que el servidor local coincida.
3. Pruebas que fijan el `noindex` y deben invertirse: `scripts/quality/check_public_live.py` (dos `assert` sobre `x-robots-tag`) y `scripts/quality/check_public_delivery.cjs` (`x-robots-tag`).
4. `robots.txt`: reescribir el comentario inicial; mantener `Allow: /` y la línea `Sitemap:`.
5. Si cambia el dominio: actualizar `ORIGIN` en `scripts/export_public_website.py`, `scripts/inject_public_structured_data.py`, `scripts/quality/check_public_delivery.cjs` y `scripts/quality/check_public_live.py`; los `canonical`, `og:url`, `og:image` y `sitemap.xml` de las páginas; y regenerar el JSON-LD con `python3 scripts/inject_public_structured_data.py`.
6. Exportar y verificar: `python3 scripts/export_public_website.py --output <carpeta vacía>`, luego `node scripts/quality/check_public_delivery.cjs` y `python3 scripts/quality/check_public_live.py`.

## Debe seguir en `noindex`

`404.html`, `manual.html`, `design-system.html` y `typography.html` llevan `<meta name="robots" content="noindex">` propio. No se tocan al lanzar.

## Datos estructurados

`python3 scripts/inject_public_structured_data.py` escribe los bloques `Recipe` y `BreadcrumbList` a partir del marcado de cada página; con `--check` falla si el HTML cambió y el JSON-LD quedó desactualizado. Volver a ejecutarlo tras editar recetas, títulos o rutas.
