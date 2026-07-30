# Field OS — Simulador de sustratos + Sesión de campo

Aplicación web auditada para Setas de la Peña, con dos módulos:

- **Simulador** (`simulador.html`, editable en `src/simulador.source.html`): formulación y optimización de recetas de sustrato.
- **Sesión de campo** (`sesion.html`, editable en `src/sesion.source.html`): registro de contenedores, cosechas, observaciones y eventos rápidos sobre un ledger append-only, con undo, adjunto de fotos, resumen por WhatsApp, una paleta de comandos, alertas climáticas, vista por rol e inventario. Alcance formalizado en `field_os/adr/ADR-0004_V1_Scope_Expansion.md` y `FIELD_OS_MVP_ARCHITECTURE.md` v1.1 — ver ese ADR para las cauciones vigentes (sin autenticación de rol en servidor; confianza de sensores climáticos aún no validada).

## Instalación y ejecución

Requiere Node.js 20 o superior.

```bash
npm ci
npm run quality
npm start
```

Abrir `http://127.0.0.1:4173/simulador.html` o `http://127.0.0.1:4173/sesion.html`. No usar un servidor estático genérico: `npm start` también expone las API de persistencia, ledger y fotos.

## Build de producción

```bash
npm run build
```

El build precompila el JSX de ambos módulos con esbuild, incorpora React 19 en modo producción y genera recursos locales en `assets/`. Las páginas publicadas no usan Babel en navegador, React development ni dependencias CDN.

## Persistencia

- **Estado del simulador**: el navegador usa `/api/state` como fuente de verdad. El servidor guarda por defecto en `data/state.json` mediante reemplazo atómico y conserva la versión anterior en `data/state.json.backup`.
- **Ledger de sesión**: `/api/ledger` (GET lista todos los eventos, POST agrega uno). El ledger es **append-only e inmutable**: una corrección se registra como un evento `anulacion` que referencia al original; nunca se borra ni se reescribe nada. Se guarda en `data/ledger.json` con el mismo patrón de escritura atómica y respaldo.
- **Fotos**: `/api/photos` (POST, JSON con `data` en base64/data-URL) guarda en `data/photos/` tras verificar el tipo real de archivo (JPEG/PNG/WebP, por firma de bytes, no por la extensión declarada) y un límite de 5MB; se sirven de vuelta en `/photos/<archivo>`.
- **Inventario**: `/api/inventory` (GET lista, POST/PUT crea o actualiza un lote, DELETE elimina). Es **estado actual, no historial append-only**: una actualización sobreescribe la cantidad anterior sin dejar rastro. `status` (`OK`/`Reponer`) siempre se deriva en el servidor a partir de `cantidad` vs `minimo`; el cliente nunca lo escribe directamente. Se guarda en `data/inventory.json` con el mismo patrón de escritura atómica y respaldo.

Todos estos archivos quedan fuera de Git.

En el primer arranque, si el servidor aún está vacío, se migran automáticamente las claves históricas de Field OS desde `localStorage` y luego se eliminan del navegador. Si la API no está disponible, la app muestra una alerta y opera solo en memoria durante esa sesión.

Variables opcionales:

- `HOST` y `PORT`: interfaz y puerto del servidor; valores iniciales `127.0.0.1` y `4173`.
- `FIELD_OS_DATA_PATH`: ruta absoluta o relativa del archivo central de estado del simulador.
- `FIELD_OS_LEDGER_PATH`: ruta del archivo del ledger de sesión.
- `FIELD_OS_INVENTORY_PATH`: ruta del archivo de inventario.
- `FIELD_OS_PHOTOS_DIR`: directorio donde se guardan las fotos subidas.

Este backend de archivo está diseñado para una instancia interna. Para acceso público o concurrencia multiusuario se requiere autenticación y una base de datos transaccional.

## Calidad automática

```bash
npm run quality
```

El comando reconstruye ambos artefactos, valida que sean locales y compatibles con CSP, comprueba integridad y accesibilidad, y ejecuta pruebas de reglas operativas, ledger, fotos, API, reinicio y respaldo. El mismo control corre en GitHub Actions con dependencias fijadas por `package-lock.json`.

Consulta `AUDIT_2026-07-17.md` para el detalle de hallazgos y riesgos residuales del Simulador (el módulo Sesión de campo es posterior a esa auditoría y aún no tiene una revisión formal equivalente).
