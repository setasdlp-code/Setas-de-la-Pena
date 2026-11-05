---
title: Síntesis de Investigación Aplicada
document_id: DOC-0044
category: research
load_priority: on_request
last_reviewed: 2026-11-05
confidence: medium
primary_sources:
  - book_007
  - paper_006
  - paper_007
  - guide_002
related_documents:
  - literature_audit_2026-07-23.md
  - literature_database.md
  - unresolved_questions.md
  - ../01_species/lentinula_edodes.md
  - genetica_sustratos_shiitake_2026-11-04/informe.md
---

# Alcance

Esta síntesis interpreta la literatura para el estado actual del proyecto. *Lentinula edodes* es la especie prioritaria de arranque; *Pleurotus djamor* permanece como candidato futuro. La evidencia de investigación no sustituye una especificación operacional aprobada.

# Shiitake: cepa, madurez e inducción

Chang y Miles (book_007, cap. 13) distinguen cepas de fructificación baja, media y alta temperatura. La necesidad de choque frío depende de la cepa. Por tanto:

- 10–16°C no es un rango universal;
- el choque frío no es obligatorio para toda cepa;
- la identidad y clase térmica del spawn son datos de entrada críticos;
- la transición a fructificación debe usar señales de madurez del bloque y una estrategia versionada.

Para troncos sintéticos, la literatura describe colonización, formación de protuberancias y pardeamiento como etapas relevantes. Sus tiempos sirven para planificar observaciones, no como calendario garantizado.

# Sustrato inicial de shiitake

El programa prioriza la familia de serrín de madera dura suplementado y esterilizado. La receta exacta sigue pendiente.

La relectura de paper_006 (§3.7, pp. 44–48) atribuye el rendimiento medio de 57,6% a L13/T2 con tratamiento térmico y 75,7% a L4055/T2 esterilizada. El rendimiento incluye todas las bolsas sembradas; la eficiencia biológica media del boletín se calcula sobre bolsas productivas. Localizadores y límites en `genetica_sustratos_shiitake_2026-11-04/informe.md`, A9 y §8. Ese resultado:

- conserva la definición del estudio y no se traduce automáticamente a BE;
- fue obtenido con cepas y clima específicos;
- no demuestra disponibilidad comercial actual de L54 o L4055;
- requiere validación en Tenjo antes de convertirse en receta.

# Esterilización y altitud

Los sustratos suplementados de shiitake requieren un proceso térmico controlado. El autoclave está en sitio, pero el ciclo representativo no está comisionado ni validado.

Aproximadamente 2.600 m s. n. m. cambia el punto de ebullición del agua y exige distinguir vapor a presión atmosférica de esterilización presurizada. La presión, temperatura, tiempo, carga y penetración térmica deben registrarse; una duración aislada no prueba esterilidad.

# Pleurotus djamor: límites de la evidencia

La literatura revisada confirma que *P. djamor* es un hongo de afinidad cálida y que puede utilizar diversos residuos lignocelulósicos. No respalda una regla universal para Tenjo de:

- 5–8 ACH;
- 5 minutos ON / 20 minutos OFF;
- CO₂ máximo único;
- BE de 80–130%;
- incompatibilidad absoluta con eucalipto.

Un timer solo describe el actuador. Para expresar ACH se necesitan volumen efectivo y caudal bajo la resistencia real del sistema. Cualquier piloto futuro debe identificar cepa, sustrato y cámara y medir su respuesta.

# Tenjo y control ambiental

La temperatura exterior de Tenjo no basta para aprobar una cepa. El proyecto debe registrar microclima real de incubación y fructificación, compensar el SCD30 a 2.600 m y validar sensores en alta humedad.

Las cámaras CLOUDLAB y Terra Fungus son infraestructura disponible para prueba. Sus bandas de control se definen después de conocer la cepa y completar mediciones de volumen, caudal y estabilidad.

# Evidencia medicinal y claims

La corrección de paper_002 confirma que Mori et al. (2009) fue un ensayo pequeño en deterioro cognitivo leve, no un estudio celular de NGF. Ninguna ficha de especie autoriza claims de tratamiento. Cualquier mensaje nutricional o medicinal exige evidencia específica del producto y revisión regulatoria.

# Decisiones operacionales derivadas

1. Comprar spawn de shiitake solo con trazabilidad suficiente para identificar proveedor, lote y cepa o código comercial.
2. Aprobar una formulación antes de preparar el lote.
3. Validar el autoclave con carga representativa.
4. Definir criterios de madurez, inducción, ambiente y cosecha en la especificación del lote.
5. Medir BE, contaminación, calidad y pérdidas sin imponer metas previas al piloto.
6. Mantener *P. djamor* fuera del arranque hasta revisar los primeros ciclos documentados de shiitake.

# Base biológica reproducible — investigación 2026-11-04

El informe `genetica_sustratos_shiitake_2026-11-04/informe.md` (DOC-0140) y su bibliografía `genetica_sustratos_shiitake_2026-11-04/bibliografia.md` (DOC-0141) incorporan evidencia de identidad y clase térmica, conservación de spawn, materia seca, madurez e inducción. Separan material comercial/proveedor de genética pura y proponen una secuencia de ensayos con pérdidas incluidas. La lectura de fuentes fue heterogénea: métodos/resultados en algunos artículos, resumen original en otros y acceso incompleto en Rocha/Furlan; no hay mediciones nuevas de Tenjo.

Las propuestas de muestreo, tamaño de ensayo y retención no son estándares operativos. DEC-019/021 siguen vigentes. SH01–SH04/SH07/SH08 requieren trazabilidad, decisiones o validación local; la literatura no cierra los ensayos. Las implicaciones se consolidan en ARK-006 y ARK-026 de `active_research_knowledge.md`.

# Referencias

Ver `literature_database.md`, `literature_index.md` y `literature_audit_2026-07-23.md` para citas, localizadores y límites de cada fuente.
