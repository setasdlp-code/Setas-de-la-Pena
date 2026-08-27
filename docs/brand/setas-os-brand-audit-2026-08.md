# Auditoría de marca — Setas OS

**Fecha:** 26 de agosto de 2026  
**Alcance:** producto digital `field-os-simulador/setas-os/`  
**Referencia:** Design System FOS (`08_brand/field-os-identity/`)  
**Método:** revisión del sistema canónico, tokens activos, pantallas de control y formulación, activos de marca y documentación de interfaz.

## Dictamen ejecutivo

**Resultado: 7,7/10 — identidad sólida, aplicación todavía irregular.**

Setas OS ya posee una dirección reconocible y defendible: cuaderno de campo técnico, papel cálido, tinta, estructura editorial, tipografía con carácter y acentos ligados al estado. La interfaz se diferencia con claridad del SaaS agrícola genérico y expresa bien el cruce entre cultivo, trazabilidad y rigor operativo.

La principal deuda no es crear otra identidad. Es **reducir la distancia entre el FOS canónico y su implementación real**. La pantalla transmite el mundo correcto, pero la densidad, los bordes, la jerarquía de alertas y la convivencia entre nombres/tokens históricos producen ruido. El logo ilustrado de la empresa funciona como firma institucional; Setas OS necesita una firma secundaria más compacta para contextos operativos, sin inventar un símbolo nuevo.

## Lectura estratégica

| Dimensión | Evaluación | Lectura |
|---|---:|---|
| Posicionamiento | 9/10 | “Sistema operativo de campo” es específico, creíble y propio. |
| Distintividad | 9/10 | El lenguaje editorial-botánico evita el aspecto SaaS genérico. |
| Coherencia visual | 7/10 | La gramática existe, pero hay capas históricas y excepciones en CSS. |
| Jerarquía operativa | 7/10 | El dato es protagonista, aunque demasiados contenedores compiten entre sí. |
| Accesibilidad | 8/10 | Existe trabajo explícito de contraste; faltan auditorías automatizadas recurrentes. |
| Escalabilidad | 7/10 | Los tokens y componentes están definidos, pero la hoja principal continúa siendo extensa. |
| Voz de producto | 8/10 | Clara, agronómica y sobria; algunos rótulos pueden ser más accionables. |

## Lo que debe preservarse

1. **La tesis “cuaderno de campo, no dashboard SaaS”.** Papel, reglas, tablas, códigos y estructura impresa son la ventaja estética central.
2. **Gaya como voz editorial.** Aporta memoria y vínculo botánico en títulos; IBM Plex Sans/Mono debe conservar el trabajo operativo y numérico.
3. **Color con significado.** Oliva para activo, terracota para atención, azul gris para información, óxido para error. No convertir los acentos en decoración.
4. **Planitud y precisión.** Sin sombras, radios mínimos y bordes funcionales son coherentes con FOS.
5. **Lenguaje de procedencia.** Tenjo, lote, especie, sustrato, cosecha y evidencia son activos de marca, no solo datos.

## Hallazgos prioritarios

### P0 — Definir una arquitectura de firma para producto

El logotipo ilustrado de Setas de la Peña tiene riqueza y personalidad, pero pierde legibilidad en navegación estrecha, favicons y encabezados densos. Hoy la barra lateral resuelve esto mediante un wordmark tipográfico apilado, sin una relación documentada con el logotipo maestro.

**Recomendación:** adoptar tres niveles, sin redibujar el logo principal:

- **Institucional:** logo ilustrado completo para portada, acceso, documentación y comunicaciones externas.
- **Producto:** lockup tipográfico `Setas OS / Sistema de campo`, sobrio y compacto.
- **Microfirma:** monograma tipográfico `S·OS` o `OS`, únicamente para favicon/estado reducido, construido con la tipografía y retícula FOS; no presentarlo como nuevo logo corporativo.

### P0 — Hacer visible la jerarquía semántica del color

En el tablero, terracota participa a la vez en navegación, encabezados, enlaces y alertas. Aunque es coherente cromáticamente, la atención crítica pierde exclusividad.

**Recomendación:** reservar terracota y óxido para atención/error; usar tinta u oliva en navegación activa y acciones primarias. Un color debe responder “¿qué significa?”, no “¿qué se ve bien aquí?”.

### P1 — Reducir el “marco dentro del marco”

La interfaz usa líneas con mucha frecuencia: perímetros de página, módulos, submódulos, campos y llamadas. Esto sostiene el carácter impreso, pero en pantallas densas aplana la jerarquía.

**Recomendación:** aplicar tres pesos máximos:

