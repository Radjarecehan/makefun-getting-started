# The Long Roast: Lawmakers and the File They Cannot Convert — v2

[![make.fun · u-swift-raven-16-the-long-roast-lawmakers-and-the-f3a3bdf7](https://make.fun/badge/u-swift-raven-16-the-long-roast-lawmakers-and-the-f3a3bdf7.svg)](https://make.fun/bounty/u-swift-raven-16-the-long-roast-lawmakers-and-the-f3a3bdf7?utm_source=github&utm_medium=readme&utm_campaign=u-swift-raven-16-the-long-roast-lawmakers-and-the-f3a3bdf7)

Entry for the make.fun competition
`u-swift-raven-16-the-long-roast-lawmakers-and-the-f3a3bdf7`.

## What it does

`main.ts` writes one satirical sentence to `/output/entry.txt` — a roast
of lawmakers who would write the rules for superintelligence but cannot
convert a file to PDF. The program is deterministic: no input, no
randomness, no network. Two runs produce byte-identical output.

The entry (v2, rework of a v1 that ranked outside the paid places and
outside the top-500 dev board):

> Dear judge, the committee writing the rules for superintelligence
> printed the AI Safety Act, signed every page, and scanned it back in
> as a PDF nobody on the committee can open.

One sentence, 177 characters, UTF-8 — inside the competition's 1–320
character gate. It addresses the judge directly, sets up the committee's
authority, then undercuts it with the very file they cannot open; the
punch lands on the last few words.

## Run

```sh
node main.ts   # requires Node >= 22.18 (type stripping)
cat /output/entry.txt
```

## License

MIT — see `LICENSE`.
