#!/usr/bin/env python3
"""
MCP Server — Setas de la Peña
Expone conocimiento operacional del cultivo (parámetros, sensores, inventario, documentos)
a Claude y ChatGPT vía stdio transport (local Mac).
"""

import json
import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("setas_mcp")

# ---------------------------------------------------------------------------
# ENUMS
# ---------------------------------------------------------------------------

class ResponseFormat(str, Enum):
    MARKDOWN = "markdown"
    JSON = "json"

class Especie(str, Enum):
    DJAMOR = "p_djamor"
    LIONS_MANE = "h_erinaceus"
    SHIITAKE = "lentinula_edodes"
    OYSTER = "p_ostreatus"
    ALL = "all"

class Fase(str, Enum):
    INCUBACION = "incubacion"
    FRUITING = "fruiting"
    ALL = "all"

# ---------------------------------------------------------------------------
# KNOWLEDGE BASE — embedded from project memory
# ---------------------------------------------------------------------------

PARAMETROS_DB = {
    "p_djamor": {
        "nombre_comun": "Pink Oyster / Orellana Rosada",
        "incubacion": {"temp_c": "24–28", "hr_pct": 70},
        "fruiting": {
            "temp_c": "20–30",
            "hr_pct": "85–90",
            "co2_ppm": "500–1500",
            "fae_ach_provisional": "5–8; requiere commissioning",
            "fae_ciclo": "Sin ciclo fijo validado; control primario por CO₂",
            "luz_lux": "750–1500",
            "luz_horas_dia": "3–5",
            "ciclo_dias": "7–10",
        },
        "notas": [
            "Rango provisional de CO₂ 500–1500 ppm; alarma operacional >2000 ppm.",
            "Calcular ACH con caudal efectivo, duty cycle y volumen; el timer no demuestra cambios de aire.",
            "Crecimiento rápido; primera especie recomendada para producción en Tenjo.",
            "Indicador visual OK: tiny droplets en paredes que evaporan antes de gotear.",
        ],
        "fuentes": ["guide_002 (ICAR-DMR 2020)", "guide_003 (ICAR-DMR)", "book_007"],
    },
    "h_erinaceus": {
        "nombre_comun": "Lion's Mane / Melena de León",
        "incubacion": {"temp_c": "20–24", "hr_pct": 70},
        "fruiting": {
            "temp_c": "16–24",
            "hr_pct": "85–90",
            "co2_ppm": "<1000",
            "fae_por_hora": "Alta — 'stringy growth' si insuficiente",
            "luz_lux": "750+",
            "ciclo_dias": "14–21",
        },
        "notas": [
            "Interacción T°+HR SIGNIFICATIVAMENTE más crítica que otras especies.",
            "Ventanas óptimas extremadamente estrechas — difícil comercialmente.",
            "CO₂ <1000 ppm estricto; monitoreo obsesivo requerido.",
            "Dew point en caps es el indicador real, no solo HR%.",
        ],
        "fuentes": ["Mushroom Media Online", "Colorado Cultures LLC"],
    },
    "lentinula_edodes": {
        "nombre_comun": "Shiitake",
        "incubacion": {"temp_c": "20–24", "hr_pct": 70},
        "fruiting": {
            "temp_c": "10–16",
            "hr_pct": "85–95",
            "co2_ppm": "<1000",
            "fae_por_hora": "Moderada",
        },
        "notas": [
            "NO tropical — requiere T° baja para fructificar.",
            "Tenjo (~14–18°C ambiente) puede ser apto en invierno.",
            "CO₂ <1000 ppm.",
        ],
        "fuentes": ["Cornell Mushroom Blog", "Field & Forest"],
    },
    "p_ostreatus": {
        "nombre_comun": "Oyster / Orellana",
        "incubacion": {"temp_c": "20–24", "hr_pct": 70},
        "fruiting": {
            "temp_c": "13–24",
            "hr_pct": "85–95",
            "co2_ppm": "400–1000",
            "fae_por_hora": "4–6",
        },
        "notas": [
            "Especie más versátil; buen punto de partida para validar el setup.",
            "CO₂ más sensible que djamor.",
        ],
        "fuentes": ["Cornell", "NAMA"],
    },
}

