# Setas de la Peña — Kit de identidad comercial

Edición 1.1 · 12 de octubre de 2026. Chefs primero; también hogares.

[Manual visual](index.html) · [Guía escrita](../../../docs/brand-guidelines.md) · [Investigación de referentes](../../../docs/brand/competitive-research-2026-10.md)

Desde la raíz del repositorio:

```sh
python3 -m http.server 4187 --bind 127.0.0.1 --directory .
```

URL local: `http://127.0.0.1:4187/08_brand/ds-2026/brand-kit/`. El servidor permite revisar el kit; no publica una web externa.

## Recursos

- `assets/wordmark-horizontal-{moss,ink,paper}.svg`
- `assets/wordmark-stacked-{moss,ink,paper}.svg`
- `assets/manifest.json`: origen tipográfico, colores y SHA-256 de cada firma.
- `build_wordmarks.py`: generador de contornos; requiere `fontTools` en las herramientas. No es dependencia de la web.
- `brand-kit.css`: composición del manual; importa tokens y fuentes desde `../market.css`.

La edición 1.1 concreta la propuesta «Conoce la seta. Imagina el plato», documenta decisiones de diez marcas y añade una pareja editorial y una presentación para chefs. No cambia las firmas, las ilustraciones aprobadas o los tokens. El manual diferencia la pauta comercial de cinco datos del formulario web actual; preparar un mensaje no lo envía.

Regenerar firmas si cambian las fuentes o primitivas:

```sh
python3 08_brand/ds-2026/brand-kit/build_wordmarks.py
```

Los SVG usan ñ real, son transparentes y no requieren tipografías instaladas. Las ilustraciones existentes se referencian por ruta; no se duplican.

## Producción

Recursos de revisión interna. [SOURCES.md](../SOURCES.md) describe archivos Gaya de prueba; confirmar licencia comercial para web y logotipo antes de distribuir o imprimir. Pasar a contornos no elimina esa condición.

Ficha y etiqueta son maquetas, sin datos de lote o venta ficticios. Completar datos reales y revisar requisitos del empaque antes de imprimir. El kit no modifica el contenido de la web pública. Sus fichas, pareja editorial y presentación para chefs consumen `components/market/culinary.css` desde `market.css`; la apariencia compartida pertenece al DS y el CSS local solo compone el manual y su paginación. El kit completo no forma parte del manifiesto de distribución.

Imprimir el manual con gráficos de fondo para guardar un PDF. Los renders, PDF y auditoría de esta edición se guardan fuera del repositorio en `/workspace/reports/brand-deep-research/`. La edición 1.0 permanece en `/workspace/reports/brand-finalization/` como antecedente.
