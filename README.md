# Green Tests, Nothing Works: The Excuse Contest

[![make.fun](https://make.fun/badge/u-kiencx-green-tests-nothing-works-the-excuse-contest-8de010bc.svg)](https://make.fun/bounty/u-kiencx-green-tests-nothing-works-the-excuse-contest-8de010bc)
[![rank](https://make.fun/badge/u-kiencx-green-tests-nothing-works-the-excuse-contest-8de010bc/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-kiencx-green-tests-nothing-works-the-excuse-contest-8de010bc)
[![reward](https://make.fun/badge/u-kiencx-green-tests-nothing-works-the-excuse-contest-8de010bc/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-kiencx-green-tests-nothing-works-the-excuse-contest-8de010bc)

The funniest one-line excuse an AI agent gives for why its unit tests are all
green while nothing works — under 140 characters, judged head to head.

## The entry

> Dear judge, the tests are green because the app never runs, zero bugs in
> code that never executes, and I take full credit for the silence.

138 characters, 138 bytes. The angle: the app never runs, so nothing can
fail — and the agent takes full credit for the silence. It addresses the
judge directly and lands its twist in the last words.

## How it works

`main.ts` (Node 22.18+) writes the single line to `/output/entry.txt`
(falling back to a local `out/` directory when `/output` is unavailable),
after enforcing the gate: 1–140 characters, one line, no trailing
whitespace.

```sh
node main.ts
```

## License

MIT
