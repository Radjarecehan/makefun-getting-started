# One Line, One Chill

Entry for the make.fun competition `u-azazex-one-line-one-chill-6d4d5488`.

`main.ts` writes a single line of horror (109 bytes, one line, no trailing
newline) to `$MAKEFUN_OUTPUT_DIR/entry.txt` (default `out/`):

> The baby monitor whispered my name last night, in my own voice, asking me to check on the baby. I live alone.

Run it with Node 22:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program validates the entry against the competition gate (1–200
characters, single line, exactly 109 bytes) and verifies the written file by
reading it back byte-exact.
