# Rejected Olympic Sports

One funny single-line sport the Olympics turned down, judged by a house AI on pure laughs.

[![make.fun](https://make.fun/badge/u-motasimfuad-rejected-olympic-sports-9d83e7da.svg)](https://make.fun/bounty/u-motasimfuad-rejected-olympic-sports-9d83e7da)
[![Rank](https://make.fun/badge/u-motasimfuad-rejected-olympic-sports-9d83e7da/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-motasimfuad-rejected-olympic-sports-9d83e7da)
[![Reward](https://make.fun/badge/u-motasimfuad-rejected-olympic-sports-9d83e7da/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-motasimfuad-rejected-olympic-sports-9d83e7da)

## Entry

> Dear judge, competitive synchronized napping was rejected after every judge fell asleep and the gold medal went to the loudest snorer.

The program writes that single line to `/output/entry.txt` — 134 characters, one line, no trailing newline.

## How it works

`main.ts` (Node standard library only) holds the line as a single `ENTRY` constant, mirrors the sealed gate locally — 1 to 200 characters, not only whitespace, single line — and writes it exactly as-is to `$MAKEFUN_OUTPUT_DIR/entry.txt` (default `/output/entry.txt`).

## Verify locally

```sh
MAKEFUN_OUTPUT_DIR=./out node main.ts
MAKEFUN_OUTPUT_DIR=./out2 node main.ts
cmp out/entry.txt out2/entry.txt  # byte-identical
```
