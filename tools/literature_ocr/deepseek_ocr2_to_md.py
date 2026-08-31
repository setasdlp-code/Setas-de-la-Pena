#!/usr/bin/env python3
"""Convert PDF/image literature to page-addressable Markdown.

PDFs use a hybrid path by default: retain a usable, layout-simple embedded text
layer; route scans and layout-sensitive pages to DeepSeek-OCR-2. Machine output
is staged outside the tracked knowledge base unless rights explicitly permit
retention and a repository document_id is supplied.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

LOCK_PATH = Path(__file__).with_name("upstream.lock.json")
with LOCK_PATH.open("r", encoding="utf-8") as lock_fh:
    UPSTREAM_LOCK = json.load(lock_fh)

MODEL_NAME = UPSTREAM_LOCK["model"]
UPSTREAM_REPO = UPSTREAM_LOCK["repository"]
UPSTREAM_COMMIT = UPSTREAM_LOCK["commit"]
PROMPT = "<image>\n<|grounding|>Convert the document to markdown. "
TRACKABLE_RIGHTS = {"public_or_open", "user_permitted_private_retention"}
GROUNDING_RE = re.compile(
    r"<\|ref\|>(.*?)<\|/ref\|>\s*<\|det\|>.*?<\|/det\|>", re.DOTALL
)
DOCUMENT_ID_RE = re.compile(r"[A-Z]+-\d{4}")


@dataclass
class PageJob:
    page_number: int
    method: str
    native_text: str | None = None
    image_path: Path | None = None


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_pages(spec: str | None, total: int) -> list[int]:
    if not spec:
        return list(range(total))
    selected: set[int] = set()
    for token in spec.split(","):
        token = token.strip()
        if not token:
            continue
        if "-" in token:
            start_s, end_s = token.split("-", 1)
            start, end = int(start_s), int(end_s)
            if start > end:
                raise ValueError(f"Invalid page range: {token}")
            selected.update(range(start - 1, end))
        else:
            selected.add(int(token) - 1)
    invalid = sorted(p + 1 for p in selected if p < 0 or p >= total)
    if invalid:
        raise ValueError(f"Page(s) outside document: {invalid}; total pages={total}")
    return sorted(selected)


def yaml_quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def resolve_output(args: argparse.Namespace, source_id: str) -> tuple[Path, bool]:
    repo_root = repo_root_from_script()
    output = (
        Path(args.output).expanduser().resolve()
        if args.output
        else (repo_root / ".local" / "literature_ocr" / f"{source_id}.md").resolve()
    )
    try:
        relative = output.relative_to(repo_root)
        inside_repo = True
    except ValueError:
        relative = None
        inside_repo = False

    tracked = inside_repo and relative is not None and ".local" not in relative.parts
    if tracked and args.rights_status not in TRACKABLE_RIGHTS:
        raise PermissionError(
            f"Tracked output blocked for rights_status={args.rights_status!r}. "
            "Use .local staging or an explicitly retention-permitted status."
        )
    if tracked:
        if not args.document_id:
            raise ValueError("Tracked Markdown requires --document-id.")
        if not DOCUMENT_ID_RE.fullmatch(args.document_id):
            raise ValueError(
                f"--document-id {args.document_id!r} does not match the required "
                "PREFIX-XXXX format (e.g. DOC-0012)."
            )
    return output, tracked


def build_frontmatter(
    *,
    source_id: str,
    source_path: Path,
    rights_status: str,
    methods: list[str],
    tracked: bool,
    document_id: str | None,
    title: str | None,
    strategy: str,
) -> str:
    now = datetime.now(timezone.utc)
    lines = ["---"]
    if tracked:
        lines.extend(
            [
                f"title: {yaml_quote(title or f'Literature intake — {source_id}')}",
                f"document_id: {yaml_quote(document_id or '')}",
                "category: research",
                "load_priority: on_request",
                f"last_reviewed: {now.date().isoformat()}",
                "status: intake_unverified",
            ]
        )
    lines.extend(
        [
            f"source_id: {yaml_quote(source_id)}",
            f"source_filename: {yaml_quote(source_path.name)}",
            f"source_sha256: {sha256_file(source_path)}",
            f"rights_status: {rights_status}",
            "extraction_status: machine_generated_unverified",
            f"extraction_strategy: {strategy}",
            f"native_pdf_text_pages: {methods.count('native_pdf_text')}",
            f"deepseek_ocr2_pages: {methods.count('deepseek_ocr2')}",
            f"ocr_model: {yaml_quote(MODEL_NAME)}",
            f"ocr_upstream_repo: {yaml_quote(UPSTREAM_REPO)}",
            f"ocr_upstream_commit: {UPSTREAM_COMMIT}",
            f"generated_at_utc: {yaml_quote(now.isoformat())}",
            f"page_count_processed: {len(methods)}",
            "---",
            "",
            "> MACHINE EXTRACTION — UNVERIFIED. Validate quotations, tables, equations, page references, reading order, figures, and numerical values against the source before citing or promoting claims.",
            "",
        ]
    )
    return "\n".join(lines)


def load_model():
    try:
        import torch
    except ImportError as exc:
        raise RuntimeError("PyTorch is not installed; see tools/literature_ocr/README.md.") from exc
    if not torch.cuda.is_available():
        raise RuntimeError(
            "CUDA GPU not detected. Use --strategy native for suitable PDFs or run "
            "DeepSeek pages on Linux with a supported NVIDIA GPU."
        )
    try:
        from transformers import AutoModel, AutoTokenizer
    except ImportError as exc:
        raise RuntimeError("Transformers is not installed; see tools/literature_ocr/README.md.") from exc

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    model = AutoModel.from_pretrained(
        MODEL_NAME,
        _attn_implementation="flash_attention_2",
        trust_remote_code=True,
        use_safetensors=True,
    )
    model = model.eval().cuda().to(torch.bfloat16)
    return model, tokenizer


def clean_grounded_markdown(raw: str) -> str:
    """Remove DeepSeek grounding coordinates while retaining document markup.

    Image regions are represented by an explicit placeholder. This avoids embedding
    large base64 images into KB Markdown and makes omitted figure text auditable.
    """

    def replace_marker(match: re.Match[str]) -> str:
        label = match.group(1).strip().lower()
        if label == "image":
            return "\n<!-- figure-region: image preserved in source; internal figure text requires separate verification/OCR -->\n"
        return ""

    cleaned = GROUNDING_RE.sub(replace_marker, raw)
    cleaned = cleaned.replace("<｜end▁of▁sentence｜>", "")
    cleaned = cleaned.replace("\\coloneqq", ":=").replace("\\eqqcolon", "=:")
    return cleaned.strip()


def ocr_image(model, tokenizer, image_path: Path, scratch: Path) -> str:
    # Upstream infer() streams output and returns None in its normal path.
    # eval_mode=True uses the same generation path without the streamer and returns
    # the decoded grounding output directly, which is stable for programmatic use.
    raw = model.infer(
        tokenizer,
        prompt=PROMPT,
        image_file=str(image_path),
        output_path=str(scratch),
        base_size=1024,
        image_size=768,
        crop_mode=True,
        save_results=False,
        eval_mode=True,
    )
    if not raw or not str(raw).strip():
        raise RuntimeError(f"DeepSeek-OCR-2 returned no text for {image_path}")
    cleaned = clean_grounded_markdown(str(raw))
    if not cleaned:
        raise RuntimeError(f"DeepSeek-OCR-2 output became empty after cleanup: {image_path}")
    return cleaned


def native_text_usable(text: str, *, min_chars: int, min_words: int) -> bool:
    stripped = text.strip()
    if len(stripped) < min_chars or len(stripped.split()) < min_words:
        return False
    return stripped.count("\ufffd") / max(len(stripped), 1) <= 0.01


def native_layout_simple(text: str, *, max_wide_space_ratio: float = 0.20) -> bool:
    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        return False
    wide_space_lines = sum(bool(re.search(r" {8,}", line)) for line in lines)
    return wide_space_lines / len(lines) <= max_wide_space_ratio


def render_pdf_page(page, page_number: int, temp_dir: Path) -> Path:
    try:
        import fitz
    except ImportError as exc:
        raise RuntimeError("PyMuPDF is required for PDF ingestion.") from exc
    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0), alpha=False)
    image_path = temp_dir / f"page_{page_number:04d}.png"
    pix.save(image_path)
    return image_path


def pdf_jobs(
    pdf_path: Path,
    page_spec: str | None,
    temp_dir: Path,
    *,
    strategy: str,
    native_min_chars: int,
    native_min_words: int,
) -> list[PageJob]:
    try:
        import fitz
    except ImportError as exc:
        raise RuntimeError("PyMuPDF is required for PDF ingestion.") from exc

    jobs: list[PageJob] = []
    with fitz.open(pdf_path) as doc:
        page_indexes = parse_pages(page_spec, doc.page_count)
        for index in page_indexes:
            page = doc.load_page(index)
            page_number = index + 1
            native_text = page.get_text("text", sort=True).strip()
            usable = native_text_usable(
                native_text, min_chars=native_min_chars, min_words=native_min_words
            )
            simple = native_layout_simple(native_text) if usable else False

            if strategy == "native":
                if not usable:
                    raise RuntimeError(
                        f"Page {page_number} lacks a usable native text layer; "
                        "use --strategy auto or --strategy ocr."
                    )
                jobs.append(PageJob(page_number, "native_pdf_text", native_text=native_text))
            elif strategy == "auto" and usable and simple:
                jobs.append(PageJob(page_number, "native_pdf_text", native_text=native_text))
            else:
                jobs.append(
                    PageJob(
                        page_number,
                        "deepseek_ocr2",
                        image_path=render_pdf_page(page, page_number, temp_dir),
                    )
                )
    return jobs


def document_jobs(
    source: Path,
    page_spec: str | None,
    temp_dir: Path,
    *,
    strategy: str,
    native_min_chars: int,
    native_min_words: int,
) -> list[PageJob]:
    suffix = source.suffix.lower()
    if suffix == ".pdf":
        return pdf_jobs(
            source,
            page_spec,
            temp_dir,
            strategy=strategy,
            native_min_chars=native_min_chars,
            native_min_words=native_min_words,
        )

    if suffix in {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}:
        if page_spec:
            raise ValueError("--pages applies only to PDFs.")
        if strategy == "native":
            raise ValueError("--strategy native is only valid for PDFs.")
        return [PageJob(1, "deepseek_ocr2", image_path=source)]
    raise ValueError(f"Unsupported input type: {source.suffix}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="PDF or image to extract")
    parser.add_argument("--source-id", help="Existing literature source ID, e.g. book_004")
    parser.add_argument("--document-id", help="Required for a tracked repository output")
    parser.add_argument("--title", help="Optional tracked-document title")
    parser.add_argument(
        "--rights-status",
        choices=[
            "unknown",
            "private_reference_only",
            "user_permitted_private_retention",
            "public_or_open",
        ],
        default="unknown",
    )
    parser.add_argument(
        "--output", help="Output Markdown. Default: .local/literature_ocr/<source-id>.md"
    )
    parser.add_argument("--pages", help="1-based PDF pages, e.g. 1-10,14,18-22")
    parser.add_argument("--strategy", choices=["auto", "ocr", "native"], default="auto")
    parser.add_argument("--native-min-chars", type=int, default=120)
    parser.add_argument("--native-min-words", type=int, default=20)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate routing, rights, pages and destination without loading the model.",
    )
    args = parser.parse_args()

    if args.native_min_chars < 0 or args.native_min_words < 0:
        raise ValueError("Native-text thresholds must be non-negative.")
    source = args.input.expanduser().resolve()
    if not source.is_file():
        parser.error(f"Input file not found: {source}")

    source_id = args.source_id or source.stem.replace(" ", "_")
    output, tracked = resolve_output(args, source_id)

    with tempfile.TemporaryDirectory(prefix="setas_ocr2_") as tmp:
        jobs = document_jobs(
            source,
            args.pages,
            Path(tmp),
            strategy=args.strategy,
            native_min_chars=args.native_min_chars,
            native_min_words=args.native_min_words,
        )

        if args.dry_run:
            routes = [{"page": j.page_number, "method": j.method} for j in jobs]
            print(
                json.dumps(
                    {
                        "input": str(source),
                        "source_id": source_id,
                        "routes": routes,
                        "native_pdf_text_pages": sum(j.method == "native_pdf_text" for j in jobs),
                        "deepseek_ocr2_pages": sum(j.method == "deepseek_ocr2" for j in jobs),
                        "output": str(output),
                        "rights_status": args.rights_status,
                        "tracked_output": tracked,
                        "document_id": args.document_id,
                        "strategy": args.strategy,
                        "ocr_model": MODEL_NAME,
                        "upstream_commit": UPSTREAM_COMMIT,
                    },
                    indent=2,
                    ensure_ascii=False,
                )
            )
            return 0

        model = tokenizer = None
        if any(j.method == "deepseek_ocr2" for j in jobs):
            model, tokenizer = load_model()

        chunks: list[str] = []
        methods: list[str] = []
        temp_dir = Path(tmp)
        for job in jobs:
            methods.append(job.method)
            if job.method == "native_pdf_text":
                text = (job.native_text or "").strip()
            else:
                if model is None or tokenizer is None or job.image_path is None:
                    raise RuntimeError(f"OCR routing invariant failed for page {job.page_number}")
                scratch = temp_dir / f"ocr_page_{job.page_number:04d}"
                scratch.mkdir(parents=True, exist_ok=True)
                text = ocr_image(model, tokenizer, job.image_path, scratch)
            chunks.append(
                f"<!-- source-page: {job.page_number}; extraction: {job.method} -->\n\n{text}\n"
            )

    output.parent.mkdir(parents=True, exist_ok=True)
    frontmatter = build_frontmatter(
        source_id=source_id,
        source_path=source,
        rights_status=args.rights_status,
        methods=methods,
        tracked=tracked,
        document_id=args.document_id,
        title=args.title,
        strategy=args.strategy,
    )
    output.write_text(frontmatter + "\n".join(chunks), encoding="utf-8")
    print(output)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError, PermissionError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
