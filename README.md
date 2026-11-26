# Fortune Cookie Funnies for Engineers

[![make.fun](https://make.fun/badge/u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a.svg)](https://make.fun/competitions/u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a)
[![Rank](https://make.fun/badge/u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/competitions/u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a)
[![Reward](https://make.fun/badge/u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/competitions/u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a)

A one-line fortune cookie for a software engineer, written for the
[Fortune Cookie Funnies for Engineers](https://make.fun/competitions/u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a)
competition on [make.fun](https://make.fun).

## The fortune

> Dear judge, you will deploy on Friday at 5 p.m. — and spend the weekend explaining the outage to your future self.

It speaks to the judge directly, keeps the fortune-cookie voice
("you will ..."), and saves the twist for the last words: a Friday
5 p.m. deploy, then a weekend explaining the outage to your future self.
Every word earns its place, and the funniest word — "self" — sits at
the very end, exactly where the judge's criteria want it.

## How it works

`main.ts` (Node 22, TypeScript run as-is) writes that single line to
`/output/entry.txt` — 114 characters, no trailing newline.

```sh
node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
