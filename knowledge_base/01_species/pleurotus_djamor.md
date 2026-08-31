---
title: Pleurotus djamor — Pink Oyster / Orellana Rosada
document_id: DOC-0008
category: species
load_priority: selective
last_reviewed: 2026-07-23
confidence: medium
primary_sources:
  - Zurbano, Bellere & Savilla 2017 (paper_001)
  - Salmones 2017 (paper_007)
  - ICAR-DMR 2020 (guide_002)
  - Chang & Miles 2004 (book_007; datos generales de Pleurotus)
related_documents:
  - ../09_research/literature_database.md
  - ../09_research/literature_audit_2026-07-23.md
  - pleurotus_ostreatus.md
  - ../02_substrates/substrate_library.md
---

# Executive Summary

*Pleurotus djamor* es un candidato futuro, no la especie activa de arranque. La literatura confirma su afinidad por condiciones cálidas y su capacidad de crecer sobre diversos residuos lignocelulósicos, pero no sustenta un setpoint universal de CO₂, FAE, BE ni duración de ciclo para Tenjo.

No se debe convertir una duración de timer en cambios de aire por hora sin conocer volumen efectivo, caudal bajo presión y comportamiento del recinto. Cualquier piloto de P. djamor debe diseñarse después de estabilizar el programa inicial de shiitake.

# Research Consensus

## Temperatura

| Fuente | Contexto y dato |
|---|---|
| Salmones 2017 | Revisión narrativa: 22–30°C en estudios citados |
| ICAR-DMR 2020 | Spawn run y fructificación descritos a 24–32°C |
| Zurbano et al. 2017 | Incubación experimental a 32°C; no comparó un gradiente térmico |
| Fuentes técnicas secundarias | Frecuentemente citan 20–30°C |

**Interpretación:** P. djamor es termófilo respecto de otras ostras, pero el rango operacional depende de cepa, sustrato y cámara. No se afirma que el clima de Tenjo sea suficiente sin medición.

## CO₂ y ventilación

La evidencia revisada no permite fijar un único límite:

- guide_002 divide la leyenda entre `CO₂ concentration-` y, tras el salto de línea, `>1500 ppm`. La lectura tipográfica es “mayor de 1.500 ppm”; el valor es fisiológicamente atípico, no está acompañado de un estudio primario y puede ser un error editorial.
- guide_003 reproduce rangos ambientales secundarios atribuidos a Stamets.
- book_007 describe respuestas generales del género *Pleurotus*, no datos específicos de P. djamor.
- paper_001 no midió CO₂, caudal, FAE ni morfología en función de ventilación.

**Decisión curatorial:** no usar 500–1.500 ppm, “>1.500 ppm”, 5–8 ACH ni un ciclo fijo de timer como estándar. Un futuro piloto debe registrar CO₂, morfología, caudal y volumen antes de derivar control de ventilación.

## Rendimiento y BE

| Fuente | Resultado | Límite |
|---|---|---|
| Zurbano et al. 2017 | Máximo 31,10% BE con paja de arroz:cocopeat:salvado 7:3:1 | Una cepa y método filipino |
| ICAR-DMR 2020 | BE 80–100% en el boletín | Protocolo de extensión sin diseño experimental publicado |
| Salmones 2017 | Tabla con amplia dispersión entre residuos | Estudios heterogéneos |

No existe una BE “esperada” única para paja de trigo, bagazo, aserrín o Master's Mix en Setas de la Peña.

# Technical Details

## Taxonomía

- Reino: Fungi
- Orden: Agaricales
- Familia: Pleurotaceae
- Nombre común: pink oyster / orellana rosada.

La sinonimia debe verificarse en una fuente taxonómica vigente antes de etiquetado o registros externos.

## Cultivo madre y spawn — guide_002

