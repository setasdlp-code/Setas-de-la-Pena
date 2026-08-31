# Internal rights policy — literature OCR

Status: project policy for private research intake. This file does not determine copyright ownership, license scope, fair-use/fair-dealing status, or other legal rights.

## Principle

Keep two fields conceptually separate:

- `rights_status` describes what is known about the source.
- `usage_scope` describes what the Knowledge Base is allowed to do with the extraction under project policy.

A source must never be relabelled as open merely to make the ingestion tool accept it.

## Internal-use mode

Use `deepseek_ocr2_internal_to_md.py` when a full or partial machine extraction is useful to the project but the source is not cleared for redistribution.

Tracked Markdown created through this entrypoint is marked:

```yaml
usage_scope: internal_only
external_redistribution: prohibited_unless_separately_cleared
rights_review_required: false
```

For `rights_status: unknown`, `rights_review_required` is `true` and the command requires the explicit flag:

```text
--acknowledge-unknown-rights
```

This acknowledgement does not convert unknown rights into permission. It records that the material is being retained for internal research while rights review remains pending.

## Rights-status behavior

| rights_status | Local `.local/` staging | Private tracked intake through internal entrypoint | External/public redistribution |
|---|---|---|---|
| `public_or_open` | allowed | allowed | governed by the actual license/terms |
| `user_permitted_private_retention` | allowed | allowed | not implied |
| `private_reference_only` | allowed | allowed as `internal_only` | blocked by project policy unless separately cleared |
| `unknown` | allowed | allowed only with explicit acknowledgement; review remains pending | blocked by project policy |

## Restricted-source handling

For `private_reference_only` and `unknown` sources:

1. Keep the repository private and restrict access to authorized project collaborators.
2. Prefer controlled local/private GPU inference. Do not upload restricted source pages to a public OCR demo or other external service merely to run the model.
3. Keep machine extraction in research intake; do not automatically promote full transcription into canonical or public-facing documentation.
4. Preserve `source_id`, source hash, page markers, extraction method, and rights metadata.
5. Verify claims against the source before operational use.
6. Reassess the rights status before any export, publication, public repository move, external sharing, or redistribution of substantial extracted text.

A private GitHub repository is still third-party hosted storage and may be accessible to repository collaborators. `internal_only` is therefore a project access classification, not a statement that storage or copying is legally permitted in every jurisdiction or under every source license.

## Usage

Restricted source with known private-reference status:

```bash
python tools/literature_ocr/deepseek_ocr2_internal_to_md.py \
  /path/to/book.pdf \
  --source-id book_004 \
  --rights-status private_reference_only \
  --document-id DOC-XXXX \
  --output knowledge_base/09_research/intake/internal/book_004.md
```

Unknown rights, retained internally while review is pending:

```bash
python tools/literature_ocr/deepseek_ocr2_internal_to_md.py \
  /path/to/source.pdf \
  --source-id source_pending \
  --rights-status unknown \
  --acknowledge-unknown-rights \
  --document-id DOC-XXXX \
  --output knowledge_base/09_research/intake/internal/source_pending.md
```

For sources already known to be open or explicitly retention-permitted, the standard `deepseek_ocr2_to_md.py` entrypoint remains appropriate.
