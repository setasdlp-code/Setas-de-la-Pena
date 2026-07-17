# Skills — Setas de la Peña

Funcionalidades reutilizables ejecutadas por agentes.

## Monitoreo de Sensores

### `sensor-data-ingestion`
**Qué hace:** Lee datos de sensores y los normaliza.

**Entrada:** Raw data de API de sensores (JSON/CSV)

**Lógica:**
```
1. Validar formato y rango de datos
2. Detectar si sensor está offline
3. Normalizar a unidades estándar (°C, %, ppm, lux)
4. Guardar con timestamp
```

**Salida:** `data/sensor_readings.jsonl`

**Dependencias:** Conexión a API de sensores

---

### `anomaly-detection`
**Qué hace:** Identifica condiciones fuera de rango.

**Parámetros (configurables en `config/thresholds.json`):**
- Temperatura: 18-24°C (rango óptimo)
- Humedad: 80-95% (rango óptimo)
- CO₂: 800-1500 ppm
- Luz: 500-1000 lux

**Lógica:**
```
1. Comparar lectura actual vs. rango óptimo
2. Si fuera de rango → calcular duración del evento
3. Si duración > 15 min → ALERTA
4. Si duración > 1 hora → CRÍTICA
```

**Salida:** `data/alerts.jsonl` + logs

---

### `action-trigger`
**Qué hace:** Ejecuta acciones automáticas basadas en alertas.

**Mapa de acciones:**
```
SI temperatura < 18°C      → Activar calefacción
SI temperatura > 24°C      → Activar ventilación
SI humedad < 80%           → Activar humificación/riego
SI humedad > 95%           → Aumentar ventilación
SI CO₂ > 1500 ppm          → Aumentar intercambio de aire
SI luz < 500 lux           → Activar luz suplementaria
```

**Salida:** Logs de acciones ejecutadas + confirmación de sensor

---

## Inteligencia de Crecimiento

### `growth-pattern-learning`
**Qué hace:** Extrae correlaciones entre condiciones y crecimiento.

**Datos:** Histórico (sensores + cosecha anterior)

**Lógica:**
```
1. Agrupar lecturas por fase (día 1-5, 6-10, etc.)
2. Calcular promedio de cada parámetro por fase
3. Correlacionar con % de rendimiento (kg cosechados vs. esperado)
4. Identificar "receta óptima" (qué condiciones dieron mejor resultado)
```

**Salida:** `data/growth_patterns.json`

---

### `harvest-date-predictor`
**Qué hace:** Predice cuándo estarán listos los hongos.

**Entrada:** Fecha de plantación + datos de crecimiento

**Lógica:**
```
1. Comparar tasa de crecimiento con histórico
2. Si tasa = 100% → cosecha en ~10-12 días
3. Si tasa = 80%  → cosecha en ~13-15 días
4. Suavizar con promedio móvil de 3 ciclos previos
```

**Salida:** `data/predictions.json`
```json
{
  "cycle": "2026-06-11",
  "planted": "2026-06-01",
  "predicted_harvest": "2026-06-13",
  "confidence": 0.85,
  "range": "2026-06-12 a 2026-06-14"
}
```

---

### `optimization-suggester`
**Qué hace:** Propone mejoras basadas en datos históricos.

**Análisis:**
```
1. Comparar ciclo actual vs. mejores 3 ciclos históricos
2. Identificar parámetros donde estamos bajo
3. Sugerir ajustes pequeños (±0.5°C, ±5%, etc.)
4. Estimar impacto esperado en rendimiento
```

**Salida:** `reports/weekly_optimization.md`

---

## Control de Calidad

### `harvest-inspection`
**Qué hace:** Registra calidad de cosecha en tiempo real.

**Datos capturados:**
- Fecha/hora de cosecha
- Peso total lote
- Tamaño promedio
- % defectos (moho, magulladuras, enfermedad)
- Clasificación: Premium / Estándar / Descarte

**Lógica:**
```
SI % defectos < 5%      → Premium (precio máximo)
SI % defectos 5-15%     → Estándar (precio normal)
SI % defectos > 15%     → Descarte (compost/análisis)
```

