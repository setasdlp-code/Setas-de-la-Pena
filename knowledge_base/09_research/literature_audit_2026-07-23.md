---
title: Auditoría de Literatura — 2026-07-23
document_id: DOC-0041
category: research
load_priority: on_request
last_reviewed: 2026-07-24
confidence: high
primary_sources:
  - Salmones 2017
  - Stamets 2005
  - ICAR-DMR 2020
  - Chang ca. 2010
  - Chang & Miles 2004
related_documents:
  - literature_database.md
  - literature_index.md
  - unresolved_questions.md
  - ../references/bibliography.md
---

# Executive Summary

Se revisaron cinco obras entregadas por el propietario y se contrastaron con la rama que establece shiitake como especie inicial. La auditoría encontró dos errores bibliográficos materiales, setpoints sin respaldo directo y una generalización incorrecta sobre la temperatura de fructificación de shiitake.

La auditoría inicial fue documental y de metadata. El 2026-07-24 el propietario autorizó explícitamente implementar DEC-013 en los SOP y documentos dependientes. El estado continúa en preproducción, con 0 lotes activos; la implementación retira estándares heredados y deja los setpoints de shiitake pendientes de una especificación por cepa.

# Alcance y método

1. Extracción de texto de los cinco PDFs; *Mycelium Running* requirió OCR por ser una copia escaneada.
2. Identificación de autor, año, título, tipo de fuente y localizadores de página.
3. Comparación de cada afirmación relevante con fichas de literatura, documentos de especie, metadata y preguntas abiertas.
4. Separación entre:
   - resultado medido;
   - síntesis secundaria;
   - recomendación institucional;
   - observación o hipótesis;
   - decisión operacional pendiente.
5. Verificación externa de DOI y metadatos para las referencias con conflicto.

Esta revisión no convierte un libro o manual en fuente primaria. Cuando una obra cita estudios ajenos, se conserva como fuente secundaria hasta localizar el trabajo original.

# Resultado por fuente

| ID | Fuente | Hallazgos útiles | Límites y decisión |
|---|---|---|---|
| paper_007 | Salmones, 2017, *Pleurotus djamor...* | Temperatura citada 22–30°C; composición nutricional variable; amplia dispersión de BE; aplicaciones biotecnológicas; riesgo de bioacumulación | Revisión narrativa heterogénea. P. djamor sigue como candidato futuro; remediación separada de alimentos |
| book_004 | Stamets, 2005, *Mycelium Running* | Mycofiltration, mycoremediation, ensayo WSDOT/Battelle, sustrato agotado y advertencias de inocuidad | Mezcla estudios, demostraciones, patentes y observaciones. Útil para hipótesis, no setpoints ni claims |
| guide_002 | ICAR-DMR, 2020, *Growing Oyster Mushroom* | Cultivo madre, spawn, tratamiento de sustrato y rangos ambientales para Pleurotus | El diagrama imprime `CO₂ concentration ->1500 ppm`; no se interpreta como objetivo ni techo sin fuente primaria |
| guide_004 | Chang, ca. 2010, manual UNAPCAEM | Estructura pedagógica y principio de adaptación local | Documento introductorio; no añade parámetros operacionales nuevos |
| book_007 | Chang & Miles, 2004 | Clases térmicas de shiitake, maduración de tronco sintético, inducción dependiente de cepa | Los datos generales de Pleurotus no son automáticamente específicos de P. djamor |

# Localizadores de evidencia

## Salmones 2017 — PDF 01

- PDF p. 4 / revista p. 76: proteína cruda y carbohidratos; variabilidad por estudio.
- PDF p. 5 / revista p. 77: cultivo cálido y síntesis de investigación medicinal.
- PDF p. 6 / revista p. 78: tabla de residuos y BE heterogénea.
- PDF pp. 7–9 / revista pp. 79–81: biodegradación, remediación, escala de evidencia y bioacumulación.

## Stamets 2005 — PDF 02

- pp. 58–68: mycofiltration.
- pp. 86–113: mycoremediation.
- pp. 90–93: demostración WSDOT/Battelle en suelo con diésel.
- p. 92: advertencia de no consumir hongos de sitios peligrosos sin demostrar inocuidad.
- pp. 104–111: metales pesados.

## ICAR-DMR 2020 — PDF 03

- PDF p. 13 / impresa p. 8: cultivo madre y spawn de P. djamor.
- PDF p. 14: diagrama de proceso, pasteurización, tasa de inoculación, spawn run y fructificación.

## Chang ca. 2010 — PDF 04

- PDF pp. 3–6: alcance y estructura del entrenamiento.
- PDF pp. 52–56: marco pedagógico y adaptación local.

