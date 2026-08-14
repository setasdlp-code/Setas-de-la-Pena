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
