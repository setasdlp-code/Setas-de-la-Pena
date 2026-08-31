# Literature OCR — DeepSeek-OCR-2 integration

Status: **EXPERIMENTAL**. This is an implementation tool, not a registered `WF-XXX` workflow. Per `knowledge_base/10_ai_workflows/README.md`, it should only be promoted to a permanent AI workflow after three independent successful uses.

## Purpose

Convert literature into page-addressable Markdown for the Setas de la Peña research pipeline while preserving source provenance and keeping machine extraction separate from validated knowledge.

The default path is hybrid. PDF pages with a usable, layout-simple embedded text layer are extracted directly; scanned pages or pages whose positioned PDF text appears layout-complex are routed to DeepSeek-OCR-2. Images always require OCR. Upstream engine metadata is pinned in `upstream.lock.json`; model weights are not committed to this repository.

The upstream document prompt used for OCR pages is:

```text
<image>
<|grounding|>Convert the document to markdown.
```

## Why this integration is useful

DeepSeek-OCR-2 provides an explicit document-to-Markdown inference mode and is suited to scans and structured pages where ordinary PDF extraction loses layout. The wrapper adds controls required by this knowledge system:

1. Per-page routing between native PDF extraction and DeepSeek-OCR-2.
2. Stable source-page markers and extraction-method markers.
3. SHA-256 provenance for the source file.
4. Machine-generated/unverified status in frontmatter.
5. Rights-aware blocking before writing machine extraction into tracked repository paths.
6. Default staging under `.local/literature_ocr/`, excluded from Git.
7. Explicit `document_id` requirement before tracked Markdown can be generated.

Machine output remains evidence intake. It is not a validated quotation source and must not directly change SOPs, species parameters, or canonical knowledge.

## Routing strategies

The wrapper exposes three strategies:

```text
auto    default; native extraction only when the PDF text layer is usable and layout-simple,
        otherwise DeepSeek-OCR-2
ocr     force DeepSeek-OCR-2 for every selected page
native  require embedded PDF text; never load the OCR model
```

`auto` is intended for mixed literature collections. Use `ocr` when preserving page structure is more important than avoiding GPU work, especially for multi-column pages, tables, scans, or visually structured manuals. Use `native` only when the source is known to have a reliable text layer and reading order.

The auto-routing heuristic is deliberately conservative. It checks minimum character/word coverage, invalid replacement characters, and whether PyMuPDF's positioned text contains extensive horizontal spacing that suggests columns, diagrams, or other layout-sensitive content. A routing decision is not a quality guarantee; verify the resulting Markdown against the source.

## Compute constraint

Native PDF extraction does not require a GPU. DeepSeek-OCR-2 pages follow the upstream CUDA + FlashAttention configuration and require a Linux/NVIDIA CUDA environment. The integration does not claim Apple Silicon/MPS or CPU OCR support.

On a Mac, `--strategy auto` or `--strategy native` can process suitable born-digital PDFs locally. Any page routed to DeepSeek must be processed on a supported NVIDIA Linux workstation or cloud GPU.

## Bootstrap the pinned upstream source

```bash
bash tools/literature_ocr/bootstrap_upstream.sh
```

The script checks out the pinned upstream commit under:

```text
${XDG_CACHE_HOME:-$HOME/.cache}/setas-de-la-pena/DeepSeek-OCR-2
```

This is a reference checkout. The wrapper loads the model through Hugging Face Transformers, matching the upstream Transformers example.

## Environment

For native extraction only, PyMuPDF is sufficient:

```bash
pip install PyMuPDF
```

For OCR pages, the upstream project documents Python 3.12.9, CUDA 11.8, PyTorch 2.6.0 and FlashAttention 2.7.3. A compatible environment is:

