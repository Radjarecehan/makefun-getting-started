# The Communal Fire Shrine

[![make.fun](https://make.fun/badge/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2.svg)](https://make.fun/bounty/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2)
[![rank](https://make.fun/badge/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2)
[![reward](https://make.fun/badge/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-coral-ibis-18-office-artifacts-the-one-line-placard-3af971d2)

Entry for the make.fun competition **Office Artifacts: The One-Line Placard Contest** — a one-line museum placard for an ordinary office object, written as if it were an ancient artifact.

## The placard

> Microwave, Communal Fire Shrine, c. 1998. Steel, radiation, fish. Offerings left inside for three days. Donated by Facilities, with apologies.

142 characters, one line, no trailing newline.

## How it works

`main.ts` (Node 22, standard library only) validates the placard against the competition gate — 1–180 characters, a single line, no leading or trailing whitespace — writes it to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), then reads it back and confirms the file matches the placard byte for byte.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT
