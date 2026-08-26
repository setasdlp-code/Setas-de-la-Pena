## Imported Claude Cowork project instructions

Crear una empresa en Tenjo, Colombia dedicada al cultivo y venta de productos derivados de  Setas. La empresa usará los métodos de automatización más viables de bajo y mediano costo, favoreciendo soluciones modulares y escalables. Este proyecto será usado para investigación y creación de materiales para socios, empleados, y clientes

## Flujo de trabajo con Claude Code

Antes de escribir código, haz hasta tres preguntas de aclaración si algo sobre los requisitos, la ubicación de archivos o las convenciones existentes es ambiguo.

## Coordinación entre Entornos (Codex / Google AI Studio / Claude Code)

Codex, Google AI Studio y Claude Code escriben sobre el mismo repositorio y working directory. Ninguno de los dos versiona automáticamente antes de escribir, así que si trabajan en simultáneo sobre el mismo archivo, el que guarda al último pisa silenciosamente al otro (sin conflicto visible en git).

Protocolo de sincronización:

1. **Nunca simultáneo sobre los mismos archivos.** Un solo "editor activo" a la vez.
2. **Checkpoint de git entre sesiones.** Antes de pasar el turno a la otra herramienta, hacer commit de lo pendiente (aunque sea `wip: cambios de Studio/Codex` o similar) — nunca dejar cambios sin commitear al cambiar de herramienta.
3. **Al retomar, revisar el diff real.** Antes de escribir nada nuevo, correr `git status` y `git diff` para ver exactamente qué cambió la otra herramienta, en vez de asumir.
4. **Integrar, no revertir.** Si una herramienta rompe algo de la otra, tratar el cambio ajeno como código nuevo a integrar, no como un error a deshacer sin mirar — puede ser intencional.
5. **Cuidado con reescrituras de archivo completo.** Si una herramienta reescribe archivos enteros en vez de editar puntualmente, el diff se vuelve difícil de leer y el merge mental es más costoso. Si eso pasa seguido, separar por ramas (`studio/work`, `codex/work` vs. rama de Claude Code) y hacer merge manual.

### Nota: integración GitHub nativa de AI Studio

Google AI Studio lanzó importación de repos GitHub en julio 2026, pero **todavía no soporta push de vuelta al mismo repo importado** — al exportar, fuerza crear un repositorio nuevo, no sincroniza con el original. Google anunció sync bidireccional automático como fase futura, aún no disponible. Conectar GitHub hoy generaría historiales divergentes en vez de resolver el problema — **no conviene todavía**. Reevaluar cuando el sync bidireccional esté disponible.

## División de trabajo: Codex / Studio vs. Claude Code

La asignación sigue la fortaleza real de cada herramienta:

**Le toca a Codex / Studio** — volumen y autonomía:
- Generar pantallas/componentes nuevos desde cero.
- Rediseños visuales que tocan muchos archivos o componentes a la vez.
- Aplicar tokens de diseño de forma masiva en todo el sistema (colores, spacing, tipografía).
- Copy, contenido, imágenes.
- Tareas largas y bien especificadas que puede correr de forma autónoma sin supervisión constante (scaffolding, boilerplate, explorar varias opciones en paralelo).

**Le toca a Claude Code** — precisión, contexto y revisión:
- Auditorías (UX, performance, seguridad, accesibilidad).
- Fixes puntuales identificados en una auditoría — cambios de pocas líneas donde regenerar el archivo completo arriesga romper algo.
- Lógica de negocio (scoring, recetario, Firebase, telemetría, cálculos) — cualquier cosa donde el contexto histórico del repo importa más que la velocidad.
- Tests, verificación, debugging.
- **Revisar el output de Codex/Studio antes de merge**: chequear que no reescribió de más, que no rompió `knowledge_base/` o `SETAS_OS_CANONICAL.md`, y que el paquete de trabajo cumple sus propios criterios de aceptación.
- Coordinación de git y checkpoints entre sesiones.

**Regla rápida:** "generar mucho, rápido, desde cero" → Codex / Studio. "Razonar con cuidado sobre lo que ya existe, o revisar lo que se generó" → Claude Code.

## Handoff Codex / Studio → Claude Code

Cuando Codex o Studio terminan un paquete de trabajo, antes de mergear Claude Code debe:

1. Leer el paquete de trabajo completo (objetivo, alcance, criterios de aceptación).
2. Correr `git diff` contra la rama base y revisar archivo por archivo — no solo el resumen reportado.
3. Señalar en el PR (no corregir en silencio) cualquier cosa fuera de alcance, sobre-generación, o inconsistencia con la base de conocimiento.
4. Aplicar fixes quirúrgicos si son de pocas líneas; si el fix requiere reescribir de nuevo una porción grande, devolver el trabajo con instrucciones puntuales en vez de reescribirlo él mismo.
