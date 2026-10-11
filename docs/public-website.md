# Web pública de Setas de la Peña

Sitio estático independiente de Setas OS. La portada enlaza la colección, el origen y tres recetas; la ficha de shiitake conecta la información culinaria con una consulta de disponibilidad y pedido.

## Páginas y diseño

- `index.html`: portada, filtros, fichas breves y enlaces de consulta.
- `shiitake.html`: ficha completa, solicitud de cantidad y municipio, entrega y conservación.
- `recetas.html`: arepa, sopa de coco y patacones con shiitake, ingredientes, pasos, fuentes e impresión.
- `typography.html`: estudio tipográfico, excluido de indexación.

Las páginas cargan un único entrypoint del DS: `08_brand/ds-2026/market.css`. Gaya + IBM Plex es la combinación predeterminada. Bricolage y Libre Baskerville se mantienen como alternativas mediante `?pairing=bricolage` y `?pairing=libre`, con fuentes locales y licencias OFL.

Las especies usan grabados del DS; las recetas usan tres gouaches con lápiz generados con IA y rotulados como ilustraciones. Los WebP culinarios suman 559.472 bytes. Procedencia, prompts y hashes: `assets/illustrations/culinary/sources.json`. Las rutas de los PNG originales describen el entorno de generación y no son dependencias del sitio.

## Datos comerciales

`commercial-data.js` contiene exclusivamente datos públicos confirmados. Por defecto faltan WhatsApp, presentaciones, precios, disponibilidad, entrega y pago; la ficha funciona como consulta, sin prometer producto disponible.

- `whatsapp`: número internacional con `+` y código de país. Sin un número válido no aparece el enlace de WhatsApp.
- `availability`: `unconfirmed`, `available` o `unavailable`.
- `presentations`: lista de `{ id, name, weightGrams, priceCOP }`; peso positivo en gramos y precio en pesos enteros, o `null` si falta precio.
- `deliveryAreas`, `deliveryDays`, `paymentMethods`, `batch`, `harvestDate`: texto confirmado o `null`.
- `deliveryFeeCOP`: pesos enteros, `null` si falta el costo; `0` representa entrega sin costo, sujeta a cobertura.

La consulta genera un mensaje revisable y permite copiarlo. Con presentaciones confirmadas calcula el peso y subtotal; el envío queda separado. WhatsApp se abre solo por acción del cliente y el pedido se confirma en la conversación. No existe backend de pedidos, cobro, reserva de inventario ni persistencia de datos del cliente.

Las recetas son adaptaciones de fuentes publicadas, pendientes de prueba en cocina. La información doméstica de conservación conserva sus referencias y no establece la vida útil de un lote.

## Desarrollo y verificación

Desde la raíz del repositorio, iniciar el servidor en una terminal:

```sh
python3 -m http.server 4187 --bind 127.0.0.1 --directory .
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