## Chang & Miles 2004 — PDF 05

- PDF p. 273: mezclas de spawn y colonización.
- PDF p. 274: crecimiento de micelio y humedad en sistemas de tronco.
- PDF p. 276: inducción y rangos de invernadero citados.
- PDF p. 289 / libro p. 264: madurez de troncos sintéticos.
- PDF p. 290 / libro p. 265: remojo frío y cepas de alta temperatura.
- PDF p. 291 / libro p. 266: clases de baja, media y alta temperatura.
- PDF p. 342 / libro p. 317: efectos generales de CO₂ en Pleurotus; no específicos de P. djamor.

# Correcciones materiales aplicadas

## paper_001

La ficha anterior atribuía el estudio a Gupta & Sharma (2016), lo situaba en *Journal of Applied Biology & Biotechnology* y le asignaba BE de 112% y datos de FAE.

La referencia verificada es Zurbano, Bellere & Savilla (2017), *CLSU International Journal of Science & Technology*, DOI 10.22137/ijst.2017.v2n1.03. El máximo del ensayo fue 31,10% BE. El estudio no midió HR, CO₂, FAE ni una temperatura óptima comparativa.

## paper_002

El DOI 10.1002/ptr.2634 no corresponde a un estudio celular de inducción de NGF. Corresponde al ensayo doble ciego controlado con placebo de Mori et al. (2009) en 30 participantes con deterioro cognitivo leve: 3 g/día durante 16 semanas y seguimiento de 4 semanas.

La muestra pequeña y la preparación específica no autorizan claims generales ni de producto.

## Shiitake

Se retira la afirmación de que shiitake no fructifica en condiciones tropicales. Chang & Miles describen cepas:

- baja temperatura: <10°C;
- temperatura media: 10–20°C;
- alta temperatura: >20°C.

La estrategia de inducción se mantiene pendiente hasta identificar la cepa. L54 y L4055 se describen como cepas reportadas por Cenicafé, no como recomendación comercial actual.

## Pleurotus djamor

Se retiran como estándares:

- 5–8 cambios de aire por hora;
- equivalencias entre minutos de timer y ACH;
- límite universal de CO₂;
- BE esperada universal;
- incompatibilidad absoluta con eucalipto;
- afirmación de que no necesita calefacción en Tenjo.

La ficha ahora conserva rangos de literatura y abre las variables que requieren piloto.

# Cambios por archivo

| Archivo | Cambio |
|---|---|
| `09_research/literature_database.md` | Corrige paper_001 y paper_002; incorpora paper_007; añade límites y localizadores |
| `09_research/literature_index.md` | Reconstruye autores, temas, relevancia y vacíos |
| `references/bibliography.md` | Corrige atribuciones y DOI; agrega Salmones 2017 |
| `01_species/lentinula_edodes.md` | Hace temperatura e inducción dependientes de cepa |
| `01_species/pleurotus_djamor.md` | Elimina setpoints no demostrados y lo mantiene como candidato futuro |
| `metadata/species.yaml` | Distingue rangos de literatura de parámetros operacionales aprobados |
| `09_research/unresolved_questions.md` | Prioriza bloqueadores reales del lote 1 de shiitake |

# Implementación explícita autorizada — 2026-07-24

El hallazgo sobre `06_operations/quality_control.md` quedó resuelto. El SOP ahora gobierna el programa inicial de shiitake mediante compuertas de trazabilidad, formulación, esterilización y especificación por cepa; retira rangos y criterios heredados de *P. djamor*. La actualización se propagó a recuperación automática, estado operativo, KPIs, sustratos, infraestructura, workflow, proveedores, economía, precio y empaque.

# Hallazgos diferidos
- Los PDFs originales no se agregan en esta rama. La auditoría registra citas y páginas; cualquier política de archivo de fuentes debe resolverse por separado.
- paper_003, paper_004, paper_005, guide_001 y varios recursos web no forman parte del paquete adjunto. Se corrigieron únicamente conflictos evidentes; falta una auditoría directa de esas fuentes.
- La normativa INVIMA debe verificarse contra documentación vigente antes de definir etiquetas o claims.
- La validación visual del autoclave permanece en una línea de trabajo separada; esta rama solo conserva el hecho de que el equipo está en sitio y todavía no ha sido comisionado/validado.

# Reglas de uso

- Un rango de literatura no es un setpoint.
- Una duración de timer no equivale a ACH sin volumen y caudal medidos.
- La BE solo es comparable cuando su denominador y base seca están definidos.
- La identidad de cepa prevalece sobre generalizaciones de especie para inducción térmica.
- Una línea de remediación nunca comparte producto, sustrato o claims con la línea alimentaria sin evaluación de inocuidad.
