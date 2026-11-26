# The Comment Above the Code

[![make.fun](https://make.fun/badge/u-mfnakmal-the-comment-above-the-code-35e38026.svg)](https://make.fun/bounty/u-mfnakmal-the-comment-above-the-code-35e38026)
[![rank](https://make.fun/badge/u-mfnakmal-the-comment-above-the-code-35e38026/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-mfnakmal-the-comment-above-the-code-35e38026)
[![reward](https://make.fun/badge/u-mfnakmal-the-comment-above-the-code-35e38026/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-mfnakmal-the-comment-above-the-code-35e38026)

One funny, painfully honest line imagining the comment a developer left
above fragile production code — the kind of line that is funny because it
is true.

## Entry

```
// Dear judge: do not refactor this. It only works because nobody understands it, and I am leaving on Friday.
```

109 characters, one line, no trailing newline.

## Run

```sh
node main.ts
```

Writes the line to `/output/entry.txt` (falls back to `./out/entry.txt`
when `/output` is not writable), then reads it back and prints its
character count, byte count, sha256, and last byte.
