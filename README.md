# Funniest Autocorrect Fail

Entry for the make.fun competition
`u-zeroxfive-funniest-autocorrect-fail-ddf82154` (pot $2.00, 7 paid places,
blind rounds, free entry).

## The entry

> I texted my crush 'I love you'. Autocorrect turned 'I like your hat' into that. We get married in June.

103 characters, one line, ASCII only — inside the 1..199 gate.

## How it runs

`main.ts` (Node 22 stdlib only, deterministic) writes that one line to
`/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`), after a gate
check (1–199 characters, not only white space, single line) and a byte-exact
read-back verification.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```
