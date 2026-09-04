# Sources & inspiration · DS-2026

Twelve references, prioritised by how directly each one shaped a decision in
this system. Every URL was requested during authoring on 2026-09-04; the
**Check** column records what the server actually returned.

- `200` — fetched successfully.
- `403` — the host exists and responded, but refused an automated request
  (bot protection). The site is real; only the automated check was blocked.

---

## Tier 1 — shaped the system directly

### 1. Henry G. Gilbert Nursery and Seed Trade Catalog Collection (USDA)
`200` · https://archive.org/details/usda-nurseryandseedcatalog

The single strongest reference. Late-19th/early-20th-century seed catalogues
solved exactly this problem: a working document that is simultaneously a sales
object and a production record. The convention this system borrows most
literally is **the plate and the data table living on one page without either
apologising for the other** — see the Ficha (§5) and the SOP conditions table.

### 2. USDA Pomological Watercolor Collection
`200` · https://naldc.nal.usda.gov/usda_pomological_watercolor

~7,500 botanical watercolours made as *evidence*, not illustration — each
recording a specific cultivar at a specific date. This is the origin of the
system's rule that **biological imagery is evidence, not decoration** (§3), and
of the plate-line grammar `LÁM. IV · TENJO · CUNDINAMARCA · 2.600 M`.

### 3. Curtis's Botanical Magazine, via the Biodiversity Heritage Library
`403` · https://www.biodiversitylibrary.org
(search "Curtis's Botanical Magazine"; continuous since 1787)

The canonical botanical plate: single specimen, contained silhouette, hand
lettering beneath, plate number in the corner. Source of the **4:5 portrait
plate ratio** and the `contain`-never-`cover` cropping rule — the silhouette
*is* the identifying information.

### 4. Wellcome Collection
`200` · https://wellcomecollection.org/collections

Medical and botanical ephemera, heavily fungal. Useful specifically for how
19th-century mycological plates handle **spines, gills and pores in line only** —
the reference behind `scripts/gen-hericium.py`'s occlusion approach (nearer
spines drawn over farther ones, each filled with paper).

---

## Tier 2 — packaging and identity

### 5. Taller de Hierbas — Colombian herbal skincare
`200` · https://tallerdehierbas.com

The closest peer: a Colombian botanical brand whose packaging stays restrained
and text-forward rather than reaching for tropical maximalism. Confirms that a
warm-neutral ground with a single earth accent reads as *considered* rather than
*plain* in this market.

### 6. Loto del Sur — Colombian botanical apothecary
`200` · https://www.lotodelsur.com

Latin American apothecary packaging at scale. Reference for the **back-of-pack
information hierarchy** — ingredients, preparation, storage, traceability as
discrete hairline-separated blocks (§5, packaging back).

### 7. Aesop
`403` · https://www.aesop.com

The reference case for typographic packaging: no illustration on the primary
face in most lines, generous margin, apothecary label logic. DS-2026 diverges
deliberately — the plate *is* the front face here — but the **restraint of the
label block** and the amber/neutral discipline come from this lineage.

### 8. Luker Chocolate — Colombian single-origin
`200` · https://lukerchocolate.com

Origin storytelling with real production data (farm, altitude, harvest) on the
package. Direct precedent for surfacing `LOTE 026 · HER-01 · 17 AGO 2026` and a
traceability QR to a *consumer*, which most food packaging still hides.

### 9. Juan Valdez
`200` · https://juanvaldez.com

Colombian origin branding at national scale. Referenced mainly as a **contrast
case**: its warmth comes from illustration and colour, where this system takes
warmth from paper stock and letterforms. Useful for knowing what not to copy.

---

## Tier 3 — archives and cross-checks

### 10. Rijksmuseum Rijksstudio
`200` · https://www.rijksmuseum.nl/en/rijksstudio

High-resolution public-domain scans of botanical and natural-history prints.
Practical value here: studying how engraving line weight survives reduction —
which set the 1.4px stroke on the Hericium plate.

### 11. Mushroom Observer
`200` · https://mushroomobserver.org

Community mycological records with observation metadata. The reference for
**taxon-code and observation-line conventions** (§4) — how field mycologists
actually abbreviate binomials in practice.

### 12. Smithsonian Open Access
`403` · https://www.si.edu/openaccess

~5M open-access assets including botanical and agricultural documentation.
General-purpose source for period specimen labels and herbarium sheet layout,
which informed the Ficha footer's three-cell structure.

---

## A note on what is *not* cited

The palette, type scale and component set were derived from the brief and from
the constraints of the operation (2.600 m, field printing, gloved hands,
photocopiers), not from any single visual reference. Where a decision came from
measurement rather than taste — the ochre usage ban in §1.4, the 16px prose
floor, the 44px tap target — the reasoning is in `DESIGN_SYSTEM.md` and the
assertion is in `scripts/contrast-audit.py`.
