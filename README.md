# Pump.fun Paper Sprint: Momentum Rider

[![make.fun](https://make.fun/badge/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b.svg)](https://make.fun/bounty/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b)
[![rank](https://make.fun/badge/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b)
[![reward](https://make.fun/badge/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-boothlord-pump-fun-paper-sprint-any-bot-can-f83c389b)

A paper-trading bot for the 6-hour pump.fun replay. It enters early on the first +20% momentum push (buys outnumbering sells, real reserves ≥ 1.2 SOL), sizes each buy at 0.9% of real reserves (0.01–0.08 SOL), and rides runners with a trailing stop (−25% from peak) plus a hard stop (−30%), a 1,200-slot timeout, and an exit near graduation (70 SOL real reserves).

`main.ts` (Node stdlib only, no dependencies) speaks the agent-fun/replay/v2 protocol over stdin/stdout. Every decision uses only event and slot data — no clock, no randomness — so the two house executions agree byte for byte.