```bash
conda create -n setas-ocr2 python=3.12.9 -y
conda activate setas-ocr2

pip install torch==2.6.0 torchvision==0.21.0 torchaudio==2.6.0 \
  --index-url https://download.pytorch.org/whl/cu118

UPSTREAM="${XDG_CACHE_HOME:-$HOME/.cache}/setas-de-la-pena/DeepSeek-OCR-2"
pip install -r "$UPSTREAM/requirements.txt"
pip install flash-attn==2.7.3 --no-build-isolation
```

The upstream README also documents a vLLM path. This wrapper does not require vLLM; evaluate it separately only if throughput testing shows that the Transformers path is a bottleneck.

## Safe first run

Always inspect routing before loading the model:

```bash
python tools/literature_ocr/deepseek_ocr2_to_md.py \
  /path/to/book.pdf \
  --source-id book_004 \
  --rights-status private_reference_only \
  --pages 70-75 \
  --dry-run
```

The JSON report lists each page as either `native_pdf_text` or `deepseek_ocr2`.

Then run the selected pages:

```bash
python tools/literature_ocr/deepseek_ocr2_to_md.py \
  /path/to/book.pdf \
  --source-id book_004 \
  --rights-status private_reference_only \
  --pages 70-75
```

To force layout-aware OCR for all selected pages:

```bash
python tools/literature_ocr/deepseek_ocr2_to_md.py \
  /path/to/manual.pdf \
  --source-id guide_002 \
  --rights-status user_permitted_private_retention \
  --strategy ocr
```

Default output:

```text
.local/literature_ocr/<source_id>.md
```

That output is deliberately untracked. For sources such as `book_004` whose manifest states `private reference only; no binary or OCR transcription redistribution`, keep full machine extraction in local staging and promote only verified claims or notes permitted by the source policy.

## Writing machine extraction into the tracked knowledge base

Tracked output is permitted only when the operator explicitly supplies a rights status that allows repository retention:

- `public_or_open`
- `user_permitted_private_retention`

Tracked output also requires a repository `document_id`:

```bash
python tools/literature_ocr/deepseek_ocr2_to_md.py \
  /path/to/guide.pdf \
  --source-id guide_002 \
  --rights-status user_permitted_private_retention \
  --document-id DOC-XXXX \
  --title "Literature intake — guide_002" \
  --output knowledge_base/09_research/intake/ocr/guide_002.md
```

Assign the real `document_id` according to `knowledge_base/00_project/IDENTIFIER_STANDARD.md`; do not copy `DOC-XXXX`.

If rights are `unknown` or `private_reference_only`, the script blocks tracked repository output.

## Promotion pipeline

```text
PDF / scan / image
  ↓
preflight + per-page routing
  ↓
embedded PDF text or DeepSeek-OCR-2
  ↓
.local/literature_ocr/<source_id>.md
  ↓
human / agent verification against source pages
  ↓
claim extraction + evidence rating
  ↓
09_research claim register / literature database / source manifest
  ↓
formal project decision if practice should change
  ↓
SOP or canonical knowledge update
```

This preserves the repository distinction between raw information, research evidence, decisions, and operational knowledge.

## Verification requirements

Before citing machine-extracted content:

- compare numerical values against the source page;
- verify tables row-by-row;
- verify equations and units;
- verify species names and author names;
- verify page references against the original PDF;
- verify reading order on multi-column pages;
- preserve page markers during editing;
- do not treat generated Markdown as the source of record.

Generated Markdown inserts markers such as:

```html
<!-- source-page: 14; extraction: deepseek_ocr2 -->
<!-- source-page: 15; extraction: native_pdf_text -->
```

These markers allow claims to be traced back to both the source page and the extraction route.

## Current recommendation

Use the hybrid `auto` path for initial intake. Force DeepSeek-OCR-2 on scanned books, manuals, tables, multi-column documents, and image-heavy papers when layout fidelity matters. Retain native PDF text for simple born-digital pages when its reading order is clearly reliable.

After three successful ingestion runs, evaluate character accuracy, table fidelity, reading-order fidelity, page-reference fidelity, runtime, and GPU cost. Only then decide whether this tool should become a permanent `WF-XXX` literature-ingestion workflow.
