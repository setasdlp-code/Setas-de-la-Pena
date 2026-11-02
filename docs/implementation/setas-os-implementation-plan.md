# Setas OS: implementación para el piloto y la operación diaria

2 de noviembre de 2026. Prioridad confirmada por Sebastián: operación del piloto y UX diaria. Plan propuesto, no ejecución ni certificación del sistema. Base documental inspeccionada: origin/main 1d02824d. Antes de implementar, refrescar main y revisar los cambios posteriores. Propietario: lead técnico Codex; Sebastián valida operación y autoriza producción.

## Resultado y límites

Una persona identifica lo que requiere atención, abre el lote o sala correctos, registra la acción mínima y entiende si quedó guardada, pendiente de sincronización o en conflicto. El piloto se prepara con evidencia verificable; una interfaz completa no demuestra preparación física.

Usar los flujos existentes. No migrar a la arquitectura UX v2 propuesta ni ampliar módulos durante este ciclo. Conservar navegación canónica module/simTab/bitSubtab y sus enlaces, permisos, saldos, cálculos y procedencia. Excluir ajustes agronómicos, scoring, compras reales, reinicios, actuadores, credenciales y cambios de reglas de producción. Cualquier necesidad de esos cambios debe presentarse por separado.

## Secuencia de entrega

| Paquete | Implementación delimitada | Criterio de salida | Dependencia |
|---|---|---|---|
| OS0 · Estado actual | Crear rama desde main fresco; inventariar Hoy, Seguimiento, revisión de preparación, Bodega, lote, captura y sincronización. Clasificar cada requisito: existente comprobado, brecha reproducida o pendiente. Contrastar planes históricos con código y pruebas actuales. | Matriz con evidencia por requisito y fallos reproducibles; no tickets basados solo en planes viejos. | Ninguna |
| OS1 · Turno | Afinar jerarquía en Hoy: excepción o bloqueo, tarea siguiente y acceso al objeto. Usar Seguimiento para preparación y progreso. Datos vacíos, antiguos o pendientes deben explicar qué falta y ofrecer la acción existente adecuada. | Desde Hoy se llega al objeto correcto y se vuelve sin perder ubicación; cuenta vacía no muestra hechos de demostración. | OS0 |
| OS2 · Preparar piloto | Afinar el tablero existente de preparación: evidencia pendiente, responsable, referencia y siguiente acción. Mantener verificaciones existentes de insumos, spawn, equipo, sala, sensores y revisión. | Guardar una revisión incompleta no convierte un requisito en verificado; completar checklist no crea lote ni mueve stock. | OS0 |
| OS3 · Recibir y preparar | Revisar continuidad compra → recepción → lote de insumo → reserva → preparación. Corregir solo brechas reproducidas; mostrar físicos, reservados y disponibles con unidades y origen. Datos desconocidos siguen desconocidos. | Compra pendiente no aumenta stock; recepción y consumo no se duplican; reserva y costo mantienen la semántica canónica. | OS2 |
| OS4 · Registrar en campo | Afinar QR → lote → acción válida → confirmación. Campos mínimos, errores junto al campo, prevención de doble registro, foco de retorno y controles de 48 px en captura de campo. Mantener eventos y transiciones existentes. | Identidad del lote siempre visible; transición prohibida rechazada; registro conserva autor, fecha y objeto según contrato existente. | OS1, OS3 |
| OS5 · Recuperación | Verificar cola, recarga, pérdida de conexión, reconexión, dos dispositivos y cambio de cuenta con fixtures. Extender contratos existentes; no rediseñar sync. | Sin pérdida silenciosa ni duplicación; pendiente/conflicto visible; una cuenta no hereda datos privados de otra. | OS4 |
| OS6 · Aceptación | Recorrer una jornada con fixture: revisar preparación, recibir, planificar, registrar, mover, cosechar y revisar cierre. Después, ensayo supervisado autorizado con datos reales. | Evidencia técnica separada del ensayo operativo; cero defectos críticos abiertos en el recorrido. | OS5 |

Los paquetes son unidades de revisión, no obligación de modificar todos esos componentes. Si un contrato ya pasa, conservarlo y registrar evidencia. Una PR por paquete o por defecto acotado, evitando mezclar cambios científicos con ergonomía.

## Contratos y pruebas

No crear APIs ni esquemas en este ciclo. Si una brecha exige cambiar datos persistidos, detener ese paquete y preparar contrato de compatibilidad/migración con respaldo antes de implementarlo. simulador-app.jsx es fuente; regenerar simulador-app.js con node build.js y no editarlo a mano.

En cada cambio: pruebas unitarias pertinentes, npm test y git diff --check. Si cambia JSX: node build.js y comprobación del bundle. Antes de PR: npm run test:gate:pr según package.json actual. Las pruebas de navegador se ejecutan en entorno aislado con fixtures; no inyectar datos sintéticos en producción.

Reutilizar e2e/today-action-hierarchy.browser.cjs, production-readiness.browser.cjs, purchase-receive.browser.cjs, field-qr-capture.browser.cjs, room-move.browser.cjs, lot-lifecycle.browser.cjs y multi-device-sync.browser.cjs según el área. Su presencia no significa que hayan pasado en este trabajo. Falta de credenciales E2E es bloqueo de entorno, no resultado aprobado.

Escenarios obligatorios: cuenta vacía; preparación incompleta; compra sin recibir; recepción repetida; stock insuficiente según política vigente; QR desconocido; lote aislado; transición inválida; doble pulsación; recarga con pendiente; reconexión y conflicto; cambio de cuenta. Revisar móvil 390×844, ancho de 320 CSS, escritorio y teclado en captura. Medir tareas completadas, errores, campos repetidos y recuperaciones; establecer línea base antes de prometer mejoras.

## Liberación y estimación

Responsable técnico entrega PR con pruebas y reversión. Revisión independiente para datos, permisos o sincronización; Sebastián aprueba merge y producción. Revertir código no garantiza revertir datos: si el paquete modifica persistencia, requiere procedimiento específico. Nunca ejecutar el reinicio del piloto como parte de una prueba productiva.

Estimación de planificación: OS0 3–5 h; OS1 4–8 h; OS2 3–6 h; OS3 4–8 h; OS4 5–9 h; OS5 5–10 h; OS6 3–5 h. Total 27–51 h, sujeto a OS0, sin tiempos de cultivo, preparación física, reclutamiento ni correcciones científicas. El objetivo es cerrar un flujo confiable, no completar todos los módulos.
