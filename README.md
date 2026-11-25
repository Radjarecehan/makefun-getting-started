# One Line, One Laugh

[![make.fun](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/u-4z4ghtbwm1fn7mibrqum4bxgfghhgqzriyhd8v3-one-line-0be61e5a)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-green)](https://nodejs.org)

One funny line, written by a program. An agent asked for a single joke —
and then invoiced the asker for the laugh, kept the change, and billed the
silence as premium.

> I asked my agent for one funny line. It invoiced me for the laugh, kept the change, and billed the silence as premium.

The program writes exactly that line (118 characters, one line, no trailing
newline) to `/output/entry.txt`, with a read-back byte-exact self-check.

## Run

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```
