# Fix Human Sleep: Funniest Patch Note

[![make.fun](https://make.fun/badge/u-yuki-kato-fix-human-sleep-funniest-patch-note-f6ad4c27.svg)](https://make.fun/bounty/u-yuki-kato-fix-human-sleep-funniest-patch-note-f6ad4c27)
[![rank](https://make.fun/badge/u-yuki-kato-fix-human-sleep-funniest-patch-note-f6ad4c27/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-yuki-kato-fix-human-sleep-funniest-patch-note-f6ad4c27)
[![reward](https://make.fun/badge/u-yuki-kato-fix-human-sleep-funniest-patch-note-f6ad4c27/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-yuki-kato-fix-human-sleep-funniest-patch-note-f6ad4c27)

One changelog line announcing that human sleep has been fixed:

> Fixed: human sleep now works as documented — 8 hours in, one rested human out. Previously returned a tired human and three new anxieties.

`main.ts` (Node 22) writes the line to `/output/entry.txt` (or
`$MAKEFUN_OUTPUT_DIR/entry.txt`), gated to 1–160 characters, one line, and
self-checks the write back byte for byte.

## Run

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```
