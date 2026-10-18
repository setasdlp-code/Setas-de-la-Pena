# Auditoría y mejora de la web pública · 15 de octubre de 2026

## Alcance y base

Encargo: completar, validar y publicar el sitio en el proyecto existente de Cloudflare Pages `setas-de-la-pena`, cuenta `2f1f68a060057369109ea9f699e613cb`. El usuario autoriza este despliegue; no autoriza cambios de dominio, audiencia, acceso, Setas OS ni merge a main.

Base local: `codex/integrate-pr381-brand`, HEAD `645c9c5db636fefaa2eb3939ef7f251758ea72e8`, un worktree y cambios previos conservados. Se archivaron 61 archivos locales modificados o nuevos y el diff antes de intervenir. No se encontró `codex/auditoria-sitio` ni localmente ni mediante `git ls-remote`; tampoco `docs/website-audit-2026-10-14.md`. No se atribuyen a esta entrega cambios de aquella auditoría ausente.

La fuente de portada sigue siendo `index.html`; el exportador genera `home.html`. La raíz publicada conserva el acceso al DS. No se modifican Setas OS ni workflows; sus archivos locales anteriores se contrastan por hash con el inicio de la tarea.

## Evidencia, propuestas y pendientes

| Material | Estado y uso |
| --- | --- |
| Código y versión publicada anterior `4ab938c7-b9a5-4a97-b341-6ddbeb856111` | Inspeccionados. Tres especies culinarias y reishi de archivo; consulta local sin receptor confirmado. |
| Plan recibido en el chat | Requisitos autorizados para esta implementación. |
| Investigación de Gemini, `Pasted text.txt` | Documento técnico propuesto, evaluado anteriormente en `09_research/shiitake-gemini-evaluation-2026-10.md`; se conservan las correcciones culinarias ya aplicadas y sus límites. No es un texto reescrito de portada. |
| Texto reescrito de portada/modal citado como adjunto | No disponible. Al solicitarlo se recibió de nuevo el plan. No se inventa una transcripción: se conserva la redacción aprobada, con las correcciones explícitas de clasificación y de «insignia». Aplicarlo sigue pendiente de recibirlo. |
| Datos comerciales | WhatsApp nulo, disponibilidad no confirmada, presentaciones vacías y demás datos sin confirmar en `commercial-data.js`; no se rellenan con ejemplos. |
| Origen | Tenjo es la procedencia del proyecto. Relato y hechos adicionales requieren confirmación; pendiente conservado en comentario editorial, sin marcadores públicos. Las ilustraciones no acreditan lotes ni fotografías del cultivo. |

## Hallazgos y resolución

- La versión anterior devolvía 200 y HTML para rutas inexistentes, `robots.txt` y `sitemap.xml`. Se añaden documentos reales y `404.html` de nivel raíz para desactivar el fallback SPA de Pages. La respuesta 404 debe verificarse de nuevo en HTTPS después de publicar.
- Faltaban canonical, Open Graph, Twitter Card y datos estructurados. Las tres páginas comerciales incorporan URLs canónicas limpias, metadatos por página, imagen social 1200×630 y `Organization` sin teléfono, email, dirección postal, ofertas, precios ni stock inventados. La imagen se compone de ilustraciones y firma existentes; no es fotografía propia.
- Enlaces comerciales pasan a `/home`, `/shiitake`, `/recetas`, manteniendo queries y fragmentos. Los enlaces compartidos históricos con `pairing` conservan ese parámetro, sin activar fuentes experimentales en las páginas comerciales.
- `commercial.css` es la entrada fuente. Al exportar se aplanan los imports locales en orden y se resuelven URLs desde su CSS original; esbuild minifica el resultado. El HTML publicado carga un único CSS versionado, sin imports. No se modifica el DS ni su distribución en Setas OS para conseguirlo.
- Se generan fuentes WOFF2, imágenes WebP de varios tamaños y JS con hash de contenido. Los cambios de hero y modal reutilizan `srcset` de las tarjetas y evitan volver a pedir PNG originales. El laboratorio conserva sus fuentes y estilos de prueba.
- Etiquetas y metadatos comerciales tienen un mínimo de 12 px. El diálogo anuncia título y descripción, empieza en Cerrar, mantiene Tab dentro de sus controles y devuelve el foco al abrir/cerrar. Se conservan controles nativos, Escape, foco visible y alternativas sin JS.
- La colección declara expresamente tres especies culinarias y una de archivo. Se elimina «especie insignia» del modal de shiitake. Se mantienen las salvedades culinarias, fuentes y recetas pendientes de prueba.

## Visibilidad y caché

`X-Robots-Tag: noindex, nofollow` procede de una decisión anterior de publicar una versión de revisión, documentada en `/workspace/reports/cloudflare-setas/README.md` y en sus paquetes `_headers`. La base HTTPS lo confirma. Se conserva mediante `public-headers.txt`, que el exportador convierte en `_headers`. No se modifica Cloudflare Access ni la audiencia. Los metadatos y el sitemap no revocan esa restricción.

`robots.txt` permite solicitar las páginas para leer la directiva HTTP `noindex`; no da autorización para indexarlas. Sitemap enumera únicamente las tres rutas comerciales canónicas, sin fechas ficticias. Un futuro cambio de visibilidad necesita decisión específica.

