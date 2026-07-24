# Field OS — Simulador de sustratos

Aplicación web auditada para Setas de la Peña. La versión servida es `simulador.html`; el JSX editable vive en `src/simulador.source.html`.

## Instalación y ejecución

Requiere Node.js 20 o superior.

```bash
npm ci
npm run quality
npm start
```

Abrir `http://127.0.0.1:4173/simulador.html`. No usar un servidor estático genérico: `npm start` también expone la API de persistencia.

## Build de producción

```bash
npm run build
```

El build precompila JSX con esbuild, incorpora React 19 en modo producción y genera recursos locales en `assets/`. La página publicada no usa Babel en navegador, React development ni dependencias CDN.

## Persistencia

El navegador usa `/api/state` como fuente de verdad. El servidor guarda por defecto en `data/state.json` mediante reemplazo atómico y conserva la versión anterior en `data/state.json.backup`. Ambos archivos quedan fuera de Git.

En el primer arranque, si el servidor aún está vacío, se migran automáticamente las claves históricas de Field OS desde `localStorage` y luego se eliminan del navegador. Si la API no está disponible, la app muestra una alerta y opera solo en memoria durante esa sesión.

Variables opcionales:

- `HOST` y `PORT`: interfaz y puerto del servidor; valores iniciales `127.0.0.1` y `4173`.
- `FIELD_OS_DATA_PATH`: ruta absoluta o relativa del archivo central de estado.

Este backend de archivo está diseñado para una instancia interna. Para acceso público o concurrencia multiusuario se requiere autenticación y una base de datos transaccional.

## Calidad automática

```bash
npm run quality
```

El comando reconstruye el artefacto, valida que sea local y compatible con CSP, comprueba integridad y accesibilidad, y ejecuta pruebas de reglas operativas, API, reinicio y respaldo. El mismo control corre en GitHub Actions con dependencias fijadas por `package-lock.json`.

Consulta `AUDIT_2026-07-17.md` para el detalle de hallazgos y riesgos residuales.
