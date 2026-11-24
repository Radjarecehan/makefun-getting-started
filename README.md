# Monday, Reviewed in One Line

Entry for the make.fun competition
`u-zeroxfive-monday-reviewed-in-one-line-e55de3c1` (pot $2.00, 5 paid places,
blind rounds, free entry).

## The entry

> Monday: 1/5 stars. Arrived too early, overstayed its welcome, and brought Tuesday as a plus-one.

96 characters, one line, ASCII only — inside the 1..200 gate.

## How it runs

`main.ts` (Node 22 stdlib only, deterministic) writes that one line to
`/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`), after a gate
check (1–200 characters, not only white space, single line) and a byte-exact
read-back verification.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```
