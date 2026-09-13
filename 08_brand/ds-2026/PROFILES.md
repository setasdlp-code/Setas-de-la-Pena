# DS-2026 · núcleo y perfiles

DS-2026 es un solo sistema con dos perfiles de producto. El núcleo define la
gramática visual, los componentes, la accesibilidad y la procedencia del
contenido. Los perfiles cambian la densidad, la secuencia de lectura y el tipo
de decisión que la interfaz debe facilitar; no crean una segunda fuente de
tokens.

```text
DS-2026 Core
├── FOS Operations
│   ├── Field
│   └── Control
└── Swiss Botanical Market
    ├── Archive
    └── Culinary Market
```

## Contrato compartido

- La información se presenta como `objeto → estado → evidencia → próxima acción`.
- El estado operativo y la procedencia son dimensiones independientes.
- Los componentes consumen aliases semánticos; los pigmentos primitivos se
  usan únicamente dentro de la capa de tokens.
- El color acompaña siempre una palabra, un icono o una estructura legible.
- Una imagen declara si es documental, ilustrativa, reconstruida o de referencia.
- Un dato sin fuente se muestra como pendiente o ilustrativo; nunca imita una
  medición, una disponibilidad o un precio confirmado.

## FOS Operations

FOS ayuda a decidir y actuar. Usa `field` para registros y procedimientos y
`control` para telemetría y supervisión. Su densidad es media-alta y sus
pantallas priorizan excepciones, trazabilidad y la siguiente acción válida.

Ejemplo:

```text
Lote LIO-042
Fructificación · Atención
CO₂ medido: 1.240 ppm · 10:42
Abrir ventilación y registrar una nueva medición
```

Una interfaz operativa no convierte un objetivo en una medición ni presenta
un valor de demostración como lectura de un sensor.

## Swiss Botanical Market

Swiss Botanical ayuda a conocer, elegir y usar el producto. Usa `archive` para
historias, fichas y procedencia, y `culinary-market` para decisión comercial.
Su densidad es baja-media y la secuencia recomendada es:

```text
qué es → perfil culinario → cómo usarlo → formato → disponibilidad
→ precio → origen y cosecha → conservación → próxima acción
```

Los campos comerciales pueden existir antes de estar confirmados, pero deben
mostrar su estado real: `Precio por confirmar`, `Consultar cosecha` o
`Conservación pendiente de validación`.

## Estado operativo

Estados mínimos: `activo`, `atención`, `bloqueado`, `cuarentena`, `fallido`,
`descartado` y `no disponible`. Un producto puede estar disponible aunque un
dato asociado continúe pendiente; por eso este eje nunca se deriva de la
procedencia.

## Procedencia del dato

Cada dato que influya en una decisión debe poder expresar:

| Campo | Valores o formato |
|---|---|
| `value` | valor visible |
| `provenance` | `measured`, `calculated`, `estimated`, `target`, `manual`, `simulated`, `pending` |
| `source` | sensor, registro, cálculo, persona o documento |
| `observedAt` | fecha y hora, cuando aplique |
| `owner` | persona o sistema responsable |

En prototipos se usa `data-content-status="illustrative"` en el documento y
la leyenda visible **Prototipo · datos ilustrativos, no usar para producción o
compra**. Una afirmación deja de ser ilustrativa solo cuando su fuente canónica
está enlazada.

## Procedencia de imagen

| Tipo | Uso |
|---|---|
| `documentary` | fotografía del lote, espacio o producto real |
| `illustrative` | representación botánica o conceptual |
| `reconstruction` | escena recreada para explicar un proceso |
| `reference` | material externo usado como referencia visual |

Una figura documenta tipo, fuente o autor, fecha, licencia y lote relacionado
cuando corresponda. Una ilustración botánica puede identificar una especie,
pero no demuestra el estado de un lote.

## Criterio de composición

Todas las páginas pueden alinearse con la macro-retícula de doce columnas. Los
componentes internos y las piezas impresas pueden usar retículas locales. Una
composición tiene un acento de identidad dominante; varios colores semánticos
pueden coexistir cuando representan estados reales.
