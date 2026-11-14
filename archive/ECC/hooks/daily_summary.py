#!/usr/bin/env python3
"""
Hook: DailySummary
Ejecutado cada noche (23:00) para generar resumen del día.
Agrega datos, detecta patrones, sugiere acciones.
"""

import json
import datetime
from pathlib import Path
from statistics import mean, stdev
from collections import defaultdict

DATA_DIR = Path(__file__).parent.parent / "data"
REPORTS_DIR = Path(__file__).parent.parent / "reports"


def load_sensor_readings(hours=24):
    """Carga lecturas del sensor del último período."""
    readings_file = DATA_DIR / "sensor_readings.jsonl"
    readings = []

    if readings_file.exists():
        cutoff_time = datetime.datetime.now() - datetime.timedelta(hours=hours)
        with open(readings_file) as f:
            for line in f:
                try:
                    data = json.loads(line)
                    ts = datetime.datetime.fromisoformat(data.get("timestamp", ""))
                    if ts >= cutoff_time:
                        readings.append(data)
                except:
                    pass

    return readings


def load_alerts(hours=24):
    """Carga alertas del día."""
    alerts_file = DATA_DIR / "alerts.jsonl"
    alerts = []

    if alerts_file.exists():
        cutoff_time = datetime.datetime.now() - datetime.timedelta(hours=hours)
        with open(alerts_file) as f:
            for line in f:
                try:
                    data = json.loads(line)
                    ts = datetime.datetime.fromisoformat(data.get("timestamp", ""))
                    if ts >= cutoff_time:
                        alerts.append(data)
                except:
                    pass

    return alerts


def calculate_statistics(readings):
    """Calcula promedios y desviaciones."""
    if not readings:
        return {}

    by_parameter = defaultdict(list)
    for reading in readings:
        for param in ["temperature", "humidity", "co2", "light"]:
            if param in reading:
                by_parameter[param].append(reading[param])

    stats = {}
    for param, values in by_parameter.items():
        if values:
            stats[param] = {
                "average": round(mean(values), 2),
                "min": round(min(values), 2),
                "max": round(max(values), 2),
                "readings_count": len(values)
            }

    return stats


def generate_markdown_report(stats, alerts, current_cycle):
    """Genera reporte en Markdown."""
    today = datetime.date.today().strftime("%Y-%m-%d")

    markdown = f"""# Resumen Diario — {today}

## 📊 Estadísticas de Sensores

| Parámetro | Promedio | Mín | Máx | Lecturas |
|-----------|----------|-----|-----|----------|"""

    for param, data in stats.items():
        if data:
            markdown += f"\n| {param.capitalize()} | {data['average']} | {data['min']} | {data['max']} | {data['readings_count']} |"

    markdown += f"""

## ⚠️ Alertas ({len(alerts)} total)

"""
    if alerts:
        for alert in alerts[-10:]:  # Últimas 10 alertas
            severity = alert.get("severity", "warning").upper()
            param = alert.get("parameter", "unknown")
            value = alert.get("value", "N/A")
            markdown += f"- **[{severity}]** {param} = {value} en {alert.get('timestamp', 'N/A')}\n"
    else:
        markdown += "✅ Sin alertas críticas.\n"

    markdown += f"""

## 🌱 Ciclo Actual

"""
    if current_cycle:
        markdown += f"- **Plantación:** {current_cycle.get('planted_date', 'N/A')}\n"
        markdown += f"- **Día del ciclo:** {current_cycle.get('current_day', 'N/A')}\n"
        markdown += f"- **Cosecha predicha:** {current_cycle.get('predicted_harvest', 'N/A')}\n"
        markdown += f"- **Confianza:** {current_cycle.get('prediction_confidence', 'N/A')}%\n"

    markdown += f"""

## 💡 Recomendaciones

- Revisar alertas críticas antes de mañana
- Continuar monitoreo automático activado
- Próximo resumen: {(datetime.datetime.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%d 23:00')}

---
*Generado automáticamente por Setas de la Peña — ECC System*
"""

    return markdown


def main():
    """Ejecuta hook de resumen diario."""
    print("\n📝 Generando resumen diario...\n")

    # Cargar datos
    readings = load_sensor_readings(hours=24)
    alerts = load_alerts(hours=24)

    # Cargar ciclo actual
    cycle_file = DATA_DIR / "current_cycle.json"
    current_cycle = None
    if cycle_file.exists():
        with open(cycle_file) as f:
            current_cycle = json.load(f)

    # Calcular estadísticas
    stats = calculate_statistics(readings)

    # Generar reporte
    report_markdown = generate_markdown_report(stats, alerts, current_cycle)

    # Guardar reporte
    REPORTS_DIR.mkdir(exist_ok=True)
    report_file = REPORTS_DIR / f"daily_{datetime.date.today().isoformat()}.md"
    with open(report_file, "w") as f:
        f.write(report_markdown)

    print(f"✅ Reporte generado: {report_file}")
    print(f"📊 Lecturas procesadas: {len(readings)}")
    print(f"⚠️ Alertas registradas: {len(alerts)}")
    print()


if __name__ == "__main__":
    main()