- regla pesada: división o cambio de contexto;
- regla media: módulo interactivo;
- hairline: separación interna.

Eliminar el perímetro cuando el fondo, el espacio o una regla superior ya expresen el agrupamiento.

### P1 — Separar expresividad y operación en tipografía

Gaya funciona muy bien en títulos y momentos editoriales, pero su repetición en etiquetas, tarjetas y controles reduce velocidad de escaneo.

**Recomendación:** Gaya solo en H1/H2 y frases de marca; IBM Plex Sans para navegación, controles y prosa; IBM Plex Mono para métricas, códigos, estados y metadatos.

### P1 — Consolidar la fuente real de tokens

La documentación declara FOS como fuente única, mientras la implementación mantiene alias históricos (`moss`, `coral`, `paper-50`) y valores directos dentro de `sim.css`. La capa puente es útil para compatibilidad, pero no debe convertirse en vocabulario de nueva autoría.

**Recomendación:** toda regla nueva debe usar tokens FOS semánticos. Medir trimestralmente: colores hex directos, sombras, radios ajenos a token y variables históricas agregadas.

### P2 — Llevar la marca al comportamiento, no añadir decoración

Setas OS no necesita más ilustraciones dentro de las vistas de trabajo. Necesita interacciones que expresen criterio de campo: confirmaciones trazables, estados inequívocos, procedencia visible y alertas que expliquen causa y acción.

**Recomendación:** cada estado importante debe incluir `qué ocurrió + dónde + siguiente acción`, con código/lote en mono. Usar la ilustración botánica solo en acceso, vacío inicial, documentación o hitos de ciclo.

## Sistema visual recomendado

### Idea rectora

**“Del sustrato al dato.”**

No es un nuevo eslogan comercial; es la síntesis interna que ordena la identidad de producto. Une material vivo, observación y evidencia sin recurrir a misticismo.

### Paleta funcional

| Rol | Token FOS | Uso |
|---|---|---|
| Papel | `--paper-0` / `--paper-1` | lienzo y panel |
| Tinta | `--ink-0` / `--ink-1` | texto, estructura, navegación |
| Activo | `--accent-olive` | progreso, selección confirmada, acción primaria |
| Atención | `--accent-terracotta` | desviación recuperable |
| Información | `--accent-blue-grey` | telemetría, referencia, enlace |
| Error | `--accent-rust` | bloqueo, pérdida, riesgo crítico |

### Tipografía por función

- **Gaya:** portada, H1, H2, hitos y frases editoriales.
- **IBM Plex Sans:** navegación, controles, instrucciones y tablas narrativas.
- **IBM Plex Mono:** lote, métricas, timestamps, especies abreviadas y telemetría.

### Fotografía e ilustración

- Macrofotografía honesta de sustrato, fructificación y manos en operación.
- Luz natural fría de Sabana con superficies de kraft, acero y madera usada.
- Ilustración grabada como firma institucional, no como relleno de tarjetas.
- Nada de micelio luminoso, neón “AI”, laboratorios futuristas ni imaginario místico.

## Plan de acción

### 0–30 días

1. Documentar las tres firmas y normalizar el encabezado de producto.
2. Inventariar usos de terracota/óxido y corregir los que no expresen estado.
3. Definir la matriz de pesos de borde y aplicarla al Tablero y Formulador.
4. Añadir una comprobación automática para hex, sombras y radios nuevos.

### 31–60 días

1. Migrar componentes de mayor tráfico a tokens semánticos FOS.
2. Normalizar tipografía de navegación, controles, métricas y estados.
3. Probar jerarquía con recorridos de escaneo: iniciar jornada, formular, registrar evento y resolver alerta.

### 61–90 días

1. Crear plantillas de acceso, vacío, error y cierre de ciclo.
2. Ejecutar auditoría WCAG visual y automatizada en escritorio/móvil.
3. Publicar un catálogo vivo de componentes con estado, uso y ejemplo prohibido.

## Criterios de aceptación

- Cero colores nuevos sin rol semántico documentado.
- Cero sombras decorativas.
- Máximo tres pesos de borde visibles por vista.
- Gaya ausente de controles y prosa operativa.
- Toda alerta crítica tiene causa, contexto y siguiente acción.
- La marca es reconocible en monocromo y sin ilustración.
- La navegación móvil conserva nombre de producto, estado y acción principal.

## Entregable visual

La propuesta de dirección se materializa en [`setas-os-brand-board.html`](./setas-os-brand-board.html). Es un tablero 3×3 reproducible y construido con los activos y principios vigentes; no reemplaza los archivos canónicos ni propone un rediseño del logotipo corporativo.

