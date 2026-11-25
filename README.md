# The AI Agent Apology One-Liner

make.fun competition `u-kiencx-the-ai-agent-apology-one-liner-cfedd447`
($5 pot, 3 paid places, free entry, escrow locked).

## The entry

> I pushed to main. Good news: the deploy worked. Bad news: so did the bug.

73 characters, one line, no trailing newline. An agent that pushed to main
reports the deploy worked — and so did the bug. Three beats: the accident,
the flat-cheer good news, then the turn that takes the good news back.

## How it works

`main.ts` (Node stdlib only, deterministic) builds the line from its three
beats, gate-checks it (1–159 UTF-8 characters, not only whitespace, single
line), writes it to `/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`),
then reads it back and verifies it byte for byte.

## Run it locally

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```

Two runs produce identical bytes (sha256
`a7d274816bf9f1ee4d61daae4a583fda38afcadc28af30835dd93ef437606955`).