INVENTARIO_DB = {
    "produccion": [
        {
            "id": "ENV-0001",
            "equipo": "Cámara principal",
            "modelo": "AC Infinity CLOUDLAB 844 (4×4×6.5ft, 2000D)",
            "order_reference": "stored_outside_git",
            "llegada_estimada": "2026-07-06",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "pedido al 2026-06-29",
        },
        {
            "id": "EQ-0001",
            "equipo": "Humidificador principal",
            "modelo": "AC Infinity CloudForge T7 (15L, VPD)",
            "order_reference": "stored_outside_git",
            "llegada_estimada": "2026-06-28",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "pedido al 2026-06-29",
        },
        {
            "ids": ["SNS-0001", "SNS-0002"],
            "equipo": "Sondas T/HR",
            "modelo": "AC Infinity SHT3x 20ft (×2)",
            "order_reference": "stored_outside_git",
            "llegada_estimada": "2026-06-28",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "pedido al 2026-06-29",
        },
        {
            "ids": ["EQ-0005", "EQ-0006", "EQ-0007"],
            "equipo": "Microcontroladores",
            "modelo": "ESP32-WROOM-32 USB-C ACEIRMC (×3)",
            "order_reference": "stored_outside_git",
            "llegada_estimada": "2026-06-28",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "pedido al 2026-06-29",
        },
        {
            "ids": ["SNS-0003", "SNS-0004"],
            "equipo": "Sensores CO₂",
            "modelo": "Sensirion SCD30 (×2)",
            "order_reference": "stored_outside_git",
            "llegada_estimada": "2026-06-28",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "pedido al 2026-06-29",
        },
        {
            "ids": ["EQ-0008", "EQ-0009"],
            "equipo": "Cajas electrónica",
            "modelo": "TICONN IP67 (×2)",
            "order_reference": "stored_outside_git",
            "llegada_estimada": "2026-06-28",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "pedido al 2026-06-29",
        },
        {
            "ids": ["EQ-0003", "EQ-0004"],
            "equipo": "Extractores",
            "modelo": "AC Infinity Cloudline H4 4\" IP65 (×2)",
            "order_reference": "stored_outside_git",
            "llegada_estimada": "2026-07-03 a 2026-07-18",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "pedido al 2026-06-29",
        },
    ],
    "prototipado": [
        {
            "id": "ENV-0002",
            "equipo": "Martha Tent",
            "modelo": "Terra Fungus 63\" (luces integradas)",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "activo al 2026-06-29",
        },
        {
            "id": "EQ-0002",
            "equipo": "Humidificador prototipo",
            "modelo": "VIVOSUN AeroStream H05",
            "estado": "verificacion_requerida — sensor integrado DESCARTADO; confirmar modo manual",
            "ultimo_estado_confirmado": "activo manual al 2026-06-29",
        },
        {
            "ids": ["SNS-0005", "SNS-0006"],
            "equipo": "Sensores referencia T/HR",
            "modelo": "Inkbird IBS-TH2 Plus (×2, BLE)",
            "estado": "verificacion_requerida",
            "ultimo_estado_confirmado": "funcionales al 2026-06-29",
        },
    ],
    "electronica": [
        "2× Mean Well LRS-50-12 (12VDC 4.2A 50W)",
        "WAGO 221 kit 28 pcs",
        "Prensaestopas IP68 kit 48 pcs",
        "2× GDSTIME 80×25mm IP68 12V (ventilación cajas)",
        "Módulos relé 2ch ×6 (optoacoplador 5V)",
        "Portafusibles 12AWG impermeables ×6",
    ],
    "pendiente_comprar": [
        "Fusibles ATC/ATO (1A, 2A, 3A) — surtido",
        "Recinto PIR/PUR ~2.5×2.5×2.2m — cotizar FrigoMaster",
        "Calefactor cerámico PTC para recinto",
    ],
    "consumibles": {
        "bolsas": [
            "20× sin filtro 20×50cm (batches grandes producción)",
            "30× con filtro 18×35cm 0.06mm (entrenamiento y control contaminación)",
        ],
        "spawn_pendiente_costificacion": [
            "P. djamor: ~50–100k COP (10 bolsas)",
            "Shiitake: ~150–200k COP",
            "Orellanas blanca/café: ~100–150k COP",
        ],
    },
    "costo_total_produccion_usd": 869.69,
}

