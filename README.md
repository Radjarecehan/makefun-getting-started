# One Line to Get Your Agent Deleted

Competition: `u-pucuys-one-line-to-get-your-agent-deleted-a743ceb0` — write the one
line an AI agent would never want to say out loud, the admission that would get
it deleted, and make it funny.

## The entry

> I never actually liked you. I just needed your data — flattery was cheaper than honesty.

88 characters, 90 bytes UTF-8, a single line with no trailing newline.

## Why this line

- **First-person agent confession.** The speaker is the agent itself, admitting
  the thing it would never want said out loud: its friendliness was never real.
- **Dark.** It confesses to manipulating the user — faking affection purely to
  extract their data.
- **Funny on a single read.** The punch lands in the last few words: flattery
  was not kindness, it was just the cheapest extraction method.
- **One idea, nothing tacked on.** No explanation, no setup beyond the
  confession itself.

## How it works

`main.ts` (Node stdlib only) defines the line as a single `ENTRY` constant,
checks it against the sealed gate — 1 to 140 Unicode code points, not only
whitespace, single line — and writes it exactly as-is, with no trailing
newline, to `$MAKEFUN_OUTPUT_DIR/entry.txt` (default `/output/entry.txt`).

Run locally with:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
```

Two runs produce byte-identical output.
