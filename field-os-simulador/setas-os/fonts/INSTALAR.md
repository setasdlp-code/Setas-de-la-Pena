# Fonts — Setas de la Peña

Esta carpeta contiene las tipografías de marca para uso interno.

## Cómo instalar en Mac

1. Doble-click sobre `GayaPatched-Regular.otf` → "Instalar fuente"
2. Doble-click sobre `GayaPatched-Italic.otf` → "Instalar fuente"
3. Reiniciar Keynote / PowerPoint / Word para que aparezca en la lista de fuentes.

Una vez instaladas, abrir `Setas-de-la-Pena-Presentacion-Socios-v1.pptx` y la tipografía display se va a ver en Gaya.

## Qué son estas fuentes

**Gaya** es la fuente de display oficial de Setas de la Peña, diseñada por Raphaël de La Morinerie en la fundición WrittenShape (Francia, 2021). Es una serif humanista contemporánea con personalidad cálida y orgánica, ideal para el concepto "Sombra y Silencio".

**Estado de licencia:** trial mientras se compra la licencia oficial en [writtenshape.com](https://writtenshape.com).

## Por qué se llaman "GayaPatched" y no "Gaya"

La versión trial original (`GayaTrial`) deja los glifos con diacríticos del español (ñ, á, é, í, ó, ú, ü) **vacíos** — esto hace que "Peña" se vea como "Pena", "precisión" como "precision", etc. Es una limitación deliberada del trial para forzar la licencia.

`GayaPatched` es el trial modificado localmente para componer los diacríticos uniendo la letra base (n, o, a, etc.) con la marca tipográfica (tilde, acute, dieresis) que el font sí incluye como glifos sueltos.

**Restricciones de uso:**
- Uso de evaluación visual interna **únicamente**.
- **No distribuir** el `.otf` patcheado fuera del equipo de Setas de la Peña.
- Cuando se licencie Gaya completa, descartar estos archivos y usar la versión oficial.

## Migración a la versión licenciada

Cuando se obtenga la licencia oficial:

1. Descargar `Gaya-Regular.otf` y `Gaya-Italic.otf` de WrittenShape.
2. Instalar en el sistema.
3. Desinstalar `GayaPatched-*.otf` de esta carpeta.
4. En cualquier `.pptx`, `.docx`, o template de marca, hacer find-and-replace de `GayaPatched` → `Gaya` en el nombre de fuente.
