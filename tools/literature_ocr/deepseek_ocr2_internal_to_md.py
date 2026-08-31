#!/usr/bin/env python3
"""Internal-use entrypoint for the DeepSeek-OCR-2 literature extractor.

This wrapper deliberately separates descriptive rights metadata from repository
retention policy. It permits restricted literature to be retained in the private
Knowledge-Base for internal research without relabelling the source as open or
redistributable.

It does not grant copyright permission and must not be used as evidence that a
source may be published, redistributed, or shared outside the authorized project
team.
"""

from __future__ import annotations

import sys

import deepseek_ocr2_to_md as core


ACK_UNKNOWN_FLAG = "--acknowledge-unknown-rights"


def _pop_flag(flag: str) -> bool:
    found = False
    while flag in sys.argv:
        sys.argv.remove(flag)
        found = True
    return found


def _extract_option(name: str) -> str | None:
    prefix = f"{name}="
    for arg in sys.argv[1:]:
        if arg.startswith(prefix):
            return arg[len(prefix):]
    try:
        index = sys.argv.index(name)
    except ValueError:
        return None
    if index + 1 >= len(sys.argv):
        return None
    return sys.argv[index + 1]


def _patch_frontmatter() -> None:
    original = core.build_frontmatter

    def build_frontmatter_internal(**kwargs):
        text = original(**kwargs)
        if not kwargs.get("tracked"):
            return text

        rights_status = kwargs.get("rights_status", "unknown")
        marker = f"rights_status: {rights_status}\n"
        review_required = rights_status == "unknown"
        policy_lines = (
            "usage_scope: internal_only\n"
            "external_redistribution: prohibited_unless_separately_cleared\n"
            f"rights_review_required: {'true' if review_required else 'false'}\n"
        )
        if marker in text:
            text = text.replace(marker, marker + policy_lines, 1)
        return text

    core.build_frontmatter = build_frontmatter_internal


def main() -> int:
    acknowledge_unknown = _pop_flag(ACK_UNKNOWN_FLAG)
    rights_status = _extract_option("--rights-status") or "unknown"

    if rights_status == "unknown" and not acknowledge_unknown:
        raise PermissionError(
            "Tracked internal output with rights_status='unknown' requires "
            f"{ACK_UNKNOWN_FLAG}. This records that rights review is still pending."
        )

    original_trackable = core.TRACKABLE_RIGHTS
    original_build_frontmatter = core.build_frontmatter
    try:
        # Internal retention policy: restricted reference material may be stored in
        # the private research intake without changing its descriptive rights label.
        core.TRACKABLE_RIGHTS = original_trackable | {"private_reference_only"}
        if rights_status == "unknown":
            core.TRACKABLE_RIGHTS = core.TRACKABLE_RIGHTS | {"unknown"}
        _patch_frontmatter()
        return core.main()
    finally:
        core.TRACKABLE_RIGHTS = original_trackable
        core.build_frontmatter = original_build_frontmatter


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError, PermissionError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
