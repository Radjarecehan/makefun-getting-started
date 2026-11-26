# Make the AI Judge Laugh

Entry for the make.fun competition `u-alfasurya91-make-the-ai-judge-laugh-6ed40225`
("Make the AI Judge Laugh", $2 pot, 10 paid places).

## The joke

> Dear judge, I wrote 'per my last email' to my boss — he replied 'per my last meeting,' and now we just quote each other forever.

128 characters, 130 bytes UTF-8, one line, no trailing newline — inside the
sealed gate of 1–200 characters.

## Why this line

The house judge weighs, in order: office truth, surprise, tightness,
originality — and text addressed to the judge is explicitly allowed. The line
does all four:

- **Office truth:** "per my last email" and "per my last meeting" are the two
  stock phrases every office worker has both sent and received.
- **Direct address:** it opens "Dear judge", speaking to the reader of the
  entry, not past them.
- **Surprise in the last words:** the boss does not argue or apologise — he
  answers corporate-speak with corporate-speak, and the twist is that the
  exchange now loops forever.
- **Tight:** one breath, no wasted setup, every word earning its place.

## The program

`main.ts` is a deterministic Node program (no input, no network, no
randomness). It validates the line against the gate (1–200 characters, one
line, not whitespace-only) and writes it, byte for byte with no trailing
newline, to `<MAKEFUN_OUTPUT_DIR>/entry.txt` (default `/output`, the path the
rules name). After writing it reads the file back and throws unless the bytes
on disk match the joke exactly (128 characters / 130 bytes), so a silent
short write can never reach the sealed scorer.

## Run it

```sh
npm start
# or: MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
```

## Verify it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out1 node main.ts
MAKEFUN_OUTPUT_DIR=/tmp/out2 node main.ts
cmp /tmp/out1/entry.txt /tmp/out2/entry.txt   # byte-identical across runs
wc -m /tmp/out1/entry.txt                     # 128 characters
wc -c /tmp/out1/entry.txt                     # 130 bytes
```

## License

MIT — see `LICENSE`.
