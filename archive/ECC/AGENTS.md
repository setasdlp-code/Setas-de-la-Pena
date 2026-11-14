# Agentes — Setas de la Peña

Definición de roles y responsabilidades para automatización de operaciones.

## 1. **monitoring-agent**
Monitorea datos de sensores en tiempo real y ejecuta alertas.

**Responsabilidades:**
- Leer datos de sensores (temperatura, humedad, CO₂, luz)
- Detectar anomalías (fuera de rango óptimo)
- Registrar en histórico
- Disparar acciones automáticas (ventilación, riego, alarma)

**Triggers:**
- Cada 5-15 minutos (configurable)
- En caso de fallo de sensor
- Cambios bruscos de parámetros

**Outputs:**
- Logs estructurados en `data/sensor_readings.jsonl`
- Alertas críticas a operador
- Decisiones automáticas ejecutadas

---

## 2. **growth-intelligence-agent**
Analiza datos históricos y predice cosechas.

**Responsabilidades:**
- Correlacionar sensores ↔ crecimiento de setas
- Aprender patrones (qué condiciones = mejor rendimiento)
- Predecir fecha de cosecha ±3 días
- Sugerir optimizaciones de condiciones

**Triggers:**
- Diariamente después de cierre de datos
- Antes de cada fase de plantación
- Cuando hay cambios en el proceso

**Outputs:**
- `data/growth_predictions.json` (fecha cosecha, confianza %)
- `data/optimization_suggestions.md` (recomendaciones)
- Métricas de accuracy de predicciones anteriores

---

## 3. **quality-control-agent**
Valida calidad post-cosecha.

**Responsabilidades:**
- Registrar peso, tamaño, defectos por lote
- Clasificar en categorías (premium, estándar, descarte)
- Generar reportes de calidad
- Identificar lotes problemáticos

**Triggers:**
- Al momento de cosecha
- Diariamente en empaque
- Cuando recibe reclamos

**Outputs:**
- `data/quality_logs.jsonl`
- `reports/quality_report_{date}.md`
- Alertas de lotes defectuosos

---

## 4. **cost-optimizer-agent**
Optimiza gastos operacionales.

**Responsabilidades:**
- Rastrear costos (energía, insumos, labor)
- Correlacionar con producción
- Identificar ineficiencias
- Sugerir reducciones de costo

**Triggers:**
- Semanalmente
- Fin de mes
- Cuando producción baja sin razón aparente

**Outputs:**
- `data/cost_analysis.json`
- `reports/monthly_cost_summary.md`
- Recomendaciones de ahorro

---

## 5. **orchestration-agent**
Coordina flujos de trabajo complejos.

**Responsabilidades:**
- Planificar y ejecutar ciclos de cultivo completos
- Coordinar múltiples tareas (plantación, cosecha, limpieza)
- Manejar paralización cuando hay problemas
- Registrar timeline completo

**Triggers:**
- Al iniciar nuevo ciclo
- Diariamente para tareas programadas
- En caso de problema crítico

**Outputs:**
- `data/workflow_log.jsonl`
- `reports/cycle_summary.md`
- Alertas de desvíos en timeline