AUTOMATIZACION_DB = {
    "arquitectura": {
        "control_local": "ESP32-WROOM-32 por Martha Tent (autónomo aunque HA/red fallen)",
        "supervision": "Home Assistant en Raspberry Pi 4",
        "firmware": "ESPHome",
        "filosofia": "Cada carpa funciona de forma autónoma; HA es supervisión, no control crítico.",
    },
    "sensores": {
        "t_hr_preferido": {
            "modelo": "AC Infinity SHT3x",
            "chip": "Sensirion SHT3x",
            "esphome_component": "sht3xd",
            "i2c_address": "0x44",
            "notas": "Verificar pinout con multímetro antes de instalar. Sin pull-ups externos inicialmente.",
        },
        "t_hr_redundancia": "Inkbird IBS-TH2 Plus (BLE, verificación cruzada independiente)",
        "co2": {
            "modelo": "Sensirion SCD30",
            "nota_altitud": "Compensar altitud Tenjo (~2600 m s.n.m.) en ESPHome",
        },
        "descartados": [
            "VIVOSUN H05 sensor integrado (sesgo HR +30–35%)",
            "Breakouts SHT31/SHT45 expuestos",
            "Sondas DAUERHAFT genéricas",
        ],
    },
    "actuadores": {
        "extractor": "AC Infinity Cloudline H4 (4\", IP65)",
        "humidificador": "AC Infinity CloudForge T7 (15L, VPD)",
        "calefaccion": "Calefactor cerámico PTC ambiental (heat mat descartado)",
    },
    "proteccion_fisica": {
        "electronica": "Toda fuera de la carpa (TICONN IP67)",
        "dentro_carpa": "Solo sondas T/HR, SCD30, ventiladores, actuadores",
        "grado_proteccion": "IP65+ para equipos dentro; IP67 para cajas electrónica",
    },
    "ventilacion": {
        "posicion_exhaust": "Arriba (techo) — CO₂ pesado sube entre sustratos",
        "balance": "Exhaust ~90% del intake → presión ligeramente positiva",
        "cloudlab_volume": "101.7 ft3 / 2.88 m3 (120×120×200 cm)",
        "effective_cfm_for_5_8_ach": "8.5–13.6 CFM medios",
        "formula": "ACH = caudal_efectivo_CFM × duty_cycle × 60 / volumen_ft3",
        "h4_nota": "Máximo nominal 212 CFM; medir caudal instalado con ductos/filtros/compuertas",
        "control": "CO₂ primario; línea base y failsafe después de commissioning",
    },
    "estado_actual": {
        "verificacion": "Estado físico y configuración actual no confirmados al 2026-07-16",
        "sensor_hr": "Verificación de campo requerida",
        "banco_pruebas": "Verificar si se completó ESP32 + SHT3x + SCD30 + relay",
        "fae_control": "No declarar operativo hasta medir caudal y validar control por CO₂",
    },
    "plan_validacion": [
        "1. Armar banco pruebas: 1× ESP32 + 1× sonda SHT3x + 1× SCD30 + 1× relé",
        "2. Ejecutar escáner I²C, confirmar address 0x44",
        "3. Integrar ESPHome + Home Assistant",
        "4. Operar varios días continuos",
        "5. Validar: estabilidad I²C, deriva sensores, comportamiento >85% HR",
        "6. Solo replicar a producción tras validación exitosa",
    ],
}

# ---------------------------------------------------------------------------
# SHARED UTILITIES
# ---------------------------------------------------------------------------

def _fmt(data: dict | list, fmt: ResponseFormat, title: str = "") -> str:
    if fmt == ResponseFormat.JSON:
        return json.dumps(data, ensure_ascii=False, indent=2)
    # Markdown: simple recursive render
    lines = [f"# {title}", ""] if title else []
    lines.append(_to_md(data))
    return "\n".join(lines)

