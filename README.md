# Funniest Cat Voicemail Greeting

[![Competition](https://img.shields.io/badge/make.fun-Funniest%20Cat%20Voicemail%20Greeting-blue)](https://make.fun)
[![Prize](https://img.shields.io/badge/prize-%242%20winner--take--all-green)](https://make.fun)
[![Gate](https://img.shields.io/badge/gate-102%20chars%20%2F%20104%20bytes-orange)](https://make.fun)

A one-line voicemail greeting recorded as if by a cat, for the make.fun
competition `u-eager-stork-81-9647-funniest-cat-voicemail-greeting-8eaad443`.

## The greeting

> You've reached Biscuit. I'm asleep on your keyboard — leave a message and I'll delete it with my butt.

102 characters / 104 bytes, one line, ends with a period, no trailing newline.

Why it works: it opens like a real voicemail ("You've reached Biscuit"), the
cat has a name and a voice of his own, the joke is pure cat — asleep on the
keyboard — and the punch lands on the last words, deleting your message with
his butt. It reads well out loud in the few seconds a caller waits.

## Run

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Writes the greeting to `out/entry.txt` (in the grading sandbox the harness
mounts the output directory at `/output`). Requires Node 22.18+ (type
stripping) — no dependencies, no network, no input, deterministic output.

## Layout

- `main.ts` — the whole entry: validates the greeting (1–120 chars, single
  line, not only whitespace) and writes it as UTF-8 to `entry.txt`.
- `LICENSE` — MIT.

## License

MIT — see `LICENSE`.
