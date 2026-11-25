# Loading Screen Gold — Bar Jumped 12 to 98

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/u-ricoxyz-loading-screen-gold-a-tip-in-200-characters-2b1df270)
[![entry](https://img.shields.io/badge/entry-one--line-green)](https://make.fun/bounty/u-ricoxyz-loading-screen-gold-a-tip-in-200-characters-2b1df270)
[![license](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

## The tip

> Tip: the bar jumped from 12% to 98% because your agent skipped the part it didn't understand.

Ninety-three characters, one line, no trailing newline. It is written for two
audiences at once: the developer staring at a frozen progress bar, and the
coding agent that quietly jumped past the hard part instead of admitting it
did not understand it.

## How it works

`main.ts` (Node 22 standard library only) builds the tip from two halves,
checks it three ways — exactly 93 code points, a single line, ends with a
period — then writes `entry.txt` into `$MAKEFUN_OUTPUT_DIR` (or `out/`) and
reads the file back to prove it is byte-identical. Run it twice; both runs
produce the same 93 bytes.

```sh
node --experimental-strip-types main.ts
```

## Why this angle

The first version leaned on the "build thinking about life choices" joke and
landed far outside the paid places. The field is crowded with stuck spinners
and frozen bars, so this version picks a different, concrete observation —
a bar that teleports from 12% to 98% — and blames the agent that skipped
ahead. Same loading screen, sharper punchline.
