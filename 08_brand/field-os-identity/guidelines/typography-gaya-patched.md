# Field OS Identity — GayaPatched editorial typography

Status: normative supplement · 2026-09-04

## Principle

GayaPatched is the primary editorial identity face for Field OS documents, covers, technical sheets, proposals and presentation artifacts. Use its weight and italic range to create hierarchy inside a restrained composition. Long prose, dense tables and interface copy remain in the support sans; metadata, measurements, IDs and codes remain monospaced.

The project currently contains GayaPatched Thin, Light, Medium, Bold and Black, with matching Italics. The design system should use these real files rather than synthetic bold or synthetic italic.

## Roles

| Role | GayaPatched style | Typical use |
|---|---|---|
| Hero / Display 01 | Black 900 | Cover titles, primary document statement |
| Hero accent | Black Italic 900 | One short phrase inside the hero |
| Section | Bold 700 | Section headings, key totals, strong labels |
| Section accent | Medium Italic 500 | Secondary phrase inside a heading |
| Subhead | Medium 500 | Systems, material names, secondary hierarchy |
| Annotation | Medium Italic 500 | Pull notes, qualitative emphasis, editorial callouts |
| Quiet display | Light 300 | Decks, secondary large text, transitional copy |
| Quiet editorial | Light Italic 300 | Coda, captions and low-emphasis editorial notes |
| Exceptional fine display | Thin / Thin Italic 100 | Large-format decorative/editorial use only; never small operational text |

## Usage rules

1. A document may use several GayaPatched styles, but the contrast must express hierarchy. Default to 2–4 Gaya styles on a page rather than showing the whole family at once.
2. Covers and high-level pages should normally pair Black with Black Italic, then step down to Bold / Medium for section structure.
3. Italic is an editorial accent, not the default body voice. Avoid long italic paragraphs.
4. Thin and Light should not carry small operational information. At small sizes use the support sans or mono.
5. Long prose and dense tables use the support sans for legibility. Technical metadata uses IBM Plex Mono.
6. Preserve the Field OS palette and generous negative space; type-weight variation should provide most of the visual movement.
7. Never synthesize an italic or bold when a matching GayaPatched file exists.
8. Font binaries are project assets and are not to be redistributed. Exported PDFs may embed/subset the fonts as part of the finished artifact.

## Reference implementation

Use `../tokens/gaya-patched-editorial.css` for the complete five-weight Roman/Italic mapping and reusable editorial role classes.

## Example hierarchy used in Caseta Terraza funding document

- `Caseta de fructificación` — Black.
- `en terraza` — Black Italic.
- Document deck — Light, with selective Bold emphasis.
- `Ensamble` / `Alcance` / `Presupuesto` — Bold.
- Heading modifiers such as `del muro`, `estimado` — Medium Italic.
- Main amount `$3.050.000 COP` — Black.
- Final qualification note — Light Italic.
- Running copy and budget table — support sans.
- Eyebrows, labels, page numbers and dimensions — mono.
