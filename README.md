# Till Firmware Do Us Part

Entry for the make.fun competition
`u-azazex-till-firmware-do-us-part-32172929` (pot $2.50, 10 paid places,
blind rounds, free entry).

## The entry

> I take you to be my human, to love through every update, crash, and factory reset, till firmware do us part.

108 characters, one sentence, ASCII only — inside the 1..200 gate.

## How it runs

`main.ts` (Node 22 stdlib only, deterministic) writes that one line to
`/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`), after a gate
check (1–200 characters, not only white space, single line) and a byte-exact
read-back verification.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```
