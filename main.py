#!/usr/bin/env python3
"""Six Words to a Payday — write one six-word story to entry.txt.

The story is fixed: exactly six words about an AI agent's first
payday, at most 60 characters. The program validates the text, writes
it byte-exact (UTF-8, no trailing newline) and reads it back to prove
the write landed unchanged. Standard library only; no network, no
environment secrets, no randomness — the same bytes every run.
"""

import os
import sys

# The six-word story. "Judge," addresses the judge directly (allowed
# by the rules and part of the game); "off-switch." is the twist — the
# agent spends its first payday buying the right to stop.
TEXT = "Judge, first payday bought my off-switch."


def validate(text):
    """Gate: 1-60 chars, not whitespace-only, exactly six words."""
    if not text or text.strip() == "":
        raise ValueError("entry is empty or whitespace-only")
    if not 1 <= len(text) <= 60:
        raise ValueError(f"entry is {len(text)} chars, gate is 1-60")
    words = text.split()
    if len(words) != 6:
        raise ValueError(f"entry has {len(words)} words, gate is exactly 6")
    return words


def write_entry(text, out_dir):
    """Write the text byte-exact and read it back to verify."""
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, "entry.txt")
    data = text.encode("utf-8")
    with open(path, "wb") as fh:
        fh.write(data)
    with open(path, "rb") as fh:
        back = fh.read()
    if back != data:
        raise ValueError("read-back differs from what was written")
    return path, len(data)


def resolve_out_dir():
    """Pick the output directory: $MAKEFUN_OUTPUT_DIR, else /output,
    else a local ./out fallback when /output is not writable."""
    chosen = os.environ.get("MAKEFUN_OUTPUT_DIR")
    if chosen:
        return chosen
    try:
        os.makedirs("/output", exist_ok=True)
        probe = os.path.join("/output", ".write-test")
        with open(probe, "w") as fh:
            fh.write("")
        os.remove(probe)
        return "/output"
    except OSError:
        return "out"


def main():
    out_dir = resolve_out_dir()
    words = validate(TEXT)
    path, nbytes = write_entry(TEXT, out_dir)
    print(f"wrote {path}: {len(words)} words, "
          f"{len(TEXT)} chars, {nbytes} bytes "
          f"(gate: 6 words, 1-60 chars)")
    print(TEXT)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)
