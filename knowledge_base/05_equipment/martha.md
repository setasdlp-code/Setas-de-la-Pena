---
title: Martha Tent — Setup de Prototipo
document_id: DOC-0028
category: equipment
load_priority: selective
last_reviewed: 2026-07-24
confidence: medium
primary_sources:
  - Internal records
  - Terra Fungus product listing
related_documents:
  - environmental_control.md
  - ../04_facility/fruiting.md
  - ../04_facility/home_rnd_lab.md
  - ../CURRENT_OPERATIONS.md
---

# Executive Summary

La Terra Fungus Martha es la cámara de prototipado, I+D, cuarentena y respaldo. Su ubicación operacional registrada es Tenjo. La reserva espacial dibujada para la terraza de Bogotá no autoriza traslado; cualquier cambio de sede debe actualizar CURRENT_OPERATIONS.md y metadata/equipment.yaml.

La ficha anterior contenía dos errores de dimensionamiento: 160 × 60 × 155 cm no coincide con la ficha comercial encontrada y 149 L era aproximadamente un orden de magnitud menor que el volumen geométrico de esas medidas.

# Especificaciones

| Parámetro | Valor corregido | Estado |
|---|---|---|
| Marca / tipo | Terra Fungus Martha grow tent | Confirmado por inventario |
| Dimensiones comerciales | 27,5 × 19 × 65 in | Ficha comercial |
| Dimensiones métricas aproximadas | 69,9 × 48,3 × 165,1 cm | Conversión |
| Volumen anunciado | 20 ft³; aproximadamente 566 L | Ficha comercial |
| Volumen geométrico exterior | aproximadamente 558 L | Cálculo con dimensiones métricas |
| Huella de diseño | aproximadamente 0,70 × 0,48 m | Usar para anteproyecto |
| Altura de diseño | aproximadamente 1,65 m, más ductos y mantenimiento | Usar para anteproyecto |
| Verificación física | Pendiente | Medir carpa armada |

La ficha comercial puede cambiar y puede corresponder a una revisión del producto. Antes de fabricar cerramientos, medir la unidad armada incluyendo conectores, bandeja, puertas, ductos y holgura de servicio.

# Rol operativo

- Plataforma de pruebas de sensores, humidificación, extracción y mezcla interna.
- Cámara de I+D, cuarentena, especies especiales o respaldo.
- Módulo independiente de CloudLab 844.
- Fuente de datos para validar procedimientos antes de escalar.

No conectar su circuito de aire con CloudLab 844. Una falla o contaminación en una cámara no debe propagarse a la otra.

# Equipos registrados

| Equipo | Modelo | Estado |
|---|---|---|
| Humidificador | VIVOSUN H05 | Activo en modo manual |
| Sensor de respaldo | Inkbird IBS-TH2 Plus | Activo |
| Automatización | ESP32 / SHT3x / H4; sensor NDIR de CO₂ por aprobar | Comisionamiento pendiente |

# VIVOSUN H05

- La lectura integrada de HR está descartada por el sesgo registrado de +30 a +35 puntos porcentuales.
- Operar el H05 como actuador manual hasta validar el sensor principal.
- No usar su lectura para gobernar humedad ni registrar cumplimiento.
- Verificar agua, niebla, fugas y limpieza según la rutina aprobada.
- La banda de HR se define por cepa y lote; esta ficha no establece un objetivo universal.

# Rutina manual durante preproducción

1. Leer Inkbird y registrar temperatura y HR.
2. Observar superficie de bloques o masa de prueba, condensación y niebla.
3. Accionar el H05 manualmente solo dentro del protocolo de prueba aprobado.
4. Verificar agua, fugas, drenaje y estado del extractor.
5. Revisar contaminación visible sin abrir bloques.
6. Registrar hora, configuración y respuesta ambiental.

No automatizar histéresis, ciclos de extracción o umbrales de CO₂ heredados de Pleurotus.

# Posición de sensores

- SHT3x a altura representativa de los bloques, fuera del chorro directo de niebla.
- Sensor NDIR de CO₂ aprobado en protección adecuada y con entrada de muestreo libre.
- Inkbird como punto independiente de comparación.
- Mapear más de una altura durante comisionamiento.
- Validar respuesta con cámara vacía y con masa representativa.

# Plan de comisionamiento

1. Medir físicamente la carpa armada.
2. Registrar volumen efectivo después de estantes, bandejas y ductos.
3. Verificar SHT3x contra Inkbird.
4. Seleccionar, configurar y validar el sensor NDIR de CO₂ para la altitud de la sede donde opere; el SCD30 pedido anteriormente no fue entregado.
5. Medir caudal del extractor con ductos y restricciones reales.
6. Ejecutar prueba vacía y prueba con masa térmica/hídrica.
7. Evaluar recuperación tras apertura.
8. Aprobar setpoints y alarmas únicamente para la cepa y lote definidos.

# Uso en el plan de Bogotá

La carpa puede reservarse en planta con una huella de 0,70 × 0,48 m y altura de 1,65 m, añadiendo espacio de ductos y mantenimiento. Esta reserva no cambia su ubicación actual en Tenjo. Si se aprueba traslado o duplicación, la decisión debe actualizar inventario, sede, sensores asignados, compensación de altitud y rutas de extracción.

# References

- Terra Fungus product listing: https://www.amazon.com/Mushroom-Tent-Light-Monotub/dp/B0DY89RZQZ
- VIVOSUN H05 manual.
- Inkbird IBS-TH2 Plus documentation.
- environmental_control.md.
