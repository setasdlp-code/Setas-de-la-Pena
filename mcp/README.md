# Setas de la Peña — MCP Server

MCP server local (stdio) que expone el conocimiento operacional del cultivo a Claude y ChatGPT.

## Archivos

| Archivo | Descripción |
|---|---|
| `setas_mcp.py` | Servidor MCP principal (FastMCP/Python) |
| `claude_desktop_config_snippet.json` | Snippet para `claude_desktop_config.json` |
| `chatgpt_system_prompt.md` | System prompt para Custom GPT en OpenAI |

## Instalación

```bash
# 1. Crear un entorno e instalar dependencias estables
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r mcp/requirements.txt

# 2. Verificar que corre
.venv/bin/python "/Users/sebastianpinzon/Documents/Claude/Projects/Setas de la Peña/mcp/setas_mcp.py"
# No debe lanzar errores

# 3. Testear con MCP Inspector (opcional)
npx @modelcontextprotocol/inspector python3 "/Users/sebastianpinzon/Documents/Claude/Projects/Setas de la Peña/mcp/setas_mcp.py"
```

## Conectar a Claude Desktop

Agrega el bloque de `claude_desktop_config_snippet.json` al archivo de configuración de Claude Desktop. El snippet apunta al intérprete del entorno `.venv`; si mueves el proyecto, actualiza ambas rutas absolutas.

Reinicia Claude Desktop. En cualquier conversación podrás usar los tools directamente.

## Conectar a ChatGPT

ChatGPT no soporta MCP nativo. La integración es vía **system prompt** (`chatgpt_system_prompt.md`):
1. Abre platform.openai.com → GPTs → Create
2. Pega el contenido de `chatgpt_system_prompt.md` en "Instructions"
3. El GPT tendrá el contexto embebido; para datos técnicos en tiempo real usará a Claude como fuente de verdad

## Tools disponibles

| Tool | Descripción |
|---|---|
| `setas_list_tools` | Catálogo de tools — primer call recomendado |
| `setas_get_contexto_proyecto` | Resumen ejecutivo del proyecto |
| `setas_get_parametros` | T°/HR/CO₂/FAE/luz por especie y fase |
| `setas_get_fae` | Protocolo FAE detallado por especie |
| `setas_get_sensores` | Estado operacional de sensores |
| `setas_get_automatizacion` | Arquitectura ESP32/ESPHome/HA |
| `setas_get_inventario` | Inventario hardware y consumibles |
| `setas_get_pedidos_pendientes` | Recepciones por verificar + pendientes de compra |
| `setas_generar_sop` | Genera SOPs: inoculacion, fruiting_setup, cosecha, fae_check, sensor_check |

## División Claude / ChatGPT

| Claude | ChatGPT |
|---|---|
| Protocolos técnicos, SOPs | Marketing, redes sociales, copy |
| Arquitectura de automatización | Naming de productos, empaques |
| Documentación interna | Conceptos visuales (DALL-E) |
| Base de conocimiento técnico | Segunda opinión de negocio |
| Análisis sensores y parámetros | Contenido para clientes |

## Extender el MCP

Para agregar un nuevo tool:
1. Define un Pydantic `BaseModel` para el input
2. Agrega `@mcp.tool(name="setas_...", annotations={...})` antes de la función
3. Documenta con docstring completo
4. Actualiza el dict en `setas_list_tools`
