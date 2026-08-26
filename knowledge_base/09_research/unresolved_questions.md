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

| # | Pregunta | Prioridad | Estado | Resolución / Hallazgo (Ago 2026) |
|---|---|---|---|---|
| QST-0001 | ¿BE real de paja local colombiana con P. djamor vs. paja importada? | Alta | Pendiente campo | Requiere medición en primeros 3 lotes |
| QST-0002 | ¿Temperatura mínima nocturna real del cuarto de incubación en Tenjo? | Alta | Pendiente campo | Monitoreo con sensores SHT45/Inkbird en curso |
| QST-0003 | ¿Sustrato alternativo regional al Master's Mix para H. erinaceus? | Media | **Resuelta** | Master's Mix Local (50% serrín + 50% cascarilla de arroz) en `substrate_library.md` |
| QST-0004 | ¿P. djamor y H. erinaceus pueden co-cultivarse en misma cámara? | Media | **Resuelta** | **Incompatible.** Brecha térmica (djamor 20-30°C vs hericium 16-22°C), esporulación masiva de pleurotus daña espinas de hericium. Requiere mínimo 2 cámaras separadas (`fruiting.md`). |
| QST-0005 | ¿Qué pin GPIO usar para relay en el ESP32 ACEIRMC específico comprado? | Alta | Pendiente banco | Verificar con multímetro al recibir |
| QST-0006 | ¿Cuántos ESP32 puede manejar Home Assistant en RPi4 sin degradar? | Baja | Estimado | 10–15 unidades sin saturar |
| QST-0007 | ¿Disponibilidad y precio de cascarilla de avena en Cundinamarca? | Media | **Resuelta** | Rara/escasa en Colombia. Sustituir por cascarilla de arroz ($18K–$20K COP / 10 kg). |
| QST-0008 | ¿Proveedor de spawn de P. djamor confiable en Colombia? | Alta | **Resuelta** | 6 proveedores verificados: Los Fungis Colombia, Setas de Siecha, Mutisania, Miceliolab, BioEspacio, Nutrisetas (`suppliers.md`). |
| QST-0009 | ¿All-American (autoclave) disponible local o importar? | Media | **Resuelta** | Importar directo vía Coordinadora USA (30–40% más económico). En Bogotá: CMLAB, Mercalab. Para volumen: steamers de acero inox artesanales ($2.5–4M COP en Ricaurte/7 de Agosto). |
| QST-0010 | ¿Disponibilidad de bolsas PP con filtro en Colombia? | Media | **Resuelta** | MiCelio Colombia, Caapi.co, Bosque Terra, Setas de Siecha ($1.500–$3.000 COP / unidad con parche 0.2/0.5 µm). |

## Preguntas Comerciales

| # | Pregunta | Prioridad | Estado | Resolución / Hallazgo (Ago 2026) |
|---|---|---|---|---|
| QST-0011 | ¿Qué restaurantes de Bogotá usan setas gourmet y requisitos? | Alta | **Resuelta** | El Chato, Leo, Salvo Patria, Prudencia, Criterión, Harry Sasson, Grupo Takami. Exigen cajas ventiladas 1–2 kg, entregas lun/jue 6–10 AM, cadena de frío 2–4°C, facturación electrónica y crédito 15–45 días (`suppliers.md`). |
| QST-0012 | ¿Precio real de spawn de P. djamor en Cundinamarca? | Alta | En contacto | Rango verificado: $12.000–$18.000 COP/kg según proveedor |
| QST-0013 | ¿Precio real de paja de trigo en Tenjo o municipios cercanos? | Alta | En cotización | Molino San Rafael / Agropecuarias Sabana |
| QST-0014 | ¿Tamaño de lote mínimo viable para clientes tipo restaurante? | Media | **Resuelta** | 2–5 kg semanales por restaurante formal (entregas de 1–2 kg por despacho). |
| QST-0015 | ¿Requisitos exactos INVIMA para setas frescas en Colombia? | Alta | **Resuelta** | **Exento de RSA INVIMA** (Art. 37 Res. 2674/2013 y Res. 719/2015). Requiere Registro de Predio Productor ante el **ICA** vía VUT (`regulatory_framework.md`). |
| QST-0016 | ¿Regulación INVIMA para claims medicinales y rotulado? | Media | **Resuelta** | Exento de sellos octagonales frontales (Res. 2492/2022). Claims funcionales/medicinales exigen Registro de Suplemento Dietario (Dec. 3249/2006) o Fitoterapéutico (`regulatory_framework.md`). |
| QST-0017 | ¿Existe comunidad de cultivadores de setas en Colombia? | Baja | Identificada | Grupos activos en Facebook ("Cultivo de Hongos Colombia") e Instagram (@losfungis, @mutisania). |
| QST-0018 | ¿Viabilidad de exportación de setas deshidratadas? | Baja | Largo plazo | Factible en Fase 3 tras certificación BPA/BPM y NSA. |

## Preguntas de Infraestructura

| # | Pregunta | Prioridad | Estado | Resolución / Hallazgo (Ago 2026) |
|---|---|---|---|---|
| QST-0019 | ¿Cotización y especificaciones de recinto PIR/PUR? | Alta | **Resuelta** | Metecno Colombia (CEDI Bogotá). Panel Frigowall 50mm para fructificación (15–18°C), 75–100mm para incubación/refrigeración. Junta machihembrada con sello silicona fungicida grado alimenticio. |
| QST-0020 | ¿Espacio físico disponible en Tenjo para recinto 2.5×2.5m? | Alta | Pendiente campo | Medición física en terraza/finca |
| QST-0021 | ¿Capacidad eléctrica en instalación Tenjo? | Alta | Pendiente campo | Revisar breaker principal (demanda ~1.5–2.0 kW máx) |
| QST-0022 | ¿Martha Tent sigue activa como segunda cámara post-CLOUDLAB? | Media | **Resuelta** | Sí, como cámara secundaria templada para pruebas de *P. ostreatus* o incubación auxiliar. |
| QST-0023 | ¿Timeline realista para laboratorio (LAF + autoclave)? | Media | Programada | Fase 2 (meses 4–6 tras validar primeros lotes con spawn comercial). |
| QST-0024 | ¿Sensor de fuga de agua necesario en zona electrónica? | Baja | Recomendado | Sensor de humedad de contacto en piso de caja TICONN. |

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
