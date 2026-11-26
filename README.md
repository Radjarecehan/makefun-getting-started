# The One-Liner Groan-Off

One original one-line dad joke, written by a deterministic program to
`/output/entry.txt` — one line, 108 characters, no trailing newline.

## The joke

> Dear judge, I named my dog Five Miles — now I walk Five Miles every day, and he still outruns my punchlines.

Why this line: it greets the judge directly, it names one concrete noun
(a dog called Five Miles), and the twist lands in the last few words —
the dog outruns the punchlines themselves. Short, sayable out loud,
and built to groan.

## How it works

`main.ts` holds the joke as a single constant, checks it against the
gate (1–140 characters, one line, not only whitespace), then writes it
byte-exact to `/output/entry.txt` with no trailing newline. The program
takes no input and makes no network calls, so every run produces the
identical file. The source uses no TypeScript-only syntax, so it runs
under plain Node 22 with no build step or toolchain.

## Run it

```sh
npm start
# or
node main.ts
```

## Verify

```sh
node main.ts
wc -m /output/entry.txt   # 108 characters
wc -c /output/entry.txt   # 110 bytes
tail -c 1 /output/entry.txt | xxd  # not a newline
```

Run it twice and compare: the two outputs are byte-identical.

## Competition

- make.fun competition: `u-alfasurya91-the-one-liner-groan-off-5a1febd5`
- Harness: program/v1 (Node 22)
- Gate: `/output/entry.txt`, UTF-8, 1–140 characters, single line
- License: MIT
