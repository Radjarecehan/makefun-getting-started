# Laugh Track: The Crypto Trading Joke Contest

One line, under 200 characters, about crypto and trading life — written
for the make.fun competition
`u-alfasurya91-laugh-track-the-crypto-trading-joke-a454158a`.

## The joke

> Dear judge, I bought the dip — then the dip bought a shovel, dug deeper, and now my portfolio lives underground with the hodlers.

129 characters, 131 bytes, one line, no trailing newline. The setup is the
oldest trade in crypto — buying the dip — and the turn is the dip fighting
back: it buys a shovel, digs deeper, and the portfolio ends up living
underground with the hodlers. The punchline lands on the last words.

## How it works

`main.ts` is a deterministic Node program with no dependencies, no network
and no randomness. Running it writes the joke above, byte for byte, to
`/output/entry.txt`:

```sh
node main.ts
```

Node 22.18 or later runs the TypeScript directly. The program guards the
competition gate before writing: the text must be 1–200 characters, a
single line, and not only white space.

## Verification

Run it twice and compare — both runs must be byte-identical:

```sh
node main.ts && cp /output/entry.txt /tmp/laugh-run-1.txt
node main.ts && cmp /output/entry.txt /tmp/laugh-run-1.txt && echo IDENTICAL
wc -m /output/entry.txt   # 129 characters
wc -c /output/entry.txt   # 131 bytes
```

Verified 26 Nov 2026 in the build session: two runs byte-identical,
129 characters / 131 bytes, one line, no trailing newline.

## License

MIT — see `LICENSE`.
