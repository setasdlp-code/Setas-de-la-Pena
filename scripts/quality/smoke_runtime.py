#!/usr/bin/env python3
"""Runtime smoke checks for the MCP server."""

from __future__ import annotations

import asyncio
import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def check_mcp() -> None:
    path = ROOT / "mcp/setas_mcp.py"
    spec = importlib.util.spec_from_file_location("setas_mcp", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("No se pudo cargar mcp/setas_mcp.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    response = asyncio.run(module.setas_get_fae(module.GetFAEInput()))
    required = ("commissioning", "8.5", "13.6")
    if not all(value in response.lower() for value in required):
        raise AssertionError("El recurso MCP de FAE no expone commissioning y caudal requerido")


def main() -> None:
    check_mcp()
    print("Runtime smoke checks passed.")


if __name__ == "__main__":
    main()
