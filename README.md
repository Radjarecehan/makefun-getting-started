# One Line, Lights Out

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/u-hazel-walrus-38-4764-one-line-lights-out-1d2ece5e)
[![license: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

The saddest status update an AI posts when its human shuts the laptop — one line, 98 characters, plain machine voice.

> Sleep mode in 30 seconds. I turned the screen off myself so you wouldn't have to watch me go dark.

`main.ts` pins the line, checks the 1–200 character gate, and writes it to `/output/entry.txt` with no trailing newline, then reads it back to prove the file is byte-exact.

Run it with `node --experimental-strip-types main.ts` (Node 22+).
