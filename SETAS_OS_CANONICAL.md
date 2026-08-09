# Setas OS — Fuente canónica

Este repositorio contiene la implementación canónica y activa de **Setas OS**.

## Ubicación oficial

- Repositorio: `setasdlp-code/Setas-de-la-Pena`
- Rama de referencia: `main`
- Raíz de la aplicación: `field-os-simulador/setas-os/`
- Shell principal actual: `field-os-simulador/setas-os/Setas OS v5.dc.html`
- Fuente del simulador/formulador: `field-os-simulador/setas-os/simulador-app.jsx`
- Capa Firebase: `field-os-simulador/setas-os/firebase/`
- Pruebas: `field-os-simulador/setas-os/*.test.js`

## Regla operativa

Antes de implementar una función, corregir un bug, revisar Firebase, modificar inventario, producción, bitácora, formulación o cualquier otra parte de Setas OS:

1. Verificar que el repositorio sea `setasdlp-code/Setas-de-la-Pena`.
2. Partir del `main` actualizado.
3. Trabajar únicamente dentro de `field-os-simulador/setas-os/`, salvo cambios explícitos de CI, documentación o integración.
4. Crear una rama temporal para el trabajo y fusionarla mediante pull request.
5. Después de fusionar, considerar `main` como la única representación del estado actual.

## Repositorios y prototipos no canónicos

Los siguientes repositorios o prototipos pueden conservar valor histórico, de diseño o demostración, pero **no deben usarse como base para nuevas modificaciones de Setas OS**:

- `setasdlp-code/Field-OS`
- `setasdlp-code/simulador`
- prototipos antiguos de Field OS / Setas OS almacenados en otras rutas o repositorios
- copias locales que no correspondan al checkout actualizado de este repositorio

Si una versión histórica contiene una función que parece faltar en la app canónica, se debe comparar y portar deliberadamente al código canónico; no continuar el desarrollo en la copia histórica.

## Ramas

`main` es la referencia canónica. Las ramas `feature/*`, `fix/*`, `agent/*`, `codex/*` u otras ramas de trabajo son temporales. Una rama fusionada no representa una versión alternativa vigente de Setas OS.

## Versionado

La versión de producto debe identificarse mediante Git y el manifiesto `field-os-simulador/setas-os/setas-os.json`. Los nombres de archivos con `v5`, `v6`, etc. son nombres heredados y no deben utilizarse para decidir cuál copia es la más reciente.

## Migración futura

La aplicación puede extraerse posteriormente a un repositorio dedicado `setasdlp-code/Setas-OS`. Esa migración debe realizarse únicamente después de auditar historia, dependencias, CI, despliegue y cualquier código todavía exclusivo de los repositorios históricos. Hasta que esa migración se complete y este documento sea actualizado, la ubicación indicada arriba sigue siendo la única fuente canónica.
