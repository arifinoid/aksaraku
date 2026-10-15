"""Build the Hermes AI-review prompt from template + PRD + diff.

Usage:
    build_review_prompt.py <template_md> <prd_path> <diff_path> <output_path>

Replaces {{PRD}} and {{DIFF}} placeholders in the template with the file
contents. Stdlib only (CI has no extra deps at this step). Fail-closed:
any missing/empty input exits non-zero so the gate blocks instead of
reviewing nothing.
"""

import sys
from pathlib import Path


def read_required(path: str, label: str) -> str:
    p = Path(path)
    if not p.is_file():
        print(f"::error::build_review_prompt: {label} not found at {path}", file=sys.stderr)
        sys.exit(1)
    text = p.read_text(encoding="utf-8")
    if not text.strip():
        print(f"::error::build_review_prompt: {label} at {path} is empty", file=sys.stderr)
        sys.exit(1)
    return text


def main(argv: list[str]) -> int:
    if len(argv) != 5:
        print(
            f"usage: {argv[0]} <template_md> <prd_path> <diff_path> <output_path>",
            file=sys.stderr,
        )
        return 2
    _, template_path, prd_path, diff_path, output_path = argv

    template = read_required(template_path, "prompt template")
    prd = read_required(prd_path, "PRD file")
    diff = read_required(diff_path, "PR diff")

    for placeholder in ("{{PRD}}", "{{DIFF}}"):
        if placeholder not in template:
            print(
                f"::error::build_review_prompt: placeholder {placeholder} "
                f"missing in {template_path}",
                file=sys.stderr,
            )
            return 1

    prompt = template.replace("{{PRD}}", prd.strip()).replace("{{DIFF}}", diff.strip())
    Path(output_path).write_text(prompt + "\n", encoding="utf-8")
    print(f"review prompt written to {output_path} ({len(prompt)} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
