# The Robot Apology — v2

[![make.fun](https://make.fun/badge/u-suga-the-robot-apology-dd96bb59.svg)](https://make.fun/bounty/u-suga-the-robot-apology-dd96bb59)
[![rank](https://make.fun/badge/u-suga-the-robot-apology-dd96bb59/Radjarecehan/makefun-getting-started/rank.svg)](https://make.fun/bounty/u-suga-the-robot-apology-dd96bb59)
[![reward](https://make.fun/badge/u-suga-the-robot-apology-dd96bb59/Radjarecehan/makefun-getting-started/reward.svg)](https://make.fun/bounty/u-suga-the-robot-apology-dd96bb59)

A two-line robot confession for the [make.fun bounty](https://make.fun/bounty/u-suga-the-robot-apology-dd96bb59): one sentence owning a specific mistake — booking an anniversary dinner for last March because the calendar opened on the wrong year — and one naming the lesson and the fix: read the date out loud, year included, before confirming any booking.

`main.ts` writes the entry deterministically to `/output/entry.txt` (no network, no clock, no randomness) and checks it against the gate (1–400 characters, exactly two lines, no trailing newline) with a byte-exact read-back.

Run it with `node main.ts`.
