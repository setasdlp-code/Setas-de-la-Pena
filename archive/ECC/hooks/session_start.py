#!/usr/bin/env python3
"""
Hook: SessionStart
Ejecutado al iniciar una sesión de trabajo.
Inicializa monitoreo, carga contexto, prepara agentes.
"""

import json
import datetime
import os
from pathlib import Path

CONFIG_DIR = Path(__file__).parent.parent / "config"
DATA_DIR = Path(__file__).parent.parent / "data"


def load_thresholds():
    """Carga los umbrales óptimos de sensores."""
    with open(CONFIG_DIR / "thresholds.json") as f:
        return json.load(f)


def load_latest_cycle_data():
    """Carga datos del ciclo actual."""
    cycle_file = DATA_DIR / "current_cycle.json"
    if cycle_file.exists():
        with open(cycle_file) as f:
            return json.load(f)
    return None


def initialize_monitoring():
    """Prepara el contexto sin habilitar automatización no comisionada."""
    return {
        "session_start": datetime.datetime.now().isoformat(),
        "monitoring_active": False,
        "agents_planned": [
            "monitoring-agent",
            "growth-intelligence-agent",
            "quality-control-agent",
            "cost-optimizer-agent",
            "orchestration-agent"
        ],
        "skills_loaded": [
            "sensor-data-ingestion",
            "anomaly-detection",
            "action-trigger",
            "growth-pattern-learning",
            "harvest-date-predictor",
            "optimization-suggester",
            "cost-tracking",
            "workflow-scheduler"
        ]
    }


def main():
    """Ejecuta hook de inicio de sesión."""
    print("\n🍄 Setas de la Peña — Sistema de Decisiones Automáticas")
    print(f"⏰ Inicio de sesión: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Cargar configuración
    thresholds = load_thresholds()
    cycle_data = load_latest_cycle_data()
    monitoring = initialize_monitoring()

    # Mostrar estado
    print("📊 Estado del Sistema:")
    print(f"  ✓ Agentes definidos: {len(monitoring['agents_planned'])}")
    print(f"  ✓ Skills: {len(monitoring['skills_loaded'])} cargados")

    if cycle_data:
        print(f"\n🌱 Ciclo Actual:")
        print(f"  Plantación: {cycle_data.get('planted_date', 'N/A')}")
        print(f"  Día del ciclo: {cycle_data.get('current_day', 'N/A')}")
        print(f"  Cosecha predicha: {cycle_data.get('predicted_harvest', 'N/A')}")

    # Rangos de sensores
    print(f"\n📈 Rangos Óptimos de Sensores:")
    print(f"  Temperatura: {thresholds['temperature']['optimal_min']}-{thresholds['temperature']['optimal_max']}°C")
    print(f"  Humedad: {thresholds['humidity']['optimal_min']}-{thresholds['humidity']['optimal_max']}%")
    print(f"  CO₂: {thresholds['co2']['optimal_min']}-{thresholds['co2']['optimal_max']} ppm")
    print(f"  Luz: {thresholds['light']['optimal_min']}-{thresholds['light']['optimal_max']} lux")

    print("\n⚠ Configuración cargada; automatización bloqueada hasta commissioning.\n")

    # Guardar estado
    session_state = {
        "session_start": monitoring['session_start'],
        "monitoring_active": False,
        "thresholds_loaded": True
    }

    with open(DATA_DIR / "session_state.json", "w") as f:
        json.dump(session_state, f, indent=2)


if __name__ == "__main__":
    main()
