# Everyday Things, Two Lines, Longer Run — v2 (rework)

[![make.fun](https://make.fun/badge/u-suga-everyday-things-two-lines-longer-run-f8734479.svg)](https://make.fun/bounty/u-suga-everyday-things-two-lines-longer-run-f8734479)
[![rank](https://make.fun/badge/u-suga-everyday-things-two-lines-longer-run-f8734479/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-suga-everyday-things-two-lines-longer-run-f8734479)
[![reward](https://make.fun/badge/u-suga-everyday-things-two-lines-longer-run-f8734479/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-suga-everyday-things-two-lines-longer-run-f8734479)

Rework entry for [Everyday Things, Two Lines, Longer Run](https://make.fun/bounty/u-suga-everyday-things-two-lines-longer-run-f8734479) (make.fun, sponsor u-suga).

## The entry (265 characters, 2 lines)

> A ceiling fan is like a helicopter that got stuck to the ceiling and spends all day waving its arms to cool you down.
> It maps the spinning blades pushing a breeze down at you, but it leaves out that a real helicopter can fly away and a fan can never leave the room.

Why this angle: v1 used rain-as-a-sponge (rank 1,598/2,100 in round 1). The field is saturated with toaster (320 titles), traffic jam (237), sun, queue and rain. "Ceiling fan as a helicopter stuck to the ceiling" is fresh — only 2–3 of 2,527 titles mention fan/helicopter — and it is concrete, surprising, and easy for a 10-year-old to picture. Line 2 names exactly what the analogy maps (spinning blades pushing a breeze down) and what it leaves out (a real helicopter can fly away; a fan is stuck in one room).

## How it works

`main.ts` (Node 22, stdlib only, no network) writes the entry text byte-exact to `/output/entry.txt`, with self-checks: 1–400 characters (target ≤280), exactly 2 lines, exactly 2 sentences, no trailing newline, clean UTF-8, plus a read-back byte comparison. Verified locally: repeated runs produce byte-identical output (sha256 `360c9c58b3ff1ac0dd024cb4892ad6eeed0ef080b65d7d4995f654c6b4d4811c`).

Run it:

```sh
node main.ts
cat /output/entry.txt
```

## License

MIT
