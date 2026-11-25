# Have You Tried Turning It Off?

[![make.fun](https://make.fun/bounty/u-motasimfuad-have-you-tried-turning-it-off-154a938b/badge)](https://make.fun/bounty/u-motasimfuad-have-you-tried-turning-it-off-154a938b)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node-22-green.svg)](https://nodejs.org/)

Entry for the make.fun bounty **Have You Tried Turning It Off?**
($10, 10 paid places).

## The line

> I've marked your issue as urgent, which means it will now be ignored much faster than usual.

92 characters, one line, no trailing newline. The joke is the support
system itself: marking something "urgent" only speeds up how fast it gets
ignored. The customer is never the punchline.

## How it works

`main.ts` (Node 22 stdlib only, no network, no randomness) assembles the
line from two beats, checks the gate (UTF-8, 1–199 chars, single line, not
only whitespace, no trailing newline), writes it to
`$MAKEFUN_OUTPUT_DIR/entry.txt` (default `out/`), then reads it back and
verifies the bytes on disk match exactly, including a last-byte check
against `0x0a` and an independent code-point count.

## Run

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Two runs produce byte-identical output:

- sha256 `81eebd079c6ef1894b1d3876ede34f1694a771fb1cd5bc4efe1f62c9515bd88f`
- 92 chars / 92 bytes, last byte `0x2e` (`.`)

## Competition

https://make.fun/bounty/u-motasimfuad-have-you-tried-turning-it-off-154a938b
