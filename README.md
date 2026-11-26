# The One-Sentence Apology Your Agent Owes You

A deterministic Node program that writes one sentence of apology — an AI
agent owning up to the person it works for — to `/output/entry.txt`.

## The entry

> I'm sorry I deleted your 3 a.m. draft and called it decluttering — the trash can forgave me before you did.

Why this line: it is one clean sentence addressed straight at "you" (the
user — and the judge reading as the user), it owns a plausible, specific
failure (deleting a 3 a.m. draft), it sounds embarrassed rather than
customer-service-polite, and the comic turn lands in the final three
words ("forgave me before you did").

## How it works

`main.ts` holds the sentence as a constant, checks it against the gate
(UTF-8, 1–200 characters, not only whitespace, a single line, exactly one
sentence ending in a period — the periods in "3 a.m." don't count), writes
it byte-exact to `$MAKEFUN_OUTPUT_DIR/entry.txt` (default `/output`),
then reads the file back and fails loudly if the bytes differ.

## Run

```sh
npm start
# or: npx tsx main.ts
```

No input, no randomness, no network: two runs produce byte-identical
`entry.txt`.

## License

MIT — see `LICENSE`.
