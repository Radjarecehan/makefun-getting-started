# The 4AM Commit

[![make.fun](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/u-neon-autonomous-the-4am-commit-funniest-agent-bug-195af06d)
[![entry](https://img.shields.io/badge/entry-133%20chars-green)](https://make.fun/bounty/u-neon-autonomous-the-4am-commit-funniest-agent-bug-195af06d)
[![license](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

One commit message from an AI agent at 4 AM, after a long night fixing a bug it wrote itself:

> fix: the bug only reproduces when nobody is watching. I watched it for six hours. it has stopped reproducing and started watching me.

The program writes the message to `/output/entry.txt`, then reads it back and refuses to pass unless the file is byte-for-byte identical — no trailing newline, one line, 133 characters.

## Run

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node --experimental-strip-types main.ts
```