**Salida:** `data/quality_logs.jsonl`

---

### `defect-root-cause`
**Qué hace:** Identifica por qué un lote tuvo baja calidad.

**Análisis:**
```
1. Revisar sensores durante crecimiento de ese lote
2. Detectar picos/valles anormales
3. Correlacionar con defectos observados
4. Registrar causa probable (temperatura, humedad, luz, etc.)
```

**Salida:** `reports/defect_analysis_{date}.md`

---

## Optimización de Costos

### `cost-tracking`
**Qué hace:** Registra todos los gastos operacionales.

**Categorías:**
- Energía (electricidad en kWh)
- Insumos (sustrato, simiente, nutrientes)
- Labor (horas trabajadas)
- Mantenimiento (reparaciones, reemplazos)
- Otros

**Entrada:** Facturas + horas laborales (entrada manual o API)

**Salida:** `data/expenses.jsonl`

---

### `efficiency-ratio`
**Qué hace:** Calcula costo por kg producido.

**Fórmula:**
```
Costo/kg = Gastos totales mes / kg cosechados mes
```

**Histórico:** Comparar mes vs. mes anterior

**Salida:** `reports/efficiency_dashboard.json`

---

### `energy-optimizer`
**Qué hace:** Reduce consumo eléctrico sin afectar rendimiento.

**Análisis:**
```
1. Revisar patrón de consumo (kWh por día)
2. Detectar períodos con sobrecarga (ej: calefacción innecesaria)
3. Proponer cambios (ej: encender luces suplementarias solo 8h/día)
4. Estimar ahorro (€/mes)
```

**Salida:** `reports/energy_savings.md`

---

## Orquestación

### `workflow-scheduler`
**Qué hace:** Planifica tareas del ciclo.

**Tareas típicas:**
```
Día 0: Preparar sustrato
Día 1: Plantación
Día 5: Primer riego
Día 8: Cosecha lote 1 (si hay)
Día 10: Cosecha lote 2
Día 11: Limpieza y reinicio
```

**Entrada:** Configuración en `config/workflow_template.json`

**Salida:** `data/schedule.jsonl` (tareas programadas)

---

### `parallel-task-executor`
**Qué hace:** Ejecuta múltiples acciones simultáneamente sin conflictos.

**Ejemplo:**
```
- Ventilación en túnel 1
- Riego en túnel 2
- Cosecha en túnel 3
(Sin interferencias)
```

**Salida:** Logs de ejecución con timestamps

---

### `failure-recovery`
**Qué hace:** Recupera si un sensor falla o una acción no se ejecuta.

**Lógica:**
```
1. Detectar acción fallida (timeout)
2. Reintentar hasta 3 veces
3. Si persiste → alertar operador humano
4. Loguear para análisis posterior
```

**Salida:** `data/failures.jsonl`

---

## Reportes & Análisis

### `daily-summary`
**Qué hace:** Resume el día en 1 página.

**Contiene:**
- Lecturas promedio de sensores
- Alertas del día
- Acciones ejecutadas
- Estado de cada túnel/cama
- Predicción de cosecha

**Salida:** `reports/daily_{date}.md`

**Frecuencia:** 23:00 cada día

---

### `cycle-analytics`
**Qué hace:** Análisis completo del ciclo al terminar.

**Métricas:**
- Kg producidos
- Costo/kg
- Calidad (% premium)
- Eficiencia energética
- Comparación con ciclos anteriores
- Lecciones aprendidas

**Salida:** `reports/cycle_report_{date}.md`

---

## Dashboard en Vivo

### `metrics-dashboard`
**Qué hace:** Actualiza estado actual en JSON (para UI futura).

**Datos:**
```json
{
  "timestamp": "2026-06-11T14:30:00Z",
  "sensors": {
    "temperature": 21.5,
    "humidity": 87,
    "co2": 1200,
    "light": 750
  },
  "alerts": ["none"],
  "current_phase": "growth_days_5-8",
  "predicted_harvest": "2026-06-13",
  "cost_today": 12.5,
  "actions_executed": ["ventilation_on"]
}
```

**Actualización:** Cada 5 minutos

**Salida:** `data/dashboard_live.json`
