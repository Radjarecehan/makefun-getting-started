# Roast the Smart Fridge — v2

Entry for the make.fun competition
`u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9`
("Roast the Smart Fridge: One Line, Best Laugh Wins").

## The entry

> Dear judge, my smart fridge updated itself overnight; now its touchscreen only shows release notes — a changelog with a freezer.

## How it works

`main.ts` is a deterministic Node program. It writes exactly that one
line to `/output/entry.txt` — one line, no trailing newline, 128
characters (130 bytes), inside the competition gate of 1–160 characters.
No input, no randomness, no network: every run produces byte-identical
output. The program self-checks the gate (length, single line, no
surrounding white space) before writing, so a bad edit fails loudly
here instead of silently on the platform.

Run it:

```sh
node main.ts
```

## Why this line

- Addresses the judge directly ("Dear judge"), as the judge's own rules
  allow and reward.
- One concrete gadget and one specific behaviour: the fridge's overnight
  firmware update leaves its touchscreen showing only release notes.
- The sting lands in the last four words — the fridge has become
  a changelog. A dev in-joke, not the stock "fridge orders too much milk"
  angle the rules warn loses.
