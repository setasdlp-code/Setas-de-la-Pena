# Setas de la Peña

Repositorio privado de investigación, operación y desarrollo de producto para una empresa de cultivo y venta de setas en Tenjo, Colombia.

## Contenido principal

- `knowledge_base/`: conocimiento canónico de cultivo, instalaciones, operación y negocio.
- `field_os/`: arquitectura y diseño del sistema operativo de campo.
- `assets/`, `08_brand/` y `fonts/`: identidad y recursos visuales.
- `simulador_sustrato_v4.0.html`: simulador de formulación de sustratos.
- `mcp/`: servidor local para consultar la base de conocimiento.

`climate-bench/` se mantiene como repositorio independiente y está excluido del repositorio principal.
Los PDF completos usados como fuentes permanecen en un caché local excluido; Git conserva las citas y síntesis curadas.

## Seguridad

El repositorio debe permanecer **privado**. Credenciales, tokens, exportaciones de correo y archivos `.env` están excluidos por `.gitignore`. Antes de cada commit, confirma el alcance con:

```bash
git status --short
git diff --cached --name-only
```

## Configuración Python

El ECC actual usa únicamente la biblioteca estándar. El servidor MCP requiere Python 3.10 o superior y dependencias propias:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r mcp/requirements.txt
.venv/bin/python -c "import mcp, pydantic"
```

## Preparación inicial de Git

1. Resuelve cualquier repositorio Git anidado: intégralo como carpeta normal, como submódulo válido o mantenlo fuera de este repositorio.
2. Configura tu identidad si todavía no existe:

   ```bash
   git config user.name "Tu nombre"
   git config user.email "tu@email.com"
   ```

3. Prepara el alcance y revísalo antes de crear el commit:

   ```bash
   git add -A
   git status --short
   git diff --cached --stat
   git diff --cached --name-only
   ```

4. Crea un repositorio vacío y privado en GitHub.
5. Publica únicamente el staging ya revisado:

   ```bash
   bash push_to_github.sh <URL_DEL_REPO> --confirm-private
   ```

El script no ejecuta `git add`: conserva el historial, bloquea archivos sensibles, `climate-bench`, cachés de fuentes y archivos mayores de 95 MB, y se niega a reemplazar un remoto diferente.

## Validaciones rápidas

```bash
python3 -m py_compile build_offline.py fetch_gmail.py mcp/setas_mcp.py ECC/main.py
python3 ECC/main.py config
python3 ECC/main.py test-skills
node --check recipe-recommender.js
bash -n push_to_github.sh
```
