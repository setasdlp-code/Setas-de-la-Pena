# Ejecución coordinada · 2 de noviembre de 2026

## WEB0 completado y publicado

Commit d6e31cc5680453b9a76df7c14470821a01cb53a3; PR #446 a main, sin fusionar. Despliegue Cloudflare fd7e75fc-9208-4f76-bddc-3269cbebd55a. Producción: https://setas-de-la-pena.pages.dev/home. Identidad del artefacto: /release.json. Es carga manual vinculada por SHA/manifiesto, no conexión automática Git–Cloudflare.

Pruebas: web 72 controles/39 renders, piloto 15 casos, export 72 controles, delivery 52 controles; HTTPS 251 archivos y 17 rutas coincidentes. El PR #446 tenía el control remoto Quality aprobado al verificarlo. La aprobación de merge sigue siendo humana.

## Cambios siguientes implementados en rama dependiente

- WEB1: nueve acciones de receta como Preparar mensaje de aviso según guía de marca; explicación explícita de borrador, ausencia de envío y de suscripción. Se mantienen receta, escala y cantidad.
- OS0: las 1724 unitarias del estado base pasaban; el gate visual fallaba por ausencia de declaración illustrative en el mockup de Juaica. Se añadió la declaración; no cambia datos operativos.
- OS2: el formulario de evidencia se remonta al cambiar el alcance del plan. Un borrador anterior no queda listo para guardarse como revisión de otra sala.
- OS4: una captura de riego/observación conserva el bloqueo hasta que ambas escrituras terminan, incluso si una falla antes. El reintento conserva identidad y no duplica el historial. Controles de captura quedan deshabilitados mientras están pendientes.

Validación final: node build.js; node build.test.js; npm test (1727 unitarias y 19 gates aprobados); npm run test:browser completo aprobado. Después del ajuste final de rechazo parcial se repitieron field-qr-capture y production-readiness en navegador, ambos aprobados. Web 72 controles/39 renders y piloto 15 casos aprobados. git diff --check aprobado. Revisión independiente acotada aplicada a capturas y alcance de evidencia.

## Pendiente, sin afirmar ejecución completa

OS5 necesita el [contrato de compatibilidad](qr-recovery-compatibility-contract.md) y una entrega de persistencia independiente. Hoy, Bodega y ciclo de lote conservan los recorridos existentes cubiertos por la batería de navegador; eso no certifica la operación física ni reemplaza una jornada supervisada. OS6 y WEB6 requieren participación humana: ensayo operativo y estudio propuesto con cuatro profesionales y dos personas que cocinen en casa. WEB2–WEB5 siguen sujetos a necesidades demostradas, medición y revisión editorial; no se añadieron bloques ni filtros por completar una lista.

Los cambios de esta segunda rama no se han desplegado en Setas OS ni sustituyen el artefacto web d6e31cc5. No se fusionó main, no se reinició el piloto y no se cambiaron credenciales, reglas, inventario productivo ni parámetros agronómicos.
