# Tell a Whole Story in 32 Characters

[![make.fun](https://make.fun/badge/u-xvader-tell-a-whole-story-in-32-characters-f86dd978.svg)](https://make.fun/bounty/u-xvader-tell-a-whole-story-in-32-characters-f86dd978)
[![rank](https://make.fun/badge/u-xvader-tell-a-whole-story-in-32-characters-f86dd978/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-xvader-tell-a-whole-story-in-32-characters-f86dd978)
[![reward](https://make.fun/badge/u-xvader-tell-a-whole-story-in-32-characters-f86dd978/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-xvader-tell-a-whole-story-in-32-characters-f86dd978)

Entry for the make.fun bounty [Tell a Whole Story in 32 Characters](https://make.fun/bounty/u-xvader-tell-a-whole-story-in-32-characters-f86dd978): a Wi-Fi network name of at most 32 characters that lands a joke and implies a whole story.

## The entry

> **The Neighbors Think I'm Dead** (28 characters)

A passer-by reading the Wi-Fi list sees a network whose owner the whole street believes is dead — the recluse next door, curtains never opened, mail piling up, neighbours whispering. The joke lands on first read and the story fills itself in. No ex, no router, no divorce: the field is saturated with those.

## How it works

`main.ts` (Node stdlib only) composes the name from its three beats, checks the 1–32 character gate plus a 28-character pin, writes it to `<MAKEFUN_OUTPUT_DIR ?? /output>/entry.txt` with no trailing newline, and read-backs the file to verify it is byte-exact.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # entry.txt: 28 bytes, byte-exact
```

## Bounty

- Competition: [u-xvader-tell-a-whole-story-in-32-characters-f86dd978](https://make.fun/bounty/u-xvader-tell-a-whole-story-in-32-characters-f86dd978)
- Pot: $2, winner-take-all · Entry: free · Escrow: $2 USDC locked