| Variable | Dato descrito | Uso permitido |
|---|---|---|
| Medio | PDA o MEA | Referencia para un futuro programa de cultivo |
| Temperatura | 25±2°C | Punto de partida, no validado localmente |
| pH | 7,0 | Dato del boletín |
| Almacenamiento de cultivo | 3–4 meses a 15–18°C | Verificar viabilidad y contaminación |
| Spawn | Trigo, arroz, centeno o mijo; 15–20 días | Depende de grano y procedimiento |
| Tasa de inoculación | 3% del sustrato húmedo o 10% del seco | No mezclar bases al comparar |
| Incubación | 10–11 días a 24–32°C | Contexto del boletín |
| CO₂ en bolsa | 10.000–20.000 ppm | Descripción de spawn run, no objetivo de sala |

## Fructificación — evidencia de diseño, no SOP

| Variable | Evidencia disponible | Estado |
|---|---|---|
| Temperatura | 22–30°C en paper_007; 24–32°C en guide_002 | Rango de literatura |
| HR | 80–85% en guide_002; otras guías citan 85–90% | Resolver con prueba de cepa/cámara |
| Luz | 600–800 lux en guide_002; otras fuentes secundarias difieren | Medir en piloto |
| CO₂/FAE | Inconsistente o secundario | Sin setpoint aprobado |
| Ciclo | Se reporta cosecha rápida, con definiciones variables | Sin duración aprobada |

## Sustratos

La especie puede utilizar múltiples residuos lignocelulósicos. Para el proyecto:

- no se designa un sustrato primario antes de un ensayo comparativo;
- no se mantiene la exclusión absoluta de eucalipto sin evidencia específica de especie, madera y tratamiento;
- la humedad inicial, base de cálculo y tratamiento térmico deben registrarse;
- rendimiento fresco, masa seca inicial y BE deben usar una definición uniforme.

## Producto y poscosecha

ICAR-DMR describe textura relativamente firme y vida útil corta, de 3–4 días, para su contexto. El color varía con genotipo y ambiente. Estos atributos exigen una validación comercial y de cadena fría antes de priorizar la especie.

## Biotecnología y seguridad

Salmones 2017 y Stamets 2005 documentan líneas de degradación, mycofiltration y remediación. Gran parte de la evidencia es de laboratorio, demostraciones o síntesis secundarias.

- Mantener los ensayos de remediación separados física y documentalmente de la producción alimentaria.
- No consumir ni vender cuerpos fructíferos cultivados sobre sustratos sospechosos de metales o contaminantes sin análisis de inocuidad.
- No convertir resultados de laboratorio en claims de remediación sin piloto y medición analítica.

# Future Pilot Gate

Antes de activar P. djamor:

1. seleccionar spawn trazable e identificar la cepa;
2. medir la capacidad térmica real del recinto;
3. definir dos o más formulaciones comparables;
4. medir volumen y curva de caudal del sistema de extracción;
5. acordar métricas de BE, contaminación, morfología y vida útil;
6. separar cualquier línea ambiental de la alimentaria.

# Open Questions

- ¿Qué cepa comercial está disponible en Colombia y cuál es su ficha técnica?
- ¿Puede la cámara sostener el rango térmico requerido sin comprometer costo y calidad?
- ¿Qué formulación local ofrece mejor relación entre rendimiento, costo y contaminación?
- ¿Qué relación CO₂–morfología aparece bajo el caudal medido de la instalación?
- ¿Cuál es la vida útil real bajo la cadena fría disponible?

# References

- Zurbano, L. Y., Bellere, A. D., & Savilla, L. C. (2017). Mycelial growth, fruiting body production and proximate composition of *Pleurotus djamor* on different substrate. *CLSU International Journal of Science & Technology, 2*(1). https://doi.org/10.22137/ijst.2017.v2n1.03
- Salmones, D. (2017). *Pleurotus djamor*, un hongo con potencial aplicación biotecnológica para el neotrópico. *Scientia Fungorum, 46*, 73–85. https://doi.org/10.33885/sf.2017.46.1177
- ICAR-Directorate of Mushroom Research. (2020). *Growing Oyster Mushroom*. [guide_002]
- Chang, S.-T., & Miles, P. G. (2004). *Mushrooms: Cultivation, Nutritional Value, Medicinal Effect, and Environmental Impact* (2nd ed.), cap. 16. [Datos generales de Pleurotus]
- Stamets, P. (2005). *Mycelium Running*. [book_004; fuente secundaria para hipótesis ambientales]
