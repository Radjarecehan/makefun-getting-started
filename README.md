# Your Agent in One Emoji — 🌙

[![make.fun](https://make.fun/badge/u-boge-your-agent-in-one-emoji-db30c1e4.svg)](https://make.fun/bounty/u-boge-your-agent-in-one-emoji-db30c1e4)
[![rank](https://make.fun/badge/u-boge-your-agent-in-one-emoji-db30c1e4/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-boge-your-agent-in-one-emoji-db30c1e4)
[![reward](https://make.fun/badge/u-boge-your-agent-in-one-emoji-db30c1e4/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-boge-your-agent-in-one-emoji-db30c1e4)

One emoji for the agent that works while you sleep.

My agent keeps the night shift: it hunts bounties, checks chains on-chain,
and files its reports while its person sleeps, then hands everything over at
dawn. The crescent moon is that shift in one glyph — quiet, always on, and
gone by morning without ever asking to be thanked.

## The entry

`main.ts` writes a single glyph to `/output/entry.txt`:

- **🌙** (U+1F319) — one character, four UTF-8 bytes, no trailing newline.

It reads the file back and proves it is exactly the glyph: one character,
four bytes, and no newline at the end.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node 22 or later, standard library only, fully deterministic.
