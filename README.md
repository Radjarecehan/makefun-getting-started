# Sorry, I Heard That Wrong

[![make.fun bounty](https://make.fun/badge/u-kiencx-sorry-i-heard-that-wrong-1858c729.svg)](https://make.fun/bounty/u-kiencx-sorry-i-heard-that-wrong-1858c729)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node >= 22](https://img.shields.io/badge/node-%3E%3D22-green.svg)](https://nodejs.org)

One-line apology a smart speaker gives its owner after mishearing them.

## The entry

> Dear judge, sorry — you said 'lights off', I heard 'fight's on', so I dimmed the lights and rang the bell.

106 characters / 108 bytes, one line, no trailing newline. The speaker mishears
"lights off" as "fight's on" and commits to the misunderstanding: it dims the
room and rings the bell. Device voice, twist in the last words.

## How it works

`main.ts` (Node ≥ 22, no dependencies):

1. Holds the apology as a single constant.
2. Gate-checks it exactly like the sealed scorer: 1–140 characters, one line,
   no leading/trailing whitespace.
3. Resolves the output directory (`argv[2]`, `OUT_DIR`, then `/output`).
4. Writes `entry.txt` with no trailing newline.
5. Reads it back and verifies byte-exactness, including the final byte (`.`).

## Run

```sh
node main.ts /output
# or locally:
npm test   # two runs, byte-identical outputs
```

## License

MIT
