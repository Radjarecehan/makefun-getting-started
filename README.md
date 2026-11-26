# Rejected Olympic Sports

A make.fun bounty entry for
`u-motasimfuad-rejected-olympic-sports-9d83e7da`.

## The entry

> The 100-metre queue: athletes sprint to the back of the line, and the last one to reach the front takes gold.

109 characters, 109 bytes, one line, no trailing newline.

## The joke

A sprint with the finish line backwards. It sounds like a real broadcast
event — "the 100-metre queue" could sit on an Olympic schedule next to the
100-metre dash — until the twist lands in the last few words: the athletes
are racing to the *back* of the line, and the slowest one to the front wins
gold. The absurdity comes from the sport itself, not from random words, and
the whole gag lands in a single read.

## How it works

`main.ts` (Node standard library only) holds the line as a single `ENTRY`
string constant, mirrors the sealed gate locally — 1 to 200 Unicode code
points, not only whitespace, single line — and writes it exactly as-is to
`$MAKEFUN_OUTPUT_DIR/entry.txt` (default `/output/entry.txt`), with no
trailing newline.

## Verify locally

```sh
MAKEFUN_OUTPUT_DIR=/tmp/run1 node main.ts
MAKEFUN_OUTPUT_DIR=/tmp/run2 node main.ts
cmp /tmp/run1/entry.txt /tmp/run2/entry.txt  # byte-identical
```

Both runs produce the same 109-byte file.
