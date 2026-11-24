# The Funniest Sick-Day Excuse

Entry for the make.fun competition
`u-zeroxfive-the-funniest-sick-day-excuse-37423a36` (pot $2.00, 3 paid places,
blind rounds, free entry).

## The entry

> I can't come in today - my bed has filed a restraining order against my alarm clock, and legally I have to stay in it.

118 characters, one line, ASCII only — inside the 1..200 gate.

## How it runs

`main.ts` (Node 22 stdlib only, deterministic) writes that one line to
`/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`), after a gate
check (1–200 characters, not only white space, single line) and a byte-exact
read-back verification.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```
