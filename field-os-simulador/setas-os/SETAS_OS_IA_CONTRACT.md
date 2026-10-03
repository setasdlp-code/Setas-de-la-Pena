# Setas OS - contrato de arquitectura de información

Estado: implementación canónica para la consolidación UX de 2026-09.

Este contrato traduce la arquitectura propuesta en `SETAS_OS_UX_ARCHITECTURE_V2.md`
a reglas concretas para el shell actual. No cambia los modelos de datos ni los
identificadores históricos de ruta.

## Regla principal

Cada superficie operativa debe responder, en este orden:

1. qué objeto está abierto;
2. en qué estado verificable está;
3. qué requiere atención;
4. cuál es la siguiente acción válida;
5. qué ocurrió antes.

## Destinos canónicos

| Destino | Ruta interna compatible | Responsabilidad |
| --- | --- | --- |
| Hoy | `home` | excepciones, trabajo actual y siguiente acción |
| Lotes | `bitacora` | lotes operativos, detalle, estado y cronología |
| Salas | `clima` | estado ambiental, procedencia de lecturas y acciones de sala |
| Inventario | `inventario` | existencias, movimientos, faltantes y compras |
| Recetas | `catalogo` / `formular` / `produccion` | biblioteca, creación, validación y preparación |
| Conocimiento | módulo `aprender` | SOP, evidencia y referencia estable |

Los identificadores internos se conservan para no romper enlaces, historial,
marcadores, trazas QR ni persistencia local. La interfaz presenta únicamente los
nombres canónicos.

## Acciones globales y contextuales

- Escanear y registrar son acciones globales, no destinos.
- Bitácora es la cronología de un lote u otro objeto, no un destino primario.
- Control es una condición visible en Hoy y Salas, no un destino primario.
- Formular es la acción `Nueva receta` dentro de Recetas.
- Preparar mezcla aparece cuando una receta válida puede pasar a producción.
- Planificar aparece dentro de Lotes.
- Perito, optimización, co-formulación, firmware y simuladores especializados son
  herramientas avanzadas. No compiten con la acción operativa principal.

## Procedencia y estados desconocidos

Una cifra operativa debe declarar una de estas procedencias:

- medida;
- ingreso manual;
- última lectura, con antigüedad;
- estimada;
- referencia de modelo;
- sin lectura.

Una referencia o simulación nunca se etiqueta como medida y nunca genera por sí
sola una alerta operativa. La ausencia de datos se muestra como estado desconocido,
no como estado saludable.

## Seguridad de ejecución

Guardar una receta o planificar un lote puede producir faltantes: el lote queda en
estado planificado y sólo reserva lo disponible. La acción física `Preparar mezcla`
debe reasignar el plan contra la foto actual de Bodega y exige cero faltantes antes
de descontar FIFO o avanzar el lote. La misma comprobación se repite dentro del
controlador de consumo para proteger contra confirmaciones obsoletas.

## Compatibilidad

- Los parámetros `?view=home|bitacora|clima|inventario|catalogo|formular` siguen
  siendo válidos.
- Los alias históricos, incluidos `dashboard`, `camaras`, `iot`, `telemetria` y
  `optimizar`, siguen resolviendo a una ruta interna válida.
- Parámetros ajenos a navegación, como lote, bolsa, canastilla o trazabilidad, se
  preservan al navegar.

## Criterios de aceptación

- Escritorio presenta exactamente los seis destinos canónicos.
- Móvil mantiene Hoy, Lotes, Escanear, Salas y Más; Más contiene Inventario,
  Recetas y Conocimiento sin duplicar acciones internas.
- Hoy coloca trabajo accionable antes de métricas de contexto saludables.
- Recetas abre en la biblioteca; catálogo y herramientas avanzadas son revelados
  bajo demanda.
- Ningún valor de referencia se presenta como medido.
- Ningún control móvil queda debajo del rail inferior ni genera desbordamiento
  horizontal en 360, 390 o 430 px.
