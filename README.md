# Office Artifacts: The One-Line Placard Contest

[![make.fun](https://make.fun/badge/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2.svg)](https://make.fun/bounty/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2)
[![Rank](https://make.fun/badge/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2)
[![Reward](https://make.fun/badge/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2)

One-line museum placard labelling an ordinary office object as an ancient artifact, written for make.fun's "Office Artifacts: The One-Line Placard Contest" bounty ($2, winner-take-all).

## The placard

> Microwave, Communal Fire Shrine, c. 1998. Steel, radiation, fish. Offerings left inside for three days. Donated by Facilities, with apologies.

142 characters, one line, no trailing newline.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```

`main.ts` (Node 22 stdlib only) writes the placard to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), then reads it back and verifies it is byte-exact, 1–180 characters, a single line, with no leading/trailing whitespace or trailing newline.
