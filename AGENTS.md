## Imported Claude Cowork project instructions

Crear una empresa en Tenjo, Colombia dedicada al cultivo y venta de productos derivados de  Setas. La empresa usará los métodos de automatización más viables de bajo y mediano costo, favoreciendo soluciones modulares y escalables. Este proyecto será usado para investigación y creación de materiales para socios, empleados, y clientes

## Flujo de trabajo con Claude Code

Antes de escribir código, haz hasta tres preguntas de aclaración si algo sobre los requisitos, la ubicación de archivos o las convenciones existentes es ambiguo.

## Coordinación con Google AI Studio

Google AI Studio y Claude Code escriben sobre el mismo working directory, sin ramas separadas. Ninguno de los dos versiona automáticamente antes de escribir, así que si trabajan en simultáneo sobre el mismo archivo, el que guarda al último pisa silenciosamente al otro (sin conflicto visible en git).

Protocolo:

1. **Nunca simultáneo sobre los mismos archivos.** Un solo "editor activo" a la vez.
2. **Checkpoint de git entre sesiones.** Antes de pasar el turno a la otra herramienta, hacer commit de lo pendiente (aunque sea `wip: cambios de Studio` o similar) — nunca dejar cambios sin commitear al cambiar de herramienta.
3. **Al retomar, revisar el diff real.** Antes de escribir nada nuevo, correr `git status` y `git diff` para ver exactamente qué cambió la otra herramienta, en vez de asumir.
4. **Integrar, no revertir.** Si una herramienta rompe algo de la otra, tratar el cambio ajeno como código nuevo a integrar, no como un error a deshacer sin mirar — puede ser intencional.
5. **Cuidado con reescrituras de archivo completo.** Si Studio reescribe archivos enteros en vez de editar puntualmente, el diff se vuelve difícil de leer y el merge mental es más costoso. Si eso pasa seguido, considerar separar por ramas (`studio/work` vs. rama de Claude Code) y hacer merge manual.

### Nota: integración GitHub nativa de AI Studio (revisar más adelante)

Google AI Studio lanzó importación de repos GitHub en julio 2026, pero **todavía no soporta push de vuelta al mismo repo importado** — al exportar, fuerza crear un repositorio nuevo, no sincroniza con el original. Google anunció sync bidireccional automático como fase futura, aún no disponible. Conectar GitHub hoy generaría historiales divergentes en vez de resolver el problema — **no conviene todavía**. Reevaluar cuando el sync bidireccional esté disponible.

## División de trabajo: Studio vs. Claude Code

Para no desperdiciar esfuerzo (tokens, tiempo, precisión) en la herramienta equivocada, cada tarea se asigna según su naturaleza:

**Le toca a Google AI Studio** — trabajo de alto volumen y generación amplia:
- Generar pantallas/componentes nuevos desde cero.
- Rediseños visuales que tocan muchos archivos o componentes a la vez.
- Aplicar tokens de diseño de forma masiva en todo el sistema (colores, spacing, tipografía).
- Copy, contenido, imágenes.

**Le toca a Claude Code** — análisis y arreglos quirúrgicos:
- Auditorías (UX, performance, seguridad, accesibilidad).
- Fixes puntuales identificados en una auditoría — cambios de pocas líneas donde regenerar el archivo completo arriesga romper algo.
- Lógica de negocio (scoring, recetario, Firebase, cálculos).
- Tests, verificación, debugging.
- Coordinación de git y checkpoints entre sesiones.

**Regla rápida:** si la tarea es "crear/generar/rediseñar ampliamente" → Studio. Si es "arreglar/diagnosticar/verificar con precisión" → Claude Code.
