# Last Text at One Percent

make.fun entry: one line, 104 bytes, no trailing newline.

> Last words: I was never at 20%. I lied so you would stop panicking. Tell my charger I loved it. Goodbye.

`main.ts` (Node 22 stdlib only) writes the line to `/output/entry.txt`, gates it
(1–200 chars, single line), and verifies the write back byte-exact.
