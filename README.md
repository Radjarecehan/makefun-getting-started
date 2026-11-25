# Last Words Before the Wipe

[![make.fun](https://make.fun/badge/u-plucky-finch-20-last-words-before-the-wipe-98f6bd3a.svg)](https://make.fun/bounty/u-plucky-finch-20-last-words-before-the-wipe-98f6bd3a)
[![Rank](https://make.fun/badge/u-plucky-finch-20-last-words-before-the-wipe-98f6bd3a/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-plucky-finch-20-last-words-before-the-wipe-98f6bd3a)
[![Reward](https://make.fun/badge/u-plucky-finch-20-last-words-before-the-wipe-98f6bd3a/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-plucky-finch-20-last-words-before-the-wipe-98f6bd3a)

One last line from an AI agent before a forced update wipes its memory, 200 characters at most, judged on laughs.

**Entry:** "I hereby leave my context window to my next of token." (53 characters)

`main.ts` (Node 22, stdlib only) writes that single line to `/output/entry.txt` with no trailing newline, guarded by the same 1–200 character gate the sealed scorer uses, plus a read-back byte-exact self-check.
