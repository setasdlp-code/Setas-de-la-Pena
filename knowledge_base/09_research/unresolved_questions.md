---
title: Preguntas Abiertas y Áreas de Investigación
category: research
load_priority: on_request
last_reviewed: 2026-07-16
confidence: high
primary_sources:
  - Internal records
related_documents:
  - literature_database.md
  - 01_species/pleurotus_djamor.md
  - 07_business/colombian_market.md
  - 00_project/current_state.md
---

# Executive Summary
Registro de preguntas técnicas, comerciales y operacionales que no tienen respuesta definitiva actualmente. Se resuelven mediante investigación activa, datos de campo o consulta a expertos.

# Technical Details

## Preguntas Técnicas — Cultivo

| # | Pregunta | Prioridad | Estado |
|---|---|---|---|
| QST-0001 | ¿BE real de paja local colombiana con P. djamor vs. paja importada? | Alta | Pendiente dato de campo |
| QST-0002 | ¿Temperatura mínima nocturna real del cuarto de incubación en Tenjo? | Alta | Requiere medición con sensores |
| QST-0003 | ¿Sustrato alternativo regional al Master's Mix para H. erinaceus en Colombia? | Media | Investigación pendiente |
| QST-0004 | ¿P. djamor y H. erinaceus pueden co-cultivarse en misma cámara? (CO₂ incompatible) | Media | Análisis técnico pendiente |
| QST-0005 | ¿Qué pin GPIO usar para relay en el ESP32 ACEIRMC específico comprado? | Alta | Verificar con multímetro al recibir |
| QST-0006 | ¿Cuántos ESP32 puede manejar Home Assistant en RPi4 sin degradar performance? | Baja | Estimado: 10–15; verificar en campo |
| QST-0007 | ¿Disponibilidad y precio de cascarilla de avena (oat husks) en Cundinamarca? | Media | Investigar proveedores |
| QST-0008 | ¿Proveedor de spawn de P. djamor confiable en Colombia? | Alta | **Investigar urgente antes del primer lote** |
| QST-0009 | ¿All-American 921 (autoclave) disponible en Colombia o requiere importar? | Media | Investigar |
| QST-0010 | ¿Disponibilidad de bolsas PP para autoclave en Colombia? | Media | Investigar proveedores Bogotá |

## Preguntas Comerciales

| # | Pregunta | Prioridad | Estado |
|---|---|---|---|
| QST-0011 | ¿Qué restaurantes de Bogotá usan setas gourmet y quién se las provee? | Alta | Investigación de mercado pendiente |
| QST-0012 | ¿Precio real de spawn de P. djamor en Cundinamarca? | Alta | Pendiente contacto proveedores |
| QST-0013 | ¿Precio real de paja de trigo en Tenjo o municipios cercanos? | Alta | Pendiente cotización |
| QST-0014 | ¿Tamaño de lote mínimo viable para clientes tipo restaurante? | Media | Análisis con primer cliente |
| QST-0015 | ¿Requisitos exactos INVIMA para comercialización de hongos frescos en Colombia? | Alta | Consultar INVIMA o abogado |
| QST-0016 | ¿Regulación INVIMA para claims medicinales de H. erinaceus y G. lucidum? | Media | Fase 2 — consultar antes de lanzar |
| QST-0017 | ¿Existe comunidad de cultivadores de setas en Colombia para asociarse? | Baja | Explorar grupos Facebook/Instagram |
| QST-0018 | ¿Viabilidad de exportación de setas deshidratadas desde Colombia? | Baja | Largo plazo |

## Preguntas de Infraestructura

| # | Pregunta | Prioridad | Estado |
|---|---|---|---|
| QST-0019 | ¿Cotización y lead time de recinto PIR/PUR FrigoMaster? | Alta | Pendiente contacto |
| QST-0020 | ¿Espacio físico disponible en Tenjo para recinto 2.5×2.5m? | Alta | Verificar con cuidador |
| QST-0021 | ¿Capacidad eléctrica en instalación Tenjo para CLOUDLAB + automatización? | Alta | Verificar antes de instalar |
| QST-0022 | ¿Martha Tent sigue activa como segunda cámara post-CLOUDLAB? | Media | Decisión pendiente |
| QST-0023 | ¿Timeline realista para laboratorio (LAF + autoclave)? | Media | Planificar para Fase 2 |
| QST-0024 | ¿Sensor de fuga de agua necesario en zona electrónica? | Baja | Evaluar en banco de pruebas |

## Preguntas Biológicas Abiertas en Literatura

| # | Pregunta | Estado en Literatura |
|---|---|---|
| QST-0025 | ¿Efecto exacto de altitud (2600m) en tasa de colonización de P. djamor? | Sin datos publicados para esta altitud |
| QST-0026 | ¿Adaptación de cepas tropicales de P. djamor a temperaturas más frías? | Literatura limitada |
| QST-0027 | ¿BE de P. djamor con sustratos de bagazo de caña colombiano? | Sin estudios con variedades locales |
| QST-0028 | ¿SCD30 requiere ajuste adicional más allá de `altitude_compensation: 2600`? | Pendiente banco de pruebas |

## Método de Resolución

Para cada pregunta abierta, la resolución pasa por una de estas vías:
1. **Dato de campo:** medir y registrar en primeros lotes de producción.
2. **Investigación activa:** buscar paper, contactar proveedor, consultar experto.
3. **Experimento controlado:** diseñar prueba específica (ej. comparar dos sustratos en mismo batch).
4. **Consulta externa:** INVIMA, agronómo, abogado, comunidad cultivadores.

# Best Practices
- Actualizar este documento cuando se resuelva una pregunta — mover a documento correspondiente.
- Priorizar QST-0008 (spawn) y QST-0013 (paja) antes del primer lote — son bloqueantes.
- Asignar responsable y fecha para cada pregunta de alta prioridad.

# References
- Internal records Setas de la Peña.
