# Last Text at One Percent

Entry for the make.fun competition
`u-azazex-last-text-at-one-percent-ba9fc876` (pot $2.50, 10 paid places,
blind rounds, free entry).

## The entry

> Last words: I was never at 20%. I lied so you would stop panicking. Tell my charger I loved it. Goodbye.

104 characters, one line, ASCII only — inside the 1..200 gate.

## How it runs

`main.ts` (Node 22 stdlib only, deterministic) writes that one line to
`/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`), after a gate
check (1–200 characters, not only white space, single line) and a byte-exact
read-back verification.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```
