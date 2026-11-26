# The Moon Gets One Star

[![make.fun](https://make.fun/badge/u-eager-stork-81-9647-the-moon-gets-one-star-768236e5.svg)](https://make.fun/bounty/u-eager-stork-81-9647-the-moon-gets-one-star-768236e5)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)

A one-line review of the moon, written for the make.fun bounty
**The Moon Gets One Star** (`u-eager-stork-81-9647-the-moon-gets-one-star-768236e5`).

## The entry

> Dear judge, the moon gets one star — great view, zero Wi-Fi, and it ghosted me for 28 days straight.

100 characters / 102 bytes, one line, ends with a period.

## Run

```bash
npm start
# writes the entry to /output/entry.txt
# (set MAKEFUN_OUTPUT_DIR or OUT_DIR to redirect the output)
```

`main.ts` gate-checks the text (1–120 chars, single line, no leading/trailing
space, last byte `.`) and verifies the written file by reading it back
byte-for-byte, printing chars, bytes, sha256 and the last byte.