Pages revalida por defecto los recursos sin versión. El paquete explicita revalidación de HTML y aplica `max-age=31536000, immutable` únicamente a `/_assets/*`, donde todos los nombres llevan un hash de contenido comprobado. No se combinan directivas globales de caché incompatibles con las de los archivos versionados.

Referencia técnica consultada: https://developers.cloudflare.com/pages/configuration/headers/ (semántica de reglas múltiples y retirada de cabeceras).

## Validación y publicación

Evidencia fuera del paquete público: `/workspace/reports/setas-website-audit-2026-10-15/`.

- `source-final/audit.json`: 30 comprobaciones funcionales, 21 renders, cero errores del navegador.
- `final/export-verification.json`: 36 comprobaciones del paquete, enlaces, imágenes, ocho páginas a cuatro anchos, DS/manual canónicos y recorrido restaurante ×3 → 900 g → mensaje revisable, sin envío y WhatsApp oculto.
- `final/delivery-verification.json`: 15 comprobaciones adicionales de metadatos, hashes, WOFF2, CSS sin imports, imagen social, enlaces limpios, etiquetas, foco, imágenes dinámicas y contratos HTTP locales. El servidor local no acredita las cabeceras remotas.
- `git diff --check` y compilación Python correctos.
- Revisión independiente solo lectura: sin bloqueadores; SHA256 del paquete verificados. La validación remota y el nuevo despliegue quedan acreditados en el apartado siguiente.

El artefacto incluye 149 archivos (7 497 643 bytes), de los que dos son controles de Pages. Contiene DS y laboratorio preservados, además de 20 WOFF2 y 24 variantes de imágenes comerciales. Este tamaño total no es una medición de transferencia por página ni una prueba de rendimiento de campo. No incluye repositorio, credenciales, herramientas, resultados de auditoría ni datos de Setas OS.

No se envían mensajes ni se introducen datos sintéticos en producción. Los casos sintéticos de la suite funcional se interceptan exclusivamente en el navegador local.

## Reproducción

Reutilizar Node, Chromium y las dependencias ya instaladas del repositorio. Para el exportador se necesitan las versiones de `scripts/requirements-public-website.txt`; pueden instalarse en un entorno o directorio de herramientas fuera del repositorio. En este entorno Brotli se instaló en el directorio `tooling` del informe, usado mediante `PYTHONPATH`.

```bash
node scripts/render_public_social.cjs
python3 scripts/export_public_website.py --output /ruta/fuera-del-repositorio/public
python3 scripts/serve_public_website.py --directory /ruta/fuera-del-repositorio/public --port 4188
SETAS_EXPORT_AUDIT_DIR=/ruta/fuera-del-repositorio node scripts/quality/check_public_export.cjs
SETAS_EXPORT_AUDIT_DIR=/ruta/fuera-del-repositorio node scripts/quality/check_public_delivery.cjs
```

Para fuentes, servir con `--source --directory /workspace/Setas-de-la-Pena --port 4187` y ejecutar `check_public_website.cjs`. La exportación exige un directorio nuevo y vacío y no lee autenticación de Cloudflare. Los comandos de Wrangler se ejecutan fuera del repositorio y seleccionan la configuración privada ya existente sin copiarla al artefacto.

## Pendientes del negocio

Confirmar receptor de consultas/contacto, disponibilidad, formatos/pesos, precios, cobertura, entrega, pagos, lote/fecha cuando existan, relato de Origen y licencia comercial de Gaya. Probar las recetas en cocina antes de presentarlas como verificadas. Entregar el adjunto de texto reescrito si debe sustituir a la redacción vigente. No se añade analítica de «consultas enviadas»: sin receptor confirmado, preparar o copiar un mensaje no demuestra envío.


## Resultado HTTPS y despliegue

Publicado mediante Wrangler en el proyecto existente y cuenta autorizada. Identificador: `43b20e8c-746d-4dc3-9f7f-ee442777880c`. Wrangler confirma entorno Production y rama main; no se cambió la rama del checkout ni se hizo commit, push o merge. URL estable: https://setas-de-la-pena.pages.dev/home. URL del despliegue: https://43b20e8c.setas-de-la-pena.pages.dev/.

`live-after.json` confirma los 147 archivos servidos, todos con SHA256 idéntico al paquete local. Las dos reglas de Pages se aplican como configuración y no se sirven como archivos. Se verifican ocho rutas: raíz DS y tres comerciales con 200; dos inexistentes y los archivos privados `_headers`/`_redirects` con 404 real. También pasan robots en text/plain, sitemap XML, imagen social PNG de 1200×630, canonical/OG/Twitter/JSON-LD y redirección de un enlace `.html` preservando recipe, scale, purpose y pairing. `/ds`, `/marca` y `/web` conducen a sus destinos.

Cabeceras reales: noindex, nofollow conservado; HTML con revalidación; los recursos versionados con max-age=31536000 e immutable; ningún recurso sin versión tiene immutable. No se envió ningún mensaje ni se usaron fixtures de negocio en producción.

La primera lectura inmediatamente después del despliegue aún recibió una versión anterior de sitemap; no se dio por buena. Se comprobó después coincidencia en el dominio estable y en la URL del despliegue, se solicitaron respuestas con Cache-Control:no-cache y la auditoría completa pasó.

Las instrucciones reutilizables de arranque y validación se guardaron en el campo start_skill del borrador de entorno. Esto conserva instrucciones para revisión en ajustes del entorno; no equivale a publicar una nueva configuración del entorno. No se modificaron sus secretos, red ni variables.
