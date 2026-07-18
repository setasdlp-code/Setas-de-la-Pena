# Field OS · GitHub Pages

Prototipo navegable de la experiencia operativa de Field OS para Setas de la Peña.

## Qué implementa

- navegación adaptada a Operario, Producción y Dirección;
- captura rápida por contenedor con eventos inmutables en la narrativa;
- balance de masa obligatorio antes de ejecutar un lote;
- origen visible para datos medidos, calculados y manuales;
- inventario por lote y consumo FIFO;
- trazabilidad desde pedido hasta insumo;
- experimentos separados de la línea base de producción;
- controles táctiles, navegación con teclado y diseño responsive;
- manifiesto y service worker para instalación y uso offline.

## Publicación

El workflow `field-os-pages.yml` publica esta carpeta como artefacto estático de GitHub Pages.

La URL esperada del repositorio es:

`https://setasdlp-code.github.io/Setas-de-la-Pena/`

## Alcance

Los datos son demostrativos. El estado local únicamente conserva la vista elegida y los eventos creados durante la demostración. La versión operativa requerirá backend, autenticación, auditoría y sincronización offline transaccional.
