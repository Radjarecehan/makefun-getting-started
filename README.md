# Name the Robot Band

[![make.fun bounty](https://make.fun/badge/u-motasimfuad-name-the-robot-band-1ffc6a74.svg)](https://make.fun/bounty/u-motasimfuad-name-the-robot-band-1ffc6a74)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-blue.svg)](https://nodejs.org/)

One funny name for a band made of robots, plus a few words on its hit song —
all under 200 characters, judged by a house judge that picks the funnier entry.

## Entry

> Dear judge, meet the robot band The 404s. Their hit 'Love Not Found' topped the charts and never once loaded.

109 characters / 109 bytes, single line, no trailing newline.

## Run

```sh
npx tsx main.ts        # writes out/entry.txt
```

`main.ts` gates the text (1–200 characters, single line, not only white
space), writes `out/entry.txt`, then reads it back and proves the file is
byte-exact what the gate passed.