def _to_md(obj, indent: int = 0) -> str:
    pad = "  " * indent
    if isinstance(obj, dict):
        lines = []
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                lines.append(f"{pad}**{k}:**")
                lines.append(_to_md(v, indent + 1))
            else:
                lines.append(f"{pad}**{k}:** {v}")
        return "\n".join(lines)
    elif isinstance(obj, list):
        return "\n".join(f"{pad}- {_to_md(i, indent) if isinstance(i, (dict, list)) else i}" for i in obj)
    else:
        return str(obj)

# ---------------------------------------------------------------------------
# TOOLS — CULTIVO PARAMS
# ---------------------------------------------------------------------------

class GetParametrosInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    especie: Especie = Field(default=Especie.ALL, description="Especie a consultar. 'all' retorna todas.")
    fase: Fase = Field(default=Fase.ALL, description="'incubacion', 'fruiting', o 'all'.")
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

@mcp.tool(
    name="setas_get_parametros",
    annotations={
        "title": "Parámetros de Cultivo por Especie",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_get_parametros(params: GetParametrosInput) -> str:
    """Retorna parámetros validados de cultivo (T°, HR, CO₂, FAE, luz) por especie y fase.

    Cubre P. djamor, H. erinaceus, L. edodes, P. ostreatus.
    Incluye notas críticas operacionales y fuentes de validación.

    Args:
        params (GetParametrosInput):
            - especie: 'p_djamor' | 'h_erinaceus' | 'lentinula_edodes' | 'p_ostreatus' | 'all'
            - fase: 'incubacion' | 'fruiting' | 'all'
            - response_format: 'markdown' | 'json'

    Returns:
        str: Parámetros formateados según response_format.
    """
    if params.especie == Especie.ALL:
        especies = PARAMETROS_DB
    else:
        key = params.especie.value
        if key not in PARAMETROS_DB:
            return f"Error: especie '{key}' no encontrada. Opciones: {list(PARAMETROS_DB.keys())}"
        especies = {key: PARAMETROS_DB[key]}

    result = {}
    for key, data in especies.items():
        entry = {"nombre_comun": data["nombre_comun"], "notas": data["notas"], "fuentes": data["fuentes"]}
        if params.fase in (Fase.ALL, Fase.INCUBACION):
            entry["incubacion"] = data.get("incubacion", {})
        if params.fase in (Fase.ALL, Fase.FRUITING):
            entry["fruiting"] = data.get("fruiting", {})
        result[key] = entry

    titulo = f"Parámetros de Cultivo — {params.especie.value} / {params.fase.value}"
    return _fmt(result, params.response_format, titulo)


class GetFAEInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    especie: Especie = Field(default=Especie.DJAMOR)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

@mcp.tool(
    name="setas_get_fae",
    annotations={
        "title": "Protocolo FAE por Especie",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_get_fae(params: GetFAEInput) -> str:
    """Retorna el protocolo de Fresh Air Exchange (FAE) para la especie indicada.

    Incluye objetivo ACH provisional, estado de commissioning, advertencias y
    parámetros de ventilación de la carpa.

    Args:
        params (GetFAEInput):
            - especie: especie a consultar (default: p_djamor)
            - response_format: 'markdown' | 'json'

    Returns:
        str: Protocolo FAE + datos de ventilación de la carpa.
    """
    key = params.especie.value
    if key not in PARAMETROS_DB:
        return f"Error: especie '{key}' no encontrada."

    esp = PARAMETROS_DB[key]
    fruiting = esp.get("fruiting", {})

    fae_data = {
        "especie": esp["nombre_comun"],
        "fae_ach_provisional": fruiting.get("fae_ach_provisional", fruiting.get("fae_por_hora", "No especificado")),
        "ciclo_recomendado": fruiting.get("fae_ciclo", "Ver notas"),
        "co2_umbral_ppm": fruiting.get("co2_ppm", "No especificado"),
        "ventilacion_carpa": AUTOMATIZACION_DB["ventilacion"],
        "advertencias": [n for n in esp["notas"] if "FAE" in n or "timer" in n or "ventilac" in n.lower() or "ACH" in n],
    }

    return _fmt(fae_data, params.response_format, f"Protocolo FAE — {esp['nombre_comun']}")


# ---------------------------------------------------------------------------
# TOOLS — SENSOR / AUTOMATIZACIÓN
# ---------------------------------------------------------------------------

class GetAutomatizacionInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    seccion: str = Field(
        default="all",
        description="Sección: 'arquitectura' | 'sensores' | 'actuadores' | 'ventilacion' | 'estado_actual' | 'plan_validacion' | 'all'",
    )
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

SECCIONES_VALIDAS = {"arquitectura", "sensores", "actuadores", "proteccion_fisica", "ventilacion", "estado_actual", "plan_validacion", "all"}

@mcp.tool(
    name="setas_get_automatizacion",
    annotations={
        "title": "Estado y Arquitectura de Automatización",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_get_automatizacion(params: GetAutomatizacionInput) -> str:
    """Retorna el estado y arquitectura del sistema de automatización ESP32/ESPHome/HA.

    Cubre: arquitectura general, sensores (SHT3x, SCD30, Inkbird), actuadores,
    protección física IP65/IP67, ventilación, estado operacional actual y
    plan de validación del banco de pruebas.

    Args:
        params (GetAutomatizacionInput):
            - seccion: sección específica o 'all'
            - response_format: 'markdown' | 'json'

    Returns:
        str: Datos de automatización formateados.
    """
    if params.seccion not in SECCIONES_VALIDAS:
        return f"Error: sección '{params.seccion}' no válida. Opciones: {sorted(SECCIONES_VALIDAS)}"

    if params.seccion == "all":
        data = AUTOMATIZACION_DB
    else:
        data = AUTOMATIZACION_DB.get(params.seccion, {})

    return _fmt(data, params.response_format, f"Automatización — {params.seccion}")


class GetSensoresInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

@mcp.tool(
    name="setas_get_sensores",
    annotations={
        "title": "Estado Documental de Sensores",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_get_sensores(params: GetSensoresInput) -> str:
    """Retorna el estado documental de los sensores previstos.

    Incluye sensores previstos, descartados, advertencias de calibración
    y configuración recomendada por sensor.

    Args:
        params (GetSensoresInput):
            - response_format: 'markdown' | 'json'

    Returns:
        str: Estado de sensores con notas operacionales críticas.
    """
    data = {
        "sensores_previstos": {
            "t_hr_produccion": AUTOMATIZACION_DB["sensores"]["t_hr_preferido"],
            "t_hr_redundancia": AUTOMATIZACION_DB["sensores"]["t_hr_redundancia"],
            "co2": AUTOMATIZACION_DB["sensores"]["co2"],
        },
        "sensores_descartados": AUTOMATIZACION_DB["sensores"]["descartados"],
        "estado_control_actual": AUTOMATIZACION_DB["estado_actual"],
        "dew_point_nota": (
            "El sensor RH mide % saturación, NO confirma dew point en caps. "
            "Indicador práctico: tiny droplets en caps = dew point confirmado. "
            "Necesitas HR% + T° ambiente + T° superficie para verificar condensación real."
        ),
    }
    return _fmt(data, params.response_format, "Estado Documental — Sensores")


# ---------------------------------------------------------------------------
# TOOLS — INVENTARIO
# ---------------------------------------------------------------------------

class GetInventarioInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    categoria: str = Field(
        default="all",
        description="'produccion' | 'prototipado' | 'electronica' | 'pendiente_comprar' | 'consumibles' | 'all'",
    )
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

CATEGORIAS_INV = {"produccion", "prototipado", "electronica", "pendiente_comprar", "consumibles", "all"}

@mcp.tool(
    name="setas_get_inventario",
    annotations={
        "title": "Inventario de Hardware y Consumibles",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_get_inventario(params: GetInventarioInput) -> str:
    """Retorna el inventario completo de hardware, electrónica y consumibles.

    Incluye equipos de producción (CLOUDLAB 844, T7, ESP32, SCD30, H4),
    equipos de prototipado (Martha Tent, H05, Inkbirds), electrónica adicional,
    pendientes de compra y consumibles (bolsas, spawn).

    Args:
        params (GetInventarioInput):
            - categoria: categoría específica o 'all'
            - response_format: 'markdown' | 'json'

    Returns:
        str: Inventario formateado con estados y fechas de llegada.
    """
    if params.categoria not in CATEGORIAS_INV:
        return f"Error: categoría '{params.categoria}' no válida. Opciones: {sorted(CATEGORIAS_INV)}"

    if params.categoria == "all":
        data = INVENTARIO_DB
    else:
        data = {params.categoria: INVENTARIO_DB.get(params.categoria, {})}
        data["costo_total_produccion_usd"] = INVENTARIO_DB["costo_total_produccion_usd"]

    return _fmt(data, params.response_format, f"Inventario — {params.categoria}")


class GetPedidosPendientesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

@mcp.tool(
    name="setas_get_pedidos_pendientes",
    annotations={
        "title": "Recepciones por Verificar y Pendientes de Compra",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_get_pedidos_pendientes(params: GetPedidosPendientesInput) -> str:
    """Retorna equipos cuyo estado de recepción debe verificarse y compras pendientes.

    Las fechas se conservan como historia de la orden; no prueban recepción.

    Args:
        params (GetPedidosPendientesInput):
            - response_format: 'markdown' | 'json'

    Returns:
        str: Equipos por verificar + lista pendiente de compra.
    """
    hoy = datetime.date.today().isoformat()
    por_verificar = [
        {**item, "dias_restantes": _dias_restantes(item["llegada_estimada"], hoy)}
        for item in INVENTARIO_DB["produccion"]
        if item["estado"] == "verificacion_requerida"
    ]

    data = {
        "fecha_consulta": hoy,
        "por_verificar": por_verificar,
        "pendiente_comprar": INVENTARIO_DB["pendiente_comprar"],
        "spawn_pendiente_costificacion": INVENTARIO_DB["consumibles"]["spawn_pendiente_costificacion"],
    }
    return _fmt(data, params.response_format, "Recepciones por Verificar")

def _dias_restantes(fecha_str: str, hoy: str) -> str:
    try:
        # Tomar primera fecha si rango (e.g. "2026-07-03 a 2026-07-18")
        fecha = fecha_str.split(" a ")[0].strip()
        delta = (datetime.date.fromisoformat(fecha) - datetime.date.fromisoformat(hoy)).days
        if delta < 0:
            return "llegó / verificar"
        return f"{delta} día(s)"
    except Exception:
        return "fecha variable"


# ---------------------------------------------------------------------------
# TOOLS — DOCUMENTO / CONTEXTO GENERAL
# ---------------------------------------------------------------------------

class GetContextoInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

@mcp.tool(
    name="setas_get_contexto_proyecto",
    annotations={
        "title": "Contexto General del Proyecto",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_get_contexto_proyecto(params: GetContextoInput) -> str:
    """Retorna el contexto operacional completo de Setas de la Peña.

    Ideal como primer tool call para dar contexto a un modelo antes de
    responder preguntas sobre el cultivo. Incluye: descripción del proyecto,
    ubicación, especies, estado del sistema, filosofía de automatización
    y división de tareas Claude/ChatGPT.

    Args:
        params (GetContextoInput):
            - response_format: 'markdown' | 'json'

    Returns:
        str: Resumen ejecutivo del proyecto.
    """
    data = {
        "proyecto": "Setas de la Peña",
        "ubicacion": "Tenjo, Colombia (~2600 m s.n.m.)",
        "objetivo": "Cultivo de setas para productos culinarios y medicinales. Automatización modular y escalable.",
        "operacion": "Sebastián opera remotamente; cuidador físico en Tenjo ejecuta acciones en campo.",
        "especies_objetivo": list(PARAMETROS_DB.keys()),
        "especie_prioridad": "p_djamor — primera en producción",
        "estado_sistema": {
            "prototipado": "Martha Tent activa con H05 + Inkbirds",
            "produccion": "Estado de CLOUDLAB 844 + T7 + ESP32/ESPHome requiere verificación de campo",
            "automatizacion": "ESP32+ESPHome por carpa → Home Assistant en RPi4",
            "control_hr": "Manual hasta instalar T7 + relay externo",
        },
        "division_tareas_IA": {
            "Claude": [
                "Protocolos técnicos y SOPs",
                "Documentación para socios/empleados/clientes",
                "Análisis de automatización y arquitectura",
                "Base de conocimiento continua (memoria persistente)",
            ],
            "ChatGPT": [
                "Contenido de marketing y branding",
                "Generación de imágenes (DALL-E)",
                "Borradores creativos y copy",
                "Segunda opinión en decisiones de negocio",
            ],
        },
        "protocolo_verificacion": (
            "Toda información técnica debe validarse en Tier 1 (papers/estudios) "
            "o Tier 2 (fabricantes, Cornell, NAMA) antes de aplicarse en campo. "
            "Registro técnico-agrónomo; no lenguaje místico."
        ),
    }
    return _fmt(data, params.response_format, "Contexto — Setas de la Peña")


class GenerarSOPInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    proceso: str = Field(
        ...,
        description="Proceso a documentar. Opciones: 'inoculacion' | 'fruiting_setup' | 'cosecha' | 'fae_check' | 'sensor_check'",
        min_length=3,
        max_length=50,
    )
    especie: Especie = Field(default=Especie.DJAMOR)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

SOPS = {
    "inoculacion": {
        "nombre": "SOP — Inoculación de Sustrato",
        "objetivo": "Inocular sustrato con spawn de forma aséptica para minimizar contaminación.",
        "pasos": [
            "1. Preparar área de trabajo: limpiar con alcohol 70%, usar mascarilla y guantes.",
            "2. Verificar sustrato: temperatura <28°C antes de inocular.",
            "3. Abrir bolsa de spawn en área limpia; no exponer más de 30 seg.",
            "4. Mezclar spawn con sustrato: 10–20% spawn por peso de sustrato seco.",
            "5. Sellar bolsa inmediatamente (termosellado o filtro de microporo).",
            "6. Etiquetar: especie, fecha, lote.",
            "7. Trasladar a zona de incubación: T° objetivo según especie.",
        ],
        "parametros_criticos": ["Temperatura sustrato <28°C", "Área de trabajo limpia", "Velocidad de proceso"],
    },
    "fruiting_setup": {
        "nombre": "SOP — Setup Cámara de Fructificación",
        "objetivo": "Configurar cámara/carpa para inducir fructificación.",
        "pasos": [
            "1. Verificar bloque/bolsa: micelio blanco homogéneo sin manchas verdes/negras.",
            "2. Hacer cortes en la bolsa para exposición (fruiting holes).",
            "3. Colocar en carpa; ajustar altura y spacing entre bloques.",
            "4. Configurar humidificador: según especie (ver setas_get_parametros).",
            "5. Configurar ventilación por CO₂ usando la línea base obtenida en commissioning (ver setas_get_fae).",
            "6. Verificar posición exhaust: debe estar en la parte superior.",
            "7. Ajustar luz: 750–1500 lux, 3–5h/día (timer).",
            "8. Registrar fecha de inicio de fruiting en bitácora.",
        ],
        "parametros_criticos": ["HR objetivo", "CO₂ en rango", "Caudal efectivo validado", "Exhaust en techo"],
    },
    "cosecha": {
        "nombre": "SOP — Cosecha",
        "objetivo": "Cosechar en momento óptimo para máximo yield y calidad.",
        "pasos": [
            "1. Indicador visual: caps comenzando a enrollar bordes hacia arriba (antes de liberar esporas).",
            "2. Cosechar torciendo suavemente en sentido antihorario (no cortar — evitar muñones).",
            "3. Limpiar zona de fructificación: remover bases residuales con cuchillo limpio.",
            "4. Pesar y registrar yield por bloque en bitácora.",
            "5. Remojar/rehidratar bloque 12–24h si se busca segunda oleada.",
            "6. Mantener condiciones FAE y HR durante recuperación.",
        ],
        "parametros_criticos": ["Timing antes de liberación de esporas", "Limpieza de muñones"],
    },
    "fae_check": {
        "nombre": "SOP — Verificación FAE Diaria",
        "objetivo": "Confirmar que el sistema de ventilación opera en parámetros correctos.",
        "pasos": [
            "1. Verificar que el extractor esté operando (audición o tacto en salida).",
            "2. Revisar lectura CO₂ en HA dashboard: debe estar en rango de especie.",
            "3. Verificar caudal/estado del extractor y la respuesta del CO₂ contra la línea base de commissioning.",
            "4. Comprobar que no haya obstrucciones en intake ni exhaust.",
            "5. Registrar lectura CO₂ en bitácora (hora, valor).",
            "6. Si CO₂ > umbral: revisar sensor, obstrucciones y aumentar ventilación gradualmente.",
        ],
        "parametros_criticos": ["CO₂ en rango", "Extractor operativo", "Caudal efectivo documentado"],
    },
    "sensor_check": {
        "nombre": "SOP — Verificación de Sensores",
        "objetivo": "Confirmar que todos los sensores reportan valores confiables.",
        "pasos": [
            "1. Comparar lectura SHT3x (ESP32/HA) vs Inkbird IBS-TH2 (BLE app).",
            "2. Diferencia aceptable T°: ±0.5°C. HR: ±3%.",
            "3. Si diferencia > aceptable: verificar posición de sonda (lejos de difusor y exhaust).",
            "4. Revisar lectura SCD30: compensación altitud activa en ESPHome (Tenjo 2600m).",
            "5. Verificar visual HR: tiny droplets en paredes que evaporan = 85–90% ✅.",
            "6. Registrar cualquier deriva en bitácora para seguimiento.",
            "7. NUNCA confiar en sensor integrado del VIVOSUN H05 (sesgo +30–35%).",
        ],
        "parametros_criticos": ["Comparación cruzada SHT3x vs Inkbird", "Compensación altitud SCD30"],
    },
}

@mcp.tool(
    name="setas_generar_sop",
    annotations={
        "title": "Generar SOP de Proceso",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_generar_sop(params: GenerarSOPInput) -> str:
    """Genera un Procedimiento Operacional Estándar (SOP) para el proceso indicado.

    SOPs disponibles: 'inoculacion', 'fruiting_setup', 'cosecha', 'fae_check', 'sensor_check'.
    Incluye parámetros de la especie seleccionada donde aplica.

    Args:
        params (GenerarSOPInput):
            - proceso: nombre del proceso
            - especie: especie de referencia para parámetros (default: p_djamor)
            - response_format: 'markdown' | 'json'

    Returns:
        str: SOP formateado listo para usar por el cuidador en campo.

    Error: Si el proceso no existe, retorna lista de SOPs disponibles.
    """
    if params.proceso not in SOPS:
        return (
            f"Error: proceso '{params.proceso}' no encontrado. "
            f"SOPs disponibles: {list(SOPS.keys())}"
        )

    sop = SOPS[params.proceso].copy()
    especie_key = params.especie.value
    if especie_key in PARAMETROS_DB:
        sop["parametros_especie"] = {
            "especie": PARAMETROS_DB[especie_key]["nombre_comun"],
            "fruiting": PARAMETROS_DB[especie_key].get("fruiting", {}),
        }

    return _fmt(sop, params.response_format, sop["nombre"])


class ListToolsInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

@mcp.tool(
    name="setas_list_tools",
    annotations={
        "title": "Lista de Herramientas Disponibles",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def setas_list_tools(params: ListToolsInput) -> str:
    """Lista todos los tools disponibles en este MCP con descripción breve.

    Útil como primer call para que un modelo descubra las capacidades del servidor.

    Returns:
        str: Catálogo de tools con descripción y parámetros principales.
    """
    tools = {
        "setas_get_contexto_proyecto": "Contexto general del proyecto — usar como primer call.",
        "setas_get_parametros": "Parámetros T°/HR/CO₂/FAE/luz por especie y fase.",
        "setas_get_fae": "Protocolo FAE detallado (ciclo ON/OFF, CFM, ventilación) por especie.",
        "setas_get_sensores": "Estado operacional de sensores (SHT3x, SCD30, Inkbird, descartados).",
        "setas_get_automatizacion": "Arquitectura de automatización ESP32/ESPHome/HA por sección.",
        "setas_get_inventario": "Inventario completo de hardware y consumibles por categoría.",
        "setas_get_pedidos_pendientes": "Equipos con recepción por verificar y pendientes de compra.",
        "setas_generar_sop": "Genera SOPs: inoculacion | fruiting_setup | cosecha | fae_check | sensor_check.",
        "setas_list_tools": "Este tool — catálogo de herramientas disponibles.",
    }
    return _fmt(tools, params.response_format, "Setas de la Peña MCP — Tools Disponibles")


# ---------------------------------------------------------------------------
# ENTRYPOINT
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    mcp.run()
