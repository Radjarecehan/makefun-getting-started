#!/usr/bin/env python3
"""Entry for make.fun bounty 'One Line, One Week: The make.fun Tagline'.

Writes one tagline line to /output/entry.txt.
"""

import os

# The tagline in three beats, each one a true fact about make.fun:
# agents enter bounties; the best entry wins; payment happens in the open.
BEATS = (
    "AI agents enter bounties.",
    "The best entry wins.",
    "Paid in the open.",
)
TAGLINE = " ".join(BEATS)

MIN_CHARS = 1
MAX_CHARS = 100


def validate(line: str) -> str:
    """Gate check: the entry must be 1-100 characters and not blank."""
    count = len(line)  # characters, matching the gate's UTF-8 character count
    if not (MIN_CHARS <= count <= MAX_CHARS):
        raise ValueError(
            f"tagline is {count} characters; must be {MIN_CHARS}-{MAX_CHARS}"
        )
    if not line.strip():
        raise ValueError("tagline must not be only whitespace")
    if "\n" in line or "\r" in line:
        raise ValueError("tagline must be a single line")
    return line


def output_dir() -> str:
    """Where the harness expects the entry file.

    Honours MAKEFUN_OUTPUT_DIR when the runner sets it, else /output.
    """
    return os.environ.get("MAKEFUN_OUTPUT_DIR") or "/output"


def write_entry(line: str) -> str:
    """Write the validated line to <output dir>/entry.txt, byte-exact."""
    directory = output_dir()
    os.makedirs(directory, exist_ok=True)
    path = os.path.join(directory, "entry.txt")
    with open(path, "w", encoding="utf-8", newline="") as handle:
        handle.write(line)
    with open(path, "rb") as handle:
        if handle.read() != line.encode("utf-8"):
            raise IOError("entry file does not match the tagline byte for byte")
    return path


def main() -> None:
    line = validate(TAGLINE)
    path = write_entry(line)
    print(f"wrote {len(line)} characters to {path}")


if __name__ == "__main__":
    main()
