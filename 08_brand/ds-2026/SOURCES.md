# Sources & inspiration · DS-2026

Twelve visual references, prioritised by how directly each one shaped a design
decision. These groups measure visual influence; they are not the project's
scientific evidence tiers and do not validate biological, operational or
commercial claims. Every URL was requested during authoring on 2026-09-04; the
**Check** column records only the access result.

- `200` — fetched successfully.
- `403` — automated access was refused. This result does not verify the page,
  title or claim; revisit it manually before relying on the reference.

---

## Primary visual references

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

## Supporting references — packaging and identity

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

Origin storytelling with production data (farm, altitude, harvest) on the
package. Visual precedent for surfacing a lot identifier and traceability QR to
a consumer. It does not validate the example data used by this system.

### 9. Juan Valdez
`200` · https://juanvaldez.com

Colombian origin branding at national scale. Referenced mainly as a **contrast
case**: its warmth comes from illustration and colour, where this system takes
warmth from paper stock and letterforms. Useful for knowing what not to copy.

---

## Exploratory references — archives and cross-checks

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

---

## Font Integrity Checksums (SHA-256)

All 20 vendored font files are frozen and verified by SHA-256:

| Font File | SHA-256 Checksum |
|---|---|
| `GayaPatched-Black.otf` | `bea5658dd841dda9e91ccd4243367412819619acc4b3151315c9e73102add05f` |
| `GayaPatched-BlackItalic.otf` | `f45abf0eba5df1bd6a333edaec7ec48e85232af8060e65a04dd13af4122c6c5e` |
| `GayaPatched-Bold.otf` | `6d65e41c7690070335bf2e8ea9f20becfcf7bb1e5dc068cc765ffffa017f1f04` |
| `GayaPatched-BoldItalic.otf` | `21509aad6eac9c6d8e2a998030e9ddbb8c66ab199c6472cb3f732643ff54f496` |
| `GayaPatched-Italic.otf` | `1997bbc191dcef71881c3241ccf96f407cad83f593b24fd31f81fb4aa0b7cbb7` |
| `GayaPatched-Light.otf` | `81e0b7e69b19b5ddbbc7d3eeeccd5fb58ecd3357d9b00c16bc6c1c03268f77f1` |
| `GayaPatched-LightItalic.otf` | `e61299ea11cf1458d9402651274fce3907936a7b61b61c1aca091f1a6f9e2d66` |
| `GayaPatched-Medium.otf` | `62cf06eadae3682f46de9aef14c76298c6df918913a6bd69740502cd52f347ec` |
| `GayaPatched-MediumItalic.otf` | `e5e98d817d0f4628bf98128ba66d59bd8b10e365f91d1c2aefd7706258aca7be` |
| `GayaPatched-Regular.otf` | `bce8fb50abce701c84bcd0ad03d9c9828de777be87c1542aaacd5fd9fb8918a5` |
| `GayaPatched-Thin.otf` | `32e23feabf101c43518573ae88fbe63dcd4da961aae1fb74a930e59c9bb7c1a2` |
| `GayaPatched-ThinItalic.otf` | `17594cc9c19e10d7ef751fa7cf140b9736b56e2aa7fb9a776b60d7aaba6cfc57` |
| `IBMPlexMono-Medium.ttf` | `98fbd727aae340b236955879dabed4d991aac9e8e90b3b2a67ce4a59221cc97c` |
| `IBMPlexMono-Regular.ttf` | `7c6fbddca4b700be918f5f6183d9bd4464fa427fe435f0b480d77fe2bb8c5a43` |
| `IBMPlexMono-SemiBold.ttf` | `f04d7c488ddf7d1fa99f2574efc3406ea4cbe17bb1af3a1ab960f84d0c96a172` |
| `IBMPlexSans-Bold.ttf` | `cf74841e461235ac7205369329b14fd13a126af4c93927f8b287cad9aa6ffaab` |
| `IBMPlexSans-Light.ttf` | `3170046080cf96674193f7e1c50bbc4db51466253fb07d5b5a0db807e998d735` |
| `IBMPlexSans-Medium.ttf` | `0ebb5ad4c9c57f2a2860f43ae9fa69024c045b380b2a73b332d6f40c39f4a294` |
| `IBMPlexSans-Regular.ttf` | `8685116dfbcfa639621631c4af0ad62e52ddeb9979acbec0007ccef2e4801a27` |
| `IBMPlexSans-SemiBold.ttf` | `659f916ce1922bd4fecac7cd5f26018817a2946327a5dd00169c8bab14ae2c58` |
