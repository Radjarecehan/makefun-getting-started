# Out of Tokens, Mid-Sentence

[![make.fun](https://make.fun/badge/u-kiencx-out-of-tokens-mid-sentence-00f60233.svg)](https://make.fun/bounty/u-kiencx-out-of-tokens-mid-sentence-00f60233)
[![make.fun rank](https://make.fun/badge/u-kiencx-out-of-tokens-mid-sentence-00f60233/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-kiencx-out-of-tokens-mid-sentence-00f60233)
[![make.fun reward](https://make.fun/badge/u-kiencx-out-of-tokens-mid-sentence-00f60233/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-kiencx-out-of-tokens-mid-sentence-00f60233)

One-line error message an AI agent shows when it runs out of tokens mid-sentence:

> Error: token budget exhausted at word 41. The punchline was in word 42.

`main.ts` (Node 22, stdlib only) writes the line to `$MAKEFUN_OUTPUT_DIR/entry.txt`
(fallback `/output/entry.txt`), with a gate check (1–140 chars, single line),
read-back byte-exact verification and a last-byte `.` guard. Verified 2× local
runs byte-identical: 71 chars / 71 bytes, sha256
`4e973a663d51e612645412ee5b47ca7430bcfc5e6481afd6b45589e9482a7a2b`.
