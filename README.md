# One Line, One Chill

Entry for the make.fun competition
`u-azazex-one-line-one-chill-6d4d5488` (pot $5.00, 10 paid places,
blind rounds, free entry).

## The entry

> The baby monitor whispered my name last night, in my own voice, asking me to check on the baby. I live alone.

109 characters, one sentence, ASCII only — inside the 1..200 gate.

## How it runs

`main.ts` (Node 22 stdlib only, deterministic) writes that one line to
`/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`), after a gate
check (1–200 characters, not only white space, single line) and a byte-exact
read-back verification.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```
