# Página pública: implementación desde la portada reducida

2 de noviembre de 2026. Plan ejecutable complementario a implementation-plan.md y browser-findings.md. Propietario técnico: lead Codex; aprobación editorial, comercial y de publicación: Sebastián.

## Resultado

Conservar la portada reducida de Juaica y permitir elegir una seta, encontrar una receta y preparar un borrador sin confundirlo con una compra o un mensaje enviado. Priorizar lo existente: nueve recetas y 27 combinaciones de escala/destino verificadas en navegador. Evidencia en recipe-journey-verification.json. No reintroducir leyenda, fila duplicada, plato ni carrusel en el hero.

## Entregas y aceptación

| Paquete | Cambio | Salida verificable |
|---|---|---|
| WEB0 · Fuente y publicación | Partir de main actualizado en rama propia; reconciliar composición f63ffa29 y paquete preservado con código comercial vigente. Exportar desde commit identificado y registrar manifiesto. Publicar solo el artefacto validado. | Portada reducida intacta; prelanzamiento conservado; commit, PR, artefacto y despliegue vinculados. No activar auto-deploy de main por defecto. |
| WEB1 · Acciones claras | Unificar los nueve enlaces de receta como Preparar consulta y añadir una explicación común: prepara un borrador local; no se envía. Mantener URL, recipe y scale. Si más adelante cambia el estado comercial, revisar estas etiquetas con el contrato real de canal. | Cada enlace transmite la misma intención y conserva contexto/gramos. Separar este cambio del despliegue de restauración WEB0. |
| WEB2 · Elegir ingrediente | Afinar resúmenes de especie con sabor, textura y técnica. Usar información ya documentada; conservar citas y distinción especie/lote. No ampliar home con bloques de promoción. | Se distingue cada especie y se llega a ficha o receta sin duplicación bajo el grabado. |
| WEB3 · Cocina y consulta | Verificar escalado de ingredientes, regreso y borrador; explicar peso limpio frente a presentación de compra. Filtros solo cuando el catálogo permita una decisión útil, con limpieza y estado visible. | Las 27 combinaciones siguen pasando; editar cantidad no altera receta base; desconocidos no se vuelven cero ni disponibles. |
| WEB4 · Restaurantes | Entrada profesional breve con uso del producto y preparación de contexto para consulta. Reutilizar la selección Para restaurante; no abrir CRM ni captar datos mientras no exista canal aprobado. | Se comunica qué puede hacerse ahora y qué información falta, sin inventar formatos, cobertura o capacidad. |
| WEB5 · Accesibilidad y entrega | Revisar teclado, foco, menú, formularios y zoom; medir carga e imágenes antes de optimizar. Mantener misma experiencia source/export/HTTPS. | Sin desbordamiento a 320 CSS; navegación y borrador operables con teclado; export y publicación verificadas por hashes/rutas. |
| WEB6 · Comprensión | Ensayo propuesto con cuatro cocineros profesionales y dos domésticos: elegir especie, encontrar receta, explicar estado comercial y preparar borrador. | Registrar errores y dudas; resolver fallos críticos antes de añadir alcance. No interpretar muestra pequeña como prueba de conversión. |

Dependencias: WEB0 antes de cambios; WEB1 y WEB2 antes de WEB3; WEB4 reutiliza WEB3; WEB5 acompaña cada paquete y cierra antes de WEB6. No cambios de APIs o esquemas previstos. Si se añade un canal real, tratarlo como activación comercial separada con presentación, precio, disponibilidad, entrega y aprobación humana.

## Validación y publicación

Reutilizar controles check_public_website.cjs, check_public_pilot.cjs, check_public_export.cjs, check_public_delivery.cjs y check_public_live.py según alcance y contrato vigente. No eliminar aserciones para encubrir un cambio. Registrar por separado éxito local, exportación y HTTPS. Conservar paquete anterior y comprobar reversión. Si una descarga devuelve 403, no afirmar igualdad de hashes; usar navegador para observación y registrar la verificación remota pendiente.

Casos: receta base/doble/triple, nombre correcto, contexto eliminado, cantidad inválida, municipio faltante, canal nulo, precio desconocido, borrador visible y sin envío, menú móvil y retorno de foco. No ejecutar compras ni transmitir formularios de prueba en producción.

## Estimación y frontera con Setas OS

Usar el backlog de 16 tareas ya entregado como envolvente de 44–79 h; no sumarlo otra vez a este plan. Reestimar después de WEB0 descontando funciones existentes. La publicación de restauración no espera nuevas funciones de marketing.

No conectar Firestore operativo a la web en esta fase. Mantener datos comerciales públicos curados y aprobación humana; ningún lote, sensor, costo interno o dato personal se publica automáticamente. Una futura proyección pública necesita contrato mínimo, autorización, privacidad, caducidad y reversión propios. La interfaz no convierte previsión de cosecha en stock.
